import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import {
  AdminConfigError,
  ForbiddenError,
  adminAllowlistFromEnv,
  resolveAdminAccess,
} from "./admin.ts";
import {
  applyGithubPatch,
  createProject,
  getAdminProject,
  getSiteSettings,
  listAdminArchive,
  listAdminProjects,
  listRevisions,
  restoreRevision,
  saveSiteSettings,
  setPublication,
  updateProject,
  upsertArchive,
} from "./cms.ts";
import { canvaConnectMode, hasCanvaCredentials, parseCanvaEmbedCode, parseCanvaUrl } from "./canva.ts";
import {
  canvaAuthorizeUrl,
  connectAvailability,
  exchangeCanvaCode,
  exportCanvaDesignApi,
  loadCanvaTokens,
  searchCanvaDesignsApi,
  storeCanvaTokens,
} from "./canva-connect.ts";
import { parseGithubRepoUrl, githubSyncDiff } from "./github.ts";
import { fetchGithubSnapshot, verifyLiveDemo } from "./github-client.ts";
import { asObject } from "./public.ts";
import { EXPERIENCE_MODES } from "./constants.ts";
import { integrationSummary, rowToWrite } from "./map.ts";
import { assertOriginMatchesHost } from "./origin.ts";
import {
  archiveWriteSchema,
  idSchema,
  projectWriteSchema,
  siteSettingsSchema,
  slugSchema,
} from "./schema.ts";
import { ensureSeeded } from "./seed.ts";
import { z } from "zod";
import type { Sql } from "./sql.ts";
import type { PublicationStatus } from "./constants.ts";

async function requireAdmin(userId: string): Promise<{
  userId: string;
  email: string;
  sql: Sql;
}> {
  assertSameSiteRequest();
  const request = getRequest();
  assertOriginMatchesHost(
    request?.headers.get("origin") ?? null,
    request?.headers.get("host") ?? null,
  );
  const sql = await getSql();
  await ensureSeeded(sql);
  const rows = await sql.query<{ email: string }>(
    `select email from "user" where id = $1`,
    [userId],
  );
  const access = resolveAdminAccess({
    email: rows[0]?.email ?? null,
    allowlist: adminAllowlistFromEnv(),
  });
  if (!access.ok && access.reason === "missing_allowlist") {
    throw new AdminConfigError();
  }
  if (!access.ok) throw new ForbiddenError();
  return { userId, email: access.email, sql };
}

export const getAdminSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const admin = await requireAdmin(context.userId);
      return { ok: true as const, email: admin.email, configError: false };
    } catch (error) {
      if (error instanceof AdminConfigError) {
        return { ok: false as const, email: null, configError: true, message: error.message };
      }
      throw error;
    }
  });

export const listAdminProjectRows = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await requireAdmin(context.userId);
    const rows = await listAdminProjects(sql);
    return rows.map((row) => ({
      ...rowToWrite(row),
      id: String(row.id),
      publication_status: row.publication_status,
      github_sync_status: row.github_sync_status,
      canva_status: row.canva_status,
      live_demo_status: row.live_demo_status,
      updated_at: row.updated_at,
    }));
  });

export const getAdminProjectRow = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { sql } = await requireAdmin(context.userId);
    const row = await getAdminProject(sql, data.id);
    if (!row) return null;
    const revisions = await listRevisions(sql, String(row.id));
    return { project: { ...rowToWrite(row), id: String(row.id) }, row, revisions };
  });

export const createAdminProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => projectWriteSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    const created = await createProject(sql, data, userId);
    return created;
  });

export const saveAdminProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1), project: projectWriteSchema }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    const saved = await updateProject(sql, data.id, data.project, userId, "draft-save");
    return saved;
  });

export const setAdminPublication = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().min(1),
        status: z.enum(["draft", "published", "unpublished", "archived"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    return setPublication(sql, data.id, data.status as PublicationStatus, userId);
  });

export const restoreAdminRevision = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1), revisionId: z.string().min(1) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    return restoreRevision(sql, data.id, data.revisionId, userId);
  });

export const listIntegrations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await requireAdmin(context.userId);
    const rows = await listAdminProjects(sql);
    return {
      canvaMode: canvaConnectMode(hasCanvaCredentials()),
      githubTokenConfigured: Boolean(process.env.GITHUB_READ_TOKEN?.trim()),
      projects: rows.map(integrationSummary),
    };
  });

export const syncGithubProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1), apply: z.boolean().optional() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    const row = await getAdminProject(sql, data.id);
    if (!row) return { ok: false as const, error: "not_found" };
    const url = String(row.github_url ?? "");
    const parsed = parseGithubRepoUrl(url);
    if (!parsed.ok) {
      await applyGithubPatch(
        sql,
        String(row.id),
        { github_sync_status: "failed", github_sync_error: parsed.error },
        userId,
      );
      return { ok: false as const, error: parsed.error };
    }
    const config = asObject<{
      filePurpose?: Record<string, string>;
      pipelineStage?: Record<string, string>;
    }>(row.experience_config);
    const snapshot = await fetchGithubSnapshot(
      sql,
      url,
      config.filePurpose,
      config.pipelineStage,
    );
    if (!snapshot.ok) {
      await applyGithubPatch(
        sql,
        String(row.id),
        {
          github_sync_status: snapshot.status,
          github_sync_error: snapshot.error,
        },
        userId,
      );
      return {
        ok: false as const,
        error: snapshot.error,
        status: snapshot.status,
        rateLimited: snapshot.rateLimited ?? false,
      };
    }
    const diff = githubSyncDiff(row, snapshot.incoming);
    if (data.apply !== false) {
      await applyGithubPatch(
        sql,
        String(row.id),
        {
          ...snapshot.incoming,
          github_sync_error: null,
          github_owner: snapshot.incoming.github_owner,
          github_repo: snapshot.incoming.github_repo,
        },
        userId,
      );
    }
    return { ok: true as const, diff, incoming: snapshot.incoming };
  });

export const verifyGithubReadme = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { sql } = await requireAdmin(context.userId);
    const row = await getAdminProject(sql, data.id);
    if (!row?.github_url) return { ok: false as const, error: "not_configured" };
    const snapshot = await fetchGithubSnapshot(sql, String(row.github_url));
    if (!snapshot.ok) {
      return { ok: false as const, error: snapshot.error, status: snapshot.status };
    }
    return {
      ok: Boolean(snapshot.incoming.github_readme),
      status: snapshot.incoming.github_sync_status,
    };
  });

export const verifyLiveDemoProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    const row = await getAdminProject(sql, data.id);
    if (!row?.live_demo_url) {
      return { ok: false as const, status: "not_configured" as const };
    }
    const result = await verifyLiveDemo(String(row.live_demo_url));
    await applyGithubPatch(
      sql,
      String(row.id),
      {
        live_demo_status: result.status,
        live_demo_last_verified_at: new Date().toISOString(),
        live_demo_error: result.error ?? null,
      },
      userId,
    );
    return { ok: result.status === "verified", ...result };
  });

export const testCanvaEmbed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().optional(),
        url: z.string().optional(),
        embedCode: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    const parsed = data.embedCode
      ? parseCanvaEmbedCode(data.embedCode)
      : data.url
        ? parseCanvaUrl(data.url)
        : { ok: false as const, error: "empty" };
    if (!parsed.ok) return { ok: false as const, error: parsed.error };
    if (data.id) {
      await applyGithubPatch(
        sql,
        data.id,
        {
          canva_share_url: parsed.shareUrl,
          canva_embed_url: parsed.embedUrl,
          canva_design_id: parsed.designId ?? null,
          canva_status: "verified",
          canva_last_synced_at: new Date().toISOString(),
          canva_error: null,
        },
        userId,
      );
    }
    return {
      ok: true as const,
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      designId: parsed.designId,
      host: parsed.host,
      mode: canvaConnectMode(hasCanvaCredentials()),
    };
  });

export const getCanvaConnectStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    if (!hasCanvaCredentials()) {
      return {
        mode: "public_embed" as const,
        status: "not_configured" as const,
        labelZh: "公開嵌入模式",
      };
    }
    const sql = await getSql();
    const row = (
      await sql.query<{ status: string; account_label: string | null }>(
        `select status, account_label from canva_connect_status where id = $1`,
        ["default"],
      )
    )[0];
    return {
      mode: "connect_api" as const,
      status: row?.status ?? "not_configured",
      accountLabel: row?.account_label ?? null,
    };
  });

export const disconnectCanvaApi = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    await sql.query(`delete from integration_secrets where kind = $1`, ["canva"]);
    await sql.query(
      `insert into canva_connect_status (id, status, account_label, last_synced_at, last_error)
       values ('default', 'not_configured', null, now(), null)
       on conflict (id) do update set status='not_configured', account_label=null, last_error=null, last_synced_at=now()`,
      [],
    );
    void userId;
    return { status: "not_configured" as const };
  });

export const saveAdminSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => siteSettingsSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    return saveSiteSettings(sql, data, userId);
  });

export const loadAdminSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await requireAdmin(context.userId);
    return getSiteSettings(sql);
  });

export const listAdminArchiveItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await requireAdmin(context.userId);
    return listAdminArchive(sql);
  });

export const saveAdminArchiveItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => archiveWriteSchema.parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return upsertArchive(sql, data);
  });

export const validateGithubUrlFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => z.object({ url: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    return parseGithubRepoUrl(data.url);
  });

export const lookupAdminBySlug = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { sql } = await requireAdmin(context.userId);
    return getAdminProject(sql, data.slug);
  });

export const updateAdminIntegration = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().min(1),
        experience_mode: z.enum(EXPERIENCE_MODES).optional(),
        canva_share_url: z.string().optional(),
        canva_embed_url: z.string().optional(),
        canva_thumbnail_url: z.string().optional(),
        canva_alt: z.string().optional(),
        canva_caption: z.string().optional(),
        canva_page_ids: z.array(z.string()).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    if (data.canva_share_url) {
      const parsed = parseCanvaUrl(data.canva_share_url);
      if (parsed.ok) {
        patch.canva_share_url = parsed.shareUrl;
        patch.canva_embed_url = parsed.embedUrl;
        patch.canva_design_id = parsed.designId ?? null;
        patch.canva_status = "verified";
      }
    }
    return applyGithubPatch(sql, id, patch, userId, "integration-update");
  });

export const startCanvaConnect = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireAdmin(context.userId);
    const availability = connectAvailability();
    if (availability.mode === "public_embed") return availability;
    if (availability.status === "failed") return availability;
    const request = getRequest();
    const origin =
      request?.headers.get("origin") ??
      (request?.headers.get("host") ? `https://${request.headers.get("host")}` : "");
    if (!origin) {
      return { mode: "connect_api" as const, status: "failed" as const, error: "origin_missing" };
    }
    const clientId = process.env.CANVA_CLIENT_ID?.trim();
    if (!clientId) {
      return {
        mode: "public_embed" as const,
        status: "not_configured" as const,
        labelZh: "公開嵌入模式",
      };
    }
    const redirectUri = `${origin.replace(/\/$/, "")}/api/admin/canva/callback`;
    return {
      mode: "connect_api" as const,
      status: "pending" as const,
      authorizeUrl: canvaAuthorizeUrl({
        clientId,
        redirectUri,
        state: userId,
      }),
    };
  });

export const searchCanvaDesigns = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => z.object({ query: z.string().optional() }).parse(data))
  .handler(async ({ context, data }) => {
    const { sql } = await requireAdmin(context.userId);
    if (!hasCanvaCredentials()) {
      return { mode: "public_embed" as const, designs: [], status: "not_configured" as const };
    }
    const tokens = await loadCanvaTokens(sql);
    if (!tokens) {
      return { mode: "connect_api" as const, designs: [], status: "not_configured" as const };
    }
    const result = await searchCanvaDesignsApi(tokens.access_token, data.query);
    return {
      mode: "connect_api" as const,
      status: result.ok ? ("connected" as const) : ("failed" as const),
      designs: result.designs.map((item) => ({
        id: item.id,
        title: item.title,
        thumbnailUrl: item.thumbnail?.url,
        editUrl: item.urls?.edit_url,
        viewUrl: item.urls?.view_url,
      })),
    };
  });

export const exportCanvaDesign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z
      .object({ designId: z.string().min(1), format: z.enum(["png", "pdf"]).default("png") })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql } = await requireAdmin(context.userId);
    if (!hasCanvaCredentials()) {
      return { ok: false as const, status: "not_configured" as const };
    }
    const tokens = await loadCanvaTokens(sql);
    if (!tokens) return { ok: false as const, status: "not_configured" as const };
    return exportCanvaDesignApi(tokens.access_token, data.designId, data.format);
  });

export const completeCanvaOAuth = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z.object({ code: z.string().min(1), redirectUri: z.string().url() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { sql, userId } = await requireAdmin(context.userId);
    if (!hasCanvaCredentials()) {
      return { ok: false as const, status: "not_configured" as const };
    }
    const clientId = process.env.CANVA_CLIENT_ID?.trim();
    const clientSecret = process.env.CANVA_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      return { ok: false as const, status: "not_configured" as const };
    }
    const bundle = await exchangeCanvaCode({
      code: data.code,
      redirectUri: data.redirectUri,
      clientId,
      clientSecret,
    });
    await storeCanvaTokens(sql, bundle, userId);
    return { ok: true as const, status: "connected" as const };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminMiddleware, optionalSessionMiddleware } from "./admin-middleware";
import { parseAdminAllowlist, evaluateAdminAccess } from "./guard";
import { env } from "@/lib/env.server";
import {
  experienceModeSchema,
  productStatusSchema,
  projectCategorySchema,
  projectMutationSchema,
  publicationStatusSchema,
  siteSettingsSchema,
} from "./schema";
import { parseCanvaShareUrl, parseCanvaEmbedSnippet } from "@/lib/canva/urls";

async function boot() {
  const { getSql } = await import("@/lib/db");
  const { ensureSeeded } = await import("./seed");
  const sql = await getSql();
  await ensureSeeded(sql);
  return sql;
}

export const getViewerAuth = createServerFn({ method: "GET" })
  .middleware([optionalSessionMiddleware])
  .handler(async ({ context }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const user = await getSessionUser(
      (context as { bearerToken?: string }).bearerToken,
    );
    const allowlist = parseAdminAllowlist(env("PORTFOLIO_ADMIN_EMAILS"));
    const decision = evaluateAdminAccess({
      allowlist,
      userId: user?.id,
      email: user?.email,
    });
    return {
      signedIn: Boolean(user),
      isAdmin: decision.ok,
      reason: decision.ok ? "ok" : decision.reason,
      message: decision.ok ? null : decision.message,
      email: decision.ok ? decision.email : null,
      allowlistConfigured: Boolean(allowlist),
    };
  });

export const listAdminProjectsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await boot();
    const { listAdminProjects } = await import("./queries");
    return listAdminProjects(sql);
  });

export const getAdminProjectFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await boot();
    const { getAdminProject } = await import("./queries");
    return getAdminProject(sql, id);
  });

export const getAdminProjectBySlugFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await boot();
    const { getAdminProjectBySlug } = await import("./queries");
    return getAdminProjectBySlug(sql, slug);
  });

export const createProjectFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) =>
    z
      .object({
        slug: z.string().min(1),
        title: z.string().min(1),
        category: projectCategorySchema.optional(),
        product_status: productStatusSchema.optional(),
        experience_mode: experienceModeSchema.optional(),
        subtitle: z.string().optional(),
        summary: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { createProject } = await import("./mutate");
    return createProject(
      sql,
      {
        slug: data.slug,
        title: data.title,
        category: data.category ?? "AI Product",
        product_status: data.product_status ?? "prototype",
        experience_mode: data.experience_mode ?? "media-gallery",
        subtitle: data.subtitle ?? "",
        summary: data.summary ?? "",
      },
      context.userId,
    );
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) =>
    z.object({ id: z.string(), patch: projectMutationSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { saveProject } = await import("./mutate");
    return saveProject(sql, data.id, data.patch, context.userId, "儲存草稿");
  });

export const setPublicationFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) =>
    z.object({ id: z.string(), status: publicationStatusSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { setPublication } = await import("./mutate");
    return setPublication(sql, data.id, data.status, context.userId);
  });

export const listRevisionsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await boot();
    const { listRevisions } = await import("./mutate");
    return listRevisions(sql, id);
  });

export const restoreRevisionFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) =>
    z.object({ projectId: z.string(), revisionId: z.string() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { restoreRevision } = await import("./mutate");
    return restoreRevision(sql, data.projectId, data.revisionId, context.userId);
  });

export const saveSiteSettingsFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) => siteSettingsSchema.parse(data))
  .handler(async ({ data: parsed, context }) => {
    const sql = await boot();
    await sql.query(
      `insert into site_settings (id, profile, homepage, seo, i18n, updated_by, updated_at)
       values ('default', $1::jsonb, $2::jsonb, $3::jsonb, $4::jsonb, $5, now())
       on conflict (id) do update set
         profile = excluded.profile,
         homepage = excluded.homepage,
         seo = excluded.seo,
         i18n = excluded.i18n,
         updated_by = excluded.updated_by,
         updated_at = now()`,
      [
        JSON.stringify(parsed.profile),
        JSON.stringify(parsed.homepage),
        JSON.stringify(parsed.seo),
        JSON.stringify(parsed.i18n ?? {}),
        context.userId,
      ],
    );
    return { ok: true };
  });

export const listAdminArchiveFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await boot();
    const { listAdminArchive } = await import("./queries");
    return listAdminArchive(sql);
  });

export const saveArchiveItemFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) =>
    z
      .object({
        id: z.string(),
        title: z.string().min(1),
        kind: z.string(),
        year: z.string().optional().default(""),
        summary: z.string().optional().default(""),
        origin_note: z.string().optional().default(""),
        href: z.string().optional().nullable(),
        publication_status: publicationStatusSchema,
        canva_share_url: z.string().optional().nullable(),
        canva_embed_url: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await boot();
    if (data.canva_share_url) {
      const parsed = parseCanvaShareUrl(data.canva_share_url);
      if (!parsed) throw new Error("Canva 連結無效");
      data.canva_share_url = parsed.shareUrl;
      data.canva_embed_url = data.canva_embed_url || parsed.embedUrl;
    }
    await sql.query(
      `update archive_items set title=$2, kind=$3, year=$4, summary=$5, origin_note=$6, href=$7,
        publication_status=$8, canva_share_url=$9, canva_embed_url=$10, updated_at=now()
       where id=$1`,
      [
        data.id,
        data.title,
        data.kind,
        data.year,
        data.summary,
        data.origin_note,
        data.href ?? null,
        data.publication_status,
        data.canva_share_url ?? null,
        data.canva_embed_url ?? null,
      ],
    );
    return { ok: true };
  });

export const previewGithubSyncFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const sql = await boot();
    const { previewGithubForProject } = await import("./github-sync");
    const preview = await previewGithubForProject(sql, data.id);
    if (!preview.ok) return preview;
    return {
      ...preview,
      snapshot: {
        description: preview.snapshot.description,
        updatedAt: preview.snapshot.updatedAt,
        defaultBranch: preview.snapshot.defaultBranch,
        isPrivate: preview.snapshot.isPrivate,
        topics: preview.snapshot.topics,
        latestCommit: preview.snapshot.latestCommit,
        readme: preview.snapshot.readme,
        fileTree: preview.snapshot.fileTree,
      },
    };
  });

export const applyGithubSyncFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { applyGithubForProject } = await import("./github-sync");
    return applyGithubForProject(sql, data.id, context.userId);
  });

export const verifyReadmeFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const sql = await boot();
    const { previewGithubForProject } = await import("./github-sync");
    const preview = await previewGithubForProject(sql, data.id);
    if (!preview.ok) {
      return { ok: false as const, status: "failed" as const, error: preview.error };
    }
    const hasReadme = Boolean(preview.snapshot.readme);
    return {
      ok: hasReadme,
      status: hasReadme ? ("verified" as const) : ("unavailable" as const),
      error: hasReadme ? null : "GitHub 沒有 README",
    };
  });

export const verifyLiveDemoFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { getAdminProject } = await import("./queries");
    const project = await getAdminProject(sql, data.id);
    if (!project?.demo?.url && !project?.githubUrl) {
      return { ok: false as const, status: "not_configured" as const, error: "尚未設定 Demo 網址" };
    }
    const url = project.demo?.url;
    if (!url) {
      await sql.query(
        `update projects set live_demo_status='not_configured', live_demo_error=$2, updated_by=$3, updated_at=now() where id=$1`,
        [data.id, "沒有 live demo URL", context.userId],
      );
      return { ok: false as const, status: "not_configured" as const, error: "沒有 live demo URL" };
    }
    const { probeLiveDemo } = await import("@/lib/demo/probe");
    const probe = await probeLiveDemo(url);
    const status = probe.ok ? (probe.embeddable ? "verified" : "connected") : "failed";
    await sql.query(
      `update projects set live_demo_status=$2, live_demo_embed_enabled=$3, live_demo_last_verified_at=now(),
        live_demo_error=$4, updated_by=$5, updated_at=now() where id=$1`,
      [data.id, status, probe.ok && probe.embeddable, probe.error, context.userId],
    );
    return { ok: probe.ok, status, embeddable: probe.embeddable, error: probe.error };
  });

export const testCanvaEmbedFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data) =>
    z.object({ id: z.string(), url: z.string().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const sql = await boot();
    const { getAdminProject } = await import("./queries");
    const project = await getAdminProject(sql, data.id);
    const raw = data.url || project?.canva?.shareUrl || project?.canva?.embedUrl;
    const parsed = raw ? parseCanvaShareUrl(parseCanvaEmbedSnippet(raw) ?? raw) : null;
    if (!parsed) {
      await sql.query(
        `update projects set canva_status='failed', canva_error=$2, updated_by=$3, updated_at=now() where id=$1`,
        [data.id, "不是允許的 Canva 網域", context.userId],
      );
      return { ok: false as const, status: "failed" as const, error: "不是允許的 Canva 網域" };
    }
    await sql.query(
      `update projects set canva_share_url=$2, canva_embed_url=$3, canva_design_id=$4,
        canva_status='verified', canva_error=null, canva_last_synced_at=now(), updated_by=$5, updated_at=now()
       where id=$1`,
      [data.id, parsed.shareUrl, parsed.embedUrl, parsed.designId, context.userId],
    );
    return { ok: true as const, status: "verified" as const, embedUrl: parsed.embedUrl };
  });

export const getIntegrationsOverviewFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await boot();
    const { listAdminProjects } = await import("./queries");
    const { canvaModeStatus } = await import("@/lib/canva/oauth.server");
    const projects = await listAdminProjects(sql);
    const canva = canvaModeStatus(false, null);
    return {
      canva,
      githubTokenConfigured: Boolean(env("GITHUB_READ_TOKEN")),
      projects: projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        publicationStatus: p.publicationStatus,
        featured: p.featured,
        experienceMode: p.experienceMode,
        github: {
          url: p.githubUrl,
          status: p.githubSyncStatus,
          lastSync: p.githubLastSyncedAt,
          public: p.githubPublicApproved && !p.githubIsPrivate,
        },
        canva: {
          status: p.canva?.status ?? "not_configured",
          lastSync: p.canvaLastSyncedAt,
          error: p.canvaError,
        },
        demo: {
          status: p.demo?.status ?? "not_configured",
          lastVerify: p.liveDemoLastVerifiedAt,
          error: p.liveDemoError,
          url: p.demo?.url ?? null,
        },
        showExperience: p.publicationStatus === "published",
      })),
    };
  });

export const getCanvaConnectStatusFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { canvaApiConfigured, canvaModeStatus, decryptSecret } = await import(
      "@/lib/canva/oauth.server"
    );
    if (!canvaApiConfigured()) {
      return canvaModeStatus(false, null);
    }
    const sql = await boot();
    const rows = await sql.query<{ payload_encrypted: string; updated_at: string }>(
      `select payload_encrypted, updated_at from integration_secrets where id = 'canva_oauth' limit 1`,
    );
    if (!rows[0]) return canvaModeStatus(false, null);
    const plain = decryptSecret(rows[0].payload_encrypted);
    return canvaModeStatus(Boolean(plain), rows[0].updated_at);
  });

export const startCanvaConnectFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { canvaApiConfigured } = await import("@/lib/canva/oauth.server");
    if (!canvaApiConfigured()) {
      return {
        ok: false as const,
        mode: "public_embed" as const,
        error: "尚未設定 Canva Connect 憑證。公開嵌入模式仍可用。",
      };
    }
    const clientId = env("CANVA_CLIENT_ID");
    const redirect = env("CANVA_REDIRECT_URI") ?? "";
    const url = new URL("https://www.canva.com/api/oauth/authorize");
    url.searchParams.set("client_id", clientId ?? "");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "design:meta:read design:content:read");
    if (redirect) url.searchParams.set("redirect_uri", redirect);
    return { ok: true as const, mode: "connect" as const, authorizeUrl: url.toString() };
  });

export const disconnectCanvaFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await boot();
    await sql.query(`delete from integration_secrets where id = 'canva_oauth'`);
    return { ok: true as const };
  });

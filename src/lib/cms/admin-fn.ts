import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { archiveInputSchema, projectInputSchema, projectPatchSchema, siteSettingsSchema } from "./schema";
import { AdminConfigError, ForbiddenError, ValidationError } from "./errors";
import { parseGithubUrl } from "@/lib/github/parse";
import { parseCanvaDesign, isAllowedCanvaUrl, extractCanvaUrl } from "@/lib/canva/parse";

type Authed = { userId: string; bearerToken?: string };

async function adminSql(context: Authed) {
  const { requireAdminActor } = await import("./guard.server");
  const actor = await requireAdminActor(context.userId, context.bearerToken);
  const { getSql } = await import("@/lib/db");
  const { ensureSeed } = await import("./seed");
  const sql = await getSql();
  await ensureSeed(sql);
  return { sql, actor };
}

function asAuthed(context: { userId: string }): Authed {
  return context as Authed;
}

export const getAdminSessionFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { actor } = await adminSql(asAuthed(context));
      return { ok: true as const, email: actor.email, userId: actor.userId };
    } catch (err) {
      if (err instanceof AdminConfigError) {
        return { ok: false as const, reason: "config" as const, message: err.message };
      }
      if (err instanceof ForbiddenError) {
        return { ok: false as const, reason: "forbidden" as const, message: err.message };
      }
      throw err;
    }
  });

export const listAdminProjectsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { listAdminProjects } = await import("./store");
    return listAdminProjects(sql);
  });

export const getAdminProjectFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { getAdminProject } = await import("./store");
    return getAdminProject(sql, data.id);
  });

export const createProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectInputSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { createProjectRecord } = await import("./store");
    return createProjectRecord(sql, data, actor.userId);
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectPatchSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { saveProjectRecord } = await import("./store");
    const { id, ...patch } = data;
    return saveProjectRecord(sql, id, patch, actor.userId, "save");
  });

export const saveDraftFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectPatchSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { saveProjectRecord } = await import("./store");
    const { id, ...patch } = data;
    return saveProjectRecord(
      sql,
      id,
      { ...patch, publication_status: "draft" },
      actor.userId,
      "draft",
    );
  });

const idInput = z.object({ id: z.string().min(1) });

export const publishProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { setPublication } = await import("./store");
    return setPublication(sql, data.id, "published", actor.userId);
  });

export const unpublishProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { setPublication } = await import("./store");
    return setPublication(sql, data.id, "draft", actor.userId);
  });

export const archiveProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { setPublication } = await import("./store");
    return setPublication(sql, data.id, "archived", actor.userId);
  });

export const restoreProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { setPublication } = await import("./store");
    return setPublication(sql, data.id, "draft", actor.userId);
  });

export const listRevisionsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { listRevisions } = await import("./store");
    return listRevisions(sql, data.id);
  });

export const restoreRevisionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string(), revisionId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { restoreRevision } = await import("./store");
    return restoreRevision(sql, data.id, data.revisionId, actor.userId);
  });

export const previewGithubFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string(), url: z.string().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { getAdminProject, githubIncomingFromFetch } = await import("./store");
    const project = await getAdminProject(sql, data.id);
    const url = data.url ?? project.github_url;
    if (!url || !parseGithubUrl(url)) {
      throw new ValidationError("GitHub 網址無效。");
    }
    const result = await fetchGithub(sql, url);
    return {
      current: {
        github_url: project.github_url,
        github_owner: project.github_owner,
        github_repo: project.github_repo,
        github_branch: project.github_branch,
        github_sync_status: project.github_sync_status,
        github_last_synced_at: project.github_last_synced_at,
        github_metadata: project.github_metadata,
        github_readme: project.github_readme,
        github_languages: project.github_languages,
        github_topics: project.github_topics,
        github_latest_commit: project.github_latest_commit,
      },
      incoming: githubIncomingFromFetch(result, url),
      fetch: {
        ok: result.ok,
        status: result.status,
        error: result.error,
        errorCode: result.errorCode,
        readmeError: result.readmeError,
      },
    };
  });

export const applyGithubFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string(), url: z.string().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { getAdminProject, applyGithubSync } = await import("./store");
    const project = await getAdminProject(sql, data.id);
    const url = data.url ?? project.github_url;
    if (!url || !parseGithubUrl(url)) throw new ValidationError("GitHub 網址無效。");
    const result = await fetchGithub(sql, url);
    return applyGithubSync(sql, data.id, result, actor.userId);
  });

export const verifyReadmeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { getAdminProject } = await import("./store");
    const project = await getAdminProject(sql, data.id);
    if (!project.github_url) {
      return { status: "not_configured" as const, error: "尚未設定 GitHub 網址。" };
    }
    const result = await fetchGithub(sql, project.github_url);
    if (result.readmeError) {
      return { status: "failed" as const, error: result.readmeError };
    }
    if (!result.ok) {
      return { status: result.status, error: result.error, errorCode: result.errorCode };
    }
    return { status: "verified" as const, preview: result.readme?.slice(0, 280) ?? "" };
  });

export const verifyDemoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().optional(), url: z.string().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { verifyDemoUrl } = await import("@/lib/demo/verify");
    let url = data.url ?? "";
    if (data.id && !url) {
      const { getAdminProject } = await import("./store");
      url = (await getAdminProject(sql, data.id)).live_demo_url ?? "";
    }
    const result = await verifyDemoUrl(url);
    if (data.id) {
      await sql.query(
        `update projects set live_demo_status = $2, live_demo_embed_enabled = $3,
          live_demo_error = $4, live_demo_last_verified_at = now(), updated_by = $5, updated_at = now()
         where id = $1`,
        [data.id, result.status, result.embedEnabled, result.error ?? null, actor.userId],
      );
    }
    return result;
  });

export const testCanvaEmbedFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ id: z.string().optional(), url: z.string().optional() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    let raw = data.url ?? "";
    if (data.id && !raw) {
      const { getAdminProject } = await import("./store");
      const project = await getAdminProject(sql, data.id);
      raw = project.canva_embed_url || project.canva_share_url || "";
    }
    const extracted = extractCanvaUrl(raw);
    if (!extracted || !isAllowedCanvaUrl(extracted)) {
      const payload = {
        status: "failed" as const,
        error: "只接受 Canva 允許網域的分享／嵌入網址，不會執行後台貼上的 HTML。",
      };
      if (data.id) {
        await sql.query(
          `update projects set canva_status = 'failed', canva_error = $2, updated_by = $3, updated_at = now() where id = $1`,
          [data.id, payload.error, actor.userId],
        );
      }
      return payload;
    }
    const parsed = parseCanvaDesign(extracted);
    if (data.id && parsed) {
      await sql.query(
        `update projects set canva_share_url = $2, canva_embed_url = $3, canva_design_id = $4,
          canva_status = 'verified', canva_error = null, canva_last_synced_at = now(),
          updated_by = $5, updated_at = now() where id = $1`,
        [data.id, parsed.shareUrl, parsed.embedUrl, parsed.designId, actor.userId],
      );
    }
    return {
      status: "verified" as const,
      shareUrl: parsed?.shareUrl ?? extracted,
      embedUrl: parsed?.embedUrl ?? extracted,
      designId: parsed?.designId ?? null,
    };
  });

export const listIntegrationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { listAdminProjects } = await import("./store");
    const { canvaConnectMode, disconnectedCanvaStatus } = await import("@/lib/canva/oauth.server");
    const projects = await listAdminProjects(sql);
    return {
      canva: disconnectedCanvaStatus(),
      canvaMode: canvaConnectMode(),
      githubTokenConfigured: Boolean(process.env.GITHUB_READ_TOKEN?.trim()),
      items: projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        publicationStatus: project.publication_status,
        featured: project.featured,
        github: {
          url: project.github_url,
          status: project.github_sync_status,
          lastSyncedAt: project.github_last_synced_at,
          error: project.github_metadata?.syncError,
        },
        canva: {
          url: project.canva_share_url,
          status: project.canva_status,
          lastSyncedAt: project.canva_last_synced_at,
          error: project.canva_error,
        },
        demo: {
          url: project.live_demo_url,
          status: project.live_demo_status,
          lastVerifiedAt: project.live_demo_last_verified_at,
          error: project.live_demo_error,
          embedEnabled: project.live_demo_embed_enabled,
        },
        experienceMode: project.experience_mode,
        public: project.publication_status === "published",
        showExperience: Boolean(project.experience_mode),
      })),
    };
  });

export const getSettingsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { getSiteSettings } = await import("./store");
    return getSiteSettings(sql);
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => siteSettingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { saveSiteSettings } = await import("./store");
    return saveSiteSettings(sql, data, actor.userId);
  });

export const listAdminArchiveFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { listAdminArchive } = await import("./store");
    return listAdminArchive(sql);
  });

export const saveArchiveFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => archiveInputSchema.extend({ id: z.string().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { upsertArchive } = await import("./store");
    const id = await upsertArchive(sql, data, actor.userId);
    return { id };
  });

export const getCanvaConnectFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await adminSql(asAuthed(context));
    const { disconnectedCanvaStatus, canvaCredentialsPresent } = await import("@/lib/canva/oauth.server");
    return {
      ...disconnectedCanvaStatus(),
      canSearch: canvaCredentialsPresent(),
      canEditInApp: false,
    };
  });

export const connectCanvaFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await adminSql(asAuthed(context));
    const { canvaCredentialsPresent, disconnectedCanvaStatus } = await import("@/lib/canva/oauth.server");
    if (!canvaCredentialsPresent()) {
      return disconnectedCanvaStatus();
    }
    return {
      mode: "oauth" as const,
      connected: false,
      status: "pending" as const,
      message: "Canva Connect 授權網址尚未完成部署設定（redirect URI）。不會假裝已經連上。",
    };
  });

export const hydrateGithubFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { hydratePendingGithub } = await import("./hydrate");
    return hydratePendingGithub(sql, { force: true });
  });

export const previewDraftFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { getAdminProjectBySlug, toPreviewProject } = await import("./store");
    const admin = await getAdminProjectBySlug(sql, data.slug);
    return {
      publicationStatus: admin.publication_status,
      project: toPreviewProject(admin),
    };
  });

async function fetchGithub(sql: import("@/lib/db").Sql, url: string) {
  const { fetchPublicRepo } = await import("@/lib/github/client.server");
  const { githubClientOptions } = await import("@/lib/github/sql-cache");
  return fetchPublicRepo(url, githubClientOptions(sql));
}

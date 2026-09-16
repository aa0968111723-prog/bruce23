import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { archiveInputSchema, projectInputSchema, projectPatchSchema, siteSettingsSchema } from "./schema";
import { ValidationError } from "./errors";
import { parseGithubUrl } from "@/lib/github/parse";
import { runAdminSql, type AuthedAdmin } from "./admin-runtime.server";
import {
  handleCreateProject,
  handleGetAdminSession,
  handleGetSettings,
  handleListIntegrations,
  handlePreviewDraft,
  handleSaveDraft,
  handleSaveProject,
  handleSaveSettings,
  handleSetPublication,
  handleTestCanvaEmbed,
} from "./admin-handlers.server";

async function adminSql(context: AuthedAdmin) {
  return runAdminSql(context);
}

function asAuthed(context: { userId: string }): AuthedAdmin {
  return context as AuthedAdmin;
}

export const getAdminSessionFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => handleGetAdminSession(asAuthed(context)));

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
  .handler(async ({ context, data }) => handleCreateProject(asAuthed(context), data));

export const saveProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectPatchSchema.parse(input))
  .handler(async ({ context, data }) => handleSaveProject(asAuthed(context), data));

export const saveDraftFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectPatchSchema.parse(input))
  .handler(async ({ context, data }) => handleSaveDraft(asAuthed(context), data));

const idInput = z.object({ id: z.string().min(1) });

export const publishProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => handleSetPublication(asAuthed(context), data.id, "published"));

export const unpublishProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => handleSetPublication(asAuthed(context), data.id, "draft"));

export const archiveProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => handleSetPublication(asAuthed(context), data.id, "archived"));

export const restoreProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => idInput.parse(input))
  .handler(async ({ context, data }) => handleSetPublication(asAuthed(context), data.id, "draft"));

export const listRevisionsFn = createServerFn({ method: "POST" })
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
      const { persistDemoVerify } = await import("./store");
      return persistDemoVerify(sql, data.id, actor.userId, {
        url,
        status: result.status,
        embedEnabled: result.embedEnabled,
        error: result.error ?? null,
      });
    }
    return result;
  });

export const testCanvaEmbedFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ id: z.string().optional(), url: z.string().optional() }).parse(input),
  )
  .handler(async ({ context, data }) => handleTestCanvaEmbed(asAuthed(context), data));

export const listIntegrationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => handleListIntegrations(asAuthed(context)));

export type AdminIntegrationsPayload = Awaited<ReturnType<typeof handleListIntegrations>>;
export type IntegrationWorkItem = AdminIntegrationsPayload["items"][number];

export const getSettingsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => handleGetSettings(asAuthed(context)));

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => siteSettingsSchema.parse(input))
  .handler(async ({ context, data }) => handleSaveSettings(asAuthed(context), data));

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
    const { sql } = await adminSql(asAuthed(context));
    const { loadCanvaConnectionStatus } = await import("@/lib/canva/oauth.server");
    const status = await loadCanvaConnectionStatus(sql);
    return { ...status, canEditInApp: false };
  });

export const connectCanvaFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { startCanvaOAuth, canvaCredentialsPresent, disconnectedCanvaStatus } = await import(
      "@/lib/canva/oauth.server"
    );
    if (!canvaCredentialsPresent()) {
      return { ok: false as const, authorizeUrl: null, ...disconnectedCanvaStatus() };
    }
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const origin = request ? new URL(request.url).origin : null;
    const result = await startCanvaOAuth(sql, actor.userId, origin);
    return {
      ok: result.ok,
      authorizeUrl: result.ok ? result.authorizeUrl : null,
      ...result.status,
    };
  });

export const disconnectCanvaFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { disconnectCanva } = await import("@/lib/canva/oauth.server");
    return disconnectCanva(sql);
  });

export const searchCanvaDesignsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        query: z.string().max(150).optional(),
        continuation: z.string().max(500).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { searchCanvaDesigns } = await import("@/lib/canva/connect.server");
    return searchCanvaDesigns(sql, data.query ?? "", data.continuation);
  });

export const getCanvaDesignFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ designId: z.string().min(6).max(80) }).parse(input))
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { getCanvaDesign } = await import("@/lib/canva/connect.server");
    return getCanvaDesign(sql, data.designId);
  });

export const exportCanvaDesignFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ designId: z.string().min(6).max(80), format: z.enum(["png", "pdf"]) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { sql } = await adminSql(asAuthed(context));
    const { exportCanvaDesign } = await import("@/lib/canva/connect.server");
    return exportCanvaDesign(sql, data);
  });

export const applyCanvaDesignFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        projectId: z.string().min(1),
        designId: z.string().min(6).max(80),
        publicShareUrl: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { sql, actor } = await adminSql(asAuthed(context));
    const { applyCanvaDesignToProject } = await import("@/lib/canva/connect.server");
    return applyCanvaDesignToProject(sql, { ...data, actor: actor.userId });
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
  .handler(async ({ context, data }) => handlePreviewDraft(asAuthed(context), data.slug));

async function fetchGithub(sql: import("@/lib/db").Sql, url: string) {
  const { fetchPublicRepo } = await import("@/lib/github/client.server");
  const { githubClientOptions } = await import("@/lib/github/sql-cache");
  return fetchPublicRepo(url, githubClientOptions(sql));
}

import { persistCanvaEmbedTest, runAdminSql, type AuthedAdmin } from "./admin-runtime.server.ts";
import { AdminConfigError, ForbiddenError } from "./errors.ts";
import type { ProjectInput, ProjectPatch, SiteSettingsInput } from "./schema.ts";

export async function handleGetAdminSession(context: AuthedAdmin) {
  try {
    const { actor } = await runAdminSql(context);
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
}

export async function handleCreateProject(context: AuthedAdmin, data: ProjectInput) {
  const { sql, actor } = await runAdminSql(context);
  const { createProjectRecord } = await import("./store.ts");
  return createProjectRecord(sql, data, actor.userId);
}

export async function handleSaveProject(context: AuthedAdmin, data: ProjectPatch) {
  const { sql, actor } = await runAdminSql(context);
  const { saveProjectRecord } = await import("./store.ts");
  const { id, ...patch } = data;
  return saveProjectRecord(sql, id, patch, actor.userId, "save");
}

export async function handleSaveDraft(context: AuthedAdmin, data: ProjectPatch) {
  const { sql, actor } = await runAdminSql(context);
  const { saveProjectRecord } = await import("./store.ts");
  const { id, ...patch } = data;
  return saveProjectRecord(
    sql,
    id,
    { ...patch, publication_status: "draft" },
    actor.userId,
    "draft",
  );
}

export async function handleSetPublication(
  context: AuthedAdmin,
  id: string,
  status: "published" | "draft" | "archived",
) {
  const { sql, actor } = await runAdminSql(context);
  const { setPublication } = await import("./store.ts");
  return setPublication(sql, id, status, actor.userId);
}

export async function handlePreviewDraft(context: AuthedAdmin, slug: string) {
  const { sql } = await runAdminSql(context);
  const { getAdminProjectBySlug, toPreviewProject } = await import("./store.ts");
  const admin = await getAdminProjectBySlug(sql, slug);
  return {
    publicationStatus: admin.publication_status,
    project: toPreviewProject(admin),
  };
}

export async function handleTestCanvaEmbed(
  context: AuthedAdmin,
  data: { id?: string; url?: string },
) {
  const { sql, actor } = await runAdminSql(context);
  return persistCanvaEmbedTest(sql, actor.userId, data);
}

export async function handleSaveSettings(context: AuthedAdmin, data: SiteSettingsInput) {
  const { sql, actor } = await runAdminSql(context);
  const { saveSiteSettings } = await import("./store.ts");
  return saveSiteSettings(sql, data, actor.userId);
}

export async function handleGetSettings(context: AuthedAdmin) {
  const { sql } = await runAdminSql(context);
  const { getSiteSettings } = await import("./store.ts");
  return getSiteSettings(sql);
}

export async function handleListIntegrations(context: AuthedAdmin) {
  const { sql } = await runAdminSql(context);
  const { listAdminProjects } = await import("./store.ts");
  const { canvaConnectMode, loadCanvaConnectionStatus } = await import("../canva/oauth.server.ts");
  const { notionAdapter } = await import("../../content/adapters/notion.ts");
  const projects = await listAdminProjects(sql);
  return {
    canva: await loadCanvaConnectionStatus(sql),
    canvaMode: canvaConnectMode(),
    githubTokenConfigured: Boolean(process.env.GITHUB_READ_TOKEN?.trim()),
    notion: {
      connected: notionAdapter.isConnected(),
      status: "not_configured" as const,
      message: "Notion 未連接。不會假裝已同步任何頁面。",
      pages: [] as const,
    },
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
        errorCode: project.github_metadata?.errorCode,
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
}

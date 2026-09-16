import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import {
  adminAllowlistFromEnv,
  resolveAdminAccess,
} from "./admin.ts";
import {
  applyGithubPatch,
  getPublishedProject,
  getSiteSettings,
  listPublishedArchive,
  listPublishedProjects,
  getProjectBySlugAny,
} from "./cms.ts";
import { assertPublicSafe, toPublicProject, asObject } from "./public.ts";
import { ensureSeeded } from "./seed.ts";
import { previewQuerySchema, slugSchema } from "./schema.ts";
import { fetchGithubSnapshot } from "./github-client.ts";

export const getViewerFlags = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await getSessionUser();
    if (!user) {
      return { signedIn: false, isAdmin: false, adminConfigError: false };
    }
    const access = resolveAdminAccess({
      email: user.email,
      allowlist: adminAllowlistFromEnv(),
    });
    return {
      signedIn: true,
      isAdmin: access.ok,
      adminConfigError: access.reason === "missing_allowlist",
    };
  },
);

export const listPublicProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const projects = await listPublishedProjects(sql);
    for (const project of projects) assertPublicSafe(project);
    return projects;
  },
);

export const getPublicProject = createServerFn({ method: "GET" })
  .validator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const existing = await getProjectBySlugAny(sql, data.slug);
    if (existing?.github_url && !asObject(existing.github_metadata).name) {
      const snapshot = await fetchGithubSnapshot(sql, String(existing.github_url));
      if (snapshot.ok && asObject(snapshot.incoming.github_metadata).private !== true) {
        await applyGithubPatch(sql, String(existing.id), snapshot.incoming, "github-hydrate");
      }
    }
    const project = await getPublishedProject(sql, data.slug);
    if (project) assertPublicSafe(project);
    return project;
  });

export const getPublicProjectPreview = createServerFn({ method: "GET" })
  .validator((data: unknown) => previewQuerySchema.parse(data))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!data.previewDraft) {
      const project = await getPublishedProject(sql, data.slug);
      if (project) assertPublicSafe(project);
      return { project, preview: false as const };
    }
    const user = await getSessionUser();
    const access = resolveAdminAccess({
      email: user?.email,
      allowlist: adminAllowlistFromEnv(),
    });
    if (!access.ok) {
      return { project: null, preview: false as const, error: "forbidden" };
    }
    const row = await getProjectBySlugAny(sql, data.slug);
    if (!row) return { project: null, preview: true as const };
    const mapped = toPublicProject({
      ...row,
      publication_status: "published",
    });
    if (mapped) assertPublicSafe(mapped);
    return { project: mapped, preview: true as const };
  });

export const listPublicArchive = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const items = await listPublishedArchive(sql);
    assertPublicSafe(items);
    return items;
  },
);

export const getPublicSite = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const settings = await getSiteSettings(sql);
    const payload = {
      profile: asObject(settings?.profile_json),
      homepage: asObject(settings?.homepage_json),
      seo: asObject(settings?.seo_json),
      i18n: asObject(settings?.i18n_json),
    };
    assertPublicSafe(payload);
    return payload;
  },
);

import { createMiddleware, createServerFn } from "@tanstack/react-start";
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
import { assertPublicSafe, toPublicProject } from "./public.ts";
import { ensureSeeded } from "./seed.ts";
import { previewQuerySchema, slugSchema } from "./schema.ts";
import { fetchGithubSnapshot } from "./github-client.ts";

type PreviewSession = { bearerToken?: string };

/** Forwards the live-preview bearer without requiring a signed-in user. */
const previewSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    return next({
      context: { bearerToken: (context as PreviewSession).bearerToken },
    });
  });

export const getViewerFlags = createServerFn({ method: "GET" })
  .middleware([previewSessionMiddleware])
  .handler(async ({ context }) => {
    const user = await getSessionUser((context as PreviewSession).bearerToken);
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
      adminConfigError: !access.ok && access.reason === "missing_allowlist",
    };
  });

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
    if (
      existing?.publication_status === "published" &&
      existing.github_url &&
      !existing.github_metadata?.name
    ) {
      const snapshot = await fetchGithubSnapshot(sql, String(existing.github_url));
      if (snapshot.ok) {
        const incoming = snapshot.incoming;
        await applyGithubPatch(
          sql,
          String(existing.id),
          incoming.github_metadata?.private === true
            ? { github_metadata: { private: true } }
            : incoming,
          "system-hydrate",
          "github-hydrate",
        );
      }
    }
    const project = await getPublishedProject(sql, data.slug);
    if (project) assertPublicSafe(project);
    return project;
  });

export const getPublicProjectPreview = createServerFn({ method: "GET" })
  .middleware([previewSessionMiddleware])
  .validator((data: unknown) => previewQuerySchema.parse(data))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!data.previewDraft) {
      const project = await getPublishedProject(sql, data.slug);
      if (project) assertPublicSafe(project);
      return { project, preview: false as const };
    }
    const user = await getSessionUser((context as PreviewSession).bearerToken);
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
    const payload = settings ?? {
      profile: {
        nameZh: "",
        nameEn: "",
        person: "",
        role: "",
        headline: "",
        subhead: "",
        narrative: "",
        email: "unused@example.com",
        github: "",
        githubHandle: "",
        location: "",
      },
      homepage: {},
      seo: {},
      i18n: { defaultLocale: "zh" as const },
    };
    assertPublicSafe(payload);
    return payload;
  },
);

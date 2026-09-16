import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  archiveWriteSchema,
  projectCreateSchema,
  projectUpdateSchema,
  publicationActionSchema,
  siteSettingsWriteSchema,
} from "./schema";

export const getAdminContextFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const { readAdminAllowlist, isAllowlistedEmail } = await import("./admin-access");
  const user = await getSessionUser();
  const allowlist = readAdminAllowlist();
  if (!allowlist.ok) {
    return {
      authenticated: Boolean(user),
      admin: false,
      email: user?.email ?? null,
      configError: allowlist.error,
    };
  }
  const admin = Boolean(user && isAllowlistedEmail(user.email, allowlist.emails));
  return {
    authenticated: Boolean(user),
    admin,
    email: user?.email ?? null,
    configError: null as string | null,
  };
});

export const listAdminProjectsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listAdminProjects } = await import("./queries.server");
    return listAdminProjects(context.userId);
  });

export const getAdminProjectFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { getAdminProject } = await import("./queries.server");
    return getAdminProject(context.userId, data.id);
  });

export const createAdminProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectCreateSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { createAdminProject } = await import("./queries.server");
    return createAdminProject(context.userId, data);
  });

export const updateAdminProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectUpdateSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { updateAdminProject } = await import("./queries.server");
    return updateAdminProject(context.userId, data);
  });

export const publishProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => publicationActionSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { setPublication } = await import("./queries.server");
    return setPublication(context.userId, data.id, "published", data.note);
  });

export const unpublishProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => publicationActionSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { setPublication } = await import("./queries.server");
    return setPublication(context.userId, data.id, "unpublished", data.note);
  });

export const archiveProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => publicationActionSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { setPublication } = await import("./queries.server");
    return setPublication(context.userId, data.id, "archived", data.note);
  });

export const restoreProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => publicationActionSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { setPublication } = await import("./queries.server");
    return setPublication(context.userId, data.id, "draft", data.note ?? "restore");
  });

export const saveDraftProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectUpdateSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { updateAdminProject, setPublication } = await import("./queries.server");
    const updated = await updateAdminProject(context.userId, data);
    if (updated.publicationStatus === "published") {
      return updated;
    }
    return setPublication(context.userId, updated.id, "draft", "save-draft");
  });

export const listRevisionsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { listRevisions } = await import("./queries.server");
    return listRevisions(context.userId, data.projectId);
  });

export const restoreRevisionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ projectId: z.string().min(1), revisionId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { restoreRevision } = await import("./queries.server");
    return restoreRevision(context.userId, data.projectId, data.revisionId);
  });

export const saveSiteSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => siteSettingsWriteSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { saveSiteSettings } = await import("./queries.server");
    return saveSiteSettings(context.userId, data);
  });

export const getAdminSiteFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getAdminSite } = await import("./queries.server");
    return getAdminSite(context.userId);
  });

export const listAdminArchiveFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listAdminArchive } = await import("./queries.server");
    return listAdminArchive(context.userId);
  });

export const upsertArchiveFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => archiveWriteSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { upsertArchive } = await import("./queries.server");
    return upsertArchive(context.userId, data);
  });

export const previewGithubSyncFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { previewGithubSync } = await import("./queries.server");
    return previewGithubSync(context.userId, data.projectId);
  });

export const applyGithubSyncFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { applyGithubSync } = await import("./queries.server");
    return applyGithubSync(context.userId, data.projectId);
  });

export const verifyDemoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { verifyProjectDemo } = await import("./queries.server");
    return verifyProjectDemo(context.userId, data.projectId);
  });

export const verifyCanvaFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { verifyProjectCanva } = await import("./queries.server");
    return verifyProjectCanva(context.userId, data.projectId);
  });

export const listIntegrationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listIntegrations } = await import("./queries.server");
    return listIntegrations(context.userId);
  });

export const verifyReadmeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ projectId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { verifyProjectReadme } = await import("./queries.server");
    return verifyProjectReadme(context.userId, data.projectId);
  });

export const canvaConnectStatusFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getCanvaConnectStatus } = await import("./queries.server");
    return getCanvaConnectStatus(context.userId);
  });

export const connectCanvaApiFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { connectCanvaApi } = await import("./queries.server");
    return connectCanvaApi(context.userId);
  });

export const disconnectCanvaApiFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { disconnectCanvaApi } = await import("./queries.server");
    return disconnectCanvaApi(context.userId);
  });

export const setExperienceModeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        experienceMode: z
          .enum([
            "live-demo",
            "github-explorer",
            "canva-embed",
            "interactive-walkthrough",
            "image-comparison",
            "timeline",
            "process-map",
            "spatial-preview",
            "conversation-preview",
            "media-gallery",
          ])
          .nullable(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { updateAdminProject } = await import("./queries.server");
    return updateAdminProject(context.userId, {
      id: data.id,
      experienceMode: data.experienceMode,
    });
  });

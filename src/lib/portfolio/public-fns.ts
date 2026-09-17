import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public reads intentionally do NOT use authMiddleware.
 * Visitors must browse published work without signing in.
 * Admin mutations live in cms-fns.ts and always use authMiddleware.
 */

export const listPublicProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listPublishedProjects } = await import("./queries.server");
  return listPublishedProjects();
});

export const getPublicProjectFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublishedProject } = await import("./queries.server");
    return getPublishedProject(data.slug);
  });

export const listPublicArchiveFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listPublishedArchive } = await import("./queries.server");
  return listPublishedArchive();
});

export const getPublicSiteFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSite } = await import("./queries.server");
  return getPublicSite();
});

export const getPublicGithubSourceFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublishedProject } = await import("./queries.server");
    const project = await getPublishedProject(data.slug);
    return project?.github ?? null;
  });

export const getPublicCanvaSourceFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublishedProject } = await import("./queries.server");
    const project = await getPublishedProject(data.slug);
    return project?.canva ?? null;
  });

export const getPublicSitemapFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listPublicSitemap } = await import("./queries.server");
  return listPublicSitemap();
});

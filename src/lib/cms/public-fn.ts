import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const slugInput = z.object({ slug: z.string().min(1) });

async function withSql<T>(run: (sql: import("@/lib/db").Sql) => Promise<T>): Promise<T> {
  const { getSql } = await import("@/lib/db");
  const { ensureSeed } = await import("./seed");
  const sql = await getSql();
  await ensureSeed(sql);
  return run(sql);
}

export const listPublishedProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listPublishedProjects } = await import("./store");
    return listPublishedProjects(sql);
  });
});

export const getPublishedProjectFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => slugInput.parse(input))
  .handler(async ({ data }) => {
    return withSql(async (sql) => {
      const { getPublishedProject } = await import("./store");
      return getPublishedProject(sql, data.slug);
    });
  });

export const listPublishedArchiveFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { listPublishedArchive } = await import("./store");
    return listPublishedArchive(sql);
  });
});

export const getPublicSiteFn = createServerFn({ method: "GET" }).handler(async () => {
  return withSql(async (sql) => {
    const { getSiteSettings } = await import("./store");
    const row = await getSiteSettings(sql);
    if (!row) return null;
    return {
      nameZh: String(row.name_zh),
      nameEn: String(row.name_en),
      person: String(row.person),
      role: String(row.role),
      headline: String(row.headline),
      subhead: String(row.subhead),
      narrative: String(row.narrative),
      email: String(row.email),
      github: String(row.github),
      githubHandle: String(row.github_handle),
      location: String(row.location),
      seoTitle: (row.seo_title as string | null) ?? null,
      seoDescription: (row.seo_description as string | null) ?? null,
    };
  });
});

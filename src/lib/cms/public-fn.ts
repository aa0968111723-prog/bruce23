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
      nameZh: row.name_zh,
      nameEn: row.name_en,
      person: row.person,
      role: row.role,
      headline: row.headline,
      subhead: row.subhead,
      narrative: row.narrative,
      email: row.email,
      github: row.github,
      githubHandle: row.github_handle,
      location: row.location,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      homepageHighlightSlugs: row.homepage_json?.highlightSlugs ?? [],
    };
  });
});

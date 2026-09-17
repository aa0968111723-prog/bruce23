import { createServerFn } from "@tanstack/react-start";
import { site } from "@/content/site";
import type { PublicArchiveItem, PublicProject, PublicSite } from "./public-types";

async function boot() {
  const { getSql } = await import("@/lib/db");
  const { ensureSeeded } = await import("./seed");
  const sql = await getSql();
  await ensureSeeded(sql);
  return sql;
}

export const fetchPublicSite = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSite> => {
    const sql = await boot();
    const { getPublicSite } = await import("./queries");
    return getPublicSite(sql, {
      profile: {
        nameZh: site.nameZh,
        nameEn: site.nameEn,
        person: site.person,
        role: site.role,
        headline: site.headline,
        subhead: site.subhead,
        narrative: site.narrative,
        email: site.email,
        github: site.github,
        location: site.location,
      },
      homepage: {
        explorationTitle: "從模態走進作品",
        explorationBody:
          "圖像、影片、空間、文宣、互動各自連到真實專案。",
      },
      seo: {
        title: `${site.nameZh} · ${site.person}`,
        description: site.headline,
      },
    });
  },
);

export const fetchPublishedProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicProject[]> => {
    const sql = await boot();
    const { listPublishedProjects } = await import("./queries");
    return listPublishedProjects(sql);
  },
);

export const fetchPublishedProject = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<PublicProject | null> => {
    const sql = await boot();
    const { getPublishedProject } = await import("./queries");
    return getPublishedProject(sql, slug);
  });

export const fetchPublishedArchive = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicArchiveItem[]> => {
    const sql = await boot();
    const { listPublishedArchive } = await import("./queries");
    return listPublishedArchive(sql);
  },
);

export const fetchSitemapPaths = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const sql = await boot();
    const { sitemapSlugs } = await import("./queries");
    return sitemapSlugs(sql);
  },
);

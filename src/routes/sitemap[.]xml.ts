import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { listPublishedProjects } from "@/lib/portfolio/cms";
import { ensureSeeded } from "@/lib/portfolio/seed";
import { sitemapXml } from "@/lib/portfolio/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sql = await getSql();
        await ensureSeeded(sql);
        const projects = await listPublishedProjects(sql);
        const body = sitemapXml(projects.map((project) => project.slug));
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

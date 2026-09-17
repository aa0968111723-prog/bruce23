import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { listPublishedProjects } from "@/lib/portfolio/cms";
import { ensureSeeded } from "@/lib/portfolio/seed";
import { sitemapXml } from "@/lib/portfolio/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sql = await getSql();
        await ensureSeeded(sql);
        const projects = await listPublishedProjects(sql);
        const origin = new URL(request.url).origin;
        const body = sitemapXml(
          projects.map((project) => project.slug),
          origin,
        );
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

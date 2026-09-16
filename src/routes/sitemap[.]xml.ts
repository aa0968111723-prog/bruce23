import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { listPublishedProjects } from "@/lib/portfolio/cms";
import { ensureSeeded } from "@/lib/portfolio/seed";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sql = await getSql();
        await ensureSeeded(sql);
        const projects = await listPublishedProjects(sql);
        const urls = [
          "/",
          "/work",
          "/about",
          "/archive",
          ...projects.map((project) => `/work/${project.slug}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `<url><loc>${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

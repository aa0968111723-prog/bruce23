import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { getSql } = await import("@/lib/db");
        const { ensureSeeded } = await import("@/lib/cms/seed");
        const { sitemapSlugs } = await import("@/lib/cms/queries");
        const sql = await getSql();
        await ensureSeeded(sql);
        const slugs = await sitemapSlugs(sql);
        const origin = "https://luminous.studio";
        const urls = ["/", "/work", "/archive", "/about", ...slugs.map((slug) => `/work/${slug}`)];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

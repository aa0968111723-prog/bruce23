import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { listPublicSitemap } = await import("@/lib/portfolio/queries.server");
        const origin = new URL(request.url).origin;
        const paths = await listPublicSitemap();
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const loc = path.startsWith("http") ? path : `${origin}${path}`;
    return `  <url><loc>${loc.replace(/&/g, "&amp;")}</loc></url>`;
  })
  .join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});

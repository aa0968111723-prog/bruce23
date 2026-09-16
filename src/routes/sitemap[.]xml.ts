import { createFileRoute } from "@tanstack/react-router";
import { listPublishedProjectsFn } from "@/lib/cms/public-fn";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const projects = await listPublishedProjectsFn();
        const origin = new URL(request.url).origin;
        const urls = ["/", "/work", "/archive", "/about", ...projects.map((item) => `/work/${item.slug}`)];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

export function sitemapPaths(slugs: string[]): string[] {
  return ["/", "/work", "/about", "/archive", ...slugs.map((slug) => `/work/${slug}`)];
}

export function sitemapXml(slugs: string[]): string {
  const urls = sitemapPaths(slugs);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `<url><loc>${path}</loc></url>`).join("\n")}
</urlset>`;
}

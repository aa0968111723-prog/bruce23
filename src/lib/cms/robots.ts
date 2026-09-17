export function publicRobotsBody(origin: string): string {
  const sitemap = `${origin.replace(/\/$/, "")}/sitemap.xml`;
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /login",
    "Disallow: /api",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");
}

export function publicSitemapPaths(slugs: string[]): string[] {
  return ["/", "/work", "/archive", "/about", "/privacy", ...slugs.map((slug) => `/work/${slug}`)];
}

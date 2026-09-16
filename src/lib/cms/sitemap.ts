export function publicSitemapPaths(slugs: string[]): string[] {
  return ["/", "/work", "/archive", "/about", ...slugs.map((slug) => `/work/${slug}`)];
}

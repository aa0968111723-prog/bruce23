import type { PublicProject } from "./privacy.ts";
import type { PublicSite } from "./public-site.ts";

export function jsonLdUrl(path: string, origin?: string): string {
  const base = origin?.replace(/\/$/, "") ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** JSON-LD emitted only on published case-study pages, never on admin preview. */
export function publishedCreativeWorkJsonLd(project: PublicProject, origin?: string) {
  const en = project.locale?.en?.title?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    alternateName: en && en !== project.title ? en : undefined,
    description: project.seoDescription?.trim() || project.summary,
    url: jsonLdUrl(`/work/${project.slug}`, origin),
    inLanguage: "zh-Hant",
    image: project.media[0]?.src?.startsWith("/media/")
      ? jsonLdUrl(project.media[0].src, origin)
      : undefined,
  };
}

export function publishedPersonJsonLd(
  site: Pick<PublicSite, "person" | "nameEn" | "email" | "github" | "role">,
  origin?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.person,
    alternateName: site.nameEn || undefined,
    jobTitle: site.role || undefined,
    email: site.email || undefined,
    url: jsonLdUrl("/about", origin),
    sameAs: site.github ? [site.github] : undefined,
    inLanguage: "zh-Hant",
  };
}

export function publishedWebSiteJsonLd(
  site: { name: string; description?: string | null },
  origin?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description?.trim() || undefined,
    url: jsonLdUrl("/", origin),
    inLanguage: "zh-Hant",
  };
}

export function publishedCollectionJsonLd(
  input: { name: string; description: string; path: string; itemPaths?: string[] },
  origin?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: jsonLdUrl(input.path, origin),
    inLanguage: "zh-Hant",
    hasPart: input.itemPaths?.map((path) => ({
      "@type": "CreativeWork",
      url: jsonLdUrl(path, origin),
    })),
  };
}

/** Escape `<` so a title/summary cannot break out of the JSON-LD script tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

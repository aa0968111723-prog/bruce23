import type { PublicProject } from "./privacy.ts";

/** JSON-LD emitted only on published case-study pages, never on admin preview. */
export function publishedCreativeWorkJsonLd(project: PublicProject) {
  const en = project.locale?.en?.title?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    alternateName: en && en !== project.title ? en : undefined,
    description: project.seoDescription?.trim() || project.summary,
    url: `/work/${project.slug}`,
    inLanguage: "zh-Hant",
    image: project.media[0]?.src?.startsWith("/media/") ? project.media[0].src : undefined,
  };
}

/** Escape `<` so a title/summary cannot break out of the JSON-LD script tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

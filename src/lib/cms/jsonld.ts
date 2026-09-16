import type { PublicProject } from "./privacy.ts";

/** JSON-LD emitted only on published case-study pages, never on admin preview. */
export function publishedCreativeWorkJsonLd(project: PublicProject) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `/work/${project.slug}`,
    inLanguage: "zh-Hant",
    image: project.media[0]?.src?.startsWith("/media/") ? project.media[0].src : undefined,
  };
}

import type { PublicProject } from "./public.ts";

export function creativeWorkJsonLd(project: PublicProject | null | undefined) {
  if (!project || project.publication_status !== "published") return null;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `/work/${project.slug}`,
  };
}

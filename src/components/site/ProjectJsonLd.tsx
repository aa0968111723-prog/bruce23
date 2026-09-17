import type { PublicProject } from "@/lib/portfolio/types";
import { site } from "@/content/site";

export function ProjectJsonLd({ project }: { project: PublicProject }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary,
    creator: { "@type": "Person", name: site.person },
    url: `/work/${project.slug}`,
    keywords: project.stack.join(", "),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

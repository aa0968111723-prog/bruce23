import { archiveItems } from "@/content/archive";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { parseGithubUrl } from "./github-url";
import { presetForSlug } from "./experience-presets";
import type { ProjectCreate } from "./schema";
import type { ArchiveWrite, SiteSettingsWrite } from "./schema";

export const SEED_KEY = "portfolio-static-v1";

export function seedSiteSettings(): SiteSettingsWrite {
  return {
    nameZh: site.nameZh,
    nameEn: site.nameEn,
    person: site.person,
    role: site.role,
    headline: site.headline,
    subhead: site.subhead,
    narrative: site.narrative,
    email: site.email,
    github: site.github,
    githubHandle: site.githubHandle,
    location: site.location,
    seoTitle: `${site.nameZh} · ${site.nameEn}`,
    seoDescription: site.headline,
    homepageContent: {
      processSteps: true,
      modalities: true,
    },
    localeZh: {},
    localeEn: {},
  };
}

export function seedProjects(): Array<ProjectCreate & { id: string }> {
  return projects.map((project, index) => {
    const parsed = parseGithubUrl(project.links.github);
    const preset = presetForSlug(project.slug);
    const live = project.links.live ?? project.links.demo;
    return {
      id: project.slug,
      slug: project.slug,
      title: project.title,
      subtitle: project.subtitle,
      category: project.category,
      year: project.year,
      productStatus: project.status,
      featured: project.featured,
      sortOrder: index,
      summary: project.summary,
      problem: project.problem,
      role: project.role,
      decisions: project.decisions,
      modalities: project.modalities,
      process: project.process,
      outputs: project.outputs,
      stack: project.stack,
      limitations: project.limitations,
      media: project.media,
      sourceEvidence: project.sourceReferences.map((item) => ({
        label: item.label,
        href: item.href,
        note: item.note,
        kind: item.href?.includes("github.com") ? "github" : "other",
      })),
      localeZh: {},
      localeEn: {},
      seoTitle: `${project.title} · ${site.nameZh}`,
      seoDescription: project.summary.slice(0, 180),
      githubUrl: parsed?.url,
      githubOwner: parsed?.owner,
      githubRepo: parsed?.repo,
      githubBranch: undefined,
      githubSyncEnabled: Boolean(parsed),
      liveDemoUrl: live,
      liveDemoLabel: project.links.live ? "公開網址（狀態可能變動）" : project.links.demo ? "Demo" : undefined,
      liveDemoType: live ? "link" : "none",
      liveDemoEmbedEnabled: false,
      canvaShareUrl: undefined,
      canvaEmbedUrl: undefined,
      canvaPageIds: [],
      experienceMode: preset?.mode,
      experienceConfig: preset?.config ?? {},
      interactionSteps: preset?.steps ?? [],
      publicationStatus: "published",
    };
  });
}

export function seedArchive(): ArchiveWrite[] {
  return archiveItems.map((item, index) => ({
    id: item.id,
    title: item.title,
    kind: item.kind,
    year: item.year,
    summary: item.summary,
    media: item.media,
    href: item.href,
    originNote: item.originNote,
    publicationStatus: "published",
    sortOrder: index,
  }));
}

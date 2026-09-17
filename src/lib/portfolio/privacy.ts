import type {
  AdminArchiveItem,
  AdminProject,
  PublicArchiveItem,
  PublicCanvaSource,
  PublicGithubSource,
  PublicProject,
} from "./types";

const SECRET_KEY_RE =
  /(token|secret|password|apikey|api_key|service.?role|private.?key|authorization|encrypted_payload|refresh_token|access_token)/i;

export function assertNoSecrets(payload: unknown, path = "root"): string[] {
  const hits: string[] = [];
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload)) {
      payload.forEach((item, index) => hits.push(...assertNoSecrets(item, `${path}[${index}]`)));
      return hits;
    }
    for (const [key, value] of Object.entries(payload)) {
      if (SECRET_KEY_RE.test(key)) hits.push(`${path}.${key}`);
      hits.push(...assertNoSecrets(value, `${path}.${key}`));
    }
  }
  return hits;
}

export function toPublicGithub(
  project: AdminProject,
): PublicGithubSource | null {
  if (!project.github?.url) return null;
  if (project.githubIsPrivate) return null;
  if (project.github.metadata?.visibility === "private") return null;
  return {
    url: project.github.url,
    owner: project.github.owner,
    repo: project.github.repo,
    branch: project.github.branch,
    syncStatus: project.github.syncStatus,
    lastSyncedAt: project.github.lastSyncedAt,
    metadata: project.github.metadata,
    readmeSummary: project.github.readmeSummary,
    fileTree: project.github.fileTree,
    languages: project.github.languages,
    topics: project.github.topics,
    latestCommit: project.github.latestCommit,
  };
}

export function toPublicCanva(canva: PublicCanvaSource | null): PublicCanvaSource | null {
  if (!canva) return null;
  if (!canva.shareUrl && !canva.embedUrl && !canva.thumbnailUrl) return null;
  return canva;
}

export function toPublicProject(project: AdminProject): PublicProject | null {
  if (project.publicationStatus !== "published") return null;
  const github = toPublicGithub(project);
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    year: project.year,
    productStatus: project.productStatus,
    featured: project.featured,
    sortOrder: project.sortOrder,
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
    sourceEvidence: project.sourceEvidence.filter((item) => {
      if (!item.href) return true;
      return !/token=|invite=|service.role/i.test(item.href);
    }),
    github,
    liveDemo: project.liveDemo,
    canva: toPublicCanva(project.canva),
    experienceMode: project.experienceMode,
    experienceConfig: project.experienceConfig,
    interactionSteps: project.interactionSteps,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    localeZh: project.localeZh,
    localeEn: project.localeEn,
  };
}

export function toPublicArchive(
  item: PublicArchiveItem & { publicationStatus?: string } | AdminArchiveItem,
): PublicArchiveItem | null {
  if (item.publicationStatus && item.publicationStatus !== "published") return null;
  return {
    id: item.id,
    title: item.title,
    kind: item.kind,
    year: item.year,
    summary: item.summary,
    media: item.media,
    href: item.href,
    originNote: item.originNote,
    canva: toPublicCanva(item.canva),
    sortOrder: item.sortOrder,
  };
}

export function stripAdminOnlyKeys<T extends Record<string, unknown>>(row: T): T {
  const clone = { ...row };
  delete clone.github_readme;
  delete clone.github_sync_error;
  delete clone.live_demo_error;
  delete clone.canva_error;
  delete clone.owner_user_id;
  delete clone.encrypted_payload;
  return clone;
}

import type { ExperienceConfig, FileTreeNode } from "./schema.ts";
import { SECRET_KEY_PATTERN } from "./constants.ts";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type JsonObject = { [key: string]: Json };

export type GithubMetadataPublic = {
  name?: string;
  description?: string | null;
  htmlUrl?: string;
  defaultBranch?: string;
  updatedAt?: string;
  private?: boolean;
  archived?: boolean;
  homepage?: string | null;
  language?: string | null;
};

export type PublicGithub = {
  url: string;
  owner: string;
  repo: string;
  branch?: string;
  name?: string;
  description?: string | null;
  languages?: Record<string, number>;
  topics?: string[];
  updatedAt?: string;
  latestCommit?: {
    sha: string;
    message: string;
    htmlUrl: string;
    date?: string;
  };
  readmeSummary?: string | null;
  fileTree?: FileTreeNode[];
};

export type PublicCanva = {
  shareUrl?: string;
  embedUrl?: string;
  designId?: string;
  pageIds?: string[];
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  status: string;
};

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  subtitle: string;
  subtitle_en?: string | null;
  category: string;
  year: string;
  product_status: string;
  publication_status: "published";
  featured: boolean;
  sort_order: number;
  summary: string;
  summary_en?: string | null;
  problem: string;
  problem_en?: string | null;
  role: string;
  role_en?: string | null;
  decisions: string[];
  modalities: string[];
  process: string[];
  outputs: string[];
  stack: string[];
  limitations: string[];
  media: Array<{
    src: string;
    alt: string;
    kind: "image" | "video";
    caption?: string;
    poster?: string;
  }>;
  source_evidence: Array<{ label: string; href?: string; note: string }>;
  seo?: { title?: string; description?: string };
  github: PublicGithub | null;
  canva: PublicCanva | null;
  live_demo: {
    url?: string;
    label?: string;
    type?: string;
    embedEnabled: boolean;
    status: string;
    lastVerifiedAt?: string;
  } | null;
  experience_mode: string;
  experience_config: ExperienceConfig;
  interaction_steps: Array<{ id: string; title: string; body: string }>;
  experience_label?: string | null;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  subtitle?: string | null;
  subtitle_en?: string | null;
  category: string;
  year: string;
  product_status: string;
  publication_status: string;
  featured: boolean;
  sort_order: number;
  summary?: string | null;
  summary_en?: string | null;
  problem?: string | null;
  problem_en?: string | null;
  role?: string | null;
  role_en?: string | null;
  decisions_json?: string[];
  modalities_json?: string[];
  process_json?: string[];
  outputs_json?: string[];
  stack_json?: string[];
  limitations_json?: string[];
  media_json?: PublicProject["media"];
  source_evidence?: PublicProject["source_evidence"];
  seo_json?: PublicProject["seo"];
  github_url?: string | null;
  github_owner?: string | null;
  github_repo?: string | null;
  github_branch?: string | null;
  github_sync_enabled?: boolean;
  github_sync_status?: string | null;
  github_last_synced_at?: string | null;
  github_sync_error?: string | null;
  github_metadata?: GithubMetadataPublic | null;
  github_readme?: string | null;
  github_file_tree?: FileTreeNode[] | null;
  github_languages?: Record<string, number> | null;
  github_topics?: string[] | null;
  github_latest_commit?: PublicGithub["latestCommit"] | null;
  live_demo_url?: string | null;
  live_demo_label?: string | null;
  live_demo_type?: string | null;
  live_demo_embed_enabled?: boolean;
  live_demo_status?: string | null;
  live_demo_last_verified_at?: string | null;
  live_demo_error?: string | null;
  canva_share_url?: string | null;
  canva_embed_url?: string | null;
  canva_design_id?: string | null;
  canva_page_ids?: string[];
  canva_thumbnail_url?: string | null;
  canva_status?: string | null;
  canva_last_synced_at?: string | null;
  canva_alt?: string | null;
  canva_caption?: string | null;
  canva_error?: string | null;
  experience_mode?: string | null;
  experience_config?: ExperienceConfig | null;
  interaction_steps?: PublicProject["interaction_steps"];
  experience_label?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
};

export type ArchiveRow = {
  id: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  media: PublicProject["media"][number] | null;
  href: string | null;
  origin_note: string;
  canva_share_url: string | null;
  canva_embed_url: string | null;
  publication_status: string;
  sort_order: number;
};

export type PublicArchive = {
  id: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  media: PublicProject["media"][number] | null;
  href?: string;
  originNote: string;
  canvaShareUrl?: string;
  canvaEmbedUrl?: string;
};

export type SiteSettingsDto = {
  profile: {
    nameZh: string;
    nameEn: string;
    person: string;
    role: string;
    headline: string;
    headlineEn?: string;
    subhead: string;
    narrative: string;
    narrativeEn?: string;
    email: string;
    github: string;
    githubHandle: string;
    location: string;
  };
  homepage: {
    featuredIntro?: string;
    featuredIntroEn?: string;
    processTitle?: string;
  };
  seo: { title?: string; description?: string; ogAlt?: string };
  i18n: { defaultLocale: "zh" | "en" };
};

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asObject<T extends object = JsonObject>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : ({} as T);
}

export function asLanguageMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, bytes] of Object.entries(value)) {
    if (typeof bytes === "number" && Number.isFinite(bytes)) out[key] = bytes;
  }
  return out;
}

export function asGithubCommit(
  value: unknown,
): PublicGithub["latestCommit"] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.sha !== "string" ||
    typeof row.message !== "string" ||
    typeof row.htmlUrl !== "string"
  ) {
    return null;
  }
  return {
    sha: row.sha,
    message: row.message,
    htmlUrl: row.htmlUrl,
    date: typeof row.date === "string" ? row.date : undefined,
  };
}

export function asGithubMetadata(value: unknown): GithubMetadataPublic | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  return {
    name: typeof row.name === "string" ? row.name : undefined,
    description:
      typeof row.description === "string" || row.description === null
        ? row.description
        : undefined,
    htmlUrl: typeof row.htmlUrl === "string" ? row.htmlUrl : undefined,
    defaultBranch: typeof row.defaultBranch === "string" ? row.defaultBranch : undefined,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
    private: typeof row.private === "boolean" ? row.private : undefined,
    archived: typeof row.archived === "boolean" ? row.archived : undefined,
    homepage:
      typeof row.homepage === "string" || row.homepage === null
        ? row.homepage
        : undefined,
    language:
      typeof row.language === "string" || row.language === null
        ? row.language
        : undefined,
  };
}

export function asArchiveMedia(value: unknown): ArchiveRow["media"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.src !== "string" || typeof row.alt !== "string") return null;
  if (row.kind !== "image" && row.kind !== "video") return null;
  return {
    src: row.src,
    alt: row.alt,
    kind: row.kind,
    caption: typeof row.caption === "string" ? row.caption : undefined,
    poster: typeof row.poster === "string" ? row.poster : undefined,
  };
}

export function containsSecretKey(value: unknown, path = ""): string | null {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const hit = containsSecretKey(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      const here = path ? `${path}.${key}` : key;
      if (SECRET_KEY_PATTERN.test(key)) return here;
      const hit = containsSecretKey(nested, here);
      if (hit) return hit;
    }
  }
  return null;
}

export function toPublicProject(
  row: Pick<ProjectRow, "publication_status"> & Partial<ProjectRow>,
): PublicProject | null {
  if (row.publication_status !== "published") return null;
  const metadata = asGithubMetadata(row.github_metadata) ?? {};
  const isPrivateRepo = metadata.private !== false;
  const githubUrl = typeof row.github_url === "string" ? row.github_url : null;

  const github: PublicGithub | null =
    !isPrivateRepo && githubUrl && row.github_owner && row.github_repo
      ? {
          url: githubUrl,
          owner: String(row.github_owner),
          repo: String(row.github_repo),
          branch: typeof row.github_branch === "string" ? row.github_branch : undefined,
          name: typeof metadata.name === "string" ? metadata.name : undefined,
          description:
            typeof metadata.description === "string" || metadata.description === null
              ? (metadata.description as string | null)
              : undefined,
          languages: asLanguageMap(row.github_languages),
          topics: asArray<string>(row.github_topics),
          updatedAt:
            typeof metadata.updatedAt === "string" ? metadata.updatedAt : undefined,
          latestCommit: asGithubCommit(row.github_latest_commit) ?? undefined,
          readmeSummary:
            typeof row.github_readme === "string" ? row.github_readme : null,
          fileTree: asArray<FileTreeNode>(row.github_file_tree),
        }
      : null;

  const canvaEmbed =
    typeof row.canva_embed_url === "string" ? row.canva_embed_url : undefined;
  const canva: PublicCanva | null = canvaEmbed
    ? {
        shareUrl:
          typeof row.canva_share_url === "string" ? row.canva_share_url : undefined,
        embedUrl: canvaEmbed,
        designId:
          typeof row.canva_design_id === "string" ? row.canva_design_id : undefined,
        pageIds: asArray<string>(row.canva_page_ids),
        thumbnailUrl:
          typeof row.canva_thumbnail_url === "string"
            ? row.canva_thumbnail_url
            : undefined,
        alt: typeof row.canva_alt === "string" ? row.canva_alt : undefined,
        caption:
          typeof row.canva_caption === "string" ? row.canva_caption : undefined,
        status: String(row.canva_status ?? "not_configured"),
      }
    : null;

  const liveUrl = typeof row.live_demo_url === "string" ? row.live_demo_url : undefined;

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    title_en: (row.title_en as string | null) ?? null,
    subtitle: String(row.subtitle ?? ""),
    subtitle_en: (row.subtitle_en as string | null) ?? null,
    category: String(row.category),
    year: String(row.year),
    product_status: String(row.product_status),
    publication_status: "published",
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order ?? 0),
    summary: String(row.summary ?? ""),
    summary_en: (row.summary_en as string | null) ?? null,
    problem: String(row.problem ?? ""),
    problem_en: (row.problem_en as string | null) ?? null,
    role: String(row.role ?? ""),
    role_en: (row.role_en as string | null) ?? null,
    decisions: asArray<string>(row.decisions_json),
    modalities: asArray<string>(row.modalities_json),
    process: asArray<string>(row.process_json),
    outputs: asArray<string>(row.outputs_json),
    stack: asArray<string>(row.stack_json),
    limitations: asArray<string>(row.limitations_json),
    media: asArray(row.media_json),
    source_evidence: asArray(row.source_evidence),
    seo: asObject(row.seo_json),
    github,
    canva,
    live_demo: liveUrl
      ? {
          url: liveUrl,
          label:
            typeof row.live_demo_label === "string" ? row.live_demo_label : undefined,
          type: typeof row.live_demo_type === "string" ? row.live_demo_type : undefined,
          embedEnabled: Boolean(row.live_demo_embed_enabled),
          status: String(row.live_demo_status ?? "not_configured"),
          lastVerifiedAt:
            row.live_demo_last_verified_at != null
              ? String(row.live_demo_last_verified_at)
              : undefined,
        }
      : null,
    experience_mode: String(row.experience_mode ?? "github-explorer"),
    experience_config: asObject<ExperienceConfig>(row.experience_config),
    interaction_steps: asArray(row.interaction_steps),
    experience_label:
      typeof row.experience_label === "string" ? row.experience_label : null,
  };
}

export function toPublicArchive(row: ArchiveRow): PublicArchive | null {
  if (row.publication_status !== "published") return null;
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    year: row.year,
    summary: row.summary,
    media: row.media,
    href: row.href ?? undefined,
    originNote: row.origin_note,
    canvaShareUrl: row.canva_share_url ?? undefined,
    canvaEmbedUrl: row.canva_embed_url ?? undefined,
  };
}

export function assertPublicSafe(payload: unknown): void {
  const hit = containsSecretKey(payload);
  if (hit) {
    throw new Error(`public payload leaked secret key at ${hit}`);
  }
}

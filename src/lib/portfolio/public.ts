import { SECRET_KEY_PATTERN } from "./constants.ts";
import type { FileTreeNode } from "./schema.ts";

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
  experience_config: Record<string, unknown>;
  interaction_steps: Array<{ id: string; title: string; body: string }>;
  experience_label?: string | null;
};

export type ProjectRow = Record<string, unknown> & {
  id: string;
  slug: string;
  publication_status: string;
  github_metadata?: { private?: boolean } | null;
};

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asObject<T extends Record<string, unknown>>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : ({} as T);
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

export function toPublicProject(row: ProjectRow): PublicProject | null {
  if (row.publication_status !== "published") return null;
  const metadata = asObject<{ private?: boolean }>(row.github_metadata);
  const isPrivateRepo = metadata.private === true;
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
          languages: asObject<Record<string, number>>(row.github_languages),
          topics: asArray<string>(row.github_topics),
          updatedAt:
            typeof metadata.updatedAt === "string" ? metadata.updatedAt : undefined,
          latestCommit: row.github_latest_commit
            ? (asObject(row.github_latest_commit) as PublicGithub["latestCommit"])
            : undefined,
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
    experience_config: asObject(row.experience_config),
    interaction_steps: asArray(row.interaction_steps),
    experience_label:
      typeof row.experience_label === "string" ? row.experience_label : null,
  };
}

export function toPublicArchive(row: Record<string, unknown>) {
  if (row.publication_status !== "published") return null;
  return {
    id: String(row.id),
    title: String(row.title),
    kind: String(row.kind),
    year: String(row.year),
    summary: String(row.summary ?? ""),
    media: row.media_json ?? undefined,
    href: typeof row.href === "string" ? row.href : undefined,
    originNote: String(row.origin_note ?? ""),
    canvaShareUrl:
      typeof row.canva_share_url === "string" ? row.canva_share_url : undefined,
    canvaEmbedUrl:
      typeof row.canva_embed_url === "string" ? row.canva_embed_url : undefined,
  };
}

export function assertPublicSafe(payload: unknown): void {
  const hit = containsSecretKey(payload);
  if (hit) {
    throw new Error(`public payload leaked secret key at ${hit}`);
  }
}

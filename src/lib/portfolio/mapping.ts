import type {
  AdminProject,
  FileTreeNode,
  GithubCommitPublic,
  GithubMetadataPublic,
  IntegrationStatus,
  InteractionStep,
  JsonObject,
  ProductStatus,
  ProjectCategory,
  ProjectMedia,
  PublicationStatus,
  AdminArchiveItem,
  PublicArchiveItem,
  SourceEvidence,
  ExperienceMode,
} from "./types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "t" || value === "true") return true;
  if (value === "f" || value === "false") return false;
  return fallback;
}

function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export type ProjectRow = Record<string, unknown>;

export function rowToAdminProject(row: ProjectRow): AdminProject {
  const githubUrl = asNullableString(row.github_url);
  const metadata = asJson<GithubMetadataPublic | null>(row.github_metadata, null);
  const fileTree = asJson<FileTreeNode[]>(row.github_file_tree, []);
  const languages = asJson<Record<string, number> | null>(row.github_languages, null);
  const topics = asJson<string[]>(row.github_topics, []);
  const latestCommit = asJson<GithubCommitPublic | null>(row.github_latest_commit, null);
  const liveUrl = asNullableString(row.live_demo_url);
  const canvaShare = asNullableString(row.canva_share_url);
  const canvaEmbed = asNullableString(row.canva_embed_url);
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    subtitle: asString(row.subtitle),
    category: asString(row.category) as ProjectCategory,
    year: asString(row.year),
    productStatus: asString(row.product_status, "prototype") as ProductStatus,
    featured: asBool(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    summary: asString(row.summary),
    problem: asString(row.problem),
    role: asString(row.role),
    decisions: asJson<string[]>(row.decisions, []),
    modalities: asJson<string[]>(row.modalities, []),
    process: asJson<string[]>(row.process, []),
    outputs: asJson<string[]>(row.outputs, []),
    stack: asJson<string[]>(row.stack, []),
    limitations: asJson<string[]>(row.limitations, []),
    media: asJson<ProjectMedia[]>(row.media, []),
    sourceEvidence: asJson<SourceEvidence[]>(row.source_evidence, []),
    github: githubUrl
      ? {
          url: githubUrl,
          owner: asString(row.github_owner),
          repo: asString(row.github_repo),
          branch: asNullableString(row.github_branch),
          syncStatus: asString(row.github_sync_status, "not_configured") as IntegrationStatus,
          lastSyncedAt: row.github_last_synced_at ? String(row.github_last_synced_at) : null,
          metadata,
          readmeSummary: asNullableString(row.github_readme_summary),
          fileTree,
          languages,
          topics,
          latestCommit,
        }
      : null,
    liveDemo: liveUrl
      ? {
          url: liveUrl,
          label: asNullableString(row.live_demo_label),
          type: (asNullableString(row.live_demo_type) as "iframe" | "link" | "none" | null) ?? "link",
          embedEnabled: asBool(row.live_demo_embed_enabled),
          lastVerifiedAt: row.live_demo_last_verified_at
            ? String(row.live_demo_last_verified_at)
            : null,
          status: asString(row.live_demo_status, "not_configured") as IntegrationStatus,
        }
      : null,
    canva:
      canvaShare || canvaEmbed
        ? {
            shareUrl: canvaShare,
            embedUrl: canvaEmbed,
            designId: asNullableString(row.canva_design_id),
            pageIds: asJson<string[]>(row.canva_page_ids, []),
            thumbnailUrl: asNullableString(row.canva_thumbnail_url),
            status: asString(row.canva_status, "not_configured") as IntegrationStatus,
            lastSyncedAt: row.canva_last_synced_at ? String(row.canva_last_synced_at) : null,
            alt: asNullableString(row.canva_alt),
            description: asNullableString(row.canva_description),
          }
        : null,
    experienceMode: (asNullableString(row.experience_mode) as ExperienceMode | null) ?? null,
    experienceConfig: asJson<JsonObject>(row.experience_config, {}),
    interactionSteps: asJson<InteractionStep[]>(row.interaction_steps, []),
    seoTitle: asNullableString(row.seo_title),
    seoDescription: asNullableString(row.seo_description),
    localeZh: asJson<JsonObject>(row.locale_zh, {}),
    localeEn: asJson<JsonObject>(row.locale_en, {}),
    publicationStatus: asString(row.publication_status, "draft") as PublicationStatus,
    publishedAt: row.published_at ? String(row.published_at) : null,
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    githubSyncEnabled: asBool(row.github_sync_enabled),
    githubSyncError: asNullableString(row.github_sync_error),
    githubReadme: asNullableString(row.github_readme),
    githubIsPrivate: asBool(row.github_is_private),
    liveDemoError: asNullableString(row.live_demo_error),
    canvaError: asNullableString(row.canva_error),
    ownerUserId: asNullableString(row.owner_user_id),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export function rowToArchive(row: ProjectRow): AdminArchiveItem {
  return {
    id: asString(row.id),
    title: asString(row.title),
    kind: asString(row.kind) as PublicArchiveItem["kind"],
    year: asString(row.year),
    summary: asString(row.summary),
    media: asJson(row.media, undefined),
    href: asNullableString(row.href) ?? undefined,
    originNote: asString(row.origin_note),
    canva:
      asNullableString(row.canva_share_url) || asNullableString(row.canva_embed_url)
        ? {
            shareUrl: asNullableString(row.canva_share_url),
            embedUrl: asNullableString(row.canva_embed_url),
            designId: asNullableString(row.canva_design_id),
            pageIds: [],
            thumbnailUrl: asNullableString(row.canva_thumbnail_url),
            status: asString(row.canva_status, "not_configured") as IntegrationStatus,
            lastSyncedAt: null,
            alt: null,
            description: null,
          }
        : null,
    sortOrder: Number(row.sort_order ?? 0),
    publicationStatus: asString(row.publication_status, "draft"),
  };
}

export function jsonParam(value: unknown): string {
  return JSON.stringify(value ?? null);
}

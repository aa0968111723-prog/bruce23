import type { Sql } from "../db";
import { asBoolean, asNumber, parseJson, summarizeReadme, toIso } from "./json.ts";
import type {
  CopyLocale,
  ExperienceConfig,
  ExperienceMode,
  FileTreeNode,
  GithubMetadata,
  IntegrationStatus,
  PublicationStatus,
} from "./schema";
import type {
  AdminProject,
  LanguageBytes,
  PublicArchiveItem,
  PublicCanva,
  PublicDemo,
  PublicGithub,
  PublicProject,
  PublicSite,
} from "./public-types";
import type { ProjectCategory, ProjectMedia, ProjectStatus } from "../../content/types";

export type ProjectRow = Record<string, unknown>;

function stringList(value: unknown): string[] {
  const parsed = parseJson<unknown>(value, []);
  return Array.isArray(parsed) ? parsed.map(String) : [];
}

function publicGithub(row: ProjectRow, forAdmin: boolean): PublicGithub | null {
  const isPrivate = asBoolean(row.github_is_private);
  const approved = asBoolean(row.github_public_approved);
  if (!forAdmin && (isPrivate || !approved)) return null;
  const url = typeof row.github_url === "string" ? row.github_url : null;
  const owner = typeof row.github_owner === "string" ? row.github_owner : null;
  const repo = typeof row.github_repo === "string" ? row.github_repo : null;
  if (!url || !owner || !repo) return null;
  const meta = parseJson<GithubMetadata>(row.github_metadata, {});
  return {
    url,
    owner,
    repo,
    branch: typeof row.github_branch === "string" ? row.github_branch : null,
    description: typeof meta.description === "string" ? meta.description : null,
    homepage: typeof meta.homepage === "string" ? meta.homepage : null,
    languages: parseJson<LanguageBytes | null>(row.github_languages, null),
    topics: parseJson<string[]>(row.github_topics, []),
    updatedAt: typeof meta.updated_at === "string" ? meta.updated_at : null,
    latestCommit: parseJson(row.github_latest_commit, null),
    readmeSummary: summarizeReadme(
      typeof row.github_readme === "string" ? row.github_readme : null,
    ),
    fileTree: parseJson<FileTreeNode[] | null>(row.github_file_tree, null),
    isPrivate: false,
  };
}

function publicCanva(row: ProjectRow): PublicCanva | null {
  const share = typeof row.canva_share_url === "string" ? row.canva_share_url : null;
  const embed = typeof row.canva_embed_url === "string" ? row.canva_embed_url : null;
  if (!share && !embed) return null;
  return {
    shareUrl: share,
    embedUrl: embed,
    designId: typeof row.canva_design_id === "string" ? row.canva_design_id : null,
    pageIds: parseJson<string[]>(row.canva_page_ids, []),
    thumbnailUrl: typeof row.canva_thumbnail_url === "string" ? row.canva_thumbnail_url : null,
    alt: typeof row.canva_alt === "string" ? row.canva_alt : null,
    caption: typeof row.canva_caption === "string" ? row.canva_caption : null,
    status: (row.canva_status as IntegrationStatus) ?? "not_configured",
  };
}

function publicDemo(row: ProjectRow): PublicDemo | null {
  const url = typeof row.live_demo_url === "string" ? row.live_demo_url : null;
  if (!url) return null;
  return {
    url,
    label: typeof row.live_demo_label === "string" ? row.live_demo_label : null,
    type: (row.live_demo_type as PublicDemo["type"]) ?? "link",
    embedEnabled: asBoolean(row.live_demo_embed_enabled),
    status: (row.live_demo_status as IntegrationStatus) ?? "not_configured",
  };
}

export function toPublicProject(row: ProjectRow): PublicProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    titleEn: typeof row.title_en === "string" ? row.title_en : null,
    subtitle: String(row.subtitle ?? ""),
    subtitleEn: typeof row.subtitle_en === "string" ? row.subtitle_en : null,
    summary: String(row.summary ?? ""),
    summaryEn: typeof row.summary_en === "string" ? row.summary_en : null,
    problem: String(row.problem ?? ""),
    role: String(row.role ?? ""),
    decisions: stringList(row.decisions),
    modalities: stringList(row.modalities),
    process: stringList(row.process),
    outputs: stringList(row.outputs),
    stack: stringList(row.stack),
    limitations: stringList(row.limitations),
    category: row.category as ProjectCategory,
    year: String(row.year ?? ""),
    productStatus: row.product_status as ProjectStatus,
    publicationStatus: "published",
    featured: asBoolean(row.featured),
    sortOrder: asNumber(row.sort_order),
    media: parseJson<ProjectMedia[]>(row.media, []),
    videoUrl: typeof row.video_url === "string" ? row.video_url : null,
    github: publicGithub(row, false),
    canva: publicCanva(row),
    demo: publicDemo(row),
    experienceMode: (row.experience_mode as ExperienceMode) ?? "media-gallery",
    experienceConfig: parseJson<ExperienceConfig>(row.experience_config, {}),
    interactionSteps: parseJson<string[]>(row.interaction_steps, []),
    sourceEvidence: parseJson<PublicProject["sourceEvidence"]>(row.source_evidence, []),
    seo: parseJson<PublicProject["seo"]>(row.seo, {}),
    updatedAt: toIso(row.updated_at),
  };
}

export function toAdminProject(row: ProjectRow): AdminProject {
  const pub = toPublicProject({ ...row, publication_status: "published" });
  return {
    ...pub,
    publicationStatus: row.publication_status as PublicationStatus,
    githubUrl: typeof row.github_url === "string" ? row.github_url : null,
    githubOwner: typeof row.github_owner === "string" ? row.github_owner : null,
    githubRepo: typeof row.github_repo === "string" ? row.github_repo : null,
    githubBranch: typeof row.github_branch === "string" ? row.github_branch : null,
    githubSyncEnabled: asBoolean(row.github_sync_enabled),
    githubSyncStatus: (row.github_sync_status as IntegrationStatus) ?? "not_configured",
    githubLastSyncedAt: toIso(row.github_last_synced_at),
    githubMetadata: parseJson<GithubMetadata | null>(row.github_metadata, null),
    githubReadme: typeof row.github_readme === "string" ? row.github_readme : null,
    githubFileTree: parseJson<FileTreeNode[] | null>(row.github_file_tree, null),
    githubLanguages: parseJson<LanguageBytes | null>(row.github_languages, null),
    githubTopics: parseJson<string[] | null>(row.github_topics, null),
    githubLatestCommit: parseJson<PublicGithub["latestCommit"]>(row.github_latest_commit, null),
    githubIsPrivate: asBoolean(row.github_is_private),
    githubPublicApproved: asBoolean(row.github_public_approved),
    liveDemoError: typeof row.live_demo_error === "string" ? row.live_demo_error : null,
    canvaError: typeof row.canva_error === "string" ? row.canva_error : null,
    copyZh: parseJson<CopyLocale>(row.copy_zh, {}),
    copyEn: parseJson<CopyLocale>(row.copy_en, {}),
    createdAt: toIso(row.created_at),
    updatedBy: typeof row.updated_by === "string" ? row.updated_by : null,
    github: publicGithub(row, true),
    canvaLastSyncedAt: toIso(row.canva_last_synced_at),
    liveDemoLastVerifiedAt: toIso(row.live_demo_last_verified_at),
  };
}

export function toPublicArchive(row: ProjectRow): PublicArchiveItem {
  return {
    id: String(row.id),
    title: String(row.title),
    kind: String(row.kind),
    year: String(row.year ?? ""),
    summary: String(row.summary ?? ""),
    media: parseJson(row.media, null),
    href: typeof row.href === "string" ? row.href : null,
    originNote: String(row.origin_note ?? ""),
    canvaShareUrl: typeof row.canva_share_url === "string" ? row.canva_share_url : null,
    canvaEmbedUrl: typeof row.canva_embed_url === "string" ? row.canva_embed_url : null,
  };
}

export async function listPublishedProjects(sql: Sql): Promise<PublicProject[]> {
  const rows = await sql.query<ProjectRow>(
    `select * from projects where publication_status = 'published' order by featured desc, sort_order asc, title asc`,
  );
  return rows.map(toPublicProject);
}

export async function getPublishedProject(
  sql: Sql,
  slug: string,
): Promise<PublicProject | null> {
  const rows = await sql.query<ProjectRow>(
    `select * from projects where slug = $1 and publication_status = 'published' limit 1`,
    [slug],
  );
  return rows[0] ? toPublicProject(rows[0]) : null;
}

export async function listPublishedArchive(sql: Sql): Promise<PublicArchiveItem[]> {
  const rows = await sql.query<ProjectRow>(
    `select * from archive_items where publication_status = 'published' order by sort_order asc, title asc`,
  );
  return rows.map(toPublicArchive);
}

export async function getPublicSite(sql: Sql, fallback: PublicSite): Promise<PublicSite> {
  const rows = await sql.query<ProjectRow>(`select * from site_settings where id = 'default' limit 1`);
  if (!rows[0]) return fallback;
  const profile = parseJson(rows[0].profile, fallback.profile);
  const homepage = parseJson(rows[0].homepage, fallback.homepage);
  const seo = parseJson(rows[0].seo, fallback.seo);
  return { profile, homepage, seo };
}

export async function listAdminProjects(sql: Sql): Promise<AdminProject[]> {
  const rows = await sql.query<ProjectRow>(
    `select * from projects order by sort_order asc, updated_at desc`,
  );
  return rows.map(toAdminProject);
}

export async function getAdminProject(sql: Sql, id: string): Promise<AdminProject | null> {
  const rows = await sql.query<ProjectRow>(`select * from projects where id = $1 limit 1`, [id]);
  return rows[0] ? toAdminProject(rows[0]) : null;
}

export async function getAdminProjectBySlug(sql: Sql, slug: string): Promise<AdminProject | null> {
  const rows = await sql.query<ProjectRow>(`select * from projects where slug = $1 limit 1`, [slug]);
  return rows[0] ? toAdminProject(rows[0]) : null;
}

export async function listAdminArchive(sql: Sql): Promise<PublicArchiveItem[]> {
  const rows = await sql.query<ProjectRow>(
    `select * from archive_items order by sort_order asc, title asc`,
  );
  return rows.map(toPublicArchive);
}

export async function sitemapSlugs(sql: Sql): Promise<string[]> {
  const rows = await sql.query<{ slug: string }>(
    `select slug from projects where publication_status = 'published' order by sort_order asc`,
  );
  return rows.map((r) => r.slug);
}

export function stripPrivatePayload<T extends Record<string, unknown>>(row: T): T {
  const clone = { ...row };
  delete clone.payload_encrypted;
  return clone;
}

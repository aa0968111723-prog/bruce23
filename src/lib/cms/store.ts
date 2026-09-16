import type { Sql } from "../db.ts";
import { NotFoundError } from "./errors.ts";
import type { ArchiveInput, ArchiveLocaleCopy, ExperienceConfig, LocaleCopy, ProjectInput, SiteSettingsInput } from "./schema.ts";
import {
  asRecord,
  asStringArray,
  stripSecrets,
  type CanvaPublicSlice,
  type PublicProject,
} from "./privacy.ts";
import type { IntegrationStatus, LiveDemoType, PublicationStatus } from "./status.ts";
import { parseGithubUrl } from "../github/parse.ts";
import { canvaPersistFromFields, sanitizeStoredCanvaThumbnail } from "../canva/parse.ts";
import type { CanvaPersistShape } from "../canva/parse.ts";
import type { GithubFetchResult } from "../github/client.server.ts";
import { sanitizePublicHref } from "../safe-href.ts";
import { applyPublicLocale } from "./locale.ts";

export function jsonb(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseJson<T>(value: unknown, fallback: T): T {
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

export function iso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

export type ProjectRow = Record<string, unknown>;

export type AdminProject = ProjectInput & {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
  published_at: string | null;
};

export const PROJECT_COLUMNS = `
  id, slug, title, subtitle, category, year, product_status, publication_status,
  featured, sort_order, summary, problem, role, decisions, modalities, process,
  outputs, stack, limitations, media, locale_json, seo_title, seo_description,
  github_url, github_owner, github_repo, github_branch, github_sync_enabled,
  github_sync_status, github_last_synced_at, github_metadata, github_readme,
  github_file_tree, github_languages, github_topics, github_latest_commit,
  live_demo_url, live_demo_label, live_demo_type, live_demo_embed_enabled,
  live_demo_last_verified_at, live_demo_status, live_demo_error,
  canva_share_url, canva_embed_url, canva_design_id, canva_page_ids,
  canva_thumbnail_url, canva_status, canva_last_synced_at, canva_alt, canva_caption,
  canva_error, experience_mode, experience_config, interaction_steps, source_evidence,
  created_at, updated_at, updated_by, published_at
`;

function asStatus(value: unknown, fallback: IntegrationStatus): IntegrationStatus {
  const allowed = [
    "connected",
    "pending",
    "unavailable",
    "failed",
    "not_configured",
    "verified",
    "stale",
  ];
  return typeof value === "string" && allowed.includes(value)
    ? (value as IntegrationStatus)
    : fallback;
}

export function rowToAdminProject(row: ProjectRow): AdminProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ""),
    category: row.category as AdminProject["category"],
    year: String(row.year),
    product_status: row.product_status as AdminProject["product_status"],
    publication_status: row.publication_status as AdminProject["publication_status"],
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order ?? 0),
    summary: String(row.summary ?? ""),
    problem: String(row.problem ?? ""),
    role: String(row.role ?? ""),
    decisions: asStringArray(parseJson(row.decisions, [])),
    modalities: asStringArray(parseJson(row.modalities, [])),
    process: asStringArray(parseJson(row.process, [])),
    outputs: asStringArray(parseJson(row.outputs, [])),
    stack: asStringArray(parseJson(row.stack, [])),
    limitations: asStringArray(parseJson(row.limitations, [])),
    media: parseJson(row.media, []) as AdminProject["media"],
    locale_json: parseJson(row.locale_json, {}) as AdminProject["locale_json"],
    seo_title: (row.seo_title as string | null) ?? null,
    seo_description: (row.seo_description as string | null) ?? null,
    github_url: (row.github_url as string | null) ?? null,
    github_owner: (row.github_owner as string | null) ?? null,
    github_repo: (row.github_repo as string | null) ?? null,
    github_branch: (row.github_branch as string | null) ?? null,
    github_sync_enabled: row.github_sync_enabled !== false,
    github_sync_status: asStatus(row.github_sync_status, "not_configured"),
    github_last_synced_at: iso(row.github_last_synced_at),
    github_metadata: parseJson(row.github_metadata, null) as AdminProject["github_metadata"],
    github_readme: (row.github_readme as string | null) ?? null,
    github_file_tree: parseJson(row.github_file_tree, null) as AdminProject["github_file_tree"],
    github_languages: parseJson(row.github_languages, null) as AdminProject["github_languages"],
    github_topics: parseJson(row.github_topics, null) as AdminProject["github_topics"],
    github_latest_commit: parseJson(row.github_latest_commit, null) as AdminProject["github_latest_commit"],
    live_demo_url: (row.live_demo_url as string | null) ?? null,
    live_demo_label: (row.live_demo_label as string | null) ?? null,
    live_demo_type: (row.live_demo_type as AdminProject["live_demo_type"]) ?? null,
    live_demo_embed_enabled: Boolean(row.live_demo_embed_enabled),
    live_demo_last_verified_at: iso(row.live_demo_last_verified_at),
    live_demo_status: asStatus(row.live_demo_status, "not_configured"),
    live_demo_error: (row.live_demo_error as string | null) ?? null,
    canva_share_url: (row.canva_share_url as string | null) ?? null,
    canva_embed_url: (row.canva_embed_url as string | null) ?? null,
    canva_design_id: (row.canva_design_id as string | null) ?? null,
    canva_page_ids: parseJson(row.canva_page_ids, null) as AdminProject["canva_page_ids"],
    canva_thumbnail_url: (row.canva_thumbnail_url as string | null) ?? null,
    canva_status: asStatus(row.canva_status, "not_configured"),
    canva_last_synced_at: iso(row.canva_last_synced_at),
    canva_alt: (row.canva_alt as string | null) ?? null,
    canva_caption: (row.canva_caption as string | null) ?? null,
    canva_error: (row.canva_error as string | null) ?? null,
    experience_mode: (row.experience_mode as AdminProject["experience_mode"]) ?? null,
    experience_config: parseJson(row.experience_config, {}) as ExperienceConfig,
    interaction_steps: asStringArray(parseJson(row.interaction_steps, [])),
    source_evidence: parseJson(row.source_evidence, []) as AdminProject["source_evidence"],
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
    updated_by: (row.updated_by as string | null) ?? null,
    published_at: iso(row.published_at),
  };
}

export function serializePublicProject(admin: AdminProject): PublicProject {
  const meta = asRecord(admin.github_metadata);
  const isPrivate = meta.private === true;
  const githubOk = !isPrivate;
  const locale = (admin.locale_json ?? {}) as { zh?: LocaleCopy; en?: LocaleCopy };
  return stripSecrets(applyPublicLocale({
    id: admin.id,
    slug: admin.slug,
    title: admin.title,
    subtitle: admin.subtitle,
    category: admin.category,
    year: admin.year,
    productStatus: admin.product_status,
    featured: admin.featured,
    sortOrder: admin.sort_order,
    summary: admin.summary,
    problem: admin.problem,
    role: admin.role,
    decisions: admin.decisions,
    modalities: admin.modalities,
    process: admin.process,
    outputs: admin.outputs,
    stack: admin.stack,
    limitations: admin.limitations,
    media: admin.media,
    locale,
    seoTitle: admin.seo_title,
    seoDescription: admin.seo_description,
    experienceMode: admin.experience_mode ?? null,
    experienceConfig: admin.experience_config ?? {},
    interactionSteps: admin.interaction_steps,
    sourceEvidence: admin.source_evidence.map((item) => ({
      label: item.label,
      href: sanitizePublicHref(item.href),
      note: item.note,
      kind: item.kind,
    })),
    github: {
      url: githubOk ? (admin.github_url ?? null) : null,
      owner: githubOk ? (admin.github_owner ?? null) : null,
      repo: githubOk ? (admin.github_repo ?? null) : null,
      branch: githubOk ? (admin.github_branch ?? null) : null,
      syncStatus: admin.github_sync_status,
      lastSyncedAt: admin.github_last_synced_at ?? null,
      name: githubOk && typeof meta.name === "string" ? meta.name : undefined,
      description: githubOk ? (typeof meta.description === "string" ? meta.description : null) : undefined,
      languages: githubOk ? (admin.github_languages ?? undefined) : undefined,
      topics: githubOk ? (admin.github_topics ?? undefined) : undefined,
      latestCommit: githubOk ? (admin.github_latest_commit ?? undefined) : undefined,
      readme: githubOk ? (admin.github_readme ?? null) : null,
      fileTree: githubOk ? (admin.github_file_tree ?? undefined) : undefined,
      htmlUrl: githubOk && typeof meta.htmlUrl === "string" ? meta.htmlUrl : undefined,
      updatedAt: githubOk && typeof meta.updatedAt === "string" ? meta.updatedAt : undefined,
    },
    canva: {
      shareUrl: admin.canva_share_url ?? null,
      embedUrl: admin.canva_embed_url ?? null,
      designId: admin.canva_design_id ?? null,
      pageIds: admin.canva_page_ids ?? undefined,
      thumbnailUrl: admin.canva_thumbnail_url ?? null,
      status: admin.canva_status,
      lastSyncedAt: admin.canva_last_synced_at ?? null,
      alt: admin.canva_alt ?? null,
      caption: admin.canva_caption ?? null,
    },
    demo: {
      url: admin.live_demo_url ?? null,
      label: admin.live_demo_label ?? null,
      type: admin.live_demo_type ?? null,
      embedEnabled: admin.live_demo_embed_enabled,
      status: admin.live_demo_status,
      lastVerifiedAt: admin.live_demo_last_verified_at ?? null,
      error: admin.live_demo_error ?? null,
    },
  }));
}

export function toPublicProject(row: ProjectRow): PublicProject | null {
  if (row.publication_status !== "published") return null;
  return serializePublicProject(rowToAdminProject(row));
}

export function toPreviewProject(admin: AdminProject): PublicProject {
  return serializePublicProject(admin);
}

export async function listPublishedProjects(sql: Sql): Promise<PublicProject[]> {
  const rows = await sql.query<ProjectRow>(
    `select ${PROJECT_COLUMNS} from projects
     where publication_status = 'published'
     order by featured desc, sort_order asc, title asc`,
  );
  return rows.map(toPublicProject).filter((item): item is PublicProject => item !== null);
}

export async function getPublishedProject(sql: Sql, slug: string): Promise<PublicProject> {
  const rows = await sql.query<ProjectRow>(
    `select ${PROJECT_COLUMNS} from projects where slug = $1 and publication_status = 'published' limit 1`,
    [slug],
  );
  const project = rows[0] ? toPublicProject(rows[0]) : null;
  if (!project) throw new NotFoundError("找不到這件已發布作品。");
  return project;
}

export async function listAdminProjects(sql: Sql): Promise<AdminProject[]> {
  const rows = await sql.query<ProjectRow>(
    `select ${PROJECT_COLUMNS} from projects order by sort_order asc, title asc`,
  );
  return rows.map(rowToAdminProject);
}

export async function getAdminProject(sql: Sql, id: string): Promise<AdminProject> {
  const rows = await sql.query<ProjectRow>(
    `select ${PROJECT_COLUMNS} from projects where id = $1 limit 1`,
    [id],
  );
  if (!rows[0]) throw new NotFoundError("找不到這件作品。");
  return rowToAdminProject(rows[0]);
}

export async function getAdminProjectBySlug(sql: Sql, slug: string): Promise<AdminProject> {
  const rows = await sql.query<ProjectRow>(
    `select ${PROJECT_COLUMNS} from projects where slug = $1 limit 1`,
    [slug],
  );
  if (!rows[0]) throw new NotFoundError("找不到這件作品。");
  return rowToAdminProject(rows[0]);
}

async function insertRevision(
  sql: Sql,
  projectId: string,
  snapshot: unknown,
  note: string,
  actor: string,
): Promise<void> {
  await sql.query(
    `insert into project_revisions (id, project_id, snapshot, note, created_by)
     values ($1, $2, $3::jsonb, $4, $5)`,
    [crypto.randomUUID(), projectId, jsonb(snapshot), note, actor],
  );
}

function canvaStatusForPersist(
  shape: CanvaPersistShape,
  requested: IntegrationStatus | undefined,
): IntegrationStatus {
  if (requested === "verified" || requested === "connected") {
    if (shape.designId || shape.shareUrl) return "pending";
    return shape.statusHint === "failed" ? "failed" : "not_configured";
  }
  if (shape.designId) return requested === "unavailable" || requested === "failed" ? requested : "pending";
  if (shape.shareUrl) return requested === "unavailable" || requested === "failed" ? requested : "pending";
  if (shape.statusHint === "failed") return "failed";
  return requested ?? "not_configured";
}

function insertParams(input: ProjectInput, id: string, actor: string | null): unknown[] {
  const parsedGh = parseGithubUrl(input.github_url ?? undefined);
  const canvaShape = canvaPersistFromFields(input.canva_share_url, input.canva_embed_url);
  const canvaStatus = canvaStatusForPersist(canvaShape, input.canva_status);
  return [
    id,
    input.slug,
    input.title,
    input.subtitle,
    input.category,
    input.year,
    input.product_status,
    input.publication_status,
    input.featured,
    input.sort_order,
    input.summary,
    input.problem,
    input.role,
    jsonb(input.decisions),
    jsonb(input.modalities),
    jsonb(input.process),
    jsonb(input.outputs),
    jsonb(input.stack),
    jsonb(input.limitations),
    jsonb(input.media),
    jsonb(input.locale_json),
    input.seo_title ?? null,
    input.seo_description ?? null,
    parsedGh?.url ?? input.github_url ?? null,
    parsedGh?.owner ?? input.github_owner ?? null,
    parsedGh?.repo ?? input.github_repo ?? null,
    input.github_branch ?? null,
    input.github_sync_enabled,
    input.github_url ? input.github_sync_status : "not_configured",
    input.github_last_synced_at ?? null,
    jsonb(input.github_metadata ?? null),
    input.github_readme ?? null,
    jsonb(input.github_file_tree ?? null),
    jsonb(input.github_languages ?? null),
    jsonb(input.github_topics ?? null),
    jsonb(input.github_latest_commit ?? null),
    input.live_demo_url ?? null,
    input.live_demo_label ?? null,
    input.live_demo_type ?? null,
    input.live_demo_embed_enabled,
    input.live_demo_last_verified_at ?? null,
    input.live_demo_status,
    input.live_demo_error ?? null,
    canvaShape.shareUrl,
    canvaShape.embedUrl,
    canvaShape.designId,
    jsonb(input.canva_page_ids ?? null),
    sanitizeStoredCanvaThumbnail(input.canva_thumbnail_url),
    canvaStatus,
    input.canva_last_synced_at ?? null,
    input.canva_alt ?? null,
    input.canva_caption ?? null,
    input.canva_error ?? null,
    input.experience_mode ?? null,
    jsonb(input.experience_config ?? {}),
    jsonb(input.interaction_steps),
    jsonb(input.source_evidence),
    actor,
    input.publication_status === "published" ? new Date().toISOString() : null,
  ];
}

const INSERT_SQL = `insert into projects (
  id, slug, title, subtitle, category, year, product_status, publication_status,
  featured, sort_order, summary, problem, role, decisions, modalities, process,
  outputs, stack, limitations, media, locale_json, seo_title, seo_description,
  github_url, github_owner, github_repo, github_branch, github_sync_enabled,
  github_sync_status, github_last_synced_at, github_metadata, github_readme,
  github_file_tree, github_languages, github_topics, github_latest_commit,
  live_demo_url, live_demo_label, live_demo_type, live_demo_embed_enabled,
  live_demo_last_verified_at, live_demo_status, live_demo_error,
  canva_share_url, canva_embed_url, canva_design_id, canva_page_ids,
  canva_thumbnail_url, canva_status, canva_last_synced_at, canva_alt, canva_caption,
  canva_error, experience_mode, experience_config, interaction_steps, source_evidence,
  updated_by, published_at
) values (
  $1, $2, $3, $4, $5, $6, $7, $8,
  $9, $10, $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb,
  $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21::jsonb, $22, $23,
  $24, $25, $26, $27, $28,
  $29, $30, $31::jsonb, $32,
  $33::jsonb, $34::jsonb, $35::jsonb, $36::jsonb,
  $37, $38, $39, $40,
  $41, $42, $43,
  $44, $45, $46, $47::jsonb,
  $48, $49, $50, $51, $52,
  $53, $54, $55::jsonb, $56::jsonb, $57::jsonb,
  $58, $59
)`;

export async function createProjectRecord(
  sql: Sql,
  input: ProjectInput,
  actor: string,
): Promise<AdminProject> {
  const id = crypto.randomUUID();
  await sql.query(INSERT_SQL, insertParams(input, id, actor));
  const created = await getAdminProject(sql, id);
  await insertRevision(sql, id, created, "create", actor);
  return created;
}

const UPDATE_SQL = `update projects set
  slug = $2, title = $3, subtitle = $4, category = $5, year = $6, product_status = $7,
  publication_status = $8, featured = $9, sort_order = $10, summary = $11, problem = $12,
  role = $13, decisions = $14::jsonb, modalities = $15::jsonb, process = $16::jsonb,
  outputs = $17::jsonb, stack = $18::jsonb, limitations = $19::jsonb, media = $20::jsonb,
  locale_json = $21::jsonb, seo_title = $22, seo_description = $23,
  github_url = $24, github_owner = $25, github_repo = $26, github_branch = $27,
  github_sync_enabled = $28, github_sync_status = $29, github_last_synced_at = $30,
  github_metadata = $31::jsonb, github_readme = $32, github_file_tree = $33::jsonb,
  github_languages = $34::jsonb, github_topics = $35::jsonb, github_latest_commit = $36::jsonb,
  live_demo_url = $37, live_demo_label = $38, live_demo_type = $39, live_demo_embed_enabled = $40,
  live_demo_last_verified_at = $41, live_demo_status = $42, live_demo_error = $43,
  canva_share_url = $44, canva_embed_url = $45, canva_design_id = $46, canva_page_ids = $47::jsonb,
  canva_thumbnail_url = $48, canva_status = $49, canva_last_synced_at = $50, canva_alt = $51,
  canva_caption = $52, canva_error = $53, experience_mode = $54, experience_config = $55::jsonb,
  interaction_steps = $56::jsonb, source_evidence = $57::jsonb,
  updated_by = $58, published_at = $59, updated_at = now()
 where id = $1`;

export async function saveProjectRecord(
  sql: Sql,
  id: string,
  patch: Partial<ProjectInput>,
  actor: string,
  note = "save",
): Promise<AdminProject> {
  const current = await getAdminProject(sql, id);
  const next: ProjectInput = { ...current, ...patch, slug: patch.slug ?? current.slug };
  await insertRevision(sql, id, current, note, actor);
  await sql.query(UPDATE_SQL, insertParams(next, id, actor));
  return getAdminProject(sql, id);
}

export function demoTypeFromVerify(embedEnabled: boolean, url: string | null | undefined): LiveDemoType {
  if (!url?.trim()) return "unavailable";
  return embedEnabled ? "iframe" : "link";
}

export async function persistDemoVerify(
  sql: Sql,
  id: string,
  actor: string,
  input: {
    url?: string | null;
    status: IntegrationStatus;
    embedEnabled: boolean;
    error?: string | null;
  },
): Promise<AdminProject> {
  const current = await getAdminProject(sql, id);
  const url = (input.url?.trim() || current.live_demo_url || "").trim() || null;
  const type = demoTypeFromVerify(input.embedEnabled, url);
  await sql.query(
    `update projects set live_demo_url = $2, live_demo_type = $3, live_demo_status = $4,
      live_demo_embed_enabled = $5, live_demo_error = $6, live_demo_last_verified_at = now(),
      updated_by = $7, updated_at = now() where id = $1`,
    [id, url, type, input.status, input.embedEnabled, input.error ?? null, actor],
  );
  return getAdminProject(sql, id);
}

export async function setPublication(
  sql: Sql,
  id: string,
  status: PublicationStatus,
  actor: string,
): Promise<AdminProject> {
  const current = await getAdminProject(sql, id);
  await insertRevision(sql, id, current, status, actor);
  const publishedAt =
    status === "published" ? new Date().toISOString() : status === "draft" ? null : current.published_at;
  await sql.query(
    `update projects set publication_status = $2, published_at = $3, updated_at = now(), updated_by = $4 where id = $1`,
    [id, status, publishedAt, actor],
  );
  return getAdminProject(sql, id);
}

export async function listRevisions(sql: Sql, projectId: string) {
  const rows = await sql.query<{
    id: string;
    note: string | null;
    created_at: string | Date;
    created_by: string | null;
  }>(
    `select id, note, created_at, created_by from project_revisions where project_id = $1 order by created_at desc limit 40`,
    [projectId],
  );
  return rows.map((row) => ({
    id: String(row.id),
    note: row.note,
    created_at: iso(row.created_at) ?? "",
    created_by: row.created_by,
  }));
}

export async function restoreRevision(
  sql: Sql,
  projectId: string,
  revisionId: string,
  actor: string,
): Promise<AdminProject> {
  const rows = await sql.query<{ snapshot: unknown }>(
    `select snapshot from project_revisions where id = $1 and project_id = $2 limit 1`,
    [revisionId, projectId],
  );
  if (!rows[0]) throw new NotFoundError("找不到這筆修訂。");
  const snapshot = parseJson<AdminProject>(rows[0].snapshot, null as unknown as AdminProject);
  if (!snapshot?.slug) throw new NotFoundError("修訂內容損壞。");
  const { id: _id, created_at: _c, updated_at: _u, updated_by: _b, published_at: _p, ...rest } = snapshot;
  return saveProjectRecord(sql, projectId, rest, actor, `restore:${revisionId}`);
}

export function githubIncomingFromFetch(result: GithubFetchResult, currentUrl: string) {
  const parsed = parseGithubUrl(currentUrl);
  return {
    github_url: parsed?.url ?? currentUrl,
    github_owner: result.owner ?? parsed?.owner ?? null,
    github_repo: result.repo ?? parsed?.repo ?? null,
    github_branch: result.branch,
    github_sync_status: result.status,
    github_metadata: result.metadata
      ? {
          name: result.metadata.name,
          description: result.metadata.description,
          homepage: result.metadata.homepage,
          defaultBranch: result.metadata.defaultBranch,
          updatedAt: result.metadata.updatedAt,
          pushedAt: result.metadata.pushedAt,
          private: result.metadata.private,
          archived: result.metadata.archived,
          htmlUrl: result.metadata.htmlUrl,
          language: result.metadata.language,
          syncError: result.error,
          errorCode: result.errorCode,
        }
      : { syncError: result.error, errorCode: result.errorCode },
    github_readme: result.ok ? (result.readme ?? null) : undefined,
    github_file_tree: result.ok && result.fileTree !== undefined ? result.fileTree : undefined,
    github_languages: result.ok ? (result.languages ?? null) : undefined,
    github_topics: result.ok ? (result.topics ?? null) : undefined,
    github_latest_commit: result.ok ? (result.latestCommit ?? null) : undefined,
  };
}

export async function applyGithubSync(
  sql: Sql,
  id: string,
  result: GithubFetchResult,
  actor: string,
): Promise<AdminProject> {
  const current = await getAdminProject(sql, id);
  await insertRevision(sql, id, current, "github-sync", actor);
  const incoming = githubIncomingFromFetch(result, current.github_url ?? "");
  const keepReadme = incoming.github_readme === undefined ? current.github_readme : incoming.github_readme;
  const keepTree =
    incoming.github_file_tree === undefined ? current.github_file_tree : incoming.github_file_tree;
  const keepLang =
    incoming.github_languages === undefined ? current.github_languages : incoming.github_languages;
  const keepTopics = incoming.github_topics === undefined ? current.github_topics : incoming.github_topics;
  const keepCommit =
    incoming.github_latest_commit === undefined ? current.github_latest_commit : incoming.github_latest_commit;
  await sql.query(
    `update projects set
      github_url = $2, github_owner = $3, github_repo = $4, github_branch = $5,
      github_sync_status = $6, github_last_synced_at = now(),
      github_metadata = $7::jsonb, github_readme = $8, github_file_tree = $9::jsonb,
      github_languages = $10::jsonb, github_topics = $11::jsonb, github_latest_commit = $12::jsonb,
      updated_at = now(), updated_by = $13
     where id = $1`,
    [
      id,
      incoming.github_url,
      incoming.github_owner,
      incoming.github_repo,
      incoming.github_branch?.trim() ? incoming.github_branch : current.github_branch,
      incoming.github_sync_status,
      jsonb(incoming.github_metadata),
      keepReadme,
      jsonb(keepTree ?? null),
      jsonb(keepLang ?? null),
      jsonb(keepTopics ?? null),
      jsonb(keepCommit ?? null),
      actor,
    ],
  );
  return getAdminProject(sql, id);
}

export type PublicArchiveItem = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  media: PublicProject["media"][number] | null;
  href: string | null;
  originNote: string;
  locale: { zh?: ArchiveLocaleCopy; en?: ArchiveLocaleCopy };
  canva: CanvaPublicSlice;
};

export async function listPublishedArchive(sql: Sql): Promise<PublicArchiveItem[]> {
  const rows = await sql.query<ProjectRow>(
    `select * from archive_items where publication_status = 'published' order by sort_order asc, title asc`,
  );
  return rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    kind: String(row.kind),
    year: String(row.year),
    summary: String(row.summary ?? ""),
    media: parseJson<PublicProject["media"][number] | null>(row.media, null),
    href: sanitizePublicHref(row.href as string | null) ?? null,
    originNote: String(row.origin_note ?? ""),
    locale: parseJson<PublicArchiveItem["locale"]>(row.locale_json, {}),
    canva: {
      shareUrl: (row.canva_share_url as string | null) ?? null,
      embedUrl: (row.canva_embed_url as string | null) ?? null,
      designId: (row.canva_design_id as string | null) ?? null,
      pageIds: parseJson<string[] | null>(row.canva_page_ids, null) ?? undefined,
      thumbnailUrl: (row.canva_thumbnail_url as string | null) ?? null,
      status: asStatus(row.canva_status, "not_configured"),
      lastSyncedAt: iso(row.canva_last_synced_at),
      alt: (row.canva_alt as string | null) ?? null,
      caption: (row.canva_caption as string | null) ?? null,
    },
  }));
}

export type AdminArchiveItem = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  media: PublicProject["media"][number] | null;
  href: string | null;
  origin_note: string;
  publication_status: PublicationStatus;
  sort_order: number;
  locale_json: { zh?: ArchiveLocaleCopy; en?: ArchiveLocaleCopy };
  canva_share_url: string | null;
  canva_embed_url: string | null;
  canva_design_id: string | null;
  canva_page_ids: string[] | null;
  canva_thumbnail_url: string | null;
  canva_status: IntegrationStatus;
  canva_alt: string | null;
  canva_caption: string | null;
};

export async function listAdminArchive(sql: Sql): Promise<AdminArchiveItem[]> {
  const rows = await sql.query<ProjectRow>(`select * from archive_items order by sort_order asc, title asc`);
  return rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    kind: String(row.kind),
    year: String(row.year),
    summary: String(row.summary ?? ""),
    media: parseJson<PublicProject["media"][number] | null>(row.media, null),
    href: (row.href as string | null) ?? null,
    origin_note: String(row.origin_note ?? ""),
    publication_status:
      row.publication_status === "draft" || row.publication_status === "archived" ? row.publication_status : "published",
    sort_order: Number(row.sort_order ?? 0),
    locale_json: parseJson<AdminArchiveItem["locale_json"]>(row.locale_json, {}),
    canva_share_url: (row.canva_share_url as string | null) ?? null,
    canva_embed_url: (row.canva_embed_url as string | null) ?? null,
    canva_design_id: (row.canva_design_id as string | null) ?? null,
    canva_page_ids: parseJson<string[] | null>(row.canva_page_ids, null),
    canva_thumbnail_url: (row.canva_thumbnail_url as string | null) ?? null,
    canva_status: asStatus(row.canva_status, "not_configured"),
    canva_alt: (row.canva_alt as string | null) ?? null,
    canva_caption: (row.canva_caption as string | null) ?? null,
  }));
}

export async function upsertArchive(
  sql: Sql,
  input: Omit<ArchiveInput, "locale_json"> & { id?: string; locale_json?: ArchiveInput["locale_json"] },
  actor: string,
) {
  const id = input.id ?? crypto.randomUUID();
  const canvaShape = canvaPersistFromFields(input.canva_share_url, input.canva_embed_url);
  const canvaStatus = canvaStatusForPersist(canvaShape, input.canva_status);
  await sql.query(
    `insert into archive_items (
      id, slug, title, kind, year, summary, media, href, origin_note, publication_status, sort_order,
      canva_share_url, canva_embed_url, canva_design_id, canva_page_ids, canva_thumbnail_url,
      canva_status, canva_alt, canva_caption, locale_json, updated_by
    ) values (
      $1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,
      $12,$13,$14,$15::jsonb,$16,$17,$18,$19,$20::jsonb,$21
    )
    on conflict (id) do update set
      slug = excluded.slug, title = excluded.title, kind = excluded.kind, year = excluded.year,
      summary = excluded.summary, media = excluded.media, href = excluded.href,
      origin_note = excluded.origin_note, publication_status = excluded.publication_status,
      sort_order = excluded.sort_order, canva_share_url = excluded.canva_share_url,
      canva_embed_url = excluded.canva_embed_url, canva_design_id = excluded.canva_design_id,
      canva_page_ids = excluded.canva_page_ids, canva_thumbnail_url = excluded.canva_thumbnail_url,
      canva_status = excluded.canva_status, canva_alt = excluded.canva_alt,
      canva_caption = excluded.canva_caption, locale_json = excluded.locale_json,
      updated_at = now(), updated_by = excluded.updated_by`,
    [
      id,
      input.slug,
      input.title,
      input.kind,
      input.year,
      input.summary,
      jsonb(input.media ?? null),
      input.href ?? null,
      input.origin_note,
      input.publication_status,
      input.sort_order,
      canvaShape.shareUrl,
      canvaShape.embedUrl,
      canvaShape.designId,
      jsonb(input.canva_page_ids ?? null),
      sanitizeStoredCanvaThumbnail(input.canva_thumbnail_url),
      canvaStatus,
      input.canva_alt ?? null,
      input.canva_caption ?? null,
      jsonb(input.locale_json ?? {}),
      actor,
    ],
  );
  return id;
}

export type SiteSettingsRow = {
  name_zh: string;
  name_en: string;
  person: string;
  role: string;
  headline: string;
  subhead: string;
  narrative: string;
  email: string;
  github: string;
  github_handle: string;
  location: string;
  seo_title: string | null;
  seo_description: string | null;
  homepage_json: SiteSettingsInput["homepage_json"];
  locale_json: SiteSettingsInput["locale_json"];
  updated_at: string | null;
  updated_by: string | null;
};

export async function getSiteSettings(sql: Sql): Promise<SiteSettingsRow | null> {
  const rows = await sql.query<ProjectRow>(
    `select * from site_settings where id = 'default' limit 1`,
  );
  const row = rows[0];
  if (!row) return null;
  return {
    name_zh: String(row.name_zh),
    name_en: String(row.name_en),
    person: String(row.person),
    role: String(row.role),
    headline: String(row.headline),
    subhead: String(row.subhead),
    narrative: String(row.narrative),
    email: String(row.email),
    github: String(row.github),
    github_handle: String(row.github_handle),
    location: String(row.location),
    seo_title: (row.seo_title as string | null) ?? null,
    seo_description: (row.seo_description as string | null) ?? null,
    homepage_json: parseJson<SiteSettingsInput["homepage_json"]>(row.homepage_json, {}),
    locale_json: parseJson<SiteSettingsInput["locale_json"]>(row.locale_json, {}),
    updated_at: iso(row.updated_at),
    updated_by: (row.updated_by as string | null) ?? null,
  };
}

export async function saveSiteSettings(sql: Sql, input: SiteSettingsInput, actor: string) {
  const current = await getSiteSettings(sql);
  const locale_json = {
    zh: { ...(current?.locale_json?.zh ?? {}), ...(input.locale_json?.zh ?? {}) },
    en: { ...(current?.locale_json?.en ?? {}), ...(input.locale_json?.en ?? {}) },
  };
  await sql.query(
    `insert into site_settings (
      id, name_zh, name_en, person, role, headline, subhead, narrative, email, github, github_handle,
      location, seo_title, seo_description, homepage_json, locale_json, updated_by
    ) values (
      'default', $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16
    )
    on conflict (id) do update set
      name_zh = excluded.name_zh, name_en = excluded.name_en, person = excluded.person,
      role = excluded.role, headline = excluded.headline, subhead = excluded.subhead,
      narrative = excluded.narrative, email = excluded.email, github = excluded.github,
      github_handle = excluded.github_handle, location = excluded.location,
      seo_title = excluded.seo_title, seo_description = excluded.seo_description,
      homepage_json = excluded.homepage_json, locale_json = excluded.locale_json,
      updated_at = now(), updated_by = excluded.updated_by`,
    [
      input.name_zh,
      input.name_en,
      input.person,
      input.role,
      input.headline,
      input.subhead,
      input.narrative,
      input.email,
      input.github,
      input.github_handle,
      input.location,
      input.seo_title ?? null,
      input.seo_description ?? null,
      jsonb(input.homepage_json ?? {}),
      jsonb(locale_json),
      actor,
    ],
  );
  return getSiteSettings(sql);
}

export async function countProjects(sql: Sql): Promise<number> {
  const rows = await sql.query<{ n: number }>(`select count(*)::int as n from projects`);
  return Number(rows[0]?.n ?? 0);
}

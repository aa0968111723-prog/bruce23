import type { ArchiveWrite, ProjectWrite } from "./schema.ts";
import type { Sql } from "./sql.ts";
import { jsonParam } from "./sql.ts";
import { asArray, asObject, type ProjectRow, toPublicArchive, toPublicProject } from "./public.ts";
import type { PublicationStatus } from "./constants.ts";
import { INTEGRATION_PATCH_KEYS, isSafeSqlIdent } from "./patch-keys.ts";

export function newId(): string {
  return crypto.randomUUID();
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true";
}

export function normalizeProjectRow(row: Record<string, unknown>): ProjectRow {
  return {
    ...row,
    id: String(row.id),
    slug: String(row.slug),
    publication_status: String(row.publication_status),
    featured: asBool(row.featured),
    github_sync_enabled: asBool(row.github_sync_enabled),
    live_demo_embed_enabled: asBool(row.live_demo_embed_enabled),
    github_metadata: asObject(row.github_metadata),
    github_file_tree: asArray(row.github_file_tree),
    github_languages: asObject(row.github_languages),
    github_topics: asArray(row.github_topics),
    github_latest_commit: row.github_latest_commit ?? null,
    decisions_json: asArray(row.decisions_json),
    modalities_json: asArray(row.modalities_json),
    process_json: asArray(row.process_json),
    outputs_json: asArray(row.outputs_json),
    stack_json: asArray(row.stack_json),
    limitations_json: asArray(row.limitations_json),
    media_json: asArray(row.media_json),
    source_evidence: asArray(row.source_evidence),
    seo_json: asObject(row.seo_json),
    experience_config: asObject(row.experience_config),
    interaction_steps: asArray(row.interaction_steps),
    canva_page_ids: asArray(row.canva_page_ids),
  };
}

const PROJECT_SELECT = `select * from projects`;

export async function listPublishedProjects(sql: Sql) {
  const rows = await sql.query<Record<string, unknown>>(
    `${PROJECT_SELECT} where publication_status = $1 order by featured desc, sort_order asc, title asc`,
    ["published"],
  );
  return rows
    .map(normalizeProjectRow)
    .map(toPublicProject)
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export async function getPublishedProject(sql: Sql, slug: string) {
  const rows = await sql.query<Record<string, unknown>>(
    `${PROJECT_SELECT} where slug = $1 and publication_status = $2 limit 1`,
    [slug, "published"],
  );
  const row = rows[0] ? normalizeProjectRow(rows[0]) : null;
  return row ? toPublicProject(row) : null;
}

export async function listAdminProjects(sql: Sql) {
  const rows = await sql.query<Record<string, unknown>>(
    `${PROJECT_SELECT} order by sort_order asc, updated_at desc`,
  );
  return rows.map(normalizeProjectRow);
}

export async function getAdminProject(sql: Sql, idOrSlug: string) {
  const rows = await sql.query<Record<string, unknown>>(
    `${PROJECT_SELECT} where id = $1 or slug = $1 limit 1`,
    [idOrSlug],
  );
  return rows[0] ? normalizeProjectRow(rows[0]) : null;
}

export async function getProjectBySlugAny(sql: Sql, slug: string) {
  const rows = await sql.query<Record<string, unknown>>(
    `${PROJECT_SELECT} where slug = $1 limit 1`,
    [slug],
  );
  return rows[0] ? normalizeProjectRow(rows[0]) : null;
}

function writeColumns(input: ProjectWrite) {
  return {
    slug: input.slug,
    title: input.title,
    title_en: input.title_en ?? null,
    subtitle: input.subtitle,
    subtitle_en: input.subtitle_en ?? null,
    category: input.category,
    year: input.year,
    product_status: input.product_status,
    featured: input.featured,
    sort_order: input.sort_order,
    summary: input.summary,
    summary_en: input.summary_en ?? null,
    problem: input.problem,
    problem_en: input.problem_en ?? null,
    role: input.role,
    role_en: input.role_en ?? null,
    decisions_json: jsonParam(input.decisions),
    modalities_json: jsonParam(input.modalities),
    process_json: jsonParam(input.process),
    outputs_json: jsonParam(input.outputs),
    stack_json: jsonParam(input.stack),
    limitations_json: jsonParam(input.limitations),
    media_json: jsonParam(input.media),
    source_evidence: jsonParam(input.source_evidence),
    seo_json: jsonParam(input.seo ?? {}),
    github_url: input.github_url ?? null,
    github_owner: input.github_owner ?? null,
    github_repo: input.github_repo ?? null,
    github_branch: input.github_branch ?? null,
    github_sync_enabled: input.github_sync_enabled,
    live_demo_url: input.live_demo_url ?? null,
    live_demo_label: input.live_demo_label ?? null,
    live_demo_type: input.live_demo_type ?? null,
    live_demo_embed_enabled: input.live_demo_embed_enabled,
    canva_share_url: input.canva_share_url ?? null,
    canva_embed_url: input.canva_embed_url ?? null,
    canva_design_id: input.canva_design_id ?? null,
    canva_page_ids: jsonParam(input.canva_page_ids),
    canva_thumbnail_url: input.canva_thumbnail_url ?? null,
    canva_alt: input.canva_alt ?? null,
    canva_caption: input.canva_caption ?? null,
    experience_mode: input.experience_mode,
    experience_config: jsonParam(input.experience_config),
    interaction_steps: jsonParam(input.interaction_steps),
    experience_label: input.experience_label ?? null,
  };
}

export async function createProject(
  sql: Sql,
  input: ProjectWrite,
  actorId: string,
) {
  const id = newId();
  const publication = input.publication_status ?? "draft";
  const cols = writeColumns(input);
  await sql.query(
    `insert into projects (
      id, slug, title, title_en, subtitle, subtitle_en, category, year,
      product_status, publication_status, featured, sort_order,
      summary, summary_en, problem, problem_en, role, role_en,
      decisions_json, modalities_json, process_json, outputs_json,
      stack_json, limitations_json, media_json, source_evidence, seo_json,
      github_url, github_owner, github_repo, github_branch, github_sync_enabled,
      live_demo_url, live_demo_label, live_demo_type, live_demo_embed_enabled,
      canva_share_url, canva_embed_url, canva_design_id, canva_page_ids,
      canva_thumbnail_url, canva_alt, canva_caption,
      experience_mode, experience_config, interaction_steps, experience_label,
      published_at
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,
      $13,$14,$15,$16,$17,$18,
      $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,
      $23::jsonb,$24::jsonb,$25::jsonb,$26::jsonb,$27::jsonb,
      $28,$29,$30,$31,$32,
      $33,$34,$35,$36,
      $37,$38,$39,$40::jsonb,
      $41,$42,$43,
      $44,$45::jsonb,$46::jsonb,$47,
      $48
    )`,
    [
      id,
      cols.slug,
      cols.title,
      cols.title_en,
      cols.subtitle,
      cols.subtitle_en,
      cols.category,
      cols.year,
      cols.product_status,
      publication,
      cols.featured,
      cols.sort_order,
      cols.summary,
      cols.summary_en,
      cols.problem,
      cols.problem_en,
      cols.role,
      cols.role_en,
      cols.decisions_json,
      cols.modalities_json,
      cols.process_json,
      cols.outputs_json,
      cols.stack_json,
      cols.limitations_json,
      cols.media_json,
      cols.source_evidence,
      cols.seo_json,
      cols.github_url,
      cols.github_owner,
      cols.github_repo,
      cols.github_branch,
      cols.github_sync_enabled,
      cols.live_demo_url,
      cols.live_demo_label,
      cols.live_demo_type,
      cols.live_demo_embed_enabled,
      cols.canva_share_url,
      cols.canva_embed_url,
      cols.canva_design_id,
      cols.canva_page_ids,
      cols.canva_thumbnail_url,
      cols.canva_alt,
      cols.canva_caption,
      cols.experience_mode,
      cols.experience_config,
      cols.interaction_steps,
      cols.experience_label,
      publication === "published" ? new Date().toISOString() : null,
    ],
  );
  await insertRevision(sql, id, actorId, "create");
  return getAdminProject(sql, id);
}

const UPDATE_SQL = `update projects set
  slug=$2, title=$3, title_en=$4, subtitle=$5, subtitle_en=$6, category=$7, year=$8,
  product_status=$9, featured=$10, sort_order=$11,
  summary=$12, summary_en=$13, problem=$14, problem_en=$15, role=$16, role_en=$17,
  decisions_json=$18::jsonb, modalities_json=$19::jsonb, process_json=$20::jsonb,
  outputs_json=$21::jsonb, stack_json=$22::jsonb, limitations_json=$23::jsonb,
  media_json=$24::jsonb, source_evidence=$25::jsonb, seo_json=$26::jsonb,
  github_url=$27, github_owner=$28, github_repo=$29, github_branch=$30, github_sync_enabled=$31,
  live_demo_url=$32, live_demo_label=$33, live_demo_type=$34, live_demo_embed_enabled=$35,
  canva_share_url=$36, canva_embed_url=$37, canva_design_id=$38, canva_page_ids=$39::jsonb,
  canva_thumbnail_url=$40, canva_alt=$41, canva_caption=$42,
  experience_mode=$43, experience_config=$44::jsonb, interaction_steps=$45::jsonb,
  experience_label=$46, updated_at=now()
  where id=$1`;

export async function updateProject(
  sql: Sql,
  id: string,
  input: ProjectWrite,
  actorId: string,
  note = "save",
) {
  const existing = await getAdminProject(sql, id);
  if (!existing) return null;
  const cols = writeColumns(input);
  await sql.query(UPDATE_SQL, [
    id,
    cols.slug,
    cols.title,
    cols.title_en,
    cols.subtitle,
    cols.subtitle_en,
    cols.category,
    cols.year,
    cols.product_status,
    cols.featured,
    cols.sort_order,
    cols.summary,
    cols.summary_en,
    cols.problem,
    cols.problem_en,
    cols.role,
    cols.role_en,
    cols.decisions_json,
    cols.modalities_json,
    cols.process_json,
    cols.outputs_json,
    cols.stack_json,
    cols.limitations_json,
    cols.media_json,
    cols.source_evidence,
    cols.seo_json,
    cols.github_url,
    cols.github_owner,
    cols.github_repo,
    cols.github_branch,
    cols.github_sync_enabled,
    cols.live_demo_url,
    cols.live_demo_label,
    cols.live_demo_type,
    cols.live_demo_embed_enabled,
    cols.canva_share_url,
    cols.canva_embed_url,
    cols.canva_design_id,
    cols.canva_page_ids,
    cols.canva_thumbnail_url,
    cols.canva_alt,
    cols.canva_caption,
    cols.experience_mode,
    cols.experience_config,
    cols.interaction_steps,
    cols.experience_label,
  ]);
  await insertRevision(sql, id, actorId, note);
  return getAdminProject(sql, id);
}

export async function setPublication(
  sql: Sql,
  id: string,
  status: PublicationStatus,
  actorId: string,
) {
  const existing = await getAdminProject(sql, id);
  if (!existing) return null;
  const publishedAt =
    status === "published" ? new Date().toISOString() : existing.published_at;
  const archivedAt = status === "archived" ? new Date().toISOString() : null;
  await sql.query(
    `update projects set publication_status=$2, published_at=$3, archived_at=$4, updated_at=now() where id=$1`,
    [id, status, publishedAt, archivedAt],
  );
  await insertRevision(sql, id, actorId, status);
  return getAdminProject(sql, id);
}

export async function insertRevision(
  sql: Sql,
  projectId: string,
  actorId: string,
  note: string,
) {
  const row = await getAdminProject(sql, projectId);
  if (!row) return;
  await sql.query(
    `insert into project_revisions (id, project_id, snapshot, note, created_by)
     values ($1,$2,$3::jsonb,$4,$5)`,
    [newId(), projectId, jsonParam(row), note, actorId],
  );
}

export async function listRevisions(sql: Sql, projectId: string) {
  return sql.query<{
    id: string;
    note: string | null;
    created_at: string;
    created_by: string | null;
  }>(
    `select id, note, created_at, created_by from project_revisions
     where project_id = $1 order by created_at desc limit 40`,
    [projectId],
  );
}

export async function getRevision(sql: Sql, revisionId: string) {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from project_revisions where id = $1 limit 1`,
    [revisionId],
  );
  return rows[0] ?? null;
}

export async function restoreRevision(
  sql: Sql,
  projectId: string,
  revisionId: string,
  actorId: string,
) {
  const revision = await getRevision(sql, revisionId);
  if (!revision || String(revision.project_id) !== projectId) return null;
  const snapshot = asObject(revision.snapshot);
  const keys = Object.keys(snapshot).filter(
    (key) =>
      ![
        "id",
        "created_at",
        "updated_at",
        "published_at",
        "archived_at",
      ].includes(key),
  );
  if (keys.length === 0) return getAdminProject(sql, projectId);
  const assignments = keys.map((key, i) => `${key}=$${i + 2}`).join(", ");
  const values = keys.map((key) => {
    const value = snapshot[key];
    if (value && typeof value === "object") return jsonParam(value);
    return value ?? null;
  });
  await sql.query(
    `update projects set ${assignments}, updated_at=now() where id=$1`,
    [projectId, ...values],
  );
  await insertRevision(sql, projectId, actorId, `restore:${revisionId}`);
  return getAdminProject(sql, projectId);
}

export async function listPublishedArchive(sql: Sql) {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from archive_items where publication_status = $1 order by sort_order asc, title asc`,
    ["published"],
  );
  return rows
    .map(toPublicArchive)
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export async function listAdminArchive(sql: Sql) {
  return sql.query<Record<string, unknown>>(
    `select * from archive_items order by sort_order asc, title asc`,
  );
}

export async function upsertArchive(sql: Sql, input: ArchiveWrite) {
  const id = input.id ?? newId();
  await sql.query(
    `insert into archive_items (
      id, title, kind, year, summary, media_json, href, origin_note,
      canva_share_url, canva_embed_url, publication_status, sort_order, updated_at
    ) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,now())
    on conflict (id) do update set
      title=excluded.title, kind=excluded.kind, year=excluded.year,
      summary=excluded.summary, media_json=excluded.media_json, href=excluded.href,
      origin_note=excluded.origin_note, canva_share_url=excluded.canva_share_url,
      canva_embed_url=excluded.canva_embed_url, publication_status=excluded.publication_status,
      sort_order=excluded.sort_order, updated_at=now()`,
    [
      id,
      input.title,
      input.kind,
      input.year,
      input.summary,
      jsonParam(input.media ?? null),
      input.href ?? null,
      input.origin_note,
      input.canva_share_url ?? null,
      input.canva_embed_url ?? null,
      input.publication_status,
      input.sort_order,
    ],
  );
  const rows = await sql.query<Record<string, unknown>>(
    `select * from archive_items where id = $1`,
    [id],
  );
  return rows[0];
}

export async function getSiteSettings(sql: Sql) {
  const rows = await sql.query<Record<string, unknown>>(
    `select * from site_settings where id = $1`,
    ["default"],
  );
  return rows[0] ?? null;
}

export async function saveSiteSettings(
  sql: Sql,
  input: {
    profile: unknown;
    homepage: unknown;
    seo: unknown;
    i18n: unknown;
  },
  actorId: string,
) {
  await sql.query(
    `insert into site_settings (id, profile_json, homepage_json, seo_json, i18n_json, updated_by, updated_at)
     values ('default', $1::jsonb, $2::jsonb, $3::jsonb, $4::jsonb, $5, now())
     on conflict (id) do update set
       profile_json=excluded.profile_json,
       homepage_json=excluded.homepage_json,
       seo_json=excluded.seo_json,
       i18n_json=excluded.i18n_json,
       updated_by=excluded.updated_by,
       updated_at=now()`,
    [
      jsonParam(input.profile),
      jsonParam(input.homepage),
      jsonParam(input.seo),
      jsonParam(input.i18n),
      actorId,
    ],
  );
  return getSiteSettings(sql);
}

export async function applyGithubPatch(
  sql: Sql,
  id: string,
  patch: Record<string, unknown>,
  actorId: string,
  note = "github-sync",
) {
  const assignments: string[] = [];
  const values: unknown[] = [id];
  for (const [key, value] of Object.entries(patch)) {
    if (!isSafeSqlIdent(key) || !INTEGRATION_PATCH_KEYS.has(key)) continue;
    values.push(
      value && typeof value === "object" ? jsonParam(value) : (value ?? null),
    );
    const idx = values.length;
    const asJson =
      value && typeof value === "object" ? `$${idx}::jsonb` : `$${idx}`;
    assignments.push(`${key}=${asJson}`);
  }
  if (assignments.length === 0) return getAdminProject(sql, id);
  await sql.query(
    `update projects set ${assignments.join(", ")}, updated_at=now() where id=$1`,
    values,
  );
  await insertRevision(sql, id, actorId, note);
  return getAdminProject(sql, id);
}

export async function applyIntegrationPatch(
  sql: Sql,
  id: string,
  patch: Record<string, unknown>,
  actorId: string,
  note: string,
) {
  return applyGithubPatch(sql, id, patch, actorId, note);
}

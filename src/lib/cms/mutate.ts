import type { Sql } from "../db";
import { parseJson } from "./json.ts";
import { projectMutationSchema, type ProjectMutation } from "./schema.ts";
import { parseGithubRepoUrl } from "../github/parse.ts";
import { parseCanvaShareUrl, parseCanvaEmbedSnippet } from "../canva/urls.ts";
import { getAdminProject } from "./queries.ts";
import { randomUUID } from "node:crypto";

const UPDATE_COLUMNS: Array<keyof ProjectMutation | "github_owner" | "github_repo"> = [
  "slug",
  "title",
  "title_en",
  "subtitle",
  "subtitle_en",
  "summary",
  "summary_en",
  "problem",
  "role",
  "decisions",
  "modalities",
  "process",
  "outputs",
  "stack",
  "limitations",
  "category",
  "year",
  "product_status",
  "featured",
  "sort_order",
  "cover_image",
  "media",
  "video_url",
  "github_url",
  "github_branch",
  "github_sync_enabled",
  "github_public_approved",
  "live_demo_url",
  "live_demo_label",
  "live_demo_type",
  "live_demo_embed_enabled",
  "canva_share_url",
  "canva_embed_url",
  "canva_design_id",
  "canva_page_ids",
  "canva_thumbnail_url",
  "canva_alt",
  "canva_caption",
  "experience_mode",
  "experience_config",
  "interaction_steps",
  "source_evidence",
  "seo",
  "copy_zh",
  "copy_en",
];

const JSON_FIELDS = new Set([
  "decisions",
  "modalities",
  "process",
  "outputs",
  "stack",
  "limitations",
  "media",
  "canva_page_ids",
  "experience_config",
  "interaction_steps",
  "source_evidence",
  "seo",
  "copy_zh",
  "copy_en",
]);

export function normalizeMutation(input: unknown): ProjectMutation {
  const parsed = projectMutationSchema.parse(input);
  if (parsed.github_url) {
    const gh = parseGithubRepoUrl(parsed.github_url);
    if (!gh) {
      throw new Error("GitHub 網址不是 github.com 上的儲存庫");
    }
    parsed.github_owner = gh.owner;
    parsed.github_repo = gh.repo;
    parsed.github_url = gh.htmlUrl;
  }
  if (parsed.canva_share_url) {
    const fromSnippet = parseCanvaEmbedSnippet(parsed.canva_share_url);
    const canva = parseCanvaShareUrl(fromSnippet ?? parsed.canva_share_url);
    if (!canva) throw new Error("Canva 連結必須是 canva.com 網域");
    parsed.canva_share_url = canva.shareUrl;
    parsed.canva_embed_url = parsed.canva_embed_url
      ? parseCanvaShareUrl(parsed.canva_embed_url)?.embedUrl ?? canva.embedUrl
      : canva.embedUrl;
    parsed.canva_design_id = parsed.canva_design_id || canva.designId;
  } else if (parsed.canva_embed_url) {
    const canva = parseCanvaShareUrl(parsed.canva_embed_url);
    if (!canva) throw new Error("Canva 嵌入網址必須是 canva.com 網域");
    parsed.canva_embed_url = canva.embedUrl;
  }
  return parsed;
}

export async function insertRevision(
  sql: Sql,
  projectId: string,
  actor: string,
  note: string,
) {
  const rows = await sql.query(`select * from projects where id = $1`, [projectId]);
  if (!rows[0]) return;
  await sql.query(
    `insert into project_revisions (id, project_id, snapshot, note, created_by) values ($1,$2,$3::jsonb,$4,$5)`,
    [randomUUID(), projectId, JSON.stringify(rows[0]), note, actor],
  );
}

export async function createProject(
  sql: Sql,
  input: unknown,
  actor: string,
) {
  const data = normalizeMutation(input);
  const id = `proj_${data.slug}`;
  const dup = await sql.query(`select id from projects where slug = $1 or id = $2`, [
    data.slug,
    id,
  ]);
  if (dup.length > 0) throw new Error("這個 slug 已存在");
  await sql.query(
    `insert into projects (
      id, slug, title, subtitle, summary, category, year,
      product_status, publication_status, featured, sort_order,
      experience_mode, created_by, updated_by
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10,$11,$12,$12)`,
    [
      id,
      data.slug,
      data.title,
      data.subtitle ?? "",
      data.summary ?? "",
      data.category,
      data.year ?? "",
      data.product_status,
      data.featured ?? false,
      data.sort_order ?? 0,
      data.experience_mode,
      actor,
    ],
  );
  await saveProject(sql, id, data, actor, "建立草稿");
  return getAdminProject(sql, id);
}

export async function saveProject(
  sql: Sql,
  id: string,
  input: unknown,
  actor: string,
  note = "儲存草稿",
) {
  const data = normalizeMutation(input);
  const current = await sql.query(`select id from projects where id = $1`, [id]);
  if (!current[0]) throw new Error("找不到專案");
  await insertRevision(sql, id, actor, note);

  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const record = data as Record<string, unknown> & {
    github_owner?: string | null;
    github_repo?: string | null;
  };
  for (const col of UPDATE_COLUMNS) {
    if (!(col in record)) continue;
    let value = record[col];
    if (JSON_FIELDS.has(col)) value = JSON.stringify(value ?? null);
    sets.push(`${col} = $${i}${JSON_FIELDS.has(col) ? "::jsonb" : ""}`);
    params.push(value ?? null);
    i += 1;
  }
  if (record.github_owner) {
    sets.push(`github_owner = $${i++}`);
    params.push(record.github_owner);
  }
  if (record.github_repo) {
    sets.push(`github_repo = $${i++}`);
    params.push(record.github_repo);
  }
  if (record.canva_share_url || record.canva_embed_url) {
    sets.push(`canva_status = $${i++}`);
    params.push("pending");
  }
  sets.push(`updated_at = now()`);
  sets.push(`updated_by = $${i++}`);
  params.push(actor);
  params.push(id);
  await sql.query(
    `update projects set ${sets.join(", ")} where id = $${i}`,
    params,
  );
  return getAdminProject(sql, id);
}

export async function setPublication(
  sql: Sql,
  id: string,
  status: "draft" | "published" | "unpublished" | "archived",
  actor: string,
) {
  await insertRevision(sql, id, actor, `publication:${status}`);
  await sql.query(
    `update projects set publication_status = $1, updated_at = now(), updated_by = $2 where id = $3`,
    [status, actor, id],
  );
  return getAdminProject(sql, id);
}

const RESTORE_COLUMNS = [
  "slug",
  "title",
  "title_en",
  "subtitle",
  "subtitle_en",
  "summary",
  "summary_en",
  "problem",
  "role",
  "decisions",
  "modalities",
  "process",
  "outputs",
  "stack",
  "limitations",
  "category",
  "year",
  "product_status",
  "publication_status",
  "featured",
  "sort_order",
  "cover_image",
  "media",
  "video_url",
  "github_url",
  "github_owner",
  "github_repo",
  "github_branch",
  "github_sync_enabled",
  "github_sync_status",
  "github_last_synced_at",
  "github_metadata",
  "github_readme",
  "github_file_tree",
  "github_languages",
  "github_topics",
  "github_latest_commit",
  "github_is_private",
  "github_public_approved",
  "live_demo_url",
  "live_demo_label",
  "live_demo_type",
  "live_demo_embed_enabled",
  "live_demo_last_verified_at",
  "live_demo_status",
  "live_demo_error",
  "canva_share_url",
  "canva_embed_url",
  "canva_design_id",
  "canva_page_ids",
  "canva_thumbnail_url",
  "canva_alt",
  "canva_caption",
  "canva_status",
  "canva_last_synced_at",
  "canva_error",
  "experience_mode",
  "experience_config",
  "interaction_steps",
  "source_evidence",
  "seo",
  "copy_zh",
  "copy_en",
] as const;

const RESTORE_JSON = new Set([
  "decisions",
  "modalities",
  "process",
  "outputs",
  "stack",
  "limitations",
  "media",
  "github_metadata",
  "github_file_tree",
  "github_languages",
  "github_topics",
  "github_latest_commit",
  "canva_page_ids",
  "experience_config",
  "interaction_steps",
  "source_evidence",
  "seo",
  "copy_zh",
  "copy_en",
]);

export async function restoreRevision(sql: Sql, projectId: string, revisionId: string, actor: string) {
  const rows = await sql.query<{ snapshot: unknown }>(
    `select snapshot from project_revisions where id = $1 and project_id = $2`,
    [revisionId, projectId],
  );
  if (!rows[0]) throw new Error("找不到版本");
  const snap = parseJson<Record<string, unknown>>(rows[0].snapshot, {});
  await insertRevision(sql, projectId, actor, "還原版本");
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  for (const col of RESTORE_COLUMNS) {
    if (!(col in snap)) continue;
    let value = snap[col];
    if (RESTORE_JSON.has(col) && value !== null && typeof value === "object") {
      value = JSON.stringify(value);
      sets.push(`${col} = $${i}::jsonb`);
    } else {
      sets.push(`${col} = $${i}`);
    }
    params.push(value ?? null);
    i += 1;
  }
  sets.push(`updated_at = now()`);
  sets.push(`updated_by = $${i++}`);
  params.push(actor);
  params.push(projectId);
  await sql.query(`update projects set ${sets.join(", ")} where id = $${i}`, params);
  return getAdminProject(sql, projectId);
}

export async function listRevisions(sql: Sql, projectId: string) {
  return sql.query<{ id: string; note: string | null; created_at: string; created_by: string | null }>(
    `select id, note, created_at, created_by from project_revisions where project_id = $1 order by created_at desc limit 30`,
    [projectId],
  );
}

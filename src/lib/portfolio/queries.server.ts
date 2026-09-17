import { randomUUID } from "node:crypto";
import { getSql, type Sql } from "@/lib/db";
import { assertAdminAccess } from "./admin-access";
import { parseCanvaInput } from "./canva-url";
import { canvaConnectConfigured, canvaModeLabel, clearCanvaTokens, testCanvaEmbed } from "./canva.server";
import { canEncryptSecrets } from "./crypto.server";
import { verifyLiveDemo } from "./demo.server";
import { fetchGithubSnapshot, githubDiff } from "./github.server";
import { annotateFileTree, parseGithubUrl, readmeFetchState } from "./github-url";
import { jsonParam, rowToAdminProject, rowToArchive } from "./mapping";
import { toPublicArchive, toPublicProject } from "./privacy";
import type { ArchiveWrite, ProjectCreate, ProjectUpdate, SiteSettingsWrite } from "./schema";
import { SEED_KEY, seedArchive, seedProjects, seedSiteSettings } from "./seed-data";
import type { AdminProject, JsonObject, PublicArchiveItem, PublicProject, PublicSiteSettings } from "./types";

async function sqlClient(): Promise<Sql> {
  return getSql();
}

export async function ensureSeeded(sql?: Sql): Promise<{ inserted: boolean; projectCount: number }> {
  const db = sql ?? (await sqlClient());
  const claimed = await db.query<{ seed_key: string }>(
    "insert into cms_seed_log (seed_key) values ($1) on conflict (seed_key) do nothing returning seed_key",
    [SEED_KEY],
  );
  const site = seedSiteSettings();
  await db.query(
    `insert into site_settings (
      id, name_zh, name_en, person, role, headline, subhead, narrative, email, github, github_handle, location, seo_title, seo_description, homepage_content, locale_zh, locale_en
    ) values ('default',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16::jsonb)
    on conflict (id) do nothing`,
    [
      site.nameZh,
      site.nameEn,
      site.person,
      site.role,
      site.headline,
      site.subhead,
      site.narrative,
      site.email,
      site.github,
      site.githubHandle,
      site.location,
      site.seoTitle,
      site.seoDescription,
      jsonParam(site.homepageContent),
      jsonParam(site.localeZh),
      jsonParam(site.localeEn),
    ],
  );

  if (claimed[0]) {
    for (const project of seedProjects()) {
      await insertProjectRow(db, null, project, project.id);
    }
    for (const item of seedArchive()) {
      await insertArchiveRow(db, null, item, item.id);
    }
  } else {
    for (const project of seedProjects()) {
      await insertProjectRow(db, null, project, project.id, true);
    }
    for (const item of seedArchive()) {
      await insertArchiveRow(db, null, item, item.id, true);
    }
  }
  const count = await db.query<{ n: number }>("select count(*)::int as n from projects");
  return { inserted: Boolean(claimed[0]), projectCount: count[0]?.n ?? 0 };
}

async function insertProjectRow(
  db: Sql,
  ownerUserId: string | null,
  data: ProjectCreate,
  id: string,
  ignoreConflict = false,
) {
  const parsed = data.githubUrl ? parseGithubUrl(data.githubUrl) : null;
  const conflict = ignoreConflict
    ? "on conflict (slug) do nothing"
    : "on conflict (slug) do nothing";
  await db.query(
    `insert into projects (
      id, slug, owner_user_id, title, subtitle, category, year, product_status, featured, sort_order,
      summary, problem, role, decisions, modalities, process, outputs, stack, limitations, media, source_evidence,
      locale_zh, locale_en, seo_title, seo_description, publication_status, published_at,
      github_url, github_owner, github_repo, github_branch, github_sync_enabled,
      live_demo_url, live_demo_label, live_demo_type, live_demo_embed_enabled,
      canva_share_url, canva_embed_url, canva_design_id, canva_page_ids, canva_thumbnail_url, canva_alt, canva_description,
      experience_mode, experience_config, interaction_steps
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14::jsonb,$15::jsonb,$16::jsonb,$17::jsonb,$18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,
      $22::jsonb,$23::jsonb,$24,$25,$26, case when $26 = 'published' then now() else null end,
      $27,$28,$29,$30,$31,
      $32,$33,$34,$35,
      $36,$37,$38,$39::jsonb,$40,$41,$42,
      $43,$44::jsonb,$45::jsonb
    ) ${conflict}`,
    [
      id,
      data.slug,
      ownerUserId,
      data.title,
      data.subtitle,
      data.category,
      data.year,
      data.productStatus,
      data.featured,
      data.sortOrder,
      data.summary,
      data.problem,
      data.role,
      jsonParam(data.decisions),
      jsonParam(data.modalities),
      jsonParam(data.process),
      jsonParam(data.outputs),
      jsonParam(data.stack),
      jsonParam(data.limitations),
      jsonParam(data.media),
      jsonParam(data.sourceEvidence),
      jsonParam(data.localeZh),
      jsonParam(data.localeEn),
      data.seoTitle ?? null,
      data.seoDescription ?? null,
      data.publicationStatus,
      parsed?.url ?? data.githubUrl ?? null,
      parsed?.owner ?? data.githubOwner ?? null,
      parsed?.repo ?? data.githubRepo ?? null,
      data.githubBranch ?? null,
      data.githubSyncEnabled,
      data.liveDemoUrl ?? null,
      data.liveDemoLabel ?? null,
      data.liveDemoType ?? null,
      data.liveDemoEmbedEnabled,
      data.canvaShareUrl ?? null,
      data.canvaEmbedUrl ?? null,
      data.canvaDesignId ?? null,
      jsonParam(data.canvaPageIds),
      data.canvaThumbnailUrl ?? null,
      data.canvaAlt ?? null,
      data.canvaDescription ?? null,
      data.experienceMode ?? null,
      jsonParam(data.experienceConfig),
      jsonParam(data.interactionSteps),
    ],
  );
}

async function insertArchiveRow(
  db: Sql,
  ownerUserId: string | null,
  data: ArchiveWrite,
  id: string | undefined,
  ignoreConflict = false,
) {
  const itemId = id ?? randomUUID();
  await db.query(
    `insert into archive_items (
      id, owner_user_id, title, kind, year, summary, media, href, origin_note, publication_status, sort_order,
      canva_share_url, canva_embed_url, canva_design_id, canva_thumbnail_url
    ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15)
    ${ignoreConflict ? "on conflict (id) do nothing" : "on conflict (id) do nothing"}`,
    [
      itemId,
      ownerUserId,
      data.title,
      data.kind,
      data.year,
      data.summary,
      data.media ? jsonParam(data.media) : null,
      data.href ?? null,
      data.originNote,
      data.publicationStatus,
      data.sortOrder,
      data.canvaShareUrl ?? null,
      data.canvaEmbedUrl ?? null,
      data.canvaDesignId ?? null,
      data.canvaThumbnailUrl ?? null,
    ],
  );
  return itemId;
}

export async function listPublishedProjects(): Promise<PublicProject[]> {
  const db = await sqlClient();
  await ensureSeeded(db);
  const rows = await db.query(
    "select * from projects where publication_status = 'published' order by featured desc, sort_order asc, title asc",
  );
  return rows
    .map((row) => toPublicProject(rowToAdminProject(row)))
    .filter((item): item is PublicProject => Boolean(item));
}

export async function getPublishedProject(slug: string): Promise<PublicProject | null> {
  const db = await sqlClient();
  await ensureSeeded(db);
  const rows = await db.query("select * from projects where slug = $1 and publication_status = 'published'", [slug]);
  if (!rows[0]) return null;
  return toPublicProject(rowToAdminProject(rows[0]));
}

export async function listPublishedArchive(): Promise<PublicArchiveItem[]> {
  const db = await sqlClient();
  await ensureSeeded(db);
  const rows = await db.query(
    "select * from archive_items where publication_status = 'published' order by sort_order asc, title asc",
  );
  return rows
    .map((row) => toPublicArchive(rowToArchive(row)))
    .filter((item): item is PublicArchiveItem => Boolean(item));
}

export async function getPublicSite(): Promise<PublicSiteSettings> {
  const db = await sqlClient();
  await ensureSeeded(db);
  const rows = await db.query<Record<string, unknown>>("select * from site_settings where id = 'default'");
  const row = rows[0] ?? {};
  return {
    nameZh: String(row.name_zh ?? ""),
    nameEn: String(row.name_en ?? ""),
    person: String(row.person ?? ""),
    role: String(row.role ?? ""),
    headline: String(row.headline ?? ""),
    subhead: String(row.subhead ?? ""),
    narrative: String(row.narrative ?? ""),
    email: String(row.email ?? ""),
    github: String(row.github ?? ""),
    githubHandle: String(row.github_handle ?? ""),
    location: String(row.location ?? ""),
    seoTitle: typeof row.seo_title === "string" ? row.seo_title : null,
    seoDescription: typeof row.seo_description === "string" ? row.seo_description : null,
    homepageContent:
      row.homepage_content && typeof row.homepage_content === "object"
        ? (row.homepage_content as JsonObject)
        : {},
    localeZh:
      row.locale_zh && typeof row.locale_zh === "object" ? (row.locale_zh as JsonObject) : {},
    localeEn:
      row.locale_en && typeof row.locale_en === "object" ? (row.locale_en as JsonObject) : {},
  };
}

export async function listPublicSitemap(): Promise<string[]> {
  const projects = await listPublishedProjects();
  return ["/", "/work", "/archive", "/about", ...projects.map((p) => `/work/${p.slug}`)];
}

async function lookupEmail(db: Sql, userId: string): Promise<string | null> {
  const rows = await db.query<{ email: string }>(`select email from "user" where id = $1`, [userId]);
  return rows[0]?.email ?? null;
}

export async function requireAdminUser(userId: string) {
  const db = await sqlClient();
  const email = await lookupEmail(db, userId);
  return { ...assertAdminAccess({ email }), userId, db };
}

export async function listAdminProjects(userId: string): Promise<AdminProject[]> {
  const { db } = await requireAdminUser(userId);
  await ensureSeeded(db);
  const rows = await db.query("select * from projects order by sort_order asc, updated_at desc");
  return rows.map((row) => rowToAdminProject(row));
}

export async function getAdminProject(userId: string, id: string): Promise<AdminProject | null> {
  const { db } = await requireAdminUser(userId);
  const rows = await db.query("select * from projects where id = $1", [id]);
  return rows[0] ? rowToAdminProject(rows[0]) : null;
}

async function snapshotRevision(db: Sql, projectId: string, editorUserId: string, note?: string) {
  const rows = await db.query("select * from projects where id = $1", [projectId]);
  if (!rows[0]) return;
  await db.query(
    "insert into project_revisions (id, project_id, editor_user_id, snapshot, note) values ($1,$2,$3,$4::jsonb,$5)",
    [randomUUID(), projectId, editorUserId, jsonParam(rows[0]), note ?? null],
  );
}

export async function createAdminProject(userId: string, data: ProjectCreate): Promise<AdminProject> {
  const { db } = await requireAdminUser(userId);
  await ensureSeeded(db);
  const id = randomUUID();
  if (data.githubUrl && !parseGithubUrl(data.githubUrl)) {
    throw new Error("GitHub URL must look like https://github.com/owner/repo");
  }
  if (data.canvaShareUrl || data.canvaEmbedUrl) {
    const parsed = parseCanvaInput(data.canvaEmbedUrl || data.canvaShareUrl || "");
    if (!parsed.ok) throw new Error(parsed.error);
  }
  await insertProjectRow(db, userId, data, id);
  await snapshotRevision(db, id, userId, "create");
  const created = await db.query("select * from projects where id = $1", [id]);
  return rowToAdminProject(created[0]!);
}

export async function updateAdminProject(userId: string, data: ProjectUpdate): Promise<AdminProject> {
  const { db } = await requireAdminUser(userId);
  const existing = await db.query("select * from projects where id = $1", [data.id]);
  if (!existing[0]) throw new Error("Project not found");
  await snapshotRevision(db, data.id, userId, "save");
  if (data.githubUrl && !parseGithubUrl(data.githubUrl)) {
    throw new Error("GitHub URL must look like https://github.com/owner/repo");
  }
  const parsedGh = data.githubUrl ? parseGithubUrl(data.githubUrl) : null;
  const canvaInput = data.canvaEmbedUrl || data.canvaShareUrl;
  const parsedCanva = canvaInput ? parseCanvaInput(canvaInput) : null;
  if (canvaInput && parsedCanva && !parsedCanva.ok) throw new Error(parsedCanva.error);

  const current = rowToAdminProject(existing[0]);
  const next = {
    slug: data.slug ?? current.slug,
    title: data.title ?? current.title,
    subtitle: data.subtitle ?? current.subtitle,
    category: data.category ?? current.category,
    year: data.year ?? current.year,
    productStatus: data.productStatus ?? current.productStatus,
    featured: data.featured ?? current.featured,
    sortOrder: data.sortOrder ?? current.sortOrder,
    summary: data.summary ?? current.summary,
    problem: data.problem ?? current.problem,
    role: data.role ?? current.role,
    decisions: data.decisions ?? current.decisions,
    modalities: data.modalities ?? current.modalities,
    process: data.process ?? current.process,
    outputs: data.outputs ?? current.outputs,
    stack: data.stack ?? current.stack,
    limitations: data.limitations ?? current.limitations,
    media: data.media ?? current.media,
    sourceEvidence: data.sourceEvidence ?? current.sourceEvidence,
    localeZh: data.localeZh ?? current.localeZh,
    localeEn: data.localeEn ?? current.localeEn,
    seoTitle: data.seoTitle === undefined ? current.seoTitle : data.seoTitle,
    seoDescription: data.seoDescription === undefined ? current.seoDescription : data.seoDescription,
    githubUrl: data.githubUrl === undefined ? current.github?.url ?? null : data.githubUrl,
    githubOwner: parsedGh?.owner ?? data.githubOwner ?? current.github?.owner ?? null,
    githubRepo: parsedGh?.repo ?? data.githubRepo ?? current.github?.repo ?? null,
    githubBranch: data.githubBranch ?? current.github?.branch ?? null,
    githubSyncEnabled: data.githubSyncEnabled ?? current.githubSyncEnabled,
    liveDemoUrl: data.liveDemoUrl === undefined ? current.liveDemo?.url ?? null : data.liveDemoUrl,
    liveDemoLabel: data.liveDemoLabel ?? current.liveDemo?.label ?? null,
    liveDemoType: data.liveDemoType ?? current.liveDemo?.type ?? null,
    liveDemoEmbedEnabled: data.liveDemoEmbedEnabled ?? current.liveDemo?.embedEnabled ?? false,
    canvaShareUrl:
      data.canvaShareUrl === undefined
        ? (current.canva?.shareUrl ?? null)
        : data.canvaShareUrl === null
          ? null
          : parsedCanva && parsedCanva.ok
            ? parsedCanva.value.shareUrl
            : data.canvaShareUrl,
    canvaEmbedUrl:
      data.canvaEmbedUrl === undefined && data.canvaShareUrl === undefined
        ? (current.canva?.embedUrl ?? null)
        : data.canvaShareUrl === null && data.canvaEmbedUrl == null
          ? null
          : parsedCanva && parsedCanva.ok
            ? parsedCanva.value.embedUrl
            : (data.canvaEmbedUrl ?? null),
    canvaDesignId:
      data.canvaShareUrl === null && data.canvaEmbedUrl == null
        ? null
        : parsedCanva && parsedCanva.ok
          ? parsedCanva.value.designId
          : (data.canvaDesignId ?? current.canva?.designId ?? null),
    canvaPageIds: data.canvaPageIds ?? current.canva?.pageIds ?? [],
    canvaThumbnailUrl: data.canvaThumbnailUrl ?? current.canva?.thumbnailUrl ?? null,
    canvaAlt: data.canvaAlt ?? current.canva?.alt ?? null,
    canvaDescription: data.canvaDescription ?? current.canva?.description ?? null,
    experienceMode: data.experienceMode === undefined ? current.experienceMode : data.experienceMode,
    experienceConfig: data.experienceConfig ?? current.experienceConfig,
    interactionSteps: data.interactionSteps ?? current.interactionSteps,
  };

  await db.query(
    `update projects set
      slug=$2, title=$3, subtitle=$4, category=$5, year=$6, product_status=$7, featured=$8, sort_order=$9,
      summary=$10, problem=$11, role=$12, decisions=$13::jsonb, modalities=$14::jsonb, process=$15::jsonb,
      outputs=$16::jsonb, stack=$17::jsonb, limitations=$18::jsonb, media=$19::jsonb, source_evidence=$20::jsonb,
      locale_zh=$21::jsonb, locale_en=$22::jsonb, seo_title=$23, seo_description=$24,
      github_url=$25, github_owner=$26, github_repo=$27, github_branch=$28, github_sync_enabled=$29,
      live_demo_url=$30, live_demo_label=$31, live_demo_type=$32, live_demo_embed_enabled=$33,
      canva_share_url=$34, canva_embed_url=$35, canva_design_id=$36, canva_page_ids=$37::jsonb,
      canva_thumbnail_url=$38, canva_alt=$39, canva_description=$40,
      experience_mode=$41, experience_config=$42::jsonb, interaction_steps=$43::jsonb,
      updated_at=now()
     where id=$1`,
    [
      data.id,
      next.slug,
      next.title,
      next.subtitle,
      next.category,
      next.year,
      next.productStatus,
      next.featured,
      next.sortOrder,
      next.summary,
      next.problem,
      next.role,
      jsonParam(next.decisions),
      jsonParam(next.modalities),
      jsonParam(next.process),
      jsonParam(next.outputs),
      jsonParam(next.stack),
      jsonParam(next.limitations),
      jsonParam(next.media),
      jsonParam(next.sourceEvidence),
      jsonParam(next.localeZh),
      jsonParam(next.localeEn),
      next.seoTitle,
      next.seoDescription,
      next.githubUrl,
      next.githubOwner,
      next.githubRepo,
      next.githubBranch,
      next.githubSyncEnabled,
      next.liveDemoUrl,
      next.liveDemoLabel,
      next.liveDemoType,
      next.liveDemoEmbedEnabled,
      next.canvaShareUrl,
      next.canvaEmbedUrl,
      next.canvaDesignId,
      jsonParam(next.canvaPageIds),
      next.canvaThumbnailUrl,
      next.canvaAlt,
      next.canvaDescription,
      next.experienceMode,
      jsonParam(next.experienceConfig),
      jsonParam(next.interactionSteps),
    ],
  );
  const rows = await db.query("select * from projects where id = $1", [data.id]);
  return rowToAdminProject(rows[0]!);
}

export async function setPublication(
  userId: string,
  id: string,
  status: "draft" | "published" | "unpublished" | "archived",
  note?: string,
) {
  const { db } = await requireAdminUser(userId);
  await snapshotRevision(db, id, userId, note ?? status);
  await db.query(
    `update projects set publication_status=$2,
      published_at = case when $2 = 'published' then now() else published_at end,
      archived_at = case when $2 = 'archived' then now() else archived_at end,
      updated_at=now()
     where id=$1`,
    [id, status],
  );
  const rows = await db.query("select * from projects where id = $1", [id]);
  return rowToAdminProject(rows[0]!);
}

export async function listRevisions(userId: string, projectId: string) {
  const { db } = await requireAdminUser(userId);
  return db.query<{ id: string; created_at: string; note: string | null; editor_user_id: string }>(
    "select id, created_at, note, editor_user_id from project_revisions where project_id = $1 order by created_at desc limit 40",
    [projectId],
  );
}

export async function restoreRevision(userId: string, projectId: string, revisionId: string) {
  const { db } = await requireAdminUser(userId);
  const rev = await db.query<{ snapshot: Record<string, unknown> }>(
    "select snapshot from project_revisions where id = $1 and project_id = $2",
    [revisionId, projectId],
  );
  if (!rev[0]) throw new Error("Revision not found");
  await snapshotRevision(db, projectId, userId, `restore:${revisionId}`);
  const snap = rev[0].snapshot;
  const cols = Object.keys(snap).filter((key) => key !== "id" && key !== "updated_at");
  if (cols.length === 0) throw new Error("Empty revision");
  const assignments = cols.map((col, i) => `${col} = $${i + 2}`).join(", ");
  const values = cols.map((col) => {
    const value = snap[col];
    if (value && typeof value === "object") return jsonParam(value);
    return value;
  });
  await db.query(`update projects set ${assignments}, updated_at=now() where id=$1`, [projectId, ...values]);
  const rows = await db.query("select * from projects where id = $1", [projectId]);
  return rowToAdminProject(rows[0]!);
}

export async function saveSiteSettings(userId: string, data: SiteSettingsWrite) {
  const { db } = await requireAdminUser(userId);
  await db.query(
    `update site_settings set
      owner_user_id=$1, name_zh=$2, name_en=$3, person=$4, role=$5, headline=$6, subhead=$7, narrative=$8,
      email=$9, github=$10, github_handle=$11, location=$12, seo_title=$13, seo_description=$14,
      homepage_content=$15::jsonb, locale_zh=$16::jsonb, locale_en=$17::jsonb, updated_at=now()
     where id='default'`,
    [
      userId,
      data.nameZh,
      data.nameEn,
      data.person,
      data.role,
      data.headline,
      data.subhead,
      data.narrative,
      data.email,
      data.github,
      data.githubHandle,
      data.location,
      data.seoTitle ?? null,
      data.seoDescription ?? null,
      jsonParam(data.homepageContent),
      jsonParam(data.localeZh),
      jsonParam(data.localeEn),
    ],
  );
  return getPublicSite();
}

export async function listAdminArchive(userId: string) {
  const { db } = await requireAdminUser(userId);
  await ensureSeeded(db);
  const rows = await db.query("select * from archive_items order by sort_order asc");
  return rows.map((row) => rowToArchive(row));
}

export async function upsertArchive(userId: string, data: ArchiveWrite) {
  const { db } = await requireAdminUser(userId);
  const id = data.id ?? randomUUID();
  await db.query(
    `insert into archive_items (
      id, owner_user_id, title, kind, year, summary, media, href, origin_note, publication_status, sort_order,
      canva_share_url, canva_embed_url, canva_design_id, canva_thumbnail_url, updated_at
    ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15, now())
    on conflict (id) do update set
      title=excluded.title, kind=excluded.kind, year=excluded.year, summary=excluded.summary, media=excluded.media,
      href=excluded.href, origin_note=excluded.origin_note, publication_status=excluded.publication_status,
      sort_order=excluded.sort_order, canva_share_url=excluded.canva_share_url, canva_embed_url=excluded.canva_embed_url,
      canva_design_id=excluded.canva_design_id, canva_thumbnail_url=excluded.canva_thumbnail_url, updated_at=now()`,
    [
      id,
      userId,
      data.title,
      data.kind,
      data.year,
      data.summary,
      data.media ? jsonParam(data.media) : null,
      data.href ?? null,
      data.originNote,
      data.publicationStatus,
      data.sortOrder,
      data.canvaShareUrl ?? null,
      data.canvaEmbedUrl ?? null,
      data.canvaDesignId ?? null,
      data.canvaThumbnailUrl ?? null,
    ],
  );
  const rows = await db.query("select * from archive_items where id = $1", [id]);
  return rowToArchive(rows[0]!);
}

export async function previewGithubSync(userId: string, projectId: string) {
  const project = await getAdminProject(userId, projectId);
  if (!project?.github?.url) {
    return { ok: false as const, error: "GitHub URL is not configured", changingFields: [] };
  }
  const { db } = await requireAdminUser(userId);
  const snap = await fetchGithubSnapshot(db, project.github.url);
  if (!snap.ok) {
    return {
      ok: false as const,
      error: snap.error,
      rateLimited: snap.rateLimited,
      lastSyncedAt: project.github.lastSyncedAt,
      changingFields: [],
    };
  }
  const current = {
    branch: project.github.branch ?? undefined,
    metadata: project.github.metadata ?? undefined,
    languages: project.github.languages ?? undefined,
    topics: project.github.topics,
    latestCommit: project.github.latestCommit ?? undefined,
    readmeSummary: project.github.readmeSummary ?? undefined,
    fileTree: project.github.fileTree,
  };
  return {
    ok: true as const,
    lastSyncedAt: project.github.lastSyncedAt,
    changingFields: githubDiff(current, snap.data),
    incoming: {
      name: snap.data.metadata.name,
      description: snap.data.metadata.description,
      branch: snap.data.branch,
      updatedAt: snap.data.metadata.updatedAt,
      topics: snap.data.topics,
      latestCommit: snap.data.latestCommit,
      isPrivate: snap.data.isPrivate,
    },
    preservesNarrative: true,
  };
}

export async function applyGithubSync(userId: string, projectId: string) {
  const project = await getAdminProject(userId, projectId);
  if (!project?.github?.url) throw new Error("GitHub URL is not configured");
  const { db } = await requireAdminUser(userId);
  await snapshotRevision(db, projectId, userId, "github-sync");
  const snap = await fetchGithubSnapshot(db, project.github.url);
  if (!snap.ok) {
    await db.query(
      "update projects set github_sync_status=$2, github_sync_error=$3, updated_at=now() where id=$1",
      [projectId, snap.rateLimited ? "failed" : snap.status, snap.error],
    );
    return { ok: false as const, error: snap.error, rateLimited: snap.rateLimited };
  }
  await db.query(
    `update projects set
      github_owner=$2, github_repo=$3, github_branch=$4, github_sync_status=$5, github_last_synced_at=now(),
      github_sync_error=null, github_metadata=$6::jsonb, github_readme=$7, github_readme_summary=$8,
      github_file_tree=$9::jsonb, github_languages=$10::jsonb, github_topics=$11::jsonb, github_latest_commit=$12::jsonb,
      github_is_private=$13, updated_at=now()
     where id=$1`,
    [
      projectId,
      snap.data.owner,
      snap.data.repo,
      snap.data.branch,
      snap.data.isPrivate ? "connected" : "verified",
      jsonParam(snap.data.metadata),
      snap.data.readme,
      snap.data.readmeSummary,
      jsonParam(annotateFileTree(snap.data.fileTree, project.interactionSteps)),
      jsonParam(snap.data.languages),
      jsonParam(snap.data.topics),
      jsonParam(snap.data.latestCommit),
      snap.data.isPrivate,
    ],
  );
  return { ok: true as const, incoming: snap.data.metadata };
}

export async function verifyProjectDemo(userId: string, projectId: string) {
  const project = await getAdminProject(userId, projectId);
  if (!project?.liveDemo?.url) throw new Error("Live Demo URL is not configured");
  const result = await verifyLiveDemo(project.liveDemo.url);
  const { db } = await requireAdminUser(userId);
  await db.query(
    "update projects set live_demo_status=$2, live_demo_last_verified_at=now(), live_demo_error=$3, updated_at=now() where id=$1",
    [projectId, result.status, result.error],
  );
  return result;
}

export async function verifyProjectCanva(userId: string, projectId: string) {
  const project = await getAdminProject(userId, projectId);
  const input = project?.canva?.embedUrl || project?.canva?.shareUrl;
  if (!input) throw new Error("Canva URL is not configured");
  const result = await testCanvaEmbed(input);
  const { db } = await requireAdminUser(userId);
  await db.query(
    "update projects set canva_status=$2, canva_last_synced_at=now(), canva_error=$3, canva_embed_url=coalesce($4, canva_embed_url), canva_design_id=coalesce($5, canva_design_id), updated_at=now() where id=$1",
    [
      projectId,
      result.status,
      result.error,
      result.value?.embedUrl ?? null,
      result.value?.designId ?? null,
    ],
  );
  return result;
}

export async function listIntegrations(userId: string) {
  const projects = await listAdminProjects(userId);
  return {
    canvaMode: canvaModeLabel(),
    canvaConnectConfigured: canvaConnectConfigured(),
    projects: projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      publicationStatus: project.publicationStatus,
      public: project.publicationStatus === "published",
      showExperience: Boolean(project.experienceMode),
      github: {
        url: project.github?.url ?? null,
        status: project.github?.syncStatus ?? "not_configured",
        lastSyncedAt: project.github?.lastSyncedAt ?? null,
        error: project.githubSyncError,
        private: project.githubIsPrivate,
      },
      canva: {
        url: project.canva?.shareUrl ?? null,
        status: project.canva?.status ?? "not_configured",
        lastSyncedAt: project.canva?.lastSyncedAt ?? null,
        error: project.canvaError,
      },
      demo: {
        url: project.liveDemo?.url ?? null,
        status: project.liveDemo?.status ?? "not_configured",
        lastVerifiedAt: project.liveDemo?.lastVerifiedAt ?? null,
        error: project.liveDemoError,
      },
      experienceMode: project.experienceMode,
    })),
  };
}

export async function getAdminSite(userId: string) {
  await requireAdminUser(userId);
  return getPublicSite();
}

export async function verifyProjectReadme(userId: string, projectId: string) {
  const project = await getAdminProject(userId, projectId);
  if (!project?.github?.url) {
    return { ok: false as const, status: "not_configured" as const, error: "GitHub URL is not configured", summary: null };
  }
  const { db } = await requireAdminUser(userId);
  const snap = await fetchGithubSnapshot(db, project.github.url);
  if (!snap.ok) {
    return { ok: false as const, status: snap.status, error: snap.error, summary: null };
  }
  if (!snap.data.readme) {
    const state = readmeFetchState(404);
    await db.query("update projects set github_sync_error=$2, updated_at=now() where id=$1", [
      projectId,
      state.error,
    ]);
    return { ok: false as const, status: state.status, error: state.error, summary: null };
  }
  await db.query(
    "update projects set github_readme=$2, github_readme_summary=$3, github_sync_error=null, updated_at=now() where id=$1",
    [projectId, snap.data.readme, snap.data.readmeSummary],
  );
  return { ok: true as const, status: "verified" as const, error: null, summary: snap.data.readmeSummary };
}

export async function getCanvaConnectStatus(userId: string) {
  const { db } = await requireAdminUser(userId);
  const rows = await db.query<{ status: string; last_synced_at: string | null }>(
    "select status, last_synced_at from integration_secrets where owner_user_id = $1 and provider = 'canva'",
    [userId],
  );
  return {
    mode: canvaModeLabel(),
    credentialsPresent: canvaConnectConfigured(),
    encryptReady: canEncryptSecrets(),
    status: canvaConnectConfigured() ? (rows[0]?.status ?? "not_configured") : "not_configured",
    lastSyncedAt: rows[0]?.last_synced_at ?? null,
  };
}

export async function connectCanvaApi(userId: string) {
  await requireAdminUser(userId);
  if (!canvaConnectConfigured()) {
    return {
      ok: false as const,
      status: "not_configured" as const,
      error: "未設定 Canva Connect 憑證。公開嵌入模式仍可用，不會假裝已連接。",
    };
  }
  return {
    ok: false as const,
    status: "pending" as const,
    error: "Canva Connect OAuth 已預留。請用官方 Canva 編輯網址改稿，這裡不會假裝已授權。",
  };
}

export async function disconnectCanvaApi(userId: string) {
  const { db } = await requireAdminUser(userId);
  await clearCanvaTokens(db, userId);
  return { ok: true as const, status: "not_configured" as const };
}

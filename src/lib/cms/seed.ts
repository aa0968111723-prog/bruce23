import type { Sql } from "../db.ts";
import { archiveItems } from "../../content/archive.ts";
import { archiveLocaleEnForId, localeEnForSlug, localeZhFromArchive, localeZhFromProject, mergeSeedEnglish, siteLocaleEn, siteLocaleZh } from "../../content/locale-en.ts";
import {
  AIOS_LIVE_PROBE_SLUG,
  AIOS_LIVE_PROBE_VERSION,
  CUTOS_LIVE_PROBE_SLUG,
  CUTOS_LIVE_PROBE_VERSION,
  PLANFORM_LIVE_PROBE_SLUG,
  PLANFORM_LIVE_PROBE_VERSION,
  DUIGAO_LIVE_PROBE_SLUG,
  DUIGAO_LIVE_PROBE_VERSION,
  FOLIO_LIVE_PROBE_SLUG,
  FOLIO_LIVE_PROBE_VERSION,
  HERMES_CONSOLE_LIVE_PROBE_SLUG,
  HERMES_CONSOLE_LIVE_PROBE_VERSION,
  SKATEHUB_LIVE_PROBE_SLUG,
  SKATEHUB_LIVE_PROBE_VERSION,
  TAMKANG_LIVE_PROBE_SLUG,
  TAMKANG_LIVE_PROBE_VERSION,
  LUMEN_LIVE_PROBE_SLUG,
  LUMEN_LIVE_PROBE_VERSION,
  ZEN_STUDIO_LIVE_PROBE_SLUG,
  ZEN_STUDIO_LIVE_PROBE_VERSION,
  TAMSUI_DRAMA_LIVE_PROBE_SLUG,
  TAMSUI_DRAMA_LIVE_PROBE_VERSION,
  POSTER_VISION_NO_HOST_SLUG,
  POSTER_VISION_NO_HOST_VERSION,
  HERMES_AGENT_SIGNIN_SLUG,
  HERMES_AGENT_SIGNIN_VERSION,
  XIAOCAI_LIVE_PROBE_SLUG,
  XIAOCAI_LIVE_PROBE_VERSION,
  TKU_ZEN_AI_LIVE_PROBE_SLUG,
  TKU_ZEN_AI_LIVE_PROBE_VERSION,
  TKU_ZEN_AGENT_LIVE_PROBE_SLUG,
  TKU_ZEN_AGENT_LIVE_PROBE_VERSION,
  skipGithubHydrate,
  TY_CONTRACT_SLUGS,
  TY_CONTRACT_VERSION,
  FRAMELAB_IDENTITY,
  FRAMELAB_IDENTITY_VERSION,
  FRAMELAB_LIVE_PROBE_SLUG,
  FRAMELAB_LIVE_PROBE_VERSION,
  STALE_502_NOTE_VERSION,
  STALE_502_NOTE_SLUGS,
} from "../../content/project-registry.ts";
import { projects } from "../../content/projects.ts";
import { site } from "../../content/site.ts";
import { canvaFieldsForArchive, canvaFieldsForProject } from "../canva/inventory.ts";
import { experienceForSlug } from "../experiences/catalog.ts";
import { defaultExperienceConfig, mergeExperienceConfig } from "../experiences/defaults.ts";
import { parseGithubUrl } from "../github/parse.ts";
import { projectInputSchema, type ExperienceConfig } from "./schema.ts";
import { createProjectRecord, getSiteSettings, saveSiteSettings, upsertArchive } from "./store.ts";

export const SEED_VERSION = "portfolio-cms-1";
const ARCHIVE_HONESTY_VERSION = "svg-translations-20260916";
const HERMES_DASHBOARD_LIVE_VERSION = "hermes-dashboard-k7q2-20260919";
const STALE_HERMES_LIVE_HOST = "455.zeabur.app";

async function refreshArchiveHonesty(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'archive_honesty_version' limit 1`,
  );
  if (meta[0]?.value === ARCHIVE_HONESTY_VERSION) return;
  for (const item of archiveItems) {
    const fields = canvaFieldsForArchive(item);
    await sql.query(
      `update archive_items
       set summary = $2,
           origin_note = $3,
           media = $4::jsonb,
           canva_alt = $5,
           canva_caption = $6,
           canva_thumbnail_url = coalesce(nullif($7, ''), canva_thumbnail_url),
           canva_status = case
             when canva_share_url is not null or canva_embed_url is not null then canva_status
             else $8
           end,
           updated_at = now()
       where slug = $1 or id = $1`,
      [
        item.id,
        item.summary,
        item.originNote,
        item.media ? JSON.stringify(item.media) : null,
        fields.alt,
        fields.caption,
        fields.thumbnailUrl,
        fields.status,
      ],
    );
  }
  await sql.query(
    `insert into cms_meta (key, value) values ('archive_honesty_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [ARCHIVE_HONESTY_VERSION],
  );
}

async function ensureSeedComplements(sql: Sql): Promise<void> {
  for (const project of projects) {
    const fields = canvaFieldsForProject(project);
    await sql.query(
      `update projects
       set canva_thumbnail_url = coalesce(nullif(canva_thumbnail_url, ''), $2),
           canva_alt = coalesce(nullif(canva_alt, ''), $3),
           canva_caption = coalesce(canva_caption, $4),
           canva_share_url = coalesce(canva_share_url, $5),
           canva_embed_url = coalesce(canva_embed_url, $6),
           canva_design_id = coalesce(canva_design_id, $7),
           canva_status = case
             when canva_share_url is not null or canva_embed_url is not null or $5 is not null or $6 is not null
               then case
                 when canva_status in ('not_configured', 'unavailable', 'failed')
                   and canva_share_url is null and canva_embed_url is null
                   then 'pending'
                 else canva_status
               end
             else $8
           end
       where slug = $1`,
      [
        project.slug,
        fields.thumbnailUrl,
        fields.alt,
        fields.caption,
        fields.shareUrl,
        fields.embedUrl,
        fields.designId,
        fields.status,
      ],
    );
  }
  for (const item of archiveItems) {
    const fields = canvaFieldsForArchive(item);
    await sql.query(
      `update archive_items
       set canva_thumbnail_url = coalesce(nullif(canva_thumbnail_url, ''), $2),
           canva_alt = coalesce(nullif(canva_alt, ''), $3),
           canva_caption = coalesce(canva_caption, $4),
           canva_share_url = coalesce(canva_share_url, $5),
           canva_embed_url = coalesce(canva_embed_url, $6),
           canva_design_id = coalesce(canva_design_id, $7),
           canva_status = case
             when canva_share_url is not null or canva_embed_url is not null or $5 is not null or $6 is not null
               then canva_status
             else $8
           end,
           media = coalesce(media, $9::jsonb)
       where slug = $1 or id = $1`,
      [
        item.id,
        fields.thumbnailUrl,
        fields.alt,
        fields.caption,
        fields.shareUrl,
        fields.embedUrl,
        fields.designId,
        fields.status,
        item.media ? JSON.stringify(item.media) : null,
      ],
    );
  }
  await refreshArchiveHonesty(sql);
  await insertMissingSeedProjects(sql, "seed");
  await fillExperienceConfigGaps(sql);
  await fillLiveDemoAndEvidenceGaps(sql);
  await fillLocaleJsonGaps(sql);
  await fillArchiveLocaleGaps(sql);
  await fillSiteLocaleGaps(sql);
  await fillProjectMediaGaps(sql);
  await clearUncustomizedHowSteps(sql);
  await refreshHermesDashboardLive(sql);
  await refreshFramelabIdentity(sql);
  await refreshFramelabLiveProbe(sql);
  await refreshStale502Notes(sql);
  await refreshAiosLiveProbe(sql);
  await refreshTyContractCopy(sql);
  await refreshCutosLiveProbe(sql);
  await refreshPlanformLiveProbe(sql);
  await refreshDuigaoLiveProbe(sql);
  await refreshFolioLiveProbe(sql);
  await refreshHermesConsoleLiveProbe(sql);
  await refreshSkatehubLiveProbe(sql);
  await refreshTamkangLiveProbe(sql);
  await refreshLumenLiveProbe(sql);
  await refreshZenStudioLiveProbe(sql);
  await refreshTamsuiDramaLiveProbe(sql);
  await refreshPosterVisionNoHost(sql);
  await refreshHermesAgentSignin(sql);
  await refreshXiaocaiLiveProbe(sql);
  await refreshTkuZenAiLiveProbe(sql);
  await refreshTkuZenAgentLiveProbe(sql);
}

const seedLock = globalThis as typeof globalThis & {
  __luminousSeedLock__?: Promise<{ seeded: boolean; skipped: boolean }>;
};

export async function ensureSeed(
  sql: Sql,
  options: { actor?: string; skipGithubHydrate?: boolean } = {},
): Promise<{ seeded: boolean; skipped: boolean }> {
  if (seedLock.__luminousSeedLock__) return seedLock.__luminousSeedLock__;
  const run = ensureSeedOnce(sql, options).finally(() => {
    seedLock.__luminousSeedLock__ = undefined;
  });
  seedLock.__luminousSeedLock__ = run;
  return run;
}

async function ensureSeedOnce(
  sql: Sql,
  options: { actor?: string; skipGithubHydrate?: boolean } = {},
): Promise<{ seeded: boolean; skipped: boolean }> {
  try {
    return await ensureSeedOnceInner(sql, options);
  } catch (err) {
    if (isUniqueViolation(err)) {
      console.warn("[cms] seed unique constraint skipped:", err instanceof Error ? err.message : err);
      return { seeded: false, skipped: true };
    }
    throw err;
  }
}

async function ensureSeedOnceInner(
  sql: Sql,
  options: { actor?: string; skipGithubHydrate?: boolean } = {},
): Promise<{ seeded: boolean; skipped: boolean }> {
  const actor = options.actor ?? "seed";
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'seed_version' limit 1`,
  );
  if (meta[0]?.value === SEED_VERSION) {
    await ensureSeedComplements(sql);
    if (!options.skipGithubHydrate) {
      await runPublicHydrates(sql);
    }
    return { seeded: false, skipped: true };
  }

  const settings = await getSiteSettings(sql);
  if (!settings) {
    await saveSiteSettings(
      sql,
      {
        name_zh: site.nameZh,
        name_en: site.nameEn,
        person: site.person,
        role: site.role,
        headline: site.headline,
        subhead: site.subhead,
        narrative: site.narrative,
        email: site.email,
        github: site.github,
        github_handle: site.githubHandle,
        location: site.location,
        seo_title: `${site.nameZh} · ${site.person}`,
        seo_description: site.narrative,
        homepage_json: {
          highlightSlugs: projects.filter((item) => item.featured).map((item) => item.slug),
        },
        locale_json: {
          zh: siteLocaleZh,
          en: siteLocaleEn,
        },
      },
      actor,
    );
  } else if (!(settings.homepage_json.highlightSlugs?.length)) {
    await sql.query(
      `update site_settings
       set homepage_json = jsonb_set(coalesce(homepage_json, '{}'::jsonb), '{highlightSlugs}', $1::jsonb, true)
       where id = 'default'`,
      [JSON.stringify(projects.filter((item) => item.featured).map((item) => item.slug))],
    );
  }

  await insertMissingSeedProjects(sql, actor);

  for (const [index, item] of archiveItems.entries()) {
    const existing = await sql.query<{ id: string }>(
      `select id from archive_items where slug = $1 or id = $2 limit 1`,
      [item.id, item.id],
    );
    if (existing[0]) continue;
    const canva = canvaFieldsForArchive(item);
    await upsertArchive(
      sql,
      {
        id: item.id,
        slug: item.id,
        title: item.title,
        kind: item.kind,
        year: item.year,
        summary: item.summary,
        media: item.media
          ? { ...item.media, src: item.media.src.replace(/\.jpg$/i, ".svg") }
          : null,
        href: item.href ?? null,
        origin_note: item.originNote,
        publication_status: "published",
        sort_order: index,
        locale_json: {
          zh: localeZhFromArchive(item.id),
          en: archiveLocaleEnForId(item.id),
        },
        canva_share_url: canva.shareUrl,
        canva_embed_url: canva.embedUrl,
        canva_design_id: canva.designId,
        canva_thumbnail_url: canva.thumbnailUrl,
        canva_alt: canva.alt,
        canva_caption: canva.caption,
        canva_status: canva.status,
      },
      actor,
    );
  }

  await sql.query(
    `insert into cms_meta (key, value) values ('seed_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [SEED_VERSION],
  );
  await ensureSeedComplements(sql);
  if (!options.skipGithubHydrate) {
    await runPublicHydrates(sql);
  }
  return { seeded: true, skipped: false };
}

async function runPublicHydrates(sql: Sql): Promise<void> {
  const { shouldHydrateGithub, hydratePendingGithub, hydratePendingDemos, hydratePendingCanvaShortLinks } =
    await import("./hydrate.ts");
  if (!shouldHydrateGithub()) return;
  await hydratePendingGithub(sql).catch((err: unknown) => {
    console.warn("[cms] github hydrate deferred:", err instanceof Error ? err.message : "unknown error");
  });
  await hydratePendingDemos(sql).catch((err: unknown) => {
    console.warn("[cms] demo hydrate deferred:", err instanceof Error ? err.message : "unknown error");
  });
  await hydratePendingCanvaShortLinks(sql).catch((err: unknown) => {
    console.warn("[cms] canva shortlink hydrate deferred:", err instanceof Error ? err.message : "unknown error");
  });
}

function isUniqueViolation(err: unknown): boolean {
  let current: unknown = err;
  for (let i = 0; i < 4; i += 1) {
    if (!current || typeof current !== "object") break;
    const row = current as { code?: string; message?: string; cause?: unknown };
    if (row.code === "23505") return true;
    if (/projects_slug_key|unique constraint/i.test(String(row.message ?? ""))) return true;
    current = row.cause;
  }
  return /projects_slug_key|unique constraint/i.test(String(err));
}

async function insertMissingSeedProjects(sql: Sql, actor: string): Promise<void> {
  const counted = await sql.query<{ n: string }>(`select count(*)::text as n from projects`);
  if (Number(counted[0]?.n ?? 0) >= projects.length) return;
  for (const [index, project] of projects.entries()) {
    const existing = await sql.query<{ id: string }>(
      `select id from projects where slug = $1 limit 1`,
      [project.slug],
    );
    if (existing[0]) continue;
    try {
    const parsed = parseGithubUrl(project.links.github);
    const catalog = experienceForSlug(project.slug);
    const demoUrl = project.links.live ?? project.links.demo ?? null;
    const canva = canvaFieldsForProject(project);
    const input = projectInputSchema.parse({
      slug: project.slug,
      title: project.title,
      subtitle: project.subtitle,
      category: project.category,
      year: project.year,
      product_status: project.status,
      publication_status: "published",
      featured: project.featured,
      sort_order: index,
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
      locale_json: {
        zh: localeZhFromProject(project.slug),
        en: localeEnForSlug(project.slug) ?? {
          title: project.title,
          subtitle: project.subtitle,
          summary: project.summary,
        },
      },
      seo_title: `${project.title} · ${site.nameZh}`,
      seo_description: project.summary,
      github_url: parsed?.url ?? project.links.github ?? null,
      github_owner: parsed?.owner ?? null,
      github_repo: parsed?.repo ?? null,
      github_branch: null,
      github_sync_enabled: Boolean(parsed) && !skipGithubHydrate(project.slug),
      github_sync_status: parsed && !skipGithubHydrate(project.slug) ? "pending" : "not_configured",
      live_demo_url: demoUrl,
      live_demo_label: demoUrl ? "公開網址（狀態可能變動）" : null,
      live_demo_type: demoUrl ? "link" : "unavailable",
      live_demo_embed_enabled: false,
      live_demo_status: demoUrl ? "pending" : "not_configured",
      canva_share_url: canva.shareUrl,
      canva_embed_url: canva.embedUrl,
      canva_design_id: canva.designId,
      canva_thumbnail_url: canva.thumbnailUrl,
      canva_alt: canva.alt,
      canva_caption: canva.caption,
      canva_status: canva.status,
      experience_mode: catalog?.mode ?? "github-explorer",
      experience_config: defaultExperienceConfig(project.slug),
      interaction_steps: [],
      source_evidence: project.sourceReferences.map((ref) => ({
        label: ref.label,
        href: ref.href,
        note: ref.note,
        kind: ref.href?.includes("canva.com")
          ? ("canva" as const)
          : ref.href?.includes("github.com")
            ? ("github" as const)
            : ("demo" as const),
      })),
    });
    await createProjectRecord(sql, input, actor);
    } catch (err) {
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }
}

function asStoredConfig(value: unknown): ExperienceConfig {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as ExperienceConfig;
    } catch {
      return {};
    }
  }
  if (value && typeof value === "object") return value as ExperienceConfig;
  return {};
}

async function fillExperienceConfigGaps(sql: Sql): Promise<void> {
  const rows = await sql.query<{ id: string; slug: string; experience_config: unknown }>(
    `select id, slug, experience_config from projects`,
  );
  for (const row of rows) {
    const stored = asStoredConfig(row.experience_config);
    const merged = mergeExperienceConfig(row.slug, stored);
    if (JSON.stringify(stored) === JSON.stringify(merged)) continue;
    await sql.query(`update projects set experience_config = $2::jsonb where id = $1`, [
      row.id,
      JSON.stringify(merged),
    ]);
  }
}

function asEvidenceList(value: unknown): Array<{ label: string; href?: string; note: string; kind: string }> {
  if (typeof value === "string") {
    try {
      return asEvidenceList(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { label: string; href?: string; note: string; kind: string } => {
    return Boolean(item && typeof item === "object" && "label" in item);
  });
}

/** Seed used to copy process into interaction_steps, which hid saved experience_config. */
async function clearUncustomizedHowSteps(sql: Sql): Promise<void> {
  await sql.query(
    `update projects
     set interaction_steps = '[]'::jsonb, updated_at = now()
     where interaction_steps = process`,
  );
}

function isStaleHermesHref(href: string | undefined): boolean {
  return Boolean(href && href.includes(STALE_HERMES_LIVE_HOST));
}

function hermesDashboardEvidence(project: (typeof projects)[number]) {
  return project.sourceReferences.map((ref) => ({
    label: ref.label,
    href: ref.href,
    note: ref.note,
    kind: ref.href?.includes("canva.com")
      ? ("canva" as const)
      : ref.href?.includes("github.com")
        ? ("github" as const)
        : ("demo" as const),
  }));
}

async function refreshHermesDashboardLive(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'hermes_dashboard_live_version' limit 1`,
  );
  if (meta[0]?.value === HERMES_DASHBOARD_LIVE_VERSION) return;
  const project = projects.find((item) => item.slug === "hermes-agent");
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  await sql.query(
    `update projects
     set title = $2,
         subtitle = $3,
         summary = $4,
         problem = $5,
         role = $6,
         decisions = $7::jsonb,
         process = $8::jsonb,
         outputs = $9::jsonb,
         limitations = $10::jsonb,
         seo_title = $11,
         seo_description = $12,
         source_evidence = $13::jsonb,
         locale_json = $14::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      project.title,
      project.subtitle,
      project.summary,
      project.problem,
      project.role,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.outputs),
      JSON.stringify(project.limitations),
      `${project.title} · ${site.nameZh}`,
      project.summary,
      JSON.stringify(hermesDashboardEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('hermes_dashboard_live_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [HERMES_DASHBOARD_LIVE_VERSION],
  );
}

function projectEvidence(project: (typeof projects)[number]) {
  return project.sourceReferences.map((ref) => ({
    label: ref.label,
    href: ref.href,
    note: ref.note,
    kind: ref.href?.includes("canva.com")
      ? ("canva" as const)
      : ref.href?.includes("github.com")
        ? ("github" as const)
        : ("demo" as const),
  }));
}

async function refreshFramelabIdentity(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'framelab_identity_version' limit 1`,
  );
  if (meta[0]?.value === FRAMELAB_IDENTITY_VERSION) return;
  const project = projects.find((item) => item.slug === FRAMELAB_IDENTITY.portfolioSlug);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  const liveUrl = project.links.live ?? FRAMELAB_IDENTITY.canonicalLiveUrl;
  await sql.query(
    `update projects
     set title = $2,
         subtitle = $3,
         summary = $4,
         problem = $5,
         role = $6,
         decisions = $7::jsonb,
         process = $8::jsonb,
         outputs = $9::jsonb,
         limitations = $10::jsonb,
         seo_title = $11,
         seo_description = $12,
         source_evidence = $13::jsonb,
         locale_json = $14::jsonb,
         live_demo_url = $15,
         live_demo_label = coalesce(nullif(live_demo_label, ''), $16),
         live_demo_type = case
           when live_demo_type is null or live_demo_type in ('unavailable', '') then 'link'
           else live_demo_type
         end,
         live_demo_embed_enabled = false,
         live_demo_status = case
           when live_demo_url is distinct from $15 then 'pending'
           else live_demo_status
         end,
         live_demo_error = case
           when live_demo_url is distinct from $15 then null
           else live_demo_error
         end,
         experience_mode = coalesce($17, experience_mode),
         experience_config = $18::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      project.title,
      project.subtitle,
      project.summary,
      project.problem,
      project.role,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.outputs),
      JSON.stringify(project.limitations),
      `${project.title} · ${site.nameZh}`,
      project.summary,
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      liveUrl,
      "公開網址（狀態可能變動）",
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('framelab_identity_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [FRAMELAB_IDENTITY_VERSION],
  );
}

async function refreshFramelabLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'framelab_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === FRAMELAB_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === FRAMELAB_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('framelab_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [FRAMELAB_LIVE_PROBE_VERSION],
  );
}

async function refreshStale502Notes(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'stale_502_note_version' limit 1`,
  );
  if (meta[0]?.value === STALE_502_NOTE_VERSION) return;
  for (const slug of STALE_502_NOTE_SLUGS) {
    const project = projects.find((item) => item.slug === slug);
    if (!project) continue;
    const seedEn = localeEnForSlug(project.slug);
    const seedZh = localeZhFromProject(project.slug);
    const catalog = experienceForSlug(project.slug);
    const experience = defaultExperienceConfig(project.slug);
    await sql.query(
      `update projects
       set decisions = $2::jsonb,
           process = $3::jsonb,
           limitations = $4::jsonb,
           source_evidence = $5::jsonb,
           locale_json = $6::jsonb,
           experience_mode = coalesce($7, experience_mode),
           experience_config = $8::jsonb,
           updated_at = now()
       where slug = $1`,
      [
        project.slug,
        JSON.stringify(project.decisions),
        JSON.stringify(project.process),
        JSON.stringify(project.limitations),
        JSON.stringify(projectEvidence(project)),
        JSON.stringify({ zh: seedZh, en: seedEn }),
        catalog?.mode ?? null,
        JSON.stringify(experience),
      ],
    );
  }
  await sql.query(
    `insert into cms_meta (key, value) values ('stale_502_note_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [STALE_502_NOTE_VERSION],
  );
}

async function refreshAiosLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'aios_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === AIOS_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === AIOS_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         live_demo_status = case
           when live_demo_status in ('failed', 'unavailable') then 'pending'
           else live_demo_status
         end,
         live_demo_error = case
           when live_demo_status in ('failed', 'unavailable') then null
           else live_demo_error
         end,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('aios_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [AIOS_LIVE_PROBE_VERSION],
  );
}

async function refreshTyContractCopy(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'ty_contract_version' limit 1`,
  );
  if (meta[0]?.value === TY_CONTRACT_VERSION) return;
  for (const slug of TY_CONTRACT_SLUGS) {
    const project = projects.find((item) => item.slug === slug);
    if (!project) continue;
    const seedEn = localeEnForSlug(project.slug);
    const seedZh = localeZhFromProject(project.slug);
    const catalog = experienceForSlug(project.slug);
    const experience = defaultExperienceConfig(project.slug);
    await sql.query(
      `update projects
       set summary = $2,
           problem = $3,
           role = $4,
           decisions = $5::jsonb,
           process = $6::jsonb,
           limitations = $7::jsonb,
           seo_description = $8,
           source_evidence = $9::jsonb,
           locale_json = $10::jsonb,
           experience_mode = coalesce($11, experience_mode),
           experience_config = $12::jsonb,
           updated_at = now()
       where slug = $1`,
      [
        project.slug,
        project.summary,
        project.problem,
        project.role,
        JSON.stringify(project.decisions),
        JSON.stringify(project.process),
        JSON.stringify(project.limitations),
        project.summary,
        JSON.stringify(projectEvidence(project)),
        JSON.stringify({ zh: seedZh, en: seedEn }),
        catalog?.mode ?? null,
        JSON.stringify(experience),
      ],
    );
  }
  await sql.query(
    `insert into cms_meta (key, value) values ('ty_contract_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [TY_CONTRACT_VERSION],
  );
}

async function refreshCutosLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'cutos_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === CUTOS_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === CUTOS_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set process = $2::jsonb,
         limitations = $3::jsonb,
         source_evidence = $4::jsonb,
         locale_json = $5::jsonb,
         experience_mode = coalesce($6, experience_mode),
         experience_config = $7::jsonb,
         live_demo_status = case
           when live_demo_status in ('failed', 'unavailable') then 'pending'
           else live_demo_status
         end,
         live_demo_error = case
           when live_demo_status in ('failed', 'unavailable') then null
           else live_demo_error
         end,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('cutos_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [CUTOS_LIVE_PROBE_VERSION],
  );
}

async function refreshPlanformLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'planform_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === PLANFORM_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === PLANFORM_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('planform_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [PLANFORM_LIVE_PROBE_VERSION],
  );
}

async function refreshDuigaoLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'duigao_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === DUIGAO_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === DUIGAO_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('duigao_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [DUIGAO_LIVE_PROBE_VERSION],
  );
}

async function refreshFolioLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'folio_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === FOLIO_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === FOLIO_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('folio_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [FOLIO_LIVE_PROBE_VERSION],
  );
}

async function refreshHermesConsoleLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'hermes_console_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === HERMES_CONSOLE_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === HERMES_CONSOLE_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set process = $2::jsonb,
         limitations = $3::jsonb,
         source_evidence = $4::jsonb,
         locale_json = $5::jsonb,
         experience_mode = coalesce($6, experience_mode),
         experience_config = $7::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('hermes_console_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [HERMES_CONSOLE_LIVE_PROBE_VERSION],
  );
}

async function refreshSkatehubLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'skatehub_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === SKATEHUB_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === SKATEHUB_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('skatehub_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [SKATEHUB_LIVE_PROBE_VERSION],
  );
}

async function refreshTamkangLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'tamkang_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === TAMKANG_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === TAMKANG_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('tamkang_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [TAMKANG_LIVE_PROBE_VERSION],
  );
}

async function refreshLumenLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'lumen_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === LUMEN_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === LUMEN_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('lumen_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [LUMEN_LIVE_PROBE_VERSION],
  );
}

async function refreshZenStudioLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'zen_studio_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === ZEN_STUDIO_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === ZEN_STUDIO_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set process = $2::jsonb,
         limitations = $3::jsonb,
         source_evidence = $4::jsonb,
         locale_json = $5::jsonb,
         experience_mode = coalesce($6, experience_mode),
         experience_config = $7::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('zen_studio_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [ZEN_STUDIO_LIVE_PROBE_VERSION],
  );
}

async function refreshTamsuiDramaLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'tamsui_drama_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === TAMSUI_DRAMA_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === TAMSUI_DRAMA_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set process = $2::jsonb,
         limitations = $3::jsonb,
         source_evidence = $4::jsonb,
         locale_json = $5::jsonb,
         experience_mode = coalesce($6, experience_mode),
         experience_config = $7::jsonb,
         media = $8::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
      JSON.stringify(project.media),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('tamsui_drama_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [TAMSUI_DRAMA_LIVE_PROBE_VERSION],
  );
}

async function refreshPosterVisionNoHost(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'poster_vision_no_host_version' limit 1`,
  );
  if (meta[0]?.value === POSTER_VISION_NO_HOST_VERSION) return;
  const project = projects.find((item) => item.slug === POSTER_VISION_NO_HOST_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  await sql.query(
    `update projects
     set limitations = $2::jsonb,
         source_evidence = $3::jsonb,
         locale_json = $4::jsonb,
         live_demo_url = null,
         live_demo_type = 'unavailable',
         live_demo_status = 'unavailable',
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('poster_vision_no_host_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [POSTER_VISION_NO_HOST_VERSION],
  );
}

async function refreshHermesAgentSignin(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'hermes_agent_signin_version' limit 1`,
  );
  if (meta[0]?.value === HERMES_AGENT_SIGNIN_VERSION) return;
  const project = projects.find((item) => item.slug === HERMES_AGENT_SIGNIN_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set process = $2::jsonb,
         limitations = $3::jsonb,
         source_evidence = $4::jsonb,
         locale_json = $5::jsonb,
         experience_mode = coalesce($6, experience_mode),
         experience_config = $7::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('hermes_agent_signin_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [HERMES_AGENT_SIGNIN_VERSION],
  );
}

async function refreshXiaocaiLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'xiaocai_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === XIAOCAI_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === XIAOCAI_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set process = $2::jsonb,
         limitations = $3::jsonb,
         source_evidence = $4::jsonb,
         locale_json = $5::jsonb,
         experience_mode = coalesce($6, experience_mode),
         experience_config = $7::jsonb,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('xiaocai_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [XIAOCAI_LIVE_PROBE_VERSION],
  );
}

async function refreshTkuZenAiLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'tku_zen_ai_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === TKU_ZEN_AI_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === TKU_ZEN_AI_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  const canva = canvaFieldsForProject(project);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         canva_share_url = $9,
         canva_embed_url = $10,
         canva_design_id = $11,
         canva_thumbnail_url = $12,
         canva_alt = $13,
         canva_caption = $14,
         canva_status = $15,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
      canva.shareUrl,
      canva.embedUrl,
      canva.designId,
      canva.thumbnailUrl,
      canva.alt,
      canva.caption,
      canva.status,
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('tku_zen_ai_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [TKU_ZEN_AI_LIVE_PROBE_VERSION],
  );
}

async function refreshTkuZenAgentLiveProbe(sql: Sql): Promise<void> {
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'tku_zen_agent_live_probe_version' limit 1`,
  );
  if (meta[0]?.value === TKU_ZEN_AGENT_LIVE_PROBE_VERSION) return;
  const project = projects.find((item) => item.slug === TKU_ZEN_AGENT_LIVE_PROBE_SLUG);
  if (!project) return;
  const seedEn = localeEnForSlug(project.slug);
  const seedZh = localeZhFromProject(project.slug);
  const catalog = experienceForSlug(project.slug);
  const experience = defaultExperienceConfig(project.slug);
  await sql.query(
    `update projects
     set decisions = $2::jsonb,
         process = $3::jsonb,
         limitations = $4::jsonb,
         source_evidence = $5::jsonb,
         locale_json = $6::jsonb,
         experience_mode = coalesce($7, experience_mode),
         experience_config = $8::jsonb,
         github_url = null,
         github_owner = null,
         github_repo = null,
         github_branch = null,
         github_sync_enabled = false,
         github_sync_status = 'not_configured',
         github_last_synced_at = null,
         github_metadata = '{"private":true}'::jsonb,
         github_readme = null,
         github_file_tree = '[]'::jsonb,
         github_languages = null,
         github_topics = null,
         github_latest_commit = null,
         updated_at = now()
     where slug = $1`,
    [
      project.slug,
      JSON.stringify(project.decisions),
      JSON.stringify(project.process),
      JSON.stringify(project.limitations),
      JSON.stringify(projectEvidence(project)),
      JSON.stringify({ zh: seedZh, en: seedEn }),
      catalog?.mode ?? null,
      JSON.stringify(experience),
    ],
  );
  await sql.query(
    `insert into cms_meta (key, value) values ('tku_zen_agent_live_probe_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [TKU_ZEN_AGENT_LIVE_PROBE_VERSION],
  );
}

/** GitHub homepage that currently serves a JS bundle, not HTML. Seed live URLs replace it. */
const STALE_NON_PAGE_LIVE_URL = "https://ai-os-ten.vercel.app";

async function fillLiveDemoAndEvidenceGaps(sql: Sql): Promise<void> {
  for (const project of projects) {
    const demoUrl = project.links.live ?? project.links.demo ?? null;
    const parsed = parseGithubUrl(project.links.github);
    await sql.query(
      `update projects
       set sort_order = $2,
           featured = $3,
           category = $4,
           github_url = coalesce($5, github_url),
           github_owner = coalesce($6, github_owner),
           github_repo = coalesce($7, github_repo),
           github_sync_enabled = case
             when $8::boolean then false
             when $5 is not null then true
             else github_sync_enabled
           end,
           updated_at = now()
       where slug = $1`,
      [
        project.slug,
        projects.indexOf(project),
        project.featured,
        project.category,
        parsed?.url ?? project.links.github ?? null,
        parsed?.owner ?? null,
        parsed?.repo ?? null,
        skipGithubHydrate(project.slug),
      ],
    );
    if (demoUrl) {
      const stale = demoUrl === STALE_NON_PAGE_LIVE_URL ? "" : STALE_NON_PAGE_LIVE_URL;
      await sql.query(
        `update projects
         set live_demo_url = $2,
             live_demo_label = coalesce(nullif(live_demo_label, ''), $3),
             live_demo_type = case
               when live_demo_type is null or live_demo_type in ('unavailable', '') then 'link'
               else live_demo_type
             end,
             live_demo_embed_enabled = false,
             live_demo_status = case
               when live_demo_url is distinct from $2 then 'pending'
               else live_demo_status
             end,
             live_demo_error = case
               when live_demo_url is distinct from $2 then null
               else live_demo_error
             end,
             live_demo_last_verified_at = case
               when live_demo_url is distinct from $2 then null
               else live_demo_last_verified_at
             end,
             updated_at = now()
         where slug = $1 and (
           live_demo_url is null or live_demo_url = ''
           or live_demo_url is distinct from $2
           or ($4 <> '' and live_demo_url = $4)
         )`,
        [project.slug, demoUrl, "公開網址（狀態可能變動）", stale],
      );
    }

    const rows = await sql.query<{
      id: string;
      source_evidence: unknown;
      experience_mode: string | null;
    }>(`select id, source_evidence, experience_mode from projects where slug = $1 limit 1`, [project.slug]);
    const row = rows[0];
    if (!row) continue;

    const catalog = experienceForSlug(project.slug);
    if (!row.experience_mode && catalog?.mode) {
      await sql.query(`update projects set experience_mode = $2 where id = $1`, [row.id, catalog.mode]);
    }

    const stored = asEvidenceList(row.source_evidence);
    const cleaned = stored.filter((item) => !isStaleHermesHref(item.href));
    const have = new Set(cleaned.map((item) => item.href || item.label));
    const next = [...cleaned];
    for (const ref of project.sourceReferences) {
      const key = ref.href || ref.label;
      if (have.has(key)) continue;
      next.push({
        label: ref.label,
        href: ref.href,
        note: ref.note,
        kind: ref.href?.includes("canva.com")
          ? "canva"
          : ref.href?.includes("github.com")
            ? "github"
            : "demo",
      });
      have.add(key);
    }
    if (JSON.stringify(next) !== JSON.stringify(stored)) {
      await sql.query(`update projects set source_evidence = $2::jsonb where id = $1`, [
        row.id,
        JSON.stringify(next),
      ]);
    }
  }
}

function asMediaList(value: unknown): Array<{ src: string; alt: string; kind: string; caption?: string; poster?: string }> {
  if (typeof value === "string") {
    try {
      return asMediaList(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { src: string; alt: string; kind: string; caption?: string; poster?: string } => {
    return Boolean(item && typeof item === "object" && "src" in item && "alt" in item);
  });
}

async function fillProjectMediaGaps(sql: Sql): Promise<void> {
  for (const project of projects) {
    const rows = await sql.query<{ id: string; media: unknown }>(
      `select id, media from projects where slug = $1 limit 1`,
      [project.slug],
    );
    const row = rows[0];
    if (!row) continue;
    const stored = asMediaList(row.media);
    const cover = project.media[0];
    const rest = stored.filter((item) => item.src !== cover?.src);
    const next = cover ? [cover, ...rest] : [...stored];
    const have = new Set(next.map((item) => item.src));
    for (const item of project.media) {
      if (have.has(item.src)) continue;
      next.push(item);
      have.add(item.src);
    }
    if (JSON.stringify(next) !== JSON.stringify(stored)) {
      await sql.query(`update projects set media = $2::jsonb, updated_at = now() where id = $1`, [
        row.id,
        JSON.stringify(next),
      ]);
    }
  }
}

function asLocaleBag(value: unknown): { zh?: Record<string, unknown>; en?: Record<string, unknown> } {
  if (!value || typeof value !== "object") return {};
  const bag = value as { zh?: Record<string, unknown>; en?: Record<string, unknown> };
  return {
    zh: bag.zh && typeof bag.zh === "object" && !Array.isArray(bag.zh) ? bag.zh : undefined,
    en: bag.en && typeof bag.en === "object" && !Array.isArray(bag.en) ? bag.en : undefined,
  };
}

async function fillLocaleJsonGaps(sql: Sql): Promise<void> {
  for (const project of projects) {
    const seedEn = localeEnForSlug(project.slug);
    if (!seedEn) continue;
    const rows = await sql.query<{ locale_json: unknown }>(
      `select locale_json from projects where slug = $1 limit 1`,
      [project.slug],
    );
    if (!rows[0]) continue;
    const current = asLocaleBag(rows[0].locale_json);
    const zh = { ...(localeZhFromProject(project.slug) ?? {}), ...(current.zh ?? {}) };
    const en = mergeSeedEnglish(current.en, zh, seedEn, [
      project.title,
      project.subtitle,
      project.summary,
      project.problem,
      project.role,
      project.decisions.join("\n"),
      project.process.join("\n"),
      project.outputs.join("\n"),
      project.limitations.join("\n"),
      project.modalities.join("\n"),
      project.stack.join("\n"),
    ]);
    await sql.query(`update projects set locale_json = $2::jsonb, updated_at = now() where slug = $1`, [
      project.slug,
      JSON.stringify({ zh, en }),
    ]);
  }
}

async function fillArchiveLocaleGaps(sql: Sql): Promise<void> {
  for (const item of archiveItems) {
    const seedEn = archiveLocaleEnForId(item.id);
    if (!seedEn) continue;
    const rows = await sql.query<{ locale_json: unknown }>(
      `select locale_json from archive_items where slug = $1 or id = $1 limit 1`,
      [item.id],
    );
    if (!rows[0]) continue;
    const current = asLocaleBag(rows[0].locale_json);
    const zh = { ...(localeZhFromArchive(item.id) ?? {}), ...(current.zh ?? {}) };
    const en = mergeSeedEnglish(current.en, zh, seedEn, [
      item.title,
      item.summary,
      item.originNote,
      item.media?.caption ?? "",
      item.media?.alt ?? "",
    ]);
    await sql.query(
      `update archive_items set locale_json = $2::jsonb, updated_at = now() where slug = $1 or id = $1`,
      [item.id, JSON.stringify({ zh, en })],
    );
  }
}

async function fillSiteLocaleGaps(sql: Sql): Promise<void> {
  const rows = await sql.query<{ locale_json: unknown }>(
    `select locale_json from site_settings where id = 'default' limit 1`,
  );
  if (!rows[0]) return;
  const current = asLocaleBag(rows[0].locale_json);
  const zh = { ...siteLocaleZh, ...(current.zh ?? {}) };
  const en = mergeSeedEnglish(current.en, zh, siteLocaleEn, [site.headline, site.subhead, site.narrative]);
  await sql.query(
    `update site_settings set locale_json = $1::jsonb, updated_at = now() where id = 'default'`,
    [JSON.stringify({ zh, en })],
  );
}

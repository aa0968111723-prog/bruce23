import type { Sql } from "../db.ts";
import { archiveItems } from "../../content/archive.ts";
import { projects } from "../../content/projects.ts";
import { site } from "../../content/site.ts";
import { canvaFieldsForArchive, canvaFieldsForProject } from "../canva/inventory.ts";
import { experienceForSlug } from "../experiences/catalog.ts";
import { defaultExperienceConfig, mergeExperienceConfig } from "../experiences/defaults.ts";
import { parseGithubUrl } from "../github/parse.ts";
import { projectInputSchema, type ExperienceConfig } from "./schema.ts";
import { createProjectRecord, getSiteSettings, saveSiteSettings, upsertArchive } from "./store.ts";

export const SEED_VERSION = "portfolio-cms-1";

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
                 when canva_status in ('not_configured', 'unavailable')
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
  await fillExperienceConfigGaps(sql);
}

export async function ensureSeed(
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
      const { shouldHydrateGithub, hydratePendingGithub } = await import("./hydrate.ts");
      if (shouldHydrateGithub()) {
        await hydratePendingGithub(sql).catch((err: unknown) => {
          console.warn(
            "[cms] github hydrate deferred:",
            err instanceof Error ? err.message : "unknown error",
          );
        });
      }
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
          highlightSlugs: projects.map((item) => item.slug),
        },
        locale_json: {
          en: {
            headline: site.subhead,
            narrative: site.narrative,
          },
        },
      },
      actor,
    );
  } else if (!(settings.homepage_json.highlightSlugs?.length)) {
    await sql.query(
      `update site_settings
       set homepage_json = jsonb_set(coalesce(homepage_json, '{}'::jsonb), '{highlightSlugs}', $1::jsonb, true)
       where id = 'default'`,
      [JSON.stringify(projects.map((item) => item.slug))],
    );
  }

  for (const [index, project] of projects.entries()) {
    const existing = await sql.query<{ id: string }>(
      `select id from projects where slug = $1 limit 1`,
      [project.slug],
    );
    if (existing[0]) continue;
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
      media: project.media.map((item) => ({
        ...item,
        src: item.src.replace(/\.jpg$/i, ".svg"),
      })),
      locale_json: {
        en: { title: project.title, subtitle: project.subtitle, summary: project.summary },
      },
      seo_title: `${project.title} · ${site.nameZh}`,
      seo_description: project.summary,
      github_url: parsed?.url ?? project.links.github ?? null,
      github_owner: parsed?.owner ?? null,
      github_repo: parsed?.repo ?? null,
      github_branch: null,
      github_sync_enabled: Boolean(parsed),
      github_sync_status: parsed ? "pending" : "not_configured",
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
      interaction_steps: project.process,
      source_evidence: project.sourceReferences.map((ref) => ({
        label: ref.label,
        href: ref.href,
        note: ref.note,
        kind: "github" as const,
      })),
    });
    await createProjectRecord(sql, input, actor);
  }

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
    const { shouldHydrateGithub, hydratePendingGithub } = await import("./hydrate.ts");
    if (shouldHydrateGithub()) {
      await hydratePendingGithub(sql).catch((err: unknown) => {
        console.warn(
          "[cms] github hydrate deferred:",
          err instanceof Error ? err.message : "unknown error",
        );
      });
    }
  }
  return { seeded: true, skipped: false };
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

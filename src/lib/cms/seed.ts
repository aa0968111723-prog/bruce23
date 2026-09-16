import type { Sql } from "../db.ts";
import { archiveItems } from "../../content/archive.ts";
import { projects } from "../../content/projects.ts";
import { site } from "../../content/site.ts";
import { experienceForSlug } from "../experiences/catalog.ts";
import { parseGithubUrl } from "../github/parse.ts";
import { projectInputSchema } from "./schema.ts";
import { createProjectRecord, getSiteSettings, saveSiteSettings, upsertArchive } from "./store.ts";

export const SEED_VERSION = "portfolio-cms-1";

export async function ensureSeed(
  sql: Sql,
  options: { actor?: string } = {},
): Promise<{ seeded: boolean; skipped: boolean }> {
  const actor = options.actor ?? "seed";
  const meta = await sql.query<{ value: string }>(
    `select value from cms_meta where key = 'seed_version' limit 1`,
  );
  if (meta[0]?.value === SEED_VERSION) {
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
        homepage_json: {},
        locale_json: {
          en: {
            headline: site.subhead,
            narrative: site.narrative,
          },
        },
      },
      actor,
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
      experience_mode: catalog?.mode ?? "github-explorer",
      experience_config: catalog
        ? {
            honestyLabel: catalog.honestyLabel,
            processNodes: catalog.processNodes ?? [],
            walkthrough: catalog.walkthrough ?? [],
            fileHints: catalog.fileHints ?? [],
          }
        : {},
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
        canva_status: item.originNote.includes("Canva") ? "pending" : "not_configured",
      },
      actor,
    );
  }

  await sql.query(
    `insert into cms_meta (key, value) values ('seed_version', $1)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [SEED_VERSION],
  );
  return { seeded: true, skipped: false };
}

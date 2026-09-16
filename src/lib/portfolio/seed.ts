import { archiveItems } from "../../content/archive.ts";
import { projects } from "../../content/projects.ts";
import { site } from "../../content/site.ts";
import { parseGithubRepoUrl } from "./github.ts";
import { experienceSeedBySlug } from "./experience-seed.ts";
import type { Sql } from "./sql.ts";
import { jsonParam } from "./sql.ts";

export const SEED_NAME = "portfolio-cms-v1";

export async function seedPortfolio(sql: Sql): Promise<{ seeded: number; skipped: boolean }> {
  const before = await sql.query<{ n: number | string }>(
    `select count(*)::int as n from projects`,
  );
  const existing = Number(before[0]?.n ?? 0);

  await sql.query(
    `insert into site_settings (id, profile_json, homepage_json, seo_json, i18n_json)
     values ('default', $1::jsonb, $2::jsonb, $3::jsonb, $4::jsonb)
     on conflict (id) do nothing`,
    [
      jsonParam({
        nameZh: site.nameZh,
        nameEn: site.nameEn,
        person: site.person,
        role: site.role,
        headline: site.headline,
        subhead: site.subhead,
        narrative: site.narrative,
        email: site.email,
        github: site.github,
        githubHandle: site.githubHandle,
        location: site.location,
      }),
      jsonParam({
        featuredIntro: "只放最能代表定位的 8 件。狀態按真實進度標示。",
      }),
      jsonParam({
        title: "Luminous Studio · 柏能",
        description: site.headline,
      }),
      jsonParam({ defaultLocale: "zh" }),
    ],
  );

  let seeded = 0;
  for (const [index, project] of projects.entries()) {
    const parsed = project.links.github
      ? parseGithubRepoUrl(project.links.github)
      : null;
    const exp = experienceSeedBySlug(project.slug);
    const result = await sql.query<{ slug: string }>(
      `insert into projects (
        id, slug, title, title_en, subtitle, category, year,
        product_status, publication_status, featured, sort_order,
        summary, problem, role,
        decisions_json, modalities_json, process_json, outputs_json,
        stack_json, limitations_json, media_json, source_evidence,
        github_url, github_owner, github_repo, github_sync_enabled, github_sync_status,
        live_demo_url, live_demo_label, live_demo_type, live_demo_embed_enabled, live_demo_status,
        experience_mode, experience_config, interaction_steps, experience_label,
        published_at
      ) values (
        $1,$2,$3,$4,$5,$6,$7,
        $8,'published',$9,$10,
        $11,$12,$13,
        $14::jsonb,$15::jsonb,$16::jsonb,$17::jsonb,
        $18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,
        $22,$23,$24,true,'not_configured',
        $25,$26,$27,false,$28,
        $29,$30::jsonb,$31::jsonb,$32,
        now()
      )
      on conflict (slug) do nothing
      returning slug`,
      [
        project.slug,
        project.slug,
        project.title,
        project.title,
        project.subtitle,
        project.category,
        project.year,
        project.status,
        project.featured,
        index,
        project.summary,
        project.problem,
        project.role,
        jsonParam(project.decisions),
        jsonParam(project.modalities),
        jsonParam(project.process),
        jsonParam(project.outputs),
        jsonParam(project.stack),
        jsonParam(project.limitations),
        jsonParam(project.media),
        jsonParam(project.sourceReferences),
        project.links.github ?? null,
        parsed && parsed.ok ? parsed.owner : null,
        parsed && parsed.ok ? parsed.repo : null,
        project.links.live ?? project.links.demo ?? null,
        project.links.live ? "公開網址（狀態可能變動）" : null,
        project.links.live ? "live" : null,
        project.links.live ? "not_configured" : "not_configured",
        exp?.mode ?? "github-explorer",
        jsonParam(exp?.config ?? {}),
        jsonParam(exp?.steps ?? []),
        exp?.label ?? null,
      ],
    );
    if (result[0]?.slug) seeded += 1;
  }

  for (const [index, item] of archiveItems.entries()) {
    await sql.query(
      `insert into archive_items (
        id, title, kind, year, summary, media_json, href, origin_note,
        publication_status, sort_order
      ) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,'published',$9)
      on conflict (id) do nothing`,
      [
        item.id,
        item.title,
        item.kind,
        item.year,
        item.summary,
        jsonParam(item.media ?? null),
        item.href ?? null,
        item.originNote,
        index,
      ],
    );
  }

  await sql.query(
    `insert into seed_ledger (name) values ($1) on conflict (name) do nothing`,
    [SEED_NAME],
  );

  const skipped = existing > 0 && seeded === 0;
  return { seeded, skipped };
}

export async function ensureSeeded(sql: Sql) {
  await seedPortfolio(sql);
}

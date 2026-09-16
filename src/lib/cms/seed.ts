import type { Sql } from "../db";
import { SEED_NAME, seedArchive, seedProjectValues, seedProjects, seedSite } from "./seed-data";

async function insertJson(sql: Sql, text: string, params: unknown[]) {
  await sql.query(text, params);
}

export async function ensureSeeded(sql: Sql): Promise<{ seeded: boolean; skipped: boolean }> {
  const existing = await sql.query<{ name: string }>(
    `select name from cms_seed_log where name = $1`,
    [SEED_NAME],
  );
  if (existing.length > 0) {
    return { seeded: false, skipped: true };
  }

  const site = seedSite();
  const settings = await sql.query(`select id from site_settings where id = 'default'`);
  if (settings.length === 0) {
    await insertJson(
      sql,
      `insert into site_settings (id, profile, homepage, seo, i18n) values ('default', $1::jsonb, $2::jsonb, $3::jsonb, '{}'::jsonb)`,
      [JSON.stringify(site.profile), JSON.stringify(site.homepage), JSON.stringify(site.seo)],
    );
  }

  for (const [index, project] of seedProjects.entries()) {
    const values = seedProjectValues(project, index);
    const found = await sql.query(`select id from projects where slug = $1`, [values.slug]);
    if (found.length > 0) continue;
    await sql.query(
      `insert into projects (
        id, slug, title, subtitle, summary, problem, role,
        decisions, modalities, process, outputs, stack, limitations,
        category, year, product_status, publication_status, featured, sort_order,
        media, github_url, github_owner, github_repo, github_branch,
        github_sync_enabled, github_sync_status, github_public_approved,
        live_demo_url, live_demo_label, live_demo_type, live_demo_embed_enabled, live_demo_status,
        experience_mode, experience_config, interaction_steps, source_evidence
      ) values (
        $1,$2,$3,$4,$5,$6,$7,
        $8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,
        $14,$15,$16,$17,$18,$19,
        $20::jsonb,$21,$22,$23,$24,
        $25,$26,$27,
        $28,$29,$30,$31,$32,
        $33,$34::jsonb,$35::jsonb,$36::jsonb
      )`,
      [
        values.id,
        values.slug,
        values.title,
        values.subtitle,
        values.summary,
        values.problem,
        values.role,
        JSON.stringify(values.decisions),
        JSON.stringify(values.modalities),
        JSON.stringify(values.process),
        JSON.stringify(values.outputs),
        JSON.stringify(values.stack),
        JSON.stringify(values.limitations),
        values.category,
        values.year,
        values.product_status,
        values.publication_status,
        values.featured,
        values.sort_order,
        JSON.stringify(values.media),
        values.github_url,
        values.github_owner,
        values.github_repo,
        values.github_branch,
        values.github_sync_enabled,
        values.github_sync_status,
        values.github_public_approved,
        values.live_demo_url,
        values.live_demo_label,
        values.live_demo_type,
        values.live_demo_embed_enabled,
        values.live_demo_status,
        values.experience_mode,
        JSON.stringify(values.experience_config),
        JSON.stringify(values.interaction_steps),
        JSON.stringify(values.source_evidence),
      ],
    );
  }

  for (const [index, item] of seedArchive.entries()) {
    const found = await sql.query(`select id from archive_items where id = $1`, [item.id]);
    if (found.length > 0) continue;
    await sql.query(
      `insert into archive_items (
        id, title, kind, year, summary, media, href, origin_note, publication_status, sort_order
      ) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,'published',$9)`,
      [
        item.id,
        item.title,
        item.kind,
        item.year,
        item.summary,
        item.media ? JSON.stringify(item.media) : null,
        item.href ?? null,
        item.originNote,
        index,
      ],
    );
  }

  await sql.query(`insert into cms_seed_log (name) values ($1)`, [SEED_NAME]);
  return { seeded: true, skipped: false };
}

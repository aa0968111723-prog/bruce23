import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { createProject, restoreRevision, saveProject, setPublication } from "./mutate.ts";
import { ensureSeeded } from "./seed.ts";
import { getPublishedProject, listPublishedProjects, sitemapSlugs } from "./queries.ts";
import type { Sql } from "../db.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function toSql(pg: PGlite): Sql {
  const run = async <T>(text: string, params: unknown[] = []) => {
    const res = await pg.query<T>(text, params);
    return res.rows;
  };
  const sql = (async <T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = run;
  return sql;
}

async function boot() {
  const pg = new PGlite();
  await pg.waitReady;
  const auth = readFileSync(join(root, "migrations/0001_auth.sql"), "utf8");
  const cms = readFileSync(join(root, "migrations/0002_portfolio_cms.sql"), "utf8");
  await pg.exec(auth);
  await pg.exec(cms);
  return { pg, sql: toSql(pg) };
}

describe("portfolio CMS persistence", () => {
  it("seeds once and keeps eight published projects", async () => {
    const { sql } = await boot();
    const first = await ensureSeeded(sql);
    const second = await ensureSeeded(sql);
    assert.equal(first.seeded, true);
    assert.equal(second.skipped, true);
    const list = await listPublishedProjects(sql);
    assert.equal(list.length, 8);
    const slugs = list.map((p) => p.slug).sort();
    assert.ok(slugs.includes("ai-director-os"));
    assert.ok(slugs.includes("tku-zen-ai"));
    const featuredFirst = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);
    assert.equal(featuredFirst[0].featured, true);
  });

  it("keeps drafts out of public lists, sitemap, and case lookup", async () => {
    const { sql } = await boot();
    await ensureSeeded(sql);
    const created = await createProject(
      sql,
      {
        slug: "hidden-draft",
        title: "Hidden Draft",
        category: "AI Product",
        product_status: "prototype",
        experience_mode: "media-gallery",
        subtitle: "n",
        summary: "draft only",
      },
      "admin-1",
    );
    assert.ok(created);
    const published = await listPublishedProjects(sql);
    assert.equal(published.some((p) => p.slug === "hidden-draft"), false);
    assert.equal(await getPublishedProject(sql, "hidden-draft"), null);
    const paths = await sitemapSlugs(sql);
    assert.equal(paths.includes("hidden-draft"), false);

    await setPublication(sql, created!.id, "published", "admin-1");
    assert.ok(await getPublishedProject(sql, "hidden-draft"));

    await setPublication(sql, created!.id, "unpublished", "admin-1");
    assert.equal(await getPublishedProject(sql, "hidden-draft"), null);
  });

  it("saves draft copy without using localStorage", async () => {
    const { sql } = await boot();
    await ensureSeeded(sql);
    const existing = await sql.query<{ id: string }>(`select id from projects where slug = 'framelab'`);
    await saveProject(
      sql,
      existing[0].id,
      {
        slug: "framelab",
        title: "FrameLab Draft Title",
        category: "Multimodal",
        product_status: "prototype",
        experience_mode: "timeline",
        subtitle: "x",
        summary: "updated in db",
      },
      "admin-1",
    );
    const row = await sql.query<{ title: string }>(`select title from projects where slug='framelab'`);
    assert.equal(row[0].title, "FrameLab Draft Title");
    const pub = await getPublishedProject(sql, "framelab");
    assert.equal(pub?.title, "FrameLab Draft Title");
  });

  it("restores a revision without dropping history", async () => {
    const { sql } = await boot();
    await ensureSeeded(sql);
    const existing = await sql.query<{ id: string; title: string }>(
      `select id, title from projects where slug = 'framelab'`,
    );
    const original = existing[0].title;
    await saveProject(
      sql,
      existing[0].id,
      {
        slug: "framelab",
        title: "FrameLab Restored Candidate",
        category: "Multimodal",
        product_status: "prototype",
        experience_mode: "timeline",
        subtitle: "x",
        summary: "candidate",
      },
      "admin-1",
    );
    const revs = await sql.query<{ id: string }>(
      `select id from project_revisions where project_id = $1 order by created_at asc`,
      [existing[0].id],
    );
    assert.ok(revs.length >= 1);
    await restoreRevision(sql, existing[0].id, revs[0].id, "admin-1");
    const after = await sql.query<{ title: string }>(
      `select title from projects where id = $1`,
      [existing[0].id],
    );
    assert.equal(after[0].title, original);
    const still = await sql.query<{ n: string }>(
      `select count(*)::text as n from project_revisions where project_id = $1`,
      [existing[0].id],
    );
    assert.ok(Number(still[0].n) >= 2);
  });
});

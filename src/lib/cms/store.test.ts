import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import {
  applyGithubSync,
  countProjects,
  createProjectRecord,
  getAdminProject,
  getPublishedProject,
  listPublishedArchive,
  listPublishedProjects,
  listRevisions,
  restoreRevision,
  saveProjectRecord,
  setPublication,
  toPreviewProject,
  upsertArchive,
} from "./store.ts";
import { ensureSeed } from "./seed.ts";
import { projectInputSchema } from "./schema.ts";
import type { Sql } from "../db.ts";
import { NotFoundError } from "./errors.ts";
import { projectCanvaInventory } from "../canva/inventory.ts";

function sqlFrom(pg: PGlite): Sql {
  const run = async <T>(text: string, params: unknown[] = []): Promise<T[]> => {
    const result = await pg.query<T>(text, params);
    return result.rows;
  };
  const sql = (async () => []) as unknown as Sql;
  sql.query = run;
  return sql;
}

async function setup() {
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(readFileSync(new URL("../../../migrations/0002_portfolio_cms.sql", import.meta.url), "utf8"));
  return { pg, sql: sqlFrom(pg) };
}

const sample = () =>
  projectInputSchema.parse({
    slug: "test-work",
    title: "Test Work",
    category: "AI Product",
    year: "2026",
    product_status: "prototype",
    publication_status: "draft",
    featured: true,
    sort_order: 1,
    summary: "draft only",
  });

describe("cms persistence", () => {
  it("lets an admin create a project", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(sql, sample(), "admin-1");
    assert.equal(created.slug, "test-work");
    assert.equal(created.publication_status, "draft");
  });

  it("keeps drafts off the public list", async () => {
    const { sql } = await setup();
    await createProjectRecord(sql, sample(), "admin-1");
    const published = await listPublishedProjects(sql);
    assert.equal(published.length, 0);
  });

  it("publish then unpublish updates public visibility", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(sql, sample(), "admin-1");
    await setPublication(sql, created.id, "published", "admin-1");
    assert.equal((await listPublishedProjects(sql)).length, 1);
    await setPublication(sql, created.id, "draft", "admin-1");
    assert.equal((await listPublishedProjects(sql)).length, 0);
  });

  it("save draft updates copy without publishing", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(sql, sample(), "admin-1");
    const saved = await saveProjectRecord(
      sql,
      created.id,
      { summary: "updated", publication_status: "draft" },
      "admin-1",
      "draft",
    );
    assert.equal(saved.summary, "updated");
    assert.equal(saved.publication_status, "draft");
    assert.equal((await listPublishedProjects(sql)).length, 0);
  });

  it("does not duplicate seed rows", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    const first = await countProjects(sql);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const second = await countProjects(sql);
    assert.equal(first, 8);
    assert.equal(second, 8);
  });

  it("sorts featured published works first", async () => {
    const { sql } = await setup();
    await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "later",
        title: "Later",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        publication_status: "published",
        featured: false,
        sort_order: 0,
      }),
      "admin-1",
    );
    await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "featured-one",
        title: "Featured",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        publication_status: "published",
        featured: true,
        sort_order: 5,
      }),
      "admin-1",
    );
    const list = await listPublishedProjects(sql);
    assert.equal(list[0].slug, "featured-one");
  });

  it("github sync does not overwrite Chinese narrative", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "framed",
        title: "中文標題",
        subtitle: "個人觀點",
        category: "Multimodal",
        year: "2026",
        product_status: "prototype",
        publication_status: "published",
        featured: false,
        sort_order: 1,
        summary: "這是作者的設計決策，不可以被 README 蓋掉。",
        problem: "問題敘事",
        github_url: "https://github.com/aa0968111723-prog/FrameLab",
        github_sync_enabled: true,
        github_sync_status: "pending",
      }),
      "admin-1",
    );
    await applyGithubSync(
      sql,
      created.id,
      {
        ok: true,
        status: "verified",
        owner: "aa0968111723-prog",
        repo: "FrameLab",
        branch: "main",
        metadata: {
          name: "FrameLab",
          description: "repo description",
          homepage: null,
          defaultBranch: "main",
          updatedAt: "2026-09-01T00:00:00Z",
          private: false,
          archived: false,
          htmlUrl: "https://github.com/aa0968111723-prog/FrameLab",
          language: "TypeScript",
        },
        readme: "# FrameLab",
        languages: { TypeScript: 10 },
        topics: ["animation"],
        latestCommit: { sha: "abc1234dead", message: "docs" },
        fileTree: [{ path: "README.md", type: "file", size: 12 }],
      },
      "admin-1",
    );
    const after = await getAdminProject(sql, created.id);
    assert.equal(after.title, "中文標題");
    assert.equal(after.summary, "這是作者的設計決策，不可以被 README 蓋掉。");
    assert.equal(after.problem, "問題敘事");
    assert.equal(after.github_readme, "# FrameLab");
    assert.equal(after.github_sync_status, "verified");
  });

  it("lets an admin preview a draft without putting it on the public site", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(sql, sample(), "admin-1");
    assert.equal((await listPublishedProjects(sql)).length, 0);
    const preview = toPreviewProject(created);
    assert.equal(preview.slug, "test-work");
    assert.equal(preview.title, "Test Work");
    assert.equal(preview.summary, "draft only");
  });

  it("hides drafts from getPublishedProject and sitemap-facing lists", async () => {
    const { sql } = await setup();
    await createProjectRecord(sql, sample(), "admin-1");
    await assert.rejects(() => getPublishedProject(sql, "test-work"), NotFoundError);
    assert.equal((await listPublishedProjects(sql)).length, 0);
  });

  it("archive then restore updates public visibility", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({ ...sample(), publication_status: "published" }),
      "admin-1",
    );
    assert.equal((await listPublishedProjects(sql)).length, 1);
    await setPublication(sql, created.id, "archived", "admin-1");
    assert.equal((await listPublishedProjects(sql)).length, 0);
    await setPublication(sql, created.id, "published", "admin-1");
    assert.equal((await listPublishedProjects(sql)).length, 1);
  });

  it("keeps a revision history and can restore a previous snapshot", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(sql, sample(), "admin-1");
    await saveProjectRecord(sql, created.id, { title: "Changed Title" }, "admin-1", "save");
    const revisions = await listRevisions(sql, created.id);
    assert.ok(revisions.length >= 2);
    const beforeChange = revisions.find((item) => item.note === "save");
    assert.ok(beforeChange);
    const restored = await restoreRevision(sql, created.id, beforeChange.id, "admin-1");
    assert.equal(restored.title, "Test Work");
  });

  it("excludes draft archive items from the public archive", async () => {
    const { sql } = await setup();
    await upsertArchive(
      sql,
      {
        slug: "hidden-poster",
        title: "Hidden poster",
        kind: "graphic",
        year: "2026",
        summary: "draft",
        origin_note: "test",
        publication_status: "draft",
        sort_order: 0,
        canva_status: "not_configured",
      },
      "admin-1",
    );
    await upsertArchive(
      sql,
      {
        slug: "public-poster",
        title: "Public poster",
        kind: "graphic",
        year: "2026",
        summary: "live",
        origin_note: "test",
        publication_status: "published",
        sort_order: 1,
        canva_status: "not_configured",
      },
      "admin-1",
    );
    const published = await listPublishedArchive(sql);
    assert.equal(published.length, 1);
    assert.equal(published[0].slug, "public-poster");
  });

  it("persists a real Canva share URL onto the public slice without inventing one", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        canva_share_url: "https://www.canva.com/design/DAGadminPasted/view",
        canva_status: "pending",
      }),
      "admin-1",
    );
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.canva.designId, "DAGadminPasted");
    assert.equal(published.canva.shareUrl, "https://www.canva.com/design/DAGadminPasted/view");
    assert.ok(published.canva.embedUrl?.includes("embed"));
  });

  it("seeds honest Canva fields for every featured work", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    const expected = projectCanvaInventory();
    const published = await listPublishedProjects(sql);
    assert.equal(published.length, 8);
    for (const project of published) {
      const fields = expected[project.slug];
      assert.equal(project.canva.shareUrl, fields.shareUrl, project.slug);
      assert.equal(project.canva.embedUrl, fields.embedUrl, project.slug);
      assert.equal(project.canva.status, fields.status, project.slug);
    }
    const archive = await listPublishedArchive(sql);
    const zen = archive.find((item) => item.id === "tku-zen-poster");
    assert.equal(zen?.canva.status, "unavailable");
    assert.equal(zen?.canva.shareUrl, null);
  });

  it("saves homepage highlight slugs without wiping locale_json", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    const { getSiteSettings, saveSiteSettings } = await import("./store.ts");
    const current = await getSiteSettings(sql);
    assert.ok(current);
    await saveSiteSettings(
      sql,
      {
        name_zh: current.name_zh,
        name_en: current.name_en,
        person: current.person,
        role: current.role,
        headline: current.headline,
        subhead: current.subhead,
        narrative: current.narrative,
        email: current.email,
        github: current.github,
        github_handle: current.github_handle,
        location: current.location,
        seo_title: current.seo_title,
        seo_description: current.seo_description,
        homepage_json: { highlightSlugs: ["framelab", "planform"] },
        locale_json: { zh: { headline: "中文" }, en: { headline: "EN" } },
      },
      "admin-1",
    );
    const saved = await getSiteSettings(sql);
    assert.deepEqual(saved?.homepage_json.highlightSlugs, ["framelab", "planform"]);
    assert.equal(saved?.locale_json.zh?.headline, "中文");
    assert.equal(saved?.locale_json.en?.headline, "EN");
    assert.equal(saved?.headline, current.headline);
  });

  it("publishes structured experience_config so the public page can read it", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        experience_mode: "timeline",
        interaction_steps: ["看幀", "開 onion-skin"],
        experience_config: {
          honestyLabel: "saved-timeline",
          intro: "後台存下來的時間軸",
          processNodes: [
            {
              id: "engine",
              label: "引擎",
              summary: "時間軸引擎",
              githubPath: "src/lib/domain/timeline-engine.ts",
              purpose: "時間軸",
              stage: "時間軸",
            },
          ],
          timeline: {
            frames: [
              { i: 3, kind: "key", x: 12, y: 40 },
              { i: 4, kind: "generated", x: 90, y: 20, problem: true },
            ],
            onionDefault: false,
            demoDisclaimer: "示範，不是 GPU。",
          },
        },
      }),
      "admin-1",
    );
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.experienceMode, "timeline");
    assert.equal(published.experienceConfig.honestyLabel, "saved-timeline");
    assert.equal(published.experienceConfig.intro, "後台存下來的時間軸");
    assert.equal(published.experienceConfig.processNodes?.[0]?.githubPath, "src/lib/domain/timeline-engine.ts");
    assert.equal(published.experienceConfig.timeline?.frames[1]?.kind, "generated");
    assert.equal(published.experienceConfig.timeline?.frames[1]?.problem, true);
    assert.equal(published.experienceConfig.timeline?.onionDefault, false);
    assert.deepEqual(published.interactionSteps, ["看幀", "開 onion-skin"]);
  });

  it("fills missing nested experience keys on seed complement without overwriting saved copy", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(`update projects set experience_config = $2::jsonb where slug = $1`, [
      "framelab",
      JSON.stringify({ honestyLabel: "kept-label" }),
    ]);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const framelab = await getPublishedProject(sql, "framelab");
    assert.equal(framelab.experienceConfig.honestyLabel, "kept-label");
    assert.ok((framelab.experienceConfig.timeline?.frames.length ?? 0) >= 3);
    const director = await getPublishedProject(sql, "ai-director-os");
    assert.ok(director.experienceConfig.processNodes?.some((node) => node.id === "project"));
  });
});

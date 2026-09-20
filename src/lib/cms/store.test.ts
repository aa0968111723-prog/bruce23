import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import {
  applyGithubSync,
  countProjects,
  createProjectRecord,
  getAdminProject,
  getAdminProjectBySlug,
  getPublishedProject,
  listPublishedArchive,
  listPublishedProjects,
  listRevisions,
  restoreRevision,
  saveProjectRecord,
  serializePublicProject,
  setPublication,
  toPreviewProject,
  upsertArchive,
  persistDemoVerify,
  demoTypeFromVerify,
  getSiteSettings,
  saveSiteSettings,
  listAdminArchive,
} from "./store.ts";
import { ensureSeed } from "./seed.ts";
import { parseProjectPatch, projectInputSchema } from "./schema.ts";
import type { Sql } from "../db.ts";
import { NotFoundError } from "./errors.ts";
import { projectCanvaInventory } from "../canva/inventory.ts";
import { howItWorksSteps } from "../experiences/resolve.ts";
import { publicSitemapPaths } from "./sitemap.ts";
import { publishedCreativeWorkJsonLd } from "./jsonld.ts";
import { resolveHomepageCopy } from "./public-site.ts";
import { ARCHIVE_ITEM_IDS, archiveLocaleEn, FEATURED_WORK_SLUGS, featuredProjectLocaleEn, siteLocaleEn } from "../../content/locale-en.ts";

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
  await pg.exec(readFileSync(new URL("../../../migrations/0003_archive_locale.sql", import.meta.url), "utf8"));
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
    const published = await listPublishedProjects(sql);
    assert.equal(published.length, 1);
    assert.equal(published[0].slug, "test-work");
    assert.equal(publishedCreativeWorkJsonLd(published[0]).url, "/work/test-work");
    assert.equal(
      publicSitemapPaths(published.map((item) => item.slug)).includes("/work/test-work"),
      true,
    );
    const live = await getPublishedProject(sql, "test-work");
    assert.equal(publishedCreativeWorkJsonLd(live).name, "Test Work");
    await setPublication(sql, created.id, "draft", "admin-1");
    const unpublished = await listPublishedProjects(sql);
    assert.equal(unpublished.length, 0);
    assert.equal(
      publicSitemapPaths(unpublished.map((item) => item.slug)).includes("/work/test-work"),
      false,
    );
    assert.equal(
      unpublished.map((item) => publishedCreativeWorkJsonLd(item).url).includes("/work/test-work"),
      false,
    );
    await assert.rejects(() => getPublishedProject(sql, "test-work"), NotFoundError);
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
    assert.equal(first, 18);
    assert.equal(second, 18);
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
    const published = await listPublishedProjects(sql);
    assert.equal(published.length, 0);
    assert.equal(
      publicSitemapPaths(published.map((item) => item.slug)).includes("/work/test-work"),
      false,
    );
    assert.equal(
      published.map((item) => publishedCreativeWorkJsonLd(item).url).includes("/work/test-work"),
      false,
    );
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

  it("reads zh/en locale onto the public project payload", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        title: "Row title",
        summary: "row summary",
        locale_json: {
          zh: { title: "中文標題", summary: "中文摘要", seoTitle: "SEO 中" },
          en: { title: "English title", seoTitle: "SEO EN" },
        },
      }),
      "admin-1",
    );
    const live = serializePublicProject(created);
    assert.equal(live.title, "Row title");
    assert.equal(live.summary, "row summary");
    assert.equal(live.seoTitle, "SEO 中");
    assert.equal(live.locale.en?.title, "English title");
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.title, "Row title");
    const blank = serializePublicProject({
      ...created,
      title: "",
      summary: "",
      seo_title: null,
      locale_json: created.locale_json,
    } as typeof created);
    assert.equal(blank.title, "中文標題");
    assert.equal(blank.summary, "中文摘要");
  });

  it("seeds real English overlays for site copy and all eight featured works", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    const settings = await getSiteSettings(sql);
    assert.equal(settings?.locale_json.en?.headline, siteLocaleEn.headline);
    assert.equal(settings?.locale_json.en?.narrative, siteLocaleEn.narrative);
    assert.notEqual(settings?.headline, settings?.locale_json.en?.headline);
    assert.notEqual(settings?.narrative, settings?.locale_json.en?.narrative);
    assert.equal(settings?.narrative, "我把 AI、設計、影像、動畫、3D、互動與真實工作流程，轉化成看得懂、用得上的數位體驗。");
    for (const slug of FEATURED_WORK_SLUGS) {
      const admin = await getAdminProjectBySlug(sql, slug);
      const en = featuredProjectLocaleEn[slug];
      assert.notEqual(admin.locale_json.en?.title, admin.title, slug);
      assert.notEqual(admin.locale_json.en?.summary, admin.summary, slug);
      assert.equal(admin.locale_json.en?.title, en.title);
      assert.equal(admin.locale_json.en?.summary, en.summary);
      assert.equal(admin.locale_json.en?.problem, en.problem);
      assert.equal(admin.locale_json.en?.role, en.role);
      assert.notDeepEqual(admin.locale_json.en?.decisions, admin.decisions, slug);
      assert.notDeepEqual(admin.locale_json.en?.limitations, admin.limitations, slug);
      assert.deepEqual(admin.locale_json.en?.decisions, en.decisions);
      assert.deepEqual(admin.locale_json.en?.limitations, en.limitations);
      assert.deepEqual(admin.locale_json.en?.process, en.process);
      assert.deepEqual(admin.locale_json.en?.outputs, en.outputs);
      assert.notDeepEqual(admin.locale_json.en?.modalities, admin.modalities, slug);
      assert.deepEqual(admin.locale_json.en?.modalities, en.modalities);
      const live = serializePublicProject(admin);
      assert.equal(live.locale.en?.title, en.title);
      assert.equal(live.locale.en?.summary, en.summary);
      assert.equal(admin.publication_status, "published");
    }
    for (const id of ARCHIVE_ITEM_IDS) {
      const row = (await listAdminArchive(sql)).find((item) => item.id === id || item.slug === id);
      const en = archiveLocaleEn[id];
      assert.ok(row, id);
      assert.notEqual(row.locale_json.en?.title, row.title, id);
      assert.notEqual(row.locale_json.en?.summary, row.summary, id);
      assert.equal(row.locale_json.en?.title, en.title);
      assert.equal(row.locale_json.en?.summary, en.summary);
      const live = (await listPublishedArchive(sql)).find((item) => item.id === id);
      assert.equal(live?.locale.en?.title, en.title);
    }
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

  it("keeps a Canva /d/ short URL on save without treating it as a verified embed", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        canva_share_url: "https://www.canva.com/d/ysK5sYZisVEjZFe",
        canva_status: "pending",
      }),
      "admin-1",
    );
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.canva.shareUrl, "https://www.canva.com/d/ysK5sYZisVEjZFe");
    assert.equal(published.canva.embedUrl, null);
    assert.equal(published.canva.designId, null);
    assert.equal(published.canva.status, "pending");
  });

  it("keeps a resolved Canva embed when share is still a /d/ short URL", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        canva_share_url: "https://www.canva.com/d/ysK5sYZisVEjZFe",
        canva_embed_url: "https://www.canva.com/design/DAGkeepOnSave/view?embed",
        canva_status: "pending",
      }),
      "admin-1",
    );
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.canva.designId, "DAGkeepOnSave");
    assert.ok(published.canva.embedUrl?.includes("embed"));
    assert.notEqual(published.canva.status, "verified");
  });

  it("never persists Canva verified from an admin save", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        canva_share_url: "https://www.canva.com/design/DAGadminPasted/view",
        canva_status: "verified",
      }),
      "admin-1",
    );
    assert.equal(created.canva_status, "pending");
  });

  it("keeps an existing GitHub tree when a later sync is stale without a tree", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
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
        fileTree: [{ path: "README.md", type: "file", size: 12 }],
      },
      "admin-1",
    );
    await applyGithubSync(
      sql,
      created.id,
      {
        ok: true,
        status: "stale",
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
      },
      "admin-1",
    );
    const after = await getAdminProject(sql, created.id);
    assert.equal(after.github_file_tree?.[0]?.path, "README.md");
    assert.equal(after.github_sync_status, "stale");
  });

  it("updates canva_share_url from an integrations-style save and rejects evil.com", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(sql, sample(), "admin-1");
    const saved = await saveProjectRecord(
      sql,
      created.id,
      { canva_share_url: "https://www.canva.com/design/DAGadminPasted/view" },
      "admin-1",
      "integrations",
    );
    assert.equal(saved.canva_share_url, "https://www.canva.com/design/DAGadminPasted/view");
    assert.equal(saved.canva_status, "pending");
    assert.notEqual(saved.canva_status, "verified");
    const rejected = await saveProjectRecord(
      sql,
      created.id,
      {
        canva_share_url: "https://evil.com/design/DAGhacked/view",
        canva_embed_url: null,
        canva_design_id: null,
      },
      "admin-1",
      "integrations",
    );
    assert.equal(rejected.canva_share_url, null);
    assert.equal(rejected.canva_embed_url, null);
    assert.equal(rejected.canva_status, "failed");
  });

  it("keeps Chinese narrative when an integrations save clears Canva", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        title: "中文標題",
        summary: "中文摘要不可被清空",
        locale_json: {
          zh: { title: "中文標題", summary: "中文摘要不可被清空" },
          en: { title: "English title" },
        },
      }),
      "admin-1",
    );
    const patch = parseProjectPatch({
      id: created.id,
      canva_share_url: null,
      canva_embed_url: null,
      canva_design_id: null,
      live_demo_url: null,
      experience_mode: created.experience_mode,
    });
    assert.equal("summary" in patch, false);
    assert.equal("locale_json" in patch, false);
    assert.equal("title" in patch, false);
    const { id, ...fields } = patch;
    const cleared = await saveProjectRecord(sql, id, fields, "admin-1", "integrations");
    assert.equal(cleared.title, "中文標題");
    assert.equal(cleared.summary, "中文摘要不可被清空");
    assert.equal(cleared.locale_json.zh?.title, "中文標題");
    assert.equal(cleared.locale_json.zh?.summary, "中文摘要不可被清空");
    assert.equal(cleared.locale_json.en?.title, "English title");
    assert.equal(cleared.canva_share_url, null);
  });

  it("drops non-allowlisted Canva URLs instead of storing them as share links", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        canva_share_url: "https://evil.example/design/DAGfake/view",
        canva_thumbnail_url: "https://document-export.canva.com/expired.png",
        canva_status: "pending",
      }),
      "admin-1",
    );
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.canva.shareUrl, null);
    assert.equal(published.canva.embedUrl, null);
    assert.equal(published.canva.thumbnailUrl, null);
    assert.equal(published.canva.status, "failed");
  });

  it("seeds honest Canva fields for every featured work", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    const expected = projectCanvaInventory();
    const published = await listPublishedProjects(sql);
    assert.equal(published.length, 18);
    assert.equal(published.filter((item) => item.featured).length, 8);
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
    assert.match(zen?.summary ?? "", /SVG 轉譯/);
  });

  it("seeded how-it-works uses experience_config instead of duplicating process", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(`update projects set interaction_steps = process`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const published = await listPublishedProjects(sql);
    const folio = published.find((item) => item.slug === "folio");
    const director = published.find((item) => item.slug === "ai-director-os");
    const folioHow = howItWorksSteps(folio!);
    assert.ok(folioHow.some((step) => step.includes("畫布") && step.includes("文件模型")));
    assert.ok(howItWorksSteps(director!).some((step) => step.includes("專案")));
    assert.notEqual(folioHow[0], folio?.process[0]);
  });

  it("rewrites already-seeded archive copy that claimed live Canva or original photos", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update archive_items set summary = '縮圖來自 Canva 原作匯出，不是生成圖。' where slug = $1 or id = $1`,
      ["tku-zen-poster"],
    );
    await sql.query(`delete from cms_meta where key = 'archive_honesty_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const archive = await listPublishedArchive(sql);
    const zen = archive.find((item) => item.id === "tku-zen-poster");
    const photo = archive.find((item) => item.id === "landscape-series");
    assert.match(zen?.summary ?? "", /不是 Canva 嵌入/);
    assert.doesNotMatch(zen?.summary ?? "", /原作匯出/);
    assert.match(photo?.summary ?? "", /不是原作照片/);
  });

  it("replaces the stale 455 Hermes URL with the dashboard domain", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set title = 'Hermes Agent',
           summary = '公開網域 455.zeabur.app',
           live_demo_url = 'https://455.zeabur.app/sessions',
           source_evidence = $2::jsonb,
           locale_json = $3::jsonb
       where slug = $1`,
      [
        "hermes-agent",
        JSON.stringify([
          {
            label: "公開站 · 455.zeabur.app",
            href: "https://455.zeabur.app/sessions",
            note: "stale",
            kind: "demo",
          },
        ]),
        JSON.stringify({
          zh: { title: "Hermes Agent", summary: "公開網域 455.zeabur.app" },
          en: { title: "Hermes Agent", summary: "Public domain 455.zeabur.app" },
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'hermes_dashboard_live_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const hermes = await getPublishedProject(sql, "hermes-agent");
    assert.equal(hermes.title, "Hermes Agent - Dashboard");
    assert.equal(hermes.demo.url, "https://hermes-agent-k7q2.zeabur.app/");
    assert.match(hermes.summary, /hermes-agent-k7q2\.zeabur\.app/);
    assert.doesNotMatch(hermes.summary, /455\.zeabur\.app/);
    assert.ok(hermes.sourceEvidence.some((item) => item.href === "https://hermes-agent-k7q2.zeabur.app/"));
    assert.ok(!hermes.sourceEvidence.some((item) => item.href?.includes("455.zeabur.app")));
    assert.equal(hermes.locale.en?.title, "Hermes Agent - Dashboard");
  });

  it("rewrites FrameLab live URL and cabin 502 notes to the ZH canonical host", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set live_demo_url = $2,
           source_evidence = $3::jsonb,
           decisions = $4::jsonb,
           process = $5::jsonb,
           limitations = $6::jsonb
       where slug = $1`,
      [
        "framelab",
        "https://lunar-falcon-8p2r.zeabur.app",
        JSON.stringify([
          {
            label: "工作站 · cabin-shale-k7q2.zeabur.app",
            href: "https://cabin-shale-k7q2.zeabur.app",
            note: "Zeabur 服務 cabin-shale-raven-swift，完整 FrameLab 工作站。本次探測可能 502。GitHub 目前為私有。",
            kind: "demo",
          },
        ]),
        JSON.stringify(["stale identity"]),
        JSON.stringify(["匯入影片或圖序"]),
        JSON.stringify(["stale limitation"]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'framelab_identity_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const frame = await getPublishedProject(sql, "framelab");
    assert.equal(frame.demo.url, "https://cabin-shale-k7q2.zeabur.app");
    assert.ok(frame.sourceEvidence.some((item) => item.href === "https://cabin-shale-k7q2.zeabur.app"));
    assert.ok(frame.sourceEvidence.some((item) => item.href === "https://lunar-falcon-8p2r.zeabur.app"));
    assert.ok(frame.sourceEvidence.every((item) => !/可能 502/.test(item.note ?? "")));
    assert.ok(frame.sourceEvidence.every((item) => !/目前為私有/.test(item.note ?? "")));
    assert.match(
      frame.sourceEvidence.find((item) => item.href?.includes("cabin-shale-raven-swift"))?.note ?? "",
      /private:false/,
    );
    assert.ok(frame.decisions.some((item) => item.includes("不是兩個作品")));
    assert.ok(frame.process.some((item) => item.includes("登入工作室")));
    assert.ok(frame.process.some((item) => item.includes("給它關鍵影格。只修壞掉的那幾格")));
    assert.ok(frame.process.every((item) => !item.includes("匯入影片或圖序")));
    assert.match(frame.experienceConfig.intro ?? "", /登入工作室/);
    assert.match(frame.experienceConfig.intro ?? "", /不是生成網站/);
    assert.ok(frame.limitations.some((item) => item.includes("工作室需登入")));
    assert.ok(frame.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.match(frame.locale.en?.limitations?.at(-1) ?? "", /studio needs sign-in/i);
  });

  it("quotes FrameLab live landing CTAs without claiming a repair coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set decisions = $2::jsonb, experience_config = $3::jsonb
       where slug = $1`,
      [
        "framelab",
        JSON.stringify(["公開站首屏是登陸頁「給它關鍵影格。只修壞掉的那幾格。」進入工作室要登入。"]),
        JSON.stringify({
          honestyLabel: "作品集互動展示",
          intro: "公開站首屏是登陸頁「給它關鍵影格。只修壞掉的那幾格。」進入工作室要登入。這裡是作品集示範時間軸，不是線上工作室。",
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'framelab_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const frame = await getPublishedProject(sql, "framelab");
    assert.match(frame.experienceConfig.intro ?? "", /登入工作室/);
    assert.match(frame.experienceConfig.intro ?? "", /系統狀態/);
    assert.match(frame.experienceConfig.intro ?? "", /不是生成網站/);
    assert.doesNotMatch(frame.experienceConfig.intro ?? "", /進入工作室要登入/);
    assert.ok(frame.decisions.some((item) => item.includes("不是生成網站")));
    assert.ok(frame.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites stale 502 notes for 小財 and the Zen desk after a live 200 probe", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set limitations = $2::jsonb, source_evidence = $3::jsonb, experience_mode = $4
       where slug = $1`,
      [
        "xiaocai",
        JSON.stringify(["本次探測曾出現 502。連結保留，狀態會隨部署變動。"]),
        JSON.stringify([
          {
            label: "公開站 · untitled-5.zeabur.app",
            href: "https://untitled-5.zeabur.app",
            note: "Zeabur 服務 untitled-5。本次探測可能 502，仍保留連結。",
            kind: "demo",
          },
        ]),
        "interactive-walkthrough",
      ],
    );
    await sql.query(
      `update projects set limitations = $2::jsonb, source_evidence = $3::jsonb where slug = $1`,
      [
        "tku-zen-agent",
        JSON.stringify(["本次探測曾出現 502。與本地 tku-zen-ai 不是同一個產品。"]),
        JSON.stringify([
          {
            label: "公開站 · tku-zen-agent-k7f2.zeabur.app",
            href: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask",
            note: "Zeabur 服務 tku-zen-agent。建議 ?mode=ask。本次探測可能 502。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'stale_502_note_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const xiaocai = await getPublishedProject(sql, "xiaocai");
    const zen = await getPublishedProject(sql, "tku-zen-agent");
    assert.ok(xiaocai.sourceEvidence.every((item) => !/可能 502/.test(item.note ?? "")));
    assert.ok(xiaocai.limitations.every((item) => !/曾出現 502/.test(item)));
    assert.match(xiaocai.sourceEvidence[0]?.note ?? "", /HTTP 200/);
    assert.ok(zen.sourceEvidence.every((item) => !/可能 502/.test(item.note ?? "")));
    assert.match(zen.sourceEvidence[0]?.note ?? "", /授權碼/);
    assert.ok(zen.limitations.some((item) => item.includes("授權碼")));
    const xiaocaiAdmin = await getAdminProjectBySlug(sql, "xiaocai");
    assert.equal(xiaocaiAdmin.experience_mode, "media-gallery");
  });

  it("rewrites CUTOS 502 notes after a live health/ready probe", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set limitations = $2::jsonb, source_evidence = $3::jsonb
       where slug = $1`,
      [
        "cutos",
        JSON.stringify(["本次 Zeabur 狀態 SUSPENDED／502。連結保留。"]),
        JSON.stringify([
          {
            label: "公開站 · cutos.zeabur.app",
            href: "https://cutos.zeabur.app",
            note: "Zeabur 服務 cutos。本次探測 SUSPENDED／502。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'cutos_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const cutos = await getPublishedProject(sql, "cutos");
    assert.ok(cutos.limitations.every((item) => !/SUSPENDED／502/.test(item)));
    assert.ok(cutos.sourceEvidence.every((item) => !/SUSPENDED／502/.test(item.note ?? "")));
    assert.match(cutos.sourceEvidence[0]?.note ?? "", /health ok/);
    assert.ok(cutos.process.some((item) => item.includes("載入示範影片")));
    assert.ok(cutos.process.some((item) => item.includes("匯入影片")));
    assert.ok(cutos.process.some((item) => item.includes("內含停頓")));
    assert.ok(cutos.process.every((item) => !item.includes("可載入示範影片或上傳")));
    assert.match(cutos.experienceConfig.intro ?? "", /匯入影片/);
    assert.match(cutos.experienceConfig.intro ?? "", /載入示範影片/);
    assert.match(cutos.experienceConfig.intro ?? "", /內含停頓/);
    assert.match(cutos.experienceConfig.intro ?? "", /系統狀態/);
    assert.doesNotMatch(cutos.experienceConfig.intro ?? "", /可載入示範影片或上傳/);
    assert.doesNotMatch(cutos.experienceConfig.intro ?? "", /這是作品集逐步走查，不是線上產品本身/);
    assert.equal(cutos.experienceConfig.walkthrough?.[0]?.title, "匯入影片");
    assert.ok(cutos.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("quotes CUTOS live landing CTAs without claiming a demo-clip coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set decisions = $2::jsonb, experience_config = $3::jsonb
       where slug = $1`,
      [
        "cutos",
        JSON.stringify(["公開站首屏是「AI 對話式影片剪輯」與「匯入影片」。可載入示範影片或上傳。"]),
        JSON.stringify({
          honestyLabel: "作品集互動展示",
          intro: "公開站首屏是「AI 對話式影片剪輯」與「匯入影片」。可載入示範影片或上傳。這裡是作品集走查，不是線上剪輯器。",
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'cutos_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const cutos = await getPublishedProject(sql, "cutos");
    assert.match(cutos.experienceConfig.intro ?? "", /內含停頓/);
    assert.match(cutos.experienceConfig.intro ?? "", /系統狀態/);
    assert.match(cutos.experienceConfig.intro ?? "", /上傳影片…/);
    assert.doesNotMatch(cutos.experienceConfig.intro ?? "", /可載入示範影片或上傳/);
    assert.ok(cutos.decisions.some((item) => item.includes("內含停頓")));
    assert.ok(cutos.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites PLANFORM process to the live 我的專案 home without claiming canvas coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb, experience_config = $5::jsonb
       where slug = $1`,
      [
        "planform",
        JSON.stringify(["選教室模板與人數"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · planform-iso-k7d2.zeabur.app",
            href: "https://planform-iso-k7d2.zeabur.app",
            note: "AGENT_PROTOCOL.md 記載的 Zeabur 正式站。",
            kind: "demo",
          },
        ]),
        JSON.stringify({ intro: "等角場佈示意：旋轉、拖動物件、看用途與尺寸。" }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'planform_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const plan = await getPublishedProject(sql, "planform");
    assert.ok(plan.process[0]?.includes("我的專案"));
    assert.ok(plan.process[0]?.includes("新建專案"));
    assert.equal(plan.process.some((item) => item === "選教室模板與人數"), false);
    assert.match(plan.sourceEvidence.find((item) => item.href?.includes("planform-iso-k7d2"))?.note ?? "", /1\.0\.0/);
    assert.match(plan.sourceEvidence.find((item) => item.href?.includes("planform-iso-k7d2"))?.note ?? "", /我的專案/);
    assert.match(plan.experienceConfig.intro ?? "", /我的專案/);
    assert.match(plan.experienceConfig.intro ?? "", /新建專案/);
    assert.doesNotMatch(plan.experienceConfig.intro ?? "", /旋轉、拖動物件/);
    assert.ok(plan.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(plan.limitations.some((item) => item.includes("不做容留人數計算")));
    assert.ok(plan.sourceEvidence.some((item) => item.note.includes("docs/agent-handoff/AGENT_PROTOCOL.md")));
    assert.match(plan.locale.en?.process?.[0] ?? "", /My projects/i);
  });

  it("rewrites duigao process to the live What are we reviewing today home", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, decisions = $3::jsonb, limitations = $4::jsonb, source_evidence = $5::jsonb
       where slug = $1`,
      [
        "duigao",
        JSON.stringify(["上傳文宣版本"]),
        JSON.stringify(["stale decision"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · duigao-k7q2.zeabur.app",
            href: "https://duigao-k7q2.zeabur.app",
            note: "BASELINE.md 記載的 production 站。狀態會隨部署變動。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'duigao_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const room = await getPublishedProject(sql, "duigao");
    assert.ok(room.process[0]?.includes("duigao-k7q2.zeabur.app"));
    assert.ok(room.process.some((item) => item.includes("今天要對什麼")));
    assert.ok(room.process.every((item) => !item.includes("上傳文宣版本")));
    assert.ok(room.decisions.some((item) => item.includes("今天要對什麼")));
    assert.match(
      room.sourceEvidence.find((item) => item.href?.includes("duigao-k7q2"))?.note ?? "",
      /今天要對什麼/,
    );
    assert.match(room.experienceConfig.intro ?? "", /今天要對什麼/);
    assert.ok(room.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.match(room.locale.en?.process?.[1] ?? "", /What are we reviewing today/i);
  });

  it("rewrites Folio process to start at the live file cabinet", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb, experience_config = $5::jsonb
       where slug = $1`,
      [
        "folio",
        JSON.stringify(["在畫布建立文字／形狀／元件"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · canva2-k7qm.zeabur.app",
            href: "https://canva2-k7qm.zeabur.app",
            note: "Zeabur 服務 canva2。本次探測 RUNNING，標題 Folio。",
            kind: "demo",
          },
        ]),
        JSON.stringify({ intro: "依公開 canva2／Folio 指令層走一遍。不是站內 Canva 編輯器。" }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'folio_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const folio = await getPublishedProject(sql, "folio");
    assert.ok(folio.process[0]?.includes("文件櫃"));
    assert.ok(folio.process[0]?.includes("給 MCP 與內嵌網站"));
    assert.ok(folio.process[0]?.includes("開發者 SDK"));
    assert.match(
      folio.sourceEvidence.find((item) => item.href?.includes("canva2-k7qm"))?.note ?? "",
      /給 MCP 與內嵌網站/,
    );
    assert.match(folio.experienceConfig.intro ?? "", /文件櫃/);
    assert.match(folio.experienceConfig.intro ?? "", /給 MCP 與內嵌網站/);
    assert.match(folio.experienceConfig.intro ?? "", /開發者 SDK/);
    assert.match(folio.experienceConfig.intro ?? "", /不必登入/);
    assert.doesNotMatch(folio.experienceConfig.intro ?? "", /指令層走一遍/);
    assert.ok(folio.limitations.some((item) => item.includes("開發者 SDK")));
    assert.ok(folio.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites Hermes Console process to the live unsigned home", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb, experience_config = $5::jsonb
       where slug = $1`,
      [
        "hermes-console",
        JSON.stringify(["開啟工作區", "輸入關鍵詞看說明"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · 344.zeabur.app",
            href: "https://344.zeabur.app",
            note: "FEATURE_AUDIT_EDU.md 記載的正式站。",
            kind: "demo",
          },
        ]),
        JSON.stringify({
          conversation: {
            engine: "hermes-preview",
            starter: "這是作品集互動展示，沒有連到 Hermes 執行期。輸入關鍵詞看說明。",
            suggestions: ["海報", "連線", "任務"],
          },
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'hermes_console_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const desk = await getPublishedProject(sql, "hermes-console");
    assert.ok(desk.process[0]?.includes("344.zeabur.app"));
    assert.ok(desk.process.some((item) => item.includes("研究／創作／分析")));
    assert.match(
      desk.sourceEvidence.find((item) => item.href?.includes("344.zeabur.app"))?.note ?? "",
      /今天想做什麼/,
    );
    assert.match(desk.experienceConfig.conversation?.starter ?? "", /今天想做什麼/);
    assert.doesNotMatch(desk.experienceConfig.conversation?.starter ?? "", /輸入關鍵詞看說明/);
    assert.ok(desk.experienceConfig.conversation?.suggestions?.includes("研究"));
    assert.ok(!desk.experienceConfig.conversation?.suggestions?.includes("海報"));
    assert.ok(desk.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites SkateHub evidence with the live slogan probe", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb
       where slug = $1`,
      [
        "skatehub",
        JSON.stringify(["打開 dd-k3f9.zeabur.app", "逛裝備圖鑑", "記錄滑行里程"]),
        JSON.stringify(["個人紀錄依部署資料庫，不在此公開他人資料。"]),
        JSON.stringify([
          {
            label: "公開站 · dd-k3f9.zeabur.app",
            href: "https://dd-k3f9.zeabur.app",
            note: "Zeabur 服務 dd。本次探測 RUNNING。不是 Folio。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'skatehub_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const hub = await getPublishedProject(sql, "skatehub");
    assert.match(
      hub.sourceEvidence.find((item) => item.href?.includes("dd-k3f9"))?.note ?? "",
      /不要在家玩手機/,
    );
    assert.ok(hub.process.some((item) => item.includes("瀏覽裝備圖鑑")));
    assert.match(hub.experienceConfig.intro ?? "", /不要在家玩手機/);
    assert.ok(hub.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites Tamkang World process to the live 3D home controls", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb
       where slug = $1`,
      [
        "tamkang-world",
        JSON.stringify(["公開入口是校園通行證", "公開 JS 沒有開始巡禮", "公開 JS 沒有 WASD"]),
        JSON.stringify(["公開 JS 沒有「開始巡禮」「校園圖鑑」「WASD」。"]),
        JSON.stringify([
          {
            label: "公開站 · forge-bloom-k7xq.zeabur.app",
            href: "https://forge-bloom-k7xq.zeabur.app",
            note: "公開 JS 沒有「開始巡禮」「校園圖鑑」「WASD」。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'tamkang_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const world = await getPublishedProject(sql, "tamkang-world");
    assert.ok(world.process.some((item) => item.includes("開始巡禮")));
    assert.ok(world.process.some((item) => item.includes("校園圖鑑")));
    assert.ok(world.process.some((item) => item.includes("WASD 移動")));
    assert.ok(world.process.every((item) => !item.includes("公開 JS 沒有")));
    assert.match(
      world.sourceEvidence.find((item) => item.href?.includes("forge-bloom-k7xq"))?.note ?? "",
      /開始巡禮/,
    );
    assert.match(world.experienceConfig.intro ?? "", /開始巡禮/);
    assert.match(world.experienceConfig.intro ?? "", /校園通行證在 \/login/);
    assert.ok(world.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(world.limitations.every((item) => !item.includes("目前為私有")));
    assert.ok(world.limitations.every((item) => !item.includes("公開 JS 沒有")));
    assert.match(
      world.sourceEvidence.find((item) => item.href?.includes("forge-bloom-quiet-falcon"))?.note ?? "",
      /private:false/,
    );
  });

  it("rewrites Lumen conversation so it is not Hermes chrome", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set limitations = $2::jsonb, source_evidence = $3::jsonb, experience_config = $4::jsonb
       where slug = $1`,
      [
        "lumen",
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · ai-chat-8rq3.zeabur.app",
            href: "https://ai-chat-8rq3.zeabur.app",
            note: "Zeabur 服務 wood-ivory-blaze-maple。本次探測 RUNNING。",
            kind: "demo",
          },
        ]),
        JSON.stringify({}),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'lumen_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const orb = await getPublishedProject(sql, "lumen");
    assert.match(
      orb.sourceEvidence.find((item) => item.href?.includes("ai-chat-8rq3"))?.note ?? "",
      /拍照開始/,
    );
    assert.ok(orb.process.some((item) => item.includes("自動聽")));
    assert.ok(orb.process.some((item) => item.includes("長任務")));
    assert.ok(orb.decisions.every((item) => !item.includes("首頁只有")));
    assert.doesNotMatch(orb.experienceConfig.conversation?.starter ?? "", /Hermes 執行期/);
    assert.match(orb.experienceConfig.conversation?.starter ?? "", /想做什麼/);
    assert.match(orb.experienceConfig.intro ?? "", /自動聽/);
    assert.ok(orb.experienceConfig.conversation?.suggestions?.includes("拍照開始"));
    assert.ok(orb.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites Zen Studio process to the live What can we make today home", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb
       where slug = $1`,
      [
        "zen-studio",
        JSON.stringify(["從「生成 IG 貼文／Carousel／Story」開始"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · delta-horizon-k7f2.zeabur.app",
            href: "https://delta-horizon-k7f2.zeabur.app",
            note: "Zeabur 服務 delta-horizon-cliff-fern。本次探測 RUNNING。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'zen_studio_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const studio = await getPublishedProject(sql, "zen-studio");
    assert.ok(studio.process.some((item) => item.includes("今天可以創作什麼")));
    assert.ok(studio.process.some((item) => item.includes("AI 幫我創作")));
    assert.ok(studio.process.every((item) => !item.includes("看近期活動與 AI 建議")));
    assert.match(
      studio.sourceEvidence.find((item) => item.href?.includes("delta-horizon-k7f2"))?.note ?? "",
      /AI 幫我創作/,
    );
    assert.match(studio.experienceConfig.intro ?? "", /AI 幫我創作/);
    assert.ok(studio.limitations.some((item) => item.includes("沒有審核人")));
    assert.ok(studio.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("quotes Zen Studio live landing CTAs without claiming a generate coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set decisions = $2::jsonb, experience_config = $3::jsonb
       where slug = $1`,
      [
        "zen-studio",
        JSON.stringify(["首頁先問今天可以創作什麼，而不是先給後台選單。"]),
        JSON.stringify({
          honestyLabel: "作品集互動展示",
          intro: "公開站首屏是「今天可以創作什麼？」。到期內容沒有審核人、打開會自動發。這是作品集走查，不是 IG 後台。",
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'zen_studio_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const studio = await getPublishedProject(sql, "zen-studio");
    assert.match(studio.experienceConfig.intro ?? "", /AI 幫我創作/);
    assert.match(studio.experienceConfig.intro ?? "", /看月曆/);
    assert.match(studio.experienceConfig.intro ?? "", /現在發到期內容/);
    assert.doesNotMatch(studio.experienceConfig.intro ?? "", /看近期活動與 AI 建議/);
    assert.ok(studio.decisions.some((item) => item.includes("AI 幫我創作")));
    assert.ok(studio.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites Tamsui drama process to the live load splash without inventing episode one", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb, media = $5::jsonb
       where slug = $1`,
      [
        "tamsui-drama",
        JSON.stringify(["從第一集宮燈下的迎新開始", "依關卡走完校園"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · tku-tamsui-drama-world-k4x9.zeabur.app",
            href: "https://tku-tamsui-drama-world-k4x9.zeabur.app",
            note: "Zeabur 服務 tku-tamsui-drama-world。本次探測 RUNNING。",
            kind: "demo",
          },
        ]),
        JSON.stringify([
          {
            src: "/media/shots/tamsui-drama.jpg",
            alt: "淡江·淡水虛擬劇本世界：第一集宮燈下的迎新與五個關卡",
            kind: "image",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'tamsui_drama_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const drama = await getPublishedProject(sql, "tamsui-drama");
    assert.ok(drama.process.some((item) => item.includes("載入淡江·淡水世界")));
    assert.equal(drama.process.some((item) => item.includes("第一集")), false);
    assert.match(
      drama.sourceEvidence.find((item) => item.href?.includes("tku-tamsui-drama-world-k4x9"))?.note ?? "",
      /載入淡江·淡水世界/,
    );
    assert.ok(drama.limitations.some((item) => item.includes("沒有「第一集」")));
    assert.ok(drama.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(drama.media.every((item) => !item.alt.includes("第一集")));
  });

  it("rewrites Hermes Agent conversation to the live Sign in screen", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb, experience_config = $5::jsonb
       where slug = $1`,
      [
        "hermes-agent",
        JSON.stringify(["開啟工作區", "輸入關鍵詞看說明"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "Dashboard · hermes-agent-k7q2.zeabur.app",
            href: "https://hermes-agent-k7q2.zeabur.app/",
            note: "Zeabur 服務 hermes-agent（Dashboard）。",
            kind: "demo",
          },
        ]),
        JSON.stringify({}),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'hermes_agent_signin_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const agent = await getPublishedProject(sql, "hermes-agent");
    assert.ok(agent.process[0]?.includes("/login"));
    assert.match(
      agent.sourceEvidence.find((item) => item.href?.includes("hermes-agent-k7q2"))?.note ?? "",
      /Sign in — Hermes Agent/,
    );
    assert.match(agent.experienceConfig.conversation?.starter ?? "", /Sign in — Hermes Agent/);
    assert.doesNotMatch(agent.experienceConfig.conversation?.starter ?? "", /輸入關鍵詞看說明/);
    assert.ok(agent.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites Xiaocai process to the live tap-to-log slogan", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb
       where slug = $1`,
      [
        "xiaocai",
        JSON.stringify(["記一筆收支"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "公開站 · untitled-5.zeabur.app",
            href: "https://untitled-5.zeabur.app",
            note: "2026-09-19 探測 HTTP 200，標題「小財記帳」。不是 502。",
            kind: "demo",
          },
        ]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'xiaocai_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const ledger = await getPublishedProject(sql, "xiaocai");
    assert.ok(ledger.process.some((item) => item.includes("快速記一筆")));
    assert.ok(ledger.process.some((item) => item.includes("收支明細")));
    assert.match(
      ledger.sourceEvidence.find((item) => item.href?.includes("untitled-5"))?.note ?? "",
      /收支明細/,
    );
    assert.match(ledger.experienceConfig.galleryNote ?? "", /收支明細/);
    assert.match(ledger.experienceConfig.intro ?? "", /收支明細/);
    assert.ok(ledger.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("quotes Xiaocai live landing CTAs without claiming a ledger write coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set decisions = $2::jsonb, experience_config = $3::jsonb
       where slug = $1`,
      [
        "xiaocai",
        JSON.stringify(["公開站 untitled-5；GitHub 倉庫名是 -1。"]),
        JSON.stringify({
          honestyLabel: "公開站是小財記帳，不是 Folio 編輯器",
          intro: "公開站是小財記帳 untitled-5。這是作品集說明，不是 Folio 編輯器，也不是作品集後台。",
          galleryNote: "公開站首屏「點我一下，快速記一筆吧」。這是作品集媒體廊，不是記帳本體。",
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'xiaocai_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const ledger = await getPublishedProject(sql, "xiaocai");
    assert.match(ledger.experienceConfig.galleryNote ?? "", /收支明細/);
    assert.match(ledger.experienceConfig.intro ?? "", /收支明細/);
    assert.doesNotMatch(ledger.experienceConfig.galleryNote ?? "", /只顯示已發布媒體/);
    assert.ok(ledger.decisions.some((item) => item.includes("收支明細")));
    assert.ok(ledger.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites TKU Zen AI process to the public English welcome without claiming a chat coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb, limitations = $3::jsonb, source_evidence = $4::jsonb, experience_config = $5::jsonb,
           canva_status = 'unavailable', canva_share_url = null, canva_embed_url = null
       where slug = $1`,
      [
        "tku-zen-ai",
        JSON.stringify(["輸入一句心情", "對應意圖"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "光域重建 · TKU Zen 對話",
            href: "https://github.com/aa0968111723-prog/tku-zen-ai/blob/main/src/app/page.tsx",
            note: "亮色轉譯，不是產品截圖。",
            kind: "github",
          },
        ]),
        JSON.stringify({}),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'tku_zen_ai_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const zen = await getPublishedProject(sql, "tku-zen-ai");
    assert.ok(zen.process[0]?.includes("src/app/page.tsx"));
    assert.ok(zen.process.some((item) => item.includes("Welcome to TKU Zen AI")));
    assert.equal(zen.process.some((item) => item.includes("輸入一句心情")), false);
    assert.match(
      zen.sourceEvidence.find((item) => item.href?.includes("page.tsx"))?.note ?? "",
      /Welcome to TKU Zen AI/,
    );
    assert.match(zen.experienceConfig.conversation?.starter ?? "", /Take a breath/);
    assert.ok(zen.experienceConfig.conversation?.suggestions?.includes("I feel stressed about my exams"));
    assert.ok(zen.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(zen.limitations.some((item) => item.includes("公開站需授權碼")));
    assert.ok(zen.limitations.every((item) => !/代理，私有/.test(item)));
    assert.equal(zen.canva.shareUrl, null);
    assert.equal(zen.canva.status, "not_configured");
  });

  it("rewrites the Zen desk to the access-code gate and disables GitHub tree hydrate", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb,
           limitations = $3::jsonb,
           source_evidence = $4::jsonb,
           experience_config = $5::jsonb,
           github_url = $6,
           github_owner = $7,
           github_repo = $8,
           github_readme = $9,
           github_metadata = $10::jsonb,
           github_sync_enabled = true,
           github_file_tree = $11::jsonb
       where slug = $1`,
      [
        "tku-zen-agent",
        JSON.stringify(["打開工作台", "做網宣"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify([
          {
            label: "GitHub · tku-zen-agent",
            href: "https://github.com/aa0968111723-prog/tku-zen-agent",
            note: "公開儲存庫。",
            kind: "github",
          },
        ]),
        JSON.stringify({}),
        "https://github.com/aa0968111723-prog/tku-zen-agent",
        "aa0968111723-prog",
        "tku-zen-agent",
        "stale cached README",
        JSON.stringify({ private: false, htmlUrl: "https://github.com/aa0968111723-prog/tku-zen-agent" }),
        JSON.stringify([{ path: "knowledge/雲端文件/108學年度/活動企劃書.md", type: "file" }]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'tku_zen_agent_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const desk = await getPublishedProject(sql, "tku-zen-agent");
    const admin = await getAdminProjectBySlug(sql, "tku-zen-agent");
    assert.ok(desk.process.some((item) => item.includes("請輸入授權碼")));
    assert.ok(desk.process.some((item) => item.includes("淡江大學領袖禪學社")));
    assert.match(desk.experienceConfig.conversation?.starter ?? "", /請輸入授權碼/);
    assert.match(
      desk.sourceEvidence.find((item) => item.href?.includes("tku-zen-agent-k7f2"))?.note ?? "",
      /請先輸入授權碼/,
    );
    assert.ok(desk.sourceEvidence.every((item) => !item.href?.includes("github.com")));
    assert.ok(desk.sourceEvidence.some((item) => item.note.includes("不提供 GitHub href")));
    assert.ok(desk.limitations.some((item) => item.includes("visibility") && item.includes("來源文件")));
    assert.ok(desk.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.equal(desk.github.url, null);
    assert.equal(desk.github.owner, null);
    assert.equal(desk.github.repo, null);
    assert.equal(desk.github.readme, null);
    assert.equal(desk.github.syncStatus, "not_configured");
    assert.ok(desk.experienceConfig.conversation?.suggestions?.includes("來源"));
    assert.ok(!desk.experienceConfig.conversation?.suggestions?.includes("GitHub"));
    assert.doesNotMatch(desk.experienceConfig.conversation?.sourceNote ?? "", /knowledge\/雲端文件/);
    assert.equal(admin.github_sync_enabled, false);
    assert.equal(admin.github_url, null);
    assert.equal(admin.github_owner, null);
    assert.equal(admin.github_repo, null);
    assert.equal(admin.github_readme, null);
    assert.equal(admin.github_file_tree?.length ?? 0, 0);
  });

  it("clears a fake Poster Vision live URL when no public host exists", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set live_demo_url = $2, live_demo_type = $3, limitations = $4::jsonb
       where slug = $1`,
      [
        "poster-vision-ai",
        "https://github.com/aa0968111723-prog/poster-vision-ai",
        "link",
        JSON.stringify(["stale limitation"]),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'poster_vision_no_host_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const poster = await getPublishedProject(sql, "poster-vision-ai");
    assert.equal(poster.demo.url, null);
    assert.equal(poster.demo.type, "unavailable");
    assert.ok(poster.limitations.some((item) => item.includes("查無公開 Zeabur 網域")));
    assert.ok(poster.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("rewrites focus-challenge copy from the ty product contract and live health probe", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set summary = $2,
           problem = $3,
           process = $4::jsonb,
           limitations = $5::jsonb,
           experience_config = $6::jsonb
       where slug = $1`,
      [
        "focus-challenge",
        "stale summary：暖身、正式挑戰、即時看活動狀態。",
        "stale problem：不是再填一張表。",
        JSON.stringify(["stale process"]),
        JSON.stringify(["stale limitation"]),
        JSON.stringify({ intro: "這是作品集逐步走查，不是線上產品本身。" }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'ty_contract_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const game = await getPublishedProject(sql, "focus-challenge");
    assert.doesNotMatch(game.summary, /即時看活動狀態/);
    assert.doesNotMatch(game.problem, /不是再填一張表/);
    assert.match(game.summary, /看指令選顏色/);
    assert.match(game.summary, /正式參賽/);
    assert.match(game.problem, /仍要先填/);
    assert.ok(game.process.some((item) => item.includes("看指令選顏色")));
    assert.ok(game.process.some((item) => item.includes("正式參賽")));
    assert.ok(game.process.some((item) => item.includes("本名")));
    assert.ok(game.process.every((item) => !item.includes("登記畫面")));
    assert.ok(game.process.some((item) => item.includes("60 秒正式 Stroop")));
    assert.ok(game.limitations.some((item) => item.includes("/api/health")));
    assert.ok(game.limitations.some((item) => item.includes("67 筆")));
    assert.ok(game.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.match(game.sourceEvidence[0]?.note ?? "", /health ok/);
    assert.match(game.sourceEvidence[0]?.note ?? "", /看指令選顏色/);
    assert.match(game.sourceEvidence[0]?.note ?? "", /本名/);
    const walk = game.experienceConfig.walkthrough ?? [];
    assert.ok(walk.some((step) => step.title === "教學／練習"));
    assert.equal(walk.some((step) => step.title === "暖身"), false);
    assert.equal(walk[0]?.title, "攤位首屏");
    assert.match(game.experienceConfig.intro ?? "", /看指令選顏色/);
    assert.match(game.experienceConfig.intro ?? "", /正式參賽/);
    assert.match(game.experienceConfig.intro ?? "", /關主/);
    assert.doesNotMatch(game.experienceConfig.intro ?? "", /這是作品集逐步走查，不是線上產品本身/);
    assert.match(game.locale.en?.summary ?? "", /not an activity-status dashboard/i);
  });

  it("rewrites stale 502/paused notes for AI Director OS after a live 200 probe", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set process = $2::jsonb,
           limitations = $3::jsonb,
           source_evidence = $4::jsonb,
           live_demo_status = $5,
           live_demo_error = $6
       where slug = $1`,
      [
        "ai-director-os",
        JSON.stringify(["建立專案與世界觀快速層"]),
        JSON.stringify(["公開部署網址狀態會隨環境變動。"]),
        JSON.stringify([
          {
            label: "公開站 · ai-os-app.zeabur.app",
            href: "https://ai-os-app.zeabur.app",
            note: "INSTALL.md 與 Capacitor 記載的 HTML 公開站。禁止嵌入時只開新分頁。本次探測服務可能暫停。",
            kind: "demo",
          },
          {
            label: "自訂網域 · vexlark.co",
            href: "https://vexlark.co",
            note: "同一 Zeabur 服務 ai-os-app 的自訂網域。本次探測可能 502／暫停。",
            kind: "demo",
          },
        ]),
        "failed",
        "本次探測可能 502",
      ],
    );
    await sql.query(`delete from cms_meta where key = 'aios_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const aios = await getPublishedProject(sql, "ai-director-os");
    const aiosAdmin = await getAdminProjectBySlug(sql, "ai-director-os");
    assert.ok(aios.sourceEvidence.every((item) => !/可能 502|可能暫停/.test(item.note ?? "")));
    assert.ok(aios.limitations.every((item) => !/可能 502|可能暫停/.test(item)));
    assert.ok(aios.sourceEvidence.some((item) => /HTTP 200/.test(item.note ?? "") && item.href === "https://ai-os-app.zeabur.app"));
    assert.ok(aios.sourceEvidence.some((item) => /HTTP 200/.test(item.note ?? "") && item.href === "https://vexlark.co"));
    assert.ok(aios.process.some((item) => item.includes("進入工作台")));
    assert.ok(aios.process.some((item) => item.includes("把想法，變成團隊真正能完成的計畫")));
    assert.ok(aios.process.every((item) => !item.includes("建立專案與世界觀快速層")));
    assert.match(aios.experienceConfig.intro ?? "", /進入工作台/);
    assert.match(aios.experienceConfig.intro ?? "", /登入工作台/);
    assert.match(aios.experienceConfig.intro ?? "", /看看怎麼運作/);
    assert.doesNotMatch(aios.experienceConfig.intro ?? "", /進入工作台要登入/);
    assert.ok(aios.limitations.some((item) => item.includes("未驗證團隊創作核心流程")));
    assert.ok(aios.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.match(aios.locale.en?.limitations?.join(" ") ?? "", /Not 502 and not paused/i);
    assert.equal(aiosAdmin.live_demo_status, "pending");
    assert.equal(aiosAdmin.live_demo_error, null);
  });

  it("quotes AI Director OS live landing CTAs without claiming a team coreFlow", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(
      `update projects
       set decisions = $2::jsonb, experience_config = $3::jsonb
       where slug = $1`,
      [
        "ai-director-os",
        JSON.stringify(["公開站首屏是登陸頁「把想法，變成團隊真正能完成的計畫」。進入工作台要登入。"]),
        JSON.stringify({
          honestyLabel: "作品集互動展示",
          intro: "公開站首屏是登陸頁「把想法，變成團隊真正能完成的計畫」。進入工作台要登入。這裡是 GitHub 流程節點，不是線上控制台。",
        }),
      ],
    );
    await sql.query(`delete from cms_meta where key = 'aios_live_probe_version'`);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const aios = await getPublishedProject(sql, "ai-director-os");
    assert.match(aios.experienceConfig.intro ?? "", /進入工作台/);
    assert.match(aios.experienceConfig.intro ?? "", /登入工作台/);
    assert.match(aios.experienceConfig.intro ?? "", /看看怎麼運作/);
    assert.doesNotMatch(aios.experienceConfig.intro ?? "", /進入工作台要登入/);
    assert.ok(aios.decisions.some((item) => item.includes("看看怎麼運作")));
    assert.ok(aios.limitations.some((item) => item.includes("coreFlow 未過")));
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

  it("publishes saved experience_config.locale.en so public en can read it", async () => {
    const { overlayExperienceConfig } = await import("../locale/experience.ts");
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        ...sample(),
        publication_status: "published",
        experience_mode: "process-map",
        experience_config: {
          honestyLabel: "作品集互動展示",
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
          locale: {
            en: {
              processNodes: [{ id: "engine", label: "Engine desk" }],
            },
          },
        },
      }),
      "admin-1",
    );
    const published = await getPublishedProject(sql, created.slug);
    assert.equal(published.experienceConfig.processNodes?.[0]?.label, "引擎");
    assert.equal(published.experienceConfig.locale?.en?.processNodes?.[0]?.label, "Engine desk");
    const en = overlayExperienceConfig(published.experienceConfig, created.slug, "en");
    assert.equal(en.processNodes?.[0]?.label, "Engine desk");
    const empty = overlayExperienceConfig(
      {
        ...published.experienceConfig,
        locale: { en: { processNodes: [{ id: "engine", label: "" }] } },
      },
      created.slug,
      "en",
    );
    assert.equal(empty.processNodes?.[0]?.label, "引擎");
    const zh = overlayExperienceConfig(published.experienceConfig, created.slug, "zh");
    assert.equal(zh.processNodes?.[0]?.label, "引擎");
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

  it("restores empty FrameLab frames and appends GitHub export media on seed complement", async () => {
    const { sql } = await setup();
    await ensureSeed(sql, { skipGithubHydrate: true });
    await sql.query(`update projects set experience_config = $2::jsonb, media = $3::jsonb where slug = $1`, [
      "framelab",
      JSON.stringify({ honestyLabel: "kept-empty-frames", timeline: { frames: [] } }),
      JSON.stringify([{ src: "/media/covers/framelab.svg", alt: "cover", kind: "image" }]),
    ]);
    await ensureSeed(sql, { skipGithubHydrate: true });
    const framelab = await getPublishedProject(sql, "framelab");
    assert.equal(framelab.experienceConfig.honestyLabel, "kept-empty-frames");
    assert.ok((framelab.experienceConfig.timeline?.frames.length ?? 0) >= 3);
    assert.ok(framelab.media.some((item) => item.src === "/media/covers/framelab.svg"));
    assert.ok(framelab.media.some((item) => item.src.startsWith("/media/github-exports/framelab/")));
    assert.match(framelab.media.find((item) => item.src.includes("github-exports"))?.caption ?? "", /GitHub 匯出/);
    const director = await getPublishedProject(sql, "ai-director-os");
    assert.ok(director.media.some((item) => item.src.startsWith("/media/github-exports/ai-director-os/")));
    const folio = await getPublishedProject(sql, "folio");
    assert.ok(folio.media.some((item) => item.src === "/media/github-exports/folio/og.jpg"));
    const zen = await getPublishedProject(sql, "tku-zen-ai");
    assert.ok(zen.media.some((item) => item.src === "/media/github-exports/tku-zen-ai/club-illustration.jpg"));
    assert.ok(folio.media.some((item) => item.src === "/media/studio/folio-editor.svg"));
    assert.ok(zen.media.some((item) => item.src === "/media/studio/tku-zen-chat.svg"));
  });

  it("round-trips distinctive admin field groups to admin, public, and homepage slices", async () => {
    const { sql } = await setup();
    assert.equal(demoTypeFromVerify(true, "https://example.com"), "iframe");
    assert.equal(demoTypeFromVerify(false, "https://example.com"), "link");
    assert.equal(demoTypeFromVerify(true, ""), "unavailable");

    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "round-trip-work",
        title: "RT-TITLE-主標",
        subtitle: "RT-SUBTITLE-副標",
        category: "Creative Tool",
        year: "2099",
        product_status: "concept",
        publication_status: "draft",
        featured: true,
        sort_order: 77,
        summary: "RT-SUMMARY-摘要",
        problem: "RT-PROBLEM-問題",
        role: "RT-ROLE-角色",
        decisions: ["RT-DECISION-決策"],
        modalities: ["RT-MODALITY-模態"],
        process: ["RT-PROCESS-流程"],
        outputs: ["RT-OUTPUT-產出"],
        stack: ["RT-STACK-技術"],
        limitations: ["RT-LIMIT-限制"],
        media: [
          {
            src: "/media/covers/folio.svg",
            alt: "RT-COVER-ALT",
            kind: "image",
            caption: "RT-COVER-CAPTION",
          },
          {
            src: "/media/covers/framelab.svg",
            alt: "RT-VIDEO-ALT",
            kind: "video",
            caption: "RT-VIDEO-CAPTION",
            poster: "/media/covers/framelab.svg",
          },
          {
            src: "/media/covers/planform.svg",
            alt: "RT-GALLERY-ALT",
            kind: "image",
            caption: "RT-GALLERY-CAPTION",
          },
        ],
        locale_json: {
          zh: {
            title: "RT-ZH-TITLE",
            subtitle: "RT-ZH-SUB",
            summary: "RT-ZH-SUM",
            problem: "RT-ZH-PROB",
            role: "RT-ZH-ROLE",
            seoTitle: "RT-ZH-SEO-T",
            seoDescription: "RT-ZH-SEO-D",
          },
          en: {
            title: "RT-EN-TITLE",
            subtitle: "RT-EN-SUB",
            summary: "RT-EN-SUM",
            problem: "RT-EN-PROB",
            role: "RT-EN-ROLE",
            seoTitle: "RT-EN-SEO-T",
            seoDescription: "RT-EN-SEO-D",
          },
        },
        seo_title: "RT-SEO-TITLE",
        seo_description: "RT-SEO-DESC",
        github_url: "https://github.com/aa0968111723-prog/FrameLab",
        github_branch: "rt-branch",
        github_sync_enabled: true,
        live_demo_url: "https://planform-iso-k7d2.zeabur.app",
        live_demo_label: "RT-DEMO-LABEL",
        live_demo_type: "link",
        live_demo_embed_enabled: false,
        live_demo_status: "pending",
        canva_share_url: "https://www.canva.com/design/DAGroundTrip1/view",
        canva_page_ids: ["RT-PAGE-1"],
        canva_thumbnail_url: "/media/covers/folio.svg",
        canva_alt: "RT-CANVA-ALT",
        canva_caption: "RT-CANVA-CAPTION",
        experience_mode: "timeline",
        experience_config: {
          honestyLabel: "RT-HONESTY-標籤",
          intro: "RT-INTRO-引言",
          demoNote: "RT-DEMO-NOTE",
          canvaNote: "RT-CANVA-NOTE",
          githubIntro: "RT-GH-INTRO",
          galleryNote: "RT-GALLERY-NOTE",
          canvaPageLabels: [{ id: "RT-PAGE-1", label: "RT-PAGE-LABEL" }],
          timeline: {
            frames: [{ i: 1, kind: "key", x: 10, y: 20 }],
            onionDefault: true,
            demoDisclaimer: "RT-TIMELINE-DISCLAIMER",
          },
          locale: {
            en: {
              processNodes: [{ id: "engine", label: "RT-EN-NODE-LABEL" }],
              canvaNote: "RT-EN-CANVA-NOTE",
              timeline: { demoDisclaimer: "RT-EN-TIMELINE-DISCLAIMER" },
            },
          },
        },
        interaction_steps: ["RT-STEP-A"],
        source_evidence: [
          {
            label: "RT-EVIDENCE-LABEL",
            href: "https://github.com/aa0968111723-prog/FrameLab",
            note: "RT-EVIDENCE-NOTE",
            kind: "github",
          },
        ],
      }),
      "admin-rt",
    );

    const admin = await getAdminProject(sql, created.id);
    assert.equal(admin.subtitle, "RT-SUBTITLE-副標");
    assert.equal(admin.category, "Creative Tool");
    assert.equal(admin.year, "2099");
    assert.equal(admin.product_status, "concept");
    assert.equal(admin.featured, true);
    assert.equal(admin.sort_order, 77);
    assert.equal(admin.summary, "RT-SUMMARY-摘要");
    assert.equal(admin.problem, "RT-PROBLEM-問題");
    assert.equal(admin.role, "RT-ROLE-角色");
    assert.deepEqual(admin.decisions, ["RT-DECISION-決策"]);
    assert.deepEqual(admin.modalities, ["RT-MODALITY-模態"]);
    assert.deepEqual(admin.process, ["RT-PROCESS-流程"]);
    assert.deepEqual(admin.outputs, ["RT-OUTPUT-產出"]);
    assert.deepEqual(admin.stack, ["RT-STACK-技術"]);
    assert.deepEqual(admin.limitations, ["RT-LIMIT-限制"]);
    assert.equal(admin.media[0]?.caption, "RT-COVER-CAPTION");
    assert.equal(admin.media.find((item) => item.kind === "video")?.poster, "/media/covers/framelab.svg");
    assert.equal(admin.media.find((item) => item.alt === "RT-GALLERY-ALT")?.caption, "RT-GALLERY-CAPTION");
    assert.equal(admin.locale_json.zh?.seoTitle, "RT-ZH-SEO-T");
    assert.equal(admin.locale_json.en?.role, "RT-EN-ROLE");
    assert.equal(admin.seo_title, "RT-SEO-TITLE");
    assert.equal(admin.github_owner, "aa0968111723-prog");
    assert.equal(admin.github_repo, "FrameLab");
    assert.equal(admin.github_branch, "rt-branch");
    assert.equal(admin.live_demo_label, "RT-DEMO-LABEL");
    assert.equal(admin.canva_design_id, "DAGroundTrip1");
    assert.deepEqual(admin.canva_page_ids, ["RT-PAGE-1"]);
    assert.equal(admin.canva_alt, "RT-CANVA-ALT");
    assert.equal(admin.experience_mode, "timeline");
    assert.equal(admin.experience_config.honestyLabel, "RT-HONESTY-標籤");
    assert.equal(admin.experience_config.demoNote, "RT-DEMO-NOTE");
    assert.equal(admin.experience_config.canvaPageLabels?.[0]?.label, "RT-PAGE-LABEL");
    assert.equal(admin.experience_config.locale?.en?.processNodes?.[0]?.label, "RT-EN-NODE-LABEL");
    assert.deepEqual(admin.interaction_steps, ["RT-STEP-A"]);
    assert.equal(admin.source_evidence[0]?.note, "RT-EVIDENCE-NOTE");

    await persistDemoVerify(sql, created.id, "admin-rt", {
      url: "https://planform-iso-k7d2.zeabur.app",
      status: "verified",
      embedEnabled: true,
      error: null,
    });
    const afterDemo = await getAdminProject(sql, created.id);
    assert.equal(afterDemo.live_demo_type, "iframe");
    assert.equal(afterDemo.live_demo_embed_enabled, true);
    assert.equal(afterDemo.live_demo_status, "verified");
    assert.equal(afterDemo.live_demo_url, "https://planform-iso-k7d2.zeabur.app");

    const retitled = await saveProjectRecord(sql, created.id, { title: "RT-TITLE-主標" }, "admin-rt");
    assert.equal(retitled.media[0]?.caption, "RT-COVER-CAPTION");
    assert.equal(retitled.live_demo_type, "iframe");
    assert.equal(retitled.live_demo_embed_enabled, true);
    assert.deepEqual(retitled.canva_page_ids, ["RT-PAGE-1"]);
    assert.equal(retitled.github_branch, "rt-branch");

    await applyGithubSync(
      sql,
      created.id,
      {
        ok: true,
        status: "verified",
        owner: "aa0968111723-prog",
        repo: "FrameLab",
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
        readme: "# FrameLab RT",
        fileTree: [{ path: "README.md", type: "file", size: 12 }],
      },
      "admin-rt",
    );
    const afterGithub = await getAdminProject(sql, created.id);
    assert.equal(afterGithub.title, "RT-TITLE-主標");
    assert.equal(afterGithub.summary, "RT-SUMMARY-摘要");
    assert.equal(afterGithub.github_branch, "rt-branch");
    assert.equal(afterGithub.github_readme, "# FrameLab RT");
    assert.equal(afterGithub.live_demo_type, "iframe");

    await saveProjectRecord(
      sql,
      created.id,
      {
        media: [
          { src: "/media/covers/folio.svg", alt: "RT-COVER-ALT", kind: "image" },
        ],
      },
      "admin-rt",
      "wipe-caption",
    );
    const wiped = await getAdminProject(sql, created.id);
    assert.equal(wiped.media[0]?.caption, undefined);
    const revisions = await listRevisions(sql, created.id);
    const prior = revisions.find((item) => item.note === "save");
    assert.ok(prior);
    const restored = await restoreRevision(sql, created.id, prior.id, "admin-rt");
    assert.equal(restored.media[0]?.caption, "RT-COVER-CAPTION");
    assert.equal(restored.media.find((item) => item.alt === "RT-GALLERY-ALT")?.caption, "RT-GALLERY-CAPTION");
    assert.equal(restored.live_demo_type, "iframe");

    await setPublication(sql, created.id, "published", "admin-rt");
    const live = await getPublishedProject(sql, "round-trip-work");
    assert.equal(live.subtitle, "RT-SUBTITLE-副標");
    assert.equal(live.productStatus, "concept");
    assert.equal(live.sortOrder, 77);
    assert.equal(live.featured, true);
    assert.equal(live.media[0]?.caption, "RT-COVER-CAPTION");
    assert.equal(live.media.find((item) => item.kind === "video")?.caption, "RT-VIDEO-CAPTION");
    assert.equal(live.media.find((item) => item.alt === "RT-GALLERY-ALT")?.caption, "RT-GALLERY-CAPTION");
    assert.equal(live.locale.en?.title, "RT-EN-TITLE");
    assert.equal(live.seoTitle, "RT-ZH-SEO-T");
    assert.equal(live.github.branch, "rt-branch");
    assert.equal(live.demo.label, "RT-DEMO-LABEL");
    assert.equal(live.demo.type, "iframe");
    assert.equal(live.demo.embedEnabled, true);
    assert.equal(live.canva.alt, "RT-CANVA-ALT");
    assert.equal(live.canva.caption, "RT-CANVA-CAPTION");
    assert.deepEqual(live.canva.pageIds, ["RT-PAGE-1"]);
    assert.equal(live.experienceConfig.honestyLabel, "RT-HONESTY-標籤");
    assert.equal(live.experienceConfig.canvaNote, "RT-CANVA-NOTE");
    assert.equal(live.experienceConfig.canvaPageLabels?.[0]?.label, "RT-PAGE-LABEL");
    assert.deepEqual(live.interactionSteps, ["RT-STEP-A"]);
    assert.equal(live.sourceEvidence[0]?.label, "RT-EVIDENCE-LABEL");

    await setPublication(sql, created.id, "draft", "admin-rt");
    await assert.rejects(() => getPublishedProject(sql, "round-trip-work"), NotFoundError);
    const draftAdmin = await getAdminProject(sql, created.id);
    assert.equal(draftAdmin.publication_status, "draft");
    assert.equal(draftAdmin.subtitle, "RT-SUBTITLE-副標");
    const preview = toPreviewProject(draftAdmin);
    assert.equal(preview.subtitle, "RT-SUBTITLE-副標");
    assert.equal(preview.media[0]?.caption, "RT-COVER-CAPTION");
    await setPublication(sql, created.id, "archived", "admin-rt");
    await assert.rejects(() => getPublishedProject(sql, "round-trip-work"), NotFoundError);
    await setPublication(sql, created.id, "published", "admin-rt");

    await ensureSeed(sql, { skipGithubHydrate: true });
    await saveSiteSettings(
      sql,
      {
        name_zh: "RT-NAME-ZH",
        name_en: "RT-NAME-EN",
        person: "RT-PERSON-柏能",
        role: "RT-ROLE-SITE",
        headline: "RT-HEADLINE-欄",
        subhead: "RT-SUBHEAD-欄",
        narrative: "RT-NARRATIVE-欄",
        email: "rt-roundtrip@example.com",
        github: "https://github.com/aa0968111723-prog",
        github_handle: "aa0968111723-prog",
        location: "RT-LOCATION-北投",
        seo_title: "RT-SITE-SEO-T",
        seo_description: "RT-SITE-SEO-D",
        homepage_json: { highlightSlugs: ["round-trip-work"] },
        locale_json: {
          zh: {
            headline: "RT-ZH-HEADLINE",
            subhead: "RT-ZH-SUBHEAD",
            narrative: "RT-ZH-NARRATIVE",
            seoTitle: "RT-ZH-SITE-SEO-T",
            seoDescription: "RT-ZH-SITE-SEO-D",
          },
          en: {
            headline: "RT-EN-HEADLINE",
            subhead: "RT-EN-SUBHEAD",
            narrative: "RT-EN-NARRATIVE",
            seoTitle: "RT-EN-SITE-SEO-T",
            seoDescription: "RT-EN-SITE-SEO-D",
          },
        },
      },
      "admin-rt",
    );
    const settings = await getSiteSettings(sql);
    assert.equal(settings?.person, "RT-PERSON-柏能");
    assert.equal(settings?.headline, "RT-HEADLINE-欄");
    assert.equal(settings?.subhead, "RT-SUBHEAD-欄");
    assert.equal(settings?.locale_json.en?.subhead, "RT-EN-SUBHEAD");
    assert.deepEqual(settings?.homepage_json.highlightSlugs, ["round-trip-work"]);
    const publicSite = {
      nameZh: settings!.name_zh,
      nameEn: settings!.name_en,
      person: settings!.person,
      role: settings!.role,
      headline: settings!.headline,
      subhead: settings!.subhead,
      narrative: settings!.narrative,
      email: settings!.email,
      github: settings!.github,
      githubHandle: settings!.github_handle,
      location: settings!.location,
      seoTitle: settings!.seo_title,
      seoDescription: settings!.seo_description,
      homepageHighlightSlugs: settings!.homepage_json.highlightSlugs ?? [],
      locale: settings!.locale_json,
    };
    const fallback = {
      nameEn: "fallback",
      person: "fallback",
      headline: "fallback",
      subhead: "fallback",
      narrative: "fallback",
    };
    const homepageZh = resolveHomepageCopy(publicSite, fallback, "zh");
    const homepageEn = resolveHomepageCopy(publicSite, fallback, "en");
    assert.equal(homepageZh.headline, "RT-ZH-HEADLINE");
    assert.equal(homepageZh.subhead, "RT-ZH-SUBHEAD");
    assert.equal(homepageZh.narrative, "RT-ZH-NARRATIVE");
    assert.equal(homepageZh.seoTitle, "RT-ZH-SITE-SEO-T");
    assert.equal(homepageEn.headline, "RT-EN-HEADLINE");
    assert.equal(homepageEn.subhead, "RT-EN-SUBHEAD");
    assert.equal(homepageEn.narrative, "RT-EN-NARRATIVE");
    assert.equal(homepageEn.seoTitle, "RT-EN-SITE-SEO-T");
    assert.equal(homepageEn.seoDescription, "RT-EN-SITE-SEO-D");

    await upsertArchive(
      sql,
      {
        slug: "round-trip-poster",
        title: "RT-ARCHIVE-TITLE",
        kind: "graphic",
        year: "2099",
        summary: "RT-ARCHIVE-SUMMARY",
        origin_note: "RT-ORIGIN-NOTE",
        publication_status: "published",
        sort_order: 42,
        href: "https://github.com/aa0968111723-prog/FrameLab",
        media: {
          src: "/media/archive/tku-zen-poster.svg",
          alt: "RT-ARCHIVE-ALT",
          kind: "image",
          caption: "RT-ARCHIVE-CAPTION",
        },
        canva_share_url: "https://www.canva.com/design/DAGarchiveRt1/view",
        canva_page_ids: ["RT-ARCH-PAGE"],
        canva_thumbnail_url: "/media/archive/tku-zen-poster.svg",
        canva_alt: "RT-ARCH-CANVA-ALT",
        canva_caption: "RT-ARCH-CANVA-CAPTION",
        canva_status: "pending",
        locale_json: {
          zh: { title: "RT-ZH-ARCH-TITLE", summary: "RT-ZH-ARCH-SUM", caption: "RT-ZH-ARCH-CAP" },
          en: { title: "RT-EN-ARCH-TITLE", summary: "RT-EN-ARCH-SUM", caption: "RT-EN-ARCH-CAP" },
        },
      },
      "admin-rt",
    );
    const adminArchive = (await listAdminArchive(sql)).find((item) => item.slug === "round-trip-poster");
    assert.equal(adminArchive?.origin_note, "RT-ORIGIN-NOTE");
    assert.equal(adminArchive?.media?.caption, "RT-ARCHIVE-CAPTION");
    assert.deepEqual(adminArchive?.canva_page_ids, ["RT-ARCH-PAGE"]);
    assert.equal(adminArchive?.canva_thumbnail_url, "/media/archive/tku-zen-poster.svg");
    assert.equal(adminArchive?.locale_json.en?.title, "RT-EN-ARCH-TITLE");
    const publicArchive = (await listPublishedArchive(sql)).find((item) => item.slug === "round-trip-poster");
    assert.equal(publicArchive?.originNote, "RT-ORIGIN-NOTE");
    assert.equal(publicArchive?.media?.caption, "RT-ARCHIVE-CAPTION");
    assert.equal(publicArchive?.canva.alt, "RT-ARCH-CANVA-ALT");
    assert.equal(publicArchive?.canva.caption, "RT-ARCH-CANVA-CAPTION");
    assert.equal(publicArchive?.canva.thumbnailUrl, "/media/archive/tku-zen-poster.svg");
    assert.deepEqual(publicArchive?.canva.pageIds, ["RT-ARCH-PAGE"]);
    assert.equal(publicArchive?.locale.en?.title, "RT-EN-ARCH-TITLE");
    assert.equal(publicArchive?.title, "RT-ARCHIVE-TITLE");
  });
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import {
  applyGithubSync,
  countProjects,
  createProjectRecord,
  getAdminProject,
  listPublishedProjects,
  saveProjectRecord,
  setPublication,
} from "./store.ts";
import { ensureSeed } from "./seed.ts";
import { projectInputSchema } from "./schema.ts";
import type { Sql } from "../db.ts";

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
});

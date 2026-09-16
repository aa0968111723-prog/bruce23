import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { createProjectRecord, listPublishedProjects, saveProjectRecord, setPublication, countProjects } from "./store.ts";
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
    await ensureSeed(sql);
    const first = await countProjects(sql);
    await ensureSeed(sql);
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
});

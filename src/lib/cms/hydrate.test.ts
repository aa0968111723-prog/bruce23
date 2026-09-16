import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { createProjectRecord, getAdminProject, listPublishedProjects } from "./store.ts";
import { hydratePendingGithub } from "./hydrate.ts";
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

function githubFetchImpl(input: RequestInfo | URL): Promise<Response> {
  const url = String(input);
  if (url.includes("/readme")) {
    return Promise.resolve(new Response("# FrameLab\n\nReal README.", { status: 200 }));
  }
  if (url.includes("/languages")) {
    return Promise.resolve(new Response(JSON.stringify({ TypeScript: 80, CSS: 20 }), { status: 200 }));
  }
  if (url.includes("/commits")) {
    return Promise.resolve(
      new Response(
        JSON.stringify([
          {
            sha: "abcdef1234567890",
            html_url: "https://github.com/aa0968111723-prog/FrameLab/commit/abcdef1234567890",
            commit: { message: "honest sync", author: { date: "2026-09-01T00:00:00Z" } },
          },
        ]),
        { status: 200 },
      ),
    );
  }
  if (url.includes("/git/trees")) {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          tree: [
            { path: "README.md", type: "blob", size: 40 },
            { path: "src/lib/domain/timeline-engine.ts", type: "blob", size: 200 },
          ],
        }),
        { status: 200 },
      ),
    );
  }
  return Promise.resolve(
    new Response(
      JSON.stringify({
        name: "FrameLab",
        description: "frame workstation",
        private: false,
        default_branch: "main",
        html_url: "https://github.com/aa0968111723-prog/FrameLab",
        updated_at: "2026-09-01T00:00:00Z",
        topics: ["animation"],
        language: "TypeScript",
      }),
      { status: 200 },
    ),
  );
}

describe("github hydrate", () => {
  it("writes real metadata onto pending public projects", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "framelab",
        title: "FrameLab",
        category: "Multimodal",
        year: "2026",
        product_status: "prototype",
        publication_status: "published",
        featured: true,
        sort_order: 0,
        summary: "作者敘事",
        github_url: "https://github.com/aa0968111723-prog/FrameLab",
        github_sync_enabled: true,
        github_sync_status: "pending",
      }),
      "seed",
    );
    const result = await hydratePendingGithub(sql, { fetchImpl: githubFetchImpl });
    assert.equal(result.skipped, false);
    assert.equal(result.verified, 1);
    const admin = await getAdminProject(sql, created.id);
    assert.equal(admin.summary, "作者敘事");
    assert.equal(admin.github_sync_status, "verified");
    assert.match(admin.github_readme ?? "", /Real README/);
    assert.equal(admin.github_languages?.TypeScript, 80);
    const publicList = await listPublishedProjects(sql);
    assert.equal(publicList[0]?.github.readme?.includes("Real README"), true);
    assert.equal(publicList[0]?.github.fileTree?.[0]?.path, "README.md");
  });

  it("does not pretend success after a rate limit", async () => {
    const { sql } = await setup();
    await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "limited",
        title: "Limited",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        publication_status: "published",
        featured: false,
        sort_order: 0,
        github_url: "https://github.com/aa0968111723-prog/FrameLab",
        github_sync_enabled: true,
        github_sync_status: "pending",
      }),
      "seed",
    );
    const result = await hydratePendingGithub(sql, {
      fetchImpl: async () => new Response("rate", { status: 429 }),
    });
    assert.equal(result.verified, 0);
    assert.equal(result.rateLimited, true);
    const publicList = await listPublishedProjects(sql);
    assert.equal(publicList[0]?.github.syncStatus, "failed");
    assert.equal(publicList[0]?.github.readme, null);
  });

  it("skips a second hydrate after a completed pass", async () => {
    const { sql } = await setup();
    await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "once",
        title: "Once",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        publication_status: "published",
        featured: false,
        sort_order: 0,
        github_url: "https://github.com/aa0968111723-prog/FrameLab",
        github_sync_enabled: true,
        github_sync_status: "pending",
      }),
      "seed",
    );
    await hydratePendingGithub(sql, { fetchImpl: githubFetchImpl });
    const second = await hydratePendingGithub(sql, { fetchImpl: githubFetchImpl });
    assert.equal(second.skipped, true);
  });
});

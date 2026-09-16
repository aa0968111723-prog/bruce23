import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { createProjectRecord, getAdminProject, listPublishedProjects } from "./store.ts";
import { hydratePendingGithub, hydratePendingDemos } from "./hydrate.ts";
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

  it("does not skip version 1 while a public repo is still pending", async () => {
    const { sql } = await setup();
    await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "done",
        title: "Done",
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
        sort_order: 1,
        github_url: "https://github.com/aa0968111723-prog/tku-zen-ai",
        github_sync_enabled: true,
        github_sync_status: "pending",
      }),
      "seed",
    );
    const again = await hydratePendingGithub(sql, { fetchImpl: githubFetchImpl });
    assert.equal(again.skipped, false);
    assert.equal(again.verified, 1);
  });

  it("probes pending demo URLs without marking a JS bundle verified", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "aios",
        title: "Aios",
        category: "AI Product",
        year: "2026",
        product_status: "in-progress",
        publication_status: "published",
        featured: true,
        sort_order: 0,
        live_demo_url: "https://ai-os-ten.vercel.app",
        live_demo_status: "pending",
        live_demo_embed_enabled: false,
      }),
      "seed",
    );
    const result = await hydratePendingDemos(sql, {
      fetchImpl: async () =>
        new Response("var x=1", {
          status: 200,
          headers: { "content-type": "application/javascript" },
        }),
    });
    assert.equal(result.skipped, false);
    assert.equal(result.probed, 1);
    const admin = await getAdminProject(sql, created.id);
    assert.equal(admin.live_demo_status, "failed");
    assert.equal(admin.live_demo_embed_enabled, false);
    assert.match(admin.live_demo_error ?? "", /不是網頁/);
  });
});

describe("canva shortlink hydrate", () => {
  it("persists a redirected design URL and never marks verified", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "ai-director-os",
        title: "AI Director OS",
        category: "AI Product",
        year: "2026",
        product_status: "in-progress",
        publication_status: "published",
        featured: true,
        sort_order: 0,
        canva_status: "not_configured",
      }),
      "seed",
    );
    const { hydratePendingCanvaShortLinks } = await import("./hydrate.ts");
    const result = await hydratePendingCanvaShortLinks(sql, {
      force: true,
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("/d/")) {
          return new Response(null, {
            status: 302,
            headers: { Location: "https://www.canva.com/design/DAGhydrateResolved/view" },
          });
        }
        return new Response("nope", { status: 404 });
      },
    });
    assert.equal(result.skipped, false);
    assert.ok(result.resolved >= 1);
    const admin = await getAdminProject(sql, created.id);
    assert.equal(admin.canva_design_id, "DAGhydrateResolved");
    assert.ok(admin.canva_embed_url?.includes("embed"));
    assert.notEqual(admin.canva_status, "verified");
    assert.equal(admin.canva_status, "pending");
  });

  it("marks a login-wall short URL unavailable without an embed", async () => {
    const { sql } = await setup();
    const created = await createProjectRecord(
      sql,
      projectInputSchema.parse({
        slug: "ai-director-os",
        title: "AI Director OS",
        category: "AI Product",
        year: "2026",
        product_status: "in-progress",
        publication_status: "published",
        featured: true,
        sort_order: 0,
      }),
      "seed",
    );
    const { hydratePendingCanvaShortLinks } = await import("./hydrate.ts");
    await hydratePendingCanvaShortLinks(sql, {
      force: true,
      fetchImpl: async () =>
        new Response(null, {
          status: 302,
          headers: { Location: "https://www.canva.com/login?redirect=%2Fd%2Fx" },
        }),
    });
    const admin = await getAdminProject(sql, created.id);
    assert.equal(admin.canva_status, "unavailable");
    assert.equal(admin.canva_embed_url, null);
    assert.equal(admin.canva_design_id, null);
    assert.ok(admin.canva_share_url?.includes("/d/"));
  });
});

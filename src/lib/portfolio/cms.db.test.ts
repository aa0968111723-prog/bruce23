import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { projects } from "../../content/projects.ts";
import { toPublicProject } from "./privacy.ts";
import { rowToAdminProject } from "./mapping.ts";
import { parseGithubUrl } from "./github-url.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

async function migrate() {
  const db = new PGlite();
  await db.waitReady;
  const sql1 = readFileSync(join(root, "migrations/0001_auth.sql"), "utf8");
  const sql2 = readFileSync(join(root, "migrations/0002_portfolio_cms.sql"), "utf8");
  await db.exec(sql1);
  await db.exec(sql2);
  return db;
}

async function insertProject(db: PGlite, opts: { slug: string; title: string; publication: string; featured?: boolean; sort?: number; githubPrivate?: boolean }) {
  const parsed = parseGithubUrl("https://github.com/aa0968111723-prog/ai_os");
  await db.query(
    `insert into projects (
      id, slug, title, subtitle, category, year, product_status, featured, sort_order, publication_status,
      github_url, github_owner, github_repo, github_is_private, summary
    ) values ($1,$2,$3,'sub','AI Product','2026','prototype',$4,$5,$6,$7,$8,$9,$10,'sum')
    on conflict (slug) do nothing`,
    [
      opts.slug,
      opts.slug,
      opts.title,
      opts.featured ?? false,
      opts.sort ?? 0,
      opts.publication,
      parsed?.url,
      parsed?.owner,
      parsed?.repo,
      opts.githubPrivate ?? false,
    ],
  );
}

describe("cms persistence", () => {
  it("seeds eight projects without duplicating", async () => {
    const db = await migrate();
    for (const project of projects) {
      await insertProject(db, { slug: project.slug, title: project.title, publication: "published", featured: true, sort: 1 });
      await insertProject(db, { slug: project.slug, title: project.title, publication: "published", featured: true, sort: 1 });
    }
    const count = await db.query<{ n: number }>("select count(*)::int as n from projects");
    assert.equal(count.rows[0]?.n, 8);
  });

  it("draft is omitted from public lists and publish/unpublish round-trips", async () => {
    const db = await migrate();
    await insertProject(db, { slug: "secret-draft", title: "Draft", publication: "draft" });
    const draftRows = await db.query<Record<string, unknown>>("select * from projects where slug = 'secret-draft'");
    assert.equal(toPublicProject(rowToAdminProject(draftRows.rows[0]!)), null);

    await db.query("update projects set publication_status = 'published' where slug = 'secret-draft'");
    const published = await db.query<Record<string, unknown>>("select * from projects where publication_status = 'published'");
    assert.equal(toPublicProject(rowToAdminProject(published.rows[0]!))?.slug, "secret-draft");

    await db.query("update projects set publication_status = 'unpublished' where slug = 'secret-draft'");
    const after = await db.query("select * from projects where publication_status = 'published'");
    assert.equal(after.rows.length, 0);
  });

  it("sorts featured first", async () => {
    const db = await migrate();
    await insertProject(db, { slug: "b-work", title: "B", publication: "published", featured: false, sort: 1 });
    await insertProject(db, { slug: "a-work", title: "A", publication: "published", featured: true, sort: 9 });
    const rows = await db.query<{ slug: string }>(
      "select slug from projects where publication_status = 'published' order by featured desc, sort_order asc, title asc",
    );
    assert.deepEqual(rows.rows.map((r) => r.slug), ["a-work", "b-work"]);
  });

  it("keeps integration tokens off public rows", async () => {
    const db = await migrate();
    await db.query(
      `insert into integration_secrets (id, owner_user_id, provider, encrypted_payload, status)
       values ('canva:u1','u1','canva','v1:cipher','connected')`,
    );
    const publicProjects = await db.query("select * from projects");
    assert.equal(publicProjects.rows.length, 0);
    const secrets = await db.query<Record<string, unknown>>("select * from integration_secrets");
    const secretRow = secrets.rows[0]!;
    assert.equal(Object.prototype.hasOwnProperty.call(secretRow, "encrypted_payload"), true);
    assert.equal(typeof secretRow.encrypted_payload, "string");
  });
});

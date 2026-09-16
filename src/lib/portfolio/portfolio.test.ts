import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AdminConfigError,
  ForbiddenError,
  assertAdmin,
  parseAdminAllowlist,
  resolveAdminAccess,
} from "./admin.ts";
import { moveTabIndex, motionEnabled, iframeFallbackCopy } from "./a11y.ts";
import { canvaEmbedState, parseCanvaEmbedCode, parseCanvaUrl } from "./canva.ts";
import {
  createProject,
  getPublishedProject,
  listPublishedProjects,
  setPublication,
  updateProject,
} from "./cms.ts";
import { demoIframeState, isHttpsPublicUrl } from "./demo.ts";
import {
  githubRateLimitState,
  parseGithubRepoPayload,
  parseGithubRepoUrl,
  readmeSyncState,
} from "./github.ts";
import { containsSecretKey, toPublicProject } from "./public.ts";
import { seedPortfolio } from "./seed.ts";
import { createTestSql } from "./test-db.ts";
import { projectWriteSchema } from "./schema.ts";
import { zenReply } from "./zen-engine.ts";
import { analyzePosterPixels } from "./poster-analysis.ts";

function assertAdminFromEmail(email: string | null, allowlistRaw?: string) {
  const access = resolveAdminAccess({
    email,
    allowlist: parseAdminAllowlist(allowlistRaw),
  });
  assertAdmin(access);
  return access;
}

describe("admin allowlist", () => {
  it("fail-closed when allowlist is missing", () => {
    const access = resolveAdminAccess({ email: "aa0968111723@gmail.com", allowlist: [] });
    assert.equal(access.ok, false);
    if (!access.ok) assert.equal(access.reason, "missing_allowlist");
    assert.throws(() => assertAdmin(access), AdminConfigError);
  });

  it("unauthenticated cannot enter admin", () => {
    const access = resolveAdminAccess({
      email: null,
      allowlist: ["aa0968111723@gmail.com"],
    });
    assert.equal(access.ok, false);
    assert.throws(() => assertAdmin(access), ForbiddenError);
  });

  it("non-admin cannot mutate", () => {
    assert.throws(
      () =>
        assertAdminFromEmail("visitor@example.com", "aa0968111723@gmail.com"),
      ForbiddenError,
    );
  });

  it("allowlisted admin is accepted", () => {
    const access = assertAdminFromEmail(
      "aa0968111723@gmail.com",
      "aa0968111723@gmail.com",
    );
    assert.equal(access.ok, true);
  });
});

describe("github parsing", () => {
  it("validates GitHub URLs", () => {
    const ok = parseGithubRepoUrl("https://github.com/aa0968111723-prog/FrameLab");
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.owner, "aa0968111723-prog");
      assert.equal(ok.repo, "FrameLab");
    }
    assert.equal(parseGithubRepoUrl("http://github.com/a/b").ok, false);
    assert.equal(parseGithubRepoUrl("https://gitlab.com/a/b").ok, false);
    assert.equal(parseGithubRepoUrl("javascript:alert(1)").ok, false);
  });

  it("parses repo metadata", () => {
    const parsed = parseGithubRepoPayload({
      name: "FrameLab",
      description: "workstation",
      html_url: "https://github.com/aa0968111723-prog/FrameLab",
      default_branch: "main",
      updated_at: "2026-08-21T07:13:11Z",
      private: false,
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.metadata.name, "FrameLab");
    assert.equal(parseGithubRepoPayload({}).ok, false);
  });

  it("README failure state", () => {
    assert.equal(readmeSyncState(404), "failed");
    assert.equal(readmeSyncState(200), "ok");
  });

  it("rate-limit state", () => {
    assert.equal(githubRateLimitState({ status: 429 }), "rate_limited");
    assert.equal(
      githubRateLimitState({ status: 403, remainingHeader: "0" }),
      "rate_limited",
    );
    assert.equal(githubRateLimitState({ status: 200, remainingHeader: "10" }), "ok");
  });
});

describe("canva allowlist", () => {
  it("allows canva hosts only", () => {
    const ok = parseCanvaUrl("https://www.canva.com/design/ABC/view");
    assert.equal(ok.ok, true);
    assert.equal(parseCanvaUrl("https://evil.example/canva.com").ok, false);
    const embed = parseCanvaEmbedCode(
      `<iframe src="https://www.canva.com/design/ABC/view?embed"></iframe>`,
    );
    assert.equal(embed.ok, true);
  });

  it("embed fail fallback", () => {
    assert.equal(canvaEmbedState({ embedUrl: null, failed: false }), "not_configured");
    assert.equal(
      canvaEmbedState({ embedUrl: "https://www.canva.com/design/x/view?embed", failed: true }),
      "fallback",
    );
    assert.ok(iframeFallbackCopy("canva").bodyZh.includes("權限"));
  });
});

describe("demo iframe fallback", () => {
  it("does not fake a working embed", () => {
    assert.equal(demoIframeState({ url: null, embedEnabled: true, failed: false }), "not_configured");
    assert.equal(
      demoIframeState({ url: "https://example.com", embedEnabled: true, failed: true }),
      "fallback",
    );
    assert.equal(isHttpsPublicUrl("https://ai-os-ten.vercel.app"), true);
    assert.equal(isHttpsPublicUrl("http://127.0.0.1/secret"), false);
  });
});

describe("cms draft/publish", () => {
  it("admin can create, save draft, publish, unpublish; seed is not duplicated", async () => {
    const sql = await createTestSql();
    const first = await seedPortfolio(sql);
    const second = await seedPortfolio(sql);
    const count = await sql.query<{ n: number }>(`select count(*)::int as n from projects`);
    assert.equal(Number(count[0]?.n), 8);
    assert.ok(second.seeded === 0);
    assert.ok(first.seeded === 8 || first.skipped);

    const created = await createProject(
      sql,
      projectWriteSchema.parse({
        slug: "draft-only-case",
        title: "Draft Case",
        subtitle: "hidden",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        publication_status: "draft",
        featured: false,
        sort_order: 90,
        summary: "draft summary",
      }),
      "admin-1",
    );
    assert.ok(created);
    const publicDraft = await getPublishedProject(sql, "draft-only-case");
    assert.equal(publicDraft, null);

    const saved = await updateProject(
      sql,
      String(created!.id),
      projectWriteSchema.parse({
        slug: "draft-only-case",
        title: "Draft Case updated",
        subtitle: "hidden",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        featured: true,
        sort_order: 3,
        summary: "still draft",
      }),
      "admin-1",
    );
    assert.equal(saved?.title, "Draft Case updated");
    assert.equal(await getPublishedProject(sql, "draft-only-case"), null);

    await setPublication(sql, String(created!.id), "published", "admin-1");
    const published = await getPublishedProject(sql, "draft-only-case");
    assert.ok(published);
    assert.equal(published?.title, "Draft Case updated");
    assert.equal(published?.featured, true);

    await setPublication(sql, String(created!.id), "unpublished", "admin-1");
    assert.equal(await getPublishedProject(sql, "draft-only-case"), null);

    const listed = await listPublishedProjects(sql);
    assert.ok(listed.every((item) => item.publication_status === "published"));
    const featured = listed.filter((item) => item.featured);
    assert.ok(featured.length >= 1);
    const order = listed.map((item) => item.sort_order);
    const sorted = [...order].sort((a, b) => a - b);
    assert.deepEqual(order, sorted);
  });
});

describe("privacy", () => {
  it("private repo metadata and tokens stay out of public payloads", () => {
    const leaked = toPublicProject({
      id: "x",
      slug: "secret-repo",
      title: "Secret",
      subtitle: "",
      category: "AI Product",
      year: "2026",
      product_status: "prototype",
      publication_status: "published",
      featured: false,
      sort_order: 0,
      summary: "n",
      problem: "",
      role: "",
      decisions_json: [],
      modalities_json: [],
      process_json: [],
      outputs_json: [],
      stack_json: [],
      limitations_json: [],
      media_json: [],
      source_evidence: [],
      github_url: "https://github.com/aa0968111723-prog/private-example",
      github_owner: "aa0968111723-prog",
      github_repo: "secret",
      github_readme: "PRIVATE README",
      github_metadata: { private: true, name: "secret" },
      github_file_tree: [{ path: "internal.ts", type: "file" }],
    });
    assert.ok(leaked);
    assert.equal(leaked?.github, null);
    assert.equal(containsSecretKey(leaked), null);
    assert.ok(
      containsSecretKey({ canva_refresh_token: "abc" })?.includes("token"),
    );
  });

  it("drafts are not public", () => {
    assert.equal(
      toPublicProject({
        id: "d",
        slug: "draft",
        publication_status: "draft",
        github_metadata: null,
      }),
      null,
    );
  });

  it("frontend source does not ship integration tokens via VITE_", () => {
    const root = join(process.cwd(), "src");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(ts|tsx|js|mjs)$/.test(name)) files.push(path);
      }
    };
    walk(root);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.equal(
        /VITE_(GITHUB|CANVA|PORTFOLIO).*(TOKEN|SECRET|KEY)/i.test(text),
        false,
        file,
      );
    }
  });
});

describe("keyboard and motion", () => {
  it("tablist arrows wrap", () => {
    assert.equal(moveTabIndex(0, "ArrowRight", 6), 1);
    assert.equal(moveTabIndex(0, "ArrowLeft", 6), 5);
    assert.equal(moveTabIndex(2, "Home", 6), 0);
  });

  it("respects reduced motion", () => {
    assert.equal(motionEnabled(true), false);
    assert.equal(motionEnabled(false), true);
  });
});

describe("zen engine", () => {
  it("is deterministic and local", () => {
    const a = zenReply("我有壓力");
    const b = zenReply("我有壓力");
    assert.equal(a.intent, "stress");
    assert.deepEqual(a, b);
  });
});

describe("poster analysis", () => {
  it("computes contrast from pixels and stays an estimate", () => {
    const width = 2;
    const height = 1;
    const data = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    const result = analyzePosterPixels(data, width, height);
    assert.ok(result.contrast > 0.9);
    assert.ok(result.limits.some((line) => line.includes("不是眼動")));
  });
});

describe("origin and sync guards", () => {
  it("rejects mismatched origins", async () => {
    const { originMatchesHost } = await import("./origin.ts");
    assert.equal(originMatchesHost("https://evil.example", "example.com"), false);
    assert.equal(originMatchesHost("https://127.0.0.1:8080", "localhost:8080"), true);
    assert.equal(originMatchesHost(null, "example.com"), true);
  });

  it("never auto-overwrites narrative on github sync", async () => {
    const { githubSyncDiff, applyGithubAutoFields } = await import("./github.ts");
    const current = { title: "Owner copy", github_readme: "old" };
    const incoming = {
      title: "Repo name",
      github_readme: "new readme",
      github_topics: ["ai"],
    };
    const diff = githubSyncDiff(current, incoming);
    assert.ok(diff.skippedNarrative.includes("title"));
    const next = applyGithubAutoFields(current, incoming);
    assert.equal(next.title, "Owner copy");
    assert.equal(next.github_readme, "new readme");
  });
});

describe("canva connect reservation", () => {
  it("stays on public embed when credentials are missing", async () => {
    const { connectAvailability } = await import("./canva-connect.ts");
    const result = connectAvailability();
    assert.equal(result.mode, "public_embed");
    assert.equal(result.status, "not_configured");
  });
});

describe("secret encryption", () => {
  it("round-trips and never looks like plaintext", async () => {
    const { encryptSecret, decryptSecret } = await import("./crypto.ts");
    const cipher = encryptSecret("refresh-token-value", "unit-test-secret");
    assert.equal(cipher.includes("refresh-token-value"), false);
    assert.equal(decryptSecret(cipher, "unit-test-secret"), "refresh-token-value");
  });
});

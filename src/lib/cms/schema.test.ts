import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseGithubUrl, limitGithubTree, summarizeReadme } from "../github/parse.ts";
import { extractCanvaUrl, isAllowedCanvaUrl, parseCanvaDesign } from "../canva/parse.ts";
import { verifyDemoUrl } from "../demo/verify.ts";
import { projectInputSchema } from "./schema.ts";
import { toPublicProject } from "./store.ts";
import { canvaViewerState, demoViewerState, stripSecrets } from "./privacy.ts";

describe("github url validation", () => {
  it("accepts public github urls", () => {
    const parsed = parseGithubUrl("https://github.com/aa0968111723-prog/FrameLab");
    assert.equal(parsed?.owner, "aa0968111723-prog");
    assert.equal(parsed?.repo, "FrameLab");
  });

  it("rejects non-github hosts", () => {
    assert.equal(parseGithubUrl("https://evil.example/aa0968111723-prog/FrameLab"), null);
  });
});

describe("readme and rate-limit states", () => {
  it("summarizes long readme", () => {
    const text = summarizeReadme("a".repeat(5000), 100);
    assert.match(text, /截斷/);
  });

  it("limits tree depth and skips node_modules", () => {
    const limited = limitGithubTree(
      [
        { path: "node_modules/foo/index.js", type: "blob", size: 1 },
        { path: "src/lib/zen.ts", type: "blob", size: 20 },
        { path: "a/b/c/d/e.ts", type: "blob", size: 1 },
      ],
      { maxDepth: 3, maxEntries: 10 },
    );
    assert.equal(limited.length, 1);
    assert.equal(limited[0].path, "src/lib/zen.ts");
  });
});

describe("canva allowlist", () => {
  it("accepts canva share urls", () => {
    const parsed = parseCanvaDesign("https://www.canva.com/design/DAGabc123/view?utm=1");
    assert.equal(parsed?.designId, "DAGabc123");
    assert.ok(parsed?.embedUrl.includes("embed"));
  });

  it("parses iframe html without executing it", () => {
    const html = `<iframe src="https://www.canva.com/design/DAGxyz/view?embed"></iframe><script>alert(1)</script>`;
    assert.ok(extractCanvaUrl(html)?.includes("canva.com"));
    assert.equal(extractCanvaUrl(`<iframe src="https://evil.test/x"></iframe>`), null);
  });

  it("rejects non-canva hosts", () => {
    assert.equal(isAllowedCanvaUrl("https://example.com/design/x"), false);
  });
});

describe("demo verification", () => {
  it("marks frame-busting sites as unavailable", async () => {
    const result = await verifyDemoUrl("https://demo.example/", {
      fetchImpl: async () =>
        new Response(null, { status: 200, headers: { "x-frame-options": "DENY" } }),
    });
    assert.equal(result.status, "unavailable");
    assert.equal(result.embedEnabled, false);
  });

  it("does not treat failed fetches as verified", async () => {
    const result = await verifyDemoUrl("https://demo.example/", {
      fetchImpl: async () => new Response("nope", { status: 503 }),
    });
    assert.equal(result.status, "failed");
    assert.equal(result.embedEnabled, false);
  });
});

describe("privacy", () => {
  it("strips tokens from objects", () => {
    const cleaned = stripSecrets({ title: "ok", access_token: "secret", nested: { client_secret: "x" } });
    assert.equal(cleaned.title, "ok");
    assert.equal("access_token" in cleaned, false);
  });

  it("hides unpublished rows from the public mapper", () => {
    const publicRow = toPublicProject({
      id: "1",
      slug: "secret-draft",
      title: "Draft",
      publication_status: "draft",
      product_status: "prototype",
      category: "AI Product",
      year: "2026",
      featured: false,
      sort_order: 0,
      summary: "hidden",
      decisions: "[]",
      modalities: "[]",
      process: "[]",
      outputs: "[]",
      stack: "[]",
      limitations: "[]",
      media: "[]",
      locale_json: "{}",
      github_sync_status: "not_configured",
      live_demo_status: "not_configured",
      canva_status: "not_configured",
      experience_config: "{}",
      interaction_steps: "[]",
      source_evidence: "[]",
    });
    assert.equal(publicRow, null);
  });

  it("hides private GitHub metadata from public responses", () => {
    const publicRow = toPublicProject({
      id: "2",
      slug: "hidden-repo",
      title: "Hidden",
      publication_status: "published",
      product_status: "prototype",
      category: "AI Product",
      year: "2026",
      featured: false,
      sort_order: 0,
      summary: "public copy",
      decisions: "[]",
      modalities: "[]",
      process: "[]",
      outputs: "[]",
      stack: "[]",
      limitations: "[]",
      media: "[]",
      locale_json: "{}",
      github_url: "https://github.com/aa0968111723-prog/secret",
      github_sync_status: "verified",
      github_metadata: JSON.stringify({ private: true, name: "secret", access_token: "nope" }),
      live_demo_status: "not_configured",
      canva_status: "not_configured",
      experience_config: "{}",
      interaction_steps: "[]",
      source_evidence: "[]",
    });
    assert.ok(publicRow);
    assert.equal(publicRow.github.url, null);
    assert.equal(publicRow.github.name, undefined);
    assert.equal("access_token" in publicRow.github, false);
  });

  it("falls back when Canva embed or demo iframe cannot load", () => {
    assert.equal(
      canvaViewerState(
        {
          shareUrl: "https://www.canva.com/design/x/view",
          embedUrl: "https://www.canva.com/design/x/view?embed",
          designId: "x",
          thumbnailUrl: "/cover.svg",
          status: "verified",
          lastSyncedAt: null,
        },
        true,
      ),
      "fallback",
    );
    assert.equal(
      demoViewerState(
        {
          url: "https://demo.example",
          label: "Demo",
          type: "iframe",
          embedEnabled: true,
          status: "verified",
          lastVerifiedAt: null,
        },
        true,
      ),
      "fallback",
    );
  });
});

describe("repo metadata parse", () => {
  it("reads owner/repo from a github url", () => {
    const parsed = parseGithubUrl("https://github.com/aa0968111723-prog/planform-iso/");
    assert.deepEqual(parsed, {
      owner: "aa0968111723-prog",
      repo: "planform-iso",
      url: "https://github.com/aa0968111723-prog/planform-iso",
    });
  });
});

describe("project schema", () => {
  it("keeps product_status and publication_status separate", () => {
    const parsed = projectInputSchema.parse({
      slug: "demo-work",
      title: "Demo",
      category: "AI Product",
      year: "2026",
      product_status: "prototype",
      publication_status: "draft",
    });
    assert.equal(parsed.product_status, "prototype");
    assert.equal(parsed.publication_status, "draft");
  });
});


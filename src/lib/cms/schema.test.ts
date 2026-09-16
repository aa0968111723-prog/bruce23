import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseGithubUrl, limitGithubTree, summarizeReadme } from "../github/parse.ts";
import { extractCanvaUrl, isAllowedCanvaMediaUrl, isAllowedCanvaUrl, parseCanvaDesign, canvaPersistShape, canvaPersistFromFields, isCanvaShortLink } from "../canva/parse.ts";
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

  it("does not let .grok/.github files crowd out README and src", () => {
    const junk = Array.from({ length: 90 }, (_, index) => ({
      path: `.grok/file-${index}.md`,
      type: "blob" as const,
      size: 1,
    }));
    const limited = limitGithubTree(
      [
        ...junk,
        { path: ".github/workflows/ci.yml", type: "blob", size: 1 },
        { path: "README.md", type: "blob", size: 40 },
        { path: "src/lib/domain/timeline-engine.ts", type: "blob", size: 200 },
      ],
      { maxDepth: 4, maxEntries: 80 },
    );
    assert.ok(limited.some((item) => item.path === "README.md"));
    assert.ok(limited.some((item) => item.path.startsWith("src/")));
    assert.ok(limited.filter((item) => item.path.startsWith(".grok/")).length < 20);
    const githubHeavy = Array.from({ length: 90 }, (_, index) => ({
      path: `.github/workflows/job-${index}.yml`,
      type: "blob" as const,
      size: 1,
    }));
    const githubLimited = limitGithubTree(
      [
        ...githubHeavy,
        { path: "README.md", type: "blob", size: 40 },
        { path: "src/lib/domain/timeline-engine.ts", type: "blob", size: 200 },
      ],
      { maxDepth: 4, maxEntries: 80 },
    );
    assert.ok(githubLimited.some((item) => item.path === "README.md"));
    assert.ok(githubLimited.some((item) => item.path.startsWith("src/")));
    assert.ok(githubLimited.filter((item) => item.path.startsWith(".github/")).length <= 12);
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

  it("does not treat short /d/ links as public design embeds", () => {
    assert.equal(parseCanvaDesign("https://www.canva.com/d/ysK5sYZisVEjZFe"), null);
    assert.equal(isCanvaShortLink("https://www.canva.com/d/ysK5sYZisVEjZFe"), true);
    const stored = canvaPersistShape("https://www.canva.com/d/ysK5sYZisVEjZFe");
    assert.equal(stored.shareUrl, "https://www.canva.com/d/ysK5sYZisVEjZFe");
    assert.equal(stored.embedUrl, null);
    assert.equal(stored.designId, null);
    assert.equal(stored.statusHint, "pending");
  });

  it("keeps a resolved embed when the share field is still a /d/ short URL", () => {
    const stored = canvaPersistFromFields(
      "https://www.canva.com/d/ysK5sYZisVEjZFe",
      "https://www.canva.com/design/DAGkeepOnSave/view?embed",
    );
    assert.equal(stored.designId, "DAGkeepOnSave");
    assert.ok(stored.embedUrl?.includes("embed"));
    assert.equal(stored.shareUrl, "https://www.canva.com/design/DAGkeepOnSave/view");
  });

  it("parses view/edit/watch share shapes", () => {
    assert.equal(parseCanvaDesign("https://www.canva.com/design/DAGabc123/edit")?.designId, "DAGabc123");
    assert.equal(parseCanvaDesign("https://www.canva.com/design/DAGabc123/watch")?.embedUrl?.includes("embed"), true);
  });

  it("allowlists Canva export hosts without treating them as share embeds", () => {
    assert.equal(isAllowedCanvaMediaUrl("https://document-export.canva.com/x.png"), true);
    assert.equal(parseCanvaDesign("https://document-export.canva.com/x.png"), null);
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

  it("does not treat a JavaScript bundle as a verified webpage", async () => {
    const result = await verifyDemoUrl("https://demo.example/", {
      fetchImpl: async () =>
        new Response("var x=1", {
          status: 200,
          headers: { "content-type": "application/javascript; charset=utf-8" },
        }),
    });
    assert.equal(result.status, "failed");
    assert.equal(result.embedEnabled, false);
    assert.match(result.error ?? "", /不是網頁/);
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
      canvaViewerState(
        {
          shareUrl: null,
          embedUrl: null,
          designId: null,
          thumbnailUrl: "/media/archive/tku-zen-poster.svg",
          status: "unavailable",
          lastSyncedAt: null,
        },
        false,
      ),
      "local",
    );
    assert.equal(
      canvaViewerState(
        {
          shareUrl: "https://www.canva.com/d/ysK5sYZisVEjZFe",
          embedUrl: null,
          designId: null,
          thumbnailUrl: null,
          status: "unavailable",
          lastSyncedAt: null,
        },
        false,
      ),
      "fallback",
    );
    assert.equal(
      canvaViewerState(
        {
          shareUrl: null,
          embedUrl: null,
          designId: null,
          thumbnailUrl: null,
          status: "not_configured",
          lastSyncedAt: null,
        },
        false,
      ),
      "empty",
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

  it("rejects invalid nested experience_config", () => {
    assert.throws(() =>
      projectInputSchema.parse({
        slug: "demo-work",
        title: "Demo",
        category: "AI Product",
        year: "2026",
        product_status: "prototype",
        experience_config: {
          timeline: { frames: [{ i: 0, kind: "invalid", x: 0, y: 0 }] },
        },
      }),
    );
  });
});


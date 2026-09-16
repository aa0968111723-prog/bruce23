import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parseGithubUrl, limitGithubTree, summarizeReadme } from "../github/parse.ts";
import { extractCanvaUrl, isAllowedCanvaMediaUrl, isAllowedCanvaUrl, parseCanvaDesign, canvaPersistShape, canvaPersistFromFields, isCanvaShortLink, classifyCanvaNavigationUrl, classifyCanvaPageOutcome } from "../canva/parse.ts";
import { verifyDemoUrl, framingBlocked } from "../demo/verify.ts";
import { projectInputSchema, archiveInputSchema, sourceEvidenceSchema } from "./schema.ts";
import { serializeJsonLd } from "./jsonld.ts";
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
    assert.equal(classifyCanvaNavigationUrl("https://www.canva.com/d/ysK5sYZisVEjZFe").class, "short-link");
    assert.equal(classifyCanvaNavigationUrl("https://www.canva.com/d/ysK5sYZisVEjZFe").designId, null);
    assert.equal(classifyCanvaNavigationUrl("https://www.canva.com/design/DAGfromNav/view").class, "design");
    assert.equal(
      classifyCanvaPageOutcome({ url: "https://www.canva.com/d/ysK5sYZisVEjZFe", title: "Just a moment..." }),
      "cloudflare-challenge",
    );
    assert.equal(
      classifyCanvaPageOutcome({
        url: "https://www.canva.com/d/ysK5sYZisVEjZFe",
        title: "Looks like we hit a roadblock",
      }),
      "not-found",
    );
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

  it("treats CSP frame-ancestors 'self' as unavailable, not verified", async () => {
    const result = await verifyDemoUrl("https://demo.example/", {
      fetchImpl: async () =>
        new Response(null, {
          status: 200,
          headers: { "content-type": "text/html", "content-security-policy": "frame-ancestors 'self'" },
        }),
    });
    assert.equal(result.status, "unavailable");
    assert.equal(result.embedEnabled, false);
    assert.equal(framingBlocked(null, "frame-ancestors 'self'"), true);
    assert.equal(framingBlocked(null, "frame-ancestors *"), false);
  });

  it("does not probe private or loopback demo hosts", async () => {
    const result = await verifyDemoUrl("http://127.0.0.1/");
    assert.equal(result.status, "failed");
    assert.match(result.error ?? "", /內網/);
  });

  it("retries GET after HEAD 403 so frame headers can still fail closed", async () => {
    const methods: string[] = [];
    const result = await verifyDemoUrl("https://demo.example/", {
      fetchImpl: async (_input, init) => {
        methods.push(String(init?.method ?? "GET"));
        if (init?.method === "HEAD") return new Response(null, { status: 403 });
        return new Response(null, {
          status: 200,
          headers: { "content-type": "text/html", "x-frame-options": "DENY" },
        });
      },
    });
    assert.deepEqual(methods, ["HEAD", "GET"]);
    assert.equal(result.status, "unavailable");
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
          embedUrl: "https://www.canva.com/d/ysK5sYZisVEjZFe",
          designId: null,
          thumbnailUrl: "/media/covers/ai-director-os.svg",
          status: "pending",
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
    assert.equal(
      demoViewerState(
        {
          url: "https://demo.example",
          label: "Demo",
          type: "iframe",
          embedEnabled: true,
          status: "pending",
          lastVerifiedAt: null,
        },
        false,
      ),
      "fallback",
    );
    assert.equal(
      canvaViewerState(
        {
          shareUrl: "https://www.canva.com/design/DAGabc123/view",
          embedUrl: "https://www.canva.com/design/DAGabc123/view?embed",
          designId: "DAGabc123",
          thumbnailUrl: null,
          status: "verified",
          lastSyncedAt: null,
        },
        false,
      ),
      "embed",
    );
    assert.equal(
      demoViewerState(
        {
          url: "https://planform-iso-k7d2.zeabur.app",
          label: "PLANFORM",
          type: "iframe",
          embedEnabled: true,
          status: "verified",
          lastVerifiedAt: null,
        },
        false,
      ),
      "embed",
    );
    assert.equal(
      demoViewerState(
        {
          url: "https://ai-os-app.zeabur.app",
          label: "AI Director OS",
          type: "iframe",
          embedEnabled: false,
          status: "unavailable",
          lastVerifiedAt: null,
        },
        false,
      ),
      "fallback",
    );
  });

  it("CanvaStage and LiveDemoStage never put an iframe in empty/local/fallback branches", () => {
    const canva = readFileSync(new URL("../../components/experience/CanvaStage.tsx", import.meta.url), "utf8");
    const demo = readFileSync(new URL("../../components/experience/LiveDemoStage.tsx", import.meta.url), "utf8");
    const canvaIframe = canva.indexOf("<iframe");
    const demoIframe = demo.indexOf("<iframe");
    assert.equal(canva.split("<iframe").length - 1, 1);
    assert.equal(demo.split("<iframe").length - 1, 1);
    assert.ok(canva.indexOf('if (state === "empty")') < canvaIframe);
    assert.ok(canva.indexOf('if (state === "local")') < canvaIframe);
    assert.ok(canva.indexOf('if (state === "fallback" || !embed)') < canvaIframe);
    assert.ok(canva.indexOf("空白 iframe") < canvaIframe);
    assert.ok(demo.indexOf('if (state === "empty")') < demoIframe);
    assert.ok(demo.indexOf('if (state === "fallback")') < demoIframe);
    assert.ok(demo.indexOf('if (state === "embed" && demo.url') < demoIframe);
    assert.match(demo, /ex\.noEmbedUrl|不會放空白 iframe/);
    const caseRoute = readFileSync(new URL("../../routes/work/$slug.tsx", import.meta.url), "utf8");
    assert.match(caseRoute, /getPublishedProjectFn/);
    assert.match(caseRoute, /CaseStudyView/);
    assert.doesNotMatch(caseRoute, /includeJsonLd=\{false\}/);
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

  it("accepts locale_json list overlays for case-study sections", () => {
    const parsed = projectInputSchema.parse({
      slug: "demo-work",
      title: "Demo",
      category: "AI Product",
      year: "2026",
      product_status: "prototype",
      publication_status: "draft",
      locale_json: {
        zh: { decisions: ["中文決策"] },
        en: {
          decisions: ["English decision"],
          limitations: ["English limit"],
          process: ["English process"],
          outputs: ["English output"],
        },
      },
    });
    assert.deepEqual(parsed.locale_json.en?.decisions, ["English decision"]);
    assert.deepEqual(parsed.locale_json.en?.limitations, ["English limit"]);
    assert.deepEqual(parsed.locale_json.zh?.decisions, ["中文決策"]);
  });

  it("accepts archive locale_json title and summary overlays", () => {
    const parsed = archiveInputSchema.parse({
      slug: "demo-archive",
      title: "風景",
      kind: "photography",
      year: "2026",
      locale_json: {
        zh: { title: "風景與日出" },
        en: { title: "Landscapes and sunrise", summary: "SVG translation, not a Canva embed." },
      },
    });
    assert.equal(parsed.locale_json.en?.title, "Landscapes and sunrise");
    assert.equal(parsed.title, "風景");
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

  it("rejects javascript: source evidence hrefs", () => {
    assert.equal(
      sourceEvidenceSchema.safeParse({
        label: "evil",
        note: "should not link",
        href: "javascript:alert(1)",
      }).success,
      false,
    );
    assert.equal(
      sourceEvidenceSchema.safeParse({
        label: "github",
        note: "public repo",
        href: "https://github.com/aa0968111723-prog/FrameLab",
      }).success,
      true,
    );
  });
});

describe("json-ld", () => {
  it("escapes script breakout in serialized JSON-LD", () => {
    const html = serializeJsonLd({ name: "</script><script>alert(1)" });
    assert.match(html, /\\u003c/);
    assert.doesNotMatch(html, /<\/script>/);
  });
});


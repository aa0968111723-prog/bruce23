import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  annotateFileTree,
  githubFileUrl,
  limitFileTree,
  nestFileTree,
  parseGithubMetadata,
  parseGithubRateLimit,
  parseGithubUrl,
  readmeFetchState,
  summarizeReadme,
  validateGithubUrl,
} from "./github-url.ts";
import { parseCanvaInput, isAllowedCanvaHost, extractUrlFromEmbedCode, canvaFallbackMessage } from "./canva-url.ts";
import { interpretDemoResponse, isSafeHttpsUrl, demoFallbackCopy } from "./demo-url.ts";
import { assertAdminAccess, parseAdminEmails, readAdminAllowlist } from "./admin-access.ts";
import { assertNoSecrets, toPublicProject } from "./privacy.ts";
import { localZenReply } from "./zen-engine.ts";
import { buildRelationGraph, projectMatchesKind } from "./relations.ts";
import { projects } from "../../content/projects.ts";
import type { AdminProject } from "./types.ts";

describe("github url", () => {
  it("parses owner/repo", () => {
    const parsed = parseGithubUrl("https://github.com/aa0968111723-prog/FrameLab");
    assert.deepEqual(parsed, {
      owner: "aa0968111723-prog",
      repo: "FrameLab",
      url: "https://github.com/aa0968111723-prog/FrameLab",
    });
  });
  it("rejects non-github urls", () => {
    const result = validateGithubUrl("https://example.com/repo");
    assert.equal(result.ok, false);
  });
  it("builds file urls", () => {
    assert.match(githubFileUrl("o", "r", "main", "src/lib/zen.ts"), /blob\/main\/src\/lib\/zen.ts/);
  });
});

describe("github metadata parse", () => {
  it("maps REST payload", () => {
    const meta = parseGithubMetadata({
      name: "FrameLab",
      full_name: "aa0968111723-prog/FrameLab",
      description: "workstation",
      default_branch: "main",
      private: false,
      html_url: "https://github.com/aa0968111723-prog/FrameLab",
    });
    assert.equal(meta.visibility, "public");
    assert.equal(meta.defaultBranch, "main");
  });
  it("limits file tree and skips node_modules", () => {
    const tree = limitFileTree(
      [
        { path: "src/a.ts", type: "blob" },
        { path: "node_modules/x", type: "blob" },
        { path: "a/b/c/d/e.ts", type: "blob" },
      ],
      { max: 10, maxDepth: 3 },
    );
    assert.equal(tree.length, 1);
    assert.equal(tree[0].path, "src/a.ts");
  });
  it("summarizes readme", () => {
    const summary = summarizeReadme("# Title\n\nHello world ".repeat(80), 80);
    assert.ok(summary.endsWith("…"));
  });
});

describe("github rate limit", () => {
  it("detects remaining 0", () => {
    const headers = new Headers({
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": "1710000000",
    });
    const state = parseGithubRateLimit(headers);
    assert.equal(state.limited, true);
  });
});

describe("canva allowlist", () => {
  it("accepts canva.com design urls", () => {
    const parsed = parseCanvaInput("https://www.canva.com/design/ABC123/view");
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.value.designId, "ABC123");
  });
  it("rejects other hosts", () => {
    const parsed = parseCanvaInput("https://evil.example/design/ABC");
    assert.equal(parsed.ok, false);
  });
  it("extracts iframe src then allowlists", () => {
    const src = extractUrlFromEmbedCode('<iframe src="https://www.canva.com/design/ZZ/view?embed"></iframe>');
    assert.equal(src?.includes("canva.com"), true);
    assert.equal(isAllowedCanvaHost("www.canva.com"), true);
  });
  it("embed fail copy mentions permission", () => {
    assert.match(canvaFallbackMessage("failed"), /權限/);
  });
});

describe("demo fallback", () => {
  it("only allows https", () => {
    assert.equal(isSafeHttpsUrl("javascript:alert(1)"), false);
    assert.equal(isSafeHttpsUrl("https://example.com"), true);
  });
  it("marks x-frame-options deny as not embeddable", () => {
    const result = interpretDemoResponse({
      ok: true,
      status: 200,
      xFrameOptions: "DENY",
      csp: null,
    });
    assert.equal(result.status, "verified");
    assert.equal(result.embeddableGuess, false);
    assert.match(demoFallbackCopy(false), /嵌入/);
  });
  it("treats 404 as unavailable not success", () => {
    const result = interpretDemoResponse({
      ok: false,
      status: 404,
      xFrameOptions: null,
      csp: null,
    });
    assert.equal(result.status, "unavailable");
  });
});

describe("admin allowlist fail closed", () => {
  it("parses emails", () => {
    assert.deepEqual(parseAdminEmails("a@x.com, b@y.com"), ["a@x.com", "b@y.com"]);
  });
  it("fails closed when unset", () => {
    const parsed = readAdminAllowlist({});
    assert.equal(parsed.ok, false);
  });
  it("rejects non-admin", () => {
    assert.throws(
      () => assertAdminAccess({ email: "other@example.com", env: { PORTFOLIO_ADMIN_EMAILS: "aa0968111723@gmail.com" } }),
      /Not a portfolio admin/,
    );
  });
  it("allows listed email", () => {
    const result = assertAdminAccess({
      email: "aa0968111723@gmail.com",
      env: { PORTFOLIO_ADMIN_EMAILS: "aa0968111723@gmail.com" },
    });
    assert.equal(result.email, "aa0968111723@gmail.com");
  });
});

function sampleAdmin(over: Partial<AdminProject> = {}): AdminProject {
  return {
    id: "x",
    slug: "demo-work",
    title: "Demo",
    subtitle: "",
    category: "AI Product",
    year: "2026",
    productStatus: "prototype",
    featured: true,
    sortOrder: 0,
    summary: "s",
    problem: "",
    role: "",
    decisions: [],
    modalities: ["圖像"],
    process: [],
    outputs: [],
    stack: [],
    limitations: [],
    media: [],
    sourceEvidence: [],
    github: {
      url: "https://github.com/aa0968111723-prog/ai_os",
      owner: "aa0968111723-prog",
      repo: "ai_os",
      branch: "main",
      syncStatus: "verified",
      lastSyncedAt: null,
      metadata: {
        name: "ai_os",
        fullName: "aa0968111723-prog/ai_os",
        description: "創作系統",
        homepage: null,
        defaultBranch: "main",
        updatedAt: null,
        pushedAt: null,
        language: "TypeScript",
        visibility: "public",
        archived: false,
        htmlUrl: "https://github.com/aa0968111723-prog/ai_os",
      },
      readmeSummary: "ok",
      fileTree: [],
      languages: { TypeScript: 1 },
      topics: [],
      latestCommit: null,
    },
    liveDemo: null,
    canva: null,
    experienceMode: "process-map",
    experienceConfig: {},
    interactionSteps: [],
    seoTitle: null,
    seoDescription: null,
    localeZh: {},
    localeEn: {},
    publicationStatus: "published",
    publishedAt: null,
    archivedAt: null,
    githubSyncEnabled: true,
    githubSyncError: "secret-should-not-leak-via-public",
    githubReadme: "full readme",
    githubIsPrivate: false,
    liveDemoError: null,
    canvaError: null,
    ownerUserId: "admin-1",
    createdAt: "",
    updatedAt: "",
    ...over,
  };
}

describe("privacy", () => {
  it("hides drafts from public", () => {
    assert.equal(toPublicProject(sampleAdmin({ publicationStatus: "draft" })), null);
  });
  it("hides private github from public", () => {
    const pub = toPublicProject(sampleAdmin({ githubIsPrivate: true, publicationStatus: "published" }));
    assert.equal(pub?.github, null);
  });
  it("does not put admin errors or tokens in public objects", () => {
    const pub = toPublicProject(sampleAdmin());
    assert.ok(pub);
    const hits = assertNoSecrets(pub);
    assert.deepEqual(hits, []);
    assert.equal("githubReadme" in pub, false);
    assert.equal("githubSyncError" in pub, false);
    assert.equal("ownerUserId" in pub, false);
  });
});

describe("seed inventory", () => {
  it("keeps eight featured projects", () => {
    assert.equal(projects.length, 8);
    assert.ok(projects.every((p) => p.featured));
  });
});

describe("relations are data-backed", () => {
  it("maps image modality to matching works", () => {
    const pub = toPublicProject(sampleAdmin())!;
    assert.equal(projectMatchesKind(pub, "image"), true);
    const graph = buildRelationGraph([pub]);
    assert.ok(graph.find((n) => n.kind === "image")?.slugs.includes("demo-work"));
  });
});

describe("local zen engine", () => {
  it("is deterministic and not a cloud llm", () => {
    assert.equal(localZenReply("考試好緊張").intent, "stress");
    assert.equal(localZenReply("考試好緊張").intent, "stress");
  });
});

describe("readme failure contract", () => {
  it("keeps a non-success label for missing readme", () => {
    const summary = summarizeReadme("");
    assert.equal(summary, "");
    const missing = readmeFetchState(404);
    assert.equal(missing.ok, false);
    assert.equal(missing.status, "unavailable");
    const failed = readmeFetchState(500);
    assert.equal(failed.status, "failed");
  });
});

describe("file tree nesting", () => {
  it("expands folders from paths", () => {
    const tree = nestFileTree([
      { path: "src", type: "dir" },
      { path: "src/lib/zen.ts", type: "file", purpose: "本地引擎" },
    ]);
    assert.equal(tree[0]?.name, "src");
    assert.equal(tree[0]?.children[0]?.name, "lib");
    assert.equal(tree[0]?.children[0]?.children[0]?.name, "zen.ts");
  });
  it("annotates matching github paths", () => {
    const annotated = annotateFileTree(
      [{ path: "src/lib/zen.ts", type: "file" as const, purpose: undefined as string | undefined }],
      [{ githubPath: "src/lib", body: "本地回應", workflowStage: "intent" }],
    );
    assert.equal(annotated[0]?.purpose, "本地回應");
  });
});

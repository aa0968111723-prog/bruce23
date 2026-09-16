import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { assertAdminAccess, isAllowedAdminOrigin, parseAdminEmails } from "./admin.ts";
import { AdminConfigError, ForbiddenError } from "./errors.ts";
import { publishedCreativeWorkJsonLd } from "./jsonld.ts";
import { resolveHomepageCopy } from "./public-site.ts";
import type { PublicProject } from "./privacy.ts";

describe("admin allowlist", () => {
  it("parses emails", () => {
    assert.deepEqual(parseAdminEmails("aa0968111723@gmail.com, other@x.com"), [
      "aa0968111723@gmail.com",
      "other@x.com",
    ]);
  });

  it("fails closed when allowlist is missing", () => {
    assert.throws(
      () => assertAdminAccess({ userId: "user-1", email: "aa0968111723@gmail.com", allowlist: [] }),
      AdminConfigError,
    );
  });

  it("rejects the shared dev user", () => {
    assert.throws(
      () =>
        assertAdminAccess({
          userId: "dev-user",
          email: "aa0968111723@gmail.com",
          allowlist: ["aa0968111723@gmail.com"],
        }),
      ForbiddenError,
    );
  });

  it("rejects signed-in non-admins", () => {
    assert.throws(
      () =>
        assertAdminAccess({
          userId: "someone",
          email: "visitor@gmail.com",
          allowlist: ["aa0968111723@gmail.com"],
        }),
      ForbiddenError,
    );
  });

  it("allows the named admin email", () => {
    const result = assertAdminAccess({
      userId: "admin-1",
      email: "aa0968111723@gmail.com",
      allowlist: ["aa0968111723@gmail.com"],
    });
    assert.equal(result.email, "aa0968111723@gmail.com");
  });

  it("rejects unauthenticated users even when an allowlist exists", () => {
    assert.throws(
      () =>
        assertAdminAccess({
          userId: "anon",
          email: undefined,
          allowlist: ["aa0968111723@gmail.com"],
        }),
      ForbiddenError,
    );
  });

  it("requires authMiddleware on every admin server function", () => {
    const source = readFileSync(new URL("./admin-fn.ts", import.meta.url), "utf8");
    const created = [...source.matchAll(/export const (\w+Fn) = createServerFn/g)].map((match) => match[1]);
    assert.ok(created.length >= 10, "expected admin server functions");
    for (const name of created) {
      const block = source.slice(source.indexOf(`export const ${name}`));
      const head = block.slice(0, block.indexOf(".handler"));
      assert.match(head, /authMiddleware/, `${name} must use authMiddleware`);
    }
    assert.doesNotMatch(source, /VITE_GITHUB/);
    assert.doesNotMatch(source, /VITE_CANVA/);
  });

  it("rejects cross-origin admin requests", () => {
    assert.equal(isAllowedAdminOrigin(null, "example.com"), true);
    assert.equal(isAllowedAdminOrigin("https://example.com", "example.com"), true);
    assert.equal(isAllowedAdminOrigin("https://localhost:8080", "127.0.0.1:8080"), true);
    assert.equal(isAllowedAdminOrigin("https://evil.example", "example.com"), false);
    assert.equal(isAllowedAdminOrigin("not-a-url", "example.com"), false);
  });

  it("keeps Canva Connect fail-closed and never reports a fake connected OAuth", () => {
    const source = readFileSync(new URL("./admin-fn.ts", import.meta.url), "utf8");
    assert.match(source, /disconnectedCanvaStatus/);
    assert.match(source, /canvaCredentialsPresent/);
    assert.match(source, /startCanvaOAuth/);
    assert.match(source, /searchCanvaDesigns/);
    assert.match(source, /getCanvaDesign/);
    assert.match(source, /continuation/);
    assert.doesNotMatch(source, /connected:\s*true/);
    assert.match(source, /authMiddleware/);
    assert.match(source, /handleTestCanvaEmbed/);
    assert.match(source, /runAdminSql/);
    assert.match(source, /previewDraftFn/);
    assert.match(source, /handleCreateProject/);
    assert.match(source, /handleSaveDraft/);
    assert.match(source, /handlePreviewDraft/);
    assert.match(source, /handleSetPublication/);
    const handlers = readFileSync(new URL("./admin-handlers.server.ts", import.meta.url), "utf8");
    assert.match(handlers, /runAdminSql/);
    assert.match(handlers, /persistCanvaEmbedTest/);
    assert.match(handlers, /notionAdapter/);
    assert.match(handlers, /Notion 未連接/);
    assert.doesNotMatch(handlers, /dev-user/);
    const embed = readFileSync(new URL("../canva/embed.ts", import.meta.url), "utf8");
    assert.match(embed, /語法通過 Canva 允許清單/);
    assert.doesNotMatch(embed, /status: "verified"/);
    const runtime = readFileSync(new URL("./admin-runtime.server.ts", import.meta.url), "utf8");
    assert.match(runtime, /evaluateCanvaEmbedTest/);
    assert.doesNotMatch(runtime, /canva_status = 'verified'/);
    assert.doesNotMatch(source, /假裝已經連上/);
    assert.doesNotMatch(handlers, /notion: \{\s*connected:\s*true/);
  });

  it("builds sitemap from published projects only", () => {
    const source = readFileSync(new URL("../../routes/sitemap[.]xml.ts", import.meta.url), "utf8");
    assert.match(source, /listPublishedProjectsFn/);
    assert.match(source, /publicSitemapPaths/);
    assert.doesNotMatch(source, /listAdminProjectsFn/);
  });

  it("does not expose admin session helpers on public CMS functions", () => {
    const source = readFileSync(new URL("./public-fn.ts", import.meta.url), "utf8");
    assert.doesNotMatch(source, /authMiddleware/);
    assert.doesNotMatch(source, /requireAdminActor/);
    assert.doesNotMatch(source, /GITHUB_READ_TOKEN/);
    assert.doesNotMatch(source, /CANVA_CLIENT_SECRET/);
    assert.doesNotMatch(source, /previewDraftFn/);
  });

  it("does not enable email-password or ship a session-mint backdoor", () => {
    const flag = readFileSync(new URL("../auth/email-password.ts", import.meta.url), "utf8");
    assert.match(flag, /emailAndPasswordEnabled = false/);
    const login = readFileSync(new URL("../../routes/login.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(login, /password/);
    assert.match(login, /Google/);
    const routes = readFileSync(new URL("../../routeTree.gen.ts", import.meta.url), "utf8");
    assert.doesNotMatch(routes, /mint-session|mintAdmin|fake-login|dev-login/);
    const jsonld = readFileSync(new URL("./jsonld.ts", import.meta.url), "utf8");
    assert.match(jsonld, /CreativeWork/);
    assert.match(jsonld, /inLanguage/);
    const view = readFileSync(new URL("../../components/work/CaseStudyView.tsx", import.meta.url), "utf8");
    assert.match(view, /publishedCreativeWorkJsonLd/);
    const runner = readFileSync(new URL("../../../scripts/run-admin-e2e.mjs", import.meta.url), "utf8");
    assert.match(runner, /ssrLoadModule/);
    assert.match(runner, /admin-e2e.runner/);
    assert.doesNotMatch(runner, /emailAndPasswordEnabled = true/);
  });
});

describe("public json-ld and homepage copy", () => {
  it("builds CreativeWork json-ld from a published project shape", () => {
    const jsonLd = publishedCreativeWorkJsonLd({
      slug: "folio",
      title: "Folio",
      summary: "摘要",
      media: [{ src: "/media/covers/folio.svg", alt: "x", kind: "image" }],
    } as PublicProject);
    assert.equal(jsonLd["@type"], "CreativeWork");
    assert.equal(jsonLd.url, "/work/folio");
    assert.equal(jsonLd.image, "/media/covers/folio.svg");
  });

  it("prefers saved zh/en locale and SEO on the public homepage", () => {
    const copy = resolveHomepageCopy(
      {
        nameZh: "柏能",
        nameEn: "Luminous Studio",
        person: "Bruce",
        role: "role",
        headline: "primary headline",
        subhead: "primary subhead",
        narrative: "primary narrative",
        email: "a@b.c",
        github: "https://github.com/x",
        githubHandle: "x",
        location: "Taipei",
        seoTitle: "SEO",
        seoDescription: "desc",
        homepageHighlightSlugs: ["framelab"],
        locale: { zh: { headline: "中文", narrative: "敘事" }, en: { headline: "EN" } },
      },
      { nameEn: "fb", person: "fb", headline: "fb", subhead: "fb", narrative: "fb" },
    );
    assert.equal(copy.headline, "中文");
    assert.equal(copy.narrative, "敘事");
    assert.equal(copy.subhead, "EN");
    assert.equal(copy.seoTitle, "SEO");
  });
});

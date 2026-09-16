import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { assertAdminAccess, isAllowedAdminOrigin, parseAdminEmails } from "./admin.ts";
import { AdminConfigError, ForbiddenError } from "./errors.ts";

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
    assert.match(source, /previewDraftFn/);
    assert.match(source, /語法通過 Canva 允許清單/);
    assert.doesNotMatch(source, /canva_status = 'verified'/);
    assert.doesNotMatch(source, /假裝已經連上/);
    assert.match(source, /notionAdapter/);
    assert.match(source, /Notion 未連接/);
    assert.doesNotMatch(source, /notion: \{\s*connected:\s*true/);
  });

  it("builds sitemap from published projects only", () => {
    const source = readFileSync(new URL("../../routes/sitemap[.]xml.ts", import.meta.url), "utf8");
    assert.match(source, /listPublishedProjectsFn/);
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
});

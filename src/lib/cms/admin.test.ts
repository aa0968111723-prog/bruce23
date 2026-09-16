import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { assertAdminAccess, parseAdminEmails } from "./admin.ts";
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
});

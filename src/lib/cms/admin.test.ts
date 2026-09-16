import assert from "node:assert/strict";
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
});

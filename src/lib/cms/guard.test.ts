import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AdminConfigError,
  ForbiddenError,
  assertAdminAccess,
  evaluateAdminAccess,
  parseAdminAllowlist,
} from "./guard.ts";

describe("parseAdminAllowlist", () => {
  it("fails closed on unset or blank", () => {
    assert.equal(parseAdminAllowlist(undefined), null);
    assert.equal(parseAdminAllowlist(null), null);
    assert.equal(parseAdminAllowlist(""), null);
    assert.equal(parseAdminAllowlist("   ,  ;"), null);
  });

  it("parses comma-separated emails", () => {
    assert.deepEqual(parseAdminAllowlist("aa0968111723@gmail.com"), [
      "aa0968111723@gmail.com",
    ]);
    assert.deepEqual(
      parseAdminAllowlist("A@x.com, b@y.com"),
      ["a@x.com", "b@y.com"],
    );
  });
});

describe("evaluateAdminAccess", () => {
  const allowlist = ["aa0968111723@gmail.com"];

  it("rejects unsigned-in callers", () => {
    const d = evaluateAdminAccess({
      allowlist,
      userId: null,
      email: "aa0968111723@gmail.com",
    });
    assert.equal(d.ok, false);
    if (!d.ok) assert.equal(d.reason, "unauthenticated");
  });

  it("fails closed when allowlist is unset — not all signed-in users", () => {
    const d = evaluateAdminAccess({
      allowlist: null,
      userId: "user-1",
      email: "anyone@gmail.com",
    });
    assert.equal(d.ok, false);
    if (!d.ok) assert.equal(d.reason, "not_configured");
  });

  it("rejects signed-in non-admin", () => {
    const d = evaluateAdminAccess({
      allowlist,
      userId: "user-2",
      email: "other@example.com",
    });
    assert.equal(d.ok, false);
    if (!d.ok) assert.equal(d.reason, "forbidden");
  });

  it("allows the configured admin email only", () => {
    const d = evaluateAdminAccess({
      allowlist,
      userId: "user-1",
      email: "aa0968111723@gmail.com",
    });
    assert.equal(d.ok, true);
  });
});

describe("assertAdminAccess", () => {
  it("throws AdminConfigError when unset", () => {
    assert.throws(
      () =>
        assertAdminAccess({
          allowlist: null,
          userId: "u",
          email: "aa0968111723@gmail.com",
        }),
      AdminConfigError,
    );
  });

  it("throws ForbiddenError for non-admin", () => {
    assert.throws(
      () =>
        assertAdminAccess({
          allowlist: ["aa0968111723@gmail.com"],
          userId: "u",
          email: "nope@x.com",
        }),
      ForbiddenError,
    );
  });
});

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { applyPreviewLocalDefaults, readOrCreatePreviewAuthSecret } from "./preview-local.mjs";

test("vite dev without DATABASE_URL gets a file PGLite dir and durable secret", () => {
  const root = mkdtempSync(join(tmpdir(), "preview-local-"));
  const env = applyPreviewLocalDefaults({}, { command: "vite", args: ["dev"], root });
  assert.ok(env.PGLITE_DATA_DIR?.endsWith("/.grok/pglite"));
  assert.ok(String(env.BETTER_AUTH_SECRET).length >= 32);
});

test("vite preview and build do not take the exclusive PGLite file lock", () => {
  const root = mkdtempSync(join(tmpdir(), "preview-local-"));
  const preview = applyPreviewLocalDefaults({}, { command: "vite", args: ["preview"], root });
  const build = applyPreviewLocalDefaults({}, { command: "vite", args: ["build"], root });
  assert.equal(preview.PGLITE_DATA_DIR, undefined);
  assert.equal(build.PGLITE_DATA_DIR, undefined);
});

test("DATABASE_URL skips the workspace PGLite file and generated secret", () => {
  const env = applyPreviewLocalDefaults(
    { DATABASE_URL: "postgres://example", BETTER_AUTH_SECRET: "" },
    { command: "vite", args: ["dev"], forcePgliteFile: true },
  );
  assert.equal(env.PGLITE_DATA_DIR, undefined);
  assert.equal(env.BETTER_AUTH_SECRET, "");
});

test("VERCEL skips the workspace PGLite file", () => {
  const env = applyPreviewLocalDefaults(
    { VERCEL: "1" },
    { command: "vite", args: ["dev"], forcePgliteFile: true },
  );
  assert.equal(env.PGLITE_DATA_DIR, undefined);
});

test("forcePgliteFile still refuses Neon", () => {
  const env = applyPreviewLocalDefaults(
    { DATABASE_URL: "postgres://example" },
    { forcePgliteFile: true },
  );
  assert.equal(env.PGLITE_DATA_DIR, undefined);
});

test("preview auth secret is reused from disk", () => {
  const root = mkdtempSync(join(tmpdir(), "preview-secret-"));
  const first = readOrCreatePreviewAuthSecret(root);
  const second = readOrCreatePreviewAuthSecret(root);
  assert.equal(first, second);
  assert.equal(readFileSync(join(root, ".grok/preview-auth-secret"), "utf8").trim(), first);
});

test("session mint is a scripts/ helper, not a public route", () => {
  const routesDir = fileURLToPath(new URL("../src/routes", import.meta.url));
  const names = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else names.push(path);
    }
  };
  walk(routesDir);
  const joined = names.join("\n");
  assert.doesNotMatch(joined, /test-login|mint-admin|fake-login|dev-login/);
  const mint = readFileSync(new URL("./mint-admin-session.mjs", import.meta.url), "utf8");
  assert.match(mint, /ssrLoadModule/);
  assert.match(mint, /admin-session-mint\.runner/);
  assert.match(mint, /Not a public route/);
  assert.doesNotMatch(mint, /src\/routes/);
  const live = readFileSync(new URL("./run-admin-live-e2e.mjs", import.meta.url), "utf8");
  assert.match(live, /mint-admin-session\.mjs/);
  assert.match(live, /SESSION_TOKEN_COOKIE/);
  assert.doesNotMatch(live, /\/api\/test-login/);
});

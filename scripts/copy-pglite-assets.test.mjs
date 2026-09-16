import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { findPgliteBundleDirs } from "./copy-pglite-assets.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("pglite production assets", () => {
  it("keeps the upstream pglite.data file installable", () => {
    assert.equal(
      existsSync(join(root, "node_modules/@electric-sql/pglite/dist/pglite.data")),
      true,
    );
    assert.equal(
      existsSync(join(root, "node_modules/@electric-sql/pglite/dist/initdb.wasm")),
      true,
    );
  });

  it("finds nitro-bundled pglite after a build", () => {
    const output = join(root, ".vercel/output");
    if (!existsSync(output)) return;
    const dirs = findPgliteBundleDirs(output);
    assert.ok(dirs.length >= 1);
  });
});

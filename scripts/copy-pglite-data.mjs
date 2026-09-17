#!/usr/bin/env node
/**
 * Nitro bundles `@electric-sql/pglite` without its sibling `pglite.data` file.
 * Production on Vercel uses Neon (`DATABASE_URL`). Local `vite preview` still
 * boots PGLite, so copy the data file next to the bundled module.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(destDir)) {
  console.warn("[pglite] server function output not found — skip copy");
  process.exit(0);
}
mkdirSync(destDir, { recursive: true });

let copied = 0;
for (const name of files) {
  const src = join(srcDir, name);
  if (!existsSync(src)) {
    console.warn(`[pglite] dist/${name} not found — skip`);
    continue;
  }
  copyFileSync(src, join(destDir, name));
  copied += 1;
}
console.log(`[pglite] copied ${copied}/${files.length} sibling assets into the server function output`);

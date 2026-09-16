#!/usr/bin/env node
/**
 * Nitro bundles `@electric-sql/pglite` into `.vercel/output/.../_libs/` but
 * does not copy the sibling WASM payload. Local `vite preview` (no DATABASE_URL)
 * then crashes looking for `pglite.data` next to the bundled module.
 *
 * Deployed apps use Neon (`DATABASE_URL`) and never load PGLite. This copy is
 * for production-preview smoke and any preview-only PGLite fallback.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(
  root,
  ".vercel/output/functions/__server.func/_libs",
);

if (!existsSync(destDir)) {
  console.warn("[pglite-assets] no vercel server output; skip");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(srcDir, name);
  if (!existsSync(from)) {
    console.warn(`[pglite-assets] missing ${from}`);
    continue;
  }
  copyFileSync(from, join(destDir, name));
  console.log(`[pglite-assets] copied ${name}`);
}

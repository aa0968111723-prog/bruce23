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
const src = join(root, "node_modules/@electric-sql/pglite/dist/pglite.data");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
const dest = join(destDir, "pglite.data");

if (!existsSync(src)) {
  console.warn("[pglite] dist/pglite.data not found — skip copy");
  process.exit(0);
}
if (!existsSync(destDir)) {
  console.warn("[pglite] server function output not found — skip copy");
  process.exit(0);
}
mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("[pglite] copied pglite.data into the server function output");

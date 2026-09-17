#!/usr/bin/env node
/**
 * Nitro bundles `@electric-sql/pglite` into `_libs/` but does not copy
 * `pglite.data` / `pglite.wasm` next to it. PGLite then ENOENTs on
 * `new URL("./pglite.data")` during `vite preview` (no DATABASE_URL).
 * Vercel with Neon never constructs PGLite, but local production QA does.
 * Zeabur node-server output lives under `.output/` instead of `.vercel/output`.
 */
import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = ["pglite.data", "pglite.wasm", "initdb.wasm"];

export function findPgliteBundleDirs(outputRoot = join(ROOT, ".vercel/output")) {
  const dirs = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name);
      if (name.isDirectory()) walk(p);
      else if (name.name.includes("electric-sql__pglite") && name.name.endsWith(".mjs")) {
        dirs.push(dirname(p));
      }
    }
  }
  walk(outputRoot);
  return dirs;
}

export function copyPgliteData(outputRoot = join(ROOT, ".vercel/output")) {
  const dirs = findPgliteBundleDirs(outputRoot);
  if (dirs.length === 0) return { copied: 0, dirs: [], files: [] };
  const files = [];
  for (const asset of ASSETS) {
    const source = join(ROOT, "node_modules/@electric-sql/pglite/dist", asset);
    if (!existsSync(source)) throw new Error(`missing ${source}`);
    for (const dir of dirs) {
      const dest = join(dir, asset);
      copyFileSync(source, dest);
      files.push(dest);
    }
  }
  return { copied: files.length, dirs, files };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  let copied = 0;
  for (const root of [join(ROOT, ".vercel/output"), join(ROOT, ".output")]) {
    const result = copyPgliteData(root);
    copied += result.copied;
  }
  console.log(`[pglite-assets] copied ${copied} PGLite asset(s)`);
}

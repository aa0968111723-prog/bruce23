#!/usr/bin/env node
/**
 * Test-only: mint a Better Auth session into the shared preview PGLite file.
 * Not a public route. Exits so Vite can open the same dataDir.
 */
import { createServer } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyPreviewLocalDefaults,
  writeAdminSessionFile,
} from "./preview-local.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
if (String(process.env.DATABASE_URL ?? "").trim() || String(process.env.VERCEL ?? "").trim()) {
  throw new Error("refusing to mint a session against Neon/Vercel; preview PGLite file only");
}
Object.assign(
  process.env,
  applyPreviewLocalDefaults(process.env, { forcePgliteFile: true, root }),
);
process.env.CMS_SKIP_GITHUB_HYDRATE ??= "1";
if (!process.env.PORTFOLIO_ADMIN_EMAILS?.trim()) {
  process.env.PORTFOLIO_ADMIN_EMAILS = "aa0968111723@gmail.com";
}

const vite = await createServer({
  configFile: false,
  root,
  appType: "custom",
  logLevel: "error",
  clearScreen: false,
  server: { middlewareMode: true, hmr: false },
  resolve: {
    alias: { "@": resolve(root, "src") },
  },
});

try {
  const mod = await vite.ssrLoadModule("/src/lib/cms/admin-session-mint.runner.ts");
  const minted = await mod.mintLiveAdminSession();
  await mod.closeMintedAdminDb();
  await new Promise((resolve) => setTimeout(resolve, 300));
  writeAdminSessionFile({
    email: minted.email,
    userId: minted.userId,
    token: minted.token,
    cookieName: minted.cookieName,
  });
  console.log(`minted Better Auth session for ${minted.email} (userId=${minted.userId})`);
} finally {
  await vite.close();
}

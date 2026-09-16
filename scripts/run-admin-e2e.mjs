#!/usr/bin/env node
import { createServer } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
// Isolated handler E2E must stay in-memory so it never takes the preview PGLite file lock.
delete process.env.PGLITE_DATA_DIR;
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

async function proveUnauthenticatedAdminBrowser() {
  const origin = "http://127.0.0.1:8080";
  const login = await fetch(`${origin}/login`, { signal: AbortSignal.timeout(4000) });
  if (!login.ok) throw new Error(`live /login returned ${login.status}`);
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${origin}/admin`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForSelector("text=後台登入", { timeout: 15000 });
    const html = await page.content();
    if (/type=["']password["']/.test(html)) {
      throw new Error("password login appeared on the unauthenticated admin gate");
    }
    if (await page.getByRole("heading", { name: "內容總覽" }).count()) {
      throw new Error("admin dashboard was visible while signed out");
    }
    const google = page.getByRole("button", { name: /Google/ });
    if ((await google.count()) < 1) throw new Error("Google sign-in button missing");
    mkdirSync(resolve(root, "screenshots"), { recursive: true });
    await page.screenshot({
      path: resolve(root, "screenshots/admin-unauth-login.png"),
      fullPage: true,
    });
    console.log("ok - unauthenticated browser /admin stays on Google-only login");
  } finally {
    await browser.close();
  }
}

try {
  const mod = await vite.ssrLoadModule("/src/lib/cms/admin-e2e.runner.ts");
  await mod.runAdminE2E();
  await proveUnauthenticatedAdminBrowser();
  console.log("admin Better Auth session E2E: ok");
} finally {
  await vite.close();
}

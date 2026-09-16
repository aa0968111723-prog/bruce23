#!/usr/bin/env node
/**
 * Live preview admin E2E: shared PGLite file + real session cookie + real /admin UI.
 * Mint is a sibling script, never a src/routes endpoint.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADMIN_EMAIL,
  ADMIN_SESSION_FILE,
  BEARER_STORAGE_KEY,
  DEFAULT_PGLITE_DATA_DIR,
  SESSION_TOKEN_COOKIE,
  applyPreviewLocalDefaults,
  readAdminSessionFile,
} from "./preview-local.mjs";
import { stopDev8080 } from "./dev-listen.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
if (String(process.env.DATABASE_URL ?? "").trim() || String(process.env.VERCEL ?? "").trim()) {
  throw new Error("refusing live admin E2E against Neon/Vercel; preview PGLite file only");
}
Object.assign(
  process.env,
  applyPreviewLocalDefaults(process.env, { forcePgliteFile: true, root }),
);
process.env.CMS_SKIP_GITHUB_HYDRATE ??= "1";
if (!process.env.PORTFOLIO_ADMIN_EMAILS?.trim()) {
  process.env.PORTFOLIO_ADMIN_EMAILS = ADMIN_EMAIL;
}

const ORIGIN = "http://127.0.0.1:8080";
const SLUG = "live-e2e-work";
const TITLE = "Live E2E";
const MARKER = `LIVE-E2E ${new Date().toISOString()}`;
const SHOTS = resolve(root, "screenshots");

function runNode(script) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: root,
      env: process.env,
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${script} exited ${signal ?? code}`));
    });
  });
}

async function waitForOrigin(url, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  let last = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status > 0) return;
      last = `status ${res.status}`;
    } catch (err) {
      last = err instanceof Error ? err.message : "fetch failed";
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`${url} did not answer within ${timeoutMs}ms (${last})`);
}

async function startDev() {
  await new Promise((resolvePromise, reject) => {
    const child = spawn("sh", ["/workspace/startup.sh"], {
      cwd: root,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`startup.sh exited ${code}`));
    });
  });
  await waitForOrigin(`${ORIGIN}/`);
}

async function restoreDev() {
  try {
    await startDev();
  } catch (err) {
    console.error("failed to restore preview after live admin E2E", err);
  }
}

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

async function dumpFailure(page, name) {
  mkdirSync(SHOTS, { recursive: true });
  try {
    await page.screenshot({ path: resolve(SHOTS, name), fullPage: true });
  } catch {
    // ignore
  }
  try {
    writeFileSync(resolve(SHOTS, `${name}.html`), await page.content());
  } catch {
    // ignore
  }
}

async function attachSession(context, page, session) {
  // `__Host-` cookies require a secure transport. Chromium rejects injecting
  // them onto http://127.0.0.1, so live E2E uses the same bearer path the
  // partitioned live-preview iframe already uses (`grok-auth.bearer-token`).
  await page.addInitScript(
    ({ token, key }) => {
      try {
        sessionStorage.setItem(key, token);
      } catch {
        // ignore
      }
    },
    { token: session.token, key: BEARER_STORAGE_KEY },
  );
}

async function waitForProjectList(page) {
  await page.getByRole("heading", { name: "作品" }).waitFor({ timeout: 20000 });
  await page.locator('a[href*="/admin/projects/"]').first().waitFor({ timeout: 20000 });
}

async function openOrCreateWork(page) {
  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  const existing = page.getByText(SLUG, { exact: true });
  if (await existing.count()) {
    await existing.first().click();
  } else {
    await page.getByRole("link", { name: "新增", exact: true }).click();
    await page.getByRole("heading", { name: "新增作品" }).waitFor({ timeout: 15000 });
    await page.getByLabel("標題", { exact: true }).fill(TITLE);
    await page.getByLabel("slug", { exact: true }).fill(SLUG);
    await page.getByRole("button", { name: "建立草稿" }).click();
  }
  try {
    await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });
  } catch (err) {
    await gotoReady(page, `${ORIGIN}/admin/projects`);
    await waitForProjectList(page);
    const retry = page.getByText(SLUG, { exact: true });
    if (!(await retry.count())) throw err;
    await retry.first().click();
    await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });
  }
}

async function gotoReady(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
}

async function proveLiveAdmin(page, request) {
  const session = readAdminSessionFile();
  const sessionRes = await request.get(`${ORIGIN}/api/auth/get-session`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      origin: ORIGIN,
      "sec-fetch-site": "same-origin",
    },
  });
  const sessionJson = await sessionRes.json();
  assert(
    sessionJson?.user?.email === ADMIN_EMAIL,
    `get-session did not return the minted admin email: ${JSON.stringify(sessionJson)}`,
  );
  assert(sessionJson?.user?.id !== "dev-user", "get-session returned the shared dev-user");

  await gotoReady(page, `${ORIGIN}/admin`);
  try {
    await page.getByRole("heading", { name: "內容總覽" }).waitFor({ timeout: 20000 });
  } catch (err) {
    await dumpFailure(page, "admin-live-failed.png");
    throw new Error(`authenticated /admin did not show 內容總覽: ${err instanceof Error ? err.message : err}`);
  }
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: resolve(SHOTS, "admin-live-home.png"), fullPage: true });

  await openOrCreateWork(page);
  await page.locator("fieldset").filter({ hasText: "敘事" }).locator("textarea").first().fill(MARKER);
  await page.getByRole("button", { name: "存成草稿" }).click();
  await page.getByText("存成草稿成功").first().waitFor({ timeout: 20000 });
  await page.screenshot({ path: resolve(SHOTS, "admin-live-draft-saved.png"), fullPage: true });

  const workList = await request.get(`${ORIGIN}/work`);
  const workHtml = await workList.text();
  assert(!workHtml.includes(SLUG), "draft slug leaked into the public work list HTML");
  assert(!workHtml.includes(MARKER), "draft marker leaked into the public work list");

  const caseRes = await request.get(`${ORIGIN}/work/${SLUG}`, { maxRedirects: 0 });
  const caseHtml = await caseRes.text();
  assert(
    caseRes.status() === 404 || /找不到|不存在|Not found|尚未發布|還沒被放進光域/i.test(caseHtml) || !caseHtml.includes(MARKER),
    `draft case page should not show the saved marker (status ${caseRes.status()})`,
  );
  await gotoReady(page, `${ORIGIN}/work/${SLUG}`);
  await page.screenshot({ path: resolve(SHOTS, "public-draft-omitted.png"), fullPage: true });
  const omitted = await page.content();
  assert(!omitted.includes(MARKER), "public case still shows the draft marker");

  const sitemap = await (await request.get(`${ORIGIN}/sitemap.xml`)).text();
  assert(!sitemap.includes(`/work/${SLUG}`), "draft slug appeared in sitemap.xml");

  await gotoReady(page, `${ORIGIN}/admin/draft/${SLUG}`);
  await page.getByText("後台預覽瀏覽器框").waitFor({ timeout: 20000 });
  assert((await page.content()).includes(MARKER), "admin draft preview missing the saved marker");
  await page.screenshot({ path: resolve(SHOTS, "admin-live-preview.png"), fullPage: true });

  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  await page.getByText(SLUG, { exact: true }).first().click();
  await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "發布", exact: true }).click();
  await page.getByText("發布成功").first().waitFor({ timeout: 20000 });

  await gotoReady(page, `${ORIGIN}/work/${SLUG}`);
  await page.getByRole("heading", { name: TITLE }).waitFor({ timeout: 20000 });
  assert((await page.content()).includes(MARKER), "published public page missing the saved marker");
  await page.screenshot({ path: resolve(SHOTS, "public-published.png"), fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: TITLE }).waitFor({ timeout: 20000 });
  assert((await page.content()).includes(MARKER), "reload dropped the published page");
  await page.screenshot({ path: resolve(SHOTS, "public-published-reload.png"), fullPage: true });

  const liveSitemap = await (await request.get(`${ORIGIN}/sitemap.xml`)).text();
  assert(liveSitemap.includes(`/work/${SLUG}`), "published slug missing from sitemap.xml");

  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  await page.getByText(SLUG, { exact: true }).first().click();
  await page.getByRole("button", { name: "取消發布", exact: true }).click();
  await page.getByText("取消發布成功").first().waitFor({ timeout: 20000 });
  await gotoReady(page, `${ORIGIN}/work/${SLUG}`);
  assert(!(await page.content()).includes(MARKER), "unpublish left the marker on the public page");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoReady(page, `${ORIGIN}/work/framelab`);
  await page.getByRole("tablist", { name: "作品體驗" }).waitFor({ timeout: 20000 });
  const play = page.getByRole("tab", { name: "立即體驗" });
  await play.focus();
  await page.keyboard.press("ArrowRight");
  const visual = page.getByRole("tab", { name: "視覺展示" });
  assert((await visual.getAttribute("aria-selected")) === "true", "ArrowRight did not move ExperiencePanel tabs");
  await page.keyboard.press("ArrowRight");
  const github = page.getByRole("tab", { name: "GitHub 專案" });
  assert((await github.getAttribute("aria-selected")) === "true", "ArrowRight did not reach the GitHub tab");
  const tree = page.getByRole("tree").first();
  await tree.waitFor({ timeout: 10000 });
  const treeItem = page.getByRole("treeitem").first();
  await treeItem.focus();
  const folder = page.locator('[role="treeitem"][aria-expanded]').first();
  if (await folder.count()) {
    await folder.focus();
    await page.keyboard.press("ArrowRight");
    assert((await folder.getAttribute("aria-expanded")) === "true", "ArrowRight did not expand a file-tree folder");
    await page.keyboard.press("ArrowLeft");
    assert((await folder.getAttribute("aria-expanded")) === "false", "ArrowLeft did not collapse a file-tree folder");
  } else {
    await page.keyboard.press("Enter");
    await page.getByText("流程階段").waitFor({ timeout: 5000 });
  }
  await gotoReady(page, `${ORIGIN}/`);
  const orbitDuration = await page.locator(".orbit").first().evaluate((el) => getComputedStyle(el).animationDuration);
  assert(
    orbitDuration === "0s" || orbitDuration === "0.01ms" || Number.parseFloat(orbitDuration) < 0.05,
    `reduced-motion left orbit animation at ${orbitDuration}`,
  );
  await page.screenshot({ path: resolve(SHOTS, "experience-keyboard-reduced-motion.png"), fullPage: true });
  console.log("ok - live /admin draft → preview → publish → public → reload → unpublish");
  console.log("ok - ExperiencePanel keyboard + prefers-reduced-motion");
}

try {
  console.log(`using PGLITE_DATA_DIR=${process.env.PGLITE_DATA_DIR || DEFAULT_PGLITE_DATA_DIR}`);
  console.log(`session cookie ${SESSION_TOKEN_COOKIE}; live HTTP uses ${BEARER_STORAGE_KEY} bearer`);
  await stopDev8080();
  await new Promise((r) => setTimeout(r, 400));
  let mintedError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await runNode(resolve(root, "scripts/mint-admin-session.mjs"));
      mintedError = undefined;
      break;
    } catch (err) {
      mintedError = err;
      console.warn(`mint attempt ${attempt} failed; retrying after PGLite lock release`);
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  if (mintedError) throw mintedError;
  const session = readAdminSessionFile();
  if (session.email !== ADMIN_EMAIL) throw new Error("minted session email mismatch");
  if (session.userId === "dev-user") throw new Error("minted session was dev-user");
  await startDev();

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  try {
    await attachSession(context, page, session);
    await proveLiveAdmin(page, context.request);
  } catch (err) {
    await dumpFailure(page, "admin-live-error.png");
    throw err;
  } finally {
    await browser.close();
  }
  console.log(`admin live preview E2E: ok (${ADMIN_SESSION_FILE} is gitignored)`);
} catch (err) {
  await restoreDev();
  throw err;
}

#!/usr/bin/env node
/**
 * Live preview admin E2E: shared PGLite file + real session cookie + real /admin UI.
 * Mint is a sibling script, never a src/routes endpoint.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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
const MARKER = `LIVE-E2E ${new Date().toISOString()} 中文敘事保留`;
const SHOTS = resolve(root, "screenshots");
/** Existing embed-test fixture. Live E2E only — never seeded onto the eight featured works. */
const CANVA_FIXTURE_SHARE_URL = "https://www.canva.com/design/DAGfixtureEmbedShape/view?utm_source=share";
const CANVA_FIXTURE_EMBED_URL = "https://www.canva.com/design/DAGfixtureEmbedShape/view?embed";
const CANVA_FIXTURE_DESIGN_ID = "DAGfixtureEmbedShape";
const FEATURED_SLUGS = [
  "ai-director-os",
  "framelab",
  "poster-vision-ai",
  "planform",
  "duigao",
  "folio",
  "hermes-console",
  "tku-zen-ai",
];

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
  if (!existsSync("/workspace/startup.sh")) {
    await waitForOrigin(`${ORIGIN}/`, 3000).catch(() => {});
    return;
  }
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
  await page.getByText("作品列載入中。").waitFor({ state: "detached", timeout: 20000 }).catch(() => {});
  const edit = page.locator('a[href*="/admin/projects/"][href*="/edit"]');
  const empty = page.getByText("目前沒有作品。");
  try {
    await Promise.race([
      edit.first().waitFor({ timeout: 20000 }),
      empty.waitFor({ timeout: 20000 }),
    ]);
  } catch {
    throw new Error("admin project list did not finish loading");
  }
}

async function openExistingWork(page) {
  const existing = page.getByText(SLUG, { exact: true });
  if (!(await existing.count())) return false;
  await existing.first().click();
  await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });
  return true;
}

async function openOrCreateWork(page) {
  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  if (await openExistingWork(page)) return;
  await page.getByRole("link", { name: "新增", exact: true }).click();
  await page.getByRole("heading", { name: "新增作品" }).waitFor({ timeout: 15000 });
  await page.getByLabel("標題", { exact: true }).fill(TITLE);
  await page.getByLabel("slug", { exact: true }).fill(SLUG);
  await page.getByRole("button", { name: "建立草稿" }).click();
  try {
    await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });
  } catch (err) {
    await gotoReady(page, `${ORIGIN}/admin/projects`);
    await waitForProjectList(page);
    if (await openExistingWork(page)) return;
    throw err;
  }
}

async function gotoReady(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
}

/** Vite never reaches networkidle; wait until leftover SSR shells are gone. */
async function selectExperienceTab(page, name) {
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.luminousHydrated === "1" &&
      document.querySelectorAll("[data-experience-tabs]").length === 1,
    null,
    { timeout: 20000 },
  );
  const list = page.locator("[data-experience-tabs]");
  await list.waitFor({ timeout: 20000 });
  const tab = list.getByRole("tab", { name });
  await tab.waitFor({ timeout: 15000 });
  const deadline = Date.now() + 15000;
  let last = "not clicked";
  while (Date.now() < deadline) {
    try {
      await tab.click({ timeout: 2000 });
    } catch (err) {
      last = err instanceof Error ? err.message : "click failed";
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }
    if ((await tab.getAttribute("aria-selected")) === "true") return;
    last = "click did not select";
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`experience tab ${String(name)} did not select (${last})`);
}

/**
 * Playwright fill can write the DOM before React's tracker sees a change.
 * Wait until the controlled empty-state copy is gone so the test click sends the fixture.
 */
async function pasteCanvaShareAndTest(page) {
  const share = page.getByLabel(/Canva 分享/);
  await share.waitFor({ timeout: 15000 });
  const deadline = Date.now() + 30000;
  let last = "";
  while (Date.now() < deadline) {
    await share.click();
    await share.evaluate((el, value) => {
      const input = el instanceof HTMLInputElement ? el : el.querySelector?.("input");
      if (!(input instanceof HTMLInputElement)) throw new Error("Canva share input missing");
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      input._valueTracker?.setValue("");
      proto?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, CANVA_FIXTURE_SHARE_URL);
    const pasted = await share.inputValue();
    if (!pasted.includes(CANVA_FIXTURE_DESIGN_ID)) {
      last = `share field ${pasted}`;
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }
    await page.getByText("目前沒有 Canva 分享連結").waitFor({ state: "detached", timeout: 8000 }).catch(() => {});
    await page.getByRole("button", { name: "測試 Canva 嵌入" }).click();
    try {
      await page
        .getByText(/Canva 測試完成：可嵌入，未驗證 Connect|Canva 短網址或分享網址已解析/)
        .first()
        .waitFor({ timeout: 8000 });
      return;
    } catch {
      last = (await page.locator("body").innerText()).slice(0, 800);
      if (/只接受 Canva 允許網域/.test(last)) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      throw new Error(`Canva embed test did not complete. Body excerpt: ${last}`);
    }
  }
  throw new Error(`Canva share paste did not reach embed test (${last})`);
}

async function proveIntegrationsDesk(page) {
  await gotoReady(page, `${ORIGIN}/admin/integrations`);
  await page.getByRole("heading", { name: "已發布作品" }).waitFor({ timeout: 20000 });
  await page.getByText("整合列載入中。").waitFor({ state: "detached", timeout: 20000 }).catch(() => {});
  const card = page.locator("form").filter({ has: page.getByRole("heading", { name: TITLE, exact: true }) });
  await card.first().waitFor({ timeout: 20000 });
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  assert(!overflow, "integrations desks overflow at 390");
  const shortTargets = await card.locator("button, a, input, select").evaluateAll((els) =>
    els
      .map((el) => ({
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 40),
        h: Math.round(el.getBoundingClientRect().height),
      }))
      .filter((item) => item.h > 0 && item.h < 44),
  );
  assert(
    shortTargets.length === 0,
    `integrations desk targets shorter than 44px: ${JSON.stringify(shortTargets)}`,
  );
  const canva = card.getByLabel("分享網址");
  await canva.fill("https://example.invalid/not-saved");
  await page.getByText("有未儲存的修改。").first().waitFor({ timeout: 8000 });
  await canva.fill("");
  await card.getByRole("button", { name: "儲存這件作品" }).click();
  await page.getByText("已儲存整合").first().waitFor({ timeout: 20000 });
  await page.setViewportSize({ width: 1280, height: 800 });
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: resolve(SHOTS, "admin-live-integrations.png"), fullPage: true });

  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  await page.getByText(SLUG, { exact: true }).first().click();
  await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });
  const summary = page
    .locator("fieldset")
    .filter({ has: page.locator("legend", { hasText: /^敘事$/ }) })
    .locator("textarea")
    .first();
  const kept = await summary.inputValue();
  assert(kept.includes("LIVE-E2E"), `integrations empty Canva save dropped the live marker (got ${kept})`);
  assert(kept.includes("中文敘事保留"), `integrations empty Canva save dropped Chinese (got ${kept})`);
  console.log("ok - /admin/integrations desk: no overflow, 44px, unsaved warning, empty Canva keeps Chinese");
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
  const summary = page
    .locator("fieldset")
    .filter({ has: page.locator("legend", { hasText: /^敘事$/ }) })
    .locator("textarea")
    .first();
  await summary.click();
  await summary.fill(MARKER);
  await summary.evaluate((el, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, MARKER);
  const typed = await summary.inputValue();
  assert(typed.includes("LIVE-E2E"), `summary field did not keep the live marker (got ${typed})`);
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
  await page.getByText(/LIVE-E2E/).waitFor({ timeout: 15000 });
  const previewText = await page.locator("body").innerText();
  assert(
    previewText.includes(typed) || previewText.includes(MARKER) || previewText.includes("LIVE-E2E"),
    `admin draft preview missing the saved marker (${MARKER})`,
  );
  await page.screenshot({ path: resolve(SHOTS, "admin-live-preview.png"), fullPage: true });

  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  await page.getByText(SLUG, { exact: true }).first().click();
  await page.getByRole("button", { name: "存成草稿" }).waitFor({ timeout: 20000 });

  await pasteCanvaShareAndTest(page);
  const afterTest = await page.locator("body").innerText();
  assert(/狀態 pending/.test(afterTest), "Canva embed test did not stay pending after a valid /design/{id} paste");
  assert(!/狀態 verified/.test(afterTest), "Canva embed test marked verified from URL shape");
  assert(!/狀態 connected/.test(afterTest), "Canva embed test claimed Connect connected");
  await page.screenshot({ path: resolve(SHOTS, "admin-live-canva-test.png"), fullPage: true });
  await page.getByRole("button", { name: "存成草稿" }).click();
  await page.getByText("存成草稿成功").first().waitFor({ timeout: 20000 });

  await page.getByRole("button", { name: "發布", exact: true }).click();
  await page.getByText("發布成功").first().waitFor({ timeout: 20000 });

  await gotoReady(page, `${ORIGIN}/work/${SLUG}`);
  await page.getByRole("heading", { name: TITLE, level: 1 }).waitFor({ timeout: 20000 });
  await page.getByText(/LIVE-E2E/).waitFor({ timeout: 10000 });
  assert(
    (await page.locator("body").innerText()).includes("LIVE-E2E"),
    "published public page missing the saved marker",
  );
  await page.screenshot({ path: resolve(SHOTS, "public-published.png"), fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: TITLE, level: 1 }).waitFor({ timeout: 20000 });
  assert(
    (await page.locator("body").innerText()).includes("LIVE-E2E"),
    "reload dropped the published page",
  );
  await page.screenshot({ path: resolve(SHOTS, "public-published-reload.png"), fullPage: true });

  const liveSitemap = await (await request.get(`${ORIGIN}/sitemap.xml`)).text();
  assert(liveSitemap.includes(`/work/${SLUG}`), "published slug missing from sitemap.xml");

  await selectExperienceTab(page, /Canva/);
  const canvaHtml = await (await request.get(`${ORIGIN}/work/${SLUG}`)).text();
  const iframeSrcs = [...canvaHtml.matchAll(/<iframe[^>]+src="([^"]+)"/gi)].map((row) => row[1]);
  const canvaIframes = iframeSrcs.filter((src) =>
    /^https:\/\/www\.canva\.com\/design\/[A-Za-z0-9_-]+\/view\?embed/.test(src),
  );
  const iframe = page.locator(`iframe[src*="canva.com/design/${CANVA_FIXTURE_DESIGN_ID}"]`);
  const fallbackCopy = page.getByText(/不會嵌入空白 iframe|Canva 嵌入無法顯示|Canva 原作目前無法公開嵌入/);
  try {
    await Promise.race([
      iframe.first().waitFor({ timeout: 12000 }),
      fallbackCopy.first().waitFor({ timeout: 12000 }),
    ]);
  } catch {
    throw new Error("Canva tab showed neither an allowlisted iframe nor an honest fallback");
  }
  const panel = await page.locator('[role="tabpanel"]').innerText();
  const honestFallback = (await fallbackCopy.count()) > 0;
  let liveCanva = "unreachable";
  try {
    const probe = await fetch(CANVA_FIXTURE_EMBED_URL, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    liveCanva = String(probe.status);
  } catch (err) {
    liveCanva = err instanceof Error ? err.name : "error";
  }
  assert(
    canvaIframes.length > 0 || honestFallback || (await iframe.count()) > 0,
    `published test work has neither an allowlisted Canva iframe nor an honest fallback (live HTTP ${liveCanva})`,
  );
  for (const src of canvaIframes) {
    assert(
      src.includes(CANVA_FIXTURE_DESIGN_ID) && src.startsWith("https://www.canva.com/design/"),
      `public Canva iframe src is not the fixture allowlist: ${src}`,
    );
  }
  assert(!/狀態 verified/.test(panel), "public Canva tab marked verified from paste syntax");
  assert(panel.includes("未宣稱 Connect 已連線"), "public Canva tab missing fail-closed Connect copy");
  await page.screenshot({ path: resolve(SHOTS, "public-canva-paste.png"), fullPage: true });
  console.log(
    `ok - Canva paste on ${SLUG}: parse=ok status=pending liveHttp=${liveCanva} public=${canvaIframes.length || (await iframe.count()) ? "iframe" : "fallback"}`,
  );

  await gotoReady(page, `${ORIGIN}/admin/projects`);
  await waitForProjectList(page);
  await page.getByText(SLUG, { exact: true }).first().click();
  await page.getByRole("button", { name: "取消發布", exact: true }).click();
  await page.getByText("取消發布成功").first().waitFor({ timeout: 20000 });
  await gotoReady(page, `${ORIGIN}/work/${SLUG}`);
  assert(!(await page.content()).includes(MARKER), "unpublish left the marker on the public page");
  const unpublishedSitemap = await (await request.get(`${ORIGIN}/sitemap.xml`)).text();
  assert(!unpublishedSitemap.includes(`/work/${SLUG}`), "unpublished test slug remained in sitemap.xml");
  const unpublishedWorkList = await (await request.get(`${ORIGIN}/work`)).text();
  assert(!unpublishedWorkList.includes(SLUG), "unpublished test slug remained in the public work list");
  for (const featured of FEATURED_SLUGS) {
    const html = await (await request.get(`${ORIGIN}/work/${featured}`)).text();
    assert(
      !html.includes(CANVA_FIXTURE_DESIGN_ID),
      `fixture Canva design leaked onto featured work ${featured}`,
    );
  }

  await proveIntegrationsDesk(page);

  const a11y = await page.context().newPage();
  try {
    await a11y.goto(`${ORIGIN}/work/framelab`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await selectExperienceTab(a11y, /視覺展示/);
    await selectExperienceTab(a11y, /立即體驗/);
    const play = a11y.locator("[data-experience-tabs]").getByRole("tab", { name: "立即體驗" });
    await play.focus();
    await a11y.keyboard.press("ArrowRight");
    const visual = a11y.getByRole("tab", { name: "視覺展示" });
    await a11y.waitForFunction(
      () =>
        [...document.querySelectorAll('[role="tab"]')].some(
          (el) => el.getAttribute("aria-selected") === "true" && (el.textContent ?? "").includes("視覺展示"),
        ),
      null,
      { timeout: 8000 },
    );
    assert((await visual.getAttribute("aria-selected")) === "true", "ArrowRight did not move ExperiencePanel tabs");
    await a11y.keyboard.press("ArrowRight");
    const github = a11y.getByRole("tab", { name: "GitHub 專案" });
    await a11y.waitForFunction(
      () =>
        [...document.querySelectorAll('[role="tab"]')].some(
          (el) => el.getAttribute("aria-selected") === "true" && (el.textContent ?? "").includes("GitHub"),
        ),
      null,
      { timeout: 8000 },
    );
    assert((await github.getAttribute("aria-selected")) === "true", "ArrowRight did not reach the GitHub tab");
    const tree = a11y.getByRole("tree").first();
    await tree.waitFor({ timeout: 10000 });
    const folder = a11y.locator('[role="treeitem"][aria-expanded]').first();
    if (await folder.count()) {
      await folder.focus();
      await a11y.keyboard.press("ArrowRight");
      assert((await folder.getAttribute("aria-expanded")) === "true", "ArrowRight did not expand a file-tree folder");
      await a11y.keyboard.press("ArrowLeft");
      assert((await folder.getAttribute("aria-expanded")) === "false", "ArrowLeft did not collapse a file-tree folder");
    } else {
      await a11y.getByRole("treeitem").first().focus();
      await a11y.keyboard.press("Enter");
      await a11y.getByText("流程階段").waitFor({ timeout: 5000 });
    }
    await a11y.emulateMedia({ reducedMotion: "reduce" });
    await a11y.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const orbitDuration = await a11y.locator(".orbit").first().evaluate((el) => getComputedStyle(el).animationDuration);
    assert(
      orbitDuration === "0s" || orbitDuration === "0.01ms" || Number.parseFloat(orbitDuration) < 0.05,
      `reduced-motion left orbit animation at ${orbitDuration}`,
    );
    await a11y.screenshot({ path: resolve(SHOTS, "experience-keyboard-reduced-motion.png"), fullPage: true });
  } finally {
    await a11y.close();
  }
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

  if (!existsSync("/workspace/startup.sh")) {
    let hasDev = false;
    try {
      const res = await fetch(`${ORIGIN}/`, { signal: AbortSignal.timeout(1000) });
      if (res.status > 0) hasDev = true;
    } catch {}
    if (!hasDev) {
      console.log("ok - 非容器環境且未運行本地 :8080，略過 live admin E2E");
      process.exit(0);
    }
  }

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

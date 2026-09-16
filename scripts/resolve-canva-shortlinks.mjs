#!/usr/bin/env node
/**
 * Viewer-like Canva short-link probe.
 * Opens each /d/ URL in Chromium and records page.url() after redirects.
 * Never scrapes HTML for design ids.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "screenshots");
mkdirSync(outDir, { recursive: true });

const CHROME_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const SHORTS = [
  "https://www.canva.com/d/ysK5sYZisVEjZFe",
  "https://www.canva.com/d/WJgjSP967WEuhhN",
  "https://www.canva.com/d/g4tColMMj63-XRu",
  "https://www.canva.com/d/kFV4KQpB2QzPjb0",
];

function classifyUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { class: "invalid", designId: null, host: null, path: null };
  }
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;
  const design = path.match(/\/design\/([A-Za-z0-9_-]{6,})(?:\/(?:view|edit|watch|present|embed))?\/?/);
  if (design && (host === "www.canva.com" || host === "canva.com")) {
    return {
      class: parsed.searchParams.has("embed") || /\/embed\/?$/.test(path) ? "official-embed" : "design",
      designId: design[1],
      host,
      path,
    };
  }
  if (/^\/d\/[A-Za-z0-9_-]{6,}/.test(path.replace(/\/$/, ""))) {
    return { class: "short-link", designId: null, host, path };
  }
  const lower = path.toLowerCase();
  if (
    lower === "/login" ||
    lower.startsWith("/login/") ||
    lower.startsWith("/signup") ||
    lower.includes("/_login") ||
    lower.startsWith("/oidc") ||
    lower.startsWith("/account/login")
  ) {
    return { class: "login-wall", designId: null, host, path };
  }
  if (host.includes("cloudflare") || path.toLowerCase().includes("cdn-cgi") || path.toLowerCase().includes("challenge")) {
    return { class: "cloudflare-challenge", designId: null, host, path };
  }
  return { class: "non-design", designId: null, host, path };
}

function titleClass(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("just a moment") || t.includes("attention required") || t.includes("cloudflare") || t.includes("verifying")) {
    return "cloudflare-challenge";
  }
  if (t.includes("log in") || t.includes("sign up") || t.includes("sign in")) return "login-wall";
  if (t.includes("roadblock") || t.includes("doesn't work") || t.includes("page not found") || /\b404\b/.test(t)) {
    return "not-found";
  }
  return null;
}

async function fetchHop(url, userAgent) {
  const hops = [];
  let current = url;
  for (let i = 0; i < 6; i += 1) {
    let response;
    try {
      response = await fetch(current, {
        method: i === 0 ? "HEAD" : "GET",
        redirect: "manual",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": userAgent,
        },
        signal: AbortSignal.timeout(12000),
      });
    } catch (err) {
      hops.push({ url: current, error: err instanceof Error ? err.name : "fetch-error" });
      break;
    }
    const location = response.headers.get("location");
    hops.push({
      url: current,
      status: response.status,
      location: location ? "[present]" : null,
      locationClass: location ? classifyUrl(new URL(location, current).toString()).class : null,
    });
    if (location && response.status >= 300 && response.status < 400) {
      current = new URL(location, current).toString();
      continue;
    }
    if (response.status === 405 && i === 0) continue;
    break;
  }
  return hops;
}

async function probePlaywright(page, url, index) {
  const started = Date.now();
  let navError = null;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(2500);
  } catch (err) {
    navError = err instanceof Error ? err.message.slice(0, 180) : "navigation-error";
  }
  const finalUrl = page.url();
  const title = await page.title().catch(() => "");
  const classified = classifyUrl(finalUrl);
  const fromTitle = titleClass(title);
  const urlClass = fromTitle && classified.class === "short-link" ? fromTitle : classified.class;
  const shot = resolve(outDir, `canva-nav-${index + 1}.png`);
  await page.screenshot({ path: shot, fullPage: false }).catch(() => null);
  return {
    startUrl: url,
    finalUrl,
    urlClass,
    designId: classified.designId,
    host: classified.host,
    path: classified.path,
    titleClass: fromTitle,
    titleKind: fromTitle ?? (title ? "present" : "empty"),
    navError,
    elapsedMs: Date.now() - started,
    screenshot: shot.replace(root, ""),
  };
}

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  userAgent: CHROME_UA,
  locale: "en-US",
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();

const results = [];
try {
  for (let i = 0; i < SHORTS.length; i += 1) {
    const url = SHORTS[i];
    const fetchStudio = await fetchHop(url, "LuminousStudio-CanvaResolver/1.0");
    const fetchChrome = await fetchHop(url, CHROME_UA);
    const playwright = await probePlaywright(page, url, i);
    results.push({
      shortUrl: url,
      fetchStudioFinalClass: fetchStudio.at(-1)?.locationClass ?? classifyUrl(fetchStudio.at(-1)?.url ?? url).class,
      fetchStudio: fetchStudio.map(({ url: hopUrl, status, location, locationClass, error }) => ({
        urlClass: classifyUrl(hopUrl).class,
        status,
        location,
        locationClass,
        error,
      })),
      fetchChromeFinalClass: fetchChrome.at(-1)?.locationClass ?? classifyUrl(fetchChrome.at(-1)?.url ?? url).class,
      fetchChrome: fetchChrome.map(({ url: hopUrl, status, location, locationClass, error }) => ({
        urlClass: classifyUrl(hopUrl).class,
        status,
        location,
        locationClass,
        error,
      })),
      playwright,
    });
  }
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  method: "playwright page.url() after load; fetch Location headers only; HTML unread",
  results,
};
writeFileSync(resolve(outDir, "canva-nav-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

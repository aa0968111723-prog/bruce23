import {
  classifyCanvaPageOutcome,
  extractCanvaUrl,
  isAllowedCanvaUrl,
  isCanvaLoginUrl,
  isCanvaRedirectHost,
  isCanvaShortLink,
  parseCanvaDesign,
  type CanvaNavigationClass,
} from "./parse.ts";

export type CanvaResolveResult =
  | {
      status: "pending";
      parsed: true;
      liveProbe: boolean;
      shareUrl: string;
      embedUrl: string;
      designId: string;
      error: string;
    }
  | {
      status: "unavailable";
      parsed: false;
      liveProbe: true;
      shareUrl: string | null;
      embedUrl: null;
      designId: null;
      error: string;
    }
  | {
      status: "failed";
      parsed: false;
      liveProbe: boolean;
      shareUrl: string | null;
      embedUrl: null;
      designId: null;
      error: string;
    };

export type CanvaNavigateLanding = {
  url: string;
  title?: string | null;
};

export type CanvaResolveOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxHops?: number;
  /** Viewer-like navigation. Return page.url() (and optional page.title()). HTML unread. */
  navigateImpl?: (url: string) => Promise<CanvaNavigateLanding>;
};

const STUDIO_UA = "LuminousStudio-CanvaResolver/1.0";
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const PERMISSION_COPY =
  "這個 Canva 短網址沒有公開分享權限，或轉址停在登入／封鎖頁。不會嵌入空白 iframe，也不會標成已驗證。";
const CHALLENGE_COPY =
  "這個 Canva 短網址停在 Cloudflare 驗證頁，沒有轉到 /design/{id}。不會嵌入空白 iframe，也不會標成已驗證。";
const NOTFOUND_COPY =
  "這個 Canva 短網址在瀏覽器裡是失效連結（沒有轉到 /design/{id}）。不會嵌入空白 iframe，也不會標成已驗證。";
const SHORT_STUCK_COPY =
  "瀏覽器跟隨後仍停在 /d/ 短網址，不是 canva.com/design/{id}。不會嵌入空白 iframe，也不會標成已驗證。";

function redirectResult(
  parsed: NonNullable<ReturnType<typeof parseCanvaDesign>>,
  liveProbe: boolean,
): CanvaResolveResult {
  return {
    status: "pending",
    parsed: true,
    liveProbe,
    shareUrl: parsed.shareUrl,
    embedUrl: parsed.embedUrl,
    designId: parsed.designId,
    error: liveProbe
      ? "短網址已在伺服器跟隨 Canva 轉址，得到 /design/{id}。沒有把 HTML 當來源，不會標成已驗證。"
      : "語法通過 Canva 允許清單。沒有對該設計做公開嵌入探測，不會標成已驗證。",
  };
}

function unavailable(shareUrl: string | null, error: string): CanvaResolveResult {
  return {
    status: "unavailable",
    parsed: false,
    liveProbe: true,
    shareUrl,
    embedUrl: null,
    designId: null,
    error,
  };
}

function failed(shareUrl: string | null, liveProbe: boolean, error: string): CanvaResolveResult {
  return {
    status: "failed",
    parsed: false,
    liveProbe,
    shareUrl,
    embedUrl: null,
    designId: null,
    error,
  };
}

function locationOf(response: Response): string | null {
  return response.headers.get("location") || response.headers.get("Location");
}

function errorForClass(urlClass: CanvaNavigationClass): string {
  if (urlClass === "cloudflare-challenge") return CHALLENGE_COPY;
  if (urlClass === "not-found") return NOTFOUND_COPY;
  if (urlClass === "login-wall") return PERMISSION_COPY;
  if (urlClass === "short-link" || urlClass === "non-design") return SHORT_STUCK_COPY;
  return PERMISSION_COPY;
}

function isHardFail(result: CanvaResolveResult): boolean {
  return result.status === "failed";
}

async function followLocations(
  start: string,
  options: { fetchImpl: typeof fetch; timeoutMs: number; maxHops: number; userAgent: string },
): Promise<CanvaResolveResult> {
  const { fetchImpl, timeoutMs, maxHops, userAgent } = options;
  let current = start;
  let usedGet = false;

  for (let hop = 0; hop < maxHops; hop += 1) {
    const parsedHere = parseCanvaDesign(current);
    if (parsedHere) return redirectResult(parsedHere, true);
    if (isCanvaLoginUrl(current)) {
      return unavailable(start, PERMISSION_COPY);
    }

    const method = usedGet ? "GET" : "HEAD";
    let response: Response;
    try {
      response = await fetchImpl(current, {
        method,
        redirect: "manual",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": userAgent,
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const aborted = err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
      return unavailable(start, aborted ? "跟隨 Canva 短網址逾時，沒有寫入設計 id。" : PERMISSION_COPY);
    }

    if (response.status === 401 || response.status === 403 || response.status === 404) {
      if (!usedGet && response.status !== 401) {
        usedGet = true;
        continue;
      }
      return unavailable(
        start,
        response.status === 404 ? NOTFOUND_COPY : PERMISSION_COPY,
      );
    }

    const location = locationOf(response);
    if (location && response.status >= 300 && response.status < 400) {
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        return failed(start, true, "Canva 轉址網址無效，沒有寫入設計 id。");
      }
      if (next.protocol !== "https:" || !isCanvaRedirectHost(next.hostname)) {
        return failed(start, true, "拒絕開到非 canva.com 的轉址，沒有寫入設計 id。");
      }
      current = next.toString();
      if (isCanvaLoginUrl(current)) return unavailable(start, PERMISSION_COPY);
      const landed = parseCanvaDesign(current);
      if (landed) return redirectResult(landed, true);
      continue;
    }

    if (!usedGet && (response.status === 200 || response.status === 405 || response.status === 501)) {
      usedGet = true;
      continue;
    }

    // Final URL with no further Location. HTML body is intentionally unread.
    const finalParsed = parseCanvaDesign(response.url || current);
    if (finalParsed) return redirectResult(finalParsed, true);
    return unavailable(start, PERMISSION_COPY);
  }

  return unavailable(start, "Canva 短網址轉址次數過多，沒有寫入設計 id。");
}

/**
 * Server-side only. Follows Canva short links via Location headers, then optional
 * viewer navigation (page.url()). Never treats response HTML as the source of a design id.
 */
export async function resolveCanvaShareUrl(
  raw: string,
  options: CanvaResolveOptions = {},
): Promise<CanvaResolveResult> {
  const extracted = extractCanvaUrl(raw);
  if (!extracted || !isAllowedCanvaUrl(extracted)) {
    return failed(null, false, "只接受 Canva 允許網域的分享／嵌入網址，不會執行後台貼上的 HTML。");
  }

  const already = parseCanvaDesign(extracted);
  if (already) return redirectResult(already, false);

  if (!isCanvaShortLink(extracted)) {
    return failed(
      extracted,
      false,
      "網域通過允許清單，但不是 /design/{id} 分享或嵌入網址，也不是可解析的 /d/ 短網址。",
    );
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;
  const maxHops = options.maxHops ?? 6;
  const followOpts = { fetchImpl, timeoutMs, maxHops };

  const studio = await followLocations(extracted, { ...followOpts, userAgent: STUDIO_UA });
  if (studio.status === "pending") return studio;
  if (isHardFail(studio)) return studio;

  const chrome = await followLocations(extracted, { ...followOpts, userAgent: BROWSER_UA });
  if (chrome.status === "pending") return chrome;
  if (isHardFail(chrome)) return chrome;

  if (options.navigateImpl) {
    try {
      const landed = await options.navigateImpl(extracted);
      const parsed = parseCanvaDesign(landed.url);
      if (parsed) return redirectResult(parsed, true);
      if (isCanvaLoginUrl(landed.url)) return unavailable(extracted, PERMISSION_COPY);
      const urlClass = classifyCanvaPageOutcome(landed);
      return unavailable(extracted, errorForClass(urlClass));
    } catch {
      return chrome;
    }
  }

  return chrome;
}

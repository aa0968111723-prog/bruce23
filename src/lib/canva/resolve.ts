import {
  extractCanvaUrl,
  isAllowedCanvaUrl,
  isCanvaLoginUrl,
  isCanvaRedirectHost,
  isCanvaShortLink,
  parseCanvaDesign,
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

export type CanvaResolveOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxHops?: number;
};

const PERMISSION_COPY =
  "這個 Canva 短網址沒有公開分享權限，或轉址停在登入／封鎖頁。不會嵌入空白 iframe，也不會標成已驗證。";

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

/**
 * Server-side only. Follows Canva short links via Location headers.
 * Never treats response HTML as the source of a design id.
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
  let current = extracted;
  let usedGet = false;

  for (let hop = 0; hop < maxHops; hop += 1) {
    const parsedHere = parseCanvaDesign(current);
    if (parsedHere) return redirectResult(parsedHere, true);
    if (isCanvaLoginUrl(current)) {
      return unavailable(extracted, PERMISSION_COPY);
    }

    const method = usedGet ? "GET" : "HEAD";
    let response: Response;
    try {
      response = await fetchImpl(current, {
        method,
        redirect: "manual",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "LuminousStudio-CanvaResolver/1.0",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const aborted = err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
      return unavailable(extracted, aborted ? "跟隨 Canva 短網址逾時，沒有寫入設計 id。" : PERMISSION_COPY);
    }

    if (response.status === 401 || response.status === 403 || response.status === 404) {
      if (!usedGet && response.status !== 401) {
        usedGet = true;
        continue;
      }
      return unavailable(extracted, PERMISSION_COPY);
    }

    const location = locationOf(response);
    if (location && response.status >= 300 && response.status < 400) {
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        return failed(extracted, true, "Canva 轉址網址無效，沒有寫入設計 id。");
      }
      if (next.protocol !== "https:" || !isCanvaRedirectHost(next.hostname)) {
        return failed(extracted, true, "拒絕開到非 canva.com 的轉址，沒有寫入設計 id。");
      }
      current = next.toString();
      if (isCanvaLoginUrl(current)) return unavailable(extracted, PERMISSION_COPY);
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
    return unavailable(extracted, PERMISSION_COPY);
  }

  return unavailable(extracted, "Canva 短網址轉址次數過多，沒有寫入設計 id。");
}

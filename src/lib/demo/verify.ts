import { isBlockedPrivateHost, isSafeHttpUrl } from "../safe-href.ts";

export type DemoVerifyResult = {
  status: "verified" | "unavailable" | "failed" | "not_configured";
  embedEnabled: boolean;
  error?: string;
  contentType?: string;
  httpStatus?: number;
};

const HTML_TYPE = /text\/html|application\/xhtml\+xml/i;
const NON_PAGE_TYPE = /javascript|json|wasm|octet-stream|image\/|video\/|text\/css|text\/plain/i;

export function isHtmlDemoContentType(contentType: string | null | undefined): boolean {
  const type = contentType ?? "";
  if (HTML_TYPE.test(type)) return true;
  if (!type.trim()) return false;
  return !NON_PAGE_TYPE.test(type);
}

export function framingBlocked(xFrameOptions: string | null, contentSecurityPolicy: string | null): boolean {
  const xfo = xFrameOptions ?? "";
  if (/deny|sameorigin/i.test(xfo)) return true;
  const csp = contentSecurityPolicy ?? "";
  const ancestors = csp.match(/frame-ancestors\s+([^;]+)/i);
  if (!ancestors) return false;
  const tokens = ancestors[1]
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 1 && tokens[0] === "*") return false;
  return true;
}

export async function verifyDemoUrl(
  raw: string | null | undefined,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<DemoVerifyResult> {
  const url = raw?.trim() ?? "";
  if (!url) return { status: "not_configured", embedEnabled: false };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { status: "failed", embedEnabled: false, error: "Demo 網址無效。" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { status: "failed", embedEnabled: false, error: "Demo 只接受 http(s) 網址。" };
  }
  if (isBlockedPrivateHost(parsed.hostname)) {
    return { status: "failed", embedEnabled: false, error: "Demo 不探測內網或本機網址。" };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { "User-Agent": "luminous-studio-portfolio" };
  try {
    let response = await fetchImpl(parsed.toString(), {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers,
    });
    if (response.status === 403 || response.status === 405 || response.status === 501) {
      response = await fetchImpl(parsed.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { ...headers, Range: "bytes=0-0" },
      });
    }
    const contentType = response.headers.get("content-type") ?? undefined;
    if (response.status >= 400) {
      return {
        status: "failed",
        embedEnabled: false,
        error: `Demo 回傳 HTTP ${response.status}。`,
        httpStatus: response.status,
        contentType,
      };
    }
    if (framingBlocked(response.headers.get("x-frame-options"), response.headers.get("content-security-policy"))) {
      return {
        status: "unavailable",
        embedEnabled: false,
        error: "這個網站禁止被嵌入。可以開新分頁，但不能當 Live Demo iframe。",
        httpStatus: response.status,
        contentType,
      };
    }
    if (!isHtmlDemoContentType(contentType)) {
      return {
        status: "failed",
        embedEnabled: false,
        error: "這個網址回傳的不是網頁。可以開新分頁檢查，但不能當 Live Demo iframe。",
        httpStatus: response.status,
        contentType,
      };
    }
    return { status: "verified", embedEnabled: true, httpStatus: response.status, contentType };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      status: "failed",
      embedEnabled: false,
      error: aborted ? "Demo 連線逾時。" : "Demo 連線失敗。",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function isSafeDemoUrl(raw: string | null | undefined): boolean {
  return isSafeHttpUrl(raw);
}

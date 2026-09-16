export type DemoVerifyResult = {
  status: "verified" | "unavailable" | "failed" | "not_configured";
  embedEnabled: boolean;
  error?: string;
  contentType?: string;
  httpStatus?: number;
};

const BLOCKED_FRAME = /deny|sameorigin/i;
const HTML_TYPE = /text\/html|application\/xhtml\+xml/i;
const NON_PAGE_TYPE = /javascript|json|wasm|octet-stream|image\/|video\/|text\/css|text\/plain/i;

export function isHtmlDemoContentType(contentType: string | null | undefined): boolean {
  const type = contentType ?? "";
  if (HTML_TYPE.test(type)) return true;
  if (!type.trim()) return false;
  return !NON_PAGE_TYPE.test(type);
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

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetchImpl(parsed.toString(), {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "luminous-studio-portfolio" },
    });
    if (response.status === 405 || response.status === 501) {
      response = await fetchImpl(parsed.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "luminous-studio-portfolio", Range: "bytes=0-0" },
      });
    }
    const frame = `${response.headers.get("x-frame-options") ?? ""} ${response.headers.get("content-security-policy") ?? ""}`;
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
    if (BLOCKED_FRAME.test(frame) || /frame-ancestors\s+'none'/i.test(frame)) {
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
  if (!raw?.trim()) return false;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export type DemoProbe = {
  url: string;
  ok: boolean;
  status: number | null;
  embeddable: boolean;
  error: string | null;
  checkedAt: string;
};

const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0|\[::1\])/i;

export function assertPublicHttpUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Demo URL 必須是 http(s)");
  }
  if (PRIVATE_HOST_RE.test(url.hostname)) {
    throw new Error("拒絕本機或內網 Demo 位址");
  }
  return url;
}

export async function probeLiveDemo(
  raw: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DemoProbe> {
  const checkedAt = new Date().toISOString();
  let url: URL;
  try {
    url = assertPublicHttpUrl(raw);
  } catch (err) {
    return {
      url: raw,
      ok: false,
      status: null,
      embeddable: false,
      error: err instanceof Error ? err.message : "無效網址",
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    let res = await fetchImpl(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "luminous-studio-portfolio" },
    });
    if (res.status === 405 || res.status === 501) {
      res = await fetchImpl(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "luminous-studio-portfolio", Range: "bytes=0-0" },
      });
    }
    const xfo = (res.headers.get("x-frame-options") ?? "").toLowerCase();
    const csp = res.headers.get("content-security-policy") ?? "";
    const embeddable =
      res.ok &&
      xfo !== "deny" &&
      xfo !== "sameorigin" &&
      !/frame-ancestors\s+('none'|none)/i.test(csp);
    return {
      url: url.toString(),
      ok: res.ok,
      status: res.status,
      embeddable,
      error: res.ok
        ? embeddable
          ? null
          : "目標站拒絕被嵌入（X-Frame-Options / CSP）。仍可開新分頁，不會假裝 iframe 成功。"
        : `HTTP ${res.status}`,
      checkedAt,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      url: url.toString(),
      ok: false,
      status: null,
      embeddable: false,
      error: aborted ? "Demo 連線逾時" : err instanceof Error ? err.message : "Demo 連線失敗",
      checkedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

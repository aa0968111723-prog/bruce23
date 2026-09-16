const CANVA_HOSTS = new Set([
  "canva.com",
  "www.canva.com",
  "canva.cn",
  "www.canva.cn",
]);

export type ParsedCanva = {
  shareUrl: string;
  embedUrl: string;
  designId: string | null;
  editUrl: string | null;
};

function hostnameOf(url: URL): string {
  return url.hostname.toLowerCase();
}

export function isAllowedCanvaHost(host: string): boolean {
  return CANVA_HOSTS.has(host.toLowerCase());
}

export function extractUrlFromEmbedCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https:\/\//i.test(trimmed) && !trimmed.includes("<")) return trimmed;
  const src = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (src?.[1]) return src[1];
  return null;
}

export function parseCanvaInput(
  input: string | null | undefined,
): { ok: true; value: ParsedCanva } | { ok: false; error: string } {
  if (!input || !input.trim()) {
    return { ok: false, error: "Canva URL is empty" };
  }
  const extracted = extractUrlFromEmbedCode(input);
  if (!extracted) {
    return {
      ok: false,
      error: "Paste a Canva share URL, embed URL, or iframe src — HTML is not rendered.",
    };
  }
  let url: URL;
  try {
    url = new URL(extracted);
  } catch {
    return { ok: false, error: "Canva URL is not valid" };
  }
  if (url.protocol !== "https:") {
    return { ok: false, error: "Canva embeds must use https" };
  }
  if (!isAllowedCanvaHost(hostnameOf(url))) {
    return { ok: false, error: "Canva URL host is not on the allowlist" };
  }
  const designMatch = url.pathname.match(/\/design\/([^/]+)/);
  const designId = designMatch?.[1] ?? null;
  const shareUrl = url.toString();
  const embedUrl = shareUrl.includes("embed")
    ? shareUrl
    : designId
      ? `https://${hostnameOf(url)}/design/${designId}/view?embed`
      : shareUrl;
  const editUrl = designId
    ? `https://${hostnameOf(url)}/design/${designId}/edit`
    : null;
  return {
    ok: true,
    value: { shareUrl, embedUrl, designId, editUrl },
  };
}

export function canvaFallbackMessage(status: "failed" | "unavailable" | "not_configured") {
  if (status === "not_configured") {
    return "尚未設定 Canva 原作連結。";
  }
  return "這個設計可能需要權限，或嵌入暫時無法顯示。請改在 Canva 開啟原作。";
}

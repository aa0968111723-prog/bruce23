import { CANVA_ALLOWED_HOSTS } from "./constants";

export type CanvaParseOk = {
  ok: true;
  shareUrl?: string;
  embedUrl: string;
  designId?: string;
  host: string;
};

export type CanvaParseFail = { ok: false; error: string };
export type CanvaParseResult = CanvaParseOk | CanvaParseFail;

export function isCanvaHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (CANVA_ALLOWED_HOSTS.has(host)) return true;
  return host.endsWith(".canva.com");
}

export function parseCanvaUrl(input: string): CanvaParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  if (!/^https:\/\//i.test(trimmed)) {
    return { ok: false, error: "https_required" };
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (!isCanvaHost(url.hostname)) {
    return { ok: false, error: "host_not_allowed" };
  }
  const parts = url.pathname.split("/").filter(Boolean);
  const designIdx = parts.indexOf("design");
  const designId = designIdx >= 0 ? parts[designIdx + 1] : undefined;
  const embedUrl = url.searchParams.get("embed")
    ? url.toString()
    : `${url.origin}${url.pathname}?embed`;
  return {
    ok: true,
    shareUrl: url.toString(),
    embedUrl,
    designId,
    host: url.hostname.toLowerCase(),
  };
}

export function parseCanvaEmbedCode(html: string): CanvaParseResult {
  const srcMatch = html.match(/src=["']([^"']+)["']/i);
  if (!srcMatch) return { ok: false, error: "no_iframe_src" };
  return parseCanvaUrl(srcMatch[1]);
}

export function canvaEmbedState(input: {
  embedUrl?: string | null;
  failed: boolean;
}): "ready" | "fallback" | "not_configured" {
  if (!input.embedUrl) return "not_configured";
  if (input.failed) return "fallback";
  return "ready";
}

export type CanvaConnectMode = "public_embed" | "connect_api";

export function canvaConnectMode(hasCredentials: boolean): CanvaConnectMode {
  return hasCredentials ? "connect_api" : "public_embed";
}

export function hasCanvaCredentials(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.CANVA_CLIENT_ID?.trim() && env.CANVA_CLIENT_SECRET?.trim(),
  );
}

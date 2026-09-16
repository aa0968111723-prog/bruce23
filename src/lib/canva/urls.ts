const CANVA_HOSTS = new Set([
  "canva.com",
  "www.canva.com",
  "www.canva.cn",
  "canva.cn",
]);

export type ParsedCanva = {
  shareUrl: string;
  embedUrl: string;
  designId: string | null;
  host: string;
};

export function isCanvaHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return CANVA_HOSTS.has(host) || host.endsWith(".canva.com");
}

export function parseCanvaShareUrl(
  raw: string | null | undefined,
): ParsedCanva | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!isCanvaHost(url.hostname)) return null;
  const designMatch = /\/design\/([^/]+)\//.exec(url.pathname);
  const designId = designMatch?.[1] ?? null;
  const embedUrl = toCanvaEmbedUrl(url);
  return {
    shareUrl: `https://${url.hostname}${url.pathname}${url.search}`,
    embedUrl,
    designId,
    host: url.hostname,
  };
}

export function toCanvaEmbedUrl(url: URL): string {
  const path = url.pathname.replace(/\/$/, "");
  if (url.searchParams.has("embed")) {
    return `https://${url.hostname}${url.pathname}${url.search}`;
  }
  if (/\/view$/.test(path) || /\/watch$/.test(path)) {
    const next = new URL(`https://${url.hostname}${path}`);
    next.searchParams.set("embed", "");
    return next.toString();
  }
  const next = new URL(`https://${url.hostname}${path}/view`);
  next.searchParams.set("embed", "");
  return next.toString();
}

/** Parse pasted iframe HTML; only allow Canva hosts. Never execute HTML. */
export function parseCanvaEmbedSnippet(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const srcMatch = /src\s*=\s*["']([^"']+)["']/i.exec(trimmed);
  const candidate = srcMatch?.[1] ?? trimmed;
  const parsed = parseCanvaShareUrl(candidate);
  return parsed?.embedUrl ?? null;
}

export function canvaEmbedAllowed(embedUrl: string | null | undefined): boolean {
  if (!embedUrl) return false;
  return parseCanvaShareUrl(embedUrl) !== null;
}

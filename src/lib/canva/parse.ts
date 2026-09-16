export const CANVA_ALLOWED_HOSTS = [
  "www.canva.com",
  "canva.com",
  "www.canva.site",
  "canva.site",
] as const;

/** Connect thumbnails / export downloads. Not valid public share/embed hosts. */
export const CANVA_MEDIA_HOSTS = [
  "document-export.canva.com",
  "export-download.canva.com",
] as const;

export type ParsedCanvaDesign = {
  shareUrl: string;
  embedUrl: string;
  designId: string;
  host: string;
};

function isAllowedCanvaHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (CANVA_ALLOWED_HOSTS as readonly string[]).includes(host);
}

export function isAllowedCanvaUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:") return false;
    return isAllowedCanvaHost(url.hostname);
  } catch {
    return false;
  }
}

export function isAllowedCanvaMediaUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return isAllowedCanvaHost(host) || (CANVA_MEDIA_HOSTS as readonly string[]).includes(host);
  } catch {
    return false;
  }
}

export function canvaStableEditUrl(designId: string): string | null {
  if (!/^[A-Za-z0-9_-]{6,}$/.test(designId)) return null;
  return `https://www.canva.com/design/${designId}/edit`;
}

/** Extract a Canva URL from a share link, embed URL, or iframe HTML snippet. Never executes HTML. */
export function extractCanvaUrl(input: string | null | undefined): string | null {
  const raw = input?.trim() ?? "";
  if (!raw) return null;
  const iframeSrc = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = iframeSrc?.[1] ?? raw;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    if (!isAllowedCanvaHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseCanvaDesign(input: string | null | undefined): ParsedCanvaDesign | null {
  const extracted = extractCanvaUrl(input);
  if (!extracted) return null;
  const url = new URL(extracted);
  // Official share/embed/view/edit/watch paths only. Short /d/ links are not
  // treated as public embeds — they are not proof of a DAG design id.
  const match = url.pathname.match(/\/design\/([A-Za-z0-9_-]+)(?:\/(?:view|edit|watch|present))?\/?/);
  if (!match) return null;
  const designId = match[1];
  if (designId.length < 6) return null;
  const shareUrl = `https://www.canva.com/design/${designId}/view`;
  const embedUrl = `https://www.canva.com/design/${designId}/view?embed`;
  return {
    shareUrl,
    embedUrl,
    designId,
    host: url.hostname.toLowerCase(),
  };
}

export function toCanvaEmbedUrl(shareOrEmbed: string | null | undefined): string | null {
  const parsed = parseCanvaDesign(shareOrEmbed);
  return parsed?.embedUrl ?? null;
}

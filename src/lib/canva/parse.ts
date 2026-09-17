export const CANVA_ALLOWED_HOSTS = [
  "www.canva.com",
  "canva.com",
  "www.canva.site",
  "canva.site",
] as const;

/** Redirect follow allowlist for short links. Broader than paste hosts; never evil.com. */
export const CANVA_REDIRECT_HOSTS = ["www.canva.com", "canva.com"] as const;

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

export function isCanvaRedirectHost(hostname: string): boolean {
  return (CANVA_REDIRECT_HOSTS as readonly string[]).includes(hostname.toLowerCase());
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
  // Official share/embed/view/edit/watch/present paths only. Short /d/ links are
  // not public embeds until a server-side redirect yields a DAG design id.
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

/** Canva share short links (`/d/{id}`). Not a design id; must be resolved server-side. */
export function isCanvaShortLink(input: string | null | undefined): boolean {
  const extracted = extractCanvaUrl(input);
  if (!extracted) return false;
  try {
    const url = new URL(extracted);
    if (!isCanvaRedirectHost(url.hostname)) return false;
    return /^\/d\/[A-Za-z0-9_-]{6,}$/.test(url.pathname.replace(/\/$/, ""));
  } catch {
    return false;
  }
}

export type NormalizedCanvaPaste = {
  shareUrl: string;
  embedUrl: string | null;
  designId: string | null;
  kind: "empty" | "design" | "short" | "invalid";
};

/**
 * Normalize a paste (share URL, embed URL, or iframe HTML) into stored Canva fields.
 * Never invents a design id. Drops pasted HTML that is not a Canva URL.
 */
export function normalizeCanvaPaste(raw: string | null | undefined): NormalizedCanvaPaste {
  const value = raw?.trim() ?? "";
  if (!value) {
    return { shareUrl: "", embedUrl: null, designId: null, kind: "empty" };
  }
  const parsed = parseCanvaDesign(value);
  if (parsed) {
    return {
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      designId: parsed.designId,
      kind: "design",
    };
  }
  const extracted = extractCanvaUrl(value);
  if (extracted && isCanvaShortLink(extracted)) {
    return {
      shareUrl: extracted.split("?")[0],
      embedUrl: null,
      designId: null,
      kind: "short",
    };
  }
  if (/<iframe|javascript:|data:/i.test(value) && !extracted) {
    return { shareUrl: "", embedUrl: null, designId: null, kind: "invalid" };
  }
  return {
    shareUrl: extracted ? extracted.split("?")[0] : value,
    embedUrl: null,
    designId: null,
    kind: "invalid",
  };
}

export function isCanvaLoginUrl(input: string): boolean {
  try {
    const url = new URL(input);
    const path = url.pathname.toLowerCase();
    return (
      path === "/login" ||
      path.startsWith("/login/") ||
      path.startsWith("/signup") ||
      path.includes("/_login") ||
      path.startsWith("/oidc") ||
      path.startsWith("/account/login")
    );
  } catch {
    return false;
  }
}

export type CanvaNavigationClass =
  | "design"
  | "official-embed"
  | "short-link"
  | "login-wall"
  | "cloudflare-challenge"
  | "not-found"
  | "non-design"
  | "invalid";

/** Classify a navigation URL only. Never reads HTML or invents a design id. */
export function classifyCanvaNavigationUrl(input: string): {
  class: CanvaNavigationClass;
  designId: string | null;
} {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { class: "invalid", designId: null };
  }
  if (url.protocol !== "https:" || !isCanvaRedirectHost(url.hostname)) {
    return { class: "non-design", designId: null };
  }
  const parsed = parseCanvaDesign(url.toString());
  if (parsed) {
    const embed = url.searchParams.has("embed") || /\/embed\/?$/.test(url.pathname);
    return { class: embed ? "official-embed" : "design", designId: parsed.designId };
  }
  if (isCanvaLoginUrl(url.toString())) return { class: "login-wall", designId: null };
  if (isCanvaShortLink(url.toString())) return { class: "short-link", designId: null };
  const path = url.pathname.toLowerCase();
  if (path.includes("cdn-cgi") || path.includes("challenge")) {
    return { class: "cloudflare-challenge", designId: null };
  }
  if (path.includes("/404") || path.endsWith("/not-found")) {
    return { class: "not-found", designId: null };
  }
  return { class: "non-design", designId: null };
}

/**
 * Combine page.url() with page.title() after a viewer-like navigation.
 * Title is only used to tell challenge / login / 404 from a stuck /d/ URL.
 * Never parsed for DAG ids.
 */
export function classifyCanvaPageOutcome(input: { url: string; title?: string | null }): CanvaNavigationClass {
  const fromUrl = classifyCanvaNavigationUrl(input.url);
  if (
    fromUrl.class === "design" ||
    fromUrl.class === "official-embed" ||
    fromUrl.class === "login-wall" ||
    fromUrl.class === "invalid"
  ) {
    return fromUrl.class;
  }
  const title = (input.title ?? "").toLowerCase();
  if (
    title.includes("just a moment") ||
    title.includes("attention required") ||
    title.includes("cloudflare") ||
    title.includes("verifying")
  ) {
    return "cloudflare-challenge";
  }
  if (title.includes("log in") || title.includes("sign up") || title.includes("sign in")) {
    return "login-wall";
  }
  if (
    title.includes("roadblock") ||
    title.includes("doesn't work") ||
    title.includes("page not found") ||
    /\b404\b/.test(title)
  ) {
    return "not-found";
  }
  return fromUrl.class;
}

export type CanvaPersistShape = {
  shareUrl: string | null;
  embedUrl: string | null;
  designId: string | null;
  statusHint: "pending" | "failed" | "not_configured";
};

/**
 * What to store on save. Short /d/ URLs stay as pending share links (no embed,
 * no design id). Non-Canva hosts are dropped. Never marks verified.
 */
export function canvaPersistShape(shareOrEmbed: string | null | undefined): CanvaPersistShape {
  const parsed = parseCanvaDesign(shareOrEmbed);
  if (parsed) {
    return {
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      designId: parsed.designId,
      statusHint: "pending",
    };
  }
  if (isCanvaShortLink(shareOrEmbed)) {
    const extracted = extractCanvaUrl(shareOrEmbed);
    return {
      shareUrl: extracted,
      embedUrl: null,
      designId: null,
      statusHint: "pending",
    };
  }
  if (shareOrEmbed?.trim()) {
    return { shareUrl: null, embedUrl: null, designId: null, statusHint: "failed" };
  }
  return { shareUrl: null, embedUrl: null, designId: null, statusHint: "not_configured" };
}

/**
 * Prefer a parsed /design/{id} from either field so saving a leftover /d/ share
 * cannot wipe an embed the server already resolved.
 */
export function canvaPersistFromFields(
  share?: string | null,
  embed?: string | null,
): CanvaPersistShape {
  const parsed = parseCanvaDesign(embed) ?? parseCanvaDesign(share);
  if (parsed) {
    return {
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      designId: parsed.designId,
      statusHint: "pending",
    };
  }
  return canvaPersistShape(share || embed);
}

export function toCanvaEmbedUrl(shareOrEmbed: string | null | undefined): string | null {
  const parsed = parseCanvaDesign(shareOrEmbed);
  return parsed?.embedUrl ?? null;
}

/** Persist only same-origin media covers. Connect CDN thumbnails expire and must not become the public cover. */
export function sanitizeStoredCanvaThumbnail(input: string | null | undefined): string | null {
  const raw = input?.trim() ?? "";
  if (!raw) return null;
  if (!raw.startsWith("/media/")) return null;
  if (raw.includes("..") || raw.includes("//") || raw.includes("\\") || raw.includes("%")) return null;
  return raw.split("?")[0];
}

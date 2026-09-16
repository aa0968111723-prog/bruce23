import { parseCanvaDesign } from "./parse.ts";

/** Syntactically valid public-share shape. Not a live design we own or have probed. */
export const CANVA_FIXTURE_SHARE_URL = "https://www.canva.com/design/DAGfixtureEmbedShape/view?utm_source=share";
export const CANVA_FIXTURE_EMBED_URL = "https://www.canva.com/design/DAGfixtureEmbedShape/view?embed";
export const CANVA_FIXTURE_DESIGN_ID = "DAGfixtureEmbedShape";
export const CANVA_FIXTURE_PAGE_IDS = ["cover", "page-2"];

export function canvaEmbedSrc(embedUrl: string, pageId?: string | null): string {
  if (!pageId || pageId === "cover") return embedUrl;
  const url = new URL(embedUrl);
  url.searchParams.set("page", pageId);
  return url.toString();
}

export function canvaOpenOriginalUrl(shareOrEmbed: string | null | undefined): string | null {
  const parsed = parseCanvaDesign(shareOrEmbed);
  return parsed?.shareUrl ?? null;
}

export function parseCanvaPageIds(input: string | null | undefined): string[] | null {
  const raw = input?.trim() ?? "";
  if (!raw) return null;
  const pages = raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return pages.length ? pages : null;
}

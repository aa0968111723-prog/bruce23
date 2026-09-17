import { archiveItems } from "../../content/archive.ts";
import { projects } from "../../content/projects.ts";
import { parseCanvaDesign, isCanvaShortLink, type ParsedCanvaDesign } from "./parse.ts";
import type { IntegrationStatus } from "../cms/status.ts";

const CANVA_URL_RE = /https:\/\/(?:www\.)?canva\.(?:com|site)\/[^\s"'<>)]+/gi;

export type CanvaSeedFields = {
  shareUrl: string | null;
  embedUrl: string | null;
  designId: string | null;
  thumbnailUrl: string | null;
  alt: string | null;
  caption: string | null;
  status: IntegrationStatus;
};

/** Local SVG exports already in /public/media — not Canva share/embed URLs. */
const LOCAL_THUMBS: Record<string, { src: string; alt: string; caption: string }> = {
  "tku-zen-ai": {
    src: "/media/archive/tku-zen-poster.svg",
    alt: "淡大禪學社文宣的本地 SVG 轉譯，不是公開嵌入",
    caption: "本地 SVG 轉譯。沒有公開分享連結，所以不嵌入空白 iframe，也不能翻頁。",
  },
  "tku-zen-poster": {
    src: "/media/archive/tku-zen-poster.svg",
    alt: "淡大禪學社文宣的本地 SVG 轉譯，不是公開嵌入",
    caption: "本地 SVG 轉譯。沒有公開分享連結，所以不嵌入空白 iframe，也不能翻頁。",
  },
  "tku-zen-brand-deck": {
    src: "/media/archive/tku-zen-brand.svg",
    alt: "淡大禪學社 TKU Zen 簡報首頁的本地 SVG 轉譯",
    caption: "本地 SVG 轉譯。沒有公開分享連結，所以不嵌入空白 iframe，也不能翻頁。",
  },
  "tku-zen-page2": {
    src: "/media/archive/tku-zen-page2.svg",
    alt: "禪學社活動簡報內頁的本地 SVG 轉譯",
    caption: "本地 SVG 轉譯。沒有公開分享連結，所以不嵌入空白 iframe，也不能翻頁。",
  },
};

export function collectCanvaUrlsFromText(text: string): ParsedCanvaDesign[] {
  const found = new Map<string, ParsedCanvaDesign>();
  for (const match of text.match(CANVA_URL_RE) ?? []) {
    const parsed = parseCanvaDesign(match.replace(/[.,;]+$/, ""));
    if (parsed && !found.has(parsed.designId)) found.set(parsed.designId, parsed);
  }
  return [...found.values()];
}

export function collectCanvaShortUrlsFromText(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.match(CANVA_URL_RE) ?? []) {
    const cleaned = match.replace(/[.,;]+$/, "");
    if (isCanvaShortLink(cleaned)) found.add(cleaned.split("?")[0]);
  }
  return [...found];
}

/**
 * Public /d/ URLs found in Bruce repos (healing-studio docs). Not DAG ids.
 * Server resolve must succeed before any of these become embeds.
 */
export const CANVA_SHORTLINK_CANDIDATES: Record<string, string[]> = {
  "ai-director-os": [
    "https://www.canva.com/d/ysK5sYZisVEjZFe",
    "https://www.canva.com/d/WJgjSP967WEuhhN",
    "https://www.canva.com/d/g4tColMMj63-XRu",
    "https://www.canva.com/d/kFV4KQpB2QzPjb0",
  ],
};

function firstParsed(texts: Array<string | null | undefined>): ParsedCanvaDesign | null {
  return collectCanvaUrlsFromText(texts.filter((item): item is string => Boolean(item)).join("\n"))[0] ?? null;
}

function fieldsFromParsed(
  parsed: ParsedCanvaDesign | null,
  local?: { src: string; alt: string; caption: string },
): CanvaSeedFields {
  if (parsed) {
    return {
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      designId: parsed.designId,
      thumbnailUrl: local?.src ?? null,
      alt: local?.alt ?? null,
      caption: local?.caption ?? null,
      status: "pending",
    };
  }
  if (local) {
    return {
      shareUrl: null,
      embedUrl: null,
      designId: null,
      thumbnailUrl: local.src,
      alt: local.alt,
      caption: local.caption,
      status: "unavailable",
    };
  }
  return {
    shareUrl: null,
    embedUrl: null,
    designId: null,
    thumbnailUrl: null,
    alt: null,
    caption: null,
    status: "not_configured",
  };
}

export function canvaFieldsForProject(project: (typeof projects)[number]): CanvaSeedFields {
  const texts = [
    project.links.github,
    project.links.live,
    project.links.demo,
    ...project.sourceReferences.map((ref) => ref.href),
    ...project.media.map((item) => item.src),
    project.summary,
    project.problem,
    ...project.outputs,
    ...project.limitations,
  ];
  const parsed = firstParsed(texts);
  const local = LOCAL_THUMBS[project.slug];
  if (parsed) return fieldsFromParsed(parsed, local);
  const shorts = [
    ...(CANVA_SHORTLINK_CANDIDATES[project.slug] ?? []),
    ...collectCanvaShortUrlsFromText(texts.filter((item): item is string => Boolean(item)).join("\n")),
  ];
  const shareUrl = shorts[0] ?? null;
  if (shareUrl) {
    return {
      shareUrl,
      embedUrl: null,
      designId: null,
      thumbnailUrl: local?.src ?? null,
      alt: local?.alt ?? null,
      caption:
        local?.caption ??
        "瀏覽器與伺服器跟隨後都沒有落到 canva.com/design/{id}（404 或 Cloudflare 驗證頁）。不會嵌入空白 iframe，也不會標成已驗證。",
      status: "unavailable",
    };
  }
  return fieldsFromParsed(null, local);
}

export function canvaFieldsForArchive(item: (typeof archiveItems)[number]): CanvaSeedFields {
  const parsed = firstParsed([item.href, item.originNote, item.media?.src, item.summary]);
  const local =
    LOCAL_THUMBS[item.id] ??
    (item.originNote.includes("Canva") && item.media
      ? {
          src: item.media.src.replace(/\.jpg$/i, ".svg"),
          alt: item.media.alt,
          caption: "本地 SVG 轉譯。沒有公開分享連結，所以不嵌入空白 iframe，也不能翻頁。",
        }
      : undefined);
  return fieldsFromParsed(parsed, local);
}

export function projectCanvaInventory(): Record<string, CanvaSeedFields> {
  return Object.fromEntries(projects.map((project) => [project.slug, canvaFieldsForProject(project)]));
}

export function archiveCanvaInventory(): Record<string, CanvaSeedFields> {
  return Object.fromEntries(archiveItems.map((item) => [item.id, canvaFieldsForArchive(item)]));
}

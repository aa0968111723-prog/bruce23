import { extractCanvaUrl, isAllowedCanvaUrl, parseCanvaDesign } from "./parse.ts";

export type CanvaEmbedTestResult =
  | {
      status: "failed";
      error: string;
    }
  | {
      status: "pending";
      parsed: true;
      liveProbe: false;
      shareUrl: string;
      embedUrl: string;
      designId: string;
      error: string;
    }
  | {
      status: "failed";
      parsed: false;
      liveProbe: false;
      shareUrl: string;
      embedUrl: null;
      designId: null;
      error: string;
    };

/** Syntax/allowlist check only. Never marks a design verified and never live-probes. */
export function evaluateCanvaEmbedTest(raw: string): CanvaEmbedTestResult {
  const extracted = extractCanvaUrl(raw);
  if (!extracted || !isAllowedCanvaUrl(extracted)) {
    return {
      status: "failed",
      error: "只接受 Canva 允許網域的分享／嵌入網址，不會執行後台貼上的 HTML。",
    };
  }
  const parsed = parseCanvaDesign(extracted);
  if (parsed) {
    return {
      status: "pending",
      parsed: true,
      liveProbe: false,
      shareUrl: parsed.shareUrl,
      embedUrl: parsed.embedUrl,
      designId: parsed.designId,
      error: "語法通過 Canva 允許清單。沒有對該設計做公開嵌入探測，不會標成已驗證。",
    };
  }
  return {
    status: "failed",
    parsed: false,
    liveProbe: false,
    shareUrl: extracted,
    embedUrl: null,
    designId: null,
    error: "網域通過允許清單，但不是 /design/{id} 分享或嵌入網址（短網址 /d/ 不會當成公開嵌入）。",
  };
}

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

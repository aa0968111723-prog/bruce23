import { skipGithubHydrate } from "../../content/project-registry.ts";
import type { IntegrationStatus } from "../cms/status.ts";
import type { ViewerLang } from "./view.ts";

export type GithubStatusInput = {
  slug: string;
  github: { url: string | null; syncStatus: IntegrationStatus };
};

export type DemoStatusInput = {
  url: string | null;
  status: IntegrationStatus;
  embedEnabled: boolean;
};

export type CanvaStatusInput = {
  status: IntegrationStatus;
  shareUrl?: string | null;
  embedUrl?: string | null;
};

export function hasPublicCanvaUrl(canva: CanvaStatusInput): boolean {
  return Boolean(canva.shareUrl || canva.embedUrl);
}

export type IntegrationLineInput = GithubStatusInput & {
  demo: DemoStatusInput;
  canva: CanvaStatusInput;
};

/** Public GitHub status. A live repo URL is not 「sync failed」. */
export function publicGithubStatusLabel(lang: ViewerLang, input: GithubStatusInput): string {
  if (skipGithubHydrate(input.slug)) {
    return lang === "en" ? "GitHub withheld pending review" : "GitHub 暫不公開連結";
  }
  if (!input.github.url) {
    return lang === "en" ? "GitHub not set up" : "GitHub 尚未設定";
  }
  switch (input.github.syncStatus) {
    case "failed":
      return lang === "en"
        ? "GitHub public link (file tree not synced)"
        : "GitHub 公開連結（檔案樹未同步）";
    case "pending":
    case "not_configured":
    case "stale":
      return lang === "en" ? "GitHub not synced yet" : "GitHub 尚未同步";
    default:
      return lang === "en" ? "GitHub synced" : "GitHub 已同步";
  }
}

export function publicDemoStatusLabel(lang: ViewerLang, demo: DemoStatusInput): string {
  if (!demo.url) {
    return lang === "en" ? "Demo not set up" : "Demo 尚未設定";
  }
  if (demo.status === "verified" && demo.embedEnabled) {
    return lang === "en" ? "Demo verified" : "Demo 已驗證";
  }
  if (demo.status === "pending") {
    return lang === "en" ? "Demo pending check" : "Demo 待檢查";
  }
  if (demo.status === "failed") {
    return lang === "en" ? "Demo public URL (check failed)" : "Demo 公開網址（檢查失敗）";
  }
  return lang === "en" ? "Demo public URL (cannot embed)" : "Demo 公開網址（無法嵌入）";
}

export function publicCanvaStatusLabel(lang: ViewerLang, canva: CanvaStatusInput): string {
  if (!hasPublicCanvaUrl(canva)) {
    return lang === "en" ? "Canva not set up" : "Canva 尚未設定";
  }
  switch (canva.status) {
    case "verified":
    case "connected":
      return lang === "en" ? "Canva connected" : "Canva 已連線";
    case "pending":
      return lang === "en" ? "Canva pending" : "Canva 待同步";
    case "failed":
      return lang === "en" ? "Canva failed" : "Canva 失敗";
    case "unavailable":
      return lang === "en" ? "Canva cannot embed" : "Canva 無法嵌入";
    default:
      return lang === "en" ? "Canva not set up" : "Canva 尚未設定";
  }
}

function canvaStatusShort(lang: ViewerLang, canva: CanvaStatusInput): string {
  if (!hasPublicCanvaUrl(canva)) {
    return lang === "en" ? "not set up" : "尚未設定";
  }
  switch (canva.status) {
    case "verified":
    case "connected":
      return lang === "en" ? "connected" : "已連線";
    case "pending":
      return lang === "en" ? "pending" : "待同步";
    case "failed":
    case "unavailable":
      return lang === "en" ? "cannot embed" : "無法嵌入";
    default:
      return lang === "en" ? "not set up" : "尚未設定";
  }
}

/** Visual-tab iframe footer. Never interpolate the raw CMS enum. */
export function publicLiveDemoMark(lang: ViewerLang, demo: DemoStatusInput): string {
  if (lang === "en") {
    if (!demo.url) return "Live Demo · not set up";
    if (demo.status === "verified" && demo.embedEnabled) return "Live Demo · verified";
    if (demo.status === "pending") return "Live Demo · pending check";
    if (demo.status === "failed") return "Live Demo · public URL (check failed)";
    return "Live Demo · public URL (cannot embed)";
  }
  if (!demo.url) return "Live Demo · 尚未設定";
  if (demo.status === "verified" && demo.embedEnabled) return "Live Demo · 已驗證";
  if (demo.status === "pending") return "Live Demo · 待檢查";
  if (demo.status === "failed") return "Live Demo · 公開網址（檢查失敗）";
  return "Live Demo · 公開網址（無法嵌入）";
}

/** Canva tab source mark. Never interpolate the raw CMS enum. */
export function publicCanvaSourceMark(
  lang: ViewerLang,
  canva: CanvaStatusInput,
  mode: "public-embed" | "canva-embed",
): string {
  const short = canvaStatusShort(lang, canva);
  if (lang === "en") {
    const modeLabel = mode === "canva-embed" ? "Canva public embed" : "public embed mode";
    return `Source mark: ${modeLabel} · ${short} · not claiming Connect is linked`;
  }
  const modeLabel = mode === "canva-embed" ? "Canva 公開嵌入" : "公開嵌入模式";
  return `來源標記：${modeLabel} · ${short} · 未宣稱 Connect 已連線`;
}

/** Public case-study integration line. Never print raw CMS enums. */
export function publicIntegrationLine(lang: ViewerLang, input: IntegrationLineInput): string {
  return `${publicGithubStatusLabel(lang, input)} · ${publicDemoStatusLabel(lang, input.demo)} · ${publicCanvaStatusLabel(lang, input.canva)}`;
}

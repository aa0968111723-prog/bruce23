import { skipGithubHydrate } from "../../content/project-registry.ts";
import type { IntegrationStatus } from "../cms/status.ts";
import type { ViewerLang } from "./view.ts";

export type GithubStatusInput = {
  slug: string;
  github: { url: string | null; syncStatus: IntegrationStatus };
};

export type IntegrationLineInput = GithubStatusInput & {
  demo: { url: string | null; status: IntegrationStatus; embedEnabled: boolean };
  canva: { status: IntegrationStatus };
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

function demoPart(lang: ViewerLang, input: IntegrationLineInput): string {
  if (!input.demo.url) {
    return lang === "en" ? "Demo not set up" : "Demo 尚未設定";
  }
  if (input.demo.status === "verified" && input.demo.embedEnabled) {
    return lang === "en" ? "Demo verified" : "Demo 已驗證";
  }
  if (input.demo.status === "pending") {
    return lang === "en" ? "Demo pending check" : "Demo 待檢查";
  }
  if (input.demo.status === "failed") {
    return lang === "en" ? "Demo public URL (check failed)" : "Demo 公開網址（檢查失敗）";
  }
  return lang === "en" ? "Demo public URL (cannot embed)" : "Demo 公開網址（無法嵌入）";
}

function canvaPart(lang: ViewerLang, input: IntegrationLineInput): string {
  switch (input.canva.status) {
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

/** Public case-study integration line. Never print raw CMS enums. */
export function publicIntegrationLine(lang: ViewerLang, input: IntegrationLineInput): string {
  return `${publicGithubStatusLabel(lang, input)} · ${demoPart(lang, input)} · ${canvaPart(lang, input)}`;
}

export const PRODUCT_STATUSES = [
  "completed",
  "in-progress",
  "prototype",
  "concept",
  "planned",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const INTEGRATION_STATUSES = [
  "connected",
  "pending",
  "unavailable",
  "failed",
  "not_configured",
  "verified",
  "stale",
] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

export const EXPERIENCE_MODES = [
  "live-demo",
  "github-explorer",
  "canva-embed",
  "interactive-walkthrough",
  "image-comparison",
  "timeline",
  "process-map",
  "spatial-preview",
  "conversation-preview",
  "media-gallery",
] as const;
export type ExperienceMode = (typeof EXPERIENCE_MODES)[number];

export const EXPERIENCE_MODE_LABEL: Record<ExperienceMode, string> = {
  "live-demo": "即時 Demo",
  "github-explorer": "GitHub 檔案樹",
  "canva-embed": "Canva 嵌入",
  "interactive-walkthrough": "逐步走查",
  "image-comparison": "圖像比較／對稿",
  timeline: "時間軸",
  "process-map": "流程地圖",
  "spatial-preview": "空間預覽",
  "conversation-preview": "對話預覽",
  "media-gallery": "媒體廊",
};

export const PROJECT_CATEGORIES = [
  "AI Product",
  "Multimodal",
  "Interaction",
  "Visual AI",
  "Spatial Design",
  "Creative Tool",
  "Real-world Experience",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const LIVE_DEMO_TYPES = ["iframe", "link", "unavailable"] as const;
export type LiveDemoType = (typeof LIVE_DEMO_TYPES)[number];

export const productStatusLabel: Record<ProductStatus, string> = {
  completed: "已完成",
  "in-progress": "開發中",
  prototype: "原型",
  concept: "概念驗證",
  planned: "規劃中",
};

export const publicationStatusLabel: Record<PublicationStatus, string> = {
  draft: "草稿",
  published: "已發布",
  archived: "已封存",
};

export const integrationStatusLabel: Record<IntegrationStatus, string> = {
  connected: "已連線",
  pending: "待同步",
  unavailable: "無法使用",
  failed: "失敗",
  not_configured: "尚未設定",
  verified: "已驗證",
  stale: "可能過期",
};

export function isPublicationStatus(value: string): value is PublicationStatus {
  return (PUBLICATION_STATUSES as readonly string[]).includes(value);
}

export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

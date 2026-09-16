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

export const PUBLICATION_STATUSES = [
  "draft",
  "published",
  "unpublished",
  "archived",
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const PRODUCT_STATUSES = [
  "completed",
  "in-progress",
  "prototype",
  "concept",
  "planned",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

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

export const LIVE_DEMO_TYPES = ["live", "iframe", "pwa"] as const;
export type LiveDemoType = (typeof LIVE_DEMO_TYPES)[number];

export const EXPERIENCE_TABS = [
  { id: "try", labelZh: "立即體驗", labelEn: "Try now" },
  { id: "visual", labelZh: "視覺展示", labelEn: "Visual" },
  { id: "github", labelZh: "GitHub專案", labelEn: "GitHub" },
  { id: "canva", labelZh: "Canva原作", labelEn: "Canva" },
  { id: "how", labelZh: "如何運作", labelEn: "How it works" },
  { id: "source", labelZh: "技術來源", labelEn: "Sources" },
] as const;

export type ExperienceTabId = (typeof EXPERIENCE_TABS)[number]["id"];

export const MULTIMODAL_NODES = [
  {
    id: "image",
    labelZh: "圖像",
    labelEn: "Image",
    noteZh: "海報、文宣、畫布、熱圖",
    slugs: ["poster-vision-ai", "duigao", "folio"],
  },
  {
    id: "video",
    labelZh: "影片",
    labelEn: "Video",
    noteZh: "分鏡、逐幀、時間軸",
    slugs: ["framelab", "ai-director-os"],
  },
  {
    id: "space",
    labelZh: "空間",
    labelEn: "Space",
    noteZh: "等角場佈與動線",
    slugs: ["planform"],
  },
  {
    id: "print",
    labelZh: "文宣",
    labelEn: "Print",
    noteZh: "社團文宣與對稿",
    slugs: ["poster-vision-ai", "duigao", "folio"],
  },
  {
    id: "interact",
    labelZh: "互動",
    labelEn: "Interact",
    noteZh: "對稿、禪意對話、工作區",
    slugs: ["duigao", "tku-zen-ai", "hermes-console"],
  },
] as const;

export const GITHUB_AUTO_FIELDS = [
  "github_owner",
  "github_repo",
  "github_branch",
  "github_metadata",
  "github_readme",
  "github_file_tree",
  "github_languages",
  "github_topics",
  "github_latest_commit",
  "github_sync_status",
  "github_last_synced_at",
] as const;

export const NARRATIVE_FIELDS = [
  "title",
  "title_en",
  "subtitle",
  "subtitle_en",
  "summary",
  "summary_en",
  "problem",
  "problem_en",
  "role",
  "role_en",
  "decisions_json",
  "process_json",
  "outputs_json",
  "limitations_json",
  "experience_config",
  "interaction_steps",
] as const;

export const SECRET_KEY_PATTERN =
  /token|secret|password|ciphertext|apikey|api_key|service[_-]?role|private[_-]?key/i;

export const CANVA_ALLOWED_HOSTS = new Set([
  "canva.com",
  "www.canva.com",
]);

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type ProductStatus =
  | "completed"
  | "in-progress"
  | "prototype"
  | "concept"
  | "planned";

export type PublicationStatus = "draft" | "published" | "unpublished" | "archived";

export type ProjectCategory =
  | "AI Product"
  | "Multimodal"
  | "Interaction"
  | "Visual AI"
  | "Spatial Design"
  | "Creative Tool"
  | "Real-world Experience";

export type ExperienceMode =
  | "live-demo"
  | "github-explorer"
  | "canva-embed"
  | "interactive-walkthrough"
  | "image-comparison"
  | "timeline"
  | "process-map"
  | "spatial-preview"
  | "conversation-preview"
  | "media-gallery";

export type IntegrationStatus =
  | "connected"
  | "pending"
  | "unavailable"
  | "failed"
  | "not_configured"
  | "verified"
  | "stale";

export type MediaKind = "image" | "video";

export interface ProjectMedia {
  src: string;
  alt: string;
  kind: MediaKind;
  caption?: string;
  poster?: string;
}

export interface SourceEvidence {
  label: string;
  href?: string;
  note: string;
  kind?: "github" | "canva" | "demo" | "readme" | "other";
}

export interface FileTreeNode {
  path: string;
  type: "file" | "dir";
  purpose?: string;
  workflowStage?: string;
  githubUrl?: string;
}

export interface GithubCommitPublic {
  sha: string;
  message: string;
  committedAt: string | null;
  htmlUrl: string | null;
}

export interface GithubMetadataPublic {
  name: string;
  fullName: string;
  description: string | null;
  homepage: string | null;
  defaultBranch: string;
  updatedAt: string | null;
  pushedAt: string | null;
  language: string | null;
  visibility: "public" | "private";
  archived: boolean;
  htmlUrl: string;
}

export interface PublicGithubSource {
  url: string;
  owner: string;
  repo: string;
  branch: string | null;
  syncStatus: IntegrationStatus;
  lastSyncedAt: string | null;
  metadata: GithubMetadataPublic | null;
  readmeSummary: string | null;
  fileTree: FileTreeNode[];
  languages: Record<string, number> | null;
  topics: string[];
  latestCommit: GithubCommitPublic | null;
}

export interface PublicLiveDemo {
  url: string;
  label: string | null;
  type: "iframe" | "link" | "none" | null;
  embedEnabled: boolean;
  lastVerifiedAt: string | null;
  status: IntegrationStatus;
}

export interface PublicCanvaSource {
  shareUrl: string | null;
  embedUrl: string | null;
  designId: string | null;
  pageIds: string[];
  thumbnailUrl: string | null;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
  alt: string | null;
  description: string | null;
}

export interface InteractionStep {
  id: string;
  title: string;
  body: string;
  githubPath?: string;
  workflowStage?: string;
}

export interface PublicProject {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  year: string;
  productStatus: ProductStatus;
  featured: boolean;
  sortOrder: number;
  summary: string;
  problem: string;
  role: string;
  decisions: string[];
  modalities: string[];
  process: string[];
  outputs: string[];
  stack: string[];
  limitations: string[];
  media: ProjectMedia[];
  sourceEvidence: SourceEvidence[];
  github: PublicGithubSource | null;
  liveDemo: PublicLiveDemo | null;
  canva: PublicCanvaSource | null;
  experienceMode: ExperienceMode | null;
  experienceConfig: JsonObject;
  interactionSteps: InteractionStep[];
  seoTitle: string | null;
  seoDescription: string | null;
  localeZh: JsonObject;
  localeEn: JsonObject;
}

export interface AdminProject extends PublicProject {
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  archivedAt: string | null;
  githubSyncEnabled: boolean;
  githubSyncError: string | null;
  githubReadme: string | null;
  githubIsPrivate: boolean;
  liveDemoError: string | null;
  canvaError: string | null;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicArchiveItem {
  id: string;
  title: string;
  kind:
    | "photography"
    | "graphic"
    | "social"
    | "event"
    | "video"
    | "club-visual"
    | "interactive";
  year: string;
  summary: string;
  media?: ProjectMedia;
  href?: string;
  originNote: string;
  canva: PublicCanvaSource | null;
  sortOrder: number;
}

export interface AdminArchiveItem extends PublicArchiveItem {
  publicationStatus: string;
}

export interface PublicSiteSettings {
  nameZh: string;
  nameEn: string;
  person: string;
  role: string;
  headline: string;
  subhead: string;
  narrative: string;
  email: string;
  github: string;
  githubHandle: string;
  location: string;
  seoTitle: string | null;
  seoDescription: string | null;
  homepageContent: JsonObject;
  localeZh: JsonObject;
  localeEn: JsonObject;
}

export const GITHUB_AUTO_SYNC_FIELDS = [
  "github_metadata",
  "github_readme_summary",
  "github_languages",
  "github_topics",
  "github_latest_commit",
  "github_branch",
  "github_is_private",
  "github_file_tree",
] as const;

export const NARRATIVE_FIELDS = [
  "title",
  "subtitle",
  "summary",
  "problem",
  "role",
  "decisions",
  "limitations",
  "locale_zh",
  "locale_en",
] as const;

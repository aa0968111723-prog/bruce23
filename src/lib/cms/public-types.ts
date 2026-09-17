import type {
  CopyLocale,
  ExperienceConfig,
  ExperienceMode,
  FileTreeNode,
  GithubMetadata,
  IntegrationStatus,
  PublicationStatus,
} from "./schema";
import type { ProjectCategory, ProjectMedia, ProjectStatus } from "../../content/types";

export type LanguageBytes = { [language: string]: number };

export type PublicGithub = {
  url: string;
  owner: string;
  repo: string;
  branch: string | null;
  description: string | null;
  homepage: string | null;
  languages: LanguageBytes | null;
  topics: string[];
  updatedAt: string | null;
  latestCommit: {
    sha: string;
    message: string;
    committedAt?: string;
    htmlUrl?: string;
  } | null;
  readmeSummary: string;
  fileTree: FileTreeNode[] | null;
  isPrivate: false;
};

export type PublicCanva = {
  shareUrl: string | null;
  embedUrl: string | null;
  designId: string | null;
  pageIds: string[];
  thumbnailUrl: string | null;
  alt: string | null;
  caption: string | null;
  status: IntegrationStatus;
};

export type PublicDemo = {
  url: string | null;
  label: string | null;
  type: "iframe" | "link" | "none" | null;
  embedEnabled: boolean;
  status: IntegrationStatus;
};

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  subtitle: string;
  subtitleEn: string | null;
  summary: string;
  summaryEn: string | null;
  problem: string;
  role: string;
  decisions: string[];
  modalities: string[];
  process: string[];
  outputs: string[];
  stack: string[];
  limitations: string[];
  category: ProjectCategory;
  year: string;
  productStatus: ProjectStatus;
  publicationStatus: "published";
  featured: boolean;
  sortOrder: number;
  media: ProjectMedia[];
  videoUrl: string | null;
  github: PublicGithub | null;
  canva: PublicCanva | null;
  demo: PublicDemo | null;
  experienceMode: ExperienceMode;
  experienceConfig: ExperienceConfig;
  interactionSteps: string[];
  sourceEvidence: Array<{
    label: string;
    href?: string;
    note: string;
    kind?: string;
    path?: string;
  }>;
  seo: { title?: string; description?: string };
  updatedAt: string | null;
};

export type PublicArchiveItem = {
  id: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  media: ProjectMedia | null;
  href: string | null;
  originNote: string;
  canvaShareUrl: string | null;
  canvaEmbedUrl: string | null;
};

export type PublicSite = {
  profile: {
    nameZh: string;
    nameEn: string;
    person: string;
    role: string;
    headline: string;
    subhead: string;
    narrative: string;
    email: string;
    github: string;
    location: string;
  };
  homepage: {
    explorationTitle: string;
    explorationBody: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

export type AdminProject = Omit<PublicProject, "publicationStatus" | "github"> & {
  publicationStatus: PublicationStatus;
  githubUrl: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  githubBranch: string | null;
  githubSyncEnabled: boolean;
  githubSyncStatus: IntegrationStatus;
  githubLastSyncedAt: string | null;
  githubMetadata: GithubMetadata | null;
  githubReadme: string | null;
  githubFileTree: FileTreeNode[] | null;
  githubLanguages: LanguageBytes | null;
  githubTopics: string[] | null;
  githubLatestCommit: PublicGithub["latestCommit"];
  githubIsPrivate: boolean;
  githubPublicApproved: boolean;
  liveDemoError: string | null;
  canvaError: string | null;
  copyZh: CopyLocale;
  copyEn: CopyLocale;
  createdAt: string | null;
  updatedBy: string | null;
  github: PublicGithub | null;
  canvaLastSyncedAt: string | null;
  liveDemoLastVerifiedAt: string | null;
};

export const PRIVATE_ROW_KEYS = [
  "payload_encrypted",
  "github_token",
  "canva_access_token",
  "canva_refresh_token",
] as const;

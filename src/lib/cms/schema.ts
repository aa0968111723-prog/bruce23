import { z } from "zod";
import {
  EXPERIENCE_MODES,
  INTEGRATION_STATUSES,
  LIVE_DEMO_TYPES,
  PRODUCT_STATUSES,
  PROJECT_CATEGORIES,
  PUBLICATION_STATUSES,
} from "./status.ts";

export const mediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  kind: z.enum(["image", "video"]),
  caption: z.string().optional(),
  poster: z.string().optional(),
});

export const sourceEvidenceSchema = z.object({
  label: z.string().min(1),
  href: z.string().optional(),
  note: z.string().min(1),
  kind: z.enum(["github", "canva", "demo", "narrative", "other"]).optional(),
});

export const localeCopySchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  problem: z.string().optional(),
  role: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const githubCommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  date: z.string().optional(),
  htmlUrl: z.string().optional(),
});

export const githubTreeNodeSchema = z.object({
  path: z.string(),
  type: z.enum(["file", "dir"]),
  size: z.number().optional(),
});

export const githubMetadataSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  homepage: z.string().nullable().optional(),
  defaultBranch: z.string().optional(),
  updatedAt: z.string().optional(),
  pushedAt: z.string().optional(),
  private: z.boolean().optional(),
  archived: z.boolean().optional(),
  htmlUrl: z.string().optional(),
  language: z.string().nullable().optional(),
  syncError: z.string().optional(),
  errorCode: z.string().optional(),
});

export const processNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
  githubPath: z.string(),
  purpose: z.string(),
  stage: z.string(),
});

export const walkthroughStepSchema = z.object({
  title: z.string(),
  body: z.string(),
  path: z.string().optional(),
});

export const fileHintSchema = z.object({
  path: z.string(),
  purpose: z.string(),
  stage: z.string(),
});

export const experienceConfigSchema = z
  .object({
    honestyLabel: z.string().optional(),
    processNodes: z.array(processNodeSchema).optional(),
    walkthrough: z.array(walkthroughStepSchema).optional(),
    fileHints: z.array(fileHintSchema).optional(),
  })
  .default({});

export const homepageJsonSchema = z
  .object({
    highlightSlugs: z.array(z.string()).optional(),
  })
  .default({});

export const siteLocaleSchema = z
  .object({
    zh: z.record(z.string(), z.string()).optional(),
    en: z.record(z.string(), z.string()).optional(),
  })
  .default({});

export const projectInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能用小寫、數字與連字號"),
  title: z.string().min(1).max(160),
  subtitle: z.string().max(240).default(""),
  category: z.enum(PROJECT_CATEGORIES),
  year: z.string().min(1).max(32),
  product_status: z.enum(PRODUCT_STATUSES),
  publication_status: z.enum(PUBLICATION_STATUSES).default("draft"),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
  summary: z.string().default(""),
  problem: z.string().default(""),
  role: z.string().default(""),
  decisions: z.array(z.string()).default([]),
  modalities: z.array(z.string()).default([]),
  process: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  media: z.array(mediaSchema).default([]),
  locale_json: z
    .object({
      zh: localeCopySchema.optional(),
      en: localeCopySchema.optional(),
    })
    .default({}),
  seo_title: z.string().max(180).optional().nullable(),
  seo_description: z.string().max(400).optional().nullable(),
  github_url: z.string().optional().nullable(),
  github_owner: z.string().optional().nullable(),
  github_repo: z.string().optional().nullable(),
  github_branch: z.string().optional().nullable(),
  github_sync_enabled: z.boolean().default(true),
  github_sync_status: z.enum(INTEGRATION_STATUSES).default("not_configured"),
  github_last_synced_at: z.string().optional().nullable(),
  github_metadata: githubMetadataSchema.optional().nullable(),
  github_readme: z.string().optional().nullable(),
  github_file_tree: z.array(githubTreeNodeSchema).optional().nullable(),
  github_languages: z.record(z.string(), z.number()).optional().nullable(),
  github_topics: z.array(z.string()).optional().nullable(),
  github_latest_commit: githubCommitSchema.optional().nullable(),
  live_demo_url: z.string().optional().nullable(),
  live_demo_label: z.string().optional().nullable(),
  live_demo_type: z.enum(LIVE_DEMO_TYPES).optional().nullable(),
  live_demo_embed_enabled: z.boolean().default(false),
  live_demo_last_verified_at: z.string().optional().nullable(),
  live_demo_status: z.enum(INTEGRATION_STATUSES).default("not_configured"),
  live_demo_error: z.string().optional().nullable(),
  canva_share_url: z.string().optional().nullable(),
  canva_embed_url: z.string().optional().nullable(),
  canva_design_id: z.string().optional().nullable(),
  canva_page_ids: z.array(z.string()).optional().nullable(),
  canva_thumbnail_url: z.string().optional().nullable(),
  canva_status: z.enum(INTEGRATION_STATUSES).default("not_configured"),
  canva_last_synced_at: z.string().optional().nullable(),
  canva_alt: z.string().optional().nullable(),
  canva_caption: z.string().optional().nullable(),
  canva_error: z.string().optional().nullable(),
  experience_mode: z.enum(EXPERIENCE_MODES).optional().nullable(),
  experience_config: experienceConfigSchema,
  interaction_steps: z.array(z.string()).default([]),
  source_evidence: z.array(sourceEvidenceSchema).default([]),
});

export const projectPatchSchema = projectInputSchema.partial().extend({
  id: z.string().min(1),
});

export const archiveInputSchema = z.object({
  slug: z.string().min(1).max(80),
  title: z.string().min(1),
  kind: z.string().min(1),
  year: z.string().min(1),
  summary: z.string().default(""),
  media: mediaSchema.optional().nullable(),
  href: z.string().optional().nullable(),
  origin_note: z.string().default(""),
  publication_status: z.enum(PUBLICATION_STATUSES).default("published"),
  sort_order: z.number().int().min(0).max(9999).default(0),
  canva_share_url: z.string().optional().nullable(),
  canva_embed_url: z.string().optional().nullable(),
  canva_design_id: z.string().optional().nullable(),
  canva_page_ids: z.array(z.string()).optional().nullable(),
  canva_thumbnail_url: z.string().optional().nullable(),
  canva_status: z.enum(INTEGRATION_STATUSES).default("not_configured"),
  canva_alt: z.string().optional().nullable(),
  canva_caption: z.string().optional().nullable(),
});

export const siteSettingsSchema = z.object({
  name_zh: z.string().min(1),
  name_en: z.string().min(1),
  person: z.string().min(1),
  role: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  narrative: z.string().min(1),
  email: z.string().min(1),
  github: z.string().min(1),
  github_handle: z.string().min(1),
  location: z.string().min(1),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  homepage_json: homepageJsonSchema,
  locale_json: siteLocaleSchema,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectPatch = z.infer<typeof projectPatchSchema>;
export type ArchiveInput = z.infer<typeof archiveInputSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SourceEvidence = z.infer<typeof sourceEvidenceSchema>;
export type ProjectMedia = z.infer<typeof mediaSchema>;
export type ExperienceConfig = z.infer<typeof experienceConfigSchema>;
export type LocaleCopy = z.infer<typeof localeCopySchema>;
export type GithubMetadata = z.infer<typeof githubMetadataSchema>;

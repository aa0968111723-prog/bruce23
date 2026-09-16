import { z } from "zod";
import {
  EXPERIENCE_MODES,
  INTEGRATION_STATUSES,
  LIVE_DEMO_TYPES,
  PRODUCT_STATUSES,
  PROJECT_CATEGORIES,
  PUBLICATION_STATUSES,
} from "./constants.ts";

const emptyToUndef = (value: unknown) => {
  if (value === "" || value === null) return undefined;
  return value;
};

export const optionalHttpsUrl = z.preprocess(
  emptyToUndef,
  z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "must be https")
    .optional(),
);

export const mediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  kind: z.enum(["image", "video"]),
  caption: z.string().optional(),
  poster: z.string().optional(),
});

export const sourceEvidenceSchema = z.object({
  label: z.string().min(1),
  href: optionalHttpsUrl,
  note: z.string().min(1),
  kind: z.enum(["github", "canva", "demo", "other"]).optional(),
});

export const fileTreeNodeSchema: z.ZodType<FileTreeNode> = z.lazy(() =>
  z.object({
    path: z.string(),
    type: z.enum(["file", "dir"]),
    purpose: z.string().optional(),
    stage: z.string().optional(),
    children: z.array(fileTreeNodeSchema).optional(),
  }),
);

export type FileTreeNode = {
  path: string;
  type: "file" | "dir";
  purpose?: string;
  stage?: string;
  children?: FileTreeNode[];
};

export const githubCommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  htmlUrl: z.string(),
  date: z.string().optional(),
  author: z.string().optional(),
});

export const githubMetadataSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  htmlUrl: z.string(),
  defaultBranch: z.string(),
  updatedAt: z.string(),
  private: z.boolean(),
  archived: z.boolean().optional(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
});

export const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogAlt: z.string().optional(),
});

export const experienceConfigSchema = z.object({
  showcaseLabel: z.string().optional(),
  isProduct: z.boolean().optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        githubPath: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  steps: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
      }),
    )
    .optional(),
  filePurpose: z.record(z.string(), z.string()).optional(),
  pipelineStage: z.record(z.string(), z.string()).optional(),
});

export const projectWriteSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  title: z.string().min(1).max(120),
  title_en: z.string().optional(),
  subtitle: z.string().max(200).default(""),
  subtitle_en: z.string().optional(),
  category: z.enum(PROJECT_CATEGORIES),
  year: z.string().min(1).max(32),
  product_status: z.enum(PRODUCT_STATUSES),
  publication_status: z.enum(PUBLICATION_STATUSES).optional(),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
  summary: z.string().default(""),
  summary_en: z.string().optional(),
  problem: z.string().default(""),
  problem_en: z.string().optional(),
  role: z.string().default(""),
  role_en: z.string().optional(),
  decisions: z.array(z.string()).default([]),
  modalities: z.array(z.string()).default([]),
  process: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  media: z.array(mediaSchema).default([]),
  source_evidence: z.array(sourceEvidenceSchema).default([]),
  seo: seoSchema.optional(),
  github_url: optionalHttpsUrl,
  github_owner: z.string().optional(),
  github_repo: z.string().optional(),
  github_branch: z.string().optional(),
  github_sync_enabled: z.boolean().default(true),
  live_demo_url: optionalHttpsUrl,
  live_demo_label: z.string().optional(),
  live_demo_type: z.enum(LIVE_DEMO_TYPES).optional(),
  live_demo_embed_enabled: z.boolean().default(false),
  canva_share_url: optionalHttpsUrl,
  canva_embed_url: optionalHttpsUrl,
  canva_design_id: z.string().optional(),
  canva_page_ids: z.array(z.string()).default([]),
  canva_thumbnail_url: z.string().optional(),
  canva_alt: z.string().optional(),
  canva_caption: z.string().optional(),
  experience_mode: z.enum(EXPERIENCE_MODES).default("github-explorer"),
  experience_config: experienceConfigSchema.default({}),
  interaction_steps: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
      }),
    )
    .default([]),
  experience_label: z.string().optional(),
});

export type ProjectWrite = z.infer<typeof projectWriteSchema>;
export type ExperienceConfig = z.infer<typeof experienceConfigSchema>;

export const siteSettingsSchema = z.object({
  profile: z.object({
    nameZh: z.string(),
    nameEn: z.string(),
    person: z.string(),
    role: z.string(),
    headline: z.string(),
    headlineEn: z.string().optional(),
    subhead: z.string(),
    narrative: z.string(),
    narrativeEn: z.string().optional(),
    email: z.string().email(),
    github: z.string(),
    githubHandle: z.string(),
    location: z.string(),
  }),
  homepage: z.object({
    featuredIntro: z.string().optional(),
    featuredIntroEn: z.string().optional(),
    processTitle: z.string().optional(),
  }),
  seo: seoSchema,
  i18n: z
    .object({
      defaultLocale: z.enum(["zh", "en"]).default("zh"),
    })
    .default({ defaultLocale: "zh" }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const archiveWriteSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  kind: z.enum([
    "photography",
    "graphic",
    "social",
    "event",
    "video",
    "club-visual",
    "interactive",
  ]),
  year: z.string().min(1),
  summary: z.string().default(""),
  media: mediaSchema.optional(),
  href: optionalHttpsUrl,
  origin_note: z.string().default(""),
  canva_share_url: optionalHttpsUrl,
  canva_embed_url: optionalHttpsUrl,
  publication_status: z.enum(PUBLICATION_STATUSES).default("published"),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export type ArchiveWrite = z.infer<typeof archiveWriteSchema>;

export const integrationStatusSchema = z.enum(INTEGRATION_STATUSES);

export const idSchema = z.object({ id: z.string().min(1) });
export const slugSchema = z.object({ slug: z.string().min(1) });
export const previewQuerySchema = z.object({
  slug: z.string().min(1),
  previewDraft: z.boolean().optional(),
});

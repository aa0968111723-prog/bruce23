import { z } from "zod";

export const productStatusSchema = z.enum([
  "completed",
  "in-progress",
  "prototype",
  "concept",
  "planned",
]);

export const publicationStatusSchema = z.enum([
  "draft",
  "published",
  "unpublished",
  "archived",
]);

export const projectCategorySchema = z.enum([
  "AI Product",
  "Multimodal",
  "Interaction",
  "Visual AI",
  "Spatial Design",
  "Creative Tool",
  "Real-world Experience",
]);

export const experienceModeSchema = z.enum([
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
]);

export const integrationStatusSchema = z.enum([
  "connected",
  "pending",
  "unavailable",
  "failed",
  "not_configured",
  "verified",
  "stale",
]);

export const liveDemoTypeSchema = z.enum(["iframe", "link", "none"]).optional();

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
  kind: z.enum(["github", "canva", "demo", "readme", "other"]).optional(),
  path: z.string().optional(),
});

export const fileTreeNodeSchema: z.ZodType<FileTreeNode> = z.lazy(() =>
  z.object({
    path: z.string(),
    type: z.enum(["file", "dir"]),
    purpose: z.string().optional(),
    stage: z.string().optional(),
    githubUrl: z.string().optional(),
    children: z.array(fileTreeNodeSchema).optional(),
  }),
);

export type FileTreeNode = {
  path: string;
  type: "file" | "dir";
  purpose?: string;
  stage?: string;
  githubUrl?: string;
  children?: FileTreeNode[];
};

export const latestCommitSchema = z
  .object({
    sha: z.string(),
    message: z.string(),
    committedAt: z.string().optional(),
    htmlUrl: z.string().optional(),
  })
  .nullable()
  .optional();

export const projectMutationSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能是小寫英文、數字與連字號"),
  title: z.string().min(1).max(160),
  title_en: z.string().max(160).optional().nullable(),
  subtitle: z.string().max(240).optional().default(""),
  subtitle_en: z.string().max(240).optional().nullable(),
  summary: z.string().max(4000).optional().default(""),
  summary_en: z.string().max(4000).optional().nullable(),
  problem: z.string().max(8000).optional().default(""),
  role: z.string().max(4000).optional().default(""),
  decisions: z.array(z.string()).optional().default([]),
  modalities: z.array(z.string()).optional().default([]),
  process: z.array(z.string()).optional().default([]),
  outputs: z.array(z.string()).optional().default([]),
  stack: z.array(z.string()).optional().default([]),
  limitations: z.array(z.string()).optional().default([]),
  category: projectCategorySchema,
  year: z.string().max(32).optional().default(""),
  product_status: productStatusSchema,
  publication_status: publicationStatusSchema.optional(),
  featured: z.boolean().optional().default(false),
  sort_order: z.number().int().optional().default(0),
  cover_image: z.string().optional().nullable(),
  media: z.array(mediaSchema).optional().default([]),
  video_url: z.string().optional().nullable(),
  github_url: z.string().optional().nullable(),
  github_owner: z.string().optional().nullable(),
  github_repo: z.string().optional().nullable(),
  github_branch: z.string().optional().nullable(),
  github_sync_enabled: z.boolean().optional().default(false),
  github_public_approved: z.boolean().optional().default(true),
  live_demo_url: z.string().optional().nullable(),
  live_demo_label: z.string().optional().nullable(),
  live_demo_type: liveDemoTypeSchema,
  live_demo_embed_enabled: z.boolean().optional().default(false),
  canva_share_url: z.string().optional().nullable(),
  canva_embed_url: z.string().optional().nullable(),
  canva_design_id: z.string().optional().nullable(),
  canva_page_ids: z.array(z.string()).optional().nullable(),
  canva_thumbnail_url: z.string().optional().nullable(),
  canva_alt: z.string().optional().nullable(),
  canva_caption: z.string().optional().nullable(),
  experience_mode: experienceModeSchema,
  experience_config: z.record(z.string(), z.unknown()).optional().default({}),
  interaction_steps: z.array(z.unknown()).optional().default([]),
  source_evidence: z.array(sourceEvidenceSchema).optional().default([]),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional()
    .default({}),
  copy_zh: z.record(z.string(), z.unknown()).optional().default({}),
  copy_en: z.record(z.string(), z.unknown()).optional().default({}),
});

export const siteSettingsSchema = z.object({
  profile: z.object({
    nameZh: z.string().min(1),
    nameEn: z.string().min(1),
    person: z.string().min(1),
    role: z.string().min(1),
    headline: z.string().min(1),
    subhead: z.string().optional().default(""),
    narrative: z.string().optional().default(""),
    email: z.string().email(),
    github: z.string().url(),
    location: z.string().optional().default(""),
  }),
  homepage: z.object({
    explorationTitle: z.string().optional().default(""),
    explorationBody: z.string().optional().default(""),
  }),
  seo: z.object({
    title: z.string().optional().default(""),
    description: z.string().optional().default(""),
  }),
  i18n: z.record(z.string(), z.unknown()).optional().default({}),
});

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export type ExperienceMode = z.infer<typeof experienceModeSchema>;
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;
export type ProjectMutation = z.infer<typeof projectMutationSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

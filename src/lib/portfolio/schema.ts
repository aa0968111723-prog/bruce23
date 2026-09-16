import { z } from "zod";
import type { JsonValue } from "./types";

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const jsonObjectSchema = z.record(z.string(), jsonValueSchema);

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

const emptyToUndef = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const optionalHttpsUrl = z.preprocess(
  emptyToUndef,
  z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), "Only https URLs are allowed")
    .optional(),
);

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case");

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
  kind: z.enum(["github", "canva", "demo", "readme", "other"]).optional(),
});

export const interactionStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  githubPath: z.string().optional(),
  workflowStage: z.string().optional(),
});

export const projectWriteSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().max(200).default(""),
  category: projectCategorySchema,
  year: z.string().max(40).default(""),
  productStatus: productStatusSchema,
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
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
  sourceEvidence: z.array(sourceEvidenceSchema).default([]),
  localeZh: jsonObjectSchema.default({}),
  localeEn: jsonObjectSchema.default({}),
  seoTitle: z.string().max(80).nullable().optional(),
  seoDescription: z.string().max(200).nullable().optional(),
  githubUrl: optionalHttpsUrl,
  githubOwner: z.string().max(100).optional(),
  githubRepo: z.string().max(100).optional(),
  githubBranch: z.string().max(200).optional(),
  githubSyncEnabled: z.boolean().default(false),
  liveDemoUrl: optionalHttpsUrl,
  liveDemoLabel: z.string().max(80).optional(),
  liveDemoType: z.enum(["iframe", "link", "none"]).optional(),
  liveDemoEmbedEnabled: z.boolean().default(false),
  canvaShareUrl: optionalHttpsUrl,
  canvaEmbedUrl: optionalHttpsUrl,
  canvaDesignId: z.string().max(120).optional(),
  canvaPageIds: z.array(z.string()).default([]),
  canvaThumbnailUrl: optionalHttpsUrl,
  canvaAlt: z.string().max(200).optional(),
  canvaDescription: z.string().max(400).optional(),
  experienceMode: experienceModeSchema.nullable().optional(),
  experienceConfig: jsonObjectSchema.default({}),
  interactionSteps: z.array(interactionStepSchema).default([]),
});

export const projectCreateSchema = projectWriteSchema.extend({
  publicationStatus: publicationStatusSchema.default("draft"),
});

export const projectUpdateSchema = projectWriteSchema.partial().extend({
  id: z.string().min(1),
});

export const publicationActionSchema = z.object({
  id: z.string().min(1),
  note: z.string().max(200).optional(),
});

export const siteSettingsWriteSchema = z.object({
  nameZh: z.string().min(1).max(80),
  nameEn: z.string().min(1).max(80),
  person: z.string().min(1).max(80),
  role: z.string().max(160),
  headline: z.string().max(200),
  subhead: z.string().max(240),
  narrative: z.string().max(800),
  email: z.string().email(),
  github: z.string().url(),
  githubHandle: z.string().max(80),
  location: z.string().max(80),
  seoTitle: z.string().max(80).nullable().optional(),
  seoDescription: z.string().max(200).nullable().optional(),
  homepageContent: jsonObjectSchema.default({}),
  localeZh: jsonObjectSchema.default({}),
  localeEn: jsonObjectSchema.default({}),
});

export const archiveWriteSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1).max(120),
  kind: z.enum([
    "photography",
    "graphic",
    "social",
    "event",
    "video",
    "club-visual",
    "interactive",
  ]),
  year: z.string().max(40).default(""),
  summary: z.string().default(""),
  media: mediaSchema.optional(),
  href: optionalHttpsUrl,
  originNote: z.string().default(""),
  publicationStatus: publicationStatusSchema.default("draft"),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  canvaShareUrl: optionalHttpsUrl,
  canvaEmbedUrl: optionalHttpsUrl,
  canvaDesignId: z.string().max(120).optional(),
  canvaThumbnailUrl: optionalHttpsUrl,
});

export type ProjectWrite = z.infer<typeof projectWriteSchema>;
export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type SiteSettingsWrite = z.infer<typeof siteSettingsWriteSchema>;
export type ArchiveWrite = z.infer<typeof archiveWriteSchema>;

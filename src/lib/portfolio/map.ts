import type { ProjectWrite } from "./schema.ts";
import type { ProjectRow } from "./public.ts";
import { asArray, asObject } from "./public.ts";
import type { ExperienceMode } from "./constants.ts";

export function rowToWrite(row: ProjectRow): ProjectWrite {
  return {
    slug: String(row.slug),
    title: String(row.title),
    title_en: (row.title_en as string | undefined) ?? undefined,
    subtitle: String(row.subtitle ?? ""),
    subtitle_en: (row.subtitle_en as string | undefined) ?? undefined,
    category: row.category as ProjectWrite["category"],
    year: String(row.year),
    product_status: row.product_status as ProjectWrite["product_status"],
    publication_status: row.publication_status as ProjectWrite["publication_status"],
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order ?? 0),
    summary: String(row.summary ?? ""),
    summary_en: (row.summary_en as string | undefined) ?? undefined,
    problem: String(row.problem ?? ""),
    problem_en: (row.problem_en as string | undefined) ?? undefined,
    role: String(row.role ?? ""),
    role_en: (row.role_en as string | undefined) ?? undefined,
    decisions: asArray<string>(row.decisions_json),
    modalities: asArray<string>(row.modalities_json),
    process: asArray<string>(row.process_json),
    outputs: asArray<string>(row.outputs_json),
    stack: asArray<string>(row.stack_json),
    limitations: asArray<string>(row.limitations_json),
    media: asArray(row.media_json),
    source_evidence: asArray(row.source_evidence),
    seo: asObject(row.seo_json),
    github_url: (row.github_url as string | undefined) ?? undefined,
    github_owner: (row.github_owner as string | undefined) ?? undefined,
    github_repo: (row.github_repo as string | undefined) ?? undefined,
    github_branch: (row.github_branch as string | undefined) ?? undefined,
    github_sync_enabled: Boolean(row.github_sync_enabled),
    live_demo_url: (row.live_demo_url as string | undefined) ?? undefined,
    live_demo_label: (row.live_demo_label as string | undefined) ?? undefined,
    live_demo_type: (row.live_demo_type as ProjectWrite["live_demo_type"]) ?? undefined,
    live_demo_embed_enabled: Boolean(row.live_demo_embed_enabled),
    canva_share_url: (row.canva_share_url as string | undefined) ?? undefined,
    canva_embed_url: (row.canva_embed_url as string | undefined) ?? undefined,
    canva_design_id: (row.canva_design_id as string | undefined) ?? undefined,
    canva_page_ids: asArray<string>(row.canva_page_ids),
    canva_thumbnail_url: (row.canva_thumbnail_url as string | undefined) ?? undefined,
    canva_alt: (row.canva_alt as string | undefined) ?? undefined,
    canva_caption: (row.canva_caption as string | undefined) ?? undefined,
    experience_mode: (row.experience_mode as ExperienceMode) ?? "github-explorer",
    experience_config: asObject(row.experience_config),
    interaction_steps: asArray(row.interaction_steps),
    experience_label: (row.experience_label as string | undefined) ?? undefined,
  };
}

export function integrationSummary(row: ProjectRow) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    publication_status: String(row.publication_status),
    experience_mode: String(row.experience_mode),
    github: {
      url: row.github_url ?? null,
      public: asObject(row.github_metadata).private !== true,
      status: String(row.github_sync_status ?? "not_configured"),
      lastSyncedAt: row.github_last_synced_at ?? null,
      error: row.github_sync_error ?? null,
    },
    canva: {
      status: String(row.canva_status ?? "not_configured"),
      lastSyncedAt: row.canva_last_synced_at ?? null,
      error: row.canva_error ?? null,
      embedUrl: row.canva_embed_url ?? null,
    },
    demo: {
      status: String(row.live_demo_status ?? "not_configured"),
      lastVerifiedAt: row.live_demo_last_verified_at ?? null,
      error: row.live_demo_error ?? null,
      url: row.live_demo_url ?? null,
      embedEnabled: Boolean(row.live_demo_embed_enabled),
    },
    showExperience: Boolean(row.experience_mode),
  };
}

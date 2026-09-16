import { GITHUB_AUTO_FIELDS } from "./constants.ts";

export const INTEGRATION_PATCH_KEYS = new Set<string>([
  ...GITHUB_AUTO_FIELDS,
  "github_url",
  "github_sync_error",
  "live_demo_status",
  "live_demo_last_verified_at",
  "live_demo_error",
  "live_demo_url",
  "live_demo_label",
  "live_demo_type",
  "live_demo_embed_enabled",
  "canva_share_url",
  "canva_embed_url",
  "canva_design_id",
  "canva_page_ids",
  "canva_thumbnail_url",
  "canva_status",
  "canva_last_synced_at",
  "canva_error",
  "canva_alt",
  "canva_caption",
  "experience_mode",
  "experience_label",
]);

export function isSafeSqlIdent(key: string): boolean {
  return /^[a-z_][a-z0-9_]*$/.test(key);
}

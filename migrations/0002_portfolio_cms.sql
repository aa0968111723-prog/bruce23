-- Luminous Studio portfolio CMS.
-- product_status (work maturity) and publication_status (draft/public) are
-- separate columns and must stay that way.

create table if not exists site_settings (
  id text primary key,
  profile_json jsonb not null default '{}'::jsonb,
  homepage_json jsonb not null default '{}'::jsonb,
  seo_json jsonb not null default '{}'::jsonb,
  i18n_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists projects (
  id text primary key,
  slug text not null unique,
  title text not null,
  title_en text,
  subtitle text not null default '',
  subtitle_en text,
  category text not null,
  year text not null,
  product_status text not null,
  publication_status text not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  summary text not null default '',
  summary_en text,
  problem text not null default '',
  problem_en text,
  role text not null default '',
  role_en text,
  decisions_json jsonb not null default '[]'::jsonb,
  modalities_json jsonb not null default '[]'::jsonb,
  process_json jsonb not null default '[]'::jsonb,
  outputs_json jsonb not null default '[]'::jsonb,
  stack_json jsonb not null default '[]'::jsonb,
  limitations_json jsonb not null default '[]'::jsonb,
  media_json jsonb not null default '[]'::jsonb,
  source_evidence jsonb not null default '[]'::jsonb,
  seo_json jsonb not null default '{}'::jsonb,
  copy_i18n jsonb not null default '{}'::jsonb,

  github_url text,
  github_owner text,
  github_repo text,
  github_branch text,
  github_sync_enabled boolean not null default true,
  github_sync_status text not null default 'not_configured',
  github_last_synced_at timestamptz,
  github_sync_error text,
  github_metadata jsonb,
  github_readme text,
  github_file_tree jsonb,
  github_languages jsonb,
  github_topics jsonb,
  github_latest_commit jsonb,

  live_demo_url text,
  live_demo_label text,
  live_demo_type text,
  live_demo_embed_enabled boolean not null default false,
  live_demo_last_verified_at timestamptz,
  live_demo_status text not null default 'not_configured',
  live_demo_error text,

  canva_share_url text,
  canva_embed_url text,
  canva_design_id text,
  canva_page_ids jsonb not null default '[]'::jsonb,
  canva_thumbnail_url text,
  canva_status text not null default 'not_configured',
  canva_last_synced_at timestamptz,
  canva_alt text,
  canva_caption text,
  canva_error text,

  experience_mode text not null default 'github-explorer',
  experience_config jsonb not null default '{}'::jsonb,
  interaction_steps jsonb not null default '[]'::jsonb,
  experience_label text,

  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz
);

create index if not exists projects_publication_idx
  on projects (publication_status, sort_order);
create index if not exists projects_featured_idx
  on projects (featured, sort_order);
create index if not exists projects_slug_pub_idx
  on projects (slug, publication_status);

create table if not exists project_revisions (
  id text primary key,
  project_id text not null references projects (id) on delete cascade,
  snapshot jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists project_revisions_project_idx
  on project_revisions (project_id, created_at desc);

create table if not exists archive_items (
  id text primary key,
  title text not null,
  kind text not null,
  year text not null,
  summary text not null default '',
  media_json jsonb,
  href text,
  origin_note text not null default '',
  canva_share_url text,
  canva_embed_url text,
  publication_status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists archive_items_pub_idx
  on archive_items (publication_status, sort_order);

create table if not exists http_cache (
  cache_key text primary key,
  etag text,
  last_modified text,
  body text,
  status_code integer,
  fetched_at timestamptz not null default now()
);

create table if not exists integration_secrets (
  id text primary key,
  kind text not null,
  ciphertext text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists canva_connect_status (
  id text primary key,
  status text not null default 'not_configured',
  account_label text,
  last_synced_at timestamptz,
  last_error text
);

create table if not exists seed_ledger (
  name text primary key,
  applied_at timestamptz not null default now()
);

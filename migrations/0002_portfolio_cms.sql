-- Luminous Studio portfolio CMS. Do not edit migrations/auth/0001_auth.sql.
-- Public queries must filter publication_status = 'published'.

create table if not exists site_settings (
  id text primary key,
  profile jsonb not null default '{}'::jsonb,
  homepage jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  i18n jsonb not null default '{}'::jsonb,
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
  summary text not null default '',
  summary_en text,
  problem text not null default '',
  role text not null default '',
  decisions jsonb not null default '[]'::jsonb,
  modalities jsonb not null default '[]'::jsonb,
  process jsonb not null default '[]'::jsonb,
  outputs jsonb not null default '[]'::jsonb,
  stack jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  category text not null,
  year text not null default '',
  product_status text not null default 'prototype',
  publication_status text not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  cover_image text,
  media jsonb not null default '[]'::jsonb,
  video_url text,
  github_url text,
  github_owner text,
  github_repo text,
  github_branch text,
  github_sync_enabled boolean not null default false,
  github_sync_status text not null default 'not_configured',
  github_last_synced_at timestamptz,
  github_metadata jsonb,
  github_readme text,
  github_file_tree jsonb,
  github_languages jsonb,
  github_topics jsonb,
  github_latest_commit jsonb,
  github_is_private boolean not null default false,
  github_public_approved boolean not null default true,
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
  canva_page_ids jsonb,
  canva_thumbnail_url text,
  canva_alt text,
  canva_caption text,
  canva_status text not null default 'not_configured',
  canva_last_synced_at timestamptz,
  canva_error text,
  experience_mode text not null default 'media-gallery',
  experience_config jsonb not null default '{}'::jsonb,
  interaction_steps jsonb not null default '[]'::jsonb,
  source_evidence jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  copy_zh jsonb not null default '{}'::jsonb,
  copy_en jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text
);

create index if not exists projects_publication_idx
  on projects (publication_status, sort_order, featured);
create index if not exists projects_slug_pub_idx
  on projects (slug, publication_status);

create table if not exists project_revisions (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
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
  year text not null default '',
  summary text not null default '',
  media jsonb,
  href text,
  origin_note text not null default '',
  publication_status text not null default 'published',
  sort_order integer not null default 0,
  canva_share_url text,
  canva_embed_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists archive_publication_idx
  on archive_items (publication_status, sort_order);

create table if not exists cms_seed_log (
  name text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists http_cache (
  cache_key text primary key,
  etag text,
  last_modified text,
  body jsonb,
  status integer,
  fetched_at timestamptz not null default now()
);

-- Encrypted OAuth / integration payloads. Never selected by public queries.
create table if not exists integration_secrets (
  id text primary key,
  kind text not null,
  payload_encrypted text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

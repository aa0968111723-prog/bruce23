-- Portfolio CMS: published public rows + admin-scoped writes.
-- product_status (prototype/in-progress/…) and publication_status (draft/published/…) are separate.

create table if not exists site_settings (
  id text primary key default 'default',
  owner_user_id text,
  name_zh text not null default '',
  name_en text not null default '',
  person text not null default '',
  role text not null default '',
  headline text not null default '',
  subhead text not null default '',
  narrative text not null default '',
  email text not null default '',
  github text not null default '',
  github_handle text not null default '',
  location text not null default '',
  seo_title text,
  seo_description text,
  homepage_content jsonb not null default '{}'::jsonb,
  locale_zh jsonb not null default '{}'::jsonb,
  locale_en jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id text primary key,
  slug text not null unique,
  owner_user_id text,
  title text not null,
  subtitle text not null default '',
  category text not null,
  year text not null default '',
  product_status text not null default 'prototype',
  featured boolean not null default false,
  sort_order integer not null default 0,
  summary text not null default '',
  problem text not null default '',
  role text not null default '',
  decisions jsonb not null default '[]'::jsonb,
  modalities jsonb not null default '[]'::jsonb,
  process jsonb not null default '[]'::jsonb,
  outputs jsonb not null default '[]'::jsonb,
  stack jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  media jsonb not null default '[]'::jsonb,
  source_evidence jsonb not null default '[]'::jsonb,
  locale_zh jsonb not null default '{}'::jsonb,
  locale_en jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  publication_status text not null default 'draft',
  published_at timestamptz,
  archived_at timestamptz,
  github_url text,
  github_owner text,
  github_repo text,
  github_branch text,
  github_sync_enabled boolean not null default false,
  github_sync_status text not null default 'not_configured',
  github_last_synced_at timestamptz,
  github_sync_error text,
  github_metadata jsonb,
  github_readme text,
  github_readme_summary text,
  github_file_tree jsonb,
  github_languages jsonb,
  github_topics jsonb,
  github_latest_commit jsonb,
  github_is_private boolean not null default false,
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
  canva_status text not null default 'not_configured',
  canva_last_synced_at timestamptz,
  canva_alt text,
  canva_description text,
  canva_error text,
  experience_mode text,
  experience_config jsonb not null default '{}'::jsonb,
  interaction_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_publication_idx
  on projects (publication_status, featured desc, sort_order, title);
create index if not exists projects_owner_idx on projects (owner_user_id);

create table if not exists project_revisions (
  id text primary key,
  project_id text not null references projects (id) on delete cascade,
  editor_user_id text not null,
  snapshot jsonb not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists project_revisions_project_idx
  on project_revisions (project_id, created_at desc);

create table if not exists archive_items (
  id text primary key,
  owner_user_id text,
  title text not null,
  kind text not null,
  year text,
  summary text,
  media jsonb,
  href text,
  origin_note text,
  publication_status text not null default 'draft',
  sort_order integer not null default 0,
  canva_share_url text,
  canva_embed_url text,
  canva_design_id text,
  canva_thumbnail_url text,
  canva_status text not null default 'not_configured',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists archive_publication_idx
  on archive_items (publication_status, sort_order);

create table if not exists github_http_cache (
  cache_key text primary key,
  etag text,
  last_modified text,
  payload jsonb,
  status_code integer,
  fetched_at timestamptz not null default now()
);

create table if not exists integration_secrets (
  id text primary key,
  owner_user_id text not null,
  provider text not null,
  encrypted_payload text not null,
  status text not null default 'not_configured',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, provider)
);

create table if not exists cms_seed_log (
  seed_key text primary key,
  applied_at timestamptz not null default now()
);

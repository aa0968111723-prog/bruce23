-- Portfolio CMS: published public site + private admin.
-- product_status (work maturity) and publication_status (draft/published/archived)
-- are separate columns and must stay that way.

create table if not exists cms_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id text primary key,
  name_zh text not null,
  name_en text not null,
  person text not null,
  role text not null,
  headline text not null,
  subhead text not null,
  narrative text not null,
  email text not null,
  github text not null,
  github_handle text not null,
  location text not null,
  seo_title text,
  seo_description text,
  homepage_json jsonb not null default '{}'::jsonb,
  locale_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists projects (
  id text primary key,
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  category text not null,
  year text not null,
  product_status text not null,
  publication_status text not null,
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
  locale_json jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  github_url text,
  github_owner text,
  github_repo text,
  github_branch text,
  github_sync_enabled boolean not null default true,
  github_sync_status text not null default 'not_configured',
  github_last_synced_at timestamptz,
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
  canva_page_ids jsonb,
  canva_thumbnail_url text,
  canva_status text not null default 'not_configured',
  canva_last_synced_at timestamptz,
  canva_alt text,
  canva_caption text,
  canva_error text,
  experience_mode text,
  experience_config jsonb not null default '{}'::jsonb,
  interaction_steps jsonb not null default '[]'::jsonb,
  source_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text,
  published_at timestamptz
);

create index if not exists projects_publication_sort_idx
  on projects (publication_status, featured desc, sort_order asc, title asc);
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
  slug text not null unique,
  title text not null,
  kind text not null,
  year text not null,
  summary text not null default '',
  media jsonb,
  href text,
  origin_note text not null default '',
  publication_status text not null default 'published',
  sort_order integer not null default 0,
  canva_share_url text,
  canva_embed_url text,
  canva_design_id text,
  canva_page_ids jsonb,
  canva_thumbnail_url text,
  canva_status text not null default 'not_configured',
  canva_alt text,
  canva_caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists archive_publication_sort_idx
  on archive_items (publication_status, sort_order asc);

create table if not exists integration_secrets (
  id text primary key,
  provider text not null,
  ciphertext text not null,
  iv text not null,
  last_status text,
  last_sync_at timestamptz,
  meta_json jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists github_http_cache (
  cache_key text primary key,
  etag text,
  last_modified text,
  body text,
  status integer,
  fetched_at timestamptz not null default now()
);

-- Archive locale overlays (titles, summaries, captions). 0002 stays intact.
alter table archive_items
  add column if not exists locale_json jsonb not null default '{}'::jsonb;

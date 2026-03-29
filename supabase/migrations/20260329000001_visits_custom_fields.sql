-- Add custom_fields jsonb to visits to support configurable visit fields
alter table public.visits
  add column if not exists custom_fields jsonb not null default '{}';

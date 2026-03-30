-- Stores confirmed AI-generated handoff summaries for clients.
-- One row per client (upserted on regenerate). Staff must explicitly confirm before a summary is written here.
create table if not exists public.client_summaries (
  id                          uuid primary key default gen_random_uuid(),
  client_id                   uuid not null unique references public.clients(id) on delete cascade,
  summary_text                text not null,
  generated_at                timestamptz not null default now(),
  confirmed_by                uuid references auth.users(id),
  confirmed_at                timestamptz,
  visit_count_at_generation   int not null default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table public.client_summaries enable row level security;

create policy "authenticated users can read client summaries"
  on public.client_summaries for select
  to authenticated using (true);

create policy "authenticated users can insert client summaries"
  on public.client_summaries for insert
  to authenticated with check (true);

create policy "authenticated users can update client summaries"
  on public.client_summaries for update
  to authenticated using (true);

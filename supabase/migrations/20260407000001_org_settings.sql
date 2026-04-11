-- ============================================================
-- Org Settings — single-row configuration for the nonprofit
-- Enables the "Nonprofit-in-a-Box" setup wizard.
-- ============================================================

create table public.org_settings (
  id              uuid        primary key default gen_random_uuid(),
  org_name        text        not null default 'My Nonprofit',
  org_mission     text        not null default '',
  contact_email   text        not null default '',
  org_logo_url    text,
  primary_color   text        not null default '#F2673C',
  secondary_color text        not null default '#8B5CF6',
  setup_complete  boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Enforce single-row constraint
create unique index org_settings_singleton on public.org_settings ((true));

alter table public.org_settings enable row level security;

-- All authenticated users can read org settings (needed for branding in layout)
create policy "org_settings: authenticated read"
  on public.org_settings for select
  to authenticated
  using (true);

-- Only admins can update org settings
create policy "org_settings: admin update"
  on public.org_settings for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can insert (initial setup)
create policy "org_settings: admin insert"
  on public.org_settings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-update updated_at
create or replace function public.set_org_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger org_settings_updated_at
  before update on public.org_settings
  for each row execute function public.set_org_settings_updated_at();

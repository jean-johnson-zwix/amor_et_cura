-- ============================================================
-- Amor et Cura — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('admin', 'case_worker', 'read_only');

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  role         user_role not null default 'case_worker',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile; admins can read all
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- SERVICE TYPES (admin-configurable lookup)
-- ============================================================

create table public.service_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.service_types enable row level security;

create policy "service_types: all authenticated read"
  on public.service_types for select
  using (auth.role() = 'authenticated');

create policy "service_types: admin write"
  on public.service_types for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- CLIENTS
-- ============================================================

create table public.clients (
  id              uuid primary key default gen_random_uuid(),
  client_number   text not null unique,  -- human-readable ID e.g. CLT-00042
  first_name      text not null,
  last_name       text not null,
  dob             date,
  phone           text,
  email           text,
  address         text,
  program         text,
  is_active       boolean not null default true,
  custom_fields   jsonb not null default '{}'::jsonb,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.clients enable row level security;

-- All authenticated users can view active clients
create policy "clients: authenticated read"
  on public.clients for select
  using (auth.role() = 'authenticated');

-- Admin and case workers can create
create policy "clients: staff create"
  on public.clients for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

-- Admin and case workers can update
create policy "clients: staff update"
  on public.clients for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

-- Only admins can hard-delete (soft-delete via is_active preferred)
create policy "clients: admin delete"
  on public.clients for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-increment client_number sequence
create sequence client_number_seq start 1;

create or replace function generate_client_number()
returns trigger language plpgsql as $$
begin
  new.client_number := 'CLT-' || lpad(nextval('client_number_seq')::text, 5, '0');
  return new;
end;
$$;

create trigger set_client_number
  before insert on public.clients
  for each row
  when (new.client_number is null or new.client_number = '')
  execute function generate_client_number();

-- ============================================================
-- VISITS
-- ============================================================

create table public.visits (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients(id) on delete cascade,
  case_worker_id   uuid not null references public.profiles(id),
  service_type_id  uuid references public.service_types(id),
  visit_date       date not null,
  duration_minutes int,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.visits enable row level security;

-- All authenticated users can view visits
create policy "visits: authenticated read"
  on public.visits for select
  using (auth.role() = 'authenticated');

-- Admin and case workers can create
create policy "visits: staff create"
  on public.visits for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

-- Admin can update any; case worker can update own
create policy "visits: update"
  on public.visits for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.role = 'case_worker' and public.visits.case_worker_id = auth.uid()))
    )
  );

-- Only admins can delete visits
create policy "visits: admin delete"
  on public.visits for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- AUDIT LOG
-- ============================================================

create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id),
  action       text not null,         -- CREATE, UPDATE, DELETE
  table_name   text not null,
  record_id    uuid not null,
  changed_fields text[],              -- field names only, no values (no PII)
  created_at   timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Only admins can view the audit log
create policy "audit_log: admin read"
  on public.audit_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- System (service role) writes to audit log
create policy "audit_log: service role insert"
  on public.audit_log for insert
  with check (true);

-- ============================================================
-- SEED: Default service types
-- ============================================================

insert into public.service_types (name) values
  ('Case Management'),
  ('Food Assistance'),
  ('Housing Support'),
  ('Medical Referral'),
  ('Mental Health Services'),
  ('Employment Support'),
  ('Child & Family Services'),
  ('Legal Aid Referral'),
  ('Transportation Assistance'),
  ('Education Support');

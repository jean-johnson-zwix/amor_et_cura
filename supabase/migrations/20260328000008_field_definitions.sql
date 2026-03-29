-- ============================================================
-- Configurable Field Definitions (P1 — issue #9)
-- Admins define custom fields that appear on client intake forms.
-- Field values are stored in clients.custom_fields (jsonb).
-- ============================================================

create table public.field_definitions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,        -- slug key, e.g. "emergency_contact"
  label        text not null,               -- display label, e.g. "Emergency Contact"
  field_type   text not null
                 check (field_type in ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
  options      text[],                      -- choices for select / multiselect
  required     boolean not null default false,
  applies_to   text not null default 'client'
                 check (applies_to in ('client', 'visit')),
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.field_definitions enable row level security;

-- All authenticated users can read (needed by intake forms and profile pages)
create policy "field_definitions: authenticated read"
  on public.field_definitions for select
  using (auth.role() = 'authenticated');

-- Only admins can write
create policy "field_definitions: admin write"
  on public.field_definitions for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed a few starter fields as examples
insert into public.field_definitions (name, label, field_type, applies_to, sort_order) values
  ('emergency_contact',  'Emergency Contact Name',   'text',    'client', 10),
  ('emergency_phone',    'Emergency Contact Phone',  'text',    'client', 20),
  ('insurance_provider', 'Insurance Provider',       'text',    'client', 30),
  ('referred_by',        'Referred By',              'select',  'client', 40),
  ('language_preference','Preferred Language',       'select',  'client', 50);

-- Set options for select fields
update public.field_definitions
  set options = array['Self', 'Family Member', 'Social Worker', 'Hospital', 'School', 'Other']
  where name = 'referred_by';

update public.field_definitions
  set options = array['English', 'Spanish', 'Arabic', 'Somali', 'Vietnamese', 'Other']
  where name = 'language_preference';

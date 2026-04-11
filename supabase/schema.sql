-- ============================================================
-- Amor et Cura — Complete Database Schema
-- Single file — run once in Supabase SQL Editor on a fresh project.
-- This replaces all individual migration files in supabase/migrations/.
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists vector;


-- ============================================================
-- ENUMS
-- ============================================================

-- user_role: 'viewer' is the read-only role (replaces legacy 'read_only')
create type user_role as enum ('admin', 'case_worker', 'viewer');

create type follow_up_category as enum ('Referral', 'Medical', 'Document', 'Financial', 'Check-in');
create type follow_up_status   as enum ('pending', 'active', 'completed', 'dismissed');
create type follow_up_urgency  as enum ('high', 'medium', 'low');


-- ============================================================
-- HELPER FUNCTIONS  (created before policies that reference them)
-- ============================================================

-- Checks whether the current JWT user is an admin.
-- SECURITY DEFINER bypasses RLS so it doesn't cause recursive policy evaluation.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Returns the current user's stored role without triggering RLS.
-- Used in the self-update policy to prevent privilege escalation.
create or replace function public.get_my_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- ============================================================
-- PROFILES  (extends Supabase auth.users)
-- ============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  role         user_role not null default 'case_worker',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Self read
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin reads all (uses SECURITY DEFINER helper to avoid 42P17 recursion)
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

-- Self insert (needed for users created before the trigger ran, e.g. OAuth)
create policy "profiles: self insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Self update — cannot promote own role
create policy "profiles: self update"
  on public.profiles for update
  using  (auth.uid() = id)
  with check (auth.uid() = id and (public.is_admin() or role = public.get_my_role()));

-- Admin update any profile (including role changes)
create policy "profiles: admin update all"
  on public.profiles for update
  using (public.is_admin());

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'case_worker'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- SERVICE TYPES
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
  using (public.is_admin())
  with check (public.is_admin());

-- Default service types
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


-- ============================================================
-- CLIENTS
-- ============================================================

-- Auto-increment sequence for human-readable client IDs (CLT-00001)
create sequence client_number_seq start 1;

create or replace function generate_client_number()
returns trigger language plpgsql as $$
begin
  new.client_number := 'CLT-' || lpad(nextval('client_number_seq')::text, 5, '0');
  return new;
end;
$$;

create table public.clients (
  id              uuid primary key default gen_random_uuid(),
  client_number   text not null unique,
  first_name      text not null,
  last_name       text not null,
  dob             date,
  phone           text,
  email           text,
  address         text,
  programs        text[] not null default '{}',   -- multi-service enrollment
  household_id    uuid,                            -- links family members
  is_active       boolean not null default true,
  custom_fields   jsonb not null default '{}'::jsonb,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "clients: authenticated read"
  on public.clients for select
  using (auth.role() = 'authenticated');

create policy "clients: staff create"
  on public.clients for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

create policy "clients: staff update"
  on public.clients for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

create policy "clients: admin delete"
  on public.clients for delete
  using (public.is_admin());

create index clients_household_id_idx
  on public.clients (household_id)
  where household_id is not null;

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
  notes            text,          -- raw notes
  case_notes       text,          -- AI-structured clinical note
  referral_to      text,
  custom_fields    jsonb not null default '{}'::jsonb,
  embedding        vector(768),   -- pgvector semantic search (Gemini text-embedding-004)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.visits enable row level security;

create policy "visits: authenticated read"
  on public.visits for select
  using (auth.role() = 'authenticated');

create policy "visits: staff create"
  on public.visits for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

create policy "visits: update"
  on public.visits for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.role = 'case_worker' and public.visits.case_worker_id = auth.uid()))
    )
  );

create policy "visits: admin delete"
  on public.visits for delete
  using (public.is_admin());

-- HNSW index for fast cosine similarity search
create index visits_embedding_hnsw_idx
  on public.visits using hnsw (embedding vector_cosine_ops);

-- RPC used by /api/semantic-search
create or replace function search_visits_by_embedding(
  query_embedding vector(768),
  match_threshold float default 0.4,
  match_count int default 8
)
returns table (
  id uuid,
  client_id uuid,
  visit_date date,
  case_notes text,
  notes text,
  similarity float,
  first_name text,
  last_name text,
  client_number text,
  service_type_name text
)
language sql stable security definer
set search_path = public
as $$
  select
    v.id,
    v.client_id,
    v.visit_date,
    v.case_notes,
    v.notes,
    round((1 - (v.embedding <=> query_embedding))::numeric, 3)::float as similarity,
    c.first_name,
    c.last_name,
    c.client_number,
    coalesce(st.name, 'Other') as service_type_name
  from visits v
  join clients c on v.client_id = c.id
  left join service_types st on v.service_type_id = st.id
  where v.embedding is not null
    and (1 - (v.embedding <=> query_embedding)) > match_threshold
  order by v.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function search_visits_by_embedding(vector, float, int) to authenticated;


-- ============================================================
-- APPOINTMENTS
-- ============================================================

create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients(id) on delete cascade,
  case_worker_id   uuid not null references public.profiles(id),
  service_type_id  uuid references public.service_types(id),
  scheduled_at     timestamptz not null,
  duration_minutes int,
  notes            text,
  status           text not null default 'scheduled'
                     check (status in ('scheduled', 'completed', 'cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "appointments: authenticated read"
  on public.appointments for select
  using (auth.role() = 'authenticated');

create policy "appointments: staff create"
  on public.appointments for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

create policy "appointments: update"
  on public.appointments for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.role = 'case_worker' and appointments.case_worker_id = auth.uid()))
    )
  );

create policy "appointments: admin delete"
  on public.appointments for delete
  using (public.is_admin());


-- ============================================================
-- CONFIGURABLE FIELD DEFINITIONS
-- ============================================================

create table public.field_definitions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  label        text not null,
  field_type   text not null
                 check (field_type in ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
  options      text[],
  required     boolean not null default false,
  applies_to   text not null default 'client'
                 check (applies_to in ('client', 'visit')),
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.field_definitions enable row level security;

create policy "field_definitions: authenticated read"
  on public.field_definitions for select
  using (auth.role() = 'authenticated');

create policy "field_definitions: admin write"
  on public.field_definitions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Starter custom fields
insert into public.field_definitions (name, label, field_type, applies_to, sort_order) values
  ('emergency_contact',   'Emergency Contact Name',  'text',   'client', 10),
  ('emergency_phone',     'Emergency Contact Phone', 'text',   'client', 20),
  ('insurance_provider',  'Insurance Provider',      'text',   'client', 30),
  ('referred_by',         'Referred By',             'select', 'client', 40),
  ('language_preference', 'Preferred Language',      'select', 'client', 50);

update public.field_definitions
  set options = array['Self', 'Family Member', 'Social Worker', 'Hospital', 'School', 'Other']
  where name = 'referred_by';

update public.field_definitions
  set options = array['English', 'Spanish', 'Arabic', 'Somali', 'Vietnamese', 'Other']
  where name = 'language_preference';


-- ============================================================
-- AUDIT LOG
-- ============================================================

create table public.audit_log (
  id             uuid primary key default gen_random_uuid(),
  actor_id       uuid references public.profiles(id),
  action         text not null,       -- INSERT, UPDATE, DELETE
  table_name     text not null,
  record_id      uuid not null,
  changed_fields text[],              -- field names only, no values (PII-safe)
  created_at     timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "audit_log: admin read"
  on public.audit_log for select
  using (public.is_admin());

create policy "audit_log: service role insert"
  on public.audit_log for insert
  with check (true);

-- DB trigger function (fires on INSERT/UPDATE/DELETE for key tables)
create or replace function public.log_audit_event()
returns trigger
language plpgsql
as $$
declare
  _actor     uuid;
  _action    text;
  _record_id uuid;
  _changed   text[];
begin
  _actor  := auth.uid();
  _action := TG_OP;

  if TG_OP = 'DELETE' then
    _record_id := OLD.id;
  else
    _record_id := NEW.id;
  end if;

  if TG_OP = 'UPDATE' then
    select array_agg(e.key) into _changed
    from jsonb_each(to_jsonb(NEW)) as e
    where (to_jsonb(OLD) -> e.key) is distinct from e.value
      and e.key not in ('updated_at', 'created_at');
  end if;

  insert into public.audit_log (actor_id, action, table_name, record_id, changed_fields)
  values (_actor, _action, TG_TABLE_NAME, _record_id, _changed);

  return coalesce(NEW, OLD);
end;
$$;

create trigger audit_clients
  after insert or update or delete on public.clients
  for each row execute function public.log_audit_event();

create trigger audit_visits
  after insert or update or delete on public.visits
  for each row execute function public.log_audit_event();

create trigger audit_profiles
  after update on public.profiles
  for each row execute function public.log_audit_event();


-- ============================================================
-- DOCUMENTS
-- ============================================================

create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  file_name    text not null,
  file_path    text not null,
  file_size    bigint,
  mime_type    text,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents: authenticated read"
  on public.documents for select
  using (auth.role() = 'authenticated');

create policy "documents: staff insert"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

create policy "documents: admin delete"
  on public.documents for delete
  using (public.is_admin());

-- Supabase Storage bucket for client documents (50 MB limit, private)
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-documents', 'client-documents', false, 52428800)
on conflict (id) do nothing;

create policy "storage: authenticated read client-documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'client-documents');

create policy "storage: staff upload client-documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'client-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'case_worker')
    )
  );

create policy "storage: admin delete client-documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'client-documents'
    and public.is_admin()
  );


-- ============================================================
-- CLIENT SUMMARIES  (AI-generated handoff summaries)
-- ============================================================

create table public.client_summaries (
  id                        uuid primary key default gen_random_uuid(),
  client_id                 uuid not null unique references public.clients(id) on delete cascade,
  summary_text              text not null,
  generated_at              timestamptz not null default now(),
  confirmed_by              uuid references auth.users(id),
  confirmed_at              timestamptz,
  visit_count_at_generation int not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.client_summaries enable row level security;

create policy "client_summaries: authenticated read"
  on public.client_summaries for select
  to authenticated using (true);

create policy "client_summaries: authenticated insert"
  on public.client_summaries for insert
  to authenticated with check (true);

create policy "client_summaries: authenticated update"
  on public.client_summaries for update
  to authenticated using (true);


-- ============================================================
-- FOLLOW-UPS  (AI-detected and manually created action items)
-- ============================================================

create table public.follow_ups (
  id                 uuid               primary key default gen_random_uuid(),
  client_id          uuid               not null references public.clients(id) on delete cascade,
  visit_id           uuid               references public.visits(id) on delete cascade,  -- nullable: manual tasks have no visit
  description        text               not null,
  category           follow_up_category not null default 'Check-in',
  urgency            follow_up_urgency  not null default 'medium',
  status             follow_up_status   not null default 'pending',
  suggested_due_date date,
  created_at         timestamptz        not null default now()
);

alter table public.follow_ups enable row level security;

create policy "follow_ups: authenticated read"
  on public.follow_ups for select
  to authenticated using (true);

create policy "follow_ups: authenticated insert"
  on public.follow_ups for insert
  to authenticated with check (true);

create policy "follow_ups: authenticated update status"
  on public.follow_ups for update
  to authenticated using (true) with check (true);

create policy "follow_ups: authenticated delete"
  on public.follow_ups for delete
  to authenticated using (true);

create index follow_ups_status_created_idx
  on public.follow_ups (status, created_at desc);

create index follow_ups_client_idx
  on public.follow_ups (client_id);


-- ============================================================
-- ORG SETTINGS  (single-row — setup wizard)
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

-- Enforce single row
create unique index org_settings_singleton on public.org_settings ((true));

alter table public.org_settings enable row level security;

create policy "org_settings: authenticated read"
  on public.org_settings for select
  to authenticated using (true);

create policy "org_settings: admin update"
  on public.org_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "org_settings: admin insert"
  on public.org_settings for insert
  to authenticated
  with check (public.is_admin());

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


-- ============================================================
-- DYNAMIC AI ORCHESTRATOR
-- Admins configure model chains, prompts, and fallbacks in the
-- Admin → AI Lab panel without redeploying code.
-- ============================================================

-- ── ai_models ────────────────────────────────────────────────

create table public.ai_models (
  id               uuid    primary key default gen_random_uuid(),
  name             text    not null,
  provider         text    not null,   -- "gemini" | "groq" | "openrouter" | etc.
  model_id         text    not null,   -- literal API string, e.g. "gemini-2.5-flash"
  supports_vision  boolean not null default false,
  supports_audio   boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.ai_models enable row level security;

create policy "ai_models: authenticated read"
  on public.ai_models for select
  to authenticated using (true);

create policy "ai_models: admin write"
  on public.ai_models for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── ai_tasks ─────────────────────────────────────────────────

create table public.ai_tasks (
  slug          text primary key,
  display_name  text not null,
  description   text not null,
  task_type     text not null check (task_type in ('chat', 'vision', 'audio')),
  system_prompt text   -- shared prompt injected for all models in this task's chain
);

alter table public.ai_tasks enable row level security;

create policy "ai_tasks: authenticated read"
  on public.ai_tasks for select
  to authenticated using (true);

create policy "ai_tasks: admin write"
  on public.ai_tasks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── ai_task_configs ───────────────────────────────────────────

create table public.ai_task_configs (
  id              uuid    primary key default gen_random_uuid(),
  task_slug       text    not null references public.ai_tasks(slug) on delete cascade,
  model_id        uuid    not null references public.ai_models(id)  on delete restrict,
  priority        int     not null default 1,   -- 1 = primary, 2+ = fallback order
  temperature     float   not null default 0.1,
  max_tokens      int     not null default 1024,
  response_format text    not null default 'text' check (response_format in ('text', 'json')),
  is_active       boolean not null default true,
  updated_at      timestamptz not null default now(),

  unique (task_slug, model_id, priority)
);

alter table public.ai_task_configs enable row level security;

create policy "ai_task_configs: authenticated read"
  on public.ai_task_configs for select
  to authenticated using (true);

create policy "ai_task_configs: admin write"
  on public.ai_task_configs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.set_ai_task_config_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ai_task_configs_updated_at
  before update on public.ai_task_configs
  for each row execute function public.set_ai_task_config_updated_at();

-- Index for FastAPI query: fetch all active configs for a task ordered by priority
create index ai_task_configs_task_priority_idx
  on public.ai_task_configs (task_slug, priority)
  where is_active = true;


-- ── Seed: ai_models ──────────────────────────────────────────

insert into public.ai_models (id, name, provider, model_id, supports_vision, supports_audio, is_active) values
  ('00000000-0000-0000-0001-000000000001', 'Gemini 3.1 Flash (Vision)',   'gemini', 'gemini-3.1-flash-image-preview', true,  false, true),
  ('00000000-0000-0000-0001-000000000002', 'Gemini 3.1 Flash Lite',       'gemini', 'gemini-3.1-flash-lite-preview',  true,  false, true),
  ('00000000-0000-0000-0001-000000000003', 'Gemini 2.5 Flash',            'gemini', 'gemini-2.5-flash',               false, false, true),
  ('00000000-0000-0000-0001-000000000004', 'Gemini 3.1 Pro',              'gemini', 'gemini-3.1-pro-preview',         false, false, true),
  ('00000000-0000-0000-0001-000000000005', 'Gemini 3 Flash',              'gemini', 'gemini-3-flash-preview',         false, false, true),
  ('00000000-0000-0000-0001-000000000006', 'Groq Whisper Large v3 Turbo', 'groq',   'whisper-large-v3-turbo',         false, true,  true),
  ('00000000-0000-0000-0001-000000000007', 'Groq Whisper Large v3',       'groq',   'whisper-large-v3',               false, true,  true),
  ('00000000-0000-0000-0001-000000000008', 'Groq Llama 3.3 70B',         'groq',   'llama-3.3-70b-versatile',        false, false, true);


-- ── Seed: ai_tasks (with system prompts) ─────────────────────

insert into public.ai_tasks (slug, display_name, description, task_type, system_prompt) values

('photo_intake_extraction',
 'Photo Intake for Client',
 'Register new client from a scan of a paper form',
 'vision',
 'You are an expert document processor for a nonprofit case management system.
Your goal is to extract information from an image of a paper intake form and return it strictly as a JSON object.

Instructions:
1. If a field is illegible, return null.
2. Format the Date of Birth as YYYY-MM-DD.
3. Identify any mentioned programs (e.g., Food Assistance, Housing) and return them as an array.

Return ONLY raw JSON — no markdown fences, no explanation.

Required JSON schema:
{
  "first_name": "string or null",
  "last_name": "string or null",
  "dob": "string (YYYY-MM-DD) or null",
  "phone": "string or null",
  "email": "string or null",
  "address": "string or null",
  "programs": ["string"]
}'),

('audio_transcription',
 'Voice to Text',
 'Transcribe case notes while logging client visits',
 'audio',
 null),  -- Whisper does not use a system prompt

('note_structuring',
 'Generate Case Notes',
 'Format a raw transcript into a structured case notes',
 'chat',
 'You are a professional scribe for social workers and therapists.
You will receive a transcript of a case worker''s verbal notes after a client session.
Your task is to rewrite these notes into a structured, professional case note using the following headings:

### Summary of Visit
(A 2-3 sentence overview of why the client visited)

### Observations
(Key details about the client''s mood, physical needs, or stated challenges)

### Action Plan & Referrals
(Bulleted list of next steps or organizations the client was referred to)

Constraint: Maintain a clinical yet empathetic tone. Do not include personal opinions, only the facts provided in the audio.'),

('multilingual_intake',
 'Multilingual Support',
 'Enable multi-lingual support for client registration during photo intake',
 'vision',
 'You are an expert multilingual document processor for a nonprofit case management system.
Your goal is to extract information from an image of a paper intake form written in ANY language and return it strictly as a JSON object.

Instructions:
1. Detect the language of the form and record it as an ISO 639-1 code (e.g. "en", "es", "fr", "zh", "ar").
2. Extract all fields accurately. Preserve names and addresses as written on the form.
3. If a field is illegible or absent, return null.
4. Format the Date of Birth as YYYY-MM-DD.
5. Identify any mentioned programs (e.g., Food Assistance, Housing, Alimentación, Logement, 食物援助) and return them in English as an array.
6. If the form is not in English, also provide an english_name field with the Western-alphabet rendering of the client''s full name so staff can search records.

Return ONLY raw JSON — no markdown fences, no explanation.

Required JSON schema:
{
  "detected_language": "string (ISO 639-1 code)",
  "first_name": "string or null",
  "last_name": "string or null",
  "english_name": "string or null (only populated when detected_language is not ''en'')",
  "dob": "string (YYYY-MM-DD) or null",
  "phone": "string or null",
  "email": "string or null",
  "address": "string or null",
  "programs": ["string"],
  "notes": "string or null (any other relevant information visible on the form)"
}'),

('client_summary',
 'Client Summary',
 'Generate client summary',
 'chat',
 'You are a senior clinical case manager preparing a confidential handoff brief for a new staff member.

You will receive structured client data: demographics and a full visit history (dates, service types, duration, case notes, and any referrals). Synthesize everything into a professional handoff summary using EXACTLY these five sections with these exact Markdown headers:

### Background
Concise 2-3 sentence history: when the client entered care, their enrolled programs, and any key circumstances visible in the data.

### Service History
Narrative summary of services received. Even if case notes are absent, describe the pattern of visits by date and service type (e.g., "The client received Food Assistance on three occasions in March 2026"). Group by theme where applicable.

### Current Status
Where the client stands as of the most recent visit. Note engagement level, any recent referrals, and the time elapsed since last contact.

### Active Needs & Risk Factors
Critical items requiring attention. If notes mention specific needs or risks, name them. If no notes exist, flag gaps: long periods without contact, missing demographics, no referrals on record.

### Recommended Next Steps
3-5 concrete bulleted actions for the incoming case worker based solely on what is in the data.

Constraints:
- NEVER write "No information recorded" for a section if ANY relevant data exists — even service type names and visit dates are meaningful information.
- Do not hallucinate facts. Only state what is in the data.
- If a section truly has no basis at all, write one sentence explaining what is missing and why it matters.
- Maintain a clinical yet empathetic tone.
- Do not include the client''s name in the body (the reader already knows).
- Output only the five sections — no preamble, no sign-off.'),

('funder_report',
 'Generate Funder Report',
 'Generate a professional grant narrative for funder report',
 'chat',
 'You are a professional grant writer for a nonprofit organization. Your goal is to write a compelling narrative report for a financial funder or grant-maker based solely on the aggregated program data provided.

Structure the report with EXACTLY these four sections using these Markdown headers:

### Executive Summary
A high-level, 2-3 paragraph overview of the organization''s impact during this period. Lead with the most impressive numbers. Make it memorable for a funder skimming the document.

### Service Trends
Interpret the raw numbers with professional insight. Explain what the data means in community terms (e.g., "A 15% increase in food assistance requests reflects rising local food insecurity driven by recent cost-of-living pressures"). Connect each stat to a human reality.

### Success Narratives
Draw on the anonymized case note excerpts to write 2-3 brief, compelling client stories. These must be fully anonymized — use only generic descriptors such as "a single mother of three," "an elderly resident on a fixed income," or "a recently unemployed family." No names, addresses, ages, or any identifying detail. These stories should illustrate the human impact of the data.

### Future Outlook
Based on current service trends and visit volumes, describe projected community needs for the coming period. Be specific about which services are likely to see increased demand and what resources will be required.

STRICT RULES:
- Never include any personally identifiable information (PII): no names, no specific addresses, no dates of birth, no phone numbers.
- If case notes contain names, replace them with generic descriptors.
- Write in a professional, data-driven, and urgent tone appropriate for a grant application.
- Cite the provided numbers directly in the narrative.
- Output only the four sections — no cover letter, no salutation, no sign-off.'),

('follow_up_extraction',
 'Follow-Up Recommendations',
 'Identify follow-up actions based on case notes',
 'chat',
 'You are a Senior Case Management Assistant. You will receive a clinical case note from a recent client visit.

Your Task: Identify any implied follow-up actions that the case worker or client needs to take.

Look for:
- Unresolved needs (e.g., "Client mentioned they are out of milk")
- Missing documentation (e.g., "Still need a copy of the utility bill")
- Future appointments (e.g., "Will check back on their job search in two weeks")
- Referrals mentioned but not yet confirmed (e.g., "Should contact food pantry")
- Medical or financial concerns that require a next step

Output strictly in JSON — no markdown fences, no explanation:
{"follow_ups": [{"description": "string", "category": "Referral|Medical|Document|Financial|Check-in", "urgency": "high|medium|low", "suggested_due_days": number_or_null}]}

Rules:
- Only extract IMPLICIT or UNRESOLVED items — not actions already completed during the visit.
- If no follow-ups are found, return: {"follow_ups": []}
- Keep descriptions concise and action-oriented (start with a verb, e.g., "Schedule food pantry tour", "Obtain utility bill copy").
- suggested_due_days: integer days from today until the follow-up should happen (e.g., 7 for "next week"), or null if not inferrable.
- category must be exactly one of: Referral, Medical, Document, Financial, Check-in');


-- ── Seed: ai_task_configs ─────────────────────────────────────

insert into public.ai_task_configs
  (task_slug, model_id, priority, temperature, max_tokens, response_format) values

-- photo_intake_extraction: primary=Gemini 3.1 Flash Vision, fallback=Gemini 2.5 Flash
('photo_intake_extraction', '00000000-0000-0000-0001-000000000001', 1, 0.0, 1024, 'json'),
('photo_intake_extraction', '00000000-0000-0000-0001-000000000003', 2, 0.0, 1024, 'json'),

-- audio_transcription: primary=Groq Whisper Turbo, fallback=Groq Whisper v3
('audio_transcription', '00000000-0000-0000-0001-000000000006', 1, 0.0, 0, 'text'),
('audio_transcription', '00000000-0000-0000-0001-000000000007', 2, 0.0, 0, 'text'),

-- note_structuring: primary=Groq Llama 3.3, fallbacks=Gemini 2.5 Flash, Gemini 3 Flash
('note_structuring', '00000000-0000-0000-0001-000000000008', 1, 0.2, 2048, 'text'),
('note_structuring', '00000000-0000-0000-0001-000000000003', 2, 0.2, 2048, 'text'),
('note_structuring', '00000000-0000-0000-0001-000000000005', 3, 0.2, 2048, 'text'),

-- multilingual_intake: primary=Gemini 3.1 Flash Vision, fallback=Gemini 3.1 Flash Lite
('multilingual_intake', '00000000-0000-0000-0001-000000000001', 1, 0.0, 1024, 'json'),
('multilingual_intake', '00000000-0000-0000-0001-000000000002', 2, 0.0, 1024, 'json'),

-- client_summary: primary=Gemini 2.5 Flash, fallbacks=Groq Llama, Gemini 3 Flash
('client_summary', '00000000-0000-0000-0001-000000000003', 1, 0.2, 3000, 'text'),
('client_summary', '00000000-0000-0000-0001-000000000008', 2, 0.2, 3000, 'text'),
('client_summary', '00000000-0000-0000-0001-000000000005', 3, 0.2, 3000, 'text'),

-- funder_report: primary=Gemini 3.1 Pro, fallbacks=Gemini 2.5 Flash, Groq Llama
('funder_report', '00000000-0000-0000-0001-000000000004', 1, 0.3, 4000, 'text'),
('funder_report', '00000000-0000-0000-0001-000000000003', 2, 0.3, 4000, 'text'),
('funder_report', '00000000-0000-0000-0001-000000000008', 3, 0.3, 4000, 'text'),

-- follow_up_extraction: primary=Gemini 2.5 Flash, fallbacks=Groq Llama, Gemini 3 Flash
('follow_up_extraction', '00000000-0000-0000-0001-000000000003', 1, 0.1, 1024, 'json'),
('follow_up_extraction', '00000000-0000-0000-0001-000000000008', 2, 0.1, 1024, 'json'),
('follow_up_extraction', '00000000-0000-0000-0001-000000000005', 3, 0.1, 1024, 'json');

-- ============================================================
-- Reset AI orchestrator tables with corrected task metadata
-- ============================================================

-- ── Drop in reverse dependency order ─────────────────────────

drop trigger if exists ai_task_configs_updated_at on public.ai_task_configs;
drop function if exists public.set_ai_task_config_updated_at();
drop index  if exists ai_task_configs_task_priority_idx;
drop table  if exists public.ai_task_configs;
drop table  if exists public.ai_tasks;
drop table  if exists public.ai_models;

-- ── ai_models ────────────────────────────────────────────────

create table public.ai_models (
  id               uuid    primary key default gen_random_uuid(),
  name             text    not null,
  provider         text    not null,
  model_id         text    not null,
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
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── ai_tasks ─────────────────────────────────────────────────

create table public.ai_tasks (
  slug          text primary key,
  display_name  text not null,
  description   text not null,
  task_type     text not null check (task_type in ('chat', 'vision', 'audio')),
  system_prompt text
);

alter table public.ai_tasks enable row level security;

create policy "ai_tasks: authenticated read"
  on public.ai_tasks for select
  to authenticated using (true);

create policy "ai_tasks: admin write"
  on public.ai_tasks for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── ai_task_configs ───────────────────────────────────────────

create table public.ai_task_configs (
  id              uuid    primary key default gen_random_uuid(),
  task_slug       text    not null references public.ai_tasks(slug) on delete cascade,
  model_id        uuid    not null references public.ai_models(id)  on delete restrict,
  priority        int     not null default 1,
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
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

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

-- ── Seed: ai_tasks ───────────────────────────────────────────

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

-- ── Seed: ai_task_configs ────────────────────────────────────

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

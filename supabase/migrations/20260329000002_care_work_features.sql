-- ============================================================
-- Care Work Features
-- - case_notes & referral_to on visits
-- - documents table (linked to clients)
-- - household_id on clients for family grouping
-- - Supabase Storage bucket for client documents
-- ============================================================

-- ── Visits: case narrative and referral fields ────────────────

alter table public.visits
  add column if not exists case_notes text,
  add column if not exists referral_to text;

-- ── Clients: household grouping ──────────────────────────────

alter table public.clients
  add column if not exists household_id uuid;

create index if not exists clients_household_id_idx
  on public.clients (household_id)
  where household_id is not null;

-- ── Documents table ───────────────────────────────────────────

create table if not exists public.documents (
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
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── Supabase Storage bucket ───────────────────────────────────

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
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- Appointments table
-- Tracks future scheduled client appointments.
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
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

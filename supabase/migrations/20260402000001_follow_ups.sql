-- ============================================================
-- Smart Follow-Up Detection — follow_ups table
-- FR-AI-11 / FR-AI-12
-- ============================================================

create type follow_up_category as enum ('Referral', 'Medical', 'Document', 'Financial', 'Check-in');

-- Lifecycle: pending (AI suggestion) → active (staff accepted) → completed (ticked off)
--            pending → dismissed (staff rejected, hidden forever)
create type follow_up_status   as enum ('pending', 'active', 'completed', 'dismissed');
create type follow_up_urgency  as enum ('high', 'medium', 'low');

create table public.follow_ups (
  id                  uuid               primary key default gen_random_uuid(),
  client_id           uuid               not null references public.clients(id) on delete cascade,
  visit_id            uuid               not null references public.visits(id)  on delete cascade,
  description         text               not null,
  category            follow_up_category not null default 'Check-in',
  urgency             follow_up_urgency  not null default 'medium',
  status              follow_up_status   not null default 'pending',
  suggested_due_date  date,
  created_at          timestamptz        not null default now()
);

alter table public.follow_ups enable row level security;

-- All authenticated staff can view follow-ups
create policy "follow_ups: authenticated read"
  on public.follow_ups for select
  to authenticated
  using (true);

-- Staff can update status (accept / dismiss / complete)
create policy "follow_ups: authenticated update status"
  on public.follow_ups for update
  to authenticated
  using (true)
  with check (true);

-- Index for fast dashboard queries (pending follow-ups ordered by date)
create index follow_ups_status_created_idx
  on public.follow_ups (status, created_at desc);

create index follow_ups_client_idx
  on public.follow_ups (client_id);

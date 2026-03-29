-- ============================================================
-- Change clients.program (text) → clients.programs (text[])
-- A client can now be enrolled in multiple programs simultaneously.
-- ============================================================

-- 1. Add the new array column
alter table public.clients
  add column programs text[] not null default '{}';

-- 2. Migrate existing single-program values into the array
update public.clients
  set programs = array[program]
  where program is not null and program <> '';

-- 3. Drop the old column
alter table public.clients drop column program;

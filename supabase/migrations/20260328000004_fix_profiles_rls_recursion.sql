-- Fix infinite recursion in "profiles: admin read all" policy.
--
-- The original policy used `exists (select 1 from public.profiles ...)` inside
-- a policy ON profiles — PostgreSQL expands every row-level policy on every
-- access to the table, so querying profiles to check admin status from within
-- a profiles policy causes infinite recursion (42P17).
--
-- The standard fix: a SECURITY DEFINER function runs with the privileges of its
-- definer (postgres), which bypasses RLS, breaking the cycle.

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

-- Rebuild the recursive policy using the helper
drop policy if exists "profiles: admin read all" on public.profiles;

create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

-- Fix privilege escalation: prevent users from promoting their own role.
--
-- The original "profiles: self update" policy allowed updating any column,
-- including `role`. A case_worker could set role = 'admin' on their own row.
--
-- Fix: a SECURITY DEFINER helper reads the stored role without triggering RLS
-- recursion. The with check ensures the new role value equals the stored value
-- unless the caller is already an admin.

create or replace function public.get_my_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Drop the over-broad original policy
drop policy if exists "profiles: self update" on public.profiles;

-- Non-admins: can update own row but role must stay the same
create policy "profiles: self update"
  on public.profiles for update
  using  (auth.uid() = id)
  with check (auth.uid() = id and (public.is_admin() or role = public.get_my_role()));

-- Admins: can update any profile (including role promotion/demotion)
create policy "profiles: admin update all"
  on public.profiles for update
  using (public.is_admin());

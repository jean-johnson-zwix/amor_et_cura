-- Allow authenticated users to insert their own profile row.
-- Needed for users created before the trigger was applied (e.g. OAuth sign-in
-- before the handle_new_user trigger existed).
create policy "profiles: self insert"
  on public.profiles for insert
  with check (auth.uid() = id);

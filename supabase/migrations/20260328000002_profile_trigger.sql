-- ============================================================
-- Auto-create a profile row when a new user signs up via Supabase Auth
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'case_worker'  -- default role; admins must be promoted manually
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Fire after every new auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

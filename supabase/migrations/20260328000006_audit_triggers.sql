-- ============================================================
-- Audit Log — DB Triggers
-- Writes to audit_log on INSERT / UPDATE / DELETE for key tables.
-- auth.uid() resolves to the JWT sub within each Supabase request.
-- ============================================================

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

-- clients
create trigger audit_clients
  after insert or update or delete on public.clients
  for each row execute function public.log_audit_event();

-- visits
create trigger audit_visits
  after insert or update or delete on public.visits
  for each row execute function public.log_audit_event();

-- profiles (catches role changes, name edits)
create trigger audit_profiles
  after update on public.profiles
  for each row execute function public.log_audit_event();

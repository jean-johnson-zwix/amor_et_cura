-- ============================================================
-- Rename user role: read_only → viewer
-- ============================================================

-- 1. Update existing rows before altering the enum
update public.profiles set role = 'viewer' where role = 'read_only';

-- 2. Add new enum value
alter type user_role add value if not exists 'viewer';

-- 3. Re-run update (safe no-op if step 1 already applied)
update public.profiles set role = 'viewer' where role = 'read_only';

-- Note: PostgreSQL does not support removing enum values directly.
-- 'read_only' remains in the type but is no longer used by any row or policy.
-- The application layer exclusively uses 'viewer' going forward.

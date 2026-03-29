-- ============================================================
-- Step 1 of 2: Add 'viewer' enum value to user_role
-- ============================================================
-- Run this file FIRST in its own SQL Editor execution, then run
-- 20260328000009b_viewer_migrate_profiles.sql in a separate execution.
--
-- PostgreSQL limitation: ALTER TYPE ... ADD VALUE cannot be used in
-- the same transaction as any statement that assigns the new value
-- (error 55P04). These two steps MUST be separate transactions.

alter type user_role add value if not exists 'viewer';

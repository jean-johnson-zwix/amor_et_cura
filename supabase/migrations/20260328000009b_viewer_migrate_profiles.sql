-- ============================================================
-- Step 2 of 2: Migrate existing 'read_only' rows to 'viewer'
-- ============================================================
-- Run this AFTER 20260328000009_rename_read_only_to_viewer.sql
-- has been executed in a separate SQL Editor session.
--
-- Safe to re-run: no-op if rows are already updated.

update public.profiles set role = 'viewer' where role = 'read_only';

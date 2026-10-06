-- ============================================================
-- SAVISKAR 2026 — ADMIN EVENT & CATEGORY SCOPING
-- Migration: 20261005160000_admin_event_and_category_scope.sql
-- ============================================================

ALTER TABLE public.admins
    ADD COLUMN IF NOT EXISTS assigned_category text DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS assigned_events text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.admins.assigned_category IS 'Category scope (e.g. technical, cultural, non-technical). If NULL, admin is not restricted by category.';
COMMENT ON COLUMN public.admins.assigned_events IS 'Array of event IDs the admin is assigned to manage. If empty, admin is not restricted to specific events.';

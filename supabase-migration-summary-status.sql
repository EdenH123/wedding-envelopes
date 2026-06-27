-- ============================================================================
-- Migration: allow the 'summary' screen status (shows the event summary on TV)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
-- ============================================================================

alter table public.event_state drop constraint if exists event_state_screen_status_check;

alter table public.event_state
  add constraint event_state_screen_status_check
  check (screen_status in ('idle', 'selected', 'ready', 'revealed', 'summary'));

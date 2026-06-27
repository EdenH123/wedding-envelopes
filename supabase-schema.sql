-- ============================================================================
-- Envelope Show — Supabase schema
-- Run this in the Supabase dashboard:  SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================================

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase).
create extension if not exists pgcrypto;

-- ──────────────────────────────────────────────────────────────────────────
-- Tables
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.guests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  amount      numeric,
  opened      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.event_state (
  id                 text primary key,
  selected_guest_id  uuid references public.guests(id) on delete set null,
  screen_status      text not null default 'idle'
                       check (screen_status in ('idle', 'selected', 'ready', 'revealed')),
  last_reveal_at     timestamptz,
  updated_at         timestamptz not null default now()
);

-- Helpful index for name search / sorting.
create index if not exists guests_name_idx on public.guests (name);

-- ──────────────────────────────────────────────────────────────────────────
-- updated_at auto-touch trigger
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guests_touch_updated_at on public.guests;
create trigger guests_touch_updated_at
  before update on public.guests
  for each row execute function public.touch_updated_at();

drop trigger if exists event_state_touch_updated_at on public.event_state;
create trigger event_state_touch_updated_at
  before update on public.event_state
  for each row execute function public.touch_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- Seed the single control row
-- ──────────────────────────────────────────────────────────────────────────

insert into public.event_state (id, screen_status)
values ('main', 'idle')
on conflict (id) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- Row Level Security
--
-- This is a private, in-person family event with NO privacy mode: the app uses
-- the anon key from the venue, so we allow the anon role full access to both
-- tables. If you later want to lock this down, replace these policies with
-- authenticated-only ones.
-- ──────────────────────────────────────────────────────────────────────────

alter table public.guests       enable row level security;
alter table public.event_state  enable row level security;

drop policy if exists "guests_anon_all" on public.guests;
create policy "guests_anon_all" on public.guests
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "event_state_anon_all" on public.event_state;
create policy "event_state_anon_all" on public.event_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ──────────────────────────────────────────────────────────────────────────
-- Realtime
-- Add both tables to the supabase_realtime publication so the /display page
-- receives live INSERT / UPDATE / DELETE events.
-- ──────────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'guests'
  ) then
    alter publication supabase_realtime add table public.guests;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'event_state'
  ) then
    alter publication supabase_realtime add table public.event_state;
  end if;
end
$$;

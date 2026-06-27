-- ============================================================================
-- Migration: add `payment_method` to guests (ביט / מזומן / צ׳ק)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
-- ============================================================================

alter table public.guests add column if not exists payment_method text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'guests_payment_method_check'
  ) then
    alter table public.guests
      add constraint guests_payment_method_check
      check (payment_method in ('bit', 'cash', 'check'));
  end if;
end
$$;

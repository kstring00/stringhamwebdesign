-- Makes the service_role grant on stripe_events explicit.
--
-- 20260908120000_stripe_invoicing.sql created public.stripe_events, enabled RLS
-- and revoked anon/authenticated, but never granted to service_role — unlike
-- every other table in this schema, which is granted explicitly
-- (20260904232200 grants 3, 20260906214000 grants 12, 20260906225427 grants 4).
--
-- This is NOT a fix for a live failure. A test-mode webhook run on 2026-09-08
-- wrote 14 rows to this table, so Supabase's default privileges on `public`
-- already cover service_role. It closes the inconsistency instead: the table's
-- reachability should not be the one case that rests on a project-level default
-- that a future `alter default privileges` could revoke without touching any
-- migration in this repo.
--
-- The applied migration is deliberately left untouched.

grant all on table public.stripe_events to service_role;

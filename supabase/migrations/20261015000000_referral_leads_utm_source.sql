-- Where a referred lead's visit came from (utm_source), shown in /manage.
-- Safe to run whether or not 20261014000000_referrals.sql already has it.
alter table public.referral_leads
  add column if not exists utm_source text check (utm_source is null or char_length(utm_source) <= 120);

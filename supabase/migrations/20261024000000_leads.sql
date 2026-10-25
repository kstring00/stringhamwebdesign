-- The lead ledger: every inquiry the site receives, referred or not, plus
-- calls and texts logged by hand, and a monthly Search Console entry.
--
-- Zero-downtime: the existing `referral_leads` table is widened IN PLACE
-- (nothing is renamed or dropped), so the code already running on main
-- keeps working after this runs, and the new code works once it's deployed.
-- Existing referred leads keep their rows, statuses and build prices.
--
-- Run once in the Supabase SQL editor. Safe on a clean project (it creates
-- the tables), on an existing one, and when run again.
--
-- Rollout: run this first, then deploy. Rollback: redeploy the previous
-- code; it only ever writes the original columns, which are unchanged.
--
-- What is stored, on purpose: what's needed to follow a lead up and to
-- report on it (who, how to reach them, what they asked, where the visit
-- came from). Not stored: IP addresses, user agents, the free-text message
-- (it's in the email), or anything a visitor didn't type into a form.

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    check (code ~ '^[a-z0-9]([a-z0-9-]{1,30})[a-z0-9]$'),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 180),
  phone text check (char_length(phone) <= 40),
  how_they_know text check (char_length(how_they_know) <= 500),
  terms_version text not null,
  agreed_terms_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_leads (
  id uuid primary key default gen_random_uuid(),
  partner_code text references public.partners (code) on update cascade,
  kind text not null,
  business text,
  contact_name text,
  contact text,
  website text,
  checkup text,
  utm_source text,
  status text not null default 'new',
  build_price numeric(10, 2) check (build_price is null or build_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A referred lead has a partner code; every other lead has none.
alter table public.referral_leads alter column partner_code drop not null;

-- Kinds: quote (home form) · checkup (the checkup's "check my site for me")
-- · google_check (/google-check) · partner (/partners inquiry; not a
-- prospective website customer, reported separately) · call · text (logged
-- by hand at /manage).
alter table public.referral_leads drop constraint if exists referral_leads_kind_check;
alter table public.referral_leads add constraint referral_leads_kind_check
  check (kind in ('quote', 'checkup', 'google_check', 'partner', 'call', 'text'));

-- The pipeline: new → consulted → quoted → hired → paid → partner_paid.
-- lost: a real inquiry that didn't become a project (stays in the
-- denominators). spam: not a real inquiry (left out of every count).
alter table public.referral_leads drop constraint if exists referral_leads_status_check;
alter table public.referral_leads add constraint referral_leads_status_check
  check (status in ('new', 'consulted', 'quoted', 'hired', 'paid', 'partner_paid', 'lost', 'spam'));

-- Where the visit came from, and what the form was about.
alter table public.referral_leads add column if not exists utm_source text;
alter table public.referral_leads add column if not exists utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120);
alter table public.referral_leads add column if not exists utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120);
-- Only the host of the page the visitor came from (google.com, facebook.com), never its path or query.
alter table public.referral_leads add column if not exists referrer_host text check (referrer_host is null or char_length(referrer_host) <= 120);
-- The first page of the visit on this site (a path, e.g. /checkup).
alter table public.referral_leads add column if not exists landing_page text check (landing_page is null or char_length(landing_page) <= 200);
-- What the visitor typed under "How did you hear about me?" (or, for a logged call, the option picked).
alter table public.referral_leads add column if not exists heard text check (heard is null or char_length(heard) <= 160);
-- One short line specific to the kind: the town for a Google check; what a partner does and wants.
alter table public.referral_leads add column if not exists detail text check (detail is null or char_length(detail) <= 200);
-- When the project was actually signed (status reached hired). Set by the
-- admin on that status change; "clients signed this month" counts by it.
alter table public.referral_leads add column if not exists signed_at timestamptz;
-- The same person sending the same kind of form twice on the same day is one
-- lead: the key is a hash of kind + contact + date, and the second insert is
-- refused (23505), which the site treats as "already recorded".
alter table public.referral_leads add column if not exists dedupe_key text;
create unique index if not exists referral_leads_dedupe_key_idx on public.referral_leads (dedupe_key) where dedupe_key is not null;

create index if not exists referral_leads_created_at_idx on public.referral_leads (created_at desc);
create index if not exists referral_leads_partner_code_idx on public.referral_leads (partner_code);
create index if not exists referral_leads_signed_at_idx on public.referral_leads (signed_at) where signed_at is not null;

-- Search Console, by month, typed in by hand at /manage once Google shows
-- data: total impressions and clicks for the site, and a note (top queries).
create table if not exists public.search_months (
  month date primary key check (extract(day from month) = 1),
  impressions integer not null default 0 check (impressions >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  note text check (note is null or char_length(note) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.partners enable row level security;
alter table public.referral_leads enable row level security;
alter table public.search_months enable row level security;

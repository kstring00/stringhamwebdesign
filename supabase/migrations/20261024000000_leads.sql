-- The lead ledger: every inquiry the site receives, referred or not, plus
-- calls and texts logged by hand, and a monthly Search Console entry.
--
-- Run once in the Supabase SQL editor. Safe whether or not the two earlier
-- migrations have been run: `referral_leads` is renamed to `leads` and
-- widened, or `leads` is created fresh. Existing referred leads keep their
-- rows, statuses and build prices.
--
-- What is stored, on purpose: what's needed to follow a lead up and to
-- report on it (who, how to reach them, what they asked, where the visit
-- came from). Not stored: IP addresses, user agents, the free-text message
-- (it's in the email), or anything a visitor didn't type into a form.

do $$
begin
  if to_regclass('public.leads') is null and to_regclass('public.referral_leads') is not null then
    alter table public.referral_leads rename to leads;
  end if;
end $$;

create table if not exists public.leads (
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
alter table public.leads alter column partner_code drop not null;

-- Kinds: quote (home form) · checkup (the checkup's "check my site for me")
-- · google_check (/google-check) · partner (/partners inquiry) · call · text
-- (logged by hand at /manage).
alter table public.leads drop constraint if exists referral_leads_kind_check;
alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads add constraint leads_kind_check
  check (kind in ('quote', 'checkup', 'google_check', 'partner', 'call', 'text'));

-- The pipeline: new → consulted → quoted → hired → paid → partner_paid.
-- not_fit: spam, out of scope, or no reply; left out of every count.
alter table public.leads drop constraint if exists referral_leads_status_check;
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('new', 'consulted', 'quoted', 'hired', 'paid', 'partner_paid', 'not_fit'));

-- Where the visit came from, and what the form was about.
alter table public.leads add column if not exists utm_source text check (utm_source is null or char_length(utm_source) <= 120);
alter table public.leads add column if not exists utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120);
alter table public.leads add column if not exists utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120);
-- Only the host of the page the visitor came from (google.com, facebook.com), never its path or query.
alter table public.leads add column if not exists referrer_host text check (referrer_host is null or char_length(referrer_host) <= 120);
-- The first page of the visit on this site (a path, e.g. /checkup).
alter table public.leads add column if not exists landing_page text check (landing_page is null or char_length(landing_page) <= 200);
-- What the visitor typed under "How did you hear about me?".
alter table public.leads add column if not exists heard text check (heard is null or char_length(heard) <= 160);
-- One short line specific to the kind: the town for a Google check; what a partner does and wants.
alter table public.leads add column if not exists detail text check (detail is null or char_length(detail) <= 200);
-- The same person sending the same kind of form twice on the same day is one
-- lead: the key is a hash of kind + contact + date, and the second insert is
-- refused (23505), which the site treats as "already recorded".
alter table public.leads add column if not exists dedupe_key text;
create unique index if not exists leads_dedupe_key_idx on public.leads (dedupe_key) where dedupe_key is not null;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_partner_code_idx on public.leads (partner_code) where partner_code is not null;

-- Search Console, by month, typed in by hand at /manage once Google shows
-- data: total impressions and clicks for the site, and a note (top queries).
create table if not exists public.search_months (
  month date primary key check (extract(day from month) = 1),
  impressions integer not null default 0 check (impressions >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  note text check (note is null or char_length(note) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.search_months enable row level security;

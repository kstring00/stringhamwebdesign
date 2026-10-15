-- Share-and-earn referrals: partners and the leads attributed to them.
--
-- Run once in the Supabase SQL editor (or `supabase db push`). The site
-- talks to these tables only from the server, with SUPABASE_SECRET_KEY,
-- which bypasses row level security. RLS is on with no policies, so the
-- public (anon / publishable) key can read or write nothing here.

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
  partner_code text not null references public.partners (code) on update cascade,
  -- quote: the home page form · checkup: the checkup's "check it for me" form
  kind text not null check (kind in ('quote', 'checkup')),
  business text,
  contact_name text,
  contact text,
  website text,
  checkup text,
  -- Where the visit came from (utm_source), e.g. "card" for the business card's QR code.
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  status text not null default 'new'
    check (status in ('new', 'quoted', 'hired', 'paid', 'partner_paid')),
  -- The website build price from the client's written quote, in dollars.
  -- The partner earns 20% of this; Website Care is never included.
  build_price numeric(10, 2) check (build_price is null or build_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referral_leads_partner_code_idx on public.referral_leads (partner_code);
create index if not exists referral_leads_created_at_idx on public.referral_leads (created_at desc);

alter table public.partners enable row level security;
alter table public.referral_leads enable row level security;

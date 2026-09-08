create table if not exists public.portal_magic_link_windows (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  used_at timestamptz
);

create index if not exists portal_magic_link_windows_email_requested_idx
  on public.portal_magic_link_windows (email, requested_at desc);

alter table public.portal_magic_link_windows enable row level security;

revoke all on table public.portal_magic_link_windows from anon, authenticated;

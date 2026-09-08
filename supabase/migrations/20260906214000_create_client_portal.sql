create extension if not exists pgcrypto;

-- Client portal: single-tenant (Kyle/admin), invite-only clients.
-- The public schema mirrors auth.users only by id; authentication itself remains
-- in Supabase Auth. Every project-scoped table is protected by RLS.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('admin', 'client')),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  business_name text not null,
  contact_name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  slug text not null unique,
  status text not null default 'consultation'
    check (status in ('consultation','plan_quote','build','launch','complete','paused','archived')),
  tier text,
  quoted_total numeric(12,2) check (quoted_total is null or quoted_total >= 0),
  started_at timestamptz,
  launched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  status text not null default 'draft'
    check (status in ('draft','sent','accepted','declined')),
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  filename text not null,
  storage_path text not null unique,
  size bigint not null default 0 check (size >= 0),
  kind text not null check (kind in ('deliverable','asset','doc')),
  created_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null,
  phase text not null,
  description text not null,
  hours numeric(5,2) not null check (hours > 0 and hours <= 24),
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'draft'
    check (status in ('draft','open','paid','void','past_due')),
  stripe_invoice_id text unique,
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.docs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Designed now for the future /start -> quote -> project handoff.
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references public.intakes(id) on delete set null,
  name text,
  business_name text,
  email text,
  brief jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new','reviewing','consultation_booked','quoted','converted','archived')),
  converted_project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by uuid not null references public.users(id) on delete restrict,
  request text not null,
  status text not null default 'requested'
    check (status in ('requested','quoted','accepted','declined','completed')),
  quote_amount numeric(12,2) check (quote_amount is null or quote_amount >= 0),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  status text not null default 'inactive'
    check (status in ('inactive','active','past_due','cancelled')),
  stripe_subscription_id text unique,
  started_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists clients_user_idx on public.clients(user_id);
create index if not exists projects_client_idx on public.projects(client_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists quotes_project_idx on public.quotes(project_id, version desc);
create index if not exists messages_project_created_idx on public.messages(project_id, created_at);
create index if not exists files_project_created_idx on public.files(project_id, created_at desc);
create index if not exists time_entries_project_date_idx on public.time_entries(project_id, date desc);
create index if not exists invoices_project_due_idx on public.invoices(project_id, due_at);
create index if not exists docs_project_created_idx on public.docs(project_id, created_at);
create index if not exists prospects_status_idx on public.prospects(status, created_at desc);
create index if not exists change_requests_project_idx on public.change_requests(project_id, created_at desc);

create or replace function public.portal_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_portal_updated_at on public.projects;
create trigger projects_portal_updated_at
before update on public.projects
for each row execute function public.portal_set_updated_at();

drop trigger if exists docs_portal_updated_at on public.docs;
create trigger docs_portal_updated_at
before update on public.docs
for each row execute function public.portal_set_updated_at();

drop trigger if exists prospects_portal_updated_at on public.prospects;
create trigger prospects_portal_updated_at
before update on public.prospects
for each row execute function public.portal_set_updated_at();

-- SECURITY DEFINER helpers keep policy logic centralized and avoid recursive
-- policy evaluation on users/clients/projects.
create or replace function public.portal_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

create or replace function public.portal_can_access_client(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.portal_is_admin()
    or exists (
      select 1
      from public.clients c
      where c.id = p_client_id
        and c.user_id = auth.uid()
    );
$$;

create or replace function public.portal_can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.portal_is_admin()
    or exists (
      select 1
      from public.projects p
      join public.clients c on c.id = p.client_id
      where p.id = p_project_id
        and c.user_id = auth.uid()
    );
$$;

revoke all on function public.portal_is_admin() from public;
revoke all on function public.portal_can_access_client(uuid) from public;
revoke all on function public.portal_can_access_project(uuid) from public;
grant execute on function public.portal_is_admin() to authenticated;
grant execute on function public.portal_can_access_client(uuid) to authenticated;
grant execute on function public.portal_can_access_project(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.quotes enable row level security;
alter table public.messages enable row level security;
alter table public.files enable row level security;
alter table public.time_entries enable row level security;
alter table public.invoices enable row level security;
alter table public.docs enable row level security;
alter table public.prospects enable row level security;
alter table public.change_requests enable row level security;
alter table public.care_plans enable row level security;

drop policy if exists users_read_portal on public.users;
create policy users_read_portal on public.users
for select to authenticated
using (id = auth.uid() or public.portal_is_admin());

drop policy if exists users_admin_write_portal on public.users;
create policy users_admin_write_portal on public.users
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists clients_read_portal on public.clients;
create policy clients_read_portal on public.clients
for select to authenticated
using (user_id = auth.uid() or public.portal_is_admin());

drop policy if exists clients_admin_write_portal on public.clients;
create policy clients_admin_write_portal on public.clients
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists projects_read_portal on public.projects;
create policy projects_read_portal on public.projects
for select to authenticated
using (public.portal_can_access_client(client_id));

drop policy if exists projects_admin_write_portal on public.projects;
create policy projects_admin_write_portal on public.projects
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists quotes_read_portal on public.quotes;
create policy quotes_read_portal on public.quotes
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists quotes_admin_write_portal on public.quotes;
create policy quotes_admin_write_portal on public.quotes
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists messages_read_portal on public.messages;
create policy messages_read_portal on public.messages
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists messages_insert_portal on public.messages;
create policy messages_insert_portal on public.messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.portal_can_access_project(project_id)
);

drop policy if exists files_read_portal on public.files;
create policy files_read_portal on public.files
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists files_insert_portal on public.files;
create policy files_insert_portal on public.files
for insert to authenticated
with check (
  uploaded_by = auth.uid()
  and public.portal_can_access_project(project_id)
);

drop policy if exists files_delete_portal on public.files;
create policy files_delete_portal on public.files
for delete to authenticated
using (
  public.portal_is_admin()
  or (
    uploaded_by = auth.uid()
    and public.portal_can_access_project(project_id)
  )
);

drop policy if exists time_entries_read_portal on public.time_entries;
create policy time_entries_read_portal on public.time_entries
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists time_entries_admin_write_portal on public.time_entries;
create policy time_entries_admin_write_portal on public.time_entries
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists invoices_read_portal on public.invoices;
create policy invoices_read_portal on public.invoices
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists invoices_admin_write_portal on public.invoices;
create policy invoices_admin_write_portal on public.invoices
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists docs_read_portal on public.docs;
create policy docs_read_portal on public.docs
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists docs_admin_write_portal on public.docs;
create policy docs_admin_write_portal on public.docs
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists prospects_admin_only_portal on public.prospects;
create policy prospects_admin_only_portal on public.prospects
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists change_requests_read_portal on public.change_requests;
create policy change_requests_read_portal on public.change_requests
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists change_requests_insert_portal on public.change_requests;
create policy change_requests_insert_portal on public.change_requests
for insert to authenticated
with check (
  requested_by = auth.uid()
  and public.portal_can_access_project(project_id)
);

drop policy if exists change_requests_admin_update_portal on public.change_requests;
create policy change_requests_admin_update_portal on public.change_requests
for update to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

drop policy if exists care_plans_read_portal on public.care_plans;
create policy care_plans_read_portal on public.care_plans
for select to authenticated
using (public.portal_can_access_project(project_id));

drop policy if exists care_plans_admin_write_portal on public.care_plans;
create policy care_plans_admin_write_portal on public.care_plans
for all to authenticated
using (public.portal_is_admin())
with check (public.portal_is_admin());

revoke all on table public.users from anon;
revoke all on table public.clients from anon;
revoke all on table public.projects from anon;
revoke all on table public.quotes from anon;
revoke all on table public.messages from anon;
revoke all on table public.files from anon;
revoke all on table public.time_entries from anon;
revoke all on table public.invoices from anon;
revoke all on table public.docs from anon;
revoke all on table public.prospects from anon;
revoke all on table public.change_requests from anon;
revoke all on table public.care_plans from anon;

grant select on table public.users to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;
grant select, insert on table public.messages to authenticated;
grant select, insert, delete on table public.files to authenticated;
grant select on table public.time_entries to authenticated;
grant select on table public.invoices to authenticated;
grant select on table public.docs to authenticated;
grant select, insert on table public.change_requests to authenticated;
grant select on table public.care_plans to authenticated;

-- Admin writes generally happen through trusted server routes. Service-role
-- access is explicit even though the role bypasses RLS.
grant all on table public.users to service_role;
grant all on table public.clients to service_role;
grant all on table public.projects to service_role;
grant all on table public.quotes to service_role;
grant all on table public.messages to service_role;
grant all on table public.files to service_role;
grant all on table public.time_entries to service_role;
grant all on table public.invoices to service_role;
grant all on table public.docs to service_role;
grant all on table public.prospects to service_role;
grant all on table public.change_requests to service_role;
grant all on table public.care_plans to service_role;

insert into storage.buckets (id, name, public, file_size_limit)
values ('portal-files', 'portal-files', false, 20971520)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists portal_files_storage_read on storage.objects;
create policy portal_files_storage_read on storage.objects
for select to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.portal_can_access_project(((storage.foldername(name))[1])::uuid)
);

drop policy if exists portal_files_storage_insert on storage.objects;
create policy portal_files_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.portal_can_access_project(((storage.foldername(name))[1])::uuid)
);

drop policy if exists portal_files_storage_delete on storage.objects;
create policy portal_files_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.portal_can_access_project(((storage.foldername(name))[1])::uuid)
);

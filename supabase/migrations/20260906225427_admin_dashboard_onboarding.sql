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

alter table public.clients
  add column if not exists invited_at timestamptz,
  add column if not exists invite_last_sent_at timestamptz;

create table if not exists public.onboarding_template_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  item_type text not null default 'confirm'
    check (item_type in ('file','text','link','confirm')),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

create table if not exists public.project_onboarding_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  template_item_id uuid references public.onboarding_template_items(id) on delete set null,
  name text not null,
  item_type text not null default 'confirm'
    check (item_type in ('file','text','link','confirm')),
  status text not null default 'pending'
    check (status in ('pending','submitted','accepted','needs_changes','not_applicable')),
  note text,
  value text,
  position integer not null default 0,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.time_checkins (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  hours_mark numeric(7,2) not null check (hours_mark > 0),
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (project_id, hours_mark)
);

create index if not exists onboarding_template_position_idx
  on public.onboarding_template_items(position, created_at);
create index if not exists project_onboarding_project_position_idx
  on public.project_onboarding_items(project_id, position, created_at);
create index if not exists project_onboarding_status_idx
  on public.project_onboarding_items(project_id, status);
create index if not exists time_checkins_project_mark_idx
  on public.time_checkins(project_id, hours_mark desc);

insert into public.onboarding_template_items (name, item_type, position)
values
  ('Logo files', 'file', 10),
  ('Brand colors', 'text', 20),
  ('Photography', 'file', 30),
  ('Domain access', 'confirm', 40),
  ('Homepage copy', 'text', 50),
  ('Business details', 'text', 60),
  ('Service descriptions', 'text', 70),
  ('Existing site access', 'confirm', 80)
on conflict (name) do update
set item_type = excluded.item_type,
    position = excluded.position,
    active = true,
    updated_at = now();

create or replace function public.portal_clone_onboarding_template()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_onboarding_items (
    project_id, template_item_id, name, item_type, position
  )
  select new.id, t.id, t.name, t.item_type, t.position
  from public.onboarding_template_items t
  where t.active = true
  order by t.position, t.created_at;
  return new;
end;
$$;

revoke all on function public.portal_clone_onboarding_template() from public, anon, authenticated;
grant execute on function public.portal_clone_onboarding_template() to service_role;

drop trigger if exists project_clone_onboarding_template on public.projects;
create trigger project_clone_onboarding_template
after insert on public.projects
for each row execute function public.portal_clone_onboarding_template();

insert into public.project_onboarding_items (
  project_id, template_item_id, name, item_type, position
)
select p.id, t.id, t.name, t.item_type, t.position
from public.projects p
cross join public.onboarding_template_items t
where t.active = true
  and not exists (
    select 1
    from public.project_onboarding_items i
    where i.project_id = p.id
      and i.template_item_id = t.id
  );

drop trigger if exists onboarding_template_updated_at on public.onboarding_template_items;
create trigger onboarding_template_updated_at
before update on public.onboarding_template_items
for each row execute function public.portal_set_updated_at();

drop trigger if exists project_onboarding_updated_at on public.project_onboarding_items;
create trigger project_onboarding_updated_at
before update on public.project_onboarding_items
for each row execute function public.portal_set_updated_at();

alter table public.onboarding_template_items enable row level security;
alter table public.project_onboarding_items enable row level security;
alter table public.time_checkins enable row level security;

drop policy if exists onboarding_template_admin_only on public.onboarding_template_items;
create policy onboarding_template_admin_only on public.onboarding_template_items
for select to authenticated
using (private.portal_is_admin());

drop policy if exists project_onboarding_read_portal on public.project_onboarding_items;
create policy project_onboarding_read_portal on public.project_onboarding_items
for select to authenticated
using (private.portal_can_access_project(project_id));

drop policy if exists time_checkins_read_portal on public.time_checkins;
create policy time_checkins_read_portal on public.time_checkins
for select to authenticated
using (private.portal_can_access_project(project_id));

revoke all on table public.onboarding_template_items from anon;
revoke all on table public.project_onboarding_items from anon;
revoke all on table public.time_checkins from anon;

grant select on table public.onboarding_template_items to authenticated;
grant select on table public.project_onboarding_items to authenticated;
grant select on table public.time_checkins to authenticated;

grant all on table public.onboarding_template_items to service_role;
grant all on table public.project_onboarding_items to service_role;
grant all on table public.time_checkins to service_role;

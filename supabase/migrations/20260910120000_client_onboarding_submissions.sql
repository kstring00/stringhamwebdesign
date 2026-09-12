-- Let a client fill in their own onboarding items.
--
-- Until now `project_onboarding_items` had a SELECT policy and nothing else,
-- so a client could read their checklist but never answer it. Every item had
-- to be marked off by the admin on the client's behalf, which made the
-- "walk through onboarding in the portal" promise impossible at the database
-- level, not just the UI level.
--
-- The rule being encoded: a client may SUBMIT and REVISE their own items, and
-- may never ACCEPT one. Acceptance stays with the admin.
--
-- RLS policies cannot restrict which *columns* a statement touches, so that
-- half is a column-level GRANT. Both are required — the policy decides which
-- rows, the grant decides which columns.

-- ---------------------------------------------------------------------------
-- File-type items point at a real upload
-- ---------------------------------------------------------------------------

alter table public.project_onboarding_items
  add column if not exists file_id uuid references public.files(id) on delete set null;

comment on column public.project_onboarding_items.file_id is
  'For item_type = file. Set by the client on submit; cleared if the file is deleted.';

create index if not exists project_onboarding_file_idx
  on public.project_onboarding_items(file_id)
  where file_id is not null;

-- ---------------------------------------------------------------------------
-- Server-stamped submission, and a same-project check on the attached file
-- ---------------------------------------------------------------------------

create or replace function public.portal_stamp_onboarding_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The client is granted `status`, so `submitted_at` is stamped here rather
  -- than trusted from the request.
  if new.status = 'submitted' and old.status is distinct from 'submitted' then
    new.submitted_at = now();
  end if;

  -- A file id is only meaningful on this project. The foreign key alone would
  -- happily accept a file belonging to a different client's project.
  if new.file_id is not null and new.file_id is distinct from old.file_id then
    if not exists (
      select 1 from public.files f
      where f.id = new.file_id
        and f.project_id = new.project_id
    ) then
      raise exception
        'Attached file does not belong to this project (item %).', new.id
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.portal_stamp_onboarding_submission() from public, anon, authenticated;

drop trigger if exists project_onboarding_stamp_submission on public.project_onboarding_items;
create trigger project_onboarding_stamp_submission
before update on public.project_onboarding_items
for each row execute function public.portal_stamp_onboarding_submission();

-- ---------------------------------------------------------------------------
-- Which rows: the client's own, and not ones already settled
-- ---------------------------------------------------------------------------

drop policy if exists project_onboarding_client_submit on public.project_onboarding_items;
create policy project_onboarding_client_submit on public.project_onboarding_items
for update to authenticated
using (
  private.portal_can_access_project(project_id)
  -- An accepted or not-applicable item is closed. The client cannot reopen it.
  and status in ('pending', 'needs_changes', 'submitted')
)
with check (
  private.portal_can_access_project(project_id)
  -- The only statuses a client may write. 'accepted' is deliberately absent.
  and status in ('pending', 'submitted')
);

-- ---------------------------------------------------------------------------
-- Which columns: answer fields only
--
-- Without this the policy above would let a client rewrite `name`, `position`,
-- or `accepted_at`. UPDATE is granted per-column; SELECT stays table-wide.
-- ---------------------------------------------------------------------------

revoke update on table public.project_onboarding_items from authenticated;
grant update (status, value, file_id) on table public.project_onboarding_items to authenticated;

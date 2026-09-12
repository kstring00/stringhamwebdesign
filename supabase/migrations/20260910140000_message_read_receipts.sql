-- Let the recipient mark a message read.
--
-- `messages` had SELECT and INSERT policies and nothing else, and no code ever
-- wrote `read_at`. The admin dashboard's unread badge counts rows where
-- `read_at is null`, so it could only ever climb — a permanent phantom count
-- that no amount of reading would clear.
--
-- The rule: you may mark a message read only if you did NOT send it, and only
-- on a project you can already reach. Nobody can mark their own message read
-- on someone else's behalf, and nobody can un-read a message.

create or replace function public.portal_guard_message_read()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only read_at may change, and only from null to a timestamp. Everything
  -- else about a sent message is immutable.
  if new.body is distinct from old.body
     or new.sender_id is distinct from old.sender_id
     or new.project_id is distinct from old.project_id
     or new.created_at is distinct from old.created_at then
    raise exception 'A sent message cannot be edited.'
      using errcode = 'check_violation';
  end if;

  if old.read_at is not null and new.read_at is distinct from old.read_at then
    raise exception 'A message cannot be marked unread.'
      using errcode = 'check_violation';
  end if;

  -- Stamped here rather than trusted from the request.
  if new.read_at is not null and old.read_at is null then
    new.read_at = now();
  end if;

  return new;
end;
$$;

revoke all on function public.portal_guard_message_read() from public, anon, authenticated;

drop trigger if exists messages_guard_read on public.messages;
create trigger messages_guard_read
before update on public.messages
for each row execute function public.portal_guard_message_read();

drop policy if exists messages_mark_read_portal on public.messages;
create policy messages_mark_read_portal on public.messages
for update to authenticated
using (
  private.portal_can_access_project(project_id)
  -- You cannot mark your own message read.
  and sender_id <> auth.uid()
  and read_at is null
)
with check (
  private.portal_can_access_project(project_id)
  and sender_id <> auth.uid()
);

-- Column-level grant, same reasoning as the onboarding items: the policy
-- decides which rows, this decides which columns. Without it a client could
-- rewrite the body of a message Kyle sent them.
revoke update on table public.messages from authenticated;
grant update (read_at) on table public.messages to authenticated;

create index if not exists messages_unread_idx
  on public.messages (project_id, read_at)
  where read_at is null;

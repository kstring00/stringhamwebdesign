-- Stripe Invoicing: deposit / final invoices, care-plan subscriptions,
-- webhook idempotency, and the ownership-transfer rule.
--
-- The rule that final payment clears BEFORE account transfer is enforced by a
-- trigger, not by application code. A bug in a route handler, a hand-written
-- PostgREST call, or an admin clicking the wrong button must not be able to
-- transfer ownership of a project that has not been paid for.

-- ---------------------------------------------------------------------------
-- invoices: which half of the project this invoice is, and where to pay it
-- ---------------------------------------------------------------------------

alter table public.invoices
  add column if not exists kind text not null default 'other';

alter table public.invoices
  drop constraint if exists invoices_kind_check;

alter table public.invoices
  add constraint invoices_kind_check
  check (kind in ('deposit', 'final', 'care', 'other'));

alter table public.invoices
  add column if not exists stripe_customer_id text;

-- Stripe's hosted invoice page. This is what the client actually opens.
alter table public.invoices
  add column if not exists stripe_hosted_url text;

alter table public.invoices
  add column if not exists issued_at timestamptz;

-- One deposit and one final per project. Care and ad-hoc invoices are not
-- constrained, because a project can carry several of those over its life.
create unique index if not exists invoices_one_per_project_kind
  on public.invoices (project_id, kind)
  where kind in ('deposit', 'final');

-- ---------------------------------------------------------------------------
-- projects: the payment gate
-- ---------------------------------------------------------------------------

alter table public.projects
  add column if not exists final_payment_cleared_at timestamptz;

alter table public.projects
  add column if not exists ownership_transferred_at timestamptz;

comment on column public.projects.final_payment_cleared_at is
  'Set by the Stripe webhook when the final invoice is paid. Gates ownership transfer.';

comment on column public.projects.ownership_transferred_at is
  'When accounts (domain, hosting, repo, analytics) moved to the client. Cannot be set before final_payment_cleared_at.';

-- ---------------------------------------------------------------------------
-- The hard rule, at the database level
-- ---------------------------------------------------------------------------

create or replace function public.enforce_payment_before_transfer()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ownership_transferred_at is null then
    return new;
  end if;

  if new.final_payment_cleared_at is null then
    raise exception
      'Ownership cannot transfer before the final payment clears (project %).',
      new.id
      using errcode = 'check_violation';
  end if;

  if new.ownership_transferred_at < new.final_payment_cleared_at then
    raise exception
      'Ownership transfer cannot predate the final payment (project %).',
      new.id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists projects_payment_before_transfer on public.projects;

create trigger projects_payment_before_transfer
  before insert or update on public.projects
  for each row
  execute function public.enforce_payment_before_transfer();

-- ---------------------------------------------------------------------------
-- Webhook idempotency
--
-- Stripe retries on any non-2xx and can deliver the same event more than once
-- even on success. The webhook claims an event id here first; a duplicate hits
-- the primary key, the insert fails, and the handler returns 200 without
-- applying the state change twice.
-- ---------------------------------------------------------------------------

create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now(),
  handled_at timestamptz,
  status text not null default 'received'
    check (status in ('received', 'handled', 'ignored', 'failed')),
  detail text
);

create index if not exists stripe_events_received_at_idx
  on public.stripe_events (received_at desc);

-- Nothing outside the service role has any business reading Stripe event
-- traffic. RLS on with no policies denies every anon and authenticated request;
-- the secret key used by the webhook bypasses it.
alter table public.stripe_events enable row level security;

revoke all on table public.stripe_events from anon, authenticated;

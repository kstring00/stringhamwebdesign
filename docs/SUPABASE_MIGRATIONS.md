# Applying database migrations

Two ways to get the SQL in `supabase/migrations/` into the hosted project:

1. **Paste it into the Supabase SQL editor.** No setup, works from a browser.
   Use this for the outstanding migrations right now.
2. **`npm run db:push`.** The CLI works out what the project is missing and
   applies it. Use this from here on.

Do step 1 first, then do the one-time CLI setup at the bottom. The order
matters: the CLI needs to be told which migrations were already applied by
hand, and you can only tell it that once they actually are.

---

## The migrations, in order

Migrations run in filename order. The timestamp prefix is what sorts them, so
never rename a file that has already been applied.

| # | File | State |
|---|------|-------|
| 1 | `20260904232200_create_ai_intake_schema.sql` | Applied |
| 2 | `20260906214000_create_client_portal.sql` | Applied |
| 3 | `20260906214500_harden_portal_rls_helpers.sql` | Applied |
| 4 | `20260906215000_move_portal_rls_helpers_private.sql` | Applied |
| 5 | `20260906225427_admin_dashboard_onboarding.sql` | Applied |
| 6 | `20260907021000_portal_magic_link_windows.sql` | Applied |
| 7 | `20260908120000_stripe_invoicing.sql` | Applied |
| 8 | `20260908180000_grant_stripe_events_to_service_role.sql` | **Probably not** |
| 9 | `20260910120000_client_onboarding_submissions.sql` | **Not applied** |
| 10 | `20260910140000_message_read_receipts.sql` | **Not applied** |

A caveat on that column, because it matters more than the table implies: 1–7
are marked applied because the Stripe test run on 2026-09-08 wrote 14 rows to
`stripe_events`, which cannot happen unless #7 ran, and #7 cannot run unless
1–6 did. #8 was written after that run and probably never applied. #9 and #10
were written on 2026-09-10 and there has been no opportunity to apply them.

Don't take my word for it. Run the query in the next section and let the
database tell you.

### Check for yourself

Paste this into the SQL editor. It reports on the three that are in question.

```sql
select
  '08 grant_stripe_events' as migration,
  -- Inconclusive by design: Supabase's project-level default privileges
  -- already give service_role access, so this cannot distinguish "granted
  -- explicitly" from "granted by default". Re-running #8 is harmless either
  -- way, so just run it.
  'inconclusive — run it regardless' as status
union all
select
  '09 onboarding_submissions',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'project_onboarding_items'
      and column_name = 'file_id'
  ) then 'applied' else 'NOT applied' end
union all
select
  '10 message_read_receipts',
  case when exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'portal_guard_message_read'
  ) then 'applied' else 'NOT applied' end;
```

Every outstanding migration is written to be safe to run twice — `if not
exists`, `drop ... if exists` before each `create`, `create or replace` on
every function. If you are unsure whether one ran, run it.

---

## Route 1 — the SQL editor, step by step

Do the three in order: #8, then #9, then #10. One at a time. Don't paste all
three into one tab.

**1. Open the editor.**
Go to [supabase.com/dashboard](https://supabase.com/dashboard), click your
project, then **SQL Editor** in the left sidebar. Click **New query**.

**2. Open the migration file on your machine.**

```bash
cat supabase/migrations/20260908180000_grant_stripe_events_to_service_role.sql
```

Or just open it in your editor. Select all of it — including the `--` comment
lines at the top, they're inert — and copy.

**3. Paste into the empty query tab.** The whole file, nothing trimmed.

**4. Click Run.** (Or `Cmd/Ctrl + Enter`.)

**5. Read the result.**

- `Success. No rows returned.` — that's what success looks like for schema
  changes. They don't return rows. Move on.
- A red error — stop. Don't run the next file. Copy the full error text; the
  line number in it refers to the pasted SQL, so it points straight at the
  statement that failed.

**6. Repeat for the next file.** Click **New query** for a fresh tab, then:

```bash
cat supabase/migrations/20260910120000_client_onboarding_submissions.sql
```

and then:

```bash
cat supabase/migrations/20260910140000_message_read_receipts.sql
```

**7. Confirm.** Re-run the check query from the section above. #9 and #10
should both now say `applied`.

### What these two actually change

Worth knowing before you run them, because both hand new write permission to
signed-in clients.

`20260910120000_client_onboarding_submissions.sql` lets a client submit an
onboarding item and pull a submission back to revise it. It cannot let them
accept their own work: the policy restricts which *rows* they can touch, and
the `grant update (status, value, file_id)` restricts which *columns* — RLS
alone cannot do the second, which is why both are there. Accepting writes
`accepted_at`, which is not in that grant list.

`20260910140000_message_read_receipts.sql` lets a recipient mark a message
read. A trigger rejects any edit to the body, sender, project or timestamp,
rejects un-reading, and stamps `read_at` from the server clock rather than
trusting the value in the request. Without this the admin unread badge can
only ever climb.

### If something goes wrong

These migrations don't drop data. The worst realistic failure is a policy or
trigger that half-applied, and re-running the file fixes that — every
`create` is preceded by its `drop ... if exists`.

To back one out, the reverse of #10 is:

```sql
drop trigger if exists messages_guard_read on public.messages;
drop policy if exists messages_mark_read_portal on public.messages;
revoke update on table public.messages from authenticated;
drop function if exists public.portal_guard_message_read();
```

---

## Route 2 — wiring up the CLI

One-time setup. After this, `npm run db:push` applies anything the project is
missing and you never open the SQL editor for a migration again.

The CLI is now a dev dependency (`supabase` in `package.json`) and
`supabase/config.toml` is committed, so there is nothing to install globally.

### 1. Log in

```bash
npx supabase login
```

This opens a browser and stores an access token in your OS keychain — not in
this repo, and not in `.env.local`. Nothing secret gets written to a file here.

### 2. Link this folder to the hosted project

```bash
npm run db:link -- --project-ref <your-project-ref>
```

Your project ref is the subdomain in `SUPABASE_URL` — for
`https://abcdefghijkl.supabase.co`, the ref is `abcdefghijkl`. You can also
read it from the dashboard URL, or Project Settings > General.

It will prompt for your **database password**. That is not your Supabase
account password — it's the Postgres password set when the project was
created. If you don't have it, reset it at Project Settings > Database >
Database password. Resetting it is safe: nothing in this repo connects with
it, because the app talks to PostgREST with `SUPABASE_SECRET_KEY` instead.

Linking writes `supabase/.temp/`, which the generated `supabase/.gitignore`
already excludes.

### 3. Reconcile the migration history — do not skip this

This is the step that will bite you if you miss it, and the shape of the
problem was not what I expected before looking.

`db push` never inspects your schema. It decides what to run by comparing the
files here against a `supabase_migrations.schema_migrations` table in your
project. That table is the entire source of truth, and it had drifted from
reality in two directions at once.

**Run `npm run db:status` first and read both columns as separate lists.** On
2026-09-11 it printed this:

- Five versions in **Remote** with no matching file: `20260904232210`,
  `20260906213110`, `20260906213234`, `20260906213309`, `20260907020833`.
- Nine local files with **nothing in Remote**.
- Exactly one version in both: `20260906225427`.

Two different histories, from two different ways of applying SQL:

- Migrations applied through Supabase's MCP `apply_migration` tool *do* write
  to the history table, stamped with their own timestamp — seconds or minutes
  off the repo filename. Those were the five orphans, and querying their
  `name` column showed each one matched a repo file exactly
  (`create_client_portal`, `harden_portal_rls_helpers`, and so on).
- Migrations pasted into the SQL editor write nothing at all. Those were the
  four newest, invisible to the CLI despite being live in the database.

**Before deleting any history row, read what it is.** In the SQL editor:

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

If every remote-only row names a migration you also have as a file, the
records are duplicates under different names and clearing them loses nothing.
If one names schema work that exists *only* there, deleting the record would
hide that fact permanently — stop and reconcile it into a file first.

Then, once the names check out, drop the duplicate records:

```bash
npx supabase migration repair --linked --status reverted \
  20260904232210 20260906213110 20260906213234 20260906213309 20260907020833
```

and record the files you actually have:

```bash
npx supabase migration repair --linked --status applied \
  20260904232200 20260906214000 20260906214500 20260906215000 \
  20260906225427 20260907021000 20260908120000 20260908180000 \
  20260910120000 20260910140000
```

`migration repair` only writes to that bookkeeping table. Neither status runs
any SQL from your migrations — `reverted` deletes a row, it does not roll
anything back. Your tables, policies and triggers are untouched by both
commands.

This reconciliation is a one-time fix for how this project was built. Once
`db push` is the only way migrations reach the database, the history stays
correct on its own and none of the above is needed again.

### 4. Confirm

```bash
npm run db:status
```

Ten rows, the same version in both the Local and Remote columns on every one,
and no row carrying a Remote value with a blank Local. A version present
locally but blank remotely is a migration still to apply; a version present
remotely but blank locally is history describing a file you do not have.

```bash
npm run db:push -- --dry-run
```

`Remote database is up to date.` — that is the CLI and the database agreeing,
and it is the point of all of the above.

### From then on

```bash
npm run db:status    # what's applied where
npm run db:push -- --dry-run   # what WOULD be applied, applying nothing
npm run db:push      # apply anything outstanding
npm run db:diff      # schema drift: changes made in the dashboard that
                     # aren't captured in a migration file
```

Make `--dry-run` a habit before `db:push` on this project. It prints the list
of files it is about to run and touches nothing, which is how you catch a
missed `migration repair` before it does anything rather than after.

`db:diff` builds a throwaway copy of the schema to compare against, so it
needs Docker running. `db:status` and `db:push` do not.

To add a migration, create the file yourself with a timestamp prefix ahead of
the last one (`YYYYMMDDHHMMSS_short_name.sql`) or run
`npx supabase migration new short_name`, then `npm run db:push`.

Two rules that keep this working:

- **Never edit a migration that has been applied.** Write a new one. The
  applied file is a record of what the database already did.
- **Never rename one.** The timestamp prefix is the key in
  `schema_migrations`; renaming makes the CLI think it is a new migration.

### About `supabase/config.toml`

It configures the **local** Supabase stack (`supabase start`), not the hosted
project — with one exception: `supabase config push` would write parts of it
to the hosted project and overwrite the dashboard settings. Don't run that
casually. In particular the hosted project's Authentication > URL
Configuration redirect allow-list, which the magic link depends on, is
managed in the dashboard (see `docs/PORTAL_TESTING.md`).

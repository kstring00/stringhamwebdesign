# Testing the portal locally

Before this, magic links were hardcoded to `https://www.stringhamwebdesign.com/portal`,
so a link requested from a dev server sent you to production and local sign-in
was impossible. `PORTAL_URL` now controls that.

---

## Before you start

The onboarding and read-receipt features below need
`20260910120000_client_onboarding_submissions.sql` and
`20260910140000_message_read_receipts.sql` applied. Without them the UI renders
but every submit and every read receipt comes back as a permission error.
See `docs/SUPABASE_MIGRATIONS.md`.

---

## One-time setup

### 1. Environment

Add to `.env.local`:

```bash
PORTAL_URL=http://localhost:3000/portal
PORTAL_ADMIN_EMAIL=stringham00@gmail.com   # optional; this is the default
```

`PORTAL_URL` falls back to `NEXT_PUBLIC_SITE_URL` + `/portal`, then to
`http://localhost:3000/portal`. In a **production** build with none of them set,
the boot log prints a warning — because clients would otherwise be mailed a link
to their own machine.

**Two different email senders are in play, and only one is needed to sign in.**
Magic links come from Supabase Auth's own SMTP (`/auth/v1/otp`), so sign-in
works with `RESEND_API_KEY` unset. Portal *notifications* — new message, new
file, the ten-hour check-in — go through Resend, and `app/lib/portalEmail.ts`
returns `{ sent: false, reason: "no-api-key" }` without it. Nothing errors; the
mail simply never arrives. Set `RESEND_API_KEY` if you want to test step 7.

### 2. Supabase redirect allow-list — do not skip

Supabase refuses any redirect target it has not been told about, and it fails
**quietly**: the link works, you land on the site root, and nothing explains why.

Supabase Dashboard → **Authentication → URL Configuration → Redirect URLs**, add:

```
http://localhost:3000/portal
https://www.stringhamwebdesign.com/portal
```

### 3. Start the server

```bash
npm run dev
```

Use `dev`, not `start`. Session cookies are `Secure` in production builds, so
they are dropped over plain HTTP and you will appear to sign in and immediately
bounce back out.

---

## Creating a test client end to end

You need a second email address you can actually open. A Gmail `+` alias works:
`stringham00+testclient@gmail.com` is a distinct account to Supabase and to the
portal, and the mail still lands in your inbox.

### Step 1 — sign in as yourself

1. Go to `http://localhost:3000/portal`.
2. Enter your admin address (the one in `PORTAL_ADMIN_EMAIL`).
3. Open the emailed link. Your admin account is created automatically on first
   sign-in — `bootstrapAdminIfNeeded()` matches only that one address.
4. You land on `/portal/dashboard`.

### Step 2 — create the client

1. **Quick add → Add new client** (top right).
2. Fill in:
   - Client name — `Test Client`
   - Email — `stringham00+testclient@gmail.com`
   - Business name — `Test Practice`
   - First project — `Test Website`
3. Save.

That one action does five things: creates the Supabase auth user, the `users`
row with `role = 'client'`, the `clients` row, the first project, and mails the
invite. The onboarding checklist is cloned onto the project by a database
trigger, so it exists before the page finishes reloading.

### Step 3 — confirm it worked, as admin

On the dashboard you should now see:

- **Active projects** — one row, phase `Consultation`, onboarding `0%`
- **Onboarding checklist** — 8 items, all Pending
- **Client invites** — `Test Practice`, with a "Sent" timestamp
- **Needs you** — an onboarding item waiting on the client

### Step 4 — become the client

Use a **private/incognito window**. The portal keeps one session per browser
profile, so signing in as the client in your normal window signs you out as
admin.

1. `http://localhost:3000/portal` in the private window.
2. Enter `stringham00+testclient@gmail.com`.
3. Open the link from your inbox.
4. You land on `/portal/projects` — the client side.

### Step 5 — check isolation

This is the part worth doing deliberately, because it is the promise that
matters most.

As the client you should see **only** `Test Website`. Then, still as the client,
open `http://localhost:3000/portal/dashboard` directly. You should be redirected
straight back to `/portal/projects` — not shown the admin dashboard.

That redirect is only the visible half. The real guarantee is in Postgres: every
client-facing read goes through the client's own JWT, and row-level security
policies restrict each table to rows reachable from that user's `clients` row.
Even a request forged by hand returns nothing.

### Step 6 — exercise both directions

Keep both windows open side by side.

| As admin | As client |
|---|---|
| Quick add → **Log time** against Test Website | Timesheet shows the entry |
| Quick add → **Send message** | Message appears in the thread; reply comes back |
| **Upload files** | File appears, downloadable |
| Checklist → **Accept** / **Request changes** | Item status updates |

Reload the other window after each action — live updates are not wired up yet.

### Step 7 — the client-side tabs

These are what the two 2026-09-10 migrations exist for. If any of them come
back as a permission error, the migration did not apply — check
`docs/SUPABASE_MIGRATIONS.md`.

**Onboarding tab.** The 8 cloned items, split into *Yours to do* and *With
Kyle*. As the client:

1. Type an answer into **Brand colors** and **Send to Kyle**. It moves to *With
   Kyle*, status "With Kyle for review".
2. Click **Change my answer** on it. It comes back to *Yours to do*. This is
   the pull-back path, and it is allowed.
3. Upload something to **Logo files**. It uploads through the files route
   first, then attaches.
4. As admin, **Request changes** on one item with a note. As the client it
   reappears under *Yours to do* with the note shown.

The rule worth confirming by hand: a client can submit and retract, and can
never accept. `accepted_at` is outside the column grant, so even a forged
request cannot set it — only the admin route can.

**Timesheet tab.** After logging time as admin, the client sees entries grouped
by month with a running total, and a meter showing hours since the last
check-in. An entry that crosses a 10-hour boundary is marked inline, saying
"sent" if you marked the check-in sent as admin and "reached" if you have not.

**Messages tab and read receipts.** Send a message as admin, then open the
Messages tab as the client. Reload the admin window — the unread dot on that
message should now be gone. Before the read-receipt migration that dot could
only ever accumulate. A client cannot mark their *own* message read, and
nothing can mark a message unread again; both are rejected by a trigger.

Tabs are in the URL (`?tab=onboarding`), so a reload keeps your place and the
back button works.

---

## Cleaning up

Delete in this order, or foreign keys will block you. In the Supabase SQL editor:

```sql
-- Replace with the test address you used.
with victim as (select id from public.users where email = 'stringham00+testclient@gmail.com')
delete from public.clients where user_id in (select id from victim);

delete from public.users where email = 'stringham00+testclient@gmail.com';
```

`clients` → `projects` → checklist items, files, messages and time entries all
cascade on delete, so removing the client row clears the project data with it.
Then delete the auth user under **Authentication → Users**.

---

## When something does not work

| Symptom | Cause |
|---|---|
| Link goes to the live site | `PORTAL_URL` not set in `.env.local`, or server not restarted |
| Link lands on the site root, not the portal | The URL is missing from Supabase's Redirect URLs |
| Sign in, then immediately bounced out | Running `npm run start` instead of `npm run dev` — `Secure` cookies over HTTP |
| "This sign-in link has expired" | Links are single-use and expire in 15 minutes. Request another |
| No email at all | Expected for an address with no account — the portal is invite-only and deliberately gives the same answer either way. Check the server log for `Portal sign-in requested for unknown account` |
| Repeated requests send nothing | 60-second resend throttle |
| Emails stop arriving partway through this runbook | Supabase's **built-in** SMTP is rate limited per hour (a handful of messages on the default setting). This walkthrough sends three. Dashboard → Authentication → Rate Limits shows the ceiling; wait it out, or configure custom SMTP |
| Notification emails never arrive, sign-in works fine | `RESEND_API_KEY` unset. Sign-in uses Supabase SMTP, notifications use Resend |

## Related checks

```bash
node scripts/portal-auth-check.js   # invite-only + no enumeration oracle; see scripts/README.md
```

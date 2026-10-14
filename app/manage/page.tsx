import type { Metadata } from "next";
import { cookies } from "next/headers";

import { REFERRAL_RATE } from "../data/referral";
import { site } from "../data/site";
import { ADMIN_COOKIE, adminConfigured, validSession } from "../lib/adminAuth";
import { listLeads, listPartners, owed, STATUS_LABEL, type Lead, type Partner } from "../lib/referrals";
import { supabaseConfigured } from "../lib/supabase";
import LeadRow from "./LeadRow";
import s from "./manage.module.css";

export const metadata: Metadata = {
  title: { absolute: "Admin · Referrals | Stringham Web Design" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const ERRORS: Record<string, string> = { wrong: "That password didn't match.", busy: "Too many tries. Wait a few minutes.", setup: "ADMIN_PASSWORD isn't set yet." };

function Setup({ missing }: { missing: string[] }) {
  return (
    <div className={s.setup}>
      <h2>One-time setup</h2>
      <p>Add these in Vercel → Project → Settings → Environment Variables, then redeploy:</p>
      <ul>{missing.map((m) => <li key={m}><code>{m}</code></li>)}</ul>
      <p>Then run <code>supabase/migrations/20261014000000_referrals.sql</code> once in Supabase → SQL Editor.</p>
    </div>
  );
}

/**
 * The admin portal's Referrals view, at /manage (not /admin, which still
 * 301s to the home page from the old portal and may be cached that way).
 * Behind one password. Lists every partner with their code and links, and
 * the leads attributed to each with a status Kyle sets by hand: new →
 * quoted → hired → client paid → partner paid. The 20% shows once a lead
 * is marked paid. Not indexed, and Clarity never loads here.
 */
export default async function ManagePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const signedIn = validSession((await cookies()).get(ADMIN_COOKIE)?.value);

  if (!adminConfigured() || !signedIn) {
    return (
      <section className={`container ${s.page}`} data-clarity-mask="true">
        <div className={s.login}>
          <p className={s.eyebrow}>Admin</p>
          <h1 className={s.h1}>Sign in</h1>
          {!adminConfigured() ? <Setup missing={["ADMIN_PASSWORD (8+ characters)"]} /> : (
            <form method="post" action="/api/manage/login" className={s.loginForm}>
              <label>Password<input type="password" name="password" autoComplete="current-password" required minLength={8} /></label>
              {error && ERRORS[error] ? <p className={s.err} role="alert">{ERRORS[error]}</p> : null}
              <button className="btn" type="submit">Sign in</button>
            </form>
          )}
        </div>
      </section>
    );
  }

  let partners: Partner[] = [], leads: Lead[] = [], loadError = "";
  if (supabaseConfigured()) {
    try { [partners, leads] = await Promise.all([listPartners(), listLeads()]); }
    catch { loadError = "Couldn't reach Supabase. Check SUPABASE_URL and SUPABASE_SECRET_KEY, and that the referrals SQL has been run."; }
  }
  const byCode = new Map<string, Lead[]>();
  for (const l of leads) byCode.set(l.partner_code, [...(byCode.get(l.partner_code) ?? []), l]);
  const owedNow = leads.filter((l) => l.status === "paid").reduce((a, l) => a + owed(l), 0);
  const paidOut = leads.filter((l) => l.status === "partner_paid").reduce((a, l) => a + owed(l), 0);

  return (
    <section className={`container ${s.page}`} data-clarity-mask="true">
      <header className={s.head}>
        <div>
          <p className={s.eyebrow}>Admin</p>
          <h1 className={s.h1}>Referrals</h1>
        </div>
        <form method="post" action="/api/manage/logout"><button type="submit" className={s.signOut}>Sign out</button></form>
      </header>

      {!supabaseConfigured() ? <Setup missing={["SUPABASE_URL", "SUPABASE_SECRET_KEY"]} /> : loadError ? <p className={s.err} role="alert">{loadError}</p> : (
        <>
          <dl className={s.totals}>
            <div><dt>Partners</dt><dd>{partners.length}</dd></div>
            <div><dt>Referred leads</dt><dd>{leads.length}</dd></div>
            <div><dt>Hired so far</dt><dd>{leads.filter((l) => ["hired", "paid", "partner_paid"].includes(l.status)).length}</dd></div>
            <div><dt>Owed to partners now</dt><dd>{money(owedNow)}</dd></div>
            <div><dt>Paid to partners</dt><dd>{money(paidOut)}</dd></div>
          </dl>
          <p className={s.how}>Statuses: {Object.values(STATUS_LABEL).join(" → ")}. Set the build price from the client&rsquo;s written quote (Website Care never counts); the partner&rsquo;s {Math.round(REFERRAL_RATE * 100)}% shows once you mark the lead paid. Pay within 14 days of the client paying in full.</p>

          {partners.length ? (
            <ul className={s.partners}>
              {partners.map((p) => {
                const mine = byCode.get(p.code) ?? [];
                const due = mine.filter((l) => l.status === "paid").reduce((a, l) => a + owed(l), 0);
                return (
                  <li key={p.id} className={s.partner}>
                    <div className={s.partnerHead}>
                      <div>
                        <h2 className={s.partnerName}>{p.name} <code className={s.code}>{p.code}</code>{p.active ? null : <span className={s.inactive}>inactive</span>}</h2>
                        <p className={s.partnerMeta}>
                          <a href={`mailto:${p.email}`}>{p.email}</a>
                          {p.phone ? <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>{p.phone}</a> : null}
                          <span>Joined {date(p.created_at)}</span>
                          <span>{site.url.replace(/^https?:\/\/(www\.)?/, "")}/checkup?ref={p.code}</span>
                        </p>
                        {p.how_they_know ? <p className={s.partnerHow}>{p.how_they_know}</p> : null}
                      </div>
                      <p className={s.partnerSum}><b>{mine.length}</b> lead{mine.length === 1 ? "" : "s"}{due ? <> · <b>{money(due)}</b> owed</> : null}</p>
                    </div>
                    {mine.length ? (
                      <ul className={s.leads}>{mine.map((l) => <LeadRow key={l.id} lead={l} rate={REFERRAL_RATE} />)}</ul>
                    ) : <p className={s.empty}>No leads from this link yet.</p>}
                  </li>
                );
              })}
            </ul>
          ) : <p className={s.empty}>No partners yet. Share <a className="u" href="/partners/join">/partners/join</a>.</p>}
        </>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import { cookies } from "next/headers";

import { REFERRAL_RATE } from "../data/referral";
import { site } from "../data/site";
import { ADMIN_COOKIE, adminConfigured, validSession } from "../lib/adminAuth";
import { EVIDENCE_NOTE, kindSummary, monthLabel, monthRows, rates, sourceRead, sourceRows } from "../lib/leadStats";
import { KIND_LABEL, listLeads, listPartners, listSearchMonths, owed, STATUS_LABEL, type Lead, type Partner, type SearchMonth } from "../lib/referrals";
import { supabaseConfigured } from "../lib/supabase";
import ExplainLeads from "./ExplainLeads";
import LeadRow, { type LeadView } from "./LeadRow";
import LogLead from "./LogLead";
import s from "./manage.module.css";
import SearchMonthForm from "./SearchMonthForm";

export const metadata: Metadata = {
  title: { absolute: "Admin · Leads | Stringham Web Design" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const pc = (n: number | null) => (n === null ? "–" : `${n}%`);
const ERRORS: Record<string, string> = { wrong: "That password didn't match.", busy: "Too many tries. Wait a few minutes.", setup: "ADMIN_PASSWORD isn't set yet." };
const SEARCH_CONSOLE = "https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Astringhamwebdesign.com";

function Setup({ missing }: { missing: string[] }) {
  return (
    <div className={s.setup}>
      <h2>One-time setup</h2>
      <p>Add these in Vercel → Project → Settings → Environment Variables, then redeploy:</p>
      <ul>{missing.map((m) => <li key={m}><code>{m}</code></li>)}</ul>
      <p>Then run <code>supabase/migrations/20261024000000_leads.sql</code> once in Supabase → SQL Editor (it creates or widens the tables; safe to run again).</p>
    </div>
  );
}

const view = (l: Lead): LeadView => {
  const r = sourceRead(l);
  return { ...l, kindLabel: KIND_LABEL[l.kind] ?? l.kind, source: r.label, evidence: r.evidence, evidenceNote: EVIDENCE_NOTE[r.evidence] };
};

/**
 * The admin, at /manage: the month's leads at a glance, the last six
 * months as a table (with Search Console beside them), where leads come
 * from with the evidence behind each source, the "Explain my leads"
 * button, a form to log a call or text, every lead with the status Kyle
 * sets by hand, and the referral partners with what they're owed. Behind
 * one password. Not indexed, and Clarity never loads here.
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

  let partners: Partner[] = [], leads: Lead[] = [], search: SearchMonth[] = [], loadError = "";
  if (supabaseConfigured()) {
    try { [partners, leads, search] = await Promise.all([listPartners(), listLeads(), listSearchMonths()]); }
    catch { loadError = "Couldn't reach Supabase. Check SUPABASE_URL and SUPABASE_SECRET_KEY, and that supabase/migrations/20261024000000_leads.sql has been run."; }
  }

  const now = new Date();
  const months = monthRows(leads, search, now);
  const thisMonth = months[0];
  const r = rates(thisMonth);
  const sources = sourceRows(leads);
  const unknown = sources.find((x) => x.evidence === "unknown");
  const referred = leads.filter((l) => l.partner_code);
  const byCode = new Map<string, Lead[]>();
  for (const l of referred) byCode.set(l.partner_code!, [...(byCode.get(l.partner_code!) ?? []), l]);
  // Only a referred lead can owe a partner anything (owed() returns 0 otherwise).
  const owedNow = referred.filter((l) => l.status === "paid").reduce((a, l) => a + owed(l), 0);
  const paidOut = referred.filter((l) => l.status === "partner_paid").reduce((a, l) => a + owed(l), 0);
  const defaultMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);

  return (
    <section className={`container ${s.page}`} data-clarity-mask="true">
      <header className={s.head}>
        <div>
          <p className={s.eyebrow}>Admin</p>
          <h1 className={s.h1}>Leads</h1>
        </div>
        <form method="post" action="/api/manage/logout"><button type="submit" className={s.signOut}>Sign out</button></form>
      </header>

      {!supabaseConfigured() ? <Setup missing={["SUPABASE_URL", "SUPABASE_SECRET_KEY"]} /> : loadError ? <p className={s.err} role="alert">{loadError}</p> : (
        <>
          {/* 1. This month, at a glance. Cohort by the month the lead came in; "signed this month" by signing date. */}
          <h2 className={s.h2}>{monthLabel(thisMonth.month)}</h2>
          <dl className={s.totals}>
            <div><dt>Inquiries</dt><dd>{thisMonth.inquiries}</dd></div>
            <div><dt>Consultations</dt><dd>{thisMonth.consulted}</dd></div>
            <div><dt>Quotes sent</dt><dd>{thisMonth.quoted}</dd></div>
            <div><dt>Signed, from this month&rsquo;s inquiries</dt><dd>{thisMonth.signed}</dd></div>
            <div><dt>Signed this calendar month</dt><dd>{thisMonth.signedThisMonth}</dd></div>
          </dl>
          <p className={s.how}>
            {thisMonth.inquiries ? <>{kindSummary(thisMonth.byKind)}. Sources: {Object.entries(thisMonth.bySource).map(([k, n]) => `${k} ${n}`).join(" · ")}. Inquiry → client so far: {pc(r.sign)}. </> : "No inquiries yet this month. "}
            {thisMonth.partnerInquiries ? `${thisMonth.partnerInquiries} partner ${thisMonth.partnerInquiries === 1 ? "inquiry" : "inquiries"}, counted separately. ` : ""}
            {thisMonth.lost ? `${thisMonth.lost} lost (real, no project; still counted). ` : ""}
            {thisMonth.spam ? `${thisMonth.spam} spam, left out. ` : ""}
            An inquiry is a validated form or a logged call or text from a prospective website customer; taps on the phone number don&rsquo;t count. The goal is one signed client a month.
          </p>

          {/* 2. The last six months, with Search Console beside them. */}
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className="sr-only">Leads and search by month</caption>
              <thead>
                <tr><th scope="col">Month</th><th scope="col">Inquiries</th><th scope="col">Lost</th><th scope="col">Consults</th><th scope="col">Quotes</th><th scope="col">Signed (cohort)</th><th scope="col">Signed (calendar)</th><th scope="col">Paid</th><th scope="col">Inquiry → quote</th><th scope="col">Quote → signed</th><th scope="col">Search impressions</th><th scope="col">Search clicks</th></tr>
              </thead>
              <tbody>
                {months.map((m) => {
                  const mr = rates(m);
                  return (
                    <tr key={m.month}>
                      <th scope="row">{monthLabel(m.month)}</th>
                      <td>{m.inquiries}{m.partnerInquiries || m.spam ? <small>{[m.partnerInquiries ? `+${m.partnerInquiries} partner` : "", m.spam ? `${m.spam} spam out` : ""].filter(Boolean).join(" · ")}</small> : null}</td>
                      <td>{m.lost}</td><td>{m.consulted}</td><td>{m.quoted}</td><td>{m.signed}</td><td>{m.signedThisMonth}</td><td>{m.paid}</td>
                      <td>{pc(mr.quote)}</td><td>{pc(mr.quoteToSign)}</td>
                      <td>{m.search ? m.search.impressions.toLocaleString("en-US") : "–"}</td>
                      <td>{m.search ? m.search.clicks.toLocaleString("en-US") : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 3. Where leads come from, all time, with the evidence behind each line. Deterministic. */}
          <h2 className={s.h2}>Where inquiries come from</h2>
          {sources.length ? (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <caption className="sr-only">Inquiries by source</caption>
                <thead><tr><th scope="col">Source</th><th scope="col">Evidence</th><th scope="col">Inquiries</th><th scope="col">Quoted</th><th scope="col">Signed</th><th scope="col">Lost</th><th scope="col">Inquiry → signed</th></tr></thead>
                <tbody>
                  {sources.map((x) => (
                    <tr key={x.label}>
                      <th scope="row">{x.label}</th>
                      <td title={EVIDENCE_NOTE[x.evidence]}>{x.evidence}</td>
                      <td>{x.inquiries}</td><td>{x.quoted}</td><td>{x.signed}</td><td>{x.lost}</td><td>{pc(x.signRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className={s.empty}>No inquiries yet.</p>}
          <p className={s.how}>
            <b>How to read the evidence column.</b> <i>partner</i> and <i>campaign</i> are tagged links (a partner&rsquo;s code, or utm tags such as the business card&rsquo;s): strong. <i>referrer</i> is what the browser reported as the previous site: usually right, often stripped. <i>self-reported</i> is what the person said. <i>unknown</i> means none of those{unknown ? ` (${unknown.inquiries} ${unknown.inquiries === 1 ? "inquiry" : "inquiries"} so far)` : ""}: it could be typed, a bookmark, a private browser or an app that hides where it came from. It is not proof of a direct visit.
          </p>

          <div className={s.panel}>
            <h2 className={s.h2}>Explain my leads</h2>
            <p className={s.panelHow}>A plain-English reading of the numbers on this page: where inquiries came from, how they moved through the funnel, and what&rsquo;s worth checking next. It only ever sees the counts, never a name, contact, note, partner code or website.</p>
            <ExplainLeads configured={Boolean(process.env.ANTHROPIC_API_KEY)} />
          </div>

          <div className={s.twoUp}>
            <div className={s.panel}>
              <h2 className={s.h2}>Log a call or text</h2>
              <p className={s.panelHow}>A conversation you had by phone. It counts as an inquiry for the month you log it.</p>
              <LogLead />
            </div>
            <div className={s.panel}>
              <h2 className={s.h2}>Search Console, by month</h2>
              <p className={s.panelHow}>Once Google shows data, open the <a className="u" href={SEARCH_CONSOLE} target="_blank" rel="noopener noreferrer">Performance report<span className="sr-only"> (opens in a new tab)</span></a>, set the date range to the month, and type in the totals. Saving a month again replaces it.</p>
              <SearchMonthForm defaultMonth={defaultMonth} />
              {search.length ? <p className={s.panelHow}>Latest saved: {search.slice(0, 3).map((m) => `${monthLabel(m.month.slice(0, 7))}: ${m.impressions.toLocaleString("en-US")} impressions, ${m.clicks.toLocaleString("en-US")} clicks`).join(" · ")}{search[0].note ? ` · ${search[0].note}` : ""}</p> : null}
            </div>
          </div>

          {/* 4. Every lead, newest first. */}
          <h2 className={s.h2}>All leads</h2>
          <p className={s.how}>Statuses: {Object.values(STATUS_LABEL).join(" → ")}. &ldquo;Hired&rdquo; sets the signed date. Set the build price from the written quote once it&rsquo;s sent (Website Care never counts).</p>
          {leads.length ? (
            <ul className={s.leads}>{leads.map((l) => <LeadRow key={l.id} lead={view(l)} rate={REFERRAL_RATE} />)}</ul>
          ) : <p className={s.empty}>No leads yet. Every form on the site lands here; calls and texts you log above do too.</p>}

          {/* 5. Referral partners and what they're owed: referred leads only. */}
          <h2 className={s.h2}>Referral partners</h2>
          <dl className={s.totals}>
            <div><dt>Partners</dt><dd>{partners.length}</dd></div>
            <div><dt>Referred leads</dt><dd>{referred.length}</dd></div>
            <div><dt>Hired so far</dt><dd>{referred.filter((l) => ["hired", "paid", "partner_paid"].includes(l.status)).length}</dd></div>
            <div><dt>Owed to partners now</dt><dd>{money(owedNow)}</dd></div>
            <div><dt>Paid to partners</dt><dd>{money(paidOut)}</dd></div>
          </dl>
          <p className={s.how}>The partner&rsquo;s {Math.round(REFERRAL_RATE * 100)}% shows on their lead once you mark it &ldquo;Client paid&rdquo;. Pay within 14 days of the client paying in full, then mark it &ldquo;Partner paid&rdquo;. Direct clients never owe a partner fee.</p>
          {partners.length ? (
            <ul className={s.partners}>
              {partners.map((p) => {
                const mine = byCode.get(p.code) ?? [];
                const due = mine.filter((l) => l.status === "paid").reduce((a, l) => a + owed(l), 0);
                return (
                  <li key={p.id} className={s.partner}>
                    <div className={s.partnerHead}>
                      <div>
                        <h3 className={s.partnerName}>{p.name} <code className={s.code}>{p.code}</code>{p.active ? null : <span className={s.inactive}>inactive</span>}</h3>
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

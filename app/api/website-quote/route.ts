import { NextRequest, NextResponse } from "next/server";

import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";
import { isValidCode } from "@/app/lib/refCode";
import { recordLead, type LeadInput } from "@/app/lib/referrals";
import { supabaseConfigured } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * The quote + free demo form on the home page. One email to Kyle via Resend
 * (RESEND_API_KEY, server only), reply-to set to the sender's email when
 * they gave one. With no key the request is logged on the server and the
 * visitor still sees the confirmation, so a missing key never swallows a
 * lead silently. Only a real send failure shows an error.
 *
 * `contact` is one field, a phone number or an email, either accepted.
 * `heard` is how they heard of Kyle or who referred them (for the referral
 * reward); utm tags and the referrer ride along so Kyle can see which
 * outreach worked.
 *
 * `checkup` is the Free Website Checkup's one-line result ("Website Checkup:
 * 42/100 (Several leaks). Top leaks: …"), carried by the quote form when
 * the visitor came from /checkup. `source=checkup` is the checkup's own
 * "Want me to check it for you?" form: just a website and a phone or email.
 *
 * Every validated request is written to the lead ledger (Supabase `leads`,
 * shown at /manage); the email says whether it was saved. `ref` is a
 * referral partner's code, remembered from a shared link: a valid, active
 * code credits the lead to that partner and names them in the email.
 *
 * JSON in, JSON out from the form script. A native post (no JavaScript)
 * gets a 303 back to /?sent=1#quote or /?error=…#quote (the checkup form
 * goes back to /checkup).
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  let fromCheckup = false;
  const reply = (status: number, payload: { ok?: true; sent?: boolean; saved?: boolean; referred?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL(fromCheckup ? "/checkup" : "/", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    to.hash = fromCheckup ? "check-for-me" : "quote";
    return NextResponse.redirect(to, 303);
  };

  if (rateLimited(`website-quote:${clientIp(request.headers)}`)) return reply(429, { error: "Too many requests in a row. Please wait a few minutes." });

  let body: Record<string, unknown>;
  try {
    body = native ? Object.fromEntries((await request.formData()).entries()) : ((await request.json()) as Record<string, unknown>);
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, { error: "Invalid request." });
  } catch {
    return reply(400, { error: "Invalid request." });
  }

  fromCheckup = clean(body.source, 20) === "checkup";

  // Honeypot: bots fill it, people never see it.
  if (clean(body.website, 50)) return reply(200, { ok: true });

  const name = clean(body.name, 100);
  const business = clean(body.business, 120);
  const contact = clean(body.contact, 180) || clean(body.email, 180) || clean(body.phone, 30);
  const currentSite = clean(body.current_site, 200);
  const goals = clean(body.goals, 1000);
  const heard = clean(body.heard, 160) || clean(body.referred_by, 120);
  const checkup = clean(body.checkup, 600);
  const refCode = clean(body.ref, 40).toLowerCase();
  const ref = isValidCode(refCode) ? refCode : "";
  const source = {
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    referrer: clean(body.referrer, 300),
    landing: clean(body.landing, 200),
  };
  /** Writes the lead to the ledger (credited to the partner when the code is real) and says so in the email. */
  const attribute = async (lead: Omit<LeadInput, "source">) => {
    if (!supabaseConfigured()) return { lines: [ref ? `Referral code: ${ref} (not checked: Supabase isn't set up)` : "", "Not saved to /manage: Supabase isn't set up"].filter(Boolean), partner: null, durable: false };
    const rec = await recordLead({ ...lead, source }, ref);
    const lines: string[] = [];
    if (ref) lines.push(rec.partner ? `Referred by: ${rec.partner.name} (${rec.partner.code}) · ${rec.partner.email}` : `Referral code: ${ref} (no active partner with this code)`);
    lines.push(rec.saved ? "Saved to /manage" : rec.duplicate ? "Not saved to /manage: already recorded today (same contact, same form)" : `Not saved to /manage: ${rec.reason}`);
    // A duplicate is durable too: the earlier row is in the ledger.
    return { lines, partner: rec.partner, durable: rec.saved || rec.duplicate };
  };
  /**
   * The visitor is told "got it" only when the lead reached at least one
   * durable place: a sent email, or a ledger row. Otherwise a truthful
   * failure, and a log line that says what failed, never what was typed.
   */
  const finish = (label: string, result: { ok: boolean; sent: boolean }, att: { durable: boolean; partner: unknown }) => {
    if (!result.sent && !att.durable) {
      console.error(`${label}: not delivered anywhere (email ${result.ok ? "not configured" : "failed"}, ledger ${supabaseConfigured() ? "write failed" : "not configured"})`);
      return reply(502, { error: "I couldn't send that just now. Please text or email me directly." });
    }
    return reply(200, { ok: true, sent: result.sent, saved: att.durable, referred: Boolean(att.partner) });
  };

  // One field, either way: an email, or something with at least 7 digits.
  const email = isEmail(contact) ? contact : "";
  const phone = !email && contact.replace(/\D/g, "").length >= 7 ? contact : "";
  const sourceLine = `Source: ${[source.utm_source && `utm_source=${source.utm_source}`, source.utm_medium && `utm_medium=${source.utm_medium}`, source.utm_campaign && `utm_campaign=${source.utm_campaign}`, source.referrer && `referrer=${source.referrer}`].filter(Boolean).join(" · ") || "direct"}`;

  // The checkup's "check it for me" form: a website and a way to reply.
  if (fromCheckup) {
    if (currentSite.length < 3 || (!email && !phone)) return reply(400, { error: "Please add your website and a phone number or email." });
    const att = await attribute({ kind: "checkup", website: currentSite, contact: email || phone, checkup });
    const text = [
      "Website Checkup: please check my site",
      "",
      `Website: ${currentSite}`,
      `Contact: ${email || phone}${email ? " (email)" : " (phone)"}`,
      checkup ? `Result: ${checkup}` : "Result: (not given)",
      ...att.lines,
      "",
      sourceLine,
      `Sent: ${new Date().toISOString()}`,
    ].join("\n");
    const result = await deliver({ subject: `Checkup review: ${currentSite}${att.partner ? ` · via ${att.partner.code}` : ""}`, text, replyTo: email || undefined, label: "checkup review request" });
    return finish("checkup review request", result, att);
  }

  if (name.length < 2 || business.length < 2 || (!email && !phone)) {
    return reply(400, { error: "Please fill in your name, your business, and a phone number or email." });
  }

  const att = await attribute({ kind: "quote", business, contact_name: name, contact: email || phone, website: currentSite, checkup, heard });
  const text = [
    `Quote + free demo request from ${name}`,
    "",
    `Business: ${business}`,
    `Contact: ${email || phone}${email ? " (email)" : " (phone)"}`,
    `Current website: ${currentSite || "(none given)"}`,
    "",
    `What the site should help customers do: ${goals || "(not given)"}`,
    `How they heard / who referred: ${heard || "(not given)"}`,
    ...(checkup ? ["", checkup] : []),
    "",
    ...att.lines,
    "",
    sourceLine,
    `Sent: ${new Date().toISOString()}`,
  ].join("\n");

  const subject = `Quote + demo: ${business} (${name})${heard ? ` · via ${heard}` : ""}${att.partner ? ` · ref ${att.partner.code}` : ""}${checkup ? " · from the checkup" : ""}`;
  const result = await deliver({ subject, text, replyTo: email || undefined, label: "quote + demo request" });
  return finish("quote + demo request", result, att);
}

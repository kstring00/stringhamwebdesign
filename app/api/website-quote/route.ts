import { NextRequest, NextResponse } from "next/server";

import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";

export const dynamic = "force-dynamic";

/**
 * The website quote form on /websites. Same plumbing as the free check: one
 * email to Kyle via Resend, reply-to set to the sender's email when given.
 * With no RESEND_API_KEY the request is logged on the server and the visitor
 * still sees the confirmation, matching the other two forms. Only a real
 * send failure shows an error.
 *
 * `referred_by` is who sent them (for the referral reward); utm tags and the
 * referrer ride along so Kyle can see which outreach worked.
 *
 * JSON in, JSON out from the form script. A native post (no JavaScript) gets
 * a 303 back to /websites?sent=1#website-quote or ?error=…#website-quote.
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: { ok?: true; sent?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL("/websites", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    to.hash = "website-quote";
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

  // Honeypot: bots fill it, people never see it.
  if (clean(body.website, 50)) return reply(200, { ok: true });

  const name = clean(body.name, 100);
  const business = clean(body.business, 120);
  const town = clean(body.town, 80);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 180);
  const current = clean(body.current_site, 200);
  const goals = clean(body.goals, 1000);
  const referredBy = clean(body.referred_by, 120);
  const source = {
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    referrer: clean(body.referrer, 300),
  };

  const hasPhone = phone.replace(/\D/g, "").length >= 7;
  if (name.length < 2 || business.length < 2 || (email && !isEmail(email)) || (!hasPhone && !email)) {
    return reply(400, { error: "Please fill in your name, business, and a phone number or email." });
  }

  const sourceLine = Object.entries(source).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ") || "direct (no tags, no referrer)";
  const text = [
    `Website quote request`,
    ``,
    `Name: ${name}`,
    `Business: ${business}`,
    `Town: ${town || "(not given)"}`,
    `Phone: ${phone || "(not given)"}`,
    `Email: ${email || "(not given)"}`,
    `Current website: ${current || "(not given)"}`,
    `Referred by: ${referredBy || "(no one named)"}`,
    ``,
    `What the site should help customers do:`,
    goals || "(nothing written)",
    ``,
    `Source: ${sourceLine}`,
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  const subject = `Website quote: ${business}${town ? `, ${town}` : ""} (${name})${referredBy ? ` · referred by ${referredBy}` : ""}`;
  const result = await deliver({ subject, text, replyTo: email || undefined, label: "website quote request" });
  if (!result.ok) return reply(502, { error: "I couldn't send that just now. Please text or email me directly." });
  return reply(200, { ok: true, sent: result.sent });
}

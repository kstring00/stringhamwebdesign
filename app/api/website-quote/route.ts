import { NextRequest, NextResponse } from "next/server";

import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";

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
 * JSON in, JSON out from the form script. A native post (no JavaScript)
 * gets a 303 back to /?sent=1#quote or /?error=…#quote.
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: { ok?: true; sent?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL("/", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    to.hash = "quote";
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
  const contact = clean(body.contact, 180) || clean(body.email, 180) || clean(body.phone, 30);
  const currentSite = clean(body.current_site, 200);
  const goals = clean(body.goals, 1000);
  const heard = clean(body.heard, 160) || clean(body.referred_by, 120);
  const source = {
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    referrer: clean(body.referrer, 300),
  };

  // One field, either way: an email, or something with at least 7 digits.
  const email = isEmail(contact) ? contact : "";
  const phone = !email && contact.replace(/\D/g, "").length >= 7 ? contact : "";
  if (name.length < 2 || business.length < 2 || (!email && !phone)) {
    return reply(400, { error: "Please fill in your name, your business, and a phone number or email." });
  }

  const text = [
    `Quote + free demo request from ${name}`,
    "",
    `Business: ${business}`,
    `Contact: ${email || phone}${email ? " (email)" : " (phone)"}`,
    `Current website: ${currentSite || "(none given)"}`,
    "",
    `What the site should help customers do: ${goals || "(not given)"}`,
    `How they heard / who referred: ${heard || "(not given)"}`,
    "",
    `Source: ${[source.utm_source && `utm_source=${source.utm_source}`, source.utm_medium && `utm_medium=${source.utm_medium}`, source.utm_campaign && `utm_campaign=${source.utm_campaign}`, source.referrer && `referrer=${source.referrer}`].filter(Boolean).join(" · ") || "direct"}`,
    `Sent: ${new Date().toISOString()}`,
  ].join("\n");

  const subject = `Quote + demo: ${business} (${name})${heard ? ` · via ${heard}` : ""}`;
  const result = await deliver({ subject, text, replyTo: email || undefined, label: "quote + demo request" });
  if (!result.ok) return reply(502, { error: "I couldn't send that just now. Please text or email me directly." });
  return reply(200, { ok: true, sent: result.sent });
}

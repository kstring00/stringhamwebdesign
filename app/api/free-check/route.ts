import { NextRequest, NextResponse } from "next/server";

import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";

export const dynamic = "force-dynamic";

/**
 * The free check form. One email to Kyle via Resend (RESEND_API_KEY, server
 * only), reply-to set to the sender when they gave an email. With no key
 * the request still succeeds (the visitor sees the confirmation) and the
 * server logs the request instead, so a missing key never swallows a lead
 * silently.
 *
 * The form script posts JSON and gets JSON back. Without JavaScript the
 * browser posts natively; that gets a 303 back to /google-check?sent=1#free-check
 * or /google-check?error=…#free-check, so nothing the visitor typed ends up in a URL.
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: { ok?: true; sent?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL("/google-check", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    to.hash = "free-check";
    return NextResponse.redirect(to, 303);
  };

  if (rateLimited(`free-check:${clientIp(request.headers)}`)) return reply(429, { error: "Too many requests in a row. Please wait a few minutes." });

  let body: Record<string, unknown>;
  try {
    body = native ? Object.fromEntries((await request.formData()).entries()) : ((await request.json()) as Record<string, unknown>);
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
  const notes = clean(body.notes, 1000);
  const heard = clean(body.heard, 160);
  const source = {
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    referrer: clean(body.referrer, 300),
  };

  if (name.length < 2 || business.length < 2 || town.length < 2 || phone.replace(/\D/g, "").length < 7 || (email && !isEmail(email))) {
    return reply(400, { error: "Please fill in your name, business, town and phone number." });
  }

  const sourceLine = Object.entries(source).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ") || "direct (no tags, no referrer)";
  const text = [
    `Free check request`,
    ``,
    `Name: ${name}`,
    `Business: ${business}`,
    `Town: ${town}`,
    `Phone: ${phone}`,
    `Email: ${email || "(not given)"}`,
    `Heard about me: ${heard || "(not given)"}`,
    ``,
    `What's going on:`,
    notes || "(nothing written)",
    ``,
    `Source: ${sourceLine}`,
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  const result = await deliver({ subject: `Free check: ${business}, ${town} (${name})`, text, replyTo: email || undefined, label: "free check request" });
  if (!result.ok) return reply(502, { error: "I couldn't send that just now. Please text or email me directly." });
  return reply(200, { ok: true, sent: result.sent });
}

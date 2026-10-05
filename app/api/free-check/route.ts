import { NextRequest, NextResponse } from "next/server";

import { site } from "@/app/data/site";

export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").replace(/[ \t]{2,}/g, " ").trim().slice(0, max);
}

function rateLimited(ip: string) {
  const now = Date.now();
  const cur = rateStore.get(ip);
  if (!cur || cur.resetAt <= now) { rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS }); return false; }
  if (cur.count >= RATE_LIMIT) return true;
  cur.count += 1;
  return false;
}

/**
 * The free check form. One email to Kyle via Resend (RESEND_API_KEY, server
 * only), reply-to set to the sender when they gave an email. With no key
 * the request still succeeds (the visitor sees the confirmation) and the
 * server logs the request instead, so a missing key never swallows a lead
 * silently.
 *
 * The form script posts JSON and gets JSON back. Without JavaScript the
 * browser posts natively; that gets a 303 back to /?sent=1#free-check or
 * /?error=…#free-check, so nothing the visitor typed ends up in a URL.
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: { ok?: true; sent?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL("/", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    to.hash = "free-check";
    return NextResponse.redirect(to, 303);
  };

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return reply(429, { error: "Too many requests in a row. Please wait a few minutes." });

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
  const type = clean(body.type, 40);
  const notes = clean(body.notes, 1000);
  const heard = clean(body.heard, 160);
  const source = {
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    referrer: clean(body.referrer, 300),
  };

  if (name.length < 2 || business.length < 2 || town.length < 2 || phone.replace(/\D/g, "").length < 7 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
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
    `Type: ${type || "(not given)"}`,
    `Heard about me: ${heard || "(not given)"}`,
    ``,
    `What's going on:`,
    notes || "(nothing written)",
    ``,
    `Source: ${sourceLine}`,
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Stringham Web Design <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set; free check request logged instead of sent:\n" + text);
    return reply(200, { ok: true, sent: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: `Free check: ${business}, ${town} (${name})`, text, ...(email ? { reply_to: email } : {}) }),
  });

  if (!res.ok) {
    console.error("Free check email failed", res.status, await res.text().catch(() => ""));
    return reply(502, { error: "I couldn't send that just now. Please text or email me directly." });
  }

  return reply(200, { ok: true, sent: true });
}

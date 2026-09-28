import { NextRequest, NextResponse } from "next/server";

import { site } from "@/app/data/site";

export const dynamic = "force-dynamic";

const NEEDS = ["Coffee shop website", "Autism clinic website", "Family Resource Hub", "Something else"];
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
 * The contact form. One email to Kyle via Resend, reply-to set to the sender
 * so answering is a plain reply. With RESEND_API_KEY unset the request still
 * succeeds (the visitor sees the confirmation) and the server logs the
 * message instead, so a missing key never swallows a lead silently.
 *
 * The form script posts JSON and gets JSON back. Without JavaScript (or
 * before it loads) the browser posts the form natively; that gets a 303 back
 * to /contact with ?sent=1 or ?error=…, so no message is ever dropped and
 * nothing the visitor typed ends up in a URL.
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: { ok?: true; sent?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL("/contact", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    return NextResponse.redirect(to, 303);
  };

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return reply(429, { error: "Too many messages in a row. Please wait a few minutes." });

  let body: Record<string, unknown>;
  try {
    body = native ? Object.fromEntries((await request.formData()).entries()) : ((await request.json()) as Record<string, unknown>);
  } catch {
    return reply(400, { error: "Invalid request." });
  }

  // Honeypot: bots fill it, people never see it.
  if (clean(body.website, 50)) return reply(200, { ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 180);
  const business = clean(body.business, 120);
  const need = clean(body.need, 60);
  const message = clean(body.message, 2000);

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || business.length < 2 || !NEEDS.includes(need) || message.length < 3) {
    return reply(400, { error: "Please fill in every field." });
  }

  const text = [
    `New message from the website`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Business: ${business}`,
    `Needs: ${need}`,
    ``,
    message,
    ``,
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Stringham Web Design <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set; contact message logged instead of sent:\n" + text);
    return reply(200, { ok: true, sent: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: `${need} — ${business} (${name})`, text, reply_to: email }),
  });

  if (!res.ok) {
    console.error("Contact email failed", res.status, await res.text().catch(() => ""));
    return reply(502, { error: "I couldn't send that just now. Please email me directly." });
  }

  return reply(200, { ok: true, sent: true });
}

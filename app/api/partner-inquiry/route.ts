import { NextRequest, NextResponse } from "next/server";

import { partnerCategories, partnerInterests } from "@/app/data/partners";
import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";

export const dynamic = "force-dynamic";

/**
 * The partner inquiry form on /partners. Same plumbing as the free check:
 * honeypot, per-IP rate limit, one email to Kyle via Resend with reply-to
 * set to the sender. JSON in, JSON out from the script; a native (no-JS)
 * post gets a 303 back to /partners?sent=1#partner-form or ?error=….
 */
export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, payload: { ok?: true; sent?: boolean; error?: string }) => {
    if (!native) return NextResponse.json(payload, { status });
    const to = new URL("/partners", request.url);
    if (payload.ok) to.searchParams.set("sent", "1");
    else to.searchParams.set("error", status === 429 ? "busy" : status === 502 ? "send" : "fields");
    to.hash = "partner-form";
    return NextResponse.redirect(to, 303);
  };

  if (rateLimited(`partner:${clientIp(request.headers)}`)) return reply(429, { error: "Too many requests in a row. Please wait a few minutes." });

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
  const site = clean(body.business_site, 200);
  const email = clean(body.email, 180);
  const category = clean(body.category, 60);
  const interest = clean(body.interest, 20);
  const message = clean(body.message, 1500);

  const categoryOk = (partnerCategories as readonly string[]).includes(category);
  const interestOk = (partnerInterests as readonly string[]).includes(interest);
  if (name.length < 2 || business.length < 2 || !isEmail(email) || !categoryOk || !interestOk) {
    return reply(400, { error: "Please fill in your name, business, email, what you do and what you're interested in." });
  }

  const text = [
    `Partner inquiry`,
    ``,
    `Name: ${name}`,
    `Business: ${business}`,
    `Website: ${site || "(not given)"}`,
    `Email: ${email}`,
    `What they do: ${category}`,
    `Interested in: ${interest}`,
    ``,
    `Message:`,
    message || "(nothing written)",
    ``,
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  const result = await deliver({ subject: `Partner inquiry: ${business} (${category}, ${interest})`, text, replyTo: email, label: "partner inquiry" });
  if (!result.ok) return reply(502, { error: "I couldn't send that just now. Please email me directly." });
  return reply(200, { ok: true, sent: result.sent });
}

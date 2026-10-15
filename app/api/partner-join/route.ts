import { NextRequest, NextResponse } from "next/server";

import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";
import { isReserved, isValidCode, toCode } from "@/app/lib/refCode";
import { codeTaken, createPartner } from "@/app/lib/referrals";
import { supabaseConfigured } from "@/app/lib/supabase";
import { site } from "@/app/data/site";

export const dynamic = "force-dynamic";

/**
 * /partners/join: create a referral partner and give back their code.
 * Name, email and agreeing to the partner terms are required; phone, how
 * they know business owners and a preferred code are optional. Without a
 * preferred code the code comes from the first name ("maria"), with a
 * number added if it's taken ("maria-2"). Kyle gets an email for each
 * signup. JSON in, JSON out.
 */
export async function POST(request: NextRequest) {
  const reply = (status: number, payload: Record<string, unknown>) => NextResponse.json(payload, { status });
  if (rateLimited(`partner-join:${clientIp(request.headers)}`)) return reply(429, { error: "Too many signups in a row. Please wait a few minutes." });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, { error: "Invalid request." });
  } catch {
    return reply(400, { error: "Invalid request." });
  }
  if (clean(body.website, 50)) return reply(200, { ok: true, code: "thanks", firstName: "" });

  const name = clean(body.name, 100);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 40);
  const how = clean(body.how, 500);
  const agreed = body.agree === true || body.agree === "on" || body.agree === "yes";
  const wanted = toCode(clean(body.code, 40));

  if (name.length < 2 || !isEmail(email)) return reply(400, { error: "Please add your name and a working email.", field: name.length < 2 ? "name" : "email" });
  if (!agreed) return reply(400, { error: "Please read and agree to the partner terms.", field: "agree" });
  if (wanted && isReserved(wanted)) return reply(400, { error: `“${wanted}” is reserved for the site. Try another, like “${toCode(name.split(/\s+/)[0]) || "your-name"}-${wanted}”.`, field: "code" });
  if (wanted && !isValidCode(wanted)) return reply(400, { error: "Codes are 3 to 32 letters, numbers or hyphens. Try another.", field: "code" });

  if (!supabaseConfigured()) {
    console.warn("Partner signup received but Supabase is not configured:", { name, email });
    return reply(503, { error: `Signups aren’t switched on yet. Text me at ${site.phone} and I’ll set up your link by hand.` });
  }

  try {
    let code = wanted;
    if (wanted) {
      if (await codeTaken(wanted)) return reply(409, { error: `“${wanted}” is taken. Try another, like “${wanted}-${Math.floor(Math.random() * 90 + 10)}”.`, field: "code" });
    } else {
      const base = toCode(name.split(/\s+/)[0]).slice(0, 26);
      const first = isValidCode(base) ? base : `partner-${base || "x"}`.slice(0, 26).replace(/-+$/, "");
      code = "";
      for (const c of [first, ...Array.from({ length: 8 }, (_, i) => `${first}-${i + 2}`)]) {
        if (isValidCode(c) && !(await codeTaken(c))) { code = c; break; }
      }
      if (!code) code = `${first}-${Date.now().toString(36).slice(-4)}`;
    }

    const partner = await createPartner({ code, name, email, phone, how_they_know: how });
    if (!partner) return reply(409, { error: "That code was just taken. Please try again.", field: "code" });

    await deliver({
      subject: `New referral partner: ${name} (${code})`,
      text: [
        `New referral partner: ${name}`,
        "",
        `Code: ${code}`,
        `Links: ${site.url}/checkup?ref=${code} · ${site.url}/?ref=${code}`,
        `Email: ${email}`,
        `Phone: ${phone || "(not given)"}`,
        `How they know business owners: ${how || "(not given)"}`,
        "Agreed to the partner terms: yes",
        `Signed up: ${new Date().toISOString()}`,
      ].join("\n"),
      replyTo: email,
      label: "partner signup",
    });

    return reply(200, { ok: true, code, firstName: name.split(/\s+/)[0] });
  } catch (e) {
    console.error("Partner signup failed", e instanceof Error ? e.message : e);
    return reply(502, { error: `Something went wrong on my side. Text me at ${site.phone} and I’ll set up your link by hand.` });
  }
}

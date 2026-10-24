import { createHash } from "node:crypto";

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE, validSession } from "@/app/lib/adminAuth";
import { clientIp, rateLimited } from "@/app/lib/inbox";
import { aiAggregate, type AiAggregate } from "@/app/lib/leadStats";
import { listLeads, listSearchMonths } from "@/app/lib/referrals";
import { supabaseConfigured } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * "Explain my leads": a plain-English reading of the dashboard's numbers,
 * on a button press only. What the model sees is `aiAggregate()`: counts
 * by month, by source group and by landing page, with the definitions.
 * No names, contacts, businesses, notes, partner codes or referrer hosts.
 *
 * Cost control: the cheapest current model, a small output cap, one call
 * per distinct set of numbers (cached in this server instance), a per-IP
 * rate limit and a daily ceiling. With no ANTHROPIC_API_KEY the route
 * answers with the aggregate alone, and the page shows that instead.
 */
const MODEL = "claude-haiku-5-5";
const MAX_OUTPUT_TOKENS = 800;
const DAILY_CAP = 20;

const SYSTEM = `You are reading a one-person web design studio's lead ledger for its owner. The goal is one new paying website client a month.

Rules:
- Use only the numbers in the JSON. Every count you state must appear in it, or be a sum or percentage of numbers in it. Do not estimate, extrapolate, invent causes, rank search terms, or describe visitors you cannot see.
- "Unknown" source means no tag, no referrer and nothing said. Say that plainly; never call it direct traffic.
- Small numbers are small: with fewer than about 10 inquiries, say that differences could be chance.
- Be concrete and brief. Plain words, no jargon, no bullet-point flood. Under 220 words.

Write four short parts with these headings: "Where inquiries came from", "How they moved through the funnel", "What the evidence suggests checking next" (one or two specific, cheap checks the owner can make, tied to a number above), and "What this can't tell you" (one or two lines).`;

type Cached = { text: string; usage: { input: number; output: number }; model: string; at: number };
const cache = new Map<string, Cached>();
let dayKey = "";
let dayCount = 0;

export async function POST(request: NextRequest) {
  if (!validSession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!supabaseConfigured()) return NextResponse.json({ error: "Supabase isn't set up, so there's nothing to read." }, { status: 503 });
  if (rateLimited(`explain:${clientIp(request.headers)}`)) return NextResponse.json({ error: "Too many requests in a row. Wait a few minutes." }, { status: 429 });

  let aggregate: AiAggregate;
  try {
    const [leads, search] = await Promise.all([listLeads(), listSearchMonths()]);
    aggregate = aiAggregate(leads, search);
  } catch {
    return NextResponse.json({ error: "Couldn't read the ledger." }, { status: 502 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, reason: "no_key", aggregate });

  const json = JSON.stringify(aggregate);
  const key = createHash("sha256").update(`${MODEL}|${json}`).digest("hex");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 24 * 60 * 60 * 1000) return NextResponse.json({ ok: true, ...hit, cached: true, aggregate });

  const today = new Date().toISOString().slice(0, 10);
  if (dayKey !== today) { dayKey = today; dayCount = 0; }
  if (dayCount >= DAILY_CAP) return NextResponse.json({ error: `Daily limit reached (${DAILY_CAP} explanations). Try tomorrow.` }, { status: 429 });
  dayCount++;

  // The local test points this at a stand-in (ANTHROPIC_BASE_URL); production always uses api.anthropic.com.
  const client = new Anthropic({ apiKey, baseURL: process.env.ANTHROPIC_BASE_URL || undefined, maxRetries: 1, timeout: 45_000 });
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [{ role: "user", content: `Here is the ledger as aggregate counts (JSON). Read it and write the four parts.\n\n${json}` }],
    });
    if (res.stop_reason === "refusal") return NextResponse.json({ error: "The model declined to answer this one." }, { status: 502 });
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n").trim() + (res.stop_reason === "max_tokens" ? "\n\n(Cut short at the output limit.)" : "");
    const out: Cached = { text, usage: { input: res.usage.input_tokens, output: res.usage.output_tokens }, model: res.model, at: Date.now() };
    cache.set(key, out);
    return NextResponse.json({ ok: true, ...out, cached: false, aggregate });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "Anthropic rejected the API key. Check ANTHROPIC_API_KEY in Vercel." }, { status: 502 });
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Anthropic is rate-limiting right now. Try again in a minute." }, { status: 429 });
    if (e instanceof Anthropic.APIError) return NextResponse.json({ error: `Anthropic returned an error (${e.status ?? "no status"}).` }, { status: 502 });
    return NextResponse.json({ error: "Couldn't reach Anthropic." }, { status: 502 });
  }
}

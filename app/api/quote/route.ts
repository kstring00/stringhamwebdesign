import { NextRequest, NextResponse } from "next/server";

type RateEntry = { count: number; resetAt: number };

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const rateStore = new Map<string, RateEntry>();

const tierCatalog = {
  focused: { name: "Focused Site", price: 1250 },
  business: { name: "Custom Business Site", price: 2000 },
  advanced: { name: "Advanced Build", price: 3500 },
} as const;

const addOnCatalog = {
  clarity: { name: "Microsoft Clarity setup", price: 150 },
  "extra-page": { name: "Additional page", price: 250 },
  "copy-polish": { name: "Copy & content polish", price: 350 },
  "booking-flow": { name: "Booking flow integration", price: 250 },
  "intake-flow": { name: "Advanced intake flow", price: 550 },
  cms: { name: "Blog / CMS module", price: 1200 },
  crm: { name: "CRM / email integration", price: 450 },
  automation: { name: "Workflow automation", price: null },
  payments: { name: "Payments / checkout", price: 1200 },
  ai: { name: "AI-assisted feature", price: null },
  portal: { name: "Client portal foundation", price: 2500 },
  revision: { name: "Additional revision round", price: 250 },
} as const;

const careCatalog = {
  none: { name: "No care plan", monthly: 0 },
  launch: { name: "Launch Care", monthly: 95 },
  growth: { name: "Growth Care", monthly: 195 },
} as const;

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateStore.get(ip);
  if (!current || current.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (current.count >= RATE_LIMIT) return true;
  current.count += 1;
  rateStore.set(ip, current);
  return false;
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 180);
  const phone = clean(body.phone, 60);
  const business = clean(body.business, 120);
  const notes = clean(body.notes, 1500);
  const tierId = clean(body.tierId, 40) as keyof typeof tierCatalog;
  const careId = clean(body.careId, 40) as keyof typeof careCatalog;
  const rawAddOns = Array.isArray(body.addOnIds) ? body.addOnIds : [];
  const addOnIds = rawAddOns
    .map((value) => clean(value, 40))
    .filter((value): value is keyof typeof addOnCatalog => value in addOnCatalog)
    .slice(0, 20);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone && phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!(tierId in tierCatalog) || !(careId in careCatalog)) {
    return NextResponse.json({ error: "Please choose a valid build configuration." }, { status: 400 });
  }

  const tier = tierCatalog[tierId];
  const care = careCatalog[careId];
  const addOns = addOnIds.map((id) => addOnCatalog[id]);
  const hasConsultationPricedItems = addOns.some((item) => item.price === null);
  const projectFloor = tier.price + addOns.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const reference = `KS-${Date.now().toString(36).toUpperCase()}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The quote request is being connected. Please email stringham00@gmail.com for now." },
      { status: 503 },
    );
  }

  const to = process.env.CAPTURE_TO_EMAIL || "stringham00@gmail.com";
  const from = process.env.CAPTURE_FROM_EMAIL || "Website Inquiry <onboarding@resend.dev>";

  const addOnLines = addOns.length
    ? addOns
        .map((item) =>
          item.price === null
            ? `- ${item.name}: Quoted after consultation`
            : `- ${item.name}: from ${money(item.price)}`,
        )
        .join("\n")
    : "- None selected";

  const message = [
    "New configured website quote request",
    "",
    `Reference: ${reference}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Business: ${business || "Not provided"}`,
    "",
    `Base package: ${tier.name} — from ${money(tier.price)}`,
    "Configured add-ons:",
    addOnLines,
    ...(hasConsultationPricedItems ? ["Includes items scoped after consultation."] : []),
    `Care plan: ${care.name}${care.monthly ? ` — ${money(care.monthly)}/mo` : ""}`,
    "",
    `Configured project floor: ${money(projectFloor)}+`,
    `Ongoing support: ${care.monthly ? `${money(care.monthly)}/mo` : "Not selected"}`,
    "",
    "Client notes:",
    notes || "None provided",
    "",
    "Important: This configuration is a starting estimate only. Review scope before sending a formal quote.",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `${reference} — ${tier.name} quote request from ${name}`,
        text: message,
      }),
    });

    if (!response.ok) {
      console.error("Quote request email failed", response.status);
      return NextResponse.json(
        { error: "I couldn’t send that configuration just now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, reference });
  } catch {
    return NextResponse.json(
      { error: "I couldn’t send that configuration just now. Please try again." },
      { status: 502 },
    );
  }
}

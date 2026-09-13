import { NextRequest, NextResponse } from "next/server";

import { replyWindowFor } from "@/app/lib/businessDays";
import {
  QUOTE_FIELD_LABELS,
  QUOTE_FIELD_ORDER,
  QuoteReceipt,
  RECEIPT_COOKIE,
  RECEIPT_MAX_AGE_SECONDS,
  cleanAnswer,
  cleanAnswers,
  createReference,
  encodeReceipt,
  validateAnswers,
} from "@/app/lib/quoteReceipt";
import { processSteps } from "@/app/data/process";
import {
  PACKAGE_UNSPECIFIED_LABEL,
  packageNameFor,
} from "@/app/data/pricing";

/** The brief is written to a cookie, so this must not be cached. */
export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const rateStore = new Map<string, { count: number; resetAt: number }>();

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
  return false;
}

/**
 * The email is the artefact that survives. The page gets read once; this gets
 * forwarded to a business partner, so it carries the same reference, the same
 * reply date and the same seven steps as the confirmation page.
 */
function buildClientEmail(receipt: QuoteReceipt) {
  const answers = QUOTE_FIELD_ORDER.filter(
    (field) => receipt.answers[field],
  ).map((field) => `${QUOTE_FIELD_LABELS[field]}: ${receipt.answers[field]}`);

  const steps = processSteps.map(
    (step) => `${step.number}. ${step.name.toUpperCase()} — ${step.line}`,
  );

  return [
    `Your brief is in. Reference ${receipt.reference}.`,
    "",
    `I'll reply by ${receipt.replyByLabel}, and my reply will have a link to book a call.`,
    "",
    "Here is what you sent me:",
    "",
    ...answers,
    "",
    "WHAT HAPPENS NEXT",
    "",
    ...steps,
    "",
    "If you forgot something, just reply to this email and it lands in the same thread.",
    "",
    "Kyle Stringham",
    "stringhamwebdesign.com",
  ].join("\n");
}

function buildOwnerEmail(receipt: QuoteReceipt) {
  const answers = QUOTE_FIELD_ORDER.map(
    (field) =>
      `${QUOTE_FIELD_LABELS[field]}: ${receipt.answers[field] || "Not provided"}`,
  );

  return [
    `New quote brief — ${receipt.reference}`,
    "",
    ...answers,
    "",
    `Submitted: ${receipt.submittedAt}`,
    `Reply promised by: ${receipt.replyByLabel} (${receipt.replyByIso})`,
  ].join("\n");
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "no-api-key" as const };

  const from =
    process.env.CAPTURE_FROM_EMAIL || "Kyle Stringham <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Quote email failed", response.status, payload.subject);
    return { sent: false, reason: "send-failed" as const };
  }

  return { sent: true, reason: null };
}

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot. Bots fill it; the form keeps it off-screen and unlabelled.
  if (cleanAnswer(body.website, "name")) {
    return NextResponse.json({ ok: true, reference: createReference() });
  }

  const answers = cleanAnswers(body);

  // The package arrives as a tier id and is only ever stored as a name the
  // tiers actually define, so nothing a client sends can reach the email or
  // the receipt verbatim. Anything unrecognised, "Not sure yet" included,
  // records as "Not specified".
  answers.package = packageNameFor(answers.package) ?? PACKAGE_UNSPECIFIED_LABEL;

  const errors = validateAnswers(answers);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Some answers still need attention.", fieldErrors: errors },
      { status: 400 },
    );
  }

  const submittedAt = new Date();
  const replyWindow = replyWindowFor(submittedAt);

  const receipt: QuoteReceipt = {
    reference: createReference(),
    submittedAt: submittedAt.toISOString(),
    replyByLabel: replyWindow.replyByLabel,
    replyByIso: replyWindow.replyByIso,
    answers,
  };

  const owner = process.env.CAPTURE_TO_EMAIL || "stringham00@gmail.com";

  // The owner copy is the one that must not be lost, so it is sent first and
  // its failure fails the request. The client confirmation is best effort:
  // the confirmation page already tells them everything the email does.
  const ownerResult = await sendEmail({
    to: owner,
    subject: `${receipt.reference} — ${answers.package} brief from ${answers.name}`,
    text: buildOwnerEmail(receipt),
    replyTo: answers.email,
  });

  if (!ownerResult.sent && ownerResult.reason === "send-failed") {
    return NextResponse.json(
      { error: "I couldn't send that just now. Please try again." },
      { status: 502 },
    );
  }

  const clientResult = await sendEmail({
    to: answers.email,
    subject: `${receipt.reference} — your brief is in`,
    text: buildClientEmail(receipt),
    replyTo: owner,
  });

  const response = NextResponse.json({
    ok: true,
    reference: receipt.reference,
    replyByLabel: receipt.replyByLabel,
    replyByIso: receipt.replyByIso,
    emailSent: clientResult.sent,
  });

  response.cookies.set(RECEIPT_COOKIE, encodeReceipt(receipt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RECEIPT_MAX_AGE_SECONDS,
  });

  return response;
}

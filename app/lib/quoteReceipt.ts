/**
 * The shape of a quote brief, and the receipt the confirmation page renders.
 *
 * The receipt travels from the API route to /quote/received in an httpOnly
 * cookie rather than the URL or sessionStorage. That keeps the reply date
 * server-computed and unforgeable-by-accident, survives a refresh, and means
 * the page can be a server component with no database behind it.
 */

import { randomInt } from "node:crypto";

export type QuoteField =
  | "name"
  | "email"
  | "business"
  | "businessDoes"
  | "current"
  | "goal"
  | "timeline"
  | "contact";

export const QUOTE_FIELD_LABELS: Record<QuoteField, string> = {
  name: "Your name",
  email: "Email",
  business: "Business name",
  businessDoes: "What it does",
  current: "What you have now",
  goal: "What the site needs to accomplish",
  timeline: "Rough timeline",
  contact: "How you prefer to talk",
};

/** Order the confirmation page and the email echo answers back in. */
export const QUOTE_FIELD_ORDER: QuoteField[] = [
  "name",
  "email",
  "business",
  "businessDoes",
  "current",
  "goal",
  "timeline",
  "contact",
];

const MAX_LENGTHS: Record<QuoteField, number> = {
  name: 100,
  email: 180,
  business: 120,
  businessDoes: 400,
  current: 300,
  goal: 600,
  timeline: 120,
  contact: 120,
};

export type QuoteAnswers = Record<QuoteField, string>;

export type QuoteReceipt = {
  reference: string;
  /** ISO instant the brief was received, for the record. */
  submittedAt: string;
  /** Server-computed. See lib/businessDays.ts. */
  replyByLabel: string;
  replyByIso: string;
  answers: QuoteAnswers;
};

/** Trim, cap, and strip control characters from one answer. */
export function cleanAnswer(value: unknown, field: QuoteField) {
  if (typeof value !== "string") return "";
  return value
    // Collapse control characters (including newlines) to spaces: these
    // answers go into a plain-text email and a cookie value.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_LENGTHS[field]);
}

export function cleanAnswers(body: Record<string, unknown>): QuoteAnswers {
  const answers = {} as QuoteAnswers;
  for (const field of QUOTE_FIELD_ORDER) {
    answers[field] = cleanAnswer(body[field], field);
  }
  return answers;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The questions that must be answered before a brief counts as complete. */
export const REQUIRED_FIELDS: QuoteField[] = [
  "name",
  "email",
  "business",
  "businessDoes",
  "goal",
];

export function validateAnswers(answers: QuoteAnswers) {
  const errors: Partial<Record<QuoteField, string>> = {};

  if (answers.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_PATTERN.test(answers.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (answers.business.length < 2) {
    errors.business = "Please enter your business name.";
  }
  if (answers.businessDoes.length < 3) {
    errors.businessDoes = "Please say what the business does.";
  }
  if (answers.goal.length < 3) {
    errors.goal = "Please say what the site needs to accomplish.";
  }

  return errors;
}

/**
 * BUILD-0247. Four digits is a human reference, not a primary key — the email
 * carries the full ISO timestamp so two briefs that happen to collide can
 * still be told apart.
 */
export function createReference() {
  return `BUILD-${String(randomInt(0, 10000)).padStart(4, "0")}`;
}

export const RECEIPT_COOKIE = "ks_quote_receipt";
/** Long enough to read the page and refresh it; short enough not to linger. */
export const RECEIPT_MAX_AGE_SECONDS = 60 * 60 * 2;

export function encodeReceipt(receipt: QuoteReceipt) {
  return Buffer.from(JSON.stringify(receipt), "utf8").toString("base64url");
}

export function decodeReceipt(value: string | undefined): QuoteReceipt | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<QuoteReceipt>;

    if (
      typeof parsed?.reference !== "string" ||
      typeof parsed?.replyByLabel !== "string" ||
      typeof parsed?.answers !== "object" ||
      parsed.answers === null
    ) {
      return null;
    }

    const answers = {} as QuoteAnswers;
    for (const field of QUOTE_FIELD_ORDER) {
      const raw = (parsed.answers as Record<string, unknown>)[field];
      answers[field] = typeof raw === "string" ? raw : "";
    }

    return {
      reference: parsed.reference,
      submittedAt: typeof parsed.submittedAt === "string" ? parsed.submittedAt : "",
      replyByLabel: parsed.replyByLabel,
      replyByIso: typeof parsed.replyByIso === "string" ? parsed.replyByIso : "",
      answers,
    };
  } catch {
    return null;
  }
}

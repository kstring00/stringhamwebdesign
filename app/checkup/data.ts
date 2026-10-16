/**
 * The Free Website Checkup: questions, answers, scoring, bands, the
 * estimate and the "what to expect" copy, exactly as in the spec
 * (website-checkup-spec.html). Shared by the page (which server-renders
 * every question), the quiz, and the share image.
 */

import { PRICES } from "../data/offer";

export type ZoneKey = "clarity" | "action" | "questions" | "price" | "speed" | "call" | "words" | "reviews" | "form" | "google";

export type Question = {
  z: ZoneKey;
  /** The zone's name on the phone ("Checking: …"). */
  zone: string;
  w: number;
  q: string;
  help?: string;
  leak: string;
  ok: string;
  why: string;
  fix: string;
};

export const QUESTIONS: Question[] = [
  {
    z: "clarity", zone: "Headline", w: 10,
    q: "Can a stranger tell what you do, who it's for, and where you are within 5 seconds?",
    help: "Hand someone your phone with your site open. Take it back after 5 seconds and ask what you do.",
    leak: "Visitors can't tell what you do fast enough", ok: "Clear headline",
    why: "People decide in seconds whether they're in the right place. If they have to scroll or guess, many leave.",
    fix: "Make your top headline say what you do, who it's for, and where. Example: \"Same-day AC repair for homes in Galveston County.\"",
  },
  {
    z: "action", zone: "Main button", w: 10,
    q: "Is there one main button (call, book, quote, order) that stands out from everything else?",
    help: "Not five buttons that look alike. One that's clearly the next step.",
    leak: "No single, obvious next step", ok: "One clear button",
    why: "When a page asks people to do many things, most do none of them.",
    fix: "Pick your one action. Make that button the boldest thing on the page, and repeat it at the top, middle and bottom.",
  },
  {
    z: "questions", zone: "Answers", w: 10,
    q: "Does your site answer the 3 questions customers ask you most on the phone?",
    help: "Things like timing, service area, insurance, parking, or how it works.",
    leak: "Common questions go unanswered", ok: "Questions answered",
    why: "Every unanswered question is a reason to leave, or to call a competitor whose site answers it.",
    fix: "Write down the 3 questions you hear most. Answer each in a sentence or two, right next to your main button.",
  },
  {
    z: "price", zone: "Price", w: 8,
    q: "Can visitors see a price, a range, or a \"starting at\" before they have to contact you?",
    leak: "No pricing in sight", ok: "Pricing shown",
    why: "Price is the most common worry. Hiding it makes people assume it's too high and move on.",
    fix: "Add a \"starting at\" price or typical range near your main button, plus one line on what changes the price.",
  },
  {
    z: "speed", zone: "Load time", w: 10,
    q: "On cell data, does your homepage show up in about 3 seconds or less?",
    help: "Count it out on your phone with Wi-Fi off. For a real number, test your site at pagespeed.web.dev.",
    leak: "The site is slow on phones", ok: "Loads fast",
    why: "Google's research found the chance a visitor leaves goes up 32% when a page takes 3 seconds to load instead of 1.",
    fix: "Shrink your images (huge photos are the usual cause) and remove sliders, pop-ups and auto-playing video from the top of the page.",
  },
  {
    z: "call", zone: "Tap to call", w: 9,
    q: "From any page on a phone, can someone call or text you with one tap?",
    leak: "Calling takes too many taps", ok: "Tap to call",
    why: "Most visitors are on phones. If they have to copy your number or hunt for it, some won't bother.",
    fix: "Add a tap-to-call button that stays at the bottom of the screen on phones.",
  },
  {
    z: "words", zone: "Wording", w: 6,
    q: "Would a 12-year-old understand your headline and first few lines?",
    help: "Watch for phrases like \"innovative solutions\" or \"unparalleled quality.\"",
    leak: "The wording is harder than it needs to be", ok: "Plain wording",
    why: "In Unbounce's 2024 study, pages written at a 5th to 7th grade reading level converted about twice as well as college-level ones.",
    fix: "Say it the way you'd say it to a customer at the counter. Short sentences. Name exactly what you do.",
  },
  {
    z: "reviews", zone: "Reviews", w: 8,
    q: "Are real customer reviews visible near your main button, not just on a separate page?",
    leak: "Reviews are hidden or missing", ok: "Reviews in view",
    why: "97% of consumers read reviews for local businesses (BrightLocal, 2026). Proof works best right where people decide.",
    fix: "Put 2 or 3 short real reviews, with first names, right next to your main button.",
  },
  {
    z: "form", zone: "Form", w: 6,
    q: "Does your contact or booking form ask for 4 things or fewer?",
    leak: "The form asks for too much", ok: "Short form",
    why: "Every extra field is one more reason to give up halfway through.",
    fix: "Cut it to name, phone or email, and one \"how can I help?\" box. Ask the rest when you talk.",
  },
  {
    z: "google", zone: "Google", w: 7,
    q: "Do your hours, phone number and address match on your website and your Google listing?",
    leak: "Your site and Google listing don't match", ok: "Google matches",
    why: "Mismatched hours or numbers cost trust, and can cost you a customer who shows up when you're closed.",
    fix: "Open your Google Business Profile and your site side by side. Make every detail match, and link your listing to your site.",
  },
];

export type AnswerValue = "yes" | "kind" | "no" | "unsure";

export const OPTIONS: { v: AnswerValue; k: string; t: string; s: string; f: number }[] = [
  { v: "yes", k: "Y", t: "Yes", s: "This is handled", f: 1 },
  { v: "kind", k: "K", t: "Kind of", s: "It's there, but not great", f: 0.5 },
  { v: "no", k: "N", t: "No", s: "Not on my site", f: 0 },
  { v: "unsure", k: "?", t: "Not sure", s: "Counts as something to check", f: 0 },
];

const VALUE = Object.fromEntries(OPTIONS.map((o) => [o.v, o.f])) as Record<AnswerValue, number>;

/** 84: the most a site can score before it's turned into a percentage. */
export const TOTAL = QUESTIONS.reduce((a, q) => a + q.w, 0);

/** The example report's answers. */
export const EXAMPLE: AnswerValue[] = ["yes", "kind", "no", "no", "kind", "no", "yes", "no", "yes", "kind"];

export type Tone = "good" | "warn" | "bad";

export function band(score: number): { name: string; tone: Tone; message: string } {
  if (score >= 85) return { name: "Converting well", tone: "good", message: "Your site does most of what turns visitors into customers. Anything below is fine-tuning." };
  if (score >= 65) return { name: "A few leaks", tone: "warn", message: "The basics are there. Fixing the top leaks below is the fastest way to get more from the visitors you already have." };
  if (score >= 40) return { name: "Several leaks", tone: "warn", message: "Some people who want to hire you are probably slipping away. Start with the first three fixes." };
  return { name: "Big room to grow", tone: "bad", message: "Your reputation is doing the heavy lifting. A clearer, faster site would let more of the people who look you up actually reach you." };
}

export type Leak = { q: Question; i: number; a: AnswerValue; lost: number };

/** The score, the leaks ranked by points lost (ties keep question order), and what's already working. */
export function result(answers: AnswerValue[]) {
  const got = QUESTIONS.reduce((a, q, i) => a + q.w * VALUE[answers[i]], 0);
  const score = Math.round((got / TOTAL) * 100);
  const leaks: Leak[] = QUESTIONS.map((q, i) => ({ q, i, a: answers[i], lost: q.w * (1 - VALUE[answers[i]]) }))
    .filter((x) => x.lost > 0)
    .sort((a, b) => b.lost - a.lost || a.i - b.i);
  const wins = QUESTIONS.filter((_q, i) => answers[i] === "yes");
  const rank: Record<number, number> = {};
  leaks.forEach((x, n) => { rank[x.i] = n + 1; });
  return { score, leaks, wins, rank, band: band(score) };
}

/** One line for a text, the quote form, or the lead form: the score, the band and the top three leaks. */
export function summary(score: number, bandName: string, leaks: Leak[]) {
  const top = leaks.slice(0, 3).map((x, n) => `${n + 1}) ${x.q.leak}`).join(" ");
  return `Website Checkup: ${score}/100 (${bandName}).${top ? ` Top leaks: ${top}` : ""}`;
}

/* ---------- the estimate ---------- */

export const ESTIMATE_DEFAULTS = { vis: 200, close: 30, val: 250 };
/** The website starting price, from the one place prices live (app/data/offer.ts). */
export const WEBSITE_PRICE = PRICES.website;

/** An inquiry rate between 2% (score 0) and 8% (score 100). */
export const rate = (s: number) => 0.02 + (0.06 * Math.min(100, Math.max(0, s))) / 100;

export function estimate(score: number, vis: number, close: number, val: number) {
  const now = vis * rate(score);
  const lo = vis * rate(Math.max(score, 80));
  const hi = vis * rate(Math.max(score, 95));
  const extraLo = Math.max(0, lo - now), extraHi = Math.max(0, hi - now);
  const custLo = (extraLo * close) / 100, custHi = (extraHi * close) / 100;
  const revLo = custLo * val, revHi = custHi * val;
  const payback = revLo >= 1 ? Math.ceil(WEBSITE_PRICE / revLo) : null;
  return { now, lo, hi, extraLo, extraHi, custLo, custHi, revLo, revHi, payback };
}

export const HOW_CALCULATED = [
  "Your score sets an estimated inquiry rate between 2% and 8% of visits. Score 0 is 2%, score 100 is 8%.",
  "That range is anchored to Unbounce's 2024 benchmark (median page converts 6.6%) and its finding that clear, plain pages convert about twice as well.",
  "\"After fixes\" assumes your score rises to 80 (low end) or 95 (high end) once the leaks above are fixed.",
  "Customers = inquiries × your close rate. Value = customers × what an average customer is worth.",
  "Visits are the biggest unknown. Not sure? Start with 200 and adjust.",
];

/* ---------- what to expect ---------- */

export const EXPECT = {
  promise: [
    "Every leak in this report fixed, listed in your written quote",
    "A free demo of your homepage before you pay",
    "Fast on phones: PageSpeed mobile score above 80",
    "Two rounds of changes, then your approval before launch",
    "Your domain and accounts stay in your name",
  ],
  see: [
    "Fewer \"what are your hours / prices?\" calls",
    "Calls, texts and form messages you can count",
    "A monthly one-page report on Website Care",
    "A rerun of this checkup scoring in the 80s or 90s",
  ],
  cant: [
    "An exact number of new customers",
    "Ranking #1 on Google",
    "Results from traffic you don't have yet",
  ],
};

export const TIMELINE = [
  { when: "Day 1–3", what: "You get a fixed quote and a free demo of your homepage." },
  { when: "About 3 weeks", what: "Your site is built with every leak fixed, tested on phones, and launched." },
  { when: "First 30 days", what: "Google picks up the new site. Calls and form messages start being counted." },
  { when: "Months 2–3", what: "Monthly reports show what's working. Small changes based on real numbers." },
  { when: "Months 3–6", what: "Search visibility usually builds slowly over these months as Google trusts the site." },
];

export const FOOTNOTE = "A self-check based on how customers decide, not a measurement of your traffic.";

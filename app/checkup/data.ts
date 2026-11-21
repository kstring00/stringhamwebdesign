/**
 * The Free Website Checkup: questions, answers, scoring, bands, the
 * estimate and the "what to expect" copy. Shared by the page (which
 * server-renders every question), the quiz, and the share image.
 *
 * It is written for the owner of a therapy, counseling or mental-health
 * practice checking their own site: "clients" are the people seeking care,
 * proof is credentials and approach (never client reviews), cost is fees
 * and insurance, and a good form asks for contact details only. Nothing
 * here asks about a client. The ten zones, their weights and the scoring
 * are unchanged.
 */

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
    q: "Can a stranger tell what you help with, who you see, and where you are within 5 seconds?",
    help: "Hand someone your phone with your site open. Take it back after 5 seconds and ask who your practice is for.",
    leak: "Visitors can't tell who you help fast enough", ok: "Clear headline",
    why: "Someone looking for help decides in seconds whether they're in the right place. If they have to scroll or guess, many leave.",
    fix: "Make your top headline say what you help with, who you see, and where. Example: \"Therapy for anxious teens and their parents in League City, in person or online.\"",
  },
  {
    z: "action", zone: "Main button", w: 10,
    q: "Is there one main button (call, request an appointment, book a consultation) that stands out from everything else?",
    help: "Not five buttons that look alike. One that's clearly the next step.",
    leak: "No single, obvious next step", ok: "One clear button",
    why: "When a page asks people to do many things, most do none of them.",
    fix: "Pick the one next step you want someone to take. Make that button the boldest thing on the page, and repeat it at the top, middle and bottom.",
  },
  {
    z: "questions", zone: "Availability", w: 10,
    q: "Can someone tell, without calling, whether you're accepting new clients and how the first appointment works?",
    help: "Whether you have openings or a waitlist, whether you meet in person or online, and what happens after they reach out.",
    leak: "No word on whether you're accepting new clients", ok: "Availability shown",
    why: "It's the first thing people want to know. If the site doesn't say, many assume you're full, or put off a call they expect to end in a waitlist.",
    fix: "Say whether you're accepting new clients near your main button, and keep it current. Then answer the two or three questions you hear most on first calls right beside it.",
  },
  {
    z: "price", zone: "Fees and insurance", w: 8,
    q: "Can visitors see your fees and whether you take their insurance before they have to contact you?",
    help: "A session fee or range, the plans you're in network with, and what you offer if you're out of network.",
    leak: "Fees and insurance aren't in sight", ok: "Fees and insurance shown",
    why: "Cost is the most common worry. When fees and insurance are hidden, people assume they can't afford you and move on.",
    fix: "Add your session fee or range and the insurance you accept near your main button. If you're out of network, say so, and say what you offer instead.",
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
    q: "From any page on a phone, can someone call or message you with one tap?",
    leak: "Reaching you takes too many taps", ok: "Tap to call",
    why: "Most visitors are on phones, and reaching out is hard enough already. If they have to copy your number or hunt for it, some won't.",
    fix: "Add a tap-to-call button that stays at the bottom of the screen on phones.",
  },
  {
    z: "words", zone: "Wording", w: 6,
    q: "Would a 12-year-old understand your headline and first few lines?",
    help: "Watch for clinical terms and phrases like \"evidence-based modalities\" or \"holistic wellness solutions.\"",
    leak: "The wording is harder than it needs to be", ok: "Plain wording",
    why: "In Unbounce's 2024 study, pages written at a 5th to 7th grade reading level converted about twice as well as college-level ones.",
    fix: "Say it the way you'd say it to someone sitting in your office. Short sentences. Name what you help with in the words your clients use.",
  },
  {
    z: "reviews", zone: "Credentials", w: 8,
    q: "Are your license, your credentials and how you work visible near your main button, not just on a separate page?",
    help: "A practice can't ask its clients for reviews, so this is your proof: who you are, your license, and your approach in a sentence or two.",
    leak: "Credentials and approach are hidden or missing", ok: "Credentials in view",
    why: "People choosing a therapist want to know who they'd be talking to and that you're qualified. That works best right where they decide.",
    fix: "Put your name, your license and a sentence or two on how you work right next to your main button, with a real photo of you if you have one. Leave client testimonials out.",
  },
  {
    z: "form", zone: "Form", w: 6,
    q: "Does your contact form ask for contact details only, in 4 fields or fewer?",
    help: "Name, phone or email, and a short message. Nothing about symptoms, a diagnosis or history.",
    leak: "The form asks for too much", ok: "Short form, contact details only",
    why: "Every extra field is one more reason to give up halfway through, and a website's contact form is not the place for health details.",
    fix: "Cut it to name, phone or email, and one short message box, and ask people not to share health details there. Intake belongs in a tool built for it.",
  },
  {
    z: "google", zone: "Google", w: 7,
    q: "Do your hours, phone number and address match on your website and your Google listing?",
    leak: "Your site and Google listing don't match", ok: "Google matches",
    why: "Mismatched hours or numbers cost trust, and can send someone to a locked door or a dead number on the day they finally reached out.",
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
  if (score >= 85) return { name: "Converting well", tone: "good", message: "Your site does most of what helps a visitor become a new client. Anything below is fine-tuning." };
  if (score >= 65) return { name: "A few leaks", tone: "warn", message: "The basics are there. Fixing the top leaks below is the fastest way to get more from the visitors you already have." };
  if (score >= 40) return { name: "Several leaks", tone: "warn", message: "Some people who are looking for a practice like yours are probably leaving before they reach out. Start with the first three fixes." };
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

export const ESTIMATE_DEFAULTS = { vis: 200, close: 30, val: 1000 };
/** Under the three inputs: how to arrive at the third number. */
export const VALUE_HELP = "A new client is worth your session fee times the sessions they usually stay for. Replace this with your own number.";
/** The payback line, shown when the estimate finds extra revenue. No price: every site is quoted separately. */
export const PAYBACK_LINE = "Most practices only need a few new clients for a website to pay for itself.";

/** An inquiry rate between 2% (score 0) and 8% (score 100). */
export const rate = (s: number) => 0.02 + (0.06 * Math.min(100, Math.max(0, s))) / 100;

export function estimate(score: number, vis: number, close: number, val: number) {
  const now = vis * rate(score);
  const lo = vis * rate(Math.max(score, 80));
  const hi = vis * rate(Math.max(score, 95));
  const extraLo = Math.max(0, lo - now), extraHi = Math.max(0, hi - now);
  const custLo = (extraLo * close) / 100, custHi = (extraHi * close) / 100;
  const revLo = custLo * val, revHi = custHi * val;
  const payback = revLo >= 1;
  return { now, lo, hi, extraLo, extraHi, custLo, custHi, revLo, revHi, payback };
}

export const HOW_CALCULATED = [
  "Your score sets an estimated inquiry rate between 2% and 8% of visits. Score 0 is 2%, score 100 is 8%.",
  "That range is anchored to Unbounce's 2024 benchmark (median page converts 6.6%) and its finding that clear, plain pages convert about twice as well.",
  "\"After fixes\" assumes your score rises to 80 (low end) or 95 (high end) once the leaks above are fixed.",
  "New clients = inquiries × the share that become clients. Value = new clients × what an average new client brings in.",
  "Visits are the biggest unknown. Not sure? Start with 200 and adjust.",
];

/* ---------- what to expect ---------- */

export const EXPECT = {
  promise: [
    "Every leak in this report fixed, listed in your written quote",
    "A free demo of your homepage before you pay",
    "Fast on phones: PageSpeed mobile score above 80",
    "Two rounds of changes, then your approval before launch",
    "Your domain, hosting and code in accounts in your name",
    "A manual, walkthroughs and a training session, so you can run it yourself",
    "Anything I built that's broken, fixed free for 30 days after launch",
  ],
  see: [
    "Fewer \"are you taking new clients?\" and \"do you take my insurance?\" calls",
    "Calls, texts and form messages you can count",
    "A one-page monthly report, if you add Website Care",
    "A rerun of this checkup scoring in the 80s or 90s",
  ],
  cant: [
    "An exact number of new clients",
    "Ranking #1 on Google",
    "Results from traffic you don't have yet",
  ],
};

export const TIMELINE = [
  { when: "Day 1–3", what: "You get a fixed quote and a free demo of your homepage." },
  { when: "About 3 weeks", what: "Your site is built with every leak fixed, tested on phones, launched and handed over to you." },
  { when: "First 30 days", what: "Google picks up the new site. Calls and form messages start being counted." },
  { when: "Months 2–3", what: "You see what's working. On Website Care, a monthly report and small changes based on real numbers." },
  { when: "Months 3–6", what: "Search visibility usually builds slowly over these months as Google trusts the site." },
];

export const FOOTNOTE = "A self-check for practice owners, based on how people choose a provider. It is not a measurement of your traffic, and it never asks about a client.";

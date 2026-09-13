/**
 * How pricing works, in one place.
 *
 * There is no price list any more. Every project is quoted after a free
 * consultation, so the only figures the site states are the range most
 * sites land in and the length of that call. Both live here and nowhere
 * else: the homepage section, the quote page, the metadata and the about
 * page all read from this file, so a change is one edit and cannot leave a
 * stale number behind in JSX.
 */

export type PricingPoint = {
  label: string;
  line: string;
};

/** The range, as a whole-dollar floor and ceiling. Rendered via `rangeLine`. */
export const typicalRange = { from: 500, to: 1500 } as const;

/** Length of the free consultation, in minutes. */
export const consultationMinutes = 30;

export function formatAmount(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

/** "$500 and $1,500" — the range as it reads in a sentence. */
export const rangeLine = `${formatAmount(typicalRange.from)} and ${formatAmount(typicalRange.to)}`;

/** "a free 30-minute consultation" */
export const consultationLine = `a free ${consultationMinutes}-minute consultation`;

/** The one-line summary, used verbatim wherever the site states its approach. */
export const pricingSummary = `Most sites land between ${rangeLine}. Larger builds are quoted separately, and every quote is custom, after ${consultationLine}.`;

/**
 * The homepage "How pricing works" section: heading, the three things a
 * visitor needs to know, and what happens next.
 */
export const pricingApproach = {
  eyebrow: "How pricing works",
  heading: "No price list. A number for your project.",
  lede: `Most sites land between ${rangeLine}. Larger builds — custom features, e-commerce, client portals — are quoted separately. Every quote is custom, and it comes after ${consultationLine}.`,
  points: [
    {
      label: "Where most land",
      line: `Between ${rangeLine} for a focused site that says what you do and gets people to call. That covers design, build, launch and the search setup.`,
    },
    {
      label: "Larger builds",
      line: "Custom features, online payments, booking, a client portal — anything that needs real engineering is scoped on its own and quoted separately.",
    },
    {
      label: "How a quote happens",
      line: `We talk for ${consultationMinutes} minutes, free. You tell me what the site needs to do; I tell you straight whether I'm the right fit. Then you get a fixed price in writing before I start.`,
    },
  ] satisfies PricingPoint[],
  /** Under the points: the two reassurances that survive a custom quote. */
  assurances: [
    "Fixed price in writing, before any work starts.",
    "You own everything: the code, the domain, every account.",
  ],
} as const;

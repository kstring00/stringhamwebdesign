/**
 * How pricing works, in one place.
 *
 * The site states no prices. Every project is quoted after a free
 * consultation, so the only figure here is the length of that call. The
 * homepage section, the hero, the quote page, the metadata and the about
 * page all read their pricing copy from this file, so a change is one edit.
 */

export type PricingPoint = {
  label: string;
  line: string;
};

/** Length of the free consultation, in minutes. */
export const consultationMinutes = 30;

/** "a free 30-minute consultation" */
export const consultationLine = `a free ${consultationMinutes}-minute consultation`;

/** The one-line summary, used verbatim wherever the site states its approach. */
export const pricingSummary = `Every quote is custom: it comes after ${consultationLine}, as a fixed price in writing.`;

/**
 * The homepage "How pricing works" section: heading, the three things a
 * visitor needs to know, and what happens next.
 */
export const pricingApproach = {
  eyebrow: "How pricing works",
  heading: "No price list. A number for your project.",
  lede: `Every business needs something different, so there is no price list. Larger builds — custom features, e-commerce, client portals — are scoped on their own. Every quote is custom, and it comes after ${consultationLine}.`,
  points: [
    {
      label: "A focused site",
      line: "A site that says what you do and gets people to call: design, build, launch and the search setup, quoted as one fixed price.",
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

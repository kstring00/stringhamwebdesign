/**
 * Everything on /pricing that is a number or a claim.
 *
 * Prices live here and nowhere else. The page, the homepage anchor line, and
 * the page's own <title> and meta description all read from this file, so a
 * price change is one edit and cannot leave a stale "$900" behind in JSX.
 *
 * Every figure is a floor, displayed as "from $X". The exact number comes from
 * the written scope after the call — that is stated on the page, and the
 * process data (step 03) is where the deposit terms live.
 */

export type Tier = {
  id: string;
  name: string;
  /** Floor in whole US dollars. Rendered with `fromPrice()`, never inline. */
  from: number;
  /** One line under the name: who this is for. */
  fit: string;
  /** Shown only on tiers that build on a previous one. */
  plus?: string;
  includes: string[];
  timeline: string;
  /** The tier most projects land on. Marked with a rule and a label, not a badge. */
  common?: boolean;
};

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    from: 900,
    fit: "A focused site that says what you do and gets people to call.",
    includes: [
      "Up to 3 pages",
      "Custom design and code, built for your business",
      "You own the code",
      "Mobile, speed, and full launch QA",
      "Light copy polish",
      "Search setup: titles, Google Business Profile, Search Console",
      "Edit walkthrough recording",
      "2 rounds of revisions",
    ],
    timeline: "2–3 weeks",
  },
  {
    id: "standard",
    name: "Standard",
    from: 1800,
    fit: "The site most businesses actually need, with the copy written together.",
    plus: "Everything in Starter, plus:",
    includes: [
      "Up to 6 pages",
      "Copy written with you",
      "Booking or client-portal integration",
      "1-hour live edit training",
      "3 weeks of unlimited revisions",
    ],
    timeline: "3–5 weeks",
    common: true,
  },
  {
    id: "premium",
    name: "Premium",
    from: 3500,
    fit: "For a business that wants to be found, not just have a site.",
    plus: "Everything in Standard, plus:",
    includes: [
      "Up to 10 pages",
      "Full copywriting and photo direction",
      "Local SEO pages",
      "30 days of post-launch support",
    ],
    timeline: "5–7 weeks",
  },
];

/** The lowest floor. This is the number the rest of the site anchors on. */
export const startingPrice = tiers[0].from;

/** "$1,800" — the amount alone. Only ever shown after the word "from". */
export function formatAmount(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

/** "from $1,800" — the only way a price is ever rendered as a sentence. */
export function fromPrice(amount: number) {
  return `from ${formatAmount(amount)}`;
}

/** "Projects start at $900." — used verbatim on the homepage, /quote and /pricing. */
export const startingLine = `Projects start at ${formatAmount(startingPrice)}.`;

/**
 * The four-phase summary /pricing shows beside its process heading. It is a
 * summary of the seven steps in data/process.ts, not a second process: each
 * phase names the steps it covers so the two descriptions cannot contradict.
 */
export const phases = [
  { number: "01", name: "Discovery", line: "You send the brief, I reply within a business day, and we agree the scope in writing.", covers: "Steps 01–03" },
  { number: "02", name: "Design", line: "You get a portal login and we look at the same screen together before anything is built.", covers: "Step 04" },
  { number: "03", name: "Build", line: "Clean code, a timesheet every ten hours, and a hard cap I can't cross without you.", covers: "Step 05" },
  { number: "04", name: "Launch", line: "Final walkthrough, revisions, your approval. Then everything moves to your name.", covers: "Steps 06–07" },
];

/** Under the tiers: the four things every build has in common. */
export const trust = [
  { icon: "design", label: "Custom design", detail: "for your brand" },
  { icon: "code", label: "You own the code", detail: "every line of it" },
  { icon: "performance", label: "Built for performance", detail: "speed and launch QA" },
  { icon: "support", label: "Ongoing support", detail: "available after handoff" },
] as const;

/** Under the hero: three small reassurances before the numbers. */
export const heroTrust = [
  { icon: "fixed", label: "Fixed price", detail: "at the quote" },
  { icon: "process", label: "Transparent process", detail: "and updates" },
  { icon: "support", label: "Ongoing support", detail: "available" },
] as const;

export const launchNote =
  "Every project includes a testimonial from you at launch and permission to feature the site in my portfolio.";

export const notIncluded = [
  {
    term: "Domain and hosting",
    detail: "You own and pay for those. I set them up in your name, so they were never mine to hold.",
  },
  {
    term: "Ongoing maintenance",
    detail: "Quoted separately, as a monthly plan you can cancel any time.",
  },
  {
    term: "Changes after scope",
    detail: "New pages or features added after the scope is agreed are quoted separately, in writing, before I build them.",
  },
];

export const faq = [
  {
    q: "Why not Squarespace or Wix?",
    a: "A template costs less up front and more later — you end up working around it, and you keep paying for the privilege. A custom build is shaped around how your business actually runs. You keep the code, there is no monthly platform fee, and nothing is locked in.",
  },
  {
    q: "What if I only need one page?",
    a: "That's a conversation. Send the brief and tell me what the page has to do — one good page is sometimes exactly right.",
  },
  {
    q: "Do I own everything?",
    a: "Yes, once paid in full: the design, the content, the code, and every account in your name. Domain, hosting, repository, analytics. No hostage situations.",
  },
  {
    q: "How long does it take?",
    a: "The ranges above. They hold as long as feedback comes back within a few days at each review — that is the one part of the timeline I can't do alone.",
  },
  {
    q: "Do you do maintenance?",
    a: "Yes, at an agreed rate after handoff. It's a separate plan, it's monthly, and you can cancel it whenever you like.",
  },
];

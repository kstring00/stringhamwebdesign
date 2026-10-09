/**
 * Everything the home page says, in one place. Prices and promises here
 * must match content/service-terms.md; change them together.
 */

export const PRICES = { listingFix: 300, website: 1800, monthly: 125 } as const;

/** The verified, anonymized findings from Kyle's own free checks. */
export const findings = [
  "Three different phone numbers across Google, Yelp and a directory.",
  "The Google listing's website button opened a dead page.",
  "Prices on Google were three years old.",
  "A matching .com owned by a different business in another state.",
] as const;

export const steps = [
  {
    n: "1",
    title: "Free check",
    body: "I look you up the way your customers do and send you what I find. Yours to keep, whatever you decide.",
  },
  {
    n: "2",
    title: "Listing Fix",
    body: "I fix it within 7 days and send before-and-after screenshots of every change.",
    yours: "Your part: add me as a manager on your Google listing, send a few photos, approve the changes.",
  },
  {
    n: "3",
    title: "Keep it right (optional)",
    body: "Monthly upkeep so it stays accurate, and a short report of calls and requests.",
  },
] as const;

export const plans = [
  {
    key: "fix",
    name: "Listing Fix",
    price: `$${PRICES.listingFix}`,
    cadence: "one-time",
    tag: "Most start here",
    lead: "How your business shows up, fixed within 7 days.",
    included: [
      "Google listing corrected: name, hours, phone, website link, photos",
      "Up to 10 directories corrected (Apple Maps, Bing, Facebook, Yelp…)",
      "A Google review link and QR code",
      "Before-and-after screenshots of every change",
    ],
    notIncluded: "paid ads, writing reviews, changes a directory refuses to make.",
    notes: ["You add me as a manager; you stay the owner. Never your password.", "Full refund if you ask before work starts."],
    terms: "#1-listing-fix-300-one-time",
  },
  {
    key: "site",
    name: "Website",
    price: `$${PRICES.website.toLocaleString("en-US")}`,
    cadence: "starting price · fixed quote before work",
    lead: "A custom website built around what your customers need to do.",
    included: [
      "Design and build, per your written quote",
      "A contact or request form",
      "Launch on your domain, basic search setup",
      "Two rounds of changes",
    ],
    notIncluded: "photography, paid ads, pages not in your quote.",
    notes: ["You approve the finished site before paying the balance.", "Once it's paid, you own it. Domain and accounts stay in your name."],
    terms: "#2-website-projects-start-at-1800",
  },
  {
    key: "plan",
    name: "Monthly Plan",
    price: `$${PRICES.monthly}`,
    cadence: "per month",
    lead: "I keep it right so you don't have to think about it.",
    included: [
      "Listing and directories kept accurate",
      "Review replies within 3 business days, up to 4 Google posts",
      "Hosting and upkeep, if I built or host your site",
      "30 minutes of edits and a one-page report each month",
    ],
    notIncluded: "new pages, redesigns, photography, paid ads.",
    notes: ["Month to month. Cancel anytime by email."],
    terms: "#3-monthly-plan-125month",
  },
] as const;

export const niches = ["Self storage", "RV parks and campgrounds", "Fishing guides", "Horse boarding", "Marinas"] as const;

export const businessTypes = ["Self storage", "RV park or campground", "Fishing guide", "Horse boarding", "Marina", "Other local business"] as const;

export const questions = [
  {
    q: "Do I have to give you my Google password?",
    a: "No, never. You add me as a manager on your Google listing, which takes about a minute. You stay the owner and can remove me anytime.",
    link: { label: "How owners and managers work (Google's help page)", href: "https://support.google.com/business/answer/3403100" },
  },
  {
    q: "What does it cost? Any hidden fees?",
    a: `Clear prices: $${PRICES.listingFix} for the Listing Fix, $${PRICES.website.toLocaleString("en-US")} starting price for a website (fixed written quote for your scope), $${PRICES.monthly} a month for the plan. What's included and what isn't is listed above and in the Service Terms. Nothing else.`,
    link: { label: "Service Terms", href: "/terms" },
  },
  {
    q: "Will this get me more customers? Is it guaranteed?",
    a: "I can't promise that, and nobody honest can: Google controls rankings. What I do promise is every fix done within 7 days with before-and-after screenshots, and on the plan, a monthly report of calls and requests.",
    link: { label: "What I can't promise (Terms, section 6)", href: "/terms#6-what-we-cant-promise" },
  },
  {
    q: "I already use SpareFoot, Facebook or a booking app.",
    a: "Keep them. This fixes what's wrong in the places customers already look, and gives you your own front door. Nothing gets taken away.",
  },
  {
    q: "My nephew could do this.",
    a: "Fair. The free check is yours to use either way, with the steps for each fix. You'd pay me to have it done right and kept right.",
  },
  {
    q: "How long does it take?",
    a: "The free check comes back within 24 hours. The Listing Fix is finished within 7 days of getting manager access.",
  },
  {
    q: "Can I cancel? What if I change my mind?",
    a: "The Listing Fix is fully refundable if you ask before work starts. The Monthly Plan is month to month; cancel anytime by email.",
    link: { label: "Refunds (Terms, section 5)", href: "/terms#5-refunds" },
  },
  {
    q: "What happens after I send the form?",
    a: "I look up your business the way your customers do and text or email you what I found within 24 hours. Free, no obligation.",
  },
] as const;

export const noGuarantee = "Google controls rankings, so I don't promise results. I promise the work: every fix within 7 days, with screenshots.";

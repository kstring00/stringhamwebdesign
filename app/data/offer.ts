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

/** How a website project runs. Shared by the home page and /websites. */
export const websiteSteps = [
  { n: "1", title: "Tell me what you need", body: "Send the form, text or email. We talk about your business, your customers and what they should be able to do on the site." },
  { n: "2", title: "Get a fixed quote", body: "You get the pages, features, timeline, price and any deposit in writing. Nothing starts until you agree." },
  { n: "3", title: "Review, approve, launch", body: "I build it and you review it. You pay the balance once you approve, and it goes live on your domain." },
] as const;

/** How a Listing Fix runs: the home page's Google listing section. */
export const listingSteps = [
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
    body: `The Monthly Plan, $${PRICES.monthly} a month: upkeep so it stays accurate, and a short report of calls and requests. Month to month.`,
  },
] as const;

export const plans = [
  {
    key: "fix",
    name: "Listing Fix",
    price: `$${PRICES.listingFix}`,
    cadence: "one-time",
    lead: "How your business shows up, fixed within 7 days.",
    included: [
      "Google listing corrected: name, hours, phone, website link, photos",
      "Up to 10 directories corrected (Apple Maps, Bing, Facebook, Yelp…)",
      "A Google review link and QR code",
      "Before-and-after screenshots of every change",
    ],
    notIncluded: "paid ads, writing reviews, changes a directory refuses to make.",
    notes: ["You add me as a manager; you stay the owner. Never your password.", "Full refund if you ask before work starts."],
    terms: "#listing-fix",
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
    terms: "#website",
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
    terms: "#monthly-plan",
  },
] as const;

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
    link: { label: "What I can't promise (Terms, section 6)", href: "/terms#what-we-cant-promise" },
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
    link: { label: "Refunds (Terms, section 5)", href: "/terms#refunds" },
  },
  {
    q: "What happens after I send the form?",
    a: "I look up your business the way your customers do and text or email you what I found within 24 hours. Free, no obligation.",
  },
] as const;

export const noGuarantee = "Google controls rankings, so I don't promise results. I promise the work: every fix within 7 days, with screenshots.";

/** Under the website prices: the objections that come up at the price. */
export const websitePriceNote = "No ad spend. No contract. Any deposit is written in your quote, you approve the finished site before paying the balance, and the Monthly Plan is month to month.";

/**
 * The home page's questions, website first. Every answer restates something
 * already promised on the site or in the Service Terms; nothing new.
 */
export const websiteQuestions = [
  {
    q: "What does a website cost? Any hidden fees?",
    a: `Websites start at $${PRICES.website.toLocaleString("en-US")}. Your fixed written quote lists the pages, features, timeline and full price before any work starts. The Monthly Plan is optional, $${PRICES.monthly} a month. Nothing else.`,
    link: { label: "Service Terms", href: "/terms#website" },
  },
  {
    q: "Do I have to pay for ads or sign a contract?",
    a: "No. There's no required ad spending and no contract. The Monthly Plan is month to month; cancel anytime by email.",
  },
  {
    q: "When do I pay?",
    a: "Any deposit is written in your quote. You pay the balance once you've approved the finished site, before it goes live on your domain.",
  },
  {
    q: "Will I own the website?",
    a: "Yes. Once it's paid in full, the site and its content are yours, and your domain and accounts stay in your name.",
  },
  {
    q: "How long does it take?",
    a: "Around 3 weeks for most websites, from your go-ahead to launch. Your written quote gives the exact timeline before anything starts.",
  },
  {
    q: "What do you need from me?",
    a: "A short conversation about your business and customers, accurate details, and photos you have the right to use. Then you review and approve. Two rounds of changes are included.",
  },
  {
    q: "Will it bring me more customers? Is it guaranteed?",
    a: "I can't promise that, and nobody honest can. What I promise is the site in your quote, built around the one thing your customers need to do, and on the Monthly Plan a short monthly report of calls and requests.",
    link: { label: "What I can't promise (Terms)", href: "/terms#what-we-cant-promise" },
  },
  {
    q: "What happens after I send the form?",
    a: "I read it and text or email you within 24 hours. If it's a fit, we talk, then you get a fixed written quote. No obligation.",
  },
] as const;

/** What a website project needs from the owner. Shared by the home page and /websites. */
export const whatINeed = [
  "One short conversation about your business and your customers, by phone or text.",
  "Your logo, accurate details, and photos you have the right to use.",
  "Your yes at each step: the quote, the review, the launch.",
] as const;

/** How long a website takes: Kyle's typical figure; the quote sets the exact one. */
export const timelineNote = "Around 3 weeks for most websites, from your go-ahead to launch. Your written quote gives the exact timeline before anything starts, and quick replies from you keep it on track.";

/** "Can I update it myself?", answered next to the website price. */
export const editsNote = `Small changes are covered by the Monthly Plan: 30 minutes of edits a month. If you want to edit pages yourself, say so and it goes in your quote.`;

/**
 * The home page's questions: only what the sections above don't already
 * answer (prices, ownership, ads, timing, the password and what happens
 * after the form are all answered where they come up).
 */
export const homeQuestions = [
  {
    q: "Will this bring me more customers? Is it guaranteed?",
    a: "I can't promise that, and nobody honest can: Google controls rankings, and customers decide. What I do promise is the work: every listing fix within 7 days with before-and-after screenshots, the website in your written quote, and on the Monthly Plan a short monthly report of calls and requests.",
    link: { label: "What I can't promise (Terms)", href: "/terms#what-we-cant-promise" },
  },
  {
    q: "I already use Facebook, Yelp or a booking app.",
    a: "Keep them. This fixes what's wrong in the places customers already look, and gives you your own front door. Nothing gets taken away.",
  },
  {
    q: "My nephew could do this.",
    a: "Fair. The free check is yours to use either way, with the steps for each fix. You'd pay me to have it done right and kept right.",
  },
  {
    q: "Can I cancel? What if I change my mind?",
    a: "The Listing Fix is fully refundable if you ask before work starts. The Monthly Plan is month to month; cancel anytime by email. Any website deposit and its terms are written in your quote before you agree.",
    link: { label: "Refunds (Terms)", href: "/terms#refunds" },
  },
  {
    q: "Do you only work in League City?",
    a: "I'm based in League City and work with businesses around the Bay Area and Greater Houston: Friendswood, Webster, Clear Lake, Kemah, Dickinson, Pearland and nearby. Most of it happens by phone, text and email.",
  },
] as const;

/** The /websites questions: only what its sections above don't already answer. */
export const websitesPageQuestions = [
  websiteQuestions.find((q) => q.q.startsWith("Will it bring me more customers"))!,
  homeQuestions.find((q) => q.q.startsWith("Do you only work"))!,
  {
    q: "Can I cancel? What if I change my mind?",
    a: "Nothing starts until you agree to the written quote, and any deposit and its terms are in it. The Monthly Plan is month to month; cancel anytime by email.",
    link: { label: "Refunds (Terms)", href: "/terms#refunds" },
  },
];

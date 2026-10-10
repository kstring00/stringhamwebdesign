/**
 * Everything the home page and /google-check say about the offer, in one
 * place. Prices and promises here must match content/service-terms.md;
 * change them together.
 */

export const PRICES = { listingFix: 150, website: 2000, care: 125 } as const;

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/** The verified, anonymized findings from Kyle's own free checks. */
export const findings = [
  "Three different phone numbers across Google, Yelp and a directory.",
  "The Google listing's website button opened a dead page.",
  "Prices on Google were three years old.",
  "A matching .com owned by a different business in another state.",
] as const;

/** How a Listing Fix runs: /google-check. */
export const listingSteps = [
  {
    n: "1",
    title: "Free check",
    body: "I look you up the way your customers do and text you what I find within 24 hours. Yours to keep, whatever you decide.",
  },
  {
    n: "2",
    title: "Listing Fix",
    body: `${money(PRICES.listingFix)}, done within 7 days, with before-and-after screenshots of every change.`,
    yours: "Your part: add me as a manager on your Google listing, send a few photos, approve the changes.",
  },
  {
    n: "3",
    title: "Keep it right (optional)",
    body: `Website Care, ${money(PRICES.care)} a month: your listing kept accurate, reviews answered, and a short report of calls and requests. Month to month.`,
  },
] as const;

/**
 * The three pricing cards. `highlight` is the one line that answers "what if
 * I don't like it?" before anything else; `lines` are what's included;
 * `foot` is the promise under them.
 */
export const plans = [
  {
    key: "site",
    name: "Website",
    price: money(PRICES.website),
    cadence: "starting",
    badge: "Start here",
    highlight: "Free homepage demo with your quote",
    lines: [
      "Custom design and build, per your written quote",
      "A contact or booking form that reaches you",
      "Launch on your domain, basic search setup",
      "Two rounds of changes",
    ],
    foot: "You approve the finished site before paying the balance.",
    cta: { label: "Get a quote + free demo", href: "#quote" },
    terms: "#website",
  },
  {
    key: "care",
    name: "Website Care",
    price: money(PRICES.care),
    cadence: "per month",
    lines: [
      "Hosting: fast, secure, online",
      "Domain: renewals handled, kept in your name",
      "Edits: 30 minutes a month",
      "Google: listing kept right, reviews answered",
      "Report: one page of calls and requests",
    ],
    foot: "I run it so you don't have to. Cancel anytime by email. If you leave, I hand over your domain and site files.",
    cta: { label: "Add it to your quote", href: "#quote", secondary: true },
    terms: "#website-care",
  },
  {
    key: "fix",
    name: "Just your Google listing?",
    price: "Free check",
    cadence: "first",
    lines: [
      "What I find, texted within 24 hours",
      `Then a ${money(PRICES.listingFix)} fix, done in 7 days`,
      "Google plus up to 10 directories",
      "Before-and-after screenshots",
    ],
    foot: "You stay the owner. Never your password.",
    cta: { label: "Get a free Google check", href: "/google-check", secondary: true },
    terms: "#listing-fix",
  },
] as const;

export type Plan = (typeof plans)[number];

/** The Listing Fix on its own page: what's in it, what isn't. */
export const listingFix = {
  price: money(PRICES.listingFix),
  included: [
    "Google listing corrected: name, hours, phone, website link, photos",
    "Up to 10 directories corrected (Apple Maps, Bing, Facebook, Yelp…)",
    "A Google review link and QR code",
    "Before-and-after screenshots of every change",
  ],
  notIncluded: "paid ads, writing reviews, changes a directory refuses to make.",
  notes: ["You add me as a manager; you stay the owner. Never your password.", "Full refund if you ask before work starts."],
  terms: "#listing-fix",
} as const;

/** The slim strip under the pricing cards: how a website project goes. */
export const steps = [
  { n: "1", title: "Tell me about your business", body: "Form, text or call." },
  { n: "2", title: "Get your quote + a free demo", body: "See your homepage before you say yes." },
  { n: "3", title: "Live in about 3 weeks", body: "Approve it, then it goes live." },
] as const;

/** The home page's five questions, beside the About block. */
export const faq = [
  {
    q: "Will this bring me more customers?",
    a: "I can't promise that, and nobody honest can: Google controls rankings, and customers decide. What I promise is the work: the site in your written quote, built around the one thing your customers need to do, and on Website Care a one-page monthly report of calls and requests.",
    link: { label: "What I can't promise (Terms)", href: "/terms#what-we-cant-promise" },
  },
  {
    q: "I already use Facebook, Yelp or a booking app.",
    a: "Keep them. Your site links to them, and gives you your own front door that you control. Nothing gets taken away.",
  },
  {
    q: "Do I own the website?",
    a: "Yes. Once it's paid in full, the site and its content are yours. Your domain and accounts stay in your name, and if you ever leave Website Care, I hand over your domain and site files.",
    link: { label: "Ownership (Terms)", href: "/terms#website" },
  },
  {
    q: "My nephew could do this.",
    a: "Maybe. What you get from me is a fixed price, a written scope, a demo before you commit, and someone who answers the phone after launch.",
  },
  {
    q: "Can I cancel Website Care?",
    a: "Yes, anytime, by email. It's month to month with no contract. Cancellation takes effect at the end of the paid month, and you keep your domain and site.",
    link: { label: "Website Care (Terms)", href: "/terms#website-care" },
  },
] as const;

/** /google-check's questions, listing first. */
export const listingQuestions = [
  {
    q: "Do I have to give you my Google password?",
    a: "No, never. You add me as a manager on your Google listing, which takes about a minute. You stay the owner and can remove me anytime.",
    link: { label: "How owners and managers work (Google's help page)", href: "https://support.google.com/business/answer/3403100" },
  },
  {
    q: "What does it cost? Any hidden fees?",
    a: `The check is free. The Listing Fix is ${money(PRICES.listingFix)}, one time. Website Care, if you want it, is ${money(PRICES.care)} a month, month to month. Nothing else.`,
    link: { label: "Service Terms", href: "/terms#listing-fix" },
  },
  {
    q: "Will this get me more customers? Is it guaranteed?",
    a: "I can't promise that, and nobody honest can: Google controls rankings. What I do promise is every fix done within 7 days with before-and-after screenshots.",
    link: { label: "What I can't promise (Terms)", href: "/terms#what-we-cant-promise" },
  },
  {
    q: "How long does it take?",
    a: "The free check comes back within 24 hours. The Listing Fix is finished within 7 days of getting manager access.",
  },
  {
    q: "Can I cancel? What if I change my mind?",
    a: "The Listing Fix is fully refundable if you ask before work starts. Website Care is month to month; cancel anytime by email.",
    link: { label: "Refunds (Terms)", href: "/terms#refunds" },
  },
  {
    q: "What happens after I send the form?",
    a: "I look up your business the way your customers do and text or email you what I found within 24 hours. Free, no obligation.",
  },
] as const;

export const noGuarantee = "Google controls rankings, so I don't promise results. I promise the work: every fix within 7 days, with screenshots.";

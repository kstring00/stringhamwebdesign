import { referral } from "./referral";

/**
 * Everything /partners says. The referral reward is published (see
 * referral.ts). White-label pricing is agreed per project and stays off the
 * page.
 */

export const partnerCategories = [
  "Photographer or visual creative",
  "Brand or logo designer",
  "Marketing agency",
  "Consultant",
  "Other complementary service",
] as const;

export const partnerInterests = ["Referrals", "White-label", "Both"] as const;

export const paths = [
  {
    key: "referral",
    label: "Path A",
    name: "Referral partner",
    lead: "You know a business owner who needs a website. You introduce us; I take it from there.",
    // The table below says who talks to the client, who contracts and how
    // money works; these are only what it doesn't.
    points: ["I handle discovery, scoping, the contract and delivery."],
  },
  {
    key: "agency",
    label: "Path B",
    name: "Agency development partner",
    lead: "You keep the client. I build the website behind the scenes, under your name if you want.",
    points: [
      "I don't contact your client or show the work without your permission.",
      "Everything is handed to you, or to your client, at the end.",
    ],
  },
] as const;

/** The side-by-side comparison under the two paths. */
export const comparison = [
  { row: "Who talks to the client", a: "I do, with you copied if you like", b: "You do; I join calls only if you ask" },
  { row: "Who contracts with the client", a: "Stringham Web Design LLC", b: "You" },
  { row: "Whose name is on the work", a: "Mine, with your introduction", b: "Yours, if you prefer" },
  { row: "How money works", a: `I pay you ${referral.percent} of the website total once it's paid in full`, b: "You pay me a project price we agree before work starts" },
] as const;

export const reasons = [
  { title: "Owner-led delivery", body: "I'm the one who plans, designs, builds and answers your email. Nothing is passed to a junior or resold." },
  { title: "Built to be used", body: "Clear structure, plain words and one obvious next step on every page, so the site does a job for the business." },
  { title: "Real interaction", body: "Booking, ordering and request flows built into the site, not bolted on with a widget that breaks the design." },
  { title: "Scope in writing", body: "What's included, what isn't, milestones and the price, agreed before work starts." },
  { title: "Your client owns it", body: "Domain, hosting and accounts stay in the business's name. Nothing is held back at handoff." },
  { title: "Straight about AI", body: "I build with AI-assisted development tools. I direct the work, review what they produce, test it, and I'm accountable for the result." },
] as const;

export const partnerSteps = [
  { n: "1", title: "Meet", body: "Reply by email or book a short call, whichever you prefer. What you do, who your clients are, how you like to work." },
  { n: "2", title: "Determine fit", body: "If we're not a good match, I'll say so. No hard feelings." },
  { n: "3", title: "Agree on how we work", body: "Referral or white-label, who does what, and how money works, in writing." },
  { n: "4", title: "Introduce a project", body: "You send an introduction, or brief me on your client's project." },
  { n: "5", title: "Deliver", body: "Scope, build, check-ins and launch, the way we agreed." },
  { n: "6", title: "Review the relationship", body: "After the first project we look at what worked and what to change." },
] as const;

export const partnerQuestions = [
  {
    q: "Who is an ideal referral?",
    a: "An owner-run business that needs a new website or a rebuild, can make the decision themselves, and wants a site that does a job: bookings, orders, calls or requests. Local service businesses, shops, studios and practices are a good fit.",
  },
  { q: "Do I have to bring a minimum number of clients?", a: "No. One introduction a year is fine. There's no quota and no exclusivity." },
  {
    q: "Who communicates with the client?",
    a: "On a referral, I do, and I'll copy you if you want to stay in the loop. On white-label work, you do; I stay behind the scenes unless you ask me onto a call.",
  },
  { q: "Can an agency use Stringham behind the scenes?", a: "Yes. The work can go out under your name, I won't contact your client or show the project without your permission, and I'll sign a confidentiality agreement if you need one." },
  {
    q: "How is compensation handled?",
    a: `For referrals: ${referral.percent} of the website's total price, paid once the client has paid for the website in full. On a ${referral.example.price} website, that's ${referral.example.reward}. Monthly Plan fees don't count toward it, and the client is told about the reward. For white-label: you pay me a project price we agree before work starts.`,
  },
  { q: "Do I have to pay anything to participate?", a: "No. There's no fee to become a partner, and you don't need to be one to refer a business." },
  {
    q: "Who owns the completed website?",
    a: "On a referral, the client owns the site, its content, the domain and their accounts once it's paid in full. On white-label work, ownership follows your agreement with your client, and I hand everything over to whoever it belongs to.",
  },
] as const;

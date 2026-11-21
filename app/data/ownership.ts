import { money, PRICES } from "./offer";

/**
 * /owner-handoff ("Ownership" in the nav): what a practice owns, what it is
 * handed at launch, and what staying on with Kyle costs. Every promise here
 * is also in content/service-terms.md (sections 2 and 3); change them
 * together, and only with Kyle's say-so: these are commitments, not copy.
 *
 * The handoff has to be deliverable at the existing prices, so each part is
 * scoped (one manual, the tasks in it, one session of a set length) and
 * nothing here promises open-ended support.
 */
export const TRAINING_MINUTES = 60;
export const TRAINING_WINDOW_DAYS = 30;

export const ownership = {
  title: "Your website is yours to keep, and yours to run.",
  lede: "Your domain, your hosting and your site’s code sit in accounts in your practice’s name from the first day. When the site launches, I hand you what you need to run it without me. Keeping me on afterwards is optional.",

  /** The three accounts, each in the practice's name, each with Kyle as a guest. */
  accounts: [
    {
      name: "Domain",
      what: "Your address on the internet.",
      yours: "Registered to your practice, in your own account with the registrar.",
      guest: "I’m added as a guest so I can connect it to the site.",
    },
    {
      name: "Hosting",
      what: "Where the site lives.",
      yours: "An account in your practice’s name with the hosting company.",
      guest: "I’m a team member on it so I can launch and update the site.",
    },
    {
      name: "Code",
      what: "The files that make up the site.",
      yours: "A repository your practice owns, with the full history of the work.",
      guest: "I’m a collaborator on it while I build.",
    },
  ],
  guestLine: "On each one I’m a guest. Remove me whenever you like, and the site keeps running.",

  /** What is handed over at launch, each part with its scope. */
  handoff: [
    {
      name: "An owner’s manual",
      body: "A short written guide to your own site, in plain language: how to change words, photos, hours and fees, how to add a page, where each account lives, how to remove me, and who to call if something breaks.",
    },
    {
      name: "Recorded walkthroughs",
      body: "Screen recordings of me doing each everyday task in the manual on your site, not a generic tutorial. Watch them again whenever you need to.",
    },
    {
      name: "One live training session",
      body: `Up to ${TRAINING_MINUTES} minutes with whoever will run the site, by video call or in person around Houston, within ${TRAINING_WINDOW_DAYS} days of launch.`,
    },
    {
      name: "A running-costs sheet",
      body: "One page listing every outside service your site depends on: what it is, who bills you, what it costs, when it renews and how to cancel it.",
    },
  ],

  /** What becomes the practice's property once the site is paid in full. */
  yours: ["The design of your site", "The words and photos you supplied", "The code I wrote for it", "Your domain and the accounts above, which were yours all along"],
  /** What can't be handed over as property, said plainly. */
  licensed: "Some things can’t be handed over as property. Fonts, stock images, and the software and services your site runs on belong to their makers and are used under their licenses. Where one needs an account or a license, it’s in your practice’s name when the maker allows it, and your running-costs sheet says so.",
  tools: "A scheduling or intake tool is its own account, also yours. It holds client information; the website doesn’t.",

  costs: "Fees from other companies are billed to you by them, not by me: your domain’s yearly renewal, hosting if your plan has a fee, and any scheduling, intake or email tool you choose. The running-costs sheet lists each one.",
  after: "The handoff covers your site as it launches. After the training session, more help is quoted before I do it, or it’s covered by Website Care.",

  /** The one quiet line about staying on. */
  care: `Rather not run it? I will, for ${money(PRICES.care)} a month.`,
} as const;

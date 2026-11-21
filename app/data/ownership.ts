import { money, PRICES } from "./offer";

/**
 * /owner-handoff ("Handoff" in the nav): what a practice owns, how the
 * handoff goes step by step, what it is handed at launch, and what staying
 * on with Kyle costs. Every promise here is also in
 * content/service-terms.md (sections 2 and 3); change them together, and
 * only with Kyle's say-so: these are commitments, not copy.
 *
 * It speaks about "every site I build", from here on. It makes no claim
 * about sites built before these terms.
 *
 * The handoff has to be deliverable at the existing prices, so each part is
 * scoped (one manual, the tasks in it, one session of a set length, fixes
 * for a set number of days) and nothing here promises open-ended support.
 *
 * The step-by-step section carries an honest ease label on every step. The
 * two "making a change" steps describe how these sites are really edited:
 * the details live in plain text files in the code account, there is no
 * visual editor, and a new page or section is code. Don't soften them.
 */
export const TRAINING_MINUTES = 60;
export const TRAINING_WINDOW_DAYS = 30;
/** Days after launch in which anything built that is broken, or not as agreed, is fixed free. */
export const FIX_DAYS = 30;

export type Ease = "Nothing for you to do" | "Easy" | "Takes some learning" | "Hard";

export const ownership = {
  title: "Your website is yours to keep, and yours to run.",
  lede: "For every site I build, the domain, hosting and code accounts are opened in your practice’s name, or transferred to it at launch, with me added as a helper. When the site launches, I hand you what you need to run it without me. Keeping me on afterwards is optional.",

  /** The three accounts, each in the practice's name, each with Kyle as a helper. */
  accounts: [
    {
      name: "Domain",
      what: "Your address on the internet.",
      yours: "Registered to your practice, in your own account with the company that sells web addresses.",
      helper: "I’m added as a helper so I can connect it to the site.",
    },
    {
      name: "Hosting",
      what: "Where the site lives.",
      yours: "An account in your practice’s name with the hosting company.",
      helper: "I’m added as a helper so I can launch and update the site.",
    },
    {
      name: "Code",
      what: "The files that make up the site.",
      yours: "An account your practice owns that holds the site’s files and the full history of the work.",
      helper: "I’m added as a helper while I build.",
    },
  ],
  helperLine: "On each one I’m a helper. Remove me whenever you like, and the site keeps running.",
  transferLine: "If an account has to start out in my name, it’s transferred to your practice at launch.",

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
      body: `Up to ${TRAINING_MINUTES} minutes with whoever will run the site, by video or in person in the Houston area, within ${TRAINING_WINDOW_DAYS} days of launch.`,
    },
    {
      name: "A running-costs sheet",
      body: "One page listing every outside service your site depends on: what it is, who bills you, what it costs, when it renews and how to cancel it.",
    },
  ],
  /** Support after the handoff: a set window for fixes, everything else quoted or on Website Care. */
  afterLaunch: [
    `Anything I built that’s broken or not working as agreed, I fix free for ${FIX_DAYS} days after launch.`,
    "Changes, new content and questions beyond the training session are quoted separately or covered by Website Care.",
  ],

  /**
   * How the handoff works, in order. Each step: when it happens, what it
   * is, the ease label, who does it, about how long it takes, and what the
   * practice ends up holding.
   */
  steps: [
    {
      when: "Before the build",
      title: "Opening your three accounts",
      ease: "Easy",
      body: "You open the domain, hosting and code accounts in your practice’s name while I’m on a call with you, telling you what to click. If you already own your domain, it stays where it is.",
      who: "You, with me on the call",
      time: "One call, about 45 minutes",
      hold: "Three accounts in your practice’s name, with me added as a helper on each",
    },
    {
      when: "During the build",
      title: "I build inside your accounts",
      ease: "Nothing for you to do",
      body: "I work in your accounts as a helper, so the site is yours as it takes shape. Your part in the build itself is looking at the design and asking for changes, in two rounds.",
      who: "Me",
      time: "About 3 weeks",
      hold: "The site in progress, in your own accounts",
    },
    {
      when: "Launch",
      title: "The site goes live on your domain",
      ease: "Nothing for you to do",
      body: "Once you approve the finished site, I point your domain at it and check it on phones.",
      who: "Me, after you approve",
      time: "Usually live within the hour. A domain change can take up to a day to reach everyone.",
      hold: "A live site at your own address",
    },
    {
      when: "At launch",
      title: "The handoff package",
      ease: "Easy",
      body: "I send the owner’s manual, the recorded walkthroughs and the running-costs sheet. Read the manual once and keep the rest for when you need it.",
      who: "Me. You read and watch.",
      time: "About an hour of your time",
      hold: "The manual, the recordings and the costs sheet",
    },
    {
      when: `Within ${TRAINING_WINDOW_DAYS} days of launch`,
      title: "The training session",
      ease: "Easy",
      body: "Whoever will run the site does each everyday task once while I watch: changing a detail, swapping a photo, checking the messages your form sends.",
      who: "You or your staff, with me",
      time: `Up to ${TRAINING_MINUTES} minutes`,
      hold: "Someone at your practice who has done each task once",
    },
    {
      when: "Afterward",
      title: "Running the site day to day",
      ease: "Easy",
      body: "The site runs on its own, and there’s nothing to sign in to each day. Your part is keeping the card on your domain and hosting accounts current so they renew, and reading the messages your form sends you.",
      who: "You",
      time: "A few minutes a month",
      hold: "A site that stays online in accounts you control",
    },
    {
      when: "Afterward",
      title: "Making a small change yourself",
      ease: "Takes some learning",
      body: "A phone number, your hours or a photo. There’s no drag-and-drop editor. You sign in to your code account, open the one file that holds the detail, change it and save, and the site republishes itself in a few minutes. It’s plain text, and it’s new to most owners. The training session covers it, the manual has each step, and every save is kept in a history, so a mistake can be undone.",
      who: "You",
      time: "About 10 minutes once you’ve done it, longer the first time",
      hold: "The change live on your site, with a history you can roll back",
    },
    {
      when: "Afterward",
      title: "Making a bigger change",
      ease: "Hard",
      body: "A new page or a new section is written in code, and realistically needs a developer. Most owners ask me: I quote it before I start, and smaller edits fit inside Website Care’s 30 minutes a month.",
      who: "A developer: me, or anyone you choose",
      time: "Depends on the change, quoted first",
      hold: "The new work, in your accounts like the rest",
    },
    {
      when: "Any time",
      title: "Leaving me, or bringing in another developer",
      ease: "Easy",
      body: "Easy only because you already hold every account. Remove me as a helper, or add someone new, in each account’s settings. Nothing has to be transferred, and there’s nothing to ask me for. The site is built with widely used tools, so another developer can pick it up.",
      who: "You",
      time: "A few minutes per account",
      hold: "Everything you held the day before",
    },
  ] satisfies readonly { when: string; title: string; ease: Ease; body: string; who: string; time: string; hold: string }[],

  /** What becomes the practice's property once the site is paid in full. */
  yours: ["The design of your site", "The words and photos you supplied", "The code I wrote for it", "Your domain and the accounts above"],
  /** What can't be handed over as property, said plainly. */
  licensed: "Some things can’t be handed over as property. Fonts, stock images, and the software and services your site runs on belong to their makers and are used under their licenses. Where one needs an account or a license, it’s in your practice’s name when the maker allows it, and your running-costs sheet says so.",
  tools: "A scheduling or intake tool is its own account, also yours. It holds client information; the website doesn’t.",

  costs: [
    "You pay other companies’ fees directly to them: your domain’s yearly renewal, your hosting, and any scheduling, intake or email tool you choose. The running-costs sheet lists each one.",
    "Website Care doesn’t cover those bills. It pays for my time running the site.",
  ],

  /** The one quiet line about staying on. */
  care: `Rather not run it? I will, for ${money(PRICES.care)} a month.`,
  careNote: "Website Care is optional and month to month. It covers my time running the site, not your domain, hosting or tool bills.",
} as const;

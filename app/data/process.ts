/**
 * The seven steps, from brief to handoff.
 *
 * Shared between the homepage strip and the quote confirmation page so the
 * two can never drift apart — a client who reads the process on the site and
 * again in their confirmation gets the same seven steps in the same words.
 */

export type ProcessStep = {
  /** "01" */
  number: string;
  /** The technical label: SUBMIT, REPLY, SCOPE... */
  name: string;
  /** The single line that shows without expanding anything. */
  line: string;
  /** The detail panel. Paragraphs, rendered in order. */
  detail: string[];
};

/**
 * The payment terms, stated once. Step 03 carries them because that is where
 * cost is agreed. One string, so nothing can say it differently.
 */
export const depositTerms =
  "Payment is in two halves: 50% to reserve your build slot, 50% within 7 days of launch.";

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    name: "Submit",
    line: "You send the brief.",
    detail: [
      "Seven questions about your business and what you need the site to do. Takes about five minutes.",
      "You don't need to know what you want built — that's my job. You just need to know what's not working now.",
    ],
  },
  {
    number: "02",
    name: "Reply",
    line: "I get back to you within one business day, with a link to book a call.",
    detail: [
      "A real reply from me, not an autoresponder. I'll have read the brief and I'll tell you straight whether I'm the right fit.",
      "If I'm not, I'll say so and point you somewhere better. If I am, the reply has a booking link and we find a time.",
    ],
  },
  {
    number: "03",
    name: "Scope",
    line: "We agree what's being built and what it costs. Documents signed both ways.",
    detail: [
      "After the call you get a written scope: what I'm building, what I'm not, how many revision rounds are included, what it costs, and when it's done.",
      "You sign it. I sign it. Neither of us starts work on a handshake and a hope.",
      depositTerms,
      "If the scope changes later, it changes in writing, with your approval, before I touch it.",
    ],
  },
  {
    number: "04",
    name: "Portal",
    line: "I set up your account. Everything lives there from here on.",
    detail: [
      "Your own login. Files, messages, timesheets, invoices, approvals — all in one place, all timestamped.",
      "No hunting through email threads six weeks later trying to remember what we decided. It stays yours after launch.",
    ],
  },
  {
    number: "05",
    name: "Build",
    line: "Two calls, a timesheet every ten hours, and a hard cap I can't cross without you.",
    detail: [
      "We meet twice on Zoom at points we agree up front, so we're looking at the same screen instead of describing it to each other.",
      "Every ten hours you get the timesheet — date, task, what I did in plain language, hours logged, and what I didn't bill you for.",
      "Ten hours is a ceiling, not a meeting: I stop there and I don't keep going until you've seen the number and said continue. You can't get a surprise invoice out of this. There is no version of it where you find out late.",
    ],
  },
  {
    number: "06",
    name: "Review",
    line: "Final walkthrough, revisions, you approve.",
    detail: [
      "I walk you through the finished site and you tell me what's wrong with it. That's what the revision rounds in your scope are for — use them.",
      "Nothing goes live until you've said it's right.",
    ],
  },
  {
    number: "07",
    name: "Handoff",
    line: "Accounts transfer to you, you get the guide and the walkthrough, the site goes live.",
    detail: [
      "Final payment clears, then everything moves to your name — domain, hosting, repository, analytics.",
      "You get a written owner's guide in plain language and a recorded walkthrough of how to run the thing.",
      "If you'd rather I keep maintaining it, that's a separate monthly plan you can cancel any time. If you'd rather not, you own everything and you owe me nothing.",
    ],
  },
];

export const processIntro =
  "Seven steps from first message to your site being yours. No surprises in the middle.";

/**
 * The four-phase summary the resources index shows in its featured card. It
 * is a summary of the seven steps above, not a second process: each phase
 * names the steps it covers so the two descriptions cannot contradict.
 */
export const phases = [
  { number: "01", name: "Discovery", line: "You send the brief, I reply within a business day, and we agree the scope in writing.", covers: "Steps 01–03" },
  { number: "02", name: "Design", line: "You get a portal login and we look at the same screen together before anything is built.", covers: "Step 04" },
  { number: "03", name: "Build", line: "Clean code, a timesheet every ten hours, and a hard cap I can't cross without you.", covers: "Step 05" },
  { number: "04", name: "Launch", line: "Final walkthrough, revisions, your approval. Then everything moves to your name.", covers: "Steps 06–07" },
];

/**
 * Selected work, shown on /partners. Every project is labeled for exactly
 * what it is. Nothing here is a paid client engagement, and no project
 * claims results.
 *
 * `confirmed`: Kyle has confirmed the status label AND, for a business he
 * doesn't own, that the owner is fine with it being shown. Unconfirmed
 * projects render only on preview deployments (and locally with
 * SHOW_DRAFT_WORK=1), marked as drafts; production never shows them.
 *
 * Screens are real captures of each project's own code, run locally, at
 * 1440 and 390 wide, under public/showcase/<key>-desktop|mobile.(avif|webp).
 */
export type WorkStatus = "Own product · live" | "In progress with the owner" | "Built for a local business · pre-launch" | "Spec build" | "Concept";

export type Work = {
  key: string;
  name: string;
  status: WorkStatus;
  /** One plain line on what it is. */
  what: string;
  /** What Kyle actually did, in his words. No outcomes or metrics. */
  did: string;
  /** Only for something that is actually live. */
  liveUrl?: string;
  alt: { desktop: string; mobile: string };
  confirmed: boolean;
};

export const work: Work[] = [
  {
    key: "common-ground",
    name: "Common Ground",
    status: "Own product · live",
    what: "A free parent navigation hub for autism families: one question, six paths, one clear next step.",
    did: "Planned, designed, built and launched it myself. It is also offered to clinics as a white-labeled Family Resource Hub.",
    liveUrl: "https://www.commongroundautism.org",
    alt: {
      desktop: "Common Ground home page: “Real autism support for real families,” with a Find My Next Step button",
      mobile: "Common Ground home page on a phone",
    },
    confirmed: true,
  },
  {
    key: "vary-board",
    name: "The Vary Board",
    status: "In progress with the owner",
    what: "A new product site for a wall-mounted training board designed by a physical therapist, replacing a store theme, with checkout staying on the existing store.",
    did: "Planning, design and build, with every price, spec and review sourced from the owners and reviewed by them before launch.",
    alt: {
      desktop: "The Vary Board home page draft: “One wall. Six ways to move better,” with a hexagon diagram of six exercises",
      mobile: "The Vary Board home page draft on a phone",
    },
    confirmed: false,
  },
  {
    key: "northline",
    name: "Northline Wheelchair Transportation",
    status: "Built for a local business · pre-launch",
    what: "A booking-first site for a non-emergency wheelchair van service in north Houston.",
    did: "Planning, design and build, including the ride request flow. Waiting on the owner's photos, reviews and final details before launch.",
    alt: {
      desktop: "Northline Wheelchair Transportation home page draft: “Wheelchair van rides in north Houston,” with a Book a Ride button and a route map",
      mobile: "Northline Wheelchair Transportation home page draft on a phone",
    },
    confirmed: false,
  },
  {
    key: "dubai-and-dips",
    name: "Dubai & Dips",
    status: "Spec build",
    what: "A dessert shop site with order-ahead, built to show the owner what their site could be.",
    did: "Designed and built it before any agreement, as a pitch. Ordering runs in demo mode.",
    alt: {
      desktop: "Dubai & Dips home page spec build: a chocolate bar hero with “Made here, every morning” and an order-ahead button",
      mobile: "Dubai & Dips home page spec build on a phone",
    },
    confirmed: false,
  },
  {
    key: "casa-matcha",
    name: "Casa Matcha",
    status: "Concept",
    what: "A concept site for a two-location matcha and coffee café, with a demo order-ahead flow.",
    did: "Designed and built as a concept. Not commissioned; the café's own photos and logo would replace the stand-ins.",
    alt: {
      desktop: "Casa Matcha concept home page: a matcha drink splash with “Real matcha. Real coffee. Real familia.”",
      mobile: "Casa Matcha concept home page on a phone",
    },
    confirmed: false,
  },
];

/** Preview deployments (and SHOW_DRAFT_WORK=1 locally) show unconfirmed projects as drafts. Production never does. */
export const showDraftWork = process.env.VERCEL_ENV === "preview" || process.env.SHOW_DRAFT_WORK === "1";

export const visibleWork = work.filter((w) => w.confirmed || showDraftWork);

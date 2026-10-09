/**
 * Selected work, shown on /partners. Every project is labeled for exactly
 * what it is. Nothing here is a paid client engagement, and no project
 * claims results.
 *
 * `kind` is the honest state of the project:
 *   live        public and in use
 *   in-progress built with the business owner, not launched
 *   concept     built on spec, never commissioned
 *
 * `onPartners`: shown in the /partners portfolio. Projects set to false keep
 * their data and screenshots here so they can come back later.
 *
 * `confirmed`: Kyle has confirmed the status label AND, for a business he
 * doesn't own, that the owner is fine with it being shown. Unconfirmed
 * projects render only on preview deployments (and locally with
 * SHOW_DRAFT_WORK=1), marked as drafts; production never shows them.
 *
 * `liveUrl` is only for something that is actually live. `previewUrl` is
 * only for a public preview Kyle has checked works and the owner is fine
 * with sharing. Leave both empty rather than guess.
 *
 * Screens are real captures of each project's own code, run locally, at
 * 1440 and 390 wide, under public/showcase/<key>-desktop|mobile.(avif|webp).
 */
export type WorkKind = "live" | "in-progress" | "concept" | "archived";

export const kindLabel: Record<WorkKind, { label: string; means: string }> = {
  live: { label: "Live product", means: "Public and in use." },
  "in-progress": { label: "Work in progress", means: "Built with the business owner. Not launched yet." },
  concept: { label: "Concept", means: "Built on spec. Never commissioned." },
  archived: { label: "Archived", means: "Earlier design work, no longer in active development." },
};

export type Work = {
  key: string;
  name: string;
  kind: WorkKind;
  /** A short line after the status pill, saying where the project stands. */
  stage: string;
  /** One plain line on what it is. */
  what: string;
  /** What was actually designed and built. Features, never outcomes or metrics. */
  built: string[];
  liveUrl?: string;
  previewUrl?: string;
  alt: { desktop: string; mobile: string };
  onPartners: boolean;
  confirmed: boolean;
};

export const work: Work[] = [
  {
    key: "common-ground",
    name: "Common Ground",
    kind: "live",
    stage: "My own product",
    what: "A free support hub for parents raising a child with autism, built so a parent with five spare minutes can find one clear next step.",
    built: [
      "One question, “What do you need today?”, with six paths that each lead to a single next step.",
      "Local providers, parent tools and plain-English guides. No sign-up, and no child information collected.",
      "A white-label version clinics can run under their own name and colors.",
    ],
    liveUrl: "https://www.commongroundautism.org",
    alt: {
      desktop: "Common Ground home page: “Real autism support for real families,” with a Find My Next Step button",
      mobile: "Common Ground home page on a phone",
    },
    onPartners: true,
    confirmed: true,
  },
  {
    key: "dubai-and-dips",
    name: "Dubai & Dips",
    kind: "archived",
    stage: "Previous design work · not a launched site",
    what: "A website for a Clear Lake dessert shop, designed around ordering ahead.",
    built: [
      "An order-ahead flow for pickup, delivery and group orders, wired to hand off to the shop’s ordering system. It runs as a demo until that account is connected.",
      "An open, closing-soon or closed status worked out in the shop’s own time zone, shown in the header, menu and footer.",
      "An animated flight-route map that doubles as the site’s navigation. It loads only when needed and holds still for visitors who prefer reduced motion.",
    ],
    alt: {
      desktop: "Dubai & Dips home page in development: a chocolate bar hero with “Made here, every morning” and an order-ahead button",
      mobile: "Dubai & Dips home page in development, on a phone",
    },
    onPartners: true,
    confirmed: false,
  },
  {
    key: "vary-board",
    name: "The Vary Board",
    kind: "in-progress",
    stage: "In development with the owner",
    what: "A new product site for a wall-mounted training board designed by a physical therapist. Checkout stays on the existing store.",
    built: [
      "A three-question plan builder that turns a visitor’s situation into a four-week plan.",
      "A drag-to-place room planner that shows whether the board fits a bedroom, garage, patio or clinic, drawn to scale.",
      "Every price, spec and review read from one file, with a check that blocks launch until the owners have approved each item.",
    ],
    alt: {
      desktop: "The Vary Board home page in development: “One wall. Six ways to move better,” with a hexagon diagram of six exercises",
      mobile: "The Vary Board home page in development, on a phone",
    },
    onPartners: false,
    confirmed: false,
  },
  {
    key: "northline",
    name: "Northline Wheelchair Transportation",
    kind: "in-progress",
    stage: "Built for a local business · pre-launch",
    what: "A booking-first site for a non-emergency wheelchair van service in north Houston.",
    built: ["Planning, design and build, including the ride request flow. Waiting on the owner's photos, reviews and final details before launch."],
    alt: {
      desktop: "Northline Wheelchair Transportation home page draft: “Wheelchair van rides in north Houston,” with a Book a Ride button and a route map",
      mobile: "Northline Wheelchair Transportation home page draft on a phone",
    },
    onPartners: false,
    confirmed: false,
  },
  {
    key: "casa-matcha",
    name: "Casa Matcha",
    kind: "concept",
    stage: "Not commissioned",
    what: "A concept site for a two-location matcha and coffee café, with a demo order-ahead flow.",
    built: ["Designed and built as a concept. The café's own photos and logo would replace the stand-ins."],
    alt: {
      desktop: "Casa Matcha concept home page: a matcha drink splash with “Real matcha. Real coffee. Real familia.”",
      mobile: "Casa Matcha concept home page on a phone",
    },
    onPartners: false,
    confirmed: false,
  },
];

/** Preview deployments (and SHOW_DRAFT_WORK=1 locally) show unconfirmed projects as drafts. Production never does. */
export const showDraftWork = process.env.VERCEL_ENV === "preview" || process.env.SHOW_DRAFT_WORK === "1";

/** The /partners portfolio: on the partner list, and confirmed unless this is a preview. */
export const partnerWork = work.filter((w) => w.onPartners && (w.confirmed || showDraftWork));

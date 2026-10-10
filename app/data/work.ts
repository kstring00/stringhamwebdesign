/**
 * Selected work, shown on /partners. Every project is labeled for exactly
 * what it is. Nothing here is a paid client engagement, and no project
 * claims results.
 *
 * `kind` is the honest state of the project:
 *   live        public and in use
 *   demo        a design demo with a preview link; not a client's live site
 *   in-progress built with the business owner, not launched
 *   concept     built on spec, never commissioned
 *
 * `onHome`: in the home page's work carousel (and the hero's browser
 * frames), in this order. Three demos, each labeled; Common Ground lives
 * on /work. `onWork`: on the /work portfolio.
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
export type WorkKind = "live" | "demo" | "in-progress" | "concept" | "archived";

export const kindLabel: Record<WorkKind, { label: string; means: string }> = {
  live: { label: "Live product", means: "Public and in use." },
  demo: { label: "Design demo", means: "Built to show the approach. Not a client's live site." },
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
  /** What kind of business or project it is, in a few words. */
  type?: string;
  /** The one action the site was built around. */
  builtFor?: string;
  /** The carousel chip: the kind, then where the demo stands. */
  chip?: string;
  /** A testimonial, only with the person's written permission. Never invented. */
  testimonial?: { quote: string; name: string; business: string };
  /** What was actually designed and built. Features, never outcomes or metrics. */
  built: string[];
  liveUrl?: string;
  previewUrl?: string;
  alt: { desktop: string; mobile: string };
  onHome?: boolean;
  onWork?: boolean;
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
    type: "Support hub for autism families · my own product",
    builtFor: "Help a parent find one clear next step today.",
    liveUrl: "https://www.commongroundautism.org",
    alt: {
      desktop: "Common Ground home page: “Real autism support for real families,” with a Find My Next Step button",
      mobile: "Common Ground home page on a phone",
    },
    onWork: true,
    onPartners: true,
    confirmed: true,
  },
  {
    key: "growthgains",
    name: "GrowthGains",
    kind: "demo",
    chip: "Design demo · Preview link",
    stage: "Demo with a preview link",
    type: "Life coach",
    what: "A demo for a life coach that meets visitors at “I know something needs to change” and gives them one easy next move.",
    builtFor: "Book a free consultation.",
    built: [
      "A first screen that names the feeling a visitor arrives with, “You know something needs to change,” and one button: book a free consultation.",
      "Three doorways, life after sport, foster care and adoption, identity and leadership change, each a short resource page that ends at the same next step.",
      "A three-step start flow: what you're navigating, what you'd most like to change, then a consultation time, with those answers carried into the booking.",
    ],
    previewUrl: "https://rawrxd-nu.vercel.app/",
    alt: {
      desktop: "GrowthGains demo home page: “You know something needs to change,” a Book a free consultation button, and a portrait beside a current-to-next-chapter diagram",
      mobile: "GrowthGains demo home page on a phone",
    },
    onHome: true,
    onWork: true,
    onPartners: true,
    confirmed: true,
  },
  {
    key: "lake-city-storage",
    name: "Lake City Self Storage",
    kind: "demo",
    chip: "Design demo · Not launched",
    stage: "Demo · not launched",
    type: "Family-owned storage facility",
    what: "A demo for a family-owned storage facility that starts with what you're storing, then walks renters to the right unit type, size and price.",
    builtFor: "Get a renter to the right unit and price.",
    built: [
      "Starts with what you're storing: climate-controlled or drive-up first, then size and current price, before any price list.",
      "Unit doors and scenes drawn in code in one reference layout, so the same picture scales from a desktop stage to a phone without a second layout.",
      "Office hours, gate access, a contact bar that stays within reach on phones, a map to the facility, and a pay-online link, all in the header.",
    ],
    previewUrl: "https://storage-cyan-mu.vercel.app/",
    alt: {
      desktop: "Lake City Self Storage demo: the climate-controlled sizes step, unit sizes with current prices and a reserve button for each",
      mobile: "Lake City Self Storage demo, the unit sizes step on a phone",
    },
    onHome: true,
    onWork: true,
    onPartners: true,
    confirmed: true,
  },
  {
    key: "dubai-and-dips",
    name: "Dubai & Dips",
    kind: "archived",
    chip: "Design demo · Archived",
    stage: "Previous design work · not a launched site",
    type: "Clear Lake dessert shop",
    what: "A website for a Clear Lake dessert shop, designed around ordering ahead.",
    builtFor: "Order ahead for pickup.",
    built: [
      "An order-ahead flow for pickup, delivery and group orders, built to hand off to the shop’s ordering system. In the demo, ordering is simulated.",
      "An open, closing-soon or closed status worked out in the shop’s own time zone, shown in the header, menu and footer.",
      "An animated flight-route map that doubles as the site’s navigation. It loads only when needed and holds still for visitors who prefer reduced motion.",
    ],
    alt: {
      desktop: "Dubai & Dips home page design: a chocolate bar hero with “Made here, every morning” and an order-ahead button",
      mobile: "Dubai & Dips home page design, on a phone",
    },
    previewUrl: "https://dubaianddips2.vercel.app/",
    onHome: true,
    onWork: true,
    onPartners: true,
    confirmed: true,
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

/** The home page's carousel and hero frames: the three demos, in order. Never padded. */
export const homeWork = work.filter((w) => w.onHome && w.confirmed);

/** The /work portfolio: everything confirmed, plus drafts on previews. */
export const allWork = work.filter((w) => w.onWork && (w.confirmed || showDraftWork));

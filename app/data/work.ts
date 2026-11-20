/**
 * Selected work: one list, shown in this order on the home page, on /work
 * and in the hero. Every project is labeled for exactly what it is, and no
 * project claims results.
 *
 * None of these is a commissioned website for a therapy or counseling
 * practice, and the copy around them must never say or imply otherwise.
 * `type` and `stage` say what each one is: two of Kyle's own products for
 * autism families, and a site built for a life coach.
 *
 * `kind` is the honest state of the project:
 *   live        public and in use
 *   demo        a design demo with a preview link; not a client's live site
 *   in-progress built with the owner, not launched
 *   concept     built on spec, never commissioned
 *   archived    earlier design work, no longer in active development
 *
 * A project for someone else goes in this list only after Kyle confirms
 * its label and the owner's OK to show it. `liveUrl` is only for something
 * that is actually live; `previewUrl` only for a public preview Kyle has
 * checked. Leave both empty rather than guess.
 *
 * Screens are real captures of each project, at 1440 and 390 wide, under
 * public/showcase/<key>-desktop|mobile.(avif|webp), with thumbnails from
 * scripts/make-thumbs.js. A project without a phone capture leaves
 * `alt.mobile` out and shows desktop-only.
 */
export type WorkKind = "live" | "demo" | "in-progress" | "concept" | "archived";

export const kindLabel: Record<WorkKind, { label: string; means: string }> = {
  live: { label: "Live", means: "Public and in use." },
  demo: { label: "Design demo", means: "Built to show the approach. Not a client's live site." },
  "in-progress": { label: "Work in progress", means: "Built with the owner. Not launched yet." },
  concept: { label: "Concept", means: "Built on spec. Never commissioned." },
  archived: { label: "Archived", means: "Earlier design work, no longer in active development." },
};

export type Work = {
  key: string;
  name: string;
  /** A shorter name for small spaces, when `name` is long. */
  shortName?: string;
  kind: WorkKind;
  /** A short line after the status pill, saying whose project it is and where it stands. */
  stage: string;
  /** One plain line on what it is. */
  what: string;
  /** What kind of organization or project it is, in a few words. */
  type?: string;
  /** The one action the site was built around. */
  builtFor?: string;
  /** What was actually designed and built. Features, never outcomes or metrics. */
  built: string[];
  liveUrl?: string;
  previewUrl?: string;
  /** `mobile` only when there is a real phone capture. */
  alt: { desktop: string; mobile?: string };
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
  },
  {
    key: "growthgains",
    name: "GrowthGains",
    kind: "live",
    stage: "Built for a life coach · live",
    type: "Life coach",
    what: "A site for a life coach that meets visitors at “I know something needs to change” and gives them one easy next move.",
    builtFor: "Book a free consultation.",
    built: [
      "A first screen that names the feeling a visitor arrives with, “You know something needs to change,” and one button: book a free consultation.",
      "Three doorways, life after sport, foster care and adoption, identity and leadership change, each a short resource page that ends at the same next step.",
      "A three-step start flow: what you're navigating, what you'd most like to change, then a consultation time, with those answers carried into the booking.",
    ],
    liveUrl: "https://rawrxd-nu.vercel.app/",
    alt: {
      desktop: "GrowthGains home page: “You know something needs to change,” a Book a free consultation button, and a portrait beside a current-to-next-chapter diagram",
      mobile: "GrowthGains home page on a phone",
    },
  },
  {
    key: "support-shelf",
    name: "The Support Shelf",
    kind: "live",
    stage: "My own product",
    type: "Printable tools for autism families · my own product",
    what: "Printable tools and guides for parents whose child is in ABA therapy, organized as four shelves a parent can pull from.",
    builtFor: "Help a parent find the right tool for today.",
    built: [
      "Four shelves (Get Organized, Make a Plan, Everyday Life, Support at Home), each with free and paid printables.",
      "A free ABC tracker for recording behavior and sharing it with the child's BCBA.",
      "A custom front end with Shopify handling checkout.",
    ],
    liveUrl: "https://www.thesupportshelf.org",
    alt: {
      desktop: "The Support Shelf home page: “Practical support for every step of the autism journey,” a Find my shelf button, and four books on a shelf labeled Get Organized, Make a Plan, Everyday Life and Support at Home",
      mobile: "The Support Shelf home page on a phone: the same headline and Find my shelf button, with the four shelf books below",
    },
  },
];

/** The same list, shaped for the carousel and the blog's closing card: the link is the live site, else the preview. */
export const showcaseWork = work.map((w) => ({
  key: w.key,
  name: w.name,
  kind: w.kind,
  stage: w.stage,
  type: w.type,
  what: w.what,
  builtFor: w.builtFor,
  built: w.built,
  href: w.liveUrl ?? w.previewUrl,
  linkLabel: w.liveUrl ? "Visit the live site" : w.kind === "archived" ? "View the archived demo" : "View the demo",
  alt: w.alt.desktop,
}));

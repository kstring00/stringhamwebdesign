/**
 * Every place a project appears — the homepage cards, the /work grid, the
 * case study rail and its previous/next links, and the sitemap — reads from
 * this one list, so a status or image changed here changes everywhere.
 */
export type ProjectStatus = "LIVE" | "IN PILOT" | "CASE STUDY";

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption: string;
  /** Intrinsic pixels, so the <img> reserves its box before it loads. */
  width: number;
  height: number;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  tech: string[];
  heroImage: string;
  heroImageAlt: string;
  heroImageWidth: number;
  heroImageHeight: number;
  screenshots: ProjectScreenshot[];
  liveUrl: string | null;
  problem: string[];
  features: string[];
  approach: string;
  year: string;
  clientType: string;
  note?: string;
};

export const projects: Project[] = [
  {
    slug: "common-ground",
    title: "Common Ground",
    summary: "A family-facing autism support hub designed to make next steps clearer and easier to find.",
    description: "A support and resource experience for Texas ABA families, built around practical guidance and clear pathways.",
    status: "IN PILOT",
    tech: ["Next.js", "TypeScript", "Responsive UI"],
    heroImage: "/work/common-ground/home.webp",
    heroImageWidth: 1600,
    heroImageHeight: 2438,
    heroImageAlt: "Common Ground homepage showing autism support resources for Texas families",
    screenshots: [
      {
        src: "/work/common-ground/home.webp",
        width: 1600,
        height: 2438,
        alt: "Common Ground homepage showing autism support resources for Texas families",
        caption: "Common Ground homepage and primary support pathways.",
      },
    ],
    liveUrl: "https://texasabacenterscg.com/",
    problem: [
      "Families looking for autism support can end up piecing together providers, parent resources, and next steps across too many places.",
      "The site needed to reduce that search burden and make the next useful action obvious without making the experience feel clinical or overwhelming.",
    ],
    features: [
      "Clear support pathways",
      "Family-focused resource navigation",
      "Responsive, accessible interface",
    ],
    approach: "I organized the experience around the decisions a family is actually trying to make, not around internal service categories. The interface keeps guidance direct, local, and easy to scan so visitors can move forward without decoding the site first.",
    year: "2026",
    clientType: "ABA / autism support",
  },
  {
    slug: "bcba-prep",
    title: "BCBA Prep",
    summary: "A study-library and member experience for BCBA exam preparation materials.",
    description: "An exam-prep storefront and member library organized around the BCBA task-list domains.",
    status: "LIVE",
    tech: ["Next.js", "TypeScript", "Member experience"],
    heroImage: "/work/bcba-prep/home.webp",
    heroImageWidth: 1600,
    heroImageHeight: 2052,
    heroImageAlt: "BCBA Prep domain library showing a stacked collection of exam study domains",
    screenshots: [
      {
        src: "/work/bcba-prep/library.png",
        width: 800,
        height: 441,
        alt: "BCBA Prep domain library with nine exam domains presented as stacked books",
        caption: "Domain library overview.",
      },
      {
        src: "/work/bcba-prep/contact.png",
        width: 800,
        height: 441,
        alt: "BCBA Prep contact page with a two-column support form and project navigation",
        caption: "Contact and support experience.",
      },
    ],
    liveUrl: "https://www.beethebehaviorbae.com/",
    problem: [
      "A large exam-prep catalog can quickly feel like a folder of disconnected PDFs instead of one coherent product.",
      "The build needed to make nine domains understandable before purchase and just as clear once a member signs in to study.",
    ],
    features: [
      "Domain-based study library",
      "Member dashboard",
      "Purchase and access pathways",
    ],
    approach: "I treated the nine domains as one visual library system with a consistent hierarchy from storefront to member access. The goal was to make the volume of material feel organized and premium without adding friction to finding the next thing to study.",
    year: "2026",
    clientType: "Exam prep · licensing",
  },
  {
    slug: "growthgains",
    title: "GrowthGains",
    summary: "A life-coaching site built to turn a hard season into a booked first conversation.",
    description: "A coaching site for people in transition, structured around one clear next step: a free consultation.",
    status: "LIVE",
    tech: ["Next.js", "TypeScript", "Consultation booking"],
    heroImage: "/work/growthgains/home.webp",
    heroImageWidth: 1920,
    heroImageHeight: 1080,
    heroImageAlt: "GrowthGains homepage: the headline 'You know something needs to change' beside an arc from the current chapter to the next — clarity, direction, action — and a portrait of the coach",
    screenshots: [
      {
        src: "/work/growthgains/home.webp",
        width: 1920,
        height: 1080,
        alt: "GrowthGains homepage: the headline 'You know something needs to change' beside an arc from the current chapter to the next — clarity, direction, action — and a portrait of the coach",
        caption: "The opening frame: the reason someone is here said plainly, the path from this chapter to the next drawn beside the person who walks it with you, and one button.",
      },
    ],
    liveUrl: "https://rawrxd-nu.vercel.app/",
    problem: [
      "People looking for a coach are usually in the middle of something — a decision, a loss, a change in identity, a season after sport — and a site that talks about coaching in the abstract gives them nothing to hold on to.",
      "The site needed to say the thing they are already thinking, show the shape of the path from where they are to the next chapter, and make the first conversation feel low-stakes enough to book.",
    ],
    features: [
      "A headline that names the moment rather than the service",
      "Three reassurances under the fold: gain clarity, move forward, a stronger you",
      "A current-to-next-chapter arc — clarity, direction, action — beside the coach's portrait",
      "A running line of the life transitions he works with, so a visitor can recognise their own",
      "One call to action, a free consultation, repeated and unopposed",
    ],
    approach: "I led with the visitor's situation rather than the service. The headline says the thing they are already thinking, the arc beside the portrait shows the path from the current chapter to the next in three words, and the transitions ticker lets someone find their own season without reading a paragraph. The whole page narrows toward a single free consultation.",
    year: "2026",
    clientType: "Life coaching",
  },
  {
    slug: "with-little",
    title: "With Little",
    summary: "A local-first journaling and life-planning app with optional cloud sync, built around faithfulness in small things.",
    description: "A local-first journaling and life-planning app with optional cloud sync, built around faithfulness in small things.",
    status: "LIVE",
    tech: ["Vanilla JS", "Supabase", "Local-first", "Auth"],
    heroImage: "/work/with-little/daily.webp",
    heroImageWidth: 1600,
    heroImageHeight: 882,
    heroImageAlt: "With Little daily ledger dashboard showing planning, habits, must-dos, a thought journal, and scripture",
    screenshots: [
      {
        src: "/work/with-little/daily.webp",
        width: 1600,
        height: 882,
        alt: "With Little daily ledger dashboard showing planning, habits, must-dos, a thought journal, and scripture",
        caption: "Daily Ledger dashboard and morning planning view.",
      },
    ],
    liveUrl: "https://withlittle.app",
    problem: [
      "Most journaling and habit apps assume you want your life on someone else's server, and most of them are built to keep you opening the app rather than to help you actually reflect.",
      "I wanted something quiet — a place to write honestly, track rhythms, and keep a prayer log, where the default was that nothing left my device unless I chose otherwise.",
    ],
    features: [
      "Passwordless authentication — sign-in by emailed magic link, no password ever stored",
      "Row-level security in Supabase, so each user can only read or write their own rows even with the public connection key",
      "Local-first storage — the app works fully offline, writing to localStorage as you type",
      "Optional cloud sync that merges local data on sign-in and resolves conflicts by newer timestamp",
      "Modular front end with no framework or build step — each module owns a slice of the UI over one shared storage layer",
      "A written privacy page explaining exactly what syncs, what stays local, and how to delete either",
    ],
    approach: "Local-first was the architectural decision everything else followed from. If the data lives on the device by default, sync becomes an optional layer rather than a dependency, the app keeps working with no connection, and privacy is the default state rather than a policy promise. Cloud sync was built on top of that as something a user opts into, not something they have to accept to use the app.",
    year: "2026",
    clientType: "Personal project",
    note: "A personal project, built and maintained on my own time.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

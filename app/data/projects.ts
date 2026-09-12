export type ProjectStatus = "LIVE" | "IN PILOT" | "LAUNCHING SOON" | "CASE STUDY";

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption: string;
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
    heroImage: "/hero-crt/common-ground.png",
    heroImageAlt: "Common Ground homepage showing autism support resources for Texas families",
    screenshots: [
      {
        src: "/hero-crt/common-ground.png",
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
    heroImage: "/hero-crt/bcba-prep.png",
    heroImageAlt: "BCBA Prep domain library showing a stacked collection of exam study domains",
    screenshots: [
      {
        src: "/work/bcba-prep/library.png",
        alt: "BCBA Prep domain library with nine exam domains presented as stacked books",
        caption: "Domain library overview.",
      },
      {
        src: "/work/bcba-prep/contact.png",
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
    slug: "lake-city-self-storage",
    title: "Lake City Self Storage",
    summary: "A self-storage website focused on helping visitors understand options and move toward the right unit.",
    description: "A storage-facility web experience structured around clear unit discovery and customer decision-making.",
    status: "CASE STUDY",
    tech: ["Web design", "Responsive UI", "Conversion UX"],
    heroImage: "/work/lake-city-self-storage/drive-up.webp",
    heroImageAlt: "Lake City Self Storage drive-up storage page, with an aerial photograph of the facility beside the storage-type explanation",
    screenshots: [
      {
        src: "/work/lake-city-self-storage/drive-up.webp",
        alt: "Lake City Self Storage drive-up storage page, with an aerial photograph of the facility beside the storage-type explanation",
        caption: "Drive-up storage: the type decision answered first, with a real photograph of the access style rather than a stock unit.",
      },
      {
        src: "/work/lake-city-self-storage/drive-up-sizes.webp",
        alt: "Drive-up size cards showing a 5 by 10 and a 10 by 10 unit with square footage, monthly price, and what fits in each",
        caption: "Step two: size, price, and what actually fits, once the customer knows which storage type they need.",
      },
    ],
    liveUrl: "https://storage-cyan-mu.vercel.app/",
    problem: [
      "Storage customers often arrive knowing what they need to store, but not which unit type or size matches it.",
      "The site needed to turn that uncertainty into a simple decision path while keeping pricing, access, and facility information easy to reach.",
    ],
    features: [
      "Storage-focused information architecture",
      "Responsive customer journey",
      "Clear conversion pathways",
    ],
    approach: "I led with the storage-type decision and paired straightforward guidance with strong facility imagery so the site answers the practical question first. From there, the experience narrows toward size, availability, and the action the customer is ready to take.",
    year: "2025",
    clientType: "Self storage",
  },
  {
    slug: "growthgains",
    title: "GrowthGains",
    summary: "A life-coaching site built to turn a hard season into a booked first conversation.",
    description: "A coaching site for people in transition, structured around one clear next step: a free consultation.",
    status: "LIVE",
    tech: ["Next.js", "TypeScript", "Cal.com booking"],
    heroImage: "/work/growthgains/home.webp",
    heroImageAlt: "GrowthGains homepage: the headline 'You know something needs to change' beside a portrait of the coach, with a Book a free consultation button",
    screenshots: [
      {
        src: "/work/growthgains/home.webp",
        alt: "GrowthGains homepage: the headline 'You know something needs to change' beside a portrait of the coach, with a Book a free consultation button",
        caption: "The opening frame: the reason someone is here, said plainly, and one button.",
      },
      {
        src: "/work/growthgains/journey.webp",
        alt: "The coaching journey section on navy: four numbered steps from consultation and intake through weeks two to twelve",
        caption: "The twelve-week process laid out as four steps, so the shape of the work is clear before anyone books.",
      },
    ],
    liveUrl: "https://rawrxd-nu.vercel.app/",
    problem: [
      "People looking for a coach are usually in the middle of something — a decision, a loss, a change in identity — and a site that talks about coaching in the abstract gives them nothing to hold on to.",
      "The site needed to name those situations directly, introduce the person they would be working with, and make the first conversation feel low-stakes enough to book.",
    ],
    features: [
      "Six named situations a visitor can recognise themselves in",
      "A four-step, twelve-week process shown before anyone commits",
      "Embedded Cal.com scheduling — book without leaving the page",
      "One call to action, repeated, and nothing else competing with it",
    ],
    approach: "I led with the visitor's situation rather than the service. The headline says the thing they are already thinking, the next section lists the seasons people come in, and only then does the coach introduce himself. The whole page narrows toward a single free consultation, with the booking calendar embedded so the decision and the action are on the same screen.",
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
    heroImage: "/hero-crt/with-little-daily.png",
    heroImageAlt: "With Little daily ledger dashboard showing planning, habits, must-dos, a thought journal, and scripture",
    screenshots: [
      {
        src: "/hero-crt/with-little-daily.png",
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

export function canVisitProject(project: Project) {
  return (
    (project.status === "LIVE" || project.status === "IN PILOT") &&
    Boolean(project.liveUrl)
  );
}

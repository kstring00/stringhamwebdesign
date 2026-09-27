/**
 * The work. Every card on /work and every frame in the homepage gallery
 * reads from this list. Images are real captures of the live sites, taken
 * with Playwright and stored under public/work/<slug>/.
 */
export type Project = {
  slug: string;
  name: string;
  category: string;
  line: string;
  href: string;
  /** Small label shown ahead of the line, e.g. to mark Kyle's own product. */
  note?: string;
  image: { src: string; width: number; height: number; alt: string };
};

export const projects: Project[] = [
  {
    slug: "common-ground",
    name: "Common Ground",
    category: "Behavioral health",
    line: "A parent navigation hub for autism families, now offered to clinics as a white-labeled Family Resource Hub.",
    href: "https://www.commongroundautism.org",
    image: { src: "/work/common-ground/home.webp", width: 1600, height: 882, alt: "The Common Ground homepage: \"Real autism support for real families,\" with a parent and child doing a puzzle and a Find My Next Step button" },
  },
  {
    slug: "bcba-prep",
    name: "BCBA Prep",
    category: "Education",
    line: "Exam-prep storefront with a member library.",
    href: "https://www.beethebehaviorbae.com/",
    image: { src: "/work/bcba-prep/home.webp", width: 1600, height: 2052, alt: "The BCBA Prep storefront, with the nine exam domains presented as a stacked library" },
  },
  {
    slug: "with-little",
    name: "With Little",
    category: "App",
    line: "A local-first journaling and life-planning app with optional cloud sync, built around faithfulness in small things.",
    href: "https://withlittle.app",
    note: "My own app.",
    image: { src: "/work/with-little/daily.webp", width: 1600, height: 882, alt: "The With Little daily ledger: planning, habits, must-dos, a thought journal and scripture on one screen" },
  },
];

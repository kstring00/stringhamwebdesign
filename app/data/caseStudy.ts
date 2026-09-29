import { site } from "./site";

/**
 * The homepage case study: Common Ground, the one project on the site.
 * Screens are real Playwright captures of the Common Ground site at 1440px
 * and 390px wide, stored as AVIF and WebP under public/common-ground/.
 */
export type Screen = { key: string; caption: string; alt: string };

export const caseStudy = {
  label: "Featured project",
  title: "Common Ground: a parent navigation hub for autism families.",
  problem: "The hardest hours for autism families happen between therapy sessions, when parents are on their own.",
  built: "A hub that asks one question, ‘What do you need today?’, and walks each parent to one clear next step.",
  outcome: "Also available to ABA and pediatric clinics as a white-labeled Family Resource Hub.",
  demoUrl: site.demoUrl,
  screens: [
    {
      key: "home",
      caption: "It opens on the family: free, no sign-up, one clear way in.",
      alt: "The Common Ground home screen: “Real autism support for real families,” a mother and son doing a puzzle, and a Find My Next Step button",
    },
    {
      key: "paths",
      caption: "One question, six paths. Every parent starts where they are.",
      alt: "The “What do you need today?” question with six paths: I need a next step, I need help at home, I feel overwhelmed, I want to understand ABA, I want to connect, and I need practical resources",
    },
    {
      key: "overwhelmed",
      caption: "A parent picks “I feel overwhelmed” and lands on one next step: breathe first.",
      alt: "The page a parent reaches after choosing “I feel overwhelmed”: “You are not alone in this moment,” with a guided breathing exercise to start",
    },
  ] as Screen[],
} as const;

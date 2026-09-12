/**
 * The site's navigation, in one place.
 *
 * The header and the footer each show a subset of the same list rather than
 * keeping two lists that drift. `inHeader` records the one real difference:
 * /work is a live page with four case studies, linked from the homepage hero
 * and from here, but deliberately not in the masthead yet — Kyle's call,
 * 2026-09-12. Flip the flag to put it back.
 */

export type NavItem = {
  label: string;
  href: string;
  inHeader: boolean;
};

export const siteNav: NavItem[] = [
  { label: "Home", href: "/", inHeader: true },
  { label: "About", href: "/about", inHeader: true },
  { label: "Work", href: "/work", inHeader: false },
  { label: "Pricing", href: "/pricing", inHeader: true },
];

export const headerNav = siteNav.filter((item) => item.inHeader);

/** The one dominant action sitewide. */
export const quoteLink = { label: "Start a project", href: "/quote" } as const;

export const portalLink = { label: "Client portal", href: "/portal" } as const;

/**
 * The public address. `CAPTURE_TO_EMAIL` overrides where inquiry mail is
 * delivered, but this is the one printed on the site.
 */
export const contactEmail = "kyle@stringhamwebdesign.com";

export const businessName = "Stringham Web Design";
export const personName = "Kyle Stringham";
export const discipline = "Web Design & Development";
export const locality = "League City, Texas";

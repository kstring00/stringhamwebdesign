/**
 * The site's navigation, in one place.
 *
 * The header and the footer show subsets of the same list rather than keeping
 * two lists that drift; `inHeader` is what separates them.
 *
 * "Portfolio" points at /work. The label was changed on 2026-09-12 and the
 * route deliberately was not: /work is linked from the homepage hero, from
 * four case-study pages and from anything already indexed, and renaming it
 * would break those for a word only the nav shows.
 */

export type NavItem = {
  label: string;
  href: string;
  inHeader: boolean;
};

export const siteNav: NavItem[] = [
  { label: "Home", href: "/", inHeader: true },
  { label: "About", href: "/about", inHeader: true },
  { label: "Portfolio", href: "/work", inHeader: true },
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

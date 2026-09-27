export type NavItem = { label: string; href: string };

/** The three pages, in order. The header and the footer both read this. */
export const nav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Family Resource Hub", href: "/family-resource-hub" },
  { label: "About", href: "/about" },
];

/** The one dominant action, on every page. */
export const cta = { label: "Start a project", href: "/contact" } as const;

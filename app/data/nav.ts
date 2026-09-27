export type NavItem = { label: string; href: string };

/** The four pages, in order. The header and the footer both read this. */
export const nav: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Family Resource Hub", href: "/family-resource-hub" },
  { label: "About", href: "/about" },
];

/** The one dominant action, on every page. */
export const cta = { label: "Start a project", href: "/contact" } as const;

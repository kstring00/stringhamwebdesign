export type NavItem = { label: string; href: string };

/** Services and About, in order. The header and the footer both read this. */
export const nav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];

/** The one dominant action, on every page. */
export const cta = { label: "Start a project", href: "/contact" } as const;

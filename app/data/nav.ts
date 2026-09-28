export type NavItem = { label: string; href: string };

/** The two worlds and About, in order. The header and the footer both read this. */
export const nav: NavItem[] = [
  { label: "Coffee Shops", href: "/coffee-shops" },
  { label: "Autism Clinics", href: "/autism-clinics" },
  { label: "About", href: "/about" },
];

/** The one dominant action, on every page. */
export const cta = { label: "Start a project", href: "/contact" } as const;

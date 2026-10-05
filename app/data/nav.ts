/** The one action on the site. It scrolls to the free check form. */
export const cta = { label: "Get a free check", href: "/#free-check" } as const;

/** Footer links. There is no top navigation: the header is the logo and the button. */
export const footerLinks = [
  { label: "Prices", href: "/#prices" },
  { label: "Questions", href: "/#questions" },
  { label: "Service Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

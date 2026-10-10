/** The business view's main action: the free Google check (the lowest-commitment yes). */
export const cta = { label: "Get a free Google check", href: "/#free-check" } as const;

/** The main action on /websites. */
export const quoteCta = { label: "Request a website quote", href: "/websites#website-quote" } as const;

/** The action on /partners. */
export const partnerCta = { label: "Explore a partnership", href: "/partners#partner-form" } as const;

/** The quiet entry point for creative and agency partners. */
export const partnersLink = { label: "For partners", href: "/partners" } as const;

/** Footer links. The header is the logo, one link and one button. */
export const footerLinks = [
  { label: "Free Google check", href: "/#free-check" },
  { label: "Websites", href: "/websites" },
  { label: "Prices", href: "/#prices" },
  { label: "Questions", href: "/#questions" },
  { label: "For creative & agency partners", href: "/partners" },
  { label: "Service Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

/** The header's links, in order. Anchors on the home page; absolute so they work from any page. */
export const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** The site's one action: a fixed quote, and a free demo of the homepage with it. */
export const cta = { label: "Get a quote + free demo", short: "Get a quote", href: "/#quote" } as const;

/** The action on /partners. */
export const partnerCta = { label: "Explore a partnership", short: "Partnership", href: "/partners#partner-form" } as const;

/** Footer links. */
export const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Free Google check", href: "/google-check" },
  { label: "Blog", href: "/blog" },
  { label: "Service Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

/** The partner side of the site, from the footer. */
export const partnerLinks = [
  { label: "How referrals work", href: "/partners#referrals" },
  { label: "For agencies & creatives", href: "/partners" },
] as const;

/** The header's links, in order. Anchors on the home page; absolute so they work from any page. */
export const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Free checkup", href: "/checkup" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** The site's one action: a free demo of the practice's homepage, with a fixed written quote. */
export const cta = { label: "Get a free homepage demo", short: "Free demo", href: "/#quote" } as const;

/** Footer links. */
export const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Free Google check", href: "/google-check" },
  { label: "Free Website Checkup", href: "/checkup" },
  { label: "Blog", href: "/blog" },
  { label: "Service Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

/**
 * The nav's items, in order. Each is a real link: four are pages, and
 * Pricing and About are sections of the home page (there is no /pricing or
 * /about page), absolute so they work from anywhere. `section` names the
 * home section an item stands for, so the nav can follow the scroll there.
 */
export const navLinks = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "pricing", label: "Pricing", href: "/#pricing", section: "pricing" },
  { key: "handoff", label: "Handoff", href: "/owner-handoff" },
  { key: "checkup", label: "Checkup", href: "/checkup" },
  { key: "about", label: "About", href: "/#about", section: "about" },
] as const;

/** The site's one action: a free demo of the practice's homepage, with a fixed written quote. */
export const cta = { label: "Get a free homepage demo", nav: "Get a free demo", short: "Free demo", href: "/#quote" } as const;

/** Footer links. Blog and FAQ live here now, not in the nav. */
export const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Handoff", href: "/owner-handoff" },
  { label: "Free Google check", href: "/google-check" },
  { label: "Free Website Checkup", href: "/checkup" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "Service Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

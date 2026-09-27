export type Service = { slug: string; name: string; line: string; body: string; href?: string; cta?: string };

export const services: Service[] = [
  {
    slug: "custom-websites",
    name: "Custom websites",
    line: "Designed from scratch around your business.",
    body: "Designed from scratch around your business, fast on phones, and built to be found on Google. No template with the name swapped out: the structure, the words and the details come from how you actually work.",
  },
  {
    slug: "redesigns",
    name: "Redesigns",
    line: "Keep what works, rebuild what doesn't.",
    body: "Keep what works, rebuild what doesn't. A redesign starts with what your current site already does well, then fixes the parts that cost you calls: speed, clarity, mobile, and the path to getting in touch.",
  },
  {
    slug: "family-resource-hub",
    name: "Family Resource Hub",
    line: "For ABA and pediatric clinics.",
    body: "A parent support hub on your clinic's website, under your name and colors, free to every family you serve. It walks each parent to one next step between sessions, so families stay from first call to first session.",
    href: "/family-resource-hub",
    cta: "About the hub",
  },
  {
    slug: "care-plans",
    name: "Care plans",
    line: "Hosting, updates, and small changes.",
    body: "Hosting, updates, and small changes after launch, quoted separately. Or I teach you to make edits yourself and you never need me again. Either way the site stays yours.",
  },
];

/** The three the homepage previews. */
export const previewServices = services.filter((s) => ["custom-websites", "redesigns", "family-resource-hub"].includes(s.slug));

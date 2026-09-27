/** Who and where. Read by the footer, the contact page, the metadata and the JSON-LD. */
export const site = {
  name: "Stringham Web Design",
  legalName: "Stringham Web Design LLC",
  person: "Kyle Stringham",
  credential: "Registered Behavior Technician (RBT)",
  city: "League City",
  region: "TX",
  regionLong: "Texas",
  email: "kyle@stringhamwebdesign.com",
  phone: "413-454-3509",
  phoneHref: "tel:+14134543509",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stringhamwebdesign.com").replace(/\/+$/, ""),
  demoUrl: "https://www.commongroundautism.org",
  year: 2026,
} as const;

export const locationLine = "Based in League City, Texas. Working with businesses everywhere.";

/** The one place the phone number lives. Swap it here and every link,
    label and piece of structured data follows. */
const PHONE = "413-454-3509";
const phoneDigits = PHONE.replace(/\D/g, "");

/** Who and where. Read by the footer, the contact page, the metadata and the JSON-LD. */
export const site = {
  name: "Stringham Web Design",
  legalName: "Stringham Web Design LLC",
  person: "Kyle Stringham",
  city: "League City",
  region: "TX",
  regionLong: "Texas",
  email: "kyle@stringhamwebdesign.com",
  phone: PHONE,
  phoneHref: `tel:+1${phoneDigits}`,
  phoneE164: `+1${phoneDigits}`,
  /** Scheduling link for the free 30-minute call. Unset means no booking
      buttons render anywhere; everything falls back to the contact form. */
  bookingUrl: (process.env.NEXT_PUBLIC_BOOKING_URL || "").trim(),
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stringhamwebdesign.com").replace(/\/+$/, ""),
  demoUrl: "https://www.commongroundautism.org",
  year: 2026,
} as const;

export const locationLine = "League City, Texas. Working with owners across Texas and beyond.";

/** The studio line: eyebrow, meta and footer. */
export const studioLine = "Stringham Web Design LLC · League City, Texas";

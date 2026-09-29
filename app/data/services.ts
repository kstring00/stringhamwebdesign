/**
 * The six things every idea needs. The homepage lists them; /services
 * expands each into its own section. `slug` is the anchor on /services and
 * the key of its sketch-to-real illustration (app/motifs/Illustrations.tsx).
 */
export type Service = { slug: string; n: string; title: string; short: string; long: string };

export const services: Service[] = [
  {
    slug: "website",
    n: "01",
    title: "A website that feels like you.",
    short: "Designed from scratch, fast on phones, and yours to keep.",
    long: "No template, no theme. I design it around what you do and how people find you, build it to load fast on a phone in a parking lot, and hand you the keys. It is yours: the code, the domain, the accounts.",
  },
  {
    slug: "get-paid",
    n: "02",
    title: "Get paid.",
    short: "Online ordering, booking, and payments that connect to the tools you already use, like Clover, Toast, Square, or Stripe.",
    long: "Order-ahead, table booking, deposits, class sign-ups, invoices. Whatever you sell, people can pay for it from their phone, and it lands in the point-of-sale or payment tool you already run. The site never touches a card on its own.",
  },
  {
    slug: "get-found",
    n: "03",
    title: "Get found.",
    short: "Google Business Profile, search basics, and the right hours and locations everywhere.",
    long: "Most first visits start with a search. I set up your Google Business Profile, get the hours, address, and photos right in every place they appear, and build the pages so search engines understand what you offer and where.",
  },
  {
    slug: "keep-them-coming-back",
    n: "04",
    title: "Keep them coming back.",
    short: "An email and text list, events, and updates, so first-timers become regulars.",
    long: "A list people actually want to be on, a simple way to announce an event or a seasonal drop, and updates you can send yourself. The second visit is where a business is made.",
  },
  {
    slug: "look-the-part",
    n: "05",
    title: "Look the part.",
    short: "Brand basics: colors, type, and a clean logo lockup so everything matches.",
    long: "Not a rebrand: the essentials. A small set of colors, a type pairing, and a logo lockup that works on a sign, a cup, a menu, and a phone screen, so everything you put out looks like it came from the same place.",
  },
  {
    slug: "never-deal-with-the-tech",
    n: "06",
    title: "Never deal with the tech.",
    short: "An optional care plan for hosting, updates, and changes.",
    long: "If you would rather never think about hosting, renewals, updates, or the small changes that come up, an optional care plan covers it. If you would rather do it yourself, I will teach you how before handoff.",
  },
];

/** The hero's rotating word. The first is what reduced motion shows. */
export const ideas = ["idea", "café", "clinic", "side hustle", "shop", "dream"] as const;

/** The marquee. */
export const audiences = ["Cafés", "Clinics", "Coaches", "Creators", "Local shops", "First-time founders", "Nonprofits"] as const;

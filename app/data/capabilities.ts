/**
 * The "under the hood" panels that open inside the binder.
 *
 * These used to live on a loose sheet below the binder, where they were easy
 * to scroll past without ever knowing they existed. They now open over the
 * top of the rendered site, so the systems behind a build are one click from
 * the work itself.
 *
 * The SYSTEMS panel is per-project and reads from each project's own feature
 * list. The other two are global: they describe what can be built, not what a
 * particular client bought.
 */

export type CapabilityCard = {
  label: string;
  detail: string;
  /** Decorative. Paired with a real text label, so it is aria-hidden. */
  glyph: string;
};

export type CapabilityPanel = {
  id: string;
  /** The tab label along the top of the binder. */
  tab: string;
  /** Panel heading once open. */
  title: string;
  /** One line under the heading. */
  intro: string;
  /**
   * When true the cards come from the active project rather than this file,
   * so the panel always describes the build you are looking at.
   */
  fromProject?: boolean;
  cards?: CapabilityCard[];
};

export const capabilityPanels: CapabilityPanel[] = [
  {
    id: "systems",
    tab: "Systems",
    title: "Everything this site can do behind the scenes.",
    intro:
      "The visible website is one layer. These are the systems that make it useful after someone lands on it.",
    fromProject: true,
  },
  {
    id: "ai",
    tab: "AI built in",
    title: "AI that does a job, not a demo.",
    intro:
      "Scoped to your content and your workflow. Every one of these is something a person on your team would otherwise do by hand.",
    cards: [
      {
        label: "Intake that thinks",
        detail: "Asks the follow-up questions a static form can't",
        glyph: "✦",
      },
      {
        label: "Drafting help",
        detail: "First-pass copy and summaries in your voice",
        glyph: "✎",
      },
      {
        label: "Answer search",
        detail: "Visitors find the right page instead of the menu",
        glyph: "⌕",
      },
      {
        label: "Triage and routing",
        detail: "The right enquiry reaches the right person",
        glyph: "⇄",
      },
      {
        label: "Document reading",
        detail: "Long intake forms condensed for your team",
        glyph: "▤",
      },
      {
        label: "Guardrails",
        detail: "Grounded in your content, not the open web",
        glyph: "⛉",
      },
    ],
  },
  {
    id: "integrations",
    tab: "Integrations",
    title: "The stack I wire up, set up, and hand over.",
    intro:
      "Configured properly, connected to each other, and transferred to your accounts at handoff. No rented logins.",
    cards: [
      {
        label: "Stripe",
        detail: "Invoices, deposits, and monthly care plans",
        glyph: "▣",
      },
      {
        label: "Supabase",
        detail: "Database, authentication, and secure file storage",
        glyph: "▦",
      },
      {
        label: "Resend",
        detail: "Transactional email that reliably lands",
        glyph: "✉",
      },
      {
        label: "Cal.com",
        detail: "Booking embedded, not bolted on",
        glyph: "◷",
      },
      {
        label: "Clarity & Analytics",
        detail: "Heatmaps, session replay, and real numbers",
        glyph: "⌁",
      },
      {
        label: "Automation",
        detail: "Zapier or Make for the handoffs between tools",
        glyph: "⚙",
      },
    ],
  },
];

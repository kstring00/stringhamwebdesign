/** The Family Resource Hub landing page, in one place. */
export const hub = {
  h1: "Families stay where they feel cared for.",
  sub: "A parent support hub on your clinic's website, under your name and colors, free to every family you serve.",
  problem: {
    title: "The hardest hours happen between sessions.",
    body: "Research shows high parenting stress weakens the gains of early intervention (Osborne et al., 2008). The hub meets parents in those hours, with one clear next step.",
  },
  paths: [
    "I need a next step",
    "I need help at home",
    "I feel overwhelmed",
    "I want to understand ABA",
    "I want to connect",
    "I need practical resources",
  ],
  gets: [
    { title: "Parent training that continues at home", body: "ABC data explained in plain English, printable tools, and pages your BCBAs, SLPs, and OTs can send after sessions." },
    { title: "Families who stay", body: "From first call to first session." },
    { title: "Word of mouth", body: "From parents who feel supported." },
  ],
  launch: [
    { title: "One link", body: "Your web person adds one \"Family Support\" link." },
    { title: "Your brand", body: "I brand it with your logo, colors, locations, and contact buttons. It's live in about 3 weeks." },
    { title: "A QR card", body: "You hand families a QR card at the front desk." },
  ],
  trust: "Educational only. Collects no child information.",
  offer: "60-day trial available.",
  rbt: "As an RBT, I've watched parents carry the home program alone. I built this for them.",
} as const;

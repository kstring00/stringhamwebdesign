/**
 * The referral reward, in one place. Kyle's offer: 20% of the website's total
 * price to whoever recommends the business. /partners, /websites, the home
 * page and the Service Terms all read from here, so change it here only (and
 * update content/service-terms.md, section "Referrals", to match).
 */
export const REFERRAL_RATE = 0.2;

export const referral = {
  /** The rate as a whole number, for display (20). */
  rate: Math.round(REFERRAL_RATE * 100),
  percent: `${Math.round(REFERRAL_RATE * 100)}%`,
  /** How the reward is worked out, in one line. No dollar examples: every site is quoted separately. */
  how: `You earn ${Math.round(REFERRAL_RATE * 100)}% of the build price in your client’s written quote.`,
  /** The rules, in plain words. Kept short; the Service Terms say the same. */
  rules: [
    `You get ${Math.round(REFERRAL_RATE * 100)}% of the website build price, as written in your client’s quote.`,
    "It’s paid within 14 days after the business has paid for its website in full.",
    "Get your own link and share the free Website Checkup. Your link credits you for 90 days. Or just introduce us by email.",
    "Whenever you share, say that you earn a referral fee.",
    "Fees for the Listing Fix (the Google listing cleanup) and Website Care (hosting and upkeep) don’t count toward it.",
    "The business is told about the reward, and it never changes their price.",
  ],
} as const;

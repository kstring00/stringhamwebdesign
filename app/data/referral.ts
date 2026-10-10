import { PRICES } from "./offer";

/**
 * The referral reward, in one place. Kyle's offer: 20% of the website's total
 * price to whoever recommends the business. /partners, /websites, the home
 * page and the Service Terms all read from here, so change it here only (and
 * update content/service-terms.md, section "Referrals", to match).
 */
export const REFERRAL_RATE = 0.2;

const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const referral = {
  /** The rate as a whole number, for display (20). */
  rate: Math.round(REFERRAL_RATE * 100),
  percent: `${Math.round(REFERRAL_RATE * 100)}%`,
  /** A worked example at the starting price. */
  example: { price: money(PRICES.website), reward: money(PRICES.website * REFERRAL_RATE) },
  /** The rules, in plain words. Kept short; the Service Terms say the same. */
  rules: [
    `You get ${Math.round(REFERRAL_RATE * 100)}% of the website’s total price, as written in your client’s quote.`,
    "It’s paid once the business has paid for its website in full.",
    "Anyone can refer. You don’t need to be a partner or sign up first.",
    "Make sure I know it came from you: introduce us by email, or have them put your name in the form.",
    `Fees for the Listing Fix (the $${PRICES.listingFix} Google listing cleanup) and Website Care ($${PRICES.care} a month of hosting and upkeep) don’t count toward it.`,
    "The business is told about the reward, and it never changes their price.",
  ],
} as const;

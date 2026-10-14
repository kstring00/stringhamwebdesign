/**
 * What each post has beyond its markdown: the order it was published in
 * (posts from the same day sort by this, newest first), its cover art, the
 * chip on its closing card, the title of its side list of sections, any
 * posts it points to first under "Related posts", and a demo to show in
 * its closing card. A post without an entry gets the defaults.
 */
export type CoverMotif = "keys" | "checklist" | "domain" | "growth" | "convert" | "plain";

export type PostExtras = {
  seq: number;
  cover: CoverMotif;
  chip: string;
  tocTitle: string;
  related?: string[];
  /** A project from app/data/work.ts (by key) to show in the closing card. */
  demo?: string;
};

const DEFAULTS: PostExtras = { seq: 0, cover: "plain", chip: "Quote + free demo", tocTitle: "In this post" };

const EXTRAS: Record<string, Partial<PostExtras>> = {
  "my-web-designer-disappeared": { seq: 1, cover: "keys", chip: "Free look at your situation", tocTitle: "The steps", related: ["what-i-need-to-build-your-website"] },
  "what-i-need-to-build-your-website": { seq: 2, cover: "checklist", tocTitle: "What to gather", related: ["how-to-buy-your-own-domain"] },
  "how-to-buy-your-own-domain": { seq: 3, cover: "domain", tocTitle: "The steps", related: ["what-i-need-to-build-your-website"] },
  "do-i-need-a-website-if-business-is-good": { seq: 4, cover: "growth", tocTitle: "In this post", related: ["how-i-turn-visitors-into-customers"] },
  "how-i-turn-visitors-into-customers": {
    seq: 5,
    cover: "convert",
    tocTitle: "The process",
    related: ["do-i-need-a-website-if-business-is-good"],
    demo: "lake-city-storage",
  },
};

export function postExtras(slug: string): PostExtras {
  return { ...DEFAULTS, ...EXTRAS[slug] };
}

/**
 * "Why not a template?": the section directly under the home hero.
 *
 * DRAFT COPY, WRITTEN FOR THE OWNER'S REVIEW. Nothing here is approved yet.
 *
 * The rules it is written to: fair to Squarespace and WordPress (what they
 * do well comes first, and nothing false is said about either), no speed or
 * search-ranking claims, no numbers that aren't this studio's own prices
 * and timeline, no testimonials. The footnote is the honest limit of the
 * custom route, marked with the amber asterisk.
 */
export const template = {
  title: "Why not a template?",
  lede: "A fair question. Templates are good at what they are for.",
  points: [
    {
      label: "What they do well",
      title: "Cheap, and fast to start.",
      body: "Squarespace and WordPress let you pick a theme, add your words and be online in a weekend, for a small monthly fee. If your practice simply needs to exist online, that is a sound choice.",
    },
    {
      label: "Where they stop",
      title: "A theme is a layout many sites share.",
      body: "You choose from the sections it offers and arrange them, so your site keeps the shape of the others built on it. Motion and interaction go as far as the theme and its add-ons allow.",
    },
    {
      label: "What a custom build adds",
      title: "A site designed around one practice: yours.",
      body: "Every section is drawn for your services, your people and the way you would say it in the room. The layout, the motion and the interaction are built for the page, like the one you are reading. And it is yours: the code, the domain and the accounts are in your name.",
      mark: true,
    },
  ],
  /** The honest limit of the custom route. */
  footnote: "A custom site costs more to start and takes about three weeks. If you need to be online this weekend, a template is the right call.",
} as const;

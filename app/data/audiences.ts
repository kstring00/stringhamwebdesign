/**
 * Who the work is for.
 *
 * A scanning section, not a reading one: a visitor should find themselves in
 * it or rule themselves out in a couple of seconds, so each entry is a label
 * and one line and nothing else.
 */

export type Audience = { label: string; line: string };

export const audiences: Audience[] = [
  {
    label: "Storage facilities",
    line: "Unit discovery and conversion, built for how people actually search.",
  },
  {
    label: "ABA and counseling practices",
    line: "Clear, calm sites that help families find the right next step.",
  },
  {
    label: "Coaches",
    line: "Booking, credibility, and a site that does the selling between calls.",
  },
  {
    label: "Course creators",
    line: "A storefront and member experience that holds together as you grow.",
  },
];

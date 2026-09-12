/**
 * Client testimonials.
 *
 * Empty on purpose. /pricing promises one from every client at launch, and
 * the first has not landed yet. The homepage section renders nothing at all
 * while this array is empty — no placeholder, no empty frame — so adding the
 * first quote here is the only step needed to make it appear.
 */

export type Testimonial = {
  quote: string;
  name: string;
  business: string;
};

export const testimonials: Testimonial[] = [];

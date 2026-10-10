import s from "./home.module.css";

export type Testimonial = { quote: string; name: string; business: string };

/**
 * Client testimonials. Not on the page yet: there are none with written
 * permission, and nothing here is ever invented. When there are, add them
 * in app/page.tsx (the commented-out <Testimonials items={[…]} /> under
 * Pricing) and this renders them. With an empty list it renders nothing.
 */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className={s.section} id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className={s.head}>
          <h2 id="testimonials-title" className={s.h2} data-reveal>What owners say</h2>
        </div>
        <ul className={s.testimonials}>
          {items.map((t) => (
            <li key={t.name + t.business}>
              <blockquote>
                <p>&ldquo;{t.quote}&rdquo;</p>
                <footer>{t.name}, {t.business}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

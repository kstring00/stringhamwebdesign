import { cta } from "../data/nav";
import HeroVideo from "./HeroVideo";
import s from "./hero.module.css";

/**
 * The home page's first screen: one panel, inset from the page edge, with a
 * slow looping scene behind the studio's name and the one argument the
 * site makes: a practice shouldn't look like every other practice.
 *
 * - The still (hero-plate) is a real image, in the HTML, preloaded in a
 *   modern format: it is the largest thing on first paint, and it is all a
 *   visitor needs. Phones get just the strip of it a narrow hero can show.
 * - The video (HeroVideo.tsx) fades in over the still once it is playing.
 *   It is decoration: hidden from screen readers, never loaded with reduced
 *   motion or data saver on, paused out of view, with a pause button.
 * - Every word is HTML and none of it waits on the video or on JavaScript.
 *   The name is the brand, not the page's heading; the h1 is the two lines
 *   on the right.
 * - On load the name, "Web Design" and the right block rise 28px and fade
 *   in, in that order (plain CSS; still under reduced motion).
 * The nav at the top of the panel is the site header (SiteHeader.tsx).
 */
export default function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title" data-hero>
      {/* The still is the largest paint: fetched first, in the best format the browser takes. */}
      <link rel="preload" as="image" href="/hero/hero-plate-tall.avif" type="image/avif" media="(max-width: 700px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/hero/hero-plate.avif" type="image/avif" media="(min-width: 701px)" fetchPriority="high" />

      <div className={s.panel}>
        <picture>
          <source media="(max-width: 700px)" type="image/avif" srcSet="/hero/hero-plate-tall.avif" />
          <source media="(max-width: 700px)" type="image/webp" srcSet="/hero/hero-plate-tall.webp" />
          <source media="(max-width: 700px)" srcSet="/hero/hero-plate-tall.jpg" />
          <source type="image/avif" srcSet="/hero/hero-plate.avif" />
          <source type="image/webp" srcSet="/hero/hero-plate.webp" />
          <img className={s.media} src="/hero/hero-plate.jpg" alt="" width={1620} height={819} fetchPriority="high" loading="eager" decoding="sync" data-hero-still />
        </picture>
        <HeroVideo />
        <div className={s.shade} aria-hidden="true" />

        <div className={s.content}>
          <div className={s.brand}>
            <p className={s.wordmark}>Stringham<span className={s.star} aria-hidden="true">*</span></p>
            <p className={s.sub}>Web Design</p>
          </div>

          <div className={s.side}>
            <p className={s.eyebrow}><span aria-hidden="true">* </span>Not a template</p>
            <h1 id="hero-title" className={s.h1}>
              <span className={s.h1Big}>Why blend in?</span>{" "}
              <span className={s.h1Small}>Custom websites for therapists and mental health practices.</span>
            </h1>
            <p className={s.body}>Squarespace and WordPress are the safe choice, and every practice down the street made it. I build sites no template can copy.</p>
            <div className={s.actions}>
              <a className={s.button} href={cta.href.replace("/", "")} data-track="cta" data-location="hero" data-hero-cta>
                {cta.nav}
                <span className={s.circle} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h10M10 5l4 4-4 4" /></svg>
                </span>
              </a>
              <a className={s.workLink} href="/work" data-track="cta" data-location="hero-work">See the work</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { work } from "../data/work";
import BuildFieldMount from "./BuildFieldMount";
import HeroFrames from "./HeroFrames";
import HeroWall from "./HeroWall";
import s from "./home.module.css";

/** The dots near the cursor shift to this, a soft violet, so the field answers the pointer. */
const CURSOR_DOT = "#8E86EC";

/**
 * The first screen: what, for whom, and the one next step (a free homepage
 * demo), in five seconds. The words are Kyle's own; don't paraphrase them. Left, the words; right, the work wall: the real projects as
 * small browser and phone frames drifting in a slow loop (or, with fewer
 * than three projects to show, the three stacked frames). Behind it, the
 * Build Field (dots that clear around the text and answer the cursor).
 * The headline's lines rise in behind a mask on load
 * (CSS, 0.6 s, none under reduced motion); the words are in the HTML the
 * whole time, so nothing waits on JavaScript.
 */
export default function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <BuildFieldMount activeColor={CURSOR_DOT} />
      <div className={`container ${s.heroGrid}`}>
        <div className={s.heroText} data-field-clear>
          <p className={s.chip}>Custom web design for mental health professionals</p>
          <h1 id="hero-title" className={s.h1}>
            <span className={s.line}><span>Websites for the</span></span>
            <span className={s.line}><span>people who help people.</span></span>
          </h1>
          <p className={`${s.sub} ${s.subLead}`}>Your work changes lives. Your website should reflect that.</p>
          <p className={s.sub}>Thoughtfully designed, custom-built websites for therapists, counselors, and mental-health practices.</p>
          <p className={s.sub}>I combine a background in psychology and behavioral healthcare with modern web design to create websites that help people understand your services, feel comfortable reaching out, and take the next step toward care.</p>
          <div className={s.actions}>
            <a className="btn" href="#quote" data-track="cta" data-location="hero" data-hero-cta data-magnetic>
              Get a free homepage demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <a className={`u ${s.textLink}`} href="/work" data-track="cta" data-location="hero-work">Or explore my work</a>
          </div>
          <p className={s.trust}>
            <span>Custom-designed for your practice</span>
            <span>Clear, upfront pricing</span>
            <span>Built with your clients in mind</span>
          </p>
        </div>
        {work.length >= 3
          ? <HeroWall work={work} />
          : <HeroFrames items={work.map((w) => ({ key: w.key, name: w.name, alt: w.alt.desktop }))} />}
      </div>
    </section>
  );
}

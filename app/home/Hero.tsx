import { heroWallWork, homeWork } from "../data/work";
import BuildFieldMount from "./BuildFieldMount";
import HeroFrames from "./HeroFrames";
import HeroWall from "./HeroWall";
import s from "./home.module.css";

/** The dots near the cursor shift to this, a soft violet, so the field answers the pointer. */
const CURSOR_DOT = "#8E86EC";

/**
 * The first screen: what, for whom, where, and the one next step, in five
 * seconds. Left, the words; right, the work wall: the real projects as
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
          <p className={s.chip}>Custom websites · Built in Texas, for businesses anywhere</p>
          <h1 id="hero-title" className={s.h1}>
            <span className={s.line}><span>Websites that get</span></span>
            <span className={s.line}><span>businesses more calls.</span></span>
          </h1>
          <p className={s.sub}>
            I design, build and run custom websites for owner-run businesses. Ask for a quote and I&rsquo;ll build you a free demo of your homepage to go with it, so you see your new site before you spend a dollar.
          </p>
          <div className={s.actions}>
            <a className="btn" href="#quote" data-track="cta" data-location="hero" data-hero-cta data-magnetic>
              Get a quote + free demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <a className={`u ${s.textLink}`} href="/checkup" data-track="cta" data-location="hero-checkup">Or get a free website checkup</a>
          </div>
          <p className={s.trust}>
            <span>Free demo with every quote</span>
            <span>Fixed written price</span>
            <span>You own your domain</span>
          </p>
        </div>
        {heroWallWork.length >= 3
          ? <HeroWall work={heroWallWork} />
          : <HeroFrames items={homeWork.map((w) => ({ key: w.key, name: w.name, alt: w.alt.desktop }))} />}
      </div>
    </section>
  );
}

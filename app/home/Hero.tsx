import { HERO_PATH } from "./heroPath";
import s from "./hero.module.css";

/** The two cloud outlines, each one flat fill. */
const CLOUD = {
  A: { viewBox: "0 0 210 100", shapes: <><circle cx="60" cy="62" r="30" /><circle cx="105" cy="45" r="40" /><circle cx="150" cy="62" r="28" /><rect x="30" y="62" width="150" height="30" rx="15" /></> },
  B: { viewBox: "0 0 220 100", shapes: <><circle cx="50" cy="66" r="24" /><circle cx="88" cy="50" r="34" /><circle cx="132" cy="44" r="38" /><circle cx="170" cy="64" r="26" /><rect x="26" y="64" width="170" height="26" rx="13" /></> },
} as const;

/**
 * The five clouds: shape, color, where each sits at load (top in px, left
 * as a share of the screen), its width, and how long one crossing takes.
 * `at` is how far through its crossing a cloud is when the page loads, so
 * that it starts at `left` on a 1440px screen: (left x 1440 + width) /
 * (1440 + width). The same number sets the negative delay.
 */
const CLOUDS = [
  { shape: "A", color: "var(--cloud-blue)", top: 64, left: 6, width: 300, seconds: 110, at: 0.2221 },
  { shape: "B", color: "var(--cloud-mint)", top: 190, left: 58, width: 420, seconds: 140, at: 0.6748 },
  { shape: "A", color: "var(--cloud-blue)", top: 400, left: 30, width: 240, seconds: 95, at: 0.4 },
  { shape: "B", color: "var(--cloud-blue)", top: 880, left: 72, width: 360, seconds: 125, at: 0.776 },
  { shape: "A", color: "var(--cloud-mint)", top: 960, left: 18, width: 220, seconds: 85, at: 0.2887 },
] as const;

function Check() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" /></svg>;
}

/**
 * The home page's first screen, on white: the eyebrow, the headline, the
 * story panel (a tangled line that unravels into one calm, straight line,
 * with three captions under it), then Kyle's words beside the one action,
 * a free homepage demo. The site header sits over the top of it, with no
 * bar of its own (Header.tsx, its "plain" state).
 *
 * Three things move, in plain CSS, and nothing else: the line draws in
 * once on load, the dot at its end breathes, and five clouds drift across
 * behind everything. With reduced motion the line is simply drawn, the dot
 * is still and the clouds stay where they start. Every word is HTML and
 * none of it waits on JavaScript; the words are Kyle's own.
 */
export default function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={s.clouds} aria-hidden="true">
        {CLOUDS.map((c, i) => (
          <svg
            key={i}
            className={s.cloud}
            data-cloud={i + 1}
            viewBox={CLOUD[c.shape].viewBox}
            fill={c.color}
            style={{ "--top": `${c.top}px`, "--l": c.left, "--w": `${c.width}px`, "--dur": `${c.seconds}s`, "--delay": `${(-c.seconds * c.at).toFixed(1)}s` } as React.CSSProperties}
          >
            {CLOUD[c.shape].shapes}
          </svg>
        ))}
      </div>

      <div className={s.inner}>
        {/* Room for the site header, which overlays this strip. */}
        <div className={s.headerSpace} aria-hidden="true" />

        <p className={s.eyebrow}><span className={s.eyebrowDot} aria-hidden="true" />Custom web design for mental health professionals</p>

        <h1 id="hero-title" className={s.h1}>Websites for the people who <em>help people.</em></h1>

        <div className={s.panel}>
          <svg className={s.story} viewBox="0 0 1200 140" role="img" aria-label="A tangled line that unravels into one calm, straight line">
            <defs>
              <linearGradient id="hero-line" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="1160" y2="0">
                <stop offset="0" stopColor="#0B2A20" />
                <stop offset="0.4" stopColor="#0E6B4E" />
                <stop offset="0.72" stopColor="#2450B8" />
                <stop offset="1" stopColor="#2450B8" />
              </linearGradient>
            </defs>
            <path className={s.line} d={HERO_PATH} fill="none" stroke="url(#hero-line)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle className={s.breath} cx="1166" cy="70" r="7" fill="#2450B8" />
            <circle cx="1166" cy="70" r="7" fill="#2450B8" />
          </svg>
          <ol className={s.captions}>
            <li><span className={s.num}>01</span>They arrive overwhelmed.</li>
            <li><span className={s.num}>02</span>Your site makes it clear.</li>
            <li><span className={`${s.num} ${s.numLast}`}>03</span>They reach out.</li>
          </ol>
        </div>

        <div className={s.bottom}>
          <div className={s.words}>
            <p className={s.lead}>Your work changes lives. Your website should reflect that.</p>
            <p className={s.body}>I combine a background in psychology and behavioral healthcare with modern web design, so your website helps people understand your services, feel comfortable reaching out, and take the next step toward care.</p>
          </div>
          <div className={s.action}>
            <a className={s.button} href="#quote" data-track="cta" data-location="hero" data-hero-cta>
              Get a free homepage demo
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <a className={s.workLink} href="/work" data-track="cta" data-location="hero-work">Or explore my work</a>
            <ul className={s.checks}>
              <li><Check />Custom-designed for your practice</li>
              <li><Check />Clear, upfront pricing</li>
              <li><Check />Built with your clients in mind</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

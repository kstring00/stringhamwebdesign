import { kindLabel, work } from "../data/work";
import s from "./hero.module.css";

/**
 * Directly under the hero: the real projects as a still row of three cards.
 * Each is its desktop capture, its name, the badge for what it is ("Live")
 * and the line saying whose it is, and links to its write-up on /work.
 * Nothing moves; the full write-ups are on /work.
 */
export default function WorkRow() {
  return (
    <section className={s.work} id="work" aria-labelledby="work-title">
      <div className={s.workInner}>
        <div className={s.workHead}>
          <h2 id="work-title" className={s.workTitle}>Selected work</h2>
          <a className={s.workAll} href="/work">Read the full write-ups</a>
        </div>
        <ul className={s.cards}>
          {work.map((w) => (
            <li key={w.key}>
              <a className={s.card} href={`/work#${w.key}`} data-track="cta" data-location="home-work" data-project={w.key}>
                <span className={s.shot}>
                  <picture>
                    <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
                    <img src={`/showcase/${w.key}-desktop.webp`} alt={w.alt} width={1440} height={900} loading="lazy" decoding="async" />
                  </picture>
                </span>
                <span className={s.meta}>
                  <span className={s.name}>{w.name}</span>
                  <span className={s.badge}>{kindLabel[w.kind].label}</span>
                </span>
                <span className={s.stage}>{w.stage}<span className="sr-only">. See it on the work page.</span></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { allWork, kindLabel, type WorkKind } from "../data/work";
import home from "../home/home.module.css";
import styles from "./work.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Web Design Work & Demos, League City, TX | Stringham Web Design",
  description: "Websites built by Stringham Web Design in League City, Texas: a live product, design demos you can click through, and work in progress, each labeled for exactly what it is.",
  path: "/work",
});

/** The labels present on the page, for the legend. */
const legendKinds = [...new Set(allWork.map((w) => w.kind))] as WorkKind[];

/**
 * The full portfolio: every project with its write-up, labeled for what
 * it is. Pricing, the founder and the questions live on the home page;
 * this page links to them instead of repeating them.
 */
export default function WorkPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="work-title">
        <div className="container">
          <p className={home.chip}>Work</p>
          <h1 id="work-title" className={styles.h1}>Work you can click through.</h1>
          <p className={home.lede}>Every project labeled for exactly what it is: a live product, a design demo, a work in progress or a concept. Nothing here is padded, and nothing claims a result.</p>
          <div className={home.actions}>
            <a className="btn" href="/#quote" data-track="cta" data-location="work-hero" data-magnetic>Get a quote + free demo</a>
            <a className={`u ${home.textLink}`} href="/#pricing">See pricing</a>
          </div>
          {legendKinds.length > 1 ? (
            <dl className={styles.legend} aria-label="What each label means">
              {legendKinds.map((k) => (
                <div key={k}>
                  <dt><span className={`${styles.kind} ${styles[`kind_${k.replace("-", "_")}`] ?? ""}`}>{kindLabel[k].label}</span></dt>
                  <dd>{kindLabel[k].means}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <section className={`${home.section} ${home.alt}`} aria-label="Projects">
        <div className="container">
          <ol className={styles.list}>
            {allWork.map((w, i) => {
              const href = w.liveUrl ?? w.previewUrl;
              const draft = !w.confirmed;
              return (
                <li key={w.key} className={styles.project} id={w.key}>
                  <div className={styles.shot}>
                    <div className={home.chrome}><i /><i /><i /><span>{href ? new URL(href).host : w.name}</span></div>
                    <picture>
                      <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
                      <img src={`/showcase/${w.key}-desktop.webp`} alt={w.alt.desktop} width={1440} height={900} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                    </picture>
                  </div>
                  <div className={styles.text}>
                    <p className={styles.meta}>
                      <span className={`${styles.kind} ${styles[`kind_${w.kind.replace("-", "_")}`] ?? ""}`}>{kindLabel[w.kind].label}</span>
                      <span>{w.stage}</span>
                      {draft ? <span className={styles.draft}>Draft · preview only</span> : null}
                    </p>
                    <h2 className={styles.name}>{w.name}</h2>
                    {w.type ? <p className={styles.type}>{w.type}</p> : null}
                    <p className={styles.what}>{w.what}</p>
                    {w.builtFor ? <p className={styles.builtFor}><b>Built for one action:</b> {w.builtFor}</p> : null}
                    <ul className={styles.built}>{w.built.map((b) => <li key={b}>{b}</li>)}</ul>
                    {href ? (
                      <a className={home.demoLink} href={href} target="_blank" rel="noopener noreferrer" data-track="demo" data-project={w.name}>
                        {w.liveUrl ? "Visit the live site" : w.kind === "archived" ? "View the archived demo" : "View the demo"}<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className={home.section} aria-labelledby="work-cta-title">
        <div className={`container ${styles.cta}`}>
          <h2 id="work-cta-title" className={home.h2}>Want one of these for your business?</h2>
          <p className={home.lede}>Ask for a quote and I&rsquo;ll build a free demo of your homepage to go with it, so you see your site before you spend a dollar.</p>
          <div className={home.actions}>
            <a className="btn" href="/#quote" data-track="cta" data-location="work-end" data-magnetic>Get a quote + free demo</a>
            <a className={`u ${home.textLink}`} href="/#pricing">What it costs</a>
          </div>
        </div>
      </section>
    </>
  );
}

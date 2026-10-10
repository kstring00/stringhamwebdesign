import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { findings, listingFix, listingQuestions, listingSteps, noGuarantee } from "../data/offer";
import { site } from "../data/site";
import FreeCheckForm from "../home/FreeCheckForm";
import home from "../home/home.module.css";
import styles from "./google.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Free Google Listing Check, League City, TX | Stringham Web Design",
  description: "A free check of how your business shows up on Google and the directories, texted to you within 24 hours. Then a $150 Listing Fix, done in 7 days with before-and-after screenshots. League City, Texas.",
  path: "/google-check",
});

/**
 * The page Kyle texts to prospects: the free Google check, what he's found
 * on real listings, the three steps, the $150 Listing Fix, and the form.
 */
export default async function GoogleCheckPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      <section className={styles.hero} aria-labelledby="check-title">
        <div className="container">
          <p className={home.chip}>Free Google check · League City, Texas</p>
          <h1 id="check-title" className={styles.h1}>Is your Google listing costing you calls?</h1>
          <p className={home.lede}>I look up your business the way your customers do, then text or email you what I find within 24 hours. Free, no obligation, and yours to keep whatever you decide.</p>
          <div className={home.actions}>
            <a className="btn" href="#free-check" data-track="cta" data-location="check-hero" data-hero-cta data-magnetic>Get my free check</a>
            <a className={`u ${home.textLink}`} href={site.smsHref}>Or text me your business name</a>
          </div>
        </div>
      </section>

      <section className={`${home.section} ${home.alt}`} id="free-check" aria-labelledby="form-title">
        <div className="container">
          <div className={styles.findingsBox}>
            <p className={styles.findingsTitle}>What I&rsquo;ve found on real local listings, names left out:</p>
            <ul className={styles.findings}>
              {findings.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
          <div className={styles.grid}>
            <div className={styles.side}>
              <h2 id="form-title" className={home.h2}>How it works</h2>
              <ol className={styles.steps}>
                {listingSteps.map((s) => (
                  <li key={s.n}>
                    <span aria-hidden="true">{s.n}</span>
                    <div><b>{s.title}</b> {s.body}{"yours" in s ? <> <em>{s.yours}</em></> : null}</div>
                  </li>
                ))}
              </ol>
              <article className={styles.card} aria-labelledby="fix-title">
                <h3 id="fix-title" className={styles.cardName}>Listing Fix</h3>
                <p className={styles.price}><b>{listingFix.price}</b> <span>one-time · done within 7 days</span></p>
                <ul className={home.planLines}>{listingFix.included.map((l) => <li key={l}>{l}</li>)}</ul>
                <p className={styles.notIncluded}><b>Not included:</b> {listingFix.notIncluded}</p>
                <ul className={styles.notes}>{listingFix.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                <p><a className={`u ${home.inlineLink}`} href={`/terms${listingFix.terms}`}>Terms for the Listing Fix</a></p>
              </article>
              <p className={styles.fineNote}>{noGuarantee}</p>
            </div>
            <FreeCheckForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
          </div>
        </div>
      </section>

      <section className={home.section} id="questions" aria-labelledby="q-title">
        <div className={`container ${home.aboutGrid}`}>
          <div className={home.about}>
            <h2 id="q-title" className={home.h2}>Questions owners ask</h2>
            <p>Still wondering? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
            <p>Need a website too? <a className={`u ${home.inlineLink}`} href="/#quote">Get a quote + free demo</a> of your homepage.</p>
          </div>
          <div className={home.faq}>
            {listingQuestions.map((item, i) => (
              <details className={home.qaItem} key={item.q} name="check-faq" open={i === 0}>
                <summary>{item.q}<span className={home.qaIcon} aria-hidden="true" /></summary>
                <p>
                  {item.a}
                  {"link" in item && item.link ? <> <a className={`u ${home.qaLink}`} href={item.link.href}>{item.link.label}</a></> : null}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

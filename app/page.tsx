import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import { cta } from "./data/nav";
import { findings, niches, noGuarantee, plans, questions, steps } from "./data/offer";
import { site } from "./data/site";
import FreeCheckForm from "./home/FreeCheckForm";
import Included from "./home/Included";
import styles from "./home/home.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Custom websites for local businesses | Stringham Web Design",
  description: "Custom websites for independent businesses, starting at $1,800. No required Google Ads spending. Website development and Google listing services in League City, Texas.",
  path: "/",
});

export default async function Home({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      {/* 1. Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.h1}>A better website for the business you’re building.</h1>
            <p className={styles.sub}>I design and build custom websites for independent businesses. Projects start at $1,800, with a fixed quote before work begins. No required Google Ads spending. Need help with your Google listing too? I can do that.</p>
            <div className={styles.actions}>
              <a className="btn" href="/websites#website-quote" data-track="cta" data-location="hero">Request a website quote</a>
              <a className={`u ${styles.textLink}`} href="#prices">See prices</a>
            </div>
          </div>
          <aside className={styles.example} aria-label="Example of a free check">
            <p className={styles.exampleTag}><span>Example free check</span> <span className={styles.exampleName}>Example RV Park</span></p>
            <ul className={styles.exampleRows}>
              {[
                ["Google phone", "Correct", true],
                ["Yelp phone", "Different number", false],
                ["Hours", "Out of date", false],
                ["Website link", "Dead page", false],
              ].map(([k, v, ok]) => (
                <li key={k as string} className={ok ? styles.exOk : styles.exBad}>
                  <span>{k as string}</span>
                  <b><i aria-hidden="true">{ok ? "✓" : "✗"}</i><span className="sr-only">{ok ? "OK: " : "Problem: "}</span>{v as string}</b>
                </li>
              ))}
            </ul>
            <p className={styles.exampleFoot}>Fixed within 7 days, with screenshots.</p>
          </aside>
          <p className={styles.trust}>
            <span className={styles.trustName}>Kyle Stringham</span> · {site.legalName} · {site.city}, {site.regionLong}
          </p>
        </div>
      </section>

      {/* 2. What a free check finds */}
      <section className={styles.section} id="findings" aria-labelledby="findings-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="findings-title" className={styles.h2}>What I find on real local listings.</h2>
            <p className={styles.lede}>From my own research on local businesses, names left out.</p>
          </div>
          <ul className={styles.findings} data-reveal-group>
            {findings.map((f) => (
              <li className={styles.finding} key={f} data-reveal>{f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. How it works */}
      <section className={`${styles.section} ${styles.alt}`} id="how" aria-labelledby="how-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="how-title" className={styles.h2}>How it works</h2>
          </div>
          <ol className={styles.steps} data-reveal-group>
            {steps.map((s) => (
              <li className={styles.step} key={s.n} data-reveal>
                <span className={styles.stepN} aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {"yours" in s ? <p className={styles.yours}>{s.yours}</p> : null}
              </li>
            ))}
          </ol>
          <p className={styles.keep}>Keep SpareFoot, Facebook or your booking app. Nothing gets taken away.</p>
        </div>
      </section>

      {/* 4. Prices */}
      <section className={styles.section} id="prices" aria-labelledby="prices-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="prices-title" className={styles.h2}>Prices</h2>
            <p className={styles.lede}>Clear starting prices and a fixed quote for your website scope. No mandatory advertising contracts.</p>
          </div>
          <div className={styles.plans} data-reveal-group>
            {plans.map((p, i) => (
              <article className={styles.plan} key={p.key} data-reveal aria-labelledby={`plan-${p.key}`}>
                {"tag" in p ? <p className={styles.planTag}>{p.tag}</p> : null}
                <h3 id={`plan-${p.key}`} className={styles.planName}>{p.name}</h3>
                <p className={styles.price}><b>{p.price}</b> <span>{p.cadence}</span></p>
                <p className={styles.planLead}>{p.lead}</p>
                <div className={styles.included}>
                  <Included open={i === 0}>
                    <ul className={styles.list}>{p.included.map((item) => <li key={item}>{item}</li>)}</ul>
                  </Included>
                </div>
                <p className={styles.notIncluded}><b>Not included:</b> {p.notIncluded}</p>
                <ul className={styles.notes}>{p.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                <a className={`u ${styles.planTerms}`} href={`/terms${p.terms}`}>Terms for the {p.name}</a>
              </article>
            ))}
          </div>
          <div className={styles.pricesFoot}>
            <p>{noGuarantee}</p>
            <p>Full details in the <a className="u" href="/terms">Service Terms</a>.</p>
            <a className="btn" href="/websites#website-quote" data-track="cta" data-location="prices">Request a website quote</a>
          </div>
        </div>
      </section>

      {/* 5. Who it's for + about Kyle */}
      <section className={`${styles.section} ${styles.alt}`} id="about" aria-labelledby="about-title">
        <div className={`container ${styles.about}`}>
          <div className={styles.aboutCol}>
            <h2 id="about-title" className={styles.h2}>Who it&rsquo;s for</h2>
            <p className={styles.lede}>Owner-run local businesses that get customers through Google, phone calls and directories.</p>
            <ul className={styles.niches}>
              {niches.map((n) => <li key={n}>{n}</li>)}
            </ul>
            <p className={styles.body}>Run something else local? If customers find you through Google and the phone, the same work applies. Ask for the free check and I&rsquo;ll tell you straight whether it fits.</p>
          </div>
          <div className={`${styles.aboutCol} ${styles.kyle}`}>
            {/* Photo slot: a real photo of Kyle goes here when he sends it. Nothing is shown until then. */}
            <h2 className={styles.h2}>About Kyle</h2>
            <p className={styles.body}>I&rsquo;m Kyle Stringham. I run {site.legalName} out of {site.city}, {site.regionLong}. I grew up around my dad&rsquo;s self-storage facility, so I know what a wrong phone number or a dead website link costs a small business, and how little time an owner has to chase it.</p>
            <p className={styles.body}>I do the work myself, send you proof of every change, and never ask for your passwords.</p>
            <p className={styles.contactLine}>
              <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a><br />
              <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>
            </p>
          </div>
        </div>
      </section>

      {/* Partner entry point: one quiet band, the page stays for business owners. */}
      <section className={styles.partnerBand} aria-labelledby="partner-band-title">
        <div className={`container ${styles.partnerBandInner}`}>
          <div>
            <p className={styles.partnerEyebrow}>For creative &amp; agency partners</p>
            <h2 id="partner-band-title" className={styles.partnerTitle}>Photographer, designer or agency with clients who need a website?</h2>
          </div>
          <a className="btn btn-secondary" href="/partners">See how we&rsquo;d work together</a>
        </div>
      </section>

      {/* 6. Questions */}
      <section className={styles.section} id="questions" aria-labelledby="q-title">
        <div className={`container ${styles.qaGrid}`}>
          <div className={styles.qaSide}>
            <h2 id="q-title" className={styles.h2}>Questions owners ask</h2>
            <p className={styles.body}>Still wondering? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
          </div>
          <div className={styles.qa}>
            {questions.map((item, i) => (
              <details className={styles.qaItem} key={item.q} open={i === 0}>
                <summary>{item.q}</summary>
                <p>
                  {item.a}
                  {"link" in item && item.link ? <> <a className={`u ${styles.qaLink}`} href={item.link.href} {...(item.link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{item.link.label}{item.link.href.startsWith("http") ? <span className="sr-only"> (opens in a new tab)</span> : null}</a></> : null}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Free check form */}
      <section className={`${styles.section} ${styles.formSection}`} id="free-check" aria-labelledby="form-title">
        <div className={`container ${styles.formGrid}`}>
          <div className={styles.formSide}>
            <h2 id="form-title" className={styles.h2}>Get a free check</h2>
            <p className={styles.lede}><b>What happens next:</b> I look up your business the way your customers do and text or email you what I find within 24 hours. Free, no obligation.</p>
            <p className={styles.body}>Rather talk? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a> or email <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>.</p>
          </div>
          <FreeCheckForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
        </div>
      </section>

      <BusinessJsonLd />
    </>
  );
}

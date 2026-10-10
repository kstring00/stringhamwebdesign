import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import { cta } from "./data/nav";
import { listingSteps, noGuarantee, plans, PRICES, websitePriceNote, websiteQuestions, websiteSteps } from "./data/offer";
import { referral } from "./data/referral";
import { site } from "./data/site";
import BuildFieldMount from "./home/BuildFieldMount";
import Founder from "./components/Founder";
import FreeCheckForm from "./home/FreeCheckForm";
import Included from "./home/Included";
import Lifeless from "./home/Lifeless";
import Statement from "./home/Statement";
import CountUp from "./motion/CountUp";
import WebsiteQuoteForm from "./websites/WebsiteQuoteForm";
import styles from "./home/home.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Custom websites for local businesses | Stringham Web Design",
  description: "Custom websites for independent businesses, starting at $1,800. No required Google Ads spending. Website development and Google listing services in League City, Texas.",
  path: "/",
});

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

/** The website door's two cards, and the listing door's one. */
const sitePlans = plans.filter((p) => p.key === "site" || p.key === "plan");
const fixPlan = plans.find((p) => p.key === "fix");

type Plan = (typeof plans)[number];

/** One price card: what it costs, what's in it, what isn't, and the terms. */
function PlanCard({ p, open }: { p: Plan; open: boolean }) {
  return (
    <article className={styles.plan} data-reveal aria-labelledby={`plan-${p.key}`}>
      <h3 id={`plan-${p.key}`} className={styles.planName}>{p.key === "plan" ? "Monthly Plan (optional)" : p.name}</h3>
      <p className={styles.price}><b>{p.price}</b> <span>{p.cadence}</span></p>
      <p className={styles.planLead}>{p.lead}</p>
      <div className={styles.included}>
        <Included open={open}>
          <ul className={styles.list}>{p.included.map((item) => <li key={item}>{item}</li>)}</ul>
        </Included>
      </div>
      <p className={styles.notIncluded}><b>Not included:</b> {p.notIncluded}</p>
      <ul className={styles.notes}>{p.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      <a className={`u ${styles.planTerms}`} href={`/terms${p.terms}`}>Terms for the {p.name}</a>
    </article>
  );
}

/** The door arrow: a line and a chevron, so it can slide on hover. */
function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h12M10 4l5 5-5 5" />
    </svg>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      {/* 1. Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <BuildFieldMount />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText} data-field-clear>
            <h1 id="hero-title" className={styles.h1}>A better website for the business you’re building.</h1>
            <p className={styles.sub}>I design and build custom websites for independent businesses. Projects start at {fmt(PRICES.website)}, with a fixed quote before work begins and no required ad spend.</p>
            <div className={styles.actions}>
              <a className="btn" href="#quote" data-track="cta" data-location="hero" data-hero-cta>Request a website quote</a>
              <a className={`u ${styles.textLink}`} href="#prices">See prices</a>
            </div>
          </div>
          {/* Two doors: the two things people come here for, each to its own place. */}
          <aside className={styles.chooser} aria-labelledby="chooser-title" data-field-clear>
            <h2 id="chooser-title" className={styles.chooserTitle}>What do you need?</h2>
            <a className={styles.door} href="/websites" data-track="cta" data-location="hero-door-website">
              <span className={styles.doorNum} aria-hidden="true">01</span>
              <span className={styles.doorText}>
                <span className={styles.doorName}>A new website</span>
                <span className={styles.doorMeta}>From ${PRICES.website.toLocaleString("en-US")} · fixed written quote</span>
              </span>
              <span className={styles.doorArrow} aria-hidden="true"><Arrow /></span>
            </a>
            <a className={styles.door} href="#free-check" data-track="cta" data-location="hero-door-listing">
              <span className={styles.doorNum} aria-hidden="true">02</span>
              <span className={styles.doorText}>
                <span className={styles.doorName}>Fix my Google listing</span>
                <span className={styles.doorMeta}>Free check first · ${PRICES.listingFix} fix in 7 days</span>
              </span>
              <span className={styles.doorArrow} aria-hidden="true"><Arrow /></span>
            </a>
            <p className={styles.chooserFoot}>Not sure? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
          </aside>
          <p className={styles.trust} data-field-clear>
            <span className={styles.trustName}>Kyle Stringham</span> · {site.legalName} · {site.city}, {site.regionLong}
          </p>
        </div>
      </section>

      {/* 2. Lifeless sites, then the turn */}
      <Lifeless />

      {/* The idea, in one statement */}
      <Statement />

      {/* 3. How a website project works */}
      <section className={`${styles.section} ${styles.alt}`} id="how" aria-labelledby="how-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="how-title" className={styles.h2}>How it works</h2>
            <p className={styles.lede}>Three steps, and you know the price before anything starts.</p>
          </div>
          <ol className={styles.steps} data-reveal-group>
            {websiteSteps.map((s) => (
              <li className={styles.step} key={s.n} data-reveal>
                <span className={styles.stepN} aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Prices: the website first, the plan beside it */}
      <section className={styles.section} id="prices" aria-labelledby="prices-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="prices-title" className={styles.h2}>Prices</h2>
            <p className={styles.lede}>Websites start at {fmt(PRICES.website)}. The final price depends on the pages and features you need, and it&rsquo;s fixed in your written quote before any work starts.</p>
          </div>
          <div className={`${styles.plans} ${styles.plansTwo}`} data-reveal-group>
            {sitePlans.map((p, i) => <PlanCard key={p.key} p={p} open={i === 0} />)}
          </div>
          <div className={styles.pricesFoot}>
            <p>{websitePriceNote}</p>
            <p>Full details in the <a className={`u ${styles.inlineLink}`} href="/terms">Service Terms</a>.</p>
            <a className="btn" href="#quote" data-track="cta" data-location="prices">Request a website quote</a>
          </div>
        </div>
      </section>

      {/* 5. Who you'd work with: the same founder block as /websites and /partners */}
      <section className={`${styles.section} ${styles.alt}`} id="about" aria-labelledby="founder-title">
        <div className="container">
          <Founder />
        </div>
      </section>

      {/* 6. The second door: just the Google listing, with the free check */}
      <section className={styles.section} id="free-check" aria-labelledby="listing-title">
        <div className="container">
          <div className={styles.head}>
            <p className={styles.eyebrow}>Just need your Google listing fixed?</p>
            <h2 id="listing-title" className={styles.h2}>Start with a free check.</h2>
            <p className={styles.lede}>I look up your business the way your customers do and text or email you what I find within 24 hours. Free, no obligation.</p>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.listingSide}>
              <ol className={styles.miniSteps}>
                {listingSteps.map((s) => (
                  <li key={s.n}>
                    <span aria-hidden="true">{s.n}</span>
                    <div><b>{s.title}</b> {s.body}{"yours" in s ? <> <em>{s.yours}</em></> : null}</div>
                  </li>
                ))}
              </ol>
              {fixPlan ? <PlanCard p={fixPlan} open={false} /> : null}
              <p className={styles.fineNote}>{noGuarantee}</p>
            </div>
            <FreeCheckForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
          </div>
        </div>
      </section>

      {/* Referrals and partners: one quiet band, the page stays for business owners. */}
      <section className={styles.partnerBand} aria-labelledby="partner-band-title">
        <div className={`container ${styles.partnerBandInner}`}>
          <p className={styles.referralRate} aria-hidden="true"><CountUp value={referral.rate} suffix="%" /></p>
          <div>
            <p className={styles.partnerEyebrow}>Referrals &amp; partners</p>
            <h2 id="partner-band-title" className={styles.partnerTitle}>Know a business that needs a website? I pay {referral.percent} of the website total when they hire me.</h2>
          </div>
          <div className={styles.partnerBandActions}>
            <a className="btn btn-secondary" href="/partners#referrals">How referrals work</a>
            <a className={`u ${styles.textLink}`} href="/partners">For agencies and creatives</a>
          </div>
        </div>
      </section>

      {/* 7. Questions, website first */}
      <section className={styles.section} id="questions" aria-labelledby="q-title">
        <div className={`container ${styles.qaGrid}`}>
          <div className={styles.qaSide}>
            <h2 id="q-title" className={styles.h2}>Questions owners ask</h2>
            <p className={styles.body}>Still wondering? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
            <p className={styles.body}>Only need your Google listing fixed? <a className={`u ${styles.inlineLink}`} href="#free-check">Start with the free check</a>.</p>
          </div>
          <div className={styles.qa}>
            {websiteQuestions.map((item, i) => (
              <details className={styles.qaItem} key={item.q} open={i === 0}>
                <summary>{item.q}</summary>
                <p>
                  {item.a}
                  {"link" in item && item.link ? <> <a className={`u ${styles.qaLink}`} href={item.link.href}>{item.link.label}</a></> : null}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. The close: the website quote */}
      <section className={`${styles.section} ${styles.formSection}`} id="quote" aria-labelledby="quote-title">
        <div className={`container ${styles.formGrid}`}>
          <div className={styles.formSide}>
            <h2 id="quote-title" className={styles.h2}>Tell me about your website.</h2>
            <p className={styles.lede}><b>What happens next:</b> I read it and text or email you within 24 hours. If it&rsquo;s a fit, we talk, then you get a fixed written quote. No obligation.</p>
            <p className={styles.body}>Rather talk? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a> or email <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>.</p>
          </div>
          <WebsiteQuoteForm />
        </div>
      </section>

      <BusinessJsonLd />
    </>
  );
}

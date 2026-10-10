import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import { quoteCta } from "./data/nav";
import { editsNote, findings, homeQuestions, listingSteps, noGuarantee, plans, PRICES, timelineNote, websitePriceNote, websiteSteps, whatINeed } from "./data/offer";
import { referral } from "./data/referral";
import { site } from "./data/site";
import { homeWork, kindLabel } from "./data/work";
import BuildFieldMount from "./home/BuildFieldMount";
import Founder from "./components/Founder";
import FreeCheckForm from "./home/FreeCheckForm";
import Included from "./home/Included";
import Lifeless from "./home/Lifeless";
import Statement from "./home/Statement";
import CountUp from "./motion/CountUp";
import styles from "./home/home.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Websites & Google Listings in League City, TX | Stringham Web Design",
  description: "A free Google listing check, a $300 Listing Fix and custom websites from $1,800 for owner-run businesses in League City, Webster, Friendswood and Greater Houston. No ad spend required.",
  path: "/",
});

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

/** The website section's two cards, and the free check's one. */
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

export default async function Home({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      {/* 1. Hero: what, for whom, where, and one next step. */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <BuildFieldMount />
        <div className="container">
          <div className={`${styles.heroText} ${styles.heroSolo}`} data-field-clear>
            <h1 id="hero-title" className={styles.h1}>Websites and Google listings that bring League City businesses more calls.</h1>
            <p className={styles.sub}>Custom websites and Google listing fixes for owner-run businesses, by one local builder.</p>
            <div className={styles.actions}>
              <a className="btn" href="#free-check" data-track="cta" data-location="hero" data-hero-cta>Get a free Google check</a>
              <a className={`u ${styles.textLink}`} href={quoteCta.href} data-track="cta" data-location="hero-quote">Need a website? Request a quote</a>
            </div>
            <p className={styles.heroContact}>
              Or reach me directly: <a className="u" href={site.phoneHref}>Call {site.phone}</a> · <a className="u" href={site.smsHref}>Text me</a>
            </p>
            <p className={styles.heroTrust}>
              <picture>
                <source type="image/webp" srcSet="/kyle-founder.webp" />
                <img src="/kyle-founder.jpg" alt="" width={44} height={44} decoding="async" />
              </picture>
              <span><b>Kyle Stringham</b> · {site.city} · You own everything · No ad spend required</span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. Work: real projects, labeled for what they are. Never padded. */}
      {homeWork.length ? (
        <section className={styles.section} id="work" aria-labelledby="work-title">
          <div className="container">
            <div className={styles.head}>
              <h2 id="work-title" className={styles.h2}>Work you can click through</h2>
              <p className={styles.lede}>Stringham Web Design is a new studio. Here&rsquo;s live work, labeled for exactly what it is.</p>
            </div>
            <ul className={styles.work}>
              {homeWork.map((w) => (
                <li key={w.key} className={styles.workCard}>
                  <div className={`frame ${styles.workShot}`}>
                    <picture>
                      <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
                      <img src={`/showcase/${w.key}-desktop.webp`} alt={w.alt.desktop} width={1440} height={900} loading="lazy" decoding="async" />
                    </picture>
                  </div>
                  <div className={styles.workText}>
                    <p className={styles.workKind}><span>{kindLabel[w.kind].label}</span> {w.type}</p>
                    <h3>{w.name}</h3>
                    <p>{w.what}</p>
                    {w.builtFor ? <p className={styles.workFor}><b>Built for one action:</b> {w.builtFor}</p> : null}
                    {w.testimonial ? (
                      <blockquote className={styles.workQuote}>
                        <p>&ldquo;{w.testimonial.quote}&rdquo;</p>
                        <footer>{w.testimonial.name}, {w.testimonial.business}</footer>
                      </blockquote>
                    ) : null}
                    {w.liveUrl ? (
                      <a className={`u ${styles.workLink}`} href={w.liveUrl} target="_blank" rel="noopener noreferrer" data-track="work_sample_click" data-location={w.key}>
                        Visit the live site<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.workMore}><a className={`u ${styles.inlineLink}`} href="/websites#work">See everything I&rsquo;ve built</a>, each project labeled for exactly what it is.</p>
          </div>
        </section>
      ) : null}

      {/* 3. The problem: lifeless sites, then the turn, then the idea in one line. */}
      <Lifeless />
      <Statement />

      {/* 4. The free Google check, with the form right here. */}
      <section className={`${styles.section} ${styles.alt}`} id="free-check" aria-labelledby="listing-title">
        <div className="container">
          <div className={styles.head}>
            <p className={styles.eyebrow}>Free Google check</p>
            <h2 id="listing-title" className={styles.h2}>Is your Google listing costing you calls?</h2>
            <p className={styles.lede}>I look up your business the way your customers do, then text or email you what I find within 24 hours. Free, no obligation.</p>
          </div>
          <div className={styles.findingsBox}>
            <p className={styles.findingsTitle}>What I&rsquo;ve found on real local listings, names left out:</p>
            <ul className={styles.findings}>
              {findings.map((f) => <li key={f}>{f}</li>)}
            </ul>
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

      {/* 5. Websites: the price beside what's included, ownership and terms. */}
      <section className={styles.section} id="prices" aria-labelledby="prices-title">
        <span id="quote" />
        <div className="container">
          <div className={styles.head}>
            <p className={styles.eyebrow}>Websites</p>
            <h2 id="prices-title" className={styles.h2}>A website built around your goals, from {fmt(PRICES.website)}.</h2>
            <p className={styles.lede}>Designed to look the part and to get people to call, book or order. The final price depends on the pages and features you need, and it&rsquo;s fixed in your written quote before any work starts.</p>
          </div>
          <div className={`${styles.plans} ${styles.plansTwo}`} data-reveal-group>
            {sitePlans.map((p, i) => <PlanCard key={p.key} p={p} open={i === 0} />)}
          </div>
          <div className={styles.pricesFoot}>
            <p>{websitePriceNote}</p>
            <p><b>Can I update it myself?</b> {editsNote}</p>
            <p>Full details in the <a className={`u ${styles.inlineLink}`} href="/terms">Service Terms</a>.</p>
            <a className="btn" href={quoteCta.href} data-track="cta" data-location="prices">Request a website quote</a>
          </div>
        </div>
      </section>

      {/* 6. How a website project works, and what it needs from you. */}
      <section className={`${styles.section} ${styles.alt}`} id="how" aria-labelledby="how-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="how-title" className={styles.h2}>How a website project works</h2>
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
          <div className={styles.needs}>
            <div>
              <h3 className={styles.needsTitle}>What I need from you</h3>
              <ul className={styles.list}>{whatINeed.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
            <div>
              <h3 className={styles.needsTitle}>How long it takes</h3>
              <p className={styles.body}>{timelineNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Who you'd work with: the same founder block as /websites and /partners */}
      <section className={styles.section} id="about" aria-labelledby="founder-title">
        <div className="container">
          <Founder />
        </div>
      </section>

      {/* 8. Questions: only what the sections above don't answer. */}
      <section className={`${styles.section} ${styles.alt}`} id="questions" aria-labelledby="q-title">
        <div className={`container ${styles.qaGrid}`}>
          <div className={styles.qaSide}>
            <h2 id="q-title" className={styles.h2}>Questions owners ask</h2>
            <p className={styles.body}>Still wondering? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
            <p className={styles.body}><a className={`u ${styles.inlineLink}`} href="#free-check">Get a free Google check</a>, or <a className={`u ${styles.inlineLink}`} href={quoteCta.href}>request a website quote</a>.</p>
          </div>
          <div className={styles.qa}>
            {homeQuestions.map((item, i) => (
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

      {/* 9. Partners: one line, the rest lives on /partners. */}
      <section className={styles.partnerBand} aria-labelledby="partner-band-title">
        <div className={`container ${styles.partnerBandInner}`}>
          <p className={styles.referralRate} aria-hidden="true"><CountUp value={referral.rate} suffix="%" /></p>
          <div>
            <p className={styles.partnerEyebrow}>Referrals and partners</p>
            <h2 id="partner-band-title" className={styles.partnerTitle}>Know a business that needs a website? I pay {referral.percent} of the website total when they hire me.</h2>
          </div>
          <div className={styles.partnerBandActions}>
            <a className="btn btn-secondary" href="/partners#referrals">How referrals work</a>
            <a className={`u ${styles.textLink}`} href="/partners">For agencies and creatives</a>
          </div>
        </div>
      </section>

      <BusinessJsonLd />
    </>
  );
}

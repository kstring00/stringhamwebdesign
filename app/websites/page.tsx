import type { Metadata } from "next";

import Founder from "../components/Founder";
import { pageMeta } from "../data/meta";
import { editsNote, PRICES, plans, timelineNote, websitesPageQuestions, websiteSteps as steps, whatINeed } from "../data/offer";
import { referral } from "../data/referral";
import CountUp from "../motion/CountUp";
import { site } from "../data/site";
import { kindLabel, partnerWork } from "../data/work";
import home from "../home/home.module.css";
import Included from "../home/Included";
import styles from "./websites.module.css";
import WebsiteQuoteForm from "./WebsiteQuoteForm";

export const metadata: Metadata = pageMeta({
  absolute: "Web Design in League City, TX | Stringham Web Design",
  description: "Custom websites for owner-run businesses in League City, Webster, Clear Lake and Greater Houston. From $2,000 with a fixed written quote, no ad spend required, and you own the site.",
  path: "/websites",
});

const starting = `$${PRICES.website.toLocaleString("en-US")}`;

/** The points an owner checks first, said once, near the top. */
const points = [
  "Design, build and launch on your domain",
  "No required ad spending, no contract",
  "Around 3 weeks from go-ahead to launch",
  "You approve it before paying the balance",
  "Paid in full, it’s yours: domain and accounts too",
];

/** The two cards that matter on this page: the build and the upkeep. */
const sitePlans = plans.filter((p) => p.key === "site" || p.key === "plan");


export default async function Websites({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      {/* 1. Hero: what, for whom, where, the price, one action. */}
      <section className={home.hero} aria-labelledby="websites-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Custom websites · {site.city}, {site.regionLong}</p>
            <h1 id="websites-title" className={home.h1}>A website that makes it easier for customers to choose you.</h1>
            <p className={home.sub}>I design and build websites for owner-run businesses, built around the one thing your customers need to do: call, book, order or ask. One person, start to finish, and you deal with me directly.</p>
            <div className={home.actions}>
              <a className="btn" href="#website-quote" data-track="cta" data-location="websites-hero" data-hero-cta>Request a website quote</a>
              <a className={`u ${home.textLink}`} href="#work">See the work</a>
            </div>
            <p className={styles.lightStep}>Not ready for a website? <a className="u" href="/#free-check" data-track="cta" data-location="websites-hero-check">Start with a free Google check</a>, or <a className="u" href={site.phoneHref}>call</a> or <a className="u" href={site.smsHref}>text</a> {site.phone}.</p>
          </div>
          <aside className={styles.offer} aria-label="What you get">
            <p className={styles.offerTag}>Websites start at</p>
            <p className={styles.offerPrice}>{starting}</p>
            <p className={styles.offerSub}>Fixed in a written quote before any work starts.</p>
            <ul className={styles.points}>
              {points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      {/* 2. Work: "has he done this before?" answered with honest labels. */}
      <section className={home.section} id="work" aria-labelledby="work-title">
        <div className="container">
          <div className={home.head}>
            <h2 id="work-title" className={home.h2}>What I&rsquo;ve built</h2>
            <p className={home.lede}>Stringham Web Design is a new studio. Here&rsquo;s my work so far, each one labeled for exactly what it is.</p>
          </div>
          <ul className={styles.work}>
            {partnerWork.map((w) => {
              const href = w.liveUrl ?? w.previewUrl;
              return (
                <li key={w.key} className={styles.card}>
                  <div className={`frame ${styles.cardShot}`}>
                    <picture>
                      <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
                      <img src={`/showcase/${w.key}-desktop.webp`} alt={w.alt.desktop} width={1440} height={900} loading="lazy" decoding="async" />
                    </picture>
                  </div>
                  <p className={styles.status}><span className={`${styles.pill} ${w.kind === "live" ? styles.pillLive : ""}`}>{kindLabel[w.kind].label}</span> {w.stage}</p>
                  <h3>{w.name}</h3>
                  <p>{w.what}</p>
                  {href ? (
                    <a className={`u ${styles.visit}`} href={href} target="_blank" rel="noopener noreferrer" data-track="work_sample_click" data-location={w.key}>
                      {w.liveUrl ? "Visit the live site" : w.kind === "archived" ? "View the archived demo" : "View the preview"}<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className={styles.more}>What I built on each one, in detail: <a className={`u ${home.textLink}`} href="/partners#work">see the full write-ups</a></p>
        </div>
      </section>

      {/* 3. Price: what it costs, what's included, ownership beside the price. */}
      <section className={`${home.section} ${home.alt}`} id="prices" aria-labelledby="prices-title">
        <div className="container">
          <div className={home.head}>
            <h2 id="prices-title" className={home.h2}>What it costs</h2>
            <p className={home.lede}>Websites start at {starting}. The final price depends on the pages and features you need, and it&rsquo;s fixed in your written quote before any work starts.</p>
          </div>
          <div className={styles.plans}>
            {sitePlans.map((p, i) => (
              <article className={home.plan} key={p.key} aria-labelledby={`wp-${p.key}`}>
                <h3 id={`wp-${p.key}`} className={home.planName}>{p.key === "plan" ? "Monthly Plan (optional)" : p.name}</h3>
                <p className={home.price}><b>{p.price}</b> <span>{p.cadence}</span></p>
                <p className={home.planLead}>{p.lead}</p>
                <div className={home.included}>
                  <Included open={i === 0}>
                    <ul className={home.list}>{p.included.map((item) => <li key={item}>{item}</li>)}</ul>
                  </Included>
                </div>
                <p className={home.notIncluded}><b>Not included:</b> {p.notIncluded}</p>
                <ul className={home.notes}>{p.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                <a className={`u ${home.planTerms}`} href={`/terms${p.terms}`}>Terms for the {p.name}</a>
              </article>
            ))}
          </div>
          <p className={styles.noAds}><b>No ad spend. No contract.</b> Any deposit is written in your quote, and the Monthly Plan is month to month. Full details in the <a className="u" href="/terms">Service Terms</a>.</p>
          <p className={styles.noAds}><b>Can I update it myself?</b> {editsNote}</p>
        </div>
      </section>

      {/* 4. How it works */}
      <section className={home.section} id="how" aria-labelledby="how-title">
        <div className="container">
          <div className={home.head}>
            <h2 id="how-title" className={home.h2}>How it works</h2>
            <p className={home.lede}>Three steps, and you know the price before anything starts.</p>
          </div>
          <ol className={home.steps}>
            {steps.map((s) => (
              <li className={home.step} key={s.n}>
                <span className={home.stepN} aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className={home.needs}>
            <div>
              <h3 className={home.needsTitle}>What I need from you</h3>
              <ul className={home.list}>{whatINeed.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
            <div>
              <h3 className={home.needsTitle}>How long it takes</h3>
              <p className={home.body}>{timelineNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Who you'd work with */}
      <section className={`${home.section} ${home.alt}`} id="founder" aria-labelledby="founder-title">
        <div className="container">
          <Founder />
        </div>
      </section>

      {/* 6. Questions the sections above don't answer */}
      <section className={home.section} id="questions" aria-labelledby="q-title">
        <div className={`container ${home.qaGrid}`}>
          <div className={home.qaSide}>
            <h2 id="q-title" className={home.h2}>Questions</h2>
            <p className={home.body}>Still wondering? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
          </div>
          <div className={home.qa}>
            {websitesPageQuestions.map((item) => (
              <details className={home.qaItem} key={item.q}>
                <summary>{item.q}</summary>
                <p>
                  {item.a}
                  {"link" in item && item.link ? <> <a className={`u ${home.qaLink}`} href={item.link.href}>{item.link.label}</a></> : null}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Referral offer */}
      <section className={styles.referral} aria-labelledby="refer-title">
        <div className={`container ${styles.referralInner}`}>
          <p className={styles.referralRate} aria-hidden="true"><CountUp value={referral.rate} suffix="%" /></p>
          <div>
            <h2 id="refer-title" className={styles.referralTitle}>Know another business that needs a website?</h2>
            <p className={styles.referralBody}>Send them my way. When they hire me and pay in full, I pay you {referral.percent} of their website&rsquo;s total price. On a {referral.example.price} site, that&rsquo;s {referral.example.reward}.</p>
          </div>
          <a className="btn btn-secondary" href="/partners#referrals">How referrals work</a>
        </div>
      </section>

      {/* 8. The form */}
      <section className={`${home.section} ${home.formSection}`} id="website-quote" aria-labelledby="form-title">
        <div className={`container ${home.formGrid}`}>
          <div className={home.formSide}>
            <h2 id="form-title" className={home.h2}>Tell me about your website.</h2>
            <p className={home.lede}><b>What happens next:</b> I read it and text or email you within 24 hours. If it&rsquo;s a fit, we talk, then you get a fixed written quote. No obligation.</p>
            <p className={home.body}>Rather talk? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a> or email <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>.</p>
          </div>
          <WebsiteQuoteForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
        </div>
      </section>
    </>
  );
}

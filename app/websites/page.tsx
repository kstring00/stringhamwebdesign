import type { Metadata } from "next";
import { pageMeta } from "../data/meta";
import { PRICES } from "../data/offer";
import { site } from "../data/site";
import WebsiteQuoteForm from "./WebsiteQuoteForm";
import styles from "../home/home.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Custom Business Websites From $1,800 | Stringham Web Design",
  description: "Custom websites for independent businesses. Transparent starting price, fixed written quotes, no required Google Ads spending, and optional month-to-month support.",
  path: "/websites",
});
export default async function Websites({searchParams}:{searchParams:Promise<{sent?:string;error?:string}>}) {
  const {sent,error}=await searchParams;
  return <>
    <section className={styles.hero}><div className="container">
      <div className={styles.heroText}>
        <p className={styles.trust}>Custom websites · League City, Texas</p>
        <h1 className={styles.h1}>A website that makes it easier for customers to choose you.</h1>
        <p className={styles.sub}>I design and build websites for independent businesses. No required Google Ads spending, no bundled advertising commitment, and no mystery pricing. You get a clear written quote before we start.</p>
        <div className={styles.actions}><a className="btn" href="#website-quote">Request a website quote</a><a className="u" href="/partners#work">See selected work</a></div>
      </div>
    </div></section>
    <section className={styles.section}><div className="container"><div className={styles.head}>
      <h2 className={styles.h2}>Straightforward pricing, clear scope.</h2>
      <p className={styles.lede}>Websites start at ${PRICES.website.toLocaleString("en-US")}. Your final price depends on pages, features, and integrations, all listed in your fixed written quote. Existing accepted quotes are honored.</p>
    </div><div className={styles.plans}>
      <article className={styles.plan}><h3 className={styles.planName}>Website design and development</h3><p className={styles.price}><b>${PRICES.website.toLocaleString("en-US")}</b><span>starting at</span></p><p className={styles.planLead}>A mobile-friendly website built around your customer's next step.</p><p>Scope can include a request form, responsive design, agreed pages, and launch support.</p></article>
      <article className={styles.plan}><h3 className={styles.planName}>Optional monthly care</h3><p className={styles.price}><b>$125</b><span>per month</span></p><p>Hosting and upkeep when applicable, agreed content edits and reporting. Month to month.</p></article>
    </div><p className={styles.body}>No required paid advertising. You keep control of your domain and accounts. The project agreement defines your deliverables, payment terms and ownership. <a className="u" href="/terms">Read the service terms</a>.</p></div></section>
    <section className={`${styles.section} ${styles.alt}`}><div className="container"><div className={styles.head}><h2 className={styles.h2}>How we'll work together</h2></div>
      <ol className={styles.steps}>
        <li className={styles.step}><span className={styles.stepN}>1</span><h3>Tell me what you need</h3><p>We discuss your business, audience and what customers should be able to do.</p></li>
        <li className={styles.step}><span className={styles.stepN}>2</span><h3>Agree on the scope</h3><p>You'll get a written fixed quote covering pages, features, timeline and payment milestones.</p></li>
        <li className={styles.step}><span className={styles.stepN}>3</span><h3>Build, review, launch</h3><p>I build the agreed website, you review it, and we launch after approval and payment.</p></li>
      </ol></div></section>
    <section id="website-quote" className={`${styles.section} ${styles.formSection}`}><div className={`container ${styles.formGrid}`}>
      <div className={styles.formSide}><h2 className={styles.h2}>Tell me about your website.</h2><p className={styles.lede}>No pressure and no obligation. Share the basics and I'll get back to you to explore whether we're a good fit.</p><p className={styles.body}>Prefer email? <a className="u" href={`mailto:${site.email}`}>{site.email}</a></p></div>
      <WebsiteQuoteForm sent={sent==="1"} errorCode={error||""}/>
    </div></section>
  </>;
}

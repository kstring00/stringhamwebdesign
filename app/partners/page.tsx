import type { Metadata } from "next";

import Founder from "../components/Founder";
import BuildFieldMount from "../home/BuildFieldMount";
import home from "../home/home.module.css";
import { pageMeta } from "../data/meta";
import { comparison, partnerQuestions, partnerSteps, paths, reasons } from "../data/partners";
import { referral } from "../data/referral";
import CountUp from "../motion/CountUp";
import { site } from "../data/site";
import Coverflow from "../components/Coverflow";
import { kindLabel, partnerWork, showcaseWork, type WorkKind } from "../data/work";
import PartnerForm from "./PartnerForm";
import styles from "./partners.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Web Design Partner for Agencies & Creatives, Houston TX | Stringham Web Design",
  description: "Kyle Stringham builds websites for the clients of photographers, brand designers, marketing agencies and consultants in League City and Greater Houston: as a referral partner or white-label behind your brand.",
  path: "/partners",
  image: "/og/partners.png",
  imageAlt: "Your clients need websites. I can build them. Kyle Stringham, Stringham Web Design LLC, League City, Texas.",
});

const kindClass: Record<WorkKind, string> = {
  live: styles.kindLive,
  demo: styles.kindDemo ?? "",
  "in-progress": styles.kindProgress,
  concept: styles.kindConcept,
  archived: styles.kindArchived,
};

/** The labels in use on this build, explained above the carousel when there's more than one. */
const legendKinds = (Object.keys(kindLabel) as WorkKind[]).filter((k) => partnerWork.some((w) => w.kind === k));

/** The door arrow, as on the home page. */
function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h12M10 4l5 5-5 5" />
    </svg>
  );
}

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <div className={styles.view}>
      {/* 1. Hero */}
      <section className={styles.hero} aria-labelledby="partners-title">
        <BuildFieldMount />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText} data-field-clear>
            <p className={styles.eyebrow}>For photographers, designers, agencies and consultants</p>
            <h1 id="partners-title" className={styles.h1}>Your clients need websites. I can build them.</h1>
            <p className={styles.sub}>I work with professionals whose clients need a website, so you can say yes to the project without doing the development yourself. Refer the client to me, or have me build behind your brand.</p>
            <div className={styles.actions}>
              <a className="btn" href="#partner-form" data-track="cta" data-location="partners-hero" data-field-cta data-hero-cta>Explore a partnership</a>
              <a className="btn btn-secondary" href="#work">View my work</a>
            </div>
            <p className={styles.trust}><b>Kyle Stringham</b> · {site.legalName} · {site.city}, {site.regionLong}</p>
          </div>
          {/* The two ways in, each to its own terms below. */}
          <aside className={`${home.chooser} ${styles.heroCard}`} aria-labelledby="ways-card-title" data-field-clear>
            <h2 id="ways-card-title" className={home.chooserTitle}>How do you want to work?</h2>
            <a className={home.door} href="#referrals" data-track="cta" data-location="partners-door-referral">
              <span className={home.doorNum} aria-hidden="true">01</span>
              <span className={home.doorText}>
                <span className={home.doorName}>Refer a client</span>
                <span className={home.doorMeta}>{referral.percent} of the website total, once they&rsquo;ve paid in full</span>
              </span>
              <span className={home.doorArrow} aria-hidden="true"><Arrow /></span>
            </a>
            <a className={home.door} href="#ways" data-track="cta" data-location="partners-door-agency">
              <span className={home.doorNum} aria-hidden="true">02</span>
              <span className={home.doorText}>
                <span className={home.doorName}>Build behind your brand</span>
                <span className={home.doorMeta}>White-label · priced per project, in writing</span>
              </span>
              <span className={home.doorArrow} aria-hidden="true"><Arrow /></span>
            </a>
            <p className={home.chooserFoot}>Anyone can refer. No sign-up needed.</p>
          </aside>
        </div>
      </section>

      {/* 2. Selected work: "can I see it?" answered before anything else */}
      <section className={`${styles.section} ${styles.alt}`} id="work" aria-labelledby="work-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="work-title" className={styles.h2}>Selected work</h2>
            <p className={styles.lede}>Stringham Web Design is a new studio, so you work with the founder on every project. Here&rsquo;s what I&rsquo;ve built, each labeled for exactly what it is.</p>
          </div>
          {legendKinds.length > 1 ? (
            <dl className={styles.legend} aria-label="What each label means">
              {legendKinds.map((k) => (
                <div key={k}>
                  <dt><span className={`${styles.kind} ${kindClass[k]}`}>{kindLabel[k].label}</span></dt>
                  <dd>{kindLabel[k].means}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <Coverflow items={showcaseWork} label="Selected work" accent="partners" />
        </div>
      </section>

      {/* 3. Two ways to partner */}
      <section className={styles.section} id="ways" aria-labelledby="ways-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="ways-title" className={styles.h2}>Two ways to work together</h2>
            <p className={styles.lede}>Pick whichever fits how you run your business. Both are set up in writing before the first project.</p>
          </div>
          <div className={styles.paths}>
            {paths.map((p) => (
              <article className={styles.path} key={p.key} aria-labelledby={`path-${p.key}`}>
                <p className={styles.pathLabel}>{p.label}</p>
                <h3 id={`path-${p.key}`}>{p.name}</h3>
                <p className={styles.pathLead}>{p.lead}</p>
                <ul className={styles.ticks}>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className={styles.compareWrap}>
            <table className={styles.compare}>
              <caption className="sr-only">How the two partnership paths compare</caption>
              <thead>
                <tr><th scope="col"><span className="sr-only">Question</span></th><th scope="col">Referral partner</th><th scope="col">Agency development partner</th></tr>
              </thead>
              <tbody>
                {comparison.map((c) => (
                  <tr key={c.row}><th scope="row">{c.row}</th><td data-label="Referral partner">{c.a}</td><td data-label="Agency development partner">{c.b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>White-label pricing is agreed per project, in writing, before work starts.</p>

          {/* Referral terms: published, and the same for anyone who refers. */}
          <div className={styles.referral} id="referrals">
            <div className={styles.referralLead}>
              <p className={styles.referralRate} aria-hidden="true"><CountUp value={referral.rate} suffix="%" /></p>
              <h3 id="referrals-title" className={styles.referralTitle}>Referral terms: {referral.percent} of the website total</h3>
              <p className={styles.referralExample}>
                <span>Example</span> Your client&rsquo;s website quote is {referral.example.price}. Once they&rsquo;ve paid in full, I pay you <b>{referral.example.reward}</b>.
              </p>
            </div>
            <ul className={styles.ticks}>
              {referral.rules.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Why work with me */}
      <section className={`${styles.section} ${styles.alt}`} id="why" aria-labelledby="why-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="why-title" className={styles.h2}>What you can count on</h2>
          </div>
          <ul className={styles.reasons}>
            {reasons.map((r) => (
              <li key={r.title} data-reveal>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Founder */}
      <section className={styles.section} id="founder" aria-labelledby="founder-title">
        <div className="container">
          <Founder />
        </div>
      </section>

      {/* 5. How it works */}
      <section className={`${styles.section} ${styles.alt}`} id="process" aria-labelledby="process-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="process-title" className={styles.h2}>How a partnership works</h2>
          </div>
          <ol className={styles.steps}>
            {partnerSteps.map((s) => (
              <li key={s.n}>
                <span className={styles.stepN} aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Partner questions */}
      <section className={styles.section} id="partner-questions" aria-labelledby="pq-title">
        <div className={`container ${styles.qaGrid}`}>
          <div className={styles.qaSide}>
            <h2 id="pq-title" className={styles.h2}>Partner questions</h2>
            <p className={styles.body}>Something else? Email <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>.</p>
          </div>
          <div className={styles.qa}>
            {partnerQuestions.map((item, i) => (
              <details className={styles.qaItem} key={item.q} open={i === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Form */}
      <section className={`${styles.section} ${styles.alt}`} id="partner-form" aria-labelledby="pf-title">
        <div className={`container ${styles.formGrid}`}>
          <div className={styles.formSide}>
            <h2 id="pf-title" className={styles.h2}>Explore a partnership</h2>
            <p className={styles.lede}><b>What happens next:</b> I&rsquo;ll reply within two business days to set up a short call. No cost and no commitment.</p>
            <p className={styles.body}>Need a website for your own business? <a className="u" href="/#quote">Get a quote + free demo</a> instead.</p>
          </div>
          <PartnerForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";

import Founder from "../components/Founder";
import { pageMeta } from "../data/meta";
import { comparison, partnerQuestions, partnerSteps, paths, reasons } from "../data/partners";
import { site } from "../data/site";
import { kindLabel, partnerWork, type Work, type WorkKind } from "../data/work";
import PartnerForm from "./PartnerForm";
import styles from "./partners.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Website Partner for Photographers, Designers & Agencies | Stringham Web Design",
  description: "Kyle Stringham builds websites for the clients of photographers, brand designers, marketing agencies and consultants in League City and Greater Houston: as a referral partner or white-label behind your brand.",
  path: "/partners",
  image: "/og/partners.png",
  imageAlt: "Your clients need websites. I can build them. Kyle Stringham, Stringham Web Design LLC, League City, Texas.",
});

/** Real captures, served as AVIF with a WebP fallback. */
function Capture({ k, view, alt, width, height }: { k: string; view: "desktop" | "mobile"; alt: string; width: number; height: number }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`/showcase/${k}-${view}.avif`} />
      <img src={`/showcase/${k}-${view}.webp`} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    </picture>
  );
}

const kindClass: Record<WorkKind, string> = {
  live: styles.kindLive,
  "in-progress": styles.kindProgress,
  concept: styles.kindConcept,
  archived: styles.kindArchived,
};

/** The labels in use on this build, explained above the list when there's more than one. */
const legendKinds = (Object.keys(kindLabel) as WorkKind[]).filter((k) => partnerWork.some((w) => w.kind === k));

function Project({ w, index, featured }: { w: Work; index: number; featured: boolean }) {
  return (
    <li className={`${styles.project} ${featured ? styles.featured : ""}`}>
      <div className={styles.media}>
        <div className={`frame ${styles.desk}`}>
          <span className={styles.bar} aria-hidden="true"><i /><i /><i /></span>
          <Capture k={w.key} view="desktop" alt={w.alt.desktop} width={1440} height={900} />
        </div>
        <div className={styles.phone}>
          <Capture k={w.key} view="mobile" alt={w.alt.mobile} width={390} height={700} />
        </div>
      </div>
      <div className={styles.projectText}>
        <p className={styles.status}>
          <span className={`${styles.kind} ${kindClass[w.kind]}`}>{kindLabel[w.kind].label}</span>
          <span className={styles.stage}>{w.stage}</span>
        </p>
        <h3><span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{w.name}</h3>
        <p className={styles.what}>{w.what}</p>
        <p className={styles.builtLabel}>What I built</p>
        <ul className={styles.built}>
          {w.built.map((b) => <li key={b}>{b}</li>)}
        </ul>
        {w.liveUrl ? (
          <a className={`u ${styles.visit}`} href={w.liveUrl} target="_blank" rel="noopener noreferrer">Visit the live site<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span></a>
        ) : w.previewUrl ? (
          <a className={`u ${styles.visit}`} href={w.previewUrl} target="_blank" rel="noopener noreferrer">View the preview<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span></a>
        ) : (
          <p className={styles.private}>Not public yet. These screens are from the working build.</p>
        )}
      </div>
    </li>
  );
}

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      {/* 1. Hero */}
      <section className={styles.hero} aria-labelledby="partners-title">
        <div className="container">
          <p className={styles.eyebrow}>For photographers, designers, agencies and consultants</p>
          <h1 id="partners-title" className={styles.h1}>Your clients need websites. I can build them.</h1>
          <p className={styles.sub}>I work with professionals whose clients need a website, so you can say yes to the project without doing the development yourself. Refer the client to me, or have me build behind your brand.</p>
          <div className={styles.actions}>
            <a className="btn" href="#partner-form" data-track="cta" data-location="partners-hero">Explore a partnership</a>
            <a className="btn btn-secondary" href="#work">View my work</a>
          </div>
          <p className={styles.trust}><b>Kyle Stringham</b> · {site.legalName} · {site.city}, {site.regionLong}</p>
        </div>
      </section>

      {/* 2. Two ways to partner */}
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
          <p className={styles.note}>Referral reward amounts and partner pricing are set in a short written agreement before your first project. They&rsquo;re not published here yet.</p>
        </div>
      </section>

      {/* 3. Why work with me */}
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

      {/* 4. Selected work */}
      <section className={styles.section} id="work" aria-labelledby="work-title">
        <div className="container">
          <div className={styles.head}>
            <h2 id="work-title" className={styles.h2}>Selected work</h2>
            <p className={styles.lede}>Stringham Web Design is a new studio, and I haven&rsquo;t delivered a paid client website yet. Here&rsquo;s what I have built, each labeled for exactly what it is.</p>
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
          <ol className={styles.work}>
            {partnerWork.map((w, i) => <Project key={w.key} w={w} index={i} featured={i === 0} />)}
          </ol>
        </div>
      </section>

      {/* Founder */}
      <section className={`${styles.section} ${styles.alt}`} id="founder" aria-labelledby="founder-title">
        <div className="container">
          <Founder />
        </div>
      </section>

      {/* 5. How it works */}
      <section className={styles.section} id="process" aria-labelledby="process-title">
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
      <section className={`${styles.section} ${styles.alt}`} id="partner-questions" aria-labelledby="pq-title">
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
      <section className={styles.section} id="partner-form" aria-labelledby="pf-title">
        <div className={`container ${styles.formGrid}`}>
          <div className={styles.formSide}>
            <h2 id="pf-title" className={styles.h2}>Explore a partnership</h2>
            <p className={styles.lede}><b>What happens next:</b> I&rsquo;ll reply within two business days to set up a short call. No cost and no commitment.</p>
            <p className={styles.body}>Own a business yourself? The <a className="u" href="/#free-check">free listing check</a> is the place to start.</p>
          </div>
          <PartnerForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
        </div>
      </section>
    </>
  );
}

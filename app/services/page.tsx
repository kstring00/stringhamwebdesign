import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { cta } from "../data/nav";
import { services } from "../data/services";
import ClosingCta from "../home/ClosingCta";
import Illustration from "../motifs/Illustrations";
import Magnetic from "../motion/Magnetic";
import shared from "../pages.module.css";
import styles from "./services.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Websites, Online Ordering, Booking & Payments | Stringham Web Design",
  description: "Everything your idea needs, in one place: a website designed from scratch, online ordering, booking and payments that connect to Clover, Toast, Square or Stripe, Google Business Profile, an email and text list, brand basics, and an optional care plan. League City, Texas.",
  path: "/services",
});

function Arrow() {
  return <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function ServicesPage() {
  return (
    <>
      <div className={`container ${shared.page}`}>
        <header className={shared.head}>
          <p className={`label ${shared.headLabel}`}><b>01</b> Services</p>
          <h1 className="display-l">Everything your idea needs, in one place.</h1>
          <p className={`lede ${shared.lede}`}>Six things every business needs to launch and grow. Take the ones you need now; the rest can come later.</p>
        </header>

        <nav className={styles.jump} aria-label="On this page">
          <ol>
            {services.map((s) => <li key={s.slug}><a className="u" href={`#${s.slug}`}><b>{s.n}</b> {s.title.replace(/\.$/, "")}</a></li>)}
          </ol>
        </nav>

        {services.map((s, i) => (
          <section className={`${styles.service} ${i % 2 ? styles.flip : ""}`} id={s.slug} key={s.slug} aria-labelledby={`${s.slug}-title`}>
            <div className={styles.text}>
              <p className="label"><b>{String(i + 2).padStart(2, "0")}</b> {s.title.replace(/\.$/, "")}</p>
              <h2 id={`${s.slug}-title`} className={`display-m ${styles.serviceTitle}`}>{s.title}</h2>
              <p className={styles.short} data-reveal>{s.short}</p>
              <p className={styles.long} data-reveal>{s.long}</p>
            </div>
            <figure className={styles.art}>
              <Illustration name={s.slug} />
            </figure>
          </section>
        ))}

        <section className={styles.specialties} id="specialties" aria-labelledby="spec-title">
          <div className={shared.sectionHead}>
            <p className="label"><b>08</b> Specialties</p>
            <h2 id="spec-title" className="display-l">Two kinds of places I know from the inside.</h2>
          </div>
          <div className={styles.specGrid}>
            <div className={styles.spec} data-reveal>
              <h3>For coffee shops</h3>
              <p>I&rsquo;ve worked the bar, so I build for the morning rush.</p>
              <ul>
                <li>Order-ahead that connects to your POS, so tickets land where your baristas already look.</li>
                <li>Events and seasonal drops, announced in a minute and gone when they&rsquo;re gone.</li>
                <li>A list for your regulars: email or text, for the people who come back.</li>
              </ul>
            </div>
            <div className={styles.spec} data-reveal>
              <h3>For ABA and pediatric clinics</h3>
              <p>I work in one as a Registered Behavior Technician, so I build for the families and the team.</p>
              <ul>
                <li>The <a className="u" href="/family-resource-hub">Family Resource Hub</a>: parent support on your site, under your name and colors, free to every family you serve.</li>
                <li>Clinic websites with a careers page built for hiring RBTs and BCBAs, because the right hire matters as much as the right family.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.next} aria-label="Next step">
          <p className={styles.nextLine}>Not sure which of these you need? That&rsquo;s what the first call is for.</p>
          <div className={shared.actions}>
            <Magnetic><a className="btn" href={cta.href} data-cursor="grow">{cta.label} <Arrow /></a></Magnetic>
          </div>
        </section>
      </div>
      <ClosingCta />
    </>
  );
}

import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { locationLine, site } from "../data/site";
import styles from "../pages.module.css";
import ContactForm from "./ContactForm";
import local from "./contact.module.css";

export const metadata: Metadata = pageMeta({ title: "Start a Project | Web Design in League City, TX", description: "Tell Kyle Stringham about your business. A free 30-minute call, then a fixed-price quote in writing for a custom website, redesign, or a Family Resource Hub for your clinic. League City, Texas.", path: "/contact" });

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ about?: string; sent?: string; error?: string }> }) {
  const { about, sent, error } = await searchParams;
  return (
    <div className={`container ${styles.page} ${local.page}`}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}><b>01</b> Contact</p>
        <h1 className="display-l">Tell me about your business.</h1>
        <p className={local.reply}>I reply within one business day.</p>
        <p className={`lede ${styles.lede}`}>A free 30-minute call comes first, then a fixed-price quote in writing.</p>
      </header>
      <section className={`${styles.section} ${styles.two}`} aria-label="Get in touch">
        <div className={local.direct}>
          <p className="label"><b>02</b> Direct</p>
          <a className={local.big} href={`mailto:${site.email}`}>{site.email}</a>
          <a className={local.big} href={site.phoneHref} aria-label={`Call Kyle at ${site.phone}`}>{site.phone}</a>
          {site.bookingUrl ? (
            <a className={`btn btn-secondary ${local.book}`} href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Book the free 30-minute call</a>
          ) : null}
          <p className={local.where}>{locationLine}</p>
        </div>
        <ContactForm initialNeed={({ hub: "Family Resource Hub", clinic: "Autism clinic website", coffee: "Coffee shop website" } as const)[about as "hub" | "clinic" | "coffee"] ?? ""} sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
      </section>
    </div>
  );
}

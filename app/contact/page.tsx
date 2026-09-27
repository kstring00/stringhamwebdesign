import type { Metadata } from "next";

import { locationLine, site } from "../data/site";
import styles from "../pages.module.css";
import ContactForm from "./ContactForm";
import local from "./contact.module.css";

export const metadata: Metadata = {
  title: "Start a Project | Web Design in League City, TX",
  description: "Tell Kyle Stringham about your business. A free 30-minute call, then a fixed-price quote in writing for a custom website, redesign, or a Family Resource Hub for your clinic. League City, Texas.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ about?: string }> }) {
  const { about } = await searchParams;
  return (
    <div className={`container ${styles.page} ${local.page}`}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}><b>01</b> Contact</p>
        <h1 className="display-l">Tell me about your business.</h1>
        <p className={`lede ${styles.lede}`}>A free 30-minute call comes first, then a fixed-price quote in writing.</p>
      </header>
      <section className={`${styles.section} ${styles.two}`} aria-label="Get in touch">
        <div className={local.direct}>
          <p className="label"><b>02</b> Direct</p>
          <a className={local.big} href={`mailto:${site.email}`}>{site.email}</a>
          <a className={local.big} href={site.phoneHref}>{site.phone}</a>
          <p className={local.where}>{locationLine}</p>
        </div>
        <ContactForm initialNeed={about === "hub" ? "Family Resource Hub for my clinic" : ""} />
      </section>
    </div>
  );
}

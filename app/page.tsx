import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import { site } from "./data/site";
import AboutFaq from "./home/AboutFaq";
import Hero from "./home/Hero";
import Pricing from "./home/Pricing";
import QuoteForm from "./home/QuoteForm";
import WorkRow from "./home/WorkRow";
import s from "./home/home.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Web Design for Therapists & Mental Health Practices | Stringham Web Design",
  description: "Custom websites from $300 for therapists, counselors and mental-health practices. Thoughtfully designed, clear upfront pricing and a free homepage demo. Based in League City, Texas.",
  path: "/",
});

export default async function Home({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; checkup?: string }> }) {
  const { sent, error, checkup } = await searchParams;
  return (
    <>
      {/* 1. The first screen: what, for whom, the next step. */}
      <Hero />

      {/* 2. Proof: the three real projects, as a still row, each labeled for what it is. */}
      <WorkRow />

      {/* 3. The price, what's in it, who runs it after, and the Google path. */}
      <Pricing />


      {/* 4. Who you'd work with, and the questions that come up. */}
      <AboutFaq />

      {/* 5. The close: a free homepage demo, with a fixed written quote. */}
      <section className={s.quote} id="quote" aria-labelledby="quote-title">
        <div className={`container ${s.quoteGrid}`}>
          <div className={s.quoteSide}>
            <p className={s.chipOnInk}>Free homepage demo</p>
            <h2 id="quote-title" className={s.h2}>See your practice&rsquo;s new homepage before you pay a dollar.</h2>
            <p className={s.quoteLede}>Tell me about your practice. I reply within 24 hours, and if it&rsquo;s a fit you get a demo of your homepage, built for you, with a fixed written quote. No obligation.</p>
            <p className={s.quoteContact}>Rather talk? <a className="u" href={site.phoneHref}>Call {site.phone}</a> or <a className="u" href={site.smsHref}>text me</a>.</p>
          </div>
          <QuoteForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} checkup={typeof checkup === "string" && checkup.startsWith("Website Checkup:") ? checkup.slice(0, 600) : ""} />
        </div>
      </section>

      <BusinessJsonLd />
    </>
  );
}

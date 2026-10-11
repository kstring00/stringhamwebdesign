import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import { site } from "./data/site";
import { showcaseWork } from "./data/work";
import Coverflow from "./components/Coverflow";
import AboutFaq from "./home/AboutFaq";
import Hero from "./home/Hero";
import Pricing from "./home/Pricing";
import QuoteForm from "./home/QuoteForm";
import s from "./home/home.module.css";
// import Testimonials from "./home/Testimonials";

export const metadata: Metadata = pageMeta({
  absolute: "Web Design in League City, TX | Stringham Web Design",
  description: "Custom websites for owner-run businesses in League City, Texas, from $2,000 with a fixed written quote and a free demo of your homepage. No ad spend, no contract. Website Care from $125 a month.",
  path: "/",
});

export default async function Home({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <>
      {/* 1. The first screen: what, for whom, where, the next step. */}
      <Hero />

      {/* 2. Proof: every project, labeled for what it is, the same as on /partners. */}
      <section className={`${s.section} ${s.workSection}`} id="work" aria-labelledby="work-title">
        <div className="container">
          <div className={s.head}>
            <h2 id="work-title" className={s.h2} data-reveal>Work you can click through.</h2>
            <p className={s.lede}>A live product and three design demos, each labeled for exactly what it is. Drag, swipe or tap through; the full write-ups are on the <a className={`u ${s.inlineLink}`} href="/work">work page</a>.</p>
          </div>
          <Coverflow items={showcaseWork} label="Selected work" />
        </div>
      </section>

      {/* 3. The price, what's in it, who runs it after, and the Google path. */}
      <Pricing />

      {/* Testimonials: none with written permission yet, so nothing is shown.
          When there are, uncomment the import above and this line:
          <Testimonials items={[{ quote: "…", name: "…", business: "…" }]} /> */}

      {/* 4. Who you'd work with, and the questions that come up. */}
      <AboutFaq />

      {/* 5. The close: a quote and a free demo. */}
      <section className={s.quote} id="quote" aria-labelledby="quote-title">
        <div className={`container ${s.quoteGrid}`}>
          <div className={s.quoteSide}>
            <p className={s.chipOnInk}>Quote + free demo</p>
            <h2 id="quote-title" className={s.h2}>See your new site before you pay a dollar.</h2>
            <p className={s.quoteLede}>Tell me about your business. I reply within 24 hours, and if it&rsquo;s a fit you get a fixed written quote plus a demo of your homepage, built for you. No obligation.</p>
            <p className={s.quoteContact}>Rather talk? <a className="u" href={site.phoneHref}>Call {site.phone}</a> or <a className="u" href={site.smsHref}>text me</a>.</p>
          </div>
          <QuoteForm sent={sent === "1"} errorCode={typeof error === "string" ? error : ""} />
        </div>
      </section>

      <BusinessJsonLd />
    </>
  );
}

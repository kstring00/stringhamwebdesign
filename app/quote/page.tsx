import type { Metadata } from "next";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import { pricingSummary } from "../data/pricing";
import QuoteForm from "./QuoteForm";
import styles from "./quote.module.css";

export const metadata: Metadata = {
  title: "Start a project — Get a Website Quote · Kyle Stringham, League City TX",
  description:
    "Seven questions about your business and what you need the site to do. About five minutes, a reply within one business day, then a free consultation and a fixed price in writing. Custom web design for League City and Houston-area businesses.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={styles.eyebrow} data-hero>Project intake</p>
            <h1 data-hero>Tell me what you&apos;re building.</h1>
            <p className={styles.lede} data-hero>
              Seven questions, one at a time. About five minutes. You don&apos;t
              need to know what you want built — that&apos;s my job. You just
              need to know what&apos;s not working now.
            </p>

            <dl className={styles.facts} data-reveal-group>
              <div>
                <dt>Reply</dt>
                <dd>Within one business day, with a link to book a call.</dd>
              </div>
              <div>
                <dt>Cost</dt>
                <dd>{pricingSummary}</dd>
              </div>
              <div>
                <dt>Obligation</dt>
                <dd>None. If I&apos;m not the right fit I&apos;ll say so.</dd>
              </div>
            </dl>
          </div>

          <div data-hero="media">
            <QuoteForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

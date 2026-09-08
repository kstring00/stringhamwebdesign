import type { Metadata } from "next";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import QuoteForm from "./QuoteForm";
import styles from "./quote.module.css";

export const metadata: Metadata = {
  title: "Start a quote — Kyle Stringham",
  description:
    "Seven questions about your business and what you need the site to do. Takes about five minutes.",
};

export default function QuotePage() {
  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Project intake</p>
            <h1>Tell me what you&apos;re building.</h1>
            <p className={styles.lede}>
              Seven questions, one at a time. About five minutes. You don&apos;t
              need to know what you want built — that&apos;s my job. You just
              need to know what&apos;s not working now.
            </p>

            <dl className={styles.facts}>
              <div>
                <dt>Reply</dt>
                <dd>Within one business day, with a link to book a call.</dd>
              </div>
              <div>
                <dt>Cost</dt>
                <dd>Nothing here is priced. Scope comes first, on the call.</dd>
              </div>
              <div>
                <dt>Obligation</dt>
                <dd>None. If I&apos;m not the right fit I&apos;ll say so.</dd>
              </div>
            </dl>
          </div>

          <QuoteForm />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

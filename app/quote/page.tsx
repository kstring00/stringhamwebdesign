import type { Metadata } from "next";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import { isPackageId, startingLine } from "../data/pricing";
import QuoteForm from "./QuoteForm";
import styles from "./quote.module.css";

export const metadata: Metadata = {
  title: "Start a quote — Kyle Stringham",
  description:
    "Seven questions about your business and what you need the site to do. Takes about five minutes.",
};

/**
 * ?package=standard arrives from a tier's "Get started" button on /pricing.
 * It is read and validated here, on the server, so the form renders with the
 * tier already chosen in its first paint — the note above the field never
 * appears after hydration, so it cannot shift anything. Anything unrecognised
 * is dropped and the brief opens with the choice unmade.
 */
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = Array.isArray(params.package) ? params.package[0] : params.package;
  const initialPackage = isPackageId(requested) ? requested : "";

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
                <dd>{startingLine} The exact number comes after we talk.</dd>
              </div>
              <div>
                <dt>Obligation</dt>
                <dd>None. If I&apos;m not the right fit I&apos;ll say so.</dd>
              </div>
            </dl>
          </div>

          <div data-hero="media">
            <QuoteForm initialPackage={initialPackage} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

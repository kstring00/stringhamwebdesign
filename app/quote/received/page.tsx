import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import Header from "../../Header";
import ProcessSteps from "../../ProcessSteps";
import SiteFooter from "../../SiteFooter";
import {
  QUOTE_FIELD_LABELS,
  QUOTE_FIELD_ORDER,
  RECEIPT_COOKIE,
  decodeReceipt,
} from "../../lib/quoteReceipt";
import styles from "./received.module.css";

export const metadata: Metadata = {
  title: "Brief received — Kyle Stringham",
  robots: { index: false, follow: false },
};

/** The receipt lives in a per-request cookie, so this can never be static. */
export const dynamic = "force-dynamic";

const CONTACT_EMAIL = "kyle@stringhamwebdesign.com";

export default async function QuoteReceivedPage() {
  const store = await cookies();
  const receipt = decodeReceipt(store.get(RECEIPT_COOKIE)?.value);

  // Someone reached this page without submitting, or the receipt expired.
  if (!receipt) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <div className={styles.shell}>
            <p className={styles.eyebrow}>No brief on file</p>
            <h1 className={styles.emptyHeading}>
              There&apos;s nothing to confirm here.
            </h1>
            <p className={styles.lede}>
              This page shows a receipt right after you send a brief. If you
              already sent one, the confirmation is in your email — that copy is
              the one worth keeping. If you haven&apos;t sent one yet, start
              here.
            </p>
            <Link className={styles.primaryAction} href="/quote">
              Start a brief <span aria-hidden="true">→</span>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const answered = QUOTE_FIELD_ORDER.filter((field) => receipt.answers[field]);

  return (
    <>
      <Header />

      <main className={styles.page}>
        {/* 1. It went through. */}
        <section className={styles.confirmation} aria-labelledby="received-heading">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>Signal received</p>
            <h1 id="received-heading">It went through.</h1>

            <div className={styles.referenceRow}>
              <div>
                <span className={styles.metaLabel}>Reference</span>
                <strong className={styles.reference}>{receipt.reference}</strong>
              </div>
              <div>
                <span className={styles.metaLabel}>Reply by</span>
                {/* Computed on the server from the submission time, against
                    US federal holidays. See lib/businessDays.ts. */}
                <strong className={styles.replyDate}>
                  <time dateTime={receipt.replyByIso}>{receipt.replyByLabel}</time>
                </strong>
              </div>
            </div>

            {/* 2. When they hear back. */}
            <p className={styles.promise}>
              I&apos;ll reply by{" "}
              <strong>{receipt.replyByLabel}</strong>, and my reply will have a
              link to book a call. A copy of all of this is in your inbox now —
              that&apos;s the one to keep, and the one to forward if someone
              else needs to see it.
            </p>

            {/* 1b. Echo their answers back. */}
            <div className={styles.echo}>
              <h2 className={styles.echoHeading}>What you sent me</h2>
              <dl className={styles.echoList}>
                {answered.map((field) => (
                  <div className={styles.echoRow} key={field}>
                    <dt>{QUOTE_FIELD_LABELS[field]}</dt>
                    <dd>{receipt.answers[field]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 3. What happens next. */}
        <ProcessSteps
          heading="What happens next."
          id="what-happens-next"
          initialOpen={1}
        />

        {/* 4. One next action, and only one. */}
        <section className={styles.nextAction} aria-labelledby="next-action-heading">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>One thing, if you need it</p>
            <h2 id="next-action-heading">Forgot something?</h2>
            <p className={styles.lede}>
              Reply to the confirmation email. It lands in the same thread as
              your brief, so nothing gets separated from reference{" "}
              {receipt.reference}.
            </p>
            <p className={styles.footnote}>
              There&apos;s nothing to book yet — the call link comes with my
              reply, once I&apos;ve read what you sent.
            </p>

            <a
              className={styles.primaryAction}
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                `${receipt.reference} — one more thing`,
              )}`}
            >
              Reply to the confirmation <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

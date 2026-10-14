import fs from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import { marked } from "marked";

import { pageMeta } from "../../data/meta";
import styles from "../../pages.module.css";
import local from "../../privacy/privacy.module.css";
import s from "./terms.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Referral Partner Terms | Stringham Web Design",
  description: "The plain-language rules for referral partners: 20% of the website build price, paid within 14 days after the client pays in full; always disclose the fee; no spam.",
  path: "/partners/terms",
});

/** The partner terms, from content/partner-terms.md. */
function doc() {
  const raw = fs.readFileSync(path.join(process.cwd(), "content", "partner-terms.md"), "utf8").replace(/\r\n/g, "\n");
  const title = raw.match(/^#\s+(.+?)\s*$/m)?.[1] ?? "Referral partner terms";
  const html = (marked.parse(raw.replace(/^#\s+.+\n/m, "").trim(), { async: false, gfm: true }) as string)
    .replace(/<a href="http/g, '<a target="_blank" rel="noopener noreferrer" href="http');
  return { title, html };
}

export default function PartnerTermsPage() {
  const { title, html } = doc();
  return (
    <div className={`container ${styles.page}`} style={{ paddingBottom: "var(--section)" }}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}><b>02</b> Partners</p>
        <h1 className="display-l">{title}</h1>
        <p className={`lede ${styles.lede}`}>Plain language, about a three-minute read.</p>
      </header>
      <div className={`${local.prose} ${s.body}`} dangerouslySetInnerHTML={{ __html: html }} />
      <p className={s.cta}><a className="btn" href="/partners/join">Get your referral link</a> <a className="u" href="/partners#referrals">Back to referrals</a></p>
    </div>
  );
}

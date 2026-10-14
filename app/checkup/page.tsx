import type { Metadata } from "next";

import { CheckupJsonLd } from "../components/JsonLd";
import { pageMeta } from "../data/meta";
import Checkup from "./Checkup";
import { QUESTIONS } from "./data";
import s from "./page.module.css";

const DESCRIPTION = "Answer 10 quick questions and see where your website loses customers, with a score, a fix for each leak, and an estimate of what fixing it could mean. Free, no email needed.";

export const metadata: Metadata = pageMeta({
  absolute: "Free Website Checkup | Stringham Web Design",
  description: DESCRIPTION,
  path: "/checkup",
  image: "/checkup/opengraph-image",
  imageAlt: "Free Website Checkup: a phone wireframe with its parts being checked, from Stringham Web Design",
});

/**
 * /checkup: the Free Website Checkup. The tool itself (intro, bench,
 * report) is one client component, server-rendered with the first
 * question showing. Under it, every question and its hint as plain HTML,
 * so the page reads (and indexes) in full without JavaScript, and works as
 * a self-check on paper.
 */
export default function CheckupPage() {
  return (
    <>
      <div className="container">
        <Checkup />
      </div>

      <section className={s.all} aria-labelledby="all-title" data-print-hide>
        <div className="container">
          <details className={s.details}>
            <summary><h2 id="all-title" className={s.title}>All 10 questions, on one page</h2></summary>
            <ol className={s.list}>
              {QUESTIONS.map((q) => (
                <li key={q.z}>
                  <p className={s.zone}>{q.zone}</p>
                  <p className={s.q}>{q.q}</p>
                  {q.help ? <p className={s.help}>{q.help}</p> : null}
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>

      <CheckupJsonLd description={DESCRIPTION} />
    </>
  );
}

import type { Metadata } from "next";

import { pageMeta } from "../../data/meta";
import { referral } from "../../data/referral";
import home from "../../home/home.module.css";
import JoinForm from "./JoinForm";
import s from "./join.module.css";

export const metadata: Metadata = pageMeta({
  absolute: "Become a Referral Partner | Stringham Web Design",
  description: `Share the free Website Checkup with business owners you know. If one hires me for a website, I pay you ${referral.percent} of the build price within 14 days after they pay in full.`,
  path: "/partners/join",
});

/** The share-and-earn signup: what it is in three lines, the form, and the terms link. */
export default function JoinPage() {
  return (
    <section className={s.page} aria-labelledby="join-title">
      <div className={`container ${s.grid}`}>
        <div className={s.side}>
          <p className={home.chip}>Referral partners</p>
          <h1 id="join-title" className={s.h1}>Share the free checkup. Earn {referral.percent} when they hire me.</h1>
          <ol className={s.steps}>
            <li><b>Get your link.</b> It takes a minute. Your code is all that goes in the link.</li>
            <li><b>Share it with business owners you know,</b> and say you earn a referral fee.</li>
            <li><b>They run the free checkup or ask for a quote.</b> I see it came from you.</li>
            <li><b>If they hire me,</b> you get {referral.percent} of the website build price ({referral.example.reward} on a {referral.example.price} site), paid within 14 days after they pay in full.</li>
          </ol>
          <p className={s.fine}>Website Care, the Listing Fix and other add-ons don&rsquo;t count. The full rules are short: <a className="u" href="/partners/terms">partner terms</a>.</p>
        </div>
        <div className={s.card}>
          <JoinForm />
        </div>
      </div>
    </section>
  );
}

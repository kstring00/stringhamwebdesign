import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { cta } from "../data/nav";
import { ownership } from "../data/ownership";
import home from "../home/home.module.css";
import s from "./ownership.module.css";

export const metadata: Metadata = pageMeta({
  title: "Ownership: Your Website Is Yours",
  description: "Your domain, hosting and code sit in accounts in your practice's name, with your designer as a guest you can remove. At launch you get an owner's manual, recorded walkthroughs, a live training session and a running-costs sheet.",
  path: "/owner-handoff",
});

/**
 * /owner-handoff ("Ownership" in the nav): the practice owns its site and
 * can run it without Kyle. What sits in its name, what it is handed at
 * launch and how far each part goes, what ownership can and can't cover,
 * what running the site costs, and one quiet line about Website Care.
 * The words are in app/data/ownership.ts and match the Service Terms.
 */
export default function OwnershipPage() {
  return (
    <>
      <section className={s.hero} aria-labelledby="own-title">
        <div className="container">
          <p className={home.chip}>Ownership</p>
          <h1 id="own-title" className={s.h1}>{ownership.title}</h1>
          <p className={home.lede}>{ownership.lede}</p>
          <div className={home.actions}>
            <a className="btn" href={cta.href} data-track="cta" data-location="ownership-hero" data-hero-cta data-magnetic>{cta.label}</a>
            <a className={`u ${home.textLink}`} href="/#pricing">See pricing</a>
          </div>
        </div>
      </section>

      <section className={`${home.section} ${home.alt}`} aria-labelledby="accounts-title">
        <div className="container">
          <h2 id="accounts-title" className={home.h2}>In your name from day one</h2>
          <ul className={s.accounts}>
            {ownership.accounts.map((a) => (
              <li key={a.name} className={s.account}>
                <h3 className={s.cardName}>{a.name}</h3>
                <p className={s.what}>{a.what}</p>
                <p><b>Yours:</b> {a.yours}</p>
                <p className={s.guest}><b>Me:</b> {a.guest}</p>
              </li>
            ))}
          </ul>
          <p className={s.guestLine}>{ownership.guestLine}</p>
        </div>
      </section>

      <section className={home.section} aria-labelledby="handoff-title">
        <div className={`container ${s.split}`}>
          <div className={s.splitHead}>
            <h2 id="handoff-title" className={home.h2}>What I hand you at launch</h2>
            <p className={s.note}>Included with every website. {ownership.after}</p>
          </div>
          <ol className={s.handoff}>
            {ownership.handoff.map((h, i) => (
              <li key={h.name}>
                <span className={s.n} aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className={s.itemName}>{h.name}</h3>
                  <p>{h.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${home.section} ${home.alt}`} aria-labelledby="covers-title">
        <div className="container">
          <h2 id="covers-title" className={home.h2}>What ownership covers, and what it can&rsquo;t</h2>
          <div className={s.covers}>
            <div className={s.cover}>
              <h3 className={s.cardName}>Yours, once the site is paid in full</h3>
              <ul className={home.planLines}>{ownership.yours.map((y) => <li key={y}>{y}</li>)}</ul>
            </div>
            <div className={s.cover}>
              <h3 className={s.cardName}>Licensed from someone else</h3>
              <p>{ownership.licensed}</p>
              <p>{ownership.tools}</p>
            </div>
            <div className={s.cover}>
              <h3 className={s.cardName}>What it costs to run</h3>
              <p>{ownership.costs}</p>
            </div>
          </div>
          <p className={s.terms}>The same promises, in full: <a className={`u ${home.inlineLink}`} href="/terms#website">Service Terms</a>.</p>
        </div>
      </section>

      <section className={home.section} aria-labelledby="care-title">
        <div className={`container ${s.care}`}>
          <h2 id="care-title" className={s.careLine}>{ownership.care}</h2>
          <p className={s.note}>Website Care is optional and month to month. <a className={`u ${home.inlineLink}`} href="/#pricing">What it includes</a></p>
          <div className={home.actions}>
            <a className="btn" href={cta.href} data-track="cta" data-location="ownership-foot">{cta.label}</a>
            <a className={`u ${home.textLink}`} href="/checkup" data-track="cta" data-location="ownership-checkup">Or run the free website checkup</a>
          </div>
        </div>
      </section>
    </>
  );
}

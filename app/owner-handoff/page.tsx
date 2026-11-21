import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { cta } from "../data/nav";
import { type Ease, ownership } from "../data/ownership";
import home from "../home/home.module.css";
import s from "./ownership.module.css";

export const metadata: Metadata = pageMeta({
  title: "Ownership: Your Website Is Yours",
  description: "For every site I build, the domain, hosting and code accounts are in your practice's name, with me as a helper you can remove. See how the handoff works step by step, what you're handed at launch, and what running the site costs.",
  path: "/owner-handoff",
});

/** The four ease labels, each with its own tint. The words carry the meaning; the color only helps the eye. */
const EASE: Record<Ease, string> = {
  "Nothing for you to do": s.easeNone,
  "Easy": s.easeEasy,
  "Takes some learning": s.easeLearn,
  "Hard": s.easeHard,
};

/**
 * /owner-handoff ("Handoff" in the nav): the practice owns its site and
 * can run it without Kyle. What sits in its name; what it is handed at
 * launch and how far each part goes; how the whole handoff works, step by
 * step, with an honest ease label on each; what ownership can and can't
 * cover and what running the site costs; and one quiet line about Website
 * Care. The words are in app/data/ownership.ts and match the Service Terms.
 */
export default function OwnershipPage() {
  return (
    <>
      <section className={s.hero} aria-labelledby="own-title">
        <div className="container">
          <p className={home.chip}>Handoff</p>
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
          <h2 id="accounts-title" className={home.h2}>Every account in your name</h2>
          <ul className={s.accounts}>
            {ownership.accounts.map((a) => (
              <li key={a.name} className={s.account}>
                <h3 className={s.cardName}>{a.name}</h3>
                <p className={s.what}>{a.what}</p>
                <p><b>Yours:</b> {a.yours}</p>
                <p className={s.guest}><b>Me:</b> {a.helper}</p>
              </li>
            ))}
          </ul>
          <p className={s.guestLine}>{ownership.helperLine}</p>
          <p className={s.note}>{ownership.transferLine}</p>
        </div>
      </section>

      <section className={home.section} aria-labelledby="handoff-title">
        <div className={`container ${s.split}`}>
          <div className={s.splitHead}>
            <h2 id="handoff-title" className={home.h2}>What I hand you at launch</h2>
            <p className={s.note}>Included with every website.</p>
            <div className={s.after}>
              <h3 className={s.afterTitle}>After launch</h3>
              {ownership.afterLaunch.map((p) => <p key={p}>{p}</p>)}
            </div>
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

      <section className={`${home.section} ${home.alt}`} id="how" aria-labelledby="how-title">
        <div className="container">
          <div className={s.howHead}>
            <h2 id="how-title" className={home.h2}>How the handoff works</h2>
            <p className={home.lede}>Every step, in order, with how hard it is for you. Some of it takes learning, and one part is hard. Better to know now.</p>
          </div>
          <ol className={s.steps}>
            {ownership.steps.map((st, i) => (
              <li key={st.title} className={s.step}>
                <div className={s.stepTop}>
                  <p className={s.when}><span aria-hidden="true">{i + 1}</span> {st.when}</p>
                  <p className={`${s.ease} ${EASE[st.ease]}`}><span className="sr-only">How hard it is for you: </span>{st.ease}</p>
                </div>
                <h3 className={s.stepTitle}>{st.title}</h3>
                <p className={s.stepBody}>{st.body}</p>
                <dl className={s.facts}>
                  <div><dt>Who does it</dt><dd>{st.who}</dd></div>
                  <div><dt>How long</dt><dd>{st.time}</dd></div>
                  <div><dt>What you end up holding</dt><dd>{st.hold}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={home.section} aria-labelledby="covers-title">
        <div className="container">
          <h2 id="covers-title" className={home.h2}>What ownership covers, and what it can&rsquo;t</h2>
          <div className={s.covers}>
            <div className={s.cover}>
              <h3 className={s.cardName}>Yours from day one</h3>
              <ul className={home.planLines}>{ownership.yoursFromDayOne.map((y) => <li key={y}>{y}</li>)}</ul>
            </div>
            <div className={s.cover}>
              <h3 className={s.cardName}>Yours once the site is paid in full</h3>
              <ul className={home.planLines}>{ownership.yoursOncePaid.map((y) => <li key={y}>{y}</li>)}</ul>
            </div>
            <div className={s.cover}>
              <h3 className={s.cardName}>Licensed from someone else</h3>
              <p>{ownership.licensed}</p>
              <p>{ownership.tools}</p>
            </div>
            <div className={s.cover} id="costs">
              <h3 className={s.cardName}>What it costs to run</h3>
              {ownership.costs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </div>
          <p className={s.terms}>The same promises, in full: <a className={`u ${home.inlineLink}`} href="/terms#website">Service Terms</a>.</p>
        </div>
      </section>

      <section className={`${home.section} ${home.alt}`} aria-labelledby="care-title">
        <div className={`container ${s.care}`}>
          <h2 id="care-title" className={s.careLine}>{ownership.care}</h2>
          <p className={s.note}>{ownership.careNote} <a className={`u ${home.inlineLink}`} href="/#care">See what each level includes</a></p>
          <div className={home.actions}>
            <a className="btn" href={cta.href} data-track="cta" data-location="ownership-foot">{cta.label}</a>
            <a className={`u ${home.textLink}`} href="/checkup" data-track="cta" data-location="ownership-checkup">Or run the free website checkup</a>
          </div>
        </div>
      </section>
    </>
  );
}

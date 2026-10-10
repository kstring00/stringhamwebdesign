import { plans, steps } from "../data/offer";
import s from "./home.module.css";

/**
 * Three cards, equal height: the website (start here, with the free demo
 * line first), Website Care, and the Google listing path. Under them, how
 * a project goes in three steps. Every objection that comes up at the
 * price is answered on the card it comes up on.
 */
export default function Pricing() {
  return (
    <section className={`${s.section} ${s.alt}`} id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className={s.head}>
          <h2 id="pricing-title" className={s.h2} data-reveal>Build it once. Let me run it.</h2>
          <p className={s.lede}>Fixed written price before any work starts. No ad spend, no contract. Website Care is month to month. Full details in the <a className={`u ${s.inlineLink}`} href="/terms">Service Terms</a>.</p>
        </div>
        <div className={s.plans} data-reveal-group>
          {plans.map((p) => (
            <article className={`${s.plan} ${p.key === "site" ? s.planStart : ""}`} key={p.key} aria-labelledby={`plan-${p.key}`} data-reveal>
              {"badge" in p && p.badge ? <p className={s.badge}>{p.badge}</p> : null}
              <h3 id={`plan-${p.key}`} className={s.planName}>{p.name}</h3>
              <p className={s.price}><b>{p.price}</b> <span>{p.cadence}</span></p>
              <ul className={s.planLines}>
                {"highlight" in p && p.highlight ? <li className={s.highlight}><span aria-hidden="true">★</span> {p.highlight}</li> : null}
                {p.lines.map((l) => <li key={l}>{l}</li>)}
              </ul>
              <p className={s.planFoot}>{p.foot}</p>
              <a className={`btn ${"secondary" in p.cta && p.cta.secondary ? "btn-secondary" : ""}`} href={p.cta.href} data-track="cta" data-location={`pricing-${p.key}`} data-magnetic={p.key === "site" ? "" : undefined}>{p.cta.label}</a>
              <a className={`u ${s.planTerms}`} href={`/terms${p.terms}`}>Terms</a>
            </article>
          ))}
        </div>
        <ol className={s.steps}>
          {steps.map((st) => (
            <li key={st.n}>
              <span className={s.stepN} aria-hidden="true">{st.n}</span>
              <span><b>{st.title}</b> <span className={s.stepBody}>{st.body}</span></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

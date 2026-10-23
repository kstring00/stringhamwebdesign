import { plans, pricing, steps } from "../data/offer";
import { site } from "../data/site";
import s from "./home.module.css";

/**
 * The second way to a quote, beside the checkup: a booking link when
 * NEXT_PUBLIC_BOOKING_URL is set, otherwise the phone.
 */
export function CallOrBook({ location }: { location: string }) {
  return site.bookingUrl
    ? <a className={`u ${s.textLink}`} href={site.bookingUrl} target="_blank" rel="noopener noreferrer" data-track="cta" data-location={location}>Book a free 30-minute call<span className="sr-only"> (opens in a new tab)</span></a>
    : <a className={`u ${s.textLink}`} href={site.phoneHref} data-track="cta" data-location={location}>Call or text {site.phone}</a>;
}

/**
 * How pricing works (every site quoted after I see what you have, a fixed
 * written quote before anything starts, payment plans, what changes the
 * price; no dollar amounts), with the two ways to a quote: the free
 * checkup, or a call. Then
 * three cards, equal height: the website, Website Care, and the Google
 * listing path; under them, how a project goes in three steps. Every
 * objection that comes up at the price is answered where it comes up.
 */
export default function Pricing() {
  return (
    <section className={`${s.section} ${s.alt}`} id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className={s.head}>
          <h2 id="pricing-title" className={s.h2} data-reveal>Build it once. Let me run it.</h2>
          <p className={s.lede}>{pricing.website} {site.bookingUrl ? pricing.next.booking : pricing.next.phone}</p>
          <div className={s.factors}>
            <p className={s.factorsTitle}>What affects your price</p>
            <ul>{pricing.factors.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
          <div className={s.actions}>
            <a className="btn" href="/checkup" data-track="cta" data-location="pricing-checkup">Run the free checkup</a>
            <CallOrBook location="pricing-call" />
          </div>
          <p className={s.pricingFine}>No ad spend, no contract. Website Care is month to month. Full details in the <a className={`u ${s.inlineLink}`} href="/terms">Service Terms</a>.</p>
        </div>
        <div className={s.plans} data-reveal-group>
          {plans.map((p) => (
            <article className={`${s.plan} ${p.key === "site" ? s.planStart : ""}`} key={p.key} aria-labelledby={`plan-${p.key}`} data-reveal>
              {"badge" in p && p.badge ? <p className={s.badge}>{p.badge}</p> : null}
              <h3 id={`plan-${p.key}`} className={s.planName}>{p.name}</h3>
              <p className={s.price}><b>{p.price}</b>{p.cadence ? <> <span>{p.cadence}</span></> : null}</p>
              {"priceNote" in p && p.priceNote ? <p className={s.priceNote}>{p.priceNote}</p> : null}
              <ul className={s.planLines}>
                {"highlight" in p && p.highlight ? <li className={s.highlight}><span aria-hidden="true">★</span> {p.highlight}</li> : null}
                {p.lines.map((l) => <li key={l}>{l}</li>)}
              </ul>
              <p className={s.planFoot}>{p.foot}</p>
              <a className={`btn ${"secondary" in p.cta && p.cta.secondary ? "btn-secondary" : ""}`} href={p.cta.href} data-track="cta" data-location={`pricing-${p.key}`} data-magnetic={p.key === "site" ? "" : undefined}>{p.cta.label}</a>
              {p.key === "site" ? <CallOrBook location="pricing-site-call" /> : null}
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

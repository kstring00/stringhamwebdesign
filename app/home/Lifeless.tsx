"use client";

import { useEffect, useRef } from "react";

import { findings } from "../data/offer";
import { gsap, prefersReducedMotion } from "../motion/gsap";
import s from "./lifeless.module.css";

/** What a typical small-business site gets wrong, and what changes. Same numbers as the pins. */
const before = [
  "No clear next step.",
  "The phone number is buried in the footer.",
  "It says what the business is, never why to choose it.",
  "It looks like every other template.",
];
const after = [
  "One clear action, right at the top.",
  "Call or text in one tap, where people look first.",
  "A headline that says why you, in a sentence.",
  "Designed for your brand and your customers.",
];

/**
 * Section 2 of the home page: the problem, then the turn. An illustrated
 * site starts grey and lifeless with its problems pinned on it; as the
 * "How I build" text scrolls in, it comes alive: colour, a clear action,
 * the phone number travels from the footer to the top, the wall of text
 * becomes cards, and the red pins turn into green fixes.
 *
 * One CSS variable, --p (0 → 1), drives every change in lifeless.module.css;
 * GSAP only scrubs that number with ScrollTrigger. No pinning: the
 * illustration is CSS-sticky beside the text on desktop. Without JS it
 * shows the finished state; under reduced motion it switches between the
 * two states at the midpoint, without animating.
 */
export default function Lifeless() {
  const scene = useRef<HTMLDivElement>(null);
  const turn = useRef<HTMLDivElement>(null);
  const mock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scene.current;
    if (!el || !turn.current || !mock.current) return;
    const reduced = prefersReducedMotion();
    const mm = gsap.matchMedia();
    const scrub = (trigger: Element, start: string, end: string) => {
      const state = { p: 0 };
      const apply = () => el.style.setProperty("--p", state.p.toFixed(4));
      apply();
      if (reduced) {
        // Same story, no motion: the state flips once, halfway.
        return gsap.timeline({ scrollTrigger: { trigger, start, end, onUpdate: (st) => { state.p = st.progress > 0.5 ? 1 : 0; apply(); } } });
      }
      return gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: 0.6 } }).to(state, { p: 1, ease: "none", duration: 1, onUpdate: apply });
    };
    // Desktop: the illustration is sticky; it turns as "How I build" rises.
    mm.add("(min-width: 64.0625rem)", () => { scrub(turn.current!, "top 92%", "top 30%"); });
    // Phones and tablets: it turns as it crosses the middle of the screen.
    mm.add("(max-width: 64rem)", () => { scrub(mock.current!, "center 62%", "center 28%"); });
    return () => { mm.revert(); el.style.removeProperty("--p"); };
  }, []);

  return (
    <section className={s.section} id="why" aria-labelledby="why-title">
      <div className={`container ${s.scene}`} ref={scene}>
        <div className={s.problem}>
          <p className={s.eyebrow}>The problem</p>
          <h2 id="why-title" className={s.h2}>Most small-business websites are lifeless.</h2>
          <p className={s.lede}>They look fine and do nothing. There&rsquo;s no clear next step, the phone number is buried at the bottom, and the page says what the business is but never why to choose it. Visitors look, shrug and leave.</p>
          <p className={s.point}>A website has one job: get people over the hump, from looking to calling, booking or buying.</p>
        </div>

        <div className={s.stage} ref={mock}>
          <div className={s.sticky}>
            <div className={s.frame}>
              {/* The illustration: decorative; the two lists below say the same in words. */}
              <div className={s.mock} aria-hidden="true">
                <div className={s.chrome}><i /><i /><i /><span>yourbusiness.com</span></div>
                <div className={s.page}>
                  <div className={s.nav}>
                    <span className={s.logo}><b className={s.logoBefore}>LOGO</b><b className={s.logoAfter}><em />Your Business</b></span>
                    <span className={s.links}><i /><i /><i /><i /><i /><i /></span>
                    <span className={s.call}><svg viewBox="0 0 16 16" width="10" height="10"><path d="M4.5 1.5 6 4.6 4.7 6a8 8 0 0 0 5.3 5.3l1.4-1.3 3.1 1.5-.6 2.6a1.5 1.5 0 0 1-1.6 1.1A13 13 0 0 1 .8 3.7 1.5 1.5 0 0 1 1.9 2.1z" fill="currentColor" /></svg>Call or text</span>
                  </div>
                  <div className={s.hero}>
                    <div className={s.copy}>
                      <p className={s.headline}><span className={s.hBefore}>Welcome to our website!</span><span className={s.hAfter}>Same-day repairs. Booked in a minute.</span></p>
                      <span className={s.bar} /><span className={s.bar} /><span className={`${s.bar} ${s.short}`} />
                      <span className={s.cta}>Book a repair</span>
                    </div>
                    <div className={s.photo}><span className={s.photoBefore} /><span className={s.photoAfter}><i /><i /></span></div>
                  </div>
                  <div className={s.body}>
                    <div className={s.wall}>{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>
                    <div className={s.cards}>{[0, 1, 2].map((i) => <span key={i}><i /><b /><b /></span>)}</div>
                  </div>
                  <div className={s.footer}><span /><span /><span /></div>
                </div>
              </div>
              {/* Pins sit outside the greyed page, so their colour reads in both states. */}
              <div className={s.pins} aria-hidden="true">
                {[1, 2, 3, 4].map((n) => <span key={`b${n}`} className={`${s.pin} ${s.pinBefore} ${s[`pb${n}`]}`}>{n}</span>)}
                {[1, 2, 3, 4].map((n) => <span key={`a${n}`} className={`${s.pin} ${s.pinAfter} ${s[`pa${n}`]}`}>{n}</span>)}
              </div>
            </div>
            <div className={s.legends}>
              <ol className={`${s.legend} ${s.legendBefore}`} aria-label="What a lifeless site gets wrong">
                {before.map((t) => <li key={t}>{t}</li>)}
              </ol>
              <ol className={`${s.legend} ${s.legendAfter}`} aria-label="What changes when I build it">
                {after.map((t) => <li key={t}>{t}</li>)}
              </ol>
            </div>
          </div>
        </div>

        <div className={s.turn} ref={turn}>
          <p className={s.eyebrow}>How I build</p>
          <h3 className={s.h2}>Beautiful, and built around your goals.</h3>
          <p className={s.lede}>My sites are designed to look the part, but every choice answers to what your business needs: calls, bookings, orders or requests. The design is there to move people, not to decorate.</p>
          <a className={`u ${s.link}`} href="/websites#website-quote" data-track="cta" data-location="why">Request a website quote <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>

      {/* The listing side of the story: real findings, kept short. */}
      <div className={`container ${s.listing}`}>
        <h3 className={s.listingTitle}>And on Google, it&rsquo;s often worse.</h3>
        <p className={s.listingLede}>What I&rsquo;ve found on real local listings, names left out.</p>
        <ul className={s.findings}>
          {findings.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <a className={`u ${s.link}`} href="#free-check" data-track="cta" data-location="why-listing">Get a free check of yours <span aria-hidden="true">&rarr;</span></a>
      </div>
    </section>
  );
}

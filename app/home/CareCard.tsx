"use client";

import { useId, useState, type MouseEvent } from "react";

import { CARE_DEFAULT, CARE_LEVELS, careCard, careRules, money, type CareKey } from "../data/offer";
import s from "./care.module.css";
import home from "./home.module.css";

/** The event the quote form listens for when a level is added to the quote without leaving the page. */
export const CARE_EVENT = "care-level";

/**
 * The Website Care card: three levels on one slider (a real range input,
 * so arrow keys, a screen reader and a thumb all work). Moving it changes
 * the price and the list in place, and marks what the level adds over the
 * one below. Under the list, what is true at every level. "Add it to your
 * quote" carries the chosen level to the demo form: as a link
 * (/?care=standard#quote) that also works on a fresh load, and without a
 * reload when the form is on this page.
 *
 * Without JavaScript the slider can't work, so it is hidden and all three
 * levels are listed in full (the <noscript> block).
 */
export default function CareCard({ foot, cta, terms, initial }: { foot: string; cta: string; terms: string; initial?: CareKey }) {
  const start = Math.max(0, CARE_LEVELS.findIndex((l) => l.key === (initial ?? CARE_DEFAULT)));
  const [i, setI] = useState(start);
  const level = careCard[i];
  const listId = useId();
  const href = `/?care=${level.key}#quote`;

  function add(e: MouseEvent<HTMLAnchorElement>) {
    const quote = document.getElementById("quote");
    if (!quote) return; // not on the home page: follow the link
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(CARE_EVENT, { detail: level.key }));
    const url = new URL(window.location.href);
    url.searchParams.set("care", level.key);
    url.hash = "quote";
    window.history.replaceState(null, "", url);
    quote.scrollIntoView();
  }

  return (
    <>
      <div className={s.live} data-care-js>
        <p className={home.price}><b>{money(level.price)}</b><span>/month</span></p>
        <p className={s.levelName}>{level.name} level</p>

        <div className={s.slider}>
          <input
            className={s.range}
            type="range"
            min={0}
            max={CARE_LEVELS.length - 1}
            step={1}
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            aria-label="Website Care level"
            aria-valuetext={`${level.name}, ${money(level.price)} a month`}
            aria-controls={listId}
            style={{ "--at": i / (CARE_LEVELS.length - 1) } as React.CSSProperties}
          />
          {/* The stops' names. The range is the control; these are a convenience for a pointer. */}
          <div className={s.stops} aria-hidden="true">
            {CARE_LEVELS.map((l, n) => <span key={l.key} className={n === i ? s.stopOn : undefined} onClick={() => setI(n)}>{l.name}</span>)}
          </div>
        </div>

        <ul className={`${home.planLines} ${s.lines}`} id={listId}>
          {level.below ? <li>{level.below}</li> : null}
          {level.lines.map((l) => (
            <li key={l} className={level.below ? s.added : undefined}>
              {level.below ? <span className={s.addedTag}>Added<span className="sr-only"> at {level.name}:</span></span> : null}
              {l}
            </li>
          ))}
        </ul>
      </div>

      <noscript>
        <style>{"[data-care-js]{display:none!important}"}</style>
        <ul className={s.plain}>
          {careCard.map((l) => (
            <li key={l.key}>
              <b>{l.name}, {money(l.price)} a month</b>
              <ul className={home.planLines}>
                {l.below ? <li>{l.below}</li> : null}
                {l.lines.map((x) => <li key={x}>{x}</li>)}
              </ul>
              <a className={`u ${home.inlineLink}`} href={`/?care=${l.key}#quote`}>Add {l.name} to your quote</a>
            </li>
          ))}
        </ul>
      </noscript>

      <div className={s.rules}>
        <p className={s.rulesTitle}>At every level</p>
        <ul>{careRules.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>

      <p className={home.planFoot}>{foot}</p>
      <a className="btn btn-secondary" href={href} onClick={add} data-track="cta" data-location="pricing-care" data-care={level.key} data-care-js>{cta}</a>
      <a className={`u ${home.planTerms}`} href={`/terms${terms}`}>Terms</a>
    </>
  );
}

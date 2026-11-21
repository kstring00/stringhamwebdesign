import { steps } from "../data/offer";
import Tile from "./Tile";
import s from "./tiles.module.css";

/** Where each piece starts from before it joins: "x,y,turn" (percent of its own size, degrees). */
// They rise from below, so a loose piece never crosses the plans above.
const FROM = ["-20,34,-7", "0,58,4", "20,40,7"];
const FROM_NARROW = ["-4,16,-4", "4,26,3", "-4,36,-3"];

/**
 * How a project goes, as three pieces that join into one: tell me about
 * your practice, get your demo and quote, live and yours. Side by side on a
 * wide screen, stacked on a phone. The words are the steps in
 * app/data/offer.ts, as HTML, in order; the pieces are joined at rest and
 * only come together on scroll when motion is welcome (TileJoin.tsx).
 */
export default function Process() {
  return (
    <ol className={`${s.scene} ${s.process}`} aria-label="How a project goes" data-tile-scene>
      {steps.map((st, i) => (
        <li key={st.n} data-tile data-from={FROM[i]} data-from-narrow={FROM_NARROW[i]} style={{ "--i": i } as React.CSSProperties}>
          <Tile shadow wide={{ w: 400, h: 330, col: i, row: 0, cols: 3, rows: 1, ampX: 56 }} narrow={{ w: 360, h: 240, col: 0, row: i, cols: 1, rows: 3, ampY: 44 }} />
          <div className={s.inner}>
            <span className={s.num} aria-hidden="true">{st.n}</span>
            <div className={s.words}>
              <b>{st.title}</b>
              <span>{st.body}</span>
            </div>
          </div>
        </li>
      ))}
      {/* One line through all three, start to finish: the hero's line, untangled. Drawn once the pieces have met. */}
      <li className={`${s.thread} ${s.wideOnly}`} aria-hidden="true">
        <svg viewBox="0 0 1200 330" preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id="tile-thread" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="1160" y2="0">
              <stop offset="0" stopColor="var(--emerald)" />
              <stop offset="0.52" stopColor="var(--cobalt)" />
              <stop offset="0.7" stopColor="var(--mint)" />
              <stop offset="1" stopColor="var(--mint)" />
            </linearGradient>
          </defs>
          <path d="M42 150 C150 132 250 166 400 148 S640 132 800 150 S1010 166 1146 144" pathLength={1} stroke="url(#tile-thread)" data-draw />
          {/* The end of the line: a round-capped speck of a path, so it stays a circle however the scene is stretched. */}
          <path className={s.dot} d="M1146 144h0.01" data-after />
        </svg>
      </li>
    </ol>
  );
}

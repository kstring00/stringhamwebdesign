import { ownership } from "../data/ownership";
import Tile from "./Tile";
import s from "./tiles.module.css";

/** Each piece comes in from its own corner: "x,y,turn". */
// A short way out from the middle, so a loose piece stays clear of the words around the block.
const FROM = ["-15,-16,-9", "15,-13,8", "-13,18,7", "16,20,-8"];

/**
 * The four things handed over at launch, as four pieces that close into
 * one block with a line drawn around it, labeled "Yours": complete, and in
 * the practice's hands. It is a picture of the list beside it (the names
 * are the list's own), so it is one image to a screen reader.
 */
export default function Yours() {
  return (
    <div className={`${s.scene} ${s.yours}`} role="img" aria-label="The owner’s manual, the recorded walkthroughs, the training session and the running-costs sheet fit together into one block labeled Yours" data-tile-scene>
      {ownership.handoff.map((h, i) => (
        <div key={h.name} data-tile data-from={FROM[i]} style={{ "--c": i % 2, "--r": Math.floor(i / 2) } as React.CSSProperties} aria-hidden="true">
          <Tile shadow wide={{ w: 300, h: 200, col: i % 2, row: Math.floor(i / 2), cols: 2, rows: 2, ampX: 36, ampY: 30 }} narrow={{ w: 180, h: 180, col: i % 2, row: Math.floor(i / 2), cols: 2, rows: 2, r: 20, gap: 6, ampX: 26, ampY: 26 }} />
          <span className={s.label}><i>{i + 1}</i>{h.name}</span>
        </div>
      ))}
      <svg className={`${s.outline} ${s.wideOnly}`} viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="592" height="392" rx="26" pathLength={1} data-draw />
      </svg>
      <svg className={`${s.outline} ${s.narrowOnly}`} viewBox="0 0 360 360" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="354" height="354" rx="20" pathLength={1} data-draw />
      </svg>
      <p className={s.yoursWord} aria-hidden="true" data-after>Yours</p>
    </div>
  );
}

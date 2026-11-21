import { tilePath } from "./shape";
import Tile from "./Tile";
import s from "./tiles.module.css";

/** What a piece can be: the one being asked about, set, half set, or a gap. */
export type PieceState = "" | "now" | "yes" | "kind" | "no" | "unsure";

const STRIP = Array.from({ length: 10 }, (_v, i) => tilePath({ w: 100, h: 26, col: i, row: 0, cols: 10, rows: 1, gap: 5, r: 9, ampX: 13 }));

/**
 * The checkup's progress: ten pieces in a row, one per question. An answer
 * of "yes" or "kind of" sets its piece; "no" and "not sure" leave a gap,
 * outlined. Decoration beside the count ("3 of 10"), so it is hidden from
 * a screen reader.
 */
export function PieceStrip({ states }: { states: PieceState[] }) {
  return (
    <svg className={s.strip} viewBox="0 0 1000 26" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {/* The group places a piece; the path inside it is what moves when the piece is set. */}
      {STRIP.map((d, i) => <g key={i} transform={`translate(${i * 100} 0)`}><path d={d} data-s={states[i] || undefined} /></g>)}
    </svg>
  );
}

const WORD: Record<Exclude<PieceState, "" | "now">, string> = { yes: "Set", kind: "Partly set", no: "Missing", unsure: "Not sure" };

/**
 * The report's board: the same ten pieces, each named for the part of the
 * page it stands for, with its state in words (never by color alone). A gap
 * carries the number of its leak in the list underneath. Five across on a
 * wide screen, two across on a phone.
 */
export function PieceBoard({ pieces }: { pieces: { key: string; name: string; state: Exclude<PieceState, "" | "now">; rank?: number }[] }) {
  return (
    <ol className={`${s.scene} ${s.board}`}>
      {pieces.map((p, i) => (
        <li key={p.key} data-tile data-s={p.state} style={{ "--i": i, "--c": i % 5, "--r": Math.floor(i / 5), "--c2": i % 2, "--r2": Math.floor(i / 2) } as React.CSSProperties}>
          <Tile wide={{ w: 200, h: 150, col: i % 5, row: Math.floor(i / 5), cols: 5, rows: 2, gap: 6, r: 18, ampX: 26, ampY: 22 }} narrow={{ w: 180, h: 90, col: i % 2, row: Math.floor(i / 2), cols: 2, rows: 5, gap: 6, r: 16, ampX: 20, ampY: 18 }} />
          <span className={s.piece}>
            <b>{p.name}</b>
            <span>
              {p.rank ? <i className={s.rank} aria-hidden="true">{p.rank}</i> : null}
              {WORD[p.state]}{p.rank ? <span className="sr-only">, leak {p.rank} below</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

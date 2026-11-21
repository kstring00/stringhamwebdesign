/**
 * The site's tile: a soft interlocking piece. Never the knobbed jigsaw
 * piece; a tile's shared edges are one gentle S-curve, so two neighbours
 * lean into each other. Outer edges are straight, with rounded corners
 * where two outer edges meet.
 *
 * A tile is drawn in its own box, `w` by `h`, as one cell of a `cols` by
 * `rows` block. Every seam is the same curve on both of its sides, shifted
 * by the gap, so any two neighbours fit whatever the grid: three in a row
 * (the process steps), two by two (the handoff block), five by two (the
 * checkup board), ten in a strip (the checkup's progress).
 *
 * Pure geometry, no browser: the paths are made on the server and are in
 * the HTML, so the pieces sit joined with no JavaScript at all.
 */
export type TileCell = {
  /** The tile's box. */
  w: number;
  h: number;
  /** Which cell this is, and the size of the block. */
  col: number;
  row: number;
  cols: number;
  rows: number;
  /** The grout between neighbours. */
  gap?: number;
  /** Corner radius, where two outer edges meet. */
  r?: number;
  /** How far a seam leans, sideways and up-and-down. */
  ampX?: number;
  ampY?: number;
};

const n = (v: number) => Math.round(v * 100) / 100;

export function tilePath({ w, h, col, row, cols, rows, gap = 8, r = 26, ampX = 18, ampY = 14 }: TileCell): string {
  const g = gap / 2;
  const x0 = g, y0 = g, x1 = w - g, y1 = h - g;
  const top = row > 0, right = col < cols - 1, bottom = row < rows - 1, left = col > 0; // true: a seam
  const dx = x1 - x0, dy = y1 - y0;
  // A corner is rounded only where two outer edges meet.
  const tl = !top && !left ? r : 0, tr = !top && !right ? r : 0, br = !bottom && !right ? r : 0, bl = !bottom && !left ? r : 0;
  const d: string[] = [`M${n(x0 + tl)} ${n(y0)}`];
  // top, left to right
  d.push(top ? `C${n(x0 + dx * 0.3)} ${n(y0 + ampY)} ${n(x0 + dx * 0.7)} ${n(y0 - ampY)} ${n(x1)} ${n(y0)}` : `L${n(x1 - tr)} ${n(y0)}`);
  if (tr) d.push(`A${tr} ${tr} 0 0 1 ${n(x1)} ${n(y0 + tr)}`);
  // right, top to bottom
  d.push(right ? `C${n(x1 + ampX)} ${n(y0 + dy * 0.3)} ${n(x1 - ampX)} ${n(y0 + dy * 0.7)} ${n(x1)} ${n(y1)}` : `L${n(x1)} ${n(y1 - br)}`);
  if (br) d.push(`A${br} ${br} 0 0 1 ${n(x1 - br)} ${n(y1)}`);
  // bottom, right to left
  d.push(bottom ? `C${n(x0 + dx * 0.7)} ${n(y1 - ampY)} ${n(x0 + dx * 0.3)} ${n(y1 + ampY)} ${n(x0)} ${n(y1)}` : `L${n(x0 + bl)} ${n(y1)}`);
  if (bl) d.push(`A${bl} ${bl} 0 0 1 ${n(x0)} ${n(y1 - bl)}`);
  // left, bottom to top
  d.push(left ? `C${n(x0 - ampX)} ${n(y0 + dy * 0.7)} ${n(x0 + ampX)} ${n(y0 + dy * 0.3)} ${n(x0)} ${n(y0)}` : `L${n(x0)} ${n(y0 + tl)}`);
  if (tl) d.push(`A${tl} ${tl} 0 0 1 ${n(x0 + tl)} ${n(y0)}`);
  return `${d.join(" ")}Z`;
}

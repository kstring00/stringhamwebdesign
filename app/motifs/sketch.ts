/**
 * Pencil geometry for the sketch-to-real motif. Everything here is
 * deterministic (seeded), so the server and the client draw the same
 * wobble and hydration never complains.
 */

/** Small seeded PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 100) / 100;

/**
 * A hand-drawn line from (x1,y1) to (x2,y2): one gentle bow and a little
 * overshoot at the end, the way a quick pencil stroke lands.
 */
export function roughLine(x1: number, y1: number, x2: number, y2: number, seed = 1, wobble = 1) {
  const r = rng(seed);
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const bow = (r() - 0.5) * wobble * Math.min(6, len * 0.03);
  const over = wobble * (0.5 + r() * 1.2);
  const ex = x2 + (dx / len) * over, ey = y2 + (dy / len) * over;
  const cx = x1 + dx * (0.35 + r() * 0.3) + nx * bow, cy = y1 + dy * (0.35 + r() * 0.3) + ny * bow;
  return `M${f(x1)} ${f(y1)}Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}`;
}

/** A sketched rectangle: four rough strokes whose corners cross slightly. */
export function roughRect(x: number, y: number, w: number, h: number, seed = 1, wobble = 1) {
  const r = rng(seed * 7 + 3);
  const j = () => (r() - 0.5) * wobble * 2;
  const pts = [
    [x + j(), y + j()], [x + w + j(), y + j()], [x + w + j(), y + h + j()], [x + j(), y + h + j()],
  ];
  const ext = wobble * 2;
  return [
    roughLine(pts[0][0] - ext, pts[0][1], pts[1][0], pts[1][1], seed + 1, wobble),
    roughLine(pts[1][0], pts[1][1] - ext, pts[2][0], pts[2][1], seed + 2, wobble),
    roughLine(pts[2][0] + ext, pts[2][1], pts[3][0], pts[3][1], seed + 3, wobble),
    roughLine(pts[3][0], pts[3][1] + ext, pts[0][0], pts[0][1], seed + 4, wobble),
  ].join("");
}

/** A sketched circle: two overlapping arcs, like a pencil going round twice. */
export function roughCircle(cx: number, cy: number, rad: number, seed = 1, wobble = 1) {
  const r = rng(seed * 11 + 5);
  const k = 0.5523 * rad;
  const j = () => (r() - 0.5) * wobble * 1.5;
  const p = (a: number, b: number) => `${f(a)} ${f(b)}`;
  return `M${p(cx, cy - rad + j())}C${p(cx + k, cy - rad + j())} ${p(cx + rad + j(), cy - k)} ${p(cx + rad + j(), cy + j())}C${p(cx + rad + j(), cy + k)} ${p(cx + k, cy + rad + j())} ${p(cx + j(), cy + rad + j())}C${p(cx - k, cy + rad + j())} ${p(cx - rad + j(), cy + k)} ${p(cx - rad + j(), cy + j())}C${p(cx - rad + j(), cy - k)} ${p(cx - k, cy - rad + j())} ${p(cx + wobble * 2, cy - rad + j())}`;
}

/** Quick hatching inside a box: the pencil's way of saying "image here". */
export function hatch(x: number, y: number, w: number, h: number, seed = 1, gap = 14) {
  const r = rng(seed * 13 + 1);
  const out: string[] = [];
  for (let d = gap; d < w + h; d += gap) {
    const x1 = Math.max(x, x + d - h), y1 = Math.min(y + h, y + d);
    const x2 = Math.min(x + w, x + d), y2 = Math.max(y, y + d - w);
    out.push(roughLine(x1, y1, x2, y2, seed + d, 0.6 + r() * 0.4));
  }
  return out.join("");
}

/** A sketched arrow from (x1,y1) to (x2,y2) with a small open head. */
export function roughArrow(x1: number, y1: number, x2: number, y2: number, seed = 1) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const hx = x2 - ux * 9, hy = y2 - uy * 9;
  const nx = -uy * 6, ny = ux * 6;
  return roughLine(x1, y1, x2, y2, seed, 1.4) + `M${f(hx + nx)} ${f(hy + ny)}L${f(x2)} ${f(y2)}L${f(hx - nx)} ${f(hy - ny)}`;
}

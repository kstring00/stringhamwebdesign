"use client";

import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "../motion/gsap";
import styles from "./BuildField.module.css";
import { FRAG, VERT } from "./buildFieldShaders";

/**
 * The hero's Build Field: a halftone dot lattice behind the hero that
 * assembles from the CTA, breathes, follows the cursor and draws a faint
 * website around the hero card. Atmosphere only: text, prices and the
 * CTA never move or change; dots are cleared to near zero behind every
 * [data-field-clear] block (measured, not guessed), and no dot is ever as
 * dark as the button.
 *
 * WebGL2 draws every dot as one gl.POINTS vertex in a single call; the
 * maths lives in the vertex shader. Without WebGL2, or when its context is
 * lost, a Canvas 2D renderer runs the same maths on the CPU and draws in
 * 48 colour × alpha buckets. /?field=2d forces it for comparison.
 *
 * Driven by gsap.ticker (one clock with ScrollTrigger), paused offscreen and
 * on hidden tabs. Reduced motion draws one static frame of the finished state.
 */

// ---------- tunables ----------
const SPACING = 22;              // lattice spacing, px
const SPACING_SMALL = 16;        // under 768 px
const SMALL = 768;               // px
const DESKTOP = 1024;            // 64rem: wireframe from here up
const DPR_MAX = 2;
const DPR_MAX_SMALL = 1.5;
const MAX_DOTS = 9000;
const MAX_ALPHA = 0.7;           // peak dot alpha: the button stays darkest
const BASE_MIX = 0.35;           // base colour = OKLab mix(paper, green, 35%)
const CLEAR_HALO = 56;           // px of soft empty paper around a clear block
const CLEAR_INSET = 6;           // px: the halo starts this far out, so no dot's body overlaps a block
const WIRE_MARGIN = 48;          // browser window, px beyond the card
const WIRE_HALF = 5;             // px: dots within this of a wire line light up
const DENSITY_MIN = 0.25;        // sparse top-left …
const RESIZE_DEBOUNCE = 150;     // ms
const DT_MAX = 50;               // ms: frame time clamp
const SEED = 0x5eed;
const FLOATS = 6;                // per dot: x, y, density, seed, wire, clear

const BUBBLE_LERP = 0.12;        // per 60 fps frame
const BUBBLE_FADE = 600;         // ms in and out
const RIPPLES = 4;
const AMBIENT = [2500, 6000];    // ms between ambient ripples
const AMBIENT_TOUCH = [3000, 6000];
const RIPPLE_SPEED = [240, 420]; // px/s
const RIPPLE_WIDTH = [90, 140];  // px
const RIPPLE_GAIN = [0.75, 1];
const SWEEP_SHARE = 0.25;        // share of ambient ripples that are straight sweeps
const CLICK = { speed: 520, width: 70, gain: 1 };
const PULSE = { speed: 380, width: 60, gain: 0.55, every: 1400 }; // CTA hover / focus

const ASSEMBLE = 1.2 + 0.45;     // s: settle time + the longest delay (matches the shader)
const WIRE_IN = 0.9;             // s
const SEEN_KEY = "swd-field-built";

type Rect = { l: number; t: number; r: number; b: number };
type Seg = [number, number, number, number];
type Lab = [number, number, number];
type Ripple = { on: boolean; x: number; y: number; nx: number; ny: number; sweep: boolean; speed: number; width: number; gain: number; age: number; travel: number };

/** Everything that changes per frame. Allocated once. */
type Frame = {
  t: number; wire: number; fade: number; assemble: number;
  cursor: Float32Array; // x, y, strength, along-axis scale
  dir: Float32Array;    // unit direction of travel
  ripA: Float32Array;   // 4 × (origin x, y, front, width)
  ripB: Float32Array;   // 4 × (gain, sweep flag, normal x, y)
};

// ---------- colour ----------
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** #rgb, #rrggbb or rgb(r g b) → OKLab. */
function toOklab(css: string): Lab | null {
  const s = css.trim();
  let rgb: number[] | null = null;
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  } else {
    const m = s.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (m) rgb = [m[1], m[2], m[3]].map(Number);
  }
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * q,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * q,
  ];
}

/** OKLab → "rgb(r g b)", the same conversion as the shader. */
function labToCss([L, a, b]: Lab) {
  let l = L + 0.3963377774 * a + 0.2158037573 * b, m = L - 0.1055613458 * a - 0.0638541728 * b, s = L - 0.0894841775 * a - 1.291485548 * b;
  l **= 3; m **= 3; s **= 3;
  const c = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
    .map((v) => Math.round(toGamma(Math.min(1, Math.max(0, v))) * 255));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

const mixLab = (a: Lab, b: Lab, t: number): Lab => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---------- maths shared with the shader ----------
const smoothstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);

/** 3D simplex noise: a port of the shader's Ashima/Gustavson snoise (MIT). */
const m289 = (x: number) => x - Math.floor(x / 289) * 289;
const perm = (x: number) => m289((x * 34 + 1) * x);
const NS_X = 2 / 7, NS_Y = 0.5 / 7 - 1;
function snoise(vx: number, vy: number, vz: number) {
  const sk = (vx + vy + vz) / 3;
  let ix = Math.floor(vx + sk), iy = Math.floor(vy + sk), iz = Math.floor(vz + sk);
  const un = (ix + iy + iz) / 6;
  const x0 = vx - ix + un, y0 = vy - iy + un, z0 = vz - iz + un;
  const gx = x0 >= y0 ? 1 : 0, gy = y0 >= z0 ? 1 : 0, gz = z0 >= x0 ? 1 : 0;
  const i1 = [Math.min(gx, 1 - gz), Math.min(gy, 1 - gx), Math.min(gz, 1 - gy)];
  const i2 = [Math.max(gx, 1 - gz), Math.max(gy, 1 - gx), Math.max(gz, 1 - gy)];
  ix = m289(ix); iy = m289(iy); iz = m289(iz);
  let sum = 0;
  for (let k = 0; k < 4; k++) {
    // Corner k: offsets 0, i1, i2, 1; distances x0 - corner + k/6.
    const cx = k === 0 ? 0 : k === 1 ? i1[0] : k === 2 ? i2[0] : 1;
    const cy = k === 0 ? 0 : k === 1 ? i1[1] : k === 2 ? i2[1] : 1;
    const cz = k === 0 ? 0 : k === 1 ? i1[2] : k === 2 ? i2[2] : 1;
    const ex = x0 - cx + k / 6, ey = y0 - cy + k / 6, ez = z0 - cz + k / 6;
    let m = 0.6 - (ex * ex + ey * ey + ez * ez);
    if (m <= 0) continue;
    const p = perm(perm(perm(iz + cz) + iy + cy) + ix + cx);
    const j = p - 49 * Math.floor(p / 49);
    const xg = Math.floor(j / 7), yg = Math.floor(j - 7 * xg);
    let ax = xg * NS_X + NS_Y, ay = yg * NS_X + NS_Y;
    const h = 1 - Math.abs(ax) - Math.abs(ay);
    if (h <= 0) { ax -= Math.floor(ax) * 2 + 1; ay -= Math.floor(ay) * 2 + 1; }
    const n = 1.79284291400159 - 0.85373472095314 * (ax * ax + ay * ay + h * h);
    m *= m;
    sum += m * m * n * (ax * ex + ay * ey + h * ez);
  }
  return 42 * sum;
}

// ---------- geometry ----------
/** Signed distance from a point to a rect: negative inside. */
function rectDist(x: number, y: number, r: Rect) {
  const dx = Math.max(r.l - x, 0, x - r.r);
  const dy = Math.max(r.t - y, 0, y - r.b);
  if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
  return -Math.min(x - r.l, r.r - x, y - r.t, r.b - y);
}

function segDist(x: number, y: number, [ax, ay, bx, by]: Seg) {
  const vx = bx - ax, vy = by - ay;
  const len = vx * vx + vy * vy;
  const t = len ? Math.min(1, Math.max(0, ((x - ax) * vx + (y - ay) * vy) / len)) : 0;
  return Math.hypot(x - ax - vx * t, y - ay - vy * t);
}

/**
 * The browser window drawn around the hero card, snapped to the
 * lattice so every line lands on a row or column of dots: outline, a top
 * bar with three window controls and a nav, and two content blocks whose
 * tops hide behind the card and whose bottoms peek out below it.
 */
function wireframe(card: Rect, s: number, ox: number, oy: number): Seg[] {
  const down = (v: number, o: number) => o + Math.floor((v - o) / s) * s;
  const up = (v: number, o: number) => o + Math.ceil((v - o) / s) * s;
  const L = down(card.l - WIRE_MARGIN, ox);
  const R = up(card.r + WIRE_MARGIN, ox);
  const D = down(card.t - WIRE_MARGIN + 4, oy);       // top bar divider
  const T = D - 2 * s;                                 // window top
  const B = up(card.b + WIRE_MARGIN - 4, oy) + 2 * s;  // window bottom
  const bar = T + s;
  const mid = down((L + R) / 2, ox);
  const segs: Seg[] = [
    [L, T, R, T], [R, T, R, B], [R, B, L, B], [L, B, L, T], [L, D, R, D],
    // window controls
    [L + s, bar, L + s, bar], [L + 2 * s, bar, L + 2 * s, bar], [L + 3 * s, bar, L + 3 * s, bar],
  ];
  // nav: three short links, right-aligned in the bar
  for (let i = 0; i < 3; i++) { const x = R - s - i * 3 * s; segs.push([x - s, bar, x, bar]); }
  // two content blocks, tops hidden behind the card
  const top = up(card.t + s, oy), bot = B - s;
  for (const [a, b] of [[L + s, mid - s], [mid + s, R - s]]) segs.push([a, top, a, bot], [a, bot, b, bot], [b, bot, b, top]);
  return segs;
}

/** Small, fast, seeded PRNG: the same lattice on every load. */
function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

type Layout = { w: number; h: number; dpr: number; count: number; data: Float32Array; cta: [number, number] };

/** Lattice, density, seeds, clear weights and wireframe weights for the hero as it is laid out now. */
function layout(hero: HTMLElement): Layout {
  const box = hero.getBoundingClientRect();
  const w = Math.max(1, Math.round(box.width)), h = Math.max(1, Math.round(box.height));
  const small = w < SMALL;
  const dpr = Math.min(window.devicePixelRatio || 1, small ? DPR_MAX_SMALL : DPR_MAX);
  let s = small ? SPACING_SMALL : SPACING;
  while (Math.floor(w / s) * Math.floor(h / s) > MAX_DOTS) s += 1;
  const cols = Math.floor(w / s), rows = Math.floor(h / s);
  const ox = (w - (cols - 1) * s) / 2, oy = (h - (rows - 1) * s) / 2;

  const rel = (el: Element): Rect => { const r = el.getBoundingClientRect(); return { l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top }; };
  const clears = [...hero.querySelectorAll("[data-field-clear]")].map(rel);
  // Wireframe only on the desktop layout, where the card sits beside the
  // text (at exactly 64rem the hero still stacks, so check the layout itself).
  const cardEl = hero.querySelector("aside[data-field-clear]");
  const textEl = hero.querySelector("[data-field-clear]");
  const card = cardEl ? rel(cardEl) : null;
  const beside = Boolean(card && textEl && textEl !== cardEl && card.l >= rel(textEl).r);
  const segs = card && beside && w >= DESKTOP ? wireframe(card, s, ox, oy) : [];
  const ctaEl = hero.querySelector('[data-track="cta"][data-location="hero"]');
  const c = ctaEl ? rel(ctaEl) : { l: w / 2, t: h / 2, r: w / 2, b: h / 2 };

  const rand = mulberry32(SEED);
  const count = cols * rows;
  const data = new Float32Array(count * FLOATS);
  let i = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = ox + col * s, y = oy + row * s;
      const seed = rand();
      // Sparse top-left, dense bottom-right, with a little grain.
      const g = smoothstep(0, 1, (x / w) * 0.55 + (y / h) * 0.45);
      const density = Math.min(1, DENSITY_MIN + (1 - DENSITY_MIN) * g + (seed - 0.5) * 0.12);
      let near = Infinity;
      for (const r of clears) near = Math.min(near, rectDist(x, y, r));
      let wd = Infinity;
      for (const sg of segs) wd = Math.min(wd, segDist(x, y, sg));
      data.set([x, y, Math.max(DENSITY_MIN, density), seed, segs.length ? 1 - smoothstep(0, WIRE_HALF, wd) : 0, 1 - smoothstep(0, CLEAR_HALO, near - CLEAR_INSET)], i * FLOATS);
      i++;
    }
  }
  return { w, h, dpr, count, data, cta: [(c.l + c.r) / 2, (c.t + c.b) / 2] };
}

// ---------- renderers ----------
type Renderer = { build(l: Layout): void; draw(f: Frame): void; destroy(): void };
type Palette = { base: Lab; active: Lab; maxAlpha: number };

function sizeCanvas(canvas: HTMLCanvasElement, l: Layout) {
  canvas.width = Math.round(l.w * l.dpr);
  canvas.height = Math.round(l.h * l.dpr);
  canvas.style.width = `${l.w}px`;
  canvas.style.height = `${l.h}px`;
}

/** WebGL2: one draw call, maths in the shader. Null when unavailable. */
function webgl(canvas: HTMLCanvasElement, pal: Palette): Renderer | null {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null;
  const shader = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
    return sh;
  };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
  } catch {
    return null;
  }
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const U = {
    res: u("uRes"), dpr: u("uDpr"), time: u("uTime"), wire: u("uWire"), fade: u("uFade"), assemble: u("uAssemble"),
    cta: u("uCta"), cursor: u("uCursor"), dir: u("uCursorDir"), ripA: u("uRipA"), ripB: u("uRipB"),
  };
  const vao = gl.createVertexArray();
  const buf = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  ([["aPos", 2, 0], ["aDensity", 1, 2], ["aSeed", 1, 3], ["aWire", 1, 4], ["aClear", 1, 5]] as const).forEach(([name, size, off]) => {
    const loc = gl.getAttribLocation(prog, name);
    if (loc < 0) return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, FLOATS * 4, off * 4);
  });
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  gl.uniform3fv(u("uBase"), pal.base);
  gl.uniform3fv(u("uActive"), pal.active);
  gl.uniform1f(u("uMaxAlpha"), pal.maxAlpha);
  let count = 0;
  return {
    build(l) {
      sizeCanvas(canvas, l);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bufferData(gl.ARRAY_BUFFER, l.data, gl.STATIC_DRAW);
      gl.uniform2f(U.res, l.w, l.h);
      gl.uniform1f(U.dpr, l.dpr);
      gl.uniform2f(U.cta, l.cta[0], l.cta[1]);
      count = l.count;
    },
    draw(f) {
      gl.uniform1f(U.time, f.t);
      gl.uniform1f(U.wire, f.wire);
      gl.uniform1f(U.fade, f.fade);
      gl.uniform1f(U.assemble, f.assemble);
      gl.uniform4fv(U.cursor, f.cursor);
      gl.uniform2fv(U.dir, f.dir);
      gl.uniform4fv(U.ripA, f.ripA);
      gl.uniform4fv(U.ripB, f.ripB);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    },
    destroy() {
      if (gl.isContextLost()) return;
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
    },
  };
}

const E_LEVELS = 8;
const A_LEVELS = 6;

/**
 * Canvas 2D: the shader's maths per dot on the CPU, then a counting sort into
 * 8 excitation × 6 alpha buckets, so a frame is about 48 fills. Buffers are
 * allocated per build, never per frame.
 */
function canvas2d(canvas: HTMLCanvasElement, pal: Palette): Renderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const colours = Array.from({ length: E_LEVELS }, (_, k) => labToCss(mixLab(pal.base, pal.active, k / (E_LEVELS - 1))));
  const counts = new Int32Array(E_LEVELS * A_LEVELS);
  const starts = new Int32Array(E_LEVELS * A_LEVELS + 1);
  let l: Layout | null = null;
  let px = new Float32Array(0), py = new Float32Array(0), bucket = new Uint8Array(0), order = new Uint32Array(0);
  return {
    build(next) {
      l = next;
      sizeCanvas(canvas, l);
      ctx.setTransform(l.dpr, 0, 0, l.dpr, 0, 0);
      px = new Float32Array(l.count); py = new Float32Array(l.count);
      bucket = new Uint8Array(l.count); order = new Uint32Array(l.count);
    },
    draw(f) {
      if (!l) return;
      const { data, count, cta, w, h } = l;
      const cx = f.cursor[0], cy = f.cursor[1], strength = f.cursor[2], stretch = f.cursor[3];
      const dx0 = f.dir[0], dy0 = f.dir[1];
      counts.fill(0);
      for (let i = 0; i < count; i++) {
        const o = i * FLOATS;
        const ax = data[o], ay = data[o + 1], density = data[o + 2], seed = data[o + 3], wire = data[o + 4], clear = data[o + 5];
        const delay = Math.min(Math.hypot(ax - cta[0], ay - cta[1]) * 0.0006, 0.45);
        const k = Math.min(1, Math.max(0, (f.assemble - delay) / 1.2));
        const settle = k >= 1 ? 1 : 1 - 2 ** (-10 * k);
        const mult = density * (1 - clear * 0.94) * settle;
        if (mult < 0.1) { bucket[i] = 255; continue; } // too faint to draw at any excitation
        const ang = fract(seed * 7.31) * TAU, jit = fract(seed * 13.7) * 36 * (1 - settle);
        let x = ax + Math.cos(ang) * jit, y = ay + Math.sin(ang) * jit;
        let e = (snoise(x * 0.004 + 17.3, y * 0.004 + 41.9, f.t * 0.00012 + 7.1) + 1) * 0.5 * 0.35;
        if (strength > 0) {
          const ddx = x - cx, ddy = y - cy;
          const along = ddx * dx0 + ddy * dy0, prx = ddx - along * dx0, pry = ddy - along * dy0;
          const b = (1 - smoothstep(0, 180, Math.sqrt(prx * prx + pry * pry + along * along * stretch * stretch))) ** 1.6 * strength;
          if (b > e) e = b;
          const len = Math.hypot(ddx, ddy);
          if (len > 0.5) { x -= (ddx / len) * 2.5 * b; y -= (ddy / len) * 2.5 * b; }
        }
        for (let r = 0; r < RIPPLES; r++) {
          const gain = f.ripB[r * 4];
          if (gain <= 0) continue;
          const ox = f.ripA[r * 4], oy = f.ripA[r * 4 + 1];
          const dist = f.ripB[r * 4 + 1] > 0.5 ? Math.abs((x - ox) * f.ripB[r * 4 + 2] + (y - oy) * f.ripB[r * 4 + 3]) : Math.hypot(x - ox, y - oy);
          const z = (dist - f.ripA[r * 4 + 2]) / f.ripA[r * 4 + 3];
          const v = Math.exp(-z * z * 4) * gain;
          if (v > e) e = v;
        }
        const wv = wire * f.wire * (0.62 + 0.08 * Math.sin(f.t * 0.0009 + seed * TAU));
        if (wv > e) e = wv;
        e = Math.min(1, Math.max(0, e));
        const b = Math.round(e * (E_LEVELS - 1)) * A_LEVELS + Math.min(A_LEVELS - 1, Math.round(mult * (A_LEVELS - 1)));
        bucket[i] = b; counts[b]++;
        px[i] = x; py[i] = y;
      }
      starts[0] = 0;
      for (let b = 0; b < counts.length; b++) starts[b + 1] = starts[b] + counts[b];
      for (let b = 0; b < counts.length; b++) counts[b] = starts[b];
      for (let i = 0; i < count; i++) if (bucket[i] !== 255) order[counts[bucket[i]]++] = i;
      ctx.clearRect(0, 0, w, h);
      for (let b = 0; b < E_LEVELS * A_LEVELS; b++) {
        const from = starts[b], to = starts[b + 1];
        if (from === to) continue;
        const e = Math.floor(b / A_LEVELS) / (E_LEVELS - 1), m = (b % A_LEVELS) / (A_LEVELS - 1);
        const alpha = Math.min(0.1 + 0.75 * e, pal.maxAlpha) * m * f.fade;
        if (alpha < 0.004) continue;
        const r = 1.6 + 2.6 * (1 - (1 - e) ** 3);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = colours[Math.floor(b / A_LEVELS)];
        ctx.beginPath();
        for (let n = from; n < to; n++) { const i = order[n]; ctx.moveTo(px[i] + r, py[i]); ctx.arc(px[i], py[i], r, 0, TAU); }
        ctx.fill();
      }
    },
    destroy() {},
  };
}

// ---------- component ----------
export type BuildFieldProps = {
  /** Idle dot colour. Defaults to an OKLab mix of --paper and --green. */
  baseColor?: string;
  /** Fully excited dot colour. Defaults to --green. */
  activeColor?: string;
  /** Peak dot alpha. 0.7 keeps the CTA the darkest thing in the hero. */
  maxAlpha?: number;
};

export default function BuildField({ baseColor, activeColor, maxAlpha = MAX_ALPHA }: BuildFieldProps) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrap.current;
    const hero = root?.parentElement;
    if (!root || !hero) return;

    const reduced = prefersReducedMotion();
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const force2d = new URLSearchParams(window.location.search).get("field") === "2d";

    // Brand colours from the stylesheet; props override (for the blue comparison).
    const css = getComputedStyle(document.documentElement);
    const green = toOklab(css.getPropertyValue("--green")) ?? toOklab("#2f5d46")!;
    const paper = toOklab(css.getPropertyValue("--paper")) ?? toOklab("#f7f8f5")!;
    const pal: Palette = {
      active: (activeColor && toOklab(activeColor)) || green,
      base: (baseColor && toOklab(baseColor)) || mixLab(paper, green, BASE_MIX),
      maxAlpha,
    };

    // ---- renderer: WebGL2, else 2D; a lost context swaps to 2D on a fresh canvas ----
    let canvas: HTMLCanvasElement | null = null;
    let renderer: Renderer | null = null;
    const mount = (make: typeof webgl) => {
      const c = document.createElement("canvas");
      c.className = styles.canvas;
      const r = make(c, pal);
      if (!r) return false;
      canvas?.remove();
      canvas = c;
      root.appendChild(c);
      renderer = r;
      return true;
    };
    if (!(!force2d && mount(webgl)) && !mount(canvas2d)) return;

    // ---- state, allocated once ----
    const f: Frame = { t: 0, wire: 0, fade: 1, assemble: ASSEMBLE, cursor: new Float32Array([-1e4, -1e4, 0, 1]), dir: new Float32Array([1, 0]), ripA: new Float32Array(16), ripB: new Float32Array(16) };
    const out: Frame = { ...f };
    const scroll = { y: 0, wire: 1, fade: 1 };
    let shownY = NaN;
    const ripples: Ripple[] = Array.from({ length: RIPPLES }, () => ({ on: false, x: 0, y: 0, nx: 1, ny: 0, sweep: false, speed: 0, width: 1, gain: 0, age: 0, travel: 1 }));
    const pointer = { x: 0, y: 0, inside: false };
    const bubble = { x: 0, y: 0, strength: 0, speed: 0, placed: false };
    let lay = layout(hero);
    let heroX = 0, heroY = 0, diag = 1;
    let nextAmbient = 1200;
    let lastPulse = -Infinity;

    const build = () => {
      lay = layout(hero);
      renderer!.build(lay);
      const r = hero.getBoundingClientRect();
      heroX = r.left + window.scrollX; heroY = r.top + window.scrollY;
      diag = Math.hypot(lay.w, lay.h);
    };

    const rand = (range: number[]) => range[0] + Math.random() * (range[1] - range[0]);
    const spawn = (x: number, y: number, speed: number, width: number, gain: number, sweep = false, angle = 0) => {
      const r = ripples.find((p) => !p.on);
      if (!r) return;
      r.on = true; r.age = 0; r.speed = speed; r.width = width; r.gain = gain; r.sweep = sweep;
      r.nx = Math.cos(angle); r.ny = Math.sin(angle);
      // A sweep is a straight front through the centre: it starts beyond one edge.
      r.x = sweep ? lay.w / 2 - (r.nx * diag) / 2 : x;
      r.y = sweep ? lay.h / 2 - (r.ny * diag) / 2 : y;
      r.travel = diag;
    };
    const ambient = () => {
      if (Math.random() < SWEEP_SHARE) spawn(0, 0, rand(RIPPLE_SPEED), rand(RIPPLE_WIDTH), rand(RIPPLE_GAIN), true, Math.random() * TAU);
      else spawn(Math.random() * lay.w, Math.random() * lay.h, rand(RIPPLE_SPEED), rand(RIPPLE_WIDTH), rand(RIPPLE_GAIN));
    };

    const draw = () => {
      out.t = f.t;
      out.wire = f.wire * scroll.wire;
      out.fade = f.fade * scroll.fade;
      out.assemble = f.assemble;
      renderer!.draw(out);
    };

    const tick = (_time: number, deltaTime: number) => {
      const dt = Math.min(deltaTime, DT_MAX);
      if (dt <= 0) return;
      f.t += dt;

      // Cursor bubble: trails the pointer, fades in and out, stretches with speed.
      if (!touch) {
        const k = 1 - (1 - BUBBLE_LERP) ** (dt / 16.667);
        const bx = bubble.x, by = bubble.y;
        if (!bubble.placed && pointer.inside) { bubble.x = pointer.x; bubble.y = pointer.y; bubble.placed = true; }
        bubble.x += (pointer.x - bubble.x) * k;
        bubble.y += (pointer.y - bubble.y) * k;
        const vx = ((bubble.x - bx) * 1000) / dt, vy = ((bubble.y - by) * 1000) / dt;
        const sp = Math.hypot(vx, vy);
        bubble.speed += (sp - bubble.speed) * 0.2;
        if (sp > 1) { f.dir[0] = vx / sp; f.dir[1] = vy / sp; }
        bubble.strength = Math.min(1, Math.max(0, bubble.strength + (pointer.inside ? dt : -dt) / BUBBLE_FADE));
        f.cursor[0] = bubble.x; f.cursor[1] = bubble.y; f.cursor[2] = bubble.strength;
        f.cursor[3] = Math.max(0.45, 1 / (1 + bubble.speed * 0.004));
      }

      // Ripples: ambient on a timer, plus clicks and the CTA pulse.
      nextAmbient -= dt;
      if (nextAmbient <= 0) { ambient(); nextAmbient = rand(touch ? AMBIENT_TOUCH : AMBIENT); }
      for (let i = 0; i < RIPPLES; i++) {
        const r = ripples[i];
        if (r.on) { r.age += dt / 1000; if (r.speed * r.age >= r.travel) r.on = false; }
        const front = r.speed * r.age, p = front / r.travel;
        f.ripA[i * 4] = r.x; f.ripA[i * 4 + 1] = r.y; f.ripA[i * 4 + 2] = front; f.ripA[i * 4 + 3] = r.width;
        f.ripB[i * 4] = r.on ? r.gain * (p > 0.75 ? (1 - p) / 0.25 : 1) : 0;
        f.ripB[i * 4 + 1] = r.sweep ? 1 : 0; f.ripB[i * 4 + 2] = r.nx; f.ripB[i * 4 + 3] = r.ny;
      }

      // Depth: the field drifts up at 0.85× scroll (it lags 15% behind the page).
      if (scroll.y !== shownY && canvas) { shownY = scroll.y; canvas.style.transform = `translate3d(0,${shownY.toFixed(1)}px,0)`; }
      draw();
    };

    /** The finished, still frame: assembled, wireframe on, noise at t = 0. */
    const still = () => { f.t = 0; f.wire = 1; f.fade = 1; f.assemble = ASSEMBLE; draw(); };

    build();
    canvas!.dataset.ready = "1";

    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { build(); if (reduced) still(); else draw(); }, RESIZE_DEBOUNCE);
    });
    ro.observe(hero);
    hero.querySelectorAll("[data-field-clear]").forEach((el) => ro.observe(el));

    if (reduced) {
      still();
      return () => { ro.disconnect(); window.clearTimeout(timer); renderer?.destroy(); canvas?.remove(); };
    }

    // ---- entrance: assemble from the CTA once a session; later views fade in ----
    let first = true;
    try { first = !sessionStorage.getItem(SEEN_KEY); sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* no storage: assemble */ }
    const wireIn = () => { gsap.to(f, { wire: 1, duration: WIRE_IN, ease: "power2.out" }); };
    const intro = first
      ? gsap.fromTo(f, { assemble: 0 }, { assemble: ASSEMBLE, duration: ASSEMBLE, ease: "none", onComplete: wireIn })
      : gsap.fromTo(f, { fade: 0 }, { fade: 1, duration: 0.3, ease: "power1.out", onComplete: wireIn });

    // ---- scroll hand-off: depth, the wireframe peaks, then clean paper. No pinning. ----
    const handoff = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4, invalidateOnRefresh: true } })
      .to(scroll, { y: () => lay.h * 0.15, duration: 1, ease: "none" }, 0)
      .to(scroll, { wire: 1.15, duration: 0.45, ease: "none" }, 0)
      .to(scroll, { fade: 0, duration: 0.6, ease: "power1.in" }, 0.4);

    // ---- input: on window, so the canvas never takes a click ----
    const toLocal = (e: PointerEvent) => { pointer.x = e.clientX + window.scrollX - heroX; pointer.y = e.clientY + window.scrollY - heroY; };
    const inHero = () => pointer.x >= 0 && pointer.y >= 0 && pointer.x <= lay.w && pointer.y <= lay.h;
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse" || touch) return; toLocal(e); pointer.inside = inHero(); };
    const onOut = (e: PointerEvent) => { if (!e.relatedTarget) pointer.inside = false; };
    const onDown = (e: PointerEvent) => { toLocal(e); if (inHero()) spawn(pointer.x, pointer.y, CLICK.speed, CLICK.width, CLICK.gain); };
    const cta = hero.querySelector<HTMLElement>('[data-track="cta"][data-location="hero"]');
    const onPulse = () => {
      const now = performance.now();
      if (now - lastPulse < PULSE.every) return;
      lastPulse = now;
      spawn(lay.cta[0], lay.cta[1], PULSE.speed, PULSE.width, PULSE.gain);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    cta?.addEventListener("pointerenter", onPulse);
    cta?.addEventListener("focus", onPulse);

    // ---- lifecycle: run only while on screen and the tab is visible ----
    let visible = false, running = false;
    const sync = () => {
      const want = visible && !document.hidden;
      if (want === running) return;
      running = want;
      if (running) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(hero);
    document.addEventListener("visibilitychange", sync);

    // A lost WebGL context hands over to the 2D renderer on a fresh canvas.
    const onLost = (e: Event) => {
      e.preventDefault();
      renderer?.destroy();
      if (mount(canvas2d)) { build(); canvas!.dataset.ready = "1"; shownY = NaN; }
      else { gsap.ticker.remove(tick); running = false; visible = false; }
    };
    canvas!.addEventListener("webglcontextlost", onLost);

    return () => {
      gsap.ticker.remove(tick);
      intro.kill();
      handoff.scrollTrigger?.kill();
      handoff.kill();
      gsap.killTweensOf(f);
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      cta?.removeEventListener("pointerenter", onPulse);
      cta?.removeEventListener("focus", onPulse);
      renderer?.destroy();
      canvas?.remove();
    };
  }, [baseColor, activeColor, maxAlpha]);

  return <div ref={wrap} className={styles.field} aria-hidden="true" />;
}

/**
 * The particle headshot: every 2nd opaque pixel of a transparent PNG becomes
 * one point, coloured on the brand ramp by its luminance, scattered in a
 * loose sphere and assembled into the portrait with a per-particle stagger.
 * The cursor pushes nearby points away and toward the camera; a click scatters
 * or assembles; the cloud leans toward the cursor while idle.
 *
 * This module imports Three, so it is only ever loaded dynamically — after the
 * window load event, on desktop with a fine pointer, and never under reduced
 * motion. See ParticleHeadshot/index.tsx for that gate.
 */
import * as THREE from "three";

/* ---------- tunables ---------- */

/** Sample every Nth pixel in each axis. 3 = one particle per 3×3 block. */
export const SAMPLE_STEP = 3;
/** Pixels with alpha below this are background and get no particle. */
export const ALPHA_MIN = 120;
/** Height of the assembled portrait, in world units. */
export const PORTRAIT_HEIGHT = 8;
/** Relief: z offset is (lum − 0.5) × this. */
export const RELIEF = 0.6;
/** Scattered positions are random points in a shell between these radii. */
export const SCATTER_RADIUS = [5, 8] as const;
/** Cursor influence radius, and how far points are pushed (radially, and toward the camera). */
export const PUSH_RADIUS = 2.2;
export const PUSH_STRENGTH = 1.6;
export const PUSH_TOWARD_CAMERA = 1.2;
/** Assemble / scatter takes this long, before the per-particle stagger. */
export const MORPH_DURATION_MS = 2000;
/** After a click scatters the cloud, it reassembles on its own after this long. */
export const SCATTER_HOLD_MS = 2200;
/** The neck dissolves: from this fraction of the height down, pixels are dropped
    with rising probability, reaching DISSOLVE_MAX at the very bottom. */
export const DISSOLVE_FROM = 0.78;
export const DISSOLVE_MAX = 0.95;
/** A leftover artifact lives in the bottom-left corner; nothing there is sampled. */
export const CORNER_CUT = 0.15;
/** Luminance contrast before the ramp: stretch about the middle, then a gamma. */
export const CONTRAST = 1.6;
export const GAMMA = 1.3;
/** Pixels darker than this after the curve get no particle — eyes and nostrils
    become gaps, not dark dots. */
export const LUM_MIN = 0.08;
/** Each particle starts its own morph up to this fraction late. */
export const MAX_STAGGER = 0.35;
/** Point size in CSS pixels at the portrait's distance, before the per-particle variance. */
export const POINT_SIZE = 2.2;
export const SIZE_VARIANCE = 0.35;
/** Size follows brightness: dark pixels this much of base, bright ones this much. */
export const SIZE_DARK = 0.7;
export const SIZE_BRIGHT = 1.4;
/** Idle drift amplitude (world units) and the cloud's maximum lean toward the cursor. */
export const DRIFT = 0.035;
export const LEAN_DEGREES = 15;
/** The brand ramp, three segments: 0 → 0.35 deep umber → dark gold, 0.35 → 0.7
    dark gold → gold, 0.7 → 1 gold → cream. */
export const RAMP = { deep: "#4a3810", dark: "#7a5c1c", gold: "#b8902e", cream: "#f4e7cc" } as const;
export const MAX_PIXEL_RATIO = 2;

/* ---------- shaders ---------- */

const VERT = /* glsl */ `
  attribute vec3 aPortrait;
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute float aDelay;
  attribute float aSize;
  attribute float aSeed;

  uniform float uProgress;     // 0 = scattered, 1 = assembled (master clock)
  uniform float uTime;
  uniform vec3  uCursor;       // on the z = 0 plane, in the cloud's local space
  uniform float uCursorActive; // eased 0..1
  uniform float uPushRadius;
  uniform float uPushStrength;
  uniform float uPushZ;
  uniform float uDrift;
  uniform float uPointSize;    // already × pixel ratio
  uniform float uCameraZ;

  varying vec3 vColor;

  void main() {
    // Per-particle stagger: this particle's own progress starts aDelay late
    // and still ends at 1, eased with smoothstep.
    float local = clamp((uProgress - aDelay) / (1.0 - aDelay), 0.0, 1.0);
    float t = smoothstep(0.0, 1.0, local);
    vec3 pos = mix(aScatter, aPortrait, t);

    // Idle drift while assembled: tiny, per-particle, three phases.
    pos += t * uDrift * vec3(
      sin(uTime * 0.9 + aSeed * 6.2831),
      cos(uTime * 1.1 + aSeed * 3.1416),
      sin(uTime * 0.7 + aSeed * 9.4247)
    );

    // Cursor: push radially away from the cursor and toward the camera,
    // falling off with smoothstep across the radius.
    vec2 away = pos.xy - uCursor.xy;
    float d = length(away);
    float f = (1.0 - smoothstep(0.0, uPushRadius, d)) * uCursorActive;
    vec2 dir = d > 0.0001 ? away / d : vec2(0.0, 1.0);
    pos.xy += dir * f * uPushStrength;
    pos.z  += f * uPushZ;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // Sized by distance: the base size holds at the portrait's distance.
    gl_PointSize = uPointSize * aSize * (uCameraZ / max(0.1, -mv.z));
    vColor = aColor;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    // Small squares: keep the centre box of the point sprite, discard the rim.
    vec2 c = abs(gl_PointCoord - 0.5);
    if (c.x > 0.42 || c.y > 0.42) discard;
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

/* ---------- helpers ---------- */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

const RAMP_COLORS = {
  deep: new THREE.Color(RAMP.deep), dark: new THREE.Color(RAMP.dark),
  gold: new THREE.Color(RAMP.gold), cream: new THREE.Color(RAMP.cream),
};
function rampColor(lum: number, out: THREE.Color) {
  const { deep, dark, gold, cream } = RAMP_COLORS;
  if (lum < 0.35) return out.copy(deep).lerp(dark, lum / 0.35);
  if (lum < 0.7) return out.copy(dark).lerp(gold, (lum - 0.35) / 0.35);
  return out.copy(gold).lerp(cream, (lum - 0.7) / 0.3);
}
/** Contrast, then gamma, on a 0..1 luminance. */
function curve(lum: number) {
  const stretched = Math.min(1, Math.max(0, (lum - 0.5) * CONTRAST + 0.5));
  return Math.pow(stretched, GAMMA);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

/** Read the PNG and turn its opaque pixels into particle attributes. */
async function sampleParticles(src: string) {
  const img = await loadImage(src);
  const w = img.naturalWidth, h = img.naturalHeight;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const portrait: number[] = [], scatter: number[] = [], color: number[] = [];
  const delay: number[] = [], size: number[] = [], seed: number[] = [];
  const c = new THREE.Color();
  const scale = PORTRAIT_HEIGHT / h;
  const [rMin, rMax] = SCATTER_RADIUS;

  for (let y = 0; y < h; y += SAMPLE_STEP) {
    // The neck thins out into nothing: below DISSOLVE_FROM the drop chance
    // rises on a smoothstep to DISSOLVE_MAX at the last row. No straight edge.
    const row = y / h;
    const dissolve = row > DISSOLVE_FROM ? smoothstep((row - DISSOLVE_FROM) / (1 - DISSOLVE_FROM)) * DISSOLVE_MAX : 0;
    for (let x = 0; x < w; x += SAMPLE_STEP) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < ALPHA_MIN) continue;
      if (dissolve > 0 && Math.random() < dissolve) continue;
      if (x < w * CORNER_CUT && y > h * (1 - CORNER_CUT)) continue; // the corner artifact
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const raw = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const lum = curve(raw);
      if (lum < LUM_MIN) continue; // eyes and nostrils are gaps

      portrait.push((x - w / 2) * scale, (h / 2 - y) * scale, (raw - 0.5) * RELIEF);

      // A random point in a loose spherical shell.
      const u = Math.random() * 2 - 1, phi = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u), rad = lerp(rMin, rMax, Math.random());
      scatter.push(rad * s * Math.cos(phi), rad * s * Math.sin(phi), rad * u);

      rampColor(lum, c);
      color.push(c.r, c.g, c.b);
      delay.push(Math.random() * MAX_STAGGER);
      // Brighter, fewer, bigger: the highlights carry the face.
      size.push(lerp(SIZE_DARK, SIZE_BRIGHT, lum) * (1 - SIZE_VARIANCE / 2 + Math.random() * SIZE_VARIANCE));
      seed.push(Math.random());
    }
  }
  return { portrait, scatter, color, delay, size, seed, count: delay.length };
}

/* ---------- the scene ---------- */

export type MotionState = "assembled" | "scattering" | "assembling";

export type Engine = {
  dispose: () => void;
  setVisible: (visible: boolean) => void;
  count: number;
};

export async function start(opts: {
  canvas: HTMLCanvasElement;
  /** The element whose size the canvas fills and whose pointer events drive it. */
  host: HTMLElement;
  src: string;
  onFirstFrame: () => void;
  onState?: (state: MotionState) => void;
}): Promise<Engine> {
  const { canvas, host, src, onFirstFrame, onState } = opts;
  const particles = await sampleParticles(src);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const cameraZ = 12.5;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, cameraZ);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(particles.portrait, 3)); // a bound "position" keeps Three's bounds happy
  geometry.setAttribute("aPortrait", new THREE.Float32BufferAttribute(particles.portrait, 3));
  geometry.setAttribute("aScatter", new THREE.Float32BufferAttribute(particles.scatter, 3));
  geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(particles.color, 3));
  geometry.setAttribute("aDelay", new THREE.Float32BufferAttribute(particles.delay, 1));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(particles.size, 1));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(particles.seed, 1));
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius = SCATTER_RADIUS[1] + PUSH_STRENGTH + 1; // never culled mid-scatter

  const uniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uCursor: { value: new THREE.Vector3(0, 0, 0) },
    uCursorActive: { value: 0 },
    uPushRadius: { value: PUSH_RADIUS },
    uPushStrength: { value: PUSH_STRENGTH },
    uPushZ: { value: PUSH_TOWARD_CAMERA },
    uDrift: { value: DRIFT },
    uPointSize: { value: POINT_SIZE * renderer.getPixelRatio() },
    uCameraZ: { value: cameraZ },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });

  const cloud = new THREE.Group();
  cloud.add(new THREE.Points(geometry, material));
  scene.add(cloud);

  /* ---- state ---- */
  let target = 1;               // 1 assemble, 0 scatter
  let progress = 0;
  let motion: MotionState = "assembling";
  let holdTimer = 0;
  const setMotion = (m: MotionState) => { if (m !== motion) { motion = m; onState?.(m); } };
  let cursorActive = 0, cursorWanted = 0;
  const cursor = new THREE.Vector3();
  const cursorNdc = new THREE.Vector2(0, 0);
  let leanX = 0, leanY = 0, leanWantX = 0, leanWantY = 0;
  let visible = true, disposed = false, firstFrame = false;
  let raf = 0, last = performance.now();
  const clock = new THREE.Clock();

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();

  function resize() {
    const w = host.clientWidth || 1, hgt = host.clientHeight || 1;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  function onMove(e: PointerEvent) {
    const r = host.getBoundingClientRect();
    cursorNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    raycaster.setFromCamera(cursorNdc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      // The cloud leans, so bring the hit into its local space.
      cloud.worldToLocal(cursor.copy(hit));
      cursorWanted = 1;
    }
    leanWantY = THREE.MathUtils.degToRad(LEAN_DEGREES) * cursorNdc.x;
    leanWantX = -THREE.MathUtils.degToRad(LEAN_DEGREES) * cursorNdc.y;
  }
  function onLeave() { cursorWanted = 0; leanWantX = 0; leanWantY = 0; }
  // A click scatters, and the cloud comes back by itself after the hold.
  // Clicks while it is scattering or reassembling are ignored: no toggle.
  function onClick() {
    if (motion !== "assembled") return;
    target = 0;
    setMotion("scattering");
    holdTimer = window.setTimeout(() => { target = 1; setMotion("assembling"); }, SCATTER_HOLD_MS);
  }
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("click", onClick);

  function frame(now: number) {
    if (disposed) return;
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;

    // Master clock toward the target; the shader staggers each particle.
    const step = dt * 1000 / MORPH_DURATION_MS;
    progress = target === 1 ? Math.min(1, progress + step) : Math.max(0, progress - step);
    if (target === 1 && progress >= 1) setMotion("assembled");
    uniforms.uProgress.value = progress;
    uniforms.uTime.value = clock.getElapsedTime();

    cursorActive = lerp(cursorActive, cursorWanted, 1 - Math.pow(0.001, dt)); // fast in, eased out
    uniforms.uCursorActive.value = smoothstep(cursorActive);
    uniforms.uCursor.value.copy(cursor);

    const k = 1 - Math.pow(0.02, dt); // eased lean
    leanX = lerp(leanX, leanWantX, k); leanY = lerp(leanY, leanWantY, k);
    cloud.rotation.set(leanX, leanY, 0);

    renderer.render(scene, camera);
    if (!firstFrame) { firstFrame = true; onFirstFrame(); }
  }
  raf = requestAnimationFrame(frame);

  return {
    count: particles.count,
    setVisible(v) {
      if (v === visible) return;
      visible = v;
      if (v && !raf && !disposed) { last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!v && raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (holdTimer) clearTimeout(holdTimer);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("click", onClick);
      geometry.dispose(); material.dispose(); renderer.dispose();
    },
  };
}

"use client"

/**
 * Nimbus UI · Liquid Navbar — "Waterline"
 * A pill of water. The active drop stretches toward the item you pick, splits into
 * droplets on long jumps and merges back with a ripple. The cursor lifts a meniscus,
 * every tap sends a wave along the pill, and each icon plays its own little scene.
 * Water is drawn by a tiny WebGL shader (only inside the pill, paused off-screen);
 * without WebGL it falls back to a CSS drop. No dependencies besides React.
 * by guglielmogiannattasio.it
 *
 * Changed for this site (the component is otherwise as its author wrote it):
 * - Every item is a real link, routed on the client (next/link), so the drop
 *   travels instead of the page reloading.
 * - `active` is where the drop sits (-1: nowhere, on a page the nav doesn't
 *   list); `page` is the item for the page the visitor is on, which gets
 *   aria-current="page". The parent sets both; a click moves the drop at once.
 * - Arrow keys move focus between items and nothing else. Enter or a click
 *   follows the link.
 * - The water no longer moves without end. It runs while the pointer is on it,
 *   after a tap, and for about two seconds after `wake` changes (a page
 *   change); then the animation loop stops.
 * - The water is not started until the page has loaded and gone quiet (the CSS
 *   drop stands in until then), and the Chromium-only refraction of whatever
 *   is behind the pill is removed: over a playing video it re-filtered every
 *   frame.
 * - The blue tints are warm cream and amber (three colours in the shader, the
 *   rest in liquid-navbar.css, where the styles now live).
 * - The plane and weather scenes and their icons are gone; grid, tag, key and
 *   pulse icons are added in the same stroke.
 */

import * as React from "react"
import Link from "next/link"

import "./liquid-navbar.css"

export type NimbusFx = "spin" | "glow" | "wave" | "pop" | "none"

export type LiquidNavItem = {
  label: string
  href: string
  icon?: React.ReactNode
  /** the little scene the icon plays when tapped */
  fx?: NimbusFx
}

export type LiquidNavbarProps = {
  items: LiquidNavItem[]
  /** the item the drop sits on; -1 for none */
  active: number
  /** the item for the page the visitor is on (aria-current="page"); -1 for none */
  page?: number
  /** change this to run the water for about two seconds (a page change) */
  wake?: string | number
  onSelect?: (index: number, item: LiquidNavItem) => void
  /** "light" water for bright backgrounds, "dark" for dark ones */
  tone?: "light" | "dark"
  /** icons only */
  compact?: boolean
  /** soft synthesized "plip" on tap (no audio files) */
  sound?: boolean
  className?: string
  style?: React.CSSProperties
}

/* ---------- icons ---------- */
const I = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
)
export const NimbusIcons = {
  home: I(<><path d="M3.5 11.2 12 4l8.5 7.2" /><path d="M6 9.6V20h12V9.6" /><path className="nv-door" d="M10 20v-5h4v5Z" /></>),
  user: I(<><circle cx="12" cy="8.5" r="3.8" /><path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" /></>),
  /* added for this site, in the same stroke */
  grid: I(<><rect x="4" y="4" width="6.5" height="6.5" rx="1.4" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" /></>),
  tag: I(<><path d="M12.6 3.5H5a1.5 1.5 0 0 0-1.5 1.5v7.6a1.5 1.5 0 0 0 .44 1.06l6.9 6.9a1.5 1.5 0 0 0 2.12 0l7.6-7.6a1.5 1.5 0 0 0 0-2.12l-6.9-6.9a1.5 1.5 0 0 0-1.06-.44Z" /><circle cx="8.2" cy="8.2" r="1.2" /></>),
  key: I(<><circle cx="8" cy="15.5" r="4.2" /><path d="M11 12.5 20 3.5M16.2 7.3l2.8 2.8M13.6 9.9l2 2" /></>),
  pulse: I(<path d="M3 12.5h4l2.2-6 4 12 2.4-6H21" />),
}

const PAD = 14 // canvas bleed around the pill, for shadows and ripples

/* ---------- the water shader ---------- */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(.2,.1,.02)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(1.,.95,.84),vec3(1.,.85,.66),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(.78,.42,0.),vec3(1.,.6,.35),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`

type Body = { x: number; v: number }
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number }
type Rip = { x: number; y: number; age: number; amp: number }

function makeState() {
  return {
    a: { x: 0, v: 0 } as Body,
    b: { x: 0, v: 0 } as Body,
    sy: { s: 1, v: 0 },
    lead: 0 as 0 | 1,
    lagFrom: 0,
    sats: [] as Sat[],
    rips: [] as Rip[],
    t: { x: 0, cy: 0, q: 0, r: 21 },
    q: 0,
    r: 0, // the drop's radius, eased to t.r (0 when no item is active)
    awakeUntil: 0, // the water runs on its own until this time
    mouse: { x: 0, y: 0, s: 0, on: false },
    moving: false,
    split: false,
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null as null | { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> },
  }
}

function initGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }) as WebGLRenderingContext | null
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = sh(gl.VERTEX_SHADER, VERT)
  const fs = sh(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const p = gl.createProgram()!
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null
  gl.useProgram(p)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(p, "a")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u: Record<string, WebGLUniformLocation | null> = {}
  for (const n of ["uRes", "uDpr", "uTime", "uPill", "uBlob", "uSy", "uRip", "uMouse", "uDark", "uAmb"]) u[n] = gl.getUniformLocation(p, n)
  return { gl, u }
}

export function LiquidNavbar({
  items,
  active,
  page = -1,
  wake,
  onSelect,
  tone = "light",
  compact,
  sound = false,
  className,
  style,
}: LiquidNavbarProps) {
  // The drop follows the parent, but a click moves it at once, before the route has changed.
  const [inner, setInner] = React.useState(active)
  const [seen, setSeen] = React.useState(active)
  if (active !== seen) { setSeen(active); setInner(active) }
  const current = inner
  const navRef = React.useRef<HTMLElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const dropRef = React.useRef<HTMLSpanElement>(null)
  const itemRefs = React.useRef<(HTMLElement | null)[]>([])
  const audio = React.useRef<AudioContext | null>(null)
  const plips = React.useRef(0)
  const st = React.useRef(makeState())
  // The CSS drop shows first; the water takes over once the page has loaded and the browser is idle.
  const [gl, setGl] = React.useState<"on" | "off">("off")
  const [fx, setFx] = React.useState({ i: -1, n: 0 })
  const dark = tone === "dark" ? 1 : 0
  const darkRef = React.useRef(dark)
  React.useEffect(() => { darkRef.current = dark }, [dark])

  /* ---- drawing ---- */
  const draw = React.useCallback(() => {
    const s = st.current
    const T = s.t
    const sep = Math.abs(s.a.x - s.b.x)
    const R = s.r
    const thin = Math.min(sep / (2 * (s.q + R) || 1), 1)
    const r = R * (1 - 0.3 * thin)
    if (s.glc) {
      const { gl: g, u } = s.glc
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight)
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2)
      g.uniform1f(u.uDpr, dpr)
      g.uniform1f(u.uTime, s.time)
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h)
      const blobs = new Float32Array(24)
      const sy = new Float32Array(6).fill(1)
      const head = s.lead === 0 ? s.a : s.b, tail = s.lead === 0 ? s.b : s.a
      blobs.set([head.x, T.cy, s.q * (1 - 0.25 * thin), R * (1 - 0.12 * thin), tail.x, T.cy, s.q * (1 - 0.8 * thin), R * (1 - 0.5 * thin)], 0)
      sy[0] = sy[1] = s.sy.s
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4))
      g.uniform4fv(u.uBlob, blobs)
      g.uniform1fv(u.uSy, sy)
      const rips = new Float32Array(24)
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4))
      g.uniform4fv(u.uRip, rips)
      g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s)
      g.uniform1f(u.uDark, darkRef.current)
      g.uniform1f(u.uAmb, s.reduce ? 0 : 1)
      g.clearColor(0, 0, 0, 0)
      g.clear(g.COLOR_BUFFER_BIT)
      g.drawArrays(g.TRIANGLES, 0, 3)
    } else if (dropRef.current) {
      const left = Math.min(s.a.x, s.b.x) - s.q - r - PAD
      const width = sep + 2 * (s.q + r)
      dropRef.current.style.width = `${width}px`
      dropRef.current.style.transform = `translateX(${left}px) scaleY(${s.sy.s})`
    }
  }, [])

  /* ---- physics ---- */
  const step = React.useCallback((dt: number, now: number) => {
    const s = st.current
    const T = s.t
    s.time += dt
    s.q += (T.q - s.q) * Math.min(1, dt * 12)
    s.r = s.reduce ? T.r : s.r + (T.r - s.r) * Math.min(1, dt * 12)
    const bodies = [s.a, s.b]
    let still = true
    if (s.reduce) {
      s.a.x = s.b.x = T.x; s.a.v = s.b.v = 0; s.sy.s = 1; s.sats = []
    } else {
      bodies.forEach((B, i) => {
        const lead = i === s.lead
        const k = lead ? 210 : 72
        const c = lead ? 25 : 13
        const f = !lead && now < s.lagFrom ? 0.08 : 1
        B.v += (k * (T.x - B.x) - c * B.v) * dt * f
        B.x += B.v * dt
        const lo = PAD + 6 + s.q + T.r - 3, hi = PAD + s.w - 6 - s.q - T.r + 3
        if (B.x < lo || B.x > hi) {
          s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016
          B.x = Math.max(lo, Math.min(hi, B.x))
          B.v *= -0.25
        }
        if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false
      })
      const L = bodies[s.lead]
      const syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1)
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt
      s.sy.s += s.sy.v * dt
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false
      // break the neck: spawn droplets between head and tail
      const sep = Math.abs(s.a.x - s.b.x)
      const r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1))
      if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
        s.split = true
        const lo = bodies[1 - s.lead], hi = bodies[s.lead]
        ;[0.3, 0.5, 0.72].forEach((t, j) => {
          s.sats.push({
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
            y: T.cy + (Math.random() - 0.5) * 10,
            vx: (lo.v + hi.v) * 0.45,
            vy: (Math.random() - 0.5) * 60,
            r: 5 + Math.random() * 3 - j * 0.5,
            k: 70 + Math.random() * 90,
          })
        })
      }
      s.sats = s.sats.filter((d) => {
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt
        d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x))
        d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y))
        if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26
        return d.r > 0.6
      })
      if (s.sats.length) still = false
    }
    if (s.moving && still) {
      s.moving = false
      if (s.split || !s.reduce) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 })
    }
    s.rips.forEach((p) => (p.age += dt))
    s.rips = s.rips.filter((p) => p.age < 2.4)
    const target = s.mouse.on ? 1 : 0
    s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7)
  }, [])

  const loop = React.useCallback(() => {
    const s = st.current
    if (s.raf) return
    s.last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30)
      s.last = now
      step(dt, now)
      draw()
      const busy = s.moving || s.rips.length || s.sats.length || s.mouse.on || s.mouse.s > 0.01 || Math.abs(s.t.r - s.r) > 0.2
      // The water moves while something is happening (a hover, a tap, the drop
      // travelling) and for a moment after a page change. Then the loop stops:
      // nothing is drawn, and nothing is asked of the battery, until the next one.
      const awake = !s.reduce && now < s.awakeUntil
      if (s.visible && (busy || awake)) s.raf = requestAnimationFrame(tick)
      else s.raf = 0
    }
    s.raf = requestAnimationFrame(tick)
  }, [draw, step])

  /* ---- layout ---- */
  const sizeCanvas = React.useCallback((w: number, h: number) => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = w + PAD * 2, Hh = h + PAD * 2
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) {
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(Hh * dpr)
      cv.style.width = `${W}px`
      cv.style.height = `${Hh}px`
    }
  }, [])

  const measure = React.useCallback(() => {
    const nav = navRef.current
    const el = current >= 0 ? itemRefs.current[current] : null
    if (!nav) return
    const s = st.current
    s.w = nav.offsetWidth
    s.h = nav.offsetHeight
    const T = s.t
    const first = itemRefs.current[0]
    if (first) T.cy = PAD + first.offsetTop + first.offsetHeight / 2
    // No item for this page: the drop shrinks away where it is.
    if (!el) { T.r = 0; T.q = 0; sizeCanvas(s.w, s.h); loop(); return }
    const fromNothing = T.r === 0 && s.ready
    T.r = el.offsetHeight / 2
    T.q = Math.max(0, el.offsetWidth / 2 - T.r)
    T.cy = PAD + el.offsetTop + el.offsetHeight / 2
    const nx = PAD + el.offsetLeft + el.offsetWidth / 2
    if (!s.ready || fromNothing) {
      // The first measure, or a drop that had shrunk away: it starts in place.
      s.a.x = s.b.x = nx
      s.a.v = s.b.v = 0
      s.q = T.q
      if (!s.ready) s.r = T.r
      s.ready = true
    } else if (Math.abs(nx - T.x) > 0.5) {
      s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1
      s.lagFrom = performance.now() + 70
      s.moving = true
      s.split = false
    }
    T.x = nx
    sizeCanvas(s.w, s.h)
    loop()
  }, [current, loop, sizeCanvas])

  React.useEffect(() => {
    const s = st.current
    s.reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const cv = canvasRef.current
    // The shader is compiled and first drawn only after the page has loaded and gone
    // quiet, so the water never competes with the page's own first paint.
    let idle = 0, timer = 0
    const start = () => {
      s.glc = cv ? initGL(cv) : null
      if (!s.glc) return
      setGl("on")
      loop()
    }
    const ric = (window as Window & { requestIdleCallback?: Window["requestIdleCallback"] }).requestIdleCallback
    const whenIdle = () => {
      if (ric) idle = ric(start, { timeout: 1500 })
      else timer = window.setTimeout(start, 300)
    }
    if (document.readyState === "complete") whenIdle()
    else window.addEventListener("load", whenIdle, { once: true })
    const lost = (e: Event) => { e.preventDefault(); s.glc = null; setGl("off") }
    cv?.addEventListener("webglcontextlost", lost)
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) loop() })
    if (navRef.current) io.observe(navRef.current)
    const vis = () => { s.visible = document.visibilityState === "visible"; if (s.visible) loop() }
    document.addEventListener("visibilitychange", vis)
    return () => {
      window.removeEventListener("load", whenIdle)
      if (idle) window.cancelIdleCallback?.(idle)
      window.clearTimeout(timer)
      cv?.removeEventListener("webglcontextlost", lost)
      io.disconnect()
      document.removeEventListener("visibilitychange", vis)
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
  }, [loop])

  React.useLayoutEffect(() => { measure() }, [measure, items.length, compact])
  const measureRef = React.useRef(measure)
  React.useEffect(() => { measureRef.current = measure }, [measure])
  React.useEffect(() => {
    let lastW = -1
    const ro = new ResizeObserver(() => {
      const w = navRef.current?.offsetWidth ?? 0
      if (w !== lastW) { lastW = w; st.current.ready = false; measureRef.current() }
    })
    if (navRef.current) ro.observe(navRef.current)
    return () => ro.disconnect()
  }, [])
  React.useEffect(() => { loop() }, [tone, loop])
  // A page change: the water runs for about two seconds, then rests. Not on the
  // first load, when the page has better things to spend the time on.
  const woke = React.useRef(false)
  React.useEffect(() => {
    if (!woke.current) { woke.current = true; return }
    st.current.awakeUntil = performance.now() + 2000
    loop()
  }, [wake, loop])

  /* ---- interaction ---- */
  const local = (clientX: number, clientY: number) => {
    const r = navRef.current!.getBoundingClientRect()
    return { x: clientX - r.left + PAD, y: clientY - r.top + PAD }
  }
  const ripple = (x: number, y: number, amp: number) => {
    const s = st.current
    if (s.reduce) return
    s.rips.push({ x, y, age: 0, amp })
    loop()
  }
  const plip = () => {
    if (!sound) return
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      const ctx = (audio.current ||= new AC())
      const t = ctx.currentTime
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = "sine"
      o.frequency.setValueAtTime(420 + ((plips.current++ * 37) % 80), t)
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.07)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(g).connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.18)
    } catch { /* no audio here: stay silent */ }
  }

  const select = (i: number) => {
    setFx((f) => ({ i, n: f.n + 1 }))
    plip()
    if (i !== current) setInner(i)
    onSelect?.(i, items[i])
  }

  // Arrow keys move focus along the pill and do nothing else; Enter follows the link.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return
    const at = itemRefs.current.findIndex((el) => el === document.activeElement)
    if (at < 0) return
    e.preventDefault()
    const n = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (at + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length
    itemRefs.current[n]?.focus()
  }

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    const p = local(e.clientX, e.clientY)
    const s = st.current
    s.mouse.x = p.x
    s.mouse.y = p.y
    s.mouse.on = true
    loop()
  }

  return (
    <nav
      ref={navRef}
      className={["nimbus-nav", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-gl={gl}
      data-compact={compact === undefined ? undefined : String(compact)}
      data-empty={current < 0 ? "true" : undefined}
      aria-label="Main"
      onKeyDown={onKeyDown}
      onPointerMove={onMove}
      onPointerLeave={() => { st.current.mouse.on = false; loop() }}
      onPointerDown={(e) => { const p = local(e.clientX, e.clientY); ripple(p.x, p.y, 0.8) }}
      style={style}
    >
      <span className="nimbus-glass" aria-hidden="true" />
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />
      {items.map((it, i) => {
        const kind = it.fx ?? "pop"
        const playing = fx.i === i && kind !== "none"
        return (
          <Link
            key={it.href}
            ref={(el: HTMLAnchorElement | null) => { itemRefs.current[i] = el }}
            className="nimbus-item"
            href={it.href}
            aria-label={it.label}
            aria-current={i === page ? "page" : undefined}
            data-active={i === current ? "true" : undefined}
            onClick={() => select(i)}
          >
            {it.icon && (
              <span className="nv-ico" key={playing ? fx.n : 0} data-fx={playing ? kind : undefined}>
                {it.icon}
              </span>
            )}
            <span className="nimbus-label">{it.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default LiquidNavbar

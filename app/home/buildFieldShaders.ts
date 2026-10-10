/**
 * GLSL for the hero's Build Field (WebGL2). One gl.POINTS vertex per dot,
 * one draw call. Everything that changes per frame arrives as a uniform;
 * everything fixed per dot (lattice position, density, seed, wireframe and
 * clear weights) is an attribute written once per resize.
 *
 * Excitation e (0–1) is the max of the noise swell, the cursor bubble, the
 * ripple pool and the wireframe. e drives radius, alpha and an OKLab colour
 * ramp, so the ramp from base to active never passes through grey.
 */

/** 3D simplex noise, Ashima Arts / Stefan Gustavson (MIT). The Canvas 2D
    fallback in BuildField.tsx is a line-for-line port, so both match. */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  vec3 ns=.142857142857*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 n=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=n.x;p1*=n.y;p2*=n.z;p3*=n.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 aPos;      // lattice position, CSS px from the hero's top-left
in float aDensity; // static density gradient, 0.25–1
in float aSeed;    // 0–1, per dot
in float aWire;    // wireframe weight, 0–1
in float aClear;   // clear-zone weight, 0–1 (1 = behind text)

uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;       // ms
uniform vec3 uBase;        // OKLab
uniform vec3 uActive;      // OKLab
uniform float uMaxAlpha;
uniform float uWire;       // 0 → 1, 1.15 at the end of the scroll hand-off
uniform float uFade;       // whole-field alpha (fade-in, scroll hand-off)
uniform float uAssemble;   // seconds into the assembly; large = settled
uniform vec2 uCta;         // centre of the primary CTA, CSS px
uniform vec4 uCursor;      // xy position, z strength (0–1), w along-axis scale
uniform vec2 uCursorDir;   // unit direction of travel
uniform vec4 uRipA[4];     // origin xy, front, width
uniform vec4 uRipB[4];     // gain, directional flag, normal xy

out vec3 vColor;
out float vAlpha;
out float vEdge;

${NOISE}

const float TAU = 6.2831853;

vec3 oklabToSrgb(vec3 c) {
  float l = c.x + .3963377774 * c.y + .2158037573 * c.z;
  float m = c.x - .1055613458 * c.y - .0638541728 * c.z;
  float s = c.x - .0894841775 * c.y - 1.291485548 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  vec3 lin = vec3(
    4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
    -.0041960863 * l - .7034186147 * m + 1.707614701 * s);
  lin = clamp(lin, 0., 1.);
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1. / 2.4)) - .055, step(.0031308, lin));
}

void main() {
  // Assembly: each dot starts jittered and transparent, then settles with
  // expo.out, later the further it sits from the CTA (delay capped).
  float delay = min(length(aPos - uCta) * .0006, .45);
  float k = clamp((uAssemble - delay) / 1.2, 0., 1.);
  float settle = k >= 1. ? 1. : 1. - pow(2., -10. * k);
  float ang = fract(aSeed * 7.31) * TAU;
  vec2 pos = aPos + vec2(cos(ang), sin(ang)) * fract(aSeed * 13.7) * 36. * (1. - settle);

  // Noise swell: slow, seeded, identical on every load.
  float e = (snoise(vec3(pos * .004 + vec2(17.3, 41.9), uTime * .00012 + 7.1)) + 1.) * .5 * .35;

  // Cursor bubble, stretched along its direction of travel.
  vec2 d = pos - uCursor.xy;
  float along = dot(d, uCursorDir);
  vec2 perp = d - along * uCursorDir;
  float cd = sqrt(dot(perp, perp) + along * along * uCursor.w * uCursor.w);
  float bubble = pow(1. - smoothstep(0., 180., cd), 1.6) * uCursor.z;
  e = max(e, bubble);
  // Lens: dots inside the bubble lean toward the cursor, up to 2.5 px.
  float len = length(d);
  if (len > .5) pos -= d / len * 2.5 * bubble;

  // Ripples: radial rings, or straight sweeps when the flag is set.
  for (int i = 0; i < 4; i++) {
    vec4 a = uRipA[i];
    vec4 b = uRipB[i];
    if (b.x <= 0.) continue;
    float r = b.y > .5 ? abs(dot(pos - a.xy, b.zw)) : length(pos - a.xy);
    float x = (r - a.z) / a.w;
    e = max(e, exp(-x * x * 4.) * b.x);
  }

  // A website outline around the card, breathing slowly.
  e = max(e, aWire * uWire * (.62 + .08 * sin(uTime * .0009 + aSeed * TAU)));
  e = clamp(e, 0., 1.);

  float ease = 1. - pow(1. - e, 3.);
  float radius = mix(1.6, 4.2, ease);
  float alpha = min(mix(.10, .85, e), uMaxAlpha) * aDensity * (1. - aClear * .94) * settle * uFade;

  vColor = oklabToSrgb(mix(uBase, uActive, e));
  vAlpha = alpha;
  vEdge = radius / (radius + 1.);
  gl_PointSize = (radius + 1.) * 2. * uDpr;
  vec2 clip = pos / uRes * 2. - 1.;
  gl_Position = vec4(clip.x, -clip.y, 0., 1.);
}`;

export const FRAG = /* glsl */ `#version 300 es
precision mediump float;
in vec3 vColor;
in float vAlpha;
in float vEdge;
out vec4 outColor;
void main() {
  // A round dot with an fwidth edge: crisp at every DPR. Premultiplied.
  float d = length(gl_PointCoord - .5) * 2.;
  float w = fwidth(d);
  float a = (1. - smoothstep(vEdge - w, vEdge + w, d)) * vAlpha;
  if (a < .002) discard;
  outColor = vec4(vColor * a, a);
}`;

import type { CoverMotif } from "./posts";
import s from "./cover.module.css";

const WHITE = "#ffffff";
const INK = "#0b1b3d";
const BRAND = "#0060dc";
const SKY = "#5fb2ff";
const CYAN = "#01cffb";
const MUTED = "#c9d6ea";
const TEXT = { fontFamily: "var(--font-text)" };
const DISPLAY = { fontFamily: "var(--font-display)" };

/** A tick in a circle, for the checklist. */
const tick = (cx: number, cy: number) => `M${cx - 6} ${cy} l4.5 4.5 l8 -9`;

/** The drawing for each post, on a 640 × 400 board. */
function Motif({ motif }: { motif: CoverMotif }) {
  switch (motif) {
    case "keys":
      return (
        <g>
          {[
            { x: 92, y: 74, t: "Domain", hot: true },
            { x: 448, y: 92, t: "Hosting" },
            { x: 110, y: 296, t: "Website" },
            { x: 430, y: 300, t: "Google listing" },
          ].map((p) => (
            <g key={p.t}>
              <rect x={p.x} y={p.y} width={p.t.length * 10.5 + 34} height={36} rx={18} fill={p.hot ? CYAN : "none"} stroke={p.hot ? CYAN : SKY} strokeWidth={2} opacity={p.hot ? 1 : 0.8} />
              <text x={p.x + 17} y={p.y + 24} fontSize={17} fontWeight={600} fill={p.hot ? INK : SKY} style={TEXT}>{p.t}</text>
            </g>
          ))}
          <circle cx={232} cy={200} r={60} fill="none" stroke={WHITE} strokeWidth={16} />
          <circle cx={232} cy={200} r={18} fill={WHITE} opacity={0.14} />
          <rect x={288} y={190} width={208} height={20} rx={10} fill={WHITE} />
          <rect x={436} y={204} width={18} height={38} rx={5} fill={WHITE} />
          <rect x={470} y={204} width={18} height={26} rx={5} fill={WHITE} />
        </g>
      );
    case "checklist":
      return (
        <g>
          <g transform="rotate(8 500 280)">
            <rect x={450} y={228} width={120} height={96} rx={12} fill={SKY} />
            <path d="M462 310 l30 -34 l22 24 l14 -14 l30 24 z" fill={WHITE} opacity={0.9} />
            <circle cx={540} cy={254} r={10} fill={WHITE} opacity={0.9} />
          </g>
          <g transform="rotate(-4 320 205)">
            <rect x={196} y={58} width={248} height={294} rx={20} fill={WHITE} />
            <rect x={228} y={92} width={128} height={14} rx={7} fill={INK} />
            {[0, 1, 2, 3].map((i) => {
              const y = 148 + i * 50;
              const done = i < 3;
              return (
                <g key={i}>
                  {done ? <circle cx={242} cy={y} r={14} fill={BRAND} /> : <circle cx={242} cy={y} r={13} fill="none" stroke={MUTED} strokeWidth={2.5} />}
                  {done ? <path d={tick(242, y)} fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
                  <rect x={270} y={y - 6} width={[132, 104, 146, 88][i]} height={12} rx={6} fill={MUTED} />
                </g>
              );
            })}
          </g>
        </g>
      );
    case "domain":
      return (
        <g>
          <text x={320} y={136} textAnchor="middle" fontSize={150} fill={WHITE} opacity={0.08} style={DISPLAY}>.com</text>
          <rect x={104} y={160} width={432} height={68} rx={34} fill={WHITE} />
          <rect x={140} y={192} width={18} height={15} rx={3} fill={BRAND} />
          <path d="M143.5 192 v-5 a5.5 5.5 0 0 1 11 0 v5" fill="none" stroke={BRAND} strokeWidth={3} />
          <text x={174} y={204} fontSize={26} fontWeight={600} fill={INK} style={TEXT}>yourbusiness.com</text>
          <rect x={398} y={180} width={3} height={30} rx={1.5} fill={BRAND} />
          <rect x={232} y={258} width={176} height={42} rx={21} fill="none" stroke={CYAN} strokeWidth={2} />
          <text x={320} y={285} textAnchor="middle" fontSize={17} fontWeight={600} fill={CYAN} style={TEXT}>Owner: you</text>
        </g>
      );
    case "growth": {
      const bars = [64, 98, 132, 176, 228];
      const pts = bars.map((h, i) => `${188 + i * 66},${318 - h}`).join(" ");
      return (
        <g>
          <line x1={150} y1={320} x2={510} y2={320} stroke={WHITE} strokeOpacity={0.35} strokeWidth={2} />
          {bars.map((h, i) => (
            <rect key={i} x={170 + i * 66} y={318 - h} width={36} height={h} rx={6} fill={i === bars.length - 1 ? CYAN : WHITE} opacity={i === bars.length - 1 ? 1 : 0.18 + i * 0.12} />
          ))}
          <polyline points={pts} fill="none" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={188 + 4 * 66} cy={318 - 228} r={9} fill={CYAN} stroke={INK} strokeWidth={3} />
          <rect x={92} y={66} width={170} height={48} rx={24} fill={WHITE} />
          <path d="M120 112 l-6 18 l22 -16 z" fill={WHITE} />
          <text x={177} y={97} textAnchor="middle" fontSize={19} fontWeight={600} fill={INK} style={TEXT}>“Call Maria!”</text>
        </g>
      );
    }
    case "convert":
      return (
        <g>
          <path d="M118 306 C 190 110, 318 104, 432 270" fill="none" stroke={CYAN} strokeWidth={3} strokeDasharray="3 10" strokeLinecap="round" />
          {[{ x: 96, o: 0.35 }, { x: 128, o: 0.6 }].map((d) => <circle key={d.x} cx={d.x} cy={330} r={9} fill={WHITE} opacity={d.o} />)}
          <path d="M150 296 l0 44 l11 -11 l9 19 l8 -4 l-9 -18 l15 -1 z" fill={WHITE} />
          <rect x={382} y={58} width={152} height={286} rx={26} fill={WHITE} />
          <rect x={436} y={72} width={44} height={8} rx={4} fill={MUTED} />
          <rect x={402} y={104} width={112} height={14} rx={7} fill={INK} />
          <rect x={402} y={130} width={86} height={10} rx={5} fill={MUTED} />
          <rect x={402} y={150} width={100} height={10} rx={5} fill={MUTED} />
          <rect x={402} y={178} width={112} height={64} rx={10} fill={SKY} opacity={0.35} />
          <circle cx={458} cy={292} r={52} fill="none" stroke={CYAN} strokeOpacity={0.25} strokeWidth={2} />
          <circle cx={458} cy={292} r={36} fill="none" stroke={CYAN} strokeOpacity={0.5} strokeWidth={2} />
          <rect x={402} y={272} width={112} height={40} rx={20} fill={BRAND} />
          <text x={458} y={298} textAnchor="middle" fontSize={16} fontWeight={600} fill={WHITE} style={TEXT}>Call now</text>
        </g>
      );
    default:
      return <text x={320} y={250} textAnchor="middle" fontSize={150} fill={WHITE} opacity={0.9} style={DISPLAY}>Aa</text>;
  }
}

/**
 * A post's cover: a drawing of what the post is about on a navy blueprint
 * grid, with its issue number. Drawn in SVG, so it costs no image request
 * and stays sharp at any size; it's decoration (the title sits beside it),
 * so screen readers skip it.
 */
export default function Cover({ motif, seq, size = "card" }: { motif: CoverMotif; seq: number; size?: "card" | "hero" }) {
  return (
    <div className={`${s.cover} ${s[motif] ?? ""}`} data-size={size} aria-hidden="true">
      {seq ? <span className={s.no}>No. {String(seq).padStart(2, "0")}</span> : null}
      <svg className={s.art} viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" focusable="false">
        <Motif motif={motif} />
      </svg>
    </div>
  );
}

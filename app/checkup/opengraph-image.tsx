import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Free Website Checkup: a phone wireframe with its parts being checked, from Stringham Web Design";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function font(file: string) {
  try { return fs.readFileSync(path.join(process.cwd(), "app", "blog", "fonts", file)); } catch { return null; }
}

const WIRE = "#c9d2e3";

/**
 * The share image: the checkup's wireframe phone (one part highlighted as
 * being checked, two marked as leaks, the rest passing) beside the name
 * and what it is.
 */
export default async function Image() {
  const display = font("Fraunces-500.woff"), text = font("InterTight-500.woff");
  const fonts = [display && { name: "Fraunces", data: display, weight: 500 as const, style: "normal" as const }, text && { name: "Inter Tight", data: text, weight: 500 as const, style: "normal" as const }].filter(Boolean) as { name: string; data: Buffer; weight: 500; style: "normal" }[];
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-lockup@3x.png"));
  const zone = (bg: string, outline?: string) => ({ display: "flex", flexDirection: "column" as const, gap: 6, padding: 7, borderRadius: 10, background: bg, border: outline ? `2px ${outline.includes("dash") ? "dashed" : "solid"} ${outline.replace("dash ", "")}` : "2px solid transparent" });
  const bar = (w: string, h = 8, c = WIRE) => ({ width: w, height: h, borderRadius: 8, background: c });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f6fa", fontFamily: text ? "Inter Tight, sans-serif" : "sans-serif" }}>
        <div style={{ width: 14, height: "100%", background: "linear-gradient(180deg, #073f82 0%, #0067ec 45%, #0092fc 75%, #01cffb 100%)" }} />
        <div style={{ display: "flex", flex: 1, padding: "56px 64px 52px 64px", gap: 56, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flex: 1 }}>
            <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" style={{ height: 52, alignSelf: "flex-start" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", color: "#0352ad", fontSize: 22, letterSpacing: 2, textTransform: "uppercase" }}>10 questions · about 2 minutes</div>
              <div style={{ display: "flex", fontFamily: display ? "Fraunces, serif" : "serif", fontSize: 76, lineHeight: 1.02, letterSpacing: -2, color: "#0b1b3d" }}>Free Website Checkup</div>
              <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: "#34425a", maxWidth: 560 }}>See where your website loses customers, with a fix for each leak.</div>
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "#5b6880" }}>Free · no email needed · stringhamwebdesign.com/checkup</div>
          </div>
          <div style={{ display: "flex", position: "relative", width: 300, height: 530, padding: 12, borderRadius: 46, background: "#0b1b3d", boxShadow: "0 30px 60px -30px rgba(11,27,61,0.5)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", height: "100%", padding: "34px 18px 18px", borderRadius: 36, background: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, display: "flex", width: "100%", height: 7, background: "#ede5d3" }}><div style={{ width: "62%", height: 7, background: "#1f7a4d" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={bar("64px", 14)} /><div style={bar("20px", 10)} /></div>
              <div style={zone("#ddf1e6")}><div style={bar("100%", 18, "#0b1b3d")} /><div style={bar("72%", 18, "#0b1b3d")} /></div>
              <div style={zone("#e6effd", "dash #0060dc")}><div style={bar("100%")} /><div style={bar("100%")} /><div style={bar("60%")} /></div>
              <div style={zone("#f7dede", "#b23a3a")}><div style={{ display: "flex", alignSelf: "flex-start", fontSize: 13, color: "#5b6880", border: `1px solid ${WIRE}`, borderRadius: 20, padding: "2px 10px" }}>From $___</div></div>
              <div style={zone("#ddf1e6")}><div style={{ display: "flex", height: 40, borderRadius: 10, background: "#0060dc", alignItems: "center", justifyContent: "center" }}><div style={bar("45%", 8, "#ffffff")} /></div></div>
              <div style={zone("#faedd5")}><div style={bar("100%")} /><div style={bar("100%")} /><div style={bar("100%")} /></div>
              <div style={zone("#f7dede", "#b23a3a")}><div style={{ display: "flex", color: "#a8670a", fontSize: 16, letterSpacing: 2 }}>★★★★★</div><div style={bar("100%")} /><div style={bar("55%")} /></div>
              <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, display: "flex", gap: 8 }}>
                <div style={{ display: "flex", flex: 1, height: 34, borderRadius: 10, background: "#0b1b3d", color: "#fff", fontSize: 12, alignItems: "center", justifyContent: "center", letterSpacing: 1 }}>CALL</div>
                <div style={{ display: "flex", flex: 1, height: 34, borderRadius: 10, background: "#0b1b3d", color: "#fff", fontSize: 12, alignItems: "center", justifyContent: "center", letterSpacing: 1 }}>TEXT</div>
              </div>
            </div>
            <div style={{ position: "absolute", top: 196, left: -18, display: "flex", width: 34, height: 34, borderRadius: 34, background: "#b23a3a", color: "#fff", fontSize: 18, alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>1</div>
            <div style={{ position: "absolute", top: 368, left: -18, display: "flex", width: 34, height: 34, borderRadius: 34, background: "#b23a3a", color: "#fff", fontSize: 18, alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>2</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { site } from "../../data/site";
import { getPost, longDate } from "../lib";

export const alt = "Stringham Web Design blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A bundled font, or nothing (the image then falls back to a system face). */
function font(file: string) {
  try { return fs.readFileSync(path.join(process.cwd(), "app", "blog", "fonts", file)); } catch { return null; }
}

/**
 * The share image for a post: the logo, the title in the display face, the
 * date and author, and the brand ribbon down the left, generated from the
 * post's frontmatter so every post gets one without a design pass.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? site.name;
  const meta = post ? `${post.author} · ${longDate(post.date)} · ${post.readMinutes} min read` : site.legalName;
  const display = font("Outfit-500.woff"), text = font("DMSans-500.woff");
  const fonts = [display && { name: "Outfit", data: display, weight: 500 as const, style: "normal" as const }, text && { name: "DM Sans", data: text, weight: 500 as const, style: "normal" as const }].filter(Boolean) as { name: string; data: Buffer; weight: 500; style: "normal" }[];
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-lockup-light@3x.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const big = title.length > 60;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0908", fontFamily: text ? "DM Sans, sans-serif" : "sans-serif" }}>
        <div style={{ width: 14, height: "100%", background: "linear-gradient(180deg, #ffd9a8 0%, #ffd9a8 40%, #ff9a5a 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px 56px 70px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={logoSrc} alt="" style={{ height: 56 }} />
            <div style={{ padding: "8px 16px", borderRadius: 999, background: "rgba(255,217,168,0.14)", color: "#ffd9a8", fontSize: 20, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>{post?.category || "Blog"}</div>
          </div>
          <div style={{ display: "flex", fontFamily: display ? "Outfit, sans-serif" : "sans-serif", fontWeight: 500, fontSize: big ? 62 : 74, lineHeight: 1.04, letterSpacing: -2.4, color: "#f3e7d3", maxWidth: 1000 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#cdbfa8" }}>{meta}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

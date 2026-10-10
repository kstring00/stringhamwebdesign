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
  const display = font("Fraunces-500.woff"), text = font("InterTight-500.woff");
  const fonts = [display && { name: "Fraunces", data: display, weight: 500 as const, style: "normal" as const }, text && { name: "Inter Tight", data: text, weight: 500 as const, style: "normal" as const }].filter(Boolean) as { name: string; data: Buffer; weight: 500; style: "normal" }[];
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "brand", "logo-lockup@3x.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const big = title.length > 60;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f6fa", fontFamily: text ? "Inter Tight, sans-serif" : "sans-serif" }}>
        <div style={{ width: 14, height: "100%", background: "linear-gradient(180deg, #073f82 0%, #0067ec 45%, #0092fc 75%, #01cffb 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px 56px 70px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={logoSrc} alt="" style={{ height: 56 }} />
            <div style={{ padding: "8px 16px", borderRadius: 999, background: "#e6effd", color: "#0352ad", fontSize: 20, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>{post?.category || "Blog"}</div>
          </div>
          <div style={{ display: "flex", fontFamily: display ? "Fraunces, serif" : "serif", fontSize: big ? 58 : 68, lineHeight: 1.06, letterSpacing: -1.5, color: "#0b1b3d", maxWidth: 1000 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#34425a" }}>{meta}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

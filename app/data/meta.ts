import type { Metadata } from "next";

import { site } from "./site";

/**
 * Per-page metadata. Canonical and og:url always match, and the social title
 * and description are the page's own rather than the homepage's. `title` is
 * run through the layout's "%s | Stringham Web Design" template unless
 * `absolute` is set.
 */
// A page that sets its own openGraph replaces the layout's, file-based
// social image included, so every page names its image explicitly (the
// shared one unless a niche page passes its own).
const DEFAULT_IMAGE = {
  url: "/opengraph-image.png",
  alt: "Stringham Web Design logo. Websites and Google listings that bring League City businesses more calls. Free Google check, websites from $1,800, no ad spend required.",
};

export function pageMeta({ title, absolute, description, path, image, imageAlt }: { title?: string; absolute?: string; description: string; path: string; image?: string; imageAlt?: string }): Metadata {
  const full = absolute ?? `${title} | ${site.name}`;
  // The alt describes the picture. A page with its own image should pass
  // one; the fallback is its title with "&" spelled out, so no scraper shows
  // a raw entity.
  const alt = imageAlt ?? (image ? full.replace(/\s*&\s*/g, " and ") : DEFAULT_IMAGE.alt);
  const img = { url: image ?? DEFAULT_IMAGE.url, width: 1200, height: 630, alt };
  return {
    title: absolute ? { absolute } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, locale: "en_US", url: path, title: full, description, images: [img] },
    twitter: { card: "summary_large_image", title: full, description, images: [img] },
  };
}

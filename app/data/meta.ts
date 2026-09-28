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
const DEFAULT_IMAGE = "/opengraph-image.png";

export function pageMeta({ title, absolute, description, path, image: imageUrl = DEFAULT_IMAGE }: { title?: string; absolute?: string; description: string; path: string; image?: string }): Metadata {
  const full = absolute ?? `${title} | ${site.name}`;
  const image = { url: imageUrl, width: 1200, height: 630, alt: full };
  return {
    title: absolute ? { absolute } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, locale: "en_US", url: path, title: full, description, images: [image] },
    twitter: { card: "summary_large_image", title: full, description, images: [image] },
  };
}

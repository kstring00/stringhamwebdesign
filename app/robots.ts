import type { MetadataRoute } from "next";

/**
 * Crawl rules. The portal is private and every API route is machinery, so
 * both are disallowed outright; the receipt page is per-visitor and already
 * carries noindex, but keeping crawlers out of it saves them the trip. The
 * origin matches sitemap.ts, so the two never point at different hosts.
 */
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stringhamwebdesign.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/portal/", "/api/", "/quote/received", "/start"],
    },
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}

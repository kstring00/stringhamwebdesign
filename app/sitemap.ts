import type { MetadataRoute } from "next";

import { projects } from "./data/projects";
import { RESOURCE_ORDER } from "./resources/lib";

/**
 * Every public page. Case studies come from the same data /work renders and
 * resources from the same order /resources renders, so a new project or
 * document lands here without a second edit.
 *
 * The origin is NEXT_PUBLIC_SITE_URL when set (it is, in Vercel), with the
 * production domain as the fallback so a local build still emits real URLs.
 */
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stringhamwebdesign.com").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({
    url: `${ORIGIN}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  });

  return [
    at("/", 1, "monthly"),
    at("/about", 0.7, "yearly"),
    at("/work", 0.8, "monthly"),
    ...projects.map((p) => at(`/work/${p.slug}`, 0.6, "yearly")),
    at("/pricing", 0.9, "monthly"),
    at("/quote", 0.8, "yearly"),
    at("/resources", 0.7, "monthly"),
    ...RESOURCE_ORDER.map((slug) => at(`/resources/${slug}`, 0.6, "yearly")),
  ];
}

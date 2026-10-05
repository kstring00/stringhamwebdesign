import type { MetadataRoute } from "next";

import { site } from "./data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({ url: `${site.url}${path}`, lastModified: new Date(), changeFrequency, priority });
  return [
    at("/", 1, "monthly"),
    at("/family-resource-hub", 0.9, "monthly"),
    at("/terms", 0.3, "yearly"),
    at("/privacy", 0.2, "yearly"),
  ];
}

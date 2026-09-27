import type { MetadataRoute } from "next";

import { site } from "./data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({ url: `${site.url}${path}`, lastModified: new Date(), changeFrequency, priority });
  return [
    at("/", 1, "monthly"),
    at("/work", 0.8, "monthly"),
    at("/services", 0.8, "monthly"),
    at("/family-resource-hub", 0.9, "monthly"),
    at("/about", 0.6, "yearly"),
    at("/contact", 0.8, "yearly"),
    at("/privacy", 0.2, "yearly"),
  ];
}

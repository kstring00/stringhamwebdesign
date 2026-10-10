import type { MetadataRoute } from "next";

import { getPosts } from "./blog/lib";
import { site } from "./data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({ url: `${site.url}${path}`, lastModified: new Date(), changeFrequency, priority });
  return [
    at("/", 1, "monthly"),
    at("/work", 0.9, "monthly"),
    at("/google-check", 0.9, "monthly"),
    at("/partners", 0.8, "monthly"),
    at("/blog", 0.7, "weekly"),
    ...getPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "monthly" as const, priority: 0.7 })),
    at("/family-resource-hub", 0.7, "monthly"),
    at("/terms", 0.3, "yearly"),
    at("/privacy", 0.2, "yearly"),
  ];
}

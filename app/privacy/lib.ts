import fs from "node:fs";
import path from "node:path";

import { marked } from "marked";

const FILE = path.join(process.cwd(), "content", "privacy.md");

/** Bump whenever content/privacy.md changes in substance. */
export const LAST_UPDATED = "2026-09-27";

export function lastUpdatedLabel() {
  return new Date(`${LAST_UPDATED}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

let cache: { title: string; html: string } | null = null;

export function getPrivacyDoc() {
  if (cache) return cache;
  const raw = fs.readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");
  const titleMatch = raw.match(/^#\s+(.+?)\s*$/m);
  if (!titleMatch) throw new Error('content/privacy.md has no "# Title" line');
  const body = raw.replace(titleMatch[0], "").trim();
  const html = (marked.parse(body, { async: false, gfm: true }) as string)
    .replace(/<h1(\s[^>]*)?>/g, "<h2$1>").replace(/<\/h1>/g, "</h2>")
    .replace(/<a href="http/g, '<a target="_blank" rel="noopener noreferrer" href="http');
  cache = { title: titleMatch[1].trim(), html };
  return cache;
}

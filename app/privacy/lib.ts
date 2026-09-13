import fs from "node:fs";
import path from "node:path";

import { marked } from "marked";

/**
 * The privacy policy: one Markdown document at content/privacy.md, rendered
 * the same way the /resources documents are and wearing the same styles.
 *
 * It is not part of RESOURCE_ORDER on purpose — it is a legal page reached
 * from the footer and the quote form, not a guide, so it should not appear in
 * the resources index or carry a "03 / 05" signal.
 *
 * The only edits made to the Markdown are structural: the leading "# Title"
 * becomes the page's H1, any other H1 is demoted so the page has exactly one,
 * and a few motion attributes are added.
 */

const FILE = path.join(process.cwd(), "content", "privacy.md");

/**
 * The date shown at the top of the page and in the page's own "Changes"
 * section. Bump it whenever content/privacy.md changes in substance — it is
 * deliberately not the file's mtime, which every checkout and deploy would
 * move without anything having actually changed.
 */
export const LAST_UPDATED = "2026-09-13";

export function lastUpdatedLabel() {
  return new Date(`${LAST_UPDATED}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type PrivacyDoc = { title: string; html: string };

let cache: PrivacyDoc | null = null;

export function getPrivacyDoc(): PrivacyDoc {
  if (cache) return cache;

  const raw = fs.readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");

  const titleMatch = raw.match(/^#\s+(.+?)\s*$/m);
  if (!titleMatch) throw new Error('content/privacy.md has no "# Title" line');
  const title = titleMatch[1].trim();
  const body = raw.replace(titleMatch[0], "").trim();

  const html = (marked.parse(body, { async: false, gfm: true }) as string)
    .replace(/<h1(\s[^>]*)?>/g, "<h2$1>")
    .replace(/<\/h1>/g, "</h2>")
    .replace(/<h2>/g, "<h2 data-reveal>")
    .replace(/<hr>/g, "<hr data-rule>");

  cache = { title, html };
  return cache;
}

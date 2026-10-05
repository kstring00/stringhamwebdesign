import fs from "node:fs";
import path from "node:path";

import { marked } from "marked";

const FILE = path.join(process.cwd(), "content", "service-terms.md");

let cache: { title: string; html: string } | null = null;

/** content/service-terms.md, word for word, as HTML. The "# Service Terms"
    line becomes the page's H1; everything else renders as written. */
export function getTermsDoc() {
  if (cache) return cache;
  const raw = fs.readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");
  const titleMatch = raw.match(/^#\s+(.+?)\s*$/m);
  if (!titleMatch) throw new Error('content/service-terms.md has no "# Title" line');
  const body = raw.replace(titleMatch[0], "").trim();
  const html = (marked.parse(body, { async: false, gfm: true }) as string)
    .replace(/<h1(\s[^>]*)?>/g, "<h2$1>").replace(/<\/h1>/g, "</h2>")
    .replace(/<a href="http/g, '<a target="_blank" rel="noopener noreferrer" href="http');
  cache = { title: titleMatch[1].trim(), html };
  return cache;
}

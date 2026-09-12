import fs from "node:fs";
import path from "node:path";

import { marked } from "marked";

/**
 * The public resources: five Markdown documents in content/resources/,
 * rendered as written. Nothing here rewrites the content. The only edits
 * made to the Markdown are structural — the leading "# Title" becomes the
 * page's H1, so it is lifted out of the body; any other H1 in a body is
 * demoted so each page has exactly one; tables get a scroll wrapper so they
 * can never widen a phone screen; and a few motion attributes are added.
 *
 * Read from disk at build time (these pages are static), so a new document
 * is a new file, and an edit is an edit to the Markdown.
 */

const DIR = path.join(process.cwd(), "content", "resources");

/** Display order, as briefed. Slugs are the filenames. */
export const RESOURCE_ORDER = [
  "what-happens-step-by-step",
  "who-owns-what",
  "what-it-costs-to-keep-running",
  "what-i-need-from-you",
  "the-words-ill-use",
] as const;

export type ResourceSlug = (typeof RESOURCE_ORDER)[number];

/**
 * Meta descriptions, written by hand for each document. The <title> is
 * derived from the document's own heading; this is the one thing about a page
 * that is not in the Markdown.
 */
const DESCRIPTIONS: Record<ResourceSlug, string> = {
  "what-happens-step-by-step":
    "The seven steps of a website build with Kyle Stringham, from sending the brief to holding every login, with what each phase takes and what usually slows it down.",
  "who-owns-what":
    "Exactly what you own when Kyle Stringham builds your website: the domain, the hosting, the code, and every account — in your name, on your card, with no exit fee.",
  "what-it-costs-to-keep-running":
    "The real monthly and yearly cost of keeping a small-business website online after the build: domain, hosting, email, payments, and what is free.",
  "what-i-need-from-you":
    "A plain checklist of what to send before a website build starts: logo, business details, photos, words, and accounts — so the timeline holds.",
  "the-words-ill-use":
    "Every term you are likely to hear during a website project, in plain English: domain, DNS, hosting, Vercel, GitHub, SSL, Stripe, scope, and more.",
};

export type Resource = {
  slug: ResourceSlug;
  /** The document's own first-level heading, used as the page H1 and <title>. */
  title: string;
  /** The opening paragraph, as plain text, for the index card. */
  summary: string;
  description: string;
  /** Body HTML with the title heading removed. */
  html: string;
  words: number;
  minutes: number;
  /** 1-based position in RESOURCE_ORDER, for the "01 / 05" signal. */
  number: number;
};

function stripInline(md: string) {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function load(slug: ResourceSlug, number: number): Resource {
  const raw = fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8").replace(/\r\n/g, "\n");

  // Lift the leading H1 out of the body. It is rendered by the page as the
  // one H1, so leaving it in would give the page two.
  const titleMatch = raw.match(/^#\s+(.+?)\s*$/m);
  if (!titleMatch) throw new Error(`content/resources/${slug}.md has no "# Title" line`);
  const title = stripInline(titleMatch[1]);
  const body = raw.replace(titleMatch[0], "").trim();

  // The first paragraph, as plain text, is the card summary.
  const firstPara = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|---|\||[-*] )/.test(p));
  const summary = stripInline(firstPara ?? "");

  let html = marked.parse(body, { async: false, gfm: true }) as string;

  // Structural adjustments only — see the file comment.
  html = html
    .replace(/<h1(\s[^>]*)?>/g, "<h2$1>")
    .replace(/<\/h1>/g, "</h2>")
    .replace(/<h2>/g, '<h2 data-reveal>')
    .replace(/<hr>/g, '<hr data-rule>')
    .replace(/<table>/g, '<div class="tableWrap" tabindex="0" role="region" aria-label="Table, scrolls sideways on small screens"><table>')
    .replace(/<\/table>/g, "</table></div>");

  const words = stripInline(body).split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title,
    summary,
    description: DESCRIPTIONS[slug],
    html,
    words,
    minutes: Math.max(1, Math.ceil(words / 220)),
    number,
  };
}

let cache: Resource[] | null = null;

export function getResources(): Resource[] {
  if (!cache) cache = RESOURCE_ORDER.map((slug, i) => load(slug, i + 1));
  return cache;
}

export function getResource(slug: string): Resource | undefined {
  return getResources().find((r) => r.slug === slug);
}

export function isResourceSlug(slug: string): slug is ResourceSlug {
  return (RESOURCE_ORDER as readonly string[]).includes(slug);
}

/** "01 / 05" */
export function signal(n: number) {
  return `${String(n).padStart(2, "0")} / ${String(RESOURCE_ORDER.length).padStart(2, "0")}`;
}

import fs from "node:fs";
import path from "node:path";

import { marked } from "marked";

import { site } from "../data/site";

const DIR = path.join(process.cwd(), "content", "blog");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  /** Minutes, at 200 words a minute. */
  readMinutes: number;
};

export type PostDoc = Post & {
  /** The body, as HTML, without the title and the closing call to action. */
  html: string;
  /** The closing section's paragraph, for the CTA card. */
  ctaHtml: string;
  /** The intro paragraphs (before the first rule or heading), for the share image and the index. */
  intro: string;
  /** The numbered steps, for the table of contents. */
  steps: { id: string; label: string }[];
};

/**
 * Frontmatter is the simple kind: `key: value` lines between two `---`
 * rules, values optionally quoted. Dates are kept as the ISO string they
 * were written as.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    data[kv[1]] = v;
  }
  return { data, body: raw.slice(m[0].length) };
}

/** "October 10, 2026", from an ISO date, in US English. */
export function longDate(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** A heading's id: lower case, words joined with hyphens, the step number kept. */
function headingId(text: string) {
  return text.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[#a-z0-9]+;/gi, "").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const CTA_HEADING = /want someone to handle it for you/i;

const ENTITIES: Record<string, string> = { "&amp;": "&", "&#39;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" };
/** Plain text from a rendered fragment: tags gone, entities back to characters. */
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&[#a-z0-9]+;/gi, (e) => ENTITIES[e] ?? e);

function render(slug: string, raw: string): PostDoc {
  const { data, body } = parseFrontmatter(raw);
  // The page renders the H1 from the frontmatter, so the body's own H1 goes.
  const withoutH1 = body.replace(/^\s*#\s+.+\r?\n/, "");
  // The closing section becomes the CTA card.
  const lines = withoutH1.split(/\r?\n/);
  const ctaAt = lines.findIndex((l) => /^##\s+/.test(l) && CTA_HEADING.test(l));
  const mainMd = (ctaAt >= 0 ? lines.slice(0, ctaAt) : lines).join("\n").replace(/\n-{3,}\s*$/, "").trim();
  const ctaMd = ctaAt >= 0 ? lines.slice(ctaAt + 1).join("\n") : "";

  const words = mainMd.replace(/[#>*_\-[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
  const intro = mainMd.split(/\n(?=---|## )/)[0].split(/\n\n+/).map((p) => p.trim()).filter(Boolean).map((p) => p.replace(/\*\*([^*]+)\*\*/g, "$1")).join(" ");

  const steps: { id: string; label: string }[] = [];
  let html = marked.parse(mainMd, { async: false, gfm: true }) as string;
  html = html
    // Headings get ids; numbered ones get their number as a badge and a reveal.
    .replace(/<h2>(.*?)<\/h2>/g, (_m, inner: string) => {
      const id = headingId(inner);
      const num = inner.match(/^(\d+)\.\s*(.*)$/);
      if (num) { steps.push({ id, label: plain(num[2]) }); return `<h2 id="${id}" class="step" data-reveal><span class="num" aria-hidden="true">${num[1]}</span><span class="stepText">${num[2]}</span></h2>`; }
      return `<h2 id="${id}" data-reveal>${inner}</h2>`;
    })
    // The email template is a blockquote: give it an email frame and a label.
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/, '<figure class="email"><figcaption>Email template · copy, fill in the blanks, send</figcaption><blockquote>$1</blockquote></figure>')
    // External links open in a new tab, safely.
    .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
    // The "four keys" diagram sits right after section 2's list.
    .replace(/(<h2 id="2-[^"]*"[\s\S]*?<\/ol>\s*<p>[\s\S]*?<\/p>)/, "$1<!--keys-->");

  const ctaHtml = (marked.parse(ctaMd, { async: false, gfm: true }) as string)
    // The card has its own buttons and signature; drop the link line and the signature.
    .replace(/<p><strong><a href="sms:[\s\S]*?<\/p>/, "")
    .replace(/<p><em>[\s\S]*?<\/em><\/p>/, "")
    .trim();

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? site.person,
    category: data.category ?? "",
    readMinutes: Math.max(1, Math.round(words / 200)),
    html,
    ctaHtml,
    intro,
    steps,
  };
}

const cache = new Map<string, PostDoc>();

/** Every post in content/blog, newest first. */
export function getPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => getPost(f.replace(/\.md$/, "")))
    .filter((p): p is PostDoc => Boolean(p))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ html: _h, ctaHtml: _c, intro: _i, steps: _s, ...post }) => post);
}

/** One post by slug (the file name, or the frontmatter slug), or null. */
export function getPost(slug: string): PostDoc | null {
  if (cache.has(slug)) return cache.get(slug)!;
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file) || path.dirname(file) !== DIR) return null;
  const raw = fs.readFileSync(file, "utf8");
  const doc = render(slug, raw);
  if (doc.slug !== slug) return null;
  const { data } = parseFrontmatter(raw);
  const finalSlug = data.slug || slug;
  const out = { ...doc, slug: finalSlug };
  cache.set(slug, out);
  return out;
}

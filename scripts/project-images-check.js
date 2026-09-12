// Three images in this repo were truncated uploads: the bytes were committed,
// the file looked plausible in a listing, and every page that used one rendered
// an empty box. Nothing caught it because nothing ever decoded them. This does.
//
// Every image app/data/projects.ts references is decoded here, and then loaded
// in a real browser on every case study and on the pages that reuse them, so a
// file that exists but cannot be read fails the build check instead of shipping.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

(async () => {
  // 1. Every referenced file exists on disk and decodes.
  const src = fs.readFileSync('app/data/projects.ts', 'utf8');
  const refs = [...new Set((src.match(/"\/[^"]+\.(webp|png|jpg|jpeg)"/g) || []).map(s => s.slice(1, -1)))];
  ok('projects.ts references at least one image per project', refs.length >= 4, `${refs.length} paths`);
  for (const ref of refs) {
    const file = path.join('public', ref);
    if (!fs.existsSync(file)) { ok(`${ref} exists on disk`, false); continue; }
    const kb = Math.round(fs.statSync(file).size / 1024);
    try {
      const m = await sharp(file).metadata();
      ok(`${ref} decodes (${m.width}x${m.height}, ${kb} KB)`, m.width > 0 && m.height > 0);
    } catch (e) {
      ok(`${ref} decodes`, false, `${kb} KB — ${e.message}`);
    }
  }

  // 2. Every case study and the pages that reuse these images render them.
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const slugs = [...src.matchAll(/slug: "([^"]+)"/g)].map(m => m[1]);
  for (const route of ['/', '/work', ...slugs.map(s => `/work/${s}`)]) {
    await p.goto(BASE + route, { waitUntil: 'networkidle' });
    await p.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    });
    const bad = await p.evaluate(() => [...document.images]
      .filter(i => i.currentSrc && i.naturalWidth === 0)
      .map(i => new URL(i.currentSrc).pathname));
    const count = await p.evaluate(() => document.images.length);
    ok(`${route}: all ${count} images decode in the browser`, bad.length === 0, JSON.stringify(bad));
    const noAlt = await p.evaluate(() => [...document.images]
      .filter(i => i.getAttribute('alt') === null)
      .map(i => new URL(i.currentSrc || i.src).pathname));
    ok(`${route}: every image has an alt attribute`, noAlt.length === 0, JSON.stringify(noAlt));
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall project image checks passed');
  process.exit(fails ? 1 : 0);
})();

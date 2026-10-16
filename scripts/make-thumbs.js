// Thumbnails for the home page's work wall: every capture in
// public/showcase/<key>-{desktop,mobile}.webp, written 520px wide as AVIF
// and WebP to public/showcase/thumbs/. The wall shows tiles at about 260px,
// so the full 1440px captures would be wasted bytes.
//
// Runs as `prebuild` (so Vercel regenerates them) and skips any thumb that
// is newer than its source. The outputs are committed too, so a build never
// depends on this step: if sharp is missing it says so and exits cleanly.
//   node scripts/make-thumbs.js
const fs = require('fs');
const path = require('path');

const SRC = path.join(process.cwd(), 'public', 'showcase');
const OUT = path.join(SRC, 'thumbs');
const WIDTH = 520;

let sharp;
try { sharp = require('sharp'); } catch { console.warn('make-thumbs: sharp is not installed; keeping the committed thumbnails.'); process.exit(0); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const sources = fs.readdirSync(SRC).filter((f) => /-(desktop|mobile)\.webp$/.test(f));
  let made = 0, kept = 0;
  for (const file of sources) {
    const base = file.replace(/\.webp$/, '');
    const src = path.join(SRC, file);
    const srcTime = fs.statSync(src).mtimeMs;
    for (const [ext, make] of [['avif', (i) => i.avif({ quality: 55, effort: 6 })], ['webp', (i) => i.webp({ quality: 78 })]]) {
      const out = path.join(OUT, `${base}.${ext}`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) { kept++; continue; }
      await make(sharp(src).resize({ width: WIDTH, withoutEnlargement: true })).toFile(out);
      made++;
    }
  }
  console.log(`make-thumbs: ${made} written, ${kept} up to date, from ${sources.length} captures.`);
})().catch((e) => { console.error('make-thumbs failed:', e.message); process.exit(1); });

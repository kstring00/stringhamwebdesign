// The site's share image, app/opengraph-image.png (1200 x 630): the home
// hero in small. The hero's still, its shade, the name with its asterisk,
// and the page's two-line heading.
//   node scripts/share-image.js
// Run it again when the hero's words or its picture change. The words here
// are the hero's own (app/home/Hero.tsx).
//
// Needs Playwright (not a project dependency):
//   npm install --no-save playwright
// and a Chromium: CHROME_PATH, or one under /opt/pw-browsers, or Playwright's own.
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const b64 = (...p) => fs.readFileSync(path.join(root, ...p)).toString('base64');

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const dir = '/opt/pw-browsers';
  if (!fs.existsSync(dir)) return undefined;
  for (const d of fs.readdirSync(dir).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
    for (const sub of ['chrome-linux64', 'chrome-linux']) {
      const bin = path.join(dir, d, sub, 'chrome');
      if (fs.existsSync(bin)) return bin;
    }
  }
  return undefined;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Outfit"; font-weight: 500; src: url(data:font/woff;base64,${b64('app', 'blog', 'fonts', 'Outfit-500.woff')}) format("woff"); }
@font-face { font-family: "DM Sans"; font-weight: 500; src: url(data:font/woff;base64,${b64('app', 'blog', 'fonts', 'DMSans-500.woff')}) format("woff"); }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #0a0908; color: #f3e7d3; font-family: "DM Sans", sans-serif; font-weight: 500; }
.plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 60% 30%; }
.shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,6,5,.3) 0%, rgba(8,6,5,0) 26%, rgba(8,6,5,.1) 48%, rgba(8,6,5,.9) 100%); }
.in { position: absolute; left: 56px; right: 56px; bottom: 48px; display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; }
.name { position: relative; display: inline-block; font-family: "Outfit", sans-serif; font-size: 148px; letter-spacing: -0.045em; line-height: 0.86; }
.name i { position: absolute; top: -8px; left: 100%; margin-left: 6px; color: #ffd9a8; font-size: 50px; font-style: normal; letter-spacing: 0; line-height: 1; }
.sub { margin: 22px 0 0 6px; font-size: 20px; letter-spacing: 0.52em; text-transform: uppercase; }
.side { width: 400px; padding-bottom: 4px; }
.eyebrow { color: #ffd9a8; font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase; }
h1 { margin-top: 12px; font-family: "Outfit", sans-serif; font-weight: 500; font-size: 52px; letter-spacing: -0.03em; line-height: 1.02; }
p { margin-top: 12px; color: #f3e7d3; font-size: 23px; line-height: 1.35; }
</style></head><body>
<img class="plate" src="data:image/jpeg;base64,${b64('public', 'hero', 'hero-plate.jpg')}" alt="">
<div class="shade"></div>
<div class="in">
  <div><div class="name">Stringham<i>*</i></div><div class="sub">Web Design</div></div>
  <div class="side">
    <div class="eyebrow">* Not a template</div>
    <h1>Why blend in?</h1>
    <p>Custom websites for therapists and mental health practices.</p>
  </div>
</div>
</body></html>`;

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, 'app', 'opengraph-image.png') });
  await browser.close();
  console.log('wrote app/opengraph-image.png');
})().catch((e) => { console.error('share image failed:', e.message); process.exit(1); });

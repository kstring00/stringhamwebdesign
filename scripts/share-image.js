// The site's share image, app/opengraph-image.png (1200 x 630): the logo,
// the hero's eyebrow and headline, and the unraveling line.
//   node scripts/share-image.js
// Run it again when the hero's words change. The words here are the hero's
// own (app/home/Hero.tsx); the line is the same generated path.
//
// Needs Playwright (not a project dependency):
//   npm install --no-save playwright
// and a Chromium: CHROME_PATH, or one under /opt/pw-browsers, or Playwright's own.
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const b64 = (...p) => fs.readFileSync(path.join(root, ...p)).toString('base64');
const heroPath = fs.readFileSync(path.join(root, 'app', 'home', 'heroPath.ts'), 'utf8').match(/"(M[^"]+)"/)[1];

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
@font-face { font-family: "Instrument Serif"; font-style: normal; src: url(data:font/woff;base64,${b64('app', 'blog', 'fonts', 'InstrumentSerif-400.woff')}) format("woff"); }
@font-face { font-family: "Instrument Serif"; font-style: italic; src: url(data:font/woff;base64,${b64('app', 'blog', 'fonts', 'InstrumentSerif-400-italic.woff')}) format("woff"); }
@font-face { font-family: "DM Sans"; font-weight: 500; src: url(data:font/woff;base64,${b64('app', 'blog', 'fonts', 'DMSans-500.woff')}) format("woff"); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; display: flex; background: #fff; color: #0b2a20; font-family: "DM Sans", sans-serif; font-weight: 500; }
.ribbon { width: 14px; background: linear-gradient(180deg, #0b2a20 0%, #0e6b4e 40%, #2450b8 72%, #2450b8 100%); }
.in { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 52px 64px 48px; }
img { height: 54px; align-self: flex-start; }
.eyebrow { display: inline-flex; align-items: center; gap: 12px; padding: 10px 20px; border-radius: 24px; background: #d6f5e6; color: #1d4a3c; font-size: 17px; letter-spacing: 0.14em; text-transform: uppercase; }
.eyebrow i { width: 9px; height: 9px; border-radius: 50%; background: #2450b8; }
h1 { margin-top: 20px; font-family: "Instrument Serif", serif; font-weight: 400; font-size: 104px; line-height: 0.96; letter-spacing: -0.025em; text-wrap: balance; }
h1 em { color: #2450b8; white-space: nowrap; }
.panel { padding: 14px 30px; border-radius: 24px; background: linear-gradient(100deg, #d6f5e6 45%, #dcedfb 100%); }
svg { display: block; width: 100%; height: auto; overflow: visible; }
</style></head><body>
<div class="ribbon"></div>
<div class="in">
  <img src="data:image/png;base64,${b64('public', 'brand', 'logo-lockup@3x.png')}" alt="">
  <div>
    <div class="eyebrow"><i></i>Custom web design for mental health professionals</div>
    <h1>Websites for the people who <em>help people.</em></h1>
  </div>
  <div class="panel">
    <svg viewBox="0 20 1200 100">
      <defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="1160" y2="0"><stop offset="0" stop-color="#0B2A20"/><stop offset="0.4" stop-color="#0E6B4E"/><stop offset="0.72" stop-color="#2450B8"/><stop offset="1" stop-color="#2450B8"/></linearGradient></defs>
      <path d="${heroPath}" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="1166" cy="70" r="8" fill="#2450B8"/>
    </svg>
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

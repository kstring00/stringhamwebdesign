// Real captures of a live site for the portfolio (app/data/work.ts):
//   node scripts/capture-work.js <key> <url>
//   node scripts/capture-work.js support-shelf https://www.thesupportshelf.org/
//
// Writes the first screen of <url>, as the browser renders it, to
//   public/showcase/<key>-desktop.(avif|webp)   1440x900
//   public/showcase/<key>-mobile.(avif|webp)    390x700 at 2x (780x1400)
// then runs scripts/make-thumbs.js for the home page's work wall.
//
// Look at the files before committing them: an error page, a cookie wall or
// a blank screen is not a capture. Nothing here is edited or composed.
//
// Needs Playwright (not a project dependency):
//   npm install --no-save playwright
// and a Chromium: CHROME_PATH, or one under /opt/pw-browsers, or Playwright's own.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [key, url] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(key || '') || !/^https?:\/\//.test(url || '')) {
  console.error('usage: node scripts/capture-work.js <key> <url>   (key: lowercase letters, digits, hyphens)');
  process.exit(1);
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const root = '/opt/pw-browsers';
  if (!fs.existsSync(root)) return undefined;
  for (const dir of fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
    for (const sub of ['chrome-linux64', 'chrome-linux']) {
      const bin = path.join(root, dir, sub, 'chrome');
      if (fs.existsSync(bin)) return bin;
    }
  }
  return undefined;
}

(async () => {
  const { chromium } = require('playwright');
  const sharp = require('sharp');
  const out = path.join(process.cwd(), 'public', 'showcase');
  const browser = await chromium.launch({ executablePath: findChrome() });
  const shots = [
    ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
    ['mobile', { viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ];
  for (const [shape, options] of shots) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response || !response.ok()) throw new Error(`${url} answered ${response ? response.status() : 'nothing'}`);
    await page.waitForTimeout(2000);
    const png = await page.screenshot({ type: 'png' });
    const base = path.join(out, `${key}-${shape}`);
    await sharp(png).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
    await sharp(png).webp({ quality: 80 }).toFile(`${base}.webp`);
    const meta = await sharp(png).metadata();
    console.log(`${key}-${shape}: ${meta.width}x${meta.height}, "${await page.title()}" at ${page.url()}`);
    await context.close();
  }
  await browser.close();
  execFileSync(process.execPath, [path.join(__dirname, 'make-thumbs.js')], { stdio: 'inherit' });
  console.log(`Done. Look at public/showcase/${key}-*.webp before committing.`);
})().catch((e) => { console.error('capture failed:', e.message); process.exit(1); });

// /about: the hero is a photograph with the copy set on it, so the thing that
// can silently break is legibility — the text sits on real pixels, not a flat
// colour. Every hero line is measured against the image itself.
//
// Frame times are still sampled at 1440 and at 375 (4x CPU throttle): nothing
// animates on the hero any more, so this is a regression guard rather than a
// budget. Plus: reduced motion renders finished, one h1, no overflow, no
// page errors.
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('fs');
const OUT = process.cwd();
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

async function frameStats(page, seconds) {
  return page.evaluate(async (s) => {
    const deltas = []; let last = performance.now();
    await new Promise(res => { const tick = (t) => { deltas.push(t - last); last = t; if (t - deltas.length < 0 || deltas.length > s * 120) return res(); requestAnimationFrame(tick); }; setTimeout(res, s * 1000); requestAnimationFrame(tick); });
    deltas.shift();
    const sorted = [...deltas].sort((a, b) => a - b);
    const p = q => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    return { n: deltas.length, mean: deltas.reduce((a, b) => a + b, 0) / deltas.length, p95: p(0.95), max: sorted[sorted.length - 1], long: deltas.filter(d => d > 50).length };
  }, seconds);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  for (const [w, h, name, throttle] of [[1440, 900, 'desktop', 1], [375, 812, 'mobile', 4]]) {
    console.log(`\n--- ${name} ${w}px, CPU ${throttle}x ---`);
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    await p.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1800); // let the hero entrance finish
    const f = await frameStats(p, 3);
    // 60fps is 16.7ms. p95 under 34ms means at worst an occasional dropped frame.
    ok(`${name}: idle is smooth (mean ${f.mean.toFixed(1)}ms, p95 ${f.p95.toFixed(1)}ms, max ${f.max.toFixed(0)}ms, ${f.long} frames >50ms of ${f.n})`, f.p95 <= 34 && f.long <= 3);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`${name}: no horizontal overflow`, over <= 0, `${over}px`);
    if (name === 'desktop') {
      const h1s = await p.$$eval('h1', els => els.map(e => e.textContent.trim()));
      ok('exactly one h1', h1s.length === 1, JSON.stringify(h1s));
      const anchor = await p.$eval('a[href="#how"]', a => !!document.querySelector(a.getAttribute('href')));
      ok('"My approach" points at a section that exists', anchor);
      const portrait = await p.$eval('figure img', i => ({ alt: i.alt, w: i.naturalWidth }));
      ok('portrait present in the story with alt text', portrait.alt.length > 0 && portrait.w > 0, JSON.stringify(portrait));
      const hero = await p.$eval('section img', i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt'), fetch: i.getAttribute('fetchpriority'), w: i.naturalWidth, complete: i.complete }));
      ok('hero photograph loads, decorative, high priority', hero.complete && hero.w > 0 && hero.alt === '' && hero.fetch === 'high', JSON.stringify(hero));
    }
    ok(`${name}: no page errors`, errs.length === 0, JSON.stringify(errs));
    await ctx.close();
  }

  // Reduced motion: the lamp holds still and the hero is in its final state.
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const hidden = await p.$$eval('[data-hero], [data-reveal-group] > *', els => els.filter(e => { const cs = getComputedStyle(e); return cs.opacity !== '1' || cs.visibility === 'hidden'; }).length);
    ok('reduced motion: hero and story in final state', hidden === 0, `${hidden} hidden`);

    // Rendered-pixel contrast for the hero copy over the navy + lamp glow.
    const targets = await p.$$eval('h1, h1 em, [aria-labelledby="about-title"] p, [aria-labelledby="about-title"] li span', els => els.map(e => {
      const cs = getComputedStyle(e); const m = cs.color.match(/[\d.]+/g).map(Number);
      const boxes = []; const range = document.createRange(); range.selectNodeContents(e);
      for (const r of range.getClientRects()) if (r.width > 4 && r.height > 4) boxes.push([r.left + window.scrollX, r.top + window.scrollY, r.width, r.height]);
      e.style.color = 'transparent';
      return { text: e.textContent.trim().slice(0, 26), color: m.slice(0, 3), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, boxes };
    }));
    await p.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    const file = `${OUT}/.contrast-sample.png`;
    await p.screenshot({ path: file, fullPage: true });
    const img = PNG.sync.read(fs.readFileSync(file));
    for (const t of targets) {
      let worst = Infinity, worstPx = null;
      for (const [x, y, w, h] of t.boxes) for (let yy = Math.floor(y); yy < y + h; yy += 2) for (let xx = Math.floor(x); xx < x + w; xx += 2) {
        if (xx < 0 || yy < 0 || xx >= img.width || yy >= img.height) continue;
        const i = (yy * img.width + xx) * 4; const px = [img.data[i], img.data[i + 1], img.data[i + 2]];
        const r = ratio(t.color, px); if (r < worst) { worst = r; worstPx = px; }
      }
      const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
      const need = large ? 3 : 4.5;
      ok(`rendered contrast ≥ ${need} for "${t.text}"`, worst >= need, `${worst.toFixed(2)}:1 text rgb(${t.color}) worst rgb(${worstPx})`);
    }
    await ctx.close();
  }

  // Screenshots in the finished state.
  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
    await p.evaluate(async () => { const hh = document.documentElement.scrollHeight; for (let y = 0; y <= hh; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/about-${name}.png`, fullPage: true });
    console.log(`saved about-${name}.png`);
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall about checks passed');
  process.exit(fails ? 1 : 0);
})();

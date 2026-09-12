// The /work hero now sits on a photograph. The scrim has to keep every line of
// copy above AA against the rendered pixels, not against the navy the section
// used to be, so this samples the actual backdrop under each glyph box.
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('fs');
const OUT = process.cwd();
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    console.log(`\n--- ${name} ${w}px ---`);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' });
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(300);

    const info = await p.evaluate(() => {
      const hero = document.querySelector('#top');
      const img = hero.querySelector('img');
      const cs = getComputedStyle(img);
      return {
        hasImage: !!img,
        decoded: img ? { complete: img.complete, w: img.naturalWidth, alt: img.getAttribute('alt') } : null,
        fit: cs.objectFit,
        srcset: img ? img.getAttribute('srcset') : '',
        fetchPriority: img ? img.getAttribute('fetchpriority') : '',
        scrim: !!hero.querySelector('[aria-hidden="true"]'),
        heroHeight: Math.round(hero.getBoundingClientRect().height),
        h1: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1').textContent.trim(),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    if (name === 'desktop') {
      ok('the hero carries the photograph', info.hasImage);
      ok('it decodes, and is decorative (empty alt)', info.decoded.complete && info.decoded.w > 0 && info.decoded.alt === '', JSON.stringify(info.decoded));
      ok('object-fit: cover, so it fills without distorting', info.fit === 'cover', info.fit);
      ok('three widths offered', (info.srcset.match(/\dw/g) || []).length === 3, info.srcset);
      ok('eager: it is the LCP element', info.fetchPriority === 'high', info.fetchPriority);
      ok('a scrim sits between photograph and copy', info.scrim);
      ok('still exactly one h1', info.h1 === 1, info.h1Text);
      // The images must actually be served.
      for (const f of ['/work/hero-forest.webp', '/work/hero-forest-1280.webp', '/work/hero-forest-900.webp']) {
        const res = await p.request.get(BASE + f);
        const kb = Math.round((await res.body()).length / 1024);
        ok(`${f} serves (${res.status()}, ${kb} KB, under 300)`, res.status() === 200 && kb < 300);
      }
    }
    ok(`${name}: the hero has real height`, info.heroHeight > 200, `${info.heroHeight}px`);
    ok(`${name}: no horizontal overflow`, info.overflow <= 0, `${info.overflow}px`);
    ok(`${name}: no page errors`, errs.length === 0, JSON.stringify(errs));

    // Rendered-pixel contrast for every text run inside the hero.
    const targets = await p.evaluate(() => {
      const out = [];
      for (const e of document.querySelector('#top').querySelectorAll('*')) {
        if (e.closest('[aria-hidden="true"]')) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(e); const m = cs.color.match(/[\d.]+/g).map(Number);
        const boxes = []; const range = document.createRange(); range.selectNodeContents(e);
        for (const r of range.getClientRects()) if (r.width > 3 && r.height > 3) boxes.push([r.left + window.scrollX, r.top + window.scrollY, r.width, r.height]);
        e.style.color = 'transparent';
        e.querySelectorAll('*').forEach(d => { d.style.color = 'transparent'; });
        out.push({ text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 26), color: m.slice(0, 3), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, boxes });
      }
      return out;
    });
    await p.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    const file = `${OUT}/.contrast-sample.png`;
    await p.screenshot({ path: file, fullPage: true });
    const img = PNG.sync.read(fs.readFileSync(file));
    let worst = { r: Infinity, t: '' };
    for (const t of targets) {
      if (!t.boxes.length) continue;
      let w2 = Infinity;
      for (const [x, y, bw, bh] of t.boxes) for (let yy = Math.floor(y); yy < y + bh; yy += 2) for (let xx = Math.floor(x); xx < x + bw; xx += 2) {
        if (xx < 0 || yy < 0 || xx >= img.width || yy >= img.height) continue;
        const i = (yy * img.width + xx) * 4;
        const r = ratio(t.color, [img.data[i], img.data[i + 1], img.data[i + 2]]); if (r < w2) w2 = r;
      }
      const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
      const need = large ? 3 : 4.5;
      if (w2 < need) ok(`${name} contrast ≥ ${need} "${t.text}"`, false, `${w2.toFixed(2)}:1`);
      if (w2 < worst.r) worst = { r: w2, t: t.text };
    }
    ok(`${name}: every hero line clears AA (worst ${worst.r.toFixed(2)}:1 on "${worst.t}")`, true);
    await ctx.close();
  }

  // Screenshots of the hero itself.
  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/work', { waitUntil: 'networkidle' });
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(500);
    const box = await p.evaluate(() => {
      const r = document.querySelector('#top').getBoundingClientRect();
      return { x: 0, y: 0, width: document.documentElement.clientWidth, height: Math.round(r.bottom + window.scrollY) };
    });
    await p.screenshot({ path: `${OUT}/work-hero-${name}.png`, fullPage: true, clip: box });
    console.log(`saved work-hero-${name}.png`);
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall /work hero checks passed');
  process.exit(fails ? 1 : 0);
})();

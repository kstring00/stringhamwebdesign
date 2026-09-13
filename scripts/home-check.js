// Homepage sections: the three-card grid reads from the same data as /work,
// the audiences section scans, the testimonial slot renders nothing while
// empty, and everything clears AA by rendered pixel at both widths.
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
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.evaluate(async () => { const hh = document.documentElement.scrollHeight; for (let y = 0; y <= hh; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } window.scrollTo(0, 0); });
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(400);

    const info = await p.evaluate(() => {
      const sec = document.querySelector('#selected-work');
      const cards = [...sec.querySelectorAll('li')];
      return {
        cardCount: cards.length,
        hrefs: cards.map(c => c.querySelector('a')?.getAttribute('href')),
        titles: cards.map(c => c.querySelector('a > span:last-child > span:nth-child(2)')?.textContent.trim()),
        pills: cards.map(c => c.querySelector('span[class*="statusBadge"]')?.textContent.trim()),
        imgs: cards.map(c => { const i = c.querySelector('img'); return { complete: i?.complete, w: i?.naturalWidth, alt: i?.getAttribute('alt')?.length > 0 }; }),
        viewAll: sec.querySelector('a[href="/work"]')?.textContent.trim(),
        binderGone: !document.querySelector('[class*="binder"], [class*="coverPaper"]'),
        audiences: [...document.querySelectorAll('[aria-labelledby="who-heading"] dt')].map(d => d.textContent.trim()),
        audienceLines: [...document.querySelectorAll('[aria-labelledby="who-heading"] dd')].length,
        audienceImgs: document.querySelectorAll('[aria-labelledby="who-heading"] img').length,
        testimonialNodes: document.querySelectorAll('[aria-labelledby="testimonial-heading"]').length,
        order: [...document.querySelectorAll('main > section')].map(s => s.id || s.getAttribute('aria-labelledby') || '?'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tapTargets: [...sec.querySelectorAll('a')].map(a => Math.round(a.getBoundingClientRect().height)),
      };
    });

    if (name === 'desktop') {
      ok('three cards', info.cardCount === 3, `${info.cardCount}`);
      ok('the three named projects, linked to their case studies',
        JSON.stringify(info.hrefs) === JSON.stringify(['/work/common-ground', '/work/bcba-prep', '/work/with-little']), JSON.stringify(info.hrefs));
      ok('titles come from the shared data', JSON.stringify(info.titles) === JSON.stringify(['Common Ground', 'BCBA Prep', 'With Little']), JSON.stringify(info.titles));
      ok('each card carries its status pill', info.pills.every(Boolean) && info.pills.length === 3, JSON.stringify(info.pills));
      ok('every screenshot loads with real alt text', info.imgs.every(i => i.complete && i.w > 0 && i.alt), JSON.stringify(info.imgs));
      ok('"View all work" links to the portfolio', /view all work/i.test(info.viewAll || ''), info.viewAll);
      ok('the binder is gone', info.binderGone);
      ok('four audiences, four lines, no images',
        info.audiences.length === 4 && info.audienceLines === 4 && info.audienceImgs === 0, JSON.stringify(info.audiences));
      ok('testimonial slot renders nothing while empty', info.testimonialNodes === 0, `${info.testimonialNodes} nodes`);
      ok('section order: work, audiences, pricing, process', JSON.stringify(info.order.slice(0, 4)) === JSON.stringify(['selected-work', 'who-heading', 'pricing', 'process']), JSON.stringify(info.order));
      // Every internal link must resolve.
      for (const href of [...new Set(info.hrefs.concat('/work'))]) {
        const res = await p.request.get(BASE + href);
        ok(`link ${href} resolves (${res.status()})`, res.status() < 400);
      }
    }
    ok(`${name}: every card link ≥ 44px`, info.tapTargets.every(t => t >= 44), JSON.stringify(info.tapTargets.filter(t => t < 44)));
    ok(`${name}: no horizontal overflow`, info.overflow <= 0, `${info.overflow}px`);
    ok(`${name}: no page errors`, errs.length === 0, JSON.stringify(errs));

    // Rendered-pixel contrast across the two new sections.
    const targets = await p.evaluate(() => {
      const roots = [document.querySelector('#selected-work'), document.querySelector('[aria-labelledby="who-heading"]')];
      const out = [];
      for (const root of roots) {
        for (const e of root.querySelectorAll('*')) {
          if (e.closest('[aria-hidden="true"]')) continue;
          if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const cs = getComputedStyle(e); const m = cs.color.match(/[\d.]+/g).map(Number);
          const boxes = []; const range = document.createRange(); range.selectNodeContents(e);
          for (const r of range.getClientRects()) if (r.width > 3 && r.height > 3) boxes.push([r.left + window.scrollX, r.top + window.scrollY, r.width, r.height]);
          e.style.color = 'transparent';
          e.querySelectorAll('*').forEach(d => { d.style.color = 'transparent'; });
          out.push({ text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 26), color: m.slice(0, 3), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, boxes });
        }
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
    ok(`${name}: every line clears AA (worst ${worst.r.toFixed(2)}:1 on "${worst.t}")`, true);
    await ctx.close();
  }

  // Screenshots of the two new sections.
  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.evaluate(async () => { const hh = document.documentElement.scrollHeight; for (let y = 0; y <= hh; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } });
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(400);
    await p.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    const box = await p.evaluate(() => {
      const a = document.querySelector('#selected-work').getBoundingClientRect();
      const c = document.querySelector('[aria-labelledby="who-heading"]').getBoundingClientRect();
      return { x: 0, y: a.top + window.scrollY, width: document.documentElement.clientWidth, height: (c.bottom + window.scrollY) - (a.top + window.scrollY) };
    });
    await p.screenshot({ path: `${OUT}/home-${name}.png`, fullPage: true, clip: box });
    console.log(`saved home-${name}.png`);
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall homepage checks passed');
  process.exit(fails ? 1 : 0);
})();

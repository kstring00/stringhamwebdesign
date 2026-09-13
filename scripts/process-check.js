// The homepage process section: rendered-pixel contrast over its warmer ground
// (the doves and the ridge both paint behind the copy), the seven steps
// reachable at 375 rather than overlapping, and one CTA at the end.
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('fs');
const OUT = process.cwd();
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
    await p.goto((process.env.BASE || 'http://localhost:3000') + '/', { waitUntil: 'networkidle' });
    await p.evaluate(async () => { const hh = document.documentElement.scrollHeight; for (let y = 0; y <= hh; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } });
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(400);

    const info = await p.evaluate(() => {
      const sec = document.querySelector('#process');
      const tabs = [...sec.querySelectorAll('[role="tab"]')];
      const ctas = [...sec.querySelectorAll('a[href="/quote"]')];
      const imgs = [...sec.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt'), w: i.naturalWidth, complete: i.complete }));
      // Overlap: sort by left edge, a tab must start at or after the previous one ends.
      const rects = tabs.map(t => t.getBoundingClientRect()).sort((a, c) => a.left - c.left);
      let overlaps = 0;
      for (let i = 1; i < rects.length; i++) if (rects[i].left < rects[i - 1].right - 1) overlaps++;
      const row = sec.querySelector('[role="tablist"]');
      return {
        tabCount: tabs.length, overlaps,
        scrollable: row.scrollWidth > row.clientWidth + 1,
        ctaCount: ctas.length, ctaText: ctas.map(a => a.textContent.trim()),
        ctaBelowTabs: ctas.length === 1 && ctas[0].getBoundingClientRect().top > rects[0].top,
        imgs,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    ok(`${name}: all seven steps present`, info.tabCount === 7, `${info.tabCount}`);
    ok(`${name}: no step overlaps another`, info.overlaps === 0, `${info.overlaps} overlapping`);
    if (name === 'mobile') ok('mobile: the step row scrolls rather than crushing', info.scrollable);
    ok(`${name}: exactly one CTA, and it sits below the steps`, info.ctaCount === 1 && info.ctaBelowTabs, JSON.stringify(info.ctaText));
    ok(`${name}: both scene images load and are decorative`, info.imgs.length === 2 && info.imgs.every(i => i.complete && i.w > 0 && i.alt === ''), JSON.stringify(info.imgs));
    ok(`${name}: no horizontal overflow`, info.overflow <= 0, `${info.overflow}px`);
    ok(`${name}: no page errors`, errs.length === 0, JSON.stringify(errs));

    // Stepping between tabs: the fill must travel and the panel must swap, and
    // both must land — an interrupted tween leaving copy at opacity 0 is the
    // failure that matters.
    if (name === 'desktop') {
      // The homepage has a second tablist (the selected-work binder), so every
      // selector here is scoped to #process or it drives the wrong component.
      const fillAt = () => p.$eval('#process [class*="homeFill"]', e => {
        const m = new DOMMatrixReadOnly(getComputedStyle(e).transform); return Math.round(m.a * 1000) / 1000;
      });
      const before = await fillAt();
      await p.locator('#process [role="tab"]').nth(3).click();
      await p.waitForTimeout(900);
      const after = await fillAt();
      ok('fill travels when a later step is chosen', after > before, `${before} -> ${after}`);
      const panel = await p.$eval('#process [role="tabpanel"]', e => ({
        heading: e.querySelector('h3')?.textContent.trim(),
        hidden: [...e.querySelectorAll('[data-step-part]')].filter(d => { const cs = getComputedStyle(d); return cs.opacity !== '1' || cs.visibility === 'hidden'; }).length,
        x: [...e.querySelectorAll('[data-step-part]')].map(d => getComputedStyle(d).transform),
      }));
      ok('panel swapped to the chosen step', /account/i.test(panel.heading || ''), panel.heading);
      ok('panel parts settle fully visible', panel.hidden === 0, `${panel.hidden} still hidden`);
      ok('panel parts settle back to x: 0', panel.x.every(t => t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t)), JSON.stringify(panel.x));

      // Stepping backwards must also land.
      await p.locator('#process [role="tab"]').nth(1).click();
      await p.waitForTimeout(900);
      const back = await fillAt();
      ok('fill travels back when an earlier step is chosen', back < after, `${after} -> ${back}`);
      const stillHidden = await p.$$eval('#process [role="tabpanel"] [data-step-part]', els => els.filter(d => getComputedStyle(d).opacity !== '1').length);
      ok('panel parts settle after stepping backwards', stillHidden === 0, `${stillHidden} hidden`);
    }

    // Reduced motion: the fill is already at the active step, nothing tweens.
    {
      const rctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      const rp = await rctx.newPage();
      await rp.goto((process.env.BASE || 'http://localhost:3000') + '/', { waitUntil: 'networkidle' });
      await rp.waitForTimeout(300);
      await rp.locator('#process [role="tab"]').nth(4).click();
      const immediate = await rp.$eval('#process [role="tabpanel"]', e => [...e.querySelectorAll('[data-step-part]')].every(d => getComputedStyle(d).opacity === '1'));
      ok(`${name}: reduced motion swaps instantly, nothing at opacity 0`, immediate);
      await rctx.close();
    }

    const targets = await p.evaluate(() => {
      const sec = document.querySelector('#process');
      return [...sec.querySelectorAll('*')].filter(e => !e.closest('[aria-hidden="true"]') && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => {
        const cs = getComputedStyle(e); const m = cs.color.match(/[\d.]+/g).map(Number);
        // Clip each rect to any scrolling ancestor. The step row scrolls
        // horizontally, so steps 3+ report rects running past its right edge —
        // pixels where that text is not painted at all, which would otherwise
        // be sampled as if they were its backdrop.
        const clipper = e.closest('[role="tablist"]');
        const clip = clipper ? clipper.getBoundingClientRect() : null;
        const boxes = []; const range = document.createRange(); range.selectNodeContents(e);
        for (const r of range.getClientRects()) {
          let { left, top, width, height } = r;
          if (clip) {
            const l = Math.max(left, clip.left), rt = Math.min(left + width, clip.right);
            if (rt - l < 3) continue;
            left = l; width = rt - l;
          }
          if (width > 3 && height > 3) boxes.push([left + window.scrollX, top + window.scrollY, width, height]);
        }
        // Descendants too: a child with its own colour (the gold arrow inside
        // the navy CTA) would otherwise stay painted and be sampled as if it
        // were the backdrop.
        e.style.color = 'transparent';
        e.querySelectorAll('*').forEach(d => { d.style.color = 'transparent'; });
        return { text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 24), color: m.slice(0, 3), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, boxes };
      });
    });
    await p.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    const file = `${OUT}/.contrast-sample.png`;
    await p.screenshot({ path: file, fullPage: true });
    const img = PNG.sync.read(fs.readFileSync(file));
    let worstOverall = { r: Infinity, t: '' };
    for (const t of targets) {
      if (!t.boxes.length) continue;
      let worst = Infinity;
      for (const [x, y, bw, bh] of t.boxes) for (let yy = Math.floor(y); yy < y + bh; yy += 2) for (let xx = Math.floor(x); xx < x + bw; xx += 2) {
        if (xx < 0 || yy < 0 || xx >= img.width || yy >= img.height) continue;
        const i = (yy * img.width + xx) * 4;
        const r = ratio(t.color, [img.data[i], img.data[i + 1], img.data[i + 2]]); if (r < worst) worst = r;
      }
      const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
      const need = large ? 3 : 4.5;
      if (worst < need) ok(`${name} contrast ≥ ${need} "${t.text}"`, false, `${worst.toFixed(2)}:1`);
      if (worst < worstOverall.r) worstOverall = { r: worst, t: t.text };
    }
    ok(`${name}: every line clears AA over the scene (worst ${worstOverall.r.toFixed(2)}:1 on "${worstOverall.t}")`, true);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall process checks passed');
  process.exit(fails ? 1 : 0);
})();

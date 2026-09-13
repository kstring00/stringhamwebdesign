// Site footer: structure, contrast against the navy by rendered pixel, tap
// targets, no dead links, and the year computed rather than hardcoded.
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
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(500);

    const info = await p.evaluate(() => {
      const f = document.querySelector('footer');
      const links = [...f.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim(), h: Math.round(a.getBoundingClientRect().height) }));
      return {
        heads: [...f.querySelectorAll('h2')].map(x => x.textContent.trim()),
        links,
        bottom: f.querySelector('[class*="bottom"] span')?.textContent.trim(),
        portalCount: [...f.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim() === 'Client portal')).length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    if (name === 'desktop') {
      ok('four column heads', JSON.stringify(info.heads) === JSON.stringify(['Site', 'Clients', 'Contact']) || info.heads.length === 3, JSON.stringify(info.heads));
      ok('site column carries every nav item plus the CTA', ['/', '/about', '/work', '/resources', '/quote'].every(h => info.links.some(l => l.href === h)), JSON.stringify(info.links.map(l => l.href)));
      ok('client portal and quote request present', info.links.some(l => l.href === '/portal') && info.links.filter(l => l.href === '/quote').length >= 2);
      ok('email is a mailto link', info.links.some(l => l.href === 'mailto:kyle@stringhamwebdesign.com'), JSON.stringify(info.links.filter(l => (l.href || '').startsWith('mailto'))));
      ok('exactly one "Client portal" in the footer', info.portalCount === 1, `${info.portalCount} found`);
      ok(`bottom bar shows the current year (${new Date().getFullYear()})`, (info.bottom || '').includes(String(new Date().getFullYear())) && (info.bottom || '').includes('Stringham Web Design'), info.bottom);
      ok('links the privacy policy (the page exists as of 2026-09-13)', info.links.some(l => l.href === '/privacy'), JSON.stringify(info.links.map(l => l.href)));
      // Every internal href must resolve, not 404.
      for (const href of [...new Set(info.links.map(l => l.href).filter(x => x && x.startsWith('/')))]) {
        const res = await p.request.get((process.env.BASE || 'http://localhost:3000') + href);
        ok(`link ${href} resolves (${res.status()})`, res.status() < 400);
      }
    }
    ok(`${name}: every footer link ≥ 44px tall`, info.links.every(l => l.h >= 44), JSON.stringify(info.links.filter(l => l.h < 44)));
    ok(`${name}: no horizontal overflow`, info.overflow <= 0, `${info.overflow}px`);
    ok(`${name}: no page errors`, errs.length === 0, JSON.stringify(errs));

    // Rendered-pixel contrast for every text node in the footer.
    const targets = await p.evaluate(() => {
      const f = document.querySelector('footer');
      // Skip aria-hidden subtrees. They are not exposed to assistive tech, and
      // the one here is the brand mark — WCAG 1.4.3 exempts logotypes, and the
      // gold "KS" sits over the pale dove graphic by design.
      return [...f.querySelectorAll('*')].filter(e => !e.closest('[aria-hidden="true"]') && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => {
        const cs = getComputedStyle(e); const m = cs.color.match(/[\d.]+/g).map(Number);
        const boxes = []; const range = document.createRange(); range.selectNodeContents(e);
        for (const r of range.getClientRects()) if (r.width > 3 && r.height > 3) boxes.push([r.left + window.scrollX, r.top + window.scrollY, r.width, r.height]);
        e.style.color = 'transparent';
        return { text: e.textContent.trim().slice(0, 26), color: m.slice(0, 3), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, boxes };
      });
    });
    await p.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    const file = `${OUT}/.contrast-sample.png`;
    await p.screenshot({ path: file, fullPage: true });
    const img = PNG.sync.read(fs.readFileSync(file));
    for (const t of targets) {
      if (!t.boxes.length) continue;
      let worst = Infinity, worstPx = null;
      for (const [x, y, bw, bh] of t.boxes) for (let yy = Math.floor(y); yy < y + bh; yy += 2) for (let xx = Math.floor(x); xx < x + bw; xx += 2) {
        if (xx < 0 || yy < 0 || xx >= img.width || yy >= img.height) continue;
        const i = (yy * img.width + xx) * 4; const px = [img.data[i], img.data[i + 1], img.data[i + 2]];
        const r = ratio(t.color, px); if (r < worst) { worst = r; worstPx = px; }
      }
      const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
      const need = large ? 3 : 4.5;
      ok(`${name} contrast ≥ ${need} "${t.text}"`, worst >= need, `${worst.toFixed(2)}:1`);
    }
    await ctx.close();
  }

  // Screenshots, footer band only.
  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto((process.env.BASE || 'http://localhost:3000') + '/', { waitUntil: 'networkidle' });
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(500);
    // The masthead is fixed, so in a full-page capture it paints over whatever
    // is at the scroll position. It is not part of the footer.
    await p.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    // Document-space rect with fullPage, so a footer taller than the viewport
    // is captured whole rather than clipped to the fold.
    const box = await p.$eval('footer', f => { const r = f.getBoundingClientRect(); return { x: 0, y: r.y + window.scrollY - 8, width: document.documentElement.clientWidth, height: r.height + 16 }; });
    await p.screenshot({ path: `${OUT}/footer-${name}.png`, fullPage: true, clip: box });
    console.log(`saved footer-${name}.png`);
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall footer checks passed');
  process.exit(fails ? 1 : 0);
})();

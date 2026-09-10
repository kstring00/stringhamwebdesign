/**
 * Rendered-pixel contrast for the client portal.
 *
 * One element at a time: scroll it into view, blank only that element's
 * glyphs, screenshot the viewport, sample under its own text rects. Slower
 * than a batched sweep, but a batched sweep produced a reproducible false
 * positive (a gold button reported at 1.04 against its own card colour) that
 * survived every attempt to fix the batching, so this trades speed for a
 * result that can be trusted.
 *
 *   NODE_PATH=./node_modules node portal-contrast.js [width] [tab]
 */
const { chromium } = require('playwright');
const WIDTH = Number(process.argv[2] || 1440);
const TAB = process.argv[3] || '';

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: WIDTH, height: 1000 } });
  await ctx.addCookies([
    { name: 'swd_portal_access',  value: 'stub-access',  domain: 'localhost', path: '/' },
    { name: 'swd_portal_refresh', value: 'stub-refresh', domain: 'localhost', path: '/' },
  ]);
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/portal/projects' + (TAB ? '/' + TAB : ''), { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);

  const total = await p.evaluate(() => {
    let n = 0;
    document.querySelectorAll('h1,h2,h3,h4,strong,p,span,b,em,button,a,li,label,small,time,dt,dd')
      .forEach((el) => {
        const t = (el.innerText || '').trim();
        if (!t || t.length > 90) return;
        if (el.querySelector('h1,h2,h3,h4,strong,p,span,b,button,a,li,label,small,time')) return;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
        if (cs.clipPath && cs.clipPath.includes('inset(50%)')) return;
        if (el.closest('[aria-hidden="true"]')) return;
        if (!el.getClientRects().length) return;
        el.setAttribute('data-cc', String(n++));
      });
    return n;
  });

  await p.addStyleTag({ content: '[data-blank]{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}' });

  const fails = [];
  for (let i = 0; i < total; i++) {
    const meta = await p.evaluate((idx) => {
      const el = document.querySelector(`[data-cc="${idx}"]`);
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      // Read the painted colour BEFORE blanking it, or every element reports
      // transparent and the whole run is meaningless.
      const cs = getComputedStyle(el);
      const color = cs.color;
      const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
      el.setAttribute('data-blank', '1');
      return { text: (el.innerText || '').trim().slice(0, 44), color,
               size: Math.round(size), need: (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5 };
    }, i);
    if (!meta) continue;

    await p.waitForTimeout(260);
    const shot = 'data:image/png;base64,' + (await p.screenshot()).toString('base64');

    const result = await p.evaluate(async (args) => {
      const { idx, shot, color } = args;
      const el = document.querySelector(`[data-cc="${idx}"]`);
      const rects = [];
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) {
          if (r.width < 2 || r.height < 2) continue;
          if (r.top < 0 || r.bottom > innerHeight) continue;
          rects.push(r);
        }
      }
      if (!rects.length) return null;
      const img = new Image(); img.src = shot; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const lum = (r, gg, bl) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(bl); };
      const parse = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lf = lum(...parse(color));
      let worst = Infinity, px = null;
      for (const r of rects) {
        const d = g.getImageData(Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)).data;
        for (let k = 0; k < d.length; k += 4) {
          const lb = lum(d[k], d[k + 1], d[k + 2]);
          const cr = (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
          if (cr < worst) { worst = cr; px = [d[k], d[k + 1], d[k + 2]]; }
        }
      }
      return { cr: +worst.toFixed(2), px };
    }, { idx: i, shot, color: meta.color });

    await p.evaluate((idx) => {
      document.querySelector(`[data-cc="${idx}"]`)?.removeAttribute('data-blank');
    }, i);

    if (result && result.cr < meta.need) {
      fails.push({ ...meta, ...result });
    }
  }

  console.log(`/portal/projects/${TAB || '(overview)'} @ ${WIDTH}px — checked ${total}, FAILURES: ${fails.length}`);
  fails.sort((a, b2) => a.cr - b2.cr).forEach(f =>
    console.log(`   ${f.cr} (need ${f.need}) ${f.size}px "${f.text}" fg=${f.color} bg=rgb(${f.px})`));
  await b.close();
  process.exit(fails.length ? 1 : 0);
})();

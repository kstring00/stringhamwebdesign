// Contrast for every text element on /pricing against the backdrop it sits on.
// This page has only flat, opaque backgrounds — no photos, gradients or
// overlays — so the computed background of the nearest painted ancestor IS the
// rendered pixel, and the README's screenshot method would sample the same
// value. Reported per unique (color, background, size, weight) combination.
const { chromium } = require('playwright');
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const parse = s => { const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
const blend = (fg, bg) => fg.slice(0, 3).map((c, i) => Math.round(c * fg[3] + bg[i] * (1 - fg[3])));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  let fails = 0;
  for (const w of [1440, 375]) {
    // Reduced motion: every reveal element is in its final, visible state, so
    // the whole page is measurable rather than just what is above the fold.
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await p.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
    // open every accordion so hidden panels get measured too
    await p.$$eval('main h3 button', bs => bs.forEach(b => b.getAttribute('aria-expanded') === 'false' && b.click()));
    await p.waitForTimeout(500);
    const rows = await p.evaluate(() => {
      const out = new Map();
      const painted = el => { for (let n = el; n; n = n.parentElement) { const bg = getComputedStyle(n).backgroundColor; if (bg && !bg.startsWith('rgba(0, 0, 0, 0)') && bg !== 'transparent') return bg; } return getComputedStyle(document.body).backgroundColor; };
      for (const el of document.querySelectorAll('main *')) {
        const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || el.getBoundingClientRect().width === 0) continue;
        const key = [cs.color, painted(el), cs.fontSize, cs.fontWeight].join('|');
        if (!out.has(key)) out.set(key, { color: cs.color, bg: painted(el), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, sample: el.textContent.trim().slice(0, 34), tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0].replace(/^pricing_module__|__[A-Za-z0-9]+$/g, '') : '') });
      }
      return [...out.values()];
    });
    console.log(`\n--- ${w}px: ${rows.length} unique text styles ---`);
    for (const r of rows) {
      const fg = parse(r.color), bg = parse(r.bg); if (!fg || !bg) continue;
      const c = ratio(blend(fg, bg), bg.slice(0, 3));
      const large = r.size >= 24 || (r.size >= 18.66 && r.weight >= 700);
      const need = large ? 3 : 4.5;
      const pass = c >= need;
      if (!pass) fails++;
      console.log(`${pass ? 'ok  ' : 'FAIL'} ${c.toFixed(2)}:1 (need ${need}) ${r.size.toFixed(1)}px/${r.weight} ${r.tag.padEnd(22)} "${r.sample}"`);
    }
    await p.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} CONTRAST FAILURE(S)` : '\nall contrast checks passed');
  process.exit(fails ? 1 : 0);
})();

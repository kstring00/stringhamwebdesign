// The pricing hero is a portal preview drawn in CSS. Every constraint in the
// brief is asserted here: no raster image, no baked-in text, real selectable
// copy, one h1, no overflow at 360px, the hero CTA above the fold on a phone,
// 44px tap targets, and AA by rendered pixel inside the navy card.
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

  for (const [w, h, name] of [[1440, 900, 'desktop'], [360, 780, 'mobile-360']]) {
    console.log(`\n--- ${name} ${w}px ---`);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const requests = []; p.on('request', r => requests.push(r.url()));
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);

    const info = await p.evaluate(() => {
      const media = document.querySelector('[data-hero="media"]');
      const card = media.querySelector('ol')?.closest('div');
      const phases = [...media.querySelectorAll('ol > li')];
      const entries = [...media.querySelectorAll('ol ~ div li, [class*="entry"]')].filter(e => e.tagName === 'LI');
      const cs = getComputedStyle(media);
      const vis = el => el.offsetParent !== null || getComputedStyle(el).display !== 'none';
      return {
        imgs: media.querySelectorAll('img').length,
        bgImage: cs.backgroundImage,
        ariaHidden: media.getAttribute('aria-hidden'),
        headings: media.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
        h1Count: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(),
        label: media.textContent.includes('Client portal'),
        project: media.textContent.includes('Harbor Dental'),
        caption: media.textContent.includes('What you see while I build.'),
        timesheetHead: media.textContent.includes('Timesheet'),
        phaseNames: phases.map(li => li.querySelector('[class*="PhaseName"]').firstChild.textContent.trim()),
        phaseStates: phases.map(li => li.getAttribute('data-state')),
        fills: phases.map(li => {
          const f = li.querySelector('[class*="portalFill"]');
          return f ? +getComputedStyle(f).transform.split(/[(,]/)[1] : null;
        }),
        visibleEntries: entries.filter(vis).length,
        entryText: entries.filter(vis).map(e => e.textContent.replace(/\s+/g, ' ').trim()),
        svgTitles: [...media.querySelectorAll('svg')].map(s => s.querySelector('title')?.textContent ?? null),
        srOnly: [...media.querySelectorAll('[class*="SrOnly"]')].map(e => e.textContent.trim()),
        cardRight: card ? Math.round(card.getBoundingClientRect().right) : 0,
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        mediaOverflow: media.scrollWidth - media.clientWidth,
        // Everything that must sit above the fold on a phone.
        foldTops: {
          h1: Math.round(document.querySelector('h1').getBoundingClientRect().bottom),
          starting: Math.round(document.querySelector('[class*="lede"] strong').getBoundingClientRect().bottom),
          cta: Math.round([...document.querySelectorAll('a')].find(a => a.textContent.trim().startsWith('Start a project')).getBoundingClientRect().bottom),
        },
        taps: [...document.querySelectorAll('[aria-labelledby="pricing-title"] a, [aria-labelledby="pricing-title"] button')]
          .filter(e => e.offsetParent !== null)
          .map(e => Math.round(e.getBoundingClientRect().height))
          .filter(n => n > 0),
      };
    });

    if (name === 'desktop') {
      ok('no <img> in the hero media', info.imgs === 0, `${info.imgs}`);
      ok('no raster background on the wrapper', !/url\(/.test(info.bgImage), info.bgImage.slice(0, 60));
      ok('the wrapper is not aria-hidden, so its text is announced', info.ariaHidden === null, String(info.ariaHidden));
      ok('no heading tag inside the card', info.headings === 0, `${info.headings}`);
      ok('exactly one h1 on the page', info.h1Count === 1, info.h1Text);
      ok('the h1 is unchanged', info.h1Text === 'What a site really costs.', info.h1Text);
      ok('the gold label reads "Client portal"', info.label);
      ok('the project name is present', info.project);
      ok('the timesheet is headed', info.timesheetHead);
      ok('the caption is present', info.caption);
      ok('four phases, named as in section 04',
        JSON.stringify(info.phaseNames) === JSON.stringify(['Discovery', 'Design', 'Build', 'Launch']),
        JSON.stringify(info.phaseNames));
      ok('states: Discovery done, Design active, Build and Launch dim',
        JSON.stringify(info.phaseStates) === JSON.stringify(['done', 'active', 'idle', 'idle']),
        JSON.stringify(info.phaseStates));
      ok('fills: 100%, 40%, 0, 0', JSON.stringify(info.fills) === JSON.stringify([1, 0.4, 0, 0]), JSON.stringify(info.fills));
      ok('every svg carries a title', info.svgTitles.length > 0 && info.svgTitles.every(t => t && t.length), JSON.stringify(info.svgTitles));
      ok('states not carried by colour alone', info.srOnly.length === 3, JSON.stringify(info.srOnly));
      ok('three timesheet rows', info.visibleEntries === 3, JSON.stringify(info.entryText));
      // No request may be added for the composition.
      // The page already loads the header mark and the two families' subsets.
      // Nothing here may add to that list.
      const assets = requests
        .filter(u => /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(u))
        .map(u => u.split('/').pop());
      ok('the composition adds no image request', assets.every(a => a === 'ks-dove-mark.png'), JSON.stringify(assets));
      const fonts = [...new Set(requests.filter(u => /\.woff2?(\?|$)/i.test(u)))];
      ok('no third font family', fonts.length <= 3, `${fonts.length} font files`);
    }

    if (name === 'mobile-360') {
      ok('360px: the card does not overflow the viewport', info.cardRight <= 360, `${info.cardRight}px`);
      ok('360px: no document overflow', info.docOverflow <= 0, `${info.docOverflow}px`);
      ok('360px: nothing scrolls inside the card', info.mediaOverflow <= 0, `${info.mediaOverflow}px`);
      ok('360px: two timesheet rows, third dropped', info.visibleEntries === 2, JSON.stringify(info.entryText));
      ok(`360px: h1 above the fold`, info.foldTops.h1 <= 780, `${info.foldTops.h1}px`);
      ok(`360px: the starting-price line above the fold`, info.foldTops.starting <= 780, `${info.foldTops.starting}px`);
      ok(`360px: "Start a project" above the fold`, info.foldTops.cta <= 780, `${info.foldTops.cta}px`);
    }
    ok(`${name}: every tappable element ≥ 44px`, info.taps.every(t => t >= 44), JSON.stringify(info.taps.filter(t => t < 44)));
    ok(`${name}: no page errors`, errs.length === 0, JSON.stringify(errs));

    // Rendered-pixel contrast for every text run inside the hero media.
    const targets = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('[class*="SrOnly"]').forEach(e => { e.style.display = 'none'; });
      for (const e of document.querySelector('[data-hero="media"]').querySelectorAll('*')) {
        if (e.closest('[aria-hidden="true"]')) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(e);
        if (cs.position === 'absolute' && cs.clipPath.startsWith('inset(50%')) continue;
        const m = cs.color.match(/[\d.]+/g).map(Number);
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
    ok(`${name}: every line in the card clears AA (worst ${worst.r.toFixed(2)}:1 on "${worst.t}")`, true);
    await ctx.close();
  }

  // Screenshots.
  for (const [w, h, name] of [[1440, 900, 'desktop'], [360, 780, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    const box = await p.evaluate(() => {
      const r = document.querySelector('[aria-labelledby="pricing-title"]').getBoundingClientRect();
      return { x: 0, y: 0, width: document.documentElement.clientWidth, height: Math.round(r.bottom + window.scrollY) };
    });
    await p.screenshot({ path: `${OUT}/pricing-portal-${name}.png`, fullPage: true, clip: box });
    console.log(`saved pricing-portal-${name}.png`);
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall pricing portal checks passed');
  process.exit(fails ? 1 : 0);
})();

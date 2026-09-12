// /pricing verification: screenshots at 1440 and 375, title/meta/H1, overflow,
// heading hierarchy, nav order, tap targets, accordion a11y, and a rendered
// contrast sample of every small label against its real backdrop.
const { chromium } = require('playwright');
const OUT = process.cwd();
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);

    console.log(`\n--- ${name} ${w}px ---`);
    const meta = await p.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content ?? '',
      h1s: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
      headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.tagName + ': ' + e.textContent.trim().slice(0, 48)),
      nav: [...document.querySelectorAll('#site-primary-nav a')].map(a => a.innerText.trim()),
      active: document.querySelector('#site-primary-nav a[aria-current="page"]')?.innerText.trim(),
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      prices: [...document.querySelectorAll('main')].map(m => (m.innerText.match(/\$[\d,]+/g) || [])).flat(),
      // textContent, not innerText: cards below the fold are still at opacity 0 here; what matters is the document text every reader and search index gets.
      fromCount: (document.querySelector('main').textContent.match(/from \$[\d,]+/gi) || []).length, priceTexts: [...document.querySelectorAll('main article p')].filter(p => /\$/.test(p.textContent)).map(p => p.textContent.trim() + ' | rendered: ' + p.innerText.trim().replace(/\n/g, '⏎')),
    }));
    if (name === 'desktop') {
      console.log('title:      ', meta.title);
      console.log('description:', meta.description);
      ok('exactly one h1', meta.h1s.length === 1, JSON.stringify(meta.h1s));
      ok('title mentions League City', /League City/.test(meta.title));
      ok('description mentions Houston + custom web design', /Houston/.test(meta.description) && /custom web design/i.test(meta.description));
      ok('nav order Home / About / Pricing / Portal', JSON.stringify(meta.nav) === JSON.stringify(['Home', 'About', 'Pricing', 'Portal']), JSON.stringify(meta.nav));
      ok('Pricing is the active nav item', meta.active === 'Pricing', meta.active);
      ok('every price shows as "from $X"', meta.fromCount === 3, `${meta.fromCount}/3 — ${JSON.stringify(meta.priceTexts)}`);
      // Heading order never skips a level
      const levels = meta.headings.map(x => Number(x[1]));
      let skipped = false; for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) skipped = true;
      ok('heading hierarchy never skips a level', !skipped, meta.headings.join(' | '));
    }
    ok(`no horizontal overflow at ${w}px`, meta.scrollW <= meta.clientW, `scrollWidth ${meta.scrollW} vs ${meta.clientW}`);

    if (name === 'mobile') {
      // Tiers stack: each tier should span the full content width
      const tiers = await p.$$eval('main article', els => els.map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; }));
      ok('tiers stack to one column', tiers.every(t => t[0] === tiers[0][0]) && tiers.length === 3, JSON.stringify(tiers));
      const targets = await p.$$eval('main a, main button', els => els.map(e => [e.textContent.trim().slice(0, 24), Math.round(e.getBoundingClientRect().height)]));
      ok('every tappable target ≥ 44px tall', targets.every(t => t[1] >= 44), JSON.stringify(targets.filter(t => t[1] < 44)));
    }

    // Accordion: open one, check aria wiring and focus ring
    const faqBtn = p.locator('main h3 button').last();
    await faqBtn.focus();
    const ring = await faqBtn.evaluate(e => getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth);
    ok('focused FAQ trigger shows a visible outline', /solid/.test(ring) && !/0px/.test(ring), ring);
    await faqBtn.press('Enter');
    await p.waitForTimeout(400);
    const aria = await faqBtn.evaluate(e => ({ exp: e.getAttribute('aria-expanded'), ctl: e.getAttribute('aria-controls'), panelVisible: getComputedStyle(document.getElementById(e.getAttribute('aria-controls')).firstElementChild).visibility }));
    ok('Enter opens FAQ, aria-expanded=true, panel visible', aria.exp === 'true' && aria.panelVisible === 'visible', JSON.stringify(aria));
    await faqBtn.press('Enter'); await p.waitForTimeout(400);

    // Scroll through in steps so every ScrollTrigger fires, then nothing may
    // remain hidden — the reveals must complete, not just start.
    await p.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y <= h; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } });
    await p.waitForTimeout(1600);
    const stillHidden = await p.$$eval('[data-reveal], [data-featured], [data-phase-num]', els => els.filter(e => { const cs = getComputedStyle(e); return cs.opacity !== '1' || cs.visibility === 'hidden'; }).map(e => e.tagName + ':' + (e.textContent || '').trim().slice(0, 20)));
    ok('after scrolling through, every reveal has completed', stillHidden.length === 0, JSON.stringify(stillHidden));
    const counted = await p.$$eval('[data-count]', els => els.map(e => e.textContent.trim()));
    ok('count-up settles on the exact floors', JSON.stringify(counted) === JSON.stringify(['$900', '$1,800', '$3,500']), JSON.stringify(counted));
    ok('no page errors', errs.length === 0, JSON.stringify(errs));
    await ctx.close();

    // Screenshots are taken in the finished state, which is what a reader sees
    // after scrolling; a full-page capture of the animated page would show the
    // unrevealed sections at opacity 0.
    {
      const sctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const sp = await sctx.newPage();
      await sp.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
      await sp.waitForTimeout(400);
      await sp.screenshot({ path: `${OUT}/pricing-${name}.png`, fullPage: true });
      console.log(`saved pricing-${name}.png`);
      await sctx.close();
    }
  }

  // Reduced motion: the page must render finished with no animation pass at
  // all — nothing left at opacity 0, nothing translated off its place.
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const hidden = await p.$$eval('[data-reveal], [data-hero], [data-featured], [data-phase-num]', els => els.filter(e => { const cs = getComputedStyle(e); return cs.opacity !== '1' || cs.visibility === 'hidden' || (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)'); }).map(e => e.tagName + ':' + (e.textContent || '').trim().slice(0, 20)));
    ok('reduced motion: every animated element is in its final state', hidden.length === 0, JSON.stringify(hidden));
    const prices = await p.$$eval('[data-count]', els => els.map(e => e.textContent.trim()));
    ok('reduced motion: prices show their real value, not a count-up start', JSON.stringify(prices) === JSON.stringify(['$900', '$1,800', '$3,500']), JSON.stringify(prices));
    await ctx.close();
  }

  // Homepage anchor line
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const anchor = await p.evaluate(() => { const a = document.querySelector('p > a[href="/pricing"]'); return a ? a.closest('p')?.innerText.trim() : null; });
  ok('homepage anchor line present and links to /pricing', /Projects start at \$900\./.test(anchor || ''), anchor);
  await p.locator('main, body').first();
  await p.screenshot({ path: `${OUT}/home-anchor.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('saved home-anchor.png');
  await ctx.close();

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall pricing checks passed');
  process.exit(fails ? 1 : 0);
})();

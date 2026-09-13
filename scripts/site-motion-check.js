// Sitewide motion: every route must (a) render finished under reduced motion
// with nothing left hidden, (b) complete every reveal once scrolled through
// with motion on, (c) throw no page errors, (d) never overflow horizontally.
const { chromium } = require('playwright');
const ROUTES = ['/', '/about', '/quote', '/work', '/work/common-ground', '/resources'];
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };
const SEL = '[data-hero], [data-reveal], [data-reveal-group] > *, [data-featured], [data-phase-num]';
const hiddenOf = els => els.filter(e => { const cs = getComputedStyle(e); return cs.opacity !== '1' || cs.visibility === 'hidden'; }).map(e => e.tagName + ':' + (e.textContent || '').trim().slice(0, 18));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const route of ROUTES) {
    console.log(`\n--- ${route} ---`);
    for (const [w, h] of [[1440, 900], [375, 812]]) {
      // reduced motion: final state, immediately
      let ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      let p = await ctx.newPage();
      let errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto((process.env.BASE || 'http://localhost:3000') + route, { waitUntil: 'networkidle' });
      await p.waitForTimeout(250);
      const marked = await p.$$eval(SEL, els => els.length);
      const hiddenReduced = await p.$$eval(SEL, hiddenOf);
      ok(`${w}px reduced motion: ${marked} marked elements, all in final state`, marked > 0 && hiddenReduced.length === 0, JSON.stringify(hiddenReduced.slice(0, 6)));
      const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(`${w}px no horizontal overflow`, over <= 0, `${over}px over`);
      await ctx.close();

      // motion on: scroll through, everything must have revealed
      ctx = await b.newContext({ viewport: { width: w, height: h } });
      p = await ctx.newPage();
      errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto((process.env.BASE || 'http://localhost:3000') + route, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1400);
      const heroHidden = await p.$$eval('[data-hero]', hiddenOf);
      ok(`${w}px motion: hero entrance completed`, heroHidden.length === 0, JSON.stringify(heroHidden.slice(0, 6)));
      await p.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y <= h; y += 280) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 55)); } });
      await p.waitForTimeout(2500);
      const stillHidden = await p.$$eval(SEL, hiddenOf);
      ok(`${w}px motion: every reveal completed after scrolling through`, stillHidden.length === 0, JSON.stringify(stillHidden.slice(0, 6)));
      ok(`${w}px no page errors`, errs.length === 0, JSON.stringify(errs));
      await ctx.close();
    }
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall site motion checks passed');
  process.exit(fails ? 1 : 0);
})();

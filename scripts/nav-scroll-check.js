// Client navigations must land at the top of the new page. globals.css sets
// scroll-behavior: smooth on <html>, and Next 16 stopped overriding that during
// route transitions: its scrollTop = 0 became a smooth scroll that was cancelled
// before it landed, so /work opened wherever the previous page was scrolled to.
// The fix is data-scroll-behavior="smooth" on <html> (app/layout.tsx).
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [w, h, name] of [[1440, 900, 'desktop'], [375, 812, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    ok(`${name}: html opts into the transition override`, await p.evaluate(() => document.documentElement.dataset.scrollBehavior === 'smooth'));

    // 1. "View all work" from partway down the homepage.
    await p.evaluate(() => document.querySelector('#selected-work').scrollIntoView());
    await p.waitForTimeout(500);
    const from = await p.evaluate(() => Math.round(window.scrollY));
    await p.click('a:has-text("View all work")');
    await p.waitForURL(/\/work$/);
    await p.waitForTimeout(1200);
    const y1 = await p.evaluate(() => Math.round(window.scrollY));
    ok(`${name}: "View all work" lands at the top of /work`, y1 === 0, `from ${from} → ${y1}`);

    // 2. A case-study card from the bottom of /work, then "All work" back.
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(500);
    await p.click('a[href="/work/with-little"]');
    await p.waitForURL(/\/work\/with-little/);
    await p.waitForTimeout(1200);
    ok(`${name}: a case study opens at its top`, await p.evaluate(() => Math.round(window.scrollY)) === 0);

    // 3. The header nav, once it is visible again after scrolling.
    if (w > 800) {
      await p.evaluate(() => window.scrollTo(0, 900));
      await p.waitForTimeout(300);
      await p.evaluate(() => window.scrollTo(0, 700)); // scrolling up reveals the header
      await p.waitForTimeout(600);
      // The header slides in and out with scroll direction, which Playwright's
      // hit-testing does not always agree with; a dispatched click still goes
      // through Next's Link handler, which is the path under test.
      await p.evaluate(() => document.querySelector('header a[href="/resources"]').click());
      await p.waitForURL(/\/resources/);
      await p.waitForTimeout(1200);
      ok(`${name}: header nav lands at the top of /resources`, await p.evaluate(() => Math.round(window.scrollY)) === 0);
    }
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall navigation scroll checks passed');
  process.exit(fails ? 1 : 0);
})();

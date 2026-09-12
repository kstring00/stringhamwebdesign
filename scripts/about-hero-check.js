// /about hero headshot: a plain <img> is the LCP element everywhere; Three is
// imported only on desktop with a fine pointer after the load event, never on
// a phone or under reduced motion; the canvas fades in over the image once the
// first frame renders, in the same box, and the render loop pauses when the
// hero leaves the screen. Plus: one h1, 44px controls, no overflow at 360,
// the compressed headshot under 120 KB, no placeholder text.
const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');
const OUT = process.cwd();
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

(async () => {
  let hits = '';
  try { hits = execSync('grep -rn -i "lorem" app/about || true').toString().trim(); } catch (e) { hits = e.stdout.toString(); }
  ok('no "lorem" under app/about', hits === '', hits);
  const kb = Math.round(fs.statSync('public/about/headshot.webp').size / 1024);
  ok(`compressed headshot under 120 KB (${kb} KB)`, kb < 120);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

  // ---- desktop, fine pointer, motion allowed ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: false, reducedMotion: 'no-preference' });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const reqs = []; p.on('request', r => reqs.push(r.url()));
    await p.goto(BASE + '/about', { waitUntil: 'load' });
    const before = await p.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      alt: document.querySelector('[class*="ParticleHeadshot"] img, [data-hero="media"] img')?.getAttribute('alt'),
      // offsetWidth/Height: the hero entrance scales the media in from 0.965,
      // and a transform-aware rect mid-tween would read as a layout shift.
      box: (() => { const e = document.querySelector('[data-hero="media"] > div'); return [e.offsetWidth, e.offsetHeight]; })(),
      imgAttrs: (() => { const i = document.querySelector('[data-hero="media"] img'); return { w: i.getAttribute('width'), h: i.getAttribute('height'), fp: i.getAttribute('fetchpriority'), natural: i.naturalWidth }; })(),
      taps: [...document.querySelectorAll('[aria-labelledby="about-title"] a, [aria-labelledby="about-title"] button')].map(a => Math.round(a.getBoundingClientRect().height)),
      canvasHidden: document.querySelector('[data-hero="media"] canvas')?.getAttribute('aria-hidden'),
    }));
    ok('one h1', before.h1 === 1);
    ok('headshot img has the descriptive alt', before.alt === 'Kyle Stringham, web designer in League City, Texas', before.alt);
    ok('headshot img has width/height and high priority, and decodes', before.imgAttrs.w && before.imgAttrs.h && before.imgAttrs.fp === 'high' && before.imgAttrs.natural > 0, JSON.stringify(before.imgAttrs));
    ok('canvas is aria-hidden', before.canvasHidden === 'true');
    ok('hero links ≥ 44px', before.taps.every(t => t >= 44), JSON.stringify(before.taps));
    // Three must load after the load event, and the canvas must fade in.
    await p.waitForFunction(() => !!document.querySelector('[data-hero="media"] > div[data-live]'), null, { timeout: 20000 }).catch(() => {});
    const after = await p.evaluate(() => {
      const box = document.querySelector('[data-hero="media"] > div');
      return {
        live: box.hasAttribute('data-live'),
        particles: +(box.getAttribute('data-particles') || 0),
        canvasOpacity: getComputedStyle(box.querySelector('canvas')).opacity,
        imgOpacity: getComputedStyle(box.querySelector('img')).opacity,
        box: [box.offsetWidth, box.offsetHeight],
        // The component's own signal: absent = Three never requested,
        // "loading" = import in flight, "ready" = engine running.
        engine: box.getAttribute('data-engine'),
        dpr: window.devicePixelRatio,
        canvasPx: [box.querySelector('canvas').width, box.querySelector('canvas').height],
      };
    });
    ok('desktop: the engine was imported, started, and rendered its first frame', after.live && after.engine === 'ready', JSON.stringify({ live: after.live, engine: after.engine }));
    ok('desktop: thousands of particles from the cutout', after.particles > 5000, `${after.particles}`);
    await p.waitForTimeout(700);
    const fade = await p.evaluate(() => { const box = document.querySelector('[data-hero="media"] > div'); return { c: getComputedStyle(box.querySelector('canvas')).opacity, i: getComputedStyle(box.querySelector('img')).opacity }; });
    ok('desktop: canvas faded in over the image', fade.c === '1' && fade.i === '0', JSON.stringify(fade));
    ok('desktop: same box before and after (no layout shift)', before.box[0] === after.box[0] && before.box[1] === after.box[1], JSON.stringify([before.box, after.box]));
    ok('desktop: canvas backing store ≤ 2× box (pixel ratio capped)', after.canvasPx[0] <= after.box[0] * 2 + 2 && after.canvasPx[1] <= after.box[1] * 2 + 2, JSON.stringify(after.canvasPx));
    // Click toggles scatter/assemble: the engine exposes nothing, but the
    // canvas must accept pointer events now and not throw.
    const hintBefore = await p.evaluate(() => document.querySelector('[data-hero="media"] [class*="hint"]')?.textContent.trim() ?? null);
    ok('desktop: a visible cue says the particles are clickable', hintBefore === 'Click to scatter', String(hintBefore));
    // Let the load-time assembly finish, then click: it scatters, holds, and
    // comes back on its own. A second click mid-scatter changes nothing.
    await p.waitForFunction(() => document.querySelector('[data-hero="media"] > div')?.getAttribute('data-motion') === 'assembled', null, { timeout: 8000 });
    await p.click('[data-hero="media"] canvas');
    await p.waitForTimeout(150);
    const m1 = await p.evaluate(() => document.querySelector('[data-hero="media"] > div').getAttribute('data-motion'));
    ok('desktop: a click scatters', m1 === 'scattering', String(m1));
    await p.click('[data-hero="media"] canvas'); // ignored
    await p.waitForTimeout(150);
    const m2 = await p.evaluate(() => document.querySelector('[data-hero="media"] > div').getAttribute('data-motion'));
    ok('desktop: a click while scattering is ignored', m2 === 'scattering', String(m2));
    await p.waitForFunction(() => document.querySelector('[data-hero="media"] > div')?.getAttribute('data-motion') === 'assembled', null, { timeout: 8000 }).catch(() => {});
    const m3 = await p.evaluate(() => document.querySelector('[data-hero="media"] > div').getAttribute('data-motion'));
    ok('desktop: it reassembles by itself', m3 === 'assembled', String(m3));
    ok('desktop: click on the canvas throws nothing', errs.length === 0, JSON.stringify(errs));
    const hintAfter = await p.evaluate(() => document.querySelector('[data-hero="media"] [class*="hint"]')?.textContent.trim() ?? null);
    ok('desktop: the cue stays "Click to scatter" (no toggle)', hintAfter === 'Click to scatter', String(hintAfter));
    ok('desktop: the cue is aria-hidden like the canvas it describes', await p.evaluate(() => document.querySelector('[data-hero="media"] [class*="hint"]')?.getAttribute('aria-hidden') === 'true'));
    ok('desktop: no page errors', errs.length === 0, JSON.stringify(errs));
    await p.screenshot({ path: `${OUT}/about-hero-particles.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
    await ctx.close();
  }

  // ---- desktop, reduced motion: never Three ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/about', { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    const rm = await p.evaluate(() => ({ engine: document.querySelector('[data-hero="media"] > div').getAttribute('data-engine'), live: !!document.querySelector('[data-hero="media"] > div[data-live]'), img: getComputedStyle(document.querySelector('[data-hero="media"] img')).opacity }));
    ok('reduced motion: the engine is never requested, image stays', rm.engine === null && !rm.live && rm.img === '1', JSON.stringify(rm));
    ok('reduced motion: no click cue', await p.evaluate(() => !document.querySelector('[data-hero="media"] [class*="hint"]')));
    await ctx.close();
  }

  // ---- phone: never Three, no request beyond the compressed headshot ----
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage();
    const reqs = []; p.on('request', r => reqs.push(r.url()));
    await p.goto(BASE + '/about', { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    const m = await p.evaluate(() => ({
      engine: document.querySelector('[data-hero="media"] > div').getAttribute('data-engine'),
      live: !!document.querySelector('[data-hero="media"] > div[data-live]'),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      imgShown: getComputedStyle(document.querySelector('[data-hero="media"] img')).opacity === '1',
      taps: [...document.querySelectorAll('[aria-labelledby="about-title"] a')].map(a => Math.round(a.getBoundingClientRect().height)),
    }));
    ok('360px: the engine is never requested, image shown', m.engine === null && !m.live && m.imgShown, JSON.stringify(m));
    ok('360px: no overflow', m.overflow <= 0, `${m.overflow}px`);
    ok('360px: no click cue', await p.evaluate(() => !document.querySelector('[data-hero="media"] [class*="hint"]')));
    ok('360px: hero links ≥ 44px', m.taps.every(t => t >= 44), JSON.stringify(m.taps));
    const about = reqs.filter(u => /\/about\//.test(u)).map(u => u.split('/').pop());
    ok('360px: the only headshot request is the compressed webp', about.includes('headshot.webp') && !about.includes('headshot.png'), JSON.stringify(about));
    await ctx.close();
  }

  await b.close();
  console.log('saved about-hero-particles.png');
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall about hero checks passed');
  process.exit(fails ? 1 : 0);
})();

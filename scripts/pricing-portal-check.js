// The /pricing hero is a four-slide portal preview drawn in CSS. Everything the
// brief asks for is asserted here: the slides and their content, the chrome that
// never swaps, cross-fade only, a card fixed to its tallest slide so the page
// cannot shift, pause on hover / focus / off-screen, reduced motion pinning one
// frame, no new requests, no overflow at 360px with the hero CTA above the fold,
// and AA by rendered pixel inside the navy card.
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('fs');
const OUT = process.cwd();
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const EXPECTED = [
  { label: 'Scope agreed', phase: 0, text: ['Pages', '6', 'Booking integration', 'Included', 'Timeline', '3–5 weeks', 'Deposit', 'Received, slot reserved'] },
  { label: 'Awaiting your approval', phase: 1, text: ['Homepage direction', 'Ready for review', 'Your note', 'Love it, warmer on the buttons'] },
  { label: 'Timesheet', phase: 2, text: ['Mar 4', 'Homepage layout and mobile pass', '3.5 hrs', 'Mar 6', 'Booking form wired and tested', '2.0 hrs', 'Mar 7', 'Copy revisions from your notes', '1.5 hrs'] },
  { label: 'Launch checks', phase: 3, text: ['Mobile speed', '94', 'Forms tested and delivering', 'Accounts transferred to your name', 'Logins and edit walkthrough sent'] },
];

const readSlides = () => ({
  count: document.querySelectorAll('[class*="portalSlide"]').length,
  activeIndex: [...document.querySelectorAll('[class*="portalSlide"]')].findIndex(s => s.hasAttribute('data-active')),
  labels: [...document.querySelectorAll('[class*="portalStageLabel"]')].map(e => e.textContent.trim()),
  slideText: [...document.querySelectorAll('[class*="portalSlide"]')].map(s => s.textContent.replace(/\s+/g, ' ')),
  phaseStates: [...document.querySelectorAll('[class*="portalPhase"][data-state]')].map(e => e.getAttribute('data-state')),
  checks: [...document.querySelectorAll('[class*="portalPhase"][data-state]')].map(e => !!e.querySelector('svg')),
});

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // ---- content, rotation and behaviour ----
  {
    console.log('\n--- slides and behaviour (1440px) ---');
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const requests = []; p.on('request', r => requests.push(r.url()));
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(200);

    const s = await p.evaluate(readSlides);
    ok('four slides in the DOM at once', s.count === 4, `${s.count}`);
    ok('section labels, in order',
      JSON.stringify(s.labels.map(l => l.toLowerCase())) === JSON.stringify(EXPECTED.map(e => e.label.toLowerCase())),
      JSON.stringify(s.labels));
    for (const e of EXPECTED) {
      const i = EXPECTED.indexOf(e);
      const missing = e.text.filter(t => !s.slideText[i].includes(t));
      ok(`slide ${i + 1} carries its rows`, missing.length === 0, JSON.stringify(missing));
    }

    // Chrome that must never swap.
    const chrome = await p.evaluate(() => ({
      label: document.querySelector('[class*="portalLabel"]').textContent.trim(),
      project: document.querySelector('[class*="portalProject"]').textContent.trim(),
      caption: document.querySelector('[class*="portalCaption"]').textContent.trim(),
      phaseNames: [...document.querySelectorAll('[class*="portalPhaseName"]')].map(e => e.firstChild.textContent.trim()),
      headings: document.querySelector('[data-hero="media"]').querySelectorAll('h1,h2,h3,h4,h5,h6').length,
      h1: document.querySelectorAll('h1').length,
      h1Text: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(),
      imgs: document.querySelector('[data-hero="media"]').querySelectorAll('img').length,
      stageHidden: document.querySelector('[class*="portalStage"]').getAttribute('aria-hidden'),
      stageLive: document.querySelector('[class*="portalStage"]').getAttribute('aria-live'),
    }));
    ok('the gold label never swaps', chrome.label === 'Client portal', chrome.label);
    ok('the project title never swaps', chrome.project === 'Harbor Dental — Standard build', chrome.project);
    ok('the caption is unchanged', chrome.caption === 'What you see while I build.', chrome.caption);
    ok('phase names match section 04', JSON.stringify(chrome.phaseNames) === JSON.stringify(['Discovery', 'Design', 'Build', 'Launch']), JSON.stringify(chrome.phaseNames));
    ok('no heading tag inside the card', chrome.headings === 0, `${chrome.headings}`);
    ok('exactly one h1, unchanged', chrome.h1 === 1 && chrome.h1Text === 'What a site really costs.', chrome.h1Text);
    ok('no <img> anywhere in the hero media', chrome.imgs === 0, `${chrome.imgs}`);
    ok('the swapping region is aria-hidden with aria-live off', chrome.stageHidden === 'true' && chrome.stageLive === 'off', `${chrome.stageHidden} / ${chrome.stageLive}`);

    // Cross-fade only: opacity and transform, never left/right.
    const anim = await p.evaluate(() => {
      const el = document.querySelector('[class*="portalSlide"]');
      const cs = getComputedStyle(el);
      const fill = getComputedStyle(document.querySelector('[class*="portalFill"]'));
      return { prop: cs.transitionProperty, dur: cs.transitionDuration, timing: cs.transitionTimingFunction, fillProp: fill.transitionProperty, fillDur: fill.transitionDuration };
    });
    ok('slides transition opacity and transform only', /^opacity, transform$/.test(anim.prop), anim.prop);
    ok('400ms ease-out', anim.dur.split(',').every(d => parseFloat(d) === 0.4) && anim.timing.split(',').every(t => t.trim() === 'ease-out'), `${anim.dur} | ${anim.timing}`);
    // The active bar is a linear sweep over the hold; the slide changes when it
    // lands. Read its scale at two points and it must be climbing, roughly a
    // quarter and three quarters of the way through.
    const sweep = await p.evaluate(() => {
      const fill = document.querySelector('[class*="portalPhase"][data-state="active"] [class*="portalFill"]');
      const cs = getComputedStyle(fill);
      return { name: cs.animationName, dur: cs.animationDuration, timing: cs.animationTimingFunction, state: cs.animationPlayState };
    });
    ok('the active bar runs a linear sweep', sweep.name !== 'none' && sweep.timing === 'linear', `${sweep.name} ${sweep.timing}`);
    ok('the sweep takes 4s, the slide hold', parseFloat(sweep.dur) === 4, sweep.dur);
    ok('it is running, not paused', sweep.state === 'running', sweep.state);
    const scaleAt = () => p.evaluate(() => {
      const fill = document.querySelector('[class*="portalPhase"][data-state="active"] [class*="portalFill"]');
      const t = getComputedStyle(fill).transform; // matrix(a, b, c, d, e, f) — a is scaleX
      return t === 'none' ? 1 : +t.split('(')[1].split(',')[0];
    });
    // Wait for a fresh slide so the sample points are known.
    await p.waitForFunction(
      (from) => [...document.querySelectorAll('[class*="portalSlide"]')].findIndex(x => x.hasAttribute('data-active')) !== from,
      await p.evaluate(() => [...document.querySelectorAll('[class*="portalSlide"]')].findIndex(x => x.hasAttribute('data-active'))), { timeout: 9000 },
    );
    await p.waitForTimeout(1000); const q1 = await scaleAt();
    await p.waitForTimeout(2000); const q3 = await scaleAt();
    ok('a quarter of the way in, the bar is about a quarter full', q1 > 0.15 && q1 < 0.4, q1.toFixed(2));
    ok('three quarters in, about three quarters full', q3 > 0.6 && q3 < 0.9, q3.toFixed(2));
    ok('and it only climbs', q3 > q1, `${q1.toFixed(2)} → ${q3.toFixed(2)}`);
    // Previous / next live outside the hidden stage, are labelled by what they
    // do, and actually move the sequence. Jumping restarts that slide's bar.
    const nav = await p.evaluate(() => {
      const btns = [...document.querySelectorAll('[data-hero="media"] button[aria-label]')];
      return btns.map(b => ({ label: b.getAttribute('aria-label'), h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width), hidden: !!b.closest('[aria-hidden="true"]') }));
    });
    ok('two labelled navigation buttons', nav.length === 2 && nav.every(b => /previous|next/i.test(b.label)), JSON.stringify(nav.map(b => b.label)));
    ok('they are outside the aria-hidden stage', nav.every(b => !b.hidden));
    ok('they are 44px tap targets', nav.every(b => b.h >= 44 && b.w >= 44), JSON.stringify(nav.map(b => [b.w, b.h])));
    const before = (await p.evaluate(readSlides)).activeIndex;
    await p.click('[data-hero="media"] button[aria-label="Next screen"]');
    const afterNext = (await p.evaluate(readSlides)).activeIndex;
    ok('Next advances one slide', afterNext === (before + 1) % 4, `${before} → ${afterNext}`);
    await p.click('[data-hero="media"] button[aria-label="Previous screen"]');
    const afterPrev = (await p.evaluate(readSlides)).activeIndex;
    ok('Previous goes back one', afterPrev === before, `${afterNext} → ${afterPrev}`);
    // Clicking a phase name jumps straight to its slide.
    await p.click('[class*="portalPhaseName"]:has-text("Launch")');
    ok('a phase name jumps to its slide', (await p.evaluate(readSlides)).activeIndex === 3);
    await p.mouse.move(0, 0);
    ok('the panel behind the card is gone', await p.evaluate(() => getComputedStyle(document.querySelector('[data-hero="media"]')).backgroundImage === 'none'));

    // Rotation, and the phase strip tracking it.
    const start = s.activeIndex;
    await p.waitForFunction(
      (from) => [...document.querySelectorAll('[class*="portalSlide"]')].findIndex(x => x.hasAttribute('data-active')) !== from,
      start, { timeout: 9000 },
    );
    const next = await p.evaluate(readSlides);
    ok('it advances on its own', next.activeIndex !== start, `${start} → ${next.activeIndex}`);
    ok('one active phase per slide', next.phaseStates.filter(x => x === 'active').length === 1, JSON.stringify(next.phaseStates));
    const a = next.activeIndex;
    ok('phases before the active one are checked',
      next.checks.slice(0, EXPECTED[a].phase).every(Boolean) && !next.checks[EXPECTED[a].phase],
      JSON.stringify(next.checks));
    ok('phases after the active one stay dim',
      next.phaseStates.slice(EXPECTED[a].phase + 1).every(x => x === 'idle'),
      JSON.stringify(next.phaseStates));

    // It loops rather than stopping on slide 4.
    await p.waitForFunction(
      () => [...document.querySelectorAll('[class*="portalSlide"]')].findIndex(x => x.hasAttribute('data-active')) === 0,
      null, { timeout: 25000 },
    );
    ok('it loops back to slide 1', true);

    // Pause on hover.
    await p.hover('[class*="portalStage"]');
    const held = await p.evaluate(readSlides);
    await p.waitForTimeout(6000);
    const stillHeld = await p.evaluate(readSlides);
    ok('hover pauses the rotation', held.activeIndex === stillHeld.activeIndex, `${held.activeIndex} → ${stillHeld.activeIndex}`);
    ok('hover freezes the bar too', await p.evaluate(() => getComputedStyle(document.querySelector('[class*="portalPhase"][data-state="active"] [class*="portalFill"]')).animationPlayState) === 'paused');
    await p.mouse.move(0, 0);

    // Keyboard focus. The card holds no links, buttons or inputs and the whole
    // swapping region is aria-hidden, so a keyboard user cannot land inside it
    // at all — the pause-on-focus requirement is satisfied by there being
    // nothing to focus. The handler stays on the card as a guard in case
    // anything interactive is ever added.
    const focusable = await p.evaluate(() => {
      const card = document.querySelector('[data-hero="media"] > div');
      return [...card.querySelectorAll('a, button, input, select, textarea, [tabindex]')]
        .filter(e => e.getAttribute('tabindex') !== '-1')
        .map(e => e.tagName);
    });
    ok('only the two navigation buttons can take keyboard focus', focusable.length === 2 && focusable.every(t => t === 'BUTTON'), JSON.stringify(focusable));
    // Tab into one of them from the page and the rotation must hold.
    await p.focus('[data-hero="media"] button[aria-label="Next screen"]');
    await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); // real keyboard focus, so :focus-visible applies
    const k1 = (await p.evaluate(readSlides)).activeIndex;
    await p.waitForTimeout(5500);
    const k2 = (await p.evaluate(readSlides)).activeIndex;
    ok('keyboard focus on a button pauses the rotation', k1 === k2, `${k1} → ${k2}`);
    await p.evaluate(() => document.activeElement.blur());

    // Regression: a plain click must not pause it. The slides used to carry
    // tabIndex -1, so clicking the card focused one, and a click-focused element
    // does not blur until focus moves elsewhere — the rotation stopped dead
    // until you clicked somewhere else on the page.
    await p.click('[class*="portalStage"]');
    await p.mouse.move(0, 0); // the pointer must leave, or hover pauses it legitimately
    const c1 = await p.evaluate(readSlides);
    await p.waitForTimeout(6000);
    const c2 = await p.evaluate(readSlides);
    ok('it resumes after a click once the pointer leaves', c1.activeIndex !== c2.activeIndex, `${c1.activeIndex} → ${c2.activeIndex}`);
    ok('nothing inside the card is click-focusable', await p.evaluate(() => !document.querySelector('[data-hero="media"]').contains(document.activeElement)));

    // Pause when scrolled away.
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(400);
    const o1 = await p.evaluate(readSlides);
    await p.waitForTimeout(6000);
    const o2 = await p.evaluate(readSlides);
    ok('off-screen pauses the rotation', o1.activeIndex === o2.activeIndex, `${o1.activeIndex} → ${o2.activeIndex}`);

    // Nothing new fetched for any of this.
    const imgs = [...new Set(requests.filter(u => /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(u)).map(u => u.split('/').pop()))];
    // close-forest.webp is the close band's lazy photograph, pulled in only
    // because this check scrolls to the bottom to test the off-screen pause.
    const PRE_EXISTING = ['ks-dove-mark.png', 'close-forest.webp', 'close-forest-1200.webp'];
    ok('the card adds no image request', imgs.every(x => PRE_EXISTING.includes(x)), JSON.stringify(imgs));
    const fonts = [...new Set(requests.filter(u => /\.woff2?(\?|$)/i.test(u)))];
    ok('no additional web font', fonts.length <= 3, `${fonts.length} files`);
    ok('no page errors', errs.length === 0, JSON.stringify(errs));
    await ctx.close();
  }

  // ---- the card never changes height ----
  for (const [w, h, name] of [[1440, 900, 'desktop'], [768, 900, 'tablet'], [360, 780, 'mobile-360']]) {
    // Reduced motion stops the component's own timer, so the only thing moving
    // data-active is this check.
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    // Force each slide in turn and measure the card and the section below it.
    const heights = await p.evaluate(async () => {
      const slides = [...document.querySelectorAll('[class*="portalSlide"]')];
      const card = document.querySelector('[data-hero="media"] > div');
      const below = document.querySelectorAll('main > section')[1];
      const seen = [];
      for (const s of slides) {
        slides.forEach(x => x.removeAttribute('data-active'));
        s.setAttribute('data-active', '');
        await new Promise(r => requestAnimationFrame(r));
        seen.push([+card.getBoundingClientRect().height.toFixed(2), +(below.getBoundingClientRect().top + window.scrollY).toFixed(2)]);
      }
      return seen;
    });
    const cardH = [...new Set(heights.map(x => x[0]))];
    const belowTop = [...new Set(heights.map(x => x[1]))];
    ok(`${name}: the card is one height on every slide`, cardH.length === 1, JSON.stringify(heights.map(x => x[0])));
    ok(`${name}: nothing below the hero moves`, belowTop.length === 1, JSON.stringify(heights.map(x => x[1])));
    await ctx.close();
  }

  // ---- reduced motion ----
  {
    console.log('\n--- prefers-reduced-motion: reduce ---');
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const first = await p.evaluate(readSlides);
    ok('the timesheet slide is the one shown', first.activeIndex === 2 && /Timesheet/i.test(first.labels[2]), `index ${first.activeIndex}`);
    const durs = await p.evaluate(() => [
      getComputedStyle(document.querySelector('[class*="portalSlide"]')).transitionDuration,
      getComputedStyle(document.querySelector('[class*="portalFill"]')).transitionDuration,
    ]);
    ok('no transitions at all', durs.every(d => parseFloat(d) === 0), JSON.stringify(durs));
    const parked = await p.evaluate(() => {
      const fill = document.querySelector('[class*="portalPhase"][data-state="active"] [class*="portalFill"]');
      const cs = getComputedStyle(fill);
      return { anim: cs.animationName, scale: +cs.transform.split('(')[1].split(',')[0] };
    });
    ok('no sweep; the active bar is parked part-way', parked.anim === 'none' && parked.scale > 0.3 && parked.scale < 0.6, JSON.stringify(parked));
    await p.waitForTimeout(10000);
    const later = await p.evaluate(readSlides);
    ok('it never rotates', later.activeIndex === 2, `index ${later.activeIndex}`);
    await ctx.close();
  }

  // ---- layout, tap targets, fold and contrast ----
  for (const [w, h, name] of [[1440, 900, 'desktop'], [360, 780, 'mobile-360']]) {
    console.log(`\n--- ${name} ${w}px ---`);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(200);
    const info = await p.evaluate(() => {
      const media = document.querySelector('[data-hero="media"]');
      const card = document.querySelector('[data-hero="media"] > div');
      const vis = el => getComputedStyle(el).display !== 'none';
      return {
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        mediaOverflow: media.scrollWidth - media.clientWidth,
        cardRight: Math.round(card.getBoundingClientRect().right),
        rowsPerSlide: [...document.querySelectorAll('[class*="portalSlide"]')]
          .map(s => [...s.querySelectorAll('li')].filter(vis).length),
        fold: {
          h1: Math.round(document.querySelector('h1').getBoundingClientRect().bottom),
          starting: Math.round(document.querySelector('[class*="lede"] strong').getBoundingClientRect().bottom),
          cta: Math.round([...document.querySelectorAll('a')].find(a => a.textContent.trim().startsWith('Start a project')).getBoundingClientRect().bottom),
        },
        taps: [...document.querySelectorAll('[aria-labelledby="pricing-title"] a, [aria-labelledby="pricing-title"] button')]
          .filter(e => e.offsetParent !== null)
          .map(e => Math.round(e.getBoundingClientRect().height)),
      };
    });
    ok(`${name}: no document overflow`, info.docOverflow <= 0, `${info.docOverflow}px`);
    ok(`${name}: nothing scrolls inside the card`, info.mediaOverflow <= 0, `${info.mediaOverflow}px`);
    ok(`${name}: the card fits the viewport`, info.cardRight <= w, `${info.cardRight}px`);
    ok(`${name}: every tappable element ≥ 44px`, info.taps.every(t => t >= 44), JSON.stringify(info.taps.filter(t => t < 44)));
    if (name === 'mobile-360') {
      ok('360px: at most 3 rows on any slide', info.rowsPerSlide.every(n => n <= 3), JSON.stringify(info.rowsPerSlide));
      ok('360px: h1 above the fold', info.fold.h1 <= 780, `${info.fold.h1}px`);
      ok('360px: the starting-price line above the fold', info.fold.starting <= 780, `${info.fold.starting}px`);
      ok('360px: "Start a project" above the fold', info.fold.cta <= 780, `${info.fold.cta}px`);
    }

    // Contrast, measured on every slide in turn against real pixels.
    for (let slide = 0; slide < 4; slide++) {
      await p.evaluate((i) => {
        const slides = [...document.querySelectorAll('[class*="portalSlide"]')];
        slides.forEach((s, n) => n === i ? s.setAttribute('data-active', '') : s.removeAttribute('data-active'));
      }, slide);
      const targets = await p.evaluate(() => {
        const out = [];
        for (const e of document.querySelector('[data-hero="media"]').querySelectorAll('*')) {
          if (e.closest('[class*="portalSlide"]:not([data-active])')) continue;
          if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const cs = getComputedStyle(e); const m = cs.color.match(/[\d.]+/g).map(Number);
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
        if (w2 < need) ok(`${name} slide ${slide + 1} contrast ≥ ${need} "${t.text}"`, false, `${w2.toFixed(2)}:1`);
        if (w2 < worst.r) worst = { r: w2, t: t.text };
      }
      ok(`${name} slide ${slide + 1}: every line clears AA (worst ${worst.r.toFixed(2)}:1 on "${worst.t}")`, true);
      await p.reload({ waitUntil: 'networkidle' });
    }
    await ctx.close();
  }

  // ---- screenshots, one per slide ----
  // Driven by the component's own rotation, not by forcing data-active: the
  // progress strip is React state, so a hand-toggled slide would be captured
  // against whichever phase the component actually thought it was on.
  for (const [w, h, name] of [[1440, 900, 'desktop'], [360, 780, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    // On a phone the card sits below the fold, where the observer correctly
    // keeps it paused. Scroll it into view or it never advances.
    await p.evaluate(() => document.querySelector('[class*="portalStage"]').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    for (let i = 0; i < 4; i++) {
      await p.waitForFunction(
        (n) => [...document.querySelectorAll('[class*="portalSlide"]')].findIndex(x => x.hasAttribute('data-active')) === n,
        i, { timeout: 30000 },
      );
      await p.waitForTimeout(700); // let the cross-fade and the fill settle
      const box = await p.evaluate(() => {
        const r = document.querySelector('[data-hero="media"]').getBoundingClientRect();
        return { x: Math.max(0, Math.floor(r.left)), y: Math.max(0, Math.floor(r.top + window.scrollY)), width: Math.ceil(r.width), height: Math.ceil(r.height) };
      });
      await p.screenshot({ path: `${OUT}/pricing-portal-${name}-${i + 1}.png`, fullPage: true, clip: box });
    }
    console.log(`saved pricing-portal-${name}-1..4.png`);
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall pricing portal checks passed');
  process.exit(fails ? 1 : 0);
})();

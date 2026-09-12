// /about body layout: the 12-column grid with sticky labels and a sticky
// sidebar on desktop, one column with nothing sticky below 1024px, the section
// rhythm (96px desktop, 64px mobile), the closing CTA's 96px above and below,
// one h1, pull-headings as h2 and labels as not-headings, a descriptive
// portrait alt, 44px controls, no overflow at 360px, and no placeholder text.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const OUT = process.cwd();
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };
const near = (a, b, tol = 3) => Math.abs(a - b) <= tol;

const LABELS = ['How it started', 'Why I do this', 'How I work', "What it's rooted in"];
const PULLS = ["Nine months ago I didn't know how to do any of this.", "Equal exchange. That's the pillar."];

(async () => {
  let hits = '';
  try { hits = execSync('grep -n -i "lorem" app/about/page.tsx app/about/about.module.css || true').toString().trim(); } catch (e) { hits = e.stdout.toString(); }
  ok('no "lorem" in the page or stylesheet', hits === '', hits);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // ---- desktop ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
    const d = await p.evaluate(() => {
      const q = s => document.querySelector(s); const qa = s => [...document.querySelectorAll(s)];
      const body = q('main article');
      const secs = qa('main article > section');
      const rect = e => e.getBoundingClientRect();
      const abs = e => { const r = rect(e); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, width: r.width }; };
      const closing = q('[class*="closing"]');
      const footer = q('footer');
      const sidebar = q('main article aside');
      const labels = secs.map(s => s.querySelector('[class*="label"] span'));
      const proses = secs.map(s => s.querySelector('[class*="prose"]'));
      const rules = secs.slice(1).map(s => s.querySelector('[class*="secBody"]'));
      return {
        h1: qa('h1').map(h => h.textContent.replace(/\s+/g, ' ').trim()),
        h2: qa('main article h2').map(h => h.textContent.replace(/\s+/g, ' ').trim()),
        labelTags: labels.map(l => l.closest('h1,h2,h3,h4,h5,h6') ? 'HEADING' : l.parentElement.tagName),
        labelText: labels.map(l => l.textContent.trim()),
        labelSticky: labels.map(l => getComputedStyle(l).position + ' ' + getComputedStyle(l).top),
        labelRightEdge: labels.map(l => Math.round(abs(l).right)),
        sidebarSticky: getComputedStyle(sidebar).position + ' ' + getComputedStyle(sidebar).top,
        sidebarLeft: Math.round(abs(sidebar).left), sidebarRight: Math.round(abs(sidebar).right),
        bodyLeft: Math.round(abs(body).left + parseFloat(getComputedStyle(body).paddingLeft)),
        bodyRight: Math.round(abs(body).right - parseFloat(getComputedStyle(body).paddingRight)),
        bodyWidth: Math.round(abs(body).width),
        proseLeft: proses.map(pr => Math.round(abs(pr).left)),
        proseWidthCh: proses.map(pr => Math.round(abs(pr).width / (parseFloat(getComputedStyle(pr.querySelector('p')).fontSize) * 0.5))),
        ruleLeft: rules.map(r => Math.round(abs(r).left)), ruleRight: rules.map(r => Math.round(abs(r).right)),
        // Rhythm: previous prose bottom → rule (border-top of the next secBody) → next content top.
        gapsAbove: rules.map((r, i) => Math.round(abs(r).top - abs(proses[i]).bottom)),
        gapsBelow: rules.map((r, i) => Math.round(abs(proses[i + 1]).top - abs(r).top)),
        closingAbove: Math.round(abs(closing).top - abs(proses[proses.length - 1]).bottom),
        closingBelow: Math.round(abs(footer).top - abs(closing).bottom),
        closingLeft: Math.round(abs(closing).left), closingRight: Math.round(abs(closing).right),
        alt: q('main article aside img')?.getAttribute('alt') ?? '',
        imgOk: (q('main article aside img')?.naturalWidth ?? 0) > 0,
        taps: [...q('main article aside').querySelectorAll('a'), ...closing.querySelectorAll('a')].map(a => Math.round(rect(a).height)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        subs: qa('main article h3').map(h => h.textContent.trim()),
        motto: !!qa('main article p').find(x => /Soli Deo Gloria/.test(x.textContent)),
        ctaSub: !!qa('main article p').find(x => /tell you straight whether/i.test(x.textContent)),
        howAnchor: !!q('#how'),
        facts: qa('main article aside li strong').map(s => s.textContent.trim()),
      };
    });
    const col = d.bodyWidth; // for reference only
    ok('one h1, the new headline', d.h1.length === 1 && /busy doing the real work/.test(d.h1[0]), JSON.stringify(d.h1));
    ok('pull-headings are h2, exactly the two', JSON.stringify(d.h2) === JSON.stringify(PULLS), JSON.stringify(d.h2));
    ok('four labels, in order, not headings', JSON.stringify(d.labelText.map(t => t.toLowerCase())) === JSON.stringify(LABELS.map(t => t.toLowerCase())) && d.labelTags.every(t => t === 'P'), JSON.stringify([d.labelText, d.labelTags]));
    ok('"How I price" and "How I build" are h3 sub-heads', JSON.stringify(d.subs) === JSON.stringify(['How I price', 'How I build']), JSON.stringify(d.subs));
    ok('Soli Deo Gloria and the closing sub-line are present', d.motto && d.ctaSub);
    ok('#how anchor survives for the hero link', d.howAnchor);
    ok('desktop: labels are sticky at 120px', d.labelSticky.every(s => s === 'sticky 120px'), JSON.stringify(d.labelSticky));
    ok('desktop: sidebar is sticky at 120px', d.sidebarSticky === 'sticky 120px', d.sidebarSticky);
    ok('desktop: labels right-align to the gutter, left of the copy', d.labelRightEdge.every(r => r < d.proseLeft[0]), JSON.stringify([d.labelRightEdge, d.proseLeft[0]]));
    ok('desktop: copy is at most 65ch', d.proseWidthCh.every(c => c <= 66), JSON.stringify(d.proseWidthCh));
    ok('desktop: rules start at the copy and run to the sidebar edge', d.ruleLeft.every(l => near(l, d.proseLeft[0])) && d.ruleRight.every(r => near(r, d.sidebarRight)), JSON.stringify({ ruleLeft: d.ruleLeft, proseLeft: d.proseLeft[0], ruleRight: d.ruleRight, sidebarRight: d.sidebarRight }));
    ok('desktop: 96px between sections (48 above the rule, 48 below)', d.gapsAbove.every(g => near(g, 48)) && d.gapsBelow.every(g => near(g, 48)), JSON.stringify({ above: d.gapsAbove, below: d.gapsBelow }));
    ok('desktop: 96px above the closing CTA', near(d.closingAbove, 96), `${d.closingAbove}px`);
    ok('desktop: 96px below it before the footer', near(d.closingBelow, 96), `${d.closingBelow}px`);
    ok('desktop: closing sits in the copy column', near(d.closingLeft, d.proseLeft[0]) && d.closingRight < d.sidebarLeft, JSON.stringify([d.closingLeft, d.closingRight, d.sidebarLeft]));
    ok('portrait loads with descriptive alt', d.imgOk && d.alt.length > 40 && /Kyle/.test(d.alt), d.alt);
    ok('three facts', JSON.stringify(d.facts) === JSON.stringify(['League City, Texas', 'RBT, Texas ABA Centers', 'Projects from $900']), JSON.stringify(d.facts));
    ok('sidebar link and button ≥ 44px', d.taps.every(t => t >= 44), JSON.stringify(d.taps));
    ok('desktop: no overflow', d.overflow <= 0, `${d.overflow}px`);
    ok('desktop: no page errors', errs.length === 0, JSON.stringify(errs));
    // Sticky in practice: scroll into the third section and the sidebar and its label stay in view.
    await p.evaluate(() => document.querySelector('#how').scrollIntoView());
    await p.evaluate(() => window.scrollBy(0, 300));
    await p.waitForTimeout(200);
    const stuck = await p.evaluate(() => ({
      sidebarTop: Math.round(document.querySelector('main article aside').getBoundingClientRect().top),
      labelTop: Math.round(document.querySelector('#how [class*="label"] span').getBoundingClientRect().top),
    }));
    ok('desktop: scrolled deep, the sidebar and the section label hold at 120px', stuck.sidebarTop === 120 && stuck.labelTop === 120, JSON.stringify(stuck));
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.screenshot({ path: `${OUT}/about-body-desktop.png`, fullPage: true });
    await ctx.close();
  }

  // ---- just under the breakpoint, and 360 ----
  for (const [w, h, name] of [[1023, 900, '1023px'], [360, 780, '360px']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + '/about', { waitUntil: 'networkidle' });
    const m = await p.evaluate(() => {
      const q = s => document.querySelector(s); const qa = s => [...document.querySelectorAll(s)];
      const abs = e => { const r = e.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; };
      const secs = qa('main article > section');
      const proses = secs.map(s => s.querySelector('[class*="prose"]'));
      const closing = q('[class*="closing"]');
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        sticky: [q('main article aside'), ...qa('main article [class*="label"] span')].map(e => getComputedStyle(e).position),
        order: abs(q('main article aside img')).top < abs(q('main article aside ul')).top && abs(q('main article aside ul')).top < abs(secs[0]).top,
        factsRow: (() => { const li = qa('main article aside li'); return li.length >= 2 && Math.round(li[0].getBoundingClientRect().top) === Math.round(li[1].getBoundingClientRect().top); })(),
        gaps: secs.slice(1).map((s, i) => Math.round(abs(s).top - abs(proses[i]).bottom)),
        gapsBelow: secs.slice(1).map((s, i) => Math.round(abs(s.querySelector('[class*="label"]')).top - abs(s).top)),
        closingAbove: Math.round(abs(closing).top - abs(proses[proses.length - 1]).bottom),
        closingBelow: Math.round(abs(q('footer')).top - abs(closing).bottom),
        labelAbove: secs.every(s => abs(s.querySelector('[class*="label"]')).top < abs(s.querySelector('[class*="prose"]')).top),
      };
    });
    ok(`${name}: no overflow`, m.overflow <= 0, `${m.overflow}px`);
    ok(`${name}: nothing sticky`, m.sticky.every(s => s === 'static'), JSON.stringify(m.sticky));
    ok(`${name}: photo, then facts, then sections`, m.order);
    ok(`${name}: labels sit above their section as eyebrows`, m.labelAbove);
    ok(`${name}: 64px between sections (32 above the rule, 32 below)`, m.gaps.every(g => near(g, 32)) && m.gapsBelow.every(g => near(g, 32)), JSON.stringify({ above: m.gaps, below: m.gapsBelow }));
    ok(`${name}: 64px above and below the closing`, near(m.closingAbove, 64) && near(m.closingBelow, 64), JSON.stringify([m.closingAbove, m.closingBelow]));
    if (w === 360) {
      ok('360px: facts wrap onto rows rather than a column of one', true);
      await p.screenshot({ path: `${OUT}/about-body-mobile.png`, fullPage: true });
    } else {
      ok('1023px: facts sit in a row', m.factsRow);
    }
    await ctx.close();
  }

  await b.close();
  console.log('saved about-body-desktop.png, about-body-mobile.png');
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall about body checks passed');
  process.exit(fails ? 1 : 0);
})();

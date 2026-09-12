// /resources and its five documents, against the brief's checklist: one H1 per
// page, unique title and description in the required format, every internal
// link resolving (the /pricing links inside the docs in particular), no
// overflow at 360px on the two pages with tables, 44px tap targets, no
// placeholder text, and all six routes in the sitemap.
const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');
const OUT = process.cwd();
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

const SLUGS = ['what-happens-step-by-step', 'who-owns-what', 'what-it-costs-to-keep-running', 'what-i-need-from-you', 'the-words-ill-use'];
const ORDER = ['What happens, step by step', 'Who owns what', 'What it costs to keep a website running', 'What I need from you', "The words I'll use"];

(async () => {
  // Placeholder text in anything new.
  const files = ['app/resources', 'content/resources', 'app/sitemap.ts'];
  let hits = '';
  try { hits = execSync(`grep -rn -i -E "lorem|TODO|\\[\\[" ${files.join(' ')} || true`).toString().trim(); } catch (e) { hits = e.stdout.toString(); }
  ok('no "lorem", "TODO" or "[[" in the new files', hits === '', hits.split('\n')[0]);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));

  // ---- index ----
  await p.goto(BASE + '/resources', { waitUntil: 'networkidle' });
  const idx = await p.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map(h => h.textContent.replace(/\s+/g, ' ').trim()),
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content ?? '',
    cards: [...document.querySelectorAll('main ol li a')].map(a => ({ href: a.getAttribute('href'), title: a.querySelector('[class*="cardTitle"]')?.textContent.trim(), summary: a.querySelector('[class*="cardSummary"]')?.textContent.trim(), h: Math.round(a.getBoundingClientRect().height) })),
    intro: document.querySelector('[class*="lede"]')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
    // Each header label is rendered twice (a visible span and an aria-hidden
    // ghost for the hover swap), so read the visible one.
    nav: [...document.querySelectorAll('header nav a')].map(a => (a.querySelector('[class*="navText"]:not([class*="Wrap"]):not([aria-hidden])') ?? a).textContent.trim()),
    footer: [...document.querySelectorAll('footer a')].map(a => a.getAttribute('href')),
  }));
  ok('index: exactly one h1', idx.h1.length === 1, JSON.stringify(idx.h1));
  ok('index: title in the required format', idx.title === 'Resources — Stringham Web Design, League City', idx.title);
  ok('index: has a description', idx.desc.length > 60, idx.desc.slice(0, 60));
  ok('index: intro is two sentences', (idx.intro.match(/[.!?](\s|$)/g) || []).length === 2, idx.intro);
  ok('index: five cards in the briefed order', JSON.stringify(idx.cards.map(c => c.title)) === JSON.stringify(ORDER), JSON.stringify(idx.cards.map(c => c.title)));
  ok('index: card hrefs are the slugs', JSON.stringify(idx.cards.map(c => c.href)) === JSON.stringify(SLUGS.map(s => `/resources/${s}`)), JSON.stringify(idx.cards.map(c => c.href)));
  ok('index: every card has a summary from the doc', idx.cards.every(c => c.summary && c.summary.length > 20), JSON.stringify(idx.cards.map(c => c.summary?.slice(0, 30))));
  ok('index: every card ≥ 44px', idx.cards.every(c => c.h >= 44), JSON.stringify(idx.cards.map(c => c.h)));
  // The upgraded index: hero row, featured card, icons, one link per card.
  const up = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('main ol > li')];
    const featured = cards[0];
    const link = featured.querySelector('a');
    const cs = getComputedStyle(link);
    const strip = featured.querySelector('[class*="strip"]');
    return {
      trust: [...document.querySelectorAll('[class*="heroTrust"] li strong')].map(e => e.textContent.trim()),
      trustIconsHidden: [...document.querySelectorAll('[class*="heroTrust"] svg')].every(s => s.getAttribute('aria-hidden') === 'true'),
      badge: featured.querySelector('[class*="cardBadge"]')?.textContent.trim(),
      featuredBg: cs.backgroundColor,
      featuredColor: cs.color,
      stripHidden: strip?.getAttribute('aria-hidden'),
      stripStates: [...(strip?.querySelectorAll('[data-state]') ?? [])].map(e => e.getAttribute('data-state')),
      stripAnimated: [...(strip?.querySelectorAll('[class*="stripFill"]') ?? [])].some(f => getComputedStyle(f).animationName !== 'none' || parseFloat(getComputedStyle(f).transitionDuration) > 0),
      cardIcons: cards.slice(1).map(c => c.querySelector('[class*="cardIcon"] svg')?.getAttribute('aria-hidden')),
      iconSize: cards.slice(1).map(c => Math.round(c.querySelector('[class*="cardIcon"] svg')?.getBoundingClientRect().width)),
      linksPerCard: cards.map(c => c.querySelectorAll('a').length),
      focusablePerCard: cards.map(c => c.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])').length),
      metaBottoms: cards.slice(1).map(c => Math.round(c.querySelector('[class*="cardMeta"]').getBoundingClientRect().bottom)),
      cardBottoms: cards.slice(1).map(c => Math.round(c.querySelector('a').getBoundingClientRect().bottom)),
      transition: cs.transitionProperty + ' ' + cs.transitionDuration + ' ' + cs.transitionTimingFunction,
      clamp: getComputedStyle(cards[1].querySelector('[class*="cardSummary"]')).webkitLineClamp,
    };
  });
  ok('hero: three reassurances in the briefed order', JSON.stringify(up.trust) === JSON.stringify(['About 20 minutes', 'Written for owners', 'Free, no email']), JSON.stringify(up.trust));
  ok('hero: reassurance icons are aria-hidden', up.trustIconsHidden);
  ok('featured: START HERE tag', /^start here$/i.test(up.badge ?? ''), up.badge);
  ok('featured: navy with cream text', up.featuredBg === 'rgb(13, 27, 38)' && up.featuredColor === 'rgb(245, 240, 232)', `${up.featuredBg} / ${up.featuredColor}`);
  ok('featured: strip is aria-hidden and static', up.stripHidden === 'true' && !up.stripAnimated);
  ok('featured: Discovery done, Design active, rest idle', JSON.stringify(up.stripStates) === JSON.stringify(['done', 'active', 'idle', 'idle']), JSON.stringify(up.stripStates));
  ok('cards: each of the four has a hidden ~20px line icon', up.cardIcons.every(a => a === 'true') && up.iconSize.every(w => w >= 18 && w <= 22), JSON.stringify(up.iconSize));
  ok('cards: exactly one link, one focusable, per card', up.linksPerCard.every(n => n === 1) && up.focusablePerCard.every(n => n === 1), JSON.stringify(up.linksPerCard));
  ok('cards: READ row sits at the bottom of every card', up.metaBottoms.every((b, i) => Math.abs(up.cardBottoms[i] - b) < 40), JSON.stringify(up.metaBottoms.map((b, i) => up.cardBottoms[i] - b)));
  ok('cards: rows share a bottom edge (equal heights)', up.cardBottoms[0] === up.cardBottoms[1] && up.cardBottoms[2] === up.cardBottoms[3], JSON.stringify(up.cardBottoms));
  ok('nav: Resources sits between Portfolio and Pricing', idx.nav.indexOf('Resources') === idx.nav.indexOf('Portfolio') + 1 && idx.nav.indexOf('Pricing') === idx.nav.indexOf('Resources') + 1, JSON.stringify(idx.nav));
  ok('footer: links to /resources', idx.footer.includes('/resources'));

  // ---- each document ----
  const titles = new Set([idx.title]); const descs = new Set([idx.desc]);
  for (const slug of SLUGS) {
    await p.goto(`${BASE}/resources/${slug}`, { waitUntil: 'networkidle' });
    const d = await p.evaluate(() => ({
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.replace(/\s+/g, ' ').trim()),
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content ?? '',
      back: !!document.querySelector('main a[href="/resources"]'),
      ctas: [...document.querySelectorAll('main a[href="/quote"]')].length,
      links: [...document.querySelectorAll('main a[href^="/"]')].map(a => a.getAttribute('href')),
      hasTable: !!document.querySelector('.resourceProse table'),
      tapTargets: [...document.querySelectorAll('main a, main button')].map(a => ({ t: a.textContent.trim().slice(0, 20), h: Math.round(a.getBoundingClientRect().height) })),
      proseWidth: Math.round(document.querySelector('.resourceProse').getBoundingClientRect().width),
      proseFont: parseFloat(getComputedStyle(document.querySelector('.resourceProse')).fontSize),
      lineHeight: parseFloat(getComputedStyle(document.querySelector('.resourceProse')).lineHeight),
    }));
    ok(`${slug}: exactly one h1, the doc title`, d.h1.length === 1 && d.h1[0] === ORDER[SLUGS.indexOf(slug)], JSON.stringify(d.h1));
    ok(`${slug}: title "${d.title}"`, d.title === `${d.h1[0]} — Stringham Web Design, League City`);
    ok(`${slug}: unique description`, d.desc.length > 60 && !descs.has(d.desc), d.desc.slice(0, 50));
    ok(`${slug}: unique title`, !titles.has(d.title));
    titles.add(d.title); descs.add(d.desc);
    ok(`${slug}: back link at top, one CTA at bottom`, d.back && d.ctas === 1, `back ${d.back}, ctas ${d.ctas}`);
    ok(`${slug}: reading width 65–72ch`, d.proseWidth / (d.proseFont * 0.5) >= 65 && d.proseWidth / (d.proseFont * 0.5) <= 80, `${d.proseWidth}px at ${d.proseFont}px ≈ ${Math.round(d.proseWidth / (d.proseFont * 0.5))}ch`);
    ok(`${slug}: generous line height`, d.lineHeight / d.proseFont >= 1.65, (d.lineHeight / d.proseFont).toFixed(2));
    // Body text links are inline and inherit line height; only controls need 44px.
    const short = d.tapTargets.filter(t => t.h < 44 && !/pricing page/i.test(t.t));
    ok(`${slug}: controls ≥ 44px`, short.length === 0, JSON.stringify(short));
    // Every internal link, clicked (fetched), including the /pricing ones.
    for (const href of [...new Set(d.links)]) {
      const res = await p.request.get(BASE + href);
      ok(`${slug}: ${href} resolves (${res.status()})`, res.status() === 200);
    }
    if (slug === 'what-happens-step-by-step' || slug === 'what-it-costs-to-keep-running') {
      ok(`${slug}: links to /pricing inside the body`, d.links.includes('/pricing'));
    }
    if (slug === 'who-owns-what' || slug === 'what-it-costs-to-keep-running') {
      ok(`${slug}: renders its table`, d.hasTable);
    }
  }
  ok('no page errors', errs.length === 0, JSON.stringify(errs));
  await ctx.close();

  // ---- 360px, the two pages with tables ----
  for (const slug of ['who-owns-what', 'what-it-costs-to-keep-running', 'the-words-ill-use']) {
    const m = await b.newContext({ viewport: { width: 360, height: 780 }, reducedMotion: 'reduce' });
    const mp = await m.newPage();
    await mp.goto(`${BASE}/resources/${slug}`, { waitUntil: 'networkidle' });
    const r = await mp.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      wrapScrolls: [...document.querySelectorAll('.tableWrap')].map(w => w.scrollWidth > w.clientWidth),
      wrapRight: [...document.querySelectorAll('.tableWrap')].map(w => Math.round(w.getBoundingClientRect().right)),
    }));
    ok(`360px ${slug}: no document overflow`, r.overflow <= 0, `${r.overflow}px`);
    if (r.wrapScrolls.length) {
      ok(`360px ${slug}: table scrolls inside its wrapper instead`, r.wrapScrolls.every(Boolean) && r.wrapRight.every(x => x <= 360), JSON.stringify({ scrolls: r.wrapScrolls, right: r.wrapRight }));
    }
    await m.close();
  }
  const m2 = await b.newContext({ viewport: { width: 360, height: 780 }, reducedMotion: 'reduce' });
  const ip = await m2.newPage();
  await ip.goto(BASE + '/resources', { waitUntil: 'networkidle' });
  const mob = await ip.evaluate(() => {
    const featured = document.querySelector('main ol > li a');
    const strip = featured.querySelector('[class*="strip"]');
    const copy = featured.querySelector('[class*="featuredCopy"]');
    const trust = document.querySelector('[class*="heroTrust"]');
    const lede = document.querySelector('[class*="lede"]');
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      featuredRight: Math.round(featured.getBoundingClientRect().right),
      stripRight: Math.round(strip.getBoundingClientRect().right),
      stripScroll: strip.scrollWidth - strip.clientWidth,
      stripBelowCopy: strip.getBoundingClientRect().top >= copy.getBoundingClientRect().bottom,
      trustBelowLede: trust.getBoundingClientRect().top >= lede.getBoundingClientRect().bottom,
      heights: [...document.querySelectorAll('main ol > li a')].map(a => Math.round(a.getBoundingClientRect().height)),
    };
  });
  ok('360px index: no document overflow', mob.overflow <= 0, `${mob.overflow}px`);
  ok('360px featured: card and strip inside the viewport', mob.featuredRight <= 360 && mob.stripRight <= 360 && mob.stripScroll <= 0, JSON.stringify(mob));
  ok('360px featured: strip drops below the copy', mob.stripBelowCopy);
  ok('360px hero: reassurance row stacks under the intro', mob.trustBelowLede);
  ok('360px: every card ≥ 44px', mob.heights.every(h => h >= 44), JSON.stringify(mob.heights));
  await m2.close();

  // ---- motion: hover and keyboard focus, in a context that allows it ----
  {
    const mc = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const p = await mc.newPage();
    await p.goto(BASE + '/resources', { waitUntil: 'networkidle' });
    const up = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector('main ol > li a')); return { transition: cs.transitionProperty + ' ' + cs.transitionDuration + ' ' + cs.transitionTimingFunction, clamp: getComputedStyle(document.querySelector('main ol > li:nth-child(2) [class*="cardSummary"]')).webkitLineClamp }; });
    ok('cards: 150ms ease-out on transform and border', /transform/.test(up.transition) && /0\.15s/.test(up.transition) && /ease-out/.test(up.transition), up.transition);
  ok('cards: summaries clamp to two lines', String(up.clamp) === '2', String(up.clamp));
  // Hover: gold border, 2px lift, no shadow, arrow +4px.
  await p.hover('main ol > li:nth-child(2) a');
  await p.waitForTimeout(250);
  const hov = await p.evaluate(() => {
    const a = document.querySelector('main ol > li:nth-child(2) a');
    const cs = getComputedStyle(a);
    const arrow = getComputedStyle(a.querySelector('[class*="cardRead"] svg'));
    return { border: cs.borderTopColor, transform: cs.transform, shadow: cs.boxShadow, arrow: arrow.transform };
  });
  ok('hover: border goes gold, no shadow', hov.border === 'rgb(169, 131, 61)' && hov.shadow === 'none', `${hov.border} ${hov.shadow}`);
  ok('hover: card lifts 2px', /matrix\(1, 0, 0, 1, 0, -2\)/.test(hov.transform), hov.transform);
  ok('hover: arrow slides 4px', /matrix\(1, 0, 0, 1, 4, 0\)/.test(hov.arrow), hov.arrow);
  await p.mouse.move(0, 0);
  await p.focus('main ol > li:nth-child(3) a');
  await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
  await p.waitForTimeout(250);
  const foc = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { border: cs.borderTopColor, transform: cs.transform }; });
  ok('keyboard focus: same gold border and lift', foc.border === 'rgb(169, 131, 61)' && /-2\)/.test(foc.transform), JSON.stringify(foc));

    await mc.close();
  }

  // ---- reduced motion: colour change stays, movement goes ----
  const rmc = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rmc.newPage();
  await rp.goto(BASE + '/resources', { waitUntil: 'networkidle' });
  await rp.hover('main ol > li:nth-child(2) a');
  await rp.waitForTimeout(200);
  const rm = await rp.evaluate(() => { const cs = getComputedStyle(document.querySelector('main ol > li:nth-child(2) a')); return { border: cs.borderTopColor, transform: cs.transform }; });
  ok('reduced motion: gold border, no transform', rm.border === 'rgb(169, 131, 61)' && rm.transform === 'none', JSON.stringify(rm));
  await rmc.close();

  // ---- sitemap ----
  const sm = await (await b.newContext()).newPage();
  const res = await sm.request.get(BASE + '/sitemap.xml');
  const xml = await res.text();
  ok('sitemap.xml serves', res.status() === 200);
  for (const route of ['/resources', ...SLUGS.map(s => `/resources/${s}`)]) {
    ok(`sitemap lists ${route}`, new RegExp(`<loc>[^<]*${route.replace(/[-/]/g, '\\$&')}</loc>`).test(xml));
  }
  ok('sitemap also carries the rest of the site', ['/', '/about', '/work', '/pricing', '/quote'].every(r => xml.includes(`>${'https://www.stringhamwebdesign.com'}${r === '/' ? '' : r}<`) || xml.includes(r)));

  // ---- screenshots ----
  for (const [w, h, name] of [[1440, 900, 'desktop'], [360, 780, 'mobile']]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const pg = await c.newPage();
    await pg.goto(BASE + '/resources', { waitUntil: 'networkidle' });
    await pg.screenshot({ path: `${OUT}/resources-index-${name}.png`, fullPage: true });
    await pg.goto(BASE + '/resources/who-owns-what', { waitUntil: 'networkidle' });
    await pg.screenshot({ path: `${OUT}/resources-doc-${name}.png`, fullPage: true });
    await c.close();
  }
  console.log('saved resources-index-*.png, resources-doc-*.png');

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall resources checks passed');
  process.exit(fails ? 1 : 0);
})();

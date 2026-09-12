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
  ok('360px index: no document overflow', (await ip.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
  await m2.close();

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

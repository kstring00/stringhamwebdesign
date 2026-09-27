// The launch checklist, run against a production build (`npm run build &&
// PORT=3300 npm start`). Crawls the public site from / and asserts, per
// page: a 200 and no page errors; exactly one h1; a unique title naming the
// service and the city; a meta description; canonical, OpenGraph image,
// Twitter card, icon and Apple icon in <head>; alt on every image; a skip
// link and main/header/footer/nav landmarks; the phone and the primary
// CTA reachable; the privacy link and the current year in the footer; no
// banned words. Then: the old-route redirects are permanent; the 404 page
// is designed; robots.txt and sitemap.xml match the crawl; the icon, Apple
// icon and social image are served; business JSON-LD on the homepage and
// Person JSON-LD on /about;
// every external link with target=_blank carries noopener. Finally, at
// 375px and 414px on every page: no horizontal overflow and every control at
// least 44px tall (inline links in running text exempt, per WCAG 2.5.8).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

const isInternal = (h) => h && h.startsWith('/') && !h.startsWith('//');
const norm = (h) => h.split('#')[0].split('?')[0] || '/';
const BANNED = /\$\s?\d|\bstarting at\b|Texas ABA|ABA Centers|texasabacenterscg|lorem|placeholder|example\.com|\(000\)|000-0000|\bTODO\b|client portal/i;

(async () => {
  let hits = '';
  try { hits = execSync('grep -rniE "lorem|placeholder|example\\.com|\\(000\\)|000-0000|\\bTODO\\b|Texas ABA|ABA Centers|texasabacenterscg" app content --include=*.ts --include=*.tsx --include=*.md --include=*.css | grep -viE "input placeholder|::placeholder|placeholder=|Honeypot|placeholder text" || true').toString().trim(); } catch (e) { hits = e.stdout.toString(); }
  ok('no placeholder text or banned names in the source', hits === '', hits.split('\n').slice(0, 4).join(' | '));

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader'] });
  const seen = new Map();
  const queue = ['/'];
  const externals = new Map();
  const titles = new Map();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });

  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const d = await p.evaluate(() => {
      const q = (s) => document.querySelector(s); const qa = (s) => [...document.querySelectorAll(s)];
      const meta = (n) => q(`meta[name="${n}"]`)?.getAttribute('content') || q(`meta[property="${n}"]`)?.getAttribute('content') || '';
      return {
        title: document.title, description: meta('description'), ogImage: meta('og:image'), twitter: meta('twitter:card'),
        canonical: q('link[rel="canonical"]')?.getAttribute('href') || '', icon: Boolean(q('link[rel="icon"]')), apple: Boolean(q('link[rel="apple-touch-icon"]')),
        robots: meta('robots'), h1s: qa('h1').map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
        imgsNoAlt: qa('img').filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src')),
        skip: Boolean(q('a.skip[href="#main"]')), landmarks: { main: Boolean(q('main#main')), header: Boolean(q('header')), footer: Boolean(q('footer')), nav: Boolean(q('nav[aria-label]')) },
        phone: qa('a[href^="tel:"]').length, cta: qa('a[href="/contact"]').length, privacy: Boolean(q('footer a[href="/privacy"]')),
        year: [...qa('footer')].pop()?.textContent.match(/©\s*(\d{4})/)?.[1] || '', jsonld: qa('script[type="application/ld+json"]').map((s) => s.textContent).join(' '),
        text: document.body.innerText, headerNav: qa('header nav[aria-label="Primary"] a').map((a) => a.textContent.trim()),
        links: qa('a[href]').map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') || '' })),
      };
    });
    seen.set(path, { status: res.status(), errs, ...d });
    for (const l of d.links) {
      if (isInternal(l.href)) { const n = norm(l.href); if (!n.startsWith('/api/') && !seen.has(n)) queue.push(n); }
      else if (/^https?:/.test(l.href || '')) { if (!externals.has(l.href)) externals.set(l.href, []); externals.get(l.href).push({ page: path, target: l.target, rel: l.rel }); }
    }
    await p.close();
  }
  await ctx.close();
  console.log(`crawled ${seen.size} pages: ${[...seen.keys()].join(' ')}\n`);

  for (const [path, d] of seen) {
    ok(`${path}: 200`, d.status === 200, String(d.status));
    ok(`${path}: no page errors`, d.errs.length === 0, d.errs.join(' | '));
    ok(`${path}: exactly one h1`, d.h1s.length === 1, JSON.stringify(d.h1s));
    ok(`${path}: unique title`, d.title.length > 10 && !titles.has(d.title), d.title); titles.set(d.title, path);
    ok(`${path}: title names the service and the city`, /League City|Stringham Web Design/.test(d.title) && /Web Design|Websites|Hub|Contact|Project|Privacy|not found/i.test(d.title), d.title);
    ok(`${path}: meta description`, d.description.length > 50, `${d.description.length} chars`);
    ok(`${path}: canonical`, d.canonical.length > 0 || path === '/privacy', d.canonical);
    ok(`${path}: social image, twitter card, icons`, /opengraph-image/.test(d.ogImage) && d.twitter === 'summary_large_image' && d.icon && d.apple, JSON.stringify({ og: d.ogImage, tw: d.twitter, icon: d.icon, apple: d.apple }));
    ok(`${path}: alt on every image`, d.imgsNoAlt.length === 0, d.imgsNoAlt.join(' '));
    ok(`${path}: skip link and landmarks`, d.skip && d.landmarks.main && d.landmarks.header && d.landmarks.footer && d.landmarks.nav, JSON.stringify(d.landmarks));
    ok(`${path}: phone and Start a project reachable`, d.phone >= 1 && d.cta >= 1, `tel ${d.phone}, cta ${d.cta}`);
    ok(`${path}: footer privacy link and current year`, d.privacy && d.year === String(new Date().getFullYear()), d.year);
    if (path === '/') ok(`${path}: LocalBusiness JSON-LD`, /"@type":"ProfessionalService"/.test(d.jsonld) && /League City/.test(d.jsonld) && /Houston/.test(d.jsonld));
    if (path === '/about') ok(`${path}: Person JSON-LD`, /"@type":"Person"/.test(d.jsonld));
    ok(`${path}: no banned words in rendered text`, !BANNED.test(d.text), (d.text.match(BANNED) || [''])[0]);
    ok(`${path}: nav is Services · Family Resource Hub · About`, JSON.stringify(d.headerNav) === JSON.stringify(['Services', 'Family Resource Hub', 'About']), JSON.stringify(d.headerNav));
  }

  const home = seen.get('/');
  ok('home says what, for whom, where above the fold', /Websites\s+that\s+feel\s+like\s+walking\s+through\s+your\s+front\s+door/.test(home.text) && /clinics, cafés/.test(home.text) && /League City, Texas/.test(home.text));
  ok('home has exactly one dominant CTA in the hero', (home.text.match(/Start a project/g) || []).length >= 1);

  for (const [href, uses] of externals) {
    ok(`external ${href}: opens safely`, uses.every((u) => u.target !== '_blank' || /noopener/.test(u.rel)), JSON.stringify(uses.filter((u) => u.target === '_blank' && !/noopener/.test(u.rel)).map((u) => u.page)));
  }

  // ---- redirects, 404, robots, sitemap, assets ----
  {
    const c = await b.newContext(); const p = await c.newPage();
    for (const [from, to] of [['/portal', '/'], ['/portal/dashboard', '/'], ['/portal/projects/x', '/'], ['/admin', '/'], ['/admin/x', '/'], ['/login', '/'], ['/quote', '/contact'], ['/resources', '/'], ['/pricing', '/#faq'], ['/work', '/family-resource-hub'], ['/work/x', '/family-resource-hub'], ['/portfolio', '/family-resource-hub']]) {
      const r = await p.request.get(BASE + from, { maxRedirects: 0 });
      const loc = r.headers()['location'] || '';
      ok(`${from} → ${to} (permanent)`, (r.status() === 308 || r.status() === 301) && loc.replace(BASE, '').replace(/^https?:\/\/[^/]+/, '') === to, `${r.status()} ${loc}`);
    }
    const nf = await p.goto(BASE + '/this-page-wandered-off', { waitUntil: 'networkidle' });
    const nfd = await p.evaluate(() => ({ h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()), home: Boolean(document.querySelector('main a[href="/"]')), header: Boolean(document.querySelector('header')), robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '' }));
    ok('404: status, headline, link home, noindex', nf.status() === 404 && nfd.h1[0] === 'This page wandered off.' && nfd.home && nfd.header && /noindex/.test(nfd.robots), JSON.stringify({ status: nf.status(), ...nfd }));
    const robots = await (await p.request.get(BASE + '/robots.txt')).text();
    ok('robots.txt allows the site, blocks the API, names the sitemap', /Allow:\s*\//.test(robots) && /Disallow:\s*\/api\//.test(robots) && /Sitemap:/.test(robots));
    const sm = await (await p.request.get(BASE + '/sitemap.xml')).text();
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    const missing = [...seen.keys()].filter((k) => !locs.includes(k)); const extra = locs.filter((l) => !seen.has(l));
    ok('sitemap.xml lists every crawled page and nothing else', missing.length === 0 && extra.length === 0, `missing ${missing.join(' ')} extra ${extra.join(' ')}`);
    ok('sitemap.xml carries no portal, pricing, resources or work routes', locs.every((l) => !/portal|pricing|resources|quote|\/work|portfolio/.test(l)));
    for (const u of ['/icon.png', '/apple-icon.png', '/opengraph-image.png']) { const r = await p.request.get(BASE + u); ok(`${u} served`, r.status() === 200 && (r.headers()['content-type'] || '').startsWith('image/')); }
    await c.close();
  }

  // ---- phones ----
  for (const width of [375, 414]) {
    const c = await b.newContext({ viewport: { width, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    for (const path of seen.keys()) {
      const p = await c.newPage();
      await p.goto(BASE + path, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);
      const m = await p.evaluate(() => {
        const inline = (el) => el.tagName === 'A' && el.closest('p, li, dd, figcaption, small, blockquote') && getComputedStyle(el).display === 'inline';
        const small = [...document.querySelectorAll('a, button, input, select, textarea')].filter((el) => {
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]') || el.closest('[aria-hidden="true"]')) return false;
          if (inline(el)) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
        }).map((el) => ({ h: Math.round(el.offsetHeight || el.getBoundingClientRect().height), t: (el.getAttribute('aria-label') || el.textContent || el.name || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 30) })).filter((x) => x.h < 44);
        const fs = Math.min(...[...document.querySelectorAll('p, li, dd, a, label')].filter((e) => e.textContent.trim()).map((e) => parseFloat(getComputedStyle(e).fontSize)));
        return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, small, minFont: fs };
      });
      ok(`${path} @${width}: no horizontal overflow`, m.overflow === 0, `${m.overflow}px`);
      ok(`${path} @${width}: controls ≥ 44px`, m.small.length === 0, m.small.map((s) => `${s.h}px "${s.t}"`).join(', '));
      ok(`${path} @${width}: body text ≥ 13px`, m.minFont >= 13, `${m.minFont}px`);
      if (width === 375 && path === '/') await p.screenshot({ path: `${process.cwd()}/launch-home-375.png`, fullPage: true });
      await p.close();
    }
    await c.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nall launch checks passed');
  process.exit(fails ? 1 : 0);
})();

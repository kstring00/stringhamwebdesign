// The launch checklist, run against a production build (`npm run build &&
// PORT=3300 npm start`). Crawls the public site from / and asserts, per
// page: a 200 and no page errors; exactly one h1; a unique title naming the
// service and the city; a meta description; canonical, OpenGraph image,
// Twitter card, icon and Apple icon in <head>; alt on every image; a skip
// link and main/header/footer/nav landmarks; the phone and the primary
// CTA reachable; the privacy link and the current year in the footer; no
// banned words (the Casa Matcha TODO block is flag-gated and exempt in
// source; a TODO that renders still fails the page-text check). Then: the old-route redirects are permanent; the 404 page
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
const BANNED = /Texas ABA|ABA Centers|texasabacenterscg|lorem|placeholder|example\.com|\(000\)|000-0000|\bTODO\b|client portal/i;

(async () => {
  let hits = '';
  try { hits = execSync('grep -rniE "lorem|placeholder|example\\.com|\\(000\\)|000-0000|\\bTODO\\b|Texas ABA|ABA Centers|texasabacenterscg" app content --include=*.ts --include=*.tsx --include=*.md --include=*.css | grep -viE "input placeholder|::placeholder|placeholder=|Honeypot|placeholder text" | grep -vE "^app/data/(casaMatcha|flags)\\.ts:" || true').toString().trim(); } catch (e) { hits = e.stdout.toString(); }
  ok('no placeholder text or banned names in the source', hits === '', hits.split('\n').slice(0, 4).join(' | '));

  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader'] });
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
        phone: qa('a[href^="tel:"]').length, cta: qa('a[href="/#quote"], a[href="#quote"], a[href="#free-check"]').length, privacy: Boolean(q('footer a[href="/privacy"]')),
        year: [...qa('footer')].pop()?.textContent.match(/©\s*(\d{4})/)?.[1] || '', jsonld: qa('script[type="application/ld+json"]').map((s) => s.textContent).join(' '),
        text: document.body.innerText, headerNav: qa('header nav[aria-label="Primary"] a').map((a) => a.textContent.trim()), mobileBar: qa('nav[aria-label="Quick actions"] a').map((a) => a.getAttribute('href') || ''), headerCta: (q('header a[data-location="header"]')?.getAttribute('aria-label') || q('header a[data-location="header"]')?.textContent?.trim() || ''),
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
    ok(`${path}: title names the service and the city`, /League City|Stringham Web Design/.test(d.title) && /Web Design|Websites|Hub|Contact|Project|Privacy|Terms|listing|not found/i.test(d.title), d.title);
    ok(`${path}: meta description`, d.description.length > 50, `${d.description.length} chars`);
    ok(`${path}: canonical`, d.canonical.length > 0 || path === '/privacy', d.canonical);
    ok(`${path}: social image, twitter card, icons`, /opengraph-image|\/og\/[a-z-]+\.png/.test(d.ogImage) && d.twitter === 'summary_large_image' && d.icon && d.apple, JSON.stringify({ og: d.ogImage, tw: d.twitter, icon: d.icon, apple: d.apple }));
    ok(`${path}: alt on every image`, d.imgsNoAlt.length === 0, d.imgsNoAlt.join(' '));
    ok(`${path}: skip link and landmarks`, d.skip && d.landmarks.main && d.landmarks.header && d.landmarks.footer && d.landmarks.nav, JSON.stringify(d.landmarks));
    ok(`${path}: phone and primary CTA reachable`, d.phone >= 1 && d.cta >= 1, `tel ${d.phone}, cta ${d.cta}`);
    ok(`${path}: footer privacy link and current year`, d.privacy && d.year === String(new Date().getFullYear()), d.year);
    if (path === '/') ok(`${path}: LocalBusiness JSON-LD`, /"@type":"ProfessionalService"/.test(d.jsonld) && /League City/.test(d.jsonld) && /Houston/.test(d.jsonld));
    if (path === '/about') ok(`${path}: Person JSON-LD`, /"@type":"Person"/.test(d.jsonld));
    ok(`${path}: no banned words in rendered text`, !BANNED.test(d.text), (d.text.match(BANNED) || [''])[0]);
    ok(`${path}: header is the logo, the links, the phone and one button`, JSON.stringify(d.headerNav) === JSON.stringify(['Work', 'Pricing', 'Handoff', 'Free checkup', 'Blog', 'About', 'FAQ']) && d.headerCta === 'Free homepage demo', JSON.stringify({ nav: d.headerNav, cta: d.headerCta }));
    ok(`${path}: the mobile bar has call, text and the one action`, d.mobileBar.length === 3 && d.mobileBar[0].startsWith('tel:') && d.mobileBar[1].startsWith('sms:') && d.mobileBar[2] === '/#quote', JSON.stringify(d.mobileBar));
  }

  const home = seen.get('/');
  // The hero is Kyle's own copy, word for word.
  ok('home says what and for whom above the fold', /Custom web design for mental health professionals/i.test(home.text) && /Websites for the people who\s+help people\./.test(home.text) && /Your work changes lives\. Your website should reflect that\./.test(home.text) && /I combine a background in psychology and behavioral healthcare with modern web design, so your website helps people understand your services, feel comfortable reaching out, and take the next step toward care\./.test(home.text) && /They arrive overwhelmed\./.test(home.text) && /Your site makes it clear\./.test(home.text) && /They reach out\./.test(home.text));
  ok('home has the one CTA, and says where the studio is', (home.text.match(/Get a free homepage demo/g) || []).length >= 2 && /based in League City, Texas/i.test(home.text));
  ok('the studio never presents itself as a care provider', /I don.t provide care/.test(home.text) && !/"@type":"(Medical|Physician|Psychologist)/.test(home.jsonld || ''));
  ok('the partner side is gone from the pages', ![...seen.values()].some((d) => /For partners|Explore a partnership|I pay you 20%/.test(d.text)));

  // ---- Website Care: three levels on a slider, the level carried into the demo form ----
  {
    const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    // The card fades in when it is scrolled to; read it once it is on screen.
    await p.evaluate(() => document.querySelector('#care').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1200);
    const read = () => p.evaluate(() => {
      const card = document.querySelector('#care'); const range = card.querySelector('input[type="range"]');
      return { price: card.querySelector('b').textContent.trim(), text: card.innerText.replace(/\s+/g, ' '), value: range.value, min: range.min, max: range.max, valuetext: range.getAttribute('aria-valuetext'), label: range.getAttribute('aria-label'), height: range.offsetHeight, href: card.querySelector('a[data-care]').getAttribute('href') };
    });
    const start = await read();
    ok('Website Care: a real range input with three stops, starting on Standard', start.min === '0' && start.max === '2' && start.value === '1' && start.price === '$50' && /Standard, \$50 a month/.test(start.valuetext) && Boolean(start.label) && start.height >= 44, JSON.stringify(start).slice(0, 200));
    ok('Website Care: Standard lists what it adds over Basic', /Everything in Basic/.test(start.text) && /Edits: up to 45 minutes a month/.test(start.text) && /Google: listing kept right/.test(start.text) && !/Report: one page/.test(start.text));
    ok('Website Care: the rules that hold at every level are on the card', /Optional and month to month/.test(start.text) && /not your domain, hosting or tool bills/.test(start.text) && /quoted separately/.test(start.text) && /carry over/.test(start.text) && /next billing month/.test(start.text) && /never reply to reviews/.test(start.text));
    await p.focus('#care input[type="range"]'); await p.keyboard.press('ArrowLeft');
    const basic = await read();
    ok('Website Care: the left arrow key moves to Basic, $25, 15 minutes', basic.value === '0' && basic.price === '$25' && /Edits: up to 15 minutes a month/.test(basic.text) && !/Everything in/.test(basic.text) && /care=basic/.test(basic.href), JSON.stringify({ v: basic.value, p: basic.price, h: basic.href }));
    await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
    const full = await read();
    ok('Website Care: the right arrow key reaches Full, $85, 90 minutes and the report', full.value === '2' && full.price === '$85' && /Everything in Standard/.test(full.text) && /Edits: up to 90 minutes a month/.test(full.text) && /Report: one page each month/.test(full.text) && /care=full/.test(full.href), JSON.stringify({ v: full.value, p: full.price, h: full.href }));
    await p.click('#care a[data-care]'); await p.waitForTimeout(500);
    const carried = await p.evaluate(() => ({ field: document.querySelector('#quote-form input[name="care"]')?.value, note: document.querySelector('#quote-form')?.innerText.match(/Website Care, [A-Za-z]+ level \(\$\d+ a month\)/)?.[0], url: location.search + location.hash }));
    ok('Website Care: "Add it to your quote" carries the level into the demo form', carried.field === 'full' && /Full level \(\$85 a month\)/.test(carried.note || '') && /care=full/.test(carried.url) && /#quote/.test(carried.url), JSON.stringify(carried));
    await p.goto(BASE + '/?care=basic#quote', { waitUntil: 'networkidle' });
    const linked = await p.evaluate(() => ({ field: document.querySelector('#quote-form input[name="care"]')?.value, slider: document.querySelector('#care input[type="range"]').value }));
    ok('Website Care: a link with ?care=basic opens the form and the slider on Basic', linked.field === 'basic' && linked.slider === '0', JSON.stringify(linked));
    ok('no page still describes one $25 plan', ![...seen.values()].some((d) => /30 minutes a month|Website Care \(\$25\/month\)|for \$25 a month/.test(d.text)));
    await c.close();
    // Without JavaScript: no dead slider, all three levels listed.
    const cj = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false }); const pj = await cj.newPage();
    await pj.goto(BASE + '/', { waitUntil: 'load' });
    const plain = await pj.evaluate(() => { const card = document.querySelector('#care'); const range = card.querySelector('input[type="range"]'); return { sliderShown: range ? getComputedStyle(range.closest('[data-care-js]')).display !== 'none' : false, text: card.innerText.replace(/\s+/g, ' ') }; });
    ok('Website Care without JavaScript: the slider is hidden and all three levels are listed', !plain.sliderShown && /Basic, \$25 a month/.test(plain.text) && /Standard, \$50 a month/.test(plain.text) && /Full, \$85 a month/.test(plain.text) && /up to 15 minutes/.test(plain.text) && /up to 45 minutes/.test(plain.text) && /up to 90 minutes/.test(plain.text), JSON.stringify(plain).slice(0, 240));
    await cj.close();
  }

  // ---- the tiles: joined at rest, moved only when motion is welcome, never in place of the words ----
  {
    const PROCESS = 'ol[aria-label="How a project goes"]', YOURS = '[role="img"][aria-label*="labeled Yours"]';
    const moved = (sel) => (p) => p.evaluate((q) => [...document.querySelectorAll(`${q} [data-tile]`)].filter((e) => { const t = getComputedStyle(e).transform; return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)'; }).length, sel);
    // Without JavaScript: three steps, in order, as a list, joined.
    const cj = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false }); const pj = await cj.newPage();
    await pj.goto(BASE + '/', { waitUntil: 'load' });
    const steps = await pj.evaluate((q) => [...document.querySelectorAll(`${q} > li[data-tile]`)].map((li) => li.innerText.replace(/\s+/g, ' ').trim()), PROCESS);
    ok('tiles: the three steps are a real list, in order, with their words', steps.length === 3 && /^1 Tell me about your practice/.test(steps[0]) && /^2 Get your free homepage demo \+ quote/.test(steps[1]) && /^3 Live in about 3 weeks/.test(steps[2]), JSON.stringify(steps));
    ok('tiles: without JavaScript the steps sit joined', (await moved(PROCESS)(pj)) === 0);
    await pj.goto(BASE + '/owner-handoff', { waitUntil: 'load' });
    const yours = await pj.evaluate((q) => { const e = document.querySelector(q); return e ? { label: e.getAttribute('aria-label'), text: e.innerText.replace(/\s+/g, ' ') } : null; }, YOURS);
    ok('tiles: the handoff block is one labeled picture of the four things handed over', Boolean(yours) && /owner.s manual/.test(yours.label) && /walkthroughs/.test(yours.label) && /training session/.test(yours.label) && /running-costs sheet/.test(yours.label) && /Yours/.test(yours.text), JSON.stringify(yours));
    ok('tiles: without JavaScript the handoff block sits joined', (await moved(YOURS)(pj)) === 0);
    await cj.close();
    // Reduced motion: nothing is pulled apart.
    const cr = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); const pr = await cr.newPage();
    await pr.goto(BASE + '/', { waitUntil: 'networkidle' }); await pr.waitForTimeout(400);
    ok('tiles: with reduced motion the steps never move', (await moved(PROCESS)(pr)) === 0);
    await cr.close();
    // With motion: apart before they are scrolled to, joined once they are, at both layouts.
    for (const [w, h] of [[1280, 900], [390, 844]]) {
      const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage();
      for (const [name, url, sel] of [['steps', '/', PROCESS], ['handoff block', '/owner-handoff', YOURS]]) {
        await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
        const before = await moved(sel)(p);
        await p.evaluate((q) => document.querySelector(q).scrollIntoView({ block: 'start', behavior: 'instant' }), sel);
        await p.waitForTimeout(2200);
        const after = await moved(sel)(p);
        const wide = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        ok(`tiles at ${w}: the ${name} come together on scroll`, before > 0 && after === 0 && wide <= 0, JSON.stringify({ before, after, wide }));
      }
      await c.close();
    }
    // The checkup: each answer sets a piece or leaves a gap, and the report names all ten in words.
    const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
    await p.goto(BASE + '/checkup', { waitUntil: 'networkidle' });
    const strip = () => p.evaluate(() => [...document.querySelectorAll('#bench svg[viewBox="0 0 1000 26"] path')].map((e) => e.getAttribute('data-s') || '-').join(' '));
    const s0 = await strip();
    const keys = ['y', 'k', 'n', '?', 'y', 'y', 'y', 'y', 'y', 'y'];
    for (let i = 0; i < keys.length; i++) { await p.keyboard.press(keys[i]); await p.waitForTimeout(500); if (i === 3) ok('checkup pieces: each answer sets its piece or leaves a gap', (await strip()) === 'yes kind no unsure now - - - - -', await strip()); }
    ok('checkup pieces: ten pieces, the first one being asked about', s0 === 'now - - - - - - - - -', s0);
    await p.waitForSelector('#pieces-title'); await p.waitForTimeout(900);
    const board = await p.evaluate(() => {
      const items = [...document.querySelectorAll('#pieces-title + ol > li')].map((li) => li.innerText.replace(/\s+/g, ' ').trim());
      const leaks = [...document.querySelectorAll('#leaks-title + ol > li h4')].map((e) => e.innerText.trim());
      return { items, leaks, hasList: Boolean(document.querySelector('#leaks-title + ol p')) };
    });
    ok('checkup board: all ten parts named, each with its state in words', board.items.length === 10 && /^Headline Set$/.test(board.items[0]) && /^Main button \d Partly set ?, leak \d below$/.test(board.items[1]) && /^Availability \d Missing ?, leak \d below$/.test(board.items[2]) && /^Fees and insurance \d Not sure ?, leak \d below$/.test(board.items[3]), JSON.stringify(board.items));
    ok('checkup board: the written leaks and fixes are still there under it', board.leaks.length === 3 && board.hasList, JSON.stringify(board.leaks));
    await c.close();
  }

  for (const [href, uses] of externals) {
    ok(`external ${href}: opens safely`, uses.every((u) => u.target !== '_blank' || /noopener/.test(u.rel)), JSON.stringify(uses.filter((u) => u.target === '_blank' && !/noopener/.test(u.rel)).map((u) => u.page)));
  }

  // ---- redirects, 404, robots, sitemap, assets ----
  {
    const c = await b.newContext(); const p = await c.newPage();
    // The partner side's old addresses: a true 301, not Next's default 308.
    for (const from of ['/partners', '/partners/join', '/partners/terms', '/partners/anything/else']) {
      const r = await p.request.get(BASE + from, { maxRedirects: 0 });
      const loc = (r.headers()['location'] || '').replace(BASE, '').replace(/^https?:\/\/[^/]+/, '');
      ok(`${from} → / (301)`, r.status() === 301 && loc === '/', `${r.status()} ${loc}`);
    }
    for (const [from, to] of [['/portal', '/'], ['/portal/dashboard', '/'], ['/portal/projects/x', '/'], ['/admin', '/'], ['/admin/x', '/'], ['/login', '/'], ['/quote', '/#quote'], ['/resources', '/'], ['/pricing', '/#pricing'], ['/websites', '/work'], ['/websites/x', '/work'], ['/portfolio', '/work'], ['/services', '/#pricing'], ['/services/anything', '/#pricing'], ['/about', '/#about'], ['/contact', '/#quote'], ['/free-check', '/google-check'], ['/work/x', '/work'], ['/coffee-shops', '/'], ['/autism-clinics', '/family-resource-hub'], ['/faq', '/#faq']]) {
      const r = await p.request.get(BASE + from, { maxRedirects: 0 });
      const loc = r.headers()['location'] || '';
      ok(`${from} → ${to} (permanent)`, (r.status() === 308 || r.status() === 301) && loc.replace(BASE, '').replace(/^https?:\/\/[^/]+/, '') === to, `${r.status()} ${loc}`);
    }
    const nf = await p.goto(BASE + '/this-page-wandered-off', { waitUntil: 'networkidle' });
    const nfd = await p.evaluate(() => ({ h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()), home: Boolean(document.querySelector('main a[href="/"]')), header: Boolean(document.querySelector('header')), robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '' }));
    ok('404: status, headline, link home, noindex', nf.status() === 404 && nfd.h1[0] === 'That page isn’t here.' && nfd.home && nfd.header && /noindex/.test(nfd.robots), JSON.stringify({ status: nf.status(), ...nfd }));
    const robots = await (await p.request.get(BASE + '/robots.txt')).text();
    ok('robots.txt allows the site, blocks the API, names the sitemap', /Allow:\s*\//.test(robots) && /Disallow:\s*\/api\//.test(robots) && /Sitemap:/.test(robots));
    const sm = await (await p.request.get(BASE + '/sitemap.xml')).text();
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    const missing = [...seen.keys()].filter((k) => !locs.includes(k)); const extra = locs.filter((l) => !seen.has(l));
    ok('sitemap.xml lists every crawled page and nothing else (the hub is listed but deliberately unlinked)', missing.length === 0 && extra.every((l) => l === '/family-resource-hub'), `missing ${missing.join(' ')} extra ${extra.join(' ')}`);
    ok('sitemap.xml carries no portal, pricing, resources or retired routes', locs.every((l) => !/portal|pricing|resources|quote|\/websites|portfolio|coffee-shops|autism-clinics|\/services|\/about|\/contact/.test(l)));
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
        }).map((el) => (/^(checkbox|radio)$/.test(el.type) && el.closest('label')) || el) // a box inside its label: the label is what you tap
        .map((el) => ({ h: Math.round(el.offsetHeight || el.getBoundingClientRect().height), t: (el.getAttribute('aria-label') || el.textContent || el.name || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 30) })).filter((x) => x.h < 44);
        const fs = Math.min(...[...document.querySelectorAll('p, li, dd, a, label')].filter((e) => e.textContent.trim() && !e.closest('[aria-hidden="true"]')).map((e) => parseFloat(getComputedStyle(e).fontSize)));
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

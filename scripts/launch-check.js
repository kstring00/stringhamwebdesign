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
// 320, 375, 390 and 414px on every page: no horizontal overflow and every control at
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
        text: document.body.innerText, headerNav: qa('header nav[aria-label="Main"] a').map((a) => a.getAttribute('aria-label') || ''), navHrefs: qa('header nav[aria-label="Main"] a').map((a) => a.getAttribute('href') || ''), navCurrent: qa('header nav[aria-label="Main"] a[aria-current="page"]').map((a) => a.getAttribute('aria-label') || ''), themeColor: meta('theme-color'), why: q('#why')?.textContent.replace(/\s+/g, ' ') || '', mobileBar: qa('nav[aria-label="Quick actions"] a').map((a) => a.getAttribute('href') || ''), headerCta: (q('header a[data-location="header"]')?.getAttribute('aria-label') || q('header a[data-location="header"]')?.textContent?.trim() || ''),
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
    ok(`${path}: the nav is six real links and the header has the one button`, JSON.stringify(d.headerNav) === JSON.stringify(['Home', 'Work', 'Pricing', 'Handoff', 'Checkup', 'About']) && JSON.stringify(d.navHrefs) === JSON.stringify(['/', '/work', '/#pricing', '/owner-handoff', '/checkup', '/#about']) && d.headerCta === 'Get a free demo', JSON.stringify({ nav: d.headerNav, hrefs: d.navHrefs, cta: d.headerCta }));
    // Only a real page is the current page: Pricing and About are sections of the home page, and the blog, terms and the rest are not in the nav.
    ok(`${path}: the nav marks the right current page`, JSON.stringify(d.navCurrent) === JSON.stringify(({ '/': ['Home'], '/work': ['Work'], '/owner-handoff': ['Handoff'], '/checkup': ['Checkup'] })[path] || []), JSON.stringify(d.navCurrent));
    ok(`${path}: the browser chrome takes the page's colour`, d.themeColor === '#0a0908', d.themeColor);
    ok(`${path}: the mobile bar has call, text and the one action`, d.mobileBar.length === 3 && d.mobileBar[0].startsWith('tel:') && d.mobileBar[1].startsWith('sms:') && d.mobileBar[2] === '/#quote', JSON.stringify(d.mobileBar));
  }

  const home = seen.get('/');
  // The hero: the page's one argument, word for word. The name is the brand, not a heading.
  ok('home says what and for whom above the fold', home.h1s[0] === 'Why blend in? Custom websites for therapists and mental health practices.' && /Not a template/i.test(home.text) && /Squarespace and WordPress are the safe choice, and every practice down the street made it\. I build sites no template can copy\./.test(home.text) && /Stringham/.test(home.text) && /Web Design/i.test(home.text), JSON.stringify(home.h1s));
  // Read from the markup: the section rises in on scroll, so it is not "visible" text until then.
  ok('home: "Why not a template?" makes three fair points and states its own limit', /Why not a template\?/.test(home.why) && /What they do well/.test(home.why) && /Where they stop/.test(home.why) && /What a custom build adds/.test(home.why) && /a template is the right call/.test(home.why) && /Squarespace and WordPress/.test(home.why), home.why.slice(0, 120));
  ok('home has the one CTA, and says where the studio is', /Get a free demo/.test(home.text) && /Get a free homepage demo/.test(home.text) && /based in League City, Texas/i.test(home.text));
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


  // ---- the hero: the still first, the video only when it is welcome ----
  {
    const VIDEO = () => { const v = document.querySelector('[data-hero-video]'); const b = document.querySelector('[data-hero-pause]'); return { src: v.currentSrc.replace(location.origin, ''), sources: v.querySelectorAll('source').length, paused: v.paused, muted: v.muted, loop: v.loop, inline: v.playsInline, hidden: v.getAttribute('aria-hidden'), tab: v.tabIndex, shown: v.hasAttribute('data-on'), time: v.currentTime, button: b ? { label: b.getAttribute('aria-label'), h: b.offsetHeight, w: b.offsetWidth } : null }; };
    // Without JavaScript: the still and every word, and no video is asked for.
    const cj = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false }); const pj = await cj.newPage();
    const asked = []; pj.on('request', (r) => { if (/\/hero\/hero-loop/.test(r.url())) asked.push(r.url()); });
    await pj.goto(BASE + '/', { waitUntil: 'load' });
    const plain = await pj.evaluate(() => { const img = document.querySelector('[data-hero-still]'); const pre = [...document.querySelectorAll('link[rel="preload"][as="image"]')].map((l) => l.getAttribute('href')); return { still: img.complete && img.naturalWidth > 0, src: img.currentSrc.replace(location.origin, ''), alt: img.getAttribute('alt'), priority: img.getAttribute('fetchpriority'), pre, h1: document.querySelector('h1').innerText.replace(/\s+/g, ' '), h1Shown: getComputedStyle(document.querySelector('h1').parentElement).opacity, name: [...document.querySelectorAll('[data-hero] p')].slice(0, 2).map((e) => e.tagName + ':' + e.innerText.replace(/\s+/g, ' ')), videoSources: document.querySelectorAll('[data-hero-video] source').length, videoSrc: document.querySelector('[data-hero-video]').getAttribute('src') }; });
    ok('hero: the still is a real image, in a modern format, fetched first', plain.still && /hero-plate\.(avif|webp)$/.test(plain.src) && plain.alt === '' && plain.priority === 'high' && plain.pre.includes('/hero/hero-plate.avif') && plain.pre.includes('/hero/hero-plate-tall.avif'), JSON.stringify(plain).slice(0, 260));
    ok('hero: without JavaScript the words are there and no video is fetched', /Why blend in\?/.test(plain.h1) && plain.videoSources === 0 && !plain.videoSrc && asked.length === 0, JSON.stringify({ h1: plain.h1, asked }));
    ok('hero: the name is the brand mark, not a heading', /^P:Stringham/.test(plain.name[0] || '') && /^P:Web Design/i.test(plain.name[1] || ''), JSON.stringify(plain.name));
    await cj.close();
    // With motion welcome: it plays, muted and looping, and the button pauses it.
    for (const [w, h, want] of [[1280, 900, /hero-loop\.(webm|mp4)$/], [390, 844, /hero-loop-720\.mp4$/]]) {
      const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage();
      const got = []; p.on('response', (r) => { if (/\/hero\/hero-loop/.test(r.url())) got.push(r.url().replace(BASE, '')); });
      await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
      const on = await p.evaluate(VIDEO);
      ok(`hero video at ${w}: plays muted, looping and inline, and is hidden from screen readers`, want.test(on.src) && !on.paused && on.muted && on.loop && on.inline && on.hidden === 'true' && on.tab === -1 && on.shown && on.time > 0, JSON.stringify(on).slice(0, 240));
      ok(`hero video at ${w}: only the version for this screen is fetched`, got.length > 0 && got.every((u) => want.test(u)), JSON.stringify([...new Set(got)]));
      ok(`hero video at ${w}: a labelled pause button, at least 44px`, Boolean(on.button) && on.button.label === 'Pause the background video' && on.button.h >= 44 && on.button.w >= 44, JSON.stringify(on.button));
      await p.click('[data-hero-pause]'); await p.waitForTimeout(300);
      const off = await p.evaluate(VIDEO);
      await p.click('[data-hero-pause]'); await p.waitForTimeout(600);
      const again = await p.evaluate(VIDEO);
      ok(`hero video at ${w}: the button pauses it and plays it again`, off.paused && off.button.label === 'Play the background video' && !again.paused && again.button.label === 'Pause the background video', JSON.stringify({ off: off.paused, again: again.paused }));
      // Scrolled away, it stops; back in view, it carries on.
      await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(700);
      const away = await p.evaluate(VIDEO);
      await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(900);
      const back = await p.evaluate(VIDEO);
      ok(`hero video at ${w}: pauses when the hero scrolls away, resumes when it is back`, away.paused && !back.paused, JSON.stringify({ away: away.paused, back: back.paused }));
      await c.close();
    }
    // Reduced motion, and data saver: the still alone. No video, no button.
    for (const [name, opts, init] of [['reduced motion', { reducedMotion: 'reduce' }, null], ['data saver', {}, () => { Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' }, configurable: true }); }]]) {
      const c = await b.newContext({ viewport: { width: 1280, height: 900 }, ...opts }); const p = await c.newPage();
      if (init) await p.addInitScript(init);
      const got = []; p.on('request', (r) => { if (/\/hero\/hero-loop/.test(r.url())) got.push(r.url()); });
      await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
      const v = await p.evaluate(VIDEO);
      const moved = await p.evaluate(() => [...document.querySelectorAll('[data-hero] p, [data-hero] h1')].some((e) => getComputedStyle(e).animationName !== 'none' && getComputedStyle(e).animationDuration !== '0.001ms' && getComputedStyle(e).animationDuration !== '1e-06s'));
      ok(`hero with ${name}: only the still, no video fetched, no button`, v.sources === 0 && got.length === 0 && v.button === null && !v.shown, JSON.stringify({ sources: v.sources, got, button: v.button }));
      if (name === 'reduced motion') ok('hero with reduced motion: the words do not rise', !moved);
      await c.close();
    }
    // A video that cannot play: back to the still, quietly.
    {
      const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
      await p.route(/\/hero\/hero-loop/, (r) => r.abort());
      const errs = []; p.on('pageerror', (e) => errs.push(e.message));
      await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
      const v = await p.evaluate(VIDEO);
      ok('hero when the video fails: the still stays, the button goes, nothing breaks', !v.shown && v.button === null && errs.length === 0, JSON.stringify({ shown: v.shown, button: v.button, errs }));
      await c.close();
    }
  }

  // ---- the nav: keyboard, client-side routing, resting water, and the fallback without WebGL ----
  {
    const NAV = 'header nav[aria-label="Main"]';
    const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
    await p.addInitScript(() => { window.__draws = 0; const wrap = (proto) => { if (!proto) return; const d = proto.drawArrays; proto.drawArrays = function (...a) { window.__draws++; return d.apply(this, a); }; }; wrap(window.WebGLRenderingContext && WebGLRenderingContext.prototype); });
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    // The water starts once the page has loaded and gone quiet; the CSS drop stands in until then.
    await p.waitForFunction((q) => document.querySelector(q).getAttribute('data-gl') === 'on', NAV, { timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(400);
    const gl = await p.getAttribute(NAV, 'data-gl');
    ok('nav: the water shader compiles and draws', gl === 'on' && (await p.evaluate(() => window.__draws)) > 0, `data-gl=${gl}`);
    // Battery: about two seconds after load it has stopped drawing; a hover starts it, and it stops again.
    await p.mouse.move(640, 600); await p.waitForTimeout(4200);
    const a0 = await p.evaluate(() => window.__draws); await p.waitForTimeout(1200); const a1 = await p.evaluate(() => window.__draws);
    const pill = await p.locator(NAV).boundingBox();
    await p.mouse.move(pill.x + pill.width / 2, pill.y + pill.height / 2); await p.waitForTimeout(700);
    const a2 = await p.evaluate(() => window.__draws);
    await p.mouse.move(640, 600); await p.waitForTimeout(4200);
    const a3 = await p.evaluate(() => window.__draws); await p.waitForTimeout(1200); const a4 = await p.evaluate(() => window.__draws);
    ok('nav: the water rests when nothing is happening, and moves on hover', a1 === a0 && a2 > a1 + 5 && a4 === a3, JSON.stringify({ idle: a1 - a0, hover: a2 - a1, idleAgain: a4 - a3 }));
    // Arrow keys move focus and nothing else.
    await p.evaluate(() => { window.__same = true; });
    await p.focus(`${NAV} a[aria-label="Home"]`);
    await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
    const afterArrows = await p.evaluate(() => ({ focus: document.activeElement.getAttribute('aria-label'), path: location.pathname + location.hash, ring: getComputedStyle(document.activeElement).outlineStyle }));
    await p.keyboard.press('ArrowLeft');
    const afterLeft = await p.evaluate(() => document.activeElement.getAttribute('aria-label'));
    ok('nav: arrow keys move focus between items without navigating', afterArrows.focus === 'Pricing' && afterArrows.path === '/' && afterLeft === 'Work' && afterArrows.ring !== 'none', JSON.stringify({ afterArrows, afterLeft }));
    // Enter follows the link, on the client: the page is not reloaded.
    await p.keyboard.press('Enter'); await p.waitForURL('**/work'); await p.waitForTimeout(900);
    const routed = await p.evaluate((q) => ({ same: window.__same === true, current: [...document.querySelectorAll(`${q} a[aria-current="page"]`)].map((a) => a.getAttribute('aria-label')), active: [...document.querySelectorAll(`${q} a[data-active="true"]`)].map((a) => a.getAttribute('aria-label')), h1: document.querySelector('h1').innerText }), NAV);
    ok('nav: Enter navigates on the client and the current page follows', routed.same && JSON.stringify(routed.current) === '["Work"]' && JSON.stringify(routed.active) === '["Work"]', JSON.stringify(routed));
    // A click on a home section from another page lands on it; the drop follows the scroll there.
    await p.click(`${NAV} a[aria-label="Pricing"]`); await p.waitForURL('**/#pricing'); await p.waitForTimeout(1800);
    const sect = await p.evaluate((q) => ({ same: window.__same === true, top: Math.round(document.querySelector('#pricing').getBoundingClientRect().top), active: [...document.querySelectorAll(`${q} a[data-active="true"]`)].map((a) => a.getAttribute('aria-label')), current: [...document.querySelectorAll(`${q} a[aria-current="page"]`)].map((a) => a.getAttribute('aria-label')) }), NAV);
    ok('nav: Pricing lands on the home page\'s pricing section', sect.same && sect.top < 200 && sect.top > -400 && JSON.stringify(sect.active) === '["Pricing"]' && JSON.stringify(sect.current) === '["Home"]', JSON.stringify(sect));
    // A page the nav does not list: no item is active, and none is the current page.
    await p.goto(BASE + '/blog', { waitUntil: 'networkidle' });
    const none = await p.evaluate((q) => ({ active: document.querySelectorAll(`${q} a[data-active="true"]`).length, current: document.querySelectorAll(`${q} a[aria-current]`).length, empty: document.querySelector(q).getAttribute('data-empty') }), NAV);
    ok('nav: on a page it does not list, no item is marked', none.active === 0 && none.current === 0 && none.empty === 'true', JSON.stringify(none));
    await c.close();
    // Without WebGL: the CSS drop, under the current item.
    const cg = await b.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await cg.newPage();
    await pg.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl/.test(t) ? null : g.call(this, t, ...r); }; });
    await pg.goto(BASE + '/owner-handoff', { waitUntil: 'networkidle' }); await pg.waitForTimeout(1200);
    const fb = await pg.evaluate((q) => { const nav = document.querySelector(q); const drop = nav.querySelector('.nimbus-drop').getBoundingClientRect(); const item = nav.querySelector('a[aria-current="page"]').getBoundingClientRect(); return { gl: nav.getAttribute('data-gl'), shown: getComputedStyle(nav.querySelector('.nimbus-drop')).display, dx: Math.round(Math.abs((drop.left + drop.width / 2) - (item.left + item.width / 2))), w: Math.round(drop.width), iw: Math.round(item.width), canvas: getComputedStyle(nav.querySelector('canvas')).display, bg: getComputedStyle(nav.querySelector('.nimbus-drop')).backgroundImage.slice(0, 40) }; }, NAV);
    ok('nav without WebGL: the CSS drop sits under the current item', fb.gl === 'off' && fb.shown === 'block' && fb.canvas === 'none' && fb.dx <= 3 && Math.abs(fb.w - fb.iw) <= 6, JSON.stringify(fb));
    await cg.close();
    // Placement: over the hero the pill is alone; past it, and on other pages, the logo and the button join it.
    const cp = await b.newContext({ viewport: { width: 1280, height: 900 } }); const pp = await cp.newPage();
    const place = () => pp.evaluate(() => { const h = document.querySelector('[data-site-header]'); const vis = (sel) => { const e = h.querySelector(sel); return Boolean(e) && getComputedStyle(e).visibility === 'visible' && getComputedStyle(e).display !== 'none'; }; const n = h.querySelector('nav').getBoundingClientRect(); return { state: h.getAttribute('data-state'), logo: vis('a[aria-label^="Stringham"]'), cta: vis('a[data-location="header"]'), centred: Math.abs((n.left + n.width / 2) - innerWidth / 2) < 3, fixed: getComputedStyle(h).position }; });
    await pp.goto(BASE + '/', { waitUntil: 'networkidle' }); await pp.waitForTimeout(600);
    const top = await place();
    await pp.evaluate(() => window.scrollTo({ top: innerHeight * 1.4, behavior: 'instant' })); await pp.waitForTimeout(900);
    const past = await place();
    await pp.goto(BASE + '/work', { waitUntil: 'networkidle' });
    const other = await place();
    ok('header: over the hero the pill is alone and centered', top.state === 'hero' && !top.logo && !top.cta && top.centred, JSON.stringify(top));
    ok('header: past the hero, and on other pages, the logo and the one button join it', past.state === 'pinned' && past.logo && past.cta && past.centred && past.fixed === 'fixed' && other.state === 'pinned' && other.logo && other.cta, JSON.stringify({ past, other }));
    await cp.close();
    const cm = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const pm = await cm.newPage();
    await pm.goto(BASE + '/work', { waitUntil: 'networkidle' });
    const phone = await pm.evaluate(() => { const h = document.querySelector('[data-site-header]'); const shown = (e) => Boolean(e) && getComputedStyle(e).display !== 'none'; const labels = [...h.querySelectorAll('.nimbus-label')].map((l) => l.getBoundingClientRect().width); return { logo: shown(h.querySelector('a[aria-label^="Stringham"]')), cta: shown(h.querySelector('a[data-location="header"]')), labels: Math.max(...labels), items: h.querySelectorAll('nav a').length, bar: shown(document.querySelector('nav[aria-label="Quick actions"]')) }; });
    ok('header on a phone: the pill alone, icons only, with the bottom bar for call and demo', !phone.logo && !phone.cta && phone.labels <= 1 && phone.items === 6 && phone.bar, JSON.stringify(phone));
    await cm.close();
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
  for (const width of [320, 375, 390, 414]) {
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

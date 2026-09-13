// Pre-launch sweep of every public page. Crawls the site from / following
// every internal link and asserts, per page: a 200, exactly one h1, a unique
// title and a meta description, an OpenGraph image and icons in <head>, every
// <img> with an alt attribute, the footer's privacy link, no horizontal
// overflow at 375px, and every interactive control at least 44px tall on a
// phone. Also asserts the 404 page renders the site shell, robots.txt keeps
// the portal out, sitemap.xml lists every crawled page and no portal or API
// route, and every external link opens safely.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

const EXCLUDED_PREFIXES = ['/portal', '/api/', '/quote/received', '/start'];
const isInternal = (href) => href && href.startsWith('/') && !href.startsWith('//');
const normalize = (href) => href.split('#')[0].split('?')[0] || '/';

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // ---- crawl ----
  const seen = new Map(); // path -> { status, title, description, h1s, ... }
  const queue = ['/'];
  const externals = new Map(); // href -> [{ page, target, rel }]
  const titles = new Map();

  const desktop = await b.newContext({ viewport: { width: 1280, height: 900 } });

  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    const p = await desktop.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
    const d = await p.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const qa = (s) => [...document.querySelectorAll(s)];
      const meta = (n) => q(`meta[name="${n}"]`)?.getAttribute('content') || q(`meta[property="${n}"]`)?.getAttribute('content') || '';
      return {
        title: document.title,
        description: meta('description'),
        ogImage: meta('og:image'),
        ogTitle: meta('og:title'),
        twitterCard: meta('twitter:card'),
        canonical: q('link[rel="canonical"]')?.getAttribute('href') || '',
        icon: Boolean(q('link[rel="icon"]')),
        appleIcon: Boolean(q('link[rel="apple-touch-icon"]')),
        robots: meta('robots'),
        h1s: qa('h1').map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
        imgsMissingAlt: qa('img').filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src')),
        footerPrivacy: Boolean(q('footer a[href="/privacy"]')),
        // The site footer is the last <footer>; long-form pages have an
        // article footer before it.
        footerYear: [...qa('footer')].pop()?.textContent.match(/©\s*(\d{4})/)?.[1] || '',
        headerLinks: qa('header a').map((a) => a.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean),
        links: qa('a[href]').map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') || '' })),
        hasQuoteLink: qa('a[href^="/quote"]').length > 0,
      };
    });
    seen.set(path, { status: res.status(), errs, ...d });
    for (const l of d.links) {
      if (isInternal(l.href)) {
        const n = normalize(l.href);
        if (!EXCLUDED_PREFIXES.some((x) => n === x || n.startsWith(x)) && !seen.has(n)) queue.push(n);
      } else if (/^https?:/.test(l.href || '')) {
        if (!externals.has(l.href)) externals.set(l.href, []);
        externals.get(l.href).push({ page: path, target: l.target, rel: l.rel });
      }
    }
    await p.close();
  }
  await desktop.close();

  console.log(`crawled ${seen.size} pages: ${[...seen.keys()].join(' ')}\n`);

  // ---- per-page assertions ----
  for (const [path, d] of seen) {
    ok(`${path}: 200`, d.status === 200, String(d.status));
    ok(`${path}: no page errors`, d.errs.length === 0, d.errs.join(' | '));
    ok(`${path}: exactly one h1`, d.h1s.length === 1, JSON.stringify(d.h1s));
    ok(`${path}: has a title`, d.title.length > 10, d.title);
    ok(`${path}: title is unique`, !titles.has(d.title), titles.get(d.title) || '');
    titles.set(d.title, path);
    ok(`${path}: has a meta description`, d.description.length > 50, `${d.description.length} chars`);
    ok(`${path}: OpenGraph image present`, /\/opengraph-image|\.webp|\.png/.test(d.ogImage), d.ogImage);
    ok(`${path}: twitter card set`, d.twitterCard === 'summary_large_image', d.twitterCard);
    ok(`${path}: icon and apple-touch-icon linked`, d.icon && d.appleIcon, JSON.stringify({ icon: d.icon, apple: d.appleIcon }));
    ok(`${path}: every <img> has an alt attribute`, d.imgsMissingAlt.length === 0, d.imgsMissingAlt.join(' '));
    ok(`${path}: footer links to the privacy policy`, d.footerPrivacy);
    ok(`${path}: footer year is current`, d.footerYear === String(new Date().getFullYear()), d.footerYear);
    ok(`${path}: quote reachable from the page`, d.hasQuoteLink);
    if (path !== '/privacy' && path !== '/quote') {
      ok(`${path}: title names the place or the service`, /League City|Houston|Web Design|Website|Kyle Stringham/i.test(d.title), d.title);
    }
  }

  // The header carries the same seven items on every page.
  const EXPECTED_NAV = ['Home', 'About', 'Portfolio', 'Resources', 'Pricing', 'Portal', 'Start a Project'];
  for (const [path, d] of seen) {
    const missing = EXPECTED_NAV.filter((n) => !d.headerLinks.some((t) => t.toLowerCase().includes(n.toLowerCase())));
    ok(`${path}: header has the seven nav items`, missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : '');
  }

  // ---- external links ----
  for (const [href, uses] of externals) {
    const safe = uses.every((u) => u.target !== '_blank' || /noopener/.test(u.rel));
    ok(`external ${href}: opens safely`, safe, JSON.stringify(uses.filter((u) => u.target === '_blank' && !/noopener/.test(u.rel)).map((u) => u.page)));
  }

  // ---- 404 ----
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    const res = await p.goto(BASE + '/definitely-not-a-page', { waitUntil: 'networkidle' });
    const d = await p.evaluate(() => ({
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      header: Boolean(document.querySelector('header a[href="/"]')),
      footer: Boolean(document.querySelector('footer a[href="/privacy"]')),
      quote: Boolean(document.querySelector('main a[href="/quote"]')),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
      styled: getComputedStyle(document.querySelector('main')).backgroundColor,
    }));
    ok('404: returns status 404', res.status() === 404, String(res.status()));
    ok('404: one h1', d.h1.length === 1, JSON.stringify(d.h1));
    ok('404: wears the site header and footer', d.header && d.footer);
    ok('404: offers the quote', d.quote);
    ok('404: noindex', /noindex/.test(d.robots), d.robots);
    ok('404: is styled (has a background)', d.styled !== 'rgba(0, 0, 0, 0)', d.styled);
    await ctx.close();
  }

  // ---- robots + sitemap ----
  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    const robots = await (await p.request.get(BASE + '/robots.txt')).text();
    ok('robots.txt disallows the portal', /Disallow:\s*\/portal/.test(robots));
    ok('robots.txt disallows the API', /Disallow:\s*\/api\//.test(robots));
    ok('robots.txt names the sitemap', /Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/.test(robots));
    const sitemap = await (await p.request.get(BASE + '/sitemap.xml')).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    ok('sitemap.xml excludes the portal and API', locs.every((l) => !l.startsWith('/portal') && !l.startsWith('/api')), locs.filter((l) => l.startsWith('/portal') || l.startsWith('/api')).join(' '));
    const missing = [...seen.keys()].filter((path) => !locs.includes(path));
    ok('sitemap.xml lists every crawled public page', missing.length === 0, missing.join(' '));
    const extra = locs.filter((l) => !seen.has(l));
    ok('sitemap.xml lists nothing that is not reachable', extra.length === 0, extra.join(' '));
    for (const url of ['/icon.png', '/apple-icon.png', '/opengraph-image.png']) {
      const r = await p.request.get(BASE + url);
      ok(`${url} is served`, r.status() === 200 && (r.headers()['content-type'] || '').startsWith('image/'), `${r.status()} ${r.headers()['content-type']}`);
    }
    await ctx.close();
  }

  // ---- phone: overflow and tap targets on every page ----
  {
    const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    for (const path of seen.keys()) {
      const p = await ctx.newPage();
      await p.goto(BASE + path, { waitUntil: 'networkidle' });
      await p.waitForTimeout(600);
      const m = await p.evaluate(() => {
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        // Every visible link and button, measured untransformed.
        // Inline links inside running text are exempt from the 44px target
        // size (WCAG 2.5.8 "inline" exception); an input wrapped in a label
        // is measured by its label, which is the actual control.
        const inline = (el) => el.tagName === 'A' && el.closest('p, li, dd, figcaption, small, blockquote') && getComputedStyle(el).display === 'inline';
        const small = [...document.querySelectorAll('a, button, input, [role="button"]')]
          .filter((el) => {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]') || el.closest('[aria-hidden="true"]')) return false;
            if (el.tagName === 'INPUT' && el.closest('label')) return false;
            if (inline(el)) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          })
          .map((el) => ({ h: Math.round(el.offsetHeight || el.getBoundingClientRect().height), text: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 40) }))
          .filter((x) => x.h < 44);
        // Elements wider than the viewport are the usual overflow culprits.
        const wide = [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed').slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${(el.className && el.className.toString().split(' ')[0]) || ''}`);
        return { overflow, small, wide };
      });
      ok(`${path} @375: no horizontal overflow`, m.overflow === 0, `${m.overflow}px ${m.wide.join(' ')}`);
      ok(`${path} @375: every tap target ≥ 44px`, m.small.length === 0, m.small.map((s) => `${s.h}px "${s.text}"`).join(', '));
      await p.close();
    }

    // The two named risks: the homepage process carousel and the pricing portal card.
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const home = await p.evaluate(() => {
      const el = document.querySelector('[class*="homeSection"]') || document.querySelector('[id*="process"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const inner = [...el.querySelectorAll('*')].filter((c) => c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).overflowX !== 'auto' && getComputedStyle(c).overflowX !== 'scroll' && getComputedStyle(c).overflowX !== 'hidden');
      return { width: Math.round(r.width), clipped: inner.length, right: Math.round(r.right) };
    });
    ok('homepage process section @375: fits the viewport', home !== null && home.right <= 376 && home.width <= 376, JSON.stringify(home));
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    const portal = await p.evaluate(() => {
      const prev = document.querySelector('button[aria-label="Previous screen"]');
      const el = prev ? prev.closest('[class*="portal"]:not(button)') : null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const controls = [...el.querySelectorAll('button')].map((b) => ({ h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width), label: (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 30) }));
      return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), controls };
    });
    ok('pricing portal card @375: fits the viewport', portal !== null && portal.left >= 0 && portal.right <= 376, JSON.stringify(portal && { left: portal.left, right: portal.right, width: portal.width }));
    ok('pricing portal card @375: its controls are tappable', portal !== null && portal.controls.length > 0 && portal.controls.every((c) => c.h >= 44 || c.w >= 44), JSON.stringify(portal && portal.controls));
    await p.screenshot({ path: `${process.cwd()}/prelaunch-pricing-375.png`, fullPage: false });
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.screenshot({ path: `${process.cwd()}/prelaunch-home-375.png`, fullPage: true });
    console.log('saved prelaunch-home-375.png, prelaunch-pricing-375.png');
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nall prelaunch checks passed');
  process.exit(fails ? 1 : 0);
})();

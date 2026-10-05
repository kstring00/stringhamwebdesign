// Crawls the sitemap plus every internal href found on those pages, and
// reports anything that isn't a 200 — unless it's one of the intended
// permanent redirects below, which must land exactly where listed.
//   BASE=http://localhost:3300 node scripts/link-check.js
const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/+$/, '');

// Old routes that must 301 somewhere specific.
const REDIRECTS = {
  '/quote': '/#free-check',
  '/quote/anything': '/#free-check',
  '/pricing': '/#prices',
  '/resources': '/',
  '/resources/some-guide': '/',
  '/work': '/',
  '/work/common-ground': '/',
  '/work/bcba-prep': '/',
  '/work/with-little': '/',
  '/portfolio': '/',
  '/portfolio/anything': '/',
  '/services': '/#prices',
  '/services/anything': '/#prices',
  '/about': '/#about',
  '/contact': '/#free-check',
  '/coffee-shops': '/',
  '/coffee-shops/anything': '/',
  '/autism-clinics': '/family-resource-hub',
  '/autism-clinics/anything': '/family-resource-hub',
  '/faq': '/#questions',
  '/portal': '/',
  '/portal/dashboard': '/',
  '/admin': '/',
  '/login': '/',
};

const hrefsIn = (html) => [...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));

(async () => {
  let fails = 0;
  const bad = (msg) => { fails++; console.log('FAIL ' + msg); };

  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  const pages = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  console.log(`sitemap lists ${pages.length} pages: ${pages.join(' ')}`);

  const seen = new Map(); // path -> first page it was found on
  for (const p of pages) seen.set(p, 'sitemap');
  for (const p of pages) {
    const res = await fetch(BASE + p, { redirect: 'manual' });
    if (res.status !== 200) { bad(`${p} (in sitemap) returned ${res.status}`); continue; }
    for (const h of hrefsIn(await res.text())) {
      if (!h.startsWith('/') || h.startsWith('//')) continue; // external, mailto:, tel:
      const path = h.split('#')[0] || '/';
      if (path.startsWith('/_next/')) continue;
      if (!seen.has(path)) seen.set(path, p);
    }
  }

  let ok = 0;
  for (const [path, from] of seen) {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    if (res.status === 200) { ok++; continue; }
    const want = REDIRECTS[path.split('?')[0]];
    const loc = res.headers.get('location');
    if (want && res.status === 301 && new URL(loc, BASE).pathname + new URL(loc, BASE).hash === want) { ok++; continue; }
    bad(`${path} (linked from ${from}) returned ${res.status}${loc ? ' → ' + loc : ''}`);
  }
  console.log(`${ok}/${seen.size} internal links OK`);

  for (const [from, to] of Object.entries(REDIRECTS)) {
    const res = await fetch(BASE + from, { redirect: 'manual' });
    const loc = res.headers.get('location');
    const got = loc ? new URL(loc, BASE).pathname + new URL(loc, BASE).hash : '';
    if (res.status !== 301 || got !== to) bad(`redirect ${from} → expected ${to}, got ${res.status} ${loc || ''}`);
  }
  console.log(`${Object.keys(REDIRECTS).length} old routes checked for permanent redirects`);

  const nf = await fetch(BASE + '/definitely-not-a-page', { redirect: 'manual' });
  if (nf.status !== 404) bad(`unknown route returned ${nf.status}, expected 404`);

  console.log(fails ? `${fails} problem(s)` : 'all links and redirects OK');
  process.exit(fails ? 1 : 0);
})();

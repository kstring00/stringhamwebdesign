// /privacy: one H1, a unique title and meta description, a last-updated date,
// every section the policy is required to carry, every outbound link resolving,
// the footer link present on every page, the quote form's consent line, no
// overflow at 360px, and no placeholder text.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

// Every page that renders the footer, so the link really is sitewide.
const PAGES = ['/', '/about', '/work', '/pricing', '/resources', '/quote', '/privacy', '/resources/who-owns-what'];

// The headings the brief asked for, matched loosely on the wording used.
const SECTIONS = [
  ['who I am and how to reach me', /who i am/i],
  ['what is collected and why', /what i collect/i],
  ['analytics and session replay', /analytics and session replay/i],
  ['who else handles the data', /who else handles/i],
  ['retention', /how long i keep/i],
  ['your rights', /your rights/i],
  ['children', /children/i],
  ['changes to the page', /changes to this page/i],
];

// Claims the policy has to make, in whatever words it makes them.
const CLAIMS = [
  ['names Microsoft Clarity', /microsoft clarity/i],
  ['says form fields are masked', /mask/i],
  ['says the portal is not recorded', /portal is not recorded/i],
  ['mentions cookies', /cookies/i],
  ['explains opting out', /opting out/i],
  ['names Vercel', /vercel/i],
  ['names Supabase', /supabase/i],
  ['names Resend', /resend/i],
  ['names Stripe', /stripe/i],
  ['says data is not sold', /don.t sell your data/i],
  ['says there are no ads', /don.t run ads/i],
  ['gives the contact address', /kyle@stringhamwebdesign\.com/i],
  ['gives the location', /league city/i],
];

(async () => {
  let hits = '';
  try { hits = execSync('grep -n -i "lorem" content/privacy.md app/privacy/*.ts* || true').toString().trim(); } catch (e) { hits = e.stdout.toString(); }
  ok('no "lorem" in the page or its copy', hits === '', hits);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // ---- the page itself ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const res = await p.goto(BASE + '/privacy', { waitUntil: 'networkidle' });

    ok('/privacy responds 200', res.status() === 200, String(res.status()));
    ok('no page errors', errs.length === 0, errs.join(' | '));

    const d = await p.evaluate(() => ({
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      h2: [...document.querySelectorAll('main h2')].map((h) => h.textContent.trim()),
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      time: document.querySelector('main time')?.getAttribute('datetime') || '',
      timeText: document.querySelector('main time')?.textContent.trim() || '',
      text: document.querySelector('main').innerText.replace(/\s+/g, ' '),
      links: [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')),
      emptyLinks: [...document.querySelectorAll('main a')].filter((a) => !a.textContent.trim()).length,
    }));

    ok('exactly one h1', d.h1.length === 1, JSON.stringify(d.h1));
    ok('the h1 names the page', /privacy policy/i.test(d.h1[0] || ''), d.h1[0]);
    ok('the title is specific to this page', /privacy/i.test(d.title) && d.title.length > 20, d.title);
    ok('a meta description is set', d.description.length > 60, `${d.description.length} chars`);
    ok('a machine-readable last-updated date', /^\d{4}-\d{2}-\d{2}$/.test(d.time), d.time);
    ok('the date is readable to a person too', d.timeText.length > 8, d.timeText);
    ok('no empty link text', d.emptyLinks === 0, String(d.emptyLinks));

    for (const [label, pattern] of SECTIONS) {
      ok(`section: ${label}`, d.h2.some((h) => pattern.test(h)), d.h2.find((h) => pattern.test(h)) || JSON.stringify(d.h2).slice(0, 120));
    }
    for (const [label, pattern] of CLAIMS) {
      ok(`the policy ${label}`, pattern.test(d.text));
    }

    // Microsoft's privacy statement has to be linked, not just named.
    ok(
      "links Microsoft's privacy statement",
      d.links.some((h) => /privacy\.microsoft\.com/.test(h || '')),
      d.links.filter((h) => /microsoft/.test(h || '')).join(' '),
    );
    ok('the contact address is a mailto link', d.links.some((h) => /^mailto:kyle@stringhamwebdesign\.com$/.test(h || '')));

    // Every internal link on the page has to resolve.
    const internal = [...new Set(d.links.filter((h) => h && h.startsWith('/')))];
    for (const href of internal) {
      const r = await p.request.get(BASE + href);
      ok(`internal link ${href} resolves`, r.status() === 200, String(r.status()));
    }
    await ctx.close();
  }

  // ---- the footer link, on every page ----
  for (const path of PAGES) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const link = await p.evaluate(() => {
      const a = document.querySelector('footer a[href="/privacy"]');
      if (!a) return null;
      const r = a.getBoundingClientRect();
      return { text: a.textContent.trim(), height: Math.round(r.height) };
    });
    ok(`${path}: the footer links to the policy`, link !== null && /privacy policy/i.test(link.text), JSON.stringify(link));
    ok(`${path}: that link is a 44px target`, link !== null && link.height >= 44, link ? `${link.height}px` : '');
    await ctx.close();
  }

  // ---- the quote form's consent line ----
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/quote', { waitUntil: 'networkidle' });
    const consent = await p.evaluate(() => {
      const a = [...document.querySelectorAll('a[href="/privacy"]')].find((x) => !x.closest('footer'));
      if (!a) return null;
      return { line: a.parentElement.textContent.replace(/\s+/g, ' ').trim(), text: a.textContent.trim() };
    });
    ok('the brief says what sending it agrees to', consent !== null && /by sending this you agree to the privacy policy/i.test(consent.line), JSON.stringify(consent));
    ok('and links the policy from those words', consent !== null && /privacy policy/i.test(consent.text), consent?.text);

    // Clicking it actually lands on the policy.
    await p.locator('a[href="/privacy"]').first().click();
    await p.waitForURL('**/privacy', { timeout: 15000 });
    ok('clicking it lands on the policy', (await p.evaluate(() => window.location.pathname)) === '/privacy');
    await ctx.close();
  }

  // ---- narrow ----
  for (const width of [360, 768]) {
    const ctx = await b.newContext({ viewport: { width, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/privacy', { waitUntil: 'networkidle' });
    const m = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      footerLink: Boolean(document.querySelector('footer a[href="/privacy"]')),
    }));
    ok(`${width}px: no horizontal overflow`, m.overflow === 0, `${m.overflow}px`);
    ok(`${width}px: the footer link is still there`, m.footerLink);
    if (width === 360) {
      await p.screenshot({ path: `${process.cwd()}/privacy-mobile.png`, fullPage: false });
    }
    await ctx.close();
  }

  // ---- a look at it ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1100 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/privacy', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${process.cwd()}/privacy-desktop.png` });
    console.log('saved privacy-desktop.png, privacy-mobile.png');
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nall privacy checks passed');
  process.exit(fails ? 1 : 0);
})();

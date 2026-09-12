// Carrying a package from /pricing into the brief: each tier's "Get started"
// links to /quote?package=<id> while every generic CTA stays bare; the brief
// opens with that tier selected and a gold note above the field; a bogus or
// missing param opens unselected with "Not sure yet" offered; "change" clears
// both the selection and the URL; the note is server-rendered so it never
// shifts the form; and a real submission of each tier reaches the receipt with
// the right package on it.
const { chromium } = require('playwright');
const OUT = process.cwd();
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

const NOTE = /^Starting from the (Starter|Standard|Premium) package — we.ll confirm scope on the call\.$/;
const CHOICES = ['Starter', 'Standard', 'Premium', 'Not sure yet'];

/** Walk the seven questions and send the brief. Returns the receipt page text. */
async function submitBrief(page, name) {
  const answers = ['name', 'email', 'business', 'businessDoes', 'current', 'goal', 'timeline', 'contact'];
  const values = {
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
    business: `${name} Behavioral`,
    businessDoes: 'In-home ABA therapy for families across the county.',
    current: 'nothing yet',
    goal: 'Families find us and get on the waitlist without calling.',
    timeline: 'Around March',
    contact: 'Email first',
  };
  for (let step = 0; step < 7; step += 1) {
    for (const field of answers) {
      const input = page.locator(`#${field}`);
      if (await input.count()) await input.fill(values[field]);
    }
    const next = page.locator('button:has-text("Next")');
    if (await next.count()) await next.click();
  }
  await page.locator('button:has-text("SEND THE BRIEF")').click();
  await page.waitForURL('**/quote/received', { timeout: 15000 });
  // The URL changes before the server component's payload has painted, so
  // wait for the receipt itself rather than reading a half-rendered page.
  await page.waitForLoadState('networkidle');
  await page.locator('main h1').waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // ---- the links on /pricing ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1200 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle' });

    const links = await p.evaluate(() => {
      const href = (a) => a.getAttribute('href');
      const cards = [...document.querySelectorAll('article')];
      return {
        tiers: cards
          .map((card) => {
            const a = [...card.querySelectorAll('a')].find((x) => /get started/i.test(x.textContent));
            const name = card.querySelector('h3, h2')?.textContent.trim();
            return a ? { name, href: href(a) } : null;
          })
          .filter(Boolean),
        generic: [...document.querySelectorAll('a')]
          .filter((a) => /start a project/i.test(a.textContent))
          .map(href),
      };
    });

    ok('three tiers each carry their package', links.tiers.length === 3, JSON.stringify(links.tiers.map((t) => t.href)));
    for (const id of ['starter', 'standard', 'premium']) {
      ok(`a "Get started" links to ?package=${id}`, links.tiers.some((t) => t.href === `/quote?package=${id}`));
    }
    ok('every generic "Start a project" stays bare', links.generic.length > 0 && links.generic.every((h) => h === '/quote'), JSON.stringify(links.generic));
    await ctx.close();
  }

  // ---- arriving with each tier, and with nothing ----
  for (const [param, expected] of [
    ['?package=starter', 'Starter'],
    ['?package=standard', 'Standard'],
    ['?package=premium', 'Premium'],
    ['', null],
    ['?package=foo', null],
    ['?package=<script>alert(1)</script>', null],
    ['?package=starter&package=premium', 'Starter'],
  ]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));

    // The note must be in the first paint, not added to it. Measured as real
    // layout shift rather than by comparing rects: the hero entrance tween
    // scales [data-hero="media"], so bounding rects lie while it runs.
    await p.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await p.goto(BASE + '/quote' + param, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2000);
    const cls = await p.evaluate(() => window.__cls);

    const state = await p.evaluate(() => {
      const row = document.querySelector('[class*="packageRow"]');
      const note = row.querySelector('[class*="packageNote"]');
      const help = row.querySelector('[class*="packageHelp"]');
      const checked = [...row.querySelectorAll('input[type=radio]')].filter((i) => i.checked);
      return {
        note: note ? note.textContent.replace(/\s+/g, ' ').replace(/\s*change$/, '').trim() : null,
        help: help ? help.textContent.replace(/\s+/g, ' ').trim() : null,
        checked: checked.map((i) => i.value),
        labels: [...row.querySelectorAll('label')].map((l) => l.textContent.trim()),
        hasChange: Boolean(row.querySelector('button')),
        rowHeight: row.offsetHeight,
      };
    });

    const label = param || '(no param)';
    ok(`${label}: page renders, no errors`, errs.length === 0, errs.join(' | '));
    ok(`${label}: all four choices offered`, JSON.stringify(state.labels) === JSON.stringify(CHOICES), JSON.stringify(state.labels));

    if (expected) {
      ok(`${label}: ${expected} is pre-selected`, state.checked.length === 1 && state.checked[0] === expected.toLowerCase(), JSON.stringify(state.checked));
      ok(`${label}: the note names it`, NOTE.test(state.note || '') && state.note.includes(expected), state.note);
      ok(`${label}: a "change" link is offered`, state.hasChange);
    } else {
      ok(`${label}: nothing is pre-selected`, state.checked.length === 0, JSON.stringify(state.checked));
      ok(`${label}: no note, help text instead`, state.note === null && Boolean(state.help), state.help);
    }

    ok(`${label}: no layout shift as the page settles`, cls < 0.01, `CLS ${cls.toFixed(4)}`);
    await ctx.close();
  }

  // ---- the note and the help occupy the same box ----
  for (const width of [1440, 768, 360]) {
    const heights = [];
    for (const param of ['?package=premium', '']) {
      const ctx = await b.newContext({ viewport: { width, height: 900 } });
      const p = await ctx.newPage();
      await p.goto(BASE + '/quote' + param, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1500); // let the hero entrance tween settle
      heights.push(await p.evaluate(() => document.querySelector('[class*="packageRow"]').offsetHeight));
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(`${width}px${param ? ' with a package' : ''}: no overflow`, overflow === 0, `${overflow}px`);
      await ctx.close();
    }
    ok(`${width}px: the note and the help are the same height`, heights[0] === heights[1], heights.join(' vs '));
  }

  // ---- "change" clears the selection and the URL ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/quote?package=standard', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500); // the hero entrance tween scales the panel
    const rowBefore = await p.evaluate(() => document.querySelector('[class*="packageRow"]').offsetHeight);
    const formBefore = await p.evaluate(() => document.querySelector('form').offsetTop);

    await p.locator('[class*="packageRow"] button').click();

    const cleared = await p.evaluate(() => {
      const row = document.querySelector('[class*="packageRow"]');
      return {
        checked: [...row.querySelectorAll('input[type=radio]')].filter((i) => i.checked).length,
        note: Boolean(row.querySelector('[class*="packageNote"]')),
        help: Boolean(row.querySelector('[class*="packageHelp"]')),
        url: window.location.search,
        rowHeight: row.offsetHeight,
        formTop: document.querySelector('form').offsetTop,
      };
    });

    ok('change: the selection is cleared', cleared.checked === 0);
    ok('change: the note gives way to the help line', !cleared.note && cleared.help);
    ok('change: ?package= is dropped from the URL', cleared.url === '', cleared.url);
    ok('change: nothing below it moves', cleared.rowHeight === rowBefore && cleared.formTop === formBefore, `${rowBefore}/${formBefore} → ${cleared.rowHeight}/${cleared.formTop}`);

    // Picking a tier by hand puts the note back, naming the one just picked.
    await p.locator('label:has-text("Premium")').click();
    const picked = await p.evaluate(() => document.querySelector('[class*="packageNote"]')?.textContent.replace(/\s+/g, ' ').replace(/\s*change$/, '').trim());
    ok('picking a tier by hand shows the note for that tier', /Premium/.test(picked || ''), picked);

    // "Not sure yet" is a choice, and it reads as no package rather than a tier.
    await p.locator('label:has-text("Not sure yet")').click();
    const unsure = await p.evaluate(() => ({
      note: Boolean(document.querySelector('[class*="packageNote"]')),
      checked: [...document.querySelectorAll('[class*="packageRow"] input')].filter((i) => i.checked).map((i) => i.value),
    }));
    ok('"Not sure yet" selects, and shows no tier note', unsure.checked.length === 1 && !unsure.note, JSON.stringify(unsure.checked));
    await ctx.close();
  }

  // ---- a real submission for each tier ----
  for (const [param, expected] of [
    ['?package=starter', 'Starter'],
    ['?package=standard', 'Standard'],
    ['?package=premium', 'Premium'],
    ['', 'Not specified'],
  ]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
    const p = await ctx.newPage();
    const posted = [];
    p.on('request', (r) => { if (r.url().endsWith('/api/quote') && r.method() === 'POST') posted.push(JSON.parse(r.postData() || '{}')); });
    const statuses = [];
    p.on('response', (r) => { if (r.url().endsWith('/api/quote')) statuses.push(r.status()); });

    await p.goto(BASE + '/quote' + param, { waitUntil: 'networkidle' });
    const receipt = await submitBrief(p, 'Jordan');

    const label = param || '(no param)';
    ok(`${label}: the brief posts and is accepted`, statuses[0] === 200, String(statuses[0]));
    ok(`${label}: the package rides along in the payload`, posted.length === 1 && typeof posted[0].package === 'string', JSON.stringify(posted[0]?.package));
    ok(`${label}: the receipt records "${expected}"`, new RegExp(`Package selected\\s+${expected}`, 'i').test(receipt), receipt.match(/PACKAGE SELECTED [A-Za-z ]*/i)?.[0]);
    ok(`${label}: the receipt still carries a reference`, /BUILD-\d{4}/.test(receipt));
    await ctx.close();
  }

  // ---- /start forwards its query ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/start?package=premium', { waitUntil: 'networkidle' });
    const landed = await p.evaluate(() => ({
      path: window.location.pathname + window.location.search,
      checked: [...document.querySelectorAll('[class*="packageRow"] input')].filter((i) => i.checked).map((i) => i.value),
    }));
    ok('/start?package=premium lands on the brief with Premium chosen', landed.path === '/quote?package=premium' && landed.checked[0] === 'premium', JSON.stringify(landed));

    await p.goto(BASE + '/start', { waitUntil: 'networkidle' });
    const bare = await p.evaluate(() => window.location.pathname + window.location.search);
    ok('/start with no query still lands on the brief', bare === '/quote', bare);
    await ctx.close();
  }

  // ---- a look at it ----
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1100 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/quote?package=standard', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/quote-package.png` });
    console.log('saved quote-package.png');
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nall quote package checks passed');
  process.exit(fails ? 1 : 0);
})();

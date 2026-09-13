// Microsoft Clarity: loaded on the public site, never on the client portal,
// never without NEXT_PUBLIC_CLARITY_ID, and never before the window has
// loaded. Run it against a production build (`npm run start`) — the component
// does nothing in development by design.
//
//   Expecting the tag (built with the id set):
//     BASE=http://localhost:3300 CLARITY_ID=xxxxxxxxxx NODE_PATH=./node_modules \
//       node scripts/clarity-check.js
//   Expecting no tag at all (built without it):
//     BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/clarity-check.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const ID = process.env.CLARITY_ID || '';
let fails = 0;
const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };

const PUBLIC_PAGES = ['/', '/about', '/work', '/resources', '/quote'];
const PORTAL_PAGES = ['/portal'];

/** Every request the page made to Clarity, and when the tag tag appeared. */
async function visit(browser, path) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const clarityRequests = [];
  p.on('request', (r) => {
    if (/clarity\.ms/.test(r.url())) clarityRequests.push(r.url());
  });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));

  // The tag must not be requested before load. Record the state at the moment
  // the load event fires, then give it time to boot afterwards.
  await p.goto(BASE + path, { waitUntil: 'load' });
  const atLoad = clarityRequests.length;
  await p.waitForTimeout(2500);

  const tagInDom = await p.evaluate(() => Boolean(document.getElementById('clarity-script')));
  await ctx.close();
  return { requests: clarityRequests, atLoad, tagInDom, errs };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  console.log(ID ? `expecting the tag, project id ${ID}` : 'expecting no tag (no id in the build)');

  for (const path of PUBLIC_PAGES) {
    const r = await visit(b, path);
    ok(`${path}: no page errors`, r.errs.length === 0, r.errs.join(' | '));

    if (ID) {
      ok(`${path}: the tag is requested`, r.requests.length > 0, r.requests[0] || 'none');
      ok(`${path}: it is this project's tag`, r.requests.every((u) => u.includes(ID)), r.requests[0] || '');
      ok(`${path}: the script element is in the DOM`, r.tagInDom);
      ok(`${path}: nothing was requested before load`, r.atLoad === 0, `${r.atLoad} before load`);
    } else {
      ok(`${path}: nothing is requested from clarity.ms`, r.requests.length === 0, r.requests.join(' '));
      ok(`${path}: no tag in the DOM`, !r.tagInDom);
    }
  }

  // The portal is excluded outright, tag id or not.
  for (const path of PORTAL_PAGES) {
    const r = await visit(b, path);
    ok(`${path}: no page errors`, r.errs.length === 0, r.errs.join(' | '));
    ok(`${path}: nothing is requested from clarity.ms`, r.requests.length === 0, r.requests.join(' '));
    ok(`${path}: no tag in the DOM`, !r.tagInDom);
  }

  // Entering the portal must not carry a running tag in with it. The header's
  // portal link is a plain anchor, so this is a full page load and the tag is
  // never injected on the portal side.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const link = p.locator('a[href="/portal"]:visible').first();
    ok('the header links to the portal', (await link.count()) > 0);
    const navigations = [];
    p.on('framenavigated', (f) => { if (f === p.mainFrame()) navigations.push(f.url()); });
    await link.click();
    await p.waitForURL('**/portal', { timeout: 15000 });
    await p.waitForTimeout(2000);
    const state = await p.evaluate(() => ({
      tag: Boolean(document.getElementById('clarity-script')),
      path: window.location.pathname,
    }));
    ok('reaching the portal leaves no tag behind', state.tag === false, JSON.stringify(state));
    await ctx.close();
  }

  // The quote form's inputs must be the kind Clarity masks by default: real
  // <input>/<textarea> elements, not contenteditable surfaces it treats as
  // text. Masking itself happens inside Microsoft's tag; this asserts the
  // page gives it nothing unusual to reason about.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/quote', { waitUntil: 'load' });
    await p.waitForTimeout(1200);
    const fields = await p.evaluate(() => {
      const inputs = [...document.querySelectorAll('form input, form textarea')];
      return {
        count: inputs.length,
        tags: [...new Set(inputs.map((i) => i.tagName))],
        contentEditable: document.querySelectorAll('[contenteditable]').length,
        unmaskAttrs: document.querySelectorAll('[data-clarity-unmask]').length,
        maskOverrides: document.querySelectorAll('[data-clarity-mask="false"]').length,
      };
    });
    ok('the brief uses real form controls', fields.count > 0 && fields.tags.every((t) => t === 'INPUT' || t === 'TEXTAREA'), JSON.stringify(fields.tags));
    ok('no contenteditable surfaces holding answers', fields.contentEditable === 0, String(fields.contentEditable));
    ok('nothing opts a field out of masking', fields.unmaskAttrs === 0 && fields.maskOverrides === 0, JSON.stringify(fields));
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nall clarity checks passed');
  process.exit(fails ? 1 : 0);
})();

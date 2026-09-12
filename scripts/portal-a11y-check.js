const { chromium } = require('playwright');
let fails = 0;
const ok = (l,c,x='') => { if(!c) fails++; console.log(`${c?'ok  ':'FAIL'} ${l}${x?'  '+x:''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport:{width:1440,height:1000} });
  await ctx.addCookies([{name:'swd_portal_access',value:'a',domain:'localhost',path:'/'},
                        {name:'swd_portal_refresh',value:'r',domain:'localhost',path:'/'}]);
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/portal/projects', { waitUntil:'networkidle' });
  await p.waitForTimeout(2500);

  // Reach the tabs by keyboard alone and activate one.
  let hops = 0, reached = false;
  for (; hops < 30; hops++) {
    await p.keyboard.press('Tab');
    const t = await p.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
    if (t.startsWith('Onboarding')) { reached = true; break; }
  }
  ok('tab bar reachable by keyboard', reached, `${hops} hops`);

  const ring = await p.evaluate(() => { const c = getComputedStyle(document.activeElement);
    return { w: c.outlineWidth, color: c.outlineColor }; });
  ok('visible focus ring on tab', parseFloat(ring.w) >= 2, JSON.stringify(ring));

  await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  ok('Enter activates tab', p.url().endsWith('/onboarding'), p.url());
  ok('aria-current set', await p.locator('[aria-current="page"]').count() === 1);

  // Onboarding controls operable by keyboard.
  const ta = p.locator('[class*="onboardingItem"]:has-text("Logo files")');
  ok('file item uses a real label+input', await ta.locator('input[type=file]').count() === 1);
  const lbl = await ta.locator('label').getAttribute('for');
  const inputId = await ta.locator('input[type=file]').getAttribute('id');
  ok('label points at its input', !!lbl && lbl === inputId, `${lbl} / ${inputId}`);

  // Progressbar semantics
  const pb = p.locator('[role="progressbar"]').first();
  ok('progressbar has accessible value', !!(await pb.getAttribute('aria-valuetext')),
     await pb.getAttribute('aria-valuetext'));

  // No horizontal overflow on phone
  const m = await b.newPage({ viewport:{width:375,height:800} });
  await m.context().addCookies([{name:'swd_portal_access',value:'a',domain:'localhost',path:'/'},
                                {name:'swd_portal_refresh',value:'r',domain:'localhost',path:'/'}]);
  await m.goto('http://localhost:3000/portal/projects/onboarding', { waitUntil:'networkidle' });
  await m.waitForTimeout(2200);
  ok('no horizontal overflow @375', await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const heights = await m.evaluate(() => [...document.querySelectorAll('[class*="onboardingActions"] button, [class*="onboardingUpload"], nav[aria-label="Project sections"] button')]
    .map(e => Math.round(e.getBoundingClientRect().height)));
  ok('touch targets >= 40px', heights.every(h => h >= 40), JSON.stringify(heights));

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nkeyboard + mobile checks passed');
  process.exit(fails?1:0);
})();

const { chromium } = require('playwright');
let fails = 0;
const ok = (l, c, x='') => { if(!c) fails++; console.log(`${c?'ok  ':'FAIL'} ${l}${x?'  '+x:''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  // Skip the magic-link dance; the session cookies are what the app reads.
  await ctx.addCookies([
    { name: 'swd_portal_access',  value: 'stub-access',  domain: 'localhost', path: '/' },
    { name: 'swd_portal_refresh', value: 'stub-refresh', domain: 'localhost', path: '/' },
  ]);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));

  await fetch('http://localhost:4200/__reset');
  await p.goto('http://localhost:3000/portal/projects', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);

  // --- tabs ---
  const tabs = p.locator('nav[aria-label="Project sections"] button');
  ok('five tabs', await tabs.count() === 5, (await tabs.allInnerTexts()).join(' | ').replace(/\n/g,''));
  // 2 pending + 1 needs_changes on this project = 3 waiting on the client.
  ok('onboarding badge counts open items', (await tabs.nth(1).innerText()).includes('3'),
     JSON.stringify(await tabs.nth(1).innerText()));

  // --- overview: activity feed ---
  ok('activity feed present', await p.locator('#activity-title').isVisible());
  const acts = await p.locator('[class*="activityList"] li strong').allInnerTexts();
  ok('activity derived from real rows', acts.length > 0, `${acts.length} entries: ${acts.slice(0,3).join(' / ')}`);

  // --- onboarding tab ---
  await tabs.nth(1).click(); await p.waitForTimeout(700);
  ok('url reflects tab', p.url().endsWith('/portal/projects/onboarding'), p.url());
  const groups = await p.locator('[class*="onboardingGroup"]').allInnerTexts();
  ok('grouped yours vs mine', groups.length === 2, groups.join(' | ').split('\n').join(' '));
  ok('change request shown to client',
     (await p.locator('[class*="onboardingNote"]').innerText()).includes('404s'));
  ok('accepted item is NOT editable',
     await p.locator('[class*="onboardingItem"]:has-text("Homepage copy") button').count() === 0);

  // --- submit a text item ---
  const brand = p.locator('[class*="onboardingItem"]:has-text("Brand colors")');
  await brand.locator('textarea').fill('Navy #0d1b26 and gold #c9a227');
  await brand.locator('button:has-text("Send to Kyle")').click();
  await p.waitForTimeout(1200);
  const after = await (await fetch('http://localhost:4200/__items')).json();
  const saved = after.find(i => i.name === 'Brand colors');
  ok('text item submitted', saved.status === 'submitted' && saved.value.includes('Navy'), JSON.stringify(saved.value));
  ok('submitted_at stamped server-side', !!saved.submitted_at);

  // --- confirm item ---
  await p.waitForTimeout(400);
  const dom = p.locator('[class*="onboardingItem"]:has-text("Domain access")');
  ok('submitted item can be pulled back',
     await dom.locator('button:has-text("Change my answer")').count() === 1);

  // --- progress reflects reality ---
  const pct = await p.locator('[class*="onboardingProgress"] strong').innerText();
  ok('progress percent shown', /%$/.test(pct), pct);

  // --- timesheet tab ---
  await tabs.nth(2).click(); await p.waitForTimeout(700);
  ok('monthly grouping', (await p.locator('[class*="timesheetMonth"] h3').allInnerTexts()).length >= 2,
     (await p.locator('[class*="timesheetMonth"] h3').allInnerTexts()).join(' | '));
  const total = await p.locator('#timesheet-title ~ *, [class*="panelHeading"] span').first().innerText().catch(()=> '');
  ok('10-hour marker rendered', await p.locator('[class*="checkinMark"]').count() > 0,
     (await p.locator('[class*="checkinMark"]').allInnerTexts()).join(' | '));
  ok('check-in meter present', await p.locator('[class*="checkinBar"]').isVisible());

  console.log('page errors:', errs.length ? errs : 'none');
  if (errs.length) fails++;
  await p.screenshot({ path: '/home/user/stringhamwebdesign/portal-onboarding.png', fullPage: false });
  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall portal checks passed');
  process.exit(fails ? 1 : 0);
})();

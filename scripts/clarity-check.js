// Microsoft Clarity loads only in production with NEXT_PUBLIC_CLARITY_ID set,
// and only after the load event. Run against a production build.
//   BASE=http://localhost:3300 [CLARITY_ID=xxxx] NODE_PATH=./node_modules node scripts/clarity-check.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000'; const ID = process.env.CLARITY_ID || '';
let fails = 0; const ok = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'ok  ' : 'FAIL'} ${l}${x ? '  ' + x : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const path of ['/', '/contact', '/family-resource-hub']) {
    const ctx = await b.newContext(); const p = await ctx.newPage(); const reqs = [];
    p.on('request', (r) => { if (/clarity\.ms/.test(r.url())) reqs.push(r.url()); });
    await p.goto(BASE + path, { waitUntil: 'load' }); const atLoad = reqs.length; await p.waitForTimeout(2500);
    if (ID) { ok(`${path}: tag requested after load with this id`, reqs.length > 0 && atLoad === 0 && reqs.every((u) => u.includes(ID)), reqs[0] || 'none'); }
    else ok(`${path}: nothing requested from clarity.ms without an id`, reqs.length === 0, reqs.join(' '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? `\n${fails} failed` : '\nall clarity checks passed'); process.exit(fails ? 1 : 0);
})();

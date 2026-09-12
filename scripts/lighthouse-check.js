// Lighthouse against a PRODUCTION build (`npm run build && npm start`), never
// the dev server — dev bundles are unminified and would fail every budget.
// Runs the default mobile profile (throttled) and the desktop preset, prints
// all four category scores, and asserts performance >= 88 on both.
//
//   CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node scripts/lighthouse-check.js /about
const { execFileSync } = require('child_process');
const path = process.argv[2] || '/about';
const url = (process.env.BASE || 'http://localhost:3000') + path;
const bin = require.resolve('lighthouse/cli/index.js');
let fails = 0;
for (const [label, extra] of [['mobile', []], ['desktop', ['--preset=desktop']]]) {
  const out = execFileSync(process.execPath, [bin, url, '--output=json', '--quiet', '--chrome-flags=--headless=new --no-sandbox --disable-gpu', ...extra], { env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }, maxBuffer: 64 * 1024 * 1024 }).toString();
  const r = JSON.parse(out);
  const c = r.categories;
  const s = k => Math.round(c[k].score * 100);
  const a = r.audits;
  console.log(`\n${label} ${path}: performance ${s('performance')} · accessibility ${s('accessibility')} · best practices ${s('best-practices')} · seo ${s('seo')}`);
  console.log(`  LCP ${a['largest-contentful-paint'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue} · speed index ${a['speed-index'].displayValue}`);
  const pass = s('performance') >= 88;
  if (!pass) fails++;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${label} performance ≥ 88`);
  if (!pass) {
    const opp = Object.values(a).filter(x => x.details && x.details.type === 'opportunity' && x.score !== null && x.score < 0.9).sort((x, y) => (y.numericValue || 0) - (x.numericValue || 0)).slice(0, 5);
    for (const o of opp) console.log(`  opportunity: ${o.title} — ${o.displayValue || ''}`);
  }
}
console.log(fails ? `\n${fails} FAILURE(S)` : '\nlighthouse budgets met');
process.exit(fails ? 1 : 0);

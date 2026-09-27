// Lighthouse against a PRODUCTION build. Mobile (throttled) and desktop.
// Asserts mobile performance >= 80 and accessibility >= 95 on the given path.
//   BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/lighthouse-check.js /
const { execFileSync } = require('child_process');
const path = process.argv[2] || '/';
const url = (process.env.BASE || 'http://localhost:3000') + path;
const bin = require.resolve('lighthouse/cli/index.js');
let fails = 0;
for (const [label, extra] of [['mobile', []], ['desktop', ['--preset=desktop']]]) {
  const out = execFileSync(process.execPath, [bin, url, '--output=json', '--quiet', '--chrome-flags=--headless=new --no-sandbox --disable-gpu', ...extra], { env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }, maxBuffer: 64 * 1024 * 1024 }).toString();
  const r = JSON.parse(out); const c = r.categories; const s = (k) => Math.round(c[k].score * 100); const a = r.audits;
  console.log(`${label} ${path}: performance ${s('performance')} · accessibility ${s('accessibility')} · best practices ${s('best-practices')} · seo ${s('seo')}`);
  console.log(`  LCP ${a['largest-contentful-paint'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue}`);
  if (label === 'mobile') {
    const perfOk = s('performance') >= 80, a11yOk = s('accessibility') >= 95;
    if (!perfOk || !a11yOk) fails++;
    console.log(`${perfOk ? 'ok  ' : 'FAIL'} mobile performance ≥ 80`); console.log(`${a11yOk ? 'ok  ' : 'FAIL'} mobile accessibility ≥ 95`);
    if (!perfOk) for (const o of Object.values(a).filter((x) => x.details && x.details.type === 'opportunity' && x.score !== null && x.score < 0.9).sort((x, y) => (y.numericValue || 0) - (x.numericValue || 0)).slice(0, 5)) console.log(`  opportunity: ${o.title} — ${o.displayValue || ''}`);
    if (!a11yOk) for (const o of Object.values(a).filter((x) => x.score !== null && x.score < 1 && x.details && x.details.items && x.details.items.length && c.accessibility.auditRefs.some((ref) => ref.id === x.id))) console.log(`  a11y: ${o.id} — ${o.title}`);
  }
}
process.exit(fails ? 1 : 0);

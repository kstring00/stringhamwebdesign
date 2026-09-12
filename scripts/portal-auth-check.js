// Can a caller tell a real client address from an unknown one?
//
// Run against the stub, never a real Supabase project:
//   node scripts/portal-auth-stub.js &
//   SUPABASE_URL=http://localhost:4100 SUPABASE_SECRET_KEY=stub \
//   PORTAL_ADMIN_EMAIL=admin@known.test PORTAL_URL=http://localhost:3000/portal \
//   npm run start &
//   node scripts/portal-auth-check.js
let fails = 0;
const ok = (l, c, x='') => { if(!c) fails++; console.log(`${c?'ok  ':'FAIL'} ${l}${x?'  '+x:''}`); };

const post = async (email) => {
  const t0 = process.hrtime.bigint();
  const r = await fetch('http://localhost:3000/api/portal/auth/request-link', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email }),
  });
  const body = await r.text();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { status: r.status, body, ms };
};

const median = a => { const s=[...a].sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };

(async () => {
  await fetch('http://localhost:4100/__reset');
  await post('warmup@known.test');            // warm the route
  await new Promise(r => setTimeout(r, 600));

  const known = [], unknown = [];
  for (let i = 0; i < 12; i++) {
    known.push(await post('client@known.test'));
    unknown.push(await post(`nobody${i}@nowhere.test`));
  }

  const k = known[0], u = unknown[0];
  ok('same status code',      k.status === u.status && k.status === 200, `${k.status} vs ${u.status}`);
  ok('byte-identical body',   k.body === u.body, `${JSON.stringify(k.body)} vs ${JSON.stringify(u.body)}`);

  const km = median(known.map(x=>x.ms)), um = median(unknown.map(x=>x.ms));
  const delta = Math.abs(km - um);
  // The stub delays the send by 300ms. If the response waited on it, the gap
  // would be ~300ms; anything under 50ms means the response is not waiting.
  ok('no timing oracle', delta < 50,
     `known ${km.toFixed(1)}ms vs unknown ${um.toFixed(1)}ms (delta ${delta.toFixed(1)}ms, stub send costs 300ms)`);

  await new Promise(r => setTimeout(r, 1200));
  const sends = await (await fetch('http://localhost:4100/__sends')).json();
  ok('mail sent for the known address', sends.includes('client@known.test'));
  ok('no mail for any unknown address', !sends.some(e => e.includes('nowhere.test')), JSON.stringify(sends));

  const bad = await post('not-an-email');
  ok('malformed input still rejected', bad.status === 400);

  console.log(fails ? `\n${fails} FAILURE(S)` : '\nno enumeration oracle found');
  process.exit(fails ? 1 : 0);
})();

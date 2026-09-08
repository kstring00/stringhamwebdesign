const { createHmac } = require('node:crypto');
const SECRET = 'whsec_testsecret';
let fails = 0;
const ok = (label, cond, extra='') => { if(!cond) fails++;
  console.log(`${cond?'ok  ':'FAIL'} ${label}${extra?'  '+extra:''}`); };

const sign = (payload, ts = Math.floor(Date.now()/1000)) =>
  `t=${ts},v1=${createHmac('sha256', SECRET).update(`${ts}.${payload}`,'utf8').digest('hex')}`;

const post = async (payload, sig) => {
  const r = await fetch('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sig ? {'stripe-signature': sig} : {}) },
    body: payload,
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
const stub = async (p) => (await fetch('http://localhost:4000/rest/v1/' + p)).json();

const evt = (id, type, object) => JSON.stringify({ id, type, data: { object } });

(async () => {
  await stub('__reset');

  // --- signature verification ---
  let p = evt('evt_1','invoice.paid',{id:'in_final_1'});
  ok('missing signature rejected', (await post(p)).status === 400);
  ok('bad signature rejected', (await post(p, 't=1,v1=deadbeef')).status === 400);
  ok('tampered payload rejected',
     (await post(evt('evt_x','invoice.paid',{id:'in_final_1'}), sign(p))).status === 400);
  const old = Math.floor(Date.now()/1000) - 600;
  ok('stale timestamp rejected (replay)', (await post(p, sign(p, old))).status === 400);

  // --- final invoice paid: state change + handoff gate ---
  let r = await post(p, sign(p));
  ok('valid signature accepted', r.status === 200 && r.body.handled === true, JSON.stringify(r.body));

  let s = await stub('__state');
  const invPatch = s.patches.find(x => x.table === 'invoices');
  const projPatch = s.patches.find(x => x.table === 'projects');
  ok('invoice marked paid', invPatch?.patch.status === 'paid' && !!invPatch?.patch.paid_at);
  ok('final payment opens handoff gate', !!projPatch?.patch.final_payment_cleared_at,
     JSON.stringify(projPatch?.patch));
  ok('event recorded as handled', s.events[0]?.status === 'handled', s.events[0]?.detail);

  // --- idempotency: same event id again ---
  const before = (await stub('__state')).patches.length;
  r = await post(p, sign(p));
  const after = (await stub('__state')).patches.length;
  ok('duplicate returns 200', r.status === 200 && r.body.duplicate === true, JSON.stringify(r.body));
  ok('duplicate applies NO state change', before === after, `${before} -> ${after}`);

  // --- deposit paid moves project to build ---
  await stub('__reset');
  p = evt('evt_2','invoice.paid',{id:'in_dep_1'});
  await post(p, sign(p));
  s = await stub('__state');
  const dep = s.patches.find(x => x.table === 'projects');
  ok('deposit moves project to build', dep?.patch.status === 'build', JSON.stringify(dep?.patch));
  ok('deposit does NOT open handoff gate', !dep?.patch.final_payment_cleared_at);

  // --- failed payment ---
  await stub('__reset');
  p = evt('evt_3','invoice.payment_failed',{id:'in_final_1'});
  await post(p, sign(p));
  s = await stub('__state');
  ok('failed payment marks past_due',
     s.patches.find(x=>x.table==='invoices')?.patch.status === 'past_due');
  ok('failed payment does NOT open gate', !s.patches.find(x=>x.table==='projects'));

  // --- subscription cancel ---
  await stub('__reset');
  p = evt('evt_4','customer.subscription.deleted',{id:'sub_known',status:'canceled'});
  r = await post(p, sign(p));
  s = await stub('__state');
  const care = s.patches.find(x => x.table === 'care_plans');
  ok('subscription cancel accepted', r.status === 200 && r.body.handled === true, JSON.stringify(r.body));
  ok('care plan set cancelled', care?.patch.status === 'cancelled' && !!care?.patch.cancelled_at,
     JSON.stringify(care?.patch));

  await stub('__reset');
  p = evt('evt_4b','customer.subscription.updated',{id:'sub_known',status:'past_due'});
  await post(p, sign(p));
  s = await stub('__state');
  ok('past_due maps to past_due',
     s.patches.find(x=>x.table==='care_plans')?.patch.status === 'past_due');

  await stub('__reset');
  p = evt('evt_4c','customer.subscription.updated',{id:'sub_unknown',status:'active'});
  r = await post(p, sign(p));
  s = await stub('__state');
  ok('unknown subscription does not fail delivery', r.status === 200, JSON.stringify(r.body));
  ok('unknown subscription recorded with detail', s.events[0]?.status === 'handled', s.events[0]?.detail);

  // --- unhandled type is recorded, not silently dropped ---
  await stub('__reset');
  p = evt('evt_5','payment_intent.created',{id:'pi_1'});
  r = await post(p, sign(p));
  s = await stub('__state');
  ok('unhandled type returns handled:false', r.body.handled === false);
  ok('unhandled type still recorded as ignored', s.events[0]?.status === 'ignored');
  ok('unhandled type applies no state change', s.patches.length === 0);

  // --- datastore outage must NOT be reported as a settled duplicate ---
  // A 200 here would tell Stripe the event is handled and stop redelivery,
  // losing the payment permanently. It has to be a non-2xx so Stripe retries.
  await stub('__reset');
  await stub('__down');
  p = evt('evt_6','invoice.paid',{id:'in_final_1'});
  r = await post(p, sign(p));
  ok('datastore outage returns 500, not 200', r.status === 500, JSON.stringify(r.body));
  ok('datastore outage is not labelled a duplicate', r.body.duplicate === undefined,
     JSON.stringify(r.body));

  // Same for a type we ignore: nothing was recorded, so it must be retried.
  p = evt('evt_7','payment_intent.created',{id:'pi_2'});
  r = await post(p, sign(p));
  ok('outage on unhandled type also returns 500', r.status === 500, JSON.stringify(r.body));

  // Recovery: once the datastore is back, the retry lands and applies state.
  await stub('__down?off');
  p = evt('evt_6','invoice.paid',{id:'in_final_1'});
  r = await post(p, sign(p));
  s = await stub('__state');
  ok('retry after recovery is applied', r.status === 200 && r.body.handled === true,
     JSON.stringify(r.body));
  ok('retry after recovery opens handoff gate',
     !!s.patches.find(x => x.table === 'projects')?.patch.final_payment_cleared_at);

  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall webhook checks passed');
  process.exit(fails ? 1 : 0);
})();

// Stands in for Supabase PostgREST so the webhook's idempotency and state
// changes can be exercised for real, with no network and no live keys.
const http = require('http');

const state = { events: new Map(), patches: [], invoices: new Map() };
// One known invoice row: a FINAL invoice, so the handoff gate should open.
state.invoices.set('in_final_1', { id: 'row-final', project_id: 'proj-1', kind: 'final' });
state.invoices.set('in_dep_1',   { id: 'row-dep',   project_id: 'proj-1', kind: 'deposit' });

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => (body += c));
  req.on('end', () => {
    const [path, query = ''] = req.url.replace('/rest/v1/', '').split('?');
    const send = (code, payload) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(payload === undefined ? '' : JSON.stringify(payload));
    };

    if (path === 'stripe_events') {
      if (req.method === 'POST') {
        const { event_id, type } = JSON.parse(body);
        if (state.events.has(event_id)) return send(409, { code: '23505' }); // duplicate PK
        state.events.set(event_id, { type, status: 'received' });
        return send(201, []);
      }
      if (req.method === 'PATCH') {
        const id = decodeURIComponent(query.split('event_id=eq.')[1] || '');
        const patch = JSON.parse(body);
        if (state.events.has(id)) Object.assign(state.events.get(id), patch);
        return send(204);
      }
      if (req.method === 'DELETE') {
        const id = decodeURIComponent(query.split('event_id=eq.')[1] || '');
        state.events.delete(id);
        return send(204);
      }
    }

    if (path === 'invoices' && req.method === 'PATCH') {
      const sid = decodeURIComponent((query.split('stripe_invoice_id=eq.')[1] || '').split('&')[0]);
      state.patches.push({ table: 'invoices', sid, patch: JSON.parse(body) });
      const row = state.invoices.get(sid);
      return send(200, row ? [row] : []);
    }

    if (path === 'care_plans' && req.method === 'PATCH') {
      const sid = decodeURIComponent((query.split('stripe_subscription_id=eq.')[1] || '').split('&')[0]);
      state.patches.push({ table: 'care_plans', sid, patch: JSON.parse(body) });
      return send(200, sid === 'sub_known' ? [{ id: 'care-1' }] : []);
    }

    if (path === 'projects' && req.method === 'PATCH') {
      const id = decodeURIComponent((query.split('id=eq.')[1] || '').split('&')[0]);
      state.patches.push({ table: 'projects', id, patch: JSON.parse(body) });
      return send(204);
    }

    if (path === '__state') return send(200, {
      events: [...state.events.entries()].map(([k, v]) => ({ id: k, ...v })),
      patches: state.patches,
    });
    if (path === '__reset') { state.patches = []; state.events.clear(); return send(200, { ok: true }); }

    send(404, { error: 'stub: no route ' + req.method + ' ' + req.url });
  });
});
server.listen(4000, () => console.log('stub postgrest on 4000'));

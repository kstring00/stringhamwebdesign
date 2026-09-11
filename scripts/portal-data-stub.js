// Supabase stand-in for the client portal: one client, one project, a
// checklist, some hours. Enforces the same column rules the real RLS does, so
// the UI is exercised against the real constraints.
const http = require('http');

const CLIENT_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_ID = '22222222-2222-4222-8222-222222222222';
const USER_ID = '33333333-3333-4333-8333-333333333333';
const ADMIN_ID = 'admin-user';
const OTHER_PROJECT = '99999999-9999-4999-8999-999999999999';

let items, files, messages, checkins, mail = [], role = 'client';
function reset() {
  items = [
    { id: 'aaaaaaaa-0001-4000-8000-000000000001', project_id: PROJECT_ID, name: 'Logo files', item_type: 'file', status: 'pending', note: null, value: null, file_id: null, position: 10, submitted_at: null, accepted_at: null, updated_at: '2026-09-01T10:00:00Z' },
    { id: 'aaaaaaaa-0001-4000-8000-000000000002', project_id: PROJECT_ID, name: 'Brand colors', item_type: 'text', status: 'pending', note: null, value: null, file_id: null, position: 20, submitted_at: null, accepted_at: null, updated_at: '2026-09-01T10:00:00Z' },
    { id: 'aaaaaaaa-0001-4000-8000-000000000003', project_id: PROJECT_ID, name: 'Existing site', item_type: 'link', status: 'needs_changes', note: 'That link 404s for me — can you re-check it?', value: 'http://old', file_id: null, position: 30, submitted_at: '2026-09-02T10:00:00Z', accepted_at: null, updated_at: '2026-09-03T10:00:00Z' },
    { id: 'aaaaaaaa-0001-4000-8000-000000000004', project_id: PROJECT_ID, name: 'Domain access', item_type: 'confirm', status: 'submitted', note: null, value: 'Confirmed', file_id: null, position: 40, submitted_at: '2026-09-04T10:00:00Z', accepted_at: null, updated_at: '2026-09-04T10:00:00Z' },
    { id: 'aaaaaaaa-0001-4000-8000-000000000005', project_id: PROJECT_ID, name: 'Homepage copy', item_type: 'text', status: 'accepted', note: null, value: 'Sent in the doc', file_id: null, position: 50, submitted_at: '2026-09-02T10:00:00Z', accepted_at: '2026-09-05T10:00:00Z', updated_at: '2026-09-05T10:00:00Z' },
    // Belongs to another client's project. RLS would hide it; the stub returns
    // only PROJECT_ID rows, and the PATCH guard below refuses it either way.
    { id: 'bbbbbbbb-0001-4000-8000-000000000001', project_id: OTHER_PROJECT, name: 'Someone else', item_type: 'text', status: 'pending', note: null, value: null, file_id: null, position: 10, submitted_at: null, accepted_at: null, updated_at: '2026-09-01T10:00:00Z' },
  ];
  files = [
    { id: 'ffffffff-0001-4000-8000-000000000001', project_id: PROJECT_ID, uploaded_by: 'admin', filename: 'wireframes.pdf', size: 240000, kind: 'deliverable', created_at: '2026-09-06T09:00:00Z' },
  ];
  messages = [
    { id: 'msg-a', project_id: PROJECT_ID, sender_id: 'admin-user', body: 'Kickoff notes are up.', created_at: '2026-09-02T10:00:00Z', read_at: null },
    { id: 'msg-b', project_id: PROJECT_ID, sender_id: 'admin-user', body: 'Wireframes attached.', created_at: '2026-09-06T09:05:00Z', read_at: null },
    { id: 'msg-c', project_id: PROJECT_ID, sender_id: USER_ID, body: 'Looks good, thanks.', created_at: '2026-09-06T11:00:00Z', read_at: null },
  ];
  mail = [];
  checkins = [{ id: 'c1', project_id: PROJECT_ID, hours_mark: 10, sent_at: '2026-09-05T18:00:00Z' }];
}
reset();

const timeEntries = [
  { id: 't1', project_id: PROJECT_ID, date: '2026-09-01', phase: 'Design', description: 'Layout exploration', hours: 4 },
  { id: 't2', project_id: PROJECT_ID, date: '2026-09-03', phase: 'Design', description: 'Type and colour', hours: 3.5 },
  { id: 't3', project_id: PROJECT_ID, date: '2026-09-05', phase: 'Build', description: 'Homepage markup', hours: 4 },
  { id: 't4', project_id: PROJECT_ID, date: '2026-08-28', phase: 'Discovery', description: 'Kickoff call notes', hours: 1.5 },
];


const json = (res, code, payload) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(payload === undefined ? '' : JSON.stringify(payload));
};

http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const [path, query = ''] = req.url.split('?');
    const q = decodeURIComponent(query);

    // The admin is a different person, not the client wearing a hat. Returning
    // the client's id under role=admin made `sender_id=neq.<me>` filter the
    // wrong way and hid the admin read-receipt path entirely.
    if (path === '/auth/v1/user')
      return json(res, 200, role === 'admin'
        ? { id: ADMIN_ID, email: 'kyle@test.dev' }
        : { id: USER_ID, email: 'client@test.dev' });

    if (path === '/rest/v1/users' && q.includes('id=in.'))
      return json(res, 200, [
        { id: USER_ID, name: 'Test Client', role: 'client' },
        { id: 'admin-user', name: 'Kyle Stringham', role: 'admin' },
      ]);

    if (path === '/rest/v1/users')
      return json(res, 200, [role === 'admin'
        ? { id: ADMIN_ID, email: 'kyle@test.dev', role: 'admin', name: 'Kyle Stringham', created_at: '2026-09-01T00:00:00Z' }
        : { id: USER_ID, email: 'client@test.dev', role: 'client', name: 'Test Client', created_at: '2026-09-01T00:00:00Z' }]);

    if (path === '/rest/v1/projects' && q.includes('clients(users(email))'))
      return json(res, 200, [{ name: 'Test Website', clients: { users: { email: 'client@test.dev' } } }]);

    if (path === '/rest/v1/projects')
      return json(res, 200, [{ id: PROJECT_ID, client_id: CLIENT_ID, name: 'Test Website', slug: 'test-website', status: 'build', tier: null, quoted_total: null, started_at: '2026-09-01', launched_at: null, created_at: '2026-09-01T00:00:00Z' }]);

    if (path === '/rest/v1/clients')
      return json(res, 200, [{ id: CLIENT_ID, user_id: USER_ID, business_name: 'Test Practice', contact_name: 'Test Client', phone: null }]);

    if (path === '/rest/v1/files') {
      if (req.method === 'POST') {
        const row = { ...JSON.parse(body), id: `ffffffff-0001-4000-8000-00000000000${files.length + 2}`, created_at: new Date().toISOString() };
        files.push(row);
        return json(res, 201, [row]);
      }
      return json(res, 200, files);
    }

    if (path === '/rest/v1/time_entries') return json(res, 200, timeEntries);
    if (path === '/rest/v1/invoices') return json(res, 200, []);
    if (path === '/rest/v1/time_checkins') {
      if (req.method === 'POST') { checkins.push(JSON.parse(body)); return json(res, 201, []); }
      // Honour the hours_mark filter: the route uses "does this mark already
      // exist?" to decide whether to notify, so ignoring it hides the bug.
      const m = q.match(/hours_mark=eq\.([0-9.]+)/);
      return json(res, 200, m ? checkins.filter(c => Number(c.hours_mark) === Number(m[1])) : checkins);
    }

    if (path === '/rest/v1/project_onboarding_items') {
      if (req.method === 'GET') {
        const m = q.match(/id=eq\.([0-9a-f-]+)/);
        // RLS: only this client's project is ever visible.
        const visible = items.filter((i) => i.project_id === PROJECT_ID);
        return json(res, 200, m ? visible.filter((i) => i.id === m[1]) : visible);
      }
      if (req.method === 'PATCH') {
        const m = q.match(/id=eq\.([0-9a-f-]+)/);
        const patch = JSON.parse(body);
        const item = items.find((i) => i.id === m?.[1] && i.project_id === PROJECT_ID);
        if (!item) return json(res, 200, []);                       // RLS hid it
        if (item.status === 'accepted' || item.status === 'not_applicable') return json(res, 200, []);
        // Column grant: only these three are writable by a client.
        for (const k of Object.keys(patch)) {
          if (!['status', 'value', 'file_id'].includes(k)) {
            return json(res, 403, { code: '42501', message: `permission denied for column ${k}` });
          }
        }
        // WITH CHECK: a client may only write these statuses.
        if (patch.status && !['pending', 'submitted'].includes(patch.status)) {
          return json(res, 403, { code: '42501', message: 'new row violates row-level security policy' });
        }
        Object.assign(item, patch);
        if (patch.status === 'submitted') item.submitted_at = new Date().toISOString();
        item.updated_at = new Date().toISOString();
        return json(res, 200, [item]);
      }
    }

    if (path === '/rest/v1/messages') {
      if (req.method === 'GET') return json(res, 200, messages);
      if (req.method === 'POST') {
        const row = { ...JSON.parse(body), id: `msg-${messages.length + 1}`,
                      created_at: new Date().toISOString(), read_at: null };
        messages.push(row);
        return json(res, 201, [row]);
      }
      if (req.method === 'PATCH') {
        const patch = JSON.parse(body);
        for (const k of Object.keys(patch)) {
          if (k !== 'read_at') return json(res, 403, { code: '42501', message: `permission denied for column ${k}` });
        }
        const notMe = (q.match(/sender_id=neq\.([^&]+)/) || [])[1];
        const unreadOnly = q.includes('read_at=is.null');
        const hit = messages.filter((m) =>
          (!notMe || m.sender_id !== notMe) && (!unreadOnly || m.read_at === null));
        hit.forEach((m) => { m.read_at = new Date().toISOString(); });
        return json(res, 200, hit);
      }
    }
    if (path === '/storage/v1' || path.startsWith('/storage/v1/')) return json(res, 200, { Key: 'ok' });
    if (path === '/__reset') { reset(); return json(res, 200, { ok: true }); }
    if (path === '/__items') return json(res, 200, items);
    if (path === '/__messages') return json(res, 200, messages);
    if (path === '/__mail') {
      if (req.method === 'POST') { mail.push(JSON.parse(body)); return json(res, 200, { id: 'stub' }); }
      return json(res, 200, mail);
    }
    if (path === '/__mail_reset') { mail = []; return json(res, 200, { ok: true }); }
    // Lets the tests exercise admin-only routes without a second auth stub.
    if (path === '/__role') { role = q.includes('admin') ? 'admin' : 'client'; return json(res, 200, { role }); }

    json(res, 404, { error: `stub: ${req.method} ${req.url}` });
  });
}).listen(4200, () => console.log('portal stub on 4200'));

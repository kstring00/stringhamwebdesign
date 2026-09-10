// Who gets notified? A bug here mails one client's activity to another party.
let fails = 0;
const ok = (l,c,x='') => { if(!c) fails++; console.log(`${c?'ok  ':'FAIL'} ${l}${x?'  '+x:''}`); };
const mail = () => fetch('http://localhost:4200/__mail').then(r => r.json());
const reset = () => fetch('http://localhost:4200/__mail_reset');
const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  // The client sends a message -> Kyle is notified, not the client.
  await reset();
  await fetch('http://localhost:3000/api/portal/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: 'swd_portal_access=a; swd_portal_refresh=r' },
    body: JSON.stringify({ projectId: '22222222-2222-4222-8222-222222222222', body: 'From the client' }),
  });
  await wait(1500);
  let sent = await mail();
  ok('client message notifies exactly one party', sent.length === 1, `${sent.length} mails`);
  if (sent[0]) {
    ok('client message goes to the ADMIN', sent[0].to[0] === 'kyle@admin.test', sent[0].to[0]);
    ok('not echoed back to the client', !sent[0].to.includes('client@test.dev'));
    ok('subject names the sender and project', /Test Client replied — Test Website/.test(sent[0].subject), sent[0].subject);
    ok('body is NOT reproduced in the email', !sent[0].text.includes('From the client'),
       'the thread is the record; an inbox copy can drift or misdeliver');
    ok('links back to the portal', sent[0].text.includes('http://localhost:3000/portal'));
  }

  // The 10-hour check-in -> the client, and it states the cap.
  // Admin-only route, so switch the stub's session role first.
  await reset();
  await fetch('http://localhost:4200/__role?admin');
  await fetch('http://localhost:3000/api/portal/admin/time', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: 'swd_portal_access=a; swd_portal_refresh=r' },
    body: JSON.stringify({ mode: 'checkin', projectId: '22222222-2222-4222-8222-222222222222', hoursMark: 20 }),
  });
  await wait(1500);
  sent = await mail();
  const checkin = sent[0];
  ok('check-in notifies someone', !!checkin, `${sent.length} mails`);
  if (checkin) {
    ok('check-in goes to the CLIENT', checkin.to[0] === 'client@test.dev', checkin.to[0]);
    ok('check-in names the mark', /20-hour check-in/.test(checkin.subject), checkin.subject);
    ok('check-in states work has stopped', /I stop here until you/.test(checkin.text));
    ok('check-in reports the real total', /13\.0 hours/.test(checkin.text),
       checkin.text.split('\n').find(l => l.includes('Logged so far')) || '');
  }

  await fetch('http://localhost:4200/__role?client');
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nnotification routing correct');
  process.exit(fails?1:0);
})();

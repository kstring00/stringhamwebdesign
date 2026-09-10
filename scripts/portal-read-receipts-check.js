// Step 4: read receipts, and notifications that never block or break an action.
const { chromium } = require('playwright');
let fails = 0;
const ok = (l,c,x='') => { if(!c) fails++; console.log(`${c?'ok  ':'FAIL'} ${l}${x?'  '+x:''}`); };
const msgs = () => fetch('http://localhost:4200/__messages').then(r => r.json());

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport:{width:1440,height:1000} });
  await ctx.addCookies([{name:'swd_portal_access',value:'a',domain:'localhost',path:'/'},
                        {name:'swd_portal_refresh',value:'r',domain:'localhost',path:'/'}]);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));

  await fetch('http://localhost:4200/__reset');
  const before = await msgs();
  ok('starts with unread messages', before.filter(m => !m.read_at).length === 3,
     `${before.filter(m=>!m.read_at).length} unread`);

  await p.goto('http://localhost:3000/portal/projects/messages', { waitUntil:'networkidle' });
  await p.waitForTimeout(3000);

  const after = await msgs();
  const kylesRead = after.filter(m => m.sender_id === 'admin-user' && m.read_at).length;
  const mineRead = after.filter(m => m.sender_id.startsWith('3333') && m.read_at).length;
  ok("Kyle's messages marked read for the client", kylesRead === 2, `${kylesRead}/2`);
  ok("client's OWN messages never marked read", mineRead === 0,
     `${mineRead} self-read — a client must not be able to mark their own message read`);

  // Sending a message still works with no RESEND key configured, and the
  // response does not wait on the notification.
  const t0 = Date.now();
  await p.locator('#portal-message').fill('Testing notifications.');
  await p.locator('button:has-text("Send message")').click();
  await p.waitForTimeout(1500);
  const elapsed = Date.now() - t0;
  const sent = (await msgs()).find(m => m.body === 'Testing notifications.');
  ok('message saved with no mail provider configured', !!sent);
  ok('send was not blocked by the notifier', elapsed < 4000, `${elapsed}ms`);
  ok('no page errors', errs.length === 0, JSON.stringify(errs));

  await b.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nstep 4 checks passed');
  process.exit(fails?1:0);
})();

// Minimal Supabase stand-in: one known account, everything else unknown.
const http = require('http');
const KNOWN = 'client@known.test';
let sends = [];
http.createServer((req, res) => {
  let b=''; req.on('data',c=>b+=c); req.on('end',()=>{
    const [path,q=''] = req.url.split('?');
    const send=(code,p)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(p===undefined?'':JSON.stringify(p))};
    if (path === '/rest/v1/users') {
      const m = decodeURIComponent(q).match(/email=eq\.([^&]+)/);
      return send(200, m && m[1] === KNOWN ? [{ id: 'user-1' }] : []);
    }
    if (path === '/rest/v1/portal_magic_link_windows') {
      if (req.method === 'GET') return send(200, global.__throttle ? [{ requested_at: new Date().toISOString() }] : []);
      if (req.method === 'POST') return send(201, [{ id: 'win-1' }]);
      if (req.method === 'DELETE') return send(204);
    }
    if (path === '/auth/v1/otp') {           // the SMTP round-trip, made slow
      const body = JSON.parse(b || '{}');
      return setTimeout(() => { sends.push(body.email); send(200, {}); }, 300);
    }
    if (path === '/__sends') return send(200, sends);
    if (path === '/__reset') { sends = []; global.__throttle = false; return send(200, {ok:true}); }
    if (path === '/__throttle') { global.__throttle = true; return send(200, {ok:true}); }
    send(404, { error: 'stub: ' + req.method + ' ' + req.url });
  });
}).listen(4100, ()=>console.log('supabase stub on 4100'));

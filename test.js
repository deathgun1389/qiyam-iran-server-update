// Smoke test: node test.js  (server must be running on :8765)
const URL = process.env.URL || 'ws://127.0.0.1:8765';
function client(name, token) {
  return new Promise(res => {
    const ws = new WebSocket(URL); const c = { ws, log: [], inv: null, me: null };
    ws.onmessage = e => { const m = JSON.parse(e.data); c.log.push(m); if (m.t === 'welcome') { c.me = m.you; c.pos = m.pos; c.w = m; c.inv = m.you.inv; res(c); } if (m.t === 'inv') c.inv = m.inv; if (m.t === 'me') c.me = m.you; };
    ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', token, name }));
    c.send = o => ws.send(JSON.stringify(o)); c.last = t => [...c.log].reverse().find(m => m.t === t);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const a = await client('Arash', 'tokentokentoken0001'), b = await client('Bahram', 'tokentokentoken0002');
  console.log('welcome ok; nodes', a.w.world.nodes.length, 'world', a.w.world.w, a.w.world.h);
  // walk to a free spot far from spawn (teleport blocked by speed clamp -> walk in steps)
  async function walk(c, tx, ty) { let [x, y] = c.pos; while (Math.hypot(tx - x, ty - y) > 1) { const d = Math.hypot(tx - x, ty - y), s = Math.min(d, 20); x += (tx - x) / d * s; y += (ty - y) / d * s; c.send({ t: 'pos', x, y, f: 0, a: 'walk' }); await sleep(105); } c.pos = [x, y]; }
  await walk(a, 3000, 3300); await walk(b, 3000 + 600, 3300);
  a.send({ t: 'tribe_create', name: 'Parthia', color: '#e05a4f' }); await sleep(200);
  console.log('tribe a:', a.me.tribe, 'inv', JSON.stringify(a.inv), a.last('err'));
  b.send({ t: 'tribe_create', name: 'Sasan' }); await sleep(200);
  console.log('b create (should fail: too close):', (b.last('err') || {}).text);
  await walk(b, 4800, 3300); b.log.length = 0; b.send({ t: 'tribe_create', name: 'Sasan' }); await sleep(200);
  console.log('tribe b:', b.me.tribe, (b.last('err') || {}).text);
  // bricks
  a.send({ t: 'place', kind: 'wood', gx: 3000 / 16 + 3, gy: 3300 / 16 }); await sleep(150);
  a.send({ t: 'place', kind: 'wood', gx: 3000 / 16 + 3, gy: 3300 / 16 }); await sleep(150);
  console.log('brick add msgs:', a.log.filter(m => m.t === 'brick_add').length, 'dup err:', (a.last('err') || {}).text);
  a.send({ t: 'place', kind: 'stone', gx: 3000 / 16 + 60, gy: 3300 / 16 }); await sleep(150);
  console.log('outside territory err:', (a.last('err') || {}).text);
  // gather
  const n = a.w.world.nodes.find(n => n[1] === 'tree');
  await walk(a, n[2], n[3]); a.send({ t: 'gather', id: n[0] }); await sleep(400); console.log('wood after gather', a.inv.wood);
  await walk(a, 3000, 3300);
  // war
  a.send({ t: 'war_declare', name: 'Sasan' }); await sleep(150); console.log('war err (truce/treasury expected):', (a.last('err') || {}).text);
  a.send({ t: 'tribe_list' }); await sleep(100); console.log('tribes listed', a.last('tribes').tribes.map(t => t.name + ':' + t.radius));
  a.send({ t: 'chat', scope: 'all', text: 'سلام' }); await sleep(100); console.log('chat', JSON.stringify(b.last('chat')));
  a.ws.close(); b.ws.close(); await sleep(200); process.exit(0);
})();

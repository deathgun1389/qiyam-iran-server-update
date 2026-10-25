// War flow test. Run the server like this first:
//   WAR_PREP_MS=1500 WAR_LEN_MS=60000 NEW_TRIBE_TRUCE_MS=0 HEART_HP=48 WAR_COIN_COST=10 node server.js
const URL = process.env.URL || 'ws://127.0.0.1:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function client(name, token) { return new Promise(res => { const ws = new WebSocket(URL); const c = { log: [], send: o => ws.send(JSON.stringify(o)), last: t => [...c.log].reverse().find(m => m.t === t), ws };
  ws.onmessage = e => { const m = JSON.parse(e.data); c.log.push(m); if (m.t === 'welcome') { c.me = m.you; c.pos = m.pos; res(c); } if (m.t === 'me') c.me = m.you; };
  ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', token, name })); }); }
async function walk(c, tx, ty) { let [x, y] = c.pos; while (Math.hypot(tx - x, ty - y) > 1) { const d = Math.hypot(tx - x, ty - y), s = Math.min(d, 20); x += (tx - x) / d * s; y += (ty - y) / d * s; c.send({ t: 'pos', x, y, f: 0, a: 'walk' }); await sleep(105); } c.pos = [x, y]; }
(async () => {
  const a = await client('Alpha', 'wartokenwartoken01'), b = await client('Beta', 'wartokenwartoken02');
  await walk(a, 2400, 2400); a.send({ t: 'tribe_create', name: 'AlphaT' }); await sleep(200);
  await walk(b, 4400, 2400); b.send({ t: 'tribe_create', name: 'BetaT' }); await sleep(200);
  console.log('tribes:', a.me.tribe, b.me.tribe);
  a.send({ t: 'war_declare', target: b.me.tribe }); await sleep(150);
  console.log('declare with empty treasury ->', (a.last('err') || {}).text);
  a.send({ t: 'tribe_donate', res: 'coins', n: 10 }); await sleep(100);
  a.send({ t: 'war_declare', target: b.me.tribe }); await sleep(150);
  console.log('wars after declare:', JSON.stringify(a.last('wars').wars.map(w => [w.a, w.b])));
  await walk(a, 4420, 2400);
  a.send({ t: 'hit_brick', gx: 4400 / 16, gy: 2400 / 16 }); await sleep(100);
  console.log('hit during prep ->', (a.last('err') || {}).text);
  await sleep(1500);
  for (let i = 0; i < 5; i++) { a.send({ t: 'hit_brick', gx: 4400 / 16, gy: 2400 / 16 }); await sleep(420); }
  console.log('heart hp msgs:', a.log.filter(m => m.t === 'brick_hp').map(m => m.hp).join(','));
  console.log('toast:', (a.log.filter(m => m.t === 'toast').pop() || {}).text);
  console.log('wars now:', a.last('wars').wars.length, ' beta heart re-added:', b.log.some(m => m.t === 'brick_add' && m.b[2] === 'heart'));
  a.send({ t: 'tribe_list' }); await sleep(100);
  console.log('truce set:', a.last('tribes').tribes.map(t => t.name + ':' + (t.truceUntil > Date.now())).join(' '));
  process.exit(0);
})();

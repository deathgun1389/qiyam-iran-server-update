// Mob test: node test_mobs.js (server running)
const URL = process.env.URL || 'ws://127.0.0.1:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ws = new WebSocket(URL); const log = [];
let w;
ws.onmessage = e => { const m = JSON.parse(e.data); log.push(m); if (m.t === 'welcome') w = m; };
ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', token: 'mobtokenmobtoken01', name: 'Mobber' }));
const last = t => [...log].reverse().find(m => m.t === t);
(async () => {
  await sleep(500);
  console.log('mdefs:', Object.keys(w.mdefs).join(','));
  // walk toward spawn-surroundings then find first mob seen
  let [x, y] = w.pos; let found = null;
  const targets = [[x, y - 1600], [x - 700, y - 1700], [x + 700, y - 1700]];
  for (const [tx, ty] of targets) {
    while (Math.hypot(tx - x, ty - y) > 1 && !found) {
      const d = Math.hypot(tx - x, ty - y), s = Math.min(d, 20); x += (tx - x) / d * s; y += (ty - y) / d * s;
      ws.send(JSON.stringify({ t: 'pos', x, y, f: 0, a: 'walk' })); await sleep(105);
      const mm = last('mobs'); if (mm) { const f = mm.m.find(q => q[1] === 'boar' || q[1] === 'goblin' || q[1] === 'wolf'); if (f) found = f; }
    }
    if (found) break;
  }
  console.log('first mob seen:', JSON.stringify(found));
  if (found) {
    const kinds = {}; for (const m of last('mobs').m) kinds[m[1]] = (kinds[m[1]] || 0) + 1; console.log('nearby kinds', JSON.stringify(kinds));
    // stand on it and hit until dead
    let id = found[0]; let cur = found;
    for (let i = 0; i < 45; i++) {
      const mm = last('mobs').m.find(q => q[0] === id); if (!mm) break; cur = mm;
      const d = Math.hypot(mm[2] - x, mm[3] - y); const dx = (mm[2] - x), dy = (mm[3] - y);
      if (d > 30) { x += dx / d * Math.min(d - 20, 20); y += dy / d * Math.min(d - 20, 20); ws.send(JSON.stringify({ t: 'pos', x, y, f: 0, a: 'walk' })); }
      ws.send(JSON.stringify({ t: 'hit_mob', id })); await sleep(420);
    }
    console.log('mob_die:', JSON.stringify(log.find(m => m.t === 'mob_die')), ' toast:', (log.filter(m => m.t === 'toast').pop() || {}).text, ' hp msgs:', log.filter(m => m.t === 'hp').length);
  }
  process.exit(0);
})();

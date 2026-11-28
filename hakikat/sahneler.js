
/* ============================================================
   SAHNELER: 50+ zemin, metne göre seçim, sunumda tekrar yok
   ============================================================ */
const REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2;
let FX_OFF = {};
function srng(seed) { seed = Math.abs(Math.floor(seed)) % 2147483647; if (seed <= 0) seed += 2147483646; return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
function hashStr(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function lin(ctx, w, h, stops, x1 = 0, y1 = h) { const g = ctx.createLinearGradient(0, 0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function rad(ctx, w, h, stops, cx = .5, cy = .5, r = .8) { const g = ctx.createRadialGradient(w * cx, h * cy, 0, w * cx, h * cy, Math.max(w, h) * r); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function glow(ctx, x, y, r, rgb, a) { if (a <= 0 || r <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function shade(ctx, w, h, sh) { if (!sh) return; const [side, rgb, a] = sh; const g = side === 'l' ? ctx.createLinearGradient(0, 0, w * .66, 0) : ctx.createLinearGradient(w, 0, w * .34, 0); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function pts(st, key, n, seed, gen) { if (!st[key]) { const r = srng(seed); st[key] = Array.from({ length: n }, () => gen(r)); } return st[key]; }
function drawStars(ctx, st, w, h, t, n, top, seed = 7, rgb = '255,246,224') {
  pts(st, 'stars' + seed, n, seed, r => [r() * w, Math.pow(r(), 1.3) * h * top, r() * 1.3 + .3, r() * 6]).forEach(([x, y, s, p]) => {
    ctx.globalAlpha = Math.max(0, (.3 + .7 * (.5 + .5 * Math.sin(t * 1.3 + p))) * (1 - y / (h * top * 1.05)));
    ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
  });
  ctx.globalAlpha = 1;
}
function hills(ctx, w, h, base, amp, f, seed, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w + 16; x += 16) ctx.lineTo(x, base - amp * (Math.sin(x / f + seed) * .6 + Math.sin(x / (f * .37) + seed * 2.3) * .25 + Math.sin(x / (f * 2.1) + seed * .7) * .4));
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
}
function peaks(ctx, st, w, h, base, amp, seed, color, snow) {
  const key = 'pk' + seed + '_' + w;
  const P = st[key] || (st[key] = (() => {
    const r = srng(seed), n = 3 + Math.floor(r() * 3), C = Array.from({ length: n }, (_, i) => [(i + .2 + r() * .6) / n * w, amp * (.55 + r() * .45), w * (.16 + r() * .14)]);
    const a = []; let j = 0;
    for (let x = -20; x <= w + 40; x += 10) { j += (r() - .5) * 7; j *= .9; let e = 0; C.forEach(([c, hh, wd]) => { e = Math.max(e, hh * (1 - Math.abs(x - c) / wd)); }); a.push([x, Math.max(0, e) + j, Math.max(0, e)]); }
    return a; })());
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-20, h); P.forEach(([x, e]) => ctx.lineTo(x, base - e)); ctx.lineTo(w + 40, h); ctx.closePath(); ctx.fill();
  if (snow) {
    const thr = amp * .45; ctx.fillStyle = 'rgba(248,251,255,.92)'; ctx.beginPath();
    P.forEach(([x, e], i) => i ? ctx.lineTo(x, base - e) : ctx.moveTo(x, base - e));
    for (let i = P.length - 1; i >= 0; i--) { const [x, e, raw] = P[i]; const d = Math.max(0, raw - thr) * .55 * (1 + .25 * Math.sin(x * .09)); ctx.lineTo(x, base - e + d); }
    ctx.closePath(); ctx.fill();
  }
}
function mist(ctx, w, h, y, rgb, a) { const g = ctx.createLinearGradient(0, y - 70, 0, y + 70); g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(.5, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(0, y - 70, w, 140); }
function clouds(ctx, st, w, h, t, n, y0, y1, rgb, a, seed = 11, speed = 6) {
  if (FX_OFF.cloud) return;
  pts(st, 'cl' + seed, n, seed, r => [r() * (w + 400), y0 + r() * (y1 - y0), 50 + r() * 110, r()]).forEach(([x, y, s, k]) => {
    const xx = ((x + t * speed * (.5 + k)) % (w + 400)) - 200;
    for (let i = 0; i < 5; i++) glow(ctx, xx + (i - 2) * s * .45, y + Math.sin(i * 1.7 + k * 5) * s * .12, s * (.55 + .2 * Math.sin(i + k * 3)), rgb, a);
  });
}
function birds(ctx, st, w, h, t, n, seed, color, big = 1) {
  if (FX_OFF.bird) return;
  ctx.strokeStyle = color; ctx.lineWidth = 2 * big; ctx.lineCap = 'round';
  pts(st, 'bd' + seed, n, seed, r => [r() * w, r() * h * .42 + 40, r() * 6, .6 + r() * .6]).forEach(([x, y, p, s]) => {
    const xx = ((x + t * 30 * s) % (w + 100)) - 50, yy = y + Math.sin(t * .5 + p) * 8, f = Math.sin(t * 6 * s + p) * 5 * s * big, z = 10 * s * big;
    ctx.beginPath(); ctx.moveTo(xx - z, yy - f); ctx.quadraticCurveTo(xx - z * .4, yy - z * .3, xx, yy); ctx.quadraticCurveTo(xx + z * .4, yy - z * .3, xx + z, yy - f); ctx.stroke();
  });
}
function falling(ctx, st, w, h, t, p) {
  if (FX_OFF.fall) return;
  const F = pts(st, 'fa' + (p.key || p.kind), p.n, p.seed || 9, r => [r() * w, r() * h, r(), r()]);
  F.forEach(([x, y, a, b]) => {
    const sp = p.speed * (.6 + a * .8);
    let yy = (y + (p.up ? -1 : 1) * t * sp) % h; if (yy < 0) yy += h;
    let X = (x + Math.sin(t * .8 + b * 9) * (p.sway ?? 10) + t * (p.drift || 0) * (.5 + a)) % w; if (X < 0) X += w;
    if (p.area) X = p.area[0] * w + (X / w) * (p.area[1] - p.area[0]) * w;
    const col = p.colors[Math.floor(b * p.colors.length) % p.colors.length];
    ctx.globalAlpha = (p.alpha ?? .85) * (p.fade ? Math.max(0, yy / h) : 1);
    ctx.fillStyle = col; ctx.strokeStyle = col;
    const sz = (p.size || 2) * (.5 + a);
    if (p.kind === 'leaf' || p.kind === 'petal') { ctx.save(); ctx.translate(X, yy); ctx.rotate(t * (1 + b) + b * 6); ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.4, sz * .6, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    else if (p.kind === 'drop') { ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X, yy); ctx.lineTo(X + (p.drift || 0) * .02, yy + 16 * (.6 + a)); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(X, yy, sz, 0, TAU); ctx.fill(); }
  });
  ctx.globalAlpha = 1;
}
function skyline(ctx, st, w, h, base, color, seed, modern) {
  const key = 'sk' + seed + '_' + w;
  const L = st[key] || (st[key] = (() => { const r = srng(seed), a = []; let x = -20; while (x < w + 40) { const k = r();
    if (modern) { const bw = 40 + r() * 80, bh = 50 + r() * 170; a.push(['tw', x, bw, bh, Array.from({ length: 30 }, () => r())]); x += bw + 4 + r() * 10; }
    else if (k < .2) { a.push(['min', x + 8, 9 + r() * 4, 150 + r() * 100]); x += 34; }
    else if (k < .46) { const R = 38 + r() * 55; a.push(['dome', x + R, R]); x += R * 2 + 8; }
    else { const bw = 40 + r() * 70; a.push(['box', x, bw, 26 + r() * 60]); x += bw; } } return a; })());
  ctx.fillStyle = color;
  L.forEach(e => {
    if (e[0] === 'box') ctx.fillRect(e[1], base - e[3], e[2], e[3] + 2);
    else if (e[0] === 'dome') { const cx = e[1], R = e[2]; ctx.fillRect(cx - R, base - R * .55, R * 2, R * .55 + 2); ctx.beginPath(); ctx.ellipse(cx, base - R * .55, R * .82, R * .8, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(cx - 1.5, base - R * 1.35 - 16, 3, 18); }
    else if (e[0] === 'min') { const cx = e[1], mw = e[2], mh = e[3]; ctx.fillRect(cx - mw / 2, base - mh, mw, mh + 2); ctx.fillRect(cx - mw / 2 - 4, base - mh * .72, mw + 8, 5); ctx.fillRect(cx - mw / 2 - 3, base - mh * .9, mw + 6, 4); ctx.beginPath(); ctx.moveTo(cx - mw / 2, base - mh); ctx.lineTo(cx, base - mh - mw * 2.6); ctx.lineTo(cx + mw / 2, base - mh); ctx.fill(); }
    else if (e[0] === 'tw') { ctx.fillRect(e[1], base - e[3], e[2], e[3] + 2); }
  });
  ctx.fillRect(0, base, w, h - base);
  if (modern) L.forEach(e => { if (e[0] !== 'tw') return; const [, x, bw, bh, R] = e; let k = 0; for (let yy = base - bh + 10; yy < base - 8; yy += 14) for (let xx = x + 6; xx < x + bw - 8; xx += 11) { const v = R[k++ % R.length]; if (v > .55) { ctx.fillStyle = `rgba(255,${200 + v * 40 | 0},120,${.35 + v * .4})`; ctx.fillRect(xx, yy, 5, 7); } } });
}
/* --- ağaç --- */
const TREE_CACHE = new Map();
function drawBranch(ctx, x, y, len, ang, depth, r, tips, col) {
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, depth * depth * .55);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2 + (r() - .5) * len * .2, (y + y2) / 2, x2, y2); ctx.stroke();
  if (depth <= 1) { tips.push([x2, y2]); return; }
  const n = r() < .35 ? 3 : 2;
  for (let i = 0; i < n; i++) drawBranch(ctx, x2, y2, len * (.7 + r() * .1), ang + (n === 2 ? (i ? .42 : -.38) : (i - 1) * .5) + (r() - .5) * .25, depth - 1, r, tips, col);
}
function treeLayer(w, h, x, y, len, col, seed) {
  const key = [w, h, x, y, len, col, seed].join('|');
  if (TREE_CACHE.has(key)) return TREE_CACHE.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), tips = [];
  drawBranch(g, x, y, len, -Math.PI / 2, 8, srng(seed), tips, col);
  const out = { c, tips }; TREE_CACHE.set(key, out); return out;
}
const FOL = { bahar: ['rgba(232,140,150,.88)', 'rgba(255,240,236,.92)', 'rgba(246,190,200,.9)'], yaz: ['#4f7a3a', '#5f8f45', '#3f6a32', '#79a85a'], sonbahar: ['#c8642a', '#e09a3a', '#a8401f', '#d9b24a'], meyve: ['#4f7a3a', '#5f8f45', '#3f6a32', '#6f9a50'] };
function treeScene(ctx, w, h, t, st, p) {
  lin(ctx, w, h, p.bg);
  if (p.sun) glow(ctx, w * p.sun[0], h * p.sun[1], p.sun[2], p.sun[3], p.sun[4]);
  if (p.ground) { ctx.fillStyle = p.ground[0]; ctx.fillRect(0, h - p.ground[1], w, p.ground[1]); }
  const by = h - (p.ground ? p.ground[1] * .45 : 0) + 8;
  const tr = treeLayer(w, h, Math.round(w * p.x), Math.round(by), p.len, p.col, p.seed || 42);
  ctx.drawImage(tr.c, 0, 0);
  if (p.season && p.season !== 'ciplak') {
    if (!st.fol) { const r = srng((p.seed || 42) + 3); st.fol = tr.tips.map(([x, y]) => [x + (r() - .5) * 14, y + (r() - .5) * 14, r(), r()]); }
    const cols = FOL[p.season], big = p.season === 'yaz' || p.season === 'meyve';
    st.fol.forEach(([x, y, k, q]) => {
      if (p.season === 'sonbahar' && k > .62) return;
      const sw = Math.sin(t * 1.1 + k * 6) * 1.6;
      ctx.fillStyle = cols[Math.floor(q * cols.length)];
      ctx.beginPath(); ctx.arc(x + sw, y, (big ? 9 : 4) + k * (big ? 8 : 5), 0, TAU); ctx.fill();
    });
    if (p.season === 'meyve') st.fol.forEach(([x, y, k, q]) => { if (q > .14) return; ctx.fillStyle = k > .5 ? '#c0392b' : '#e0892a'; ctx.beginPath(); ctx.arc(x + 4, y + 8, 6, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(x + 2, y + 6, 1.8, 0, TAU); ctx.fill(); });
  }
  if (p.fall) falling(ctx, st, w, h, t, p.fall);
  if (p.fog) for (let i = 0; i < 5; i++) { const x = ((t * 18 * (i % 2 ? 1 : -.7) + i * 300) % (w + 600) + w + 600) % (w + 600) - 300; glow(ctx, x, h * (.3 + i * .14), 360, p.fog, .26); }
  shade(ctx, w, h, p.shade);
}
/* --- manzara: gök, güneş/ay, tepeler, dağlar, şehir, kuşlar --- */
function landScene(ctx, w, h, t, st, p) {
  lin(ctx, w, h, p.sky);
  if (p.milky) { ctx.save(); ctx.translate(w * .55, h * .32); ctx.rotate(-.35); ctx.scale(3.2, .32); glow(ctx, 0, 0, 260, '205,195,255', .16); ctx.restore(); }
  if (p.stars) drawStars(ctx, st, w, h, t, p.stars, p.starTop || .7, p.seed || 7);
  if (p.sun) { const [x, y, r, rgb, a] = p.sun; glow(ctx, w * x, h * y, r * 6, rgb, a * .55); if (p.disk) { ctx.fillStyle = `rgba(${rgb},.96)`; ctx.beginPath(); ctx.arc(w * x, h * y, r, 0, TAU); ctx.fill(); } }
  if (p.moon) { const [x, y, r] = p.moon; glow(ctx, w * x, h * y, r * 4.5, '255,236,190', .24); ctx.fillStyle = '#f6e7c2'; ctx.beginPath(); ctx.arc(w * x, h * y, r, 0, TAU); ctx.fill(); if (p.cut) { ctx.fillStyle = p.cut; ctx.beginPath(); ctx.arc(w * x + r * .4, h * y - r * .22, r * .88, 0, TAU); ctx.fill(); } }
  if (p.clouds) clouds(ctx, st, w, h, t, p.clouds[0], h * p.clouds[1], h * p.clouds[2], p.clouds[3], p.clouds[4], 11, p.clouds[5] || 6);
  if (p.birds) birds(ctx, st, w, h, t, p.birds, 4, p.birdCol || 'rgba(40,30,30,.7)', p.birdBig || 1);
  (p.layers || []).forEach(L => {
    if (L[0] === 'hill') hills(ctx, w, h, h * L[1], L[2], L[3], L[4], L[5]);
    else if (L[0] === 'peak') peaks(ctx, st, w, h, h * L[1], L[2], L[3], L[4], L[5]);
    else if (L[0] === 'mist') mist(ctx, w, h, h * L[1], L[2], L[3]);
    else if (L[0] === 'city') skyline(ctx, st, w, h, h * L[1], L[2], L[3], L[4]);
  });
  if (p.fall) falling(ctx, st, w, h, t, p.fall);
  shade(ctx, w, h, p.shade);
}
/* --- deniz --- */
function seaScene(ctx, w, h, t, st, p) {
  const hz = h * p.hz;
  lin(ctx, w, hz + 2, p.sky, 0, hz);
  if (p.stars) drawStars(ctx, st, w, hz, t, p.stars, .95, 3);
  const L = p.light;
  if (L) { glow(ctx, w * L[0], h * L[1], L[2] * 6, L[3], L[4] * .6); ctx.fillStyle = `rgba(${L[3]},.95)`; ctx.beginPath(); ctx.arc(w * L[0], h * L[1], L[2], 0, TAU); ctx.fill(); }
  if (p.clouds) clouds(ctx, st, w, hz, t, p.clouds[0], h * p.clouds[1], h * p.clouds[2], p.clouds[3], p.clouds[4], 13, p.clouds[5] || 8);
  const g = ctx.createLinearGradient(0, hz, 0, h); p.water.forEach((c, i) => g.addColorStop(i / (p.water.length - 1), c)); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
  if (L) for (let y = hz + 4; y < h; y += 6) { const k = (y - hz) / (h - hz), ww = (10 + k * 140) * (.6 + .4 * Math.sin(t * 2 + y * .3)); ctx.fillStyle = `rgba(${L[3]},${.32 * (1 - k * .5)})`; ctx.fillRect(w * L[0] - ww / 2 + Math.sin(t + y * .1) * 6, y, ww, 2); }
  ctx.strokeStyle = p.wave; ctx.lineWidth = 1.2;
  for (let i = 0; i < 18; i++) { const k = i / 18, y = hz + Math.pow(k, 1.6) * (h - hz) + 4, amp = 1 + k * p.amp; ctx.globalAlpha = .2 + k * .35; ctx.beginPath(); for (let x = 0; x <= w; x += 18) ctx.lineTo(x, y + Math.sin(x / (40 + k * 80) + t * (1 + p.amp * .08) + i) * amp); ctx.stroke(); }
  ctx.globalAlpha = 1;
  if (p.rain) falling(ctx, st, w, h, t, { n: 200, kind: 'drop', colors: ['#c8d4de'], speed: 560, sway: 0, drift: -80, alpha: .45 });
  shade(ctx, w, h, p.shade);
}
/* --- ışık huzmeleri --- */
function raysScene(ctx, w, h, t, st, p) {
  if (p.radial) rad(ctx, w, h, p.bg, p.o[0], Math.max(0, p.o[1]), .9); else lin(ctx, w, h, p.bg, w, h);
  ctx.save(); ctx.translate(w * p.o[0], h * p.o[1]);
  for (let i = 0; i < p.n; i++) { const a = p.a0 + i * p.da + Math.sin(t * .3 + i) * .03; ctx.fillStyle = `rgba(${p.rgb},${p.alpha * (.7 + .3 * Math.sin(t * .8 + i * 1.7))})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 2200, Math.sin(a) * 2200); ctx.lineTo(Math.cos(a + p.wd) * 2200, Math.sin(a + p.wd) * 2200); ctx.fill(); }
  ctx.restore();
  if (p.core) glow(ctx, w * p.o[0], h * Math.max(0, p.o[1]), p.core, p.rgb, .55);
  if (p.clouds) clouds(ctx, st, w, h, t, p.clouds[0], h * p.clouds[1], h * p.clouds[2], p.clouds[3], p.clouds[4], 17, 4);
  if (p.dust) falling(ctx, st, w, h, t, { n: 60, kind: 'dot', colors: [p.dust], speed: 12, up: true, size: 1.6, alpha: .5 });
}
/* --- desen (tezhip, girih) --- */
const PAT_CACHE = new Map();
function star8p(g, cx, cy, r, inner = .55) { g.beginPath(); for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i - Math.PI / 2, rr = i % 2 ? r * inner : r; g.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } g.closePath(); }
function patternLayer(w, h, col, kind, s) {
  const key = [w, h, col, kind, s].join('|'); if (PAT_CACHE.has(key)) return PAT_CACHE.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.strokeStyle = col; g.lineWidth = 1.4;
  for (let y = 0; y <= h + s; y += s) for (let x = 0; x <= w + s; x += s) {
    star8p(g, x, y, s * .34); g.stroke();
    if (kind === 'girih') { g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 4 * i + Math.PI / 8; g.lineTo(x + Math.cos(a) * s * .5, y + Math.sin(a) * s * .5); } g.closePath(); g.stroke(); }
    else { g.save(); g.translate(x + s / 2, y + s / 2); g.rotate(Math.PI / 4); g.strokeRect(-s * .12, -s * .12, s * .24, s * .24); g.restore(); g.beginPath(); g.arc(x, y, s * .1, 0, TAU); g.stroke(); }
  }
  PAT_CACHE.set(key, c); return c;
}
function patternScene(ctx, w, h, t, st, p) {
  rad(ctx, w, h, p.bg, .5, .45, .75);
  ctx.globalAlpha = p.pa * (.8 + .2 * Math.sin(t * .5)); ctx.drawImage(patternLayer(w, h, p.col, p.kind, p.s), 0, 0); ctx.globalAlpha = 1;
  glow(ctx, w / 2, h * .48, 560, p.scrim, p.scrimA);
  if (p.glow) glow(ctx, w / 2, h * .44, 480, p.glow, .18 + .05 * Math.sin(t * .7));
  if (p.dust) falling(ctx, st, w, h, t, { n: 60, kind: 'dot', colors: [p.dust], speed: 14, up: true, size: 1.5, alpha: .45 });
}
/* --- mum --- */
function candleScene(ctx, w, h, t, st, p) {
  rad(ctx, w, h, p.bg, p.x, .6, .8);
  const x = w * p.x, base = h * .9, ch = p.ch || 230, cw = 50, top = base - ch, fl = 1 + .08 * Math.sin(t * 9) + .05 * Math.sin(t * 13.7);
  if (!p.dim) glow(ctx, x, top - 40, 420 + 20 * Math.sin(t * 3), '255,170,70', .3);
  ctx.fillStyle = '#4a3220'; ctx.beginPath(); ctx.ellipse(x, base + 6, 80, 16, 0, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0); g.addColorStop(0, p.dim ? '#7c8492' : '#d8c7a6'); g.addColorStop(.5, p.dim ? '#a9b0bb' : '#f6ecd6'); g.addColorStop(1, p.dim ? '#666e7b' : '#bfae8c');
  ctx.fillStyle = g; ctx.fillRect(x - cw / 2, top, cw, ch);
  ctx.beginPath(); ctx.ellipse(x - 12, top + 26, 6, 18, 0, 0, TAU); ctx.ellipse(x + 15, top + 16, 5, 12, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + 1, top - 12); ctx.stroke();
  if (p.dim) {
    ctx.strokeStyle = 'rgba(200,210,225,.25)'; ctx.lineWidth = 3;
    for (let k = 0; k < 2; k++) { ctx.beginPath(); for (let y = 0; y < 220; y += 6) ctx.lineTo(x + Math.sin(y * .04 + t * 1.2 + k * 2) * (8 + y * .12), top - 14 - y); ctx.stroke(); }
  } else {
    ctx.save(); ctx.translate(x + 1, top - 12); ctx.scale(1 / fl, fl);
    ctx.fillStyle = 'rgba(255,190,90,.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-16, -14, -9, -44, 0, -64); ctx.bezierCurveTo(9, -44, 16, -14, 0, 0); ctx.fill();
    ctx.fillStyle = '#fff3cf'; ctx.beginPath(); ctx.moveTo(0, -2); ctx.bezierCurveTo(-7, -10, -4, -26, 0, -36); ctx.bezierCurveTo(4, -26, 7, -10, 0, -2); ctx.fill();
    ctx.restore();
  }
  shade(ctx, w, h, p.shade);
}
/* --- yağmur --- */
function rainScene(ctx, w, h, t, st, p) {
  lin(ctx, w, h, p.bg);
  clouds(ctx, st, w, h, t, 9, -40, h * .28, p.cloud, .3, 4, 5);
  falling(ctx, st, w, h, t, { n: p.n || 230, kind: 'drop', colors: [p.drop], speed: 520, sway: 0, drift: -60, alpha: .5 });
  const gy = h - 56; ctx.fillStyle = p.ground; ctx.fillRect(0, gy, w, 56);
  pts(st, 'rp', 18, 5, r => [r() * w, gy + 8 + r() * 40, r()]).forEach(([x, y, ph]) => { const k = (t * .8 + ph) % 1; ctx.strokeStyle = `rgba(210,225,235,${.5 * (1 - k)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 4 + k * 26, (4 + k * 26) * .25, 0, 0, TAU); ctx.stroke(); });
  if (p.sprouts) pts(st, 'spr', 26, 8, r => [r() * w, gy + 4 + r() * 10, .6 + r() * .6]).forEach(([x, y, s]) => { const sw = Math.sin(t * 1.4 + x) * 2; ctx.strokeStyle = '#6f9a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 16 * s); ctx.stroke(); ctx.fillStyle = '#7fae55'; ctx.beginPath(); ctx.ellipse(x + sw - 5, y - 15 * s, 6 * s, 2.6 * s, -.5, 0, TAU); ctx.ellipse(x + sw + 5, y - 17 * s, 6 * s, 2.6 * s, .5, 0, TAU); ctx.fill(); });
}
/* --- tarla (başak, lale) --- */
function fieldScene(ctx, w, h, t, st, p) {
  lin(ctx, w, h, p.sky);
  if (p.sun) glow(ctx, w * p.sun[0], h * p.sun[1], p.sun[2], p.sun[3], p.sun[4]);
  hills(ctx, w, h, h * .6, 18, 220, 2, p.far);
  ctx.fillStyle = p.soil; ctx.fillRect(0, h * .6, w, h * .4);
  for (let d = 0; d < 4; d++) {
    const y0 = h * (.64 + d * .1), s = .55 + d * .32, n = 70 - d * 12;
    pts(st, 'fd' + d, n, 31 + d, r => [r() * w, r() * 14, r(), r()]).forEach(([x, dy, a, b]) => {
      const y = y0 + dy, hh = (40 + a * 30) * s, sw = Math.sin(t * 1.2 + x * .012 + d) * 6 * s, tx = x + sw, ty = y - hh;
      ctx.strokeStyle = p.kind === 'basak' ? '#a8823e' : '#4d7a3a'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x, y - hh * .5, tx, ty); ctx.stroke();
      if (p.kind === 'basak') { ctx.fillStyle = b > .5 ? '#d9a74a' : '#c8923a'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(tx + (k % 2 ? 2.4 : -2.4) * s, ty + k * 3.4 * s, 2.6 * s, 4.2 * s, k % 2 ? .4 : -.4, 0, TAU); ctx.fill(); } }
      else { ctx.fillStyle = ['#c8303a', '#e0566a', '#f0b23a', '#b02060'][Math.floor(b * 4)]; ctx.beginPath(); ctx.moveTo(tx - 6 * s, ty - 2 * s); ctx.quadraticCurveTo(tx - 7 * s, ty - 14 * s, tx - 3 * s, ty - 16 * s); ctx.lineTo(tx, ty - 11 * s); ctx.lineTo(tx + 3 * s, ty - 16 * s); ctx.quadraticCurveTo(tx + 7 * s, ty - 14 * s, tx + 6 * s, ty - 2 * s); ctx.quadraticCurveTo(tx, ty + 3 * s, tx - 6 * s, ty - 2 * s); ctx.fill(); ctx.fillStyle = '#5f8f45'; ctx.beginPath(); ctx.ellipse(x + 4 * s, y - hh * .35, 3 * s, 10 * s, .4, 0, TAU); ctx.fill(); }
    });
  }
  if (p.fall) falling(ctx, st, w, h, t, p.fall);
}
/* --- toprak altında filiz --- */
function sproutScene(ctx, w, h, t, st) {
  const gy = h * .58, x0 = w * .74;
  lin(ctx, w, gy, ['#121a2c', '#26304a', '#4a4560']);
  drawStars(ctx, st, w, gy, t, 90, .9, 21);
  glow(ctx, w * .5, gy, 520, '255,190,140', .22);
  const sg = ctx.createLinearGradient(0, gy, 0, h); sg.addColorStop(0, '#4a3220'); sg.addColorStop(1, '#22160c'); ctx.fillStyle = sg; ctx.fillRect(0, gy, w, h - gy);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { ctx.beginPath(); for (let x = 0; x <= w; x += 30) ctx.lineTo(x, gy + i * 50 + Math.sin(x / 90 + i) * 6); ctx.stroke(); }
  pts(st, 'pb', 30, 13, r => [r() * w, gy + 20 + r() * (h - gy - 30), 3 + r() * 9]).forEach(([x, y, s]) => { ctx.fillStyle = 'rgba(120,95,70,.55)'; ctx.beginPath(); ctx.ellipse(x, y, s * 1.4, s, 0, 0, TAU); ctx.fill(); });
  const sy = h * .8;
  ctx.strokeStyle = 'rgba(214,190,150,.75)'; ctx.lineWidth = 1.6;
  pts(st, 'rt', 7, 19, r => [(r() - .5) * 120, 40 + r() * 70, (r() - .5) * 60]).forEach(([dx, dy, cx]) => { ctx.beginPath(); ctx.moveTo(x0, sy); ctx.quadraticCurveTo(x0 + cx, sy + dy * .5, x0 + dx, sy + dy); ctx.stroke(); });
  ctx.fillStyle = '#8a5a32'; ctx.beginPath(); ctx.ellipse(x0, sy, 18, 11, -.3, 0, TAU); ctx.fill();
  const sw = Math.sin(t * 1.2) * 4, tipY = gy - 90;
  glow(ctx, x0 + sw, tipY, 120, '200,240,160', .18);
  ctx.strokeStyle = '#7fae55'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, sy - 8); ctx.bezierCurveTo(x0 - 18, sy - 70, x0 + 14, gy + 10, x0 + sw, tipY); ctx.stroke();
  ctx.fillStyle = '#8fc060'; ctx.beginPath(); ctx.ellipse(x0 + sw - 22, tipY + 4, 24, 10, -.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x0 + sw + 22, tipY - 2, 24, 10, .5, 0, TAU); ctx.fill();
  shade(ctx, w, h, ['l', '14,18,30', .8]);
}
/* --- nehir --- */
function riverScene(ctx, w, h, t, st) {
  const hz = h * .46;
  lin(ctx, w, h, ['#f3c98b', '#f7dfb5', '#fbeedb'], 0, hz);
  glow(ctx, w * .58, hz, 420, '255,236,190', .7);
  hills(ctx, w, h, hz + 10, 22, 260, 3, '#9a8a6a'); hills(ctx, w, h, hz + 30, 18, 180, 5, '#7d8a55');
  const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#8a9a5a'); g.addColorStop(1, '#4f6a34'); ctx.fillStyle = g; ctx.fillRect(0, hz + 30, w, h);
  const cx = y => w * (.58 + .16 * Math.sin((y - hz) / (h - hz) * 4.2)) , wd = y => 6 + Math.pow((y - hz) / (h - hz), 1.5) * 420;
  ctx.fillStyle = '#c7dde0'; ctx.beginPath();
  for (let y = hz + 30; y <= h; y += 8) ctx.lineTo(cx(y) - wd(y) / 2, y);
  for (let y = h; y >= hz + 30; y -= 8) ctx.lineTo(cx(y) + wd(y) / 2, y);
  ctx.fill();
  for (let i = 0; i < 40; i++) { const k = ((i / 40) + t * .04) % 1, y = hz + 30 + k * k * (h - hz - 30), ww = wd(y) * .6; ctx.fillStyle = `rgba(255,250,235,${.5 * k})`; ctx.fillRect(cx(y) - ww / 2 + Math.sin(i * 3.1) * ww * .3, y, ww * .3, 1.5 + k * 2); }
  birds(ctx, st, w, h * .9, t, 5, 9, 'rgba(70,50,30,.6)');
}
/* --- kum saati --- */
function hourglassScene(ctx, w, h, t) {
  rad(ctx, w, h, ['#2a2030', '#120d18', '#07050a'], .74, .5, .8);
  const cx = w * .74, cy = h * .5, H = 240, W = 120, ph = (t % 40) / 40;
  glow(ctx, cx, cy, 300, '255,200,130', .12);
  const bulb = s => { ctx.beginPath(); ctx.moveTo(cx - W, cy - H * s); ctx.bezierCurveTo(cx - W, cy - H * .4 * s, cx - 8, cy - 30 * s, cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.bezierCurveTo(cx + 8, cy - 30 * s, cx + W, cy - H * .4 * s, cx + W, cy - H * s); ctx.closePath(); };
  ctx.save(); bulb(1); ctx.clip(); ctx.fillStyle = '#d9a75a'; const top = cy - H * (.15 + .7 * (1 - ph)); ctx.fillRect(cx - W, cy - H + (H - (cy - top)) + 0, W * 2, cy - top); ctx.restore();
  ctx.save(); bulb(-1); ctx.clip(); ctx.fillStyle = '#d9a75a'; const ph2 = .1 + .75 * ph; ctx.beginPath(); ctx.moveTo(cx - W, cy + H); ctx.lineTo(cx - W, cy + H - H * ph2 * .5); ctx.quadraticCurveTo(cx, cy + H - H * ph2 * 1.1, cx + W, cy + H - H * ph2 * .5); ctx.lineTo(cx + W, cy + H); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(230,240,255,.45)'; ctx.lineWidth = 2.5; bulb(1); ctx.stroke(); bulb(-1); ctx.stroke();
  ctx.fillStyle = '#d9a75a'; ctx.fillRect(cx - 1, cy, 2, H * .9);
  for (let i = 0; i < 14; i++) { const k = ((t * 1.6 + i / 14) % 1); ctx.fillRect(cx - 1.5 + Math.sin(i) * 1.5, cy + k * H * .85, 3, 3); }
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(cx - W - 24, cy - H - 22, (W + 24) * 2, 22); ctx.fillRect(cx - W - 24, cy + H, (W + 24) * 2, 22);
  ctx.fillStyle = '#7a5232'; ctx.fillRect(cx - W - 20, cy - H - 22, 10, H * 2 + 44); ctx.fillRect(cx + W + 10, cy - H - 22, 10, H * 2 + 44);
  shade(ctx, w, h, ['l', '12,8,16', .8]);
}
/* --- kâinat --- */
function cosmosScene(ctx, w, h, t, st, p) {
  ctx.fillStyle = '#04050b'; ctx.fillRect(0, 0, w, h);
  drawStars(ctx, st, w, h, t, 260, 1, 41, '220,225,255');
  const cx = w * p.x, cy = h * .48;
  glow(ctx, cx, cy, 340, '255,210,170', .22); glow(ctx, cx, cy, 90, '255,240,220', .6);
  const G = pts(st, 'gx', 1100, 51, r => { const arm = Math.floor(r() * 3), d = Math.pow(r(), .7); return [arm * TAU / 3 + d * 4.2 + (r() - .5) * .5, d * 300, r()]; });
  const rot = t * .03;
  G.forEach(([a, d, q]) => { const A = a + rot, x = cx + Math.cos(A) * d, y = cy + Math.sin(A) * d * .42; ctx.fillStyle = d < 90 ? `rgba(255,220,180,${.5 + q * .4})` : `rgba(${160 + q * 60 | 0},${180 + q * 50 | 0},255,${.25 + q * .45})`; ctx.fillRect(x, y, 1.6, 1.6); });
  const pl = (x, y, r, c1, c2, ring) => { const g = ctx.createRadialGradient(x - r * .4, y - r * .4, r * .1, x, y, r); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); if (ring) { ctx.strokeStyle = 'rgba(230,210,170,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, r * 1.8, r * .45, -.3, 0, TAU); ctx.stroke(); } };
  pl(w * .12, h * .86, 46, '#c98a5a', '#3a1f12', true); pl(w * .9, h * .14, 18, '#9fc0e8', '#1a2a48');
  shade(ctx, w, h, p.shade);
}
/* --- kabarcıklar (güneşi yansıtan) --- */
function bubbleScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0f4a5a', '#0a2c38', '#051820']);
  glow(ctx, w * .5, -60, 620, '255,236,190', .5);
  ctx.save(); ctx.translate(w * .5, -60); for (let i = 0; i < 9; i++) { const a = 1.0 + i * .13 + Math.sin(t * .3 + i) * .02; ctx.fillStyle = `rgba(255,240,200,${.05 + .03 * Math.sin(t * .7 + i)})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 1600, Math.sin(a) * 1600); ctx.lineTo(Math.cos(a + .05) * 1600, Math.sin(a + .05) * 1600); ctx.fill(); } ctx.restore();
  pts(st, 'bb', 46, 61, r => [r() * w, r() * h, 6 + Math.pow(r(), 2) * 30, 14 + r() * 26, r() * 6]).forEach(([x, y0, R, sp, ph]) => {
    let y = (y0 - t * sp) % (h + 80); if (y < -40) y += h + 80;
    const X = x + Math.sin(t * .9 + ph) * 10;
    ctx.strokeStyle = 'rgba(200,240,255,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, y, R, 0, TAU); ctx.stroke();
    const g = ctx.createRadialGradient(X, y, R * .2, X, y, R); g.addColorStop(0, 'rgba(160,220,240,0)'); g.addColorStop(1, 'rgba(160,220,240,.18)'); ctx.fillStyle = g; ctx.fill();
    glow(ctx, X + R * .35, y - R * .4, R * .9, '255,240,200', .55); ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(X + R * .35, y - R * .4, Math.max(1.2, R * .12), 0, TAU); ctx.fill();
  });
}
/* --- ateş --- */
function fireScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#0b0503'; ctx.fillRect(0, 0, w, h);
  glow(ctx, w / 2, h + 40, 760, '255,90,20', .38);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) {
    const x = (i / 45) * w, hh = 120 + 90 * (.5 + .5 * Math.sin(t * 2.2 + i * 1.7)) + 60 * Math.sin(t * 3.1 + i * .7);
    const g = ctx.createLinearGradient(0, h, 0, h - hh); g.addColorStop(0, 'rgba(255,120,30,.35)'); g.addColorStop(.6, 'rgba(255,70,20,.15)'); g.addColorStop(1, 'rgba(255,40,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 28, h); ctx.quadraticCurveTo(x - 10 + Math.sin(t * 3 + i) * 14, h - hh * .6, x + Math.sin(t * 2 + i) * 20, h - hh); ctx.quadraticCurveTo(x + 14, h - hh * .5, x + 28, h); ctx.fill();
  }
  ctx.restore();
  falling(ctx, st, w, h, t, { n: 70, kind: 'dot', colors: ['#ffb060', '#ff7a30'], speed: 60, up: true, size: 1.8, sway: 22, alpha: .8, fade: true });
}
/* --- yol --- */
function roadScene(ctx, w, h, t, st, p) {
  const hz = h * .52;
  lin(ctx, w, hz, ['#1d1a33', '#5a3a52', '#d9875a', '#f2b56e'], 0, hz);
  glow(ctx, w * .5, hz, 480, '255,200,130', .55);
  drawStars(ctx, st, w, hz, t, 60, .6, 33);
  const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#3a2c2a'); g.addColorStop(1, '#120c0c'); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
  ctx.strokeStyle = 'rgba(255,200,140,.08)'; ctx.lineWidth = 1; for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(w * .5 + i * 6, hz); ctx.lineTo(w * .5 + i * 120, h); ctx.stroke(); }
  const road = (x0, x1) => { ctx.fillStyle = '#2a2224'; ctx.beginPath(); ctx.moveTo(x0 - 3, hz); ctx.lineTo(x0 + 3, hz); ctx.lineTo(x1 + 260, h); ctx.lineTo(x1 - 260, h); ctx.fill(); };
  if (p.fork) {
    const fy = hz + (h - hz) * .42, fx = w * .5;
    ctx.fillStyle = '#2a2224';
    [[w * .3], [w * .7]].forEach(([tx]) => { ctx.beginPath(); ctx.moveTo(tx - 3, hz); ctx.lineTo(tx + 3, hz); ctx.lineTo(fx + 70, fy); ctx.lineTo(fx - 70, fy); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(fx - 70, fy); ctx.lineTo(fx + 70, fy); ctx.lineTo(fx + 260, h); ctx.lineTo(fx - 260, h); ctx.fill();
    glow(ctx, w * .3, hz, 140, '255,220,150', .5); glow(ctx, w * .7, hz, 140, '160,180,220', .35);
  } else road(w * .5, w * .5);
  ctx.fillStyle = 'rgba(255,230,180,.75)';
  for (let k = 0; k < 14; k++) { const z = ((k / 14) + t * .08) % 1, y = hz + (h - hz) * z * z, y2 = hz + (h - hz) * Math.min(1, (z + .025) * (z + .025)); if (p.fork && y < hz + (h - hz) * .42) continue; ctx.fillRect(w * .5 - 1 - z * 4, y, 2 + z * 8, y2 - y); }
}
/* --- kitap --- */
function bookScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#3a2614', '#1a1008', '#0a0603'], .74, .6, .8);
  const cx = w * .8, cy = h * .7;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(.8, .8); ctx.translate(-cx, -cy);
  glow(ctx, cx, cy - 80, 360, '255,205,130', .35 + .04 * Math.sin(t));
  ctx.fillStyle = '#4a2414'; ctx.beginPath(); ctx.moveTo(cx - 250, cy + 30); ctx.quadraticCurveTo(cx - 120, cy + 10, cx, cy + 46); ctx.quadraticCurveTo(cx + 120, cy + 10, cx + 250, cy + 30); ctx.lineTo(cx + 244, cy + 48); ctx.quadraticCurveTo(cx + 120, cy + 28, cx, cy + 62); ctx.quadraticCurveTo(cx - 120, cy + 28, cx - 244, cy + 48); ctx.fill();
  const page = s => { ctx.beginPath(); ctx.moveTo(cx, cy + 40); ctx.quadraticCurveTo(cx + s * 110, cy - 10, cx + s * 236, cy + 20); ctx.lineTo(cx + s * 236, cy - 120); ctx.quadraticCurveTo(cx + s * 110, cy - 150, cx, cy - 104); ctx.closePath(); };
  [-1, 1].forEach(s => { const g = ctx.createLinearGradient(cx, 0, cx + s * 236, 0); g.addColorStop(0, '#cdb894'); g.addColorStop(.2, '#f2e6c8'); g.addColorStop(1, '#e8d8b4'); ctx.fillStyle = g; page(s); ctx.fill(); });
  ctx.strokeStyle = 'rgba(120,90,50,.4)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 9; i++) [-1, 1].forEach(s => { const y = cy - 92 + i * 14; ctx.beginPath(); ctx.moveTo(cx + s * 30, y + 6 - i * .2); ctx.quadraticCurveTo(cx + s * 120, y - 4, cx + s * 210, y + 6); ctx.stroke(); });
  ctx.restore();
  falling(ctx, st, w, h, t, { n: 50, kind: 'dot', colors: ['#ffd88a'], speed: 26, up: true, size: 1.8, sway: 30, alpha: .7, fade: true, area: [.66, .94] });
  shade(ctx, w, h, ['l', '10,6,3', .82]);
}
/* --- damla ve halkalar --- */
function dropScene(ctx, w, h, t, st) {
  const sy = h * .72, x = w * .74, per = 3.4, ph = (t % per) / per;
  lin(ctx, w, sy, ['#08131f', '#0f2436', '#173852'], 0, sy);
  const g = ctx.createLinearGradient(0, sy, 0, h); g.addColorStop(0, '#1d4560'); g.addColorStop(1, '#081420'); ctx.fillStyle = g; ctx.fillRect(0, sy, w, h - sy);
  glow(ctx, x, sy, 320, '170,215,240', .16);
  if (ph < .45) { const k = ph / .45, y = -30 + (sy + 30) * k * k; glow(ctx, x, y, 40, '200,235,255', .5); ctx.fillStyle = '#d6efff'; ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.bezierCurveTo(x - 12, y - 4, x - 10, y + 10, x, y + 10); ctx.bezierCurveTo(x + 10, y + 10, x + 12, y - 4, x, y - 22); ctx.fill(); }
  for (let j = 0; j < 4; j++) { const k = ((ph - .45 + 1) % 1) + j * .25, kk = k % 1.0; const rr = 10 + kk * 330; ctx.strokeStyle = `rgba(200,235,255,${.55 * (1 - kk)})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, sy + 4, rr, rr * .18, 0, 0, TAU); ctx.stroke(); }
  shade(ctx, w, h, ['l', '8,19,31', .8]);
}
/* --- toprak (kuru / yeşil) --- */
function groundScene(ctx, w, h, t, st, p) {
  lin(ctx, w, h, p.sky);
  if (p.sun) glow(ctx, w * p.sun[0], h * p.sun[1], p.sun[2], p.sun[3], p.sun[4]);
  if (p.clouds) clouds(ctx, st, w, h, t, 5, -20, h * .25, p.clouds, .35, 7, 5);
  const gy = h * .62, g = ctx.createLinearGradient(0, gy, 0, h); g.addColorStop(0, p.soil[0]); g.addColorStop(1, p.soil[1]); ctx.fillStyle = g; ctx.fillRect(0, gy, w, h - gy);
  if (p.cracks) {
    const C = st.cr || (st.cr = (() => { const r = srng(17), a = []; for (let i = 0; i < 30; i++) { let x = r() * w, y = gy + 14 + r() * (h - gy - 20); const s = [[x, y]]; for (let j = 0; j < 5; j++) { x += (r() - .5) * 70; y += (r() - .3) * 24; s.push([x, y]); } a.push(s); } return a; })());
    ctx.strokeStyle = 'rgba(80,45,15,.5)'; ctx.lineWidth = 1.5; C.forEach(s => { ctx.beginPath(); s.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); });
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2; [[.3, .7], [.62, .8]].forEach(([a, b]) => { const x = w * a, y = h * b; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 40); ctx.moveTo(x + 2, y - 20); ctx.lineTo(x - 12, y - 30); ctx.moveTo(x + 3, y - 30); ctx.lineTo(x + 14, y - 42); ctx.stroke(); });
  }
  if (p.sprouts) pts(st, 'gs', 46, 23, r => [r() * w, gy + 8 + r() * (h - gy - 14), .7 + r() * .9]).sort((a, b) => a[1] - b[1]).forEach(([x, y, s]) => { const sw = Math.sin(t * 1.4 + x) * 2; ctx.strokeStyle = '#4f7a30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 18 * s); ctx.stroke(); ctx.fillStyle = '#86b85a'; ctx.beginPath(); ctx.ellipse(x + sw - 6 * s, y - 17 * s, 7 * s, 3 * s, -.5, 0, TAU); ctx.ellipse(x + sw + 6 * s, y - 19 * s, 7 * s, 3 * s, .5, 0, TAU); ctx.fill(); });
  if (p.rain) falling(ctx, st, w, h * .65, t, { n: 60, kind: 'drop', colors: ['rgba(255,255,255,.8)'], speed: 420, sway: 0, alpha: .5 });
}
/* --- kandil (zemin; kandil SVG katmanı ayrıca eklenir) --- */
function kandilScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#3a2412', '#1a110a', '#0b0805'], .5, .4, .7);
  glow(ctx, w / 2, 150, 300 + 20 * Math.sin(t * 1.2), '255,180,80', .22);
  falling(ctx, st, w, h, t, { n: 45, kind: 'dot', colors: ['#ffbe6a'], speed: 22, up: true, size: 1.4, sway: 18, alpha: .6, fade: true, area: [.38, .62] });
}
/* --- yaprak dökümü --- */
function leavesScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#4a2a16', '#24140a', '#0e0804'], .5, .3, .9);
  glow(ctx, w * .3, h * .1, 400, '255,170,90', .15);
  falling(ctx, st, w, h, t, { n: 46, kind: 'leaf', colors: ['#c8642a', '#e09a3a', '#a8401f', '#d9b24a'], speed: 36, size: 7, sway: 40, drift: 14, alpha: .85 });
}
/* --- iş sahneleri --- */
function netScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#0d141f'; ctx.fillRect(0, 0, w, h);
  const N = pts(st, 'n', 46, 21, r => [r() * w, r() * h, (r() - .5) * 12, (r() - .5) * 12]);
  const P = N.map(([x, y, vx, vy]) => [((x + vx * t) % w + w) % w, ((y + vy * t) % h + h) % h]);
  ctx.lineWidth = 1;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d < 170) { ctx.strokeStyle = `rgba(120,170,220,${(1 - d / 170) * .25})`; ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke(); } }
  ctx.fillStyle = 'rgba(233,176,79,.8)'; P.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, TAU); ctx.fill(); });
  shade(ctx, w, h, ['l', '13,20,31', .85]);
}
function horizonScene(ctx, w, h, t) {
  lin(ctx, w, h, ['#0b1220', '#16223a', '#2a2f45']);
  glow(ctx, w * .7, h, w * .6, '233,176,79', .35 + .06 * Math.sin(t * .6));
  ctx.strokeStyle = 'rgba(160,190,230,.08)'; ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) { const y = h * .62 + Math.pow(i / 18, 2) * h * .4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(w * .5 + i * 30, h * .62); ctx.lineTo(w * .5 + i * 160, h); ctx.stroke(); }
}
function runwayScene(ctx, w, h, t, st) {
  const hz = h * .5;
  lin(ctx, w, hz, ['#050913', '#0d1830', '#1d2a4a'], 0, hz);
  drawStars(ctx, st, w, hz, t, 120, .9, 77);
  glow(ctx, w * .5, hz, 420, '120,150,220', .25);
  ctx.fillStyle = '#05070c'; ctx.fillRect(0, hz, w, h - hz);
  const cx = w * .5, P = z => hz + (h - hz) * z;
  for (let k = 0; k < 26; k++) { const z = Math.pow(k / 26, 2), y = P(z), half = 8 + z * 520, s = 1 + z * 3;
    ctx.fillStyle = 'rgba(255,230,170,.9)'; ctx.beginPath(); ctx.arc(cx - half, y, s, 0, TAU); ctx.arc(cx + half, y, s, 0, TAU); ctx.fill(); glow(ctx, cx - half, y, s * 6, '255,220,150', .25); glow(ctx, cx + half, y, s * 6, '255,220,150', .25);
    if (k % 2) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(cx - s * .6, y, s * 1.2, s * 4); } }
  const ph = (t * .7) % 1;
  for (let k = 0; k < 6; k++) { const z = Math.pow(1 - ((ph + k / 6) % 1), 2), y = P(z), s = 2 + z * 4; glow(ctx, cx, y, s * 10, '190,220,255', .5 * (1 - z * .3)); }
  glow(ctx, w * .82, hz - 4, 120, '255,180,110', .25);
}
function aboveCloudsScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#122a52', '#3c5a8a', '#d9a27a', '#f2c590']);
  glow(ctx, w * .72, h * .62, 320, '255,236,190', .8);
  for (let L = 0; L < 3; L++) pts(st, 'ac' + L, 18, 70 + L, r => [r() * (w + 400), r()]).forEach(([x, k]) => { const xx = ((x + t * (6 + L * 4)) % (w + 400)) - 200, y = h * (.68 + L * .1) + Math.sin(k * 9) * 14; glow(ctx, xx, y, 120 + L * 40 + k * 60, L === 2 ? '255,245,235' : '250,225,215', .55); });
}
function barsScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0b1324', '#101a30']);
  ctx.strokeStyle = 'rgba(160,190,230,.08)'; ctx.lineWidth = 1; for (let y = 80; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const B = pts(st, 'b', 18, 5, r => r()); const n = B.length, bw = w / n;
  let prev = null;
  B.forEach((v, i) => { const hh = (.15 + (i / n) * .6 + v * .15) * h * (.95 + .05 * Math.sin(t + i)); ctx.fillStyle = `rgba(233,176,79,${.06 + i / n * .14})`; ctx.fillRect(i * bw + 8, h - hh, bw - 16, hh); const p = [i * bw + bw / 2, h - hh]; if (prev) { ctx.strokeStyle = 'rgba(143,192,216,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); } prev = p; });
  glow(ctx, prev[0], prev[1], 40, '233,176,79', .7);
}
function linesScene(ctx, w, h, t) {
  lin(ctx, w, h, ['#0a1020', '#0f1a30', '#131a2c']);
  for (let i = 0; i < 46; i++) { const k = i / 46; ctx.strokeStyle = `rgba(${Math.round(110 + k * 123)},${Math.round(160 + k * 16)},${Math.round(230 - k * 151)},.16)`; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = 0; x <= w; x += 16) ctx.lineTo(x, h * .55 + Math.sin(x / 220 + t * .4 + k * 2.2) * 90 * (1 - k * .4) + Math.sin(x / 90 + t * .7 + k * 5) * 18 + (k - .5) * 160); ctx.stroke(); }
}
function cityScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#1a1530', '#4a2c52', '#c2664a', '#f0a868']);
  glow(ctx, w * .3, h * .66, 260, '255,200,140', .6);
  skyline(ctx, st, w, h, h * .98, '#0e0c18', 91, true);
}
function globeScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#0f1a33', '#070c18'], .74, .5, .8);
  const cx = w * .8, cy = h * .5, R = 200;
  glow(ctx, cx, cy, R * 1.3, '90,140,220', .18);
  const P = pts(st, 'g', 900, 3, () => 0).map((_, i, a) => { const y = 1 - (i / (a.length - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; return [Math.cos(th) * r, y, Math.sin(th) * r]; });
  const rot = t * .15;
  P.forEach(([x, y, z]) => { const X = x * Math.cos(rot) + z * Math.sin(rot), Z = -x * Math.sin(rot) + z * Math.cos(rot); const a = Z > 0 ? .4 + Z * .6 : .12; ctx.fillStyle = `rgba(${Z > 0 ? '240,200,120' : '120,160,220'},${a})`; ctx.fillRect(cx + X * R, cy + y * R, 2.6, 2.6); });
  ctx.strokeStyle = 'rgba(233,176,79,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.35, R * .32, -.35, 0, TAU); ctx.stroke();
  shade(ctx, w, h, ['l', '7,12,24', .85]);
}
function blobsScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#0b0f1c'; ctx.fillRect(0, 0, w, h);
  [['40,90,160', .5, .3, 520], ['20,140,140', .2, .7, 480], ['233,176,79', .8, .75, 420], ['110,60,150', .7, .2, 460], ['40,120,200', .4, .9, 380]].forEach(([c, x, y, r], i) => glow(ctx, w * x + Math.sin(t * .2 + i) * 120, h * y + Math.cos(t * .17 + i * 2) * 80, r, c, .35));
}

/* --- terazi (mizan) --- */
function mizanScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#2a2030', '#141020', '#08060c'], .76, .45, .85);
  const cx = w * .8, top = h * .2, base = h * .86, ang = Math.sin(t * .5) * .06, L = 160, gold = '#d6b46a';
  glow(ctx, cx, top + 40, 380, '214,180,106', .16 + .04 * Math.sin(t * .7));
  ctx.strokeStyle = gold; ctx.fillStyle = gold; ctx.lineCap = 'round';
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, base - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 90, base); ctx.quadraticCurveTo(cx, base - 40, cx + 90, base); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, top - 10, 12, 0, TAU); ctx.fill();
  const ex = Math.cos(ang) * L, ey = Math.sin(ang) * L;
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - ex, top + 10 - ey); ctx.lineTo(cx + ex, top + 10 + ey); ctx.stroke();
  [[-1, -ey], [1, ey]].forEach(([sg, dy]) => {
    const px = cx + sg * ex, py = top + 10 + dy, pb = py + 190;
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 56, pb); ctx.moveTo(px, py); ctx.lineTo(px + 56, pb); ctx.stroke();
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(px - 68, pb); ctx.quadraticCurveTo(px, pb + 50, px + 68, pb); ctx.closePath(); ctx.fill();
    glow(ctx, px, pb + 10, 90, '255,220,150', .18);
  });
  falling(ctx, st, w, h, t, { n: 40, kind: 'dot', colors: ['#e8c878'], speed: 14, up: true, size: 1.4, alpha: .45, area: [.5, 1] });
  shade(ctx, w, h, ['l', '16,12,22', .85]);
}
/* --- sarmal (DNA): hıfz, program, kayıt --- */
function helixScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#0f2430', '#08141c', '#03080c'], .76, .5, .85);
  drawStars(ctx, st, w, h, t, 120, 1, 61, '200,230,255');
  const cx = w * .77, A = 120, k = .021, ph = t * .8;
  glow(ctx, cx, h / 2, 360, '120,200,220', .14);
  for (let y = -20; y < h + 20; y += 9) {
    const a = y * k + ph, x1 = cx + Math.sin(a) * A, x2 = cx + Math.sin(a + Math.PI) * A, z1 = Math.cos(a), z2 = -z1;
    if (Math.round(y / 9) % 3 === 0) { ctx.strokeStyle = `rgba(200,230,240,${.12 + .1 * Math.abs(z1)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); }
    [[x1, z1, '233,190,110'], [x2, z2, '120,210,225']].forEach(([x, z, c]) => { const r = 3.2 + 2.2 * (z + 1) / 2; ctx.fillStyle = `rgba(${c},${.3 + .65 * (z + 1) / 2})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
  }
  shade(ctx, w, h, ['l', '6,14,20', .85]);
}

/* --- yardımcı: iki hâl --- */
const split = (L, R) => (ctx, w, h, t, st) => {
  const hw = w / 2; st.l = st.l || {}; st.r = st.r || {};
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, hw, h); ctx.clip(); L(ctx, hw, h, t, st.l); ctx.restore();
  ctx.save(); ctx.translate(hw, 0); ctx.beginPath(); ctx.rect(0, 0, hw, h); ctx.clip(); R(ctx, hw, h, t, st.r); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(hw - 1, 0, 2, h);
};
const M = (fn, p) => (ctx, w, h, t, st) => fn(ctx, w, h, t, st, p || {});
const SH_L_DARK = rgb => ['l', rgb, .85], SH_L_LIGHT = rgb => ['l', rgb, .88];
const INK_LIGHT = '--s-ink:#2a1c10;--s-muted:#5b4128;--s-accent:#a3601e;--s-line:rgba(163,96,30,.3)';
const INK_COOL = '--s-ink:#1d2b40;--s-muted:#3d5470;--s-accent:#a9572a;--s-line:rgba(29,43,64,.25)';
const INK_GREEN = '--s-ink:#1f2a17;--s-muted:#44543a;--s-accent:#9a5a1e;--s-line:rgba(31,42,23,.25)';

/* pos: r = görsel sağda, yazı solda · l = tersi · b = görsel altta · t = görsel üstte · c = ortada (perde) · n = her yer · split = iki hâl · theme = kâğıt
   fam: aynı aileden sahneler art arda gelmesin */
const SCENES = {
  kagit: { name: 'Kâğıt', fam: 'kagit', modes: ['dini', 'is'], tone: 'theme', pos: 'theme', tags: ['madde', 'liste', 'metin'], aff: { bullets: 2, alinti: 1, kpi: 2, timeline: 2 } },
  safak: { name: 'Şafak', fam: 'gok', modes: ['dini'], tone: 'dark', pos: 'n', hat: 1, tags: ['şafak', 'sabah', 'başlangıç', 'doğuş', 'umut', 'uyan', 'yeni', 'fecr', 'diriliş'], aff: { cover: 3 },
    draw: M(landScene, { sky: ['#070d1c', '#1c1d36', '#5a3446', '#c46f3d', '#f0b06a'], stars: 170, starTop: .62, sun: [.5, 1.02, 60, '255,214,140', 1], layers: [['hill', .92, 24, 170, 1, '#120c14']] }) },
  seher: { name: 'Seher', fam: 'gok', modes: ['dini'], tone: 'dark', pos: 'n', hat: 1, tags: ['seher', 'teheccüd', 'sabah namaz', 'istiğfar', 'sessiz', 'gece yarısı', 'uyanış'], aff: { cover: 2, closing: 1 },
    draw: M(landScene, { sky: ['#0b1430', '#24305a', '#7a6a8f', '#d9a9a0'], stars: 120, starTop: .55, moon: [.16, .2, 22], cut: '#0f1838', layers: [['hill', .9, 30, 220, 3, '#1b1a2c'], ['hill', .96, 18, 120, 5, '#100f1c']] }) },
  gunbatimi: { name: 'Gün batımı', fam: 'gok', modes: ['dini', 'is'], tone: 'dark', pos: 'n', hat: 1, tags: ['akşam', 'gurub', 'batış', 'veda', 'zeval', 'son', 'kapanış', 'ihtiyarlık', 'teşekkür'], aff: { closing: 2 },
    draw: M(landScene, { sky: ['#2a1b3d', '#7a2f4a', '#d4573a', '#f2a65a'], sun: [.62, .8, 48, '255,190,110', 1], disk: true, birds: 4, birdCol: 'rgba(30,10,20,.7)', layers: [['hill', .82, 26, 200, 2, '#3b1d2a'], ['hill', .9, 30, 140, 4, '#24121c'], ['hill', .97, 20, 90, 7, '#140a10']] }) },
  hilal: { name: 'Hilal gecesi', fam: 'gece', modes: ['dini'], tone: 'dark', pos: 'n', hat: 1, tags: ['gece', 'hilal', 'ay', 'karanlık', 'yalnız', 'ramazan', 'kadir', 'bayram'], aff: { section: 2 },
    draw: M(landScene, { sky: ['#0a1226', '#14203d', '#1d2c4f'], stars: 200, starTop: 1, moon: [.83, .2, 34], cut: '#0b1428', layers: [['hill', .96, 14, 240, 2, '#070b16']] }) },
  yildizli: { name: 'Yıldızlı gök', fam: 'gece', modes: ['dini'], tone: 'dark', pos: 'n', hat: 1, tags: ['yıldız', 'gök', 'sema', 'tefekkür', 'tesbih', 'sonsuz', 'semavat'], aff: { question: 2, section: 1 },
    draw: M(landScene, { sky: ['#03050c', '#0b1022', '#1a1d38'], stars: 340, starTop: 1, milky: true, layers: [['peak', .92, 90, 4, '#05060c']] }) },
  col: { name: 'Çöl', fam: 'col', modes: ['dini'], tone: 'light', pos: 'b', vars: INK_LIGHT, tags: ['çöl', 'kum', 'susuz', 'sıcak', 'kervan', 'hicret', 'misafir', 'yolcu', 'dünya misafirhane'], aff: { cover: 1, bigword: 1 },
    draw: M(landScene, { sky: ['#e7b06b', '#f2cf93', '#f8e6c2'], sun: [.8, .2, 40, '255,245,215', .9], disk: true, layers: [['hill', .72, 40, 300, 1, '#d79a55'], ['hill', .82, 50, 230, 3, '#c4813f'], ['hill', .94, 45, 180, 6, '#a8682f']] }) },
  colgece: { name: 'Çölde gece', fam: 'col', modes: ['dini'], tone: 'dark', pos: 'n', hat: 1, tags: ['çöl', 'gece', 'yolculuk', 'hicret', 'kervan', 'yalnızlık', 'misafir'], aff: { cover: 2, section: 1 },
    draw: M(landScene, { sky: ['#0b1022', '#1b1f3d', '#3a3352'], stars: 260, starTop: .8, moon: [.2, .18, 26], cut: '#0d1226', layers: [['hill', .76, 40, 300, 1, '#3d3256'], ['hill', .86, 46, 230, 3, '#2b2342'], ['hill', .96, 40, 180, 6, '#1a1428']] }) },
  dag: { name: 'Sabah dağları', fam: 'dag', modes: ['dini', 'is'], tone: 'light', pos: 'b', vars: INK_COOL, tags: ['dağ', 'zirve', 'yüksel', 'sabır', 'sebat', 'azim', 'hedef', 'başarı', 'tırman', 'metanet'], aff: { cover: 1, bigword: 1 },
    draw: M(landScene, { sky: ['#9cc3e0', '#d8e6ee', '#f6e8cf'], sun: [.3, .28, 36, '255,240,200', .8], layers: [['peak', .64, 120, 3, '#8aa1b8'], ['peak', .76, 110, 8, '#6a8199'], ['mist', .8, '255,255,255', .5], ['peak', .92, 90, 13, '#4a5d72']] }) },
  dagsis: { name: 'Sisli dağlar', fam: 'dag', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['sis', 'belirsiz', 'perde', 'gaflet', 'hüzün', 'sükût', 'derin'], aff: { section: 2, question: 1 },
    draw: M(landScene, { sky: ['#3b4a5c', '#6d7d8e', '#a7b2bd'], layers: [['peak', .62, 120, 21, '#56677a'], ['mist', .66, '220,228,236', .55], ['peak', .76, 110, 25, '#405062'], ['mist', .8, '220,228,236', .5], ['peak', .92, 90, 29, '#2b3846']] }) },
  karlidag: { name: 'Karlı dağlar', fam: 'dag', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['kar', 'kış', 'soğuk', 'temiz', 'safi', 'beyaz', 'arın'], aff: { bigword: 1 },
    draw: M(landScene, { sky: ['#1d3550', '#4f7393', '#b9cfe0'], layers: [['peak', .66, 150, 33, '#5a7088', 1], ['peak', .82, 110, 37, '#3d5068', 1], ['peak', .95, 70, 41, '#22303f']], fall: { n: 90, kind: 'snow', colors: ['#ffffff'], speed: 30, size: 2 } }) },
  denizaksam: { name: 'Akşam denizi', fam: 'deniz', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['deniz', 'engin', 'ufuk', 'derya', 'dalga', 'sahil', 'huzur', 'gemi'], aff: { closing: 1, bigword: 1 },
    draw: M(seaScene, { hz: .6, sky: ['#1e2f52', '#6b4f78', '#e08a5c', '#f6c27a'], light: [.5, .56, 30, '255,210,140', .9], water: ['#6a4a5c', '#2a2e4a', '#141a30'], wave: '#f6c9a0', amp: 2 }) },
  denizgece: { name: 'Gece denizi', fam: 'deniz', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['ay', 'deniz', 'gece', 'yansı', 'akis', 'sükût', 'sakin', 'ayna'], aff: { question: 1, closing: 1 },
    draw: M(seaScene, { hz: .58, sky: ['#050a18', '#0d1a33', '#1d3050'], stars: 180, light: [.72, .24, 26, '250,240,215', .7], water: ['#13233d', '#0a1528', '#050b16'], wave: '#c9d6e8', amp: 2 }) },
  firtina: { name: 'Fırtına', fam: 'deniz', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['fırtına', 'musibet', 'imtihan', 'bela', 'dert', 'sıkıntı', 'korku', 'dalga', 'hastalık', 'sabır'], aff: { question: 2 },
    draw: M(seaScene, { hz: .55, sky: ['#151a20', '#2a323b', '#47515c'], clouds: [10, -.05, .4, '20,24,30', .6, 14], water: ['#2c3742', '#1a232c', '#0d1318'], wave: '#9fb0bf', amp: 14, rain: true }) },
  sisagac: { name: 'Sis ve ağaç', fam: 'agac', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['ağaç', 'kış', 'kuru', 'gaflet', 'fark', 'dikkat', 'ölü', 'çıplak'], aff: { question: 3 },
    draw: M(treeScene, { bg: ['#5b6976', '#9aa6b0'], x: .76, len: 150, col: '#1b2229', season: 'ciplak', fog: '225,232,238', shade: ['l', '20,28,36', .85] }) },
  cicekliagac: { name: 'Çiçekli ağaç', fam: 'agac', modes: ['dini'], tone: 'light', pos: 'r', vars: INK_LIGHT, tags: ['bahar', 'çiçek', 'diriliş', 'haşir', 'ihya', 'yeniden', 'canlan', 'müjde'], aff: { bigword: 2 },
    draw: M(treeScene, { bg: ['#fbe9cf', '#f2d3a4'], x: .74, len: 120, col: '#4a2f1d', season: 'bahar', ground: ['#a9b86a', 40], fall: { n: 40, kind: 'petal', colors: ['rgba(232,140,150,.85)'], speed: 22, size: 3.5, drift: 20 }, shade: ['l', '251,233,207', .9] }) },
  yesilagac: { name: 'Yeşil ağaç', fam: 'agac', modes: ['dini'], tone: 'light', pos: 'r', vars: INK_GREEN, tags: ['şecere', 'kök', 'dal', 'hayat', 'yeşil', 'ağaç', 'nesil', 'aile', 'büyü'], aff: { bullets: 1, alinti: 1 },
    draw: M(treeScene, { bg: ['#cfe4ee', '#eef3e2'], x: .74, len: 125, col: '#4a3826', season: 'yaz', ground: ['#7e9c55', 46], sun: [.92, .1, 160, '255,250,220', .8], shade: ['l', '238,243,226', .9] }) },
  sonbaharagac: { name: 'Sonbahar ağacı', fam: 'agac', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['sonbahar', 'hazan', 'yaprak', 'fena', 'geçici', 'zeval', 'ölüm', 'ihtiyar', 'veda'], aff: { alinti: 1, question: 1 },
    draw: M(treeScene, { bg: ['#3a2418', '#7a4a2a', '#c98a4a'], x: .74, len: 125, col: '#2a1a10', season: 'sonbahar', ground: ['#5a3a1e', 40], fall: { n: 34, kind: 'leaf', colors: ['#c8642a', '#e09a3a', '#a8401f'], speed: 30, size: 5, drift: 16 }, shade: ['l', '40,24,16', .85] }) },
  meyveliagac: { name: 'Meyveli ağaç', fam: 'agac', modes: ['dini'], tone: 'light', pos: 'r', vars: INK_GREEN, tags: ['meyve', 'semere', 'netice', 'amel', 'ikram', 'nimet', 'rızık', 'hediye', 'şükür'], aff: { bullets: 1, bigword: 1 },
    draw: M(treeScene, { bg: ['#e8f0d8', '#f6edd0'], x: .74, len: 125, col: '#4a3826', season: 'meyve', ground: ['#86a45c', 44], sun: [.1, .1, 200, '255,248,220', .7], shade: ['l', '240,240,215', .9] }) },
  kisbahar: { name: 'Kış ve bahar', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['kış', 'bahar', 'haşir', 'diriliş', 'ölüm', 'hayat', 'aynı', 'yeniden'], aff: { temsil: 3, compare: 2 },
    draw: split(M(treeScene, { bg: ['#2a3644', '#617383'], x: .5, len: 92, col: '#26303a', season: 'ciplak', ground: ['#d9e2ea', 40], fall: { n: 110, kind: 'snow', colors: ['#eef3f7'], speed: 30, size: 2 }, seed: 99 }), M(treeScene, { bg: ['#fbe9cf', '#f2d3a4'], x: .5, len: 92, col: '#4a2f1d', season: 'bahar', ground: ['#a9b86a', 40], fall: { n: 36, kind: 'petal', colors: ['rgba(232,140,150,.85)'], speed: 16, size: 3, drift: 20 }, seed: 99 })) },
  gecegunduz: { name: 'Gece ve gündüz', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['gece', 'gündüz', 'karanlık', 'aydınlık', 'iman', 'küfür', 'gaflet', 'hidayet', 'zulmet', 'nur'], aff: { compare: 3, temsil: 2 },
    draw: split(M(landScene, { sky: ['#060b1a', '#16213e', '#26304d'], stars: 120, starTop: .9, moon: [.4, .26, 26], cut: '#0f1730', layers: [['hill', .86, 26, 160, 2, '#0b1020']] }), M(landScene, { sky: ['#7fb3df', '#bcd8ee', '#f4ecd6'], sun: [.6, .24, 34, '255,248,215', 1], disk: true, clouds: [5, .1, .4, '255,255,255', .5], layers: [['hill', .86, 26, 160, 2, '#8fae6a']] })) },
  mum2: { name: 'Sönük ve yanan mum', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['mum', 'sön', 'yan', 'kalp', 'iman', 'nur', 'gaflet', 'ölü', 'diri', 'ihlas'], aff: { compare: 2, temsil: 2 },
    draw: split(M(candleScene, { bg: ['#1b2230', '#07090e'], x: .5, dim: true, ch: 200 }), M(candleScene, { bg: ['#3a2410', '#0d0703'], x: .5, ch: 200 })) },
  kuruyesil: { name: 'Kuru ve yeşil toprak', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['kuru', 'yeşil', 'rahmet', 'yağmur', 'toprak', 'ihya', 'ölü toprak', 'bereket', 'kurak'], aff: { compare: 2, temsil: 2 },
    draw: split(M(groundScene, { sky: ['#e9c58e', '#f3dcb0'], sun: [.5, .1, 260, '255,240,190', .8], soil: ['#c7965a', '#a8743e'], cracks: 1 }), M(groundScene, { sky: ['#9fbfd6', '#dfe9e0'], clouds: '255,255,255', soil: ['#5f7a3a', '#3f5a28'], sprouts: 1, rain: 1 })) },
  nur: { name: 'Nur', fam: 'isik', modes: ['dini'], tone: 'dark', pos: 'n', hat: 1, tags: ['nur', 'ışık', 'iman', 'hidayet', 'marifet', 'tevhid', 'kalp', 'tecelli', 'aydınlan'], aff: { bigword: 2, alinti: 1, ayet: 1 },
    draw: M(raysScene, { radial: 1, bg: ['#2a2414', '#14100a', '#080604'], o: [.5, -.05], n: 13, a0: 1.05, da: .085, wd: .03, rgb: '255,220,150', alpha: .1, core: 280, dust: '#e8c878' }) },
  isik: { name: 'Işık', fam: 'isik', modes: ['dini', 'is'], tone: 'light', pos: 'n', tags: ['müjde', 'sevinç', 'şükür', 'aydınlık', 'ümit', 'fikir', 'çözüm', 'öneri', 'sonuç'], aff: { bigword: 3 },
    draw: M(raysScene, { bg: ['#fff3da', '#efd2a0'], o: [-.06, -.17], n: 9, a0: .25, da: .13, wd: .045, rgb: '255,255,255', alpha: .2 }) },
  bulutgunes: { name: 'Bulut arası güneş', fam: 'isik', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['güneş', 'bulut', 'perde', 'sebep', 'ümit', 'rahmet', 'arkasında', 'gizli'], aff: { question: 1, bigword: 1, alinti: 1 },
    draw: M(raysScene, { bg: ['#2e4560', '#5e7790', '#a8aaa0'], o: [.62, .1], n: 12, a0: 1.2, da: .1, wd: .035, rgb: '255,240,200', alpha: .1, core: 160, clouds: [9, -.05, .3, '40,52,70', .55] }) },
  kandil: { name: 'Kandil', fam: 'kandil', modes: ['dini'], tone: 'dark', pos: 't', overlay: 'kandil', tags: ['dua', 'kandil', 'münacat', 'niyaz', 'tevekkül', 'yalvar', 'amin', 'rabbim'], aff: { closing: 3 },
    draw: kandilScene },
  mum: { name: 'Mum', fam: 'kandil', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['mum', 'ömür', 'tüken', 'fani', 'vakit', 'yan', 'eriyen', 'fedakâr'], aff: { closing: 2, alinti: 1, question: 1 },
    draw: M(candleScene, { bg: ['#2a1a0e', '#120a05', '#050302'], x: .76, shade: ['l', '18,10,5', .8] }) },
  tezhipyesil: { name: 'Yeşil tezhip', fam: 'tezhip', modes: ['dini'], tone: 'dark', pos: 'c', frame: 1, hat: 1, tags: ['ayet', 'kuran', 'kelam', 'vahiy', 'mukaddes', 'sure'], aff: { ayet: 5 },
    draw: M(patternScene, { bg: ['#1f4a3c', '#122a22', '#0a1814'], col: 'rgba(214,180,106,.9)', kind: 'star', s: 120, pa: .32, scrim: '14,34,27', scrimA: .62, glow: '214,180,106', dust: '#e8c878' }) },
  tezhiplacivert: { name: 'Lacivert tezhip', fam: 'tezhip', modes: ['dini'], tone: 'dark', pos: 'c', frame: 1, hat: 1, tags: ['ayet', 'kuran', 'hadis', 'esma', 'isim', 'sıfat', 'kelam'], aff: { ayet: 4, alinti: 1 },
    draw: M(patternScene, { bg: ['#1c2f5a', '#111c38', '#080e1e'], col: 'rgba(214,180,106,.9)', kind: 'girih', s: 130, pa: .3, scrim: '14,22,44', scrimA: .62, glow: '214,180,106', dust: '#e8c878' }) },
  tezhipbordo: { name: 'Bordo tezhip', fam: 'tezhip', modes: ['dini'], tone: 'dark', pos: 'c', frame: 1, hat: 1, tags: ['ayet', 'hadis', 'muhabbet', 'aşk', 'peygamber', 'salavat', 'sünnet'], aff: { ayet: 4, alinti: 1 },
    draw: M(patternScene, { bg: ['#5a1e24', '#381216', '#1c080a'], col: 'rgba(230,190,120,.9)', kind: 'star', s: 110, pa: .3, scrim: '50,16,20', scrimA: .62, glow: '230,190,120', dust: '#f0c88a' }) },
  girih: { name: 'Girih', fam: 'tezhip', modes: ['dini'], tone: 'light', pos: 'c', vars: INK_LIGHT, tags: ['nizam', 'intizam', 'ölçü', 'mizan', 'sanat', 'tertip', 'hikmet', 'sanatkâr', 'düzen'], aff: { bullets: 2, alinti: 1, ayet: 1 },
    draw: M(patternScene, { bg: ['#f6ecd8', '#ecdcbc', '#e0c99e'], col: 'rgba(150,100,40,.9)', kind: 'girih', s: 140, pa: .45, scrim: '248,238,218', scrimA: .7 }) },
  yagmur: { name: 'Rahmet yağmuru', fam: 'su', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yağmur', 'rahmet', 'bereket', 'şifa', 'gözyaşı', 'tövbe', 'bulut', 'ihya'], aff: { bigword: 1, alinti: 1 },
    draw: M(rainScene, { bg: ['#1c2733', '#2f3f4f', '#4a5a66'], cloud: '18,24,32', drop: '#c8d6e2', ground: '#1e2a32', sprouts: 1 }) },
  basak: { name: 'Başak tarlası', fam: 'tarla', modes: ['dini'], tone: 'light', pos: 'b', vars: INK_LIGHT, tags: ['başak', 'hasat', 'emek', 'tohum', 'sünbül', 'bereket', 'ekin', 'rızık', 'ekmek', 'karşılık'], aff: { bigword: 2, cover: 1 },
    draw: M(fieldScene, { kind: 'basak', sky: ['#f2c27a', '#f8dfae', '#fbeedb'], sun: [.7, .5, 360, '255,240,200', .8], far: '#c9a66a', soil: '#a07a3e' }) },
  lale: { name: 'Lale bahçesi', fam: 'tarla', modes: ['dini'], tone: 'light', pos: 'b', vars: INK_COOL, tags: ['lale', 'çiçek', 'bahçe', 'cennet', 'güzellik', 'cemal', 'zinet', 'renk'], aff: { bigword: 2, cover: 1 },
    draw: M(fieldScene, { kind: 'lale', sky: ['#b9d4ea', '#e2ecf0', '#f6efe0'], sun: [.2, .2, 260, '255,252,235', .7], far: '#9db58a', soil: '#5d7a42', fall: { n: 18, kind: 'petal', colors: ['rgba(224,86,106,.7)'], speed: 14, size: 3, drift: 24 } }) },
  filiz: { name: 'Toprakta filiz', fam: 'tohum', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['tohum', 'filiz', 'çekirdek', 'toprak', 'kabir', 'diriliş', 'haşir', 'sabır', 'gizli', 'hazırlık'], aff: { section: 2, question: 1, alinti: 1 },
    draw: sproutScene },
  nehir: { name: 'Nehir', fam: 'su', modes: ['dini'], tone: 'light', pos: 'b', vars: INK_LIGHT, tags: ['nehir', 'ırmak', 'akış', 'zaman', 'ömür', 'akan', 'su', 'kevser', 'geçiyor'], aff: { bigword: 1, cover: 1 },
    draw: riverScene },
  kumsaati: { name: 'Kum saati', fam: 'zaman', modes: ['dini', 'is'], tone: 'dark', pos: 'r', tags: ['ömür', 'zaman', 'vakit', 'saat', 'ecel', 'fırsat', 'geç', 'son', 'süre', 'termin'], aff: { question: 2, bigword: 1 },
    draw: hourglassScene },
  kainat: { name: 'Kâinat', fam: 'kainat', modes: ['dini', 'is'], tone: 'dark', pos: 'r', tags: ['kâinat', 'kainat', 'evren', 'yıldız', 'gezegen', 'âlem', 'yaratılış', 'kudret', 'tevhid', 'nizam', 'ekosistem', 'ölçek'], aff: { cover: 1, section: 2 },
    draw: M(cosmosScene, { x: .76, shade: ['l', '4,5,11', .85] }) },
  kabarcik: { name: 'Kabarcıklar', fam: 'su', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['kabarcık', 'güneş', 'ayna', 'akis', 'tevhid', 'cilve', 'tecelli', 'yansı', 'şişe', 'temsil'], aff: { alinti: 2, temsil: 1, bigword: 1 },
    draw: bubbleScene },
  kuslar: { name: 'Kuşlar', fam: 'gok', modes: ['dini'], tone: 'light', pos: 'n', vars: INK_LIGHT, tags: ['kuş', 'uç', 'ruh', 'hürriyet', 'göç', 'kanat', 'tesbih', 'serbest'], aff: { bigword: 1, closing: 1 },
    draw: M(landScene, { sky: ['#f3c98b', '#f7dfb5', '#fbeedb'], sun: [.82, .78, 34, '255,236,190', .9], disk: true, birds: 14, birdBig: 2.2, birdCol: 'rgba(70,45,25,.75)', layers: [['hill', .95, 20, 240, 2, '#d9b47a']] }) },
  minaresafak: { name: 'Minareler, sabah', fam: 'sehir', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['cami', 'minare', 'ezan', 'namaz', 'sabah', 'cemaat', 'şehir', 'ümmet', 'istanbul'], aff: { cover: 2, section: 1 },
    draw: M(landScene, { sky: ['#1b1a3a', '#4a3a6a', '#c27a6a', '#f2b98a'], stars: 60, starTop: .4, sun: [.62, .98, 50, '255,214,160', 1], layers: [['city', .97, '#1a1220', 5]] }) },
  minaregece: { name: 'Minareler, gece', fam: 'sehir', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['cami', 'minare', 'teravih', 'yatsı', 'gece', 'ramazan', 'kandil gecesi', 'mahya'], aff: { section: 2, closing: 1 },
    draw: M(landScene, { sky: ['#050916', '#0e1a33', '#1c2b4c'], stars: 180, starTop: .8, moon: [.2, .2, 26], cut: '#0a1226', layers: [['city', .97, '#04060c', 8]] }) },
  yaprak: { name: 'Yaprak dökümü', fam: 'agac', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yaprak', 'düş', 'fena', 'ölüm', 'geçici', 'hazan', 'dünya', 'zeval', 'firak'], aff: { bigword: 1, question: 1 },
    draw: leavesScene },
  ates: { name: 'Ateş', fam: 'ates', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['ateş', 'cehennem', 'azap', 'ikaz', 'yak', 'öfke', 'hased', 'günah', 'nar'], aff: { question: 1, bigword: 1 },
    draw: fireScene },
  yol: { name: 'Uzanan yol', fam: 'yol', modes: ['dini', 'is'], tone: 'dark', pos: 'b', tags: ['yol', 'yolculuk', 'sırat', 'istikamet', 'menzil', 'ahiret', 'hedef', 'yol haritası', 'adım'], aff: { cover: 1, section: 2 },
    draw: M(roadScene, {}) },
  yolayrimi: { name: 'Yol ayrımı', fam: 'yol', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['iki yol', 'tercih', 'seçim', 'ayrım', 'karar', 'sağ', 'sol', 'hangisi'], aff: { question: 3 },
    draw: M(roadScene, { fork: 1 }) },
  kitap: { name: 'Açık kitap', fam: 'kitap', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kitap', 'ilim', 'oku', 'ders', 'risale', 'kalem', 'tefsir', 'kâinat kitabı', 'mektup', 'sahife'], aff: { alinti: 3, bullets: 1, section: 1 },
    draw: bookScene },
  damla: { name: 'Damla', fam: 'su', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['damla', 'katre', 'ihlas', 'şefkat', 'küçük', 'tesir', 'halka', 'yayıl', 'niyet'], aff: { bigword: 2, alinti: 1 },
    draw: dropScene },
  bulutlar: { name: 'Bulutlar', fam: 'gok', modes: ['dini', 'is'], tone: 'light', pos: 'n', vars: INK_COOL, tags: ['bulut', 'gök', 'huzur', 'sakin', 'sükûnet', 'ferah', 'hafif'], aff: { bigword: 1, bullets: 1 },
    draw: M(landScene, { sky: ['#7fb0d8', '#bcd7ea', '#f1ead8'], clouds: [14, .02, .8, '255,255,255', .5, 5], birds: 4, birdCol: 'rgba(40,60,90,.55)', layers: [['hill', .97, 20, 260, 1, '#b8c79a']] }) },
  mizan: { name: 'Terazi', fam: 'mizan', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['adalet', 'mizan', 'terazi', 'hesap', 'mahkeme', 'ceza', 'mükâfat', 'zulüm', 'hak'], aff: { alinti: 2, bigword: 2, question: 1 }, draw: mizanScene },
  sarmal: { name: 'Sarmal (DNA)', fam: 'kainat', modes: ['dini', 'is'], tone: 'dark', pos: 'r', tags: ['hıfz', 'hafîz', 'kayıt', 'program', 'gen', 'dna', 'şifre', 'muhafaza', 'sakla', 'kayboluyor'], aff: { alinti: 2, bullets: 1, bigword: 1 }, draw: helixScene },
  ag: { name: 'Ağ', fam: 'ag', modes: ['is'], tone: 'dark', pos: 'n', tags: ['entegrasyon', 'sistem', 'ağ', 'bağlantı', 'platform', 'api', 'altyapı', 'veri', 'mimari'], aff: { section: 3 }, draw: netScene },
  ufuk: { name: 'Ufuk', fam: 'ufuk', modes: ['is'], tone: 'dark', pos: 'n', tags: ['vizyon', 'hedef', 'gelecek', 'strateji', 'yön', 'ufuk', 'plan', 'karar'], aff: { cover: 2, decision: 3, question: 2 }, draw: horizonScene },
  pist: { name: 'Gece pisti', fam: 'ucak', modes: ['is'], tone: 'dark', pos: 'b', tags: ['uçak', 'havacılık', 'kalkış', 'pist', 'başlat', 'lansman', 'canlı', 'uçuş', 'sefer', 'go live'], aff: { cover: 3, section: 1 }, draw: runwayScene },
  bulutustu: { name: 'Bulutların üstü', fam: 'ucak', modes: ['is'], tone: 'dark', pos: 'b', tags: ['bulut', 'yolcu', 'seyahat', 'deneyim', 'yüksel', 'premium', 'mil', 'sadakat', 'üye'], aff: { cover: 2, closing: 2, bigword: 1 }, draw: aboveCloudsScene },
  grafik: { name: 'Grafik', fam: 'veri', modes: ['is'], tone: 'dark', pos: 'n', tags: ['rakam', 'büyüme', 'artış', 'gelir', 'kpi', 'satış', 'yüzde', 'performans', 'sonuç', 'hacim'], aff: { kpi: 3, bigword: 1 }, draw: barsScene },
  dalga: { name: 'Akış çizgileri', fam: 'soyut', modes: ['is'], tone: 'dark', pos: 'n', tags: ['akış', 'süreç', 'dönüşüm', 'değişim', 'yenilik', 'dijital', 'hız'], aff: { section: 2, problem: 1, timeline: 2 }, draw: linesScene },
  sehir: { name: 'Şehir', fam: 'sehir', modes: ['is'], tone: 'dark', pos: 'b', tags: ['müşteri', 'pazar', 'şehir', 'banka', 'ortak', 'kurum', 'iş birliği', 'kampanya'], aff: { cover: 1, section: 1 }, draw: cityScene },
  kure: { name: 'Küre', fam: 'kure', modes: ['is'], tone: 'dark', pos: 'r', tags: ['global', 'dünya', 'uluslararası', 'küresel', 'ülke', 'hat', 'destinasyon', 'ağ'], aff: { cover: 1, section: 2, bigword: 1 }, draw: globeScene },
  soyut: { name: 'Soyut ışıklar', fam: 'soyut', modes: ['is'], tone: 'dark', pos: 'n', tags: ['fikir', 'yaratıcı', 'tasarım', 'yeni', 'deneyim', 'marka', 'ilham'], aff: { question: 1, compare: 1, problem: 1, timeline: 1 }, draw: blobsScene }
};

/* ---------- Seçim ---------- */
const WIDE_TPL = ['temsil', 'compare', 'problem', 'kpi', 'timeline', 'decision', 'ayet'];
const SHORT_TPL = ['cover', 'section', 'question', 'bigword', 'closing'];
function sceneFits(k, tpl, s) {
  const sc = SCENES[k]; if (!sc || !deck || !sc.modes.includes(deck.mode) || !tpl) return false;
  if (sc.pos === 'theme') return true;
  if (sc.pos === 'split') return ['temsil', 'compare', 'problem'].includes(tpl);
  if (WIDE_TPL.includes(tpl)) return sc.pos === 'n' || sc.pos === 'c';
  if (sc.pos === 'b') return SHORT_TPL.includes(tpl);
  if (sc.pos === 't') return SHORT_TPL.includes(tpl) || tpl === 'alinti';
  if ((sc.pos === 'r' || sc.pos === 'l') && s && s.image && TEMPLATES[tpl]?.media) return false;
  return true;
}
function slideText(s) { return ' ' + normTR([s.brief?.idea, s.brief?.sourceText, s.brief?.visualDesc, s.brief?.meal, ...allStrings(s.content || {})].filter(Boolean).join(' ')) + ' '; }
function pickScene(s, hint) {
  if (!deck) return 'kagit';
  const tpl = s.template, cands = Object.keys(SCENES).filter(k => sceneFits(k, tpl, s));
  if (!cands.length) return 'kagit';
  const i = deck.slides.indexOf(s), others = deck.slides.filter(x => x !== s && x.scene && SCENES[x.scene]);
  const used = new Set(others.map(x => x.scene));
  const fam = k => SCENES[k].fam || k;
  const famCount = {}; others.forEach(x => { const f = fam(x.scene); famCount[f] = (famCount[f] || 0) + 1; });
  const near = [deck.slides[i - 1], deck.slides[i + 1]].filter(x => x && x.scene && SCENES[x.scene]).map(x => x.scene);
  const text = slideText(s);
  const unusedLeft = cands.some(k => k !== 'kagit' && !used.has(k));
  const kagitCount = others.filter(x => x.scene === 'kagit').length;
  let best = 'kagit', bs = -1e9;
  cands.forEach(k => {
    const sc = SCENES[k]; let v = 0;
    (sc.tags || []).forEach(tag => { const n = normTR(tag); if (!n) return; const mut = n.replace(/ç$/, 'c').replace(/k$/, 'ğ').replace(/p$/, 'b').replace(/t$/, 'd'); if (text.includes(' ' + n) || (mut !== n && text.includes(' ' + mut))) v += n.length > 4 ? 3 : 2; });
    v += (sc.aff || {})[tpl] || 0;
    if (hint && hint === k) v += 4;
    if (k === 'kagit') v -= 3 + kagitCount * 2;
    else if (used.has(k)) v -= unusedLeft ? 100 : 6;
    near.forEach(n => { if (fam(n) === fam(k)) v -= 5; if (SCENES[n].tone === sc.tone && sc.tone !== 'theme') v -= 1; });
    v -= 1.5 * (famCount[fam(k)] || 0);
    v += (hashStr(s.id + k) % 1000) / 1000 * 1.2;
    if (v > bs) { bs = v; best = k; }
  });
  return best;
}
function sceneOf(s) {
  if (!deck || deck.scenes === false) return 'kagit';
  return s.scene && sceneFits(s.scene, s.template, s) ? s.scene : 'kagit';
}
function ensureScenes(force) {
  if (!deck) return;
  if (deck.sceneVer !== 2) { deck.slides.forEach(s => { if (!s.sceneLocked || !SCENES[s.scene]) { s.scene = ''; s.sceneLocked = false; } }); deck.sceneVer = 2; force = false; }
  let ch = false;
  deck.slides.forEach(s => {
    if (!s.template) return;
    if (s.sceneLocked && sceneFits(s.scene, s.template, s)) return;
    if (force || !s.scene || !sceneFits(s.scene, s.template, s)) { if (force) s.scene = ''; s.scene = pickScene(s); s.sceneLocked = false; ch = true; }
  });
  if (force) deck.slides.forEach(s => { if (!s.sceneLocked && s.template) s.scene = pickScene(s); });
  if (ch || force) saveDeck();
}
function rhythmScene(s) { if (!s.sceneLocked) s.scene = pickScene(s); }

/* ---------- Katmanlar ve çalıştırıcı ---------- */
const TEZHIP_SVG = (() => {
  const star = (cx, cy, r) => { const p = []; for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i - Math.PI / 2, rr = i % 2 ? r * .55 : r; p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); } return `<polygon points="${p.join(' ')}"/>`; };
  let s = '<rect x="40" y="40" width="1200" height="640"/><rect x="52" y="52" width="1176" height="616"/>';
  for (let x = 80; x <= 1200; x += 56) s += star(x, 46, 5) + star(x, 674, 5);
  for (let y = 102; y <= 620; y += 56) s += star(46, y, 5) + star(1234, y, 5);
  [[96, 96], [1184, 96], [96, 624], [1184, 624]].forEach(([x, y]) => { s += star(x, y, 30) + star(x, y, 18) + `<circle cx="${x}" cy="${y}" r="6"/>`; });
  return `<svg class="tz" viewBox="0 0 1280 720" aria-hidden="true">${s}</svg>`;
})();
const KANDIL_SVG = `<svg class="kd" viewBox="0 0 120 170" aria-hidden="true"><path d="M60 0v42" stroke="#8a6a3a" stroke-width="1.5"/><path d="M60 42l-24 28M60 42l24 28" stroke="#8a6a3a" stroke-width="1.2" fill="none"/><g class="flame"><path d="M60 50c-7 8-9 14-9 19a9 9 0 0 0 18 0c0-5-2-11-9-19z" fill="#ffd37a"/><path d="M60 58c-3 5-4 8-4 11a4 4 0 0 0 8 0c0-3-1-6-4-11z" fill="#fff4cf"/></g><path d="M24 78h72l-10 44H34z" fill="#b8893d" opacity=".9"/><ellipse cx="60" cy="78" rx="36" ry="7" fill="#d9ad58"/><path d="M34 122h52l-8 18H42z" fill="#8a6328"/><path d="M38 92h44M36 104h48" stroke="#f3d38a" stroke-width="1" opacity=".6"/></svg>`;
const isArabicScript = s => !!s && /^[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿\sً-ٰٟ]+$/.test(s) && s.trim().length <= 14;
function sceneLayers(s, k) {
  const sc = SCENES[k];
  let h = `<canvas class="scn" width="1280" height="720" data-scene="${k}"></canvas>`;
  if (sc.pos === 'c') h += '<div class="scrim"></div>';
  if (sc.hat && isArabicScript(s.hat)) h += `<div class="wm">${esc(s.hat)}</div>`;
  if (sc.frame) h += TEZHIP_SVG;
  if (sc.overlay === 'kandil') h += `<div class="kdw">${KANDIL_SVG}</div>`;
  return h;
}
const SceneRun = (() => {
  const live = new Set(); let raf = 0;
  function loop(ts) {
    raf = 0;
    for (const o of live) { if (!o.cv.isConnected) { live.delete(o); continue; } try { o.sc.draw(o.g, 1280, 720, ts / 1000, o.st); } catch (e) { live.delete(o); } }
    if (live.size) raf = requestAnimationFrame(loop);
  }
  return {
    attach(root, animate) {
      const cv = root.querySelector('canvas.scn'); if (!cv) return;
      const sc = SCENES[cv.dataset.scene]; if (!sc || !sc.draw) return;
      const o = { cv, g: cv.getContext('2d'), sc, st: {} };
      try { sc.draw(o.g, 1280, 720, 2.5, o.st); } catch (e) { console.error('Sahne çizilemedi', cv.dataset.scene, e); }
      if (animate && !REDUCE) { live.add(o); if (!raf) raf = requestAnimationFrame(loop); }
    }
  };
})();
/* Sahne önizlemeleri (seçici için) */
const SCENE_THUMBS = {};
function sceneThumb(k) {
  if (SCENE_THUMBS[k]) return SCENE_THUMBS[k];
  const sc = SCENES[k]; if (!sc.draw) return '';
  const big = document.createElement('canvas'); big.width = 1280; big.height = 720;
  try { sc.draw(big.getContext('2d'), 1280, 720, 2.5, {}); } catch (e) { return ''; }
  const sm = document.createElement('canvas'); sm.width = 240; sm.height = 135; sm.getContext('2d').drawImage(big, 0, 0, 240, 135);
  return (SCENE_THUMBS[k] = sm.toDataURL('image/jpeg', .8));
}
/* ============ Özel sahneler: kapı, devekuşu, ekran, Barla, İstanbul, kabristan, zelzele ============ */
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
/* --- kapı ve tokmak --- */
function doorScene(ctx, w, h, t, st, p) {
  const open = !!p.open, cx = w * .765, bw = 340, W = bw / 2, top = h * .13, bot = h * .9, dh = bot - top, ah = W * .95, g = open ? 58 : 0;
  if (p.zoom) { ctx.save(); ctx.translate(w * .76, h * .5); ctx.scale(2.5, 2.5); ctx.translate(-(cx - 52), -(top + dh * .47 + 26)); }
  rad(ctx, w, h, open ? ['#5a3816', '#22140a', '#070403'] : ['#2c1d12', '#130c07', '#050302'], .765, .55, .8);
  ctx.strokeStyle = 'rgba(255,220,170,.04)'; ctx.lineWidth = 1;
  for (let y = 0, r = 0; y < bot; y += 46, r++) { ctx.beginPath(); ctx.moveTo(w * .48, y); ctx.lineTo(w, y); ctx.stroke(); for (let x = w * .48 + (r % 2 ? 46 : 0); x < w; x += 92) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 46); ctx.stroke(); } }
  ctx.fillStyle = '#0a0705'; ctx.fillRect(0, bot, w, h - bot);
  glow(ctx, cx, h * .55, open ? 640 : 400, '255,190,100', open ? .42 : .1 + .03 * Math.sin(t * 1.5));
  const arch = (pad = 0) => { ctx.beginPath(); ctx.moveTo(cx - W - pad, bot); ctx.lineTo(cx - W - pad, top + ah); ctx.ellipse(cx, top + ah, W + pad, ah + pad, 0, Math.PI, 0); ctx.lineTo(cx + W + pad, bot); ctx.closePath(); };
  const sg = ctx.createLinearGradient(cx - W - 30, 0, cx + W + 30, 0); sg.addColorStop(0, '#3c3027'); sg.addColorStop(.5, '#6a5846'); sg.addColorStop(1, '#3a2e25');
  ctx.fillStyle = sg; arch(30); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5;
  for (let i = 0; i <= 12; i++) { const a = Math.PI + Math.PI * i / 12; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * W, top + ah + Math.sin(a) * ah); ctx.lineTo(cx + Math.cos(a) * (W + 30), top + ah + Math.sin(a) * (ah + 30)); ctx.stroke(); }
  ctx.fillStyle = '#1c140e'; arch(7); ctx.fill();
  ctx.save(); arch(0); ctx.clip();
  if (open) { const lg = ctx.createLinearGradient(0, top, 0, bot); lg.addColorStop(0, '#fffbe6'); lg.addColorStop(1, '#f6bd62'); ctx.fillStyle = lg; ctx.fillRect(cx - W, top, bw, dh); }
  else { ctx.fillStyle = '#ffd487'; ctx.fillRect(cx - 2, top, 4, dh); }
  const leaf = (x0, x1) => {
    const wg = ctx.createLinearGradient(x0, 0, x1, 0); wg.addColorStop(0, '#3a2413'); wg.addColorStop(.5, '#623f22'); wg.addColorStop(1, '#3c2614'); ctx.fillStyle = wg; ctx.fillRect(x0, top, x1 - x0, dh);
    ctx.strokeStyle = 'rgba(18,9,3,.6)'; ctx.lineWidth = 2; for (let x = x0 + 34; x < x1 - 8; x += 34) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,210,150,.05)'; ctx.lineWidth = 1; for (let x = x0 + 17; x < x1; x += 34) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); }
    [.34, .58, .84].forEach(k => { const y = top + dh * k; ctx.fillStyle = '#17110d'; ctx.fillRect(x0, y - 10, x1 - x0, 20); ctx.fillStyle = '#9a8a72'; for (let x = x0 + 17; x < x1 - 6; x += 34) { ctx.beginPath(); ctx.arc(x, y, 3.6, 0, TAU); ctx.fill(); } });
  };
  leaf(cx - W, cx - g / 2 - 2); leaf(cx + g / 2 + 2, cx + W);
  ctx.restore();
  /* tokmaklar */
  const ky = top + dh * .47, sw = open ? 0 : Math.sin(t * 2.4) * .3 * (.5 + .5 * Math.sin(t * .5));
  [[cx - g / 2 - 52, sw], [cx + g / 2 + 52, 0]].forEach(([kx, a]) => {
    glow(ctx, kx, ky + 20, 70, '255,200,120', open ? .25 : .18);
    ctx.fillStyle = '#b8924a'; ctx.beginPath(); ctx.arc(kx, ky, 14, 0, TAU); ctx.fill(); ctx.fillStyle = '#7a5c26'; ctx.beginPath(); ctx.arc(kx, ky, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d6ae5e'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(kx + Math.sin(a) * 32, ky + Math.cos(a) * 32, 30, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,200,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(kx + Math.sin(a) * 32 - 1, ky + Math.cos(a) * 32 - 1, 31, 3.6, 5); ctx.stroke();
  });
  if (open) {
    const fg = ctx.createLinearGradient(0, bot, 0, h); fg.addColorStop(0, 'rgba(255,205,120,.75)'); fg.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(cx - g / 2, bot); ctx.lineTo(cx + g / 2, bot); ctx.lineTo(cx + g / 2 + 120, h); ctx.lineTo(cx - g / 2 - 460, h); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const a = Math.PI * (.62 + i * .13) + Math.sin(t * .4 + i) * .02; const rg = ctx.createLinearGradient(cx, h * .5, cx + Math.cos(a) * 620, h * .5 + Math.sin(a) * 620); rg.addColorStop(0, 'rgba(255,220,150,.16)'); rg.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(cx, top + dh * .25); ctx.lineTo(cx + Math.cos(a - .05) * 700, h * .5 + Math.sin(a - .05) * 700); ctx.lineTo(cx + Math.cos(a + .05) * 700, h * .5 + Math.sin(a + .05) * 700); ctx.lineTo(cx, bot); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    glow(ctx, cx, top + dh * .55, 300, '255,236,180', .5);
  } else { ctx.fillStyle = 'rgba(255,205,120,.6)'; ctx.fillRect(cx - W + 8, bot - 2, bw - 16, 3); glow(ctx, cx, bot, 240, '255,190,100', .2); }
  if (p.zoom) { ctx.restore(); for (let i = 0; i < 4; i++) { const k = (t * .45 + i / 4) % 1; ctx.strokeStyle = `rgba(255,214,150,${(1 - k) * .45})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w * .76, h * .54, 90 + k * 420, 0, TAU); ctx.stroke(); } }
  falling(ctx, st, w, h, t, { n: open ? 70 : 26, kind: 'dot', colors: ['#ffd28a'], speed: 14, up: true, size: 1.5, sway: 16, alpha: .55, fade: true, area: [.5, 1] });
  shade(ctx, w, h, ['l', open ? '20,12,6' : '14,9,5', .86]);
}
/* --- devekuşu: başını kuma sokmuş --- */
function ostrichScene(ctx, w, h, t, st, p) {
  const ox = w * (p.x || .82), s = p.s || 1;
  lin(ctx, w, h, ['#120e2e', '#352450', '#7e4560', '#d98558', '#f2bd78']);
  drawStars(ctx, st, w, h, t, 70, .42, 5);
  const sx = ox - 40 * s, sy = h * .7;
  glow(ctx, sx, sy, 420, '255,190,120', .5); ctx.fillStyle = 'rgba(255,226,170,.96)'; ctx.beginPath(); ctx.arc(sx, sy, 92 * s, 0, TAU); ctx.fill();
  hills(ctx, w, h, h * .78, 30, 300, 2.2, '#8a4a44'); hills(ctx, w, h, h * .83, 22, 210, 4.1, '#5a2f38');
  const dy = x => h * .88 - 20 * Math.sin(x / 250 + 1.1) - 8 * Math.sin(x / 90 + 2);
  ctx.fillStyle = '#1b1019'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, dy(x)); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  const gy = dy(ox), ink = '#140b14';
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  /* bacaklar */
  ctx.lineWidth = 8 * s; [[-14, -6], [16, 8]].forEach(([dx, kx]) => { ctx.beginPath(); ctx.moveTo(ox + dx * s, gy - 118 * s); ctx.lineTo(ox + (dx + kx + 10) * s, gy - 62 * s); ctx.lineTo(ox + (dx + kx - 4) * s, gy + 2); ctx.lineTo(ox + (dx + kx - 22) * s, gy + 4); ctx.stroke(); });
  /* gövde ve kuyruk tüyleri */
  ctx.beginPath(); ctx.ellipse(ox + 6 * s, gy - 150 * s, 76 * s, 50 * s, -.12, 0, TAU); ctx.fill();
  for (let i = 0; i < 7; i++) { const a = -.9 + i * .28 + Math.sin(t * 1.5 + i) * .03; ctx.beginPath(); ctx.ellipse(ox + (70 + Math.cos(a) * 26) * s, gy - (160 - Math.sin(a) * 30) * s, 30 * s, 13 * s, a, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(ox + (-10 + i * 16) * s, gy - 190 * s, 20 * s, 12 * s, -.5 + i * .2, 0, TAU); ctx.fill(); }
  /* boyun: öne uzanıp kuma iniyor */
  const hx = ox - 168 * s, hy = dy(hx);
  ctx.lineWidth = 15 * s; ctx.beginPath(); ctx.moveTo(ox - 52 * s, gy - 168 * s); ctx.bezierCurveTo(ox - 130 * s, gy - 235 * s, ox - 185 * s, gy - 120 * s, hx, hy + 4); ctx.stroke();
  /* kum tümseği ve savrulan kum */
  ctx.fillStyle = '#2a1722'; ctx.beginPath(); ctx.ellipse(hx, hy + 6, 44 * s, 15 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#1b1019'; ctx.fillRect(hx - 50 * s, hy + 6, 100 * s, 14);
  for (let i = 0; i < 14; i++) { const k = (t * .6 + i / 14) % 1, a = Math.PI * (1.15 + (i % 7) * .1); ctx.globalAlpha = (1 - k) * .7; ctx.fillStyle = '#e8b27a'; ctx.beginPath(); ctx.arc(hx + Math.cos(a) * k * 46 * s, hy + Math.sin(a) * k * 34 * s + k * k * 18, 1.8, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (!p.solo) birds(ctx, st, w, h, t, 3, 9, 'rgba(30,18,28,.75)', 1);
  shade(ctx, w, h, p.solo ? null : ['l', '16,11,34', .82]);
}
/* --- ekran: kuma gömülü telefon --- */
function phoneScene(ctx, w, h, t, st, p) {
  rad(ctx, w, h, ['#1c2a52', '#0b1022', '#04050b'], .5, .9, .75);
  drawStars(ctx, st, w, h, t, 40, .4, 12, '200,215,255');
  const cx = w * .5, base = h * .93, pw = 92, ph = 150;
  glow(ctx, cx, base - ph * .6, 430 + 14 * Math.sin(t * 1.3), '120,170,255', .42);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createLinearGradient(0, base - ph, 0, base - ph - 200); cg.addColorStop(0, 'rgba(140,185,255,.3)'); cg.addColorStop(1, 'rgba(140,185,255,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(cx - pw / 2, base - ph); ctx.lineTo(cx + pw / 2, base - ph); ctx.lineTo(cx + 300, base - ph - 200); ctx.lineTo(cx - 300, base - ph - 200); ctx.closePath(); ctx.fill(); ctx.restore();
  /* bildirim baloncukları */
  const COL = ['#ff5a66', '#5aa8ff', '#52d68a', '#ffc84a', '#c58aff', '#ffffff'];
  pts(st, 'nb', 26, 41, r => [r() * 2 - 1, r(), 12 + r() * 20, Math.floor(r() * 6), r() < .5, r() * 6]).forEach(([dx, ph0, sz, ci, round, wob]) => {
    const k = (t * .09 + ph0) % 1, x = cx + dx * (40 + k * 420) + Math.sin(t * .8 + wob) * 8, y = base - ph - 4 - k * 92 + Math.abs(dx) * k * 60;
    ctx.globalAlpha = Math.sin(k * Math.PI) * .85; ctx.fillStyle = COL[ci];
    if (round) { ctx.beginPath(); ctx.arc(x, y, sz * .5, 0, TAU); ctx.fill(); } else { rrect(ctx, x - sz / 2, y - sz / 2, sz, sz, sz * .28); ctx.fill(); }
    ctx.fillStyle = 'rgba(10,14,30,.55)'; ctx.fillRect(x - sz * .22, y - 1.5, sz * .44, 3);
  });
  ctx.globalAlpha = 1;
  /* telefon */
  ctx.save(); ctx.translate(cx, base); ctx.rotate(-.07);
  ctx.fillStyle = '#05070d'; rrect(ctx, -pw / 2, -ph, pw, ph + 30, 16); ctx.fill();
  const sg = ctx.createLinearGradient(0, -ph, 0, 0); sg.addColorStop(0, '#eaf2ff'); sg.addColorStop(1, '#6fa0ff'); ctx.fillStyle = sg; rrect(ctx, -pw / 2 + 7, -ph + 9, pw - 14, ph, 9); ctx.fill();
  ctx.fillStyle = 'rgba(20,40,90,.28)'; for (let i = 0; i < 5; i++) { rrect(ctx, -pw / 2 + 16, -ph + 24 + i * 30 - ((t * 14) % 30), pw - 32, 20, 5); ctx.fill(); }
  ctx.restore();
  /* kum */
  ctx.fillStyle = '#0a0d1a'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, base - 26 - 16 * Math.sin(x / 190 + 1) + Math.min(26, Math.abs(x - cx) * .22)); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120,160,255,.14)'; ctx.beginPath(); ctx.ellipse(cx, base - 22, 150, 12, 0, 0, TAU); ctx.fill();
}
/* --- Barla: göl, dağlar, köy --- */
function barlaScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#a9cbe6', '#d6e6ee', '#f7ecd2', '#f3dcae']);
  glow(ctx, w * .2, h * .2, 420, '255,246,214', .85);
  clouds(ctx, st, w, h, t, 5, h * .05, h * .3, '255,255,255', .5, 17, 5);
  peaks(ctx, st, w, h, h * .73, 170, 31, '#a7bccf'); mist(ctx, w, h, h * .66, '240,244,246', .5);
  peaks(ctx, st, w, h, h * .74, 100, 47, '#839db3'); mist(ctx, w, h, h * .72, '236,240,240', .55);
  const ly = h * .735, lg = ctx.createLinearGradient(0, ly, 0, h); lg.addColorStop(0, '#b9d6e6'); lg.addColorStop(.4, '#7fabc8'); lg.addColorStop(1, '#4f7fa3'); ctx.fillStyle = lg; ctx.fillRect(0, ly, w, h - ly);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 36; i++) { const k = i / 36, y = ly + 6 + Math.pow(k, 1.5) * (h - ly), ww = 30 + k * 120, x = ((i * 137.5) % 1) * w + (i * 211) % w; ctx.globalAlpha = .12 + .2 * (.5 + .5 * Math.sin(t * 1.6 + i)); ctx.fillRect((x + Math.sin(t * .5 + i) * 10) % w, y, ww, 1.6); }
  ctx.globalAlpha = .5; ctx.fillStyle = '#fff6d8'; for (let y = ly + 4; y < h; y += 7) { const k = (y - ly) / (h - ly), ww = (8 + k * 90) * (.6 + .4 * Math.sin(t * 2 + y * .3)); ctx.fillRect(w * .2 - ww / 2, y, ww, 2); } ctx.globalAlpha = 1;
  /* kayık */
  const bx = w * .33 + Math.sin(t * .25) * 14, by = h * .83 + Math.sin(t * 1.2) * 1.5; ctx.fillStyle = '#3a3026'; ctx.beginPath(); ctx.moveTo(bx - 30, by); ctx.quadraticCurveTo(bx, by + 14, bx + 34, by - 2); ctx.lineTo(bx - 30, by); ctx.fill(); ctx.fillRect(bx - 1, by - 28, 2, 28); ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.moveTo(bx + 1, by - 28); ctx.lineTo(bx + 20, by - 5); ctx.lineTo(bx + 1, by - 5); ctx.fill();
  /* yamaç ve köy */
  const sl = x => h * .99 - Math.pow(Math.max(0, (x - w * .4) / (w * .6)), .8) * h * .2;
  const gg = ctx.createLinearGradient(0, h * .76, 0, h); gg.addColorStop(0, '#6f8f58'); gg.addColorStop(1, '#3f5c38'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(w * .36, h); for (let x = w * .4; x <= w; x += 10) ctx.lineTo(x, sl(x) - 5 * Math.sin(x / 60)); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  const cyp = (x, y, ht) => { ctx.fillStyle = '#2c4a35'; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - ht * .16, y - ht * .3, x - ht * .09, y - ht * .85, x, y - ht); ctx.bezierCurveTo(x + ht * .09, y - ht * .85, x + ht * .16, y - ht * .3, x, y); ctx.fill(); };
  const house = (x, y, s, roof) => { ctx.fillStyle = '#f3ead8'; ctx.fillRect(x, y - 30 * s, 46 * s, 30 * s); ctx.fillStyle = 'rgba(90,70,50,.18)'; ctx.fillRect(x + 30 * s, y - 30 * s, 16 * s, 30 * s); ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 30 * s); ctx.lineTo(x + 23 * s, y - 50 * s); ctx.lineTo(x + 52 * s, y - 30 * s); ctx.fill(); ctx.fillStyle = '#4a3a2c'; ctx.fillRect(x + 8 * s, y - 22 * s, 8 * s, 10 * s); ctx.fillRect(x + 26 * s, y - 22 * s, 8 * s, 10 * s); };
  [[.6, 150], [.985, 190], [.67, 90]].forEach(([x, ht]) => cyp(w * x, sl(w * x), ht * .6));
  const R = ['#a8573a', '#b9653f', '#96492f'];
  [[.63, .8], [.69, .9], [.745, 1], [.8, .85], [.925, 1.05], [.96, .8]].forEach(([x, s], i) => house(w * x, sl(w * x + 20) + 2, s, R[i % 3]));
  /* cami */
  const mx = w * .865, my = sl(mx); ctx.fillStyle = '#f6f1e6'; ctx.fillRect(mx - 46, my - 40, 70, 40); ctx.fillStyle = '#7d93a3'; ctx.beginPath(); ctx.arc(mx - 11, my - 40, 26, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#f6f1e6'; ctx.fillRect(mx + 30, my - 128, 9, 128); ctx.fillRect(mx + 26, my - 96, 17, 5); ctx.fillStyle = '#7d93a3'; ctx.beginPath(); ctx.moveTo(mx + 29, my - 128); ctx.lineTo(mx + 34.5, my - 156); ctx.lineTo(mx + 40, my - 128); ctx.fill();
  [[.72, 1], [.9, .8]].forEach(([x, s]) => cyp(w * x + 30, sl(w * x + 30) + 4, 110 * s));
  /* çınar */
  const tx = w * .55, ty = sl(tx) + 6; ctx.strokeStyle = '#4a3524'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 2, ty - 70); ctx.moveTo(tx + 1, ty - 50); ctx.lineTo(tx - 30, ty - 88); ctx.moveTo(tx + 1, ty - 56); ctx.lineTo(tx + 32, ty - 92); ctx.stroke();
  [[0, -120, 50, '#587c42'], [-44, -98, 40, '#4e7240'], [46, -100, 42, '#628a4a'], [-16, -150, 36, '#6a9150'], [26, -142, 34, '#557a40']].forEach(([dx, dyy, r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(tx + dx + Math.sin(t + dx) * 1.5, ty + dyy, r, 0, TAU); ctx.fill(); });
  birds(ctx, st, w, h, t, 4, 6, 'rgba(50,60,80,.6)', 1);
}
/* --- İstanbul silueti --- */
function mosqueSil(ctx, x, b, s, mins) {
  const R = 60 * s; ctx.fillRect(x - R * 1.9, b - R * .7, R * 3.8, R * .7 + 2);
  ctx.beginPath(); ctx.arc(x, b - R * .85, R, Math.PI, 0); ctx.fill(); ctx.fillRect(x - R, b - R * .85, R * 2, R * .3);
  [-1, 1].forEach(d => { ctx.beginPath(); ctx.arc(x + d * R * 1.02, b - R * .62, R * .56, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(x + d * R * 1.6, b - R * .5, R * .34, Math.PI, 0); ctx.fill(); });
  ctx.fillRect(x - 1.5, b - R * 2.2, 3, R * .4); ctx.beginPath(); ctx.arc(x, b - R * 2.2, 3.5, 0, TAU); ctx.fill();
  mins.forEach(([dx, mh]) => { const mx = x + dx * s, mw = 7 * s, H = mh * s; ctx.fillRect(mx - mw / 2, b - H, mw, H); [.6, .78].forEach(k => ctx.fillRect(mx - mw / 2 - 3 * s, b - H * k, mw + 6 * s, 4 * s)); ctx.beginPath(); ctx.moveTo(mx - mw / 2, b - H); ctx.lineTo(mx, b - H - mw * 3.4); ctx.lineTo(mx + mw / 2, b - H); ctx.fill(); });
}
function istanbulScene(ctx, w, h, t, st) {
  const hz = h * .84;
  lin(ctx, w, hz + 2, ['#0a1230', '#1d2a58', '#4a3f70', '#b06a66', '#f0a868', '#fbd58c'], 0, hz);
  drawStars(ctx, st, w, hz, t, 80, .5, 21);
  const sx = w * .7; glow(ctx, sx, hz, 520, '255,206,130', .6); ctx.fillStyle = 'rgba(255,236,190,.95)'; ctx.beginPath(); ctx.arc(sx, hz + 6, 46, Math.PI, 0); ctx.fill();
  clouds(ctx, st, w, hz, t, 4, h * .42, h * .66, '255,190,150', .22, 19, 4);
  ctx.fillStyle = '#3a2c4c'; hills(ctx, w, h, hz - 4, 12, 230, 1.4, '#4a3558');
  ctx.fillStyle = '#181024';
  mosqueSil(ctx, w * .33, hz, .62, [[-150, 150], [150, 150]]);
  ctx.fillRect(w * .1 - 13, hz - 92, 26, 92); ctx.fillRect(w * .1 - 17, hz - 70, 34, 5); ctx.beginPath(); ctx.moveTo(w * .1 - 15, hz - 92); ctx.lineTo(w * .1, hz - 128); ctx.lineTo(w * .1 + 15, hz - 92); ctx.fill();
  const r = srng(77); for (let x = -10; x < w;) { const bw = 22 + r() * 46, bh = 10 + r() * 30; ctx.fillRect(x, hz - bh, bw, bh + 2); if (r() < .25) { ctx.beginPath(); ctx.arc(x + bw / 2, hz - bh, bw * .32, Math.PI, 0); ctx.fill(); } x += bw; }
  ctx.fillStyle = '#100a1a'; mosqueSil(ctx, w * .82, hz, 1, [[-150, 172], [150, 172], [-205, 128], [205, 128]]);
  const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#8a5a66'); g.addColorStop(.25, '#3c2e52'); g.addColorStop(1, '#0e0a1a'); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
  for (let y = hz + 3; y < h; y += 5) { const k = (y - hz) / (h - hz), ww = (26 + k * 190) * (.6 + .4 * Math.sin(t * 2 + y * .35)); ctx.fillStyle = `rgba(255,214,150,${.5 * (1 - k * .6)})`; ctx.fillRect(sx - ww / 2 + Math.sin(t + y * .1) * 6, y, ww, 2); }
  ctx.strokeStyle = 'rgba(255,220,180,.25)'; ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { const y = hz + 8 + i * 12; ctx.beginPath(); for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin(x / 60 + t * 1.2 + i) * 1.6); ctx.stroke(); }
  const bx = w * .5 + Math.sin(t * .2) * 20, by = hz + 34; ctx.fillStyle = '#0c0814'; ctx.beginPath(); ctx.moveTo(bx - 34, by); ctx.quadraticCurveTo(bx, by + 12, bx + 40, by - 4); ctx.lineTo(bx - 34, by); ctx.fill(); ctx.fillRect(bx - 4, by - 9, 14, 9);
  pts(st, 'ib', 26, 88, r => [r(), r(), r() * 6]).forEach(([x, k, ph]) => { const y = hz + 12 + k * (h - hz - 26), sc = .35 + k * .9, X = w * (.04 + x * .9) + Math.sin(t * .3 + ph) * 4; ctx.fillStyle = '#0c0814'; ctx.beginPath(); ctx.moveTo(X - 16 * sc, y); ctx.quadraticCurveTo(X, y + 7 * sc, X + 18 * sc, y - 2 * sc); ctx.closePath(); ctx.fill(); glow(ctx, X, y - 5 * sc, 14 * sc, '255,214,140', .8); ctx.fillStyle = '#ffe6b0'; ctx.beginPath(); ctx.arc(X, y - 5 * sc, 1.6 * sc + .4, 0, TAU); ctx.fill(); });
  birds(ctx, st, w, h * .8, t, 7, 14, 'rgba(20,14,30,.8)', 1);
}
/* --- kabristan: serviler ve taşlar --- */
function gravesScene(ctx, w, h, t, st, p) {
  p = p || {};
  lin(ctx, w, h, ['#0b1228', '#1e2850', '#4b426c', '#a0706e', '#e2a274']);
  drawStars(ctx, st, w, h, t, 120, .55, 33);
  const mx = w * .945, my = h * .085; glow(ctx, mx, my, 110, '255,236,190', .28); ctx.fillStyle = '#f6e7c2'; ctx.beginPath(); ctx.arc(mx, my, 26, 0, TAU); ctx.fill(); ctx.fillStyle = '#141c3e'; ctx.beginPath(); ctx.arc(mx + 11, my - 6, 23, 0, TAU); ctx.fill();
  glow(ctx, w * .42, h * .86, 520, '255,190,130', .35);
  hills(ctx, w, h, h * .82, 18, 260, 3.3, '#2c2440'); mist(ctx, w, h, h * .8, '230,190,170', .22);
  const gy = x => h * .87 - 12 * Math.sin(x / 300 + .6);
  const cyp = (x, ht, c) => { const y = gy(x) + 4, sw = Math.sin(t * .8 + x) * 3; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.bezierCurveTo(x - ht * .15, y - ht * .3, x - ht * .08, y - ht * .85, x + sw, y - ht); ctx.bezierCurveTo(x + ht * .08, y - ht * .85, x + ht * .15, y - ht * .3, x + 4, y); ctx.fill(); };
  [[.05, 150], [.3, 110], [.52, 120], [.66, 140]].forEach(([x, ht]) => cyp(w * x, ht, '#1a1a30'));
  const stone = (x, ht, tilt, kav, c) => { const y = gy(x) + 3; ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-11, -ht + 10); ctx.quadraticCurveTo(0, -ht - 8, 11, -ht + 10); ctx.lineTo(9, 0); ctx.fill(); if (kav) { ctx.beginPath(); ctx.ellipse(0, -ht - 6, 11, 9, 0, 0, TAU); ctx.fill(); ctx.fillRect(-5, -ht, 10, 8); } ctx.restore(); };
  pts(st, 'gs1', 22, 53, r => [.03 + r() * .94, 34 + r() * 30, (r() - .5) * .2, r() < .4]).forEach(([x, ht, tl, kv]) => stone(w * x, ht, tl, kv, '#2a2742'));
  ctx.fillStyle = '#0c0b16'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy(x) + 8); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  (p.gate ? [[.985, 240], [.03, 170], [.66, 150]] : [[.78, 190], [.93, 340], [.985, 230], [.86, 160], [.12, 150]]).forEach(([x, ht]) => cyp(w * x, ht, '#0c0b16'));
  pts(st, 'gs2', 12, 91, r => [.04 + r() * .92, 50 + r() * 44, (r() - .5) * .24, r() < .5]).forEach(([x, ht, tl, kv]) => { ctx.save(); ctx.translate(0, 16); stone(w * x, ht, tl, kv, '#0c0b16'); ctx.restore(); });
  if (p.gate) { const gx = w * .8, by = gy(gx) + 10; glow(ctx, gx, by - 80, 280, '255,214,150', .5);
    ctx.fillStyle = '#0c0b16'; ctx.fillRect(gx - 74, by - 150, 24, 150); ctx.fillRect(gx + 50, by - 150, 24, 150); ctx.beginPath(); ctx.arc(gx, by - 150, 74, Math.PI, 0); ctx.arc(gx, by - 150, 50, 0, Math.PI, true); ctx.fill();
    pts(st, 'cl', 24, 5, r => [.1 + r() * .6, r() * 16, r() * 6]).forEach(([x, d, ph]) => { const X = w * x, Y = gy(X) - 6 - d; glow(ctx, X, Y, 26, '255,200,120', .5 + .2 * Math.sin(t * 2 + ph)); ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, TAU); ctx.fill(); });
    const X = w * .895 + Math.sin(t * .3) * 6, Y = gy(X) - 8; glow(ctx, X, Y, 70, '255,236,190', .85); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X, Y, 3.6, 0, TAU); ctx.fill(); }
  falling(ctx, st, w, h, t, { n: 24, kind: 'dot', colors: ['#ffd9a0'], speed: 9, up: true, size: 1.3, sway: 20, alpha: .5, fade: true, area: [0, 1] });
  birds(ctx, st, w, h * .5, t, 3, 22, 'rgba(14,12,26,.7)', 1);
}
/* --- zelzele --- */
function quakeScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#10131c', '#232836', '#454450', '#8b6f5e']);
  glow(ctx, w * .82, -20, 620, '255,226,170', .34);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const a = Math.PI * (.56 + i * .07) + Math.sin(t * .3 + i) * .01, rg = ctx.createLinearGradient(w * .82, 0, w * .82 + Math.cos(a) * 760, Math.sin(a) * 760); rg.addColorStop(0, 'rgba(255,226,170,.13)'); rg.addColorStop(1, 'rgba(255,226,170,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(w * .82, -20); ctx.lineTo(w * .82 + Math.cos(a - .025) * 900, Math.sin(a - .025) * 900); ctx.lineTo(w * .82 + Math.cos(a + .025) * 900, Math.sin(a + .025) * 900); ctx.closePath(); ctx.fill(); } ctx.restore();
  clouds(ctx, st, w, h, t, 7, -30, h * .22, '30,34,46', .7, 29, 7);
  const gy = h * .83;
  ctx.fillStyle = '#14121a';
  const B = st.qb || (st.qb = (() => { const r = srng(63), a = []; for (let x = -10; x < w;) { const bw = 34 + r() * 60, bh = 18 + r() * 46; a.push([x, bw, bh, r() < .22 ? (r() - .5) * .22 : 0, r() < .3]); x += bw + r() * 14; } return a; })());
  B.forEach(([x, bw, bh, tl, rf]) => { ctx.save(); ctx.translate(x + bw / 2, gy); ctx.rotate(tl); ctx.fillRect(-bw / 2, -bh, bw, bh + 8); if (rf) { ctx.beginPath(); ctx.moveTo(-bw / 2 - 4, -bh); ctx.lineTo(0, -bh - 16); ctx.lineTo(bw / 2 + 4, -bh); ctx.fill(); } ctx.restore(); });
  const mnx = w * .9; ctx.fillRect(mnx - 4, gy - 150, 8, 150); ctx.fillRect(mnx - 8, gy - 112, 16, 4); ctx.beginPath(); ctx.moveTo(mnx - 4, gy - 150); ctx.lineTo(mnx, gy - 176); ctx.lineTo(mnx + 4, gy - 150); ctx.fill(); ctx.beginPath(); ctx.arc(mnx - 40, gy - 22, 26, Math.PI, 0); ctx.fill();
  const g = ctx.createLinearGradient(0, gy, 0, h); g.addColorStop(0, '#221b1a'); g.addColorStop(1, '#090707'); ctx.fillStyle = g; ctx.fillRect(0, gy, w, h - gy);
  /* yarık */
  const C = [[.47, 0], [.455, .22], [.49, .4], [.44, .62], [.47, .8], [.42, 1]];
  ctx.fillStyle = '#020202'; ctx.beginPath(); C.forEach(([x, k], i) => { const X = w * x - 3 - k * 26, Y = gy + k * (h - gy); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); [...C].reverse().forEach(([x, k]) => ctx.lineTo(w * x + 3 + k * 30, gy + k * (h - gy))); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(190,150,120,.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); C.forEach(([x, k], i) => { const X = w * x - 3 - k * 26, Y = gy + k * (h - gy); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
  [[.455, .22, -90, 14], [.49, .4, 120, 10], [.44, .62, -140, 22]].forEach(([x, k, dx, dyy]) => { ctx.beginPath(); ctx.moveTo(w * x, gy + k * (h - gy)); ctx.lineTo(w * x + dx * .5, gy + k * (h - gy) + dyy * .3); ctx.lineTo(w * x + dx, gy + k * (h - gy) + dyy); ctx.stroke(); });
  /* sismograf izi */
  const sy = gy + (h - gy) * .52; ctx.strokeStyle = 'rgba(240,180,120,.6)'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let x = 0; x <= w; x += 3) { const u = x / w, c = (u - (.5 + .3 * Math.sin(t * .25))), env = Math.exp(-c * c * 60); ctx.lineTo(x, sy + Math.sin(x * .22 + t * 6) * (2 + env * 30) * Math.sin(x * .031 + t)); } ctx.stroke();
  falling(ctx, st, w, h, t, { n: 40, kind: 'dot', colors: ['#cdb8a0'], speed: 12, up: true, size: 1.4, sway: 24, alpha: .4, fade: true, area: [0, 1] });
}
Object.assign(SCENES, {
  tokmak: { name: 'Kapı ve tokmak', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kapı', 'tokmak', 'uyan', 'ikaz', 'gaflet', 'çal', 'eşik', 'davet'], aff: { cover: 2, alinti: 1 }, draw: M(doorScene, {}) },
  kapiacik: { name: 'Aralanan kapı', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kapı', 'açıl', 'tövbe', 'rahmet', 'müjde', 'kabul', 'fetih'], aff: { closing: 2 }, draw: M(doorScene, { open: 1 }) },
  devekusu: { name: 'Devekuşu', fam: 'col', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['devekuşu', 'avcı', 'kum', 'gaflet', 'kaç', 'görme'], aff: { alinti: 1 }, draw: M(ostrichScene, {}) },
  kumekran: { name: 'Kum ve ekran', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['devekuşu', 'ekran', 'telefon', 'kum', 'oyalan', 'gaflet'], aff: { compare: 1 }, draw: split(M(ostrichScene, { x: .66, s: .8, solo: 1 }), M(phoneScene, {})) },
  ekran: { name: 'Kumdaki ekran', fam: 'ekran', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['ekran', 'telefon', 'sosyal medya', 'oyalan', 'uyut', 'bildirim', 'dikkat'], aff: { question: 1 }, draw: M(phoneScene, {}) },
  barla: { name: 'Barla ve göl', fam: 'koy', modes: ['dini'], tone: 'light', pos: 'b', vars: INK_COOL, tags: ['barla', 'köy', 'karye', 'göl', 'eğirdir', 'ısparta', 'sürgün'], aff: { section: 1 }, draw: barlaScene },
  istanbul: { name: 'İstanbul silueti', fam: 'sehir', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['istanbul', 'kavuş', 'ahbap', 'müştak', 'vuslat', 'boğaz'], aff: { alinti: 1 }, draw: istanbulScene },
  kabristan: { name: 'Kabristan', fam: 'kabir', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['kabir', 'kabristan', 'mezar', 'ölüm', 'servi', 'berzah', 'ziyaret'], aff: { alinti: 1 }, draw: gravesScene },
  zelzele: { name: 'Zelzele', fam: 'afet', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['zelzele', 'deprem', 'sarsıntı', 'musibet', 'afet', 'hadisat'], aff: { alinti: 1 }, draw: quakeScene }
});

/* --- gaflete dalmak: derine inen fener --- */
function diveScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#3c93b8', '#17557f', '#0a2746', '#030a16']);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { const x = w * (.52 + i * .075) + Math.sin(t * .4 + i) * 14, ww = 26 + ((i * 37) % 40), g = ctx.createLinearGradient(0, 0, 0, h * .8); g.addColorStop(0, 'rgba(190,235,255,.22)'); g.addColorStop(1, 'rgba(190,235,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + ww, 0); ctx.lineTo(x + ww - 120, h * .8); ctx.lineTo(x - 150, h * .8); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  const k = (t * .03 + .35) % 1, lx = w * .78 + Math.sin(t * .6) * 18, ly = h * (.24 + .56 * k), a = 1 - k * .8;
  glow(ctx, lx, ly, 190 * a + 40, '255,200,110', .6 * a);
  ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.sin(t * .7) * .25 + .2); ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#1c130b'; ctx.fillRect(-17, -31, 34, 7); ctx.fillRect(-19, 24, 38, 8); ctx.fillStyle = `rgba(255,214,130,${.25 + a * .75})`; ctx.fillRect(-13, -24, 26, 48);
  ctx.strokeStyle = '#1c130b'; ctx.lineWidth = 3; ctx.strokeRect(-14, -24, 28, 48); ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, 24); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -38, 9, Math.PI, 0); ctx.stroke(); ctx.restore();
  pts(st, 'bb', 50, 71, r => [.5 + r() * .5, r(), 2 + r() * 7, r() * 6]).forEach(([x, p0, sz, wb]) => { const kk = (t * .05 * (1 + sz * .1) + p0) % 1, y = h * (1.02 - kk * 1.05), X = w * x + Math.sin(t + wb) * 10; ctx.globalAlpha = .55 * (1 - kk * .5); ctx.strokeStyle = 'rgba(220,245,255,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, y, sz, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(220,245,255,.16)'; ctx.fill(); });
  ctx.globalAlpha = 1; shade(ctx, w, h, ['l', '5,18,34', .82]);
}
/* --- dört basamak: aşağı inen merdiven --- */
function stairsScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#5a3f22', '#1c130b', '#050403'], .06, .02, .8);
  glow(ctx, w * .05, h * .04, 560, '255,206,130', .32 + .03 * Math.sin(t));
  const x0 = 118, cw = (w - 236) / 4, sh = h * .062, y0 = h * .715;
  for (let i = 0; i < 4; i++) { const x = i ? x0 + i * cw - 34 : 0, y = y0 + i * sh, c = 62 - i * 15; ctx.fillStyle = `rgb(${c},${c * .72 | 0},${c * .5 | 0})`; ctx.fillRect(x, y, w - x, h - y); ctx.fillStyle = `rgba(255,214,150,${.55 - i * .13})`; ctx.fillRect(x, y, (i < 3 ? x0 + (i + 1) * cw - 34 : w) - x, 2.5); if (i) { const g = ctx.createLinearGradient(x, 0, x + 60, 0); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 60, h - y); } }
  const ph = (t * .22) % 4, i = Math.floor(ph), f = ph - i, bx = x0 + (i + .15 + f * .8) * cw - 34, by = y0 + i * sh - 12 - Math.abs(Math.sin(f * Math.PI * 2)) * 10, al = 1 - i * .22;
  glow(ctx, bx, by, 90, '255,206,130', .7 * al); ctx.fillStyle = `rgba(255,236,190,${al})`; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill();
  falling(ctx, st, w, h, t, { n: 30, kind: 'dot', colors: ['#ffd28a'], speed: 10, up: true, size: 1.3, sway: 14, alpha: .4, fade: true, area: [0, .5] });
}
/* --- hasr-ı nazar: anahtar deliğinden bakmak --- */
function keyholeScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#22170e', '#0c0806', '#030202'], .77, .5, .7);
  const cx = w * .77, cy = h * .36, R = 92;
  const hole = () => { ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.moveTo(cx - 42, cy + 60); ctx.lineTo(cx + 42, cy + 60); ctx.lineTo(cx + 80, cy + 300); ctx.lineTo(cx - 80, cy + 300); ctx.closePath(); };
  glow(ctx, cx, cy + 90, 560, '255,200,120', .36 + .03 * Math.sin(t * 1.3));
  const pg = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0); pg.addColorStop(0, '#6a5230'); pg.addColorStop(.5, '#a8854a'); pg.addColorStop(1, '#5a4426'); ctx.fillStyle = pg; rrect(ctx, cx - 150, cy - 160, 300, 540, 30); ctx.fill();
  ctx.fillStyle = '#2c2012'; rrect(ctx, cx - 136, cy - 146, 272, 512, 20); ctx.fill();
  ctx.fillStyle = '#c9a45c'; [[-112, -122], [112, -122], [-112, 342], [112, 342]].forEach(([dx, dyy]) => { ctx.beginPath(); ctx.arc(cx + dx, cy + dyy, 7, 0, TAU); ctx.fill(); });
  ctx.save(); hole(); ctx.clip();
  const g = ctx.createLinearGradient(0, cy - R, 0, cy + 300); g.addColorStop(0, '#7cc4ee'); g.addColorStop(.4, '#ffeeb8'); g.addColorStop(.58, '#ffd27a'); g.addColorStop(1, '#7cb650'); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R + 310);
  glow(ctx, cx + 14, cy + 6, 130, '255,250,220', .9); ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(cx + 14, cy + 6, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = '#6aa548'; ctx.beginPath(); ctx.ellipse(cx - 50, cy + 250, 150, 70, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#528c3a'; ctx.beginPath(); ctx.ellipse(cx + 70, cy + 300, 150, 70, 0, 0, TAU); ctx.fill();
  pts(st, 'kf', 18, 13, r => [r() * 2 - 1, r(), Math.floor(r() * 3)]).forEach(([dx, k, c]) => { ctx.fillStyle = ['#ff7a8a', '#ffe14a', '#ffffff'][c]; ctx.beginPath(); ctx.arc(cx + dx * 70, cy + 196 + k * 96 + Math.sin(t * 2 + dx * 9) * 1.5, 3.4, 0, TAU); ctx.fill(); });
  ctx.restore();
  ctx.strokeStyle = '#e0bb6c'; ctx.lineWidth = 5; hole(); ctx.stroke();
  falling(ctx, st, w, h, t, { n: 28, kind: 'dot', colors: ['#ffd28a'], speed: 12, up: true, size: 1.4, sway: 16, alpha: .5, fade: true, area: [.55, 1] });
  shade(ctx, w, h, ['l', '8,6,4', .9]);
}
/* --- ikinci adam: sönmüş köyde tek ışık --- */
function loneLightScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#060a18', '#101a36', '#222a4c', '#3a3654']);
  drawStars(ctx, st, w, h, t, 140, .62, 44);
  const mx = w * .93, my = h * .1; glow(ctx, mx, my, 110, '255,236,190', .26); ctx.fillStyle = '#f6e7c2'; ctx.beginPath(); ctx.arc(mx, my, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#0d1530'; ctx.beginPath(); ctx.arc(mx + 9, my - 5, 20, 0, TAU); ctx.fill();
  hills(ctx, w, h, h * .8, 28, 280, 2.6, '#151a34');
  const gy = h * .885, H = st.lh || (st.lh = (() => { const r = srng(29), a = []; for (let x = 16; x < w - 70;) { const bw = 74 + r() * 60, bh = 54 + r() * 42; a.push([x, bw, bh, r()]); x += bw + 16 + r() * 46; } return a; })());
  const lit = Math.floor(H.length * .72);
  H.forEach(([x, bw, bh, q], i) => {
    ctx.fillStyle = '#090b17'; ctx.fillRect(x, gy - bh, bw, bh + 4); ctx.beginPath(); ctx.moveTo(x - 9, gy - bh); ctx.lineTo(x + bw / 2, gy - bh - 26 - q * 16); ctx.lineTo(x + bw + 9, gy - bh); ctx.fill(); ctx.fillRect(x + bw * .7, gy - bh - 34, 10, 30);
    const wx = x + bw * .22, wy = gy - bh * .66;
    if (i === lit) { glow(ctx, wx + 10, wy + 12, 170 + 10 * Math.sin(t * 2.2), '255,190,90', .55); ctx.fillStyle = '#ffd27a'; ctx.fillRect(wx, wy, 20, 24); ctx.fillStyle = '#090b17'; ctx.fillRect(wx + 9, wy, 2, 24); ctx.fillRect(wx, wy + 11, 20, 2);
      ctx.strokeStyle = 'rgba(200,205,225,.22)'; ctx.lineWidth = 4; ctx.beginPath(); for (let y = 0; y < 120; y += 6) ctx.lineTo(x + bw * .7 + 5 + Math.sin(y * .05 + t * 1.2) * (4 + y * .1), gy - bh - 36 - y); ctx.stroke(); }
    else { ctx.fillStyle = '#141931'; ctx.fillRect(wx, wy, 20, 24); ctx.fillRect(x + bw * .58, wy, 20, 24); }
  });
  ctx.fillStyle = '#05060d'; ctx.fillRect(0, gy, w, h - gy);
  const L = H[lit]; if (L) { const g = ctx.createLinearGradient(0, gy, 0, h); g.addColorStop(0, 'rgba(255,196,110,.35)'); g.addColorStop(1, 'rgba(255,196,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(L[0] + L[1] * .2, gy); ctx.lineTo(L[0] + L[1] * .5, gy); ctx.lineTo(L[0] + L[1] * .9, h); ctx.lineTo(L[0] - L[1] * .5, h); ctx.closePath(); ctx.fill(); }
}
Object.assign(SCENES, {
  tokmakyakin: { name: 'Tokmak, yakın plan', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['tokmak', 'çal', 'ses', 'ikaz', 'uyar'], aff: { alinti: 1 }, draw: M(doorScene, { zoom: 1 }) },
  devekabir: { name: 'Devekuşu ve kabir', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['devekuşu', 'avcı', 'ölüm', 'kabir', 'temsil', 'hakikat'], aff: { temsil: 1 }, draw: split(M(ostrichScene, { x: .66, s: .8, solo: 1 }), M(gravesScene, {})) },
  dalis: { name: 'Derine inen fener', fam: 'su', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['dalmak', 'gaflete dal', 'bat', 'derin', 'boğul', 'sön'], aff: { alinti: 1 }, draw: diveScene },
  basamak: { name: 'İnen basamaklar', fam: 'yol', modes: ['dini', 'is'], tone: 'dark', pos: 'n', tags: ['basamak', 'merdiven', 'adım adım', 'iniş', 'derece', 'aşama'], aff: { timeline: 2 }, draw: stairsScene },
  anahtardeligi: { name: 'Anahtar deliği', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['hasr-ı nazar', 'dar', 'bakış', 'nazar', 'yalnız dünya', 'anahtar'], aff: { alinti: 1 }, draw: keyholeScene },
  tekisik: { name: 'Sönmüş köyde tek ışık', fam: 'koy', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yalnız', 'misafir', 'firak', 'ayrılık', 'teselli', 'tek ışık', 'biçare'], aff: { alinti: 1 }, draw: loneLightScene },
  kabirkapisi: { name: 'Kabir kapısı', fam: 'kabir', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['kabir kapısı', 'herkes', 'arkadaş', 'yalnız', 'öbür taraf', 'kalabalık'], aff: { alinti: 1 }, draw: M(gravesScene, { gate: 1 }) }
});
/* ===== Açıklama slaytları için özel sahneler ===== */
const AR_F = (px, fam) => `${px}px ${fam === 'h' ? "'KursuHusrev'," : "'KursuArabi',"} 'Amiri', 'Noto Naskh Arabic', serif`;
/* İbret: iki yakayı bağlayan köprü; solda عبور, sağda عبرت */
function bridgeScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0b0d1e', '#1f1d3c', '#4b3354', '#a2604e', '#e09a5c']);
  drawStars(ctx, st, w, h, t, 90, .4, 61);
  const sx = w * .86, sy = h * .7; glow(ctx, sx, sy, 480, '255,206,140', .5);
  const by = h * .8, L = w * .27, R = w * .73;
  mist(ctx, w, h, h * .9, '200,150,150', .35);
  ctx.fillStyle = '#05050c'; ctx.fillRect(L - 10, by + 40, R - L + 20, h);
  const cliff = (x0, x1, dir, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, h); ctx.lineTo(x0, by + 2); ctx.lineTo(x1 - dir * 6, by + 2); ctx.lineTo(x1, by + 30); ctx.lineTo(x1 - dir * 18, by + 90); ctx.lineTo(x1 + dir * 4, by + 150); ctx.lineTo(x1 - dir * 24, h); ctx.closePath(); ctx.fill(); };
  cliff(0, L, 1, '#141022'); cliff(w, R, -1, '#2a1a1c');
  const rg = ctx.createLinearGradient(R, 0, w, 0); rg.addColorStop(0, 'rgba(255,200,130,.0)'); rg.addColorStop(1, 'rgba(255,200,130,.35)'); ctx.fillStyle = rg; ctx.fillRect(R, by + 2, w - R, 6);
  /* köprü */
  const n = 3, sw = (R - L) / n;
  ctx.fillStyle = '#3a2a2a'; ctx.fillRect(L - 8, by - 16, R - L + 16, 22);
  ctx.save(); ctx.beginPath(); ctx.rect(L, by + 6, R - L, 110); ctx.clip();
  for (let i = 0; i < n; i++) { const cx = L + sw * (i + .5); ctx.fillStyle = '#2e2124'; ctx.fillRect(L + sw * i, by + 6, sw, 110); ctx.fillStyle = '#05050c'; ctx.beginPath(); ctx.ellipse(cx, by + 116, sw * .4, 92, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = 'rgba(255,210,150,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, by + 116, sw * .4 + 6, 98, 0, Math.PI, 0); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; for (let x = L; x < R; x += 26) { ctx.beginPath(); ctx.moveTo(x, by - 16); ctx.lineTo(x, by + 6); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,214,150,.55)'; ctx.fillRect(L - 8, by - 17, R - L + 16, 2);
  /* geçen ışık */
  const k = (t * .07) % 1, wx = L - 40 + k * (R - L + 120), wy = by - 22 - Math.abs(Math.sin(k * 60)) * 2;
  glow(ctx, wx, wy - 12, 90 + k * 120, '255,214,140', .45 + k * .35);
  ctx.fillStyle = '#1a1116'; ctx.beginPath(); ctx.ellipse(wx, wy - 18, 7, 20, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(wx, wy - 42, 7, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(wx + 12, wy - 26, 4.5, 0, TAU); ctx.fill();
  /* iki yaka: kelimeler */
  const lab = (x, ar, tr, a) => { ctx.save(); ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.globalAlpha = a; ctx.fillStyle = '#e8c878'; ctx.font = AR_F(92, 'h'); ctx.fillText(ar, x, by - 64); ctx.direction = 'ltr'; ctx.font = "italic 21px 'KursuSerif', Georgia, serif"; ctx.fillStyle = 'rgba(244,228,200,.85)'; ctx.fillText(tr, x, by - 30); ctx.restore(); };
  lab(w * .135, 'عبور', 'ubûr · geçmek', .75 + .25 * Math.sin(t * .8));
  glow(ctx, w * .865, by - 70, 150, '255,206,130', .25 + .1 * Math.sin(t * .8 + 2));
  lab(w * .865, 'عبرت', 'ibret · geçilen ders', 1);
  ctx.save(); ctx.globalAlpha = .55; ctx.font = AR_F(48, 'h'); ctx.fillStyle = '#e8c878'; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ['ع', 'ب', 'ر'].forEach((c, i) => ctx.fillText(c, R - sw * (i + .5), by + 70)); ctx.restore();
}
/* Göz / basiret (split için yarım) */
function eyeScene(ctx, w, h, t, st, p) {
  const b = !!p.basiret;
  rad(ctx, w, h, b ? ['#3a2814', '#160e07', '#060403'] : ['#20242c', '#0d0f14', '#050608'], .5, .6, .8);
  const cx = w * .5, cy = h * .62, ew = w * .36, eh = h * .17, blink = Math.max(0, 1 - Math.abs(((t * .22) % 1) - .5) * 40) ;
  const open = 1 - blink;
  if (b) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .05; const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * 360, cy + Math.sin(a) * 360); g.addColorStop(0, 'rgba(255,214,140,.16)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a - .05) * 380, cy + Math.sin(a - .05) * 380); ctx.lineTo(cx + Math.cos(a + .05) * 380, cy + Math.sin(a + .05) * 380); ctx.closePath(); ctx.fill(); } ctx.restore(); glow(ctx, cx, cy, 300, '255,200,120', .3); }
  const shape = () => { ctx.beginPath(); ctx.moveTo(cx - ew, cy); ctx.quadraticCurveTo(cx, cy - eh * 2 * open, cx + ew, cy); ctx.quadraticCurveTo(cx, cy + eh * 2 * open, cx - ew, cy); ctx.closePath(); };
  ctx.fillStyle = b ? '#f6ead2' : '#c9ccd2'; shape(); ctx.fill();
  ctx.save(); shape(); ctx.clip();
  const ir = eh * 1.05;
  if (b) { const g = ctx.createLinearGradient(0, cy - ir, 0, cy + ir); g.addColorStop(0, '#0d1a3a'); g.addColorStop(.55, '#d98a4e'); g.addColorStop(.62, '#ffd890'); g.addColorStop(1, '#3a2010'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, ir, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff3cf'; ctx.beginPath(); ctx.arc(cx, cy + ir * .18, ir * .2, Math.PI, 0); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(cx + Math.cos(i * 2.4) * ir * .6, cy - ir * .45 + Math.sin(i * 1.7) * ir * .2, 1.4, 0, TAU); ctx.fill(); } }
  else { const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, ir); g.addColorStop(0, '#2a2e36'); g.addColorStop(1, '#5c6370'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, ir, 0, TAU); ctx.fill(); ctx.fillStyle = '#0a0b0e'; ctx.beginPath(); ctx.arc(cx, cy, ir * .42, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(220,226,235,.55)'; ctx.fillRect(cx - ir * .3, cy - ir * .1, ir * .6, ir * .16); }
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(cx + ir * .35, cy - ir * .38, ir * .13, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = b ? '#5a3a1a' : '#30343c'; ctx.lineWidth = 5; shape(); ctx.stroke();
  ctx.strokeStyle = b ? 'rgba(90,58,26,.8)' : 'rgba(48,52,60,.8)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { const u = .15 + i * .088, x = cx - ew + u * 2 * ew, y = cy - eh * 2 * open * 4 * u * (1 - u) / 2 * 2 * .5 - 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (u - .5) * 30, y - 22 * open); ctx.stroke(); }
}
/* Kapı arkası: içeriden, vurulan kapı */
function doorInsideScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#1d140c', '#0b0806', '#030202'], .78, .6, .8);
  const dx = w * .66, dw = 250, dt = h * .14, db = h * .86, ph = (t * .62) % 1, knock = ph < .08 || (ph > .14 && ph < .22) ? 1 : 0, pulse = Math.max(0, 1 - ((ph < .14 ? ph : ph - .14) / .3));
  ctx.fillStyle = '#0e0a07'; ctx.beginPath(); ctx.moveTo(0, db); ctx.lineTo(w, db); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,150,.05)'; for (let i = 1; i < 9; i++) { ctx.beginPath(); ctx.moveTo(dx + dw / 2, db); ctx.lineTo(dx + dw / 2 + (i - 4.5) * 280, h); ctx.stroke(); }
  /* kapı kasası */
  ctx.fillStyle = '#2a1d12'; ctx.fillRect(dx - 18, dt - 18, dw + 36, db - dt + 18);
  const g = ctx.createLinearGradient(dx, 0, dx + dw, 0); g.addColorStop(0, '#3b2614'); g.addColorStop(.5, '#4e331b'); g.addColorStop(1, '#382412'); ctx.fillStyle = g; ctx.fillRect(dx, dt, dw, db - dt);
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3; [[.08, .06, .84, .38], [.08, .5, .84, .42]].forEach(([a, b2, c, d]) => ctx.strokeRect(dx + dw * a, dt + (db - dt) * b2, dw * c, (db - dt) * d));
  ctx.fillStyle = '#b8924a'; ctx.beginPath(); ctx.arc(dx + dw * .14, dt + (db - dt) * .52, 7, 0, TAU); ctx.fill();
  /* aralıklardan sızan ışık */
  const I = .55 + .45 * pulse;
  ctx.fillStyle = `rgba(255,214,140,${.9 * I})`; ctx.fillRect(dx - 2, db - 3, dw + 4, 4); ctx.fillRect(dx + dw, dt, 3, db - dt);
  const fg = ctx.createLinearGradient(0, db, 0, h); fg.addColorStop(0, `rgba(255,200,120,${.55 * I})`); fg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(dx, db); ctx.lineTo(dx + dw, db); ctx.lineTo(dx + dw + 260, h); ctx.lineTo(dx - 300, h); ctx.closePath(); ctx.fill();
  glow(ctx, dx + dw / 2, db, 300, '255,200,120', .25 * I);
  /* vuruş halkaları */
  for (let i = 0; i < 3; i++) { const k = ((ph - i * .07) % 1 + 1) % 1; if (k > .5) continue; ctx.strokeStyle = `rgba(255,214,150,${(1 - k * 2) * .5})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(dx + dw / 2, dt + (db - dt) * .45, 60 + k * 700, 0, TAU); ctx.stroke(); }
  if (knock) { ctx.save(); ctx.translate((Math.random() - .5) * 0, 0); ctx.restore(); }
  falling(ctx, st, w, h, t, { n: 40, kind: 'dot', colors: ['#ffd9a0'], speed: 8, up: true, size: 1.3, sway: 20, alpha: .45 * I, fade: true, area: [.45, 1] });
  shade(ctx, w, h, ['l', '6,4,3', .9]);
}
/* Serap: gurûr */
function mirageScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#5f8fb8', '#b9cbd2', '#f1dcb4', '#e9b878']);
  glow(ctx, w * .5, h * .12, 520, '255,250,230', .7);
  const hz = h * .74;
  /* serap gölü */
  const mg = ctx.createLinearGradient(0, hz - 8, 0, hz + 30); mg.addColorStop(0, 'rgba(160,200,225,0)'); mg.addColorStop(.4, 'rgba(160,200,225,.75)'); mg.addColorStop(1, 'rgba(160,200,225,0)'); ctx.fillStyle = mg; ctx.fillRect(0, hz - 8, w, 38);
  const palm = (x, y, s, flip, a) => { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, flip ? -s : s); ctx.strokeStyle = '#3c4a3a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(8, -40, 4, -80); ctx.stroke(); ctx.fillStyle = '#3c4a3a'; for (let i = 0; i < 6; i++) { const a2 = -Math.PI / 2 + (i - 2.5) * .55; ctx.beginPath(); ctx.ellipse(4 + Math.cos(a2) * 22, -80 + Math.sin(a2) * 10 + 6, 26, 5, a2, 0, TAU); ctx.fill(); } ctx.restore(); };
  for (let i = 0; i < 5; i++) { const x = w * (.58 + i * .07) + Math.sin(t * 3 + i) * 2; palm(x, hz - 2, .6 + (i % 2) * .2, false, .35 + .15 * Math.sin(t * 1.7 + i)); ctx.save(); ctx.beginPath(); ctx.rect(0, hz, w, 40); ctx.clip(); ctx.translate(Math.sin(t * 5 + i) * 3, 0); palm(x, hz + 2, .6 + (i % 2) * .2, true, .25); ctx.restore(); }
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; for (let i = 0; i < 7; i++) { const y = hz + 2 + i * 4; ctx.beginPath(); for (let x = 0; x <= w; x += 14) ctx.lineTo(x, y + Math.sin(x / 30 + t * 4 + i) * 1.2); ctx.stroke(); }
  /* kum */
  ctx.fillStyle = '#d9a866'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, hz + 26 + 10 * Math.sin(x / 200 + 1)); ctx.lineTo(w, h); ctx.fill();
  ctx.fillStyle = '#c08e50'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, h * .9 - 22 * Math.sin(x / 260 + 2.4)); ctx.lineTo(w, h); ctx.fill();
  /* yolcu ve deve */
  const k = (t * .012) % 1, vx = w * (.12 + k * .2), vy = h * .9 - 22 * Math.sin(vx / 260 + 2.4); ctx.fillStyle = '#4a2e1a';
  ctx.save(); ctx.translate(vx, vy); const st2 = Math.sin(t * 3) * 4;
  ctx.beginPath(); ctx.ellipse(0, -46, 38, 18, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-6, -64, 16, 12, 0, 0, TAU); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#4a2e1a'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(30, -50); ctx.quadraticCurveTo(52, -70, 50, -88); ctx.stroke(); ctx.beginPath(); ctx.ellipse(56, -88, 10, 6, .2, 0, TAU); ctx.fill();
  [[-26, st2], [-14, -st2], [20, st2], [30, -st2]].forEach(([x, s]) => { ctx.beginPath(); ctx.moveTo(x, -36); ctx.lineTo(x + s, 0); ctx.stroke(); });
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(80, -2); ctx.lineTo(82 - st2, -30); ctx.lineTo(80, -56); ctx.stroke(); ctx.beginPath(); ctx.arc(81, -64, 7, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(80, -48); ctx.lineTo(62, -60); ctx.stroke();
  ctx.restore();
  falling(ctx, st, w, h, t, { n: 50, kind: 'dot', colors: ['#fff1d0'], speed: 6, up: true, size: 1.2, sway: 30, alpha: .35, fade: true, area: [0, 1] });
}
/* Gemi: su altında olursa yüzdürür */
function shipScene(ctx, w, h, t, st) {
  const hz = h * .66;
  lin(ctx, w, hz + 2, ['#0a1430', '#22305a', '#5a4a72', '#c08070'], 0, hz);
  drawStars(ctx, st, w, hz, t, 90, .7, 71);
  const mx = w * .9, my = h * .2; glow(ctx, mx, my, 160, '255,236,190', .3); ctx.fillStyle = '#f6e7c2'; ctx.beginPath(); ctx.arc(mx, my, 30, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#4a4060'); g.addColorStop(1, '#070a18'); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
  for (let y = hz + 3; y < h; y += 6) { const k = (y - hz) / (h - hz), ww = (10 + k * 120) * (.6 + .4 * Math.sin(t * 2 + y * .3)); ctx.fillStyle = `rgba(255,236,190,${.4 * (1 - k * .5)})`; ctx.fillRect(mx - ww / 2 + Math.sin(t + y * .1) * 6, y, ww, 2); }
  const sx = w * .74, sy = h * .79 + Math.sin(t * .9) * 4, rot = Math.sin(t * .7) * .035;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot);
  ctx.fillStyle = '#0d0a12'; ctx.beginPath(); ctx.moveTo(-170, -40); ctx.lineTo(170, -40); ctx.lineTo(135, 14); ctx.lineTo(-140, 14); ctx.closePath(); ctx.fill(); ctx.fillRect(-150, -62, 60, 24);
  ctx.fillStyle = 'rgba(255,214,140,.9)'; for (let i = 0; i < 7; i++) ctx.fillRect(-110 + i * 34, -26, 7, 6);
  [[-60, 200], [30, 240], [110, 170]].forEach(([x, H]) => { ctx.fillStyle = '#0d0a12'; ctx.fillRect(x - 3, -40 - H, 6, H); ctx.fillStyle = 'rgba(240,226,200,.85)'; ctx.beginPath(); ctx.moveTo(x + 4, -40 - H + 12); ctx.quadraticCurveTo(x + 40 + Math.sin(t) * 4, -40 - H * .55, x + 4, -54); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 4, -40 - H + 30); ctx.quadraticCurveTo(x - 34, -40 - H * .5, x - 4, -60); ctx.closePath(); ctx.fill(); });
  ctx.restore();
  ctx.strokeStyle = 'rgba(200,210,240,.35)'; ctx.lineWidth = 1.4; for (let i = 0; i < 14; i++) { const k = i / 14, y = hz + Math.pow(k, 1.5) * (h - hz) + 4; ctx.beginPath(); for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x / (40 + k * 60) + t * 1.4 + i) * (1 + k * 4)); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI; ctx.beginPath(); ctx.arc(sx - 150 + i * 15, sy + 16 + Math.sin(t * 3 + i) * 2, 1.6, 0, TAU); ctx.fill(); }
  shade(ctx, w, h, ['l', '8,10,26', .82]);
}
/* Gaflet: başlar eğik kalabalık, kimsenin bakmadığı gök */
function crowdScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#03040c', '#0b1028', '#1a1d3e', '#2a2448']);
  drawStars(ctx, st, w, h, t, 200, .75, 81);
  ctx.save(); ctx.translate(w * .5, h * .25); ctx.rotate(-.25); ctx.scale(3.2, .28); glow(ctx, 0, 0, 260, '205,195,255', .16); ctx.restore();
  for (let i = 0; i < 3; i++) { const k = ((t * .18 + i * .37) % 1); if (k > .25) continue; const x0 = w * (.2 + i * .3), y0 = h * (.08 + i * .05), q = k / .25; ctx.strokeStyle = `rgba(255,255,255,${(1 - q) * .9})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + q * 260, y0 + q * 110); ctx.lineTo(x0 + q * 260 - 90, y0 + q * 110 - 38); ctx.stroke(); }
  ctx.save(); ctx.translate(0, h * .9); ctx.scale(1, .5); ctx.translate(0, -h * .9); skyline(ctx, st, w, h, h * .9, '#06070f', 91, true); ctx.restore();
  const P = st.cr2 || (st.cr2 = (() => { const r = srng(93), a = []; for (let x = -20; x < w + 20; x += 34 + r() * 26) a.push([x, .8 + r() * .5, r() * 6, r() < .5 ? 1 : -1]); return a; })());
  P.forEach(([x, s, ph, d]) => { const y = h + 6, H = 150 * s;
    ctx.fillStyle = '#020207'; ctx.beginPath(); ctx.moveTo(x - 26 * s, y); ctx.quadraticCurveTo(x - 24 * s, y - H * .62, x, y - H * .66); ctx.quadraticCurveTo(x + 24 * s, y - H * .62, x + 26 * s, y); ctx.fill();
    const hx = x + d * 9 * s, hy = y - H * .74; ctx.beginPath(); ctx.ellipse(hx, hy, 15 * s, 17 * s, d * .5, 0, TAU); ctx.fill();
    const px = x + d * 14 * s, py = y - H * .55; glow(ctx, px, py - 14 * s, 46 * s, '120,170,255', .32 + .06 * Math.sin(t * 2 + ph)); ctx.fillStyle = 'rgba(180,210,255,.95)'; ctx.fillRect(px - 5 * s, py - 4 * s, 10 * s, 6 * s); });
}
/* Ayna: önce kendine */
function mirrorScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#2a1c10', '#110b06', '#050302'], .77, .5, .75);
  const cx = w * .77, cy = h * .5, rx = 150, ry = 220;
  glow(ctx, cx, cy, 420, '255,200,120', .2);
  const fr = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry); fr.addColorStop(0, '#f1d48a'); fr.addColorStop(.5, '#a77b34'); fr.addColorStop(1, '#e4c172'); ctx.fillStyle = fr;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx + 26, ry + 26, 0, 0, TAU); ctx.fill();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (rx + 26), cy + Math.sin(a) * (ry + 26), 9, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(cx - 40, cy - ry - 30); ctx.quadraticCurveTo(cx, cy - ry - 90, cx + 40, cy - ry - 30); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.clip();
  const mg = ctx.createLinearGradient(0, cy - ry, 0, cy + ry); mg.addColorStop(0, '#2c2a30'); mg.addColorStop(1, '#141218'); ctx.fillStyle = mg; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  const fx = cx + 50, fy = cy + 40; glow(ctx, fx, fy - 30, 160, '255,190,90', .5); ctx.fillStyle = '#d8c7a6'; ctx.fillRect(fx - 9, fy - 20, 18, 60); ctx.save(); ctx.translate(fx, fy - 26); const fl = 1 + .08 * Math.sin(t * 9); ctx.scale(1 / fl, fl); ctx.fillStyle = 'rgba(255,190,90,.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-7, -7, -4, -20, 0, -30); ctx.bezierCurveTo(4, -20, 7, -7, 0, 0); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0a0809'; ctx.beginPath(); ctx.ellipse(cx - 40, cy - 30, 46, 54, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - 140, cy + ry); ctx.quadraticCurveTo(cx - 130, cy + 40, cx - 40, cy + 30); ctx.quadraticCurveTo(cx + 40, cy + 40, cx + 40, cy + ry); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sg = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.45 + .05 * Math.sin(t * .5), 'rgba(255,255,255,.1)'); sg.addColorStop(.55, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2); ctx.restore();
  ctx.restore();
  falling(ctx, st, w, h, t, { n: 30, kind: 'dot', colors: ['#ffd9a0'], speed: 9, up: true, size: 1.3, sway: 18, alpha: .45, fade: true, area: [.55, 1] });
  shade(ctx, w, h, ['l', '8,5,3', .9]);
}
/* Avcının gölgesi ve devekuşu */
function hunterScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#070816', '#141a36', '#2c2c50', '#4e4062']);
  drawStars(ctx, st, w, h, t, 160, .6, 101);
  const mx = w * .82, my = h * .6; glow(ctx, mx, my, 360, '230,225,255', .35); ctx.fillStyle = '#efeaf6'; ctx.beginPath(); ctx.arc(mx, my, 40, 0, TAU); ctx.fill();
  const gy = h * .8;
  ctx.fillStyle = '#9c8cae'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy + 8 * Math.sin(x / 240 + 1.2)); ctx.lineTo(w, h); ctx.fill();
  const sg = ctx.createLinearGradient(0, gy, 0, h); sg.addColorStop(0, 'rgba(60,40,80,0)'); sg.addColorStop(1, 'rgba(30,20,50,.5)'); ctx.fillStyle = sg; ctx.fillRect(0, gy - 10, w, h - gy + 10);
  const grow = 1 + .06 * Math.sin(t * .4);
  const hx = w * .9, hy = gy + 6, sc = .62;
  ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#100a1e'; ctx.beginPath(); ctx.moveTo(hx - 20, hy + 2); ctx.lineTo(hx + 20, hy + 2); ctx.lineTo(w * .22, hy + 46); ctx.lineTo(w * .2, hy + 34); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(hx, hy); ctx.scale(sc * grow, sc * grow); ctx.fillStyle = '#0c0816'; ctx.strokeStyle = '#0c0816'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(0, -300, 24, 28, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, -268); ctx.lineTo(34, -268); ctx.lineTo(40, -134); ctx.lineTo(-40, -134); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(-20, -140); ctx.lineTo(-28, 0); ctx.moveTo(20, -140); ctx.lineTo(30, 0); ctx.stroke();
  ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-26, -250); ctx.lineTo(-104, -236); ctx.stroke(); ctx.beginPath(); ctx.moveTo(26, -252); ctx.lineTo(-30, -240); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(-40, -238, 92, Math.PI - 1.2, Math.PI + 1.2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-40 + Math.cos(Math.PI - 1.2) * 92, -238 + Math.sin(Math.PI - 1.2) * 92); ctx.lineTo(-20, -238); ctx.lineTo(-40 + Math.cos(Math.PI + 1.2) * 92, -238 + Math.sin(Math.PI + 1.2) * 92); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, -238); ctx.lineTo(-170, -238); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-170, -238); ctx.lineTo(-156, -246); ctx.lineTo(-156, -230); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(w * .1, gy + 62); ctx.scale(.5, .5); ctx.fillStyle = '#120c1c'; ctx.strokeStyle = '#120c1c'; ctx.lineCap = 'round';
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-10, -90); ctx.lineTo(-6, 0); ctx.moveTo(14, -90); ctx.lineTo(22, 0); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(6, -120, 66, 42, -.15, 0, TAU); ctx.fill(); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(62 + Math.cos(-.8 + i * .3) * 20, -124 - Math.sin(-.8 + i * .3) * 24, 24, 11, -.8 + i * .3, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(-46, -136); ctx.bezierCurveTo(-110, -190, -150, -90, -140, 4); ctx.stroke();
  ctx.fillStyle = '#7d6e92'; ctx.beginPath(); ctx.ellipse(-140, 8, 40, 14, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
  falling(ctx, st, w, h, t, { n: 50, kind: 'dot', colors: ['#d8d0f0'], speed: 22, size: 1.2, sway: 40, drift: -60, alpha: .35, area: [0, 1] });
}
/* Takvim: yapraklar kopup uçuyor */
function calendarScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#1a1024', '#3a1f30', '#7a3a3a', '#d07a4a']);
  glow(ctx, w * .82, h * .9, 520, '255,180,110', .45);
  const cx = w * .8, cy = h * .52, cw = 220, ch = 260;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(cx - cw / 2 + 14, cy - ch / 2 + 18, cw, ch);
  ctx.fillStyle = '#e8ddc8'; ctx.fillRect(cx - cw / 2, cy - ch / 2 + 6, cw, ch);
  ctx.fillStyle = '#f6efe0'; ctx.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
  ctx.fillStyle = '#8a2a24'; ctx.fillRect(cx - cw / 2, cy - ch / 2, cw, 52);
  ctx.fillStyle = '#d8c7a6'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(cx - cw / 2 + 28 + i * 33, cy - ch / 2 - 2, 7, 0, TAU); ctx.fill(); }
  const day = 31 - Math.floor(t * .5) % 30;
  ctx.fillStyle = '#2a1a14'; ctx.font = "700 130px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText(String(day), cx, cy + 74);
  ctx.fillStyle = '#f6efe0'; ctx.font = "600 20px 'KursuSerif', Georgia, serif"; ctx.fillText('BUGÜN', cx, cy - ch / 2 + 34);
  /* uçan yapraklar */
  for (let i = 0; i < 9; i++) { const k = ((t * .11 + i / 9) % 1), x = cx + 40 + k * 260 + Math.sin(k * 9 + i) * 50, y = cy - ch / 2 - 20 - k * 420 + Math.sin(i) * 30, r = k * 6 + i, s = .55 - k * .25;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s * (.6 + .4 * Math.cos(k * 14 + i))); ctx.globalAlpha = Math.min(1, (1 - k) * 1.6) * .9; ctx.fillStyle = '#f6efe0'; ctx.fillRect(-cw / 2, -ch / 2, cw, ch); ctx.fillStyle = '#8a2a24'; ctx.fillRect(-cw / 2, -ch / 2, cw, 52); ctx.fillStyle = '#2a1a14'; ctx.font = "700 120px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText(String((day + i + 1) % 31 + 1), 0, 70); ctx.restore(); }
  ctx.globalAlpha = 1;
  shade(ctx, w, h, ['l', '20,10,22', .86]);
}
/* Anahtarlar */
function keysScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#1e2a2a', '#0b1212', '#040707'], .78, .4, .8);
  const rx = w * .78, ry = h * .14; glow(ctx, rx, h * .5, 460, '214,180,106', .2);
  ctx.strokeStyle = '#7a6236'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, ry - 22); ctx.stroke();
  ctx.strokeStyle = '#d6b46a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(rx, ry, 24, 0, TAU); ctx.stroke();
  const key = (len, bit) => { ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 30, 22, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 30, 9, 0, TAU); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * Math.PI / 2 + .785) * 24, 30 + Math.sin(i * Math.PI / 2 + .785) * 24, 6, 0, TAU); ctx.fill(); }
    ctx.fillRect(-4, 52, 8, len); ctx.fillRect(-14, 70, 28, 6); bit.forEach(([y, wd, hh]) => ctx.fillRect(4, 52 + len - y, wd, hh)); };
  const K = [[150, [[30, 22, 10], [10, 30, 12]]], [190, [[40, 18, 8], [22, 26, 10], [6, 14, 8]]], [130, [[20, 28, 14]]], [170, [[34, 16, 10], [12, 24, 12]]]];
  K.forEach(([len, bit], i) => { const a = (i - 1.5) * .3 + Math.sin(t * .9 + i * 1.3) * .08; ctx.save(); ctx.translate(rx + Math.sin(a) * 24, ry + Math.cos(a) * 24); ctx.rotate(-a); const g = ctx.createLinearGradient(-20, 0, 20, len); g.addColorStop(0, '#f2d68e'); g.addColorStop(.5, '#b58a3e'); g.addColorStop(1, '#e8c878'); ctx.strokeStyle = g; ctx.fillStyle = g; key(len, bit); ctx.restore(); glow(ctx, rx + Math.sin(a) * (len + 80), ry + Math.cos(a) * (len + 80), 50, '255,220,150', .15); });
  falling(ctx, st, w, h, t, { n: 30, kind: 'dot', colors: ['#e8c878'], speed: 10, up: true, size: 1.3, sway: 20, alpha: .4, fade: true, area: [.55, 1] });
  shade(ctx, w, h, ['l', '4,8,8', .9]);
}
/* Misafir: kardaki gelen-giden izler */
function footprintsScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0a1226', '#1a2a4a', '#3a4a6a', '#6a7a96']);
  drawStars(ctx, st, w, h, t, 80, .45, 111);
  const gy = h * .76;
  ctx.fillStyle = '#d6e0ee'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy + 6 * Math.sin(x / 180)); ctx.lineTo(w, h); ctx.fill();
  const dx = w * .86, dy = gy + 4; glow(ctx, dx, dy - 90, 300, '255,200,120', .45 + .05 * Math.sin(t * 2));
  ctx.fillStyle = '#1a1420'; ctx.fillRect(dx - 70, dy - 230, 140, 232); ctx.beginPath(); ctx.moveTo(dx - 90, dy - 230); ctx.lineTo(dx, dy - 290); ctx.lineTo(dx + 90, dy - 230); ctx.fill();
  ctx.fillStyle = '#ffd890'; ctx.fillRect(dx - 40, dy - 150, 80, 150); ctx.fillStyle = '#ffe8b8'; ctx.beginPath(); ctx.arc(dx + 60, dy - 168, 8, 0, TAU); ctx.fill(); glow(ctx, dx + 60, dy - 168, 60, '255,214,140', .6);
  const lg = ctx.createLinearGradient(0, dy, 0, h); lg.addColorStop(0, 'rgba(255,214,140,.45)'); lg.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(dx - 40, dy); ctx.lineTo(dx + 40, dy); ctx.lineTo(dx + 160, h); ctx.lineTo(dx - 200, h); ctx.fill();
  const trail = (y0, y1, dir, age) => { for (let i = 0; i < 22; i++) { const u = i / 21, x = w * .02 + u * (dx - 60 - w * .02), y = y0 + (y1 - y0) * u + (i % 2 ? 7 : -7); const a = dir > 0 ? .15 + u * .55 : .7 - u * .5; ctx.globalAlpha = a * age; ctx.fillStyle = '#7a8aa8'; ctx.save(); ctx.translate(x, y); ctx.rotate(dir > 0 ? .1 : Math.PI + .1); ctx.beginPath(); ctx.ellipse(0, 0, 9, 4.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(9, 0, 3.5, 3.5, 0, 0, TAU); ctx.fill(); ctx.restore(); } ctx.globalAlpha = 1; };
  trail(h * .95, dy + 10, 1, 1); trail(dy + 22, h * .86, -1, .8);
  falling(ctx, st, w, h, t, { n: 140, kind: 'snow', colors: ['#f2f6fb'], speed: 28, size: 2, sway: 30, alpha: .8 });
}
/* İki kuş: kişi sevdiğiyle beraberdir */
function twoBirdsScene(ctx, w, h, t, st) {
  const hz = h * .78;
  lin(ctx, w, hz + 2, ['#2a2a5a', '#6a5a8a', '#d89a8a', '#ffd8a0'], 0, hz);
  const sx = w * .82, sy = hz; glow(ctx, sx, sy, 560, '255,214,150', .7); ctx.fillStyle = 'rgba(255,240,210,.98)'; ctx.beginPath(); ctx.arc(sx, sy, 60, Math.PI, 0); ctx.fill();
  clouds(ctx, st, w, hz, t, 4, h * .5, h * .7, '255,200,170', .3, 121, 4);
  const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#c8907a'); g.addColorStop(1, '#2a2040'); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
  for (let y = hz + 3; y < h; y += 5) { const k = (y - hz) / (h - hz), ww = (40 + k * 220) * (.6 + .4 * Math.sin(t * 2 + y * .3)); ctx.fillStyle = `rgba(255,236,190,${.55 * (1 - k * .5)})`; ctx.fillRect(sx - ww / 2 + Math.sin(t + y * .1) * 6, y, ww, 2); }
  const bird = (x, y, s, ph) => { const f = Math.sin(t * 3.2 + ph); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#2a1a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 7, -.08, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(22, -3, 6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(27, -3); ctx.lineTo(36, 0); ctx.lineTo(27, 1); ctx.fill(); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-38, -8); ctx.lineTo(-36, 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, -2); ctx.quadraticCurveTo(-20, -40 * f - 10, -50, -46 * f); ctx.quadraticCurveTo(-10, -20 * f, 10, -2); ctx.fill(); ctx.restore(); };
  const bx = w * .58 + Math.sin(t * .3) * 30, by = h * .3 + Math.sin(t * .6) * 10;
  bird(bx, by, 1.6, 0); bird(bx + 84 + Math.sin(t * .5) * 6, by + 46 + Math.cos(t * .5) * 6, 1.45, .35);
  shade(ctx, w, h, ['l', '30,24,60', .7]);
}
/* Sebep ve hikmet */
function blueprintScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#123a6a'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(200,225,255,.12)'; ctx.lineWidth = 1; for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(230,242,255,.85)'; ctx.lineWidth = 2;
  const bx = w * .26, bw = w * .48, base = h * .78; ctx.strokeRect(bx, base - 300, bw, 300);
  for (let f = 1; f < 5; f++) { ctx.beginPath(); ctx.moveTo(bx, base - f * 60); ctx.lineTo(bx + bw, base - f * 60); ctx.stroke(); }
  for (let c = 0; c <= 4; c++) { const x = bx + c * bw / 4; ctx.fillStyle = 'rgba(230,242,255,.25)'; ctx.fillRect(x - 5, base - 300, 10, 300); }
  ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(bx - 20, base + 30); ctx.lineTo(bx + bw + 20, base + 30); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); for (let x = 0; x <= w; x += 3) { const c = x / w - .5, env = Math.exp(-c * c * 30); ctx.lineTo(x, base + 60 + Math.sin(x * .25 + t * 6) * (2 + env * 22) * Math.sin(x * .04 + t)); } ctx.stroke();
}
function bloomRubbleScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#f6e2b8', '#f2cf92', '#d8a868']);
  glow(ctx, w * .5, h * .25, 380, '255,250,220', .8);
  const base = h * .82;
  ctx.fillStyle = '#7a6250'; pts(st, 'rb', 26, 131, r => [r() * w, 14 + r() * 40, r() * 30 + 20]).forEach(([x, hh, ww]) => { ctx.beginPath(); ctx.moveTo(x - ww, base + 4); ctx.lineTo(x - ww * .4, base - hh); ctx.lineTo(x + ww * .3, base - hh * .7); ctx.lineTo(x + ww, base + 4); ctx.fill(); });
  ctx.fillStyle = '#5a4636'; ctx.fillRect(0, base, w, h - base);
  pts(st, 'sp', 24, 141, r => [r() * w, r() * 6, .7 + r() * .7, r() < .45]).forEach(([x, ph, s, fl]) => { const sw = Math.sin(t * 1.3 + ph) * 3, y = base + 2; ctx.strokeStyle = '#4e7a30'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw, y - 30 * s, x + sw, y - 46 * s); ctx.stroke(); ctx.fillStyle = '#7ab04e'; ctx.beginPath(); ctx.ellipse(x + sw - 9 * s, y - 32 * s, 10 * s, 4 * s, -.5, 0, TAU); ctx.ellipse(x + sw + 9 * s, y - 38 * s, 10 * s, 4 * s, .5, 0, TAU); ctx.fill();
    if (fl) { glow(ctx, x + sw, y - 50 * s, 26 * s, '255,214,120', .7); ctx.fillStyle = '#ffd36a'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + sw + Math.cos(i * 1.256) * 6 * s, y - 50 * s + Math.sin(i * 1.256) * 6 * s, 5 * s, 3 * s, i * 1.256, 0, TAU); ctx.fill(); } } });
  falling(ctx, st, w, h, t, { n: 60, kind: 'dot', colors: ['#fff6c8', '#ffd36a'], speed: 18, up: true, size: 2, sway: 20, alpha: .8, fade: true, area: [0, 1] });
}
Object.assign(SCENES, {
  kopru: { name: 'Köprü (ibret)', fam: 'kopru', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['ibret', 'köprü', 'geçmek', 'ubûr'], aff: { bigword: 1 }, draw: bridgeScene },
  gozbasiret: { name: 'Göz ve basiret', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['göz', 'basiret', 'bakış'], aff: { compare: 1 }, draw: split(M(eyeScene, {}), M(eyeScene, { basiret: 1 })) },
  kapiarkasi: { name: 'Kapının arkasından', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['tokmak', 'uyandır', 'kapı'], aff: { bigword: 1 }, draw: doorInsideScene },
  serap: { name: 'Serap', fam: 'col', modes: ['dini'], tone: 'light', pos: 'n', vars: INK_LIGHT, tags: ['serap', 'gurûr', 'aldanmak', 'metâ'], aff: { temsil: 1 }, draw: mirageScene },
  gemi: { name: 'Gemi', fam: 'deniz', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['gemi', 'deniz', 'dünya'], aff: { bullets: 1 }, draw: shipScene },
  kalabalik: { name: 'Başı eğik kalabalık', fam: 'ekran', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['gaflet', 'ekran', 'kalabalık'], aff: { bigword: 1 }, draw: crowdScene },
  ayna: { name: 'Ayna', fam: 'ayna', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['nefis', 'ayna', 'kendine'], aff: { bullets: 1 }, draw: mirrorScene },
  avcigolgesi: { name: 'Avcının gölgesi', fam: 'col', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['avcı', 'gölge', 'kaçış', 'devekuşu'], aff: { bigword: 1 }, draw: hunterScene },
  takvim: { name: 'Uçan takvim yaprakları', fam: 'zaman', modes: ['dini', 'is'], tone: 'dark', pos: 'r', tags: ['ertelemek', 'takvim', 'gün', 'vakit'], aff: { bullets: 1 }, draw: calendarScene },
  anahtarlar: { name: 'Anahtarlar', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['anahtar', 'temsil'], aff: { bullets: 1 }, draw: keysScene },
  izler: { name: 'Kardaki izler', fam: 'kis', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['misafir', 'gelip giden', 'iz'], aff: { bigword: 1 }, draw: footprintsScene },
  ikikus: { name: 'Birlikte uçan iki kuş', fam: 'gok', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['beraber', 'sevdiği', 'kavuşma'], aff: { alinti: 1 }, draw: twoBirdsScene },
  sebephikmet: { name: 'Sebep ve hikmet', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['sebep', 'hikmet', 'deprem'], aff: { compare: 1 }, draw: split(blueprintScene, bloomRubbleScene) }
});
/* ===== "Hakk-ı itiraz" dersi için özel sahneler ===== */
/* Felek: iç içe dönen yörüngeler */
function orreryScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#1a1838', '#0a0a1c', '#030308'], .76, .5, .8);
  drawStars(ctx, st, w, h, t, 220, 1, 151);
  const cx = w * .76, cy = h * .5;
  glow(ctx, cx, cy, 300, '255,206,130', .5); ctx.fillStyle = '#ffe9b8'; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.fill();
  const O = [[70, .9, '#c9d4ff', 5], [120, .55, '#ffb07a', 8], [175, .38, '#8fd0ff', 10], [235, .24, '#e8c878', 15], [300, .15, '#d9b8ff', 9], [370, .09, '#fff', 6]];
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.32);
  O.forEach(([r, sp, col, pr], i) => { ctx.strokeStyle = `rgba(232,200,120,${.5 - i * .05})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .42, 0, 0, TAU); ctx.stroke();
    for (let k = 0; k < 60; k++) { const a = k / 60 * TAU; if (k % 5) continue; ctx.fillStyle = 'rgba(232,200,120,.5)'; ctx.fillRect(Math.cos(a) * r - 1, Math.sin(a) * r * .42 - 1, 2, 2); }
    const a = t * sp + i * 1.7, px = Math.cos(a) * r, py = Math.sin(a) * r * .42; glow(ctx, px, py, pr * 3.2, '255,236,200', .35); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill();
    if (i === 3) { ctx.strokeStyle = 'rgba(232,200,120,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, pr * 1.9, pr * .55, .3, 0, TAU); ctx.stroke(); } });
  ctx.restore();
  shade(ctx, w, h, ['l', '6,6,18', .88]);
}
/* Küçücük insan, uçsuz bucaksız gök */
function tinyHumanScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#03040c', '#0a1030', '#1c1f4c', '#3a2c5a', '#7a4a5a']);
  ctx.save(); ctx.translate(w * .55, h * .34); ctx.rotate(-.5); ctx.scale(3.6, .34); glow(ctx, 0, 0, 280, '210,200,255', .22); ctx.restore();
  drawStars(ctx, st, w, h, t, 320, .86, 161);
  const k = (t * .05) % 1; if (k < .35) { const q = k / .35, x0 = w * .25, y0 = h * .1; ctx.strokeStyle = `rgba(255,255,255,${(1 - q) * .9})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + q * 420, y0 + q * 150); ctx.lineTo(x0 + q * 420 - 110, y0 + q * 150 - 40); ctx.stroke(); }
  const gy = x => h * .9 - 46 * Math.exp(-Math.pow((x - w * .84) / 220, 2)) - 6 * Math.sin(x / 200);
  ctx.fillStyle = '#05050d'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy(x)); ctx.lineTo(w, h); ctx.fill();
  const fx = w * .84, fy = gy(fx); glow(ctx, fx, fy - 30, 90, '255,214,150', .22);
  ctx.fillStyle = '#05050d'; ctx.beginPath(); ctx.ellipse(fx, fy - 20, 6, 20, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(fx, fy - 46, 6, 0, TAU); ctx.fill();
}
/* Yağmur: bin filiz ve şemsiyeli tek yolcu */
function rainFieldScene(ctx, w, h, t, st, p) {
  p = p || {};
  const one = p.one, field = p.field;
  lin(ctx, w, h, one ? ['#20262e', '#3a434e', '#56606c'] : field ? ['#3a5a6e', '#7fa6a8', '#d8e0b8'] : ['#141c26', '#26343f', '#3f5458', '#5a7460']);
  if (field) glow(ctx, w * .7, h * .12, 360, '255,246,210', .6);
  clouds(ctx, st, w, h, t, 6, -30, h * .2, one ? '20,24,30' : '40,50,60', .7, 171, 6);
  const gy = h * (one ? .84 : .76);
  if (!one) { const g = ctx.createLinearGradient(0, gy, 0, h); g.addColorStop(0, '#4f7a3c'); g.addColorStop(1, '#22401f'); ctx.fillStyle = g; ctx.fillRect(0, gy, w, h - gy);
    for (let r = 0; r < 7; r++) { const y = gy + 8 + Math.pow(r / 7, 1.5) * (h - gy), s = .5 + r * .16; for (let x = (r % 2) * 14; x < w; x += 26 * s) { const sw = Math.sin(t * 1.5 + x * .1 + r) * 2; ctx.strokeStyle = '#86c05a'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 12 * s); ctx.stroke(); ctx.fillStyle = '#a8dc74'; ctx.beginPath(); ctx.ellipse(x + sw - 4 * s, y - 11 * s, 4.5 * s, 2 * s, -.5, 0, TAU); ctx.ellipse(x + sw + 4 * s, y - 13 * s, 4.5 * s, 2 * s, .5, 0, TAU); ctx.fill(); } } }
  else { ctx.fillStyle = '#1a1e24'; ctx.fillRect(0, gy, w, h - gy); for (let i = 0; i < 6; i++) { const k = (t * .5 + i / 6) % 1, x = w * (.15 + ((i * 37) % 70) / 100), y = gy + 14 + (i % 3) * 22; ctx.strokeStyle = `rgba(200,215,230,${(1 - k) * .5})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, 6 + k * 34, 2 + k * 8, 0, 0, TAU); ctx.stroke(); } }
  if (!field) { const ux = w * (one ? .5 : .88), uy = gy + (one ? 6 : 44), s = one ? 1.5 : .8;
    ctx.save(); ctx.translate(ux, uy); ctx.scale(s, s); ctx.fillStyle = '#0b0d12'; ctx.strokeStyle = '#0b0d12';
    ctx.beginPath(); ctx.ellipse(0, -44, 11, 30, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -84, 10, 0, TAU); ctx.fill(); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-5, -18); ctx.lineTo(-8, 0); ctx.moveTo(5, -18); ctx.lineTo(8, 0); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, -56); ctx.lineTo(14, -130); ctx.stroke(); ctx.beginPath(); ctx.arc(14, -130, 64, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.restore(); }
  falling(ctx, st, w, h, t, { n: one ? 150 : 220, kind: 'drop', colors: [field ? 'rgba(255,255,255,.9)' : '#c8d6e2'], speed: 540, sway: 0, drift: -60, alpha: field ? .4 : .5 });
  if (field) birds(ctx, st, w, h * .5, t, 4, 173, 'rgba(30,50,40,.6)', 1);
}
/* Mühendis: kâinatın planı */
function cosmosPlanScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#0f3460'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(200,225,255,.09)'; ctx.lineWidth = 1; for (let x = 0; x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const cx = w * .8, cy = h * .5; ctx.strokeStyle = 'rgba(232,242,255,.8)'; ctx.fillStyle = 'rgba(232,242,255,.9)';
  [50, 95, 140, 190, 240].forEach((r, i) => { ctx.lineWidth = i % 2 ? 1 : 1.8; ctx.setLineDash(i % 2 ? [6, 6] : []); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]); const a = t * (.5 - i * .08) + i * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 5 + (i % 3) * 2, 0, TAU); ctx.fill(); });
  ctx.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 246, cy + Math.sin(a) * 246); ctx.lineTo(cx + Math.cos(a) * 260, cy + Math.sin(a) * 260); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(cx - 275, cy); ctx.lineTo(cx + 275, cy); ctx.moveTo(cx, cy - 275); ctx.lineTo(cx, cy + 275); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 9, 0, TAU); ctx.fill();
  /* pergel */
  const pa = t * .35, tx = cx + Math.cos(pa) * 190, ty = cy + Math.sin(pa) * 190, hx = (cx + tx) / 2 - Math.sin(pa) * 120, hy = (cy + ty) / 2 + Math.cos(pa) * 120 - 50;
  ctx.strokeStyle = '#e8c878'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke(); ctx.fillStyle = '#e8c878'; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill(); glow(ctx, tx, ty, 40, '255,220,150', .6);
  /* cüz'î heves: eğri büğrü küçük karalama */
  ctx.strokeStyle = 'rgba(255,120,110,.9)'; ctx.lineWidth = 2; ctx.beginPath(); const sx = w * .55, sy = h * .86; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 1.15, r = 16 + Math.sin(i * 1.7) * 5; ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r * .8); } ctx.stroke();
  shade(ctx, w, h, ['l', '8,34,66', .9]);
}
/* Felek çarkları ve sinek kanadı */
function gearsFlyScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#2c2016', '#120d08', '#040302'], .76, .45, .8);
  const gear = (x, y, r, n, a, col, inner) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < n; i++) { const a0 = i / n * TAU, d = TAU / n; ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r); ctx.lineTo(Math.cos(a0 + d * .12) * (r + 16), Math.sin(a0 + d * .12) * (r + 16)); ctx.lineTo(Math.cos(a0 + d * .38) * (r + 16), Math.sin(a0 + d * .38) * (r + 16)); ctx.lineTo(Math.cos(a0 + d * .5) * r, Math.sin(a0 + d * .5) * r); } ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU; ctx.beginPath(); ctx.ellipse(Math.cos(a0) * r * .55, Math.sin(a0) * r * .55, r * .2, r * .13, a0, 0, TAU); ctx.fill(); } ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(0, 0, r * .2, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,230,170,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, TAU); ctx.stroke(); ctx.restore(); };
  const L = st.gl || (st.gl = document.createElement('canvas')); if (L.width !== ctx.canvas.width) { L.width = ctx.canvas.width; L.height = ctx.canvas.height; }
  const g = L.getContext('2d'), sc = ctx.canvas.width / w * (w === 1280 ? 1 : 1); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, L.width, L.height); g.setTransform(L.width / 1280, 0, 0, L.height / 720, 0, 0);
  const o = ctx; ctx = g;
  const a = t * .25;
  gear(w * .8, h * .46, 170, 26, a, '#a8843e', '#3a2a14'); gear(w * .8 + 170 + 16 + 80, h * .46 - 60, 80, 12, -a * 170 / 80 + .2, '#c9a45c', '#3a2a14');
  gear(w * .8 - 120, h * .46 + 250, 100, 15, -a * 170 / 100 + .1, '#8a6a30', '#2a1e0e'); gear(w * .8 + 40, h * .46 - 285, 96, 14, -a * 170 / 96, '#7a5c28', '#2a1e0e');
  ctx = o; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(L, 0, 0); ctx.restore();
  glow(ctx, w * .8, h * .46, 420, '255,200,120', .16);
  for (let i = 0; i < 40; i++) { const an = i * 2.4 + t * .1, rr = 30 + (i * 53 % 150); ctx.fillStyle = 'rgba(255,240,200,.7)'; ctx.beginPath(); ctx.arc(w * .8 + Math.cos(an) * rr, h * .46 + Math.sin(an) * rr, 1.2, 0, TAU); ctx.fill(); }
  /* sinek */
  const fx = w * .6 + Math.sin(t * 1.3) * 14, fy = h * .8 + Math.sin(t * 2.1) * 10, fl = Math.sin(t * 60) * .5;
  glow(ctx, fx, fy, 70, '255,255,255', .12);
  ctx.save(); ctx.translate(fx, fy); ctx.fillStyle = 'rgba(220,235,255,.35)'; ctx.strokeStyle = 'rgba(220,235,255,.7)'; ctx.lineWidth = 1;
  [[-1, -.5 - fl], [1, .5 + fl]].forEach(([d, r]) => { ctx.save(); ctx.rotate(r - Math.PI / 2 * 0); ctx.beginPath(); ctx.ellipse(d * 4, -22, 9, 24, d * .5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); });
  ctx.fillStyle = '#0c0a08'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 12, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -13, 6, 0, TAU); ctx.fill(); ctx.restore();
  shade(ctx, w, h, ['l', '10,7,4', .88]);
}
Object.assign(SCENES, {
  felek: { name: 'Felek yörüngeleri', fam: 'kainat', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['felek', 'nizam', 'yörünge', 'kâinat'], aff: { cover: 1 }, draw: orreryScene },
  kucukinsan: { name: 'Küçük insan, büyük gök', fam: 'kainat', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['insan', 'acz', 'had', 'itiraz'], aff: { alinti: 1 }, draw: tinyHumanScene },
  yagmurtarla: { name: 'Yağmur ve bin filiz', fam: 'su', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yağmur', 'hikmet', 'şikâyet', 'tarla'], aff: { alinti: 1 }, draw: M(rainFieldScene, {}) },
  heveshikmet: { name: 'Bir heves, bin hikmet', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['heves', 'hikmet', 'yağmur'], aff: { compare: 1 }, draw: split(M(rainFieldScene, { one: 1 }), M(rainFieldScene, { field: 1 })) },
  kainatplani: { name: 'Kâinatın planı', fam: 'kainat', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['mühendis', 'plan', 'külliyat'], aff: { alinti: 1 }, draw: cosmosPlanScene },
  carklar: { name: 'Felek çarkları ve sinek', fam: 'kainat', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['çark', 'felek', 'sinek', 'kanat'], aff: { alinti: 1 }, draw: gearsFlyScene }
});
/* Hızır'ın deldiği gemi: görünen zarar / arkasındaki hikmet */
function boatScene(ctx, w, h, t, st, p) {
  const safe = !!(p && p.safe), hz = h * .6;
  lin(ctx, w, hz + 2, safe ? ['#3a3f78', '#b9788a', '#ffc98a', '#ffe6b0'] : ['#10141e', '#232c3c', '#3d4a5c'], 0, hz);
  if (safe) { glow(ctx, w * .7, hz, 380, '255,226,160', .7); ctx.fillStyle = '#fff3d0'; ctx.beginPath(); ctx.arc(w * .7, hz, 40, Math.PI, 0); ctx.fill(); }
  else clouds(ctx, st, w, hz, t, 6, -20, h * .3, '14,18,26', .8, 181, 8);
  const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, safe ? '#c98a7a' : '#2c3848'); g.addColorStop(1, safe ? '#2a2648' : '#070a10'); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
  if (safe) { /* uzaklaşan gâsıb gemi */ const kx = w * .26 - ((t * 4) % 60), ky = hz + 2; ctx.fillStyle = '#1a1424'; ctx.beginPath(); ctx.moveTo(kx - 46, ky - 12); ctx.lineTo(kx + 46, ky - 12); ctx.lineTo(kx + 34, ky + 4); ctx.lineTo(kx - 36, ky + 4); ctx.fill(); [[-18, 46], [8, 58], [28, 40]].forEach(([x, H]) => { ctx.fillRect(kx + x, ky - 12 - H, 2.5, H); ctx.beginPath(); ctx.moveTo(kx + x + 3, ky - 10 - H); ctx.quadraticCurveTo(kx + x + 20, ky - 12 - H * .5, kx + x + 3, ky - 16); ctx.fill(); }); ctx.fillStyle = '#8a2a2a'; ctx.fillRect(kx + 10, ky - 78, 14, 8); }
  ctx.strokeStyle = safe ? 'rgba(255,236,200,.4)' : 'rgba(190,205,225,.3)'; ctx.lineWidth = 1.3; for (let i = 0; i < 12; i++) { const k = i / 12, y = hz + Math.pow(k, 1.5) * (h - hz) + 4, amp = (safe ? 1.5 : 5) * (1 + k * 2); ctx.beginPath(); for (let x = 0; x <= w; x += 14) ctx.lineTo(x, y + Math.sin(x / (36 + k * 60) + t * (safe ? 1 : 2.2) + i) * amp); ctx.stroke(); }
  const bx = w * .5, by = h * .8 + Math.sin(t * (safe ? .9 : 1.6)) * (safe ? 3 : 7), rot = safe ? Math.sin(t * .8) * .02 : -.1 + Math.sin(t * 1.4) * .05;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(rot);
  const hg = ctx.createLinearGradient(0, -40, 0, 30); hg.addColorStop(0, '#7a5230'); hg.addColorStop(1, '#3a2414'); ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(-130, -40); ctx.lineTo(130, -40); ctx.quadraticCurveTo(110, 30, 70, 30); ctx.lineTo(-80, 30); ctx.quadraticCurveTo(-116, 26, -130, -40); ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,.5)'; ctx.lineWidth = 2; [-22, -4, 14].forEach(y => { ctx.beginPath(); ctx.moveTo(-122, y); ctx.lineTo(120, y); ctx.stroke(); });
  ctx.fillStyle = '#2a1a0e'; ctx.fillRect(-4, -150, 7, 112); ctx.fillStyle = safe ? '#f6ead2' : '#aab4c2'; ctx.beginPath(); ctx.moveTo(6, -146); ctx.quadraticCurveTo(70 + Math.sin(t * 2) * 6, -100, 6, -52); ctx.fill();
  ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.moveTo(30, -8); ctx.lineTo(62, -12); ctx.lineTo(70, 8); ctx.lineTo(44, 16); ctx.lineTo(28, 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = safe ? '#e8c878' : 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.stroke();
  if (safe) glow(ctx, 50, 2, 60, '255,214,140', .5);
  ctx.restore();
  if (!safe) { ctx.fillStyle = '#6a4628'; ctx.save(); ctx.translate(bx + 150 + Math.sin(t) * 8, by + 30); ctx.rotate(.3 + Math.sin(t * 1.3) * .2); ctx.fillRect(-22, -5, 44, 10); ctx.restore(); for (let i = 0; i < 8; i++) { const k = (t * .8 + i / 8) % 1; ctx.fillStyle = `rgba(220,235,250,${(1 - k) * .7})`; ctx.beginPath(); ctx.arc(bx + 48 + Math.cos(i * 2.2) * k * 50, by + 2 - k * 46 + k * k * 30, 2.4, 0, TAU); ctx.fill(); } falling(ctx, st, w, h, t, { n: 90, kind: 'drop', colors: ['#c8d6e2'], speed: 560, sway: 0, drift: -80, alpha: .4 }); }
  else birds(ctx, st, w, h * .4, t, 4, 183, 'rgba(40,30,50,.6)', 1);
}
/* Orkestra: ahenk içinde akan nota çizgileri ve tek bir bozuk ses */
function staffScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#3a2416', '#170e08', '#050302'], .5, 1, .9);
  glow(ctx, w * .5, h * 1.02, 620, '255,196,110', .32);
  const band = (y0, amp, a, sp) => { const yy = (x, i) => y0 + i * 13 + Math.sin(x / 190 + t * sp) * amp + Math.sin(x / 70 + t * sp * 1.7) * amp * .2;
    ctx.strokeStyle = `rgba(232,200,120,${a})`; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let x = 0; x <= w; x += 10) ctx.lineTo(x, yy(x, i)); ctx.stroke(); }
    for (let n = 0; n < 16; n++) { const x = ((n * 97 + t * 40 * sp) % (w + 80)) - 40, i = (n * 3) % 5, y = yy(x, i) + (n % 2 ? 6.5 : 0); ctx.fillStyle = `rgba(255,226,160,${a + .25})`; ctx.save(); ctx.translate(x, y); ctx.rotate(-.35); ctx.beginPath(); ctx.ellipse(0, 0, 8, 5.5, 0, 0, TAU); ctx.fill(); ctx.restore(); ctx.strokeStyle = `rgba(255,226,160,${a + .25})`; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x + 7, y - 2); ctx.lineTo(x + 7, y - 36); ctx.stroke(); if (n % 3 === 0) { ctx.beginPath(); ctx.moveTo(x + 7, y - 36); ctx.quadraticCurveTo(x + 20, y - 28, x + 16, y - 16); ctx.stroke(); } } };
  band(h * .04, 8, .2, .5); band(h * .87, 10, .6, .7);
  /* bozuk ses */
  ctx.strokeStyle = 'rgba(255,96,84,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); const x0 = w * .62, y0 = h * .91; for (let i = 0; i <= 26; i++) ctx.lineTo(x0 + i * 9, y0 + (i % 2 ? -1 : 1) * (10 + 16 * Math.abs(Math.sin(i * 1.3 + t * 5)))); ctx.stroke();
  glow(ctx, x0 + 120, y0, 110, '255,96,84', .22);
  falling(ctx, st, w, h, t, { n: 36, kind: 'dot', colors: ['#ffd9a0'], speed: 10, up: true, size: 1.3, sway: 20, alpha: .45, fade: true, area: [0, 1] });
}
Object.assign(SCENES, {
  hizirgemi: { name: 'Delinen gemi', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['hızır', 'gemi', 'hikmet', 'zarar'], aff: { compare: 1 }, draw: split(M(boatScene, {}), M(boatScene, { safe: 1 })) },
  nota: { name: 'Ahenk ve bozuk ses', fam: 'ses', modes: ['dini', 'is'], tone: 'dark', pos: 'n', tags: ['orkestra', 'ahenk', 'nizam', 'uyum'], aff: { bigword: 1 }, draw: staffScene }
});
/* ===== Kar taneleri dersi (çocuklar) için sahneler ===== */
const FLK = {};
function flakeSpec(seed) { if (FLK[seed]) return FLK[seed]; const r = srng(seed * 7 + 3), n = 2 + Math.floor(r() * 3), br = []; for (let i = 0; i < n; i++) br.push([.22 + (i + r() * .6) / (n + .4) * .72, .14 + r() * .3, 1.05 * (.8 + r() * .35)]); return FLK[seed] = { br, plate: r() < .55, tip: Math.floor(r() * 3), inner: .1 + r() * .12 }; }
function drawFlake(ctx, x, y, R, seed, rot, col, lw) {
  const S = flakeSpec(seed); ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || Math.max(1, R * .05); ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -R); ctx.stroke();
    S.br.forEach(([p, l, a]) => { const yy = -R * p, L = R * l * (1 - p * .45); [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(d * Math.sin(a) * L, yy - Math.cos(a) * L); ctx.stroke(); }); });
    if (S.tip === 1) { ctx.beginPath(); ctx.arc(0, -R, ctx.lineWidth * 1.3, 0, TAU); ctx.fill(); } else if (S.tip === 2) { ctx.beginPath(); ctx.moveTo(0, -R - R * .08); ctx.lineTo(R * .05, -R); ctx.lineTo(0, -R + R * .08); ctx.lineTo(-R * .05, -R); ctx.fill(); } }
  if (S.plate) { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; ctx.lineTo(Math.cos(a) * R * S.inner * 1.6, Math.sin(a) * R * S.inner * 1.6); } ctx.closePath(); ctx.stroke(); }
  ctx.restore();
}
function flakeFall(ctx, st, w, h, t, n, seed, a, x0 = 0, x1 = 1) {
  pts(st, 'ff' + seed, n, seed, r => [x0 + r() * (x1 - x0), r(), 6 + r() * 15, Math.floor(r() * 400), r() * 6, .5 + r()]).forEach(([x, p, s, sd, ph, sp]) => { const y = ((p * (h + 60) + t * 22 * sp) % (h + 60)) - 30; ctx.globalAlpha = a * (.5 + s / 30); drawFlake(ctx, w * x + Math.sin(t * .6 + ph) * 16, y, s, sd, t * .25 * sp + ph, '#eef6ff', Math.max(1, s * .09)); }); ctx.globalAlpha = 1;
}
const NIGHT = ['#061024', '#0f2248', '#24427a', '#4a6ea6'];
function snowGround(ctx, w, h, y0, amp, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, y0 + amp * Math.sin(x / 210 + 1) + amp * .4 * Math.sin(x / 70)); ctx.lineTo(w, h); ctx.fill(); }
/* kapak ve dev kar tanesi */
function bigFlakeScene(ctx, w, h, t, st, p) {
  p = p || {}; lin(ctx, w, h, NIGHT); drawStars(ctx, st, w, h, t, 80, .5, 201);
  const cx = w * .76, cy = h * (p.low ? .5 : .46), R = p.R || 215;
  glow(ctx, cx, cy, R * 2.2, '190,225,255', .32 + .05 * Math.sin(t));
  ctx.globalAlpha = .25; drawFlake(ctx, cx, cy, R * 1.12, p.seed || 12, -t * .04, '#bfe0ff', 3); ctx.globalAlpha = 1;
  drawFlake(ctx, cx, cy, R, p.seed || 12, t * .06, '#ffffff', R * .034);
  drawFlake(ctx, cx, cy, R * .42, (p.seed || 12) + 5, -t * .1 + .5, '#cfe8ff', 3);
  for (let i = 0; i < 12; i++) { const a = i * 2.4 + t * .3, rr = R * (.3 + (i * 37 % 70) / 100); const k = .5 + .5 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.8 + k * 1.6, 0, TAU); ctx.fill(); }
  flakeFall(ctx, st, w, h, t, 26, 203, .7);
  if (!p.noGround) { snowGround(ctx, w, h, h * .9, 12, '#dbe9f8'); snowGround(ctx, w, h, h * .95, 8, '#f4f9ff'); }
  shade(ctx, w, h, ['l', '6,16,40', .8]);
}
/* eldivene konan kar tanesi */
function mittenScene(ctx, w, h, t, st) {
  lin(ctx, w, h, NIGHT); flakeFall(ctx, st, w, h, t, 14, 211, .5, 0, .2); flakeFall(ctx, st, w, h, t, 14, 212, .5, .8, 1);
  const cx = w * .5, by = h * 1.02;
  ctx.save(); ctx.translate(cx, by); ctx.rotate(-.06 + Math.sin(t * .8) * .01);
  const g = ctx.createLinearGradient(-150, -300, 150, 0); g.addColorStop(0, '#e2504a'); g.addColorStop(1, '#a82c30'); ctx.fillStyle = g;
  rrect(ctx, -130, -270, 240, 300, 110); ctx.fill(); ctx.save(); ctx.translate(120, -150); ctx.rotate(.5); rrect(ctx, -34, -80, 68, 130, 34); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 3; for (let y = -230; y < -40; y += 26) { ctx.beginPath(); for (let x = -110; x <= 96; x += 12) ctx.lineTo(x, y + (Math.round((x + 110) / 12) % 2 ? 6 : -6)); ctx.stroke(); }
  ctx.fillStyle = '#f6efe2'; rrect(ctx, -140, -44, 260, 80, 16); ctx.fill(); ctx.strokeStyle = 'rgba(160,140,110,.5)'; ctx.lineWidth = 2; for (let x = -124; x < 112; x += 16) { ctx.beginPath(); ctx.moveTo(x, -38); ctx.lineTo(x, 30); ctx.stroke(); }
  ctx.restore();
  const fy = by - 232 + Math.sin(t * 1.2) * 3; glow(ctx, cx - 14, fy, 120, '210,235,255', .55); drawFlake(ctx, cx - 14, fy, 52, 31, t * .15, '#ffffff', 3.4);
}
/* mikroskop */
function microscopeScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#27406a', '#0f1c38', '#050a16'], .76, .45, .8);
  const vx = w * .83, vy = h * .3, vr = 118;
  glow(ctx, vx, vy, 260, '190,225,255', .35);
  ctx.fillStyle = '#081226'; ctx.beginPath(); ctx.arc(vx, vy, vr, 0, TAU); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.arc(vx, vy, vr - 4, 0, TAU); ctx.clip(); drawFlake(ctx, vx, vy, 92, 47, t * .08, '#ffffff', 3.4); ctx.restore();
  ctx.strokeStyle = '#d6b46a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(vx, vy, vr, 0, TAU); ctx.stroke();
  const mx = w * .68, my = h * .9; ctx.fillStyle = '#c9a45c'; ctx.strokeStyle = '#c9a45c'; ctx.lineCap = 'round';
  rrect(ctx, mx - 120, my - 22, 240, 26, 10); ctx.fill();
  ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(mx - 70, my - 22); ctx.quadraticCurveTo(mx - 110, my - 200, mx - 20, my - 300); ctx.stroke();
  ctx.save(); ctx.translate(mx - 20, my - 300); ctx.rotate(.42); ctx.fillStyle = '#8a6a30'; rrect(ctx, -22, -150, 44, 290, 10); ctx.fill(); ctx.fillStyle = '#e8c878'; rrect(ctx, -28, -170, 56, 34, 8); ctx.fill(); rrect(ctx, -16, 136, 32, 40, 6); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#e8c878'; rrect(ctx, mx - 30, my - 96, 150, 12, 5); ctx.fill(); ctx.fillStyle = '#8a6a30'; ctx.beginPath(); ctx.arc(mx - 96, my - 150, 22, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(190,225,255,.35)'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]); ctx.beginPath(); ctx.moveTo(mx + 56, my - 104); ctx.lineTo(vx - 60, vy + 100); ctx.stroke(); ctx.setLineDash([]);
  drawFlake(ctx, mx + 50, my - 106, 9, 47, 0, '#fff', 1.5);
  flakeFall(ctx, st, w, h, t, 12, 213, .4, .5, 1); shade(ctx, w, h, ['l', '6,12,28', .88]);
}
/* körüklü fotoğraf makinesi */
function cameraScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#3a2c22', '#17110d', '#050403'], .76, .5, .8);
  const cx = w * .88, cy = h * .46, ph = (t * .35) % 1, fl = ph < .06 ? 1 - ph / .06 : 0;
  ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 9; ctx.lineCap = 'round'; [[-70, 250], [0, 270], [70, 250]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(cx + 20, cy + 70); ctx.lineTo(cx + 20 + dx, cy + dy); ctx.stroke(); });
  ctx.fillStyle = '#5a3a22'; rrect(ctx, cx - 30, cy - 80, 150, 160, 10); ctx.fill(); ctx.fillStyle = '#2a1a10'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - 30 - i * 20, cy - 62 + i * 4); ctx.lineTo(cx - 50 - i * 20, cy - 70 + i * 4); ctx.lineTo(cx - 50 - i * 20, cy + 70 - i * 4); ctx.lineTo(cx - 30 - i * 20, cy + 62 - i * 4); ctx.fill(); }
  ctx.fillStyle = '#c9a45c'; rrect(ctx, cx - 182, cy - 46, 26, 92, 6); ctx.fill(); ctx.fillStyle = '#1a2a44'; ctx.beginPath(); ctx.arc(cx - 186, cy, 26, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8c878'; ctx.lineWidth = 5; ctx.stroke();
  const bx = cx - 300, by = cy; ctx.fillStyle = '#0a0a0e'; rrect(ctx, bx - 70, by - 70, 140, 140, 8); ctx.fill(); ctx.strokeStyle = '#6a5a48'; ctx.lineWidth = 4; ctx.stroke();
  glow(ctx, bx, by, 110 + fl * 160, '220,240,255', .35 + fl * .6); drawFlake(ctx, bx, by, 46, 59, t * .1, '#ffffff', 3);
  if (fl) { ctx.fillStyle = `rgba(255,255,255,${fl * .35})`; ctx.fillRect(0, 0, w, h); }
  flakeFall(ctx, st, w, h, t, 10, 215, .35, .45, 1); shade(ctx, w, h, ['l', '10,7,5', .9]);
}
/* galeri: binlerce farklı desen */
function galleryScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#071228', '#10264e', '#1c3a6c']);
  const cw = 128, chh = 120; let n = 0;
  for (let y = 0; y < h + chh; y += chh) for (let x = 0; x < w + cw; x += cw) { n++; const cx = x + cw / 2 - 30 + ((t * 8) % cw), cy = y + chh / 2 - 60, d = Math.hypot(cx - w / 2, (cy - h / 2) * 1.4) / (w * .5); ctx.globalAlpha = Math.min(.95, .1 + d * .95); ctx.strokeStyle = 'rgba(190,225,255,.16)'; ctx.lineWidth = 1; ctx.strokeRect(cx - 52 - cw + 8, cy - 52, 104, 104); drawFlake(ctx, cx - cw, cy, 40, n * 13 + 1, Math.sin(t * .4 + n) * .15, '#eaf4ff', 2.2); }
  ctx.globalAlpha = 1; const g = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * .5); g.addColorStop(0, 'rgba(6,16,38,.92)'); g.addColorStop(.6, 'rgba(6,16,38,.55)'); g.addColorStop(1, 'rgba(6,16,38,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
/* fabrika: hepsi aynı / bulut: hepsi farklı */
function factoryScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#2a2d33', '#3d4149', '#565b64']);
  ctx.fillStyle = '#1c1e22'; ctx.fillRect(0, h * .2, w * .24, h * .5); ctx.fillRect(w * .05, h * .08, 30, h * .2); ctx.fillRect(w * .13, h * .12, 26, h * .16);
  for (let i = 0; i < 4; i++) { const k = (t * .2 + i / 4) % 1; ctx.fillStyle = `rgba(200,200,205,${(1 - k) * .35})`; ctx.beginPath(); ctx.arc(w * .05 + 15 + k * 30, h * .08 - k * 80, 14 + k * 26, 0, TAU); ctx.fill(); }
  const by = h * .74; ctx.fillStyle = '#17181b'; ctx.fillRect(0, by, w, 26); ctx.fillStyle = '#6d727a'; for (let x = -((t * 40) % 40); x < w; x += 40) { ctx.beginPath(); ctx.arc(x, by + 13, 9, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#101114'; ctx.fillRect(0, by + 26, w, h);
  for (let x = -((t * 40) % 120) - 20; x < w + 60; x += 120) { ctx.fillStyle = '#b8bcc4'; rrect(ctx, x - 40, by - 86, 80, 86, 8); ctx.fill(); ctx.strokeStyle = '#5d626b'; ctx.lineWidth = 5; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.moveTo(x, by - 43); ctx.lineTo(x + Math.cos(a) * 26, by - 43 + Math.sin(a) * 26); } ctx.stroke(); }
}
function cloudFlakesScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0b1c40', '#1f4480', '#5c8cc8']);
  const cb = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
  ctx.fillStyle = '#e6effa'; const cx = w * .5, cy = h * .3 + Math.sin(t * .5) * 4; [[-120, 20, 62], [-50, -16, 84], [40, -26, 92], [120, 14, 66], [0, 30, 96], [-170, 44, 40], [170, 40, 44]].forEach(([dx, dy, r]) => cb(cx + dx, cy + dy, r));
  ctx.fillStyle = '#c8d8ee'; [[-90, 60, 50], [10, 76, 60], [100, 62, 48]].forEach(([dx, dy, r]) => cb(cx + dx, cy + dy, r));
  pts(st, 'cf', 22, 221, r => [.08 + r() * .84, r(), 16 + r() * 22, Math.floor(r() * 900), r() * 6, .5 + r()]).forEach(([x, p, s, sd, ph, sp]) => { const y0 = h * .44, y = y0 + ((p * (h - y0 + 60) + t * 26 * sp) % (h - y0 + 60)); drawFlake(ctx, w * x + Math.sin(t * .6 + ph) * 12, y, s, sd, t * .2 * sp + ph, '#ffffff', Math.max(1.4, s * .08)); });
  snowGround(ctx, w, h, h * .93, 8, '#eaf3ff');
}
/* altı kol: ölçü */
function sixArmScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#16345e', '#0a1a36', '#040a18'], .77, .5, .8);
  const cx = w * .77, cy = h * .5, R = 205; glow(ctx, cx, cy, 440, '190,225,255', .26);
  ctx.strokeStyle = 'rgba(232,200,120,.55)'; ctx.lineWidth = 1.6; ctx.setLineDash([7, 7]); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 - Math.PI / 2; ctx.lineTo(cx + Math.cos(a) * (R + 26), cy + Math.sin(a) * (R + 26)); } ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
  drawFlake(ctx, cx, cy, R, 71, 0, '#ffffff', 7);
  const act = Math.floor(t * .8) % 6;
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 - Math.PI / 2, x = cx + Math.cos(a) * (R + 56), y = cy + Math.sin(a) * (R + 56), on = k <= act; glow(ctx, x, y, on ? 46 : 0, '255,214,140', .6); ctx.fillStyle = on ? '#e8c878' : 'rgba(232,200,120,.25)'; ctx.beginPath(); ctx.arc(x, y, 21, 0, TAU); ctx.fill(); ctx.fillStyle = '#0a1a36'; ctx.font = "700 24px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(k + 1), x, y + 1); }
  ctx.textBaseline = 'alphabetic'; ctx.strokeStyle = 'rgba(232,200,120,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI / 3); ctx.stroke(); ctx.fillStyle = '#e8c878'; ctx.font = "600 20px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText('60°', cx + 52, cy - 76);
  shade(ctx, w, h, ['l', '4,12,30', .9]);
}
/* eriyen kar tanesi */
function meltScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0a1630', '#1c3260', '#6a5a70', '#e09a6a']);
  glow(ctx, w * .5, h * 1.02, 560, '255,190,120', .5);
  const k = (t * .12) % 1, cx = w * .5, cy = h * .2;
  [[-530, 0], [530, .5]].forEach(([dx, o]) => { const q = (k + o) % 1, x = cx + dx, y = h * .3 + q * 60; ctx.globalAlpha = Math.max(0, 1 - q * 1.5); drawFlake(ctx, x, y, 62 * (1 - q * .3), 91 + (dx > 0 ? 9 : 0), q * .6, '#ffffff', 4); ctx.globalAlpha = 1;
    for (let i = 0; i < 7; i++) { const u = Math.max(0, q - .25 - i * .05); if (!u) continue; const yy = y + 60 + u * 520; if (yy > h) continue; ctx.fillStyle = `rgba(190,225,255,${.9 - u})`; ctx.beginPath(); ctx.moveTo(x + (i - 3) * 16, yy - 12); ctx.quadraticCurveTo(x + (i - 3) * 16 + 8, yy + 4, x + (i - 3) * 16, yy + 8); ctx.quadraticCurveTo(x + (i - 3) * 16 - 8, yy + 4, x + (i - 3) * 16, yy - 12); ctx.fill(); } });
  ctx.fillStyle = 'rgba(160,205,245,.5)'; ctx.beginPath(); ctx.ellipse(cx, h * .97, w * .36, 14, 0, 0, TAU); ctx.fill();
}
/* kar yorganı: altında uyuyan tohumlar */
function blanketScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0a1832', '#1c3a6a', '#4a70a8']); flakeFall(ctx, st, w, h * .74, t, 16, 231, .6, .62, 1);
  const sy = h * .74; ctx.fillStyle = '#5a3d28'; ctx.fillRect(0, sy + 40, w, h); const sg = ctx.createLinearGradient(0, sy + 40, 0, h); sg.addColorStop(0, '#6a4830'); sg.addColorStop(1, '#3a2616'); ctx.fillStyle = sg; ctx.fillRect(0, sy + 40, w, h);
  ctx.fillStyle = '#f4f9ff'; ctx.beginPath(); ctx.moveTo(0, sy + 52); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, sy + 6 * Math.sin(x / 130) + 3 * Math.sin(x / 40)); ctx.lineTo(w, sy + 52); for (let x = w; x >= 0; x -= 12) ctx.lineTo(x, sy + 46 + 4 * Math.sin(x / 60)); ctx.fill();
  ctx.fillStyle = 'rgba(190,215,245,.5)'; ctx.fillRect(0, sy + 40, w, 6);
  pts(st, 'sd', 15, 233, r => [.04 + r() * .92, .2 + r() * .6, r() * 6]).forEach(([x, d, ph]) => { const X = w * x, Y = sy + 62 + d * (h - sy - 80); ctx.fillStyle = '#d8b06a'; ctx.save(); ctx.translate(X, Y); ctx.rotate(Math.sin(ph) * .6); ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8fc85a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(8, -16, 2 + Math.sin(t + ph) * 2, -22); ctx.stroke(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = "italic 15px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'left'; const z = (t * .5 + ph) % 1; ctx.globalAlpha = 1 - z; ctx.fillText('z', X + 14 + z * 10, Y - 12 - z * 16); ctx.globalAlpha = 1; });
}
/* kâğıttan kar taneleri ve makas */
function paperScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#243a66', '#101e3c', '#060c1a'], .76, .5, .8);
  const pf = (x, y, R, seed, rot) => { ctx.save(); ctx.translate(x + 6, y + 8); ctx.globalAlpha = .3; drawFlake(ctx, 0, 0, R, seed, rot, '#000', R * .16); ctx.restore(); ctx.globalAlpha = 1; drawFlake(ctx, x, y, R, seed, rot, '#f8fbff', R * .16); ctx.fillStyle = '#f8fbff'; ctx.beginPath(); ctx.arc(x, y, R * .2, 0, TAU); ctx.fill(); };
  pf(w * .74, h * .34, 110, 301, Math.sin(t * .4) * .1); pf(w * .9, h * .66, 78, 309, .3 + Math.sin(t * .5 + 1) * .1); pf(w * .64, h * .74, 60, 317, -.2 + Math.sin(t * .6 + 2) * .1); pf(w * .93, h * .2, 44, 325, t * .1);
  const sx = w * .78, sy = h * .82, op = .25 + .18 * Math.sin(t * 2.5); ctx.lineCap = 'round';
  [-1, 1].forEach(d => { ctx.save(); ctx.translate(sx, sy); ctx.rotate(-.5 + d * op); ctx.strokeStyle = '#cfd6e0'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.stroke(); ctx.strokeStyle = '#e2504a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(d * 14, 46, 18, 26, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(d * 6, 22); ctx.stroke(); ctx.restore(); });
  shade(ctx, w, h, ['l', '6,12,28', .9]);
}
/* karlı köy */
function snowVillageScene(ctx, w, h, t, st) {
  lin(ctx, w, h, NIGHT); drawStars(ctx, st, w, h, t, 120, .5, 241);
  const mx = w * .86, my = h * .16; glow(ctx, mx, my, 150, '255,244,210', .3); ctx.fillStyle = '#fbf3d8'; ctx.beginPath(); ctx.arc(mx, my, 30, 0, TAU); ctx.fill();
  snowGround(ctx, w, h, h * .74, 22, '#9fb9dc'); const gy = h * .86;
  const H = st.sv || (st.sv = (() => { const r = srng(243), a = []; for (let x = 30; x < w - 80;) { const bw = 84 + r() * 60, bh = 56 + r() * 40; a.push([x, bw, bh, r(), r() < .8]); x += bw + 30 + r() * 60; } return a; })());
  snowGround(ctx, w, h, gy - 6, 8, '#eef5ff');
  H.forEach(([x, bw, bh, q, lit], i) => { const y = gy + 4 * Math.sin(x / 100); ctx.fillStyle = '#3a2a36'; ctx.fillRect(x, y - bh, bw, bh + 6); ctx.fillStyle = '#f6fbff'; ctx.beginPath(); ctx.moveTo(x - 12, y - bh + 4); ctx.lineTo(x + bw / 2, y - bh - 34 - q * 14); ctx.lineTo(x + bw + 12, y - bh + 4); ctx.fill(); ctx.fillStyle = '#3a2a36'; ctx.fillRect(x + bw * .7, y - bh - 38, 12, 30); ctx.fillStyle = '#f6fbff'; ctx.fillRect(x + bw * .7 - 2, y - bh - 42, 16, 6);
    const wx = x + bw * .2, wy = y - bh * .64; if (lit) { glow(ctx, wx + 11, wy + 12, 70, '255,196,100', .5 + .08 * Math.sin(t * 2 + i)); ctx.fillStyle = '#ffd27a'; } else ctx.fillStyle = '#20263e'; ctx.fillRect(wx, wy, 22, 24); ctx.fillRect(x + bw * .6, wy, 22, 24);
    ctx.strokeStyle = 'rgba(220,230,245,.25)'; ctx.lineWidth = 4; ctx.beginPath(); for (let yy = 0; yy < 90; yy += 6) ctx.lineTo(x + bw * .7 + 6 + Math.sin(yy * .05 + t + i) * (3 + yy * .08), y - bh - 44 - yy); ctx.stroke(); });
  snowGround(ctx, w, h, h * .95, 6, '#ffffff'); flakeFall(ctx, st, w, h, t, 12, 245, .5, 0, .16); flakeFall(ctx, st, w, h, t, 12, 246, .5, .84, 1); flakeFall(ctx, st, w, h * .14, t, 8, 247, .4);
}
Object.assign(SCENES, {
  karkapak: { name: 'Dev kar tanesi', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kar', 'kar tanesi', 'kış'], aff: { cover: 1, alinti: 1 }, draw: M(bigFlakeScene, {}) },
  kartanesi: { name: 'Tek kar tanesi', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kar tanesi', 'şaheser'], aff: { alinti: 1 }, draw: M(bigFlakeScene, { seed: 88, noGround: 1, low: 1, R: 230 }) },
  eldiven: { name: 'Eldivende kar tanesi', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'b', tags: ['eldiven', 'kar', 'bakmak'], aff: { question: 1 }, draw: mittenScene },
  mikroskop: { name: 'Mikroskop', fam: 'kar', modes: ['dini', 'is'], tone: 'dark', pos: 'r', tags: ['mikroskop', 'incelemek'], aff: { bullets: 1 }, draw: microscopeScene },
  korukkamera: { name: 'Körüklü fotoğraf makinesi', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['fotoğraf', 'makine'], aff: { bigword: 1 }, draw: cameraScene },
  kargaleri: { name: 'Kar tanesi galerisi', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['çeşit', 'farklı', 'binlerce'], aff: { bigword: 1 }, draw: galleryScene },
  fabrikabulut: { name: 'Fabrika ve kar bulutu', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['fabrika', 'bulut', 'aynı', 'farklı'], aff: { compare: 1 }, draw: split(factoryScene, cloudFlakesScene) },
  altikol: { name: 'Altı kollu ölçü', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['altı', 'ölçü', 'simetri'], aff: { bullets: 1 }, draw: sixArmScene },
  eriyenkar: { name: 'Eriyen kar tanesi', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['erimek', 'geçici', 'fâni'], aff: { bigword: 1 }, draw: meltScene },
  karyorgani: { name: 'Kar yorganı', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yorgan', 'tohum', 'toprak', 'fayda'], aff: { bullets: 1 }, draw: blanketScene },
  kagitkar: { name: 'Kâğıttan kar taneleri', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['etkinlik', 'kâğıt', 'makas'], aff: { bullets: 1 }, draw: paperScene },
  karlikoy: { name: 'Karlı köy', fam: 'kar', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['köy', 'kış', 'gece', 'dua'], aff: { closing: 1 }, draw: snowVillageScene }
});
/* ===== Üçüncü Mesele (Eskişehir penceresi) için sahneler ===== */
function barsWindow(ctx, x, y, ww, wh, t, inner) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, ww, wh); ctx.clip(); inner(); ctx.restore();
  ctx.fillStyle = '#1a1612'; const bw = 9; for (let i = 1; i < 6; i++) ctx.fillRect(x + ww * i / 6 - bw / 2, y, bw, wh); ctx.fillRect(x, y + wh * .5 - 5, ww, 10);
  ctx.strokeStyle = 'rgba(255,230,180,.18)'; ctx.lineWidth = 2; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + ww * i / 6 - 2, y); ctx.lineTo(x + ww * i / 6 - 2, y + wh); ctx.stroke(); }
  ctx.fillStyle = '#2c2620'; ctx.fillRect(x - 22, y - 22, ww + 44, 22); ctx.fillRect(x - 22, y + wh, ww + 44, 30); ctx.fillRect(x - 22, y, 22, wh); ctx.fillRect(x + ww, y, 22, wh);
}
function yardOutside(ctx, x, y, ww, wh, t, st) {
  const g = ctx.createLinearGradient(0, y, 0, y + wh); g.addColorStop(0, '#9cc8e6'); g.addColorStop(.6, '#e8eef0'); g.addColorStop(1, '#d8c8a0'); ctx.fillStyle = g; ctx.fillRect(x, y, ww, wh);
  glow(ctx, x + ww * .2, y + wh * .15, 140, '255,250,220', .8);
  const gy = y + wh * .78; ctx.fillStyle = '#c8b48a'; ctx.fillRect(x, gy, ww, wh);
  ctx.fillStyle = '#e9e1cf'; ctx.fillRect(x + ww * .3, gy - wh * .36, ww * .66, wh * .36); ctx.fillStyle = '#b05a3c'; ctx.beginPath(); ctx.moveTo(x + ww * .27, gy - wh * .36); ctx.lineTo(x + ww * .63, gy - wh * .5); ctx.lineTo(x + ww * .99, gy - wh * .36); ctx.fill();
  ctx.fillStyle = '#6a7c8c'; for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) ctx.fillRect(x + ww * (.34 + c * .1), gy - wh * (.31 - r * .14), ww * .05, wh * .08);
  const C = ['#e2504a', '#f2c84a', '#4aa8e2', '#6ac25a', '#ffffff'];
  for (let k = 0; k < 2; k++) { const y0 = gy - wh * (.42 + k * .1); ctx.strokeStyle = 'rgba(80,60,40,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + ww / 2, y0 + 26, x + ww, y0); ctx.stroke(); for (let i = 0; i < 16; i++) { const u = i / 15, px = x + u * ww, py = y0 + 26 * 4 * u * (1 - u) * .5 + 2 * Math.sin(t * 2 + i); ctx.fillStyle = C[(i + k) % 5]; ctx.beginPath(); ctx.moveTo(px - 5, py); ctx.lineTo(px + 5, py); ctx.lineTo(px, py + 11); ctx.fill(); } }
  [[.12, 1], [.2, .8]].forEach(([u, s]) => { const tx = x + ww * u; ctx.fillStyle = '#5a4030'; ctx.fillRect(tx - 3, gy - 70 * s, 6, 70 * s); ctx.fillStyle = '#5f8f45'; ctx.beginPath(); ctx.arc(tx, gy - 80 * s, 30 * s, 0, TAU); ctx.fill(); });
}
function windowScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#17130f'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,230,190,.03)'; for (let y = 0; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const x = w * .58, y = h * .16, ww = w * .32, wh = h * .5;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(x, y, x - 300, h); lg.addColorStop(0, 'rgba(255,226,170,.22)'); lg.addColorStop(1, 'rgba(255,226,170,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ww, y); ctx.lineTo(x + ww - 200, h); ctx.lineTo(x - 360, h); ctx.closePath(); ctx.fill(); ctx.restore();
  barsWindow(ctx, x, y, ww, wh, t, () => yardOutside(ctx, x, y, ww, wh, t, st));
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < 6; i++) { ctx.save(); ctx.translate(x + ww * i / 6, h * .78); ctx.transform(1, 0, -1.4, .4, 0, 0); ctx.fillRect(-4, 0, 8, 260); ctx.restore(); }
  falling(ctx, st, w, h, t, { n: 40, kind: 'dot', colors: ['#ffe2b0'], speed: 8, up: true, size: 1.3, sway: 20, alpha: .5, fade: true, area: [.4, 1] });
  shade(ctx, w, h, ['l', '12,9,7', .92]);
}
/* sinema: perdede bahçe ⇄ mezaristan */
function cinemaScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#0c0a0e'; ctx.fillRect(0, 0, w, h);
  const sx = w * .67, sy = h * .1, sw = w * .3, sh = h * .46, ph = (Math.sin(t * .35) + 1) / 2, k = Math.min(1, Math.max(0, (ph - .3) / .4));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bg = ctx.createLinearGradient(w * .98, h * .95, sx, sy); bg.addColorStop(0, 'rgba(255,240,200,.45)'); bg.addColorStop(1, 'rgba(255,240,200,.03)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(w * .99, h * .92); ctx.lineTo(sx, sy); ctx.lineTo(sx, sy + sh); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  yardOutside(ctx, sx, sy, sw, sh, t, st);
  if (k > 0) { ctx.globalAlpha = k; const g = ctx.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#2a2a4a'); g.addColorStop(1, '#6a5a6a'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh); const gy = sy + sh * .78; ctx.fillStyle = '#2a2236'; ctx.fillRect(sx, gy, sw, sh);
    for (let i = 0; i < 9; i++) { const x = sx + sw * (.08 + i * .105), ht = 28 + (i * 13 % 18); ctx.fillStyle = '#4a4258'; ctx.beginPath(); ctx.moveTo(x - 7, gy + 8); ctx.lineTo(x - 8, gy - ht + 8); ctx.quadraticCurveTo(x, gy - ht - 6, x + 8, gy - ht + 8); ctx.lineTo(x + 7, gy + 8); ctx.fill(); }
    [[.1, 90], [.92, 120], [.55, 70]].forEach(([u, ht]) => { const x = sx + sw * u; ctx.fillStyle = '#1a1626'; ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.bezierCurveTo(x - ht * .15, gy - ht * .3, x - ht * .08, gy - ht * .85, x, gy - ht); ctx.bezierCurveTo(x + ht * .08, gy - ht * .85, x + ht * .15, gy - ht * .3, x, gy + 6); ctx.fill(); });
    ctx.globalAlpha = 1; }
  pts(st, 'scr', 30, 251, r => [r(), r()]).forEach(([a, b]) => { ctx.fillStyle = `rgba(255,255,255,${.06 + .06 * Math.sin(t * 20 + a * 9)})`; ctx.fillRect(sx + a * sw, sy + ((b + t * .5) % 1) * sh, 1, 14); });
  ctx.restore();
  ctx.strokeStyle = '#3a3240'; ctx.lineWidth = 6; ctx.strokeRect(sx - 3, sy - 3, sw + 6, sh + 6);
  ctx.fillStyle = '#e8c878'; ctx.font = "600 18px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText(k > .5 ? 'ELLİ SENE SONRA' : 'BUGÜN', sx + sw / 2, sy + sh + 34);
  /* film şeridi */
  ctx.fillStyle = '#1c1820'; ctx.fillRect(w * .52, h * .84, w * .5, 54); ctx.fillStyle = '#0c0a0e'; for (let i = 0; i < 30; i++) { const x = w * .52 + ((i * 22 - t * 40) % (w * .5 + 22) + w * .5 + 22) % (w * .5 + 22); ctx.fillRect(x, h * .84 + 6, 10, 8); ctx.fillRect(x, h * .84 + 40, 10, 8); }
  ctx.fillStyle = '#3a3430'; ctx.beginPath(); ctx.arc(w * .99, h * .92, 46, 0, TAU); ctx.fill(); glow(ctx, w * .99, h * .92, 80, '255,240,200', .5);
  shade(ctx, w, h, ['l', '10,8,12', .9]);
}
/* mevsimler: yaz, güz, kış ve kabir */
function seasonsScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#2a3a5a', '#7a7a8a', '#d8b48a']);
  const gy = h * .8; const seg = [['#8fc06a', '#5f8f45', 'yaz', '#e8f0c0'], ['#d89a4a', '#b8643a', 'güz', '#f0d8a8'], ['#e8eef6', '#c8d4e2', 'kış', '#eef3f8']];
  seg.forEach(([g1, fol, lab, sky], i) => { const x0 = w * (.5 + i * .1667), x1 = x0 + w * .1667; const sg = ctx.createLinearGradient(0, 0, 0, gy); sg.addColorStop(0, i === 2 ? '#3a4a64' : i === 1 ? '#7a5a5a' : '#6aa0d0'); sg.addColorStop(1, sky); ctx.fillStyle = sg; ctx.fillRect(x0, 0, x1 - x0, gy); ctx.fillStyle = g1; ctx.fillRect(x0, gy, x1 - x0, h - gy);
    const tx = (x0 + x1) / 2; ctx.strokeStyle = '#4a3424'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, gy); ctx.lineTo(tx, gy - 120); ctx.moveTo(tx, gy - 80); ctx.lineTo(tx - 40, gy - 140); ctx.moveTo(tx, gy - 96); ctx.lineTo(tx + 44, gy - 150); ctx.stroke();
    if (i < 2) { ctx.fillStyle = fol; [[0, -170, 48], [-38, -140, 34], [40, -146, 36], [0, -120, 32]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(tx + dx, gy + dy + Math.sin(t + dx) * 1.5, r, 0, TAU); ctx.fill(); }); if (i === 1) falling(ctx, st, w, h, t, { key: 'lf' + i, n: 12, kind: 'leaf', colors: ['#d88a3a', '#b8643a'], speed: 30, size: 4, sway: 30, alpha: .9, area: [x0 / w, x1 / w] }); }
    else { ctx.fillStyle = '#f6f9fc'; [[-40, -140, 14], [44, -150, 14], [0, -122, 10]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.ellipse(tx + dx, dy + gy, r * 1.4, r * .5, 0, 0, TAU); ctx.fill(); }); falling(ctx, st, w, h, t, { key: 'sn', n: 50, kind: 'snow', colors: ['#fff'], speed: 26, size: 2, sway: 20, alpha: .9, area: [x0 / w, 1] });
      const gx = x1 - 50; ctx.fillStyle = '#6a7484'; ctx.beginPath(); ctx.moveTo(gx - 13, gy + 2); ctx.lineTo(gx - 15, gy - 64); ctx.quadraticCurveTo(gx, gy - 86, gx + 15, gy - 64); ctx.lineTo(gx + 13, gy + 2); ctx.fill(); ctx.fillStyle = '#f6f9fc'; ctx.beginPath(); ctx.ellipse(gx, gy - 74, 14, 6, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = "italic 600 19px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ['gençlik|yazı', 'ihtiyarlık|güzü', 'kabir ve|berzah kışı'][i].split('|').forEach((s, j) => ctx.fillText(s, tx, gy + 44 + j * 24));
    if (i) { ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x0 - 1, 0, 2, h); } });
  shade(ctx, w, h, ['l', '20,24,40', .92]);
}
/* gölge: insî şeytan */
function shadowScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0a0612', '#1a0c22', '#2a0e2a']);
  const N = [['#ff3a8a', .62, .2], ['#3ae2ff', .8, .14], ['#ffd23a', .9, .34], ['#ff6a3a', .68, .44]];
  N.forEach(([c, x, y], i) => { const on = Math.sin(t * (3 + i) + i * 2) > -.7 ? 1 : .25; glow(ctx, w * x, h * y, 120, c === '#ff3a8a' ? '255,58,138' : c === '#3ae2ff' ? '58,226,255' : c === '#ffd23a' ? '255,210,58' : '255,106,58', .35 * on); ctx.strokeStyle = c; ctx.globalAlpha = on; ctx.lineWidth = 4; rrect(ctx, w * x - 60, h * y - 20, 120, 40, 18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * x - 40, h * y); ctx.lineTo(w * x + 40, h * y); ctx.stroke(); ctx.globalAlpha = 1; });
  ctx.fillStyle = '#05030a'; ctx.fillRect(0, h * .86, w, h);
  const fx = w * .78, fy = h * .86, s = 1 + .02 * Math.sin(t * .8);
  ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s); const g = ctx.createLinearGradient(0, -560, 0, 0); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,.75)'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -500, 44, 52, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-90, -440); ctx.quadraticCurveTo(0, -470, 90, -440); ctx.lineTo(130, -60); ctx.quadraticCurveTo(0, 0, -130, -60); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(84, -430); ctx.quadraticCurveTo(180, -380, 200, -280); ctx.lineTo(180, -270); ctx.quadraticCurveTo(150, -360, 80, -390); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,58,138,.12)'; ctx.fillRect(0, h * .86, w, 3);
  shade(ctx, w, h, ['l', '8,4,12', .9]);
}
/* nurlu intizar salonu / saadet sarayı */
function hallScene(ctx, w, h, t, st, p) {
  p = p || {}; const x0 = w * (p.x0 || .05), cx = (x0 + w) / 2;
  lin(ctx, w, h, ['#3a2a14', '#6a4a20', '#c8944a', '#f6d89a']);
  glow(ctx, cx, h * .5, Math.max(w, 400) * .9, '255,236,180', .55);
  const n = p.n || 5, aw = (w * .95 - x0) / n;
  for (let i = 0; i < n; i++) { const x = x0 + i * aw, ax = x + aw / 2, top = h * .22, bot = h * .86, rr = aw * .36;
    ctx.fillStyle = 'rgba(255,248,220,.9)'; ctx.beginPath(); ctx.moveTo(ax - rr, bot); ctx.lineTo(ax - rr, top + rr); ctx.arc(ax, top + rr, rr, Math.PI, 0); ctx.lineTo(ax + rr, bot); ctx.fill();
    const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#fffbe8'); g.addColorStop(1, '#a6d27a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ax - rr + 8, bot); ctx.lineTo(ax - rr + 8, top + rr); ctx.arc(ax, top + rr, rr - 8, Math.PI, 0); ctx.lineTo(ax + rr - 8, bot); ctx.fill();
    ctx.fillStyle = '#8a6a30'; ctx.fillRect(x, h * .12, 6, bot - h * .12); }
  ctx.fillStyle = '#7a5a28'; ctx.fillRect(0, h * .1, w, 12); ctx.fillStyle = '#5a4020'; ctx.fillRect(0, h * .86, w, h);
  for (let i = 0; i < n; i++) { const lx = x0 + i * aw + aw / 2, ly = h * .14 + 40 + Math.sin(t + i) * 3; ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lx, h * .11); ctx.lineTo(lx, ly - 12); ctx.stroke(); glow(ctx, lx, ly, 34, '255,214,140', .8); ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.ellipse(lx, ly, 8, 11, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,240,200,.35)'; ctx.beginPath(); ctx.moveTo(0, h * .86); ctx.lineTo(w, h * .86); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  falling(ctx, st, w, h, t, { n: 40, kind: 'dot', colors: ['#fff6d0'], speed: 12, up: true, size: 1.6, sway: 20, alpha: .7, fade: true, area: [0, 1] });
  if (p.shade) shade(ctx, w, h, p.shade);
}
/* kalb penceresinden mezaristana ışık */
function heartLightScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#05060f', '#0e1430', '#1c1e40', '#2c2448']); drawStars(ctx, st, w, h, t, 120, .5, 261);
  const wx = w * .86, wy = h * .16, ww = 130, wh = 180;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(wx, wy, wx, h); g.addColorStop(0, 'rgba(255,226,160,.5)'); g.addColorStop(1, 'rgba(255,226,160,.08)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(wx - ww / 2 + 10, wy + wh); ctx.lineTo(wx + ww / 2 - 10, wy + wh); ctx.lineTo(wx + 330, h); ctx.lineTo(wx - 330, h); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#ffe8b0'; ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy + wh); ctx.lineTo(wx - ww / 2, wy + ww / 2); ctx.arc(wx, wy + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww / 2, wy + wh); ctx.closePath(); ctx.fill(); glow(ctx, wx, wy + wh / 2, 260, '255,226,160', .55);
  ctx.strokeStyle = '#c9a45c'; ctx.lineWidth = 6; ctx.stroke(); ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + wh); ctx.moveTo(wx - ww / 2, wy + wh * .55); ctx.lineTo(wx + ww / 2, wy + wh * .55); ctx.stroke();
  const gy = x => h * .86 - 10 * Math.sin(x / 260 + .6);
  ctx.fillStyle = '#0c0b18'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy(x)); ctx.lineTo(w, h); ctx.fill();
  pts(st, 'hg', 18, 263, r => [.04 + r() * .94, 34 + r() * 30, (r() - .5) * .2, r() < .45]).forEach(([x, ht, tl, kv]) => { const X = w * x, Y = gy(X) + 3, lit = Math.abs(X - wx) < 260 + (h - Y) * .5; ctx.save(); ctx.translate(X, Y); ctx.rotate(tl); ctx.fillStyle = lit ? '#d8c08a' : '#26243a'; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-11, -ht + 10); ctx.quadraticCurveTo(0, -ht - 8, 11, -ht + 10); ctx.lineTo(9, 0); ctx.fill(); if (kv) { ctx.beginPath(); ctx.ellipse(0, -ht - 6, 11, 9, 0, 0, TAU); ctx.fill(); } ctx.restore(); });
  pts(st, 'hm', 50, 265, r => [r(), r(), r() * 6]).forEach(([a, p0, ph]) => { const k = (t * .08 + p0) % 1, X = wx + (a - .5) * 560 * (1 - k * .6) + Math.sin(t + ph) * 10, Y = h * .86 - k * h * .62; ctx.globalAlpha = Math.sin(k * Math.PI) * .9; glow(ctx, X, Y, 12, '255,236,190', .9); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(X, Y, 2, 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1;
}
/* çekirdek ve Tûbâ ağacı */
function tubaScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#071a14', '#0e2e22', '#1a4a32', '#2a5a3a']);
  const cx = w * .78, gy = h * .82; glow(ctx, cx, h * .4, 460, '255,226,150', .3);
  ctx.fillStyle = '#1a120a'; ctx.fillRect(0, gy, w, h); ctx.strokeStyle = 'rgba(232,200,120,.5)'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(cx, gy + 30); ctx.bezierCurveTo(cx + (i - 3) * 30, gy + 60, cx + (i - 3) * 70, gy + 80, cx + (i - 3) * 90, h); ctx.stroke(); }
  glow(ctx, cx, gy + 30, 60, '255,226,150', .9); ctx.fillStyle = '#f2d68e'; ctx.beginPath(); ctx.ellipse(cx, gy + 30, 14, 9, 0, 0, TAU); ctx.fill();
  const g = (t * .08) % 1, grow = .55 + .45 * Math.min(1, g * 2);
  const L = treeLayer(w, h, Math.round(cx), Math.round(gy), Math.round(118 * grow), '#d6b46a', 271); ctx.drawImage(L.c, 0, 0, w, h); L.tips.forEach(([x, y], i) => { if (i % 3) return; const k = .5 + .5 * Math.sin(t * 2 + i); glow(ctx, x, y, 10, '255,226,150', .5 * k); });
  pts(st, 'tf', 70, 273, r => [r() * TAU, r(), r() * 6, r() < .3]).forEach(([a, d, ph, fr]) => { const rr = (60 + d * 190) * grow, X = cx + Math.cos(a) * rr * 1.2, Y = gy - 250 * grow + Math.sin(a) * rr * .7; if (Y > gy - 40) return; const k = .5 + .5 * Math.sin(t * 2 + ph); glow(ctx, X, Y, fr ? 22 : 12, fr ? '255,214,120' : '200,255,180', .6 * k); ctx.fillStyle = fr ? '#ffd36a' : 'rgba(200,255,180,.85)'; ctx.beginPath(); ctx.arc(X, Y, fr ? 5 : 2.5, 0, TAU); ctx.fill(); });
  shade(ctx, w, h, ['l', '4,14,10', .9]);
}
/* kuzu ve geriye-ileriye bakan insan */
function lambScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#5a8ab8', '#b8d0d8', '#f0e0b0']);
  const gy = h * .78; hills(ctx, w, h, gy - 30, 18, 260, 1.2, '#8ab06a'); ctx.fillStyle = '#6f9a50'; ctx.fillRect(0, gy, w, h);
  const lx = w * .7, ly = gy + 34, bob = Math.sin(t * 1.2) * 3;
  ctx.fillStyle = '#f6f2e8'; [[0, 0, 40], [-26, -4, 26], [26, -6, 26], [-10, -20, 24], [14, -22, 24]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(lx + dx, ly + dy, r, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#2a2420'; ctx.save(); ctx.translate(lx - 52, ly + 10 + bob); ctx.rotate(.6); ctx.beginPath(); ctx.ellipse(0, 0, 14, 20, 0, 0, TAU); ctx.fill(); ctx.restore(); [[-20, 1], [-6, -1], [14, 1], [28, -1]].forEach(([dx]) => ctx.fillRect(lx + dx, ly + 30, 6, 24));
  for (let i = 0; i < 14; i++) { const x = w * (.5 + i * .036); ctx.strokeStyle = '#4a7a30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, gy + 70); ctx.lineTo(x + Math.sin(t * 1.5 + i) * 3, gy + 54); ctx.stroke(); }
  const mx = w * .9, my = gy + 10; clouds(ctx, st, w, h, t, 3, h * .02, h * .14, '60,64,80', .55, 281, 3);
  ctx.fillStyle = '#2a2a34'; ctx.beginPath(); ctx.arc(mx, my - 92, 13, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(mx - 20, my - 76); ctx.lineTo(mx + 16, my - 76); ctx.lineTo(mx + 22, my - 20); ctx.lineTo(mx - 24, my - 20); ctx.fill(); ctx.fillRect(mx - 22, my - 22, 14, 40); ctx.fillRect(mx + 4, my - 22, 14, 40);
  ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx - 16, my - 70); ctx.lineTo(mx - 4, my - 92); ctx.moveTo(mx + 12, my - 70); ctx.lineTo(mx + 2, my - 94); ctx.stroke();
  ['?', '?'].forEach((q, i) => { const k = (t * .3 + i * .5) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#3a3a4a'; ctx.font = `700 ${22 + k * 14}px 'KursuSerif', Georgia, serif`; ctx.fillText(q, mx + (i ? 30 : -46) + (i ? 1 : -1) * k * 30, my - 120 - k * 50); }); ctx.globalAlpha = 1;
  shade(ctx, w, h, ['l', '40,60,80', .75]);
}
/* zincir: son ve en büyük halka */
function chainScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#24203a', '#100e1e', '#05040c'], .78, .1, .9);
  const cx = w * .78; glow(ctx, cx, -40, 420, '255,226,150', .5);
  const N = 7, act = (t * .9) % (N + 2);
  for (let i = 0; i < N; i++) { const y = 30 + i * 84, big = i === N - 1, r = big ? 46 : 30 + i * 2, ang = i % 2 ? Math.PI / 2 : 0, lit = act > i;
    ctx.save(); ctx.translate(cx + Math.sin(t * .6) * i * 1.5, y + (big ? 20 : 0)); ctx.rotate(ang ? 0 : 0);
    const col = big ? '#ffd890' : '#c9a45c'; if (lit) glow(ctx, 0, 0, r * 2.2, '255,214,140', big ? .7 : .35); ctx.strokeStyle = col; ctx.lineWidth = big ? 13 : 9;
    ctx.beginPath(); if (i % 2) ctx.ellipse(0, 0, r * .38, r, 0, 0, TAU); else ctx.ellipse(0, 0, r * .62, r * .9, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  const by = 30 + (N - 1) * 84 + 20; glow(ctx, cx, by, 120, '255,236,190', .3 + .2 * Math.sin(t * 2));
  ctx.fillStyle = '#e8c878'; ctx.font = "600 17px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText('Âhirzaman Peygamberi ﷺ', cx, by + 80);
  shade(ctx, w, h, ['l', '6,5,14', .9]);
}
/* Medrese-i Yusufiye: bahçeye dönen pencere */
function gardenWindowScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#231c14'; ctx.fillRect(0, 0, w, h); glow(ctx, w * .74, h * .4, 520, '255,226,170', .28);
  const x = w * .58, y = h * .12, ww = w * .32, wh = h * .5;
  barsWindow(ctx, x, y, ww, wh, t, () => { const g = ctx.createLinearGradient(0, y, 0, y + wh); g.addColorStop(0, '#8ccaf0'); g.addColorStop(1, '#f6eec0'); ctx.fillStyle = g; ctx.fillRect(x, y, ww, wh); glow(ctx, x + ww * .5, y + wh * .3, 200, '255,250,220', .9); ctx.fillStyle = '#7ab04e'; hills(ctx, w, h, y + wh * .8, 10, 120, 2, '#7ab04e'); });
  const vine = (sx, sy, len, dir, seed) => { const r = srng(seed); ctx.strokeStyle = '#3f6a28'; ctx.lineWidth = 4; ctx.beginPath(); let px = sx, py = sy; ctx.moveTo(px, py); const P = []; for (let i = 0; i < len; i++) { px += dir * (6 + r() * 6); py -= 10 + r() * 8; px += Math.sin(i * .7 + t * .5) * 2; ctx.lineTo(px, py); P.push([px, py]); } ctx.stroke(); P.forEach(([a, b], i) => { ctx.fillStyle = '#5f9a3a'; ctx.beginPath(); ctx.ellipse(a + (i % 2 ? 10 : -10), b, 10, 5, i % 2 ? .5 : -.5, 0, TAU); ctx.fill(); if (i % 4 === 2) { const k = .5 + .5 * Math.sin(t * 1.5 + i); glow(ctx, a, b - 6, 22, '255,150,170', .4 * k); ctx.fillStyle = ['#ff7a9a', '#ffd36a', '#ffffff'][i % 3]; for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.ellipse(a + Math.cos(q * 1.256) * 6, b - 6 + Math.sin(q * 1.256) * 6, 5, 3, q * 1.256, 0, TAU); ctx.fill(); } } }); };
  vine(x - 10, y + wh + 26, 24, .5, 291); vine(x + ww + 14, y + wh + 26, 24, -.4, 293);
  for (let i = 0; i < 4; i++) { const px = x + 30 + i * (ww - 60) / 3, py = y + wh + 30; ctx.fillStyle = '#a8603a'; ctx.beginPath(); ctx.moveTo(px - 22, py - 30); ctx.lineTo(px + 22, py - 30); ctx.lineTo(px + 16, py); ctx.lineTo(px - 16, py); ctx.fill(); const s = .8 + .2 * Math.sin(t * .5 + i); ctx.strokeStyle = '#4e7a30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py - 30); ctx.lineTo(px, py - 30 - 44 * s); ctx.stroke(); ctx.fillStyle = '#7ab04e'; ctx.beginPath(); ctx.ellipse(px - 10, py - 30 - 36 * s, 12, 5, -.5, 0, TAU); ctx.ellipse(px + 10, py - 30 - 44 * s, 12, 5, .5, 0, TAU); ctx.fill(); }
  falling(ctx, st, w, h, t, { n: 30, kind: 'dot', colors: ['#ffe2b0'], speed: 8, up: true, size: 1.4, sway: 20, alpha: .55, fade: true, area: [.45, 1] });
  shade(ctx, w, h, ['l', '18,14,10', .92]);
}
Object.assign(SCENES, {
  pencere: { name: 'Hapishane penceresi', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['hapishane', 'pencere', 'bayram'], aff: { cover: 1 }, draw: windowScene },
  sinema: { name: 'Manevî sinema', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['sinema', 'elli sene', 'istikbal'], aff: { alinti: 1 }, draw: cinemaScene },
  mevsimler: { name: 'Yaz, güz, kış', fam: 'zaman', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['yaz', 'güz', 'kış', 'gençlik', 'ihtiyarlık', 'kabir'], aff: { alinti: 1 }, draw: seasonsScene },
  golge: { name: 'İnsî şeytan', fam: 'golge', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['dalalet', 'sefahet', 'şahs-ı manevi'], aff: { alinti: 1 }, draw: shadowScene },
  mezarsaray: { name: 'Mezaristan ve intizar salonu', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['mazi', 'iman', 'dalalet'], aff: { compare: 1 }, draw: split(M(gravesScene, {}), M(hallScene, { n: 3 })) },
  saray: { name: 'Saadet sarayı', fam: 'isik', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['saadet', 'ziyafet', 'iman', 'lezzet'], aff: { alinti: 1 }, draw: M(hallScene, { x0: .56, n: 3, shade: ['l', '30,20,8', .95] }) },
  kalbpenceresi: { name: 'Kalb penceresinden ışık', fam: 'kabir', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['kalb', 'ışık', 'dirilmek', 'mezaristan'], aff: { alinti: 1 }, draw: heartLightScene },
  tuba: { name: 'Çekirdek ve Tûbâ', fam: 'agac', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['çekirdek', 'tûbâ', 'cennet', 'iman'], aff: { bigword: 1 }, draw: tubaScene },
  kuzu: { name: 'Kuzu ve düşünen insan', fam: 'tarla', modes: ['dini'], tone: 'light', pos: 'r', vars: INK_COOL, tags: ['hayvan', 'mazi', 'müstakbel', 'akıl'], aff: { alinti: 1 }, draw: lambScene },
  zincir: { name: 'Zincir', fam: 'zincir', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['zincir', 'peygamber', 'iman'], aff: { alinti: 1 }, draw: chainScene },
  medreseyusufiye: { name: 'Bahçeye dönen hapishane', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['medrese-i yusufiye', 'bahçe', 'fidan'], aff: { alinti: 1 }, draw: gardenWindowScene }
});
/* ---- Notlardan slayta çıkan örnekler ---- */
function antScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#f2c86a', '#f6dc98', '#e8d8a8']); glow(ctx, w * .82, h * .12, 380, '255,246,200', .8);
  const gy = h * .64; hills(ctx, w, h, gy - 10, 12, 200, 2.4, '#c8a050');
  for (let i = 0; i < 22; i++) { const x = w * (.58 + i * .02), s = .8 + (i % 3) * .2, sw = Math.sin(t * 1.4 + i) * 3; ctx.strokeStyle = '#a07a30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.lineTo(x + sw, gy - 70 * s); ctx.stroke(); ctx.fillStyle = '#d8a83a'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(x + sw + (k % 2 ? 4 : -4), gy - 70 * s + k * 6, 4, 7, k % 2 ? .4 : -.4, 0, TAU); ctx.fill(); } }
  const sg = ctx.createLinearGradient(0, gy, 0, h); sg.addColorStop(0, '#8a5a30'); sg.addColorStop(1, '#3a2414'); ctx.fillStyle = sg; ctx.fillRect(0, gy + 4, w, h);
  const nx = w * .9, ny = gy + 4; ctx.fillStyle = '#6a4224'; ctx.beginPath(); ctx.ellipse(nx, ny, 70, 26, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#1a0e06'; ctx.beginPath(); ctx.ellipse(nx, ny, 12, 7, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(w * .5, ny + 10, w * .5, h); ctx.clip(); const ch = [[.9, .78, 46], [.7, .86, 40], [.82, .94, 36]]; ch.forEach(([x, y, r]) => { ctx.fillStyle = '#2a1608'; ctx.beginPath(); ctx.ellipse(w * x, h * y, r * 1.4, r * .7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8c070'; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.ellipse(w * x + (k % 3 - 1) * 14, h * y + (Math.floor(k / 3) - 1) * 8, 5, 3, .3, 0, TAU); ctx.fill(); } }); ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(nx, ny + 6); ctx.quadraticCurveTo(w * .85, h * .8, w * .9, h * .78); ctx.moveTo(nx, ny + 6); ctx.quadraticCurveTo(w * .76, h * .82, w * .7, h * .86); ctx.stroke(); ctx.restore();
  const ant = (x, y, s, carry) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#1a0e08'; ctx.beginPath(); ctx.ellipse(-9, 0, 6, 4.5, 0, 0, TAU); ctx.ellipse(0, -1, 4, 3.4, 0, 0, TAU); ctx.ellipse(8, -2, 4, 3.6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1a0e08'; ctx.lineWidth = 1.2; for (let k = -1; k <= 1; k++) { const a = Math.sin(t * 14 + k + x) * 3; ctx.beginPath(); ctx.moveTo(k * 3, 0); ctx.lineTo(k * 3 - 4 + a, 7); ctx.moveTo(k * 3, 0); ctx.lineTo(k * 3 + 4 - a, 7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(15, -10); ctx.stroke(); if (carry) { ctx.fillStyle = '#f2c86a'; ctx.beginPath(); ctx.ellipse(10, -10, 6, 4, .4, 0, TAU); ctx.fill(); } ctx.restore(); };
  for (let i = 0; i < 12; i++) { const k = ((t * .05 + i / 12) % 1), x = w * .6 + k * (nx - w * .6 - 20), y = gy + 2 - Math.sin(k * 30 + i) * 1.5; ant(x, y, 1.6, i % 3 !== 2); }
  ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = "italic 600 19px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText('yazın topladığı, kışın azığı', w * .8, h * .97);
  shade(ctx, w, h, ['l', '26,16,6', .97]);
}
function abyssTableScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#040408', '#0c0a14', '#18121c']);
  const by = h * .7, L = w * .62, R = w * .99;
  ctx.fillStyle = '#020203'; ctx.fillRect(0, by + 30, w, h);
  [[L - 30, -1], [R + 30, 1]].forEach(([x, d]) => { ctx.fillStyle = '#16121a'; ctx.beginPath(); ctx.moveTo(x, by + 4); ctx.lineTo(x + d * 400, by + 4); ctx.lineTo(x + d * 400, h); ctx.lineTo(x - d * 10, h); ctx.lineTo(x + d * 6, by + 120); ctx.closePath(); ctx.fill(); });
  ctx.fillStyle = '#3a2c22'; ctx.fillRect(L - 30, by - 4, R - L + 60, 10); ctx.strokeStyle = '#3a2c22'; ctx.lineWidth = 2; for (let x = L - 20; x < R + 30; x += 30) { ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by - 40); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(L - 30, by - 40); ctx.quadraticCurveTo((L + R) / 2, by - 24, R + 30, by - 40); ctx.stroke();
  const tx = (L + R) / 2; glow(ctx, tx, by - 60, 220, '255,200,120', .55 + .05 * Math.sin(t * 3));
  ctx.fillStyle = '#f2e6d0'; ctx.fillRect(tx - 120, by - 40, 240, 10); ctx.fillStyle = '#5a3a22'; ctx.fillRect(tx - 110, by - 30, 8, 26); ctx.fillRect(tx + 102, by - 30, 8, 26);
  [[-80, '#c84a3a'], [-30, '#e8b860'], [24, '#8ac05a'], [76, '#d8902a']].forEach(([dx, c]) => { ctx.fillStyle = '#e8e2d6'; ctx.beginPath(); ctx.ellipse(tx + dx, by - 42, 24, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(tx + dx, by - 48, 12, Math.PI, 0); ctx.fill(); });
  [-55, 50].forEach(dx => { ctx.fillStyle = '#f6ecd6'; ctx.fillRect(tx + dx - 3, by - 74, 6, 30); ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.ellipse(tx + dx, by - 80, 3, 7 + Math.sin(t * 9 + dx) , 0, 0, TAU); ctx.fill(); });
  ctx.fillStyle = 'rgba(232,200,120,.85)'; ctx.font = "italic 600 18px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText('geçmiş', L - 10, by + 60); ctx.fillText('gelecek', R - 20, by + 60);
  falling(ctx, st, w, h, t, { n: 30, kind: 'dot', colors: ['#6a5a7a'], speed: 40, size: 1.4, sway: 6, alpha: .5, area: [.5, 1] });
  shade(ctx, w, h, ['l', '4,4,8', .92]);
}
function loungeScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#1c2a44', '#3a4a6a', '#c88a6a', '#ffd8a0']);
  const wy = h * .1, wh = h * .56, x0 = w * .6; glow(ctx, w * .8, wy + wh * .8, 420, '255,220,160', .6);
  ctx.fillStyle = '#ffe6b8'; ctx.beginPath(); ctx.arc(w * .8, wy + wh * .8, 46, Math.PI, 0); ctx.fill();
  const pk = (t * .06) % 1, px = x0 + pk * (w - x0) * 1.1, py = wy + wh * .78 - pk * wh * .6; ctx.save(); ctx.translate(px, py); ctx.rotate(-.35); ctx.fillStyle = '#1a2030'; ctx.beginPath(); ctx.ellipse(0, 0, 46, 7, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-22, 26); ctx.lineTo(-10, 26); ctx.lineTo(12, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-22, -26); ctx.lineTo(-10, -26); ctx.lineTo(12, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-48, -16); ctx.lineTo(-38, -16); ctx.lineTo(-32, 0); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#121824'; ctx.fillRect(0, 0, w, wy); ctx.fillRect(0, wy + wh, w, h); ctx.fillRect(0, 0, x0, h); for (let i = 0; i <= 4; i++) ctx.fillRect(x0 + i * (w - x0) / 4 - 4, wy, 8, wh);
  ctx.fillStyle = 'rgba(255,220,160,.12)'; ctx.beginPath(); ctx.moveTo(x0, wy + wh); ctx.lineTo(w, wy + wh); ctx.lineTo(w, h); ctx.lineTo(x0 - 200, h); ctx.fill();
  for (let i = 0; i < 5; i++) { const sx = x0 + 20 + i * 98, sy = h * .86; ctx.fillStyle = '#2a3448'; rrect(ctx, sx, sy - 40, 80, 40, 8); ctx.fill(); ctx.fillRect(sx + 4, sy, 6, 30); ctx.fillRect(sx + 70, sy, 6, 30); if (i % 2 === 0) { ctx.fillStyle = '#0a0e16'; ctx.beginPath(); ctx.arc(sx + 40, sy - 70, 12, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx + 22, sy - 56); ctx.lineTo(sx + 58, sy - 56); ctx.lineTo(sx + 62, sy - 30); ctx.lineTo(sx + 18, sy - 30); ctx.fill(); } }
  const bx = x0 + 40, bb = wy + 20; ctx.fillStyle = '#0a0e16'; rrect(ctx, bx, bb, 250, 96, 6); ctx.fill(); ctx.fillStyle = '#ffd36a'; ctx.font = "700 15px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'left'; ctx.fillText('GİDİŞ', bx + 14, bb + 24); ctx.font = "600 14px 'KursuSerif', Georgia, serif"; ctx.fillText('BEKA ÂLEMİ', bx + 14, bb + 52); ctx.fillText('SAADET SARAYLARI', bx + 14, bb + 78); ctx.fillStyle = Math.sin(t * 3) > 0 ? '#8fe08a' : '#4a8a4a'; ctx.fillText('BİNİŞ', bx + 186, bb + 52); ctx.fillText('ZAMANI GELİNCE', bx + 140, bb + 78);
  shade(ctx, w, h, ['l', '18,24,36', .95]);
}
function waterHalf(ctx, w, h, t, st, p) {
  const salt = !!p.salt;
  if (salt) { lin(ctx, w, h, ['#e8c890', '#f0a868', '#c8784a']); const hz = h * .55; const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, '#3a7a9a'); g.addColorStop(1, '#0e3048'); ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4; for (let i = 0; i < 9; i++) { const y = hz + 10 + i * 18; ctx.beginPath(); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y + Math.sin(x / 30 + t * 2 + i) * 3); ctx.stroke(); } glow(ctx, w * .5, h * .2, 200, '255,240,200', .8);
    ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.ellipse(w * .5, h * .88, 160, 26, 0, 0, TAU); ctx.fill(); pts(st, 'sl', 30, 301, r => [r(), r()]).forEach(([a, b]) => { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(w * .5 + (a - .5) * 260, h * .88 + (b - .5) * 30, 3, 3); }); }
  else { lin(ctx, w, h, ['#7ac0e0', '#c8e8f0', '#e8f4e0']); hills(ctx, w, h, h * .66, 26, 180, 1.6, '#6aa04a'); ctx.fillStyle = '#4a8a3a'; ctx.fillRect(0, h * .76, w, h);
    const cx = w * .5, cy = h * .7; ctx.fillStyle = '#d8d0c0'; rrect(ctx, cx - 70, cy - 120, 140, 160, 10); ctx.fill(); ctx.fillStyle = '#b8ae9a'; ctx.beginPath(); ctx.arc(cx, cy - 120, 70, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#8a7e6a'; ctx.fillRect(cx - 8, cy - 70, 16, 10);
    ctx.strokeStyle = 'rgba(160,215,245,.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy - 60); ctx.quadraticCurveTo(cx + 4, cy - 30, cx, cy + 20); ctx.stroke(); for (let i = 0; i < 6; i++) { const k = (t * 1.2 + i / 6) % 1; ctx.fillStyle = `rgba(200,235,255,${1 - k})`; ctx.beginPath(); ctx.arc(cx + Math.sin(i) * 14 * k, cy + 22 + k * 8, 3, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(160,215,245,.8)'; ctx.beginPath(); ctx.ellipse(cx, cy + 34, 90, 12, 0, 0, TAU); ctx.fill(); glow(ctx, cx, cy - 20, 160, '255,255,240', .4); }
}
function cockpitScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#040818', '#0c1a3a', '#1c2c5a', '#3a3a6a']); drawStars(ctx, st, w, h * .6, t, 140, .9, 311);
  ctx.save(); ctx.translate(w * .74, h * .46); ctx.rotate(Math.sin(t * .2) * .02); ctx.fillStyle = '#d8b88a'; ctx.globalAlpha = .4; for (let i = 0; i < 40; i++) ctx.fillRect(-400 + ((i * 97) % 800), 60 + (i * 31 % 90), 2, 2); ctx.restore(); ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, h * .55, 0, h); g.addColorStop(0, '#141a26'); g.addColorStop(1, '#05070c'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(w * .56, h); ctx.lineTo(w * .58, h * .58); ctx.quadraticCurveTo(w * .78, h * .5, w, h * .56); ctx.lineTo(w, h); ctx.fill();
  ctx.fillStyle = '#0a0e16'; ctx.beginPath(); ctx.moveTo(w * .58, 0); ctx.lineTo(w * .61, 0); ctx.lineTo(w * .6, h * .58); ctx.lineTo(w * .575, h * .58); ctx.fill(); ctx.fillRect(w * .8, 0, 12, h * .53);
  const inst = [[.64, .7, '#6ae08a'], [.7, .68, '#ffd36a'], [.76, .67, '#6ac8ff'], [.84, .67, '#6ae08a'], [.9, .68, '#ff8a6a'], [.96, .7, '#6ac8ff']];
  inst.forEach(([x, y, c], i) => { const X = w * x, Y = h * y; ctx.fillStyle = '#020306'; rrect(ctx, X - 32, Y - 26, 64, 52, 6); ctx.fill(); glow(ctx, X, Y, 40, '120,200,255', .12); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 18, 0, TAU); ctx.stroke(); const a = t * (.5 + i * .2) + i; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + Math.cos(a) * 15, Y + Math.sin(a) * 15); ctx.stroke(); });
  for (let i = 0; i < 18; i++) { const on = Math.sin(t * 2 + i * 1.7) > 0; ctx.fillStyle = on ? ['#ff6a5a', '#ffd36a', '#6ae08a'][i % 3] : '#2a2a34'; ctx.beginPath(); ctx.arc(w * (.62 + i * .02), h * .82, 3.5, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.arc(w * .72, h * .5, 22, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * .69, h * .55); ctx.lineTo(w * .75, h * .55); ctx.lineTo(w * .77, h * .64); ctx.lineTo(w * .67, h * .64); ctx.fill();
  ctx.fillStyle = 'rgba(232,200,120,.9)'; ctx.font = "italic 600 17px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText('bilen uyuyamaz; bilgisi de şerefidir', w * .8, h * .95);
  shade(ctx, w, h, ['l', '4,8,24', .92]);
}
Object.assign(SCENES, {
  karinca: { name: 'Karınca ve kışlık', fam: 'tarla', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['karınca', 'kış', 'hazırlık'], aff: { bigword: 1 }, draw: antScene },
  ucurumsofra: { name: 'İki uçurum arasında sofra', fam: 'kopru', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['lezzet', 'uçurum', 'geçmiş', 'gelecek'], aff: { bigword: 1 }, draw: abyssTableScene },
  beklemesalonu: { name: 'Bekleme salonu', fam: 'ucak', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['intizar', 'bekleme', 'sevkiyat'], aff: { bigword: 1 }, draw: loungeScene },
  tuzlutatli: { name: 'Tuzlu su, tatlı su', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['lezzet', 'su', 'susuzluk'], aff: { compare: 1 }, draw: split(M(waterHalf, { salt: 1 }), M(waterHalf, {})) },
  kokpit: { name: 'Pilot ve yolcu', fam: 'ucak', modes: ['dini', 'is'], tone: 'dark', pos: 'r', tags: ['akıl', 'bilmek', 'pilot'], aff: { bigword: 1 }, draw: cockpitScene }
});
/* ===== "Penceredeki Sinema" yeniden: sinematik sahneler ===== */
const GRN = {};
function grain(ctx, w, h, t, a) {
  if (!GRN.c) { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256), r = srng(977); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GRN.c = c; }
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.translate(-((t * 61 | 0) % 256), -((t * 37 | 0) % 256)); ctx.fillStyle = ctx.createPattern(GRN.c, 'repeat'); ctx.fillRect(0, 0, w + 256, h + 256); ctx.restore();
}
function vinyet(ctx, w, h, a) { const g = ctx.createRadialGradient(w / 2, h / 2, h * .32, w / 2, h / 2, w * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function twigTree(ctx, x, y, len, seed, col, lw, depth, tips) {
  const r = srng(seed); ctx.strokeStyle = col; ctx.lineCap = 'round';
  (function br(x, y, len, ang, d, wd) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    if (d <= 0) { if (tips) tips.push([x2, y2]); return; }
    const n = 2 + (d < 3 && r() < .35 ? 1 : 0);
    for (let i = 0; i < n; i++) br(x2, y2, len * (.66 + r() * .14), ang + (i - (n - 1) / 2) * (.55 + r() * .3) + (r() - .5) * .25, d - 1, Math.max(.8, wd * .66));
  })(x, y, len, -Math.PI / 2, depth, lw);
}
function clbl(ctx, x, y, a, b, align) { ctx.textAlign = align || 'left'; ctx.fillStyle = '#e8c878'; ctx.font = "600 17px 'KursuSerif', Georgia, serif"; ctx.fillText(a, x, y); if (b) { ctx.fillStyle = 'rgba(244,232,208,.78)'; ctx.font = "italic 15px 'KursuSerif', Georgia, serif"; ctx.fillText(b, x, y + 19); } }
function bunting(ctx, x0, x1, y, sag, t, n, s) { const C = ['#e2504a', '#f2c84a', '#4aa8e2', '#6ac25a', '#ffffff', '#e88ad0']; ctx.strokeStyle = 'rgba(60,44,30,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); ctx.stroke(); for (let i = 0; i <= n; i++) { const u = i / n, px = x0 + u * (x1 - x0), py = y + sag * 4 * u * (1 - u) + Math.sin(t * 2.2 + i) * 1.5; ctx.fillStyle = C[i % 6]; ctx.beginPath(); ctx.moveTo(px - 5 * s, py); ctx.lineTo(px + 5 * s, py); ctx.lineTo(px + Math.sin(t * 2 + i) * 2, py + 12 * s); ctx.fill(); } }

/* 1) Hücre penceresi: bayram (kapak) / bahçeye dönen pencere (Medrese-i Yusufiye) */
function cellScene(ctx, w, h, t, st, p) {
  p = p || {}; const garden = !!p.garden, open = !!p.open;
  if (!st.wall) { const c = document.createElement('canvas'); c.width = 1280; c.height = 720; const g = c.getContext('2d'), r = srng(401); g.fillStyle = '#16110d'; g.fillRect(0, 0, 1280, 720);
    for (let y = 0, row = 0; y < 720; y += 58, row++) for (let x = -(row % 2) * 70; x < 1280; x += 140) { const v = r(); g.fillStyle = `rgba(255,214,160,${.012 + v * .05})`; g.fillRect(x + 2, y + 2, 136, 54); if (v > .75) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + 6 + r() * 70, y + 8 + r() * 30, 24 + r() * 44, 2.5); } }
    st.wall = c; }
  ctx.drawImage(st.wall, 0, 0, w, h);
  const wx = w * .77, top = h * .13, ww = 264, bot = h * .66, R = ww / 2;
  const arch = pad => { ctx.beginPath(); ctx.moveTo(wx - R - pad, bot + pad * .45); ctx.lineTo(wx - R - pad, top + R); ctx.arc(wx, top + R, R + pad, Math.PI, 0); ctx.lineTo(wx + R + pad, bot + pad * .45); ctx.closePath(); };
  glow(ctx, wx, h * .4, 560, garden ? '255,236,180' : '255,226,170', garden ? .34 : .26);
  const eg = ctx.createLinearGradient(wx - R - 56, 0, wx + R + 56, 0); eg.addColorStop(0, '#463a2d'); eg.addColorStop(.5, '#2c241c'); eg.addColorStop(1, '#17120e'); ctx.fillStyle = eg; arch(56); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; arch(56); ctx.stroke();
  ctx.save(); arch(0); ctx.clip();
  const sg = ctx.createLinearGradient(0, top, 0, bot); sg.addColorStop(0, garden ? '#8fd0f2' : '#86bfe6'); sg.addColorStop(.6, '#e6f1ee'); sg.addColorStop(1, '#fff0c4'); ctx.fillStyle = sg; ctx.fillRect(wx - R, top, ww, bot - top);
  glow(ctx, wx - 50, top + 80, 230, '255,252,230', .85);
  pts(st, 'cb', 9, 403, r => [r(), r(), 30 + r() * 46, r()]).forEach(([a, b, rr, c]) => { ctx.fillStyle = garden ? `rgba(${80 + c * 60 | 0},${150 + c * 50 | 0},70,.75)` : `rgba(${90 + c * 50 | 0},${140 + c * 40 | 0},90,.55)`; ctx.beginPath(); ctx.arc(wx - R + a * ww, bot - 20 - b * 60 + Math.sin(t * .6 + a * 9) * 2, rr, 0, TAU); ctx.fill(); });
  if (garden) pts(st, 'cf', 26, 405, r => [r(), r(), r()]).forEach(([a, b, c]) => { ctx.fillStyle = ['#ff8aa6', '#ffe08a', '#ffffff'][c * 3 | 0]; ctx.beginPath(); ctx.arc(wx - R + a * ww, bot - 20 - b * 110, 4, 0, TAU); ctx.fill(); });
  else { bunting(ctx, wx - R - 10, wx + R + 10, top + 150, 14, t, 15, 1.1); bunting(ctx, wx - R - 10, wx + R + 10, top + 200, 18, t + 1, 13, 1.3); }
  ctx.restore();
  if (!open) { ctx.fillStyle = '#0d0a08'; for (let i = 1; i < 5; i++) { const x = wx - R + ww * i / 5; ctx.fillRect(x - 5.5, top, 11, bot - top); } [top + R + 26, bot - 96].forEach(y => ctx.fillRect(wx - R, y - 5.5, ww, 11));
  ctx.fillStyle = 'rgba(255,232,190,.22)'; for (let i = 1; i < 5; i++) ctx.fillRect(wx - R + ww * i / 5 - 5.5, top + 30, 2, bot - top - 30);
  ctx.fillStyle = '#3a3026'; for (let i = 1; i < 5; i++) [top + R + 26, bot - 96].forEach(y => { ctx.beginPath(); ctx.arc(wx - R + ww * i / 5, y, 7.5, 0, TAU); ctx.fill(); }); }
  else { ctx.save(); arch(0); ctx.clip(); ctx.strokeStyle = 'rgba(40,50,40,.75)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; pts(st, 'ob', 5, 417, r => [r(), r(), r() * 6]).forEach(([a, b, ph]) => { const x = wx - R + ((a * ww + t * 14) % ww), y = top + 60 + b * 90 + Math.sin(t * .6 + ph) * 5, f = Math.sin(t * 6 + ph) * 4; ctx.beginPath(); ctx.moveTo(x - 8, y - f); ctx.quadraticCurveTo(x - 3, y - 3, x, y); ctx.quadraticCurveTo(x + 3, y - 3, x + 8, y - f); ctx.stroke(); }); ctx.restore(); }
  const sl = ctx.createLinearGradient(0, bot, 0, bot + 40); sl.addColorStop(0, '#5a4a3a'); sl.addColorStop(1, '#2a221a'); ctx.fillStyle = sl; ctx.fillRect(wx - R - 70, bot + 24, ww + 140, 18);
  /* ışık huzmeleri */
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const dx = -.84, dy = .56, L = 620;
  for (let i = 0; i < 5; i++) { const g0 = wx - R + ww * i / 5 + (open ? 0 : 7), g1 = g0 + ww / 5 - (open ? 0 : 14), a = (.11 + .02 * Math.sin(t * .7 + i)) * (garden ? 1.25 : 1) * (open ? 1.2 : 1); const lg = ctx.createLinearGradient(wx, top + R, wx + dx * L, bot + dy * L); lg.addColorStop(0, `rgba(255,226,170,${a})`); lg.addColorStop(1, 'rgba(255,226,170,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(g0, top + 40); ctx.lineTo(g1, top + 40); ctx.lineTo(g1 + dx * L, bot + dy * L); ctx.lineTo(g0 + dx * L, bot + dy * L - 60); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  /* zemin ve ışık lekesi */
  const fy = h * .885; const fg = ctx.createLinearGradient(0, fy, 0, h); fg.addColorStop(0, '#1c1611'); fg.addColorStop(1, '#070504'); ctx.fillStyle = fg; ctx.fillRect(0, fy, w, h - fy);
  ctx.save(); ctx.beginPath(); ctx.moveTo(w * .4, fy + 6); ctx.lineTo(w * .66, fy + 6); ctx.lineTo(w * .58, h); ctx.lineTo(w * .28, h); ctx.closePath(); ctx.clip(); ctx.fillStyle = `rgba(255,214,150,${garden ? .34 : .26})`; ctx.fillRect(0, fy, w, h); ctx.fillStyle = open ? 'rgba(8,6,4,0)' : 'rgba(8,6,4,.6)'; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(w * (.4 + .26 * i / 5) - 5, fy); ctx.lineTo(w * (.4 + .26 * i / 5) + 5, fy); ctx.lineTo(w * (.28 + .3 * i / 5) + 9, h); ctx.lineTo(w * (.28 + .3 * i / 5) - 9, h); ctx.fill(); } ctx.restore();
  /* rahle ve açık kitap */
  const rx = w * .5, ry = fy + 34; ctx.strokeStyle = '#5a3c22'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(rx - 40, ry + 26); ctx.lineTo(rx + 34, ry - 22); ctx.moveTo(rx + 40, ry + 26); ctx.lineTo(rx - 34, ry - 22); ctx.stroke();
  glow(ctx, rx, ry - 30, 90, '255,236,190', .5); ctx.fillStyle = '#f6ecd4'; ctx.beginPath(); ctx.moveTo(rx, ry - 20); ctx.lineTo(rx - 44, ry - 34); ctx.lineTo(rx - 44, ry - 46); ctx.lineTo(rx, ry - 32); ctx.lineTo(rx + 44, ry - 46); ctx.lineTo(rx + 44, ry - 34); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,90,50,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx, ry - 20); ctx.lineTo(rx, ry - 32); ctx.stroke();
  if (garden) {
    const vine = (sx, sy, n, dir, seed) => { const r = srng(seed); let px = sx, py = sy; const P = []; ctx.strokeStyle = '#3f6a28'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py); for (let i = 0; i < n; i++) { px += dir * (4 + r() * 7) + Math.sin(i * .8 + t * .5) * 1.6; py -= 11 + r() * 8; ctx.lineTo(px, py); P.push([px, py]); } ctx.stroke(); P.forEach(([a, b], i) => { ctx.fillStyle = i % 3 ? '#5f9a3a' : '#7ab650'; ctx.beginPath(); ctx.ellipse(a + (i % 2 ? 11 : -11), b, 11, 5, i % 2 ? .5 : -.5, 0, TAU); ctx.fill(); if (i % 4 === 2) { glow(ctx, a, b - 6, 22, '255,170,190', .35); ctx.fillStyle = ['#ff7a9a', '#ffd36a', '#ffffff'][i % 3]; for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.ellipse(a + Math.cos(q * 1.256) * 6, b - 6 + Math.sin(q * 1.256) * 6, 5, 3, q * 1.256, 0, TAU); ctx.fill(); } } }); };
    vine(wx - R - 30, bot + 26, 26, .55, 411); vine(wx + R + 30, bot + 26, 26, -.45, 413); vine(wx - 20, bot + 26, 14, .2, 415);
    for (let i = 0; i < 5; i++) { const px = wx - R - 40 + i * (ww + 80) / 4, py = bot + 26; ctx.fillStyle = '#a8603a'; ctx.beginPath(); ctx.moveTo(px - 18, py - 26); ctx.lineTo(px + 18, py - 26); ctx.lineTo(px + 13, py); ctx.lineTo(px - 13, py); ctx.fill(); const s = .85 + .15 * Math.sin(t * .5 + i); ctx.strokeStyle = '#4e7a30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py - 26); ctx.lineTo(px, py - 26 - 40 * s); ctx.stroke(); ctx.fillStyle = '#86bc58'; ctx.beginPath(); ctx.ellipse(px - 9, py - 26 - 30 * s, 11, 5, -.5, 0, TAU); ctx.ellipse(px + 9, py - 26 - 38 * s, 11, 5, .5, 0, TAU); ctx.fill(); }
    falling(ctx, st, w, h, t, { key: 'cp', n: 26, kind: 'petal', colors: ['rgba(255,170,190,.9)', 'rgba(255,240,236,.9)'], speed: 18, size: 3, sway: 30, drift: -14, alpha: .9, area: [.45, 1] });
  }
  falling(ctx, st, w, h, t, { n: 46, kind: 'dot', colors: ['#ffe2b0'], speed: 7, up: true, size: 1.3, sway: 22, alpha: .5, fade: true, area: [.3, 1] });
  shade(ctx, w, h, ['l', '10,8,6', .9]); vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .06);
}

/* 2) Manevî sinema: aynı bahçe, bugün ve elli sene sonra */
function cinema2Scene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#1a1416', '#0b090b', '#040304'], .78, .36, .8);
  const sw = 470, sh = 300, sx = w * .965 - sw, sy = h * .13, ph = (Math.sin(t * .32 - 1.2) + 1) / 2, k = Math.min(1, Math.max(0, (ph - .32) / .36));
  glow(ctx, sx + sw / 2, sy + sh / 2, 520, k > .5 ? '150,160,210' : '255,226,170', .22);
  ctx.save(); rrect(ctx, sx, sy, sw, sh, 10); ctx.clip();
  const gy = sy + sh * .74, TX = [.1, .34, .7, .92], TL = [44, 30, 34, 48];
  const era = winter => {
    const g = ctx.createLinearGradient(0, sy, 0, gy); if (winter) { g.addColorStop(0, '#1e2238'); g.addColorStop(1, '#75697c'); } else { g.addColorStop(0, '#8cc6ea'); g.addColorStop(1, '#fdf0c8'); } ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
    if (winter) { glow(ctx, sx + sw * .82, sy + sh * .2, 70, '240,240,255', .5); ctx.fillStyle = '#eef0f8'; ctx.beginPath(); ctx.arc(sx + sw * .82, sy + sh * .2, 15, 0, TAU); ctx.fill(); ctx.fillStyle = '#1e2238'; ctx.beginPath(); ctx.arc(sx + sw * .82 + 6, sy + sh * .2 - 4, 13, 0, TAU); ctx.fill(); }
    else { glow(ctx, sx + sw * .18, sy + sh * .2, 120, '255,250,220', .9); bunting(ctx, sx - 6, sx + sw + 6, sy + sh * .16, 9, t, 16, .9); bunting(ctx, sx - 6, sx + sw + 6, sy + sh * .3, 12, t + 2, 13, 1); }
    const gg = ctx.createLinearGradient(0, gy, 0, sy + sh); if (winter) { gg.addColorStop(0, '#dfe6f0'); gg.addColorStop(1, '#9aa4b8'); } else { gg.addColorStop(0, '#8fc060'); gg.addColorStop(1, '#4f8a3c'); } ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(sx, sy + sh); for (let x = 0; x <= sw; x += 10) ctx.lineTo(sx + x, gy + 5 * Math.sin(x / 70)); ctx.lineTo(sx + sw, sy + sh); ctx.fill();
    { const bx = sx + sw * .5, bw = 268, bh = 78, b0 = gy + 3;
      ctx.fillStyle = winter ? '#3b3749' : '#efe0bc'; ctx.fillRect(bx - bw / 2, b0 - bh, bw, bh); ctx.fillStyle = winter ? '#2c2938' : '#d9c79c'; ctx.fillRect(bx - 34, b0 - bh - 16, 68, bh + 16);
      ctx.fillStyle = winter ? '#e6eaf2' : '#a8483a'; ctx.beginPath(); ctx.moveTo(bx - bw / 2 - 8, b0 - bh); ctx.lineTo(bx - bw / 2 + 14, b0 - bh - 16); ctx.lineTo(bx + bw / 2 - 14, b0 - bh - 16); ctx.lineTo(bx + bw / 2 + 8, b0 - bh); ctx.fill(); ctx.beginPath(); ctx.moveTo(bx - 40, b0 - bh - 16); ctx.lineTo(bx, b0 - bh - 38); ctx.lineTo(bx + 40, b0 - bh - 16); ctx.fill();
      for (let rw = 0; rw < 2; rw++) for (let c = 0; c < 9; c++) { if (c === 4) continue; ctx.fillStyle = winter ? '#17151f' : '#6f9cc0'; ctx.fillRect(bx - bw / 2 + 12 + c * 28, b0 - bh + 12 + rw * 32, 15, 20); }
      ctx.fillStyle = winter ? '#17151f' : '#7a5232'; ctx.beginPath(); ctx.moveTo(bx - 12, b0); ctx.lineTo(bx - 12, b0 - 30); ctx.arc(bx, b0 - 30, 12, Math.PI, 0); ctx.lineTo(bx + 12, b0); ctx.fill();
      ctx.strokeStyle = winter ? '#2a2836' : '#6a5a48'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, b0 - bh - 38); ctx.lineTo(bx, b0 - bh - 78); ctx.stroke();
      if (!winter) { ctx.fillStyle = '#d83a34'; ctx.beginPath(); const fy = b0 - bh - 78; ctx.moveTo(bx, fy); for (let q = 0; q <= 6; q++) ctx.lineTo(bx + q * 5, fy + Math.sin(t * 4 + q * .9) * 1.6); for (let q = 6; q >= 0; q--) ctx.lineTo(bx + q * 5, fy + 18 + Math.sin(t * 4 + q * .9) * 1.6); ctx.fill(); } }
    TX.forEach((u, i) => { const tips = []; twigTree(ctx, sx + sw * u, gy + 6, TL[i], 431 + i, winter ? '#15121c' : '#4a3020', 6, 5, tips);
      if (winter) { ctx.fillStyle = 'rgba(240,244,250,.9)'; tips.forEach(([x, y], j) => { if (j % 3 === 0) { ctx.beginPath(); ctx.ellipse(x, y, 5, 2.2, 0, 0, TAU); ctx.fill(); } }); }
      else tips.forEach(([x, y], j) => { ctx.fillStyle = ['rgba(246,150,170,.9)', 'rgba(255,236,232,.92)', 'rgba(250,196,206,.9)'][j % 3]; ctx.beginPath(); ctx.arc(x + Math.sin(t + j) * .8, y, 6.5 + (j % 3), 0, TAU); ctx.fill(); }); });
    if (winter) { pts(st, 'cg', 8, 437, r => [.06 + r() * .88, 20 + r() * 16, (r() - .5) * .3]).forEach(([u, ht, tl]) => { ctx.save(); ctx.translate(sx + sw * u, gy + 14); ctx.rotate(tl); ctx.fillStyle = '#4b4558'; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-8, -ht + 7); ctx.quadraticCurveTo(0, -ht - 5, 8, -ht + 7); ctx.lineTo(7, 0); ctx.fill(); ctx.fillStyle = '#eef2f8'; ctx.beginPath(); ctx.ellipse(0, -ht + 1, 8, 3, 0, 0, TAU); ctx.fill(); ctx.restore(); });
      pts(st, 'cs', 40, 439, r => [r(), r(), r()]).forEach(([a, b, c]) => { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(sx + ((a * sw + Math.sin(t + c * 9) * 8) % sw), sy + ((b * sh + t * 22 * (.5 + c)) % sh), 1.4, 0, TAU); ctx.fill(); }); }
  };
  era(false); if (k > 0) { ctx.globalAlpha = k; era(true); ctx.globalAlpha = 1; }
  ctx.fillStyle = 'rgba(120,80,30,.16)'; ctx.fillRect(sx, sy, sw, sh);
  pts(st, 'sc', 14, 441, r => [r(), r(), r()]).forEach(([a, b, c]) => { if (Math.sin(t * 17 + c * 40) > .5) { ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(sx + a * sw, sy, 1, sh * (.2 + b * .8)); } });
  ctx.fillStyle = `rgba(0,0,0,${.05 + .05 * Math.sin(t * 23)})`; ctx.fillRect(sx, sy, sw, sh);
  const vg = ctx.createRadialGradient(sx + sw / 2, sy + sh / 2, sh * .4, sx + sw / 2, sy + sh / 2, sw * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(sx, sy, sw, sh);
  ctx.restore();
  ctx.strokeStyle = '#2a2226'; ctx.lineWidth = 5; rrect(ctx, sx - 2, sy - 2, sw + 4, sh + 4, 12); ctx.stroke();
  /* zaman çizgisi */
  const ly = sy + sh + 40; ctx.strokeStyle = 'rgba(232,200,120,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx + 20, ly); ctx.lineTo(sx + sw - 20, ly); ctx.stroke();
  const px = sx + 20 + k * (sw - 40); glow(ctx, px, ly, 26, '255,214,140', .8); ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(px, ly, 6, 0, TAU); ctx.fill();
  ctx.font = "600 15px 'KursuSerif', Georgia, serif"; ctx.fillStyle = `rgba(232,200,120,${1 - k * .6})`; ctx.textAlign = 'left'; ctx.fillText('BUGÜN', sx + 20, ly + 28); ctx.fillStyle = `rgba(232,200,120,${.4 + k * .6})`; ctx.textAlign = 'right'; ctx.fillText('ELLİ SENE SONRA', sx + sw - 20, ly + 28);
  /* boş koltuklar */
  const tint = k > .5 ? '170,180,220' : '255,220,160';
  [[h * .86, 1], [h * .95, 1.25]].forEach(([y, s], ri) => { for (let x = w * .52 + (ri ? -30 : 0); x < w + 60; x += 92 * s) { ctx.fillStyle = '#0a0809'; rrect(ctx, x, y - 54 * s, 76 * s, 90 * s, 16 * s); ctx.fill(); ctx.strokeStyle = `rgba(${tint},${.3 - ri * .1})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 14 * s, y - 54 * s); ctx.lineTo(x + 62 * s, y - 54 * s); ctx.stroke(); } });
  shade(ctx, w, h, ['l', '8,6,8', .92]); grain(ctx, w, h, t, .1);
}

/* 3) Ömrün üç mevsimi: tek manzara */
function seasons2Scene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0d1528', '#1c2948', '#2c3a5c']);
  drawStars(ctx, st, w, h * .5, t, 70, .9, 451);
  const hz = h * .775;
  glow(ctx, w * .17, hz, 560, '120,190,240', .5); glow(ctx, w * .5, hz + 10, 520, '240,150,80', .5); glow(ctx, w * .85, hz, 520, '170,185,215', .36);
  glow(ctx, w * .1, h * .58, 110, '255,246,200', .8); ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.arc(w * .1, h * .58, 24, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffb060'; ctx.beginPath(); ctx.arc(w * .5, hz + 4, 34, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#eef0f8'; ctx.beginPath(); ctx.arc(w * .93, h * .58, 17, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a3654'; ctx.beginPath(); ctx.arc(w * .93 + 7, h * .58 - 4, 15, 0, TAU); ctx.fill();
  const hg = ctx.createLinearGradient(0, 0, w, 0); hg.addColorStop(0, '#3f6a5a'); hg.addColorStop(.5, '#7a5a4a'); hg.addColorStop(1, '#8a94aa'); ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 16; x += 16) ctx.lineTo(x, hz - 16 - 18 * Math.sin(x / 190 + 1) - 8 * Math.sin(x / 70)); ctx.lineTo(w, h); ctx.fill();
  const gy = x => hz + 8 * Math.sin(x / 240 + 2);
  const gg = ctx.createLinearGradient(0, 0, w, 0); [[0, '#4f8f3c'], [.3, '#7da040'], [.46, '#b98a3a'], [.62, '#a8946a'], [.76, '#dfe6ee'], [1, '#f4f8fc']].forEach(([a, c]) => gg.addColorStop(a, c)); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy(x)); ctx.lineTo(w, h); ctx.fill();
  const dg = ctx.createLinearGradient(0, hz, 0, h); dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,.42)'); ctx.fillStyle = dg; ctx.fillRect(0, hz - 10, w, h - hz + 10);
  /* yol */
  ctx.fillStyle = 'rgba(244,230,196,.38)'; ctx.beginPath(); ctx.moveTo(-10, h * .96); ctx.bezierCurveTo(w * .3, h * .85, w * .6, h * .985, w * 1.01, hz + 22); ctx.lineTo(w * 1.01, hz + 30); ctx.bezierCurveTo(w * .6, h * 1.04, w * .3, h * .92, -10, h * 1.04); ctx.fill();
  const T = [[.09, 42, 0], [.23, 34, 0], [.41, 39, 1], [.57, 32, 1], [.74, 37, 2], [.9, 30, 2]];
  T.forEach(([u, len, s], i) => { const x = w * u, y = gy(x) + 6, tips = []; twigTree(ctx, x, y, len, 461 + i, s === 2 ? '#1b1a26' : '#3a2616', 7, 5, tips);
    if (s === 0) tips.forEach(([a, b], j) => { ctx.fillStyle = ['rgba(70,130,60,.92)', 'rgba(96,160,74,.9)', 'rgba(56,110,50,.92)'][j % 3]; ctx.beginPath(); ctx.arc(a + Math.sin(t * .9 + j) * 1.2, b, 12 + (j % 4), 0, TAU); ctx.fill(); });
    else if (s === 1) tips.forEach(([a, b], j) => { if (j % 5 === 4) return; ctx.fillStyle = ['rgba(216,120,44,.92)', 'rgba(190,84,40,.9)', 'rgba(232,170,60,.9)'][j % 3]; ctx.beginPath(); ctx.arc(a + Math.sin(t * .9 + j) * 1.2, b, 9 + (j % 3), 0, TAU); ctx.fill(); });
    else { ctx.fillStyle = 'rgba(244,248,252,.95)'; tips.forEach(([a, b], j) => { if (j % 2) return; ctx.beginPath(); ctx.ellipse(a, b, 7, 2.6, 0, 0, TAU); ctx.fill(); }); } });
  falling(ctx, st, w, h, t, { key: 's2l', n: 22, kind: 'leaf', colors: ['#d8782c', '#be5428', '#e8aa3c'], speed: 26, size: 4, sway: 34, drift: 10, alpha: .9, area: [.34, .64] });
  pts(st, 's2g', 9, 471, r => [.7 + r() * .28, 30 + r() * 20, (r() - .5) * .22, r() < .45]).forEach(([u, ht, tl, kv]) => { const x = w * u, y = gy(x) + 16; ctx.save(); ctx.translate(x, y); ctx.rotate(tl); ctx.fillStyle = '#59607a'; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-11, -ht + 9); ctx.quadraticCurveTo(0, -ht - 7, 11, -ht + 9); ctx.lineTo(9, 0); ctx.fill(); if (kv) { ctx.beginPath(); ctx.ellipse(0, -ht - 5, 10, 8, 0, 0, TAU); ctx.fill(); } ctx.fillStyle = '#f4f8fc'; ctx.beginPath(); ctx.ellipse(0, -ht - (kv ? 11 : 1), 10, 3.4, 0, 0, TAU); ctx.fill(); ctx.restore(); });
  falling(ctx, st, w, h, t, { key: 's2s', n: 70, kind: 'snow', colors: ['#ffffff'], speed: 24, size: 2, sway: 22, alpha: .85, area: [.66, 1] });
  birds(ctx, st, w * .4, h * .6, t, 5, 473, 'rgba(20,30,40,.7)', 1);
  ctx.font = "italic 600 20px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; [['gençlik yazı', .16, '#eaf6d8'], ['ihtiyarlık güzü', .49, '#ffe6c0'], ['kabir ve berzah kışı', .83, '#2c3654']].forEach(([s, u, c]) => { ctx.fillStyle = c; ctx.fillText(s, w * u, h * .9); });
  const tg = ctx.createLinearGradient(0, 0, 0, h * .6); tg.addColorStop(0, 'rgba(8,12,26,.9)'); tg.addColorStop(1, 'rgba(8,12,26,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h * .6);
  vinyet(ctx, w, h, .35); grain(ctx, w, h, t, .05);
}

/* 4) Yol haritası: üç karelik film şeridi */
function stripScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#2a1e14', '#120d0a', '#050403'], .5, .1, .9);
  const y0 = h * .62, bh = h * .3, x0 = 118, cw = (w - 236) / 3;
  ctx.fillStyle = '#0a0808'; ctx.fillRect(0, y0, w, bh); ctx.fillStyle = '#2a211a'; for (let x = -((t * 14) % 44); x < w; x += 44) { rrect(ctx, x, y0 + 8, 22, 14, 3); ctx.fill(); rrect(ctx, x, y0 + bh - 22, 22, 14, 3); ctx.fill(); }
  for (let i = 0; i < 3; i++) { const fx = x0 + i * cw + 4, fw = cw - 34, fyy = y0 + 32, fh = bh - 64, cx = fx + fw / 2;
    ctx.save(); rrect(ctx, fx, fyy, fw, fh, 6); ctx.clip();
    if (i === 0) { ctx.fillStyle = '#17120e'; ctx.fillRect(fx, fyy, fw, fh); const g = ctx.createLinearGradient(0, fyy, 0, fyy + fh); g.addColorStop(0, '#8cc6ea'); g.addColorStop(1, '#fff0c4'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 46, fyy + fh - 16); ctx.lineTo(cx - 46, fyy + 60); ctx.arc(cx, fyy + 60, 46, Math.PI, 0); ctx.lineTo(cx + 46, fyy + fh - 16); ctx.fill(); glow(ctx, cx, fyy + 70, 130, '255,236,190', .35); ctx.fillStyle = '#0d0a08'; for (let b = 1; b < 4; b++) ctx.fillRect(cx - 46 + b * 23 - 2.5, fyy + 14, 5, fh - 30); ctx.fillRect(cx - 46, fyy + 84, 92, 5); }
    else if (i === 1) { lin(ctx, w, h, ['#1a0c22', '#3a1436']); ctx.fillStyle = '#120818'; ctx.fillRect(fx, fyy, fw / 2, fh); const wg = ctx.createLinearGradient(fx + fw / 2, 0, fx + fw, 0); wg.addColorStop(0, '#3a2814'); wg.addColorStop(1, '#6a4a22'); ctx.fillStyle = wg; ctx.fillRect(fx + fw / 2, fyy, fw / 2, fh);
      ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.beginPath(); ctx.ellipse(cx - fw * .24, fyy + 56, 20, 24, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - fw * .24 - 44, fyy + fh); ctx.quadraticCurveTo(cx - fw * .24, fyy + 60, cx - fw * .24 + 44, fyy + fh); ctx.fill(); glow(ctx, cx - fw * .24 - 7, fyy + 54, 7, '255,120,60', .9); glow(ctx, cx - fw * .24 + 7, fyy + 54, 7, '255,120,60', .9);
      const qx = cx + fw * .24, qy = fyy + fh - 20; glow(ctx, qx, qy - 70, 80, '255,200,110', .6); ctx.fillStyle = '#f0e6d0'; ctx.fillRect(qx - 7, qy - 50, 14, 50); ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.ellipse(qx, qy - 62, 5, 12 + Math.sin(t * 9), 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(cx - 1, fyy, 2, fh); }
    else { ctx.fillStyle = '#1c1611'; ctx.fillRect(fx, fyy, fw, fh); const g = ctx.createLinearGradient(0, fyy, 0, fyy + fh); g.addColorStop(0, '#8fd0f2'); g.addColorStop(1, '#bfe08a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 46, fyy + fh - 16); ctx.lineTo(cx - 46, fyy + 60); ctx.arc(cx, fyy + 60, 46, Math.PI, 0); ctx.lineTo(cx + 46, fyy + fh - 16); ctx.fill(); glow(ctx, cx, fyy + 70, 140, '255,240,190', .45); ctx.fillStyle = '#0d0a08'; for (let b = 1; b < 4; b++) ctx.fillRect(cx - 46 + b * 23 - 2.5, fyy + 14, 5, fh - 30);
      for (let v = 0; v < 2; v++) { ctx.strokeStyle = '#4e8a30'; ctx.lineWidth = 3; ctx.beginPath(); let px = cx + (v ? 56 : -56), py = fyy + fh - 8; ctx.moveTo(px, py); for (let q = 0; q < 9; q++) { px += (v ? -1 : 1) * 3 + Math.sin(q + t) * 1.5; py -= 11; ctx.lineTo(px, py); ctx.fillStyle = q % 3 ? '#6aa844' : '#ff8aa6'; ctx.fillRect(px - 4, py - 3, 8, 6); } ctx.stroke(); } }
    ctx.fillStyle = 'rgba(120,80,30,.14)'; ctx.fillRect(fx, fyy, fw, fh); ctx.restore();
    ctx.strokeStyle = 'rgba(232,200,120,.5)'; ctx.lineWidth = 1.5; rrect(ctx, fx, fyy, fw, fh, 6); ctx.stroke(); }
  const sw2 = ((t * .12) % 1) * (w + 300) - 150; const sg = ctx.createLinearGradient(sw2 - 120, 0, sw2 + 120, 0); sg.addColorStop(0, 'rgba(255,240,200,0)'); sg.addColorStop(.5, 'rgba(255,240,200,.1)'); sg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = sg; ctx.fillRect(0, y0, w, bh);
  vinyet(ctx, w, h, .45); grain(ctx, w, h, t, .08);
}

/* 5) Şahs-ı manevî: bayram ışıklarının ardındaki gölge */
function festiveShadowScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#07040f', '#170a26', '#3a1238', '#7a2a44']);
  drawStars(ctx, st, w, h * .5, t, 70, .9, 481);
  const B = [['255,214,120', .56, .2], ['255,120,170', .7, .3], ['120,220,255', .92, .22], ['255,180,90', .62, .42]];
  B.forEach(([c, x, y], b) => { const k = ((t / 3.4) + b * .27) % 1; if (k > .78) return; const q = k / .78, R = Math.pow(q, .6) * 120, a = 1 - q; glow(ctx, w * x, h * y, R * 1.3, c, .16 * a); for (let i = 0; i < 28; i++) { const an = i / 28 * TAU + b, px = w * x + Math.cos(an) * R, py = h * y + Math.sin(an) * R + q * q * 36; ctx.strokeStyle = `rgba(${c},${a * .55})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(w * x + Math.cos(an) * R * .7, h * y + Math.sin(an) * R * .7 + q * q * 26); ctx.lineTo(px, py); ctx.stroke(); ctx.fillStyle = `rgba(${c},${a})`; ctx.beginPath(); ctx.arc(px, py, 2.2, 0, TAU); ctx.fill(); } });
  /* dev gölge */
  const fx = w * .8, by = h * .86, br = 1 + .012 * Math.sin(t * .7);
  ctx.save(); ctx.translate(fx, by); ctx.scale(br, br); const g = ctx.createLinearGradient(0, -520, 0, 0); g.addColorStop(0, 'rgba(2,1,5,.96)'); g.addColorStop(1, 'rgba(6,3,10,.72)'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-236, 0); ctx.bezierCurveTo(-240, -150, -226, -292, -128, -334); ctx.lineTo(-44, -366); ctx.lineTo(-40, -398); ctx.bezierCurveTo(-74, -430, -70, -520, 0, -524); ctx.bezierCurveTo(70, -520, 74, -430, 40, -398); ctx.lineTo(44, -366); ctx.lineTo(128, -334); ctx.bezierCurveTo(226, -292, 240, -150, 236, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(2,1,5,.5)'; ctx.beginPath(); ctx.moveTo(-44, -366); ctx.lineTo(0, -250); ctx.lineTo(44, -366); ctx.closePath(); ctx.fill();
  const e = .7 + .3 * Math.sin(t * 1.6); [-19, 19].forEach(d => { glow(ctx, d, -462, 15, '255,110,50', .85 * e); ctx.fillStyle = `rgba(255,190,120,${e})`; ctx.beginPath(); ctx.ellipse(d, -462, 5, 2.2, d > 0 ? .25 : -.25, 0, TAU); ctx.fill(); });
  ctx.restore();
  ctx.save(); ctx.translate(0, h * .9); ctx.scale(1, .46); ctx.translate(0, -h * .9); skyline(ctx, st, w, h, h * .9, '#05030a', 483, true); ctx.restore();
  pts(st, 'fb', 26, 485, r => [.46 + r() * .56, .86 + r() * .14, 8 + r() * 22, r()]).forEach(([x, y, rr, c]) => { const col = ['255,200,110', '255,120,170', '120,220,255'][c * 3 | 0]; glow(ctx, w * x, h * y, rr * (1 + .2 * Math.sin(t * 2 + c * 9)), col, .22); });
  shade(ctx, w, h, ['l', '8,4,14', .93]); vinyet(ctx, w, h, .4); grain(ctx, w, h, t, .08);
}

/* 6) Sekizinci Söz: kuyudaki adam */
function wellScene(ctx, w, h, t, st) {
  ctx.fillStyle = '#0d0907'; ctx.fillRect(0, 0, w, h);
  const cx = w * .72, hw = 118, y0 = h * .19;
  const eg = ctx.createLinearGradient(0, y0, 0, h); eg.addColorStop(0, '#4a3422'); eg.addColorStop(.5, '#22160e'); eg.addColorStop(1, '#080504'); ctx.fillStyle = eg; ctx.fillRect(w * .46, y0, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); for (let x = w * .46; x <= w; x += 24) ctx.lineTo(x, y0 + 40 + i * 62 + Math.sin(x / 90 + i) * 8); ctx.stroke(); }
  const sk = ctx.createLinearGradient(0, 0, 0, y0); sk.addColorStop(0, '#2a2038'); sk.addColorStop(1, '#b8763a'); ctx.fillStyle = sk; ctx.fillRect(w * .46, 0, w, y0); glow(ctx, w * .93, y0 * .86, 220, '255,214,150', .7);
  ctx.fillStyle = '#2e3c1c'; for (let x = w * .46; x < w; x += 9) { if (Math.abs(x - cx) < hw + 30) continue; ctx.beginPath(); ctx.moveTo(x, y0 + 2); ctx.lineTo(x + 3 + Math.sin(t * 1.4 + x) * 1.5, y0 - 10 - (x * 7 % 9)); ctx.lineTo(x + 6, y0 + 2); ctx.fill(); }
  /* kuyu */
  const wg = ctx.createLinearGradient(0, y0, 0, h); wg.addColorStop(0, '#6a543c'); wg.addColorStop(.22, '#33251a'); wg.addColorStop(.6, '#150e0a'); wg.addColorStop(1, '#030202'); ctx.fillStyle = wg; ctx.fillRect(cx - hw, y0 - 4, hw * 2, h);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lc = ctx.createLinearGradient(0, y0, 0, h * .62); lc.addColorStop(0, 'rgba(255,226,170,.3)'); lc.addColorStop(1, 'rgba(255,226,170,0)'); ctx.fillStyle = lc; ctx.beginPath(); ctx.moveTo(cx - hw, y0); ctx.lineTo(cx + hw, y0); ctx.lineTo(cx + hw * .5, h * .62); ctx.lineTo(cx - hw * .5, h * .62); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5; for (let y = y0 + 26, r = 0; y < h; y += 30, r++) { ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.quadraticCurveTo(cx, y + 9, cx + hw, y); ctx.stroke(); for (let x = cx - hw + (r % 2 ? 20 : 44); x < cx + hw; x += 48) { ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x, y + 2); ctx.stroke(); } }
  [-1, 1].forEach(d => { ctx.fillStyle = '#9a8468'; rrect(ctx, cx + d * hw - (d < 0 ? 30 : 0), y0 - 24, 30, 30, 4); ctx.fill(); ctx.fillStyle = '#7a6850'; rrect(ctx, cx + d * hw - (d < 0 ? 56 : -26), y0 - 12, 30, 18, 4); ctx.fill(); });
  /* arslan */
  const lx = cx - hw - 34, ly = y0 - 52, col = '#2c170a'; ctx.fillStyle = col;
  ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = i % 2 ? 50 : 40; ctx.lineTo(lx + Math.cos(a) * rr, ly + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3c220f'; ctx.beginPath(); ctx.ellipse(lx + 16, ly + 8, 30, 27, .2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(lx - 4, ly - 22, 9, 0, TAU); ctx.arc(lx + 34, ly - 18, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(lx + 30, ly + 22, 13, 9, .3, 0, TAU); ctx.fill(); rrect(ctx, lx + 14, y0 - 18, 44, 16, 8); ctx.fill();
  const le = .7 + .3 * Math.sin(t * 1.3); [[6, 2], [28, 4]].forEach(([a, b]) => { glow(ctx, lx + a, ly + b, 12, '255,190,60', .9 * le); ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.ellipse(lx + a, ly + b, 4, 2.6, .2, 0, TAU); ctx.fill(); });
  /* ağaç */
  const rx = cx + hw, ry = h * .5; ctx.strokeStyle = '#3a2616'; ctx.lineCap = 'round'; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(rx + 6, ry + 8); ctx.bezierCurveTo(rx - 40, ry + 6, rx - 60, ry - 20, rx - 96, ry - 44); ctx.stroke();
  const tips = []; ctx.save(); ctx.translate(rx - 96, ry - 44); ctx.rotate(-.5); twigTree(ctx, 0, 0, 40, 491, '#3a2616', 9, 4, tips); ctx.restore();
  const TT = tips.map(([a, b]) => [rx - 96 + a * Math.cos(-.5) - b * Math.sin(-.5), ry - 44 + a * Math.sin(-.5) + b * Math.cos(-.5)]);
  TT.forEach(([a, b], j) => { ctx.fillStyle = j % 2 ? '#4f7a34' : '#6a9a44'; ctx.beginPath(); ctx.ellipse(a, b, 12, 6, j, 0, TAU); ctx.fill(); if (j % 3 === 0) { glow(ctx, a + 4, b + 10, 16, '255,200,90', .7 + .2 * Math.sin(t * 2 + j)); ctx.fillStyle = '#ffc24a'; ctx.beginPath(); ctx.arc(a + 4, b + 10, 5.5, 0, TAU); ctx.fill(); } });
  /* iki fare */
  [['#f2efe8', -4, 0], ['#15110f', 22, .5]].forEach(([c, dy, ph]) => { const mx = rx - 14, my = ry + dy + Math.sin(t * 9 + ph * 6) * 1.2; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(mx, my, 14, 8, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(mx - 12, my - 2, 6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(mx - 12, my - 9, 3.4, 0, TAU); ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(mx + 13, my); ctx.quadraticCurveTo(mx + 26, my - 10, mx + 30, my + 4); ctx.stroke(); });
  /* adam */
  const hx = rx - 150, hy = ry - 74, sw = Math.sin(t * 1.1) * .08; ctx.save(); ctx.translate(hx, hy); ctx.rotate(sw); ctx.strokeStyle = '#0a0706'; ctx.fillStyle = '#0a0706'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-6, 34); ctx.moveTo(8, 0); ctx.lineTo(6, 34); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 30, 9, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 62, 11, 24, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-5, 82); ctx.lineTo(-8, 116); ctx.moveTo(5, 82); ctx.lineTo(9, 114); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = '#3a2616'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(rx - 100, ry - 50); ctx.lineTo(hx - 14, hy - 2); ctx.stroke();
  /* ejderha */
  const dyy = h * .9; glow(ctx, cx, h * 1.02, 230, '255,70,30', .5 + .1 * Math.sin(t * 2));
  ctx.fillStyle = '#060303'; [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(cx + d * hw, h); ctx.lineTo(cx + d * hw, dyy - 34); ctx.quadraticCurveTo(cx + d * 60, dyy - 14, cx + d * 14, h); ctx.fill(); ctx.fillStyle = '#e8dcc0'; for (let i = 0; i < 5; i++) { const u = i / 5, tx = cx + d * (hw - 14 - u * 80), ty = dyy - 26 + u * 40; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - d * 9, ty + 20); ctx.lineTo(tx - d * 14, ty + 4); ctx.fill(); } ctx.fillStyle = '#060303'; });
  const de = .75 + .25 * Math.sin(t * 1.9); [-1, 1].forEach(d => { glow(ctx, cx + d * 80, dyy - 52, 20, '190,255,90', .8 * de); ctx.fillStyle = '#d8ff7a'; ctx.beginPath(); ctx.ellipse(cx + d * 80, dyy - 52, 9, 5, d * .3, 0, TAU); ctx.fill(); ctx.fillStyle = '#060303'; ctx.beginPath(); ctx.ellipse(cx + d * 80, dyy - 52, 2, 5, 0, 0, TAU); ctx.fill(); });
  /* etiketler */
  const lxx = cx + hw + 22; ctx.strokeStyle = 'rgba(232,200,120,.45)'; ctx.lineWidth = 1;
  [[y0 - 62, 'arslan', 'ecel', lx + 56, ly - 6], [ry - 96, 'meyveler', 'dünya nimetleri', rx - 70, ry - 84], [ry - 34, 'ağaç', 'ömrün müddeti', rx - 40, ry - 20], [ry + 26, 'iki fare', 'gece ve gündüz', rx + 6, ry + 10], [dyy - 48, 'ejderha', 'kabrin ağzı', cx + 96, dyy - 50]].forEach(([y, a, b, px, py]) => { ctx.beginPath(); ctx.moveTo(lxx - 6, y - 5); ctx.lineTo(px, py); ctx.stroke(); clbl(ctx, lxx, y, a, b); });
  shade(ctx, w, h, ['l', '8,6,4', .95]); vinyet(ctx, w, h, .35); grain(ctx, w, h, t, .06);
}

/* 7) İntizar salonu: derinleşen kemerler */
function arcadeScene(ctx, w, h, t, st, p) {
  p = p || {}; const vx = w * (p.cx || .5), vy = h * .5;
  lin(ctx, w, h, ['#fff2cc', '#f6d48a', '#c08a3c']);
  glow(ctx, vx, vy, Math.max(w, 500) * .7, '255,252,236', .95);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .03, g = ctx.createLinearGradient(vx, vy, vx + Math.cos(a) * 700, vy + Math.sin(a) * 700); g.addColorStop(0, 'rgba(255,246,214,.2)'); g.addColorStop(1, 'rgba(255,246,214,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + Math.cos(a - .05) * 800, vy + Math.sin(a - .05) * 800); ctx.lineTo(vx + Math.cos(a + .05) * 800, vy + Math.sin(a + .05) * 800); ctx.fill(); } ctx.restore();
  const N = 7, mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k)), near = [38, 24, 12], far = [250, 224, 170], BW = Math.max(w, 640) * .66, BH = h * .78;
  for (let k = N; k >= 0; k--) { const s = 1 / (1 + k * .62), HW = BW * s, top = vy - BH * .62 * s, bot = vy + BH * .58 * s, pw = 86 * s, c = mix(near, far, Math.pow(k / N, .7));
    if (k < N) { const s2 = 1 / (1 + (k + 1) * .62), b2 = vy + BH * .58 * s2, fg = ctx.createLinearGradient(0, b2, 0, bot); const c2 = mix(near, far, Math.pow((k + 1) / N, .7)); fg.addColorStop(0, `rgba(${c2},.95)`); fg.addColorStop(1, `rgba(${c},.98)`); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(vx - BW * s2, b2); ctx.lineTo(vx + BW * s2, b2); ctx.lineTo(vx + HW, bot); ctx.lineTo(vx - HW, bot); ctx.fill(); ctx.fillStyle = 'rgba(255,246,214,.12)'; ctx.beginPath(); ctx.moveTo(vx - 30 * s2, b2); ctx.lineTo(vx + 30 * s2, b2); ctx.lineTo(vx + 40 * s, bot); ctx.lineTo(vx - 40 * s, bot); ctx.fill(); }
    ctx.fillStyle = `rgb(${c})`; ctx.beginPath(); ctx.rect(vx - HW - 400 * s, top - 400 * s, HW * 2 + 800 * s, bot - top + 400 * s);
    const r = HW - pw, sp = top + pw + r * .9; ctx.moveTo(vx - r, bot); ctx.lineTo(vx - r, sp); ctx.bezierCurveTo(vx - r, sp - r * .9, vx - r * .35, top + pw * .4, vx, top + pw * .25); ctx.bezierCurveTo(vx + r * .35, top + pw * .4, vx + r, sp - r * .9, vx + r, sp); ctx.lineTo(vx + r, bot); ctx.closePath(); ctx.fill('evenodd');
    ctx.strokeStyle = `rgba(255,240,200,${.1 + .25 * (k / N)})`; ctx.lineWidth = 2 * s + .5; ctx.beginPath(); ctx.moveTo(vx - r, bot); ctx.lineTo(vx - r, sp); ctx.bezierCurveTo(vx - r, sp - r * .9, vx - r * .35, top + pw * .4, vx, top + pw * .25); ctx.bezierCurveTo(vx + r * .35, top + pw * .4, vx + r, sp - r * .9, vx + r, sp); ctx.lineTo(vx + r, bot); ctx.stroke();
    const ly = top + pw * .25 + 40 * s + Math.sin(t * .9 + k) * 3 * s; ctx.strokeStyle = `rgba(90,60,24,${.7})`; ctx.lineWidth = 1.5 * s + .3; ctx.beginPath(); ctx.moveTo(vx, top + pw * .25); ctx.lineTo(vx, ly - 14 * s); ctx.stroke(); glow(ctx, vx, ly, 50 * s, '255,214,130', .85); ctx.fillStyle = '#ffe2a0'; ctx.beginPath(); ctx.ellipse(vx, ly, 9 * s, 13 * s, 0, 0, TAU); ctx.fill(); }
  falling(ctx, st, w, h, t, { key: 'ar', n: 50, kind: 'dot', colors: ['#fffbe8'], speed: 10, up: true, size: 1.7, sway: 24, alpha: .8, fade: true, area: [0, 1] });
  if (p.shade) shade(ctx, w, h, p.shade);
  if (!p.half) { vinyet(ctx, w, h, .3); grain(ctx, w, h, t, .05); }
}

/* 8) Akıl: tılsımlı anahtar */
function keyScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#22203a', '#0e0d1c', '#040408'], .8, .34, .85);
  const dx = w * .81, dy = h * .39, R = 160;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .05, g = ctx.createLinearGradient(dx, dy, dx + Math.cos(a) * 520, dy + Math.sin(a) * 520); g.addColorStop(0, 'rgba(255,226,150,.2)'); g.addColorStop(1, 'rgba(255,226,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(a - .04) * 560, dy + Math.sin(a - .04) * 560); ctx.lineTo(dx + Math.cos(a + .04) * 560, dy + Math.sin(a + .04) * 560); ctx.fill(); } ctx.restore();
  const dg = ctx.createRadialGradient(dx - 40, dy - 50, 20, dx, dy, R); dg.addColorStop(0, '#a8843e'); dg.addColorStop(.6, '#5a401c'); dg.addColorStop(1, '#2a1e0e'); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dx, dy, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,226,160,.5)'; [R - 6, R - 40, R - 96].forEach((r, i) => { ctx.lineWidth = i ? 2 : 5; ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.stroke(); });
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.fillStyle = '#d6b46a'; ctx.beginPath(); ctx.arc(dx + Math.cos(a) * (R - 23), dy + Math.sin(a) * (R - 23), 6, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; ctx.strokeStyle = 'rgba(214,180,106,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx + Math.cos(a) * 46, dy + Math.sin(a) * 46); ctx.lineTo(dx + Math.cos(a) * (R - 44), dy + Math.sin(a) * (R - 44)); ctx.stroke(); }
  glow(ctx, dx, dy, 200, '255,246,214', .7 + .1 * Math.sin(t * 1.4)); ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(dx, dy - 10, 20, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(dx - 11, dy); ctx.lineTo(dx + 11, dy); ctx.lineTo(dx + 18, dy + 46); ctx.lineTo(dx - 18, dy + 46); ctx.fill();
  /* fırtına: geçmiş ve gelecek */
  clouds(ctx, st, w, h, t, 9, h * .74, h * .98, '16,14,26', .85, 501, 5);
  const fl = Math.sin(t * 1.3) > .965 || Math.sin(t * 2.1 + 1) > .985; if (fl) { ctx.strokeStyle = 'rgba(220,225,255,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); let x = w * .62, y = h * .78; ctx.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (i % 2 ? 16 : -10); y += 24; ctx.lineTo(x, y); } ctx.stroke(); ctx.fillStyle = 'rgba(200,210,255,.06)'; ctx.fillRect(w * .46, h * .7, w, h); }
  /* anahtar */
  const kx = w * .635 + Math.sin(t * .8) * 4, ky = h * .7 + Math.cos(t * .8) * 4; ctx.save(); ctx.translate(kx, ky); ctx.rotate(-.92 + Math.sin(t * .6) * .02);
  glow(ctx, 120, 0, 190, '255,214,120', .3); const kg = ctx.createLinearGradient(0, -40, 0, 40); kg.addColorStop(0, '#f6dc94'); kg.addColorStop(.5, '#c9993e'); kg.addColorStop(1, '#8a6422'); ctx.strokeStyle = kg; ctx.fillStyle = kg;
  ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.stroke(); ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + Math.PI; ctx.beginPath(); ctx.arc(Math.cos(a) * 15, Math.sin(a) * 15, 10, 0, TAU); ctx.stroke(); }
  ctx.fillRect(42, -8, 214, 16); ctx.fillRect(50, -14, 14, 28); ctx.fillRect(72, -12, 8, 24); ctx.fillRect(204, 8, 12, 34); ctx.fillRect(222, 8, 12, 24); ctx.fillRect(240, 8, 16, 40); ctx.fillRect(204, 34, 30, 8);
  ctx.strokeStyle = 'rgba(255,250,220,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(46, -5); ctx.lineTo(252, -5); ctx.stroke(); ctx.restore();
  ctx.font = "italic 16px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,236,190,.92)'; ctx.fillText('Mâlik-i Hakikîsi hesabına: rahmet hazineleri', dx - 10, dy - R - 22); ctx.fillStyle = 'rgba(190,196,230,.85)'; ctx.fillText('nefis hesabına: geçmişin elemi, geleceğin korkusu', w * .79, h * .9);
  shade(ctx, w, h, ['l', '6,6,16', .93]); vinyet(ctx, w, h, .35); grain(ctx, w, h, t, .06);
}

/* 9) Otlak: geçmişi ve geleceği olmayan sürü, düşünen insan */
function meadowScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#141c40', '#3c3e72', '#b9786a', '#f6c888']);
  drawStars(ctx, st, w, h * .4, t, 60, .9, 511);
  const sx = w * .7, sy = h * .7; glow(ctx, sx, sy, 520, '255,206,130', .7); ctx.fillStyle = '#ffe9b8'; ctx.beginPath(); ctx.arc(sx, sy, 44, 0, TAU); ctx.fill();
  clouds(ctx, st, w, h, t, 5, h * .3, h * .52, '255,170,130', .3, 513, 3);
  hills(ctx, w, h, h * .72, 26, 300, 1.4, '#6a5a7a'); mist(ctx, w, h, h * .72, '255,210,170', .3);
  hills(ctx, w, h, h * .8, 22, 220, 3.1, '#3c4a48');
  const hy = x => h * .8 - 22 * (Math.sin(x / 220 + 3.1) * .6 + Math.sin(x / (220 * .37) + 3.1 * 2.3) * .25 + Math.sin(x / (220 * 2.1) + 3.1 * .7) * .4);
  pts(st, 'sh', 11, 515, r => [.62 + r() * .2, r() * 6, .8 + r() * .5, r() < .65, r()]).forEach(([u, ph, s, graze, v]) => { const x = w * u + Math.sin(t * .15 + ph) * 12, y = hy(x) - 9 * s; ctx.fillStyle = '#17131c'; ctx.beginPath(); ctx.ellipse(x, y, 17 * s, 11 * s, 0, 0, TAU); ctx.fill(); const hd = graze ? [x - 17 * s, y + 6 * s + Math.sin(t * 3 + ph) * 1.5] : [x - 18 * s, y - 8 * s]; ctx.beginPath(); ctx.ellipse(hd[0], hd[1], 7 * s, 5.5 * s, -.5, 0, TAU); ctx.fill(); ctx.fillRect(x - 10 * s, y + 6 * s, 3.4 * s, 11 * s); ctx.fillRect(x + 8 * s, y + 6 * s, 3.4 * s, 11 * s);
    ctx.strokeStyle = 'rgba(255,214,150,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, y, 17 * s, 11 * s, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
  ctx.fillStyle = '#12161a'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, h * .93 - 34 * Math.exp(-Math.pow((x - w * .9) / 190, 2)) - 6 * Math.sin(x / 150)); ctx.lineTo(w, h); ctx.fill();
  const mx = w * .9, my = h * .93 - 34; ctx.fillStyle = '#0a0c10'; ctx.beginPath(); ctx.arc(mx - 4, my - 62, 12, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(mx - 22, my - 46); ctx.quadraticCurveTo(mx - 2, my - 54, mx + 16, my - 44); ctx.lineTo(mx + 26, my + 4); ctx.lineTo(mx - 30, my + 4); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(mx - 30, my + 4); ctx.lineTo(mx - 62, my - 14); ctx.lineTo(mx - 70, my + 6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,150,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx - 4, my - 62, 12, Math.PI * .9, Math.PI * 1.7); ctx.stroke();
  for (let i = 0; i < 26; i++) { const x = w * .46 + i * 28; ctx.strokeStyle = '#1a2420'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + Math.sin(t * 1.3 + i) * 4, h * .95 - (i * 13 % 14)); ctx.stroke(); }
  shade(ctx, w, h, ['l', '14,16,40', .9]); vinyet(ctx, w, h, .35); grain(ctx, w, h, t, .06);
}

/* 10) Peygamberler silsilesi */
function chain2Scene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#262245', '#100e22', '#04040c'], .76, .0, .95); drawStars(ctx, st, w, h, t, 120, 1, 521);
  const cx = w * .76; glow(ctx, cx, -30, 460, '255,232,170', .55);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(0, 0, 0, h * .9); lg.addColorStop(0, 'rgba(255,232,170,.16)'); lg.addColorStop(1, 'rgba(255,232,170,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx - 30, 0); ctx.lineTo(cx + 30, 0); ctx.lineTo(cx + 170, h * .9); ctx.lineTo(cx - 170, h * .9); ctx.fill(); ctx.restore();
  const NM = ['Âdem', 'Nûh', 'İbrâhim', 'Mûsâ', 'Îsâ'], sp = (t * .5) % 7; let y = 34;
  const ring = (x, y, rx, ry, lw, bright) => { ctx.lineWidth = lw + 4; ctx.strokeStyle = 'rgba(20,14,6,.8)'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke(); const g = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry); g.addColorStop(0, bright ? '#fff0b8' : '#f2d68e'); g.addColorStop(.5, bright ? '#e8b84a' : '#b58a3e'); g.addColorStop(1, bright ? '#fff0b8' : '#e0be70'); ctx.strokeStyle = g; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(255,252,230,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x - 1, y - 1, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke(); };
  for (let i = 0; i < 10; i++) { const front = i % 2 === 0, ry = 30, x = cx + Math.sin(t * .5 + i * .3) * i * .8; const lit = Math.abs(sp * 1.6 - i) < 1; if (lit) glow(ctx, x, y + ry, 60, '255,226,150', .5); ring(x, y + ry, front ? 19 : 6, ry, 8, lit);
    if (front) { const k = i / 2; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(244,232,208,.85)'; ctx.font = "italic 17px 'KursuSerif', Georgia, serif"; ctx.fillText(NM[k], x + 38, y + ry + 6); }
    y += ry * 2 - 13; }
  const bx = cx + Math.sin(t * .5 + 3) * 8, byy = y + 52, pulse = .7 + .3 * Math.sin(t * 1.4); glow(ctx, bx, byy, 170, '255,226,150', .5 * pulse); ring(bx, byy, 40, 56, 14, true);
  ctx.textAlign = 'left'; ctx.fillStyle = '#ffe9b0'; ctx.font = "600 22px 'KursuSerif', Georgia, serif"; ctx.fillText('Muhammed', bx + 62, byy - 2); ctx.fillStyle = 'rgba(244,232,208,.8)'; ctx.font = "italic 15px 'KursuSerif', Georgia, serif"; ctx.fillText('aleyhissalâtü vesselâm', bx + 62, byy + 20);
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(232,200,120,.8)'; ctx.font = "italic 15px 'KursuSerif', Georgia, serif"; ctx.fillText('peygamberler silsilesi', cx - 44, 70); ctx.fillText('(aleyhimüsselâm)', cx - 44, 90);
  shade(ctx, w, h, ['l', '6,5,16', .93]); vinyet(ctx, w, h, .35); grain(ctx, w, h, t, .06);
}
Object.assign(SCENES, {
  hucre: { name: 'Hücre penceresi', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['hapishane', 'pencere', 'bayram'], aff: { cover: 1 }, draw: M(cellScene, {}) },
  acikpencere: { name: 'Açılan pencere', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['pencere', 'hülâsa', 'dua'], aff: { bullets: 1 }, draw: M(cellScene, { garden: 1, open: 1 }) },
  hucrebahce: { name: 'Bahçeye dönen hücre', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['medrese-i yusufiye', 'bahçe', 'fidan'], aff: { alinti: 1 }, draw: M(cellScene, { garden: 1 }) },
  sinema2: { name: 'Manevî sinema', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['sinema', 'elli sene', 'istikbal'], aff: { alinti: 1 }, draw: cinema2Scene },
  mevsimler2: { name: 'Ömrün üç mevsimi', fam: 'zaman', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yaz', 'güz', 'kış', 'gençlik', 'ihtiyarlık'], aff: { alinti: 1 }, draw: seasons2Scene },
  ucperde: { name: 'Üç karelik şerit', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['akış', 'perde', 'yol haritası'], aff: { timeline: 1 }, draw: stripScene },
  bayramgolgesi: { name: 'Bayram ışıklarındaki gölge', fam: 'golge', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['sefahet', 'dalalet', 'şahs-ı manevi', 'lezzet'], aff: { diyalog: 1 }, draw: festiveShadowScene },
  kuyu: { name: 'Kuyudaki adam', fam: 'temsil', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kuyu', 'arslan', 'ejderha', 'sekizinci söz'], aff: { bullets: 1 }, draw: wellScene },
  kemerler: { name: 'İntizar salonu', fam: 'isik', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['saadet', 'intizar', 'saray', 'iman'], aff: { alinti: 1 }, draw: M(arcadeScene, { cx: .74, shade: ['l', '34,22,8', .96] }) },
  mezarkemer: { name: 'Mezaristan ve intizar salonu', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['mazi', 'iman', 'dalalet'], aff: { compare: 1 }, draw: split(M(gravesScene, {}), M(arcadeScene, { half: 1 })) },
  anahtar: { name: 'Tılsımlı anahtar', fam: 'kapi', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['akıl', 'anahtar', 'hazine'], aff: { alinti: 1 }, draw: keyScene },
  otlak: { name: 'Otlak ve düşünen insan', fam: 'tarla', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['hayvan', 'mazi', 'müstakbel'], aff: { diyalog: 1 }, draw: meadowScene },
  silsile: { name: 'Peygamberler silsilesi', fam: 'zincir', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['zincir', 'peygamber', 'silsile'], aff: { diyalog: 1 }, draw: chain2Scene }
});

/* 11) Kum saati: akan gençlik, altta bâkiye dönen bahçe */
function hourGardenScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#2c2116', '#130e0a', '#050403'], .77, .5, .8);
  const cx = w * .775, cy = h * .5, HW = 138, HH = 236, nk = 11;
  glow(ctx, cx, cy + HH * .6, 380, '255,190,200', .16); glow(ctx, cx, cy - HH * .5, 340, '255,214,140', .2);
  const shape = () => { ctx.beginPath(); ctx.moveTo(cx - HW, cy - HH); ctx.lineTo(cx + HW, cy - HH); ctx.bezierCurveTo(cx + HW, cy - HH * .3, cx + nk, cy - 46, cx + nk, cy); ctx.bezierCurveTo(cx + nk, cy + 46, cx + HW, cy + HH * .3, cx + HW, cy + HH); ctx.lineTo(cx - HW, cy + HH); ctx.bezierCurveTo(cx - HW, cy + HH * .3, cx - nk, cy + 46, cx - nk, cy); ctx.bezierCurveTo(cx - nk, cy - 46, cx - HW, cy - HH * .3, cx - HW, cy - HH); ctx.closePath(); };
  ctx.save(); shape(); ctx.clip();
  ctx.fillStyle = 'rgba(255,240,210,.045)'; ctx.fillRect(cx - HW, cy - HH, HW * 2, HH * 2);
  /* üst hazne: yaz */
  const lv = cy - HH * .56, sg = ctx.createLinearGradient(0, lv, 0, cy); sg.addColorStop(0, '#f0c66a'); sg.addColorStop(1, '#b07a2c'); ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(cx - HW, lv); ctx.quadraticCurveTo(cx - 60, lv - 6, cx - 22, lv + 22); ctx.quadraticCurveTo(cx, lv + 54, cx + 22, lv + 22); ctx.quadraticCurveTo(cx + 60, lv - 6, cx + HW, lv); ctx.lineTo(cx + HW, cy); ctx.lineTo(cx - HW, cy); ctx.fill();
  const tp = []; ctx.save(); ctx.translate(cx - 62, lv + 2); ctx.rotate(.16); twigTree(ctx, 0, 0, 24, 541, '#4a3020', 3.5, 4, tp); tp.forEach(([a, b], j) => { ctx.fillStyle = j % 2 ? 'rgba(96,160,74,.95)' : 'rgba(70,130,60,.95)'; ctx.beginPath(); ctx.arc(a, b, 7, 0, TAU); ctx.fill(); }); ctx.restore();
  glow(ctx, cx + 64, lv - 52, 50, '255,246,200', .7); ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.arc(cx + 64, lv - 52, 13, 0, TAU); ctx.fill();
  /* akan kum */
  ctx.fillStyle = '#f2cf7a'; ctx.fillRect(cx - 2, cy - 10, 4, HH * .78);
  pts(st, 'hg', 26, 543, r => [r(), r()]).forEach(([a, b]) => { const yy = cy + ((a * HH * .78 + t * 150) % (HH * .78)); ctx.fillStyle = 'rgba(255,230,150,.9)'; ctx.beginPath(); ctx.arc(cx + (b - .5) * 7, yy, 1.5, 0, TAU); ctx.fill(); });
  /* alt hazne: bâki bahçe */
  const by = cy + HH, mg = ctx.createLinearGradient(0, by - 96, 0, by); mg.addColorStop(0, '#e6b85a'); mg.addColorStop(1, '#9a6a26'); ctx.fillStyle = mg;
  ctx.beginPath(); ctx.moveTo(cx - HW, by); ctx.quadraticCurveTo(cx - 60, by - 30, cx, by - 86); ctx.quadraticCurveTo(cx + 60, by - 30, cx + HW, by); ctx.fill();
  [[-78, 20, 30, 545], [70, 22, 34, 547], [-30, 52, 22, 549], [34, 50, 24, 551]].forEach(([dx, up, len, sd], i) => { const tips = []; twigTree(ctx, cx + dx, by - up, len, sd, '#5a3a22', 3.5, 4, tips); tips.forEach(([a, b], j) => { const k = .75 + .25 * Math.sin(t * 1.2 + j + i); glow(ctx, a, b, 13, '255,180,200', .25 * k); ctx.fillStyle = ['rgba(255,170,190,.95)', 'rgba(255,238,236,.95)', 'rgba(250,200,214,.95)'][j % 3]; ctx.beginPath(); ctx.arc(a, b, 5.5 + (j % 2), 0, TAU); ctx.fill(); }); });
  pts(st, 'hf', 16, 553, r => [r(), r(), r()]).forEach(([a, b, c]) => { const x = cx - HW + 24 + a * (HW * 2 - 48), y = by - 6 - 30 * (1 - Math.abs(a - .5) * 2) * b; ctx.strokeStyle = '#5f9a3a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(t + c * 9) * 1.5, y - 12); ctx.stroke(); ctx.fillStyle = ['#ff8aa6', '#ffe08a', '#ffffff'][c * 3 | 0]; ctx.beginPath(); ctx.arc(x + Math.sin(t + c * 9) * 1.5, y - 13, 3, 0, TAU); ctx.fill(); });
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,246,224,.55)'; ctx.lineWidth = 2.5; shape(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - HW + 20, cy - HH + 26); ctx.quadraticCurveTo(cx - HW + 14, cy - HH * .5, cx - 46, cy - 70); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - HW + 20, cy + HH - 26); ctx.quadraticCurveTo(cx - HW + 14, cy + HH * .5, cx - 46, cy + 70); ctx.stroke();
  [-1, 1].forEach(d => { const y = cy + d * HH, g = ctx.createLinearGradient(0, y - 12, 0, y + 12); g.addColorStop(0, '#d8b46a'); g.addColorStop(1, '#6a4a1e'); ctx.fillStyle = g; rrect(ctx, cx - HW - 26, y - (d < 0 ? 22 : 0), HW * 2 + 52, 22, 6); ctx.fill(); const pg = ctx.createLinearGradient(0, 0, 14, 0); ctx.fillStyle = '#8a6630'; ctx.fillRect(cx + d * (HW + 12) - 5, cy - HH, 10, HH * 2); });
  ctx.fillStyle = 'rgba(255,255,255,.1)'; [-1, 1].forEach(d => ctx.fillRect(cx + d * (HW + 12) - 5, cy - HH, 3, HH * 2));
  ctx.textAlign = 'right'; clbl(ctx, cx - HW - 34, cy - HH * .46, 'fâni gençlik', 'akıp gidiyor', 'right'); clbl(ctx, cx - HW - 34, cy + HH * .62, 'bâki gençlik', 'iffet ve taatle', 'right');
  shade(ctx, w, h, ['l', '10,8,5', .92]); vinyet(ctx, w, h, .4); grain(ctx, w, h, t, .06);
}

/* 12) Gözyaşı: durgun suya düşen damla */
function tearScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#05070f', '#0a1020', '#131c36', '#1c2848']);
  drawStars(ctx, st, w, h, t, 60, .5, 561);
  const wy = h * .76, cx = w * .5, cy = h * .885;
  const wg = ctx.createLinearGradient(0, wy, 0, h); wg.addColorStop(0, '#22305a'); wg.addColorStop(.25, '#141e3c'); wg.addColorStop(1, '#070a16'); ctx.fillStyle = wg; ctx.fillRect(0, wy, w, h - wy);
  glow(ctx, cx, wy, 520, '150,180,255', .2);
  /* ay ışığı yansıması */
  pts(st, 'tr', 46, 563, r => [r(), r(), r()]).forEach(([a, b, c]) => { const y = wy + 8 + b * (h - wy - 12), ww = (10 + a * 60) * (.4 + b), al = (.1 + .16 * (.5 + .5 * Math.sin(t * 1.5 + c * 20))) * (1 - b * .5); ctx.fillStyle = `rgba(200,216,255,${al})`; ctx.fillRect(cx - ww / 2 + (c - .5) * 60 * b, y, ww, 1.6); });
  glow(ctx, w * .5, h * .1, 150, '200,216,255', .16);
  const cyc = 4.2, k = (t % cyc) / cyc;
  if (k < .22) { const q = k / .22, y = h * .56 + q * q * (cy - h * .56); glow(ctx, cx, y, 18, '200,220,255', .7); ctx.fillStyle = '#eaf2ff'; ctx.beginPath(); ctx.moveTo(cx, y - 15); ctx.bezierCurveTo(cx + 9, y - 2, cx + 7, y + 8, cx, y + 8); ctx.bezierCurveTo(cx - 7, y + 8, cx - 9, y - 2, cx, y - 15); ctx.fill(); }
  for (let i = 0; i < 4; i++) { const q = ((t - .22 * cyc - i * .55) % cyc + cyc) % cyc / cyc; if (q > .8) continue; const R = 14 + q * 520, a = (1 - q / .8) * .7; ctx.strokeStyle = `rgba(200,220,255,${a})`; ctx.lineWidth = 2.2 * (1 - q) + .4; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * .17, 0, 0, TAU); ctx.stroke(); }
  mist(ctx, w, h, wy, '150,170,230', .16);
  vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .06);
}

/* 13) Ömür kavsi: zaaf, kuvvet, yine zaaf */
function lifeArcScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#070a1a', '#0e1430', '#1c2244', '#2c2c50']);
  drawStars(ctx, st, w, h, t, 70, .55, 571);
  const gy = h * .915, ax = x => (x - w * .5) / (w * .43), ay = x => gy - 150 * (1 - ax(x) * ax(x));
  glow(ctx, w * .1, gy, 380, '255,150,130', .4); glow(ctx, w * .5, gy - 60, 430, '255,214,130', .36); glow(ctx, w * .9, gy, 380, '130,120,220', .4);
  ctx.setLineDash([3, 9]); ctx.strokeStyle = 'rgba(255,236,190,.5)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = w * .07; x <= w * .93; x += 8) ctx.lineTo(x, ay(x)); ctx.stroke(); ctx.setLineDash([]);
  const u = (t * .045) % 1, sx = w * (.07 + .86 * u), sy = ay(sx), warm = 1 - Math.abs(u - .5) * 2;
  glow(ctx, sx, sy, 90 + warm * 50, '255,226,150', .75); ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(sx, sy, 15 + warm * 6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#05060e'; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 12; x += 12) ctx.lineTo(x, gy + 6 - 10 * Math.sin(x / 210 + 1)); ctx.lineTo(w, h); ctx.fill();
  const yAt = x => gy + 6 - 10 * Math.sin(x / 210 + 1); ctx.strokeStyle = '#05060e'; ctx.fillStyle = '#05060e'; ctx.lineCap = 'round';
  /* emekleyen çocuk */
  let x = w * .23, y = yAt(x); ctx.beginPath(); ctx.ellipse(x, y - 13, 15, 7.5, -.15, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x + 17, y - 22, 7.5, 0, TAU); ctx.fill(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 9, y - 10); ctx.lineTo(x + 13, y); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x - 15, y); ctx.lineTo(x - 22, y - 1); ctx.stroke();
  /* genç */
  x = w * .5; y = yAt(x); ctx.beginPath(); ctx.arc(x + 2, y - 86, 9.5, 0, TAU); ctx.fill(); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x, y - 72); ctx.lineTo(x - 2, y - 40); ctx.stroke(); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 2, y - 40); ctx.lineTo(x - 15, y); ctx.moveTo(x - 2, y - 40); ctx.lineTo(x + 16, y - 2); ctx.moveTo(x, y - 70); ctx.lineTo(x + 17, y - 50); ctx.moveTo(x, y - 70); ctx.lineTo(x - 15, y - 48); ctx.stroke();
  /* ihtiyar */
  x = w * .8; y = yAt(x); ctx.beginPath(); ctx.arc(x + 15, y - 62, 8.5, 0, TAU); ctx.fill(); ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(x + 10, y - 52); ctx.quadraticCurveTo(x - 4, y - 46, x - 4, y - 30); ctx.stroke(); ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(x - 4, y - 30); ctx.lineTo(x - 9, y); ctx.moveTo(x - 4, y - 30); ctx.lineTo(x + 5, y); ctx.moveTo(x + 8, y - 48); ctx.lineTo(x + 26, y - 34); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 26, y - 36); ctx.lineTo(x + 30, y + 1); ctx.stroke();
  ctx.font = "italic 600 17px 'KursuSerif', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,236,200,.85)'; [['zaaf', .23], ['kuvvet', .5], ['zaaf ve ihtiyarlık', .8]].forEach(([s, q]) => ctx.fillText(s, w * q, h * .972));
  vinyet(ctx, w, h, .45); grain(ctx, w, h, t, .06);
}

/* 14) Sönmeye yüz tutmuş mumlar: emelin oyaladığı ömür */
function candlesScene(ctx, w, h, t, st) {
  rad(ctx, w, h, ['#2a160c', '#140a08', '#050303'], .5, 1, .8);
  const ty = h * .93; const tg = ctx.createLinearGradient(0, ty, 0, h); tg.addColorStop(0, '#3a2414'); tg.addColorStop(1, '#0c0705'); ctx.fillStyle = tg; ctx.fillRect(0, ty, w, h - ty);
  ctx.fillStyle = 'rgba(255,214,150,.18)'; ctx.fillRect(0, ty, w, 2);
  pts(st, 'cnf', 60, 581, r => [r(), r(), r()]).forEach(([a, b, c]) => { ctx.fillStyle = ['#e2504a', '#f2c84a', '#4aa8e2', '#6ac25a', '#e88ad0'][c * 5 | 0]; ctx.globalAlpha = .55; ctx.fillRect(a * w, ty + 4 + b * (h - ty - 8), 6, 3); }); ctx.globalAlpha = 1;
  const N = 11; for (let i = 0; i < N; i++) { const u = i / (N - 1), x = w * (.07 + .86 * u), ht = 118 * Math.pow(1 - u, 1.25) + 9, cw = 15, lit = u < .68, yb = ty + 2, yt = yb - ht;
    const cg = ctx.createLinearGradient(x - cw, 0, x + cw, 0); cg.addColorStop(0, '#b8a888'); cg.addColorStop(.45, '#f4ead0'); cg.addColorStop(1, '#8a7a5c'); ctx.fillStyle = cg; rrect(ctx, x - cw, yt, cw * 2, ht, 4); ctx.fill();
    ctx.fillStyle = '#f4ead0'; ctx.beginPath(); ctx.ellipse(x - cw + 3, yt + 10 + (i * 7 % 18), 4, 9, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, yb, cw + 9, 4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, yt); ctx.lineTo(x + 1, yt - 8); ctx.stroke();
    if (lit) { const f = 1 + .14 * Math.sin(t * 9 + i * 2.1) + .08 * Math.sin(t * 17 + i), sz = (1 - u * .5); glow(ctx, x, yt - 20, 120 * sz, '255,180,80', .34); glow(ctx, x, yt - 16, 26 * sz, '255,236,170', .9); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.moveTo(x, yt - 8 - 30 * f * sz); ctx.quadraticCurveTo(x + 9 * sz, yt - 12, x, yt - 6); ctx.quadraticCurveTo(x - 9 * sz, yt - 12, x, yt - 8 - 30 * f * sz); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(255,120,60,.8)'; ctx.beginPath(); ctx.arc(x + 1, yt - 8, 1.6, 0, TAU); ctx.fill(); for (let q = 0; q < 16; q++) { const a = ((t * .35 + q / 16 + i * .13) % 1), yy = yt - 10 - a * 110, xx = x + Math.sin(a * 7 + i + t * .5) * (5 + a * 16); glow(ctx, xx, yy, 9 + a * 16, '200,200,210', .1 * (1 - a)); } } }
  vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .07);
}

/* 15) Dar geçit ve geniş ova: maîşeten danken / hayâten tayyibeten */
function canyonScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#06070f', '#0c1020', '#161a30', '#242844']);
  drawStars(ctx, st, w * .5, h, t, 40, .5, 591);
  const hy = h * .8, mx = w * .5;
  /* sağ: geniş ova */
  ctx.save(); ctx.beginPath(); ctx.rect(mx, 0, w - mx, h); ctx.clip();
  glow(ctx, w * .8, hy, 520, '255,214,130', .6); glow(ctx, w * .8, hy - 6, 90, '255,250,220', .95); ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.arc(w * .8, hy - 4, 26, Math.PI, 0); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const a = Math.PI + (i + .5) / 9 * Math.PI + Math.sin(t * .2) * .02, g = ctx.createLinearGradient(w * .8, hy, w * .8 + Math.cos(a) * 420, hy + Math.sin(a) * 420); g.addColorStop(0, 'rgba(255,226,150,.16)'); g.addColorStop(1, 'rgba(255,226,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(w * .8, hy); ctx.lineTo(w * .8 + Math.cos(a - .05) * 440, hy + Math.sin(a - .05) * 440); ctx.lineTo(w * .8 + Math.cos(a + .05) * 440, hy + Math.sin(a + .05) * 440); ctx.fill(); } ctx.restore();
  hills(ctx, w, h, hy + 8, 9, 170, 2.2, '#5a7a3c'); hills(ctx, w, h, hy + 34, 10, 120, 4.1, '#3f6230');
  ctx.strokeStyle = 'rgba(190,226,255,.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w * .8, hy + 12); ctx.bezierCurveTo(w * .74, hy + 40, w * .88, hy + 70, w * .76, h); ctx.stroke();
  pts(st, 'cyt', 9, 593, r => [.56 + r() * .42, r(), 12 + r() * 12]).forEach(([a, b, s]) => { const x = w * a, y = hy + 24 + b * 60; ctx.fillStyle = '#2c4a24'; ctx.fillRect(x - 1.5, y - s * .6, 3, s * .8); ctx.fillStyle = b > .5 ? '#6a9a44' : '#4f8234'; ctx.beginPath(); ctx.arc(x, y - s, s * .7, 0, TAU); ctx.fill(); });
  birds(ctx, st, w, h * 1.6, t, 4, 595, 'rgba(30,30,40,.7)', .9);
  ctx.restore();
  /* sol: dar geçit */
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, mx, h); ctx.clip();
  const gx = w * .25; glow(ctx, gx, hy + 30, 150, '140,150,200', .22);
  const wall = (d, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(gx + d * 16, h); ctx.lineTo(gx + d * 13, hy + 60); ctx.lineTo(gx + d * 24, hy + 10); ctx.lineTo(gx + d * 18, hy - 50); ctx.lineTo(gx + d * 40, hy - 96); ctx.lineTo(gx + d * 90, hy - 126); ctx.lineTo(gx + d * 170, hy - 110); ctx.lineTo(gx + d * 260, hy - 136); ctx.lineTo(gx + d * 420, hy - 118); ctx.lineTo(gx + d * 420, h); ctx.fill(); };
  wall(-1, '#0b0c14'); wall(1, '#10111c');
  ctx.strokeStyle = 'rgba(160,170,220,.22)'; ctx.lineWidth = 1.5; [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(gx + d * 13, hy + 60); ctx.lineTo(gx + d * 24, hy + 10); ctx.lineTo(gx + d * 18, hy - 50); ctx.lineTo(gx + d * 40, hy - 96); ctx.stroke(); });
  ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(gx, h * .955 - 22, 4.5, 0, TAU); ctx.fill(); ctx.fillRect(gx - 3.5, h * .955 - 17, 7, 17);
  ctx.restore();
  const fg = ctx.createLinearGradient(mx - 80, 0, mx + 80, 0); fg.addColorStop(0, 'rgba(12,13,22,1)'); fg.addColorStop(1, 'rgba(12,13,22,0)'); ctx.fillStyle = fg; ctx.fillRect(mx - 80, hy - 140, 160, h);
  ctx.textAlign = 'center'; ctx.font = "italic 600 17px 'KursuSerif', Georgia, serif"; ctx.fillStyle = 'rgba(190,196,230,.9)'; ctx.fillText('dar bir geçim', w * .25, h * .972); ctx.fillStyle = 'rgba(40,40,20,.95)'; ctx.fillText('hoş bir hayat', w * .8, h * .972);
  vinyet(ctx, w, h, .4); grain(ctx, w, h, t, .06);
}

/* 16) Medine: Kubbe-i Hadrâ */
function ravzaScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#04060e', '#081022', '#0e1c38', '#1a3050']);
  drawStars(ctx, st, w, h, t, 110, .62, 601);
  const by = h * .955, cx = w * .5;
  glow(ctx, cx, by - 70, 520, '120,220,170', .26); glow(ctx, cx, by - 90, 190, '255,236,180', .32);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(0, by - 120, 0, h * .3); lg.addColorStop(0, 'rgba(190,255,220,.2)'); lg.addColorStop(1, 'rgba(190,255,220,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx - 34, by - 120); ctx.lineTo(cx + 34, by - 120); ctx.lineTo(cx + 110, h * .3); ctx.lineTo(cx - 110, h * .3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(cx, by); ctx.scale(1.08, 1.08); ctx.translate(-cx, -by);
  /* uzak siluet */
  ctx.fillStyle = '#0a1426'; pts(st, 'rv', 16, 603, r => [r(), 16 + r() * 34, 40 + r() * 70]).forEach(([a, bh, bw]) => { ctx.fillRect(a * w, by - bh - 14, bw, bh + 20); });
  /* revaklar */
  const wg = ctx.createLinearGradient(0, by - 60, 0, by); wg.addColorStop(0, '#c9b48a'); wg.addColorStop(1, '#6a5a40'); ctx.fillStyle = wg; ctx.fillRect(cx - 330, by - 54, 660, 60);
  for (let i = 0; i < 15; i++) { const x = cx - 308 + i * 44; ctx.fillStyle = '#1a140c'; ctx.beginPath(); ctx.moveTo(x - 13, by + 6); ctx.lineTo(x - 13, by - 26); ctx.arc(x, by - 26, 13, Math.PI, 0); ctx.lineTo(x + 13, by + 6); ctx.fill(); glow(ctx, x, by - 14, 20, '255,214,130', .5); }
  ctx.fillStyle = '#8a7a5a'; ctx.fillRect(cx - 336, by - 60, 672, 7);
  /* minareler */
  const minaret = (x, mh) => { const g = ctx.createLinearGradient(x - 9, 0, x + 9, 0); g.addColorStop(0, '#efe4c8'); g.addColorStop(1, '#9a8a68'); ctx.fillStyle = g; ctx.fillRect(x - 8, by - mh, 16, mh - 54); ctx.fillRect(x - 6, by - mh - 34, 12, 36); [[.62, 14], [.86, 12]].forEach(([q, r]) => { ctx.fillRect(x - r, by - mh * q - 4, r * 2, 7); glow(ctx, x, by - mh * q, 26, '255,226,150', .6); }); ctx.beginPath(); ctx.moveTo(x - 7, by - mh - 34); ctx.lineTo(x, by - mh - 64); ctx.lineTo(x + 7, by - mh - 34); ctx.fill(); ctx.fillStyle = '#e8c878'; ctx.fillRect(x - 1, by - mh - 76, 2, 14); };
  minaret(cx - 150, 112); minaret(cx + 236, 98); minaret(cx - 290, 90);
  /* yeşil kubbe */
  const dR = 58, dy = by - 60; ctx.fillStyle = '#b8a67e'; ctx.fillRect(cx - dR - 8, dy - 24, dR * 2 + 16, 26);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = '#2a2014'; ctx.fillRect(cx - dR + 6 + i * 16.5, dy - 19, 7, 14); }
  const dg = ctx.createRadialGradient(cx - 20, dy - 60, 6, cx, dy - 30, dR * 1.2); dg.addColorStop(0, '#8fe0a8'); dg.addColorStop(.5, '#3f9a62'); dg.addColorStop(1, '#1c5a38'); ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(cx - dR, dy - 24); ctx.bezierCurveTo(cx - dR, dy - 80, cx - 26, dy - 104, cx, dy - 112); ctx.bezierCurveTo(cx + 26, dy - 104, cx + dR, dy - 80, cx + dR, dy - 24); ctx.fill();
  ctx.fillStyle = '#e8c878'; ctx.fillRect(cx - 1.5, dy - 134, 3, 24); ctx.beginPath(); ctx.arc(cx, dy - 136, 6, .5, Math.PI * 1.7); ctx.lineWidth = 2.4; ctx.strokeStyle = '#e8c878'; ctx.stroke(); glow(ctx, cx, dy - 136, 30, '255,226,150', .6 + .2 * Math.sin(t * 1.3));
  ctx.restore();
  ctx.fillStyle = '#04060c'; ctx.fillRect(0, by + 4, w, h);
  falling(ctx, st, w, h, t, { key: 'rvd', n: 30, kind: 'dot', colors: ['#d8ffe6'], speed: 9, up: true, size: 1.4, sway: 20, alpha: .6, fade: true, area: [.3, .7] });
  vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .06);
}

/* 17) Zindan penceresi: on bir yıldız, güneş ve ay */
function yusufScene(ctx, w, h, t, st) {
  if (!st.wall) { const c = document.createElement('canvas'); c.width = 1280; c.height = 720; const g = c.getContext('2d'), r = srng(611); g.fillStyle = '#100d0c'; g.fillRect(0, 0, 1280, 720); for (let y = 0, row = 0; y < 720; y += 64, row++) for (let x = -(row % 2) * 80; x < 1280; x += 160) { const v = r(); g.fillStyle = `rgba(200,210,255,${.01 + v * .035})`; g.fillRect(x + 2, y + 2, 156, 60); } st.wall = c; }
  ctx.drawImage(st.wall, 0, 0, w, h);
  const wx = w * .835, top = h * .1, ww = 240, R = ww / 2, bot = h * .53, c0 = top + (bot - top) * .6;
  glow(ctx, wx, h * .3, 440, '150,170,255', .2);
  const arch = pad => { ctx.beginPath(); ctx.moveTo(wx - R - pad, bot + pad * .4); ctx.lineTo(wx - R - pad, top + R); ctx.arc(wx, top + R, R + pad, Math.PI, 0); ctx.lineTo(wx + R + pad, bot + pad * .4); ctx.closePath(); };
  const eg = ctx.createLinearGradient(wx - R - 44, 0, wx + R + 44, 0); eg.addColorStop(0, '#34302e'); eg.addColorStop(1, '#141210'); ctx.fillStyle = eg; arch(44); ctx.fill();
  ctx.save(); arch(0); ctx.clip(); const sg = ctx.createLinearGradient(0, top, 0, bot); sg.addColorStop(0, '#0a1238'); sg.addColorStop(1, '#2a3a7a'); ctx.fillStyle = sg; ctx.fillRect(wx - R, top, ww, bot - top);
  const sx = wx - 40, sy = c0 - 58; glow(ctx, sx, sy, 60, '255,214,120', .8); ctx.fillStyle = '#ffe2a0'; ctx.beginPath(); ctx.arc(sx, sy, 17, 0, TAU); ctx.fill();
  const mx = wx + 44, my = c0 - 30; glow(ctx, mx, my, 44, '230,236,255', .6); ctx.fillStyle = '#f2f4ff'; ctx.beginPath(); ctx.arc(mx, my, 14, 0, TAU); ctx.fill(); ctx.fillStyle = '#16245a'; ctx.beginPath(); ctx.arc(mx + 6, my - 4, 12, 0, TAU); ctx.fill();
  for (let i = 0; i < 11; i++) { const a = Math.PI * (1.08 + .84 * i / 10), rr = R * .8 + (i % 2) * 9, x = wx + Math.cos(a) * rr * .98, y = c0 + Math.sin(a) * rr * 1.3 + 50, k = .65 + .35 * Math.sin(t * 2 + i * 1.7); glow(ctx, x, y, 12, '255,246,214', .7 * k); ctx.fillStyle = '#fff6d6'; ctx.beginPath(); for (let q = 0; q < 8; q++) { const an = q / 8 * TAU - Math.PI / 2, r2 = q % 2 ? 2 : 5.5; ctx.lineTo(x + Math.cos(an) * r2, y + Math.sin(an) * r2); } ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = '#080706'; for (let i = 1; i < 4; i++) ctx.fillRect(wx - R + ww * i / 4 - 5, top, 10, bot - top); ctx.fillRect(wx - R, bot - 70, ww, 9);
  ctx.fillStyle = '#4a4440'; ctx.fillRect(wx - R - 56, bot + 16, ww + 112, 14);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const dx = -.5, dy = .86, L = 470; for (let i = 0; i < 4; i++) { const g0 = wx - R + ww * i / 4 + 6, g1 = g0 + ww / 4 - 12, a = .1 + .02 * Math.sin(t * .7 + i), lg = ctx.createLinearGradient(wx, top + R, wx + dx * L, bot + dy * L); lg.addColorStop(0, `rgba(190,205,255,${a})`); lg.addColorStop(1, 'rgba(190,205,255,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(g0, top + 30); ctx.lineTo(g1, top + 30); ctx.lineTo(g1 + dx * L, bot + dy * L); ctx.lineTo(g0 + dx * L, bot + dy * L - 40); ctx.fill(); } ctx.restore();
  const fy = h * .9, fg = ctx.createLinearGradient(0, fy, 0, h); fg.addColorStop(0, '#191614'); fg.addColorStop(1, '#060504'); ctx.fillStyle = fg; ctx.fillRect(0, fy, w, h - fy);
  const px = w * .7; ctx.save(); ctx.translate(px, fy + 30); ctx.scale(1, .28); glow(ctx, 0, 0, 170, '200,214,255', .5); ctx.restore();
  /* ışıkta büyüyen fidan */
  const s = .9 + .1 * Math.sin(t * .6); ctx.strokeStyle = '#4e8a34'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, fy + 30); ctx.quadraticCurveTo(px + 5, fy - 10, px + Math.sin(t * .8) * 2, fy - 44 * s); ctx.stroke();
  [[-1, 8], [1, -8], [-1, -26], [1, -40]].forEach(([d, o], i) => { ctx.fillStyle = i % 2 ? '#7fc050' : '#5fa03c'; ctx.beginPath(); ctx.ellipse(px + d * 13 + Math.sin(t * .8 + i) * 1.5, fy + o * s, 14, 6, d * -.5, 0, TAU); ctx.fill(); });
  glow(ctx, px, fy - 20, 80, '190,255,170', .16);
  falling(ctx, st, w, h, t, { key: 'yd', n: 36, kind: 'dot', colors: ['#d6e0ff'], speed: 6, up: true, size: 1.3, sway: 20, alpha: .5, fade: true, area: [.5, 1] });
  shade(ctx, w, h, ['l', '8,7,8', .9]); vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .06);
}
Object.assign(SCENES, {
  kumbahce: { name: 'Kum saati ve bahçe', fam: 'zaman', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['gençlik', 'ömür', 'bâki'], aff: { alinti: 1 }, draw: hourGardenScene },
  gozyasi: { name: 'Gözyaşı', fam: 'su', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['ağlamak', 'şefkat', 'gözyaşı'], aff: { ayet: 1 }, draw: tearScene },
  omurkavsi: { name: 'Ömür kavsi', fam: 'zaman', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['ömür', 'zaaf', 'kuvvet', 'ihtiyarlık'], aff: { ayet: 1 }, draw: lifeArcScene },
  mumlar: { name: 'Sönen mumlar', fam: 'isik', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['emel', 'eğlence', 'ömür'], aff: { ayet: 1 }, draw: candlesScene },
  darvegenis: { name: 'Dar geçit, geniş ova', fam: 'iki', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['dar geçim', 'hoş hayat'], aff: { ayet: 1 }, draw: canyonScene },
  ravza: { name: 'Medine', fam: 'mekan', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['medine', 'ittiba', 'sünnet'], aff: { ayet: 1 }, draw: ravzaScene },
  yusufzindan: { name: 'Zindan penceresi', fam: 'pencere', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['yusuf', 'zindan', 'medrese-i yusufiye'], aff: { ayet: 1 }, draw: yusufScene }
});
/* ===== Birinci Söz (Bismillah): sinematik sahneler ===== */
/* --- yardımcılar --- */
function bsFontReady(st, spec, redo) {
  if (!document.fonts || document.fonts.check(spec)) return true;
  if (!st._fw) { st._fw = 1; document.fonts.load(spec).then(() => { try { redo(); } catch (e) { } }); }
  return false;
}
function bsDune(ctx, w, h, y0, amp, seed, c0, c1, hl, f) {
  const r = srng(seed), ph = r() * 10, f1 = (f || 1) * (.0035 + r() * .002), f2 = (f || 1) * (.009 + r() * .004);
  const Y = x => y0 + Math.sin(x * f1 + ph) * amp + Math.sin(x * f2 + ph * 2.1) * amp * .32;
  ctx.beginPath(); ctx.moveTo(-10, h + 10); for (let x = -10; x <= w + 10; x += 8) ctx.lineTo(x, Y(x)); ctx.lineTo(w + 10, h + 10); ctx.closePath();
  const g = ctx.createLinearGradient(0, y0 - amp, 0, h); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fill();
  if (hl) { ctx.strokeStyle = hl; ctx.lineWidth = 1.6; ctx.beginPath(); for (let x = -10; x <= w + 10; x += 8) { const y = Y(x); x > -10 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  return Y;
}
/* cüppeli yolcu silueti; y = ayak tabanı, s = ölçek (1 => ~100px) */
function bsRobed(ctx, x, y, s, col, o) {
  o = o || {}; const sw = o.sway || 0, bow = o.bow || 0, step = o.step || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale((o.dir || 1) * s, s); ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-3 - bow * 4, -80 + bow * 8);
  ctx.quadraticCurveTo(-14 - bow * 6, -66 + bow * 6, -14 - sw, -36);
  ctx.quadraticCurveTo(-16 - sw * 1.5, -14, -20 - sw * 2.2, 0);
  ctx.lineTo(-2 + step * 3, 0); ctx.lineTo(1 + step * 3, -6); ctx.lineTo(4 - step * 3, 0);
  ctx.lineTo(15 - sw * .6, 0);
  ctx.quadraticCurveTo(12, -30, 9 + bow * 4, -58 + bow * 4);
  ctx.quadraticCurveTo(7 + bow * 6, -74 + bow * 8, 3 + bow * 6, -80 + bow * 8);
  ctx.closePath(); ctx.fill();
  const hx = 1 + bow * 10, hy = -88 + bow * 12;
  ctx.beginPath(); ctx.arc(hx, hy, 7.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - 6, hy - 5); ctx.quadraticCurveTo(hx - 13, hy + 4, hx - 12 - sw * 1.4, hy + 22); ctx.lineTo(hx - 3, hy + 9); ctx.closePath(); ctx.fill();
  if (o.staff) {
    ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(15 + bow * 4, -70 + bow * 6); ctx.lineTo(21, 0); ctx.stroke();
    ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(6 + bow * 5, -60 + bow * 5); ctx.lineTo(16 + bow * 4, -58 + bow * 6); ctx.stroke();
    if (o.pennant) { const fl = Math.sin(o.t * 4) * 3; ctx.fillStyle = o.pennant; ctx.beginPath(); ctx.moveTo(15, -70); ctx.quadraticCurveTo(25, -72 + fl, 34, -66 + fl); ctx.quadraticCurveTo(25, -64 - fl * .5, 16, -60); ctx.closePath(); ctx.fill(); }
  }
  if (o.box) { ctx.fillStyle = o.box; ctx.fillRect(8, -66, 22, 16); }
  ctx.restore();
}
function bsCamel(ctx, x, y, s, col, t, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale((dir || 1) * s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  const k = Math.sin(t * 3) * 4;
  ctx.lineWidth = 4.5; [[-22, k], [-14, -k], [12, -k], [20, k]].forEach(([lx, d]) => { ctx.beginPath(); ctx.moveTo(lx, -38); ctx.lineTo(lx + d * .5, -18); ctx.lineTo(lx + d, 0); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(-30, -40); ctx.quadraticCurveTo(-26, -64, -10, -66); ctx.quadraticCurveTo(-2, -82, 8, -64); ctx.quadraticCurveTo(22, -58, 26, -46);
  ctx.quadraticCurveTo(34, -62, 38, -78); ctx.quadraticCurveTo(42, -88, 52, -86); ctx.lineTo(54, -80); ctx.lineTo(44, -76); ctx.quadraticCurveTo(40, -56, 30, -38); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -44); ctx.quadraticCurveTo(-38, -36, -36, -26); ctx.stroke();
  ctx.restore();
}
function bsTent(ctx, x, y, s, col, lit, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit) glow(ctx, 0, -14, 70, '255,190,110', .55 + .08 * Math.sin(t * 5));
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-62, 0); ctx.lineTo(-54, -30); ctx.quadraticCurveTo(-30, -44, -10, -40); ctx.lineTo(0, -52); ctx.lineTo(10, -40); ctx.quadraticCurveTo(32, -46, 54, -30); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill();
  if (lit) { const g = ctx.createLinearGradient(0, -32, 0, 0); g.addColorStop(0, 'rgba(255,214,140,.95)'); g.addColorStop(1, 'rgba(255,150,70,.9)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-6, -30); ctx.lineTo(6, -30); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-62, 0); ctx.lineTo(-74, 4); ctx.moveTo(62, 0); ctx.lineTo(74, 4); ctx.stroke();
  ctx.restore();
}
function bsFlag(ctx, x, y, hgt, col, t, pole) {
  ctx.strokeStyle = pole || '#1a0f0a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - hgt); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - hgt);
  for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(x + u * 34, y - hgt + Math.sin(t * 4 - u * 4) * 3 * u); }
  for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(x + u * 34, y - hgt + 18 + Math.sin(t * 4 - u * 4) * 3 * u); }
  ctx.closePath(); ctx.fill();
}
/* mühür: devlet / padişah nişanı */
function bsSeal(ctx, x, y, R, t, rgb, a) {
  rgb = rgb || '232,200,120'; a = a ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
  glow(ctx, 0, 0, R * 2.6, rgb, .28);
  ctx.save(); ctx.rotate(t * .05); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); const g = ctx.createLinearGradient(0, 0, R * 3.2, 0); g.addColorStop(0, `rgba(${rgb},.16)`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(R * .9, -2); ctx.lineTo(R * 3.2, -R * .16); ctx.lineTo(R * 3.2, R * .16); ctx.lineTo(R * .9, 2); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = `rgba(${rgb},.95)`; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, R * .86, 0, TAU); ctx.stroke();
  for (let i = 0; i < 32; i++) { const a2 = i / 32 * TAU + t * .03; ctx.fillStyle = `rgba(${rgb},.9)`; ctx.beginPath(); ctx.arc(Math.cos(a2) * R * .93, Math.sin(a2) * R * .93, 1.6, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.rotate(-t * .04); star8p(ctx, 0, 0, R * .66, .62); ctx.lineWidth = 1.6; ctx.stroke(); ctx.rotate(Math.PI / 8); star8p(ctx, 0, 0, R * .5, .62); ctx.fillStyle = `rgba(${rgb},.18)`; ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.fillStyle = `rgba(${rgb},1)`; ctx.beginPath(); ctx.arc(0, 0, R * .12, 0, TAU); ctx.fill();
  ctx.restore();
}
function bsSoldier(ctx, x, y, s, col, t, o) {
  o = o || {}; ctx.save(); ctx.translate(x, y); ctx.scale((o.dir || 1) * s, s); ctx.fillStyle = col; ctx.strokeStyle = col;
  const wv = Math.sin(t * 2.2) * 5;
  ctx.beginPath(); ctx.moveTo(-6, -84); ctx.quadraticCurveTo(-26 - wv, -60, -34 - wv * 1.8, -14); ctx.lineTo(-10, -10); ctx.lineTo(-6, -40); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-9, -86); ctx.lineTo(9, -86); ctx.lineTo(11, -46); ctx.lineTo(7, -44); ctx.lineTo(8, 0); ctx.lineTo(2, 0); ctx.lineTo(0, -38); ctx.lineTo(-2, 0); ctx.lineTo(-8, 0); ctx.lineTo(-7, -44); ctx.lineTo(-11, -46); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -94, 7.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-9, -96); ctx.quadraticCurveTo(0, -112, 9, -96); ctx.closePath(); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(15, 2); ctx.lineTo(15, -150); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15, -164); ctx.lineTo(19, -150); ctx.lineTo(11, -150); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(8, -80); ctx.lineTo(15, -62); ctx.stroke();
  ctx.restore();
}
function bsSparks(ctx, st, key, x, y, w0, h0, t, n, rgb, up) {
  pts(st, key, n, hashStr(key) % 997 + 3, r => [r(), r(), r(), r()]).forEach(([a, b, c, d]) => {
    const life = (t * (.15 + c * .25) + d) % 1, px = x + (a - .5) * w0 + Math.sin(t * 1.3 + d * 9) * 8, py = y - (up === false ? -1 : 1) * life * h0;
    ctx.fillStyle = `rgba(${rgb},${(1 - life) * .8})`; ctx.beginPath(); ctx.arc(px, py, .8 + b * 1.6, 0, TAU); ctx.fill();
  });
}

/* 1) Kapak: Besmele şemsesi, çöl gecesi, uzakta kervan (p.dawn: şafak) */
function besmeleScene(ctx, w, h, t, st, p) {
  p = p || {}; const dawn = !!p.dawn;
  lin(ctx, w, h, dawn ? ['#0c1430', '#2b2b52', '#7a4a5e', '#d9845a', '#f4c07a'] : ['#03050d', '#0a1026', '#171a3a', '#2a2140']);
  if (dawn) glow(ctx, w * .78, h * .8, 520, '255,200,140', .55); else glow(ctx, w * .74, h * .42, 520, '120,110,190', .18);
  drawStars(ctx, st, w, h, t, dawn ? 90 : 260, dawn ? .45 : .85, 31);
  const cx = w * .735, cy = h * .4, R = 205;
  /* ışık huzmeleri */
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, cy); ctx.rotate(t * .02);
  for (let i = 0; i < 18; i++) { ctx.rotate(TAU / 18); const a = .07 + .03 * Math.sin(t * .7 + i * 1.7); const g = ctx.createLinearGradient(0, 0, 640, 0); g.addColorStop(0, `rgba(255,214,140,${a})`); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(R * .8, -6); ctx.lineTo(640, -46); ctx.lineTo(640, 46); ctx.lineTo(R * .8, 6); ctx.fill(); }
  ctx.restore();
  glow(ctx, cx, cy, R * 1.9, '255,206,130', dawn ? .3 : .38);
  /* şemse */
  ctx.save(); ctx.translate(cx, cy);
  const disk = ctx.createRadialGradient(0, -R * .3, R * .1, 0, 0, R); disk.addColorStop(0, '#1d1a2e'); disk.addColorStop(1, '#0b0a14'); ctx.fillStyle = disk; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(232,196,120,.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.2; [R * .955, R * .78, R * .74].forEach(rr => { ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke(); });
  ctx.save(); ctx.rotate(t * .03);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.save(); ctx.rotate(a); ctx.translate(R * .865, 0); ctx.rotate(Math.PI / 4); ctx.fillStyle = 'rgba(232,196,120,.85)'; ctx.fillRect(-5, -5, 10, 10); ctx.restore(); }
  for (let i = 0; i < 64; i++) { const a = i / 64 * TAU; ctx.fillStyle = 'rgba(232,196,120,.6)'; ctx.beginPath(); ctx.arc(Math.cos(a) * R * .92, Math.sin(a) * R * .92, 1.4, 0, TAU); ctx.fill(); }
  ctx.restore();
  for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i / 12 * TAU - t * .015); ctx.beginPath(); ctx.ellipse(0, -R * 1.07, 9, 22, 0, 0, TAU); ctx.fillStyle = 'rgba(232,196,120,.7)'; ctx.fill(); ctx.restore(); }
  ctx.restore();
  /* hat */
  const draw = () => {
    ctx.save(); ctx.translate(cx, cy); ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,200,120,.75)'; ctx.shadowBlur = 24;
    const gg = ctx.createLinearGradient(-R, -R, R, R); gg.addColorStop(0, '#f7dc9a'); gg.addColorStop(.5, '#e2b45e'); gg.addColorStop(1, '#f9e3a8'); ctx.fillStyle = gg;
    ctx.font = "84px 'KursuArabi', serif"; ctx.fillText('بِسْمِ اللّٰهِ', 0, -40);
    ctx.font = "50px 'KursuArabi', serif"; ctx.fillText('الرَّحْمٰنِ الرَّحِيمِ', 0, 62);
    ctx.restore();
    /* parıltı süpürmesi */
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R * .73, 0, TAU); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const sx = cx - R * 1.6 + ((t * 70) % (R * 4.5)); const sg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0); sg.addColorStop(0, 'rgba(255,240,200,0)'); sg.addColorStop(.5, 'rgba(255,240,200,.14)'); sg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = sg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
  };
  bsFontReady(st, "50px 'KursuArabi'", () => besmeleScene(ctx, w, h, t, st, p)); draw();
  /* kumullar ve kervan */
  bsDune(ctx, w, h, h * .8, 18, 11, dawn ? '#5b3a48' : '#231d38', dawn ? '#2a1a26' : '#120f20', dawn ? 'rgba(255,200,150,.35)' : 'rgba(170,160,230,.25)');
  const Y = bsDune(ctx, w, h, h * .9, 14, 23, dawn ? '#3a2430' : '#16122a', dawn ? '#1a1018' : '#0a0814', dawn ? 'rgba(255,190,140,.3)' : 'rgba(150,140,210,.2)');
  const cxv = w * .6 + ((t * 6) % 260), sil = dawn ? '#140b10' : '#07060e';
  bsCamel(ctx, cxv, Y(cxv) + 2, .42, sil, t);
  bsRobed(ctx, cxv + 34, Y(cxv + 34) + 2, .36, sil, { staff: 1, step: Math.sin(t * 3) });
  bsRobed(ctx, cxv - 30, Y(cxv - 30) + 2, .34, sil, { staff: 1, step: Math.sin(t * 3 + 1) });
  falling(ctx, st, w, h, t, { key: 'bsd', n: 44, kind: 'dot', colors: ['#ffe2a8'], speed: 9, up: true, size: 1.3, sway: 22, alpha: .55, fade: true, area: [.45, 1] });
  shade(ctx, w, h, ['l', dawn ? '14,10,22' : '4,4,12', .9]); vinyet(ctx, w, h, .55); grain(ctx, w, h, t, .05);
}

/* 2) Hira: ilk vahiy gecesi (ayet) */
function hiraScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#02040b', '#070d22', '#111a38', '#1c2244']);
  drawStars(ctx, st, w, h, t, 300, 1, 41);
  const px = w * .74, py = h * .63;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const bg = ctx.createLinearGradient(0, 0, 0, py); bg.addColorStop(0, 'rgba(255,226,160,0)'); bg.addColorStop(1, `rgba(255,226,160,${.16 + .04 * Math.sin(t * .8)})`);
  for (let i = 0; i < 6; i++) { const k = 1 - i / 6; ctx.globalAlpha = .28; ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(px - 8 - 18 * k, 0); ctx.lineTo(px + 8 + 18 * k, 0); ctx.lineTo(px + 14 + 60 * k, py); ctx.lineTo(px - 14 - 60 * k, py); ctx.closePath(); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.restore();
  bsSparks(ctx, st, 'hv', px, py, 90, py, t, 40, '255,230,170', false);
  hills(ctx, w, h, h * .9, 24, 160, 3, '#0b0f20');
  ctx.fillStyle = '#05070f'; ctx.beginPath(); ctx.moveTo(px - 360, h); ctx.lineTo(px - 210, h * .82); ctx.lineTo(px - 120, h * .74); ctx.lineTo(px - 40, h * .66); ctx.lineTo(px - 6, py - 4); ctx.lineTo(px + 26, h * .66); ctx.lineTo(px + 110, h * .76); ctx.lineTo(px + 230, h * .84); ctx.lineTo(px + 400, h); ctx.closePath(); ctx.fill();
  glow(ctx, px + 14, py + 26, 34, '255,206,140', .55 + .1 * Math.sin(t * 2));
  ctx.fillStyle = 'rgba(255,214,150,.9)'; ctx.beginPath(); ctx.ellipse(px + 14, py + 28, 5, 7, 0, 0, TAU); ctx.fill();
  vinyet(ctx, w, h, .6); grain(ctx, w, h, t, .05);
}

/* 3) Çölde iki yolcu ve kabile obası */
function colyolcuScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#180f28', '#4a2440', '#a4483c', '#e88a4c', '#f6c27a']);
  const sx = w * .84, sy = h * .62;
  glow(ctx, sx, sy, 420, '255,190,120', .55); glow(ctx, sx, sy, 90, '255,236,190', .9);
  ctx.fillStyle = '#ffe2b0'; ctx.beginPath(); ctx.arc(sx, sy, 46, 0, TAU); ctx.fill();
  birds(ctx, st, w, h, t, 5, 7, 'rgba(40,16,24,.6)', .8);
  bsDune(ctx, w, h, h * .66, 16, 5, '#7a3a44', '#4a2230', 'rgba(255,190,140,.45)');
  /* oba */
  const oy = h * .695;
  bsTent(ctx, w * .73, oy, .8, '#26121a', 0, t); bsTent(ctx, w * .97, oy + 4, .75, '#26121a', 1, t + 2);
  bsTent(ctx, w * .855, oy + 2, 1.25, '#1c0c14', 1, t); bsFlag(ctx, w * .855, oy - 64, 46, '#e8c878', t, '#1c0c14');
  glow(ctx, w * .79, oy + 4, 40, '255,170,80', .5 + .15 * Math.sin(t * 7)); bsSparks(ctx, st, 'fire', w * .79, oy, 14, 70, t, 18, '255,190,110');
  bsCamel(ctx, w * .64, oy + 6, .5, '#2a141c', 0);
  /* uzak sırtta şakiler */
  ctx.fillStyle = 'rgba(30,12,22,.85)'; [[.6, 0], [.615, 1]].forEach(([u, k]) => { const x = w * u, y = h * .655; ctx.fillRect(x - 2, y - 26, 4, 26); ctx.beginPath(); ctx.arc(x, y - 30, 4, 0, TAU); ctx.fill(); ctx.fillRect(x + 4 - k * 8, y - 44, 1.6, 40); });
  const Y = bsDune(ctx, w, h, h * .84, 30, 17, '#5a2a2e', '#1e0d14', 'rgba(255,170,120,.5)');
  /* iki yolcu */
  const ph = t * 2.6, x1 = w * .66, x2 = w * .715;
  [[x1, ph], [x2, ph + 1.3]].forEach(([x, q]) => {
    ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#12060a'; ctx.beginPath(); ctx.ellipse(x - 50, Y(x) + 4, 60, 5, -.05, 0, TAU); ctx.fill(); ctx.restore();
    bsRobed(ctx, x, Y(x) + 3, .95, '#14070c', { staff: 1, step: Math.sin(q), sway: Math.sin(q) * .6 });
  });
  bsDune(ctx, w, h, h * .95, 14, 29, '#220e16', '#0e0508');
  falling(ctx, st, w, h, t, { key: 'kum', n: 70, kind: 'dot', colors: ['#ffd0a0'], speed: 4, size: 1.1, sway: 6, drift: -40, alpha: .35, area: [.4, 1] });
  shade(ctx, w, h, ['l', '14,6,14', .92]); vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .06);
}

/* 4) İki yolcu (split): mağrur fırtınada / mütevazi çadırda */
function magrurHalf(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#05060b', '#0f1420', '#1b2130', '#2a2a32']);
  clouds(ctx, st, w, h, t, 8, h * .05, h * .45, '14,16,24', .7, 5, 26);
  const fl = Math.max(0, Math.sin(t * 1.7) * Math.sin(t * 5.3) - .82) * 4; if (fl > 0) { ctx.fillStyle = `rgba(190,200,230,${fl * .35})`; ctx.fillRect(0, 0, w, h); }
  const Y = bsDune(ctx, w, h, h * .8, 20, 51, '#2a2730', '#0c0b10', 'rgba(140,140,170,.25)');
  [[.12, .74, 0], [.86, .76, 2], [.95, .7, 4]].forEach(([u, v, k]) => { const b = Math.sin(t * .9 + k) > -.6 ? 1 : 0; if (!b) return; glow(ctx, w * u, h * v, 22, '255,200,90', .35); ctx.fillStyle = '#ffd36a'; [-6, 6].forEach(d => { ctx.beginPath(); ctx.ellipse(w * u + d, h * v, 3, 2, 0, 0, TAU); ctx.fill(); }); });
  const x = w * .5; bsRobed(ctx, x, Y(x) + 2, 1.25, '#020204', { bow: .9, sway: 3 + Math.sin(t * 3) * 1.2, staff: 0 });
  falling(ctx, st, w, h, t, { key: 'mg', n: 160, kind: 'drop', colors: ['rgba(200,190,170,.5)'], speed: 120, drift: 260, sway: 0, alpha: .5 });
  vinyet(ctx, w, h, .6);
}
function mutevaziHalf(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#f4c98a', '#f8dcaa', '#fbead0']);
  glow(ctx, w * .82, h * .32, 300, '255,250,225', .9);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a = .05 + .02 * Math.sin(t * .6 + i); const g = ctx.createLinearGradient(w * .82, h * .32, 0, h); g.addColorStop(0, `rgba(255,250,225,${a})`); g.addColorStop(1, 'rgba(255,250,225,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(w * .82, h * .32); ctx.lineTo(-40 + i * 90, h); ctx.lineTo(10 + i * 90, h); ctx.closePath(); ctx.fill(); } ctx.restore();
  birds(ctx, st, w, h, t, 4, 13, 'rgba(90,60,30,.5)', .8);
  bsDune(ctx, w, h, h * .74, 14, 61, '#e7b06e', '#c98a48', 'rgba(255,240,210,.7)');
  const Y = bsDune(ctx, w, h, h * .86, 16, 67, '#d39a58', '#a86a32', 'rgba(255,236,200,.6)');
  const tx = w * .72; bsTent(ctx, tx, Y(tx) + 4, 1.5, '#3a2416', 1, t); bsFlag(ctx, tx, Y(tx) - 74, 52, '#b5532f', t, '#3a2416');
  bsRobed(ctx, tx - 54, Y(tx - 54) + 4, .95, '#3a2416', { dir: -1 });
  const x = w * .3; bsRobed(ctx, x, Y(x) + 4, 1.2, '#2a1a10', { staff: 1, pennant: '#b5532f', t, step: Math.sin(t * 2.4) });
  ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = '#5a3a20'; ctx.beginPath(); ctx.ellipse(x - 40, Y(x) + 8, 70, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
  falling(ctx, st, w, h, t, { key: 'mt', n: 30, kind: 'dot', colors: ['#fff6dc'], speed: 6, up: true, size: 1.2, sway: 18, alpha: .6, fade: true });
}

/* 5) Asker: kapıda nöbet, arkada devlet mührü */
function askerScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#05060c', '#0c1022', '#1a1830', '#2c2236']);
  drawStars(ctx, st, w, h, t, 160, .6, 53);
  clouds(ctx, st, w, h, t, 6, h * .08, h * .35, '30,26,44', .45, 9, 10);
  const gx = w * .78, base = h * .86;
  bsSeal(ctx, gx, h * .27, 70, t, '232,196,120', .95);
  /* sur ve kapı */
  ctx.fillStyle = '#0b0a12'; ctx.fillRect(w * .52, base - 210, w * .52, 210);
  for (let x = w * .52; x < w; x += 34) ctx.fillRect(x, base - 228, 20, 20);
  [[w * .6, 290], [w * .96, 300]].forEach(([x, hh]) => { ctx.fillRect(x - 38, base - hh, 76, hh); for (let k = -38; k < 38; k += 19) ctx.fillRect(x + k, base - hh - 16, 12, 16); });
  const aw = 120, ah = 190;
  const gg = ctx.createLinearGradient(0, base - ah, 0, base); gg.addColorStop(0, '#ffcf88'); gg.addColorStop(1, '#ff9a4a');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(gx - aw / 2, base); ctx.lineTo(gx - aw / 2, base - ah + aw / 2); ctx.arc(gx, base - ah + aw / 2, aw / 2, Math.PI, 0); ctx.lineTo(gx + aw / 2, base); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(80,40,30,.55)'; for (let i = 0; i < 4; i++) ctx.fillRect(gx - 40 + i * 24, base - 52 - i * 6, 3, 52 + i * 6);
  glow(ctx, gx, base - 60, 260, '255,190,110', .4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(0, base, 0, h); lg.addColorStop(0, 'rgba(255,190,110,.35)'); lg.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(gx - aw / 2, base); ctx.lineTo(gx + aw / 2, base); ctx.lineTo(gx + aw * 1.6, h); ctx.lineTo(gx - aw * 1.6, h); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#060508'; ctx.fillRect(0, base, w, h - base);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,190,110,.22)'; ctx.beginPath(); ctx.moveTo(gx - aw / 2, base); ctx.lineTo(gx + aw / 2, base); ctx.lineTo(gx + aw * 1.5, h); ctx.lineTo(gx - aw * 1.5, h); ctx.closePath(); ctx.fill(); ctx.restore();
  bsSoldier(ctx, gx - 8, base + 2, 1.15, '#020203', t);
  falling(ctx, st, w, h, t, { key: 'ar', n: 90, kind: 'drop', colors: ['rgba(200,200,220,.45)'], speed: 90, drift: 120, sway: 0, alpha: .45, area: [.45, 1] });
  shade(ctx, w, h, ['l', '4,4,10', .92]); vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .06);
}

/* 6) Nuh'un gemisi: dağ gibi dalgalar, tek ışık */
function nuhgemiScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#06080c', '#10161e', '#1c2630', '#25303a']);
  clouds(ctx, st, w, h, t, 12, -h * .05, h * .45, '8,10,14', .75, 21, 18);
  const fl = Math.max(0, Math.sin(t * 1.3) * Math.sin(t * 4.1) - .85) * 5; if (fl > 0) { ctx.fillStyle = `rgba(200,210,235,${fl * .3})`; ctx.fillRect(0, 0, w, h); }
  const bx = w * .86, swell = Math.sin(t * .9);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const bg = ctx.createLinearGradient(w * .9, 0, bx, h * .7); bg.addColorStop(0, 'rgba(255,236,190,.0)'); bg.addColorStop(.3, 'rgba(255,236,190,.14)'); bg.addColorStop(1, 'rgba(255,236,190,.22)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(w * .86, -20); ctx.lineTo(w * .95, -20); ctx.lineTo(bx + 150, h * .78); ctx.lineTo(bx - 150, h * .78); ctx.closePath(); ctx.fill(); ctx.restore();
  const wave = (y0, amp, sp, k, c0, c1, foam) => {
    const Y = x => y0 + Math.sin(x * k + t * sp) * amp + Math.sin(x * k * 2.3 - t * sp * 1.4) * amp * .35;
    ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 8) ctx.lineTo(x, Y(x)); ctx.lineTo(w, h); ctx.closePath();
    const g = ctx.createLinearGradient(0, y0 - amp, 0, h); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fill();
    if (foam) { ctx.strokeStyle = foam; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= w; x += 8) { const y = Y(x); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    return Y;
  };
  wave(h * .58, 60, .7, .006, '#1a2a34', '#0b141a', 'rgba(170,200,210,.25)');
  const Y = wave(h * .78, 56, .9, .007, '#13212a', '#071016', 'rgba(190,215,225,.35)');
  /* gemi */
  const sy = Y(bx) + 18, ang = Math.cos(bx * .008 + t * .9) * .08;
  ctx.save(); ctx.translate(bx, sy); ctx.rotate(ang); ctx.scale(.78, .78);
  glow(ctx, 0, -40, 200, '255,226,170', .35);
  ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(-150, -34); ctx.quadraticCurveTo(-140, 20, -60, 26); ctx.lineTo(70, 26); ctx.quadraticCurveTo(140, 18, 160, -38); ctx.lineTo(120, -30); ctx.lineTo(-110, -30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2616'; ctx.fillRect(-80, -78, 150, 48); ctx.beginPath(); ctx.moveTo(-92, -78); ctx.lineTo(-5, -112); ctx.lineTo(82, -78); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,150,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-150, -34); ctx.quadraticCurveTo(-140, 20, -60, 26); ctx.lineTo(70, 26); ctx.quadraticCurveTo(140, 18, 160, -38); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-140, -12 + i * 12); ctx.lineTo(150, -12 + i * 12); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,214,140,.9)'; [-50, -10, 30].forEach(x => ctx.fillRect(x, -62, 14, 12));
  ctx.restore();
  wave(h * .9, 44, 1.1, .01, '#0d181f', '#03080b', 'rgba(200,220,230,.3)');
  falling(ctx, st, w, h, t, { key: 'ng', n: 180, kind: 'drop', colors: ['rgba(190,205,220,.45)'], speed: 260, drift: 80, sway: 0, alpha: .45 });
  { const og = ctx.createLinearGradient(0, 0, 0, h * .6); og.addColorStop(0, 'rgba(4,6,10,.45)'); og.addColorStop(1, 'rgba(4,6,10,0)'); ctx.fillStyle = og; ctx.fillRect(0, 0, w, h * .6); }
  vinyet(ctx, w, h, .6); grain(ctx, w, h, t, .05);
}

/* 7) Çekirdek ve tablacı ağaç (kesit) */
function bsFruitTree(ctx, st, key, w, h, x, y, len, col, seed, t, fol, fruit) {
  const tr = treeLayer(w, h, Math.round(x), Math.round(y), len, col, seed);
  ctx.drawImage(tr.c, 0, 0);
  if (!st[key]) { const r = srng(seed + 5); st[key] = tr.tips.map(([a, b]) => [a + (r() - .5) * 16, b + (r() - .5) * 16, r(), r()]); }
  st[key].forEach(([a, b, k, q]) => { ctx.fillStyle = fol[Math.floor(q * fol.length)]; ctx.beginPath(); ctx.arc(a + Math.sin(t * 1.1 + k * 6) * 1.4, b, 9 + k * 9, 0, TAU); ctx.fill(); });
  if (fruit) st[key].forEach(([a, b, k, q]) => { if (q > .22) return; const fx = a + 4, fy = b + 9; glow(ctx, fx, fy, 16, '255,200,120', .35); ctx.fillStyle = k > .5 ? '#d8452e' : '#f0a032'; ctx.beginPath(); ctx.arc(fx, fy, 6.5, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(fx - 2, fy - 2, 1.8, 0, TAU); ctx.fill(); });
}
function cekirdekScene(ctx, w, h, t, st) {
  const gy = h * .62;
  lin(ctx, w, gy, ['#1a2a44', '#4a5a7a', '#c99a72', '#f2c88e']);
  glow(ctx, w * .96, gy - 30, 300, '255,226,170', .6);
  birds(ctx, st, w, h * .6, t, 4, 19, 'rgba(40,30,40,.45)', .8);
  hills(ctx, w, gy + 6, gy, 10, 140, 6, '#5a6a4a');
  const tx = w * .79;
  bsFruitTree(ctx, st, 'cf', w, h, tx, gy + 4, 108, '#3a2616', 77, t, ['#3f6a32', '#4f7a3a', '#5f8f45', '#2f5a2a'], 1);
  /* toprak kesiti */
  const sg = ctx.createLinearGradient(0, gy, 0, h); sg.addColorStop(0, '#3a2414'); sg.addColorStop(1, '#120a06'); ctx.fillStyle = sg; ctx.fillRect(0, gy, w, h - gy);
  pts(st, 'tas', 60, 81, r => [r() * w, gy + 20 + r() * (h - gy - 20), 3 + r() * 9, r()]).forEach(([x, y, s, k]) => { ctx.fillStyle = `rgba(${90 + k * 40 | 0},${70 + k * 30 | 0},${50 + k * 20 | 0},.5)`; ctx.beginPath(); ctx.ellipse(x, y, s * 1.4, s, k * 3, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  const seedY = h * .86;
  /* kökler */
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const r = srng(91); ctx.strokeStyle = 'rgba(255,214,140,.35)'; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { let x = tx, y = gy + 6, a = Math.PI / 2 + (i - 4) * .3; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 9; k++) { a += (r() - .5) * .5; x += Math.cos(a) * 16; y += Math.sin(a) * 12; ctx.lineTo(x, Math.min(h - 6, y)); } ctx.stroke(); }
  /* çekirdekten gövdeye akan ışık */
  const lg = ctx.createLinearGradient(0, seedY, 0, gy); lg.addColorStop(0, 'rgba(255,220,140,.9)'); lg.addColorStop(1, 'rgba(255,220,140,.15)');
  ctx.strokeStyle = lg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, seedY); ctx.lineTo(tx, gy); ctx.stroke();
  for (let i = 0; i < 8; i++) { const u = ((t * .35 + i / 8) % 1), yy = seedY - u * (seedY - gy) - u * u * 160; glow(ctx, tx + Math.sin(u * 9 + i) * 3, yy, 10, '255,226,160', .7 * (1 - u)); }
  ctx.restore();
  glow(ctx, tx, seedY, 70 + 6 * Math.sin(t * 2), '255,214,130', .7);
  ctx.fillStyle = '#ffe7b0'; ctx.beginPath(); ctx.ellipse(tx, seedY, 9, 6, -.4, 0, TAU); ctx.fill();
  clbl(ctx, tx + 26, seedY + 6, 'zerrecik bir çekirdek', 'başında koca bir ağaç');
  falling(ctx, st, w, h, t, { key: 'ck', n: 30, kind: 'dot', colors: ['#ffe6b0'], speed: 8, up: true, size: 1.2, sway: 18, alpha: .45, fade: true, area: [.55, 1] });
  shade(ctx, w, h, ['l', '10,8,10', .93]); vinyet(ctx, w, h, .45); grain(ctx, w, h, t, .05);
}

/* 8) Asker ve çekirdek (temsil split) */
function askerHalf(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#070912', '#121a30', '#2a2a44', '#4a3a4a']);
  drawStars(ctx, st, w, h, t, 80, .5, 63);
  bsSeal(ctx, w * .5, h * .5, 46, t, '232,196,120', .75);
  skyline(ctx, st, w, h, h * .82, '#0a0a14', 66);
  const base = h * .86; ctx.fillStyle = '#05050a'; ctx.fillRect(0, base, w, h - base);
  for (let i = 0; i < 14; i++) { const u = ((i / 14 + t * .025) % 1), x = 20 + u * (w * .62), s = .5 + (i % 3) * .05; bsRobed(ctx, x, base + 2 + (i % 2) * 8, s, '#2a2236', { step: Math.sin(t * 3 + i), dir: 1 }); }
  glow(ctx, w * .8, base - 60, 170, '255,200,120', .45);
  bsSoldier(ctx, w * .8, base + 4, 1.0, '#020203', t, { dir: -1 });
  vinyet(ctx, w, h, .55);
}
function cekirdekHalf(ctx, w, h, t, st) {
  const gy = h * .7;
  lin(ctx, w, gy, ['#cfe2f0', '#eef2e6', '#fbefd6']);
  glow(ctx, w * .2, h * .2, 260, '255,252,230', .8);
  const tx = w * .5;
  bsFruitTree(ctx, st, 'cf2', w, h, tx, gy + 4, 112, '#4a3826', 83, t, ['#5f8f45', '#79a85a', '#4f7a3a', '#6f9a50'], 1);
  const sg = ctx.createLinearGradient(0, gy, 0, h); sg.addColorStop(0, '#6a4a2a'); sg.addColorStop(1, '#2a1a0e'); ctx.fillStyle = sg; ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = '#7e9c55'; ctx.fillRect(0, gy - 3, w, 6);
  const sy = h * .9;
  ctx.strokeStyle = 'rgba(255,230,160,.8)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tx, sy); ctx.lineTo(tx, gy); ctx.stroke();
  glow(ctx, tx, sy, 60 + 5 * Math.sin(t * 2), '255,220,140', .8);
  ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.ellipse(tx, sy, 8, 5.5, -.4, 0, TAU); ctx.fill();
  falling(ctx, st, w, h, t, { key: 'ch', n: 20, kind: 'dot', colors: ['#ffffff'], speed: 6, up: true, size: 1.2, sway: 18, alpha: .6, fade: true });
}

/* 9) Bostan: kudret mutfağının kazanı; buğu, inek ve buzağı */
function bostanScene(ctx, w, h, t, st) {
  const hz = h * .5;
  lin(ctx, w, hz + 20, ['#1c2638', '#4e5a70', '#c9a882', '#ffd99a']);
  glow(ctx, w * .9, hz - 10, 360, '255,226,160', .75); glow(ctx, w * .9, hz - 10, 60, '255,248,220', .95);
  hills(ctx, w, h, hz + 10, 14, 180, 2, '#8aa070'); hills(ctx, w, h, hz + 30, 10, 120, 5, '#6f8a52');
  const g = ctx.createLinearGradient(0, hz + 30, 0, h); g.addColorStop(0, '#5a6a34'); g.addColorStop(1, '#2a3216'); ctx.fillStyle = g; ctx.fillRect(0, hz + 30, w, h - hz - 30);
  const vx = w * .86, vy = hz + 26, cols = [['#d8452e', '#3f7a30'], ['#6a3a7a', '#3a6a2a'], ['#f0c040', '#4f8a30'], ['#3f8a30', '#2f6a22'], ['#e86a2a', '#3f7a30']];
  for (let i = 0; i < 9; i++) {
    const ex = w * (.18 + i * .13), ey = h + 10, [fc, lc] = cols[i % cols.length];
    for (let k = 0; k < 16; k++) { const u = k / 16, x = vx + (ex - vx) * Math.pow(u, 1.15), y = vy + (ey - vy) * Math.pow(u, 1.15), s = 2 + u * 16;
      ctx.fillStyle = lc; ctx.beginPath(); ctx.ellipse(x, y, s * 1.3, s * .8, 0, 0, TAU); ctx.fill();
      if ((k + i) % 2 === 0) { ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(x + s * .5, y + s * .1, s * .45, 0, TAU); ctx.fill(); } }
  }
  /* buğu: kazanın kapağı */
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  pts(st, 'bg', 22, 101, r => [r(), r(), r()]).forEach(([a, b, c]) => { const life = (t * (.05 + c * .05) + b) % 1, x = w * (.45 + a * .55) + Math.sin(t * .5 + a * 9) * 20, y = h * .95 - life * h * .45; glow(ctx, x, y, 50 + life * 70, '255,244,224', .18 * Math.sin(life * Math.PI)); });
  ctx.restore();
  /* inek ve buzağı */
  const cow = (x, y, s, col) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -36, 42, 20, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-40, -44); ctx.quadraticCurveTo(-60, -60, -66, -42); ctx.quadraticCurveTo(-70, -30, -58, -30); ctx.quadraticCurveTo(-48, -32, -40, -30); ctx.fill(); ctx.fillRect(-34, -22, 7, 22); ctx.fillRect(-20, -22, 7, 22); ctx.fillRect(16, -22, 7, 22); ctx.fillRect(30, -22, 7, 22); ctx.beginPath(); ctx.moveTo(40, -42); ctx.quadraticCurveTo(52, -30, 48, -10); ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-60, -52); ctx.lineTo(-66, -60); ctx.moveTo(-54, -53); ctx.lineTo(-52, -62); ctx.stroke(); ctx.restore(); };
  glow(ctx, w * .8, h * .8, 120, '255,220,160', .25);
  cow(w * .82, h * .86, 1.15, '#2a1c12'); cow(w * .7, h * .88, .62, '#3a2818');
  shade(ctx, w, h, ['l', '12,12,8', .96]); vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .05);
}

/* 10) Şafakta otlak: süt çeşmeleri (ayet) */
function otlaksafakScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0d1430', '#3a3a62', '#a46a72', '#eaa874', '#f8d498']);
  glow(ctx, w * .7, h * .78, 420, '255,214,160', .5);
  ctx.fillStyle = '#fff1cc'; ctx.beginPath(); ctx.arc(w * .7, h * .8, 30, 0, TAU); ctx.fill();
  drawStars(ctx, st, w, h, t, 60, .3, 71);
  birds(ctx, st, w, h * .6, t, 6, 23, 'rgba(40,24,40,.5)', .7);
  hills(ctx, w, h, h * .82, 14, 220, 4, '#3a2a3a');
  mist(ctx, w, h, h * .84, '255,240,226', .45);
  hills(ctx, w, h, h * .95, 8, 160, 8, '#1e1420');
  const col = '#140c14', by = h * .95;
  const sheep = (x, s) => { ctx.save(); ctx.translate(x, by); ctx.scale(s, s); ctx.fillStyle = col; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-14 + i * 7, -22 - (i % 2) * 4, 10, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.ellipse(-26, -24, 7, 5, -.4, 0, TAU); ctx.fill(); ctx.fillRect(-12, -14, 3, 14); ctx.fillRect(10, -14, 3, 14); ctx.restore(); };
  const cow = (x, s) => { ctx.save(); ctx.translate(x, by); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -36, 40, 18, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-38, -42); ctx.quadraticCurveTo(-56, -40, -62, -22); ctx.lineTo(-52, -18); ctx.quadraticCurveTo(-46, -30, -36, -28); ctx.fill(); [-30, -16, 16, 28].forEach(lx => ctx.fillRect(lx, -22, 6, 22)); ctx.restore(); };
  const goat = (x, s) => { ctx.save(); ctx.translate(x, by); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -24, 22, 9, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-18, -28); ctx.lineTo(-30, -44); ctx.lineTo(-24, -46); ctx.lineTo(-12, -30); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-27, -45); ctx.quadraticCurveTo(-22, -56, -16, -52); ctx.stroke(); [-14, -8, 10, 15].forEach(lx => ctx.fillRect(lx, -18, 3, 18)); ctx.restore(); };
  bsCamel(ctx, w * .86, by, .8, col, 0, -1); cow(w * .94, .8); sheep(w * .8, .8); goat(w * .99, .8); sheep(w * .06, .8); goat(w * .12, .75); cow(w * .02, .7);
  { const og = ctx.createLinearGradient(0, 0, 0, h * .7); og.addColorStop(0, 'rgba(6,6,14,.45)'); og.addColorStop(1, 'rgba(6,6,14,0)'); ctx.fillStyle = og; ctx.fillRect(0, 0, w, h * .7); }
  vinyet(ctx, w, h, .55); grain(ctx, w, h, t, .05);
}

/* 11) Taşı delen kök, yanan güneş altında yeşil ağaç */
function koktasScene(ctx, w, h, t, st) {
  const gy = h * .4;
  lin(ctx, w, gy, ['#f8e6b0', '#f6c870', '#e88a3a']);
  glow(ctx, w * .95, h * .02, 420, '255,250,220', .95);
  ctx.save(); ctx.globalAlpha = .12; for (let i = 0; i < 6; i++) { const y = gy - 20 - i * 14; ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = w * .5; x < w; x += 10) ctx.lineTo(x, y + Math.sin(x * .05 + t * 3 + i) * 2); ctx.stroke(); } ctx.restore();
  const tx = w * .8;
  bsFruitTree(ctx, st, 'kt', w, h, tx, gy + 2, 70, '#3a2616', 97, t, ['#2f7a3a', '#3f8f45', '#5aa850', '#2a6a32'], 0);
  /* kaya katmanları */
  const layers = [['#6a5a4a', '#4a3e34'], ['#5a4e48', '#3a322e'], ['#4a3e3a', '#2a2422'], ['#3a302c', '#1a1614']];
  layers.forEach(([a, b], i) => { const y0 = gy + i * (h - gy) / 4; const g = ctx.createLinearGradient(0, y0, 0, y0 + (h - gy) / 4); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, y0 + Math.sin(i) * 6); for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y0 + Math.sin(x * .01 + i * 2) * 8); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill(); });
  pts(st, 'cr', 26, 111, r => [r() * w, gy + 20 + r() * (h - gy), 20 + r() * 50, r() * 3]).forEach(([x, y, l, a]) => { ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * .4); ctx.stroke(); });
  /* kökler: ışıyan ipek */
  if (!st.roots) { const r = srng(131), R = []; const grow = (x, y, a, d, wd) => { const seg = []; let px = x, py = y; for (let k = 0; k < 10 - d; k++) { a += (r() - .5) * .5; a = Math.max(.35, Math.min(Math.PI - .35, a)); px += Math.cos(a) * 18; py += Math.max(6, Math.sin(a) * 16); seg.push([px, Math.min(h - 10, py)]); if (d < 3 && r() < .25) grow(px, py, a + (r() < .5 ? -.7 : .7), d + 1, wd * .6); } R.push([x, y, seg, wd]); }; for (let i = 0; i < 6; i++) grow(tx, gy + 4, Math.PI / 2 + (i - 2.5) * .35, 0, 3); st.roots = R; }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  st.roots.forEach(([x, y, seg, wd], j) => { const pulse = .5 + .5 * Math.sin(t * 1.6 - j * .4); ctx.strokeStyle = `rgba(255,226,150,${.35 + .3 * pulse})`; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x, y); seg.forEach(([a, b]) => ctx.lineTo(a, b)); ctx.stroke(); const [ex, ey] = seg[seg.length - 1]; glow(ctx, ex, ey, 18, '255,230,160', .5 * pulse); });
  ctx.restore();
  [[tx - 70, gy + 120], [tx + 60, gy + 150], [tx - 10, gy + 210]].forEach(([x, y]) => { glow(ctx, x, y, 26, '255,190,110', .35); ctx.fillStyle = '#c8803a'; ctx.beginPath(); ctx.ellipse(x, y, 14, 9, .5, 0, TAU); ctx.fill(); });
  clbl(ctx, tx + 20, h - 110, 'ipek gibi yumuşak kökler', 'sert taşı deler, geçer', 'left');
  shade(ctx, w, h, ['l', '16,12,10', .93]); vinyet(ctx, w, h, .45); grain(ctx, w, h, t, .05);
}

/* 12) Asâ-yı Mûsâ / Âzâ-yı İbrâhim (split) */
function asaHalf(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0a1220', '#14223a', '#1c3048']);
  drawStars(ctx, st, w, h, t, 50, .4, 171);
  glow(ctx, w * .5, h * .7, 320, '120,190,230', .28);
  const cx = w * .5, top = h * .5, bot = h * .86;
  const rg = ctx.createLinearGradient(0, top, 0, bot); rg.addColorStop(0, '#46525e'); rg.addColorStop(1, '#1c242c'); ctx.fillStyle = rg;
  ctx.beginPath(); ctx.moveTo(cx - 230, bot); ctx.quadraticCurveTo(cx - 240, top + 40, cx - 120, top + 6); ctx.quadraticCurveTo(cx, top - 26, cx + 110, top + 4); ctx.quadraticCurveTo(cx + 240, top + 30, cx + 230, bot); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(170,210,235,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 200, top + 30); ctx.quadraticCurveTo(cx - 120, top + 6, cx, top - 10); ctx.quadraticCurveTo(cx + 110, top + 4, cx + 200, top + 26); ctx.stroke();
  ctx.strokeStyle = '#06090e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, top - 8); ctx.lineTo(cx - 10, top + 40); ctx.lineTo(cx + 8, top + 90); ctx.lineTo(cx - 6, bot); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2), sy = top + 14 + k * 24, x0 = cx + side * (3 + (k % 2) * 6), ex = x0 + side * (36 + k * 16);
    ctx.strokeStyle = `rgba(170,225,255,${.55 + .25 * Math.sin(t * 7 + i)})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0, sy); ctx.quadraticCurveTo(ex, sy - 6, ex + side * 10, bot + 4); ctx.stroke();
    for (let q = 0; q < 4; q++) { const u = (t * .9 + q / 4 + i * .11) % 1, px = x0 + (ex + side * 10 - x0) * Math.sqrt(u), py = sy + (bot - sy) * u * u; ctx.fillStyle = 'rgba(225,245,255,.8)'; ctx.beginPath(); ctx.arc(px, py, 1.8, 0, TAU); ctx.fill(); } }
  ctx.restore();
  const pg = ctx.createLinearGradient(0, bot, 0, h); pg.addColorStop(0, '#2a5a78'); pg.addColorStop(1, '#0a1822'); ctx.fillStyle = pg; ctx.fillRect(0, bot, w, h - bot);
  ctx.strokeStyle = 'rgba(200,235,255,.35)'; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); const yy = bot + 10 + i * 14; for (let x = 0; x <= w; x += 12) ctx.lineTo(x, yy + Math.sin(x * .03 + t * 2 + i) * 2); ctx.stroke(); }
  ctx.strokeStyle = '#d8c090'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + 150, top - 120); ctx.lineTo(cx + 4, top - 10); ctx.stroke();
  glow(ctx, cx, top - 8, 60, '200,235,255', .6);
  vinyet(ctx, w, h, .5);
}
function atesHalf(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#2a0c06', '#7a2a10', '#d8642a', '#f6b04a']);
  glow(ctx, w * .5, h, 420, '255,170,60', .7);
  for (let i = 0; i < 26; i++) { const x = (i + .5) / 26 * w, hh = 120 + 70 * Math.sin(t * 3 + i * 1.7) + 50 * Math.sin(t * 5.3 + i); const g = ctx.createLinearGradient(0, h - hh, 0, h); g.addColorStop(0, 'rgba(255,220,120,0)'); g.addColorStop(.5, 'rgba(255,150,50,.7)'); g.addColorStop(1, 'rgba(200,50,20,.9)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 20, h); ctx.quadraticCurveTo(x - 10, h - hh * .6, x + Math.sin(t * 4 + i) * 8, h - hh); ctx.quadraticCurveTo(x + 10, h - hh * .6, x + 20, h); ctx.closePath(); ctx.fill(); }
  const cx = w * .5, cy = h * .58;
  glow(ctx, cx, cy, 170, '150,240,210', .45);
  ctx.strokeStyle = 'rgba(200,255,235,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 120 + 4 * Math.sin(t * 2), 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#2a4a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy + 110); ctx.quadraticCurveTo(cx - 6, cy + 30, cx + 4, cy - 70); ctx.stroke();
  const leaf = (x, y, a, s) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.sin(t * 1.4 + x) * .05); const g = ctx.createLinearGradient(0, -s, 0, s); g.addColorStop(0, '#7ad05a'); g.addColorStop(1, '#2f8a3a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * .55, -s * .5, 0, -s * 1.4); ctx.quadraticCurveTo(-s * .55, -s * .5, 0, 0); ctx.fill(); ctx.strokeStyle = 'rgba(220,255,200,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 1.3); ctx.stroke(); ctx.restore(); };
  [[0, -70, 0, 44], [-4, -30, -.9, 40], [4, -40, .9, 42], [-2, 10, -1.1, 36], [2, 0, 1.1, 38], [-3, 50, -1.2, 30], [3, 40, 1.2, 32]].forEach(([dx, dy, a, s]) => leaf(cx + dx, cy + dy, a, s));
  falling(ctx, st, w, h, t, { key: 'kv', n: 50, kind: 'dot', colors: ['#ffd27a', '#ff9a4a'], speed: 40, up: true, size: 1.6, sway: 14, alpha: .8, fade: true });
}

/* 13) Sofra: fiatı ödenmiş nimet */
function sofraScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#0e0906', '#1a110a', '#24170c']);
  const wx = w * .8, wy = h * .22;
  ctx.fillStyle = '#0a0d1c'; ctx.beginPath(); ctx.moveTo(wx - 70, wy + 130); ctx.lineTo(wx - 70, wy + 20); ctx.arc(wx, wy + 20, 70, Math.PI, 0); ctx.lineTo(wx + 70, wy + 130); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); drawStars(ctx, st, w, h, t, 40, .4, 151); ctx.fillStyle = '#f6eed0'; ctx.beginPath(); ctx.arc(wx + 30, wy - 10, 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#0a0d1c'; ctx.beginPath(); ctx.arc(wx + 36, wy - 14, 11, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(wx - 70, wy + 130); ctx.lineTo(wx - 70, wy + 20); ctx.arc(wx, wy + 20, 70, Math.PI, 0); ctx.lineTo(wx + 70, wy + 130); ctx.stroke();
  const cy = h * .8, cx = w * .78, lx = w * .62, ly = cy - 70;
  glow(ctx, lx, ly - 30, 380, '255,190,110', .4 + .05 * Math.sin(t * 7));
  ctx.fillStyle = '#3a1e14'; ctx.beginPath(); ctx.ellipse(cx, cy + 30, 300, 60, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7a3a1e'; ctx.beginPath(); ctx.ellipse(cx, cy + 18, 300, 56, 0, 0, TAU); ctx.fill();
  const tg = ctx.createRadialGradient(cx - 40, cy - 10, 10, cx, cy, 230); tg.addColorStop(0, '#e2b45e'); tg.addColorStop(1, '#8a5a24'); ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(cx, cy, 230, 42, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,170,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, 222, 38, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#c88a40'; ctx.beginPath(); ctx.ellipse(cx - 110, cy - 14, 58, 22, 0, Math.PI, 0); ctx.ellipse(cx - 110, cy - 14, 58, 10, 0, 0, Math.PI); ctx.fill(); ctx.strokeStyle = 'rgba(90,50,20,.6)'; ctx.lineWidth = 1.5; [-30, -10, 10, 30].forEach(d => { ctx.beginPath(); ctx.moveTo(cx - 110 + d, cy - 30); ctx.lineTo(cx - 106 + d, cy - 12); ctx.stroke(); });
  ctx.fillStyle = '#e8e2d2'; ctx.beginPath(); ctx.ellipse(cx + 10, cy - 8, 46, 14, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#c8602a'; ctx.beginPath(); ctx.ellipse(cx + 10, cy - 12, 38, 9, 0, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(255,240,220,${.18 + .08 * Math.sin(t * 2 + i)})`; ctx.lineWidth = 3; ctx.beginPath(); const x0 = cx - 6 + i * 14; ctx.moveTo(x0, cy - 22); for (let k = 1; k < 8; k++) ctx.lineTo(x0 + Math.sin(t * 1.5 + k * .9 + i) * 7, cy - 22 - k * 12); ctx.stroke(); }
  ctx.fillStyle = '#4a2a14'; [[cx + 100, cy - 8], [cx + 116, cy - 2], [cx + 92, cy + 2], [cx + 108, cy + 8]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x, y, 8, 5, .4, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.moveTo(cx + 168, cy + 6); ctx.quadraticCurveTo(cx + 150, cy - 40, cx + 170, cy - 64); ctx.lineTo(cx + 186, cy - 64); ctx.quadraticCurveTo(cx + 206, cy - 40, cx + 188, cy + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8893d'; ctx.beginPath(); ctx.ellipse(lx, ly + 34, 26, 8, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(lx - 22, ly + 34); ctx.quadraticCurveTo(lx, ly + 10, lx + 30, ly + 26); ctx.lineTo(lx + 22, ly + 34); ctx.fill();
  const fh = 18 + 3 * Math.sin(t * 9); ctx.fillStyle = '#ffd37a'; ctx.beginPath(); ctx.moveTo(lx + 30, ly + 24); ctx.quadraticCurveTo(lx + 22, ly + 24 - fh * .6, lx + 30, ly + 24 - fh); ctx.quadraticCurveTo(lx + 38, ly + 24 - fh * .6, lx + 30, ly + 24); ctx.fill();
  glow(ctx, lx + 30, ly + 10, 60, '255,214,140', .6);
  falling(ctx, st, w, h, t, { key: 'sf', n: 30, kind: 'dot', colors: ['#ffe2b0'], speed: 6, up: true, size: 1.2, sway: 20, alpha: .45, fade: true, area: [.45, 1] });
  shade(ctx, w, h, ['l', '10,7,4', .92]); vinyet(ctx, w, h, .55); grain(ctx, w, h, t, .06);
}

/* 14) Padişahın hediyesi: uzakta saray, yolda miskin hizmetkâr */
function hediyeScene(ctx, w, h, t, st) {
  lin(ctx, w, h, ['#05060f', '#101530', '#241e3c', '#3a2a40']);
  drawStars(ctx, st, w, h, t, 200, .7, 161);
  const px = w * .8, py = h * .38;
  glow(ctx, px, py, 360, '255,210,140', .35);
  hills(ctx, w, h, h * .5, 20, 200, 3, '#141226');
  ctx.fillStyle = '#0a0914';
  ctx.fillRect(px - 150, py - 40, 300, 80);
  [-150, 150].forEach(dx => { ctx.fillRect(px + dx - 26, py - 96, 52, 96); for (let k = -26; k < 26; k += 13) ctx.fillRect(px + dx + k, py - 106, 8, 10); ctx.beginPath(); ctx.ellipse(px + dx, py - 106, 18, 16, 0, Math.PI, 0); ctx.fill(); });
  ctx.fillRect(px - 70, py - 70, 140, 30); ctx.beginPath(); ctx.ellipse(px, py - 70, 58, 50, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(px - 2, py - 140, 4, 24); ctx.beginPath(); ctx.arc(px, py - 142, 5, 0, TAU); ctx.fill();
  [[-90, 1], [90, 1]].forEach(([dx]) => { ctx.beginPath(); ctx.ellipse(px + dx, py - 40, 34, 30, 0, Math.PI, 0); ctx.fill(); });
  for (let i = -5; i <= 5; i++) { const fx = px + i * 24, a = .6 + .3 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,${200 + (i % 3) * 10},120,${a})`; ctx.beginPath(); ctx.moveTo(fx - 6, py + 30); ctx.lineTo(fx - 6, py + 4); ctx.arc(fx, py + 4, 6, Math.PI, 0); ctx.lineTo(fx + 6, py + 30); ctx.fill(); }
  ctx.fillStyle = '#0c0a16'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * .58); for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * .58 + Math.sin(x * .01) * 10); ctx.lineTo(w, h); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createLinearGradient(0, py + 40, 0, h); rg.addColorStop(0, 'rgba(255,200,130,.28)'); rg.addColorStop(1, 'rgba(255,200,130,.05)'); ctx.fillStyle = rg;
  ctx.beginPath(); ctx.moveTo(px - 10, py + 40); ctx.quadraticCurveTo(px - 60, h * .66, w * .72, h * .78); ctx.quadraticCurveTo(w * .66, h * .9, w * .62, h); ctx.lineTo(w * .78, h); ctx.quadraticCurveTo(w * .78, h * .88, w * .8, h * .78); ctx.quadraticCurveTo(px + 20, h * .66, px + 10, py + 40); ctx.closePath(); ctx.fill(); ctx.restore();
  const sx = w * .72, sy = h * .9, bob = Math.sin(t * 2.4) * 1.5;
  glow(ctx, sx + 20, sy - 66 + bob, 90, '255,214,140', .65 + .1 * Math.sin(t * 3));
  bsRobed(ctx, sx, sy, 1.15, '#05040a', { bow: .5, step: Math.sin(t * 2.4) });
  ctx.save(); ctx.translate(sx + 24, sy - 70 + bob); ctx.fillStyle = '#e8c070'; ctx.fillRect(-18, -12, 36, 24); ctx.strokeStyle = '#8a5a20'; ctx.lineWidth = 2; ctx.strokeRect(-18, -12, 36, 24); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke(); ctx.fillStyle = '#b5332f'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); ctx.restore();
  falling(ctx, st, w, h, t, { key: 'hd', n: 40, kind: 'dot', colors: ['#ffe2b0'], speed: 7, up: true, size: 1.2, sway: 20, alpha: .5, fade: true, area: [.5, 1] });
  shade(ctx, w, h, ['l', '5,5,12', .92]); vinyet(ctx, w, h, .5); grain(ctx, w, h, t, .05);
}

Object.assign(SCENES, {
  besmele: { name: 'Besmele şemsesi', fam: 'besmele', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['bismillah', 'besmele', 'birinci söz'], aff: { cover: 3 }, draw: M(besmeleScene, {}) },
  besmelesafak: { name: 'Şafakta Besmele', fam: 'besmele', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['bismillah', 'besmele', 'dua', 'hülâsa'], aff: { bullets: 1, closing: 2 }, draw: M(besmeleScene, { dawn: 1 }) },
  hira: { name: 'Hira gecesi', fam: 'gece', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['oku', 'vahiy', 'hira', 'ikra'], aff: { ayet: 2 }, draw: hiraScene },
  colyolcu: { name: 'Çölde iki yolcu ve oba', fam: 'col', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['çöl', 'yolcu', 'reis', 'kabile', 'bedevi'], aff: { alinti: 2 }, draw: colyolcuScene },
  ikiyolcu: { name: 'Mağrur ve mütevazi yolcu', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['mağrur', 'mütevazi', 'iki yolcu'], aff: { compare: 2, temsil: 2 }, draw: split(magrurHalf, mutevaziHalf) },
  asker: { name: 'Kapıdaki asker ve mühür', fam: 'asker', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['asker', 'devlet', 'kanun', 'nam'], aff: { alinti: 2 }, draw: askerScene },
  nuhgemi: { name: 'Dalgalar arasında gemi', fam: 'deniz', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['nuh', 'gemi', 'tufan', 'dalga'], aff: { ayet: 2 }, draw: nuhgemiScene },
  cekirdek: { name: 'Ağaç taşıyan çekirdek', fam: 'tohum', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['çekirdek', 'tohum', 'ağaç', 'tablacı'], aff: { alinti: 2 }, draw: cekirdekScene },
  askercekirdek: { name: 'Asker ve çekirdek', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['asker', 'çekirdek', 'nam'], aff: { temsil: 3 }, draw: split(askerHalf, cekirdekHalf) },
  bostan: { name: 'Buğulanan bostan', fam: 'tarla', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['bostan', 'kazan', 'inek', 'süt'], aff: { alinti: 2 }, draw: bostanScene },
  otlaksafak: { name: 'Şafakta otlak', fam: 'tarla', modes: ['dini'], tone: 'dark', pos: 'n', tags: ['süt', 'hayvan', 'en\'âm', 'rezzak'], aff: { ayet: 2 }, draw: otlaksafakScene },
  koktas: { name: 'Taşı delen kök', fam: 'tohum', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['kök', 'taş', 'damar', 'musahhar'], aff: { alinti: 2 }, draw: koktasScene },
  asaates: { name: 'Asâ-yı Mûsâ ve Âzâ-yı İbrâhim', fam: 'iki', modes: ['dini'], tone: 'split', pos: 'split', tags: ['asa', 'musa', 'ibrahim', 'ateş', 'yaprak'], aff: { compare: 3 }, draw: split(asaHalf, atesHalf) },
  sofra: { name: 'Kandilli sofra', fam: 'sofra', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['sofra', 'nimet', 'fiat', 'şükür', 'zikir'], aff: { diyalog: 2 }, draw: sofraScene },
  hediye: { name: 'Padişahın hediyesi', fam: 'saray', modes: ['dini'], tone: 'dark', pos: 'r', tags: ['padişah', 'hediye', 'mün\'im', 'saray'], aff: { alinti: 2 }, draw: hediyeScene }
});

/* PHARMA Holdings plc — Investor Relations Terminal (the live hero).
   Every number comes from PULSE (DexScreener + GeckoTerminal). Nothing animates unless the chain moved.
   Quiet is content: "MARKET CLOSED (BY APATHY)". Diagnoses are jokes; trades are real. */
document.addEventListener('DOMContentLoaded', () => {
  const T = document.getElementById('irt'); if (!T || !window.PULSE) return;
  const P = PULSE, $ = s => T.querySelector(s), $$ = s => [...T.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const short = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : '????';
  const hash = s => { let h = 2166136261; for (const c of s || '') { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pick = (arr, seed) => arr[seed % arr.length];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WHALE = 250;
  const DX_BUY = ['acute FOMO', 'chronic hopium', 'receipt deficiency', 'early-onset conviction', 'uncontrolled bullposting', 'low $PHARMA levels', 'seasonal capitulation (resolved)', 'severe allergy to Big Pharma', 'compulsive footnote reading', 'diamond-hand syndrome', 'trust issues (justified)', 'DOJ press release addiction'];
  const DX_SELL = ['discharged against medical advice', 'feeling better, apparently', 'switched pharmacies', 'insurance denied the refill', 'side effects: taking profit', 'left before the doctor came in'];
  const dx = t => t.bot ? 'automated refill (bot)' : t.kind === 'buy' ? pick(DX_BUY, hash(t.wallet)) : pick(DX_SELL, hash(t.wallet));
  const rx = v => v >= WHALE ? 'CODE BLUE: whale admitted' : v >= 50 ? 'extended release, take daily' : v >= 10 ? 'twice daily with food' : '1 capsule, as needed';
  const ticket = t => '#' + String((t.block || 0) % 10000).padStart(4, '0');
  const stamp = (el, src, t, snap) => { if (!el) return; if (!t) { el.textContent = `${src} · waiting`; el.classList.add('stale'); return; } const age = (Date.now() - t) / 1000; el.textContent = `${snap ? 'SNAPSHOT' : src} · ${age < 90 ? Math.round(age) + 's' : age < 5400 ? Math.round(age / 60) + 'm' : Math.round(age / 3600) + 'h'}`; el.classList.toggle('stale', age > 180 || !!snap); };

  /* ---------- header: session, clock, market mood ---------- */
  const clock = $('#irtClock'); setInterval(() => { if (clock) clock.textContent = new Date().toISOString().slice(11, 19) + ' UTC'; }, 1000);
  function mood() {
    const last = P.state.trades.find(t => !t.bot); const mins = last ? (Date.now() - last.ts) / 60000 : Infinity;
    const sess = $('#irtSess'), mk = $('#irtMkt'); if (!sess) return;
    if (!P.state.trades.length) { sess.classList.remove('off'); sess.classList.add('slow'); sess.querySelector('span').textContent = P.state.pair ? 'SESSION OPEN · TRADE FEED RESTING' : 'SESSION OPENING…'; mk.textContent = P.state.pair ? 'GeckoTerminal is rate-limiting this connection. Price, liquidity and buy/sell counts are still live from DexScreener. Nothing here is faked to fill the gap.' : 'connecting to the pharmacy counter'; return; }
    if (P.state.snapshot) { sess.classList.remove('off'); sess.classList.add('slow'); sess.querySelector('span').textContent = 'SESSION OPEN · SHOWING LAST SNAPSHOT'; mk.textContent = `trade feed resting · showing the last snapshot we took, ${P.ago(P.state.at.trades || 0)} ago · DexScreener numbers are live`; return; }
    sess.classList.toggle('slow', mins > 20 && mins < 240); sess.classList.toggle('off', mins >= 240 || P.state.status === 'degraded');
    const since = $('#sinceN'); if (since) since.textContent = isFinite(mins) ? (mins < 60 ? `${Math.floor(mins)} min` : mins < 1440 ? `${Math.floor(mins / 60)}h ${Math.floor(mins % 60)}m` : `${Math.floor(mins / 1440)}d`) : '—';
    sess.querySelector('span').textContent = P.state.resting ? 'SESSION OPEN · FEED RESTING (RATE LIMIT)' : mins < 20 ? 'SESSION OPEN · LIVE' : mins < 240 ? 'SESSION OPEN · SLOW' : 'MARKET CLOSED (BY APATHY)';
    mk.textContent = mins < 20 ? 'market: active' : mins < 240 ? `market: slow · this is what a ${P.fmtUsd(P.state.pair?.mcap || 0)} coin looks like between patients` : 'market: closed · nobody has bought or sold in hours. We don’t fake foot traffic.';
  }
  setInterval(mood, 15000);

  /* ---------- A: price odometer ---------- */
  let lastPrice = null;
  function odometer(p) {
    const el = $('#odo'); if (!el) return;
    const txt = P.fmtPrice(p.price), dir = lastPrice == null ? '' : p.price > lastPrice ? 'up' : p.price < lastPrice ? 'dn' : '';
    const cells = [...txt].map(c => `<span class="d">${c}</span>`).join('');
    const prev = el.textContent;
    el.innerHTML = cells + `<small>USD</small>`;
    if (dir && prev !== txt && !reduced) { $$('#odo .d').forEach(d => d.classList.add(dir)); setTimeout(() => $$('#odo .d').forEach(d => d.classList.remove('up', 'dn')), 700); }
    lastPrice = p.price;
    $('#mcapN').textContent = P.fmtUsd(p.mcap);
    $('#chg').innerHTML = [['5m', p.chg.m5], ['1h', p.chg.h1], ['6h', p.chg.h6], ['24h', p.chg.h24]].map(([k, v]) => `<div><span>Δ ${k}</span><b class="${v > 0 ? 'up' : v < 0 ? 'dn' : ''}">${v == null ? '—' : (v > 0 ? '+' : '') + (+v).toFixed(1) + '%'}</b></div>`).join('');
    stamp($('#srcA'), 'DEXSCREENER', p.t);
    // G: fines progress fed live
    const pct = p.mcap / 2.3e9 * 100; $('#fineN').innerHTML = pct.toFixed(pct < .01 ? 4 : 3) + '<small>%</small>'; $('#fineBar').style.width = Math.max(.3, pct) + '%';
    // F: bottle
    const liq = p.liq || 0, fill = Math.max(.06, Math.min(1, liq / 100000));
    $('#liqN').innerHTML = `${P.fmtUsd(liq)}<small>${(liq / p.price / 1e6 / (p.mcap / p.price / 1e6) * 100).toFixed(0)}% of market cap is in the pool · DexScreener</small>`;
    const L = $('#liq'); if (L) { L.setAttribute('y', 104 - 86 * fill); L.setAttribute('height', 86 * fill); }
    // D: admissions vs discharges
    const tx = p.txns || {};
    $('#adm').innerHTML = ['m5', 'h1', 'h6', 'h24'].map(k => { const b = tx[k]?.buys || 0, s = tx[k]?.sells || 0, n = b + s || 1; return `<div class="adm-row"><span>${k.replace('m5', '5m').replace('h', '').padEnd(3, ' ') + (k[0] === 'h' ? 'h' : '')}</span><div><div class="adm-bar"><i class="bb" style="width:${b / n * 100}%"></i><i class="ss" style="width:${s / n * 100}%"></i></div><div class="adm-n"><span style="color:var(--cyan)">${b} admitted</span><span style="color:#ff8a9b">${s} discharged</span></div></div></div>`; }).join('');
    const b24 = tx.h24?.buys || 0, s24 = tx.h24?.sells || 0;
    $('#admRatio').innerHTML = s24 ? `<b>${(b24 / s24).toFixed(2)}</b> admitted per discharge · 24h` : `<b>${b24}</b> admitted, nobody discharged · 24h`;
    stamp($('#srcD'), 'DEXSCREENER', p.t); stamp($('#srcF'), 'DEXSCREENER', p.t); stamp($('#srcG'), 'DEXSCREENER', p.t);
    mood();
  }
  P.on('pair', odometer);

  /* ---------- B: EKG ---------- */
  const ekg = $('#ekg'), ectx = ekg.getContext('2d');
  let range = '24h', spike = 0, W = 0, H = 0;
  const fmtP = p => p < 0.001 ? p.toFixed(8).replace(/0+$/, '') : p.toFixed(4);
  function series() {
    const now = Date.now();
    if (range === '24h') return P.state.candles5.filter(c => now - c.t < 864e5);
    if (range === '7d') return P.state.candlesH.filter(c => now - c.t < 7 * 864e5);
    return P.state.candlesD;
  }
  function drawEkg() {
    const dpr = Math.min(devicePixelRatio || 1, 2); W = ekg.clientWidth; H = ekg.clientHeight;
    if (ekg.width !== W * dpr) { ekg.width = W * dpr; ekg.height = H * dpr; } ectx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ectx.clearRect(0, 0, W, H);
    // monitor grid
    ectx.strokeStyle = 'rgba(85,216,255,.07)'; ectx.lineWidth = 1;
    for (let x = 0; x < W; x += 22) { ectx.beginPath(); ectx.moveTo(x, 0); ectx.lineTo(x, H); ectx.stroke(); }
    for (let y = 0; y < H; y += 22) { ectx.beginPath(); ectx.moveTo(0, y); ectx.lineTo(W, y); ectx.stroke(); }
    const c = series();
    if (c.length < 2) { ectx.fillStyle = '#8ea7c1'; ectx.font = '12px "IBM Plex Mono", monospace'; ectx.textAlign = 'center'; ectx.fillText(P.state.resting ? 'chart feed resting (rate limit) · last good data shown when available' : 'acquiring signal…', W / 2, H / 2); return; }
    const padR = 70, padT = 26, padB = 26, x0 = 8, x1 = W - padR, y0 = padT, y1 = H - padB;
    const lo = Math.min(...c.map(k => k.l)), hi = Math.max(...c.map(k => k.h)), span = (hi - lo) || hi * .1 || 1;
    const px = v => y1 - (v - lo) / span * (y1 - y0), cx = i => x0 + i / (c.length - 1) * (x1 - x0);
    // volume shadow
    const vmax = Math.max(...c.map(k => k.v), 1);
    c.forEach((k, i) => { if (!k.v) return; const h = k.v / vmax * (y1 - y0) * .3; ectx.fillStyle = k.c >= k.o ? 'rgba(85,216,255,.12)' : 'rgba(255,59,88,.12)'; ectx.fillRect(cx(i) - 1, y1 - h, 2.5, h); });
    // trace: live segments cyan with glow, quiet (no trades) segments grey + dashed
    const seg = (from, to, quiet) => { ectx.beginPath(); for (let i = from; i <= to; i++) ectx.lineTo(cx(i), px(c[i].c)); ectx.setLineDash(quiet ? [3, 4] : []); ectx.strokeStyle = quiet ? 'rgba(142,167,193,.55)' : '#55d8ff'; ectx.lineWidth = quiet ? 1.2 : 2; ectx.shadowColor = quiet ? 'transparent' : 'rgba(85,216,255,.7)'; ectx.shadowBlur = quiet ? 0 : 10; ectx.stroke(); ectx.shadowBlur = 0; ectx.setLineDash([]); };
    let s = 0; for (let i = 1; i <= c.length; i++) { if (i === c.length || !!c[i].quiet !== !!c[s + 1 > c.length - 1 ? s : s + 1].quiet) { seg(s, Math.min(i, c.length - 1), !!c[Math.min(s + 1, c.length - 1)].quiet); s = Math.min(i, c.length - 1); } }
    // real trade dots
    const t0 = c[0].t, t1 = c[c.length - 1].t + (c[1].t - c[0].t);
    P.state.trades.filter(t => !t.bot && t.ts >= t0 && t.ts <= t1).forEach(t => {
      const i = Math.min(c.length - 1, Math.max(0, Math.round((t.ts - t0) / (t1 - t0) * (c.length - 1)))), r = Math.max(2.2, Math.min(8, 1.5 + Math.log10(1 + t.usd) * 1.9));
      ectx.beginPath(); ectx.arc(cx(i), px(c[i].c) + (t.kind === 'buy' ? 10 : -10), r, 0, 7); ectx.fillStyle = t.kind === 'buy' ? 'rgba(85,216,255,.75)' : 'rgba(255,59,88,.75)'; ectx.fill();
    });
    // live spike at the right edge when a real trade just landed
    if (spike > 0) { const lx = x1, ly = px(c[c.length - 1].c); ectx.strokeStyle = '#fff'; ectx.lineWidth = 2; ectx.shadowColor = '#55d8ff'; ectx.shadowBlur = 14; ectx.beginPath(); ectx.moveTo(lx - 18, ly); ectx.lineTo(lx - 12, ly - 26 * spike); ectx.lineTo(lx - 7, ly + 14 * spike); ectx.lineTo(lx - 3, ly); ectx.stroke(); ectx.shadowBlur = 0; spike = Math.max(0, spike - .03); requestAnimationFrame(drawEkg); }
    // last price tag + hi/lo
    const last = c[c.length - 1], ly = px(last.c), up = last.c >= c[0].o;
    ectx.fillStyle = up ? '#55d8ff' : '#ff3b58'; ectx.fillRect(x1 + 4, ly - 10, padR - 8, 20); ectx.fillStyle = '#04101f'; ectx.font = 'bold 11px "IBM Plex Mono", monospace'; ectx.textAlign = 'left'; ectx.fillText('$' + fmtP(last.c), x1 + 8, ly + 4);
    ectx.fillStyle = '#8ea7c1'; ectx.font = '10px "IBM Plex Mono", monospace'; ectx.fillText('H $' + fmtP(hi), x1 + 8, y0 - 8); ectx.fillText('L $' + fmtP(lo), x1 + 8, y1 + 16);
    // time axis
    ectx.textAlign = 'center'; const step = Math.max(1, Math.floor(c.length / (W < 600 ? 3 : 6)));
    for (let i = 0; i < c.length; i += step) { const d = new Date(c[i].t); ectx.fillText(range === '24h' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }), cx(i), H - 8); }
    const quietN = c.filter(k => k.quiet).length;
    $('#ekgNote').textContent = quietN > c.length * .5 ? 'Flatline is a feature. Nobody traded. Marjorie checked.' : quietN ? `${Math.round(quietN / c.length * 100)}% of this window had zero trades (grey). Not smoothed.` : 'Every dot is a real trade. Every flat bit is real too.';
  }
  const stampB = () => stamp($('#srcB'), 'GECKOTERMINAL · 5-MIN', P.state.at[range === '24h' ? 'candles5' : range === '7d' ? 'candlesH' : 'candlesD'], P.state.snapshot && !P.state.at.pairLiveCandles);
  P.on('candles5', () => { drawEkg(); stampB(); }); P.on('candlesH', () => { drawEkg(); stampB(); }); P.on('candlesD', () => { drawEkg(); stampB(); }); P.on('trades', () => { drawEkg(); ward(); nowServing(); mood(); });
  addEventListener('resize', drawEkg);
  $$('.ekg-tabs button').forEach(b => b.onclick = () => { range = b.dataset.r; $$('.ekg-tabs button').forEach(x => x.classList.toggle('on', x === b)); drawEkg(); });

  /* ---------- C: now serving ---------- */
  function flap(el, text) { const CH = '0123456789#'; el.innerHTML = [...text].map(() => '<span class="ch">#</span>').join(''); if (reduced) { [...el.children].forEach((c, i) => c.textContent = text[i]); return; } [...el.children].forEach((c, i) => { let n = 0, max = 5 + i * 3; const iv = setInterval(() => { c.textContent = ++n >= max ? text[i] : CH[Math.random() * CH.length | 0]; if (n >= max) clearInterval(iv); }, 40); }); }
  let shownId = null;
  function nowServing(freshIds = new Set()) {
    const tr = P.state.trades, real = tr.filter(t => !t.bot), cur = real[0];
    if (cur && cur.id !== shownId) { shownId = cur.id; flap($('#nsNum'), ticket(cur)); $('#nsWho').innerHTML = `<b>PATIENT ${esc(short(cur.wallet))}</b><i>Dx: ${esc(dx(cur))}</i><span>${cur.kind === 'buy' ? `Rx: ${P.fmtUsd(cur.usd)} of $PHARMA · ${esc(rx(cur.usd))}` : `${P.fmtUsd(cur.usd)} · ${esc(dx(cur))}`} · ${P.ago(cur.ts)} ago</span>`; }
    const log = $('#nsLog');
    log.innerHTML = tr.slice(0, 7).map(t => `<a class="ns-row ${t.bot ? 'b' : t.kind === 'buy' ? '' : 's'} ${freshIds.has(t.id) ? 'fresh' : ''}" href="https://solscan.io/tx/${esc(t.id)}" target="_blank" rel="noopener" title="Real transaction on Solscan"><b>${ticket(t)}</b><i>${esc(short(t.wallet))} <small>· ${esc(dx(t))}</small></i><span class="amt">${t.bot ? 'auto' : P.fmtUsd(t.usd)}</span><em>${P.ago(t.ts)}</em></a>`).join('') || `<div class="ns-empty">${P.state.pair ? 'FRONT DESK FEED RESTING · GeckoTerminal is rate-limiting this connection · the counter reopens automatically · nothing is faked meanwhile' : 'opening the front desk…'}</div>`;
    const day = tr.filter(t => Date.now() - t.ts < 864e5);
    $('#nsStats').textContent = `${day.filter(t => t.kind === 'buy' && !t.bot).length} admitted · ${day.filter(t => t.kind === 'sell' && !t.bot).length} discharged · ${day.filter(t => t.bot).length} bot refills · last 300 trades`;
    stamp($('#srcC'), 'GECKOTERMINAL', P.state.at.trades, P.state.snapshot);
  }
  /* ---------- H: the ward ---------- */
  const cbLog = [];
  function ward() {
    const tr = P.state.trades.filter(t => !t.bot && Date.now() - t.ts < 864e5); if (!tr.length) { $('#ward').innerHTML = P.state.trades.length ? `<div><b>0</b><span>patients · 24h</span><small>nobody. honestly.</small></div>` : `<div><b>…</b><span>feed resting</span><small>waiting on GeckoTerminal</small></div>`; stamp($('#srcH'), 'GECKOTERMINAL', P.state.at.trades, P.state.snapshot); return; }
    const wallets = {}; tr.forEach(t => wallets[t.wallet] = (wallets[t.wallet] || 0) + 1);
    const uniq = Object.keys(wallets).length, repeat = Object.entries(wallets).sort((a, b) => b[1] - a[1])[0], big = tr.reduce((m, t) => t.usd > m.usd ? t : m, tr[0]), whales = tr.filter(t => t.usd >= WHALE && t.kind === 'buy').length;
    $('#ward').innerHTML = `<div><b>${uniq}</b><span>unique patients · 24h</span><small>${tr.length} visits</small></div>
      <div><b>${repeat[1]}×</b><span>repeat patient</span><small>${esc(short(repeat[0]))}</small></div>
      <div><b class="${big.usd >= WHALE ? 'gold' : ''}">${P.fmtUsd(big.usd)}</b><span>largest dose · 24h</span><small>${big.kind === 'buy' ? 'admitted' : 'discharged'} · ${esc(short(big.wallet))}</small></div>
      <div><b class="${whales ? 'gold' : ''}">${whales}</b><span>code blues · 24h</span><small>buys over $${WHALE}</small></div>`;
    $('#cbLog').innerHTML = cbLog.length ? cbLog.slice(-3).map(c => `<div><b>CODE BLUE</b> · ${esc(short(c.wallet))} admitted ${P.fmtUsd(c.usd)} · ${P.ago(c.ts)} ago</div>`).join('') : `<div>No whale on the floor since you opened this page.</div>`;
    stamp($('#srcH'), 'GECKOTERMINAL', P.state.at.trades, P.state.snapshot);
  }
  /* live trade event: everything that is allowed to move, moves now */
  P.on('trade', t => {
    if (t.bot) return;
    spike = 1; drawEkg(); nowServing(new Set([t.id])); ward();
    if (t.kind === 'buy' && t.usd >= WHALE) { cbLog.push(t); T.classList.remove('codeblue'); void T.offsetWidth; T.classList.add('codeblue'); setTimeout(() => T.classList.remove('codeblue'), 4200); }
    window.dispatchEvent(new CustomEvent('ph:trade', { detail: t }));
    if (soundOn) ding(t.kind === 'buy' ? (t.usd >= WHALE ? 3 : 1) : 0);
  });
  let audio = null, soundOn = false;
  function ding(kind) { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const notes = kind === 3 ? [880, 1175, 1568] : kind === 1 ? [988, 1319] : [440, 330]; notes.forEach((f, i) => { const o = audio.createOscillator(), g = audio.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, audio.currentTime + i * .14); g.gain.exponentialRampToValueAtTime(.12, audio.currentTime + i * .14 + .02); g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + i * .14 + .5); o.connect(g).connect(audio.destination); o.start(audio.currentTime + i * .14); o.stop(audio.currentTime + i * .14 + .6); }); }
  const sb = $('#irtSound'); if (sb) sb.onclick = () => { soundOn = !soundOn; sb.textContent = soundOn ? 'Monitor beeps: on' : 'Monitor beeps: off'; if (soundOn) ding(1); };

  /* ---------- E: roster ---------- */
  P.on('holders', h => {
    $('#holdN').textContent = h.count.toLocaleString();
    const d = h.dist, parts = [['Top 10', +d.top_10 || 0, '#ffcf6b'], ['11–20', +d['11_20'] || 0, '#15a7ff'], ['21–40', +d['21_40'] || 0, '#55d8ff'], ['Everyone else', +d.rest || 0, '#6ee7b7']];
    $('#distBar').innerHTML = parts.map(([k, v, c]) => `<i style="width:${v}%;background:${c}" title="${k} ${v.toFixed(1)}%"></i>`).join('');
    $('#distK').innerHTML = parts.map(([k, v, c]) => `<div><i style="background:${c}"></i>${k} ${v.toFixed(1)}%</div>`).join('');
    const HH = window.HOLDERS, poolPct = HH && HH.top && HH.supply ? (HH.top.find(t => t.o === HH.pool) || { a: 0 }).a / HH.supply * 100 : 0; $('#distNote').textContent = poolPct ? `Top 10 hold ${(+d.top_10 || 0).toFixed(1)}%, and ${poolPct.toFixed(1)} points of that is the liquidity pool. We are, in fact, Big Pharma.` : `Top 10 wallets hold ${(+d.top_10 || 0).toFixed(1)}% (the liquidity pool is one of them). We are, in fact, Big Pharma.`;
    stamp($('#srcE'), 'GECKOTERMINAL', P.state.at.holders, h.snapshot);
  });
  /* ---------- G: fines ticker ---------- */
  (() => { const R = (window.RECEIPTS || []).filter(r => r.amount_usd).sort((a, b) => b.amount_usd - a.amount_usd).slice(0, 5); const nm = r => r.company.split(/[,(]/)[0].trim() + (/[,(]/.test(r.company) ? ' et al.' : ''); const el = $('#fineTicker'); if (el && R.length) el.innerHTML = [...R, R[0]].map(r => `<span>${esc(nm(r))} · ${esc(r.year)} · ${P.fmtUsd(r.amount_usd)}</span>`).join(''); })();

  /* ---------- share: print today's chart ---------- */
  const pb = $('#printChart'); if (pb) pb.onclick = async () => {
    await document.fonts.ready;
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d');
    const p = P.state.pair || {}, h = P.state.holders || {}, tr = P.state.trades.filter(t => !t.bot && Date.now() - t.ts < 864e5);
    x.fillStyle = '#f3efe4'; x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = '#1d1a15'; x.fillRect(0, 0, 1080, 14);
    x.fillStyle = '#1d1a15'; x.font = '900 54px Inter, Arial'; x.textAlign = 'left'; x.fillText('PHARMA HOLDINGS PLC', 60, 100);
    x.font = '500 22px "IBM Plex Mono", monospace'; x.fillStyle = '#6b5f4f'; x.fillText('DAILY PATIENT CHART · TICKER: PHARMA · ' + new Date().toUTCString().slice(0, 25), 60, 138);
    x.strokeStyle = '#1d1a15'; x.lineWidth = 3; x.beginPath(); x.moveTo(60, 160); x.lineTo(1020, 160); x.stroke();
    // ekg strip from candles5
    const s = P.state.candles5.filter(k => Date.now() - k.t < 864e5); const sx0 = 60, sx1 = 1020, sy0 = 200, sy1 = 520;
    x.fillStyle = '#0a1424'; x.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    x.strokeStyle = 'rgba(85,216,255,.12)'; for (let gx = sx0; gx < sx1; gx += 24) { x.beginPath(); x.moveTo(gx, sy0); x.lineTo(gx, sy1); x.stroke(); } for (let gy = sy0; gy < sy1; gy += 24) { x.beginPath(); x.moveTo(sx0, gy); x.lineTo(sx1, gy); x.stroke(); }
    if (s.length > 1) { const lo = Math.min(...s.map(k => k.l)), hi = Math.max(...s.map(k => k.h)), sp = (hi - lo) || 1; x.beginPath(); s.forEach((k, i) => x.lineTo(sx0 + 20 + i / (s.length - 1) * (sx1 - sx0 - 40), sy1 - 30 - (k.c - lo) / sp * (sy1 - sy0 - 60))); x.strokeStyle = '#55d8ff'; x.lineWidth = 3; x.shadowColor = '#55d8ff'; x.shadowBlur = 12; x.stroke(); x.shadowBlur = 0;
      tr.forEach(t => { const i = Math.round((t.ts - s[0].t) / (s[s.length - 1].t - s[0].t) * (s.length - 1)); const k = s[Math.max(0, Math.min(s.length - 1, i))]; if (!k) return; x.beginPath(); x.arc(sx0 + 20 + Math.max(0, Math.min(s.length - 1, i)) / (s.length - 1) * (sx1 - sx0 - 40), sy1 - 30 - (k.c - lo) / sp * (sy1 - sy0 - 60) + (t.kind === 'buy' ? 12 : -12), Math.min(9, 3 + Math.log10(1 + t.usd) * 2), 0, 7); x.fillStyle = t.kind === 'buy' ? '#55d8ff' : '#ff3b58'; x.fill(); }); }
    x.fillStyle = '#8ea7c1'; x.font = '18px "IBM Plex Mono", monospace'; x.fillText('24H ECG · real 5-min price · dots = real trades', sx0 + 16, sy1 - 12);
    const row = (y, k, v, sub) => { x.fillStyle = '#6b5f4f'; x.font = '500 20px "IBM Plex Mono", monospace'; x.textAlign = 'left'; x.fillText(k, 60, y); x.fillStyle = '#1d1a15'; x.font = '900 46px Inter, Arial'; x.textAlign = 'right'; x.fillText(v, 1020, y + 4); if (sub) { x.fillStyle = '#6b5f4f'; x.font = 'italic 20px "IBM Plex Mono", monospace'; x.fillText(sub, 1020, y + 32); } x.strokeStyle = 'rgba(29,26,21,.25)'; x.lineWidth = 1; x.beginPath(); x.moveTo(60, y + 46); x.lineTo(1020, y + 46); x.stroke(); };
    const ch = p.chg?.h24; const dxLine = ch == null ? 'Dx: pending' : ch > 30 ? `Dx: acute FOMO (${ch > 0 ? '+' : ''}${ch.toFixed(0)}%)` : ch > 5 ? 'Dx: mild optimism, monitor' : ch > -5 ? 'Dx: stable. Flatline is a feature.' : ch > -30 ? 'Dx: seasonal capitulation' : `Dx: discharged against medical advice (${ch.toFixed(0)}%)`;
    row(600, 'SHARE PRICE', P.fmtPrice(p.price || 0)); row(680, 'MARKET CAP', P.fmtUsd(p.mcap || 0), 'roughly one used sedan');
    row(760, 'Δ 24H', (ch > 0 ? '+' : '') + (ch ?? 0).toFixed(1) + '%', dxLine);
    row(840, 'ADMITTED / DISCHARGED · 24H', `${p.txns?.h24?.buys ?? 0} / ${p.txns?.h24?.sells ?? 0}`);
    row(920, 'PATIENTS (HOLDERS)', (h.count || 0).toLocaleString(), `top 10 hold ${(+h.dist?.top_10 || 0).toFixed(1)}%`);
    row(1000, 'LIQUIDITY', P.fmtUsd(p.liq || 0), 'the pill bottle');
    x.fillStyle = '#1d1a15'; x.font = 'italic 26px Georgia, serif'; x.textAlign = 'left'; x.fillText('Attending: Dr. H. Fennwick (honorary). Reviewed by M. Pruitt, Receipts Dept.', 60, 1140);
    x.font = '500 18px "IBM Plex Mono", monospace'; x.fillStyle = '#6b5f4f'; x.fillText('Sources: DexScreener · GeckoTerminal · nothing simulated · not financial or medical advice', 60, 1180);
    x.font = '900 34px Inter, Arial'; x.fillStyle = '#15a7ff'; x.fillText('$PHARMA', 60, 1260); x.font = '500 16px "IBM Plex Mono", monospace'; x.fillStyle = '#6b5f4f'; x.fillText(P.CA, 60, 1292);
    c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `pharma-chart-${new Date().toISOString().slice(0, 10)}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); if (window.PH) PH.toast('Chart printed. Post it with the ticker.'); }, 'image/png');
  };

  /* phone mini bar: price + 24h + last trade, visible once the terminal is above the fold */
  const mini = document.getElementById('irtMini');
  if (mini) {
    const upd = () => { const p = P.state.pair; if (!p) return; mini.querySelector('#miniP').textContent = P.fmtPrice(p.price); const c = p.chg?.h24; mini.querySelector('#miniC').innerHTML = c == null ? '' : `<span class="${c > 0 ? 'up' : c < 0 ? 'dn' : ''}">${c > 0 ? '+' : ''}${(+c).toFixed(1)}% 24h</span>`; const last = P.state.trades.find(t => !t.bot); mini.querySelector('#miniT').textContent = last ? `· last ${last.kind} ${P.ago(last.ts)} ago` : ''; };
    P.on('pair', upd); P.on('trades', upd);
    const io = new IntersectionObserver(es => { const below = T.getBoundingClientRect().bottom < 0; mini.classList.toggle('on', !es[0].isIntersecting && below && !document.querySelector('footer')?.getBoundingClientRect().top < innerHeight); }, { threshold: 0 });
    io.observe(T); addEventListener('scroll', () => { if (!mini.classList.contains('on')) return; const f = document.querySelector('footer'); if (f && f.getBoundingClientRect().top < innerHeight) mini.classList.remove('on'); }, { passive: true });
  }
  /* first paint from whatever PULSE already has, then start */
  P.start();
  setTimeout(() => { nowServing(); ward(); drawEkg(); mood(); }, 400);
  setInterval(() => { nowServing(); mood(); }, 20000);
});

/* THE WARD — the holder census, drawn as a hospital.
   Data: data/holders_snapshot.js (full on-chain census taken at deploy time; every balance, anonymous) + live price from PULSE.
   Check-in uses the public Solana RPC (getTokenAccountsByOwner) for ONE wallet the visitor types. No wallet connect, no signing, no custody. */
document.addEventListener('DOMContentLoaded', () => {
  const H = window.HOLDERS; const root = document.getElementById('ward-sec'); if (!H || !root) return;
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const short = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : '????';
  const hash = s => { let h = 2166136261; for (const c of s || '') { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const fnv = (s, basis) => { let h = basis >>> 0; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
  const hid = o => fnv(o, 2166136261).toString(16).padStart(8, '0') + fnv(o, 0x9747b28c).toString(16).padStart(8, '0');
  const pick = (arr, seed) => arr[seed % arr.length];
  const DX = ['chronic hopium', 'early-onset conviction', 'diamond-hand syndrome', 'receipt deficiency', 'uncontrolled bullposting', 'compulsive footnote reading', 'severe allergy to Big Pharma', 'trust issues (justified)', 'DOJ press release addiction', 'acute FOMO (chronic)', 'low $PHARMA levels (resolved)', 'elevated conviction, monitor'];
  const dec = Math.pow(10, H.decimals || 6), tok = a => a / dec, supply = H.supply;
  const fmtTok = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K' : n.toFixed(n < 10 ? 2 : 0);
  const pct = a => (a / supply * 100);
  const fmtPct = p => p >= 10 ? p.toFixed(1) + '%' : p >= 1 ? p.toFixed(2) + '%' : p >= .01 ? p.toFixed(3) + '%' : p.toExponential(1) + '%';
  const price = () => (window.PULSE && PULSE.state.pair && PULSE.state.pair.price) || 0;
  const usd = n => { if (!price()) return ''; const v = n * price(); return v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'K' : v >= 1 ? '$' + v.toFixed(2) : '$' + v.toFixed(v >= .01 ? 2 : 4); };
  const censusAge = () => { const m = (Date.now() - H.t) / 60000; return m < 60 ? `${m | 0}m ago` : m < 1440 ? `${(m / 60) | 0}h ago` : `${(m / 1440) | 0}d ago`; };
  const ALL = H.all, N = ALL.length, poolIdx = H.top.findIndex(t => t.o === H.pool);

  /* ---------- private rooms (top 20 wallets that aren't the pool) ---------- */
  let roomsOpen = false;
  function rooms() {
    const prev = H.prev && H.prev.top || null, prevT = H.prev && H.prev.t;
    const list = H.top.filter(t => t.o !== H.pool).slice(0, 20), pool = H.top.find(t => t.o === H.pool);
    const status = t => { if (!prev) return `<span class="st new">first census</span>`; const p = prev[t.o]; if (p == null) return `<span class="st new">new admission</span>`; const d = (t.a - p) / dec; if (Math.abs(d) < 1) return `<span class="st">stable</span>`; return d > 0 ? `<span class="st up">+${fmtTok(d)} admitted</span>` : `<span class="st dn">−${fmtTok(-d)} discharged</span>`; };
    const card = (t, i) => `<a class="room" href="https://solscan.io/account/${esc(t.o)}" target="_blank" rel="noopener" title="Public wallet on Solscan"><div class="no"><span>ROOM <b>${101 + i}</b> · #${i + 1} of ${N.toLocaleString()}</span>${status(t)}</div><div class="pt">PATIENT ${esc(short(t.o))}</div><div class="amt">${fmtTok(tok(t.a))}<small>${fmtPct(pct(t.a))} of supply${usd(tok(t.a)) ? ' · ' + usd(tok(t.a)) : ''}</small></div><div class="bar"><i style="width:${Math.min(100, pct(t.a) / pct(list[0].a) * 100)}%"></i></div><div class="dx">Dx: ${esc(pick(DX, hash(t.o)))}</div></a>`;
    $('#rooms').innerHTML = (pool ? `<a class="room pool" href="https://solscan.io/account/${esc(pool.o)}" target="_blank" rel="noopener"><div class="no"><span>ROOM <b>100 · THE DISPENSARY</b> · liquidity pool</span>${status(pool)}</div><div class="pt">PumpSwap pool ${esc(short(pool.o))}</div><div class="amt">${fmtTok(tok(pool.a))}<small>${fmtPct(pct(pool.a))} of supply sits in the pool${usd(tok(pool.a)) ? ' · ' + usd(tok(pool.a)) : ''}</small></div><div class="bar"><i style="width:${pct(pool.a)}%"></i></div><div class="dx">Not a patient. This is the pharmacy itself. It is in every “top 10 holders” stat you have ever read.</div></a>` : '') + list.map(card).join('');
    const top10 = H.top.slice(0, 10).reduce((s, t) => s + t.a, 0), top10x = H.top.filter(t => t.o !== H.pool).slice(0, 10).reduce((s, t) => s + t.a, 0);
    $('#rooms').classList.toggle('collapsed', !roomsOpen); const mb = $('#roomsMore'); if (mb) { mb.style.display = roomsOpen ? 'none' : ''; mb.onclick = () => { roomsOpen = true; rooms(); }; }
    $('#roomsFoot').innerHTML = `<span>census taken ${censusAge()} · full on-chain token-account scan · ${N.toLocaleString()} wallets with a balance</span><span>top 10 hold ${fmtPct(pct(top10))} · without the pool, top 10 wallets hold ${fmtPct(pct(top10x))}${prevT ? ` · movement vs census ${new Date(prevT).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}</span>`;
  }

  /* ---------- the vial wall: one vial per holder, sized by log balance, sorted ---------- */
  const cv = $('#wallCv'), cx = cv.getContext('2d'), tip = $('#wallTip');
  let cells = [], cell = 18, cols = 0, mine = -1, hover = -1;
  const lmin = Math.log10(Math.max(1, tok(ALL[N - 1]))), lmax = Math.log10(tok(ALL[0]));
  function layout() {
    const W = cv.clientWidth; cols = W < 500 ? 34 : W < 900 ? 52 : 68; cell = W / cols; const rows = Math.ceil(N / cols);
    const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = Math.ceil(rows * cell) * dpr; cv.style.height = Math.ceil(rows * cell) + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells = ALL.map((a, i) => ({ i, a, x: (i % cols) * cell, y: Math.floor(i / cols) * cell }));
    draw();
  }
  function vial(x, y, s, fill, glow) {
    const w = s * .46, h = s * .78, bx = x + (s - w) / 2, by = y + (s - h) / 2;
    if (glow) { cx.shadowColor = glow; cx.shadowBlur = s * .9; }
    cx.fillStyle = 'rgba(234,245,255,.14)'; cx.beginPath(); cx.roundRect(bx, by + h * .18, w, h * .82, w * .28); cx.fill();
    cx.fillStyle = fill; cx.beginPath(); cx.roundRect(bx + 1, by + h * .18 + (h * .82) * .25, w - 2, (h * .82) * .75 - 1, w * .25); cx.fill();
    cx.shadowBlur = 0; cx.fillStyle = '#ffcf6b'; cx.fillRect(bx + w * .22, by, w * .56, h * .16);
  }
  function draw() {
    cx.clearRect(0, 0, cv.clientWidth, cv.height); const p = price();
    cells.forEach(c => {
      const t = tok(c.a), f = (Math.log10(Math.max(1, t)) - lmin) / ((lmax - lmin) || 1);
      const s = cell * (.45 + .55 * f), x = c.x + (cell - s) / 2, y = c.y + (cell - s) / 2;
      const isPool = c.i === poolIdx, top = c.i < 21 && !isPool, dust = p && t * p < 1;
      const fill = isPool ? '#ffb84d' : top ? '#ffcf6b' : dust ? 'rgba(117,154,199,.6)' : `hsl(${196 + f * 10} 100% ${55 + f * 15}%)`;
      vial(x, y, s, fill, c.i === mine ? '#ff3b58' : top || isPool ? 'rgba(255,207,107,.8)' : c.i === hover ? '#55d8ff' : null);
      if (c.i === mine) { cx.strokeStyle = '#ff3b58'; cx.lineWidth = 2; cx.strokeRect(c.x + 1, c.y + 1, cell - 2, cell - 2); }
    });
  }
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); const i = Math.floor((e.clientY - r.top) / cell) * cols + Math.floor((e.clientX - r.left) / cell); if (i < 0 || i >= N) { hover = -1; tip.style.opacity = 0; draw(); return; } hover = i; const t = tok(ALL[i]); const label = i === poolIdx ? 'THE DISPENSARY (liquidity pool)' : i === mine ? 'YOU' : `Patient #${i + 1}`; tip.innerHTML = `<b>${label}</b> · ${fmtTok(t)} $PHARMA · ${fmtPct(pct(ALL[i]))}${usd(t) ? ' · ' + usd(t) : ''}${i < 21 && i !== poolIdx ? ' · private room' : ''}`; tip.style.left = (cells[i].x + cell / 2) + 'px'; tip.style.top = (cells[i].y + cv.offsetTop) + 'px'; tip.style.opacity = 1; draw(); });
  cv.addEventListener('pointerleave', () => { hover = -1; tip.style.opacity = 0; draw(); });
  addEventListener('resize', layout); layout();
  function wallHead() {
    const p = price(), dust = p ? ALL.filter(a => tok(a) * p < 1).length : 0, med = tok(ALL[N >> 1]);
    $('#wallH').innerHTML = `<em>${N.toLocaleString()}</em> vials. One per holder.${p ? ` <span style="color:var(--muted);font-weight:700;font-size:1rem">${dust.toLocaleString()} of them are holding less than a dollar.</span>` : ''}`;
    $('#wallSub').textContent = `median patient holds ${fmtTok(med)} $PHARMA${p ? ` (${usd(med)})` : ''} · sized by log balance · gold = private rooms · hover a vial`;
  }
  wallHead();

  /* ---------- check-in desk ---------- */
  const inp = $('#deskIn'), err = $('#deskErr'), chart = $('#pchart');
  const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  const RPCS = ['https://api.mainnet-beta.solana.com'];
  async function balanceOf(owner) {
    const body = { jsonrpc: '2.0', id: 1, method: 'getTokenAccountsByOwner', params: [owner, { mint: PULSE.CA }, { encoding: 'jsonParsed' }] };
    const r = await fetch(RPCS[0], { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('rpc ' + r.status);
    const j = await r.json(); if (j.error) throw new Error(j.error.message || 'rpc error');
    return (j.result.value || []).reduce((s, a) => s + (+a.account.data.parsed.info.tokenAmount.amount || 0), 0);
  }
  function attending(rank, t, v) {
    if (t <= 0) return ['No $PHARMA on record for this wallet. If you bought in the last few hours, the next census will find you. Otherwise: the pharmacy is next door, please take a number.', 'Dx: untreated'];
    if (rank <= 21) return [`Private room. The nurses know your name. You hold more than ${(100 - rank / N * 100).toFixed(1)}% of patients. Please stop asking to see the chart; you are the chart.`, 'Dx: ' + pick(DX, hash('r' + rank))];
    if (rank <= N * .05) return [`Ward A. You hold more $PHARMA than ${(100 - rank / N * 100).toFixed(0)}% of patients. This is either conviction or a decision you have made peace with.`, 'Dx: early-onset conviction'];
    if (rank <= N * .25) return [`Ward B. A respectable dose, above ${(100 - rank / N * 100).toFixed(0)}% of the building. Marjorie looked at your wallet and nodded once.`, 'Dx: chronic hopium, stable'];
    if (!v || v >= 1) return [`General ward. Your bag is worth about ${usd(t) || 'a few dollars'}. Take it with food. Do not operate heavy machinery after reading the Receipts Archive.`, 'Dx: low $PHARMA levels'];
    return [`Hallway gurney. Your holdings round to ${usd(t)}. You are, technically, a shareholder. Technically.`, 'Dx: receipt deficiency'];
  }
  let last = null;
  async function checkIn(addr) {
    err.textContent = ''; addr = (addr || '').trim();
    if (!B58.test(addr)) { err.textContent = 'That is not a Solana address. Paste the public wallet address (not the seed phrase, never the seed phrase).'; return; }
    inp.disabled = true; err.textContent = 'checking the census…';
    try {
      const ci = (H.hs || []).indexOf(hid(addr)); let amt = ci >= 0 ? ALL[ci] : 0, source = ci >= 0 ? `census ${censusAge()}` : `not in the census (${censusAge()})`;
      try { const live = await Promise.race([balanceOf(addr), new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 6000))]); source = 'live · public RPC' + (ci >= 0 && live !== amt ? ` (census had ${fmtTok(tok(amt))})` : ''); amt = live; } catch (e) { if (ci < 0) source = `not in the census (${censusAge()}) · live RPC unavailable right now`; }
      const t = tok(amt), v = price() ? t * price() : 0;
      const rank = amt > 0 ? ALL.filter(a => a > amt).length + 1 : N + 1;
      const [note, dx] = attending(rank, t, v);
      mine = amt > 0 ? Math.min(N - 1, rank - 1) : -1; draw();
      last = { addr, amt, t, v, rank, note, dx };
      chart.innerHTML = `<div class="ph"><b>PHARMA HOLDINGS PLC · PATIENT CHART</b><span>${new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
        <div class="pr"><span>PATIENT</span><b>${esc(short(addr))}</b></div>
        <div class="pr"><span>${amt > 0 ? 'RANK' : 'STATUS'}</span><b class="big">${amt > 0 ? `#${rank.toLocaleString()} <small style="font-size:.5em;color:#6b5f4f">of ${N.toLocaleString()}</small>` : 'NOT ADMITTED'}</b></div>
        <div class="pr"><span>DOSE</span><b>${fmtTok(t)} $PHARMA${v ? ` <small style="font-size:.6em;color:#6b5f4f">≈ ${usd(t)}</small>` : ''}</b></div>
        <div class="pr"><span>SHARE OF SUPPLY</span><b>${amt > 0 ? fmtPct(pct(amt)) : '0%'}</b></div>
        <div class="pr"><span>WARD</span><b>${amt <= 0 ? 'Waiting room' : rank <= 21 ? 'Private room' : rank <= N * .05 ? 'Ward A' : rank <= N * .25 ? 'Ward B' : v >= 1 || !v ? 'General ward' : 'Hallway gurney'}</b></div>
        <div class="att">${esc(note)}<small>${esc(dx)} · The Attending, Dr. H. Fennwick (honorary) · balance: ${esc(source)} · rank vs census of ${N.toLocaleString()}</small></div>
        <div class="pa"><button class="btn primary" id="wristBtn">Print wristband</button><button class="btn" id="shareBtn">Post it</button>${amt <= 0 ? '<a class="btn" data-buy href="#">Fill prescription</a>' : ''}</div>`;
      chart.classList.add('on'); err.textContent = '';
      try { localStorage.setItem('ph:wallet', addr); } catch {}
      $('#wristBtn').onclick = wristband; $('#shareBtn').onclick = () => { const txt = amt > 0 ? `Checked into @PharmaCoinSol. Patient #${rank} of ${N}. ${dx}. The Attending says: "${note.slice(0, 120)}" $PHARMA` : `Went to check into @PharmaCoinSol. Not admitted yet. The pharmacy is next door. $PHARMA`; window.open('https://x.com/intent/post?text=' + encodeURIComponent(txt + ' ' + location.origin + location.pathname + '#ward-sec'), '_blank', 'noopener'); };
      const buy = document.querySelector('a[data-buy][href^="http"]'), mine2 = chart.querySelector('a[data-buy]'); if (buy && mine2) { mine2.href = buy.href; mine2.target = '_blank'; mine2.rel = 'noopener'; }
    } catch (e) { err.textContent = 'Could not check that wallet right now (' + e.message + ').'; }
    inp.disabled = false;
  }
  $('#deskBtn').onclick = () => checkIn(inp.value); inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkIn(inp.value); });
  try { const w = localStorage.getItem('ph:wallet'); if (w) { inp.value = w; $('#deskNote').textContent = 'welcome back · your last check-in is remembered on this device only · press enter to re-check'; } } catch {}

  async function wristband() {
    if (!last) return; await document.fonts.ready;
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1080; const x = c.getContext('2d');
    x.fillStyle = '#0a1424'; x.fillRect(0, 0, 1080, 1080);
    // band
    x.save(); x.translate(540, 540); x.rotate(-.12);
    x.fillStyle = '#f3efe4'; x.beginPath(); x.roundRect(-760, -150, 1520, 300, 24); x.fill();
    x.fillStyle = '#1d1a15'; x.fillRect(-760, -150, 1520, 14);
    for (let i = -700; i < 760; i += 90) { x.fillStyle = 'rgba(29,26,21,.08)'; x.beginPath(); x.arc(i, -112, 9, 0, 7); x.fill(); x.beginPath(); x.arc(i, 112, 9, 0, 7); x.fill(); }
    x.fillStyle = '#1d1a15'; x.font = '900 44px Inter, Arial'; x.textAlign = 'left'; x.fillText('PHARMA HOLDINGS PLC', -500, -60);
    x.font = '500 22px "IBM Plex Mono", monospace'; x.fillStyle = '#6b5f4f'; x.fillText(`PATIENT ${short(last.addr)}  ·  ${new Date().toISOString().slice(0, 10)}  ·  DR. H. FENNWICK (HON.)`, -500, -22);
    x.fillStyle = '#1d1a15'; x.font = '900 72px Inter, Arial'; x.fillText(last.amt > 0 ? `#${last.rank.toLocaleString()} of ${N.toLocaleString()}` : 'NOT ADMITTED', -500, 50);
    x.font = '600 26px "IBM Plex Mono", monospace'; x.fillStyle = '#c4122f'; x.fillText(`${last.dx.toUpperCase()}  ·  ${fmtTok(last.t)} $PHARMA${last.v ? '  ·  ' + usd(last.t) : ''}`, -500, 96);
    // barcode
    let bx = 420; const seed = hash(last.addr); for (let i = 0; i < 28; i++) { const w = 3 + ((seed >> (i % 28)) & 3) * 3; x.fillStyle = '#1d1a15'; x.fillRect(bx, -110, w, 220); bx += w + 4 + (i % 3); }
    x.restore();
    x.fillStyle = '#8ea7c1'; x.font = '500 22px "IBM Plex Mono", monospace'; x.textAlign = 'center'; x.fillText('CHECKED IN AT THE WARD · RANK FROM A FULL ON-CHAIN CENSUS · NOTHING SIMULATED', 540, 900);
    x.fillStyle = '#55d8ff'; x.font = '900 40px Inter, Arial'; x.fillText('$PHARMA', 540, 960); x.fillStyle = '#5d7591'; x.font = '18px "IBM Plex Mono", monospace'; x.fillText(PULSE.CA, 540, 995);
    c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `pharma-wristband-${last.rank}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
  }

  rooms();
  if (window.PULSE) PULSE.on('pair', () => { rooms(); wallHead(); draw(); });
});

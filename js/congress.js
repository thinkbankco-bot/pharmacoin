/* The Floor: Congress drawn to scale by pharmaceutical-PAC contributions (FEC). Data: data/congress.js */
document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc, reduced } = PH;
  const C = window.CONGRESS, X = window.CONGRESS_EXTRA || null;
  const ex = m => (X && X.members && X.members[m.bioguide]) || null;
  const onDrugCommittee = m => !!(ex(m) && (ex(m).committees || []).some(c => c.jurisdiction_flag));
  let committeeOnly = false, voteId = '';
  const VOTE_COL = { Yea: '#22c55e', Aye: '#22c55e', Nay: '#ef4444', No: '#ef4444' };
  const money = n => '$' + Math.round(n).toLocaleString();
  const short = n => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + Math.round(n);
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const PARTY = { D: '#3b82f6', R: '#ef4444', I: '#a855f7' };
  const PNAME = { D: 'Democrat', R: 'Republican', I: 'Independent' };
  const where = m => `${m.party}-${m.state}${m.chamber === 'house' && m.district ? '-' + m.district : ''}`;

  if (!C || !C.members || !C.members.length) { $('#fpending').classList.remove('hidden'); $('#pacs').innerHTML = '<p class="fine">Loads with the data.</p>'; return; }
  $('#cover').textContent = `FEC filings · ${C.coverage || C.cycles.join(' + ')}`;
  if (C.scope) $('#mScope').textContent = C.scope;
  $('#pacs').innerHTML = (C.pacs || []).map(p => `<a href="https://www.fec.gov/data/committee/${encodeURIComponent(p.id)}/" target="_blank" rel="noopener"><b>${esc(p.company)}</b><span>${esc(p.name)} · ${esc(p.id)}</span></a>`).join('');

  /* ---------- Cartoon member ---------- */
  const SKIN = '#f0d2b0';
  function member(ctx, x, y, u, m, w, opts = {}) {
    const h = hash(m.bioguide || m.name), hair = h % 7, glasses = (h >> 3) % 4 === 0, tie = PARTY[m.party] || '#94a3b8';
    ctx.save(); ctx.translate(x, y);
    if (opts.dim) ctx.globalAlpha = .18;
    if (opts.vote) { const vc = VOTE_COL[opts.vote] || '#64748b'; ctx.save(); ctx.globalAlpha *= .9; ctx.fillStyle = vc + '33'; ctx.strokeStyle = vc; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -22 * u, 16 * u * Math.max(1, w * .75), 25 * u, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 12 * u * w, 3 * u, 0, 0, 7); ctx.fill();
    // legs
    ctx.fillStyle = '#111827'; ctx.fillRect(-6 * u, -6 * u, 4.5 * u, 6 * u); ctx.fillRect(1.5 * u, -6 * u, 4.5 * u, 6 * u);
    // body (suit): width grows with money
    const bw = 11 * u * w, bt = -27 * u;
    ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.moveTo(-bw * .8, bt); ctx.quadraticCurveTo(0, bt - 3 * u, bw * .8, bt); ctx.quadraticCurveTo(bw * 1.12, -14 * u, bw, -5 * u); ctx.lineTo(-bw, -5 * u); ctx.quadraticCurveTo(-bw * 1.12, -14 * u, -bw * .8, bt); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-3.6 * u, bt - .5 * u); ctx.lineTo(3.6 * u, bt - .5 * u); ctx.lineTo(0, bt + 9 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = tie; ctx.beginPath(); ctx.moveTo(0, bt); ctx.lineTo(1.6 * u, bt + 2 * u); ctx.lineTo(1.1 * u, bt + 10 * u); ctx.lineTo(0, bt + 12 * u); ctx.lineTo(-1.1 * u, bt + 10 * u); ctx.lineTo(-1.6 * u, bt + 2 * u); ctx.closePath(); ctx.fill();
    // money sticking out of the pocket (top third)
    if (opts.cash) { ctx.fillStyle = '#16a34a'; ctx.fillRect(bw * .35, bt + 6 * u, 3.4 * u, 5 * u); ctx.fillRect(bw * .35 + 2 * u, bt + 5 * u, 3.4 * u, 5 * u); }
    if (opts.pin) { ctx.fillStyle = '#d4a84b'; ctx.beginPath(); ctx.arc(-bw * .45, bt + 5 * u, 2.6 * u, 0, 7); ctx.fill(); ctx.fillStyle = '#1a1204'; ctx.font = `900 ${3 * u}px Inter, Arial`; ctx.textAlign = 'center'; ctx.fillText('Rx', -bw * .45, bt + 6.1 * u); }
    // hands
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(-bw * 1.02, -11 * u, 2.3 * u, 0, 7); ctx.arc(bw * 1.02, -11 * u, 2.3 * u, 0, 7); ctx.fill();
    // head
    const hy = bt - 10 * u;
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, hy, 11 * u, 10 * u, 0, 0, 7); ctx.fill();
    // hair
    ctx.fillStyle = ['#00000000', '#9ca3af', '#6b4423', '#e5e7eb', '#1f2937', '#78350f', '#d4a84b'][hair];
    if (hair) { ctx.beginPath(); ctx.ellipse(0, hy - 5 * u, 11.4 * u, 6 * u, 0, Math.PI, 0); ctx.fill(); if (hair === 5) { ctx.fillRect(-11.6 * u, hy - 5 * u, 4 * u, 11 * u); ctx.fillRect(7.6 * u, hy - 5 * u, 4 * u, 11 * u); } if (hair === 3) { ctx.beginPath(); ctx.ellipse(-4 * u, hy - 9 * u, 7 * u, 3 * u, -.4, 0, 7); ctx.fill(); } }
    // South Park eyes
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-3.6 * u, hy + .5 * u, 3.7 * u, 4.3 * u, 0, 0, 7); ctx.ellipse(3.6 * u, hy + .5 * u, 3.7 * u, 4.3 * u, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-2.4 * u, hy + .8 * u, 1 * u, 0, 7); ctx.arc(2.4 * u, hy + .8 * u, 1 * u, 0, 7); ctx.fill();
    if (glasses) { ctx.strokeStyle = '#111'; ctx.lineWidth = .8 * u; ctx.strokeRect(-7.4 * u, hy - 3 * u, 7 * u, 7 * u); ctx.strokeRect(.4 * u, hy - 3 * u, 7 * u, 7 * u); }
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = .9 * u; ctx.beginPath(); ctx.moveTo(-2.5 * u, hy + 6.5 * u); ctx.quadraticCurveTo(0, hy + (opts.top ? 8.5 : 7.3) * u, 2.5 * u, hy + 6.5 * u); ctx.stroke();
    // top 10: top hat + monocle
    if (opts.top) {
      ctx.fillStyle = '#0b0b0f'; ctx.fillRect(-9 * u, hy - 10.5 * u, 18 * u, 2.4 * u); ctx.fillRect(-6 * u, hy - 22 * u, 12 * u, 12 * u);
      ctx.fillStyle = tie; ctx.fillRect(-6 * u, hy - 13.5 * u, 12 * u, 2 * u);
      ctx.strokeStyle = '#d4a84b'; ctx.lineWidth = .9 * u; ctx.beginPath(); ctx.arc(3.6 * u, hy + .5 * u, 4.4 * u, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(7.6 * u, hy + 2 * u); ctx.lineTo(9 * u, hy + 12 * u); ctx.stroke();
    }
    if (opts.zero) { ctx.fillStyle = '#22c55e'; ctx.font = `800 ${5.5 * u}px "IBM Plex Mono", monospace`; ctx.textAlign = 'center'; ctx.fillText('$0', 0, 5.5 * u); }
    if (opts.hl) { ctx.strokeStyle = '#55d8ff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(0, hy + 6 * u, 16 * u * Math.max(1, w * .8), 26 * u, 0, 0, 7); ctx.stroke(); }
    ctx.restore();
    return { x0: x - bw * 1.2, y0: y + hy - y - 12 * u + y, x1: x + bw * 1.2, y1: y + 2 * u };
  }

  /* ---------- Chamber layout ---------- */
  const cv = $('#floor'), ctx = cv.getContext('2d');
  let chamber = 'senate', seats = [], scale = 1, offX = 0, query = '';
  const list = () => C.members.filter(m => m.chamber === chamber);
  function build() {
    const L = list(), n = L.length, max = Math.max(1, ...L.map(m => m.total));
    const rows = chamber === 'senate' ? 5 : 10, r0 = chamber === 'senate' ? 250 : 210, r1 = 700;
    const radii = Array.from({ length: rows }, (_, i) => r0 + (r1 - r0) * i / (rows - 1));
    const totalLen = radii.reduce((s, r) => s + r, 0), pos = [];
    radii.forEach((r, i) => { const k = Math.round(n * r / totalLen) + (i === rows - 1 ? 0 : 0); for (let j = 0; j < k; j++) { const a = Math.PI * (1.06 + .88 * (j + .5) / k); pos.push({ x: 800 + Math.cos(a) * r, y: 905 + Math.sin(a) * r * .86, r, a }); } });
    while (pos.length < n) { const r = r1 + 40, a = Math.PI * (1.06 + .88 * Math.random()); pos.push({ x: 800 + Math.cos(a) * r, y: 905 + Math.sin(a) * r * .86, r, a }); }
    pos.length = n; pos.sort((p, q) => p.a - q.a);
    const order = ['D', 'I', 'R'], groups = order.map(pt => L.filter(m => (m.party === pt) || (pt === 'I' && !['D', 'R'].includes(m.party))).sort((a, b) => b.total - a.total));
    seats = []; let k = 0;
    const top10 = new Set([...L].sort((a, b) => b.total - a.total).slice(0, 10).filter(m => m.total > 0).map(m => m.bioguide));
    for (const g of groups) {
      const chunk = pos.slice(k, k + g.length).sort((p, q) => p.r - q.r); k += g.length;
      g.forEach((m, i) => { const p = chunk[i]; const f = Math.sqrt(m.total / max); seats.push({ m, x: p.x, y: p.y, u: (chamber === 'senate' ? 1.8 : 1.0) * (0.9 + p.r / 2600), w: .78 + 4.4 * f, top: top10.has(m.bioguide), cash: f > .55, zero: m.total === 0, box: null }); });
    }
    seats.sort((a, b) => a.y - b.y);
    const took = L.filter(m => m.total > 0).length;
    $('#sTotal').textContent = short(L.reduce((s, m) => s + m.total, 0));
    $('#sTook').textContent = `${took} of ${n}`;
    $('#sZero').textContent = n - took;
    renderLists(L, top10);
    draw();
  }
  function resize() {
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr; scale = h / 900; offX = (w / scale - 1600) / 2;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * scale * offX, 0); draw();
  }
  function room() {
    const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#0b1222'); g.addColorStop(1, '#141d33'); ctx.fillStyle = g; ctx.fillRect(-offX, 0, 1600 + offX * 2, 900);
    // carpet arcs
    for (let i = 0; i < 12; i++) { ctx.strokeStyle = i % 2 ? 'rgba(59,130,246,.06)' : 'rgba(239,68,68,.05)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.ellipse(800, 905, 200 + i * 52, (200 + i * 52) * .86, 0, Math.PI, 2 * Math.PI); ctx.stroke(); }
    // back wall columns + gallery
    ctx.fillStyle = 'rgba(148,163,184,.08)'; for (let x = 40; x < 1600; x += 120) ctx.fillRect(x, 0, 26, 150);
    ctx.fillStyle = 'rgba(212,175,55,.5)'; ctx.font = '900 30px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText(chamber === 'senate' ? 'THE SENATE' : 'THE HOUSE', 800, 70);
    ctx.font = '600 13px "IBM Plex Mono", monospace'; ctx.fillStyle = 'rgba(212,175,55,.45)'; ctx.fillText('SIZE = DIRECT CONTRIBUTIONS FROM PHARMACEUTICAL-COMPANY PACS (FEC)', 800, 96);
    // dais
    ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.roundRect(640, 820, 320, 80, 10); ctx.fill(); ctx.fillStyle = '#5b4128'; ctx.fillRect(660, 834, 280, 10);
    ctx.fillStyle = '#d4a84b'; ctx.font = '800 14px "IBM Plex Mono", monospace'; ctx.fillText('THE ROSTRUM', 800, 875);
  }
  function draw() {
    if (!seats.length) return;
    room();
    const q = query.toLowerCase().trim();
    for (const s of seats) {
      const hit = q && (s.m.name.toLowerCase().includes(q) || s.m.state.toLowerCase() === q || where(s.m).toLowerCase().includes(q));
      const cm = onDrugCommittee(s.m), v = voteId && ex(s.m) ? (ex(s.m).votes || {})[voteId] : null;
      s.box = member(ctx, s.x, s.y, s.u, s.m, s.w, { top: s.top, cash: s.cash, zero: s.zero, pin: cm, vote: voteId ? (v || 'Not in office') : null, dim: (q && !hit) || (committeeOnly && !cm) || (voteId && (!v || v === 'Not in office')), hl: hit });
    }
    $('#fcount').textContent = q ? `${seats.filter(s => s.m.name.toLowerCase().includes(q) || s.m.state.toLowerCase() === q || where(s.m).toLowerCase().includes(q)).length} match` : `${seats.length} members`;
  }

  /* ---------- Lists ---------- */
  function portrait(m, top) {
    const c = document.createElement('canvas'); c.width = 160; c.height = 170; const x = c.getContext('2d');
    member(x, 80, 160, 2.5, m, .78 + 4.4 * Math.sqrt(m.total / Math.max(1, ...list().map(z => z.total))), { top, cash: top });
    return c;
  }
  function renderLists(L, top10) {
    const top = [...L].sort((a, b) => b.total - a.total).slice(0, 10);
    const cz = $('#caucus'); cz.innerHTML = '';
    top.forEach((m, i) => { const a = document.createElement('button'); a.className = 'cat'; a.innerHTML = `<span class="cat-rank">#${i + 1}</span><span class="cat-art"></span><b>${esc(m.name)}</b><span class="cat-w" style="color:${PARTY[m.party]}">${where(m)}</span><span class="cat-amt">${money(m.total)}</span>`; $('.cat-art', a).append(portrait(m, top10.has(m.bioguide))); a.onclick = () => open(m); cz.append(a); });
    const zs = L.filter(m => m.total === 0).sort((a, b) => a.state.localeCompare(b.state));
    $('#zero').innerHTML = zs.length ? zs.map(m => `<button class="zchip" data-b="${esc(m.bioguide)}"><i style="background:${PARTY[m.party]}"></i>${esc(m.name)} <span>${where(m)}</span></button>`).join('') : '<p class="fine">Nobody in this chamber is in the $0 Club for the period covered.</p>';
    $$('.zchip').forEach(b => b.onclick = () => open(C.members.find(m => m.bioguide === b.dataset.b)));
  }

  /* ---------- Interaction ---------- */
  const tip = $('#ftip');
  const pick = ev => { const rc = cv.getBoundingClientRect(), mx = (ev.clientX - rc.left) / scale - offX, my = (ev.clientY - rc.top) / scale; for (let i = seats.length - 1; i >= 0; i--) { const b = seats[i].box; if (b && mx >= b.x0 && mx <= b.x1 && my >= b.y0 && my <= b.y1) return seats[i]; } return null; };
  function showTip(s, ev) {
    const m = s.m;
    tip.innerHTML = `<b>${esc(m.name)}</b><small style="color:${PARTY[m.party]}">${PNAME[m.party] || m.party} · ${where(m)}</small><div class="ft-amt">${money(m.total)}</div><div class="ft-sub">from pharma PACs · ${m.n || 0} contributions</div>${(m.top || []).slice(0, 3).map(t => `<div class="ft-row"><span>${esc(t.company)}</span><b>${short(t.amount)}</b></div>`).join('')}${onDrugCommittee(m) ? '<div class="ft-sub" style="color:#d4a84b;margin-top:6px">Rx pin: sits on a committee that writes drug-pricing law</div>' : ''}${voteId && ex(m) ? `<div class="ft-row"><span>${esc((X.votes.find(v => v.id === voteId) || {}).title || '')}</span><b style="color:${VOTE_COL[(ex(m).votes || {})[voteId]] || '#94a3b8'}">${esc((ex(m).votes || {})[voteId] || 'Not in office')}</b></div>` : ''}<div class="ft-sub" style="margin-top:6px">Click for the full record</div>`;
    const rc = $('#chamber').getBoundingClientRect(); tip.classList.remove('hidden');
    let x = ev.clientX - rc.left + 14, y = ev.clientY - rc.top + 14;
    if (x + tip.offsetWidth > rc.width) x -= tip.offsetWidth + 28; if (y + tip.offsetHeight > rc.height) y = rc.height - tip.offsetHeight - 8;
    tip.style.transform = `translate(${x}px,${y}px)`;
  }
  cv.addEventListener('pointermove', ev => { const s = pick(ev); cv.style.cursor = s ? 'pointer' : 'default'; s ? showTip(s, ev) : tip.classList.add('hidden'); });
  cv.addEventListener('pointerleave', () => tip.classList.add('hidden'));
  cv.addEventListener('click', ev => { const s = pick(ev); if (s) open(s.m); });

  const dlg = $('#mdlg');
  function open(m) {
    if (!m) return;
    const cyc = Object.entries(m.by_cycle || {}).map(([k, v]) => `<div><span>${esc(k)} cycle</span><b>${money(v)}</b></div>`).join('');
    $('#mem').innerHTML = `<button class="pi-x" aria-label="Close">×</button>
      <div class="mem-top">
        <div class="mem-ph"><img src="https://unitedstates.github.io/images/congress/225x275/${encodeURIComponent(m.bioguide)}.jpg" alt="Official portrait of ${esc(m.name)}" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='https://bioguide.congress.gov/bioguide/photo/${encodeURIComponent(m.bioguide[0])}/${encodeURIComponent(m.bioguide)}.jpg'}else{this.remove()}" referrerpolicy="no-referrer"></div>
        <div><div class="pi-kick">PUBLIC RECORD · ${m.chamber === 'senate' ? 'U.S. SENATE' : 'U.S. HOUSE'}</div><h2 id="mName">${esc(m.name)}</h2><div class="pi-meta" style="color:${PARTY[m.party]}">${PNAME[m.party] || m.party} · ${where(m)}</div>
        <div class="mem-total">${money(m.total)}<small>direct contributions from pharmaceutical-company PACs · ${esc(C.coverage || '')}</small></div></div>
      </div>
      <div class="mem-grid"><div><h4>By cycle</h4><div class="mem-kv">${cyc || '<p>None recorded.</p>'}</div></div>
        <div><h4>Top contributing PACs (by company)</h4><div class="mem-kv">${(m.top || []).map(t => `<div><span>${esc(t.company)}</span><b>${money(t.amount)}</b></div>`).join('') || '<p>None recorded. $0 Club.</p>'}</div></div></div>
      ${ex(m) ? `<div class="mem-grid"><div><h4>Committees ${ex(m).since ? '· in this chamber since ' + esc(ex(m).since) : ''}</h4><div class="mem-kv">${(ex(m).committees || []).map(c => `<div><span>${esc(c.name)}</span><b>${c.jurisdiction_flag ? '<span style="color:#a16207">writes drug law</span>' : ''}</b></div>`).join('') || '<p>None listed.</p>'}</div></div>
        <div><h4>Drug-pricing votes</h4><div class="mem-kv">${(X.votes || []).filter(v => v.chamber === m.chamber).map(v => { const r = (ex(m).votes || {})[v.id] || 'Not in office'; return `<div title="${esc(v.what)}"><span><a href="${esc(v.url)}" target="_blank" rel="noopener" style="color:inherit">${esc(v.title)}</a><br><small style="color:#6b7280">${esc(v.date)} · ${esc(v.what)}</small></span><b style="color:${r === 'Yea' || r === 'Aye' ? '#15803d' : r === 'Nay' || r === 'No' ? '#b91c1c' : '#6b7280'}">${esc(r)}</b></div>`; }).join('') || '<p>No tracked votes in this chamber.</p>'}</div></div></div>` : ''}
      <p class="mem-note"><b>Context:</b> PAC contributions are legal and publicly disclosed. A contribution is not a bribe and doesn’t prove anything about a vote. This counts only direct contributions from the drug-company PACs listed on this page; it excludes individual employee donations, lobbying, super PACs and leadership PACs.</p>
      <div class="pi-foot"><span>SOURCE: FEDERAL ELECTION COMMISSION</span><span class="actions" style="gap:8px">${(m.fec || []).slice(0, 2).map(id => `<a class="btn" href="https://www.fec.gov/data/candidate/${encodeURIComponent(id)}/" target="_blank" rel="noopener">FEC record ${esc(id)} ↗</a>`).join('')}</span></div>`;
    $('.pi-x', dlg).onclick = () => dlg.close();
    if (!dlg.open) dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  function filterBar() {
    const fb = $('#ffilters'); if (!fb) return;
    if (!X) { fb.innerHTML = '<span class="fine">Committee and vote layers load with the extra data.</span>'; return; }
    const votes = (X.votes || []).filter(v => v.chamber === chamber);
    fb.innerHTML = `<button class="chip ${committeeOnly ? 'on' : ''}" id="fCom">Rx pin: drug-law committees</button>
      <label class="vote-pick">Color by vote <select id="fVote"><option value="">— none —</option>${votes.map(v => `<option value="${esc(v.id)}" ${v.id === voteId ? 'selected' : ''}>${esc(v.date.slice(0, 4))} · ${esc(v.title)}</option>`).join('')}</select></label>
      <span class="vote-key"><i style="background:#22c55e"></i>Yea <i style="background:#ef4444"></i>Nay <i style="background:#64748b"></i>other</span>
      <span class="fine" id="fVoteWhat"></span>`;
    $('#fCom').onclick = () => { committeeOnly = !committeeOnly; filterBar(); draw(); };
    $('#fVote').onchange = e => { voteId = e.target.value; const v = votes.find(z => z.id === voteId); $('#fVoteWhat').textContent = v ? v.what + ' · result: ' + v.result : ''; draw(); };
    const v = votes.find(z => z.id === voteId); if (v) $('#fVoteWhat').textContent = v.what + ' · result: ' + v.result;
  }
  /* Your delegation */
  const states = [...new Set(C.members.map(m => m.state))].sort();
  $('#dState').innerHTML = '<option value="">Pick your state…</option>' + states.map(st => `<option>${st}</option>`).join('');
  $('#dState').onchange = e => {
    const st = e.target.value, out = $('#dList');
    if (!st) { out.innerHTML = ''; return; }
    const ms = C.members.filter(m => m.state === st).sort((a, b) => (a.chamber === b.chamber ? b.total - a.total : a.chamber === 'senate' ? -1 : 1));
    out.innerHTML = ms.map(m => { const xm = ex(m); const vs = xm && X ? (X.votes || []).filter(v => v.chamber === m.chamber).map(v => (xm.votes || {})[v.id]).filter(r => r === 'Yea' || r === 'Nay').length : 0;
      return `<button class="dcard" data-b="${esc(m.bioguide)}"><span class="dc-ch">${m.chamber === 'senate' ? 'Senator' : 'Rep · ' + (m.district ? 'District ' + m.district : 'At-large')}</span><b>${esc(m.name)}</b><span style="color:${PARTY[m.party]}">${PNAME[m.party] || m.party}</span><span class="dc-amt">${money(m.total)}</span><span class="dc-sub">${onDrugCommittee(m) ? 'Rx pin · drug-law committee · ' : ''}${vs} tracked votes</span></button>`; }).join('');
    $$('.dcard').forEach(c => c.onclick = () => open(C.members.find(m => m.bioguide === c.dataset.b)));
  };
  $$('[data-ch]').forEach(b => b.onclick = () => { chamber = b.dataset.ch; voteId = ''; $$('[data-ch]').forEach(x => x.classList.toggle('on', x === b)); build(); filterBar(); });
  $('#fq').addEventListener('input', e => { query = e.target.value; draw(); });
  addEventListener('resize', resize);
  resize(); build(); filterBar();
});

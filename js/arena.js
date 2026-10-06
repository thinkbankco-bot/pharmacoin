/* Boss Raid: masked raiders (from the Decile Report) vs. a ladder of real drugmakers.
   Each boss's HP is that company's market cap (dated snapshot, data/targets.js); the damage is $PHARMA's live market cap.
   Companies we hold receipts on get the evil statue; companies with no record are neutral scoreboard markers.
   Logical scene is 1600x900; on narrow screens we scale by height and crop the sides. */
document.addEventListener('DOMContentLoaded', () => {
  const { $, esc, reduced } = PH;
  const DMG_PER_IMPACT = 100;
  const LEVELS = [
    { min: 0, title: 'Intern', blurb: 'Hoodie, mask, a dream.' },
    { min: 10, title: 'Pharmacy Tech', blurb: 'Issued safety goggles. Uses them.' },
    { min: 30, title: 'Resident', blurb: 'White coat. Stethoscope. Sleep debt.' },
    { min: 75, title: 'Attending', blurb: 'Carries the chart. Reads the footnotes.' },
    { min: 150, title: 'Chief of Medicine', blurb: 'Cape privileges unlocked.' },
    { min: 300, title: 'The Relator', blurb: 'Red cape. Megaphone. Knows the False Claims Act by heart.' },
    { min: 600, title: 'Decile 10 Legend', blurb: 'Gold mask. The boss has heard of you.' },
  ];
  const lvOf = s => LEVELS.reduce((l, L, i) => s >= L.min ? i + 1 : l, 1);
  const HOODIES = ['#1e3a5f', '#3b1f4a', '#123b33', '#4a2a12', '#2b2f3a', '#5a1726', '#14324a', '#2d2a12', '#1f2f5a', '#3a1f2f'];
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n));

  /* ---------- Data: real board, or a clearly labeled preview ---------- */
  const D = window.PRESCRIBERS;
  let raiders, preview = false;
  if (D && D.board && D.board.length) {
    raiders = D.board.map(r => ({ ...r }));
  } else {
    preview = true;
    raiders = Array.from({ length: 64 }, (_, i) => {
      const s = Math.round(900 / Math.pow(i + 1, 1.05) + (i * 37 % 11));
      return { handle: `preview_${String(i + 1).padStart(2, '0')}`, name: `Simulated raider ${i + 1}`, avatar: '', score: s, scripts: Math.max(1, Math.round(s / 6)), refills: Math.max(1, Math.round(s / 25)), reach: s * 310, rank: i + 1, decile: 10 - Math.min(9, Math.floor(i / 64 * 10)), best: null };
    });
    $('#previewFlag').classList.remove('hidden');
    $('#raidMode').textContent = 'preview mode';
  }
  raiders.forEach(r => { r.lv = lvOf(r.score); const h = hash(r.handle); r.hoodie = HOODIES[h % HOODIES.length]; r.acc = (h >> 4) % 5; r.phase = (h % 628) / 100; r.dmg = r.score * DMG_PER_IMPACT; });
  /* ---------- The ladder ---------- */
  const RX = Object.fromEntries((window.RECEIPTS || []).map(r => [r.id, r]));
  const short = c => String(c).split(/[,(/]/)[0].trim();
  const usd = n => PH.fmtMoney(n);
  const TIER = { micro: 'Microcap', small: 'Small cap', mid: 'Mid cap', giant: 'Big Pharma', fine: 'Fine' };
  let BOSSES, MODE = 'mcap';
  if (window.TARGETS && window.TARGETS.targets && window.TARGETS.targets.length) {
    BOSSES = window.TARGETS.targets.map(t => ({ short: t.short || short(t.name), name: t.name, ticker: t.ticker, value: t.market_cap, tier: t.tier, receipts: (t.receipts || []).filter(id => RX[id]), blurb: t.blurb || '', date: t.price_date || window.TARGETS.generated }));
  } else { // fallback until the market-cap snapshot exists: the Fine Flip ladder
    MODE = 'fine';
    const LADDER = ['baycol-2007-states-8m', 'novartis-2020-copay-foundations', 'sanofi-2012-hyalgan', 'teva-2023-price-fixing-dpa', 'mylan-2017-epipen-rebates', 'amgen-2012-aranesp', 'lilly-2009-zyprexa', 'pfizer-2009-bextra', 'gsk-2012-3-billion', 'purdue-2020-guilty-plea', 'distributors-jnj-2022-26b'];
    BOSSES = LADDER.map(id => RX[id]).filter(Boolean).map(r => ({ short: short(r.company), name: r.title, ticker: String(r.year), value: r.amount_usd, tier: 'fine', receipts: [r.id], blurb: r.fact, date: String(r.year) }));
  }
  BOSSES.forEach(b => b.evil = b.receipts.length > 0);
  const S = { mcap: null, idx: 0, pct: 1, phase: 0 };
  const PHASES = ['Phase 1: Smug', 'Phase 2: Cracking', 'Phase 3: Lawyers Deployed', 'Phase 4: Settlement Mode'];
  const QUOTE_SETS = [
    ['We take your concerns very seriously.', 'This statue was paid for by a settlement.', 'Our lobbyists will be in touch.', 'No wrongdoing admitted. See stamp.', 'Allegedly.'],
    ['That’s just patina.', 'Legal says I can’t comment.', 'Bronze is a very resilient metal.', 'Is it warm in here?'],
    ['My attorneys would like a word.', 'Let’s discuss this in arbitration.', 'Those receipts are taken out of context.', 'Objection!'],
    ['Fine. FINE. Name a number.', 'We will pay it over 18 years.', 'Without admitting liability…', 'Please stop posting.'],
  ];
  const NEUTRAL_QUOTES = ['I am just a market cap.', 'Please direct complaints to the companies with receipts.', 'Q3 targets: survive.', 'I have no comment and no settlements.'];
  let QUOTES = QUOTE_SETS[0];
  $('#hRaiders').textContent = raiders.length.toLocaleString();
  $('#hScripts').textContent = fmt(raiders.reduce((s, r) => s + r.scripts, 0));
  function setBoss() {
    const m = S.mcap;
    if (m) { const i = BOSSES.findIndex(b => b.value > m); S.idx = i < 0 ? BOSSES.length - 1 : i; S.pct = i < 0 ? 0 : (BOSSES[S.idx].value - m) / BOSSES[S.idx].value; }
    else { S.idx = 0; S.pct = 1; }
    S.phase = S.pct > .75 ? 0 : S.pct > .5 ? 1 : S.pct > .25 ? 2 : 3;
    QUOTES = BOSSES[S.idx].evil ? QUOTE_SETS[S.phase] : NEUTRAL_QUOTES;
    const b = BOSSES[S.idx], final = S.idx === BOSSES.length - 1, num = String(S.idx + 1).padStart(2, '0');
    $('#bossName').textContent = `${final ? 'FINAL BOSS' : 'FLOOR ' + num} · ${b.short}${MODE === 'mcap' ? ' (' + b.ticker + ')' : ''}`;
    $('#bossSub').textContent = MODE === 'mcap' ? `${TIER[b.tier]} · market cap ${usd(b.value)} as of ${b.date}` : `${b.name} (${b.ticker})`;
    $('#phaseName').textContent = b.evil ? PHASES[S.phase] : 'No receipts on file';
    $('#hpText').textContent = m ? `HP ${usd(Math.max(0, b.value - m))} / ${usd(b.value)} · flipped ${((1 - S.pct) * 100).toFixed(S.pct > .99 ? 3 : 1)}%` : `HP ${usd(b.value)} · market data offline`;
    $('#hDamage').textContent = m ? usd(m) : '—';
    $('#hFlipped').textContent = `${S.idx}/${BOSSES.length}`;
    requestAnimationFrame(() => $('#hpFill').style.width = (S.pct * 100) + '%');
    // ladder, grouped by tier
    let html = '', lastTier = '';
    BOSSES.forEach((x, i) => {
      if (x.tier !== lastTier) { html += `<span class="lad-tier">${TIER[x.tier] || ''}</span>`; lastTier = x.tier; }
      const st = i < S.idx ? 'down' : i === S.idx ? 'now' : 'locked';
      const prog = i === S.idx && m ? Math.min(100, m / x.value * 100) : i < S.idx ? 100 : 0;
      html += `<button class="lad ${st} ${x.evil ? 'evil' : ''}" data-i="${i}" title="${esc(x.name)}"><b>${i === BOSSES.length - 1 ? 'FINAL' : String(i + 1).padStart(2, '0')}${x.evil ? ' · ' + x.receipts.length + ' receipt' + (x.receipts.length > 1 ? 's' : '') : ''}</b><span>${esc(x.short)}</span><i>${usd(x.value)}</i><em style="width:${prog}%"></em></button>`;
    });
    $('#ladderStrip').innerHTML = html;
    document.querySelectorAll('.lad').forEach(el => el.onclick = () => dossier(+el.dataset.i));
    dossier(S.idx);
    // flip celebration when a boss fell since the last visit
    if (m) { let seen = -1; try { seen = +(localStorage.getItem('ph_boss_seen') ?? -1); } catch {} if (seen >= 0 && S.idx > seen) flipBanner(BOSSES[S.idx - 1]); try { localStorage.setItem('ph_boss_seen', S.idx); } catch {} }
  }
  function dossier(i) {
    const b = BOSSES[i], m = S.mcap, need = m ? b.value / m : null;
    const rec = b.receipts.map(id => RX[id]).filter(Boolean);
    $('#dossier').innerHTML = `<div class="dz-head"><div><div class="kicker">${i === S.idx ? 'Current boss' : i < S.idx ? 'Flipped' : 'Upcoming'} · ${i === BOSSES.length - 1 ? 'final boss' : 'floor ' + String(i + 1).padStart(2, '0')}</div>
        <h3>${esc(b.name)} ${MODE === 'mcap' ? `<small>${esc(b.ticker)}</small>` : ''}</h3><p>${esc(b.blurb)}</p></div>
        <div class="dz-stats"><div><b>${usd(b.value)}</b><span>${MODE === 'mcap' ? 'market cap · ' + esc(b.date) : 'the fine'}</span></div>
        <div><b>${need ? (need >= 10 ? Math.round(need).toLocaleString() : need.toFixed(1)) + '×' : '—'}</b><span>$PHARMA growth needed</span></div></div></div>
      ${rec.length ? `<div class="dz-rec"><div class="kicker" style="margin-bottom:10px">On file at the Receipts Department</div>${rec.map(r => `<a href="${esc(r.source_url)}" target="_blank" rel="noopener"><b>${esc(r.year)}</b> ${esc(r.title)} <span>${r.amount_usd ? usd(r.amount_usd) : ''} · ${esc(r.source_name)} ↗</span></a>`).join('')}</div>`
        : `<p class="dz-none">No receipts on file. This company is a scoreboard marker, not an accusation: a market cap to beat on the way up.</p>`}`;
  }
  function flipBanner(b) {
    const el = document.createElement('div'); el.className = 'flip-banner';
    el.innerHTML = `<span class="stamp v">FLIPPED</span><b>${esc(b.short)}</b><small>$PHARMA’s market cap passed ${usd(b.value)}</small>`;
    $('#stage').append(el); setTimeout(() => el.classList.add('on'), 50); setTimeout(() => el.remove(), 6500);
  }
  document.addEventListener('ph:mcap', e => { S.mcap = e.detail && e.detail.mcap ? e.detail.mcap : null; setBoss(); });
  setBoss();

  /* ---------- Mask (same vector as the brand logo) ---------- */
  const MP = {
    face: new Path2D('M46 14h128l24 48c-5 49-34 83-88 102C56 145 27 111 22 62L46 14Z'),
    brows: new Path2D('M57 58c18-14 36-15 55-2M108 56c19-13 38-12 55 2'),
    eyes: new Path2D('M66 75c17-12 30-12 43 0-14 8-28 8-43 0ZM115 75c15-12 29-12 43 0-14 8-28 8-43 0Z'),
    nose: new Path2D('M110 76c-10 24-12 37 0 44 12-7 10-20 0-44Z'),
    stache: new Path2D('M62 116c23 8 41 7 48-4 7 11 25 12 48 4-9 19-28 26-48 12-20 14-39 7-48-12ZM93 137c12 10 22 10 34 0-3 18-9 26-17 28-8-2-14-10-17-28Z'),
  };
  function mask(ctx, cx, cy, w, gold) {
    const s = w / 220;
    ctx.save(); ctx.translate(cx - 110 * s, cy - 88 * s); ctx.scale(s, s);
    ctx.fillStyle = gold ? '#f6d77a' : '#eaf5ff'; ctx.fill(MP.face);
    ctx.lineWidth = 5; ctx.strokeStyle = gold ? '#8a6a12' : '#0b1220'; ctx.stroke(MP.face);
    ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = '#0b1220'; ctx.stroke(MP.brows);
    ctx.fillStyle = '#0b1220'; ctx.fill(MP.eyes); ctx.globalAlpha = .8; ctx.fill(MP.nose); ctx.globalAlpha = 1; ctx.fill(MP.stache);
    ctx.restore();
  }

  /* ---------- Raider ---------- */
  function raider(ctx, x, y, h, r, t, atk = 0) {
    const u = h / 100, lv = r.lv, bob = reduced ? 0 : Math.sin(t * 2.2 + r.phase) * 1.4 * u;
    ctx.save(); ctx.translate(x, y);
    // shadow + aura
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(0, 0, 24 * u, 5 * u, 0, 0, 7); ctx.fill();
    if (lv >= 7) { const g = ctx.createRadialGradient(0, -55 * u, 5 * u, 0, -55 * u, 70 * u); g.addColorStop(0, 'rgba(246,215,122,.35)'); g.addColorStop(1, 'rgba(246,215,122,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -55 * u, 70 * u, 0, 7); ctx.fill(); }
    ctx.translate(0, bob);
    // cape
    if (lv >= 5) {
      const sw = reduced ? 0 : Math.sin(t * 1.6 + r.phase) * 4 * u;
      ctx.fillStyle = lv >= 7 ? '#b8932f' : lv === 6 ? '#c81d3a' : '#0e7fb8';
      ctx.beginPath(); ctx.moveTo(-20 * u, -62 * u); ctx.quadraticCurveTo(-36 * u + sw, -30 * u, -32 * u + sw, -4 * u); ctx.lineTo(32 * u + sw, -4 * u); ctx.quadraticCurveTo(36 * u + sw, -30 * u, 20 * u, -62 * u); ctx.closePath(); ctx.fill();
    }
    // legs
    ctx.fillStyle = '#0a0f1a'; ctx.fillRect(-12 * u, -30 * u, 9 * u, 30 * u); ctx.fillRect(3 * u, -30 * u, 9 * u, 30 * u);
    // hood behind head
    ctx.fillStyle = r.hoodie; ctx.beginPath(); ctx.arc(0, -80 * u, 21 * u, 0, 7); ctx.fill();
    // torso
    ctx.beginPath(); ctx.moveTo(-22 * u, -63 * u); ctx.quadraticCurveTo(0, -68 * u, 22 * u, -63 * u); ctx.lineTo(17 * u, -27 * u); ctx.lineTo(-17 * u, -27 * u); ctx.closePath(); ctx.fill();
    // white coat (Resident+)
    if (lv >= 3) {
      ctx.fillStyle = '#e9eef5';
      ctx.beginPath(); ctx.moveTo(-23 * u, -63 * u); ctx.lineTo(-5 * u, -63 * u); ctx.lineTo(-4 * u, -14 * u); ctx.lineTo(-21 * u, -14 * u); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(23 * u, -63 * u); ctx.lineTo(5 * u, -63 * u); ctx.lineTo(4 * u, -14 * u); ctx.lineTo(21 * u, -14 * u); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.6 * u; ctx.beginPath(); ctx.moveTo(-9 * u, -62 * u); ctx.quadraticCurveTo(-12 * u, -45 * u, -3 * u, -42 * u); ctx.stroke();
      ctx.beginPath(); ctx.arc(-3 * u, -41 * u, 2.2 * u, 0, 7); ctx.fillStyle = '#94a3b8'; ctx.fill();
    }
    // arms: left at rest, right throws on attack
    const ex = 20 * u, ey = -60 * u, rest = [21 * u, -36 * u], up = [24 * u, -96 * u];
    const k = Math.sin(Math.min(atk, 1) * Math.PI);
    const hx = rest[0] + (up[0] - rest[0]) * k, hy = rest[1] + (up[1] - rest[1]) * k;
    ctx.strokeStyle = lv >= 3 ? '#e9eef5' : r.hoodie; ctx.lineWidth = 7 * u; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-ex, ey); ctx.lineTo(-21 * u, -36 * u); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#0b1220'; ctx.beginPath(); ctx.arc(-21 * u, -35 * u, 3.6 * u, 0, 7); ctx.arc(hx, hy, 3.6 * u, 0, 7); ctx.fill();
    // gear by level / accessory by handle
    if (lv === 4) { ctx.fillStyle = '#d6c7a1'; ctx.fillRect(-30 * u, -46 * u, 12 * u, 16 * u); ctx.fillStyle = '#6b6252'; ctx.fillRect(-27 * u, -48 * u, 6 * u, 3 * u); }
    if (lv === 6) { ctx.fillStyle = '#eaf5ff'; ctx.beginPath(); ctx.moveTo(-22 * u, -38 * u); ctx.lineTo(-38 * u, -50 * u); ctx.lineTo(-36 * u, -30 * u); ctx.closePath(); ctx.fill(); }
    if (lv < 4 && r.acc === 1) { ctx.fillStyle = '#f3efe4'; ctx.fillRect(-27 * u, -44 * u, 8 * u, 14 * u); }
    if (lv < 4 && r.acc === 3) { ctx.fillStyle = 'rgba(85,216,255,.7)'; ctx.beginPath(); ctx.roundRect(-31 * u, -46 * u, 9 * u, 19 * u, 4.5 * u); ctx.fill(); }
    if (r.acc === 4) { ctx.fillStyle = '#ff3b58'; ctx.fillRect(6 * u, -52 * u, 6 * u, 8 * u); }
    // head
    mask(ctx, 0, -80 * u, 36 * u, lv >= 7);
    if (lv === 2) { ctx.fillStyle = 'rgba(85,216,255,.85)'; ctx.fillRect(-15 * u, -88 * u, 30 * u, 4 * u); }
    if (lv >= 7 && !reduced) { ctx.fillStyle = '#fff3c4'; for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1 + r.phase; ctx.beginPath(); ctx.arc(Math.cos(a) * 30 * u, -60 * u + Math.sin(a * 1.3) * 30 * u, 1.6 * u, 0, 7); ctx.fill(); } }
    ctx.restore();
    return { x0: x - 26 * u, y0: y - 100 * u, x1: x + 26 * u, y1: y + 4 * u };
  }

  /* ---------- Boss: a bronze statue of the evil pill creature, on a plaque naming the fine ---------- */
  const CRACKS = Array.from({ length: 16 }, (_, i) => {
    let x = -70 + ((i * 53) % 140), y = -315 + ((i * 97) % 250); const pts = [[x, y]];
    for (let k = 0; k < 6; k++) { x += ((i * 31 + k * 17) % 44) - 22; y += 12 + ((i * 13 + k * 7) % 20); pts.push([x, y]); }
    return pts;
  });
  const bronze = (ctx, x0, y0, x1, y1) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#4a2c12'); g.addColorStop(.32, '#a8692f'); g.addColorStop(.52, '#e8ad66'); g.addColorStop(.72, '#97592a'); g.addColorStop(1, '#3a220c'); return g; };
  function boss(ctx, t, hit) {
    const b = BOSSES[S.idx]; if (!b) return;
    const dmg = 1 - S.pct, bob = reduced ? 0 : Math.sin(t * 1.1) * 2, shake = hit > 0 ? (Math.random() - .5) * 5 * hit : 0;
    const sc = { micro: .78, small: .92, mid: 1.05, giant: 1.2, fine: 1.14 }[b.tier] || 1;
    ctx.save(); ctx.translate(800 + shake, 470); ctx.scale(1.14, 1.14);
    // pedestal + plaque
    ctx.fillStyle = '#1a2231'; ctx.fillRect(-190, 0, 380, 76);
    ctx.fillStyle = '#2a3548'; ctx.fillRect(-204, -12, 408, 16); ctx.fillRect(-204, 70, 408, 12);
    ctx.fillStyle = bronze(ctx, -160, 14, 160, 62); ctx.fillRect(-160, 15, 320, 48);
    ctx.strokeStyle = '#3a220c'; ctx.lineWidth = 2; ctx.strokeRect(-155, 20, 310, 38);
    ctx.fillStyle = '#26160a'; ctx.textAlign = 'center';
    ctx.font = '800 13px "IBM Plex Mono", monospace'; ctx.fillText(`${S.idx === BOSSES.length - 1 ? 'FINAL BOSS' : 'FLOOR ' + String(S.idx + 1).padStart(2, '0')} · ${b.short.toUpperCase().slice(0, 18)}${MODE === 'mcap' ? ' · ' + b.ticker : ''}`, 0, 36);
    ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.fillText(MODE === 'mcap' ? `MARKET CAP ${usd(b.value)} · ${b.evil ? b.receipts.length + ' RECEIPT' + (b.receipts.length > 1 ? 'S' : '') + ' ON FILE' : 'NO RECEIPTS ON FILE'}` : `${b.ticker} · ${usd(b.value)} FINE`, 0, 52);
    ctx.translate(0, bob); ctx.scale(sc, sc);
    if (hit > .05) ctx.filter = `brightness(${1 + hit * .5})`;
    // legs + feet
    ctx.fillStyle = bronze(ctx, -60, -50, 60, 0); ctx.beginPath(); ctx.roundRect(-58, -52, 40, 52, 12); ctx.roundRect(18, -52, 40, 52, 12); ctx.fill();
    ctx.fillStyle = '#3a220c'; ctx.beginPath(); ctx.roundRect(-68, -12, 58, 14, 7); ctx.roundRect(10, -12, 58, 14, 7); ctx.fill();
    // arms: left drags a money bag, right raises the stamp
    const raise = reduced ? 0 : Math.sin(t * 1.4) * 8;
    ctx.strokeStyle = bronze(ctx, -180, -260, 180, -60); ctx.lineCap = 'round'; ctx.lineWidth = 38;
    ctx.beginPath(); ctx.moveTo(-78, -225); ctx.quadraticCurveTo(-150, -175, -142, -104); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(78, -225); ctx.quadraticCurveTo(152, -250, 152, -300 + raise); ctx.stroke();
    ctx.fillStyle = bronze(ctx, -200, -130, -90, -20); ctx.beginPath(); ctx.ellipse(-146, -60, 48, 44, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(-164, -116, 36, 18, 6); ctx.fill();
    ctx.fillStyle = '#3a220c'; ctx.font = '900 42px Inter, Arial'; ctx.fillText('$', -146, -45);
    if (b.evil) {
      ctx.fillStyle = '#26160a'; ctx.fillRect(144, -364 + raise, 16, 52);
      ctx.fillStyle = bronze(ctx, 96, -320, 208, -286); ctx.beginPath(); ctx.roundRect(96, -318 + raise, 112, 36, 6); ctx.fill();
      ctx.fillStyle = '#26160a'; ctx.font = '800 9px "IBM Plex Mono", monospace'; ctx.fillText('NO WRONGDOING', 152, -302 + raise); ctx.fillText('ADMITTED', 152, -291 + raise);
    } else {
      ctx.fillStyle = bronze(ctx, 120, -330, 190, -250); ctx.beginPath(); ctx.roundRect(122, -350 + raise, 64, 84, 5); ctx.fill();
      ctx.fillStyle = '#26160a'; ctx.font = '800 9px "IBM Plex Mono", monospace'; ctx.fillText('Q3', 154, -322 + raise); ctx.fillText('TARGETS', 154, -310 + raise); ctx.fillRect(134, -300 + raise, 40, 2); ctx.fillRect(134, -292 + raise, 32, 2);
    }
    // horns (little capsules), evil only
    if (b.evil) for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 52, -330); ctx.rotate(sx * .5); ctx.fillStyle = bronze(ctx, -9, -30, 9, 0); ctx.beginPath(); ctx.roundRect(-9, -34, 18, 40, 9); ctx.fill(); ctx.restore(); }
    // body: an upright capsule
    const body = new Path2D(); body.roundRect(-86, -336, 172, 300, 86);
    ctx.fillStyle = bronze(ctx, -86, -336, 86, -40); ctx.fill(body);
    ctx.save(); ctx.clip(body);
    ctx.fillStyle = 'rgba(35,18,4,.30)'; ctx.fillRect(-86, -186, 172, 160);
    ctx.fillStyle = 'rgba(64,156,134,.24)'; for (const [x, y, rx, ry] of [[-62, -118, 30, 52], [58, -262, 18, 40], [-24, -58, 44, 16], [40, -96, 20, 26]]) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, .3, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,224,176,.22)'; ctx.beginPath(); ctx.roundRect(-64, -316, 18, 130, 9); ctx.fill();
    // cracks grow with damage
    const n = dmg <= 0 ? 0 : Math.max(1, Math.ceil(Math.sqrt(dmg) * CRACKS.length));
    ctx.strokeStyle = '#140a02'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
    for (const c of CRACKS.slice(0, n)) { ctx.beginPath(); c.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#3a220c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-86, -186); ctx.lineTo(86, -186); ctx.stroke();
    ctx.fillStyle = 'rgba(35,18,4,.5)'; ctx.font = '900 italic 46px Inter, Arial'; ctx.fillText('Rx', 0, -88);
    // face: brow, glowing eyes, toothy grin
    ctx.fillStyle = '#26160a';
    if (!b.evil) { // neutral face: plain eyes, flat mouth
      ctx.fillStyle = '#f6e3c6'; ctx.beginPath(); ctx.ellipse(-30, -240, 13, 15, 0, 0, 7); ctx.ellipse(30, -240, 13, 15, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#26160a'; ctx.beginPath(); ctx.arc(-28, -238, 5, 0, 7); ctx.arc(28, -238, 5, 0, 7); ctx.fill(); ctx.fillRect(-24, -200, 48, 5);
    } else {
    ctx.beginPath(); ctx.moveTo(-62, -278); ctx.lineTo(-10, -258); ctx.lineTo(-10, -248); ctx.lineTo(-62, -264); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(62, -278); ctx.lineTo(10, -258); ctx.lineTo(10, -248); ctx.lineTo(62, -264); ctx.closePath(); ctx.fill();
    const glow = .7 + .3 * Math.sin(t * 3);
    ctx.save(); ctx.shadowColor = '#ff3b58'; ctx.shadowBlur = 16 * glow; ctx.fillStyle = '#ff3b58';
    ctx.beginPath(); ctx.ellipse(-34, -238, 16, 6, .18, 0, 7); ctx.ellipse(34, -238, 16, 6, -.18, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#26160a'; ctx.beginPath(); ctx.moveTo(-52, -212); ctx.quadraticCurveTo(0, -168, 52, -212); ctx.quadraticCurveTo(0, -192, -52, -212); ctx.fill();
    ctx.fillStyle = '#e8ad66'; for (let k = -4; k <= 4; k++) { const x = k * 10, y = -203 + Math.abs(k) * -1.2; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 8); ctx.closePath(); ctx.fill(); }
    }
    ctx.filter = 'none';
    // phase effects
    if (S.phase >= 2) for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) { const lx = sx * (240 + i * 46); ctx.fillStyle = '#0f172a'; ctx.fillRect(lx - 12, -96, 24, 70); ctx.beginPath(); ctx.arc(lx, -108, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#6b4a2b'; ctx.fillRect(lx + sx * 10, -52, 18, 14); }
    if (S.phase >= 3 && !reduced) { ctx.fillStyle = '#6ee7b7'; for (let i = 0; i < 8; i++) { const p = (t * .4 + i / 8) % 1; ctx.save(); ctx.translate(-200 + i * 55, -380 + p * 380); ctx.rotate(t + i); ctx.globalAlpha = 1 - p; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); } ctx.globalAlpha = 1; }
    ctx.restore();
  }

  /* ---------- Room ---------- */
  const city = Array.from({ length: 70 }, (_, i) => ({ x: i * 24 + (i * 13 % 9), w: 18 + (i * 7 % 10), h: 80 + (i * 53 % 160) }));
  function room(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, '#04070e'); g.addColorStop(1, '#0a1426'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1600, 470);
    // city through the glass wall
    for (const b of city) { ctx.fillStyle = '#081120'; ctx.fillRect(b.x, 470 - b.h - 60, b.w, b.h + 60);
      ctx.fillStyle = 'rgba(255,214,140,.22)'; for (let wy = 470 - b.h - 50; wy < 440; wy += 12) for (let wx = b.x + 3; wx < b.x + b.w - 3; wx += 6) if (((wx * 7 + wy * 3) | 0) % 5 === 0) ctx.fillRect(wx, wy, 2.5, 4); }
    // window mullions
    ctx.fillStyle = 'rgba(117,154,199,.12)'; for (let x = 0; x <= 1600; x += 160) ctx.fillRect(x, 0, 3, 470); ctx.fillRect(0, 150, 1600, 3);
    // neon sign (behind boss)
    const on = reduced || Math.sin(t * 7) > -0.92 || Math.random() > .3;
    ctx.save(); ctx.font = '900 italic 96px Inter, Arial'; ctx.textAlign = 'center';
    ctx.shadowColor = '#ff3b58'; ctx.shadowBlur = on ? 30 : 4; ctx.fillStyle = on ? '#ff5a72' : '#5a1726'; ctx.fillText('BIG PHARMA', 800, 128); ctx.restore();
    ctx.font = '600 15px "IBM Plex Mono", monospace'; ctx.fillStyle = 'rgba(255,90,114,.55)'; ctx.textAlign = 'center'; ctx.fillText('FLOOR 40 · BOARDROOM · AUTHORIZED SHAREHOLDERS ONLY', 800, 160);
    // floor
    const f = ctx.createLinearGradient(0, 470, 0, 900); f.addColorStop(0, '#0b1323'); f.addColorStop(1, '#050913'); ctx.fillStyle = f; ctx.fillRect(0, 470, 1600, 430);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 470, 1600, 430); ctx.clip(); ctx.strokeStyle = 'rgba(85,216,255,.08)'; ctx.lineWidth = 1.5;
    for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(800 + i * 30, 470); ctx.lineTo(800 + i * 170, 900); ctx.stroke(); }
    for (let k = 1; k < 10; k++) { const yy = 470 + 430 * Math.pow(k / 10, 1.8); ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(1600, yy); ctx.stroke(); }
    ctx.restore();
    // red carpet to the throne
    ctx.fillStyle = 'rgba(200,29,58,.28)'; ctx.beginPath(); ctx.moveTo(740, 482); ctx.lineTo(860, 482); ctx.lineTo(1010, 900); ctx.lineTo(590, 900); ctx.closePath(); ctx.fill();
  }

  /* ---------- Layout ---------- */
  const ROWS = [{ y: 862, s: 1 }, { y: 792, s: .88 }, { y: 734, s: .78 }, { y: 686, s: .69 }, { y: 646, s: .61 }, { y: 612, s: .54 }, { y: 584, s: .48 }, { y: 560, s: .43 }];
  const cv = $('#arena'), ctx = cv.getContext('2d');
  let scale = 1, offX = 0, visW = 1600, placed = [];
  function layout() {
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr;
    scale = h / 900; visW = Math.min(1600, w / scale); offX = (w / scale - 1600) / 2;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * scale * offX, 0);
    placed = []; let i = 0;
    const left = 800 - visW / 2 + 40, right = 800 + visW / 2 - 40;
    for (const row of ROWS) {
      const gap = 100 * row.s, cap = Math.max(1, Math.floor((right - left) / gap));
      const slots = Array.from({ length: cap }, (_, k) => 800 + (k - (cap - 1) / 2) * gap).sort((a, b) => Math.abs(a - 800) - Math.abs(b - 800));
      for (const sx of slots) { if (i >= raiders.length) break; const r = raiders[i++]; placed.push({ r, x: sx + ((hash(r.handle) % 20) - 10) * row.s, y: row.y, h: 150 * row.s * (0.75 + r.lv * .09), next: performance.now() + 600 + Math.random() * 5000, atk: 0, box: null }); }
      if (i >= raiders.length) break;
    }
    placed.sort((a, b) => a.y - b.y);
    PH._raid = placed;
    $('#shownN').textContent = placed.length;
    $('#moreN').textContent = raiders.length > placed.length ? ` (+${raiders.length - placed.length} more in the elevator)` : '';
  }

  /* ---------- Loop ---------- */
  const WORDS = ['SOURCED', 'FILED', 'RECEIPT', 'SUBPOENA', 'DISCOVERY', 'EXHIBIT A', 'ON THE RECORD', 'CITED', 'FOIA’D'];
  const shots = [], pops = []; let hit = 0, visible = true, raf = 0, last = performance.now();
  const ATTACK = 'ontouchstart' in window ? 7 : 12;
  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    const t = now / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    ctx.clearRect(-offX, 0, 1600 + offX * 2, 900);
    room(ctx, t); boss(ctx, t, hit); hit = Math.max(0, hit - dt * 3);
    for (const p of placed) {
      if (!reduced && now > p.next && shots.length < ATTACK) {
        p.atk = .001; p.next = now + (2600 + Math.random() * 6000) / (0.6 + p.r.lv * .2);
        shots.push({ x0: p.x + 22 * p.h / 100, y0: p.y - 96 * p.h / 100, x1: 700 + Math.random() * 200, y1: 150 + Math.random() * 270, t: 0, w: WORDS[Math.random() * WORDS.length | 0], big: p.r.lv >= 6, sz: 5 + p.r.lv });
      }
      if (p.atk > 0) { p.atk += dt * 3; if (p.atk >= 1) p.atk = 0; }
      p.box = raider(ctx, p.x, p.y, p.h, p.r, t, p.atk);
    }
    // receipts in flight
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i]; s.t += dt * 1.25;
      if (s.t >= 1) { if ((s.big || Math.random() < .3) && pops.length < 4) pops.push({ x: s.x1 + (Math.random() - .5) * 260, y: s.y1, w: s.w, big: s.big, t: 0 }); hit = Math.min(1, hit + .25); shots.splice(i, 1); continue; }
      const cx = (s.x0 + s.x1) / 2, cy = Math.min(s.y0, s.y1) - 160, k = s.t;
      const x = (1 - k) * (1 - k) * s.x0 + 2 * (1 - k) * k * cx + k * k * s.x1, y = (1 - k) * (1 - k) * s.y0 + 2 * (1 - k) * k * cy + k * k * s.y1;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 9 + i); ctx.fillStyle = '#f3efe4'; ctx.fillRect(-s.sz * .7, -s.sz, s.sz * 1.4, s.sz * 2); ctx.fillStyle = '#9b8f78'; ctx.fillRect(-s.sz * .45, -s.sz * .5, s.sz * .9, 1.2); ctx.fillRect(-s.sz * .45, 0, s.sz * .9, 1.2); ctx.restore();
    }
    // damage numbers
    ctx.textAlign = 'center';
    for (let i = pops.length - 1; i >= 0; i--) {
      const d = pops[i]; d.t += dt; if (d.t > 1.1) { pops.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - d.t / 1.1; ctx.font = `900 ${d.big ? 24 : 18}px Inter, Arial`; ctx.lineWidth = 5; ctx.strokeStyle = '#05080f';
      ctx.strokeText(d.w, d.x, d.y - d.t * 60); ctx.fillStyle = d.big ? '#f6d77a' : '#ff5a72'; ctx.fillText(d.w, d.x, d.y - d.t * 60);
    }
    ctx.globalAlpha = 1;
    if (preview) { ctx.save(); ctx.translate(800, 690); ctx.rotate(-.08); ctx.font = '900 120px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,184,77,.10)'; ctx.fillText('PREVIEW · SIMULATED', 0, 0); ctx.restore(); }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(cv);
  document.addEventListener('visibilitychange', start);
  addEventListener('resize', () => { layout(); });
  layout(); start();
  if (reduced) frame(performance.now());

  /* ---------- Boss quotes ---------- */
  const bq = $('#bossQuote'); let qi = 0;
  const quote = () => { bq.classList.remove('on'); setTimeout(() => { bq.textContent = '“' + QUOTES[qi++ % QUOTES.length] + '”'; bq.classList.add('on'); }, 350); };
  quote(); setInterval(quote, 6000);

  /* ---------- Hover / click ---------- */
  const tip = $('#tip'); let over = null;
  function pick(ev) {
    const rc = cv.getBoundingClientRect(), mx = (ev.clientX - rc.left) / scale - offX, my = (ev.clientY - rc.top) / scale;
    for (let i = placed.length - 1; i >= 0; i--) { const b = placed[i].box; if (b && mx >= b.x0 && mx <= b.x1 && my >= b.y0 && my <= b.y1) return placed[i]; }
    return null;
  }
  function showTip(p, ev) {
    const r = p.r, L = LEVELS[r.lv - 1];
    tip.innerHTML = `<div class="tip-h">${r.avatar ? `<img src="${esc(r.avatar.replace('_normal', '_200x200'))}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(r.name)}</b><small>@${esc(r.handle)}</small></div></div>
      <div class="tip-lv">Lv ${r.lv} · ${esc(L.title)} <i class="dec d${r.decile}">D${r.decile}</i></div>
      <div class="tip-g"><span>Decile</span><b>D${r.decile}</b><span>Impact</span><b>${r.score}</b><span>Scripts</span><b>${r.scripts}</b><span>Refills</span><b>${r.refills}</b><span>Reach</span><b>${fmt(r.reach)}</b><span>Rank</span><b>#${r.rank}</b></div>
      ${r.lv < 7 ? `<div class="tip-next">${Math.max(0, LEVELS[r.lv].min - r.score).toFixed(0)} Impact to ${esc(LEVELS[r.lv].title)}</div>` : '<div class="tip-next">Max level. The boss knows your name.</div>'}
      ${preview ? '<div class="tip-next">Simulated preview raider</div>' : ''}`;
    const rc = $('#stage').getBoundingClientRect();
    let x = ev.clientX - rc.left + 16, y = ev.clientY - rc.top + 16;
    tip.classList.remove('hidden');
    if (x + tip.offsetWidth > rc.width) x = ev.clientX - rc.left - tip.offsetWidth - 16;
    if (y + tip.offsetHeight > rc.height) y = Math.max(8, rc.height - tip.offsetHeight - 8);
    tip.style.transform = `translate(${x}px,${y}px)`;
  }
  cv.addEventListener('pointermove', ev => { const p = pick(ev); over = p; cv.style.cursor = p && !preview ? 'pointer' : 'default'; p ? showTip(p, ev) : tip.classList.add('hidden'); });
  cv.addEventListener('pointerleave', () => tip.classList.add('hidden'));
  cv.addEventListener('click', ev => { const p = pick(ev); if (!p) return; if (ev.pointerType === 'touch' || PH.touch) { showTip(p, ev); return; } if (!preview) open(`https://x.com/${encodeURIComponent(p.r.handle)}`, '_blank', 'noopener'); });

  /* ---------- Class ladder portraits ---------- */
  $('#classes').innerHTML = LEVELS.map((L, i) => `<div class="cls rv"><canvas width="220" height="240" data-lv="${i + 1}"></canvas><div class="cls-lv">LV ${i + 1}</div><h4>${esc(L.title)}</h4><p>${esc(L.blurb)}</p><span>${L.min}+ Impact</span></div>`).join('');
  document.querySelectorAll('#classes canvas').forEach(c => {
    const x = c.getContext('2d'), lv = +c.dataset.lv;
    x.fillStyle = 'rgba(85,216,255,.06)'; x.beginPath(); x.ellipse(110, 214, 70, 12, 0, 0, 7); x.fill();
    raider(x, 110, 214, 150 + lv * 6, { lv, hoodie: HOODIES[lv * 3 % HOODIES.length], acc: lv === 1 ? 1 : 0, phase: lv }, 1.2, 0);
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('#classes .rv').forEach(el => io.observe(el));
});

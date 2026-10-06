/* PharmaCasino — Side Effect Slots */
document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc, fmtMoney, receiptHTML, reduced, toast } = PH;
  const R = (window.RECEIPTS || []).filter(r => r.source_url);
  const OFF = { settlement: 'Civil settlement', criminal: 'Guilty plea', withdrawal: 'Safety scandal', opioids: 'Opioid era', lobbying: 'Lobbying', pricing: 'Price games', 'data-hiding': 'Data handling', 'vaccine-history': 'Vaccine history', marketing: 'Off-label push' };
  const short = c => c.split(/[,(/]/)[0].replace(/\s+(Inc|LLC|Pharmaceuticals|Laboratories|Therapeutics)\.?$/i, '').trim();
  const payLabel = r => r.amount_usd ? fmtMoney(r.amount_usd) : 'Priceless';
  const tier = r => !r.amount_usd ? ['Priceless', 'No dollar figure. Some receipts are paid in other currencies.'] :
    r.amount_usd >= 1e9 ? ['Ten-figure jackpot', 'The lights are flashing. Nobody in the building is happy about it.'] :
    r.amount_usd >= 1e8 ? ['Nine-figure hit', 'Big enough for a press release. Small enough to be a line item.'] :
    ['Rounding error', 'Under $100M. To them, a rounding error. To the people involved, not.'];

  /* Bulbs */
  const bulbs = $('#bulbs'); bulbs.innerHTML = '<i></i>'.repeat(24);
  const B = $$('i', bulbs); let bt = 0, chase = false;
  setInterval(() => { bt++; B.forEach((b, i) => b.classList.toggle('on', chase ? (i + bt) % 3 === 0 : (i + bt) % 6 < 2)); }, chase ? 70 : 260);
  setInterval(() => { if (chase) { bt++; B.forEach((b, i) => b.classList.toggle('on', (i + bt) % 3 === 0)); } }, 80);

  /* Reels */
  const reels = $$('.reel'), strips = $$('.reel-strip');
  const faces = [r => [short(r.company), String(r.year)], r => [OFF[r.category] || r.category, r.category], r => [payLabel(r), r.amount_usd ? 'USD' : 'no price tag']];
  const symHTML = ([b, s]) => `<div class="sym"><b>${esc(b)}</b><small>${esc(s)}</small></div>`;
  const rand = () => R[Math.random() * R.length | 0];
  const fill = (i, target, n) => { const list = []; for (let k = 0; k < n; k++) list.push(faces[i](rand())); list.push(faces[i](target), faces[i](rand())); strips[i].innerHTML = list.map(symHTML).join(''); return n; };
  // initial idle faces
  const start = rand(); strips.forEach((s, i) => { fill(i, start, 1); s.style.transform = 'translateY(0)'; });

  /* Sound (WebAudio ticks, off by default) */
  let ac = null, soundOn = false;
  $('#sound').onclick = e => { soundOn = !soundOn; e.currentTarget.innerHTML = `Sound: <b>${soundOn ? 'on' : 'off'}</b>`; if (soundOn && !ac) ac = new (window.AudioContext || window.webkitAudioContext)(); };
  const beep = (f = 880, d = .03, v = .05, type = 'square') => { if (!soundOn || !ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d); };

  /* State */
  let trust = 100, spinning = false, current = null; const hist = [];
  const trustEl = $('#trust');
  const spinBtn = $('#spin');

  function spin() {
    if (spinning || !R.length) return;
    spinning = true; spinBtn.disabled = true; spinBtn.classList.add('down'); chase = true;
    setTimeout(() => spinBtn.classList.remove('down'), 160);
    const r = rand(); current = r;
    const symH = reels[0].querySelector('.sym')?.offsetHeight || 70;
    const done = [];
    strips.forEach((s, i) => {
      const n = 18 + i * 7;
      fill(i, r, n);
      s.style.transition = 'none'; s.style.transform = 'translateY(0)';
      s.offsetHeight; // reflow
      const dur = reduced ? 0 : 1300 + i * 450;
      const y = -(n - 1) * symH; // target (index n) lands in the middle row
      s.style.transition = `transform ${dur}ms cubic-bezier(.12,.8,.22,1.04)`;
      s.style.transform = `translateY(${y}px)`;
      // ticks
      if (soundOn) { let k = 0; const t = setInterval(() => { beep(500 + i * 120, .02, .03); if (++k > n * .6) clearInterval(t); }, dur / n); }
      done.push(new Promise(res => setTimeout(() => { beep(300 + i * 160, .08, .07, 'triangle'); res(); }, dur + 30)));
    });
    Promise.all(done).then(() => land(r));
  }

  function land(r) {
    spinning = false; spinBtn.disabled = false; chase = false;
    const lose = 3 + (Math.random() * 7 | 0);
    trust = Math.max(0, trust - lose);
    trustEl.textContent = trust + '%';
    const [t, line] = tier(r);
    $('#combo').textContent = `${t} · trust −${lose}%`;
    $('#vTitle').textContent = r.title;
    $('#vBody').textContent = line;
    $('#vActions').style.display = 'flex';
    $('#vSrc').href = r.source_url;
    $('#slip').innerHTML = receiptHTML(r);
    if (r.amount_usd >= 1e9) { beep(660, .12, .06, 'triangle'); setTimeout(() => beep(990, .2, .06, 'triangle'), 120); }
    hist.unshift(r); if (hist.length > 6) hist.pop();
    $('#history').innerHTML = hist.map((h, i) => `<button class="chip ${i ? '' : 'on'}" data-h="${i}">${esc(short(h.company))} · ${payLabel(h)}</button>`).join('');
    $$('[data-h]').forEach(b => b.onclick = () => { const h = hist[+b.dataset.h]; current = h; $('#slip').innerHTML = receiptHTML(h); $('#vSrc').href = h.source_url; $$('[data-h]').forEach(x => x.classList.toggle('on', x === b)); });
    if (trust === 0) { $('#combo').textContent = 'Trust bankrupt'; $('#vBody').textContent = 'You are out of trust. Like everyone else who read the archive. Spinning again issues a fresh 100%, courtesy of the marketing department.'; trust = 100; }
    if (innerWidth < 980) $('#payout').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  spinBtn.onclick = spin;
  $('#again').onclick = () => { $('.machine').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(spin, 350); };
  addEventListener('keydown', e => { if (e.code === 'Space' && !e.target.matches('input,textarea,button')) { e.preventDefault(); spin(); } });

  /* Share card: draws the current receipt to a 1080x1350 PNG */
  $('#save').onclick = async () => {
    if (!current) return;
    await document.fonts.ready;
    const c = $('#card'), x = c.getContext('2d'), W = 1080, H = 1350, r = current;
    x.fillStyle = '#050914'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(117,154,199,.10)'; x.lineWidth = 1;
    for (let i = 0; i < W; i += 54) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
    for (let i = 0; i < H; i += 54) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
    // paper with zigzag edges
    const px = 150, py = 150, pw = 780, ph = 1000, z = 18;
    x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 60; x.shadowOffsetY = 30;
    x.beginPath(); x.moveTo(px, py);
    for (let i = px; i < px + pw; i += z) { x.lineTo(i + z / 2, py + z / 2); x.lineTo(i + z, py); }
    x.lineTo(px + pw, py + ph);
    for (let i = px + pw; i > px; i -= z) { x.lineTo(i - z / 2, py + ph - z / 2); x.lineTo(i - z, py + ph); }
    x.closePath(); x.fillStyle = '#f3efe4'; x.fill(); x.restore();
    const mono = s => `${s}px "IBM Plex Mono", monospace`, sans = (w, s) => `${w} ${s}px Inter, sans-serif`;
    x.fillStyle = '#1d1a15'; x.textAlign = 'center';
    x.font = `700 ${30}px "IBM Plex Mono", monospace`; x.fillText('$PHARMA RECEIPTS DEPT.', W / 2, py + 80);
    x.font = mono(20); x.fillStyle = '#6b6252'; x.fillText('PHARMACASINO · SIDE EFFECT SLOTS · PUBLIC RECORD', W / 2, py + 116);
    const dash = y => { x.save(); x.setLineDash([8, 8]); x.strokeStyle = 'rgba(29,26,21,.4)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px + 50, y); x.lineTo(px + pw - 50, y); x.stroke(); x.restore(); };
    dash(py + 150);
    x.textAlign = 'left'; x.font = mono(24); x.fillStyle = '#1d1a15';
    const row = (a, b, y) => { x.textAlign = 'left'; x.fillText(a, px + 60, y); x.textAlign = 'right'; x.fillText(b, px + pw - 60, y); };
    row('DATE', String(r.year), py + 200); row('CUSTOMER', short(r.company).slice(0, 26), py + 240); row('ITEM', (OFF[r.category] || r.category).toUpperCase(), py + 280);
    dash(py + 315);
    const wrap = (text, font, lh, y, maxW, maxLines) => { x.font = font; x.textAlign = 'left'; const words = String(text).split(' '); let line = '', n = 0; for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, px + 60, y); y += lh; line = w; if (++n >= maxLines - 1) { } } else line = t; } x.fillText(line, px + 60, y); return y + lh; };
    x.fillStyle = '#111'; let y = wrap(r.title, sans(900, 52), 60, py + 385, pw - 120, 3);
    x.fillStyle = '#2c2820'; y = wrap(r.fact, mono(23), 34, y + 10, pw - 120, 8);
    dash(py + ph - 290);
    x.fillStyle = '#1d1a15'; x.font = `700 26px "IBM Plex Mono", monospace`; x.textAlign = 'left'; x.fillText('TOTAL', px + 60, py + ph - 225);
    x.textAlign = 'right'; x.fillStyle = '#b0102a'; x.font = sans(900, 72); x.fillText(payLabel(r), px + pw - 60, py + ph - 210);
    // barcode
    x.fillStyle = '#1d1a15'; let bx = px + 110; while (bx < px + pw - 110) { const w = [2, 3, 5][Math.random() * 3 | 0]; x.fillRect(bx, py + ph - 170, w, 70); bx += w + [3, 4, 6][Math.random() * 3 | 0]; }
    x.textAlign = 'center'; x.font = mono(20); x.fillText(`SOURCE: ${String(r.source_name).toUpperCase()}`, W / 2, py + ph - 65);
    // stamp: sits in the gap under the fact, clear of the header rows
    const sy = Math.min(Math.max(y + 30, py + 560), py + ph - 340);
    x.save(); x.translate(px + pw - 170, sy); x.rotate(-.1); x.strokeStyle = '#1d7a52'; x.lineWidth = 5; x.strokeRect(-110, -32, 220, 64); x.fillStyle = '#1d7a52'; x.font = `700 30px "IBM Plex Mono", monospace`; x.textAlign = 'center'; x.fillText('VERIFIED', 0, 11); x.restore();
    // footer
    x.textAlign = 'center'; x.fillStyle = '#55d8ff'; x.font = sans(900, 44); x.fillText('$PHARMA', W / 2, H - 70);
    x.fillStyle = '#8ea7c1'; x.font = mono(20); x.fillText('Fake gambling. Real receipts. Not financial or medical advice.', W / 2, H - 34);
    c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `pharma-receipt-${(r.id || short(r.company)).toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Receipt printed. Post responsibly.'); }, 'image/png');
  };
});

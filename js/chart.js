/* PHARMA chart: candles + volume + real trade markers, drawn on canvas from PULSE data. No library. */
window.PHChart = function (canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const o = Object.assign({ up: '#55d8ff', down: '#ff3b58', grid: 'rgba(117,154,199,.12)', text: '#8ea7c1', font: '11px "IBM Plex Mono", monospace', range: 'h', mono: '"IBM Plex Mono", monospace' }, opts);
  let candles = [], trades = [], hover = null, W = 0, H = 0, dpr = 1;
  const fmt = p => p < 0.001 ? p.toFixed(8).replace(/0+$/, '') : p.toFixed(4);
  function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
  function windowed() {
    const now = Date.now(), span = { '24h': 864e5, '7d': 7 * 864e5, '30d': 30 * 864e5, 'all': Infinity }[o.range] || 7 * 864e5;
    const c = candles.filter(c => now - c.t < span);
    return c.length >= 4 ? c : candles.slice(-Math.max(4, Math.min(candles.length, 48)));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const c = windowed(); if (!c.length) { ctx.fillStyle = o.text; ctx.font = o.font; ctx.textAlign = 'center'; ctx.fillText('chart feed resting…', W / 2, H / 2); return; }
    const padL = 8, padR = 62, padT = 14, padB = 22, volH = Math.round(H * .22);
    const x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB - volH - 6, vy0 = H - padB - volH, vy1 = H - padB;
    const lo = Math.min(...c.map(k => k.l)), hi = Math.max(...c.map(k => k.h)), vmax = Math.max(...c.map(k => k.v), 1);
    const px = v => y1 - (v - lo) / ((hi - lo) || 1) * (y1 - y0);
    const n = c.length, cw = (x1 - x0) / n, bw = Math.max(1, Math.min(14, cw * .66));
    const cx = i => x0 + (i + .5) * cw;
    // grid + price labels
    ctx.strokeStyle = o.grid; ctx.lineWidth = 1; ctx.fillStyle = o.text; ctx.font = o.font; ctx.textAlign = 'left';
    for (let g = 0; g <= 4; g++) { const y = y0 + (y1 - y0) * g / 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillText('$' + fmt(hi - (hi - lo) * g / 4), x1 + 6, y + 4); }
    // time labels
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(n / (W < 600 ? 3 : 6)));
    for (let i = 0; i < n; i += step) { const d = new Date(c[i].t); const lbl = o.range === '24h' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }); ctx.fillText(lbl, cx(i), H - 6); }
    // volume
    c.forEach((k, i) => { const h = (k.v / vmax) * (vy1 - vy0); ctx.fillStyle = k.c >= k.o ? 'rgba(85,216,255,.28)' : 'rgba(255,59,88,.28)'; ctx.fillRect(cx(i) - bw / 2, vy1 - h, bw, h); });
    // candles
    c.forEach((k, i) => {
      const up = k.c >= k.o, col = up ? o.up : o.down, x = cx(i);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, px(k.h)); ctx.lineTo(x, px(k.l)); ctx.stroke();
      const top = px(Math.max(k.o, k.c)), bot = px(Math.min(k.o, k.c));
      ctx.globalAlpha = up ? .95 : .9; ctx.fillRect(x - bw / 2, top, bw, Math.max(1.2, bot - top)); ctx.globalAlpha = 1;
    });
    // last price line
    const last = c[c.length - 1]; const ly = px(last.c);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = last.c >= c[0].o ? o.up : o.down; ctx.beginPath(); ctx.moveTo(x0, ly); ctx.lineTo(x1, ly); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = last.c >= c[0].o ? o.up : o.down; ctx.fillRect(x1 + 2, ly - 9, padR - 4, 18); ctx.fillStyle = '#04101f'; ctx.font = 'bold ' + o.font; ctx.textAlign = 'left'; ctx.fillText('$' + fmt(last.c), x1 + 6, ly + 4);
    // real trade markers (buys below, sells above the candle) within the window
    const t0 = c[0].t, t1 = c[c.length - 1].t + (c[1].t - c[0].t);
    trades.filter(t => !t.bot && t.ts >= t0 && t.ts <= t1).forEach(t => {
      const i = Math.min(n - 1, Math.max(0, Math.floor((t.ts - t0) / ((t1 - t0) / n)))); const k = c[i]; if (!k) return;
      const x = cx(i) + (Math.random() - .5) * bw * .4, r = Math.max(2, Math.min(7, 1.5 + Math.log10(1 + t.usd) * 1.6));
      ctx.beginPath(); ctx.arc(x, t.kind === 'buy' ? px(k.l) + 10 + r : px(k.h) - 10 - r, r, 0, 7);
      ctx.fillStyle = t.kind === 'buy' ? 'rgba(85,216,255,.55)' : 'rgba(255,59,88,.55)'; ctx.fill();
    });
    // hover crosshair
    if (hover != null) {
      const i = Math.min(n - 1, Math.max(0, Math.floor((hover - x0) / cw))), k = c[i];
      if (k) { ctx.strokeStyle = 'rgba(234,245,255,.35)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(cx(i), y0); ctx.lineTo(cx(i), vy1); ctx.stroke(); ctx.setLineDash([]);
        const txt = `${new Date(k.t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}  O $${fmt(k.o)}  H $${fmt(k.h)}  L $${fmt(k.l)}  C $${fmt(k.c)}  Vol $${Math.round(k.v).toLocaleString()}`;
        ctx.font = o.font; const tw = ctx.measureText(txt).width + 16; const bx = Math.min(Math.max(x0, cx(i) - tw / 2), x1 - tw);
        ctx.fillStyle = 'rgba(4,16,31,.92)'; ctx.fillRect(bx, y0, tw, 20); ctx.fillStyle = '#eaf5ff'; ctx.textAlign = 'left'; ctx.fillText(txt, bx + 8, y0 + 14); }
    }
  }
  canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); hover = e.clientX - r.left; draw(); });
  canvas.addEventListener('pointerleave', () => { hover = null; draw(); });
  addEventListener('resize', resize); resize();
  return { setCandles(c) { candles = c || []; draw(); }, setTrades(t) { trades = t || []; draw(); }, setRange(r) { o.range = r; draw(); }, draw, resize };
};

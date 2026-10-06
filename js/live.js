/* THE DISPENSARY — live capsule + live tape.
   The brand capsule (glass half, dark shell, glowing $) is driven ONLY by real trades on the
   $PHARMA PumpSwap pool (GeckoTerminal public API, CORS-open, ~30s cache). History on load is shown,
   not animated; only trades that arrive while you watch make the capsule react. Nothing is simulated. */
(() => {
  const POOL = '3PffTrmfWe23GTNH6XNERGzzUkLDiPTejJpH9DK3R28u';
  const API = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${POOL}/trades`;
  const BOT_USD = 1; // trades under $1 are labeled automated/dust
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const ago = ts => { const s = Math.max(0, (Date.now() - ts) / 1000); return s < 60 ? `${s | 0}s ago` : s < 3600 ? `${s / 60 | 0}m ago` : s < 86400 ? `${s / 3600 | 0}h ago` : `${s / 86400 | 0}d ago`; };
  const usd = n => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : n >= 1 ? '$' + n.toFixed(n < 10 ? 2 : 0) : '$' + n.toFixed(2);
  const short = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : '';

  /* ---------- feed ---------- */
  const seen = new Set(); let tape = [], first = true;
  function parse(d) {
    const a = d.attributes || {};
    const kind = a.kind === 'buy' ? 'buy' : 'sell';
    let v = parseFloat(a.volume_in_usd);
    if (!isFinite(v)) v = kind === 'buy' ? parseFloat(a.from_token_amount) * parseFloat(a.price_from_in_usd) : parseFloat(a.to_token_amount) * parseFloat(a.price_to_in_usd);
    return { id: a.tx_hash, kind, usd: isFinite(v) ? v : 0, wallet: a.tx_from_address, ts: Date.parse(a.block_timestamp), bot: !(v >= BOT_USD) };
  }
  async function poll() {
    if (document.hidden) return;
    try {
      const r = await fetch(API, { headers: { accept: 'application/json' } });
      const j = await r.json();
      const list = (j.data || []).map(parse).filter(t => t.id && t.ts).sort((a, b) => a.ts - b.ts);
      const fresh = list.filter(t => !seen.has(t.id));
      fresh.forEach(t => seen.add(t.id));
      tape = list.slice(-60).reverse();
      if (!first) fresh.forEach((t, i) => setTimeout(() => { window.dispatchEvent(new CustomEvent('ph:trade', { detail: t })); capsule && capsule.event(t); }, i * 900));
      first = false;
      paint();
    } catch { paintOffline(); }
  }
  function paint() {
    const p = $('#livePanel'); if (!p) return;
    const last = tape[0];
    const quiet = !last || Date.now() - last.ts > 15 * 60e3;
    $('#lpDot').classList.toggle('idle', quiet);
    $('#lpState').textContent = quiet ? 'quiet' : 'live';
    $('#lpLast').textContent = last ? ago(last.ts) : '—';
    $('#lpLastSub').textContent = last ? `last real trade · ${last.kind} ${usd(last.usd)}` : 'no trades in the last 24h';
    const day = tape.filter(t => Date.now() - t.ts < 864e5);
    $('#lpCount').textContent = `${day.filter(t => !t.bot).length} real trades · ${day.filter(t => t.bot).length} automated · 24h`;
    $('#lpFeed').innerHTML = tape.slice(0, 7).map(t => `<a class="lp-row ${t.bot ? 'bot' : ''}" href="https://solscan.io/tx/${t.id}" target="_blank" rel="noopener" title="View transaction on Solscan"><b class="k-${t.kind}">${t.kind.toUpperCase()}</b><span>${short(t.wallet)} · ${t.bot ? 'auto' : usd(t.usd)}</span><em>${ago(t.ts)}</em></a>`).join('');
  }
  function paintOffline() { const s = $('#lpState'); if (s) { s.textContent = 'feed offline'; $('#lpDot').classList.add('idle'); } }
  setInterval(() => { if (!document.hidden) paint(); }, 15000);

  /* ---------- the capsule ---------- */
  let capsule = null;
  function Capsule(cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, raf = 0, visible = true, t0 = performance.now();
    let mx = .5, my = .5, tx = .5, ty = .5, pulse = 0, dim = 0;
    const parts = [];
    const geo = () => {
      const mobile = W < 980;
      const L = Math.min(mobile ? W * .7 : W * .34, mobile ? H * .8 : H * .62, 560);
      return { cx: mobile ? W * .5 : W * .74, cy: mobile ? H * .5 : H * .33, L, R: L * .23, a: -.52 };
    };
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(performance.now());
    }
    // local capsule coords → screen
    const toScreen = (g, x, y) => { const c = Math.cos(g.a), s = Math.sin(g.a); return [g.cx + x * c - y * s, g.cy + x * s + y * c]; };
    function emitAmbient(g, n) {
      for (let i = 0; i < n; i++) {
        const [x, y] = toScreen(g, g.L / 2 - g.R * .25 + (Math.random() - .5) * g.R * .5, (Math.random() - .5) * g.R * 1.2);
        const sp = .25 + Math.random() * .6, ang = g.a - .25 + (Math.random() - .5) * .9;
        parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - .1, life: 1, decay: .0035 + Math.random() * .005, size: .6 + Math.random() * 1.8, col: Math.random() < .2 ? '255,255,255' : '95,225,255', grav: -.002 });
      }
    }
    this.event = tr => {
      const g = geo();
      if (tr.bot) { // dust: a few faint grey specks drift past
        for (let i = 0; i < 6; i++) { const [x, y] = toScreen(g, g.L * .7, (Math.random() - .5) * g.R * 3); parts.push({ x, y, vx: -.6 - Math.random() * .4, vy: (Math.random() - .5) * .3, life: .6, decay: .006, size: 1, col: '143,166,196', grav: 0 }); }
        return;
      }
      const n = Math.min(240, 24 + Math.round(36 * Math.log10(1 + tr.usd)));
      if (tr.kind === 'buy') {
        pulse = 1;
        for (let i = 0; i < n; i++) { // stream flows INTO the glass end
          const d = g.L * (.9 + Math.random() * 1.1), spread = (Math.random() - .5) * g.R * 2.4;
          const [x, y] = toScreen(g, g.L / 2 + d, spread);
          const [tx2, ty2] = toScreen(g, g.L * .1, (Math.random() - .5) * g.R * .8);
          const steps = 70 + Math.random() * 50;
          parts.push({ x, y, vx: (tx2 - x) / steps, vy: (ty2 - y) / steps, life: 1, decay: 1 / (steps + 10), size: .8 + Math.random() * 2.2, col: Math.random() < .3 ? '255,255,255' : '95,225,255', grav: 0, delay: Math.random() * 40 });
        }
      } else {
        dim = 1;
        for (let i = 0; i < n * .7; i++) { // leaks out of the shell, falls away
          const [x, y] = toScreen(g, -g.L * .25 + (Math.random() - .5) * g.L * .4, g.R * (.6 + Math.random() * .3));
          parts.push({ x, y, vx: (Math.random() - .5) * .5, vy: .2 + Math.random() * .6, life: 1, decay: .006 + Math.random() * .006, size: .8 + Math.random() * 1.6, col: '255,59,74', grav: .01, delay: Math.random() * 30 });
        }
      }
    };
    function draw(now) {
      const t = (now - t0) / 1000, g = geo();
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      g.cx += (mx - .5) * 24; g.cy += (my - .5) * 14; g.a += (mx - .5) * .06;
      pulse *= .975; dim *= .97;
      ctx.clearRect(0, 0, W, H);
      // ambient room light from the object
      let rg = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.L * 1.15);
      rg.addColorStop(0, `rgba(12,151,216,${.26 + pulse * .2 - dim * .1})`); rg.addColorStop(.45, 'rgba(12,151,216,.08)'); rg.addColorStop(1, 'rgba(12,151,216,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      // floor reflection
      ctx.save(); ctx.translate(g.cx, g.cy + g.L * .55); ctx.scale(1, .18);
      rg = ctx.createRadialGradient(0, 0, 0, 0, 0, g.L * .6); rg.addColorStop(0, 'rgba(95,225,255,.18)'); rg.addColorStop(1, 'rgba(95,225,255,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, g.L * .6, 0, 7); ctx.fill(); ctx.restore();
      // capsule
      ctx.save(); ctx.translate(g.cx, g.cy); ctx.rotate(g.a + (reduced ? 0 : Math.sin(t * .35) * .015));
      const { L, R } = g, body = new Path2D(); body.roundRect(-L / 2, -R, L, R * 2, R);
      // shadow / glow halo
      ctx.save(); ctx.shadowColor = `rgba(12,151,216,${.55 + pulse * .3})`; ctx.shadowBlur = 60 + pulse * 40; ctx.fillStyle = '#04122b'; ctx.fill(body); ctx.restore();
      // dark shell (left half)
      ctx.save(); ctx.clip(body);
      let lg = ctx.createLinearGradient(0, -R, 0, R); lg.addColorStop(0, '#12305a'); lg.addColorStop(.35, '#0a1d3c'); lg.addColorStop(1, '#01060f');
      ctx.fillStyle = lg; ctx.fillRect(-L / 2, -R, L / 2, R * 2);
      // glass half (right): tinted glass + liquid
      lg = ctx.createLinearGradient(0, -R, 0, R); lg.addColorStop(0, 'rgba(150,220,255,.16)'); lg.addColorStop(.5, 'rgba(60,160,230,.07)'); lg.addColorStop(1, 'rgba(95,225,255,.14)');
      ctx.fillStyle = lg; ctx.fillRect(0, -R, L / 2, R * 2);
      const lvl = R * .18, wav = reduced ? 0 : Math.sin(t * 1.3) * R * .04;
      ctx.beginPath(); ctx.moveTo(0, lvl + wav);
      for (let x = 0; x <= L / 2; x += 8) ctx.lineTo(x, lvl + Math.sin(t * 1.6 + x * .02) * R * .035 + wav * (1 - x / L));
      ctx.lineTo(L / 2, R); ctx.lineTo(0, R); ctx.closePath();
      lg = ctx.createLinearGradient(0, lvl, 0, R); lg.addColorStop(0, `rgba(95,225,255,${.35 + pulse * .25})`); lg.addColorStop(1, 'rgba(12,151,216,.55)');
      ctx.fillStyle = lg; ctx.fill();
      // inner rim + seam
      ctx.restore();
      ctx.lineWidth = 1.4; ctx.strokeStyle = `rgba(95,225,255,${.55 + pulse * .3})`; ctx.stroke(body);
      ctx.strokeStyle = 'rgba(180,235,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
      // specular streaks
      ctx.save(); ctx.clip(body); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = R * .14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-L * .38, -R * .58); ctx.lineTo(L * .4, -R * .58); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = R * .05; ctx.beginPath(); ctx.moveTo(-L * .36, R * .62); ctx.lineTo(-L * .05, R * .62); ctx.stroke();
      ctx.restore();
      // the $ — glowing in the shell
      ctx.save(); ctx.translate(-L * .22, 0); ctx.rotate(-g.a * .2);
      ctx.font = `700 ${R * 1.15}px ${getComputedStyle(document.body).getPropertyValue('--display') || 'Archivo'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = '#5fe1ff'; ctx.shadowBlur = 28 + pulse * 50; ctx.fillStyle = `rgba(150,240,255,${.92 - dim * .4})`; ctx.fillText('$', 0, R * .04);
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.globalAlpha = .55 + pulse * .45; ctx.fillText('$', 0, R * .04);
      ctx.restore();
      ctx.restore();
      // particles
      if (!reduced) { const k = parts.length < 900 ? (W < 700 ? 1 : 2) : 0; if (Math.random() < .9) emitAmbient(g, k); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.delay > 0) { p.delay--; continue; }
        p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.life -= p.decay;
        if (p.life <= 0 || p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) { parts.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${p.col},${Math.min(1, p.life) * .85})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    const loop = now => { raf = 0; if (!visible || document.hidden) return; draw(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && visible && !document.hidden && !reduced) raf = requestAnimationFrame(loop); };
    addEventListener('resize', resize); resize();
    if (!PH.touch) addEventListener('pointermove', e => { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; }, { passive: true });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(cv);
    document.addEventListener('visibilitychange', start);
    if (reduced) draw(performance.now()); else { for (let i = 0; i < 160; i++) emitAmbient(geo(), 1); start(); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const cv = document.getElementById('capsule');
    if (cv && cv.getContext('2d').roundRect) capsule = new Capsule(cv);
    if (document.getElementById('livePanel')) { poll(); setInterval(poll, 30000); document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); }); }
  });
})();

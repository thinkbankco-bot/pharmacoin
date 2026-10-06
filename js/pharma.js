/* $PHARMA v2 — shared engine */
const PH = (() => {
  const CONFIG = {
    ca: 'HtrvP4fG9KiFqFeu4f32RuZiwG3nmYwPkPZ61nAbpump',
    pair: '3PffTrmfWe23GTNH6XNERGzzUkLDiPTejJpH9DK3R28u',
    buy: 'https://phantom.com/tokens/solana/HtrvP4fG9KiFqFeu4f32RuZiwG3nmYwPkPZ61nAbpump',
    dex: 'https://dexscreener.com/solana/3PffTrmfWe23GTNH6XNERGzzUkLDiPTejJpH9DK3R28u',
    x: 'https://x.com/PharmaCoinSol',
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MASK = `<svg viewBox="0 0 220 170" aria-hidden="true"><path d="M46 14h128l24 48c-5 49-34 83-88 102C56 145 27 111 22 62L46 14Z" fill="#eaf5ff" stroke="#0b1220" stroke-width="5"/><path d="M57 58c18-14 36-15 55-2M108 56c19-13 38-12 55 2" fill="none" stroke="#0b1220" stroke-width="9" stroke-linecap="round"/><path d="M66 75c17-12 30-12 43 0-14 8-28 8-43 0ZM115 75c15-12 29-12 43 0-14 8-28 8-43 0Z" fill="#0b1220"/><path d="M110 76c-10 24-12 37 0 44 12-7 10-20 0-44Z" fill="#0b1220" opacity=".8"/><path d="M62 116c23 8 41 7 48-4 7 11 25 12 48 4-9 19-28 26-48 12-20 14-39 7-48-12ZM93 137c12 10 22 10 34 0-3 18-9 26-17 28-8-2-14-10-17-28Z" fill="#0b1220"/></svg>`;

  const PAGES = [
    ['index.html', 'Home'], ['congress.html', 'The Floor', 'hot'], ['arena.html', 'Boss Raid'], ['dose.html', 'Daily Dose'],
    ['formulary.html', 'Formulary'], ['archive.html', 'Receipts'], ['prescribers.html', 'Prescribers'],
  ];

  /* One shared scroll scheduler: every scroll-driven effect runs once per frame */
  const scrollFns = []; let queued = false;
  const flush = () => { queued = false; for (const f of scrollFns) f(); };
  const kick = () => { if (!queued) { queued = true; requestAnimationFrame(flush); } };
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick);
  function onScroll(fn) { scrollFns.push(fn); kick(); }

  function chrome() {
    if (!document.querySelector('link[rel=icon]')) { const l = document.createElement('link'); l.rel = 'icon'; l.href = 'assets/brand/favicon-32.png'; document.head.append(l); }
    const here = location.pathname.split('/').pop() || 'index.html';
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `<div class="nav-inner"><a class="brand" href="index.html"><span class="brand-mask"><img src="assets/brand/caduceus-96.png" alt=""></span><span>PHARMACOIN</span></a>
      <div class="nav-links">${PAGES.slice(1).map(([h, t, c]) => `<a href="${h}" class="${c || ''}" ${h === here ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</div>
      <a class="mcap-chip" href="${CONFIG.dex}" target="_blank" rel="noopener">MCAP <b data-mcap>—</b></a>
      <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button></div>`;
    document.body.prepend(nav);
    $('.burger', nav).onclick = () => nav.classList.toggle('open');
    onScroll(() => nav.classList.toggle('scrolled', scrollY > 30));

    const foot = document.createElement('footer');
    foot.innerHTML = `<div class="wrap"><div class="foot-grid">
      <div><a class="brand" href="index.html"><span class="brand-mask"><img src="assets/brand/caduceus-96.png" alt=""></span><span>PHARMACOIN</span></a>
      <p class="fine" style="margin-top:16px">PHARMA Holdings plc is not a real pharmaceutical company, which is the nicest thing anyone has said about it. Satirical evidence desk. Real sources, sarcastic string. Not medical advice. Not investment advice. Not saying the calendar did it. If you are sick, call a doctor, not a memecoin.</p></div>
      <div><h4>The Lab</h4><a href="dose.html">Daily Dose</a><a href="archive.html">Receipt Archive</a><a href="plague.html">Plague Desk</a><a href="hantavirus.html">Hanta Calendar</a><a href="polio.html">Polio Trail</a></div>
      <div><h4>The Company</h4><a href="formulary.html">The Formulary</a><a href="arena.html">Boss Raid</a><a href="congress.html">The Floor</a><a href="prescribers.html">Top Prescribers</a><a href="index.html#letter">Investor Relations</a><a href="casino.html">PharmaCasino</a><a href="boss-fight.html">Discontinued Products</a></div>
      <div><h4>Chart</h4><a href="${CONFIG.buy}" target="_blank" rel="noopener">Buy $PHARMA</a><a href="${CONFIG.dex}" target="_blank" rel="noopener">DexScreener</a><a href="${CONFIG.x}" target="_blank" rel="noopener">X: @PharmaCoinSol</a><a href="methodology.html">How we don't get sued</a></div>
      </div><div class="foot-word" aria-hidden="true">PHARMACOIN</div></div>`;
    document.body.append(foot);
    const t = document.createElement('div'); t.className = 'toast'; document.body.append(t);
  }

  let toastT;
  function toast(msg) { const t = $('.toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

  function copyCA() {
    $$('[data-copy-ca]').forEach(b => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(CONFIG.ca); toast('Copied. Unlike some clinical trial data, this was not hidden.'); }
      catch { toast(CONFIG.ca); }
    }));
    $$('[data-ca]').forEach(e => e.textContent = CONFIG.ca);
    $$('[data-buy]').forEach(a => { a.href = CONFIG.buy; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-dex]').forEach(a => { a.href = CONFIG.dex; a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* Reveal: .rv fades up, .rv-words splits words */
  function reveal() {
    $$('.rv-words').forEach(el => {
      if (el.dataset.split) return; el.dataset.split = 1;
      const walk = n => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.append(p);
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.append(s); }
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && !c.classList.contains('w')) walk(c);
      });
      walk(el);
      $$('.w', el).forEach((w, i) => w.style.transitionDelay = `${Math.min(i * 55, 900)}ms`);
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    $$('.rv,.rv-words').forEach(el => io.observe(el));
  }

  /* Count-up */
  const fmtMoney = n => {
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(n >= 1e10 ? 1 : 2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(n);
  };
  function countUp(el, to, dur = 1100, fmt) {
    fmt = fmt || (el.dataset.fmt === 'money' ? fmtMoney : v => Math.round(v).toLocaleString());
    if (reduced) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function counts() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target, +e.target.dataset.count); io.unobserve(e.target); } }), { threshold: .5 });
    $$('[data-count]').forEach(el => io.observe(el));
  }

  /* Parallax planes: data-rate */
  function parallax() {
    const planes = $$('[data-rate]'); if (!planes.length || reduced || innerWidth < 900) return;
    onScroll(() => { const y = scrollY; if (y > innerHeight * 2) return; planes.forEach(p => p.style.transform = `translate3d(0,${y * +p.dataset.rate}px,0)`); });
  }

  /* Capsule field: drifting pills that lean toward the pointer */
  function field(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, dpr, pills = [], mx = -999, my = -999, tx = -999, ty = -999, visible = true;
    const N = innerWidth < 700 ? 18 : 42;
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener('resize', resize);
    for (let i = 0; i < N; i++) pills.push({ x: Math.random() * W, y: Math.random() * H, a: Math.random() * Math.PI, va: (Math.random() - .5) * .004, vx: (Math.random() - .5) * .18, vy: -.05 - Math.random() * .16, s: 6 + Math.random() * 12, red: Math.random() < .28, o: .18 + Math.random() * .42 });
    if (!touch) addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; }, { passive: true });
    let raf = 0;
    const start = () => { if (visible && !document.hidden && !raf && ctx.roundRect) raf = requestAnimationFrame(draw); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(canvas);
    document.addEventListener('visibilitychange', start);
    const draw = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      raf = requestAnimationFrame(draw);
      mx += (tx - mx) * .05; my += (ty - my) * .05;
      ctx.clearRect(0, 0, W, H);
      for (const p of pills) {
        if (!reduced) { p.x += p.vx; p.y += p.vy; p.a += p.va; }
        const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy);
        if (d < 220) { p.x -= dx / d * .6; p.y -= dy / d * .6; p.a += .01; }
        if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; } if (p.x < -30) p.x = W + 30; if (p.x > W + 30) p.x = -30;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o;
        const w = p.s * 2.2, h = p.s, r = h / 2;
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.strokeStyle = p.red ? '#ff3b58' : '#55d8ff'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w / 2, h, [r, 0, 0, r]); ctx.fillStyle = p.red ? 'rgba(255,59,88,.35)' : 'rgba(85,216,255,.28)'; ctx.fill();
        ctx.restore();
      }
    };
  }

  /* Timeline progress fill */
  function timelines() {
    $$('.tl').forEach(tl => {
      const fill = document.createElement('i'); fill.className = 'tl-fill'; tl.prepend(fill);
      const items = $$('.tl-item', tl);
      const run = () => {
        const r = tl.getBoundingClientRect(), mid = innerHeight * .6;
        const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
        fill.style.height = (p * (r.height - 12)) + 'px';
        items.forEach(it => it.classList.toggle('lit', it.getBoundingClientRect().top < mid));
      };
      onScroll(run);
    });
  }

  /* Receipts */
  const CAT = { settlement: 'Civil settlement', criminal: 'Criminal case', withdrawal: 'Safety scandal', opioids: 'Opioid era', lobbying: 'Lobbying', pricing: 'Pricing', 'data-hiding': 'Data handling', 'vaccine-history': 'Vaccine history', marketing: 'Marketing', outbreak: 'Outbreak desk' };
  let rcNo = 1000;
  function receiptHTML(r, opts = {}) {
    rcNo++;
    const amt = r.amount_usd ? fmtMoney(r.amount_usd) : '—';
    const st = (r.status || 'VERIFIED').toUpperCase();
    const sc = { VERIFIED: 'v', 'WEAK SIGNAL': 'w', 'DEAD END': 'd', 'DO NOT CLAIM': 'x' }[st] || 'v';
    return `<article class="receipt ${opts.cls || ''}" data-cat="${esc(r.category)}" data-year="${esc(r.year)}">
      <div class="rc-store">$PHARMA RECEIPTS DEPT.<small>Store #000-RX · Reg ${String(rcNo).slice(-3)} · Public record</small></div>
      <hr class="rc-hr">
      <div class="rc-line"><span>DATE</span><span>${esc(r.year)}</span></div>
      <div class="rc-line"><span>CUSTOMER</span><span>${esc(r.company)}</span></div>
      <div class="rc-line"><span>ITEM</span><span>${esc(CAT[r.category] || r.category)}</span></div>
      <hr class="rc-hr">
      <h3 class="rc-title">${esc(r.title)}</h3>
      <p class="rc-fact">${esc(r.fact)}</p>
      <hr class="rc-hr">
      ${r.amount_usd ? `<div class="rc-total"><span>TOTAL</span><b>${amt}</b></div>` : `<div class="rc-total"><span>${r.category === 'outbreak' ? 'STATUS' : 'TOTAL'}</span><b class="na">${r.category === 'outbreak' ? 'DEVELOPING' : 'PRICELESS'}</b></div>`}
      ${r.quip ? `<p class="rc-quip">“${esc(r.quip)}”</p>` : ''}
      <div class="barcode" aria-hidden="true"></div>
      <a class="rc-src" href="${esc(r.source_url)}" target="_blank" rel="noopener">Source: ${esc(r.source_name)} ↗</a>
      <span class="stamp ${sc}">${st}</span>
    </article>`;
  }

  /* Live market cap */
  async function live() {
    const KEY = 'ph_mcap_v1';
    const paint = d => {
      if (!d) return;
      $$('[data-mcap]').forEach(el => { el.textContent = d.mcap ? fmtMoney(d.mcap) : '—'; el.classList.toggle('down', (d.ch || 0) < 0); });
      $$('[data-price]').forEach(el => el.textContent = d.price ? '$' + (+d.price).toPrecision(3) : '—');
      $$('[data-ch24]').forEach(el => { el.textContent = d.ch == null ? '—' : (d.ch > 0 ? '+' : '') + d.ch.toFixed(1) + '%'; });
      document.dispatchEvent(new CustomEvent('ph:mcap', { detail: d }));
    };
    try { const c = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.t < 60000) return paint(c); } catch {}
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${CONFIG.pair}`);
      const j = await res.json(); const p = (j.pairs || [j.pair])[0];
      if (!p) throw 0;
      const d = { mcap: p.marketCap || p.fdv, price: p.priceUsd, ch: p.priceChange?.h24, liq: p.liquidity?.usd, t: Date.now() };
      try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch {}
      paint(d);
    } catch { document.dispatchEvent(new CustomEvent('ph:mcap', { detail: null })); }
  }

  /* REDLINE: Corporate writes the page, Marjorie (Receipts Dept.) red-pens it.
     Markup: <span class="rl" data-rl="note" data-src="url" data-st="v|w|d|x">corporate copy</span> */
  function redline() {
    const spans = $$('.rl'); if (!spans.length) return;
    if (!$('link[href*="Caveat"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap'; document.head.append(l); }
    const ST = { v: 'VERIFIED', w: 'WEAK SIGNAL', d: 'DEAD END', x: 'DO NOT CLAIM' };
    spans.forEach(sp => {
      const n = document.createElement('span'); n.className = 'rl-note';
      n.innerHTML = `${esc(sp.dataset.rl)}${sp.dataset.src ? ` <a href="${esc(sp.dataset.src)}" target="_blank" rel="noopener">[source]</a>` : ''}${sp.dataset.st ? ` <i class="st-${sp.dataset.st}">${ST[sp.dataset.st]}</i>` : ''} <em>—M.P.</em>`;
      sp.after(n);
    });
    let pref = null; try { pref = localStorage.getItem('ph_redline'); } catch {}
    let on = pref === 'on';
    const btn = document.createElement('button'); btn.className = 'rl-toggle';
    const paint = () => { document.body.classList.toggle('redline-on', on); btn.innerHTML = `<b>Corrections</b><span>${on ? 'ON' : 'OFF'}</span>`; btn.setAttribute('aria-pressed', on); };
    btn.onclick = () => { on = !on; try { localStorage.setItem('ph_redline', on ? 'on' : 'off'); } catch {} paint(); toast(on ? 'Marjorie has entered the chat.' : 'Edits hidden. Corporate thanks you for your trust.'); };
    const host = $('.nav-inner .mcap-chip'); host ? host.before(btn) : document.body.append(btn); paint();
    if (pref === null) setTimeout(() => { on = true; paint(); }, reduced ? 0 : 1600);
  }

  /* Easter eggs: type "sideeffects" or Konami */
  function eggs() {
    let buf = '';
    const K = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let ki = 0;
    addEventListener('keydown', e => {
      if (e.target.matches('input,textarea')) return;
      buf = (buf + e.key.toLowerCase()).slice(-12);
      ki = e.key === K[ki] ? ki + 1 : (e.key === K[0] ? 1 : 0);
      if (buf.endsWith('sideeffects') || ki === K.length) {
        ki = 0; document.body.classList.toggle('side-effects');
        toast(document.body.classList.contains('side-effects') ? 'Side effects may include: this.' : 'Symptoms resolved. Bill is in the mail.');
      }
    });
  }

  function init() {
    document.documentElement.classList.remove('no-js');
    chrome(); copyCA(); redline(); reveal(); counts(); parallax(); timelines(); eggs(); live();
    field($('canvas.field'));
    console.log('%c$PHARMA', 'font:900 28px Inter;color:#55d8ff', '\nYou opened the console. That is how it starts. Type "sideeffects" anywhere on the page.');
  }
  const XSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.7L6.4 3.9H4.6L17.7 20Z"/></svg>';
  const xShare = (text, url) => `<a class="btn xshare" href="https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url || location.href)}" target="_blank" rel="noopener">${XSVG} Post</a>`;
  return { xShare, CONFIG, MASK, $, $$, esc, toast, countUp, fmtMoney, receiptHTML, init, reduced, touch, onScroll, CAT };
})();
document.addEventListener('DOMContentLoaded', PH.init);

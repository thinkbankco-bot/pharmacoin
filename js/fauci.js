/* THE DIARY — every quote verbatim from the Senate PDF, every card cites its page. Selection is the joke. */
document.addEventListener('DOMContentLoaded', () => {
  const F = window.FAUCI; if (!F) return;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtD = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const pdfAt = p => `${F.meta.pdf}#page=${p}`;
  const n = x => (+x).toLocaleString();

  /* hero stats + typed cover */
  $('#stDays').textContent = n(F.meta.days); $('#stWords').textContent = n(F.meta.words); $('#stLogged').textContent = n(F.meta.logged_days); $('#stPress').textContent = n(F.meta.press_days);
  function typeInto(el, text, speed = 14, done) {
    if (reduced) { el.textContent = text; done && done(); return; }
    el.innerHTML = '<span class="cur"></span>'; let i = 0; const cur = el.querySelector('.cur');
    const step = () => { const chunk = text.slice(i, i + (text[i] === ' ' ? 2 : 1)); i += chunk.length; cur.insertAdjacentText('beforebegin', chunk); if (i < text.length) setTimeout(step, speed + (text[i - 1] === '.' ? 160 : 0) + Math.random() * 18); else { setTimeout(() => cur.remove(), 1600); done && done(); } };
    step();
  }
  const cover = $('#coverTyped'); const first = F.days[0], last = F.days[F.days.length - 1];
  typeInto(cover, `${fmtD(first[0])} – ${fmtD(last[0])}\n${F.meta.pdf_pages.toLocaleString()} pages. ${n(F.meta.days)} days. ${n(F.meta.words)} words, typed by the Director himself.\nReleased as a public record by the U.S. Senate, July 2026.\n\nWe read all of it. Marjorie pulled the receipts.`, 12);

  /* picks */
  const TAGS = ['all', 'vanity', 'celebrity', 'trump', 'pharma', 'masks', 'origins', 'admission', 'complaint', 'media', 'family', 'awards', 'food'];
  let filter = 'all', shown = 12, order = F.picks.slice(), shuffled = false;
  const chips = $('#chips'); chips.innerHTML = TAGS.filter(t => t === 'all' || F.picks.some(p => p.tags.includes(t))).map(t => `<button data-t="${t}" class="${t === filter ? 'on' : ''}">${t}</button>`).join('') + `<button class="shuf" id="shuf">Shuffle ↻</button>`;
  chips.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'shuf') { order = F.picks.slice().sort(() => Math.random() - .5); shuffled = true; shown = 12; render(); return; } filter = b.dataset.t; $$('#chips button').forEach(x => x.classList.toggle('on', x === b)); shown = 12; order = F.picks.slice(); shuffled = false; render(); };
  const share = p => { const q = p.quote.length > 180 ? p.quote.slice(0, 177) + '…' : p.quote; const txt = `“${q}”\n— Dr. Fauci’s diary, ${fmtD(p.date)} (Senate release, PDF p. ${p.page})\n\nvia @PharmaCoinSol $PHARMA`; window.open('https://x.com/intent/post?text=' + encodeURIComponent(txt + '\n' + location.href.split('#')[0] + '#picks'), '_blank', 'noopener'); };
  function cardHTML(p, i, top) {
    const r = ((i * 37) % 5 - 2) * .5;
    const inner = `<div class="dt"><span>${esc(fmtD(p.date))}</span><a href="${pdfAt(p.page)}" target="_blank" rel="noopener" title="Open the Senate PDF at this page">PDF p. ${p.page} ↗</a></div><div class="q" data-q="${esc(p.quote)}"></div>${p.context ? `<div class="ctx">${esc(p.context)}</div>` : ''}`;
    const side = `<div class="why">${esc(p.why)} <span style="font-size:.8em">— M.P.</span></div><div class="foot"><span class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</span><button data-share="${i}">Post it</button></div>`;
    return `<article class="card ${top ? 'top' : ''}" style="--r:${r}deg"><span class="pg">p. ${p.page}</span>${top ? `<div>${inner}</div><div class="side">${side}</div>` : inner + side}</article>`;
  }
  const typed = new WeakSet();
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const q = e.target; io.unobserve(q); if (typed.has(q) || !q.dataset.q) return; typed.add(q); typeInto(q, q.dataset.q, 9); }), { rootMargin: '0px 0px -10% 0px' });
  function render() {
    const list = order.filter(p => filter === 'all' || p.tags.includes(filter));
    const el = $('#cards'); el.innerHTML = list.slice(0, shown).map((p, i) => cardHTML(p, i, i === 0 && filter === 'all' && !shuffled)).join('') || `<div class="card"><div class="q">Nothing filed under that yet. Marjorie is still reading.</div></div>`;
    $$('#cards .q').forEach(q => io.observe(q));
    el.querySelectorAll('[data-share]').forEach(b => b.onclick = () => share(list[+b.dataset.share]));
    $('#moreWrap').style.display = list.length > shown ? '' : 'none'; $('#pickCount').textContent = `${list.length} receipts${filter === 'all' ? '' : ' · ' + filter}`;
  }
  $('#more').onclick = () => { shown += 12; render(); }; render();

  /* body count he logged by hand */
  const cv = $('#bcCv'); if (cv && F.series.length > 5) {
    const ctx = cv.getContext('2d'), tip = $('#bcTip'); let hover = -1;
    const S = F.series, t0 = Date.parse(S[0].d), t1 = Date.parse(S[S.length - 1].d);
    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const padL = 10, padR = 70, padT = 20, padB = 28, x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB;
      ctx.strokeStyle = 'rgba(85,216,255,.07)'; for (let x = 0; x < W; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const X = d => x0 + (Date.parse(d) - t0) / (t1 - t0) * (x1 - x0);
      const lg = v => Math.log10(Math.max(1, v)), lo = 2, hi = lg(Math.max(...S.map(s => s.g))) + .1; const Y = v => y1 - (lg(v) - lo) / (hi - lo) * (y1 - y0);
      const line = (key, col, dash) => { ctx.beginPath(); S.forEach((s, i) => i ? ctx.lineTo(X(s.d), Y(s[key])) : ctx.moveTo(X(s.d), Y(s[key]))); ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0; ctx.setLineDash([]); };
      line('g', '#55d8ff'); line('u', '#15a7ff', [4, 3]); line('gd', '#ff3b58'); line('ud', '#ff8a9b', [4, 3]);
      ctx.fillStyle = '#8ea7c1'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
      [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9].filter(v => lg(v) > lo && lg(v) < hi).forEach(v => { ctx.fillText(v >= 1e6 ? v / 1e6 + 'M' : v / 1e3 + 'K', x1 + 8, Y(v) + 4); ctx.strokeStyle = 'rgba(142,167,193,.15)'; ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); });
      ctx.textAlign = 'center'; for (let y = 2020; y <= 2022; y++) for (const m of [0, 6]) { const d = new Date(y, m, 1).getTime(); if (d > t0 && d < t1) ctx.fillText(new Date(d).toLocaleDateString([], { month: 'short', year: '2-digit' }), x0 + (d - t0) / (t1 - t0) * (x1 - x0), H - 8); }
      S.forEach((s, i) => { ctx.beginPath(); ctx.arc(X(s.d), Y(s.g), i === hover ? 5 : 2, 0, 7); ctx.fillStyle = i === hover ? '#fff' : 'rgba(85,216,255,.6)'; ctx.fill(); });
      if (hover >= 0) { const s = S[hover]; ctx.strokeStyle = 'rgba(234,245,255,.3)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(s.d), y0); ctx.lineTo(X(s.d), y1); ctx.stroke(); ctx.setLineDash([]); }
    }
    cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left; let best = -1, bd = 1e9; S.forEach((s, i) => { const d = Math.abs((10 + (Date.parse(s.d) - t0) / (t1 - t0) * (r.width - 80)) - x); if (d < bd) { bd = d; best = i; } }); hover = best; const s = S[best]; tip.innerHTML = `<b style="color:var(--amber)">${esc(fmtD(s.d))}</b> · he wrote: Global ${n(s.g)} / ${n(s.gd)} · USA ${n(s.u)} / ${n(s.ud)}`; tip.style.left = Math.min(r.width - 10, Math.max(10, x)) + 'px'; tip.style.top = '20px'; tip.style.opacity = 1; draw(); });
    cv.addEventListener('pointerleave', () => { hover = -1; tip.style.opacity = 0; draw(); });
    addEventListener('resize', draw); draw();
    $('#bcNote').textContent = `${n(F.meta.logged_days)} entries open with a count line; ${F.series.length} of them parse cleanly into all four numbers and are plotted. The rest had typos or truncated figures we refused to guess at. Log scale · dashed = USA.`;
  }

  /* scoreboard */
  const bars = $('#bars'); const mx = F.names[0].n;
  bars.innerHTML = F.names.filter(x => x.n > 0).slice(0, 16).map(x => `<div><span>${esc(x.name)}</span><i style="transform:scaleX(${x.n / mx})"></i><b>${n(x.n)}</b></div>`).join('');
  new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .2 }).observe(bars);
  $('#pressBig').innerHTML = `${n(F.meta.press_days)}<small> days with a “PRESS:” line</small>`;
  $('#pressList').innerHTML = F.press.map(([o, c]) => `<li><span>${esc(o)}</span><b>${c}</b></li>`).join('');

  /* read a day */
  let entries = null, year = '2020';
  const years = $('#years'); years.innerHTML = ['2020', '2021', '2022'].map(y => `<button data-y="${y}" class="${y === year ? 'on' : ''}">${y} · ${F.days.filter(d => d[0].startsWith(y)).length} days</button>`).join('');
  years.onclick = e => { const b = e.target.closest('button'); if (!b) return; year = b.dataset.y; $$('#years button').forEach(x => x.classList.toggle('on', x === b)); strip(); };
  const wmax = Math.max(...F.days.map(d => d[1]));
  function strip() { $('#daystrip').innerHTML = F.days.filter(d => d[0].startsWith(year)).map(d => `<button data-d="${d[0]}" style="--w:${Math.min(1, d[1] / wmax * 3)}" title="${d[1]} words · PDF p. ${d[2]}">${d[0].slice(5)}</button>`).join(''); }
  strip();
  $('#daystrip').onclick = async e => { const b = e.target.closest('button'); if (!b) return; $$('#daystrip button').forEach(x => x.classList.toggle('on', x === b)); await openDay(b.dataset.d); };
  async function openDay(d) {
    const R = $('#reader'); R.classList.add('on'); R.querySelector('pre').textContent = 'pulling the page…';
    if (!entries) { try { entries = await (await fetch('data/fauci_entries.json')).json(); } catch { R.querySelector('pre').textContent = 'Could not load the entries file.'; return; } }
    const en = entries[d]; if (!en) { R.querySelector('pre').textContent = 'No entry that day.'; return; }
    R.querySelector('.rh').innerHTML = `<b>${esc(fmtD(d))}</b><span>${n(en.w)} words · PDF pp. ${en.p[0]}–${en.p[1]}</span><a href="${pdfAt(en.p[0])}" target="_blank" rel="noopener">Check it against the PDF ↗</a>`;
    R.querySelector('pre').textContent = en.t;
    R.querySelector('.note').textContent = en.t.includes('PRESS:') ? 'He logged his own press hits that day. Of course he did. — M.P.' : /Global/.test(en.t.slice(0, 300)) ? 'Opened with the body count, as usual. — M.P.' : 'Verbatim, line breaks and typos as extracted. — M.P.';
    if (location.hash !== '#' + d) history.replaceState(null, '', '#reader'); R.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  const rnd = $('#randomDay'); if (rnd) rnd.onclick = () => { const d = F.days[Math.random() * F.days.length | 0][0]; year = d.slice(0, 4); $$('#years button').forEach(x => x.classList.toggle('on', x.dataset.y === year)); strip(); openDay(d); };
});

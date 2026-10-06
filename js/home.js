/* Home page behaviors */
document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc, fmtMoney, receiptHTML, reduced } = PH;
  const R = (window.RECEIPTS || []).slice();
  $$('.rx-mask').forEach(m => m.innerHTML = PH.MASK);

  /* Today's dose number (Dose #1 = Oct 5, 2026 UTC) */
  const doseNo = Math.max(0, Math.floor((Date.now() - Date.UTC(2026, 9, 5)) / 864e5)) + 1;
  if ($('#heroDose')) $('#heroDose').textContent = `Daily Dose #${doseNo}`; if ($('#ctaDose')) $('#ctaDose').textContent = doseNo; if ($('#faxNo')) $('#faxNo').textContent = `DOSE #${doseNo}`;
  const now = new Date(); $('#filled').textContent = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(2)}`;

  /* Ticker */
  const money = R.filter(r => r.amount_usd).sort((a, b) => b.amount_usd - a.amount_usd);
  const items = money.slice(0, 18).map(r => `<span class="ticker-item"><b>${esc(r.company.split(',')[0])}</b> ${esc(r.year)} <span class="amt">${fmtMoney(r.amount_usd)}</span> ${esc(PH.CAT[r.category] || r.category)}</span>`).join('');
  if ($('#ticker')) $('#ticker').innerHTML = items + items;

  /* Formulary shelf */
  const F = window.FORMULARY || [];
  const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
  if ($('#shelfCount')) $('#shelfCount').textContent = WORDS[F.length] || String(F.length);
  if (window.PHX && $('#homeShelf')) {
    $('#homeShelf').innerHTML = F.slice(0, 10).map((d, i) => `<a class="sku" href="formulary.html#${d.id}" style="--c:${d.color};text-decoration:none">
      <span class="sku-ndc">NDC 0420-${String(i + 1).padStart(3, '0')}</span><span class="sku-art">${PHX.art(d)}</span>
      <span class="sku-name">${esc(d.name)}<sup>®</sup></span><span class="sku-gen">(${esc(d.pron)})</span><span class="sku-tag">${esc(d.tag)}</span></a>`).join('');
  }

  /* Settlement stack: biggest receipts, ordered by year */
  const stackSet = money.slice(0, 6).sort((a, b) => a.year - b.year);
  const stack = $('#stack');
  stack.innerHTML = stackSet.map(r => receiptHTML(r)).join('');
  const cards = $$('.receipt', stack);
  cards.forEach((c, i) => { c.style.top = `calc(var(--bar) + 30px + ${i * 12}px)`; c.style.zIndex = i + 1; c.style.rotate = `${(i % 2 ? 1 : -1) * (0.6 + (i % 3) * .5)}deg`; });
  const total = money.reduce((s, r) => s + r.amount_usd, 0);
  const stackTotal = stackSet.reduce((s, r) => s + r.amount_usd, 0);
  $('#allCount').textContent = stackSet.length;
  const runTotal = $('#runTotal'), runCount = $('#runCount'), runCo = $('#runCo'), meter = $('#runMeter');
  let shown = -1, cur = 0, anim;
  const animateTo = to => {
    cancelAnimationFrame(anim);
    const from = cur, t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / 650, 1), e = 1 - Math.pow(1 - p, 3); cur = from + (to - from) * e; runTotal.textContent = fmtMoney(cur); if (p < 1) anim = requestAnimationFrame(step); };
    reduced ? (cur = to, runTotal.textContent = fmtMoney(to)) : (anim = requestAnimationFrame(step));
  };
  PH.onScroll(() => {
    const sr = stack.getBoundingClientRect();
    if (sr.bottom < -200 || sr.top > innerHeight + 200) return; // off-screen: skip the per-card work
    const line = innerHeight * .62;
    let n = 0; for (const c of cards) { if (c.getBoundingClientRect().top < line) n++; else break; }
    if (n === shown) return; shown = n;
    const sum = stackSet.slice(0, n).reduce((s, r) => s + r.amount_usd, 0);
    animateTo(sum);
    runCount.textContent = n;
    runCo.textContent = n ? `last: ${stackSet[n - 1].company.split(',')[0]}${stackSet[n - 1].company.includes(',') ? ' et al.' : ''}` : 'scroll to print';
    meter.style.width = (sum / stackTotal * 100) + '%';
  });

  $('#compare').innerHTML = [
    ['Receipts in the full archive', R.length],
    ['Archive raw sum (some deals overlap)', fmtMoney(total)],
    ['Biggest single receipt', money[0] ? `${fmtMoney(money[0].amount_usd)} · ${money[0].company.split(',')[0]} et al.` : '—'],
  ].map(([a, b]) => `<div><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('');

  /* Mission bar: progress to being fined like Pfizer (2009, $2.3B) */
  document.addEventListener('ph:mcap', e => {
    const d = e.detail;
    if (!$('#missionPct')) return; if (!d || !d.mcap) { $('#missionPct').textContent = 'chart offline'; return; }
    const pct = d.mcap / 2.3e9 * 100;
    $('#missionPct').textContent = pct.toFixed(pct < .01 ? 4 : 2) + '%';
    requestAnimationFrame(() => $('#missionBar').style.width = Math.max(pct, .4) + '%');
  });
});

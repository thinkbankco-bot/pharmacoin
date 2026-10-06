/* Top Prescribers: renders data/prescribers.js (built by tools/prescribers_build.py) */
document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc } = PH;
  const D = window.PRESCRIBERS;
  const num = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n);
  const x = h => `https://x.com/${encodeURIComponent(h)}`;
  const post = (h, id) => `https://x.com/${encodeURIComponent(h)}/status/${encodeURIComponent(id)}`;
  const av = (r, cls = '') => `<img class="av ${cls}" src="${esc((r.avatar || '').replace('_normal', '_200x200'))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`;

  const S = [['Prescribers', D ? D.totals.prescribers : 0], ['Scripts written', D ? D.totals.scripts : 0], ['Total reach', D ? D.totals.reach : 0], ['Likes', D ? D.totals.likes : 0]];
  $('#pStats').innerHTML = S.map(([l, n], i) => `<div class="stat"><div class="n ${i === 2 ? 'amber' : ''}">${num(n)}</div><div class="l">${l}</div><div class="s">${i ? 'since ' + (D ? D.since : '—') : 'ranked holders'}</div></div>`).join('');

  if (!D || !D.board || !D.board.length) { $('#empty').classList.remove('hidden'); return; }
  $('#genAt').textContent = `last sweep ${D.generated}`;
  $('#board').classList.remove('hidden');
  const B = D.board;

  const one = B[0];
  $('#potm').innerHTML = `
    <div class="potm-head">PRESCRIBER OF THE MONTH</div>
    <div class="potm-body">
      ${av(one, 'big')}
      <div><div class="dec d10">DECILE ${one.decile}</div><h3><a href="${x(one.handle)}" target="_blank" rel="noopener">${esc(one.name)}</a></h3><div class="hdl">@${esc(one.handle)}</div></div>
    </div>
    <div class="potm-stats"><div><b>${one.score}</b><span>impact</span></div><div><b>${one.scripts}</b><span>scripts</span></div><div><b>${one.refills}</b><span>refills</span></div><div><b>${num(one.reach)}</b><span>reach</span></div></div>
    <a class="potm-quote" href="${post(one.handle, one.best.id)}" target="_blank" rel="noopener">“${esc(one.best.text)}”<span>Best script · ${esc(one.best.date)} · ${num(one.best.likes)} likes · ${num(one.best.views)} views ↗</span></a>
    <div class="potm-foot">Awarded by Dr. Hollis Fennwick. Lunch not included (that’s regulated now, mostly).</div>`;
  $('#podium').innerHTML = B.slice(1, 5).map(r => `<a class="pod" href="${x(r.handle)}" target="_blank" rel="noopener"><span class="pod-rank">#${r.rank}</span>${av(r)}<span class="pod-n">${esc(r.name)}<small>@${esc(r.handle)}</small></span><span class="pod-s">${r.score}<small>impact</small></span></a>`).join('');

  function render() {
    const q = $('#pq').value.toLowerCase().trim();
    const list = B.filter(r => !q || (r.handle + ' ' + r.name).toLowerCase().includes(q));
    $('#pCount').textContent = `${list.length} of ${B.length}`;
    $('#dtable').innerHTML = `<div class="drow dh"><span>#</span><span>Prescriber</span><span>Decile</span><span>Impact</span><span>Scripts</span><span>Refills</span><span>Reach</span><span></span></div>` +
      list.map(r => `<div class="drow"><span class="rk">${r.rank}</span><a class="who" href="${x(r.handle)}" target="_blank" rel="noopener">${av(r)}<span>${esc(r.name)}<small>@${esc(r.handle)}</small></span></a><span><i class="dec d${r.decile}">D${r.decile}</i></span><span class="sc">${r.score}</span><span>${r.scripts}</span><span>${r.refills}</span><span>${num(r.reach)}</span><a class="bp" href="${post(r.handle, r.best.id)}" target="_blank" rel="noopener" title="${esc(r.best.text)}">best ↗</a></div>`).join('');
  }
  $('#pq').addEventListener('input', render);
  render();

  const s = D.script_of_week;
  if (s) {
    $('#sotwSec').hidden = false;
    $('#sotw').innerHTML = `<a class="tweet" href="${post(s.handle, s.id)}" target="_blank" rel="noopener"><div class="tw-h">${av(s)}<span><b>${esc(s.name)}</b><small>@${esc(s.handle)} · ${esc(s.date)}</small></span><span class="stamp v" style="margin-left:auto">FILLED</span></div><p>${esc(s.text)}</p><div class="tw-f"><span>${num(s.likes)} likes</span><span>${num(s.rts)} reposts</span><span>${num(s.views)} views</span><span style="margin-left:auto">open on X ↗</span></div></a>`;
  }
});

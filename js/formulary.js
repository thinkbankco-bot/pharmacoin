/* The Formulary */
window.PHX = window.PHX || {};
/* Community meme art when we have it, code-drawn bottle otherwise */
PHX.art = d => d.img ? `<img class="sku-img" src="${d.img}" alt="${d.name} (community meme)" loading="lazy">` : PHX.bottle(d);
/* Product art: drawn in code so every product gets a consistent pharmacy look */
PHX.bottle = (d, w = 150) => {
  const c = d.color, n = d.name.length > 11 ? 13 : 16;
  const label = `<text x="75" y="118" text-anchor="middle" font-family="Inter,Arial" font-weight="900" font-size="${n}" letter-spacing="-.5" fill="#15181d">${d.name}</text><text x="75" y="133" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#6b6252">${d.form.toUpperCase()} · $PHARMA</text>`;
  if (d.form === 'injection') return `<svg viewBox="0 0 150 200" width="${w}" aria-hidden="true">
    <rect x="52" y="18" width="46" height="24" rx="5" fill="${c}"/><rect x="58" y="40" width="34" height="14" fill="#cbd5e1"/>
    <rect x="40" y="52" width="70" height="132" rx="14" fill="rgba(220,238,255,.22)" stroke="rgba(220,238,255,.55)" stroke-width="2"/>
    <rect x="44" y="120" width="62" height="60" rx="10" fill="${c}" opacity=".35"/>
    <rect x="34" y="92" width="82" height="50" rx="4" fill="#f3efe4"/><rect x="34" y="92" width="82" height="8" fill="${c}"/>
    ${label.replace(/y="118"/, 'y="120"').replace(/y="133"/, 'y="134"').replace(/x="75"/g, 'x="75"')}
    <rect x="47" y="58" width="6" height="110" rx="3" fill="rgba(255,255,255,.35)"/></svg>`;
  if (d.form === 'solution') return `<svg viewBox="0 0 150 200" width="${w}" aria-hidden="true">
    <rect x="62" y="8" width="26" height="30" rx="10" fill="#1e293b"/><rect x="58" y="34" width="34" height="16" rx="3" fill="${c}"/>
    <path d="M44 58c0-6 6-10 12-10h38c6 0 12 4 12 10v118c0 8-6 14-14 14H58c-8 0-14-6-14-14Z" fill="#7c2d12" opacity=".92"/>
    <rect x="40" y="88" width="70" height="58" rx="4" fill="#f3efe4"/><rect x="40" y="88" width="70" height="9" fill="${c}"/>
    ${label}
    <rect x="50" y="60" width="7" height="110" rx="3.5" fill="rgba(255,255,255,.18)"/></svg>`;
  return `<svg viewBox="0 0 150 200" width="${w}" aria-hidden="true">
    <rect x="30" y="12" width="90" height="34" rx="7" fill="#f8fafc"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<rect x="${36 + i * 9.5}" y="16" width="3" height="26" rx="1.5" fill="#cbd5e1"/>`).join('')}
    <rect x="34" y="44" width="82" height="10" fill="${c}"/>
    <path d="M36 54h78v120c0 8-6 14-14 14H50c-8 0-14-6-14-14Z" fill="#c2410c"/><path d="M36 54h78v120c0 8-6 14-14 14H50c-8 0-14-6-14-14Z" fill="url(#none)" opacity="0"/>
    <rect x="32" y="88" width="86" height="58" rx="3" fill="#f3efe4"/><rect x="32" y="88" width="86" height="9" fill="${c}"/>
    ${label}
    <rect x="44" y="58" width="7" height="118" rx="3.5" fill="rgba(255,255,255,.22)"/></svg>`;
};

document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc, receiptHTML, toast } = PH;
  if (!document.getElementById('shelf')) return;
  const F = window.FORMULARY || [];
  const RX = Object.fromEntries((window.RECEIPTS || []).map(r => [r.id, r]));
  const FORMS = { all: 'All forms', capsule: 'Capsules', tablet: 'Tablets', solution: 'Solutions', injection: 'Injectables' };
  let form = 'all';
  $('#fCount').textContent = F.length;
  $('#fForms').innerHTML = Object.entries(FORMS).filter(([k]) => k === 'all' || F.some(d => d.form === k)).map(([k, v]) => `<button class="chip ${k === 'all' ? 'on' : ''}" data-form="${k}">${v}</button>`).join('');

  const card = (d, i) => `<button class="sku rv" data-id="${d.id}" style="--c:${d.color};transition-delay:${(i % 4) * 60}ms">
      <span class="sku-ndc">NDC 0420-${String(i + 1).padStart(3, '0')}</span>
      <span class="sku-art">${PHX.art(d)}</span>
      <span class="sku-name">${esc(d.name)}<sup>®</sup></span>
      <span class="sku-gen">(${esc(d.pron)})</span>
      <span class="sku-tag">${esc(d.tag)}</span>
      <span class="sku-cls">${esc(d.cls)}</span>
    </button>`;
  function render() {
    const q = $('#fq').value.toLowerCase().trim();
    const list = F.filter(d => (form === 'all' || d.form === form) && (!q || JSON.stringify(d).toLowerCase().includes(q)));
    $('#shelf').innerHTML = list.map((d) => card(d, F.indexOf(d))).join('') || `<p class="empty">No products found. Try Forgetademic® for best results.</p>`;
    $('#fShown').textContent = `${list.length} of ${F.length}`;
    $$('.sku').forEach(b => { b.onclick = () => open(b.dataset.id); requestAnimationFrame(() => b.classList.add('in')); });
  }
  $('#fq').addEventListener('input', render);
  $$('[data-form]').forEach(b => b.onclick = () => { form = b.dataset.form; $$('[data-form]').forEach(x => x.classList.toggle('on', x === b)); render(); });
  render();

  const dlg = $('#dlg');
  function open(id) {
    const d = F.find(x => x.id === id); if (!d) return;
    const r = RX[d.rx];
    const i = F.indexOf(d);
    $('#pi').innerHTML = `
      <button class="pi-x" aria-label="Close">×</button>
      <div class="pi-top">
        <div class="pi-art">${d.img ? `<img src="${d.img}" alt="${esc(d.name)} (community meme)">` : PHX.bottle(d, 170)}</div>
        <div>
          <div class="pi-kick">HIGHLIGHTS OF PRESCRIBING INFORMATION</div>
          <h2 id="dName">${esc(d.name)}<sup>®</sup> <small>(${esc(d.generic)})</small></h2>
          <div class="pi-meta">${esc(d.form)} · ${esc(d.cls)} · NDC 0420-${String(i + 1).padStart(3, '0')} · Initial U.S. Approval: never</div>
          <p class="pi-tag">“${esc(d.tag)}”</p>
        </div>
      </div>
      <div class="pi-box"><b>WARNING:</b> ${esc(d.box)}</div>
      <div class="pi-grid">
        <div><h4>1 INDICATIONS AND USAGE</h4><ul>${d.ind.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
             <h4>2 DOSAGE AND ADMINISTRATION</h4><p>${esc(d.dose)}</p>
             <h4>4 CONTRAINDICATIONS</h4><ul>${d.contra.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
             <h4>6 ADVERSE REACTIONS</h4><ul>${d.se.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
             <h4>HOW SUPPLIED</h4><p>On Solana, in a Guy Fawkes mask, by people who read footnotes. Not available at any pharmacy, thank God.</p></div>
        <div><h4>14 CLINICAL HISTORY <span class="realtag">REAL</span></h4><p>${esc(d.hist)}</p>
             ${r ? receiptHTML(r) : ''}</div>
      </div>
      <div class="pi-foot"><span>FICTIONAL PRODUCT · SATIRE · NOT MEDICAL ADVICE · artwork: $PHARMA community, via the Meme Depot</span>
        <span class="actions" style="gap:8px"><button class="btn" data-share="${d.id}">Copy link</button><a class="btn primary" data-buy href="${PH.CONFIG.buy}" target="_blank" rel="noopener">Fill prescription</a></span></div>`;
    $('.pi-x', dlg).onclick = () => dlg.close();
    $('[data-share]', dlg).onclick = async () => { const u = location.href.split('#')[0] + '#' + d.id; try { await navigator.clipboard.writeText(u); toast('Link copied. Share responsibly.'); } catch { toast(u); } };
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    history.replaceState(null, '', '#' + d.id);
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => history.replaceState(null, '', location.pathname));
  if (location.hash) open(location.hash.slice(1));
});

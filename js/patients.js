/* THE WARD — Patient Files. Ward board, walk-in clinic, then each full file in the order its thread ran.
   Every number comes from data/patients.js (requests[] is the source of truth). Every quote links to its post. */
document.addEventListener('DOMContentLoaded', () => {
  /* Held files (consent: 'pending') never render on the live page; flip consent in data/patients.js to publish. */
  const P = (window.PATIENTS || []).filter(p => p.consent && p.consent !== 'pending');
  const W = window.WALKINS || [];
  const F = Object.fromEntries((window.FORMULARY || []).map(d => [d.id, d]));
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = v => (+v || 0).toLocaleString('en-US');
  const fmtD = (s, yr = true) => { const d = new Date(String(s).slice(0, 10) + 'T00:00:00Z'); return isNaN(d) ? esc(s) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(yr ? { year: 'numeric' } : {}), timeZone: 'UTC' }); };
  const xurl = (h, id) => `https://x.com/${encodeURIComponent(h)}/status/${encodeURIComponent(id)}`;
  const url = (p, id) => xurl(p.handle, id);
  const FLAG = { CRIT: ['crit', 'CRITICAL'], H: ['hi', 'H ▲'], L: ['lo', 'L ▼'], E: ['el', 'ELEVATED'], N: ['ok', 'NORMAL ✓'], NOTE: ['na', 'NOTED'], '-': ['na', '—'] };
  const av = (p, cls) => `<span class="${cls}" ${p.avatar ? `style="background-image:url('${esc(p.avatar)}')"` : ''}></span>`;
  const link = (p, id, txt = 'post ↗') => id ? `<a href="${url(p, id)}" target="_blank" rel="noopener">${txt}</a>` : '';
  const img = (src, w, h, alt, cls = '') => `<a class="wd-card ${cls}" href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async"></a>`;

  /* totals recomputed from requests[] so the page can never drift from the source of truth */
  const sum = p => {
    const t = { usd: 0, gbp: 0, sol: 0, other: 0, usdN: 0 };
    for (const r of p.requests || []) {
      const a = String(r.amt), v = +a.replace(/[^0-9.]/g, '');
      if (a.startsWith('$')) { t.usd += v; t.usdN++; } else if (a.startsWith('£')) t.gbp += v; else if (/SOL$/.test(a)) t.sol += v; else t.other++;
    }
    return t;
  };

  /* ---------- WARD BOARD ---------- */
  const board = $('#wdBoard');
  const p1 = P.find(p => !p.genome);
  const g2 = P.find(p => p.no === '002' && p.genome);   // live only once consent is flipped
  const beds = [
    p1 && { bed: p1.no, p: p1, status: 'FILE COMPLETE', cls: 'done' },
    g2 ? { bed: '002', p: g2, status: 'DNA REPORT FINAL', cls: 'done' } : { bed: '002', status: 'BLOODWORK IN PROGRESS', cls: 'prog' },
    { bed: '003', status: 'BED AVAILABLE', cls: 'free' },
    { bed: '004', status: 'BED AVAILABLE', cls: 'free' },
  ].filter(Boolean);
  const occupied = beds.filter(b => b.cls !== 'free').length;
  const row = b => {
    if (b.p && b.p.genome) {
      const p = b.p, G = p.genome;
      return `<a class="wb-row done" href="#file-${esc(p.no)}">
        <span class="wb-bed"><small>BED</small>#${esc(b.bed)}</span>
        <span class="wb-pt">${av(p, 'wb-av')}<span><b>@${esc(p.handle)}</b><i>${esc(p.name)} · MRN ${esc(p.no)}</i></span></span>
        <span class="wb-st"><i class="wb-led"></i>${b.status}</span>
        <span class="wb-vals">
          <span class="red"><b>1→12</b><em>children reported</em></span>
          <span><b>0</b><em>sightings</em></span>
          <span class="red"><b>${esc(G.age.rate)}</b><em>yrs per yr</em></span>
          <span><b>${n(G.relatives.rows.length)}</b><em>DNA matches</em></span>
          <span><b>${n(p.specimen.corpus)}</b><em>posts sequenced · 2022–2026</em></span>
        </span>
        <span class="wb-go">Open file →</span>
      </a>`;
    }
    if (b.p) {
      const p = b.p, s = p.specimen, t = sum(p);
      return `<a class="wb-row done" href="#file-${esc(p.no)}">
        <span class="wb-bed"><small>BED</small>#${esc(b.bed)}</span>
        <span class="wb-pt">${av(p, 'wb-av')}<span><b>@${esc(p.handle)}</b><i>${esc(p.name)} · MRN ${esc(p.no)}</i></span></span>
        <span class="wb-st"><i class="wb-led"></i>${b.status}</span>
        <span class="wb-vals">
          <span><b>${n(p.requests.length)}</b><em>requests</em></span>
          <span class="red"><b>$${n(t.usd)}</b><em>asked</em></span>
          <span class="grn"><b>$0</b><em>received</em></span>
          <span><b>${n(s.days)}</b><em>days</em></span>
          <span><b>${n(s.drawn)}</b><em>posts drawn · ${s.pct}% of ${n(s.archived)}</em></span>
        </span>
        <span class="wb-go">Open file →</span>
      </a>`;
    }
    return `<div class="wb-row ${b.cls}">
      <span class="wb-bed"><small>BED</small>#${esc(b.bed)}</span>
      <span class="wb-pt"><span class="wb-av empty"></span><span><b class="redact" aria-label="not disclosed">${b.cls === 'prog' ? '██████████' : '—'}</b><i>${b.cls === 'prog' ? 'Name withheld until results are final' : 'Unassigned'}</i></span></span>
      <span class="wb-st"><i class="wb-led"></i>${b.status}</span>
      <span class="wb-vals wb-note">${b.cls === 'prog' ? '<span class="vial" aria-hidden="true"><u></u></span>Specimen in centrifuge. Do not tap the glass.' : 'Linens changed. Awaiting a “draw me.”'}</span>
      <span class="wb-go dim">${b.cls === 'prog' ? 'Pending' : 'Vacant'}</span>
    </div>`;
  };
  board.innerHTML = `<div class="wb-top">
      <span class="wb-title"><b>WARD 4</b> · DIGITAL HEMATOLOGY</span>
      <span>ATTENDING <b>${esc(p1?.attending || 'Dr. H. Fennwick (hon.)')}</b></span>
      <span>CENSUS <b>${occupied}/${beds.length}</b></span>
      <span class="wb-clock" id="wbClock">--:-- UTC</span>
    </div>
    <div class="wb-head" aria-hidden="true"><span>Bed</span><span>Patient</span><span>Status</span><span>Key values</span><span></span></div>
    ${beds.map(row).join('')}
    <div class="wb-foot"><span>Worklist sorted by bed</span><span>Files built from public posts only</span><span>Wallets: not examined</span></div>`;
  const clock = () => { const d = new Date(); const el = $('#wbClock'); if (el) el.textContent = d.toISOString().slice(11, 16) + ' UTC'; };
  clock(); setInterval(clock, 30000);

  /* ---------- WALK-IN CLINIC ---------- */
  $('#wdWalk').innerHTML = W.map(w => `<div class="wk">
      <a class="wk-img" href="${esc(w.card)}" target="_blank" rel="noopener"><img src="${esc(w.card)}" width="1080" height="1350" alt="Prescription label for @${esc(w.handle)}" loading="lazy" decoding="async"></a>
      <div class="wk-tx"><a class="wk-h" href="https://x.com/${esc(w.handle)}" target="_blank" rel="noopener">@${esc(w.handle)}</a>
        <q>${esc(w.said)}</q>
        <span class="wk-c">Dx: ${esc(w.condition)}</span>
        <span class="wk-rx">℞ ${esc(w.drug)} · refills unlimited</span></div>
    </div>`).join('') || '<p class="wk-empty">No walk-ins today.</p>';

  /* ---------- FILE #002 · THE DNA REPORT (any live record with a genome block) ----------
     Rendered into its own section after #file-001. Pending records never reach this point (filtered above). */
  function renderGenome(p) {
    const G = p.genome, L = (id, txt = 'post ↗') => link(p, id, txt);
    const card = r => (G.cards || []).find(c => c.report === r) || {};
    const cimg = (r, alt) => { const c = card(r); if (!c.file) return ''; const [w, h] = c.size.split('x').map(Number); return img(c.file, w, h, alt, w > h ? 'wide' : 'port'); };
    const qt = (q, cls = '') => q ? `<q class="${cls}">${esc(q.text)}</q> ${L(q.id)}` : '';
    const st = (no, id, kicker, title, body) => `<article class="wd-step dna" id="p${esc(p.no)}-${id}">
      <div class="wd-step-h"><span class="no">${no}</span><div><span class="k">${kicker}</span><h3>${title}</h3></div></div>${body}</article>`;
    const sec = document.createElement('section');
    sec.className = 'wd-sec wd-file-sec'; sec.id = `file-${p.no}`;
    const after = document.getElementById('file-001');
    (after ? after.after(sec) : $('#method').before(sec));
    const consentDate = (String(p.consent).match(/\d{4}-\d{2}-\d{2}/) || [])[0];
    const A = G.age, T = G.tree, AN = G.ancestry, GE = G.genes, R = G.relatives, HE = G.health, PR = G.predictions;
    const fmtT = s => String(s).slice(11, 16);

    /* 01 age */
    const ageRow = (q, lbl) => `<li><span class="d">${fmtD(q.date)}</span><span class="t"><q>${esc(q.text)}</q> ${L(q.id)}</span>${lbl ? `<span class="v">${lbl}</span>` : ''}</li>`;
    const ageBlock = `<div class="wd-paper dna-age">
      <div class="dna-age-g">
        <div><div class="pf-lbl">Patient #${esc(p.no)} · age</div><ol class="dna-rec">${ageRow(A.records[0])}${ageRow(A.records[1])}</ol>
          <div class="dna-rate">Rate: ${esc(A.rate)} <small>yrs per yr</small></div></div>
        <div><div class="pf-lbl">Son</div><ol class="dna-rec">${A.son.records.map(q => ageRow(q)).join('')}</ol>
          <div class="dna-rate">Rate: −${esc(Math.abs(A.son.rate))} <small>yrs per yr</small></div></div>
      </div>
      <p class="dna-line">${esc(A.line)}</p>
      <p class="dna-fine">Third record: <q>${esc(A.records[2].text)}</q> ${L(A.records[2].id)} (${fmtD(A.records[2].date)}). Age has held at 36 for ${n(A.stableDays)} days. At his 2024–26 rate he is now about ${esc(A.projectedNow)}. Method: ${esc(A.rateRule)}.</p>
    </div>`;

    /* 02 tree */
    const node = nd => {
      const q = nd.quote ? `<q>${esc(nd.quote.text)}</q> ${L(nd.quote.id)}` : nd.cardId ? `<q>${esc(nd.cardLine)}</q> ${L(nd.cardId)}` : `<i class="dna-desc">label only · post on file</i> ${L(nd.id)}`;
      const also = nd.also ? ` → <q>${esc(nd.also.text)}</q> ${L(nd.also.id)}` : '';
      const off = nd.card === false;
      return `<li class="${off ? 'off' : ''}"><b>${esc(nd.label)}${nd.posts ? ` <em>· ${n(nd.posts)} posts</em>` : ''}</b><span>${q}${also}</span>${off ? '<i class="dna-tag">ward only</i>' : ''}</li>`;
    };
    const grp = (k, t) => { const xs = T.nodes.filter(x => x.group === k); return xs.length ? `<div class="pf-lbl">${t} <em>· ${xs.length}</em></div><ul class="dna-nodes">${xs.map(node).join('')}</ul>` : ''; };
    const B = T.budget;
    const treeBlock = `<div class="wd-two rx">
      <div class="wd-paper">
        <p class="dna-hl">${esc(T.headline)}</p><p class="dna-fine">${esc(T.headlineNote)}</p>
        ${grp('marriage', 'The marriage')}${grp('partners', 'Partners')}${grp('dependents', 'Dependents')}${grp('household', 'Household')}
        <div class="pf-lbl">Household budget <em>· per patient</em></div>
        <div class="dna-bud">
          <span>Income<b>$${n(B.incomePerMonth)}<small>/mo</small></b>${L(B.xPerWeek.id, '$50/wk X + $200/wk ↗')}</span>
          <span>Lambo lease<b>$${n(B.lamboLeasePerMonth.usd)}<small>/mo</small></b>${L(B.lamboLeasePerMonth.id)}</span>
          <span>Life savings<b>$${n(B.lifeSavings.usd)}</b>${L(B.lifeSavings.id)}</span>
          <span>Net worth<b>${esc(B.netWorth.value)}</b>${L(B.netWorth.id)}</span>
        </div>
        <p class="dna-fen">“${esc(T.fennwick)}”<small>— ${esc(p.attending)}</small></p>
      </div>
      <div class="wd-side port">${cimg('2', 'Family tree card: children reported 1 → 12, sightings 0')}</div>
    </div>`;

    /* A ancestry */
    const comp = AN.composition, COL = { scooter: '#c4122f', imperator: '#1b5fb0', imperooter: '#1f9d6b' };
    const ancBlock = `<div class="wd-two rx">
      <div class="wd-paper">
        <div class="pf-lbl">Ancestry composition <em>· self-references, n = ${n(AN.n)}</em></div>
        <div class="dna-bar">${Object.entries(comp).map(([k, v]) => `<i style="width:${v.pct}%;background:${COL[k]}"></i>`).join('')}</div>
        <ul class="dna-comp">${Object.entries(comp).map(([k, v]) => `<li><b style="color:${COL[k]}">${v.pct}%</b><span>${k[0].toUpperCase() + k.slice(1)} · ${n(v.posts)} posts</span></li>`).join('')}</ul>
        <div class="pf-lbl">Timeline</div>
        <ol class="dna-tl">${AN.timeline.map(e => `<li><span class="d">${esc(e.label)}</span><span class="t">${qt(e.quote)}</span></li>`).join('')}</ol>
        <p class="dna-fine">Silence: ${esc(AN.gap.exact)}, ${esc(String(AN.gap.from).slice(0, 10))} → ${esc(String(AN.gap.to).slice(0, 10))}. “Shadowban”: ${n(AN.shadowban.y2024)} times in 2024, ${n(AN.shadowban.y2026)} in 2026.</p>
        <div class="pf-lbl">Heritable trait <em>· the homerun, ${AN.homeruns.list.length} on file</em></div>
        <ul class="dna-hr">${AN.homeruns.list.map(h => `<li><b>${esc(h.surname)}</b><span>${fmtD(h.at)}</span>${L(h.id)}</li>`).join('')}</ul>
      </div>
      <div class="wd-side port">${cimg('A', 'Ancestry card: 69% Scooter, 25% Imperator, 6% Imperooter')}</div>
    </div>`;

    /* 03 genes: all 12 rows */
    const side = (arr, sum) => sum ? `<span class="sum">${esc(sum)}</span>${Array.isArray(arr) && arr[0] && arr[0].id ? ' ' + L(arr[0].id) : ''}`
      : (arr || []).map(q => `<q>${esc(q.text || q.phrase)}</q> ${L(q.id)}${q.back ? ` <small>back in ${esc(q.back)}</small>` : ''}`).join('<br>');
    const geneBlock = `<div class="wd-two rx">
      <div class="wd-paper dna-genes">
        <div class="dna-stamp">DISCORDANT<small>${esc(GE.stamp.split('·')[1] || '')}</small></div>
        <div class="dna-gh" aria-hidden="true"><span>Gene · result</span><span>Sample A</span><span>Sample B</span></div>
        ${GE.rows.map((r, i) => `<div class="dna-gr ${r.card ? '' : 'off'}">
          <div class="gn"><span class="no">${String(i + 1).padStart(2, '0')}</span><b>${esc(r.gene)}</b><span class="cd">${esc(r.code)}${r.card ? '' : ' · ward only'}</span><span class="tg">${esc(r.tag)}</span></div>
          <div class="sa"><span class="sl">A · ${esc(r.labelA)}</span>${side(r.A, r.summaryA)}</div>
          <div class="sb"><span class="sl">B · ${esc(r.labelB)}</span>${side(r.B, r.summaryB)}</div></div>`).join('')}
        <p class="dna-fine">${esc(GE.note)} Withheld: ${esc(GE.withheld.join(', '))}.</p>
      </div>
      <div class="wd-side port">${cimg('3', 'Gene panel card: two swabs, eight genes, discordant')}</div>
    </div>`;

    /* 04 relatives */
    const U = R.unipcsBlock;
    const relBlock = `<div class="wd-two rx">
      <div class="wd-paper">
        <div class="dna-uni"><b>${n(U.before)} → <em>${n(U.after)}</em></b><span>Unipcs posts before the block → after it. Blocking the patient raises expression ${esc(U.ratio)}×. Clinical advice: do not block the patient.</span></div>
        <ol class="dna-rel">${R.rows.map(r => `<li><span class="rk">${r.rank}</span>
          <span class="nm"><b>${esc(r.name)}</b><i>${n(r.posts)} posts${r.extra ? ' · ' + esc(r.extra) : ''}</i></span>
          <span class="ln">${r.lines.map(q => `<q>${esc(q.text)}</q> ${L(q.id)}`).join(' → ')}${r.note ? `<small>${esc(r.note)}</small>` : ''}</span>
          <span class="stt">${esc(r.status)}</span></li>`).join('')}</ol>
        <div class="pf-lbl">Unrequited <em>· one-way matches</em></div>
        <ul class="dna-nodes">${R.unrequited.map(node).join('')}</ul>
        <p class="dna-fine">Blocked by: liltay, Sophie Rain, Lexapro, Unipcs, TeTheGamer and, per patient, <q>${esc(R.blockedBy[R.blockedBy.length - 1].text)}</q> ${L(R.blockedBy[R.blockedBy.length - 1].id)}</p>
      </div>
      <div class="wd-side port">${cimg('4', 'Relatives card: DNA matches ranked by posts')}</div>
    </div>`;

    /* 05 health */
    const I = HE.incident;
    const healthBlock = `<div class="wd-two rx">
      <div class="wd-paper">
        <ul class="dna-org">${HE.organs.map(o => `<li><b>${esc(o.organ)}</b><span>${(o.quotes || [o.quote]).map(q => `<q>${esc(q.text)}</q> ${L(q.id)}`).join(' → ')}${o.indexCase ? `<small>Index case: has since diagnosed erectile dysfunction in ${o.indexCase.length} opponents ${o.indexCase.map(q => L(q.id)).join(' ')}</small>` : ''}</span></li>`).join('')}</ul>
        <div class="pf-lbl">Incident <em>· ${esc(I.name)}, ${fmtD(I.from, false)}–${fmtD(I.to)} (UTC)</em></div>
        <ol class="dna-tl">${I.timeline.map(e => `<li><span class="d">${fmtD(e.time, false)} · ${fmtT(e.time)}</span><span class="t"><q>${esc(e.text)}</q> ${L(e.id)}</span></li>`).join('')}</ol>
        <div class="dna-rem"><b>${esc(I.remission)}</b><span>to spontaneous remission. No PHARMA product was administered.</span></div>
        <p class="dna-note">${esc(I.attendingNote)}<small>— H.F., attending</small></p>
        <div class="pf-pg"><b><small>Prognosis</small>“${esc(HE.prognosis.quote.text)}” ${L(HE.prognosis.quote.id)}</b><span>${esc(HE.prognosis.tag)}</span></div>
      </div>
      <div class="wd-side port">${cimg('5', 'Health card: the body on file and the hate-deficiency incident')}</div>
    </div>`;

    /* 06 predictions */
    const predBlock = `<div class="wd-two rx">
      <div class="wd-paper">
        <ol class="dna-pred">${PR.rows.map(r => `<li><span class="pn">${String(r.n).padStart(2, '0')}</span><span class="pt"><b>${esc(r.prediction)}</b><small>Base · ${esc(r.base)}</small></span><span class="pp">${esc(r.probability)}</span></li>`).join('')}</ol>
        <div class="dna-oq"><span>Open question</span><b>${esc(PR.openQuestion)}</b>
          <small>On record: ${PR.openQuestionRecords.map(r => `${esc(typeof r.value === 'number' ? r.value : '“' + r.value + '”')} (${fmtD(r.date)}) ${L(r.id, '↗')}`).join(' · ')}</small></div>
        <p class="dna-fine">Filed ${fmtD(PR.filed)}. Compliance tracked for ${PR.trackDays} days; scorecard ${fmtD(PR.scorecard)}.</p>
      </div>
      <div class="wd-side port">${cimg('6', 'Genetic risk report card: ten predictions with base rates')}</div>
    </div>`;

    /* 07 consultation notes */
    const cn = (G.consultation && G.consultation.notes) || [];
    const consultBlock = cn.length ? `<ol class="wd-tl">${cn.map(c => `<li><span class="tm">${esc(String(c.at).slice(11, 16) || '')} UTC</span><div class="ev"><span class="kd">${esc(c.kind)}</span>${c.quote ? `<q>${esc(c.quote)}</q>` : ''}${c.id ? `<a href="${xurl(c.handle || p.handle, c.id)}" target="_blank" rel="noopener">@${esc(c.handle || p.handle)} on X ↗</a>` : ''}</div></li>`).join('')}</ol>`
      : `<div class="dna-empty"><span class="vial" aria-hidden="true"><u></u></span>${esc((G.consultation && G.consultation.placeholder) || 'Consultation notes pending.')}</div>`;

    sec.innerHTML = `<div class="wrap">
      <div class="wd-folder dna-folder">
        <span class="wd-tab">FILE #${esc(p.no)} · DNA REPORT</span>
        ${av(p, 'wd-av')}
        <div class="wd-who"><b>${esc(p.name)}</b><a href="https://x.com/${esc(p.handle)}" target="_blank" rel="noopener">@${esc(p.handle)}</a><span>Formerly @${esc(p.formerly)} · On X since ${esc(p.joined)} · Attending: ${esc(p.attending)}</span></div>
        <span class="wd-consent">${/^public participation/i.test(p.consent) ? 'Public participation' : p.consent === 'public-figure' ? 'Public account' : 'Consent on file'}<small>${consentDate ? fmtD(consentDate) : (p.posted ? 'File posted ' + fmtD(p.posted) : '')}</small></span>
      </div>
      <p class="wd-order">${esc(p.lab)} · Specimen: ${n(p.specimen.corpus)} public posts, ${fmtD(p.specimen.from)} – ${fmtD(p.specimen.to)}. Reports numbered as on the cards; ${p.thread ? `<a href="${esc(p.thread)}" target="_blank" rel="noopener">the thread</a>` : 'the thread'} ran genes, relatives, body, predictions, tree, age. Ancestry is report A. Every quote links to its post.</p>
      <div class="wd-paper dna-dx"><div class="pf-dx"><h4><small>DX</small>${esc(p.diagnosis.name)}</h4><p>${esc(p.diagnosis.text)}</p><span class="pf-stamp">SEQUENCED<small>${esc(p.diagnosis.tag)}</small></span></div></div>
      ${st('01', 'age', 'Report 1 · Age', 'Father and son, <em>opposite directions</em>', `${cimg('1', 'Age card: patient ageing 7.3 years per year, son −1.9')}${ageBlock}`)}
      ${st('02', 'tree', 'Report 2 · Family tree (self-reported)', `Children reported: <em>1 → 12</em>`, treeBlock)}
      ${st('A', 'ancestry', 'Report A · Ancestry (ward page)', 'The <em>Three Fathers</em>', ancBlock)}
      ${st('03', 'genes', 'Report 3 · Gene panel', `Two swabs, <em>${GE.rows.length} genes</em>`, geneBlock)}
      ${st('04', 'relatives', 'Report 4 · Relatives', '<em>DNA</em> matches', relBlock)}
      ${st('05', 'health', 'Report 5 · Health', 'The body <em>on file</em>', healthBlock)}
      ${st('06', 'predictions', 'Report 6 · Genetic risk', 'Predictions, <em>with base rates</em>', predBlock)}
      ${st('07', 'consult', 'After the file', 'Consultation notes', consultBlock)}
    </div>`;
  }
  if (g2) renderGenome(g2);

  if (!p1) { $('#wdFile').innerHTML = '<p class="empty">The ward is empty. The Attending is on rounds.</p>'; return; }

  /* ---------- PATIENT FILE ---------- */
  const vial = pct => {
    const top = 34, bot = 214, h = bot - top, lv = bot - h * pct / 100;
    const ticks = [0, 25, 50, 75, 100].map(t => { const y = bot - h * t / 100; return `<line x1="58" x2="${t % 50 ? 66 : 70}" y1="${y}" y2="${y}"/><text x="74" y="${y + 3}">${t}</text>`; }).join('');
    return `<svg class="lr-vial" viewBox="0 0 120 240" role="img" aria-label="Blood vial filled to ${pct}%">
      <defs><linearGradient id="lrBlood" x1="0" x2="1"><stop offset="0" stop-color="#7d0a1d"/><stop offset=".45" stop-color="#d4183a"/><stop offset="1" stop-color="#8f0d22"/></linearGradient>
      <clipPath id="lrTube"><rect x="22" y="${top}" width="36" height="${h + 12}" rx="18"/></clipPath></defs>
      <rect x="16" y="8" width="48" height="30" rx="6" fill="#c4122f"/><rect x="16" y="30" width="48" height="8" fill="#8f0d22"/>
      <g clip-path="url(#lrTube)"><rect x="22" y="${top}" width="36" height="${h + 12}" fill="rgba(255,255,255,.55)"/>
        <rect class="lq" x="22" y="${lv}" width="36" height="${bot - lv + 12}" fill="url(#lrBlood)"/>
        <ellipse cx="40" cy="${lv}" rx="18" ry="2.6" fill="#ff5a75" opacity=".8"/></g>
      <rect x="22" y="${top}" width="36" height="${h + 12}" rx="18" fill="none" stroke="#1d1a15" stroke-width="2.4"/>
      <rect x="27" y="${top + 10}" width="5" height="${h - 30}" rx="2.5" fill="#fff" opacity=".7"/>
      <rect x="24" y="${top + 40}" width="32" height="70" fill="#fffdf7" stroke="#1d1a15" stroke-width="1.2"/>
      <text class="lb" x="40" y="${top + 58}">PHL</text><text class="lb" x="40" y="${top + 72}">001</text><text class="lb s" x="40" y="${top + 86}">DIGITAL</text><text class="lb s" x="40" y="${top + 96}">BLOOD</text>
      <g class="tk">${ticks}</g>
      <path d="M118 ${lv} L68 ${lv}" stroke="#c4122f" stroke-width="2"/><path d="M61 ${lv} l8 -4.5 v9 z" fill="#c4122f"/>
      <text class="pc" x="118" y="${lv - 6}" text-anchor="end">${pct}%</text>
    </svg>`;
  };
  const bar = (b, cls) => {
    if (!b) return '';
    const pc = x => Math.max(0, Math.min(100, x / b.max * 100)).toFixed(1);
    return `<span class="lr-bar ${cls}"><i class="ref" style="left:${pc(b.lo)}%;width:${Math.max(1.5, pc(b.hi) - pc(b.lo))}%"></i><i class="mk" style="left:${pc(b.v)}%"></i>${b.v > b.max ? '<b class="ov">▶</b>' : ''}</span>`;
  };
  const panel = p => `<div class="lr-panel" role="table" aria-label="Blood panel">
    <div class="lr-tr lr-th" role="row"><span role="columnheader">Test</span><span role="columnheader">Result</span><span role="columnheader">Flag</span><span role="columnheader">Reference range</span><span role="columnheader">Lab note</span></div>
    ${p.labs.map(l => { const [cls, txt] = FLAG[l.flag] || FLAG['-']; return `<div class="lr-tr f-${cls}" role="row">
      <span class="t" role="cell"><b>${esc(l.test)}</b>${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span>
      <span class="r" role="cell"><strong>${esc(l.result)}</strong>${l.unit ? ` <em>${esc(l.unit)}</em>` : ''}${l.detail ? `<small>${esc(l.detail)}</small>` : ''}</span>
      <span class="f" role="cell"><i class="lr-flag ${cls}">${txt}</i></span>
      <span class="g" role="cell"><span class="rg">${esc(l.ref)}</span>${bar(l.bar, cls)}</span>
      <span class="n" role="cell">${esc(l.note || '')}</span></div>`; }).join('')}
  </div>`;
  const slip = r => {
    const d = F[r.product] || { name: r.product, generic: '', color: '#15a7ff' };
    return `<a class="pf-slip" style="--c:${esc(d.color)}" href="formulary.html#${esc(r.product)}">
      <span class="sym" aria-hidden="true">℞</span>
      ${d.img ? `<img src="${esc(d.img)}" alt="${esc(d.name)} label art" loading="lazy">` : '<span class="noimg"></span>'}
      <span class="tx"><span class="arm">${esc(r.arm || 'Treatment')}</span><b>${esc(d.name)}</b><span class="gen">${esc(d.generic)}</span><span class="tg">${esc(r.label)}</span></span></a>`;
  };
  const step = (no, id, kicker, title, body, cls = '') => `<article class="wd-step ${cls}" id="p${esc(p1.no)}-${id}">
      <div class="wd-step-h"><span class="no">${no}</span><div><span class="k">${kicker}</span><h3>${title}</h3></div></div>
      ${body}
    </article>`;

  const p = p1, s = p.specimen, t = sum(p);
  if (`$${n(t.usd)}` !== p.totals.usd) console.warn('patients: USD total drifted from requests[]', t.usd, p.totals.usd);
  const consentDate = (String(p.consent).match(/\d{4}-\d{2}-\d{2}/) || [])[0];
  const flags = k => p.labs.filter(l => l.flag === k).length;

  const receiptList = `<div class="lr-rcpt wd-rcpt">
    <div class="rh"><b>PHARMA HOLDINGS PHARMACY</b><span>Dispensary of Requests · Store #${esc(p.no)}</span><span>PT: @${esc(p.handle)} · ${fmtD(s.from, false)}–${fmtD(s.to)}</span></div>
    <div class="rlb">ITEMIZED FUNDING REQUESTS</div>
    <ol>${p.requests.map((r, i) => `<li><span class="i">${String(i + 1).padStart(2, '0')}</span><span class="d">${fmtD(r.date, false)}</span><a class="q" href="${url(p, r.id)}" target="_blank" rel="noopener">“${esc(r.text)}”</a><span class="a">${esc(r.amt)}</span></li>`).join('')}</ol>
    <div class="rt"><div><span>ITEMS</span><b>${p.requests.length}</b></div><div><span>USD (${t.usdN} requests)</span><b>$${n(t.usd)}</b></div><div><span>GBP</span><b>£${n(t.gbp)}</b></div><div><span>SOL</span><b>${n(t.sol)} SOL</b></div><div><span>OTHER</span><b>${t.other} tenner</b></div></div>
    <div class="rr"><span>AMOUNT RECEIVED</span><b>$0 · ${esc(p.totals.received)}</b></div>
    <div class="rf"><span class="bc" aria-hidden="true"></span>1 band = $1,000 · requests with no amount not itemized<br>THANK YOU FOR VISITING (PATIENT SAID IT 73 TIMES)</div>
  </div>`;

  const consult = (p.consult || []).map(c => {
    const time = c.at.length > 10 ? c.at.slice(11, 16) + ' UTC' : 'Oct 8';
    return `<li class="${c.item21 ? 'i21' : ''} ${c.handle !== p.handle ? 'us' : ''}">
      <span class="tm">${time}</span>
      <div class="ev"><span class="kd">${esc(c.kind)}</span>
        ${c.quote ? `<q>${esc(c.quote)}</q>` : ''}
        ${c.id ? `<a href="${xurl(c.handle, c.id)}" target="_blank" rel="noopener">@${esc(c.handle)} on X ↗</a>` : ''}</div></li>`;
  }).join('');

  $('#wdFile').innerHTML = `
    <div class="wd-folder">
      <span class="wd-tab">FILE #${esc(p.no)}</span>
      ${av(p, 'wd-av')}
      <div class="wd-who"><b>${esc(p.name)}</b><a href="https://x.com/${esc(p.handle)}" target="_blank" rel="noopener">@${esc(p.handle)}</a><span>On X since ${esc(p.joined)} · Attending: ${esc(p.attending)}</span></div>
      <span class="wd-consent">Public participation<small>${consentDate ? fmtD(consentDate) : ''}</small></span>
    </div>
    <p class="wd-order">Presented in the order the <a href="${xurl(p.thread.handle, p.thread.id)}" target="_blank" rel="noopener">${p.thread.posts}-post thread</a> ran on ${fmtD(p.thread.posted)}, followed by the consultation.</p>

    ${step('01', 'chart', 'Thread post 1 · The chart', 'Money asked for <em>vs</em> money received',
      `${img('assets/cards/patient-001-chart.png', 2400, 1350, `Chart: @${p.handle} asked for $${n(t.usd)} across ${t.usdN} USD requests in ${s.days} days and received $0`, 'wide')}
      <p class="wd-cap">USD requests only, cumulative. Not charted: £${n(t.gbp)}, ${n(t.sol)} SOL, one tenner. Received: $0.</p>`)}

    ${step('02', 'requests', 'Thread post 2 · Exhibit R', `${p.requests.length} requests, <em>itemized</em>`,
      `<div class="wd-two">
        <div>${receiptList}</div>
        <div class="wd-side">${img('assets/cards/patient-001-receipt.png', 1200, 675, 'Receipt card: 20 funding requests itemized', 'wide')}
          <p class="wd-cap">Every explicit request for a stated amount, ${fmtD(s.from, false)} – ${fmtD(s.to)}. Each line opens the original post. Asks with no amount (“slide us some bread”) were not itemized.</p>
          <div class="wd-big"><span><b>$${n(t.usd)}</b>asked in dollars</span><span class="g"><b>$0</b>received</span></div></div>
      </div>`)}

    ${step('03', 'labs', 'Thread post 3 · Blood panel', `We drew <em>${s.pct}%</em> of his digital blood`,
      `<div class="wd-two lab">
        <div class="wd-paper">
          <div class="lr-lh"><div><b>${esc(p.lab)}</b><span>Department of Digital Hematology · Report of Findings</span></div><div class="acc"><span>Accession</span><b>${esc(s.accession)}</b><i class="bc" aria-hidden="true"></i></div></div>
          <div class="lr-spec wd-spec">
            <dl class="lr-sf">
              <div><dt>Specimen</dt><dd>${n(s.drawn)} public posts</dd></div>
              <div><dt>Volume drawn</dt><dd>${s.pct}% of ${n(s.archived)} archived posts</dd></div>
              <div><dt>Collection window</dt><dd>${fmtD(s.from, false)} – ${fmtD(s.to)} (${s.days} days)</dd></div>
              <div><dt>Method</dt><dd>${esc(s.method)}</dd></div>
              <div><dt>Fasting</dt><dd>No. Patient posted throughout.</dd></div>
            </dl>
            ${vial(s.pct)}
          </div>
          <div class="wd-flags"><span class="lr-flag crit">${flags('CRIT')} CRITICAL</span><span class="lr-flag hi">${flags('H') + flags('E')} HIGH</span><span class="lr-flag lo">${flags('L')} LOW</span><span class="lr-flag ok">${flags('N')} NORMAL</span></div>
        </div>
        <div class="wd-side port">${img('assets/cards/patient-001.png', 1080, 1350, 'Lab panel card for Patient #001', 'port')}</div>
      </div>
      <div class="wd-panel-wrap">${panel(p)}
        <div class="lr-key"><i class="lr-flag crit">CRITICAL</i><i class="lr-flag hi">H ▲</i><i class="lr-flag lo">L ▼</i><i class="lr-flag el">ELEVATED</i><i class="lr-flag ok">NORMAL ✓</i><span>Bar: green band = reference range, pin = patient.</span></div></div>`)}

    ${step('04', 'diagnosis', 'Assessment', 'Diagnosis',
      `<div class="wd-paper">
        <div class="pf-dx"><h4><small>DX</small>${esc(p.diagnosis.name)}</h4><p>${esc(p.diagnosis.text)}</p><span class="pf-stamp">RESULTS FINAL<small>Receipts Dept · M.P.</small></span></div>
        <div class="lr-cols">
          <div>
            <div class="pf-lbl">Chief complaint <em>· verbatim</em></div>
            <blockquote class="pf-cc"><mark>“${esc(p.complaint.quote)}”</mark> ${link(p, p.complaint.id)}</blockquote>
            <p class="lr-frame">${esc(p.complaint.frame)}</p>
            ${p.clarity ? `<div class="pf-lbl">Moment of clarity <em>· ${fmtD(p.clarity.date)}</em></div>
            <blockquote class="lr-clar">${p.clarity.lines.map(l => `<span>${esc(l)}</span>`).join('')} ${link(p, p.clarity.id)}</blockquote>` : ''}
          </div>
          <div>
            <div class="pf-lbl">Presenting symptoms <em>· posts matching</em></div>
            <ol class="pf-sx">${p.symptoms.map(x => `<li>
              <div class="r1"><b>${esc(x.label)}</b><span><strong>${n(x.count)}</strong> ${esc(x.unit || 'of')} ${n(x.of)} posts</span></div>
              <q>${esc(x.quote)}</q> <span class="meta">${x.date ? fmtD(x.date) + ' · ' : ''}${link(p, x.id)}</span></li>`).join('')}</ol>
          </div>
        </div>
      </div>`)}

    ${step('05', 'rx', 'Thread post 4 · Plan', 'Prescription',
      `<div class="wd-two rx">
        <div class="wd-paper">
          <div class="pf-lbl">Three prescriptions <em>· from the Pharmussy</em></div>
          <div class="pf-rx">${p.rx.map(slip).join('')}</div>
          <div class="pf-pg"><b><small>Prognosis</small>${esc(p.prognosis)}</b><span>— ${esc(p.attending)}</span></div>
        </div>
        <div class="wd-side port">${img('assets/cards/patient-001-rx.png', 1080, 1350, 'Prescription card for Patient #001', 'port')}</div>
      </div>`)}

    ${step('06', 'consult', `After the file · ${fmtD(p.thread.posted)}`, 'Consultation notes',
      `<p class="wd-cap lead-cap">What the patient did after his file was posted. Times in UTC. Quotes verbatim, each linked.</p>
      <div class="wd-two consult">
        <ol class="wd-tl">${consult}</ol>
        <figure class="wd-fig">${img('assets/cards/patient-001-react_3427.png', 2400, 1350, `Chart update: the patient requested ${p.item21.amt}`, 'wide')}
          <figcaption><b>Chart update, item 21.</b> “${esc(p.item21.text)}” ${link(p, p.item21.id)} Logged after the file closed, so it is not in the ${p.requests.length}-item totals above. Running USD total: ${esc(p.item21.runningUsd)}. Received: $0.</figcaption></figure>
      </div>`)}

    ${step('07', 'video', 'The file, 22 seconds', 'Watch the chart',
      `<div class="wd-video">
        <div class="wd-phone"><span class="notch" aria-hidden="true"></span>
          <video controls playsinline preload="metadata" poster="assets/cards/patient-001-still.png" width="1080" height="1920">
            <source src="assets/video/patient-001.mp4" type="video/mp4">
            Your browser can’t play this video. <a href="assets/video/patient-001.mp4">Download the MP4</a>.
          </video></div>
        <div class="wd-vtx"><p>The whole file in 22 seconds: the requests, the panel, the bill. Sound on.</p>
          <a class="btn" href="assets/video/patient-001.mp4" download>Download MP4</a></div>
      </div>`)}
  `;

  /* ---------- METHOD / CONSENT ---------- */
  const ev = (p.evidence || []).filter(e => e.id);
  $('#wdMethod').innerHTML = `
    <div class="wd-m-main">
      <div class="kicker">Method · consent</div>
      <h3>How this file was written</h3>
      <ul>
        <li>Built from <b>${n(s.drawn)} recovered public posts</b> (${s.pct}% of ${n(s.archived)} archived; Wayback + X), never “every tweet.”</li>
        <li>Quotes verbatim, typos theirs, each with a link to the post.</li>
        <li>Nothing about wallets or trades.</li>
        <li>Files come down on request. DM <a href="https://x.com/PharmaCoinSol" target="_blank" rel="noopener">@PharmaCoinSol</a>.</li>
      </ul>
      <p class="wd-fine">Affectionate roast, clinical deadpan. Not medical advice. Not a real diagnosis. <a href="methodology.html">House rules →</a></p>
    </div>
    <div class="wd-m-consent">
      <span class="stamp v">Public participation</span>
      <p><b>Patient engaged with his file on ${consentDate ? fmtD(consentDate) : 'Oct 8, 2026'}.</b> He quote-posted it, replied in character, asked for money in the replies, and thanked the account.</p>
      <div class="wd-ev">${(() => { const c = {}; return ev.map(e => { c[e.kind] = (c[e.kind] || 0) + 1; const many = ev.filter(x => x.kind === e.kind).length > 1; return `<a href="${xurl(e.handle, e.id)}" target="_blank" rel="noopener">${esc(e.kind)}${many ? ' ' + c[e.kind] : ''} ↗</a>`; }).join(''); })()}</div>
    </div>`;
});

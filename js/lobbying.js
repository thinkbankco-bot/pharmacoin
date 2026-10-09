/* Local receipts only. Nulls never enter an arithmetic or plotted zero. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const { $, esc } = PH;
  const records = window.LOBBYING;
  if (!Array.isArray(records) || !records.length) return;
  const years = [...new Set(records.map(r => r.year))].sort((a,b) => a-b);
  const companies = [...new Set(records.map(r => r.company))].sort((a,b) => a.localeCompare(b));
  const numeric = records.filter(r => r.amount_usd !== null);
  const missing = records.filter(r => r.amount_usd === null);
  const sums = new Map(companies.map(c => [c, numeric.filter(r => r.company === c).reduce((n,r) => n+r.amount_usd,0)]));
  const top = [...sums].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))[0];
  const lookup = new Map(records.map(r => [`${r.company}|${r.year}`,r]));
  const usd = n => '$'+n.toLocaleString('en-US',{maximumFractionDigits:0});
  const ids = list => esc(list.map(r => r.id).join(' '));
  const palette = ['#55d8ff','#ff3b58','#ffb84d','#6ee7b7','#a899ff','#5ca8ff','#ffc1da','#c4e681','#e19dff','#9bdde8','#f49074','#a4c2ff','#e9c15b','#64c5ae','#bf99d6','#ff8dba','#9ebf7e','#819bf4','#edaf91','#86d1ce','#d6aef5','#dcdb9c','#a3afc2','#ffcf6b','#6db8d6','#b7dfc0','#d7a5aa'];
  const colors = new Map(companies.map((c,i) => [c,palette[i%palette.length]]));
  let selected = new Set(companies), showTotal = true, inspectedYear = years[years.length-1];
  const stat = (n,label,note,list,cls='') => `<div class="stat" data-record-ids="${ids(list)}"><div class="n ${cls}">${esc(n)}</div><div class="l">${esc(label)}</div><div class="s">${esc(note)}</div></div>`;
  const disclosedTotal = numeric.reduce((n,r) => n+r.amount_usd,0);
  $('#lobbyStats').innerHTML = [
    stat(PH.fmtMoney(disclosedTotal), 'Total disclosed', `${usd(disclosedTotal)} · gross sum; overlaps possible`, numeric, 'money red'),
    stat(top[0], 'Top filer across recorded years', `${usd(top[1])} disclosed`, numeric.filter(r => r.company===top[0]), 'filer amber'),
    stat(companies.length, 'Named filers', `${years[0]}–${years[years.length-1]}`, records),
    stat(missing.length, 'Annual total gaps', `${records.length} company-year records`, records),
  ].join('');
  $('#lobbyStats .stat:last-child').dataset.numeratorRecordIds = missing.map(r => r.id).join(' ');
  $('#lobbyCutoff').innerHTML = `<span data-record-ids="${ids(records)}">Records reviewed October 7, 2026. This is a research snapshot.</span>`;
  $('#companyToggles').innerHTML = companies.map(c => `<button class="chip on" type="button" data-company="${esc(c)}" aria-pressed="true" aria-controls="lobbyChart" style="--series-color:${colors.get(c)}"><i class="ledger-swatch" aria-hidden="true"></i>${esc(c)}</button>`).join('');
  $('#yearButtons').innerHTML = years.map(y => `<button class="chip ${y===inspectedYear?'on':''}" type="button" data-year="${y}" data-record-ids="${ids(records.filter(r=>r.year===y))}" aria-pressed="${y===inspectedYear}" aria-controls="yearDetail">${y}</button>`).join('');
  $('#lobbyTable').innerHTML += `<thead class="sr-only"><tr><th scope="col">Filer</th>${years.map(y=>`<th scope="col" data-record-ids="${ids(records.filter(r=>r.year===y))}">${y}</th>`).join('')}</tr></thead><tbody>${companies.map(c=>`<tr data-table-company="${esc(c)}"><th scope="row">${esc(c)}</th>${years.map(y=>{
    const r=lookup.get(`${c}|${y}`);
    return `<td data-record-id="${esc(r.id)}" data-year="${r.year}" data-amount="${r.amount_usd===null?'null':r.amount_usd}"><a href="${esc(r.source_url)}" target="_blank" rel="noopener" data-source-record="${esc(r.id)}" title="${esc(r.fact)}"><span class="ledger-cell-year">${r.year}</span><b class="${r.amount_usd===null?'missing':''}">${r.amount_usd===null?'no filing found':usd(r.amount_usd)}</b><span class="ledger-cell-status">${esc(r.status)} ↗</span><span class="sr-only"> ${esc(c)}. Record ${esc(r.id)}. ${esc(r.fact)}</span></a></td>`;
  }).join('')}</tr>`).join('')}</tbody>`;

  function totalsForYear(y) {
    const all=records.filter(r=>r.year===y && selected.has(r.company));
    const known=all.filter(r=>r.amount_usd!==null);
    return {all,known,amount:known.length?known.reduce((n,r)=>n+r.amount_usd,0):null};
  }
  function renderDetail() {
    const {all,known,amount}=totalsForYear(inspectedYear);
    $('#yearDetail').innerHTML=`<h3 data-record-ids="${ids(records.filter(r=>r.year===inspectedYear))}">${inspectedYear} · selected filers</h3><p data-record-ids="${ids(all)}" data-known-record-ids="${ids(known)}">${amount===null?'No disclosed total for this selection.':`Disclosed subtotal: <b>${usd(amount)}</b>. ${known.length} of ${all.length} selected filers have a substantiated annual total.`}</p><div class="ledger-detail-grid">${all.map(r=>`<a href="${esc(r.source_url)}" target="_blank" rel="noopener" data-source-record="${esc(r.id)}" data-record-id="${esc(r.id)}"><span>${esc(r.company)}</span><b>${r.amount_usd===null?'no filing found':usd(r.amount_usd)}</b><span>${esc(r.status)}</span><span class="sr-only">Record ${esc(r.id)}.</span></a>`).join('')}</div>`;
  }
  function renderChart() {
    const W=Math.max(280,Math.round($('#lobbyChart').clientWidth)), H=W<600?320:400;
    const pad={left:54,right:14,top:25,bottom:35}, pw=W-pad.left-pad.right,ph=H-pad.top-pad.bottom;
    const visible=numeric.filter(r=>selected.has(r.company));
    const totals=years.map(totalsForYear);
    const max=Math.max(1,...visible.map(r=>r.amount_usd),...(showTotal?totals.map(t=>t.amount||0):[]));
    const step=Math.max(1000000,Math.ceil(max/4/1000000)*1000000),ceiling=step*4;
    const x=y=>pad.left+years.indexOf(y)*pw/(years.length-1),v=n=>pad.top+ph*(1-n/ceiling);
    const allIds=ids(visible);
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="chartTitle chartDesc"><title id="chartTitle">Annual disclosed lobbying amounts</title><desc id="chartDesc">One line per selected filer. Missing records leave gaps. The dashed amber line is the selected disclosed subtotal, which may be incomplete. Every company point links to its record source.</desc>`;
    if (visible.length) for(let i=1;i<=4;i++) {
      const n=step*i;
      svg+=`<g data-record-ids="${allIds}"><line class="axis-line" x1="${pad.left}" y1="${v(n)}" x2="${W-pad.right}" y2="${v(n)}"/><text x="${pad.left-8}" y="${v(n)+4}" text-anchor="end">$${Math.round(n/1000000)}M</text></g>`;
    }
    const labels=W<600?[years[0],years[5],years[10],years[years.length-1]]:years;
    svg+=labels.map(y=>`<text x="${x(y)}" y="${H-9}" text-anchor="middle" data-record-ids="${ids(records.filter(r=>r.year===y))}">${y}</text>`).join('');
    for(const c of companies) {
      if(!selected.has(c))continue;
      const rs=years.map(y=>lookup.get(`${c}|${y}`));let d='',open=false;
      for(const r of rs) { if(r.amount_usd===null){open=false;continue;}d+=`${open?'L':'M'}${x(r.year).toFixed(2)},${v(r.amount_usd).toFixed(2)} `;open=true; }
      svg+=`<g data-series="${esc(c)}" data-record-ids="${ids(rs)}"><path class="series-line" stroke="${colors.get(c)}" d="${d}"/>${rs.filter(r=>r.amount_usd!==null).map(r=>`<a href="${esc(r.source_url)}" target="_blank" rel="noopener" data-source-record="${esc(r.id)}" aria-label="${esc(c)}, ${r.year}: ${usd(r.amount_usd)}. Record ${esc(r.id)}"><circle class="chart-dot" cx="${x(r.year)}" cy="${v(r.amount_usd)}" r="2.7" fill="${colors.get(c)}" data-record-id="${esc(r.id)}" data-amount="${r.amount_usd}"><title>${esc(c)} · ${r.year} · ${usd(r.amount_usd)} · ${esc(r.id)}</title></circle></a>`).join('')}</g>`;
    }
    if(showTotal && visible.length) {
      let d='',open=false;
      for(let i=0;i<years.length;i++){const t=totals[i];if(t.amount===null){open=false;continue;}d+=`${open?'L':'M'}${x(years[i]).toFixed(2)},${v(t.amount).toFixed(2)} `;open=true;}
      svg+=`<path class="total-line" data-series="selected-total" data-record-ids="${allIds}" d="${d}"/>`;
    }
    if(!visible.length)svg+=`<text x="${W/2}" y="${H/2}" text-anchor="middle">Select a filer to open the ledger.</text>`;
    svg+='</svg>';$('#lobbyChart').innerHTML=svg;
    $('#chartSelection').innerHTML=`<span data-record-ids="${ids(records.filter(r=>selected.has(r.company)))}" data-denominator-record-ids="${ids(records)}">${selected.size} of ${companies.length} filers selected. ${showTotal?'Dashed amber: selected disclosed subtotal.':'Selected total hidden.'} Gaps remain gaps.</span>`;
    renderDetail();
  }
  function sync() {
    document.querySelectorAll('[data-company]').forEach(b=>{const on=selected.has(b.dataset.company);b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
    renderChart();
  }
  $('#companyToggles').addEventListener('click',e=>{const b=e.target.closest('[data-company]');if(!b)return;const c=b.dataset.company;selected.has(c)?selected.delete(c):selected.add(c);sync();});
  $('#showAll').addEventListener('click',()=>{selected=new Set(companies);sync();});
  $('#clearAll').addEventListener('click',()=>{selected.clear();sync();});
  $('#totalToggle').addEventListener('click',()=>{showTotal=!showTotal;$('#totalToggle').classList.toggle('on',showTotal);$('#totalToggle').setAttribute('aria-pressed',String(showTotal));renderChart();});
  $('#yearButtons').addEventListener('click',e=>{const b=e.target.closest('[data-year]');if(!b)return;inspectedYear=+b.dataset.year;document.querySelectorAll('#yearButtons button').forEach(x=>{const on=+x.dataset.year===inspectedYear;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on));});renderDetail();});
  if(window.ResizeObserver)new ResizeObserver(renderChart).observe($('#lobbyChart'));else addEventListener('resize',renderChart);
  renderChart();
});

/* The Revolving Door. Counts and claim links are derived solely from window.REVOLVING. */
document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc } = PH;
  const agencies = ['FDA', 'CDC', 'NIH', 'CMS'];
  const agencyNames = {
    FDA: 'Food and Drug Administration',
    CDC: 'Centers for Disease Control and Prevention',
    NIH: 'National Institutes of Health',
    CMS: 'Centers for Medicare & Medicaid Services / HCFA',
  };
  const destinationLabels = {
    academic: 'Academic appointment',
    'academic-editorial': 'Academic editorial work',
    'corporate-board': 'Corporate board',
    'nonprofit-board': 'Nonprofit board',
    'industry-and-academic': 'Industry and academic roles',
    'industry-and-nonprofit': 'Industry and nonprofit roles',
    industry: 'Industry',
    'investment-firm': 'Investment firm',
    'industry-association': 'Industry association',
    'industry-advisory': 'Industry advisory role',
    nonprofit: 'Nonprofit role',
    unsubstantiated: 'Later appointment not substantiated',
    'continued-government': 'Government reference retained',
    'nonprofit-research': 'Nonprofit research role',
    religious: 'Religious role',
    'consulting-firm': 'Private consulting',
    'investment-firm-and-board': 'Investment firm and board',
    'investment-and-professional-firm': 'Investment and professional firms',
    'professional-firm': 'Professional firm',
    'industry-association-and-board': 'Industry association and board',
  };
  const records = (window.REVOLVING || []).slice().sort((a, b) =>
    agencies.indexOf(a.agency) - agencies.indexOf(b.agency) || a.sort_year - b.sort_year || a.person.localeCompare(b.person));
  const ids = list => list.map(r => r.id).join(' ');
  const provenance = list => `data-record-ids="${esc(ids(list))}"`;
  const verified = records.filter(r => r.status === 'VERIFIED');
  const deadEnds = records.filter(r => r.status === 'DEAD END');
  const industry = records.filter(r => r.status === 'VERIFIED' && r.counts_toward_stat === true);

  if (!records.length) {
    $('#doorLedger').innerHTML = '<p class="callout w door-empty-data">The local career-record dataset is unavailable. No statistics have been substituted.</p>';
    return;
  }

  $('#doorStats').innerHTML = [
    `<div class="stat" ${provenance(industry)} data-denominator-record-ids="${esc(ids(records))}" data-stat="industry-count"><div class="n amber door-ratio">${industry.length} of ${records.length}</div><div class="l">To industry, boards or firms</div><div class="s">Includes nonprofit board seats</div></div>`,
    `<div class="stat" ${provenance(records)} data-stat="total-count"><div class="n">${records.length}</div><div class="l">Agency heads</div><div class="s">One record per person</div></div>`,
    `<div class="stat" ${provenance(verified)} data-stat="verified-count"><div class="n">${verified.length}</div><div class="l">Verified later roles</div><div class="s">Includes academic and nonprofit posts</div></div>`,
    `<div class="stat" ${provenance(deadEnds)} data-stat="dead-end-count"><div class="n">${deadEnds.length}</div><div class="l">Dead ends</div><div class="s">Scoped searches, retained honestly</div></div>`,
  ].join('');

  const checkedDates = [...new Set(records.map(r => r.checked_date).filter(Boolean))].sort();
  $('#doorChecked').innerHTML = `<span ${provenance(records)}>Snapshot checked: <b>${esc(checkedDates.join(' / '))}</b>.</span><span class="door-checked-note">Later roles may be announced after this snapshot. A board seat is not an employee position.</span>`;

  function chip(value, label, list, type) {
    return `<button class="chip${value === 'all' ? ' on' : ''}" type="button" data-${type}="${esc(value)}" ${provenance(list)} aria-pressed="${value === 'all'}">${esc(label)}<span class="door-chip-count">${list.length}</span></button>`;
  }
  $('#doorAgencies').innerHTML = chip('all', 'All agencies', records, 'agency') + agencies.map(agency =>
    chip(agency, agency, records.filter(r => r.agency === agency), 'agency')).join('');
  $('#doorStatuses').innerHTML = chip('all', 'All stamps', records, 'status') +
    chip('VERIFIED', 'VERIFIED', verified, 'status') + chip('DEAD END', 'DEAD END', deadEnds, 'status');

  function card(r) {
    const service = r.service.map(term => `<span class="door-service" data-record-ids="${esc(term.record_ids.join(' '))}">${esc(term.agency)} · ${esc(term.role)} · ${esc(term.years)}</span>`).join('');
    const serviceNote = r.service_note ? `<span class="door-service-note">${esc(r.service_note)}</span>` : '';
    return `<article class="panel door-card${r.status === 'DEAD END' ? ' dead-end' : ''}" data-record-id="${esc(r.id)}" data-record-ids="${esc(r.id)}" data-status="${esc(r.status)}" data-agency="${esc(r.agency)}" data-sort-year="${r.sort_year}" data-counts-toward-stat="${r.counts_toward_stat === true}">
      <div class="door-card-header"><span class="mono">${esc(r.agency)} · personnel record</span><span class="stamp ${r.status === 'VERIFIED' ? 'v' : 'd'}">${esc(r.status)}</span></div>
      <h4>${esc(r.person)}</h4>
      <dl><div><dt>Years served as agency head</dt><dd>${service}${serviceNote}</dd></div><div><dt>After government</dt><dd>${esc(r.destination_summary)}<span class="door-kind">${esc(destinationLabels[r.destination_kind] || r.destination_kind.replaceAll('-', ' '))}${r.counts_toward_stat === true ? ' · included in header count' : ''}</span></dd></div></dl>
      <p class="door-fact">${esc(r.fact)}</p>
      <div class="door-card-footer"><a class="door-source" href="${esc(r.source_url)}" target="_blank" rel="noopener" data-record-id="${esc(r.id)}" data-source-record="${esc(r.id)}">${r.status === 'VERIFIED' ? 'Primary source' : 'Search / service reference'}: ${esc(r.source_name)} ↗</a><span class="door-source-date">${esc(r.source_date)}</span><span class="door-record-id">Record: ${esc(r.id)}</span></div>
    </article>`;
  }

  let agencyFilter = 'all', statusFilter = 'all';
  function render() {
    const query = $('#doorQuery').value.trim().toLocaleLowerCase();
    const list = records.filter(r => (agencyFilter === 'all' || r.agency === agencyFilter) &&
      (statusFilter === 'all' || r.status === statusFilter) && (!query ||
      [r.id, r.person, r.agency, r.years_served, r.title, r.fact, r.destination_summary, r.source_name, r.source_date, r.year].join(' ').toLocaleLowerCase().includes(query)));
    $('#doorLedger').innerHTML = agencies.map(agency => {
      const group = list.filter(r => r.agency === agency);
      if (!group.length) return '';
      return `<section class="door-agency" aria-label="${esc(agencyNames[agency])}" data-agency-group="${esc(agency)}"><div class="door-agency-head"><h3>${esc(agency)}</h3><span ${provenance(group)}>${group.length} personnel record${group.length === 1 ? '' : 's'}</span></div><div class="door-cards">${group.map(card).join('')}</div></section>`;
    }).join('');
    $('#doorCount').textContent = `${list.length} of ${records.length} records`;
    $('#doorCount').dataset.recordIds = ids(list);
    $('#doorCount').dataset.denominatorRecordIds = ids(records);
    $('#doorEmpty').hidden = list.length > 0;
  }

  $('#doorQuery').addEventListener('input', render);
  $$('[data-agency]').filter(el => el.matches('button')).forEach(button => button.addEventListener('click', () => {
    agencyFilter = button.dataset.agency;
    $$('#doorAgencies button').forEach(el => { el.classList.toggle('on', el === button); el.setAttribute('aria-pressed', String(el === button)); });
    render();
  }));
  $$('#doorStatuses button').forEach(button => button.addEventListener('click', () => {
    statusFilter = button.dataset.status;
    $$('#doorStatuses button').forEach(el => { el.classList.toggle('on', el === button); el.setAttribute('aria-pressed', String(el === button)); });
    render();
  }));
  render();
});

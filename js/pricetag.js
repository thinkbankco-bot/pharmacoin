/* The Price Tag — local, source-linked price receipts. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const data = window.PRICE_TAG;
  if (!data || !Array.isArray(data.records)) return;
  const { $, $$, esc } = PH;
  const records = data.records;
  const labels = { us: 'United States', uk: 'United Kingdom', canada: 'Ontario', australia: 'Australia', france: 'France' };
  const symbols = { USD: '$', GBP: '£', CAD: 'C$', AUD: 'A$', EUR: '€' };
  const domain = value => { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return value || ''; } };
  const fixed = value => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (value, currency) => value == null ? 'no public price found' : `${symbols[currency] || `${currency} `}${fixed(value)}`;
  const multiple = value => value == null ? null : `${Number(value).toFixed(1)}×`;
  const ids = list => list.map(r => r.id).join(' ');
  const verified = records.filter(r => r.status === 'VERIFIED');
  const dead = records.filter(r => r.status === 'DEAD END');
  const comparable = records.filter(r => Number.isFinite(r.multiple));
  const sortedMultiples = comparable.map(r => r.multiple).sort((a, b) => a - b);
  const median = sortedMultiples.length ? (sortedMultiples.length % 2 ? sortedMultiples[(sortedMultiples.length - 1) / 2] : (sortedMultiples[sortedMultiples.length / 2 - 1] + sortedMultiples[sortedMultiples.length / 2]) / 2) : null;

  function stats() {
    const stat = (n, label, note, cls = '') => `<div class="stat"><div class="n ${cls}">${esc(n)}</div><div class="l">${esc(label)}</div><div class="s">${esc(note)}</div></div>`;
    $('#priceStats').innerHTML = [
      stat(records.length, 'Drug files', 'One stated presentation each'),
      stat(verified.length, 'Verified comparisons', 'Exact narrow claim', 'price-verified'),
      stat(dead.length, 'Dead ends', 'Kept in the queue'),
      stat(median == null ? '—' : multiple(median), 'Median multiple', `${comparable.length} comparable files`, 'price-median'),
    ].join('');
    $('#priceChecked').innerHTML = `Price files checked <b>${esc(data.checked)}</b> · foreign amounts converted at Treasury rates dated <b>${esc(data.fx.as_of)}</b>.`;
    $('#fxMethod').innerHTML = `Foreign prices are divided by the U.S. Treasury's ${esc(data.fx.as_of)} foreign-currency-per-dollar rate. <a href="${esc(data.fx.source_url)}" target="_blank" rel="noopener">Open the rate file ↗</a>`;
  }

  function marketCell(key, market, cheapest) {
    const name = labels[key];
    if (!market || market.price == null) {
      return `<div class="price-market missing" data-market="${esc(key)}" data-price="null" data-status="${esc(market?.status || 'DEAD END')}"><div class="price-market-top"><span class="price-market-name">${esc(name)}</span><span class="price-market-badge dead">DEAD END</span></div><span class="price-missing">no public price found</span>${market?.search_scope ? `<span class="price-market-note">${esc(market.search_scope)}</span>` : ''}${market?.source_url ? `<a class="price-source" href="${esc(market.source_url)}" target="_blank" rel="noopener">Search record: ${esc(domain(market.source_url))} ↗</a>` : ''}</div>`;
    }
    const weak = market.status === 'WEAK SIGNAL';
    const note = [market.local_name && market.local_name !== market.drug ? market.local_name : '', market.normalization, weak ? market.limitation : ''].filter(Boolean).join(' · ');
    const aux = [market.detail_url && market.detail_url !== market.source_url ? ['Item record', market.detail_url] : null, market.bulk_source_url && market.bulk_source_url !== market.source_url ? ['Bulk price file', market.bulk_source_url] : null, market.definition_url && market.definition_url !== market.source_url ? ['Field definition', market.definition_url] : null].filter(Boolean);
    return `<div class="price-market ${cheapest ? 'cheapest' : ''} ${weak ? 'weak-signal' : ''}" data-market="${esc(key)}" data-price="${market.price}" data-currency="${esc(market.currency)}" data-usd="${market.usd}" data-status="${esc(market.status)}"><div class="price-market-top"><span class="price-market-name">${esc(name)}</span>${cheapest ? '<span class="price-market-badge">least foreign</span>' : weak ? '<span class="price-market-badge weak">WEAK SIGNAL · excluded</span>' : ''}</div><span class="price-local">${esc(money(market.price, market.currency))}</span><span class="price-usd">${esc(money(market.usd, 'USD'))} converted${weak ? ' · not used in multiple' : ''}</span>${note ? `<span class="price-market-note">${esc(note)}</span>` : ''}<a class="price-source" href="${esc(market.source_url)}" target="_blank" rel="noopener">${esc(market.source_name)} ↗</a>${aux.length ? `<div class="price-source-aux">${aux.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</div>` : ''}<span class="price-source-date">${esc(market.source_date || '')}${market.source_record ? ` · ${esc(market.source_record)}` : ''}</span></div>`;
  }

  function usCell(r) {
    const market = r.us;
    if (!market || market.price == null) return marketCell('us', market, false);
    return `<div class="price-market" data-market="us" data-price="${market.price}" data-currency="USD" data-usd="${market.price}"><div class="price-market-top"><span class="price-market-name">United States</span></div><span class="price-local">${esc(money(market.price, 'USD'))}</span><span class="price-usd">manufacturer-reported WAC</span>${market.normalization ? `<span class="price-market-note">${esc(market.normalization)}</span>` : ''}<a class="price-source" href="${esc(market.source_url)}" target="_blank" rel="noopener">${esc(market.source_name)} ↗</a>${market.fda_ndc_source_url ? `<div class="price-source-aux"><a href="${esc(market.fda_ndc_source_url)}" target="_blank" rel="noopener">FDA package file ↗</a><a href="${esc(market.definition_url)}" target="_blank" rel="noopener">WAC definition ↗</a></div>` : ''}<span class="price-source-date">${esc(market.source_date || '')}${market.source_record ? ` · ${esc(market.source_record)}` : ''}</span></div>`;
  }

  function medicareCell(r) {
    const m = r.medicare;
    if (!m || m.price_30_des == null) return `<div class="price-market price-medicare missing" data-market="medicare" data-price="null"><div class="price-market-top"><span class="price-market-name">Medicare negotiated</span></div><span class="price-missing">no negotiated price listed</span></div>`;
    return `<div class="price-market price-medicare" data-market="medicare" data-price="${m.price_30_des}" data-currency="USD"><div class="price-market-top"><span class="price-market-name">Medicare negotiated</span></div><span class="price-local">${esc(money(m.price_30_des, 'USD'))}</span><span class="price-usd">effective ${esc(m.effective_year)}</span><span class="price-market-note">30-day equivalent supply; separate basis</span><a class="price-source" href="${esc(m.source_url)}" target="_blank" rel="noopener">CMS MFP file ↗</a><span class="price-source-date">${esc(m.source_date || '')}</span></div>`;
  }

  function receipt(r) {
    const isVerified = r.status === 'VERIFIED';
    const cheapest = r.cheapest;
    const headline = isVerified && cheapest ? `<span class="price-multiple">${esc(Number(r.multiple).toFixed(1))}<span>×</span></span><span class="price-multiple-label">the ${esc(labels[cheapest.market])} public price<br>${esc(money(r.us.price, 'USD'))} ÷ ${esc(money(cheapest.usd, 'USD'))}</span>` : `<span class="price-dead-title">Comparison<br>not substantiated.</span>`;
    return `<article class="price-receipt ${isVerified ? '' : 'dead-end'}" id="price-${esc(r.id)}" data-record-id="${esc(r.id)}" data-status="${esc(r.status)}" data-multiple="${r.multiple == null ? 'null' : r.multiple}" data-checked="${esc(r.checked)}">
      <div class="price-receipt-head"><div><div class="price-fileline"><span>Receipt PT-${String(r.order).padStart(3, '0')}</span><span class="stamp ${isVerified ? 'v' : 'd'}">${esc(r.status)}</span></div><h3>${esc(r.drug)}</h3><p class="price-maker">${esc(r.active_ingredient)} · ${esc(r.maker)}</p></div><div class="price-hero-number">${headline}</div></div>
      <div class="price-receipt-body"><dl class="price-basis"><dt>Matched basis</dt><dd>${esc(r.basis)}</dd></dl><div class="price-market-grid">${usCell(r)}${['uk', 'canada', 'australia', 'france'].map(key => marketCell(key, r.markets[key], cheapest?.market === key)).join('')}${medicareCell(r)}</div>${!isVerified && r.dead_end_reason ? `<p class="price-dead-reason"><b>Scoped DEAD END:</b> ${esc(r.dead_end_reason)}</p>` : ''}<div class="price-receipt-foot"><span>Checked ${esc(r.checked)}</span><span>PT-${String(r.order).padStart(3, '0')} · ${esc(r.id)}</span></div></div>
    </article>`;
  }

  let status = 'all';
  function render() {
    const query = $('#priceQuery').value.trim().toLocaleLowerCase();
    const list = records.filter(r => (status === 'all' || r.status === status) && (!query || [r.id, r.drug, r.active_ingredient, r.maker, r.basis].join(' ').toLocaleLowerCase().includes(query)));
    $('#priceLedger').innerHTML = list.map(receipt).join('');
    $('#priceCount').textContent = `${list.length} of ${records.length} receipts`;
    $('#priceCount').dataset.recordIds = ids(list);
    $('#priceEmpty').hidden = list.length > 0;
  }

  function filters() {
    const specs = [['all', 'All', records.length], ['VERIFIED', 'Verified', verified.length], ['DEAD END', 'Dead end', dead.length]];
    $('#priceStatuses').innerHTML = specs.map(([key, label, count], i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-status="${esc(key)}" aria-pressed="${i === 0}">${esc(label)}<span class="price-chip-count">${count}</span></button>`).join('');
    $('#priceStatuses').addEventListener('click', event => {
      const button = event.target.closest('[data-status]'); if (!button) return;
      status = button.dataset.status;
      $$('#priceStatuses button').forEach(el => { const on = el === button; el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); });
      render();
    });
  }

  function renderCard(cardId) {
    document.body.classList.add('card-mode');
    const card = $('#shareCard'); card.hidden = false;
    if (cardId === 'summary') {
      card.classList.add('card-summary');
      card.innerHTML = `<div class="card-top"><span class="card-brand"><span class="card-rx">Rx</span>$PHARMA · The Price Tag</span><span class="card-stamp">VERIFIED SET</span></div><h1 class="card-headline">The median U.S. list price is <em>${esc(median == null ? '—' : multiple(median))}</em> the least foreign public price.</h1><p class="card-summary-note">${comparable.length} comparable receipts in a 30-drug file. Every pack, conversion and source stays attached.</p><div class="card-meta"><div class="card-basis">Foreign currency conversion: U.S. Treasury · ${esc(data.fx.as_of)}</div><div class="card-source">THE PRICE TAG · RECEIPTS DEPARTMENT<br>Checked ${esc(data.checked)}</div></div>`;
      document.title = 'The Price Tag summary card';
      return;
    }
    const r = records.find(item => item.id === cardId);
    if (!r) throw new Error(`Unknown card record: ${cardId}`);
    const good = r.status === 'VERIFIED' && r.cheapest && Number.isFinite(r.multiple);
    const foreign = good ? r.markets[r.cheapest.market] : null;
    card.innerHTML = `<div class="card-top"><span class="card-brand"><span class="card-rx">Rx</span>$PHARMA · The Price Tag</span><span class="card-stamp ${good ? '' : 'dead'}">${esc(r.status)}</span></div><h1 class="card-headline ${good ? '' : 'dead'}">${good ? `${esc(r.drug)}: <em>${esc(multiple(r.multiple))}</em> the ${esc(labels[r.cheapest.market])} price` : `${esc(r.drug)}: comparison not substantiated`}</h1><div class="card-prices"><div class="card-price"><small>United States WAC</small><strong>${esc(money(r.us.price, 'USD'))}</strong></div><span class="card-vs">VERSUS</span><div class="card-price foreign"><small>${good ? esc(labels[r.cheapest.market]) : 'Comparable foreign price'}</small><strong>${good ? esc(money(foreign.price, foreign.currency)) : 'no public price found'}</strong></div></div><div class="card-rule"></div><div class="card-meta"><div class="card-basis">${esc(r.basis)}</div><div class="card-source">${good ? `${esc(domain(r.us.source_url))} + ${esc(domain(foreign.source_url))}` : esc(domain(r.us.source_url))}<br>Checked ${esc(r.checked)}</div></div>`;
    document.title = `${r.drug} Price Tag card`;
  }

  const cardId = new URLSearchParams(location.search).get('card');
  stats();
  if (cardId) { renderCard(cardId); return; }
  filters(); render();
  $('#priceQuery').addEventListener('input', render);
});

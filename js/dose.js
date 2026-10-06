/* Daily Dose — Wordle for corporate crime */
document.addEventListener('DOMContentLoaded', () => {
  const { $, $$, esc, fmtMoney, receiptHTML, toast, CAT } = PH;
  const EPOCH = Date.UTC(2026, 9, 5); // Dose #1 = Oct 5, 2026
  const MAX = 6;
  const STOP = new Set(['inc', 'llc', 'the', 'and', 'company', 'family', 'usa', 'corp', 'plc', 'group', 'unit', 'laboratories', 'pharmaceuticals', 'pharmaceutical', 'health', 'products', 'pharma', 'international', 'holdings', 'its']);
  const ALIAS = { gsk: 'glaxosmithkline', jj: 'johnson', jnj: 'johnson', bms: 'bristol', az: 'astrazeneca', lilly: 'lilly', 'eli lilly': 'lilly' };
  const norm = s => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = c => norm(c).split(' ').filter(t => t.length >= 3 && !STOP.has(t));

  // Pool: priced receipts with a real company name, in a fixed seeded order
  const pool = (window.RECEIPTS || []).filter(r => r.amount_usd && !['lobbying', 'outbreak'].includes(r.category) && tokens(r.company).length);
  const rng = (a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(420);
  const order = pool.map((r, i) => [rng(), r]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const dayIdx = Math.max(0, Math.floor((Date.now() - EPOCH) / 864e5));
  const doseNo = dayIdx + 1;

  // Companies for autocomplete
  const names = [...new Set(pool.flatMap(r => r.company.split(/,| and |\//).map(s => s.replace(/\(.*?\)/g, '').trim())).filter(s => s.length > 2))].sort();
  $('#companies').innerHTML = names.map(n => `<option value="${esc(n)}">`).join('');

  // Persistence
  const KEY = 'ph_dose_v1';
  let S; try { S = JSON.parse(localStorage.getItem(KEY)) || null; } catch { S = null; }
  S = S || { stats: { played: 0, won: 0, streak: 0, best: 0, last: -1 }, days: {} };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

  let practice = false, R, st;
  const paintStats = () => { const s = S.stats; $('#sRefills').textContent = s.streak; $('#sBest').textContent = s.best; $('#sPlayed').textContent = s.played; $('#sWin').textContent = s.played ? Math.round(s.won / s.played * 100) + '%' : '0%'; };

  function redact(text, reveal) {
    let t = esc(text);
    if (!reveal) {
      const toks = [...tokens(R.company), ...Object.keys(ALIAS).filter(k => tokens(R.company).includes(ALIAS[k]) && k.length > 2)];
      toks.forEach(k => { t = t.replace(new RegExp(`\\b${k}[a-z']*\\b`, 'gi'), m => `<span class="bar">${'█'.repeat(Math.max(4, m.length))}</span>`); });
      t = t.replace(/\$\s?[\d.,]+\s*(billion|million|B|M)?\b/gi, () => `<span class="bar">█████</span>`).replace(/\b[\d.,]+\s*(billion|million)\b/gi, () => `<span class="bar">█████</span>`);
    }
    return t;
  }
  const blackout = text => text.split(' ').map(w => `<span class="bar">${'█'.repeat(Math.max(2, Math.min(w.length, 12)))}</span>`).join(' ');

  function load(r, isPractice) {
    R = r; practice = isPractice;
    st = isPractice ? { guesses: [], solved: false, amount: null, done: false } : (S.days[doseNo] || (S.days[doseNo] = { guesses: [], solved: false, amount: null, done: false }));
    $('#doseNo').textContent = isPractice ? 'Practice dose' : `Daily Dose #${doseNo}`;
    $('#faxMode').textContent = isPractice ? 'PRACTICE' : `DOSE #${doseNo}`;
    $('#result').classList.add('hidden'); $('#round2').classList.add('hidden');
    $('#receiptWrap').hidden = true;
    paint();
  }

  function paint() {
    const misses = st.guesses.filter(g => !g.ok).length;
    const revealAll = st.done || st.solved;
    $('#faxTitle').innerHTML = redact(R.title, st.done);
    $('#faxBody').innerHTML = (misses >= 3 || revealAll) ? redact(R.fact, st.done) : blackout(R.fact);
    $('#faxSrc').innerHTML = (misses >= 4 || revealAll) ? `SOURCE: ${esc(R.source_name)}` : 'SOURCE: ████████';
    $('#faxStamp').classList.toggle('hidden', !st.done);
    const H = [
      ['Year', R.year], ['Category', CAT[R.category] || R.category], ['The fact', 'Unredacted above (company and amount still hidden)'],
      ['Source + first letter', `${R.source_name} · starts with “${tokens(R.company)[0][0].toUpperCase()}”`], ['Name length', `${tokens(R.company)[0].length} letters in the key word`],
    ];
    $('#hints').innerHTML = H.map(([k, v], i) => `<div class="hint ${i < misses || revealAll ? 'on' : ''}"><span>Hint ${i + 1} · ${k}</span><b>${i < misses || revealAll ? esc(v) : 'Locked: costs one pill'}</b></div>`).join('');
    $('#pills').innerHTML = Array.from({ length: MAX }, (_, i) => { const g = st.guesses[i]; return `<span class="pill ${g ? (g.ok ? 'hit' : 'miss') : ''}" title="${g ? esc(g.t) : ''}">${g ? esc(g.t).slice(0, 14) : ''}</span>`; }).join('');
    const companyOver = st.solved || st.guesses.length >= MAX;
    $('#guessForm').classList.toggle('hidden', companyOver);
    $('#phaseLabel').textContent = companyOver ? (st.solved ? `Diagnosed in ${st.guesses.length}` : `Company: ${R.company}`) : `Round 1 · Which company? (${MAX - st.guesses.length} pills left)`;
    if (companyOver && st.amount === null) round2();
    if (st.done) finish();
  }

  function guess(e) {
    e.preventDefault();
    const v = $('#guess').value.trim(); if (!v) return;
    const gt = tokens(v).map(t => ALIAS[t] || t), ct = tokens(R.company);
    const aliasHit = ALIAS[norm(v).replace(/ /g, '')] && ct.includes(ALIAS[norm(v).replace(/ /g, '')]);
    const ok = aliasHit || gt.some(t => ct.some(c => c === t || (t.length >= 5 && c.startsWith(t))));
    if (st.guesses.some(g => norm(g.t) === norm(v))) { toast('Already tried that one.'); return; }
    st.guesses.push({ t: v, ok }); if (ok) st.solved = true;
    $('#guess').value = '';
    toast(ok ? 'Diagnosed. Now guess the bill.' : st.guesses.length >= MAX ? 'Out of pills.' : 'Wrong patient. A redaction peels off.');
    if (!practice) save(); paint();
  }

  function round2() {
    $('#round2').classList.remove('hidden');
    const others = order.filter(r => r !== R && Math.abs(Math.log10(r.amount_usd) - Math.log10(R.amount_usd)) > .15).map(r => r.amount_usd);
    const pick = [R.amount_usd];
    const r2 = (a => () => { a = (a * 9301 + 49297) % 233280; return a / 233280; })(R.amount_usd % 9973 + doseNo);
    while (pick.length < 4 && others.length) { const v = others.splice(Math.floor(r2() * others.length), 1)[0]; if (!pick.some(p => Math.abs(Math.log10(p) - Math.log10(v)) < .12)) pick.push(v); }
    pick.sort((a, b) => a - b);
    $('#bills').innerHTML = pick.map(v => `<button class="bill" data-v="${v}">${fmtMoney(v)}</button>`).join('');
    $$('.bill').forEach(b => b.onclick = () => { st.amount = +b.dataset.v; st.done = true; if (!practice) { const s = S.stats; if (s.last !== dayIdx) { s.played++; if (st.solved) { s.won++; s.streak = s.last === dayIdx - 1 ? s.streak + 1 : 1; s.best = Math.max(s.best, s.streak); } else s.streak = 0; s.last = dayIdx; } save(); paintStats(); } paint(); });
  }

  function finish() {
    $('#round2').classList.add('hidden');
    const billOk = st.amount === R.amount_usd;
    $('#result').classList.remove('hidden');
    $('#resTitle').textContent = st.solved ? (billOk ? 'Full diagnosis.' : 'Right patient, wrong bill.') : 'Undiagnosed.';
    $('#resBody').innerHTML = `${esc(R.company)} · ${esc(R.year)} · <b style="color:var(--red)">${fmtMoney(R.amount_usd)}</b>${billOk ? '' : ` (you said ${fmtMoney(st.amount)})`}.`;
    const grid = st.guesses.map(g => g.ok ? '💊' : '🔴').join('') + '⚪'.repeat(Math.max(0, MAX - st.guesses.length)) + ' ' + (billOk ? '💰' : '🧾');
    const text = `${practice ? '$PHARMA Practice Dose' : `$PHARMA Daily Dose #${doseNo}`}\n${grid}\n${practice ? '' : `Refills: ${S.stats.streak}\n`}${location.origin}${location.pathname}`;
    $('#shareGrid').textContent = text;
    $('#shareBtn').onclick = async () => { try { await navigator.clipboard.writeText(text); toast('Result copied. Spoiler-free.'); } catch { toast('Copy failed. Screenshot it like a boomer.'); } };
    $('#srcBtn').href = R.source_url;
    $('#doseReceipt').innerHTML = receiptHTML(R);
    $('#receiptWrap').hidden = false;
  }

  const tick = () => { const now = Date.now(), next = EPOCH + (dayIdx + 1) * 864e5, s = Math.max(0, Math.floor((next - now) / 1000)); $('#countdown').textContent = [s / 3600 | 0, (s % 3600) / 60 | 0, s % 60].map(n => String(n).padStart(2, '0')).join(':'); };
  setInterval(tick, 1000); tick();
  $('#guessForm').addEventListener('submit', guess);
  $('#practice').onclick = () => { load(pool[Math.floor(Math.random() * pool.length)], true); scrollTo({ top: $('#fax').getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); };
  paintStats();
  load(order[dayIdx % order.length], false);
});

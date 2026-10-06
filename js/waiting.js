/* THE WAITING ROOM — every real $PHARMA trade gets called up like a pharmacy patient.
   Data: GeckoTerminal public trades for the PumpSwap pool (CORS-open, ~30s cache). Nothing simulated.
   Diagnoses are jokes, picked deterministically from the wallet address so the same wallet always gets the same one. */
(() => {
  const POOL = '3PffTrmfWe23GTNH6XNERGzzUkLDiPTejJpH9DK3R28u';
  const API = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${POOL}/trades`;
  const WHALE = 250;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const usd = n => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : '$' + n.toFixed(n < 10 ? 2 : 0);
  const ago = ts => { const s = Math.max(0, (Date.now() - ts) / 1000); return s < 60 ? `${s | 0}s ago` : s < 3600 ? `${s / 60 | 0}m ago` : s < 86400 ? `${s / 3600 | 0}h ago` : `${s / 86400 | 0}d ago`; };
  const short = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : '????';
  const hash = s => { let h = 2166136261; for (const c of s || '') { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pick = (arr, seed) => arr[seed % arr.length];

  const DX_BUY = ['acute FOMO', 'chronic hopium', 'receipt deficiency', 'early-onset conviction', 'uncontrolled bullposting', 'low $PHARMA levels', 'seasonal capitulation (resolved)', 'severe allergy to Big Pharma', 'compulsive footnote reading', 'diamond-hand syndrome', 'trust issues (justified)', 'DOJ press release addiction'];
  const DX_SELL = ['discharged against medical advice', 'feeling better, apparently', 'switched pharmacies', 'insurance denied the refill', 'side effects: taking profit', 'left before the doctor came in'];
  const rx = v => v >= WHALE ? 'CODE BLUE: whale admitted' : v >= 50 ? 'extended release, take daily' : v >= 10 ? 'twice daily with food' : '1 capsule, as needed';
  const ticket = t => '#' + String(t.block % 10000).padStart(4, '0');

  const seen = new Set(); let first = true, tape = [];
  function parse(d) {
    const a = d.attributes || {}, v = parseFloat(a.volume_in_usd);
    return { id: a.tx_hash, kind: a.kind === 'buy' ? 'buy' : 'sell', usd: isFinite(v) ? v : 0, wallet: a.tx_from_address, ts: Date.parse(a.block_timestamp), block: +a.block_number || 0, bot: !(v >= 1) };
  }
  const dx = t => t.bot ? 'automated refill (bot)' : t.kind === 'buy' ? pick(DX_BUY, hash(t.wallet)) : pick(DX_SELL, hash(t.wallet));
  function row(t, fresh) {
    const cls = t.bot ? 'wr-bot' : t.kind === 'buy' ? (t.usd >= WHALE ? 'wr-whale' : 'wr-buy') : 'wr-sell';
    return `<a class="wr-row ${cls} ${fresh ? 'fresh' : ''}" href="https://solscan.io/tx/${esc(t.id)}" target="_blank" rel="noopener" title="View the real transaction on Solscan">
      <span class="wr-tk">${ticket(t)}</span>
      <span class="wr-who"><b>PATIENT ${short(t.wallet)}</b><i>Dx: ${esc(dx(t))}</i></span>
      <span class="wr-rx">${t.bot ? '—' : t.kind === 'buy' ? `${usd(t.usd)} · ${rx(t.usd)}` : `${usd(t.usd)} · discharged`}</span>
      <span class="wr-ago">${ago(t.ts)}</span></a>`;
  }
  function flap(el, text) {
    const CH = '0123456789#';
    el.innerHTML = [...text].map(() => '<span class="ch">#</span>').join('');
    [...el.children].forEach((c, i) => { let n = 0, max = 6 + i * 3; const iv = setInterval(() => { c.textContent = ++n >= max ? text[i] : CH[Math.random() * CH.length | 0]; if (n >= max) clearInterval(iv); }, 40); });
  }
  function callUp(t, live) {
    const b = $('#wrBoard'); if (!b) return;
    flap($('#wrNum'), ticket(t));
    $('#wrPatient').textContent = `PATIENT ${short(t.wallet)}`;
    $('#wrDx').textContent = `Dx: ${dx(t)}`;
    $('#wrRx').textContent = t.kind === 'buy' ? `Rx: ${usd(t.usd)} of $PHARMA · ${rx(t.usd)}` : `${usd(t.usd)} · ${dx(t)}`;
    b.classList.remove('wr-buy', 'wr-sell', 'wr-whale'); b.classList.add(t.kind === 'buy' ? (t.usd >= WHALE ? 'wr-whale' : 'wr-buy') : 'wr-sell');
    if (live) {
      b.classList.remove('ping'); void b.offsetWidth; b.classList.add('ping');
      if (t.kind === 'buy' && t.usd >= WHALE) { const c = $('#wrCode'); c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 6000); }
      ding(t.kind === 'buy' ? (t.usd >= WHALE ? 3 : 1) : 0);
      window.dispatchEvent(new CustomEvent('ph:trade', { detail: t }));
    }
  }
  let audio = null, soundOn = false;
  function ding(kind) {
    if (!soundOn) return;
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 3 ? [880, 1175, 1568] : kind === 1 ? [988, 1319] : [440, 330];
    notes.forEach((f, i) => { const o = audio.createOscillator(), g = audio.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, audio.currentTime + i * .14); g.gain.exponentialRampToValueAtTime(.12, audio.currentTime + i * .14 + .02); g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + i * .14 + .5); o.connect(g).connect(audio.destination); o.start(audio.currentTime + i * .14); o.stop(audio.currentTime + i * .14 + .6); });
  }
  async function poll() {
    if (document.hidden) return;
    try {
      const j = await (await fetch(API)).json();
      const list = (j.data || []).map(parse).filter(t => t.id && t.ts).sort((a, b) => b.ts - a.ts);
      const fresh = list.filter(t => !seen.has(t.id)); list.forEach(t => seen.add(t.id));
      tape = list.slice(0, 50);
      const real = tape.filter(t => !t.bot);
      if (first) { const lastReal = real[0] || tape[0]; if (lastReal) callUp(lastReal, false); }
      else fresh.reverse().forEach((t, i) => setTimeout(() => { if (!t.bot) callUp(t, true); render(new Set(fresh.map(f => f.id))); }, i * 1500));
      first = false; render(new Set());
    } catch { const s = $('#wrState'); if (s) s.textContent = 'front desk offline'; }
  }
  function render(freshIds) {
    const log = $('#wrLog'); if (!log) return;
    log.innerHTML = tape.slice(0, 8).map(t => row(t, freshIds.has(t.id))).join('');
    const last = tape.find(t => !t.bot), quiet = !last || Date.now() - last.ts > 20 * 60e3;
    $('#wrState').textContent = quiet ? `waiting room quiet · last patient ${last ? ago(last.ts) : '—'}` : `now serving · last patient ${ago(last.ts)}`;
    $('#wrDot').classList.toggle('on', !quiet);
    const day = tape.filter(t => Date.now() - t.ts < 864e5);
    $('#wrStats').innerHTML = `<b>${day.filter(t => t.kind === 'buy' && !t.bot).length}</b> admitted · <b>${day.filter(t => t.kind === 'sell' && !t.bot).length}</b> discharged · <b>${day.filter(t => t.bot).length}</b> bot refills <span>(recent window)</span>`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!$('#waiting')) return;
    $('#wrSound').onclick = e => { soundOn = !soundOn; e.currentTarget.textContent = soundOn ? 'Chime: on' : 'Chime: off'; if (soundOn) ding(1); };
    poll(); setInterval(poll, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
    setInterval(() => render(new Set()), 20000);
  });
})();

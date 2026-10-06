/* PULSE — the one live data engine for $PHARMA. Every live panel on the site listens to it.
   Sources (all free, public, CORS-open, nothing simulated):
     DexScreener pair   → price, mcap, liquidity, volume, buys/sells, price change   (every 30s)
     GeckoTerminal      → last 300 trades (45s), hourly candles (2m), daily candles (10m), token info / holders (5m)
   Rules: one poller per page (never two), sessionStorage cache so navigation doesn't re-fetch,
          exponential backoff on 429, and a public `state` so late listeners can read the last snapshot. */
window.PULSE = (() => {
  const CA = 'HtrvP4fG9KiFqFeu4f32RuZiwG3nmYwPkPZ61nAbpump';
  const POOL = '3PffTrmfWe23GTNH6XNERGzzUkLDiPTejJpH9DK3R28u';
  const GT = `https://api.geckoterminal.com/api/v2/networks/solana`;
  const state = { pair: null, trades: [], candles5: [], candlesH: [], candlesD: [], holders: null, status: 'connecting', lastOk: 0, resting: false, at: {}, snapshot: false };
  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); if (state[ev] && (Array.isArray(state[ev]) ? state[ev].length : true)) fn(state[ev]); return () => { listeners[ev] = listeners[ev].filter(f => f !== fn); }; };
  const emit = (ev, d) => (listeners[ev] || []).forEach(f => { try { f(d); } catch (e) { console.warn('pulse listener', e); } });
  const cacheGet = k => { try { const c = JSON.parse(sessionStorage.getItem('pulse:' + k) || 'null'); return c && Date.now() - c.t < c.ttl ? c.v : null; } catch { return null; } };
  const cacheSet = (k, v, ttl) => { try { sessionStorage.setItem('pulse:' + k, JSON.stringify({ t: Date.now(), ttl, v })); } catch {} };

  let backoff = 1;
  async function get(url) {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (r.status === 429) { backoff = Math.min(backoff * 2, 8); state.resting = true; emit('status', state); throw new Error('429'); }
    if (!r.ok) throw new Error('http ' + r.status);
    backoff = Math.max(1, backoff / 2); state.resting = false;
    return r.json();
  }
  const scheduled = {};
  function every(key, ms, fn) {
    const run = async () => {
      if (!document.hidden) { try { await fn(); state.status = 'live'; state.lastOk = Date.now(); } catch (e) { if (e.message !== '429') state.status = 'degraded'; } emit('status', state); }
      scheduled[key] = setTimeout(run, ms * backoff);
    };
    run();
  }

  /* DexScreener pair: the headline numbers */
  async function pair() {
    const cached = cacheGet('pair'); if (cached) { state.pair = cached; emit('pair', cached); }
    const j = await get(`https://api.dexscreener.com/latest/dex/pairs/solana/${POOL}`);
    const p = (j.pairs || [j.pair])[0]; if (!p) throw new Error('no pair');
    const d = { price: +p.priceUsd, mcap: p.marketCap || p.fdv, liq: p.liquidity?.usd || 0, vol: p.volume || {}, txns: p.txns || {}, chg: p.priceChange || {}, created: p.pairCreatedAt, t: Date.now() };
    state.pair = d; state.at.pair = Date.now(); cacheSet('pair', d, 25000); emit('pair', d);
  }
  /* GeckoTerminal trades */
  const parseTrade = x => { const a = x.attributes || {}, v = parseFloat(a.volume_in_usd); return { id: a.tx_hash, kind: a.kind === 'buy' ? 'buy' : 'sell', usd: isFinite(v) ? v : 0, wallet: a.tx_from_address, ts: Date.parse(a.block_timestamp), block: +a.block_number || 0, bot: !(v >= 1), tokens: parseFloat(a.kind === 'buy' ? a.to_token_amount : a.from_token_amount) || 0 }; };
  let seen = new Set(), primed = false;
  async function trades() {
    const cached = cacheGet('trades'); if (cached && (!state.trades.length || state.snapshot)) { state.trades = cached; cached.forEach(t => seen.add(t.id)); primed = true; emit('trades', cached); }
    const j = await get(`${GT}/pools/${POOL}/trades`);
    const list = (j.data || []).map(parseTrade).filter(t => t.id && t.ts).sort((a, b) => b.ts - a.ts);
    const fresh = list.filter(t => !seen.has(t.id)); list.forEach(t => seen.add(t.id));
    state.trades = list; state.at.trades = Date.now(); state.snapshot = false; cacheSet('trades', list, 40000); emit('trades', list);
    if (primed) fresh.sort((a, b) => a.ts - b.ts).forEach((t, i) => setTimeout(() => emit('trade', t), i * 1100));
    primed = true;
  }
  /* candles: [ts, o, h, l, c, v] newest first from GT → we store oldest first */
  async function candles(kind, key, limit, ttl, agg = 1) {
    const cached = cacheGet(key); if (cached && !state[key].length) { state[key] = cached; emit(key, cached); }
    const j = await get(`${GT}/pools/${POOL}/ohlcv/${kind}?aggregate=${agg}&limit=${limit}`);
    const raw = (j.data?.attributes?.ohlcv_list || []).map(c => ({ t: c[0] * 1000, o: c[1], h: c[2], l: c[3], c: c[4], v: c[5] })).sort((a, b) => a.t - b.t);
    if (!raw.length) throw new Error('no candles');
    // GeckoTerminal omits periods with no trades. Fill them as flat, zero-volume candles flagged `quiet` (drawn grey, never interpolated).
    const step = { minute: 60000, hour: 3600000, day: 86400000 }[kind] * agg, l = [];
    for (let i = 0; i < raw.length; i++) { l.push(raw[i]); if (i < raw.length - 1) for (let t = raw[i].t + step; t < raw[i + 1].t - step / 2 && l.length < limit * 2; t += step) l.push({ t, o: raw[i].c, h: raw[i].c, l: raw[i].c, c: raw[i].c, v: 0, quiet: true }); }
    state[key] = l; state.at[key] = Date.now(); state.at.pairLiveCandles = true; cacheSet(key, l, ttl); emit(key, l);
  }
  /* token info: holders + distribution */
  async function holders() {
    const cached = cacheGet('holders'); if (cached) { state.holders = cached; emit('holders', cached); }
    const j = await get(`${GT}/tokens/${CA}/info`);
    const h = j.data?.attributes?.holders; if (!h) throw new Error('no holders');
    const d = { count: h.count, dist: h.distribution_percentage || {}, updated: h.last_updated, gt_score: j.data.attributes.gt_score };
    state.holders = d; state.at.holders = Date.now(); cacheSet('holders', d, 4 * 60000); emit('holders', d);
  }

  /* seed from the deploy-time snapshot (data/pulse_snapshot.js) so the first paint is never empty; stamped as SNAPSHOT until live data lands */
  function seed() {
    const s = window.PULSE_SNAPSHOT; if (!s) return;
    const fill = (kind, agg) => list => { const step = { minute: 60000, hour: 3600000, day: 86400000 }[kind] * agg, l = []; list.sort((a, b) => a.t - b.t).forEach((c, i, arr) => { l.push(c); if (i < arr.length - 1) for (let t = c.t + step; t < arr[i + 1].t - step / 2 && l.length < 2000; t += step) l.push({ t, o: c.c, h: c.c, l: c.c, c: c.c, v: 0, quiet: true }); }); return l; };
    if (s.trades && !state.trades.length) { state.trades = s.trades; state.at.trades = s.tradesAt; state.snapshot = true; s.trades.forEach(t => seen.add(t.id)); primed = true; emit('trades', state.trades); }
    if (s.candles5 && !state.candles5.length) { state.candles5 = fill('minute', 5)(s.candles5); state.at.candles5 = s.candles5At; emit('candles5', state.candles5); }
    if (s.candlesH && !state.candlesH.length) { state.candlesH = fill('hour', 1)(s.candlesH); state.at.candlesH = s.candlesHAt; emit('candlesH', state.candlesH); }
    if (s.candlesD && !state.candlesD.length) { state.candlesD = fill('day', 1)(s.candlesD); state.at.candlesD = s.candlesDAt; emit('candlesD', state.candlesD); }
    if (s.holders && !state.holders) { state.holders = Object.assign({ snapshot: true }, s.holders); state.at.holders = s.holdersAt; emit('holders', state.holders); }
  }
  function start() {
    if (start.done) return; start.done = true;
    seed();
    every('pair', 30000, pair);
    setTimeout(() => every('trades', 45000, trades), 1500);
    setTimeout(() => every('candles5', 60000, () => candles('minute', 'candles5', 288, 55000, 5)), 3500);
    setTimeout(() => every('candlesH', 180000, () => candles('hour', 'candlesH', 168, 170000)), 9000);
    setTimeout(() => every('candlesD', 900000, () => candles('day', 'candlesD', 365, 14 * 60000)), 14000);
    setTimeout(() => every('holders', 300000, holders), 19000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) pair().catch(() => {}); });
  }
  /* derived helpers */
  const fmtUsd = n => n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + (+n).toFixed(n < 10 ? 2 : 0);
  const fmtPrice = p => p < 0.001 ? '$' + p.toFixed(8).replace(/0+$/, '') : '$' + p.toFixed(4);
  const ago = ts => { const s = Math.max(0, (Date.now() - ts) / 1000); return s < 60 ? `${s | 0}s` : s < 3600 ? `${s / 60 | 0}m` : s < 86400 ? `${s / 3600 | 0}h` : `${s / 86400 | 0}d`; };
  return { CA, POOL, state, on, start, fmtUsd, fmtPrice, ago };
})();

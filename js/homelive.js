/* homelive.js — the one-screen live row on the homepage. Reads PULSE (DexScreener + GeckoTerminal, seeded by the deploy snapshot). Nothing simulated. */
document.addEventListener('DOMContentLoaded', () => {
  const P = window.PULSE, row = document.getElementById('liveRow'); if (!P || !row) return;
  const $ = id => document.getElementById(id);
  const money = n => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `$${Math.round(n / 1e3)}K` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;
  const price = p => !p ? '—' : p < .001 ? `$${p.toFixed(8).replace(/0+$/, '')}` : `$${p.toFixed(4)}`;
  const ago = ts => { const s = Math.max(0, (Date.now() - ts) / 1000); return s < 60 ? `${s | 0}s` : s < 3600 ? `${s / 60 | 0}m` : s < 86400 ? `${s / 3600 | 0}h` : `${s / 86400 | 0}d`; };
  const note = $('liveNote');
  const status = () => {
    if (!note) return;
    const snap = P.state.snapshot, t = P.state.at.pair || P.state.at.trades;
    if (snap && !P.state.at.pair) { note.textContent = `showing the last snapshot we took, ${t ? ago(t) : '?'} ago · live feed resting`; note.classList.add('stale'); return; }
    note.textContent = P.state.resting ? 'price is live · trade feed resting (rate limit), last snapshot shown' : 'price every 30s from DexScreener · trades and holders from GeckoTerminal · nothing simulated';
    note.classList.toggle('stale', !!P.state.resting);
  };
  P.on('pair', d => {
    $('lvPrice').textContent = price(d.price);
    const ch = +(d.chg && d.chg.h24); const el = $('lvChg');
    if (isFinite(ch)) { el.innerHTML = `<span class="${ch < 0 ? 'dn' : 'up'}">${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% 24h</span> · DexScreener`; $('lvPrice').className = ch < 0 ? 'dn' : 'up'; }
    $('lvMcap').textContent = d.mcap ? money(d.mcap) : '—';
    $('lvLiq').textContent = d.liq ? money(d.liq) : '—';
    status();
  });
  P.on('holders', h => { if (h && h.count) $('lvHold').textContent = (+h.count).toLocaleString(); });
  const trade = () => {
    const tr = (P.state.trades || []).filter(t => !t.bot).sort((a, b) => b.ts - a.ts)[0];
    if (!tr) { $('lvTrade').textContent = '—'; $('lvTradeSub').textContent = 'waiting on the first real trade'; return; }
    $('lvTrade').textContent = ago(tr.ts); $('lvTrade').className = '';
    $('lvTradeSub').textContent = `since the last real trade · ${tr.kind === 'buy' ? 'admitted' : 'discharged'} ${money(tr.usd)}`;
  };
  P.on('trades', trade); P.on('trade', trade); P.on('status', status);
  setInterval(trade, 30000);
  P.start();
  // deploy-time holder census as the first paint if GeckoTerminal is resting
  const s = window.PULSE_SNAPSHOT; if (s && s.holders && s.holders.count && $('lvHold').textContent === '—') $('lvHold').textContent = (+s.holders.count).toLocaleString();
});

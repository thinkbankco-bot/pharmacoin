/* Get Prescribed — the Pharmussy walk-in counter. Prints a 1080x1350 prescription label PNG. */
document.addEventListener('DOMContentLoaded', () => {
  const { $, toast, reduced } = PH;
  const F = window.FORMULARY || [];
  const byId = Object.fromEntries(F.map(d => [d.id, d]));

  /* Preset conditions: [condition, product id, SIG] */
  const PRESETS = [
    ['Checks chart every 4 minutes', 'conspiraspirin', 'Take 1 tablet every 4 minutes, as you were going to anyway. Do not zoom in to the 1-second chart.'],
    ['Premature liquidation', 'jeetalis', 'Take 1 tablet before entering any position. Wait 20 minutes before touching the sell button. Ask your partner if it was good for them.'],
    ['Bought the top again', 'copium-mist', 'Spray once into each nostril at the local top. Repeat at the next local top. You know the drill.'],
    ['Sold the bottom again', 'cuckcillin', 'Take 1 tablet while watching other men take profits. Pull up a chair. Get comfortable.'],
    ['Refreshes DexScreener in bed', 'foma', 'Inhale 2 puffs before bed. Phone goes in the other room. (It will not go in the other room.)'],
    ['Telling my wife it’s a long-term hold', 'gaslightra', 'Take 1 tablet before dinner. If she asks about the portfolio, you already took it.'],
    ['Down bad but vibing', 'copemethezine', '5 mL by mouth after every “it’s fine.” Keep vibing. Doctor’s orders.'],
    ['Can’t stop aping new launches', 'moonshot', 'Inject 1 dose per launch, max 40 launches per day. Do not look up the dev’s last wallet.'],
    ['Fell asleep holding a 100x, woke up holding a -90%', 'rugburn', 'Apply to the affected portfolio twice daily. Set an alarm. Set two alarms.'],
    ['Paper hands (chronic)', 'bullpostin', 'Take 1 $PHARMA daily. Do not sell before the 4th dose. Sit on hands if needed.'],
    ['Reply guy syndrome', 'raids', '1 dose per quote post. Do not reply “this.” Do not reply “gm” under a eulogy.'],
    ['Believes every KOL', 'pollio', 'Swab once per paid post. If the test shows #ad, the opinion is not yours.'],
    ['Hasn’t touched grass since 2021', 'whitepaper-towers', '28-day inpatient stay. Grass will be shown to you on day 14, under supervision.'],
    ['Diamond hands (terminal)', 'workferdabagtin', 'Take 1 tablet before every shift. Hold through all side effects. The hands are not the problem. The hands are the brand.'],
  ];
  const CUSTOM_POOL = ['bullpostin', 'copemethezine', 'conspiraspirin', 'workferdabagtin', 'moonshot', 'cuckcillin', 'jeetalis', 'scamnesia', 'raids', 'gaslightra', 'copium-mist', 'foma', 'rugburn', 'proof-of-stool', 'pollio', 'whitepaper-towers', 'dadderall', 'gregotin'].filter(id => byId[id]);
  const CUSTOM_SIG = [
    'Take 1 tablet daily with a full glass of copium. Do not sell before the 4th dose.',
    'Take as needed. You will need it. Do not operate a sell button within 6 hours.',
    'Take 2 at bedtime. Do not check the chart until morning. You will check the chart.',
    'Take 1 with food. If no food, take 1 with the chart open. Same thing, honestly.',
    'Dissolve under tongue at the first sign of a red candle. Repeat until green or asleep.',
  ];
  const WARNINGS = [
    'May cause holding.', 'Do not operate a sell button.', 'Not FDA approved (by them).', 'Side effects include telling your wife about a chart.',
    'May cause drowsiness during red candles.', 'Do not mix with leverage.', 'Avoid direct sunlight. You were going to anyway.',
    'Take with a full glass of copium.', 'May cause sudden urges to post.', 'Do not take if you have read the whitepaper.',
    'Known to the timeline to cause bullposting.', 'Do not chew. Do not jeet.', 'If symptoms persist, zoom out.',
    'May cause talking about Solana at weddings.', 'The drug is fake. The cope is real.',
  ];
  const STICKER = [['#ffd23f', '#1d1a15'], ['#ff6b3d', '#1d1a15'], ['#55d8ff', '#00111f'], ['#ff3b58', '#fff']];

  /* ---------- helpers ---------- */
  const fnv = s => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const clean = (s, max) => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max).trim();
  const cleanName = s => { const n = clean(String(s || '').replace(/@[\s@]*/g, '@'), 24); return n.replace(/^@$/, '') || 'Anonymous Patient'; };
  const presetFor = c => PRESETS.find(p => p[0].toLowerCase().replace(/[’']/g, "'") === c.toLowerCase().replace(/[’']/g, "'"));

  function prescribe(nameRaw, condRaw) {
    const name = cleanName(nameRaw);
    const cond = clean(condRaw, 60) || PRESETS[0][0];
    const h = fnv(name.toLowerCase() + '|' + cond.toLowerCase());
    const r = rng(h);
    const p = presetFor(cond);
    const drug = byId[p ? p[1] : CUSTOM_POOL[h % CUSTOM_POOL.length]] || F[0];
    const sig = p ? p[2] : CUSTOM_SIG[(h >>> 8) % CUSTOM_SIG.length];
    const w1 = Math.floor(r() * WARNINGS.length); let w2 = Math.floor(r() * (WARNINGS.length - 1)); if (w2 >= w1) w2++;
    const s1 = Math.floor(r() * STICKER.length); let s2 = Math.floor(r() * (STICKER.length - 1)); if (s2 >= s1) s2++;
    const rxNo = `${String(1000000 + (h % 9000000)).replace(/(\d{3})(\d{4})/, '$1-$2')}`;
    const d = new Date();
    const date = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
    return { name, cond, drug, sig, rxNo, date, h, warns: [[WARNINGS[w1], STICKER[s1]], [WARNINGS[w2], STICKER[s2]]] };
  }

  /* ---------- form ---------- */
  const sel = $('#rxCond'), custom = $('#rxCustom'), nameIn = $('#rxName');
  sel.innerHTML = PRESETS.map((p, i) => `<option value="${i}">${PH.esc(p[0])}</option>`).join('');
  custom.addEventListener('input', () => { $('#rxCount').textContent = custom.value.length; sel.classList.toggle('dim', !!custom.value.trim()); });
  const currentCond = () => clean(custom.value, 60) || PRESETS[+sel.value][0];

  /* ---------- canvas ---------- */
  const cv = $('#rxCanvas'), x = cv.getContext('2d'), W = 1080, H = 1350;
  const imgCache = {};
  const loadImg = src => imgCache[src] || (imgCache[src] = new Promise(res => {
    if (!src || location.protocol === 'file:') return res(null); // file:// would taint the canvas
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
  }));
  const fontsReady = Promise.all(['900 64px Inter', '800 30px Inter', 'italic 900 70px Inter', '500 22px "IBM Plex Mono"', '700 22px "IBM Plex Mono"'].map(f => document.fonts.load(f).catch(() => 0))).then(() => document.fonts.ready);
  const SANS = (w, s, it = '') => `${it}${w} ${s}px Inter, Arial, sans-serif`;
  const MONO = (w, s) => `${w} ${s}px "IBM Plex Mono", Consolas, monospace`;

  function fit(text, weight, max, maxW, min = 22, it = '') { let s = max; x.font = SANS(weight, s, it); while (s > min && x.measureText(text).width > maxW) { s -= 2; x.font = SANS(weight, s, it); } return s; }
  function wrapLines(text, maxW) {
    const words = String(text).split(' '); const out = []; let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out;
  }
  function wrapFit(text, weight, max, min, maxW, maxLines, lhK = 1.18, mono = false) {
    let s = max, lines;
    for (; ; s -= 2) { x.font = mono ? MONO(weight, s) : SANS(weight, s); lines = wrapLines(text, maxW); if (lines.length <= maxLines || s <= min) break; }
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; }
    return { s, lines, lh: Math.round(s * lhK) };
  }
  /* Largest font size whose wrapped block fits maxW x maxH; ellipsis at min size */
  function fitBox(text, weight, max, min, maxW, maxH, lhK = 1.2) {
    let s = max, lines, lh;
    for (; ; s -= 1) { x.font = SANS(weight, s); lines = wrapLines(text, maxW); lh = Math.round(s * lhK); if (s + (lines.length - 1) * lh <= maxH || s <= min) break; }
    const cap = Math.max(1, Math.floor((maxH - s) / lh) + 1);
    if (lines.length > cap) { lines = lines.slice(0, cap); lines[cap - 1] = lines[cap - 1].replace(/\s*\S*$/, '') + '…'; }
    return { s, lines, lh, bh: s + (lines.length - 1) * lh };
  }
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect(X, Y, w, h, r); };

  function capsule(cx, cy, len, rad, rot, a, b) {
    x.save(); x.translate(cx, cy); x.rotate(rot);
    x.fillStyle = a; rr(-len / 2, -rad, len / 2 + rad, rad * 2, rad); x.fill();
    x.fillStyle = b; rr(-rad, -rad, len / 2 + rad, rad * 2, rad); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)'; rr(-len / 2 + rad * .6, -rad * .62, len - rad * 1.2, rad * .34, rad * .17); x.fill();
    x.restore();
  }

  async function draw(rx, withImg = true) {
    await fontsReady;
    const img = withImg ? await loadImg(rx.drug.img) : null;
    const accent = rx.drug.color || '#15a7ff';
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
    // background: dark lab + grid + glows
    x.fillStyle = '#050914'; x.fillRect(0, 0, W, H);
    let g = x.createRadialGradient(170, 60, 0, 170, 60, 700); g.addColorStop(0, 'rgba(21,167,255,.30)'); g.addColorStop(1, 'rgba(21,167,255,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    g = x.createRadialGradient(980, 1300, 0, 980, 1300, 700); g.addColorStop(0, 'rgba(255,59,88,.22)'); g.addColorStop(1, 'rgba(255,59,88,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(117,154,199,.10)'; x.lineWidth = 1;
    for (let i = 0; i <= W; i += 54) { x.beginPath(); x.moveTo(i + .5, 0); x.lineTo(i + .5, H); x.stroke(); }
    for (let i = 0; i <= H; i += 54) { x.beginPath(); x.moveTo(0, i + .5); x.lineTo(W, i + .5); x.stroke(); }
    // scattered pills
    capsule(70, 1150, 120, 24, -.7, '#ff3b58', '#eaf5ff'); capsule(1010, 175, 110, 22, .9, '#15a7ff', '#eaf5ff'); capsule(1020, 1010, 90, 18, -.3, '#ffb84d', '#eaf5ff');

    // headline
    x.textAlign = 'left'; x.fillStyle = '#eaf5ff';
    x.font = SANS(900, 86, 'italic '); x.fillText('I GOT', 62, 112);
    const gw = x.measureText('I GOT ').width; x.fillStyle = '#55d8ff'; x.fillText('PRESCRIBED.', 62 + gw, 112);
    x.font = MONO(600, 20); x.fillStyle = '#8ea7c1'; x.fillText('PATIENT COPY · KEEP OUT OF REACH OF EXIT LIQUIDITY', 66, 148);

    // the label (paper), slightly rotated
    const px = 70, py = 180, pw = 940, ph = 1040;
    x.save(); x.translate(W / 2, py + ph / 2); x.rotate(-0.012); x.translate(-W / 2, -(py + ph / 2));
    x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 50; x.shadowOffsetY = 24; x.fillStyle = '#f6f2e7'; rr(px, py, pw, ph, 22); x.fill(); x.restore();
    x.save(); rr(px, py, pw, ph, 22); x.clip();
    // header band
    x.fillStyle = '#0b1220'; x.fillRect(px, py, pw, 132);
    x.fillStyle = accent; x.fillRect(px, py + 132, pw, 10);
    // Rx glyph
    x.fillStyle = '#55d8ff'; x.beginPath(); x.arc(px + 78, py + 66, 46, 0, 7); x.fill();
    x.fillStyle = '#050914'; x.font = SANS(900, 46); x.textAlign = 'center'; x.fillText('Rx', px + 78, py + 82);
    x.textAlign = 'left'; x.fillStyle = '#eaf5ff'; x.font = SANS(900, 54); x.fillText('THE PHARMUSSY', px + 144, py + 70);
    x.font = MONO(500, 19); x.fillStyle = '#8ea7c1'; x.fillText('Dispensed by PHARMA Holdings plc · Store #0420', px + 146, py + 106);
    // barcode in the header band
    let bx = px + pw - 210; const br = rng(rx.h ^ 0x5bd1e995); x.fillStyle = '#eaf5ff';
    while (bx < px + pw - 44) { const w = 2 + Math.floor(br() * 3) * 2; x.fillRect(bx, py + 34, w, 52); bx += w + 3 + Math.floor(br() * 3) * 2; }
    x.font = MONO(500, 14); x.fillStyle = '#8ea7c1'; x.textAlign = 'right'; x.fillText(`NDC 0420-${rx.rxNo}`, px + pw - 44, py + 108); x.textAlign = 'left';
    // Rx no / date
    let y = py + 190;
    x.fillStyle = '#6b5f4f'; x.font = MONO(600, 22);
    x.fillText('Rx #', px + 44, y); x.fillStyle = '#1d1a15'; x.font = MONO(700, 26); x.fillText(rx.rxNo, px + 110, y);
    x.textAlign = 'right'; x.fillStyle = '#1d1a15'; x.fillText(rx.date, px + pw - 44, y);
    x.fillStyle = '#6b5f4f'; x.font = MONO(600, 22); x.fillText('DATE', px + pw - 44 - x.measureText(rx.date).width - 54, y);
    const dash = yy => { x.save(); x.setLineDash([10, 9]); x.strokeStyle = 'rgba(29,26,21,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px + 44, yy); x.lineTo(px + pw - 44, yy); x.stroke(); x.restore(); };
    dash(y + 22);
    // patient
    x.textAlign = 'left'; y += 66; x.fillStyle = '#6b5f4f'; x.font = MONO(600, 20); x.fillText('PATIENT', px + 44, y);
    const ns = fit(rx.name.toUpperCase(), 900, 70, pw - 88, 34); y += ns + 6;
    x.fillStyle = '#111'; x.font = SANS(900, ns); x.fillText(rx.name.toUpperCase(), px + 42, y);
    // condition
    y += 42; x.fillStyle = '#6b5f4f'; x.font = MONO(600, 20); x.fillText('CONDITION', px + 44, y);
    const cw = wrapFit(rx.cond, 800, 38, 26, pw - 88, 2, 1.15);
    x.fillStyle = '#c4122f'; x.font = SANS(800, cw.s);
    cw.lines.forEach((l, i) => x.fillText(l, px + 44, y + cw.s + 6 + i * cw.lh));
    y += cw.s + 6 + (cw.lines.length - 1) * cw.lh + 26;
    dash(y);

    // drug block: art left, details right
    const ay = y + 22, ah = cw.lines.length > 1 ? 260 : 290, aw = Math.round(ah * .76), ax = px + 44;
    x.save(); rr(ax, ay, aw, ah, 14); x.clip();
    x.fillStyle = accent; x.fillRect(ax, ay, aw, ah);
    if (img) { const s = Math.max(aw / img.width, ah / img.height), iw = img.width * s, ih = img.height * s; x.drawImage(img, ax + (aw - iw) / 2, ay + (ah - ih) / 2, iw, ih); }
    else { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(ax, ay, aw, ah); capsule(ax + aw / 2, ay + ah / 2, 170, 36, -.6, '#f6f2e7', '#ff3b58'); }
    x.restore();
    x.strokeStyle = '#1d1a15'; x.lineWidth = 3; rr(ax, ay, aw, ah, 14); x.stroke();

    const dx = ax + aw + 34, dw = px + pw - 44 - dx;
    let dy = ay + 26; x.fillStyle = '#6b5f4f'; x.font = MONO(600, 20); x.fillText('DISPENSE', dx, dy);
    const dname = rx.drug.name + '®';
    const ds = fit(dname, 900, 62, dw, 32); dy += ds + 4; x.fillStyle = '#111'; x.font = SANS(900, ds); x.fillText(dname, dx, dy);
    const gl = wrapFit(`${rx.drug.generic} · ${rx.drug.cls}`, 500, 20, 15, dw, 1, 1.3, true);
    x.fillStyle = '#6b5f4f'; x.font = MONO(500, gl.s); gl.lines.forEach((l, i) => x.fillText(l, dx, dy + 34 + i * gl.lh));
    dy += 34 + (gl.lines.length - 1) * gl.lh + 26;
    // SIG box
    const sigTop = dy, sigH = ay + ah - sigTop;
    x.fillStyle = 'rgba(29,26,21,.06)'; rr(dx, sigTop, dw, sigH, 12); x.fill();
    x.fillStyle = accent; x.fillRect(dx, sigTop, 8, sigH);
    x.fillStyle = '#6b5f4f'; x.font = MONO(700, 18); x.fillText('SIG · DIRECTIONS', dx + 26, sigTop + 32);
    const sw = fitBox(rx.sig, 700, 28, 17, dw - 50, sigH - 46 - 18, 1.24);
    x.fillStyle = '#1d1a15'; x.font = SANS(700, sw.s);
    const sigBodyH = sw.bh; const sy0 = sigTop + 46 + Math.max(0, (sigH - 46 - 16 - sigBodyH) / 2) + sw.s * .82;
    sw.lines.forEach((l, i) => x.fillText(l, dx + 26, sy0 + i * sw.lh));

    // refills / prescriber
    y = ay + ah + 44;
    x.fillStyle = '#6b5f4f'; x.font = MONO(600, 20); x.fillText('REFILLS', px + 44, y); x.fillText('QTY', px + 330, y); x.fillText('PRESCRIBER', px + 520, y);
    x.fillStyle = '#c4122f'; x.font = SANS(900, 40); x.fillText('UNLIMITED', px + 44, y + 44);
    x.fillStyle = '#1d1a15'; x.font = SANS(900, 40); x.fillText('∞', px + 330, y + 44);
    x.font = SANS(800, 26); x.fillText('Dr. H. Fennwick (hon.)', px + 520, y + 34);
    x.font = MONO(500, 18); x.fillStyle = '#6b5f4f'; x.fillText('PHARMA Holdings plc', px + 520, y + 60);

    // warning stickers
    const stY = y + 68;
    const sticker = (sx, syy, w, h, rot, [txt, [bg, fg]]) => {
      x.save(); x.translate(sx + w / 2, syy + h / 2); x.rotate(rot);
      x.shadowColor = 'rgba(0,0,0,.18)'; x.shadowBlur = 8; x.shadowOffsetY = 3; x.fillStyle = bg; rr(-w / 2, -h / 2, w, h, 14); x.fill(); x.shadowColor = 'transparent';
      x.fillStyle = fg; x.font = MONO(700, 15); x.textAlign = 'left'; x.fillText('⚠ WARNING', -w / 2 + 20, -h / 2 + 27);
      const t = fitBox(txt.toUpperCase(), 900, 25, 14, w - 40, h - 40 - 14, 1.12);
      x.font = SANS(900, t.s); const top = -h / 2 + 40 + Math.max(0, (h - 40 - 12 - (t.s + (t.lines.length - 1) * t.lh)) / 2) + t.s * .82;
      t.lines.forEach((l, i) => x.fillText(l, -w / 2 + 20, top + i * t.lh));
      x.restore();
    };
    const stW = (pw - 88 - 30) / 2, stH = 104;
    sticker(px + 44, stY, stW, stH, -0.025, rx.warns[0]);
    sticker(px + 44 + stW + 30, stY + 4, stW, stH, 0.02, rx.warns[1]);

    // fine print
    x.textAlign = 'center'; x.font = MONO(600, 15); x.fillStyle = '#6b5f4f';
    x.fillText('FICTIONAL PRODUCT · SATIRE · NOT MEDICAL ADVICE · NOT FINANCIAL ADVICE', px + pw / 2, stY + stH + 34);
    x.restore(); // clip
    x.restore(); // rotation

    // footer
    x.textAlign = 'center';
    x.font = SANS(900, 42); const f1 = '$PHARMA', f2 = '  ·  buypharmacoin.xyz/prescribed';
    x.font = SANS(900, 40); const w1 = x.measureText(f1).width; x.font = SANS(700, 32); const w2 = x.measureText(f2).width;
    const fx = (W - w1 - w2) / 2;
    x.textAlign = 'left'; x.font = SANS(900, 40); x.fillStyle = '#55d8ff'; x.fillText(f1, fx, 1282);
    x.font = SANS(700, 32); x.fillStyle = '#eaf5ff'; x.fillText(f2, fx + w1, 1282);
    x.textAlign = 'center'; x.font = MONO(500, 17); x.fillStyle = '#8ea7c1'; x.fillText('Satire; not medical advice. The drugs are memes. Refills are a lifestyle.', W / 2, 1318);
    // tainted-canvas guard: if an image ever taints, redraw without it
    if (img) { try { cv.toDataURL('image/png').length; } catch { return draw(rx, false); } }
  }

  /* ---------- print flow ---------- */
  let last = null, printing = false;
  const label = $('#rxLabel'), screen = $('#rxScreen');
  const shareUrl = rx => `https://buypharmacoin.xyz/prescribed?n=${encodeURIComponent(rx.name === 'Anonymous Patient' ? '' : rx.name)}&c=${encodeURIComponent(rx.cond)}`;

  async function print(nameRaw, condRaw, opts = {}) {
    if (printing) return; printing = true; $('#rxGo').disabled = true;
    const rx = prescribe(nameRaw, condRaw); last = rx;
    screen.textContent = 'INSURANCE DENIED · PRINTING ANYWAY';
    if (!opts.noScroll && innerWidth < 980) document.querySelector('.rxp-counter').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    label.classList.remove('out'); label.classList.add('printing');
    $('#rxEmpty').hidden = true;
    await draw(rx);
    label.offsetHeight; // reflow
    const dur = reduced || opts.instant ? 0 : 1700;
    label.style.setProperty('--dur', dur + 'ms');
    requestAnimationFrame(() => label.classList.add('out'));
    setTimeout(() => {
      label.classList.remove('printing'); printing = false; $('#rxGo').disabled = false;
      screen.textContent = `DISPENSED · ${rx.drug.name.toUpperCase()} · RX ${rx.rxNo}`;
      $('#rxActions').hidden = false; $('#rxHint').hidden = false;
      const text = `I got prescribed. Condition: ${rx.cond}. Rx: ${rx.drug.name}. Refills: unlimited. $PHARMA buypharmacoin.xyz/prescribed`;
      $('#rxPost').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
      try { history.replaceState(null, '', `${location.pathname}?n=${encodeURIComponent(rx.name === 'Anonymous Patient' ? '' : rx.name)}&c=${encodeURIComponent(rx.cond)}`); } catch {}
    }, dur + 60);
  }

  $('#rxForm').addEventListener('submit', e => { e.preventDefault(); print(nameIn.value, currentCond()); });
  $('#rxSave').onclick = () => {
    if (!last) return;
    try {
      cv.toBlob(b => {
        if (!b) return toast('The printer jammed. Try again.');
        const a = document.createElement('a'); a.href = URL.createObjectURL(b);
        a.download = `pharma-rx-${(last.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'patient').toLowerCase()}-${last.rxNo}.png`;
        a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Label printed. Welcome to the ward, patient.');
      }, 'image/png');
    } catch { toast('The printer jammed. Try again.'); }
  };
  $('#rxLink').onclick = async () => { if (!last) return; const u = shareUrl(last); try { await navigator.clipboard.writeText(u); toast('Rx link copied. Same name, same label.'); } catch { toast(u); } };

  /* Expose for the sample generator / tests */
  window.RXP = { prescribe, draw, print, canvas: cv };

  /* Shareable URL: ?n=&c= pre-fills and auto-prints */
  const q = new URLSearchParams(location.search);
  if (q.has('n') || q.has('c')) {
    const n = clean(q.get('n'), 40), c = clean(q.get('c'), 60);
    nameIn.value = n;
    const p = c && presetFor(c);
    if (p) sel.value = PRESETS.indexOf(p); else if (c) { custom.value = c; $('#rxCount').textContent = c.length; sel.classList.add('dim'); }
    setTimeout(() => print(n, c || PRESETS[+sel.value][0], { noScroll: true }), 500);
  }
});

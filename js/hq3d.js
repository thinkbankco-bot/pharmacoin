/* PHARMA HQ — a lab you scroll through.
   One continuous 3D building. Scroll moves the camera floor to floor; nothing is a tab.
   Everything that moves on its own is ambient; everything that REACTS is driven by real data:
   real trades (GeckoTerminal), real holder count (GeckoTerminal), real market cap (DexScreener),
   real raiders (X sweep), real receipts (archive), real FEC money (The Floor), real boss caps (targets.js). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const CA = 'HtrvP4fG9KiFqFeu4f32RuZiwG3nmYwPkPZ61nAbpump';
const POOL = '3PffTrmfWe23GTNH6XNERGzzUkLDiPTejJpH9DK3R28u';
const BUY = `https://phantom.com/tokens/solana/${CA}`;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => n >= 1e12 ? '$' + (n / 1e12).toFixed(2) + 'T' : n >= 1e9 ? '$' + (n / 1e9).toFixed(n >= 1e10 ? 1 : 2) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + (+n).toFixed(2);
const ago = ts => { const s = Math.max(0, (Date.now() - ts) / 1000); return s < 60 ? `${s | 0}s ago` : s < 3600 ? `${s / 60 | 0}m ago` : s < 86400 ? `${s / 3600 | 0}h ago` : `${s / 86400 | 0}d ago`; };
const mobile = matchMedia('(max-width: 760px)').matches || matchMedia('(hover: none)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = { cyan: 0x6fe6ff, blue: 0x1aa7ff, gold: 0xe6c36a, red: 0xff5468, white: 0xeef6ff };

/* ---------------- boot ---------------- */
const bootBar = $('#bootBar');
const step = p => { bootBar.style.width = (p * 100) + '%'; };

/* ---------------- renderer + scene ---------------- */
const canvas = $('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const FOG = new THREE.Color(0x0a2b52);
scene.background = FOG.clone();
scene.fog = new THREE.FogExp2(FOG, 0.0175);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(mobile ? 62 : 48, innerWidth / innerHeight, 0.1, 400);

scene.add(new THREE.HemisphereLight(0xbfe6ff, 0x0a1a33, 0.9));
const key = new THREE.DirectionalLight(0xdff3ff, 1.1); key.position.set(10, 30, 20); scene.add(key);

/* ---------------- helpers ---------------- */
const glow = (color, intensity = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false });
const chrome = new THREE.MeshStandardMaterial({ color: 0xcfe0f2, metalness: 1, roughness: 0.18 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x12263f, metalness: 0.8, roughness: 0.35 });
const goldMat = new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.22, emissive: 0x3a2a08, emissiveIntensity: 0.4 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, metalness: 0, roughness: 0.06, transmission: 0.92, thickness: 0.6, ior: 1.45, transparent: true, opacity: 0.55, envMapIntensity: 1.4 });
function textTexture(draw, w = 1024, h = 512) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function label(text, { size = 64, color = '#eef6ff', h = 160, font = 'Archivo', weight = 600, stretch = '125%', spacing = 18, scale = 6, glowCol = 'rgba(111,230,255,.6)' } = {}) {
  // canvas sized to the text, so nothing ever clips; `scale` = world height-ish of the cap line
  const fontStr = `${weight} ${stretch === '125%' ? 'ultra-expanded ' : ''}${size}px ${font}, Arial`;
  const mc = document.createElement('canvas').getContext('2d'); mc.font = fontStr; if ('letterSpacing' in mc) mc.letterSpacing = spacing + 'px';
  const w = Math.min(4096, Math.ceil(mc.measureText(text).width + spacing * 2 + 80));
  const tex = textTexture((x, W, H) => {
    x.font = fontStr; x.textAlign = 'center'; x.textBaseline = 'middle';
    if ('letterSpacing' in x) x.letterSpacing = spacing + 'px';
    x.shadowColor = glowCol; x.shadowBlur = 24; x.fillStyle = color; x.fillText(text, W / 2, H / 2);
  }, w, h);
  const worldH = scale * 160 / 1024;
  return new THREE.Mesh(new THREE.PlaneGeometry(worldH * w / h, worldH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
}

/* ---------------- the building ---------------- */
const LEN = 290;
// glossy floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, LEN + 80), new THREE.MeshStandardMaterial({ color: 0x0e2f55, metalness: 0.55, roughness: 0.16, envMapIntensity: 1.2 }));
floor.rotation.x = -Math.PI / 2; floor.position.z = -LEN / 2 + 20; scene.add(floor);
// floor light seams
const seamGeo = new THREE.BoxGeometry(0.06, 0.01, LEN + 60);
for (const x of [-22, -7, 7, 22]) { const s = new THREE.Mesh(seamGeo, glow(C.cyan, 0.55)); s.position.set(x, 0.01, -LEN / 2 + 20); scene.add(s); }
// ceiling light strips + columns
const stripGeo = new THREE.BoxGeometry(34, 0.12, 0.5);
for (let z = 20; z > -LEN; z -= 14) {
  const s = new THREE.Mesh(stripGeo, glow(0xdff6ff, 1.1)); s.position.set(0, 19, z); scene.add(s);
  for (const x of [-28, 28]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.4, 20, 1.4), darkMetal); col.position.set(x, 10, z); scene.add(col);
    const ln = new THREE.Mesh(new THREE.BoxGeometry(0.08, 18, 0.08), glow(C.cyan, 0.8)); ln.position.set(x + (x < 0 ? 0.75 : -0.75), 10, z); scene.add(ln);
  }
}
// side glass walls with the brand faintly etched
const wallMat = new THREE.MeshStandardMaterial({ color: 0x0c2a4c, metalness: 0.2, roughness: 0.4, transparent: true, opacity: 0.7 });
for (const x of [-30, 30]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(LEN + 60, 20), wallMat); w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; w.position.set(x, 10, -LEN / 2 + 20); scene.add(w); }
step(0.15);

/* ---------------- floor 0: atrium + caduceus ---------------- */
const caduceus = new THREE.Group();
{
  const cyan = glow(C.cyan, 1.05), core = glow(0xffffff, 1.1);
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 13, 24), cyan); staff.position.y = 6.5; caduceus.add(staff);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 24), core); orb.position.y = 13.4; caduceus.add(orb);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 12, 40), cyan); ring.position.y = 12.5; ring.rotation.x = Math.PI / 2; caduceus.add(ring);
  // two serpents: helices with opposite phase, radius tapering upward
  for (const ph of [0, Math.PI]) {
    const pts = [];
    for (let i = 0; i <= 120; i++) { const t = i / 120, y = 0.8 + t * 10.4, r = 1.25 * (1 - t * 0.35); pts.push(new THREE.Vector3(Math.cos(t * Math.PI * 5 + ph) * r, y, Math.sin(t * Math.PI * 5 + ph) * r)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.17, 10), cyan); caduceus.add(tube);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), cyan); head.scale.set(1.3, 0.8, 1); head.position.copy(pts[pts.length - 1]).add(new THREE.Vector3(Math.cos(ph) * 0.3, 0.2, 0)); caduceus.add(head);
  }
  // wings: fans of feathers
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const f = new THREE.Shape(); const L = 3.8 + i * 0.28, Wd = 0.42;
      f.moveTo(0, 0); f.quadraticCurveTo(L * 0.5, Wd, L, 0.05); f.quadraticCurveTo(L * 0.5, -Wd * 0.4, 0, 0);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(f, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cyan).multiplyScalar(0.75 - i * 0.04), toneMapped: false, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
      m.position.set(side * 0.4, 11.6 - i * 0.12, 0); m.rotation.z = side > 0 ? 0.55 - i * 0.13 : Math.PI - 0.55 + i * 0.13;
      caduceus.add(m);
    }
  }
  caduceus.position.set(mobile ? 0 : 7, 0.5, -14); caduceus.scale.setScalar(1.35); scene.add(caduceus);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.5, 64), darkMetal); pad.position.set(mobile ? 0 : 7, 0.25, -14); scene.add(pad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.05, 8, 96), glow(C.cyan, 1.2)); padRing.rotation.x = Math.PI / 2; padRing.position.set(mobile ? 0 : 7, 0.52, -14); scene.add(padRing);
  const atriumLight = new THREE.PointLight(C.cyan, 60, 40, 2); atriumLight.position.set(0, 10, -12); scene.add(atriumLight);
}
step(0.3);

/* ---------------- floor 1: the press ---------------- */
const press = { group: new THREE.Group(), die: null, dieY: 6.2, stamp: 0, capsules: [], belt: null };
{
  const g = press.group;
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.6, 6), darkMetal); base.position.y = 0.8; g.add(base);
  const anvil = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 48), chrome); anvil.position.y = 1.9; g.add(anvil);
  for (const x of [-2.8, 2.8]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 9, 24), chrome); c.position.set(x, 5.6, 0); g.add(c); }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.2, 2.2), darkMetal); beam.position.y = 10.4; g.add(beam);
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 4, 24), chrome); piston.position.y = 8.2; g.add(piston); press.piston = piston;
  const die = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.9, 48), goldMat); die.position.y = press.dieY; g.add(die); press.die = die;
  const dieRing = new THREE.Mesh(new THREE.TorusGeometry(1.27, 0.04, 8, 64), glow(C.gold, 1.6)); dieRing.rotation.x = Math.PI / 2; die.add(dieRing);
  // conveyor
  const belt = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 1.6), new THREE.MeshStandardMaterial({ color: 0x0b1d33, metalness: 0.5, roughness: 0.5 })); belt.position.set(9, 1.95, 0); g.add(belt);
  for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 1.6), glow(C.cyan, 0.5)); r.position.set(2.5 + i, 2.12, 0); g.add(r); press.belt = press.belt || []; press.belt.push(r); }
  // collection jar
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.6, 3.6, 48, 1, true), glassMat); jar.position.set(17, 1.8, 0); g.add(jar);
  const jarGlow = new THREE.PointLight(C.cyan, 12, 12, 2); jarGlow.position.set(17, 3, 0); g.add(jarGlow);
  const gl = new THREE.PointLight(C.gold, 40, 22, 2); gl.position.set(0, 7, 4); g.add(gl);
  g.position.set(-18, 0, -52); g.rotation.y = 0.35; scene.add(g);
  // floating brand capsule (the product) above the press
  const cap = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.CapsuleGeometry(1.1, 2.4, 12, 32), new THREE.MeshPhysicalMaterial({ color: 0x0a1a33, metalness: 0.3, roughness: 0.25, clearcoat: 1 }));
  const glassHalf = new THREE.Mesh(new THREE.CapsuleGeometry(1.12, 2.4, 12, 32, ), glassMat);
  glassHalf.scale.set(1.01, 1, 1.01);
  // clip trick: offset two capsules visually
  shell.position.y = -0.9; shell.scale.y = 0.62; glassHalf.position.y = 0.9; glassHalf.scale.y = 0.62;
  const liquid = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.2, 8, 24), glow(C.cyan, 1.2)); liquid.position.y = 0.8; liquid.scale.y = 0.6;
  const dollar = label('$', { size: 220, h: 256, scale: 6, color: '#bff4ff', spacing: 0, stretch: '100%', weight: 800 }); dollar.position.set(0, -0.9, 1.15);
  cap.add(shell, glassHalf, liquid, dollar);
  cap.rotation.z = -0.9; cap.position.set(-18, 13.5, -52); scene.add(cap); press.cap = cap;
  // hologram tape screen
  press.tapeTex = textTexture(() => {}, 1024, 640);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.6), new THREE.MeshBasicMaterial({ map: press.tapeTex, transparent: true, toneMapped: false, depthWrite: false }));
  scr.position.set(-5, 7.5, -60); scr.rotation.y = 0.2; scene.add(scr);
}
step(0.45);

/* ---------------- floor 2: the dispensary wall (one vial per holder) ---------------- */
const vials = { liquid: null, count: 0, flash: [] };
function buildVials(n) {
  if (vials.liquid) { scene.remove(vials.liquid, vials.shell); }
  const cols = 64, rows = Math.ceil(n / cols), sx = 0.46, sy = 0.92;
  const liquidGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.5, 10);
  const shellGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.72, 10, 1, true);
  const liquid = new THREE.InstancedMesh(liquidGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), n);
  const shell = new THREE.InstancedMesh(shellGeo, new THREE.MeshStandardMaterial({ color: 0xcfeaff, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.22 }), n);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const x = (c - cols / 2) * sx, y = 1.6 + r * sy;
    const top = i < 10;
    m.makeScale(top ? 2.4 : 1, top ? 2.2 : 1, top ? 2.4 : 1); m.setPosition(x, top ? y + 0.4 : y, 0);
    liquid.setMatrixAt(i, m); shell.setMatrixAt(i, m);
    const h = 0.52 + 0.06 * Math.sin(i * 12.9898);
    liquid.setColorAt(i, top ? col.setRGB(1.25, 0.92, 0.32) : col.setHSL(h, 0.9, 0.42 + 0.07 * Math.sin(i * 3.7)).multiplyScalar(0.8));
  }
  liquid.instanceColor.needsUpdate = true;
  const grp = new THREE.Group(); grp.add(liquid, shell);
  // shelves
  for (let r = 0; r <= rows; r++) { const s = new THREE.Mesh(new THREE.BoxGeometry(cols * sx + 1, 0.06, 0.6), glow(0x9fdcff, 0.35)); s.position.set(-sx / 2, 1.6 + r * sy - 0.42, 0); grp.add(s); }
  grp.position.set(14, 0, -100); grp.rotation.y = -0.5; scene.add(grp);
  vials.liquid = liquid; vials.shell = grp; vials.count = n; vials.cols = cols;
}
buildVials(1866);
{ const t = label('THE DISPENSARY', { size: 70, scale: 12 }); t.position.set(14, 1.6 + 30 * 0.92 + 2.4, -100); t.rotation.y = -0.5; scene.add(t); }
const shelfLight = new THREE.PointLight(C.cyan, 50, 40, 2); shelfLight.position.set(10, 12, -88); scene.add(shelfLight);
step(0.6);

/* ---------------- floor 3: executive booths (top raiders) ---------------- */
const booths = new THREE.Group();
function buildBooths(list) {
  booths.clear();
  list.slice(0, 5).forEach((r, i) => {
    const b = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 5), new THREE.MeshPhysicalMaterial({ color: 0xe8f6ff, roughness: 0.05, transmission: 0.9, thickness: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    box.position.y = 3; b.add(box);
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5, 6, 5)), new THREE.LineBasicMaterial({ color: i === 0 ? 0xffdf8f : 0x9fe8ff })); frame.position.y = 3; b.add(frame);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 5.4), darkMetal); plinth.position.y = 0.15; b.add(plinth);
    // hologram avatar disc
    const tex = textTexture((x, W, H) => {
      const g = x.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W / 2); g.addColorStop(0, 'rgba(111,230,255,.35)'); g.addColorStop(1, 'rgba(111,230,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.font = '700 150px Archivo, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#dff8ff'; x.fillText((r.handle || '?')[0].toUpperCase(), W / 2, H / 2);
    }, 512, 512);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
    disc.position.y = 3.6; b.add(disc); b.userData.disc = disc;
    if (r.avatar) {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { try { const t = textTexture((x, W, H) => { x.save(); x.beginPath(); x.arc(W / 2, H / 2, W / 2 - 6, 0, 7); x.clip(); x.drawImage(img, 0, 0, W, H); x.restore(); x.strokeStyle = i === 0 ? '#ffdf8f' : '#6fe6ff'; x.lineWidth = 10; x.beginPath(); x.arc(W / 2, H / 2, W / 2 - 6, 0, 7); x.stroke(); }, 512, 512); t.source.data.getContext('2d').getImageData(0, 0, 1, 1); disc.material.map = t; disc.material.needsUpdate = true; } catch { /* CORS-tainted: keep initial */ } };
      img.src = r.avatar.replace('_normal', '_200x200');
    }
    const plate = label('@' + r.handle, { size: 64, scale: 4.6, color: i === 0 ? '#ffdf8f' : '#eef6ff', glowCol: i === 0 ? 'rgba(230,195,106,.7)' : 'rgba(111,230,255,.6)', spacing: 4, stretch: '100%' });
    plate.position.set(0, 6.7, 0); b.add(plate);
    const rank = label(i === 0 ? 'PRESCRIBER OF THE MONTH' : `RANK ${i + 1} · IMPACT ${r.score}`, { size: 36, scale: 4.2, color: '#9db7d6', spacing: 8 });
    rank.position.set(0, 0.6, 2.6); b.add(rank);
    const lamp = new THREE.PointLight(i === 0 ? C.gold : C.cyan, i === 0 ? 30 : 14, 9, 2); lamp.position.set(0, 5, 0); b.add(lamp);
    b.position.set(-27 + i * 5.6, 0, -141 + Math.abs(i - 2) * 1.4); b.rotation.y = 0.32 - i * 0.08; b.scale.setScalar(0.92); booths.add(b);
  });
  if (!list.length) { const t = label('BOOTHS OPEN AFTER THE FIRST X SWEEP', { size: 44, scale: 14 }); t.position.set(-16, 4, -138); booths.add(t); }
}
scene.add(booths);
step(0.7);

/* ---------------- floor 4: the archive (floating files) ---------------- */
const archive = new THREE.Group(), files = [];
{
  const R = (window.RECEIPTS || []).slice();
  R.forEach((r, i) => {
    const tex = textTexture((x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(236,247,255,.96)'); g.addColorStop(1, 'rgba(206,228,250,.92)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = '#0a6fb8'; x.fillRect(0, 0, W, 14);
      x.fillStyle = '#3b6a9a'; x.font = '600 26px "IBM Plex Mono", monospace'; x.fillText(`FILE ${String(i + 1).padStart(3, '0')} · ${r.year} · VERIFIED`, 30, 64);
      x.fillStyle = '#06213f'; x.font = '700 44px Archivo, Arial';
      const words = String(r.title).split(' '); let line = '', y = 130;
      for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > W - 60 && line) { x.fillText(line, 30, y); y += 52; line = w; } else line = t; }
      x.fillText(line, 30, y);
      x.fillStyle = '#21436a'; x.font = '400 28px "IBM Plex Mono", monospace'; x.fillText(String(r.company).slice(0, 34), 30, H - 120);
      x.fillStyle = '#0a6fb8'; x.font = '700 64px Archivo, Arial'; x.fillText(r.amount_usd ? money(r.amount_usd) : 'PRICELESS', 30, H - 44);
    }, 512, 680);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.26), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false, opacity: 0.94 }));
    const a = i * 0.62, y = 1.5 + i * 0.3, rad = 4.4 + (i % 3) * 0.5;
    m.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad); m.lookAt(0, y, 0); m.rotateY(Math.PI);
    m.userData = { receipt: r, a, y, rad, bob: Math.random() * 6 };
    archive.add(m); files.push(m);
  });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 22, 24), glow(C.cyan, 0.9)); core.position.y = 11; archive.add(core);
  archive.position.set(14, 0, -176); scene.add(archive);
  const al = new THREE.PointLight(C.cyan, 40, 30, 2); al.position.set(14, 10, -170); scene.add(al);
}
step(0.8);

/* ---------------- floor 5: congressional relations (hologram hemicycle) ---------------- */
const dome = new THREE.Group();
{
  const M = (window.CONGRESS && window.CONGRESS.members) || [], E = (window.CONGRESS_EMP && window.CONGRESS_EMP.members) || {};
  const tot = m => (m.total || 0) + ((E[m.bioguide] || {}).total || 0);
  const list = [...M].sort((a, b) => ({ D: 0, I: 1, R: 2 }[a.party] ?? 1) - ({ D: 0, I: 1, R: 2 }[b.party] ?? 1));
  const max = Math.max(1, ...list.map(tot));
  const n = list.length || 1, inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
  const m = new THREE.Matrix4(), col = new THREE.Color(), rows = 11;
  list.forEach((mem, i) => {
    const row = i % rows, k = Math.floor(i / rows), per = Math.ceil(n / rows);
    const r = 4 + row * 0.85, a = Math.PI * (k + 0.5) / per;
    const f = Math.pow(tot(mem) / max, 0.5), s = 0.6 + f * 2.4;
    m.makeScale(s, s, s); m.setPosition(Math.cos(a) * r, 0.4 + row * 0.18 + f * 1.2, -Math.sin(a) * r);
    inst.setMatrixAt(i, m);
    const base = mem.party === 'R' ? [1, .32, .4] : mem.party === 'D' ? [.35, .62, 1] : [.75, .5, 1];
    const b = 0.35 + f * 1.8; inst.setColorAt(i, col.setRGB(base[0] * b, base[1] * b, base[2] * b));
  });
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  dome.add(inst);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.3, 96, 1, 0, Math.PI), glow(0xd4a84b, 1.2)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; dome.add(ring);
  const t = label('CONGRESSIONAL RELATIONS', { size: 50, scale: 9, color: '#ffe7a3', glowCol: 'rgba(230,195,106,.6)' }); t.position.set(0, 7, -4); dome.add(t);
  dome.position.set(-16, 0, -214); dome.rotation.y = 0.5; scene.add(dome);
}
step(0.88);

/* ---------------- floor 6: the boardroom ---------------- */
const board = { group: new THREE.Group(), hp: null, name: null };
{
  const g = board.group;
  const mono = new THREE.Mesh(new THREE.BoxGeometry(5, 14, 1.4), new THREE.MeshStandardMaterial({ color: 0x08182c, metalness: 0.9, roughness: 0.15 })); mono.position.y = 7; g.add(mono);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5, 14, 1.4)), new THREE.LineBasicMaterial({ color: 0xffdf8f })); edge.position.y = 7; g.add(edge);
  const hpBack = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.08, 8, 160), glow(0x2a4466, 1)); hpBack.position.y = 7; g.add(hpBack);
  board.hpMat = glow(C.gold, 1.6);
  board.hp = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.16, 8, 160, Math.PI * 2), board.hpMat); board.hp.position.y = 7; g.add(board.hp);
  const bl = new THREE.PointLight(C.gold, 50, 30, 2); bl.position.set(0, 8, 6); g.add(bl);
  g.position.set(0, 0, -262); scene.add(g);
}

/* ---------------- ambient dust ---------------- */
const dust = (() => {
  const N = mobile ? 1200 : 3000, p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { p[i * 3] = (Math.random() - .5) * 60; p[i * 3 + 1] = Math.random() * 20; p[i * 3 + 2] = 20 - Math.random() * (LEN + 20); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }));
  scene.add(pts); return pts;
})();
step(0.95);

/* ---------------- camera path (one per floor) ---------------- */
const CAM = [[0, 5, 22], [2, 6, -36], [-2, 7, -80], [-12, 5, -127], [-2, 8, -158], [-2, 9, -199], [0, 7, -240]].map(a => new THREE.Vector3(...a));
const LOOK = [[mobile ? 0 : 3, 8, -14], [-16, 5.5, -54], [14, 10, -100], [-16, 3.6, -141], [14, 9, -176], [-16, 2.5, -214], [0, 8, -262]].map(a => new THREE.Vector3(...a));
const camCurve = new THREE.CatmullRomCurve3(CAM, false, 'centripetal'), lookCurve = new THREE.CatmullRomCurve3(LOOK, false, 'centripetal');
const sections = [...document.querySelectorAll('.st')];
let tTarget = 0, tNow = 0, mouseX = 0, mouseY = 0, mx = 0, my = 0;
function scrollToT() {
  const max = document.documentElement.scrollHeight - innerHeight;
  // map scroll so each section's center lands exactly on its floor
  const centers = sections.map(s => s.offsetTop + s.offsetHeight / 2 - innerHeight / 2);
  const y = Math.min(max, Math.max(0, scrollY));
  let i = 0; while (i < centers.length - 1 && y > centers[i + 1]) i++;
  const a = centers[i], b = centers[Math.min(i + 1, centers.length - 1)];
  const f = b > a ? Math.min(1, Math.max(0, (y - a) / (b - a))) : 0;
  const ease = f * f * (3 - 2 * f);
  tTarget = Math.min(1, (i + (y < centers[0] ? 0 : ease)) / (CAM.length - 1));
}
addEventListener('scroll', scrollToT, { passive: true });
addEventListener('pointermove', e => { mouseX = e.clientX / innerWidth - .5; mouseY = e.clientY / innerHeight - .5; }, { passive: true });

/* rail */
const NAMES = ['Lobby', 'The Press', 'Dispensary', 'Booths', 'Archive', 'Congress', 'Boardroom'];
$('#rail').innerHTML = NAMES.map((n, i) => `<button data-i="${i}" aria-label="${n}"><span>${n}</span></button>`).join('');
document.querySelectorAll('#rail button').forEach(b => b.onclick = () => { const s = sections[+b.dataset.i]; scrollTo({ top: s.offsetTop + s.offsetHeight / 2 - innerHeight / 2, behavior: reduced ? 'auto' : 'smooth' }); });
const io = new IntersectionObserver(es => es.forEach(e => {
  const c = e.target.querySelector('.card'); c && c.classList.toggle('show', e.isIntersecting);
  if (e.isIntersecting) document.querySelectorAll('#rail button').forEach((b, i) => b.classList.toggle('on', sections[i] === e.target));
}), { threshold: 0.42 });
sections.forEach(s => io.observe(s));

/* ---------------- post ---------------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), mobile ? 0.45 : 0.55, 0.45, 0.78);
composer.addPass(bloom);
composer.addPass(new OutputPass());
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); bloom.resolution.set(innerWidth / 2, innerHeight / 2); scrollToT(); });

/* ---------------- interaction: tap a file ---------------- */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
canvas.addEventListener('click', e => {
  ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(files, false)[0];
  if (hit) openFile(hit.object.userData.receipt);
});
// cards sit above the canvas; let clicks on empty track area fall through to the canvas
document.getElementById('track').addEventListener('click', e => { if (e.target.closest('.card')) return; canvas.dispatchEvent(new MouseEvent('click', { clientX: e.clientX, clientY: e.clientY })); });
function openFile(r) {
  $('#fileBody').innerHTML = `<div class="fcard"><button class="x" aria-label="Close">×</button><div class="fk">RECEIPTS DEPARTMENT · SUBLEVEL B4 · ${esc(r.year)}</div><span class="stamp">VERIFIED</span>
    <h3>${esc(r.title)}</h3><p>${esc(r.fact)}</p><div class="amt">${r.amount_usd ? money(r.amount_usd) : 'Priceless'}</div>
    <p style="font-style:italic">“${esc(r.quip || '')}”</p><a href="${esc(r.source_url)}" target="_blank" rel="noopener">SOURCE: ${esc(r.source_name)} ↗</a></div>`;
  const d = $('#fileDlg'); d.showModal(); d.querySelector('.x').onclick = () => d.close();
  d.onclick = ev => { if (ev.target === d) d.close(); };
}

/* ---------------- live data ---------------- */
const seen = new Set(); let firstPoll = true, tape = [];
function paintTape(tex, list) {
  const c = tex.image, x = c.getContext('2d'), W = c.width, H = c.height;
  x.clearRect(0, 0, W, H);
  x.fillStyle = 'rgba(8,40,80,.55)'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(111,230,255,.6)'; x.lineWidth = 4; x.strokeRect(6, 6, W - 12, H - 12);
  x.fillStyle = '#6fe6ff'; x.font = '600 34px "IBM Plex Mono", monospace'; x.fillText('LIVE TAPE · REAL TRADES ONLY', 40, 70);
  list.slice(0, 8).forEach((t, i) => {
    const y = 140 + i * 60;
    x.globalAlpha = t.bot ? 0.35 : 1;
    x.fillStyle = t.kind === 'buy' ? '#6fe6ff' : '#ff5468'; x.font = '600 32px "IBM Plex Mono", monospace'; x.fillText(t.kind.toUpperCase(), 40, y);
    x.fillStyle = '#eef6ff'; x.fillText(t.bot ? 'automated' : money(t.usd), 200, y);
    x.fillStyle = '#9db7d6'; x.fillText(ago(t.ts), W - 260, y);
  });
  x.globalAlpha = 1; tex.needsUpdate = true;
}
async function pollTrades() {
  if (document.hidden) return;
  try {
    const j = await (await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${POOL}/trades`)).json();
    const list = (j.data || []).map(d => { const a = d.attributes; const v = parseFloat(a.volume_in_usd); return { id: a.tx_hash, kind: a.kind === 'buy' ? 'buy' : 'sell', usd: isFinite(v) ? v : 0, ts: Date.parse(a.block_timestamp), wallet: a.tx_from_address, bot: !(v >= 1) }; }).filter(t => t.id).sort((a, b) => b.ts - a.ts);
    const fresh = list.filter(t => !seen.has(t.id)); list.forEach(t => seen.add(t.id));
    tape = list.slice(0, 40);
    if (!firstPoll) fresh.reverse().forEach((t, i) => setTimeout(() => onTrade(t), i * 1200));
    firstPoll = false;
    const last = tape[0], quiet = !last || Date.now() - last.ts > 15 * 60e3;
    $('#liveDot').classList.toggle('on', !quiet); $('#liveState').textContent = quiet ? 'quiet' : 'live';
    $('#tapeLast').textContent = last ? `last ${ago(last.ts)}` : '—';
    $('#tapeRows').innerHTML = tape.slice(0, 6).map(t => `<a class="trow ${t.bot ? 'bot' : ''}" href="https://solscan.io/tx/${t.id}" target="_blank" rel="noopener"><b class="${t.kind === 'buy' ? 'kb' : 'ks'}">${t.kind.toUpperCase()}</b><span>${t.wallet ? t.wallet.slice(0, 4) + '…' + t.wallet.slice(-4) : ''} · ${t.bot ? 'auto' : money(t.usd)}</span><em>${ago(t.ts)}</em></a>`).join('');
    const day = tape.filter(t => Date.now() - t.ts < 864e5);
    $('#tapeCount').textContent = `${day.filter(t => !t.bot).length} real · ${day.filter(t => t.bot).length} automated (recent) · links to Solscan`;
    paintTape(press.tapeTex, tape);
  } catch { $('#liveState').textContent = 'feed offline'; }
}
function onTrade(t) {
  if (t.bot) return;
  if (t.kind === 'buy') {
    press.stamp = 1;
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 14), glow(C.cyan, 1.6)); cap.rotation.z = Math.PI / 2;
    cap.position.set(0, 2.4, 0); press.group.add(cap); press.capsules.push({ m: cap, x: 0 });
  } else {
    // a sell: one vial flashes red and dims
    const i = 10 + Math.floor(Math.random() * Math.max(1, vials.count - 10));
    vials.flash.push({ i, t: 1 });
  }
}
async function pollMeta() {
  try {
    const j = await (await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${POOL}`)).json();
    const p = (j.pairs || [j.pair])[0]; const mc = p && (p.marketCap || p.fdv);
    if (mc) { document.querySelectorAll('[data-mcap]').forEach(e => e.textContent = money(mc)); setBoss(mc); }
  } catch {}
  try {
    const j = await (await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${CA}/info`)).json();
    const h = j.data.attributes.holders; if (h && h.count) {
      $('#holderCount').textContent = h.count.toLocaleString();
      if (Math.abs(h.count - vials.count) > 4) buildVials(h.count);
      const d = h.distribution_percentage || {};
      $('#dist').innerHTML = [['Top 10', d.top_10], ['11–20', d['11_20']], ['21–40', d['21_40']], ['Everyone else', d.rest]].map(([k, v]) => `<div><span>${k}</span><i style="width:${Math.min(100, +v || 0)}%"></i><b>${(+v || 0).toFixed(1)}%</b></div>`).join('') + '<div style="grid-template-columns:1fr;color:#6d88aa">Top 10 includes the liquidity pool (≈half of supply).</div>';
    }
  } catch {}
}
function setBoss(mc) {
  const T = (window.TARGETS && window.TARGETS.targets) || []; if (!T.length) return;
  const i = T.findIndex(b => b.market_cap > mc), b = T[i < 0 ? T.length - 1 : i];
  const left = Math.max(0, (b.market_cap - mc) / b.market_cap);
  $('#bossName').textContent = `${b.short} (${b.ticker})`;
  $('#bossLine').textContent = `Market cap ${money(b.market_cap)} as of ${b.price_date}. $PHARMA needs to grow ${Math.max(1, b.market_cap / mc).toFixed(b.market_cap / mc > 10 ? 0 : 1)}× to flip it.`;
  $('#hpFill').style.width = (left * 100) + '%';
  board.hp.geometry.dispose(); board.hp.geometry = new THREE.TorusGeometry(6.5, 0.16, 8, 160, Math.PI * 2 * Math.max(0.002, left));
  board.hp.rotation.z = Math.PI / 2;
  if (board.name) board.group.remove(board.name);
  board.name = label(b.short.toUpperCase(), { size: 72, scale: 9, color: '#ffe7a3', glowCol: 'rgba(230,195,106,.7)' }); board.name.position.set(0, 13.2, 1); board.group.add(board.name);
}

/* ---------------- fill static UI ---------------- */
$('#ca').textContent = CA;
$('#copyCa').onclick = async () => { try { await navigator.clipboard.writeText(CA); $('#copyCa').textContent = 'Copied'; } catch {} };
$('#buyBtn').href = BUY;
{
  const R = window.RECEIPTS || []; $('#recCount').textContent = R.length;
  $('#recSum').textContent = money(R.reduce((s, r) => s + (r.amount_usd || 0), 0));
  const P = (window.PRESCRIBERS && window.PRESCRIBERS.board) || [];
  buildBooths(P);
  $('#boothList').innerHTML = P.slice(0, 5).map((r, i) => `<a class="bth" href="https://x.com/${encodeURIComponent(r.handle)}" target="_blank" rel="noopener">${r.avatar ? `<img src="${esc(r.avatar)}" alt="" referrerpolicy="no-referrer">` : ''}<b>@${esc(r.handle)}</b><span>#${i + 1} · ${r.score}</span></a>`).join('') || '<p>Booths open after the first X sweep.</p>';
}

/* ---------------- loop ---------------- */
const clock = new THREE.Clock(); const _v = new THREE.Vector3(), _l = new THREE.Vector3(), mtx = new THREE.Matrix4(), tmpC = new THREE.Color();
function frame() {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  tNow += (tTarget - tNow) * (reduced ? 1 : 1 - Math.pow(0.0015, dt));
  mx += (mouseX - mx) * 0.04; my += (mouseY - my) * 0.04;
  camCurve.getPointAt(Math.min(1, Math.max(0, tNow)), _v); lookCurve.getPointAt(Math.min(1, Math.max(0, tNow)), _l);
  camera.position.set(_v.x + mx * 2.2, _v.y - my * 1.2 + Math.sin(t * 0.4) * 0.12, _v.z);
  camera.lookAt(_l);
  // ambient life
  caduceus.rotation.y = t * 0.25;
  if (press.cap) { press.cap.rotation.y = t * 0.5; press.cap.position.y = 13.5 + Math.sin(t * 0.9) * 0.5; }
  dust.rotation.y = Math.sin(t * 0.03) * 0.02; dust.position.y = Math.sin(t * 0.2) * 0.3;
  // the press: real buys stamp it
  if (press.stamp > 0) { press.stamp = Math.max(0, press.stamp - dt * 1.6); }
  const s = press.stamp > 0.6 ? (1 - press.stamp) / 0.4 : press.stamp / 0.6; // down then up
  press.die.position.y = press.dieY - (press.stamp > 0 ? Math.sin(Math.min(1, s) * Math.PI / 2) * 3.4 : Math.sin(t * 0.8) * 0.06);
  press.piston.position.y = press.die.position.y + 2;
  press.belt.forEach((r, i) => { r.position.x = 2.5 + ((i + t * 0.6) % 14); });
  for (let i = press.capsules.length - 1; i >= 0; i--) {
    const c = press.capsules[i]; c.x += dt * 2.2; c.m.position.x = c.x; c.m.position.y = 2.4 + (c.x > 16 ? -(c.x - 16) * 0.9 : 0);
    if (c.x > 18.5) { press.group.remove(c.m); press.capsules.splice(i, 1); }
  }
  // sells: red flash on a vial
  if (vials.flash.length && vials.liquid) {
    for (let k = vials.flash.length - 1; k >= 0; k--) {
      const f = vials.flash[k]; f.t -= dt * 0.35;
      const v = Math.max(0, f.t); vials.liquid.setColorAt(f.i, tmpC.setRGB(0.25 + v * 1.8, 0.35 * (1 - v) + 0.05, 0.5 * (1 - v) + 0.1));
      if (f.t <= 0) vials.flash.splice(k, 1);
    }
    vials.liquid.instanceColor.needsUpdate = true;
  }
  // archive drift
  archive.rotation.y = t * 0.06;
  for (const f of files) { f.position.y = f.userData.y + Math.sin(t * 0.7 + f.userData.bob) * 0.12; }
  dome.rotation.y = 0.5 + Math.sin(t * 0.15) * 0.05;
  booths.children.forEach(b => { if (b.userData.disc) b.userData.disc.rotation.y = Math.sin(t * 0.8) * 0.4; });
  board.group.rotation.y = Math.sin(t * 0.2) * 0.12;
  composer.render();
}

/* ---------------- go ---------------- */
step(1);
scrollToT(); tNow = tTarget;
frame();
pollTrades(); pollMeta();
setInterval(pollTrades, 30000); setInterval(pollMeta, 120000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) pollTrades(); });
const go = $('#bootGo'); go.disabled = false;
go.onclick = () => { $('#boot').classList.add('gone'); document.querySelector('[data-st="0"] .card').classList.add('show'); };
if (sessionStorage.getItem('hq_entered')) go.click();
go.addEventListener('click', () => sessionStorage.setItem('hq_entered', '1'));

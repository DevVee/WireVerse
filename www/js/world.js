import * as THREE from 'three';
import { makeFloorTex, makeWallTex, makeCeilTex, makeMetalTex, makeConcrTex, makeFloorNorm, makeWallNorm, makeMetalNorm } from './textures.js';

// ── RENDERER ──────────────────────────────────────────────────────────────────
export const isMobile = navigator.maxTouchPoints > 0;
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: !isMobile,          // MSAA is expensive on mobile — skip it
  powerPreference: 'high-performance',
  precision: isMobile ? 'mediump' : 'highp',
});
renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2.0));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = isMobile ? THREE.LinearToneMapping : THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = !isMobile;   // shadows OFF on mobile — saves a full render pass
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ecff5);
// Fog: mobile uses linear (cheaper) with short range; desktop uses exp2
if (isMobile) {
  scene.fog = new THREE.Fog(0xc5e4f7, 28, 45);
} else {
  scene.fog = new THREE.FogExp2(0xc5e4f7, 0.004);
}

// PMREM env map: desktop only — costs shader samples every fragment on mobile
if (!isMobile) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  const envSky = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 120), new THREE.MeshBasicMaterial({ color: 0x87ceeb }));
  envSky.position.set(0, 20, 0); envScene.add(envSky);
  const envSun = new THREE.Mesh(new THREE.BoxGeometry(2, 60, 2), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }));
  envSun.position.set(18, 0, -10); envScene.add(envSun);
  const envGround = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 120), new THREE.MeshBasicMaterial({ color: 0xc8b87a }));
  envGround.position.set(0, -20, 0); envScene.add(envGround);
  scene.environment = pmremGenerator.fromScene(envScene).texture;
  scene.environmentIntensity = 0.9;
  pmremGenerator.dispose();
}

// ── PLAYER SPAWN ──────────────────────────────────────────────────────────────
export const SPAWN     = new THREE.Vector3(0, 1.72, 5);
export const SPAWN_YAW = Math.PI;

export const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, isMobile ? 40 : 120);
camera.position.copy(SPAWN);

function _handleResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  if (window._composer) window._composer.setSize(w, h);
}
window.addEventListener('resize', _handleResize);
window.addEventListener('orientationchange', () => { setTimeout(_handleResize, 120); });

// ── BLOOM (desktop only) ──────────────────────────────────────────────────────
if (!isMobile) {
  Promise.all([
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
    import('three/examples/jsm/postprocessing/OutputPass.js'),
  ]).then(([{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }]) => {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.22, 0.40, 0.88));
    composer.addPass(new OutputPass());
    window._composer = composer;
  }).catch(() => {});
}

// ── TEXTURES ──────────────────────────────────────────────────────────────────
const fT = makeFloorTex(); fT.repeat.set(8, 8);
const wT = makeWallTex();  wT.repeat.set(4, 2);
const cT = makeCeilTex();  cT.repeat.set(8, 8);
const mT = makeMetalTex(); mT.repeat.set(2, 2);
const kT = makeConcrTex(); kT.repeat.set(4, 2);
const fN = makeFloorNorm(); fN.repeat.set(8, 8);
const wN = makeWallNorm();  wN.repeat.set(4, 2);
const mN = makeMetalNorm(); mN.repeat.set(2, 2);

// ── HEIGHT CONSTANTS ──────────────────────────────────────────────────────────
export const FLOOR1_Y = 0;
const H  = 4.2;
const WT = 0.22;

// ── MATERIALS ─────────────────────────────────────────────────────────────────
const _nv2 = (x, y) => new THREE.Vector2(x, y);

export const M = {
  floor:      new THREE.MeshStandardMaterial({ map: fT, roughness: 0.62, metalness: 0.06, envMapIntensity: 0.4 }),
  wall:       new THREE.MeshStandardMaterial({ map: wT, roughness: 0.85, metalness: 0.0,  envMapIntensity: 0.2 }),
  ceil:       new THREE.MeshStandardMaterial({ map: cT, roughness: 0.90, metalness: 0.0,  envMapIntensity: 0.15 }),
  concrete:   new THREE.MeshStandardMaterial({ map: kT, color: 0xaab2ba, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.15 }),
  door:       new THREE.MeshStandardMaterial({ color: 0xb08050, roughness: 0.68, metalness: 0.10, envMapIntensity: 0.3 }),
  doorFrame:  new THREE.MeshStandardMaterial({ map: mT, color: 0x99aabb, roughness: 0.18, metalness: 0.92, envMapIntensity: 0.8 }),
  panel:      new THREE.MeshStandardMaterial({ color: 0x2a4a62, roughness: 0.52, metalness: 0.38, envMapIntensity: 0.5 }),
  panelGrey:  new THREE.MeshStandardMaterial({ map: mT, color: 0x6a7a88, roughness: 0.44, metalness: 0.48, envMapIntensity: 0.6 }),
  yellow:     new THREE.MeshStandardMaterial({ color: 0xf0c060, emissive: new THREE.Color(0xf0c060), emissiveIntensity: 1.2, roughness: 0.45 }),
  red:        new THREE.MeshStandardMaterial({ color: 0xdd4433, emissive: new THREE.Color(0xdd4433), emissiveIntensity: 1.4, roughness: 0.40 }),
  green:      new THREE.MeshStandardMaterial({ color: 0x33dd66, emissive: new THREE.Color(0x33dd66), emissiveIntensity: 1.6, roughness: 0.40 }),
  orange:     new THREE.MeshStandardMaterial({ color: 0xff8833, emissive: new THREE.Color(0xff8833), emissiveIntensity: 1.2, roughness: 0.45 }),
  bench:      new THREE.MeshStandardMaterial({ color: 0x9a8065, roughness: 0.80, metalness: 0.0,  envMapIntensity: 0.2 }),
  black:      new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.75, metalness: 0.15, envMapIntensity: 0.3 }),
  chrome:     new THREE.MeshStandardMaterial({ map: mT, color: 0xccddef, roughness: 0.04, metalness: 1.0, envMapIntensity: 1.4 }),
  pipe:       new THREE.MeshStandardMaterial({ map: mT, color: 0x7a8fa0, roughness: 0.12, metalness: 0.96, envMapIntensity: 1.2 }),
  copper:     new THREE.MeshStandardMaterial({ color: 0xd97845, roughness: 0.18, metalness: 0.96, envMapIntensity: 1.2 }),
  eWhite:     new THREE.MeshBasicMaterial({ color: 0xfff8e0 }),
  eBlue:      new THREE.MeshBasicMaterial({ color: 0x3388ff }),
  eGreen:     new THREE.MeshBasicMaterial({ color: 0x22ff88 }),
  eRed:       new THREE.MeshBasicMaterial({ color: 0xff3322 }),
  eYellow:    new THREE.MeshBasicMaterial({ color: 0xffee00 }),
  window:     new THREE.MeshStandardMaterial({ color: 0xb8e0f8, transparent: true, opacity: 0.34, roughness: 0.02, metalness: 0.06, envMapIntensity: 0.5, side: THREE.DoubleSide }),
  winFrame:   new THREE.MeshStandardMaterial({ color: 0xeeeeec, roughness: 0.45, metalness: 0.25, envMapIntensity: 0.5 }),
};

M.floor.normalMap     = fN; M.floor.normalScale     = _nv2(1.6, 1.6);
M.wall.normalMap      = wN; M.wall.normalScale      = _nv2(2.2, 2.2);
M.concrete.normalMap  = wN; M.concrete.normalScale  = _nv2(1.4, 1.4);
M.doorFrame.normalMap = mN; M.doorFrame.normalScale = _nv2(0.8, 0.8);
M.panelGrey.normalMap = mN; M.panelGrey.normalScale = _nv2(0.6, 0.6);
M.chrome.normalMap    = mN; M.chrome.normalScale    = _nv2(0.5, 0.5);
M.pipe.normalMap      = mN; M.pipe.normalScale      = _nv2(0.7, 0.7);
M.panel.normalMap     = mN; M.panel.normalScale     = _nv2(0.4, 0.4);

if (isMobile) {
  // Strip all expensive per-fragment features — huge shader simplification
  Object.values(M).forEach(mat => {
    if (mat.isMeshStandardMaterial) {
      mat.normalMap      = null;
      mat.envMapIntensity = 0;
      mat.metalness      = 0;
      mat.roughness      = Math.max(mat.roughness, 0.7);
    }
  });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
export function mkBox(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}
export function place(m, x, y, z) {
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}
export function mkCyl(r, h, mat, segs = 16) {
  return new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs), mat);
}

// ── COLLISION ─────────────────────────────────────────────────────────────────
export const colBoxes = [];
export function addCol(x, y, z, w, h, d) {
  colBoxes.push(new THREE.Box3(
    new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2),
    new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2)
  ));
}
const _pb = new THREE.Box3(), _pbMin = new THREE.Vector3(), _pbMax = new THREE.Vector3();
export function checkCol(pos) {
  _pbMin.set(pos.x - .32, pos.y - 1.65, pos.z - .32);
  _pbMax.set(pos.x + .32, pos.y + .12,  pos.z + .32);
  _pb.set(_pbMin, _pbMax);
  return colBoxes.some(b => b.intersectsBox(_pb));
}

// ── LIGHTING ──────────────────────────────────────────────────────────────────
export const roomLightSets = {};

// Mobile: bright ambient + one directional — zero SpotLights, zero shadows
// Desktop: full setup with SpotLights and shadow map
export const ambLight = new THREE.AmbientLight(0xfff5e8, isMobile ? 2.2 : 0.72);
scene.add(ambLight);

if (!isMobile) {
  scene.add(new THREE.HemisphereLight(0x9ecff5, 0xd4c4a0, 0.50));
}

const sunLight = new THREE.DirectionalLight(0xfff8e0, isMobile ? 1.8 : 3.2);
sunLight.position.set(12, 18, 8);
sunLight.target.position.set(0, 0, -12);
scene.add(sunLight); scene.add(sunLight.target);
if (!isMobile) {
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width  = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 1; sunLight.shadow.camera.far  = 60;
  sunLight.shadow.camera.left = -18; sunLight.shadow.camera.right  =  18;
  sunLight.shadow.camera.top  =  18; sunLight.shadow.camera.bottom = -18;
  sunLight.shadow.bias = -0.002; sunLight.shadow.normalBias = 0.04; sunLight.shadow.radius = 2.5;
  const skyFill = new THREE.DirectionalLight(0xc8e8ff, 0.55);
  skyFill.position.set(-8, 10, 2); scene.add(skyFill);
}

export const warnLight = new THREE.PointLight(0xff2200, 0, 20);
warnLight.position.set(0, 3.5, -10); scene.add(warnLight);

export function mkLight(x, y, z, color, intensity, key) {
  // Mobile: fixture mesh only — no SpotLight, no shadow, uses bright ambient instead
  if (!isMobile) {
    const spot = new THREE.SpotLight(color || 0x88ccff, intensity * 1.1, 18, Math.PI / 4.2, 0.32, 2.0);
    spot.position.set(x, y, z);
    spot.target.position.set(x, 0, z);
    scene.add(spot); scene.add(spot.target);
    if (key) { if (!roomLightSets[key]) roomLightSets[key] = []; roomLightSets[key].push(spot); }
  }

  // Fixture visuals (both platforms, but simplified on mobile)
  const fixtureBase = mkBox(0.18, 0.06, 1.6, M.panelGrey);
  fixtureBase.position.set(x, y + 0.06, z); scene.add(fixtureBase);
  if (!isMobile) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), M.eWhite);
    tube.rotation.z = Math.PI / 2; tube.position.set(x, y, z); scene.add(tube);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), M.eWhite);
    disc.rotation.x = Math.PI / 2; disc.position.set(x, y - 0.04, z); scene.add(disc);
  }
}

// ── FLOOR & CEILING ───────────────────────────────────────────────────────────
function mkRoom(cx, cz, w, d, floorY = 0, ceilY = H, noCeil = false) {
  const SLAB = 0.16;
  const fl = mkBox(w, SLAB, d, M.floor);
  fl.position.set(cx, floorY - SLAB / 2, cz);
  fl.castShadow = false; fl.receiveShadow = !isMobile; fl.userData.walkable = true;
  scene.add(fl);
  addCol(cx, floorY - SLAB / 2, cz, w, SLAB, d);
  if (!noCeil) {
    const cl = mkBox(w, SLAB, d, M.ceil);
    cl.position.set(cx, ceilY + SLAB / 2, cz); cl.receiveShadow = false; scene.add(cl);
  }
}

function mkWall(x, y, z, w, h, d, mat, noCol = false) {
  const m = mkBox(w, h, d, mat || M.wall);
  m.position.set(x, y, z);
  m.castShadow = !isMobile; m.receiveShadow = !isMobile;
  scene.add(m);
  if (!noCol) addCol(x, y, z, w, h, d);
  return m;
}

function seg(mn, mx, mid, dw) {
  const d0 = mid - dw / 2, d1 = mid + dw / 2, s = [];
  if (d0 > mn) s.push([mn, d0, false]);
  s.push([d0, d1, true]);
  if (d1 < mx) s.push([d1, mx, false]);
  return s;
}

function wallDoor(coord, a, b, doorMid, doorW, isX, mat, floorY = 0) {
  const _ws = (m) => { m.castShadow = !isMobile; m.receiveShadow = !isMobile; return m; };
  seg(a, b, doorMid, doorW).forEach(([sa, sb, isDoor]) => {
    const len = sb - sa, mid = (sa + sb) / 2;
    const fy = floorY + H / 2, topH = H - 2.6, topY = floorY + 2.6 + topH / 2;
    if (isX) {
      if (isDoor) { const lt = _ws(mkBox(WT, topH, len, mat || M.wall)); lt.position.set(coord, topY, mid); scene.add(lt); addCol(coord, topY, mid, WT, topH, len); }
      else        { const wl = _ws(mkBox(WT, H,    len, mat || M.wall)); wl.position.set(coord, fy,   mid); scene.add(wl); addCol(coord, fy,   mid, WT, H,    len); }
    } else {
      if (isDoor) { const lt = _ws(mkBox(len, topH, WT, mat || M.wall)); lt.position.set(mid, topY, coord); scene.add(lt); addCol(mid, topY, coord, len, topH, WT); }
      else        { const wl = _ws(mkBox(len, H,    WT, mat || M.wall)); wl.position.set(mid, fy,   coord); scene.add(wl); addCol(mid, fy,   coord, len, H,    WT); }
    }
  });
}

function addWindow(x, y, z, w, h, isVertical) {
  // Glass box fills full wall thickness — no z-fighting with wall planes
  const GL = WT + 0.04;
  const t = 0.09;
  if (isVertical) {
    place(mkBox(GL, h, w, M.window), x, y, z);
    place(mkBox(GL + 0.02, t, w + 0.12, M.winFrame), x, y + h / 2 + t / 2, z);
    place(mkBox(GL + 0.02, t, w + 0.12, M.winFrame), x, y - h / 2 - t / 2, z);
    place(mkBox(GL + 0.02, h + 0.12, t, M.winFrame), x, y, z - w / 2 - t / 2);
    place(mkBox(GL + 0.02, h + 0.12, t, M.winFrame), x, y, z + w / 2 + t / 2);
  } else {
    place(mkBox(w, h, GL, M.window), x, y, z);
    place(mkBox(w + 0.12, t, GL + 0.02, M.winFrame), x, y + h / 2 + t / 2, z);
    place(mkBox(w + 0.12, t, GL + 0.02, M.winFrame), x, y - h / 2 - t / 2, z);
    place(mkBox(t, h + 0.12, GL + 0.02, M.winFrame), x - w / 2 - t / 2, y, z);
    place(mkBox(t, h + 0.12, GL + 0.02, M.winFrame), x + w / 2 + t / 2, y, z);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAP — 3-room training facility
// ENTRANCE:   x=-8 to 8, z=-2 to 8   (16w × 10d)
// WORKSHOP 1: x=-8 to 8, z=-18 to -2 (16w × 16d)
// WORKSHOP 2: x=-8 to 8, z=-32 to -18(16w × 14d)
// ══════════════════════════════════════════════════════════════════════════════
mkRoom(0,  3,  16, 10);
mkRoom(0, -10, 16, 16);
mkRoom(0, -25, 16, 14);

const OW = H, OMY = H / 2;

// Blue workshop wall materials
const wsWallMat = new THREE.MeshStandardMaterial({
  map: wT, color: 0x2a6fa8, roughness: 0.80, metalness: 0.0, envMapIntensity: 0.35,
  normalMap: wN, normalScale: new THREE.Vector2(1.4, 1.4),
});
const ws2WallMat = new THREE.MeshStandardMaterial({
  map: wT, color: 0x1f5a8c, roughness: 0.84, metalness: 0.0, envMapIntensity: 0.28,
  normalMap: wN, normalScale: new THREE.Vector2(1.2, 1.2),
});
if (isMobile) {
  wsWallMat.normalMap = null; ws2WallMat.normalMap = null;
  wsWallMat.envMapIntensity = 0; ws2WallMat.envMapIntensity = 0;
}

// East walls
mkWall( 8.11, OMY,   3, WT, OW, 10.22, M.concrete);
mkWall( 8.11, OMY, -10, WT, OW, 16.22, wsWallMat);
mkWall( 8.11, OMY, -25, WT, OW, 14.22, ws2WallMat);
// West walls
mkWall(-8.11, OMY,   3, WT, OW, 10.22, M.concrete);
mkWall(-8.11, OMY, -10, WT, OW, 16.22, wsWallMat);
mkWall(-8.11, OMY, -25, WT, OW, 14.22, ws2WallMat);
// North wall — sealed (no exterior door)
mkWall(0, OMY, 8.11, 16.22, OW, WT, M.concrete);
// WS2 north (south) wall
mkWall(0, OMY, -32.11, 16.22, OW, WT, ws2WallMat);
// Inner shared walls — 1.8m wide openings centred at x=0
wallDoor(-2,  -8, 8, 0, 1.8, false, M.concrete);
wallDoor(-18, -8, 8, 0, 1.8, false, wsWallMat);

// Windows (no exterior-facing windows — north wall is sealed)
addWindow( 8.06, 2.4,   4, 3.2, 1.8, true);
addWindow( 8.06, 2.2,  -6, 3.4, 2.0, true);
addWindow( 8.06, 2.2, -14, 3.4, 2.0, true);
addWindow(-8.06, 2.2,  -6, 3.4, 2.0, true);
addWindow(-8.06, 2.2, -14, 3.4, 2.0, true);
addWindow(-4,    2.2, -32.06, 3.2, 1.8, false);
addWindow( 4,    2.2, -32.06, 3.2, 1.8, false);
addWindow( 8.06, 2.2,  -25, 3.4, 2.0, true);
addWindow(-8.06, 2.2,  -25, 3.4, 2.0, true);

// Light shafts + window point lights — desktop only
if (!isMobile) {
  const shaftMat = new THREE.MeshBasicMaterial({ color: 0xfff8e8, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
  [[-6, -14]].forEach(([z1, z2]) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), shaftMat);
    s.position.set(7.4, 2.2, (z1 + z2) / 2); s.rotation.y = Math.PI / 2; scene.add(s);
    const wPt = new THREE.PointLight(0xfff0cc, 1.2, 5, 1.8);
    wPt.position.set(6.5, 2.2, (z1 + z2) / 2); scene.add(wPt);
    if (!roomLightSets['workshop']) roomLightSets['workshop'] = [];
    roomLightSets['workshop'].push(wPt);
  });
}

// Ceiling lights
mkLight(0,  H - .2,  3, 0xfff4e0, 1.4, 'entrance');
mkLight(-3, H - .2, -6,  0xfff8f0, 2.2, 'workshop');
mkLight( 3, H - .2, -6,  0xfff8f0, 2.2, 'workshop');
mkLight(-3, H - .2, -14, 0xfff8f0, 2.0, 'workshop');
mkLight( 3, H - .2, -14, 0xfff8f0, 2.0, 'workshop');
mkLight(-3, H - .2, -22, 0xfff4e0, 1.8, 'workshop');
mkLight( 3, H - .2, -22, 0xfff4e0, 1.8, 'workshop');
mkLight(-3, H - .2, -29, 0xfff4e0, 1.6, 'workshop');
mkLight( 3, H - .2, -29, 0xfff4e0, 1.6, 'workshop');

// Ceiling cable tray (WS1)
{
  const t = mkBox(16, .08, .38, M.panelGrey);
  t.position.set(0, H - .45, -10); scene.add(t);
  [-1, 1].forEach(s => { const r = mkBox(16, .1, .04, M.panelGrey); r.position.set(0, H - .39, -10 + s * .16); scene.add(r); });
}

// Orange PVC conduit along WS1 north wall
const wsConduitMat = new THREE.MeshStandardMaterial({ color: 0xC84010, roughness: 0.55, metalness: 0.08 });
{
  const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 14, 10), wsConduitMat);
  hc.rotation.z = Math.PI / 2; hc.position.set(0, 2.2, -17.88); scene.add(hc);
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERACTABLES
// ══════════════════════════════════════════════════════════════════════════════
export const allInteractables = [];

// ── STUBS — main.js compat ────────────────────────────────────────────────────
export const generator = { running: false, rpm: 0, targetRpm: 0, load: 0, temp: 22, fuel: 100, group: new THREE.Group(), parts: {} };
export function updateGenerator(dt) {
  const g = generator;
  g.rpm += (g.targetRpm - g.rpm) * Math.min(1, dt * 0.6);
  g.temp = g.running ? Math.min(90, g.temp + dt * 1.5) : Math.max(22, g.temp - dt * 1.2);
}
export const scadaTerminals = [];
export function updateSCADA(_dt, _animT) {}
export const wireObjects = [];
export const scenarioTerminals = [];
export const validationBoard = { leds: [], allGreen: false };
export let oscWave1 = null, oscWave2 = null;
export function updateOscilloscopes(_animT) {}
export const cableStations = [];

// ── FURNITURE HELPERS ─────────────────────────────────────────────────────────
const _pegM    = new THREE.MeshStandardMaterial({ color: 0x6b4c1e, roughness: 0.92 });
const _mmBodyM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.25 });
const _mmScrM  = new THREE.MeshStandardMaterial({ color: 0x00dd55, emissive: new THREE.Color(0x009933), emissiveIntensity: 0.9, roughness: 0.1 });
const _lampM   = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: new THREE.Color(0xffee88), emissiveIntensity: 1.4, roughness: 0.1 });
const _rubberM = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.95 });

function workbench(cx, cz) {
  // Core structure — shared by mobile & desktop (6 draw calls)
  place(mkBox(2.2, .07, .9, M.bench),     cx, 0.965, cz);
  place(mkBox(2.2, 1.0, .05, M.panelGrey), cx, .50,  cz + .44); // back panel (replaces shelf+pegboard on mobile)
  [[-1.05, -.38], [-1.05, .38], [1.05, -.38], [1.05, .38]].forEach(([dx, dz]) =>
    place(mkBox(.06, 1.0, .06, M.chrome), cx + dx, .5, cz + dz));
  addCol(cx, .5, cz, 2.2, 1.0, .9);

  if (isMobile) return; // mobile: just the silhouette — no detail props

  // ── Desktop-only detail ───────────────────────────────────────────────────
  place(mkBox(2.0, .04, .70, M.bench), cx, .34, cz); // lower shelf
  // Pegboard colour tint over back panel
  place(mkBox(2.2, .55, .03, _pegM), cx, 1.27, cz + .44);

  // Hanging screwdrivers (4 × 2 meshes = 8)
  const _sdHandles = [0xdd2211, 0xee8800, 0x2244cc, 0x22aa44];
  _sdHandles.forEach((clr, i) => {
    const hMat = new THREE.MeshStandardMaterial({ color: clr, roughness: 0.75 });
    const sdGrip = mkCyl(.018, .10, hMat, 8);
    sdGrip.rotation.x = Math.PI / 2;
    sdGrip.position.set(cx - 0.78 + i * 0.38, 1.42, cz + 0.47); scene.add(sdGrip);
    const sdShaft = mkCyl(.006, .13, M.chrome, 6);
    sdShaft.rotation.x = Math.PI / 2;
    sdShaft.position.set(cx - 0.78 + i * 0.38, 1.42, cz + 0.52); scene.add(sdShaft);
  });

  // Multimeter (3 meshes)
  const mmX = cx - 0.65, mmZ = cz - 0.08;
  place(mkBox(.15, .04, .22, _mmBodyM), mmX, 1.0, mmZ);
  place(mkBox(.09, .041, .09, _mmScrM), mmX, 1.0, mmZ - 0.04);
  place(mkCyl(.025, .018, M.chrome, 10), mmX + 0.02, 1.025, mmZ + 0.06);

  // Wire spool (2 meshes)
  const spW = new THREE.Mesh(new THREE.TorusGeometry(.062, .022, 6, 14), M.copper);
  spW.rotation.x = Math.PI / 2; spW.position.set(cx + 0.65, 1.0, cz - 0.05); scene.add(spW);

  // Work lamp (3 meshes + 1 light)
  const lx = cx + 0.92, lBaseZ = cz + 0.38;
  place(mkCyl(.04, .03, M.panelGrey, 8), lx, 0.988, lBaseZ);
  place(mkCyl(.012, .30, M.chrome, 6),   lx, 1.14,  lBaseZ);
  place(mkBox(.10, .03, .08, _lampM),    lx, 1.30,  lBaseZ - 0.06);
  const lampPt = new THREE.PointLight(0xffe8b0, 1.2, 1.8, 2.2);
  lampPt.position.set(lx, 1.26, lBaseZ - 0.08);
  lampPt.castShadow = false;
  scene.add(lampPt);
}

// faceNorth=true  → person faces +Z (toward entrance), backrest on south side (z-0.27)
// faceNorth=false → person faces -Z (toward WS2),    backrest on north side (z+0.27)
const _cushM = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.88 });
function chair(x, z, faceNorth = false) {
  const bz = faceNorth ? -0.27 : 0.27;
  // Seat, backrest, column — 3 draw calls on mobile
  place(mkBox(.58, .07, .58, _cushM), x, .55, z);
  place(mkBox(.58, .64, .07, _cushM), x, .98, z + bz);
  place(mkCyl(.05, .52, M.chrome, isMobile ? 6 : 10), x, .27, z);

  if (isMobile) return; // mobile: 3 meshes total per chair — done

  // Desktop extra detail
  [-.30, .30].forEach(dx => {
    place(mkBox(.06, .05, .38, M.panelGrey), x + dx, .74, z + bz * 0.15);
    place(mkBox(.06, .22, .06, M.panelGrey), x + dx, .63, z + bz);
    place(mkBox(.10, .03, .32, _cushM),      x + dx, .775, z + bz * 0.1);
  });
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const spoke = mkBox(.28, .04, .06, M.chrome);
    spoke.position.set(x + Math.sin(ang) * .18, .03, z + Math.cos(ang) * .18);
    spoke.rotation.y = ang; scene.add(spoke);
    place(mkCyl(.03, .05, _rubberM, 8), x + Math.sin(ang) * .32, .025, z + Math.cos(ang) * .32);
  }
}

// ── ENTRANCE (z = -2 to 8) ────────────────────────────────────────────────────
// Reception desk
{
  const RX = -4, RZ = 3.5;
  const dkM = new THREE.MeshStandardMaterial({ color: 0xb5813a, roughness: 0.75, metalness: 0.05 });
  const dpM = new THREE.MeshStandardMaterial({ color: 0x7a5520, roughness: 0.8 });
  place(mkBox(2.4, 0.07, 0.9, dkM), RX, 0.82, RZ);
  addCol(RX, 0.42, RZ, 2.4, 0.82, 0.9);
  place(mkBox(2.4, 0.78, 0.05, dpM), RX, 0.41, RZ + 0.43);
  place(mkBox(0.05, 0.82, 0.9, dpM), RX - 1.18, 0.41, RZ);
  place(mkBox(0.05, 0.82, 0.9, dpM), RX + 1.18, 0.41, RZ);

  const mBezel = mkBox(0.7, 0.44, 0.05, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.2 }));
  mBezel.position.set(RX, 1.26, RZ - 0.22); scene.add(mBezel);
  const screenM = new THREE.MeshStandardMaterial({ color: 0x0a1f3a, emissive: new THREE.Color(0x153060), emissiveIntensity: 1.3, roughness: 0.1 });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), screenM);
  screenMesh.position.set(RX, 1.26, RZ - 0.196); scene.add(screenMesh);
  const sGlow = new THREE.PointLight(0x2266ff, 0.7, 3.0);
  sGlow.position.set(RX, 1.2, RZ - 0.2); scene.add(sGlow);

  const monProxy = mkBox(0.7, 0.44, 0.1, new THREE.MeshBasicMaterial({ visible: false }));
  monProxy.position.set(RX, 1.26, RZ - 0.2);
  monProxy.userData = { type: 'computer', label: 'Reception Terminal',
    compPos: new THREE.Vector3(RX, 1.10, RZ + 0.55), compRot: new THREE.Euler(-0.05, 0, 0, 'YXZ') };
  allInteractables.push(monProxy); scene.add(monProxy);
  chair(RX, RZ + 0.75, false); // receptionist faces south toward patron
}

// Safety poster — west wall
{
  place(mkBox(0.03, 1.5, 1.1, new THREE.MeshStandardMaterial({ color: 0xffeecc, roughness: 0.9 })), -7.97, 2.0, 2);
  place(mkBox(0.02, 1.58, 1.18, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })), -7.96, 2.0, 2);
  [0xcc2200, 0x2244cc, 0x228822].forEach((clr, i) => {
    place(mkBox(0.02, 0.01, 0.82, new THREE.MeshBasicMaterial({ color: clr })), -7.95, 1.7 + i * 0.28, 2);
  });
}

// Wall clock — east wall at z=7 (north of window@z=4 which covers 2.4–5.6)
{
  const cf = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.8 }));
  cf.rotation.y = Math.PI / 2; cf.position.set(7.88, 2.4, 7); scene.add(cf);
  const cr = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 24), new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.4, metalness: 0.9 }));
  cr.rotation.y = Math.PI / 2; cr.position.set(7.87, 2.4, 7); scene.add(cr);
  place(mkBox(0.01, 0.01, 0.12, new THREE.MeshLambertMaterial({ color: 0x111111 })), 7.87, 2.45, 7).rotation.y = -Math.PI / 2;
  place(mkBox(0.008, 0.008, 0.17, new THREE.MeshLambertMaterial({ color: 0x111111 })), 7.87, 2.38, 7).rotation.y = -Math.PI / 2;
}

// ── ENTRANCE EXTRAS ───────────────────────────────────────────────────────────
// Sittable couch — west side of entrance (x=-5, z=0 to 2.2, faces east)
{
  const CX = -5.0, CZ = 1.2;
  const couchM = new THREE.MeshStandardMaterial({ color: 0x2d4a7c, roughness: 0.85 });
  const couchLt = new THREE.MeshStandardMaterial({ color: 0x3a5a96, roughness: 0.82 });
  // Base
  place(mkBox(1.9, 0.45, 0.75, couchM), CX, 0.225, CZ);
  addCol(CX, 0.225, CZ, 1.9, 0.45, 0.75);
  // Seat cushions (2 segments)
  [-0.46, 0.46].forEach(dx => place(mkBox(0.88, 0.12, 0.68, couchLt), CX + dx, 0.5, CZ));
  // Back rest
  place(mkBox(1.9, 0.62, 0.12, couchM), CX, 0.76, CZ + 0.35);
  // Armrests
  [-0.97, 0.97].forEach(dx => place(mkBox(0.12, 0.58, 0.75, couchM), CX + dx, 0.54, CZ));
  // Sit proxy — player can sit on couch facing east (+X direction = yaw -π/2)
  const couchProxy = mkBox(1.9, 0.5, 0.6, new THREE.MeshBasicMaterial({ visible: false }));
  couchProxy.position.set(CX, 0.45, CZ);
  couchProxy.userData = {
    type: 'sit',
    label: 'Sit (Couch)',
    sitPos: new THREE.Vector3(CX + 0.8, 0.72, CZ - 0.1),
    sitYaw: -Math.PI / 2,
  };
  allInteractables.push(couchProxy); scene.add(couchProxy);
}

// Low coffee table — in front of couch
{
  const stM = new THREE.MeshStandardMaterial({ color: 0xc8aa78, roughness: 0.75 });
  place(mkBox(0.8, 0.04, 0.5, stM), -5.0, 0.46, -0.3);
  addCol(-5.0, 0.23, -0.3, 0.8, 0.46, 0.5);
  if (!isMobile) {
    [[-0.35,-0.2],[0.35,-0.2],[-0.35,0.2],[0.35,0.2]].forEach(([dx,dz]) =>
      place(mkBox(0.04, 0.44, 0.04, M.chrome), -5.0+dx, 0.22, -0.3+dz));
    place(mkBox(0.28, 0.02, 0.20, new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.9 })), -5.1, 0.49, -0.3);
  }
}

// Filing cabinet — NE corner
{
  place(mkBox(0.48, 1.10, 0.52, M.panelGrey), 6.6, 0.55, 7.0);
  addCol(6.6, 0.55, 7.0, 0.48, 1.10, 0.52);
  if (!isMobile) [0.09, 0.45, 0.81].forEach(y => place(mkBox(0.36, 0.02, 0.04, M.chrome), 6.84, y, 7.0));
}

// Tall bookshelf — NW corner
{
  place(mkBox(0.90, 1.85, 0.32, M.panelGrey), -6.5, 0.925, 6.8);
  addCol(-6.5, 0.925, 6.8, 0.90, 1.85, 0.32);
  if (!isMobile) {
    [0.38, 0.80, 1.22, 1.58].forEach(y => place(mkBox(0.88, 0.03, 0.30, M.bench), -6.5, y, 6.8));
    const bookC = [0xcc2200, 0x2244cc, 0x228822, 0xff8833, 0x8822cc, 0x228888];
    [0, 1, 2].forEach(shelf => bookC.forEach((clr, i) => {
      if (i < 4) place(mkBox(0.10, 0.22, 0.24, new THREE.MeshStandardMaterial({ color: clr, roughness: 0.9 })), -6.88 + i * 0.12, 0.38 + shelf * 0.42 + 0.12, 6.8);
    }));
  }
}

// Notice board
place(mkBox(2.2, 1.3, 0.03, new THREE.MeshStandardMaterial({ color: 0x7a5a1a, roughness: 0.9 })), -2.0, 2.2, 7.97);

// Fire extinguisher
place(mkCyl(0.07, 0.52, M.red, 8), -7.5, 0.26, -1.0);

// Small trash can
place(mkCyl(0.12, 0.28, M.panelGrey, 8), -6.9, 0.14, -1.5);

// ── WORKSHOP 1 (z = -18 to -2) ────────────────────────────────────────────────
workbench(-4, -7);  chair(-4, -7.9, true);
workbench( 4, -7);  chair( 4, -7.9, true);
workbench(-4, -13); chair(-4, -13.9, true);
workbench( 4, -13); chair( 4, -13.9, true);

// Wire spools shelf + PPE rack + pinboard — desktop only
if (!isMobile) {
  place(mkBox(0.9, 0.04, 0.9, M.panelGrey), 7.45, 0.58, -3);
  const sp1 = new THREE.Mesh(new THREE.TorusGeometry(.30, .09, 8, 16), M.yellow);
  sp1.rotation.x = Math.PI / 2; place(sp1, 7.3, 0.70, -2.7);
  const sp2 = new THREE.Mesh(new THREE.TorusGeometry(.26, .08, 8, 16), M.copper);
  sp2.rotation.x = Math.PI / 2; place(sp2, 7.3, 0.68, -3.3);

  place(mkBox(0.04, 1.1, 1.4, new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 })), -7.88, 1.6, -9);
  [M.yellow, M.orange].forEach((mat, i) =>
    place(new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6, 0, Math.PI * 2, 0, Math.PI * .55), mat), -7.5, 2.2, -8.3 + i * 0.8));

  place(mkBox(0.04, 1.0, 1.5, new THREE.MeshStandardMaterial({ color: 0xaa8855, roughness: 0.9 })), 7.88, 1.8, -13);
  [0xffeedd, 0xddeeff, 0xeeffdd].forEach((clr, i) =>
    place(mkBox(0.045, 0.26, 0.32, new THREE.MeshBasicMaterial({ color: clr })), 7.88, 1.5 + (i % 2) * 0.38, -12.2 + i * 0.6));
}

// ── WORKSHOP 2 (z = -32 to -18) ───────────────────────────────────────────────
workbench(-4, -22); chair(-4, -22.9, true);
workbench( 4, -22); chair( 4, -22.9, true);
workbench(-4, -28); chair(-4, -28.9, true);
workbench( 4, -28); chair( 4, -28.9, true);

// Tool cabinet — south wall
{
  const cab = mkBox(1.2, 1.6, 0.55, M.panelGrey);
  cab.position.set(-5.5, 0.8, -31.5); scene.add(cab);
  addCol(-5.5, 0.8, -31.5, 1.2, 1.6, 0.55);
  if (!isMobile) for (let i = 0; i < 4; i++)
    place(mkBox(0.28, 0.04, 0.04, M.chrome), -5.5, 0.3 + i * 0.4, -31.22);
}

// Schematic poster — south wall WS2
place(mkBox(1.6, 1.1, 0.03, new THREE.MeshStandardMaterial({ color: 0x0a1f3a, roughness: 0.9 })), 4, 2.0, -31.97);

// ── BREAKER PANEL ─────────────────────────────────────────────────────────────
export function breakerPanel(cx, cy, cz, ry, id, label, count = 8) {
  const grp = new THREE.Group();
  const enclosure = mkBox(1.05, 1.55, .18, M.panel); enclosure.position.set(0, 1.78, 0); grp.add(enclosure);
  const trim = mkBox(1.07, 1.57, .14, M.panelGrey); trim.position.set(0, 1.78, .02); grp.add(trim);
  const lbl = mkBox(.88, .16, .06, new THREE.MeshBasicMaterial({ color: 0x0a1520 })); lbl.position.set(0, 2.58, .1); grp.add(lbl);
  const breakers = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 2), col = i % 2;
    const on = i < Math.floor(count * .75);
    const br = mkBox(.16, .28, .07, on ? M.green : M.red);
    br.position.set(-.23 + col * .46, 2.3 - row * .32, .12);
    grp.add(br);
    br.userData = { type: 'breaker', panel: id, idx: i, label: `${label} #${i + 1}` };
    breakers.push({ mesh: br, on });
    allInteractables.push(br);
  }
  grp.position.set(cx, cy, cz); grp.rotation.y = ry; scene.add(grp);
  return { grp, breakers };
}

export const wsPanel    = breakerPanel(7.8, 0, -8, Math.PI / 2, 'workshop', 'WORKSHOP', 6);
export const mainPanel  = wsPanel;
export const distAPanel = wsPanel;
export const distBPanel = wsPanel;

// ── SWITCH BOXES ──────────────────────────────────────────────────────────────
export function switchBox(cx, cy, cz, ry, id, label, on) {
  const grp = new THREE.Group();
  const base = mkBox(.38, .3, .12, M.panelGrey); grp.add(base);
  const sw = mkBox(.14, .22, .08, on ? M.green : M.red); sw.position.set(0, 0, .1); grp.add(sw);
  sw.userData = { type: 'switch', id, label, on, mesh: sw };
  allInteractables.push(sw);
  grp.position.set(cx, cy, cz); grp.rotation.y = ry; scene.add(grp);
  return sw;
}

export const mainSwitch = switchBox(7.88, 1.8, 2, Math.PI / 2, 'main-switch', 'Main Power', true);
export const genSwitch  = switchBox(7.88, 1.8, 7, Math.PI / 2, 'gen-switch',  'WS Lights',  true);

// ── DOOR CLASS ────────────────────────────────────────────────────────────────
export class Door {
  constructor(wallX, wallZ, hingeX, hingeZ, width, swingAngle, label, isXWall = true, floorY = 0) {
    this.label = label;
    this.open = false;
    this.angle = 0;
    this.target = 0;
    this.swingAngle = swingAngle;
    this.isXWall = isXWall;
    this.floorY = floorY;

    this.pivot = new THREE.Group();
    this.pivot.position.set(hingeX, floorY, hingeZ);
    scene.add(this.pivot);

    const DH = 2.55; // door panel height
    const panelW = isXWall ? 0.09 : width;
    const panelD = isXWall ? width : 0.09;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, DH, panelD), M.door);
    if (isXWall) panel.position.set(0, DH / 2, width / 2);
    else         panel.position.set(width / 2, DH / 2, 0);
    this.pivot.add(panel);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 12), M.chrome);
    if (isXWall) knob.position.set(swingAngle > 0 ? .09 : -.09, 1.05, width * .88);
    else         knob.position.set(width * .88, 1.05, swingAngle > 0 ? .09 : -.09);
    this.pivot.add(knob);

    const postH = DH + 0.14; // frame posts slightly taller than door
    const postY = floorY + postH / 2;
    if (isXWall) {
      place(mkBox(.18, postH, .18, M.doorFrame), wallX, postY, wallZ - width / 2);
      place(mkBox(.18, postH, .18, M.doorFrame), wallX, postY, wallZ + width / 2);
      place(mkBox(.18, .18, width + .36, M.doorFrame), wallX, floorY + DH + 0.16, wallZ);
      const led = mkBox(width, .05, .07, M.eBlue); led.position.set(wallX, floorY + DH + 0.12, wallZ); scene.add(led);
    } else {
      place(mkBox(.18, postH, .18, M.doorFrame), wallX - width / 2, postY, wallZ);
      place(mkBox(.18, postH, .18, M.doorFrame), wallX + width / 2, postY, wallZ);
      place(mkBox(width + .36, .18, .18, M.doorFrame), wallX, floorY + DH + 0.16, wallZ);
      const led = mkBox(width, .05, .07, M.eBlue); led.position.set(wallX, floorY + DH + 0.12, wallZ); scene.add(led);
    }

    panel.userData = { type: 'door', door: this };
    knob.userData  = { type: 'door', door: this };
    allInteractables.push(panel, knob);
    this.panel = panel;
    this._addCol();
  }

  _addCol() {
    if (this._colBox) {
      const idx = colBoxes.indexOf(this._colBox);
      if (idx !== -1) colBoxes.splice(idx, 1);
      this._colBox = null;
    }
    if (!this.open) {
      const p = this.pivot.position;
      if (this.isXWall) {
        const panelLen = this.panel.geometry.parameters.depth;
        const pH = this.panel.geometry.parameters.height;
        const cz = p.z + panelLen / 2;
        this._colBox = new THREE.Box3(
          new THREE.Vector3(p.x - 0.12, this.floorY, cz - panelLen / 2),
          new THREE.Vector3(p.x + 0.12, this.floorY + pH, cz + panelLen / 2)
        );
      } else {
        const panelLen = this.panel.geometry.parameters.width;
        const pH = this.panel.geometry.parameters.height;
        const cx = p.x + panelLen / 2;
        this._colBox = new THREE.Box3(
          new THREE.Vector3(cx - panelLen / 2, this.floorY, p.z - 0.12),
          new THREE.Vector3(cx + panelLen / 2, this.floorY + pH, p.z + 0.12)
        );
      }
      colBoxes.push(this._colBox);
    }
  }

  toggle(AudioSys, notify) {
    this.open = !this.open;
    this.target = this.open ? this.swingAngle : 0;
    if (AudioSys) AudioSys.door(this.open);
    if (notify) notify(this.open ? `🚪 ${this.label} — Opened` : `🚪 ${this.label} — Closed`);
    this._addCol();
  }

  update(dt) {
    const diff = this.target - this.angle;
    if (Math.abs(diff) > .001) {
      this.angle += diff * Math.min(1, dt * 7);
      this.pivot.rotation.y = this.angle;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE ENRICHMENT — props, conduit, floor markings, details
// ══════════════════════════════════════════════════════════════════════════════

// ── Helper: junction box on wall ───────────────────────────────────────────
const _jbM = new THREE.MeshStandardMaterial({ color: 0x555f66, roughness: 0.55, metalness: 0.55 });
const _jbFM = new THREE.MeshStandardMaterial({ color: 0x3a4a52, roughness: 0.45, metalness: 0.6 });
function junctionBox(x, y, z, ry = 0) {
  const grp = new THREE.Group();
  const body = mkBox(.18, .14, .08, _jbM); grp.add(body);
  const face = mkBox(.14, .10, .02, _jbFM); face.position.z = .05; grp.add(face);
  const ko1 = mkCyl(.015, .025, M.chrome, 8); ko1.rotation.x = Math.PI/2; ko1.position.set(-.06,.04,.06); grp.add(ko1);
  const ko2 = mkCyl(.015, .025, M.chrome, 8); ko2.rotation.x = Math.PI/2; ko2.position.set( .06,.04,.06); grp.add(ko2);
  grp.position.set(x, y, z); grp.rotation.y = ry; scene.add(grp);
}

// ── Helper: EMT conduit segment ────────────────────────────────────────────
const _condM = new THREE.MeshStandardMaterial({ color: 0x778899, roughness: 0.35, metalness: 0.78 });
function conduit(x1, y, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx*dx + dz*dz);
  const c = mkCyl(.022, len, _condM, 8);
  c.rotation.z = Math.PI / 2;
  c.rotation.y = Math.atan2(dz, dx);
  c.position.set((x1+x2)/2, y, (z1+z2)/2);
  scene.add(c);
  // end couplings
  [[x1,z1],[x2,z2]].forEach(([ex,ez]) => {
    const coup = mkCyl(.028, .04, _jbM, 8);
    coup.rotation.z = Math.PI/2; coup.position.set(ex, y, ez); scene.add(coup);
  });
}

// ── Helper: vertical conduit drop ─────────────────────────────────────────
function conduitV(x, y1, y2, z) {
  const len = Math.abs(y2 - y1);
  const c = mkCyl(.022, len, _condM, 8);
  c.position.set(x, (y1+y2)/2, z); scene.add(c);
}

// ── Helper: safety floor tape line ────────────────────────────────────────
const _tapeM = new THREE.MeshBasicMaterial({ color: 0xffd700 });
const _tapeRM = new THREE.MeshBasicMaterial({ color: 0xdd2211 });
function floorTape(x1, z1, x2, z2, red = false) {
  const dx = x2-x1, dz = z2-z1, len = Math.sqrt(dx*dx+dz*dz);
  const t = new THREE.Mesh(new THREE.PlaneGeometry(len, .06), red ? _tapeRM : _tapeM);
  t.rotation.x = -Math.PI/2;
  t.rotation.z = Math.atan2(dz, dx);
  t.position.set((x1+x2)/2, 0.002, (z1+z2)/2);
  scene.add(t);
}

// ── Helper: ceiling cable tray segment ────────────────────────────────────
function ceilTray(x1, z1, x2, z2, y = H - 0.45) {
  const dx = x2-x1, dz = z2-z1, len = Math.sqrt(dx*dx+dz*dz);
  const tray = mkBox(len, .08, .32, M.panelGrey);
  tray.rotation.y = Math.atan2(dz, dx);
  tray.position.set((x1+x2)/2, y, (z1+z2)/2);
  scene.add(tray);
}

// ── Helper: RCD/Isolator switch unit on wall ───────────────────────────────
const _rcdBodyM = new THREE.MeshStandardMaterial({ color: 0xe8e8e4, roughness: 0.6, metalness: 0.1 });
function rcdUnit(x, y, z, ry = 0) {
  const grp = new THREE.Group();
  place(mkBox(.12, .18, .06, _rcdBodyM), 0, 0, 0); // body
  const led = mkBox(.025, .025, .02, M.green); led.position.set(.03, .06, .04); grp.add(led);
  const btn = mkCyl(.018, .02, M.red, 10); btn.rotation.x = Math.PI/2; btn.position.set(0, -.02, .04); grp.add(btn);
  const lbl = mkBox(.08, .02, .01, new THREE.MeshBasicMaterial({ color: 0x111111 })); lbl.position.set(0, .07, .04); grp.add(lbl);
  grp.position.set(x, y, z); grp.rotation.y = ry; scene.add(grp);
}

// ── Helper: electrical cable bundle run ───────────────────────────────────
function cableBundle(x, y1, y2, z, clrs = [0xb45309,0x3b82f6,0x22c55e]) {
  clrs.forEach((clr, i) => {
    const off = (i - 1) * 0.025;
    const cm = mkCyl(.009, Math.abs(y2-y1), new THREE.MeshStandardMaterial({ color: clr, roughness: 0.8 }), 6);
    cm.position.set(x + off, (y1+y2)/2, z); scene.add(cm);
  });
}

// ── Helper: emergency exit sign ───────────────────────────────────────────
const _exitGrnM = new THREE.MeshStandardMaterial({ color: 0x00cc44, emissive: new THREE.Color(0x008822), emissiveIntensity: 1.0, roughness: 0.1 });
const _exitWhtM = new THREE.MeshBasicMaterial({ color: 0xffffff });
function exitSign(x, y, z, ry = 0) {
  const grp = new THREE.Group();
  const body = mkBox(.30, .12, .04, _exitGrnM); grp.add(body);
  const txt  = mkBox(.22, .06, .01, _exitWhtM); txt.position.set(0, 0, .025); grp.add(txt);
  grp.position.set(x, y, z); grp.rotation.y = ry; scene.add(grp);
  // Sign glow
  const gl = new THREE.PointLight(0x00ff44, 0.3, 2.5); gl.position.set(x, y, z); scene.add(gl);
}

// ── Helper: tool chest / rollaway cabinet ─────────────────────────────────
function toolChest(x, z) {
  const tcM = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.45, metalness: 0.35 });
  const tcDM = new THREE.MeshStandardMaterial({ color: 0xaa1a00, roughness: 0.48, metalness: 0.3 });
  place(mkBox(.55, 1.0, .38, tcM), x, .5, z);
  addCol(x, .5, z, .55, 1.0, .38);
  // Drawers
  [.12, .32, .52, .72].forEach(dy => {
    place(mkBox(.48, .16, .02, tcDM), x, dy, z + .20);
    place(mkBox(.12, .03, .02, M.chrome), x, dy, z + .21); // handle
  });
  // Casters
  [-.22,.22].forEach(dx => [-.14,.14].forEach(dz =>
    place(mkCyl(.04, .05, _rubberM, 8), x+dx, .025, z+dz)));
}

// ── Helper: potted plant ──────────────────────────────────────────────────
const _plantM  = new THREE.MeshStandardMaterial({ color: 0x1a6622, roughness: 0.95 });
const _potM    = new THREE.MeshStandardMaterial({ color: 0xb05a2a, roughness: 0.8 });
function plant(x, y, z, scale = 1.0) {
  place(mkCyl(.08*scale, .15*scale, _potM, 10), x, y + .075*scale, z);
  // Stem
  place(mkCyl(.015*scale, .22*scale, _plantM, 6), x, y + .22*scale, z);
  // Leaf clusters
  [[0,.32,.06],[.08,.28,.04],[-.07,.26,.05]].forEach(([lx,ly,lz]) => {
    const lf = new THREE.Mesh(new THREE.SphereGeometry(.09*scale, 7, 5), _plantM);
    lf.scale.set(1.4,0.7,1.2); lf.position.set(x+lx*scale, y+ly*scale, z+lz*scale); scene.add(lf);
  });
}

// ── Helper: water cooler ──────────────────────────────────────────────────
const _wcBodyM = new THREE.MeshStandardMaterial({ color: 0xdde8f0, roughness: 0.45, metalness: 0.2 });
const _wcBotM  = new THREE.MeshStandardMaterial({ color: 0xaaccee, transparent: true, opacity: 0.7, roughness: 0.05 });
function waterCooler(x, z) {
  place(mkBox(.28, .80, .30, _wcBodyM), x, .40, z);
  addCol(x, .40, z, .28, .80, .30);
  place(mkCyl(.09, .30, _wcBotM, 12), x, .96, z);        // bottle
  place(mkBox(.28, .04, .30, M.panelGrey), x, .83, z);   // collar
  place(mkCyl(.04, .06, M.chrome, 8), x - .08, .72, z + .16); // tap
  place(mkCyl(.04, .06, M.chrome, 8), x + .08, .72, z + .16); // tap
  place(mkBox(.26, .04, .28, new THREE.MeshStandardMaterial({ color: 0xaaaaaa })), x, .06, z); // base tray
}

// ── Helper: safety sign board ─────────────────────────────────────────────
const _signYM = new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.7 });
const _signBM = new THREE.MeshBasicMaterial({ color: 0x111111 });
function safetySign(x, y, z, ry = 0) {
  const grp = new THREE.Group();
  mkBox(.36, .26, .02, _signYM); grp.add(place(mkBox(.36, .26, .02, _signYM), 0, 0, 0));
  place(mkBox(.28, .06, .01, _signBM), 0, 0.05, .015);   // text line
  place(mkBox(.20, .04, .01, _signBM), 0, -0.04, .015);  // text line
  const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; scene.add(g);
  scene.remove(g); // cleanup — re-add properly:
  const body = mkBox(.36,.26,.02, _signYM);
  body.position.set(x,y,z); body.rotation.y=ry; scene.add(body);
  place(mkBox(.26,.05,.01, _signBM), x + (ry===0?0:0), y+0.06, z + (ry===0?.012:.012));
  place(mkBox(.18,.04,.01, _signBM), x, y-0.03, z + (ry===0?.012:.012));
}

// ══════════════════════════════════════════════════════════════════════════════
// CONDUIT RUNS & JUNCTION BOXES
// ══════════════════════════════════════════════════════════════════════════════

// WS1 east wall conduit run (vertical + horizontal)
conduit(7.88, 2.8, -3.5, 7.88, -16.5);
conduitV(7.88, 0.4, 2.8, -3.5);
junctionBox(7.88, 2.8, -3.5, -Math.PI/2);
junctionBox(7.88, 2.8, -8.5, -Math.PI/2);
junctionBox(7.88, 2.8, -14.0,-Math.PI/2);
junctionBox(7.88, 0.8, -3.5, -Math.PI/2);

// WS1 west wall conduit
conduit(-7.88, 2.4, -4.0, -7.88, -17.0);
conduitV(-7.88, 0.4, 2.4, -4.0);
junctionBox(-7.88, 2.4, -7.0, Math.PI/2);
junctionBox(-7.88, 2.4,-12.5, Math.PI/2);

// WS2 conduit runs
conduit(7.88, 2.6, -19.0, 7.88, -31.5);
junctionBox(7.88, 2.6, -22.0,-Math.PI/2);
junctionBox(7.88, 2.6, -28.5,-Math.PI/2);
conduit(-7.88, 2.6, -19.0, -7.88, -31.5);
junctionBox(-7.88, 2.6,-24.0, Math.PI/2);

// Ceiling cable tray WS2
ceilTray(-6, -18.5, 6, -18.5);
ceilTray(-6, -31.5, 6, -31.5);

// RCD units near panels
rcdUnit(7.88, 2.1, -4.5, -Math.PI/2);
rcdUnit(7.88, 2.1, -10.5,-Math.PI/2);
rcdUnit(-7.88, 2.1,-9.5, Math.PI/2);
rcdUnit(7.88, 2.1, -20.0,-Math.PI/2);
rcdUnit(-7.88, 2.1,-26.5, Math.PI/2);

// Cable bundles + floor tape — desktop only (too many draw calls for mobile)
if (!isMobile) {
  cableBundle(7.82, 2.78, 1.0, -3.5);
  cableBundle(-7.82, 2.38, 1.0, -7.0);
  cableBundle(-7.82, 2.38, 1.0,-12.5);
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOOR SAFETY MARKINGS — desktop only
// ══════════════════════════════════════════════════════════════════════════════
if (!isMobile) {
  floorTape(0, -2.5, 0, -17.5);
  [[-4,-7],[4,-7],[-4,-13],[4,-13],[-4,-22],[4,-22],[-4,-28],[4,-28]].forEach(([bx,bz]) => {
    floorTape(bx-1.4, bz-1.1, bx+1.4, bz-1.1);
    floorTape(bx-1.4, bz+0.8, bx+1.4, bz+0.8);
    floorTape(bx-1.4, bz-1.1, bx-1.4, bz+0.8);
    floorTape(bx+1.4, bz-1.1, bx+1.4, bz+0.8);
  });
  floorTape(-1.8, -1.5, 1.8, -1.5, true);
  floorTape(-1.8,-17.5, 1.8,-17.5, true);
}

// ══════════════════════════════════════════════════════════════════════════════
// ENTRANCE AREA EXTRAS
// ══════════════════════════════════════════════════════════════════════════════

// ── All enrichment props: desktop only ───────────────────────────────────────
if (!isMobile) {
  waterCooler(6.2, 6.8);
  plant(-1.0, 0, 7.8);
  plant( 1.8, 0, 7.8, 1.1);
  exitSign(0, 3.2, -1.5);
  exitSign(0, 3.2,-17.5);
  safetySign(-7.97, 1.5, -0.5, Math.PI/2);
  safetySign( 7.97, 1.5,  1.0,-Math.PI/2);

  place(mkBox(0.48, 0.90, 0.52, M.panelGrey), 6.6, 0.45, 5.8);
  addCol(6.6, 0.45, 5.8, 0.48, 0.90, 0.52);

  // Tool chests WS1
  toolChest(-6.8, -5.0);
  toolChest(-6.8,-11.5);

  // Component shelf east wall WS1
  {
    const shM = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.6 });
    place(mkBox(.06, 1.8, .06, shM), 7.6, 0.9, -8.5);
    place(mkBox(.06, 1.8, .06, shM), 7.6, 0.9, -11.5);
    [0.35, 0.75, 1.15, 1.55].forEach(y => {
      place(mkBox(.24, .035, 2.96, M.bench), 7.28, y + .02, -10.0);
    });
    const binC = [0xcc2200, 0x2244cc, 0x228822, 0xff8800, 0x882288, 0x228888, 0xcc8800, 0x444444];
    binC.forEach((clr, i) => {
      place(mkBox(.20, .14, .14, new THREE.MeshStandardMaterial({ color: clr, roughness: 0.75 })),
        7.26, 0.35 + Math.floor(i/4)*0.40 + .07, -8.7 + (i%4)*0.7);
    });
    addCol(7.4, 0.9, -10.0, .28, 1.8, 3.2);
  }

  // Oscilloscope
  {
    const oscScrM = new THREE.MeshStandardMaterial({ color: 0x001a0a, emissive: new THREE.Color(0x00ff44), emissiveIntensity: 0.6, roughness: 0.1 });
    place(mkBox(.28, .18, .22, new THREE.MeshStandardMaterial({ color: 0x0a1a2a, roughness: 0.55 })), 4.6, 1.06, -7.05);
    place(mkBox(.22, .12, .02, oscScrM), 4.6, 1.08, -6.94);
  }

  // PPE hard hats
  {
    [0xf5c518, 0xdd2211].forEach((clr, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: clr, roughness: 0.55 });
      const hh = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6, 0, Math.PI*2, 0, Math.PI*.52), mat);
      hh.position.set(-7.5, 1.85, -7.0 + i * 0.9); scene.add(hh);
    });
  }

  // Tool chests + dist board WS2
  toolChest(-3.0, -31.4);
  {
    place(mkBox(.06, 1.35, 0.90, new THREE.MeshStandardMaterial({ color: 0x1a2838, roughness: 0.55 })), -7.95, 2.15, -24.0);
    addCol(-7.95, 2.15, -24.0, .10, 1.4, 0.95);
  }

  // Cable drum WS2
  {
    const drumM = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    place(mkCyl(.38, .08, drumM, 10), 6.0, .04, -29.5);
    place(mkCyl(.22, .40, new THREE.MeshStandardMaterial({ color: 0xcc6600, roughness: 0.85 }), 10), 6.0, .24, -29.5);
    place(mkCyl(.38, .08, drumM, 10), 6.0, .44, -29.5);
    addCol(6.0, .24, -29.5, .78, .52, .78);
  }

  // Equipment rack east WS2
  {
    place(mkBox(.45, 1.80, .55, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })), 7.0, 0.9, -21.5);
    addCol(7.0, 0.9, -21.5, .45, 1.80, .55);
  }

  // PCB boards on WS2 benches
  {
    const pcbM = new THREE.MeshStandardMaterial({ color: 0x1a4a1a, roughness: 0.7 });
    [[-4,-22],[4,-22],[-4,-28],[4,-28]].forEach(([bx,bz]) =>
      place(mkBox(.36, .26, .012, pcbM), bx + .4, 1.16, bz + .42));
  }

  // Ceiling conduit WS1
  {
    const hc2 = mkCyl(.022, 12, _condM, 8);
    hc2.rotation.z = Math.PI/2; hc2.position.set(0, H - 0.28, -10); scene.add(hc2);
  }
  // WS2 cable tray
  {
    const ct = mkBox(12, .08, .32, M.panelGrey);
    ct.position.set(0, H - 0.45, -25); scene.add(ct);
  }
}

// hinge at x=-0.9 (left edge of 1.8m opening), panel width 1.8 fills the gap
export const doors = [
  new Door(0, -2,  -0.9, -2,  1.8, -Math.PI * .75, 'Workshop 1', false),
  new Door(0, -18, -0.9, -18, 1.8, -Math.PI * .75, 'Workshop 2', false),
];

// ══════════════════════════════════════════════════════════════════════════════
// SWITCH TRAINING PANELS — wall-mounted, camera-zoom interactive
// 1-way: 1 switch  + 1 bulb  — WS1 east wall  (x= 8, z= -5)
// 2-way: 2 switches + 1 bulb — WS1 west wall  (x=-8, z=-12)
// 3-way: 3 switches + 1 bulb — WS2 east wall  (x= 8, z=-23)
// ══════════════════════════════════════════════════════════════════════════════
const WIRING_STATIONS = [
  { type: '1way', label: '1-WAY SWITCH',  east: true,  wallX:  8, pz:  -3, py: 1.45, n: 1, clr: 0x22c55e, lcd: 0x44ff88, bx:  2.5, bz:  -3  },
  { type: '2way', label: '2-WAY SWITCH',  east: false, wallX: -8, pz: -12, py: 1.45, n: 2, clr: 0x3b82f6, lcd: 0x44aaff, bx: -2.5, bz: -12  },
  { type: '3way', label: '3-WAY SWITCH',  east: true,  wallX:  8, pz: -23, py: 1.45, n: 3, clr: 0xf59e0b, lcd: 0xffcc44, bx:  2.5, bz: -23  },
];

export const workshopWiringStations = [];

// ── Build each switch training panel ─────────────────────────────────────────
WIRING_STATIONS.forEach(ws => {
  const ry = ws.east ? -Math.PI / 2 : Math.PI / 2;

  // ── PANEL BACKING PLATE ────────────────────────────────────────────────────
  // Total panel width depends on how many switches (0.22 each + 0.10 gap + margins)
  const PW = ws.n * 0.22 + (ws.n - 1) * 0.10 + 0.18; // e.g. n=1→0.40, n=2→0.72, n=3→1.04
  const PH = 0.52;
  const g = new THREE.Group();
  const plate = mkBox(PW, PH, 0.05,
    new THREE.MeshStandardMaterial({ color: 0x2c3a4a, roughness: 0.55, metalness: 0.3 }));
  g.add(plate);

  // colour accent strip at top
  const strip = mkBox(PW, 0.05, 0.055,
    new THREE.MeshStandardMaterial({ color: ws.clr, emissive: new THREE.Color(ws.clr), emissiveIntensity: 0.6, roughness: 0.5 }));
  strip.position.set(0, PH / 2 - 0.025, 0.005); g.add(strip);

  // ── SWITCHES (one per n) ───────────────────────────────────────────────────
  const switchSpacing = 0.32;
  const startX = -(ws.n - 1) * switchSpacing / 2;
  const swMeshes = [];
  for (let i = 0; i < ws.n; i++) {
    const sx = startX + i * switchSpacing;
    // switch body
    const body = mkBox(0.14, 0.22, 0.04,
      new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.4, metalness: 0.1 }));
    body.position.set(sx, 0.02, 0.045); g.add(body);
    // rocker
    const rocker = mkBox(0.08, 0.12, 0.025,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.05 }));
    rocker.position.set(sx, 0.04, 0.065); g.add(rocker);
    swMeshes.push(rocker);
  }

  // ── BULB holder on panel ───────────────────────────────────────────────────
  // Socket
  const sockM = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.6 });
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 14), sockM);
  sock.rotation.x = Math.PI / 2; sock.position.set(0, -0.12, 0.06); g.add(sock);
  // Bulb glass sphere
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff8d0, emissive: new THREE.Color(0xfff5b0), emissiveIntensity: 0.0,
    transparent: true, opacity: 0.82, roughness: 0.05, metalness: 0.0,
  });
  const bulbGlass = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), bulbMat);
  bulbGlass.position.set(0, -0.20, 0.06); g.add(bulbGlass);
  // Filament glow point
  const bulbPoint = new THREE.PointLight(0xfff5b0, 0, 3.5, 2.0);
  bulbPoint.position.set(0, -0.20, 0.06);
  g.add(bulbPoint); // child of group so it moves with panel

  // ── STATUS LED ─────────────────────────────────────────────────────────────
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.020, 8, 6),
    new THREE.MeshStandardMaterial({ color: ws.lcd, emissive: new THREE.Color(ws.lcd), emissiveIntensity: 0.9, roughness: 0.3 }));
  led.position.set(PW / 2 - 0.06, -PH / 2 + 0.06, 0.04); g.add(led);

  // ── POSITION ON WALL ───────────────────────────────────────────────────────
  g.rotation.y = ry;
  // Place flush on wall face — panel depth 0.025 sticks out
  const wallFace = ws.east ? ws.wallX - 0.14 : ws.wallX + 0.14;
  g.position.set(wallFace, ws.py, ws.pz);
  scene.add(g);

  // ── INTERACTION PROXY ──────────────────────────────────────────────────────
  // Camera target: step back 1.5m from wall, look directly at panel
  const camOffset = ws.east ? -1.5 : 1.5;
  const camPos  = new THREE.Vector3(ws.wallX + camOffset, ws.py + 0.05, ws.pz);
  const camLook = new THREE.Euler(0, ws.east ? Math.PI / 2 : -Math.PI / 2, 0, 'YXZ');

  const proxy = mkBox(0.6, 0.7, 0.3, new THREE.MeshBasicMaterial({ visible: false }));
  proxy.rotation.y = ry;
  proxy.position.set(wallFace + (ws.east ? -0.18 : 0.18), ws.py, ws.pz);
  proxy.userData = {
    type: 'wall-panel',
    switchType: ws.type,
    label: ws.label,
    camPos, camLook,
    bulbMat, bulbPoint, led,
    _group: g, swMeshes,
  };
  allInteractables.push(proxy); scene.add(proxy);
  workshopWiringStations.push({ id: ws.type, proxy, led, bulbMat, bulbPoint });

  // ── BULB SOCKET above panel on ceiling cord ───────────────────────────────
  // Decorative hanging cord from ceiling to panel (thin cylinder)
  const cordH = H - ws.py - PH / 2 - 0.3;
  const cordMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, cordH, 6),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })
  );
  // cord hangs above panel centre in local space, but panel is rotated so place in world
  const cordG = new THREE.Group();
  cordG.rotation.y = ry;
  cordG.position.set(wallFace, ws.py + PH / 2 + cordH / 2, ws.pz);
  cordG.add(cordMesh);
  scene.add(cordG);
});

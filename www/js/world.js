import * as THREE from 'three';
import { makeFloorTex, makeWallTex, makeCeilTex, makeMetalTex, makeConcrTex, makeFloorNorm, makeWallNorm, makeMetalNorm } from './textures.js';

// ── RENDERER ──────────────────────────────────────────────────────────────────
export const isMobile = navigator.maxTouchPoints > 0;
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: true,
  powerPreference: 'high-performance',
  precision: 'highp',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2.0 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = !isMobile;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ecff5);
scene.fog = new THREE.FogExp2(0xc5e4f7, 0.004); // interior — minimal fog

if (!isMobile) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x87ceeb);
  const envSky = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 120), new THREE.MeshBasicMaterial({ color: 0x87ceeb }));
  envSky.position.set(0, 20, 0); envScene.add(envSky);
  const envSun = new THREE.Mesh(new THREE.BoxGeometry(2, 60, 2), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }));
  envSun.position.set(18, 0, -10); envScene.add(envSun);
  const envGround = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 120), new THREE.MeshBasicMaterial({ color: 0xc8b87a }));
  envGround.position.set(0, -20, 0); envScene.add(envGround);
  scene.environment = pmremGenerator.fromScene(envScene).texture;
  scene.environmentIntensity = 0.9;
  pmremGenerator.dispose();
} else {
  scene.environment = null;
}

// ── PLAYER SPAWN ──────────────────────────────────────────────────────────────
export const SPAWN     = new THREE.Vector3(0, 1.72, 5);
export const SPAWN_YAW = Math.PI;

export const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, isMobile ? 65 : 120);
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
  Object.values(M).forEach(mat => {
    if (mat.isMeshStandardMaterial) {
      mat.normalMap       = null;
      mat.envMapIntensity = 0;
      mat.metalness       = Math.min(mat.metalness, 0.3);
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

export const ambLight = new THREE.AmbientLight(0xfff5e8, 0.72); // dimmed for realism
scene.add(ambLight);
scene.add(new THREE.HemisphereLight(0x9ecff5, 0xd4c4a0, 0.50));

const sunLight = new THREE.DirectionalLight(0xfff8e0, 3.2);
sunLight.position.set(12, 18, 8);
sunLight.target.position.set(0, 0, -12);
scene.add(sunLight); scene.add(sunLight.target);
if (!isMobile) {
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width  = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 1; sunLight.shadow.camera.far  = 60;
  sunLight.shadow.camera.left = -18; sunLight.shadow.camera.right  =  18;
  sunLight.shadow.camera.top  =  18; sunLight.shadow.camera.bottom = -18;
  sunLight.shadow.bias = -0.002; sunLight.shadow.normalBias = 0.04; sunLight.shadow.radius = 2.5;
}

const skyFill = new THREE.DirectionalLight(0xc8e8ff, 0.55);
skyFill.position.set(-8, 10, 2); scene.add(skyFill);

export const warnLight = new THREE.PointLight(0xff2200, 0, 20);
warnLight.position.set(0, 3.5, -10); scene.add(warnLight);

export function mkLight(x, y, z, color, intensity, key) {
  const _range = isMobile ? 12 : 18;
  const spot = new THREE.SpotLight(color || 0x88ccff, intensity * (isMobile ? 1.4 : 1.1), _range, Math.PI / 4.2, 0.32, 2.0);
  spot.position.set(x, y, z);
  spot.target.position.set(x, 0, z);
  scene.add(spot); scene.add(spot.target);

  const fixtureBase = mkBox(0.18, 0.06, 1.6, M.panelGrey);
  fixtureBase.position.set(x, y + 0.06, z); scene.add(fixtureBase);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), M.eWhite);
  tube.rotation.z = Math.PI / 2; tube.position.set(x, y, z); scene.add(tube);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), M.eWhite);
  disc.rotation.x = Math.PI / 2; disc.position.set(x, y - 0.04, z); scene.add(disc);

  if (key) {
    if (!roomLightSets[key]) roomLightSets[key] = [];
    roomLightSets[key].push(spot);
  }
  return spot;
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

// Light shafts (WS1 east windows)
const shaftMat = new THREE.MeshBasicMaterial({ color: 0xfff8e8, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
[[-6, -14]].forEach(([z1, z2]) => {
  const s = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), shaftMat);
  s.position.set(7.4, 2.2, (z1 + z2) / 2); s.rotation.y = Math.PI / 2; scene.add(s);
  const wPt = new THREE.PointLight(0xfff0cc, isMobile ? 0 : 1.2, 5, 1.8);
  wPt.position.set(6.5, 2.2, (z1 + z2) / 2); scene.add(wPt);
  if (!roomLightSets['workshop']) roomLightSets['workshop'] = [];
  roomLightSets['workshop'].push(wPt);
});

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
function workbench(cx, cz) {
  place(mkBox(2.2, .07, .9, M.bench), cx, 0.965, cz);
  place(mkBox(2.2, .05, .78, M.panelGrey), cx, .5, cz);
  place(mkBox(2.2, .45, .06, M.panelGrey), cx, 1.22, cz + .44);
  [[-1.05, -.38], [-1.05, .38], [1.05, -.38], [1.05, .38]].forEach(([dx, dz]) => {
    place(mkBox(.06, 1.0, .06, M.chrome), cx + dx, .5, cz + dz);
  });
  addCol(cx, .5, cz, 2.2, 1.0, .9);
}

// faceNorth=true  → person faces +Z (toward entrance), backrest on south side (z-0.27)
// faceNorth=false → person faces -Z (toward WS2),    backrest on north side (z+0.27)
function chair(x, z, faceNorth = false) {
  const bz = faceNorth ? -0.27 : 0.27;
  place(mkBox(.58, .07, .58, M.panelGrey), x, .55, z);
  place(mkBox(.58, .62, .07, M.panelGrey), x, .98, z + bz);
  [-.30, .30].forEach(dx => {
    place(mkBox(.06, .05, .36, M.panelGrey), x + dx, .74, z + bz * 0.15);
    place(mkBox(.06, .20, .06, M.panelGrey), x + dx, .63, z + bz);
  });
  place(mkCyl(.05, .52, M.chrome), x, .27, z);
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    place(mkBox(.28, .04, .06, M.chrome), x + Math.sin(ang) * .18, .03, z + Math.cos(ang) * .18).rotation.y = ang;
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
  [[-0.35,-0.2],[0.35,-0.2],[-0.35,0.2],[0.35,0.2]].forEach(([dx,dz]) =>
    place(mkBox(0.04, 0.44, 0.04, M.chrome), -5.0+dx, 0.22, -0.3+dz));
  // Magazine / tablet on table
  place(mkBox(0.28, 0.02, 0.20, new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.9 })), -5.1, 0.49, -0.3);
}

// Filing cabinet — NE corner (x=6.6, z=7, away from all windows)
{
  place(mkBox(0.48, 1.10, 0.52, M.panelGrey), 6.6, 0.55, 7.0);
  addCol(6.6, 0.55, 7.0, 0.48, 1.10, 0.52);
  [0.09, 0.45, 0.81].forEach(y => place(mkBox(0.36, 0.02, 0.04, M.chrome), 6.84, y, 7.0));
  // Small handle dots
  [0.09, 0.45, 0.81].forEach(y => place(mkBox(0.06, 0.02, 0.06, M.chrome), 6.85, y, 7.0));
}

// Tall bookshelf — NW corner
{
  place(mkBox(0.90, 1.85, 0.32, M.panelGrey), -6.5, 0.925, 6.8);
  addCol(-6.5, 0.925, 6.8, 0.90, 1.85, 0.32);
  // Shelf boards
  [0.38, 0.80, 1.22, 1.58].forEach(y =>
    place(mkBox(0.88, 0.03, 0.30, M.bench), -6.5, y, 6.8));
  // Books (coloured blocks)
  const bookC = [0xcc2200, 0x2244cc, 0x228822, 0xff8833, 0x8822cc, 0x228888];
  [0, 1, 2].forEach(shelf => {
    let bx = -6.88;
    bookC.forEach((clr, i) => {
      if (i < 4) place(mkBox(0.10, 0.22, 0.24, new THREE.MeshStandardMaterial({ color: clr, roughness: 0.9 })), bx + i * 0.12, 0.38 + shelf * 0.42 + 0.12, 6.8);
    });
  });
}

// Notice board — north wall (z=7.97)
{
  place(mkBox(2.2, 1.3, 0.03, new THREE.MeshStandardMaterial({ color: 0x7a5a1a, roughness: 0.9 })), -2.0, 2.2, 7.97);
  const noteC = [0xfffbe6, 0xe3f4ff, 0xffe8f4, 0xe8ffe8];
  [[-0.7,0.12],[0.1,-0.08],[0.65,0.18],[-0.2,-0.28]].forEach(([dx,dy],i) =>
    place(mkBox(0.36, 0.24, 0.02, new THREE.MeshBasicMaterial({ color: noteC[i] })), -2.0+dx, 2.2+dy, 7.96));
}

// Fire extinguisher — west wall at z=-1 (south of window range, safe)
place(mkCyl(0.07, 0.52, M.red, 12), -7.5, 0.26, -1.0);
place(mkCyl(0.04, 0.10, M.chrome, 10), -7.5, 0.58, -1.0);

// Small trash can — entrance corner
place(mkCyl(0.12, 0.28, M.panelGrey, 10), -6.9, 0.14, -1.5);

// ── WORKSHOP 1 (z = -18 to -2) ────────────────────────────────────────────────
workbench(-4, -7);  chair(-4, -6.1, true);
workbench( 4, -7);  chair( 4, -6.1, true);
workbench(-4, -13); chair(-4, -12.1, true);
workbench( 4, -13); chair( 4, -12.1, true);

// Wire spools on small shelf — east wall WS1 (moved away from z=-6 window)
{
  // Shelf bracket
  place(mkBox(0.06, 0.06, 0.9, M.panelGrey), 7.8, 0.55, -3);
  place(mkBox(0.9, 0.04, 0.9, M.panelGrey), 7.45, 0.58, -3);
  // Spools lying on shelf (rotation.x = PI/2 → flat ring)
  const sp1 = new THREE.Mesh(new THREE.TorusGeometry(.30, .09, 14, 22), M.yellow);
  sp1.rotation.x = Math.PI / 2; place(sp1, 7.3, 0.70, -2.7);
  const sp2 = new THREE.Mesh(new THREE.TorusGeometry(.26, .08, 14, 22), M.copper);
  sp2.rotation.x = Math.PI / 2; place(sp2, 7.3, 0.68, -3.3);
}

// PPE rack — west wall (moved away from z=-6 window)
{
  place(mkBox(0.04, 1.1, 1.4, new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.7 })), -7.88, 1.6, -9);
  [M.yellow, M.orange].forEach((mat, i) => {
    place(new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10, 0, Math.PI * 2, 0, Math.PI * .55), mat), -7.5, 2.2, -8.3 + i * 0.8);
  });
}

// Safety pinboard — east wall
{
  place(mkBox(0.04, 1.0, 1.5, new THREE.MeshStandardMaterial({ color: 0xaa8855, roughness: 0.9 })), 7.88, 1.8, -13);
  [0xffeedd, 0xddeeff, 0xeeffdd].forEach((clr, i) => {
    place(mkBox(0.045, 0.26, 0.32, new THREE.MeshBasicMaterial({ color: clr })), 7.88, 1.5 + (i % 2) * 0.38, -12.2 + i * 0.6);
  });
}

// ── WORKSHOP 2 (z = -32 to -18) ───────────────────────────────────────────────
workbench(-4, -22); chair(-4, -21.1, true);
workbench( 4, -22); chair( 4, -21.1, true);
workbench(-4, -28); chair(-4, -27.1, true);
workbench( 4, -28); chair( 4, -27.1, true);

// Tool cabinet — south wall
{
  const cab = mkBox(1.2, 1.6, 0.55, M.panelGrey);
  cab.position.set(-5.5, 0.8, -31.5); scene.add(cab);
  addCol(-5.5, 0.8, -31.5, 1.2, 1.6, 0.55);
  for (let i = 0; i < 4; i++) {
    place(mkBox(0.28, 0.04, 0.04, M.chrome), -5.5, 0.3 + i * 0.4, -31.22);
  }
}

// Schematic poster — south wall WS2
{
  place(mkBox(1.6, 1.1, 0.03, new THREE.MeshStandardMaterial({ color: 0x0a1f3a, roughness: 0.9 })), 4, 2.0, -31.97);
  place(mkBox(1.68, 1.18, 0.02, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })), 4, 2.0, -31.96);
  [0x44ff88, 0x3b82f6, 0xf59e0b].forEach((clr, i) => {
    place(mkBox(1.2, 0.01, 0.02, new THREE.MeshBasicMaterial({ color: clr })), 4, 1.7 + i * 0.28, -31.95);
  });
}

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

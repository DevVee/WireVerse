import * as THREE from 'three';
import { makeFloorTex, makeWallTex, makeCeilTex, makeMetalTex, makeConcrTex, makeFloorNorm, makeWallNorm, makeMetalNorm } from './textures.js';

// ── RENDERER ──────────────────────────────────────────────────────────────────
export const isMobile = navigator.maxTouchPoints > 0;
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: !isMobile,      // antialias on desktop (GPU headroom); off on mobile
  powerPreference: 'high-performance'
});
// Adaptive DPR: retina sharpness on desktop, fill-rate savings on mobile
renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = false; // shadows OFF — #1 perf gain

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a111a);
// Switch to exponential fog for cinematic physical light scattering
// Lighter fog on mobile — reduces overdraw per pixel, recovers ~3-5fps
scene.fog = new THREE.FogExp2(0x0a111a, isMobile ? 0.022 : 0.035); 

// PROCEDURAL IBL — skip on mobile (GPU-expensive; not worth it on mobile fill rate)
if (!isMobile) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0a111a);
  const envCeil = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 120), new THREE.MeshBasicMaterial({ color: 0x6699cc }));
  envCeil.position.set(0, 20, 0); envScene.add(envCeil);
  const envWarm = new THREE.Mesh(new THREE.BoxGeometry(2, 60, 2), new THREE.MeshBasicMaterial({ color: 0xffaa44 }));
  envWarm.position.set(18, 0, 10); envScene.add(envWarm);
  const envCtrl = new THREE.Mesh(new THREE.BoxGeometry(2, 60, 2), new THREE.MeshBasicMaterial({ color: 0x3355bb }));
  envCtrl.position.set(-18, 0, -10); envScene.add(envCtrl);
  const envFloor = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 120), new THREE.MeshBasicMaterial({ color: 0x0a1525 }));
  envFloor.position.set(0, -20, 0); envScene.add(envFloor);
  scene.environment = pmremGenerator.fromScene(envScene).texture;
  scene.environmentIntensity = 0.75;
  pmremGenerator.dispose();
} else {
  scene.environment = null; // No IBL on mobile — saves ~20-40% GPU on complex scenes
}

// Shorter draw distance on mobile — fewer objects rendered per frame
export const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, isMobile ? 65 : 120);
camera.position.set(0, 1.72, -15);

function _handleResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  if (window._composer) window._composer.setSize(w, h);
}
window.addEventListener('resize', _handleResize);
// Orientation change on mobile fires before the layout is updated — wait one frame
window.addEventListener('orientationchange', () => { setTimeout(_handleResize, 120); });

// ── POST-PROCESSING: selective bloom (desktop only) ──────────────────────────
// Emissive elements (LEDs, fluorescent tubes, screens) glow physically when bright.
// Uses dynamic import so any CDN/bundler failure degrades gracefully to standard render.
if (!isMobile) {
  Promise.all([
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
    import('three/examples/jsm/postprocessing/OutputPass.js'),
  ]).then(([{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }]) => {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // Threshold 0.82 → only pixels brighter than ~82% of max luminance bloom.
    // This targets emissive BasicMaterials + high-intensity emissive StandardMaterials.
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight),
      0.48,  // strength  — subtle, not blown-out
      0.38,  // radius    — tight glow, not wide smear
      0.80   // threshold — only emissives bloom
    ));
    composer.addPass(new OutputPass());
    window._composer = composer;
  }).catch(() => { /* postprocessing unavailable — standard renderer used */ });
}

// ── TEXTURES ──────────────────────────────────────────────────────────────────
const fT = makeFloorTex(); fT.repeat.set(8, 8);
const wT = makeWallTex(); wT.repeat.set(4, 2);
const cT = makeCeilTex(); cT.repeat.set(8, 8);
const mT = makeMetalTex(); mT.repeat.set(2, 2);
const kT = makeConcrTex(); kT.repeat.set(4, 2);

// ── NORMAL MAPS ──────────────────────────────────────────────────────────────
// Generated from height fields; adds surface micro-detail and light interaction depth.
const fN = makeFloorNorm(); fN.repeat.set(8, 8);
const wN = makeWallNorm(); wN.repeat.set(4, 2);
const mN = makeMetalNorm(); mN.repeat.set(2, 2);

// ── HEIGHT CONSTANTS ─────────────────────────────────────────────────────────
export const FLOOR1_Y = 0;
const H = 4.2;   // Ceiling height
const WT = 0.22; // Wall thickness

// ── MATERIALS (PBR) ───────────────────────────────────────────────────────────
const _nv2 = (x, y) => new THREE.Vector2(x, y); // shorthand

export const M = {
  // Surfaces — normal maps applied below after object construction
  floor:      new THREE.MeshStandardMaterial({ map: fT, roughness: 0.62, metalness: 0.06, envMapIntensity: 0.4 }),
  wall:       new THREE.MeshStandardMaterial({ map: wT, roughness: 0.85, metalness: 0.0,  envMapIntensity: 0.2 }),
  ceil:       new THREE.MeshStandardMaterial({ map: cT, roughness: 0.90, metalness: 0.0,  envMapIntensity: 0.15 }),
  concrete:   new THREE.MeshStandardMaterial({ map: kT, color: 0xaab2ba, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.15 }),
  // Doors / frames
  door:       new THREE.MeshStandardMaterial({ color: 0xb08050, roughness: 0.68, metalness: 0.10, envMapIntensity: 0.3 }),
  doorFrame:  new THREE.MeshStandardMaterial({ map: mT, color: 0x99aabb, roughness: 0.18, metalness: 0.92, envMapIntensity: 0.8 }),
  // Panels
  panel:      new THREE.MeshStandardMaterial({ color: 0x2a4a62, roughness: 0.52, metalness: 0.38, envMapIntensity: 0.5 }),
  panelGrey:  new THREE.MeshStandardMaterial({ map: mT, color: 0x6a7a88, roughness: 0.44, metalness: 0.48, envMapIntensity: 0.6 }),
  // Indicator lights
  yellow:     new THREE.MeshStandardMaterial({ color: 0xf0c060, emissive: new THREE.Color(0xf0c060), emissiveIntensity: 1.2, roughness: 0.45, metalness: 0.0 }),
  red:        new THREE.MeshStandardMaterial({ color: 0xdd4433, emissive: new THREE.Color(0xdd4433), emissiveIntensity: 1.4, roughness: 0.40, metalness: 0.0 }),
  green:      new THREE.MeshStandardMaterial({ color: 0x33dd66, emissive: new THREE.Color(0x33dd66), emissiveIntensity: 1.6, roughness: 0.40, metalness: 0.0 }),
  orange:     new THREE.MeshStandardMaterial({ color: 0xff8833, emissive: new THREE.Color(0xff8833), emissiveIntensity: 1.2, roughness: 0.45, metalness: 0.0 }),
  // Furniture / objects
  bench:      new THREE.MeshStandardMaterial({ color: 0x9a8065, roughness: 0.80, metalness: 0.0,  envMapIntensity: 0.2 }),
  black:      new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.75, metalness: 0.15, envMapIntensity: 0.3 }),
  // Metals — high envMapIntensity so they catch the IBL reflections
  chrome:     new THREE.MeshStandardMaterial({ map: mT, color: 0xccddef, roughness: 0.04, metalness: 1.0, envMapIntensity: 1.4 }),
  pipe:       new THREE.MeshStandardMaterial({ map: mT, color: 0x7a8fa0, roughness: 0.12, metalness: 0.96, envMapIntensity: 1.2 }),
  copper:     new THREE.MeshStandardMaterial({ color: 0xd97845, roughness: 0.18, metalness: 0.96, envMapIntensity: 1.2 }),
  stair:      new THREE.MeshStandardMaterial({ map: mT, color: 0x667788, roughness: 0.40, metalness: 0.70, envMapIntensity: 0.9 }),
  grating:    new THREE.MeshStandardMaterial({ map: mT, color: 0x556677, roughness: 0.36, metalness: 0.82, envMapIntensity: 1.0 }),
  handrail:   new THREE.MeshStandardMaterial({ map: mT, color: 0xaabbcc, roughness: 0.08, metalness: 0.96, envMapIntensity: 1.4 }),
  // Equipment
  generator:  new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.48, metalness: 0.62, envMapIntensity: 0.6 }),
  serverRack: new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 0.28, metalness: 0.82, envMapIntensity: 0.8 }),
  // Unlit / emissive (MeshBasicMaterial — always at full brightness, no light calc)
  eWhite:     new THREE.MeshBasicMaterial({ color: 0xfff8e0 }),
  eBlue:      new THREE.MeshBasicMaterial({ color: 0x3388ff }),
  eGreen:     new THREE.MeshBasicMaterial({ color: 0x22ff88 }),
  eRed:       new THREE.MeshBasicMaterial({ color: 0xff3322 }),
  eYellow:    new THREE.MeshBasicMaterial({ color: 0xffee00 }),
  serverLed:  new THREE.MeshBasicMaterial({ color: 0x00ff88 }),
  signYellow: new THREE.MeshBasicMaterial({ color: 0xffe000 }),
  signBlack:  new THREE.MeshBasicMaterial({ color: 0x111111 }),
  // Glass / transparent
  window:     new THREE.MeshStandardMaterial({ color: 0x9ad0f5, transparent: true, opacity: 0.28, roughness: 0.0, metalness: 0.12, envMapIntensity: 0.9, side: THREE.DoubleSide }),
  winFrame:   new THREE.MeshStandardMaterial({ color: 0xeeeeec, roughness: 0.45, metalness: 0.25, envMapIntensity: 0.5 }),
  glassFloor: new THREE.MeshStandardMaterial({ color: 0x4488aa, transparent: true, opacity: 0.28, roughness: 0.0, metalness: 0.22, envMapIntensity: 0.9, side: THREE.DoubleSide }),
};

// Apply normal maps — dramatically improves surface depth/realism with minimal perf cost
M.floor.normalMap     = fN; M.floor.normalScale     = _nv2(1.6, 1.6);
M.wall.normalMap      = wN; M.wall.normalScale      = _nv2(2.2, 2.2);
M.concrete.normalMap  = wN; M.concrete.normalScale  = _nv2(1.4, 1.4);
M.doorFrame.normalMap = mN; M.doorFrame.normalScale = _nv2(0.8, 0.8);
M.panelGrey.normalMap = mN; M.panelGrey.normalScale = _nv2(0.6, 0.6);
M.chrome.normalMap    = mN; M.chrome.normalScale    = _nv2(0.5, 0.5);
M.pipe.normalMap      = mN; M.pipe.normalScale      = _nv2(0.7, 0.7);
M.stair.normalMap     = mN; M.stair.normalScale     = _nv2(0.8, 0.8);
M.grating.normalMap   = mN; M.grating.normalScale   = _nv2(0.9, 0.9);
M.handrail.normalMap  = mN; M.handrail.normalScale  = _nv2(0.5, 0.5);
M.panel.normalMap     = mN; M.panel.normalScale     = _nv2(0.4, 0.4);

// ── MOBILE MATERIAL DOWNGRADE ─────────────────────────────────────────────────
// Removes normal maps and zeroes envMap intensity on all PBR materials.
// Cuts per-pixel texture sampling by ~30-40%, reduces shader complexity.
if (isMobile) {
  Object.values(M).forEach(mat => {
    if (mat.isMeshStandardMaterial) {
      mat.normalMap       = null;
      mat.envMapIntensity = 0;
      mat.metalness       = Math.min(mat.metalness, 0.3); // cap specular contribution
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
// Pre-allocated — no per-frame GC allocation
const _pb    = new THREE.Box3();
const _pbMin = new THREE.Vector3();
const _pbMax = new THREE.Vector3();
export function checkCol(pos) {
  _pbMin.set(pos.x - .32, pos.y - 1.65, pos.z - .32);
  _pbMax.set(pos.x + .32, pos.y + .12,  pos.z + .32);
  _pb.set(_pbMin, _pbMax);
  return colBoxes.some(b => b.intersectsBox(_pb));
}

// ── LIGHTING ──────────────────────────────────────────────────────────────────
export const roomLightSets = {};
// Ambient: subtle cool base so shadows never go pure black
export const ambLight = new THREE.AmbientLight(0x334466, 0.28);
scene.add(ambLight);
// Hemisphere: cool industrial sky, very dark floor bounce — creates depth
scene.add(new THREE.HemisphereLight(0x5577aa, 0x08111e, 0.55));

// Directional fill light — simulates ambient daylight leaking through structure
const sunLight = new THREE.DirectionalLight(0xaaccee, 0.35);
sunLight.position.set(30, 45, -20);
scene.add(sunLight);

export const warnLight = new THREE.PointLight(0xff2200, 0, 20);
warnLight.position.set(0, 3.5, -15);
scene.add(warnLight);

export function mkLight(x, y, z, color, intensity, key) {
  // SpotLight aimed straight down — shorter range on mobile reduces light overdraw
  const _range = isMobile ? 12 : 18;
  const spot = new THREE.SpotLight(color || 0x88ccff, intensity * (isMobile ? 1.4 : 1.1), _range, Math.PI / 4.2, 0.32, 2.0);
  spot.position.set(x, y, z);
  // Target directly below fixture at floor level
  spot.target.position.set(x, 0, z);
  scene.add(spot);
  scene.add(spot.target);

  // Fluorescent tube fixture visuals (unchanged — low poly)
  const fixtureBase = mkBox(0.18, 0.06, 1.6, M.panelGrey);
  fixtureBase.position.set(x, y + 0.06, z);
  scene.add(fixtureBase);

  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6),
    M.eWhite
  );
  tube.rotation.z = Math.PI / 2;
  tube.position.set(x, y, z);
  scene.add(tube);

  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), M.eWhite);
  disc.rotation.x = Math.PI / 2;
  disc.position.set(x, y - 0.04, z);
  scene.add(disc);

  if (key) {
    if (!roomLightSets[key]) roomLightSets[key] = [];
    roomLightSets[key].push(spot);
  }
  return spot;
}

// ── FLOOR & CEILING ───────────────────────────────────────────────────────────
function mkRoom(cx, cz, w, d, floorY = 0, ceilY = H, noCeil = false) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.floor);
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(cx, floorY, cz);
  fl.userData.walkable = true;
  scene.add(fl);

  // Solid floor collision slab — prevents falling through
  addCol(cx, floorY - 0.1, cz, w, 0.2, d);

  if (!noCeil) {
    const cl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.ceil);
    cl.rotation.x = Math.PI / 2;
    cl.position.set(cx, ceilY, cz);
    scene.add(cl);
  }
}

function mkWall(x, y, z, w, h, d, mat, noCol = false) {
  const m = mkBox(w, h, d, mat || M.wall);
  m.position.set(x, y, z);
  scene.add(m);
  if (!noCol) addCol(x, y, z, w, h, d);
  return m;
}

// Wall with door opening
function seg(mn, mx, mid, dw) {
  const d0 = mid - dw / 2, d1 = mid + dw / 2, s = [];
  if (d0 > mn) s.push([mn, d0, false]);
  s.push([d0, d1, true]);
  if (d1 < mx) s.push([d1, mx, false]);
  return s;
}

function wallDoor(coord, a, b, doorMid, doorW, isX, mat, floorY = 0) {
  seg(a, b, doorMid, doorW).forEach(([sa, sb, isDoor]) => {
    const len = sb - sa, mid = (sa + sb) / 2;
    const fy = floorY + H / 2;
    const topH = H - 2.4;
    const topY = floorY + 2.4 + topH / 2;

    if (isX) {
      if (isDoor) {
        const lt = mkBox(WT, topH, len, mat || M.wall);
        lt.position.set(coord, topY, mid);
        scene.add(lt);
        addCol(coord, topY, mid, WT, topH, len); // lintel collision
      } else {
        const wl = mkBox(WT, H, len, mat || M.wall);
        wl.position.set(coord, fy, mid);
        scene.add(wl);
        addCol(coord, fy, mid, WT, H, len);
      }
    } else {
      if (isDoor) {
        const lt = mkBox(len, topH, WT, mat || M.wall);
        lt.position.set(mid, topY, coord);
        scene.add(lt);
        addCol(mid, topY, coord, len, topH, WT); // lintel collision
      } else {
        const wl = mkBox(len, H, WT, mat || M.wall);
        wl.position.set(mid, fy, coord);
        scene.add(wl);
        addCol(mid, fy, coord, len, H, WT);
      }
    }
  });
}

// ── PILLARS ───────────────────────────────────────────────────────────────────
function pillar(x, z, floorY = 0) {
  const h = H;
  const p = mkBox(.5, h, .5, M.concrete);
  p.position.set(x, floorY + h / 2, z);
  scene.add(p);
  addCol(x, floorY + h / 2, z, .5, h, .5);
  place(mkBox(.65, .1, .65, M.winFrame), x, floorY + 0.05, z);
  place(mkBox(.65, .1, .65, M.winFrame), x, floorY + h - 0.05, z);
}

// ── WINDOWS ───────────────────────────────────────────────────────────────────
function addWindow(x, y, z, w, h, isVertical) {
  const wg = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.window);
  wg.position.set(x, y, z);
  if (isVertical) wg.rotation.y = Math.PI / 2;
  scene.add(wg);

  const t = 0.08;
  if (isVertical) {
    place(mkBox(.2, t, w, M.winFrame), x, y + h / 2 + t / 2, z);
    place(mkBox(.2, t, w, M.winFrame), x, y - h / 2 - t / 2, z);
    place(mkBox(.2, h, t, M.winFrame), x, y, z - w / 2 - t / 2);
    place(mkBox(.2, h, t, M.winFrame), x, y, z + w / 2 + t / 2);
  } else {
    place(mkBox(w, t, .2, M.winFrame), x, y + h / 2 + t / 2, z);
    place(mkBox(w, t, .2, M.winFrame), x, y - h / 2 - t / 2, z);
    place(mkBox(t, h, .2, M.winFrame), x - w / 2 - t / 2, y, z);
    place(mkBox(t, h, .2, M.winFrame), x + w / 2 + t / 2, y, z);
  }
  // Window ambient light removed — too many small PointLights tank GPU
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOOR 1 LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
// ENTRANCE:       x=-2 to 4,   z=-28 to -20   (6w × 8d)
// MAIN CORRIDOR:  x=-2 to 4,   z=-20 to 26    (6w × 46d)
// WORKSHOP:       x=4  to 26,  z=-20 to 0     (22w × 20d)
// GENERATOR ROOM: x=4  to 20,  z=0  to 14     (16w × 14d)
// CONTROL CENTER: x=20 to 34,  z=-8 to 10     (14w × 18d)
// DIST A:         x=-14 to -2, z=-12 to 2     (12w × 14d)
// DIST B:         x=-14 to -2, z=2  to 16     (12w × 14d)
// TESTING LAB:    x=20 to 34,  z=10 to 22     (14w × 12d)
// STORAGE:        x=-14 to -2, z=16 to 28     (12w × 12d)
// UTILITY:        x=4  to 16,  z=14 to 28     (12w × 14d)
// STAIRWELL:      x=4  to 10,  z=26 to 34     (6w × 8d) — goes to floor 2

// ── FLOOR 1: ROOMS ────────────────────────────────────────────────────────────
mkRoom(1, -24, 6, 8);        // Entrance
mkRoom(1, 3, 6, 46);        // Main corridor
mkRoom(15, -10, 22, 20);        // Workshop
mkRoom(12, 7, 16, 14);        // Generator room
mkRoom(27, 1, 14, 18);        // Control center
mkRoom(-8, -5, 12, 14);        // Distribution A
mkRoom(-8, 9, 12, 14);        // Distribution B
mkRoom(27, 16, 14, 12);        // Testing lab
mkRoom(-8, 22, 12, 12);        // Storage
mkRoom(12, 21, 16, 14);        // Utility
mkRoom(7, 30, 6, 8); // Stairwell alcove (no second floor)

// ── FLOOR 1: OUTER WALLS ─────────────────────────────────────────────────────
const OW = H; // outer wall height
const OMY = H / 2; // outer wall mid-Y

// Entrance
mkWall(1, OMY, -28.11, 6.22, OW, WT, M.concrete);   // N
mkWall(-2.11, OMY, -24, WT, OW, 8, M.concrete);      // W
mkWall(4.11, OMY, -24, WT, OW, 8, M.concrete);      // E

// West boundary (corridor + dist rooms)
mkWall(-14.11, OMY, 8, WT, OW, 40.22, M.concrete);

// East boundary (workshop + control)
mkWall(26.11, OMY, -14, WT, OW, 12.22, M.concrete);   // Workshop E
// Workshop/Control partition wall (sliced for Faculty door at z=1)
mkWall(20.11, OMY, -4.3, WT, OW, 7.6, M.wall);
mkWall(20.11, OMY, 8.3, WT, OW, 11.6, M.concrete);   // Gen E (partial, rest is control W)
mkWall(34.11, OMY, 7, WT, OW, 44.22, M.concrete);   // Control/Lab E

// North boundaries
mkWall(27, OMY, -8.11, 14.22, OW, WT, M.concrete);  // Control N
// Workshop N wall — blue training room aesthetic
const wsNorthWallMat = new THREE.MeshStandardMaterial({ color: 0x1a5276, roughness: 0.88, metalness: 0.0, envMapIntensity: 0.2 });
mkWall(15, OMY, -20.11, 22.22, OW, WT, wsNorthWallMat);  // Workshop N
mkWall(-8, OMY, -12.11, 12.22, OW, WT, M.concrete);  // Dist A N

// South boundaries
mkWall(27, OMY, 22.11, 14.22, OW, WT, M.concrete);  // Lab S
mkWall(12, OMY, 28.11, 16.22, OW, WT, M.concrete);  // Utility S (stairwell cuts through)
mkWall(-8, OMY, 28.11, 12.22, OW, WT, M.concrete);  // Storage S

// Stairwell outer
mkWall(7, OMY, 34.11, 6.22, OW, WT, M.concrete);  // Stairwell S
mkWall(4.11, OMY, 30, WT, OW, 8.22, M.concrete); // Stairwell W
mkWall(9.89, OMY, 30, WT, OW, 8.22, M.concrete); // Stairwell E

// ── MISSING WALLS (plugs open gaps in the map) ───────────────────────────────
// Workshop east wall lower section (x=26, z=-8 to z=0)
mkWall(26.11, OMY, -4, WT, OW, 8.22, M.concrete);
// Workshop south wall eastern section (z=0, x=20 to x=26)
mkWall(23, OMY, 0.11, 6.22, OW, WT, M.concrete);
// Lab west wall upper section (x=20, z=10 to z=14)
mkWall(20.11, OMY, 12, WT, OW, 4.22, M.concrete);
// Storage east wall (x=-2, z=16 to z=28) — separates storage from corridor south
mkWall(-2.11, OMY, 22, WT, OW, 12.22, M.wall);

// ── FLOOR 1: INNER WALLS WITH DOORS ──────────────────────────────────────────
// Entrance / Corridor (z=-20)
wallDoor(-20, -2, 4, 1, 1.5, false);

// Corridor / Workshop (x=4)
wallDoor(4, -20, 0, -10, 1.5, true);

// Corridor / Generator Room (x=4)
wallDoor(4, 0, 14, 7, 1.5, true);

// Corridor / Distribution A (x=-2)
wallDoor(-2, -12, 2, -5, 1.5, true);

// Seal Corridor gap (x=-2, z=-20 to z=-12)
mkWall(-2.11, OMY, -16, WT, OW, 8, M.wall);

// Corridor / Distribution B (x=-2)
wallDoor(-2, 2, 16, 9, 1.5, true);

// Generator / Control Center (x=20)
wallDoor(20, -8, 10, 1, 1.5, true);

// Control / Testing Lab (z=10)
wallDoor(10, 20, 34, 27, 1.5, false);

// Distribution B / Storage (z=16)
wallDoor(16, -14, -2, -8, 1.5, false);

// Utility East / Lab West partition
mkWall(20.11, OMY, 21, WT, OW, 14.22, M.concrete);

// Generator / Utility Room (z=14)
wallDoor(14, 4, 20, 10, 1.5, false);

// Workshop south wall (z=0)
mkWall(12, OMY, 0.11, 16.22, OW, WT, M.wall);

// Distribution A/B divider (z=2)
mkWall(-8, OMY, 2, 12, OW, WT, M.wall);

// Utility west wall (x=4) above z=14
mkWall(4.11, OMY, 21, WT, OW, 14, M.wall);

// Stairwell door removed (dead end into utility room)
// wallDoor(28, 4, 10, 7, 2.0, false); 

// Stairwell — sealed back wall (no second floor)
mkWall(7, H / 2, 33.9, 6.22, H, WT, M.concrete);

// Corridor south wall (seals corridor at z=26)
mkWall(1, H / 2, 26.11, 6.22, H, WT, M.concrete);

// Control center north wall continuation (z=-8) west of x=20
mkWall(12, H / 2, -8.11, 16, H, WT, M.wall);

// ── FLOOR 1: PILLARS ─────────────────────────────────────────────────────────
[
  [4, -20], [4, 0], [-2, -12], [-2, 2], [-2, 16], [4, 14], [20, -8], [20, 10], [34, 10]
].forEach(([x, z]) => pillar(x, z));

// ── FLOOR 1: WINDOWS ─────────────────────────────────────────────────────────
addWindow(1, 2.4, -28.05, 4, 2, false);             // Entrance N
addWindow(-2.1, 2.4, -8, 3.5, 1.8, true);           // Corridor W
addWindow(4.1, 2.4, 12, 3.5, 1.8, true);            // Corridor E
addWindow(26.05, 2.4, -14, 4, 2, true);             // Workshop E
addWindow(26.05, 2.4, -6, 4, 2, true);             // Workshop E
addWindow(34.05, 2.4, -2, 4, 2, true);             // Control E
addWindow(34.05, 2.4, 6, 4, 2, true);             // Control E
addWindow(34.05, 2.4, 16, 4, 2, true);             // Lab E

// ── FLOOR 1: LIGHTING ────────────────────────────────────────────────────────
mkLight(1, H - .2, -24, 0xffeedd, 1.8, 'entrance');

// Corridor: every 14 units instead of 7 (halves light count, boost intensity)
for (let z = -17; z <= 24; z += 14) mkLight(1, H - .2, z, 0x11aaff, 5.0, 'corridor');

// Workshop: skip every other row to cut from 9 lights to 4
for (let x = 9; x <= 23; x += 14) {
  for (let z = -17; z <= -3; z += 14) {
    mkLight(x, H - .2, z, 0xd0f0ff, 9.0, 'workshop');
  }
}

mkLight(8, H - .2, 7, 0xffeecc, 4.0, 'generator');
mkLight(15, H - .2, 7, 0xffeecc, 3.8, 'generator');

mkLight(23, H - .2, -2, 0xaaccff, 4.0, 'control');
mkLight(29, H - .2, -2, 0xaaccff, 3.8, 'control');
mkLight(26, H - .2, 6, 0xaaccff, 3.5, 'control');

mkLight(-8, H - .2, -5, 0xffeedd, 3.5, 'distA');
mkLight(-8, H - .2, 9, 0xffeedd, 3.5, 'distB');

mkLight(23, H - .2, 16, 0xffffff, 4.0, 'lab');
mkLight(29, H - .2, 16, 0xffffff, 3.8, 'lab');

mkLight(-8, H - .2, 22, 0xffddaa, 3.2, 'storage');

mkLight(10, H - .2, 21, 0xffeecc, 3.5, 'utility');
mkLight(7, H - .2, 30, 0xffeecc, 3.0, 'stairwell');

// ── FLOOR 1: SAFETY MARKINGS ─────────────────────────────────────────────────
function stripe(x1, z1, x2, z2, yOff = 0.002) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.12), M.yellow);
  s.rotation.x = -Math.PI / 2;
  s.rotation.z = Math.atan2(dz, dx);
  s.position.set((x1 + x2) / 2, yOff, (z1 + z2) / 2);
  scene.add(s);
}

// for (let z = -18; z <= 24; z += 4) stripe(-2, z, 4, z);
// for (let x = 6; x <= 18; x += 4) stripe(x, -20, x, 0);
// stripe(22, -20, 22, -8);
// stripe(4, 0, 4, 6.25);
// stripe(4, 7.75, 4, 14);



// ── FLOOR 1: CABLE TRAYS ─────────────────────────────────────────────────────
function cableTray(x1, z1, x2, z2, y = H - .5) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const t = mkBox(len, .08, .42, M.panelGrey);
  t.rotation.y = Math.atan2(dx, dz);
  t.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  scene.add(t);
  [-1, 1].forEach(s => {
    const r = mkBox(len, .1, .05, M.panelGrey);
    r.rotation.y = Math.atan2(dx, dz);
    const perp = new THREE.Vector3(-dz, 0, dx).normalize().multiplyScalar(s * .18);
    r.position.set((x1 + x2) / 2, y + .06, (z1 + z2) / 2);
    r.position.add(perp);
    scene.add(r);
  });
}

cableTray(-2, -17, 26, -17);
cableTray(4, -20, 4, 28);
cableTray(4, 7, 20, 7);
cableTray(-14, 3, -2, 3);

// ── CONDUIT PIPES ────────────────────────────────────────────────────────────
function conduit(x, z, len, ry = 0, y = 2.8) {
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, len, 12), M.pipe);
  pipe.rotation.z = Math.PI / 2;
  pipe.rotation.y = ry;
  pipe.position.set(x, y, z);
  scene.add(pipe);
}

conduit(4.2, 7, 5, 0, 3.5);
conduit(19.8, 7, 5, 0, 3.5);
for (let x = 7; x < 18; x += 5) conduit(x, 13.88, 3, Math.PI / 2, 3.3);

// ── JUNCTION BOXES ───────────────────────────────────────────────────────────
function junctionBox(x, y, z, ry = 0) {
  const b = mkBox(.22, .22, .14, M.panelGrey);
  b.position.set(x, y, z);
  b.rotation.y = ry;
  scene.add(b);
  const c = new THREE.Mesh(new THREE.CircleGeometry(.035, 12), M.chrome);
  c.rotation.y = ry + Math.PI / 2;
  c.position.set(x, y, z);
  scene.add(c);
}

[9, 15, 21].forEach(x => junctionBox(x, 2.0, -19.88, 0));

// ══════════════════════════════════════════════════════════════════════════════
// INTERACTABLES
// ══════════════════════════════════════════════════════════════════════════════
export const allInteractables = [];

// ── MOTOR CONTROL LAB STATE (DOL Starter) ─────────────────────────────────────
// 'generator' export retained for main.js compatibility — now represents the
// 3-phase induction motor in the Motor Control Lab.
export const generator = {
  running: false,
  rpm: 0,
  targetRpm: 0,
  load: 0,
  temp: 22,
  fuel: 100,
  group: new THREE.Group(),
  parts: {}
};

// ── MOTOR CONTROL LAB — DOL Starter Room (x=4-20, z=0-14) ────────────────────
function buildMotorControlLab() {
  // ── Wall-mounted DOL Starter Panel (east wall x≈19.88) ──────────────────
  const panelBg = mkBox(1.6, 2.0, 0.12, M.panel);
  panelBg.position.set(19.88, 1.0, 5);
  scene.add(panelBg);
  addCol(19.88, 1.0, 5, 0.16, 2.0, 1.6);

  const panelFace = mkBox(1.5, 1.88, 0.08, M.panelGrey);
  panelFace.position.set(19.84, 1.0, 5);
  scene.add(panelFace);

  const labelStrip = mkBox(1.4, 0.14, 0.02,
    new THREE.MeshBasicMaterial({ color: 0x002244 }));
  labelStrip.position.set(19.82, 2.0, 5);
  scene.add(labelStrip);

  // Contactor (blue-grey box)
  const contactorBody = mkBox(0.32, 0.42, 0.10,
    new THREE.MeshStandardMaterial({ color: 0x1a2235, roughness: 0.6, metalness: 0.5 }));
  contactorBody.position.set(19.82, 1.5, 4.7);
  scene.add(contactorBody);
  [-0.1, 0.1].forEach(dz => {
    const term = mkBox(0.04, 0.06, 0.04, M.chrome);
    term.position.set(19.79, 1.74, 4.7 + dz);
    scene.add(term);
  });

  // Overload Relay (brown-orange box below contactor)
  const olayBody = mkBox(0.28, 0.22, 0.09,
    new THREE.MeshStandardMaterial({ color: 0x7a3a00, roughness: 0.7, metalness: 0.3 }));
  olayBody.position.set(19.82, 1.08, 4.7);
  scene.add(olayBody);
  const olReset = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.03, 12), M.yellow);
  olReset.rotation.z = Math.PI / 2;
  olReset.position.set(19.78, 1.08, 4.75);
  scene.add(olReset);

  // Push-button station (separate box on panel)
  const pbStation = mkBox(0.28, 0.48, 0.09, M.panelGrey);
  pbStation.position.set(19.82, 0.72, 5.4);
  scene.add(pbStation);

  // START button (green)
  const startBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.044, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x00cc44, roughness: 0.4 })
  );
  startBtn.rotation.z = Math.PI / 2;
  startBtn.position.set(19.78, 0.82, 5.4);
  generator.parts.startBtn = startBtn;
  scene.add(startBtn);

  // STOP button (red mushroom — larger)
  const stopBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.055, 16),
    new THREE.MeshStandardMaterial({ color: 0xdd1111, roughness: 0.4 })
  );
  stopBtn.rotation.z = Math.PI / 2;
  stopBtn.position.set(19.78, 0.60, 5.4);
  scene.add(stopBtn);

  // Run indicator lamp (green LED)
  const runLampMat = new THREE.MeshBasicMaterial({ color: 0x002200 });
  const runLamp = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), runLampMat);
  runLamp.position.set(19.78, 0.96, 5.35);
  generator.parts.runLamp = runLamp;
  generator.parts.runLampMat = runLampMat;
  scene.add(runLamp);
  const runGlow = new THREE.PointLight(0x00ff44, 0, 1.8);
  runGlow.position.copy(runLamp.position);
  generator.parts.runGlow = runGlow;
  scene.add(runGlow);

  // Fault indicator lamp (red LED)
  const faultLampMat = new THREE.MeshBasicMaterial({ color: 0x220000 });
  const faultLamp = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), faultLampMat);
  faultLamp.position.set(19.78, 0.96, 5.47);
  generator.parts.faultLampMat = faultLampMat;
  scene.add(faultLamp);

  // ── 3-Phase Induction Motor (physical model at centre of room) ───────────
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x4455aa, roughness: 0.55, metalness: 0.3 });
  const motorBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.35, 24), motorMat);
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(12, 0.62, 9.5);
  scene.add(motorBody);
  generator.parts.flywheel = motorBody; // reused for spin animation

  // End caps
  [-0.7, 0.7].forEach(dx => {
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.51, 0.51, 0.09, 24),
      new THREE.MeshStandardMaterial({ color: 0x333366, roughness: 0.5, metalness: 0.5 })
    );
    cap.rotation.z = Math.PI / 2;
    cap.position.set(12 + dx, 0.62, 9.5);
    scene.add(cap);
  });

  // Drive shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.48, 12), M.chrome);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.set(12.9, 0.62, 9.5);
  scene.add(shaft);

  // Motor base plate
  const motorBase = mkBox(1.55, 0.07, 0.88,
    new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.8, metalness: 0.4 }));
  motorBase.position.set(12, 0.035, 9.5);
  scene.add(motorBase);
  addCol(12, 0.65, 9.5, 1.55, 1.35, 0.95);

  // Motor nameplate
  const nameplate = mkBox(0.015, 0.18, 0.30,
    new THREE.MeshBasicMaterial({ color: 0xccddff }));
  nameplate.position.set(12.52, 0.75, 9.5);
  scene.add(nameplate);

  // Terminal box on top
  const termBox = mkBox(0.24, 0.20, 0.26,
    new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.6, metalness: 0.5 }));
  termBox.position.set(11.5, 0.94, 9.5);
  scene.add(termBox);

  // Conduit from panel to motor
  const conduitPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, 8.8, 10), M.pipe);
  conduitPipe.rotation.z = Math.PI / 2;
  conduitPipe.position.set(15.5, 0.88, 5.0);
  scene.add(conduitPipe);

  // ── DOL Schematic board on north wall (z≈0.12) ─────────────────────────
  const schemBg = mkBox(2.6, 1.55, 0.05,
    new THREE.MeshStandardMaterial({ color: 0xf5f8ff, roughness: 0.8 }));
  schemBg.position.set(10, 2.1, 0.14);
  scene.add(schemBg);
  const schemFrame = mkBox(2.66, 1.61, 0.04,
    new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5 }));
  schemFrame.position.set(10, 2.1, 0.12);
  scene.add(schemFrame);

  // Schematic circuit lines (decorative DOL diagram)
  [0xcc2200, 0xcc2200, 0x2244cc, 0x228822].forEach((clr, i) => {
    const ln = mkBox(2.0, 0.013, 0.005, new THREE.MeshBasicMaterial({ color: clr }));
    ln.position.set(10, 1.62 + i * 0.24, 0.17);
    scene.add(ln);
  });

  // Interactive schematic proxy
  const schemProxy = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.55, 0.12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  schemProxy.position.set(10, 2.1, 0.14);
  scene.add(schemProxy);

  // ── Student workbenches for motor control tasks ──────────────────────────
  workbench(7,   4.5);  // Station 1 — DOL Wiring
  workbench(12,  4.5);  // Station 2 — Control Circuit
  workbench(17,  4.5);  // Station 3 — Fault Finding

  // Station label strips
  [[7, 'DOL WIRING'], [12, 'CONTROL CIRCUIT'], [17, 'FAULT FINDING']].forEach(([x, txt]) => {
    const bg = mkBox(1.55, 0.16, 0.04, new THREE.MeshBasicMaterial({ color: 0x001a44 }));
    bg.position.set(x, 2.52, 4.44);
    scene.add(bg);
    const strip = mkBox(1.42, 0.09, 0.045, new THREE.MeshBasicMaterial({ color: 0x0055cc }));
    strip.position.set(x, 2.52, 4.46);
    scene.add(strip);
  });
}
buildMotorControlLab();


export function updateGenerator(dt) {
  const g = generator;
  if (g.rpm !== g.targetRpm) {
    g.rpm += (g.targetRpm - g.rpm) * Math.min(1, dt * 0.6);
  }
  // Rotate motor shaft (flywheel part)
  if (g.parts.flywheel) {
    g.parts.flywheel.rotation.x += (g.rpm / 1500) * dt * Math.PI * 3;
  }
  if (g.running) {
    g.temp = Math.min(90, g.temp + dt * 1.5);
  } else {
    g.temp = Math.max(22, g.temp - dt * 1.2);
  }
  // Update run indicator lamp
  if (g.parts.runLampMat) {
    g.parts.runLampMat.color.setHex(g.running ? 0x00ff44 : 0x002200);
  }
  if (g.parts.runGlow) {
    g.parts.runGlow.intensity = g.running ? 1.4 : 0;
  }
}




// ── FACULTY / INSTRUCTOR ROOM (x=20-34, z=-8 to 10, centre≈27,1) ─────────────
// Replaces Control Center — TESDA instructor workspace
export const scadaTerminals = []; // stub kept for main.js compat

function buildFacultyRoom() {
  // ── Instructor Desk (facing students/whiteboard to the north) ────────────
  const FX = 27, FZ = 6.5;
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.75, metalness: 0.05 });
  const legMat  = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.6,  metalness: 0.8 });

  const dTop = mkBox(2.2, 0.06, 1.0, deskMat);
  dTop.position.set(FX, 0.78, FZ);
  scene.add(dTop);
  addCol(FX, 0.42, FZ, 2.2, 0.82, 1.0);

  const dFront = mkBox(2.2, 0.74, 0.04, legMat);
  dFront.position.set(FX, 0.39, FZ + 0.48);
  scene.add(dFront);
  [[-1.08, 0], [1.08, 0]].forEach(([dx]) => {
    const panel = mkBox(0.04, 0.78, 1.0, legMat);
    panel.position.set(FX + dx, 0.39, FZ);
    scene.add(panel);
  });

  // Monitor on instructor desk
  const mBezel = mkBox(0.78, 0.5, 0.055,
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.2 }));
  mBezel.position.set(FX, 1.26, FZ - 0.22);
  scene.add(mBezel);

  const instrScreenMat = new THREE.MeshStandardMaterial({
    color: 0x0a1f3a, emissive: new THREE.Color(0x153060), emissiveIntensity: 1.2,
    roughness: 0.1, metalness: 0.2
  });
  const instrScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42), instrScreenMat);
  instrScreen.position.set(FX, 1.26, FZ - 0.196);
  scene.add(instrScreen);

  const sGlow = new THREE.PointLight(0x2266ff, 0.7, 3.0);
  sGlow.position.set(FX, 1.2, FZ - 0.2);
  scene.add(sGlow);

  const instrProxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.5, 0.1),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  instrProxy.position.set(FX, 1.26, FZ - 0.2);
  instrProxy.userData = {
    type: 'computer', label: 'Instructor Terminal',
    compPos: new THREE.Vector3(FX, 1.10, FZ + 0.6),
    compRot: new THREE.Euler(-0.05, 0, 0, 'YXZ')
  };
  allInteractables.push(instrProxy);
  scene.add(instrProxy);

  // ── Whiteboard on north wall (z=-8) ─────────────────────────────────────
  // Moved to x=29 to fix overlapping the adjacent door/window geometry
  const wb = mkBox(3.2, 1.7, 0.045,
    new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.15 }));
  wb.position.set(29, 2.05, -7.96);
  scene.add(wb);
  const wbFrame = mkBox(3.28, 1.78, 0.03,
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 }));
  wbFrame.position.set(29, 2.05, -7.98);
  scene.add(wbFrame);
  const wbTray = mkBox(3.2, 0.06, 0.12,
    new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.3, metalness: 0.9 }));
  wbTray.position.set(29, 1.22, -7.92);
  scene.add(wbTray);
  // Teaching diagram lines on whiteboard
  [0x1122aa, 0xaa2200, 0x228822, 0x222222].forEach((clr, i) => {
    const wbLine = mkBox(2.4, 0.013, 0.005, new THREE.MeshBasicMaterial({ color: clr }));
    wbLine.position.set(29, 1.6 + i * 0.27, -7.93);
    scene.add(wbLine);
  });
  const wbLight = new THREE.PointLight(0xfff5e0, 1.2, 5.5);
  wbLight.position.set(29, 3.6, -7.2);
  scene.add(wbLight);

  // ── Student consultation chairs (3 chairs facing whiteboard) ─────────────
  [22.5, 27, 31.5].forEach(cx => chair(cx, -4.5));

  // ── Notice / Bulletin Board (west wall x=20) ─────────────────────────────
  const noticeBoard = mkBox(0.045, 1.0, 1.8,
    new THREE.MeshStandardMaterial({ color: 0xaa8833, roughness: 0.9 }));
  noticeBoard.position.set(20.14, 1.65, -2);
  scene.add(noticeBoard);
  [0xffeedd, 0xddeeff, 0xeeffdd, 0xfffacc].forEach((clr, i) => {
    const paper = mkBox(0.046, 0.26, 0.34,
      new THREE.MeshBasicMaterial({ color: clr }));
    paper.position.set(20.14, 1.44 + (i % 2) * 0.36, -2.52 + i * 0.6);
    scene.add(paper);
  });

  // ── Bookshelf (east wall x≈33.8) ─────────────────────────────────────────
  const bsGroup = new THREE.Group();
  [0.5, 1.1, 1.7].forEach(y => {
    const shelf = mkBox(1.2, 0.055, 0.38, M.panelGrey);
    shelf.position.set(0, y, 0);
    bsGroup.add(shelf);
  });
  [0xcc2200, 0x2244cc, 0x228822, 0xddaa22, 0x883399, 0xcc6600].forEach((clr, i) => {
    const book = mkBox(0.08, 0.28, 0.24, new THREE.MeshLambertMaterial({ color: clr }));
    book.position.set(-0.46 + i * 0.165, 0.65, 0.06);
    bsGroup.add(book);
  });
  [0xcc2200, 0x2244cc, 0x228822].forEach((clr, i) => {
    const book2 = mkBox(0.08, 0.24, 0.24, new THREE.MeshLambertMaterial({ color: clr }));
    book2.position.set(-0.42 + i * 0.2, 1.24, 0.06);
    bsGroup.add(book2);
  });
  bsGroup.position.set(33.78, 0, 2);
  scene.add(bsGroup);
  addCol(33.78, 1.0, 2, 1.25, 2.0, 0.44);

  // ── Filing Cabinet ────────────────────────────────────────────────────────
  const fileCab = mkBox(0.55, 1.3, 0.56,
    new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.5, metalness: 0.6 }));
  fileCab.position.set(33.72, 0.65, -4);
  scene.add(fileCab);
  addCol(33.72, 0.65, -4, 0.55, 1.3, 0.56);
  [0, 1, 2].forEach(i => {
    const handle = mkBox(0.24, 0.04, 0.04, M.chrome);
    handle.position.set(33.44, 0.3 + i * 0.42, -4);
    scene.add(handle);
  });
}
buildFacultyRoom();

export function updateSCADA(dt, animT) {} // stub — SCADA removed, faculty room built


// ── WORKBENCHES ───────────────────────────────────────────────────────────────
function workbench(cx, cz) {
  place(mkBox(2.7, .07, 1.15, M.bench), cx, 0.965, cz);
  place(mkBox(2.7, .05, 1.0, M.panelGrey), cx, .5, cz);
  // Back rail
  place(mkBox(2.7, .55, .06, M.panelGrey), cx, 1.28, cz + .56);
  // Legs
  [[-1.25, -.52], [-1.25, .52], [1.25, -.52], [1.25, .52]].forEach(([dx, dz]) => {
    place(mkBox(.07, 1.0, .07, M.chrome), cx + dx, .5, cz + dz);
  });
  addCol(cx, .5, cz, 2.7, 1.0, 1.15);
}

// ── WORKSHOP — NORTH TRAINING ROW (z=-17) ─────────────────────────────────────
workbench(8.5, -17);  // Station A — Wire Colour ID
workbench(15, -17);   // Station B — DOL Motor Starter
workbench(21.5, -17); // Station C — Schematic Quiz

// ── WORKSHOP — CENTRE PRACTICE ROW (z=-11) ────────────────────────────────────
workbench(8.5, -11);  // Station D — Component Identifier
workbench(15, -11);   // Station E — Junction Box Task
workbench(21.5, -11); // Station F — Tool Calibration

// ══════════════════════════════════════════════════════════════════════════════
// UNIFIED TRAINING INTERACTION SYSTEM — Workshop Zone Objects
// Replaces isolated mini-game boards with real-world tool-based training objects.
// Zone A: Preparation  |  Zone B: Execution  |  Zone C: Diagnostic
// ══════════════════════════════════════════════════════════════════════════════

// ── EXPORTS for interaction engine (main.js) ──────────────────────────────────
export const wireObjects      = [];  // Wire state meshes on execution bench
export const scenarioTerminals = []; // Terminal block targets for wire connection
export const validationBoard  = { leds: [], allGreen: false }; // Lab LED board

// ── ZONE A: PEGBOARD TOOL RACK (north wall of workshop, z≈-19.88) ─────────────
{
  const pgW = 5.4, pgH = 1.8;
  const pgMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.9, metalness: 0.05 });
  const pboard = mkBox(pgW, pgH, 0.06, pgMat);
  pboard.position.set(11.5, 2.3, -19.88);
  scene.add(pboard);

  // Pegboard holes grid (decorative)
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x5a4010 });
  for (let px = 0; px < 10; px++) {
    for (let py = 0; py < 7; py++) {
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.038, 8), holeMat);
      hole.position.set(9.2 + px * 0.56, 1.55 + py * 0.22, -19.84);
      scene.add(hole);
    }
  }

  // Label strip above pegboard
  const labelBg = mkBox(pgW, 0.2, 0.04,
    new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
  labelBg.position.set(11.5, 3.26, -19.85);
  scene.add(labelBg);
  const labelInner = mkBox(pgW - 0.1, 0.14, 0.045,
    new THREE.MeshBasicMaterial({ color: 0x0a1520 }));
  labelInner.position.set(11.5, 3.26, -19.83);
  scene.add(labelInner);

  // Pegboard light bar
  const pLight = new THREE.PointLight(0xffeedd, 1.8, 5.5);
  pLight.position.set(11.5, 3.6, -18.8);
  scene.add(pLight);

  // ── Tool definitions on the rack ─────────────────────────────────────────
  const rackTools = [
    { id: 'wire_stripper',  label: 'Wire Stripper',  sym: '|--|', color: 0xcc2200, hx: 9.2  },
    { id: 'screwdriver',    label: 'Screwdriver',    sym: '[-]',  color: 0x2255bb, hx: 10.3 },
    { id: 'multimeter',     label: 'Multimeter',     sym: '[M]',  color: 0x991111, hx: 11.4 },
    { id: 'pliers',         label: 'Pliers',         sym: '(P)',  color: 0x557788, hx: 12.5 },
    { id: 'voltage_tester', label: 'Volt Tester',    sym: '(V)',  color: 0xff7700, hx: 13.6 },
  ];

  rackTools.forEach(({ id, label, color, hx }) => {
    const toolMat  = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2 });
    const handleMat= new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
    const hookMat  = new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.2, metalness: 0.95 });

    // Metal hook
    const hook = mkBox(0.06, 0.18, 0.1, hookMat);
    hook.position.set(hx, 3.04, -19.82);
    scene.add(hook);

    // Tool head (coloured body)
    const toolHead = mkBox(0.1, 0.38, 0.07, toolMat);
    toolHead.position.set(hx, 2.68, -19.82);
    scene.add(toolHead);

    // Tool handle (dark grip)
    const toolHandle = mkBox(0.08, 0.3, 0.07, handleMat);
    toolHandle.position.set(hx, 2.3, -19.82);
    scene.add(toolHandle);

    // Small label plate on tool
    const tLabel = mkBox(0.09, 0.06, 0.01,
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    tLabel.position.set(hx, 2.62, -19.78);
    scene.add(tLabel);

    // Invisible interaction proxy — picking up tool
    const proxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.72, 0.18),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.position.set(hx, 2.65, -19.82);
    scene.add(proxy);
  });
}

// ── ZONE B: WIRE STATE OBJECTS (execution bench at x=15, z=-11) ──────────────
{
  const BENCH_X = 15, BENCH_Z = -11;

  const WIRE_DEFS = [
    { id: 'L',  name: 'L (LINE)',    baseColor: 0x7a2e0e, strippedColor: 0xd4590a, connColor: 0x44aa22, offX: -0.44, offZ: -0.22 },
    { id: 'N',  name: 'N (NEUTRAL)', baseColor: 0x122077, strippedColor: 0x2255cc, connColor: 0x44aa22, offX:  0.0,  offZ: -0.16 },
    { id: 'PE', name: 'PE (EARTH)',  baseColor: 0x1a5a0a, strippedColor: 0x33aa11, connColor: 0x44aa22, offX:  0.44, offZ: -0.10 },
  ];

  WIRE_DEFS.forEach(({ id, name, baseColor, strippedColor, offX, offZ }) => {
    const wireMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8, metalness: 0.05 });

    // Insulated wire body
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.68, 10),
      wireMat
    );
    wire.rotation.z = Math.PI / 2;
    wire.rotation.y = 0.12;
    wire.position.set(BENCH_X + offX, 1.012, BENCH_Z + offZ);
    scene.add(wire);

    // Dark insulation tip (unstripped end indicator)
    const insMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const insEnd = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.1, 10),
      insMat
    );
    insEnd.rotation.z = Math.PI / 2;
    insEnd.position.set(BENCH_X + offX + 0.3, 1.012, BENCH_Z + offZ);
    scene.add(insEnd);

    // Tiny label tag
    const tagMat = new THREE.MeshBasicMaterial({
      color: id === 'L' ? 0xcc2200 : id === 'N' ? 0x2244cc : 0x228822
    });
    const tag = mkBox(0.1, 0.042, 0.006, tagMat);
    tag.position.set(BENCH_X + offX - 0.28, 1.025, BENCH_Z + offZ);
    scene.add(tag);

    // Invisible interaction proxy
    const proxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.1, 0.16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.position.set(BENCH_X + offX, 1.012, BENCH_Z + offZ);
    scene.add(proxy);
  });

  // Instruction clipboard on bench
  {
    const clipMat   = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.85, metalness: 0.3 });
    const paperMat  = new THREE.MeshStandardMaterial({ color: 0xf5eed8, roughness: 0.95 });
    const clipBoard = mkBox(0.46, 0.58, 0.03, clipMat);
    clipBoard.position.set(BENCH_X + 0.82, 1.005, BENCH_Z - 0.12);
    clipBoard.rotation.x = -Math.PI / 2;
    clipBoard.rotation.z = -0.18;
    scene.add(clipBoard);
    const paper = mkBox(0.40, 0.52, 0.008, paperMat);
    paper.position.set(BENCH_X + 0.82, 1.009, BENCH_Z - 0.12);
    paper.rotation.x = -Math.PI / 2;
    paper.rotation.z = -0.18;
    scene.add(paper);
    // Circuit diagram lines on paper
    const lineMats = [
      new THREE.MeshBasicMaterial({ color: 0xcc2200 }), // L
      new THREE.MeshBasicMaterial({ color: 0x2244cc }), // N
      new THREE.MeshBasicMaterial({ color: 0x228822 }), // PE
    ];
    lineMats.forEach((lm, i) => {
      const ln = mkBox(0.32, 0.006, 0.004, lm);
      ln.position.set(BENCH_X + 0.82, 1.013, BENCH_Z - 0.02 + i * 0.14);
      ln.rotation.x = -Math.PI / 2;
      ln.rotation.z = -0.18;
      scene.add(ln);
    });
    // Proxy for schematic view
    const clipProxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.1, 0.62),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    clipProxy.position.set(BENCH_X + 0.82, 1.01, BENCH_Z - 0.12);
    scene.add(clipProxy);
  }
}

// ── ZONE B: SCENARIO TERMINAL BLOCK LABELS on cable stations ─────────────────
{
  // The three cable stations at x=15.4, z=-3/-8/-13 become the wiring targets.
  // Add colour-coded label boards and invisible interaction overlays.
  const TERM_DEFS = [
    { termId: 'L',  x: 15.4, z: -3,  color: 0x9a2010 },
    { termId: 'N',  x: 15.4, z: -8,  color: 0x1a2a99 },
    { termId: 'PE', x: 15.4, z: -13, color: 0x1a7a22 },
  ];

  TERM_DEFS.forEach(({ termId, x, z, color }) => {
    // Label board above station
    const lbBg = mkBox(0.32, 0.22, 0.04,
      new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.5, metalness: 0.3 }));
    lbBg.position.set(x, 2.28, z + 0.05);
    scene.add(lbBg);

    const lbColor = mkBox(0.24, 0.14, 0.02,
      new THREE.MeshBasicMaterial({ color }));
    lbColor.position.set(x, 2.28, z + 0.07);
    scene.add(lbColor);

    // Connecting wire placeholder (thin rod, grey = unconnected)
    const wirePlaceholderMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 });
    const wirePlaceholder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8),
      wirePlaceholderMat
    );
    wirePlaceholder.rotation.z = Math.PI / 2;
    wirePlaceholder.position.set(x, 1.62, z + 0.08);
    scene.add(wirePlaceholder);

    // Invisible terminal interaction proxy
    const proxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.88, 0.42),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.position.set(x, 1.44, z);
    scene.add(proxy);
  });
}

// ── ZONE C: VALIDATION LED BOARD (testing lab) ────────────────────────────────
{
  const BX = 25.5, BY = 0, BZ = 13.5;

  // Board enclosure
  const boardEncl = mkBox(1.3, 0.95, 0.14,
    new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.5, metalness: 0.35 }));
  boardEncl.position.set(BX, BY + 1.7, BZ - 0.3);
  scene.add(boardEncl);
  addCol(BX, BY + 1.7, BZ - 0.3, 1.3, 0.95, 0.14);

  // Board face trim
  const boardFace = mkBox(1.24, 0.88, 0.08,
    new THREE.MeshStandardMaterial({ color: 0x0e2235, roughness: 0.4, metalness: 0.2 }));
  boardFace.position.set(BX, BY + 1.7, BZ - 0.23);
  scene.add(boardFace);

  // Board title strip
  const titleStrip = mkBox(1.18, 0.14, 0.01,
    new THREE.MeshBasicMaterial({ color: 0x003366 }));
  titleStrip.position.set(BX, BY + 2.1, BZ - 0.19);
  scene.add(titleStrip);

  // Three check indicators: CONTINUITY / VOLTAGE / GROUND
  const checkDefs = [
    { label: 'CONT', checkId: 'continuity', dx: -0.36 },
    { label: 'VOLT', checkId: 'voltage',    dx:  0.0  },
    { label: 'GND',  checkId: 'ground',     dx:  0.36 },
  ];

  checkDefs.forEach(({ checkId, dx }) => {
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x220000 }); // off
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), ledMat);
    led.position.set(BX + dx, BY + 1.8, BZ - 0.19);
    scene.add(led);

    const glow = new THREE.PointLight(0x001100, 0, 1.8);
    glow.position.copy(led.position);
    scene.add(glow);
  });

  // VALIDATE button (big blue press)
  const valBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.06, 18),
    M.eBlue
  );
  valBtn.rotation.x = Math.PI / 2;
  valBtn.position.set(BX, BY + 1.48, BZ - 0.19);
  scene.add(valBtn);

  // Safety label for the board
  const safetyLbl = mkBox(1.18, 0.12, 0.01,
    new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
  safetyLbl.position.set(BX, BY + 1.3, BZ - 0.19);
  scene.add(safetyLbl);
}

// Assessment Room benches
workbench(22, 12); workbench(28, 12);
workbench(22, 18); workbench(28, 18);

// ════════════════════════════════════════════════════════════════════════════
// CLASSROOM — TESDA Theory Room  (Utility Room footprint x=4–16, z=14–28)
// Students read module lessons here BEFORE going to the Wiring/Motor labs.
// ════════════════════════════════════════════════════════════════════════════
{
  // ── Whiteboard (north wall z=14) ─────────────────────────────────────────
  const cwb = mkBox(3.8, 1.9, 0.045,
    new THREE.MeshStandardMaterial({ color: 0xf8f8ff, roughness: 0.12 }));
  cwb.position.set(9, 2.15, 14.12);
  scene.add(cwb);
  const cwbFrame = mkBox(3.88, 1.98, 0.03,
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 }));
  cwbFrame.position.set(9, 2.15, 14.10);
  scene.add(cwbFrame);
  const cwbTray = mkBox(3.8, 0.07, 0.14,
    new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.3, metalness: 0.9 }));
  cwbTray.position.set(9, 1.24, 14.14);
  scene.add(cwbTray);

  // ── Whiteboard interactable proxy ────────────────────────────────────────
  {
    const wbProxy = mkBox(3.8, 1.9, 0.15,
      new THREE.MeshBasicMaterial({ visible: false }));
    wbProxy.position.set(9, 2.15, 14.22);
    scene.add(wbProxy);
  }

  // Electrical diagram lines on whiteboard (decorative schematic)
  [0xcc2200, 0x2244cc, 0x228822, 0x222222, 0xdd8800].forEach((clr, i) => {
    const dLine = mkBox(3.0, 0.014, 0.005,
      new THREE.MeshBasicMaterial({ color: clr }));
    dLine.position.set(9, 1.56 + i * 0.25, 14.15);
    scene.add(dLine);
  });

  // Whiteboard overhead light
  const cwbLight = new THREE.PointLight(0xfff8e0, 1.6, 6.0);
  cwbLight.position.set(9, H - 0.15, 14.8);
  scene.add(cwbLight);

  // ── Ceiling Projector ────────────────────────────────────────────────────
  const projBody = mkBox(0.4, 0.13, 0.58,
    new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.5, metalness: 0.5 }));
  projBody.position.set(9, H - 0.07, 17.5);
  scene.add(projBody);
  const projLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.07, 0.14, 12),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.05, metalness: 0.9 })
  );
  projLens.rotation.x = Math.PI / 2;
  projLens.position.set(9, H - 0.13, 16.96);
  scene.add(projLens);
  // Projector beam (spotlight onto whiteboard)
  const projSpot = new THREE.SpotLight(0xfff5e0, 1.2, 8.0, Math.PI / 9, 0.35);
  projSpot.position.set(9, H - 0.15, 17.0);
  projSpot.target.position.set(9, 1.5, 14.12);
  scene.add(projSpot);
  scene.add(projSpot.target);

  // ── Instructor Podium (between whiteboard and first desk row) ─────────────
  const podium = mkBox(0.7, 1.12, 0.52,
    new THREE.MeshStandardMaterial({ color: 0x6a4a22, roughness: 0.8, metalness: 0.05 }));
  podium.position.set(9, 0.56, 15.9);
  scene.add(podium);
  addCol(9, 0.56, 15.9, 0.7, 1.12, 0.52);
  const podTop = mkBox(0.74, 0.045, 0.56,
    new THREE.MeshStandardMaterial({ color: 0xb5813a, roughness: 0.7 }));
  podTop.position.set(9, 1.14, 15.9);
  scene.add(podTop);
  // Lesson book on podium
  const lBook = mkBox(0.27, 0.032, 0.38,
    new THREE.MeshLambertMaterial({ color: 0xfff0dd }));
  lBook.position.set(9.08, 1.17, 15.78);
  lBook.rotation.y = 0.08;
  scene.add(lBook);

  // ── Student Desks — 3 rows × 3 columns ───────────────────────────────────
  const sDeskMat = new THREE.MeshStandardMaterial({ color: 0xb5813a, roughness: 0.75 });
  const sLegMat  = new THREE.MeshStandardMaterial({ color: 0xaabbcc, roughness: 0.3, metalness: 0.9 });
  const sSeatMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.7 });

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const sx = 5.6 + col * 3.2;
      const sz = 18.5 + row * 3.0;

      // Desk top
      const dt = mkBox(0.78, 0.036, 0.58, sDeskMat);
      dt.position.set(sx, 0.72, sz);
      scene.add(dt);

      // Desk legs
      [[-0.34,-0.24],[0.34,-0.24],[-0.34,0.24],[0.34,0.24]].forEach(([dx,dz]) => {
        const lg = mkBox(0.03, 0.72, 0.03, sLegMat);
        lg.position.set(sx+dx, 0.36, sz+dz);
        scene.add(lg);
      });
      addCol(sx, 0.38, sz, 0.78, 0.76, 0.58);

      // Chair seat
      const cs = mkBox(0.4, 0.048, 0.4, sSeatMat);
      cs.position.set(sx, 0.46, sz + 0.52);
      scene.add(cs);
      // Chair back
      const cb = mkBox(0.4, 0.42, 0.045, sSeatMat);
      cb.position.set(sx, 0.70, sz + 0.72);
      scene.add(cb);
      // Chair legs
      [[-0.17,0.32],[0.17,0.32],[-0.17,0.68],[0.17,0.68]].forEach(([dx,dz]) => {
        const cl = mkBox(0.028, 0.46, 0.028, sLegMat);
        cl.position.set(sx+dx, 0.23, sz+dz);
        scene.add(cl);
      });

      // Notebook on each desk
      const nb = mkBox(0.22, 0.018, 0.3,
        new THREE.MeshLambertMaterial({ color: [0xffeedd,0xddeeff,0xeeffdd][col] }));
      nb.position.set(sx - 0.06, 0.74, sz - 0.05);
      nb.rotation.y = (Math.random() - 0.5) * 0.3;
      scene.add(nb);
    }
  }

  // ── Module Reference Shelf (east wall x≈15.8) ─────────────────────────────
  const msGroup = new THREE.Group();
  [0.44, 1.0].forEach(y => {
    const sh = mkBox(1.6, 0.055, 0.34, M.panelGrey);
    sh.position.set(0, y, 0);
    msGroup.add(sh);
  });
  [0xcc3300, 0x2244cc, 0x228833, 0xddaa00, 0x993399, 0xbb6600, 0x55aacc].forEach((clr, i) => {
    const mod = mkBox(0.068, 0.4, 0.26, new THREE.MeshLambertMaterial({ color: clr }));
    mod.position.set(-0.68 + i * 0.218, 0.68, 0.04);
    msGroup.add(mod);
  });
  msGroup.position.set(15.78, 0, 22);
  scene.add(msGroup);
  addCol(15.78, 1.0, 22, 1.65, 2.05, 0.38);

  // ── Safety Poster frame (south side, z≈27.9) ──────────────────────────────
  const poster = mkBox(0.04, 1.1, 1.55,
    new THREE.MeshStandardMaterial({ color: 0xaa8833, roughness: 0.85 }));
  poster.position.set(4.14, 1.65, 25);
  scene.add(poster);
  const posterPaper = mkBox(0.045, 0.9, 1.35,
    new THREE.MeshBasicMaterial({ color: 0xffeecc }));
  posterPaper.position.set(4.14, 1.65, 25);
  scene.add(posterPaper);
}



// ── SHELVING ─────────────────────────────────────────────────────────────────
function addShelf(cx, cz, ry = 0) {
  const g = new THREE.Group();
  [.52, 1.2, 1.88].forEach(y => {
    const s = mkBox(2.1, .07, .58, M.panelGrey);
    s.position.set(0, y, 0);
    g.add(s);
  });
  [[-1.0, -.26], [1.0, -.26], [-1.0, .26], [1.0, .26]].forEach(([dx, dz]) => {
    const p = mkBox(.07, 2.05, .07, M.panelGrey);
    p.position.set(dx, 1.025, dz);
    g.add(p);
  });
  g.position.set(cx, 0, cz);
  g.rotation.y = ry;
  scene.add(g);
  addCol(cx, 1.025, cz, 2.15, 2.05, .64);
}

addShelf(-12, 17); addShelf(-12, 21);
addShelf(-4, 17); addShelf(-4, 21);
// ── SERVER RACKS (Workshop east zone, free-standing) ─────────────────────────
{
  function buildServerRack(cx, cz, rackId, label) {
    const g = new THREE.Group();

    // Main chassis
    const chassis = mkBox(0.65, 2.0, 0.88, M.serverRack);
    chassis.position.set(0, 1.0, 0);
    g.add(chassis);

    // Front bezel (south-facing, +z side)
    const bezel = mkBox(0.63, 1.96, 0.04, M.panelGrey);
    bezel.position.set(0, 1.0, 0.46);
    g.add(bezel);

    // 7 server units with LEDs — pre-set 2 faults per rack
    const faultIdxA = rackId === 'server-1' ? [2, 5] : [1, 4];
    for (let u = 0; u < 7; u++) {
      const unit = mkBox(0.58, 0.055, 0.26, M.black);
      unit.position.set(0, 1.82 - u * 0.13, 0.32);
      g.add(unit);

      const isFault = faultIdxA.includes(u);
      const ledMat = isFault ? new THREE.MeshBasicMaterial({ color: 0xff2200 }) : M.serverLed;
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.014, 0.014), ledMat);
      led.position.set(-0.24, 1.82 - u * 0.13, 0.46);
      g.add(led);

      // Vent slots
      const vent = mkBox(0.22, 0.014, 0.1, M.panelGrey);
      vent.position.set(0.1, 1.82 - u * 0.13, 0.38);
      g.add(vent);
    }

    // Status beacon on top (red = faults present)
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
    beacon.position.set(0.28, 2.04, 0.44);
    g.add(beacon);
    const beaconGlow = new THREE.PointLight(0xff2200, 0.8, 2.0);
    beaconGlow.position.set(cx + 0.28, 2.04, cz + 0.44);
    scene.add(beaconGlow);

    // Cable tray on top
    const tray = mkBox(0.62, 0.06, 0.3, M.panelGrey);
    tray.position.set(0, 2.03, 0.1);
    g.add(tray);

    // Interaction proxy (front face)
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.0, 0.2), new THREE.MeshBasicMaterial({ visible: false }));
    proxy.position.set(0, 1.0, 0.47);
    proxy.userData = { type: 'circuit-bench', label, benchId: rackId };
    allInteractables.push(proxy);
    g.add(proxy);

    g.position.set(cx, 0, cz);
    scene.add(g);
    addCol(cx, 1.0, cz, 0.7, 2.05, 0.92);
  }

  buildServerRack(17.5, -6.5,  'server-1', 'NETWORK ROUTING CUBE A');
  buildServerRack(19, -6.5, 'server-2', 'NETWORK ROUTING CUBE B');
  buildServerRack(20.5, -6.5, 'server-3', 'MAIN SCADA SERVER');
  buildServerRack(22, -6.5, 'server-4', 'BACKUP SYSTEMS CABINET');
  buildServerRack(23.5, -6.5, 'server-5', 'DATA STORAGE ARRAY');
}

// ── BREAKER PANELS ────────────────────────────────────────────────────────────
export function breakerPanel(cx, cy, cz, ry, id, label, count = 8) {
  const grp = new THREE.Group();

  const enclosure = mkBox(1.05, 1.55, .18, M.panel);
  enclosure.position.set(0, 1.78, 0);
  grp.add(enclosure);

  const trim = mkBox(1.07, 1.57, .14, M.panelGrey);
  trim.position.set(0, 1.78, .02);
  grp.add(trim);

  const lbl = mkBox(.88, .16, .06, new THREE.MeshBasicMaterial({ color: 0x0a1520 }));
  lbl.position.set(0, 2.58, .1);
  grp.add(lbl);

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

  grp.position.set(cx, cy, cz);
  grp.rotation.y = ry;
  scene.add(grp);
  return { grp, breakers };
}

export const mainPanel = breakerPanel(10, 0, 27.9, Math.PI, 'main-panel', 'MAIN', 8);
export const distAPanel = breakerPanel(-13.9, 0, -5, Math.PI / 2, 'dist-a', 'DIST-A', 8);
export const distBPanel = breakerPanel(-13.9, 0, 9, Math.PI / 2, 'dist-b', 'DIST-B', 8);
export const wsPanel = breakerPanel(25.9, 0, -16, Math.PI / 2, 'workshop', 'WS', 6);

// ── WORKSHOP OVERHAUL ─────────────────────────────────────────────────────────
{
  const WX = 22, WZ = -3;
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x5a3e26, roughness: 0.85, metalness: 0.1 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.6, metalness: 0.8 });
  
  // tabletop
  const dtop = mkBox(1.9, 0.06, 1.0, deskMat);
  dtop.position.set(WX, 0.78, WZ);
  scene.add(dtop);

  // side panels
  const dleft = mkBox(0.04, 0.78, 1.0, legMat);
  dleft.position.set(WX - 0.93, 0.39, WZ);
  scene.add(dleft);
  const dright = mkBox(0.04, 0.78, 1.0, legMat);
  dright.position.set(WX + 0.93, 0.39, WZ);
  scene.add(dright);

  // back modesty panel
  const dfront = mkBox(1.9, 0.74, 0.04, legMat);
  dfront.position.set(WX, 0.39, WZ + 0.48);
  scene.add(dfront);

  addCol(WX, 0.42, WZ, 1.9, 0.82, 1.0);

  // Monitor
  const monBezel = mkBox(0.92, 0.58, 0.055, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.2 }));
  monBezel.position.set(WX, 1.32, WZ - 0.24);
  scene.add(monBezel);

  // screen face
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0a1f3a, emissive: 0x153060, emissiveIntensity: 1.4, roughness: 0.1, metalness: 0.2 });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.50), screenMat);
  screenMesh.position.set(WX, 1.32, WZ - 0.215);
  scene.add(screenMesh);
  
  const screenGlow = new THREE.PointLight(0x2266ff, 0.9, 3.5);
  screenGlow.position.set(WX, 1.3, WZ - 0.2);
  scene.add(screenGlow);

  // Interaction proxy
  const monProxy = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.58, 0.1), new THREE.MeshBasicMaterial({ visible: false }));
  monProxy.position.set(WX, 1.32, WZ - 0.2);
  monProxy.userData = { 
    type: 'computer', 
    label: 'Use Workshop Computer',
    compPos: new THREE.Vector3(WX, 1.10, WZ + 0.67),
    compRot: new THREE.Euler(-0.05, 0, 0, 'YXZ')
  };
  allInteractables.push(monProxy);
  scene.add(monProxy);

  // Re-use existing chair implementation but place at desk
  chair(WX, WZ + 0.6);
  
  // Computer Props
  const kbBase = mkBox(0.52, 0.018, 0.22, new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.6, metalness: 0.3 }));
  kbBase.position.set(WX, 0.808, WZ + 0.12);
  scene.add(kbBase);
  
  const mousePad = mkBox(0.22, 0.006, 0.18, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95, metalness: 0.0 }));
  mousePad.position.set(WX + 0.36, 0.806, WZ + 0.12);
  scene.add(mousePad);

  const lampMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.02, 12), lampMat);
  lampBase.position.set(WX - 0.6, 0.81, WZ - 0.3);
  scene.add(lampBase);
  const lampArm = mkBox(0.02, 0.4, 0.02, lampMat);
  lampArm.position.set(WX - 0.6, 1.0, WZ - 0.3);
  scene.add(lampArm);
  const lampHead = mkBox(0.12, 0.05, 0.22, lampMat);
  lampHead.position.set(WX - 0.6, 1.2, WZ - 0.2);
  lampHead.rotation.x = 0.2;
  scene.add(lampHead);
  const lampLight = new THREE.PointLight(0xffeedd, 1.2, 2.5);
  lampLight.position.set(WX - 0.6, 1.15, WZ - 0.2);
  scene.add(lampLight);
}

// ── WORKSHOP LOUNGE COUCH ─────────────────────────────────────────────────────
{
  const cx = 6, cz = -3, rotY = Math.PI; // facing North (-Z)
  const cg = new THREE.Group();
  cg.position.set(cx, 0, cz);
  cg.rotation.y = rotY;

  const wCouchWood = new THREE.MeshStandardMaterial({ color: 0x1a0f05, roughness: 0.9, metalness: 0.1 });
  const wCouchFabric = new THREE.MeshStandardMaterial({ color: 0x5a2e22, roughness: 0.95, metalness: 0.0 });

  const cBase = mkBox(2.3, 0.14, 0.85, wCouchWood);
  cBase.position.set(0, 0.07, 0);
  cg.add(cBase);

  const seat1 = mkBox(1.02, 0.22, 0.72, wCouchFabric);
  seat1.position.set(-0.57, 0.28, 0.04);
  cg.add(seat1);
  const seat2 = mkBox(1.02, 0.22, 0.72, wCouchFabric);
  seat2.position.set(0.57, 0.28, 0.04);
  cg.add(seat2);

  const back1 = mkBox(1.02, 0.6, 0.22, wCouchFabric);
  back1.position.set(-0.57, 0.62, -0.32);
  back1.rotation.x = 0.12;
  cg.add(back1);
  const back2 = mkBox(1.02, 0.6, 0.22, wCouchFabric);
  back2.position.set(0.57, 0.62, -0.32);
  back2.rotation.x = 0.12;
  cg.add(back2);

  const backRail = mkBox(2.32, 0.08, 0.12, wCouchWood);
  backRail.position.set(0, 0.96, -0.38);
  cg.add(backRail);

  [-1.15, 1.15].forEach(ax => {
    const armBody = mkBox(0.22, 0.48, 0.85, wCouchFabric);
    armBody.position.set(ax, 0.38, 0);
    cg.add(armBody);
  });

  const cProxy = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.9, 1.0), new THREE.MeshBasicMaterial({ visible: false }));
  cProxy.position.set(0, 0.4, 0);
  const sitW = new THREE.Vector3(0, 0.95, 0.15).applyAxisAngle(new THREE.Vector3(0,1,0), rotY).add(new THREE.Vector3(cx, 0, cz));
  cProxy.userData = { type: 'sit', label: 'Sit Down (Lounge)', sitPos: sitW, sitYaw: rotY + Math.PI };
  allInteractables.push(cProxy);
  cg.add(cProxy);

  scene.add(cg);
  addCol(cx, 0.45, cz + 0.2, 2.5, 0.9, 0.6); // since rotY = Math.PI, offset is reversed.
}

// ── WORKBENCH PROPS & TOOLS ───────────────────────────────────────────────────
{
  const toolSteel = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.3, metalness: 0.9 });
  const toolRed = new THREE.MeshStandardMaterial({ color: 0xaa2211, roughness: 0.7, metalness: 0.1 });
  const blueprintMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.9, metalness: 0 });
  const whitePaper = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9, metalness: 0 });

  function populateBench(bx, bz) {
    const wrench = mkBox(0.25, 0.015, 0.04, toolSteel);
    wrench.position.set(bx - 0.5, 1.01, bz);
    wrench.rotation.y = Math.random() * Math.PI;
    wrench.userData = { type: 'inspect', label: 'Heavy Duty Wrench' };
    allInteractables.push(wrench);
    scene.add(wrench);

    const bp = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), blueprintMat);
    bp.rotation.x = -Math.PI / 2;
    bp.rotation.z = Math.random() * 0.4 - 0.2;
    bp.position.set(bx, 1.002, bz - 0.2);
    scene.add(bp);

    const multi = mkBox(0.12, 0.04, 0.08, toolRed);
    multi.position.set(bx + 0.6, 1.02, bz + 0.1);
    multi.rotation.y = Math.random() * -0.5;
    multi.userData = { type: 'inspect', label: 'Digital Multimeter' };
    allInteractables.push(multi);
    scene.add(multi);

    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 }));
    mug.position.set(bx + 1.0, 1.05, bz - 0.3);
    scene.add(mug);
  }

  populateBench(8.5, -17);
  populateBench(15, -17);
  populateBench(21.5, -17);
  populateBench(8.5, -11);
  populateBench(15, -11);
  populateBench(21.5, -11);
  populateBench(22, 12); // Lab bench

  // Whiteboard (North wall of workshop z=-20 from x=15 to 26)
  const wb = mkBox(2.8, 1.4, 0.04, new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.2, metalness: 0.1 }));
  wb.position.set(18, 1.8, -19.98);
  scene.add(wb);
  const wbFrame = mkBox(2.85, 1.45, 0.03, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 }));
  wbFrame.position.set(18, 1.8, -19.99);
  scene.add(wbFrame);

  // Safety Pinboard (East wall of workshop near breaker panel x=26)
  const pinboard = mkBox(0.04, 1.2, 1.8, new THREE.MeshStandardMaterial({ color: 0xaa8855, roughness: 0.9 }));
  pinboard.position.set(25.98, 1.8, -13);
  scene.add(pinboard);
  const paper = mkBox(0.045, 0.2, 0.15, whitePaper);
  paper.position.set(25.98, 2.0, -13.2);
  scene.add(paper);
  const paper2 = mkBox(0.045, 0.2, 0.15, whitePaper);
  paper2.position.set(25.98, 1.7, -12.8);
  scene.add(paper2);
}


// ── SWITCH BOXES ─────────────────────────────────────────────────────────────
export function switchBox(cx, cy, cz, ry, id, label, on) {
  const grp = new THREE.Group();
  const base = mkBox(.38, .3, .12, M.panelGrey);
  grp.add(base);
  const sw = mkBox(.14, .22, .08, on ? M.green : M.red);
  sw.position.set(0, 0, .1);
  grp.add(sw);
  sw.userData = { type: 'switch', id, label, on, mesh: sw };
  allInteractables.push(sw);
  grp.position.set(cx, cy, cz);
  grp.rotation.y = ry;
  scene.add(grp);
  return sw;
}

export const mainSwitch = switchBox(3.88, 1.8, 8, Math.PI / 2, 'main-switch', 'Main Power', true);
export const genSwitch = switchBox(3.88, 1.8, 4, Math.PI / 2, 'gen-switch', 'Generator', false);

// ── CABLE STATIONS ────────────────────────────────────────────────────────────
export const cableStations = [];

function buildCableStation(cx, cz, idx) {
  const g = new THREE.Group();

  // Solid structural pedestal to fix floating bug
  const basePole = mkBox(0.5, 0.9, 0.15, new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.8, metalness: 0.4 }));
  basePole.position.set(0, 0.45, -0.01);
  g.add(basePole);

  const footMat = mkBox(0.8, 0.06, 0.6, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.3 }));
  footMat.position.set(0, 0.03, -0.01);
  g.add(footMat);

  const panel = mkBox(.7, .9, .1, M.panel);
  panel.position.set(0, 1.35, 0);
  g.add(panel);

  const trim = mkBox(.72, .92, .08, M.panelGrey);
  trim.position.set(0, 1.35, -.01);
  g.add(trim);

  const terminals = [];
  for (let i = 0; i < 6; i++) {
    const term = mkBox(.09, .14, .07, M.panelGrey);
    term.position.set(-.28 + i * .112, 1.55, .06);
    g.add(term);
    const conn = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .04, 10), M.copper);
    conn.rotation.x = Math.PI / 2;
    conn.position.set(-.28 + i * .112, 1.55, .09);
    g.add(conn);
    terminals.push({ term, conn, connected: false });
  }

  const btn = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .045, 14), M.eBlue);
  btn.rotation.x = Math.PI / 2;
  btn.position.set(0, 1.05, .07);
  g.add(btn);
  btn.userData = { type: 'cable-station', idx, label: `Wire Terminal ${idx + 1}` };
  allInteractables.push(btn);

  g.position.set(cx, 0, cz);
  g.rotation.y = Math.PI;
  scene.add(g);
  
  // Pedestal collision
  addCol(cx, 0.45, cz, 0.8, 0.9, 0.6);

  cableStations.push({ group: g, terminals, completed: false });
}

buildCableStation(15.4, -3, 0);
buildCableStation(15.4, -8, 1);
buildCableStation(15.4, -13, 2);

// ── MULTIMETERS ──────────────────────────────────────────────────────────────
function buildMultimeter(x, y, z) {
  const g = new THREE.Group();
  const body = mkBox(.24, .38, .14, M.black);
  g.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.17, .14),
    new THREE.MeshBasicMaterial({ color: 0x00ff44 }));
  screen.position.set(0, .09, .072);
  g.add(screen);
  for (let i = 0; i < 3; i++) {
    const probe = mkBox(.018, .35, .018, [M.red, M.black, M.yellow][i]);
    probe.position.set(-.06 + i * .06, -.36, 0);
    g.add(probe);
  }
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .025, 16), M.chrome);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0, -.08, .075);
  g.add(knob);
  g.position.set(x, y, z);
  scene.add(g);
  screen.userData = { type: 'multimeter', label: 'Multimeter' };
  allInteractables.push(screen);
}

buildMultimeter(9, .99, -11);
buildMultimeter(16, .99, -17);
buildMultimeter(22, .99, 12);

// ── OSCILLOSCOPES ────────────────────────────────────────────────────────────
export let oscWave1, oscWave2;

function buildOscilloscope(x, y, z) {
  const g = new THREE.Group();

  const body = mkBox(.5, .36, .4, M.panelGrey);
  g.add(body);

  const screenBezel = mkBox(.4, .26, .04, M.black);
  screenBezel.position.set(0, .06, .205);
  g.add(screenBezel);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.36, .22),
    new THREE.MeshBasicMaterial({ color: 0x001a0d }));
  screen.position.set(0, .06, .228);
  g.add(screen);

  // Waveform line
  const waveGeo = new THREE.BufferGeometry();
  const pts = new Float32Array(50 * 3);
  for (let i = 0; i < 50; i++) {
    pts[i * 3] = (i / 49) * .33 - .165;
    pts[i * 3 + 1] = .06;
    pts[i * 3 + 2] = .229;
  }
  waveGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const wave = new THREE.Line(waveGeo, new THREE.LineBasicMaterial({ color: 0x00ff88 }));
  g.add(wave);

  // Control knobs
  for (let i = 0; i < 4; i++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .02, 12), M.black);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-.12 + i * .08, -.12, .2);
    g.add(knob);
  }

  // Probe jacks
  [-0.14, 0.14].forEach(dx => {
    const jack = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .05, 10), M.chrome);
    jack.rotation.x = Math.PI / 2;
    jack.position.set(dx, -.1, .23);
    g.add(jack);
  });

  const btn = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .025, 12), M.eGreen);
  btn.rotation.x = Math.PI / 2;
  btn.position.set(.18, -.12, .22);
  g.add(btn);
  btn.userData = { type: 'oscilloscope', label: 'Oscilloscope' };
  allInteractables.push(btn);

  g.position.set(x, y, z);
  scene.add(g);
  return wave;
}

oscWave1 = buildOscilloscope(22, 1.0, 18);
oscWave2 = buildOscilloscope(28, 1.0, 18);

export function updateOscilloscopes(animT) {
  [oscWave1, oscWave2].forEach((wave, idx) => {
    if (!wave) return;
    const pos = wave.geometry.attributes.position;
    const arr = pos.array;
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      // Composite waveform: fundamental + harmonic
      arr[i * 3 + 1] = .06
        + Math.sin((animT * (idx === 0 ? 4 : 6)) + t * Math.PI * 6) * .042
        + Math.sin((animT * (idx === 0 ? 8 : 12)) + t * Math.PI * 14) * .014;
    }
    pos.needsUpdate = true;
  });
}

// ── PROPS ─────────────────────────────────────────────────────────────────────

// Wire spools
const spool1 = new THREE.Mesh(new THREE.TorusGeometry(.52, .15, 14, 22), M.yellow);
spool1.rotation.x = Math.PI / 2;
place(spool1, 6.5, 0.15, -9);
const spool2 = new THREE.Mesh(new THREE.TorusGeometry(.42, .13, 14, 22), M.copper);
spool2.rotation.x = Math.PI / 2;
place(spool2, 7.5, 0.13, -9);

// Hard hats on shelf
const hatColors = [M.yellow, M.orange];
[-.5, .5].forEach((dx, i) => {
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(.24, 14, 10, 0, Math.PI * 2, 0, Math.PI * .55),
    hatColors[i]
  );
  place(hat, 9 + dx, 1.02, -10.6);
});

// Tool cabinets
[[20, .9, -4], [20, .9, -7]].forEach(([x, y, z]) => {
  const cab = mkBox(1.3, 1.8, .65, M.panelGrey);
  place(cab, x, y, z);
  addCol(x, y, z, 1.3, 1.8, .65);
  // Drawer handles
  for (let i = 0; i < 4; i++) {
    place(mkBox(.3, .04, .06, M.chrome), x, 1.4 - i * .38, z + .34);
  }
});

// ── TECH CORRIDOR ACCENT WIRES ─────────────────────────────────────────────
{
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.8, metalness: 0.2 });
  const opticMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });

  const cLength = 46; // From z=-20 to z=26
  const cMidZ = 3;

  // West Wall slim wires
  const wWire = mkBox(0.02, 0.02, cLength, wireMat);
  wWire.position.set(-1.99, H * 0.85, cMidZ);
  scene.add(wWire);
  const wOptic = mkBox(0.006, 0.006, cLength, opticMat);
  wOptic.position.set(-1.98, H * 0.85 - 0.03, cMidZ);
  scene.add(wOptic);

  // East Wall slim wires
  const eWire = mkBox(0.02, 0.02, cLength, wireMat);
  eWire.position.set(3.99, H * 0.85, cMidZ);
  scene.add(eWire);
  const eOptic = mkBox(0.006, 0.006, cLength, opticMat);
  eOptic.position.set(3.98, H * 0.85 - 0.03, cMidZ);
  scene.add(eOptic);
}

// Toolboxes
function toolbox(x, z, color = 0xdd4433) {
  const mat = new THREE.MeshLambertMaterial({ color });
  place(mkBox(.42, .28, .22, mat), x, 1.1, z);
  place(mkBox(.44, .06, .24, M.panelGrey), x, 1.27, z);
  place(mkBox(.14, .04, .04, M.chrome), x, 1.29, z + .12);
}
toolbox(16, -11.5); toolbox(16, -17.5); toolbox(22, -11.5, 0x3366ff);

// Oil barrels
function barrel(x, z, color = 0x223344) {
  const b = mkCyl(.3, .85, new THREE.MeshLambertMaterial({ color }));
  place(b, x, 0.425, z);
  place(mkCyl(.31, .06, M.black), x, 0.2, z);
  place(mkCyl(.31, .06, M.black), x, 0.65, z);
}
barrel(17, 11, 0x884422); barrel(18, 11, 0x884422); barrel(18, 12, 0x224488);

// HV signs
function hvSign(x, y, z, ry = 0) {
  const base = mkBox(.58, .38, .06, M.signYellow);
  base.position.set(x, y, z); base.rotation.y = ry; scene.add(base);
  const text = mkBox(.5, .3, .062, M.signBlack);
  text.position.set(x, y, z); text.rotation.y = ry; scene.add(text);
}
hvSign(25.88, 2.2, -13, Math.PI / 2);
hvSign(3.88, 2.2, 10, Math.PI / 2);
hvSign(15.88, 2.2, 13.9, 0);

// Storage crates
[[-5, 17], [-11, 18], [-8, 22], [-4, 23], [-12, 24]].forEach(([x, z]) => {
  const crate = mkBox(1.35, 1.1, 1.35, new THREE.MeshLambertMaterial({ color: 0x7a6a50 }));
  place(crate, x, 0.55, z);
  addCol(x, 0.55, z, 1.35, 1.1, 1.35);
  // Slats
  for (let i = 0; i < 3; i++) {
    place(mkBox(1.37, .05, .04, new THREE.MeshLambertMaterial({ color: 0x5a4a30 })), x, .3 + i * .3, z + .67);
  }
});

// (Server racks removed — this area is now the Faculty/Instructor Room)
// Faculty room furniture is built by buildFacultyRoom() above.


// Chairs
function chair(x, z) {
  // Seat
  place(mkBox(.62, .08, .62, M.panelGrey), x, .57, z);
  // Backrest
  place(mkBox(.62, .72, .07, M.panelGrey), x, 1.02, z + .29);
  // Armrests
  [-.34, .34].forEach(dx => {
    place(mkBox(.07, .06, .42, M.panelGrey), x + dx, .77, z + .07);
    place(mkBox(.07, .22, .07, M.panelGrey), x + dx, .66, z + .29);
  });
  // Pedestal
  place(mkCyl(.06, .55, M.chrome), x, .28, z);
  // Base
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    place(mkBox(.32, .04, .07, M.chrome), x + Math.sin(ang) * .2, .03, z + Math.cos(ang) * .2).rotation.y = ang;
  }
}
// Chair for Motor Control Lab student benches
chair(7, 5.6); chair(12, 5.6); chair(17, 5.6);


// ── ENTRANCE AREA ─────────────────────────────────────────────────────────────
const entranceGroup = new THREE.Group();
scene.add(entranceGroup);

// ─── MATERIALS (local to entrance) ───────────────────────────────────────────
const fabricMat   = new THREE.MeshStandardMaterial({ color: 0x4a6080, roughness: 0.92, metalness: 0.05 });
const couchWoodMat= new THREE.MeshStandardMaterial({ color: 0x2c1a08, roughness: 0.8, metalness: 0.1 });
const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0xb5813a, roughness: 0.75, metalness: 0.05 });
const deskMetalMat= new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.4, metalness: 0.9 });
const monitorMat  = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.5, metalness: 0.6 });
const chairFabric = new THREE.MeshStandardMaterial({ color: 0x1a2530, roughness: 0.9, metalness: 0.05 });
const chairMetal  = new THREE.MeshStandardMaterial({ color: 0x99aabb, roughness: 0.3, metalness: 0.95 });

// Emergency Stop Button
const eStopGrp = new THREE.Group();
const eStopBox = mkBox(.28, .28, .14, M.panelGrey);
eStopGrp.add(eStopBox);
const eStopRing = new THREE.Mesh(new THREE.TorusGeometry(.11, .02, 10, 24), M.yellow);
eStopRing.rotation.x = Math.PI / 2;
eStopRing.position.set(0, 0, .08);
eStopGrp.add(eStopRing);
const eStopBtn = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .09, 18), M.red);
eStopBtn.rotation.x = Math.PI / 2;
eStopBtn.position.set(0, 0, .09);
eStopGrp.add(eStopBtn);
eStopBtn.userData = { type: 'estop', label: 'EMERGENCY STOP' };
allInteractables.push(eStopBtn);
eStopGrp.position.set(2.8, 1.3, -20.1);
eStopGrp.rotation.y = Math.PI;
entranceGroup.add(eStopGrp);

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED ENTRANCE DECOR
// ═══════════════════════════════════════════════════════════════════════════

// ── Extra entrance ceiling light (warmer + second fixture) ──────────────────
{
  const pt2 = new THREE.PointLight(0xffeedd, 1.8, 10);
  pt2.position.set(1, H - 0.2, -25.5);
  scene.add(pt2);
  const fixtureBase2 = mkBox(0.15, 0.05, 1.4, M.panelGrey);
  fixtureBase2.position.set(1, H - 0.02, -25.5);
  scene.add(fixtureBase2);
  const tube2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 8), M.eWhite);
  tube2.rotation.z = Math.PI / 2;
  tube2.position.set(1, H - 0.05, -25.5);
  scene.add(tube2);
}

// ── WELCOME / COMPANY SIGN on north wall (z=-28) ────────────────────────────
{
  // Sign backing plate
  const signBg = mkBox(3.8, 0.72, 0.08,
    new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.6, metalness: 0.4 }));
  signBg.position.set(1, 2.6, -27.88);
  scene.add(signBg);

  // Green accent bar on top
  const signBar = mkBox(3.8, 0.06, 0.09,
    new THREE.MeshBasicMaterial({ color: 0x44ff88 }));
  signBar.position.set(1, 3.0, -27.85);
  scene.add(signBar);

  // Company name plate (emissive white)
  const namePlate = mkBox(3.6, 0.34, 0.01,
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xaaffcc),
      emissiveIntensity: 0.6,
      roughness: 0.4,
      metalness: 0.1
    }));
  namePlate.position.set(1, 2.72, -27.83);
  scene.add(namePlate);

  // Sub-text plate (bluish)
  const subPlate = mkBox(2.4, 0.16, 0.01,
    new THREE.MeshStandardMaterial({
      color: 0x8899bb,
      emissive: new THREE.Color(0x334466),
      emissiveIntensity: 0.5,
      roughness: 0.5,
      metalness: 0.1
    }));
  subPlate.position.set(1, 2.44, -27.83);
  scene.add(subPlate);

  // Sign glow light
  const signGlow = new THREE.PointLight(0x88ffcc, 0.7, 4.5);
  signGlow.position.set(1, 2.6, -27.5);
  scene.add(signGlow);

  // Left / right chrome end-caps
  [-1.92, 1.92].forEach(dx => {
    const cap = mkBox(0.04, 0.74, 0.10,
      new THREE.MeshStandardMaterial({ color: 0xaabbcc, roughness: 0.3, metalness: 0.9 }));
    cap.position.set(1 + dx, 2.6, -27.87);
    scene.add(cap);
  });
}

// ── DIRECTIONAL SIGN (east wall, pointing toward corridor) ──────────────────
{
  const dSign = mkBox(0.06, 0.32, 1.4,
    new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.6, metalness: 0.3 }));
  dSign.position.set(3.88, 2.1, -22.5);
  scene.add(dSign);

  // Arrow stripe (green)
  const arrow1 = mkBox(0.07, 0.10, 0.9,
    new THREE.MeshBasicMaterial({ color: 0x44ff88 }));
  arrow1.position.set(3.86, 2.1, -22.5);
  scene.add(arrow1);

  // Direction text plates
  const tPlate = mkBox(0.07, 0.18, 0.6,
    new THREE.MeshBasicMaterial({ color: 0xccddff }));
  tPlate.position.set(3.86, 2.26, -22.5);
  scene.add(tPlate);
}

// ── WALL CLOCK (east wall near entrance door) ────────────────────────────────
{
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 24),
    new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.8, metalness: 0.05 })
  );
  clockFace.rotation.y = -Math.PI / 2;
  clockFace.position.set(3.88, 2.4, -20.8);
  scene.add(clockFace);

  const clockRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.025, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.4, metalness: 0.9 })
  );
  clockRim.rotation.y = -Math.PI / 2;
  clockRim.position.set(3.87, 2.4, -20.8);
  scene.add(clockRim);

  // Hour and minute hands (static aesthetic)
  const hHand = mkBox(0.01, 0.01, 0.12, new THREE.MeshLambertMaterial({ color: 0x111111 }));
  hHand.position.set(3.87, 2.45, -20.8);
  hHand.rotation.y = -Math.PI / 2;
  scene.add(hHand);
  const mHand = mkBox(0.008, 0.008, 0.17, new THREE.MeshLambertMaterial({ color: 0x111111 }));
  mHand.position.set(3.87, 2.38, -20.8);
  mHand.rotation.y = -Math.PI / 2;
  scene.add(mHand);
}

// ── DECORATIVE FLOOR MAT / RUG under couch area ─────────────────────────────
{
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 1.0, metalness: 0.0 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-0.5, 0.003, -25.5);
  scene.add(rug);

  // Rug border stripe
  const rugBorder = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x334a5a, roughness: 1.0, metalness: 0.0 })
  );
  rugBorder.rotation.x = -Math.PI / 2;
  rugBorder.position.set(-0.5, 0.004, -25.5);
  scene.add(rugBorder);
}

// ── WALL SCONCE accent lights (west wall) ───────────────────────────────────
[-26, -23].forEach((wz, i) => {
  const sconceBracket = mkBox(0.08, 0.22, 0.14,
    new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.4, metalness: 0.9 }));
  sconceBracket.position.set(-1.88, 1.85, wz);
  scene.add(sconceBracket);

  const sconceGlobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xfff5cc,
      emissive: new THREE.Color(0xffdd88),
      emissiveIntensity: 0.8,
      roughness: 0.3
    })
  );
  sconceGlobe.position.set(-1.82, 1.7, wz);
  scene.add(sconceGlobe);

  const sconceLight = new THREE.PointLight(0xffcc66, 0.4, 3.5);
  sconceLight.position.set(-1.7, 1.65, wz);
  scene.add(sconceLight);
});

// ── SECURITY CAMERA bracket on ceiling corner ────────────────────────────────
{
  const camBracket = mkBox(0.1, 0.22, 0.1,
    new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.5, metalness: 0.7 }));
  camBracket.position.set(3.5, H - 0.12, -27.5);
  scene.add(camBracket);

  const camBody = mkBox(0.16, 0.09, 0.22,
    new THREE.MeshStandardMaterial({ color: 0x222833, roughness: 0.5, metalness: 0.6 }));
  camBody.position.set(3.5, H - 0.26, -27.4);
  camBody.rotation.x = -0.3;
  scene.add(camBody);

  // Camera lens
  const camLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.026, 0.06, 10),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1, metalness: 0.9 })
  );
  camLens.rotation.x = Math.PI / 2 - 0.3;
  camLens.position.set(3.5, H - 0.30, -27.28);
  scene.add(camLens);

  // Red LED on camera
  const camLED = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xff2222 })
  );
  camLED.position.set(3.58, H - 0.24, -27.35);
  scene.add(camLED);
}

// ── THIN BASEBOARD along north + west walls ──────────────────────────────────
{
  // North wall baseboard
  const bb1 = mkBox(6.22, 0.08, 0.04,
    new THREE.MeshStandardMaterial({ color: 0xccccbb, roughness: 0.9, metalness: 0.0 }));
  bb1.position.set(1, 0.04, -28.02);
  scene.add(bb1);

  // West wall baseboard
  const bb2 = mkBox(0.04, 0.08, 8.0,
    new THREE.MeshStandardMaterial({ color: 0xccccbb, roughness: 0.9, metalness: 0.0 }));
  bb2.position.set(-2.02, 0.04, -24);
  scene.add(bb2);

  // East wall baseboard
  const bb3 = mkBox(0.04, 0.08, 8.0,
    new THREE.MeshStandardMaterial({ color: 0xccccbb, roughness: 0.9, metalness: 0.0 }));
  bb3.position.set(4.02, 0.04, -24);
  scene.add(bb3);
}



// ─────────────────────────────────────────────────────────────────────────────
// SINGLE COUCH — waiting area, left side of entrance, facing toward the door
// Position: x≈-1, z≈-25, facing south (rotY=0)
// ─────────────────────────────────────────────────────────────────────────────
{
  const cx = -0.6, cz = -25.5, rotY = 0;
  const cg = new THREE.Group();
  cg.position.set(cx, 0, cz);
  cg.rotation.y = rotY;

  // Base platform (wood)
  const cBase = mkBox(2.3, 0.14, 0.85, couchWoodMat);
  cBase.position.set(0, 0.07, 0);
  cg.add(cBase);

  // Seat cushions (two separate for realism)
  const seat1 = mkBox(1.02, 0.22, 0.72, fabricMat);
  seat1.position.set(-0.57, 0.28, 0.04);
  cg.add(seat1);
  const seat2 = mkBox(1.02, 0.22, 0.72, fabricMat);
  seat2.position.set(0.57, 0.28, 0.04);
  cg.add(seat2);

  // Seat cushion piping (ridge between cushions)
  const seam = mkBox(0.04, 0.24, 0.72, couchWoodMat);
  seam.position.set(0, 0.28, 0.04);
  cg.add(seam);

  // Back cushions (slightly angled)
  const back1 = mkBox(1.02, 0.6, 0.22, fabricMat);
  back1.position.set(-0.57, 0.62, -0.32);
  back1.rotation.x = 0.12;
  cg.add(back1);
  const back2 = mkBox(1.02, 0.6, 0.22, fabricMat);
  back2.position.set(0.57, 0.62, -0.32);
  back2.rotation.x = 0.12;
  cg.add(back2);

  // Back frame rail (wood strip)
  const backRail = mkBox(2.32, 0.08, 0.12, couchWoodMat);
  backRail.position.set(0, 0.96, -0.38);
  cg.add(backRail);

  // Armrests with padded tops
  [-1.15, 1.15].forEach(ax => {
    const armBody = mkBox(0.22, 0.48, 0.85, fabricMat);
    armBody.position.set(ax, 0.38, 0);
    cg.add(armBody);
    const armCap = mkBox(0.24, 0.06, 0.87, couchWoodMat);
    armCap.position.set(ax, 0.65, 0);
    cg.add(armCap);
  });

  // Chrome legs (tapered cylinders)
  const legGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.09, 8);
  [[-1.0,-0.33],[1.0,-0.33],[-1.0,0.33],[1.0,0.33]].forEach(([lx,lz]) => {
    const leg = new THREE.Mesh(legGeo, chairMetal);
    leg.position.set(lx, 0.045, lz);
    cg.add(leg);
  });

  // Invisible interaction proxy
  const cProxy = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.9, 1.0),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  cProxy.position.set(0, 0.4, 0);
  const sitW = new THREE.Vector3(0, 0.95, 0.15)
    .applyAxisAngle(new THREE.Vector3(0,1,0), rotY)
    .add(new THREE.Vector3(cx, 0, cz));
  cProxy.userData = { type: 'sit', label: 'Sit Down (Couch)', sitPos: sitW, sitYaw: rotY + Math.PI };
  allInteractables.push(cProxy);
  cg.add(cProxy);

  entranceGroup.add(cg);
  // Couch collision (offset to the back half to prevent getting stuck when standing up)
  addCol(cx, 0.45, cz - 0.2, 2.5, 0.9, 0.6);
}

// Small side table next to couch
{
  place(mkBox(0.55, 0.04, 0.55, deskWoodMat), 1.1, 0.58, -25.5);
  place(mkCyl(0.03, 0.56, chairMetal, 8), 1.1, 0.28, -25.5);
  // Coffee mug on table
  place(mkCyl(0.055, 0.1, new THREE.MeshStandardMaterial({ color: 0xcc4422, roughness: 0.7, metalness: 0.2 }), 10), 1.1, 0.655, -25.5);
}

// Decorative plant
{
  const potMat = new THREE.MeshStandardMaterial({ color: 0xccbb88, roughness: 0.9, metalness: 0.05 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.42, 14), potMat);
  place(pot, -1.7, 0.21, -26.8);
  // Soil top
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 14),
    new THREE.MeshStandardMaterial({ color: 0x3a2a14, roughness: 1.0, metalness: 0.0 }));
  place(soil, -1.7, 0.44, -26.8);
  addCol(-1.7, 0.21, -26.8, 0.5, 0.5, 0.5);
  // Leaves
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3 + Math.random()*0.25, 0.7 + Math.random()*0.3),
      new THREE.MeshStandardMaterial({ color: 0x2d8a3e, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide })
    );
    leaf.position.set(-1.7, 0.75 + Math.random()*0.25, -26.8);
    leaf.rotation.y = (i / 8) * Math.PI * 2;
    leaf.rotation.x = -Math.PI / 6 - Math.random() * 0.2;
    scene.add(leaf);
  }
}

// Wall painting
{
  const paintMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1),
    new THREE.MeshBasicMaterial({ color: 0xff9944 }));
  paintMesh.position.set(-1.98, 2.0, -24.8);
  paintMesh.rotation.y = Math.PI / 2;
  scene.add(paintMesh);
  const pFrame2 = mkBox(0.05, 1.18, 1.88, new THREE.MeshLambertMaterial({ color: 0x111111 }));
  pFrame2.position.set(-1.99, 2.0, -24.8);
  scene.add(pFrame2);
  // Inner abstract accent stripe
  const stripe1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x2255cc }));
  stripe1.position.set(-1.975, 1.88, -24.8);
  stripe1.rotation.y = Math.PI / 2;
  scene.add(stripe1);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTER WORKSTATION — full desk + monitor + keyboard + mouse + CPU + chair
// Position: x≈2.5, z≈-24, facing west (player sits behind, looks at monitor)
// ─────────────────────────────────────────────────────────────────────────────
{
  const WX = 2.5, WZ = -23.5;  // workstation center

  // ── Desk ────────────────────────────────────────────────────────────────────
  // Main tabletop
  const dtop = mkBox(1.9, 0.06, 1.0, deskWoodMat);
  dtop.position.set(WX, 0.78, WZ);
  scene.add(dtop);

  // Modesty panel (front face)
  const dfront = mkBox(1.9, 0.74, 0.04, deskMetalMat);
  dfront.position.set(WX, 0.39, WZ + 0.48);
  scene.add(dfront);

  // Left side panel
  const dleft = mkBox(0.04, 0.78, 1.0, deskMetalMat);
  dleft.position.set(WX - 0.93, 0.39, WZ);
  scene.add(dleft);

  // Right side panel
  const dright = mkBox(0.04, 0.78, 1.0, deskMetalMat);
  dright.position.set(WX + 0.93, 0.39, WZ);
  scene.add(dright);

  // Under-shelf
  const dshelf = mkBox(1.86, 0.04, 0.88, deskWoodMat);
  dshelf.position.set(WX, 0.38, WZ);
  scene.add(dshelf);

  // Cable management trough (back edge of desk)
  const dcable = mkBox(1.7, 0.04, 0.06, deskMetalMat);
  dcable.position.set(WX, 0.81, WZ - 0.45);
  scene.add(dcable);

  // Desk collision
  addCol(WX, 0.42, WZ, 1.9, 0.82, 1.0);

  // ── Monitor ─────────────────────────────────────────────────────────────────
  // Monitor stand arm
  const mArm = mkBox(0.05, 0.28, 0.05, deskMetalMat);
  mArm.position.set(WX, 0.93, WZ - 0.2);
  scene.add(mArm);
  const mArmBase = mkBox(0.22, 0.03, 0.18, deskMetalMat);
  mArmBase.position.set(WX, 0.8, WZ - 0.2);
  scene.add(mArmBase);
  const mArmHingeH = mkBox(0.18, 0.04, 0.04, deskMetalMat);
  mArmHingeH.position.set(WX, 1.07, WZ - 0.22);
  scene.add(mArmHingeH);

  // Monitor bezel
  const mBezel = mkBox(0.92, 0.58, 0.055, monitorMat);
  mBezel.position.set(WX, 1.32, WZ - 0.24);
  scene.add(mBezel);

  // Screen face — emissive blue glow (interactive)
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0a1f3a,
    emissive: new THREE.Color(0x153060),
    emissiveIntensity: 1.4,
    roughness: 0.1,
    metalness: 0.2
  });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.50), screenMat);
  screenMesh.position.set(WX, 1.32, WZ - 0.215);
  scene.add(screenMesh);

  // Screen scanlines (aesthetic plane)
  const scanMat = new THREE.MeshBasicMaterial({ color: 0x4499ff, transparent: true, opacity: 0.08 });
  const scanMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.50), scanMat);
  scanMesh.position.set(WX, 1.32, WZ - 0.212);
  scene.add(scanMesh);

  // Screen glow light
  const screenGlow = new THREE.PointLight(0x2266ff, 0.9, 3.5);
  screenGlow.position.set(WX, 1.3, WZ - 0.2);
  scene.add(screenGlow);

  // Monitor interaction proxy — clicking the screen opens the computer UI
  const monProxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.58, 0.1),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  monProxy.position.set(WX, 1.32, WZ - 0.2);
  monProxy.userData = { 
    type: 'computer', 
    label: 'Use Entrance Terminal',
    compPos: new THREE.Vector3(2.5, 1.10, -22.83),
    compRot: new THREE.Euler(-0.05, 0, 0, 'YXZ')
  };
  allInteractables.push(monProxy);
  scene.add(monProxy);

  // Monitor power LED
  const mLED = new THREE.Mesh(
    new THREE.CircleGeometry(0.012, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff88 })
  );
  mLED.position.set(WX + 0.38, 1.07, WZ - 0.218);
  scene.add(mLED);

  // ── Keyboard ────────────────────────────────────────────────────────────────
  const kbBase = mkBox(0.52, 0.018, 0.22, new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.6, metalness: 0.3 }));
  kbBase.position.set(WX, 0.808, WZ + 0.12);
  scene.add(kbBase);

  // Key rows (decorative)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      const key = mkBox(0.033, 0.012, 0.033, new THREE.MeshStandardMaterial({ color: 0x2a2e38, roughness: 0.7, metalness: 0.2 }));
      key.position.set(WX - 0.22 + col * 0.04, 0.82, WZ + 0.02 + row * 0.042);
      scene.add(key);
    }
  }

  // ── Mouse ────────────────────────────────────────────────────────────────────
  const mousePad = mkBox(0.22, 0.006, 0.18, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95, metalness: 0.0 }));
  mousePad.position.set(WX + 0.36, 0.806, WZ + 0.12);
  scene.add(mousePad);

  const mouseBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.028, 0.11),
    new THREE.MeshStandardMaterial({ color: 0x22282f, roughness: 0.5, metalness: 0.4 })
  );
  mouseBody.position.set(WX + 0.36, 0.822, WZ + 0.12);
  scene.add(mouseBody);

  // Mouse scroll wheel
  const mWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.038, 8),
    new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.4, metalness: 0.7 })
  );
  mWheel.rotation.x = Math.PI / 2;
  mWheel.position.set(WX + 0.36, 0.834, WZ + 0.11);
  scene.add(mWheel);

  // ── CPU Tower ───────────────────────────────────────────────────────────────
  const cpuBody = mkBox(0.2, 0.46, 0.44, new THREE.MeshStandardMaterial({ color: 0x18202a, roughness: 0.6, metalness: 0.5 }));
  cpuBody.position.set(WX + 0.77, 0.41, WZ + 0.0);
  scene.add(cpuBody);
  addCol(WX + 0.77, 0.41, WZ, 0.2, 0.46, 0.44);

  // CPU vents (stripe pattern)
  for (let i = 0; i < 5; i++) {
    const vent = mkBox(0.205, 0.018, 0.28, new THREE.MeshStandardMaterial({ color: 0x0d141c, roughness: 0.8, metalness: 0.3 }));
    vent.position.set(WX + 0.77, 0.28 + i * 0.06, WZ + 0.0);
    scene.add(vent);
  }

  // CPU power LED
  const cpuLED = new THREE.Mesh(
    new THREE.CircleGeometry(0.01, 8),
    new THREE.MeshBasicMaterial({ color: 0x0066ff })
  );
  cpuLED.rotation.y = -Math.PI / 2;
  cpuLED.position.set(WX + 0.66, 0.6, WZ + 0.08);
  scene.add(cpuLED);

  // ── Paper / notebook on desk ─────────────────────────────────────────────────
  const notepad = mkBox(0.18, 0.008, 0.24, new THREE.MeshLambertMaterial({ color: 0xf5f0e8 }));
  notepad.position.set(WX - 0.5, 0.804, WZ + 0.1);
  notepad.rotation.y = 0.15;
  scene.add(notepad);

  const pen = mkBox(0.01, 0.01, 0.16, new THREE.MeshLambertMaterial({ color: 0x1133cc }));
  pen.position.set(WX - 0.43, 0.812, WZ + 0.06);
  pen.rotation.y = 0.3;
  scene.add(pen);

  // ── Ergonomic Desk Chair ─────────────────────────────────────────────────────
  // Chair sits SOUTH of the desk, facing NORTH (toward the monitor)
  // WZ = -23.5 (desk centre). Desk front panel is at WZ+0.48 = -23.02.
  // Chair centre at WZ + 0.85 = -22.65  (pulled away from desk a bit more)
  const CHX = WX;           // same X as desk centre (2.5)
  const CHZ = WZ + 0.88;   // south of desk front panel

  // Seat
  const cSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.08, 0.56),
    chairFabric
  );
  cSeat.position.set(CHX, 0.5, CHZ);
  scene.add(cSeat);

  // Front bevel of seat (south/front edge curves down slightly)
  const cSeatFront = mkBox(0.58, 0.04, 0.06, chairFabric);
  cSeatFront.position.set(CHX, 0.47, CHZ + 0.25);  // south front of seat
  cSeatFront.rotation.x = 0.3;  // tilt slightly downward
  scene.add(cSeatFront);

  // Backrest — on SOUTH side (back of chair = away from desk)
  const cBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.72, 0.07),
    chairFabric
  );
  cBack.position.set(CHX, 0.98, CHZ + 0.25);  // south side = CHZ + offset
  cBack.rotation.x = 0.08;   // lean slightly backward (away from desk)
  scene.add(cBack);

  // Lumbar support on south side backrest
  const cLumbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.18, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x131c25, roughness: 0.9, metalness: 0.05 })
  );
  cLumbar.position.set(CHX, 0.74, CHZ + 0.258);
  scene.add(cLumbar);

  // Headrest — above backrest on south side
  const cHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.22, 0.07),
    chairFabric
  );
  cHead.position.set(CHX, 1.40, CHZ + 0.26);
  scene.add(cHead);

  // Armrests (horizontal pads, running north-south)
  [-0.30, 0.30].forEach(ax => {
    // Horizontal pad
    const armPad = mkBox(0.065, 0.025, 0.40, chairFabric);
    armPad.position.set(CHX + ax, 0.69, CHZ);
    scene.add(armPad);
    // Vertical post (connects seat to pad, on the back half)
    const armPost = mkBox(0.045, 0.20, 0.045, chairMetal);
    armPost.position.set(CHX + ax, 0.59, CHZ + 0.12);
    scene.add(armPost);
  });

  // Pneumatic piston (centre column)
  const cPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.044, 0.46, 10), chairMetal);
  cPiston.position.set(CHX, 0.25, CHZ);
  scene.add(cPiston);

  // 5-star base with caster wheels
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const starArm = mkBox(0.38, 0.028, 0.055, chairMetal);
    starArm.position.set(CHX + Math.sin(ang) * 0.19, 0.025, CHZ + Math.cos(ang) * 0.19);
    starArm.rotation.y = ang;
    scene.add(starArm);
    const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 8), M.black);
    caster.position.set(CHX + Math.sin(ang) * 0.34, 0.015, CHZ + Math.cos(ang) * 0.34);
    scene.add(caster);
  }

  // Chair collision (offset to the backrest so the seat is clear)
  addCol(CHX, 0.45, CHZ + 0.2, 0.65, 0.9, 0.3);
}

// ── DOOR CLASS ────────────────────────────────────────────────────────────────



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

    const panelW = isXWall ? 0.09 : width;
    const panelD = isXWall ? width : 0.09;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, 2.38, panelD), M.door);

    if (isXWall) {
      panel.position.set(0, 1.19, width / 2);
    } else {
      panel.position.set(width / 2, 1.19, 0);
    }
    this.pivot.add(panel);

    // Door handle
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 12), M.chrome);
    if (isXWall) {
      knob.position.set(swingAngle > 0 ? .09 : -.09, 1.1, width * .84);
    } else {
      knob.position.set(width * .84, 1.1, swingAngle > 0 ? .09 : -.09);
    }
    this.pivot.add(knob);

    // Frame
    if (isXWall) {
      place(mkBox(.18, 2.65, .18, M.doorFrame), wallX, floorY + 1.32, wallZ - width / 2);
      place(mkBox(.18, 2.65, .18, M.doorFrame), wallX, floorY + 1.32, wallZ + width / 2);
      place(mkBox(.18, .18, width + .36, M.doorFrame), wallX, floorY + 2.47, wallZ);
      const led = mkBox(.07, .05, width, M.eBlue);
      led.position.set(wallX, floorY + 2.44, wallZ);
      scene.add(led);
    } else {
      place(mkBox(.18, 2.65, .18, M.doorFrame), wallX - width / 2, floorY + 1.32, wallZ);
      place(mkBox(.18, 2.65, .18, M.doorFrame), wallX + width / 2, floorY + 1.32, wallZ);
      place(mkBox(width + .36, .18, .18, M.doorFrame), wallX, floorY + 2.47, wallZ);
      const led = mkBox(width, .05, .07, M.eBlue);
      led.position.set(wallX, floorY + 2.44, wallZ);
      scene.add(led);
    }

    panel.userData = { type: 'door', door: this };
    knob.userData = { type: 'door', door: this };
    allInteractables.push(panel, knob);
    this.panel = panel;
    this._addCol();
  }

  _addCol() {
    // Remove old collision box safely by reference, not unstable index
    if (this._colBox) {
      const idx = colBoxes.indexOf(this._colBox);
      if (idx !== -1) colBoxes.splice(idx, 1);
      this._colBox = null;
    }

    if (!this.open) {
      const p = this.pivot.position;
      // Panel extends from hinge outward, so collision center must account for offset
      if (this.isXWall) {
        const panelLen = this.panel.geometry.parameters.depth; // Z extent
        const cz = p.z + panelLen / 2;
        this._colBox = new THREE.Box3(
          new THREE.Vector3(p.x - 0.12, this.floorY, cz - panelLen / 2),
          new THREE.Vector3(p.x + 0.12, this.floorY + 2.4, cz + panelLen / 2)
        );
      } else {
        const panelLen = this.panel.geometry.parameters.width; // X extent
        const cx = p.x + panelLen / 2;
        this._colBox = new THREE.Box3(
          new THREE.Vector3(cx - panelLen / 2, this.floorY, p.z - 0.12),
          new THREE.Vector3(cx + panelLen / 2, this.floorY + 2.4, p.z + 0.12)
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

// ── FLOOR 1 DOORS ─────────────────────────────────────────────────────────────
export const doors = [
  new Door(1, -20, -0.05, -20, 2.2, -Math.PI * .75, 'Lobby Entrance', false),
  new Door(4, -10, 4, -11.05, 2.2, Math.PI * .75, 'Wiring Lab', true),
  new Door(4, 7, 4, 5.95, 2.2, Math.PI * .75, 'Motor Control Lab', true),
  new Door(20, 1, 20, -0.05, 2.2, -Math.PI * .75, 'Faculty / Instructor Room', true),
  new Door(-2, -5, -2, -6.05, 2.2, Math.PI * .75, 'Panel Board A', true),
  new Door(-2, 9, -2, 7.95, 2.2, Math.PI * .75, 'Tool Room', true),
  new Door(27, 10, 25.95, 10, 2.2, -Math.PI * .75, 'Assessment Room', false),
  new Door(-8, 16, -9.05, 16, 2.2, -Math.PI * .75, 'Storage Room', false),
  new Door(10, 14, 8.95, 14, 2.2, Math.PI * .75, 'Classroom / Lecture', false),
  // Stairwell door
  new Door(7, 28, 5.95, 28, 2.2, -Math.PI * .75, 'Stairwell', false),
];

// ══════════════════════════════════════════════════════════════════════════════
// WORKSHOP WIRING STATIONS — mounted on north wall (z ≈ -19.9)
// Three switch panels + one light bulb, all clickable → launches scenario2.html
// Workshop: x=4..26, z=-20..0   North wall at z=-20
// ══════════════════════════════════════════════════════════════════════════════
const WS_Z = -19.88;  // just inside north wall face
const WS_Y = 1.1;     // switch panel center height

const WIRING_STATIONS = [
  { id: '1way', x: 9,  label: '1-SWITCH CONTROL',   color: 0x22c55e, ledColor: 0x44ff88 },
  { id: '2way', x: 15, label: '2-SWITCH CONTROL',   color: 0x3b82f6, ledColor: 0x44aaff },
  { id: '3way', x: 21, label: '3-SWITCH CONTROL',   color: 0xf59e0b, ledColor: 0xffcc44 },
];

export const workshopWiringStations = [];

// Orange-red PVC conduit running horizontally along the workshop north wall
const wsConduitMat = new THREE.MeshStandardMaterial({ color: 0xC84010, roughness: 0.55, metalness: 0.08 });
const wsConduit = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 16, 10), wsConduitMat);
wsConduit.rotation.z = Math.PI / 2;
wsConduit.position.set(15, WS_Y + 1.1, WS_Z);
scene.add(wsConduit);

// Light fixture on the wall (single bulb) — y=3.5, center of workshop
const bulbGroup = new THREE.Group();
const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.08, 20), new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.4, metalness: 0.55 }));
canopy.rotation.x = Math.PI / 2; bulbGroup.add(canopy);
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7 }));
stem.position.set(0, -0.25, 0); bulbGroup.add(stem);
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.52, 0.48, 28), new THREE.MeshStandardMaterial({ color: 0x3a2e20, roughness: 0.5, metalness: 0.2 }));
shade.position.set(0, -0.72, 0); bulbGroup.add(shade);
const bulbGeo = new THREE.SphereGeometry(0.16, 14, 10);
const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff8d0, emissive: new THREE.Color(0xfff5b0), emissiveIntensity: 0.0, roughness: 0.9 });
const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
bulbMesh.position.set(0, -0.88, 0); bulbGroup.add(bulbMesh);
bulbGroup.position.set(15, 3.88, WS_Z + 0.3);
bulbGroup.rotation.x = -Math.PI / 2;
scene.add(bulbGroup);
const bulbPoint = new THREE.PointLight(0xfff5b0, 0, 8, 1.6);
bulbPoint.position.set(15, 3.0, WS_Z + 0.3);
scene.add(bulbPoint);

// Add bulb as interactable proxy
const bulbProxy = mkBox(0.6, 0.6, 0.3, new THREE.MeshBasicMaterial({ visible: false }));
bulbProxy.position.set(15, 3.2, WS_Z + 0.3);
bulbProxy.userData = { type: 'workshop-wiring', switchType: '1way', label: 'Workshop Light — Tap to wire', bulbMat, bulbPoint };
allInteractables.push(bulbProxy);
scene.add(bulbProxy);

WIRING_STATIONS.forEach(ws => {
  const g = new THREE.Group();

  // Back plate
  const plate = mkBox(0.55, 0.75, 0.04, new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.5, metalness: 0.35 }));
  plate.position.set(0, 0, 0); g.add(plate);

  // Switch body (rocker)
  const body = mkBox(0.28, 0.45, 0.055, new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.35, metalness: 0.1 }));
  body.position.set(0, 0, 0.025); g.add(body);

  // Color accent strip at top
  const strip = mkBox(0.55, 0.06, 0.045, new THREE.MeshStandardMaterial({ color: ws.color, roughness: 0.5, metalness: 0.1, emissive: new THREE.Color(ws.color), emissiveIntensity: 0.3 }));
  strip.position.set(0, 0.41, 0.005); g.add(strip);

  // LED indicator
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({ color: ws.ledColor, emissive: new THREE.Color(ws.ledColor), emissiveIntensity: 0.8, roughness: 0.4 }));
  led.position.set(0.14, -0.28, 0.055); g.add(led);

  // Conduit drop from horizontal pipe to switch
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.08, 10), wsConduitMat);
  drop.position.set(0, 0.92, -0.01); g.add(drop);

  // Junction box
  const jb = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.4, metalness: 0.45 }));
  jb.rotation.x = Math.PI / 2; jb.position.set(0, 1.49, 0); g.add(jb);

  g.position.set(ws.x, WS_Y, WS_Z);
  scene.add(g);

  // Invisible proxy for raycasting (bigger hitbox)
  const proxy = mkBox(0.7, 0.85, 0.18, new THREE.MeshBasicMaterial({ visible: false }));
  proxy.position.set(ws.x, WS_Y, WS_Z + 0.09);
  proxy.userData = {
    type: 'workshop-wiring',
    switchType: ws.id,
    label: ws.label + ' — Tap to wire',
    _group: g,
    _led: led,
  };
  allInteractables.push(proxy);
  scene.add(proxy);
  workshopWiringStations.push({ id: ws.id, proxy, led, bulbMat, bulbPoint });
});
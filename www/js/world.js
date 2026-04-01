import * as THREE from 'three';
import { makeFloorTex, makeWallTex, makeCeilTex, makeMetalTex, makeConcrTex } from './textures.js';

// ── RENDERER ──────────────────────────────────────────────────────────────────
export const isMobile = navigator.maxTouchPoints > 0;
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: !isMobile,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.2 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc7e8f5);
scene.fog = new THREE.Fog(0xc7e8f5, 60, 120);

export const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 120);
camera.position.set(0, 1.72, -15);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ── TEXTURES ──────────────────────────────────────────────────────────────────
const fT = makeFloorTex(); fT.repeat.set(8, 8);
const wT = makeWallTex(); wT.repeat.set(4, 2);
const cT = makeCeilTex(); cT.repeat.set(8, 8);
const mT = makeMetalTex(); mT.repeat.set(2, 2);
const kT = makeConcrTex(); kT.repeat.set(4, 2);

// ── HEIGHT CONSTANTS ─────────────────────────────────────────────────────────
export const FLOOR1_Y = 0;
const H = 4.2;   // Ceiling height
const WT = 0.22; // Wall thickness

// ── MATERIALS ─────────────────────────────────────────────────────────────────
export const M = {
  floor: new THREE.MeshLambertMaterial({ map: fT }),
  wall: new THREE.MeshLambertMaterial({ map: wT }),
  ceil: new THREE.MeshLambertMaterial({ map: cT }),
  concrete: new THREE.MeshLambertMaterial({ map: kT, color: 0xaaaaaa }),
  door: new THREE.MeshLambertMaterial({ color: 0xb08050 }),
  doorFrame: new THREE.MeshLambertMaterial({ map: mT, color: 0x99aabb }),
  panel: new THREE.MeshLambertMaterial({ color: 0x2a4a62 }),
  panelGrey: new THREE.MeshLambertMaterial({ map: mT, color: 0x6a7a88 }),
  yellow: new THREE.MeshLambertMaterial({ color: 0xf0c060, emissive: new THREE.Color(0xf0c060), emissiveIntensity: .5 }),
  red: new THREE.MeshLambertMaterial({ color: 0xdd4433, emissive: new THREE.Color(0xdd4433), emissiveIntensity: .6 }),
  green: new THREE.MeshLambertMaterial({ color: 0x33dd66, emissive: new THREE.Color(0x33dd66), emissiveIntensity: .7 }),
  orange: new THREE.MeshLambertMaterial({ color: 0xff8833, emissive: new THREE.Color(0xff8833), emissiveIntensity: .5 }),
  bench: new THREE.MeshLambertMaterial({ color: 0x9a8065 }),
  black: new THREE.MeshLambertMaterial({ color: 0x111111 }),
  chrome: new THREE.MeshLambertMaterial({ map: mT, color: 0xccddef }),
  pipe: new THREE.MeshLambertMaterial({ map: mT, color: 0x778899 }),
  eWhite: new THREE.MeshBasicMaterial({ color: 0xfff8e0 }),
  eBlue: new THREE.MeshBasicMaterial({ color: 0x3388ff }),
  eGreen: new THREE.MeshBasicMaterial({ color: 0x22ff88 }),
  eRed: new THREE.MeshBasicMaterial({ color: 0xff3322 }),
  eYellow: new THREE.MeshBasicMaterial({ color: 0xffee00 }),
  window: new THREE.MeshBasicMaterial({ color: 0x88c4f5, transparent: true, opacity: .35, side: THREE.DoubleSide }),
  winFrame: new THREE.MeshLambertMaterial({ color: 0xf0f0f0 }),
  signYellow: new THREE.MeshBasicMaterial({ color: 0xffe000 }),
  signBlack: new THREE.MeshBasicMaterial({ color: 0x111111 }),
  copper: new THREE.MeshLambertMaterial({ color: 0xd97845 }),
  generator: new THREE.MeshLambertMaterial({ color: 0x4a5a3a }),
  stair: new THREE.MeshLambertMaterial({ map: mT, color: 0x667788 }),
  grating: new THREE.MeshLambertMaterial({ map: mT, color: 0x556677, wireframe: false }),
  handrail: new THREE.MeshLambertMaterial({ map: mT, color: 0xaabbcc }),
  serverRack: new THREE.MeshLambertMaterial({ color: 0x1a2233 }),
  serverLed: new THREE.MeshBasicMaterial({ color: 0x00ff88 }),
  glassFloor: new THREE.MeshLambertMaterial({ color: 0x4488aa, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
};

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
export function checkCol(pos) {
  const pb = new THREE.Box3(
    new THREE.Vector3(pos.x - .32, pos.y - 1.65, pos.z - .32),
    new THREE.Vector3(pos.x + .32, pos.y + .12, pos.z + .32)
  );
  return colBoxes.some(b => b.intersectsBox(pb));
}

// ── LIGHTING ──────────────────────────────────────────────────────────────────
export const roomLightSets = {};
export const ambLight = new THREE.AmbientLight(0xffeedd, 1.2);
scene.add(ambLight);
scene.add(new THREE.HemisphereLight(0xb8d8f0, 0x8a7a60, 0.8));

const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
sunLight.position.set(30, 45, -20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
scene.add(sunLight);

export const warnLight = new THREE.PointLight(0xff2200, 0, 20);
warnLight.position.set(0, 3.5, -15);
scene.add(warnLight);

export function mkLight(x, y, z, color, intensity, key) {
  const pt = new THREE.PointLight(color, intensity, 22, 2);
  pt.position.set(x, y, z);
  scene.add(pt);

  // Fluorescent tube fixture
  const fixtureBase = mkBox(0.18, 0.06, 1.6, M.panelGrey);
  fixtureBase.position.set(x, y + 0.06, z);
  scene.add(fixtureBase);

  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8),
    M.eWhite
  );
  tube.rotation.z = Math.PI / 2;
  tube.position.set(x, y, z);
  scene.add(tube);

  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), M.eWhite);
  disc.rotation.x = Math.PI / 2;
  disc.position.set(x, y - 0.04, z);
  scene.add(disc);

  if (key) {
    if (!roomLightSets[key]) roomLightSets[key] = [];
    roomLightSets[key].push(pt);
  }
  return pt;
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

  const winPt = new THREE.PointLight(0x9dccff, 1.5, 14);
  winPt.position.set(
    x + (isVertical ? -1 : 0),
    y + 0.5,
    z + (isVertical ? 0 : -1)
  );
  scene.add(winPt);
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
mkRoom(10, 21, 12, 14);        // Utility
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
mkWall(26.11, OMY, -10, WT, OW, 20.22, M.concrete);   // Workshop E
mkWall(20.11, OMY, 7, WT, OW, 14.22, M.concrete);   // Gen E (partial, rest is control W)
mkWall(34.11, OMY, 7, WT, OW, 44.22, M.concrete);   // Control/Lab E

// North boundaries
mkWall(27, OMY, -8.11, 14.22, OW, WT, M.concrete);  // Control N
mkWall(15, OMY, -20.11, 22.22, OW, WT, M.concrete);  // Workshop N
mkWall(-8, OMY, -12.11, 12.22, OW, WT, M.concrete);  // Dist A N

// South boundaries
mkWall(27, OMY, 22.11, 14.22, OW, WT, M.concrete);  // Lab S
mkWall(10, OMY, 28.11, 12.22, OW, WT, M.concrete);  // Utility S (stairwell cuts through)
mkWall(-8, OMY, 28.11, 12.22, OW, WT, M.concrete);  // Storage S

// Stairwell outer
mkWall(7, OMY, 34.11, 6.22, OW, WT, M.concrete);  // Stairwell S
mkWall(4.11, OMY, 30, WT, OW, 8.22, M.concrete); // Stairwell W
mkWall(9.89, OMY, 30, WT, OW, 8.22, M.concrete); // Stairwell E

// ── FLOOR 1: INNER WALLS WITH DOORS ──────────────────────────────────────────
// Entrance / Corridor (z=-20)
wallDoor(-20, -2, 4, 1, 1.5, false);

// Corridor / Workshop (x=4)
wallDoor(4, -20, 0, -10, 1.5, true);

// Corridor / Generator Room (x=4)
wallDoor(4, 0, 14, 7, 1.5, true);

// Corridor / Distribution A (x=-2)
wallDoor(-2, -12, 2, -5, 1.5, true);

// Corridor / Distribution B (x=-2)
wallDoor(-2, 2, 16, 9, 1.5, true);

// Generator / Control Center (x=20)
wallDoor(20, -8, 10, 1, 1.5, true);

// Control / Testing Lab (z=10)
wallDoor(10, 20, 34, 27, 1.5, false);

// Distribution B / Storage (z=16)
wallDoor(16, -14, -2, -8, 1.5, false);

// Generator / Utility Room (z=14)
wallDoor(14, 4, 16, 10, 1.5, false);

// Workshop south wall (z=0)
mkWall(15, OMY, 0.11, 22, OW, WT, M.wall);

// Distribution A/B divider (z=2)
mkWall(-8, OMY, 2, 12, OW, WT, M.wall);

// Utility west wall (x=4) above z=14
mkWall(4.11, OMY, 21, WT, OW, 14, M.wall);

// Stairwell door opening in utility S wall
wallDoor(28, 4, 10, 7, 2.0, false);  // Utility / Stairwell opening

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
mkLight(1, H - .2, -24, 0xfff5dd, 4.0, 'entrance');

for (let z = -17; z <= 24; z += 7) mkLight(1, H - .2, z, 0xfff0dd, 4.5, 'corridor');

for (let x = 9; x <= 23; x += 7) {
  for (let z = -17; z <= -3; z += 7) {
    mkLight(x, H - .2, z, 0xffe8aa, 4.2, 'workshop');
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

for (let z = -18; z <= 24; z += 4) stripe(-2, z, 4, z);
for (let x = 6; x <= 24; x += 4) stripe(x, -20, x, 0);
stripe(4, 0, 4, 14);

// ── FLOOR 1: EMERGENCY LIGHTS ────────────────────────────────────────────────
function emergencyLight(x, y, z, ry = 0) {
  const g = new THREE.Group();
  const base = mkBox(.1, .2, .85, M.black);
  g.add(base);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(.07, .75), M.eGreen);
  strip.position.set(.06, 0, 0);
  g.add(strip);
  g.position.set(x, y, z);
  g.rotation.y = ry;
  scene.add(g);
  const ept = new THREE.PointLight(0x00ff88, .35, 4);
  ept.position.set(x + .3, y, z);
  scene.add(ept);
}

for (let z = -18; z <= 22; z += 6) {
  emergencyLight(3.88, .3, z, Math.PI / 2);
  emergencyLight(-1.88, .3, z, -Math.PI / 2);
}

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

for (let z = -19; z <= -2; z += 5) {
  conduit(3.88, z, 1.5, 0, 3.2);
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

[-17, -10, -3, 4, 11, 18].forEach(z => junctionBox(3.88, 2.0, z, Math.PI / 2));
[9, 15, 21].forEach(x => junctionBox(x, 2.0, -19.88, 0));

// ══════════════════════════════════════════════════════════════════════════════
// INTERACTABLES
// ══════════════════════════════════════════════════════════════════════════════
export const allInteractables = [];

// ── MAIN GENERATOR ────────────────────────────────────────────────────────────
export const generator = {
  running: false,
  rpm: 0,
  targetRpm: 0,
  load: 0,
  temp: 22,
  fuel: 85,
  group: new THREE.Group(),
  parts: {}
};

function buildGenerator(cx, cz) {
  const g = generator.group;

  // Base plate
  const base = mkBox(4.0, 0.18, 2.6, M.concrete);
  base.position.set(0, 0.09, 0);
  g.add(base);

  // Main engine housing
  const body = mkBox(3.2, 1.6, 2.0, M.generator);
  body.position.set(0, 0.98, 0);
  g.add(body);

  // Alternator end
  const alt = mkBox(1.0, 1.4, 1.8, M.panelGrey);
  alt.position.set(1.6, 0.9, 0);
  g.add(alt);

  // Flywheel
  const flywheel = new THREE.Mesh(
    new THREE.CylinderGeometry(.75, .75, .28, 28),
    M.chrome
  );
  flywheel.rotation.z = Math.PI / 2;
  flywheel.position.set(2.25, 0.9, 0);
  g.add(flywheel);
  generator.parts.flywheel = flywheel;

  // Flywheel spokes
  for (let i = 0; i < 6; i++) {
    const spoke = mkBox(.06, .06, 1.35, M.panelGrey);
    spoke.rotation.z = (i / 6) * Math.PI * 2;
    spoke.position.set(2.25, 0.9, 0);
    g.add(spoke);
  }
  generator.parts.flywheelGroup = flywheel;

  // Control panel face
  const ctrlPanel = mkBox(.08, 1.1, 1.6, M.panel);
  ctrlPanel.position.set(-1.65, 1.0, 0);
  g.add(ctrlPanel);

  // Gauges on control panel - 3 round analog gauges
  const gauges = [];
  [-0.5, 0, 0.5].forEach((dz, i) => {
    const gaugeRim = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .04, 24), M.chrome);
    gaugeRim.rotation.z = Math.PI / 2;
    gaugeRim.position.set(-1.7, 1.3, dz);
    g.add(gaugeRim);
    const gaugeFace = new THREE.Mesh(new THREE.CircleGeometry(.10, 24),
      new THREE.MeshBasicMaterial({ color: [0x001100, 0x110800, 0x000811][i] }));
    gaugeFace.rotation.y = Math.PI / 2;
    gaugeFace.position.set(-1.72, 1.3, dz);
    g.add(gaugeFace);
    const needle = new THREE.Mesh(new THREE.PlaneGeometry(.015, .08),
      new THREE.MeshBasicMaterial({ color: [0x00ff88, 0xffcc00, 0xff4422][i] }));
    needle.rotation.y = Math.PI / 2;
    needle.position.set(-1.72, 1.36, dz);
    g.add(needle);
    gauges.push({ face: gaugeFace, needle });
  });
  generator.parts.gauges = gauges;

  // Start button (green cylinder)
  const startBtn = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .06, 16), M.green);
  startBtn.rotation.z = Math.PI / 2;
  startBtn.position.set(-1.7, 0.85, -0.35);
  g.add(startBtn);
  startBtn.userData = { type: 'generator-start', label: 'Start Generator' };
  allInteractables.push(startBtn);

  // Stop button (red cylinder)
  const stopBtn = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .06, 16), M.red);
  stopBtn.rotation.z = Math.PI / 2;
  stopBtn.position.set(-1.7, 0.85, 0.35);
  g.add(stopBtn);
  stopBtn.userData = { type: 'generator-stop', label: 'Stop Generator' };
  allInteractables.push(stopBtn);

  // Exhaust stack
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, 2.2, 14), M.pipe);
  exhaust.position.set(-.8, 2.9, -.8);
  g.add(exhaust);

  // Exhaust elbow
  const elbow = new THREE.Mesh(new THREE.TorusGeometry(.2, .07, 10, 16, Math.PI / 2), M.pipe);
  elbow.rotation.x = Math.PI / 2;
  elbow.position.set(-.8, 2.2, -.62);
  g.add(elbow);

  // Fuel tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.1, 20), M.chrome);
  tank.position.set(1.2, 0.65, -0.9);
  g.add(tank);

  // Tank label stripe
  const stripe = mkBox(.01, .3, 1.1, M.yellow);
  stripe.rotation.y = Math.PI / 2;
  stripe.position.set(1.62, 0.65, -.9);
  g.add(stripe);

  // Vibration isolators (feet)
  [[-1.5, -1.1], [-1.5, 1.1], [1.5, -1.1], [1.5, 1.1]].forEach(([dx, dz]) => {
    const iso = new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .12, 12), M.black);
    iso.position.set(dx, 0, dz);
    g.add(iso);
  });

  g.position.set(cx, 0, cz);
  scene.add(g);
  addCol(cx, 0.9, cz, 4.2, 1.8, 2.8);
}

buildGenerator(8, 7);

export function updateGenerator(dt) {
  const g = generator;
  if (g.rpm !== g.targetRpm) {
    g.rpm += (g.targetRpm - g.rpm) * Math.min(1, dt * 0.6);
  }
  if (g.parts.flywheel) {
    g.parts.flywheel.rotation.y += (g.rpm / 1500) * dt * Math.PI * 4;
  }
  if (g.running) {
    g.temp = Math.min(90, g.temp + dt * 2.5);
    g.fuel = Math.max(0, g.fuel - dt * 0.4);
  } else {
    g.temp = Math.max(22, g.temp - dt * 1.2);
  }
  if (g.parts.gauges) {
    g.parts.gauges[0].face.material.color.setHex(g.rpm > 1400 ? 0x001100 : 0x0a0800);
    g.parts.gauges[1].face.material.color.setHex(g.temp > 75 ? 0x110200 : 0x080800);
    g.parts.gauges[2].face.material.color.setHex(g.fuel > 20 ? 0x001100 : 0x110000);
    // Needle angle based on value
    const rpmAngle = (g.rpm / 1500) * Math.PI * 0.8 - Math.PI * 0.4;
    const tempAngle = ((g.temp - 22) / 68) * Math.PI * 0.8 - Math.PI * 0.4;
    const fuelAngle = (g.fuel / 100) * Math.PI * 0.8 - Math.PI * 0.4;
    [rpmAngle, tempAngle, fuelAngle].forEach((angle, i) => {
      if (g.parts.gauges[i].needle) {
        g.parts.gauges[i].needle.rotation.z = angle;
      }
    });
  }
}

// ── SCADA TERMINALS ───────────────────────────────────────────────────────────
export const scadaTerminals = [];

function buildSCADA(cx, cz, idx) {
  const g = new THREE.Group();

  // Desk surface
  const desk = mkBox(2.6, 0.06, 1.3, M.bench);
  desk.position.set(0, 0.97, 0);
  g.add(desk);

  // Desk modesty panel (front)
  const front = mkBox(2.6, 0.9, 0.04, M.panelGrey);
  front.position.set(0, 0.5, 0.63);
  g.add(front);

  // Desk legs
  [[-1.15, -.58], [-1.15, .58], [1.15, -.58], [1.15, .58]].forEach(([dx, dz]) => {
    const leg = mkBox(.07, 1.0, .07, M.chrome);
    leg.position.set(dx, .5, dz);
    g.add(leg);
  });

  // Monitor arm
  const arm = mkBox(.06, .35, .06, M.panelGrey);
  arm.position.set(0, 1.18, .1);
  g.add(arm);

  // Monitor bezel
  const bezel = mkBox(.85, .58, .06, M.black);
  bezel.position.set(0, 1.6, .12);
  bezel.rotation.x = -.12;
  g.add(bezel);

  // Screen face
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x001133 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.76, .50), screenMat);
  screen.position.set(0, 1.6, .15);
  screen.rotation.x = -.12;
  g.add(screen);

  // Data scan lines
  const dataLines = [];
  for (let i = 0; i < 9; i++) {
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6
    });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.022), lineMat);
    line.position.set(0, 1.35 + i * .052, .155);
    line.rotation.x = -.12;
    g.add(line);
    dataLines.push(line);
  }

  // Keyboard
  const kb = mkBox(.62, .022, .28, M.panelGrey);
  kb.position.set(0, .99, -.2);
  g.add(kb);

  // Keys (decorative)
  for (let kx = -2; kx <= 2; kx++) {
    for (let kz = 0; kz < 3; kz++) {
      const key = mkBox(.052, .016, .052, M.black);
      key.position.set(kx * .11, 1.012, -.32 + kz * .08);
      g.add(key);
    }
  }

  // Side panel buttons
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .035, 14), M.eBlue);
  btn.rotation.x = Math.PI / 2;
  btn.position.set(.48, 1.02, .3);
  g.add(btn);
  btn.userData = { type: 'scada-terminal', idx, label: `SCADA Terminal ${idx + 1}` };
  allInteractables.push(btn);

  // Power LED
  const led = new THREE.Mesh(new THREE.CircleGeometry(.018, 12), M.eGreen);
  led.position.set(.5, 1.34, .155);
  led.rotation.x = -.12;
  g.add(led);

  g.position.set(cx, 0, cz);
  scene.add(g);
  addCol(cx, .5, cz, 2.8, 1.0, 1.5);

  scadaTerminals.push({ group: g, screen: screenMat, dataLines, active: false, dataScroll: 0 });
}

buildSCADA(22, -5, 0);
buildSCADA(26, 1, 1);
buildSCADA(30, 6, 2);

export function updateSCADA(dt, animT) {
  scadaTerminals.forEach((term, i) => {
    term.dataScroll += dt;
    if (term.active) {
      // Scrolling green lines
      term.dataLines.forEach((line, j) => {
        const phase = ((term.dataScroll * 1.8 + j * 0.35) % 1.5);
        line.material.opacity = phase < 0.75 ? phase / 0.75 : (1.5 - phase) / 0.75;
      });
      // Screen pulse
      const b = (Math.sin(animT * 2.5 + i * 1.1) * .5 + .5) * .25;
      term.screen.color.setRGB(0, b + .05, .25 + b);
    } else {
      term.dataLines.forEach(l => { l.material.opacity = 0.05; });
      term.screen.color.setRGB(0, .005, .02);
    }
  });
}

// ── WORKBENCHES ───────────────────────────────────────────────────────────────
function workbench(cx, cz) {
  // Top surface
  place(mkBox(2.7, .07, 1.15, M.bench), cx, 0.965, cz);
  // Under shelf
  place(mkBox(2.7, .05, 1.0, M.panelGrey), cx, .5, cz);
  // Back rail
  place(mkBox(2.7, .55, .06, M.panelGrey), cx, 1.28, cz + .56);
  // Legs
  [[-1.25, -.52], [-1.25, .52], [1.25, -.52], [1.25, .52]].forEach(([dx, dz]) => {
    place(mkBox(.07, 1.0, .07, M.chrome), cx + dx, .5, cz + dz);
  });
  addCol(cx, .5, cz, 2.7, 1.0, 1.15);
}

workbench(9, -11); workbench(9, -17);
workbench(16, -11); workbench(16, -17);
workbench(22, -11);

// Lab benches
workbench(22, 12); workbench(28, 12);
workbench(22, 18); workbench(28, 18);

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
addShelf(25.4, -16, Math.PI / 2);
addShelf(25.4, -10, Math.PI / 2);

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

// Fire extinguisher
const ext = mkCyl(.1, .68, M.red);
place(ext, -1.88, 0.34, -9);
place(mkCyl(.05, .14, M.chrome), -1.88, 0.72, -9);
place(mkBox(.06, .02, .28, M.chrome), -1.88, 0.8, -9);  // hose bracket

// First aid boxes
[[-.88, 1.75, 3, -Math.PI / 2], [3.88, 1.75, -16, Math.PI / 2]].forEach(([x, y, z, ry]) => {
  const box = mkBox(.44, .38, .14, new THREE.MeshLambertMaterial({ color: 0xee3333 }));
  box.position.set(x, y, z);
  box.rotation.y = ry;
  scene.add(box);
  // White cross
  place(mkBox(.28, .05, .01, M.winFrame), x, y, z + .075);
  place(mkBox(.05, .28, .01, M.winFrame), x, y, z + .075);
});

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

// Server racks (control room)
function serverRack(x, z) {
  const rack = mkBox(.85, 2.1, .65, M.serverRack);
  place(rack, x, 1.05, z);
  addCol(x, 1.05, z, .85, 2.1, .65);
  // 1U blanks and server faces
  for (let i = 0; i < 12; i++) {
    const face = mkBox(.78, .14, .04, new THREE.MeshLambertMaterial({
      color: i % 3 === 0 ? 0x223344 : 0x1a2233
    }));
    face.position.set(x, 0.2 + i * .17, z + .335);
    scene.add(face);
    // LEDs
    const ledColor = Math.random() > .25 ? 0x00ff88 : (Math.random() > .5 ? 0xff8800 : 0xff3322);
    const led = new THREE.Mesh(new THREE.CircleGeometry(.016, 10),
      new THREE.MeshBasicMaterial({ color: ledColor }));
    led.position.set(x + .3, .2 + i * .17, z + .36);
    scene.add(led);
  }
}
serverRack(27, -5); serverRack(31, -4); serverRack(27, 5);

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
chair(21, -5); chair(25, 1); chair(29, 6);

// ── ENTRANCE AREA ─────────────────────────────────────────────────────────────
const entranceGroup = new THREE.Group();
scene.add(entranceGroup);

// Emergency Stop Button (Moved properly to a wall near the entrance door)
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
eStopGrp.position.set(2.8, 1.3, -20.1); // Placed on South wall near entrance door
eStopGrp.rotation.y = Math.PI; // Face north
entranceGroup.add(eStopGrp);

// Reception Desk
const deskWoodMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 }); // Warm wood
const deskTop = mkBox(2.2, 0.08, 1.2, deskWoodMat);
deskTop.position.set(2.5, 0.9, -24);
addCol(2.5, 0.45, -24, 2.2, 0.9, 1.2);
entranceGroup.add(deskTop);

const deskFront = mkBox(0.1, 0.9, 1.2, M.panel);
deskFront.position.set(1.45, 0.45, -24);
entranceGroup.add(deskFront);

const deskSide1 = mkBox(2.2, 0.9, 0.1, M.panel);
deskSide1.position.set(2.5, 0.45, -24.55);
entranceGroup.add(deskSide1);

const deskSide2 = mkBox(2.2, 0.9, 0.1, M.panel);
deskSide2.position.set(2.5, 0.45, -23.45);
entranceGroup.add(deskSide2);

// Monitor on desk
const monitor = mkBox(.5, .35, .05, M.black);
monitor.position.set(1.7, 1.1, -24);
monitor.rotation.y = Math.PI / 8;
entranceGroup.add(monitor);
const mScreen = new THREE.Mesh(new THREE.PlaneGeometry(.46, .3), new THREE.MeshBasicMaterial({ color: 0x22aaff }));
mScreen.position.set(1.67, 1.1, -24);
mScreen.rotation.y = -Math.PI / 2 + Math.PI / 8;
entranceGroup.add(mScreen);

// Small props on desk
const paperStack = mkBox(.3, .05, .2, new THREE.MeshLambertMaterial({ color: 0xffffff }));
paperStack.position.set(2.4, 0.965, -23.8);
paperStack.rotation.y = 0.2;
entranceGroup.add(paperStack);

const book = mkBox(.2, .04, .25, new THREE.MeshLambertMaterial({ color: 0x992222 }));
book.position.set(2.4, 0.96, -24.2);
book.rotation.y = -0.1;
entranceGroup.add(book);

// Waiting Chairs (West Wall)
const fabricMat = new THREE.MeshLambertMaterial({ color: 0x477a94 }); // Bright blue fabric
for (let i = 0; i < 3; i++) {
  const cx = -1.5;
  const cz = -26 + i * 1.5;
  const cSeat = mkBox(.6, .1, .6, fabricMat);
  cSeat.position.set(cx, 0.45, cz);
  addCol(cx, 0.22, cz, .6, .45, .6);
  entranceGroup.add(cSeat);
  
  const cBack = mkBox(.1, .6, .6, fabricMat);
  cBack.position.set(cx - 0.25, 0.8, cz);
  entranceGroup.add(cBack);
  
  const legMat = M.chrome;
  const l1 = mkBox(.05, .4, .05, legMat); l1.position.set(cx - 0.2, 0.2, cz - 0.2); entranceGroup.add(l1);
  const l2 = mkBox(.05, .4, .05, legMat); l2.position.set(cx - 0.2, 0.2, cz + 0.2); entranceGroup.add(l2);
  const l3 = mkBox(.05, .4, .05, legMat); l3.position.set(cx + 0.2, 0.2, cz - 0.2); entranceGroup.add(l3);
  const l4 = mkBox(.05, .4, .05, legMat); l4.position.set(cx + 0.2, 0.2, cz + 0.2); entranceGroup.add(l4);
}

// Plant pot
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.5, 12), new THREE.MeshLambertMaterial({ color: 0xddccaa }));
pot.position.set(-1.4, 0.25, -22);
addCol(-1.4, 0.25, -22, 0.6, 0.5, 0.6);
entranceGroup.add(pot);

// Decorative Leaves
for (let i = 0; i < 6; i++) {
  const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), new THREE.MeshLambertMaterial({ color: 0x33aa44, side: THREE.DoubleSide }));
  leaf.position.set(-1.4, 0.8, -22);
  leaf.rotation.y = (i / 6) * Math.PI * 2;
  leaf.rotation.x = -Math.PI / 6;
  entranceGroup.add(leaf);
}

// Wall Painting
const paintingGeom = new THREE.PlaneGeometry(2, 1.2);
const pMat = new THREE.MeshBasicMaterial({ color: 0xffcc88 }); // Bright abstract color
const painting = new THREE.Mesh(paintingGeom, pMat);
painting.position.set(-1.98, 1.8, -25);
painting.rotation.y = Math.PI / 2;
entranceGroup.add(painting);

const pFrame = mkBox(.05, 1.25, 2.05, new THREE.MeshLambertMaterial({ color: 0x111111 }));
pFrame.position.set(-1.99, 1.8, -25);
entranceGroup.add(pFrame);

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
    if (this._ci !== undefined) colBoxes.splice(this._ci, 1);
    if (!this.open) {
      const p = this.pivot.position;
      const w = this.isXWall ? 0.2 : this.panel.geometry.parameters.width;
      const d = this.isXWall ? this.panel.geometry.parameters.depth : 0.2;
      this._ci = colBoxes.length;
      colBoxes.push(new THREE.Box3(
        new THREE.Vector3(p.x - w / 2, this.floorY, p.z - d / 2),
        new THREE.Vector3(p.x + w / 2, this.floorY + 2.4, p.z + d / 2)
      ));
    } else {
      this._ci = undefined;
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
  new Door(1, -20, 0.3, -20, 1.5, -Math.PI * .75, 'Entrance', false),
  new Door(4, -10, 4, -10.7, 1.5, Math.PI * .75, 'Workshop', true),
  new Door(4, 7, 4, 6.3, 1.5, Math.PI * .75, 'Generator Room', true),
  new Door(20, 1, 20, 0.3, 1.5, -Math.PI * .75, 'Control Center', true),
  new Door(-2, -5, -2, -5.7, 1.5, Math.PI * .75, 'Distribution A', true),
  new Door(-2, 9, -2, 8.3, 1.5, Math.PI * .75, 'Distribution B', true),
  new Door(27, 10, 26.3, 10, 1.5, -Math.PI * .75, 'Testing Lab', false),
  new Door(-8, 16, -8.7, 16, 1.5, -Math.PI * .75, 'Storage', false),
  new Door(10, 14, 9.3, 14, 1.5, Math.PI * .75, 'Utility Room', false),
  // Stairwell door
  new Door(7, 28, 6.3, 28, 2.0, -Math.PI * .75, 'Stairwell', false),
];
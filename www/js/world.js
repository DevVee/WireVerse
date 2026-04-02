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
export const ambLight = new THREE.AmbientLight(0x667799, 1.2);
scene.add(ambLight);
scene.add(new THREE.HemisphereLight(0x88bbff, 0x334455, 0.6));

const sunLight = new THREE.DirectionalLight(0x6699ff, 0.8);
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
// Workshop/Control partition wall
mkWall(20.11, OMY, -4, WT, OW, 8.22, M.wall);
mkWall(20.11, OMY, 7, WT, OW, 14.22, M.concrete);   // Gen E (partial, rest is control W)
mkWall(34.11, OMY, 7, WT, OW, 44.22, M.concrete);   // Control/Lab E

// North boundaries
mkWall(27, OMY, -8.11, 14.22, OW, WT, M.concrete);  // Control N
mkWall(15, OMY, -20.11, 22.22, OW, WT, M.concrete);  // Workshop N
mkWall(-8, OMY, -12.11, 12.22, OW, WT, M.concrete);  // Dist A N

// South boundaries
mkWall(27, OMY, 22.11, 14.22, OW, WT, M.concrete);  // Lab S
mkWall(12, OMY, 28.11, 16.22, OW, WT, M.concrete);  // Utility S (stairwell cuts through)
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
mkLight(1, H - .2, -24, 0xffeedd, 1.8, 'entrance');

for (let z = -17; z <= 24; z += 7) mkLight(1, H - .2, z, 0x11aaff, 3.2, 'corridor');

for (let x = 9; x <= 23; x += 7) {
  for (let z = -17; z <= -3; z += 7) {
    mkLight(x, H - .2, z, 0xd0f0ff, 6.0, 'workshop'); // brighter techy light
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
    proxy.userData = { type: 'tool-pickup', toolId: id, label: `Pick up ${label}` };
    allInteractables.push(proxy);
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
    proxy.userData = {
      type:         'wire-object',
      wireId:       id,
      wireName:     name,
      state:        'unprocessed',
      wireMesh:     wire,
      insMesh:      insEnd,
      baseColor,
      strippedColor,
      label:        `Inspect wire — ${name}`,
    };
    allInteractables.push(proxy);
    scene.add(proxy);

    wireObjects.push({
      id, proxy, wireMesh: wire, insMesh: insEnd,
      state: 'unprocessed', wireMat, baseColor, strippedColor,
    });
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
    clipProxy.userData = { type: 'schematic', scenarioId: 'S01', label: 'View Wiring Schematic' };
    allInteractables.push(clipProxy);
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
    proxy.userData = {
      type:            'terminal-block',
      terminalId:      termId,
      state:           'empty',     // empty → connected → tightened
      label:           `Terminal ${termId} — Connect wire`,
      colorMesh:       lbColor,
      wirePlaceholder: wirePlaceholder,
      wirePlaceholderMat,
    };
    allInteractables.push(proxy);
    scene.add(proxy);

    scenarioTerminals.push({ termId, proxy, state: 'empty', wirePlaceholder, wirePlaceholderMat });
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

    validationBoard.leds.push({ led, ledMat, glow, checkId, lit: false });
  });

  // VALIDATE button (big blue press)
  const valBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.06, 18),
    M.eBlue
  );
  valBtn.rotation.x = Math.PI / 2;
  valBtn.position.set(BX, BY + 1.48, BZ - 0.19);
  scene.add(valBtn);
  valBtn.userData = { type: 'validate-board', label: 'Run Validation Check' };
  allInteractables.push(valBtn);

  // Safety label for the board
  const safetyLbl = mkBox(1.18, 0.12, 0.01,
    new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
  safetyLbl.position.set(BX, BY + 1.3, BZ - 0.19);
  scene.add(safetyLbl);
}

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
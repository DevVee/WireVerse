/**
 * outlets.js — 5 realistic broken outlet sockets placed around the facility.
 * Each socket looks like the repair model (junction box, face plate, center screw,
 * pin slots) and has a small breaker box to the left on the same wall.
 * Glows red-orange (broken) and turns green (fixed) after repair.
 */

import * as THREE from 'three';
import { scene, allInteractables } from './world.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
function mkBox(w, h, d, color, rough = 0.7, metal = 0.05) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  );
}
function mkCyl(rt, rb, h, segs, color, rough = 0.4, metal = 0.3) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  );
}

// ── Socket positions ──────────────────────────────────────────────────────────
// (x, y, z) = world position; ry = rotation around Y so face points INTO the room
// Spread across different walls for better exploration discoverability.
const SOCKET_DEFS = [
  // Entrance — north wall (z≈8), face south (ry=π)
  { id: 1, x:  3.0,   y: 0.42, z:  7.88, ry:  Math.PI,      room: 'Entrance'   },
  // Workshop 1 — west wall (x≈-8), face east (ry=π/2)
  { id: 2, x: -7.88,  y: 0.42, z:  -8.0, ry:  Math.PI / 2,  room: 'Workshop 1' },
  // Workshop 2 — south wall (z≈-32), face north (ry=0)
  { id: 3, x: -3.0,   y: 0.42, z: -31.88, ry: 0,             room: 'Workshop 2' },
];

export const outletSockets = [];

SOCKET_DEFS.forEach(def => {
  // Root group — positioned at wall, rotated so +Z faces into the room
  const group = new THREE.Group();
  group.position.set(def.x, def.y, def.z);
  group.rotation.y = def.ry;

  // ── Junction / Back box (embedded in wall) ────────────────────────────────
  const jBox = mkBox(0.18, 0.22, 0.06, 0x5a4020, 0.92, 0.02);
  jBox.position.z = 0.009;
  group.add(jBox);

  // ── Metal flange / mounting plate ─────────────────────────────────────────
  const flange = mkBox(0.20, 0.24, 0.012, 0x909090, 0.45, 0.55);
  flange.position.z = 0.021;
  group.add(flange);

  // ── Face plate (cream-colored, slightly raised) ───────────────────────────
  const facePlate = mkBox(0.155, 0.195, 0.014, 0xd8d3c8, 0.65, 0.04);
  facePlate.position.z = 0.030;
  group.add(facePlate);

  // ── Socket face inset (dark recess) ───────────────────────────────────────
  const face = mkBox(0.10, 0.135, 0.008, 0x1a1a1a, 0.92, 0.0);
  face.position.z = 0.038;
  group.add(face);

  // ── Pin slots ─────────────────────────────────────────────────────────────
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
  [-0.022, 0.022].forEach(ox => {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.030, 0.012), pinMat);
    pin.position.set(ox, 0.010, 0.042);
    group.add(pin);
  });
  const earthPin = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.012, 12), pinMat);
  earthPin.rotation.x = Math.PI / 2;
  earthPin.position.set(0, -0.032, 0.042);
  group.add(earthPin);

  // ── Corner mounting screws ────────────────────────────────────────────────
  const screwMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.22, metalness: 0.75 });
  [-0.058, 0.058].forEach(ox => [-0.082, 0.082].forEach(oy => {
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.009, 8), screwMat);
    sc.rotation.x = Math.PI / 2;
    sc.position.set(ox, oy, 0.036);
    group.add(sc);
  }));

  // ── Center cover screw ────────────────────────────────────────────────────
  const centerScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.008, 0.010, 16), screwMat);
  centerScrew.rotation.x = Math.PI / 2;
  centerScrew.position.set(0, 0.090, 0.038);
  group.add(centerScrew);
  // Screw slot cross
  for (let i = 0; i < 2; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.002, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x333333 }));
    slot.rotation.z = i * Math.PI / 2;
    slot.position.set(0, 0.090, 0.044);
    group.add(slot);
  }

  // ── Broken-status glow (pulsing red-orange) ───────────────────────────────
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff4400, transparent: true, opacity: 0.55, depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), glowMat);
  glow.position.z = 0.06;
  group.add(glow);

  // ── Outer warning ring ────────────────────────────────────────────────────
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00, transparent: true, opacity: 0.75,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.12, 20), ringMat);
  ring.position.z = 0.065;
  group.add(ring);

  // ── "FAULT" canvas label ──────────────────────────────────────────────────
  const lc = document.createElement('canvas');
  lc.width = 160; lc.height = 48;
  const lctx = lc.getContext('2d');
  lctx.clearRect(0, 0, 160, 48);
  lctx.font = 'bold 22px sans-serif';
  lctx.fillStyle = '#ff4400';
  lctx.textAlign = 'center';
  lctx.fillText('⚡ FAULT', 80, 32);
  const labelMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(lc), transparent: true,
    opacity: 1.0, depthWrite: false, side: THREE.DoubleSide,
  });
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.072), labelMat);
  labelMesh.position.set(0, 0.175, 0.04);
  group.add(labelMesh);

  // ── Small breaker panel box (0.55m to the left) ───────────────────────────
  const bkGroup = new THREE.Group();
  bkGroup.position.set(-0.55, 0.05, 0); // local space: left of outlet
  group.add(bkGroup);

  const bkBody = mkBox(0.10, 0.165, 0.040, 0x424242, 0.72, 0.38);
  bkBody.position.z = 0.012; bkGroup.add(bkBody);
  const bkPanel = mkBox(0.082, 0.144, 0.008, 0x2c2c2c, 0.88, 0.05);
  bkPanel.position.z = 0.035; bkGroup.add(bkPanel);
  const bkStripe = mkBox(0.082, 0.006, 0.006, 0xF5C518, 0.65, 0.1);
  bkStripe.position.set(0, 0.072, 0.038); bkGroup.add(bkStripe);

  // Breaker handle (green = ON)
  const bkHandle = mkBox(0.026, 0.032, 0.018, 0x22c55e, 0.42, 0.28);
  bkHandle.position.set(0, 0.018, 0.046); bkGroup.add(bkHandle);

  // LED indicator
  const bkLED = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.007, 8),
    new THREE.MeshStandardMaterial({
      color: 0x22c55e, roughness: 0.28, metalness: 0.5,
      emissive: new THREE.Color(0x22c55e), emissiveIntensity: 0.9,
    })
  );
  bkLED.rotation.x = Math.PI / 2;
  bkLED.position.set(0.028, 0.055, 0.034); bkGroup.add(bkLED);

  // Conduit pipe below breaker
  const conduit = mkCyl(0.012, 0.012, 0.055, 8, 0x555555, 0.8, 0.3);
  conduit.position.set(0, -0.110, 0.010); bkGroup.add(conduit);

  // ── "FIX" action label above the outlet ──────────────────────────────────
  const fixCanvas = document.createElement('canvas');
  fixCanvas.width = 160; fixCanvas.height = 52;
  const fctx = fixCanvas.getContext('2d');
  fctx.clearRect(0, 0, 160, 52);
  fctx.fillStyle = 'rgba(0,0,0,0.6)';
  fctx.roundRect(4, 4, 152, 44, 10);
  fctx.fill();
  fctx.strokeStyle = '#ffaa00';
  fctx.lineWidth = 2;
  fctx.roundRect(4, 4, 152, 44, 10);
  fctx.stroke();
  fctx.font = 'bold 24px sans-serif';
  fctx.fillStyle = '#ffaa00';
  fctx.textAlign = 'center';
  fctx.fillText('[E] FIX', 80, 34);
  const fixMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(fixCanvas), transparent: true,
    opacity: 0.0, depthWrite: false, side: THREE.DoubleSide,
  });
  const fixLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.09), fixMat);
  fixLabel.position.set(0, 0.28, 0.05);
  group.add(fixLabel);

  scene.add(group);

  // ── Invisible proxy for raycasting ────────────────────────────────────────
  const proxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.30, 0.18),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  proxy.position.set(def.x, def.y, def.z);
  proxy.rotation.y = def.ry;
  proxy.userData = {
    type:     'outlet-socket',
    socketId: def.id,
    label:    'FIX',
    room:     def.room,
    fixed:    false,
  };
  scene.add(proxy);
  allInteractables.push(proxy);

  // ── Fixed-state materials ──────────────────────────────────────────────────
  const fixedGlowMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e, transparent: true, opacity: 0.35, depthWrite: false,
  });

  // ── Footprint / arrow guide on the floor (1.5m in front of outlet) ─────────
  // Points toward the outlet so player can find it.
  // Position: 1.5 m in front = along the +Z face direction of the outlet group.
  const fpGroup = new THREE.Group();
  // Arrow chevron shape: two planes forming a >
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0xffdd00, transparent: true, opacity: 0.7,
    side: THREE.DoubleSide, depthWrite: false,
  });
  // Main chevron quad (flat on the floor)
  const arrowGeo = new THREE.PlaneGeometry(0.28, 0.44);
  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
  arrowMesh.rotation.x = -Math.PI / 2;
  fpGroup.add(arrowMesh);
  // Second smaller inner chevron
  const arrowMat2 = new THREE.MeshBasicMaterial({
    color: 0xff8800, transparent: true, opacity: 0.5,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const arrowMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.28), arrowMat2);
  arrowMesh2.rotation.x = -Math.PI / 2;
  arrowMesh2.position.y = 0.004;
  fpGroup.add(arrowMesh2);

  // Position 1.5 m in front of the outlet (in outlet-local space, then transform)
  // Local +Z is into the room (face direction). We place 1.5m forward.
  const fpOffset = new THREE.Vector3(0, 0, 1.5);
  fpOffset.applyEuler(new THREE.Euler(0, def.ry, 0));
  fpGroup.position.set(def.x + fpOffset.x, 0.06, def.z + fpOffset.z);
  // Rotate so arrow tip points toward the outlet
  fpGroup.rotation.y = def.ry + Math.PI; // face toward socket
  scene.add(fpGroup);

  // Glow ring under the arrow
  const fpRingMat = new THREE.MeshBasicMaterial({
    color: 0xffdd00, transparent: true, opacity: 0.25,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const fpRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.30, 20), fpRingMat);
  fpRing.rotation.x = -Math.PI / 2;
  fpGroup.add(fpRing);

  outletSockets.push({
    id: def.id, room: def.room,
    group, glow, ring, glowMat, ringMat, labelMesh, labelMat,
    fixedGlowMat, proxy, fixLabel, fixMat,
    footprintGroup: fpGroup, footprintArrowMat: arrowMat,
    fixed: false,
  });
});

// ── Per-frame update ──────────────────────────────────────────────────────────
export function updateOutlets(t) {
  outletSockets.forEach(s => {
    if (s.fixed) return;
    const p = Math.sin(t * 5.0) * 0.5 + 0.5;
    s.glowMat.opacity  = 0.20 + p * 0.65;
    s.ringMat.opacity  = 0.35 + p * 0.55;
    s.labelMat.opacity = 0.55 + p * 0.45;
    // FIX label fades in/out slightly to draw attention
    s.fixMat.opacity   = 0.50 + p * 0.50;

    // Footprint guide — bob up/down + pulse
    if (s.footprintGroup) {
      s.footprintGroup.position.y = 0.06 + Math.sin(t * 3.0 + s.id) * 0.04;
      s.footprintArrowMat.opacity = 0.55 + p * 0.45;
    }
  });
}

// ── Mark as fixed ─────────────────────────────────────────────────────────────
export function markOutletFixed(socketId) {
  const s = outletSockets.find(o => o.id === socketId);
  if (!s || s.fixed) return;
  s.fixed = true;
  s.proxy.userData.fixed = true;

  // Swap glow to green (static)
  s.glow.material = s.fixedGlowMat;
  s.glowMat.opacity = 0;

  // Hide fault indicators
  s.ring.visible      = false;
  s.labelMesh.visible = false;
  s.fixLabel.visible  = false;

  // Replace face plate with a lighter "repaired" color
  const plate = s.group.children.find(c =>
    c.geometry?.parameters?.width === 0.155
  );
  if (plate?.material) {
    plate.material = new THREE.MeshStandardMaterial({
      color: 0xf0ede5, roughness: 0.55, metalness: 0.04
    });
  }

  // Remove from interactables (prompt disappears)
  const idx = allInteractables.indexOf(s.proxy);
  if (idx !== -1) allInteractables.splice(idx, 1);

  // Hide footprint guide
  if (s.footprintGroup) s.footprintGroup.visible = false;
}

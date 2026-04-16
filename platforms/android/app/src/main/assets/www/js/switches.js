/**
 * switches.js
 * 3 switch-installation stations spread across 3 rooms.
 *
 * Station 1 — Workshop     : north wall, player approaches from south
 * Station 2 — Generator Rm : west wall,  player approaches from east
 * Station 3 — Utility Room : south wall (z≈14), player approaches from north
 *
 * Rotation convention: the switch face (and proxy offset) is along the GROUP's
 * local +Z.  ry=0 → faces +Z (south).  ry=π → faces -Z (north).
 * ry=π/2 → faces +X (east).  ry=-π/2 → faces -X (west).
 */

import * as THREE from 'three';
import { scene } from './world.js';

// ── Station definitions ──────────────────────────────────────────────────────
// switchType matches level IDs 4/5/6 in EXPLORE stage: 1way=station1, 2way=station2, 3way=station3
const STATION_DEFS = [
  // Station 1 — Workshop 1 south wall, face north (ry=π) — 1-Way Switch
  { id: 1, x: -5,    y: 0.90, z: -17.75, ry: Math.PI,       room: 'Workshop 1', switchType: '1way', label: '1-WAY SWITCH' },
  // Station 2 — Workshop 1 east wall, face west (ry=-π/2) — 2-Way Switch
  { id: 2, x: 7.75,  y: 0.90, z: -11,    ry: -Math.PI / 2,  room: 'Workshop 1', switchType: '2way', label: '2-WAY SWITCH' },
  // Station 3 — Workshop 2 west wall, face east (ry=π/2) — 3-Way Switch
  { id: 3, x: -7.75, y: 0.90, z: -22,    ry: Math.PI / 2,   room: 'Workshop 2', switchType: '3way', label: '3-WAY SWITCH' },
];

// ── Public exports ────────────────────────────────────────────────────────────
export const switchStations = [];   // { id, mesh, fixed }
export const switchProxies  = [];   // all meshes added to scene for raycasting

// ── Build stations ────────────────────────────────────────────────────────────
export function initSwitches() {
  STATION_DEFS.forEach(def => {
    const group = new THREE.Group();
    group.position.set(def.x, def.y, def.z);
    group.rotation.y = def.ry;

    // Wall box (backing plate)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.36, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.45, metalness: 0.4 })
    );
    box.position.z = 0.03;
    group.add(box);

    // Switch body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.20, 0.30, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 0.6, metalness: 0.05 })
    );
    body.position.z = 0.075;
    group.add(body);

    // Switch lever nub (default OFF position)
    const lever = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.14, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.1 })
    );
    lever.position.set(0, -0.02, 0.10);
    group.add(lever);

    // Glowing indicator dot — yellow = pending, green = fixed
    const dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.018, 10),
      new THREE.MeshStandardMaterial({
        color: 0xF5C200, roughness: 0.3, metalness: 0.5,
        emissive: new THREE.Color(0xF5C200), emissiveIntensity: 1.2
      })
    );
    dot.rotation.x = Math.PI / 2;
    dot.position.set(0.08, 0.12, 0.096);
    group.add(dot);

    // Station label — shows switch type (e.g. "1-WAY")
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 128; numCanvas.height = 40;
    const nc = numCanvas.getContext('2d');
    nc.clearRect(0, 0, 128, 40);
    nc.fillStyle = 'rgba(0,0,0,0.65)';
    nc.roundRect(2, 2, 124, 36, 6);
    nc.fill();
    nc.font = 'bold 14px sans-serif';
    nc.fillStyle = '#F5C200';
    nc.textAlign = 'center';
    nc.fillText(def.label || `S${def.id}`, 64, 25);
    const numTex = new THREE.CanvasTexture(numCanvas);
    const numMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.07),
      new THREE.MeshBasicMaterial({ map: numTex, transparent: true, depthWrite: false })
    );
    numMesh.position.set(0, 0.22, 0.10);
    group.add(numMesh);

    // ── Interaction proxy (full bounding box, used for raycasting) ─────────
    const proxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.position.z = 0.1;
    proxy.userData = { type: 'switch_station', stationId: def.id, switchType: def.switchType, label: `${def.label || 'Switch'} Station #${def.id}` };
    group.add(proxy);

    scene.add(group);

    // ── Floor footprint guide (1.4m in front of switch, points toward it) ──────
    const fpGroup = new THREE.Group();
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0xF5C200, transparent: true, opacity: 0.75,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const arrowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.40), arrowMat);
    arrowMesh.rotation.x = -Math.PI / 2;
    fpGroup.add(arrowMesh);
    const arrowMat2 = new THREE.MeshBasicMaterial({
      color: 0xff8800, transparent: true, opacity: 0.50,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const arrowMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.26), arrowMat2);
    arrowMesh2.rotation.x = -Math.PI / 2;
    arrowMesh2.position.y = 0.004;
    fpGroup.add(arrowMesh2);
    const fpRingMat = new THREE.MeshBasicMaterial({
      color: 0xF5C200, transparent: true, opacity: 0.22,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const fpRing = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.28, 20), fpRingMat);
    fpRing.rotation.x = -Math.PI / 2;
    fpGroup.add(fpRing);

    // Place 1.4m in front along the group's +Z direction (face direction)
    const fpOffset = new THREE.Vector3(0, 0, 1.4);
    fpOffset.applyEuler(new THREE.Euler(0, def.ry, 0));
    fpGroup.position.set(def.x + fpOffset.x, 0.06, def.z + fpOffset.z);
    fpGroup.rotation.y = def.ry + Math.PI; // tip points toward switch
    scene.add(fpGroup);

    const record = {
      id: def.id, group, body, lever, dot, proxy, dotMat: dot.material, fixed: false,
      fpGroup, arrowMat, arrowMat2, fpRingMat,
    };
    switchStations.push(record);
    switchProxies.push(proxy);
    proxy.userData._parentRecord = record;
  });
}

// ── Per-frame update (call from main loop) ────────────────────────────────────
export function updateSwitches(t) {
  switchStations.forEach(st => {
    if (st.fixed || !st.fpGroup) return;
    const p = Math.sin(t * 4.5 + st.id * 1.1) * 0.5 + 0.5;
    st.fpGroup.position.y = 0.06 + Math.sin(t * 2.8 + st.id) * 0.035;
    st.arrowMat.opacity  = 0.50 + p * 0.45;
    st.arrowMat2.opacity = 0.30 + p * 0.35;
    st.fpRingMat.opacity = 0.12 + p * 0.20;
  });
}

// ── Mark a station as fixed ───────────────────────────────────────────────────
export function markSwitchFixed(stationId) {
  const st = switchStations.find(s => s.id === stationId);
  if (!st) return;
  st.fixed = true;
  // Turn dot green
  st.dotMat.color.setHex(0x22c55e);
  st.dotMat.emissive.setHex(0x22c55e);
  st.dotMat.emissiveIntensity = 1.4;
}

// ── Draw minimap markers ──────────────────────────────────────────────────────
// Called from main.js drawMinimap loop to overlay the 3 switch markers.
export function drawSwitchMinimap(ctx, toX, toZ, mmW, mmH) {
  STATION_DEFS.forEach((def, i) => {
    const st = switchStations[i];
    const mx = toX(def.x), mz = toZ(def.z);
    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, mz, 4, 0, Math.PI * 2);
    ctx.fillStyle = st?.fixed ? '#22c55e' : '#F5C200';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });
}

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
const STATION_DEFS = [
  // Station 1 — Workshop north wall (z≈-20), face south (ry=0)
  { id: 1, x: 13, y: 0.90, z: -19.3, ry: 0,             room: 'Workshop' },
  // Station 2 — Generator Room west wall (x≈4.5), face east (ry=π/2)
  { id: 2, x: 4.5, y: 0.90, z: 7,    ry: Math.PI / 2,   room: 'Generator Room' },
  // Station 3 — Utility Room south wall (z≈14.5), face north (ry=π)
  { id: 3, x: 9,  y: 0.90, z: 14.5,  ry: Math.PI,       room: 'Utility Room' },
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

    // Station label (number)
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 64; numCanvas.height = 32;
    const nc = numCanvas.getContext('2d');
    nc.fillStyle = 'rgba(0,0,0,0)';
    nc.clearRect(0, 0, 64, 32);
    nc.font = 'bold 18px sans-serif';
    nc.fillStyle = '#F5C200';
    nc.textAlign = 'center';
    nc.fillText(`S${def.id}`, 32, 22);
    const numTex = new THREE.CanvasTexture(numCanvas);
    const numMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.06),
      new THREE.MeshBasicMaterial({ map: numTex, transparent: true, depthWrite: false })
    );
    numMesh.position.set(0, 0.20, 0.10);
    group.add(numMesh);

    // ── Interaction proxy (full bounding box, used for raycasting) ─────────
    const proxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.position.z = 0.1;
    proxy.userData = { type: 'switch_station', stationId: def.id, label: `Install Switch #${def.id}` };
    group.add(proxy);

    scene.add(group);

    const record = { id: def.id, group, body, lever, dot, proxy, dotMat: dot.material, fixed: false };
    switchStations.push(record);
    switchProxies.push(proxy);
    // also push body so broad raycasts pick it up
    proxy.userData._parentRecord = record;
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

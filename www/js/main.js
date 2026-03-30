import * as THREE from 'three';
import { Audio } from './audio.js';
import {
  renderer, scene, camera,
  ambLight, warnLight, roomLightSets,
  allInteractables, doors,
  bp1, mainPanel, wsSwitch, ctrlSwitch,
  M
} from './world.js';
import { Player, updatePlayer, getRoom, isMobile } from './player.js';

// ── ELECTRICAL STATE ──────────────────────────────────────────────────────────
const ES = { mains:true, workshop:true, control:true, storage:true, corridor:true, utility:true };

const lightTargets = { hall:2.4, workshop:2.5, control:2.4, storage:2.2, corridor:1.8, utility:2.0 };

function applyPower() {
  Object.entries(roomLightSets).forEach(([room, lights]) => {
    const on = ES.mains && ES[room] !== false;
    const tgt = on ? (lightTargets[room] || 2.0) : 0;
    lights.forEach(l => { l.intensity += (tgt - l.intensity) * 0.1; });
  });
  ambLight.intensity = ES.mains ? 0.28 : 0.04;
  setHUD('pMains', ES.mains);
  setHUD('pWork',  ES.workshop && ES.mains);
  setHUD('pLab',   ES.storage  && ES.mains);
}
function setHUD(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = on ? 'ON' : 'OFF';
  el.style.color  = on ? '#44ff88' : '#ff5544';
}

// ── NOTIFICATION ──────────────────────────────────────────────────────────────
function notify(msg, dur = 2600) {
  const el = document.getElementById('notification');
  el.textContent = msg; el.style.display = 'block';
  clearTimeout(el._t); el._t = setTimeout(() => el.style.display = 'none', dur);
}

// ── INTERACTION ───────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster(); raycaster.far = 3.5;
let focusedObj = null;

function doInteract() {
  if (!focusedObj) return;
  const ud = focusedObj.userData;
  Audio.click();

  if (ud.type === 'door') { ud.door.toggle(Audio, notify); return; }

  if (ud.type === 'breaker') {
    const pmap = { wsBreaker: bp1, mainBreaker: mainPanel };
    const pnl = pmap[ud.panel]; if (!pnl) return;
    const br = pnl.breakers[ud.idx]; br.on = !br.on;
    br.mesh.material = br.on ? M.green : M.red;
    if (ud.panel === 'wsBreaker')   { if(ud.idx===0){ES.workshop=br.on;applyPower();Audio.breaker(br.on);} if(ud.idx===1){ES.control=br.on;applyPower();Audio.breaker(br.on);} }
    if (ud.panel === 'mainBreaker') { if(ud.idx===0){ES.mains=br.on;applyPower();Audio.breaker(br.on);} }
    notify(`${ud.label}: ${br.on ? 'ON ⚡' : 'OFF ✗'}`);
  }
  if (ud.type === 'switch') {
    ud.on = !ud.on; ud.mesh.material = ud.on ? M.green : M.red;
    if (ud.id === 'wsSwitch')   { ES.workshop = ud.on; applyPower(); }
    if (ud.id === 'ctrlSwitch') { ES.control  = ud.on; applyPower(); }
    notify(`${ud.label}: ${ud.on ? 'ON' : 'OFF'}`);
  }
  if (ud.type === 'estop') {
    Audio.alert(); ES.mains = false; applyPower();
    warnLight.intensity = 1.8;
    notify('🚨 EMERGENCY STOP — All power halted!', 4000);
  }
  if (ud.type === 'fusebox') {
    notify('🔧 Fuse Panel: C1–C6 OK | C7–C8 OVERLOADED ⚠', 3200);
  }
}

// ── MINIMAP ───────────────────────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap');
const mmCtx    = mmCanvas ? mmCanvas.getContext('2d') : null;

// Facility bounds for minimap scaling
const MAP = { minX:-16, maxX:26, minZ:-23, maxZ:25 };
const MM_W = 160, MM_H = 140;
if (mmCanvas) { mmCanvas.width = MM_W; mmCanvas.height = MM_H; }

const ROOMS_MAP = [
  { label:'HALL',    x:-1, z:-22, w:6,  d:38, color:'#1a2a1a' },
  { label:'WKSHP',   x:5,  z:-22, w:20, d:20, color:'#22201a' },
  { label:'CTRL',    x:5,  z:2,   w:17, d:14, color:'#1a1e2a' },
  { label:'STOR',    x:-15,z:2,   w:14, d:14, color:'#221a1a' },
  { label:'CORR',    x:-10,z:-16, w:9,  d:18, color:'#1a221a' },
  { label:'UTIL',    x:5,  z:16,  w:8,  d:8,  color:'#1a1a22' },
];

function wx(x) { return (x - MAP.minX) / (MAP.maxX - MAP.minX) * MM_W; }
function wz(z) { return (z - MAP.minZ) / (MAP.maxZ - MAP.minZ) * MM_H; }
function wd(v) { return v / (MAP.maxX - MAP.minX) * MM_W; }
function wh(v) { return v / (MAP.maxZ - MAP.minZ) * MM_H; }

function drawMinimap() {
  if (!mmCtx) return;
  mmCtx.clearRect(0, 0, MM_W, MM_H);

  // Background
  mmCtx.fillStyle = '#050a08';
  mmCtx.fillRect(0, 0, MM_W, MM_H);

  // Rooms
  ROOMS_MAP.forEach(r => {
    mmCtx.fillStyle = r.color;
    mmCtx.fillRect(wx(r.x), wz(r.z), wd(r.w), wh(r.d));
    mmCtx.strokeStyle = '#2a5a3a';
    mmCtx.lineWidth = 1;
    mmCtx.strokeRect(wx(r.x), wz(r.z), wd(r.w), wh(r.d));
  });

  // Door markers
  mmCtx.fillStyle = '#f0c060';
  doors.forEach(d => {
    const px = d.pivot.position.x, pz = d.pivot.position.z;
    mmCtx.fillRect(wx(px) - 2, wz(pz) - 2, 4, 4);
  });

  // Player dot + direction
  const px = wx(Player.pos.x), pz = wz(Player.pos.z);
  mmCtx.fillStyle = '#00ff88';
  mmCtx.beginPath(); mmCtx.arc(px, pz, 4, 0, Math.PI*2); mmCtx.fill();
  // Direction arrow
  const dx = Math.sin(-Player.yaw) * 8, dz = Math.cos(-Player.yaw) * 8; // note: yaw in 3D maps to map
  mmCtx.strokeStyle = '#00ff88';
  mmCtx.lineWidth = 1.5;
  mmCtx.beginPath(); mmCtx.moveTo(px, pz); mmCtx.lineTo(px + dx, pz + dz); mmCtx.stroke();

  // Border
  mmCtx.strokeStyle = '#336644';
  mmCtx.lineWidth = 1;
  mmCtx.strokeRect(0, 0, MM_W, MM_H);
}

// ── HUD ───────────────────────────────────────────────────────────────────────
const promptEl = document.getElementById('prompt');
const rnEl     = document.getElementById('roomname');
const fpsEl    = document.getElementById('fpsCounter');
let fpsSamples = [], lastFpsFlush = 0;

function updateHUD(dt, animT) {
  fpsSamples.push(1/dt);
  if (fpsSamples.length > 40) fpsSamples.shift();
  lastFpsFlush += dt;
  if (lastFpsFlush > 0.6 && fpsEl) {
    fpsEl.textContent = Math.round(fpsSamples.reduce((a,b)=>a+b,0)/fpsSamples.length) + ' fps';
    lastFpsFlush = 0;
  }

  if (rnEl) rnEl.textContent = getRoom(Player.pos);
  drawMinimap();

  raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
  const hits = raycaster.intersectObjects([...allInteractables, ...doors.map(d=>d.panel)], true);
  if (hits.length && hits[0].distance < 3.5) {
    let cur = hits[0].object;
    while (cur && !cur.userData?.type) cur = cur.parent;
    if (cur?.userData?.type) {
      focusedObj = cur;
      promptEl.textContent = `⚡ ${cur.userData.door?.label || cur.userData.label || 'Interact'}`;
      promptEl.style.display = 'block';
    } else { focusedObj = null; promptEl.style.display = 'none'; }
  } else { focusedObj = null; promptEl.style.display = 'none'; }

  // Emergency strobe
  if (warnLight.intensity > 0.4)
    warnLight.intensity = Math.sin(animT * 7) > 0 ? 1.8 : 0.04;

  // Hall flicker
  if (ES.mains && Math.random() < 0.0005) {
    const hl = roomLightSets['hall'];
    if (hl) {
      const l = hl[Math.floor(Math.random()*hl.length)];
      const orig = l.intensity; l.intensity = orig * 0.15;
      setTimeout(() => l.intensity = orig, 90);
    }
  }
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let animT = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  animT += dt;
  updatePlayer(dt);
  applyPower();
  doors.forEach(d => d.update(dt));
  updateHUD(dt, animT);
  renderer.render(scene, camera);
}

// ── CORDOVA HOOKS ─────────────────────────────────────────────────────────────
document.addEventListener('deviceready', () => {
  if (window.screen?.orientation) screen.orientation.lock('landscape').catch(()=>{});
  if (window.StatusBar) StatusBar.hide();
}, false);

// ── START ─────────────────────────────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', () => {
  Audio.init(); Audio.hum();
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  document.getElementById('controls').style.display = 'block';
  if (!isMobile) {
    const msg = document.getElementById('ptrMsg');
    if (msg) msg.style.display = 'block';
  }
  applyPower();
  loop();
});

window.addEventListener('keydown', e => { if (e.code === 'KeyE') doInteract(); });
document.getElementById('btnInteract').addEventListener('touchstart', e => {
  e.preventDefault(); doInteract();
}, {passive:false});

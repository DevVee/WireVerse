import * as THREE from 'three';
import { camera, checkCol, scene, FLOOR1_Y } from './world.js';
import { Audio } from './audio.js';

// ── PLAYER STATE ─────────────────────────────────────────────────────────────
export const Player = {
  pos: new THREE.Vector3(1, 1.72, -24), // NEW: Entrance Spawn
  yaw: 0, pitch: 0,
  yawVel: 0, pitchVel: 0,
  vel: new THREE.Vector3(),
  vy: 0, // Vertical velocity
  grounded: true,
  bobT: 0, bobAmt: 0,
  BASE_Y: 1.72,
  SPEED: 5.2, SPRINT: 9.5, JUMP: 6.2,
  sprinting: false,
};

// ── POINTER LOCK (desktop) ────────────────────────────────────────────────────
export const isMobile = navigator.maxTouchPoints > 0;
const cvs = document.getElementById('c');
let pointerLocked = false;

if (!isMobile && cvs) {
  cvs.addEventListener('click', () => {
    // Only lock if overlay is hidden
    const overlay = document.getElementById('overlay');
    if (!pointerLocked && (!overlay || overlay.style.display === 'none')) {
      cvs.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === cvs;
    const msg = document.getElementById('ptrMsg');
    if (msg) msg.style.display = pointerLocked ? 'none' : 'block';
  });

  document.addEventListener('mousemove', e => {
    if (!pointerLocked) return;
    Player.yawVel -= e.movementX * 0.0018;
    Player.pitchVel -= e.movementY * 0.0018;
  });
}

// ── TOUCH JOYSTICK ────────────────────────────────────────────────────────────
const jsZone = document.getElementById('joystickZone');
const jsKnob = document.getElementById('joystickKnob');
const JRAD = 56;
let jsId = null, jsCenter = {x:70, y:70};
export const jsVec = {x:0, y:0};

if (jsZone && jsKnob) {
  jsZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0]; jsId = t.identifier;
    const r = jsZone.getBoundingClientRect();
    jsCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, { passive: false });

  jsZone.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === jsId) {
      let dx = t.clientX - jsCenter.x, dy = t.clientY - jsCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > JRAD) { dx = dx / dist * JRAD; dy = dy / dist * JRAD; }
      jsVec.x = dx / JRAD; jsVec.y = dy / JRAD;
      jsKnob.style.left = (50 + jsVec.x * 40) + '%';
      jsKnob.style.top = (50 + jsVec.y * 40) + '%';
    }
  }, { passive: false });

  function resetJs() { jsId = null; jsVec.x = 0; jsVec.y = 0; jsKnob.style.left = '50%'; jsKnob.style.top = '50%'; }
  jsZone.addEventListener('touchend', e => { for (const t of e.changedTouches) if (t.identifier === jsId) resetJs(); }, { passive: false });
  jsZone.addEventListener('touchcancel', resetJs, { passive: false });
}

// ── TOUCH LOOK ────────────────────────────────────────────────────────────────
const lookZone = document.getElementById('lookZone');
const lookTouches = {};
if (lookZone) {
  lookZone.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      lookTouches[t.identifier] = { x: t.clientX, y: t.clientY };
    }
  }, { passive: false });

  lookZone.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (lookTouches[t.identifier]) {
        const dx = t.clientX - lookTouches[t.identifier].x;
        const dy = t.clientY - lookTouches[t.identifier].y;
        Player.yawVel -= dx * 0.003;  // Slightly higher sensitivity for mobile
        Player.pitchVel -= dy * 0.003;
        lookTouches[t.identifier] = { x: t.clientX, y: t.clientY };
      }
    }
  }, { passive: false });

  const stopLook = e => { for (const t of e.changedTouches) delete lookTouches[t.identifier]; };
  lookZone.addEventListener('touchend', stopLook, { passive: false });
  lookZone.addEventListener('touchcancel', stopLook, { passive: false });
}

// ── KEYBOARD ─────────────────────────────────────────────────────────────────
export const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

// Sprint button
const btnSprint = document.getElementById('btnSprint');
let touchSprinting = false;
if (btnSprint) {
  btnSprint.addEventListener('touchstart', e => { e.preventDefault(); touchSprinting = true; btnSprint.classList.add('pressed'); }, { passive: false });
  btnSprint.addEventListener('touchend', e => { e.preventDefault(); touchSprinting = false; btnSprint.classList.remove('pressed'); }, { passive: false });
}

// Jump button
const btnJump = document.getElementById('btnJump');
let touchJumping = false;
if (btnJump) {
  btnJump.addEventListener('touchstart', e => { e.preventDefault(); touchJumping = true; }, { passive: false });
  btnJump.addEventListener('touchend', e => { e.preventDefault(); touchJumping = false; }, { passive: false });
}

// ── ROOM DETECTION ────────────────────────────────────────────────────────────
export function getRoom(p) {
  if (p.x > 5  && p.z < -2)               return '🔧 WORKSHOP';
  if (p.x > 5  && p.z > 2)               return '🎛 CONTROL ROOM';
  if (p.x < -1 && p.z > 2)              return '📦 STORAGE';
  if (p.x < -1 && p.z > -16 && p.z < 2) return '🔌 CORRIDOR';
  if (p.x > 5  && p.z > 16)            return '⚡ UTILITY ROOM';
  return '⚡ MAIN HALL';
}

// ── PHYSICS ──────────────────────────────────────────────────────────────────
let groundY = 0;
let prevSinBob = 0;

export function updatePlayer(dt) {
  // Smooth look inertia
  const SMOOTH = isMobile ? 0.22 : 0.14;
  Player.yaw   += Player.yawVel;
  Player.pitch += Player.pitchVel;
  Player.yawVel   *= SMOOTH;
  Player.pitchVel *= SMOOTH;
  Player.pitch = Math.max(-1.15, Math.min(1.15, Player.pitch));

  if (keys['ArrowLeft'])  Player.yaw   += dt * 1.8;
  if (keys['ArrowRight']) Player.yaw   -= dt * 1.8;

  camera.rotation.order = 'YXZ';
  camera.rotation.y = Player.yaw;
  camera.rotation.x = Player.pitch;

  // Sprint
  Player.sprinting = touchSprinting || keys['ShiftLeft'] || keys['ShiftRight'];

  // Movement
  const maxSpd = Player.sprinting ? Player.SPRINT : Player.SPEED;
  const sinY = Math.sin(Player.yaw), cosY = Math.cos(Player.yaw);
  const fwd = new THREE.Vector3(-sinY, 0, -cosY);
  const rgt = new THREE.Vector3( cosY, 0, -sinY);

  let wx = 0, wy = 0;
  if (Math.abs(jsVec.x) > 0.12 || Math.abs(jsVec.y) > 0.12) { wx = jsVec.x; wy = jsVec.y; }
  if (keys['KeyW'] || keys['ArrowUp'])    wy = -1;
  if (keys['KeyS'] || keys['ArrowDown'])  wy =  1;
  if (keys['KeyA'])                       wx = -1;
  if (keys['KeyD'])                       wx =  1;

  const wish = new THREE.Vector3().addScaledVector(fwd, -wy).addScaledVector(rgt, wx);
  if (wish.lengthSq() > 0) wish.normalize();

  if (wish.lengthSq() > 0) {
    Player.vel.addScaledVector(wish, 22 * dt);
    if (Player.vel.length() > maxSpd) Player.vel.normalize().multiplyScalar(maxSpd);
  } else {
    const spd = Player.vel.length();
    if (spd > 0.01) Player.vel.multiplyScalar(Math.max(0, 1 - 18*dt/spd));
    else Player.vel.set(0, 0, 0);
  }

  // Collision sliding
  const np = Player.pos.clone().addScaledVector(Player.vel, dt);
  np.x = Math.max(-14.5, Math.min(34.5, np.x));
  np.z = Math.max(-29.0, Math.min(34.5, np.z));
  if (!checkCol(np)) {
    Player.pos.copy(np);
  } else {
    const tx = new THREE.Vector3(np.x, Player.pos.y,  Player.pos.z);
    if (!checkCol(tx)) { Player.pos.x = np.x; Player.vel.z = 0; }
    const tz = new THREE.Vector3(Player.pos.x, Player.pos.y, np.z);
    if (!checkCol(tz)) { Player.pos.z = np.z; Player.vel.x = 0; }
  }

  // Head bob
  const spd2 = Player.vel.length(), moving = spd2 > 0.2;
  const bobSpd = Player.sprinting ? 11 : 7;
  if (moving) { Player.bobT += dt * bobSpd * (spd2/maxSpd); Player.bobAmt = Math.min(1, Player.bobAmt + dt*7); }
  else        { Player.bobAmt = Math.max(0, Player.bobAmt - dt*6); }

  const curSin = Math.sin(Player.bobT);
  // Footstep: trigger on BOTH zero crossings (left & right foot)
  if (Player.bobAmt > 0.4 && ((curSin < 0 && prevSinBob >= 0) || (curSin > 0 && prevSinBob <= 0))) {
    Audio.step(Player.sprinting);
  }
  prevSinBob = curSin;

  // ── FLOOR DETECTION ────────────────────────────────────────────────────────────────
  // Single floor — always ground at FLOOR1_Y
  const targetGroundY = FLOOR1_Y;

  // Gravity & Jumping
  const gravity = 22.0;
  Player.grounded = Player.pos.y <= (targetGroundY + Player.BASE_Y + 0.12);

  if (Player.grounded) {
    Player.vy = 0;
    if (keys['Space'] || touchJumping) {
      Player.vy = Player.JUMP;
      Player.grounded = false;
    }
  } else {
    Player.vy -= gravity * dt;
  }

  groundY += (targetGroundY - groundY) * Math.min(1, dt * 18);
  Player.pos.y += Player.vy * dt;

  // Hard floor — never let player sink below the current floor
  if (Player.pos.y < (groundY + Player.BASE_Y)) {
    Player.pos.y = groundY + Player.BASE_Y;
    Player.vy = 0;
  }

  // Add bobbing on top of physical Y
  const finalY = Player.pos.y + curSin * 0.03 * Player.bobAmt;
  camera.position.set(Player.pos.x, finalY, Player.pos.z);
}

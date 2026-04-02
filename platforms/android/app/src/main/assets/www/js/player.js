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
  grounded: false,
  bobT: 0, bobAmt: 0,

  // INTERACTION STATE
  state: 'standing', // 'standing', 'sitting', 'computer', 'cctv'
  targetCamPos: new THREE.Vector3(),
  targetCamRot: new THREE.Euler(0, 0, 0, 'YXZ'),

  // CONSTANTS
  SPEED: 4.5,
  SPRINT: 8.0,
  JUMP: 8.0,
  BASE_Y: 1.72,
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

// ── VIRTUAL JOYSTICK ──────────────────────────────────────────────────────────
export const jsVec = { x: 0, y: 0 };
let touchSprinting = false;

const joystickOuter = document.getElementById('joystickOuter');
const joystickInner = document.getElementById('joystickInner');
const JS_RADIUS = 44;
let jsActive = false, jsTouchId = null;

// Cache rect so getBoundingClientRect isn't called on every touchmove
let _jsRect = null;
const _refreshJsRect = () => { if (joystickOuter) _jsRect = joystickOuter.getBoundingClientRect(); };
window.addEventListener('resize', _refreshJsRect);
// Defer initial read until layout is settled
setTimeout(_refreshJsRect, 100);

if (joystickOuter) {
  joystickOuter.addEventListener('touchstart', e => {
    e.stopPropagation();
    e.preventDefault();
    if (jsActive) return;
    _refreshJsRect(); // update rect in case scroll/zoom changed it
    jsTouchId = e.changedTouches[0].identifier;
    jsActive = true;
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!jsActive || !_jsRect) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== jsTouchId) continue;
      const cx = _jsRect.left + _jsRect.width  / 2;
      const cy = _jsRect.top  + _jsRect.height / 2;
      let dx = t.clientX - cx;
      let dy = t.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, JS_RADIUS);
      if (dist > 0) { dx = dx / dist * clamped; dy = dy / dist * clamped; }
      jsVec.x = dx / JS_RADIUS;
      jsVec.y = dy / JS_RADIUS;
      touchSprinting = (clamped / JS_RADIUS) > 0.85;
      if (joystickInner) joystickInner.style.transform = `translate(${dx}px, ${dy}px)`;
      joystickOuter.classList.toggle('sprinting', touchSprinting);
    }
  }, { passive: false });

  const joystickEnd = e => {
    for (const t of e.changedTouches) {
      if (t.identifier === jsTouchId) {
        jsActive = false; jsTouchId = null;
        jsVec.x = 0; jsVec.y = 0;
        touchSprinting = false;
        if (joystickInner) joystickInner.style.transform = 'translate(0px, 0px)';
        joystickOuter.classList.remove('sprinting');
      }
    }
  };
  document.addEventListener('touchend', joystickEnd, { passive: false });
  document.addEventListener('touchcancel', joystickEnd, { passive: false });
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
        Player.yawVel -= dx * 0.0015;
        Player.pitchVel -= dy * 0.0015;
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

// Sprint handled by joystick deflection (touchSprinting declared above)

// ── ROOM DETECTION ────────────────────────────────────────────────────────────
export function getRoom(p) {
  if (p.z < -18)                           return 'ENTRANCE';
  if (p.x > 4  && p.z < -2)               return 'WORKSHOP';
  if (p.x > 20 && p.z > -8 && p.z < 14)  return 'CONTROL CENTER';
  if (p.x > 4  && p.z > 0  && p.z < 14)  return 'GENERATOR ROOM';
  if (p.x < -1 && p.z > -14 && p.z < 4)  return 'DIST-A PANEL';
  if (p.x < -1 && p.z > 4  && p.z < 18)  return 'DIST-B PANEL';
  if (p.x > 4  && p.z > 14 && p.z < 28)  return 'UTILITY ROOM';
  if (p.x < -1 && p.z > 18)              return 'STORAGE';
  if (p.x > 20 && p.z > 10)              return 'TESTING LAB';
  if (p.z > 26)                           return 'STAIRWELL';
  return 'CORRIDOR';
}

// ── PHYSICS ──────────────────────────────────────────────────────────────────
let groundY = 0;
let prevSinBob = 0;

// Pre-allocated reusables — avoid per-frame GC pressure
const _fwd   = new THREE.Vector3();
const _rgt   = new THREE.Vector3();
const _wish  = new THREE.Vector3();
const _np    = new THREE.Vector3();
const _tx    = new THREE.Vector3();
const _tz    = new THREE.Vector3();
const _camQuat = new THREE.Quaternion();

export function updatePlayer(dt) {
  // If in CCTV mode, camera is completely controlled by CCTV logic in main.js
  if (Player.state === 'cctv') return;

  // Smooth look inertia for standing
  if (Player.state === 'standing') {
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
  }

  // Sprint
  Player.sprinting = touchSprinting || keys['ShiftLeft'] || keys['ShiftRight'];

  // Movement (Only when standing)
  const maxSpd = Player.sprinting ? Player.SPRINT : Player.SPEED;
  const sinY = Math.sin(Player.yaw), cosY = Math.cos(Player.yaw);
  _fwd.set(-sinY, 0, -cosY);
  _rgt.set( cosY, 0, -sinY);

  let wx = 0, wy = 0;
  if (Math.abs(jsVec.x) > 0.12 || Math.abs(jsVec.y) > 0.12) { wx = jsVec.x; wy = jsVec.y; }
  if (keys['KeyW'] || keys['ArrowUp'])    wy = -1;
  if (keys['KeyS'] || keys['ArrowDown'])  wy =  1;
  if (keys['KeyA'])                       wx = -1;
  if (keys['KeyD'])                       wx =  1;

  _wish.set(0, 0, 0);
  if (Player.state === 'standing') {
    _wish.addScaledVector(_fwd, -wy).addScaledVector(_rgt, wx);
    if (_wish.lengthSq() > 0) _wish.normalize();
  }

  if (_wish.lengthSq() > 0) {
    Player.vel.addScaledVector(_wish, 22 * dt);
    if (Player.vel.length() > maxSpd) Player.vel.normalize().multiplyScalar(maxSpd);
  } else {
    const spd = Player.vel.length();
    if (spd > 0.01) Player.vel.multiplyScalar(Math.max(0, 1 - 18*dt/spd));
    else Player.vel.set(0, 0, 0);
  }

  // Collision sliding
  _np.copy(Player.pos).addScaledVector(Player.vel, dt);
  _np.x = Math.max(-14.5, Math.min(34.5, _np.x));
  _np.z = Math.max(-29.0, Math.min(34.5, _np.z));
  if (!checkCol(_np)) {
    Player.pos.copy(_np);
  } else {
    _tx.set(_np.x, Player.pos.y, Player.pos.z);
    if (!checkCol(_tx)) { Player.pos.x = _np.x; Player.vel.z = 0; }
    _tz.set(Player.pos.x, Player.pos.y, _np.z);
    if (!checkCol(_tz)) { Player.pos.z = _np.z; Player.vel.x = 0; }
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

  // Camera application
  const physicalY = Player.pos.y;
  
  if (Player.state === 'standing') {
    // Add bobbing on top of physical Y
    const finalY = physicalY + curSin * 0.03 * Player.bobAmt;
    camera.position.set(Player.pos.x, finalY, Player.pos.z);
  } else if (Player.state === 'sitting' || Player.state === 'computer') {
    // Smoothly interpolate camera to target pos/rot
    const tPos = Player.targetCamPos;
    const tRot = Player.targetCamRot;
    
    // Lerp position
    camera.position.lerp(tPos, dt * 6);
    
    // Slerp rotation requires quaternions
    _camQuat.setFromEuler(tRot);
    camera.quaternion.slerp(_camQuat, dt * 6);
    
    // Keep Euler angles synced for when we stand back up
    Player.yaw = camera.rotation.y;
    Player.pitch = camera.rotation.x;
    
    // Snap Player pos beneath camera to prevent drifting through walls/floors when standing up
    Player.pos.x = camera.position.x;
    Player.pos.z = camera.position.z;
    Player.vel.set(0, 0, 0); // Kill all momentum
  }
}

import * as THREE from 'three';
import { camera, checkCol, FLOOR1_Y, SPAWN, SPAWN_YAW } from './world.js';
import { Audio } from './audio.js';

// ── PLAYER STATE ─────────────────────────────────────────────────────────────
export const Player = {
  pos: SPAWN.clone(),              // Spawn at Entrance
  yaw: SPAWN_YAW, pitch: 0,       // facing north toward Workshop 1 door
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
  BASE_Y: 1.88,   // eye height — raised for better vertical FOV
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
    const sens = window.camSensitivity ?? 1.0;
    Player.yawVel -= e.movementX * 0.0020 * sens;
    Player.pitchVel -= e.movementY * 0.0020 * sens;
  });
}

// ── ANALOG JOYSTICK ───────────────────────────────────────────────────────────
// joyInput: analog values -1..1 for X (strafe) and Y (forward/back)
export const joyInput = { x: 0, y: 0 };
let touchSprinting = false;
let _joyId = -1, _joyCX = 0, _joyCY = 0, _joyR = 55;

// Sprint (RUN) button
const _btnSprint = document.getElementById('btnDpadSprint');
if (_btnSprint) {
  const spDn = e => { e.preventDefault(); touchSprinting = true; };
  const spUp = e => { e.preventDefault(); touchSprinting = false; };
  _btnSprint.addEventListener('touchstart',  spDn, { passive: false });
  _btnSprint.addEventListener('touchend',    spUp, { passive: false });
  _btnSprint.addEventListener('touchcancel', spUp, { passive: false });
  _btnSprint.addEventListener('mousedown',  spDn);
  _btnSprint.addEventListener('mouseup',    spUp);
  _btnSprint.addEventListener('mouseleave', spUp);
}

setTimeout(() => {
  const joyOuter = document.getElementById('joyOuter');
  const joyInner = document.getElementById('joyInner');
  if (!joyOuter) return;

  const DEAD = 0.07; // 7% dead zone

  joyOuter.addEventListener('touchstart', e => {
    if (Player.state !== 'standing') return;
    e.preventDefault();
    if (_joyId !== -1) return; // already tracking one finger
    const t = e.changedTouches[0];
    _joyId = t.identifier;
    const rect = joyOuter.getBoundingClientRect();
    _joyCX = rect.left + rect.width * 0.5;
    _joyCY = rect.top  + rect.height * 0.5;
    _joyR  = rect.width * 0.5;
    joyOuter.classList.add('joy-active');
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (_joyId === -1) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== _joyId) continue;
      const dx = t.clientX - _joyCX;
      const dy = t.clientY - _joyCY;
      const dist = Math.hypot(dx, dy);
      const maxR = _joyR * 0.72; // knob travel limit
      const clamp = Math.min(dist, maxR);
      const ang = Math.atan2(dy, dx);

      // Move knob visually
      if (joyInner) {
        const kx = Math.cos(ang) * clamp;
        const ky = Math.sin(ang) * clamp;
        joyInner.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      }

      // Normalize: 0..1 (apply dead zone)
      const norm = Math.max(0, (clamp / maxR - DEAD) / (1 - DEAD));
      if (dist < _joyR * DEAD) {
        joyInput.x = 0; joyInput.y = 0;
      } else {
        joyInput.x = (dx / dist) * norm;
        joyInput.y = (dy / dist) * norm;
      }

      // Auto-sprint when joystick pushed to 88%+ AND running is active
      // (user can also use the RUN button independently)
      if (norm > 0.88) touchSprinting = true;
      else if (!_btnSprint?.matches(':active')) touchSprinting = false;

      // Sprint visual feedback
      if (joyOuter) joyOuter.classList.toggle('sprinting', norm > 0.88);
    }
  }, { passive: true });

  const _joyRelease = e => {
    for (const t of e.changedTouches) {
      if (t.identifier !== _joyId) continue;
      _joyId = -1;
      joyInput.x = 0; joyInput.y = 0;
      if (!_btnSprint?.matches(':active')) touchSprinting = false;
      if (joyInner) joyInner.style.transform = 'translate(-50%, -50%)';
      joyOuter.classList.remove('joy-active', 'sprinting');
    }
  };
  document.addEventListener('touchend',    _joyRelease, { passive: true });
  document.addEventListener('touchcancel', _joyRelease, { passive: true });
}, 0);

// ── TOUCH LOOK ────────────────────────────────────────────────────────────────
const lookZone = document.getElementById('lookZone');
const lookTouches = {};
if (lookZone) {
  lookZone.addEventListener('touchstart', e => {
    // Only capture look when player is free-standing — never steal touches from overlays
    if (Player.state !== 'standing') return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      lookTouches[t.identifier] = { x: t.clientX, y: t.clientY };
    }
  }, { passive: false });

  lookZone.addEventListener('touchmove', e => {
    if (Player.state !== 'standing') return;
    e.preventDefault();
    const sens = window.camSensitivity ?? 1.0;
    for (const t of e.changedTouches) {
      if (lookTouches[t.identifier]) {
        const dx = t.clientX - lookTouches[t.identifier].x;
        const dy = t.clientY - lookTouches[t.identifier].y;
        // Direct application — immediately add to velocity each move event
        Player.yawVel -= dx * 0.0022 * sens;
        Player.pitchVel -= dy * 0.0022 * sens;
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
window.addEventListener('keyup', e => { keys[e.code] = false; });

const btnJump = document.getElementById('btnJump');
if (btnJump) {
  const jumpStart = (e) => {
    e.preventDefault();
    keys['Space'] = true;
    if (window.GameAudio && typeof window.GameAudio.click === 'function') window.GameAudio.click();
  };
  const jumpEnd = (e) => {
    e.preventDefault();
    keys['Space'] = false;
  };
  btnJump.addEventListener('touchstart', jumpStart, { passive: false });
  btnJump.addEventListener('touchend', jumpEnd, { passive: false });
  btnJump.addEventListener('touchcancel', jumpEnd, { passive: false });
  btnJump.addEventListener('mousedown', jumpStart);
  btnJump.addEventListener('mouseup', jumpEnd);
  btnJump.addEventListener('mouseleave', jumpEnd);
}

// ── ROOM DETECTION ────────────────────────────────────────────────────────────
export function getRoom(p) {
  if (p.z >= -2)  return 'ENTRANCE';
  if (p.z >= -18) return 'WORKSHOP 1';
  return 'WORKSHOP 2';
}

// ── PHYSICS ──────────────────────────────────────────────────────────────────
let groundY = 0;
let prevSinBob = 0;

// Pre-allocated reusables — avoid per-frame GC pressure
const _fwd = new THREE.Vector3();
const _rgt = new THREE.Vector3();
const _wish = new THREE.Vector3();
const _np = new THREE.Vector3();
const _tx = new THREE.Vector3();
const _tz = new THREE.Vector3();
const _camQuat = new THREE.Quaternion();

export function updatePlayer(dt) {
  // If in CCTV or REPAIR mode, camera is completely controlled by external logic
  if (Player.state === 'cctv' || Player.state === 'repair') return;

  // Smooth look inertia for standing
  if (Player.state === 'standing') {
    // Lower SMOOTH = crisper/direct; higher = more glide/inertia
    // Mobile: very low inertia so the camera follows the finger precisely
    const SMOOTH = isMobile ? 0.08 : 0.38;
    Player.yaw += Player.yawVel;
    Player.pitch += Player.pitchVel;
    Player.yawVel *= SMOOTH;
    Player.pitchVel *= SMOOTH;
    // Clamp tiny values to zero to prevent micro-drift
    if (Math.abs(Player.yawVel) < 0.00008) Player.yawVel = 0;
    if (Math.abs(Player.pitchVel) < 0.00008) Player.pitchVel = 0;
    Player.pitch = Math.max(-1.38, Math.min(1.38, Player.pitch)); // ±79° up/down

    if (keys['ArrowLeft']) Player.yaw += dt * 1.8;
    if (keys['ArrowRight']) Player.yaw -= dt * 1.8;

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
  _rgt.set(cosY, 0, -sinY);

  // Analog joystick (mobile) + keyboard (desktop/keyboard)
  // joySensitivity amplifies the joystick's analog range so less deflection = full speed
  const _jSens = Math.min(window.joySensitivity ?? 1.0, 2.0);
  let wx = Math.max(-1, Math.min(1, joyInput.x * _jSens));
  let wy = Math.max(-1, Math.min(1, joyInput.y * _jSens));
  if (keys['KeyW'] || keys['ArrowUp'])    wy = -1;
  if (keys['KeyS'] || keys['ArrowDown'])  wy =  1;
  if (keys['KeyA'] || keys['ArrowLeft'])  wx = -1;
  if (keys['KeyD'] || keys['ArrowRight']) wx =  1;

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
    if (spd > 0.01) Player.vel.multiplyScalar(Math.max(0, 1 - 18 * dt / spd));
    else Player.vel.set(0, 0, 0);
  }

  // Collision sliding
  _np.copy(Player.pos).addScaledVector(Player.vel, dt);
  _np.x = Math.max(-14.5, Math.min(34.5, _np.x));
  _np.z = Math.max(-31.5, Math.min(34.5, _np.z));
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
  if (moving) { Player.bobT += dt * bobSpd * (spd2 / maxSpd); Player.bobAmt = Math.min(1, Player.bobAmt + dt * 7); }
  else { Player.bobAmt = Math.max(0, Player.bobAmt - dt * 6); }

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
    if (Player.vy < 0) Player.vy = 0; // stop falling
    // Allow jumping
    if ((keys['Space'] || keys['Spacebar']) && Player.state === 'standing') {
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

  // Camera application
  const physicalY = Player.pos.y;

  if (Player.state === 'standing') {
    // Add bobbing on top of physical Y
    const finalY = physicalY + curSin * 0.03 * Player.bobAmt;
    camera.position.set(Player.pos.x, finalY, Player.pos.z);
  } else if (Player.state === 'sitting' || Player.state === 'computer' || Player.state === 'wall-panel') {
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

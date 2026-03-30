import * as THREE from 'three';
import { scene, camera, colBoxes, checkCol, M, mkBox } from './world.js';
import { Audio } from './audio.js';

// ── PLAYER STATE ─────────────────────────────────────────────────────────────
export const Player = {
  pos: new THREE.Vector3(0, 1.72, 8),
  yaw: 0, pitch: 0,
  yawVel: 0, pitchVel: 0,       // smooth look inertia
  vel: new THREE.Vector3(),
  bobT: 0, bobAmt: 0,
  stepTimer: 0,
  BASE_Y: 1.72,
  SPEED: 5.0, SPRINT: 9.0,
  sprinting: false,
  interactAnim: 0,               // hand punch anim timer
};

// ── HANDS (first-person) ─────────────────────────────────────────────────────
const handsGroup = new THREE.Group();
handsGroup.position.set(0, -.42, -.55);
camera.add(handsGroup);
scene.add(camera);  // camera must be in scene for children to render

// Right hand
const rForearm = mkBox(.065, .22, .1, M.sleeve); rForearm.position.set(.18, 0, 0);    handsGroup.add(rForearm);
const rHand    = mkBox(.075, .1,  .09, M.skin);   rHand.position.set(.18, -.16, .02); handsGroup.add(rHand);
// Left hand
const lForearm = mkBox(.065, .22, .1, M.sleeve); lForearm.position.set(-.18, 0, 0);   handsGroup.add(lForearm);
const lHand    = mkBox(.075, .1,  .09, M.skin);   lHand.position.set(-.18, -.16, .02);handsGroup.add(lHand);

// ── POINTER LOCK (desktop) ────────────────────────────────────────────────────
const isMobile = navigator.maxTouchPoints > 0;
const cvs = document.getElementById('c');
let pointerLocked = false;

if (!isMobile) {
  cvs.addEventListener('click', () => { if (!pointerLocked) cvs.requestPointerLock(); });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === cvs;
    const msg = document.getElementById('ptrMsg');
    if (msg) msg.style.display = pointerLocked ? 'none' : 'block';
  });
  document.addEventListener('mousemove', e => {
    if (!pointerLocked) return;
    Player.yawVel   -= e.movementX * 0.0016;
    Player.pitchVel -= e.movementY * 0.0016;
  });
}

// ── TOUCH JOYSTICK ────────────────────────────────────────────────────────────
const jsZone = document.getElementById('joystickZone');
const jsKnob = document.getElementById('joystickKnob');
const JRAD = 56;
let jsId = null, jsCenter = {x:70,y:70};
export const jsVec = {x:0, y:0};

jsZone.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0]; jsId = t.identifier;
  const r = jsZone.getBoundingClientRect();
  jsCenter = {x: r.left+r.width/2, y: r.top+r.height/2};
}, {passive:false});
jsZone.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier===jsId) {
    let dx=t.clientX-jsCenter.x, dy=t.clientY-jsCenter.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if (dist>JRAD){dx=dx/dist*JRAD; dy=dy/dist*JRAD;}
    jsVec.x=dx/JRAD; jsVec.y=dy/JRAD;
    jsKnob.style.left=(50+jsVec.x*40)+'%';
    jsKnob.style.top =(50+jsVec.y*40)+'%';
  }
}, {passive:false});
function resetJs(){jsId=null;jsVec.x=0;jsVec.y=0;jsKnob.style.left='50%';jsKnob.style.top='50%';}
jsZone.addEventListener('touchend',   e => { for(const t of e.changedTouches) if(t.identifier===jsId) resetJs(); }, {passive:false});
jsZone.addEventListener('touchcancel',resetJs, {passive:false});

// ── TOUCH LOOK ZONE ───────────────────────────────────────────────────────────
const lookZone = document.getElementById('lookZone');
const lookTouches = {};

lookZone.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const t of e.changedTouches) lookTouches[t.identifier]={x:t.clientX,y:t.clientY};
}, {passive:false});
lookZone.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (lookTouches[t.identifier]) {
      const dx=t.clientX-lookTouches[t.identifier].x;
      const dy=t.clientY-lookTouches[t.identifier].y;
      // Apply with smoothing: use velocity accumulation
      Player.yawVel   -= dx * 0.0022;
      Player.pitchVel -= dy * 0.0022;
      lookTouches[t.identifier]={x:t.clientX,y:t.clientY};
    }
  }
}, {passive:false});
lookZone.addEventListener('touchend',   e => { for(const t of e.changedTouches) delete lookTouches[t.identifier]; }, {passive:false});
lookZone.addEventListener('touchcancel',e => { for(const t of e.changedTouches) delete lookTouches[t.identifier]; }, {passive:false});

// ── KEYBOARD ─────────────────────────────────────────────────────────────────
export const keys = {};
window.addEventListener('keydown', e => { keys[e.code]=true; });
window.addEventListener('keyup',   e => { keys[e.code]=false; });

// ── SPRINT BUTTONS ────────────────────────────────────────────────────────────
const btnSprint = document.getElementById('btnSprint');
btnSprint.addEventListener('touchstart', e => { e.preventDefault(); Player.sprinting=true;  btnSprint.classList.add('pressed');    }, {passive:false});
btnSprint.addEventListener('touchend',   e => { e.preventDefault(); Player.sprinting=false; btnSprint.classList.remove('pressed'); }, {passive:false});

// ── ROOM DETECTION ────────────────────────────────────────────────────────────
export function getRoom(p) {
  if (p.x>3  && p.z<-2)                       return '🔧 WORKSHOP';
  if (p.x>3  && p.z>3)                        return '🎛 CONTROL ROOM';
  if (p.x<-2 && p.z>3)                        return '📦 STORAGE';
  if (p.x<-5 && p.z>-10 && p.z<2)            return '🔌 CORRIDOR';
  if (p.x>2  && p.z>5   && p.z<14)           return '⚡ UTILITY ROOM';
  return '⚡ MAIN HALL';
}

// ── MAIN PLAYER UPDATE ────────────────────────────────────────────────────────
export function updatePlayer(dt) {
  // Smooth look inertia
  const SMOOTH = isMobile ? 0.28 : 0.18;
  Player.yaw   += Player.yawVel;
  Player.pitch += Player.pitchVel;
  Player.yawVel   *= SMOOTH;
  Player.pitchVel *= SMOOTH;
  Player.pitch = Math.max(-1.2, Math.min(1.2, Player.pitch));

  // Arrow / keyboard look
  if (keys['ArrowLeft'])  { Player.yaw   += dt*1.9; }
  if (keys['ArrowRight']) { Player.yaw   -= dt*1.9; }
  if (keys['ArrowUp'])    { Player.pitch += dt*1.2; }
  if (keys['ArrowDown'])  { Player.pitch -= dt*1.2; }

  camera.rotation.order = 'YXZ';
  camera.rotation.y = Player.yaw;
  camera.rotation.x = Player.pitch;

  // Sprint (keyboard)
  if (keys['ShiftLeft'] || keys['ShiftRight']) Player.sprinting = true;
  else if (!btnSprint.classList.contains('pressed')) Player.sprinting = false;

  // Movement vectors
  const maxSpd = Player.sprinting ? Player.SPRINT : Player.SPEED;
  const fwd = new THREE.Vector3(-Math.sin(Player.yaw), 0, -Math.cos(Player.yaw));
  const rgt = new THREE.Vector3( Math.cos(Player.yaw), 0, -Math.sin(Player.yaw));

  let wx=0, wy=0;
  const DEAD=0.12;
  if (Math.abs(jsVec.x)>DEAD||Math.abs(jsVec.y)>DEAD) { wx=jsVec.x; wy=jsVec.y; }
  if (keys['KeyW']||keys['ArrowUp'])   wy=-1;
  if (keys['KeyS']||keys['ArrowDown']) wy= 1;
  if (keys['KeyA'])                    wx=-1;
  if (keys['KeyD'])                    wx= 1;

  const wish = new THREE.Vector3();
  wish.addScaledVector(fwd,-wy).addScaledVector(rgt, wx);
  if (wish.lengthSq()>0) wish.normalize();

  const ACCEL=22, DECEL=18;
  if (wish.lengthSq()>0) {
    Player.vel.addScaledVector(wish, ACCEL*dt);
    if (Player.vel.length()>maxSpd) Player.vel.normalize().multiplyScalar(maxSpd);
  } else {
    const spd=Player.vel.length();
    if (spd>0.01) Player.vel.multiplyScalar(Math.max(0, 1-DECEL*dt/spd));
    else Player.vel.set(0,0,0);
  }

  // Collision with sliding
  const np = Player.pos.clone().addScaledVector(Player.vel, dt);
  np.x = Math.max(-15.5, Math.min(18.5, np.x));
  np.z = Math.max(-17.5, Math.min(13.5, np.z));
  if (!checkCol(np)) {
    Player.pos.copy(np);
  } else {
    const tx = new THREE.Vector3(np.x, Player.pos.y, Player.pos.z);
    if (!checkCol(tx)) { Player.pos.x=np.x; Player.vel.z=0; }
    const tz = new THREE.Vector3(Player.pos.x, Player.pos.y, np.z);
    if (!checkCol(tz)) { Player.pos.z=np.z; Player.vel.x=0; }
  }

  // Head + hand bob
  const spd2=Player.vel.length(), moving=spd2>0.2;
  const bobSpd=Player.sprinting?11:7;
  if (moving) { Player.bobT+=dt*bobSpd*(spd2/maxSpd); Player.bobAmt=Math.min(1,Player.bobAmt+dt*7); }
  else        { Player.bobAmt=Math.max(0,Player.bobAmt-dt*6); }
  const bobY   = Math.sin(Player.bobT)*.03 *Player.bobAmt;
  const bobX   = Math.cos(Player.bobT*.5)*.01*Player.bobAmt;
  Player.pos.y = Player.BASE_Y + bobY;

  // Footstep sound
  if (Player.bobAmt>.5 && Math.sin(Player.bobT)<0 && Math.sin(Player.bobT-dt*bobSpd)>=0) Audio.step();

  camera.position.copy(Player.pos);

  // Animate hands
  Player.interactAnim = Math.max(0, Player.interactAnim - dt*5);
  const punchZ = Player.interactAnim * .18;
  const handBobY = bobY * 1.4;
  const handBobX = bobX * 0.8;
  handsGroup.position.set(handBobX, -.42 + handBobY, -.55 - punchZ);
  handsGroup.rotation.x = Player.sprinting ? -.08 : 0;
  handsGroup.rotation.z = bobX * 0.4;
}

export function triggerInteractAnim() { Player.interactAnim = 1; }

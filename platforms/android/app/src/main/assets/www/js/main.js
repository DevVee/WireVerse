import * as THREE from 'three';
import { Audio } from './audio.js';
import {
  renderer, scene, camera,
  ambLight, warnLight, roomLightSets,
  allInteractables, doors,
  bp1, mainPanel, wsSwitch, ctrlSwitch, eStop,
  M
} from './world.js';
import { Player, updatePlayer, getRoom, keys, triggerInteractAnim } from './player.js';

// ── ELECTRICAL STATE ──────────────────────────────────────────────────────────
const ES = { mains:true, workshop:true, control:true, storage:true, corridor:true, utility:true };

function applyPower() {
  Object.entries(roomLightSets).forEach(([room, lights]) => {
    const on = ES.mains && (ES[room] !== false);
    const tgt = on ? (room==='hall'?2.2 : room==='workshop'?2.4 : room==='control'?2.2 : 2.0) : 0;
    lights.forEach(l => { l.intensity += (tgt - l.intensity) * 0.15; });
  });
  ambLight.intensity = ES.mains ? 0.3 : 0.06;
  setHUD('pMains', ES.mains);
  setHUD('pWork',  ES.workshop && ES.mains);
  setHUD('pLab',   ES.storage  && ES.mains);
}
function setHUD(id, on) {
  const el=document.getElementById(id);
  if (!el) return;
  el.textContent=on?'ON':'OFF'; el.style.color=on?'#44ff88':'#ff5544';
}

// ── NOTIFICATION ──────────────────────────────────────────────────────────────
function notify(msg, dur=2400) {
  const el=document.getElementById('notification');
  el.textContent=msg; el.style.display='block';
  clearTimeout(el._t); el._t=setTimeout(()=>el.style.display='none',dur);
}

// ── INTERACTION ───────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster(); raycaster.far=3.2;
let focusedObj = null;

function doInteract() {
  if (!focusedObj) return;
  const ud=focusedObj.userData;
  Audio.click(); triggerInteractAnim();

  if (ud.type==='door')    { ud.door.toggle(Audio, notify); return; }
  if (ud.type==='breaker') {
    // find which panel array
    const panels = { wsBreaker: bp1, mainBreaker: mainPanel };
    const panel  = panels[ud.panel];
    if (!panel) return;
    const br=panel.breakers[ud.idx]; br.on=!br.on;
    br.mesh.material=br.on?M.green:M.red;
    if (ud.panel==='wsBreaker')   { if(ud.idx===0){ES.workshop=br.on;applyPower();Audio.breaker(br.on);} if(ud.idx===1){ES.control=br.on;applyPower();Audio.breaker(br.on);} }
    if (ud.panel==='mainBreaker') { if(ud.idx===0){ES.mains=br.on;applyPower();Audio.breaker(br.on);} }
    notify(`${ud.label}: ${br.on?'ON ⚡':'OFF ✗'}`);
  }
  if (ud.type==='switch') {
    ud.on=!ud.on; ud.mesh.material=ud.on?M.green:M.red;
    if (ud.id==='wsSwitch')   { ES.workshop=ud.on; applyPower(); }
    if (ud.id==='ctrlSwitch') { ES.control =ud.on; applyPower(); }
    notify(`${ud.label}: ${ud.on?'ON':'OFF'}`);
  }
  if (ud.type==='estop') {
    Audio.alert(); ES.mains=false; applyPower();
    warnLight.intensity=1.6;
    notify('🚨 EMERGENCY STOP — All circuits halted!',3500);
  }
  if (ud.type==='fusebox') {
    notify('🔧 Fuse Panel: C1-C4 OK | C5-C6 OVERLOADED ⚠',3000);
  }
}

// ── HUD UPDATES ───────────────────────────────────────────────────────────────
const promptEl = document.getElementById('prompt');
const rnEl     = document.getElementById('roomname');
const fpsEl    = document.getElementById('fpsCounter');
let fpsSamples=[], lastFpsUpdate=0;

function updateHUD(dt, animT) {
  // FPS
  fpsSamples.push(1/dt);
  if (fpsSamples.length>30) fpsSamples.shift();
  lastFpsUpdate+=dt;
  if (lastFpsUpdate>.5 && fpsEl) {
    fpsEl.textContent=Math.round(fpsSamples.reduce((a,b)=>a+b,0)/fpsSamples.length)+' fps';
    lastFpsUpdate=0;
  }

  // Room label
  if (rnEl) rnEl.textContent=getRoom(Player.pos);

  // Crosshair interaction prompt
  raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
  const hits=raycaster.intersectObjects([...allInteractables,...doors.map(d=>d.panel)],true);
  if (hits.length && hits[0].distance<3.2) {
    let cur=hits[0].object;
    while(cur && !cur.userData?.type) cur=cur.parent;
    if (cur?.userData?.type) {
      focusedObj=cur;
      promptEl.textContent=`⚡ ${cur.userData.door?.label||cur.userData.label||'Interact'}`;
      promptEl.style.display='block';
    } else { focusedObj=null; promptEl.style.display='none'; }
  } else { focusedObj=null; promptEl.style.display='none'; }

  // Warn strobe
  if (warnLight.intensity>.4) warnLight.intensity=Math.sin(animT*6)>.0?1.6:.08;

  // Atmospheric flicker
  if (ES.mains && Math.random()<.0006) {
    const hl=roomLightSets['hall'];
    if (hl) { const l=hl[Math.floor(Math.random()*hl.length)]; const orig=l.intensity; l.intensity=orig*.2; setTimeout(()=>l.intensity=orig,80); }
  }
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let animT=0;

function loop() {
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(), .05);
  animT+=dt;
  updatePlayer(dt);
  applyPower();
  doors.forEach(d=>d.update(dt));
  updateHUD(dt, animT);
  renderer.render(scene, camera);
}

// ── START ─────────────────────────────────────────────────────────────────────
document.addEventListener('deviceready', () => {
  // Cordova: orientation + fullscreen
  if (window.screen?.orientation) screen.orientation.lock('landscape').catch(()=>{});
  if (window.StatusBar) { StatusBar.hide(); }
  if (window.AndroidFullScreen) { AndroidFullScreen.immersiveMode(); }
}, false);

document.getElementById('startBtn').addEventListener('click', () => {
  Audio.init(); Audio.hum();
  document.getElementById('overlay').style.display='none';
  document.getElementById('hud').style.display='block';
  document.getElementById('controls').style.display='block';
  // Show pointer-lock hint on desktop
  const isMob=navigator.maxTouchPoints>0;
  const msg=document.getElementById('ptrMsg');
  if (!isMob && msg) msg.style.display='block';
  applyPower();
  loop();
});

// Keyboard interact + E key
window.addEventListener('keydown', e => { if(e.code==='KeyE') doInteract(); });
document.getElementById('btnInteract').addEventListener('touchstart', e=>{e.preventDefault();doInteract();},{passive:false});

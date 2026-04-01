import * as THREE from 'three';
import { Audio } from './audio.js';
import {
  renderer, scene, camera,
  ambLight, warnLight, roomLightSets,
  allInteractables, doors, colBoxes,
  mainPanel, distAPanel, distBPanel, wsPanel,
  mainSwitch, genSwitch,
  generator, updateGenerator,
  scadaTerminals, updateSCADA,
  cableStations,
  oscWave1, oscWave2, updateOscilloscopes,
  M
} from './world.js';
import { Player, updatePlayer, getRoom, isMobile } from './player.js';

// ── ELECTRICAL STATE ──────────────────────────────────────────────────────────
const ES = {
  mains: true,
  generator: false,
  workshop: true,
  control: true,
  distA: true,
  distB: true,
  lab: true,
  storage: true,
  utility: true,
  corridor: true,
  entrance: true,
  stairwell: true,
};

const lightTargets = {
  entrance: 4.0,
  corridor: 4.5,
  workshop: 4.2,
  generator: 4.0,
  control: 4.0,
  distA: 3.5,
  distB: 3.5,
  lab: 4.0,
  storage: 3.2,
  utility: 3.5,
  stairwell: 3.0,
};

function applyPower() {
  const hasPower = ES.mains || ES.generator;
  Object.entries(roomLightSets).forEach(([room, lights]) => {
    const powered = hasPower && (ES[room] !== false);
    const tgt = powered ? (lightTargets[room] || 3.5) : 0;
    lights.forEach(l => {
      l.intensity += (tgt - l.intensity) * 0.1;
    });
  });
  ambLight.intensity = hasPower ? 0.65 : 0.1;
  setHUD('pMains', ES.mains);
  setHUD('pGen', ES.generator);
  setHUD('pWork', ES.workshop && hasPower);
  setHUD('pCtrl', ES.control && hasPower);
}

function setHUD(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = on ? 'ON' : 'OFF';
  el.style.color = on ? '#44ff88' : '#ff5544';
}

// ── TASK SYSTEM ───────────────────────────────────────────────────────────────
const TASKS = {
  daily: [
    {
      id: 'morning_inspection',
      title: 'Morning Inspection',
      desc: 'Check all breaker panels (click each panel breaker)',
      location: 'Various',
      completed: false,
      subtasks: [
        { panel: 'main-panel', checked: false },
        { panel: 'dist-a', checked: false },
        { panel: 'dist-b', checked: false },
        { panel: 'workshop', checked: false },
      ]
    },
    {
      id: 'generator_test',
      title: 'Generator Test',
      desc: 'Start generator and verify RPM ≥ 1400',
      location: 'Generator Room',
      completed: false,
      _rpmCheckTimeout: null,
    },
    {
      id: 'cable_check',
      title: 'Cable Terminal Check',
      desc: 'Verify all 3 wire terminal stations in Workshop',
      location: 'Workshop',
      completed: false,
    },
    {
      id: 'scada_monitoring',
      title: 'SCADA System Check',
      desc: 'Activate all 3 monitoring terminals in Control Center',
      location: 'Control Center',
      completed: false,
    },
    {
      id: 'utility_check',
      title: 'Utility Room Check',
      desc: 'Inspect the utility room and stairwell area',
      location: 'Utility Room',
      completed: false,
    },
  ]
};

let activeTask = null;
let taskStartTime = 0;

function startTask(taskId) {
  const task = TASKS.daily.find(t => t.id === taskId);
  if (!task || task.completed) return;
  activeTask = task;
  taskStartTime = Date.now();
  notify(`📋 Task: ${task.title}`, 3000);
  updateTaskDisplay();
}

function completeTask(taskId) {
  const task = TASKS.daily.find(t => t.id === taskId);
  if (!task || task.completed) return;
  task.completed = true;
  if (activeTask?.id === taskId) activeTask = null;
  const dur = Math.floor((Date.now() - taskStartTime) / 1000);
  notify(`✅ Complete: ${task.title} (${dur}s)`, 4000);
  if (Audio.ctx) Audio.success();
  updateTaskDisplay();
  checkAllTasksComplete();
}

function checkAllTasksComplete() {
  if (TASKS.daily.every(t => t.completed)) {
    notify('🎉 All Daily Tasks Complete! Shift finished.', 6000);
  }
}

function updateTaskDisplay() {
  const list = document.getElementById('taskList');
  if (!list) return;
  list.innerHTML = '';
  TASKS.daily.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.style.cssText = `
      padding:8px 10px;margin:4px 0;
      background:${task.completed ? '#152a1e' : (activeTask?.id === task.id ? '#1e2a3a' : '#1e1e2a')};
      border-left:3px solid ${task.completed ? '#44ff88' : (activeTask?.id === task.id ? '#4488ff' : '#ff9944')};
      font-size:12px;cursor:pointer;border-radius:2px;
      transition:background .2s;
    `;
    div.innerHTML = `
      <div style="font-weight:bold;color:${task.completed ? '#44ff88' : '#ffffff'};">
        ${task.completed ? '✓' : (activeTask?.id === task.id ? '▶' : '○')} ${task.title}
      </div>
      <div style="color:#888;font-size:10px;margin-top:2px;">${task.desc}</div>
      <div style="color:#556;font-size:10px;margin-top:1px;">📍 ${task.location}</div>
    `;
    if (!task.completed) div.addEventListener('click', () => startTask(task.id));
    list.appendChild(div);
  });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function notify(msg, dur = 2800) {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => { el.style.display = 'none'; }, 320);
  }, dur);
}

// ── INTERACTION ───────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
raycaster.far = 4.2;
let focusedObj = null;

function doInteract() {
  if (!focusedObj) return;
  const ud = focusedObj.userData;
  if (Audio.ctx) Audio.click();

  // ── Door ──────────────────────────────────────────────────────────────────
  if (ud.type === 'door') {
    ud.door.toggle(Audio.ctx ? Audio : null, notify);
    return;
  }

  // ── Breaker ───────────────────────────────────────────────────────────────
  if (ud.type === 'breaker') {
    const panelMap = {
      'main-panel': mainPanel,
      'dist-a': distAPanel,
      'dist-b': distBPanel,
      'workshop': wsPanel,
    };
    const panel = panelMap[ud.panel];
    if (!panel) return;
    const br = panel.breakers[ud.idx];
    br.on = !br.on;
    br.mesh.material = br.on ? M.green : M.red;
    if (ud.panel === 'main-panel' && ud.idx === 0) {
      ES.mains = br.on;
      applyPower();
      if (Audio.ctx) Audio.breaker(br.on);
    }
    notify(`${ud.label}: ${br.on ? 'ON ⚡' : 'OFF ✗'}`);

    if (activeTask?.id === 'morning_inspection') {
      const sub = activeTask.subtasks.find(s => s.panel === ud.panel);
      if (sub && !sub.checked) {
        sub.checked = true;
        if (activeTask.subtasks.every(s => s.checked)) completeTask('morning_inspection');
        else notify(`✓ Panel ${ud.panel} checked (${activeTask.subtasks.filter(s => s.checked).length}/4)`, 2000);
      }
    }
    return;
  }

  // ── Switch ────────────────────────────────────────────────────────────────
  if (ud.type === 'switch') {
    ud.on = !ud.on;
    ud.mesh.material = ud.on ? M.green : M.red;
    if (ud.id === 'main-switch') { ES.mains = ud.on; applyPower(); }
    if (ud.id === 'gen-switch') { ES.generator = ud.on; applyPower(); }
    notify(`${ud.label}: ${ud.on ? 'ON ⚡' : 'OFF ✗'}`);
    return;
  }

  // ── Emergency Stop ────────────────────────────────────────────────────────
  if (ud.type === 'estop') {
    if (Audio.ctx) Audio.alert();
    ES.mains = false; ES.generator = false;
    generator.running = false;
    generator.targetRpm = 0;
    applyPower();
    warnLight.intensity = 2.5;
    notify('🚨 EMERGENCY STOP — All power halted!', 5000);
    return;
  }

  // ── Generator Start ───────────────────────────────────────────────────────
  if (ud.type === 'generator-start') {
    if (!generator.running) {
      generator.running = true;
      generator.targetRpm = 1500;
      if (Audio.ctx) Audio.hum(true);
      notify('🔋 Generator cranking up...', 2500);

      if (activeTask?.id === 'generator_test') {
        clearTimeout(activeTask._rpmCheckTimeout);
        activeTask._rpmCheckTimeout = setTimeout(() => {
          if (generator.rpm >= 1300) {
            notify('✓ Generator RPM nominal — hold for 5s', 2000);
            setTimeout(() => {
              if (generator.running) completeTask('generator_test');
            }, 5000);
          } else {
            notify('⚠ Generator RPM too low', 2000);
          }
        }, 4000);
      }
    } else {
      notify('Generator already running', 1500);
    }
    return;
  }

  // ── Generator Stop ────────────────────────────────────────────────────────
  if (ud.type === 'generator-stop') {
    if (generator.running) {
      generator.running = false;
      generator.targetRpm = 0;
      if (Audio.ctx) Audio.hum(false);
      notify('🔋 Generator shutting down...', 2500);
    } else {
      notify('Generator not running', 1500);
    }
    return;
  }

  // ── SCADA Terminal ────────────────────────────────────────────────────────
  if (ud.type === 'scada-terminal') {
    const term = scadaTerminals[ud.idx];
    if (!term) return;
    if (Audio.ctx) Audio.chirp();
    term.active = !term.active;
    notify(`${term.active ? '✓' : '○'} SCADA Terminal ${ud.idx + 1} ${term.active ? 'Online' : 'Offline'}`);
    if (activeTask?.id === 'scada_monitoring') {
      const allActive = scadaTerminals.every(t => t.active);
      if (allActive) completeTask('scada_monitoring');
      else {
        const cnt = scadaTerminals.filter(t => t.active).length;
        notify(`SCADA ${cnt}/3 active`, 1800);
      }
    }
    return;
  }

  // ── Cable Station ─────────────────────────────────────────────────────────
  if (ud.type === 'cable-station') {
    const station = cableStations[ud.idx];
    if (!station) return;
    if (!station.completed) {
      station.completed = true;
      // Change terminal color to green
      station.terminals.forEach(t => {
        t.conn.material = new THREE.MeshLambertMaterial({ color: 0x33dd66, emissive: new THREE.Color(0x33dd66), emissiveIntensity: .4 });
      });
      notify(`✓ Wire Terminal ${ud.idx + 1} verified & secured`, 2500);
      if (activeTask?.id === 'cable_check') {
        const allDone = cableStations.every(s => s.completed);
        if (allDone) completeTask('cable_check');
        else notify(`Terminals ${cableStations.filter(s => s.completed).length}/3 verified`, 1800);
      }
    } else {
      notify(`Wire Terminal ${ud.idx + 1} — Already verified ✓`, 2000);
    }
    return;
  }

  // ── Multimeter ────────────────────────────────────────────────────────────
  if (ud.type === 'multimeter') {
    const v = (230 + (Math.random() - .5) * 8).toFixed(1);
    const f = (50 + (Math.random() - .5) * .4).toFixed(2);
    notify(`📊 Meter: ${v}V AC  ${f}Hz`, 3000);
    return;
  }

  // ── Oscilloscope ──────────────────────────────────────────────────────────
  if (ud.type === 'oscilloscope') {
    notify('📈 Oscilloscope: Waveform analysis active — 50Hz nominal', 3000);
    return;
  }
}

// ── MINIMAP ───────────────────────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap');
const mmCtx = mmCanvas ? mmCanvas.getContext('2d') : null;
const MM_W = 150, MM_H = 150;
if (mmCanvas) { mmCanvas.width = MM_W; mmCanvas.height = MM_H; }

const MAP = { minX: -16, maxX: 36, minZ: -30, maxZ: 36 };

const ROOMS_MAP = [
  // Floor 1
  { label: 'ENT', x: 1, z: -24, w: 6, d: 8, color: '#1a2535', floor: 1 },
  { label: 'HALL', x: 1, z: 3, w: 6, d: 46, color: '#202030', floor: 1 },
  { label: 'WKSP', x: 15, z: -10, w: 22, d: 20, color: '#2a1e10', floor: 1 },
  { label: 'GEN', x: 12, z: 7, w: 16, d: 14, color: '#162210', floor: 1 },
  { label: 'CTRL', x: 27, z: 1, w: 14, d: 18, color: '#102235', floor: 1 },
  { label: 'DSTA', x: -8, z: -5, w: 12, d: 14, color: '#2a1010', floor: 1 },
  { label: 'DSTB', x: -8, z: 9, w: 12, d: 14, color: '#2a1010', floor: 1 },
  { label: 'LAB', x: 27, z: 16, w: 14, d: 12, color: '#102222', floor: 1 },
  { label: 'STOR', x: -8, z: 22, w: 12, d: 12, color: '#222010', floor: 1 },
  { label: 'UTIL', x: 10, z: 21, w: 12, d: 14, color: '#102222', floor: 1 },
  { label: 'STWR', x: 7, z: 30, w: 6, d: 8, color: '#1a1a2a', floor: 1 },
];

function wx(x) { return (x - MAP.minX) / (MAP.maxX - MAP.minX) * MM_W; }
function wz(z) { return (z - MAP.minZ) / (MAP.maxZ - MAP.minZ) * MM_H; }
function wd(v) { return v / (MAP.maxX - MAP.minX) * MM_W; }
function wh(v) { return v / (MAP.maxZ - MAP.minZ) * MM_H; }

let minimapFloor = 1;

function drawMinimap() {
  if (!mmCtx) return;
  mmCtx.clearRect(0, 0, MM_W, MM_H);
  mmCtx.fillStyle = '#080c12';
  mmCtx.fillRect(0, 0, MM_W, MM_H);

  ROOMS_MAP.filter(r => r.floor === minimapFloor).forEach(r => {
    mmCtx.fillStyle = r.color;
    mmCtx.fillRect(wx(r.x - r.w / 2), wz(r.z - r.d / 2), wd(r.w), wh(r.d));
    mmCtx.strokeStyle = '#2a4a3a';
    mmCtx.lineWidth = 1;
    mmCtx.strokeRect(wx(r.x - r.w / 2), wz(r.z - r.d / 2), wd(r.w), wh(r.d));
    mmCtx.fillStyle = '#4a7a6a';
    mmCtx.font = 'bold 8px monospace';
    mmCtx.textAlign = 'center';
    mmCtx.fillText(r.label, wx(r.x), wz(r.z) + 3);
  });

  // Door markers
  mmCtx.fillStyle = '#f0c060';
  doors.forEach(d => {
    const px = d.pivot.position.x, pz = d.pivot.position.z;
    mmCtx.fillRect(wx(px) - 2, wz(pz) - 2, 4, 4);
  });

  // Player dot
  const ppx = wx(Player.pos.x), ppz = wz(Player.pos.z);
  mmCtx.beginPath();
  mmCtx.arc(ppx, ppz, 4.5, 0, Math.PI * 2);
  mmCtx.fillStyle = '#00ff88';
  mmCtx.fill();

  // Direction arrow
  const dx2 = Math.sin(-Player.yaw) * 9;
  const dz2 = Math.cos(-Player.yaw) * 9;
  mmCtx.strokeStyle = '#00ff88';
  mmCtx.lineWidth = 2;
  mmCtx.beginPath();
  mmCtx.moveTo(ppx, ppz);
  mmCtx.lineTo(ppx + dx2, ppz + dz2);
  mmCtx.stroke();

  // Floor label
  mmCtx.fillStyle = '#6699aa';
  mmCtx.font = '9px monospace';
  mmCtx.textAlign = 'left';
  mmCtx.fillText(`F${minimapFloor}`, 4, 12);

  // Border
  mmCtx.strokeStyle = '#334a44';
  mmCtx.lineWidth = 2;
  mmCtx.strokeRect(0, 0, MM_W, MM_H);
}

// ── HUD ───────────────────────────────────────────────────────────────────────
const promptEl = document.getElementById('prompt');
const rnEl = document.getElementById('roomname');
const fpsEl = document.getElementById('fpsCounter');
let fpsSamples = [], lastFpsFlush = 0;

function updateHUD(dt, animT) {
  // FPS
  fpsSamples.push(1 / dt);
  if (fpsSamples.length > 60) fpsSamples.shift();
  lastFpsFlush += dt;
  if (lastFpsFlush > 0.5 && fpsEl) {
    fpsEl.textContent = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length) + ' fps';
    lastFpsFlush = 0;
  }

  // Floor detection (single floor only)
  const onFloor2 = false;
  minimapFloor = 1;

  // Room name
  if (rnEl) {
    const room = getRoom(Player.pos);
    rnEl.textContent = onFloor2 ? `[F2] ${room}` : room;
  }

  drawMinimap();

  // Generator status
  const genStatus = document.getElementById('genStatus');
  if (genStatus) {
    const statusColor = generator.running ? '#44ff88' : '#888888';
    const rpmPct = Math.round((generator.rpm / 1500) * 100);
    genStatus.innerHTML = `
      <div style="font-size:9px;color:#667788;letter-spacing:1px;">GENERATOR</div>
      <div style="color:${statusColor};font-weight:bold;">
        ${generator.running ? '▶ RUNNING' : '■ OFFLINE'}
      </div>
      <div style="display:flex;gap:8px;margin-top:2px;font-size:9px;color:#aaaaaa;">
        <span>RPM <span style="color:${generator.rpm > 1400 ? '#44ff88' : '#ff9944'}">${Math.round(generator.rpm)}</span></span>
        <span>°C <span style="color:${generator.temp > 75 ? '#ff4422' : '#ffcc44'}">${Math.round(generator.temp)}</span></span>
        <span>⛽ <span style="color:${generator.fuel > 25 ? '#44ff88' : '#ff4422'}">${Math.round(generator.fuel)}%</span></span>
      </div>
      <div style="margin-top:3px;height:3px;background:#1a2233;border-radius:2px;">
        <div style="height:100%;width:${rpmPct}%;background:${generator.running ? '#44ff88' : '#334455'};border-radius:2px;transition:width .3s;"></div>
      </div>
    `;
  }

  // Interaction prompt
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const targets = [...allInteractables, ...doors.map(d => d.panel)];
  const hits = raycaster.intersectObjects(targets, true);

  if (hits.length && hits[0].distance < 4.2) {
    let cur = hits[0].object;
    while (cur && !cur.userData?.type) cur = cur.parent;
    if (cur?.userData?.type) {
      focusedObj = cur;
      const label = cur.userData.door?.label || cur.userData.label || 'Interact';
      if (promptEl) {
        promptEl.innerHTML = `<span style="color:#ffee44">E</span> / Tap → ${label}`;
        promptEl.style.display = 'block';
      }
    } else {
      focusedObj = null;
      if (promptEl) promptEl.style.display = 'none';
    }
  } else {
    focusedObj = null;
    if (promptEl) promptEl.style.display = 'none';
  }

  // Warning light strobe
  if (warnLight.intensity > 0.5) {
    warnLight.intensity = Math.sin(animT * 9) > 0 ? 2.5 : 0.04;
  } else if (warnLight.intensity > 0) {
    warnLight.intensity *= 0.93;
  }

  // Subtle light flicker
  if ((ES.mains || ES.generator) && Math.random() < 0.0002) {
    const roomKeys = ['corridor', 'workshop', 'entrance'];
    const rk = roomKeys[Math.floor(Math.random() * roomKeys.length)];
    const ls = roomLightSets[rk];
    if (ls?.length) {
      const lt = ls[Math.floor(Math.random() * ls.length)];
      const orig = lt.intensity;
      lt.intensity = orig * .15;
      setTimeout(() => { lt.intensity = orig * .6; }, 50);
      setTimeout(() => { lt.intensity = orig; }, 100);
    }
  }

  // Auto-complete utility check when player enters that area
  if (Player.pos.x > 4 && Player.pos.x < 16 && Player.pos.z > 14 && Player.pos.z < 28) {
    const utilTask = TASKS.daily.find(t => t.id === 'utility_check');
    if (utilTask && !utilTask.completed) completeTask('utility_check');
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
  updateGenerator(dt);
  updateSCADA(dt, animT);
  updateOscilloscopes(animT);
  doors.forEach(d => d.update(dt));
  updateHUD(dt, animT);

  renderer.render(scene, camera);
}

// ── STARTUP ───────────────────────────────────────────────────────────────────
document.addEventListener('deviceready', () => {
  if (window.screen?.orientation) screen.orientation.lock('landscape').catch(() => { });
  if (window.StatusBar) StatusBar.hide();
}, false);

const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    Audio.init();
    if (Audio.ctx) Audio.hum(true);

    ['overlay', 'ptrMsg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    ['hud', 'controls', 'taskPanel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });

    if (!isMobile) {
      const msg = document.getElementById('ptrMsg');
      if (msg) { msg.style.display = 'block'; msg.textContent = 'Click to lock mouse | WASD/Mouse to move | E to interact | T toggle tasks'; }
    }

    applyPower();
    updateTaskDisplay();
    notify('🔧 Welcome, Technician! Check your task list. [T] to toggle.', 4000);
    loop();
  });
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.code === 'KeyE') doInteract();
  if (e.code === 'KeyT') {
    const panel = document.getElementById('taskPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
  if (e.code === 'KeyM') {
    const mm = document.getElementById('minimapWrapper');
    if (mm) mm.style.display = mm.style.display === 'none' ? 'block' : 'none';
  }
});

const interactBtn = document.getElementById('btnInteract');
if (interactBtn) {
  interactBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    doInteract();
  }, { passive: false });
}

// ── SUCCESS SOUND ─────────────────────────────────────────────────────────────
Audio.success = function () {
  if (!this.ctx) return;
  const ctx = this.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + .12);
  osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + .22);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + .35);
  osc.start();
  osc.stop(ctx.currentTime + .35);
};
import * as THREE from 'three';
import { Audio } from './audio.js';
import {
  renderer, scene, camera,
  ambLight, warnLight, roomLightSets,
  allInteractables, doors,
  mainPanel, distAPanel, distBPanel, wsPanel,
  generator, updateGenerator,
  scadaTerminals, updateSCADA,
  cableStations,
  updateOscilloscopes,
  M
} from './world.js';
import { updateOutlets, markOutletFixed, outletSockets } from './outlets.js';
import { initOutletScenario, openOutlet, closeOutlet } from './outlet-scenario.js';
import { initSwitchScenario, openSwitch, closeSwitch } from './switch-scenario.js';
import { initSwitches, switchStations, switchProxies, markSwitchFixed, drawSwitchMinimap, updateSwitches } from './switches.js';
import { Player, updatePlayer, getRoom, isMobile } from './player.js';
import { initTutorial, tutorialOnInteract, tutorialOnTaskOpen } from './tutorial-guide.js';


// Global Audio for menu.js
window.GameAudio = Audio;
// Expose Player for outlet-scenario.js (used in both world and standalone learn mode)
window.Player = Player;



// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK LOG
// ══════════════════════════════════════════════════════════════════════════════
const LOG_MAX = 4;
const logLines = [];

function feedbackLog(msg, type = 'info') {
  // type: 'info' | 'ok' | 'error' | 'warn'
  const colors = { info: '#aab8cc', ok: '#44ff88', error: '#ff5544', warn: '#FFB800' };
  logLines.push({ msg, color: colors[type] || colors.info });
  if (logLines.length > LOG_MAX) logLines.shift();
  const el = document.getElementById('feedbackLog');
  if (!el) return;
  el.innerHTML = logLines.map(l =>
    `<div style="color:${l.color};margin:1px 0;">${l.msg}</div>`
  ).join('');
}

// ── ELECTRICAL STATE ──────────────────────────────────────────────────────────
const ES = {
  mains: true,
  generator: false,
  workshop: true,
  entrance: true,
};

const lightTargets = {
  entrance: 2.2,
  workshop: 2.8,
  storage: 3.2,
  utility: 3.5,
  stairwell: 3.0,
};

// ── ASSISTANT/TUTORIAL SYSTEM REMOVED ──────────────────────────────────────

// Memoised HUD state — only write to DOM when values change
const _hudPrev = { mains: null, gen: null, work: null };

function applyPower() {
  const hasPower = ES.mains || ES.generator;
  Object.entries(roomLightSets).forEach(([room, lights]) => {
    const powered = hasPower && (ES[room] !== false);
    const tgt = powered ? (lightTargets[room] || 3.5) : 0;
    lights.forEach(l => { l.intensity += (tgt - l.intensity) * 0.1; });
  });
  ambLight.intensity = hasPower ? 0.52 : 0.18; // slightly dimmed for realism

  const work = ES.workshop && hasPower;
  if (ES.mains     !== _hudPrev.mains) { setHUD('pMains', ES.mains);     _hudPrev.mains = ES.mains; }
  if (ES.generator !== _hudPrev.gen)   { setHUD('pGen',   ES.generator); _hudPrev.gen   = ES.generator; }
  if (work         !== _hudPrev.work)  { setHUD('pWork',  work);         _hudPrev.work  = work; }
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
      id: 'safety_briefing',
      title: 'Safety Briefing',
      desc: 'Read the safety rules poster in the Lobby, then check the PPE rack in the Tool Room',
      location: 'Lobby → Tool Room',
      completed: false,
    },
    {
      id: 'module_lesson',
      title: 'Study Module Lesson',
      desc: 'Enter the Classroom and read the whiteboard / projector slide for today\'s module',
      location: 'Classroom',
      completed: false,
    },
    {
      id: 'panel_inspection',
      title: 'Panel Room Inspection',
      desc: 'Check all breaker panels in the Panel Distribution Room (click each panel breaker)',
      location: 'Panel / Distribution Room',
      completed: false,
      subtasks: [
        { panel: 'main-panel', checked: false },
        { panel: 'dist-a',    checked: false },
        { panel: 'dist-b',    checked: false },
        { panel: 'workshop',  checked: false },
      ]
    },
    {
      id: 'dol_wiring',
      title: 'DOL Motor Wiring',
      desc: 'Connect 3-phase supply wires (L, N, PE) to terminal block at the Wiring Lab station',
      location: 'Wiring Lab — Station B',
      completed: false,
    },
    {
      id: 'motor_control',
      title: 'Motor Control Operation',
      desc: 'Press START on the DOL panel in the Motor Control Lab and observe motor running',
      location: 'Motor Control Lab',
      completed: false,
      _rpmCheckTimeout: null,
    },
    {
      id: 'schematic_quiz',
      title: 'Schematic Reading',
      desc: 'View and identify the DOL Motor Control circuit diagram on the schematic board',
      location: 'Motor Control Lab — North Wall',
      completed: false,
    },
    {
      id: 'cable_check',
      title: 'Wire Terminal Check',
      desc: 'Verify all 3 wire terminal stations in the Wiring Lab are correctly terminated',
      location: 'Wiring Lab',
      completed: false,
    },
    {
      id: 'component_id',
      title: 'Component Identification',
      desc: 'Identify contactor, overload relay, and push-button on the DOL panel',
      location: 'Motor Control Lab',
      completed: false,
    },
    {
      id: 'assessment',
      title: 'Competency Assessment',
      desc: 'Complete the validation check at the Assessment Room testing station',
      location: 'Assessment Room',
      completed: false,
    },
    {
      id: 'instructor_check',
      title: 'Instructor Sign-Off',
      desc: 'Visit the Faculty Room and use the Instructor Terminal to submit your work',
      location: 'Faculty / Instructor Room',
      completed: false,
    },
    {
      id: 'outlet_repair',
      title: 'Outlet Fault Repair',
      desc: 'Find and repair all 5 broken electrical outlets scattered across the facility. Approach each glowing socket and press E / tap FIX.',
      location: 'Lobby · Wiring Lab · Corridor · Control Room · Tool Room',
      completed: false,
      _fixedCount: 0,
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
  notify(`TASK: ${task.title}`, 3000);
  updateTaskDisplay();
}

function completeTask(taskId) {
  const task = TASKS.daily.find(t => t.id === taskId);
  if (!task || task.completed) return;
  task.completed = true;
  if (activeTask?.id === taskId) activeTask = null;
  const dur = Math.floor((Date.now() - taskStartTime) / 1000);
  notify(`COMPLETE: ${task.title} (${dur}s)`, 4000);
  if (Audio.ctx) Audio.success();
  updateTaskDisplay();
  checkAllTasksComplete();
}

function checkAllTasksComplete() {
  if (TASKS.daily.every(t => t.completed)) {
    notify('ALL TASKS COMPLETE! Shift finished.', 6000);
  }
}

function updateTaskDisplay() {
  const list = document.getElementById('taskList');
  if (!list) return;
  list.innerHTML = '';
  TASKS.daily.forEach(task => {
    const isActive = activeTask?.id === task.id;
    const div = document.createElement('div');
    div.style.cssText = `
      display:flex; align-items:flex-start; gap:12px;
      padding:14px 16px;
      background:${task.completed ? 'rgba(20,55,32,0.55)' : isActive ? 'rgba(20,40,70,0.65)' : 'rgba(14,24,40,0.55)'};
      border:2px solid ${task.completed ? 'rgba(68,200,100,0.45)' : isActive ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.1)'};
      border-radius:12px;
      cursor:${task.completed ? 'default' : 'pointer'};
      transition:border-color 0.2s;
    `;
    const badge = task.completed ? '✓' : isActive ? '▶' : '○';
    const badgeColor = task.completed ? '#44c864' : isActive ? '#ffd700' : 'rgba(255,255,255,0.35)';
    div.innerHTML = `
      <div style="font-family:'Bebas Neue',cursive;font-size:22px;color:${badgeColor};flex-shrink:0;line-height:1;margin-top:2px;">${badge}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'Bebas Neue',cursive;font-size:clamp(15px,2.5vw,20px);color:${task.completed ? '#44c864' : '#fff'};letter-spacing:1.5px;line-height:1.2;">${task.title}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;line-height:1.5;font-family:'Inter',sans-serif;">${task.desc}</div>
        <div style="font-family:'Bebas Neue',cursive;font-size:12px;color:rgba(255,215,0,0.5);margin-top:6px;letter-spacing:1px;">&#128205; ${task.location}</div>
      </div>
    `;
    if (!task.completed) {
      div.addEventListener('click', () => {
        startTask(task.id);
        _closeTaskPanel();
      });
    }
    list.appendChild(div);
  });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function notify(msg, dur = 2800) {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = msg;
  el.style.transition = 'none';
  el.style.display = 'block';
  el.style.opacity = '0';
  el.style.transform = 'translateX(-50%) translateY(-16px) scale(0.94)';
  // Force reflow then animate in
  void el.offsetWidth;
  el.style.transition = 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1)';
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0) scale(1)';
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-10px) scale(0.96)';
    setTimeout(() => { el.style.display = 'none'; }, 320);
  }, dur);
}

// ── INTERACTION ───────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
raycaster.far = 4.2;
let focusedObj = null;

function doInteract() {
  // State guards
  if (Player.state === 'sitting') {
    Player.state = 'standing';
    Player.pos.z += 0.8;
    if (focusedObj?.userData) focusedObj.userData.label = 'Sit Down (Couch)';
    if (Audio.ctx) Audio.click();
    return;
  }
  if (Player.state === 'wall-panel') {
    // already in panel-view — clicking again exits
    _exitWallPanel();
    return;
  }
  if (Player.state === 'computer' || Player.state === 'cctv' || Player.state === 'circuit' || Player.state === 'outlet' || Player.state === 'repair') return;
  if (!focusedObj) return;

  // Notify tutorial system of interaction
  tutorialOnInteract();

  const ud = focusedObj.userData;
  if (Audio.ctx) Audio.click();



  // ── Seating ───────────────────────────────────────────────────────────────
  if (ud.type === 'sit') {
    Player.state = 'sitting';
    Player.targetCamPos.copy(ud.sitPos);
    Player.targetCamRot.set(-0.12, ud.sitYaw, 0, 'YXZ');
    ud.label = 'Stand Up (Couch)';
    return;
  }

  // ── Computer ──────────────────────────────────────────────────────────────
  if (ud.type === 'computer') {
    Player.state = 'computer';
    Player.lastComputerPos = ud.compPos || new THREE.Vector3(2.5, 1.10, -22.83);
    Player.lastComputerRot = ud.compRot || new THREE.Euler(-0.05, 0, 0, 'YXZ');
    Player.targetCamPos.copy(Player.lastComputerPos);
    Player.targetCamRot.copy(Player.lastComputerRot);
    window.openComputerUI();
    return;
  }

  // ── Circuit Bench (wiring modal) ──────────────────────────────────────────
  if (ud.type === 'circuit-bench') {
    Player.state = 'circuit';
    window.openCircuitModal(ud.label, ud.benchId);
    return;
  }

  // ── Outlet Socket (repair scenario) ───────────────────────────────────────
  if (ud.type === 'outlet-socket') {
    if (window.currentStageId === 2) return; // Stage 2 = switch wiring only (via scenario2.html)
    if (ud.fixed) { notify('This outlet is already repaired.', 1800); return; }
    Player.state = 'repair';
    window._orCurrentSocket = ud.socketId;
    document.exitPointerLock?.();
    openOutlet(ud.socketId);
    return;
  }

  // ── Switch Station (Level 2) ──────────────────────────────────────────────
  if (ud.type === 'switch_station') {
    const rec = ud._parentRecord;
    if (rec?.fixed) { notify('This switch is already installed.', 1800); return; }
    document.exitPointerLock?.();
    openSwitch(ud.stationId);
    return;
  }

  // ── Wall Switch Panel (camera zoom, in-world) ────────────────────────────
  if (ud.type === 'wall-panel') {
    Player.state = 'wall-panel';
    Player.targetCamPos.copy(ud.camPos);
    Player.targetCamRot.copy(ud.camLook);
    document.exitPointerLock?.();
    notify(`${ud.label} — click switch to test / ESC to step back`, 2500);
    window._activePanel = ud;
    // Show ESC hint
    const escHint = document.getElementById('escHint');
    if (escHint) { escHint.style.display = 'flex'; }
    return;
  }

  // ── Workshop Wiring Station ───────────────────────────────────────────────
  if (ud.type === 'workshop-wiring') {
    document.exitPointerLock?.();
    notify(`Opening ${ud.label}...`, 1500);
    // Check prior completion and show stars on the LED if done
    try {
      const raw = localStorage.getItem('wireverse_workshop');
      const store = raw ? JSON.parse(raw) : {};
      const prev = store[ud.switchType];
      if (prev?.completed) {
        notify(`${ud.label} — Best: ${'★'.repeat(prev.bestStars || 0)} — Opening again...`, 2200);
      }
    } catch(e) {}
    setTimeout(() => {
      window.location.href = `scenario2.html?type=${ud.switchType}&from=workshop`;
    }, 400);
    return;
  }

  // ── Inspect ───────────────────────────────────────────────────────────────
  if (ud.type === 'inspect') {
    notify(`INSPECTED: ${ud.label}`, 3000);
    return;
  }

  // ── Door ──────────────────────────────────────────────────────────────────
  if (ud.type === 'door') {
    ud.door.toggle(Audio.ctx ? Audio : null, notify);
    showComponentInfo(ud);
    return;
  }

  // ── Breaker ───────────────────────────────────────────────────────────────
  if (ud.type === 'breaker') {
    const panelMap = {
      'main-panel': mainPanel,
      'dist-a':     distAPanel,
      'dist-b':     distBPanel,
      'workshop':   wsPanel,
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
    notify(`${ud.label}: ${br.on ? 'ON' : 'OFF'}`);
    showComponentInfo(ud);
    if (activeTask?.id === 'panel_inspection') {
      const sub = activeTask.subtasks.find(s => s.panel === ud.panel);
      if (sub && !sub.checked) {
        sub.checked = true;
        if (activeTask.subtasks.every(s => s.checked)) completeTask('panel_inspection');
        else notify(`[OK] Panel ${ud.panel} checked (${activeTask.subtasks.filter(s => s.checked).length}/4)`, 2000);
      }
    }
    return;
  }

  // ── Switch ────────────────────────────────────────────────────────────────
  if (ud.type === 'switch') {
    ud.on = !ud.on;
    ud.mesh.material = ud.on ? M.green : M.red;
    if (ud.id === 'main-switch') { ES.mains = ud.on; applyPower(); }
    if (ud.id === 'gen-switch')  { ES.generator = ud.on; applyPower(); }
    notify(`${ud.label}: ${ud.on ? 'ON' : 'OFF'}`);
    showComponentInfo(ud);
    return;
  }

  // ── SCADA Terminal ────────────────────────────────────────────────────────
  if (ud.type === 'scada-terminal') {
    const term = scadaTerminals[ud.idx];
    if (!term) return;
    if (Audio.ctx) Audio.chirp?.() || Audio.click();
    term.active = !term.active;
    notify(`${term.active ? '[OK]' : '[ ]'} SCADA Terminal ${ud.idx + 1} ${term.active ? 'Online' : 'Offline'}`);
    showComponentInfo(ud);
    if (activeTask?.id === 'scada_monitoring') {
      const allActive = scadaTerminals.every(t => t.active);
      if (allActive) completeTask('scada_monitoring');
      else notify(`SCADA ${scadaTerminals.filter(t => t.active).length}/3 active`, 1800);
    }
    return;
  }

  // ── Emergency Stop ────────────────────────────────────────────────────────
  if (ud.type === 'estop') {
    if (Audio.ctx) Audio.alert?.() || Audio.click();
    ES.mains = false; ES.generator = false;
    generator.running = false;
    generator.targetRpm = 0;
    applyPower();
    warnLight.intensity = 2.5;
    notify('EMERGENCY STOP — All power halted!', 5000);
    return;
  }

  // ── Generator Start ───────────────────────────────────────────────────────
  if (ud.type === 'generator-start') {
    if (!generator.running) {
      generator.running = true;
      generator.targetRpm = 1500;
      if (Audio.ctx) Audio.hum(true);
      showComponentInfo(ud);
      notify('Motor starting — DOL sequence initiated...', 2500);
      if (activeTask?.id === 'motor_control') {
        clearTimeout(activeTask._rpmCheckTimeout);
        activeTask._rpmCheckTimeout = setTimeout(() => {
          if (generator.rpm >= 1300) {
            notify('[OK] Motor running at rated speed — task complete!', 2500);
            setTimeout(() => { if (generator.running) completeTask('motor_control'); }, 3000);
          } else notify('Motor RPM too low — check connections', 2000);
        }, 4000);
      }
    } else notify('Motor already running', 1500);
    return;
  }

  // ── Generator Stop ────────────────────────────────────────────────────────
  if (ud.type === 'generator-stop') {
    if (generator.running) {
      generator.running = false; generator.targetRpm = 0;
      if (Audio.ctx) Audio.hum(false);
      notify('Motor stopped — DOL circuit opened.', 2500);
    } else notify('Motor not running', 1500);
    return;
  }

  // ── Cable Station ─────────────────────────────────────────────────────────
  if (ud.type === 'cable-station') {
    const station = cableStations[ud.idx];
    if (!station) return;
    if (!station.completed) {
      station.completed = true;
      station.terminals.forEach(t => {
        t.conn.material = new THREE.MeshLambertMaterial({ color: 0x33dd66, emissive: new THREE.Color(0x33dd66), emissiveIntensity: .4 });
      });
      showComponentInfo(ud);
      notify(`[OK] Wire Terminal ${ud.idx + 1} verified & secured`, 2500);
      if (activeTask?.id === 'cable_check') {
        const allDone = cableStations.every(s => s.completed);
        if (allDone) completeTask('cable_check');
        else notify(`Terminals ${cableStations.filter(s => s.completed).length}/3 verified`, 1800);
      }
    } else notify(`Wire Terminal ${ud.idx + 1} — Already verified [OK]`, 2000);
    return;
  }

  // ── Oscilloscope ──────────────────────────────────────────────────────────
  if (ud.type === 'oscilloscope') {
    notify('SCOPE: Waveform analysis active — 50Hz nominal', 3000);
    showComponentInfo(ud);
    return;
  }

  // ── Whiteboard — orientation card ─────────────────────────────────────────
  if (ud.type === 'whiteboard') {
    showOrientationCard();
    showComponentInfo(ud);
    return;
  }

}

// ── WALL PANEL EXIT ───────────────────────────────────────────────────────────
function _exitWallPanel() {
  if (Player.state !== 'wall-panel') return;
  Player.state = 'standing';
  window._activePanel = null;
  const escHint = document.getElementById('escHint');
  if (escHint) escHint.style.display = 'none';
  if (Audio.ctx) Audio.click();
}

// ── MINIMAP ───────────────────────────────────────────────────────────────────
const mmCanvas = document.getElementById('minimap');
const mmCtx = mmCanvas ? mmCanvas.getContext('2d') : null;
// Canvas resolution matches CSS size — updated on resize
function resizeMinimap() {
  if (!mmCanvas) return;
  const rect = mmCanvas.getBoundingClientRect();
  mmCanvas.width  = rect.width  || 148;
  mmCanvas.height = rect.height || 148;
}
resizeMinimap();
window.addEventListener('resize', resizeMinimap);

const MAP = { minX: -10, maxX: 10, minZ: -34, maxZ: 10 };

const MM_ZONES = {
  lobby:    { fill: 'rgba(16,24,12,0.85)',  wall: 'rgba(120,180,80,0.75)', label: 'rgba(160,220,100,0.95)' },
  workshop: { fill: 'rgba(8,22,44,0.85)',   wall: 'rgba(40,120,220,0.75)', label: 'rgba(80,170,255,0.95)'  },
};

const MM_ROOMS = [
  { abbr: 'LOBBY',  cx: 0, cz:  3,   w: 16, d: 10, zone: 'lobby'    },
  { abbr: 'WS-1',   cx: 0, cz: -10,  w: 16, d: 16, zone: 'workshop' },
  { abbr: 'WS-2',   cx: 0, cz: -25,  w: 16, d: 14, zone: 'workshop' },
];


let _mmLastX = 0, _mmLastZ = 0, _mmLastYaw = 0;

function drawMinimap() {
  if (!mmCtx) return;

  // Skip redraw if player hasn't moved or rotated meaningfully
  if (
    Math.abs(Player.pos.x - _mmLastX)  < 0.08 &&
    Math.abs(Player.pos.z - _mmLastZ)  < 0.08 &&
    Math.abs(Player.yaw   - _mmLastYaw) < 0.025
  ) return;
  _mmLastX = Player.pos.x; _mmLastZ = Player.pos.z; _mmLastYaw = Player.yaw;

  const W = mmCanvas.width, H = mmCanvas.height;
  mmCtx.clearRect(0, 0, W, H);

  // ── Background ──────────────────────────────────────────────────────────
  mmCtx.fillStyle = '#020810';
  mmCtx.fillRect(0, 0, W, H);

  // Subtle grid
  mmCtx.strokeStyle = 'rgba(68,255,136,0.035)';
  mmCtx.lineWidth = 0.5;
  const step = 14;
  for (let x = 0; x <= W; x += step) {
    mmCtx.beginPath(); mmCtx.moveTo(x, 0); mmCtx.lineTo(x, H); mmCtx.stroke();
  }
  for (let y = 0; y <= H; y += step) {
    mmCtx.beginPath(); mmCtx.moveTo(0, y); mmCtx.lineTo(W, y); mmCtx.stroke();
  }

  // ── Helper: world → pixel ───────────────────────────────────────────────
  const mpx = x => (x - MAP.minX) / (MAP.maxX - MAP.minX) * W;
  const mpz = z => (z - MAP.minZ) / (MAP.maxZ - MAP.minZ) * H;
  const msw = v => v / (MAP.maxX - MAP.minX) * W;
  const msh = v => v / (MAP.maxZ - MAP.minZ) * H;

  // ── Rooms ────────────────────────────────────────────────────────────────
  MM_ROOMS.forEach(r => {
    const rx = mpx(r.cx - r.w / 2);
    const ry = mpz(r.cz - r.d / 2);
    const rw = msw(r.w);
    const rh = msh(r.d);
    const zc = MM_ZONES[r.zone];

    // Fill
    mmCtx.fillStyle = zc.fill;
    mmCtx.fillRect(rx, ry, rw, rh);

    // Wall outline
    mmCtx.strokeStyle = zc.wall;
    mmCtx.lineWidth = 1.0;
    mmCtx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);

    // Label — only if room is wide enough
    if (rw > 14 && rh > 10) {
      mmCtx.fillStyle = zc.label;
      mmCtx.font = `bold ${Math.min(10, rw / r.abbr.length * 1.3)}px monospace`;
      mmCtx.textAlign = 'center';
      mmCtx.textBaseline = 'middle';
      mmCtx.fillText(r.abbr, mpx(r.cx), mpz(r.cz));
    }
  });

  // ── Door markers ──────────────────────────────────────────────────────────
  doors.forEach(d => {
    const px = mpx(d.pivot.position.x);
    const pz = mpz(d.pivot.position.z);
    mmCtx.fillStyle = 'rgba(240,190,60,0.75)';
    mmCtx.fillRect(px - 2, pz - 1, 4, 2);
  });

  // ── Switch/Outlet Markers — show only what's relevant to the current task ──
  const _exType = window.exploreType || '';
  const _isExplore = !!window.exploreMode;

  // Switch markers: only in switch-all explore or non-explore workshop mode
  if (!_isExplore || _exType === 'switch-all') {
    drawSwitchMinimap(mmCtx, mpx, mpz, W, H);
  }

  // Outlet markers: only in outlet-all explore or non-explore workshop mode
  if (typeof outletSockets !== 'undefined' && (!_isExplore || _exType === 'outlet-all')) {
    outletSockets.forEach(s => {
      const px = mpx(s.group.position.x);
      const pz = mpz(s.group.position.z);

      mmCtx.beginPath();
      mmCtx.arc(px, pz, 3, 0, Math.PI * 2);
      mmCtx.fillStyle = s.fixed ? '#22c55e' : '#ff3300';
      mmCtx.fill();

      if (!s.fixed) {
        const pulse = 4.5 + Math.sin(Date.now() / 200) * 1.8;
        mmCtx.beginPath();
        mmCtx.arc(px, pz, pulse, 0, Math.PI * 2);
        mmCtx.strokeStyle = 'rgba(255,51,0,0.45)';
        mmCtx.lineWidth = 1.5;
        mmCtx.stroke();
      }
    });
  }

  // ── Player triangle ───────────────────────────────────────────────────────
  const ppx = mpx(Player.pos.x);
  const ppz = mpz(Player.pos.z);
  const angle = -Player.yaw;
  const sz = 5;

  mmCtx.save();
  mmCtx.translate(ppx, ppz);
  mmCtx.rotate(angle);
  mmCtx.shadowColor = '#44ff88';
  mmCtx.shadowBlur = 6;
  mmCtx.fillStyle = '#44ff88';
  mmCtx.beginPath();
  mmCtx.moveTo(0, -sz);             // tip
  mmCtx.lineTo( sz * 0.55,  sz * 0.65);
  mmCtx.lineTo(-sz * 0.55,  sz * 0.65);
  mmCtx.closePath();
  mmCtx.fill();
  mmCtx.restore();

  // ── Corner label ─────────────────────────────────────────────────────────
  mmCtx.shadowBlur = 0;
  mmCtx.fillStyle = 'rgba(68,255,136,0.28)';
  mmCtx.font = 'bold 11px Courier New';
  mmCtx.textAlign = 'left';
  mmCtx.textBaseline = 'top';
  mmCtx.fillText('F1', 4, 3);

  // ── Border frame ──────────────────────────────────────────────────────────
  mmCtx.strokeStyle = 'rgba(68,255,136,0.3)';
  mmCtx.lineWidth = 1.5;
  mmCtx.strokeRect(0.75, 0.75, W - 1.5, H - 1.5);
}

// ── HUD ───────────────────────────────────────────────────────────────────────
const promptEl = document.getElementById('btnInteract');
const rnEl = document.getElementById('roomname');
const fpsEl = document.getElementById('fpsCounter');
let fpsSamples = [], lastFpsFlush = 0;

let _hudCache = { room: null, genRunning: null, rpmPct: null, temp: null, prompt: null };
let _lastRayT = 0;
let _cachedTargets = null;
const _objWP = new THREE.Vector3(); // reusable world-position buffer for proximity checks

function updateHUD(dt, animT) {
  // FPS
  fpsSamples.push(1 / dt);
  if (fpsSamples.length > 60) fpsSamples.shift();
  lastFpsFlush += dt;
  if (lastFpsFlush > 0.5 && fpsEl) {
    fpsEl.textContent = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length) + ' fps';
    lastFpsFlush = 0;
  }

  const onFloor2 = false;

  // Room name (cached update)
  if (rnEl) {
    const room = getRoom(Player.pos);
    const text = onFloor2 ? `[F2] ${room}` : room;
    if (_hudCache.room !== text) {
      rnEl.textContent = text;
      _hudCache.room = text;
    }
  }

  // Throttle minimap redraws to max ~15 FPS to avoid heavy canvas ops during movement
  if (typeof window._lastMmT === 'undefined') window._lastMmT = 0;
  if (animT - window._lastMmT > 0.06) {
    window._lastMmT = animT;
    drawMinimap();
  }

  // Generator status (cached update to stop layout thrashing)
  const genStatus = document.getElementById('genStatus');
  if (genStatus) {
    const rpmPct = Math.round((generator.rpm / 1500) * 100);
    const temp = Math.round(generator.temp);
    if (_hudCache.genRunning !== generator.running || _hudCache.rpmPct !== rpmPct || _hudCache.temp !== temp) {
      const statusColor = generator.running ? '#44ff88' : '#888888';
      genStatus.innerHTML = `
        <div style="font-size:9px;color:#667788;letter-spacing:1px;">MOTOR CONTROL</div>
        <div style="color:${statusColor};font-weight:bold;">
          ${generator.running ? '▶ RUNNING' : '■ STOPPED'}
        </div>
        <div style="display:flex;gap:8px;margin-top:2px;font-size:9px;color:#aaaaaa;">
          <span>RPM <span style="color:${generator.rpm > 1400 ? '#44ff88' : '#ff9944'}">${Math.round(generator.rpm)}</span></span>
          <span>°C <span style="color:${generator.temp > 75 ? '#ff4422' : '#ffcc44'}">${temp}</span></span>
        </div>
        <div style="margin-top:3px;height:3px;background:#1a2233;border-radius:2px;">
          <div style="height:100%;width:${rpmPct}%;background:${generator.running ? '#44ff88' : '#334455'};border-radius:2px;transition:width .3s;"></div>
        </div>
      `;
      _hudCache.genRunning = generator.running;
      _hudCache.rpmPct = rpmPct;
      _hudCache.temp = temp;
    }
  }

  // Interaction prompt
  if (Player.state === 'sitting') {
    if (promptEl && _hudCache.prompt !== 'STAND UP') {
      promptEl.textContent = 'STAND UP';
      promptEl.style.setProperty('display', 'flex', 'important');
      _hudCache.prompt = 'STAND UP';
    }
  } else if (Player.state === 'computer' || Player.state === 'cctv') {
    if (promptEl && _hudCache.prompt !== 'NONE') {
      promptEl.style.setProperty('display', 'none', 'important');
      _hudCache.prompt = 'NONE';
    }
  } else {
    // Throttle raycasting to max ~10fps
    if (animT - _lastRayT > 0.1) {
      _lastRayT = animT;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      if (!_cachedTargets) {
        const switchProxArr = typeof switchProxies !== 'undefined' ? switchProxies : [];
        _cachedTargets = [...allInteractables, ...doors.map(d => d.panel), ...switchProxArr];
      }
      
      const hits = raycaster.intersectObjects(_cachedTargets, true);

      let newPrompt = 'NONE';
      let foundViaRay = false;
      if (hits.length && hits[0].distance < 4.2) {
        let cur = hits[0].object;
        while (cur && !cur.userData?.type) cur = cur.parent;
        if (cur?.userData?.type) {
          if (window.currentStageId === 2 && cur.userData.type === 'outlet-socket') {
            focusedObj = null; // suppress outlets in Stage 2
          } else {
            focusedObj = cur;
            foundViaRay = true;
            const rawLabel = cur.userData.door?.label || cur.userData.label || 'Interact';
            newPrompt = cur.userData.type === 'door'
              ? 'ENTER'
              : rawLabel.length > 12 ? rawLabel.slice(0, 10).toUpperCase() + '…' : rawLabel.toUpperCase();
          }
        }
      }

      // ── Proximity fallback — works when not aiming precisely (mobile) ──
      if (!foundViaRay) {
        const PROX = 2.2;
        let nearDist = PROX, nearObj = null;
        const cp = camera.position;
        for (const obj of _cachedTargets) {
          obj.getWorldPosition(_objWP); // use world pos — local pos is wrong for grouped objects
          const d = cp.distanceTo(_objWP);
          if (d < nearDist) { nearDist = d; nearObj = obj; }
        }
        if (nearObj) {
          let cur = nearObj;
          while (cur && !cur.userData?.type) cur = cur.parent;
          if (cur?.userData?.type) {
            if (window.currentLevelId === 2 && cur.userData.type === 'outlet-socket') {
              focusedObj = null; // suppress outlets in Level 2
            } else {
              focusedObj = cur;
              const rawLabel = cur.userData.door?.label || cur.userData.label || 'Interact';
              newPrompt = cur.userData.type === 'door'
                ? 'ENTER'
                : rawLabel.length > 12 ? rawLabel.slice(0, 10).toUpperCase() + '…' : rawLabel.toUpperCase();
            }
          } else { focusedObj = null; }
        } else { focusedObj = null; }
      }

      // Only show the big FIX button for outlet-socket type; hide for everything else on mobile
      const isOutlet = focusedObj?.userData?.type === 'outlet-socket';
      const showBtn = isOutlet && newPrompt !== 'NONE';
      if (promptEl && _hudCache.prompt !== newPrompt) {
        if (!showBtn) {
          promptEl.style.setProperty('display', 'none', 'important');
        } else {
          promptEl.textContent = 'FIX';
          promptEl.style.setProperty('display', 'flex', 'important');
        }
        _hudCache.prompt = newPrompt;
      }
    }
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

  // Auto-complete 'Study Module Lesson' when player enters the Classroom
  if (Player.pos.x > 4 && Player.pos.x < 16 && Player.pos.z > 14 && Player.pos.z < 28) {
    const lessonTask = TASKS.daily.find(t => t.id === 'module_lesson');
    if (lessonTask && !lessonTask.completed) {
      notify('📖 You entered the Classroom — reading today\'s module!', 3000);
      setTimeout(() => completeTask('module_lesson'), 2000);
    }
  }
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────
let animT = 0;

let _frameCount = 0;
let _prevTime = performance.now();
const _menuOverlay = document.getElementById('overlay');

function loop(now) {
  requestAnimationFrame(loop);

  // While menu is showing — do nothing, preserve GPU
  if (_menuOverlay && _menuOverlay.style.display !== 'none') {
    _prevTime = now; // reset so dt=0 on resume instead of a huge spike
    return;
  }

  // True delta — no artificial cap; let rAF run at device's native rate (60/120Hz)
  const dt = Math.min((now - _prevTime) / 1000, 0.05);
  _prevTime = now;
  animT += dt;
  _frameCount++;

  updatePlayer(dt);

  // Stagger secondary updates: one bucket per frame, round-robin
  const fm = _frameCount % 3;
  if (fm === 0) { applyPower(); updateGenerator(dt); }
  if (fm === 1) { updateSCADA(dt, animT); updateOscilloscopes(animT); }
  if (fm === 2) { updateOutlets(animT); updateSwitches(animT); doors.forEach(d => d.update(dt)); }

  updateHUD(dt, animT);

  // Desktop: bloom composer; mobile: plain render (no postprocessing)
  if (!isMobile && window._composer) window._composer.render();
  else renderer.render(scene, camera);
}

// ── STARTUP ───────────────────────────────────────────────────────────────────
document.addEventListener('deviceready', () => {
  if (window.screen?.orientation) screen.orientation.lock('landscape').catch(() => { });
  if (window.StatusBar) StatusBar.hide();
}, false);

const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const loadingScreen  = document.getElementById('loadingScreen');
    const loadingBarFill = document.getElementById('loadingBarFill');
    const loadingPct     = document.getElementById('loadingPct');

    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (loadingBarFill) loadingBarFill.style.width = '0%';
    if (loadingPct) loadingPct.textContent = '0';

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';

    // Start tip rotator
    if (window._startTips) window._startTips();

    // Smooth progress simulation — reaches ~95% by 2.8s, then snaps to 100%
    let progress = 0;
    const LOAD_STEPS = [
      { target: 18,  label: 'Loading world geometry...' },
      { target: 36,  label: 'Compiling shaders...' },
      { target: 52,  label: 'Initializing lighting system...' },
      { target: 68,  label: 'Setting up audio engine...' },
      { target: 80,  label: 'Spawning interactables...' },
      { target: 91,  label: 'Verifying circuit boards...' },
      { target: 97,  label: 'Almost ready...' },
    ];
    let stepIdx = 0;
    const tipEl = document.getElementById('loadingTip');

    const interval = setInterval(() => {
      if (stepIdx < LOAD_STEPS.length) {
        const step = LOAD_STEPS[stepIdx];
        const jump = (step.target - progress) * 0.35 + Math.random() * 3;
        progress = Math.min(step.target, progress + jump);
        if (progress >= step.target - 1) {
          if (tipEl) { tipEl.style.animation = 'none'; void tipEl.offsetWidth; tipEl.style.animation = 'loadTipFade 0.6s ease both'; tipEl.textContent = step.label; }
          stepIdx++;
        }
      }
      if (loadingBarFill) loadingBarFill.style.width = progress + '%';
      if (loadingPct) loadingPct.textContent = Math.round(progress);
    }, 320);

    setTimeout(() => {
      clearInterval(interval);
      if (window._stopTips) window._stopTips();
      if (loadingBarFill) loadingBarFill.style.width = '100%';
      if (loadingPct) loadingPct.textContent = '100';
      if (tipEl) { tipEl.style.animation = 'none'; void tipEl.offsetWidth; tipEl.style.animation = 'loadTipFade 0.4s ease both'; tipEl.textContent = 'Ready! Entering training facility...'; }

      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.style.opacity = '0';
          setTimeout(() => { loadingScreen.style.display = 'none'; }, 900);
        }
      }, 500);

      try { Audio.init(); } catch (e) { console.error("Audio.init Error", e); }
      // Stop main-menu BGM and switch to game ambience
      try { if (window._stopMenuBGM) window._stopMenuBGM(); } catch (e) {}
      try { if (Audio.ctx) Audio.hum(true); } catch (e) { console.error("Audio.hum Error", e); }
      try { if (typeof _initOutlets === 'function') _initOutlets(); } catch (e) { console.error("_initOutlets Error", e); }
      try { if (typeof _initSwitches === 'function') _initSwitches(); } catch (e) { console.error("_initSwitches Error", e); }

      try {
        const hudEl = document.getElementById('hud');
        if (hudEl) hudEl.style.display = 'block';
        if (!isMobile) {
          const msg = document.getElementById('ptrMsg');
          if (msg) { msg.style.display = 'block'; msg.textContent = 'Click to lock mouse | WASD to move | Space to jump | E to interact'; }
        }
      } catch (e) { console.error("UI init Error:", e); }

      try { if (typeof applyPower === 'function') applyPower(); } catch (e) {}
      try { if (typeof updateTaskDisplay === 'function') updateTaskDisplay(); } catch (e) {}
      try { if (typeof updateToolHUD === 'function') updateToolHUD(); } catch (e) {}

      try {
        ['btnTopTasks', 'btnPauseTop'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'flex';
        });
      } catch (e) {}

      try {
        if (typeof loop === 'function') requestAnimationFrame(loop);
        if (!isMobile) {
          const cvs = document.getElementById('c');
          if (cvs && cvs.requestPointerLock) cvs.requestPointerLock();
        }
      } catch (e) { console.error("Loop/Render Error:", e); }

      // ── Launch tutorial after settle ─────────────────────────────────────
      setTimeout(() => {
        try {
          const _tutLevelId = window.currentLevelId || 1;
          const _tutStageId = window.currentStageId || 1;
          initTutorial(() => ({ x: Player.pos.x, z: Player.pos.z, yaw: Player.yaw }), _tutStageId, _tutLevelId);
        } catch (e) { console.error("Tutorial init error:", e); }
      }, 1200);

    }, 3200);
  });
}



// ── INPUT ─────────────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.code === 'KeyE') doInteract();
  if (e.code === 'KeyT') { _toggleTaskPanel(); }
  if (e.code === 'KeyM') {
    const mm = document.getElementById('minimapWrapper');
    if (mm) mm.style.display = mm.style.display === 'none' ? 'block' : 'none';
  }
});

// Debounce guard — prevents click+touchstart double-fire (300ms window)
let _interactFireT = 0;
function _fireInteract() {
  const now = Date.now();
  if (now - _interactFireT < 300) return;
  _interactFireT = now;
  // Force an immediate raycast so focusedObj is fresh at press time
  if (_cachedTargets) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(_cachedTargets, true);
    let foundViaRay = false;
    if (hits.length && hits[0].distance < 4.2) {
      let cur = hits[0].object;
      while (cur && !cur.userData?.type) cur = cur.parent;
      if (cur?.userData?.type) { focusedObj = cur; foundViaRay = true; }
    }
    // Proximity fallback — if center-aim misses, grab nearest within 2.2m
    if (!foundViaRay) {
      const PROX = 2.2;
      let nearDist = PROX, nearObj = null;
      const cp = camera.position;
      for (const obj of _cachedTargets) {
        obj.getWorldPosition(_objWP);
        const d = cp.distanceTo(_objWP);
        if (d < nearDist) { nearDist = d; nearObj = obj; }
      }
      if (nearObj) {
        let cur = nearObj;
        while (cur && !cur.userData?.type) cur = cur.parent;
        focusedObj = cur?.userData?.type ? cur : null;
      } else { focusedObj = null; }
    }
  }
  doInteract();
}

const interactBtn = document.getElementById('btnInteract');

// Ripple helper for tactile feedback on button press
function _spawnRipple(btn) {
  const r = document.createElement('span');
  r.style.cssText = `
    position:absolute; border-radius:50%;
    width:80px; height:80px; margin:-40px 0 0 -40px;
    background:rgba(255,215,0,0.28);
    top:50%; left:50%;
    transform:scale(0); opacity:1;
    animation:useRipple 0.55s ease-out forwards;
    pointer-events:none; z-index:10;
  `;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

if (interactBtn) {
  interactBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    e.stopPropagation();
    _spawnRipple(interactBtn);
    _fireInteract();
  }, { passive: false });
  interactBtn.addEventListener('click', e => {
    e.preventDefault();
    _spawnRipple(interactBtn);
    _fireInteract();
  });
}

// Tap-anywhere interaction — brief touch (<200ms, <15px drift) on the look zone triggers USE
// Also dynamically disable lookZone pointer-events when not freely standing (so overlays work)
{
  const lz = document.getElementById('lookZone');
  if (lz) {
    // Poll Player.state and reflect as CSS — runs alongside game loop
    let _lzLastState = '';
    setInterval(() => {
      const st = Player.state;
      if (st === _lzLastState) return;
      _lzLastState = st;
      lz.style.pointerEvents = (st === 'standing') ? 'all' : 'none';
    }, 80);

    let _tapT = 0, _tapX = 0, _tapY = 0, _tapId = -1;
    lz.addEventListener('touchstart', e => {
      // Only when player can actually interact
      if (Player.state !== 'standing') return;
      if (e.changedTouches.length !== 1 || _tapId !== -1) return;
      const t = e.changedTouches[0];
      _tapT = Date.now(); _tapX = t.clientX; _tapY = t.clientY; _tapId = t.identifier;
    }, { passive: true });
    lz.addEventListener('touchend', e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== _tapId) continue;
        _tapId = -1;
        if (Player.state !== 'standing') break;
        if (Date.now() - _tapT < 200 && Math.hypot(t.clientX - _tapX, t.clientY - _tapY) < 15) {
          doInteract();
        }
      }
    }, { passive: true });
    lz.addEventListener('touchcancel', () => { _tapId = -1; }, { passive: true });
  }
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

// ── LEVEL MANAGER — unified for all stages/levels ───────────────────────────
// Stage 1: one outlet per level (levelId = outletId)
// Stage 2: switch wiring done entirely in scenario2.html — not used here
const LevelManager = {
  active: false,
  starsEarned: 0,
  targetOutletId: 1,

  init() {
    // Restore level persisted across reload (window vars lost on location.reload())
    const ps = localStorage.getItem('et_pending_stage');
    const pl = localStorage.getItem('et_pending_level');
    if (ps && pl) {
      window.currentStageId  = parseInt(ps);
      window.currentLevelId  = parseInt(pl);
      window.currentOutletId = parseInt(pl);
      localStorage.removeItem('et_pending_stage');
      localStorage.removeItem('et_pending_level');
    }

    const stageId  = window.currentStageId  || 1;
    const levelId  = window.currentLevelId  || 1;
    const outletId = window.currentOutletId || levelId;
    this.active        = (stageId === 1);
    this.starsEarned   = 0;
    this.targetOutletId = outletId;

    const hud   = document.getElementById('starHUD');
    const label = document.getElementById('sh-label');
    if (hud)   { hud.style.display = 'flex'; }
    if (label) { label.textContent = `S${stageId}-L${levelId}`; }
    // Reset star glows
    for (let i = 1; i <= 3; i++) {
      const s = document.getElementById(`sh-s${i}`);
      if (s) s.classList.remove('lit', 'pop');
    }
  },

  onOutletFixed(socketId) {
    if (!this.active || socketId !== this.targetOutletId) return;
    this.starsEarned = 3; // perfect — one task, done right
    this._lightHUD(3);
    setTimeout(() => this._showComplete(), 2000);
  },

  _lightHUD(count) {
    for (let i = 1; i <= count; i++) {
      const star = document.getElementById(`sh-s${i}`);
      if (!star) continue;
      setTimeout(() => {
        star.classList.add('lit');
        star.classList.remove('pop');
        void star.offsetWidth;
        star.classList.add('pop');
      }, i * 180);
    }
  },

  _showComplete() {
    const stageId = window.currentStageId || 1;
    const levelId = window.currentLevelId || 1;

    // Save progress
    if (window.DB) DB.saveProgress(stageId, levelId, { completed: true, stars: 3 });
    if (Audio.ctx) Audio.success?.();

    // Populate modal
    const LEVEL_SUBS  = {
      '1-1': 'Entrance outlet repaired & tested.',
      '1-2': 'Workshop 1 outlet repaired & tested.',
      '1-3': 'Workshop 2 outlet repaired & tested — Stage complete!',
    };
    const key = `${stageId}-${levelId}`;
    document.getElementById('lcm-badge').textContent  = '🏆';
    document.getElementById('lcm-title').textContent  = `Stage ${stageId} · Level ${levelId} Complete!`;
    document.getElementById('lcm-sub').textContent    = LEVEL_SUBS[key] || 'Task complete.';

    // Stars
    ['lcm-s1','lcm-s2','lcm-s3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('lit','drop');
    });
    for (let i = 1; i <= 3; i++) {
      const star = document.getElementById(`lcm-s${i}`);
      if (star) setTimeout(() => star.classList.add('lit','drop'), i * 220);
    }

    // Prev / Next / Exit navigation
    const LEVEL_NAMES = {
      '1-1': 'Entrance Outlet',
      '1-2': 'Workshop 1 Outlet',
      '1-3': 'Workshop 2 Outlet',
    };
    const nextLevelId = levelId + 1;
    const prevLevelId = levelId - 1;
    const nextExists  = nextLevelId <= 3;
    const prevExists  = prevLevelId >= 1;

    const nextMsg  = document.getElementById('lcm-next-msg');
    const nextBtn  = document.getElementById('lcmNextBtn');
    const prevBtn  = document.getElementById('lcmPrevBtn');
    const exitBtn  = document.getElementById('lcmExitBtn');

    // Next level message
    if (nextExists) {
      const nextName = LEVEL_NAMES[`${stageId}-${nextLevelId}`] || `Level ${nextLevelId}`;
      if (nextMsg) { nextMsg.style.display = 'block'; nextMsg.innerHTML = `<strong>Next:</strong> ${nextName}`; }
      if (nextBtn) nextBtn.style.display = 'block';
    } else {
      if (nextMsg) { nextMsg.style.display = 'block'; nextMsg.innerHTML = `<strong>Stage ${stageId} Complete!</strong> All levels done.`; }
      if (nextBtn) nextBtn.style.display = 'none';
    }

    if (prevBtn) prevBtn.style.display = prevExists ? 'block' : 'none';
    if (exitBtn) exitBtn.style.display = 'block';

    // Bind buttons (clone to clear stale listeners)
    if (nextBtn && nextExists) {
      const newNext = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNext, nextBtn);
      newNext.addEventListener('click', () => {
        localStorage.setItem('et_pending_stage', stageId);
        localStorage.setItem('et_pending_level', nextLevelId);
        window.location.reload();
      });
    }
    if (prevBtn && prevExists) {
      const newPrev = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrev, prevBtn);
      newPrev.addEventListener('click', () => {
        localStorage.setItem('et_pending_stage', stageId);
        localStorage.setItem('et_pending_level', prevLevelId);
        window.location.reload();
      });
    }
    if (exitBtn) {
      const newExit = exitBtn.cloneNode(true);
      exitBtn.parentNode.replaceChild(newExit, exitBtn);
      newExit.addEventListener('click', () => {
        localStorage.removeItem('et_pending_stage');
        localStorage.removeItem('et_pending_level');
        window.location.reload();
      });
    }

    const modal = document.getElementById('levelCompleteModal');
    if (modal) modal.classList.add('show');
  },
};

// Legacy stub — Level2Manager no longer used (Stage 2 runs in scenario2.html)
const Level2Manager = { init: () => {}, onSwitchFixed: () => {} };

// ── OUTLET REPAIR SCENARIO ────────────────────────────────────────────────────
// Called once after DOM is ready (inside startBtn handler)
function _initOutlets() {
  LevelManager.init();
  const exploreMode = !!window.exploreMode;
  const exploreType = window.exploreType || '';

  if (exploreMode && exploreType === 'outlet-all') {
    // Show ALL 3 outlets — restore any previously completed ones
    const done = window.DB?.getExploreOutlets?.() || {};
    outletSockets.forEach(s => {
      if (done[s.id]?.completed) markOutletFixed(s.id);
    });
    notify('EXPLORE — Find and repair all 3 faulty outlets!', 5000);
  } else {
    // Non-explore (workshop / legacy): hide all outlets not matching target
    const targetId = window.currentOutletId || 1;
    outletSockets.forEach(s => {
      if (s.id !== targetId) {
        s.group.visible = false;
        if (s.footprintGroup) s.footprintGroup.visible = false;
        const idx = allInteractables.indexOf(s.proxy);
        if (idx !== -1) allInteractables.splice(idx, 1);
        s.proxy.visible = false;
      }
    });
  }

  initOutletScenario((socketId) => {
    markOutletFixed(socketId);
    feedbackLog(`✓ Outlet #${socketId} repaired`, 'ok');

    if (exploreMode && exploreType === 'outlet-all' && window.DB?.saveExploreOutlet) {
      window.DB.saveExploreOutlet(socketId);
      const stars = window.DB.getOutletStars?.() || 0;
      notify(`★ Outlet fixed! (${stars}/3 outlet stars)`, 3000);
      if (stars >= 3) {
        setTimeout(() => {
          notify('ALL 3 OUTLETS REPAIRED! Return to menu for Switch Installation.', 5500);
        }, 3200);
      }
      _checkExploreComplete();
    }

    setTimeout(() => { closeOutlet(); }, 2200);
  });
}

// Check if all 6 explore scenarios done — show completion banner
function _checkExploreComplete() {
  if (!window.DB?.isExploreComplete?.()) return;
  setTimeout(() => {
    notify('ALL 6 SCENARIOS COMPLETE! Return to menu to take the Assessment.', 6000);
  }, 3000);
}

// ── SWITCH INSTALL SCENARIO ───────────────────────────────────────────────────
function _initSwitches() {
  Level2Manager.init();
  initSwitches();   // place all 3 switch stations in the world

  const exploreMode = !!window.exploreMode;
  const exploreType = window.exploreType || '';

  if (exploreMode && exploreType === 'switch-all') {
    // Show all 3 switch stations — restore prior progress
    const done = window.DB?.getExploreSwitches?.() || {};
    switchStations.forEach(st => {
      if (done[st.id]?.completed) markSwitchFixed(st.id);
    });
    notify('EXPLORE — Approach each switch station to wire it!', 5000);
    initSwitchScenario((stationId) => {
      markSwitchFixed(stationId);
      feedbackLog(`✓ Switch #${stationId} wired`, 'ok');
      if (window.DB?.saveExploreSwitch) {
        window.DB.saveExploreSwitch(stationId);
        const stars = window.DB.getSwitchStars?.() || 0;
        notify(`★ Switch wired! (${stars}/3 switch stars)`, 3000);
        if (stars >= 3) {
          setTimeout(() => notify('ALL 3 SWITCHES WIRED! Return to menu for Assessment.', 5500), 3200);
        }
        _checkExploreComplete();
      }
      setTimeout(() => { closeSwitch(); }, 2200);
    });

  } else if (exploreMode && exploreType === 'outlet-all') {
    // Outlet explore: hide switch stations entirely
    switchStations.forEach(st => {
      st.group.visible = false;
      if (st.fpGroup) st.fpGroup.visible = false;
    });
    switchProxies.forEach(p => { p.visible = false; });

  } else {
    // Workshop / non-explore mode
    initSwitchScenario((stationId) => {
      markSwitchFixed(stationId);
      feedbackLog(`✓ Switch Station #${stationId} installed`, 'ok');
      Level2Manager.onSwitchFixed(stationId);
      setTimeout(() => { closeSwitch(); }, 2200);
    });
  }
}

// Expose globals for switch overlay buttons (set in switch-scenario.js via window.closeSwitch etc.)

// Expose closeOutlet globally so the HTML button onclick works
window.closeOutlet = () => { closeOutlet(); }; // closeOutlet() itself restores Player.state
// Expose play-again (resets scenario without closing overlay)
window._orPlayAgain = () => { openOutlet(window._orCurrentSocket || 1); };
// Expose tool select so or-toolbar onclick works
window._orSelectTool = (t) => {
  // delegate into the module's internal select — module wires this via the toolbar clicks
  // since toolbar is in HTML we re-dispatch via a custom event the module can listen to
  document.dispatchEvent(new CustomEvent('or-tool-select', { detail: t }));
};

// ── COMPUTER UI OVERLAY MANAGER ─────────────────────────────────────────────
const compUI = document.getElementById('computerUI');
const compTabs = document.querySelectorAll('.comp-tab');
const compPanels = document.querySelectorAll('.comp-panel');
const btnExitComp = document.getElementById('btnExitComp');
const cctvGridBtns = document.querySelectorAll('.cctv-btn');
const cctvOverlay = document.getElementById('cctvOverlay');
const btnExitCCTV = document.getElementById('btnExitCCTV');
const cctvName = document.getElementById('cctvName');

window.openComputerUI = function() {
  if (compUI) compUI.style.display = 'flex';
  document.exitPointerLock?.();
};

if (btnExitComp) {
  btnExitComp.addEventListener('click', () => {
    compUI.style.display = 'none';
    Player.state = 'standing';
    Player.pos.z += 0.8; // Step backward into free space reliably
  });
}

compTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    compTabs.forEach(t => t.classList.remove('active'));
    compPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// CCTV Logic
const cctvLocations = {
  'generator': { x: 15,  y: 3.5, z: 2,   rotY: -Math.PI / 4,       rotX: -0.5 },
  'workshop':  { x: 19,  y: 3.5, z: -16,  rotY: 3 * Math.PI / 4,    rotX: -0.5 },
  'control':   { x: 30,  y: 3.5, z: -4,   rotY: Math.PI / 2,        rotX: -0.4 },
  'lab':       { x: 30,  y: 3.5, z: 22,   rotY: Math.PI,            rotX: -0.4 },
  'entrance':  { x: -1,  y: 3.5, z: -27,  rotY: 0,                  rotX: -0.4 }
};

// CCTV look state
let cctvYaw = 0, cctvPitch = -0.4;
let cctvMouseDown = false, cctvLastX = 0, cctvLastY = 0;
let cctvTimeInterval = null;

// Mouse drag for CCTV rotation
cctvOverlay.addEventListener('mousedown', e => {
  if (Player.state !== 'cctv') return;
  cctvMouseDown = true;
  cctvLastX = e.clientX;
  cctvLastY = e.clientY;
});
window.addEventListener('mousemove', e => {
  if (!cctvMouseDown || Player.state !== 'cctv') return;
  const dx = e.clientX - cctvLastX;
  const dy = e.clientY - cctvLastY;
  cctvLastX = e.clientX;
  cctvLastY = e.clientY;
  cctvYaw   -= dx * 0.003;
  cctvPitch -= dy * 0.003;
  cctvPitch = Math.max(-1.0, Math.min(0.1, cctvPitch));
  camera.rotation.set(cctvPitch, cctvYaw, 0, 'YXZ');
});
window.addEventListener('mouseup', () => { cctvMouseDown = false; });

// Touch drag for CCTV rotation
let cctvTouchId = null, cctvTouchX = 0, cctvTouchY = 0;
cctvOverlay.addEventListener('touchstart', e => {
  // Don't capture touches that land on interactive UI elements (exit button etc.)
  if (e.target.closest('button, a, [role="button"]')) return;
  e.preventDefault();
  if (Player.state !== 'cctv' || e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  cctvTouchId = t.identifier;
  cctvTouchX = t.clientX;
  cctvTouchY = t.clientY;
}, { passive: false });
cctvOverlay.addEventListener('touchmove', e => {
  e.preventDefault();
  if (Player.state !== 'cctv') return;
  for (const t of e.changedTouches) {
    if (t.identifier === cctvTouchId) {
      const dx = t.clientX - cctvTouchX;
      const dy = t.clientY - cctvTouchY;
      cctvTouchX = t.clientX;
      cctvTouchY = t.clientY;
      cctvYaw   -= dx * 0.004;
      cctvPitch -= dy * 0.004;
      cctvPitch = Math.max(-1.0, Math.min(0.1, cctvPitch));
      camera.rotation.set(cctvPitch, cctvYaw, 0, 'YXZ');
    }
  }
}, { passive: false });
cctvOverlay.addEventListener('touchend', () => { cctvTouchId = null; }, { passive: false });

cctvGridBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const locId = btn.dataset.cam;
    const loc = cctvLocations[locId];
    if (!loc) return;

    compUI.style.display = 'none';
    cctvOverlay.style.display = 'block';
    if (cctvName) cctvName.textContent = btn.textContent;

    // Set CCTV camera
    Player.state = 'cctv';
    cctvYaw   = loc.rotY;
    cctvPitch = loc.rotX;
    camera.position.set(loc.x, loc.y, loc.z);
    camera.rotation.set(loc.rotX, loc.rotY, 0, 'YXZ');

    // Time ticker (clear previous interval)
    if (cctvTimeInterval) clearInterval(cctvTimeInterval);
    const tickEl = document.getElementById('cctvTime');
    const tick = () => {
      if (tickEl) tickEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    };
    tick();
    cctvTimeInterval = setInterval(tick, 1000);
  });
});

if (btnExitCCTV) {
  function _exitCCTV() {
    cctvOverlay.style.display = 'none';
    if (cctvTimeInterval) { clearInterval(cctvTimeInterval); cctvTimeInterval = null; }
    Player.state = 'computer';
    if (Player.lastComputerPos) {
      Player.targetCamPos.copy(Player.lastComputerPos);
      Player.targetCamRot.copy(Player.lastComputerRot);
    } else {
      Player.targetCamPos.set(2.5, 1.10, -22.83);
      Player.targetCamRot.set(-0.05, 0, 0, 'YXZ');
    }
    camera.position.copy(Player.targetCamPos);
    window.openComputerUI();
  }
  btnExitCCTV.addEventListener('click', _exitCCTV);
  // Touch: stop propagation so cctvOverlay doesn't capture it, then fire exit
  btnExitCCTV.addEventListener('touchend', e => {
    e.preventDefault();
    e.stopPropagation();
    _exitCCTV();
  }, { passive: false });
}

// ── NEW BUTTON SYSTEM ────────────────────────────────────────────────────────

// ── Sensitivity Settings ────────────────────────────────────────────────────
// Slider range: 1–20. Formula: sens = value / 10  →  0.1× – 2.0×
// Default 10 = 1.0× (neutral). Saved/loaded from localStorage as raw slider int.

const _sliderToSens = v => parseInt(v) / 10;
const _sensLabel    = v => (_sliderToSens(v).toFixed(1)) + '\xd7'; // "1.0×"

const _camDefault = localStorage.getItem('camSens') || '10';
const _joyDefault = localStorage.getItem('joySens') || '10';
window.camSensitivity = _sliderToSens(_camDefault);  // 0.1–2.0
window.joySensitivity = _sliderToSens(_joyDefault);  // 0.1–2.0

function _initPauseSensSliders() {
  const camSlider = document.getElementById('pauseCamSens');
  const joySlider = document.getElementById('pauseJoySens');
  const camVal    = document.getElementById('pauseCamSensVal');
  const joyVal    = document.getElementById('pauseJoySensVal');

  if (camSlider) camSlider.value = _camDefault;
  if (camVal)    camVal.textContent = _sensLabel(_camDefault);
  if (joySlider) joySlider.value = _joyDefault;
  if (joyVal)    joyVal.textContent = _sensLabel(_joyDefault);

  if (camSlider) {
    camSlider.addEventListener('input', () => {
      window.camSensitivity = _sliderToSens(camSlider.value);
      if (camVal) camVal.textContent = _sensLabel(camSlider.value);
      localStorage.setItem('camSens', camSlider.value);
    });
  }
  if (joySlider) {
    joySlider.addEventListener('input', () => {
      window.joySensitivity = _sliderToSens(joySlider.value);
      if (joyVal) joyVal.textContent = _sensLabel(joySlider.value);
      localStorage.setItem('joySens', joySlider.value);
    });
  }
}
setTimeout(_initPauseSensSliders, 0);

// ── In-Game Hamburger Menu ────────────────────────────────────────────────
let gamePaused = false;

const _igMenu     = document.getElementById('inGameMenu');
const _igBackdrop = document.getElementById('igmBackdrop');

function setInGameMenu(open) {
  gamePaused = open;
  if (_igMenu)     _igMenu.classList.toggle('open', open);
  if (_igBackdrop) _igBackdrop.classList.toggle('open', open);
  const hbg = document.getElementById('btnPauseTop');
  if (hbg) hbg.classList.toggle('menu-open', open);
  if (Audio.ctx) open ? Audio.uiSelect() : Audio.uiBack();
  // Update room label inside menu
  if (open) {
    const rl = document.getElementById('igmRoomLabel');
    const rn = document.getElementById('roomname');
    if (rl && rn) rl.textContent = rn.textContent;
  }
}

// Backward-compat alias used elsewhere
function setPaused(v) { setInGameMenu(v); }

const btnPauseTop = document.getElementById('btnPauseTop');
if (btnPauseTop) btnPauseTop.addEventListener('click', () => setInGameMenu(!gamePaused));

if (_igBackdrop) _igBackdrop.addEventListener('click', () => setInGameMenu(false));

const igmClose = document.getElementById('igmClose');
if (igmClose) igmClose.addEventListener('click', () => setInGameMenu(false));

const btnResume = document.getElementById('btnResume');
if (btnResume) btnResume.addEventListener('click', () => setInGameMenu(false));

function _doRestartLevel() {
  setInGameMenu(false);
  // Reset outlets
  try {
    outletSockets.forEach(s => {
      if (s.fixed) {
        s.fixed = false;
        // Restore broken visual if possible
        if (s.group) {
          s.group.traverse(ch => {
            if (ch.isMesh && ch.userData?.isSocket) ch.material = M.eRed || ch.material;
          });
        }
      }
    });
    TASKS.daily.forEach(t => {
      if (t.id === 'outlet_repair') { t.completed = false; t._fixedCount = 0; }
    });
  } catch(e) {}
  // Reset switch stations
  try {
    switchStations.forEach(s => { if (s.fixed) { s.fixed = false; } });
    TASKS.daily.forEach(t => {
      if (t.id === 'switch_repair') { t.completed = false; }
    });
  } catch(e) {}
  // Reset all daily tasks progress
  TASKS.daily.forEach(t => { t.completed = false; });
  activeTask = null;
  updateTaskDisplay();
  // Clear tutorial flag so it can replay if desired
  notify('Level restarted — all progress reset.', 3000);
}

const btnRestartLevel = document.getElementById('btnRestartLevel');
if (btnRestartLevel) btnRestartLevel.addEventListener('click', () => {
  // Show inline confirmation inside the in-game menu
  const confirmEl = document.getElementById('igmConfirm');
  if (confirmEl) { confirmEl.style.display = 'flex'; return; }
  _doRestartLevel();
});

// Confirm/cancel buttons inside igmConfirm
const btnConfirmRestart = document.getElementById('btnConfirmRestart');
const btnCancelRestart  = document.getElementById('btnCancelRestart');
if (btnConfirmRestart) btnConfirmRestart.addEventListener('click', () => {
  const confirmEl = document.getElementById('igmConfirm');
  if (confirmEl) confirmEl.style.display = 'none';
  _doRestartLevel();
});
if (btnCancelRestart) btnCancelRestart.addEventListener('click', () => {
  const confirmEl = document.getElementById('igmConfirm');
  if (confirmEl) confirmEl.style.display = 'none';
});

const btnMainMenu = document.getElementById('btnMainMenu');
if (btnMainMenu) btnMainMenu.addEventListener('click', () => {
  setInGameMenu(false);
  // Show menu overlay directly — no page reload, no intro screen
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.display = '';
    overlay.style.opacity = '1';
  }
  if (window._returnToMainMenu) window._returnToMainMenu();
  // Stop game audio
  try { if (Audio.ctx) Audio.hum(false); } catch (e) {}
});

// Keyboard shortcut: Escape / P
window.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    if (Player.state === 'wall-panel') { _exitWallPanel(); return; }
    setInGameMenu(!gamePaused);
  }
  if (e.code === 'KeyP') setInGameMenu(!gamePaused);
});

// ── Tasks Panel ────────────────────────────────────────────────────────────
function _toggleTaskPanel() {
  const panel = document.getElementById('taskPanel');
  if (!panel) return;
  const isOpen = panel.classList.contains('task-open');
  panel.classList.toggle('task-open', !isOpen);
  if (Audio.ctx) (!isOpen ? Audio.uiSelect() : Audio.uiBack());
  if (!isOpen) { updateTaskDisplay(); tutorialOnTaskOpen(); }
}

// Make the entire starHUD clickable to open the tasks panel
const starHUD = document.getElementById('starHUD');
if (starHUD) {
  starHUD.style.cursor = 'pointer';
  starHUD.addEventListener('click', _toggleTaskPanel);
}

// ── Minimap click to enlarge ──────────────────────────────────────────────────
(function() {
  const minimap = document.getElementById('minimap');
  if (!minimap) return;
  let big = false;
  minimap.style.cursor = 'pointer';
  minimap.title = 'Tap to enlarge / shrink map';
  minimap.addEventListener('click', () => {
    big = !big;
    if (big) {
      minimap.style.width  = '260px';
      minimap.style.height = '260px';
      minimap.style.zIndex = '200';
      minimap.style.boxShadow = '0 0 30px rgba(34,221,255,0.25), 0 6px 40px rgba(0,0,0,0.8)';
      minimap.style.borderColor = 'rgba(34,221,255,0.65)';
      minimap.style.transition = 'all 0.3s cubic-bezier(0.22,1,0.36,1)';
    } else {
      minimap.style.width  = '140px';
      minimap.style.height = '140px';
      minimap.style.zIndex = '15';
      minimap.style.boxShadow = '';
      minimap.style.borderColor = '';
    }
  });
})();

// Close task modal via its close button
function _closeTaskPanel() {
  document.getElementById('taskPanel')?.classList.remove('task-open');
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCloseTask = document.getElementById('btnCloseTask');
  if (btnCloseTask) btnCloseTask.addEventListener('click', _closeTaskPanel);
});

setTimeout(() => {
  const btnCloseTask = document.getElementById('btnCloseTask');
  if (btnCloseTask && !btnCloseTask._bound) {
    btnCloseTask._bound = true;
    btnCloseTask.addEventListener('click', _closeTaskPanel);
  }
}, 0);



const btnCloseTools = document.getElementById('btnCloseTools');
if (btnCloseTools) {
  btnCloseTools.addEventListener('click', () => {
    if (toolBelt) toolBelt.classList.remove('open');
    if (btnRTools) btnRTools.classList.remove('pressed');
  });
}

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('locked')) {
      notify('Tool locked — pick it up from the tool rack in the workshop.', 2500);
      return;
    }
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Map belt data-tool to engine tool IDs
    const beltToEngine = {
      'wire':     'wire_stripper',
      'flat':     'screwdriver',
      'phillips': 'screwdriver',
      'vtester':  'voltage_tester',
      'meter':    'multimeter',
      'stripper': 'wire_stripper',
    };
    activeTool = beltToEngine[btn.dataset.tool] || btn.dataset.tool;
    updateToolHUD();
    feedbackLog(`Tool selected: ${getToolLabel()}`, 'info');
    notify(`Tool selected: ${getToolLabel()}`, 1200);
    if (toolBelt) toolBelt.classList.remove('open');
    if (btnRTools) btnRTools.classList.remove('pressed');
  });
});



// ── WiringGame — canvas-based drag-and-drop wire connection mini-game ─────────
class WiringGame {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.conns = {};   // wireId → terminalId
    this.drag = null;  // { id, color, sx, sy, cx, cy }
    this.completed = false;
    this._wires = [
      { id: 'L',  name: 'BROWN',    hex: '#9a4a18', bright: '#c06020' },
      { id: 'N',  name: 'BLUE',     hex: '#1a50cc', bright: '#4488ff' },
      { id: 'PE', name: 'GRN/YLW', hex: '#4a9900', bright: '#77cc00' },
    ];
    this._terminals = this._shuffle([
      { id: 'L',  label: 'L',  desc: 'LINE' },
      { id: 'N',  label: 'N',  desc: 'NEUTRAL' },
      { id: 'PE', label: 'PE', desc: 'EARTH' },
    ]);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp   = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove  = this._onTouchMove.bind(this);
    this._onTouchEnd   = this._onTouchEnd.bind(this);
    this._attachEvents();
    this._resize();
    this._draw();
  }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _resize() {
    const vp = this.c.parentElement;
    if (!vp) return;
    this.c.width  = vp.clientWidth  || 600;
    this.c.height = vp.clientHeight || 380;
    this._layout();
  }

  _layout() {
    const W = this.c.width, H = this.c.height;
    const lx = Math.round(W * 0.22);
    const rx = Math.round(W * 0.78);
    const sy = Math.round(H * 0.26);
    const gap = Math.round(H * 0.25);
    this._wires.forEach((w, i)     => { w.px = lx; w.py = sy + i * gap; });
    this._terminals.forEach((t, i) => { t.px = rx; t.py = sy + i * gap; });
  }

  _attachEvents() {
    this.c.addEventListener('mousedown',  this._onMouseDown);
    this.c.addEventListener('mousemove',  this._onMouseMove);
    this.c.addEventListener('mouseup',    this._onMouseUp);
    this.c.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.c.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    this.c.addEventListener('touchend',   this._onTouchEnd,   { passive: false });
  }

  destroy() {
    this.c.removeEventListener('mousedown',  this._onMouseDown);
    this.c.removeEventListener('mousemove',  this._onMouseMove);
    this.c.removeEventListener('mouseup',    this._onMouseUp);
    this.c.removeEventListener('touchstart', this._onTouchStart);
    this.c.removeEventListener('touchmove',  this._onTouchMove);
    this.c.removeEventListener('touchend',   this._onTouchEnd);
  }

  _pt(e) {
    const r = this.c.getBoundingClientRect();
    const sx = this.c.width  / r.width;
    const sy = this.c.height / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  _ptTouch(e) {
    const r = this.c.getBoundingClientRect();
    const sx = this.c.width  / r.width;
    const sy = this.c.height / r.height;
    const t = e.changedTouches[0];
    return { x: (t.clientX - r.left) * sx, y: (t.clientY - r.top) * sy };
  }

  _onMouseDown(e)  { this._startDrag(this._pt(e)); }
  _onMouseMove(e)  { this._moveDrag(this._pt(e)); }
  _onMouseUp(e)    { this._endDrag(this._pt(e)); }
  _onTouchStart(e) { e.preventDefault(); this._startDrag(this._ptTouch(e)); }
  _onTouchMove(e)  { e.preventDefault(); this._moveDrag(this._ptTouch(e)); }
  _onTouchEnd(e)   { e.preventDefault(); this._endDrag(this._ptTouch(e)); }

  _startDrag({ x, y }) {
    for (const w of this._wires) {
      if (Math.hypot(x - w.px, y - w.py) < 30) {
        delete this.conns[w.id];
        this.drag = { id: w.id, hex: w.hex, sx: w.px, sy: w.py, cx: x, cy: y };
        this._draw();
        return;
      }
    }
  }

  _moveDrag({ x, y }) {
    if (!this.drag) return;
    this.drag.cx = x;
    this.drag.cy = y;
    this._draw();
  }

  _endDrag({ x, y }) {
    if (!this.drag) return;
    for (const t of this._terminals) {
      if (Math.hypot(x - t.px, y - t.py) < 34) {
        this.conns[this.drag.id] = t.id;
        break;
      }
    }
    this.drag = null;
    this._draw();
  }

  _drawBezier(x1, y1, x2, y2, color, alpha, width = 5) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const mx = (x1 + x2) / 2;
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  _draw() {
    const ctx = this.ctx;
    const W = this.c.width, H = this.c.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#030c14';
    ctx.fillRect(0, 0, W, H);

    // Column headers
    ctx.font = `bold ${Math.max(12, Math.round(W * 0.024))}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2a5a3a';
    ctx.fillText('WIRE SOURCES', this._wires[0]?.px || W * 0.22, H * 0.12);
    ctx.fillStyle = '#2a3a5a';
    ctx.fillText('TERMINAL BLOCK', this._terminals[0]?.px || W * 0.78, H * 0.12);

    // Center dashed divider
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(68,255,136,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, H * 0.08);
    ctx.lineTo(W / 2, H * 0.92);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw existing connections
    for (const [wId, tId] of Object.entries(this.conns)) {
      const w = this._wires.find(v => v.id === wId);
      const t = this._terminals.find(v => v.id === tId);
      if (!w || !t) continue;
      this._drawBezier(w.px, w.py, t.px, t.py, w.hex, 0.9);
    }

    // Draw dragging wire
    if (this.drag) {
      this._drawBezier(this.drag.sx, this.drag.sy, this.drag.cx, this.drag.cy, this.drag.hex, 0.75);
    }

    const R = Math.max(14, Math.round(W * 0.024));
    const fontSize = Math.max(12, Math.round(W * 0.024));

    // Draw wire sources (left side)
    for (const w of this._wires) {
      const connected = w.id in this.conns;
      // Short wire tail extending left
      ctx.beginPath();
      ctx.strokeStyle = w.hex;
      ctx.lineWidth = Math.max(4, Math.round(W * 0.008));
      ctx.lineCap = 'round';
      ctx.moveTo(w.px - R * 3, w.py);
      ctx.lineTo(w.px - R, w.py);
      ctx.stroke();

      // End circle (drag handle)
      ctx.beginPath();
      ctx.arc(w.px, w.py, R, 0, Math.PI * 2);
      ctx.fillStyle = connected ? w.hex : '#0f1f14';
      ctx.fill();
      ctx.strokeStyle = w.hex;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Wire ID in circle
      ctx.font = `bold ${fontSize}px Courier New`;
      ctx.fillStyle = connected ? '#fff' : w.bright;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(w.id, w.px, w.py);
      ctx.textBaseline = 'alphabetic';

      // Color label to left
      ctx.font = `${fontSize}px Courier New`;
      ctx.fillStyle = w.bright;
      ctx.textAlign = 'right';
      ctx.fillText(w.name, w.px - R * 3.8, w.py + 4);
    }

    // Draw terminals (right side)
    for (const t of this._terminals) {
      const connEntry = Object.entries(this.conns).find(([, tId]) => tId === t.id);
      const isCorrect = connEntry && connEntry[0] === t.id;
      const isWrong   = connEntry && connEntry[0] !== t.id;

      // Terminal block body
      const bw = R * 2.4, bh = R * 2.8;
      ctx.fillStyle = '#0e1d28';
      ctx.strokeStyle = isCorrect ? '#44ff88' : isWrong ? '#ff4433' : '#2a4a5a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(t.px - bw / 2, t.py - bh / 2, bw, bh, 4);
      ctx.fill();
      ctx.stroke();

      // Terminal label
      ctx.font = `bold ${Math.round(fontSize * 1.15)}px Courier New`;
      ctx.fillStyle = isCorrect ? '#44ff88' : isWrong ? '#ff5544' : '#aaccdd';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label, t.px, t.py - 4);
      ctx.textBaseline = 'alphabetic';

      ctx.font = `${Math.round(fontSize * 0.8)}px Courier New`;
      ctx.fillStyle = isCorrect ? '#33aa66' : '#3a6a7a';
      ctx.textAlign = 'center';
      ctx.fillText(t.desc, t.px, t.py + R * 0.9);

      // Wire tail extending right
      ctx.beginPath();
      ctx.strokeStyle = isCorrect ? '#44ff88' : '#2a4a5a';
      ctx.lineWidth = Math.max(3, Math.round(W * 0.006));
      ctx.moveTo(t.px + bw / 2, t.py);
      ctx.lineTo(t.px + R * 3, t.py);
      ctx.stroke();

      // Correct/wrong indicator dot
      if (connEntry) {
        ctx.beginPath();
        ctx.arc(t.px + bw / 2 - 5, t.py - bh / 2 + 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = isCorrect ? '#44ff88' : '#ff4433';
        ctx.fill();
      }
    }

    // Bottom instruction hint
    ctx.font = `${Math.max(11, Math.round(W * 0.018))}px Courier New`;
    ctx.fillStyle = 'rgba(68,255,136,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText('DRAG WIRE  →  TERMINAL  |  CHECK TO VERIFY', W / 2, H - 14);

    // Completion banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,20,10,0.82)';
      ctx.fillRect(0, H / 2 - 38, W, 76);
      ctx.font = `bold ${Math.max(22, Math.round(W * 0.05))}px Courier New`;
      ctx.fillStyle = '#44ff88';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CIRCUIT COMPLETE', W / 2, H / 2 - 10);
      ctx.font = `${Math.max(13, Math.round(W * 0.025))}px Courier New`;
      ctx.fillStyle = '#33aa66';
      ctx.fillText('All wires correctly terminated', W / 2, H / 2 + 18);
      ctx.restore();
    }
  }

  check() {
    for (const w of this._wires) {
      if (!this.conns[w.id]) return { ok: false, msg: `${w.name} wire not connected` };
      if (this.conns[w.id] !== w.id) {
        const t = this._terminals.find(t => t.id === this.conns[w.id]);
        return { ok: false, msg: `${w.name} → ${t?.label || '?'} is wrong` };
      }
    }
    this.completed = true;
    this._draw();
    return { ok: true };
  }

  reset() {
    this.conns = {};
    this.drag = null;
    this.completed = false;
    this._terminals = this._shuffle(this._terminals);
    this._layout();
    this._draw();
  }
}

let _wiringGame = null;
let _activeBenchId = null;

// ── Circuit Modal ──────────────────────────────────────────────────────────
const circuitModal = document.getElementById('circuitModal');
let circuitPowered = false;
const _completedBenches = new Set();

window.openCircuitModal = (title, benchId) => {
  if (!circuitModal) return;
  const titleEl = document.getElementById('circuitTitle');
  if (titleEl && title) titleEl.textContent = title;
  circuitModal.style.display = 'flex';
  circuitPowered = false;
  const pBtn = document.getElementById('btnPowerOn');
  if (pBtn) { pBtn.textContent = 'PWR ON'; pBtn.classList.remove('active-power'); }
  const statusEl = document.getElementById('circuitStatus');
  if (statusEl) statusEl.textContent = 'CIRCUIT: OPEN';
  document.exitPointerLock?.();
  _activeBenchId = benchId || null;

  // Init wiring game
  const canvas = document.getElementById('circuitCanvas');
  if (canvas) {
    if (_wiringGame) _wiringGame.destroy();
    _wiringGame = new WiringGame(canvas);
  }
};

window.closeCircuitModal = () => {
  if (circuitModal) circuitModal.style.display = 'none';
  if (_wiringGame) { _wiringGame.destroy(); _wiringGame = null; }
  Player.state = 'standing';
};

const btnPowerOn = document.getElementById('btnPowerOn');
if (btnPowerOn) {
  btnPowerOn.addEventListener('click', () => {
    circuitPowered = !circuitPowered;
    btnPowerOn.textContent = circuitPowered ? 'PWR OFF' : 'PWR ON';
    btnPowerOn.classList.toggle('active-power', circuitPowered);
    const statusEl = document.getElementById('circuitStatus');
    if (statusEl) statusEl.textContent = circuitPowered ? 'CIRCUIT: LIVE' : 'CIRCUIT: OPEN';
    notify(circuitPowered ? 'Power ON — circuit energised.' : 'Power OFF.', 2000);
    if (Audio.ctx) Audio.click();
  });
}

const btnCheckCircuit = document.getElementById('btnCheckCircuit');
if (btnCheckCircuit) {
  btnCheckCircuit.addEventListener('click', () => {
    if (!_wiringGame) { notify('No circuit loaded.', 1500); return; }
    const result = _wiringGame.check();
    if (result.ok) {
      const statusEl = document.getElementById('circuitStatus');
      if (statusEl) statusEl.textContent = 'CIRCUIT: OK';
      notify('[OK] Wiring correct — all terminals secured!', 3000);
      if (Audio.ctx) Audio.chirp?.() || Audio.click();
      if (activeTask?.id === 'cable_check' && _activeBenchId) {
        _completedBenches.add(_activeBenchId);
        if (['bench-1','bench-2','bench-3'].every(id => _completedBenches.has(id)))
          completeTask('cable_check');
      }
    } else {
      notify(`[FAIL] ${result.msg}`, 2500);
      if (Audio.ctx) Audio.click();
    }
  });
}

const btnResetWires = document.getElementById('btnResetWires');
if (btnResetWires) {
  btnResetWires.addEventListener('click', () => {
    if (_wiringGame) {
      _wiringGame.reset();
      const statusEl = document.getElementById('circuitStatus');
      if (statusEl) statusEl.textContent = 'CIRCUIT: OPEN';
    }
    notify('Wires reset.', 1200);
    if (Audio.ctx) Audio.click();
  });
}

const btnCloseCircuit = document.getElementById('btnCloseCircuit');
if (btnCloseCircuit) {
  btnCloseCircuit.addEventListener('click', () => {
    window.closeCircuitModal();
    if (Audio.ctx) Audio.click();
  });
}


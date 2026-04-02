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

// ── VOICE ASSISTANT (A.I.D.A) ────────────────────────────────────────────────
class VoiceAssistant {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.muted = false;
    this.playing = false;
    this.queue = [];
    this._hideTimer = null;

    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v =>
        v.name.includes('Google US English') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Samantha') || v.name.includes('Zira') ||
        v.name.includes('Female')
      ) || voices[0] || null;
    };
    if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    this._buildUI();
  }

  _buildUI() {
    if (document.getElementById('aidaBar')) return;

    const bar = document.createElement('div');
    bar.id = 'aidaBar';
    bar.style.cssText = [
      'position:fixed',
      'bottom:0',
      'left:0',
      'right:0',
      'background:rgba(13,21,38,0.97)',
      'border-top:2px solid rgba(255,184,0,0.55)',
      'display:none',
      'align-items:center',
      'gap:10px',
      'padding:8px 14px',
      'z-index:9999',
      'pointer-events:all',
      'box-shadow:0 -4px 20px rgba(0,0,0,0.6)',
    ].join(';');

    const avatar = document.createElement('div');
    avatar.style.cssText = 'width:36px;height:36px;flex-shrink:0;background:radial-gradient(circle,#FFB800 0%,#8a6000 100%);border-radius:50%;border:2px solid rgba(255,184,0,0.7);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 12px rgba(255,184,0,0.4);';
    avatar.textContent = '🤖';

    const textEl = document.createElement('div');
    textEl.id = 'aidaText';
    textEl.style.cssText = 'flex:1;font-size:clamp(11px,2.2vw,14px);color:#fff;font-family:Inter,Roboto,Arial,sans-serif;font-weight:600;line-height:1.35;';

    const muteBtn = document.createElement('button');
    muteBtn.id = 'aidaMute';
    muteBtn.textContent = '🔊';
    muteBtn.style.cssText = 'background:rgba(255,184,0,0.12);border:1px solid rgba(255,184,0,0.4);border-radius:8px;color:#FFB800;font-size:16px;width:38px;height:38px;cursor:pointer;flex-shrink:0;';
    muteBtn.addEventListener('click', () => {
      this.muted = !this.muted;
      muteBtn.textContent = this.muted ? '🔇' : '🔊';
      if (this.muted && this.synth) this.synth.cancel();
    });

    const skipBtn = document.createElement('button');
    skipBtn.id = 'aidaSkip';
    skipBtn.textContent = 'SKIP ›';
    skipBtn.style.cssText = 'background:rgba(255,184,0,0.15);border:1px solid rgba(255,184,0,0.5);border-radius:8px;color:#FFB800;font-size:10px;font-weight:700;letter-spacing:1px;padding:0 12px;height:38px;cursor:pointer;flex-shrink:0;font-family:Inter,Roboto,Arial,sans-serif;';
    skipBtn.addEventListener('click', () => this._skip());

    bar.appendChild(avatar);
    bar.appendChild(textEl);
    bar.appendChild(muteBtn);
    bar.appendChild(skipBtn);
    document.body.appendChild(bar);
  }

  _skip() {
    if (this.synth) this.synth.cancel();
    this.playing = false;
    clearTimeout(this._hideTimer);
    if (this.queue.length > 0) {
      this.processQueue();
    } else {
      this._hide();
    }
  }

  _show(text) {
    const bar = document.getElementById('aidaBar');
    const textEl = document.getElementById('aidaText');
    if (bar) bar.style.display = 'flex';
    if (textEl) textEl.textContent = `🤖 A.I.D.A: "${text}"`;
    clearTimeout(this._hideTimer);
  }

  _hide() {
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => {
      const bar = document.getElementById('aidaBar');
      if (bar && !this.playing && this.queue.length === 0) bar.style.display = 'none';
    }, 4000);
  }

  speak(text, callback = null) {
    this.queue.push({ text, callback });
    this.processQueue();
  }

  processQueue() {
    if (this.playing || this.queue.length === 0) return;
    this.playing = true;
    const item = this.queue.shift();

    this._show(item.text);

    const done = () => {
      this.playing = false;
      if (item.callback) item.callback();
      if (this.queue.length > 0) this.processQueue();
      else this._hide();
    };

    if (!this.muted && this.synth) {
      try {
        const utterance = new SpeechSynthesisUtterance(item.text);
        if (this.voice) utterance.voice = this.voice;
        utterance.pitch = 0.95;
        utterance.rate = 0.9;
        utterance.onend = done;
        utterance.onerror = done; // fallback: speech failed, just show text
        this.synth.speak(utterance);

        // Watchdog: some Android browsers never fire onend
        const watchdog = setTimeout(() => {
          if (this.playing) { this.synth.cancel(); done(); }
        }, Math.max(item.text.length * 80, 4000));
        utterance.onend = () => { clearTimeout(watchdog); done(); };
        utterance.onerror = () => { clearTimeout(watchdog); done(); };
      } catch (_) {
        done();
      }
    } else {
      // Muted or no speech — display text for reading, auto-advance after reading time
      const readMs = Math.max(item.text.length * 50, 2500);
      setTimeout(done, readMs);
    }
  }
}
const AIDA = new VoiceAssistant();

// ── TUTORIAL SYSTEM ──────────────────────────────────────────────────────────
const Tutorial = {
  step: 0,
  active: false,
  start() {
    this.active = true;
    this.step = 1;
    setTimeout(() => {
      AIDA.speak("Initialization complete. Welcome to the simulator. I am AIDA, your automated diagnostic assistant.", () => {
        AIDA.speak("Let us begin your orientation. First, use your W A S D keys, or the joystick, to walk around the room.", () => {
          this.waitForMovement();
        });
      });
    }, 1500); // Give user a moment to load in
  },
  
  waitForMovement() {
    const startPos = Player.pos.clone();
    const checkMovement = setInterval(() => {
      if (Player.pos.distanceTo(startPos) > 1.0) {
        clearInterval(checkMovement);
        this.step = 2;
        setTimeout(() => {
          AIDA.speak("Excellent movement. Next, use your touch screen or mouse to look around the facility.", () => {
            this.waitForRotation();
          });
        }, 800);
      }
    }, 500);
  },

  waitForRotation() {
    const startRot = camera.rotation.y;
    const checkRotation = setInterval(() => {
      if (Math.abs(camera.rotation.y - startRot) > 0.4) {
        clearInterval(checkRotation);
        this.step = 3;
        setTimeout(() => {
          AIDA.speak("Sensors calibrated. Please approach the Main Power breaker panel on the wall near the door, and flip the main power switch ON.", () => {
            this.waitForMainSwitch();
          });
        }, 800);
      }
    }, 500);
  },

  waitForMainSwitch() {
    const checkSwitch = setInterval(() => {
      // The user must turn mainSwitch ON.
      if (mainSwitch && mainSwitch.userData.on) {
        clearInterval(checkSwitch);
        this.step = 4;
        setTimeout(() => {
          AIDA.speak("Power restored successfully. To complete your orientation, please sit at the workshop computer terminal to review the facility map.", () => {
            this.waitForComputer();
          });
        }, 1200);
      }
    }, 500);
  },

  waitForComputer() {
    const checkComp = setInterval(() => {
      if (Player.state === 'computer') {
        clearInterval(checkComp);
        this.step = 5;
        this.active = false;
        setTimeout(() => {
          AIDA.speak("Diagnostics complete. You have successfully passed orientation. Please proceed to explore the simulator.");
        }, 1500);
      }
    }, 500);
  }
};

// Memoised HUD state — only write to DOM when values change
const _hudPrev = { mains: null, gen: null, work: null, ctrl: null };

function applyPower() {
  const hasPower = ES.mains || ES.generator;
  Object.entries(roomLightSets).forEach(([room, lights]) => {
    const powered = hasPower && (ES[room] !== false);
    const tgt = powered ? (lightTargets[room] || 3.5) : 0;
    lights.forEach(l => { l.intensity += (tgt - l.intensity) * 0.1; });
  });
  ambLight.intensity = hasPower ? 0.65 : 0.1;

  // Only touch the DOM when a value actually changes
  const work = ES.workshop && hasPower;
  const ctrl = ES.control  && hasPower;
  if (ES.mains     !== _hudPrev.mains) { setHUD('pMains', ES.mains);     _hudPrev.mains = ES.mains; }
  if (ES.generator !== _hudPrev.gen)   { setHUD('pGen',   ES.generator); _hudPrev.gen   = ES.generator; }
  if (work         !== _hudPrev.work)  { setHUD('pWork',  work);         _hudPrev.work  = work; }
  if (ctrl         !== _hudPrev.ctrl)  { setHUD('pCtrl',  ctrl);         _hudPrev.ctrl  = ctrl; }
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
        ${task.completed ? '[OK]' : (activeTask?.id === task.id ? '▶' : '[ ]')} ${task.title}
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
  // Global catch for special states
  if (Player.state === 'sitting') {
    // Couch — stand up
    Player.state = 'standing';
    Player.pos.z += 0.8; // Safely step out of the couch area into the room
    if (focusedObj?.userData) focusedObj.userData.label = 'Sit Down (Couch)';
    if (Audio.ctx) Audio.click();
    return;
  }
  if (Player.state === 'computer' || Player.state === 'cctv') return;

  if (!focusedObj) return;
  const ud = focusedObj.userData;
  if (Audio.ctx) Audio.click();

  // ── Seating (couch) ──────────────────────────────────────────────────────────────────
  if (ud.type === 'sit') {
    Player.state = 'sitting';
    Player.targetCamPos.copy(ud.sitPos);
    Player.targetCamRot.set(-0.12, ud.sitYaw, 0, 'YXZ');
    ud.label = 'Stand Up (Couch)';
    return;
  }

  // ── Computer ──────────────────────────────────────────────────────────────────────
  if (ud.type === 'computer') {
    Player.state = 'computer';
    Player.lastComputerPos = ud.compPos || new THREE.Vector3(2.5, 1.10, -22.83);
    Player.lastComputerRot = ud.compRot || new THREE.Euler(-0.05, 0, 0, 'YXZ');
    Player.targetCamPos.copy(Player.lastComputerPos);
    Player.targetCamRot.copy(Player.lastComputerRot);
    window.openComputerUI();
    return;
  }
  
  // ── Inspect Object ────────────────────────────────────────────────────────
  if (ud.type === 'inspect') {
    notify(`INSPECTED: ${ud.label}`, 3000);
    if (Audio.ctx) Audio.click();
    return;
  }

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
    notify(`${ud.label}: ${br.on ? 'ON ' : 'OFF ✗'}`);

    if (activeTask?.id === 'morning_inspection') {
      const sub = activeTask.subtasks.find(s => s.panel === ud.panel);
      if (sub && !sub.checked) {
        sub.checked = true;
        if (activeTask.subtasks.every(s => s.checked)) completeTask('morning_inspection');
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
    if (ud.id === 'gen-switch') { ES.generator = ud.on; applyPower(); }
    notify(`${ud.label}: ${ud.on ? 'ON ' : 'OFF ✗'}`);
    return;
  }

  // ── SCADA Terminal ────────────────────────────────────────────────────────
  if (ud.type === 'scada-terminal') {
    notify(`${ud.label} — System locked. Maintenance required.`, 2500);
    if (Audio.ctx) Audio.click();
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
    notify('EMERGENCY STOP — All power halted!', 5000);
    return;
  }

  // ── Generator Start ───────────────────────────────────────────────────────
  if (ud.type === 'generator-start') {
    if (!generator.running) {
      generator.running = true;
      generator.targetRpm = 1500;
      if (Audio.ctx) Audio.hum(true);
      notify('Generator cranking up...', 2500);

      if (activeTask?.id === 'generator_test') {
        clearTimeout(activeTask._rpmCheckTimeout);
        activeTask._rpmCheckTimeout = setTimeout(() => {
          if (generator.rpm >= 1300) {
            notify('[OK] Generator RPM nominal — hold for 5s', 2000);
            setTimeout(() => {
              if (generator.running) completeTask('generator_test');
            }, 5000);
          } else {
            notify('Generator RPM too low', 2000);
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
      notify('Generator shutting down...', 2500);
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
    notify(`${term.active ? '[OK]' : '[ ]'} SCADA Terminal ${ud.idx + 1} ${term.active ? 'Online' : 'Offline'}`);
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
      notify(`[OK] Wire Terminal ${ud.idx + 1} verified & secured`, 2500);
      if (activeTask?.id === 'cable_check') {
        const allDone = cableStations.every(s => s.completed);
        if (allDone) completeTask('cable_check');
        else notify(`Terminals ${cableStations.filter(s => s.completed).length}/3 verified`, 1800);
      }
    } else {
      notify(`Wire Terminal ${ud.idx + 1} — Already verified [OK]`, 2000);
    }
    return;
  }

  // ── Multimeter ────────────────────────────────────────────────────────────
  if (ud.type === 'multimeter') {
    const v = (230 + (Math.random() - .5) * 8).toFixed(1);
    const f = (50 + (Math.random() - .5) * .4).toFixed(2);
    notify(`METER: ${v}V AC  ${f}Hz`, 3000);
    return;
  }

  // ── Oscilloscope ──────────────────────────────────────────────────────────
  if (ud.type === 'oscilloscope') {
    notify('SCOPE: Waveform analysis active — 50Hz nominal', 3000);
    return;
  }
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
const MM_W = 148, MM_H = 148; // kept for any legacy refs

const MAP = { minX: -16, maxX: 36, minZ: -30, maxZ: 36 };


// Room zone definitions for minimap rendering
const MM_ZONES = {
  power:   { fill: 'rgba(60,28,8,0.75)',   wall: 'rgba(220,130,50,0.7)',  label: 'rgba(255,160,70,0.9)'  },
  control: { fill: 'rgba(6,22,50,0.75)',   wall: 'rgba(50,130,220,0.7)',  label: 'rgba(80,160,255,0.9)'  },
  dist:    { fill: 'rgba(50,8,8,0.75)',    wall: 'rgba(210,60,50,0.7)',   label: 'rgba(255,90,80,0.9)'   },
  lab:     { fill: 'rgba(6,30,40,0.75)',   wall: 'rgba(40,180,190,0.7)',  label: 'rgba(60,220,230,0.9)'  },
  general: { fill: 'rgba(10,20,28,0.75)',  wall: 'rgba(60,100,80,0.65)', label: 'rgba(90,150,110,0.85)' },
};

const MM_ROOMS = [
  { abbr: 'ENT',   cx: 1,  cz: -24, w: 6,  d: 8,  zone: 'general' },
  { abbr: 'HALL',  cx: 1,  cz:   3, w: 6,  d: 46, zone: 'general' },
  { abbr: 'WKSP',  cx: 15, cz: -10, w: 22, d: 20, zone: 'power'   },
  { abbr: 'GEN',   cx: 12, cz:   7, w: 16, d: 14, zone: 'power'   },
  { abbr: 'CTRL',  cx: 27, cz:   1, w: 14, d: 18, zone: 'control' },
  { abbr: 'DST-A', cx: -8, cz:  -5, w: 12, d: 14, zone: 'dist'    },
  { abbr: 'DST-B', cx: -8, cz:   9, w: 12, d: 14, zone: 'dist'    },
  { abbr: 'LAB',   cx: 27, cz:  16, w: 14, d: 12, zone: 'lab'     },
  { abbr: 'STOR',  cx: -8, cz:  22, w: 12, d: 12, zone: 'general' },
  { abbr: 'UTIL',  cx: 10, cz:  21, w: 12, d: 14, zone: 'control' },
  { abbr: 'STWR',  cx:  7, cz:  30, w:  6, d:  8, zone: 'general' },
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
      mmCtx.font = `bold ${Math.min(7, rw / r.abbr.length * 0.9)}px monospace`;
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
  mmCtx.font = 'bold 7px monospace';
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
  if (Player.state === 'sitting') {
    if (promptEl) {
      promptEl.textContent = 'STAND UP';
      promptEl.style.display = 'flex';
    }
  } else if (Player.state === 'computer' || Player.state === 'cctv') {
    if (promptEl) promptEl.style.display = 'none';
  } else {
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
        promptEl.textContent = (label).toUpperCase();
        promptEl.style.display = 'flex';
      }
    } else {
      focusedObj = null;
      if (promptEl) promptEl.style.display = 'none';
    }
  } else {
    focusedObj = null;
    if (promptEl) promptEl.style.display = 'none';
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

    // Show HUD
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.style.display = 'block';

    // Desktop mouse hint
    if (!isMobile) {
      const msg = document.getElementById('ptrMsg');
      if (msg) { msg.style.display = 'block'; msg.textContent = 'Click to lock mouse | WASD to move | E to interact | T toggle tasks'; }
    }

    applyPower();
    Tutorial.start();
    updateTaskDisplay();
    notify('Welcome, Trainee. Check your task list.', 4000);

    // Show game UI elements
    ['rightActionBar', 'btnPauseTop', 'tutorialBar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'flex';
    });

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
  interactBtn.addEventListener('click', e => {
    e.preventDefault();
    doInteract();
  });
  interactBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    doInteract();
  }, { passive: false });
}

// Tap-anywhere interaction — brief touch (<200ms, <15px drift) on the look zone triggers USE
{
  const lz = document.getElementById('lookZone');
  if (lz) {
    let _tapT = 0, _tapX = 0, _tapY = 0, _tapId = -1;
    lz.addEventListener('touchstart', e => {
      if (e.changedTouches.length !== 1 || _tapId !== -1) return;
      const t = e.changedTouches[0];
      _tapT = Date.now(); _tapX = t.clientX; _tapY = t.clientY; _tapId = t.identifier;
    }, { passive: true });
    lz.addEventListener('touchend', e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== _tapId) continue;
        _tapId = -1;
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
  btnExitCCTV.addEventListener('click', () => {
    cctvOverlay.style.display = 'none';
    if (cctvTimeInterval) { clearInterval(cctvTimeInterval); cctvTimeInterval = null; }

    // Back to computer terminal
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
  });
}

// ── NEW BUTTON SYSTEM ────────────────────────────────────────────────────────

// ── Pause / Resume ─────────────────────────────────────────────────────────
let gamePaused = false;

function setPaused(v) {
  gamePaused = v;
  const menu = document.getElementById('pauseMenu');
  if (menu) menu.style.display = v ? 'flex' : 'none';
}

const btnPauseTop = document.getElementById('btnPauseTop');
if (btnPauseTop) btnPauseTop.addEventListener('click', () => setPaused(true));

const btnResume = document.getElementById('btnResume');
if (btnResume) btnResume.addEventListener('click', () => setPaused(false));

const btnRestartLevel = document.getElementById('btnRestartLevel');
if (btnRestartLevel) btnRestartLevel.addEventListener('click', () => {
  setPaused(false);
  notify('Restarting level...', 2000);
  // Level restart hook — extend here
});

const btnMainMenu = document.getElementById('btnMainMenu');
if (btnMainMenu) btnMainMenu.addEventListener('click', () => {
  location.reload();
});

// Pause via Escape key
window.addEventListener('keydown', e => {
  if (e.code === 'Escape' && gamePaused) setPaused(false);
  if (e.code === 'KeyP') setPaused(!gamePaused);
});

// ── Tasks Panel ────────────────────────────────────────────────────────────
const btnRTasks = document.getElementById('btnRTasks');
if (btnRTasks) {
  btnRTasks.addEventListener('click', () => {
    const panel = document.getElementById('taskPanel');
    if (!panel) return;
    const visible = panel.style.display !== 'none' && panel.style.display !== '';
    panel.style.display = visible ? 'none' : 'block';
    btnRTasks.classList.toggle('pressed', !visible);
  });
}

// ── Schematic View ─────────────────────────────────────────────────────────
const btnRSchematic = document.getElementById('btnRSchematic');
if (btnRSchematic) {
  btnRSchematic.addEventListener('click', () => {
    // Schematic modal will be driven by TutorialManager/LevelLoader in Phase 2
    notify('No schematic available for current task.', 2500);
  });
}

// ── Hint ──────────────────────────────────────────────────────────────────
const btnRHint = document.getElementById('btnRHint');
if (btnRHint) {
  btnRHint.addEventListener('click', () => {
    if (Tutorial.active) {
      AIDA.speak('Let me repeat the current instruction for you.');
      setTimeout(() => AIDA.speak(currentStepHint || 'Follow the highlighted path to your next objective.'), 2000);
    } else {
      notify('No active tutorial step. Complete current tasks first.', 2500);
    }
  });
}

// Track the current step hint text for the HINT button
let currentStepHint = '';

// ── Tool Belt ─────────────────────────────────────────────────────────────
let activeTool = 'wire';
const toolBelt = document.getElementById('toolBelt');

const btnRTools = document.getElementById('btnRTools');
if (btnRTools) {
  btnRTools.addEventListener('click', () => {
    if (!toolBelt) return;
    toolBelt.classList.toggle('open');
    btnRTools.classList.toggle('pressed', toolBelt.classList.contains('open'));
  });
}

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
      notify('Tool locked — complete earlier levels to unlock.', 2500);
      return;
    }
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTool = btn.dataset.tool;
    notify(`Tool selected: ${btn.textContent.trim().split('\n').pop().trim()}`, 1500);
    // Close belt after selection
    if (toolBelt) toolBelt.classList.remove('open');
    if (btnRTools) btnRTools.classList.remove('pressed');
  });
});

// ── Tutorial Bar — REPEAT / NEXT STEP ──────────────────────────────────────
const btnRepeat = document.getElementById('btnRepeat');
if (btnRepeat) {
  btnRepeat.addEventListener('click', () => {
    if (currentStepHint) AIDA.speak(currentStepHint);
  });
}

const btnNextStep = document.getElementById('btnNextStep');
if (btnNextStep) {
  btnNextStep.addEventListener('click', () => {
    // NEXT STEP is shown only when a step is manually advanceable
    // TutorialManager will call enableNextStep()/disableNextStep() to control visibility
  });
}

// Helper: show/hide the NEXT STEP button from tutorial steps
window.enableNextStep = (cb) => {
  if (btnNextStep) {
    btnNextStep.style.display = 'block';
    btnNextStep.onclick = () => {
      btnNextStep.style.display = 'none';
      if (cb) cb();
    };
  }
};
window.disableNextStep = () => {
  if (btnNextStep) btnNextStep.style.display = 'none';
};

// Helper: update tutorial step badge
window.setTutorialStep = (current, total, hintText) => {
  const badge = document.getElementById('tutorialStepBadge');
  if (badge) badge.textContent = `STEP ${current} / ${total}`;
  if (hintText !== undefined) currentStepHint = hintText;
};

// ── Circuit Modal ──────────────────────────────────────────────────────────
const circuitModal = document.getElementById('circuitModal');
let circuitPowered = false;

window.openCircuitModal = (title) => {
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
};

window.closeCircuitModal = () => {
  if (circuitModal) circuitModal.style.display = 'none';
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
    // CircuitSolver.check() will be called here in Phase 3
    notify('Circuit check: No wiring data yet. Connect wires first.', 2500);
  });
}

const btnResetWires = document.getElementById('btnResetWires');
if (btnResetWires) {
  btnResetWires.addEventListener('click', () => {
    notify('Wires reset.', 1500);
    if (Audio.ctx) Audio.click();
    // WiringSystem.reset() will be called here in Phase 3
  });
}

const btnCloseCircuit = document.getElementById('btnCloseCircuit');
if (btnCloseCircuit) {
  btnCloseCircuit.addEventListener('click', () => {
    window.closeCircuitModal();
    if (Audio.ctx) Audio.click();
  });
}


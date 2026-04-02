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
  wireObjects, scenarioTerminals, validationBoard,
  M
} from './world.js';
import { Player, updatePlayer, getRoom, isMobile } from './player.js';

// ══════════════════════════════════════════════════════════════════════════════
// TOOL SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
const TOOLS = {
  wire_stripper:  { id: 'wire_stripper',  label: 'Wire Stripper',  applicableTo: ['wire-object']     },
  screwdriver:    { id: 'screwdriver',    label: 'Screwdriver',    applicableTo: ['terminal-block']  },
  multimeter:     { id: 'multimeter',     label: 'Multimeter',     applicableTo: ['multimeter','validate-board'] },
  pliers:         { id: 'pliers',         label: 'Pliers',         applicableTo: ['wire-object']     },
  voltage_tester: { id: 'voltage_tester', label: 'Voltage Tester', applicableTo: ['validate-board']  },
};

// activeTool is now a string key from TOOLS, or null (no tool)
let activeTool = null;

function getToolLabel() {
  return activeTool ? TOOLS[activeTool]?.label ?? activeTool : 'None';
}

// ── Update the persistent tool indicator in HUD ───────────────────────────────
function updateToolHUD() {
  const el = document.getElementById('toolIndicator');
  if (!el) return;
  if (activeTool) {
    el.textContent = `🔧 ${getToolLabel()}`;
    el.style.opacity = '1';
    el.style.borderColor = 'rgba(255,184,0,0.7)';
    el.style.color = '#FFB800';
  } else {
    el.textContent = 'No tool equipped';
    el.style.opacity = '0.45';
    el.style.borderColor = 'rgba(255,255,255,0.15)';
    el.style.color = '#8899aa';
  }
}

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

function errorFlash() {
  const el = document.getElementById('errorFlash');
  if (!el) return;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 350);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENARIO MANAGER — S01: Basic Panel Wiring
// ══════════════════════════════════════════════════════════════════════════════
const SCENARIO_S01 = [
  { id: 's1_pickup_stripper', instruction: 'Step 1 — Pick up the Wire Stripper from the tool rack.',    done: false },
  { id: 's1_strip_L',         instruction: 'Step 2 — Strip the BROWN wire (L — Line).',                 done: false },
  { id: 's1_strip_N',         instruction: 'Step 3 — Strip the BLUE wire (N — Neutral).',               done: false },
  { id: 's1_strip_PE',        instruction: 'Step 4 — Strip the GRN/YLW wire (PE — Earth).',             done: false },
  { id: 's1_pickup_driver',   instruction: 'Step 5 — Return stripper. Pick up the Screwdriver.',        done: false },
  { id: 's1_conn_L',          instruction: 'Step 6 — Connect BROWN wire → Terminal L.',                 done: false },
  { id: 's1_conn_N',          instruction: 'Step 7 — Connect BLUE wire → Terminal N.',                  done: false },
  { id: 's1_conn_PE',         instruction: 'Step 8 — Connect GRN/YLW wire → Terminal PE.',              done: false },
  { id: 's1_pickup_meter',    instruction: 'Step 9 — Pick up the Multimeter.',                          done: false },
  { id: 's1_measure',         instruction: 'Step 10 — Measure voltage at the terminal block.',          done: false },
  { id: 's1_validate',        instruction: 'Step 11 — Press VALIDATE at the testing station.',         done: false },
];

const ScenarioManager = {
  steps:       SCENARIO_S01,
  currentIdx:  0,
  active:      false,

  start() {
    this.steps.forEach(s => { s.done = false; });
    this.currentIdx = 0;
    this.active = true;
    this.updateHUD();
    feedbackLog('S01 Basic Panel Wiring — STARTED', 'ok');
    notify('SCENARIO S01: Basic Panel Wiring — Follow the steps!', 4000);
  },

  current() {
    return this.steps[this.currentIdx] || null;
  },

  advance(stepId) {
    const step = this.steps[this.currentIdx];
    if (!step || step.id !== stepId) return false;
    step.done = true;
    this.currentIdx++;
    feedbackLog(`✓ ${step.instruction.replace(/^Step \d+ — /, '')}`, 'ok');
    if (this.currentIdx >= this.steps.length) {
      this._complete();
    } else {
      notify(this.steps[this.currentIdx].instruction, 4500);
      this.updateHUD();
    }
    return true;
  },

  _complete() {
    this.active = false;
    validationBoard.leds.forEach(l => {
      l.ledMat.color.setHex(0x00ff44);
      l.glow.intensity = 1.8;
      l.lit = true;
    });
    validationBoard.allGreen = true;
    feedbackLog('🎓 SCENARIO S01 COMPLETE — All steps passed!', 'ok');
    notify('SCENARIO S01 COMPLETE — Excellent work!', 6000);
    if (Audio.ctx) Audio.success();
    completeTask('dol_wiring');
    this.updateHUD();
  },

  // Check if a given stepId is the current one
  expects(stepId) {
    const s = this.current();
    return s ? s.id === stepId : false;
  },

  updateHUD() {
    const stepEl = document.getElementById('stepProgress');
    if (!stepEl) return;
    if (!this.active) {
      stepEl.textContent = this.currentIdx >= this.steps.length
        ? '✓ Scenario S01 Complete'
        : 'S01: Basic Panel Wiring (press T for tasks)';
      return;
    }
    const cur = this.current();
    if (cur) {
      stepEl.textContent = `${cur.instruction}`;
    }
  },
};

// Auto-start S01 on load
window._scenarioReady = false;
function maybeStartScenario() {
  if (!window._scenarioReady) {
    window._scenarioReady = true;
    ScenarioManager.start();
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERACTION ENGINE
// Evaluates (activeTool, objectType, objectState) → action OR failure
// ══════════════════════════════════════════════════════════════════════════════
const InteractionEngine = {
  apply(tool, ud) {
    const objType = ud.type;

    // ── tool-pickup: no tool needed ──────────────────────────────────────────
    if (objType === 'tool-pickup') {
      return this._pickupTool(ud);
    }

    // ── schematic: no tool needed ─────────────────────────────────────────────
    if (objType === 'schematic') {
      return { ok: true, action: 'show-schematic' };
    }

    // ── validate-board: needs multimeter or voltage_tester ────────────────────
    if (objType === 'validate-board') {
      return this._runValidation(tool);
    }

    // ── wire-object: needs wire_stripper ──────────────────────────────────────
    if (objType === 'wire-object') {
      return this._applyToWire(tool, ud);
    }

    // ── terminal-block: needs screwdriver ─────────────────────────────────────
    if (objType === 'terminal-block') {
      return this._applyToTerminal(tool, ud);
    }

    // ── multimeter / oscilloscope direct ──────────────────────────────────────
    if (objType === 'multimeter') {
      if (tool === 'multimeter') {
        const v = (230 + (Math.random() - .5) * 8).toFixed(1);
        const f = (50 + (Math.random() - .5) * .4).toFixed(2);
        feedbackLog(`METER: ${v}V AC  ${f}Hz — nominal`, 'ok');
        if (ScenarioManager.expects('s1_measure')) ScenarioManager.advance('s1_measure');
        return { ok: true, msg: `${v}V AC  ${f}Hz` };
      } else {
        return { ok: false, msg: `Equip the Multimeter to take readings` };
      }
    }

    return null; // Not handled here — let doInteract fall through
  },

  _pickupTool(ud) {
    const prev = activeTool;
    activeTool = ud.toolId;
    updateToolHUD();
    feedbackLog(`Picked up: ${TOOLS[ud.toolId]?.label ?? ud.toolId}`, 'info');

    // Scenario step advancement
    if (ud.toolId === 'wire_stripper' && ScenarioManager.expects('s1_pickup_stripper')) {
      ScenarioManager.advance('s1_pickup_stripper');
    } else if (ud.toolId === 'screwdriver' && ScenarioManager.expects('s1_pickup_driver')) {
      ScenarioManager.advance('s1_pickup_driver');
    } else if (ud.toolId === 'multimeter' && ScenarioManager.expects('s1_pickup_meter')) {
      ScenarioManager.advance('s1_pickup_meter');
    }

    return { ok: true, msg: `Tool equipped: ${TOOLS[ud.toolId]?.label ?? ud.toolId}` };
  },

  _applyToWire(tool, ud) {
    if (!tool) {
      return { ok: false, msg: `No tool equipped — select Wire Stripper from the rack first.` };
    }
    if (tool !== 'wire_stripper') {
      return { ok: false, msg: `Wrong tool — use Wire Stripper to strip wires, not ${TOOLS[tool]?.label ?? tool}.` };
    }
    if (ud.state === 'stripped' || ud.state === 'connected') {
      return { ok: false, msg: `Wire ${ud.wireId} is already stripped.`, already: true };
    }
    // SUCCESS — strip the wire
    ud.state = 'stripped';
    ud.wireMesh.material.color.setHex(ud.strippedColor);
    if (ud.insMesh) ud.insMesh.visible = false; // remove insulation tip
    feedbackLog(`Stripped wire ${ud.wireId} — copper exposed`, 'ok');

    const stepMap = { L: 's1_strip_L', N: 's1_strip_N', PE: 's1_strip_PE' };
    if (stepMap[ud.wireId] && ScenarioManager.expects(stepMap[ud.wireId])) {
      ScenarioManager.advance(stepMap[ud.wireId]);
    }
    return { ok: true, msg: `Wire ${ud.wireId} stripped — copper exposed.` };
  },

  _applyToTerminal(tool, ud) {
    if (!tool) {
      return { ok: false, msg: `No tool equipped — pick up the Screwdriver first.` };
    }
    if (tool !== 'screwdriver') {
      return { ok: false, msg: `Wrong tool — Screwdriver needed to tighten terminals.` };
    }
    // Check the corresponding wire is stripped
    const wireObj = wireObjects.find(w => w.id === ud.terminalId);
    if (!wireObj || wireObj.proxy.userData.state !== 'stripped') {
      return { ok: false, msg: `Wire ${ud.terminalId} must be stripped before connecting to terminal.` };
    }
    if (ud.state === 'tightened') {
      return { ok: false, msg: `Terminal ${ud.terminalId} already secured.`, already: true };
    }
    // SUCCESS
    const terminalColor = ud.terminalId === 'L' ? 0xcc2200 : ud.terminalId === 'N' ? 0x2244cc : 0x228822;
    ud.wirePlaceholderMat.color.setHex(terminalColor);
    ud.state = 'tightened';
    ud.wireMesh && (ud.wireMesh.material.color.setHex(terminalColor));
    wireObj.proxy.userData.state = 'connected';
    feedbackLog(`Terminal ${ud.terminalId} — wire secured and tightened ✓`, 'ok');

    const stepMap = { L: 's1_conn_L', N: 's1_conn_N', PE: 's1_conn_PE' };
    if (stepMap[ud.terminalId] && ScenarioManager.expects(stepMap[ud.terminalId])) {
      ScenarioManager.advance(stepMap[ud.terminalId]);
    }
    return { ok: true, msg: `Terminal ${ud.terminalId} secured.` };
  },

  _runValidation(tool) {
    if (!tool || (tool !== 'multimeter' && tool !== 'voltage_tester')) {
      return { ok: false, msg: `Equip Multimeter or Voltage Tester to run validation.` };
    }
    // Check all wires connected
    const allConnected = wireObjects.every(w =>
      w.proxy.userData.state === 'connected' || w.proxy.userData.state === 'stripped'
    );
    const allTightened = scenarioTerminals.every(t => t.proxy.userData.state === 'tightened');

    if (!allConnected || !allTightened) {
      const missing = scenarioTerminals.filter(t => t.proxy.userData.state !== 'tightened').map(t => t.termId).join(', ');
      return { ok: false, msg: `Incomplete — terminals not all secured: ${missing || 'check your work'}` };
    }

    // Light up each LED one at a time with delay
    validationBoard.leds.forEach((l, i) => {
      setTimeout(() => {
        l.ledMat.color.setHex(0x00ff44);
        l.glow.intensity = 1.8;
        l.lit = true;
      }, i * 400);
    });

    if (ScenarioManager.expects('s1_validate')) ScenarioManager.advance('s1_validate');
    return { ok: true, msg: 'Validation PASSED — all checks green.' };
  },
};

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

// ── ASSISTANT/TUTORIAL SYSTEM REMOVED ──────────────────────────────────────

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
    {
      id: 'dol_wiring',
      title: 'DOL Motor Starter',
      desc: 'Connect 3-phase supply to motor terminals at Station B',
      location: 'Workshop',
      completed: false,
    },
    {
      id: 'schematic_quiz',
      title: 'Schematic Reading Quiz',
      desc: 'Answer 3 schematic questions at Station C',
      location: 'Workshop',
      completed: false,
    },
    {
      id: 'component_id',
      title: 'Component Identifier',
      desc: 'Identify all 6 electrical components at Station D',
      location: 'Workshop',
      completed: false,
    },
    {
      id: 'server_fault',
      title: 'Server Rack Fault',
      desc: 'Reset tripped breakers in both server racks',
      location: 'Workshop',
      completed: false,
    },
    {
      id: 'junction_wiring',
      title: 'Junction Box Wiring',
      desc: 'Wire junction box correctly at Station E',
      location: 'Workshop',
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
  // State guards
  if (Player.state === 'sitting') {
    Player.state = 'standing';
    Player.pos.z += 0.8;
    if (focusedObj?.userData) focusedObj.userData.label = 'Sit Down (Couch)';
    if (Audio.ctx) Audio.click();
    return;
  }
  if (Player.state === 'computer' || Player.state === 'cctv' || Player.state === 'circuit') return;
  if (!focusedObj) return;

  const ud = focusedObj.userData;
  if (Audio.ctx) Audio.click();

  // ── Route through InteractionEngine FIRST for training objects ───────────
  const engineTypes = ['tool-pickup','wire-object','terminal-block','validate-board','multimeter','schematic'];
  if (engineTypes.includes(ud.type)) {
    const result = InteractionEngine.apply(activeTool, ud);
    if (!result) return;

    if (result.action === 'show-schematic') {
      openSchematicModal(ud.scenarioId);
      return;
    }

    if (result.ok) {
      if (result.msg) notify(result.msg, 2800);
    } else {
      // Wrong tool or wrong sequence — show failure
      notify(`⚠ ${result.msg}`, 3500);
      feedbackLog(`⚠ ${result.msg}`, 'error');
      errorFlash();
    }
    ScenarioManager.updateHUD();
    return;
  }

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

  // ── Inspect ───────────────────────────────────────────────────────────────
  if (ud.type === 'inspect') {
    notify(`INSPECTED: ${ud.label}`, 3000);
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
    if (ud.id === 'gen-switch')  { ES.generator = ud.on; applyPower(); }
    notify(`${ud.label}: ${ud.on ? 'ON' : 'OFF'}`);
    return;
  }

  // ── SCADA Terminal ────────────────────────────────────────────────────────
  if (ud.type === 'scada-terminal') {
    const term = scadaTerminals[ud.idx];
    if (!term) return;
    if (Audio.ctx) Audio.chirp?.() || Audio.click();
    term.active = !term.active;
    notify(`${term.active ? '[OK]' : '[ ]'} SCADA Terminal ${ud.idx + 1} ${term.active ? 'Online' : 'Offline'}`);
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
      notify('Generator cranking up...', 2500);
      if (activeTask?.id === 'generator_test') {
        clearTimeout(activeTask._rpmCheckTimeout);
        activeTask._rpmCheckTimeout = setTimeout(() => {
          if (generator.rpm >= 1300) {
            notify('[OK] Generator RPM nominal — hold for 5s', 2000);
            setTimeout(() => { if (generator.running) completeTask('generator_test'); }, 5000);
          } else notify('Generator RPM too low', 2000);
        }, 4000);
      }
    } else notify('Generator already running', 1500);
    return;
  }

  // ── Generator Stop ────────────────────────────────────────────────────────
  if (ud.type === 'generator-stop') {
    if (generator.running) {
      generator.running = false; generator.targetRpm = 0;
      if (Audio.ctx) Audio.hum(false);
      notify('Generator shutting down...', 2500);
    } else notify('Generator not running', 1500);
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

    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.style.display = 'block';

    if (!isMobile) {
      const msg = document.getElementById('ptrMsg');
      if (msg) { msg.style.display = 'block'; msg.textContent = 'Click to lock mouse | WASD to move | E to interact | T toggle tasks'; }
    }

    applyPower();
    updateTaskDisplay();
    updateToolHUD();
    maybeStartScenario();

    ['rightActionBar', 'btnPauseTop'].forEach(id => {
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
    openSchematicModal('S01');
  });
}

const btnRHint = document.getElementById('btnRHint');
if (btnRHint) {
  btnRHint.addEventListener('click', () => {
    const cur = ScenarioManager.current();
    if (cur) notify(`Hint: ${cur.instruction}`, 5000);
    else notify('Scenario complete — no further hints.', 2000);
  });
}

// ── Tool Belt ─────────────────────────────────────────────────────────────
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
    ctx.font = `bold ${Math.max(9, Math.round(W * 0.018))}px Courier New`;
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
    const fontSize = Math.max(9, Math.round(W * 0.018));

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
    ctx.font = `${Math.max(8, Math.round(W * 0.014))}px Courier New`;
    ctx.fillStyle = 'rgba(68,255,136,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText('DRAG WIRE  →  TERMINAL  |  CHECK TO VERIFY', W / 2, H - 14);

    // Completion banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,20,10,0.82)';
      ctx.fillRect(0, H / 2 - 38, W, 76);
      ctx.font = `bold ${Math.max(18, Math.round(W * 0.04))}px Courier New`;
      ctx.fillStyle = '#44ff88';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CIRCUIT COMPLETE', W / 2, H / 2 - 10);
      ctx.font = `${Math.max(10, Math.round(W * 0.02))}px Courier New`;
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


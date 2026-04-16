// ══════════════════════════════════════════════════════════════════════════════
// TUTORIAL SYSTEM  —  Phase 1: Orientation
// PinoyTek  |  ElectroTech Sim
// ══════════════════════════════════════════════════════════════════════════════

// ── PHASE DEFINITIONS ─────────────────────────────────────────────────────────
export const PHASES = ['ORIENTATION', 'DEMO', 'GUIDED', 'ASSESS', 'FEEDBACK'];

let _currentPhase = 0;

// ── SAFETY RULES  (must-acknowledge before game scenario starts) ───────────────
export const SAFETY_RULES = [
  {
    icon: '⚡',
    title: 'DE-ENERGIZE BEFORE WORK',
    desc: 'Always switch off the circuit breaker and verify with a voltage tester before touching any live component. (OSHS Rule 1080 — Electrical Safety)',
  },
  {
    icon: '🔒',
    title: 'LOCKOUT / TAGOUT (LOTO)',
    desc: 'Lock the isolation switch and attach a personal danger tag. Never rely on a verbal instruction alone. (IEC 60204-1 §5.4)',
  },
  {
    icon: '🧤',
    title: 'USE CORRECT PPE',
    desc: 'Wear insulating gloves (Class 00 min), safety glasses, and closed-toe shoes rated for the voltage class. (PinoyTek CBLM NC II — Unit 1)',
  },
];

// ── COMPONENT LIBRARY  (PinoyTek NC II / NC III standard) ────────────────────────
export const COMPONENT_LIBRARY = {
  'breaker': {
    name: 'Miniature Circuit Breaker (MCB)',
    iecSymbol: '──[/]──',
    function: 'Protects circuits from overload and short-circuit by tripping automatically. Rated by breaking capacity (kA) and current (A).',
    standard: 'IEC 60898-1',
    wiring: 'Line → top terminal  |  Load → bottom terminal',
    tesda: 'NC II — Install distribution boards',
  },
  'switch': {
    name: 'Isolating Switch / Disconnect',
    iecSymbol: '──/ ──',
    function: 'Manually opens or closes a circuit path. Must be capable of interrupting rated current; used for isolation only, not protection.',
    standard: 'IEC 60947-3',
    wiring: 'L-in → line side  |  L-out → load side',
    tesda: 'NC II — Panel assembly',
  },
  'multimeter': {
    name: 'Digital Multimeter (DMM)',
    iecSymbol: '[V·A·Ω]',
    function: 'Measures AC/DC voltage, current, and resistance. Always start on highest range then decrease. Verify CAT rating matches circuit voltage.',
    standard: 'IEC 61010-1 (CAT III 300V min for panels)',
    wiring: 'COM → black lead  |  VΩ → red lead (V/R)  |  A → red lead (current)',
    tesda: 'NC II — Test and measure electrical circuits',
  },
  'wire-object': {
    name: 'PVC-Insulated Copper Conductor',
    iecSymbol: '─────',
    function: 'Carries electrical current between components. Size selected by ampacity (A) and voltage drop. Color-coded per IEC 60446.',
    standard: 'IEC 60446  |  IEC 60228',
    wiring: 'L = Brown  |  N = Blue  |  PE = Green/Yellow',
    tesda: 'NC II — Terminate and connect electrical wiring',
  },
  'terminal-block': {
    name: 'Screw-type Terminal Block',
    iecSymbol: '─[■]─',
    function: 'Provides a safe, removable connection point for conductors. Torque the screw to manufacturer spec to prevent loose connections.',
    standard: 'IEC 60947-7-1',
    wiring: 'Insert stripped wire (8–10 mm) and tighten to rated torque (N·m)',
    tesda: 'NC II — Terminate and connect electrical wiring',
  },
  'validate-board': {
    name: 'Circuit Validation Station',
    iecSymbol: '[✓ LED]',
    function: 'Tests continuity, polarity, and insulation resistance of completed wiring. LEDs indicate pass/fail per test point.',
    standard: 'PinoyTek Assessment criteria — NC II practical exam',
    wiring: 'Connect probes to test points as indicated. All LEDs must be GREEN to pass.',
    tesda: 'NC II — Perform testing and commissioning',
  },
  'generator-start': {
    name: 'DOL Motor Starter (Direct-On-Line)',
    iecSymbol: '[M▶]',
    function: 'Starts a 3-phase induction motor by connecting it directly to the supply. Simple but draws high inrush current (6–8× FLA) on start.',
    standard: 'IEC 60947-4-1',
    wiring: 'L1/L2/L3 → contactor → U/V/W  |  Overload relay in series',
    tesda: 'NC III — Install and maintain motor control systems',
  },
  'scada-terminal': {
    name: 'SCADA / HMI Terminal',
    iecSymbol: '[HMI]',
    function: 'Supervisory Control and Data Acquisition display. Monitors real-time plant data, alarms, and allows remote control of field devices.',
    standard: 'IEC 61511 (functional safety)  |  ISA-101 (HMI design)',
    wiring: 'RS-485 / Ethernet to PLC  |  24 VDC power supply',
    tesda: 'NC III — Operate SCADA systems',
  },
  'tool-pickup': {
    name: 'Tool Rack',
    iecSymbol: '[TOOLS]',
    function: 'Stores hand tools used during installation and maintenance. Always return tools after use and inspect for damage before use.',
    standard: 'PinoyTek CBLM — Work safely with electricity',
    wiring: '—',
    tesda: 'NC II — Use hand tools',
  },
  'whiteboard': {
    name: 'Training Module Whiteboard',
    iecSymbol: '[BOARD]',
    function: 'Displays the current module objectives, schematic overview, and safety reminders for the day\'s practical session.',
    standard: 'PinoyTek Training Regulations — NC II (ELC722301)',
    wiring: '—',
    tesda: 'NC II — Participate in workplace communication',
  },
  'cable-station': {
    name: 'Cable Termination Station',
    iecSymbol: '─[⊞]─',
    function: 'Workstation for preparing, routing, and terminating cables. Includes cable tray, gland plates, and labelling supplies.',
    standard: 'IEC 60364-5-52 (cable selection)  |  IEC 60445 (marking)',
    wiring: 'Strip → terminate → torque → label → verify',
    tesda: 'NC II — Install cable containment and conductors',
  },
  'oscilloscope': {
    name: 'Digital Oscilloscope',
    iecSymbol: '[≈OSC≈]',
    function: 'Displays voltage waveforms vs. time. Used to verify frequency, amplitude, phase, and wave shape of AC circuits.',
    standard: 'IEC 61010-1 CAT II',
    wiring: 'Probe ground → circuit ground  |  Probe tip → test point',
    tesda: 'NC III — Perform advanced measurements',
  },
  'door': {
    name: 'Fire-Rated Door / Access Door',
    iecSymbol: '─[D]─',
    function: 'Controls access between zones. Electrical rooms require self-closing fire-rated doors (min 1 hr) per the Philippine Fire Code.',
    standard: 'RA 9514 (Fire Code)  |  PEC Part 2 Art. 450',
    wiring: '—',
    tesda: '—',
  },
};

// ── ORIENTATION CARD CONTENT  (shown when player reads the classroom whiteboard) ──
export const ORIENTATION_CARD = {
  title: 'MODULE 1 — ORIENTATION',
  subtitle: 'PinoyTek NC II  |  Basic Electrical Installation',
  sections: [
    {
      heading: 'Today\'s Objectives',
      items: [
        'Identify and describe standard electrical components (IEC standards)',
        'Demonstrate correct use of PPE and LOTO procedures',
        'Read and interpret a basic wiring schematic',
        'Wire a simple single-phase panel (L, N, PE) with correct color coding',
        'Test and validate the completed circuit using a DMM',
      ],
    },
    {
      heading: 'Key Standards',
      items: [
        'IEC 60446 — Wire color identification',
        'IEC 60898-1 — Circuit breaker rating and testing',
        'IEC 60228 — Conductor cross-sections',
        'OSHS Rule 1080 — Philippine Electrical Safety',
        'PinoyTek TR ELC722301 — NC II competencies',
      ],
    },
    {
      heading: 'Grading',
      items: [
        '30% — Safety & PPE compliance',
        '40% — Correct wiring and termination',
        '30% — Circuit test & validation',
        'Minimum 75% to qualify for NC II practical assessment',
      ],
    },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// SAFETY BRIEFING MODAL
// ══════════════════════════════════════════════════════════════════════════════
let _safetyReady = false;
let _safetyCallback = null;

export function initSafetyBriefing(onComplete) {
  if (_safetyReady) { onComplete?.(); return; }
  _safetyCallback = onComplete;

  const modal = document.getElementById('safetyBriefing');
  if (!modal) { onComplete?.(); return; }

  // Build rule checklist
  const list = modal.querySelector('#safetyRuleList');
  if (list) {
    list.innerHTML = '';
    SAFETY_RULES.forEach((rule, i) => {
      const item = document.createElement('label');
      item.className = 'safety-rule-item';
      item.innerHTML = `
        <input type="checkbox" class="safety-chk" data-idx="${i}">
        <span class="safety-rule-body">
          <span class="safety-rule-icon">${rule.icon}</span>
          <span class="safety-rule-text">
            <strong class="safety-rule-title">${rule.title}</strong>
            <span class="safety-rule-desc">${rule.desc}</span>
          </span>
        </span>`;
      list.appendChild(item);
    });
  }

  // Wire checkboxes → enable/disable proceed button
  const btn = modal.querySelector('#btnSafetyProceed');
  const updateBtn = () => {
    const all = modal.querySelectorAll('.safety-chk');
    const allChecked = [...all].every(c => c.checked);
    if (btn) {
      btn.disabled = !allChecked;
      btn.classList.toggle('safety-btn-ready', allChecked);
      btn.textContent = allChecked ? 'I UNDERSTAND — BEGIN TRAINING' : 'CHECK ALL RULES TO PROCEED';
    }
  };
  modal.addEventListener('change', e => {
    // JS fallback for :has() on older WebViews
    const chk = e.target;
    if (chk.classList.contains('safety-chk')) {
      chk.closest('.safety-rule-item')?.classList.toggle('rule-checked', chk.checked);
    }
    updateBtn();
  });

  if (btn) {
    btn.addEventListener('click', () => {
      _safetyReady = true;
      modal.style.display = 'none';
      setTutorialPhase(0);
      _safetyCallback?.();
    });
  }

  modal.style.display = 'flex';
  document.exitPointerLock?.();
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT INSPECTOR  —  shows PinoyTek info card for any interactable
// ══════════════════════════════════════════════════════════════════════════════
let _inspectorTimeout = null;

export function showComponentInfo(userData) {
  const type = userData?.type;
  const info = COMPONENT_LIBRARY[type];
  if (!info) return false;

  const card = document.getElementById('compInspector');
  if (!card) return false;

  card.querySelector('#ciName').textContent     = info.name;
  card.querySelector('#ciSymbol').textContent   = info.iecSymbol;
  card.querySelector('#ciFunction').textContent = info.function;
  card.querySelector('#ciStandard').textContent = info.standard;
  card.querySelector('#ciWiring').textContent   = info.wiring;
  card.querySelector('#ciTesda').textContent    = info.tesda;

  card.classList.add('ci-visible');
  clearTimeout(_inspectorTimeout);
  _inspectorTimeout = setTimeout(() => hideComponentInfo(), 8000);
  return true;
}

export function hideComponentInfo() {
  document.getElementById('compInspector')?.classList.remove('ci-visible');
}

// ══════════════════════════════════════════════════════════════════════════════
// TUTORIAL PHASE BAR
// ══════════════════════════════════════════════════════════════════════════════
export function setTutorialPhase(phaseIndex) {
  _currentPhase = phaseIndex;
  const bar = document.getElementById('tutPhaseBar');
  if (!bar) return;
  bar.querySelectorAll('.tph-step').forEach((el, i) => {
    el.classList.toggle('tph-active',   i === phaseIndex);
    el.classList.toggle('tph-done',     i < phaseIndex);
    el.classList.toggle('tph-upcoming', i > phaseIndex);
  });
  bar.style.display = 'flex';
}

export function hideTutorialPhase() {
  const bar = document.getElementById('tutPhaseBar');
  if (bar) bar.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════════════════
// ORIENTATION CARD  —  shown when player reads the classroom whiteboard
// ══════════════════════════════════════════════════════════════════════════════
export function showOrientationCard() {
  const modal = document.getElementById('orientationCard');
  if (!modal) return;

  const contentEl = modal.querySelector('#orientCardContent');
  if (contentEl) {
    contentEl.innerHTML = ORIENTATION_CARD.sections.map(sec => `
      <div class="oc-section">
        <div class="oc-section-title">${sec.heading}</div>
        <ul class="oc-list">
          ${sec.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>`).join('');
  }

  modal.style.display = 'flex';
  document.exitPointerLock?.();
}

export function hideOrientationCard() {
  document.getElementById('orientationCard')?.style && (document.getElementById('orientationCard').style.display = 'none');
}

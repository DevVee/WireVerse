// ══════════════════════════════════════════════════════════════════════════════
// TUTORIAL GUIDE  —  ElectroTech Sim
// Per-level step-by-step onboarding. Sir Juan guides the player through
// every control with animated pointers.  Mobile-first dialogue.
// Hide-on-action: panel slides away while player performs → comes back when done.
// ══════════════════════════════════════════════════════════════════════════════

// ── STATE ─────────────────────────────────────────────────────────────────────
let _currentStep   = 0;
let _tutActive     = false;
let _tutComplete   = false;
let _tickInterval  = null;
let _stepStartTime = 0;
let _typingTimer   = null;
let _ptrTimer      = null;
let _actionPending = false;   // true while panel is hidden waiting for action
let _tutKey        = 'et_tutorial_done';  // overridden per-level

let _getPlayerPos  = null;  // () => { x, z, yaw }
let _activeSteps   = [];    // set at init time from level

const _isMobile = () => window.innerWidth <= 1024 || 'ontouchstart' in window;

// ── PER-LEVEL STEP ARRAYS ─────────────────────────────────────────────────────
// Fields:
//   dialogue     — what Sir Juan says (\n for newlines)
//   action       — 'none' | 'move' | 'look' | 'reach' | 'interact' | 'done'
//   moveTarget   — { x, z } world coords (action: 'move')
//   reachTarget  — { x, z, radius } world coords (action: 'reach')
//   direction    — compass arrow: 'north' | 'south' | 'east' | 'west' | null
//   highlight    — CSS selector(s) to add pulsing glow (comma-separated)
//   pointer      — CSS selector of element to place pointer arrow on
//   tip          — small hint below dialogue
//   nextBtn      — show NEXT button (manual advance)
//   waitForInteract — advance when USE button is tapped
//   waitForTask     — advance when task panel is opened
//   lookThreshold   — radians of yaw change needed (action: 'look')
//   hideOnAction    — hide panel while player performs; restore when done
//   actionHint      — text shown in #tutActionBar while hidden

// ── STAGE 1 / LEVEL 1 — Full intro (all controls) ────────────────────────────
const STEPS_1_1 = [

  // 0: Welcome
  {
    dialogue: "Magandang umaga! I'm Sir Juan, your PinoyTek trainer.\n\nWelcome to the ElectroTech Training Facility! I'll walk you through every control — step by step.\n\nLet's get started!",
    action: 'none',
    highlight: null,
    pointer: null,
    tip: 'Tap NEXT to begin your orientation.',
    nextBtn: true,
  },

  // 1: Joystick intro
  {
    dialogue: "This is your JOYSTICK — bottom-left corner.\n\nPush it in any direction to move around the facility. Forward, back, left, right.",
    action: 'none',
    highlight: '#joyOuter',
    pointer: '#joyOuter',
    tip: 'Joystick = your legs in this world',
    nextBtn: true,
  },

  // 2: Move task (hide while doing)
  {
    dialogue: "Let's try it! Push the joystick UP to walk forward into the facility.\n\nI'll step aside — go ahead and walk in!",
    action: 'move',
    moveTarget: { x: 0, z: -2 },
    direction: 'north',
    highlight: '#joyOuter',
    pointer: '#joyOuter',
    tip: 'Walk north — into the building!',
    nextBtn: false,
    hideOnAction: true,
    actionHint: 'WALK FORWARD — PUSH JOYSTICK UP',
  },

  // 3: Look around intro
  {
    dialogue: "Great move!\n\nNow let's look around. SWIPE your finger on the RIGHT SIDE of the screen to rotate the camera left and right.",
    action: 'none',
    highlight: null,
    pointer: null,
    tip: 'Swipe right half of screen to rotate view',
    nextBtn: true,
  },

  // 4: Look task (hide while doing)
  {
    dialogue: "Practice it! Swipe left then right on the right side of the screen.\n\nThis is how you aim at objects to interact with them.",
    action: 'look',
    lookThreshold: 0.9,
    direction: null,
    highlight: null,
    pointer: null,
    tip: 'Swipe the right side of the screen',
    nextBtn: false,
    hideOnAction: true,
    actionHint: 'SWIPE RIGHT SIDE TO LOOK AROUND',
  },

  // 5: Jump button
  {
    dialogue: "See the JUMP button at the bottom-right?\n\nTap it to jump over obstacles and ledges.",
    action: 'none',
    highlight: '#btnJump',
    pointer: '#btnJump',
    tip: 'JUMP button — bottom-right corner',
    nextBtn: true,
  },

  // 6: Tasks button
  {
    dialogue: "This is the STAR HUD!\n\nIt shows your current level stars. Tap it to open your TASK PANEL to see what you need to do.",
    action: 'none',
    highlight: '#starHUD',
    pointer: '#starHUD',
    tip: 'STAR HUD — top-center area',
    nextBtn: true,
  },

  // 7: Open task panel (hide while doing)
  {
    dialogue: "Open your task list now! Tap the STAR HUD.\n\nI'll wait right here.",
    action: 'none',
    highlight: '#starHUD',
    pointer: '#starHUD',
    tip: 'Open the task panel!',
    nextBtn: false,
    waitForTask: true,
    hideOnAction: true,
    actionHint: 'TAP THE STAR HUD',
  },

  // 8: Task panel explanation
  {
    dialogue: "This is your TASK PANEL!\n\nEach task shows:\n- A badge: done, active, or pending\n- Task name and location\n\nComplete all tasks to earn STARS and unlock new levels!",
    action: 'none',
    highlight: '#taskPanel',
    pointer: null,
    tip: 'Tap any task to activate it',
    nextBtn: true,
  },

  // 9: Interact / USE button
  {
    dialogue: "The most important button — USE!\n\nTap the yellow USE button to fix outlets, flip switches, open panels — everything!\n\nAlways face the object first, then tap USE.",
    action: 'none',
    highlight: '#btnInteract',
    pointer: '#btnInteract',
    tip: 'Yellow USE button — bottom right',
    nextBtn: true,
  },

  // 10: Walk to panel (hide while doing)
  {
    dialogue: "Walk north toward the MAIN PANEL at the end of the room.\n\nWhen you're close enough, a blue prompt will appear — that means something is in range!",
    action: 'reach',
    reachTarget: { x: 0, z: -6, radius: 4.0 },
    direction: 'north',
    highlight: '#btnInteract',
    pointer: '#btnInteract',
    tip: 'Walk north toward the panel',
    nextBtn: false,
    hideOnAction: true,
    actionHint: 'WALK NORTH — TOWARD THE PANEL',
  },

  // 11: Press interact (hide while doing)
  {
    dialogue: "You're in range! Tap the yellow USE button to interact with the panel.\n\nAim at it first, then tap!",
    action: 'interact',
    highlight: '#btnInteract',
    pointer: '#btnInteract',
    tip: 'Aim at panel → tap USE',
    nextBtn: false,
    waitForInteract: true,
    hideOnAction: true,
    actionHint: 'AIM AT THE PANEL — TAP USE',
  },

  // 12: Component card
  {
    dialogue: "A COMPONENT CARD appeared!\n\nEach card shows:\n- Component name and symbol\n- Function and wiring guide\n- IEC / PEC standards\n\nAlways read these — they ARE your training material!",
    action: 'none',
    highlight: '#compInspector',
    pointer: null,
    tip: 'Cards close automatically after a few seconds',
    nextBtn: true,
  },

  // 13: Minimap
  {
    dialogue: "See the MINIMAP at the top-left?\n\nThe blue dot is YOU. Task markers and interactables appear on the map.\n\nTap the minimap to zoom in for a bigger view!",
    action: 'none',
    highlight: '#minimap',
    pointer: '#minimap',
    tip: 'Tap minimap to zoom in/out',
    nextBtn: true,
  },

  // 14: Broken outlets mission
  {
    dialogue: "Your main mission: find and fix BROKEN OUTLETS!\n\nLook for the RED GLOW and the FAULT label on walls. Walk close, then tap USE to start the repair mini-game.\n\nYellow arrows on the floor show where to stand.",
    action: 'none',
    highlight: null,
    pointer: null,
    tip: 'Red glow = broken outlet. Fix them all!',
    nextBtn: true,
  },

  // 15: Done
  {
    dialogue: "You're ready, trainee!\n\nQUICK SUMMARY:\nMOVE — Joystick\nLOOK — Swipe right side\nJUMP — JUMP button\nINTERACT — USE button\nTASKS — Tap Star HUD\n\nSafety first! De-energize before you work. Good luck!",
    action: 'done',
    highlight: null,
    pointer: null,
    tip: 'Remember: LOTO — Lockout/Tagout before every job!',
    nextBtn: true,
  },
];

// ── STAGE 1 / LEVEL 2 — Focused on tasks + interact ──────────────────────────
const STEPS_1_2 = [

  // 0: Welcome back
  {
    dialogue: "Welcome back, trainee!\n\nLevel 2 is a bigger challenge. More broken outlets, more ground to cover.\n\nYou know the basics — let's talk about what's new here.",
    action: 'none',
    highlight: null,
    pointer: null,
    tip: 'Tap NEXT to continue.',
    nextBtn: true,
  },

  // 1: Check your tasks first
  {
    dialogue: "First thing — ALWAYS check your task list before starting!\n\nTap your STAR HUD to open the TASKS panel to see what needs to be done in this level.",
    action: 'none',
    highlight: '#starHUD',
    pointer: '#starHUD',
    tip: 'Tap STAR HUD to see your objectives',
    nextBtn: false,
    waitForTask: true,
    hideOnAction: true,
    actionHint: 'OPEN YOUR TASK PANEL NOW',
  },

  // 2: Multiple outlets
  {
    dialogue: "This level has MULTIPLE broken outlets spread across the facility.\n\nUse the MINIMAP to find them — orange dots mark fault locations.\n\nTap the minimap to zoom in for a better view.",
    action: 'none',
    highlight: '#minimap',
    pointer: '#minimap',
    tip: 'Orange dots on minimap = broken outlets',
    nextBtn: true,
  },

  // 3: Walk to first outlet area
  {
    dialogue: "Let's get moving! Walk toward the nearest fault marker.\n\nI'll wait here.",
    action: 'reach',
    reachTarget: { x: 0, z: -4, radius: 5.0 },
    direction: 'north',
    highlight: null,
    pointer: null,
    tip: 'Find the nearest outlet fault',
    nextBtn: false,
    hideOnAction: true,
    actionHint: 'WALK TOWARD THE FAULT MARKER',
  },

  // 4: Go!
  {
    dialogue: "Good! You know where to go.\n\nFind every broken outlet, complete each repair, and earn your STARS!\n\nGood luck, trainee — I'll be watching!",
    action: 'done',
    highlight: null,
    pointer: null,
    tip: 'Complete all repairs to earn 3 stars!',
    nextBtn: true,
  },
];

// ── STAGE 1 / LEVEL 3 — Brief reminder ───────────────────────────────────────
const STEPS_1_3 = [

  // 0: Brief intro
  {
    dialogue: "Level 3 — the hardest yet!\n\nThis time you'll face SWITCH WIRING tasks too, not just outlet repairs.\n\nLook for the SWITCH PANELS on the walls.",
    action: 'none',
    highlight: null,
    pointer: null,
    tip: 'Tap NEXT to go.',
    nextBtn: true,
  },

  // 1: Switch panels
  {
    dialogue: "Switch panels have a BLUE INDICATOR light.\n\nWalk up to one, tap USE, and wire the switch circuit correctly.\n\nThe mini-game will show you the terminals — drag wires to connect them.",
    action: 'none',
    highlight: null,
    pointer: null,
    tip: 'Blue indicator = switch panel',
    nextBtn: true,
  },

  // 2: Done
  {
    dialogue: "All controls are the same as before:\n\nJoystick to move, swipe right to look, USE to interact.\n\nCheck your TASKS panel and get to work. You've got this!",
    action: 'done',
    highlight: null,
    pointer: null,
    tip: 'LOTO — safety first always!',
    nextBtn: true,
  },
];

// ── STEP MAP — keyed by "stageId_levelId" ────────────────────────────────────
const STEPS_MAP = {
  '1_1': STEPS_1_1,
  '1_2': STEPS_1_2,
  '1_3': STEPS_1_3,
};

function _getSteps(stageId, levelId) {
  const key = `${stageId}_${levelId}`;
  // First level of any new stage gets the full tutorial
  if (STEPS_MAP[key]) return STEPS_MAP[key];
  // levelId 1 of unknown stage → full intro
  if (levelId === 1) return STEPS_1_1;
  // levelId 2 → medium
  if (levelId === 2) return STEPS_1_2;
  // levelId 3+ → brief
  return STEPS_1_3;
}

// ── DOM REFS ──────────────────────────────────────────────────────────────────
let elPanel     = null;
let elAvatar    = null;
let elName      = null;
let elDialog    = null;
let elTip       = null;
let elNext      = null;
let elSkip      = null;
let elArrow     = null;
let elProgress  = null;
let elDots      = null;
let elPointer   = null;
let elActionBar = null;

// ── INIT ──────────────────────────────────────────────────────────────────────
export function initTutorial(getPlayerStateFn, stageId, levelId) {
  const sid = stageId || 1;
  const lid = levelId || 1;
  _tutKey = `et_tut_${sid}_${lid}_done`;

  if (localStorage.getItem(_tutKey) === '1') return;

  _getPlayerPos = getPlayerStateFn;
  _activeSteps  = _getSteps(sid, lid);

  elPanel     = document.getElementById('tutInstructor');
  elAvatar    = document.getElementById('tutAvatar');
  elName      = document.getElementById('tutInstructorName');
  elDialog    = document.getElementById('tutDialogue');
  elTip       = document.getElementById('tutTip');
  elNext      = document.getElementById('tutNextBtn');
  elSkip      = document.getElementById('tutSkipBtn');
  elArrow     = document.getElementById('tutArrow');
  elProgress  = document.getElementById('tutProgress');
  elDots      = document.getElementById('tutDots');
  elPointer   = document.getElementById('tutPointer');
  elActionBar = document.getElementById('tutActionBar');

  if (!elPanel) { console.warn('[Tutorial] DOM not found — skipping'); return; }

  if (elNext) elNext.addEventListener('click', _handleNext);
  if (elSkip) elSkip.addEventListener('click', _skipTutorial);

  document.addEventListener('keydown', _onKeyDown);

  const interactBtn = document.getElementById('btnInteract');
  if (interactBtn) {
    interactBtn.addEventListener('touchstart', _onInteractBtn, { passive: true });
    interactBtn.addEventListener('click', _onInteractBtn);
  }

  const tasksBtn = document.getElementById('btnTopTasks');
  if (tasksBtn) tasksBtn.addEventListener('click', _onTasksOpen);
  const mobileTasksBtn = document.getElementById('btnMobileTasks');
  if (mobileTasksBtn) mobileTasksBtn.addEventListener('click', _onTasksOpen);
  const starTasksBtn = document.getElementById('btnStarTasks');
  if (starTasksBtn) starTasksBtn.addEventListener('click', _onTasksOpen);

  _tutActive   = true;
  _tutComplete = false;
  _currentStep = 0;
  _actionPending = false;
  _goToStep(0);

  _tickInterval = setInterval(_tick, 300);
}

// ── SKIP / END ────────────────────────────────────────────────────────────────
function _skipTutorial() { _endTutorial(); }

function _endTutorial() {
  _tutActive = false;
  _tutComplete = true;
  _actionPending = false;
  clearInterval(_tickInterval);
  clearTimeout(_typingTimer);
  clearTimeout(_ptrTimer);
  localStorage.setItem(_tutKey, '1');
  _hideActionBar();
  if (elPanel) {
    elPanel.classList.remove('tut-away', 'tut-back');
    elPanel.classList.add('tut-exit');
    setTimeout(() => { if (elPanel) elPanel.style.display = 'none'; }, 600);
  }
  if (elArrow) elArrow.style.display = 'none';
  if (elPointer) elPointer.style.display = 'none';
  _clearHighlights();
}

// ── STEP NAVIGATION ───────────────────────────────────────────────────────────
function _goToStep(idx) {
  if (idx >= _activeSteps.length) { _endTutorial(); return; }
  _currentStep   = idx;
  _stepStartTime = Date.now();
  _actionPending = false;

  const step = _activeSteps[idx];
  if (!elPanel) return;

  // Restore panel if it was hidden
  _hideActionBar();
  elPanel.classList.remove('tut-away', 'tut-exit');
  elPanel.classList.add('tut-back');
  elPanel.style.display = 'flex';
  // Remove tut-back after animation so it doesn't interfere
  setTimeout(() => { if (elPanel) elPanel.classList.remove('tut-back'); }, 400);

  // Progress bar
  const pct = Math.round((idx / (_activeSteps.length - 1)) * 100);
  if (elProgress) elProgress.style.width = pct + '%';

  _renderDots(idx);
  _typeText(step.dialogue, step);

  if (elTip) elTip.textContent = step.tip || '';

  // Hide next btn initially; shown after typing finishes (or immediately if no hideOnAction)
  if (elNext) {
    const showNext = (step.nextBtn || step.action === 'done') && !step.hideOnAction;
    elNext.style.display = showNext ? 'flex' : 'none';
    elNext.textContent = step.action === 'done' ? 'START TRAINING' : 'NEXT';
  }

  _setArrow(step.direction || null);
  _clearHighlights();
  if (step.highlight) _applyHighlight(step.highlight);

  _clearPointer();
  if (step.pointer) {
    _ptrTimer = setTimeout(() => _positionPointer(step.pointer), 80);
  }

  if (elAvatar) {
    elAvatar.classList.remove('tut-avatar-talk');
    void elAvatar.offsetWidth;
    elAvatar.classList.add('tut-avatar-talk');
  }
}

function _handleNext() {
  const step = _activeSteps[_currentStep];
  if (!step) return;
  if (step.action === 'done') { _endTutorial(); return; }
  _goToStep(_currentStep + 1);
}

// ── HIDE / SHOW PANEL FOR ACTION ─────────────────────────────────────────────
function _hidePanel(hint) {
  if (!elPanel || _actionPending) return;
  _actionPending = true;
  elPanel.classList.remove('tut-back');
  elPanel.classList.add('tut-away');
  _clearPointer();
  setTimeout(() => {
    if (elPanel && elPanel.classList.contains('tut-away')) {
      elPanel.style.display = 'none';
    }
  }, 380);
  _showActionBar(hint || 'TRY IT NOW!');
}

function _showActionBar(text) {
  if (!elActionBar) return;
  elActionBar.textContent = text;
  elActionBar.style.display = 'block';
}

function _hideActionBar() {
  if (!elActionBar) return;
  elActionBar.style.display = 'none';
}

// ── DIALOGUE TYPING EFFECT ────────────────────────────────────────────────────
function _typeText(text, step) {
  if (!elDialog) return;
  clearTimeout(_typingTimer);
  elDialog.textContent = '';
  const chars = text.replace(/\\n/g, '\n').split('');
  let i = 0;
  function type() {
    if (i < chars.length) {
      const ch = chars[i++];
      elDialog.textContent += ch;
      const delay = ch === '\n' ? 120 : (ch === '.' || ch === '!' || ch === '?') ? 80 : 22;
      _typingTimer = setTimeout(type, delay);
    } else {
      // Typing finished
      if (step?.nextBtn && elNext && !step.hideOnAction) {
        elNext.style.display = 'flex';
      }
      // Hide panel after typing if this step needs player action
      if (step?.hideOnAction) {
        setTimeout(() => {
          if (_tutActive && !_tutComplete) {
            _hidePanel(step.actionHint);
          }
        }, 800);
      }
    }
  }
  type();
}

// ── COMPASS ARROW ─────────────────────────────────────────────────────────────
function _setArrow(direction) {
  if (!elArrow) return;
  if (!direction) { elArrow.style.display = 'none'; elArrow.className = ''; return; }
  const arrows = { north: '↑', south: '↓', east: '→', west: '←' };
  const label  = { north: 'GO NORTH', south: 'GO SOUTH', east: 'GO EAST', west: 'GO WEST' };
  elArrow.style.display = 'flex';
  elArrow.className = 'dir-' + direction;
  const iconEl  = elArrow.querySelector('.tut-arrow-icon');
  const labelEl = elArrow.querySelector('.tut-arrow-label');
  if (iconEl)  iconEl.textContent  = arrows[direction] || '↑';
  if (labelEl) labelEl.textContent = label[direction]  || 'GO';
}

// ── HIGHLIGHT ─────────────────────────────────────────────────────────────────
function _applyHighlight(selector) {
  selector.split(',').forEach(sel => {
    const el = document.querySelector(sel.trim());
    if (el) el.classList.add('tut-highlight');
  });
}
function _clearHighlights() {
  document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
}

// ── POINTER POSITIONING ───────────────────────────────────────────────────────
function _positionPointer(selector) {
  if (!elPointer) return;
  const el = document.querySelector(selector.trim());
  if (!el) { elPointer.style.display = 'none'; return; }

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) { elPointer.style.display = 'none'; return; }

  const cx = rect.left + rect.width / 2;
  let top, arrowChar;
  if (rect.top > 80) {
    top = rect.top - 58;
    arrowChar = '▼';
  } else {
    top = rect.bottom + 8;
    arrowChar = '▲';
  }

  const ptrW = 70;
  const left = Math.max(8, Math.min(window.innerWidth - ptrW - 8, cx - ptrW / 2));

  elPointer.style.left = left + 'px';
  elPointer.style.top  = top  + 'px';
  elPointer.style.display = 'flex';

  const bounceEl = elPointer.querySelector('.tut-ptr-bounce');
  const labelEl  = elPointer.querySelector('.tut-ptr-label');
  if (bounceEl) bounceEl.textContent = arrowChar;
  if (labelEl)  labelEl.textContent  = 'TAP HERE';
}

function _clearPointer() {
  clearTimeout(_ptrTimer);
  if (elPointer) elPointer.style.display = 'none';
}

// ── PROGRESS DOTS ─────────────────────────────────────────────────────────────
function _renderDots(activeIdx) {
  if (!elDots) return;
  const total = Math.min(_activeSteps.length, 12);
  elDots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'tut-dot' + (i === activeIdx ? ' tut-dot-active' : i < activeIdx ? ' tut-dot-done' : '');
    elDots.appendChild(d);
  }
}

// ── POLLING TICK ──────────────────────────────────────────────────────────────
let _prevYaw = null;
let _totalYawChange = 0;

function _tick() {
  if (!_tutActive || _tutComplete) return;
  const step = _activeSteps[_currentStep];
  if (!step) return;

  // If waiting for action and panel is hidden, check for completion
  if (step.action === 'none' && !step.waitForTask && !step.waitForInteract) return;
  if (step.nextBtn && !_actionPending) return;  // manual advance, nothing to tick

  const state = _getPlayerPos?.();
  if (!state) return;

  // Move task — player must reach target position
  if (step.action === 'move' && step.moveTarget) {
    const dx = state.x - step.moveTarget.x;
    const dz = state.z - step.moveTarget.z;
    if (Math.sqrt(dx * dx + dz * dz) < 3.5) _advanceAfterAction();
    return;
  }

  // Reach task — player must get within radius of target
  if (step.action === 'reach' && step.reachTarget) {
    const dx = state.x - step.reachTarget.x;
    const dz = state.z - step.reachTarget.z;
    const r  = step.reachTarget.radius || 3.5;
    if (Math.sqrt(dx * dx + dz * dz) < r) _advanceAfterAction();
    return;
  }

  // Look task — player must rotate enough
  if (step.action === 'look') {
    if (_prevYaw === null) { _prevYaw = state.yaw; return; }
    const delta = Math.abs(state.yaw - _prevYaw);
    _totalYawChange += delta;
    _prevYaw = state.yaw;
    if (_totalYawChange >= (step.lookThreshold || 0.9)) {
      _totalYawChange = 0; _prevYaw = null;
      _advanceAfterAction();
    }
  }
}

function _advanceAfterAction() {
  if (!_tutActive || _tutComplete) return;
  _actionPending = false;
  // Small delay so player feels the action registered
  setTimeout(() => _goToStep(_currentStep + 1), 500);
}

// ── KEY / BUTTON HANDLERS ─────────────────────────────────────────────────────
function _onKeyDown(e) {
  if (!_tutActive || _tutComplete) return;
  const step = _activeSteps[_currentStep];
  if (!step) return;
  if (e.code === 'KeyE' && step.waitForInteract) {
    _actionPending = false;
    setTimeout(() => _goToStep(_currentStep + 1), 600);
  }
  if (e.code === 'KeyT' && step.waitForTask) {
    _actionPending = false;
    setTimeout(() => _goToStep(_currentStep + 1), 400);
  }
}

function _onInteractBtn() {
  if (!_tutActive || _tutComplete) return;
  const step = _activeSteps[_currentStep];
  if (step?.waitForInteract) {
    _actionPending = false;
    setTimeout(() => _goToStep(_currentStep + 1), 600);
  }
}

function _onTasksOpen() {
  if (!_tutActive || _tutComplete) return;
  const step = _activeSteps[_currentStep];
  if (step?.waitForTask) {
    _actionPending = false;
    setTimeout(() => _goToStep(_currentStep + 1), 400);
  }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function tutorialOnInteract() {
  if (!_tutActive || _tutComplete) return;
  const step = _activeSteps[_currentStep];
  if (step?.waitForInteract) {
    _actionPending = false;
    setTimeout(() => _goToStep(_currentStep + 1), 600);
  }
}

export function tutorialOnTaskOpen() {
  if (!_tutActive || _tutComplete) return;
  const step = _activeSteps[_currentStep];
  if (step?.waitForTask) {
    _actionPending = false;
    setTimeout(() => _goToStep(_currentStep + 1), 400);
  }
}

export function isTutorialActive() { return _tutActive && !_tutComplete; }


// ══════════════════════════════════════════════════════════════════════════════
// OUTLET SCENARIO MINI-TUTORIAL
// ══════════════════════════════════════════════════════════════════════════════

const OUTLET_STEPS = [
  {
    text: "Welcome to OUTLET REPAIR!\n\nYou'll wire this broken socket correctly. Follow each step carefully — this is real electrical work!",
    target: null,
    btnLabel: 'GOT IT',
  },
  {
    text: "STEP 1 — BREAKER IS ON.\nBefore touching any wiring, you MUST switch the breaker OFF for safety.\n\nTap the BREAKER PANEL on the left.",
    target: 'breaker',
    btnLabel: null,
  },
  {
    text: "STEP 2 — REMOVE THE SCREW.\nSelect the SCREWDRIVER tool, then tap the center screw to remove it.",
    target: 'screw',
    btnLabel: null,
  },
  {
    text: "STEP 3 — OPEN THE FACEPLATE.\nTap the outlet cover to swing it open and expose the wiring terminals.",
    target: 'cover',
    btnLabel: null,
  },
  {
    text: "STEP 4 — WIRE THE TERMINALS.\nDrag each wire to its matching terminal:\n\n BROWN = Live (L)\n BLUE = Neutral (N)\n GREEN/YELLOW = Earth (PE)",
    target: 'wires',
    btnLabel: null,
  },
  {
    text: "STEP 5 — CLOSE AND RESCREW.\nClose the faceplate, then screw it back in place.",
    target: 'cover',
    btnLabel: null,
  },
  {
    text: "STEP 6 — RESTORE POWER.\nFlip the breaker back ON. Then test the outlet with the MULTIMETER.",
    target: 'breaker',
    btnLabel: null,
  },
  {
    text: "Outlet repaired! Great work.\n\nRemember: always de-energize first, wire correctly, test before done.",
    target: null,
    btnLabel: 'FINISH',
  },
];

let _outletTutStep = -1;
let _outletTutEl   = null;
let _outletTutDone = false;

export function initOutletTutorial() {
  if (localStorage.getItem('et_outlet_tut_done') === '1') return;
  _outletTutDone = false;

  if (!_outletTutEl) {
    _outletTutEl = document.createElement('div');
    _outletTutEl.id = 'outletTutBubble';
    _outletTutEl.style.cssText = [
      'position:absolute', 'bottom:100px', 'left:50%', 'transform:translateX(-50%)',
      'max-width:300px', 'width:88vw',
      'background:linear-gradient(135deg,#0a1628 0%,#060e1a 100%)',
      'border:2px solid rgba(255,215,0,0.6)',
      'border-radius:14px', 'padding:16px 18px 14px',
      'z-index:9999', 'pointer-events:auto',
      'box-shadow:0 8px 40px rgba(0,0,0,0.7),0 0 30px rgba(255,200,0,0.1)',
      'font-family:\'Courier New\',monospace', 'color:#e0d0b0',
      'font-size:12px', 'line-height:1.6',
      'display:none',
    ].join(';');

    _outletTutEl.innerHTML = `
      <div style="font-family:'Bebas Neue',cursive;font-size:15px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">
        SIR JUAN
      </div>
      <div id="otb-text" style="white-space:pre-line;min-height:60px;"></div>
      <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px;">
        <button id="otb-skip" style="
          background:transparent;border:1px solid rgba(255,100,100,0.4);border-radius:6px;
          color:rgba(255,120,120,0.7);font-family:'Bebas Neue',cursive;font-size:11px;
          letter-spacing:1px;padding:4px 10px;cursor:pointer;">SKIP</button>
        <button id="otb-next" style="
          display:none;
          background:linear-gradient(135deg,#F4A623,#e09600);border:none;border-radius:6px;
          color:#0a0800;font-family:'Bebas Neue',cursive;font-size:13px;
          letter-spacing:2px;padding:6px 18px;cursor:pointer;"></button>
      </div>`;

    const overlay = document.getElementById('outletRepairOverlay');
    if (overlay) overlay.appendChild(_outletTutEl);
  }

  const skipBtn = _outletTutEl.querySelector('#otb-skip');
  const nextBtn = _outletTutEl.querySelector('#otb-next');
  if (skipBtn) skipBtn.onclick = _outletTutSkip;
  if (nextBtn) nextBtn.onclick = _outletTutNext;

  _outletTutStep = 0;
  _showOutletTutStep(0);
}

function _showOutletTutStep(idx) {
  if (!_outletTutEl) return;
  if (idx >= OUTLET_STEPS.length) { _outletTutEnd(); return; }
  _outletTutStep = idx;

  const step = OUTLET_STEPS[idx];
  const textEl = _outletTutEl.querySelector('#otb-text');
  const nextBtn = _outletTutEl.querySelector('#otb-next');
  if (textEl)  textEl.textContent = step.text;
  if (nextBtn) {
    nextBtn.style.display = step.btnLabel ? 'block' : 'none';
    if (step.btnLabel) nextBtn.textContent = step.btnLabel;
  }
  _outletTutEl.style.display = 'block';
}

function _outletTutNext() { _showOutletTutStep(_outletTutStep + 1); }
function _outletTutSkip() { _outletTutEnd(); }

function _outletTutEnd() {
  _outletTutDone = true;
  if (_outletTutEl) _outletTutEl.style.display = 'none';
  localStorage.setItem('et_outlet_tut_done', '1');
}

export function outletTutOnStateChange(newState) {
  if (_outletTutDone || _outletTutStep < 0) return;
  const step = OUTLET_STEPS[_outletTutStep];
  if (!step || step.btnLabel) return;

  const advance = {
    'screw':      'breaker',
    'open':       'screw',
    'wiring':     'open',
    'rescrew':    'wiring',
    'breaker_on': 'rescrew',
    'done':       'breaker_on',
  };

  if (advance[newState] === step.target || newState === 'done') {
    setTimeout(() => _showOutletTutStep(_outletTutStep + 1), 500);
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// SCENARIO2 MINI-TUTORIAL (Switch Wiring)
// ══════════════════════════════════════════════════════════════════════════════

const SWITCH_STEPS_1WAY = [
  {
    text: "SWITCH WIRING — 1-WAY\n\nA single-pole switch controls one light from one location.\n\nYou'll connect: Live (L), Switched Live (SL), and Neutral (N).",
    btn: 'NEXT', hideAfter: false,
  },
  {
    text: "Drag the LIVE (brown) wire to the LINE terminal on the switch.\n\nI'll hide this panel so you can work — it'll come back when you're done.",
    btn: null, hideAfter: true, actionHint: 'CONNECT LIVE WIRE TO LINE TERMINAL',
  },
  {
    text: "Now drag the SWITCHED LIVE (brown) wire from the switch output to the LAMP terminal.",
    btn: null, hideAfter: true, actionHint: 'CONNECT SWITCHED LIVE TO LAMP',
  },
  {
    text: "Finally, drag NEUTRAL (blue) directly to the lamp — it bypasses the switch.",
    btn: null, hideAfter: true, actionHint: 'CONNECT NEUTRAL WIRE TO LAMP',
  },
  {
    text: "All wired!\n\nCheck:\n L → Switch LINE\n SL → Lamp\n N → Lamp (bypass)\n\nThis is a standard 1-way switch circuit (IEC / PEC).",
    btn: 'DONE', hideAfter: false,
  },
];

const SWITCH_STEPS_2WAY = [
  {
    text: "SWITCH WIRING — 2-WAY\n\nControls ONE light from TWO locations (e.g. top and bottom of stairs).",
    btn: 'NEXT', hideAfter: false,
  },
  {
    text: "Switch A: drag LIVE to COM terminal.\n\nI'll hide this so you can work.",
    btn: null, hideAfter: true, actionHint: 'CONNECT LIVE TO COM ON SWITCH A',
  },
  {
    text: "Now connect L1 and L2 traveller wires between Switch A and Switch B.",
    btn: null, hideAfter: true, actionHint: 'CONNECT TRAVELLER WIRES L1 AND L2',
  },
  {
    text: "Switch B: connect COM to the lamp.\n\nNeutral goes directly to the lamp.",
    btn: null, hideAfter: true, actionHint: 'CONNECT SWITCH B COM TO LAMP',
  },
  {
    text: "Either switch now controls the lamp!\n\nThis is a standard 2-way circuit (BS 7671 / PEC).",
    btn: 'DONE', hideAfter: false,
  },
];

const SWITCH_STEPS_3WAY = [
  {
    text: "SWITCH WIRING — 3-WAY\n\nControls ONE light from THREE locations using an intermediate switch in the middle.",
    btn: 'NEXT', hideAfter: false,
  },
  {
    text: "Switch A (2-way): LIVE to COM. Connect L1, L2 travellers to the intermediate switch.",
    btn: null, hideAfter: true, actionHint: 'WIRE SWITCH A — LIVE TO COM',
  },
  {
    text: "Intermediate Switch: connect both pairs of travellers (X1↔X2 crossing).",
    btn: null, hideAfter: true, actionHint: 'WIRE INTERMEDIATE SWITCH',
  },
  {
    text: "Switch C (2-way): receives travellers from intermediate. COM goes to lamp.",
    btn: null, hideAfter: true, actionHint: 'WIRE SWITCH C — COM TO LAMP',
  },
  {
    text: "NEUTRAL goes directly to lamp.\n\nAll three switches now independently control the lamp!",
    btn: 'DONE', hideAfter: false,
  },
];

let _scTutEl   = null;
let _scTutStep = 0;
let _scSteps   = [];
let _scType    = '';

export function initScenarioTutorial(type) {
  if (localStorage.getItem('et_sc_tut_' + type + '_done') === '1') return;
  _scType  = type;
  _scSteps = type === '2way' ? SWITCH_STEPS_2WAY
           : type === '3way' ? SWITCH_STEPS_3WAY
           : SWITCH_STEPS_1WAY;

  if (!_scTutEl) {
    _scTutEl = document.createElement('div');
    _scTutEl.style.cssText = [
      'position:fixed', 'top:50%', 'left:50%',
      'transform:translateX(-50%) translateY(-50%)',
      'max-width:340px', 'width:92vw',
      'background:linear-gradient(135deg,#0a1628 0%,#060e1a 100%)',
      'border:2px solid rgba(255,215,0,0.6)',
      'border-radius:14px', 'padding:16px 18px 14px',
      'z-index:9999', 'pointer-events:auto',
      'box-shadow:0 8px 40px rgba(0,0,0,0.7)',
      'font-family:\'Courier New\',monospace', 'color:#e0d0b0',
      'font-size:12px', 'line-height:1.6',
      'transition:opacity 0.3s',
    ].join(';');
    _scTutEl.innerHTML = `
      <div style="font-family:'Bebas Neue',cursive;font-size:15px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">SIR JUAN</div>
      <div id="sct-text" style="white-space:pre-line;min-height:54px;"></div>
      <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px;">
        <button id="sct-skip" style="
          background:transparent;border:1px solid rgba(255,100,100,0.4);border-radius:6px;
          color:rgba(255,120,120,0.7);font-family:'Bebas Neue',cursive;font-size:11px;
          letter-spacing:1px;padding:4px 10px;cursor:pointer;">SKIP</button>
        <button id="sct-next" style="
          background:linear-gradient(135deg,#F4A623,#e09600);border:none;border-radius:6px;
          color:#0a0800;font-family:'Bebas Neue',cursive;font-size:13px;
          letter-spacing:2px;padding:6px 18px;cursor:pointer;">NEXT</button>
      </div>`;

    // Action hint bar for scenario
    const bar = document.createElement('div');
    bar.id = 'scnActionBar';
    bar.style.cssText = [
      'position:fixed', 'bottom:100px', 'left:50%', 'transform:translateX(-50%)',
      'background:rgba(6,13,24,0.93)',
      'border:1.5px solid rgba(255,215,0,0.55)',
      'border-radius:28px', 'padding:9px 22px',
      'color:#ffd700', 'font-family:\'Bebas Neue\',cursive',
      'font-size:14px', 'letter-spacing:2px',
      'z-index:9998', 'pointer-events:all',
      'display:none', 'align-items:center', 'gap:0',
    ].join(';');
    document.body.appendChild(bar);
    document.body.appendChild(_scTutEl);
  }

  _scTutEl.querySelector('#sct-skip').onclick = () => {
    _scTutEl.style.display = 'none';
    const b = document.getElementById('scnActionBar');
    if (b) b.style.display = 'none';
    localStorage.setItem('et_sc_tut_' + type + '_done', '1');
  };
  _scTutEl.querySelector('#sct-next').onclick = _scnNext;

  _scTutStep = 0;
  _showScStep();

  // Seed the PROCEED button click handler on the action bar
  _scnWireProceedBtn();
}

function _scnNext() {
  _scTutStep++;
  if (_scTutStep >= _scSteps.length) {
    if (_scTutEl) _scTutEl.style.display = 'none';
    const b = document.getElementById('scnActionBar');
    if (b) b.style.display = 'none';
    localStorage.setItem('et_sc_tut_' + _scType + '_done', '1');
  } else {
    _showScStep();
  }
}

/** Wire the PROCEED button inside scnActionBar so clicking it advances the step. */
function _scnWireProceedBtn() {
  const b = document.getElementById('scnActionBar');
  if (!b) return;
  // Only wire once
  if (b.dataset.wired) return;
  b.dataset.wired = '1';
  const proceedBtn = b.querySelector('#scn-proceed-btn');
  if (proceedBtn) proceedBtn.onclick = _scnProceed;
}

function _scnProceed() {
  const b = document.getElementById('scnActionBar');
  if (b) b.style.display = 'none';
  _scnNext();
}

function _showScStep() {
  if (!_scTutEl || _scTutStep >= _scSteps.length) return;
  const step = _scSteps[_scTutStep];
  const textEl = _scTutEl.querySelector('#sct-text');
  const nextBtn = _scTutEl.querySelector('#sct-next');
  if (textEl) textEl.textContent = step.text;

  if (nextBtn) {
    if (step.btn) {
      nextBtn.textContent = step.btn;
      nextBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'none';
    }
  }

  // Show panel
  _scTutEl.style.opacity = '1';
  _scTutEl.style.display = 'block';
  const b = document.getElementById('scnActionBar');
  if (b) b.style.display = 'none';

  // If hideAfter: immediately slide panel away and show PROCEED action bar
  if (step.hideAfter) {
    setTimeout(() => {
      if (_scTutEl) {
        _scTutEl.style.opacity = '0';
        setTimeout(() => { if (_scTutEl) _scTutEl.style.display = 'none'; }, 300);
      }
      if (b) {
        // Build text with PROCEED button if not already there
        const existingBtn = b.querySelector('#scn-proceed-btn');
        if (!existingBtn) {
          b.style.cssText = b.style.cssText; // no-op; keep styles
          b.innerHTML = `
            <span>${step.actionHint || 'TRY IT NOW!'}</span>
            <button id="scn-proceed-btn" style="
              margin-left:14px;
              background:linear-gradient(135deg,#F4A623,#d08800);
              border:none; border-radius:20px;
              color:#0a0800; font-family:'Bebas Neue',cursive;
              font-size:13px; letter-spacing:2px;
              padding:6px 18px; cursor:pointer;
              box-shadow:0 2px 10px rgba(244,166,35,0.4);
            ">PROCEED</button>`;
          const btn = b.querySelector('#scn-proceed-btn');
          if (btn) btn.onclick = _scnProceed;
        } else {
          // Update hint text but keep button
          const spanEl = b.querySelector('span');
          if (spanEl) spanEl.textContent = step.actionHint || 'TRY IT NOW!';
          existingBtn.onclick = _scnProceed;
        }
        b.style.display = 'flex';
        b.style.alignItems = 'center';
        b.style.gap = '0';
      }
    }, 1200);
  }
}

// Called from scenario2.html when the player completes a wiring connection.
// Step advancement is now handled by the PROCEED button — this function is kept
// for backward compatibility but no longer auto-advances the step.
export function scenarioTutOnConnect() {
  // No-op: player must click PROCEED to advance; see _scnProceed().
}

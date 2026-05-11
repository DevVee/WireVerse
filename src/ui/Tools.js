import { Icons } from './Icons.js';

// ─── Tool catalog — each tool has 3 guide steps ───────────────
const TOOLS = [
  {
    id: 'lineman', name: "Lineman's Pliers", cat: 'HAND TOOL', emoji: '🔧', color: '#4d8aff',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "Meet the Lineman's Pliers",
        tasks: ["Look at the flat gripping jaw", "See the cutter at the base", "Notice the insulated handles"],
        dialog: "This is a <b>Lineman's Pliers!</b> 🔧 One of the most important tools for any electrician. The flat jaw grips wires tightly, and the base edge cuts them clean!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Gripping & holding wire bundles", "Cutting thick copper wire", "Twisting wires together"],
        dialog: "You use it to <b style='color:#ffd000'>grip</b>, <b style='color:#ffd000'>twist</b>, and <b style='color:#ffd000'>cut</b> wires! Every time wires need to be joined in a circuit, this is the tool you'd reach for!",
        cam: 'perspective(500px) scale(1.5) rotateY(-25deg) translateY(-6%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Using it safely",
        tasks: ["Always hold the rubber handles", "Grip at the BASE jaw, not the tip", "⚠️ Turn OFF the power first!"],
        dialog: "Hold ONLY the <b style='color:#1fc95a'>rubber handles</b> — never the metal part! Always make sure the power is <b style='color:#ff3355'>OFF</b> before you touch any wire. Safety first, always! 💪",
        cam: 'perspective(500px) scale(1.3) rotateY(20deg) rotateX(-10deg)',
      },
    ],
  },
  {
    id: 'longnose', name: 'Long Nose Pliers', cat: 'HAND TOOL', emoji: '🤏', color: '#ff9500',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "Long Nose Pliers",
        tasks: ["Long thin tapered jaws", "Great for tight, small spaces", "Insulated rubber handles"],
        dialog: "This is a <b>Long Nose Pliers!</b> 🤏 See those long pointy jaws? They can reach into tiny spots that regular pliers simply can't fit into!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Bending wire into loops & shapes", "Reaching into tight spaces", "Holding small parts steady"],
        dialog: "Perfect for <b style='color:#ffd000'>bending wire loops</b> around screw terminals and working in <b style='color:#ffd000'>tight spots</b> inside an outlet box. You'll use this a LOT in circuits!",
        cam: 'perspective(500px) scale(1.5) rotateY(-22deg) translateY(-8%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Making a wire loop",
        tasks: ["Grab wire end with the tip", "Curl clockwise around screw", "Loop should close fully"],
        dialog: "Grab the wire end with the <b style='color:#1fc95a'>tip of the pliers</b>, then curl it <b style='color:#ffd000'>clockwise</b>. That loop hooks perfectly onto screw terminals — like a pro!",
        cam: 'perspective(500px) scale(1.3) rotateY(18deg) rotateX(8deg)',
      },
    ],
  },
  {
    id: 'screwdriver', name: 'Screwdrivers Set', cat: 'HAND TOOL', emoji: '🪛', color: '#ff3355',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "The Screwdriver Set",
        tasks: ["Phillips head (+) and flathead (−)", "Insulated rubber handles (1000V rated)", "Different sizes for different screws"],
        dialog: "This is a <b>Screwdriver Set!</b> 🪛 The red one is <b style='color:#ffd000'>Phillips (+)</b> and the blue one is <b style='color:#4d8aff'>Flathead (−)</b>. Each screw type needs the RIGHT screwdriver!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Tightening terminal screws", "Fastening outlets & switches", "Opening electrical panels"],
        dialog: "You use it to <b style='color:#ffd000'>tighten screws</b> on wire terminals, outlets, and switches. A loose screw = a loose wire = <b style='color:#ff3355'>sparks and danger</b>! Always tighten firmly!",
        cam: 'perspective(500px) scale(1.5) rotateY(-20deg) translateY(-5%)',
      },
      {
        phase: 'HOW TO USE',
        title: "How to drive a screw",
        tasks: ["Push DOWN firmly before turning", "Turn clockwise to tighten", "Use the correct size — don't force it!"],
        dialog: "The trick is: <b style='color:#1fc95a'>push firmly THEN turn</b>. Using the wrong size strips the screw head permanently — then it's stuck forever! Match the screwdriver to the screw. 🎯",
        cam: 'perspective(500px) scale(1.2) rotateY(22deg) rotateX(-6deg)',
      },
    ],
  },
  {
    id: 'stripper', name: 'Wire Stripper', cat: 'WIRE TOOL', emoji: '✂️', color: '#1fc95a',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "The Wire Stripper",
        tasks: ["Notched blades match wire sizes", "Spring-loaded for easy use", "Built-in wire cutter too!"],
        dialog: "This is a <b>Wire Stripper!</b> ✂️ Those notches on the blade each match a different wire size. It removes the plastic coating (called insulation) from wires — safely and cleanly!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Removing wire insulation", "Exposing bare copper inside", "Cutting wires to exact length"],
        dialog: "You need to <b style='color:#ffd000'>expose the copper inside</b> the wire to make a connection. Without bare copper, no electricity can flow — the plastic blocks it!",
        cam: 'perspective(500px) scale(1.5) rotateY(-18deg) translateY(-5%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Stripping a wire",
        tasks: ["Match wire gauge to the notch", "Squeeze handles and give a half-turn", "Pull toward wire end — plastic pops off!"],
        dialog: "Find your wire's gauge number, place it in that notch, squeeze, give a <b style='color:#1fc95a'>half turn</b>, then pull toward the wire end. The plastic slides right off — revealing shiny copper! ✨",
        cam: 'perspective(500px) scale(1.3) rotateY(25deg) rotateX(-5deg)',
      },
    ],
  },
  {
    id: 'voltester', name: 'Voltage Tester', cat: 'TEST TOOL', emoji: '⚡', color: '#ffd000',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "Non-Contact Voltage Tester",
        tasks: ["Small handheld safety device", "Glows AND beeps near live wires", "No touching the wire needed!"],
        dialog: "This is a <b>Voltage Tester!</b> ⚡ It's a safety superhero! It can sense electricity in a wire WITHOUT you touching the wire. Think of it as your personal danger detector!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Checking if a wire is live (dangerous!)", "Testing BEFORE you touch anything", "Finding which wire has power"],
        dialog: "Before touching ANY wire, you <b style='color:#ff3355'>ALWAYS</b> test it first! If the tester lights up <b style='color:#ffd000'>yellow/red and beeps</b> — there's live electricity. <b style='color:#ff3355'>DO NOT TOUCH!</b>",
        cam: 'perspective(500px) scale(1.5) rotateY(-22deg) translateY(-8%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Testing safely",
        tasks: ["Turn it ON first (press the button)", "Hold tip NEAR the wire (don't touch)", "Beep + light = LIVE. No beep = safe"],
        dialog: "Hold the tip <b style='color:#1fc95a'>near the wire</b> — no touching! If it beeps: <b style='color:#ff3355'>STEP BACK</b>, go to the breaker box, and turn off the power. Always test first! 🦺",
        cam: 'perspective(500px) scale(1.3) rotateY(18deg) rotateX(8deg)',
      },
    ],
  },
  {
    id: 'multimeter', name: 'Digital Multimeter', cat: 'TEST TOOL', emoji: '📟', color: '#60b0ff',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "The Multimeter",
        tasks: ["Digital display screen", "Rotating selector dial", "Two probe cables (red & black)"],
        dialog: "This is a <b>Digital Multimeter!</b> 📟 It's like the Swiss Army knife of electrical testing — one device that measures voltage, current, AND resistance. Super powerful!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What it measures",
        tasks: ["Voltage (V) — electrical pressure", "Current (A) — how much flows", "Resistance (Ω) — how much it blocks"],
        dialog: "Turn the dial to <b style='color:#ffd000'>V</b> for Volts, <b style='color:#4d8aff'>A</b> for Amperes, or <b style='color:#1fc95a'>Ω</b> (Ohm) for Resistance. In WireVerse, you check these numbers to know if your circuit is working!",
        cam: 'perspective(500px) scale(1.5) rotateY(-20deg) translateY(-5%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Taking a reading",
        tasks: ["Set dial to correct mode (V/A/Ω)", "RED probe → positive (+) side", "BLACK probe → negative (−) side"],
        dialog: "<b style='color:#ff3355'>RED probe</b> always goes to the positive (+) side, <b style='color:#6a7a9a'>BLACK probe</b> to negative (−). The number on screen is your measurement. If it says 0 — no power is flowing! 🔍",
        cam: 'perspective(500px) scale(1.3) rotateY(20deg) rotateX(-8deg)',
      },
    ],
  },
  {
    id: 'etape', name: 'Electrical Tape', cat: 'WIRE TOOL', emoji: '🌀', color: '#ff9500',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "Electrical Tape",
        tasks: ["Stretchy black PVC vinyl tape", "Does NOT conduct electricity", "Different colors for wire labeling"],
        dialog: "This is <b>Electrical Tape!</b> 🌀 It's a special stretchy tape that blocks electricity. This is NOT the same as regular tape — using the wrong tape on wires is extremely dangerous!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Covering exposed copper wire", "Insulating wire splices & joints", "Color-coding different circuits"],
        dialog: "Wrap it around <b style='color:#ffd000'>bare copper wire</b> so no one accidentally touches a live wire. Different tape colors (red, black, blue) also help you remember <b style='color:#ffd000'>which wire does what!</b>",
        cam: 'perspective(500px) scale(1.5) rotateY(-18deg) translateY(-5%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Wrapping properly",
        tasks: ["Start BELOW the exposed area", "Wrap at 45° angle, overlapping", "Minimum 3 full layers!"],
        dialog: "Start <b style='color:#1fc95a'>below the bare wire</b>, wrap at a <b style='color:#ffd000'>45° angle</b> overlapping half each time. At least <b>3 full layers</b> — stretch slightly as you wrap for a better seal! 💪",
        cam: 'perspective(500px) scale(1.3) rotateY(22deg) rotateX(-5deg)',
      },
    ],
  },
  {
    id: 'breaker', name: 'Circuit Breaker', cat: 'COMPONENT', emoji: '🔌', color: '#4d8aff',
    steps: [
      {
        phase: 'WHAT IS IT',
        title: "The Circuit Breaker",
        tasks: ["Switch inside the breaker panel", "Has ON / OFF / TRIPPED positions", "Each circuit gets its own breaker"],
        dialog: "This is a <b>Circuit Breaker!</b> 🔌 It's the guardian of your electrical system. When too much electricity flows — it automatically <b style='color:#ff3355'>SHUTS OFF</b> to prevent fires and damage!",
        cam: 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)',
      },
      {
        phase: 'WHAT IT DOES',
        title: "What is it used for?",
        tasks: ["Protecting wires from overheating", "Preventing electrical fires", "Cutting power to a single circuit"],
        dialog: "It's like a <b style='color:#ffd000'>fuse that resets itself!</b> If you plug in too many devices and the wire gets too hot — the breaker TRIPS (turns off). It just saved your home from a fire! 🏠",
        cam: 'perspective(500px) scale(1.5) rotateY(-20deg) translateY(-6%)',
      },
      {
        phase: 'HOW TO USE',
        title: "Resetting a tripped breaker",
        tasks: ["Find the tripped breaker (middle position)", "Push it fully to OFF first", "Then push to ON — it's reset!"],
        dialog: "If a breaker trips, push it <b style='color:#1fc95a'>fully OFF first</b>, then push it back to ON. But first: unplug some devices! If it keeps tripping, there's a wiring problem — call an electrician! ⚠️",
        cam: 'perspective(500px) scale(1.3) rotateY(18deg) rotateX(-8deg)',
      },
    ],
  },
];

export class Tools {
  constructor(state) {
    this.state = state;
    this._tool = null;
    this._step = 0;
    this.container = this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'screen screen-hidden tools-screen';
    el.innerHTML = `
      <!-- ══ BROWSE VIEW ══ -->
      <div class="tl-view" id="tl-browse">
        <header class="game-header">
          <button class="hdr-back" id="tl-back">${Icons.back}</button>
          <h2 class="hdr-title">TOOL GUIDE</h2>
          <div class="hdr-right"></div>
        </header>
        <div class="tl-browse-body">
          <div class="tl-tool-list" id="tl-tool-list"></div>
          <div class="tl-browse-mascot">
            <div class="tl-browse-mascot-glow"></div>
            <img src="/Mascot.png" class="tl-mascot-img" alt="Volt" draggable="false" />
          </div>
        </div>
      </div>

      <!-- ══ GUIDE VIEW ══ -->
      <div class="tl-view" id="tl-guide" style="display:none">
        <header class="game-header">
          <button class="hdr-back" id="tl-guide-back">${Icons.back}</button>
          <h2 class="hdr-title" id="tl-guide-title"></h2>
          <div class="hdr-right tl-step-badge" id="tl-step-badge">1/3</div>
        </header>

        <div class="tl-guide-body">
          <!-- Left: tasks panel -->
          <div class="tl-tasks-panel">
            <div class="tl-panel-label">TASKS</div>
            <div class="tl-tasks-list" id="tl-tasks-list"></div>
            <button class="tl-hint-btn">${Icons.hint} HINT <span class="tl-hint-badge">2</span></button>
          </div>

          <!-- Center: 3D tool visual -->
          <div class="tl-visual-area">
            <div class="tl-visual-bg"></div>
            <div class="tl-visual-stage" id="tl-visual-stage">
              <div class="tl-visual-glow" id="tl-visual-glow"></div>
              <div class="tl-visual-icon" id="tl-visual-icon"></div>
              <div class="tl-phase-tag" id="tl-phase-tag"></div>
            </div>
            <div class="tl-cam-hint">TAP DIALOG TO ADVANCE</div>
          </div>

          <!-- Right: mascot -->
          <div class="tl-guide-mascot">
            <div class="tl-guide-mascot-glow"></div>
            <img src="/Mascot.png" class="tl-mascot-img" alt="Volt" draggable="false" />
          </div>
        </div>

        <!-- Bottom: Volt's dialog -->
        <div class="tl-dialog" id="tl-dialog">
          <div class="tl-dialog-header">
            <span class="tl-char-name">VOLT</span>
            <div class="tl-dialog-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <p class="tl-dialog-text" id="tl-dialog-text"></p>
          <div class="tl-dialog-footer">
            <button class="tl-skip-btn" id="tl-skip-btn">✕ SKIP</button>
            <button class="tl-next-btn" id="tl-next-btn">TAP TO CONTINUE ▶▶</button>
          </div>
        </div>
      </div>
    `;

    // Browse back → menu
    el.querySelector('#tl-back').addEventListener('click', () => this.state.setState('menu'));
    // Guide back → browse
    el.querySelector('#tl-guide-back').addEventListener('click', () => this._goToBrowse());
    // Skip → browse
    el.querySelector('#tl-skip-btn').addEventListener('click', () => this._goToBrowse());
    // Next button
    el.querySelector('#tl-next-btn').addEventListener('click', () => this._nextStep());
    // Tap anywhere on dialog advances
    el.querySelector('#tl-dialog').addEventListener('click', e => {
      if (!e.target.closest('.tl-skip-btn')) this._nextStep();
    });

    this._el = el;
    return el;
  }

  onShow() { this._goToBrowse(); }

  _goToBrowse() {
    this._el.querySelector('#tl-browse').style.display = 'flex';
    this._el.querySelector('#tl-guide').style.display = 'none';
    this._renderBrowse();
  }

  _renderBrowse() {
    const list = this._el.querySelector('#tl-tool-list');
    list.innerHTML = TOOLS.map(t => `
      <button class="tl-tool-card" data-id="${t.id}">
        <div class="tl-tc-icon" style="--tc-col:${t.color}">${t.emoji}</div>
        <div class="tl-tc-info">
          <div class="tl-tc-name">${t.name}</div>
          <div class="tl-tc-cat">${t.cat}</div>
        </div>
        <div class="tl-tc-arrow">${Icons.back}</div>
      </button>
    `).join('');

    list.querySelectorAll('.tl-tool-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = TOOLS.find(t => t.id === btn.dataset.id);
        if (tool) this._startGuide(tool);
      });
    });
  }

  _startGuide(tool) {
    this._tool = tool;
    this._step = 0;
    this._el.querySelector('#tl-browse').style.display = 'none';
    this._el.querySelector('#tl-guide').style.display = 'flex';
    // Set icon immediately at identity so first step animates in
    const icon = this._el.querySelector('#tl-visual-icon');
    icon.style.transition = 'none';
    icon.style.transform = 'perspective(500px) scale(0.6) rotateY(0deg)';
    icon.textContent = tool.emoji;
    setTimeout(() => {
      icon.style.transition = '';
      this._renderStep();
    }, 60);
  }

  _renderStep() {
    const step = this._tool.steps[this._step];
    const total = this._tool.steps.length;

    // Header
    this._el.querySelector('#tl-guide-title').textContent = this._tool.name.toUpperCase();
    this._el.querySelector('#tl-step-badge').textContent = `${this._step + 1}/${total}`;

    // Phase tag
    this._el.querySelector('#tl-phase-tag').textContent = step.phase;

    // Tasks
    this._el.querySelector('#tl-tasks-list').innerHTML = step.tasks.map((t, i) => `
      <div class="tl-task-item ${i === 0 ? 'tl-task--active' : ''}">
        <span class="tl-task-num">${i + 1}</span>
        <span class="tl-task-text">${t}</span>
      </div>
    `).join('');

    // Visual — camera shift
    const icon = this._el.querySelector('#tl-visual-icon');
    icon.style.transform = step.cam;
    icon.style.color = this._tool.color;

    // Glow tint
    this._el.querySelector('#tl-visual-glow').style.background =
      `radial-gradient(ellipse at 50% 60%, ${this._tool.color}44 0%, ${this._tool.color}11 45%, transparent 70%)`;

    // Dialog
    this._el.querySelector('#tl-dialog-text').innerHTML = step.dialog;

    // Next button label
    const nextBtn = this._el.querySelector('#tl-next-btn');
    nextBtn.textContent = this._step >= total - 1 ? '✓  GOT IT!' : 'TAP TO CONTINUE  ▶▶';
    nextBtn.className = `tl-next-btn ${this._step >= total - 1 ? 'tl-next-btn--done' : ''}`;
  }

  _nextStep() {
    const icon = this._el.querySelector('#tl-visual-icon');
    if (this._step < this._tool.steps.length - 1) {
      // Camera pull-back before shifting to new angle
      icon.style.transform = 'perspective(500px) scale(0.75) rotateY(0deg)';
      this._step++;
      setTimeout(() => this._renderStep(), 180);
    } else {
      this._goToBrowse();
    }
  }
}

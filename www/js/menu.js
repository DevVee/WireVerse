/**
 * WireVerse — Menu System
 * Handles all pre-game screens: main menu, player registration,
 * stage/level selection, learn modules, and settings.
 *
 * Depends on: db.js (window.DB)
 */

(function () {
  'use strict';

  // ── STAGES & LEVELS DATA ───────────────────────────────────────────────────

  const STAGES = [
    {
      id: 1,
      title: 'TRAINING SCENARIOS',
      subtitle: 'Complete electrical repair scenarios',
      color: '#FFB800',
      iconSym: '⚡',
      levels: [
        {
          id: 1,
          title: 'Fix Faulty Outlet',
          desc: '1. Turn OFF breaker<br>2. Select screwdriver &rarr; remove screws<br>3. Open outlet<br>4. Inspect wires<br>5. Reconnect wires to correct terminals<br>6. Close outlet<br>7. Turn ON breaker<br>8. Test using multimeter',
          duration: '10 min',
          objective: 'Three electrical outlets in the facility have been reported faulty. Locate each one, safely de-energize the circuit, repair the wiring, and restore power.',
          tools: ['Screwdriver', 'Multimeter', 'Insulated Gloves'],
          taskFlow: [
            { icon: '⚡', label: 'De-energize' },
            { icon: '🔧', label: 'Open Outlet' },
            { icon: '🔌', label: 'Rewire' },
            { icon: '✓',  label: 'Test & Close' },
          ],
          locations: ['Entrance Hall', 'Workshop', 'Corridor'],
        },
        {
          id: 2,
          title: 'Install Light Switches',
          desc: '1. Turn OFF breaker<br>2. Mount switch to wall box<br>3. Connect live wire to switch input<br>4. Connect output wire to bulb<br>5. Secure connections<br>6. Turn ON breaker<br>7. Flip switch',
          duration: '15 min',
          objective: 'Three light switch stations across the facility need to be wired and installed. Each station requires proper wire routing and connection to the correct terminals.',
          tools: ['Screwdriver', 'Wire Stripper', 'Insulated Gloves'],
          taskFlow: [
            { icon: '⚡', label: 'De-energize' },
            { icon: '📍', label: 'Locate Station' },
            { icon: '🔌', label: 'Wire Switch' },
            { icon: '💡', label: 'Test & Verify' },
          ],
          locations: ['Workshop', 'Generator Room', 'Utility Room'],
        },
        {
          id: 3,
          title: 'Replace Damaged Wire',
          desc: '1. Turn OFF breaker<br>2. Identify damaged wire<br>3. Use wire stripper to remove insulation<br>4. Cut damaged section using pliers<br>5. Insert new wire<br>6. Connect to correct terminals<br>7. Secure with electrical tape<br>8. Turn ON breaker<br>9. Test continuity',
          duration: '20 min',
        },
        {
          id: 4,
          title: 'Test Live Circuit',
          desc: '1. Equip multimeter<br>2. Set multimeter to AC Voltage (V~)<br>3. Place black probe on Neutral<br>4. Place red probe on Live<br>5. Read voltage (Should be 220V/120V)<br>6. Remove probes<br>7. Confirm circuit is live',
          duration: '5 min',
        },
        {
          id: 5,
          title: 'Fix Loose Connection',
          desc: '1. Turn OFF breaker<br>2. Open device cover<br>3. Check loose screw terminal<br>4. Insert wire properly<br>5. Use screwdriver to tighten screw<br>6. Pull wire gently to check grip<br>7. Close cover<br>8. Turn ON breaker<br>9. Test device',
          duration: '10 min',
        },
        {
          id: 6,
          title: 'Reset Tripped Breaker',
          desc: '1. Open breaker panel<br>2. Identify the tripped breaker (middle position)<br>3. Turn breaker fully OFF<br>4. Turn breaker fully ON<br>5. Check if breaker holds<br>6. Test power in room = success',
          duration: '5 min',
        },
        {
          id: 7,
          title: 'Fix Short Circuit',
          desc: '1. Identify blown fuse/tripped breaker<br>2. Turn OFF main power<br>3. Inspect wiring for exposed copper touching<br>4. Separate touching wires<br>5. Wrap with electrical tape or use wire nut<br>6. Replace fuse or Reset breaker<br>7. Turn ON main power<br>8. Test circuit',
          duration: '25 min',
        },
        {
          id: 8,
          title: 'Install New Outlet',
          desc: '1. Turn OFF breaker<br>2. Run wire from source to outlet box<br>3. Strip wire ends<br>4. Connect Ground (Green/Bare) to green screw<br>5. Connect Neutral (White/Blue) to silver screw<br>6. Connect Live (Black/Brown) to brass screw<br>7. Install outlet in box<br>8. Turn ON breaker and Test',
          duration: '20 min',
        },
        {
          id: 9,
          title: 'Bulb Not Lighting',
          desc: '1. Turn ON switch (nothing happens)<br>2. Equip multimeter<br>3. Test voltage at bulb socket (if 0V, proceed)<br>4. Turn OFF breaker<br>5. Open switch<br>6. Fix loose wire inside switch<br>7. Close switch<br>8. Turn ON breaker<br>9. Turn ON switch',
          duration: '15 min',
        },
        {
          id: 10,
          title: 'Simple Circuit Setup',
          desc: '1. Place power source<br>2. Place switch<br>3. Place light bulb<br>4. Connect wire: Source \u2192 Switch<br>5. Connect wire: Switch \u2192 Bulb<br>6. Connect wire: Bulb \u2192 Neutral<br>7. Flip switch to test',
          duration: '10 min',
        }
      ],
    }
  ];

  // ── STATE ────────────────────────────────────────────────────────────────────
  let _pendingLaunch = null; // { stageId, levelId } set before mission briefing

  // ── SCREEN NAVIGATION ───────────────────────────────────────────────────────

  function showScreen(id) {
    document.querySelectorAll('.menu-screen').forEach(s => s.classList.remove('ms-active'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('ms-active');
      target.scrollTop = 0;
    }
  }

  // ── MAIN MENU ───────────────────────────────────────────────────────────────

  function initMenu() {
    const player = DB.getPlayer();
    if (!player) {
      showScreen('screenRegister');
    } else {
      updateGreeting(player);
      showScreen('screenMain');
    }
  }

  function updateGreeting(player) {
    const el = document.getElementById('menuGreeting');
    if (el) el.textContent = 'WELCOME BACK, ' + player.name.toUpperCase();
  }

  // ── PLAYER REGISTRATION ─────────────────────────────────────────────────────

  function handleRegister() {
    const input = document.getElementById('playerNameInput');
    const err = document.getElementById('registerError');
    const name = (input?.value || '').trim();
    if (!name) {
      if (err) { err.textContent = 'Please enter your name.'; err.style.display = 'block'; }
      return;
    }
    if (name.length < 2 || name.length > 30) {
      if (err) { err.textContent = 'Name must be 2–30 characters.'; err.style.display = 'block'; }
      return;
    }
    DB.savePlayer({ name });
    updateGreeting({ name });
    showScreen('screenMain');
  }

  // ── STAGE SELECTION ─────────────────────────────────────────────────────────

  function renderStages() {
    const container = document.getElementById('stagesList');
    if (!container) return;
    container.innerHTML = '';
    STAGES.forEach(stage => {
      const prog = DB.getProgress()[stage.id] || {};
      const completed = Object.values(prog).filter(l => l.completed).length;
      const unlocked = DB.isLevelUnlocked(stage.id, 1);

      const card = document.createElement('div');
      card.className = 'stage-card' + (unlocked ? '' : ' stage-locked');
      card.innerHTML = `
        <div class="stage-icon" style="color:${stage.color};">${stage.iconSym}</div>
        <div class="stage-info">
          <div class="stage-title" style="color:${stage.color};">${stage.title}</div>
          <div class="stage-sub">${stage.subtitle}</div>
          <div class="stage-prog">
            <div class="stage-prog-bar">
              <div class="stage-prog-fill" style="width:${completed / 4 * 100}%;background:${stage.color};"></div>
            </div>
            <span class="stage-prog-label">${completed}/4 LEVELS</span>
          </div>
        </div>
        <div class="stage-arrow">${unlocked ? '▶' : '🔒'}</div>
      `;
      if (unlocked) {
        card.addEventListener('click', () => {
          renderLevels(stage);
          showScreen('screenLevels');
        });
      }
      container.appendChild(card);
    });
  }

  // ── LEVEL SELECTION ─────────────────────────────────────────────────────────

  function renderLevels(stage) {
    const title = document.getElementById('levelScreenTitle');
    if (title) title.textContent = stage.title;

    const container = document.getElementById('levelsList');
    if (!container) return;
    container.innerHTML = '';

    stage.levels.forEach(level => {
      const unlocked = DB.isLevelUnlocked(stage.id, level.id);
      const prog = DB.getLevelProgress(stage.id, level.id);
      const completed = prog?.completed === true;
      const stars = prog?.stars || 0;

      const starHTML = '★★★'.split('').map((_, i) =>
        `<span style="color:${i < stars ? '#FFB800' : 'rgba(255,184,0,0.2)'};">★</span>`
      ).join('');

      const card = document.createElement('div');
      card.className = 'level-card' +
        (completed ? ' level-completed' : '') +
        (unlocked && !completed ? ' level-unlocked' : '') +
        (!unlocked ? ' level-locked' : '');

      card.innerHTML = `
        <div class="level-num" style="color:${stage.color};">LVL ${level.id}</div>
        <div class="level-info">
          <div class="level-title">${level.title}${completed ? ' <span class="level-done-badge">✓ DONE</span>' : ''}</div>
          <div class="level-desc">${level.desc}</div>
          <div class="level-meta">
            <span class="level-dur">⏱ ${level.duration}</span>
            <span class="level-stars">${starHTML}</span>
          </div>
        </div>
        <div class="level-action">
          ${!unlocked ? '<span class="level-lock">🔒</span>' : `<button class="btn-play" data-stage="${stage.id}" data-level="${level.id}">${completed ? 'REPLAY' : 'PLAY'}</button>`}
        </div>
      `;
      container.appendChild(card);
    });

    // Bind play buttons — route through mission briefing
    container.querySelectorAll('.btn-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.GameAudio) { window.GameAudio.init?.(); window.GameAudio.click?.(); }
        const sId = parseInt(e.target.dataset.stage);
        const lId = parseInt(e.target.dataset.level);
        const lvl = stage.levels.find(l => l.id === lId);
        if (lvl) {
          renderMissionBriefing(stage, lvl);
          showScreen('screenMissionBriefing');
        } else {
          launchLevel(sId, lId);
        }
      });
    });
  }

  // ── MISSION BRIEFING ────────────────────────────────────────────────────────

  function renderMissionBriefing(stage, level) {
    _pendingLaunch = { stageId: stage.id, levelId: level.id };

    const el = document.getElementById('missionBriefingContent');
    if (!el) return;

    // Parse step list from desc (split on <br>)
    const steps = level.desc
      .replace(/&rarr;/g, '→')
      .split(/<br\s*\/?>/i)
      .map(s => s.replace(/<[^>]+>/g, '').trim())
      .filter(s => s.length > 0);

    // Task flow icons
    const flow = level.taskFlow || [];
    const flowHTML = flow.length
      ? `<div class="mb-flow">
          ${flow.map((f, i) => `
            <div class="mb-flow-step">
              <div class="mb-flow-icon">${f.icon}</div>
              <div class="mb-flow-label">${f.label}</div>
            </div>
            ${i < flow.length - 1 ? '<div class="mb-flow-arrow">→</div>' : ''}
          `).join('')}
        </div>`
      : '';

    // Locations badge row
    const locs = level.locations || [];
    const locsHTML = locs.length
      ? `<div class="mb-locations">
          <span class="mb-meta-label">LOCATIONS</span>
          ${locs.map(l => `<span class="mb-loc-badge">${l}</span>`).join('')}
        </div>`
      : '';

    // Tools
    const tools = level.tools || [];
    const toolsHTML = tools.length
      ? `<div class="mb-tools">
          <span class="mb-meta-label">REQUIRED TOOLS</span>
          ${tools.map(t => `<span class="mb-tool">${t}</span>`).join('')}
        </div>`
      : '';

    // Steps
    const stepsHTML = `<div class="mb-steps">
      ${steps.map((s, i) => `
        <div class="mb-step">
          <span class="mb-step-num">${i + 1}</span>
          <span class="mb-step-text">${s.replace(/^\d+\.\s*/, '')}</span>
        </div>
      `).join('')}
    </div>`;

    el.innerHTML = `
      <div class="mb-header">
        <div class="mb-stage-badge" style="color:${stage.color};">${stage.iconSym} MISSION BRIEFING</div>
        <div class="mb-level-num" style="color:${stage.color};">LEVEL ${level.id}</div>
      </div>
      <div class="mb-title">${level.title.toUpperCase()}</div>
      <div class="mb-objective">${level.objective || level.desc.replace(/<[^>]+>/g, ' ').trim()}</div>
      ${flowHTML}
      <div class="mb-divider"></div>
      <div class="mb-steps-title">STEP-BY-STEP PROCEDURE</div>
      ${stepsHTML}
      <div class="mb-divider"></div>
      <div class="mb-meta-row">
        ${toolsHTML}
        ${locsHTML}
        <div class="mb-duration">
          <span class="mb-meta-label">ESTIMATED TIME</span>
          <span class="mb-dur-val">⏱ ${level.duration}</span>
        </div>
      </div>
    `;
  }

  // ── LEARN SELECT — choose switch type ─────────────────────────────────────

  const SWITCH_TYPES = [
    {
      id: '1way',
      badge: '1-SWITCH',
      name: 'Single-Pole Control',
      desc: 'One switch controls one light. Learn LIVE, SWITCH→LIGHT, and NEUTRAL wiring.',
      difficulty: 1,
      color: '#22c55e',
      borderColor: 'rgba(34,197,94,.6)',
    },
    {
      id: '2way',
      badge: '2-SWITCH',
      name: 'Two-Location Control',
      desc: 'Two switches control one light from different locations — traveler wires between them.',
      difficulty: 2,
      color: '#3b82f6',
      borderColor: 'rgba(59,130,246,.6)',
    },
    {
      id: '3way',
      badge: '3-SWITCH',
      name: 'Three-Location Control',
      desc: 'Three switches share control — uses an intermediate switch with four traveler terminals.',
      difficulty: 3,
      color: '#f59e0b',
      borderColor: 'rgba(245,158,11,.6)',
    },
  ];

  function renderLearnSelect() {
    const container = document.getElementById('learnSelectCards');
    if (!container) return;
    container.innerHTML = '';

    SWITCH_TYPES.forEach(t => {
      const prog = DB.getLearnTypeProgress ? DB.getLearnTypeProgress(t.id) : null;
      const done = prog?.completed === true;
      const stars = prog?.bestStars || 0;
      const starHTML = [0,1,2].map(i =>
        `<span style="color:${i < stars ? '#F5C518' : 'rgba(245,197,24,.15)'};font-size:14px;">★</span>`
      ).join('');
      const diffDots = [1,2,3].map(i =>
        `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${i <= t.difficulty ? t.color : 'rgba(255,255,255,.1)'};margin-right:3px;"></span>`
      ).join('');

      const card = document.createElement('div');
      card.className = 'ls-card';
      card.style.cssText = `
        background:var(--panel);border:1px solid ${done ? t.borderColor : 'rgba(255,255,255,.08)'};
        border-radius:14px;padding:22px 18px;cursor:pointer;
        transition:all .22s;display:flex;flex-direction:column;gap:10px;
        position:relative;overflow:hidden;min-width:200px;
      `;
      card.innerHTML = `
        ${done ? `<div style="position:absolute;top:10px;right:12px;background:rgba(34,197,94,.15);
          border:1px solid rgba(34,197,94,.4);border-radius:5px;padding:3px 9px;
          font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;
          letter-spacing:.18em;color:#4ade80;">DONE</div>` : ''}
        <div style="background:rgba(255,255,255,.05);border:1px solid ${t.borderColor};
          border-radius:6px;padding:3px 10px;font-family:'Barlow Condensed',sans-serif;
          font-size:10px;font-weight:700;letter-spacing:.16em;color:${t.color};
          text-transform:uppercase;align-self:flex-start;">${t.badge}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;
          color:#fff;line-height:1.1;">${t.name}</div>
        <div style="display:flex;gap:3px;">${diffDots}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5);line-height:1.6;flex:1;">${t.desc}</div>
        <div style="display:flex;gap:2px;margin-top:2px;">${starHTML}</div>
        <button class="ls-start-btn" style="
          margin-top:4px;padding:10px 0;text-align:center;border-radius:8px;
          font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;
          letter-spacing:.12em;text-transform:uppercase;border:none;cursor:pointer;
          background:${t.color};color:#000;transition:all .15s;
        ">${done ? 'PRACTICE AGAIN' : 'START LEARNING'}</button>
      `;

      card.addEventListener('mouseover', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.borderColor = t.borderColor;
        card.style.boxShadow = `0 12px 40px rgba(0,0,0,.5)`;
      });
      card.addEventListener('mouseout', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = done ? t.borderColor : 'rgba(255,255,255,.08)';
      });

      card.querySelector('.ls-start-btn').addEventListener('click', () => {
        if (window.GameAudio) { window.GameAudio.init?.(); window.GameAudio.click?.(); }
        window.location.href = `scenario2.html?type=${t.id}&from=learn`;
      });

      container.appendChild(card);
    });
  }

  // ── LEARN (Book-style) ─────────────────────────────────────────────────────

  let _learnPage = 0;

  // Rich book pages — each module becomes a full page with highlights + tips
  const LEARN_PAGES = [
    {
      title: 'Electrical Safety & Standards',
      chapter: 'Chapter 1',
      icon: '🦺',
      color: '#FFB800',
      body: `
        <p class="lp-intro">All electrical work must comply with the <span class="lp-hl">Philippine Electrical Code (PEC)</span> and <span class="lp-hl">TESDA NC II/NC III</span> competency standards.</p>

        <div class="lp-tip">
          <div class="lp-tip-label">SAFETY FIRST</div>
          Always de-energize circuits using <span class="lp-hl">Lockout/Tagout (LOTO)</span> before any installation or maintenance work.
        </div>

        <div class="lp-steps">
          <div class="lp-step"><span class="lp-step-num">1</span><span><strong>PPE Required:</strong> Insulated gloves, safety glasses, non-conductive footwear.</span></div>
          <div class="lp-step"><span class="lp-step-num">2</span><span><strong>Hazardous voltage:</strong> Above <span class="lp-hl">50V AC</span> or <span class="lp-hl">120V DC</span> is considered dangerous.</span></div>
          <div class="lp-step"><span class="lp-step-num">3</span><span><strong>IEC Color Codes:</strong> L = <span class="lp-hl-brown">Brown</span>, N = <span class="lp-hl-blue">Blue</span>, PE = <span class="lp-hl-green">Green/Yellow</span>.</span></div>
          <div class="lp-step"><span class="lp-step-num">4</span><span><strong>Fire safety:</strong> Know Class C extinguisher locations and isolation points.</span></div>
        </div>

        <div class="lp-warn">
          <div class="lp-warn-label">WARNING</div>
          Never work on live circuits without proper PPE and authorization. Electrocution risk is fatal.
        </div>

        <div class="lp-key-terms">
          <div class="lp-kt-label">KEY TERMS</div>
          <span class="lp-kt">LOTO</span><span class="lp-kt">PPE</span><span class="lp-kt">PEC</span><span class="lp-kt">IEC 60364</span><span class="lp-kt">TESDA NC II</span>
        </div>
      `,
    },
    {
      title: 'Basic Circuit Components',
      chapter: 'Chapter 2',
      icon: '🔩',
      color: '#00C8FF',
      body: `
        <p class="lp-intro">Electrical circuits consist of components that <span class="lp-hl">control, protect, and distribute</span> electrical energy throughout a building.</p>

        <div class="lp-tip">
          <div class="lp-tip-label">REMEMBER</div>
          A <span class="lp-hl">Circuit Breaker (MCB)</span> trips automatically — a <span class="lp-hl">Fuse</span> must be physically replaced after it blows.
        </div>

        <div class="lp-steps">
          <div class="lp-step"><span class="lp-step-num">⚡</span><span><strong>Resistor:</strong> Limits current. Unit: <span class="lp-hl">Ohm (Ω)</span>.</span></div>
          <div class="lp-step"><span class="lp-step-num">⚡</span><span><strong>Capacitor:</strong> Stores charge. Used in power factor correction.</span></div>
          <div class="lp-step"><span class="lp-step-num">⚡</span><span><strong>MCB (Circuit Breaker):</strong> Auto-trips on <span class="lp-hl">overcurrent</span>. Reusable.</span></div>
          <div class="lp-step"><span class="lp-step-num">⚡</span><span><strong>ELCB / RCD:</strong> Detects <span class="lp-hl">earth leakage</span> and trips instantly for shock protection.</span></div>
          <div class="lp-step"><span class="lp-step-num">⚡</span><span><strong>Terminal Block:</strong> Secure wire connection point in distribution panels.</span></div>
        </div>

        <div class="lp-key-terms">
          <div class="lp-kt-label">KEY TERMS</div>
          <span class="lp-kt">MCB</span><span class="lp-kt">ELCB</span><span class="lp-kt">RCD</span><span class="lp-kt">Fuse</span><span class="lp-kt">Terminal Block</span>
        </div>
      `,
    },
    {
      title: 'Wiring Systems & Schematic Reading',
      chapter: 'Chapter 3',
      icon: '📐',
      color: '#44FF88',
      body: `
        <p class="lp-intro">Wiring systems must follow <span class="lp-hl">PEC and IEC standards</span>. Reading schematics is a core skill for every electrician.</p>

        <div class="lp-tip">
          <div class="lp-tip-label">PRO TIP</div>
          A <span class="lp-hl">single-line diagram</span> shows power flow direction. A <span class="lp-hl">wiring diagram</span> shows actual physical connections.
        </div>

        <div class="lp-steps">
          <div class="lp-step"><span class="lp-step-num">1</span><span><strong>TPS Cable:</strong> Twin and Earth PVC-sheathed. Standard for indoor fixed wiring.</span></div>
          <div class="lp-step"><span class="lp-step-num">2</span><span><strong>Wire Gauge:</strong> Chosen by load current. Common: <span class="lp-hl">2.5mm²</span> for 20A circuits.</span></div>
          <div class="lp-step"><span class="lp-step-num">3</span><span><strong>Conduit Wiring:</strong> PVC or metal conduit gives mechanical protection to wires.</span></div>
          <div class="lp-step"><span class="lp-step-num">4</span><span><strong>IEC 60617:</strong> Standard for schematic symbols — switches, lamps, motors, relays.</span></div>
        </div>

        <div class="lp-warn">
          <div class="lp-warn-label">CHECK</div>
          Always verify wire gauge matches the breaker rating. Undersized wire causes overheating and fire risk.
        </div>

        <div class="lp-key-terms">
          <div class="lp-kt-label">KEY TERMS</div>
          <span class="lp-kt">TPS Cable</span><span class="lp-kt">Conduit</span><span class="lp-kt">Wire Gauge</span><span class="lp-kt">IEC 60617</span><span class="lp-kt">Single-Line Diagram</span>
        </div>
      `,
    },
    {
      title: 'Panel Board Installation',
      chapter: 'Chapter 4',
      icon: '🗂',
      color: '#FF6B35',
      body: `
        <p class="lp-intro">The <span class="lp-hl">distribution panel board</span> is the heart of any electrical installation — it distributes power and provides protection for all circuits.</p>

        <div class="lp-tip">
          <div class="lp-tip-label">CRITICAL</div>
          The <span class="lp-hl">Neutral bar</span> must be isolated from the enclosure. The <span class="lp-hl">Earth bar</span> bonds to the enclosure and all PE conductors.
        </div>

        <div class="lp-steps">
          <div class="lp-step"><span class="lp-step-num">1</span><span><strong>Main Breaker:</strong> Isolates entire panel. Sized to total load × safety factor.</span></div>
          <div class="lp-step"><span class="lp-step-num">2</span><span><strong>Branch Breakers:</strong> Per circuit — typically <span class="lp-hl">15A or 20A</span> for residential loads.</span></div>
          <div class="lp-step"><span class="lp-step-num">3</span><span><strong>Bus Bar:</strong> Copper bar connecting all breakers to incoming supply.</span></div>
          <div class="lp-step"><span class="lp-step-num">4</span><span><strong>Torque Settings:</strong> Tighten terminals to manufacturer spec — prevents loose connections.</span></div>
        </div>

        <div class="lp-warn">
          <div class="lp-warn-label">WARNING</div>
          Loose connections cause arcing, overheating, and fire. Always use a torque screwdriver on panel terminals.
        </div>

        <div class="lp-key-terms">
          <div class="lp-kt-label">KEY TERMS</div>
          <span class="lp-kt">Main Breaker</span><span class="lp-kt">Bus Bar</span><span class="lp-kt">Neutral Bar</span><span class="lp-kt">Earth Bar</span><span class="lp-kt">Torque</span>
        </div>
      `,
    },
    {
      title: 'Motor Control Systems',
      chapter: 'Chapter 5',
      icon: '⚙',
      color: '#B066FF',
      body: `
        <p class="lp-intro">Motor control is a core <span class="lp-hl">NC III competency</span>. It involves starting, stopping, reversing, and protecting electric motors.</p>

        <div class="lp-tip">
          <div class="lp-tip-label">KEY CONCEPT</div>
          A <span class="lp-hl">Star-Delta (Y-Δ) Starter</span> reduces starting current by first connecting the motor in star, then switching to delta after it accelerates.
        </div>

        <div class="lp-steps">
          <div class="lp-step"><span class="lp-step-num">1</span><span><strong>Contactor:</strong> Heavy-duty relay for motor circuits. Operated by 24V or 230V coil.</span></div>
          <div class="lp-step"><span class="lp-step-num">2</span><span><strong>Thermal Overload Relay:</strong> Protects motor windings from <span class="lp-hl">sustained overcurrent</span>.</span></div>
          <div class="lp-step"><span class="lp-step-num">3</span><span><strong>DOL Starter:</strong> Direct-On-Line — applies full voltage. For small motors only.</span></div>
          <div class="lp-step"><span class="lp-step-num">4</span><span><strong>Reverse-Forward Circuit:</strong> Two contactors with <span class="lp-hl">mechanical + electrical interlocking</span> to reverse direction.</span></div>
          <div class="lp-step"><span class="lp-step-num">5</span><span><strong>Control Circuit:</strong> 230V or 24V — push buttons, timers, auxiliary contacts.</span></div>
        </div>

        <div class="lp-key-terms">
          <div class="lp-kt-label">KEY TERMS</div>
          <span class="lp-kt">Contactor</span><span class="lp-kt">DOL Starter</span><span class="lp-kt">Star-Delta</span><span class="lp-kt">Thermal Overload</span><span class="lp-kt">Interlocking</span>
        </div>
      `,
    },
  ];

  function renderLearn() {
    const book = document.getElementById('learnBook');
    const indicator = document.getElementById('learnPageIndicator');
    if (!book) return;

    function showPage(idx) {
      _learnPage = Math.max(0, Math.min(idx, LEARN_PAGES.length - 1));
      const p = LEARN_PAGES[_learnPage];
      book.innerHTML = `
        <div class="lp-chapter-badge" style="color:${p.color};border-color:${p.color}33;">${p.chapter}</div>
        <div class="lp-page-title">${p.icon} ${p.title}</div>
        <div class="lp-divider" style="background:${p.color};"></div>
        ${p.body}
      `;
      if (indicator) indicator.textContent = `${_learnPage + 1} / ${LEARN_PAGES.length}`;
      const prev = document.getElementById('btnLearnPrev');
      const next = document.getElementById('btnLearnNext');
      if (prev) prev.disabled = _learnPage === 0;
      if (next) next.disabled = _learnPage === LEARN_PAGES.length - 1;
    }

    showPage(_learnPage);

    const prev = document.getElementById('btnLearnPrev');
    const next = document.getElementById('btnLearnNext');
    if (prev) { prev.onclick = () => showPage(_learnPage - 1); }
    if (next) { next.onclick = () => showPage(_learnPage + 1); }
  }

  // ── ACHIEVEMENTS ────────────────────────────────────────────────────────────

  const SWITCH_ACHIEVEMENTS = [
    { id: 'wired_1way',      name: 'First Wire',      desc: 'Complete the 1-Switch circuit',             icon: '⚡', color: '#22c55e' },
    { id: 'wired_2way',      name: 'Two Paths',        desc: 'Complete the 2-Switch circuit',             icon: '↔',  color: '#3b82f6' },
    { id: 'wired_3way',      name: 'Master Wirer',     desc: 'Complete the 3-Switch circuit',             icon: '◈',  color: '#f59e0b' },
    { id: 'perfect_wiring',  name: 'Perfect Wiring',   desc: 'Complete any circuit with no errors or hints', icon: '★', color: '#F5C518' },
  ];

  function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    container.innerHTML = '';

    let anyProgress = false;

    // ── Switch Wiring Achievements ──────────────────────────────────────────
    const unlockedAch = DB.getAchievements ? DB.getAchievements() : {};
    const switchHeader = document.createElement('div');
    switchHeader.className = 'ach-stage-header';
    switchHeader.innerHTML = `<span style="color:#F5C518;">⚡</span> SWITCH WIRING`;
    container.appendChild(switchHeader);

    SWITCH_ACHIEVEMENTS.forEach(a => {
      const earned = !!unlockedAch[a.id];
      const card = document.createElement('div');
      card.className = 'ach-card' + (earned ? ' ach-card-done' : '');
      card.style.opacity = earned ? '1' : '0.45';
      card.innerHTML = `
        <div class="ach-lvl-badge" style="color:${a.color};font-size:18px;min-width:32px;">${a.icon}</div>
        <div class="ach-info">
          <div class="ach-title">${a.name}</div>
          <div class="ach-stars" style="font-size:11px;color:rgba(255,255,255,.45);margin-top:2px;">${a.desc}</div>
        </div>
        <div class="ach-status">
          ${earned
            ? '<span class="ach-done-badge">EARNED</span>'
            : '<span class="ach-inprog-badge">LOCKED</span>'}
        </div>
      `;
      if (earned) anyProgress = true;
      container.appendChild(card);
    });

    // ── Learn Progress ──────────────────────────────────────────────────────
    const learnProg = DB.getLearnProgress ? DB.getLearnProgress() : {};
    const learnHeader = document.createElement('div');
    learnHeader.className = 'ach-stage-header';
    learnHeader.style.marginTop = '16px';
    learnHeader.innerHTML = `<span style="color:#3b82f6;">📚</span> LEARN PROGRESS`;
    container.appendChild(learnHeader);

    SWITCH_TYPES.forEach(t => {
      const prog = learnProg[t.id];
      const done = prog?.completed === true;
      const stars = prog?.bestStars || 0;
      const starHTML = [0,1,2].map(i =>
        `<span class="ach-star ${i < stars ? 'ach-star-on' : ''}">★</span>`
      ).join('');
      const card = document.createElement('div');
      card.className = 'ach-card' + (done ? ' ach-card-done' : '');
      card.innerHTML = `
        <div class="ach-lvl-badge" style="color:${t.color};">${t.badge}</div>
        <div class="ach-info">
          <div class="ach-title">${t.name}</div>
          <div class="ach-stars">${starHTML}</div>
        </div>
        <div class="ach-status">
          ${done
            ? `<span class="ach-done-badge">×${prog.attempts}</span>`
            : '<span class="ach-inprog-badge">NOT STARTED</span>'}
        </div>
      `;
      container.appendChild(card);
    });

    if (!anyProgress && Object.keys(learnProg).length === 0) {
      container.innerHTML = `
        <div class="ach-empty">
          <div class="ach-empty-icon">🔒</div>
          <div class="ach-empty-title">NO ACHIEVEMENTS YET</div>
          <div class="ach-empty-sub">Complete switch wiring scenarios in Learn mode to earn achievements.</div>
        </div>
      `;
    }
  }

  // ── CREDITS ─────────────────────────────────────────────────────────────────

  function renderCredits() {
    const container = document.getElementById('creditsList');
    if (!container) return;
    container.innerHTML = `
      <div class="cred-section">
        <div class="cred-section-title">DEVELOPMENT</div>
        <div class="cred-entry"><span class="cred-role">Lead Developer</span><span class="cred-name">WiewVerse Team</span></div>
        <div class="cred-entry"><span class="cred-role">3D Environment</span><span class="cred-name">WireVerse Team</span></div>
        <div class="cred-entry"><span class="cred-role">Scenario Design</span><span class="cred-name">WireVerse Team</span></div>
        <div class="cred-entry"><span class="cred-role">UI / UX Design</span><span class="cred-name">WireVerse Team</span></div>
      </div>
      <div class="cred-divider"></div>
      <div class="cred-section">
        <div class="cred-section-title">TECHNOLOGY</div>
        <div class="cred-entry"><span class="cred-role">3D Engine</span><span class="cred-name">Three.js</span></div>
        <div class="cred-entry"><span class="cred-role">Mobile Platform</span><span class="cred-name">Apache Cordova</span></div>
        <div class="cred-entry"><span class="cred-role">Audio</span><span class="cred-name">Web Audio API</span></div>
        <div class="cred-entry"><span class="cred-role">Language</span><span class="cred-name">JavaScript (ES Modules)</span></div>
      </div>
      <div class="cred-divider"></div>
      <div class="cred-section">
        <div class="cred-section-title">CURRICULUM REFERENCE</div>
        <div class="cred-entry"><span class="cred-role">Standard</span><span class="cred-name">TESDA NC II / NC III</span></div>
        <div class="cred-entry"><span class="cred-role">Electrical Code</span><span class="cred-name">Philippine Electrical Code (PEC)</span></div>
        <div class="cred-entry"><span class="cred-role">Wiring Standards</span><span class="cred-name">IEC 60364 / IEC 60617</span></div>
        <div class="cred-entry"><span class="cred-role">Safety Standards</span><span class="cred-name">OSHS — DOLE Philippines</span></div>
      </div>
      <div class="cred-divider"></div>
      <div class="cred-tagline">
        WireVerse is an educational simulator designed to prepare TESDA trainees for real-world electrical installation and maintenance tasks.
      </div>
      <div class="cred-version">v1.0.0 — 2026</div>
    `;
  }

  // ── SETTINGS ────────────────────────────────────────────────────────────────

  function renderSettings() {
    const settings = DB.getSettings();
    const player = DB.getPlayer();

    const nameInput = document.getElementById('settingName');
    if (nameInput && player) nameInput.value = player.name;

    const musicToggle = document.getElementById('settingMusicOn');
    if (musicToggle) musicToggle.checked = settings.musicOn;

    const musicVol = document.getElementById('settingMusicVol');
    if (musicVol) musicVol.value = Math.round(settings.musicVol * 100);

    const sfxToggle = document.getElementById('settingSfxOn');
    if (sfxToggle) sfxToggle.checked = settings.sfxOn;

    const sfxVol = document.getElementById('settingSfxVol');
    if (sfxVol) sfxVol.value = Math.round(settings.sfxVol * 100);
  }

  function saveSettings() {
    const nameInput = document.getElementById('settingName');
    const newName = (nameInput?.value || '').trim();
    if (newName.length >= 2) {
      const player = DB.getPlayer() || {};
      DB.savePlayer({ ...player, name: newName });
      updateGreeting({ name: newName });
    }

    const settings = {
      musicOn: document.getElementById('settingMusicOn')?.checked ?? true,
      musicVol: (parseInt(document.getElementById('settingMusicVol')?.value || 70)) / 100,
      sfxOn: document.getElementById('settingSfxOn')?.checked ?? true,
      sfxVol: (parseInt(document.getElementById('settingSfxVol')?.value || 80)) / 100,
    };
    DB.saveSettings(settings);

    // Apply audio settings if Audio is available
    if (window.Audio && typeof window.Audio.setVolume === 'function') {
      window.Audio.setVolume(settings.musicVol);
    }

    showSaveConfirm();
  }

  function showSaveConfirm() {
    const msg = document.getElementById('settingsSaved');
    if (!msg) return;
    msg.style.opacity = '1';
    clearTimeout(msg._t);
    msg._t = setTimeout(() => { msg.style.opacity = '0'; }, 2000);
  }

  // ── GAME LAUNCH ─────────────────────────────────────────────────────────────

  function launchLevel(stageId, levelId) {
    window.currentStageId = stageId;
    window.currentLevelId = levelId;
    // Trigger the existing game init via the hidden #startBtn
    const btn = document.getElementById('startBtn');
    if (btn) btn.click();
  }

  // ── QUIT ─────────────────────────────────────────────────────────────────────

  function quitGame() {
    if (window.navigator && navigator.app && navigator.app.exitApp) {
      navigator.app.exitApp(); // Cordova Android
    } else if (window.device && window.device.platform === 'iOS') {
      // iOS doesn't allow programmatic exit; show a message instead
      const msg = document.getElementById('quitMsg');
      if (msg) { msg.style.display = 'flex'; }
    } else {
      window.close();
    }
  }

  // ── SHOW MENU (called when returning from game) ──────────────────────────────

  window.showMainMenu = function () {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'block';
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    ['btnTopTasks', 'btnPauseTop', 'toolBelt', 'stepProgress', 'feedbackLog', 'errorFlash'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    initMenu();
  };

  // ── EVENT BINDING ───────────────────────────────────────────────────────────

  function bind(id, event, fn) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(event, (e) => {
        if (event === 'click' && window.GameAudio) {
          if (typeof window.GameAudio.init === 'function') window.GameAudio.init();
          if (typeof window.GameAudio.click === 'function') window.GameAudio.click();
        }
        fn(e);
      });
    }
  }

  function bindAll() {
    // Main Menu
    bind('btnMenuStart', 'click', () => {
      showScreen('screenModeSelect');
    });

    // Mode Selection
    bind('btnModeScenario', 'click', () => {
      renderLevels(STAGES[0]);
      showScreen('screenLevels');
    });

    bind('btnModeLearnMode', 'click', () => {
      alert("Learn Electrician mode is coming soon!");
    });

    bind('btnModeSelectBack', 'click', () => {
      showScreen('screenMain');
    });
    
    bind('btnMenuLearn', 'click', () => {
      renderLearnSelect();
      showScreen('screenLearnSelect');
    });
    bind('btnLearnSelectBack', 'click', () => showScreen('screenMain'));
    bind('btnLearnSelectTheory', 'click', () => {
      renderLearn();
      showScreen('screenLearn');
    });
    bind('btnMenuSettings', 'click', () => {
      renderSettings();
      showScreen('screenSettings');
    });
    bind('btnMenuAchievements', 'click', () => {
      renderAchievements();
      showScreen('screenAchievements');
    });
    bind('btnMenuCredits', 'click', () => {
      renderCredits();
      showScreen('screenCredits');
    });
    bind('btnMenuQuit', 'click', quitGame);

    // Register
    bind('btnConfirmRegister', 'click', handleRegister);
    bind('playerNameInput', 'keydown', (e) => {
      if (e.key === 'Enter') handleRegister();
    });

    // Stages — back
    bind('btnStagesBack', 'click', () => showScreen('screenMain'));

    // Levels — back
    bind('btnLevelsBack', 'click', () => showScreen('screenStages'));

    // Mission Briefing
    bind('btnStartMission', 'click', () => {
      if (_pendingLaunch) {
        launchLevel(_pendingLaunch.stageId, _pendingLaunch.levelId);
        _pendingLaunch = null;
      }
    });
    bind('btnMissionBack', 'click', () => showScreen('screenLevels'));

    // Learn — back
    bind('btnLearnBack', 'click', () => { _learnPage = 0; showScreen('screenMain'); });

    // Achievements — back
    bind('btnAchievementsBack', 'click', () => showScreen('screenMain'));

    // Credits — back
    bind('btnCreditsBack', 'click', () => showScreen('screenMain'));

    // Settings — save & back
    bind('btnSettingsSave', 'click', () => {
      saveSettings();
      setTimeout(() => showScreen('screenMain'), 800);
    });
    bind('btnSettingsBack', 'click', () => showScreen('screenMain'));
    bind('btnResetProgress', 'click', () => {
      if (confirm('Reset all level progress? Your name and settings will be kept.')) {
        DB.resetProgress();
        renderStages();
        const msg = document.getElementById('resetDone');
        if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 2000); }
      }
    });

    // Quit overlay
    bind('btnQuitCancel', 'click', () => {
      const msg = document.getElementById('quitMsg');
      if (msg) msg.style.display = 'none';
    });
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────

  function init() {
    bindAll();
    initMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

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
  // Stage 1 = EXPLORE: 2 levels, each with 3 sub-tasks = 3 stars each (6 total)
  // Stage 2 = LEARN TECHNICIAN: direct scenario access, no world needed

  const STAGES = [
    {
      id: 1,
      title: 'EXPLORE',
      subtitle: 'Roam the facility — 2 stages, 3 stars each, 6 total',
      color: '#FFD700',
      iconSym: '⚡',
      levels: [
        {
          id: 1,
          title: 'Outlet Repair',
          subtitle: 'Find & fix 3 faulty outlets across the facility',
          type: 'outlet-all',
          totalStars: 3,
          icon: '🔌',
          desc: 'Three outlets have faults. Walk the facility, find each one, and complete the repair scenario. Earn 1 star per outlet — 3 stars total.',
          duration: '15 min',
          tasks: [
            { label: 'Entrance Outlet', location: 'Entrance Hall', outletId: 1 },
            { label: 'Workshop 1 Outlet', location: 'Workshop 1', outletId: 2 },
            { label: 'Workshop 2 Outlet', location: 'Workshop 2', outletId: 3 },
          ],
        },
        {
          id: 2,
          title: 'Switch Installation',
          subtitle: 'Wire 3 switch stations across the facility',
          type: 'switch-all',
          totalStars: 3,
          icon: '💡',
          desc: 'Three switch stations need wiring. Approach each station and complete the wiring scenario. Earn 1 star per switch — 3 stars total.',
          duration: '20 min',
          tasks: [
            { label: '1-Way Switch', location: 'Workshop 1 — south', stationId: 1 },
            { label: '2-Way Switch', location: 'Workshop 1 — east', stationId: 2 },
            { label: '3-Way Switch', location: 'Workshop 2 — west', stationId: 3 },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'LEARN TECHNICIAN',
      subtitle: 'Guided scenarios — practice wiring step by step',
      color: '#22c55e',
      iconSym: '📚',
      levels: [
        {
          id: 1,
          title: '1-Way Switch',
          subtitle: 'Single-pole switch circuit — guided',
          type: 'switch-learn',
          switchType: '1way',
          icon: '💡',
          desc: 'Learn to wire a single-pole (1-way) switch. Follow on-screen instructions to complete the circuit safely.',
          duration: '8 min',
        },
        {
          id: 2,
          title: '2-Way Switch',
          subtitle: 'Two-location switch circuit — guided',
          type: 'switch-learn',
          switchType: '2way',
          icon: '💡',
          desc: 'Learn to wire a 2-way switch circuit — control one light from two locations. Each connection is explained step by step.',
          duration: '10 min',
        },
        {
          id: 3,
          title: '3-Way Switch',
          subtitle: 'Three-location switch system — guided',
          type: 'switch-learn',
          switchType: '3way',
          icon: '💡',
          desc: 'Learn the advanced 3-way switch circuit. Each wire and connection is explained step by step with visual guidance.',
          duration: '15 min',
        },
      ],
    },
  ];

  // ── ASSESSMENT QUESTIONS ───────────────────────────────────────────────────
  const ASSESSMENT_QUESTIONS = [
    {
      q: 'What is the IEC color code for the LIVE (Line) wire?',
      options: ['Brown', 'Blue', 'Green/Yellow', 'Black'],
      correct: 0,
    },
    {
      q: 'What does LOTO stand for in electrical safety?',
      options: ['Lockout/Tagout', 'Live Output Testing Only', 'Line Overlap Turn Off', 'Low Output Tag Override'],
      correct: 0,
    },
    {
      q: 'What is the purpose of a circuit breaker?',
      options: [
        'Protects against overload and short circuits',
        'Measures current flow in a circuit',
        'Converts AC power to DC power',
        'Amplifies voltage for heavy loads',
      ],
      correct: 0,
    },
    {
      q: 'What tool is used to measure voltage in a circuit?',
      options: ['Multimeter', 'Wire Stripper', 'Insulated Screwdriver', 'Crimping Tool'],
      correct: 0,
    },
    {
      q: 'In a 2-way switch circuit, what connects the two switches?',
      options: ['Traveler wires', 'Neutral wires', 'Earth/Ground wires', 'Phase conductors'],
      correct: 0,
    },
    {
      q: 'What is the IEC color code for the NEUTRAL wire?',
      options: ['Blue', 'Brown', 'Green/Yellow', 'Red'],
      correct: 0,
    },
    {
      q: 'Before working on an electrical outlet, what must you do FIRST?',
      options: [
        'De-energize the circuit (turn off the breaker)',
        'Test the outlet with a multimeter while live',
        'Connect the earth wire to the casing',
        'Loosen all terminal screws',
      ],
      correct: 0,
    },
    {
      q: 'How many terminals does a standard single-pole (1-way) switch have?',
      options: ['2 terminals', '3 terminals', '4 terminals', '1 terminal'],
      correct: 0,
    },
    {
      q: 'What is the purpose of the Earth/Ground (PE) wire in an outlet?',
      options: [
        'Safety — diverts fault current to ground to prevent electrocution',
        'Carries the main supply current to the load',
        'Connects the neutral bar to the switch',
        'Completes the live circuit loop',
      ],
      correct: 0,
    },
    {
      q: 'In a 3-way switch system, what does the intermediate (4-way) switch do?',
      options: [
        'Reverses the traveler wire connections to allow control from a third location',
        'Disconnects the live wire as a safety measure',
        'Acts as a neutral connection point between switches',
        'Provides extra circuit breaker protection',
      ],
      correct: 0,
    },
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
      // EXPLORE: 6 total stars (3 per level × 2 levels)
      let completed = 0, total = 0;
      if (stage.id === 1) {
        completed = DB.getExploreStarCount?.() || 0;
        total = 6;
      } else {
        const prog = DB.getProgress()[stage.id] || {};
        completed = Object.values(prog).filter(l => l.completed).length;
        total = stage.levels.length;
      }

      const allDone = completed >= total;
      const card = document.createElement('div');
      card.className = 'stage-card' + (allDone ? ' stage-complete' : '');

      // Star row for EXPLORE stage
      const starRow = stage.id === 1 ? (() => {
        const os = DB.getOutletStars?.() || 0;
        const ss = DB.getSwitchStars?.() || 0;
        const outletStars = [0,1,2].map(i => `<span style="font-size:15px;color:${i<os?'#FFD700':'rgba(255,215,0,.15)'};margin:0 1px;">★</span>`).join('');
        const switchStars = [0,1,2].map(i => `<span style="font-size:15px;color:${i<ss?'#FFD700':'rgba(255,215,0,.15)'};margin:0 1px;">★</span>`).join('');
        return `<div style="display:flex;gap:10px;align-items:center;margin-top:4px;">
          <span style="font-size:9px;color:rgba(255,255,255,.4);font-family:'Barlow Condensed',sans-serif;letter-spacing:.1em;">OUTLET</span>${outletStars}
          <span style="font-size:9px;color:rgba(255,255,255,.4);font-family:'Barlow Condensed',sans-serif;letter-spacing:.1em;">SWITCH</span>${switchStars}
        </div>`;
      })() : '';

      card.innerHTML = `
        <div class="stage-icon" style="color:${stage.color};">${stage.iconSym}</div>
        <div class="stage-info">
          <div class="stage-title" style="color:${stage.color};">${stage.title}${allDone ? ' <span style="font-size:11px;color:#22c55e;letter-spacing:1px;">COMPLETE</span>' : ''}</div>
          <div class="stage-sub">${stage.subtitle}</div>
          ${starRow}
          <div class="stage-prog" style="margin-top:6px;">
            <div class="stage-prog-bar">
              <div class="stage-prog-fill" style="width:${completed / total * 100}%;background:${stage.color};"></div>
            </div>
            <span class="stage-prog-label">${completed}/${total} ${stage.id === 1 ? 'STARS' : 'LEVELS'}</span>
          </div>
        </div>
        <div class="stage-arrow">▶</div>
      `;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (window.GameAudio) { window.GameAudio.init?.(); window.GameAudio.click?.(); }
        renderLevels(stage);
        showScreen('screenLevels');
      });
      container.appendChild(card);

      // For EXPLORE — show assessment card when all 6 done
      if (stage.id === 1 && allDone) {
        const assessCard = document.createElement('div');
        assessCard.className = 'stage-card stage-complete';
        assessCard.style.cssText = 'cursor:pointer;border-color:rgba(255,184,0,0.55);background:rgba(30,50,20,0.3);';
        const prevAssess = DB.getAssessment();
        assessCard.innerHTML = `
          <div class="stage-icon" style="color:#22c55e;font-size:20px;">📋</div>
          <div class="stage-info">
            <div class="stage-title" style="color:#22c55e;">ASSESSMENT${prevAssess ? ' <span style="font-size:10px;color:#aaa;">RETAKE</span>' : ''}</div>
            <div class="stage-sub">Test your knowledge — 10 questions</div>
            ${prevAssess ? `<div class="stage-prog"><span class="stage-prog-label" style="color:#22c55e;">Last score: ${prevAssess.score}/${prevAssess.total} (${prevAssess.pct}%)</span></div>` : '<div class="stage-prog"><span class="stage-prog-label" style="color:#FFD700;">UNLOCKED — All scenarios complete!</span></div>'}
          </div>
          <div class="stage-arrow">▶</div>
        `;
        assessCard.addEventListener('click', () => {
          if (window.GameAudio) { window.GameAudio.init?.(); window.GameAudio.click?.(); }
          renderAssessment();
          showScreen('screenAssessment');
        });
        container.appendChild(assessCard);
      }
    });
  }

  // ── LEVEL SELECTION ─────────────────────────────────────────────────────────

  function renderLevels(stage) {
    const titleEl = document.getElementById('levelScreenTitle');
    if (titleEl) titleEl.textContent = stage.title;

    const subEl = document.getElementById('levelScreenSub');
    if (subEl) subEl.textContent = stage.id === 1
      ? 'COMPLETE ALL 6 STARS TO UNLOCK THE ASSESSMENT'
      : 'GUIDED SCENARIOS — PRACTICE WIRING STEP BY STEP';

    const container = document.getElementById('levelsList');
    if (!container) return;
    container.innerHTML = '';

    const isExplore = stage.id === 1;
    const outletsDone = isExplore ? (DB.getExploreOutlets?.() || {}) : {};
    const switchesDone = isExplore ? (DB.getExploreSwitches?.() || {}) : {};

    stage.levels.forEach(level => {
      const isOutletAll = level.type === 'outlet-all';
      const isSwitchAll = level.type === 'switch-all';

      // Per-task completion for explore levels
      let tasksDone = 0;
      if (isOutletAll) tasksDone = [1,2,3].filter(id => outletsDone[id]?.completed).length;
      if (isSwitchAll) tasksDone = [1,2,3].filter(id => switchesDone[id]?.completed).length;

      const levelComplete = isExplore ? tasksDone >= 3 : (DB.getLevelProgress(stage.id, level.id)?.completed === true);

      // 3-star row for explore levels, plain for learn
      const starsHTML = isExplore
        ? [0,1,2].map(i => `<span style="font-size:20px;color:${i<tasksDone?'#FFD700':'rgba(255,215,0,0.15)'};margin:0 2px;text-shadow:${i<tasksDone?'0 0 8px rgba(255,215,0,0.6)':'none'};">★</span>`).join('')
        : '';

      // Task checklist for explore levels
      const taskListHTML = isExplore ? `
        <div style="margin:8px 0 4px;display:flex;flex-direction:column;gap:4px;">
          ${(level.tasks || []).map(t => {
            const done = isOutletAll ? !!outletsDone[t.outletId]?.completed : !!switchesDone[t.stationId]?.completed;
            return `<div style="display:flex;align-items:center;gap:8px;font-size:11px;color:${done?'#22c55e':'rgba(255,255,255,0.45)'};">
              <span style="font-size:13px;">${done?'✓':'○'}</span>
              <span>${t.label}</span>
              <span style="font-size:10px;color:rgba(255,255,255,0.25);margin-left:auto;">${t.location}</span>
            </div>`;
          }).join('')}
        </div>` : '';

      // Type badge
      const typeMap = {
        'outlet-all':   `<span class="lv-badge" style="background:rgba(255,200,0,.1);border-color:rgba(255,200,0,.35);color:#FFD700;">3 OUTLETS</span>`,
        'switch-all':   `<span class="lv-badge" style="background:rgba(59,130,246,.1);border-color:rgba(59,130,246,.35);color:#60a5fa;">3 SWITCHES</span>`,
        'outlet-learn': `<span class="lv-badge" style="background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.35);color:#22c55e;">GUIDED</span>`,
        'switch-learn': `<span class="lv-badge" style="background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.35);color:#22c55e;">GUIDED</span>`,
      };
      const typeTag = typeMap[level.type] || '';

      const card = document.createElement('div');
      card.className = 'level-card' + (levelComplete ? ' level-completed' : ' level-unlocked');
      card.innerHTML = `
        <div class="level-num" style="color:${stage.color};font-size:28px;">${level.icon || (isExplore ? '⚡' : '📚')}</div>
        <div class="level-info">
          <div class="level-title">${level.title}${levelComplete ? ' <span class="level-done-badge">✓ DONE</span>' : ''}</div>
          ${level.subtitle ? `<div style="font-size:10px;color:rgba(255,255,255,.35);margin-bottom:4px;">${level.subtitle}</div>` : ''}
          <div class="level-desc">${level.desc || ''}</div>
          ${taskListHTML}
          <div class="level-meta" style="margin-top:6px;">
            <span class="level-dur">⏱ ${level.duration || ''}</span>
            ${starsHTML ? `<span class="level-stars" style="margin-left:auto;">${starsHTML}</span>` : ''}
            ${typeTag}
          </div>
        </div>
        <div class="level-action">
          <button class="btn-play" data-stage="${stage.id}" data-level="${level.id}" style="background:${stage.color};color:#060e14;">
            ${levelComplete ? 'REPLAY' : 'PLAY'}
          </button>
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

    // Parse step list from desc (handles both plain text and legacy HTML)
    const steps = (level.desc || '')
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

  // renderLearnSelect() and SWITCH_TYPES removed — Learn Technician now routes directly via launchLevel()

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

    // ── EXPLORE Stars ───────────────────────────────────────────────────────
    const exploreHeader = document.createElement('div');
    exploreHeader.className = 'ach-stage-header';
    exploreHeader.innerHTML = `<span style="color:#FFD700;">⚡</span> EXPLORE — SCENARIO STARS`;
    container.appendChild(exploreHeader);

    const exploreStage = STAGES.find(s => s.id === 1);
    const exploreProg = DB.getExploreProgress ? DB.getExploreProgress() : {};
    (exploreStage?.levels || []).forEach(level => {
      const done = exploreProg[level.id]?.completed === true;
      if (done) anyProgress = true;
      const card = document.createElement('div');
      card.className = 'ach-card' + (done ? ' ach-card-done' : '');
      card.style.opacity = done ? '1' : '0.45';
      card.innerHTML = `
        <div class="ach-lvl-badge" style="color:#FFD700;font-size:16px;">${level.icon || '⚡'}</div>
        <div class="ach-info">
          <div class="ach-title">${level.title}</div>
          <div class="ach-stars" style="font-size:11px;color:rgba(255,255,255,.45);margin-top:2px;">${level.subtitle || ''}</div>
        </div>
        <div class="ach-status">
          ${done
            ? '<span class="ach-done-badge">★ EARNED</span>'
            : '<span class="ach-inprog-badge">NOT DONE</span>'}
        </div>
      `;
      container.appendChild(card);
    });

    // ── Assessment Score ────────────────────────────────────────────────────
    const assessData = DB.getAssessment ? DB.getAssessment() : null;
    if (assessData) {
      const assessHeader = document.createElement('div');
      assessHeader.className = 'ach-stage-header';
      assessHeader.style.marginTop = '16px';
      assessHeader.innerHTML = `<span style="color:#22c55e;">📋</span> ASSESSMENT RESULT`;
      container.appendChild(assessHeader);
      const gradeColor = assessData.pct >= 90 ? '#22c55e' : assessData.pct >= 75 ? '#FFD700' : assessData.pct >= 60 ? '#f59e0b' : '#ef4444';
      const aCard = document.createElement('div');
      aCard.className = 'ach-card ach-card-done';
      aCard.innerHTML = `
        <div class="ach-lvl-badge" style="color:${gradeColor};font-size:20px;">📋</div>
        <div class="ach-info">
          <div class="ach-title" style="color:${gradeColor};">${assessData.score}/${assessData.total} — ${assessData.pct}%</div>
          <div class="ach-stars" style="font-size:11px;color:rgba(255,255,255,.45);margin-top:2px;">Final assessment score</div>
        </div>
        <div class="ach-status"><span class="ach-done-badge" style="background:${gradeColor}22;border-color:${gradeColor}55;color:${gradeColor};">DONE</span></div>
      `;
      container.appendChild(aCard);
      anyProgress = true;
    }

    // ── Switch Wiring Achievements ──────────────────────────────────────────
    const unlockedAch = DB.getAchievements ? DB.getAchievements() : {};
    const switchHeader = document.createElement('div');
    switchHeader.className = 'ach-stage-header';
    switchHeader.style.marginTop = '16px';
    switchHeader.innerHTML = `<span style="color:#60a5fa;">💡</span> WIRING ACHIEVEMENTS`;
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

    if (!anyProgress) {
      container.innerHTML = `
        <div class="ach-empty">
          <div class="ach-empty-icon">🔒</div>
          <div class="ach-empty-title">NO ACHIEVEMENTS YET</div>
          <div class="ach-empty-sub">Complete scenarios in Explore mode to earn stars and achievements.</div>
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

    const stage = STAGES.find(s => s.id === stageId);
    const level = stage?.levels.find(l => l.id === levelId);

    if (!level) return;

    // ── EXPLORE (Stage 1) ───────────────────────────────────────────────────
    if (stageId === 1) {
      window.exploreMode  = true;
      window.exploreType  = level.type;  // 'outlet-all' | 'switch-all'
      window.learnMode    = false;
      const btn = document.getElementById('startBtn');
      if (btn) btn.click();
      return;
    }

    // ── LEARN TECHNICIAN (Stage 2) ──────────────────────────────────────────
    if (stageId === 2) {
      if (level.type === 'switch-learn') {
        window.location.href = `scenario2.html?type=${level.switchType}&from=learn`;
      }
      return;
    }
  }

  // ── ASSESSMENT ──────────────────────────────────────────────────────────────

  let _assessAnswers = [];

  function renderAssessment() {
    const container = document.getElementById('assessmentQuestions');
    if (!container) return;
    _assessAnswers = new Array(ASSESSMENT_QUESTIONS.length).fill(null);

    container.innerHTML = ASSESSMENT_QUESTIONS.map((q, qi) => `
      <div class="assess-q" id="aq-${qi}">
        <div class="assess-q-text"><span class="assess-q-num">${qi + 1}</span>${q.q}</div>
        <div class="assess-options">
          ${q.options.map((opt, oi) =>
            `<button class="assess-opt" data-q="${qi}" data-o="${oi}">${opt}</button>`
          ).join('')}
        </div>
      </div>
    `).join('');

    // Bind option clicks
    container.querySelectorAll('.assess-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const qi = parseInt(btn.dataset.q);
        const oi = parseInt(btn.dataset.o);
        _assessAnswers[qi] = oi;
        // Highlight selected
        container.querySelectorAll(`.assess-opt[data-q="${qi}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        // Update submit button
        const allAnswered = _assessAnswers.every(a => a !== null);
        const submitBtn = document.getElementById('btnSubmitAssessment');
        if (submitBtn) {
          submitBtn.disabled = !allAnswered;
          submitBtn.style.opacity = allAnswered ? '1' : '0.4';
        }
      });
    });

    // Reset submit button
    const submitBtn = document.getElementById('btnSubmitAssessment');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.4'; }
  }

  function submitAssessment() {
    const score = _assessAnswers.reduce((acc, ans, i) =>
      acc + (ans === ASSESSMENT_QUESTIONS[i].correct ? 1 : 0), 0);
    const total = ASSESSMENT_QUESTIONS.length;
    DB.saveAssessment(score, total);

    // Show results
    const el = document.getElementById('assessResultContent');
    if (el) {
      const pct = Math.round(score / total * 100);
      const grade = pct >= 90 ? 'EXCELLENT' : pct >= 75 ? 'PASSED' : pct >= 60 ? 'SATISFACTORY' : 'NEEDS REVIEW';
      const gradeColor = pct >= 90 ? '#22c55e' : pct >= 75 ? '#FFD700' : pct >= 60 ? '#f59e0b' : '#ef4444';

      el.innerHTML = `
        <div class="ar-score" style="color:${gradeColor};">${score}/${total}</div>
        <div class="ar-pct" style="color:${gradeColor};">${pct}%</div>
        <div class="ar-grade" style="color:${gradeColor};">${grade}</div>
        <div class="ar-bar-wrap">
          <div class="ar-bar" style="width:${pct}%;background:${gradeColor};"></div>
        </div>
        <div class="ar-review">
          ${ASSESSMENT_QUESTIONS.map((q, i) => {
            const userAns = _assessAnswers[i];
            const correct = q.correct;
            const ok = userAns === correct;
            return `
              <div class="ar-item ${ok ? 'ar-ok' : 'ar-wrong'}">
                <span class="ar-item-icon">${ok ? '✓' : '✗'}</span>
                <div>
                  <div class="ar-item-q">${q.q}</div>
                  ${!ok ? `<div class="ar-item-ans">Correct: <strong>${q.options[correct]}</strong></div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    showScreen('screenAssessmentResult');
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
      renderStages();
      showScreen('screenStages');
    });

    bind('btnMenuLearn', 'click', () => {
      renderLearn();
      showScreen('screenLearn');
    });
    bind('btnLearnSelectBack', 'click', () => showScreen('screenMain'));
    bind('btnLearnSelectTheory', 'click', () => {
      renderLearn(); showScreen('screenLearn');
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

    // Learn (Study Guide) — back
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
      if (confirm('Reset all progress? Your name and settings will be kept.')) {
        DB.resetProgress();
        renderStages();
        const msg = document.getElementById('resetDone');
        if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 2000); }
      }
    });

    // Assessment
    bind('btnAssessmentBack', 'click', () => showScreen('screenStages'));
    bind('btnSubmitAssessment', 'click', submitAssessment);
    bind('btnAssessResultBack', 'click', () => { renderStages(); showScreen('screenStages'); });

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

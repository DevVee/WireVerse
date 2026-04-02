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
      title: 'NC II — FUNDAMENTALS',
      subtitle: 'Electrical Safety & Basic Circuits',
      color: '#FFB800',
      iconSym: '⚡',
      levels: [
        {
          id: 1,
          title: 'Safety & Tools',
          desc: 'Electrical safety rules, PPE usage, and basic hand tools identification.',
          duration: '15 min',
        },
        {
          id: 2,
          title: 'Component ID',
          desc: 'Identify resistors, capacitors, switches, circuit breakers, and wires.',
          duration: '20 min',
        },
        {
          id: 3,
          title: 'Basic Wiring',
          desc: 'Wire a simple L–N–PE circuit in the panel board using IEC 60446 standards.',
          duration: '25 min',
        },
        {
          id: 4,
          title: 'Schematic Reading',
          desc: 'Interpret IEC electrical diagrams and map them onto virtual assemblies.',
          duration: '20 min',
        },
      ],
    },
    {
      id: 2,
      title: 'NC II — INSTALLATION',
      subtitle: 'Panel Board & Circuit Protection',
      color: '#44a0ff',
      iconSym: '🔌',
      levels: [
        {
          id: 1,
          title: 'Residential Wiring',
          desc: 'Branch circuit wiring for a residential load with proper colour coding.',
          duration: '30 min',
        },
        {
          id: 2,
          title: 'Panel Board Setup',
          desc: 'Install MCBs and distribution board connections with correct terminal torque.',
          duration: '30 min',
        },
        {
          id: 3,
          title: 'Circuit Protection',
          desc: 'Configure ELCB and overcurrent protection devices for safe operation.',
          duration: '25 min',
        },
        {
          id: 4,
          title: 'NC II Assessment',
          desc: 'Full timed competency simulation exam aligned to TESDA NC II standards.',
          duration: '45 min',
        },
      ],
    },
    {
      id: 3,
      title: 'NC III — MOTOR CONTROL',
      subtitle: 'Motor Control Systems',
      color: '#ff6644',
      iconSym: '⚙',
      levels: [
        {
          id: 1,
          title: 'Motor Components',
          desc: 'Identify contactors, thermal overload relays, and motor protection devices.',
          duration: '20 min',
        },
        {
          id: 2,
          title: 'DOL Starter',
          desc: 'Wire a Direct-On-Line motor starter circuit with control and power circuits.',
          duration: '35 min',
        },
        {
          id: 3,
          title: 'Reverse-Forward',
          desc: 'Implement a reversing motor control scheme with interlocking contactors.',
          duration: '35 min',
        },
        {
          id: 4,
          title: 'NC III Assessment',
          desc: 'Full motor control competency exam — timed, scored, and TESDA-aligned.',
          duration: '45 min',
        },
      ],
    },
  ];

  // ── LEARN MODULE CONTENT ────────────────────────────────────────────────────

  const LEARN_MODULES = [
    {
      title: 'Electrical Safety & Standards',
      icon: '🦺',
      content: `
        <p>All electrical work must comply with the Philippine Electrical Code (PEC) and TESDA competency standards.</p>
        <ul>
          <li><strong>PPE:</strong> Insulated gloves, safety glasses, and non-conductive footwear are mandatory before any live work.</li>
          <li><strong>Lockout/Tagout (LOTO):</strong> Always de-energize and tag out circuits before installation or maintenance.</li>
          <li><strong>Safe voltage levels:</strong> Voltages above 50V AC or 120V DC are considered hazardous.</li>
          <li><strong>IEC color codes:</strong> L = Brown, N = Blue, PE (Earth) = Green/Yellow.</li>
          <li><strong>Fire safety:</strong> Know the location of Class C fire extinguishers and electrical isolation points.</li>
        </ul>
      `,
    },
    {
      title: 'Basic Circuit Components',
      icon: '🔩',
      content: `
        <p>Electrical circuits consist of components that control, protect, and distribute electrical energy.</p>
        <ul>
          <li><strong>Resistor:</strong> Limits current flow. Measured in Ohms (Ω).</li>
          <li><strong>Capacitor:</strong> Stores electrical charge. Used in power factor correction.</li>
          <li><strong>Switch:</strong> Opens or closes a circuit path manually.</li>
          <li><strong>Circuit Breaker (MCB):</strong> Automatically trips to protect against overcurrent.</li>
          <li><strong>Fuse:</strong> Sacrificial protection device — melts when overcurrent occurs.</li>
          <li><strong>Terminal Block:</strong> Used to connect wires securely at distribution panels.</li>
          <li><strong>ELCB/RCD:</strong> Earth Leakage Circuit Breaker — detects earth faults and trips instantly.</li>
        </ul>
      `,
    },
    {
      title: 'Wiring Systems & Schematic Reading',
      icon: '📐',
      content: `
        <p>Wiring systems must follow the Philippine Electrical Code and IEC standards for safety and reliability.</p>
        <ul>
          <li><strong>TPS cable:</strong> Twin and Earth (or Three-core) PVC-sheathed cable for indoor fixed wiring.</li>
          <li><strong>Conduit wiring:</strong> Wires run inside metal or PVC conduit for mechanical protection.</li>
          <li><strong>Wire gauge:</strong> Chosen based on load current (ampacity). Common: 2.5mm² for 20A circuits.</li>
          <li><strong>Schematic symbols:</strong> IEC 60617 standard — know symbols for switches, lamps, motors, relays.</li>
          <li><strong>Single-line diagram:</strong> Simplified representation showing power flow without exact wire routing.</li>
          <li><strong>Wiring diagram:</strong> Shows actual connections between all components.</li>
        </ul>
      `,
    },
    {
      title: 'Panel Board Installation',
      icon: '🗂',
      content: `
        <p>The distribution panel board is the heart of any electrical installation — it distributes power and provides protection.</p>
        <ul>
          <li><strong>Main breaker:</strong> Isolates the entire panel. Sized to the total connected load plus a safety factor.</li>
          <li><strong>Branch circuit breakers:</strong> Each circuit has its own MCB rated at 15A or 20A for typical residential loads.</li>
          <li><strong>Bus bar:</strong> Copper bar connecting all breakers to the incoming supply.</li>
          <li><strong>Neutral bar:</strong> All neutral conductors terminate here; must be isolated from the enclosure.</li>
          <li><strong>Earth bar:</strong> All PE conductors and enclosure bonding terminate here.</li>
          <li><strong>Torque settings:</strong> Terminals must be tightened to the manufacturer's torque specification to prevent loose connections.</li>
        </ul>
      `,
    },
    {
      title: 'Motor Control Systems',
      icon: '⚙',
      content: `
        <p>Motor control is a core competency for NC III. It involves starting, stopping, reversing, and protecting electric motors.</p>
        <ul>
          <li><strong>Contactor:</strong> Electromechanical switch for high-current motor circuits, operated by a 24V or 230V coil.</li>
          <li><strong>Thermal Overload Relay:</strong> Protects motor windings from overheating due to sustained overcurrent.</li>
          <li><strong>DOL Starter (Direct-On-Line):</strong> Simplest starting method — applies full voltage directly. Suitable for small motors.</li>
          <li><strong>Star-Delta Starter:</strong> Reduces starting current by first connecting motor in star (Y), then switching to delta (Δ).</li>
          <li><strong>Reverse-Forward Circuit:</strong> Two contactors with mechanical and electrical interlocking to reverse motor direction.</li>
          <li><strong>Control circuit:</strong> 230V or 24V circuit using push buttons, timers, and auxiliary contacts to control the power circuit.</li>
          <li><strong>Power circuit:</strong> Carries full motor current from the supply through the contactor to the motor terminals.</li>
        </ul>
      `,
    },
  ];

  // ── STATE ───────────────────────────────────────────────────────────────────

  let _selectedStage = null;

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
          _selectedStage = stage;
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

    // Bind play buttons
    container.querySelectorAll('.btn-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sId = parseInt(e.target.dataset.stage);
        const lId = parseInt(e.target.dataset.level);
        launchLevel(sId, lId);
      });
    });
  }

  // ── LEARN ───────────────────────────────────────────────────────────────────

  function renderLearn() {
    const container = document.getElementById('learnList');
    if (!container) return;
    container.innerHTML = '';

    LEARN_MODULES.forEach((mod, idx) => {
      const item = document.createElement('div');
      item.className = 'learn-card';
      item.innerHTML = `
        <div class="learn-header" data-idx="${idx}">
          <span class="learn-icon">${mod.icon}</span>
          <span class="learn-title">${mod.title}</span>
          <span class="learn-chevron">▼</span>
        </div>
        <div class="learn-body" id="learnBody${idx}" style="display:none;">${mod.content}</div>
      `;
      container.appendChild(item);

      item.querySelector('.learn-header').addEventListener('click', () => {
        const body = document.getElementById('learnBody' + idx);
        const chevron = item.querySelector('.learn-chevron');
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : 'block';
        if (chevron) chevron.textContent = open ? '▼' : '▲';
      });
    });
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
    ['rightActionBar', 'btnPauseTop', 'toolBelt', 'stepProgress', 'feedbackLog', 'errorFlash'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    initMenu();
  };

  // ── EVENT BINDING ───────────────────────────────────────────────────────────

  function bind(id, event, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
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
    bind('btnMenuSettings', 'click', () => {
      renderSettings();
      showScreen('screenSettings');
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

    // Learn — back
    bind('btnLearnBack', 'click', () => showScreen('screenMain'));

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

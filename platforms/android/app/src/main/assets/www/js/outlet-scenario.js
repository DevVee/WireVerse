/**
 * outlet-scenario.js
 * Full inline outlet-repair mini-game running inside the main game's page.
 * Uses its OWN dedicated Three.js renderer on #outletCanvas — completely
 * isolated from the main world so there is zero lag or conflict.
 *
 * Public API:
 *   initOutletScenario(onFixedCallback)  — call once after DOM ready
 *   openOutlet(socketId)                 — show overlay, run scenario
 *   closeOutlet()                        — hide overlay, pause renderer
 */

import * as THREE from 'three';
import { initOutletTutorial, outletTutOnStateChange } from './tutorial-guide.js';

// Player is provided by the main 3D world via window.Player.
// In standalone mode (Learn Technician page) window.Player is a no-op stub.
const _getPlayer = () => window.Player || null;

// ─── Private state ───────────────────────────────────────────────────────────
let _renderer = null, _scene, _camera, _clock;
let _open = false;
let _socketId = 1;
let _onFixed = null;

// ─── DOM helper ──────────────────────────────────────────────────────────────
const $o = id => document.getElementById('or-' + id);

// ─── 3D objects (built ONCE, reused every repair) ────────────────────────────
let outletRoot, faceGroup, facePlate, screwGroup, screwHead, washer, internalGroup;
let terminalMeshes = [], wireMeshes = [], looseWirePts = [];
const wireColors3D = [0xb45309, 0x3b82f6, 0x22c55e];
const wireNames    = ['brown', 'blue', 'green'];
let bkHandle, bkHandleMat, bkLEDMat, jBox;
let BX, BY, BZ, HANDLE_ON_Y, HANDLE_OFF_Y;

// ─── Raycaster ───────────────────────────────────────────────────────────────
let raycaster, mouse;
let clickScrewObjs = [], clickBreakerObjs = [];

// ─── Game state ───────────────────────────────────────────────────────────────
let gameState, selectedTool, wiresState, completedTasks, timerVal, timerRunning;
let _touchWire  = null; // shared between drag-drop and canvas events
let _touchClone = null; // ghost clone element that follows the finger

// ─── Animation state ──────────────────────────────────────────────────────────
let screwRemoving, screwSpinT, screwReattaching, screwReattachT;
let coverOpening, coverOpenT, coverClosing, coverCloseT;
let bkAnimating, bkAnimT, bkGoingOff, bkCB;
let inspecting, inspectT;
let camFrom, camTo, camLookFrom, camLookTo, camTweening, camT, camDur, camCB;
let idleT;
let tutTarget3D;
let timerInterval = null;

// ─── Tutorial DOM refs ────────────────────────────────────────────────────────
let tgtRing, tgtPulse, tgtLabel, bkTip;
let toastTimer, camHintTimer;

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export function initOutletScenario(onFixedCallback) {
  _onFixed = onFixedCallback;
  _initThree();   // build renderer + scene ONCE
  _initDOMRefs();
  _initDragDrop();
  _initCanvasEvents();
  _loop();        // starts paused (_open=false so returns immediately)
}

export function openOutlet(socketId) {
  _socketId = socketId;

  // Show the overlay
  const overlay = document.getElementById('outletRepairOverlay');
  if (overlay) overlay.style.display = 'block';

  // Make sure canvas is visible and renderer is sized correctly
  const canvas = document.getElementById('outletCanvas');
  if (canvas && _renderer) {
    // Force layout so clientWidth/clientHeight are valid
    requestAnimationFrame(() => {
      const w = canvas.clientWidth  || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      _renderer.setSize(w, h);
      _camera.aspect = w / h;
      
      // Auto-scale FOV for narrow mobile screens to prevent clipping the breaker & outlet
      if (w < h) {
        _camera.fov = 42 * (h / w) * 0.75;
        if (_camera.fov > 70) _camera.fov = 70;
      } else {
        _camera.fov = 42;
      }
      
      _camera.updateProjectionMatrix();
    });
  }

  // Update socket label
  const LABELS = { 1: 'Lobby', 2: 'Wiring Lab', 3: 'Corridor', 4: 'Control Room', 5: 'Tool Room' };
  const lbl = document.getElementById('or-socket-label');
  if (lbl) lbl.textContent = `Socket #${socketId} — ${LABELS[socketId] || 'Room'}`;

  // Freeze player (no-op in standalone learn mode)
  const _p = _getPlayer(); if (_p) _p.state = 'repair';

  _resetAll();

  // Show Sir Juan intro tutorial on first outlet open
  try { initOutletTutorial(); } catch(e) {}

  if (!_open) {
    _open = true;
    _loop();
  }
}

export function closeOutlet() {
  _open = false;
  const overlay = document.getElementById('outletRepairOverlay');
  if (overlay) overlay.style.display = 'none';
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  // Restore player (no-op in standalone learn mode)
  const _pr = _getPlayer(); if (_pr) _pr.state = 'standing';
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREE.JS INIT — runs ONCE at startup
// ═══════════════════════════════════════════════════════════════════════════════

function _initThree() {
  const canvas = document.getElementById('outletCanvas');
  if (!canvas) { console.error('[outlet-scenario] #outletCanvas not found'); return; }

  _renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  _renderer.setPixelRatio(1.0);
  _renderer.shadowMap.enabled = false; // shadows off — matches main renderer
  // Use window dimensions as the canvas is hidden until openOutlet()
  _renderer.setSize(window.innerWidth, window.innerHeight);

  _scene = new THREE.Scene();
  _scene.background = new THREE.Color(0x151210);
  _scene.fog = new THREE.Fog(0x151210, 12, 24);

  _camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  _camera.position.set(1.2, 0.8, 6.5);
  _camera.lookAt(0, 0, 0);

  _clock = new THREE.Clock();

  // ── Lighting ────────────────────────────────────────────────────────────
  _scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  const spot = new THREE.SpotLight(0xfff4e0, 3.0, 22, Math.PI * 0.16, 0.25);
  spot.position.set(1, 7, 6); spot.castShadow = true;
  _scene.add(spot); _scene.add(spot.target);
  const rim  = new THREE.DirectionalLight(0x4488ff, 0.30);
  rim.position.set(-4, 2, -3); _scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.40);
  fill.position.set(-6, 3, 5); _scene.add(fill);
  // Warm accent below
  const under = new THREE.PointLight(0xff8833, 0.35, 8);
  under.position.set(0, -3, 3); _scene.add(under);

  raycaster = new THREE.Raycaster();
  mouse     = new THREE.Vector2();
  camFrom   = new THREE.Vector3();
  camTo     = new THREE.Vector3();
  camLookFrom = new THREE.Vector3();
  camLookTo   = new THREE.Vector3();

  _buildScene();

  // Resize on window resize
  window.addEventListener('resize', () => {
    if (!_open) return;
    const c = document.getElementById('outletCanvas');
    if (!c || !_renderer) return;
    const w = c.clientWidth  || window.innerWidth;
    const h = c.clientHeight || window.innerHeight;
    _renderer.setSize(w, h);
    _camera.aspect = w / h;

    if (w < h) {
      _camera.fov = 42 * (h / w) * 0.75;
      if (_camera.fov > 70) _camera.fov = 70;
    } else {
      _camera.fov = 42;
    }

    _camera.updateProjectionMatrix();
  });
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function _mkBox(w, h, d, color, rough = 0.7, metal = 0.1) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  );
}
function _mkCyl(rt, rb, h, segs, color, rough = 0.5, metal = 0.3) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  );
}
function _makeWireTube(color, pts, radius = 0.038) {
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 32, radius, 8, false),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 })
  );
}

// ─── Build full 3D scene (called ONCE) ────────────────────────────────────────
function _buildScene() {
  // Wall background
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.MeshLambertMaterial({ color: 0x252220 })
  );
  wall.position.z = -1.2; wall.receiveShadow = true;
  _scene.add(wall);

  // Horizontal tile lines on wall
  for (let i = -4; i <= 4; i++) {
    const ln = _mkBox(12, 0.007, 0.01, 0x312e2a, 1, 0);
    ln.position.set(0, i * 0.9, -1.18); _scene.add(ln);
  }

  // ── Outlet assembly ──────────────────────────────────────────────────────
  outletRoot = new THREE.Group();
  _scene.add(outletRoot);

  const boxDepth = 0.7;

  // Junction box (behind)
  const jb = _mkBox(2.4, 2.4, boxDepth, 0x5a4020, 0.92, 0.04);
  jb.position.z = -1.2 + boxDepth / 2 - 0.05;
  outletRoot.add(jb);
  jBox = jb;

  // Interior (dark recess)
  const interior = _mkBox(2.1, 2.1, 0.05, 0x1a1008, 0.96, 0);
  interior.position.z = -1.2 + boxDepth - 0.03;
  outletRoot.add(interior);

  // Metal flange
  const flange = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 2.6, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.40, metalness: 0.60 })
  );
  flange.position.z = -1.2 + boxDepth;
  outletRoot.add(flange);

  // Conduit knockouts
  [-0.7, 0.7].forEach(x => {
    const ko = _mkBox(0.22, 0.14, 0.08, 0x666666, 0.5, 0.5);
    ko.position.set(x, 0.95, -1.2 + boxDepth + 0.02);
    outletRoot.add(ko);
  });

  // ── Face plate ────────────────────────────────────────────────────────────
  faceGroup = new THREE.Group();
  faceGroup.position.set(0, -0.9, 0);
  outletRoot.add(faceGroup);

  facePlate = _mkBox(2.0, 1.85, 0.14, 0xd5d0c6, 0.65, 0.04);
  facePlate.position.set(0, 0.925, 0);
  facePlate.castShadow = true; facePlate.receiveShadow = true;
  faceGroup.add(facePlate);

  // Corner screws
  [-0.65, 0.65].forEach(x => [-0.70, 0.70].forEach(y => {
    const sh = _mkCyl(0.055, 0.055, 0.16, 12, 0xaaaaaa, 0.30, 0.50);
    sh.rotation.x = Math.PI / 2;
    sh.position.set(x, y + 0.925, 0.07);
    faceGroup.add(sh);
  }));

  // Pin slots
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  [-0.32, 0.32].forEach(x => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.18), slotMat);
    s.position.set(x, 1.08, 0.07); faceGroup.add(s);
  });
  const earthSlot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.18, 20), slotMat
  );
  earthSlot.rotation.x = Math.PI / 2;
  earthSlot.position.set(0, 0.72, 0.07);
  faceGroup.add(earthSlot);

  // Center cover screw
  screwGroup = new THREE.Group();
  screwGroup.position.set(0, 0.925, 0);
  faceGroup.add(screwGroup);

  screwHead = _mkCyl(0.115, 0.095, 0.07, 24, 0xb0b0b0, 0.2, 0.7);
  screwHead.rotation.x = Math.PI / 2;
  screwHead.position.z = 0.11;
  screwGroup.add(screwHead);

  washer = _mkCyl(0.13, 0.13, 0.015, 24, 0x888888, 0.4, 0.5);
  washer.rotation.x = Math.PI / 2;
  washer.position.z = 0.075;
  screwGroup.add(washer);

  for (let i = 0; i < 2; i++) {
    const sl = new THREE.Mesh(
      new THREE.BoxGeometry(0.20, 0.025, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
    );
    sl.rotation.z = i * Math.PI / 2;
    sl.position.z = 0.15;
    screwGroup.add(sl);
  }
  const screwShaft = _mkCyl(0.045, 0.050, 0.5, 12, 0x999999, 0.3, 0.6);
  screwShaft.rotation.x = Math.PI / 2;
  screwShaft.position.z = -0.18;
  screwGroup.add(screwShaft);

  // ── Internal terminal block ───────────────────────────────────────────────
  internalGroup = new THREE.Group();
  internalGroup.visible = false;
  outletRoot.add(internalGroup);

  const mBar = _mkBox(2.0, 0.22, 0.12, 0x555555, 0.7, 0.3);
  mBar.position.set(0, 0, -0.52); internalGroup.add(mBar);
  const termBodyM = _mkBox(1.7, 0.55, 0.18, 0x3a3a3a, 0.85, 0.1);
  termBodyM.position.set(0, 0, -0.45); internalGroup.add(termBodyM);

  terminalMeshes = [];
  [{ x: -0.52, color: 0xb45309 }, { x: 0, color: 0x3b82f6 }, { x: 0.52, color: 0x22c55e }]
    .forEach(({ x, color }) => {
      const tb = _mkBox(0.28, 0.42, 0.22, color, 0.6, 0.2);
      tb.position.set(x, 0, -0.38); internalGroup.add(tb);
      const ts = _mkCyl(0.08, 0.08, 0.06, 16, 0xaaaaaa, 0.2, 0.7);
      ts.rotation.x = Math.PI / 2;
      ts.position.set(x, 0, -0.27); internalGroup.add(ts);
      const tslot = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.02, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      tslot.position.set(x, 0, -0.24); internalGroup.add(tslot);
      const wHole = _mkBox(0.08, 0.28, 0.1, 0x111111, 1, 0);
      wHole.position.set(x, -0.06, -0.27); internalGroup.add(wHole);
      const glow = _mkBox(0.26, 0.04, 0.02, 0x222222, 1, 0);
      glow.position.set(x, 0.22, -0.37);
      internalGroup.add(glow);
      terminalMeshes.push({ x, color, glowMesh: glow });
    });

  [-0.7, 0, 0.7].forEach(x => {
    const clip = _mkBox(0.18, 0.08, 0.12, 0x666666, 0.7, 0.2);
    clip.position.set(x, -0.35, -0.46); internalGroup.add(clip);
  });

  // ── Loose wires (visible when cover opens) ───────────────────────────────
  looseWirePts = [
    [new THREE.Vector3(-0.52, 0, -0.42), new THREE.Vector3(-0.6, -0.3, -0.1), new THREE.Vector3(-0.80, -0.85, 0.2), new THREE.Vector3(-0.55, -1.35, 0.05)],
    [new THREE.Vector3( 0.00, 0, -0.42), new THREE.Vector3( 0.1, -0.28, -0.1), new THREE.Vector3( 0.05, -0.90, 0.18), new THREE.Vector3( 0.10, -1.40, 0.08)],
    [new THREE.Vector3( 0.52, 0, -0.42), new THREE.Vector3( 0.62,-0.28, -0.1), new THREE.Vector3( 0.75, -0.88, 0.2), new THREE.Vector3( 0.55, -1.30, 0.04)],
  ];
  wireMeshes = [];
  wireColors3D.forEach((c, i) => {
    const w = _makeWireTube(c, looseWirePts[i]);
    w.visible = false; outletRoot.add(w); wireMeshes.push(w);
  });

  // ── Breaker box (left side) ───────────────────────────────────────────────
  BX = -3.05; BY = 0.28; BZ = -1.06;

  const bkBody = _mkBox(1.02, 1.65, 0.22, 0x424242, 0.72, 0.38);
  bkBody.position.set(BX, BY, BZ + 0.11); _scene.add(bkBody);
  const bkFace = _mkBox(0.84, 1.44, 0.04, 0x2c2c2c, 0.88, 0.05);
  bkFace.position.set(BX, BY, BZ + 0.235); _scene.add(bkFace);
  const bkStripe = _mkBox(0.84, 0.055, 0.05, 0xF5C518, 0.65, 0.1);
  bkStripe.position.set(BX, BY + 0.72, BZ + 0.24); _scene.add(bkStripe);
  const bkLbl = _mkBox(0.56, 0.05, 0.03, 0xcccccc, 0.8, 0);
  bkLbl.position.set(BX, BY + 0.58, BZ + 0.255); _scene.add(bkLbl);
  const bkSlot = _mkBox(0.34, 0.64, 0.03, 0x181818, 0.9, 0);
  bkSlot.position.set(BX, BY, BZ + 0.256); _scene.add(bkSlot);

  bkHandleMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.42, metalness: 0.28 });
  bkHandle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.30, 0.16), bkHandleMat);
  HANDLE_ON_Y  = BY + 0.16;
  HANDLE_OFF_Y = BY - 0.16;
  bkHandle.position.set(BX, HANDLE_ON_Y, BZ + 0.31); _scene.add(bkHandle);

  bkLEDMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, roughness: 0.28, metalness: 0.5,
    emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1.0,
  });
  const bkLED = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.055, 12), bkLEDMat);
  bkLED.rotation.x = Math.PI / 2;
  bkLED.position.set(BX + 0.27, BY + 0.54, BZ + 0.245); _scene.add(bkLED);

  const bkConduit = _mkCyl(0.1, 0.1, 0.55, 10, 0x555555, 0.8, 0.3);
  bkConduit.position.set(BX, BY - 1.08, BZ + 0.11); _scene.add(bkConduit);

  // Breaker panel label
  const bkCanvas = document.createElement('canvas');
  bkCanvas.width = 128; bkCanvas.height = 32;
  const bkCtx = bkCanvas.getContext('2d');
  bkCtx.fillStyle = 'rgba(0,0,0,0)'; bkCtx.clearRect(0, 0, 128, 32);
  bkCtx.font = 'bold 13px sans-serif'; bkCtx.fillStyle = '#F5C518';
  bkCtx.textAlign = 'center'; bkCtx.fillText('BREAKER', 64, 22);
  const bkTex = new THREE.CanvasTexture(bkCanvas);
  const bkLblMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.14),
    new THREE.MeshBasicMaterial({ map: bkTex, transparent: true, depthWrite: false })
  );
  bkLblMesh.position.set(BX, BY + 0.72, BZ + 0.27); _scene.add(bkLblMesh);

  clickScrewObjs   = [screwHead, washer];
  clickBreakerObjs = [bkHandle];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOM INIT
// ═══════════════════════════════════════════════════════════════════════════════

function _initDOMRefs() {
  tgtRing  = document.getElementById('or-tgt-ring');
  tgtPulse = document.getElementById('or-tgt-pulse');
  tgtLabel = document.getElementById('or-tgt-label');
  bkTip    = document.getElementById('or-breaker-tip');

  document.addEventListener('or-tool-select', e => {
    if (!_open) return;
    _selectTool(e.detail);
  });
}

function _initDragDrop() {
  ['brown', 'blue', 'green'].forEach(color => {
    const draggable = document.getElementById(`or-wd-${color}`);
    const terminal  = document.getElementById(`or-wt-${color}`);
    if (draggable) draggable.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', color);
    });
    if (terminal) {
      terminal.addEventListener('dragover', e => e.preventDefault());
      terminal.addEventListener('drop', e => {
        e.preventDefault();
        if (!_open) return;
        const wc = e.dataTransfer.getData('text/plain');
        if (wc === color) _connectWire(wc);
        else {
          terminal.classList.add('reject');
          setTimeout(() => terminal.classList.remove('reject'), 400);
          _showToast('Wrong terminal! Match the wire color.', 'err');
        }
      });
    }
  });

  // ── Mobile touch drag support (HTML5 drag-drop doesn't work on touch) ──────
  ['brown', 'blue', 'green'].forEach(color => {
    const draggable = document.getElementById(`or-wd-${color}`);
    if (!draggable) return;
    draggable.addEventListener('touchstart', e => {
      if (!_open || gameState !== 'wires') return;
      e.stopPropagation();
      _touchWire = color;
      // Ghost element follows finger
      _touchClone = draggable.cloneNode(true);
      const r = draggable.getBoundingClientRect();
      const t = e.changedTouches[0];
      Object.assign(_touchClone.style, {
        position: 'fixed', zIndex: '9999', pointerEvents: 'none', opacity: '0.82',
        width: r.width + 'px', left: (t.clientX - r.width / 2) + 'px',
        top: (t.clientY - r.height / 2) + 'px', margin: '0',
      });
      document.body.appendChild(_touchClone);
      draggable.style.opacity = '0.4';
    }, { passive: false });
  });

  document.addEventListener('touchmove', e => {
    if (!_touchClone) return;
    const t = e.changedTouches[0];
    _touchClone.style.left = (t.clientX - parseFloat(_touchClone.style.width) / 2) + 'px';
    _touchClone.style.top  = (t.clientY - 16) + 'px';
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!_touchClone || !_touchWire) return;
    const t = e.changedTouches[0];
    // Restore drag element opacity
    const dragEl = document.getElementById(`or-wd-${_touchWire}`);
    if (dragEl) dragEl.style.opacity = '';
    _touchClone.remove(); _touchClone = null;

    if (!_open || gameState !== 'wires') { _touchWire = null; return; }

    // Find element under finger — temporarily hide clone so elementFromPoint works
    const under = document.elementFromPoint(t.clientX, t.clientY);
    const term  = under && (under.classList.contains('or-wire-term')
      ? under : under.closest?.('.or-wire-term'));

    if (term) {
      const termColor = term.id.replace('or-wt-', '');
      if (termColor === _touchWire) {
        _connectWire(_touchWire);
      } else {
        term.classList.add('reject');
        setTimeout(() => term.classList.remove('reject'), 400);
        _showToast('Wrong terminal! Match the wire color.', 'err');
      }
    }
    _touchWire = null;
  }, { passive: true });

  // touchcancel fires when system interrupts the touch (notification, scroll, etc.)
  // Without this, the clone gets orphaned and stays on screen permanently.
  document.addEventListener('touchcancel', () => {
    if (!_touchClone) return;
    const dragEl = document.getElementById(`or-wd-${_touchWire}`);
    if (dragEl) dragEl.style.opacity = '';
    _touchClone.remove(); _touchClone = null;
    _touchWire = null;
  }, { passive: true });
}

function _initCanvasEvents() {
  const canvas = document.getElementById('outletCanvas');
  if (!canvas) return;

  // Touch tap on canvas (mobile) — fires before click and avoids ~300ms delay
  let _canvasTapId = -1, _canvasTapX = 0, _canvasTapY = 0, _canvasTapT = 0;
  canvas.addEventListener('touchstart', e => {
    if (!_open || _touchWire) return; // don't interfere with wire drag
    if (e.changedTouches.length !== 1 || _canvasTapId !== -1) return;
    const t = e.changedTouches[0];
    _canvasTapId = t.identifier; _canvasTapX = t.clientX; _canvasTapY = t.clientY;
    _canvasTapT = Date.now();
  }, { passive: true });
  canvas.addEventListener('touchend', e => {
    for (const t of e.changedTouches) {
      if (t.identifier !== _canvasTapId) continue;
      _canvasTapId = -1;
      if (!_open) break;
      if (Date.now() - _canvasTapT > 300) break; // too slow = not a tap
      if (Math.hypot(t.clientX - _canvasTapX, t.clientY - _canvasTapY) > 18) break;
      // Synthesize a canvas click at the touch position
      _handleCanvasClick(t.clientX, t.clientY);
    }
  }, { passive: true });

  canvas.addEventListener('click', e => {
    if (!_open) return;
    _handleCanvasClick(e.clientX, e.clientY);
  });

  function _handleCanvasClick(cx, cy) {
    if (gameState === 'animating' || gameState === 'inspect' || gameState === 'done') return;
    mouse.x =  (cx / canvas.clientWidth)  * 2 - 1;
    mouse.y = -(cy / canvas.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);

    if (gameState === 'breaker_off') {
      if (raycaster.intersectObjects(clickBreakerObjs, true).length) _doBreaker(true);
      else _showToast('Find the breaker panel on the left — tap it!', 'err');
    } else if (gameState === 'screw') {
      if (raycaster.intersectObjects(clickScrewObjs, true).length) {
        if (selectedTool !== 'screwdriver') { _showToast('Select the Screwdriver first!', 'err'); return; }
        _doRemoveScrew();
      } else _showToast('Click the screw at the center of the outlet!', 'err');
    } else if (gameState === 'open') {
      if (raycaster.intersectObject(facePlate, false).length) _doOpenCover();
      else _showToast('Click the outlet cover to open it', 'err');
    } else if (gameState === 'rescrew') {
      _doCloseCover();
    } else if (gameState === 'breaker_on') {
      if (raycaster.intersectObjects(clickBreakerObjs, true).length) _doBreaker(false);
      else _showToast('Tap the breaker panel to switch it back ON!', 'err');
    } else if (gameState === 'test') {
      if (selectedTool !== 'multimeter') { _showToast('Select the Multimeter first!', 'err'); return; }
      if (raycaster.intersectObject(facePlate, false).length) _doTest();
      else _showToast('Point the multimeter at the outlet', 'err');
    }
  } // end _handleCanvasClick

  canvas.addEventListener('mousemove', e => {
    if (!_open) return;
    mouse.x =  (e.clientX / canvas.clientWidth)  * 2 - 1;
    mouse.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    let cur = 'default';
    if ((gameState === 'breaker_off' || gameState === 'breaker_on') &&
        raycaster.intersectObjects(clickBreakerObjs, true).length) cur = 'pointer';
    else if (gameState === 'screw' && raycaster.intersectObjects(clickScrewObjs, true).length) cur = 'pointer';
    else if ((gameState === 'open' || gameState === 'test') && raycaster.intersectObject(facePlate, false).length) cur = 'pointer';
    else if (gameState === 'rescrew') cur = 'pointer';
    canvas.style.cursor = cur;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function _doBreaker(goingOff) {
  gameState = 'animating'; _setTut(null);
  _showToast(goingOff ? 'Switching breaker OFF...' : 'Switching breaker back ON...', 'ok');
  _showCamHint('Panning to breaker');
  _animateCam(new THREE.Vector3(-1.4, 0.55, 5.6), new THREE.Vector3(BX, BY, 0), 900, () => {
    bkGoingOff = goingOff; bkAnimT = 0; bkAnimating = true;
    bkCB = goingOff ? _afterBreakerOff : _afterBreakerOn;
  });
}

function _afterBreakerOff() {
  _completeTask(1, 12);
  _showToast('Breaker OFF — safe to work!', 'ok');
  _setInstr('<span class="or-snum">STEP 2</span>Select <span>Screwdriver</span> then tap the center <span>screw</span>');
  _enableTool('screwdriver'); _selectTool('screwdriver');
  _setTut(screwHead, 'TAP SCREW');
  try { outletTutOnStateChange('screw'); } catch(e) {}
  _animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 800, () => { gameState = 'screw'; });
}

function _afterBreakerOn() {
  _completeTask(7, 88);
  _showToast('Breaker ON! Test with multimeter.', 'ok');
  _setInstr('<span class="or-snum">STEP 8</span>Select <span>Multimeter</span> then tap the <span>outlet</span>');
  _enableTool('multimeter'); _selectTool('multimeter');
  _setTut(facePlate, 'TAP OUTLET');
  _animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 800, () => { gameState = 'test'; });
}

function _doRemoveScrew() {
  gameState = 'animating'; _setTut(null);
  _showToast('Removing cover screw...', 'ok');
  _showCamHint('Zooming in');
  _animateCam(new THREE.Vector3(0.3, 1.1, 3.2), new THREE.Vector3(0, 0.92, 0), 900, () => {
    screwRemoving = true; screwSpinT = 0;
  });
}

function _doOpenCover() {
  gameState = 'animating'; _setTut(null);
  _showToast('Opening outlet cover...', 'ok');
  _showCamHint('Side angle view');
  _animateCam(new THREE.Vector3(-3.5, 2.2, 4.0), new THREE.Vector3(0, 0.2, 0), 1100, () => {
    coverOpening = true; coverOpenT = 0;
  });
}

function _doCloseCover() {
  gameState = 'animating'; _setTut(null);
  _showToast('Closing outlet cover...', 'ok');
  _animateCam(new THREE.Vector3(-2.8, 1.8, 4.2), new THREE.Vector3(0, 0.3, 0), 900, () => {
    coverClosing = true; coverCloseT = 0;
  });
}

function _doTest() {
  gameState = 'animating'; _setTut(null);
  _showCamHint('Testing outlet');
  _animateCam(new THREE.Vector3(0.3, 0.3, 3.5), new THREE.Vector3(0, 0.2, 0), 700, () => {
    const ro = $o('reading'), rv = $o('rd-val');
    if (ro) ro.classList.add('show');
    if (rv) rv.textContent = '---';
    const steps = ['---', '12V', '85V', '154V', '199V', '216V', '220V'];
    let ri = 0;
    const iv = setInterval(() => {
      if (ri < steps.length && rv) { rv.textContent = steps[ri]; ri++; }
      if (ri >= steps.length) {
        clearInterval(iv);
        setTimeout(() => {
          if (ro) ro.classList.remove('show');
          _completeTask(8, 100);
          gameState = 'done'; timerRunning = false;
          try { outletTutOnStateChange('done'); } catch(e) {}
          if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
          _showToast('220V AC — Outlet working perfectly!', 'ok');
          _animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 1200, () => {
            setTimeout(() => {
              const ss = $o('so-score'); if (ss) ss.textContent = '⭐ STAR EARNED!';
              const sov = $o('success-overlay'); if (sov) sov.classList.add('show');
              if (_onFixed) _onFixed(_socketId, 1); // 1 star per outlet
            }, 800);
          });
        }, 700);
      }
    }, 220);
  });
}

// ─── Wire connect ─────────────────────────────────────────────────────────────
function _connectWire(color) {
  if (wiresState[color]) return;
  wiresState[color] = true;
  const draggable = document.getElementById(`or-wd-${color}`);
  const term      = document.getElementById(`or-wt-${color}`);
  if (draggable) draggable.classList.add('used');
  if (term) {
    const bgMap = { brown: '#92400e', blue: '#1d4ed8', green: '#166534' };
    term.style.background   = bgMap[color];
    term.style.color        = '#fff';
    term.style.borderStyle  = 'solid';
    term.textContent        = '✓';
  }
  const idx = wireNames.indexOf(color);
  outletRoot.remove(wireMeshes[idx]);
  const tx = terminalMeshes[idx].x;
  const connPts = [
    new THREE.Vector3(tx, 0, -0.42),
    new THREE.Vector3(tx, -0.25, -0.2),
    new THREE.Vector3(tx + (Math.random() - .5) * .3, -0.70, 0.05),
    new THREE.Vector3(tx + (Math.random() - .5) * .2, -1.20, 0.0),
  ];
  const cw = _makeWireTube(wireColors3D[idx], connPts);
  outletRoot.add(cw); wireMeshes[idx] = cw;
  terminalMeshes[idx].glowMesh.material.color.setHex(wireColors3D[idx]);
  terminalMeshes[idx].glowMesh.material.emissive = new THREE.Color(wireColors3D[idx]);
  terminalMeshes[idx].glowMesh.material.emissiveIntensity = 0.8;

  const pctMap = { brown: 54, blue: 62, green: 70 };
  _showToast(`${color.charAt(0).toUpperCase() + color.slice(1)} wire connected ✓`, 'ok');
  _setPct(pctMap[color]);

  if (wiresState.brown && wiresState.blue && wiresState.green) {
    setTimeout(() => {
      completedTasks++;
      const t5 = $o('t5'); if (t5) { t5.classList.remove('active'); t5.classList.add('done'); }
      const t6 = $o('t6'); if (t6) t6.classList.add('active');
      const dc = $o('done-count'); if (dc) dc.textContent = completedTasks;
      _setPct(75);
      const wp = $o('wire-panel'); if (wp) { wp.style.display = 'none'; wp.classList.remove('hi'); }
      _setInstr('<span class="or-snum">STEP 6</span>All wires connected! Tap the <span>outlet area</span> to close the cover');
      const ins = $o('instruction'); if (ins) ins.style.display = 'block';
      _setTut(jBox, 'TAP TO CLOSE');
      try { outletTutOnStateChange('rescrew'); } catch(e) {}
      gameState = 'rescrew';
      _animateCam(new THREE.Vector3(0.8, 0.4, 5.5), new THREE.Vector3(0, 0.2, 0), 700, () => { });
    }, 900);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAMERA TWEEN
// ═══════════════════════════════════════════════════════════════════════════════

function _animateCam(toPos, toLook, dur, cb) {
  camFrom.copy(_camera.position);
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(_camera.quaternion);
  camLookFrom.copy(_camera.position).addScaledVector(dir, 5);
  camTo.copy(toPos); camLookTo.copy(toLook);
  camT = 0; camDur = dur; camCB = cb; camTweening = true;
}
function _eio3(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

// ═══════════════════════════════════════════════════════════════════════════════
// TUTORIAL RING
// ═══════════════════════════════════════════════════════════════════════════════

function _setTut(obj3D, label = 'TAP HERE') {
  tutTarget3D = obj3D;
  if (tgtLabel) tgtLabel.textContent = label;
}

function _updateTutorial() {
  const overlay = document.getElementById('outletRepairOverlay');
  if (!overlay) return;
  const canvas = document.getElementById('outletCanvas');
  if (!canvas) return;
  const showable = tutTarget3D !== null
    && gameState !== 'animating' && gameState !== 'inspect'
    && gameState !== 'wires'    && gameState !== 'done';

  if (!showable) {
    [tgtRing, tgtPulse, tgtLabel, bkTip].forEach(el => el && (el.style.display = 'none'));
    return;
  }
  const wp = new THREE.Vector3();
  tutTarget3D.getWorldPosition(wp);
  const v = wp.clone().project(_camera);
  if (v.z > 1) {
    [tgtRing, tgtPulse, tgtLabel, bkTip].forEach(el => el && (el.style.display = 'none'));
    return;
  }
  const cw = canvas.clientWidth, ch = canvas.clientHeight;
  const sx = (v.x + 1) / 2 * cw;
  const sy = (-v.y + 1) / 2 * ch;

  [tgtRing, tgtPulse].forEach(el => {
    if (!el) return;
    el.style.display = 'block'; el.style.left = sx + 'px'; el.style.top = sy + 'px';
  });
  if (tgtLabel) {
    tgtLabel.style.display = 'block';
    tgtLabel.style.left = sx + 'px';
    tgtLabel.style.top = (sy + 48) + 'px';
  }
  if (bkTip) {
    if (gameState === 'breaker_off' || gameState === 'breaker_on') {
      bkTip.style.display = 'block'; bkTip.style.left = sx + 'px'; bkTip.style.top = (sy - 60) + 'px';
      bkTip.textContent = gameState === 'breaker_off' ? 'BREAKER  ·  SWITCH OFF' : 'BREAKER  ·  SWITCH ON';
    } else bkTip.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HUD HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function _completeTask(n, pct) {
  completedTasks++;
  const el = $o('t' + n); if (el) { el.classList.remove('active'); el.classList.add('done'); }
  const nx = $o('t' + (n + 1)); if (nx) nx.classList.add('active');
  const dc = $o('done-count'); if (dc) dc.textContent = completedTasks;
  _setPct(pct);
}
function _setPct(p) {
  const bar = $o('pw-bar'); if (bar) bar.style.width = p + '%';
  const pct = $o('pw-pct'); if (pct) pct.textContent = p;
}
function _selectTool(t) {
  selectedTool = t;
  ['screwdriver', 'pliers', 'multimeter'].forEach(id => {
    const s = $o('tool-' + id); if (s) s.classList.remove('active');
  });
  const s = $o('tool-' + t); if (s) s.classList.add('active');
}
function _enableTool(t) {
  const s = $o('tool-' + t); if (s) s.classList.remove('disabled');
}
function _setInstr(html) {
  const el = $o('instruction'); if (!el) return;
  el.style.display = 'block'; el.innerHTML = html;
}
function _showToast(msg, type) {
  const t = $o('toast'); if (!t) return;
  t.textContent = msg; t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}
function _showCamHint(msg) {
  const h = $o('cam-hint'); if (!h) return;
  h.textContent = '📷 ' + msg; h.classList.add('show');
  clearTimeout(camHintTimer);
  camHintTimer = setTimeout(() => h.classList.remove('show'), 2000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════════════════════════════════════════

function _resetAll() {
  // Clean up any orphaned touch clone before resetting
  if (_touchClone) { _touchClone.remove(); _touchClone = null; }
  _touchWire = null;

  gameState = 'breaker_off'; selectedTool = null;
  wiresState = { brown: false, blue: false, green: false };
  completedTasks = 0; timerVal = 300; timerRunning = true;
  screwRemoving    = false; screwSpinT      = 0;
  screwReattaching = false; screwReattachT  = 0;
  coverOpening     = false; coverOpenT      = 0;
  coverClosing     = false; coverCloseT     = 0;
  inspecting       = false; inspectT        = 0;
  bkAnimating      = false; bkAnimT         = 0;
  camTweening      = false; idleT           = 0;

  // 3D reset
  bkHandle.position.y = HANDLE_ON_Y;
  bkHandleMat.color.setHex(0x22c55e);
  bkLEDMat.color.setHex(0x22c55e);
  bkLEDMat.emissive.setHex(0x22c55e);
  bkLEDMat.emissiveIntensity = 1.0;
  faceGroup.visible = true; faceGroup.rotation.x = 0; faceGroup.position.set(0, -0.9, 0);
  screwGroup.visible = true; screwGroup.rotation.z = 0; screwGroup.position.set(0, 0.925, 0);
  internalGroup.visible = false;
  terminalMeshes.forEach(t => {
    t.glowMesh.material.color.setHex(0x222222);
    t.glowMesh.material.emissiveIntensity = 0;
  });
  wireNames.forEach((_, i) => {
    outletRoot.remove(wireMeshes[i]);
    const w = _makeWireTube(wireColors3D[i], looseWirePts[i]);
    w.visible = false; outletRoot.add(w); wireMeshes[i] = w;
  });
  _camera.position.set(1.2, 0.8, 6.5);
  _camera.lookAt(0, 0, 0);

  // HUD reset
  _setPct(0);
  const dc = $o('done-count'); if (dc) dc.textContent = '0';
  for (let i = 1; i <= 8; i++) {
    const el = $o('t' + i); if (!el) continue;
    el.classList.remove('done', 'active');
    if (i === 1) el.classList.add('active');
  }
  const wp = $o('wire-panel'); if (wp) { wp.style.display = 'none'; wp.classList.remove('hi'); }
  const sov = $o('success-overlay'); if (sov) sov.classList.remove('show');
  const ro = $o('reading'); if (ro) ro.classList.remove('show');
  const rv = $o('rd-val'); if (rv) rv.textContent = '---';
  _setInstr('<span class="or-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>');

  ['brown', 'blue', 'green'].forEach(c => {
    const wd = document.getElementById(`or-wd-${c}`); if (wd) wd.classList.remove('used');
    const wt = document.getElementById(`or-wt-${c}`);
    if (wt) {
      const lbl = { brown: 'L', blue: 'N', green: 'E' };
      const col = { brown: '#b45309', blue: '#3b82f6', green: '#22c55e' };
      wt.style.background = ''; wt.style.color = col[c];
      wt.style.borderStyle = 'dashed'; wt.textContent = lbl[c];
    }
  });
  ['screwdriver', 'pliers', 'multimeter'].forEach(t => {
    const s = $o('tool-' + t); if (!s) return;
    s.classList.add('disabled'); s.classList.remove('active');
  });
  _setTut(bkHandle, 'TAP HERE');

  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const timerEl = $o('timer'); if (timerEl) timerEl.textContent = '05:00';
  timerInterval = setInterval(() => {
    if (!timerRunning || !_open) return;
    timerVal = Math.max(0, timerVal - 1);
    const m = Math.floor(timerVal / 60).toString().padStart(2, '0');
    const s = (timerVal % 60).toString().padStart(2, '0');
    const tel = $o('timer'); if (tel) tel.textContent = `${m}:${s}`;
  }, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOOP (own rAF loop — only runs when overlay is open)
// ═══════════════════════════════════════════════════════════════════════════════

function _loop() {
  if (!_open) return;
  requestAnimationFrame(_loop);
  const dt = Math.min(_clock.getDelta(), 0.05);
  idleT = (idleT || 0) + dt;

  // Idle outlet float
  outletRoot.position.y = Math.sin(idleT * 0.55) * 0.035;
  outletRoot.rotation.z = Math.sin(idleT * 0.35) * 0.006;
  outletRoot.rotation.x = Math.sin(idleT * 0.28) * 0.005 + 0.04;

  // Camera tween
  if (camTweening) {
    camT += dt * 1000;
    const p = _eio3(Math.min(camT / camDur, 1));
    _camera.position.lerpVectors(camFrom, camTo, p);
    _camera.lookAt(new THREE.Vector3().lerpVectors(camLookFrom, camLookTo, p));
    if (camT >= camDur) { camTweening = false; if (camCB) { const cb = camCB; camCB = null; cb(); } }
  }

  // Breaker toggle animation
  if (bkAnimating) {
    bkAnimT += dt * 2.8;
    const p = _eio3(Math.min(bkAnimT, 1));
    bkHandle.position.y = (bkGoingOff ? HANDLE_ON_Y : HANDLE_OFF_Y) +
      ((bkGoingOff ? HANDLE_OFF_Y : HANDLE_ON_Y) - (bkGoingOff ? HANDLE_ON_Y : HANDLE_OFF_Y)) * p;
    if (bkAnimT >= 1) {
      bkAnimating = false;
      bkHandle.position.y = bkGoingOff ? HANDLE_OFF_Y : HANDLE_ON_Y;
      if (bkGoingOff) {
        bkHandleMat.color.setHex(0xef4444); bkLEDMat.color.setHex(0xef4444);
        bkLEDMat.emissive.setHex(0x881111); bkLEDMat.emissiveIntensity = 0.55;
      } else {
        bkHandleMat.color.setHex(0x22c55e); bkLEDMat.color.setHex(0x22c55e);
        bkLEDMat.emissive.setHex(0x22c55e); bkLEDMat.emissiveIntensity = 1.0;
      }
      if (bkCB) { const cb = bkCB; bkCB = null; cb(); }
    }
  }

  // Screw removal
  if (screwRemoving) {
    screwSpinT += dt * 5.5;
    screwGroup.rotation.z = screwSpinT;
    screwGroup.position.z = screwSpinT * 0.09;
    screwGroup.position.y = screwSpinT * 0.03;
    if (screwSpinT > Math.PI * 5) {
      screwRemoving = false; screwGroup.visible = false;
      _completeTask(2, 24);
      _showToast('Screw removed! Tap the outlet cover.', 'ok');
      _setInstr('<span class="or-snum">STEP 3</span>Tap the <span>outlet cover</span> to open it');
      _setTut(facePlate, 'TAP COVER');
      try { outletTutOnStateChange('open'); } catch(e) {}
      _animateCam(new THREE.Vector3(-1.8, 1.4, 5.2), new THREE.Vector3(0, 0.4, 0), 700,
        () => { gameState = 'open'; });
    }
  }

  // Cover opening
  if (coverOpening) {
    coverOpenT += dt * 1.4;
    faceGroup.rotation.x = _eio3(Math.min(coverOpenT, 1)) * 1.95;
    if (coverOpenT >= 1) {
      coverOpening = false; faceGroup.visible = false;
      internalGroup.visible = true; wireMeshes.forEach(w => w.visible = true);
      _completeTask(3, 36);
      _showToast('Cover open! Inspecting wiring...', 'ok');
      _setInstr('<span class="or-snum">STEP 4</span>Inspecting wires — connections are <span>damaged</span>');
      _setTut(null); inspecting = true; inspectT = 0;
      _animateCam(new THREE.Vector3(0.2, 0.5, 3.6), new THREE.Vector3(0, -0.25, 0), 1000, () => { });
    }
  }

  // Inspect auto-advance (2.5s)
  if (inspecting) {
    inspectT += dt;
    if (inspectT >= 2.5) {
      inspecting = false;
      _completeTask(4, 48);
      _showToast('Wires disconnected — drag each wire to its correct terminal.', 'info');
      try { outletTutOnStateChange('wiring'); } catch(e) {}
      const wp = $o('wire-panel');
      if (wp) { wp.style.display = 'block'; wp.classList.add('hi'); }
      const ins = $o('instruction'); if (ins) ins.style.display = 'none';
      gameState = 'wires';
      _animateCam(new THREE.Vector3(0.3, 2.2, 5.0), new THREE.Vector3(0, -0.1, 0), 900, () => { });
    }
  }

  // Cover closing
  if (coverClosing) {
    coverCloseT += dt * 1.2;
    faceGroup.visible = true;
    faceGroup.rotation.x = (1 - _eio3(Math.min(coverCloseT, 1))) * 1.95;
    if (coverCloseT >= 1) {
      coverClosing = false; faceGroup.rotation.x = 0; faceGroup.position.set(0, -0.9, 0);
      internalGroup.visible = false; wireMeshes.forEach(w => w.visible = false);
      screwGroup.visible = true;
      screwGroup.position.set(0, 0.925, 0.6); screwGroup.rotation.z = Math.PI * 9;
      screwReattaching = true; screwReattachT = 0;
      _animateCam(new THREE.Vector3(0.2, 0.95, 3.0), new THREE.Vector3(0, 0.92, 0), 600, () => { });
    }
  }

  // Screw reattach
  if (screwReattaching) {
    screwReattachT += dt * 4;
    const prog = Math.min(screwReattachT / 3.5, 1);
    screwGroup.rotation.z = (1 - _eio3(prog)) * Math.PI * 9;
    screwGroup.position.z = (1 - _eio3(prog)) * 0.6;
    screwGroup.position.y = 0.925;
    if (screwReattachT >= 3.5) {
      screwReattaching = false;
      screwGroup.rotation.z = 0; screwGroup.position.set(0, 0.925, 0);
      _completeTask(6, 82);
      _showToast('Outlet closed! Turn the breaker back ON.', 'ok');
      _setInstr('<span class="or-snum">STEP 7</span>Find the <span>breaker panel</span> — switch it <span>ON</span>');
      _setTut(bkHandle, 'TAP BREAKER');
      try { outletTutOnStateChange('breaker_on'); } catch(e) {}
      _animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 1200,
        () => { gameState = 'breaker_on'; });
    }
  }

  _updateTutorial();
  _renderer.render(_scene, _camera);
}

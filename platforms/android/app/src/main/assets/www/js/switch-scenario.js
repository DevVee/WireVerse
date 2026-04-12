/**
 * switch-scenario.js
 * Light-switch installation mini-game running inside the main game's page.
 * Uses its OWN dedicated Three.js renderer on #switchCanvas — completely
 * isolated from the main world.
 *
 * Public API:
 *   initSwitchScenario(onFixedCallback)  — call once after DOM ready
 *   openSwitch(stationId)                — show overlay, run scenario
 *   closeSwitch()                        — hide overlay, pause renderer
 */

import * as THREE from 'three';
import { Player } from './player.js';

// ─── Private state ───────────────────────────────────────────────────────────
let _renderer = null, _scene, _camera, _clock;
let _open = false;
let _stationId = 1;
let _onFixed = null;

// ─── DOM helper ──────────────────────────────────────────────────────────────
const $s = id => document.getElementById('si-' + id);

// ─── 3D object refs ──────────────────────────────────────────────────────────
let bkHandle, bkHandleMat, bkLEDMat;
let BX, BY, BZ, HANDLE_ON_Y, HANDLE_OFF_Y;
let wbRoot, wallBox, wbFlange, wbInterior;
let swRoot, swBody, swLever, swLeverMat;
let bulbLight, bulbGlassMat, filMat, bulbGlass;
let wallWires = [], swWires = {}, bulbWire = null;
let swWiresBuilt = false;

// ─── Raycaster ───────────────────────────────────────────────────────────────
let raycaster, mouse;
let clickBreakerObjs = [];

// ─── Game state ───────────────────────────────────────────────────────────────
let gameState, activeTool, wireConn;
let _touchWire = null; // shared between drag-drop and canvas touch events
let doneCount, timerVal, timerOn;
let switchFlipped, lightOn, lightToggleCount;
let timerInterval = null;

// ─── Animation state ──────────────────────────────────────────────────────────
let bkAnimating, bkAnimT, bkGoingOff, bkCB;
let mountAnim, mountT, mountFrom, mountTo, mountCB;
let leverTweening, leverT, leverTweenTarget;
let camTweening, camT, camDur, camCB, camFrom, camTo, camLookFrom, camLookTo;
let idleT;

// ─── Tutorial DOM refs ────────────────────────────────────────────────────────
let tgtRing, tgtPulse, tgtLabel;
let tutTarget3D = null;
let toastTimer;

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export function initSwitchScenario(onFixedCallback) {
  _onFixed = onFixedCallback;
  _initThree();
  _initDOMRefs();
  _initDragDrop();
  _initCanvasEvents();
  _loop();
}

export function openSwitch(stationId) {
  _stationId = stationId;

  const overlay = document.getElementById('switchInstallOverlay');
  if (overlay) overlay.style.display = 'block';

  const canvas = document.getElementById('si-canvas');
  if (canvas && _renderer) {
    requestAnimationFrame(() => {
      const w = canvas.clientWidth  || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      _renderer.setSize(w, h);
      _camera.aspect = w / h;
      if (w < h) {
        _camera.fov = 44 * (h / w) * 0.75;
        if (_camera.fov > 72) _camera.fov = 72;
      } else {
        _camera.fov = 44;
      }
      _camera.updateProjectionMatrix();
    });
  }

  const lbl = $s('station-label');
  if (lbl) lbl.textContent = `Station #${stationId}`;

  // Freeze player
  Player.state = 'repair';

  _resetAll();

  if (!_open) {
    _open = true;
    _loop();
  }
}

export function closeSwitch() {
  _open = false;
  const overlay = document.getElementById('switchInstallOverlay');
  if (overlay) overlay.style.display = 'none';
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  Player.state = 'standing';
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREE.JS INIT — runs ONCE at startup
// ═══════════════════════════════════════════════════════════════════════════════

function _initThree() {
  const canvas = document.getElementById('si-canvas');
  if (!canvas) { console.error('[switch-scenario] #si-canvas not found'); return; }

  _renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  _renderer.setPixelRatio(1.0);
  _renderer.shadowMap.enabled = false;
  _renderer.setSize(window.innerWidth, window.innerHeight);

  _scene = new THREE.Scene();
  _scene.background = new THREE.Color(0x080a0d);
  _scene.fog = new THREE.Fog(0x080a0d, 12, 28);

  _camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 100);
  _camera.position.set(0, 0.5, 8);
  _camera.lookAt(0, 0, 0);

  _clock = new THREE.Clock();

  // Lighting
  _scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const spot = new THREE.SpotLight(0xfff6e0, 2.5, 25, Math.PI * 0.14, 0.3);
  spot.position.set(2, 8, 7); spot.castShadow = false; _scene.add(spot);
  const rim = new THREE.DirectionalLight(0x334466, 0.3);
  rim.position.set(-4, 2, -3); _scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffeedd, 0.2);
  fill.position.set(4, -1, 5); _scene.add(fill);

  bulbLight = new THREE.PointLight(0xffe080, 0, 5);
  bulbLight.position.set(3.5, 2.2, 0.5); _scene.add(bulbLight);

  raycaster = new THREE.Raycaster();
  mouse     = new THREE.Vector2();
  camFrom   = new THREE.Vector3();
  camTo     = new THREE.Vector3();
  camLookFrom = new THREE.Vector3();
  camLookTo   = new THREE.Vector3();
  mountFrom = new THREE.Vector3();
  mountTo   = new THREE.Vector3();

  _buildScene();

  window.addEventListener('resize', () => {
    if (!_open) return;
    const c = document.getElementById('si-canvas');
    if (!c || !_renderer) return;
    const w = c.clientWidth  || window.innerWidth;
    const h = c.clientHeight || window.innerHeight;
    _renderer.setSize(w, h);
    _camera.aspect = w / h;
    if (w < h) {
      _camera.fov = 44 * (h / w) * 0.75;
      if (_camera.fov > 72) _camera.fov = 72;
    } else {
      _camera.fov = 44;
    }
    _camera.updateProjectionMatrix();
  });
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function _box(w, h, d, col, rgh = 0.7, met = 0.1) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: col, roughness: rgh, metalness: met })
  );
}
function _cyl(rt, rb, h, segs, col, rgh = 0.5, met = 0.3) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs),
    new THREE.MeshStandardMaterial({ color: col, roughness: rgh, metalness: met })
  );
}
function _tube(pts, col, r = 0.036) {
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 32, r, 8, false),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.05 })
  );
}

function _buildScene() {
  // Wall
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(18, 10),
    new THREE.MeshLambertMaterial({ color: 0x1c1e22 }));
  wall.position.z = -1.5; wall.receiveShadow = false; _scene.add(wall);
  for (let i = -5; i <= 5; i++) {
    const plank = _box(16, 0.006, 0.01, 0x252830, 1, 0);
    plank.position.set(0, i * 0.85, -1.48); _scene.add(plank);
  }

  // ── Breaker box ───────────────────────────────────────────────────────────
  BX = -3.8; BY = 0.3; BZ = -1.3;
  HANDLE_ON_Y  = BY + 0.18;
  HANDLE_OFF_Y = BY - 0.18;

  const bkBody = _box(1.1, 1.8, 0.28, 0x3a3a3c, 0.7, 0.35);
  bkBody.position.set(BX, BY, BZ + 0.14); _scene.add(bkBody);
  const bkFace = _box(0.88, 1.56, 0.04, 0x242428, 0.88, 0.06);
  bkFace.position.set(BX, BY, BZ + 0.3); _scene.add(bkFace);
  const bkBand = _box(0.88, 0.06, 0.05, 0xF5C200, 0.65, 0.1);
  bkBand.position.set(BX, BY + 0.78, BZ + 0.31); _scene.add(bkBand);
  const bkSlot = _box(0.36, 0.7, 0.04, 0x181818, 0.95, 0);
  bkSlot.position.set(BX, BY, BZ + 0.32); _scene.add(bkSlot);

  bkHandleMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.42, metalness: 0.3 });
  bkHandle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.17), bkHandleMat);
  bkHandle.position.set(BX, HANDLE_ON_Y, BZ + 0.375); _scene.add(bkHandle);

  bkLEDMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, roughness: 0.3, metalness: 0.5,
    emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1
  });
  const bkLED = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12), bkLEDMat);
  bkLED.rotation.x = Math.PI / 2;
  bkLED.position.set(BX + 0.3, BY + 0.6, BZ + 0.315); _scene.add(bkLED);
  const bkConduit = _cyl(0.11, 0.11, 0.6, 10, 0x555555, 0.8, 0.35);
  bkConduit.position.set(BX, BY - 1.2, BZ + 0.14); _scene.add(bkConduit);

  // ── Wall box (junction box) ───────────────────────────────────────────────
  wbRoot = new THREE.Group();
  wbRoot.position.set(0, -0.2, 0);
  _scene.add(wbRoot);
  wallBox = _box(1.6, 2.0, 0.7, 0x4a3e28, 0.9, 0.06);
  wallBox.position.z = -1.15; wbRoot.add(wallBox);
  wbInterior = _box(1.35, 1.72, 0.08, 0x12100a, 0.95, 0);
  wbInterior.position.z = -0.79; wbRoot.add(wbInterior);
  wbFlange = _box(1.78, 2.18, 0.06, 0x7a7a7a, 0.45, 0.55);
  wbFlange.position.z = -0.82; wbRoot.add(wbFlange);

  // ── Switch (initially floating in front) ─────────────────────────────────
  swRoot = new THREE.Group();
  swRoot.position.set(0, -0.2, 2.0);
  _scene.add(swRoot);

  swBody = _box(0.8, 1.4, 0.22, 0xd8d4c8, 0.65, 0.05);
  swBody.castShadow = true; swRoot.add(swBody);
  const swLabel = _box(0.55, 0.18, 0.04, 0x888888, 0.8, 0.1);
  swLabel.position.set(0, 0.52, 0.12); swRoot.add(swLabel);

  swLeverMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.2 });
  swLever = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.18), swLeverMat);
  swLever.position.set(0, -0.05, 0.14); swRoot.add(swLever);

  [-0.28, 0.28].forEach(x => [-0.58, 0.58].forEach(y => {
    const sh = _cyl(0.065, 0.055, 0.06, 16, 0xb0b0b0, 0.25, 0.7);
    sh.rotation.x = Math.PI / 2; sh.position.set(x, y, 0.13); swRoot.add(sh);
  }));
  [-0.35, 0.35].forEach(y => {
    const ts = _cyl(0.07, 0.06, 0.1, 12, 0xd4aa44, 0.25, 0.7);
    ts.rotation.x = Math.PI / 2; ts.position.set(0, y, -0.12); swRoot.add(ts);
  });

  // ── Ceiling bulb ─────────────────────────────────────────────────────────
  const bulbRoot = new THREE.Group();
  bulbRoot.position.set(3.5, 3.8, 0);
  _scene.add(bulbRoot);
  const bulbCap = _cyl(0.3, 0.25, 0.25, 16, 0x555555, 0.6, 0.3);
  bulbCap.position.y = -0.12; bulbRoot.add(bulbCap);
  const cordPts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.05, -0.45, 0.02),
    new THREE.Vector3(-0.02, -0.9, -0.01),
    new THREE.Vector3(0, -1.35, 0)
  ];
  bulbRoot.add(_tube(cordPts, 0x222222, 0.02));
  const socket = _cyl(0.14, 0.1, 0.2, 16, 0x888888, 0.45, 0.5);
  socket.position.y = -1.45; bulbRoot.add(socket);

  bulbGlassMat = new THREE.MeshStandardMaterial({
    color: 0x88aaaa, roughness: 0.05, metalness: 0,
    transparent: true, opacity: 0.35,
    emissive: new THREE.Color(0x331100), emissiveIntensity: 0
  });
  bulbGlass = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 18), bulbGlassMat);
  bulbGlass.position.y = -1.8; bulbRoot.add(bulbGlass);

  filMat = new THREE.MeshStandardMaterial({
    color: 0xffcc44, roughness: 0.5, metalness: 0.8,
    emissive: new THREE.Color(0xffaa00), emissiveIntensity: 0
  });
  const filament = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 16), filMat);
  filament.position.y = -1.8; filament.rotation.x = Math.PI / 2; bulbRoot.add(filament);

  // ── Pre-built background wall wires ──────────────────────────────────────
  wallWires = [];
  [[0.55, -0.9], [0.2, -0.95], [-0.2, -0.95], [-0.55, -0.9]].forEach((v, i) => {
    const pts = [
      new THREE.Vector3(v[0], v[1], -0.78),
      new THREE.Vector3(v[0] * 0.6, -1.8, -0.75),
      new THREE.Vector3(BX + 0.2 * (i - 1.5), -1.6, -1.1),
    ];
    const wm = _tube(pts, [0xdc2626, 0x22c55e, 0x3b82f6, 0xd4d400][i], 0.028);
    wm.visible = false; wbRoot.add(wm); wallWires.push(wm);
  });

  clickBreakerObjs = [bkHandle];
}

// ─── Build switch wires (after mount) ─────────────────────────────────────────
function _buildSwitchWires() {
  if (swWiresBuilt) return; swWiresBuilt = true;
  const p = swRoot.position;
  function bsw(name, termPt, targetPt, col) {
    const pts = [
      termPt,
      new THREE.Vector3(termPt.x + (targetPt.x - termPt.x) * 0.3, termPt.y - 0.2, termPt.z + 0.3),
      new THREE.Vector3(termPt.x + (targetPt.x - termPt.x) * 0.7, targetPt.y + 0.2, targetPt.z + 0.2),
      targetPt
    ];
    const m = _tube(pts, col, 0.034);
    m.visible = false; _scene.add(m);
    swWires[name] = m;
  }
  bsw('live',    new THREE.Vector3(p.x - 0.35 + 0.55, p.y - 0.35, -0.74), new THREE.Vector3(p.x - 0.55, p.y - 0.35, -0.78), 0xdc2626);
  bsw('out',     new THREE.Vector3(p.x + 0.35 + 0.55, p.y + 0.35, -0.74), new THREE.Vector3(p.x + 0.55, p.y + 0.35, -0.78), 0x22c55e);
  bsw('neutral', new THREE.Vector3(p.x + 0.5, p.y + 0.6, -0.74),          new THREE.Vector3(p.x + 0.6, p.y + 0.7, -0.8),   0x3b82f6);
  bsw('earth',   new THREE.Vector3(p.x - 0.55, p.y - 0.65, -0.74),        new THREE.Vector3(p.x - 0.6, p.y - 0.75, -0.8),  0xd4d400);
}

function _buildBulbWire() {
  if (bulbWire) return;
  const pts = [
    new THREE.Vector3(0.55, -0.55, -0.74),
    new THREE.Vector3(1.2, 0.2, -0.6),
    new THREE.Vector3(2.4, 1.6, -0.4),
    new THREE.Vector3(3.5, 2.45, -0.2)
  ];
  bulbWire = _tube(pts, 0x22c55e, 0.032);
  _scene.add(bulbWire);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOM INIT
// ═══════════════════════════════════════════════════════════════════════════════

function _initDOMRefs() {
  tgtRing  = $s('ring');
  tgtPulse = $s('rpulse');
  tgtLabel = $s('rlabel');

  document.addEventListener('si-tool-select', e => {
    if (!_open) return;
    _selectTool(e.detail);
  });
}

function _initDragDrop() {
  ['live', 'out', 'neutral', 'earth'].forEach(name => {
    const draggable = $s('wd-' + name);
    const terminal  = $s('wt-' + name);
    if (draggable) draggable.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', name);
    });
    if (terminal) {
      terminal.addEventListener('dragover', e => e.preventDefault());
      terminal.addEventListener('drop', e => {
        e.preventDefault();
        if (!_open) return;
        const wc = e.dataTransfer.getData('text/plain');
        if (wc === name) _connectWire(wc);
        else {
          terminal.classList.add('si-reject');
          setTimeout(() => terminal.classList.remove('si-reject'), 400);
          _showToast('Wrong terminal! Match wire to matching slot.', 'err');
        }
      });
    }
  });

  // ── Mobile touch drag support ─────────────────────────────────────────────
  let _touchClone = null;

  ['live', 'out', 'neutral', 'earth'].forEach(name => {
    const draggable = $s('wd-' + name);
    if (!draggable) return;
    draggable.addEventListener('touchstart', e => {
      if (!_open || gameState !== 'wires') return;
      e.stopPropagation();
      _touchWire = name;
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
    const dragEl = $s('wd-' + _touchWire);
    if (dragEl) dragEl.style.opacity = '';
    _touchClone.remove(); _touchClone = null;

    if (!_open || gameState !== 'wires') { _touchWire = null; return; }

    const under = document.elementFromPoint(t.clientX, t.clientY);
    const term  = under && (under.classList.contains('si-wterm')
      ? under : under.closest?.('.si-wterm'));

    if (term) {
      const termName = term.id.replace('si-wt-', '');
      if (termName === _touchWire) {
        _connectWire(_touchWire);
      } else {
        term.classList.add('si-reject');
        setTimeout(() => term.classList.remove('si-reject'), 400);
        _showToast('Wrong terminal! Match wire to matching slot.', 'err');
      }
    }
    _touchWire = null;
  }, { passive: true });
}

function _initCanvasEvents() {
  const canvas = document.getElementById('si-canvas');
  if (!canvas) return;

  // Touch tap on canvas — no 300ms delay on mobile
  let _canvasTapId = -1, _canvasTapX = 0, _canvasTapY = 0, _canvasTapT = 0;
  canvas.addEventListener('touchstart', e => {
    if (!_open || _touchWire) return;
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
      if (Date.now() - _canvasTapT > 300) break;
      if (Math.hypot(t.clientX - _canvasTapX, t.clientY - _canvasTapY) > 18) break;
      _handleCanvasClick(t.clientX, t.clientY);
    }
  }, { passive: true });

  canvas.addEventListener('click', e => {
    if (!_open) return;
    _handleCanvasClick(e.clientX, e.clientY);
  });

  function _handleCanvasClick(cx, cy) {
    if (gameState === 'animating' || gameState === 'done') return;
    mouse.x =  (cx / canvas.clientWidth)  * 2 - 1;
    mouse.y = -(cy / canvas.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);

    if (gameState === 'breaker_off') {
      if (raycaster.intersectObjects(clickBreakerObjs, true).length) _doBreaker(true);
      else _showToast('Find the breaker panel on the left — tap it!', 'err');
    } else if (gameState === 'mount') {
      if (!activeTool) { _showToast('Select a tool first!', 'err'); return; }
      if (raycaster.intersectObject(wallBox, false).length ||
          raycaster.intersectObjects([wbFlange, wbInterior], false).length) {
        _doMount();
      } else _showToast('Click the wall box to mount the switch', 'err');
    } else if (gameState === 'breaker_on') {
      if (raycaster.intersectObjects(clickBreakerObjs, true).length) _doBreaker(false);
      else _showToast('Tap the breaker panel to switch it ON!', 'err');
    } else if (gameState === 'test') {
      if (activeTool !== 'multimeter') { _showToast('Select the Multimeter first!', 'err'); return; }
      if (raycaster.intersectObject(bulbGlass, false).length ||
          raycaster.intersectObject(swBody, false).length) _doTest();
      else _showToast('Tap the bulb or switch to test', 'err');
    }
  }

  canvas.addEventListener('mousemove', e => {
    if (!_open) return;
    mouse.x =  (e.clientX / canvas.clientWidth)  * 2 - 1;
    mouse.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    let cur = 'default';
    if ((gameState === 'breaker_off' || gameState === 'breaker_on') &&
        raycaster.intersectObjects(clickBreakerObjs, true).length) cur = 'pointer';
    else if (gameState === 'mount' &&
        (raycaster.intersectObject(wallBox, false).length ||
         raycaster.intersectObjects([wbFlange], false).length)) cur = 'pointer';
    else if (gameState === 'test' &&
        (raycaster.intersectObject(bulbGlass, false).length ||
         raycaster.intersectObject(swBody, false).length)) cur = 'pointer';
    canvas.style.cursor = cur;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function _doBreaker(goingOff) {
  gameState = 'animating'; _setTut(null);
  _showToast(goingOff ? 'Switching breaker OFF...' : 'Switching breaker back ON...', 'ok');
  _animateCam(new THREE.Vector3(-2, 0.5, 6.5), new THREE.Vector3(BX, BY, 0), 900, () => {
    bkGoingOff = goingOff; bkAnimT = 0; bkAnimating = true;
    bkCB = goingOff ? _afterBreakerOff : _afterBreakerOn;
  });
}

function _afterBreakerOff() {
  _completeTask(1, 12);
  _showToast('Breaker OFF — Now mount the switch to the wall box', 'ok');
  _setInstr('<span class="si-snum">STEP 2</span>Select <span>Mount Tool</span> then tap the <span>wall box</span>');
  _enableTool('mount'); _selectTool('mount');
  _setTut(wbFlange, 'TAP BOX');
  _animateCam(new THREE.Vector3(0, 0.3, 7), new THREE.Vector3(0, 0, 0), 800, () => { gameState = 'mount'; });
}

function _doMount() {
  gameState = 'animating'; _setTut(null);
  _showToast('Mounting switch to wall box...', 'ok');
  mountFrom.copy(swRoot.position);
  mountTo.set(0, -0.2, -0.72);
  mountT = 0; mountAnim = true;
  mountCB = _afterMount;
}

function _afterMount() {
  _completeTask(2, 24);
  _showToast('Switch mounted — Now connect the wires', 'ok');
  _buildSwitchWires();
  _setInstr('<span class="si-snum">STEP 3 & 4</span>Drag each <span>wire</span> to its matching <span>terminal</span>');
  const wp = $s('wire-panel'); if (wp) { wp.style.display = 'block'; }
  const instr = $s('instr'); if (instr) instr.style.display = 'none';
  wallWires.forEach(w => w.visible = true);
  gameState = 'wires';
  _animateCam(new THREE.Vector3(0, 0.4, 5.2), new THREE.Vector3(0, 0, 0), 700, () => { });
}

function _afterAllWires() {
  _completeTask(3, 36);
  _completeTask(4, 50);
  setTimeout(() => {
    _completeTask(5, 62);
    _showToast('All connections secured — Turn breaker back ON', 'ok');
    _setInstr('<span class="si-snum">STEP 6</span>Return to <span>breaker panel</span> and switch it <span>ON</span>');
    const instr = $s('instr'); if (instr) instr.style.display = 'block';
    _setTut(bkHandle, 'TAP BREAKER');
    gameState = 'breaker_on';
    _animateCam(new THREE.Vector3(-1, 0.5, 7.5), new THREE.Vector3(0, 0.2, 0), 1000, () => { });
  }, 1000);
}

function _afterBreakerOn() {
  _completeTask(6, 75);
  _showToast('Power ON — Flip the switch to test!', 'ok');
  _setInstr('<span class="si-snum">STEP 7</span>Tap the <span>FLIP SWITCH</span> button to test it');
  _setTut(null);
  const fu = $s('flip-ui'); if (fu) fu.style.display = 'flex';
  const instr = $s('instr'); if (instr) instr.style.display = 'block';
  gameState = 'flip';
  _animateCam(new THREE.Vector3(1.2, 0.4, 5.8), new THREE.Vector3(0.5, 0.1, 0), 800, () => { });
}

function _doFlip() {
  switchFlipped = !switchFlipped;
  const newLight = switchFlipped;
  leverTweenTarget = switchFlipped ? -0.38 : 0;
  leverTweening = true; leverT = 0;
  lightToggleCount++;

  setTimeout(() => {
    lightOn = newLight;
    _setLightState(lightOn);
    if (lightToggleCount >= 1) {
      _completeTask(7, 88);
      setTimeout(() => {
        _completeTask(8, 100);
        _showToast('Light confirmed working — Excellent work!', 'ok');
        const fu = $s('flip-ui'); if (fu) fu.style.display = 'none';
        gameState = 'test';
        _setInstr('<span class="si-snum">STEP 8</span>Select <span>Multimeter</span> and tap the <span>circuit</span> to verify');
        _enableTool('multimeter'); _selectTool('multimeter');
        _setTut(bulbGlass, 'TEST BULB');
        _animateCam(new THREE.Vector3(1.8, 1.8, 5.5), new THREE.Vector3(1.5, 1.5, 0), 900, () => { });
      }, 1500);
    }
  }, 300);
}

function _doTest() {
  gameState = 'animating'; _setTut(null);
  const ro = $s('reading'), rv = $s('rval');
  if (ro) ro.classList.add('show');
  if (rv) rv.textContent = '---';
  const steps = ['---', '18V', '67V', '124V', '198V', '218V', '220V'];
  let ri = 0;
  const iv = setInterval(() => {
    if (ri < steps.length && rv) { rv.textContent = steps[ri]; ri++; }
    if (ri >= steps.length) {
      clearInterval(iv);
      setTimeout(() => {
        if (ro) ro.classList.remove('show');
        gameState = 'done'; timerOn = false;
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        _showToast('220V AC verified — Circuit complete!', 'ok');
        _animateCam(new THREE.Vector3(0, 0.5, 8), new THREE.Vector3(0, 0, 0), 1200, () => {
          setTimeout(() => {
            const score = 600 + (timerVal * 1.5 | 0);
            const ss = $s('sscore'); if (ss) ss.textContent = `Score: ${score} pts`;
            const suc = $s('success'); if (suc) suc.classList.add('show');
            if (_onFixed) _onFixed(_stationId, 1);
          }, 800);
        });
      }, 600);
    }
  }, 200);
}

function _setLightState(on) {
  bulbLight.intensity = on ? 2.2 : 0;
  bulbGlassMat.emissive.setHex(on ? 0xffe080 : 0x0);
  bulbGlassMat.emissiveIntensity = on ? 1.4 : 0;
  bulbGlassMat.opacity = on ? 0.85 : 0.35;
  filMat.emissiveIntensity = on ? 2.5 : 0;
  const glowEl = document.getElementById('si-light-glow');
  if (glowEl) glowEl.className = on ? 'on' : '';
}

// ─── Wire connect ─────────────────────────────────────────────────────────────
const _wirePct  = { live: 36, out: 44, neutral: 50, earth: 56 };
const _wireMsg  = {
  live:    'Live wire connected → Switch Input',
  out:     'Output wire connected → Bulb',
  neutral: 'Neutral wire connected',
  earth:   'Earth/Ground connected'
};

function _connectWire(name) {
  if (wireConn[name]) return;
  wireConn[name] = true;
  const drag = $s('wd-' + name);
  if (drag) drag.classList.add('used');
  const term = $s('wt-' + name);
  if (term) {
    const bgMap = { live: '#7f1d1d', out: '#1c3a1c', neutral: '#1d3464', earth: '#164a2a' };
    term.style.background = bgMap[name]; term.style.color = '#fff';
    term.style.borderStyle = 'solid'; term.textContent = '✓';
    term.classList.add('si-term-ok');
    setTimeout(() => term.classList.remove('si-term-ok'), 400);
  }
  if (swWires[name]) swWires[name].visible = true;
  if (name === 'out') _buildBulbWire();
  _showToast(_wireMsg[name] + ' ✓', 'ok');
  _setPct(_wirePct[name]);

  if (wireConn.live && wireConn.out && wireConn.neutral && wireConn.earth) {
    setTimeout(_afterAllWires, 700);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAMERA TWEEN
// ═══════════════════════════════════════════════════════════════════════════════

function _animateCam(toPos, toLook, dur, cb) {
  camFrom.copy(_camera.position);
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(_camera.quaternion);
  camLookFrom.copy(_camera.position).addScaledVector(dir, 6);
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
  const overlay = document.getElementById('switchInstallOverlay');
  if (!overlay) return;
  const canvas = document.getElementById('si-canvas');
  if (!canvas) return;
  const showable = tutTarget3D !== null
    && gameState !== 'animating'
    && gameState !== 'wires'
    && gameState !== 'flip'
    && gameState !== 'done';

  if (!showable) {
    [tgtRing, tgtPulse, tgtLabel].forEach(el => el && (el.style.display = 'none'));
    return;
  }
  const wp = new THREE.Vector3();
  tutTarget3D.getWorldPosition(wp);
  const v = wp.clone().project(_camera);
  if (v.z > 1) {
    [tgtRing, tgtPulse, tgtLabel].forEach(el => el && (el.style.display = 'none'));
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// HUD HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function _completeTask(n, pct) {
  doneCount++;
  const el = $s('s' + n); if (el) { el.classList.remove('active'); el.classList.add('done'); }
  const nx = $s('s' + (n + 1)); if (nx) nx.classList.add('active');
  const dc = $s('done-ct'); if (dc) dc.textContent = doneCount;
  _setPct(pct);
}
function _setPct(p) {
  const bar = $s('pfill'); if (bar) bar.style.width = p + '%';
  const pct = $s('ppct'); if (pct) pct.textContent = p;
}
function _selectTool(t) {
  activeTool = t;
  ['screwdriver', 'pliers', 'mount', 'multimeter'].forEach(id => {
    const s = $s('tool-' + id); if (s) s.classList.remove('si-active');
  });
  const s = $s('tool-' + t); if (s) s.classList.add('si-active');
}
function _enableTool(t) {
  const s = $s('tool-' + t); if (s) s.classList.remove('si-off');
}
function _setInstr(html) {
  const el = $s('instr'); if (!el) return;
  el.style.display = 'block'; el.innerHTML = html;
}
function _showToast(msg, type) {
  const t = $s('toast'); if (!t) return;
  t.textContent = msg; t.className = 'si-toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════════════════════════════════════════

function _resetAll() {
  gameState = 'breaker_off'; activeTool = null;
  wireConn = { live: false, out: false, neutral: false, earth: false };
  doneCount = 0; timerVal = 480; timerOn = true;
  switchFlipped = false; lightOn = false; lightToggleCount = 0;
  swWiresBuilt = false;
  bkAnimating = false; bkAnimT = 0;
  mountAnim = false; mountT = 0;
  leverTweening = false; leverT = 0; leverTweenTarget = 0;
  camTweening = false; idleT = 0;

  // 3D reset
  bkHandle.position.set(BX, HANDLE_ON_Y, BZ + 0.375);
  bkHandleMat.color.setHex(0x22c55e);
  bkLEDMat.color.setHex(0x22c55e);
  bkLEDMat.emissive.setHex(0x22c55e);
  bkLEDMat.emissiveIntensity = 1;

  swRoot.position.set(0, -0.2, 2.0);
  swRoot.rotation.set(0, 0, 0);
  swLever.rotation.x = 0; swLever.position.y = -0.05;

  _setLightState(false);
  wallWires.forEach(w => w.visible = false);
  Object.values(swWires).forEach(w => { _scene.remove(w); });
  Object.keys(swWires).forEach(k => delete swWires[k]);
  if (bulbWire) { _scene.remove(bulbWire); bulbWire = null; }

  _camera.position.set(0, 0.5, 8);
  _camera.lookAt(0, 0, 0);

  // HUD reset
  _setPct(0);
  const dc = $s('done-ct'); if (dc) dc.textContent = '0';
  for (let i = 1; i <= 8; i++) {
    const el = $s('s' + i); if (!el) continue;
    el.classList.remove('done', 'active');
    if (i === 1) el.classList.add('active');
  }
  const wp = $s('wire-panel'); if (wp) wp.style.display = 'none';
  const fu = $s('flip-ui'); if (fu) fu.style.display = 'none';
  const suc = $s('success'); if (suc) suc.classList.remove('show');
  const ro = $s('reading'); if (ro) ro.classList.remove('show');
  const rv = $s('rval'); if (rv) rv.textContent = '---';
  _setInstr('<span class="si-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>');

  const wireTermLabels = { live: 'L-IN', out: 'L-OUT', neutral: 'N', earth: 'E' };
  const wireTermColors = { live: '#ef4444', out: '#22c55e', neutral: '#3b82f6', earth: '#a3e635' };
  ['live', 'out', 'neutral', 'earth'].forEach(n => {
    const wd = $s('wd-' + n); if (wd) wd.classList.remove('used');
    const wt = $s('wt-' + n);
    if (wt) {
      wt.style.background = ''; wt.style.color = wireTermColors[n];
      wt.style.borderStyle = 'dashed'; wt.textContent = wireTermLabels[n];
    }
  });
  ['screwdriver', 'pliers', 'mount', 'multimeter'].forEach(t => {
    const s = $s('tool-' + t); if (!s) return;
    s.classList.add('si-off'); s.classList.remove('si-active');
  });
  _setTut(bkHandle, 'TAP HERE');

  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const timerEl = $s('timer'); if (timerEl) timerEl.textContent = '08:00';
  timerInterval = setInterval(() => {
    if (!timerOn || !_open) return;
    timerVal = Math.max(0, timerVal - 1);
    const m = Math.floor(timerVal / 60).toString().padStart(2, '0');
    const s = (timerVal % 60).toString().padStart(2, '0');
    const tel = $s('timer'); if (tel) tel.textContent = `${m}:${s}`;
  }, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════════════

function _loop() {
  if (!_open) return;
  requestAnimationFrame(_loop);
  const dt = Math.min(_clock.getDelta(), 0.05);
  idleT = (idleT || 0) + dt;

  // Idle sway
  wbRoot.position.y = -0.2 + Math.sin(idleT * 0.5) * 0.012;
  wbRoot.rotation.z = Math.sin(idleT * 0.32) * 0.005;
  if (gameState !== 'animating' && swRoot.position.z > 0.5) {
    swRoot.position.y = Math.sin(idleT * 0.65) * 0.06 + 0.2;
    swRoot.rotation.z = Math.sin(idleT * 0.45) * 0.04;
  }

  // Bulb pulse when on
  if (lightOn) {
    const pulse = 0.9 + 0.1 * Math.sin(idleT * 4.5);
    bulbLight.intensity = 2.2 * pulse;
    filMat.emissiveIntensity = 2.5 * pulse;
  }

  // Camera tween
  if (camTweening) {
    camT += dt * 1000;
    const p = _eio3(Math.min(camT / camDur, 1));
    _camera.position.lerpVectors(camFrom, camTo, p);
    _camera.lookAt(new THREE.Vector3().lerpVectors(camLookFrom, camLookTo, p));
    if (camT >= camDur) { camTweening = false; if (camCB) { const cb = camCB; camCB = null; cb(); } }
  }

  // Breaker animation
  if (bkAnimating) {
    bkAnimT += dt * 3;
    const p = _eio3(Math.min(bkAnimT, 1));
    const fy = bkGoingOff ? HANDLE_ON_Y : HANDLE_OFF_Y;
    const ty = bkGoingOff ? HANDLE_OFF_Y : HANDLE_ON_Y;
    bkHandle.position.y = fy + (ty - fy) * p;
    if (bkAnimT >= 1) {
      bkAnimating = false;
      bkHandle.position.y = bkGoingOff ? HANDLE_OFF_Y : HANDLE_ON_Y;
      if (bkGoingOff) {
        bkHandleMat.color.setHex(0xef4444); bkLEDMat.color.setHex(0xef4444);
        bkLEDMat.emissive.setHex(0x881111); bkLEDMat.emissiveIntensity = 0.5;
      } else {
        bkHandleMat.color.setHex(0x22c55e); bkLEDMat.color.setHex(0x22c55e);
        bkLEDMat.emissive.setHex(0x22c55e); bkLEDMat.emissiveIntensity = 1.0;
      }
      if (bkCB) { const cb = bkCB; bkCB = null; cb(); }
    }
  }

  // Switch mount animation
  if (mountAnim) {
    mountT += dt * 1.2;
    const p = _eio3(Math.min(mountT, 1));
    swRoot.position.lerpVectors(mountFrom, mountTo, p);
    swRoot.rotation.z = (1 - p) * 0.18;
    if (mountT >= 1) {
      mountAnim = false;
      swRoot.position.copy(mountTo);
      swRoot.rotation.z = 0;
      if (mountCB) { const cb = mountCB; mountCB = null; cb(); }
    }
  }

  // Lever tween
  if (leverTweening) {
    leverT += dt * 4;
    const p = _eio3(Math.min(leverT, 1));
    swLever.rotation.x = leverTweenTarget * p + swLever.rotation.x * (1 - p);
    swLever.position.y = -0.05 + leverTweenTarget * 0.15 * p;
    if (leverT >= 1) {
      leverTweening = false;
      swLever.rotation.x = leverTweenTarget;
      swLever.position.y = -0.05 + leverTweenTarget * 0.15;
    }
  }

  _updateTutorial();
  _renderer.render(_scene, _camera);
}

// ─── Expose doFlip globally for the HTML button ───────────────────────────────
window._siDoFlip = function() {
  if (!_open || gameState !== 'flip') return;
  _doFlip();
};
// Expose closeSwitch globally for the HTML button
window.closeSwitch = () => closeSwitch();
// Expose tool select for toolbar
window._siSelectTool = (t) => {
  document.dispatchEvent(new CustomEvent('si-tool-select', { detail: t }));
};
// Expose play again
window._siPlayAgain = () => {
  if (_open) _resetAll();
};

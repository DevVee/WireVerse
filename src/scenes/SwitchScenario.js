import * as THREE from 'three';

// PH standard single-pole switch: COM=L/Brown, L1=SL/Blue, E=Earth/Green
export class SwitchScenario {
  constructor(root, onFixed) {
    this._root    = root;
    this._onFixed = onFixed;
    this._open    = false;
    this._switchId = 1;

    // 3D objects
    this._swRoot = null; this._swLever = null;
    this._swLeverMat = null; this._swBodyMesh = null;
    this._bkHandle = null; this._bkHandleMat = null; this._bkLEDMat = null;
    this._wbFlange = null;
    this._bulbGlassMat = null; this._filMat = null;
    this._bulbLight = null; this._bulbGlass = null; this._bulbRoot = null;
    this._wallWires = []; this._swWires = {}; this._bulbWire = null;
    this._BX = 0; this._BY = 0; this._BZ = 0;
    this._HANDLE_ON_Y = 0; this._HANDLE_OFF_Y = 0;

    // Raycaster targets
    this._clickBreakerObjs = []; this._clickWallBoxObjs = [];
    this._clickBulbObjs = []; this._clickSwObjs = [];
    this._raycaster = null; this._mouse = null;

    // Game state
    this._gameState = 'breaker_off';
    this._activeTool = null;
    this._wireConn = { red: false, black: false };
    this._completedTasks = 0;
    this._timerVal = 480; this._timerRunning = false; this._timerInterval = null;
    this._switchFlipped = false; this._lightOn = false;
    this._swWiresBuilt = false;

    // Touch wire drag
    this._touchWire = null; this._touchClone = null;

    // Animations
    this._bkAnimating = false; this._bkAnimT = 0; this._bkGoingOff = false; this._bkCB = null;
    this._mountAnim = false; this._mountT = 0;
    this._mountFrom = new THREE.Vector3(); this._mountTo = new THREE.Vector3(); this._mountCB = null;
    this._leverTween = false; this._leverT = 0; this._leverTarget = 0;
    this._camTweening = false; this._camT = 0; this._camDur = 0; this._camCB = null;
    this._camFrom = new THREE.Vector3(); this._camTo = new THREE.Vector3();
    this._camLookFrom = new THREE.Vector3(); this._camLookTo = new THREE.Vector3();
    this._idleT = 0; this._tutTarget = null;
    this._toastTimer = null; this._camHintTimer = null;

    // Renderer
    this._renderer = null; this._scene = null; this._camera = null; this._clock = null;
    this._raf = null; this._docListeners = [];

    this._initThree();
    this._initDragDrop();
    this._initCanvasEvents();
  }

  // ── PUBLIC API ───────────────────────────────────────────────────────────────

  open(switchId) {
    this._switchId = switchId;
    const overlay = this._root.querySelector('#sw-overlay');
    if (overlay) overlay.style.display = 'block';
    requestAnimationFrame(() => {
      const canvas = this._root.querySelector('#sw-canvas');
      if (canvas && this._renderer) {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        this._renderer.setSize(w, h);
        this._camera.aspect = w / h;
        this._camera.fov = w < h ? Math.min(70, 44 * (h / w) * 0.75) : 44;
        this._camera.updateProjectionMatrix();
      }
    });
    const LABELS = { 1: 'Workshop A Station 1', 2: 'Workshop B Station 2', 3: 'Workshop B Station 3' };
    const lbl = this._$s('label');
    if (lbl) lbl.textContent = `Switch #${switchId} — ${LABELS[switchId] || 'Station'}`;
    this._resetAll();
    if (!this._open) { this._open = true; this._loop(); }
  }

  close() {
    this._open = false;
    const overlay = this._root.querySelector('#sw-overlay');
    if (overlay) overlay.style.display = 'none';
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    if (this._touchClone) { this._touchClone.remove(); this._touchClone = null; }
    this._touchWire = null;
  }

  destroy() {
    this.close();
    cancelAnimationFrame(this._raf); this._raf = null;
    for (const [t, e, fn] of this._docListeners) t.removeEventListener(e, fn);
    this._docListeners = [];
    if (this._scene) this._scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    if (this._renderer) { this._renderer.dispose(); this._renderer = null; }
  }

  // ── INIT ────────────────────────────────────────────────────────────────────

  _$s(id) { return this._root.querySelector('#sw-' + id); }

  _initThree() {
    const canvas = this._root.querySelector('#sw-canvas');
    if (!canvas) { console.error('[SwitchScenario] #sw-canvas not found'); return; }
    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    this._renderer.setPixelRatio(1.0);
    this._renderer.shadowMap.enabled = false;
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x080a0d);
    this._scene.fog = new THREE.Fog(0x080a0d, 14, 28);

    this._camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 100);
    this._camera.position.set(0, 0.5, 8);
    this._camera.lookAt(0, 0, 0);
    this._clock = new THREE.Clock();

    this._scene.add(new THREE.AmbientLight(0xffffff, 0.32));
    const spot = new THREE.SpotLight(0xfff6e0, 2.5, 25, Math.PI * 0.14, 0.3);
    spot.position.set(2, 8, 7); this._scene.add(spot); this._scene.add(spot.target);
    const rim = new THREE.DirectionalLight(0x334466, 0.3);
    rim.position.set(-4, 2, -3); this._scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffeedd, 0.2);
    fill.position.set(4, -1, 5); this._scene.add(fill);

    this._bulbLight = new THREE.PointLight(0xffe080, 0, 6);
    this._bulbLight.position.set(3.5, 2.2, 0.5); this._scene.add(this._bulbLight);

    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    this._buildScene();

    const _resizeFn = () => {
      if (!this._open || !this._renderer) return;
      const c = this._root.querySelector('#sw-canvas'); if (!c) return;
      const w = c.clientWidth || window.innerWidth;
      const h = c.clientHeight || window.innerHeight;
      this._renderer.setSize(w, h);
      this._camera.aspect = w / h;
      this._camera.fov = w < h ? Math.min(70, 44 * (h / w) * 0.75) : 44;
      this._camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', _resizeFn);
    this._docListeners.push([window, 'resize', _resizeFn]);
  }

  _mkBox(w, h, d, col, rgh = 0.7, met = 0.1) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: col, roughness: rgh, metalness: met }));
  }
  _mkCyl(rt, rb, h, segs, col, rgh = 0.5, met = 0.3) {
    return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs),
      new THREE.MeshStandardMaterial({ color: col, roughness: rgh, metalness: met }));
  }
  _mkTube(pts, col, r = 0.034) {
    return new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, r, 8, false),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.05 }));
  }

  _buildScene() {
    const sc = this._scene;

    // Wall
    const wall = this._mkBox(18, 10, 0.01, 0x1c1e22, 1, 0);
    wall.position.z = -1.5; sc.add(wall);
    for (let i = -5; i <= 5; i++) {
      const p = this._mkBox(16, 0.006, 0.01, 0x252830, 1, 0);
      p.position.set(0, i * 0.85, -1.48); sc.add(p);
    }

    // Breaker box
    this._BX = -3.8; this._BY = 0.3; this._BZ = -1.3;
    const BX = this._BX, BY = this._BY, BZ = this._BZ;

    const bkBody = this._mkBox(1.1, 1.8, 0.28, 0x3a3a3c, 0.7, 0.35);
    bkBody.position.set(BX, BY, BZ + 0.14); sc.add(bkBody);
    const bkFace = this._mkBox(0.88, 1.56, 0.04, 0x242428, 0.88, 0.06);
    bkFace.position.set(BX, BY, BZ + 0.3); sc.add(bkFace);
    const bkBand = this._mkBox(0.88, 0.06, 0.05, 0xF5C200, 0.65, 0.1);
    bkBand.position.set(BX, BY + 0.78, BZ + 0.31); sc.add(bkBand);
    const bkSlot = this._mkBox(0.36, 0.7, 0.04, 0x181818, 0.95, 0);
    bkSlot.position.set(BX, BY, BZ + 0.32); sc.add(bkSlot);

    this._HANDLE_ON_Y = BY + 0.18; this._HANDLE_OFF_Y = BY - 0.18;
    this._bkHandleMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.42, metalness: 0.3 });
    this._bkHandle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.17), this._bkHandleMat);
    this._bkHandle.position.set(BX, this._HANDLE_ON_Y, BZ + 0.375); sc.add(this._bkHandle);

    this._bkLEDMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, roughness: 0.3, metalness: 0.5,
      emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1.0,
    });
    const bkLED = this._mkCyl(0.05, 0.05, 0.06, 12, 0x22c55e);
    bkLED.material = this._bkLEDMat;
    bkLED.rotation.x = Math.PI / 2; bkLED.position.set(BX + 0.3, BY + 0.6, BZ + 0.315); sc.add(bkLED);

    const bkConduit = this._mkCyl(0.11, 0.11, 0.6, 10, 0x555555, 0.8, 0.35);
    bkConduit.position.set(BX, BY - 1.2, BZ + 0.14); sc.add(bkConduit);

    // Wall junction box
    this._wbRoot = new THREE.Group();
    this._wbRoot.position.set(0, -0.2, 0); sc.add(this._wbRoot);

    const wallBox = this._mkBox(1.6, 2.0, 0.7, 0x4a3e28, 0.9, 0.06);
    wallBox.position.z = -1.15; this._wbRoot.add(wallBox);
    const wbInterior = this._mkBox(1.35, 1.72, 0.08, 0x12100a, 0.95, 0);
    wbInterior.position.z = -0.79; this._wbRoot.add(wbInterior);
    this._wbFlange = this._mkBox(1.78, 2.18, 0.06, 0x7a7a7a, 0.45, 0.55);
    this._wbFlange.position.z = -0.82; this._wbRoot.add(this._wbFlange);

    // Background wall wires — PH standard: RED=COM/Live, BLACK=L1/Output
    this._wallWires = [];
    [[0.2, -0.9], [-0.2, -0.9]].forEach((v, i) => {
      const pts = [
        new THREE.Vector3(v[0], v[1], -0.78),
        new THREE.Vector3(v[0] * 0.5, -1.8, -0.78),
        new THREE.Vector3(BX + 0.15 * (i === 0 ? 1 : -1), -1.5, -1.1),
      ];
      const wm = this._mkTube(pts, [0xdc2626, 0x111111][i], 0.026);
      wm.visible = false; this._wbRoot.add(wm); this._wallWires.push(wm);
    });

    // Switch body (starts floating in front)
    this._swRoot = new THREE.Group();
    this._swRoot.position.set(0, -0.2, 2.0); sc.add(this._swRoot);

    this._swBodyMesh = this._mkBox(0.8, 1.4, 0.22, 0xd8d4c8, 0.65, 0.05);
    this._swRoot.add(this._swBodyMesh);

    // Label plate
    const swLabel = this._mkBox(0.55, 0.18, 0.04, 0x888888, 0.8, 0.1);
    swLabel.position.set(0, 0.52, 0.12); this._swRoot.add(swLabel);

    // Lever
    this._swLeverMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.2 });
    this._swLever = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.18), this._swLeverMat);
    this._swLever.position.set(0, -0.05, 0.14); this._swRoot.add(this._swLever);

    // Corner screws
    [-0.28, 0.28].forEach(x => [-0.58, 0.58].forEach(y => {
      const sh = this._mkCyl(0.065, 0.055, 0.06, 16, 0xb0b0b0, 0.25, 0.7);
      sh.rotation.x = Math.PI / 2; sh.position.set(x, y, 0.13); this._swRoot.add(sh);
    }));

    // Terminal screws: COM=RED (top), L1=BLACK (bottom)
    const termColors = [0xdc2626, 0x333333];
    const termYs = [0.32, -0.32];
    termYs.forEach((y, i) => {
      const ts = this._mkCyl(0.06, 0.05, 0.1, 12, termColors[i], 0.25, 0.7);
      ts.rotation.x = Math.PI / 2; ts.position.set(0, y, -0.12); this._swRoot.add(ts);
    });

    // Ceiling bulb (right side)
    this._bulbRoot = new THREE.Group();
    this._bulbRoot.position.set(3.5, 3.8, 0); sc.add(this._bulbRoot);

    const bulbCap = this._mkCyl(0.3, 0.25, 0.25, 16, 0x555555, 0.6, 0.3);
    bulbCap.position.y = -0.12; this._bulbRoot.add(bulbCap);

    const cordPts = [
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, -0.45, 0.02),
      new THREE.Vector3(-0.02, -0.9, -0.01), new THREE.Vector3(0, -1.35, 0),
    ];
    this._bulbRoot.add(this._mkTube(cordPts, 0x222222, 0.02));

    const socket = this._mkCyl(0.14, 0.1, 0.2, 16, 0x888888, 0.45, 0.5);
    socket.position.y = -1.45; this._bulbRoot.add(socket);

    this._bulbGlassMat = new THREE.MeshStandardMaterial({
      color: 0x88aaaa, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.35,
      emissive: new THREE.Color(0x331100), emissiveIntensity: 0,
    });
    this._bulbGlass = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 18), this._bulbGlassMat);
    this._bulbGlass.position.y = -1.8; this._bulbRoot.add(this._bulbGlass);

    this._filMat = new THREE.MeshStandardMaterial({
      color: 0xffcc44, roughness: 0.5, metalness: 0.8,
      emissive: new THREE.Color(0xffaa00), emissiveIntensity: 0,
    });
    const filament = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 16), this._filMat);
    filament.position.y = -1.8; filament.rotation.x = Math.PI / 2; this._bulbRoot.add(filament);

    this._clickBreakerObjs = [this._bkHandle];
    this._clickWallBoxObjs = [wallBox, this._wbFlange, wbInterior];
    this._clickBulbObjs   = [this._bulbGlass];
    this._clickSwObjs     = [this._swBodyMesh];
  }

  // ── DRAG-DROP (wire panel) ───────────────────────────────────────────────────

  _initDragDrop() {
    ['red', 'black'].forEach(color => {
      const draggable = this._root.querySelector(`#sw-wd-${color}`);
      const terminal  = this._root.querySelector(`#sw-wt-${color}`);
      if (draggable) draggable.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', color);
      });
      if (terminal) {
        terminal.addEventListener('dragover', e => e.preventDefault());
        terminal.addEventListener('drop', e => {
          e.preventDefault();
          if (!this._open) return;
          const wc = e.dataTransfer.getData('text/plain');
          if (wc === color) this._connectWire(wc);
          else {
            terminal.classList.add('sw-reject');
            setTimeout(() => terminal.classList.remove('sw-reject'), 400);
            this._showToast('Wrong terminal! Match the wire color.', 'err');
          }
        });
      }
      if (draggable) {
        draggable.addEventListener('touchstart', e => {
          if (!this._open || this._gameState !== 'wires') return;
          e.stopPropagation();
          this._touchWire = color;
          const r = draggable.getBoundingClientRect();
          const t = e.changedTouches[0];
          this._touchClone = draggable.cloneNode(true);
          Object.assign(this._touchClone.style, {
            position: 'fixed', zIndex: '9999', pointerEvents: 'none', opacity: '0.82',
            width: r.width + 'px', left: (t.clientX - r.width / 2) + 'px',
            top: (t.clientY - r.height / 2) + 'px', margin: '0',
          });
          document.body.appendChild(this._touchClone);
          draggable.style.opacity = '0.4';
        }, { passive: false });
      }
    });

    const _moveFn = e => {
      if (!this._touchClone) return;
      const t = e.changedTouches[0];
      this._touchClone.style.left = (t.clientX - parseFloat(this._touchClone.style.width) / 2) + 'px';
      this._touchClone.style.top  = (t.clientY - 16) + 'px';
    };
    const _endFn = e => {
      if (!this._touchClone || !this._touchWire) return;
      const t = e.changedTouches[0];
      const dragEl = this._root.querySelector(`#sw-wd-${this._touchWire}`);
      if (dragEl) dragEl.style.opacity = '';
      this._touchClone.remove(); this._touchClone = null;
      if (!this._open || this._gameState !== 'wires') { this._touchWire = null; return; }
      const under = document.elementFromPoint(t.clientX, t.clientY);
      const term  = under && (under.classList.contains('sw-wire-term')
        ? under : under.closest?.('.sw-wire-term'));
      if (term) {
        const termColor = term.id.replace('sw-wt-', '');
        if (termColor === this._touchWire) this._connectWire(this._touchWire);
        else {
          term.classList.add('sw-reject');
          setTimeout(() => term.classList.remove('sw-reject'), 400);
          this._showToast('Wrong terminal! Match the wire color.', 'err');
        }
      }
      this._touchWire = null;
    };
    const _cancelFn = () => {
      if (!this._touchClone) return;
      const dragEl = this._touchWire ? this._root.querySelector(`#sw-wd-${this._touchWire}`) : null;
      if (dragEl) dragEl.style.opacity = '';
      this._touchClone.remove(); this._touchClone = null; this._touchWire = null;
    };
    document.addEventListener('touchmove',   _moveFn,   { passive: true });
    document.addEventListener('touchend',     _endFn,    { passive: true });
    document.addEventListener('touchcancel',  _cancelFn, { passive: true });
    this._docListeners.push(
      [document, 'touchmove',  _moveFn],
      [document, 'touchend',   _endFn],
      [document, 'touchcancel', _cancelFn],
    );
  }

  // ── CANVAS EVENTS ───────────────────────────────────────────────────────────

  _initCanvasEvents() {
    const canvas = this._root.querySelector('#sw-canvas');
    if (!canvas) return;
    let _tapId = -1, _tapX = 0, _tapY = 0, _tapT = 0;
    canvas.addEventListener('touchstart', e => {
      if (!this._open || this._touchWire) return;
      if (e.changedTouches.length !== 1 || _tapId !== -1) return;
      const t = e.changedTouches[0];
      _tapId = t.identifier; _tapX = t.clientX; _tapY = t.clientY; _tapT = Date.now();
    }, { passive: true });
    canvas.addEventListener('touchend', e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== _tapId) continue;
        _tapId = -1;
        if (!this._open) break;
        if (Date.now() - _tapT > 300) break;
        if (Math.hypot(t.clientX - _tapX, t.clientY - _tapY) > 18) break;
        this._handleClick(t.clientX, t.clientY);
      }
    }, { passive: true });
    canvas.addEventListener('click', e => { if (this._open) this._handleClick(e.clientX, e.clientY); });
    canvas.addEventListener('mousemove', e => {
      if (!this._open) return;
      this._mouse.x =  (e.clientX / canvas.clientWidth)  * 2 - 1;
      this._mouse.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
      this._raycaster.setFromCamera(this._mouse, this._camera);
      let cur = 'default';
      if ((this._gameState === 'breaker_off' || this._gameState === 'breaker_on') &&
          this._raycaster.intersectObjects(this._clickBreakerObjs, true).length) cur = 'pointer';
      else if (this._gameState === 'mount' &&
          this._raycaster.intersectObjects(this._clickWallBoxObjs, false).length) cur = 'pointer';
      else if (this._gameState === 'test' &&
          (this._raycaster.intersectObjects(this._clickBulbObjs, false).length ||
           this._raycaster.intersectObjects(this._clickSwObjs, false).length)) cur = 'pointer';
      canvas.style.cursor = cur;
    });
  }

  _handleClick(cx, cy) {
    const canvas = this._root.querySelector('#sw-canvas'); if (!canvas) return;
    if (['animating', 'wires', 'flip', 'done'].includes(this._gameState)) return;
    this._mouse.x =  (cx / canvas.clientWidth)  * 2 - 1;
    this._mouse.y = -(cy / canvas.clientHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);
    if (this._gameState === 'breaker_off') {
      if (this._raycaster.intersectObjects(this._clickBreakerObjs, true).length) this._doBreaker(true);
      else this._showToast('Find the breaker panel on the left — tap it!', 'err');
    } else if (this._gameState === 'mount') {
      if (!this._activeTool) { this._showToast('Select Mount Tool first!', 'err'); return; }
      if (this._raycaster.intersectObjects(this._clickWallBoxObjs, false).length) this._doMount();
      else this._showToast('Click the wall box to mount the switch', 'err');
    } else if (this._gameState === 'breaker_on') {
      if (this._raycaster.intersectObjects(this._clickBreakerObjs, true).length) this._doBreaker(false);
      else this._showToast('Tap the breaker panel to switch it back ON!', 'err');
    } else if (this._gameState === 'test') {
      if (this._activeTool !== 'multimeter') { this._showToast('Select the Multimeter first!', 'err'); return; }
      if (this._raycaster.intersectObjects([...this._clickBulbObjs, ...this._clickSwObjs], false).length)
        this._doTest();
      else this._showToast('Tap the bulb or switch to test', 'err');
    }
  }

  // ── GAME ACTIONS ─────────────────────────────────────────────────────────────

  _doBreaker(goingOff) {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast(goingOff ? 'Switching breaker OFF...' : 'Switching breaker back ON...', 'ok');
    this._showCamHint('Panning to breaker');
    this._animateCam(
      new THREE.Vector3(-2, 0.5, 6.5), new THREE.Vector3(this._BX, this._BY, 0), 900,
      () => {
        this._bkGoingOff = goingOff; this._bkAnimT = 0; this._bkAnimating = true;
        this._bkCB = goingOff ? () => this._afterBreakerOff() : () => this._afterBreakerOn();
      }
    );
  }

  _afterBreakerOff() {
    this._completeTask(1, 12);
    this._showToast('Breaker OFF ✓ — Mount the switch to the wall box', 'ok');
    this._setInstr('<span class="sw-snum">STEP 2</span>Select <span>Mount Tool</span> then tap the <span>wall box</span>');
    this._enableTool('mount'); this._selectTool('mount');
    this._setTut(this._wbFlange, 'TAP BOX');
    this._animateCam(new THREE.Vector3(0, 0.3, 7), new THREE.Vector3(0, 0, 0), 800,
      () => { this._gameState = 'mount'; });
  }

  _doMount() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Mounting switch to wall box...', 'ok');
    this._showCamHint('Mounting switch');
    this._mountFrom.copy(this._swRoot.position);
    this._mountTo.set(0, -0.2, -0.72);
    this._mountT = 0; this._mountAnim = true;
    this._mountCB = () => this._afterMount();
  }

  _afterMount() {
    this._completeTask(2, 24);
    this._showToast('Switch mounted ✓ — Connect the wires', 'ok');
    this._buildSwWires();
    this._setInstr('<span class="sw-snum">STEP 3–5</span>Drag each <span>wire</span> to its matching <span>terminal</span>');
    const wp = this._$s('wire-panel'); if (wp) wp.style.display = 'block';
    const ins = this._$s('instruction'); if (ins) ins.style.display = 'none';
    this._wallWires.forEach(w => w.visible = true);
    this._gameState = 'wires';
    this._animateCam(new THREE.Vector3(0, 0.4, 5.2), new THREE.Vector3(0, 0, 0), 700, () => {});
  }

  _buildSwWires() {
    if (this._swWiresBuilt) return; this._swWiresBuilt = true;
    const p = this._swRoot.position; // (0, -0.2, -0.72) after mount
    const BX = this._BX, BY = this._BY;

    // RED = COM/Live — goes from switch top terminal to breaker box
    this._swWires.red = this._mkTube([
      new THREE.Vector3(p.x, p.y + 0.32, p.z - 0.12),
      new THREE.Vector3(p.x - 0.3, p.y - 0.5, -0.88),
      new THREE.Vector3(BX + 0.25, BY - 0.3, -1.15),
    ], 0xdc2626, 0.032);
    this._swWires.red.visible = false; this._scene.add(this._swWires.red);

    // BLACK = L1/Output — goes from switch bottom terminal to ceiling bulb
    this._swWires.black = this._mkTube([
      new THREE.Vector3(p.x, p.y - 0.32, p.z - 0.12),
      new THREE.Vector3(0.8, 0.2, -0.8),
      new THREE.Vector3(2.0, 1.4, -0.5),
      new THREE.Vector3(3.5, 2.45, -0.2),
    ], 0x111111, 0.032);
    this._swWires.black.visible = false; this._scene.add(this._swWires.black);
  }

  _connectWire(color) {
    if (this._wireConn[color]) return;
    this._wireConn[color] = true;

    const draggable = this._root.querySelector(`#sw-wd-${color}`);
    const term      = this._root.querySelector(`#sw-wt-${color}`);
    if (draggable) draggable.classList.add('sw-used');
    if (term) {
      const bgMap = { red: '#7f1d1d', black: '#1f2937' };
      term.style.background = bgMap[color];
      term.style.color = '#fff'; term.style.borderStyle = 'solid'; term.textContent = '✓';
    }
    if (this._swWires[color]) this._swWires[color].visible = true;

    const stepMap = { red: 3, black: 4 };
    const pctMap  = { red: 36, black: 48 };
    const termLbl = { red: 'COM', black: 'L1' };
    const step = stepMap[color];
    const lbl  = color === 'red' ? 'RED (COM/Live)' : 'BLACK (L1/Output)';

    const el = this._$s('s' + step);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
    this._completedTasks++;
    const dc = this._$s('done-count'); if (dc) dc.textContent = this._completedTasks;
    this._setPct(pctMap[color]);
    this._showToast(`${lbl} → ${termLbl[color]} ✓`, 'ok');

    if (this._wireConn.red && this._wireConn.black) {
      // Auto-complete step 5 (secure terminals) then proceed
      const s5 = this._$s('s5');
      if (s5) { s5.classList.remove('active'); s5.classList.add('done'); }
      this._completedTasks++;
      const dc2 = this._$s('done-count'); if (dc2) dc2.textContent = this._completedTasks;
      this._setPct(60);
      const s6 = this._$s('s6'); if (s6) s6.classList.add('active');
      this._afterAllWires();
    } else {
      const next = !this._wireConn.red ? 3 : 4;
      const nx = this._$s('s' + next); if (nx) nx.classList.add('active');
    }
  }

  _afterAllWires() {
    setTimeout(() => {
      this._showToast('All wires secured ✓ — Turn breaker back ON', 'ok');
      this._setInstr('<span class="sw-snum">STEP 6</span>Return to <span>breaker panel</span> and switch it <span>ON</span>');
      const ins = this._$s('instruction'); if (ins) ins.style.display = 'block';
      const wp  = this._$s('wire-panel');  if (wp)  wp.style.display = 'none';
      this._setTut(this._bkHandle, 'TAP BREAKER');
      this._gameState = 'breaker_on';
      this._animateCam(new THREE.Vector3(-1, 0.5, 7.5), new THREE.Vector3(0, 0.2, 0), 1000, () => {});
    }, 900);
  }

  _afterBreakerOn() {
    this._completeTask(6, 75);
    this._showToast('Power ON ✓ — Flip the switch!', 'ok');
    this._setInstr('<span class="sw-snum">STEP 7</span>Press the <span>FLIP SWITCH</span> button');
    this._setTut(null);
    const fu  = this._$s('flip-ui');   if (fu)  fu.style.display = 'flex';
    const ins = this._$s('instruction'); if (ins) ins.style.display = 'block';
    this._gameState = 'flip';
    this._animateCam(new THREE.Vector3(1.2, 0.4, 5.8), new THREE.Vector3(0.5, 0.1, 0), 800, () => {});
  }

  doFlip() {
    if (this._gameState !== 'flip') return;
    this._switchFlipped = !this._switchFlipped;
    this._leverTarget = this._switchFlipped ? -0.38 : 0;
    this._leverTween = true; this._leverT = 0;
    setTimeout(() => {
      this._lightOn = this._switchFlipped;
      this._setLightState(this._lightOn);
      this._completeTask(7, 88);
      setTimeout(() => {
        const fu = this._$s('flip-ui'); if (fu) fu.style.display = 'none';
        this._gameState = 'test';
        this._setInstr('<span class="sw-snum">STEP 8</span>Select <span>Multimeter</span> and tap the <span>bulb</span> to verify');
        this._enableTool('multimeter'); this._selectTool('multimeter');
        this._setTut(this._bulbGlass, 'TEST BULB');
        this._animateCam(new THREE.Vector3(1.8, 1.8, 5.5), new THREE.Vector3(1.5, 1.5, 0), 900, () => {});
      }, 1500);
    }, 300);
  }

  _doTest() {
    this._gameState = 'animating'; this._setTut(null);
    this._showCamHint('Testing circuit');
    const ro = this._$s('reading'), rv = this._$s('rd-val');
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
          this._completeTask(8, 100);
          this._gameState = 'done'; this._timerRunning = false;
          if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
          this._showToast('220V AC — Circuit complete!', 'ok');
          this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 1200, () => {
            setTimeout(() => {
              const score = 550 + this._timerVal * 2;
              const ss = this._$s('so-score'); if (ss) ss.textContent = `Score: ${score} pts`;
              const sov = this._$s('success-overlay'); if (sov) sov.classList.add('show');
              if (this._onFixed) this._onFixed(this._switchId, 1);
            }, 800);
          });
        }, 600);
      }
    }, 200);
  }

  _setLightState(on) {
    this._bulbLight.intensity = on ? 2.2 : 0;
    this._bulbGlassMat.emissive.setHex(on ? 0xffe080 : 0x0);
    this._bulbGlassMat.emissiveIntensity = on ? 1.4 : 0;
    this._bulbGlassMat.opacity = on ? 0.85 : 0.35;
    this._filMat.emissiveIntensity = on ? 2.5 : 0;
    const lg = this._$s('light-glow'); if (lg) lg.className = on ? 'on' : '';
  }

  // ── CAMERA TWEEN ─────────────────────────────────────────────────────────────

  _animateCam(toPos, toLook, dur, cb) {
    this._camFrom.copy(this._camera.position);
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this._camera.quaternion);
    this._camLookFrom.copy(this._camera.position).addScaledVector(dir, 5);
    this._camTo.copy(toPos); this._camLookTo.copy(toLook);
    this._camT = 0; this._camDur = dur; this._camCB = cb; this._camTweening = true;
  }
  _eio3(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  // ── TUTORIAL RING ────────────────────────────────────────────────────────────

  _setTut(obj3D, label = 'TAP HERE') {
    this._tutTarget = obj3D;
    const tl = this._$s('tgt-label'); if (tl) tl.textContent = label;
  }

  _updateTutorial() {
    const canvas = this._root.querySelector('#sw-canvas');
    const ring  = this._$s('tgt-ring');
    const pulse = this._$s('tgt-pulse');
    const label = this._$s('tgt-label');
    if (!canvas || !ring || !pulse || !label) return;
    const showable = this._tutTarget && !['animating','wires','flip','done'].includes(this._gameState);
    if (!showable) {
      [ring, pulse, label].forEach(el => el.style.display = 'none'); return;
    }
    const wp = new THREE.Vector3();
    this._tutTarget.getWorldPosition(wp);
    const v = wp.clone().project(this._camera);
    if (v.z > 1) { [ring, pulse, label].forEach(el => el.style.display = 'none'); return; }
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const sx = (v.x + 1) / 2 * cw, sy = (-v.y + 1) / 2 * ch;
    [ring, pulse].forEach(el => { el.style.display = 'block'; el.style.left = sx + 'px'; el.style.top = sy + 'px'; });
    label.style.display = 'block'; label.style.left = sx + 'px'; label.style.top = (sy + 48) + 'px';
  }

  // ── HUD HELPERS ──────────────────────────────────────────────────────────────

  _completeTask(n, pct) {
    this._completedTasks++;
    const el = this._$s('s' + n); if (el) { el.classList.remove('active'); el.classList.add('done'); }
    const nx = this._$s('s' + (n + 1)); if (nx) nx.classList.add('active');
    const dc = this._$s('done-count'); if (dc) dc.textContent = this._completedTasks;
    this._setPct(pct);
  }
  _setPct(p) {
    const bar = this._$s('pw-bar'); if (bar) bar.style.width = p + '%';
    const pct = this._$s('pw-pct'); if (pct) pct.textContent = p;
  }
  _selectTool(t) {
    this._activeTool = t;
    ['mount', 'pliers', 'multimeter'].forEach(id => {
      const s = this._$s('tool-' + id); if (s) s.classList.remove('active');
    });
    const s = this._$s('tool-' + t); if (s) s.classList.add('active');
  }
  _enableTool(t) {
    const s = this._$s('tool-' + t); if (s) s.classList.remove('disabled');
  }
  _setInstr(html) {
    const el = this._$s('instruction');
    if (!el) return; el.style.display = 'block'; el.innerHTML = html;
  }
  _showToast(msg, type) {
    const t = this._$s('toast'); if (!t) return;
    t.textContent = msg; t.className = 'show ' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
  _showCamHint(msg) {
    const h = this._$s('cam-hint'); if (!h) return;
    h.textContent = '📷 ' + msg; h.classList.add('show');
    clearTimeout(this._camHintTimer);
    this._camHintTimer = setTimeout(() => h.classList.remove('show'), 2000);
  }

  // ── RESET ────────────────────────────────────────────────────────────────────

  _resetAll() {
    if (this._touchClone) { this._touchClone.remove(); this._touchClone = null; }
    this._touchWire = null;
    this._gameState = 'breaker_off'; this._activeTool = null;
    this._wireConn = { red: false, black: false };
    this._completedTasks = 0; this._timerVal = 480; this._timerRunning = true;
    this._switchFlipped = false; this._lightOn = false; this._swWiresBuilt = false;
    this._bkAnimating = false; this._mountAnim = false; this._leverTween = false;
    this._camTweening = false; this._idleT = 0;

    // 3D reset
    this._bkHandle.position.y = this._HANDLE_ON_Y;
    this._bkHandleMat.color.setHex(0x22c55e);
    this._bkLEDMat.color.setHex(0x22c55e);
    this._bkLEDMat.emissive.setHex(0x22c55e);
    this._bkLEDMat.emissiveIntensity = 1.0;
    this._swRoot.position.set(0, -0.2, 2.0);
    this._swRoot.rotation.set(0, 0, 0);
    this._swLever.rotation.x = 0; this._swLever.position.y = -0.05;
    this._setLightState(false);
    this._wallWires.forEach(w => w.visible = false);
    // Remove switch wires from scene
    ['red', 'black'].forEach(c => {
      if (this._swWires[c]) { this._scene.remove(this._swWires[c]); delete this._swWires[c]; }
    });
    if (this._bulbWire) { this._scene.remove(this._bulbWire); this._bulbWire = null; }
    this._camera.position.set(0, 0.5, 8); this._camera.lookAt(0, 0, 0);

    // HUD reset
    this._setPct(0);
    const dc = this._$s('done-count'); if (dc) dc.textContent = '0';
    for (let i = 1; i <= 8; i++) {
      const el = this._$s('s' + i); if (!el) continue;
      el.classList.remove('done', 'active');
      if (i === 1) el.classList.add('active');
    }
    const wp  = this._$s('wire-panel');    if (wp)  wp.style.display = 'none';
    const fu  = this._$s('flip-ui');      if (fu)  fu.style.display = 'none';
    const sov = this._$s('success-overlay'); if (sov) sov.classList.remove('show');
    const ro  = this._$s('reading');      if (ro)  ro.classList.remove('show');
    const rv  = this._$s('rd-val');       if (rv)  rv.textContent = '---';
    this._setInstr('<span class="sw-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>');

    ['red', 'black'].forEach(c => {
      const wd = this._root.querySelector(`#sw-wd-${c}`); if (wd) wd.classList.remove('sw-used');
      const wt = this._root.querySelector(`#sw-wt-${c}`);
      if (wt) {
        const lbl = { red: 'COM', black: 'L1' };
        const col = { red: '#dc2626', black: '#888' };
        wt.style.background = ''; wt.style.color = col[c];
        wt.style.borderStyle = 'dashed'; wt.textContent = lbl[c];
      }
    });
    ['mount', 'pliers', 'multimeter'].forEach(t => {
      const s = this._$s('tool-' + t); if (!s) return;
      s.classList.add('disabled'); s.classList.remove('active');
    });
    ['mount', 'pliers', 'multimeter'].forEach(t => {
      const s = this._$s('tool-' + t); if (!s) return;
      s.onclick = () => { if (this._open) this._selectTool(t); };
    });

    const flipBtn = this._$s('flip-btn');
    if (flipBtn) flipBtn.onclick = () => this.doFlip();
    const replayBtn = this._$s('replay-btn');
    if (replayBtn) replayBtn.onclick = () => this._resetAll();

    this._setTut(this._bkHandle, 'TAP HERE');
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    const timerEl = this._$s('timer'); if (timerEl) timerEl.textContent = '08:00';
    this._timerInterval = setInterval(() => {
      if (!this._timerRunning || !this._open) return;
      this._timerVal = Math.max(0, this._timerVal - 1);
      const m = Math.floor(this._timerVal / 60).toString().padStart(2, '0');
      const s = (this._timerVal % 60).toString().padStart(2, '0');
      const tel = this._$s('timer'); if (tel) tel.textContent = `${m}:${s}`;
    }, 1000);
  }

  // ── MAIN LOOP ────────────────────────────────────────────────────────────────

  _loop() {
    if (!this._open) return;
    this._raf = requestAnimationFrame(() => this._loop());
    const dt = Math.min(this._clock.getDelta(), 0.05);
    this._idleT += dt;

    // Idle sway
    this._wbRoot.position.y = -0.2 + Math.sin(this._idleT * 0.5) * 0.012;
    this._wbRoot.rotation.z = Math.sin(this._idleT * 0.32) * 0.005;
    if (this._swRoot.position.z > 0.5) {
      this._swRoot.position.y = Math.sin(this._idleT * 0.65) * 0.06 + 0.2;
      this._swRoot.rotation.z = Math.sin(this._idleT * 0.45) * 0.04;
    }

    // Bulb pulse when on
    if (this._lightOn) {
      const pulse = 0.9 + 0.1 * Math.sin(this._idleT * 4.5);
      this._bulbLight.intensity = 2.2 * pulse;
      this._filMat.emissiveIntensity = 2.5 * pulse;
    }

    // Camera tween
    if (this._camTweening) {
      this._camT += dt * 1000;
      const p = this._eio3(Math.min(this._camT / this._camDur, 1));
      this._camera.position.lerpVectors(this._camFrom, this._camTo, p);
      this._camera.lookAt(new THREE.Vector3().lerpVectors(this._camLookFrom, this._camLookTo, p));
      if (this._camT >= this._camDur) {
        this._camTweening = false;
        if (this._camCB) { const cb = this._camCB; this._camCB = null; cb(); }
      }
    }

    // Breaker animation
    if (this._bkAnimating) {
      this._bkAnimT += dt * 3;
      const p = this._eio3(Math.min(this._bkAnimT, 1));
      const fromY = this._bkGoingOff ? this._HANDLE_ON_Y : this._HANDLE_OFF_Y;
      const toY   = this._bkGoingOff ? this._HANDLE_OFF_Y : this._HANDLE_ON_Y;
      this._bkHandle.position.y = fromY + (toY - fromY) * p;
      if (this._bkAnimT >= 1) {
        this._bkAnimating = false; this._bkHandle.position.y = toY;
        if (this._bkGoingOff) {
          this._bkHandleMat.color.setHex(0xef4444);
          this._bkLEDMat.color.setHex(0xef4444);
          this._bkLEDMat.emissive.setHex(0x881111);
          this._bkLEDMat.emissiveIntensity = 0.5;
        } else {
          this._bkHandleMat.color.setHex(0x22c55e);
          this._bkLEDMat.color.setHex(0x22c55e);
          this._bkLEDMat.emissive.setHex(0x22c55e);
          this._bkLEDMat.emissiveIntensity = 1.0;
        }
        if (this._bkCB) { const cb = this._bkCB; this._bkCB = null; cb(); }
      }
    }

    // Mount animation
    if (this._mountAnim) {
      this._mountT += dt * 1.2;
      const p = this._eio3(Math.min(this._mountT, 1));
      this._swRoot.position.lerpVectors(this._mountFrom, this._mountTo, p);
      this._swRoot.rotation.z = (1 - p) * 0.18;
      if (this._mountT >= 1) {
        this._mountAnim = false;
        this._swRoot.position.copy(this._mountTo);
        this._swRoot.rotation.z = 0;
        if (this._mountCB) { const cb = this._mountCB; this._mountCB = null; cb(); }
      }
    }

    // Lever tween
    if (this._leverTween) {
      this._leverT += dt * 4;
      const p = this._eio3(Math.min(this._leverT, 1));
      this._swLever.rotation.x = this._leverTarget * p;
      this._swLever.position.y = -0.05 + this._leverTarget * 0.15 * p;
      if (this._leverT >= 1) {
        this._leverTween = false;
        this._swLever.rotation.x = this._leverTarget;
        this._swLever.position.y = -0.05 + this._leverTarget * 0.15;
      }
    }

    this._updateTutorial();
    this._renderer.render(this._scene, this._camera);
  }
}

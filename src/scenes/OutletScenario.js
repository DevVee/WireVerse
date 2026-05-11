/**
 * OutletScenario.js
 * Full inline outlet-repair mini-game for WireVerse V2 Explore mode.
 * Adapted from Electric Copy's outlet-scenario.js + scenarios/outlet-repair.html.
 *
 * Usage:
 *   const s = new OutletScenario(rootEl, onFixedCallback);
 *   s.open(socketId);   // show overlay and run scenario
 *   s.close();          // hide overlay
 *   s.destroy();        // cleanup
 */
import * as THREE from 'three';

export class OutletScenario {
  constructor(root, onFixed) {
    this._root    = root;      // the .ex-wrap div
    this._onFixed = onFixed;   // callback(socketId, stars)
    this._open    = false;
    this._socketId = 1;

    // 3D objects built once, reused each repair
    this._outletRoot = null;
    this._faceGroup  = null;
    this._facePlate  = null;
    this._screwGroup = null;
    this._screwHead  = null;
    this._washer     = null;
    this._internalGroup = null;
    this._terminalMeshes = [];
    this._wireMeshes     = [];
    this._looseWirePts   = [];
    this._bkHandle = null; this._bkHandleMat = null; this._bkLEDMat = null;
    this._jBox = null;
    this._BX = 0; this._BY = 0; this._BZ = 0;
    this._HANDLE_ON_Y = 0; this._HANDLE_OFF_Y = 0;
    this._damageLight = null;

    // Raycaster
    this._raycaster = null; this._mouse = null;
    this._clickScrewObjs = []; this._clickBreakerObjs = [];

    // Game state
    this._gameState = 'breaker_off';
    this._selectedTool = null;
    this._wiresState = {};
    this._completedTasks = 0;
    this._timerVal = 300;
    this._timerRunning = false;
    this._timerInterval = null;

    // Touch wire drag
    this._touchWire  = null;
    this._touchClone = null;

    // Anim state
    this._screwRemoving = false;  this._screwSpinT = 0;
    this._screwReattaching = false; this._screwReattachT = 0;
    this._coverOpening = false;   this._coverOpenT = 0;
    this._coverClosing = false;   this._coverCloseT = 0;
    this._bkAnimating = false;    this._bkAnimT = 0;
    this._bkGoingOff = false;     this._bkCB = null;
    this._inspecting = false;     this._inspectT = 0;
    this._camTweening = false;    this._camT = 0; this._camDur = 0; this._camCB = null;
    this._camFrom = new THREE.Vector3(); this._camTo = new THREE.Vector3();
    this._camLookFrom = new THREE.Vector3(); this._camLookTo = new THREE.Vector3();
    this._idleT = 0;
    this._damageLightT = 0;

    // Tutorial
    this._tutTarget3D = null;
    this._toastTimer = null;
    this._camHintTimer = null;

    // Renderer
    this._renderer = null; this._scene = null; this._camera = null; this._clock = null;
    this._raf = null;

    // DOM-bound listeners for cleanup
    this._docListeners = [];

    this._initThree();
    this._initDragDrop();
    this._initCanvasEvents();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────

  open(socketId) {
    this._socketId = socketId;

    const overlay = this._root.querySelector('#or-overlay');
    if (overlay) overlay.style.display = 'block';

    const canvas = this._root.querySelector('#or-canvas');
    if (canvas && this._renderer) {
      requestAnimationFrame(() => {
        const w = canvas.clientWidth  || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        this._renderer.setSize(w, h);
        this._camera.aspect = w / h;
        if (w < h) {
          this._camera.fov = Math.min(70, 42 * (h / w) * 0.75);
        } else {
          this._camera.fov = 42;
        }
        this._camera.updateProjectionMatrix();
      });
    }

    const LABELS = { 1: 'Lobby', 2: 'Wiring Lab', 3: 'Corridor', 4: 'Control Room', 5: 'Tool Room' };
    const lbl = this._$o('socket-label');
    if (lbl) lbl.textContent = `Socket #${socketId} — ${LABELS[socketId] || 'Room'}`;

    this._resetAll();

    if (!this._open) {
      this._open = true;
      this._loop();
    }
  }

  close() {
    this._open = false;
    const overlay = this._root.querySelector('#or-overlay');
    if (overlay) overlay.style.display = 'none';
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    if (this._touchClone) { this._touchClone.remove(); this._touchClone = null; }
    this._touchWire = null;
  }

  destroy() {
    this.close();
    cancelAnimationFrame(this._raf);
    this._raf = null;
    for (const [target, type, fn] of this._docListeners) {
      target.removeEventListener(type, fn);
    }
    this._docListeners = [];
    if (this._scene) {
      this._scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    if (this._renderer) { this._renderer.dispose(); this._renderer = null; }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────────

  _$o(id) { return this._root.querySelector('#or-' + id); }

  _initThree() {
    const canvas = this._root.querySelector('#or-canvas');
    if (!canvas) { console.error('[OutletScenario] #or-canvas not found'); return; }

    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    this._renderer.setPixelRatio(1.0);
    this._renderer.shadowMap.enabled = false;
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x151210);
    this._scene.fog = new THREE.Fog(0x151210, 12, 24);

    this._camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    this._camera.position.set(1.2, 0.8, 6.5);
    this._camera.lookAt(0, 0, 0);

    this._clock = new THREE.Clock();

    // Lighting
    this._scene.add(new THREE.AmbientLight(0xffffff, 0.32));
    const spot = new THREE.SpotLight(0xfff4e0, 3.0, 22, Math.PI * 0.16, 0.25);
    spot.position.set(1, 7, 6); spot.castShadow = false;
    this._scene.add(spot); this._scene.add(spot.target);
    const rim = new THREE.DirectionalLight(0x4488ff, 0.30);
    rim.position.set(-4, 2, -3); this._scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.40);
    fill.position.set(-6, 3, 5); this._scene.add(fill);
    const under = new THREE.PointLight(0xff8833, 0.35, 8);
    under.position.set(0, -3, 3); this._scene.add(under);

    // Pulsing damage light
    this._damageLight = new THREE.PointLight(0xff4400, 0, 2.5);
    this._damageLight.position.set(0, -0.35, 0.25);
    this._scene.add(this._damageLight);

    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    this._buildScene();

    const _resizeFn = () => {
      if (!this._open || !this._renderer) return;
      const c = this._root.querySelector('#or-canvas');
      if (!c) return;
      const w = c.clientWidth || window.innerWidth;
      const h = c.clientHeight || window.innerHeight;
      this._renderer.setSize(w, h);
      this._camera.aspect = w / h;
      if (w < h) { this._camera.fov = Math.min(70, 42 * (h / w) * 0.75); }
      else        { this._camera.fov = 42; }
      this._camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', _resizeFn);
    this._docListeners.push([window, 'resize', _resizeFn]);
  }

  _mkBox(w, h, d, color, rough = 0.7, metal = 0.1) {
    return new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
    );
  }
  _mkCyl(rt, rb, h, segs, color, rough = 0.5, metal = 0.3) {
    return new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, h, segs),
      new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
    );
  }
  _makeWireTube(color, pts, radius = 0.038) {
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, radius, 8, false),
      new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 })
    );
  }

  _makeDamagedWireGroup(insColor, pts) {
    const group = new THREE.Group();
    const mainCurve = new THREE.CatmullRomCurve3(pts);

    // 1. Main insulated body
    const mainTube = new THREE.Mesh(
      new THREE.TubeGeometry(mainCurve, 40, 0.042, 8, false),
      new THREE.MeshStandardMaterial({ color: insColor, roughness: 0.62, metalness: 0.04 })
    );
    group.add(mainTube);

    // 2. Char/burn section (30–58% of path)
    const charPts = [];
    for (let t = 0.30; t <= 0.58; t += 0.04) charPts.push(mainCurve.getPoint(t));
    if (charPts.length >= 2) {
      const charCurve = new THREE.CatmullRomCurve3(charPts);
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(charCurve, 16, 0.055, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x1a0800, roughness: 0.98, metalness: 0.0 })
      ));
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(charCurve, 16, 0.048, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x5a1500, roughness: 0.92, metalness: 0.0,
          emissive: new THREE.Color(0x2a0800), emissiveIntensity: 0.4 })
      ));
      for (let b = 0; b < 5; b++) {
        const bPos = mainCurve.getPoint(0.33 + b * 0.05);
        bPos.add(new THREE.Vector3((Math.random()-.5)*.06,(Math.random()-.5)*.06,(Math.random()-.5)*.04));
        const blob = new THREE.Mesh(
          new THREE.SphereGeometry(0.025 + Math.random() * 0.025, 6, 5),
          new THREE.MeshStandardMaterial({ color: 0x0d0500, roughness: 1.0, metalness: 0.0 })
        );
        blob.position.copy(bPos); group.add(blob);
      }
    }

    // 3. Stripped copper section (80–100%)
    const copperPts = [];
    for (let t = 0.80; t <= 1.0; t += 0.04) copperPts.push(mainCurve.getPoint(t));
    if (copperPts.length >= 2) {
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(copperPts), 12, 0.030, 8, false),
        new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.22, metalness: 0.88,
          emissive: new THREE.Color(0x331100), emissiveIntensity: 0.18 })
      ));
    }

    // 4. Frayed copper strands at tip
    const tipPos = mainCurve.getPoint(1.0);
    const tipTangent = mainCurve.getTangent(1.0).normalize();
    const strandMat = new THREE.MeshStandardMaterial({ color: 0xd4955a, roughness: 0.18, metalness: 0.92,
      emissive: new THREE.Color(0x220800), emissiveIntensity: 0.1 });
    for (let s = 0; s < 7; s++) {
      const angle  = (s / 7) * Math.PI * 2;
      const spread = 0.05 + Math.random() * 0.03;
      const length = 0.09 + Math.random() * 0.06;
      let perp1 = new THREE.Vector3(1, 0, 0);
      if (Math.abs(tipTangent.dot(perp1)) > 0.9) perp1.set(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tipTangent, perp1).normalize();
      const up2   = new THREE.Vector3().crossVectors(right, tipTangent).normalize();
      const dir   = new THREE.Vector3()
        .addScaledVector(right, Math.cos(angle) * spread)
        .addScaledVector(up2,   Math.sin(angle) * spread)
        .addScaledVector(tipTangent, 0.04).normalize();
      const strandEnd = new THREE.Vector3().copy(tipPos).addScaledVector(dir, length);
      const midPt = new THREE.Vector3().lerpVectors(tipPos, strandEnd, 0.5);
      midPt.addScaledVector(dir.clone().cross(tipTangent).normalize(), (Math.random()-.5)*0.02);
      const strand = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3([tipPos.clone(), midPt, strandEnd]), 6,
          0.006 + Math.random() * 0.004, 5, false),
        strandMat
      );
      group.add(strand);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.009, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xc8803a, roughness: 0.15, metalness: 0.95 }));
      ball.position.copy(strandEnd); group.add(ball);
    }

    // 5. Torn insulation collar at strip point
    const tearPos     = mainCurve.getPoint(0.79);
    const tearTangent = mainCurve.getTangent(0.79).normalize();
    for (let j = 0; j < 8; j++) {
      const a = (j / 8) * Math.PI * 2;
      const r = 0.044 + (Math.random()-.5) * 0.012;
      let perp = new THREE.Vector3(0, 1, 0);
      if (Math.abs(tearTangent.dot(perp)) > 0.9) perp.set(1, 0, 0);
      const right = new THREE.Vector3().crossVectors(tearTangent, perp).normalize();
      const up2   = new THREE.Vector3().crossVectors(right, tearTangent).normalize();
      const flap  = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.008, 0.02 + Math.random() * 0.015),
        new THREE.MeshStandardMaterial({ color: insColor, roughness: 0.8 })
      );
      flap.position.copy(tearPos)
        .addScaledVector(right, Math.cos(a) * r)
        .addScaledVector(up2,   Math.sin(a) * r);
      flap.lookAt(flap.position.clone().add(tearTangent));
      flap.rotation.z += a;
      group.add(flap);
    }

    return group;
  }

  _buildScene() {
    // Wall background
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 9),
      new THREE.MeshLambertMaterial({ color: 0x252220 })
    );
    wall.position.z = -1.2; wall.receiveShadow = true;
    this._scene.add(wall);
    for (let i = -4; i <= 4; i++) {
      const ln = this._mkBox(12, 0.007, 0.01, 0x312e2a, 1, 0);
      ln.position.set(0, i * 0.9, -1.18); this._scene.add(ln);
    }

    // ── Outlet assembly ──
    this._outletRoot = new THREE.Group();
    this._scene.add(this._outletRoot);
    const boxDepth = 0.7;

    const jb = this._mkBox(2.4, 2.4, boxDepth, 0x5a4020, 0.92, 0.04);
    jb.position.z = -1.2 + boxDepth / 2 - 0.05;
    this._outletRoot.add(jb); this._jBox = jb;

    const interior = this._mkBox(2.1, 2.1, 0.05, 0x1a1008, 0.96, 0);
    interior.position.z = -1.2 + boxDepth - 0.03;
    this._outletRoot.add(interior);

    const flange = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 2.6, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.40, metalness: 0.60 })
    );
    flange.position.z = -1.2 + boxDepth;
    this._outletRoot.add(flange);

    [-0.7, 0.7].forEach(x => {
      const ko = this._mkBox(0.22, 0.14, 0.08, 0x666666, 0.5, 0.5);
      ko.position.set(x, 0.95, -1.2 + boxDepth + 0.02);
      this._outletRoot.add(ko);
    });

    // Face plate group
    this._faceGroup = new THREE.Group();
    this._faceGroup.position.set(0, -0.9, 0);
    this._outletRoot.add(this._faceGroup);

    this._facePlate = this._mkBox(2.0, 1.85, 0.14, 0xd5d0c6, 0.65, 0.04);
    this._facePlate.position.set(0, 0.925, 0);
    this._facePlate.castShadow = true; this._facePlate.receiveShadow = true;
    this._faceGroup.add(this._facePlate);

    [-0.65, 0.65].forEach(x => [-0.70, 0.70].forEach(y => {
      const sh = this._mkCyl(0.055, 0.055, 0.16, 12, 0xaaaaaa, 0.30, 0.50);
      sh.rotation.x = Math.PI / 2; sh.position.set(x, y + 0.925, 0.07);
      this._faceGroup.add(sh);
    }));

    // Philippine Type A outlet — two flat parallel vertical slots, no earth pin
    // Left slot (x=-0.22) = Neutral/BLACK wider; Right slot (x=+0.22) = Live/RED narrower
    const slotMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.95 });
    const rimColors = [0x1a1a22, 0x2a0808]; // left=dark(neutral), right=dark-red(live)
    [-0.22, 0.22].forEach((x, i) => {
      const slotBg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.50, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 }));
      slotBg.position.set(x, 0.925, 0.04); this._faceGroup.add(slotBg);
      const w = i === 0 ? 0.072 : 0.060;
      const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.42, 0.10), slotMat);
      s.position.set(x, 0.925, 0.07); this._faceGroup.add(s);
      const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.016, 0.44, 0.02),
        new THREE.MeshStandardMaterial({ color: rimColors[i], roughness: 0.6, metalness: 0.3 }));
      rim.position.set(x, 0.925, 0.065); this._faceGroup.add(rim);
      // Polarity indicator dot above each slot (black=N, red=L)
      const dotColor = i === 0 ? 0x333333 : 0x5a1010;
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.014, 10),
        new THREE.MeshStandardMaterial({ color: dotColor, roughness: 0.9 }));
      dot.rotation.x = -Math.PI / 2; dot.position.set(x, 0.56, 0.075);
      this._faceGroup.add(dot);
    });

    // Center cover screw
    this._screwGroup = new THREE.Group();
    this._screwGroup.position.set(0, 0.925, 0);
    this._faceGroup.add(this._screwGroup);

    this._screwHead = this._mkCyl(0.115, 0.095, 0.07, 24, 0xb0b0b0, 0.2, 0.7);
    this._screwHead.rotation.x = Math.PI / 2; this._screwHead.position.z = 0.11;
    this._screwGroup.add(this._screwHead);

    this._washer = this._mkCyl(0.13, 0.13, 0.015, 24, 0x888888, 0.4, 0.5);
    this._washer.rotation.x = Math.PI / 2; this._washer.position.z = 0.075;
    this._screwGroup.add(this._washer);

    for (let i = 0; i < 2; i++) {
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.025, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 }));
      sl.rotation.z = i * Math.PI / 2; sl.position.z = 0.15;
      this._screwGroup.add(sl);
    }
    const screwShaft = this._mkCyl(0.045, 0.050, 0.5, 12, 0x999999, 0.3, 0.6);
    screwShaft.rotation.x = Math.PI / 2; screwShaft.position.z = -0.18;
    this._screwGroup.add(screwShaft);

    // Internal terminal block
    this._internalGroup = new THREE.Group();
    this._internalGroup.visible = false;
    this._outletRoot.add(this._internalGroup);

    const mBar = this._mkBox(2.0, 0.22, 0.12, 0x555555, 0.7, 0.3);
    mBar.position.set(0, 0, -0.52); this._internalGroup.add(mBar);
    const termBody = this._mkBox(1.7, 0.55, 0.18, 0x3a3a3a, 0.85, 0.1);
    termBody.position.set(0, 0, -0.45); this._internalGroup.add(termBody);

    // PH Type A: BLACK=Neutral(left), RED=Live(right)
    this._terminalMeshes = [];
    [{ x: -0.3, color: 0x1a1a1a }, { x: 0.3, color: 0xdc2626 }]
      .forEach(({ x, color }) => {
        const tb = this._mkBox(0.28, 0.42, 0.22, color, 0.6, 0.2);
        tb.position.set(x, 0, -0.38); this._internalGroup.add(tb);
        const ts = this._mkCyl(0.08, 0.08, 0.06, 16, 0xaaaaaa, 0.2, 0.7);
        ts.rotation.x = Math.PI / 2; ts.position.set(x, 0, -0.27);
        this._internalGroup.add(ts);
        const tslot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.03),
          new THREE.MeshStandardMaterial({ color: 0x222222 }));
        tslot.position.set(x, 0, -0.24); this._internalGroup.add(tslot);
        const wHole = this._mkBox(0.08, 0.28, 0.1, 0x111111, 1, 0);
        wHole.position.set(x, -0.06, -0.27); this._internalGroup.add(wHole);
        const glow = this._mkBox(0.26, 0.04, 0.02, 0x222222, 1, 0);
        glow.position.set(x, 0.22, -0.37);
        glow.userData.isGlow = true; this._internalGroup.add(glow);
        this._terminalMeshes.push({ x, color, glowMesh: glow });
      });

    [-0.35, 0.35].forEach(x => {
      const clip = this._mkBox(0.18, 0.08, 0.12, 0x666666, 0.7, 0.2);
      clip.position.set(x, -0.35, -0.46); this._internalGroup.add(clip);
    });

    // Loose wire paths (2 wires: black neutral left, red live right)
    this._looseWirePts = [
      [new THREE.Vector3(-0.3,0,-0.42),new THREE.Vector3(-0.45,-0.3,-0.1),new THREE.Vector3(-0.60,-0.85,0.2),new THREE.Vector3(-0.45,-1.35,0.05)],
      [new THREE.Vector3(0.3, 0,-0.42),new THREE.Vector3(0.48,-0.28,-0.1),new THREE.Vector3(0.60,-0.88,0.2),new THREE.Vector3(0.48,-1.30,0.04)],
    ];

    const wireColors3D = [0x111111, 0xdc2626]; // black, red
    this._wireMeshes = [];
    wireColors3D.forEach((c, i) => {
      const wg = this._makeDamagedWireGroup(c, this._looseWirePts[i]);
      wg.visible = false; this._outletRoot.add(wg); this._wireMeshes.push(wg);
    });

    // Breaker box
    this._BX = -3.05; this._BY = 0.28; this._BZ = -1.06;
    const BX = this._BX, BY = this._BY, BZ = this._BZ;

    const bkHousing = this._mkBox(1.02, 1.65, 0.22, 0x424242, 0.72, 0.38);
    bkHousing.position.set(BX, BY, BZ + 0.11); this._scene.add(bkHousing);
    const bkFace = this._mkBox(0.84, 1.44, 0.04, 0x2c2c2c, 0.88, 0.05);
    bkFace.position.set(BX, BY, BZ + 0.235); this._scene.add(bkFace);
    const bkStripe = this._mkBox(0.84, 0.055, 0.05, 0xF5C518, 0.65, 0.1);
    bkStripe.position.set(BX, BY + 0.72, BZ + 0.24); this._scene.add(bkStripe);
    const bkLbl = this._mkBox(0.56, 0.05, 0.03, 0xcccccc, 0.8, 0);
    bkLbl.position.set(BX, BY + 0.58, BZ + 0.255); this._scene.add(bkLbl);
    const bkSlot = this._mkBox(0.34, 0.64, 0.03, 0x181818, 0.9, 0);
    bkSlot.position.set(BX, BY, BZ + 0.256); this._scene.add(bkSlot);

    this._bkHandleMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.42, metalness: 0.28 });
    this._bkHandle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.30, 0.16), this._bkHandleMat);
    this._HANDLE_ON_Y  = BY + 0.16;
    this._HANDLE_OFF_Y = BY - 0.16;
    this._bkHandle.position.set(BX, this._HANDLE_ON_Y, BZ + 0.31);
    this._scene.add(this._bkHandle);

    this._bkLEDMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, roughness: 0.28, metalness: 0.5,
      emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1.0,
    });
    const bkLED = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.055, 12), this._bkLEDMat);
    bkLED.rotation.x = Math.PI / 2;
    bkLED.position.set(BX + 0.27, BY + 0.54, BZ + 0.245);
    this._scene.add(bkLED);

    const bkConduit = this._mkCyl(0.1, 0.1, 0.55, 10, 0x555555, 0.8, 0.3);
    bkConduit.position.set(BX, BY - 1.08, BZ + 0.11);
    this._scene.add(bkConduit);

    // BREAKER label canvas texture
    const bkCanvas = document.createElement('canvas');
    bkCanvas.width = 128; bkCanvas.height = 32;
    const bkCtx = bkCanvas.getContext('2d');
    bkCtx.clearRect(0, 0, 128, 32);
    bkCtx.font = 'bold 13px sans-serif'; bkCtx.fillStyle = '#F5C518';
    bkCtx.textAlign = 'center'; bkCtx.fillText('BREAKER', 64, 22);
    const bkTex = new THREE.CanvasTexture(bkCanvas);
    const bkLblMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.14),
      new THREE.MeshBasicMaterial({ map: bkTex, transparent: true, depthWrite: false }));
    bkLblMesh.position.set(BX, BY + 0.72, BZ + 0.27);
    this._scene.add(bkLblMesh);

    this._clickScrewObjs   = [this._screwHead, this._washer];
    this._clickBreakerObjs = [this._bkHandle];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DRAG-DROP (wire panel)
  // ─────────────────────────────────────────────────────────────────────────────

  _initDragDrop() {
    ['red', 'black'].forEach(color => {
      const draggable = this._root.querySelector(`#or-wd-${color}`);
      const terminal  = this._root.querySelector(`#or-wt-${color}`);
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
            terminal.classList.add('reject');
            setTimeout(() => terminal.classList.remove('reject'), 400);
            this._showToast('Wrong terminal! Match the wire color.', 'err');
          }
        });
      }

      // Mobile touch drag
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
            width: r.width + 'px',
            left: (t.clientX - r.width / 2) + 'px',
            top:  (t.clientY - r.height / 2) + 'px',
            margin: '0',
          });
          document.body.appendChild(this._touchClone);
          draggable.style.opacity = '0.4';
        }, { passive: false });
      }
    });

    const _touchMoveFn = e => {
      if (!this._touchClone) return;
      const t = e.changedTouches[0];
      this._touchClone.style.left = (t.clientX - parseFloat(this._touchClone.style.width) / 2) + 'px';
      this._touchClone.style.top  = (t.clientY - 16) + 'px';
    };
    const _touchEndFn = e => {
      if (!this._touchClone || !this._touchWire) return;
      const t = e.changedTouches[0];
      const dragEl = this._root.querySelector(`#or-wd-${this._touchWire}`);
      if (dragEl) dragEl.style.opacity = '';
      this._touchClone.remove(); this._touchClone = null;
      if (!this._open || this._gameState !== 'wires') { this._touchWire = null; return; }
      const under = document.elementFromPoint(t.clientX, t.clientY);
      const term  = under && (under.classList.contains('or-wire-term')
        ? under : under.closest?.('.or-wire-term'));
      if (term) {
        const termColor = term.id.replace('or-wt-', '');
        if (termColor === this._touchWire) { this._connectWire(this._touchWire); }
        else {
          term.classList.add('reject');
          setTimeout(() => term.classList.remove('reject'), 400);
          this._showToast('Wrong terminal! Match the wire color.', 'err');
        }
      }
      this._touchWire = null;
    };
    const _touchCancelFn = () => {
      if (!this._touchClone) return;
      const dragEl = this._touchWire ? this._root.querySelector(`#or-wd-${this._touchWire}`) : null;
      if (dragEl) dragEl.style.opacity = '';
      this._touchClone.remove(); this._touchClone = null; this._touchWire = null;
    };
    document.addEventListener('touchmove',   _touchMoveFn,   { passive: true });
    document.addEventListener('touchend',     _touchEndFn,    { passive: true });
    document.addEventListener('touchcancel',  _touchCancelFn, { passive: true });
    this._docListeners.push(
      [document, 'touchmove',  _touchMoveFn],
      [document, 'touchend',   _touchEndFn],
      [document, 'touchcancel',_touchCancelFn],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CANVAS EVENTS (click / touch / hover)
  // ─────────────────────────────────────────────────────────────────────────────

  _initCanvasEvents() {
    const canvas = this._root.querySelector('#or-canvas');
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

    canvas.addEventListener('click', e => { if (!this._open) return; this._handleClick(e.clientX, e.clientY); });

    canvas.addEventListener('mousemove', e => {
      if (!this._open) return;
      this._mouse.x =  (e.clientX / canvas.clientWidth)  * 2 - 1;
      this._mouse.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
      this._raycaster.setFromCamera(this._mouse, this._camera);
      let cur = 'default';
      if ((this._gameState === 'breaker_off' || this._gameState === 'breaker_on') &&
          this._raycaster.intersectObjects(this._clickBreakerObjs, true).length) cur = 'pointer';
      else if (this._gameState === 'screw' && this._raycaster.intersectObjects(this._clickScrewObjs, true).length) cur = 'pointer';
      else if ((this._gameState === 'open' || this._gameState === 'test') && this._raycaster.intersectObject(this._facePlate, false).length) cur = 'pointer';
      else if (this._gameState === 'rescrew') cur = 'pointer';
      canvas.style.cursor = cur;
    });
  }

  _handleClick(cx, cy) {
    const canvas = this._root.querySelector('#or-canvas');
    if (!canvas) return;
    if (this._gameState === 'animating' || this._gameState === 'inspect' || this._gameState === 'done') return;
    this._mouse.x =  (cx / canvas.clientWidth)  * 2 - 1;
    this._mouse.y = -(cy / canvas.clientHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);

    if (this._gameState === 'breaker_off') {
      if (this._raycaster.intersectObjects(this._clickBreakerObjs, true).length) this._doBreaker(true);
      else this._showToast('Find the breaker panel on the left — tap it!', 'err');
    } else if (this._gameState === 'screw') {
      if (this._raycaster.intersectObjects(this._clickScrewObjs, true).length) {
        if (this._selectedTool !== 'screwdriver') { this._showToast('Select the Screwdriver first!', 'err'); return; }
        this._doRemoveScrew();
      } else this._showToast('Click the screw at the center of the outlet!', 'err');
    } else if (this._gameState === 'open') {
      if (this._raycaster.intersectObject(this._facePlate, false).length) this._doOpenCover();
      else this._showToast('Click the outlet cover to open it', 'err');
    } else if (this._gameState === 'rescrew') {
      this._doCloseCover();
    } else if (this._gameState === 'breaker_on') {
      if (this._raycaster.intersectObjects(this._clickBreakerObjs, true).length) this._doBreaker(false);
      else this._showToast('Tap the breaker panel to switch it back ON!', 'err');
    } else if (this._gameState === 'test') {
      if (this._selectedTool !== 'multimeter') { this._showToast('Select the Multimeter first!', 'err'); return; }
      if (this._raycaster.intersectObject(this._facePlate, false).length) this._doTest();
      else this._showToast('Point the multimeter at the outlet', 'err');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GAME ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  _doBreaker(goingOff) {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast(goingOff ? 'Switching breaker OFF...' : 'Switching breaker back ON...', 'ok');
    this._showCamHint('Panning to breaker');
    this._animateCam(
      new THREE.Vector3(-1.4, 0.55, 5.6), new THREE.Vector3(this._BX, this._BY, 0), 900,
      () => { this._bkGoingOff = goingOff; this._bkAnimT = 0; this._bkAnimating = true;
              this._bkCB = goingOff ? () => this._afterBreakerOff() : () => this._afterBreakerOn(); }
    );
  }

  _afterBreakerOff() {
    this._completeTask(1, 12);
    this._showToast('Breaker OFF — safe to work!', 'ok');
    this._setInstr('<span class="or-snum">STEP 2</span>Select <span>Screwdriver</span> then tap the center <span>screw</span>');
    this._enableTool('screwdriver'); this._selectTool('screwdriver');
    this._setTut(this._screwHead, 'TAP SCREW');
    this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 800,
      () => { this._gameState = 'screw'; });
  }

  _afterBreakerOn() {
    this._completeTask(7, 88);
    this._showToast('Breaker ON! Test with multimeter.', 'ok');
    this._setInstr('<span class="or-snum">STEP 8</span>Select <span>Multimeter</span> then tap the <span>outlet</span>');
    this._enableTool('multimeter'); this._selectTool('multimeter');
    this._setTut(this._facePlate, 'TAP OUTLET');
    this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 800,
      () => { this._gameState = 'test'; });
  }

  _doRemoveScrew() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Removing cover screw...', 'ok');
    this._showCamHint('Zooming in');
    this._animateCam(new THREE.Vector3(0.3, 1.1, 3.2), new THREE.Vector3(0, 0.92, 0), 900,
      () => { this._screwRemoving = true; this._screwSpinT = 0; });
  }

  _doOpenCover() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Opening outlet cover...', 'ok');
    this._showCamHint('Side angle view');
    this._animateCam(new THREE.Vector3(-3.5, 2.2, 4.0), new THREE.Vector3(0, 0.2, 0), 1100,
      () => { this._coverOpening = true; this._coverOpenT = 0; });
  }

  _doCloseCover() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Closing outlet cover...', 'ok');
    this._showCamHint('Watching cover close');
    this._animateCam(new THREE.Vector3(-2.8, 1.8, 4.2), new THREE.Vector3(0, 0.3, 0), 900,
      () => { this._coverClosing = true; this._coverCloseT = 0; });
  }

  _doTest() {
    this._gameState = 'animating'; this._setTut(null);
    this._showCamHint('Testing outlet');
    this._animateCam(new THREE.Vector3(0.3, 0.3, 3.5), new THREE.Vector3(0, 0.2, 0), 700, () => {
      const ro = this._$o('reading'), rv = this._$o('rd-val');
      if (ro) ro.classList.add('show');
      if (rv) { rv.textContent = '---'; rv.style.color = '#22c55e'; }
      const steps = ['---', '12V', '85V', '154V', '199V', '216V', '220V'];
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
            this._showToast('220V AC — Outlet working perfectly!', 'ok');
            this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 1200, () => {
              setTimeout(() => {
                const score = 500 + this._timerVal * 2;
                const ss = this._$o('so-score'); if (ss) ss.textContent = `Score: ${score} pts`;
                const sov = this._$o('success-overlay'); if (sov) sov.classList.add('show');
                if (this._onFixed) this._onFixed(this._socketId, 1);
              }, 800);
            });
          }, 700);
        }
      }, 220);
    });
  }

  _connectWire(color) {
    if (this._wiresState[color]) return;
    this._wiresState[color] = true;
    const draggable = this._root.querySelector(`#or-wd-${color}`);
    const term      = this._root.querySelector(`#or-wt-${color}`);
    if (draggable) draggable.classList.add('used');
    if (term) {
      const bgMap = { red: '#7f1d1d', black: '#1f2937' };
      term.style.background  = bgMap[color];
      term.style.color       = '#fff';
      term.style.borderStyle = 'solid';
      term.textContent       = '✓';
    }

    // black=neutral index 0 (left -0.3), red=live index 1 (right +0.3)
    const wireColors3D = [0x111111, 0xdc2626];
    const wireNames    = ['black', 'red'];
    const idx   = wireNames.indexOf(color);
    const termX = this._terminalMeshes[idx].x;
    this._outletRoot.remove(this._wireMeshes[idx]);
    const connPts = [
      new THREE.Vector3(termX, 0, -0.42),
      new THREE.Vector3(termX, -0.25, -0.2),
      new THREE.Vector3(termX + (Math.random()-.5)*.25, -0.70, 0.05),
      new THREE.Vector3(termX + (Math.random()-.5)*.2,  -1.20, 0.0),
    ];
    const cw = this._makeWireTube(wireColors3D[idx], connPts);
    this._outletRoot.add(cw); this._wireMeshes[idx] = cw;
    this._terminalMeshes[idx].glowMesh.material.color.setHex(wireColors3D[idx]);
    this._terminalMeshes[idx].glowMesh.material.emissive = new THREE.Color(wireColors3D[idx]);
    this._terminalMeshes[idx].glowMesh.material.emissiveIntensity = 0.8;

    const connectedCount = Object.values(this._wiresState).filter(Boolean).length;
    this._damageLight.intensity = Math.max(0, 0.9 - connectedCount * 0.45);

    const pctMap = { black: 54, red: 66 };
    const lbl = color === 'red' ? 'RED (Live)' : 'BLACK (Neutral)';
    this._showToast(`${lbl} wire connected ✓`, 'ok');
    this._setPct(pctMap[color]);

    if (this._wiresState.red && this._wiresState.black) {
      this._damageLight.intensity = 0;
      setTimeout(() => {
        this._completedTasks++;
        const t5 = this._$o('t5'); if (t5) { t5.classList.remove('active'); t5.classList.add('done'); }
        const t6 = this._$o('t6'); if (t6) t6.classList.add('active');
        const dc = this._$o('done-count'); if (dc) dc.textContent = this._completedTasks;
        this._setPct(75);
        const wp = this._$o('wire-panel'); if (wp) { wp.style.display = 'none'; wp.classList.remove('hi'); }
        this._setInstr('<span class="or-snum">STEP 6</span>All wires connected! Tap the <span>outlet area</span> to close the cover');
        const ins = this._$o('instruction'); if (ins) ins.style.display = 'block';
        this._setTut(this._jBox, 'TAP TO CLOSE');
        this._gameState = 'rescrew';
        this._animateCam(new THREE.Vector3(0.8, 0.4, 5.5), new THREE.Vector3(0, 0.2, 0), 700, () => {});
      }, 900);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CAMERA TWEEN
  // ─────────────────────────────────────────────────────────────────────────────

  _animateCam(toPos, toLook, dur, cb) {
    this._camFrom.copy(this._camera.position);
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this._camera.quaternion);
    this._camLookFrom.copy(this._camera.position).addScaledVector(dir, 5);
    this._camTo.copy(toPos); this._camLookTo.copy(toLook);
    this._camT = 0; this._camDur = dur; this._camCB = cb; this._camTweening = true;
  }
  _eio3(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  // ─────────────────────────────────────────────────────────────────────────────
  // TUTORIAL RING
  // ─────────────────────────────────────────────────────────────────────────────

  _setTut(obj3D, label = 'TAP HERE') {
    this._tutTarget3D = obj3D;
    const tl = this._$o('tgt-label'); if (tl) tl.textContent = label;
  }

  _updateTutorial() {
    const canvas  = this._root.querySelector('#or-canvas');
    const tgtRing = this._$o('tgt-ring');
    const tgtPulse= this._$o('tgt-pulse');
    const tgtLabel= this._$o('tgt-label');
    const bkTip   = this._$o('breaker-tip');
    if (!canvas) return;

    const showable = this._tutTarget3D !== null
      && this._gameState !== 'animating' && this._gameState !== 'inspect'
      && this._gameState !== 'wires'    && this._gameState !== 'done';

    if (!showable) {
      [tgtRing, tgtPulse, tgtLabel, bkTip].forEach(el => el && (el.style.display = 'none'));
      return;
    }

    const wp = new THREE.Vector3();
    this._tutTarget3D.getWorldPosition(wp);
    const v = wp.clone().project(this._camera);
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
      tgtLabel.style.left = sx + 'px'; tgtLabel.style.top = (sy + 48) + 'px';
    }
    if (bkTip) {
      if (this._gameState === 'breaker_off' || this._gameState === 'breaker_on') {
        bkTip.style.display = 'block'; bkTip.style.left = sx + 'px'; bkTip.style.top = (sy - 60) + 'px';
        bkTip.textContent = this._gameState === 'breaker_off' ? 'BREAKER  ·  SWITCH OFF' : 'BREAKER  ·  SWITCH ON';
      } else bkTip.style.display = 'none';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HUD HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  _completeTask(n, pct) {
    this._completedTasks++;
    const el = this._$o('t' + n); if (el) { el.classList.remove('active'); el.classList.add('done'); }
    const nx = this._$o('t' + (n + 1)); if (nx) nx.classList.add('active');
    const dc = this._$o('done-count'); if (dc) dc.textContent = this._completedTasks;
    this._setPct(pct);
  }
  _setPct(p) {
    const bar = this._$o('pw-bar'); if (bar) bar.style.width = p + '%';
    const pct = this._$o('pw-pct'); if (pct) pct.textContent = p;
  }
  _selectTool(t) {
    this._selectedTool = t;
    ['screwdriver', 'pliers', 'multimeter'].forEach(id => {
      const s = this._$o('tool-' + id); if (s) s.classList.remove('active');
    });
    const s = this._$o('tool-' + t); if (s) s.classList.add('active');
  }
  _enableTool(t) {
    const s = this._$o('tool-' + t); if (s) s.classList.remove('disabled');
  }
  _setInstr(html) {
    const el = this._$o('instruction'); if (!el) return;
    el.style.display = 'block'; el.innerHTML = html;
  }
  _showToast(msg, type) {
    const t = this._$o('toast'); if (!t) return;
    t.textContent = msg; t.className = 'show ' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
  _showCamHint(msg) {
    const h = this._$o('cam-hint'); if (!h) return;
    h.textContent = '📷 ' + msg; h.classList.add('show');
    clearTimeout(this._camHintTimer);
    this._camHintTimer = setTimeout(() => h.classList.remove('show'), 2000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────────

  _resetAll() {
    if (this._touchClone) { this._touchClone.remove(); this._touchClone = null; }
    this._touchWire = null;

    this._gameState = 'breaker_off'; this._selectedTool = null;
    this._wiresState = { red: false, black: false };
    this._completedTasks = 0; this._timerVal = 300; this._timerRunning = true;
    this._screwRemoving = false;  this._screwSpinT = 0;
    this._screwReattaching = false; this._screwReattachT = 0;
    this._coverOpening = false; this._coverOpenT = 0;
    this._coverClosing = false; this._coverCloseT = 0;
    this._inspecting = false;   this._inspectT = 0;
    this._bkAnimating = false;  this._bkAnimT = 0;
    this._camTweening = false;  this._idleT = 0;
    this._damageLightT = 0;     this._damageLight.intensity = 0;

    // 3D reset
    this._bkHandle.position.y = this._HANDLE_ON_Y;
    this._bkHandleMat.color.setHex(0x22c55e);
    this._bkLEDMat.color.setHex(0x22c55e);
    this._bkLEDMat.emissive.setHex(0x22c55e);
    this._bkLEDMat.emissiveIntensity = 1.0;
    this._faceGroup.visible = true; this._faceGroup.rotation.x = 0;
    this._faceGroup.position.set(0, -0.9, 0);
    this._screwGroup.visible = true; this._screwGroup.rotation.z = 0;
    this._screwGroup.position.set(0, 0.925, 0);
    this._internalGroup.visible = false;
    this._terminalMeshes.forEach(t => {
      t.glowMesh.material.color.setHex(0x222222);
      t.glowMesh.material.emissiveIntensity = 0;
    });
    const wireColors3D = [0x111111, 0xdc2626]; // black, red
    [0, 1].forEach(i => {
      this._outletRoot.remove(this._wireMeshes[i]);
      const wg = this._makeDamagedWireGroup(wireColors3D[i], this._looseWirePts[i]);
      wg.visible = false; this._outletRoot.add(wg); this._wireMeshes[i] = wg;
    });
    this._camera.position.set(1.2, 0.8, 6.5);
    this._camera.lookAt(0, 0, 0);

    // HUD reset
    this._setPct(0);
    const dc = this._$o('done-count'); if (dc) dc.textContent = '0';
    for (let i = 1; i <= 8; i++) {
      const el = this._$o('t' + i); if (!el) continue;
      el.classList.remove('done', 'active');
      if (i === 1) el.classList.add('active');
    }
    const wp = this._$o('wire-panel'); if (wp) { wp.style.display = 'none'; wp.classList.remove('hi'); }
    const sov = this._$o('success-overlay'); if (sov) sov.classList.remove('show');
    const ro = this._$o('reading'); if (ro) ro.classList.remove('show');
    const rv = this._$o('rd-val'); if (rv) rv.textContent = '---';
    this._setInstr('<span class="or-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>');

    ['red', 'black'].forEach(c => {
      const wd = this._root.querySelector(`#or-wd-${c}`); if (wd) wd.classList.remove('used');
      const wt = this._root.querySelector(`#or-wt-${c}`);
      if (wt) {
        const lbl = { red: 'L', black: 'N' };
        const col = { red: '#dc2626', black: '#888' };
        wt.style.background = ''; wt.style.color = col[c];
        wt.style.borderStyle = 'dashed'; wt.textContent = lbl[c];
      }
    });
    ['screwdriver', 'pliers', 'multimeter'].forEach(t => {
      const s = this._$o('tool-' + t); if (!s) return;
      s.classList.add('disabled'); s.classList.remove('active');
    });

    // Tool click handlers (set once per reset to avoid duplicates)
    ['screwdriver', 'pliers', 'multimeter'].forEach(t => {
      const s = this._$o('tool-' + t); if (!s) return;
      s.onclick = () => { if (this._open) this._selectTool(t); };
    });

    // Replay button
    const replayBtn = this._$o('replay-btn');
    if (replayBtn) replayBtn.onclick = () => this._resetAll();

    this._setTut(this._bkHandle, 'TAP HERE');

    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    const timerEl = this._$o('timer'); if (timerEl) timerEl.textContent = '05:00';
    this._timerInterval = setInterval(() => {
      if (!this._timerRunning || !this._open) return;
      this._timerVal = Math.max(0, this._timerVal - 1);
      const m = Math.floor(this._timerVal / 60).toString().padStart(2, '0');
      const s = (this._timerVal % 60).toString().padStart(2, '0');
      const tel = this._$o('timer'); if (tel) tel.textContent = `${m}:${s}`;
    }, 1000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN LOOP
  // ─────────────────────────────────────────────────────────────────────────────

  _loop() {
    if (!this._open) return;
    this._raf = requestAnimationFrame(() => this._loop());
    const dt = Math.min(this._clock.getDelta(), 0.05);
    this._idleT += dt;

    // Idle float
    this._outletRoot.position.y = Math.sin(this._idleT * 0.55) * 0.035;
    this._outletRoot.rotation.z = Math.sin(this._idleT * 0.35) * 0.006;
    this._outletRoot.rotation.x = Math.sin(this._idleT * 0.28) * 0.005 + 0.04;

    // Pulsing damage light
    if (this._internalGroup.visible && this._damageLight.intensity > 0) {
      this._damageLightT += dt;
      const pulse = 0.5 + 0.5 * Math.sin(this._damageLightT * 3.5);
      this._damageLight.intensity = 0.9 * pulse;
      this._damageLight.color.setHSL(0.06 - pulse * 0.04, 1.0, 0.5);
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
      this._bkAnimT += dt * 2.8;
      const p = this._eio3(Math.min(this._bkAnimT, 1));
      const fromY = this._bkGoingOff ? this._HANDLE_ON_Y : this._HANDLE_OFF_Y;
      const toY   = this._bkGoingOff ? this._HANDLE_OFF_Y : this._HANDLE_ON_Y;
      this._bkHandle.position.y = fromY + (toY - fromY) * p;
      if (this._bkAnimT >= 1) {
        this._bkAnimating = false;
        this._bkHandle.position.y = toY;
        if (this._bkGoingOff) {
          this._bkHandleMat.color.setHex(0xef4444);
          this._bkLEDMat.color.setHex(0xef4444);
          this._bkLEDMat.emissive.setHex(0x881111);
          this._bkLEDMat.emissiveIntensity = 0.55;
        } else {
          this._bkHandleMat.color.setHex(0x22c55e);
          this._bkLEDMat.color.setHex(0x22c55e);
          this._bkLEDMat.emissive.setHex(0x22c55e);
          this._bkLEDMat.emissiveIntensity = 1.0;
        }
        if (this._bkCB) { const cb = this._bkCB; this._bkCB = null; cb(); }
      }
    }

    // Screw removal
    if (this._screwRemoving) {
      this._screwSpinT += dt * 5.5;
      this._screwGroup.rotation.z = this._screwSpinT;
      this._screwGroup.position.z = this._screwSpinT * 0.09;
      this._screwGroup.position.y = this._screwSpinT * 0.03;
      if (this._screwSpinT > Math.PI * 5) {
        this._screwRemoving = false; this._screwGroup.visible = false;
        this._completeTask(2, 24);
        this._showToast('Screw removed! Tap the outlet cover.', 'ok');
        this._setInstr('<span class="or-snum">STEP 3</span>Tap the <span>outlet cover</span> to open it');
        this._setTut(this._facePlate, 'TAP COVER');
        this._animateCam(new THREE.Vector3(-1.8, 1.4, 5.2), new THREE.Vector3(0, 0.4, 0), 700,
          () => { this._gameState = 'open'; });
      }
    }

    // Cover opening
    if (this._coverOpening) {
      this._coverOpenT += dt * 1.4;
      this._faceGroup.rotation.x = this._eio3(Math.min(this._coverOpenT, 1)) * 1.95;
      if (this._coverOpenT >= 1) {
        this._coverOpening = false; this._faceGroup.visible = false;
        this._internalGroup.visible = true;
        this._wireMeshes.forEach(w => w.visible = true);
        this._damageLight.intensity = 0.9; this._damageLightT = 0;
        this._completeTask(3, 36);
        this._showToast('Cover open! Inspecting wiring...', 'ok');
        this._setInstr('<span class="or-snum">STEP 4</span>Inspecting wires — connections are <span>damaged</span>');
        this._setTut(null); this._inspecting = true; this._inspectT = 0;
        this._animateCam(new THREE.Vector3(0.2, 0.5, 3.6), new THREE.Vector3(0, -0.25, 0), 1000, () => {});
      }
    }

    // Inspect (auto-zoom + auto-advance)
    if (this._inspecting) {
      this._inspectT += dt;
      if (this._inspectT > 0.8 && this._inspectT < 0.82) {
        this._animateCam(new THREE.Vector3(-0.1, -0.4, 2.6), new THREE.Vector3(0, -0.5, 0), 900, () => {});
      }
      if (this._inspectT >= 2.5) {
        this._inspecting = false;
        this._completeTask(4, 48);
        this._showToast('Wires disconnected — drag each wire to its matching terminal.', 'info');
        const wp = this._$o('wire-panel');
        if (wp) { wp.style.display = 'block'; wp.classList.add('hi'); }
        const ins = this._$o('instruction'); if (ins) ins.style.display = 'none';
        this._gameState = 'wires';
        this._animateCam(new THREE.Vector3(0.3, 2.2, 5.0), new THREE.Vector3(0, -0.1, 0), 900, () => {});
      }
    }

    // Cover closing
    if (this._coverClosing) {
      this._coverCloseT += dt * 1.2;
      this._faceGroup.visible = true;
      this._faceGroup.rotation.x = (1 - this._eio3(Math.min(this._coverCloseT, 1))) * 1.95;
      if (this._coverCloseT >= 1) {
        this._coverClosing = false;
        this._faceGroup.rotation.x = 0; this._faceGroup.position.set(0, -0.9, 0);
        this._internalGroup.visible = false; this._wireMeshes.forEach(w => w.visible = false);
        this._damageLight.intensity = 0;
        this._screwGroup.visible = true;
        this._screwGroup.position.set(0, 0.925, 0.6); this._screwGroup.rotation.z = Math.PI * 9;
        this._screwReattaching = true; this._screwReattachT = 0;
        this._animateCam(new THREE.Vector3(0.2, 0.95, 3.0), new THREE.Vector3(0, 0.92, 0), 600, () => {});
      }
    }

    // Screw reattach
    if (this._screwReattaching) {
      this._screwReattachT += dt * 4;
      const prog = Math.min(this._screwReattachT / 3.5, 1);
      this._screwGroup.rotation.z = (1 - this._eio3(prog)) * Math.PI * 9;
      this._screwGroup.position.z = (1 - this._eio3(prog)) * 0.6;
      this._screwGroup.position.y = 0.925;
      if (this._screwReattachT >= 3.5) {
        this._screwReattaching = false;
        this._screwGroup.rotation.z = 0; this._screwGroup.position.set(0, 0.925, 0);
        this._completeTask(6, 82);
        this._showToast('Outlet closed! Turn the breaker back ON.', 'ok');
        this._setInstr('<span class="or-snum">STEP 7</span>Find the <span>breaker panel</span> — switch it <span>ON</span>');
        this._setTut(this._bkHandle, 'TAP BREAKER');
        this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0, 0, 0), 1200,
          () => { this._gameState = 'breaker_on'; });
      }
    }

    this._updateTutorial();
    this._renderer.render(this._scene, this._camera);
  }
}

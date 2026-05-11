import * as THREE from 'three';
import { Database } from '../systems/Database.js';

// ══════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════

const CSS = `
.ol{position:absolute;inset:0;display:flex;flex-direction:column;background:#1a1814;font-family:'Exo 2',sans-serif;overflow:hidden;color:#fff;}

.ol-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(to bottom,rgba(0,0,0,.72) 0%,transparent 100%);z-index:20;pointer-events:none;}
.ol-back{pointer-events:auto;color:#F5C518;font-family:'Share Tech Mono',monospace;font-size:11px;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.25);padding:5px 12px;border-radius:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.ol-top-title{font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.15em;color:#F5C518;}
.ol-timer-box{display:flex;align-items:center;gap:6px;background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:6px;padding:5px 12px;font-family:'Share Tech Mono',monospace;font-size:14px;font-weight:700;}

.ol-canvas{display:block;width:100%;height:100%;position:absolute;inset:0;}

.ol-mission{position:absolute;top:58px;left:14px;background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:14px 16px;min-width:200px;z-index:15;pointer-events:none;}
.ol-mission-hd{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.1em;color:#F5C518;margin-bottom:8px;}
.ol-task{display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:5px;color:rgba(255,255,255,.4);}
.ol-task.active{color:#fff;}
.ol-task.done{color:#22c55e;text-decoration:line-through;}
.ol-dot{width:8px;height:8px;border-radius:50%;border:2px solid currentColor;flex-shrink:0;}
.ol-task.done .ol-dot{background:#22c55e;border-color:#22c55e;}
.ol-task.active .ol-dot{background:#F5C518;border-color:#F5C518;animation:olPulse 1s infinite;}
@keyframes olPulse{0%,100%{opacity:1}50%{opacity:.35}}
.ol-task-count{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:10px;color:rgba(255,255,255,.35);}

.ol-prog-wrap{position:absolute;top:58px;right:14px;background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:12px 14px;min-width:120px;z-index:15;pointer-events:none;}
.ol-prog-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.1em;color:#F5C518;margin-bottom:6px;}
.ol-prog-bg{height:6px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;}
.ol-prog-bar{height:100%;background:#F5C518;border-radius:99px;transition:width .5s ease;width:0%;}
.ol-prog-pct{font-family:'Share Tech Mono',monospace;font-size:20px;font-weight:900;margin-top:4px;}

.ol-instr{position:absolute;bottom:86px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:10px 18px;font-size:13px;font-weight:500;text-align:center;pointer-events:none;max-width:440px;line-height:1.55;z-index:15;}
.ol-instr span{color:#F5C518;}
.ol-snum{display:inline-block;background:#F5C518;color:#000;font-family:'Share Tech Mono',monospace;font-weight:900;font-size:10px;padding:1px 6px;border-radius:3px;margin-right:4px;letter-spacing:.05em;}

.ol-toolbar{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:8px;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:7px;z-index:20;}
.ol-tool{width:54px;height:54px;border-radius:8px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:20px;gap:2px;-webkit-tap-highlight-color:transparent;transition:all .18s;}
.ol-tool.active{border-color:#F5C518;background:rgba(245,197,24,.18);box-shadow:0 0 12px rgba(245,197,24,.3);}
.ol-tool.disabled{opacity:.25;pointer-events:none;}
.ol-tool-name{font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,.55);}
.ol-tool.active .ol-tool-name{color:#F5C518;}

.ol-wire-panel{position:absolute;bottom:86px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.92);border:1px solid rgba(245,197,24,.3);border-radius:14px;padding:18px 22px;display:none;pointer-events:auto;min-width:340px;z-index:20;}
.ol-wire-panel.hi{box-shadow:0 0 28px rgba(245,197,24,.5);border-color:rgba(245,197,24,.8);animation:olWpGlow 1.8s ease-in-out infinite;}
@keyframes olWpGlow{0%,100%{box-shadow:0 0 14px rgba(245,197,24,.3)}50%{box-shadow:0 0 32px rgba(245,197,24,.65)}}
.ol-wp-title{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;color:#F5C518;margin-bottom:12px;text-align:center;}
.ol-wire-row{display:flex;align-items:center;gap:9px;margin-bottom:9px;}
.ol-wire-drag{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:grab;color:#fff;user-select:none;border:1.5px solid rgba(255,255,255,.2);min-width:78px;text-align:center;transition:all .18s;}
.ol-wire-drag.used{opacity:.28;pointer-events:none;}
.ol-wire-line{flex:1;height:3px;border-radius:2px;}
.ol-wire-term{width:42px;height:28px;border-radius:6px;border:2px dashed;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:pointer;transition:all .22s;}
.ol-wire-term.connected{border-style:solid;}
.ol-wire-term.reject{animation:olShake .3s;}
@keyframes olShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

.ol-toast{position:absolute;top:58px;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:30px;font-size:12px;font-weight:600;opacity:0;transition:opacity .28s;pointer-events:none;white-space:nowrap;z-index:30;}
.ol-toast.show{opacity:1;}
.ol-toast.ok{background:rgba(34,197,94,.18);border:1px solid #22c55e;color:#22c55e;}
.ol-toast.err{background:rgba(239,68,68,.16);border:1px solid #ef4444;color:#ef4444;}
.ol-toast.info{background:rgba(59,130,246,.18);border:1px solid #3b82f6;color:#3b82f6;}

.ol-reading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(5,20,10,.95);border:2px solid #22c55e;border-radius:14px;padding:22px 34px;text-align:center;display:none;z-index:35;pointer-events:none;}
.ol-reading.show{display:block;}
.ol-rd-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.18em;color:rgba(255,255,255,.4);margin-bottom:8px;}
.ol-rd-val{font-family:'Share Tech Mono',monospace;font-size:54px;font-weight:900;color:#22c55e;line-height:1;}
.ol-rd-unit{font-family:'Share Tech Mono',monospace;font-size:16px;color:rgba(255,255,255,.45);margin-top:4px;}

.ol-tgt-ring{position:absolute;pointer-events:none;z-index:25;width:68px;height:68px;border-radius:50%;border:3px solid #F5C518;transform:translate(-50%,-50%);display:none;box-shadow:0 0 16px rgba(245,197,24,.5);}
.ol-tgt-pulse{position:absolute;pointer-events:none;z-index:24;width:68px;height:68px;border-radius:50%;border:2px solid rgba(245,197,24,.5);transform:translate(-50%,-50%);animation:olRingPulse 1.3s ease-out infinite;display:none;}
@keyframes olRingPulse{0%{transform:translate(-50%,-50%) scale(1);opacity:.8}100%{transform:translate(-50%,-50%) scale(2.1);opacity:0}}
.ol-tgt-lbl{position:absolute;pointer-events:none;z-index:26;background:rgba(0,0,0,.82);border:1px solid #F5C518;color:#F5C518;font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;padding:3px 10px;border-radius:4px;transform:translateX(-50%);display:none;white-space:nowrap;animation:olTapBounce .7s ease-in-out infinite alternate;}
@keyframes olTapBounce{from{transform:translateX(-50%) translateY(0)}to{transform:translateX(-50%) translateY(7px)}}

.ol-success{position:absolute;inset:0;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;pointer-events:auto;z-index:40;}
.ol-success.show{display:flex;}
.ol-so-big{font-family:'Share Tech Mono',monospace;font-size:72px;font-weight:900;color:#22c55e;line-height:1;}
.ol-so-sub{font-size:15px;color:rgba(255,255,255,.65);}
.ol-so-btn{margin-top:8px;padding:12px 30px;border-radius:8px;background:#F5C518;color:#000;font-family:'Share Tech Mono',monospace;font-size:14px;font-weight:900;letter-spacing:.07em;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;}
`;

function injectCSS() {
  if (document.querySelector('#ol-css')) return;
  const s = document.createElement('style');
  s.id = 'ol-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function mkBox(w, h, d, color, rough = 0.7, metal = 0.1) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  );
}
function mkCyl(rt, rb, h, segs, color, rough = 0.5, metal = 0.3) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  );
}

function eio3(t) {
  return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

// ══════════════════════════════════════════════════════════════════
// CLASS
// ══════════════════════════════════════════════════════════════════

export class OutletLesson {
  constructor(state) {
    this.state     = state;
    this._animId   = null;
    this._renderer = null;
    this._timerIv  = null;
    this.container = this._build();
  }

  // ── DOM BUILD ────────────────────────────────────────────────

  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="ol">
        <canvas class="ol-canvas" id="ol-canvas"></canvas>

        <div class="ol-top">
          <button class="ol-back" id="ol-back">← STAGES</button>
          <span class="ol-top-title">⚡ OUTLET REPAIR</span>
          <div class="ol-timer-box">⏱ <span id="ol-timer">05:00</span></div>
        </div>

        <div class="ol-mission">
          <div class="ol-mission-hd">🔧 Broken Outlet</div>
          ${[1,2,3,4,5,6,7,8].map(n => `<div class="ol-task ${n===1?'active':''}" id="ol-t${n}"><div class="ol-dot"></div>${['Turn OFF breaker','Remove cover screw','Open outlet cover','Inspect wires','Reconnect wires','Close outlet','Turn ON breaker','Test with multimeter'][n-1]}</div>`).join('')}
          <div class="ol-task-count">Steps: <span id="ol-done-count">0</span>/8</div>
        </div>

        <div class="ol-prog-wrap">
          <div class="ol-prog-lbl">PROGRESS</div>
          <div class="ol-prog-bg"><div class="ol-prog-bar" id="ol-prog-bar"></div></div>
          <div class="ol-prog-pct"><span id="ol-pct">0</span>%</div>
        </div>

        <div class="ol-instr" id="ol-instr"><span class="ol-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span></div>

        <div class="ol-wire-panel" id="ol-wire-panel">
          <div class="ol-wp-title">CONNECT WIRES TO CORRECT TERMINALS</div>
          ${['brown','blue','green'].map(c => {
            const map = { brown:{bg:'#92400e',bc:'#b45309',lbl:'BROWN (L)',tLbl:'L'}, blue:{bg:'#1d4ed8',bc:'#3b82f6',lbl:'BLUE (N)',tLbl:'N'}, green:{bg:'#166534',bc:'#22c55e',lbl:'GREEN (E)',tLbl:'E'} };
            const m = map[c];
            return `<div class="ol-wire-row">
              <div class="ol-wire-drag" id="ol-wd-${c}" style="background:${m.bg};border-color:${m.bc}" draggable="true">${m.lbl}</div>
              <div class="ol-wire-line" style="background:${m.bc};opacity:.5"></div>
              <div class="ol-wire-term" id="ol-wt-${c}" style="border-color:${m.bc};color:${m.bc}">${m.tLbl}</div>
            </div>`;
          }).join('')}
        </div>

        <div class="ol-toolbar" id="ol-toolbar">
          <div class="ol-tool disabled" id="ol-tool-screwdriver">🔧<div class="ol-tool-name">SCREW</div></div>
          <div class="ol-tool disabled" id="ol-tool-multimeter">📊<div class="ol-tool-name">METER</div></div>
        </div>

        <div class="ol-toast" id="ol-toast"></div>

        <div class="ol-tgt-ring"   id="ol-tgt-ring"></div>
        <div class="ol-tgt-pulse"  id="ol-tgt-pulse"></div>
        <div class="ol-tgt-lbl"    id="ol-tgt-lbl">TAP HERE</div>

        <div class="ol-reading" id="ol-reading">
          <div class="ol-rd-lbl">VOLTAGE READING</div>
          <div class="ol-rd-val" id="ol-rd-val">---</div>
          <div class="ol-rd-unit">Volts AC</div>
        </div>

        <div class="ol-success" id="ol-success">
          <div class="ol-so-big">✓ FIXED!</div>
          <div class="ol-so-sub">Outlet repaired and tested successfully.</div>
          <button class="ol-so-btn" id="ol-so-btn">BACK TO STAGES</button>
        </div>
      </div>`;

    el.querySelector('#ol-back').addEventListener('click', () => {
      this._cleanup();
      this.state.setState('stagesHub');
    });
    el.querySelector('#ol-so-btn').addEventListener('click', () => {
      this._cleanup();
      this.state.setState('stagesHub');
    });
    el.querySelectorAll('.ol-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.id.replace('ol-tool-', '');
        this._selectTool(id);
      });
    });
    this._setupDragDrop(el);
    this._el = el;
    return el;
  }

  // ── THREE.JS INIT ────────────────────────────────────────────

  _initThree() {
    if (this._renderer) return;
    const canvas  = this._el.querySelector('#ol-canvas');
    const wrap    = this._el.querySelector('.ol');
    const W = wrap.offsetWidth || window.innerWidth;
    const H = wrap.offsetHeight || window.innerHeight;
    if (!W || !H) { setTimeout(() => this._initThree(), 80); return; }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1814);
    scene.fog = new THREE.Fog(0x1a1814, 10, 22);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(1.2, 0.8, 6.5);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const spot = new THREE.SpotLight(0xfff4e0, 2.8, 22, Math.PI * 0.16, 0.25);
    spot.position.set(1, 7, 6); spot.castShadow = true;
    scene.add(spot); scene.add(spot.target);
    const rim = new THREE.DirectionalLight(0x4488ff, 0.25);
    rim.position.set(-4, 2, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffddaa, 0.15);
    fill.position.set(3, -2, 4); scene.add(fill);
    scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.45), { position: new THREE.Vector3(-6, 3, 5) }));

    const damageLight = new THREE.PointLight(0xff4400, 0, 2.5);
    damageLight.position.set(0, -0.35, 0.25);
    scene.add(damageLight);

    // Wall
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshLambertMaterial({ color: 0x2a2620 }));
    wall.position.z = -1.2; wall.receiveShadow = true; scene.add(wall);

    // Build outlet
    const { outletRoot, faceGroup, facePlate, screwGroup, screwHead, washer, internalGroup, terminalMeshes, wireMeshes, looseWirePts, jBox, bkHandle, bkHandleMat, bkLEDMat, HANDLE_ON_Y, HANDLE_OFF_Y } = this._buildOutlet(scene);

    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();

    canvas.addEventListener('click', e => this._onClick(e, raycaster, ptr, camera, facePlate, screwHead, washer, bkHandle, jBox));
    canvas.addEventListener('pointermove', e => {
      ptr.x = (e.clientX / W) * 2 - 1;
      ptr.y = -(e.clientY / H) * 2 + 1;
      raycaster.setFromCamera(ptr, camera);
      const state = this._gameState;
      let cur = 'default';
      if ((state === 'breaker_off' || state === 'breaker_on') && raycaster.intersectObjects([bkHandle], true).length) cur = 'pointer';
      else if (state === 'screw' && raycaster.intersectObjects([screwHead, washer], true).length) cur = 'pointer';
      else if ((state === 'open' || state === 'test') && raycaster.intersectObject(facePlate, false).length) cur = 'pointer';
      else if (state === 'rescrew') cur = 'pointer';
      canvas.style.cursor = cur;
    });

    this._resizeObs = new ResizeObserver(() => {
      const w2 = wrap.offsetWidth, h2 = wrap.offsetHeight;
      if (!w2 || !h2) return;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    });
    this._resizeObs.observe(wrap);

    this._renderer = renderer;
    this._three = {
      scene, camera, renderer, damageLight, outletRoot, faceGroup, facePlate,
      screwGroup, screwHead, washer, internalGroup, terminalMeshes, wireMeshes,
      looseWirePts, jBox, bkHandle, bkHandleMat, bkLEDMat, HANDLE_ON_Y, HANDLE_OFF_Y,
      raycaster, ptr,
      camFrom: new THREE.Vector3(), camTo: new THREE.Vector3(),
      camLookFrom: new THREE.Vector3(), camLookTo: new THREE.Vector3(),
      camTweening: false, camT: 0, camDur: 0, camCB: null,
    };

    this._startLoop();
  }

  _buildOutlet(scene) {
    const outletRoot = new THREE.Group(); scene.add(outletRoot);
    const boxDepth = 0.7;
    const jBox = mkBox(2.4, 2.4, boxDepth, 0x5a4020, 0.9, 0.05);
    jBox.position.z = -1.2 + boxDepth/2 - 0.05; outletRoot.add(jBox);
    const interior = mkBox(2.1, 2.1, 0.05, 0x1a1008, 0.95, 0);
    interior.position.z = -1.2 + boxDepth - 0.03; outletRoot.add(interior);
    const flange = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.06), new THREE.MeshStandardMaterial({ color:0x888888, roughness:0.4, metalness:0.6 }));
    flange.position.z = -1.2 + boxDepth; outletRoot.add(flange);
    [-0.7, 0.7].forEach(x => {
      const ko = mkBox(0.22, 0.14, 0.08, 0x666666, 0.5, 0.5);
      ko.position.set(x, 0.95, -1.2 + boxDepth + 0.02); outletRoot.add(ko);
    });

    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, -0.9, 0);
    outletRoot.add(faceGroup);

    const facePlate = mkBox(2.0, 1.85, 0.14, 0xd5d0c6, 0.65, 0.05);
    facePlate.position.set(0, 0.925, 0); facePlate.castShadow = true;
    faceGroup.add(facePlate);

    [-0.65, 0.65].forEach(x => {
      [-0.7, 0.7].forEach(y => {
        const sh = mkCyl(0.055, 0.055, 0.16, 12, 0xaaaaaa, 0.3, 0.5);
        sh.rotation.x = Math.PI/2; sh.position.set(x, y+0.925, 0.07); faceGroup.add(sh);
      });
    });

    const slotMat = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.9 });
    [-0.32, 0.32].forEach(x => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.18), slotMat);
      s.position.set(x, 1.08, 0.07); faceGroup.add(s);
    });
    const earthSlot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 20), slotMat);
    earthSlot.rotation.x = Math.PI/2; earthSlot.position.set(0, 0.72, 0.07); faceGroup.add(earthSlot);

    const screwGroup = new THREE.Group();
    screwGroup.position.set(0, 0.925, 0);
    faceGroup.add(screwGroup);
    const screwHead = mkCyl(0.115, 0.095, 0.07, 24, 0xb0b0b0, 0.2, 0.7);
    screwHead.rotation.x = Math.PI/2; screwHead.position.z = 0.11; screwGroup.add(screwHead);
    const washer = mkCyl(0.13, 0.13, 0.015, 24, 0x888888, 0.4, 0.5);
    washer.rotation.x = Math.PI/2; washer.position.z = 0.075; screwGroup.add(washer);
    const phMat = new THREE.MeshStandardMaterial({ color:0x333333, roughness:0.8 });
    for (let i = 0; i < 2; i++) {
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.03), phMat);
      sl.rotation.z = i * Math.PI/2; sl.position.z = 0.15; screwGroup.add(sl);
    }
    const screwShaft = mkCyl(0.045, 0.05, 0.5, 12, 0x999999, 0.3, 0.6);
    screwShaft.rotation.x = Math.PI/2; screwShaft.position.z = -0.18; screwGroup.add(screwShaft);

    // Internal terminal block
    const internalGroup = new THREE.Group();
    internalGroup.visible = false; outletRoot.add(internalGroup);
    const mBar = mkBox(2.0, 0.22, 0.12, 0x555555, 0.7, 0.3);
    mBar.position.set(0, 0, -0.52); internalGroup.add(mBar);
    const termBody = mkBox(1.7, 0.55, 0.18, 0x3a3a3a, 0.85, 0.1);
    termBody.position.set(0, 0, -0.45); internalGroup.add(termBody);

    const termData = [{ x:-0.52, color:0xb45309 }, { x:0, color:0x3b82f6 }, { x:0.52, color:0x22c55e }];
    const terminalMeshes = [];
    termData.forEach(({ x, color }) => {
      const tb = mkBox(0.28, 0.42, 0.22, color, 0.6, 0.2);
      tb.position.set(x, 0, -0.38); internalGroup.add(tb);
      const ts = mkCyl(0.08, 0.08, 0.06, 16, 0xaaaaaa, 0.2, 0.7);
      ts.rotation.x = Math.PI/2; ts.position.set(x, 0, -0.27); internalGroup.add(ts);
      const glow = mkBox(0.26, 0.04, 0.02, 0x222222, 1, 0);
      glow.position.set(x, 0.22, -0.37); internalGroup.add(glow);
      terminalMeshes.push({ x, color, glowMesh: glow });
    });

    // Breaker box
    const BX = -3.05, BY = 0.28, BZ = -1.06;
    const bkHousing = mkBox(1.02, 1.65, 0.22, 0x424242, 0.72, 0.38);
    bkHousing.position.set(BX, BY, BZ+0.11); scene.add(bkHousing);
    const bkFace = mkBox(0.84, 1.44, 0.04, 0x2c2c2c, 0.88, 0.05);
    bkFace.position.set(BX, BY, BZ+0.235); scene.add(bkFace);
    const bkStripe = mkBox(0.84, 0.055, 0.05, 0xF5C518, 0.65, 0.1);
    bkStripe.position.set(BX, BY+0.72, BZ+0.24); scene.add(bkStripe);
    const bkSlot = mkBox(0.34, 0.64, 0.03, 0x181818, 0.9, 0);
    bkSlot.position.set(BX, BY, BZ+0.256); scene.add(bkSlot);

    const bkHandleMat = new THREE.MeshStandardMaterial({ color:0x22c55e, roughness:0.42, metalness:0.28 });
    const HANDLE_ON_Y = BY + 0.16, HANDLE_OFF_Y = BY - 0.16;
    const bkHandle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.30, 0.16), bkHandleMat);
    bkHandle.position.set(BX, HANDLE_ON_Y, BZ+0.31); scene.add(bkHandle);

    const bkLEDMat = new THREE.MeshStandardMaterial({ color:0x22c55e, roughness:0.28, metalness:0.5, emissive:new THREE.Color(0x22c55e), emissiveIntensity:1.0 });
    const bkLED = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.055, 12), bkLEDMat);
    bkLED.rotation.x = Math.PI/2; bkLED.position.set(BX+0.27, BY+0.54, BZ+0.245); scene.add(bkLED);

    // Wire meshes
    const wireColors3D = [0xb45309, 0x3b82f6, 0x22c55e];
    const looseWirePts = [
      [new THREE.Vector3(-0.52,0,-0.42), new THREE.Vector3(-0.6,-0.3,-0.1), new THREE.Vector3(-0.8,-0.85,0.2), new THREE.Vector3(-0.55,-1.35,0.05)],
      [new THREE.Vector3(0,0,-0.42), new THREE.Vector3(0.1,-0.28,-0.1), new THREE.Vector3(0.05,-0.9,0.18), new THREE.Vector3(0.1,-1.4,0.08)],
      [new THREE.Vector3(0.52,0,-0.42), new THREE.Vector3(0.62,-0.28,-0.1), new THREE.Vector3(0.75,-0.88,0.2), new THREE.Vector3(0.55,-1.3,0.04)],
    ];
    const wireMeshes = wireColors3D.map((c, i) => {
      const curve = new THREE.CatmullRomCurve3(looseWirePts[i]);
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 32, 0.042, 8, false),
        new THREE.MeshStandardMaterial({ color:c, roughness:0.58, metalness:0.04 })
      );
      mesh.visible = false; outletRoot.add(mesh);
      return mesh;
    });

    return { outletRoot, faceGroup, facePlate, screwGroup, screwHead, washer, internalGroup, terminalMeshes, wireMeshes, looseWirePts, jBox, bkHandle, bkHandleMat, bkLEDMat, HANDLE_ON_Y, HANDLE_OFF_Y };
  }

  // ── GAME STATE ───────────────────────────────────────────────

  _resetState() {
    this._gameState    = 'breaker_off';
    this._selectedTool = null;
    this._wiresState   = { brown: false, blue: false, green: false };
    this._completedTasks = 0;
    this._timerVal     = 300;
    this._timerRunning = false;
    // animation flags
    this._screwRemoving = false; this._screwSpinT = 0;
    this._screwReattach = false; this._screwReattachT = 0;
    this._coverOpening  = false; this._coverOpenT = 0;
    this._coverClosing  = false; this._coverCloseT = 0;
    this._bkAnimating   = false; this._bkAnimT = 0; this._bkGoingOff = false; this._bkCB = null;
    this._inspecting    = false; this._inspectT = 0;
    this._idleT         = 0;
    this._damageLightT  = 0;
    this._tutTarget     = null;
  }

  _$ = (id) => this._el.querySelector(`#${id}`);

  _completeTask(n, pct) {
    this._completedTasks++;
    const el = this._$(`ol-t${n}`);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
    const nx = this._$(`ol-t${n+1}`);
    if (nx) nx.classList.add('active');
    this._$('ol-done-count').textContent = this._completedTasks;
    this._setPct(pct);
  }

  _setPct(p) {
    this._$('ol-prog-bar').style.width = p + '%';
    this._$('ol-pct').textContent = p;
  }

  _setInstr(html) {
    const el = this._$('ol-instr');
    el.style.display = 'block'; el.innerHTML = html;
  }

  _selectTool(t) {
    this._selectedTool = t;
    this._el.querySelectorAll('.ol-tool').forEach(el => el.classList.remove('active'));
    const s = this._$(`ol-tool-${t}`);
    if (s) s.classList.add('active');
  }

  _enableTool(t) {
    const s = this._$(`ol-tool-${t}`);
    if (s) s.classList.remove('disabled');
  }

  _showToast(msg, type) {
    const t = this._$('ol-toast');
    t.textContent = msg; t.className = `ol-toast show ${type}`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  _setTut(obj3D, label = 'TAP HERE') {
    this._tutTarget = obj3D;
    this._$('ol-tgt-lbl').textContent = label;
  }

  _updateTutorial() {
    const gs = this._gameState;
    const showable = this._tutTarget && gs !== 'animating' && gs !== 'inspect' && gs !== 'wires' && gs !== 'done';
    const ring = this._$('ol-tgt-ring'), pulse = this._$('ol-tgt-pulse'), lbl = this._$('ol-tgt-lbl');
    if (!showable || !this._three) { ring.style.display = 'none'; pulse.style.display = 'none'; lbl.style.display = 'none'; return; }
    const { camera } = this._three;
    const wrap = this._el.querySelector('.ol');
    const W = wrap.offsetWidth, H = wrap.offsetHeight;
    const wp = new THREE.Vector3();
    this._tutTarget.getWorldPosition(wp);
    const v = wp.clone().project(camera);
    if (v.z > 1) { ring.style.display = 'none'; pulse.style.display = 'none'; lbl.style.display = 'none'; return; }
    const sx = (v.x + 1)/2 * W, sy = (-v.y + 1)/2 * H;
    [ring, pulse].forEach(el => { el.style.display = 'block'; el.style.left = sx + 'px'; el.style.top = sy + 'px'; });
    lbl.style.display = 'block'; lbl.style.left = sx + 'px'; lbl.style.top = (sy + 46) + 'px';
  }

  // ── CLICK HANDLER ────────────────────────────────────────────

  _onClick(e, raycaster, ptr, camera, facePlate, screwHead, washer, bkHandle, jBox) {
    const gs = this._gameState;
    if (gs === 'animating' || gs === 'inspect' || gs === 'done') return;
    const wrap = this._el.querySelector('.ol');
    const rect = wrap.getBoundingClientRect();
    ptr.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ptr.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ptr, camera);

    if (gs === 'breaker_off') {
      if (raycaster.intersectObjects([bkHandle], true).length) this._doBreaker(true);
      else this._showToast('Find the breaker panel on the left and tap it!', 'err');
    } else if (gs === 'screw') {
      if (raycaster.intersectObjects([screwHead, washer], true).length) {
        if (this._selectedTool !== 'screwdriver') { this._showToast('Select the Screwdriver first!', 'err'); return; }
        this._doRemoveScrew();
      } else this._showToast('Click the screw at the center of the outlet!', 'err');
    } else if (gs === 'open') {
      if (raycaster.intersectObject(facePlate, false).length) this._doOpenCover();
      else this._showToast('Click the outlet cover plate to open it', 'err');
    } else if (gs === 'rescrew') {
      this._doCloseCover();
    } else if (gs === 'breaker_on') {
      if (raycaster.intersectObjects([bkHandle], true).length) this._doBreaker(false);
      else this._showToast('Tap the breaker panel to switch it back ON!', 'err');
    } else if (gs === 'test') {
      if (this._selectedTool !== 'multimeter') { this._showToast('Select the Multimeter tool first!', 'err'); return; }
      if (raycaster.intersectObject(facePlate, false).length) this._doTest();
      else this._showToast('Point the multimeter at the outlet and tap', 'err');
    }
  }

  // ── GAME ACTIONS ─────────────────────────────────────────────

  _animateCam(toPos, toLook, dur, cb) {
    const { camera, camFrom, camTo, camLookFrom, camLookTo } = this._three;
    camFrom.copy(camera.position);
    camTo.copy(toPos);
    const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    camLookFrom.copy(camera.position).addScaledVector(dir, 5);
    camLookTo.copy(toLook);
    this._three.camT = 0; this._three.camDur = dur; this._three.camCB = cb; this._three.camTweening = true;
  }

  _doBreaker(goingOff) {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast(goingOff ? 'Switching breaker OFF...' : 'Switching breaker back ON...', 'ok');
    this._animateCam(new THREE.Vector3(-1.4, 0.55, 5.6), new THREE.Vector3(this._three.bkHandle.position.x, this._three.bkHandle.position.y, 0), 900, () => {
      this._bkGoingOff = goingOff; this._bkAnimT = 0; this._bkAnimating = true;
      this._bkCB = goingOff ? () => this._afterBreakerOff() : () => this._afterBreakerOn();
    });
  }

  _afterBreakerOff() {
    this._completeTask(1, 12);
    this._showToast('Breaker OFF — Safe to work! Now remove the cover screw.', 'ok');
    this._setInstr('<span class="ol-snum">STEP 2</span>Select <span>Screwdriver</span> then tap the center <span>screw</span> on the outlet');
    this._enableTool('screwdriver'); this._selectTool('screwdriver');
    this._setTut(this._three.screwHead, 'TAP SCREW');
    this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0,0,0), 800, () => { this._gameState = 'screw'; });
  }

  _afterBreakerOn() {
    this._completeTask(7, 88);
    this._showToast('Breaker ON! Test the outlet with the multimeter.', 'ok');
    this._setInstr('<span class="ol-snum">STEP 8</span>Select <span>Multimeter</span> then tap the <span>outlet</span> to test voltage');
    this._enableTool('multimeter'); this._selectTool('multimeter');
    this._setTut(this._three.facePlate, 'TAP OUTLET');
    this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0,0,0), 800, () => { this._gameState = 'test'; });
  }

  _doRemoveScrew() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Removing cover screw...', 'ok');
    this._animateCam(new THREE.Vector3(0.3, 1.1, 3.2), new THREE.Vector3(0, 0.92, 0), 900, () => {
      this._screwRemoving = true; this._screwSpinT = 0;
    });
  }

  _doOpenCover() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Opening outlet cover...', 'ok');
    this._animateCam(new THREE.Vector3(-3.5, 2.2, 4.0), new THREE.Vector3(0, 0.2, 0), 1100, () => {
      this._coverOpening = true; this._coverOpenT = 0;
    });
  }

  _doCloseCover() {
    this._gameState = 'animating'; this._setTut(null);
    this._showToast('Closing outlet cover...', 'ok');
    this._animateCam(new THREE.Vector3(-2.8, 1.8, 4.2), new THREE.Vector3(0, 0.3, 0), 900, () => {
      this._coverClosing = true; this._coverCloseT = 0;
    });
  }

  _doTest() {
    this._gameState = 'animating'; this._setTut(null);
    this._animateCam(new THREE.Vector3(0.3, 0.3, 3.5), new THREE.Vector3(0, 0.2, 0), 700, () => {
      const ro = this._$('ol-reading'), rv = this._$('ol-rd-val');
      ro.classList.add('show'); rv.textContent = '---';
      const steps = ['---','12V','85V','154V','199V','216V','220V'];
      let ri = 0;
      const iv = setInterval(() => {
        if (ri < steps.length) { rv.textContent = steps[ri]; ri++; }
        if (ri >= steps.length) {
          clearInterval(iv);
          setTimeout(() => {
            ro.classList.remove('show');
            this._completeTask(8, 100);
            this._gameState = 'done';
            if (this._timerRunning) { clearInterval(this._timerIv); this._timerRunning = false; }
            this._showToast('220V AC — Outlet working perfectly!', 'ok');
            this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0,0,0), 1200, () => {
              setTimeout(() => {
                Database.saveLearnStage('outlet');
                Database.completeLesson('outlet');
                this._$('ol-success').classList.add('show');
              }, 700);
            });
          }, 700);
        }
      }, 220);
    });
  }

  // ── DRAG-DROP WIRES ──────────────────────────────────────────

  _setupDragDrop(el) {
    const colors = ['brown', 'blue', 'green'];
    let dragging = null;

    // Desktop drag-drop
    colors.forEach(c => {
      const drag = el.querySelector(`#ol-wd-${c}`);
      if (drag) {
        drag.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c); dragging = c; });
        drag.addEventListener('dragend', () => { dragging = null; });
      }
      const term = el.querySelector(`#ol-wt-${c}`);
      if (term) {
        term.addEventListener('dragover', e => e.preventDefault());
        term.addEventListener('drop', e => { e.preventDefault(); const wc = e.dataTransfer.getData('text/plain'); this._connectWire(wc, c); });
        // Tap-to-connect fallback (two-tap)
        term.addEventListener('click', () => {
          if (dragging) { this._connectWire(dragging, c); dragging = null; }
        });
      }
    });

    // Touch drag (two-tap: tap wire → tap terminal)
    let touchWire = null;
    colors.forEach(c => {
      const drag = el.querySelector(`#ol-wd-${c}`);
      if (drag) {
        drag.addEventListener('click', () => {
          if (this._wiresState[c]) return;
          touchWire = c;
          el.querySelectorAll('.ol-wire-drag').forEach(d => d.style.outline = '');
          drag.style.outline = '2px solid #F5C518';
        });
      }
      const term = el.querySelector(`#ol-wt-${c}`);
      if (term) {
        term.addEventListener('click', () => {
          if (touchWire) { this._connectWire(touchWire, c); touchWire = null; el.querySelectorAll('.ol-wire-drag').forEach(d => d.style.outline = ''); }
        });
      }
    });
  }

  _connectWire(wireColor, termColor) {
    if (wireColor !== termColor) {
      const term = this._$(`ol-wt-${termColor}`);
      if (term) { term.classList.add('reject'); setTimeout(() => term.classList.remove('reject'), 400); }
      this._showToast('Wrong terminal! Match the wire color to the terminal.', 'err');
      return;
    }
    if (this._wiresState[wireColor]) return;
    this._wiresState[wireColor] = true;

    const drag = this._$(`ol-wd-${wireColor}`);
    if (drag) drag.classList.add('used');
    const term = this._$(`ol-wt-${wireColor}`);
    if (term) {
      const bgMap = { brown:'#92400e', blue:'#1d4ed8', green:'#166534' };
      term.style.background = bgMap[wireColor];
      term.style.color = '#fff'; term.style.borderStyle = 'solid'; term.textContent = '✓';
    }

    // Update 3D wire
    const wireNames = ['brown','blue','green'];
    const wireColors3D = [0xb45309, 0x3b82f6, 0x22c55e];
    const idx = wireNames.indexOf(wireColor);
    const { outletRoot, terminalMeshes, wireMeshes } = this._three;
    const termX = terminalMeshes[idx].x;
    outletRoot.remove(wireMeshes[idx]);
    const pts = [
      new THREE.Vector3(termX, 0, -0.42), new THREE.Vector3(termX, -0.25, -0.2),
      new THREE.Vector3(termX + (Math.random()-.5)*.3, -0.7, 0.05),
      new THREE.Vector3(termX + (Math.random()-.5)*.2, -1.2, 0.0)
    ];
    const cw = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.038, 8, false),
      new THREE.MeshStandardMaterial({ color:wireColors3D[idx], roughness:0.55, metalness:0.05 })
    );
    outletRoot.add(cw); wireMeshes[idx] = cw;
    terminalMeshes[idx].glowMesh.material.color.setHex(wireColors3D[idx]);
    terminalMeshes[idx].glowMesh.material.emissive = new THREE.Color(wireColors3D[idx]);
    terminalMeshes[idx].glowMesh.material.emissiveIntensity = 0.8;

    const pctMap = { brown:54, blue:62, green:70 };
    this._showToast(`${wireColor.charAt(0).toUpperCase() + wireColor.slice(1)} wire connected ✓`, 'ok');
    this._setPct(pctMap[wireColor]);
    this._three.damageLight.intensity = Math.max(0, 0.9 - Object.values(this._wiresState).filter(Boolean).length * 0.3);

    if (this._wiresState.brown && this._wiresState.blue && this._wiresState.green) {
      this._three.damageLight.intensity = 0;
      setTimeout(() => {
        this._completedTasks++;
        const t5 = this._$('ol-t5'); if (t5) { t5.classList.remove('active'); t5.classList.add('done'); }
        const t6 = this._$('ol-t6'); if (t6) t6.classList.add('active');
        this._$('ol-done-count').textContent = this._completedTasks;
        this._setPct(75);
        this._$('ol-wire-panel').style.display = 'none';
        this._$('ol-wire-panel').classList.remove('hi');
        this._setInstr('<span class="ol-snum">STEP 6</span>All wires connected! Tap the <span>outlet area</span> to close the cover');
        this._setTut(this._three.jBox, 'TAP TO CLOSE');
        this._gameState = 'rescrew';
        this._animateCam(new THREE.Vector3(0.8, 0.4, 5.5), new THREE.Vector3(0, 0.2, 0), 700, () => {});
      }, 900);
    }
  }

  // ── RENDER LOOP ──────────────────────────────────────────────

  _startLoop() {
    const { renderer, scene, camera } = this._three;
    let prev = performance.now();

    const tick = () => {
      if (!this._renderer) return;
      this._animId = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - prev) * 0.001, 0.05);
      prev = now;
      this._idleT = (this._idleT || 0) + dt;
      this._damageLightT = (this._damageLightT || 0) + dt;
      this._update(dt);
      renderer.render(scene, camera);
    };
    tick();
  }

  _update(dt) {
    const T = this._three;
    if (!T) return;
    const { outletRoot, faceGroup, internalGroup, wireMeshes, screwGroup, damageLight,
            bkHandle, bkHandleMat, bkLEDMat, HANDLE_ON_Y, HANDLE_OFF_Y, camera,
            camFrom, camTo, camLookFrom, camLookTo } = T;

    // Idle float
    outletRoot.position.y = Math.sin(this._idleT * 0.55) * 0.035;
    outletRoot.rotation.z = Math.sin(this._idleT * 0.35) * 0.006;
    outletRoot.rotation.x = Math.sin(this._idleT * 0.28) * 0.005 + 0.04;

    // Damage light pulse
    if (internalGroup.visible && damageLight.intensity > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(this._damageLightT * 3.5);
      damageLight.intensity = 0.9 * pulse;
      damageLight.color.setHSL(0.06 - pulse * 0.04, 1.0, 0.5);
    }

    // Camera tween
    if (T.camTweening) {
      T.camT += dt * 1000;
      const p = eio3(Math.min(T.camT / T.camDur, 1));
      camera.position.lerpVectors(camFrom, camTo, p);
      camera.lookAt(new THREE.Vector3().lerpVectors(camLookFrom, camLookTo, p));
      if (T.camT >= T.camDur) { T.camTweening = false; if (T.camCB) { const cb = T.camCB; T.camCB = null; cb(); } }
    }

    // Breaker animation
    if (this._bkAnimating) {
      this._bkAnimT += dt * 2.8;
      const p = eio3(Math.min(this._bkAnimT, 1));
      const fromY = this._bkGoingOff ? HANDLE_ON_Y : HANDLE_OFF_Y;
      const toY   = this._bkGoingOff ? HANDLE_OFF_Y : HANDLE_ON_Y;
      bkHandle.position.y = fromY + (toY - fromY) * p;
      if (this._bkAnimT >= 1) {
        this._bkAnimating = false;
        bkHandle.position.y = toY;
        if (this._bkGoingOff) {
          bkHandleMat.color.setHex(0xef4444); bkLEDMat.color.setHex(0xef4444);
          bkLEDMat.emissive.setHex(0x881111); bkLEDMat.emissiveIntensity = 0.55;
        } else {
          bkHandleMat.color.setHex(0x22c55e); bkLEDMat.color.setHex(0x22c55e);
          bkLEDMat.emissive.setHex(0x22c55e); bkLEDMat.emissiveIntensity = 1.0;
        }
        if (this._bkCB) { const cb = this._bkCB; this._bkCB = null; cb(); }
      }
    }

    // Screw removal
    if (this._screwRemoving) {
      this._screwSpinT += dt * 5.5;
      screwGroup.rotation.z = this._screwSpinT;
      screwGroup.position.z = this._screwSpinT * 0.09;
      screwGroup.position.y = this._screwSpinT * 0.03;
      if (this._screwSpinT > Math.PI * 5) {
        this._screwRemoving = false; screwGroup.visible = false;
        this._completeTask(2, 24);
        this._showToast('Screw removed! Now tap the outlet cover to open it.', 'ok');
        this._setInstr('<span class="ol-snum">STEP 3</span>Tap the <span>outlet cover</span> to open it');
        this._setTut(T.facePlate, 'TAP COVER');
        this._animateCam(new THREE.Vector3(-1.8, 1.4, 5.2), new THREE.Vector3(0, 0.4, 0), 700, () => { this._gameState = 'open'; });
      }
    }

    // Cover opening
    if (this._coverOpening) {
      this._coverOpenT += dt * 1.4;
      const p = Math.min(this._coverOpenT, 1);
      faceGroup.rotation.x = eio3(p) * 1.95;
      if (this._coverOpenT >= 1) {
        this._coverOpening = false; faceGroup.visible = false; internalGroup.visible = true;
        wireMeshes.forEach(w => w.visible = true); damageLight.intensity = 0.9; this._damageLightT = 0;
        this._completeTask(3, 36);
        this._showToast('Cover open! Inspecting wiring...', 'ok');
        this._setInstr('<span class="ol-snum">STEP 4</span>Inspecting wires — connections are <span>damaged</span>');
        this._setTut(null);
        this._inspecting = true; this._inspectT = 0;
        this._animateCam(new THREE.Vector3(0.2, 0.5, 3.6), new THREE.Vector3(0, -0.25, 0), 1000, () => {});
      }
    }

    // Inspect auto-advance
    if (this._inspecting) {
      this._inspectT += dt;
      if (this._inspectT > 0.8 && this._inspectT < 0.82) {
        this._animateCam(new THREE.Vector3(-0.1, -0.4, 2.6), new THREE.Vector3(0, -0.5, 0), 900, () => {});
      }
      if (this._inspectT >= 2.5) {
        this._inspecting = false;
        this._completeTask(4, 48);
        this._showToast('Wires disconnected — match wire color to terminal.', 'info');
        this._$('ol-wire-panel').style.display = 'block';
        this._$('ol-wire-panel').classList.add('hi');
        this._$('ol-instr').style.display = 'none';
        this._gameState = 'wires';
        this._animateCam(new THREE.Vector3(0.3, 2.2, 5.0), new THREE.Vector3(0, -0.1, 0), 900, () => {});
      }
    }

    // Cover closing
    if (this._coverClosing) {
      this._coverCloseT += dt * 1.2;
      const p = Math.min(this._coverCloseT, 1);
      faceGroup.visible = true; faceGroup.rotation.x = (1 - eio3(p)) * 1.95;
      if (this._coverCloseT >= 1) {
        this._coverClosing = false; faceGroup.rotation.x = 0; faceGroup.position.set(0, -0.9, 0);
        internalGroup.visible = false; wireMeshes.forEach(w => w.visible = false); damageLight.intensity = 0;
        screwGroup.visible = true; screwGroup.position.set(0, 0.925, 0.6); screwGroup.rotation.z = Math.PI * 9;
        this._screwReattach = true; this._screwReattachT = 0;
        this._animateCam(new THREE.Vector3(0.2, 0.95, 3.0), new THREE.Vector3(0, 0.92, 0), 600, () => {});
      }
    }

    // Screw reattach
    if (this._screwReattach) {
      this._screwReattachT += dt * 4;
      const prog = Math.min(this._screwReattachT / 3.5, 1);
      screwGroup.rotation.z = (1 - eio3(prog)) * Math.PI * 9;
      screwGroup.position.z = (1 - eio3(prog)) * 0.6;
      screwGroup.position.y = 0.925;
      if (this._screwReattachT >= 3.5) {
        this._screwReattach = false; screwGroup.rotation.z = 0; screwGroup.position.set(0, 0.925, 0);
        this._completeTask(6, 82);
        this._showToast('Outlet closed! Turn the breaker back ON.', 'ok');
        this._setInstr('<span class="ol-snum">STEP 7</span>Find the <span>breaker panel</span> on the left — switch it back <span>ON</span>');
        this._setTut(bkHandle, 'TAP BREAKER');
        this._animateCam(new THREE.Vector3(1.2, 0.8, 6.5), new THREE.Vector3(0,0,0), 1200, () => { this._gameState = 'breaker_on'; });
      }
    }

    this._updateTutorial();
  }

  // ── TIMER ────────────────────────────────────────────────────

  _startTimer() {
    if (this._timerRunning) return;
    this._timerRunning = true;
    this._timerIv = setInterval(() => {
      if (!this._timerRunning) { clearInterval(this._timerIv); return; }
      this._timerVal = Math.max(0, this._timerVal - 1);
      const m = Math.floor(this._timerVal / 60).toString().padStart(2, '0');
      const s = (this._timerVal % 60).toString().padStart(2, '0');
      const el = this._$('ol-timer');
      if (el) el.textContent = m + ':' + s;
    }, 1000);
  }

  // ── LIFECYCLE ────────────────────────────────────────────────

  onShow() {
    this._resetState();
    this._initDOMReset();
    setTimeout(() => this._initThree(), 80);
    this._startTimer();
  }

  _initDOMReset() {
    this._setPct(0);
    this._$('ol-done-count').textContent = '0';
    for (let i = 1; i <= 8; i++) {
      const el = this._$(`ol-t${i}`);
      if (el) { el.classList.remove('done', 'active'); if (i === 1) el.classList.add('active'); }
    }
    this._$('ol-wire-panel').style.display = 'none';
    this._$('ol-wire-panel').classList.remove('hi');
    this._$('ol-instr').style.display = 'block';
    this._$('ol-instr').innerHTML = '<span class="ol-snum">STEP 1</span>Find the <span>breaker panel</span> on the left wall — tap to switch it <span>OFF</span> before working';
    this._$('ol-success').classList.remove('show');
    this._$('ol-reading').classList.remove('show');
    ['screwdriver','multimeter'].forEach(t => {
      const s = this._$(`ol-tool-${t}`);
      if (s) { s.classList.add('disabled'); s.classList.remove('active'); }
    });
    ['brown','blue','green'].forEach(c => {
      const drag = this._$(`ol-wd-${c}`);
      if (drag) drag.classList.remove('used');
      const term = this._$(`ol-wt-${c}`);
      if (term) {
        const col = { brown:'#b45309', blue:'#3b82f6', green:'#22c55e' }[c];
        const lbl = { brown:'L', blue:'N', green:'E' }[c];
        term.style.background = ''; term.style.color = col; term.style.borderStyle = 'dashed'; term.textContent = lbl;
      }
    });
    this._$('ol-timer').textContent = '05:00';
  }

  _cleanup() {
    if (this._timerIv)    { clearInterval(this._timerIv); this._timerIv = null; this._timerRunning = false; }
    if (this._animId)     { cancelAnimationFrame(this._animId); this._animId = null; }
    if (this._resizeObs)  { this._resizeObs.disconnect(); this._resizeObs = null; }
    if (this._renderer)   { this._renderer.dispose(); this._renderer = null; this._three = null; }
  }

  onHide() {
    this._cleanup();
  }
}

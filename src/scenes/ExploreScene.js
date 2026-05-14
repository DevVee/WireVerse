import * as THREE from 'three';
import { Database }      from '../systems/Database.js';
import { SoundManager }  from '../systems/SoundManager.js';

// ── WORLD CONSTANTS ───────────────────────────────────────────────────────────
const FLOOR_Y = 0;
const H       = 4.2;   // ceiling height
const WT      = 0.22;  // wall thickness
const BASE_Y  = 1.72;  // eye height
const SPAWN     = new THREE.Vector3(0, BASE_Y, 5);
const SPAWN_YAW = Math.PI;

const OUTLET_DEFS = [
  { id: 1, pos: new THREE.Vector3(-7.97, 1.2,  3),    label: 'Entrance West'   },
  { id: 2, pos: new THREE.Vector3( 7.97, 1.2,  0),    label: 'Entrance East'   },
  { id: 3, pos: new THREE.Vector3(-7.97, 1.2, -8),    label: 'Workshop A West' },
  { id: 4, pos: new THREE.Vector3( 7.97, 1.2,-14),    label: 'Workshop A East' },
  { id: 5, pos: new THREE.Vector3( 0,    1.2,-31.97), label: 'Workshop B North'},
  { id: 6, pos: new THREE.Vector3(-7.97, 1.2,-20),    label: 'Workshop B West' },
  { id: 7, pos: new THREE.Vector3( 7.97, 1.2,-28),    label: 'Workshop B East' },
];
const SWITCH_DEFS = [
  { id: 1, pos: new THREE.Vector3(-7.97, 1.5, -5),   label: 'Workshop A Station 1' },
  { id: 2, pos: new THREE.Vector3( 7.97, 1.5,-22),   label: 'Workshop B Station 2' },
  { id: 3, pos: new THREE.Vector3(-7.97, 1.5,-28),   label: 'Workshop B Station 3' },
  { id: 4, pos: new THREE.Vector3( 7.97, 1.5, -2),   label: 'Entrance Station 4'   },
  { id: 5, pos: new THREE.Vector3(-7.97, 1.5,-20),   label: 'Workshop B Station 5' },
];
// ─────────────────────────────────────────────────────────────────────────────

export class ExploreScene {
  constructor(state, root, guide = null) {
    this.state  = state;
    this.root   = root;
    this._guide = guide;
    this._raf   = null;
    this._listeners = [];

    const saved = Database.getExploreProgress();

    this._player = {
      pos: SPAWN.clone(), yaw: SPAWN_YAW, pitch: 0,
      yawVel: 0, pitchVel: 0,
      vel: new THREE.Vector3(), vy: 0, grounded: false,
    };

    this._keys   = {};
    this._joy    = { x: 0, y: 0 };
    this._joyId  = -1;
    this._lookTouches = {};
    this._pointerLocked = false;
    this._repairOpen    = false;
    this._bobT = 0; this._bobAmt = 0;

    this._outlets  = OUTLET_DEFS.map(d => ({ ...d, fixed: !!saved.outlets[d.id]  }));
    this._switches = SWITCH_DEFS.map(d => ({ ...d, fixed: !!saved.switches[d.id] }));
    this._nearest  = null;
    this._guideTipsFired = {};

    this._colBoxes = [];
    this._isMob    = navigator.maxTouchPoints > 0;

    this._htmlRepairEl    = null;

    SoundManager.init();
    this._initThree();
    this._buildWorld();
    this._buildInteractables();
    this._setupInput();
    this._startLoop();
    this._updateScoreHUD();
    SoundManager.startAmbient();
  }

  // ── THREE INIT ────────────────────────────────────────────────────────────────
  _initThree() {
    const canvas = this.root.querySelector('#ex-canvas');
    const isMob  = this._isMob;

    this._renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMob,
      powerPreference: 'high-performance',
    });
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, isMob ? 1.5 : 2));
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = isMob ? 2.6 : 2.2;
    this._renderer.shadowMap.enabled = !isMob;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x0e1624);
    if (isMob) {
      this._scene.fog = new THREE.Fog(0x0e1624, 22, 52);
    } else {
      this._scene.fog = new THREE.FogExp2(0x0e1624, 0.016);
    }

    // PMREM env map (desktop only)
    if (!isMob) {
      try {
        const pmrem = new THREE.PMREMGenerator(this._renderer);
        pmrem.compileCubemapShader();
        const envSc = new THREE.Scene();
        const mkEnvMesh = (w, h, d, color, px, py, pz) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshBasicMaterial({ color }));
          m.position.set(px, py, pz);
          envSc.add(m);
        };
        mkEnvMesh(120, 2, 120, 0x0a0e1a,  0,   0,  0);
        mkEnvMesh(120, 2, 120, 0x0a0e1a,  0,  20,  0);
        mkEnvMesh(2,  60, 2,   0x1a2a44, 18,   0,-10);
        mkEnvMesh(120, 2, 120, 0x08100e,  0, -20,  0);
        const envTex = pmrem.fromScene(envSc);
        this._scene.environment = envTex.texture;
        pmrem.dispose();
      } catch(e) {
        // env map optional — silently skip if generation fails
      }
    }

    this._camera = new THREE.PerspectiveCamera(72, 1, 0.1, isMob ? 40 : 120);
    this._camera.position.copy(SPAWN);
    this._clock  = new THREE.Clock();

    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(this.root);
    this._onResize();
  }

  _onResize() {
    const w = this.root.clientWidth, h = this.root.clientHeight;
    if (!w || !h) return;
    this._renderer.setSize(w, h);
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
  }

  // ── TEXTURE HELPERS ───────────────────────────────────────────────────────────
  _mkTex(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = this._isMob ? 8 : 16;
    return t;
  }

  _heightToNormal(hCanvas, strength = 3.0) {
    const W = hCanvas.width, H2 = hCanvas.height;
    const src = hCanvas.getContext('2d').getImageData(0,0,W,H2).data;
    const out = document.createElement('canvas'); out.width = W; out.height = H2;
    const ctx = out.getContext('2d');
    const dst = ctx.createImageData(W, H2);
    const g = (px, py) => src[((py%H2+H2)%H2*W+(px%W+W)%W)*4] / 255;
    for (let y = 0; y < H2; y++) {
      for (let x = 0; x < W; x++) {
        const dX = (-g(x-1,y-1)+g(x+1,y-1)) + (-2*g(x-1,y)+2*g(x+1,y)) + (-g(x-1,y+1)+g(x+1,y+1));
        const dY = (-g(x-1,y-1)-2*g(x,y-1)-g(x+1,y-1)) + (g(x-1,y+1)+2*g(x,y+1)+g(x+1,y+1));
        let nx=dX*strength, ny=dY*strength, nz=1;
        const l = Math.sqrt(nx*nx+ny*ny+nz*nz);
        const i = (y*W+x)*4;
        dst.data[i]  = ((nx/l)*.5+.5)*255|0;
        dst.data[i+1]= ((ny/l)*.5+.5)*255|0;
        dst.data[i+2]= ((nz/l)*.5+.5)*255|0;
        dst.data[i+3]= 255;
      }
    }
    ctx.putImageData(dst, 0, 0);
    return this._mkTex(out);
  }

  _makeFloorTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    // Dark concrete base — visible but not black
    x.fillStyle = '#18202e'; x.fillRect(0,0,512,512);
    // Subtle concrete noise
    for (let i = 0; i < 2000; i++) {
      const gx = Math.random()*512, gy = Math.random()*512;
      const v = (Math.random()-.5)*14;
      const b = 30+v|0;
      x.fillStyle = `rgba(${b},${b+2},${b+4},.22)`;
      x.fillRect(gx, gy, 1+Math.random()*2, 1+Math.random()*2);
    }
    // Large tile grid
    const ts = 128, grout = 2;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tx = col*ts+grout, ty = row*ts+grout, tw = ts-grout*2, th = ts-grout*2;
        const v = (Math.random()-.5)*8;
        const b = 28+v|0;
        x.fillStyle = `rgb(${b},${b+3},${b+8})`; x.fillRect(tx,ty,tw,th);
        const gr = x.createRadialGradient(tx+tw/2,ty+th/2,4,tx+tw/2,ty+th/2,tw*.6);
        gr.addColorStop(0,'rgba(0,212,255,.04)');
        gr.addColorStop(1,'rgba(0,0,0,0)');
        x.fillStyle = gr; x.fillRect(tx,ty,tw,th);
      }
    }
    // Red grid lines
    x.strokeStyle = 'rgba(0,212,255,.28)'; x.lineWidth = grout;
    for (let i = 0; i <= 512; i += ts) {
      x.beginPath(); x.moveTo(i,0); x.lineTo(i,512); x.stroke();
      x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke();
    }
    // Red node dots at grid intersections
    x.fillStyle = 'rgba(0,212,255,.45)';
    for (let i = 0; i <= 512; i += ts) {
      for (let j = 0; j <= 512; j += ts) {
        x.beginPath(); x.arc(i,j,2.5,0,Math.PI*2); x.fill();
      }
    }
    const t = this._mkTex(c); t.repeat.set(8,8);
    return t;
  }

  _makeWallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    // Dark panel base — visible charcoal
    x.fillStyle = '#1c2535'; x.fillRect(0,0,512,512);
    // Metal panel grid
    const pH = 128, pW = 256, gap = 3;
    for (let row = 0; row*pH < 512; row++) {
      for (let col = 0; col*pW < 512; col++) {
        const px = col*pW+gap, py = row*pH+gap, pw = pW-gap*2, ph = pH-gap*2;
        const v = (Math.random()-.5)*8;
        const b = 30+v|0;
        x.fillStyle = `rgb(${b},${b+4},${b+10})`; x.fillRect(px,py,pw,ph);
        const gr = x.createLinearGradient(px,py,px,py+ph);
        gr.addColorStop(0,'rgba(255,255,255,.06)');
        gr.addColorStop(.5,'rgba(0,0,0,0)');
        gr.addColorStop(1,'rgba(0,0,0,.05)');
        x.fillStyle = gr; x.fillRect(px,py,pw,ph);
        // Red panel edge highlight
        x.strokeStyle = 'rgba(0,212,255,.10)'; x.lineWidth = 1;
        x.strokeRect(px+.5,py+.5,pw-1,ph-1);
      }
    }
    // Gap lines (dark seam)
    x.fillStyle = '#101520';
    for (let row = 0; row*pH <= 512; row++) x.fillRect(0,row*pH,512,gap);
    for (let col = 0; col*pW <= 512; col++) x.fillRect(col*pW,0,gap,512);
    // Red LED accent strip at top and bottom
    x.strokeStyle = 'rgba(0,212,255,.30)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0,1); x.lineTo(512,1); x.stroke();
    x.beginPath(); x.moveTo(0,511); x.lineTo(512,511); x.stroke();
    const t = this._mkTex(c); t.repeat.set(4,2);
    return t;
  }

  _makeCeilTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    // Visible dark metal ceiling
    x.fillStyle = '#161e2c'; x.fillRect(0,0,256,256);
    const gs = 64;
    // Exposed metal panel grid
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
      const px = col*gs+1, py = row*gs+1, pw = gs-2, ph = gs-2;
      const v = (Math.random()-.5)*6;
      const b = 24+v|0;
      x.fillStyle = `rgb(${b},${b+3},${b+7})`; x.fillRect(px,py,pw,ph);
    }
    // Red grid lines
    x.strokeStyle = 'rgba(0,212,255,.20)'; x.lineWidth = 1.5;
    for (let i = 0; i <= 256; i += gs) {
      x.beginPath(); x.moveTo(i,0); x.lineTo(i,256); x.stroke();
      x.beginPath(); x.moveTo(0,i); x.lineTo(256,i); x.stroke();
    }
    // Corner rivet dots
    x.fillStyle = 'rgba(0,212,255,.35)';
    for (let i = 0; i <= 256; i += gs) {
      for (let j = 0; j <= 256; j += gs) {
        x.beginPath(); x.arc(i,j,2,0,Math.PI*2); x.fill();
      }
    }
    const t = this._mkTex(c); t.repeat.set(8,8);
    return t;
  }

  _makeConcrTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    // Dark poured concrete — structural walls
    x.fillStyle = '#0f141e'; x.fillRect(0,0,512,512);
    for (let i = 0; i < 3000; i++) {
      const gx = Math.random()*512, gy = Math.random()*512;
      const v = (Math.random()-.5)*12;
      const b = 18+v|0;
      x.fillStyle = `rgba(${b},${b},${b},.22)`;
      x.fillRect(gx, gy, 1+Math.random()*3, 1+Math.random()*3);
    }
    // Formwork lines
    x.strokeStyle = 'rgba(0,30,60,.55)'; x.lineWidth = 1.5;
    for (let y = 0; y < 512; y += 128) { x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke(); }
    for (let xi = 0; xi < 512; xi += 128) { x.beginPath();x.moveTo(xi,0);x.lineTo(xi,512);x.stroke(); }
    const t = this._mkTex(c); t.repeat.set(4,2);
    return t;
  }

  _makeMetalTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const gr=x.createLinearGradient(0,0,0,256);
    gr.addColorStop(0,'#b0bcc8'); gr.addColorStop(.5,'#d0dce8'); gr.addColorStop(1,'#9aacbc');
    x.fillStyle=gr; x.fillRect(0,0,256,256);
    x.strokeStyle='rgba(255,255,255,.25)'; x.lineWidth=1;
    for (let i=0;i<256;i+=4) { x.beginPath();x.moveTo(0,i);x.lineTo(256,i);x.stroke(); }
    const t = this._mkTex(c); t.repeat.set(2,2);
    return t;
  }

  // ── WORLD BUILDER ─────────────────────────────────────────────────────────────
  _buildWorld() {
    const isMob = this._isMob;
    const scene = this._scene;

    // Textures
    const fT = this._makeFloorTex();
    const wT = this._makeWallTex();
    const cT = this._makeCeilTex();
    const kT = this._makeConcrTex();
    const mT = this._makeMetalTex();

    // Normal maps (desktop only)
    let fN=null, wN=null, mN=null;
    if (!isMob) {
      const fH = document.createElement('canvas'); fH.width=fH.height=512;
      const fX=fH.getContext('2d'); fX.fillStyle='#666'; fX.fillRect(0,0,512,512);
      for (let i=0;i<=512;i+=128){ fX.strokeStyle='rgba(0,0,0,.5)'; fX.lineWidth=3;
        fX.beginPath(); fX.moveTo(i,0); fX.lineTo(i,512); fX.stroke();
        fX.beginPath(); fX.moveTo(0,i); fX.lineTo(512,i); fX.stroke(); }
      fN = this._heightToNormal(fH, 2.5); fN.repeat.set(8,8);

      const wH = document.createElement('canvas'); wH.width=wH.height=512;
      const wX=wH.getContext('2d'); wX.fillStyle='#888'; wX.fillRect(0,0,512,512);
      for (let r=0;r*48<512;r++) {
        const off=(r%2===0)?0:64;
        for (let col=-1;col*128+off<512;col++) { wX.fillStyle='rgba(0,0,0,.35)';
          wX.fillRect(col*128+off,r*48,4,48); wX.fillRect(col*128+off,r*48,128,4); }
      }
      wN = this._heightToNormal(wH, 3.0); wN.repeat.set(4,2);

      mN = this._makeMetalTex(); mN.repeat.set(2,2);
    }

    // ── MATERIALS ───────────────────────────────────────────────────────────────
    const _nv2 = (a,b) => new THREE.Vector2(a,b);
    this._M = {
      floor:    new THREE.MeshStandardMaterial({ map:fT, roughness:.75, metalness:.20, envMapIntensity:.6 }),
      wall:     new THREE.MeshStandardMaterial({ map:wT, roughness:.88, metalness:.05, envMapIntensity:.3 }),
      ceil:     new THREE.MeshStandardMaterial({ map:cT, roughness:.85, metalness:.15, envMapIntensity:.25 }),
      concrete: new THREE.MeshStandardMaterial({ map:kT, color:0x283848, roughness:.92, metalness:.05, envMapIntensity:.25 }),
      door:     new THREE.MeshStandardMaterial({ color:0x1a3050, roughness:.55, metalness:.55, envMapIntensity:.6 }),
      doorFrame:new THREE.MeshStandardMaterial({ map:mT, color:0x3a5a78, roughness:.14, metalness:.95, envMapIntensity:.9 }),
      panel:    new THREE.MeshStandardMaterial({ color:0x0e1c2e, roughness:.48, metalness:.45, envMapIntensity:.6 }),
      panelGrey:new THREE.MeshStandardMaterial({ map:mT, color:0x1e2c3c, roughness:.38, metalness:.58, envMapIntensity:.7 }),
      yellow:   new THREE.MeshStandardMaterial({ color:0xf0c060, emissive:new THREE.Color(0xf0c060), emissiveIntensity:1.6, roughness:.45 }),
      red:      new THREE.MeshStandardMaterial({ color:0xdd4433, emissive:new THREE.Color(0xdd4433), emissiveIntensity:1.8, roughness:.40 }),
      green:    new THREE.MeshStandardMaterial({ color:0x00ff88, emissive:new THREE.Color(0x00ff88), emissiveIntensity:2.0, roughness:.40 }),
      orange:   new THREE.MeshStandardMaterial({ color:0xff8833, emissive:new THREE.Color(0xff8833), emissiveIntensity:1.6, roughness:.45 }),
      bench:    new THREE.MeshStandardMaterial({ color:0x1c2a3a, roughness:.82, metalness:.18, envMapIntensity:.3 }),
      black:    new THREE.MeshStandardMaterial({ color:0x0a0e18, roughness:.72, metalness:.22, envMapIntensity:.4 }),
      chrome:   new THREE.MeshStandardMaterial({ map:mT, color:0x8ab0cc, roughness:.04, metalness:1.0, envMapIntensity:1.6 }),
      pipe:     new THREE.MeshStandardMaterial({ map:mT, color:0x2a4a68, roughness:.12, metalness:.98, envMapIntensity:1.4 }),
      copper:   new THREE.MeshStandardMaterial({ color:0xd97845, roughness:.18, metalness:.96, envMapIntensity:1.2 }),
      eWhite:   new THREE.MeshBasicMaterial({ color:0x00d4ff }),
      eBlue:    new THREE.MeshBasicMaterial({ color:0x0066ff }),
      eGreen:   new THREE.MeshBasicMaterial({ color:0x00ff88 }),
      eRed:     new THREE.MeshBasicMaterial({ color:0xff3322 }),
      eYellow:  new THREE.MeshBasicMaterial({ color:0xffee00 }),
      window:   new THREE.MeshStandardMaterial({ color:0x001830, emissive:new THREE.Color(0x001840), emissiveIntensity:0.35, transparent:true, opacity:.38, roughness:.02, metalness:.12, envMapIntensity:.6, side:THREE.DoubleSide }),
      winFrame: new THREE.MeshStandardMaterial({ color:0x1a2a3c, roughness:.35, metalness:.55, envMapIntensity:.7 }),
    };
    const M = this._M;
    if (!isMob) {
      M.floor.normalMap     = fN; M.floor.normalScale     = _nv2(1.6,1.6);
      M.wall.normalMap      = wN; M.wall.normalScale      = _nv2(2.2,2.2);
      M.concrete.normalMap  = wN; M.concrete.normalScale  = _nv2(1.4,1.4);
      M.doorFrame.normalMap = mN; M.doorFrame.normalScale = _nv2(0.8,0.8);
      M.panelGrey.normalMap = mN; M.panelGrey.normalScale = _nv2(0.6,0.6);
      M.chrome.normalMap    = mN; M.chrome.normalScale    = _nv2(0.5,0.5);
      M.pipe.normalMap      = mN; M.pipe.normalScale      = _nv2(0.7,0.7);
    } else {
      Object.values(M).forEach(mat => {
        if (mat.isMeshStandardMaterial) {
          mat.normalMap = null; mat.envMapIntensity = 0;
          mat.metalness = 0; mat.roughness = Math.max(mat.roughness, 0.7);
        }
      });
    }

    // Workshop wall mats — visible dark tech panels
    const wsWallMat = new THREE.MeshStandardMaterial({
      map:wT, color:0x22303e, roughness:.88, metalness:.08, envMapIntensity:.30,
    });
    const ws2WallMat = new THREE.MeshStandardMaterial({
      map:wT, color:0x1e2a38, roughness:.90, metalness:.08, envMapIntensity:.25,
    });
    if (isMob) {
      wsWallMat.normalMap = null; ws2WallMat.normalMap = null;
      wsWallMat.envMapIntensity = 0; ws2WallMat.envMapIntensity = 0;
    }

    // ── LIGHTING — dark tech / control room industrial ───────────────────────────
    this._roomLightSets = {};

    // Strong ambient — whole space should be clearly visible
    scene.add(new THREE.AmbientLight(0x3a5070, isMob ? 2.0 : 1.5));
    if (!isMob) {
      scene.add(new THREE.HemisphereLight(0x304a6a, 0x101820, 1.0));
    } else {
      // Mobile gets extra fill since no env maps / normal maps
      scene.add(new THREE.AmbientLight(0x202840, 1.2));
    }

    // Key directional light — overhead industrial beam
    const sun = new THREE.DirectionalLight(0xc0d8f0, isMob ? 3.0 : 3.5);
    sun.position.set(4, 18, 2); sun.target.position.set(0, 0, -12);
    scene.add(sun); scene.add(sun.target);
    if (!isMob) {
      sun.castShadow = true;
      sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 65;
      sun.shadow.camera.left = sun.shadow.camera.bottom = -20;
      sun.shadow.camera.right = sun.shadow.camera.top   =  20;
      sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3.5;
    }

    // Fill light from opposite side
    const winFill = new THREE.DirectionalLight(0x607890, isMob ? 1.2 : 1.6);
    winFill.position.set(-10, 6, -5); winFill.target.position.set(0, 0, -10);
    scene.add(winFill); scene.add(winFill.target);

    // White area fill lights per room — bright industrial
    const addRoom = (x, y, z, color, int) => {
      const pl = new THREE.PointLight(color, int, 22, 1.3);
      pl.position.set(x,y,z); scene.add(pl);
    };
    addRoom(0,  3.6,   2,  0xd0e8ff, isMob ? 3.8 : 2.4);
    addRoom(-2, 3.6,  -8,  0xd0e8ff, isMob ? 3.5 : 2.2);
    addRoom( 3, 3.6, -14,  0xd0e8ff, isMob ? 3.5 : 2.2);
    addRoom( 0, 3.6, -22,  0xd0e8ff, isMob ? 3.2 : 2.0);
    addRoom( 0, 3.6, -28,  0xd0e8ff, isMob ? 3.2 : 2.0);
    // Extra mid-room fills for mobile
    if (isMob) {
      addRoom(-3, 2.0,   0,  0xb0c8e8, 2.0);
      addRoom( 3, 2.0, -13,  0xb0c8e8, 2.0);
      addRoom(-3, 2.0, -25,  0xb0c8e8, 2.0);
    }

    // ── ROOM FLOORS / CEILINGS ──────────────────────────────────────────────────
    const _mkRoom = (cx, cz, w, d) => {
      const SLAB = 0.16;
      const fl = this._mkBox(w, SLAB, d, M.floor);
      fl.position.set(cx, FLOOR_Y - SLAB/2, cz);
      fl.castShadow = false; fl.receiveShadow = !isMob;
      scene.add(fl); this._addCol(cx, FLOOR_Y-SLAB/2, cz, w, SLAB, d);
      const cl = this._mkBox(w, SLAB, d, M.ceil);
      cl.position.set(cx, H+SLAB/2, cz); scene.add(cl);
    };
    _mkRoom(0,  3,  16, 10);
    _mkRoom(0, -10, 16, 16);
    _mkRoom(0, -25, 16, 14);

    // ── OUTER WALLS (concrete) ──────────────────────────────────────────────────
    const OMY = H/2;
    // East walls
    this._mkWall( 8.11, OMY,   3, WT, H, 10.22, M.concrete);
    this._mkWall( 8.11, OMY, -10, WT, H, 16.22, wsWallMat);
    this._mkWall( 8.11, OMY, -25, WT, H, 14.22, ws2WallMat);
    // West walls
    this._mkWall(-8.11, OMY,   3, WT, H, 10.22, M.concrete);
    this._mkWall(-8.11, OMY, -10, WT, H, 16.22, wsWallMat);
    this._mkWall(-8.11, OMY, -25, WT, H, 14.22, ws2WallMat);
    // North sealed wall
    this._mkWall(0, OMY,  8.11, 16.22, H, WT, M.concrete);
    // South wall WS2
    this._mkWall(0, OMY, -32.11, 16.22, H, WT, ws2WallMat);
    // Inner divider walls (with doorway)
    this._wallDoor(-2,  -8, 8, 0, 1.8, M.concrete);
    this._wallDoor(-18, -8, 8, 0, 1.8, wsWallMat);

    // ── WINDOWS ─────────────────────────────────────────────────────────────────
    this._addWindow( 8.06, 2.4,   4, 3.2, 1.8, true);
    this._addWindow( 8.06, 2.2,  -6, 3.4, 2.0, true);
    this._addWindow( 8.06, 2.2, -14, 3.4, 2.0, true);
    this._addWindow(-8.06, 2.2,  -6, 3.4, 2.0, true);
    this._addWindow(-8.06, 2.2, -14, 3.4, 2.0, true);
    this._addWindow(-4,    2.2, -32.06, 3.2, 1.8, false);
    this._addWindow( 4,    2.2, -32.06, 3.2, 1.8, false);
    this._addWindow( 8.06, 2.2, -25, 3.4, 2.0, true);
    this._addWindow(-8.06, 2.2, -25, 3.4, 2.0, true);

    // ── DOORS ───────────────────────────────────────────────────────────────────
    this._doors = [
      this._mkDoor(1, 0, -2),
      this._mkDoor(2, 0, -18),
    ];

    // ── CEILING LIGHTS — bright white industrial panels ───────────────────────
    this._mkLight(0,  H-.2,   3, 0xffffff, 5.5, 'entrance');
    this._mkLight( 0, H-.2, -10, 0xffffff, 6.0, 'workshop');
    this._mkLight( 0, H-.2, -18, 0xffffff, 5.5, 'workshop');
    this._mkLight( 0, H-.2, -28, 0xffffff, 5.2, 'workshop');

    // ── CEILING CABLE TRAY (WS1) ─────────────────────────────────────────────────
    {
      const t = this._mkBox(16, .08, .38, M.panelGrey);
      t.position.set(0, H-.45, -10); scene.add(t);
      [-1,1].forEach(s => {
        const r = this._mkBox(16, .1, .04, M.panelGrey);
        r.position.set(0, H-.39, -10+s*.16); scene.add(r);
      });
    }


    // ── SAFETY POSTER (west wall entrance) ──────────────────────────────────────
    this._place(this._mkBox(.03, 1.5, 1.1, new THREE.MeshStandardMaterial({ color:0x0a1428, roughness:.9 })), -7.97, 2.0, 2);
    this._place(this._mkBox(.02, 1.58, 1.18, new THREE.MeshStandardMaterial({ color:0x001830, roughness:.5 })), -7.96, 2.0, 2);
    [0xff3322, 0x00d4ff, 0x00ff88].forEach((clr, i) => {
      this._place(this._mkBox(.02, .01, .82, new THREE.MeshBasicMaterial({ color:clr })), -7.95, 1.7+i*.28, 2);
    });

    // ── NOTICE BOARD (north wall) ────────────────────────────────────────────────
    this._place(this._mkBox(2.2, 1.3, .03, new THREE.MeshStandardMaterial({ color:0x091428, roughness:.9, emissive:new THREE.Color(0x001830), emissiveIntensity:.4 })), -2.0, 2.2, 7.97);

    // ── FIRE EXTINGUISHER ───────────────────────────────────────────────────────
    {
      const feCyl = new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,.52,8), M.red);
      feCyl.position.set(-7.5,.26,-1.0); scene.add(feCyl);
    }

    // ── WALL CLOCK (east wall entrance) ─────────────────────────────────────────
    if (!isMob) {
      const cf = new THREE.Mesh(new THREE.CircleGeometry(.22,24),
        new THREE.MeshStandardMaterial({ color:0x0a1428, emissive:new THREE.Color(0x001830), emissiveIntensity:.5, roughness:.8 }));
      cf.rotation.y = Math.PI/2; cf.position.set(7.88,2.4,7); scene.add(cf);
      const cr = new THREE.Mesh(new THREE.TorusGeometry(.22,.025,8,24),
        new THREE.MeshStandardMaterial({ color:0x00d4ff, emissive:new THREE.Color(0x00d4ff), emissiveIntensity:.8, roughness:.3, metalness:.9 }));
      cr.rotation.y = Math.PI/2; cr.position.set(7.87,2.4,7); scene.add(cr);
    }

    // ── RECEPTION DESK ───────────────────────────────────────────────────────────
    {
      const RX=-4, RZ=3.5;
      const dkM = new THREE.MeshStandardMaterial({ color:0x1a2840, roughness:.60, metalness:.45 });
      const dpM = new THREE.MeshStandardMaterial({ color:0x0f1a2c, roughness:.70, metalness:.40 });
      this._place(this._mkBox(2.4,.07,.9,dkM), RX, .82, RZ);
      this._addCol(RX,.42,RZ,2.4,.82,.9);
      this._place(this._mkBox(2.4,.78,.05,dpM), RX, .41, RZ+.43);
      this._place(this._mkBox(.05,.82,.9,dpM), RX-1.18,.41,RZ);
      this._place(this._mkBox(.05,.82,.9,dpM), RX+1.18,.41,RZ);
      // Monitor
      if (!isMob) {
        const screenM = new THREE.MeshStandardMaterial({ color:0x0a1f3a, emissive:new THREE.Color(0x153060), emissiveIntensity:1.3 });
        const sm = new THREE.Mesh(new THREE.PlaneGeometry(.62,.38), screenM);
        sm.position.set(RX,1.26,RZ-.196); scene.add(sm);
        const sGlow = new THREE.PointLight(0x2266ff,.7,3.0);
        sGlow.position.set(RX,1.2,RZ-.2); scene.add(sGlow);
      }
    }

    // ── COUCH (entrance west) ─────────────────────────────────────────────────
    {
      const CX=-5.0, CZ=1.2;
      const couchM = new THREE.MeshStandardMaterial({ color:0x0e1c30, roughness:.85 });
      const couchLt= new THREE.MeshStandardMaterial({ color:0x152438, roughness:.82 });
      this._place(this._mkBox(1.9,.45,.75,couchM), CX,.225,CZ);
      this._addCol(CX,.225,CZ,1.9,.45,.75);
      [-0.46,0.46].forEach(dx => this._place(this._mkBox(.88,.12,.68,couchLt), CX+dx,.5,CZ));
      this._place(this._mkBox(1.9,.62,.12,couchM), CX,.76,CZ+.35);
      [-0.97,0.97].forEach(dx => this._place(this._mkBox(.12,.58,.75,couchM), CX+dx,.54,CZ));
    }

    // ── FILING CABINET (NE corner) ────────────────────────────────────────────
    this._place(this._mkBox(.48,1.10,.52,M.panelGrey), 6.6,.55,7.0);
    this._addCol(6.6,.55,7.0,.48,1.10,.52);

    // ── BOOKSHELF (NW corner) ─────────────────────────────────────────────────
    this._place(this._mkBox(.90,1.85,.32,M.panelGrey), -6.5,.925,6.8);
    this._addCol(-6.5,.925,6.8,.90,1.85,.32);
    if (!isMob) {
      [0.38,0.80,1.22,1.58].forEach(y => this._place(this._mkBox(.88,.03,.30,M.bench), -6.5,y,6.8));
      const bookC=[0xcc2200,0x2244cc,0x228822,0xff8833,0x8822cc,0x228888];
      [0,1,2].forEach(shelf => bookC.forEach((clr,i) => {
        if (i<4) this._place(this._mkBox(.10,.22,.24,new THREE.MeshStandardMaterial({ color:clr, roughness:.9 })),
          -6.88+i*.12, .38+shelf*.42+.12, 6.8);
      }));
    }

    // ── WORKBENCHES + CHAIRS ─────────────────────────────────────────────────
    this._workbench(-4, -7);  this._chair(-4, -7.9,  true);
    this._workbench( 4, -7);  this._chair( 4, -7.9,  true);
    this._workbench(-4,-13);  this._chair(-4,-13.9,  true);
    this._workbench( 4,-13);  this._chair( 4,-13.9,  true);
    this._workbench(-4,-22);  this._chair(-4,-22.9,  true);
    this._workbench( 4,-22);  this._chair( 4,-22.9,  true);
    this._workbench(-4,-28);  this._chair(-4,-28.9,  true);
    this._workbench( 4,-28);  this._chair( 4,-28.9,  true);

    // ── TOOL CABINET (WS2 south) ─────────────────────────────────────────────
    {
      const cab = this._mkBox(1.2,1.6,.55,M.panelGrey);
      cab.position.set(-5.5,.8,-31.5); scene.add(cab);
      this._addCol(-5.5,.8,-31.5,1.2,1.6,.55);
    }

    // ── SCHEMATIC POSTER (WS2 south wall) ────────────────────────────────────
    this._place(this._mkBox(1.6,1.1,.03,new THREE.MeshStandardMaterial({ color:0x0a1f3a, roughness:.9 })), 4, 2.0, -31.97);

    // ── BREAKER PANEL (Workshop A east wall) ─────────────────────────────────
    this._buildBreakerPanel(7.91, 0, -8, Math.PI/2, 6);

    this._buildRoomLife();

    // ── RED LED FLOOR STRIPS along walls ────────────────────────────────────────
    {
      const ledStripMat = new THREE.MeshBasicMaterial({
        color:0x00d4ff, transparent:true, opacity:.55, side:THREE.DoubleSide, depthWrite:false
      });
      const ledPositions = [
        { x:  7.9, z:  -2, len: 10 },
        { x: -7.9, z:  -2, len: 10 },
        { x:  7.9, z: -18, len: 16 },
        { x: -7.9, z: -18, len: 16 },
        { x:  7.9, z: -28, len: 14 },
        { x: -7.9, z: -28, len: 14 },
      ];
      ledPositions.forEach(({ x, z, len }) => {
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.04, len), ledStripMat);
        strip.rotation.y = Math.PI/2;
        strip.position.set(x, 0.05, z);
        scene.add(strip);
        const ledPt = new THREE.PointLight(0x00a8cc, 0.5, 9, 2.0);
        ledPt.position.set(x > 0 ? x-0.3 : x+0.3, 0.15, z);
        scene.add(ledPt);
      });
    }
  }

  // ── WORLD HELPERS ─────────────────────────────────────────────────────────────
  _mkBox(w, h, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
    m.castShadow = !this._isMob; m.receiveShadow = !this._isMob;
    return m;
  }
  _mkCyl(r, h, mat, segs=16) {
    return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segs), mat);
  }
  _place(m, x, y, z) { m.position.set(x,y,z); this._scene.add(m); return m; }

  _mkWall(x, y, z, w, h, d, mat) {
    const m = this._mkBox(w, h, d, mat || this._M.wall);
    m.position.set(x, y, z);
    this._scene.add(m);
    this._addCol(x, y, z, w, h, d);
    return m;
  }

  _wallDoor(wallZ, rangeA, rangeB, doorMid, doorW, mat) {
    const dA = doorMid - doorW/2, dB = doorMid + doorW/2;
    const DOOR_H = 2.6, TOP_H = H - DOOR_H, TOP_Y = DOOR_H + TOP_H/2;
    const OMY = H/2;
    const segs = [];
    if (dA > rangeA) segs.push([rangeA, dA, false]);
    segs.push([dA, dB, true]);
    if (dB < rangeB) segs.push([dB, rangeB, false]);
    segs.forEach(([a, b, isDoor]) => {
      const len = b-a, mid = (a+b)/2;
      if (isDoor) {
        const lt = this._mkBox(len, TOP_H, WT, mat);
        lt.position.set(mid, TOP_Y, wallZ); this._scene.add(lt);
        this._addCol(mid, TOP_Y, wallZ, len, TOP_H, WT);
      } else {
        const wl = this._mkBox(len, H, WT, mat);
        wl.position.set(mid, OMY, wallZ); this._scene.add(wl);
        this._addCol(mid, OMY, wallZ, len, H, WT);
      }
    });
  }

  _mkDoor(id, x, z) {
    // Pivot at hinge so door swings correctly
    const pivot = new THREE.Group();
    pivot.position.set(x - 0.9, 0, z);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.06), this._M.door);
    door.position.set(0.9, 1.3, 0);
    door.userData = { type:'door', id };
    door.castShadow = !this._isMob;
    door.receiveShadow = !this._isMob;
    pivot.add(door);
    this._scene.add(pivot);
    // Pre-compute AABB for the door when it is fully closed (rotation.y === 0)
    const closedBox = new THREE.Box3(
      new THREE.Vector3(x - 0.9, 0,   z - 0.08),
      new THREE.Vector3(x + 0.9, 2.6, z + 0.08),
    );
    return { id, pivot, mesh: door, open: false, targetRot: 0, x, z, closedBox };
  }

  _addWindow(x, y, z, w, h, isVertical) {
    const M = this._M;
    const GL = WT + 0.04, t = 0.09;
    if (isVertical) {
      this._place(new THREE.Mesh(new THREE.BoxGeometry(GL,h,w), M.window), x,y,z);
      this._place(this._mkBox(GL+.02,t,w+.12,M.winFrame), x, y+h/2+t/2, z);
      this._place(this._mkBox(GL+.02,t,w+.12,M.winFrame), x, y-h/2-t/2, z);
      this._place(this._mkBox(GL+.02,h+.12,t,M.winFrame), x, y, z-w/2-t/2);
      this._place(this._mkBox(GL+.02,h+.12,t,M.winFrame), x, y, z+w/2+t/2);
    } else {
      this._place(new THREE.Mesh(new THREE.BoxGeometry(w,h,GL), M.window), x,y,z);
      this._place(this._mkBox(w+.12,t,GL+.02,M.winFrame), x, y+h/2+t/2, z);
      this._place(this._mkBox(w+.12,t,GL+.02,M.winFrame), x, y-h/2-t/2, z);
      this._place(this._mkBox(t,h+.12,GL+.02,M.winFrame), x-w/2-t/2, y, z);
      this._place(this._mkBox(t,h+.12,GL+.02,M.winFrame), x+w/2+t/2, y, z);
    }
  }

  _mkLight(x, y, z, color, intensity, key) {
    const isMob = this._isMob;
    // Spot light
    const spot = new THREE.SpotLight(color||0xfff4e0, isMob ? intensity*1.4 : intensity*1.2, isMob?16:22, Math.PI/3.8, 0.38, 1.8);
    spot.position.set(x,y,z); spot.target.position.set(x,0,z);
    this._scene.add(spot); this._scene.add(spot.target);
    if (!isMob && key) {
      if (!this._roomLightSets[key]) this._roomLightSets[key] = [];
      this._roomLightSets[key].push(spot);
    }
    if (!isMob) {
      spot.castShadow = true;
      spot.shadow.mapSize.width = spot.shadow.mapSize.height = 512;
      spot.shadow.bias = -0.003;
    }

    // Fixture housing
    const base = this._mkBox(.18,.05,1.58, this._M.panelGrey);
    base.position.set(x, y+.05, z); this._scene.add(base);

    // Tube + disc emissive — bright white fluorescent
    const glowMat = new THREE.MeshStandardMaterial({
      color:0xffffff, emissive:new THREE.Color(0xf0f8ff), emissiveIntensity:isMob?5.0:6.0, roughness:1
    });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,1.48,8), glowMat);
    tube.rotation.z = Math.PI/2; tube.position.set(x,y-.01,z); this._scene.add(tube);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(.24,12), glowMat);
    disc.rotation.x = Math.PI/2; disc.position.set(x,y-.055,z); this._scene.add(disc);
  }

  _workbench(cx, cz) {
    const M = this._M;
    this._place(this._mkBox(2.2,.07,.9,M.bench), cx,.965,cz);
    this._place(this._mkBox(2.2,1.0,.05,M.panelGrey), cx,.50,cz+.44);
    [[-1.05,-.38],[-1.05,.38],[1.05,-.38],[1.05,.38]].forEach(([dx,dz]) =>
      this._place(this._mkBox(.06,1.0,.06,M.chrome), cx+dx,.5,cz+dz));
    this._addCol(cx,.5,cz,2.2,1.0,.9);
    if (this._isMob) return;
    this._place(this._mkBox(2.0,.04,.70,M.bench), cx,.34,cz);
    this._place(this._mkBox(2.2,.55,.03,new THREE.MeshStandardMaterial({ color:0x6b4c1e, roughness:.92 })), cx,1.27,cz+.44);
    // Wire spool
    const sp = new THREE.Mesh(new THREE.TorusGeometry(.062,.022,6,14), M.copper);
    sp.rotation.x = Math.PI/2; sp.position.set(cx+.65,1.0,cz-.05); this._scene.add(sp);
    // Work lamp
    const lx=cx+.92, lbz=cz+.38;
    this._place(this._mkCyl(.04,.03,M.panelGrey,8), lx,.988,lbz);
    this._place(this._mkCyl(.012,.30,M.chrome,6),   lx,1.14,lbz);
    this._place(this._mkBox(.10,.03,.08,new THREE.MeshStandardMaterial({
      color:0xffffcc, emissive:new THREE.Color(0xffee88), emissiveIntensity:1.4 })), lx,1.30,lbz-.06);
    const lampPt = new THREE.PointLight(0xffe8b0,1.2,1.8,2.2);
    lampPt.position.set(lx,1.26,lbz-.08); this._scene.add(lampPt);
  }

  _chair(x, z, faceNorth=false) {
    const M = this._M;
    const cushM = new THREE.MeshStandardMaterial({ color:0x1a3a5c, roughness:.88 });
    const bz = faceNorth ? -.27 : .27;
    this._place(this._mkBox(.58,.07,.58,cushM), x,.55,z);
    this._place(this._mkBox(.58,.64,.07,cushM), x,.98,z+bz);
    const col = this._mkCyl(.05,.52,M.chrome,8);
    col.position.set(x,.27,z); this._scene.add(col);
    if (this._isMob) return;
    [-.30,.30].forEach(dx => {
      this._place(this._mkBox(.06,.05,.38,M.panelGrey), x+dx,.74,z+bz*.15);
      this._place(this._mkBox(.10,.03,.32,cushM),       x+dx,.775,z+bz*.1);
    });
  }

  _buildRoomLife() {
    const M = this._M;
    const scene = this._scene;
    const isMob = this._isMob;

    // ── SERVER RACKS (Workshop B) ─────────────────────────────────────────────
    const rackM  = new THREE.MeshStandardMaterial({ color:0x0c1520, roughness:.75, metalness:.55 });
    const rackFrM= new THREE.MeshStandardMaterial({ color:0x141f30, roughness:.60, metalness:.65 });
    [[6.1,-26],[6.1,-30],[-6.1,-24],[-6.1,-30]].forEach(([rx,rz]) => {
      this._place(this._mkBox(.72,2.1,.82,rackM), rx, 1.05, rz);
      this._addCol(rx, 1.05, rz, .72, 2.1, .82);
      this._place(this._mkBox(.70,2.08,.04,rackFrM), rx, 1.05, rz + (rx>0?-.38:.38));
      for (let i=0;i<5;i++) {
        this._place(this._mkBox(.66,.018,.04,new THREE.MeshStandardMaterial({ color:0x0a1220 })),
          rx, .38+i*.38, rz + (rx>0?-.37:.37));
      }
      if (!isMob) {
        [[0x00ff44,.00],[0x00ff44,.06],[0xff2200,.12],[0x00d4ff,.18]].forEach(([clr,dy]) => {
          const lm = new THREE.MeshStandardMaterial({ color:clr, emissive:new THREE.Color(clr), emissiveIntensity:3.0 });
          this._place(this._mkBox(.03,.025,.04,lm), rx + (rx>0?-.20:.20), 1.82+dy, rz+(rx>0?-.37:.37));
        });
        const glow = new THREE.PointLight(0x00d4ff,.35,3.0,2.0);
        glow.position.set(rx+(rx>0?-.5:.5),1.2,rz); scene.add(glow);
      }
    });

    // ── UPS / BATTERY UNIT (Workshop B south wall) ────────────────────────────
    {
      const upsM = new THREE.MeshStandardMaterial({ color:0x0e1c2e, roughness:.72, metalness:.4 });
      this._place(this._mkBox(.62,.92,.5,upsM), 3.5, .46, -31.5);
      this._addCol(3.5,.46,-31.5,.62,.92,.5);
      if (!isMob) {
        const scrM = new THREE.MeshStandardMaterial({ color:0x001a28, emissive:new THREE.Color(0x00aa44), emissiveIntensity:1.4 });
        this._place(this._mkBox(.28,.15,.04,scrM), 3.5, .66, -31.22);
        const g = new THREE.PointLight(0x00aa44,.5,2.0,2.0);
        g.position.set(3.5,.7,-31.2); scene.add(g);
      }
    }

    // ── EQUIPMENT RACK (Workshop A east wall) ─────────────────────────────────
    {
      const eqM = new THREE.MeshStandardMaterial({ color:0x0d1b2a, roughness:.78, metalness:.5 });
      this._place(this._mkBox(.55,1.6,.55,eqM), 6.8, .8, -10);
      this._addCol(6.8,.8,-10,.55,1.6,.55);
      if (!isMob) {
        [[0x00d4ff,0],[0x00ff44,.08],[0xff8800,.16]].forEach(([clr,dy]) => {
          const lm = new THREE.MeshStandardMaterial({ color:clr, emissive:new THREE.Color(clr), emissiveIntensity:2.5 });
          this._place(this._mkBox(.03,.025,.04,lm), 6.54, 1.4+dy, -10);
        });
      }
    }

    // ── TRASH BIN ─────────────────────────────────────────────────────────────
    {
      const binM = new THREE.MeshStandardMaterial({ color:0x151f2e, roughness:.9 });
      const bin = new THREE.Mesh(new THREE.CylinderGeometry(.14,.12,.36,8), binM);
      bin.position.set(5.5,.18,-9); scene.add(bin);
    }

    // ── CEILING CABLE TRAY (Workshop B) ───────────────────────────────────────
    {
      const t = this._mkBox(16,.08,.38,M.panelGrey);
      t.position.set(0, H-.45, -26); scene.add(t);
      [-1,1].forEach(s => {
        const r = this._mkBox(16,.1,.04,M.panelGrey);
        r.position.set(0, H-.39, -26+s*.16); scene.add(r);
      });
    }

    // ── WALL STATUS PANELS ────────────────────────────────────────────────────
    if (!isMob) {
      [[ 7.95, 2.2,-21, Math.PI/2],[-7.95, 2.2,-22,-Math.PI/2]].forEach(([x,y,z,ry]) => {
        const pM = new THREE.MeshStandardMaterial({ color:0x001a2e, emissive:new THREE.Color(0x002244), emissiveIntensity:.7, roughness:.9 });
        const pm = this._mkBox(.04,.62,.92,pM);
        pm.position.set(x,y,z); pm.rotation.y=ry; scene.add(pm);
        [[0x00d4ff,.18],[0x00ff44,-.06],[0xff8800,-.28]].forEach(([clr,dz]) => {
          const lnM = new THREE.MeshBasicMaterial({ color:clr });
          const ln = this._mkBox(.04,.04,.26,lnM);
          ln.position.set(x,y+.14,z+dz); ln.rotation.y=ry; scene.add(ln);
        });
        const pg = new THREE.PointLight(0x004488,.55,3.2,2.0);
        pg.position.set(x>0?x-.4:x+.4,y,z); scene.add(pg);
      });
    }

    // ── FLOOR WARNING STRIPES (room dividers) ─────────────────────────────────
    {
      const wA = new THREE.MeshBasicMaterial({ color:0xffaa00, transparent:true, opacity:.30, depthWrite:false });
      const wB = new THREE.MeshBasicMaterial({ color:0x111111, transparent:true, opacity:.25, depthWrite:false });
      [-17.9,-1.9].forEach(wz => {
        for (let i=-8;i<8;i++) {
          const stripe = new THREE.Mesh(new THREE.PlaneGeometry(.9,.48),(i%2===0)?wA:wB);
          stripe.rotation.x=-Math.PI/2;
          stripe.position.set(i+.5, 0.003, wz);
          scene.add(stripe);
        }
      });
    }

    // ── NETWORK PATCH PANEL (Workshop B west wall) ───────────────────────────
    {
      const ppM = new THREE.MeshStandardMaterial({ color:0x0c1828, roughness:.80, metalness:.4 });
      this._place(this._mkBox(.04,.55,1.1,ppM), -7.95, 2.6, -26);
      if (!isMob) {
        for (let i=0;i<8;i++) {
          const portM = new THREE.MeshStandardMaterial({ color:0x1a3050, roughness:.7 });
          this._place(this._mkBox(.04,.06,.06,portM), -7.93, 2.42, -25.35+i*.12);
        }
        const pg = new THREE.PointLight(0x0044aa,.3,2.5,2.0);
        pg.position.set(-7.6,2.4,-26); scene.add(pg);
      }
    }
  }

  _buildBreakerPanel(cx, cy, cz, ry, count=8) {
    const M = this._M;
    const grp = new THREE.Group();
    const enc = this._mkBox(1.05,1.55,.18,M.panel); enc.position.set(0,1.78,0); grp.add(enc);
    const trim= this._mkBox(1.07,1.57,.14,M.panelGrey); trim.position.set(0,1.78,.02); grp.add(trim);

    const saved = Database.getExploreProgress();
    const breakerFixed = Database.load().exploreBreakerFixed;
    this._breakerBreakers = [];
    for (let i=0;i<count;i++) {
      const row=Math.floor(i/2), col=i%2;
      // breaker #3 (index 2) is the tripped one unless already fixed
      const tripped = !breakerFixed && i === 2;
      const on = tripped ? false : i < Math.floor(count*.75);
      const br = this._mkBox(.16,.28,.07, tripped ? M.red : on ? M.green : M.panelGrey);
      br.position.set(-.23+col*.46, 2.3-row*.32, .12);
      br.userData = { type:'breaker', index:i, tripped };
      grp.add(br);
      if (tripped) this._breakerInteractMesh = br;
      this._breakerBreakers.push({ mesh:br, tripped });
    }
    // Interaction hitbox on the full panel face
    const hit = this._mkBox(1.0, 1.5, 0.1, new THREE.MeshBasicMaterial({ visible:false }));
    hit.position.set(0, 1.78, 0.14);
    hit.userData = { type:'breaker', id:1 };
    grp.add(hit);
    this._breakerHit = hit;

    grp.position.set(cx,cy,cz); grp.rotation.y=ry; this._scene.add(grp);
    this._breakerGroup = grp;
    this._breakerFixed = breakerFixed;
  }

  // ── INTERACTABLES ─────────────────────────────────────────────────────────────
  _buildInteractables() {
    const M = this._M;
    this._outletMeshes = this._outlets.map(o => {
      const g = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.BoxGeometry(.12,.10,.04),
        o.fixed ? M.green : new THREE.MeshStandardMaterial({ color:0x334466, roughness:.55 }));
      plate.userData = { type:'outlet', id:o.id };
      g.add(plate);
      const hole = new THREE.Mesh(new THREE.BoxGeometry(.02,.03,.05),
        new THREE.MeshBasicMaterial({ color:0x000000 }));
      hole.position.set(-.025,.015,.01); g.add(hole);
      const hole2=hole.clone(); hole2.position.set(.025,.015,.01); g.add(hole2);
      const earth=hole.clone(); earth.position.set(0,-.022,.01); g.add(earth);
      if (!o.fixed) {
        // Danger red area glow — visible from across the dark room
        const glow = new THREE.PointLight(0xff2200, 1.4, 2.2);
        glow.position.set(0,0,.3); g.add(glow); g.userData._glow=glow;
        // Spark emissive indicator
        const spark = new THREE.Mesh(new THREE.BoxGeometry(.015,.025,.06),
          new THREE.MeshStandardMaterial({ color:0xff6600, emissive:new THREE.Color(0xff4400), emissiveIntensity:8, roughness:1 }));
        spark.position.set(.03,.03,.02); g.add(spark); g.userData._spark=spark;
      }
      g.position.copy(o.pos);
      if (Math.abs(o.pos.x)>7) g.rotation.y = o.pos.x>0 ? -Math.PI/2 : Math.PI/2;
      this._scene.add(g);
      return { id:o.id, group:g, plate };
    });

    this._switchMeshes = this._switches.map(sw => {
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(.10,.12,.04),
        sw.fixed ? M.green : new THREE.MeshStandardMaterial({ color:0xfafafa, roughness:.6 }));
      box.userData = { type:'switch', id:sw.id };
      g.add(box);
      const lever = new THREE.Mesh(new THREE.BoxGeometry(.025,.06,.05),
        new THREE.MeshStandardMaterial({ color:sw.fixed ? 0x333300 : 0x666666 }));
      lever.position.set(0, sw.fixed?.018:-.018,.02);
      lever.rotation.z = sw.fixed?.3:-.3;
      g.add(lever);
      g.position.copy(sw.pos);
      if (Math.abs(sw.pos.x)>7) g.rotation.y = sw.pos.x>0 ? -Math.PI/2 : Math.PI/2;
      this._scene.add(g);
      return { id:sw.id, group:g, box };
    });

    this._interactMeshes = [
      ...this._outletMeshes.map(o => ({ mesh:o.plate, type:'outlet',  id:o.id })),
      ...this._switchMeshes.map(s => ({ mesh:s.box,   type:'switch',  id:s.id })),
      ...this._doors.map(d        => ({ mesh:d.mesh,  type:'door',    id:d.id })),
      ...(this._breakerHit ? [{ mesh:this._breakerHit, type:'breaker', id:1 }] : []),
    ];
  }

  // ── COLLISION ─────────────────────────────────────────────────────────────────
  _addCol(x, y, z, w, h, d) {
    this._colBoxes.push(new THREE.Box3(
      new THREE.Vector3(x-w/2, y-h/2, z-d/2),
      new THREE.Vector3(x+w/2, y+h/2, z+d/2),
    ));
  }
  _checkCol(pos) {
    const pb = new THREE.Box3(
      new THREE.Vector3(pos.x-.32, pos.y-1.65, pos.z-.32),
      new THREE.Vector3(pos.x+.32, pos.y+.12,  pos.z+.32),
    );
    if (this._colBoxes.some(b => b.intersectsBox(pb))) return true;
    // Dynamic door collision — only block when door is closed (not swung open)
    if (this._doors) {
      for (const d of this._doors) {
        if (!d.open && Math.abs(d.pivot.rotation.y) < 0.15 && d.closedBox.intersectsBox(pb)) return true;
      }
    }
    return false;
  }

  // ── INPUT SETUP ───────────────────────────────────────────────────────────────
  _setupInput() {
    const isMob = this._isMob;
    const canvas = this.root.querySelector('#ex-canvas');

    const onKD = e => { this._keys[e.code] = true; };
    const onKU = e => { this._keys[e.code] = false; };
    this._on(window, 'keydown', onKD);
    this._on(window, 'keyup',   onKU);
    this._on(window, 'keydown', e => {
      if (e.code === 'KeyE' && !this._repairOpen) this._doInteract();
    });

    if (!isMob) {
      this._on(canvas, 'click', () => {
        if (!this._pointerLocked && !this._repairOpen) canvas.requestPointerLock();
      });
      this._on(document, 'pointerlockchange', () => {
        this._pointerLocked = document.pointerLockElement === canvas;
        const msg = this.root.querySelector('#ex-ptr-msg');
        if (msg) msg.style.display = this._pointerLocked ? 'none' : 'block';
      });
      this._on(document, 'mousemove', e => {
        if (!this._pointerLocked) return;
        this._player.yawVel   -= e.movementX * .0022;
        this._player.pitchVel -= e.movementY * .0022;
      });
    } else {
      const joyOuter = this.root.querySelector('#ex-joy-outer');
      const joyInner = this.root.querySelector('#ex-joy-inner');
      if (joyOuter) {
        this._on(joyOuter, 'touchstart', e => {
          e.preventDefault();
          if (this._joyId !== -1) return;
          const t = e.changedTouches[0];
          this._joyId = t.identifier;
          const r = joyOuter.getBoundingClientRect();
          this._joyCX = r.left + r.width*.5; this._joyCY = r.top + r.height*.5;
          this._joyR  = r.width*.5;
          joyOuter.classList.add('joy-active');
        }, { passive:false });
        this._on(document, 'touchmove', e => {
          if (this._joyId===-1) return;
          for (const t of e.changedTouches) {
            if (t.identifier !== this._joyId) continue;
            const dx=t.clientX-this._joyCX, dy=t.clientY-this._joyCY;
            const dist=Math.hypot(dx,dy), maxR=this._joyR*.72;
            const clamp=Math.min(dist,maxR), ang=Math.atan2(dy,dx);
            if (joyInner) joyInner.style.transform=`translate(calc(-50% + ${Math.cos(ang)*clamp}px),calc(-50% + ${Math.sin(ang)*clamp}px))`;
            const DEAD=.18;
            if (dist<this._joyR*DEAD){ this._joy.x=0; this._joy.y=0; }
            else {
              const norm=Math.max(0,(clamp/maxR-DEAD)/(1-DEAD))*.75;
              this._joy.x=(dx/dist)*norm; this._joy.y=(dy/dist)*norm;
            }
          }
        }, { passive:true });
        const joyEnd = e => {
          for (const t of e.changedTouches) {
            if (t.identifier!==this._joyId) continue;
            this._joyId=-1; this._joy.x=0; this._joy.y=0;
            if (joyInner) joyInner.style.transform='translate(-50%,-50%)';
            joyOuter.classList.remove('joy-active');
          }
        };
        this._on(document,'touchend',    joyEnd,{passive:true});
        this._on(document,'touchcancel', joyEnd,{passive:true});
      }

      const lookZone = this.root.querySelector('#ex-look-zone');
      if (lookZone) {
        this._on(lookZone,'touchstart',e=>{
          if (this._repairOpen) return;
          e.preventDefault();
          for (const t of e.changedTouches) this._lookTouches[t.identifier]={x:t.clientX,y:t.clientY};
        },{passive:false});
        this._on(lookZone,'touchmove',e=>{
          if (this._repairOpen) return;
          e.preventDefault();
          const sens = 0.0032;
          for (const t of e.changedTouches) {
            if (this._lookTouches[t.identifier]) {
              const dx = t.clientX - this._lookTouches[t.identifier].x;
              const dy = t.clientY - this._lookTouches[t.identifier].y;
              this._player.yawVel   -= dx * sens;
              this._player.pitchVel -= dy * sens;
              this._lookTouches[t.identifier]={x:t.clientX,y:t.clientY};
            }
          }
        },{passive:false});
        const stopLook=e=>{ for (const t of e.changedTouches) delete this._lookTouches[t.identifier]; };
        this._on(lookZone,'touchend',    stopLook,{passive:false});
        this._on(lookZone,'touchcancel', stopLook,{passive:false});
      }

      const btnI = this.root.querySelector('#ex-btn-interact');
      if (btnI) this._on(btnI,'touchstart',e=>{e.preventDefault();if(!this._repairOpen)this._doInteract();},{passive:false});
      const btnJ = this.root.querySelector('#ex-btn-jump');
      if (btnJ) {
        const js=e=>{e.preventDefault();this._keys['Space']=true;};
        const je=e=>{e.preventDefault();this._keys['Space']=false;};
        this._on(btnJ,'touchstart',js,{passive:false});
        this._on(btnJ,'touchend',  je,{passive:false});
      }
    }
  }

  _on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    this._listeners.push([target, type, fn, opts]);
  }

  // ── GAME LOOP ─────────────────────────────────────────────────────────────────
  _startLoop() {
    let t = 0;
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(this._clock.getDelta(), .05);
      t += dt;
      if (!this._repairOpen) this._updatePlayer(dt);
      this._animateDoors(dt);
      this._pulseInteractables(t);
      this._updateInteractPrompt();
      this._drawMinimap();
      this._renderer.render(this._scene, this._camera);
    };
    this._raf = requestAnimationFrame(loop);
  }

  _pulseInteractables(t) {
    for (const o of this._outletMeshes) {
      const glow = o.group.userData._glow;
      if (glow) glow.intensity = 0.4 + Math.sin(t * 3.5) * 0.3;
      const spark = o.group.userData._spark;
      if (spark) spark.material.emissiveIntensity = 5 + Math.sin(t * 7.2) * 2;
    }
  }

  _animateDoors(dt) {
    for (const d of this._doors) {
      const diff = d.targetRot - d.pivot.rotation.y;
      if (Math.abs(diff) > 0.004) d.pivot.rotation.y += diff * Math.min(1, dt * 10);
      else d.pivot.rotation.y = d.targetRot;
    }
  }

  // ── PLAYER UPDATE ─────────────────────────────────────────────────────────────
  _updatePlayer(dt) {
    const p = this._player;
    const isMob = this._isMob;
    const SMOOTH = isMob ? .14 : .38;

    p.yaw   += p.yawVel;
    p.pitch += p.pitchVel;
    p.yawVel   *= SMOOTH; p.pitchVel *= SMOOTH;
    if (Math.abs(p.yawVel)<.00008)   p.yawVel=0;
    if (Math.abs(p.pitchVel)<.00008) p.pitchVel=0;
    p.pitch = Math.max(-1.38, Math.min(1.38, p.pitch));

    this._camera.rotation.order = 'YXZ';
    this._camera.rotation.y = p.yaw;
    this._camera.rotation.x = p.pitch;

    const SPEED=4.5;
    const sinY=Math.sin(p.yaw), cosY=Math.cos(p.yaw);
    const fwd=new THREE.Vector3(-sinY,0,-cosY);
    const rgt=new THREE.Vector3(cosY, 0,-sinY);

    let wx=this._joy.x, wy=this._joy.y;
    if (this._keys['KeyW']||this._keys['ArrowUp'])    wy=-1;
    if (this._keys['KeyS']||this._keys['ArrowDown'])  wy= 1;
    if (this._keys['KeyA']||this._keys['ArrowLeft'])  wx=-1;
    if (this._keys['KeyD']||this._keys['ArrowRight']) wx= 1;

    const wish=new THREE.Vector3();
    wish.addScaledVector(fwd,-wy).addScaledVector(rgt,wx);
    if (wish.lengthSq()>0) wish.normalize();

    if (wish.lengthSq()>0) {
      p.vel.addScaledVector(wish,22*dt);
      if (p.vel.length()>SPEED) p.vel.normalize().multiplyScalar(SPEED);
    } else {
      const spd=p.vel.length();
      if (spd>.01) p.vel.multiplyScalar(Math.max(0,1-18*dt/spd));
      else p.vel.set(0,0,0);
    }

    p.grounded = p.pos.y<=(FLOOR_Y+BASE_Y+.12);
    if (p.grounded) {
      if (p.vy<0) p.vy=0;
      if (this._keys['Space']) { p.vy=7.0; p.grounded=false; }
    } else { p.vy -= 22*dt; }
    p.pos.y += p.vy*dt;
    if (p.pos.y<FLOOR_Y+BASE_Y) { p.pos.y=FLOOR_Y+BASE_Y; p.vy=0; p.grounded=true; }

    const np=p.pos.clone().addScaledVector(p.vel,dt);
    np.x=Math.max(-7.5,Math.min(7.5,np.x));
    np.z=Math.max(-31.5,Math.min(7.5,np.z));
    if (!this._checkCol(np)) { p.pos.copy(np); }
    else {
      const tx=new THREE.Vector3(np.x,p.pos.y,p.pos.z);
      if (!this._checkCol(tx)) { p.pos.x=np.x; p.vel.z=0; }
      const tz=new THREE.Vector3(p.pos.x,p.pos.y,np.z);
      if (!this._checkCol(tz)) { p.pos.z=np.z; p.vel.x=0; }
    }

    const spd2=p.vel.length(), moving=spd2>.2;
    if (moving) {
      this._bobT+=dt*7*(spd2/SPEED); this._bobAmt=Math.min(1,this._bobAmt+dt*7);
      SoundManager.play('footstep', dt);
    } else { this._bobAmt=Math.max(0,this._bobAmt-dt*6); }
    const bobY=Math.sin(this._bobT)*.04*this._bobAmt;
    this._camera.position.set(p.pos.x, p.pos.y+bobY, p.pos.z);
  }

  // ── INTERACTION ───────────────────────────────────────────────────────────────
  _updateInteractPrompt() {
    // Proximity-based detection: trigger when player is within range of outlet/switch/door
    const INTERACT_RADIUS = 2.4;
    const pp = this._player.pos;
    let best = null, bestD = Infinity;
    for (const im of this._interactMeshes) {
      const worldPos = new THREE.Vector3();
      im.mesh.getWorldPosition(worldPos);
      const d = pp.distanceTo(worldPos);
      if (d < INTERACT_RADIUS && d < bestD) { bestD = d; best = im; }
    }
    this._nearest = best;

    let label='', active=false;
    if (best) {
      active=true;
      if (best.type==='door') {
        const d=this._doors.find(d=>d.id===best.id);
        label=d?.open ? '🚪 CLOSE DOOR' : '🚪 OPEN DOOR';
      } else if (best.type==='outlet') {
        const isFixed=this._outlets.find(o=>o.id===best.id)?.fixed;
        label=isFixed?'✅ OUTLET OK':'🔧 FIX OUTLET';
        active=!isFixed;
      } else if (best.type==='switch') {
        const isFixed=this._switches.find(s=>s.id===best.id)?.fixed;
        label=isFixed?'✅ SWITCH OK':'💡 WIRE SWITCH';
        active=!isFixed;
      } else if (best.type==='breaker') {
        label=this._breakerFixed?'✅ PANEL OK':'⚠️ RESET BREAKER';
        active=!this._breakerFixed;
      }
    }

    // Fire contextual mascot tips once per session when player approaches
    if (best && !this._repairOpen && this._guide) {
      if (best.type === 'outlet' && !this._outlets.find(o => o.id === best.id)?.fixed && !this._guideTipsFired.outlet) {
        this._guideTipsFired.outlet = true;
        this._guide.show('near_outlet');
      } else if (best.type === 'switch' && !this._switches.find(s => s.id === best.id)?.fixed && !this._guideTipsFired.switch) {
        this._guideTipsFired.switch = true;
        this._guide.show('near_switch');
      } else if (best.type === 'breaker' && !this._breakerFixed && !this._guideTipsFired.breaker) {
        this._guideTipsFired.breaker = true;
        this._guide.show('near_breaker');
      }
    }

    const prompt=this.root.querySelector('#ex-prompt');
    if (prompt) {
      prompt.style.display=best?'block':'none';
      if (best) prompt.textContent=label+(this._isMob?'':' [E]');
    }
    const btnI=this.root.querySelector('#ex-btn-interact');
    if (btnI) {
      btnI.classList.toggle('ex-btn-interact--active', active);
      btnI.style.display=this._isMob?'flex':'none';
      const iconEl=btnI.querySelector('.ex-btn-interact-icon');
      if (iconEl) iconEl.textContent=best?(best.type==='door'?'🚪':best.type==='outlet'?'🔧':'💡'):'⚡';
      const lbl=this.root.querySelector('#ex-btn-label');
      if (lbl) { lbl.textContent=label; lbl.classList.toggle('show',!!(label&&active)); }
    }

    const roomEl=this.root.querySelector('#ex-room');
    if (roomEl) {
      const z=this._player.pos.z;
      roomEl.textContent=z>=-2?'ENTRANCE':z>=-18?'WORKSHOP A':'WORKSHOP B';
    }

    // Crosshair hit indicator (desktop)
    const ch=this.root.querySelector('#ex-crosshair');
    if (ch) ch.classList.toggle('ex-crosshair--hit', !!best);

    // Label above interact button
    const lbl=this.root.querySelector('#ex-btn-label');
    if (lbl) { lbl.textContent=label; lbl.classList.toggle('show', active); }

  }

  _doInteract() {
    if (!this._nearest) return;
    const { type, id } = this._nearest;
    if (type==='door') {
      this._toggleDoor(id);
    } else if (type==='outlet') {
      const o=this._outlets.find(x=>x.id===id);
      if (o?.fixed) { this._notify('Outlet already fixed!','ok'); return; }
      this._openOutletRepair(id);
    } else if (type==='switch') {
      const s=this._switches.find(x=>x.id===id);
      if (s?.fixed) { this._notify('Switch already installed!','ok'); return; }
      this._openSwitchRepair(id);
    } else if (type==='breaker') {
      this._doFixBreaker();
    }
  }

  _doFixBreaker() {
    if (this._breakerFixed) { this._notify('⚡ Breaker panel OK', 'ok'); return; }
    // Simple overlay-free fix: show a notification and fix it
    this._openBreakerRepair();
  }

  _openBreakerRepair() {
    if (this._breakerFixed) return;
    this._repairOpen = true;
    if (document.exitPointerLock) document.exitPointerLock();

    // Show the breaker overlay
    const overlay = this.root.querySelector('#brk-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      // highlight the tripped breaker
      const trippedEl = overlay.querySelector('#brk-tripped');
      if (trippedEl) trippedEl.onclick = () => this._fixBreaker(overlay);
    }
  }

  _fixBreaker(overlay) {
    if (overlay) overlay.style.display = 'none';
    this._repairOpen = false;
    this._breakerFixed = true;
    Database.saveExploreBreaker();
    Database.addXP(100);
    // Update visual — turn tripped breaker green
    if (this._breakerBreakers) {
      const b = this._breakerBreakers.find(x => x.tripped);
      if (b) { b.mesh.material = this._M.green; b.tripped = false; }
    }
    SoundManager.play('breaker_click');
    SoundManager.play('xp_gain');
    this._notify('✅ Breaker reset! +100 XP', 'ok');
    this._updateScoreHUD();
    if (this._guide) this._guide.show('after_fix');
  }

  _toggleDoor(id) {
    const d = this._doors.find(d => d.id === id);
    if (!d) return;
    d.open = !d.open;
    d.targetRot = d.open ? -Math.PI / 2 : 0;
    SoundManager.play('door');
    this._notify(d.open ? '🚪 Door opened' : '🚪 Door closed', 'info');
  }

  // ── HTML LESSON IFRAME (outlet + switch repair screens) ──────────────────────
  _openHtmlRepair(src, onComplete) {
    if (this._htmlRepairEl) return;
    this._repairOpen = true;
    if (document.exitPointerLock) document.exitPointerLock();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:80;background:#060a14;display:flex;flex-direction:column;';

    const backBar = document.createElement('div');
    backBar.style.cssText = 'position:absolute;top:0;left:0;z-index:90;padding:8px;';
    backBar.innerHTML = `<button style="background:rgba(4,8,20,.9);border:1px solid rgba(0,212,255,.35);color:#00d4ff;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;padding:8px 14px;border-radius:9px;cursor:pointer;letter-spacing:1px;display:flex;align-items:center;gap:6px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>BACK
    </button>`;

    const frame = document.createElement('iframe');
    frame.style.cssText = 'flex:1;border:none;width:100%;height:100%;';
    frame.src = src;

    const close = () => {
      window.removeEventListener('message', msgHandler);
      overlay.remove();
      this._htmlRepairEl = null;
      this._repairOpen = false;
    };

    const msgHandler = e => {
      if (e.data?.type === 'complete') { close(); onComplete(); }
      if (e.data?.type === 'back')     { close(); }
    };
    window.addEventListener('message', msgHandler);

    backBar.querySelector('button').addEventListener('click', close);
    backBar.querySelector('button').addEventListener('touchend', e => { e.preventDefault(); close(); });

    overlay.appendChild(frame);
    overlay.appendChild(backBar);
    this.root.appendChild(overlay);
    this._htmlRepairEl = overlay;
  }

  // ── OUTLET REPAIR ─────────────────────────────────────────────────────────────
  _openOutletRepair(id) {
    this._openHtmlRepair('./learn-outlet.html', () => {
      Database.saveExploreOutlet(id);
      Database.addXP(150);
      this._guide?.show('after_fix');
      const o = this._outlets.find(x => x.id === id);
      if (o) o.fixed = true;
      const om = this._outletMeshes.find(x => x.id === id);
      if (om) {
        om.plate.material = this._M.green;
        const glow = om.group.userData._glow;
        if (glow) { glow.intensity = 0; glow.color.set(0x44ff88); }
        const spark = om.group.userData._spark;
        if (spark) spark.visible = false;
      }
      this._updateScoreHUD();
      SoundManager.play('success');
      SoundManager.play('xp_gain');
      this._notify('⚡ +150 XP — Outlet Fixed!', 'ok');
    });
  }

  // Called by ExploreScreen cancel button
  closeRepair() {
    this._repairOpen = false;
    if (this._htmlRepairEl) { this._htmlRepairEl.remove(); this._htmlRepairEl = null; }
  }

  // ── SWITCH REPAIR ─────────────────────────────────────────────────────────────
  _openSwitchRepair(id) {
    this._openHtmlRepair('./switch_installation.html', () => {
      Database.saveExploreSwitch(id);
      Database.addXP(200);
      this._guide?.show('after_fix');
      const s = this._switches.find(x => x.id === id);
      if (s) s.fixed = true;
      const sm = this._switchMeshes.find(x => x.id === id);
      if (sm) sm.box.material = new THREE.MeshStandardMaterial({
        color: 0x00ff88, roughness: .6,
        emissive: new THREE.Color(0x00ff88), emissiveIntensity: .8,
      });
      SoundManager.play('success');
      SoundManager.play('xp_gain');
      this._notify(`✅ Switch #${id} installed! +200 XP`, 'ok');
      this._updateScoreHUD();
    });
  }

  // ── MINIMAP ───────────────────────────────────────────────────────────────────
  _drawMinimap() {
    const canvas=this.root.querySelector('#ex-minimap');
    if (!canvas) return;
    const ctx=canvas.getContext('2d');
    const W=canvas.width, H2=canvas.height;
    ctx.clearRect(0,0,W,H2);
    const wx2mx = x => (x+8)*(W/16);
    const wz2my = z => (z+32)*(H2/40);

    ctx.fillStyle='rgba(7,16,31,.9)'; ctx.fillRect(0,0,W,H2);
    [
      { x:-8,z:-2,  w:16,d:10, color:'rgba(0,212,255,.12)' },
      { x:-8,z:-18, w:16,d:16, color:'rgba(42,111,168,.18)'},
      { x:-8,z:-32, w:16,d:14, color:'rgba(31,90,140,.18)' },
    ].forEach(r => {
      ctx.fillStyle=r.color;
      ctx.fillRect(wx2mx(r.x),wz2my(r.z),r.w*(W/16),r.d*(H2/40));
    });

    this._outlets.forEach(o => {
      ctx.fillStyle=o.fixed?'#2dc653':'#ff5544';
      ctx.beginPath(); ctx.arc(wx2mx(o.pos.x),wz2my(o.pos.z),3,0,Math.PI*2); ctx.fill();
    });
    this._switches.forEach(s => {
      ctx.fillStyle=s.fixed?'#ffdd44':'#ff9900';
      ctx.fillRect(wx2mx(s.pos.x)-3,wz2my(s.pos.z)-3,6,6);
    });

    const px=wx2mx(this._player.pos.x), pz=wz2my(this._player.pos.z);
    ctx.fillStyle='#00d4ff';
    ctx.beginPath(); ctx.arc(px,pz,4,0,Math.PI*2); ctx.fill();
    const yaw=this._player.yaw;
    const ax=px+Math.sin(-yaw)*7, az=pz+Math.cos(-yaw)*7;
    ctx.strokeStyle='#00d4ff'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(px,pz); ctx.lineTo(ax,az); ctx.stroke();
  }

  // ── HUD ───────────────────────────────────────────────────────────────────────
  _updateScoreHUD() {
    const total = this._outlets.length + this._switches.length + 1; // +1 breaker
    const fixed = this._outlets.filter(o=>o.fixed).length
                + this._switches.filter(s=>s.fixed).length
                + (this._breakerFixed ? 1 : 0);
    const el=this.root.querySelector('#ex-score');
    if (el) el.textContent=`${fixed}/${total}`;
    if (fixed>=total && total>0) {
      const sc=this.root.querySelector('#ex-stage-complete');
      if (sc && !sc.classList.contains('show')) {
        const scoreEl=this.root.querySelector('#ex-sc-score');
        if (scoreEl) scoreEl.textContent=`${fixed}/${total} Objectives`;
        setTimeout(()=>sc.classList.add('show'), 1200);
        setTimeout(()=>SoundManager.play('complete'), 1000);
        Database.saveLearnStage('ways');
        if (this._guide) this._guide.show('all_done');
      }
    }
  }

  _notify(msg, type='info') {
    const container=this.root.querySelector('#ex-notify');
    if (!container) return;
    const div=document.createElement('div');
    div.className='ex-notif'+(type==='ok'?' ok':'');
    div.textContent=msg;
    container.prepend(div);
    setTimeout(()=>div.remove(), 3200);
  }

  // ── DESTROY ───────────────────────────────────────────────────────────────────
  destroy() {
    cancelAnimationFrame(this._raf);
    this._raf=null;
    this._ro?.disconnect();
    for (const [target,type,fn,opts] of this._listeners) target.removeEventListener(type,fn,opts);
    this._listeners=[];
    if (document.exitPointerLock) document.exitPointerLock();
    if (this._htmlRepairEl) { this._htmlRepairEl.remove(); this._htmlRepairEl = null; }
    this._scene.traverse(obj=>{
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose());
        else obj.material.dispose();
      }
    });
    this._renderer.dispose();
  }
}

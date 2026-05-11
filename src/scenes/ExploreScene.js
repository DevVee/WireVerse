import * as THREE from 'three';
import { Database } from '../systems/Database.js';
import { OutletScenario } from './OutletScenario.js';
import { SwitchScenario } from './SwitchScenario.js';

// ── WORLD CONSTANTS ───────────────────────────────────────────────────────────
const FLOOR_Y = 0;
const H       = 4.2;   // ceiling height
const WT      = 0.22;  // wall thickness
const BASE_Y  = 1.72;  // eye height
const SPAWN     = new THREE.Vector3(0, BASE_Y, 5);
const SPAWN_YAW = Math.PI;

// Outlet / switch defs (same positions as before)
const OUTLET_DEFS = [
  { id: 1, pos: new THREE.Vector3(-7.7, 1.2,  3),    label: 'Entrance West'  },
  { id: 2, pos: new THREE.Vector3( 7.7, 1.2,  0),    label: 'Entrance East'  },
  { id: 3, pos: new THREE.Vector3(-7.7, 1.2, -8),    label: 'Workshop A West'},
  { id: 4, pos: new THREE.Vector3( 7.7, 1.2,-14),    label: 'Workshop A East'},
  { id: 5, pos: new THREE.Vector3( 0,   1.2,-31.8),  label: 'Workshop B North'},
];
const SWITCH_DEFS = [
  { id: 1, pos: new THREE.Vector3(-7.7, 1.5, -5),   label: 'Workshop A Station 1'},
  { id: 2, pos: new THREE.Vector3( 7.7, 1.5,-22),   label: 'Workshop B Station 2'},
  { id: 3, pos: new THREE.Vector3(-7.7, 1.5,-28),   label: 'Workshop B Station 3'},
];
// ─────────────────────────────────────────────────────────────────────────────

export class ExploreScene {
  constructor(state, root) {
    this.state  = state;
    this.root   = root;
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

    this._colBoxes = [];
    this._isMob    = navigator.maxTouchPoints > 0;

    this._outletScenario  = null;
    this._switchScenario  = null;

    this._initThree();
    this._buildWorld();
    this._buildInteractables();
    this._setupInput();
    this._startLoop();
    this._updateScoreHUD();
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
    this._renderer.toneMapping = isMob ? THREE.LinearToneMapping : THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.35;
    this._renderer.shadowMap.enabled = !isMob;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x9ecff5);
    if (isMob) {
      this._scene.fog = new THREE.Fog(0xc5e4f7, 28, 45);
    } else {
      this._scene.fog = new THREE.FogExp2(0xc5e4f7, 0.004);
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
        mkEnvMesh(120, 2, 120, 0x87ceeb,  0,   0,  0);
        mkEnvMesh(120, 2, 120, 0x87ceeb,  0,  20,  0);
        mkEnvMesh(2,  60, 2,   0xfff0c8, 18,   0,-10);
        mkEnvMesh(120, 2, 120, 0xc8b87a,  0, -20,  0);
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
    x.fillStyle = '#525e6a'; x.fillRect(0,0,512,512);
    const ts = 128, grout = 3;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tx = col*ts+grout, ty = row*ts+grout, tw = ts-grout*2, th = ts-grout*2;
        const v = (Math.random()-.5)*14;
        x.fillStyle=`rgb(${82+v|0},${94+v|0},${106+v|0})`; x.fillRect(tx,ty,tw,th);
        const cx2=tx+tw/2,cy2=ty+th/2;
        const gr = x.createRadialGradient(cx2,cy2,2,cx2,cy2,tw*.72);
        gr.addColorStop(0,'rgba(255,255,255,.10)');
        gr.addColorStop(.5,'rgba(255,255,255,.03)');
        gr.addColorStop(1,'rgba(0,0,0,.08)');
        x.fillStyle=gr; x.fillRect(tx,ty,tw,th);
        x.strokeStyle='rgba(0,0,0,.18)'; x.lineWidth=1.5;
        x.strokeRect(tx+1,ty+1,tw-2,th-2);
      }
    }
    x.fillStyle='#2e3840';
    for (let i=0;i<=512;i+=ts){ x.fillRect(i,0,grout,512); x.fillRect(0,i,512,grout); }
    for (let i=0;i<400;i++) {
      x.strokeStyle=`rgba(0,0,0,${Math.random()*.15})`;
      x.lineWidth=Math.random()*2.5; x.beginPath();
      const sx=Math.random()*512,sy=Math.random()*512;
      x.moveTo(sx,sy); x.lineTo(sx+(Math.random()-.5)*80,sy+(Math.random()-.5)*20); x.stroke();
    }
    const t = this._mkTex(c); t.repeat.set(8,8);
    return t;
  }

  _makeWallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle='#c2cbd4'; x.fillRect(0,0,512,512);
    const bH=48, bW=128, mortar=4;
    for (let row=0;row*bH<512;row++) {
      const off = (row%2===0) ? 0 : bW/2;
      for (let col=-1;col*bW+off<512;col++) {
        const bx=col*bW+off+mortar/2, by=row*bH+mortar/2;
        const bw=bW-mortar, bh=bH-mortar;
        const v=(Math.random()-.5)*18;
        const r=194+v|0,g=204+v|0,b=214+v|0;
        x.fillStyle=`rgb(${r},${g},${b})`; x.fillRect(bx,by,bw,bh);
        const gr=x.createLinearGradient(bx,by,bx,by+bh);
        gr.addColorStop(0,'rgba(255,255,255,.08)'); gr.addColorStop(1,'rgba(0,0,0,.06)');
        x.fillStyle=gr; x.fillRect(bx,by,bw,bh);
        x.strokeStyle='rgba(0,0,0,.12)'; x.lineWidth=.8; x.strokeRect(bx+.5,by+.5,bw-1,bh-1);
      }
    }
    x.fillStyle='#9aabb8';
    for (let row=0;row<=512/bH;row++) {
      x.fillRect(0,row*bH,512,mortar);
      const off=(row%2===0)?0:bW/2;
      for (let col=-1;col*bW+off<512;col++) x.fillRect(col*bW+off,0,mortar,512);
    }
    const t = this._mkTex(c); t.repeat.set(4,2);
    return t;
  }

  _makeCeilTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle='#d8e4ee'; x.fillRect(0,0,256,256);
    const gs=64;
    x.strokeStyle='rgba(100,130,160,.22)'; x.lineWidth=1.5;
    for (let i=0;i<=256;i+=gs){ x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke(); }
    for (let i=0;i<=256;i+=gs){ x.beginPath();x.moveTo(0,i);x.lineTo(256,i);x.stroke(); }
    for (let row=0;row<4;row++) for (let col=0;col<4;col++) {
      const cx2=col*gs+gs/2,cy2=row*gs+gs/2;
      const gr=x.createRadialGradient(cx2,cy2,2,cx2,cy2,gs*.4);
      gr.addColorStop(0,'rgba(255,255,255,.12)'); gr.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=gr; x.fillRect(col*gs,row*gs,gs,gs);
    }
    const t = this._mkTex(c); t.repeat.set(8,8);
    return t;
  }

  _makeConcrTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle='#8a9298'; x.fillRect(0,0,512,512);
    for (let i=0;i<3000;i++) {
      const gx=Math.random()*512,gy=Math.random()*512;
      const v=(Math.random()-.5)*30;
      const base=138+v|0;
      x.fillStyle=`rgba(${base},${base},${base},.18)`;
      x.fillRect(gx,gy,1+Math.random()*3,1+Math.random()*3);
    }
    x.strokeStyle='rgba(60,70,75,.3)'; x.lineWidth=1.5;
    for (let y=0;y<512;y+=128) { x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke(); }
    for (let xi=0;xi<512;xi+=128) { x.beginPath();x.moveTo(xi,0);x.lineTo(xi,512);x.stroke(); }
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
      floor:    new THREE.MeshStandardMaterial({ map:fT, roughness:.62, metalness:.06, envMapIntensity:.4 }),
      wall:     new THREE.MeshStandardMaterial({ map:wT, roughness:.85, metalness:.0,  envMapIntensity:.2 }),
      ceil:     new THREE.MeshStandardMaterial({ map:cT, roughness:.90, metalness:.0,  envMapIntensity:.15 }),
      concrete: new THREE.MeshStandardMaterial({ map:kT, color:0xaab2ba, roughness:.92, metalness:.0, envMapIntensity:.15 }),
      door:     new THREE.MeshStandardMaterial({ color:0xb08050, roughness:.68, metalness:.10, envMapIntensity:.3 }),
      doorFrame:new THREE.MeshStandardMaterial({ map:mT, color:0x99aabb, roughness:.18, metalness:.92, envMapIntensity:.8 }),
      panel:    new THREE.MeshStandardMaterial({ color:0x2a4a62, roughness:.52, metalness:.38, envMapIntensity:.5 }),
      panelGrey:new THREE.MeshStandardMaterial({ map:mT, color:0x6a7a88, roughness:.44, metalness:.48, envMapIntensity:.6 }),
      yellow:   new THREE.MeshStandardMaterial({ color:0xf0c060, emissive:new THREE.Color(0xf0c060), emissiveIntensity:1.2, roughness:.45 }),
      red:      new THREE.MeshStandardMaterial({ color:0xdd4433, emissive:new THREE.Color(0xdd4433), emissiveIntensity:1.4, roughness:.40 }),
      green:    new THREE.MeshStandardMaterial({ color:0x33dd66, emissive:new THREE.Color(0x33dd66), emissiveIntensity:1.6, roughness:.40 }),
      orange:   new THREE.MeshStandardMaterial({ color:0xff8833, emissive:new THREE.Color(0xff8833), emissiveIntensity:1.2, roughness:.45 }),
      bench:    new THREE.MeshStandardMaterial({ color:0x9a8065, roughness:.80, metalness:.0,  envMapIntensity:.2 }),
      black:    new THREE.MeshStandardMaterial({ color:0x141414, roughness:.75, metalness:.15, envMapIntensity:.3 }),
      chrome:   new THREE.MeshStandardMaterial({ map:mT, color:0xccddef, roughness:.04, metalness:1.0, envMapIntensity:1.4 }),
      pipe:     new THREE.MeshStandardMaterial({ map:mT, color:0x7a8fa0, roughness:.12, metalness:.96, envMapIntensity:1.2 }),
      copper:   new THREE.MeshStandardMaterial({ color:0xd97845, roughness:.18, metalness:.96, envMapIntensity:1.2 }),
      eWhite:   new THREE.MeshBasicMaterial({ color:0xfff8e0 }),
      eBlue:    new THREE.MeshBasicMaterial({ color:0x3388ff }),
      eGreen:   new THREE.MeshBasicMaterial({ color:0x22ff88 }),
      eRed:     new THREE.MeshBasicMaterial({ color:0xff3322 }),
      eYellow:  new THREE.MeshBasicMaterial({ color:0xffee00 }),
      window:   new THREE.MeshStandardMaterial({ color:0xb8e0f8, transparent:true, opacity:.34, roughness:.02, metalness:.06, envMapIntensity:.5, side:THREE.DoubleSide }),
      winFrame: new THREE.MeshStandardMaterial({ color:0xeeeeec, roughness:.45, metalness:.25, envMapIntensity:.5 }),
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

    // Workshop wall mats (blue-tinted)
    const wsWallMat = new THREE.MeshStandardMaterial({
      map:wT, color:0x2a6fa8, roughness:.80, metalness:.0, envMapIntensity:.35,
    });
    const ws2WallMat = new THREE.MeshStandardMaterial({
      map:wT, color:0x1f5a8c, roughness:.84, metalness:.0, envMapIntensity:.28,
    });
    if (isMob) {
      wsWallMat.normalMap = null; ws2WallMat.normalMap = null;
      wsWallMat.envMapIntensity = 0; ws2WallMat.envMapIntensity = 0;
    }

    // ── LIGHTING ────────────────────────────────────────────────────────────────
    this._roomLightSets = {};
    scene.add(new THREE.AmbientLight(0xfff0d8, isMob ? 1.6 : 0.55));
    if (!isMob) {
      scene.add(new THREE.HemisphereLight(0x9ecff5, 0xd4c4a0, 0.40));
    }

    // Main fill directional
    const sun = new THREE.DirectionalLight(0xfff8e0, isMob ? 1.6 : 2.8);
    sun.position.set(12,18,8); sun.target.position.set(0,0,-12);
    scene.add(sun); scene.add(sun.target);
    if (!isMob) {
      sun.castShadow = true;
      sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 65;
      sun.shadow.camera.left = sun.shadow.camera.bottom = -20;
      sun.shadow.camera.right = sun.shadow.camera.top   =  20;
      sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.04; sun.shadow.radius = 3.5;
      const skyFill = new THREE.DirectionalLight(0xc8e8ff, 0.45);
      skyFill.position.set(-8,10,2); scene.add(skyFill);
    }

    // Warm fill points in each room for depth
    const addRoom = (x, y, z, color, int) => {
      const pl = new THREE.PointLight(color, int, 10, 1.6);
      pl.position.set(x,y,z); scene.add(pl);
    };
    addRoom(0,  3.2,  2,  0xffe8c0, isMob?1.8:0.9);
    addRoom(-2, 3.2, -8,  0xfff0d0, isMob?1.6:0.8);
    addRoom( 3, 3.2,-14,  0xfff0d0, isMob?1.6:0.8);
    addRoom( 0, 3.2,-22,  0xffe8c0, isMob?1.5:0.7);
    addRoom( 0, 3.2,-28,  0xffe8c0, isMob?1.5:0.7);

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

    // ── CEILING LIGHTS ──────────────────────────────────────────────────────────
    this._mkLight(0,  H-.2,   3, 0xfff4e0, 1.4, 'entrance');
    this._mkLight(-3, H-.2,  -6, 0xfff8f0, 2.2, 'workshop');
    this._mkLight( 3, H-.2,  -6, 0xfff8f0, 2.2, 'workshop');
    this._mkLight(-3, H-.2, -14, 0xfff8f0, 2.0, 'workshop');
    this._mkLight( 3, H-.2, -14, 0xfff8f0, 2.0, 'workshop');
    this._mkLight(-3, H-.2, -22, 0xfff4e0, 1.8, 'workshop');
    this._mkLight( 3, H-.2, -22, 0xfff4e0, 1.8, 'workshop');
    this._mkLight(-3, H-.2, -29, 0xfff4e0, 1.6, 'workshop');
    this._mkLight( 3, H-.2, -29, 0xfff4e0, 1.6, 'workshop');

    // ── CEILING CABLE TRAY (WS1) ─────────────────────────────────────────────────
    {
      const t = this._mkBox(16, .08, .38, M.panelGrey);
      t.position.set(0, H-.45, -10); scene.add(t);
      [-1,1].forEach(s => {
        const r = this._mkBox(16, .1, .04, M.panelGrey);
        r.position.set(0, H-.39, -10+s*.16); scene.add(r);
      });
    }

    // ── ORANGE PVC CONDUIT (WS1 north divider wall) ──────────────────────────────
    const conduitMat = new THREE.MeshStandardMaterial({ color:0xC84010, roughness:.55, metalness:.08 });
    {
      const hc = new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,14,10), conduitMat);
      hc.rotation.z = Math.PI/2; hc.position.set(0, 2.2, -17.88); scene.add(hc);
    }

    // ── SAFETY POSTER (west wall entrance) ──────────────────────────────────────
    this._place(this._mkBox(.03, 1.5, 1.1, new THREE.MeshStandardMaterial({ color:0xffeecc, roughness:.9 })), -7.97, 2.0, 2);
    this._place(this._mkBox(.02, 1.58, 1.18, new THREE.MeshStandardMaterial({ color:0x222222, roughness:.5 })), -7.96, 2.0, 2);
    [0xcc2200, 0x2244cc, 0x228822].forEach((clr, i) => {
      this._place(this._mkBox(.02, .01, .82, new THREE.MeshBasicMaterial({ color:clr })), -7.95, 1.7+i*.28, 2);
    });

    // ── NOTICE BOARD (north wall) ────────────────────────────────────────────────
    this._place(this._mkBox(2.2, 1.3, .03, new THREE.MeshStandardMaterial({ color:0x7a5a1a, roughness:.9 })), -2.0, 2.2, 7.97);

    // ── FIRE EXTINGUISHER ───────────────────────────────────────────────────────
    {
      const feCyl = new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,.52,8), M.red);
      feCyl.position.set(-7.5,.26,-1.0); scene.add(feCyl);
    }

    // ── WALL CLOCK (east wall entrance) ─────────────────────────────────────────
    if (!isMob) {
      const cf = new THREE.Mesh(new THREE.CircleGeometry(.22,24),
        new THREE.MeshStandardMaterial({ color:0xf0f0e8, roughness:.8 }));
      cf.rotation.y = Math.PI/2; cf.position.set(7.88,2.4,7); scene.add(cf);
      const cr = new THREE.Mesh(new THREE.TorusGeometry(.22,.025,8,24),
        new THREE.MeshStandardMaterial({ color:0x334455, roughness:.4, metalness:.9 }));
      cr.rotation.y = Math.PI/2; cr.position.set(7.87,2.4,7); scene.add(cr);
    }

    // ── RECEPTION DESK ───────────────────────────────────────────────────────────
    {
      const RX=-4, RZ=3.5;
      const dkM = new THREE.MeshStandardMaterial({ color:0xb5813a, roughness:.75, metalness:.05 });
      const dpM = new THREE.MeshStandardMaterial({ color:0x7a5520, roughness:.8 });
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
      const couchM = new THREE.MeshStandardMaterial({ color:0x2d4a7c, roughness:.85 });
      const couchLt= new THREE.MeshStandardMaterial({ color:0x3a5a96, roughness:.82 });
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
    this._buildBreakerPanel(7.8, 0, -8, Math.PI/2, 6);

    // ── LIGHT SHAFTS + window glow (desktop only) ──────────────────────────────
    if (!isMob) {
      const shaftMat = new THREE.MeshBasicMaterial({
        color:0xfff8e8, transparent:true, opacity:.18, side:THREE.DoubleSide, depthWrite:false
      });
      [[-6,-14]].forEach(([z1,z2]) => {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.0), shaftMat);
        s.position.set(7.4,2.2,(z1+z2)/2); s.rotation.y = Math.PI/2; scene.add(s);
        const wPt = new THREE.PointLight(0xfff0cc,1.2,5,1.8);
        wPt.position.set(6.5,2.2,(z1+z2)/2); scene.add(wPt);
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
    return { id, pivot, mesh: door, open: false, targetRot: 0, x, z };
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

    // Tube + disc emissive (visible glow geometry)
    const glowMat = new THREE.MeshStandardMaterial({
      color:0xfff8e0, emissive:new THREE.Color(0xfff4c0), emissiveIntensity:isMob?3.5:4.0, roughness:1
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

  _buildBreakerPanel(cx, cy, cz, ry, count=8) {
    const M = this._M;
    const grp = new THREE.Group();
    const enc = this._mkBox(1.05,1.55,.18,M.panel); enc.position.set(0,1.78,0); grp.add(enc);
    const trim= this._mkBox(1.07,1.57,.14,M.panelGrey); trim.position.set(0,1.78,.02); grp.add(trim);
    for (let i=0;i<count;i++) {
      const row=Math.floor(i/2), col=i%2;
      const on=i<Math.floor(count*.75);
      const br=this._mkBox(.16,.28,.07, on ? M.green : M.red);
      br.position.set(-.23+col*.46, 2.3-row*.32, .12); grp.add(br);
    }
    grp.position.set(cx,cy,cz); grp.rotation.y=ry; this._scene.add(grp);
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
        // Warning glow light
        const glow = new THREE.PointLight(0xff4400, .7, .8);
        glow.position.set(0,0,.12); g.add(glow); g.userData._glow=glow;
        // Spark emissive indicator
        const spark = new THREE.Mesh(new THREE.BoxGeometry(.015,.025,.06),
          new THREE.MeshStandardMaterial({ color:0xff6600, emissive:new THREE.Color(0xff4400), emissiveIntensity:6, roughness:1 }));
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
      ...this._outletMeshes.map(o => ({ mesh:o.plate, type:'outlet', id:o.id })),
      ...this._switchMeshes.map(s => ({ mesh:s.box,   type:'switch', id:s.id  })),
      ...this._doors.map(d        => ({ mesh:d.mesh,  type:'door',   id:d.id  })),
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
    return this._colBoxes.some(b => b.intersectsBox(pb));
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
          for (const t of e.changedTouches) {
            if (this._lookTouches[t.identifier]) {
              this._player.yawVel   -=(t.clientX-this._lookTouches[t.identifier].x)*.0022;
              this._player.pitchVel -=(t.clientY-this._lookTouches[t.identifier].y)*.0022;
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
    const SMOOTH = isMob ? .08 : .38;

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
    if (moving) { this._bobT+=dt*7*(spd2/SPEED); this._bobAmt=Math.min(1,this._bobAmt+dt*7); }
    else         { this._bobAmt=Math.max(0,this._bobAmt-dt*6); }
    const bobY=Math.sin(this._bobT)*.04*this._bobAmt;
    this._camera.position.set(p.pos.x, p.pos.y+bobY, p.pos.z);
  }

  // ── INTERACTION ───────────────────────────────────────────────────────────────
  _updateInteractPrompt() {
    if (!this._ray) this._ray = new THREE.Raycaster();
    this._ray.setFromCamera(new THREE.Vector2(0,0), this._camera);
    let best=null, bestD=Infinity;
    for (const im of this._interactMeshes) {
      const hits=this._ray.intersectObject(im.mesh,false);
      if (hits.length && hits[0].distance<3.2 && hits[0].distance<bestD) {
        bestD=hits[0].distance; best=im;
      }
    }
    this._nearest=best;

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
      } else {
        const isFixed=this._switches.find(s=>s.id===best.id)?.fixed;
        label=isFixed?'✅ SWITCH OK':'💡 WIRE SWITCH';
        active=!isFixed;
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

    // Objectives panel
    const outletsDone=this._outlets.every(o=>o.fixed);
    const switchesDone=this._switches.every(s=>s.fixed);
    const objO=this.root.querySelector('#ex-obj-outlets');
    const objS=this.root.querySelector('#ex-obj-switches');
    if (objO) objO.classList.toggle('done',outletsDone);
    if (objS) objS.classList.toggle('done',switchesDone);
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
    }
  }

  _toggleDoor(id) {
    const d = this._doors.find(d => d.id === id);
    if (!d) return;
    d.open = !d.open;
    d.targetRot = d.open ? -Math.PI / 2 : 0;
    this._notify(d.open ? '🚪 Door opened' : '🚪 Door closed', 'info');
  }

  // ── OUTLET REPAIR (full 3D scenario) ─────────────────────────────────────────
  _openOutletRepair(id) {
    this._repairOpen = true;
    this._repairType = 'outlet';
    this._repairId   = id;
    if (document.exitPointerLock) document.exitPointerLock();

    if (!this._outletScenario) {
      this._outletScenario = new OutletScenario(
        this.root,
        (socketId, stars) => {
          // onFixed callback
          Database.saveExploreOutlet(socketId);
          const o=this._outlets.find(x=>x.id===socketId);
          if (o) o.fixed=true;
          const om=this._outletMeshes.find(x=>x.id===socketId);
          if (om) {
            om.plate.material = this._M.green;
            const glow=om.group.userData._glow;
            if (glow) { glow.intensity=0; glow.color.set(0x44ff88); }
            const spark=om.group.userData._spark;
            if (spark) spark.visible=false;
          }
          this._updateScoreHUD();
        }
      );
    }

    this._outletScenario.open(id);
  }

  // Called by ExploreScreen cancel button
  closeRepair() {
    this._repairOpen = false;
    this._outletScenario?.close();
    this._switchScenario?.close();
  }

  // ── SWITCH REPAIR (full 3D scenario) ─────────────────────────────────────────
  _openSwitchRepair(id) {
    this._repairOpen = true;
    this._repairType = 'switch';
    this._repairId   = id;
    if (document.exitPointerLock) document.exitPointerLock();

    if (!this._switchScenario) {
      this._switchScenario = new SwitchScenario(
        this.root,
        (switchId) => {
          Database.saveExploreSwitch(switchId);
          const s = this._switches.find(x => x.id === switchId);
          if (s) s.fixed = true;
          const sm = this._switchMeshes.find(x => x.id === switchId);
          if (sm) sm.box.material = new THREE.MeshStandardMaterial({
            color: 0xffdd44, roughness: .6,
            emissive: new THREE.Color(0xffdd44), emissiveIntensity: .5,
          });
          this._notify(`✅ Switch #${switchId} installed!`, 'ok');
          this._updateScoreHUD();
        }
      );
    }

    this._switchScenario.open(id);
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
    const total=this._outlets.length+this._switches.length;
    const fixed=this._outlets.filter(o=>o.fixed).length+this._switches.filter(s=>s.fixed).length;
    const el=this.root.querySelector('#ex-score');
    if (el) el.textContent=`${fixed}/${total}`;
    if (fixed>=total && total>0) {
      const sc=this.root.querySelector('#ex-stage-complete');
      if (sc && !sc.classList.contains('show')) {
        const scoreEl=this.root.querySelector('#ex-sc-score');
        if (scoreEl) scoreEl.textContent=`${fixed}/${total} Objectives`;
        setTimeout(()=>sc.classList.add('show'), 1200);
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
    this._outletScenario?.destroy(); this._outletScenario = null;
    this._switchScenario?.destroy(); this._switchScenario = null;
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

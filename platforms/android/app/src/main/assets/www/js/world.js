import * as THREE from 'three';
import { makeFloorTex, makeWallTex, makeCeilTex, makeMetalTex, makeConcrTex } from './textures.js';

// ── RENDERER ─────────────────────────────────────────────────────────────────
const isMobile = navigator.maxTouchPoints > 0;
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: !isMobile,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.2 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0f14);
scene.fog = new THREE.Fog(0x0c0f14, 18, 40);

export const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.05, 50);
camera.position.set(0, 1.72, 0);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ── TEXTURES ─────────────────────────────────────────────────────────────────
const fT = makeFloorTex(); fT.repeat.set(4, 4);
const wT = makeWallTex();  wT.repeat.set(3, 1.5);
const cT = makeCeilTex();  cT.repeat.set(4, 4);
const mT = makeMetalTex(); mT.repeat.set(2, 2);
const kT = makeConcrTex(); kT.repeat.set(3, 1.5);

// ── MATERIALS ────────────────────────────────────────────────────────────────
export const M = {
  floor:    new THREE.MeshLambertMaterial({ map: fT }),
  wall:     new THREE.MeshLambertMaterial({ map: wT }),
  ceil:     new THREE.MeshLambertMaterial({ map: cT }),
  concrete: new THREE.MeshLambertMaterial({ map: kT }),
  door:     new THREE.MeshLambertMaterial({ color: 0xc09060 }),
  doorFrame:new THREE.MeshLambertMaterial({ map: mT, color: 0xaabbcc }),
  panel:    new THREE.MeshLambertMaterial({ color: 0x2a4a6a }),
  panelGrey:new THREE.MeshLambertMaterial({ map: mT, color: 0x6a7a88 }),
  yellow:   new THREE.MeshLambertMaterial({ color:0xf0c060, emissive:new THREE.Color(0xf0c060), emissiveIntensity:.3 }),
  red:      new THREE.MeshLambertMaterial({ color:0xdd4433, emissive:new THREE.Color(0xdd4433), emissiveIntensity:.4 }),
  green:    new THREE.MeshLambertMaterial({ color:0x33dd66, emissive:new THREE.Color(0x33dd66), emissiveIntensity:.5 }),
  bench:    new THREE.MeshLambertMaterial({ color: 0x8a7055 }),
  black:    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  chrome:   new THREE.MeshLambertMaterial({ map: mT, color: 0xaabbcc }),
  eWhite:   new THREE.MeshBasicMaterial({ color: 0xfff5e0 }),
  eBlue:    new THREE.MeshBasicMaterial({ color: 0x3366aa }),
  window:   new THREE.MeshBasicMaterial({ color:0x7ab8f5, transparent:true, opacity:.38, side: THREE.DoubleSide }),
  winFrame: new THREE.MeshLambertMaterial({ color: 0xfcfcfc }),
  skin:     new THREE.MeshLambertMaterial({ color: 0xc8a882 }),
  sleeve:   new THREE.MeshLambertMaterial({ color: 0x2a3e5a }),
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
export function mkBox(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function place(m, x, y, z) { m.position.set(x, y, z); scene.add(m); return m; }

// ── COLLISION ────────────────────────────────────────────────────────────────
export const colBoxes = [];
export function addCol(x, y, z, w, h, d) {
  colBoxes.push(new THREE.Box3(
    new THREE.Vector3(x - w/2, y - h/2, z - d/2),
    new THREE.Vector3(x + w/2, y + h/2, z + d/2)
  ));
}
export function checkCol(pos) {
  const pb = new THREE.Box3(
    new THREE.Vector3(pos.x - .3, pos.y - 1.65, pos.z - .3),
    new THREE.Vector3(pos.x + .3, pos.y + .1,   pos.z + .3)
  );
  return colBoxes.some(b => b.intersectsBox(pb));
}

// ── LIGHTING ─────────────────────────────────────────────────────────────────
export const roomLightSets = {};
export const ambLight = new THREE.AmbientLight(0x223344, 0.3);
scene.add(ambLight);
scene.add(new THREE.HemisphereLight(0x334466, 0x1a1a0a, 0.22));
const sunLight = new THREE.DirectionalLight(0x99bbdd, 0.5);
sunLight.position.set(-6, 5, -3); scene.add(sunLight);
export const warnLight = new THREE.PointLight(0xff2200, 0, 12);
warnLight.position.set(0.5, 3, 0); scene.add(warnLight);

export function mkLight(x, y, z, color, intensity, key) {
  const pt = new THREE.PointLight(color, intensity, 20, 1.6);
  pt.position.set(x, y, z); scene.add(pt);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.1,6), M.eWhite);
  tube.rotation.z = Math.PI/2; tube.position.set(x, 3.36, z); scene.add(tube);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(.22, 12), M.eWhite);
  disc.rotation.x = Math.PI/2; disc.position.set(x, 3.33, z); scene.add(disc);
  if (key) { if (!roomLightSets[key]) roomLightSets[key] = []; roomLightSets[key].push(pt); }
  return pt;
}

// ── ROOM CONSTANTS ───────────────────────────────────────────────────────────
const H = 3.5, WT = 0.2;

function mkFloor(cx, cz, w, d) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.floor);
  fl.rotation.x = -Math.PI/2; fl.position.set(cx, .002, cz); scene.add(fl);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.ceil);
  cl.rotation.x =  Math.PI/2; cl.position.set(cx, H,    cz); scene.add(cl);
}
function mkWall(x, y, z, w, h, d, mat) {
  const wl = mkBox(w, h, d, mat || M.wall);
  wl.position.set(x, y, z); scene.add(wl); addCol(x, y, z, w, h, d);
}
function seg(mn, mx, mid, dw) {
  const d0 = mid - dw/2, d1 = mid + dw/2, s = [];
  if (d0 > mn) s.push([mn, d0, false]);
  s.push([d0, d1, true]);
  if (d1 < mx) s.push([d1, mx, false]);
  return s;
}
function wallDoor(x, z1, z2, dz, dw, horiz) {
  const segs = horiz ? seg(z1, z2, dz, dw) : seg(x, z2, dz, dw);
  segs.forEach(([a, b, isDoor]) => {
    const len = b - a, mid = (a + b) / 2;
    if (horiz) {
      if (isDoor) { const lt = mkBox(WT, H-2.2, len, M.wall); lt.position.set(x, 2.2+(H-2.2)/2, mid); scene.add(lt); }
      else        { const wl = mkBox(WT, H,     len, M.wall); wl.position.set(x, H/2, mid);             scene.add(wl); addCol(x, H/2, mid, WT, H, len); }
    } else {
      if (isDoor) { const lt = mkBox(len, H-2.2, WT, M.wall); lt.position.set(mid, 2.2+(H-2.2)/2, z1); scene.add(lt); }
      else        { const wl = mkBox(len, H,     WT, M.wall); wl.position.set(mid, H/2, z1);             scene.add(wl); addCol(mid, H/2, z1, len, H, WT); }
    }
  });
}

// ── FLOORS & CEILINGS ────────────────────────────────────────────────────────
mkFloor(0.5, -2,  5, 32);
mkFloor(-9,  -4,  3, 12);
mkFloor(11,  -8, 16, 12);
mkFloor(10,  7.5,14,  9);
mkFloor(-9,   9, 14, 10);
mkFloor( 6,  10,  8,  8);

// ── OUTER WALLS ──────────────────────────────────────────────────────────────
mkWall(-3,  H/2,-19.1, 10, H, WT, M.concrete);
mkWall(-9.5,H/2,-10.9,  3, H, WT, M.concrete);
mkWall(11,  H/2,-14.1, 16, H, WT, M.concrete);
mkWall(0,   H/2, 14.1, 26, H, WT, M.concrete);
mkWall(19.1,H/2,  -4, WT,  H, 18, M.concrete);
mkWall(-11.1,H/2, -4, WT,  H, 18, M.concrete);

// ── INNER WALLS (with door openings) ─────────────────────────────────────────
wallDoor(3, -14, -2, -8,  1.1, true);
wallDoor(3,   3, 12,  7,  1.1, true);
wallDoor(-2,-10,  2, -4,  1.1, true);
wallDoor(-2,  2, 14,  9,  1.1, true);
mkWall(-8.1, H/2, -4, WT, H, 12);
mkWall(-5,   H/2,-10.1, 6, H, WT);
mkWall(-5,   H/2,  2.1, 6, H, WT);
mkWall(11,   H/2, -2.1,16, H, WT);
mkWall(10,   H/2,  3.1,14, H, WT);
mkWall(10,   H/2, 12.1,14, H, WT);
mkWall(-16.1,H/2,   9, WT, H, 10, M.concrete);
wallDoor(-2,  4, 14,  9, 1.1, true);
mkWall(-9,   H/2, 14.1,14, H, WT, M.concrete);
mkWall(-9,   H/2,  3.9,12, H, WT);
mkWall(2.1,  H/2,  10, WT, H,  8);
mkWall(6,    H/2,  5.9, 8, H, WT);
mkWall(10.1, H/2,  10, WT, H,  8);
mkWall(0.5,  H/2,-18.1, 5, H, WT, M.concrete);

// ── PILLARS ──────────────────────────────────────────────────────────────────
function pillar(x, z) {
  const p = mkBox(.38, H, .38, M.concrete); p.position.set(x, H/2, z); scene.add(p); addCol(x, H/2, z, .38, H, .38);
  const b = mkBox(.5, .06, .5, M.winFrame); b.position.set(x, .03, z); scene.add(b);
  const t = mkBox(.5, .06, .5, M.winFrame); t.position.set(x, H-.03, z); scene.add(t);
}
[[-2,-12],[-2,-4],[3,-12],[3,-4],[3,4]].forEach(([x,z]) => pillar(x,z));

// ── WINDOW (Hall north wall) ──────────────────────────────────────────────────
const wg = new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.3), M.window);
wg.position.set(0.5, 2.1, -19.05); scene.add(wg);
[[-0.75,2.8],[1.75,2.8],[-0.75,1.4],[1.75,1.4]].forEach(([lx,ly])=>{
  const f=mkBox(.1, 1.5, .1, M.winFrame); f.position.set(lx+0.5*.5, ly, -19.06); scene.add(f);
});
const ws = mkBox(2.8,.07,.28, M.winFrame); ws.position.set(0.5, 1.38,-18.95); scene.add(ws);
// Ambient window light
const winPt = new THREE.PointLight(0x88aadd, 1.2, 12);
winPt.position.set(0.5, 2.2, -17.5); scene.add(winPt);

// ── LIGHTS ───────────────────────────────────────────────────────────────────
for (let z=-16; z<=12; z+=6)  mkLight(0.5, H-.15, z,   0xfff0dd, 2.2, 'hall');
mkLight( 8, H-.15, -8,  0xffe8aa, 2.4, 'workshop');
mkLight(16, H-.15, -8,  0xffe8aa, 2.0, 'workshop');
mkLight( 8, H-.15,-12,  0xffe8aa, 1.8, 'workshop');
mkLight( 8, H-.15,  7,  0xaaccff, 2.2, 'control');
mkLight(15, H-.15,  8,  0xaaccff, 1.8, 'control');
mkLight(-8, H-.15,  9,  0xffcc88, 2.0, 'storage');
mkLight(-14,H-.15,  9,  0xffcc88, 1.6, 'storage');
mkLight(-5, H-.15, -5,  0xddeeff, 1.6, 'corridor');
mkLight( 6, H-.15, 10,  0xffffff, 1.8, 'utility');

// ── SAFETY STRIPES ───────────────────────────────────────────────────────────
function stripe(x1,z1,x2,z2){
  const dx=x2-x1,dz=z2-z1,len=Math.sqrt(dx*dx+dz*dz);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(len,.09),M.yellow);
  s.rotation.x=-Math.PI/2; s.rotation.z=Math.atan2(dz,dx);
  s.position.set((x1+x2)/2,.003,(z1+z2)/2); scene.add(s);
}
for(let z=-16;z<=12;z+=3) stripe(-2,z,3,z);
stripe(3,-14,3,-2); stripe(3,3,3,12);

// ── WORKBENCH BUILDER ────────────────────────────────────────────────────────
function workbench(cx,cz){
  place(mkBox(2,.065,.9,M.bench),cx,.925,cz);
  place(mkBox(2,.04,.8,M.panelGrey),cx,.46,cz);
  [[-0.85,-.38],[-.85,.38],[.85,-.38],[.85,.38]].forEach(([dx,dz])=>place(mkBox(.06,.9,.06,M.panelGrey),cx+dx,.45,cz+dz));
  place(mkBox(2,.45,.04,M.panelGrey),cx,1.15,cz+.46);
  addCol(cx,.45,cz,2,.9,.9);
}
function addShelf(cx,cz){
  [.4,.95,1.5].forEach(y=>place(mkBox(1.6,.04,.45,M.panelGrey),cx,y,cz));
  [[-0.75,-.38],[.75,-.38],[-.75,.38],[.75,.38]].forEach(([dx,dz])=>place(mkBox(.05,1.6,.05,M.panelGrey),cx+dx,.8,cz+dz));
  addCol(cx,.8,cz,1.7,1.6,.5);
}

// ── PROPS ─────────────────────────────────────────────────────────────────────
workbench(9,-10); workbench(9,-13); workbench(16,-10);
addShelf(18,-12); addShelf(18,-8);
place(mkBox(3,.04,.03,M.panelGrey),10,2,-13.9);
const spool=new THREE.Mesh(new THREE.TorusGeometry(.35,.1,8,14),M.yellow);
spool.rotation.x=Math.PI/2; place(spool,6,.95,-13);
place(mkBox(.15,.27,.08,M.black),9,.97,-9.5);
const hat=new THREE.Mesh(new THREE.SphereGeometry(.2,10,7,0,Math.PI*2,0,Math.PI*.55),M.yellow);
hat.position.set(9,.97,-12.5); scene.add(hat);

workbench(8,7); workbench(15,7);
const scadaG=new THREE.Group();
const sb=mkBox(2.2,1.8,.1,M.panel); sb.position.set(0,.9,0); scadaG.add(sb);
for(let i=0;i<6;i++){
  const g=new THREE.Mesh(new THREE.CircleGeometry(.13,12),new THREE.MeshBasicMaterial({color:0x001100}));
  const ne=new THREE.Mesh(new THREE.CircleGeometry(.1,12),new THREE.MeshBasicMaterial({color:0x00ff88}));
  g.position.set(-.7+i%3*.7,.6+Math.floor(i/3)*.4,.07); scadaG.add(g);
  ne.position.set(-.7+i%3*.7,.6+Math.floor(i/3)*.4,.08); scadaG.add(ne);
}
scadaG.position.set(18.8,0,8); scadaG.rotation.y=Math.PI/2; scene.add(scadaG);
addCol(18.5,1,8,.25,2,2.5);

addShelf(-5,9); addShelf(-10,9); addShelf(-14,13);
const fuseGrp=new THREE.Group();
const fbMesh=mkBox(.6,.8,.08,new THREE.MeshLambertMaterial({color:0x6a4020}));
fbMesh.position.set(0,.4,0); fuseGrp.add(fbMesh);
for(let i=0;i<6;i++){
  const fu=mkBox(.07,.18,.04,i<4?M.chrome:M.red);
  fu.position.set(-.22+i*.09,.4,.06); fuseGrp.add(fu);
}
fuseGrp.position.set(-15.8,0,9); fuseGrp.rotation.y=-Math.PI/2; scene.add(fuseGrp);
place(mkBox(.35,.7,.25,M.panelGrey),-6,.35,-7); addCol(-6,.35,-7,.35,.7,.25);

// ── INTERACTABLE LIST & DOOR CLASS ───────────────────────────────────────────
export const allInteractables = [];

export class Door {
  constructor(px, pz, baseY, label) {
    this.label=label; this.open=false; this.angle=0; this.target=0;
    this.pivot=new THREE.Group();
    this.pivot.position.set(px,0,pz);
    this.pivot.rotation.y=baseY;
    this.pivot.userData.baseY=baseY;
    scene.add(this.pivot);
    const panel=mkBox(1.05,2.2,.055,M.door); panel.position.set(.525,1.1,0); this.pivot.add(panel);
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.04,8,8),M.chrome);
    knob.position.set(.88,1.05,.045); this.pivot.add(knob);
    [0,1.05].forEach(px2=>{const f=mkBox(.07,2.3,.1,M.doorFrame);f.position.set(px2,1.15,0);this.pivot.add(f);});
    const top=mkBox(1.19,.09,.1,M.doorFrame); top.position.set(.525,2.26,0); this.pivot.add(top);
    const strip=new THREE.Mesh(new THREE.BoxGeometry(1.0,.035,.065),M.eBlue);
    strip.position.set(.525,2.3,0); this.pivot.add(strip);
    panel.userData={type:'door',door:this}; knob.userData={type:'door',door:this};
    allInteractables.push(panel,knob);
    this.panel=panel; this._syncCol();
  }
  _syncCol(){
    if(this._ci!==undefined) colBoxes.splice(this._ci,1);
    if(!this.open){
      const p=this.pivot.position, ry=this.pivot.userData.baseY;
      this._ci=colBoxes.length;
      colBoxes.push(new THREE.Box3(
        new THREE.Vector3(p.x+Math.cos(ry)*.525-.6,0,p.z+Math.sin(ry)*.525-.08),
        new THREE.Vector3(p.x+Math.cos(ry)*.525+.6,2.3,p.z+Math.sin(ry)*.525+.08)
      ));
    } else this._ci=undefined;
  }
  toggle(Audio,notify){
    this.open=!this.open; this.target=this.open?-Math.PI*.72:0;
    if(Audio) Audio.door(this.open);
    if(notify) notify(this.open?`🚪 ${this.label} — Opened`:`🚪 ${this.label} — Closed`);
    this._syncCol();
  }
  update(dt){
    const diff=this.target-this.angle;
    if(Math.abs(diff)>.001){ this.angle+=diff*Math.min(1,dt*9); this.pivot.rotation.y=this.pivot.userData.baseY+this.angle; }
  }
}

export const doors = [
  new Door(3, -8.5, Math.PI, 'Workshop'),
  new Door(3,  7.5, Math.PI, 'Control Room'),
  new Door(-2,-4.5, 0,       'Corridor'),
  new Door(-2, 9.5, 0,       'Storage'),
];

// ── BREAKER PANEL & SWITCH ────────────────────────────────────────────────────
export function breakerPanel(cx,cy,cz,ry,id,label){
  const grp=new THREE.Group();
  const base=mkBox(.72,1.15,.1,M.panel); base.position.set(0,1.5,0); grp.add(base);
  const lbl=mkBox(.6,.1,.03,new THREE.MeshBasicMaterial({color:0x0a1a2a}));
  lbl.position.set(0,2.15,.06); grp.add(lbl);
  const breakers=[];
  for(let i=0;i<6;i++){
    const row=Math.floor(i/2),col=i%2,on=i<4;
    const br=mkBox(.11,.19,.04,on?M.green:M.red);
    br.position.set(-.16+col*.32,1.88-row*.26,.07); grp.add(br);
    br.userData={type:'breaker',panel:id,idx:i,label:`${label} C${i+1}`};
    breakers.push({mesh:br,on}); allInteractables.push(br);
  }
  grp.position.set(cx,cy,cz); grp.rotation.y=ry; scene.add(grp);
  return {grp,breakers};
}
export function switchBox(cx,cy,cz,ry,id,label,on){
  const grp=new THREE.Group();
  const base=mkBox(.3,.22,.07,M.panelGrey); base.position.set(0,0,0); grp.add(base);
  const sw=mkBox(.09,.15,.05,on?M.green:M.red); sw.position.set(0,0,.07); grp.add(sw);
  sw.userData={type:'switch',id,label,on,mesh:sw};
  allInteractables.push(sw);
  grp.position.set(cx,cy,cz); grp.rotation.y=ry; scene.add(grp);
  return sw;
}

export const bp1      = breakerPanel(18.8, 0, -5, Math.PI/2, 'wsBreaker','WS');
export const mainPanel= breakerPanel( 9.8, 0, 10, Math.PI/2, 'mainBreaker','MAIN');
export const wsSwitch = switchBox(2.2, 1.55, -9, Math.PI/2, 'wsSwitch','Workshop Pwr', true);
export const ctrlSwitch=switchBox(-1.8,1.55,  7,          0,'ctrlSwitch','Control Pwr', true);

// E-Stop on SCADA
const eStop=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.055,14),M.red);
eStop.rotation.x=Math.PI/2; eStop.position.set(18.8,.15,8.1); scene.add(eStop);
eStop.userData={type:'estop',label:'Emergency Stop'}; allInteractables.push(eStop);
export { eStop };

// fuse box interactable
fbMesh.userData={type:'fusebox',label:'Fuse Panel'}; allInteractables.push(fbMesh);

import * as THREE from 'three';
import { makeFloorTex, makeWallTex, makeCeilTex, makeMetalTex, makeConcrTex } from './textures.js';

// ── RENDERER ──────────────────────────────────────────────────────────────────
const isMobile = navigator.maxTouchPoints > 0;
export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: !isMobile,
  powerPreference:'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.2 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0d12);
scene.fog = new THREE.Fog(0x0a0d12, 20, 46);

export const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.05, 55);
camera.position.set(0, 1.72, 10);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ── TEXTURES ──────────────────────────────────────────────────────────────────
const fT=makeFloorTex(); fT.repeat.set(5,5);
const wT=makeWallTex();  wT.repeat.set(3,1.5);
const cT=makeCeilTex();  cT.repeat.set(5,5);
const mT=makeMetalTex(); mT.repeat.set(2,2);
const kT=makeConcrTex(); kT.repeat.set(3,1.5);

// ── MATERIALS ─────────────────────────────────────────────────────────────────
export const M = {
  floor:    new THREE.MeshLambertMaterial({map:fT}),
  wall:     new THREE.MeshLambertMaterial({map:wT}),
  ceil:     new THREE.MeshLambertMaterial({map:cT}),
  concrete: new THREE.MeshLambertMaterial({map:kT}),
  door:     new THREE.MeshLambertMaterial({color:0xb08050}),
  doorFrame:new THREE.MeshLambertMaterial({map:mT,color:0x99aabb}),
  panel:    new THREE.MeshLambertMaterial({color:0x1e3a52}),
  panelGrey:new THREE.MeshLambertMaterial({map:mT,color:0x5a6a78}),
  yellow:   new THREE.MeshLambertMaterial({color:0xf0c060,emissive:new THREE.Color(0xf0c060),emissiveIntensity:.35}),
  red:      new THREE.MeshLambertMaterial({color:0xdd4433,emissive:new THREE.Color(0xdd4433),emissiveIntensity:.4}),
  green:    new THREE.MeshLambertMaterial({color:0x33dd66,emissive:new THREE.Color(0x33dd66),emissiveIntensity:.5}),
  orange:   new THREE.MeshLambertMaterial({color:0xff8833,emissive:new THREE.Color(0xff8833),emissiveIntensity:.4}),
  bench:    new THREE.MeshLambertMaterial({color:0x8a7055}),
  black:    new THREE.MeshLambertMaterial({color:0x141414}),
  chrome:   new THREE.MeshLambertMaterial({map:mT,color:0xbccedd}),
  pipe:     new THREE.MeshLambertMaterial({map:mT,color:0x667788}),
  eWhite:   new THREE.MeshBasicMaterial({color:0xfff5df}),
  eBlue:    new THREE.MeshBasicMaterial({color:0x2255bb}),
  eGreen:   new THREE.MeshBasicMaterial({color:0x22ff88}),
  eRed:     new THREE.MeshBasicMaterial({color:0xff3322}),
  window:   new THREE.MeshBasicMaterial({color:0x88c4f5,transparent:true,opacity:.35,side:THREE.DoubleSide}),
  winFrame: new THREE.MeshLambertMaterial({color:0xf0f0f0}),
  signYellow:new THREE.MeshBasicMaterial({color:0xffe000}),
  signBlack: new THREE.MeshBasicMaterial({color:0x111111}),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
export function mkBox(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
export function place(m,x,y,z){m.position.set(x,y,z);scene.add(m);return m;}

// ── COLLISION ─────────────────────────────────────────────────────────────────
export const colBoxes=[];
export function addCol(x,y,z,w,h,d){
  colBoxes.push(new THREE.Box3(
    new THREE.Vector3(x-w/2,y-h/2,z-d/2),
    new THREE.Vector3(x+w/2,y+h/2,z+d/2)
  ));
}
export function checkCol(pos){
  const pb=new THREE.Box3(
    new THREE.Vector3(pos.x-.32,pos.y-1.65,pos.z-.32),
    new THREE.Vector3(pos.x+.32,pos.y+.12,pos.z+.32)
  );
  return colBoxes.some(b=>b.intersectsBox(pb));
}

// ── LIGHTING ──────────────────────────────────────────────────────────────────
export const roomLightSets={};
export const ambLight=new THREE.AmbientLight(0x1a2233,0.28);
scene.add(ambLight);
scene.add(new THREE.HemisphereLight(0x2a3650,0x0a0a05,0.18));
const sunLight=new THREE.DirectionalLight(0x8899cc,0.45);
sunLight.position.set(-8,6,-3); scene.add(sunLight);
export const warnLight=new THREE.PointLight(0xff2200,0,14);
warnLight.position.set(0,3,10); scene.add(warnLight);

export function mkLight(x,y,z,color,intensity,key){
  const pt=new THREE.PointLight(color,intensity,22,2);
  pt.position.set(x,y,z); scene.add(pt);
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.3,6),M.eWhite);
  tube.rotation.z=Math.PI/2; tube.position.set(x,3.85,z); scene.add(tube);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.26,12),M.eWhite);
  disc.rotation.x=Math.PI/2; disc.position.set(x,3.82,z); scene.add(disc);
  if(key){if(!roomLightSets[key])roomLightSets[key]=[];roomLightSets[key].push(pt);}
  return pt;
}

// ── LAYOUT CONSTANTS ──────────────────────────────────────────────────────────
// Expanded facility: ~50×42 units, H=4m
const H=4.0, WT=0.22;

// ── ROOM BUILDERS ─────────────────────────────────────────────────────────────
function mkFloor(cx,cz,w,d){
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M.floor);
  fl.rotation.x=-Math.PI/2; fl.position.set(cx,.002,cz); scene.add(fl);
  const cl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M.ceil);
  cl.rotation.x=Math.PI/2; cl.position.set(cx,H,cz); scene.add(cl);
}
function mkWall(x,y,z,w,h,d,mat){
  const m=mkBox(w,h,d,mat||M.wall); m.position.set(x,y,z); scene.add(m); addCol(x,y,z,w,h,d);
}
function seg(mn,mx,mid,dw){
  const d0=mid-dw/2,d1=mid+dw/2,s=[];
  if(d0>mn)s.push([mn,d0,false]);
  s.push([d0,d1,true]);
  if(d1<mx)s.push([d1,mx,false]);
  return s;
}
// Wall with door opening: isX=true means wall at constant x, opening along Z
function wallDoor(coord,a,b,doorMid,doorW,isX){
  seg(a,b,doorMid,doorW).forEach(([sa,sb,isDoor])=>{
    const len=sb-sa,mid=(sa+sb)/2;
    if(isX){
      if(isDoor){const lt=mkBox(WT,H-2.4,len,M.wall);lt.position.set(coord,2.4+(H-2.4)/2,mid);scene.add(lt);}
      else{const wl=mkBox(WT,H,len,M.wall);wl.position.set(coord,H/2,mid);scene.add(wl);addCol(coord,H/2,mid,WT,H,len);}
    }else{
      if(isDoor){const lt=mkBox(len,H-2.4,WT,M.wall);lt.position.set(mid,2.4+(H-2.4)/2,coord);scene.add(lt);}
      else{const wl=mkBox(len,H,WT,M.wall);wl.position.set(mid,H/2,coord);scene.add(wl);addCol(mid,H/2,coord,len,H,WT);}
    }
  });
}

// ── FLOORS & CEILINGS ─────────────────────────────────────────────────────────
//  Layout (top-down, all coords):
//  HALL:      x=-1 to 5,  z=-22 to 16  (6w × 38d)
//  WORKSHOP:  x=5 to 25,  z=-22 to -2  (20w × 20d)
//  CONTROL:   x=5 to 22,  z=2  to 16   (17w × 14d)
//  STORAGE:   x=-15 to -1, z=2 to 16   (14w × 14d)
//  CORRIDOR:  x=-10 to -1, z=-16 to 2  (9w  × 18d)
//  UTILITY:   x=5 to 13,  z=16 to 24   (8w  × 8d)

mkFloor(2,  -3,  6, 38);    // Hall
mkFloor(15, -12, 20,20);    // Workshop
mkFloor(13.5,9, 17,14);     // Control
mkFloor(-8,  9, 14,14);     // Storage
mkFloor(-5.5,-7, 9, 18);    // Corridor
mkFloor(9,   20,  8, 8);    // Utility

// ── OUTER WALLS ───────────────────────────────────────────────────────────────
// Hall N/S
mkWall(2,  H/2,-22.1, 6,H,WT,M.concrete);
mkWall(2,  H/2, 16.1, 6,H,WT,M.concrete);
// Workshop N/S/E
mkWall(15, H/2,-22.1,20,H,WT,M.concrete);
mkWall(25.1,H/2,-12,WT,H,20,M.concrete);
// Control E/N
mkWall(22.1,H/2, 9, WT,H,14,M.concrete);
mkWall(13.5,H/2,16.1,17,H,WT,M.concrete);
// Storage W/N
mkWall(-15.1,H/2,9, WT,H,14,M.concrete);
mkWall(-8,  H/2,16.1,14,H,WT,M.concrete);
// Corridor W/S
mkWall(-10.1,H/2,-7,WT,H,18,M.concrete);
mkWall(-5.5, H/2,-16.1,9,H,WT,M.concrete);
// Utility N
mkWall(9,   H/2, 24.1,8,H,WT,M.concrete);
mkWall(13.1,H/2, 20, WT,H,8,M.concrete);
mkWall(4.9, H/2, 20, WT,H,8,M.concrete);

// ── INNER WALLS WITH DOORS ────────────────────────────────────────────────────
// East hall wall (x=5): workshop door at z=-12, control door at z=9
wallDoor(5,-22,-2, -12,1.2,true);   // workshop opening
wallDoor(5,  2,16,   9,1.2,true);   // control  opening
// West hall wall (x=-1): corridor door at z=-7, storage door at z=9
wallDoor(-1,-16,2,  -7,1.2,true);   // corridor opening
wallDoor(-1,  2,16,  9,1.2,true);   // storage  opening
// Workshop south z=-2 (x=5 to 25)
mkWall(15, H/2,-2.1,20,H,WT);
// Workshop north already outer (z=-22)
// Control south z=2 (x=5 to 22)
mkWall(13.5,H/2,2.1,17,H,WT);
// Control north z=16 - outer
// Storage east x=-1 (z=2 to 16, door at z=9 - already done via hall wall)
mkWall(-8,H/2,2.1,14,H,WT);        // storage south
// Corridor east x=-1 (already hall west wall above)
mkWall(-5.5,H/2,-16.1,9,H,WT,M.concrete); // corridor south - already done
mkWall(-10.1,H/2,-7,WT,H,18,M.concrete);  // corridor west - already done
// Corridor north z=2
mkWall(-5.5,H/2,2.1,9,H,WT);
// Utility south z=16 with door
wallDoor(9,5,13,9,1.2,false);        // utility door at z=16, x=9 (isX=false: z-constant wall)

// ── PILLARS ───────────────────────────────────────────────────────────────────
function pillar(x,z){
  const p=mkBox(.45,H,.45,M.concrete); p.position.set(x,H/2,z); scene.add(p); addCol(x,H/2,z,.45,H,.45);
  place(mkBox(.58,.08,.58,M.winFrame),x,.04,z);
  place(mkBox(.58,.08,.58,M.winFrame),x,H-.04,z);
}
[[-1,-12],[-1,-4],[5,-12],[5,-4],[5,4]].forEach(([x,z])=>pillar(x,z));

// ── WINDOW ────────────────────────────────────────────────────────────────────
const wg=new THREE.Mesh(new THREE.PlaneGeometry(3,1.5),M.window);
wg.position.set(2,2.4,-22.05); scene.add(wg);
place(mkBox(3.2,.08,.2,M.winFrame),2,3.2,-22.06);
place(mkBox(3.2,.08,.2,M.winFrame),2,1.6,-22.06);
place(mkBox(.1,1.6,.2,M.winFrame),-0.2,2.4,-22.06);
place(mkBox(.1,1.6,.2,M.winFrame),4.2,2.4,-22.06);
place(mkBox(3.2,.08,.3,M.winFrame),2,1.55,-21.9);
const winPt=new THREE.PointLight(0x88aadd,1.4,16);
winPt.position.set(2,2.5,-20); scene.add(winPt);

// ── LIGHTS ────────────────────────────────────────────────────────────────────
for(let z=-20;z<=14;z+=7)mkLight(2,H-.18,z,0xfff0dd,2.4,'hall');
mkLight(9, H-.18,-10,0xffe8aa,2.5,'workshop');
mkLight(18,H-.18,-10,0xffe8aa,2.2,'workshop');
mkLight(22,H-.18, -6,0xffe8aa,1.8,'workshop');
mkLight(9, H-.18,-18,0xffe8aa,2.0,'workshop');
mkLight(18,H-.18,-18,0xffe8aa,1.8,'workshop');
mkLight(11,H-.18,  8,0x99bbff,2.4,'control');
mkLight(18,H-.18,  9,0x99bbff,2.0,'control');
mkLight(11,H-.18, 14,0x99bbff,1.8,'control');
mkLight(-5,H-.18,  8,0xffcc88,2.2,'storage');
mkLight(-11,H-.18, 8,0xffcc88,1.8,'storage');
mkLight(-5,H-.18, 14,0xffcc88,1.8,'storage');
mkLight(-5.5,H-.18,-7,0xddeeff,1.8,'corridor');
mkLight(-5.5,H-.18,-12,0xddeeff,1.4,'corridor');
mkLight(9,H-.18, 20,0xffffff,2.0,'utility');

// ── SAFETY STRIPES ────────────────────────────────────────────────────────────
function stripe(x1,z1,x2,z2){
  const dx=x2-x1,dz=z2-z1,len=Math.sqrt(dx*dx+dz*dz);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(len,.1),M.yellow);
  s.rotation.x=-Math.PI/2; s.rotation.z=Math.atan2(dz,dx);
  s.position.set((x1+x2)/2,.003,(z1+z2)/2); scene.add(s);
}
for(let z=-20;z<=14;z+=3)stripe(-1,z,5,z);
stripe(5,-22,5,-2); stripe(5,2,5,16);

// ── EMERGENCY LIGHTS (green strip near floor) ─────────────────────────────────
function emergencyLight(x,y,z,ry=0){
  const g=new THREE.Group();
  const base=mkBox(.08,.18,.8,M.black); base.position.set(0,0,0); g.add(base);
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(.06,.7),M.eGreen);
  strip.position.set(.05,0,0); g.add(strip);
  g.position.set(x,y,z); g.rotation.y=ry; scene.add(g);
  const ept=new THREE.PointLight(0x00ff88,.3,3);
  ept.position.set(x+.2,y,z); scene.add(ept);
}
for(let z=-21;z<=13;z+=4)emergencyLight(4.9,.25,z,Math.PI/2);
for(let z=-21;z<=13;z+=4)emergencyLight(-0.9,.25,z,-Math.PI/2);

// ── CABLE TRAYS (ceiling) ─────────────────────────────────────────────────────
function cableTray(x1,z1,x2,z2,y=H-.35){
  const dx=x2-x1,dz=z2-z1,len=Math.sqrt(dx*dx+dz*dz);
  const t=mkBox(len,.06,.35,M.panelGrey);
  t.rotation.y=Math.atan2(dx,dz);
  t.position.set((x1+x2)/2,y,(z1+z2)/2); scene.add(t);
  // side rails
  [-1,1].forEach(s=>{
    const r=mkBox(len,.08,.04,M.panelGrey);
    r.rotation.y=Math.atan2(dx,dz);
    r.position.set((x1+x2)/2,y+.05,(z1+z2)/2);
    // rail offset
    const perp=new THREE.Vector3(-dz,0,dx).normalize().multiplyScalar(s*.15);
    r.position.add(perp); scene.add(r);
  });
}
cableTray(-1,  -22, 25, -22); // workshop north
cableTray(5,   -22, 5,   16); // east hall wall ceiling line
cableTray(-1,   -3,  5,  -3); // across hall mid
cableTray(-1,   16,-15,  16); // storage north

// ── CONDUIT PIPES ─────────────────────────────────────────────────────────────
function conduit(x,z,len,ry=0,y=2.5){
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,len,8),M.pipe);
  pipe.rotation.z=Math.PI/2; pipe.rotation.y=ry;
  pipe.position.set(x,y,z); scene.add(pipe);
}
for(let z=-20;z<=-4;z+=5)conduit(4.8,z,0.8,0,2.8);  // east hall wall conduits
conduit(5,-5,16,0,3.0);  // long vertical conduit

// ── JUNCTION BOXES (on walls) ─────────────────────────────────────────────────
function junctionBox(x,y,z,ry=0){
  const b=mkBox(.18,.18,.1,M.panelGrey); b.position.set(x,y,z); b.rotation.y=ry; scene.add(b);
  const c=new THREE.Mesh(new THREE.CircleGeometry(.03,8),M.chrome);
  c.rotation.y=ry+Math.PI/2; c.position.set(x+(ry===0?.06:0),y,(ry===0?z:z+.06)); scene.add(c);
}
[-20,-14,-8,-2,6,12].forEach(z=>junctionBox(4.88,1.8,z,Math.PI/2));
[-20,-14,-8].forEach(z=>junctionBox(-0.88,1.8,z,-Math.PI/2));

// ── WORKBENCH ──────────────────────────────────────────────────────────────────
function workbench(cx,cz){
  place(mkBox(2.4,.07,1.0,M.bench),cx,.96,cz);
  place(mkBox(2.4,.04,.9,M.panelGrey),cx,.5,cz);
  [[-1.1,-.42],[-1.1,.42],[1.1,-.42],[1.1,.42]].forEach(([dx,dz])=>place(mkBox(.07,.96,.07,M.panelGrey),cx+dx,.48,cz+dz));
  place(mkBox(2.4,.5,.05,M.panelGrey),cx,1.22,cz+.5);
  addCol(cx,.48,cz,2.4,.96,1.0);
}
function addShelf(cx,cz,ry=0){
  const g=new THREE.Group();
  [.44,1.05,1.65].forEach(y=>{const s=mkBox(1.8,.05,.5,M.panelGrey);s.position.set(0,y,0);g.add(s);});
  [[-0.85,-.22],[.85,-.22],[-.85,.22],[.85,.22]].forEach(([dx,dz])=>{const p=mkBox(.06,1.8,.06,M.panelGrey);p.position.set(dx,.9,dz);g.add(p);});
  g.position.set(cx,0,cz); g.rotation.y=ry; scene.add(g);
  addCol(cx,.9,cz,1.85,1.8,.55);
}

// ── HIGH-VOLTAGE SIGN ──────────────────────────────────────────────────────────
function hvSign(x,y,z,ry=0){
  const base=mkBox(.5,.32,.04,M.signYellow); base.position.set(x,y,z); base.rotation.y=ry; scene.add(base);
  const text=mkBox(.44,.26,.045,M.signBlack); text.position.set(x+(ry===0?0:.001),y,z+(ry===0?.001:0)); text.rotation.y=ry; scene.add(text);
}
hvSign(24.9,2.0,-12,Math.PI/2);
hvSign(24.9,2.0,-6, Math.PI/2);
hvSign(4.88,2.0,-18,Math.PI/2);

// ── WALL OUTLETS ───────────────────────────────────────────────────────────────
function outlet(x,y,z,ry=0){
  const b=mkBox(.14,.2,.06,M.panelGrey); b.position.set(x,y,z); b.rotation.y=ry; scene.add(b);
  // two sockets
  [-0.03,.03].forEach(dx=>{
    const h=new THREE.Mesh(new THREE.CircleGeometry(.015,8),M.black);
    const normal=new THREE.Vector3(Math.sin(ry),0,Math.cos(ry));
    h.lookAt(b.position.clone().add(normal));
    h.position.set(x+normal.x*.04+dx,y,z+normal.z*.04); scene.add(h);
  });
}
[-20,-16,-12,-8,-4,0,4,8,12].forEach(z=>outlet(4.88,.45,z,Math.PI/2));

// ── TRANSFORMER ───────────────────────────────────────────────────────────────
function transformer(cx,cz){
  place(mkBox(1.8,2.4,1.0,M.panelGrey),cx,1.2,cz);
  place(mkBox(1.6,.1,.8,M.chrome),cx,2.45,cz);
  // cooling fins
  for(let i=-0.7;i<=0.7;i+=0.2){
    place(mkBox(.04,1.6,.85,M.panelGrey),cx+i,1.2,cz);
  }
  // terminals
  [-.3,0,.3].forEach(dx=>place(mkBox(.06,.2,.06,M.chrome),cx+dx,2.6,cz-.35));
  addCol(cx,1.2,cz,1.85,2.4,1.05);
}
transformer(22,  -16);
transformer(22,  -8);

// ── PROPS: WORKSHOP ───────────────────────────────────────────────────────────
workbench(9, -8);  workbench(9,-14); workbench(9,-19);
workbench(18,-8);  workbench(18,-14);
addShelf(23,-8,Math.PI/2); addShelf(23,-14,Math.PI/2); addShelf(23,-19,Math.PI/2);

// Wire spool (on floor)
const spool=new THREE.Mesh(new THREE.TorusGeometry(.45,.12,8,14),M.yellow);
spool.rotation.x=Math.PI/2; place(spool,7,.12,-19);
const spool2=new THREE.Mesh(new THREE.TorusGeometry(.35,.1,8,14),M.chrome);
spool2.rotation.x=Math.PI/2; place(spool2,8,.1,-19);

// Multimeter on bench
place(mkBox(.18,.3,.1,M.black),9,.98,-7.5);
const mms=new THREE.Mesh(new THREE.PlaneGeometry(.1,.1),new THREE.MeshBasicMaterial({color:0x00ff44}));
mms.position.set(9,1.04,-7.46); scene.add(mms);

// Hard hat
const hat=new THREE.Mesh(new THREE.SphereGeometry(.22,10,7,0,Math.PI*2,0,Math.PI*.55),M.yellow);
hat.position.set(9,1.0,-13.5); scene.add(hat);

// Pegboard
place(mkBox(4,.05,.04,M.panelGrey),9,2.3,-21.9);
// Tools hung on pegboard (simple geometry)
[-1,-.3,.3,1].forEach(dx=>{
  const tool=mkBox(.06,.4,.04,M.chrome); tool.position.set(9+dx,2.0,-21.88); scene.add(tool);
});

// Angle grinder on bench
const grinder=mkBox(.28,.14,.1,M.black); place(grinder,18,1.0,-7.6);

// ── PROPS: CONTROL ROOM ───────────────────────────────────────────────────────
workbench(9, 7); workbench(9,12); workbench(17,7);

// SCADA console
const scadaG=new THREE.Group();
const sb=mkBox(3.0,2.0,.12,M.panel); sb.position.set(0,1.0,0); scadaG.add(sb);
// Screens
[-.8,0,.8].forEach((dx,i)=>{
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(.72,.52),new THREE.MeshBasicMaterial({color:[0x002244,0x002200,0x220011][i]}));
  scr.position.set(dx,.85,.07); scadaG.add(scr);
  // gauge circles
  for(let j=0;j<4;j++){
    const gc=new THREE.Mesh(new THREE.CircleGeometry(.08,12),new THREE.MeshBasicMaterial({color:[0x00ff88,0xffcc00,0xff4422,0x00ccff][j]}));
    gc.position.set(dx-.24+j*.16,1.55,.07); scadaG.add(gc);
  }
});
const eStop=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.07,14),M.red);
eStop.rotation.x=Math.PI/2; eStop.position.set(.4,.18,.1); scadaG.add(eStop);
eStop.userData={type:'estop',label:'Emergency Stop'};
scadaG.position.set(21.9,0,9); scadaG.rotation.y=Math.PI/2; scene.add(scadaG);
addCol(21.7,1,9,.3,2,3.5);

// Operator chair (simple)
const chair=mkBox(.55,.08,.55,M.panelGrey); place(chair,20,0.52,9);
const chairBack=mkBox(.55,.7,.06,M.panelGrey); place(chairBack,20,.94,9.28);

// ── PROPS: STORAGE ────────────────────────────────────────────────────────────
addShelf(-3,8,0); addShelf(-3,14,0);
addShelf(-8,8,0); addShelf(-8,14,0);
addShelf(-13,8,0); addShelf(-13,14,0);

// Fuse box on west wall
const fuseGrp=new THREE.Group();
const fbMesh=mkBox(.72,.95,.1,new THREE.MeshLambertMaterial({color:0x5a3a1a}));
fbMesh.position.set(0,.48,0); fuseGrp.add(fbMesh);
fbMesh.userData={type:'fusebox',label:'Fuse Panel'};
for(let i=0;i<8;i++){
  const fu=mkBox(.07,.2,.05,i<6?M.chrome:M.red);
  fu.position.set(-.28+i*.08,.48,.08); fuseGrp.add(fu);
}
fuseGrp.position.set(-14.9,0,9); fuseGrp.rotation.y=-Math.PI/2; scene.add(fuseGrp);

// Storage boxes / crates
[[-.4,7.5],[-.4,12],[-5,15.5],[-10,15.5]].forEach(([x,z])=>{
  const box=mkBox(1.2,.9,1.2,new THREE.MeshLambertMaterial({color:0x6a5a40}));
  place(box,x,.45,z);
  addCol(x,.45,z,1.2,.9,1.2);
});

// ── PROPS: CORRIDOR ───────────────────────────────────────────────────────────
place(mkBox(.4,.8,.3,M.panelGrey),-7,.4,-8); addCol(-7,.4,-8,.4,.8,.3);
place(mkBox(.4,.8,.3,M.panelGrey),-7,.4,-12); addCol(-7,.4,-12,.4,.8,.3);
// Fire extinguisher
const ext=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.6,10),M.red);
ext.position.set(-0.9,.3,-5); scene.add(ext);
const extTop=new THREE.Mesh(new THREE.CylinderGeometry(.04,.08,.1,8),M.chrome);
extTop.position.set(-0.9,.65,-5); scene.add(extTop);
// First Aid
const aid=mkBox(.35,.3,.1,new THREE.MeshLambertMaterial({color:0xcc2222})); place(aid,-0.88,1.6,-12,-Math.PI/2);

// ── PROPS: UTILITY ROOM ───────────────────────────────────────────────────────
// Main panel boxes
[[10,17],[10,22],[6,17],[6,22]].forEach(([x,z])=>{
  place(mkBox(.3,1.2,.25,M.panel),x,.6,z);
  addCol(x,.6,z,.3,1.2,.25);
});

// ── INTERACTABLE SYSTEMS ──────────────────────────────────────────────────────
export const allInteractables=[];
allInteractables.push(fbMesh, eStop);

// ── DOOR CLASS (FIXED) ────────────────────────────────────────────────────────
// For walls at constant X (Z-running): panel is Box(0.05, 2.3, doorW), rotates in XZ
// hingeZ: z of hinge edge; panelHalfW: signed offset (+/- half width) to panel center
// swingAngle: angle to open to (positive = door swings toward +X, negative = toward -X)
export class Door {
  constructor(wallX, hingeZ, panelHalfW, swingAngle, label){
    this.label=label; this.open=false; this.angle=0; this.target=0;
    this.swingAngle=swingAngle;
    const dw=Math.abs(panelHalfW)*2;

    this.pivot=new THREE.Group();
    this.pivot.position.set(wallX,0,hingeZ);
    scene.add(this.pivot);

    // Panel: thin in X, wide in Z (correct for X-constant wall)
    const panel=new THREE.Mesh(new THREE.BoxGeometry(0.06,2.35,dw),M.door);
    panel.position.set(0,1.175,panelHalfW);
    this.pivot.add(panel);

    // Handle
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),M.chrome);
    knob.position.set(panelHalfW>0?.06:-.06, 1.1, panelHalfW*1.7);
    this.pivot.add(knob);

    // Frame (scene children so they don't rotate)
    const doorFrameMat=new THREE.MeshLambertMaterial({map:mT,color:0x99aabb});
    [-1,1].forEach(s=>{
      const fr=mkBox(.12,2.5,.14,doorFrameMat);
      fr.position.set(wallX,1.25,hingeZ+panelHalfW*2*((s+1)/2)*1.0);
      // More precisely at edges of opening
    });
    const openingCenter=hingeZ+panelHalfW;
    const fr1=mkBox(.14,2.6,.14,doorFrameMat); fr1.position.set(wallX,1.3,hingeZ); scene.add(fr1);
    const fr2=mkBox(.14,2.6,.14,doorFrameMat); fr2.position.set(wallX,1.3,hingeZ+panelHalfW*2); scene.add(fr2);
    const frTop=mkBox(.14,0.14,dw+.28,doorFrameMat); frTop.position.set(wallX,2.43,openingCenter); scene.add(frTop);
    // Blue LED strip above door
    const led=new THREE.Mesh(new THREE.BoxGeometry(.06,.04,dw),M.eBlue);
    led.position.set(wallX,2.38,openingCenter); scene.add(led);

    panel.userData={type:'door',door:this};
    knob.userData={type:'door',door:this};
    allInteractables.push(panel,knob);
    this.panel=panel;
    this._addCol();
  }

  _addCol(){
    if(this._ci!==undefined)colBoxes.splice(this._ci,1);
    if(!this.open){
      const p=this.pivot.position;
      const a=this.pivot.userData?.halfW||0;
      // Approximate closed door collision as a thin Z-slab
      this._ci=colBoxes.length;
      const dw=this.panel.geometry.parameters.depth;
      colBoxes.push(new THREE.Box3(
        new THREE.Vector3(p.x-.1,0, p.z + Math.min(0,dw/2*2-dw)-0.05),
        new THREE.Vector3(p.x+.1,2.4,p.z+dw+0.05)
      ));
    } else this._ci=undefined;
  }

  toggle(Audio,notify){
    this.open=!this.open;
    this.target=this.open?this.swingAngle:0;
    if(Audio)Audio.door(this.open);
    if(notify)notify(this.open?`🚪 ${this.label} — Opened`:`🚪 ${this.label} — Closed`);
    this._addCol();
  }

  update(dt){
    const diff=this.target-this.angle;
    if(Math.abs(diff)>.001){
      this.angle+=diff*Math.min(1,dt*8);
      this.pivot.rotation.y=this.angle;
    }
  }
}

// Door opening half-widths = 0.6 (door width = 1.2)
// Workshop: wall x=5, opening center z=-12. Hinge at z=-12.6, panel goes +0.6 to center at -12
// swingAngle = -π/2 * 0.8 (opens toward -X, into hall) or +π/2 (into workshop)
export const doors=[
  new Door(5,  -12.6,  0.6,  Math.PI*0.72, 'Workshop'),    // opens into workshop (+X)
  new Door(5,    8.4,  0.6, -Math.PI*0.72, 'Control Room'),// opens into hall (-X, but user is in hall going in)
  new Door(-1,  -7.6,  0.6,  Math.PI*0.72, 'Corridor'),
  new Door(-1,   8.4,  0.6,  Math.PI*0.72, 'Storage'),
  new Door(9,   15.4,  0.6, -Math.PI*0.72, 'Utility'),
];

// ── BREAKER PANELS & SWITCHES ─────────────────────────────────────────────────
export function breakerPanel(cx,cy,cz,ry,id,label){
  const grp=new THREE.Group();
  const base=mkBox(.85,1.3,.12,M.panel); base.position.set(0,1.65,0); grp.add(base);
  const lbl=mkBox(.72,.12,.04,new THREE.MeshBasicMaterial({color:0x08121e}));
  lbl.position.set(0,2.38,.07); grp.add(lbl);
  const breakers=[];
  for(let i=0;i<8;i++){
    const row=Math.floor(i/2),col=i%2,on=i<6;
    const br=mkBox(.13,.22,.05,on?M.green:M.red);
    br.position.set(-.19+col*.38,2.12-row*.3,.08); grp.add(br);
    br.userData={type:'breaker',panel:id,idx:i,label:`${label} C${i+1}`};
    breakers.push({mesh:br,on}); allInteractables.push(br);
  }
  grp.position.set(cx,cy,cz); grp.rotation.y=ry; scene.add(grp);
  return{grp,breakers};
}
export function switchBox(cx,cy,cz,ry,id,label,on){
  const grp=new THREE.Group();
  const base=mkBox(.32,.24,.08,M.panelGrey); grp.add(base);
  const sw=mkBox(.1,.18,.06,on?M.green:M.red); sw.position.set(0,0,.08); grp.add(sw);
  sw.userData={type:'switch',id,label,on,mesh:sw};
  allInteractables.push(sw);
  grp.position.set(cx,cy,cz); grp.rotation.y=ry; scene.add(grp);
  return sw;
}

export const bp1       =breakerPanel(24.9,0,-12,Math.PI/2,'wsBreaker','WS');
export const mainPanel =breakerPanel(12.9,0, 20,Math.PI/2,'mainBreaker','MAIN');
export const wsSwitch  =switchBox(4.88,1.7,-8, Math.PI/2,'wsSwitch','Workshop Pwr',true);
export const ctrlSwitch=switchBox(-0.88,1.7,8,  0,'ctrlSwitch','Control Pwr',true);

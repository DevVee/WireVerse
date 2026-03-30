import * as THREE from 'three';

function mkTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  return t;
}

export function makeFloorTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#4a5560'; x.fillRect(0,0,512,512);
  for (let i=0;i<8;i++) for(let j=0;j<8;j++) {
    const v = (Math.random()-.5)*20;
    x.fillStyle = `rgb(${Math.round(88+v)},${Math.round(102+v)},${Math.round(116+v)})`;
    x.fillRect(i*64+2,j*64+2,60,60);
    const g=x.createLinearGradient(i*64,j*64,(i+1)*64,(j+1)*64);
    g.addColorStop(0,'rgba(255,255,255,0.07)'); g.addColorStop(1,'rgba(0,0,0,0.05)');
    x.fillStyle=g; x.fillRect(i*64+2,j*64+2,60,60);
  }
  x.fillStyle='#2a3038';
  for(let i=0;i<=512;i+=64){x.fillRect(i,0,2,512);x.fillRect(0,i,512,2);}
  return mkTex(c);
}

export function makeWallTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#8e9ba8'; x.fillRect(0,0,512,512);
  for (let i=0;i<6000;i++) {
    const v=(Math.random()-.5)*28;
    x.fillStyle=`rgba(${Math.round(142+v)},${Math.round(155+v)},${Math.round(168+v)},0.12)`;
    x.beginPath(); x.arc(Math.random()*512,Math.random()*512,Math.random()*3,0,Math.PI*2); x.fill();
  }
  for(let y=0;y<512;y+=2){
    const v=(Math.random()-.5)*8;
    x.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/600})`;
    x.fillRect(0,y,512,2);
  }
  return mkTex(c);
}

export function makeCeilTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#c8c8c8'; x.fillRect(0,0,512,512);
  for(let i=0;i<8;i++) for(let j=0;j<8;j++){
    const v=(Math.random()-.5)*14;
    x.fillStyle=`rgba(${Math.round(196+v)},${Math.round(196+v)},${Math.round(196+v)},0.5)`;
    x.fillRect(i*64+2,j*64+2,60,60);
  }
  x.strokeStyle='#999'; x.lineWidth=2;
  for(let i=0;i<=512;i+=64){
    x.beginPath();x.moveTo(i,0);x.lineTo(i,512);x.stroke();
    x.beginPath();x.moveTo(0,i);x.lineTo(512,i);x.stroke();
  }
  return mkTex(c);
}

export function makeMetalTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  const g=x.createLinearGradient(0,0,256,256);
  g.addColorStop(0,'#6a7a8a'); g.addColorStop(0.5,'#8a9aaa'); g.addColorStop(1,'#6a7a8a');
  x.fillStyle=g; x.fillRect(0,0,256,256);
  for(let i=0;i<50;i++){
    const px=Math.random()*256;
    x.strokeStyle='rgba(180,200,220,0.18)'; x.lineWidth=0.5;
    x.beginPath(); x.moveTo(px,0); x.lineTo(px+(Math.random()*20-10),256); x.stroke();
  }
  return mkTex(c);
}

export function makeConcrTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle='#7a8a9a'; x.fillRect(0,0,512,512);
  for(let i=0;i<10000;i++){
    const v=(Math.random()-.5)*32;
    x.fillStyle=`rgba(${Math.round(122+v)},${Math.round(138+v)},${Math.round(154+v)},0.09)`;
    x.fillRect(Math.random()*512,Math.random()*512,Math.random()*4,Math.random()*4);
  }
  return mkTex(c);
}

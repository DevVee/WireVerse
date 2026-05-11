import * as THREE from 'three';

// ═══════════════════════════════════════════════════════
//  TEXTURE GENERATORS
// ═══════════════════════════════════════════════════════

export function makeWoodTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  // Base gradient
  const bg = ctx.createLinearGradient(0, 0, 512, 512);
  bg.addColorStop(0,   '#4a2e12');
  bg.addColorStop(0.3, '#5c3a18');
  bg.addColorStop(0.7, '#4e321a');
  bg.addColorStop(1,   '#3d2610');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Grain lines
  for (let i = 0; i < 80; i++) {
    let x = 0, y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    while (x < 512) {
      x += 8 + Math.random() * 18;
      y += (Math.random() - 0.5) * 10;
      ctx.lineTo(x, y);
    }
    const dark = Math.random() > 0.4;
    ctx.strokeStyle = dark
      ? `rgba(0,0,0,${0.04 + Math.random() * 0.18})`
      : `rgba(255,200,120,${0.015 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.4 + Math.random() * 2.2;
    ctx.stroke();
  }

  // Knots
  for (let k = 0; k < 3; k++) {
    const kx = 60 + Math.random() * 390;
    const ky = 60 + Math.random() * 390;
    const kr = 12 + Math.random() * 22;
    const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 2.4);
    kg.addColorStop(0,   'rgba(15,7,2,0.75)');
    kg.addColorStop(0.45,'rgba(28,14,6,0.45)');
    kg.addColorStop(1,   'transparent');
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr * 1.6, kr, Math.random() * 0.6, 0, Math.PI * 2);
    ctx.fill();
    for (let r = 0; r < 10; r++) {
      const a = (r / 10) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(kx + Math.cos(a) * kr, ky + Math.sin(a) * kr);
      ctx.bezierCurveTo(
        kx + Math.cos(a) * kr * 2.2, ky + Math.sin(a) * kr * 2.2,
        kx + Math.cos(a + 0.35) * kr * 3.5, ky + Math.sin(a + 0.35) * kr * 3.5,
        kx + Math.cos(a + 0.6) * kr * 5, ky + Math.sin(a + 0.6) * kr * 5
      );
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // Edge vignette
  const vg = ctx.createRadialGradient(256, 256, 120, 256, 256, 380);
  vg.addColorStop(0, 'transparent');
  vg.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2.5);
  return tex;
}

export function makePegboardTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1c1c1e';
  ctx.fillRect(0, 0, 256, 256);
  const sp = 18;
  for (let x = sp; x < 256; x += sp) {
    for (let y = sp; y < 256; y += sp) {
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0c';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 0.8, y - 0.8, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fill();
    }
  }
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, Math.random() * 256);
    ctx.lineTo(Math.random() * 256, Math.random() * 256);
    ctx.strokeStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.06})`;
    ctx.lineWidth = Math.random() * 1.5;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 2.5);
  return tex;
}

export function makeConcreteTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1e1e20';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 0.4 + Math.random() * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${0.015 + Math.random() * 0.04})`
      : `rgba(0,0,0,${0.04 + Math.random() * 0.09})`;
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 1.5;
  [128, 256, 384].forEach(v => {
    ctx.beginPath(); ctx.moveTo(v, 0);   ctx.lineTo(v, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, v);   ctx.lineTo(512, v); ctx.stroke();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 4);
  return tex;
}

// ═══════════════════════════════════════════════════════
//  MAIN BENCH BUILDER
//  Returns { spotLight } so lessons can keep a ref
// ═══════════════════════════════════════════════════════

export function buildWorkbench(scene, opts = {}) {
  const {
    benchY = -0.64,
    benchW = 12,
    benchD = 5.5,
    benchH = 0.30,
  } = opts;

  const benchTop = benchY + benchH / 2;
  const benchBot = benchY - benchH / 2;
  const legH     = 1.45;
  const floorY   = benchBot - legH;

  // ── Materials ─────────────────────────────────────────
  const woodTex  = makeWoodTexture();
  const woodMat  = new THREE.MeshStandardMaterial({
    map: woodTex, color: 0x6a4020, roughness: 0.82, metalness: 0,
  });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x2a1608, roughness: 0.92 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x666677, roughness: 0.28, metalness: 0.88 });
  const darkMetal= new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.45, metalness: 0.75 });
  const legMat   = new THREE.MeshStandardMaterial({ color: 0x3d2210, roughness: 0.90 });

  // ── Main bench surface ────────────────────────────────
  const bench = new THREE.Mesh(new THREE.BoxGeometry(benchW, benchH, benchD), woodMat);
  bench.position.y = benchY;
  bench.receiveShadow = true; bench.castShadow = true;
  scene.add(bench);

  // Front lip (darker, slightly protruding)
  const lip = new THREE.Mesh(new THREE.BoxGeometry(benchW, 0.055, 0.10), darkWood);
  lip.position.set(0, benchTop - 0.01, benchD / 2 + 0.01);
  scene.add(lip);

  // Side edges
  [-1, 1].forEach(s => {
    const se = new THREE.Mesh(new THREE.BoxGeometry(0.06, benchH + 0.01, benchD), darkWood);
    se.position.set(s * (benchW / 2 + 0.03), benchY, 0);
    scene.add(se);
  });

  // ── Legs ──────────────────────────────────────────────
  const legOffX = benchW / 2 - 0.35;
  const legOffZ = benchD / 2 - 0.35;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx, sz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, legH, 0.22), legMat);
    leg.position.set(sx * legOffX, benchBot - legH / 2, sz * legOffZ);
    leg.castShadow = true; leg.receiveShadow = true;
    scene.add(leg);
  });

  // Stretcher bar (front)
  const strF = new THREE.Mesh(new THREE.BoxGeometry(benchW - 0.8, 0.10, 0.10), legMat);
  strF.position.set(0, benchBot - legH * 0.55, legOffZ);
  scene.add(strF);

  // ── Floor ─────────────────────────────────────────────
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 14),
    new THREE.MeshStandardMaterial({ map: makeConcreteTexture(), roughness: 0.95, metalness: 0, color: 0x202022 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = true;
  scene.add(floor);

  // ── Back wall (pegboard) ──────────────────────────────
  const wallH  = 5.5;
  const wallMat = new THREE.MeshStandardMaterial({
    map: makePegboardTexture(), color: 0x1a1a1c, roughness: 0.94, metalness: 0,
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(benchW + 4, wallH), wallMat);
  wall.position.set(0, benchBot - legH + wallH / 2, -(benchD / 2) - 0.05);
  wall.receiveShadow = true;
  scene.add(wall);

  // Baseboard strip at base of wall
  const baseboard = new THREE.Mesh(
    new THREE.BoxGeometry(benchW + 4, 0.14, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.95 })
  );
  baseboard.position.set(0, floorY + 0.07, -(benchD / 2) - 0.02);
  scene.add(baseboard);

  // ── Vice (multi-part) ─────────────────────────────────
  const vx = -benchW / 2 + 0.9, vz = benchD / 2 - 0.5;
  // Base plate
  const vBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.10, 0.62), metalMat);
  vBase.position.set(vx, benchTop + 0.05, vz - 0.1);
  scene.add(vBase);
  // Fixed jaw
  const vFixed = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.14), metalMat);
  vFixed.position.set(vx, benchTop + 0.25, vz - 0.38);
  scene.add(vFixed);
  // Moving jaw
  const vMove = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.14), darkMetal);
  vMove.position.set(vx, benchTop + 0.25, vz - 0.05);
  scene.add(vMove);
  // Screw rod
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.55, 10), metalMat);
  screw.rotation.x = Math.PI / 2;
  screw.position.set(vx, benchTop + 0.18, vz - 0.22);
  scene.add(screw);
  // Handle bar
  const hBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8), metalMat);
  hBar.rotation.z = Math.PI / 2;
  hBar.position.set(vx, benchTop + 0.18, vz + 0.15);
  scene.add(hBar);
  [-0.28, 0.28].forEach(dx => {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), darkMetal);
    knob.position.set(vx + dx, benchTop + 0.18, vz + 0.15);
    scene.add(knob);
  });

  // ── Ruler ─────────────────────────────────────────────
  const rulerC = document.createElement('canvas');
  rulerC.width = 256; rulerC.height = 32;
  const rctx = rulerC.getContext('2d');
  rctx.fillStyle = '#e8c842';
  rctx.fillRect(0, 0, 256, 32);
  rctx.fillStyle = '#1a1a00';
  for (let i = 0; i <= 30; i++) {
    const rx = i * (256 / 30);
    const th = i % 5 === 0 ? 20 : (i % 2 === 0 ? 14 : 9);
    rctx.fillRect(rx - 0.5, 0, 1, th);
    if (i % 5 === 0) { rctx.font = '10px monospace'; rctx.fillText(String(i), rx - 4, 30); }
  }
  const rulerTex = new THREE.CanvasTexture(rulerC);
  const ruler = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.025, 0.18),
    new THREE.MeshStandardMaterial({ map: rulerTex, roughness: 0.6 })
  );
  ruler.position.set(benchW / 2 - 2.5, benchTop + 0.012, -1.8);
  scene.add(ruler);

  // ── Wire spool ────────────────────────────────────────
  const spoolX = benchW / 2 - 0.8;
  const spool = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.10, 10, 30),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.65, metalness: 0.05 })
  );
  spool.rotation.y = Math.PI / 2;
  spool.position.set(spoolX, benchTop + 0.32, -1.0);
  scene.add(spool);
  const spoolCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4893a, roughness: 0.4, metalness: 0.7 })
  );
  spoolCore.rotation.z = Math.PI / 2;
  spoolCore.position.copy(spool.position);
  scene.add(spoolCore);

  // ── Overhead bench lamp ───────────────────────────────
  const lampX = benchW / 2 - 1.5;
  const lampZ = -benchD / 2 + 0.5;
  const armMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5, metalness: 0.8 });

  // Wall bracket
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), darkMetal);
  bracket.position.set(lampX, benchTop + 2.8, -(benchD / 2) - 0.0);
  scene.add(bracket);

  // Vertical pipe
  const vPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8), armMat);
  vPipe.position.set(lampX, benchTop + 1.9, -(benchD / 2) + 0.1);
  scene.add(vPipe);

  // Horizontal arm
  const hPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.0, 8), armMat);
  hPipe.rotation.z = Math.PI / 2;
  hPipe.position.set(lampX - 1.0, benchTop + 2.8, lampZ);
  scene.add(hPipe);

  // Shade (double-sided cone - open bottom)
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.44, 0.36, 18, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.8, metalness: 0.55, side: THREE.DoubleSide })
  );
  shade.rotation.x = Math.PI;
  shade.position.set(lampX - 2.0, benchTop + 2.4, lampZ);
  scene.add(shade);

  // Shade inner glow
  const shadeIn = new THREE.Mesh(
    new THREE.ConeGeometry(0.40, 0.32, 18, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffe8a0, emissive: 0xffe8a0, emissiveIntensity: 0.55, side: THREE.BackSide,
    })
  );
  shadeIn.rotation.x = Math.PI;
  shadeIn.position.copy(shade.position);
  scene.add(shadeIn);

  // Bulb
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xfff8d0, emissive: 0xfff8d0, emissiveIntensity: 3.5 })
  );
  bulb.position.set(shade.position.x, shade.position.y + 0.08, shade.position.z);
  scene.add(bulb);

  // SpotLight
  const spotLight = new THREE.SpotLight(0xffe090, 4.5);
  spotLight.position.copy(bulb.position);
  spotLight.target.position.set(shade.position.x, benchTop, lampZ + 0.5);
  spotLight.angle   = 0.52;
  spotLight.penumbra= 0.38;
  spotLight.decay   = 1.6;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set(1024, 1024);
  spotLight.shadow.bias = -0.002;
  scene.add(spotLight);
  scene.add(spotLight.target);

  // Warm fill around lamp
  const lampFill = new THREE.PointLight(0xff8833, 0.7, 6);
  lampFill.position.copy(bulb.position);
  scene.add(lampFill);

  return { spotLight, lampFill };
}

// ═══════════════════════════════════════════════════════
//  LIGHTING RIG
// ═══════════════════════════════════════════════════════

export function buildLightingRig(scene) {
  scene.add(new THREE.HemisphereLight(0x2233aa, 0x1a0e04, 0.55));

  const sun = new THREE.DirectionalLight(0xfff6e0, 2.0);
  sun.position.set(5, 12, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left  = -10; sun.shadow.camera.right = 10;
  sun.shadow.camera.top   =   8; sun.shadow.camera.bottom= -8;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x3366ff, 0.30);
  rim.position.set(-7, 4, -5);
  scene.add(rim);

  return { sun, rim };
}

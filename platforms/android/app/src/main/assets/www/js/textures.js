import * as THREE from 'three';

const _isMob = navigator.maxTouchPoints > 0;

function mkTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = _isMob ? 4 : 8;
  return t;
}

// ── HEIGHT → NORMAL MAP BAKER ─────────────────────────────────────────────────
// Converts a grayscale height canvas to a tangent-space normal map texture.
// Uses the Sobel operator to compute per-pixel surface gradients.
function heightToNormal(heightCanvas, strength = 3.0) {
  const W = heightCanvas.width, H = heightCanvas.height;
  const src = heightCanvas.getContext('2d').getImageData(0, 0, W, H).data;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  const dst = ctx.createImageData(W, H);
  // Wrapping sampler (handles edge wrap for seamless tiling)
  const g = (px, py) => src[((py % H + H) % H * W + (px % W + W) % W) * 4] / 255;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Sobel X gradient (east–west)
      const dX = (-g(x-1,y-1) + g(x+1,y-1)) + (-2*g(x-1,y) + 2*g(x+1,y)) + (-g(x-1,y+1) + g(x+1,y+1));
      // Sobel Y gradient (north–south)
      const dY = (-g(x-1,y-1) - 2*g(x,y-1) - g(x+1,y-1)) + (g(x-1,y+1) + 2*g(x,y+1) + g(x+1,y+1));
      let nx = dX * strength, ny = dY * strength, nz = 1.0;
      const l = Math.sqrt(nx*nx + ny*ny + nz*nz);
      const i = (y * W + x) * 4;
      dst.data[i]   = ((nx/l) * 0.5 + 0.5) * 255 | 0;
      dst.data[i+1] = ((ny/l) * 0.5 + 0.5) * 255 | 0;
      dst.data[i+2] = ((nz/l) * 0.5 + 0.5) * 255 | 0;
      dst.data[i+3] = 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
  return mkTex(out);
}

// ── FLOOR — polished industrial concrete tile ─────────────────────────────────
export function makeFloorTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');

  // Base fill
  x.fillStyle = '#525e6a'; x.fillRect(0, 0, 512, 512);

  const tileSize = 128; // 4×4 grid
  const grout = 3;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tx = col * tileSize + grout;
      const ty = row * tileSize + grout;
      const tw = tileSize - grout * 2;
      const th = tileSize - grout * 2;

      // Per-tile base color variation (subtle)
      const v = (Math.random() - 0.5) * 14;
      const r = Math.round(82 + v), g = Math.round(94 + v), b = Math.round(106 + v);
      x.fillStyle = `rgb(${r},${g},${b})`;
      x.fillRect(tx, ty, tw, th);

      // Radial center-highlight (polished surface)
      const cx2 = tx + tw / 2, cy2 = ty + th / 2;
      const grad = x.createRadialGradient(cx2, cy2, 2, cx2, cy2, tw * 0.72);
      grad.addColorStop(0, 'rgba(255,255,255,0.10)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.03)');
      grad.addColorStop(1, 'rgba(0,0,0,0.08)');
      x.fillStyle = grad; x.fillRect(tx, ty, tw, th);

      // Edge darkening (depth at tile seam)
      x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1.5;
      x.strokeRect(tx + 1, ty + 1, tw - 2, th - 2);
    }
  }

  // Grout lines
  x.fillStyle = '#2e3840';
  for (let i = 0; i <= 512; i += tileSize) {
    x.fillRect(i, 0, grout, 512);
    x.fillRect(0, i, 512, grout);
  }

  // Heavy scuff marks and wear
  for (let i = 0; i < 400; i++) {
    x.strokeStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
    x.lineWidth = Math.random() * 2.5;
    x.beginPath();
    const sx = Math.random() * 512, sy = Math.random() * 512;
    x.moveTo(sx, sy);
    x.lineTo(sx + (Math.random() - 0.5) * 80, sy + (Math.random() - 0.5) * 20);
    x.stroke();
  }
  
  // Overall grime and surface grit
  for (let i = 0; i < 15000; i++) {
    x.fillStyle = `rgba(15, 20, 25, ${Math.random() * 0.08})`;
    x.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 4, Math.random() * 4);
  }

  return mkTex(c);
}

// ── WALL — painted industrial concrete block ──────────────────────────────────
export function makeWallTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');

  // Base: light warm gray (painted wall)
  x.fillStyle = '#bfc6cc'; x.fillRect(0, 0, 512, 512);

  // Heavy paint imperfections / industrial roller texture
  for (let i = 0; i < 20000; i++) {
    const v = (Math.random() - 0.5) * 25;
    x.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 400})`;
    x.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 6, Math.random() * 6);
  }
  
  // Ambient occlusion & floor grime gradient
  const dirtGrad = x.createLinearGradient(0, 512, 0, 350);
  dirtGrad.addColorStop(0, 'rgba(20, 20, 22, 0.45)');
  dirtGrad.addColorStop(1, 'rgba(20, 20, 22, 0.0)');
  x.fillStyle = dirtGrad;
  x.fillRect(0, 0, 512, 512);

  // Cinder-block mortar joints
  const bH = 64, bW = 128;
  x.strokeStyle = 'rgba(90,100,108,0.35)';
  x.lineWidth = 2;

  // Horizontal courses
  for (let row = 0; row * bH < 512; row++) {
    const y = row * bH;
    x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke();

    // Vertical joints — offset every other row
    const offset = (row % 2) * (bW / 2);
    for (let bx = offset; bx < 512 + bW; bx += bW) {
      x.beginPath(); x.moveTo(bx, y); x.lineTo(bx, y + bH); x.stroke();
    }
  }

  // Slight mortar lightening in joint centers
  x.strokeStyle = 'rgba(200,210,218,0.25)';
  x.lineWidth = 0.8;
  for (let row = 0; row * bH < 512; row++) {
    const y = row * bH + 1;
    x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke();
  }

  return mkTex(c);
}

// ── CEILING — drop ceiling acoustic tile ──────────────────────────────────────
export function makeCeilTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');

  // Off-white base
  x.fillStyle = '#d6d6d4'; x.fillRect(0, 0, 512, 512);

  const tileSize = 256; // 2×2 grid of large tiles

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const tx = col * tileSize + 3;
      const ty = row * tileSize + 3;
      const tw = tileSize - 6;
      const th = tileSize - 6;

      // Each tile: very subtle stipple / acoustic texture
      for (let dot = 0; dot < 3500; dot++) {
        const v = (Math.random() - 0.5) * 35;
        x.fillStyle = `rgba(${Math.round(180 + v)},${Math.round(180 + v)},${Math.round(175 + v)},0.45)`;
        x.beginPath();
        x.arc(tx + Math.random() * tw, ty + Math.random() * th, Math.random() * 2.5, 0, Math.PI * 2);
        x.fill();
      }

      // Slight vignette per tile
      const grad = x.createRadialGradient(
        tx + tw / 2, ty + th / 2, 20,
        tx + tw / 2, ty + th / 2, tw * 0.8
      );
      grad.addColorStop(0, 'rgba(255,255,255,0.04)');
      grad.addColorStop(1, 'rgba(0,0,0,0.06)');
      x.fillStyle = grad; x.fillRect(tx, ty, tw, th);
    }
  }

  // T-bar grid frame
  x.fillStyle = '#a8a8a4';
  for (let i = 0; i <= 512; i += tileSize) {
    x.fillRect(i - 2, 0, 5, 512);
    x.fillRect(0, i - 2, 512, 5);
  }

  return mkTex(c);
}

// ── METAL — brushed stainless steel ──────────────────────────────────────────
export function makeMetalTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');

  // Base gradient (light coming from top-left)
  const g = x.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, '#7a8c9e');
  g.addColorStop(0.35, '#9db0c2');
  g.addColorStop(0.65, '#8a9daf');
  g.addColorStop(1, '#6e8090');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);

  // Fine horizontal brush lines (directional finish)
  for (let i = 0; i < 256; i += 1) {
    const alpha = (Math.random() * 0.14) * (i % 3 === 0 ? 1.8 : 0.6);
    x.strokeStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${alpha})`;
    x.lineWidth = 0.5;
    x.beginPath();
    x.moveTo(0, i + Math.random() * 0.5);
    x.lineTo(256, i + Math.random() * 0.5);
    x.stroke();
  }

  // Diagonal glint streaks
  for (let i = 0; i < 8; i++) {
    const px = Math.random() * 256;
    const brightness = Math.random() * 0.22;
    x.strokeStyle = `rgba(230,240,255,${brightness})`;
    x.lineWidth = Math.random() * 1.5 + 0.3;
    x.beginPath();
    x.moveTo(px, 0);
    x.lineTo(px + (Math.random() * 30 - 15), 256);
    x.stroke();
  }

  return mkTex(c);
}

// ── CONCRETE — rough cast concrete ───────────────────────────────────────────
export function makeConcrTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');

  // Base
  x.fillStyle = '#7c8896'; x.fillRect(0, 0, 512, 512);

  // Large aggregate blobs
  for (let i = 0; i < 300; i++) {
    const v = (Math.random() - 0.5) * 28;
    const r = Math.random() * 6 + 1;
    x.fillStyle = `rgba(${Math.round(120 + v)},${Math.round(134 + v)},${Math.round(148 + v)},0.55)`;
    x.beginPath();
    x.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    x.fill();
  }

  // Dense fine sand grain noise for heavy physical texture
  for (let i = 0; i < 25000; i++) {
    const v = (Math.random() - 0.5) * 25;
    x.fillStyle = `rgba(${Math.round(110 + v)},${Math.round(124 + v)},${Math.round(138 + v)},0.18)`;
    x.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 4, Math.random() * 4);
  }

  // Form-board vertical pour lines
  for (let i = 0; i < 12; i++) {
    const bx = Math.random() * 512;
    x.strokeStyle = `rgba(60,72,84,${Math.random() * 0.1})`;
    x.lineWidth = 0.8;
    x.beginPath(); x.moveTo(bx, 0); x.lineTo(bx + (Math.random() - 0.5) * 8, 512); x.stroke();
  }

  // Subtle staining/weathering blotch
  for (let i = 0; i < 6; i++) {
    const bx = Math.random() * 512, by = Math.random() * 512;
    const grad = x.createRadialGradient(bx, by, 0, bx, by, Math.random() * 60 + 20);
    grad.addColorStop(0, 'rgba(50,60,70,0.12)');
    grad.addColorStop(1, 'rgba(50,60,70,0)');
    x.fillStyle = grad;
    x.fillRect(bx - 80, by - 80, 160, 160);
  }

  return mkTex(c);
}

// ── FLOOR NORMAL MAP ─────────────────────────────────────────────────────────
export function makeFloorNorm() {
  const SZ = _isMob ? 256 : 512;
  const c = document.createElement('canvas'); c.width = c.height = SZ;
  const x = c.getContext('2d');
  const tileSize = SZ / 4, grout = Math.max(1, SZ / 170 | 0);

  x.fillStyle = 'rgb(28,28,28)'; x.fillRect(0, 0, SZ, SZ);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tx = col * tileSize + grout, ty = row * tileSize + grout;
      const tw = tileSize - grout * 2, th = tileSize - grout * 2;
      const hv = 170 + ((Math.random() - 0.5) * 24) | 0;
      x.fillStyle = `rgb(${hv},${hv},${hv})`;
      x.fillRect(tx, ty, tw, th);
      // Chamfered tile edge
      const bevel = x.createLinearGradient(tx, ty, tx + 6, ty + 6);
      bevel.addColorStop(0, 'rgba(0,0,0,0.45)'); bevel.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = bevel; x.fillRect(tx, ty, tw, th);
      // Surface micro-relief
      for (let i = 0; i < SZ * 2; i++) {
        const v = ((Math.random() - 0.5) * 18) | 0;
        x.fillStyle = `rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/500})`;
        x.fillRect(tx + Math.random()*tw, ty + Math.random()*th, Math.random()*4+1, 1);
      }
    }
  }
  return heightToNormal(c, 5.0);
}

// ── WALL NORMAL MAP ───────────────────────────────────────────────────────────
export function makeWallNorm() {
  const SZ = _isMob ? 256 : 512;
  const c = document.createElement('canvas'); c.width = c.height = SZ;
  const x = c.getContext('2d');
  const bH = SZ / 8, bW = SZ / 4, mj = Math.max(2, SZ / 128 | 0);

  x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, SZ, SZ);

  // Raised brick faces
  for (let row = 0; row * bH < SZ; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let bx = offset - bW; bx < SZ + bW; bx += bW) {
      const tx = bx + mj + 1, ty = row * bH + mj + 1;
      const tw = bW - mj*2 - 2, th = bH - mj*2 - 2;
      if (tw <= 0 || th <= 0) continue;
      const hv = 148 + ((Math.random() - 0.5) * 16) | 0;
      x.fillStyle = `rgb(${hv},${hv},${hv})`; x.fillRect(tx, ty, tw, th);
      for (let i = 0; i < 60; i++) {
        const v = ((Math.random() - 0.5) * 22) | 0;
        x.fillStyle = `rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/700})`;
        x.fillRect(tx+Math.random()*tw, ty+Math.random()*th, Math.random()*10+2, Math.random()*3+1);
      }
    }
  }
  // Mortar joints — recessed
  x.fillStyle = 'rgb(48,48,48)';
  for (let row = 0; row * bH <= SZ; row++) {
    x.fillRect(0, row*bH, SZ, mj); x.fillRect(0, row*bH+bH-mj, SZ, mj);
    const offset = (row%2)*(bW/2);
    for (let bx = offset; bx < SZ+bW; bx += bW) x.fillRect(bx, row*bH, mj, bH);
  }
  return heightToNormal(c, 6.0);
}

// ── METAL NORMAL MAP ─────────────────────────────────────────────────────────
export function makeMetalNorm() {
  const SZ = 256;
  const c = document.createElement('canvas'); c.width = c.height = SZ;
  const x = c.getContext('2d');

  x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, SZ, SZ);

  // Directional horizontal brush lines
  for (let i = 0; i < SZ; i++) {
    const hv = 128 + ((Math.random() - 0.5) * 14) | 0;
    x.strokeStyle = `rgb(${hv},${hv},${hv})`; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, i+Math.random()*0.4); x.lineTo(SZ, i+Math.random()*0.4); x.stroke();
  }
  // Deep micro-scratches
  for (let i = 0; i < 6; i++) {
    const sy = Math.random() * SZ;
    x.strokeStyle = 'rgb(72,72,72)'; x.lineWidth = Math.random()*1.2+0.4;
    x.beginPath(); x.moveTo(0,sy); x.lineTo(SZ, sy+(Math.random()-0.5)*12); x.stroke();
  }
  // Specular glint streaks
  for (let i = 0; i < 4; i++) {
    const sy = Math.random() * SZ;
    x.strokeStyle = 'rgb(198,198,198)'; x.lineWidth = 0.5;
    x.beginPath(); x.moveTo(0,sy); x.lineTo(SZ, sy+(Math.random()-0.5)*6); x.stroke();
  }
  return heightToNormal(c, 2.2);
}

import * as THREE from 'three';
import { Icons } from '../ui/Icons.js';
import { buildWorkbench, buildLightingRig } from '../learn/WorkbenchBuilder.js';

export class GameScene {
  constructor(renderer, loop, state) {
    this.renderer   = renderer;
    this.loop       = loop;
    this.state      = state;
    this._scene     = null;
    this._camera    = null;
    this._active    = false;
    this._hud       = null;
    this._levelData = null;
    this._t         = 0;
    this._lampFill  = null;
  }

  init() {
    this._buildScene();
    this._buildHUD();
    window.addEventListener('resize', () => this._onResize());
    this.state.on('stateChange', ({ to, payload }) => {
      this._active = to === 'game';
      this._hud.style.display = this._active ? 'flex' : 'none';
      if (this._active && payload) this._levelData = payload;
    });
  }

  _buildScene() {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x0a0e18);
    this._scene.fog = new THREE.FogExp2(0x0a0e18, 0.022);

    this._camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
    this._camera.position.set(0, 2.8, 6.5);
    this._camera.lookAt(0, -0.4, 0);

    // Lighting rig
    buildLightingRig(this._scene);

    // Realistic workbench — bench surface at y = -0.64
    const { lampFill } = buildWorkbench(this._scene, { benchY: -0.64, benchW: 12, benchD: 5.5 });
    this._lampFill = lampFill;

    // ── Wire segments resting on bench ───────────────────────────
    const benchTopY = -0.49; // bench y=-0.64 + h/2=0.15
    const wireColors = [0xcc2222, 0xd8d8d8, 0x1a9e44, 0x2255bb];
    wireColors.forEach((col, i) => {
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 2.4, 20),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.05,
          emissive: col, emissiveIntensity: 0.04 })
      );
      wire.rotation.z = Math.PI / 2;
      wire.position.set(-1.5 + i * 1.0, benchTopY + 0.055, 0.4);
      wire.castShadow = true;
      this._scene.add(wire);

      // Copper ends
      [-1, 1].forEach(s => {
        const ce = new THREE.Mesh(
          new THREE.CylinderGeometry(0.038, 0.038, 0.14, 12),
          new THREE.MeshStandardMaterial({ color: 0xd4893a, roughness: 0.15, metalness: 0.95,
            emissive: 0xd4893a, emissiveIntensity: 0.12 })
        );
        ce.rotation.z = Math.PI / 2;
        ce.position.set(-1.5 + i * 1.0 + s * 1.27, benchTopY + 0.055, 0.4);
        this._scene.add(ce);
      });
    });

    // ── Circuit board prop ────────────────────────────────────────
    const pcbCanvas = document.createElement('canvas');
    pcbCanvas.width = 256; pcbCanvas.height = 160;
    const pc = pcbCanvas.getContext('2d');
    pc.fillStyle = '#0d3320'; pc.fillRect(0, 0, 256, 160);
    pc.strokeStyle = '#00aa44'; pc.lineWidth = 1.5;
    [[20,20,200,20],[20,20,20,140],[200,20,200,60],[20,60,120,60],
     [120,60,120,140],[120,100,200,100]].forEach(([x1,y1,x2,y2]) => {
      pc.beginPath(); pc.moveTo(x1,y1); pc.lineTo(x2,y2); pc.stroke();
    });
    pc.fillStyle = '#00ff66';
    [[20,20],[200,20],[20,60],[120,60],[200,100],[120,140]].forEach(([cx,cy]) => {
      pc.beginPath(); pc.arc(cx,cy,4,0,Math.PI*2); pc.fill();
    });
    const pcbTex = new THREE.CanvasTexture(pcbCanvas);
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.04, 1.4),
      new THREE.MeshStandardMaterial({ map: pcbTex, color: 0x0d3320, roughness: 0.7, metalness: 0.15 })
    );
    pcb.position.set(2.5, benchTopY + 0.02, -0.8);
    pcb.castShadow = true;
    this._scene.add(pcb);
  }

  _buildHUD() {
    this._hud = document.createElement('div');
    this._hud.id = 'game-hud';
    this._hud.style.display = 'none';
    this._hud.innerHTML = `
      <div class="hud-top">
        <button class="hud-btn" id="hud-menu">${Icons.back} MENU</button>
        <div class="hud-progress">
          <div class="hud-bar-track">
            <div class="hud-bar-fill" id="hud-fill" style="width:60%"></div>
          </div>
          <span id="hud-pct">60%</span>
        </div>
        <button class="hud-btn" id="hud-pause">${Icons.pause}</button>
      </div>
      <div class="hud-task">
        <div class="hud-task-title">TASK</div>
        <p class="hud-task-text">
          Connect the <strong>yellow wire</strong> from the battery
          <strong>positive (+)</strong> to the switch.
        </p>
      </div>
    `;
    document.getElementById('ui-root').appendChild(this._hud);
    this._hud.querySelector('#hud-menu').addEventListener('click', () => {
      this.state.setState('menu');
    });
  }

  update(delta) {
    if (!this._active) return;
    this._t += delta;
    // Subtle lamp flicker
    if (this._lampFill) {
      this._lampFill.intensity = 0.65 + Math.sin(this._t * 3.1) * 0.04;
    }
    this.renderer.instance.render(this._scene, this._camera);
  }

  _onResize() {
    if (!this._camera) return;
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
  }
}

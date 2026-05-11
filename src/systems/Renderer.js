import * as THREE from 'three';

export class Renderer {
  constructor() {
    this.canvas = null;
    this._renderer = null;
  }

  init() {
    this.canvas = document.getElementById('game-canvas');

    this._renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,           // Off for mobile perf
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,             // Not needed, saves memory
      depth: true
    });

    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.shadowMap.enabled = false;

    window.addEventListener('resize', () => this._onResize());
    this.hide();
  }

  show() { this.canvas.style.display = 'block'; }
  hide() { this.canvas.style.display = 'none'; }

  get instance() { return this._renderer; }

  _onResize() {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export class Loop {
  constructor() {
    this._callbacks = [];
    this._running = false;
    this._raf = null;
    this._lastTime = 0;
    this._tick = this._tick.bind(this);
  }

  add(callback) { this._callbacks.push(callback); }

  remove(callback) {
    this._callbacks = this._callbacks.filter(cb => cb !== callback);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  _tick(timestamp) {
    if (!this._running) return;
    // Cap delta to avoid spiral-of-death on tab restore
    const delta = Math.min((timestamp - this._lastTime) / 1000, 0.1);
    this._lastTime = timestamp;
    for (const cb of this._callbacks) cb(delta, timestamp);
    this._raf = requestAnimationFrame(this._tick);
  }
}

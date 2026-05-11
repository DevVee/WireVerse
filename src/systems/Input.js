export class Input {
  constructor() {
    this._touches = new Map();
    this._listeners = {};
  }

  init() {
    document.addEventListener('touchstart', e => this._onTouchStart(e), { passive: true });
    document.addEventListener('touchend',   e => this._onTouchEnd(e),   { passive: true });
    document.addEventListener('touchmove',  e => this._onTouchMove(e),  { passive: true });
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
    return () => this.off(event, cb);
  }

  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(fn => fn !== cb);
  }

  _onTouchStart(e) {
    for (const t of e.changedTouches) {
      this._touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    this._emit('touchstart', e);
  }

  _onTouchMove(e) {
    this._emit('touchmove', e);
  }

  _onTouchEnd(e) {
    for (const t of e.changedTouches) {
      this._touches.delete(t.identifier);
    }
    this._emit('touchend', e);
  }

  _emit(event, data) {
    const list = this._listeners[event];
    if (!list) return;
    for (const cb of list) cb(data);
  }

  get activeTouches() { return this._touches; }
}

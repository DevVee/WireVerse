export class StateManager {
  constructor() {
    this._state = null;
    this._payload = null;
    this._listeners = {};
  }

  get state()   { return this._state; }
  get payload() { return this._payload; }

  setState(newState, payload = null) {
    const prev = this._state;
    this._state = newState;
    this._payload = payload;
    this._emit('stateChange', { from: prev, to: newState, payload });
  }

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  _emit(event, data) {
    const list = this._listeners[event];
    if (!list) return;
    for (const cb of list) cb(data);
  }
}

// Web Audio API sound system — all sounds synthesized, zero external files
import { Database } from './Database.js';

let _ctx = null;
let _ambientNode = null;
let _ambientGain = null;
let _masterGain  = null;
let _sfxGain     = null;
let _musicGain   = null;
let _footstepT   = 0;
let _initialized = false;

function _getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _sfxGain    = _ctx.createGain();
    _musicGain  = _ctx.createGain();
    _sfxGain.connect(_masterGain);
    _musicGain.connect(_masterGain);
    _masterGain.connect(_ctx.destination);
    _applyVolumes();
  }
  return _ctx;
}

function _applyVolumes() {
  const s = Database.load().settings || {};
  const master = (s.masterVolume ?? 80) / 100;
  const sfx    = (s.sfx          ?? 90) / 100;
  const music  = (s.music        ?? 70) / 100;
  if (_masterGain) _masterGain.gain.value = master;
  if (_sfxGain)    _sfxGain.gain.value    = sfx;
  if (_musicGain)  _musicGain.gain.value  = music;
}

function _noise(ctx, duration, freq, gain = 0.18) {
  const bufLen = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass'; filt.frequency.value = freq; filt.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  src.connect(filt); filt.connect(g); g.connect(_sfxGain);
  src.start(); src.stop(ctx.currentTime + duration);
}

function _tone(ctx, freq, duration, type = 'sine', gain = 0.25, attack = 0.01, release = null) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = type; osc.frequency.value = freq;
  const rel = release ?? duration * 0.6;
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + attack);
  g.gain.setValueAtTime(gain, ctx.currentTime + duration - rel);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(g); g.connect(_sfxGain);
  osc.start(); osc.stop(ctx.currentTime + duration);
  return osc;
}

export const SoundManager = {
  init() {
    if (_initialized) return;
    _initialized = true;
    // resume on first user gesture
    const resume = () => {
      _getCtx();
      if (_ctx.state === 'suspended') _ctx.resume();
    };
    document.addEventListener('click',      resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true, passive: true });
    document.addEventListener('keydown',    resume, { once: true });
  },

  applySettings() {
    if (!_ctx) return;
    _applyVolumes();
  },

  play(id, dt) {
    try {
      const ctx = _getCtx();
      if (ctx.state === 'suspended') ctx.resume();

      switch (id) {
        case 'footstep': {
          // Throttle to ~0.38s intervals
          _footstepT = (_footstepT || 0) + (dt || 0.016);
          if (_footstepT < 0.38) return;
          _footstepT = 0;
          _noise(ctx, 0.055, 140 + Math.random() * 80, 0.12);
          break;
        }
        case 'door': {
          // Frequency sweep from 90→30 Hz
          const osc = ctx.createOscillator();
          const g   = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(90, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.55);
          g.gain.setValueAtTime(0.18, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
          osc.connect(g); g.connect(_sfxGain);
          osc.start(); osc.stop(ctx.currentTime + 0.55);
          _noise(ctx, 0.18, 3000, 0.06); // creak high freq
          break;
        }
        case 'interact_click': {
          _tone(ctx, 800, 0.08, 'square', 0.15, 0.005, 0.07);
          break;
        }
        case 'success': {
          // G-B-D ascending chord
          const notes = [392, 493.88, 587.33];
          notes.forEach((f, i) => {
            setTimeout(() => _tone(ctx, f, 0.5, 'sine', 0.18, 0.02, 0.35), i * 80);
          });
          break;
        }
        case 'error': {
          _tone(ctx, 120, 0.22, 'sawtooth', 0.2, 0.005, 0.18);
          break;
        }
        case 'xp_gain': {
          _tone(ctx, 1200, 0.14, 'sine', 0.14, 0.01, 0.1);
          setTimeout(() => _tone(ctx, 1600, 0.12, 'sine', 0.10, 0.01, 0.09), 80);
          break;
        }
        case 'breaker_click': {
          // Click transient + low relay thud
          _noise(ctx, 0.025, 2000, 0.22);
          setTimeout(() => _noise(ctx, 0.1, 80, 0.28), 20);
          break;
        }
        case 'complete': {
          // Fanfare: C-E-G-C
          const fanfare = [261.63, 329.63, 392, 523.25];
          fanfare.forEach((f, i) => {
            setTimeout(() => _tone(ctx, f, 0.7, 'sine', 0.2, 0.02, 0.5), i * 110);
          });
          setTimeout(() => {
            // Final chord swell
            [523.25, 659.25, 783.99].forEach(f => _tone(ctx, f, 1.2, 'sine', 0.18, 0.05, 0.9));
          }, 550);
          break;
        }
      }
    } catch (e) {
      // Audio errors are non-fatal
    }
  },

  startAmbient() {
    try {
      const ctx = _getCtx();
      if (_ambientNode) return; // already running

      // Low industrial hum (60 Hz) + subtle fan noise
      const hum = ctx.createOscillator();
      hum.type = 'sine'; hum.frequency.value = 60;

      const hum2 = ctx.createOscillator();
      hum2.type = 'sine'; hum2.frequency.value = 120;

      const fanBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const fanData = fanBuf.getChannelData(0);
      for (let i = 0; i < fanData.length; i++) fanData[i] = (Math.random() * 2 - 1);
      const fan = ctx.createBufferSource();
      fan.buffer = fanBuf; fan.loop = true;

      const fanFilt = ctx.createBiquadFilter();
      fanFilt.type = 'lowpass'; fanFilt.frequency.value = 400;

      _ambientGain = ctx.createGain();
      _ambientGain.gain.value = 0;

      const humGain  = ctx.createGain(); humGain.gain.value  = 0.055;
      const hum2Gain = ctx.createGain(); hum2Gain.gain.value = 0.020;
      const fanGain  = ctx.createGain(); fanGain.gain.value  = 0.030;

      hum.connect(humGain);   humGain.connect(_ambientGain);
      hum2.connect(hum2Gain); hum2Gain.connect(_ambientGain);
      fan.connect(fanFilt);   fanFilt.connect(fanGain); fanGain.connect(_ambientGain);
      _ambientGain.connect(_musicGain);

      hum.start(); hum2.start(); fan.start();
      _ambientNode = { hum, hum2, fan };

      // Fade in
      _ambientGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5);
    } catch (e) {}
  },

  stopAmbient() {
    try {
      if (!_ambientNode || !_ctx) return;
      _ambientGain?.gain.linearRampToValueAtTime(0, _ctx.currentTime + 1.2);
      const node = _ambientNode;
      _ambientNode = null;
      setTimeout(() => {
        try { node.hum.stop(); node.hum2.stop(); node.fan.stop(); } catch {}
      }, 1300);
    } catch (e) {}
  },
};

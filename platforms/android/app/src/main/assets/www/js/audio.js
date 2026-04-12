export const Audio = (() => {
  let ctx = null;
  let humNode = null;
  let bgmNodes = [];   // active BGM oscillators / gain nodes
  let bgmMaster = null;

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, type, dur, vol, endFreq) {
    if (!ctx || ctx.state === 'suspended') return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    if (endFreq) o.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  }

  function noise(dur, vol, filterFreq) {
    if (!ctx || ctx.state === 'suspended') return;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = filterFreq || 400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filt); filt.connect(g); g.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);
  }

  let stepAlt = 0; // alternate L/R foot timbre
  return {
    init,
    get ctx() { return ctx; },
    // ── UI interaction sounds ────────────────────────────────────────────
    uiClick()   { tone(900,'square',.04,.18); setTimeout(()=>tone(450,'square',.03,.1),18); },
    uiSelect()  { tone(660,'sine',.06,.2); setTimeout(()=>tone(880,'sine',.05,.15),30); },
    uiBack()    { tone(440,'sine',.05,.18); setTimeout(()=>tone(330,'sine',.04,.12),25); },
    uiSuccess() { [0,80,160].forEach((d,i)=>setTimeout(()=>tone(700+i*200,'sine',.07,.2),d)); },
    // ── Background music — ambient electronic loop ───────────────────────
    bgmStart(type) {
      if (!ctx || bgmNodes.length) return;
      bgmMaster = ctx.createGain();
      bgmMaster.gain.setValueAtTime(0, ctx.currentTime);
      bgmMaster.gain.linearRampToValueAtTime(type === 'menu' ? 0.18 : 0.10, ctx.currentTime + 2.5);
      bgmMaster.connect(ctx.destination);

      // Low industrial drone (two detuned oscillators)
      [48, 48.5].forEach(f => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.value = 0.5;
        o.connect(g); g.connect(bgmMaster);
        o.start(); bgmNodes.push(o, g);
      });

      // Slow pulsing mid tone
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.18;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 22;
      lfo.connect(lfoGain); lfo.start(); bgmNodes.push(lfo);

      const mid = ctx.createOscillator(); const midG = ctx.createGain();
      mid.type = 'triangle'; mid.frequency.value = 196;
      lfoGain.connect(mid.frequency);
      midG.gain.value = 0.22;
      mid.connect(midG); midG.connect(bgmMaster);
      mid.start(); bgmNodes.push(mid, midG, lfoGain);

      // High shimmer arpeggio (slow)
      const NOTES = [392, 440, 523, 494];
      let ni = 0;
      const shimmer = ctx.createOscillator(); const shimG = ctx.createGain();
      shimmer.type = 'sine'; shimmer.frequency.value = NOTES[0];
      shimG.gain.value = 0.07;
      shimmer.connect(shimG); shimG.connect(bgmMaster);
      shimmer.start(); bgmNodes.push(shimmer, shimG);
      const shimInterval = setInterval(() => {
        if (!ctx || !shimmer.frequency) { clearInterval(shimInterval); return; }
        ni = (ni + 1) % NOTES.length;
        shimmer.frequency.linearRampToValueAtTime(NOTES[ni], ctx.currentTime + 0.8);
      }, 1600);
      bgmNodes.push({ stop: () => clearInterval(shimInterval) });
    },
    bgmStop() {
      const fade = 1.5;
      if (bgmMaster) {
        bgmMaster.gain.linearRampToValueAtTime(0, (ctx?.currentTime || 0) + fade);
      }
      setTimeout(() => {
        bgmNodes.forEach(n => { try { n.stop?.(); } catch(e){} });
        bgmNodes = [];
        bgmMaster = null;
      }, (fade + 0.1) * 1000);
    },
    click()     { tone(700,'square',.05,.4); setTimeout(()=>tone(350,'square',.04,.2),25); },
    door(open) {
      tone(open ? 120 : 220, 'sawtooth', 0.6, 0.2, open ? 80 : 160);
      setTimeout(() => tone(open ? 440 : 330, 'square', 0.05, 0.1), 10);
    },
    clack() { 
      tone(150, 'sawtooth', .1, .6); 
      setTimeout(() => tone(100, 'sawtooth', .1, .4), 30); 
    },
    chirp() { 
      tone(880, 'square', .05, .2); 
      setTimeout(() => tone(1320, 'square', .05, .2), 50); 
    },
    breaker(on) { 
      this.clack(); 
      setTimeout(()=>tone(on?900:500,'square',.08,.5), 20); 
    },
    alert()     { [0,140,280].forEach(d=>setTimeout(()=>tone(880,'square',.1,.4),d)); },
    hum(on) {
      if (!ctx) return;
      if (!on) { if (humNode) { humNode.stop(); humNode = null; } return; }
      if (humNode) return;
      humNode = ctx.createOscillator();
      const gain = ctx.createGain();
      humNode.type = 'triangle';
      humNode.frequency.value = 50; // Industrial 50Hz hum
      gain.gain.value = 0.04;
      humNode.connect(gain);
      gain.connect(ctx.destination);
      humNode.start();
    },
    step(sprinting) {
      if (!ctx || ctx.state === 'suspended') return;
      stepAlt = 1 - stepAlt;
      // Thump (low body contact)
      const baseFreq = sprinting ? 75 : 62;
      tone(baseFreq + stepAlt*8 + Math.random()*14, 'sine', .055, sprinting ? .4 : .25);
      // High click (heel/toe)
      noise(.028, sprinting ? .2 : .12, sprinting ? 1200 : 800);
    }
  };
})();

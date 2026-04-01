export const Audio = (() => {
  let ctx = null;
  let humNode = null;
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
      const baseFreq = sprinting ? 65 : 52;
      tone(baseFreq + stepAlt*8 + Math.random()*14, 'sine', .055, sprinting ? .18 : .12);
      // High click (heel/toe)
      noise(.028, sprinting ? .09 : .06, sprinting ? 900 : 600);
    }
  };
})();

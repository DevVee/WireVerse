// Mascot guide — centered tutorial overlay + corner contextual tips
// Uses /Mascot.png as the mascot image

const TUTORIAL_STEPS = [
  {
    title: "Welcome to the Control Room!",
    text:  "I'm <b>Electro</b>, your guide! Your mission: find and fix every broken outlet and light switch in this facility.",
  },
  {
    title: "How to Move",
    textDesktop: "Click the screen to lock your mouse.<br><b>W A S D</b> — walk &nbsp;|&nbsp; <b>Mouse</b> — look<br><b>Space</b> — jump",
    textMobile:  "<b>Joystick</b> (bottom-left) — walk<br>Drag screen — look around<br><b>▲</b> button — jump",
  },
  {
    title: "How to Interact",
    textDesktop: "Walk up to a glowing outlet or switch.<br>When the label appears, press <b>E</b> to interact.",
    textMobile:  "Walk up to a glowing outlet or switch.<br>When <b>⚡ ACT</b> lights up, tap it to interact.",
  },
  {
    title: "What to Look For",
    text:  "🔴 <b>Red sparks</b> — broken outlet, repair it!<br>🔵 <b>Blue glow</b> — switch that needs wiring!<br>⚡ Fix them all to complete the stage!",
  },
];

const TIPS = {
  near_outlet:  "Broken outlet detected! Press E (or tap ACT) to repair it.",
  near_switch:  "Switch offline! Press E (or tap ACT) to install it.",
  near_breaker: "Tripped breaker panel! Press E (or tap ACT) to reset the circuit.",
  after_fix:    "System restored! Keep scanning — find all the faults!",
  all_done:     "ALL SYSTEMS ONLINE! You fixed everything! You're a certified tech! ⚡",
  door:         "Tip: Get close to a door and press E to open it.",
};

const CSS = `
/* ── TUTORIAL OVERLAY ───────────────────────────────────────── */
.mg-tutorial{
  position:absolute;inset:0;
  background:rgba(0,4,14,.88);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;
  z-index:60;pointer-events:auto;
  animation:mg-fade-in .32s ease both;
}
.mg-tutorial.hiding{animation:mg-fade-out .24s ease both;}
@keyframes mg-fade-in {from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes mg-fade-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.97)}}

/* Card — horizontal layout */
.mg-card{
  display:flex;flex-direction:row;align-items:stretch;
  background:linear-gradient(135deg,rgba(4,14,36,.99) 0%,rgba(2,8,24,.99) 100%);
  border:1px solid rgba(0,212,255,.38);
  border-radius:22px;
  max-width:480px;width:calc(100% - 40px);
  box-shadow:0 0 0 1px rgba(0,212,255,.08),0 0 60px rgba(0,212,255,.18),0 24px 64px rgba(0,0,0,.75);
  overflow:hidden;
  position:relative;
}

/* Left — text content */
.mg-card-left{
  flex:1;
  display:flex;flex-direction:column;justify-content:center;
  padding:26px 22px 22px 26px;
  min-width:0;
}

/* Right — mascot */
.mg-card-right{
  width:130px;flex-shrink:0;
  display:flex;align-items:flex-end;justify-content:center;
  background:linear-gradient(180deg,rgba(0,212,255,.04) 0%,rgba(0,212,255,.10) 100%);
  border-left:1px solid rgba(0,212,255,.14);
  padding:12px 8px 0;
  position:relative;overflow:hidden;
}
.mg-card-right::before{
  content:'';position:absolute;bottom:0;left:0;right:0;height:40%;
  background:linear-gradient(0deg,rgba(0,212,255,.08),transparent);
}
.mg-mascot-img{
  width:115px;height:auto;object-fit:contain;
  filter:drop-shadow(0 0 14px rgba(0,212,255,.5));
  animation:mg-float 2.8s ease-in-out infinite;
  position:relative;z-index:1;
}
@keyframes mg-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}

/* Volt name badge */
.mg-volt-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(0,212,255,.12);
  border:1px solid rgba(0,212,255,.3);
  border-radius:20px;padding:3px 10px;
  font-family:'Barlow Condensed',sans-serif;
  font-size:10px;font-weight:800;letter-spacing:.18em;
  color:#00d4ff;text-transform:uppercase;
  margin-bottom:10px;
  width:fit-content;
}

.mg-step-title{
  font-family:'Barlow Condensed',sans-serif;
  font-size:20px;font-weight:800;letter-spacing:.02em;
  color:#fff;margin-bottom:9px;line-height:1.15;
  text-shadow:0 0 24px rgba(0,212,255,.35);
}
.mg-step-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:500;line-height:1.72;
  color:rgba(255,255,255,.72);
  margin-bottom:18px;flex:1;
}
.mg-step-text b{color:#00d4ff;font-weight:700;}

/* Dots */
.mg-dots{display:flex;gap:6px;margin-bottom:16px;}
.mg-dot{
  width:6px;height:6px;border-radius:50%;
  background:rgba(0,212,255,.18);border:1px solid rgba(0,212,255,.35);
  transition:background .25s,transform .25s,width .25s;
}
.mg-dot.active{
  background:#00d4ff;width:18px;border-radius:4px;
  box-shadow:0 0 8px rgba(0,212,255,.6);
}

/* Action row */
.mg-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.mg-skip-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  color:rgba(255,255,255,.28);background:none;border:none;
  cursor:pointer;padding:6px 2px;-webkit-tap-highlight-color:transparent;
  transition:color .15s;text-transform:uppercase;
}
.mg-skip-btn:hover,.mg-skip-btn:active{color:rgba(255,255,255,.6);}
.mg-next-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:800;letter-spacing:.1em;
  color:#000;background:linear-gradient(135deg,#00d4ff 0%,#0096cc 100%);
  border:none;border-radius:10px;padding:10px 20px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 18px rgba(0,212,255,.45),0 4px 10px rgba(0,0,0,.4);
  transition:transform .14s,box-shadow .14s;
  text-transform:uppercase;
}
.mg-next-btn:active{transform:scale(.92);}

/* Step counter */
.mg-step-counter{
  font-family:'Barlow Condensed',sans-serif;
  font-size:10px;font-weight:700;letter-spacing:.12em;
  color:rgba(0,212,255,.45);text-transform:uppercase;
  margin-bottom:4px;
}

/* ── CENTER TIP OVERLAY ─────────────────────────────────────── */
.mg-tip{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  z-index:55;pointer-events:auto;
  background:rgba(0,4,14,.72);
  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
  animation:mg-fade-in .28s ease both;
}
.mg-tip.hiding{animation:mg-fade-out .2s ease both;}

.mg-tip-card{
  display:flex;flex-direction:row;align-items:stretch;
  background:linear-gradient(135deg,rgba(4,14,36,.99) 0%,rgba(2,8,24,.99) 100%);
  border:1px solid rgba(0,212,255,.38);
  border-radius:20px;
  max-width:400px;width:calc(100% - 48px);
  box-shadow:0 0 0 1px rgba(0,212,255,.08),0 0 50px rgba(0,212,255,.15),0 20px 50px rgba(0,0,0,.7);
  overflow:hidden;
}
.mg-tip-left{
  flex:1;display:flex;flex-direction:column;justify-content:center;
  padding:22px 20px 20px 22px;
}
.mg-tip-right{
  width:110px;flex-shrink:0;
  display:flex;align-items:flex-end;justify-content:center;
  background:linear-gradient(180deg,rgba(0,212,255,.04) 0%,rgba(0,212,255,.10) 100%);
  border-left:1px solid rgba(0,212,255,.14);
  padding:10px 6px 0;
}
.mg-tip-mascot{
  width:100px;height:auto;object-fit:contain;
  filter:drop-shadow(0 0 12px rgba(0,212,255,.5));
  animation:mg-float 2.8s ease-in-out infinite;
}
.mg-tip-name{
  font-family:'Barlow Condensed',sans-serif;
  font-size:9px;font-weight:800;letter-spacing:.18em;
  color:#00d4ff;text-transform:uppercase;margin-bottom:8px;
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.3);
  border-radius:20px;padding:3px 10px;width:fit-content;
}
.mg-tip-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:14px;font-weight:600;line-height:1.6;
  color:rgba(255,255,255,.9);margin-bottom:16px;
}
.mg-tip-got-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:800;letter-spacing:.1em;
  color:#000;background:linear-gradient(135deg,#00d4ff 0%,#0096cc 100%);
  border:none;border-radius:10px;padding:10px 22px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 18px rgba(0,212,255,.45),0 4px 10px rgba(0,0,0,.4);
  transition:transform .14s;text-transform:uppercase;width:100%;
}
.mg-tip-got-btn:active{transform:scale(.93);}
`;

export class MascotGuide {
  constructor(root) {
    this._root     = root;
    this._tipEl    = null;
    this._tipTimer = null;
    this._tutEl    = null;
    this._shown    = null;
    this._isMob    = navigator.maxTouchPoints > 0;
    this._injectCSS();
  }

  _injectCSS() {
    if (document.querySelector('#mg-css')) return;
    const s = document.createElement('style');
    s.id = 'mg-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── CENTERED STEP-BY-STEP TUTORIAL ──────────────────────────────────────────
  showTutorial(onDone) {
    if (this._tutEl) return;
    let step = 0;
    const steps = TUTORIAL_STEPS;
    const total = steps.length;

    const el = document.createElement('div');
    el.className = 'mg-tutorial';

    const dotsHTML = Array.from({ length: total }, (_, i) =>
      `<div class="mg-dot${i === 0 ? ' active' : ''}"></div>`).join('');

    el.innerHTML = `
      <div class="mg-card">
        <div class="mg-card-left">
          <div class="mg-volt-badge">⚡ ELECTRO — Your Guide</div>
          <div class="mg-step-counter"></div>
          <div class="mg-step-title"></div>
          <div class="mg-step-text"></div>
          <div class="mg-dots">${dotsHTML}</div>
          <div class="mg-actions">
            <button class="mg-skip-btn">Skip</button>
            <button class="mg-next-btn">Next →</button>
          </div>
        </div>
        <div class="mg-card-right">
          <img class="mg-mascot-img" src="/Mascot.png" alt="Electro" />
        </div>
      </div>
    `;

    const nextBtn    = el.querySelector('.mg-next-btn');
    const skipBtn    = el.querySelector('.mg-skip-btn');
    const titleEl    = el.querySelector('.mg-step-title');
    const textEl     = el.querySelector('.mg-step-text');
    const counterEl  = el.querySelector('.mg-step-counter');
    const dots       = el.querySelectorAll('.mg-dot');

    const render = () => {
      const s = steps[step];
      counterEl.textContent = `Step ${step + 1} of ${total}`;
      titleEl.textContent   = s.title;
      textEl.innerHTML      = (s.text || (this._isMob ? s.textMobile : s.textDesktop) || '');
      dots.forEach((d, i) => d.classList.toggle('active', i === step));
      nextBtn.textContent   = step === total - 1 ? "Let's Go ⚡" : 'Next →';
    };

    const close = () => {
      el.classList.add('hiding');
      setTimeout(() => { el.remove(); this._tutEl = null; }, 260);
      onDone?.();
    };

    nextBtn.addEventListener('click', () => {
      if (step < total - 1) { step++; render(); }
      else close();
    });
    skipBtn.addEventListener('click', close);

    render();
    this._root.appendChild(el);
    this._tutEl = el;
  }

  // ── CENTERED CONTEXTUAL TIP ──────────────────────────────────────────────────
  show(key) {
    const text = TIPS[key];
    if (!text) return;
    if (this._shown === key) return;

    clearTimeout(this._tipTimer);
    if (this._tipEl) { this._tipEl.remove(); this._tipEl = null; }

    this._shown = key;
    const el = document.createElement('div');
    el.className = 'mg-tip';
    el.innerHTML = `
      <div class="mg-tip-card">
        <div class="mg-tip-left">
          <div class="mg-tip-name">⚡ ELECTRO</div>
          <div class="mg-tip-text">${text}</div>
          <button class="mg-tip-got-btn">Got It!</button>
        </div>
        <div class="mg-tip-right">
          <img class="mg-tip-mascot" src="/Mascot.png" alt="Electro" />
        </div>
      </div>
    `;

    const dismiss = () => this.hide();
    el.querySelector('.mg-tip-got-btn').addEventListener('click', dismiss);
    el.querySelector('.mg-tip-got-btn').addEventListener('touchend', e => { e.preventDefault(); dismiss(); });

    this._root.appendChild(el);
    this._tipEl = el;

    const delay = key === 'all_done' ? 14000 : 8000;
    this._tipTimer = setTimeout(() => this.hide(), delay);
  }

  hide() {
    if (!this._tipEl) return;
    this._tipEl.classList.add('hiding');
    const el = this._tipEl;
    this._tipEl = null;
    this._shown = null;
    clearTimeout(this._tipTimer);
    setTimeout(() => el.remove(), 280);
  }

  destroy() {
    clearTimeout(this._tipTimer);
    this._tipEl?.remove();
    this._tutEl?.remove();
    this._tipEl = null;
    this._tutEl = null;
  }
}

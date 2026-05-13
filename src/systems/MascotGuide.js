// Mascot guide — centered tutorial overlay + corner contextual tips
// Uses /Mascot.png as the mascot image

const TUTORIAL_STEPS = [
  {
    title: "Welcome to the Workshop!",
    text:  "I'm Volt, your guide! Your mission: find and fix every broken outlet and light switch in this building.",
  },
  {
    title: "How to Move",
    textDesktop: "Click the screen to lock your mouse, then use <b>W A S D</b> to walk forward, back, and strafe. Move the mouse to look around. Press <b>Space</b> to jump.",
    textMobile:  "Use the <b>joystick</b> (bottom-left) to walk. Drag anywhere on the screen to look around. Tap <b>▲</b> to jump.",
  },
  {
    title: "How to Interact",
    textDesktop: "Walk up close to a glowing outlet or switch. When a label appears on screen, press <b>E</b> to interact with it.",
    textMobile:  "Walk close to a glowing outlet or switch. When the <b>⚡ ACT</b> button lights up, tap it to interact.",
  },
  {
    title: "What to Look For",
    text:  "🔴 <b>Red sparks</b> = broken outlet — repair it!<br>🔵 <b>Blue glow</b> = switch to wire up!<br>⚡ Fix them all to complete the stage!",
  },
];

const TIPS = {
  near_outlet:  "Broken outlet nearby! Press E (or tap ACT) to repair it.",
  near_switch:  "Switch needs wiring! Press E (or tap ACT) to install it.",
  near_breaker: "Tripped breaker panel! Press E (or tap ACT) to reset the circuit.",
  after_fix:    "Nice fix! Keep exploring — find the rest and repair them all!",
  all_done:     "ALL SYSTEMS GO! You fixed everything! You're a certified electrician! 🏆",
  door:         "Tip: Get close to a door and press E to open it.",
};

const CSS = `
/* ── TUTORIAL OVERLAY ───────────────────────────────────────── */
.mg-tutorial{
  position:absolute;inset:0;
  background:rgba(0,4,14,.84);
  display:flex;align-items:center;justify-content:center;
  z-index:60;pointer-events:auto;
  animation:mg-fade-in .3s ease both;
}
.mg-tutorial.hiding{animation:mg-fade-out .25s ease both;}
@keyframes mg-fade-in {from{opacity:0}to{opacity:1}}
@keyframes mg-fade-out{from{opacity:1}to{opacity:0}}

.mg-card{
  display:flex;flex-direction:column;align-items:center;
  background:linear-gradient(160deg,rgba(4,14,32,.98),rgba(2,8,22,.98));
  border:1px solid rgba(0,212,255,.4);
  border-radius:20px;
  padding:28px 26px 22px;
  max-width:340px;width:calc(100% - 48px);
  box-shadow:0 0 60px rgba(0,212,255,.18),0 20px 60px rgba(0,0,0,.7);
  position:relative;
}
.mg-mascot-img{
  width:110px;height:110px;object-fit:contain;
  filter:drop-shadow(0 0 18px rgba(0,212,255,.55));
  margin-bottom:12px;
  animation:mg-float 2.8s ease-in-out infinite;
}
@keyframes mg-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
.mg-step-title{
  font-family:'Barlow Condensed',sans-serif;
  font-size:19px;font-weight:800;letter-spacing:.04em;
  color:#fff;text-align:center;margin-bottom:10px;
  text-shadow:0 0 22px rgba(0,212,255,.4);
}
.mg-step-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:500;line-height:1.7;
  color:rgba(255,255,255,.76);text-align:center;
  margin-bottom:18px;
}
.mg-step-text b{color:#00d4ff;}
.mg-dots{display:flex;gap:7px;margin-bottom:18px;}
.mg-dot{
  width:7px;height:7px;border-radius:50%;
  background:rgba(0,212,255,.2);border:1px solid rgba(0,212,255,.4);
  transition:background .25s,transform .25s;
}
.mg-dot.active{background:#00d4ff;transform:scale(1.3);}
.mg-actions{
  display:flex;align-items:center;justify-content:space-between;
  width:100%;gap:10px;
}
.mg-skip-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:12px;font-weight:700;letter-spacing:.08em;
  color:rgba(255,255,255,.32);background:none;border:none;
  cursor:pointer;padding:8px 4px;-webkit-tap-highlight-color:transparent;
  transition:color .15s;
}
.mg-skip-btn:hover,.mg-skip-btn:active{color:rgba(255,255,255,.65);}
.mg-next-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:14px;font-weight:800;letter-spacing:.1em;
  color:#000;background:linear-gradient(135deg,#00d4ff,#0090cc);
  border:none;border-radius:10px;padding:11px 24px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 20px rgba(0,212,255,.4),0 4px 12px rgba(0,0,0,.4);
  transition:transform .15s,box-shadow .15s;
}
.mg-next-btn:active{transform:scale(.93);}

/* ── CORNER TIP ─────────────────────────────────────────────── */
.mg-tip{
  position:absolute;bottom:28px;right:18px;
  display:flex;align-items:flex-end;gap:9px;
  z-index:45;pointer-events:auto;
  max-width:260px;
  animation:mg-tip-in .35s cubic-bezier(.18,.89,.32,1.28) both;
}
.mg-tip.hiding{animation:mg-tip-out .25s ease-in both;}
@keyframes mg-tip-in {from{opacity:0;transform:translateY(16px) scale(.86);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes mg-tip-out{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(14px);}}

.mg-tip-bubble{
  position:relative;flex:1;
  background:rgba(4,12,28,.96);
  border:1px solid rgba(0,212,255,.5);
  border-radius:14px 14px 4px 14px;
  padding:10px 13px;
  box-shadow:0 0 22px rgba(0,212,255,.2),0 6px 20px rgba(0,0,0,.6);
  cursor:pointer;
}
.mg-tip-bubble::after{
  content:'';position:absolute;bottom:-8px;right:10px;
  width:0;height:0;
  border-left:8px solid transparent;
  border-top:9px solid rgba(0,212,255,.5);
}
.mg-tip-name{
  font-family:'Barlow Condensed',sans-serif;
  font-size:9px;font-weight:800;letter-spacing:.15em;
  color:#00d4ff;text-transform:uppercase;margin-bottom:4px;
}
.mg-tip-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:12px;font-weight:600;line-height:1.5;
  color:rgba(255,255,255,.88);
}
.mg-tip-mascot{
  flex-shrink:0;width:50px;height:50px;object-fit:contain;
  filter:drop-shadow(0 0 8px rgba(0,212,255,.4));
}
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
        <img class="mg-mascot-img" src="/Mascot.png" alt="Volt" />
        <div class="mg-step-title"></div>
        <div class="mg-step-text"></div>
        <div class="mg-dots">${dotsHTML}</div>
        <div class="mg-actions">
          <button class="mg-skip-btn">SKIP</button>
          <button class="mg-next-btn">NEXT →</button>
        </div>
      </div>
    `;

    const nextBtn = el.querySelector('.mg-next-btn');
    const skipBtn = el.querySelector('.mg-skip-btn');
    const titleEl = el.querySelector('.mg-step-title');
    const textEl  = el.querySelector('.mg-step-text');
    const dots    = el.querySelectorAll('.mg-dot');

    const render = () => {
      const s = steps[step];
      titleEl.textContent  = s.title;
      textEl.innerHTML     = (s.text || (this._isMob ? s.textMobile : s.textDesktop) || '').replace(/\n/g, '<br>');
      dots.forEach((d, i) => d.classList.toggle('active', i === step));
      nextBtn.textContent  = step === total - 1 ? "LET'S GO! ⚡" : 'NEXT →';
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

  // ── CORNER CONTEXTUAL TIP ────────────────────────────────────────────────────
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
      <div class="mg-tip-bubble">
        <div class="mg-tip-name">⚡ VOLT</div>
        <div class="mg-tip-text">${text}</div>
      </div>
      <img class="mg-tip-mascot" src="/Mascot.png" alt="Volt" />
    `;
    el.addEventListener('click',      () => this.hide());
    el.addEventListener('touchstart', () => this.hide(), { passive: true });

    this._root.appendChild(el);
    this._tipEl = el;

    const delay = key === 'all_done' ? 12000 : 6000;
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

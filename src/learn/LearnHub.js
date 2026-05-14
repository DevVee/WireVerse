import { Database } from '../systems/Database.js';

const LESSONS = [
  {
    id:       'wireTypes',
    state:    'wireTypes',
    module:   'MODULE 1',
    title:    'WIRE TYPES',
    desc:     'Learn the 5 wire types used in Philippine homes — THHN, NM-B, TW, BX, and UF-B. What they are, where they go, and why it matters.',
    pills:    [['⚡','5 Wire Types','Know them all'],['🛡','Safe & Reliable','Install with confidence'],['✓','Real-World Ready','Apply what you learn']],
    colorA:   '#00d4ff',
    colorB:   '#2dc653',
    icon:     '🔌',
    requires: null,
  },
  {
    id:       'wireStripping',
    state:    'wireStripping',
    module:   'MODULE 2',
    title:    'WIRE STRIPPING',
    desc:     'Master the four tools used to strip wire insulation — manual, automatic, utility knife, and rotary. When to use each and how.',
    pills:    [['✂','4 Tools','Every tool, every time'],['🎯','Use It Right','When, why, how'],['📊','Build the Habit','Precision. Safety. Efficiency.']],
    colorA:   '#cc44ff',
    colorB:   '#ff4444',
    icon:     '✂',
    requires: null,
  },
];

const CSS = `
@keyframes lh-fade-up{0%{opacity:0;transform:translateY(22px) scale(.95);}70%{opacity:1;transform:translateY(-3px) scale(1.015);}100%{opacity:1;transform:translateY(0) scale(1);}}

/* ── ROOT ─────────────────────────────────────────────────── */
.lh{position:absolute;inset:0;display:flex;flex-direction:column;background:#070d1c;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── HEADER ─────────────────────────────────────────────── */
.lh-top{
  height:58px;flex-shrink:0;
  background:rgba(4,8,20,.98);
  border-bottom:1px solid rgba(0,212,255,.12);
  display:flex;align-items:center;padding:0 14px;gap:10px;
  box-shadow:0 2px 18px rgba(0,0,0,.55);
}
.lh-back{
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.26);color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;
  padding:8px 13px;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:all .15s;touch-action:manipulation;white-space:nowrap;
}
.lh-back:active{transform:scale(.93);}
.lh-title-wrap{flex:1;text-align:center;}
.lh-title{font-size:18px;font-weight:900;letter-spacing:4px;color:#fff;}
.lh-title-sub{font-size:8px;letter-spacing:3px;color:rgba(0,212,255,.45);margin-top:1px;}
.lh-badge{
  background:rgba(45,198,83,.08);border:1px solid rgba(45,198,83,.3);
  border-radius:8px;padding:5px 9px;
  font-size:10px;font-weight:800;color:#2dc653;letter-spacing:.5px;white-space:nowrap;text-align:center;
}
.lh-badge-label{font-size:8px;color:rgba(45,198,83,.6);margin-top:1px;letter-spacing:1px;}

/* ── SCROLL BODY ─────────────────────────────────────────── */
.lh-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 14px 0;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.lh-body::-webkit-scrollbar{display:none;}

/* ── MODULE CARD ─────────────────────────────────────────── */
.lh-card{
  border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);
  background:rgba(6,12,28,.9);position:relative;cursor:pointer;
  -webkit-tap-highlight-color:transparent;transition:transform .18s,box-shadow .18s;
  display:flex;flex-direction:row;min-height:200px;
  animation:lh-fade-up .4s cubic-bezier(.34,1.56,.64,1) both;margin-bottom:14px;
}
.lh-card:not(.locked):hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.55);}
.lh-card:active{transform:scale(.96);}
.lh-card.locked{opacity:.5;cursor:not-allowed;}
.lh-card.locked:active{transform:none;}
.lh-card:nth-child(1){animation-delay:.05s;}
.lh-card:nth-child(2){animation-delay:.12s;}
.lh-card:nth-child(3){animation-delay:.19s;}
.lh-card:nth-child(n+4){animation-delay:.25s;}

/* Image column (left ~42%) */
.lh-card-img{
  width:42%;flex-shrink:0;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
.lh-card-img-bg{position:absolute;inset:0;}
.lh-card-img-icon{font-size:52px;position:relative;z-index:1;filter:drop-shadow(0 4px 20px rgba(0,0,0,.6));}

/* Info column (right) */
.lh-card-info{flex:1;padding:16px 14px 14px;display:flex;flex-direction:column;position:relative;}
.lh-card-mod{font-size:9px;font-weight:800;letter-spacing:3px;margin-bottom:4px;}
.lh-card-title{font-size:24px;font-weight:900;letter-spacing:1.5px;color:#fff;line-height:1.1;margin-bottom:4px;}
.lh-card-rule{height:2px;width:36px;border-radius:99px;margin-bottom:8px;}
.lh-card-desc{font-size:11.5px;color:rgba(255,255,255,.52);line-height:1.55;margin-bottom:10px;flex:1;}

/* Feature pills */
.lh-card-pills{display:flex;flex-direction:column;gap:5px;margin-bottom:10px;}
.lh-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:7px;padding:5px 8px;}
.lh-pill-icon{font-size:11px;width:16px;text-align:center;}
.lh-pill-name{font-size:10px;font-weight:700;color:rgba(255,255,255,.6);}
.lh-pill-sub{font-size:9px;color:rgba(255,255,255,.3);margin-left:auto;}

/* Arrow / status */
.lh-card-arrow{position:absolute;top:14px;right:14px;font-size:18px;font-weight:700;}
.lh-done-badge{
  position:absolute;top:10px;right:10px;
  background:rgba(45,198,83,.14);border:1px solid rgba(45,198,83,.5);
  border-radius:7px;padding:3px 9px;font-size:8px;font-weight:800;letter-spacing:2px;color:#2dc653;
}

/* ── BOTTOM BAR ──────────────────────────────────────────── */
.lh-bottom{
  flex-shrink:0;padding:14px 14px 18px;
  background:rgba(4,8,20,.95);border-top:1px solid rgba(255,255,255,.06);
  display:flex;align-items:center;gap:12px;
}
.lh-bottom-icon{
  width:44px;height:44px;border-radius:12px;flex-shrink:0;
  background:linear-gradient(135deg,#ff9f1c,#ff6600);
  display:flex;align-items:center;justify-content:center;font-size:20px;
  box-shadow:0 0 14px rgba(255,150,0,.3);
}
.lh-bottom-text{flex:1;}
.lh-bottom-title{font-size:13px;font-weight:900;letter-spacing:1px;color:#fff;}
.lh-bottom-sub{font-size:10px;color:rgba(255,255,255,.38);margin-top:1px;}
.lh-progress-btn{
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.3);
  border-radius:9px;padding:8px 13px;
  font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;
  color:#00d4ff;letter-spacing:.5px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  display:flex;align-items:center;gap:5px;white-space:nowrap;touch-action:manipulation;
  transition:all .15s;
}
.lh-progress-btn:active{transform:scale(.93);}
`;

function injectCSS() {
  if (document.querySelector('#lh-css')) return;
  const s = document.createElement('style');
  s.id = 'lh-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export class LearnHub {
  constructor(state) {
    this.state = state;
    this.container = this._build();
  }

  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="lh">
        <header class="lh-top">
          <button class="lh-back">← MENU</button>
          <div class="lh-title-wrap">
            <div class="lh-title">⚡ LEARN</div>
            <div class="lh-title-sub">BUILD KNOWLEDGE. BUILD CONFIDENCE.</div>
          </div>
          <div class="lh-badge" id="lh-badge">
            <div>0/2</div>
            <div class="lh-badge-label">Completed</div>
          </div>
        </header>
        <div class="lh-body" id="lh-body"></div>
        <div class="lh-bottom">
          <div class="lh-bottom-icon">⚡</div>
          <div class="lh-bottom-text">
            <div class="lh-bottom-title">KEEP LEARNING. KEEP GROWING.</div>
            <div class="lh-bottom-sub">Every skill you build today, powers your future.</div>
          </div>
          <button class="lh-progress-btn">PROGRESS 📊</button>
        </div>
      </div>`;

    el.querySelector('.lh-back').addEventListener('click', () => this.state.setState('menu'));
    this._el = el;
    return el;
  }

  _renderCards(progress) {
    const doneCount = LESSONS.filter(l => !!progress[l.id]).length;
    this._el.querySelector('#lh-badge').innerHTML = `
      <div>${doneCount}/${LESSONS.length}</div>
      <div class="lh-badge-label">Completed</div>`;

    const body = this._el.querySelector('#lh-body');
    body.innerHTML = LESSONS.map((lesson, idx) => {
      const done   = !!progress[lesson.id];
      const locked = lesson.requires && !progress[lesson.requires];

      const pillsHTML = lesson.pills.map(([icon, name, sub]) => `
        <div class="lh-pill">
          <span class="lh-pill-icon">${icon}</span>
          <span class="lh-pill-name">${name}</span>
          <span class="lh-pill-sub">${sub}</span>
        </div>`).join('');

      return `
        <div class="lh-card ${locked ? 'locked' : ''}"
             data-state="${lesson.state}"
             style="animation-delay:${(idx * 0.1).toFixed(2)}s;">
          <div class="lh-card-img">
            <div class="lh-card-img-bg"
                 style="background:linear-gradient(135deg,${lesson.colorA}22,${lesson.colorB}14)"></div>
            <div class="lh-card-img-icon">${lesson.icon}</div>
          </div>
          <div class="lh-card-info">
            ${done ? '<div class="lh-done-badge">COMPLETED ✓</div>' : `<div class="lh-card-arrow" style="color:${lesson.colorA}">›</div>`}
            <div class="lh-card-mod" style="color:${lesson.colorA}">${lesson.module}</div>
            <div class="lh-card-title">${lesson.title}</div>
            <div class="lh-card-rule" style="background:linear-gradient(90deg,${lesson.colorA},${lesson.colorB})"></div>
            <div class="lh-card-desc">${lesson.desc}</div>
            <div class="lh-card-pills">${pillsHTML}</div>
          </div>
        </div>`;
    }).join('');

    body.querySelectorAll('.lh-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => this.state.setState(card.dataset.state));
    });
  }

  onShow() {
    this._renderCards(Database.getLessonProgress());
  }
}

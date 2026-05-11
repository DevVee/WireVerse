import { Database } from '../systems/Database.js';

const LESSONS = [
  {
    id:       'wireTypes',
    state:    'wireTypes',
    module:   'MODULE 1',
    title:    'WIRE TYPES',
    desc:     'Learn the 5 wire types used in Philippine homes — THHN, NM-B, TW, BX, and UF-B. What they are, where they go, and why it matters.',
    chapters: 4,
    colorA:   '#00d4ff',
    colorB:   '#2dc653',
    requires: null,
  },
  {
    id:       'electricianTools',
    state:    'electricianTools',
    module:   'MODULE 2',
    title:    "ELECTRICIAN'S TOOLS",
    desc:     'Master the 12 essential tools used in Philippine electrical work — cutting, gripping, fastening, testing, and more.',
    chapters: 6,
    colorA:   '#ff9f1c',
    colorB:   '#ff6600',
    requires: null,
  },
  {
    id:       'wireStripping',
    state:    'wireStripping',
    module:   'MODULE 3',
    title:    'WIRE STRIPPING',
    desc:     'Master the four tools used to strip wire insulation — manual, automatic, utility knife, and rotary. When to use each and how.',
    chapters: 5,
    colorA:   '#cc44ff',
    colorB:   '#ff4444',
    requires: null,
  },
];

const CSS = `
.lh{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}
.lh-top{height:52px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(0,212,255,.15);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;}
.lh-back{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:7px 13px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.lh-title{flex:1;text-align:center;font-size:14px;font-weight:800;letter-spacing:3px;color:#fff;}
.lh-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:14px;}

.lh-card{border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s,box-shadow .12s;}
.lh-card:active{transform:scale(.97);}
.lh-card.locked{opacity:.5;cursor:not-allowed;}
.lh-card.locked:active{transform:none;}

.lh-card-head{padding:18px 18px 14px;position:relative;overflow:hidden;}
.lh-card-bg{position:absolute;inset:0;opacity:.15;}
.lh-card-module{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.55);margin-bottom:6px;}
.lh-card-title{font-size:22px;font-weight:900;letter-spacing:2px;color:#fff;margin-bottom:4px;}
.lh-card-desc{font-size:12px;color:rgba(255,255,255,.6);line-height:1.5;}

.lh-card-foot{padding:12px 18px;background:rgba(4,8,18,.7);display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(255,255,255,.06);}
.lh-card-meta{display:flex;align-items:center;gap:10px;}
.lh-chapters{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.4);letter-spacing:1px;}
.lh-stars{display:flex;gap:3px;}
.lh-star{font-size:14px;filter:grayscale(1) opacity(.3);}
.lh-star.lit{filter:none;}
.lh-btn{padding:9px 20px;border-radius:10px;font-size:12px;font-weight:800;letter-spacing:1px;border:none;font-family:'Exo 2',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.lh-btn-start{background:linear-gradient(135deg,var(--ca),var(--cb));color:#000;}
.lh-btn-done{background:rgba(45,198,83,.2);border:1px solid #2dc653;color:#2dc653;}
.lh-btn-locked{background:rgba(255,255,255,.07);color:rgba(255,255,255,.3);cursor:not-allowed;}

.lh-lock{position:absolute;top:14px;right:14px;font-size:22px;opacity:.7;}
.lh-done-badge{position:absolute;top:14px;right:14px;background:rgba(45,198,83,.2);border:1px solid #2dc653;border-radius:8px;padding:3px 10px;font-family:'Share Tech Mono',monospace;font-size:9px;color:#2dc653;letter-spacing:2px;}
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
          <span class="lh-title">LEARN</span>
          <div style="width:72px"></div>
        </header>
        <div class="lh-body" id="lh-body"></div>
      </div>`;

    el.querySelector('.lh-back').addEventListener('click', () => this.state.setState('menu'));
    this._el = el;
    return el;
  }

  _renderCards(progress) {
    const body = this._el.querySelector('#lh-body');
    body.innerHTML = LESSONS.map(lesson => {
      const done   = !!progress[lesson.id];
      const locked = lesson.requires && !progress[lesson.requires];
      const starCount = done ? 3 : 0;

      const starsHTML = [0,1,2].map(i =>
        `<span class="lh-star ${i < starCount ? 'lit' : ''}">★</span>`
      ).join('');

      const btnClass  = done ? 'lh-btn-done' : locked ? 'lh-btn-locked' : 'lh-btn-start';
      const btnLabel  = done ? 'REPLAY ✓' : locked ? '🔒 LOCKED' : 'START →';
      const btnStyle  = locked ? '' : `--ca:${lesson.colorA};--cb:${lesson.colorB}`;

      return `
        <div class="lh-card ${locked ? 'locked' : ''}" data-state="${lesson.state}" data-locked="${locked}">
          <div class="lh-card-head">
            <div class="lh-card-bg" style="background:linear-gradient(135deg,${lesson.colorA},${lesson.colorB})"></div>
            <div class="lh-card-module">${lesson.module}</div>
            <div class="lh-card-title">${lesson.title}</div>
            <div class="lh-card-desc">${lesson.desc}</div>
            ${done  ? `<div class="lh-done-badge">COMPLETED ✓</div>` : ''}
            ${locked ? `<div class="lh-lock">🔒</div>` : ''}
          </div>
          <div class="lh-card-foot">
            <div class="lh-card-meta">
              <span class="lh-chapters">${lesson.chapters} CHAPTERS</span>
              <div class="lh-stars">${starsHTML}</div>
            </div>
            <button class="lh-btn ${btnClass}" style="${btnStyle}" ${locked ? 'disabled' : ''}>${btnLabel}</button>
          </div>
        </div>`;
    }).join('');

    body.querySelectorAll('.lh-card').forEach(card => {
      if (card.dataset.locked === 'true') return;
      card.addEventListener('click', () => {
        this.state.setState(card.dataset.state);
      });
    });
  }

  onShow() {
    this._renderCards(Database.getLessonProgress());
  }
}

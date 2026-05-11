import { Database } from '../systems/Database.js';

const STAGES = [
  {
    key:    'electricianTools',
    state:  'electricianTools',
    num:    '01',
    title:  "ELECTRICIAN'S TOOLS",
    desc:   "Master 12 essential hand tools — cutting, gripping, fastening, testing, and safety rules.",
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <rect x="6" y="20" width="36" height="8" rx="2" fill="#ff9f1c" opacity=".9"/>
      <rect x="14" y="14" width="4" height="20" rx="2" fill="#ffcc88"/>
      <rect x="30" y="14" width="4" height="20" rx="2" fill="#ffcc88"/>
      <circle cx="24" cy="24" r="4" fill="#fff" opacity=".7"/>
    </svg>`,
    colorA: '#ff9f1c',
    colorB: '#ff6600',
  },
  {
    key:    'outlet',
    state:  'outletLesson',
    num:    '02',
    title:  'OUTLET REPAIR',
    desc:   "Repair a broken electrical outlet — shut breaker, remove cover, rewire terminals, test voltage.",
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <rect x="8" y="8" width="32" height="32" rx="4" fill="#334" stroke="#00d4ff" stroke-width="1.5"/>
      <circle cx="18" cy="22" r="4" fill="#555"/>
      <circle cx="30" cy="22" r="4" fill="#555"/>
      <ellipse cx="24" cy="32" rx="4" ry="3" fill="#555"/>
      <circle cx="18" cy="22" r="2" fill="#222"/>
      <circle cx="30" cy="22" r="2" fill="#222"/>
    </svg>`,
    colorA: '#00d4ff',
    colorB: '#0088cc',
  },
];

const CSS = `
.sh{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

.sh-top{height:52px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(0,212,255,.15);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;}
.sh-back{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:7px 13px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.sh-title{flex:1;text-align:center;font-size:13px;font-weight:800;letter-spacing:3px;color:#fff;}
.sh-pct{font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(0,212,255,.7);white-space:nowrap;}

.sh-body{flex:1;overflow-y:auto;padding:16px 14px 24px;display:flex;flex-direction:column;gap:14px;}

.sh-hero{text-align:center;padding:8px 0 4px;}
.sh-hero-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:4px;color:rgba(0,212,255,.5);margin-bottom:6px;}
.sh-hero-title{font-size:20px;font-weight:900;letter-spacing:2px;color:#fff;}

.sh-chips{display:flex;gap:6px;justify-content:center;padding:6px 0;}
.sh-chip{width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,.1);transition:background .3s;}
.sh-chip.done{background:#2dc653;}
.sh-chip.active{background:#00d4ff;}

.sh-card{border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);position:relative;background:rgba(8,16,36,.8);}
.sh-card.locked{opacity:.55;}

.sh-card-head{padding:18px 18px 14px;position:relative;overflow:hidden;display:flex;gap:14px;align-items:flex-start;}
.sh-card-bg{position:absolute;inset:0;opacity:.12;}
.sh-card-icon{flex-shrink:0;position:relative;z-index:1;}
.sh-card-info{flex:1;position:relative;z-index:1;}
.sh-card-num{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.45);margin-bottom:4px;}
.sh-card-title{font-size:19px;font-weight:900;letter-spacing:1px;color:#fff;line-height:1.2;margin-bottom:6px;}
.sh-card-desc{font-size:11px;color:rgba(255,255,255,.55);line-height:1.5;}

.sh-status-badge{position:absolute;top:14px;right:14px;border-radius:8px;padding:3px 10px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;}
.sh-badge-avail{background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.4);color:#00d4ff;}
.sh-badge-done{background:rgba(45,198,83,.15);border:1px solid #2dc653;color:#2dc653;}
.sh-badge-locked{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.35);}

.sh-card-foot{padding:12px 18px;background:rgba(4,8,18,.7);display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(255,255,255,.06);}
.sh-card-prog{flex:1;display:flex;align-items:center;gap:8px;}
.sh-prog-bar{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.sh-prog-fill{height:100%;border-radius:2px;transition:width .5s;}
.sh-prog-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,.35);white-space:nowrap;}

.sh-btn{padding:10px 22px;border-radius:10px;font-size:12px;font-weight:800;letter-spacing:1px;border:none;font-family:'Exo 2',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;white-space:nowrap;}
.sh-btn-start{background:linear-gradient(135deg,var(--ca),var(--cb));color:#000;}
.sh-btn-replay{background:rgba(45,198,83,.18);border:1px solid #2dc653;color:#2dc653;}
.sh-btn-locked{background:rgba(255,255,255,.07);color:rgba(255,255,255,.25);cursor:not-allowed;}

.sh-explore{border-radius:18px;border:2px dashed rgba(255,255,255,.15);padding:22px 18px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;position:relative;overflow:hidden;transition:border-color .3s,box-shadow .3s;}
.sh-explore.unlocked{border-color:rgba(255,170,0,.55);box-shadow:0 0 24px rgba(255,170,0,.15);animation:shExpGlow 2.2s ease-in-out infinite;}
@keyframes shExpGlow{0%,100%{box-shadow:0 0 16px rgba(255,170,0,.1)}50%{box-shadow:0 0 32px rgba(255,170,0,.3)}}
.sh-explore-icon{font-size:36px;line-height:1;}
.sh-explore-title{font-size:16px;font-weight:900;letter-spacing:3px;color:#fff;}
.sh-explore-desc{font-size:11px;color:rgba(255,255,255,.45);line-height:1.5;}
.sh-explore-btn{padding:12px 32px;border-radius:12px;background:linear-gradient(135deg,#ffaa00,#ff6600);color:#000;font-size:13px;font-weight:900;letter-spacing:1px;border:none;cursor:pointer;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;}
.sh-explore-locked{display:flex;align-items:center;gap:6px;font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.25);letter-spacing:2px;}
`;

function injectCSS() {
  if (document.querySelector('#sh-css')) return;
  const s = document.createElement('style');
  s.id = 'sh-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export class StagesHub {
  constructor(state) {
    this.state = state;
    this.container = this._build();
  }

  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="sh">
        <header class="sh-top">
          <button class="sh-back">← MENU</button>
          <span class="sh-title">⚡ WIREVERSE</span>
          <span class="sh-pct" id="sh-pct">0%</span>
        </header>
        <div class="sh-body" id="sh-body"></div>
      </div>`;
    el.querySelector('.sh-back').addEventListener('click', () => this.state.setState('menu'));
    this._el = el;
    return el;
  }

  _render() {
    const stages    = Database.load().learnStages || {};
    const exploreOn = Database.isExploreModeUnlocked();
    const doneCount = Object.values(stages).filter(Boolean).length;
    const total     = STAGES.length + 1; // stages + explore
    const pct       = Math.round((doneCount / total) * 100);

    this._el.querySelector('#sh-pct').textContent = pct + '%';

    const body = this._el.querySelector('#sh-body');

    const chips = STAGES.map((_, i) => {
      const done = stages[STAGES[i].key];
      const cls  = done ? 'done' : i === doneCount ? 'active' : '';
      return `<div class="sh-chip ${cls}"></div>`;
    }).join('') + `<div class="sh-chip ${exploreOn ? 'done' : doneCount === STAGES.length ? 'active' : ''}"></div>`;

    body.innerHTML = `
      <div class="sh-hero">
        <div class="sh-hero-label">LEARNING PATHWAY</div>
        <div class="sh-hero-title">STAGE PROGRESSION</div>
      </div>
      <div class="sh-chips">${chips}</div>
      ${STAGES.map(s => this._cardHTML(s, stages)).join('')}
      ${this._exploreHTML(exploreOn)}
    `;

    body.querySelectorAll('.sh-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        this.state.setState(card.dataset.state);
      });
    });

    const exploreBtn = body.querySelector('.sh-explore-btn');
    if (exploreBtn) exploreBtn.addEventListener('click', () => this.state.setState('explore'));
  }

  _cardHTML(stage, stages) {
    const done    = !!stages[stage.key];
    const locked  = !Database.isLearnStageUnlocked(stage.key);
    const progPct = done ? 100 : 0;

    const badgeClass = done ? 'sh-badge-done' : locked ? 'sh-badge-locked' : 'sh-badge-avail';
    const badgeText  = done ? 'COMPLETE ✓'   : locked ? '🔒 LOCKED'       : 'AVAILABLE';

    const btnClass = done ? 'sh-btn-replay' : locked ? 'sh-btn-locked' : 'sh-btn-start';
    const btnLabel = done ? 'REPLAY'        : locked ? '🔒 LOCKED'     : 'START →';
    const btnStyle = !locked && !done ? `--ca:${stage.colorA};--cb:${stage.colorB}` : '';

    return `
      <div class="sh-card ${locked ? 'locked' : ''}" data-state="${stage.state}">
        <div class="sh-card-head">
          <div class="sh-card-bg" style="background:linear-gradient(135deg,${stage.colorA},${stage.colorB})"></div>
          <div class="sh-card-icon">${stage.icon}</div>
          <div class="sh-card-info">
            <div class="sh-card-num">STAGE ${stage.num}</div>
            <div class="sh-card-title">${stage.title}</div>
            <div class="sh-card-desc">${stage.desc}</div>
          </div>
          <div class="sh-status-badge ${badgeClass}">${badgeText}</div>
        </div>
        <div class="sh-card-foot">
          <div class="sh-card-prog">
            <div class="sh-prog-bar">
              <div class="sh-prog-fill" style="width:${progPct}%;background:linear-gradient(90deg,${stage.colorA},${stage.colorB})"></div>
            </div>
            <span class="sh-prog-lbl">${progPct}%</span>
          </div>
          <button class="sh-btn ${btnClass}" style="${btnStyle}" ${locked ? 'disabled' : ''}>${btnLabel}</button>
        </div>
      </div>`;
  }

  _exploreHTML(unlocked) {
    return `
      <div class="sh-explore ${unlocked ? 'unlocked' : ''}">
        <div class="sh-explore-icon">⚡</div>
        <div class="sh-explore-title">EXPLORE MODE</div>
        <div class="sh-explore-desc">Walk through a realistic electrical workshop. Fix outlets, wire switches, and explore the environment in first-person 3D.</div>
        ${unlocked
          ? `<button class="sh-explore-btn">ENTER EXPLORE →</button>`
          : `<div class="sh-explore-locked">🔒 COMPLETE BOTH STAGES TO UNLOCK</div>`
        }
      </div>`;
  }

  onShow() {
    this._render();
  }
}

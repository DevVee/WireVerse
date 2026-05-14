import { Database } from '../systems/Database.js';

// ── STAGE DEFINITIONS (in order) ────────────────────────────────────────────
const STAGES = [
  {
    key:   'wireTypes',
    state: 'wireTypes',
    num:   '01',
    title: 'UNDERSTAND\nTHE BASICS',
    short: 'Understand the Basics',
    desc:  'Learn what wires are, their types, colors, and basic functions.',
    icon:  'wire',
    color: '#00d4ff',
    img:   'https://images.unsplash.com/photo-1597766370173-a14200ec0b42?w=400&q=70&auto=format',
  },
  {
    key:   'electricianTools',
    state: 'electricianTools',
    num:   '02',
    title: 'LEARN\nTHE TOOLS',
    short: 'Learn the Tools',
    desc:  'Get familiar with electrical tools and their proper use.',
    icon:  'tools',
    color: '#f59e0b',
    img:   'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?w=400&q=70&auto=format',
  },
  {
    key:   'wireStripping',
    state: 'wireStripping',
    num:   '03',
    title: 'WIRE\nSTRIPPING',
    short: 'Wire Stripping',
    desc:  'Learn how to strip wires safely and correctly.',
    icon:  'strip',
    color: '#22c55e',
    img:   'https://images.pexels.com/photos/5853935/pexels-photo-5853935.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    key:   'learnOutlet',
    state: 'learnOutlet',
    num:   '04',
    title: 'BASIC\nCONNECTIONS',
    short: 'Basic Connections',
    desc:  'Learn basic wiring connections using PH standard.',
    icon:  'outlet',
    color: '#ef4444',
    img:   'https://images.unsplash.com/photo-1565049981953-379c9c2a5d48?w=400&q=70&auto=format',
  },
  {
    key:   'switchInstallation',
    state: 'switchInstallation',
    num:   '05',
    title: 'SCENARIO\nCHALLENGES',
    short: 'Scenario Challenges',
    desc:  'Apply your knowledge in real-life electrical scenarios.',
    icon:  'scenario',
    color: '#3b82f6',
    img:   'https://images.unsplash.com/photo-1566417110090-6b15a06ec800?w=400&q=70&auto=format',
  },
  {
    key:   'ways',
    state: 'explore',
    num:   '06',
    title: 'ADVANCED\nMASTERY',
    short: 'Advanced Mastery',
    desc:  'Advanced projects and become a wiring master!',
    icon:  'trophy',
    color: '#f59e0b',
    img:   'https://images.unsplash.com/photo-1682345262055-8f95f3c513ea?w=400&q=70&auto=format',
  },
];

// ── ICONS ────────────────────────────────────────────────────────────────────
function _icon(type, col) {
  const k = `stroke="${col}" stroke-width="1.5"`;
  switch (type) {
    case 'wire':     return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${k}><path d="M2 12h4l3-7 4 14 3-7h6"/></svg>`;
    case 'tools':    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${k}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    case 'strip':    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${k}><path d="M6 3v18M6 12h6m0-9v18"/><path d="M14 8l4-5M14 16l4 5"/></svg>`;
    case 'outlet':   return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${k}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="8" x2="9" y2="12"/><line x1="15" y1="8" x2="15" y2="12"/><path d="M9 15h6"/></svg>`;
    case 'scenario': return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${k}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'trophy':   return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${k}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;
    default:         return '';
  }
}

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
/* ── ROOT ── */
.sh{position:absolute;inset:0;display:flex;flex-direction:column;background:#060a14;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── HEADER ── */
.sh-top{
  flex-shrink:0;height:52px;
  background:rgba(4,8,20,.98);border-bottom:1px solid rgba(0,212,255,.16);
  display:flex;align-items:center;padding:0 14px;gap:10px;
}
.sh-back{
  background:rgba(0,212,255,.07);border:1px solid rgba(0,212,255,.28);color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:.1em;
  padding:7px 13px;border-radius:8px;cursor:pointer;transition:all .15s;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.sh-back:active{transform:scale(.93);}
.sh-title-wrap{flex:1;text-align:center;}
.sh-title{font-size:17px;font-weight:900;letter-spacing:.3em;color:#fff;}
.sh-title-sub{font-size:8px;letter-spacing:.22em;color:rgba(0,212,255,.4);margin-top:1px;}
.sh-pct-badge{
  font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;color:#00d4ff;
  background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);
  border-radius:6px;padding:5px 10px;
}

/* ── MAIN AREA ── */
.sh-main{flex:1;display:flex;overflow:hidden;min-height:0;}

/* ── STAGE STRIP ── */
.sh-strip-area{
  flex:1;display:flex;flex-direction:column;overflow:hidden;
  padding:12px 0 12px 12px;
}
.sh-journey-lbl{
  font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:800;letter-spacing:.28em;
  color:rgba(255,255,255,.22);display:flex;align-items:center;gap:8px;
  margin-bottom:10px;padding-right:12px;flex-shrink:0;
}
.sh-journey-lbl::before,.sh-journey-lbl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.07);}
.sh-scroll{
  flex:1;display:flex;align-items:stretch;
  overflow-x:auto;overflow-y:hidden;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;
}
.sh-scroll::-webkit-scrollbar{display:none;}

/* ── ARROW ── */
.sh-arrow{
  flex-shrink:0;width:22px;display:flex;align-items:center;justify-content:center;
  color:rgba(255,255,255,.18);
}
.sh-arrow svg{width:13px;height:13px;}

/* ── STAGE CARD ── */
.sh-card{
  flex-shrink:0;width:182px;
  background:rgba(6,12,26,.96);border:1px solid rgba(255,255,255,.08);
  border-radius:13px;overflow:hidden;
  display:flex;flex-direction:column;
  cursor:pointer;position:relative;
  transition:transform .15s,border-color .15s,box-shadow .15s;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.sh-card:not(.sh-locked):hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 0 1px rgba(0,212,255,.15);}
.sh-card:not(.sh-locked):active{transform:scale(.95);}
.sh-card.sh-locked{opacity:.45;cursor:not-allowed;}
.sh-card.sh-done{border-color:rgba(34,197,94,.28);}
.sh-card.sh-active{border-color:rgba(0,212,255,.5);box-shadow:0 0 20px rgba(0,212,255,.14);}
.sh-card:nth-child(1){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .04s both;}
.sh-card:nth-child(2){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .10s both;}
.sh-card:nth-child(3){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .17s both;}
.sh-card:nth-child(4){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .24s both;}
.sh-card:nth-child(5){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .31s both;}
.sh-card:nth-child(n+6){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .36s both;}

/* Image band */
.sh-card-img{
  height:86px;flex-shrink:0;position:relative;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.sh-card-img-bg{position:absolute;inset:0;}
.sh-stage-num{
  position:absolute;top:8px;left:10px;z-index:2;
  font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:800;letter-spacing:.2em;
  background:rgba(0,0,0,.55);border-radius:4px;padding:2px 7px;
}
.sh-badge{
  position:absolute;top:8px;right:10px;z-index:2;
  font-family:'Barlow Condensed',sans-serif;font-size:7px;font-weight:800;letter-spacing:.12em;
  padding:2px 7px;border-radius:4px;
}
.sh-b-done  {background:rgba(34,197,94,.2); border:1px solid rgba(34,197,94,.5); color:#4ade80;}
.sh-b-prog  {background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.5);color:#fcd34d;}
.sh-b-avail {background:rgba(0,212,255,.12); border:1px solid rgba(0,212,255,.42);color:#00d4ff;}
.sh-b-lock  {background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.28);}

/* Body */
.sh-card-body{flex:1;padding:9px 11px 7px;display:flex;flex-direction:column;gap:4px;}
.sh-card-title{font-size:16px;font-weight:900;letter-spacing:.04em;color:#fff;line-height:1.15;}
.sh-card-desc{font-size:10px;color:rgba(255,255,255,.4);line-height:1.5;flex:1;font-family:'Barlow',sans-serif;}

/* Action button */
.sh-card-btn{
  margin:0 9px 9px;padding:8px;border-radius:7px;border:none;
  font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:800;letter-spacing:.1em;
  cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:4px;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.sh-card-btn:active:not([disabled]){transform:scale(.95);}
.sh-btn-done{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.35);color:#4ade80;}
.sh-btn-start{background:linear-gradient(135deg,#00d4ff,#0088cc);color:#000;}
.sh-btn-cont{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;}
.sh-btn-lock{background:rgba(255,255,255,.04);color:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.07);pointer-events:none;}

/* ── RIGHT PANEL ── */
.sh-rpanel{
  flex-shrink:0;width:212px;
  display:flex;flex-direction:column;gap:9px;
  padding:12px 12px 12px 0;overflow:hidden;
}
.sh-rcard{
  background:rgba(6,12,26,.96);border:1px solid rgba(255,255,255,.08);
  border-radius:13px;padding:12px 13px;flex-shrink:0;
}
.sh-rlbl{
  font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:800;
  letter-spacing:.25em;color:#00d4ff;text-transform:uppercase;margin-bottom:10px;
}

/* Circular gauge */
.sh-circ-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.sh-circ-wrap{position:relative;width:58px;height:58px;flex-shrink:0;}
.sh-circ-wrap svg{transform:rotate(-90deg);}
.sh-circ-bg  {fill:none;stroke:rgba(255,255,255,.07);stroke-width:5;}
.sh-circ-fill{fill:none;stroke:#00d4ff;stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .7s ease;}
.sh-circ-pct{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;color:#00d4ff;
}
.sh-circ-info{flex:1;}
.sh-circ-head{font-size:13px;font-weight:800;color:#fff;}
.sh-circ-sub{font-size:9px;color:rgba(255,255,255,.36);margin-top:2px;line-height:1.4;font-family:'Barlow',sans-serif;}

/* Checklist */
.sh-chk{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);font-family:'Barlow',sans-serif;}
.sh-chk:last-child{border-bottom:none;}
.sh-chk-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.d-done  {background:#22c55e;}
.d-active{background:#00d4ff;animation:sh-dp 1s infinite;}
.d-lock  {background:rgba(255,255,255,.14);}
@keyframes sh-dp{0%,100%{opacity:1}50%{opacity:.2}}
.sh-chk-name{flex:1;font-size:10px;color:rgba(255,255,255,.58);}
.sh-chk-name.done  {color:rgba(255,255,255,.28);text-decoration:line-through;}
.sh-chk-name.active{color:#fff;}
.sh-chk-tick{font-size:8px;color:#22c55e;}

/* PH wire rows */
.sh-ph-row{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
.sh-ph-row:last-of-type{margin-bottom:0;}
.sh-ph-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.sh-ph-name{flex:1;font-size:9.5px;color:rgba(255,255,255,.68);font-family:'Barlow',sans-serif;}
.sh-ph-role{font-size:8.5px;color:rgba(255,255,255,.26);font-family:'Barlow',sans-serif;}
.sh-ph-note{margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.06);font-size:8px;color:rgba(255,255,255,.22);line-height:1.5;font-family:'Barlow',sans-serif;}

/* ── LOCK ICON ── */
@keyframes sh-fade-up{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
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
          <div class="sh-title-wrap">
            <div class="sh-title">⚡ WIREVERSE</div>
            <div class="sh-title-sub">LEARNING PATH</div>
          </div>
          <div class="sh-pct-badge" id="sh-pct">0%</div>
        </header>
        <div class="sh-main">
          <div class="sh-strip-area">
            <div class="sh-journey-lbl">YOUR JOURNEY TO BECOME A CERTIFIED ELECTRICIAN</div>
            <div class="sh-scroll" id="sh-scroll"></div>
          </div>
          <div class="sh-rpanel" id="sh-rpanel">
            <div class="sh-rcard">
              <div class="sh-rlbl">YOUR PROGRESS</div>
              <div class="sh-circ-row">
                <div class="sh-circ-wrap">
                  <svg width="58" height="58" viewBox="0 0 58 58">
                    <circle class="sh-circ-bg"   cx="29" cy="29" r="23"/>
                    <circle class="sh-circ-fill" id="sh-circ" cx="29" cy="29" r="23"
                      stroke-dasharray="144.5" stroke-dashoffset="144.5"/>
                  </svg>
                  <div class="sh-circ-pct" id="sh-pct2">0%</div>
                </div>
                <div class="sh-circ-info">
                  <div class="sh-circ-head" id="sh-head">Just Started</div>
                  <div class="sh-circ-sub"  id="sh-sub">0 of 6 done</div>
                </div>
              </div>
              <div id="sh-checklist"></div>
            </div>
            <div class="sh-rcard">
              <div class="sh-rlbl">STANDARD WIRING (PH)</div>
              <div style="font-size:8.5px;color:rgba(255,255,255,.3);font-family:'Barlow',sans-serif;margin-bottom:8px;">TYPE A OUTLET</div>
              <div class="sh-ph-row"><div class="sh-ph-dot" style="background:#ef4444"></div><div class="sh-ph-name">Red — Line (Hot)</div><div class="sh-ph-role">From MCB</div></div>
              <div class="sh-ph-row"><div class="sh-ph-dot" style="background:#3b82f6"></div><div class="sh-ph-name">Blue — Neutral</div><div class="sh-ph-role">Return</div></div>
              <div class="sh-ph-row"><div class="sh-ph-dot" style="background:#22c55e"></div><div class="sh-ph-name">Green — Ground</div><div class="sh-ph-role">Safety</div></div>
              <div class="sh-ph-note">220V AC / 60Hz · PEC 2017<br>MERALCO grid</div>
            </div>
          </div>
        </div>
      </div>`;

    el.querySelector('.sh-back').addEventListener('click', () => this.state.setState('menu'));
    this._el = el;
    return el;
  }

  _render() {
    const doneCount = STAGES.filter(s => Database.getLearnStage(s.key)).length;
    const total     = STAGES.length;
    const pct       = Math.round((doneCount / total) * 100);
    const activeIdx = STAGES.findIndex(s => !Database.getLearnStage(s.key));

    // Header & gauge
    this._el.querySelector('#sh-pct').textContent  = pct + '%';
    this._el.querySelector('#sh-pct2').textContent = pct + '%';
    const C = 2 * Math.PI * 23; // r=23
    this._el.querySelector('#sh-circ').style.strokeDashoffset = C - (pct / 100) * C;
    const HEADS = ['Just Started','Keep Going!','Good Progress','Half Way!','Almost Done!','Almost Done!','Complete! 🎉'];
    this._el.querySelector('#sh-head').textContent = HEADS[doneCount] || 'Complete!';
    this._el.querySelector('#sh-sub').textContent  = doneCount === total
      ? 'All stages complete!' : `${doneCount} of ${total} done`;

    // Stage cards
    const scroll = this._el.querySelector('#sh-scroll');
    let html = '';
    STAGES.forEach((s, i) => {
      const done     = Database.getLearnStage(s.key);
      const unlocked = Database.isLearnStageUnlocked(s.key);
      const isActive = i === activeIdx && unlocked;
      const locked   = !unlocked;

      const badgeCls = done ? 'sh-b-done' : isActive ? 'sh-b-prog' : unlocked ? 'sh-b-avail' : 'sh-b-lock';
      const badgeTxt = done ? 'COMPLETED' : isActive ? 'IN PROGRESS' : unlocked ? 'AVAILABLE' : 'LOCKED';
      const cardCls  = `sh-card ${done ? 'sh-done' : isActive ? 'sh-active' : locked ? 'sh-locked' : ''}`;
      const btnCls   = done ? 'sh-btn-done' : isActive ? 'sh-btn-cont' : unlocked ? 'sh-btn-start' : 'sh-btn-lock';
      const btnTxt   = done ? '✓  REVIEW' : isActive ? 'CONTINUE →' : unlocked ? 'START →' : '🔒  LOCKED';

      const titleHtml = s.title.split('\n').join('<br>');

      html += `
        <div class="${cardCls}" data-state="${s.state}">
          <div class="sh-card-img">
            <div class="sh-card-img-bg" style="background:linear-gradient(160deg,${s.color}44 0%,rgba(4,8,20,.85) 100%),url('${s.img}') center/cover no-repeat;"></div>
            <div class="sh-stage-num" style="color:${s.color}">STAGE ${s.num}</div>
            <div class="sh-badge ${badgeCls}">${badgeTxt}</div>
            <span style="position:relative;z-index:3">${_icon(s.icon, s.color)}</span>
          </div>
          <div class="sh-card-body">
            <div class="sh-card-title">${titleHtml}</div>
            <div class="sh-card-desc">${s.desc}</div>
          </div>
          <button class="sh-card-btn ${btnCls}" ${locked ? 'disabled' : ''}>${btnTxt}</button>
        </div>`;

      if (i < STAGES.length - 1) {
        html += `<div class="sh-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>`;
      }
    });
    scroll.innerHTML = html;

    // Click handlers
    scroll.querySelectorAll('.sh-card:not(.sh-locked)').forEach(card => {
      card.addEventListener('click', () => {
        const st = card.dataset.state;
        if (st) this.state.setState(st);
      });
    });

    // Checklist
    let cl = '';
    STAGES.forEach((s, i) => {
      const done     = Database.getLearnStage(s.key);
      const isActive = i === activeIdx && Database.isLearnStageUnlocked(s.key);
      const unlocked = Database.isLearnStageUnlocked(s.key);
      const dotCls   = done ? 'd-done' : isActive ? 'd-active' : 'd-lock';
      const nameCls  = done ? 'done' : isActive ? 'active' : '';
      cl += `
        <div class="sh-chk">
          <div class="sh-chk-dot ${dotCls}"></div>
          <div class="sh-chk-name ${nameCls}">${s.num.replace(/^0/, '')}. ${s.short}</div>
          ${done ? '<div class="sh-chk-tick">✓</div>' : ''}
        </div>`;
    });
    this._el.querySelector('#sh-checklist').innerHTML = cl;

    // Scroll active card into view
    const activeCard = scroll.querySelector('.sh-active');
    if (activeCard) {
      setTimeout(() => activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 100);
    }
  }

  onShow() { this._render(); }
}

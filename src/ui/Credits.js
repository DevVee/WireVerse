import { Icons, logoHTML } from './Icons.js';

const ENTRIES = [
  { label: 'DEVELOPED BY',    value: 'WireVerse Team Developer', hl: 'blue'   },
  { label: 'GAME DESIGN',     value: 'WireVerse Team',           hl: ''       },
  { label: 'PROGRAMMING',     value: 'WireVerse Team',           hl: 'orange' },
  { label: '3D ART & ASSETS', value: 'WireVerse Team',           hl: 'orange' },
  { label: 'UI / UX DESIGN',  value: 'WireVerse Team',           hl: ''       },
  { label: 'SOUND & MUSIC',   value: 'WireVerse Team',           hl: ''       },
  { label: 'SPECIAL THANKS',  value: 'To all our players and supporters!', hl: '' },
];

const CSS = `
.crd-screen{position:absolute;inset:0;display:flex;flex-direction:column;background:#070d1c;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}
.crd-body{
  flex:1;overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;
  padding:24px 20px 32px;
  display:flex;flex-direction:column;align-items:center;gap:20px;
}
.crd-body::-webkit-scrollbar{display:none;}
.crd-logo-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:8px;}
.crd-list{width:100%;max-width:380px;display:flex;flex-direction:column;gap:0;}
.crd-row{
  display:flex;flex-direction:column;gap:3px;
  padding:14px 16px;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.crd-row:last-child{border-bottom:none;}
.crd-label{font-size:9px;font-weight:800;letter-spacing:3px;color:rgba(0,212,255,.5);text-transform:uppercase;}
.crd-value{font-size:16px;font-weight:800;letter-spacing:.5px;color:#fff;}
.crd-hl-blue  {color:#00d4ff;}
.crd-hl-orange{color:#f59e0b;}
.crd-footer{
  padding:20px 0 4px;
  font-size:10px;color:rgba(255,255,255,.2);letter-spacing:2px;text-align:center;
}
`;

function injectCSS() {
  if (document.querySelector('#crd-css')) return;
  const s = document.createElement('style');
  s.id = 'crd-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export class Credits {
  constructor(state) {
    this.state = state;
    this.container = this._build();
  }

  _build() {
    injectCSS();
    const rows = ENTRIES.map(e => `
      <div class="crd-row">
        <span class="crd-label">${e.label}</span>
        <span class="crd-value ${e.hl ? 'crd-hl-' + e.hl : ''}">${e.value}</span>
      </div>`).join('');

    const el = document.createElement('div');
    el.className = 'screen screen-hidden credits-screen';
    el.innerHTML = `
      <header class="game-header">
        <button class="hdr-back" id="crd-back">${Icons.back}</button>
        <h2 class="hdr-title">CREDITS</h2>
        <div class="hdr-right"></div>
      </header>
      <div class="crd-body">
        <div class="crd-logo-wrap">
          ${logoHTML('clamp(36px,8vw,52px)')}
        </div>
        <div class="crd-list">${rows}</div>
        <div class="crd-footer">WIREVERSE V2 · 2025</div>
      </div>
    `;

    el.querySelector('#crd-back').addEventListener('click', () => this.state.setState('menu'));
    return el;
  }
}

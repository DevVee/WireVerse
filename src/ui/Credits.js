import { Icons, logoHTML } from './Icons.js';

const ENTRIES = [
  { label: 'DEVELOPED BY',   value: 'Volt Games Studio', hl: 'blue'   },
  { label: 'DESIGN LEAD',    value: 'Arjun Dev',         hl: ''       },
  { label: 'LEAD DEVELOPER', value: 'Neha Sharma',       hl: 'orange' },
  { label: 'ART DIRECTOR',   value: 'Ravi Patel',        hl: 'orange' },
  { label: 'SPECIAL THANKS', value: 'To all our players and supporters!', hl: '' },
];

export class Credits {
  constructor(state) {
    this.state = state;
    this.container = this._build();
  }

  _build() {
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
        <div class="crd-top">
          ${logoHTML('clamp(36px,8vw,56px)')}
          <div class="crd-mascot">
            <img src="/Mascot.png" alt="Volt" draggable="false" />
          </div>
        </div>
        <div class="crd-list">${rows}</div>
      </div>
    `;

    el.querySelector('#crd-back').addEventListener('click', () => this.state.setState('menu'));
    return el;
  }
}

import { Icons } from './Icons.js';
import { Database } from '../systems/Database.js';

const NAV = [
  { id: 'learn',        label: 'LEARN',        icon: Icons.learn,        state: 'stagesHub',    primary: true  },
  { id: 'settings',     label: 'SETTINGS',     icon: Icons.settings,     state: 'settings'                     },
  { id: 'achievements', label: 'ACHIEVEMENTS', icon: Icons.achievements, state: 'achievements'                  },
  { id: 'tools',        label: 'TOOLS',        icon: Icons.tools,        state: 'tools'                        },
  { id: 'credits',      label: 'CREDITS',      icon: Icons.credits,      state: 'credits'                      },
  { id: 'exit',         label: 'EXIT',         icon: Icons.exit,         state: 'exit',         danger: true   },
];

export class MainMenu {
  constructor(state) {
    this.state = state;
    this.container = this._build();
  }

  _build() {
    const navHTML = NAV.map(n => `
      <button
        class="mm-btn ${n.primary ? 'mm-btn--play' : ''} ${n.danger ? 'mm-btn--exit' : ''}"
        data-state="${n.state}">
        <span class="mm-btn-icon">${n.icon}</span>
        <span class="mm-btn-label">${n.label}</span>
      </button>`).join('');

    const el = document.createElement('div');
    el.className = 'screen screen-hidden main-menu-screen';
    el.innerHTML = `
      <header class="mm-topbar">
        <div class="mm-player-badge" id="mm-player-badge"></div>
        <div class="mm-stats" id="mm-stats"></div>
      </header>

      <div class="mm-body">
        <div class="mm-left">
          <div class="mm-logo-area">
            <img src="/TextLogo.png" class="mm-logo-img" alt="WireVerse" draggable="false" />
            <p class="mm-tagline">LEARN. CONNECT. POWER THE FUTURE.</p>
          </div>
          <nav class="mm-nav">${navHTML}</nav>
        </div>

        <div class="mm-right">
          <div class="mm-mascot-wrap">
            <div class="mm-mascot-light"></div>
            <img src="/Mascot.png" alt="Volt" class="mm-mascot-img" draggable="false" />
          </div>
        </div>
      </div>
    `;

    el.querySelectorAll('.mm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.state;
        if (s === 'exit') { window.Capacitor?.Plugins?.App?.exitApp?.(); return; }
        this.state.setState(s);
      });
    });

    this._el = el;
    return el;
  }

  onShow() {
    const data  = Database.load();
    const stats = Database.getStats();
    const name  = data.playerName || 'Player';
    const expPct = Math.round((stats.xpInLevel / stats.xpToNext) * 100);

    const explore = Database.getExploreProgress();
    const outletsDone  = explore.outletCount;
    const switchesDone = explore.switchCount;

    this._el.querySelector('#mm-player-badge').innerHTML = `
      <span class="mm-player-icon">${Icons.user}</span>
      <div class="mm-player-info">
        <span class="mm-player-name">${name.toUpperCase()}</span>
        <div class="mm-xp-bar-wrap">
          <div class="mm-xp-bar" style="width:${expPct}%"></div>
        </div>
      </div>
      <span class="mm-level-badge">LVL ${stats.level}</span>
    `;

    this._el.querySelector('#mm-stats').innerHTML = `
      <div class="mm-stat mm-stat-coins">
        <span class="mm-stat-icon">🪙</span>
        <span class="mm-stat-val">${data.coins}</span>
      </div>
      <div class="mm-stat mm-stat-gems">
        <span class="mm-stat-icon">${Icons.gem}</span>
        <span class="mm-stat-val">${data.gems}</span>
      </div>
      <div class="mm-stat mm-stat-explore">
        <span class="mm-stat-icon">⚡</span>
        <span class="mm-stat-val">${outletsDone + switchesDone}/8</span>
      </div>
    `;
  }
}

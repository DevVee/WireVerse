import { Icons, logoHTML } from './Icons.js';
import { Database }     from '../systems/Database.js';
import { SoundManager } from '../systems/SoundManager.js';

const TABS = [
  { id: 'profile', label: 'PROFILE', icon: Icons.user  },
  { id: 'audio',   label: 'AUDIO',   icon: Icons.audio },
];

export class Settings {
  constructor(state) {
    this.state = state;
    this._data = {};
    this._activeTab = 'profile';
    this.container = this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'screen screen-hidden settings-screen';
    el.innerHTML = `
      <header class="game-header">
        <button class="hdr-back" id="stg-back">${Icons.back}</button>
        <h2 class="hdr-title">SETTINGS</h2>
        <div class="hdr-right"></div>
      </header>
      <div class="stg-body">
        <div class="stg-tabs" id="stg-tabs">
          ${TABS.map((t, i) => `
            <button class="stg-tab ${i === 0 ? 'stg-tab--active' : ''}" data-tab="${t.id}">
              <span class="stg-tab-icon">${t.icon}</span>
              <span class="stg-tab-label">${t.label}</span>
            </button>`).join('')}
        </div>
        <div class="stg-content" id="stg-content"></div>
      </div>
    `;

    el.querySelector('#stg-back').addEventListener('click', () => this.state.setState('menu'));

    el.querySelector('#stg-tabs').addEventListener('click', e => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      this._activeTab = btn.dataset.tab;
      el.querySelectorAll('.stg-tab').forEach(b =>
        b.classList.toggle('stg-tab--active', b.dataset.tab === this._activeTab));
      this._renderContent(el);
    });

    this._el = el;
    return el;
  }

  onShow() {
    this._data = { ...Database.load().settings };
    this._renderContent();
  }

  _renderContent(el) {
    const root = (el || this._el).querySelector('#stg-content');

    if (this._activeTab === 'profile') {
      this._renderProfile(root);
    } else if (this._activeTab === 'audio') {
      this._renderAudio(root);
    } else {
      root.innerHTML = `<div class="stg-placeholder">${this._activeTab.charAt(0).toUpperCase() + this._activeTab.slice(1)} settings — coming soon</div>`;
    }
  }

  _renderProfile(root) {
    const name = Database.getPlayerName();
    root.innerHTML = `
      <div class="stg-profile">
        <div class="stg-profile-card">
          <div class="stg-profile-title">PLAYER PROFILE</div>

          <div class="stg-name-row">
            <label class="stg-label">PLAYER NAME</label>
            <div class="stg-name-field">
              <input
                class="stg-name-input"
                id="stg-name-input"
                type="text"
                maxlength="16"
                value="${name}"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>

          <button class="stg-save-btn" id="stg-save-name">
            ${Icons.check} SAVE NAME
          </button>

          <div class="stg-save-status" id="stg-save-status"></div>
        </div>
      </div>
    `;

    root.querySelector('#stg-save-name').addEventListener('click', () => {
      const val = root.querySelector('#stg-name-input').value.trim();
      if (!val) return;
      Database.setPlayerName(val);
      const status = root.querySelector('#stg-save-status');
      status.textContent = 'Name saved!';
      status.className = 'stg-save-status stg-save-status--ok';
      setTimeout(() => { status.textContent = ''; status.className = 'stg-save-status'; }, 2000);
    });
  }

  _renderAudio(root) {
    root.innerHTML = `
      ${this._sliderRow('masterVolume', 'MASTER VOLUME', this._data.masterVolume)}
      ${this._sliderRow('music',        'MUSIC',         this._data.music)}
      ${this._sliderRow('sfx',          'SFX',           this._data.sfx)}
      ${this._toggleRow('vibration',    'VIBRATION',     this._data.vibration)}
      ${this._toggleRow('tutorialHints','TUTORIAL HINTS',this._data.tutorialHints)}
      ${this._toggleRow('darkMode',     'DARK MODE',     this._data.darkMode)}
      <div class="stg-version">Version 1.0.0</div>
    `;

    root.querySelectorAll('.stg-row[data-type="slider"]').forEach(row => {
      const input = row.querySelector('.stg-slider');
      const valEl = row.querySelector('.stg-val');
      const key   = row.dataset.key;
      input.addEventListener('input', () => {
        this._data[key] = Number(input.value);
        valEl.textContent = `${input.value}%`;
        Database.saveSettings(this._data);
        SoundManager.applySettings();
      });
    });

    root.querySelectorAll('.stg-row[data-type="toggle"]').forEach(row => {
      const btn = row.querySelector('.stg-toggle');
      const key = row.dataset.key;
      btn.addEventListener('click', () => {
        const next = !this._data[key];
        this._data[key] = next;
        btn.className = `stg-toggle ${next ? 'stg-toggle--on' : 'stg-toggle--off'}`;
        btn.textContent = next ? 'ON' : 'OFF';
        Database.saveSettings(this._data);
        SoundManager.applySettings();
      });
    });
  }

  _sliderRow(key, label, value) {
    return `
      <div class="stg-row" data-key="${key}" data-type="slider">
        <label class="stg-label">${label}</label>
        <div class="stg-control"><input class="stg-slider" type="range" min="0" max="100" value="${value}" /></div>
        <span class="stg-val">${value}%</span>
      </div>`;
  }

  _toggleRow(key, label, value) {
    return `
      <div class="stg-row" data-key="${key}" data-type="toggle">
        <label class="stg-label">${label}</label>
        <div class="stg-control"></div>
        <button class="stg-toggle ${value ? 'stg-toggle--on' : 'stg-toggle--off'}">${value ? 'ON' : 'OFF'}</button>
      </div>`;
  }
}

import { logoHTML } from './Icons.js';
import { Database } from '../systems/Database.js';

export class NameEntry {
  constructor(state) {
    this.state = state;
    this.container = this._build();
    this._input = this.container.querySelector('#ne-input');
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'screen screen-hidden name-entry-screen';
    el.innerHTML = `
      <div class="ne-bg-grid"></div>
      <div class="ne-content">

        ${logoHTML('clamp(42px, 11vw, 64px)')}
        <p class="ne-tagline">LEARN. CONNECT. POWER THE FUTURE.</p>

        <div class="ne-card">
          <h2 class="ne-title">WELCOME, ELECTRICIAN!</h2>
          <p class="ne-subtitle">Enter your name to begin your journey</p>

          <div class="ne-input-wrap">
            <input
              id="ne-input"
              class="ne-input"
              type="text"
              maxlength="16"
              placeholder="Your name..."
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <button class="ne-start-btn" id="ne-start">
            START JOURNEY
          </button>
        </div>

      </div>
    `;

    const btn   = el.querySelector('#ne-start');
    const input = el.querySelector('#ne-input');

    const submit = () => {
      const name = input.value.trim();
      if (!name) { input.classList.add('ne-input--shake'); setTimeout(() => input.classList.remove('ne-input--shake'), 500); return; }
      Database.setPlayerName(name);
      Database.checkLoginStreak();
      this.state.setState('menu');
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

    return el;
  }

  onShow() { setTimeout(() => this._input?.focus(), 350); }
}

import { Database } from '../systems/Database.js';

const TIPS = [
  'Check your connections carefully. Every wire matters!',
  'Yellow wires carry positive current — plan your route!',
  'A short circuit can blow the fuse. Stay alert.',
  'Use hints wisely — they cost gems to unlock.',
  'Stars are awarded based on accuracy and completion speed.',
];

export class LoadingScreen {
  constructor(state) {
    this.state = state;
    this.container = this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'screen screen-hidden loading-screen';
    el.innerHTML = `
      <div class="ld-bg-circuit"></div>
      <div class="ld-bg-vignette"></div>

      <div class="ld-content">
        <div class="ld-label">LOADING...</div>

        <div class="ld-bar-wrap">
          <div class="ld-track">
            <div class="ld-fill" id="ld-fill">
              <div class="ld-fill-glow"></div>
            </div>
          </div>
          <span class="ld-pct" id="ld-pct">0%</span>
        </div>

        <div class="ld-tip-row">
          <div class="ld-bulb-icon">
            <div class="ld-bulb-shape"></div>
            <div class="ld-bulb-rays"></div>
          </div>
          <p class="ld-tip-text" id="ld-tip"></p>
        </div>
      </div>
    `;
    return el;
  }

  onShow() {
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    this.container.querySelector('#ld-tip').textContent = 'TIP: ' + tip;
    this._run();
  }

  _run() {
    const fill = this.container.querySelector('#ld-fill');
    const pct  = this.container.querySelector('#ld-pct');
    let progress = 0;
    let elapsed = 0;

    const step = () => {
      const inc = Math.random() * 14 + 6;
      progress = Math.min(progress + inc, 100);
      elapsed += 140;

      fill.style.width = `${progress}%`;
      pct.textContent  = `${Math.floor(progress)}%`;

      // Minimum 1 second on screen, complete when both time & progress met
      if (progress >= 100 && elapsed >= 1000) {
        setTimeout(() => {
          if (Database.isFirstLaunch()) {
            this.state.setState('nameEntry');
          } else {
            Database.checkLoginStreak();
            this.state.setState('menu');
          }
        }, 350);
        return;
      }
      setTimeout(step, 140 + Math.random() * 60);
    };
    step();
  }
}

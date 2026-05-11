import { Icons } from './Icons.js';
import { Database } from '../systems/Database.js';

const ACHIEVEMENTS = [
  { id: 'first_spark',    name: 'First Spark',       desc: 'Complete your first circuit.',     gems: 50,  cat: 'learning', done: true  },
  { id: 'quick_thinker',  name: 'Quick Thinker',     desc: 'Complete a level in under 30s.',   gems: 100, cat: 'learning', done: false, progress: 12, goal: 30 },
  { id: 'perfect_work',   name: 'Perfect Work',      desc: 'Get 3 stars in 10 levels.',        gems: 200, cat: 'expert',   done: false, progress: 4,  goal: 10 },
  { id: 'collector',      name: 'Collector',         desc: 'Collect 1000 coins.',              gems: 75,  cat: 'collector',done: false, progress: 150, goal: 1000 },
];

const CATS = ['ALL', 'LEARNING', 'EXPERT', 'COLLECTOR'];

export class Achievements {
  constructor(state) {
    this.state = state;
    this._cat = 'ALL';
    this.container = this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'screen screen-hidden achievements-screen';
    el.innerHTML = `
      <header class="game-header">
        <button class="hdr-back" id="ach-back">${Icons.back}</button>
        <h2 class="hdr-title">ACHIEVEMENTS</h2>
        <div class="hdr-stats" id="ach-stats"></div>
      </header>
      <div class="ach-tabs" id="ach-tabs">
        ${CATS.map(c => `<button class="ach-tab ${c === 'ALL' ? 'ach-tab--active' : ''}" data-cat="${c}">${c}</button>`).join('')}
      </div>
      <div class="ach-list" id="ach-list"></div>
    `;

    el.querySelector('#ach-back').addEventListener('click', () => this.state.setState('menu'));
    el.querySelector('#ach-tabs').addEventListener('click', e => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      this._cat = btn.dataset.cat;
      el.querySelectorAll('.ach-tab').forEach(b => b.classList.toggle('ach-tab--active', b.dataset.cat === this._cat));
      this._renderList(el);
    });

    this._el = el;
    this._renderList(el);
    return el;
  }

  onShow() {
    const s = Database.getStats();
    this._el.querySelector('#ach-stats').innerHTML = `
      <span class="hstat">${Icons.gem}<b>${s.gems}</b></span>
    `;
  }

  _renderList(el) {
    const list = (el || this._el).querySelector('#ach-list');
    const filtered = this._cat === 'ALL'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter(a => a.cat.toUpperCase() === this._cat);

    list.innerHTML = filtered.map(a => {
      const pct = a.goal ? Math.round((a.progress / a.goal) * 100) : (a.done ? 100 : 0);
      return `
        <div class="ach-item ${a.done ? 'ach-item--done' : ''}">
          <div class="ach-icon">${Icons.achievements}</div>
          <div class="ach-info">
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.desc}</div>
            ${a.goal ? `
              <div class="ach-prog-bar"><div class="ach-prog-fill" style="width:${pct}%"></div></div>
              <div class="ach-prog-label">${a.progress}/${a.goal}</div>
            ` : ''}
          </div>
          <div class="ach-reward">
            ${Icons.gem}<span>${a.gems}</span>
            ${a.done ? `<button class="ach-claim-btn">CLAIM</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

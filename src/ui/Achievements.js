import { Icons } from './Icons.js';
import { Database } from '../systems/Database.js';

function _buildAchievements() {
  const d = Database.load();
  const outlets   = Object.keys(d.exploreOutlets  || {}).length;
  const switches  = Object.keys(d.exploreSwitches || {}).length;
  const ls        = d.learnStages || {};
  const learnDone = [ls.wireTypes, ls.electricianTools, ls.wireStripping, ls.learnOutlet, ls.switchInstallation]
    .filter(Boolean).length;

  return [
    {
      id:  'first_fix',
      name:'First Fix',
      desc:'Repair your first outlet in the workshop.',
      cat: 'explore',
      goal: 1,
      progress: Math.min(outlets, 1),
    },
    {
      id:  'full_repair',
      name:'Full Repair',
      desc:'Fix all 7 outlets in the workshop.',
      cat: 'explore',
      goal: 7,
      progress: outlets,
    },
    {
      id:  'switch_master',
      name:'Switch Master',
      desc:'Wire all 5 light switches.',
      cat: 'explore',
      goal: 5,
      progress: switches,
    },
    {
      id:  'all_clear',
      name:'All Clear',
      desc:'Complete every scenario in the workshop.',
      cat: 'mastery',
      goal: 12,
      progress: outlets + switches,
    },
    {
      id:  'basics_done',
      name:'Wire Basics',
      desc:'Complete Stage 01 — Understand the Basics.',
      cat: 'learning',
      goal: 1,
      progress: ls.wireTypes ? 1 : 0,
    },
    {
      id:  'tools_done',
      name:'Tool Ready',
      desc:'Complete Stage 02 — Learn the Tools.',
      cat: 'learning',
      goal: 1,
      progress: ls.electricianTools ? 1 : 0,
    },
    {
      id:  'strip_done',
      name:'Strip Expert',
      desc:'Complete Stage 03 — Wire Stripping.',
      cat: 'learning',
      goal: 1,
      progress: ls.wireStripping ? 1 : 0,
    },
    {
      id:  'full_course',
      name:'Certified Trainee',
      desc:'Complete all 5 learning stages.',
      cat: 'mastery',
      goal: 5,
      progress: learnDone,
    },
  ];
}

const CATS = ['ALL', 'EXPLORE', 'LEARNING', 'MASTERY'];

const CAT_ICONS = {
  ALL:     '⚡',
  EXPLORE: '🔧',
  LEARNING:'📚',
  MASTERY: '🏆',
};

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
        ${CATS.map(c => `<button class="ach-tab ${c === 'ALL' ? 'ach-tab--active' : ''}" data-cat="${c}">
          <span class="ach-tab-icon">${CAT_ICONS[c]}</span>${c}
        </button>`).join('')}
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
    return el;
  }

  onShow() {
    const achs  = _buildAchievements();
    const done  = achs.filter(a => a.progress >= a.goal).length;
    this._el.querySelector('#ach-stats').innerHTML =
      `<span class="hstat" style="color:#00d4ff;font-size:12px;letter-spacing:.08em;">${done}/${achs.length} UNLOCKED</span>`;
    this._renderList(this._el);
  }

  _renderList(el) {
    const list = (el || this._el).querySelector('#ach-list');
    const achs  = _buildAchievements();
    const filtered = this._cat === 'ALL'
      ? achs
      : achs.filter(a => a.cat === this._cat.toLowerCase());

    list.innerHTML = filtered.map(a => {
      const pct  = Math.min(100, Math.round((a.progress / a.goal) * 100));
      const done = a.progress >= a.goal;
      const icon = CAT_ICONS[a.cat.toUpperCase()] || '⚡';
      return `
        <div class="ach-item ${done ? 'ach-item--done' : ''}">
          <div class="ach-icon" style="font-size:26px;line-height:1;">${icon}</div>
          <div class="ach-info">
            <div class="ach-name">${a.name}${done ? ' <span style="color:#22c55e;font-size:11px;">✓ UNLOCKED</span>' : ''}</div>
            <div class="ach-desc">${a.desc}</div>
            <div class="ach-prog-bar"><div class="ach-prog-fill" style="width:${pct}%"></div></div>
            <div class="ach-prog-label">${a.progress} / ${a.goal}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

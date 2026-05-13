import { SplashScreen }    from './SplashScreen.js';
import { LoadingScreen }   from './LoadingScreen.js';
import { NameEntry }       from './NameEntry.js';
import { MainMenu }        from './MainMenu.js';
import { Settings }        from './Settings.js';
import { Achievements }    from './Achievements.js';
import { Tools }           from './Tools.js';
import { Credits }         from './Credits.js';
import { LearnHub }              from '../learn/LearnHub.js';
import { WireTypesLesson }       from '../learn/WireTypesLesson.js';
import { ElectricianToolsLesson } from '../learn/ElectricianToolsLesson.js';
import { WireStrippingLesson }   from '../learn/WireStrippingLesson.js';
import { StagesHub }             from './StagesHub.js';
import { OutletLesson }          from '../learn/OutletLesson.js';
import { HtmlLessonScreen }      from '../learn/HtmlLessonScreen.js';
import { ExploreScreen }         from './ExploreScreen.js';

const MAP = {
  splash:             'splash',
  loading:            'loading',
  nameEntry:          'nameEntry',
  menu:               'menu',
  settings:           'settings',
  achievements:       'achievements',
  tools:              'tools',
  credits:            'credits',
  wireLearn:          'wireLearn',
  wireTypes:          'wireTypes',
  electricianTools:   'electricianTools',
  wireStripping:      'wireStripping',
  stagesHub:          'stagesHub',
  outletLesson:       'outletLesson',
  learnOutlet:        'learnOutlet',
  ways:               'ways',
  switchInstallation: 'switchInstallation',
  explore:            'explore',
  game:               null,
};

export class UIManager {
  constructor(state) {
    this.state = state;
    this.root = null;
    this.screens = {};
    this.currentScreen = null;
    this._busy = false;
  }

  init() {
    this.root = document.getElementById('ui-root');

    this.screens = {
      splash:       new SplashScreen(this.state),
      loading:      new LoadingScreen(this.state),
      nameEntry:    new NameEntry(this.state),
      menu:         new MainMenu(this.state),
      settings:     new Settings(this.state),
      achievements: new Achievements(this.state),
      tools:        new Tools(this.state),
      credits:      new Credits(this.state),
      wireLearn:        new LearnHub(this.state),
      wireTypes:        new WireTypesLesson(this.state),
      electricianTools: new ElectricianToolsLesson(this.state),
      wireStripping:    new WireStrippingLesson(this.state),
      stagesHub:          new StagesHub(this.state),
      outletLesson:       new OutletLesson(this.state),
      learnOutlet:        new HtmlLessonScreen(this.state, { key:'learnOutlet',        src:'/learn-outlet.html',        title:'FIX THE FAULTS',       backState:'stagesHub' }),
      ways:               new HtmlLessonScreen(this.state, { key:'ways',               src:'/ways.html',                title:'SWITCH WAYS',          backState:'stagesHub' }),
      switchInstallation: new HtmlLessonScreen(this.state, { key:'switchInstallation', src:'/switch_installation.html', title:'SWITCH INSTALLATION',  backState:'stagesHub' }),
      explore:            new ExploreScreen(this.state),
    };

    for (const screen of Object.values(this.screens)) {
      this.root.appendChild(screen.container);
    }

    this.state.on('stateChange', ({ from, to, payload }) => this._onChange(from, to, payload));
  }

  _onChange(from, to, payload) {
    const target = MAP[to];

    if (to === 'game') {
      if (this.currentScreen) { this._hide(this.currentScreen); this.currentScreen = null; }
      return;
    }
    if (target !== undefined) this._go(target, payload);
  }

  _go(name, payload) {
    if (this._busy) return;
    if (!this.currentScreen) { this._show(name, payload); return; }
    if (this.currentScreen === name) { this.screens[name]?.onShow?.(payload); return; }

    this._busy = true;
    this._hide(this.currentScreen, () => {
      this._show(name, payload);
      this._busy = false;
    });
  }

  _show(name, payload) {
    const s = this.screens[name];
    if (!s) return;
    s.onShow?.(payload);
    s.container.classList.remove('screen-hidden', 'screen-exit');
    void s.container.offsetWidth;
    s.container.classList.add('screen-visible');
    this.currentScreen = name;
  }

  _hide(name, cb) {
    const s = this.screens[name];
    if (!s) { cb?.(); return; }
    s.container.classList.remove('screen-visible');
    s.container.classList.add('screen-exit');

    let done = false;
    const finish = () => {
      if (done) return; done = true;
      clearTimeout(timer);
      s.container.classList.remove('screen-exit');
      s.container.classList.add('screen-hidden');
      s.onHide?.();
      cb?.();
    };
    s.container.addEventListener('transitionend', finish, { once: true });
    const timer = setTimeout(finish, 380);
  }
}

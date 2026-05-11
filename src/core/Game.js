import { StateManager } from './StateManager.js';
import { Loop }         from './Loop.js';
import { Renderer }     from '../systems/Renderer.js';
import { Input }        from '../systems/Input.js';
import { UIManager }    from '../ui/UIManager.js';
import { GameScene }    from '../scenes/GameScene.js';
import { Database }     from '../systems/Database.js';

export class Game {
  constructor() {
    this.state    = new StateManager();
    this.loop     = new Loop();
    this.renderer = new Renderer();
    this.input    = new Input();
    this.ui       = new UIManager(this.state);
    this.scene    = new GameScene(this.renderer, this.loop, this.state);
    this.db       = Database;
  }

  init() {
    this.renderer.init();
    this.input.init();
    this.ui.init();
    this.scene.init();

    this.state.on('stateChange', ({ from, to }) => {
      if (to === 'game') {
        this.renderer.show();
        this.loop.start();
      } else if (from === 'game') {
        this.renderer.hide();
        this.loop.stop();
      }
    });

    this.loop.add(delta => this.scene.update(delta));

    // Flow: splash (2s) → loading (1s+) → nameEntry/menu
    this.state.setState('splash');
  }
}

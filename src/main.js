import { Game }        from './core/Game.js';
import { SoundManager } from './systems/SoundManager.js';

SoundManager.init();
const game = new Game();
game.init();

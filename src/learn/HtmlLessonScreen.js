import { Database } from '../systems/Database.js';

const CSS = `
.hls{position:absolute;inset:0;background:#060a14;}
.hls-frame{position:absolute;inset:0;border:none;width:100%;height:100%;}
.hls-fab{
  position:absolute;top:12px;left:12px;z-index:100;
  background:rgba(4,8,20,.88);border:1px solid rgba(0,212,255,.35);
  color:#00d4ff;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;
  padding:8px 14px;border-radius:9px;cursor:pointer;touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;letter-spacing:1px;
  box-shadow:0 2px 12px rgba(0,0,0,.5);transition:all .15s;
  display:flex;align-items:center;gap:6px;
}
.hls-fab:active{transform:scale(.93);}
`;

let _cssInjected = false;
function injectCSS() {
  if (_cssInjected) return; _cssInjected = true;
  const s = document.createElement('style');
  s.id = 'hls-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export class HtmlLessonScreen {
  /**
   * @param {object} state - StateManager
   * @param {{ key:string, src:string, title:string, backState:string }} cfg
   */
  constructor(state, cfg) {
    this.state = state;
    this.cfg   = cfg;
    this.container = this._build();
  }

  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="hls">
        <button class="hls-fab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          BACK
        </button>
        <iframe class="hls-frame" id="hls-frame" allowfullscreen></iframe>
      </div>`;

    const back = () => this.state.setState(this.cfg.backState || 'stagesHub');
    el.querySelector('.hls-fab').addEventListener('click', back);
    el.querySelector('.hls-fab').addEventListener('touchend', e => { e.preventDefault(); back(); });

    this._msgHandler = e => {
      if (e.data?.type === 'complete') this._complete();
      if (e.data?.type === 'back') back();
    };

    this._el = el;
    return el;
  }

  _complete() {
    Database.saveLearnStage(this.cfg.key);
  }

  onShow() {
    window.addEventListener('message', this._msgHandler);
    const frame = this._el.querySelector('#hls-frame');
    frame.src = this.cfg.src;
  }

  onHide() {
    window.removeEventListener('message', this._msgHandler);
    const frame = this._el.querySelector('#hls-frame');
    frame.src = 'about:blank';
  }
}

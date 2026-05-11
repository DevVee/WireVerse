export class SplashScreen {
  constructor(state) {
    this.state = state;
    this._timer = null;
    this.container = this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'screen screen-hidden splash-screen';
    el.innerHTML = `
      <div class="sp-bg-layer"></div>
      <div class="sp-glow-left"></div>
      <div class="sp-glow-right"></div>

      <div class="sp-body">
        <!-- Left: logo + tagline -->
        <div class="sp-left">
          <div class="sp-logo-wrap">
            <img src="/TextLogo.png" class="sp-logo-img" alt="WireVerse" draggable="false" />
          </div>
          <p class="sp-tagline">LEARN. CONNECT. POWER THE FUTURE.</p>
        </div>

        <!-- Right: mascot -->
        <div class="sp-right">
          <img src="/Mascot.png" alt="Volt" class="sp-mascot" draggable="false" />
          <div class="sp-mascot-glow"></div>
        </div>
      </div>

      <div class="sp-footer">
        <span class="sp-version">Version 1.0.0</span>
      </div>
    `;
    return el;
  }

  onShow() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.state.setState('loading'), 2200);
  }

  onHide() {
    clearTimeout(this._timer);
  }
}

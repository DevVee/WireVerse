import sys

content_to_insert = """    .register-input::placeholder { color:rgba(255,255,255,.25); }
    .register-error {
      color: #ff5544; font-family: 'Bebas Neue', cursive;
      font-size: 16px; letter-spacing: 2px;
      display: none;
    }
    .btn-confirm {
      width:100%; padding:18px;
      background: linear-gradient(135deg, #1a4070 0%, #0d2040 100%);
      border: 3px solid #ffd700; border-radius: 50px;
      font-family: 'Bebas Neue', cursive;
      font-size: 26px; color: #fff; letter-spacing: 4px;
      cursor: pointer; transition: all .2s;
      box-shadow: 0 6px 0 rgba(0,0,0,.4), 0 0 20px rgba(255,215,0,.15);
    }
    .btn-confirm:hover { transform:translateY(-3px); box-shadow:0 9px 0 rgba(0,0,0,.4),0 0 28px rgba(255,215,0,.3); }
    .btn-confirm:active { transform:translateY(3px); }

    .stages-container {
      display: flex;
      flex-direction: row;
      gap: 16px;
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      padding: 20px 20px 40px 20px;
      -webkit-overflow-scrolling: touch;
      align-items: stretch;
    }
    .stages-container::-webkit-scrollbar { height: 6px; }
    .stages-container::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.5); border-radius: 3px; }

    .stage-card {
      scroll-snap-align: center;
      flex-shrink: 0;
      width: 85vw;
      max-width: 350px;
      display: flex; align-items:center; gap:16px;
      background: linear-gradient(135deg, #1e2e44 0%, #0d1826 100%);
      border: 2px solid rgba(255,215,0,.35);
      border-radius: 16px; padding: 18px 22px;
      cursor: pointer; transition: all .2s;
      box-shadow: 0 4px 18px rgba(0,0,0,.5);
    }
    .stage-card:hover { transform:translateY(-3px); border-color:rgba(255,215,0,.75); box-shadow:0 8px 28px rgba(0,0,0,.6); }
    .stage-card:active { transform:translateY(1px); }
    .stage-card.stage-locked { opacity:.45; cursor:not-allowed; }
    .stage-card.stage-locked:hover { transform:none; border-color:rgba(255,215,0,.35); }
    .stage-icon { font-size:34px; width:44px; text-align:center; }
    .stage-info { flex:1; }
    .stage-title { font-family:'Bebas Neue',cursive; font-size:clamp(16px,3vw,22px); letter-spacing:2px; }
    .stage-sub   { font-size:11px; color:rgba(255,255,255,.45); letter-spacing:1px; margin-top:3px; font-family:'Bebas Neue',cursive; }
    .stage-prog  { display:flex; align-items:center; gap:10px; margin-top:10px; }
    .stage-prog-bar { flex:1; height:4px; background:rgba(255,255,255,.1); border-radius:2px; }
    .stage-prog-fill { height:100%; border-radius:2px; transition:width .4s ease; }
    .stage-prog-label { font-family:'Bebas Neue',cursive; font-size:12px; color:rgba(255,255,255,.4); letter-spacing:1px; white-space:nowrap; }
    .stage-arrow { font-size:20px; color:rgba(255,215,0,.5); }

    /* ── Level Cards ─────────────────────────────────────────────────────── */
    .levels-container {
      display: flex;
      flex-direction: row;
      gap: 16px;
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      padding: 20px 20px 40px 20px;
      -webkit-overflow-scrolling: touch;
      align-items: stretch;
    }
    .levels-container::-webkit-scrollbar { height: 6px; }
    .levels-container::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.5); border-radius: 3px; }

    .level-card {
      scroll-snap-align: center;
      flex-shrink: 0;
      width: 85vw;
      max-width: 380px;
      display: flex; align-items: center; gap: 14px;
      background: linear-gradient(135deg, #19283e 0%, #0d1826 100%);
      border: 2px solid rgba(255,255,255,.12);
      border-radius: 14px; padding: 16px 18px;
      transition: all .2s;
    }
    .level-card.level-unlocked { border-color:rgba(255,215,0,.4); cursor:pointer; }
    .level-card.level-unlocked:hover { transform:translateY(-2px); border-color:rgba(255,215,0,.75); box-shadow:0 6px 20px rgba(0,0,0,.5); }
    .level-card.level-completed { border-color:rgba(68,200,100,.4); background:linear-gradient(135deg,#142a1e 0%,#0d1826 100%); }
    .level-card.level-locked { opacity:.4; }
    .level-num { font-family:'Bebas Neue',cursive; font-size:28px; letter-spacing:1px; width:52px; text-align:center; flex-shrink:0; }
    .level-info { flex:1; }
    .level-title { font-family:'Bebas Neue',cursive; font-size:clamp(15px,2.5vw,20px); color:#fff; letter-spacing:1.5px; }
    .level-done-badge { font-size:11px; color:#44c864; letter-spacing:1px; }
    .level-desc  { font-size:11px; color:rgba(255,255,255,.45); margin-top:4px; line-height:1.5; }
    .level-meta  { display:flex; align-items:center; gap:14px; margin-top:8px; }
    .level-dur   { font-family:'Bebas Neue',cursive; font-size:13px; color:rgba(255,255,255,.4); letter-spacing:1px; }
    .level-stars { font-size:16px; letter-spacing:2px; }
    .level-action { flex-shrink:0; }
    .level-lock  { font-size:22px; }
    .btn-play {
      padding: 10px 22px;
      background: linear-gradient(135deg, #1a4070 0%, #0d2040 100%);
      border: 2px solid #ffd700; border-radius: 50px;
      font-family:'Bebas Neue',cursive;
      font-size:18px; color:#fff; letter-spacing:2px;
      cursor:pointer; transition:all .15s;
      box-shadow:0 4px 0 rgba(0,0,0,.4);
    }
    .btn-play:hover { transform:translateY(-2px); box-shadow:0 6px 0 rgba(0,0,0,.4); }
    .btn-play:active { transform:translateY(2px); box-shadow:0 1px 0 rgba(0,0,0,.4); }

    /* ── Learn Screen ────────────────────────────────────────────────────── */
    .learn-container { display:flex; flex-direction:column; gap:12px; width:100%; max-width:620px; }
    .learn-card {
      background: linear-gradient(135deg, #1a2e48 0%, #0d1826 100%);
      border: 2px solid rgba(255,215,0,.25);
      border-radius: 14px; overflow:hidden;
    }
    .learn-header {
      display:flex; align-items:center; gap:14px;
      padding:16px 20px; cursor:pointer;
      transition: background .2s;
    }
    .learn-header:hover { background:rgba(255,215,0,.06); }
    .learn-icon  { font-size:24px; }
    .learn-title { flex:1; font-family:'Bebas Neue',cursive; font-size:clamp(16px,3vw,22px); color:#ffd700; letter-spacing:2px; }
    .learn-chevron { color:rgba(255,215,0,.5); font-size:14px; }
    .learn-body {
      padding: 0 20px 18px 58px;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 13px; line-height: 1.7;
      color: rgba(255,255,255,.7);
    }
    .learn-body ul { padding-left:16px; }
    .learn-body li { margin-bottom:6px; }
    .learn-body strong { color:rgba(255,215,0,.85); }
    .learn-body p { margin-bottom:10px; }

    /* ── Settings Screen ─────────────────────────────────────────────────── */
    .settings-box {
      background: linear-gradient(135deg, #1a2e48 0%, #0d1826 100%);
      border: 2px solid rgba(255,215,0,.35);
      border-radius: 20px;
      padding: clamp(20px,4vw,40px) clamp(20px,5vw,56px);
      width:100%; max-width:480px;
      display:flex; flex-direction:column; gap:22px;
      box-shadow:0 16px 48px rgba(0,0,0,.7);
    }
    .setting-row {
      display:flex; align-items:center; justify-content:space-between; gap:14px;
    }
    .setting-label {
      font-family:'Bebas Neue',cursive;
      font-size:clamp(16px,2.5vw,20px);
      color:#ffd700; letter-spacing:2px; flex-shrink:0;
    }
    .setting-input {
      flex:1; padding:10px 16px;
      background:rgba(255,255,255,.07);
      border:2px solid rgba(255,215,0,.35); border-radius:10px;
      font-family:'Bebas Neue',cursive; font-size:18px; color:#fff;
      letter-spacing:2px; outline:none; transition:border-color .2s;
      min-width:0;
    }
    .setting-input:focus { border-color:#ffd700; }
    .setting-divider {
      height:1px; background:rgba(255,215,0,.15); margin:4px 0;
    }
    /* Toggle switch */
    .toggle-wrap { display:flex; align-items:center; gap:10px; }
    .toggle {
      position:relative; width:48px; height:26px;
      -webkit-appearance:none; appearance:none;
      background:rgba(255,255,255,.15); border-radius:13px;
      cursor:pointer; outline:none; transition:background .2s;
      flex-shrink:0;
    }
    .toggle:checked { background:#ffd700; }
    .toggle::after {
      content:''; position:absolute;
      top:3px; left:3px;
      width:20px; height:20px;
      background:#fff; border-radius:50%;
      transition:transform .2s; box-shadow:0 1px 4px rgba(0,0,0,.4);
    }
    .toggle:checked::after { transform:translateX(22px); }
    .vol-slider {
      flex:1; min-width:0; height:4px;
      -webkit-appearance:none; appearance:none;
      background: rgba(255,215,0,.25); border-radius:2px; outline:none;
    }
    .vol-slider::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none;
      width:18px; height:18px;
      background:#ffd700; border-radius:50%; cursor:pointer;
      box-shadow:0 0 8px rgba(255,215,0,.5);
    }
    .btn-settings-save {
      width:100%; padding:16px;
      background:linear-gradient(135deg,#1a4070 0%,#0d2040 100%);
      border:3px solid #ffd700; border-radius:50px;
      font-family:'Bebas Neue',cursive; font-size:24px;
      color:#fff; letter-spacing:4px; cursor:pointer;
      transition:all .2s; box-shadow:0 6px 0 rgba(0,0,0,.4);
    }
    .btn-settings-save:hover { transform:translateY(-3px); }
    .btn-settings-save:active { transform:translateY(3px); }
    .btn-reset-progress {
      width:100%; padding:12px;
      background:transparent;
      border:2px solid rgba(231,76,60,.45); border-radius:50px;
      font-family:'Bebas Neue',cursive; font-size:18px;
      color:rgba(231,76,60,.7); letter-spacing:3px;
      cursor:pointer; transition:all .2s;
    }
    .btn-reset-progress:hover { border-color:rgba(231,76,60,.85); color:#e74c3c; }
    .settings-saved {
      text-align:center; font-family:'Bebas Neue',cursive;
      font-size:18px; color:#44c864; letter-spacing:3px;
      opacity:0; transition:opacity .3s;
    }
    .reset-done {
      text-align:center; font-family:'Bebas Neue',cursive;
      font-size:15px; color:#44c864; letter-spacing:2px;
      display:none;
    }

    /* ── Version / Branding ──────────────────────────────────────────────── */
    .menu-version {
      position:absolute; bottom:16px; left:18px;
      font-family:'Bebas Neue',cursive; font-size:16px;
      color:rgba(255,255,255,.2); z-index:5; letter-spacing:2px;
    }
    .menu-brand {
      position:absolute; bottom:14px; right:18px;
      display:flex; align-items:center; gap:8px; z-index:5;
    }
    .brand-bolt {
      width:30px; height:30px;
      background:linear-gradient(135deg,#ffd700 0%,#ffed4e 100%);
      clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%);
      filter:drop-shadow(0 2px 8px rgba(255,215,0,.5));
      animation:menuBrandPulse 2s infinite;
    }
    @keyframes menuBrandPulse {
      0%,100% { transform:scale(1); } 50% { transform:scale(1.12); }
    }
    .brand-text {
      font-family:'Bebas Neue',cursive; font-size:18px;
      color:rgba(255,255,255,.35); letter-spacing:2px;
    }

    /* ── Quit overlay (iOS) ───────────────────────────────────────────────── */
    #quitMsg {
      position:fixed; inset:0; z-index:9999;
      background:rgba(0,0,0,.85);
      display:none; align-items:center; justify-content:center;
    }
    .quit-box {
      background:linear-gradient(135deg,#1a2e48 0%,#0d1826 100%);
      border:3px solid rgba(255,215,0,.5); border-radius:20px;
      padding:36px 48px; text-align:center;
      display:flex; flex-direction:column; gap:16px; max-width:340px;
    }
    .quit-title {
      font-family:'Bebas Neue',cursive; font-size:32px;
      color:#ffd700; letter-spacing:4px;
    }
    .quit-sub { font-size:13px; color:rgba(255,255,255,.5); line-height:1.6; }
    .btn-quit-cancel {
      padding:14px 32px;
      background:linear-gradient(135deg,#1a4070 0%,#0d2040 100%);
      border:2px solid #ffd700; border-radius:50px;
      font-family:'Bebas Neue',cursive; font-size:22px;
      color:#fff; letter-spacing:3px; cursor:pointer; transition:all .2s;
    }
    .btn-quit-cancel:hover { transform:translateY(-2px); }

    /* ── Scrollbar styling for menu screens ──────────────────────────────── */
    .menu-screen::-webkit-scrollbar { width:4px; }
    .menu-screen::-webkit-scrollbar-track { background:transparent; }
    .menu-screen::-webkit-scrollbar-thumb { background:rgba(255,215,0,.3); border-radius:2px; }
  </style>
</head>

<body>
  <canvas id="c"></canvas>

  <!-- ═══════════════════════════════════════════════════════════════════
       MAIN MENU OVERLAY
  ═══════════════════════════════════════════════════════════════════ -->
  <div id="overlay">
    
    <video autoplay loop muted playsinline id="menuVideoBg" src="Game_Background_Video.mp4"></video>

"""

with open("A:\\Electric\\www\\index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
pattern = r"    \.register-input::placeholder \{ color:rgba\(255,255,255,\.25\); \}\n    \.register-error \{\n      color: #ff5544; font-family: 'Bebas Neue', cursive;\n      font-size: 16px; letter-spacing: 2px;\n      display: none;\n    \}\s*<!-- Electrical Room Background Decorations -->\s*<div class=\"menu-bg\" aria-hidden=\"true\">\s*</div>"

# Use python replace
if "    <!-- Electrical Room Background Decorations -->" in html:
    idx_start = html.find("    .register-input::placeholder { color:rgba(255,255,255,.25); }")
    idx_end = html.find("    <!-- Version + Branding -->", idx_start)
    if idx_start != -1 and idx_end != -1:
        new_html = html[:idx_start] + content_to_insert + "\n    <!-- Version + Branding -->" + html[idx_end + len("    <!-- Version + Branding -->"):]
        with open("A:\\Electric\\www\\index.html", "w", encoding="utf-8") as f:
            f.write(new_html)
        print("Fixed successfully!")
    else:
        print("Couldn't find markers")
else:
    print("Pattern not found")


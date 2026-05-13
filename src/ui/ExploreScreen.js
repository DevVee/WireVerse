import { ExploreScene } from '../scenes/ExploreScene.js';
import { MascotGuide }  from '../systems/MascotGuide.js';

const CSS = `
.ex-wrap{position:absolute;inset:0;background:#07101f;overflow:hidden;}

/* Main world canvas */
#ex-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}

/* ── TOP HUD BAR ─────────────────────────────────────────────── */
.ex-hud{
  position:absolute;top:0;left:0;right:0;
  height:54px;
  background:linear-gradient(180deg,rgba(2,6,16,.96) 0%,rgba(4,10,24,.82) 100%);
  border-bottom:1px solid rgba(0,212,255,.18);
  box-shadow:0 2px 20px rgba(0,0,0,.7),0 0 40px rgba(0,212,255,.04);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;padding:0 12px;gap:8px;z-index:20;pointer-events:none;
}
.ex-hud-back{
  pointer-events:all;
  background:linear-gradient(135deg,rgba(0,212,255,.12),rgba(0,150,200,.06));
  border:1px solid rgba(0,212,255,.35);
  color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;
  padding:8px 14px;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 12px rgba(0,212,255,.15),inset 0 1px 0 rgba(255,255,255,.08);
  transition:all .18s;white-space:nowrap;
}
.ex-hud-back:active{transform:scale(.94);background:rgba(0,212,255,.2);}
.ex-hud-room{
  flex:1;text-align:center;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;
  color:rgba(255,255,255,.9);text-transform:uppercase;
  text-shadow:0 0 20px rgba(0,212,255,.4);
}
.ex-hud-score-wrap{display:flex;align-items:center;gap:6px;}
.ex-hud-score{
  font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;
  color:#00d4ff;letter-spacing:1px;
  background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.25);
  padding:4px 10px;border-radius:8px;
}

/* ── MINIMAP ─────────────────────────────────────────────── */
#ex-minimap{
  position:absolute;top:62px;left:12px;
  width:110px;height:110px;border-radius:12px;
  border:1px solid rgba(0,212,255,.35);
  background:rgba(2,6,16,.85);
  box-shadow:0 0 16px rgba(0,212,255,.12),0 4px 12px rgba(0,0,0,.5);
  z-index:15;
}
.ex-minimap-label{
  position:absolute;top:180px;left:12px;
  font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;
  letter-spacing:3px;color:rgba(0,212,255,.45);text-transform:uppercase;
  z-index:15;pointer-events:none;
}

/* ── CROSSHAIR (desktop) ─────────────────────────────────── */
#ex-crosshair{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;pointer-events:none;z-index:15;}
#ex-crosshair::before,#ex-crosshair::after{content:'';position:absolute;background:rgba(255,255,255,.65);border-radius:1px;}
#ex-crosshair::before{width:2px;height:100%;left:50%;transform:translateX(-50%);}
#ex-crosshair::after{width:100%;height:2px;top:50%;transform:translateY(-50%);}
#ex-crosshair.ex-crosshair--hit::before,#ex-crosshair.ex-crosshair--hit::after{background:#00d4ff;box-shadow:0 0 8px #00d4ff;}

/* ── INTERACTION PROMPT (desktop) ─────────────────────────── */
#ex-prompt{
  position:absolute;bottom:58%;left:50%;transform:translateX(-50%);
  background:rgba(2,6,16,.94);
  border:1px solid rgba(0,212,255,.6);
  color:#00d4ff;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;
  letter-spacing:2px;padding:8px 20px;border-radius:10px;
  z-index:15;display:none;pointer-events:none;white-space:nowrap;
  box-shadow:0 0 20px rgba(0,212,255,.25);
}

/* ── NOTIFICATIONS ───────────────────────────────────────── */
#ex-notify{position:absolute;top:62px;right:12px;width:200px;z-index:15;pointer-events:none;}
.ex-notif{
  background:rgba(2,6,16,.94);border:1px solid rgba(0,212,255,.2);
  border-radius:10px;padding:8px 14px;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;color:#aab8cc;
  margin-bottom:5px;
  animation:exNotifIn .2s ease-out,exNotifFade 3.2s ease forwards;
  box-shadow:0 4px 12px rgba(0,0,0,.4);
}
@keyframes exNotifIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}
@keyframes exNotifFade{0%,65%{opacity:1;transform:translateX(0);}100%{opacity:0;transform:translateX(12px);}}
.ex-notif.ok{color:#44ff88;border-color:rgba(68,255,136,.35);background:rgba(2,20,8,.94);}
.ex-notif.info{color:#60b0ff;border-color:rgba(96,176,255,.3);}

/* ── DESKTOP HINT ────────────────────────────────────────── */
#ex-ptr-msg{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);font-family:'Barlow Condensed',sans-serif;font-size:12px;color:rgba(255,255,255,.3);letter-spacing:2px;z-index:10;pointer-events:none;}


/* ══════════════════════════════════════════════════════════
   MOBILE CONTROLS — REDESIGNED
   ══════════════════════════════════════════════════════════ */

/* Look zone covers full screen but is behind controls */
.ex-look-zone{position:absolute;inset:0;z-index:15;touch-action:none;}

/* ── JOYSTICK ────────────────────────────────────────────── */
.ex-joy-outer{
  position:absolute;bottom:32px;left:24px;
  width:140px;height:140px;border-radius:50%;
  /* Multi-layer ring design */
  background:radial-gradient(circle at 50% 50%,
    rgba(0,212,255,.04) 0%,
    rgba(0,212,255,.02) 60%,
    transparent 100%);
  border:2px solid rgba(0,212,255,.18);
  box-shadow:
    0 0 0 1px rgba(0,212,255,.06),
    inset 0 0 30px rgba(0,212,255,.04),
    0 8px 32px rgba(0,0,0,.5);
  z-index:20;touch-action:none;
  transition:border-color .15s,box-shadow .15s,background .15s;
}
/* Inner dashed guide ring */
.ex-joy-outer::before{
  content:'';position:absolute;inset:12px;border-radius:50%;
  border:1px dashed rgba(0,212,255,.1);
}
/* Outer pulse ring */
.ex-joy-outer::after{
  content:'';position:absolute;inset:-6px;border-radius:50%;
  border:1px solid rgba(0,212,255,.06);
}
.ex-joy-outer.joy-active{
  background:radial-gradient(circle at 50% 50%,
    rgba(0,212,255,.1) 0%,
    rgba(0,212,255,.04) 60%,
    transparent 100%);
  border-color:rgba(0,212,255,.45);
  box-shadow:
    0 0 0 1px rgba(0,212,255,.12),
    0 0 24px rgba(0,212,255,.18),
    inset 0 0 30px rgba(0,212,255,.06),
    0 8px 32px rgba(0,0,0,.5);
}
/* Thumb nub */
.ex-joy-inner{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:56px;height:56px;border-radius:50%;
  background:radial-gradient(circle at 38% 32%,
    rgba(0,220,255,.55) 0%,
    rgba(0,160,220,.35) 45%,
    rgba(0,80,140,.4) 100%);
  border:2px solid rgba(0,212,255,.7);
  box-shadow:
    0 4px 16px rgba(0,0,0,.6),
    0 0 20px rgba(0,212,255,.3),
    inset 0 1px 0 rgba(255,255,255,.2),
    inset 0 -2px 6px rgba(0,0,0,.3);
  transition:box-shadow .1s;
}
.ex-joy-outer.joy-active .ex-joy-inner{
  box-shadow:
    0 4px 16px rgba(0,0,0,.6),
    0 0 28px rgba(0,212,255,.55),
    inset 0 1px 0 rgba(255,255,255,.25),
    inset 0 -2px 6px rgba(0,0,0,.3);
}
/* Directional arrows on joystick */
.ex-joy-arrows{
  position:absolute;inset:0;border-radius:50%;pointer-events:none;
}
.ex-joy-arrows::before,.ex-joy-arrows::after{
  content:'';position:absolute;
  border:solid rgba(0,212,255,.18);
}
.ex-joy-arrows::before{
  width:0;height:0;
  border-width:6px 4px;border-style:solid;border-color:rgba(0,212,255,.18) transparent transparent transparent;
  top:12px;left:50%;transform:translateX(-50%);
  border-top-color:rgba(0,212,255,.25);
}

/* ── INTERACT BUTTON ─────────────────────────────────────── */
.ex-btn-interact{
  position:absolute;bottom:38px;right:22px;
  width:86px;height:86px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,
    rgba(0,30,60,.9) 0%,
    rgba(0,16,38,.95) 100%);
  border:2.5px solid rgba(0,212,255,.22);
  color:rgba(0,212,255,.38);
  display:flex;align-items:center;justify-content:center;
  z-index:20;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none;
  flex-direction:column;gap:2px;
  box-shadow:
    0 6px 24px rgba(0,0,0,.6),
    inset 0 1px 0 rgba(255,255,255,.07),
    inset 0 -2px 8px rgba(0,0,0,.4);
  transition:all .18s cubic-bezier(.4,0,.2,1);
}
.ex-btn-interact:active{transform:scale(.92);}
.ex-btn-interact--active{
  border-color:rgba(0,212,255,.75) !important;
  background:radial-gradient(circle at 40% 35%,
    rgba(0,60,100,.9) 0%,
    rgba(0,30,70,.95) 100%) !important;
  color:#00d4ff !important;
  box-shadow:
    0 0 0 3px rgba(0,212,255,.12),
    0 0 28px rgba(0,212,255,.5),
    0 0 60px rgba(0,212,255,.18),
    0 6px 24px rgba(0,0,0,.5),
    inset 0 1px 0 rgba(255,255,255,.12) !important;
  animation:ex-btn-pulse 1.1s ease-in-out infinite;
}
@keyframes ex-btn-pulse{
  0%,100%{box-shadow:0 0 0 3px rgba(0,212,255,.1),0 0 22px rgba(0,212,255,.4),0 6px 20px rgba(0,0,0,.5);}
  50%{box-shadow:0 0 0 5px rgba(0,212,255,.18),0 0 38px rgba(0,212,255,.65),0 6px 20px rgba(0,0,0,.5);}
}
.ex-btn-interact-icon{font-size:28px;line-height:1;}
.ex-btn-interact-txt{
  font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;opacity:.7;
}

/* ── ACTION LABEL ABOVE INTERACT ─────────────────────────── */
#ex-btn-label{
  position:absolute;bottom:132px;right:16px;
  background:rgba(2,6,16,.95);
  border:1px solid rgba(0,212,255,.55);
  color:#00d4ff;font-family:'Barlow Condensed',sans-serif;
  font-size:12px;font-weight:700;letter-spacing:.1em;
  padding:5px 13px;border-radius:20px;z-index:22;
  pointer-events:none;white-space:nowrap;text-align:center;
  opacity:0;transform:translateY(4px);
  transition:opacity .2s,transform .2s;
  box-shadow:0 0 16px rgba(0,212,255,.25);
}
#ex-btn-label.show{opacity:1;transform:translateY(0);}

/* ── JUMP BUTTON ─────────────────────────────────────────── */
.ex-btn-jump{
  position:absolute;bottom:42px;right:118px;
  width:58px;height:58px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,rgba(30,30,60,.9),rgba(10,10,30,.95));
  border:2px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.55);
  font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  z-index:20;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none;
  box-shadow:0 4px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07);
  transition:all .15s;
}
.ex-btn-jump:active{transform:scale(.9);border-color:rgba(255,255,255,.3);}

/* ── ALWAYS-VISIBLE MENU BUTTON (mobile) ─────────────────── */
.ex-menu-fab{
  position:absolute;top:64px;right:12px;
  width:42px;height:42px;border-radius:12px;
  background:linear-gradient(135deg,rgba(0,212,255,.12),rgba(0,100,180,.08));
  border:1px solid rgba(0,212,255,.32);
  color:#00d4ff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  z-index:20;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  box-shadow:0 0 14px rgba(0,212,255,.12),0 4px 12px rgba(0,0,0,.45);
  transition:all .18s;
}
.ex-menu-fab:active{transform:scale(.88);background:rgba(0,212,255,.22);}
.ex-menu-fab-line{width:18px;height:2px;background:#00d4ff;border-radius:1px;opacity:.85;transition:opacity .2s;}
.ex-menu-fab-label{font-family:'Barlow Condensed',sans-serif;font-size:7px;font-weight:700;letter-spacing:1px;color:rgba(0,212,255,.7);}


/* ══════════════════════════════════════════════════════════════════
   OUTLET REPAIR OVERLAY — matches Electric Copy scenarios/outlet-repair.html
   ══════════════════════════════════════════════════════════════════ */
#or-overlay{
  position:absolute;inset:0;background:#1a1814;
  display:none;z-index:30;overflow:hidden;
}
#or-canvas{
  display:block;width:100%;height:100%;position:absolute;inset:0;
}
#or-hud{
  position:absolute;inset:0;pointer-events:none;z-index:10;
  font-family:'Barlow Condensed',sans-serif;
}

/* Top bar */
#or-topbar{
  position:absolute;top:0;left:0;right:0;display:flex;align-items:center;
  justify-content:space-between;padding:14px 20px;
  background:linear-gradient(to bottom,rgba(0,0,0,.7) 0%,transparent 100%);
}
.or-tb-title{
  font-size:13px;font-weight:700;letter-spacing:.15em;
  color:#00d4ff;text-transform:uppercase;
}
.or-tb-stats{display:flex;gap:16px;}
.or-tb-stat{
  display:flex;align-items:center;gap:6px;
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:6px;padding:5px 12px;font-size:16px;font-weight:700;color:#fff;
}
.or-back-btn{
  padding:6px 14px;border-radius:6px;
  background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.4);
  color:#00d4ff;font-size:12px;font-weight:700;letter-spacing:.1em;
  cursor:pointer;pointer-events:all;-webkit-tap-highlight-color:transparent;
}

/* Mission panel */
#or-mission-panel{
  position:absolute;top:60px;left:18px;
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:10px;padding:14px 18px;min-width:230px;pointer-events:none;
}
.or-mp-header{
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:#00d4ff;text-transform:uppercase;margin-bottom:10px;
}
.or-mp-task{
  display:flex;align-items:center;gap:9px;font-size:12px;
  margin-bottom:6px;color:rgba(255,255,255,.45);
}
.or-mp-task.active{color:#fff;}
.or-mp-task.done{color:#22c55e;text-decoration:line-through;}
.or-mp-dot{
  width:9px;height:9px;border-radius:50%;
  border:2px solid currentColor;flex-shrink:0;
}
.or-mp-task.done  .or-mp-dot{background:#22c55e;border-color:#22c55e;}
.or-mp-task.active .or-mp-dot{background:#00d4ff;border-color:#00d4ff;animation:or-pulse 1s infinite;}
@keyframes or-pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* Progress panel */
#or-progress-wrap{
  position:absolute;top:60px;right:18px;
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:10px;padding:12px 16px;min-width:130px;
}
.or-pw-label{font-size:10px;font-weight:700;letter-spacing:.12em;color:#00d4ff;text-transform:uppercase;margin-bottom:8px;}
.or-pw-bar-bg{height:6px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;}
.or-pw-bar{height:100%;background:#00d4ff;border-radius:99px;transition:width .5s ease;width:0%;}
.or-pw-pct{font-size:22px;font-weight:900;margin-top:4px;color:#fff;}

/* Instruction bar */
#or-instruction{
  position:absolute;bottom:90px;left:50%;transform:translateX(-50%);
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:10px;padding:10px 20px;font-size:14px;font-weight:500;
  text-align:center;pointer-events:none;max-width:480px;
  transition:opacity .3s;line-height:1.6;color:#fff;
}
#or-instruction span{color:#00d4ff;}
.or-snum{
  display:inline-block;background:#00d4ff;color:#000;
  font-size:11px;font-weight:900;padding:1px 7px;
  border-radius:4px;margin-right:5px;letter-spacing:.06em;
}

/* Wire panel */
#or-wire-panel{
  position:absolute;bottom:90px;left:50%;transform:translateX(-50%);
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:14px;padding:18px 24px;display:none;pointer-events:auto;
  min-width:320px;transition:box-shadow .4s,border-color .4s;
}
#or-wire-panel.hi{
  box-shadow:0 0 28px rgba(0,212,255,.55);
  border-color:rgba(0,212,255,.85);
  animation:or-wire-glow 1.8s ease-in-out infinite;
}
@keyframes or-wire-glow{
  0%,100%{box-shadow:0 0 14px rgba(0,212,255,.35);}
  50%{box-shadow:0 0 32px rgba(0,212,255,.7);}
}
.or-wp-title{
  font-size:12px;font-weight:700;letter-spacing:.12em;color:#00d4ff;
  text-transform:uppercase;margin-bottom:14px;text-align:center;
}
.or-wire-rows{display:flex;flex-direction:column;gap:10px;}
.or-wire-row-ui{display:flex;align-items:center;gap:10px;}
.or-wire-draggable{
  padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;
  cursor:grab;color:#fff;user-select:none;transition:all .2s;
  border:1.5px solid rgba(255,255,255,.2);min-width:80px;text-align:center;
}
.or-wire-draggable:hover{transform:scale(1.05);box-shadow:0 0 10px rgba(255,255,255,.2);}
.or-wire-draggable.used{opacity:.3;pointer-events:none;}
.or-wire-line-ui{flex:1;height:3px;border-radius:2px;}
.or-wire-term{
  width:44px;height:30px;border-radius:6px;border:2px dashed;
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;cursor:pointer;transition:all .25s;
}
.or-wire-term.connected{border-style:solid;}
.or-wire-term.reject{animation:or-shake .3s;}
@keyframes or-shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}

/* Toolbar */
#or-toolbar{
  position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
  display:flex;gap:8px;background:rgba(0,0,0,.7);
  border:1px solid rgba(255,255,255,.1);border-radius:12px;
  padding:8px;pointer-events:auto;
}
.or-tool-slot{
  width:56px;height:56px;border-radius:8px;
  background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  cursor:pointer;transition:all .2s;font-size:22px;gap:2px;
}
.or-tool-slot:hover{border-color:#00d4ff;background:rgba(0,212,255,.1);}
.or-tool-slot.active{border-color:#00d4ff;background:rgba(0,212,255,.18);box-shadow:0 0 12px rgba(0,212,255,.3);}
.or-tool-slot.disabled{opacity:.25;pointer-events:none;}
.or-tool-name{font-size:9px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.6);}
.or-tool-slot.active .or-tool-name{color:#00d4ff;}

/* Toast */
#or-toast{
  position:absolute;top:60px;left:50%;transform:translateX(-50%);
  padding:9px 20px;border-radius:30px;font-size:13px;font-weight:600;
  opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;color:#fff;
}
#or-toast.show{opacity:1;}
#or-toast.ok{background:rgba(34,197,94,.2);border:1px solid #22c55e;color:#22c55e;}
#or-toast.err{background:rgba(239,68,68,.18);border:1px solid #ef4444;color:#ef4444;}
#or-toast.info{background:rgba(59,130,246,.2);border:1px solid #3b82f6;color:#3b82f6;}

/* Camera hint */
#or-cam-hint{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  background:rgba(0,0,0,.6);border:1px solid #00d4ff;border-radius:8px;
  padding:8px 16px;font-size:14px;color:#00d4ff;opacity:0;
  transition:opacity .4s;pointer-events:none;letter-spacing:.05em;
}
#or-cam-hint.show{opacity:1;}

/* Tutorial ring */
#or-tgt-ring{
  position:absolute;pointer-events:none;z-index:25;
  width:72px;height:72px;border-radius:50%;
  border:3px solid #00d4ff;transform:translate(-50%,-50%);
  display:none;box-shadow:0 0 18px rgba(0,212,255,.55);
}
#or-tgt-pulse{
  position:absolute;pointer-events:none;z-index:24;
  width:72px;height:72px;border-radius:50%;
  border:2px solid rgba(0,212,255,.55);
  transform:translate(-50%,-50%);
  animation:or-ring-pulse 1.3s ease-out infinite;display:none;
}
@keyframes or-ring-pulse{
  0%{transform:translate(-50%,-50%) scale(1);opacity:.85;}
  100%{transform:translate(-50%,-50%) scale(2.1);opacity:0;}
}
#or-tgt-label{
  position:absolute;pointer-events:none;z-index:26;
  background:rgba(0,0,0,.82);border:1px solid #00d4ff;color:#00d4ff;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  padding:3px 11px;border-radius:4px;
  transform:translateX(-50%);display:none;white-space:nowrap;
  animation:or-tap-bounce .7s ease-in-out infinite alternate;
}
@keyframes or-tap-bounce{from{transform:translateX(-50%) translateY(0);}to{transform:translateX(-50%) translateY(8px);}}
#or-breaker-tip{
  position:absolute;pointer-events:none;z-index:27;
  background:rgba(0,0,0,.8);border:1px solid rgba(0,212,255,.5);
  color:rgba(255,255,255,.9);font-size:10px;font-weight:700;
  letter-spacing:.1em;padding:4px 10px;border-radius:5px;
  transform:translateX(-50%);display:none;white-space:nowrap;
}

/* Multimeter reading */
#or-reading{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  background:rgba(5,20,10,.95);border:2px solid #22c55e;border-radius:14px;
  padding:22px 36px;text-align:center;display:none;z-index:30;
  pointer-events:none;min-width:200px;
}
#or-reading.show{display:block;}
.or-rd-label{font-size:10px;letter-spacing:.2em;color:rgba(255,255,255,.45);text-transform:uppercase;margin-bottom:10px;}
.or-rd-val{font-size:58px;font-weight:900;color:#22c55e;line-height:1;font-variant-numeric:tabular-nums;}
.or-rd-unit{font-size:18px;color:rgba(255,255,255,.5);margin-top:6px;}

/* Success overlay */
#or-success-overlay{
  position:absolute;inset:0;background:rgba(0,0,0,.75);
  display:none;align-items:center;justify-content:center;
  flex-direction:column;gap:16px;pointer-events:auto;z-index:35;
}
#or-success-overlay.show{display:flex;}
.or-so-big{font-size:80px;font-weight:900;color:#22c55e;line-height:1;}
.or-so-sub{font-size:16px;color:rgba(255,255,255,.7);}
.or-so-score{font-size:26px;font-weight:700;color:#00d4ff;}
.or-so-btn{
  margin-top:10px;padding:12px 32px;border-radius:8px;
  background:#00d4ff;color:#000;font-size:18px;font-weight:900;
  letter-spacing:.08em;border:none;cursor:pointer;transition:transform .15s;
}
.or-so-btn:hover{transform:scale(1.04);}
#or-socket-label{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.05em;}

/* ══════════════════════════════════════════════════════════════════
   SWITCH INSTALL OVERLAY
   ══════════════════════════════════════════════════════════════════ */
#sw-overlay{position:absolute;inset:0;background:#080a0d;display:none;z-index:30;overflow:hidden;}
#sw-canvas{display:block;width:100%;height:100%;position:absolute;inset:0;}
#sw-hud{position:absolute;inset:0;pointer-events:none;z-index:10;font-family:'Barlow Condensed',sans-serif;}
#sw-topbar{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:linear-gradient(to bottom,rgba(0,0,0,.7) 0%,transparent 100%);}
#sw-mission-panel{position:absolute;top:60px;left:18px;background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:14px 18px;min-width:230px;pointer-events:none;}
#sw-progress-wrap{position:absolute;top:60px;right:18px;background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:12px 16px;min-width:130px;}
#sw-instruction{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:10px 20px;font-size:14px;font-weight:500;text-align:center;pointer-events:none;max-width:480px;transition:opacity .3s;line-height:1.6;color:#fff;}
#sw-instruction span{color:#00d4ff;}
.sw-snum{display:inline-block;background:#00d4ff;color:#000;font-size:11px;font-weight:900;padding:1px 7px;border-radius:4px;margin-right:5px;letter-spacing:.06em;}
#sw-wire-panel{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.5);border-radius:14px;padding:18px 24px;display:none;pointer-events:auto;min-width:320px;box-shadow:0 0 28px rgba(0,212,255,.3);}
.sw-wire-term{width:44px;height:30px;border-radius:6px;border:2px dashed;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;transition:all .25s;}
.sw-wire-term.reject{animation:or-shake .3s;}
.sw-used{opacity:.3!important;pointer-events:none!important;}
#sw-flip-ui{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:12px;pointer-events:auto;}
.sw-flip-btn{padding:14px 40px;border-radius:8px;background:#00d4ff;color:#000;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:.08em;border:none;cursor:pointer;transition:transform .15s,box-shadow .15s;}
.sw-flip-btn:hover{transform:scale(1.04);box-shadow:0 0 20px rgba(0,212,255,.5);}
#sw-toolbar{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;background:rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px;pointer-events:auto;}
#sw-toast{position:absolute;top:60px;left:50%;transform:translateX(-50%);padding:9px 20px;border-radius:30px;font-size:13px;font-weight:600;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;color:#fff;}
#sw-toast.show{opacity:1;}
#sw-toast.ok{background:rgba(34,197,94,.2);border:1px solid #22c55e;color:#22c55e;}
#sw-toast.err{background:rgba(239,68,68,.18);border:1px solid #ef4444;color:#ef4444;}
#sw-toast.info{background:rgba(59,130,246,.2);border:1px solid #3b82f6;color:#3b82f6;}
#sw-cam-hint{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.6);border:1px solid #00d4ff;border-radius:8px;padding:8px 16px;font-size:14px;color:#00d4ff;opacity:0;transition:opacity .4s;pointer-events:none;letter-spacing:.05em;}
#sw-cam-hint.show{opacity:1;}
#sw-tgt-ring{position:absolute;pointer-events:none;z-index:25;width:72px;height:72px;border-radius:50%;border:3px solid #00d4ff;transform:translate(-50%,-50%);display:none;box-shadow:0 0 18px rgba(0,212,255,.55);}
#sw-tgt-pulse{position:absolute;pointer-events:none;z-index:24;width:72px;height:72px;border-radius:50%;border:2px solid rgba(0,212,255,.55);transform:translate(-50%,-50%);animation:or-ring-pulse 1.3s ease-out infinite;display:none;}
#sw-tgt-label{position:absolute;pointer-events:none;z-index:26;background:rgba(0,0,0,.82);border:1px solid #00d4ff;color:#00d4ff;font-size:11px;font-weight:700;letter-spacing:.12em;padding:3px 11px;border-radius:4px;transform:translateX(-50%);display:none;white-space:nowrap;animation:or-tap-bounce .7s ease-in-out infinite alternate;}
#sw-reading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(5,20,10,.95);border:2px solid #22c55e;border-radius:14px;padding:22px 36px;text-align:center;display:none;z-index:30;pointer-events:none;min-width:200px;}
#sw-reading.show{display:block;}
#sw-success-overlay{position:absolute;inset:0;background:rgba(0,0,0,.75);display:none;align-items:center;justify-content:center;flex-direction:column;gap:16px;pointer-events:auto;z-index:35;}
#sw-success-overlay.show{display:flex;}
#sw-light-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 65% 35%,rgba(255,240,100,.18) 0%,transparent 70%);opacity:0;transition:opacity 1.2s ease;z-index:5;}
#sw-light-glow.on{opacity:1;}

/* ── STAGE COMPLETE OVERLAY ────────────────────────────────────────── */
#ex-stage-complete{
  position:absolute;inset:0;background:rgba(0,2,10,.88);
  display:none;align-items:center;justify-content:center;
  flex-direction:column;z-index:50;pointer-events:auto;
}
#ex-stage-complete.show{display:flex;}
.ex-sc-inner{text-align:center;animation:ex-sc-in .6s ease-out;}
@keyframes ex-sc-in{from{transform:scale(.82);opacity:0;}to{transform:scale(1);opacity:1;}}
.ex-sc-bolt{font-size:72px;margin-bottom:8px;filter:drop-shadow(0 0 24px #00d4ff);}
.ex-sc-title{font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:900;
  color:#00d4ff;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;
  text-shadow:0 0 32px rgba(0,212,255,.6);}
.ex-sc-sub{font-family:'Barlow Condensed',sans-serif;font-size:18px;color:rgba(255,255,255,.65);margin-bottom:14px;}
.ex-sc-score{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;
  color:#00d4ff;margin-bottom:28px;border:1px solid rgba(0,212,255,.3);
  padding:8px 24px;border-radius:8px;background:rgba(0,212,255,.06);}
.ex-sc-btn{padding:14px 52px;border-radius:8px;background:#00d4ff;color:#000;
  font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;
  letter-spacing:.1em;border:none;cursor:pointer;transition:transform .15s,box-shadow .15s;
  box-shadow:0 0 24px rgba(0,212,255,.4);}
.ex-sc-btn:hover{transform:scale(1.04);box-shadow:0 0 36px rgba(0,212,255,.65);}
`;

function injectCSS() {
  if (document.querySelector('#ex-css')) return;
  const s = document.createElement('style');
  s.id = 'ex-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export class ExploreScreen {
  constructor(state) {
    this.state = state;
    this._scene = null;
    this.container = this._build();
  }

  _build() {
    injectCSS();
    const isMobile = navigator.maxTouchPoints > 0;
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="ex-wrap">
        <canvas id="ex-canvas"></canvas>

        <!-- HUD -->
        <div class="ex-hud">
          <button class="ex-hud-back">← MENU</button>
          <span class="ex-hud-room" id="ex-room">ENTRANCE</span>
          <div class="ex-hud-score-wrap">
            <span class="ex-hud-score" id="ex-score">0/8</span>
          </div>
        </div>

        <!-- Minimap -->
        <canvas id="ex-minimap" width="110" height="110"></canvas>

        <!-- Prompt -->
        <div id="ex-prompt">🔧 FIX [E]</div>

        <!-- Notify log -->
        <div id="ex-notify"></div>

        <!-- Crosshair (desktop) -->
        ${!isMobile ? '<div id="ex-crosshair"></div>' : ''}

        <!-- Desktop hint -->
        ${!isMobile ? '<div id="ex-ptr-msg">CLICK TO LOOK · WASD MOVE · E INTERACT</div>' : ''}


        <!-- Mobile controls -->
        ${isMobile ? `
          <div class="ex-look-zone" id="ex-look-zone"></div>
          <div class="ex-joy-outer" id="ex-joy-outer">
            <div class="ex-joy-arrows"></div>
            <div class="ex-joy-inner" id="ex-joy-inner"></div>
          </div>
          <div id="ex-btn-label"></div>
          <div class="ex-btn-interact" id="ex-btn-interact">
            <div class="ex-btn-interact-icon">⚡</div>
            <div class="ex-btn-interact-txt">ACT</div>
          </div>
          <div class="ex-btn-jump" id="ex-btn-jump">▲</div>
          <div class="ex-menu-fab" id="ex-mob-menu">
            <div class="ex-menu-fab-line"></div>
            <div class="ex-menu-fab-line"></div>
            <div class="ex-menu-fab-line"></div>
          </div>
        ` : ''}

        <!-- ═══════ OUTLET REPAIR OVERLAY ═══════ -->
        <div id="or-overlay">
          <!-- 3D canvas (own renderer) -->
          <canvas id="or-canvas"></canvas>

          <!-- HUD layer -->
          <div id="or-hud">
            <!-- Top bar -->
            <div id="or-topbar">
              <div class="or-tb-title">⚡ Outlet Repair</div>
              <div class="or-tb-stats">
                <div class="or-tb-stat"><span>⏱</span><span id="or-timer">05:00</span></div>
              </div>
              <button class="or-back-btn" id="or-back-btn">✕ CANCEL</button>
            </div>

            <!-- Mission panel -->
            <div id="or-mission-panel">
              <div class="or-mp-header">🔧 Broken Electrical Outlet</div>
              <div class="or-mp-task active" id="or-t1"><div class="or-mp-dot"></div>Turn OFF breaker</div>
              <div class="or-mp-task" id="or-t2"><div class="or-mp-dot"></div>Remove cover screw</div>
              <div class="or-mp-task" id="or-t3"><div class="or-mp-dot"></div>Open outlet cover</div>
              <div class="or-mp-task" id="or-t4"><div class="or-mp-dot"></div>Inspect wires</div>
              <div class="or-mp-task" id="or-t5"><div class="or-mp-dot"></div>Reconnect wires</div>
              <div class="or-mp-task" id="or-t6"><div class="or-mp-dot"></div>Close outlet</div>
              <div class="or-mp-task" id="or-t7"><div class="or-mp-dot"></div>Turn ON breaker</div>
              <div class="or-mp-task" id="or-t8"><div class="or-mp-dot"></div>Test with multimeter</div>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;color:rgba(255,255,255,.4)">
                Steps: <span id="or-done-count">0</span>/8
              </div>
              <div id="or-socket-label" style="margin-top:4px;">Socket #1 — Lobby</div>
            </div>

            <!-- Progress panel -->
            <div id="or-progress-wrap">
              <div class="or-pw-label">Progress</div>
              <div class="or-pw-bar-bg"><div class="or-pw-bar" id="or-pw-bar"></div></div>
              <div class="or-pw-pct"><span id="or-pw-pct">0</span>%</div>
            </div>

            <!-- Instruction bar -->
            <div id="or-instruction">
              <span class="or-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>
            </div>

            <!-- Wire panel -->
            <div id="or-wire-panel">
              <div class="or-wp-title">Connect Wires — PH Type A (Red=Live, Black=Neutral)</div>
              <div class="or-wire-rows">
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="or-wd-red"
                       style="background:#7f1d1d;border-color:#dc2626" draggable="true">RED (Live)</div>
                  <div class="or-wire-line-ui" style="background:#dc2626;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">Live</div>
                  <div class="or-wire-term" id="or-wt-red"
                       style="border-color:#dc2626;color:#dc2626" draggable="false">L</div>
                </div>
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="or-wd-black"
                       style="background:#1c1c1c;border-color:#666" draggable="true">BLACK (Neutral)</div>
                  <div class="or-wire-line-ui" style="background:#666;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">Neutral</div>
                  <div class="or-wire-term" id="or-wt-black"
                       style="border-color:#666;color:#aaa" draggable="false">N</div>
                </div>
              </div>
            </div>

            <!-- Toolbar -->
            <div id="or-toolbar">
              <div class="or-tool-slot disabled" id="or-tool-screwdriver">🔧<div class="or-tool-name">SCREWDRIVER</div></div>
              <div class="or-tool-slot disabled" id="or-tool-pliers">🔩<div class="or-tool-name">PLIERS</div></div>
              <div class="or-tool-slot disabled" id="or-tool-multimeter">📊<div class="or-tool-name">MULTIMETER</div></div>
            </div>

            <!-- Toast & cam hint -->
            <div id="or-toast"></div>
            <div id="or-cam-hint"></div>

            <!-- Tutorial ring -->
            <div id="or-tgt-ring"></div>
            <div id="or-tgt-pulse"></div>
            <div id="or-tgt-label">TAP HERE</div>
            <div id="or-breaker-tip"></div>

            <!-- Voltage reading -->
            <div id="or-reading">
              <div class="or-rd-label">Voltage Reading</div>
              <div class="or-rd-val" id="or-rd-val">---</div>
              <div class="or-rd-unit">Volts AC</div>
            </div>

            <!-- Success overlay -->
            <div id="or-success-overlay">
              <div class="or-so-big">✓ FIXED!</div>
              <div class="or-so-sub">Outlet repaired and tested successfully.</div>
              <div class="or-so-score" id="or-so-score">Score: 0 pts</div>
              <button class="or-so-btn" id="or-replay-btn">PLAY AGAIN</button>
            </div>
          </div>
        </div>

        <!-- ═══════ BREAKER REPAIR OVERLAY ═══════ -->
        <div id="brk-overlay" style="
          display:none;position:absolute;inset:0;background:rgba(0,0,0,.85);
          z-index:40;align-items:center;justify-content:center;flex-direction:column;gap:18px;
          font-family:'Barlow Condensed',sans-serif;
        ">
          <div style="font-size:36px;">⚡</div>
          <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:.12em;">TRIPPED BREAKER</div>
          <div style="font-size:13px;color:rgba(255,255,255,.55);text-align:center;max-width:280px;line-height:1.6;">
            Breaker #3 has tripped. Tap it to reset and restore power.
          </div>
          <div id="brk-panel" style="
            display:grid;grid-template-columns:1fr 1fr;gap:10px;
            background:rgba(10,20,40,.95);border:1px solid rgba(0,212,255,.3);
            border-radius:14px;padding:20px 24px;
          ">
            ${[...Array(8)].map((_, i) => i === 2
              ? `<div id="brk-tripped" style="
                  width:72px;height:44px;border-radius:8px;
                  background:#ef4444;border:2px solid #ff6666;
                  display:flex;align-items:center;justify-content:center;
                  font-size:11px;font-weight:800;color:#fff;letter-spacing:.08em;
                  cursor:pointer;box-shadow:0 0 18px rgba(255,50,50,.6);
                  animation:brkPulse 1s infinite;
                ">TRIP #3</div>`
              : `<div style="
                  width:72px;height:44px;border-radius:8px;
                  background:${i < 6 ? '#22c55e' : 'rgba(255,255,255,.1)'};
                  border:1px solid rgba(255,255,255,.15);
                  display:flex;align-items:center;justify-content:center;
                  font-size:10px;color:rgba(255,255,255,.4);
                ">#${i+1}</div>`
            ).join('')}
          </div>
          <style>@keyframes brkPulse{0%,100%{box-shadow:0 0 12px rgba(255,50,50,.5);}50%{box-shadow:0 0 28px rgba(255,50,50,.9);}}</style>
          <button id="brk-cancel" style="
            padding:8px 24px;border-radius:8px;background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.45);
            font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;
            letter-spacing:.1em;cursor:pointer;
          ">✕ CANCEL</button>
        </div>

        <!-- ═══════ STAGE COMPLETE OVERLAY ═══════ -->
        <div id="ex-stage-complete">
          <div class="ex-sc-inner">
            <div class="ex-sc-bolt">⚡</div>
            <div class="ex-sc-title">STAGE COMPLETE</div>
            <div class="ex-sc-sub">All electrical systems repaired!</div>
            <div class="ex-sc-score" id="ex-sc-score">8/8 Objectives</div>
            <button class="ex-sc-btn" id="ex-sc-btn">CONTINUE →</button>
          </div>
        </div>

        <!-- ═══════ SWITCH INSTALL OVERLAY ═══════ -->
        <div id="sw-overlay">
          <canvas id="sw-canvas"></canvas>
          <div id="sw-hud">
            <div id="sw-topbar">
              <div class="or-tb-title">💡 Switch Install</div>
              <div class="or-tb-stats">
                <div class="or-tb-stat"><span>⏱</span><span id="sw-timer">08:00</span></div>
              </div>
              <button class="or-back-btn" id="sw-back-btn">✕ CANCEL</button>
            </div>
            <div id="sw-mission-panel">
              <div class="or-mp-header">🔌 Light Switch Install — PH Standard</div>
              <div class="or-mp-task active" id="sw-s1"><div class="or-mp-dot"></div>Turn OFF breaker</div>
              <div class="or-mp-task" id="sw-s2"><div class="or-mp-dot"></div>Mount switch to wall box</div>
              <div class="or-mp-task" id="sw-s3"><div class="or-mp-dot"></div>Connect RED wire (COM/Live)</div>
              <div class="or-mp-task" id="sw-s4"><div class="or-mp-dot"></div>Connect BLACK wire (L1/Output)</div>
              <div class="or-mp-task" id="sw-s5"><div class="or-mp-dot"></div>Secure all terminals</div>
              <div class="or-mp-task" id="sw-s6"><div class="or-mp-dot"></div>Turn ON breaker</div>
              <div class="or-mp-task" id="sw-s7"><div class="or-mp-dot"></div>Flip switch</div>
              <div class="or-mp-task" id="sw-s8"><div class="or-mp-dot"></div>Test with multimeter</div>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;color:rgba(255,255,255,.4)">
                Steps: <span id="sw-done-count">0</span>/8
              </div>
              <div id="sw-label" style="margin-top:4px;font-size:11px;color:rgba(255,255,255,.4);"></div>
            </div>
            <div id="sw-progress-wrap">
              <div class="or-pw-label">Progress</div>
              <div class="or-pw-bar-bg"><div class="or-pw-bar" id="sw-pw-bar"></div></div>
              <div class="or-pw-pct"><span id="sw-pw-pct">0</span>%</div>
            </div>
            <div id="sw-instruction">
              <span class="sw-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>
            </div>
            <div id="sw-wire-panel">
              <div class="or-wp-title">Connect Wires — PH Switch (Red=COM, Black=L1)</div>
              <div class="or-wire-rows">
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="sw-wd-red"
                       style="background:#7f1d1d;border-color:#dc2626" draggable="true">RED (COM/Live)</div>
                  <div class="or-wire-line-ui" style="background:#dc2626;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">COM</div>
                  <div class="sw-wire-term" id="sw-wt-red"
                       style="border-color:#dc2626;color:#dc2626" draggable="false">COM</div>
                </div>
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="sw-wd-black"
                       style="background:#1c1c1c;border-color:#666" draggable="true">BLACK (L1/Output)</div>
                  <div class="or-wire-line-ui" style="background:#666;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">L1</div>
                  <div class="sw-wire-term" id="sw-wt-black"
                       style="border-color:#666;color:#aaa" draggable="false">L1</div>
                </div>
              </div>
            </div>
            <div id="sw-flip-ui">
              <div style="font-size:13px;font-weight:600;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase">Flip the switch to test</div>
              <button class="sw-flip-btn" id="sw-flip-btn">⬆ FLIP SWITCH</button>
            </div>
            <div id="sw-toolbar">
              <div class="or-tool-slot disabled" id="sw-tool-mount">📐<div class="or-tool-name">MOUNT</div></div>
              <div class="or-tool-slot disabled" id="sw-tool-pliers">🔩<div class="or-tool-name">PLIERS</div></div>
              <div class="or-tool-slot disabled" id="sw-tool-multimeter">📊<div class="or-tool-name">METER</div></div>
            </div>
            <div id="sw-toast"></div>
            <div id="sw-cam-hint"></div>
            <div id="sw-tgt-ring"></div>
            <div id="sw-tgt-pulse"></div>
            <div id="sw-tgt-label">TAP HERE</div>
            <div id="sw-reading">
              <div class="or-rd-label">Voltage Reading</div>
              <div class="or-rd-val" id="sw-rd-val">---</div>
              <div class="or-rd-unit">Volts AC</div>
            </div>
            <div id="sw-success-overlay">
              <div class="or-so-big">✓ WIRED!</div>
              <div class="or-so-sub">Switch installed and light verified.</div>
              <div class="or-so-score" id="sw-so-score">Score: 0 pts</div>
              <button class="or-so-btn" id="sw-replay-btn">PLAY AGAIN</button>
            </div>
            <div id="sw-light-glow"></div>
          </div>
        </div>

      </div>`;

    // World back button
    el.querySelector('.ex-hud-back').addEventListener('click', () => {
      this._scene?.destroy();
      this._scene = null;
      this.state.setState('stagesHub');
    });

    // Mobile FAB menu button
    const mobMenu = el.querySelector('#ex-mob-menu');
    if (mobMenu) {
      mobMenu.addEventListener('touchstart', e => {
        e.preventDefault();
        this._scene?.destroy();
        this._scene = null;
        this.state.setState('stagesHub');
      }, { passive: false });
    }

    // Outlet overlay cancel button
    el.querySelector('#or-back-btn').addEventListener('click', () => {
      this._scene?.closeRepair();
    });

    // Switch overlay cancel button
    el.querySelector('#sw-back-btn').addEventListener('click', () => {
      this._scene?.closeRepair();
    });

    // Stage complete continue button
    el.querySelector('#ex-sc-btn').addEventListener('click', () => {
      this._scene?.destroy();
      this._scene = null;
      this._guide?.destroy();
      this._guide = null;
      this.state.setState('stagesHub');
    });

    // Breaker cancel
    el.querySelector('#brk-cancel').addEventListener('click', () => {
      el.querySelector('#brk-overlay').style.display = 'none';
      this._scene && (this._scene._repairOpen = false);
    });

    this._el = el;
    return el;
  }

  onShow() {
    if (!this._scene) {
      const wrap = this._el.querySelector('.ex-wrap');
      this._guide = new MascotGuide(wrap);
      this._scene = new ExploreScene(this.state, wrap, this._guide);
      this._guide.showTutorial();
    }
  }

  onHide() {
    this._scene?.destroy();
    this._scene = null;
    this._guide?.destroy();
    this._guide = null;
  }
}

import * as THREE from 'three';
import { buildWorkbench, buildLightingRig } from './WorkbenchBuilder.js';
import { Database } from '../systems/Database.js';

// ══════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════

const CWISE = [
  { id:'red',   col:0xcc2222, hex:'#cc2222', lbl:'RED',   role:'HOT',     z:-1.0 },
  { id:'white', col:0xd8d8d8, hex:'#d8d8d8', lbl:'WHITE', role:'NEUTRAL', z: 0.0 },
  { id:'green', col:0x1a9e44, hex:'#1a9e44', lbl:'GREEN', role:'GROUND',  z: 1.0 },
];

const WTD = [
  { id:'THHN', col:0x1a1a2e, hex:'#1a1a2e', lbl:'THHN',  tag:'Inside conduit · 90°C',    r:0.12, shape:'round'   },
  { id:'NMB',  col:0xa0a0a0, hex:'#a0a0a0', lbl:'NM-B',  tag:'Dry indoor walls only',    r:0.18, shape:'flat'    },
  { id:'TW',   col:0x2255bb, hex:'#2255bb', lbl:'TW',    tag:'Older buildings · 60°C',   r:0.12, shape:'round'   },
  { id:'BX',   col:0x888880, hex:'#888880', lbl:'BX',    tag:'Exposed areas · Armored',  r:0.15, shape:'armored' },
  { id:'UFB',  col:0x4d7040, hex:'#4d7040', lbl:'UF-B',  tag:'Direct burial only',       r:0.22, shape:'thick'   },
];

const QQS = [
  { q:"What type of wire is this? It has a spiral metal armor around it.",
    vis:'bx',    opts:['THHN','UF-B','BX Armored','Romex (NM-B)'],  ans:2,
    hint:"The spiral metal armor is the signature of BX cable — designed to protect against physical damage." },
  { q:"What does a RED wire mean?",
    vis:'red',   opts:['Ground — safety wire','Neutral — return path','Hot — 220V live electricity','Depends on country'], ans:2,
    hint:"Red = HOT. 220 volts. Always treat a red wire as live even when you think the power is off." },
  { q:"Power needs to run buried underground from the house to a garden lamp. Which wire?",
    vis:'ufb',   opts:['THHN','Romex (NM-B)','TW wire','UF-B'], ans:3,
    hint:"Only UF-B is rated for direct burial. Soil and moisture would destroy the others." },
  { q:"Your air conditioner needs 20 amps. Which wire do you choose?",
    vis:'awg',   opts:['AWG 14 — thinner (15A max)','AWG 12 — thicker (20A max)'], ans:1,
    hint:"AWG 12 handles 20 amps. AWG 14 only handles 15. Wrong choice means overheating and risk of fire." },
  { q:"Someone is about to touch a white neutral wire without testing it. Is this safe?",
    vis:'white', opts:['Yes — white is neutral so it is safe','No — always test any wire before touching'], ans:1,
    hint:"Neutral wires can carry fault current during electrical faults. Always test any wire before touching." },
];

// ══════════════════════════════════════════════════════════════════
// STEPS  (flat array — index = step number)
// ══════════════════════════════════════════════════════════════════

const STEPS = [
  /* 0-1  Opening */
  { t:'info',  ch:0, chLbl:'WIRE TYPES',      cam:{p:[4,3,8],   t:[0,0,0]},     scene:'empty',        mascotIn:true,
    text:"Before you touch a single wire in real life — you need to know what you are looking at. Because not all wires are the same. Pick the wrong one and at best the job fails. At worst someone gets hurt.", btn:'NEXT' },
  { t:'info',  ch:0, chLbl:'WIRE TYPES',      cam:{p:[4,3,8],   t:[0,0,0]},     scene:'empty',
    text:"I am going to show you five wires today. By the end you will know what each one is, where it goes, and why it exists. Ready?", btn:"LET'S GO" },

  /* 2-8  Chapter 1 — Anatomy */
  { t:'info',  ch:1, chLbl:'CH.1 WIRE ANATOMY', cam:{p:[0,2.5,5.5],t:[0,-0.1,0]}, scene:'wire_drop',
    text:"Let us start here. This is a wire. Looks simple. But it is actually three things built on top of each other.", btn:'NEXT' },
  { t:'cross', ch:1, chLbl:'CH.1 WIRE ANATOMY', cam:{p:[0,2,4.5], t:[0,-0.1,0]}, scene:'cross_section', layer:-1,
    text:"The wire slices open — like cutting through a sausage. Three layers. Each one has a completely different job.", btn:'NEXT' },
  { t:'cross', ch:1, chLbl:'CH.1 WIRE ANATOMY', cam:{p:[0,2,4.5], t:[0,-0.1,0]}, scene:'cross_section', layer:0,
    layerName:'COPPER', layerHex:'#b87333',
    text:"COPPER — the center. This is what carries electricity. Copper conducts current better than almost any other affordable metal. Without this, nothing works.", btn:'NEXT' },
  { t:'cross', ch:1, chLbl:'CH.1 WIRE ANATOMY', cam:{p:[0,2,4.5], t:[0,-0.1,0]}, scene:'cross_section', layer:1,
    layerName:'INSULATION', layerHex:'#3355cc',
    text:"INSULATION — wrapped around the copper. Plastic. Its job is to stop electricity from escaping. Two bare copper wires touching causes a short circuit. The insulation stops that.", btn:'NEXT' },
  { t:'cross', ch:1, chLbl:'CH.1 WIRE ANATOMY', cam:{p:[0,2,4.5], t:[0,-0.1,0]}, scene:'cross_section', layer:2,
    layerName:'JACKET', layerHex:'#666666',
    text:"JACKET — the outer layer. Tougher plastic. Protects everything inside from physical damage — scraping, bending, heat, moisture.", btn:'NEXT' },
  { t:'info',  ch:1, chLbl:'CH.1 WIRE ANATOMY', cam:{p:[0,2.5,5.5],t:[0,-0.1,0]}, scene:'wire_single',
    text:"Copper carries. Insulation contains. Jacket protects. Every wire you ever see is built this way.", btn:'NEXT CHAPTER' },

  /* 8-14  Chapter 2 — Colors */
  { t:'info',  ch:2, chLbl:'CH.2 WIRE COLORS', cam:{p:[0,3.5,7.5],t:[0,-0.4,0]}, scene:'color_wires',
    text:"Before we look at the five wire types — I need to teach you something that could save your life. The color of a wire is a message. It tells every electrician what that wire is doing. Get this wrong and you are in serious danger.", btn:'NEXT' },
  { t:'color', ch:2, chLbl:'CH.2 WIRE COLORS', cam:{p:[-1.5,1.5,3.5],t:[-1,-0.2,0]}, scene:'color_wires', focus:'red',
    text:"RED means HOT. This wire carries live electricity — 220 volts. If you touch this wire while power is on, you will get a shock that can stop your heart. Every electrician treats a red wire as live. Even when they think the power is off.", btn:'NEXT' },
  { t:'color', ch:2, chLbl:'CH.2 WIRE COLORS', cam:{p:[0,1.5,3.5],  t:[0,-0.2,0]},  scene:'color_wires', focus:'white',
    text:"WHITE means NEUTRAL. This wire is the return path. Electricity goes out on the red wire and comes back home on the white wire. Less dangerous than red — but not safe to touch either. During a fault it can carry current too.", btn:'NEXT' },
  { t:'color', ch:2, chLbl:'CH.2 WIRE COLORS', cam:{p:[1.5,1.5,3.5], t:[1,-0.2,0]},  scene:'color_wires', focus:'green',
    text:"GREEN means GROUND. This wire does not carry electricity under normal conditions. But if something goes wrong — if electricity leaks where it should not — the green wire catches it and sends it safely into the earth. It is the reason a faulty appliance trips the breaker instead of shocking you.", btn:'NEXT' },
  { t:'info',  ch:2, chLbl:'CH.2 WIRE COLORS', cam:{p:[0,3,7],t:[0,-0.3,0]}, scene:'color_wires',
    text:"Red — hot. White — neutral. Green — ground.\n\nSay that in your head twice. You will use it forever.", btn:'NEXT' },
  { t:'cquiz', ch:2, chLbl:'CH.2 WIRE COLORS', cam:{p:[0,1.4,3.2],t:[0,-0.5,0]}, scene:'color_wires',
    text:"Quick check. I will call the role — you tap the correct wire on the workbench.", btn:null },

  /* 15-26  Chapter 3 — Wire Types */
  { t:'info', ch:3, chLbl:'CH.3 WIRE TYPES', cam:{p:[0,3.5,7.5],t:[0,-0.3,0]}, scene:'wt_slots',
    text:"Now. The five wires. Each one has a specific job. A specific place where it belongs. Using the wrong wire in the wrong place is a code violation — and a safety hazard.", btn:'NEXT' },
  // THHN
  { t:'wt', ch:3, chLbl:'CH.3 — THHN', wti:0, cam:{p:[-2.5,2.2,5.5],t:[-2,-0.2,0]}, scene:'wt_show', active:0,
    text:"THHN — the most common wire in the Philippines. Any new building, any new home — this is what is running through the walls. It is the standard.", btn:'NEXT' },
  { t:'wt', ch:3, chLbl:'CH.3 — THHN', wti:0, cam:{p:[-2.5,1.8,4.2],t:[-2,-0.2,0]}, scene:'wt_show', active:0,
    text:"THHN lives inside conduit — those grey tubes running along ceilings and walls. The conduit is the road. THHN is the car inside it. Handles heat up to 90°C. Always inside conduit. That is the rule.", btn:'NEXT' },
  // NM-B
  { t:'wt', ch:3, chLbl:'CH.3 — NM-B', wti:1, cam:{p:[-1.2,2.2,5.5],t:[-1,-0.2,0]}, scene:'wt_show', active:1,
    text:"NM-B — also called Romex. Look at it — fatter than THHN. That is because it bundles three wires in one sheath — black (hot), white (neutral), and bare copper (ground). Three wires, one package.", btn:'NEXT' },
  { t:'wt', ch:3, chLbl:'CH.3 — NM-B', wti:1, cam:{p:[-1.2,1.8,4.2],t:[-1,-0.2,0]}, scene:'wt_show', active:1,
    text:"Romex is used inside walls — behind drywall, in dry indoor spaces. Much faster to run one cable than three. But never outside. Never in wet locations. Inside the wall. Dry location. That is all.", btn:'NEXT' },
  // TW
  { t:'wt', ch:3, chLbl:'CH.3 — TW',   wti:2, cam:{p:[0.2,2.2,5.5],  t:[0,-0.2,0]},  scene:'wt_show', active:2,
    text:"TW wire — the older version of what we use today. It works. But it has a lower heat rating — only 60°C instead of 90. You will see TW in homes built 20 to 30 years ago. Not bad wire. Just know its limits.", btn:'NEXT' },
  // BX
  { t:'wt', ch:3, chLbl:'CH.3 — BX',   wti:3, cam:{p:[1.2,2.2,5.5],  t:[1,-0.2,0]},  scene:'wt_show', active:3,
    text:"BX cable — Armored Cable. That spiral is real metal. It protects the wires inside from physical damage. You can step on this. Hit it with tools. It survives things that would destroy THHN or Romex.", btn:'NEXT' },
  { t:'wt', ch:3, chLbl:'CH.3 — BX',   wti:3, cam:{p:[1.2,1.8,4.2],  t:[1,-0.2,0]},  scene:'wt_show', active:3,
    text:"Use BX where the wire will be exposed — not inside walls. Workshops. Factories. Garages. The metal armor also acts as a ground path — extra safety built right in.", btn:'NEXT' },
  // UF-B
  { t:'wt', ch:3, chLbl:'CH.3 — UF-B', wti:4, cam:{p:[2.5,2.2,5.5],  t:[2,-0.2,0]},  scene:'wt_show', active:4,
    text:"UF-B — Underground Feeder Cable. Every other wire today — THHN, Romex, TW, BX — cannot be buried in the ground. Soil and moisture would destroy them. UF-B is designed specifically for direct burial with no conduit.", btn:'NEXT' },
  { t:'wt', ch:3, chLbl:'CH.3 — UF-B', wti:4, cam:{p:[2.5,1.8,4.2],  t:[2,-0.2,0]},  scene:'wt_show', active:4,
    text:"It is filled with a solid waterproof compound — water cannot penetrate it. Use it to bring power to outdoor lights, gate motors, garden sockets. Bury at least 300mm below the surface.", btn:'NEXT CHAPTER' },

  /* 27-30  Chapter 4 — Thickness */
  { t:'info',  ch:4, chLbl:'CH.4 WIRE THICKNESS', cam:{p:[0,3,6.5],t:[0,-0.3,0]}, scene:'awg_pair',
    text:"One more thing before the test. Wire thickness matters just as much as wire type. A thin wire carrying too much current is how fires start. Thickness is measured in AWG — American Wire Gauge. Bigger number = thinner wire. It is backwards. It has been this way for 100 years.", btn:'NEXT' },
  { t:'awg14', ch:4, chLbl:'CH.4 WIRE THICKNESS', cam:{p:[-1.5,1.8,4],t:[-1,-0.3,0]}, scene:'awg_pair', hl:'awg14',
    text:"AWG 14 — thinner wire — handles 15 amps. Normal wall outlets. Lights. Fans. Phone chargers. Everyday household loads.", btn:'NEXT' },
  { t:'awg12', ch:4, chLbl:'CH.4 WIRE THICKNESS', cam:{p:[1.5,1.8,4], t:[1,-0.3,0]},  scene:'awg_pair', hl:'awg12',
    text:"AWG 12 — thicker wire — handles 20 amps. Air conditioners. Kitchen appliances. Water heaters. Anything that pulls serious power.", btn:'NEXT' },
  { t:'fire',  ch:4, chLbl:'CH.4 WIRE THICKNESS', cam:{p:[0,2.5,5.5],t:[0,-0.2,0]}, scene:'awg_fire',
    text:"Match the wrong wire to the wrong load and the wire overheats. Insulation melts. Fire. Every time. Match the wire to the load. Always.", btn:'TAKE THE TEST' },

  /* 31-37  Quiz */
  { t:'qintro', ch:6, chLbl:'KNOWLEDGE CHECK', cam:{p:[0,3,7],t:[0,-0.3,0]}, scene:'bench_clean',
    text:"Five questions. One at a time. Take your time — you have learned all of this.", btn:'START' },
  ...QQS.map((_, i) => ({ t:'quiz', ch:6, chLbl:'KNOWLEDGE CHECK',
    cam:{p:[0,3,7],t:[0,-0.3,0]}, scene:'quiz', qi:i })),

  /* 38  Complete */
  { t:'done', ch:7, chLbl:'COMPLETE', cam:{p:[5,4,9],t:[0,-0.2,0]}, scene:'wt_all',
    text:"That is wire types. You now know what is inside a wire, what the colors mean, which wire goes where, and how thickness affects safety. This is the foundation. Everything else in electrical work builds on this.", btn:'FINISH' },
];

// ══════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════

const CSS = `
.wtl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

/* TOP BAR */
.wtl-top{height:48px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(0,212,255,.15);display:flex;align-items:center;padding:0 12px;gap:10px;flex-shrink:0;}
.wtl-back{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.wtl-top-center{flex:1;text-align:center;}
.wtl-ch-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#00d4ff;display:block;}
.wtl-ch-step{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

/* 3D SCENE */
.wtl-scene{height:44vh;min-height:200px;max-height:340px;position:relative;flex-shrink:0;background:#07101f;overflow:hidden;}
.wtl-canvas{display:block;}
.wtl-tap-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(0,212,255,.85);letter-spacing:2px;pointer-events:none;animation:wtlPulse 1.2s ease-in-out infinite;background:rgba(4,10,24,.75);padding:5px 14px;border-radius:20px;border:1px solid rgba(0,212,255,.3);white-space:nowrap;}
@keyframes wtlPulse{0%,100%{opacity:.45;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.03)}}

/* CROSS-SECTION OVERLAY */
.wtl-cross-overlay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(7,16,31,.92);backdrop-filter:blur(2px);}
.wtl-cross-overlay.show{display:flex;}
.wtl-cross-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;}
.wtl-cross-canvas{border-radius:50%;display:block;}
.wtl-cross-labels{display:flex;gap:18px;justify-content:center;}
.wtl-cross-tag{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:1px;padding:3px 10px;border-radius:12px;border:1px solid currentColor;transition:all .3s;}

/* FEEDBACK */
.wtl-feedback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .1s;}
.wtl-feedback.show{opacity:1;}
.wtl-fb{font-size:88px;line-height:1;animation:wtlPop .3s cubic-bezier(.34,1.56,.64,1);filter:drop-shadow(0 0 22px rgba(255,255,255,.5));}
@keyframes wtlPop{from{transform:scale(0) rotate(-15deg)}to{transform:scale(1) rotate(0)}}

/* WT BADGE */
.wtl-wt-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(4,10,24,.9);border-radius:12px;padding:6px 16px;text-align:center;display:none;animation:wtlPop .3s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(0,212,255,.25);}
.wtl-wt-badge.show{display:block;}
.wtl-wt-badge-name{font-size:18px;font-weight:900;letter-spacing:2px;color:#fff;}
.wtl-wt-badge-tag{font-family:'Share Tech Mono',monospace;font-size:9px;color:#00d4ff;letter-spacing:1px;}

/* COLOR QUIZ PROMPT */
.wtl-cquiz-prompt{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(4,10,24,.96);border-radius:16px;padding:16px 24px;text-align:center;display:none;backdrop-filter:blur(6px);border:1px solid rgba(0,212,255,.3);}
.wtl-cquiz-prompt.show{display:block;animation:wtlPop .3s cubic-bezier(.34,1.56,.64,1);}
.wtl-cquiz-role{font-size:28px;font-weight:900;letter-spacing:3px;margin-bottom:4px;}
.wtl-cquiz-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.5);letter-spacing:2px;}
.wtl-cquiz-prog{display:flex;gap:6px;justify-content:center;margin-top:10px;}
.wtl-cquiz-pip{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.15);transition:background .3s;}
.wtl-cquiz-pip.done{background:#2dc653;}
.wtl-cquiz-pip.active{background:#00d4ff;}

/* DIALOG AREA */
.wtl-dialog{flex:1;display:flex;flex-direction:column;padding:8px 12px;gap:6px;overflow:hidden;min-height:0;}
.wtl-bubble{background:rgba(8,18,42,.98);border:1px solid rgba(0,212,255,.18);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;flex:1;overflow:hidden;}
.wtl-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,212,255,.35);flex-shrink:0;
  transform:translateX(60px);opacity:0;transition:transform .55s cubic-bezier(.25,.46,.45,.94),opacity .55s;}
.wtl-avatar.entered{transform:translateX(0);opacity:1;}
.wtl-bubble-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.wtl-bubble-name{font-family:'Share Tech Mono',monospace;font-size:9px;color:#00d4ff;letter-spacing:3px;display:flex;align-items:center;gap:6px;}
.wtl-wave{display:flex;gap:2px;align-items:center;}
.wtl-wave span{width:2px;border-radius:2px;background:#00d4ff;animation:wtlWave .8s ease-in-out infinite;}
.wtl-wave span:nth-child(2){animation-delay:.15s;}.wtl-wave span:nth-child(3){animation-delay:.3s;}
@keyframes wtlWave{0%,100%{height:3px}50%{height:8px}}
.wtl-bubble-text{font-size:13px;color:#e8f4ff;line-height:1.55;white-space:pre-wrap;overflow-y:auto;flex:1;}
.wtl-bubble-tap{margin-top:4px;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(0,212,255,.45);letter-spacing:2px;text-align:right;}

/* QUIZ MCQ */
.wtl-quiz-area{flex:1;display:flex;flex-direction:column;gap:6px;overflow:hidden;}
.wtl-quiz-q{font-size:13px;color:#e8f4ff;line-height:1.5;font-weight:600;flex-shrink:0;}
.wtl-quiz-opts{display:flex;flex-direction:column;gap:5px;overflow-y:auto;flex:1;}
.wtl-opt{background:rgba(8,18,42,.9);border:1px solid rgba(0,212,255,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;text-align:left;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:border-color .15s,background .15s;}
.wtl-opt:active{background:rgba(0,212,255,.08);}
.wtl-opt.correct{border-color:#2dc653;background:rgba(45,198,83,.12);color:#2dc653;}
.wtl-opt.wrong{border-color:#ff4444;background:rgba(255,68,68,.08);color:#ff4444;}
.wtl-quiz-hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.45);letter-spacing:.5px;line-height:1.5;display:none;flex-shrink:0;}
.wtl-quiz-hint.show{display:block;}

/* PROGRESS BAR */
.wtl-progress-row{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.wtl-prog-bar{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.wtl-prog-fill{height:100%;background:linear-gradient(90deg,#00d4ff,#2dc653);border-radius:2px;transition:width .4s;}
.wtl-prog-pct{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

/* BOTTOM BAR */
.wtl-bottom{height:62px;background:rgba(4,8,18,.98);border-top:1px solid rgba(0,212,255,.1);display:flex;align-items:center;justify-content:space-between;padding:0 12px;gap:10px;flex-shrink:0;}
.wtl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.wtl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.wtl-dot.done{background:#2dc653;}
.wtl-dot.active{background:#00d4ff;width:14px;border-radius:3px;}
.wtl-nav{display:flex;align-items:center;justify-content:center;padding:0 18px;height:44px;border-radius:12px;font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer;border:none;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .2s;}
.wtl-nav:active{transform:scale(.93);}
.wtl-nav-back{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);min-width:72px;}
.wtl-nav-next{background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;min-width:96px;}
.wtl-nav-next:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.18);cursor:not-allowed;transform:none;}

/* FIRE GLOW */
@keyframes wtlFireGlow{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 40px 8px rgba(255,80,0,.35)}}
.wtl-scene.fire-anim{animation:wtlFireGlow 0.6s ease-in-out infinite;}

/* INLINE COLOR QUIZ (replaces bubble during cquiz) */
.wtl-cquiz-inline{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,18,42,.98);border:1px solid rgba(0,212,255,.18);border-radius:14px;padding:12px;}
.wtl-cquiz-inline-label{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.45);}
.wtl-cquiz-inline-role{font-size:38px;font-weight:900;letter-spacing:5px;text-align:center;text-shadow:0 0 18px currentColor;}
.wtl-cquiz-inline-prog{display:flex;gap:8px;align-items:center;margin-top:2px;}
@keyframes wtlShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.wtl-cquiz-inline.shake{animation:wtlShake .35s ease;}
`;

function injectCSS() {
  if (document.querySelector('#wtl-css')) return;
  const s = document.createElement('style');
  s.id = 'wtl-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════════
// CROSS-SECTION DRAW
// ══════════════════════════════════════════════════════════════════

function drawCrossSection(canvas, layer) {
  const SIZE = canvas.width;
  const cx   = SIZE / 2;
  const cy   = SIZE / 2;
  const ctx  = canvas.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);

  const JACKET_R = SIZE * 0.46;
  const INSUL_R  = SIZE * 0.33;
  const COPPER_R = SIZE * 0.18;

  const glow = (r, hex, active) => {
    if (active) {
      const g = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r + 18);
      g.addColorStop(0, hex + 'cc');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, Math.PI * 2); ctx.fill();
    }
  };

  // Jacket
  glow(JACKET_R, '#888', layer === 2);
  ctx.beginPath(); ctx.arc(cx, cy, JACKET_R, 0, Math.PI * 2);
  ctx.fillStyle = layer === 2 ? '#888888' : (layer === -1 ? '#555' : '#3a3a3a');
  ctx.fill();

  // Insulation
  glow(INSUL_R, '#3355cc', layer === 1);
  ctx.beginPath(); ctx.arc(cx, cy, INSUL_R, 0, Math.PI * 2);
  ctx.fillStyle = layer === 1 ? '#3355cc' : (layer === -1 ? '#333' : '#222255');
  ctx.fill();

  // Copper
  glow(COPPER_R, '#b87333', layer === 0);
  ctx.beginPath(); ctx.arc(cx, cy, COPPER_R, 0, Math.PI * 2);
  ctx.fillStyle = layer === 0 ? '#d4893a' : (layer === -1 ? '#555' : '#6b4420');
  ctx.fill();

  // Ring outlines
  [[JACKET_R,'#ffffff22'],[INSUL_R,'#ffffff18'],[COPPER_R,'#ffffff25']].forEach(([r,c]) => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.stroke();
  });
}

// ══════════════════════════════════════════════════════════════════
// WIRE LABEL SPRITE
// ══════════════════════════════════════════════════════════════════

function makeLabel(hex, text) {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 50;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(4,10,24,0.9)';
  ctx.beginPath(); ctx.roundRect(2,2,156,46,9); ctx.fill();
  ctx.strokeStyle = hex; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(2,2,156,46,9); ctx.stroke();
  ctx.fillStyle = hex; ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 80, 25);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthTest:false });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(0.85, 0.28, 1);
  return sp;
}

// ══════════════════════════════════════════════════════════════════
// MAIN CLASS
// ══════════════════════════════════════════════════════════════════

export class WireTypesLesson {
  constructor(state) {
    this.state       = state;
    this._step       = 0;
    this._three      = null;
    this._animId     = null;
    this._sceneObjs  = [];   // transient scene objects
    this._sparks     = [];
    this._dropObjs   = [];   // objects with drop animation
    this._fireObjs   = [];   // objects with fire animation
    this._quizDone   = false;
    this._cqIdx      = 0;
    this._cqCorrect  = 0;
    this._cqTargets  = [];
    this._cqActive   = false;
    this._cqTargetId = '';
    this._quizMeshTap = null;
    this._camPos     = new THREE.Vector3(4,3,8);
    this._camTarget  = new THREE.Vector3(0,0,0);
    this.container   = this._build();
  }

  // ─── DOM ────────────────────────────────────────────────────────
  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="wtl">
        <header class="wtl-top">
          <button class="wtl-back">← MENU</button>
          <div class="wtl-top-center">
            <span class="wtl-ch-label" id="wtl-ch-lbl">WIRE TYPES</span>
          </div>
          <span class="wtl-ch-step" id="wtl-step-num">1/${STEPS.length}</span>
        </header>

        <div class="wtl-scene" id="wtl-scene">
          <canvas class="wtl-canvas" id="wtl-canvas"></canvas>

          <!-- Cross-section overlay -->
          <div class="wtl-cross-overlay" id="wtl-cross-overlay">
            <div class="wtl-cross-wrap">
              <canvas id="wtl-cross-canvas" width="220" height="220"></canvas>
              <div class="wtl-cross-labels" id="wtl-cross-labels"></div>
            </div>
          </div>

          <!-- Wire type badge -->
          <div class="wtl-wt-badge" id="wtl-wt-badge">
            <div class="wtl-wt-badge-name" id="wtl-wt-name"></div>
            <div class="wtl-wt-badge-tag"  id="wtl-wt-tag"></div>
          </div>

          <!-- Color quiz prompt -->
          <div class="wtl-cquiz-prompt" id="wtl-cquiz-prompt">
            <div class="wtl-cquiz-role" id="wtl-cquiz-role"></div>
            <div class="wtl-cquiz-sub">TAP THE CORRECT WIRE</div>
            <div class="wtl-cquiz-prog" id="wtl-cquiz-prog"></div>
          </div>

          <div class="wtl-tap-hint" id="wtl-tap-hint" style="display:none">👆 TAP THE CORRECT WIRE</div>
          <div class="wtl-feedback" id="wtl-feedback"><div class="wtl-fb" id="wtl-fb"></div></div>
        </div>

        <div class="wtl-dialog" id="wtl-dialog">
          <!-- swapped between bubble-mode and quiz-mode -->
          <div class="wtl-bubble" id="wtl-bubble">
            <img src="/Mascot.png" class="wtl-avatar" id="wtl-avatar" alt="Electro"/>
            <div class="wtl-bubble-content">
              <div class="wtl-bubble-name">ELECTRO
                <div class="wtl-wave"><span></span><span></span><span></span></div>
              </div>
              <p class="wtl-bubble-text" id="wtl-text"></p>
              <div class="wtl-bubble-tap" id="wtl-bubble-tap">TAP TO CONTINUE »</div>
            </div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct"></span>
          </div>
        </div>

        <div class="wtl-bottom">
          <button class="wtl-nav wtl-nav-back" id="wtl-prev">← BACK</button>
          <div class="wtl-dots" id="wtl-dots"></div>
          <button class="wtl-nav wtl-nav-next" id="wtl-next">NEXT →</button>
        </div>
      </div>`;

    el.querySelector('.wtl-back').addEventListener('click',  () => this.state.setState('menu'));
    el.querySelector('#wtl-next').addEventListener('click',  () => this._onNext());
    el.querySelector('#wtl-prev').addEventListener('click',  () => this._onPrev());
    el.querySelector('#wtl-bubble-tap').addEventListener('click', () => this._onNext());
    this._el = el;
    return el;
  }

  // ─── THREE.JS INIT ───────────────────────────────────────────────
  _initThree() {
    if (this._three) return;
    const canvas  = this._el.querySelector('#wtl-canvas');
    const sceneEl = this._el.querySelector('#wtl-scene');
    const W = sceneEl.offsetWidth, H = sceneEl.offsetHeight;
    if (!W || !H) { setTimeout(() => this._initThree(), 60); return; }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e18);
    scene.fog = new THREE.FogExp2(0x0a0e18, 0.025);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 80);
    camera.position.copy(this._camPos);
    camera.lookAt(this._camTarget);

    // Lighting + realistic workbench
    buildLightingRig(scene);
    const { lampFill } = buildWorkbench(scene, { benchY:-0.64, benchW:11, benchD:5.5 });
    const lamp = lampFill;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();

    const onTap = (e) => {
      if (!this._cqActive && !this._quizMeshTap) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const src  = e.touches ? e.changedTouches[0] : e;
      ptr.x =  ((src.clientX - rect.left) / rect.width)  * 2 - 1;
      ptr.y = -((src.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(ptr, camera);
      const hits = raycaster.intersectObjects(this._cqTargets);
      if (hits.length) {
        const id = hits[0].object.userData.wireId;
        if (this._cqActive) this._onColorTap(id, hits[0].point);
        if (this._quizMeshTap) this._quizMeshTap(id);
      }
    };
    canvas.addEventListener('pointerdown', onTap);

    // Resize observer
    this._resizeObs = new ResizeObserver(() => {
      const w2 = sceneEl.offsetWidth, h2 = sceneEl.offsetHeight;
      if (!w2 || !h2) return;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    });
    this._resizeObs.observe(sceneEl);

    this._three = { renderer, scene, camera, lamp };
    this._cqActive = false;
    this._quizMeshTap = null;

    const tick = () => {
      this._animId = requestAnimationFrame(tick);
      this._updateThree();
      renderer.render(scene, camera);
    };
    tick();
  }

  // _makeWoodTex replaced by WorkbenchBuilder

  // ─── SCENE MANAGEMENT ───────────────────────────────────────────
  _clearSceneObjs() {
    if (!this._three) return;
    for (const o of this._sceneObjs) this._three.scene.remove(o);
    this._sceneObjs = [];
    this._dropObjs  = [];
    this._fireObjs  = [];
    this._cqTargets = [];
    this._cqActive  = false;
    this._quizMeshTap = null;
    this._el.querySelector('#wtl-scene').classList.remove('fire-anim');
    this._el.querySelector('#wtl-cross-overlay').classList.remove('show');
    this._el.querySelector('#wtl-wt-badge').classList.remove('show');
    this._el.querySelector('#wtl-cquiz-prompt').classList.remove('show');
    this._el.querySelector('#wtl-tap-hint').style.display = 'none';
  }

  _add(mesh) {
    this._three.scene.add(mesh);
    this._sceneObjs.push(mesh);
    return mesh;
  }

  _makeWire(wt, x) {
    const isBX = wt.shape === 'armored';
    const isNM = wt.shape === 'flat';
    
    // High-fidelity materials
    const mat = new THREE.MeshStandardMaterial({
      color: wt.col,
      roughness: isBX ? 0.18 : (isNM ? 0.75 : 0.35),
      metalness: isBX ? 0.92 : 0.05,
      clearcoat: isBX ? 0 : 0.6,
      clearcoatRoughness: 0.2
    });

    const mesh = new THREE.Mesh(this._makeWireGeo(wt), mat);
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    mesh.userData.wireId = wt.id;
    mesh.position.set(x, -0.35, 0);

    // If NM-B (flat), add visible inner wires
    if (isNM) {
      const gInner = new THREE.Group();
      [-0.04, 0, 0.04].forEach((oz, i) => {
        const col = [0x111111, 0xb87333, 0xeeeeee][i];
        const iMat = new THREE.MeshStandardMaterial({
          color: col, roughness: 0.4, metalness: i===1?0.9:0
        });
        const iMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 5.85, 12), iMat);
        iMesh.position.set(0, 0, oz);
        gInner.add(iMesh);
      });
      mesh.add(gInner);
    }
    
    // If BX (armored), add the true spiral
    if (isBX) {
      this._makeArmorSpiral(mesh, wt.r);
    }

    return mesh;
  }

  _makeWireGeo(wt) {
    if (wt.shape === 'flat') {
      return new THREE.CapsuleGeometry(wt.r * 0.45, 5.6, 8, 16);
    }
    return new THREE.CylinderGeometry(wt.r, wt.r, 5.8, 24);
  }

  _makeArmorSpiral(parent, r) {
    const spiralMat = new THREE.MeshStandardMaterial({ color:0xaaaaaa, roughness:0.18, metalness:0.92 });
    
    // Create a true helix path
    const pts = [];
    const turns = 45;
    const height = 5.6;
    for(let i=0; i<=200; i++){
      const t = i/200;
      const angle = t * Math.PI * 2 * turns;
      const py = -height/2 + t*height;
      pts.push(new THREE.Vector3(Math.cos(angle)*r, py, Math.sin(angle)*r));
    }
    const path = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(path, 200, 0.022, 8, false);
    
    const spiral = new THREE.Mesh(tubeGeo, spiralMat);
    parent.add(spiral);
  }

  _makeCopperEnd(x, z, stranded = false) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color:0xd4893a, roughness:0.15, metalness:0.95,
      emissive:0xd4893a, emissiveIntensity:0.12
    });

    if (stranded) {
      for(let i=0; i<7; i++){
        const a = (i/7) * Math.PI * 2;
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8), mat);
        s.rotation.z = Math.PI / 2;
        s.position.set(0, Math.cos(a)*0.038, Math.sin(a)*0.038);
        g.add(s);
      }
    } else {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 16), mat);
      m.rotation.z = Math.PI / 2;
      g.add(m);
    }

    g.position.set(x, -0.35, z);
    return g;
  }

  _makeTermEnd(x, z, r) {
    const mat = new THREE.MeshStandardMaterial({ color:0xaaaaaa, roughness:0.12, metalness:0.95 });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.16, 16), mat);
    m.rotation.z = Math.PI / 2;
    m.position.set(x, -0.35, z);
    return m;
  }

  // ─── SCENE BUILDERS ─────────────────────────────────────────────
  _applyScene(step) {
    this._clearSceneObjs();
    const sc = step.scene;

    if (sc === 'empty') return;

    if (sc === 'wire_drop' || sc === 'wire_single') {
      const wt   = { col:0x1a1a2e, r:0.13, shape:'round', id:'anatomy' };
      const mesh = this._makeWire(wt, 0);

      if (sc === 'wire_drop') {
        mesh.position.set(0, 4, 0);
        this._dropObjs.push({ mesh, target:-0.35, vel:0 });
      } else {
        mesh.position.set(0, -0.35, 0);
      }
      this._add(mesh);
      // Use stranded copper for main wire
      this._add(this._makeCopperEnd(-3.01, 0, true));
      this._add(this._makeCopperEnd( 3.01, 0, true));
      this._add(this._makeTermEnd(-2.9, 0, 0.13));
      this._add(this._makeTermEnd( 2.9, 0, 0.13));
    }

    if (sc === 'cross_section') {
      const overlay = this._el.querySelector('#wtl-cross-overlay');
      overlay.classList.add('show');
      const crossCanvas = this._el.querySelector('#wtl-cross-canvas');
      drawCrossSection(crossCanvas, step.layer ?? -1);
      // labels
      const tags = this._el.querySelector('#wtl-cross-labels');
      const layers = [
        { name:'COPPER',    hex:'#b87333', active: step.layer === 0 },
        { name:'INSULATION',hex:'#3355cc', active: step.layer === 1 },
        { name:'JACKET',    hex:'#666666', active: step.layer === 2 },
      ];
      tags.innerHTML = layers.map(l => `
        <span class="wtl-cross-tag" style="color:${l.active ? l.hex : 'rgba(255,255,255,0.3)'};border-color:${l.active ? l.hex : 'rgba(255,255,255,0.12)'};font-weight:${l.active?'800':'400'}">
          ${l.name}
        </span>`).join('');
    }

    if (sc === 'color_wires') {
      this._cqTargets = [];
      CWISE.forEach(w => {
        const mesh = this._makeWire({ col:w.col, r:0.14, shape:'round', id:w.id }, 0);
        mesh.position.z = w.z;
        this._add(mesh);
        this._cqTargets.push(mesh);
        // Solid core for small gauge wires
        this._add(this._makeCopperEnd(-2.71, w.z, false));
        this._add(this._makeCopperEnd( 2.71, w.z, false));
        this._add(this._makeTermEnd(-2.7, w.z, 0.14));
        this._add(this._makeTermEnd( 2.7, w.z, 0.14));

        // color label sprite always visible
        const sp = makeLabel(w.hex, w.lbl);
        sp.position.set(0, 0.1, w.z);
        this._add(sp);

        // focus: dim others
        const focus = step.focus;
        if (focus && focus !== w.id) {
          mesh.material.opacity = 0.2;
          mesh.material.transparent = true;
        }
        if (focus === w.id) {
          mesh.material.emissive = new THREE.Color(w.col);
          mesh.material.emissiveIntensity = 0.25;
        }
      });
    }

    if (sc === 'wt_slots') {
      const slotMat = new THREE.MeshStandardMaterial({ color:0x0a1a2a, roughness:0.9, transparent:true, opacity:0.6 });
      WTD.forEach((wt, i) => {
        const x = (i - 2) * 1.1;
        const slot = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 5.6, 24), slotMat);
        slot.rotation.z = Math.PI / 2;
        slot.position.set(x, -0.35, 0);
        this._add(slot);
        const sp = makeLabel('#334455', wt.lbl);
        sp.position.set(x, 0.12, 0);
        this._add(sp);
      });
    }

    if (sc === 'wt_show') {
      const active = step.active ?? -1;
      WTD.forEach((wt, i) => {
        const x    = (i - 2) * 1.1;
        const isActive = i === active;

        let group;
        if (wt.shape === 'armored') {
          group = new THREE.Group();
          const core = new THREE.Mesh(
            new THREE.CylinderGeometry(wt.r, wt.r, 5.8, 20),
            new THREE.MeshStandardMaterial({ color:0x555555, roughness:0.5, metalness:0.6 })
          );
          group.add(core);
          this._makeArmorRings(group, wt.r, isActive ? 24 : 14);
          group.rotation.z = Math.PI / 2;
          group.position.set(x, -0.35, 0);
          group.castShadow = true;
          // For raycaster, track the core
          core.userData.wireId = wt.id;
          this._cqTargets.push(core);
          this._add(group);
        } else {
          const geo  = new THREE.CylinderGeometry(wt.r, wt.r, 5.8, 24);
          const mat  = new THREE.MeshStandardMaterial({
            color: wt.col, roughness:0.65, metalness:0.05,
            transparent: !isActive, opacity: isActive ? 1 : 0.22,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.z = Math.PI / 2;
          mesh.position.set(x, -0.35, 0);
          mesh.castShadow = true;
          mesh.userData.wireId = wt.id;
          this._add(mesh);
          if (isActive) {
            mat.emissive = new THREE.Color(wt.col);
            mat.emissiveIntensity = 0.2;
          }
        }

        if (isActive) {
          const sp = makeLabel(wt.hex, wt.lbl);
          sp.position.set(x, 0.18, 0);
          this._add(sp);

          const wtBadge = this._el.querySelector('#wtl-wt-badge');
          this._el.querySelector('#wtl-wt-name').textContent = wt.lbl;
          this._el.querySelector('#wtl-wt-tag').textContent  = wt.tag;
          wtBadge.classList.add('show');
        }

        this._add(this._makeCopperEnd(x - 2.91, 0));
        this._add(this._makeCopperEnd(x + 2.91, 0));
        this._add(this._makeTermEnd(x - 2.9, 0, wt.r));
        this._add(this._makeTermEnd(x + 2.9, 0, wt.r));
      });
    }

    if (sc === 'awg_pair') {
      const hl = step.hl;
      const awgPairs = [
        { id:'awg14', r:0.11, col:0x8855aa, hex:'#8855aa', x:-1.1, lbl:'AWG 14' },
        { id:'awg12', r:0.155, col:0xcc6600, hex:'#cc6600', x: 1.1, lbl:'AWG 12' },
      ];
      awgPairs.forEach(w => {
        const isHl = hl === w.id || !hl;
        const mat  = new THREE.MeshStandardMaterial({
          color: w.col, roughness:0.6, metalness:0.05,
          transparent: !isHl, opacity: isHl ? 1 : 0.25,
        });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(w.r, w.r, 5.4, 22), mat);
        mesh.rotation.z = Math.PI / 2;
        mesh.position.set(w.x, -0.35, 0);
        mesh.castShadow = true;
        if (isHl) {
          mat.emissive = new THREE.Color(w.col);
          mat.emissiveIntensity = hl ? 0.25 : 0;
        }
        this._add(mesh);

        const sp = makeLabel(w.hex, w.lbl);
        sp.position.set(w.x, 0.12, 0);
        this._add(sp);
        this._add(this._makeCopperEnd(w.x - 2.71, 0));
        this._add(this._makeCopperEnd(w.x + 2.71, 0));
      });
    }

    if (sc === 'awg_fire') {
      const mat = new THREE.MeshStandardMaterial({ color:0x8855aa, roughness:0.6, metalness:0.05 });
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 5.4, 22), mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(0, -0.35, 0);
      mesh.castShadow = true;
      this._add(mesh);
      this._fireObjs.push({ mesh, mat, t:0 });
      this._el.querySelector('#wtl-scene').classList.add('fire-anim');

      const sp = makeLabel('#ff4400', 'AWG 14');
      sp.position.set(0, 0.12, 0);
      this._add(sp);
    }

    if (sc === 'bench_clean') return;

    if (sc === 'wt_all') {
      WTD.forEach((wt, i) => {
        const x   = (i - 2) * 1.25;
        const mat = new THREE.MeshStandardMaterial({ color:wt.col, roughness:0.65, metalness: wt.shape==='armored'?0.7:0.05 });
        const mesh= new THREE.Mesh(new THREE.CylinderGeometry(wt.r, wt.r, 5.4, 22), mat);
        mesh.rotation.z = Math.PI / 2;
        mesh.position.set(x, -0.35, 0);
        mesh.castShadow = true;
        this._add(mesh);
        const sp = makeLabel(wt.hex, wt.lbl);
        sp.position.set(x, 0.12, 0);
        this._add(sp);
        mat.emissive = new THREE.Color(wt.col);
        mat.emissiveIntensity = 0.15;
      });
    }

    if (sc === 'quiz' || sc === 'quiz_intro') {
      // Show the relevant quiz wire for context
      const qi = step.qi;
      if (qi == null) return;
      const q   = QQS[qi];
      const vis = q.vis;
      let wtMatch = WTD.find(w => w.id.toLowerCase() === vis);
      let cMatch  = CWISE.find(w => w.id === vis);

      if (vis === 'awg') {
        const mat = new THREE.MeshStandardMaterial({ color:0xcc6600, roughness:0.6, metalness:0 });
        const m   = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 5.4, 22), mat);
        m.rotation.z = Math.PI / 2; m.position.set(0, -0.35, 0); m.castShadow = true;
        this._add(m);
        const sp = makeLabel('#cc6600', 'AWG 12'); sp.position.set(0, 0.12, 0); this._add(sp);
      } else if (wtMatch) {
        const mat  = new THREE.MeshStandardMaterial({ color:wtMatch.col, roughness:0.65, metalness: wtMatch.shape==='armored'?0.7:0.05 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(wtMatch.r, wtMatch.r, 5.4, 22), mat);
        mesh.rotation.z = Math.PI / 2; mesh.position.set(0,-0.35,0); mesh.castShadow = true;
        if (wtMatch.shape === 'armored') {
          const grp = new THREE.Group();
          grp.add(mesh);
          this._makeArmorRings(grp, wtMatch.r, 22);
          grp.rotation.z = Math.PI / 2;
          grp.children[0].rotation.z = 0;
          grp.position.set(0,-0.35,0);
          this._add(grp);
        } else {
          mat.emissive = new THREE.Color(wtMatch.col); mat.emissiveIntensity = 0.15;
          this._add(mesh);
        }
        const sp = makeLabel(wtMatch.hex, wtMatch.lbl); sp.position.set(0, 0.18, 0); this._add(sp);
      } else if (cMatch) {
        const mat  = new THREE.MeshStandardMaterial({ color:cMatch.col, roughness:0.6, metalness:0.05 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 5.4, 24), mat);
        mesh.rotation.z = Math.PI / 2; mesh.position.set(0,-0.35,0); mesh.castShadow = true;
        mat.emissive = new THREE.Color(cMatch.col); mat.emissiveIntensity = 0.2;
        this._add(mesh);
        const sp = makeLabel(cMatch.hex, cMatch.lbl); sp.position.set(0, 0.12, 0); this._add(sp);
      } else if (vis === 'outdoor') {
        const mat  = new THREE.MeshStandardMaterial({ color:0x4d7040, roughness:0.7, metalness:0 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 5.4, 22), mat);
        mesh.rotation.z = Math.PI / 2; mesh.position.set(0,-0.35,0); mesh.castShadow = true;
        mat.emissive = new THREE.Color(0x4d7040); mat.emissiveIntensity = 0.2;
        this._add(mesh);
        const sp = makeLabel('#4d7040', 'UF-B'); sp.position.set(0, 0.12, 0); this._add(sp);
      } else if (vis === 'neutral') {
        const mat  = new THREE.MeshStandardMaterial({ color:0xd8d8d8, roughness:0.6, metalness:0.05 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 5.4, 24), mat);
        mesh.rotation.z = Math.PI / 2; mesh.position.set(0,-0.35,0); mesh.castShadow = true;
        this._add(mesh);
        const sp = makeLabel('#d8d8d8', 'WHITE'); sp.position.set(0, 0.12, 0); this._add(sp);
      }
    }
  }

  // ─── ANIMATION LOOP ──────────────────────────────────────────────
  _updateThree() {
    if (!this._three) return;
    const { camera, lamp } = this._three;
    const t = performance.now() * 0.001;

    const step    = STEPS[this._step];
    const camCfg  = step.cam;
    const tPos    = new THREE.Vector3(...camCfg.p);
    const tAt     = new THREE.Vector3(...camCfg.t);
    this._camPos.lerp(tPos, 0.042);
    this._camTarget.lerp(tAt, 0.042);
    camera.position.copy(this._camPos);
    camera.lookAt(this._camTarget);

    lamp.intensity = 1.5 + Math.sin(t * 4.1) * 0.07;

    // Drop animation (spring physics)
    for (const obj of this._dropObjs) {
      const dist = obj.mesh.position.y - obj.target;
      if (Math.abs(dist) < 0.01 && Math.abs(obj.vel) < 0.002) {
        obj.mesh.position.y = obj.target;
      } else {
        obj.vel += -0.018 * dist - 0.18 * obj.vel;
        obj.mesh.position.y += obj.vel;
      }
    }

    // Gentle float for wires in scene
    for (const o of this._sceneObjs) {
      if (o.userData && o.userData.floatIdx !== undefined) {
        o.position.y = o.userData.baseY + Math.sin(t * 0.55 + o.userData.floatIdx * 1.1) * 0.018;
      }
    }

    // Fire animation
    for (const f of this._fireObjs) {
      f.t += 0.04;
      const cycle = (Math.sin(f.t * 3.1) + 1) * 0.5;
      f.mat.emissive = new THREE.Color(0xff4400);
      f.mat.emissiveIntensity = 0.4 + cycle * 0.6;
      f.mat.color = new THREE.Color(0xff2200);
    }

    // Sparks
    this._sparks = this._sparks.filter(s => {
      s.life -= 0.024;
      if (s.life <= 0) { this._three.scene.remove(s.mesh); return false; }
      s.vel.y -= 0.005;
      s.mesh.position.addScaledVector(s.vel, 1);
      s.mesh.material.opacity = s.life;
      return true;
    });

    // Color wires pulse during color chapter steps
    if (step.t === 'color' || step.t === 'cquiz' || step.t === 'color_sum') {
      for (const o of this._sceneObjs) {
        if (o.isMesh && o.userData.wireId && !o.material.transparent) {
          const w = CWISE.find(x => x.id === o.userData.wireId);
          if (w && this._cqActive) {
            const tgt = this._cqTargetId === w.id;
            o.material.emissive = new THREE.Color(w.col);
            o.material.emissiveIntensity = tgt ? 0.08 + Math.sin(t*3)*0.08 : 0;
          }
        }
      }
    }
  }

  _spawnSparks(origin) {
    if (!this._three) return;
    for (let i = 0; i < 16; i++) {
      const mat  = new THREE.MeshBasicMaterial({
        color: [0xffcc00, 0xff6600, 0xffffff][i % 3], transparent:true, opacity:1
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.032, 4, 4), mat);
      mesh.position.copy(origin);
      this._three.scene.add(mesh);
      this._sparks.push({
        mesh, life: 0.7 + Math.random() * 0.6,
        vel: new THREE.Vector3(
          (Math.random()-0.5)*0.09,
          0.05 + Math.random()*0.09,
          (Math.random()-0.5)*0.09
        )
      });
    }
  }

  _showFeedback(emoji) {
    const fb = this._el.querySelector('#wtl-feedback');
    this._el.querySelector('#wtl-fb').textContent = emoji;
    fb.classList.add('show');
    setTimeout(() => fb.classList.remove('show'), 800);
  }

  // ─── COLOR QUIZ LOGIC ────────────────────────────────────────────
  _startColorQuiz() {
    this._cqIdx     = 0;
    this._cqCorrect = 0;
    this._cqActive  = true;
    this._renderColorQuizRound();
    this._el.querySelector('#wtl-next').disabled = true;
  }

  _renderColorQuizRound() {
    const order = [
      { id:'red',   role:'HOT',     hex:'#cc2222' },
      { id:'white', role:'NEUTRAL', hex:'#d8d8d8' },
      { id:'green', role:'GROUND',  hex:'#1a9e44' },
    ];
    const round = order[this._cqIdx];
    this._cqTargetId = round.id;
    const pct = Math.round((this._step / (STEPS.length - 1)) * 100);

    // Inline dialog — no scene overlay blocking the wires
    this._el.querySelector('#wtl-dialog').innerHTML = `
      <div class="wtl-cquiz-inline" id="wtl-cq-inline">
        <div class="wtl-cquiz-inline-label">TAP THE CORRECT WIRE</div>
        <div class="wtl-cquiz-inline-role" style="color:${round.hex}">${round.role}</div>
        <div class="wtl-cquiz-inline-prog">${order.map((_, i) =>
          `<div class="wtl-cquiz-pip ${i < this._cqIdx ? 'done' : i === this._cqIdx ? 'active' : ''}"></div>`
        ).join('')}</div>
      </div>
      <div class="wtl-progress-row">
        <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog" style="width:${pct}%"></div></div>
        <span class="wtl-prog-pct" id="wtl-pct">${pct}%</span>
      </div>`;

    this._el.querySelector('#wtl-tap-hint').style.display = 'block';
  }

  _onColorTap(id, hitPoint) {
    if (!this._cqActive) return;
    if (id === this._cqTargetId) {
      this._showFeedback('✅');
      this._spawnSparks(hitPoint);
      this._cqCorrect++;
      this._cqIdx++;
      if (this._cqIdx >= 3) {
        this._cqActive = false;
        this._el.querySelector('#wtl-tap-hint').style.display = 'none';
        this._el.querySelector('#wtl-next').disabled = false;
        this._el.querySelector('#wtl-next').textContent = 'NEXT CHAPTER';
        const pct = Math.round((this._step / (STEPS.length - 1)) * 100);
        this._el.querySelector('#wtl-dialog').innerHTML = `
          <div class="wtl-cquiz-inline">
            <div class="wtl-cquiz-inline-role" style="color:#2dc653">ALL CORRECT ✓</div>
            <div class="wtl-cquiz-inline-label">Tap NEXT CHAPTER to continue</div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog" style="width:${pct}%"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct">${pct}%</span>
          </div>`;
      } else {
        setTimeout(() => this._renderColorQuizRound(), 450);
      }
    } else {
      this._showFeedback('❌');
      const inl = this._el.querySelector('#wtl-cq-inline');
      if (inl) { inl.classList.remove('shake'); void inl.offsetWidth; inl.classList.add('shake'); }
    }
  }

  // ─── MCQ QUIZ LOGIC ──────────────────────────────────────────────
  _renderQuiz(qi) {
    const q   = QQS[qi];
    const dlg = this._el.querySelector('#wtl-dialog');
    dlg.innerHTML = `
      <div class="wtl-quiz-area">
        <p class="wtl-quiz-q">${q.q}</p>
        <div class="wtl-quiz-opts">
          ${q.opts.map((o, i) => `
            <button class="wtl-opt" data-idx="${i}">${o}</button>
          `).join('')}
        </div>
        <div class="wtl-quiz-hint" id="wtl-quiz-hint">${q.hint}</div>
      </div>
      <div class="wtl-progress-row">
        <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
        <span class="wtl-prog-pct" id="wtl-pct"></span>
      </div>`;

    dlg.querySelectorAll('.wtl-opt').forEach(btn => {
      btn.addEventListener('click', () => this._onQuizAnswer(qi, parseInt(btn.dataset.idx)));
    });
  }

  _onQuizAnswer(qi, chosen) {
    if (this._quizDone) return;
    const q   = QQS[qi];
    const btns= this._el.querySelectorAll('.wtl-opt');

    btns.forEach((b, i) => {
      b.style.pointerEvents = 'none';
      if (i === q.ans) b.classList.add('correct');
      else if (i === chosen) b.classList.add('wrong');
    });

    if (chosen === q.ans) {
      this._showFeedback('✅');
      this._quizDone = true;
      this._el.querySelector('#wtl-next').disabled = false;
    } else {
      this._showFeedback('❌');
      const hint = this._el.querySelector('#wtl-quiz-hint');
      if (hint) hint.classList.add('show');
      setTimeout(() => {
        this._quizDone = true;
        this._el.querySelector('#wtl-next').disabled = false;
      }, 900);
    }
  }

  // ─── UI RENDER ───────────────────────────────────────────────────
  _render() {
    const step  = STEPS[this._step];
    const total = STEPS.length;
    const pct   = Math.round((this._step / (total - 1)) * 100);

    // Top bar
    this._el.querySelector('#wtl-ch-lbl').textContent  = step.chLbl || '';
    this._el.querySelector('#wtl-step-num').textContent = `${this._step + 1}/${total}`;

    // Dots
    const dots = this._el.querySelector('#wtl-dots');
    dots.innerHTML = STEPS.map((_, i) => {
      const cls = i < this._step ? 'done' : i === this._step ? 'active' : '';
      return `<div class="wtl-dot ${cls}"></div>`;
    }).join('');

    // Nav buttons
    const nextBtn = this._el.querySelector('#wtl-next');
    const prevBtn = this._el.querySelector('#wtl-prev');
    prevBtn.style.visibility = this._step === 0 ? 'hidden' : 'visible';

    if (step.t === 'quiz') {
      this._quizDone = false;
      nextBtn.disabled = true;
      nextBtn.textContent = 'NEXT →';
      this._renderQuiz(step.qi);
      // Update progress inside quiz area
      requestAnimationFrame(() => {
        const pf = this._el.querySelector('#wtl-prog');
        const pp = this._el.querySelector('#wtl-pct');
        if (pf) pf.style.width = pct + '%';
        if (pp) pp.textContent  = pct + '%';
      });
    } else {
      // Restore bubble if it was replaced by quiz
      if (!this._el.querySelector('#wtl-bubble')) {
        this._el.querySelector('#wtl-dialog').innerHTML = `
          <div class="wtl-bubble" id="wtl-bubble">
            <img src="/Mascot.png" class="wtl-avatar" id="wtl-avatar" alt="Electro"/>
            <div class="wtl-bubble-content">
              <div class="wtl-bubble-name">ELECTRO
                <div class="wtl-wave"><span></span><span></span><span></span></div>
              </div>
              <p class="wtl-bubble-text" id="wtl-text"></p>
              <div class="wtl-bubble-tap" id="wtl-bubble-tap">TAP TO CONTINUE »</div>
            </div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct"></span>
          </div>`;
        this._el.querySelector('#wtl-bubble-tap').addEventListener('click', () => this._onNext());
      }

      this._el.querySelector('#wtl-text').textContent   = step.text || '';
      this._el.querySelector('#wtl-prog').style.width   = pct + '%';
      this._el.querySelector('#wtl-pct').textContent    = pct + '%';

      const isCquiz = step.t === 'cquiz';
      const showTap = !isCquiz && !step.btn;
      this._el.querySelector('#wtl-bubble-tap').style.display = showTap ? 'block' : 'none';

      nextBtn.disabled    = isCquiz;
      nextBtn.textContent = step.btn || 'NEXT →';

      // Mascot slide-in
      const avatar = this._el.querySelector('#wtl-avatar');
      if (avatar) {
        if (step.mascotIn) {
          avatar.classList.remove('entered');
          requestAnimationFrame(() => requestAnimationFrame(() => avatar.classList.add('entered')));
        } else {
          avatar.classList.add('entered');
        }
      }

      if (isCquiz) this._startColorQuiz();
    }
  }

  // ─── NAVIGATION ──────────────────────────────────────────────────
  _gotoStep(n) {
    this._step = Math.max(0, Math.min(STEPS.length - 1, n));
    const step = STEPS[this._step];
    this._applyScene(step);
    this._render();
  }

  _onNext() {
    const step = STEPS[this._step];
    if (step.t === 'done') { Database.completeLesson('wireTypes'); this.state.setState('wireLearn'); return; }
    if (this._step < STEPS.length - 1) this._gotoStep(this._step + 1);
  }

  _onPrev() {
    if (this._step > 0) this._gotoStep(this._step - 1);
  }

  // ─── LIFECYCLE ───────────────────────────────────────────────────
  onShow() {
    this._step   = 0;
    this._camPos.set(4, 3, 8);
    this._camTarget.set(0, 0, 0);
    this._sparks = [];
    this._render();
    // Delay Three.js init so the DOM is fully laid out
    setTimeout(() => this._initThree(), 80);
  }

  onHide() {
    if (this._animId)    { cancelAnimationFrame(this._animId); this._animId = null; }
    if (this._resizeObs) { this._resizeObs.disconnect(); this._resizeObs = null; }
    if (this._three)     {
      this._clearSceneObjs();
      this._three.renderer.dispose();
      this._three = null;
    }
    this._sparks = [];
  }
}

import * as THREE from 'three';
import { buildWorkbench, buildLightingRig } from './WorkbenchBuilder.js';
import { Database } from '../systems/Database.js';

// ══════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════

const QUIZ = [
  { q:'Which tool automatically adjusts to any wire gauge without notch selection?',
    opts:['Manual Stripper','Automatic Stripper','Utility Knife','Rotary Stripper'], a:1,
    hint:'Automatic strippers have self-adjusting jaws — no notch selection, no gauge matching required.' },
  { q:'What is the correct technique when using a utility knife to strip wire insulation?',
    opts:['Score around the wire in a circle','Score along the length of the wire','Press the blade straight down','Spin the knife around the wire'], a:1,
    hint:'Scoring lengthwise cannot nick the conductor below. A circular score almost always does.' },
  { q:'Which tool is best for removing the outer jacket of NM-B (Romex) cable?',
    opts:['Manual Wire Stripper','Rotary Stripper','Utility Knife','Automatic Stripper'], a:2,
    hint:'The outer NM-B sheath is too large for manual strippers. The utility knife scored lengthwise along the jacket is correct.' },
  { q:'What happens when you use the wrong notch size on a manual wire stripper?',
    opts:['The insulation tears cleanly','The conductor strands get crushed or nicked','Nothing — it self-adjusts','The tool breaks'], a:1,
    hint:'Too small a notch crushes the copper strands inside. Always match the notch AWG marking to the wire gauge.' },
  { q:'What is the correct exposed conductor length for most standard terminal connections?',
    opts:['2–3 mm','6–10 mm','15–20 mm','25–30 mm'], a:1,
    hint:'6–10 mm is the standard for most terminals. More creates a shock hazard; less means poor contact.' },
];

const T_SELECT = [
  { q:'You are stripping 50 pieces of 14 AWG THHN on a job site. Speed matters most.', a:'automatic' },
  { q:'Removing the outer jacket from a length of NM-B (Romex) cable.', a:'knife' },
  { q:'Inside a distribution panel — one conductor, one precision ring cut needed.', a:'rotary' },
  { q:'Quick home repair: stripping a single 12 AWG TW wire at an outlet box.', a:'manual' },
  { q:'Preparing coaxial cable for a CCTV security camera installation.', a:'rotary' },
];

const TOOLS = [
  { id:'manual',    name:'MANUAL STRIPPER',  col:0xcc2200, hex:'#cc2200', x:-2.8 },
  { id:'automatic', name:'AUTO STRIPPER',     col:0x1155cc, hex:'#1155cc', x:-0.9 },
  { id:'knife',     name:'UTILITY KNIFE',     col:0x555566, hex:'#666677', x: 0.9 },
  { id:'rotary',    name:'ROTARY STRIPPER',   col:0xffaa00, hex:'#ffaa00', x: 2.8 },
];

const STEPS = [
  // CH0
  { t:'intro', ch:0, chLbl:'WIRE STRIPPING',     cam:{p:[0,2.5,7.5],t:[0,-0.3,0]}, scene:'bench_tools', mascotIn:true,
    text:"Before any wire can make a connection, it must be stripped. Use the wrong tool — or wrong technique — and you damage the conductor. That means heat, faults, and fire.\n\nThis lesson teaches you the four stripping tools used in Philippine electrical work.", btn:'NEXT' },
  { t:'info',  ch:0, chLbl:'WIRE STRIPPING',     cam:{p:[0,2.5,7.5],t:[0,-0.3,0]}, scene:'bench_tools',
    text:"Five chapters:\n1 — Why tool choice matters\n2 — The four stripping tools\n3 — Tool selection challenge\n4 — Strip quality standards\n5 — Tool care and maintenance", btn:"LET'S START" },

  // CH1
  { t:'chap',  ch:1, chLbl:'CH.1 TOOL CHOICE',  cam:{p:[0,2,6],   t:[0,-0.1,0]}, scene:'bench_clean',
    text:"Three methods you will see on job sites — each one wrong. Understanding why helps you remember the correct approach.", btn:'NEXT' },
  { t:'bad',   ch:1, chLbl:'CH.1 BAD METHODS',  cam:{p:[0,1.8,5], t:[0,-0.2,0]}, scene:'bad_teeth',
    text:"TEETH — Never strip wire with your teeth. You nick the conductor at the bite point, creating a high-resistance stress spot that heats up under load. Illegal in all professional electrical installations.", btn:'NEXT' },
  { t:'bad',   ch:1, chLbl:'CH.1 BAD METHODS',  cam:{p:[0,1.8,5], t:[0,-0.2,0]}, scene:'bad_crush',
    text:"WRONG NOTCH — Too-small a notch on a manual stripper crushes the copper strands inside. Crushed strands have higher resistance. Under load that section heats up and melts the surrounding insulation from the inside.", btn:'NEXT' },
  { t:'bad',   ch:1, chLbl:'CH.1 BAD METHODS',  cam:{p:[0,1.8,5], t:[0,-0.2,0]}, scene:'bad_nick',
    text:"DEEP KNIFE CUT — Scoring around the wire with a knife too deeply nicks the copper. Even a small nick concentrates stress — under load or repeated bending, the wire can break inside the wall where you cannot inspect it.", btn:'NEXT' },
  { t:'info',  ch:1, chLbl:'CH.1 THE STANDARD', cam:{p:[0,1.8,5], t:[0,-0.2,0]}, scene:'good_strip',
    text:"A correct strip has three things:\n✓ Clean 90° insulation edge — no tearing\n✓ Zero nicks on the copper — smooth surface\n✓ Correct length — 6 to 10 mm for most terminals\n\nEvery time. No exceptions.", btn:'NEXT CHAPTER' },

  // CH2
  { t:'chap',  ch:2, chLbl:'CH.2 THE 4 TOOLS',  cam:{p:[0,2.5,8], t:[0,-0.3,0]}, scene:'all_tools',
    text:"Four tools. Each one has a specific strength. Each one has specific use cases. You need to know all four.", btn:'NEXT' },
  { t:'tool',  ch:2, chLbl:'CH.2 MANUAL',   toolId:'manual',    cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_manual',
    text:"MANUAL WIRE STRIPPER — the most common tool on Philippine job sites. Multiple notches for different AWG gauges. Squeeze the handles — the jaws grip and cut the insulation at the exact depth without touching the copper.", btn:'NEXT' },
  { t:'demo',  ch:2, chLbl:'CH.2 MANUAL',   toolId:'manual',    cam:{p:[0,1.8,5.5],t:[0,-0.1,0]}, scene:'anim_manual',
    text:"Position the wire in the correct notch. Squeeze firmly and rotate 360°. Pull — the insulation sleeve slides off cleanly. The copper is untouched.", btn:'NEXT' },
  { t:'when',  ch:2, chLbl:'CH.2 MANUAL',   toolId:'manual',    cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_manual',
    text:"BEST FOR: THHN, TW, NM-B individual conductors in 12–14 AWG. Fast for single wires in everyday installations. Always match the notch label to the wire's AWG gauge.", btn:'NEXT' },
  { t:'tool',  ch:2, chLbl:'CH.2 AUTOMATIC', toolId:'automatic', cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_automatic',
    text:"AUTOMATIC WIRE STRIPPER — self-adjusting jaws detect the wire gauge and grip automatically. One squeeze action cuts and pulls simultaneously. No notch selection, no rotation. Faster than manual.", btn:'NEXT' },
  { t:'demo',  ch:2, chLbl:'CH.2 AUTOMATIC', toolId:'automatic', cam:{p:[0,1.8,5.5],t:[0,-0.1,0]}, scene:'anim_automatic',
    text:"Insert the wire into the front port. Squeeze the trigger — the self-adjusting jaws clamp, cut, and pull in a single motion. The wire drops out stripped in one second.", btn:'NEXT' },
  { t:'when',  ch:2, chLbl:'CH.2 AUTOMATIC', toolId:'automatic', cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_automatic',
    text:"BEST FOR: high-volume work, stranded wires, 10–26 AWG. More expensive than manual, but essential on large installations where you strip hundreds of wires per job.", btn:'NEXT' },
  { t:'tool',  ch:2, chLbl:'CH.2 KNIFE',    toolId:'knife',     cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_knife',
    text:"UTILITY KNIFE — standard box cutter used with the correct technique. Key rule: score LENGTHWISE, not around the wire. A lengthwise score cannot reach the conductor below. A circular cut almost always does.", btn:'NEXT' },
  { t:'demo',  ch:2, chLbl:'CH.2 KNIFE',    toolId:'knife',     cam:{p:[0,1.8,5.5],t:[0,-0.1,0]}, scene:'anim_knife',
    text:"Score along the insulation lengthwise on two sides. Light pressure — let the blade's sharpness do the work. Peel back the scored sections and strip off the insulation.", btn:'NEXT' },
  { t:'when',  ch:2, chLbl:'CH.2 KNIFE',    toolId:'knife',     cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_knife',
    text:"BEST FOR: NM-B outer sheath, BX jacket, UF-B jacket — large cables where manual strippers are too small. Not recommended for individual conductors; the nick risk is too high for most skill levels.", btn:'NEXT' },
  { t:'tool',  ch:2, chLbl:'CH.2 ROTARY',   toolId:'rotary',    cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_rotary',
    text:"ROTARY WIRE STRIPPER — a circular blade scores a perfect ring around the insulation as you rotate the tool. Produces the cleanest, most consistent strip. Common in panel work and coaxial cable installations.", btn:'NEXT' },
  { t:'demo',  ch:2, chLbl:'CH.2 ROTARY',   toolId:'rotary',    cam:{p:[0,1.8,5.5],t:[0,-0.1,0]}, scene:'anim_rotary',
    text:"Clamp the tool at the strip mark. Rotate 2 to 3 full turns — the circular blade scores all the way around. Pull the insulation sleeve off cleanly.", btn:'NEXT' },
  { t:'when',  ch:2, chLbl:'CH.2 ROTARY',   toolId:'rotary',    cam:{p:[0,1.2,3.5],t:[0,0,0]}, scene:'show_rotary',
    text:"BEST FOR: coaxial cable, THHN in panels, any wire needing a precision ring cut. The blade depth is preset by the tool — you physically cannot cut too deep.", btn:'NEXT CHAPTER' },

  // CH3
  { t:'chap',    ch:3, chLbl:'CH.3 TOOL QUIZ',  cam:{p:[0,2.5,8],t:[0,-0.3,0]}, scene:'all_tools',
    text:"Chapter 3. Five scenarios. Tap the correct tool on the bench for each job. All four tools are in front of you.", btn:'START' },
  { t:'tselect', ch:3, chLbl:'CH.3 — Q1/5',    cam:{p:[0,2.5,8],t:[0,-0.3,0]}, scene:'all_tools', qIdx:0 },
  { t:'tselect', ch:3, chLbl:'CH.3 — Q2/5',    cam:{p:[0,2.5,8],t:[0,-0.3,0]}, scene:'all_tools', qIdx:1 },
  { t:'tselect', ch:3, chLbl:'CH.3 — Q3/5',    cam:{p:[0,2.5,8],t:[0,-0.3,0]}, scene:'all_tools', qIdx:2 },
  { t:'tselect', ch:3, chLbl:'CH.3 — Q4/5',    cam:{p:[0,2.5,8],t:[0,-0.3,0]}, scene:'all_tools', qIdx:3 },
  { t:'tselect', ch:3, chLbl:'CH.3 — Q5/5',    cam:{p:[0,2.5,8],t:[0,-0.3,0]}, scene:'all_tools', qIdx:4 },

  // CH4
  { t:'chap',    ch:4, chLbl:'CH.4 STRIP QUALITY', cam:{p:[0,1.8,5.5],t:[0,-0.2,0]}, scene:'quality_good',
    text:"Chapter 4. Strip quality. Not all strips are equal. Learn to identify good and bad — this is how you inspect your own work before it goes into a terminal.", btn:'NEXT' },
  { t:'quality', ch:4, chLbl:'CH.4 — FAIL', qType:'nick',   cam:{p:[0,1.6,4.5],t:[0,-0.1,0]}, scene:'quality_nick',
    text:"FAIL — NICKED COPPER. The blade cut too deep and scored the conductor. At the nick, current concentrates and heats the wire. Insulation softens and cracks from the inside. A fire risk hidden in the wall.", btn:'NEXT' },
  { t:'quality', ch:4, chLbl:'CH.4 — FAIL', qType:'long',   cam:{p:[0,1.6,4.5],t:[0,-0.1,0]}, scene:'quality_long',
    text:"FAIL — TOO LONG. Too much exposed conductor beyond the terminal creates a live shock hazard. PEC requires bare conductor to be limited to terminal contact only.", btn:'NEXT' },
  { t:'quality', ch:4, chLbl:'CH.4 — FAIL', qType:'ragged', cam:{p:[0,1.6,4.5],t:[0,-0.1,0]}, scene:'quality_ragged',
    text:"FAIL — RAGGED EDGE. The insulation was torn, not cut cleanly. Individual strands may be broken inside the insulation where you cannot see them. Use a sharp tool, not force.", btn:'NEXT' },
  { t:'quality', ch:4, chLbl:'CH.4 — PASS', qType:'good',   cam:{p:[0,1.6,4.5],t:[0,-0.1,0]}, scene:'quality_good',
    text:"PASS — CLEAN STRIP. 90° edge, no nicks, 6–10 mm exposed. This is the professional standard. Every strip you make — on a repair or a new installation — should look exactly like this.", btn:'NEXT CHAPTER' },

  // CH5
  { t:'chap',  ch:5, chLbl:'CH.5 TOOL CARE',    cam:{p:[0,2.5,7.5],t:[0,-0.3,0]}, scene:'bench_tools',
    text:"Chapter 5. Tool maintenance. A clean, sharp tool strips cleanly. A dirty or dull tool damages wires.", btn:'NEXT' },
  { t:'info',  ch:5, chLbl:'CH.5 CLEAN',         cam:{p:[0,2.5,7.5],t:[0,-0.3,0]}, scene:'bench_tools',
    text:"CLEAN AFTER EVERY JOB. Insulation debris in notches changes the effective cut depth. A plugged notch means you are using the wrong size without knowing it. Wipe blades dry. Use a small brush on notch channels.", btn:'NEXT' },
  { t:'info',  ch:5, chLbl:'CH.5 BLADES',        cam:{p:[0,2.5,7.5],t:[0,-0.3,0]}, scene:'bench_tools',
    text:"BLADE SHARPNESS. When a utility knife drags instead of cutting, replace the blade — pressing harder increases nick risk. Dull rotary stripper blades should be replaced, not forced. Manual stripper jaws can be honed with a flat jeweler's file.", btn:'NEXT' },
  { t:'info',  ch:5, chLbl:'CH.5 STORAGE',       cam:{p:[0,2.5,7.5],t:[0,-0.3,0]}, scene:'bench_tools',
    text:"STORAGE. Always retract utility knife blades before storing. Moisture rusts blades and stiffens springs in manual strippers — a stiff spring means inconsistent closing force, which means inconsistent cut depth.", btn:'NEXT CHAPTER' },

  // QUIZ
  { t:'qintro', ch:6, chLbl:'KNOWLEDGE CHECK',  cam:{p:[0,2.5,7],t:[0,-0.3,0]}, scene:'bench_clean',
    text:"Five questions. Take your time — you have covered all of this.", btn:'START QUIZ' },
  ...QUIZ.map((_, i) => ({ t:'quiz', ch:6, chLbl:`QUESTION ${i+1}/5`, cam:{p:[0,2.5,7],t:[0,-0.3,0]}, scene:'bench_clean', qi:i })),

  // DONE
  { t:'done',  ch:7, chLbl:'COMPLETE',           cam:{p:[0,2.8,8],t:[0,-0.2,0]}, scene:'bench_tools',
    text:"Wire Stripping complete.\n\nYou know the four tools, when each one is correct, what a quality strip looks like, and how to maintain your tools. Apply this every time you pick up a wire.", btn:'FINISH' },
];

// ══════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════

const CSS = `
.wsl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

.wsl-top{height:48px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(255,165,0,.15);display:flex;align-items:center;padding:0 12px;gap:10px;flex-shrink:0;}
.wsl-back{background:rgba(255,165,0,.08);border:1px solid rgba(255,165,0,.28);color:#ffaa00;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.wsl-top-center{flex:1;text-align:center;}
.wsl-ch-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#ffaa00;display:block;}
.wsl-ch-step{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

.wsl-scene{height:44vh;min-height:200px;max-height:340px;position:relative;flex-shrink:0;background:#07101f;overflow:hidden;}
.wsl-canvas{display:block;}

.wsl-tap-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(255,170,0,.9);letter-spacing:2px;pointer-events:none;animation:wslPulse 1.2s ease-in-out infinite;background:rgba(4,10,24,.8);padding:5px 14px;border-radius:20px;border:1px solid rgba(255,170,0,.3);white-space:nowrap;}
@keyframes wslPulse{0%,100%{opacity:.45;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.03)}}

.wsl-feedback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .1s;}
.wsl-feedback.show{opacity:1;}
.wsl-fb{font-size:88px;line-height:1;animation:wslPop .3s cubic-bezier(.34,1.56,.64,1);filter:drop-shadow(0 0 22px rgba(255,255,255,.5));}
@keyframes wslPop{from{transform:scale(0) rotate(-15deg)}to{transform:scale(1) rotate(0)}}

.wsl-tool-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(4,10,24,.92);border-radius:12px;padding:6px 18px;text-align:center;display:none;animation:wslPop .3s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(255,170,0,.3);}
.wsl-tool-badge.show{display:block;}
.wsl-tool-badge-name{font-size:17px;font-weight:900;letter-spacing:2px;color:#fff;}
.wsl-tool-badge-tag{font-family:'Share Tech Mono',monospace;font-size:9px;color:#ffaa00;letter-spacing:1px;}

.wsl-quality-badge{position:absolute;top:10px;right:14px;border-radius:10px;padding:5px 14px;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;display:none;animation:wslPop .3s cubic-bezier(.34,1.56,.64,1);}
.wsl-quality-badge.fail{display:block;background:rgba(255,68,68,.18);border:1px solid #ff4444;color:#ff4444;}
.wsl-quality-badge.pass{display:block;background:rgba(45,198,83,.18);border:1px solid #2dc653;color:#2dc653;}

.wsl-dialog{flex:1;display:flex;flex-direction:column;padding:8px 12px;gap:6px;overflow:hidden;min-height:0;}
.wsl-bubble{background:rgba(8,18,42,.98);border:1px solid rgba(255,170,0,.18);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;flex:1;overflow:hidden;}
.wsl-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,170,0,.35);flex-shrink:0;transform:translateX(60px);opacity:0;transition:transform .55s cubic-bezier(.25,.46,.45,.94),opacity .55s;}
.wsl-avatar.entered{transform:translateX(0);opacity:1;}
.wsl-bubble-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.wsl-bubble-name{font-family:'Share Tech Mono',monospace;font-size:9px;color:#ffaa00;letter-spacing:3px;display:flex;align-items:center;gap:6px;}
.wsl-wave{display:flex;gap:2px;align-items:center;}
.wsl-wave span{width:2px;border-radius:2px;background:#ffaa00;animation:wslWave .8s ease-in-out infinite;}
.wsl-wave span:nth-child(2){animation-delay:.15s;}.wsl-wave span:nth-child(3){animation-delay:.3s;}
@keyframes wslWave{0%,100%{height:3px}50%{height:8px}}
.wsl-bubble-text{font-size:13px;color:#e8f4ff;line-height:1.55;white-space:pre-wrap;overflow-y:auto;flex:1;}
.wsl-bubble-tap{margin-top:4px;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,170,0,.45);letter-spacing:2px;text-align:right;}

.wsl-ts-area{flex:1;display:flex;flex-direction:column;gap:8px;overflow:hidden;background:rgba(8,18,42,.98);border:1px solid rgba(255,170,0,.18);border-radius:14px;padding:12px 14px;}
.wsl-ts-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#ffaa00;}
.wsl-ts-q{font-size:13px;color:#e8f4ff;line-height:1.55;font-weight:600;flex:1;}
.wsl-ts-hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,170,0,.65);letter-spacing:1px;animation:wslPulse 1.4s ease-in-out infinite;}
.wsl-ts-result{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.5px;line-height:1.5;}
.wsl-ts-result.ok{color:#2dc653;animation:none;}
.wsl-ts-result.fail{color:#ff4444;animation:none;}

.wsl-quiz-area{flex:1;display:flex;flex-direction:column;gap:6px;overflow:hidden;}
.wsl-quiz-q{font-size:13px;color:#e8f4ff;line-height:1.5;font-weight:600;flex-shrink:0;}
.wsl-quiz-opts{display:flex;flex-direction:column;gap:5px;overflow-y:auto;flex:1;}
.wsl-opt{background:rgba(8,18,42,.9);border:1px solid rgba(255,170,0,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;text-align:left;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:border-color .15s,background .15s;}
.wsl-opt:active{background:rgba(255,170,0,.08);}
.wsl-opt.correct{border-color:#2dc653;background:rgba(45,198,83,.12);color:#2dc653;}
.wsl-opt.wrong{border-color:#ff4444;background:rgba(255,68,68,.08);color:#ff4444;}
.wsl-quiz-hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.45);letter-spacing:.5px;line-height:1.5;display:none;flex-shrink:0;}
.wsl-quiz-hint.show{display:block;}

.wsl-progress-row{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.wsl-prog-bar{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.wsl-prog-fill{height:100%;background:linear-gradient(90deg,#ffaa00,#2dc653);border-radius:2px;transition:width .4s;}
.wsl-prog-pct{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

.wsl-bottom{height:62px;background:rgba(4,8,18,.98);border-top:1px solid rgba(255,170,0,.1);display:flex;align-items:center;justify-content:space-between;padding:0 12px;gap:10px;flex-shrink:0;}
.wsl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.wsl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.wsl-dot.done{background:#2dc653;}
.wsl-dot.active{background:#ffaa00;width:14px;border-radius:3px;}
.wsl-nav{display:flex;align-items:center;justify-content:center;padding:0 18px;height:44px;border-radius:12px;font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer;border:none;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .2s;}
.wsl-nav:active{transform:scale(.93);}
.wsl-nav-back{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);min-width:72px;}
.wsl-nav-next{background:linear-gradient(135deg,#ffaa00,#ff6600);color:#000;min-width:96px;}
.wsl-nav-next:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.18);cursor:not-allowed;transform:none;}
`;

function injectCSS() {
  if (document.querySelector('#wsl-css')) return;
  const s = document.createElement('style');
  s.id = 'wsl-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

// ── Helpers ────────────────────────────────────────────────────────────

function makeLabel(hex, text) {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 50;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(4,10,24,0.9)';
  ctx.beginPath(); ctx.roundRect(2,2,156,46,9); ctx.fill();
  ctx.strokeStyle = hex; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(2,2,156,46,9); ctx.stroke();
  ctx.fillStyle = hex; ctx.font = 'bold 17px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 80, 25);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthTest:false });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(0.82, 0.27, 1);
  return sp;
}

function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

// ══════════════════════════════════════════════════════════════════
// MAIN CLASS
// ══════════════════════════════════════════════════════════════════

export class WireStrippingLesson {
  constructor(state) {
    this.state       = state;
    this._step       = 0;
    this._three      = null;
    this._animId     = null;
    this._sceneObjs  = [];
    this._dropObjs   = [];
    this._tsGroups   = [];   // tool groups for raycaster in tselect
    this._tsActive   = false;
    this._tsAnswered = false;
    this._animObjs   = {};
    this._animT      = 0;
    this._animScene  = null;
    this._lastTime   = 0;
    this._sparks     = [];
    this._quizDone   = false;
    this._camPos     = new THREE.Vector3(0, 2.5, 7.5);
    this._camTarget  = new THREE.Vector3(0, -0.3, 0);
    this.container   = this._build();
  }

  // ─── DOM ─────────────────────────────────────────────────────────

  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="wsl">
        <header class="wsl-top">
          <button class="wsl-back">← MENU</button>
          <div class="wsl-top-center">
            <span class="wsl-ch-label" id="wsl-ch-lbl">WIRE STRIPPING</span>
          </div>
          <span class="wsl-ch-step" id="wsl-step-num">1/${STEPS.length}</span>
        </header>

        <div class="wsl-scene" id="wsl-scene">
          <canvas class="wsl-canvas" id="wsl-canvas"></canvas>
          <div class="wsl-tool-badge" id="wsl-tool-badge">
            <div class="wsl-tool-badge-name" id="wsl-badge-name"></div>
            <div class="wsl-tool-badge-tag"  id="wsl-badge-tag"></div>
          </div>
          <div class="wsl-quality-badge" id="wsl-quality-badge"></div>
          <div class="wsl-tap-hint" id="wsl-tap-hint" style="display:none">👆 TAP THE CORRECT TOOL</div>
          <div class="wsl-feedback" id="wsl-feedback"><div class="wsl-fb" id="wsl-fb"></div></div>
        </div>

        <div class="wsl-dialog" id="wsl-dialog">
          <div class="wsl-bubble" id="wsl-bubble">
            <img src="/Mascot.png" class="wsl-avatar" id="wsl-avatar" alt="Volt"/>
            <div class="wsl-bubble-content">
              <div class="wsl-bubble-name">VOLT
                <div class="wsl-wave"><span></span><span></span><span></span></div>
              </div>
              <p class="wsl-bubble-text" id="wsl-text"></p>
              <div class="wsl-bubble-tap" id="wsl-bubble-tap">TAP TO CONTINUE »</div>
            </div>
          </div>
          <div class="wsl-progress-row">
            <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog"></div></div>
            <span class="wsl-prog-pct" id="wsl-pct"></span>
          </div>
        </div>

        <div class="wsl-bottom">
          <button class="wsl-nav wsl-nav-back" id="wsl-prev">← BACK</button>
          <div class="wsl-dots" id="wsl-dots"></div>
          <button class="wsl-nav wsl-nav-next" id="wsl-next">NEXT →</button>
        </div>
      </div>`;

    el.querySelector('.wsl-back').addEventListener('click', () => this.state.setState('wireLearn'));
    el.querySelector('#wsl-next').addEventListener('click', () => this._onNext());
    el.querySelector('#wsl-prev').addEventListener('click', () => this._onPrev());
    el.querySelector('#wsl-bubble-tap').addEventListener('click', () => this._onNext());
    this._el = el;
    return el;
  }

  // ─── THREE.JS INIT ────────────────────────────────────────────────

  _initThree() {
    if (this._three) return;
    const canvas  = this._el.querySelector('#wsl-canvas');
    const sceneEl = this._el.querySelector('#wsl-scene');
    const W = sceneEl.offsetWidth, H = sceneEl.offsetHeight;
    if (!W || !H) { setTimeout(() => this._initThree(), 60); return; }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e18);
    scene.fog = new THREE.FogExp2(0x0a0e18, 0.025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 80);
    camera.position.copy(this._camPos);
    camera.lookAt(this._camTarget);

    buildLightingRig(scene);
    const { spotLight, lampFill } = buildWorkbench(scene, { benchY:-0.64, benchW:12, benchD:5.5 });
    const lamp = lampFill; // keep ref name for _three

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const onTap = (e) => {
      if (!this._tsActive) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const src  = e.touches ? e.changedTouches[0] : e;
      ptr.x =  ((src.clientX - rect.left) / rect.width)  * 2 - 1;
      ptr.y = -((src.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(ptr, camera);
      const hits = raycaster.intersectObjects(this._tsGroups, true);
      if (hits.length) {
        let obj = hits[0].object;
        let toolId = obj.userData.toolId;
        while (!toolId && obj.parent) { obj = obj.parent; toolId = obj.userData.toolId; }
        if (toolId) this._onToolTap(toolId, hits[0].point);
      }
    };
    canvas.addEventListener('pointerdown', onTap);

    this._resizeObs = new ResizeObserver(() => {
      const w2 = sceneEl.offsetWidth, h2 = sceneEl.offsetHeight;
      if (!w2 || !h2) return;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    });
    this._resizeObs.observe(sceneEl);

    this._three = { renderer, scene, camera, lamp };
    this._lastTime = performance.now() * 0.001;

    const tick = () => {
      this._animId = requestAnimationFrame(tick);
      this._updateThree();
      renderer.render(scene, camera);
    };
    tick();
  }

  // _makeWoodTex replaced by WorkbenchBuilder.makeWoodTexture()

  // ─── SCENE MANAGEMENT ────────────────────────────────────────────

  _clearSceneObjs() {
    if (!this._three) return;
    for (const o of this._sceneObjs) this._three.scene.remove(o);
    this._sceneObjs = [];
    this._dropObjs  = [];
    this._tsGroups  = [];
    this._tsActive  = false;
    this._tsAnswered= false;
    this._animObjs  = {};
    this._animScene = null;
    this._el.querySelector('#wsl-tool-badge').classList.remove('show');
    const qb = this._el.querySelector('#wsl-quality-badge');
    qb.className = 'wsl-quality-badge';
    this._el.querySelector('#wsl-tap-hint').style.display = 'none';
  }

  _add(mesh) {
    this._three.scene.add(mesh);
    this._sceneObjs.push(mesh);
    return mesh;
  }

  // ─── TOOL BUILDERS ───────────────────────────────────────────────

  _tagMeshes(group, toolId) {
    group.userData.toolId = toolId;
    group.traverse(c => { if (c.isMesh) c.userData.toolId = toolId; });
  }

  _buildManual(scale = 1) {
    const g = new THREE.Group();
    const rMat = new THREE.MeshStandardMaterial({ color:0xcc1111, roughness:0.75, metalness:0.0 });
    const sMat = new THREE.MeshStandardMaterial({ color:0x6e6e6e, roughness:0.22, metalness:0.88 });
    const dMat = new THREE.MeshStandardMaterial({ color:0x222222, roughness:0.35, metalness:0.80 });
    const cMat = new THREE.MeshStandardMaterial({ color:0xaaaaaa, roughness:0.12, metalness:0.95 });
    const yMat = new THREE.MeshStandardMaterial({ color:0xffaa00, roughness:0.8, metalness:0 });

    // ARM A (top handle + lower jaw)
    const armA = new THREE.Group();
    // Handle
    const h1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.08*scale, 0.72*scale, 6, 14), rMat);
    h1.position.set(-0.52*scale, 0.16*scale, 0); h1.rotation.z = 0.35;
    armA.add(h1);
    // Grip ridges
    for(let i=0; i<8; i++){
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.082*scale, 0.015*scale, 6, 18), new THREE.MeshStandardMaterial({color:0x990e0e}));
      r.position.set(-0.52*scale + Math.sin(0.35)*(-0.16+i*0.09)*scale, 0.16*scale - Math.cos(0.35)*(-0.16+i*0.09)*scale, 0);
      r.rotation.set(Math.PI/2, 0, 0.35); armA.add(r);
    }
    // Arm base
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.25*scale, 0.08*scale, 0.12*scale), sMat);
    b1.position.set(-0.10*scale, 0.04*scale, 0); b1.rotation.z = 0.15;
    armA.add(b1);
    // Lower Jaw plate
    const j1 = new THREE.Mesh(new THREE.BoxGeometry(0.56*scale, 0.065*scale, 0.16*scale), sMat);
    j1.position.set(0.38*scale, -0.065*scale, 0);
    armA.add(j1);
    // Cutting edge (rear of jaw)
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.12*scale, 0.05*scale, 0.16*scale), dMat);
    c1.position.set(0.12*scale, -0.02*scale, 0); armA.add(c1);

    // ARM B (bottom handle + upper jaw)
    const armB = new THREE.Group();
    // Handle
    const h2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.08*scale, 0.72*scale, 6, 14), rMat);
    h2.position.set(-0.52*scale, -0.16*scale, 0); h2.rotation.z = -0.35;
    armB.add(h2);
    for(let i=0; i<8; i++){
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.082*scale, 0.015*scale, 6, 18), new THREE.MeshStandardMaterial({color:0x990e0e}));
      r.position.set(-0.52*scale + Math.sin(-0.35)*(-0.16+i*0.09)*scale, -0.16*scale - Math.cos(-0.35)*(-0.16+i*0.09)*scale, 0);
      r.rotation.set(Math.PI/2, 0, -0.35); armB.add(r);
    }
    // Arm base
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.25*scale, 0.08*scale, 0.12*scale), sMat);
    b2.position.set(-0.10*scale, -0.04*scale, 0); b2.rotation.z = -0.15;
    armB.add(b2);
    // Upper Jaw plate
    const j2 = new THREE.Mesh(new THREE.BoxGeometry(0.56*scale, 0.065*scale, 0.16*scale), sMat);
    j2.position.set(0.38*scale, 0.065*scale, 0);
    armB.add(j2);
    // Cutting edge (rear of jaw)
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.12*scale, 0.05*scale, 0.16*scale), dMat);
    c2.position.set(0.12*scale, 0.02*scale, 0); armB.add(c2);

    // Hex Pivot bolt
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.065*scale, 0.065*scale, 0.22*scale, 6), cMat);
    pivot.rotation.x = Math.PI/2;

    // Coil spring between handles
    for (let i=0; i<8; i++){
      const a = (i/7)*Math.PI;
      const ring = new THREE.Mesh(new THREE.BoxGeometry(0.015*scale, 0.015*scale, 0.015*scale), cMat);
      ring.position.set(-0.32*scale, Math.cos(a)*0.1*scale, Math.sin(a)*0.06*scale);
      g.add(ring);
    }

    // Stripping notches (semi-circle cuts along the jaws)
    [0.26, 0.36, 0.46, 0.56].forEach((x, i) => {
      const rs = (0.045 - i*0.008)*scale; // decreasing hole sizes
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(rs, rs, 0.18*scale, 12), dMat);
      hole.rotation.x = Math.PI/2; hole.position.set(x*scale, 0, 0);
      g.add(hole);
      // Yellow text marker (faux)
      const txt = new THREE.Mesh(new THREE.BoxGeometry(0.025*scale, 0.04*scale, 0.17*scale), yMat);
      txt.position.set(x*scale, 0.04*scale, 0); armB.add(txt);
    });

    // Pliers tip at front
    const tipTop = new THREE.Mesh(new THREE.BoxGeometry(0.08*scale, 0.03*scale, 0.16*scale), sMat);
    tipTop.position.set(0.62*scale, -0.01*scale, 0); armA.add(tipTop);
    const tipBot = new THREE.Mesh(new THREE.BoxGeometry(0.08*scale, 0.03*scale, 0.16*scale), sMat);
    tipBot.position.set(0.62*scale, 0.01*scale, 0); armB.add(tipBot);
    for(let i=0; i<4; i++){
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.015*scale, 0.01*scale, 0.16*scale), dMat);
      s1.position.set((0.59+i*0.02)*scale, 0.01*scale, 0); armA.add(s1);
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.015*scale, 0.01*scale, 0.16*scale), dMat);
      s2.position.set((0.59+i*0.02)*scale, -0.01*scale, 0); armB.add(s2);
    }

    g.add(armA); g.add(armB); g.add(pivot);
    g.userData.armA = armA;
    g.userData.armB = armB;
    return g;
  }

  _buildAutomatic(scale = 1) {
    const g = new THREE.Group();
    const bluMat  = new THREE.MeshStandardMaterial({ color:0x1155cc, roughness:0.6 });
    const drkBlu  = new THREE.MeshStandardMaterial({ color:0x0a2a66, roughness:0.7 });
    const metMat  = new THREE.MeshStandardMaterial({ color:0x888888, roughness:0.25, metalness:0.9 });
    const blkMat  = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.5 });

    // Main body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.10*scale, 0.36*scale, 0.28*scale), bluMat.clone());
    body.position.set(0, 0.05*scale, 0);
    g.add(body);

    // Top cover detail
    const topCover = new THREE.Mesh(new THREE.BoxGeometry(0.90*scale, 0.06*scale, 0.24*scale), drkBlu.clone());
    topCover.position.set(-0.05*scale, 0.26*scale, 0);
    g.add(topCover);

    // Grip/handle (angled below body)
    const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.11*scale, 0.52*scale, 5, 14), bluMat.clone());
    grip.position.set(0.05*scale, -0.36*scale, 0); grip.rotation.z = 0.22;
    g.add(grip);

    // Trigger
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.06*scale, 0.26*scale, 0.12*scale), drkBlu.clone());
    trigger.position.set(0.14*scale, -0.14*scale, 0); trigger.rotation.z = 0.18;
    g.add(trigger);

    // Front jaw housing
    const frontHousing = new THREE.Mesh(new THREE.BoxGeometry(0.28*scale, 0.32*scale, 0.26*scale), metMat.clone());
    frontHousing.position.set(0.60*scale, 0.05*scale, 0);
    g.add(frontHousing);

    // Front port (wire entry hole)
    const port = new THREE.Mesh(new THREE.CylinderGeometry(0.065*scale, 0.065*scale, 0.30*scale, 14), blkMat.clone());
    port.rotation.z = Math.PI/2; port.position.set(0.60*scale, 0.05*scale, 0);
    g.add(port);

    // Side jaw detail lines
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.26*scale, 0.025*scale, 0.30*scale),
        new THREE.MeshStandardMaterial({ color:0x0044aa, roughness:0.8 }));
      line.position.set(0.60*scale, (-0.05 + i*0.06)*scale, 0);
      g.add(line);
    }

    g.userData.trigger = trigger;
    return g;
  }

  _buildKnife(scale = 1) {
    const g = new THREE.Group();
    const gryMat  = new THREE.MeshStandardMaterial({ color:0x555566, roughness:0.72 });
    const drkMat  = new THREE.MeshStandardMaterial({ color:0x222233, roughness:0.8 });
    const silMat  = new THREE.MeshStandardMaterial({ color:0xcccccc, roughness:0.18, metalness:0.92 });
    const blkMat  = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.6 });

    // Handle body
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.88*scale, 0.22*scale, 0.20*scale), gryMat.clone());
    handle.position.set(-0.18*scale, 0, 0);
    g.add(handle);

    // Grip texture ridges on handle
    for (let i = 0; i < 5; i++) {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.025*scale, 0.225*scale, 0.21*scale),
        new THREE.MeshStandardMaterial({ color:0x333344, roughness:0.85 }));
      ridge.position.set((-0.48 + i*0.13)*scale, 0, 0);
      g.add(ridge);
    }

    // Blade housing at front
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.28*scale, 0.20*scale, 0.22*scale), drkMat.clone());
    housing.position.set(0.44*scale, 0.01*scale, 0);
    g.add(housing);

    // Blade (thin, silver, angled tip)
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.56*scale, 0.048*scale, 0.018*scale), silMat.clone());
    blade.position.set(0.48*scale, 0.09*scale, 0);
    g.add(blade);

    // Blade tip (tapered end)
    const tipGeo = new THREE.BufferGeometry();
    const tipVerts = new Float32Array([
      0,0,0,  0.14*scale,0,0,  0.14*scale, -0.04*scale,0,
      0,0, 0.018*scale,  0.14*scale,0, 0.018*scale,  0.14*scale,-0.04*scale, 0.018*scale
    ]);
    tipGeo.setAttribute('position', new THREE.BufferAttribute(tipVerts, 3));
    tipGeo.setIndex([0,1,2, 3,5,4, 0,3,1, 1,3,4, 1,4,2, 2,4,5]);
    tipGeo.computeVertexNormals();
    const tip = new THREE.Mesh(tipGeo, silMat.clone());
    tip.position.set(0.76*scale, 0.09*scale, 0);
    g.add(tip);

    // Thumb slide on top
    const thumbSlide = new THREE.Mesh(new THREE.BoxGeometry(0.12*scale, 0.10*scale, 0.22*scale), drkMat.clone());
    thumbSlide.position.set(-0.12*scale, 0.16*scale, 0);
    g.add(thumbSlide);

    // Clip on side
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.035*scale, 0.72*scale, 0.035*scale), silMat.clone());
    clip.position.set(-0.18*scale, 0, 0.12*scale);
    g.add(clip);

    g.userData.blade = blade;
    return g;
  }

  _buildRotary(scale = 1) {
    const g = new THREE.Group();
    const yelMat  = new THREE.MeshStandardMaterial({ color:0xffaa00, roughness:0.6 });
    const gryMat  = new THREE.MeshStandardMaterial({ color:0x666677, roughness:0.42, metalness:0.5 });
    const silMat  = new THREE.MeshStandardMaterial({ color:0xbbbbcc, roughness:0.18, metalness:0.9 });
    const blkMat  = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.6 });
    const drkMat  = new THREE.MeshStandardMaterial({ color:0x333344, roughness:0.7 });

    // Handle (long yellow cylinder)
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.095*scale, 0.10*scale, 0.85*scale, 18), yelMat.clone());
    handle.position.set(0, -0.525*scale, 0);
    g.add(handle);

    // Grip rings on handle
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.10*scale, 0.010*scale, 6, 18), drkMat.clone());
      ring.position.set(0, (-0.25 - i*0.16)*scale, 0); ring.rotation.x = Math.PI/2;
      g.add(ring);
    }

    // Adjustment collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.125*scale, 0.125*scale, 0.14*scale, 18), gryMat.clone());
    collar.position.set(0, -0.045*scale, 0);
    g.add(collar);

    // Main head (larger grey cylinder)
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.175*scale, 0.175*scale, 0.40*scale, 20), gryMat.clone());
    head.position.set(0, 0.255*scale, 0);
    g.add(head);

    // Blade ring inside head
    const bladeRing = new THREE.Mesh(new THREE.TorusGeometry(0.115*scale, 0.018*scale, 7, 22), silMat.clone());
    bladeRing.position.set(0, 0.32*scale, 0); bladeRing.rotation.x = Math.PI/2;
    g.add(bladeRing);

    // Front cap
    const frontCap = new THREE.Mesh(new THREE.CylinderGeometry(0.175*scale, 0.175*scale, 0.06*scale, 20), drkMat.clone());
    frontCap.position.set(0, 0.485*scale, 0);
    g.add(frontCap);

    // Wire entry port (dark hole in front)
    const port = new THREE.Mesh(new THREE.CylinderGeometry(0.060*scale, 0.060*scale, 0.10*scale, 14), blkMat.clone());
    port.position.set(0, 0.50*scale, 0);
    g.add(port);

    // Side knurling detail on head
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const knurl = new THREE.Mesh(new THREE.BoxGeometry(0.025*scale, 0.35*scale, 0.025*scale), drkMat.clone());
      knurl.position.set(Math.cos(angle)*0.175*scale, 0.255*scale, Math.sin(angle)*0.175*scale);
      g.add(knurl);
    }

    return g;
  }

  _buildStrippedWire(copperLength = 0.55, opts = {}) {
    const g = new THREE.Group();
    // High quality glossy insulation
    const insMat = new THREE.MeshStandardMaterial({
      color: opts.insColor || 0x1a1a2e,
      roughness: 0.35, metalness: 0.05,
      clearcoat: 0.8, clearcoatRoughness: 0.2
    });
    // High quality shiny copper
    const copMat = new THREE.MeshStandardMaterial({
      color: 0xd4893a, roughness: 0.15, metalness: 0.95,
      emissive: opts.glowCopper ? new THREE.Color(0xd4893a) : new THREE.Color(0),
      emissiveIntensity: opts.glowCopper ? 0.4 : 0,
    });

    const insLen = opts.insLen || 2.8;

    // Main insulated section
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, insLen, 24), insMat);
    ins.rotation.z = Math.PI/2; ins.position.x = -(insLen/2 + copperLength/2);
    g.add(ins);

    // Beveled insulation cut edge (small cone connecting insulation to copper)
    const bevel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.13, 0.08, 24), insMat);
    bevel.rotation.z = Math.PI/2; bevel.position.x = -(copperLength/2) - 0.04;
    g.add(bevel);

    // Main central copper core
    const copCore = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, copperLength, 20), copMat);
    copCore.rotation.z = Math.PI/2;
    g.add(copCore);

    // Stranded wire detail (tiny copper cylinders wrapping the core)
    for(let i=0; i<7; i++){
      const a = (i/7) * Math.PI * 2;
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, copperLength, 8), copMat);
      strand.rotation.z = Math.PI/2;
      // Position slightly outside the core radius
      strand.position.set(0, Math.cos(a)*0.060, Math.sin(a)*0.060);
      g.add(strand);
    }

    g.userData.copMesh = copCore; // Used by animations
    g.userData.copMat  = copMat;
    g.userData.insMat  = insMat;

    return g;
  }

  // ─── SCENE BUILDERS ──────────────────────────────────────────────

  _applyScene(step) {
    this._clearSceneObjs();
    if (!this._three) return;
    const sc = step.scene;

    // ── bench helpers ──────────────────────────────────────────────

    const placeToolOnBench = (toolGroup, x, yOff = 0) => {
      toolGroup.position.set(x, -0.38 + yOff, 0.2);
      toolGroup.rotation.set(0, 0, Math.PI/2);
      this._add(toolGroup);
    };

    const placeRotaryOnBench = (toolGroup, x, yOff = 0) => {
      toolGroup.position.set(x, -0.38 + yOff, 0.2);
      toolGroup.rotation.set(Math.PI/2, 0, 0);
      this._add(toolGroup);
    };

    // ── scenes ────────────────────────────────────────────────────

    if (sc === 'bench_clean') return;

    if (sc === 'bench_tools') {
      const g1 = this._buildManual(0.55);
      this._tagMeshes(g1, 'manual'); placeToolOnBench(g1, -2.8);
      const g2 = this._buildAutomatic(0.55);
      this._tagMeshes(g2, 'automatic'); placeToolOnBench(g2, -0.9);
      const g3 = this._buildKnife(0.55);
      this._tagMeshes(g3, 'knife'); placeToolOnBench(g3, 0.9);
      const g4 = this._buildRotary(0.55);
      this._tagMeshes(g4, 'rotary'); placeRotaryOnBench(g4, 2.8);
      return;
    }

    if (sc === 'all_tools') {
      TOOLS.forEach(tool => {
        let grp;
        if (tool.id === 'manual')    grp = this._buildManual(0.68);
        if (tool.id === 'automatic') grp = this._buildAutomatic(0.68);
        if (tool.id === 'knife')     grp = this._buildKnife(0.68);
        if (tool.id === 'rotary')    grp = this._buildRotary(0.68);
        this._tagMeshes(grp, tool.id);

        if (tool.id === 'rotary') {
          placeRotaryOnBench(grp, tool.x, 0.12);
        } else {
          placeToolOnBench(grp, tool.x, 0.12);
        }

        const sp = makeLabel(tool.hex, tool.name);
        sp.position.set(tool.x, 0.42, 0.2);
        this._add(sp);

        this._tsGroups.push(grp);
      });

      if (step.t === 'tselect') {
        this._tsActive = true;
        this._el.querySelector('#wsl-tap-hint').style.display = 'block';
      }
      return;
    }

    if (sc === 'show_manual') {
      const grp = this._buildManual(1.1);
      grp.position.set(0, 0, 0); grp.rotation.set(0.15, -0.5, 0);
      this._add(grp);
      const badge = this._el.querySelector('#wsl-tool-badge');
      this._el.querySelector('#wsl-badge-name').textContent = 'MANUAL STRIPPER';
      this._el.querySelector('#wsl-badge-tag').textContent  = 'AWG NOTCH SELECTION';
      badge.classList.add('show');
      this._animScene = 'float';
      this._animObjs  = { pivot: grp };
      return;
    }

    if (sc === 'show_automatic') {
      const grp = this._buildAutomatic(1.1);
      grp.position.set(0, 0.1, 0); grp.rotation.set(0.15, -0.5, 0);
      this._add(grp);
      const badge = this._el.querySelector('#wsl-tool-badge');
      this._el.querySelector('#wsl-badge-name').textContent = 'AUTOMATIC STRIPPER';
      this._el.querySelector('#wsl-badge-tag').textContent  = 'SELF-ADJUSTING JAWS';
      badge.classList.add('show');
      this._animScene = 'float';
      this._animObjs  = { pivot: grp };
      return;
    }

    if (sc === 'show_knife') {
      const grp = this._buildKnife(1.1);
      grp.position.set(0, 0, 0); grp.rotation.set(0.15, -0.5, 0);
      this._add(grp);
      const badge = this._el.querySelector('#wsl-tool-badge');
      this._el.querySelector('#wsl-badge-name').textContent = 'UTILITY KNIFE';
      this._el.querySelector('#wsl-badge-tag').textContent  = 'SCORE LENGTHWISE ONLY';
      badge.classList.add('show');
      this._animScene = 'float';
      this._animObjs  = { pivot: grp };
      return;
    }

    if (sc === 'show_rotary') {
      const grp = this._buildRotary(1.1);
      grp.position.set(0, 0, 0); grp.rotation.set(0.3, -0.4, 0);
      this._add(grp);
      const badge = this._el.querySelector('#wsl-tool-badge');
      this._el.querySelector('#wsl-badge-name').textContent = 'ROTARY STRIPPER';
      this._el.querySelector('#wsl-badge-tag').textContent  = 'CIRCULAR BLADE — RING CUT';
      badge.classList.add('show');
      this._animScene = 'float';
      this._animObjs  = { pivot: grp };
      return;
    }

    // ── ANIMATION SCENES ─────────────────────────────────────────

    if (sc === 'anim_manual' || sc === 'anim_automatic' || sc === 'anim_knife' || sc === 'anim_rotary') {
      const toolType = sc.replace('anim_', '');

      // Base wire
      const insMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.65 });
      const insBody = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 3.2, 20), insMat);
      insBody.rotation.z = Math.PI/2; insBody.position.set(-1.0, -0.35, 0);
      insBody.castShadow = true;
      this._add(insBody);

      // Sleeve (the part that gets pulled off)
      const sleeveMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.65, transparent:true, opacity:1 });
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 1.10, 20), sleeveMat);
      sleeve.rotation.z = Math.PI/2; sleeve.position.set(0.90, -0.35, 0);
      this._add(sleeve);

      // Copper (hidden initially)
      const copMat = new THREE.MeshStandardMaterial({
        color:0xb87333, roughness:0.22, metalness:0.85,
        emissive: new THREE.Color(0xb87333), emissiveIntensity:0,
        transparent:true, opacity:0,
      });
      const copper = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.10, 16), copMat);
      copper.rotation.z = Math.PI/2; copper.position.set(0.90, -0.35, 0);
      this._add(copper);

      // Copper end cap (always visible on left)
      const capMat = new THREE.MeshStandardMaterial({ color:0xb87333, roughness:0.22, metalness:0.85 });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 14), capMat);
      cap.rotation.z = Math.PI/2; cap.position.set(-2.67, -0.35, 0);
      this._add(cap);

      // Build tool
      let tool;
      if (toolType === 'manual')    { tool = this._buildManual(0.9); }
      if (toolType === 'automatic') { tool = this._buildAutomatic(0.9); }
      if (toolType === 'knife')     { tool = this._buildKnife(0.9); }
      if (toolType === 'rotary')    { tool = this._buildRotary(0.9); }

      // Initial tool position (above wire, ready to drop)
      if (toolType === 'rotary') {
        tool.rotation.set(Math.PI/2, 0, 0);
        tool.position.set(0.90, 1.8, 0);
      } else {
        tool.rotation.set(0, 0, Math.PI/2);
        tool.position.set(0.90, 1.8, 0);
      }
      this._add(tool);

      this._animScene = `strip_${toolType}`;
      this._animT = 0;
      this._animObjs = {
        tool,
        sleeve,
        sleeveMat,
        copper,
        copMat,
        armA: tool.userData.armA || null,
        armB: tool.userData.armB || null,
      };
      return;
    }

    // ── BAD METHOD SCENES ────────────────────────────────────────

    if (sc === 'bad_teeth') {
      const insMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.65 });
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 5.0, 20), insMat);
      wire.rotation.z = Math.PI/2; wire.position.set(0, -0.35, 0); wire.castShadow = true;
      this._add(wire);

      // Damage ring at bite point
      const dmgMat = new THREE.MeshStandardMaterial({ color:0x440000, roughness:0.9 });
      const dmg = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.18, 20), dmgMat);
      dmg.rotation.z = Math.PI/2; dmg.position.set(0, -0.35, 0);
      this._add(dmg);

      // Crushed section visual
      const crushMat = new THREE.MeshStandardMaterial({ color:0x331100, roughness:0.95 });
      const crush = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.10, 0.20), crushMat);
      crush.position.set(0, -0.35, 0);
      this._add(crush);

      // Warning indicator
      const warnSp = makeLabel('#ff4444', '⚠ NEVER DO THIS');
      warnSp.scale.set(1.1, 0.38, 1); warnSp.position.set(0, 0.28, 0);
      this._add(warnSp);
      return;
    }

    if (sc === 'bad_crush') {
      const insMat = new THREE.MeshStandardMaterial({ color:0x2255bb, roughness:0.65 });
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 4.8, 20), insMat);
      wire.rotation.z = Math.PI/2; wire.position.set(0, -0.35, 0); wire.castShadow = true;
      this._add(wire);

      // Crushed/flattened section
      const crushMat = new THREE.MeshStandardMaterial({ color:0x1a3a88, roughness:0.85 });
      const crush = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.08, 0.22, 12), crushMat);
      crush.rotation.z = Math.PI/2; crush.scale.y = 0.45; crush.position.set(0.3, -0.35, 0);
      this._add(crush);

      // Copper strands (damaged — red highlight)
      const strandMat = new THREE.MeshStandardMaterial({ color:0xdd3300, roughness:0.5, emissive:new THREE.Color(0x440000), emissiveIntensity:0.5 });
      for (let i = 0; i < 5; i++) {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 6), strandMat.clone());
        s.rotation.z = Math.PI/2; s.position.set(0.3, -0.35 + (i-2)*0.025, (i-2)*0.018);
        this._add(s);
      }

      const warnSp = makeLabel('#ff4444', '⚠ WRONG NOTCH');
      warnSp.scale.set(1.1, 0.38, 1); warnSp.position.set(0, 0.28, 0);
      this._add(warnSp);
      return;
    }

    if (sc === 'bad_nick') {
      const insMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.65 });
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 3.2, 20), insMat);
      ins.rotation.z = Math.PI/2; ins.position.set(-0.85, -0.35, 0); ins.castShadow = true;
      this._add(ins);

      // Copper section
      const copMat = new THREE.MeshStandardMaterial({ color:0xb87333, roughness:0.22, metalness:0.85 });
      const cop = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.0, 16), copMat);
      cop.rotation.z = Math.PI/2; cop.position.set(0.75, -0.35, 0);
      this._add(cop);

      // Nick mark (dark groove)
      const nickMat = new THREE.MeshStandardMaterial({ color:0x550000, roughness:0.9, emissive:new THREE.Color(0x220000), emissiveIntensity:0.5 });
      const nick = new THREE.Mesh(new THREE.TorusGeometry(0.067, 0.020, 6, 16), nickMat);
      nick.rotation.y = Math.PI/2; nick.position.set(0.38, -0.35, 0);
      this._add(nick);

      // Highlight on nick
      const nickGlow = new THREE.PointLight(0xff2200, 2.0, 0.5);
      nickGlow.position.set(0.38, -0.35, 0);
      this._add(nickGlow);

      const warnSp = makeLabel('#ff4444', '⚠ NICKED COPPER');
      warnSp.scale.set(1.1, 0.38, 1); warnSp.position.set(0, 0.28, 0);
      this._add(warnSp);
      return;
    }

    if (sc === 'good_strip') {
      const insMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.65 });
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 3.2, 20), insMat);
      ins.rotation.z = Math.PI/2; ins.position.set(-0.9, -0.35, 0); ins.castShadow = true;
      this._add(ins);

      const copMat = new THREE.MeshStandardMaterial({ color:0xb87333, roughness:0.22, metalness:0.85, emissive:new THREE.Color(0x442200), emissiveIntensity:0.35 });
      const cop = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.72, 16), copMat);
      cop.rotation.z = Math.PI/2; cop.position.set(0.58, -0.35, 0);
      this._add(cop);

      // Clean edge ring (green)
      const edgeMat = new THREE.MeshStandardMaterial({ color:0x2dc653, roughness:0.5, emissive:new THREE.Color(0x2dc653), emissiveIntensity:0.6 });
      const edge = new THREE.Mesh(new THREE.TorusGeometry(0.133, 0.012, 8, 20), edgeMat);
      edge.rotation.y = Math.PI/2; edge.position.set(0.22, -0.35, 0);
      this._add(edge);

      const goodLight = new THREE.PointLight(0x2dc653, 1.5, 1.2);
      goodLight.position.set(0.58, -0.2, 0);
      this._add(goodLight);

      const goodSp = makeLabel('#2dc653', '✓ CORRECT STRIP');
      goodSp.scale.set(1.1, 0.38, 1); goodSp.position.set(0, 0.28, 0);
      this._add(goodSp);
      return;
    }

    // ── QUALITY CHECK SCENES ────────────────────────────────────

    if (sc === 'quality_nick') {
      const w = this._buildStrippedWire(0.65);
      w.position.set(0.35, -0.35, 0); this._add(w);
      // Nick ring
      const nickMat = new THREE.MeshStandardMaterial({ color:0x550000, roughness:0.9, emissive:new THREE.Color(0x330000), emissiveIntensity:0.6 });
      const nick = new THREE.Mesh(new THREE.TorusGeometry(0.067, 0.022, 6, 16), nickMat);
      nick.rotation.y = Math.PI/2; nick.position.set(0.35, -0.35, 0);
      this._add(nick);
      const light = new THREE.PointLight(0xff2200, 1.5, 0.7);
      light.position.set(0.35, -0.2, 0); this._add(light);
      const qb = this._el.querySelector('#wsl-quality-badge');
      qb.textContent = 'FAIL ✗'; qb.className = 'wsl-quality-badge fail';
      return;
    }

    if (sc === 'quality_long') {
      const w = this._buildStrippedWire(1.8, { insLen: 1.6 });
      w.position.set(0.65, -0.35, 0); this._add(w);
      // Danger glow on excess copper
      const dangLight = new THREE.PointLight(0xff4400, 1.2, 1.5);
      dangLight.position.set(0.65, -0.25, 0); this._add(dangLight);
      this._animScene = 'quality_pulse_red';
      this._animObjs  = { mat: w.userData.copMat };
      const qb = this._el.querySelector('#wsl-quality-badge');
      qb.textContent = 'FAIL ✗'; qb.className = 'wsl-quality-badge fail';
      return;
    }

    if (sc === 'quality_ragged') {
      const insMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.65 });
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.8, 20), insMat);
      ins.rotation.z = Math.PI/2; ins.position.set(-0.65, -0.35, 0);
      this._add(ins);
      const copMat = new THREE.MeshStandardMaterial({ color:0xb87333, roughness:0.22, metalness:0.85 });
      const cop = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.65, 16), copMat);
      cop.rotation.z = Math.PI/2; cop.position.set(0.58, -0.35, 0);
      this._add(cop);
      // Ragged edge pieces (uneven torn insulation)
      const ragMat = new THREE.MeshStandardMaterial({ color:0x2a2a3a, roughness:0.9 });
      const offsets = [0.10, -0.08, 0.13, -0.05, 0.09];
      offsets.forEach((dy, i) => {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.05), ragMat.clone());
        piece.position.set(0.22, -0.35 + dy, (i-2)*0.04); piece.rotation.z = dy;
        this._add(piece);
      });
      const warnSp = makeLabel('#ff8800', '⚠ RAGGED EDGE');
      warnSp.scale.set(1.0, 0.36, 1); warnSp.position.set(0, 0.26, 0);
      this._add(warnSp);
      const qb = this._el.querySelector('#wsl-quality-badge');
      qb.textContent = 'FAIL ✗'; qb.className = 'wsl-quality-badge fail';
      return;
    }

    if (sc === 'quality_good') {
      const w = this._buildStrippedWire(0.70, { glowCopper:true });
      w.position.set(0.35, -0.35, 0); this._add(w);
      // Clean edge ring
      const edgeMat = new THREE.MeshStandardMaterial({ color:0x2dc653, roughness:0.5, emissive:new THREE.Color(0x2dc653), emissiveIntensity:0.55 });
      const edge = new THREE.Mesh(new THREE.TorusGeometry(0.133, 0.012, 8, 20), edgeMat);
      edge.rotation.y = Math.PI/2; edge.position.set(0.35, -0.35, 0);
      this._add(edge);
      const goodLight = new THREE.PointLight(0x2dc653, 1.4, 1.4);
      goodLight.position.set(0.35, -0.22, 0.3); this._add(goodLight);
      const qb = this._el.querySelector('#wsl-quality-badge');
      qb.textContent = 'PASS ✓'; qb.className = 'wsl-quality-badge pass';
      this._animScene = 'quality_pulse_green';
      this._animObjs  = { mat: w.userData.copMat };
      return;
    }
  }

  // ─── ANIMATION UPDATE ─────────────────────────────────────────────

  _updateThree() {
    if (!this._three) return;
    const { camera, lamp } = this._three;
    const now = performance.now() * 0.001;
    const dt  = Math.min(now - this._lastTime, 0.05);
    this._lastTime = now;

    // Camera lerp
    const step    = STEPS[this._step];
    const camCfg  = step.cam;
    this._camPos.lerp(new THREE.Vector3(...camCfg.p), 0.044);
    this._camTarget.lerp(new THREE.Vector3(...camCfg.t), 0.044);
    camera.position.copy(this._camPos);
    camera.lookAt(this._camTarget);

    lamp.intensity = 1.6 + Math.sin(now * 4.0) * 0.08;

    // Drop physics
    for (const obj of this._dropObjs) {
      const dist = obj.mesh.position.y - obj.target;
      if (Math.abs(dist) < 0.008 && Math.abs(obj.vel) < 0.002) {
        obj.mesh.position.y = obj.target;
      } else {
        obj.vel += -0.018 * dist - 0.18 * obj.vel;
        obj.mesh.position.y += obj.vel;
      }
    }

    // Sparks
    this._sparks = this._sparks.filter(s => {
      s.life -= 0.025;
      if (s.life <= 0) { this._three.scene.remove(s.mesh); return false; }
      s.vel.y -= 0.005;
      s.mesh.position.addScaledVector(s.vel, 1);
      s.mesh.material.opacity = s.life;
      return true;
    });

    // Animation scenes
    if (this._animScene === 'float') {
      const pivot = this._animObjs.pivot;
      if (pivot) pivot.rotation.y = Math.sin(now * 0.55) * 0.35;
    }

    if (this._animScene && this._animScene.startsWith('strip_')) {
      this._animT = (this._animT + dt * 0.22) % 1;
      this._updateStripAnim(this._animT);
    }

    if (this._animScene === 'quality_pulse_red') {
      const mat = this._animObjs.mat;
      if (mat) { mat.emissive = new THREE.Color(0xff2200); mat.emissiveIntensity = 0.3 + Math.sin(now * 3.5) * 0.25; }
    }

    if (this._animScene === 'quality_pulse_green') {
      const mat = this._animObjs.mat;
      if (mat) { mat.emissiveIntensity = 0.3 + Math.sin(now * 2.0) * 0.18; }
    }

    // Tool selection: gentle bob on bench tools
    for (const grp of this._tsGroups) {
      if (grp) grp.position.y = -0.26 + Math.sin(now * 1.2 + grp.position.x * 0.8) * 0.025;
    }
  }

  _updateStripAnim(t) {
    const { tool, sleeve, sleeveMat, copper, copMat, armA, armB } = this._animObjs;
    if (!tool) return;

    const toolType = this._animScene.replace('strip_', '');

    if (t < 0.35) {
      // Phase 1: approach — tool drops from above
      const p = easeInOut(t / 0.35);
      tool.position.y = THREE.MathUtils.lerp(1.8, 0.12, p);
      tool.position.x = 0.90;
      if (sleeveMat) sleeveMat.opacity = 1;
      if (copMat)    copMat.opacity    = 0;
      if (armA)      armA.rotation.z   = 0.32;
      if (armB)      armB.rotation.z   = -0.32;

    } else if (t < 0.52) {
      // Phase 2: grip — jaws close (or trigger squeeze)
      const p = easeInOut((t - 0.35) / 0.17);
      tool.position.y = 0.12;
      if (armA)  armA.rotation.z = THREE.MathUtils.lerp(0.32, 0.055, p);
      if (armB)  armB.rotation.z = THREE.MathUtils.lerp(-0.32, -0.055, p);
      // Rotary: start rotating
      if (toolType === 'rotary') tool.rotation.z = p * Math.PI * 2;
      if (toolType === 'automatic' && tool.userData.trigger) {
        tool.userData.trigger.rotation.z = THREE.MathUtils.lerp(0.18, 0.55, p);
      }

    } else if (t < 0.82) {
      // Phase 3: pull — tool slides right, sleeve follows and fades out
      const p = easeInOut((t - 0.52) / 0.30);
      const slide = p * 1.55;
      tool.position.x   = 0.90 + slide;
      tool.position.y   = 0.12;
      if (sleeve)        sleeve.position.x = 0.90 + slide;
      if (sleeveMat)     sleeveMat.opacity  = 1 - easeInOut(p);
      if (copMat)        copMat.opacity     = easeInOut(p);
      if (toolType === 'rotary') tool.rotation.z = Math.PI * 2 + p * Math.PI * 4;
      if (toolType === 'knife') { tool.rotation.set(0, 0, Math.PI/2 - 0.25); }

    } else {
      // Phase 4: reveal — show copper glow, then reset
      const p = (t - 0.82) / 0.18;
      if (copMat) {
        copMat.opacity = 1;
        copMat.emissiveIntensity = 0.4 + Math.sin(p * Math.PI * 4) * 0.3;
      }
      if (t > 0.96) {
        // reset for next cycle
        tool.position.set(0.90, 1.8, 0);
        if (sleeve) sleeve.position.x = 0.90;
        if (armA)   armA.rotation.z   = 0.32;
        if (armB)   armB.rotation.z   = -0.32;
        if (toolType === 'rotary')      tool.rotation.set(Math.PI/2, 0, 0);
        else                            tool.rotation.set(0, 0, Math.PI/2);
        if (toolType === 'automatic' && tool.userData.trigger)
          tool.userData.trigger.rotation.z = 0.18;
        this._animT = 0;
      }
    }
  }

  _spawnSparks(origin) {
    if (!this._three) return;
    for (let i = 0; i < 14; i++) {
      const mat  = new THREE.MeshBasicMaterial({
        color:[0xffcc00,0xff8800,0xffffff][i%3], transparent:true, opacity:1
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.030, 4, 4), mat);
      mesh.position.copy(origin);
      this._three.scene.add(mesh);
      this._sparks.push({
        mesh, life: 0.65 + Math.random()*0.5,
        vel: new THREE.Vector3((Math.random()-0.5)*0.09, 0.05+Math.random()*0.09, (Math.random()-0.5)*0.09)
      });
    }
  }

  _showFeedback(emoji) {
    const fb = this._el.querySelector('#wsl-feedback');
    this._el.querySelector('#wsl-fb').textContent = emoji;
    fb.classList.add('show');
    setTimeout(() => fb.classList.remove('show'), 820);
  }

  // ─── TOOL SELECT LOGIC ────────────────────────────────────────────

  _onToolTap(toolId, hitPoint) {
    if (!this._tsActive || this._tsAnswered) return;
    const step = STEPS[this._step];
    if (step.t !== 'tselect') return;
    const correct = T_SELECT[step.qIdx].a;
    this._tsAnswered = true;
    this._tsActive   = false;
    this._el.querySelector('#wsl-tap-hint').style.display = 'none';

    const resultEl = this._el.querySelector('.wsl-ts-result');
    const toolName = TOOLS.find(t => t.id === toolId)?.name || toolId.toUpperCase();
    const corrName = TOOLS.find(t => t.id === correct)?.name || correct.toUpperCase();

    if (toolId === correct) {
      this._showFeedback('✅');
      this._spawnSparks(hitPoint);
      if (resultEl) { resultEl.textContent = `✓ Correct! ${corrName} is the right choice.`; resultEl.className = 'wsl-ts-result ok'; }
    } else {
      this._showFeedback('❌');
      if (resultEl) { resultEl.textContent = `✗ Incorrect. The right tool is the ${corrName}.`; resultEl.className = 'wsl-ts-result fail'; }
    }

    setTimeout(() => { this._el.querySelector('#wsl-next').disabled = false; }, 500);
  }

  // ─── MCQ QUIZ LOGIC ───────────────────────────────────────────────

  _renderQuiz(qi) {
    const q   = QUIZ[qi];
    const dlg = this._el.querySelector('#wsl-dialog');
    const pct = Math.round((this._step / (STEPS.length - 1)) * 100);
    dlg.innerHTML = `
      <div class="wsl-quiz-area">
        <p class="wsl-quiz-q">${q.q}</p>
        <div class="wsl-quiz-opts">
          ${q.opts.map((o, i) => `<button class="wsl-opt" data-idx="${i}">${o}</button>`).join('')}
        </div>
        <div class="wsl-quiz-hint" id="wsl-quiz-hint">${q.hint}</div>
      </div>
      <div class="wsl-progress-row">
        <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog" style="width:${pct}%"></div></div>
        <span class="wsl-prog-pct" id="wsl-pct">${pct}%</span>
      </div>`;
    dlg.querySelectorAll('.wsl-opt').forEach(btn => {
      btn.addEventListener('click', () => this._onQuizAnswer(qi, parseInt(btn.dataset.idx)));
    });
  }

  _onQuizAnswer(qi, chosen) {
    if (this._quizDone) return;
    const q    = QUIZ[qi];
    const btns = this._el.querySelectorAll('.wsl-opt');
    btns.forEach((b, i) => {
      b.style.pointerEvents = 'none';
      if (i === q.a) b.classList.add('correct');
      else if (i === chosen) b.classList.add('wrong');
    });
    if (chosen === q.a) {
      this._showFeedback('✅');
      this._quizDone = true;
      this._el.querySelector('#wsl-next').disabled = false;
    } else {
      this._showFeedback('❌');
      const hint = this._el.querySelector('#wsl-quiz-hint');
      if (hint) hint.classList.add('show');
      setTimeout(() => {
        this._quizDone = true;
        this._el.querySelector('#wsl-next').disabled = false;
      }, 900);
    }
  }

  // ─── UI RENDER ────────────────────────────────────────────────────

  _render() {
    const step  = STEPS[this._step];
    const total = STEPS.length;
    const pct   = Math.round((this._step / (total - 1)) * 100);

    this._el.querySelector('#wsl-ch-lbl').textContent  = step.chLbl || '';
    this._el.querySelector('#wsl-step-num').textContent = `${this._step + 1}/${total}`;

    const dots = this._el.querySelector('#wsl-dots');
    dots.innerHTML = STEPS.map((_, i) => {
      const cls = i < this._step ? 'done' : i === this._step ? 'active' : '';
      return `<div class="wsl-dot ${cls}"></div>`;
    }).join('');

    const nextBtn = this._el.querySelector('#wsl-next');
    const prevBtn = this._el.querySelector('#wsl-prev');
    prevBtn.style.visibility = this._step === 0 ? 'hidden' : 'visible';

    if (step.t === 'quiz') {
      this._quizDone = false;
      nextBtn.disabled = true;
      nextBtn.textContent = 'NEXT →';
      this._renderQuiz(step.qi);
      return;
    }

    if (step.t === 'tselect') {
      this._tsAnswered = false;
      nextBtn.disabled = true;
      nextBtn.textContent = 'NEXT →';
      const sc  = T_SELECT[step.qIdx];
      const dlg = this._el.querySelector('#wsl-dialog');
      dlg.innerHTML = `
        <div class="wsl-ts-area">
          <div class="wsl-ts-label">SCENARIO ${step.qIdx + 1} / 5</div>
          <p class="wsl-ts-q">${sc.q}</p>
          <div class="wsl-ts-hint">👆 TAP THE CORRECT TOOL ON THE BENCH</div>
          <div class="wsl-ts-result"></div>
        </div>
        <div class="wsl-progress-row">
          <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog" style="width:${pct}%"></div></div>
          <span class="wsl-prog-pct" id="wsl-pct">${pct}%</span>
        </div>`;
      this._tsActive = true;
      this._el.querySelector('#wsl-tap-hint').style.display = 'block';
      return;
    }

    // Standard bubble mode
    if (!this._el.querySelector('#wsl-bubble')) {
      this._el.querySelector('#wsl-dialog').innerHTML = `
        <div class="wsl-bubble" id="wsl-bubble">
          <img src="/Mascot.png" class="wsl-avatar" id="wsl-avatar" alt="Volt"/>
          <div class="wsl-bubble-content">
            <div class="wsl-bubble-name">VOLT
              <div class="wsl-wave"><span></span><span></span><span></span></div>
            </div>
            <p class="wsl-bubble-text" id="wsl-text"></p>
            <div class="wsl-bubble-tap" id="wsl-bubble-tap">TAP TO CONTINUE »</div>
          </div>
        </div>
        <div class="wsl-progress-row">
          <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog"></div></div>
          <span class="wsl-prog-pct" id="wsl-pct"></span>
        </div>`;
      this._el.querySelector('#wsl-bubble-tap').addEventListener('click', () => this._onNext());
    }

    this._el.querySelector('#wsl-text').textContent  = step.text || '';
    this._el.querySelector('#wsl-prog').style.width  = pct + '%';
    this._el.querySelector('#wsl-pct').textContent   = pct + '%';

    nextBtn.disabled    = false;
    nextBtn.textContent = step.btn || 'NEXT →';
    this._el.querySelector('#wsl-bubble-tap').style.display = step.btn ? 'none' : 'block';

    const avatar = this._el.querySelector('#wsl-avatar');
    if (avatar) {
      if (step.mascotIn) {
        avatar.classList.remove('entered');
        requestAnimationFrame(() => requestAnimationFrame(() => avatar.classList.add('entered')));
      } else {
        avatar.classList.add('entered');
      }
    }
  }

  // ─── NAVIGATION ───────────────────────────────────────────────────

  _gotoStep(n) {
    this._step = Math.max(0, Math.min(STEPS.length - 1, n));
    const step = STEPS[this._step];
    this._applyScene(step);
    this._render();
  }

  _onNext() {
    const step = STEPS[this._step];
    if (step.t === 'done') {
      Database.completeLesson('wireStripping');
      this.state.setState('wireLearn');
      return;
    }
    if (this._step < STEPS.length - 1) this._gotoStep(this._step + 1);
  }

  _onPrev() {
    if (this._step > 0) this._gotoStep(this._step - 1);
  }

  // ─── LIFECYCLE ────────────────────────────────────────────────────

  onShow() {
    this._step   = 0;
    this._animT  = 0;
    this._sparks = [];
    this._camPos.set(0, 2.5, 7.5);
    this._camTarget.set(0, -0.3, 0);
    this._render();
    setTimeout(() => {
      this._initThree();
      if (this._three) {
        const step = STEPS[this._step];
        this._applyScene(step);
      } else {
        setTimeout(() => { this._applyScene(STEPS[this._step]); }, 200);
      }
    }, 80);
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
    this._animScene = null;
  }
}

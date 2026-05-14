import * as THREE from 'three';
import { buildWorkbench, buildLightingRig } from './WorkbenchBuilder.js';
import { Database } from '../systems/Database.js';

// ══════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════

const QUIZ = [
  { q:'What is fish tape used for?',
    opts:['Measuring wire resistance','Threading wire through installed conduit','Bending wire into terminal hooks','Cutting conduit to length'],
    a:1, vis:'fishtape',
    hint:'Fish tape is pushed through conduit first, then wire is attached to the end and pulled back through.' },
  { q:'An electrician switches off the breaker. Before touching exposed conductors they should:',
    opts:['Proceed — breaker off means no power','Test with a voltage tester first','Check the wire color only','Use rubber gloves only'],
    a:1, vis:'tester',
    hint:'The breaker being off is not enough — always verify with a voltage tester before touching any conductor.' },
  { q:'A crowded junction box needs wires bent into tight loops. The best tool is:',
    opts:["Lineman's pliers — wider jaw","Long nose pliers — narrow jaw fits tight spaces",'Diagonal cutters — cut the excess','Conduit bender — bends the wire'],
    a:1, vis:'longnose',
    hint:"Long nose pliers have a narrow tapered jaw that reaches into tight spaces where lineman's cannot fit." },
  { q:'A screwdriver has a visible crack in its insulated handle. You should:',
    opts:['Tape it up and continue','Use it only on low-voltage work','Replace it immediately','Wrap with electrical tape'],
    a:2, vis:'flathead',
    hint:'A damaged handle offers no insulation protection between your hand and a live conductor. Replace immediately.' },
  { q:'You suspect a wire break inside insulation with no visible damage. Which tool finds it?',
    opts:['Voltage tester — checks for live voltage','Fish tape — locates breaks mechanically','Multimeter in continuity mode — beeps when connected','Measuring tape — confirms wire length'],
    a:2, vis:'multimeter',
    hint:'Multimeter continuity mode sends a tiny test signal — no beep means the circuit path is broken.' },
  { q:'Which tool bends rigid metal conduit to an accurate angle?',
    opts:["Lineman's pliers — strong enough to force it",'Conduit bender — built specifically for this','Long nose pliers — precise control','Measuring tape — guides the bend angle'],
    a:1, vis:'conduitbender',
    hint:"The conduit bender's curved head and angle markings ensure accurate kink-free bends every time." },
];

const TOOL_DEFS = [
  { id:'lineman',       name:"LINEMAN'S PLIERS",    col:0xcc2222, row:0, xi:0, displayRz:0         },
  { id:'dykes',         name:'DIAGONAL CUTTERS',    col:0x3355aa, row:0, xi:1, displayRz:0         },
  { id:'knife',         name:'UTILITY KNIFE',        col:0x555566, row:0, xi:2, displayRz:0         },
  { id:'longnose',      name:'LONG NOSE PLIERS',    col:0x888888, row:0, xi:3, displayRz:0         },
  { id:'conduitbender', name:'CONDUIT BENDER',      col:0x884400, row:0, xi:4, displayRz:0         },
  { id:'flathead',      name:'FLATHEAD SCREWDRIVER',col:0xffaa22, row:0, xi:5, displayRz:Math.PI/2 },
  { id:'phillips',      name:'PHILLIPS SCREWDRIVER',col:0xff8800, row:1, xi:0, displayRz:Math.PI/2 },
  { id:'tape',          name:'ELECTRICAL TAPE',     col:0x111111, row:1, xi:1, displayRz:0         },
  { id:'tester',        name:'VOLTAGE TESTER',      col:0xffee00, row:1, xi:2, displayRz:Math.PI/2 },
  { id:'multimeter',    name:'MULTIMETER',           col:0x333333, row:1, xi:3, displayRz:0         },
  { id:'fishtape',      name:'FISH TAPE',            col:0xff6600, row:1, xi:4, displayRz:0         },
  { id:'measuringtape', name:'MEASURING TAPE',      col:0xffcc00, row:1, xi:5, displayRz:0         },
];

const STEPS = [
  // ── Intro ──────────────────────────────────────────────────
  { t:'info', scene:'bench_clean',
    chLbl:'INTRO', title:"ELECTRICIAN'S TOOLS",
    text:"Every professional electrician carries a core set of hand tools. Not any tools — the right tools. This lesson covers the 12 essential tools used in Philippine electrical work. What they do, how to use them, and how to stay safe.", btn:'START →' },
  { t:'info', scene:'all_tools',
    chLbl:'OVERVIEW', title:'12 ESSENTIAL TOOLS',
    text:"Six categories:\n✦ Cutting — wire and conduit\n✦ Gripping — bending and holding\n✦ Fastening — terminals and fittings\n✦ Testing — safety and fault-finding\n✦ Measuring — accurate runs\n✦ Protection — electrical tape", btn:"LET'S START →" },

  // ── Ch1 Cutting ────────────────────────────────────────────
  { t:'chap', scene:'cutting_group', ch:1, chLbl:'CH.1 CUTTING', title:'CUTTING TOOLS',
    text:'Three cutting tools. Each built for a different job. Using the wrong cutter damages the conductor and creates a hidden failure point.' },
  { t:'tool', scene:'show_lineman', chLbl:'CH.1 CUTTING', toolName:"LINEMAN'S PLIERS",
    about:"The workhorse of Philippine electrical work. Heavy-duty jaws with a cutter notch near the pivot — twists wires, cuts conductors, and pulls stubborn wire through conduit.",
    features:[['✂','Cuts AWG 8–12'],['⟳','Wire Twisting'],['🛡','VDE 1000V']],
    howTo:['Grip the wire firmly in the serrated jaw.','Twist both handles together to join conductors.','Use the cutter notch near the pivot to shear thick wire.'],
    tip:'Always twist clockwise when joining conductors — it creates a tighter, more secure splice.' },
  { t:'tool', scene:'show_dykes', chLbl:'CH.1 CUTTING', toolName:'DIAGONAL CUTTERS',
    about:"Angled jaws cut flush against a surface. Where lineman's leave a stub, diagonal cutters snip right at the terminal — essential for clean, professional finishes.",
    features:[['→','Flush Cut'],['🎯','Tight Spaces'],['✂','AWG 14–22']],
    howTo:['Position the angled jaw flat against the work surface.','Squeeze handles firmly to shear the wire.','Trim zip ties by cutting at the base for a clean finish.'],
    tip:'The diagonal edge cuts cleaner than straight jaws — less fraying, less chance of a resistance hot spot.' },
  { t:'tool', scene:'show_knife', chLbl:'CH.1 CUTTING', toolName:'UTILITY KNIFE',
    about:"For scoring cable jackets only — not individual conductors. Score LENGTHWISE along the jacket. A circular score almost always nicks a conductor inside.",
    features:[['|','Score Only'],['↩','Retractable'],['⚠','Away From Body']],
    howTo:['Extend the blade to a safe scoring length.','Score lengthwise along the outer jacket only.','Bend the cable to open the score and peel the jacket back.'],
    tip:'Never score in a ring around the cable — the blade will nick conductors below the jacket surface.' },

  // ── Ch2 Gripping ───────────────────────────────────────────
  { t:'chap', scene:'gripping_group', ch:2, chLbl:'CH.2 GRIPPING', title:'GRIPPING TOOLS',
    text:'Two specialized gripping tools — one for precision detail work, one for bending rigid conduit into precise angles.' },
  { t:'tool', scene:'show_longnose', chLbl:'CH.2 GRIPPING', toolName:'LONG NOSE PLIERS',
    about:"Long tapered jaws reach into tight spaces lineman's cannot. Bends terminal hooks at wire ends and positions wires in crowded junction boxes.",
    features:[['↔','Tight Reach'],['⌒','Hook Bending'],['◆','Precise Grip']],
    howTo:['Grip the wire near the end using the tapered jaws.','Bend slowly and steadily to the desired angle.','Form a J-hook for screw terminal connections.'],
    tip:'Use smooth, controlled movements — the narrow jaws can crimp soft copper if you force it.' },
  { t:'tool', scene:'show_conduitbender', chLbl:'CH.2 GRIPPING', toolName:'CONDUIT BENDER',
    about:"Bends rigid EMT conduit to accurate angles. Angle markers (22.5°, 45°, 90°) guide every bend. The foot step applies consistent downward pressure without kinking.",
    features:[['📐','Angle Marks'],['⚙','No Kinks'],['⬇','Foot Step']],
    howTo:['Hook the head over the conduit at the bend mark.','Apply firm, steady pressure on the foot step.','Watch the angle markers — release exactly at your target.'],
    tip:'Never force a bend by hand — kinking creates a stress point and restricts wire pull-through permanently.' },

  // ── Ch3 Fastening ──────────────────────────────────────────
  { t:'chap', scene:'fastening_group', ch:3, chLbl:'CH.3 FASTENING', title:'FASTENING TOOLS',
    text:'Screwdrivers tighten terminal lugs, secure outlet screws, and adjust panel breakers. The right tip type protects both the screw head and your safety.' },
  { t:'tool', scene:'show_flathead', chLbl:'CH.3 FASTENING', toolName:'FLATHEAD SCREWDRIVER',
    about:"Most electrical terminal screws in Philippine outlets, switches, and circuit breakers are slotted. The tip must fit exactly — too narrow and it slips, risking a dangerous arc flash.",
    features:[['—','Slotted Tip'],['⚡','Panel Ready'],['🛡','VDE Handle']],
    howTo:['Match the tip width exactly to the slot — no wider, no narrower.','Apply firm downward pressure while turning.','Tighten until snug — overtightening cracks plastic terminals.'],
    tip:'A slipping screwdriver causes arc flash. Always match tip width to the slot before applying torque.' },
  { t:'tool', scene:'show_phillips', chLbl:'CH.3 FASTENING', toolName:'PHILLIPS SCREWDRIVER',
    about:"Cross-shaped tip for Phillips screws common on boxes, fixtures, and cover plates. Self-centers on the head — safer near live parts than a flathead.",
    features:[['✚','Cross Tip'],['🎯','Self-Centers'],['📦','Box Mount']],
    howTo:['Align the cross tip with the screw head — it will seat automatically.','Apply downward pressure and rotate.','Match tip size (#1, #2, #3) to the screw head size.'],
    tip:'Wrong tip size damages the head. If the tip feels loose in the cross, switch to the correct size immediately.' },

  // ── Ch4 Testing & Measuring ────────────────────────────────
  { t:'chap', scene:'testing_group', ch:4, chLbl:'CH.4 TESTING', title:'TESTING & MEASURING',
    text:'Testing tools separate a safe electrician from a dangerous one. Touch these before touching any conductor.' },
  { t:'tool', scene:'show_tester', chLbl:'CH.4 TESTING', toolName:'VOLTAGE TESTER',
    about:"Non-contact voltage tester — detects AC voltage through insulation without touching bare wire. The LED and beep fire the moment it senses a live field. The most critical safety tool in any kit.",
    features:[['🔴','NCV Sensor'],['🔔','Beep Alert'],['🛡','No Contact']],
    howTo:['Hold the tip near the wire or outlet without touching.','A beep + red LED means voltage is present — do not touch.','Always test every wire, even after the breaker is confirmed off.'],
    tip:'Test on a known live outlet first to confirm the tester works. A dead tester is a silent danger.' },
  { t:'tool', scene:'show_multimeter', chLbl:'CH.4 TESTING', toolName:'MULTIMETER',
    about:"Measures voltage, current, and resistance. Most-used: AC voltage (220V outlets), continuity (unbroken wire), and resistance (motor windings and loose connections).",
    features:[['V','Voltage'],['~','Continuity'],['Ω','Resistance']],
    howTo:['Turn the dial to the correct function (V, continuity, Ω).','Connect probes: BLACK to COM, RED to measurement port.','Read the display — a beep in continuity mode means unbroken circuit.'],
    tip:'In voltage mode, connect the BLACK probe first to avoid a short circuit on first contact.' },
  { t:'tool', scene:'show_fishtape', chLbl:'CH.4 TESTING', toolName:'FISH TAPE',
    about:"Long flexible steel tape coiled on a reel. Pushed through installed conduit first — navigating bends — then wire is hooked to the end and pulled back through.",
    features:[['🌀','Reel Feed'],['↩','Hook End'],['💧','Lube Compatible']],
    howTo:['Push the tape into the conduit, navigate bends from the far end.','Attach wire to the hooked end at the far opening.','Wind the reel handle to pull the wire back through.'],
    tip:'Apply wire pulling lubricant on runs over 5m — it prevents conductor jacket damage from friction heat.' },
  { t:'tool', scene:'show_measuringtape', chLbl:'CH.4 TESTING', toolName:'MEASURING TAPE',
    about:"For planning conduit runs, locating boxes, and cutting wire to length. Always add 15–20% extra — a too-short wire means splicing inside a wall, which is a code violation.",
    features:[['📏','Accurate'],['📌','Box Locate'],['➕','Add 15–20%']],
    howTo:['Extend and lock the blade at the required measurement.','Mark the conduit or wire at the cut length.','Add 15–20% extra for routing bends and terminal tails.'],
    tip:'Measure in straight lines, then add for every bend. Short wire in conduit cannot be extended — ever.' },

  // ── Ch5 Protection ─────────────────────────────────────────
  { t:'chap', scene:'show_tape', ch:5, chLbl:'CH.5 PROTECTION', title:'ELECTRICAL TAPE',
    text:'The final protection layer — used in almost every connection to ensure nothing remains exposed.' },
  { t:'tool', scene:'show_tape', chLbl:'CH.5 PROTECTION', toolName:'ELECTRICAL TAPE',
    about:"Vinyl insulating tape rated 600V and 80°C. Stretchy enough to conform to wire shapes without gaps. Overlap half the tape width on each wrap — no gaps, no exposed copper.",
    features:[['⚡','600V Rated'],['🌡','80°C Max'],['🔄','Self-Sealing']],
    howTo:['Stretch the tape as you wrap — tension creates a tight, self-sealing layer.','Overlap each wrap by half the tape width, no gaps.','Extend 10mm past the bare area on each side.'],
    tip:'Tape is not a connector substitute — it cannot hold a live splice long-term. Use proper wire nuts first.' },

  // ── Ch6 Safety ─────────────────────────────────────────────
  { t:'chap', scene:'all_tools', ch:6, chLbl:'CH.6 SAFETY', title:'TOOL SAFETY',
    text:'Four rules every licensed electrician follows without exception. Skip one and a tool becomes a hazard.' },
  { t:'info', scene:'all_tools',
    chLbl:'CH.6 SAFETY', title:'RULES FOR SAFE TOOL USE',
    text:"1. INSPECT — Check for cracked handles, broken insulation, and damaged jaws before every job.\n2. RIGHT TOOL — Never use pliers as a hammer or a screwdriver as a pry bar.\n3. VDE RATED — All handles must be VDE 1000V AC rated. Look for the double triangle symbol.\n4. STORE PROPERLY — Keep tools in separate pockets. Nicked cutting jaws create resistance hot spots.", btn:'START QUIZ →' },

  // ── Quiz ───────────────────────────────────────────────────
  { t:'quiz', qi:0, scene:'quiz', chLbl:'QUIZ' },
  { t:'quiz', qi:1, scene:'quiz', chLbl:'QUIZ' },
  { t:'quiz', qi:2, scene:'quiz', chLbl:'QUIZ' },
  { t:'quiz', qi:3, scene:'quiz', chLbl:'QUIZ' },
  { t:'quiz', qi:4, scene:'quiz', chLbl:'QUIZ' },
  { t:'quiz', qi:5, scene:'quiz', chLbl:'QUIZ' },
  { t:'done', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'COMPLETE', title:'MODULE COMPLETE',
    text:"You know your tools. 12 essential tools — their purpose, their limits, and the rules that keep you safe.\n\nNext: Wire Stripping — where you put some of these tools to work.", btn:'FINISH' },
];

// ══════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════

const CSS = `
/* ── LESSON WRAPPER ─────────────────────────────────────── */
.etl{position:absolute;inset:0;display:flex;flex-direction:column;background:#060a14;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── TOP BAR ────────────────────────────────────────────── */
.etl-top{
  height:calc(50px + env(safe-area-inset-top));flex-shrink:0;
  background:linear-gradient(180deg,rgba(2,5,14,.98) 0%,rgba(4,8,20,.9) 100%);
  border-bottom:1px solid rgba(0,212,255,.14);
  box-shadow:0 2px 16px rgba(0,0,0,.6);
  display:flex;align-items:flex-end;padding:env(safe-area-inset-top) 12px 10px;gap:8px;
  z-index:5;
}
.etl-back{
  background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,150,200,.06));
  border:1px solid rgba(0,212,255,.35);color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:1.5px;
  padding:9px 16px;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 10px rgba(0,212,255,.12);transition:all .18s;min-width:72px;text-align:center;
  touch-action:manipulation;
}
.etl-back:active{transform:scale(.93);background:rgba(0,212,255,.2);}
.etl-chlbl{
  flex:1;text-align:center;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;
  color:rgba(255,255,255,.75);text-transform:uppercase;
}
.etl-prog{
  font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;
  color:rgba(0,212,255,.6);letter-spacing:1px;white-space:nowrap;
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.18);
  padding:4px 9px;border-radius:6px;
}

/* ── MAIN SPLIT LAYOUT ───────────────────────────────────── */
.etl-main{flex:1;display:flex;flex-direction:row;min-height:0;overflow:hidden;}

/* ── 3D SCENE ────────────────────────────────────────────── */
.etl-scene{
  flex:1;
  position:relative;background:#060a14;overflow:hidden;
}
.etl-canvas{display:block;width:100%;height:100%;}

/* Scene vignette overlay for depth */
.etl-scene::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    linear-gradient(180deg,rgba(2,5,14,.45) 0%,transparent 25%,transparent 70%,rgba(2,5,14,.55) 100%),
    radial-gradient(ellipse 70% 80% at 50% 50%,transparent 40%,rgba(2,5,14,.25) 100%);
}

/* Tool name overlay on 3D canvas */
.etl-tool-overlay{
  position:absolute;bottom:14px;left:50%;transform:translateX(-50%);
  background:rgba(2,5,14,.82);border:1px solid rgba(0,212,255,.3);
  border-radius:8px;padding:5px 14px;
  font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;
  letter-spacing:3px;color:#00d4ff;text-transform:uppercase;
  pointer-events:none;opacity:0;transition:opacity .3s;z-index:3;
  white-space:nowrap;
}
.etl-tool-overlay.show{opacity:1;}

/* ── DIALOG PANEL ────────────────────────────────────────── */
@keyframes etlDialogIn{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
.etl-dialog{
  width:38%;flex-shrink:0;
  background:linear-gradient(180deg,rgba(4,8,20,.98) 0%,rgba(6,10,24,.98) 100%);
  border-right:1px solid rgba(0,212,255,.14);
  padding:12px 14px;
  display:flex;flex-direction:column;gap:8px;
  overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;
  animation:etlDialogIn .32s cubic-bezier(.25,.46,.45,.94) both;
}
.etl-dialog::-webkit-scrollbar{display:none;}

.etl-dlg-title{
  font-size:16px;font-weight:900;letter-spacing:2.5px;
  color:#00d4ff;text-transform:uppercase;
  text-shadow:0 0 16px rgba(0,212,255,.3);
}
.etl-dlg-body{
  font-size:13px;color:rgba(255,255,255,.78);
  line-height:1.68;white-space:pre-line;
}
.etl-dlg-btn{
  align-self:flex-end;
  padding:12px 28px;
  background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;
  border:none;border-radius:11px;
  font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:900;letter-spacing:1.5px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;margin-top:4px;
  box-shadow:0 0 16px rgba(0,212,255,.25),0 4px 12px rgba(0,0,0,.35);
  transition:all .18s;touch-action:manipulation;
}
.etl-dlg-btn:active{transform:scale(.94);}

/* ── CHAPTER CARD ────────────────────────────────────────── */
.etl-chap-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px 0;}
.etl-chap-num{font-size:10px;font-weight:700;letter-spacing:5px;color:rgba(0,212,255,.55);text-transform:uppercase;}
.etl-chap-title{font-size:22px;font-weight:900;letter-spacing:3px;color:#fff;text-align:center;}
.etl-chap-body{font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;text-align:center;}

/* ── QUIZ ────────────────────────────────────────────────── */
.etl-quiz-header{
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.18);
  border-radius:10px;padding:10px 14px;flex-shrink:0;
}
.etl-quiz-hd-label{font-size:10px;font-weight:800;letter-spacing:3px;color:#00d4ff;text-transform:uppercase;}
.etl-quiz-hd-score{font-size:13px;font-weight:700;color:rgba(255,255,255,.5);}
.etl-quiz-q{font-size:15px;font-weight:700;color:#fff;line-height:1.55;flex-shrink:0;}
.etl-quiz-opts{display:flex;flex-direction:column;gap:8px;}
.etl-quiz-opt{
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  border-radius:12px;padding:14px 16px;
  font-family:'Barlow Condensed',sans-serif;font-size:14px;color:rgba(255,255,255,.82);
  text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:background .14s,border-color .14s;touch-action:manipulation;
  line-height:1.4;min-height:48px;
}
.etl-quiz-opt:active{background:rgba(0,212,255,.14);}
.etl-quiz-opt.correct{background:rgba(45,198,83,.18);border-color:#2dc653;color:#2dc653;}
.etl-quiz-opt.wrong{background:rgba(255,68,68,.14);border-color:#ff4444;color:#ff4444;}
.etl-quiz-hint{
  font-size:12px;color:rgba(255,255,255,.55);line-height:1.6;
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.2);
  border-radius:9px;padding:10px 12px;flex-shrink:0;
}
.etl-quiz-next{
  align-self:stretch;padding:14px 24px;
  background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;
  border:none;border-radius:12px;
  font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:900;letter-spacing:1px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  box-shadow:0 0 16px rgba(0,212,255,.3);transition:all .18s;flex-shrink:0;
}
.etl-quiz-next:active{transform:scale(.97);}
.etl-quiz-prog{display:flex;gap:6px;align-self:center;flex-shrink:0;}
.etl-quiz-pip{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.12);}
.etl-quiz-pip.done{background:#2dc653;}
.etl-quiz-pip.active{background:#00d4ff;box-shadow:0 0 8px #00d4ff;}

/* ── RICH TOOL PANEL ─────────────────────────────────────── */
.etl-rich{display:flex;flex-direction:column;gap:6px;flex:1;overflow:hidden;}
.etl-rich-col{display:flex;flex-direction:column;gap:4px;flex-shrink:0;}
.etl-rich-hd{font-size:8px;font-weight:800;letter-spacing:2px;color:#00d4ff;display:flex;align-items:center;gap:4px;}
.etl-rich-hd-icon{width:13px;height:13px;border-radius:50%;border:1.5px solid rgba(0,212,255,.6);display:flex;align-items:center;justify-content:center;font-size:7px;flex-shrink:0;}
.etl-about-text{font-size:11px;color:rgba(255,255,255,.75);line-height:1.45;}
.etl-feat-row{display:flex;flex-wrap:wrap;gap:3px;}
.etl-feat-item{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:5px;padding:3px 6px;}
.etl-feat-icon{font-size:10px;flex-shrink:0;}
.etl-feat-label{font-size:9px;font-weight:700;color:rgba(255,255,255,.55);}
.etl-howto-steps{display:flex;flex-direction:column;gap:3px;}
.etl-step{display:flex;align-items:flex-start;gap:5px;}
.etl-step-num{width:14px;height:14px;border-radius:4px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#00d4ff;flex-shrink:0;margin-top:1px;}
.etl-step-text{font-size:10px;color:rgba(255,255,255,.68);line-height:1.4;}
.etl-tip-box{background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.12);border-radius:7px;padding:5px 8px;flex-shrink:0;}
.etl-tip-head{font-size:8px;font-weight:800;letter-spacing:1.5px;color:#00d4ff;margin-bottom:2px;}
.etl-tip-text{font-size:10px;color:rgba(255,255,255,.55);line-height:1.4;}

/* ── BOTTOM NAV BAR ─────────────────────────────────────── */
.etl-bottom{
  height:calc(62px + env(safe-area-inset-bottom));flex-shrink:0;
  background:rgba(4,8,18,.98);border-top:1px solid rgba(0,212,255,.1);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 16px env(safe-area-inset-bottom);gap:10px;
}
.etl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.etl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.etl-dot.done{background:#2dc653;}
.etl-dot.active{background:#00d4ff;width:14px;border-radius:3px;}
.etl-nav-prev{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:0 18px;height:44px;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.6);cursor:pointer;min-width:72px;-webkit-tap-highlight-color:transparent;transition:transform .1s;touch-action:manipulation;}
.etl-nav-prev:active{transform:scale(.93);}
.etl-nav-next{background:linear-gradient(135deg,#00d4ff,#2dc653);border:none;border-radius:10px;padding:0 18px;height:44px;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:900;color:#000;cursor:pointer;min-width:96px;letter-spacing:1px;box-shadow:0 0 12px rgba(0,212,255,.2);transition:transform .1s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
.etl-nav-next:active{transform:scale(.93);}
`;

function injectCSS() {
  if (document.querySelector('#etl-css')) return;
  const s = document.createElement('style');
  s.id = 'etl-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════════
// CLASS
// ══════════════════════════════════════════════════════════════════

export class ElectricianToolsLesson {
  constructor(state) {
    this.state      = state;
    this._step      = 0;
    this._renderer  = null;
    this._raf       = null;
    this._toolMeshes = {};
    this._quizAnswered = false;
    this._quizScore    = 0;
    this._targetCam    = null;
    this._camTarget    = new THREE.Vector3();
    this._camPos       = new THREE.Vector3();
    this.container     = this._build();
  }

  _build() {
    injectCSS();
    const el = document.createElement('div');
    el.className = 'screen screen-hidden';
    el.innerHTML = `
      <div class="etl">
        <header class="etl-top">
          <button class="etl-back">← BACK</button>
          <span class="etl-chlbl" id="etl-chlbl">TOOLS</span>
          <span class="etl-prog" id="etl-prog"></span>
        </header>
        <div class="etl-main">
          <div class="etl-dialog" id="etl-dialog"></div>
          <div class="etl-scene" id="etl-scene">
            <canvas id="etl-canvas" class="etl-canvas"></canvas>
            <div class="etl-tool-overlay" id="etl-tool-overlay"></div>
          </div>
        </div>
        <div class="etl-bottom" id="etl-bottom"></div>
      </div>`;
    const backBtn = el.querySelector('.etl-back');
    const goBack = () => this.state.setState('stagesHub');
    backBtn.addEventListener('click', goBack);
    backBtn.addEventListener('touchend', e => { e.preventDefault(); goBack(); });
    this._el = el;
    return el;
  }

  // ── THREE.JS INIT ────────────────────────────────────────────

  _initThree() {
    if (this._renderer) return;
    const canvas    = this._el.querySelector('#etl-canvas');
    const sceneEl   = this._el.querySelector('#etl-scene');
    const w = sceneEl.offsetWidth, h = sceneEl.offsetHeight;
    if (!w || !h) { setTimeout(() => this._initThree(), 60); return; }

    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this._renderer.setSize(w, h);
    this._renderer.setClearColor(0x060a14);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.3;

    this._scene  = new THREE.Scene();
    this._scene.background = new THREE.Color(0x060a14);
    this._scene.fog = new THREE.FogExp2(0x060a14, 0.018);
    this._camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);

    const c0 = STEPS[0].cam ?? { p: [0, 3, 8], t: [0, 0, 0] };
    this._camera.position.set(...c0.p);
    this._camTarget.set(...c0.t);
    this._camera.lookAt(this._camTarget);
    this._targetCam = c0;

    // Lighting + realistic workbench
    buildLightingRig(this._scene);
    buildWorkbench(this._scene, { benchY: -0.07, benchW: 15, benchD: 5 });

    // Extra cinematic tool spotlight — aimed at center bench for solo showcases
    this._toolSpot = new THREE.SpotLight(0xffeedd, 5.5);
    this._toolSpot.position.set(1.8, 4.5, 2.2);
    this._toolSpot.target.position.set(0, 0.1, 0);
    this._toolSpot.angle    = 0.38;
    this._toolSpot.penumbra = 0.55;
    this._toolSpot.decay    = 1.4;
    this._toolSpot.castShadow = true;
    this._toolSpot.shadow.mapSize.set(1024, 1024);
    this._toolSpot.shadow.bias = -0.002;
    this._scene.add(this._toolSpot);
    this._scene.add(this._toolSpot.target);

    // Cool rim light from behind-left for separation
    this._rimLight = new THREE.DirectionalLight(0x3366ff, 0.55);
    this._rimLight.position.set(-3, 3, -4);
    this._scene.add(this._rimLight);

    // Build all 12 tool groups upfront
    for (const def of TOOL_DEFS) {
      const group = this[`_build_${def.id}`](def);
      group.visible = false;
      this._scene.add(group);
      this._toolMeshes[def.id] = group;
      group.userData.baseY     = group.position.y;
      group.userData.baseRx    = group.rotation.x;
      group.userData.baseScale = group.scale.x;
      group.userData.displayRz = def.displayRz ?? 0;
    }

    this._resizeObs = new ResizeObserver(() => {
      const w2 = sceneEl.offsetWidth, h2 = sceneEl.offsetHeight;
      if (!w2 || !h2) return;
      this._camera.aspect = w2 / h2;
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(w2, h2);
    });
    this._resizeObs.observe(sceneEl);

    this._tick();
    // Re-apply current scene now that all tool meshes are built
    if (STEPS[this._step]) {
      this._applyScene(STEPS[this._step].scene, STEPS[this._step]);
    }
  }

  // ── MATERIAL HELPER ──────────────────────────────────────────

  _mat(col, metalness = 0.2, roughness = 0.65) {
    return new THREE.MeshStandardMaterial({ color: col, metalness, roughness });
  }

  // ── TOOL BUILDERS ────────────────────────────────────────────

  _build_lineman() {
    const g = new THREE.Group();
    const steel    = new THREE.MeshStandardMaterial({ color:0x6e6e6e, roughness:0.22, metalness:0.88 });
    const darkSteel= new THREE.MeshStandardMaterial({ color:0x333333, roughness:0.35, metalness:0.80 });
    const chrome   = new THREE.MeshStandardMaterial({ color:0xaaaaaa, roughness:0.12, metalness:0.95 });
    const rHandleMat = new THREE.MeshStandardMaterial({ color:0xcc1111, roughness:0.78, metalness:0 });
    const bHandleMat = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.76, metalness:0 });
    const rGripMat   = new THREE.MeshStandardMaterial({ color:0x990e0e, roughness:0.85, metalness:0 });
    const bGripMat   = new THREE.MeshStandardMaterial({ color:0x1a1a1a, roughness:0.85, metalness:0 });

    const armA = new THREE.Group(); // Upper Jaw + Right Handle (Red)
    const armB = new THREE.Group(); // Lower Jaw + Left Handle (Black)

    // ── Upper jaw (flat gripping plate) ────────────────
    const juPlate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.052, 0.16), steel);
    juPlate.position.set(0.20, 0.66 - 0.47, 0); armA.add(juPlate);
    for (let i = 0; i < 9; i++) {            // serration teeth
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.022, 0.163), darkSteel);
      t.position.set(-0.16 + i * 0.065, 0.686 - 0.47, 0); armA.add(t);
    }
    const armU = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.28, 0.13), steel);
    armU.position.set(-0.045, 0.33 - 0.47, 0); armA.add(armU);
    const rH = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.55, 6, 14), rHandleMat);
    rH.position.set(-0.092, 0.05 - 0.47, 0); rH.rotation.z = 0.24; armA.add(rH);
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.008, 6, 18), rGripMat);
      ring.position.set(-0.092 + Math.sin(0.24)*(-0.10+i*0.065), 0.20-0.47-i*0.075, 0);
      ring.rotation.set(Math.PI/2, 0, 0.24); armA.add(ring);
    }
    // ArmA cutting notch
    const cutA = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.042, 0.082), darkSteel);
    cutA.position.set(-0.07, 0.475 - 0.47, 0.041); armA.add(cutA);

    // ── Lower jaw ──────────────────────────────────────
    const jlPlate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.052, 0.16), steel);
    jlPlate.position.set(0.20, 0.604 - 0.47, 0); armB.add(jlPlate);
    for (let i = 0; i < 9; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.022, 0.163), darkSteel);
      t.position.set(-0.16 + i * 0.065, 0.583 - 0.47, 0); armB.add(t);
    }
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.28, 0.13), steel);
    armL.position.set(0.045, 0.33 - 0.47, 0); armB.add(armL);
    const bH = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.55, 6, 14), bHandleMat);
    bH.position.set(0.092, 0.05 - 0.47, 0); bH.rotation.z = -0.24; armB.add(bH);
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.008, 6, 18), bGripMat);
      ring.position.set(0.092 + Math.sin(-0.24)*(-0.10+i*0.065), 0.20-0.47-i*0.075, 0);
      ring.rotation.set(Math.PI/2, 0, -0.24); armB.add(ring);
    }
    const cutB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.042, 0.082), darkSteel);
    cutB.position.set(-0.07, 0.475 - 0.47, -0.041); armB.add(cutB);

    // Pivot is at y=0.47
    armA.position.y = 0.47;
    armB.position.y = 0.47;

    // ── Hex pivot bolt ─────────────────────────────────
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.19, 6), chrome);
    bolt.rotation.x = Math.PI / 2; bolt.position.set(0, 0.47, 0); g.add(bolt);
    const boltFace = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 6), darkSteel);
    boltFace.rotation.x = Math.PI / 2; boltFace.position.set(0, 0.47, 0.098); g.add(boltFace);

    g.add(armA); g.add(armB);
    g.userData.armA = armA;
    g.userData.armB = armB;
    g.position.y = 0.08;
    return g;
  }

  _build_dykes() {
    const g = new THREE.Group();
    const steel = this._mat(0x666666, 0.8, 0.3);
    const armA = new THREE.Group();
    const armB = new THREE.Group();

    // Pivot is at y=0.28
    const jA = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.032, 0.07), steel);
    jA.position.set(-0.04, 0.4 - 0.28, 0); jA.rotation.z = -0.32; armA.add(jA);
    const hA = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.36, 4, 8), this._mat(0x3355aa));
    hA.position.set(0.05, 0.04 - 0.28, 0); hA.rotation.z = 0.18; armA.add(hA);

    const jB = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.032, 0.07), steel);
    jB.position.set(0.04, 0.4 - 0.28, 0); jB.rotation.z = 0.32; armB.add(jB);
    const hB = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.36, 4, 8), this._mat(0x1a1a2e));
    hB.position.set(-0.05, -0.15 - 0.28, 0); hB.rotation.z = -0.18; armB.add(hB);

    armA.position.y = 0.28;
    armB.position.y = 0.28;

    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.11, 8), steel);
    bolt.rotation.x = Math.PI / 2; bolt.position.y = 0.28;
    g.add(bolt);

    g.add(armA); g.add(armB);
    g.userData.armA = armA;
    g.userData.armB = armB;
    g.position.y = 0.08;
    return g;
  }

  _build_knife() {
    const g = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.17, 0.52), this._mat(0x555566));
    handle.position.y = 0.085;
    g.add(handle);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.072, 0.28), this._mat(0xc8c8c8, 0.9, 0.2));
    blade.position.set(0, 0.12, -0.34);
    g.add(blade);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.04, 0.06), this._mat(0xc8c8c8, 0.9, 0.2));
    tip.position.set(0, 0.09, -0.45); tip.rotation.x = 0.4;
    g.add(tip);
    const slider = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.058, 0.042), this._mat(0x333344));
    slider.position.set(0.073, 0.13, -0.08);
    g.add(slider);
    g.position.y = 0.085;
    return g;
  }

  _build_longnose() {
    const g = new THREE.Group();
    const steel  = new THREE.MeshStandardMaterial({ color:0x7a7a7a, roughness:0.20, metalness:0.90 });
    const dark   = new THREE.MeshStandardMaterial({ color:0x333333, roughness:0.35, metalness:0.80 });
    const chrome = new THREE.MeshStandardMaterial({ color:0xbbbbbb, roughness:0.10, metalness:0.96 });
    const rMat = new THREE.MeshStandardMaterial({ color:0xdd2222, roughness:0.76, metalness:0 });
    const bMat = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.76, metalness:0 });
    
    const armA = new THREE.Group(); // right handle + left jaw
    const armB = new THREE.Group(); // left handle + right jaw

    // Pivot is at y=0.22

    // Tapered upper jaw (left) -> armA
    const juBase = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.80, 0.10), steel);
    juBase.position.set(0.022, 0.72 - 0.22, 0); juBase.rotation.z = 0.03; armA.add(juBase);
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.044, 0.102), dark);
      s.position.set(0.010, 0.42 - 0.22 + i * 0.065, 0); armA.add(s);
    }
    // Red handle with grip rings -> armA
    const rH = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.50, 5, 12), rMat);
    rH.position.set(0.068, -0.08 - 0.22, 0); rH.rotation.z = 0.15; armA.add(rH);
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.007, 6, 16),
        new THREE.MeshStandardMaterial({ color:0xaa1111, roughness:0.85 }));
      r.position.set(0.068+Math.sin(0.15)*(-.05+i*.058), -.02-0.22-i*.068, 0);
      r.rotation.set(Math.PI/2, 0, 0.15); armA.add(r);
    }

    // Lower jaw (right) -> armB
    const jlBase = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.80, 0.10), steel);
    jlBase.position.set(-0.022, 0.72 - 0.22, 0); jlBase.rotation.z = -0.03; armB.add(jlBase);
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.044, 0.102), dark);
      s.position.set(-0.010, 0.42 - 0.22 + i * 0.065, 0); armB.add(s);
    }
    // Black handle with grip rings -> armB
    const bH = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.50, 5, 12), bMat);
    bH.position.set(-0.068, -0.08 - 0.22, 0); bH.rotation.z = -0.15; armB.add(bH);
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.007, 6, 16),
        new THREE.MeshStandardMaterial({ color:0x222222, roughness:0.85 }));
      r.position.set(-0.068+Math.sin(-0.15)*(-.05+i*.058), -.02-0.22-i*.068, 0);
      r.rotation.set(Math.PI/2, 0, -0.15); armB.add(r);
    }

    armA.position.y = 0.22;
    armB.position.y = 0.22;

    // Hex pivot bolt
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.15, 6), chrome);
    bolt.rotation.x = Math.PI / 2; bolt.position.set(0, 0.22, 0); g.add(bolt);

    // Spring coil between handles (open spring) attached to root so it bends
    const springGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const a = (i / 7) * Math.PI;
      const sc = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.012),
        new THREE.MeshStandardMaterial({ color:0xaaaaaa, roughness:0.3, metalness:0.85 }));
      sc.position.set(Math.cos(a) * 0.055, 0.02, Math.sin(a) * 0.055); springGroup.add(sc);
    }
    g.add(springGroup);

    g.add(armA); g.add(armB);
    g.userData.armA = armA;
    g.userData.armB = armB;
    g.userData.spring = springGroup;
    g.position.y = 0.08;
    return g;
  }

  _build_conduitbender() {
    const g = new THREE.Group();
    const orange = this._mat(0xdd5500, 0.3, 0.7);
    const steel  = this._mat(0x888888, 0.8, 0.3);
    // Curved head
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * (Math.PI * 0.6) - 0.12;
      pts.push(new THREE.Vector3(Math.sin(a) * 0.88, Math.cos(a) * 0.88, 0));
    }
    const headTube = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.044, 8, false),
      orange
    );
    headTube.position.set(0, 0.08, 0);
    g.add(headTube);
    // Long handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.45, 8), steel);
    handle.position.set(0, -0.68, 0);
    g.add(handle);
    // Foot step
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.09), orange);
    step.position.set(-0.34, 0.07, 0);
    g.add(step);
    // Angle marker (yellow stripe)
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.065), this._mat(0xffee00, 0, 1));
    mark.position.set(-0.61, 0.73, 0.05);
    g.add(mark);
    g.scale.setScalar(0.85);
    g.position.y = 0.1;
    return g;
  }

  _build_flathead() {
    const g = new THREE.Group();
    const shaftMat  = new THREE.MeshStandardMaterial({ color:0x999999, roughness:0.18, metalness:0.92 });
    const chromeMat = new THREE.MeshStandardMaterial({ color:0xcccccc, roughness:0.10, metalness:0.96 });
    const handleMat = new THREE.MeshStandardMaterial({ color:0xff9900, roughness:0.72, metalness:0 });
    const gripMat   = new THREE.MeshStandardMaterial({ color:0xcc7700, roughness:0.82, metalness:0 });

    // Tri-lobe ergonomic handle body (3 overlapping cylinders)
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const lobe = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.044, 0.46, 10), handleMat);
      lobe.position.set(Math.cos(a)*0.020, 0.44, Math.sin(a)*0.020); g.add(lobe);
    }
    // Handle cap (butt end)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.028, 14), gripMat);
    cap.position.y = 0.685; g.add(cap);
    // Handle collar (chrome ring at base)
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.035, 0.045, 14), chromeMat);
    collar.position.y = 0.195; g.add(collar);
    // Grip rings along handle
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.007, 6, 16), gripMat);
      ring.position.y = 0.60 - i * 0.072; ring.rotation.x = Math.PI/2; g.add(ring);
    }
    // Hex shank near blade
    const hexShank = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 6), shaftMat);
    hexShank.position.y = 0.085; g.add(hexShank);
    // Round shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.24, 10), shaftMat);
    shaft.position.y = -0.075; g.add(shaft);
    // Flathead tip (wide, thin blade)
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.010, 0.018), chromeMat);
    tip.position.y = -0.215; g.add(tip);
    // Tip taper (slightly narrower)
    const tipTaper = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.005, 0.012), chromeMat);
    tipTaper.position.y = -0.222; g.add(tipTaper);

    g.position.y = 0.23;
    return g;
  }

  _build_phillips() {
    const g = new THREE.Group();
    const shaftMat  = new THREE.MeshStandardMaterial({ color:0x999999, roughness:0.18, metalness:0.92 });
    const chromeMat = new THREE.MeshStandardMaterial({ color:0xcccccc, roughness:0.10, metalness:0.96 });
    const handleMat = new THREE.MeshStandardMaterial({ color:0xff6600, roughness:0.72, metalness:0 });
    const gripMat   = new THREE.MeshStandardMaterial({ color:0xcc4400, roughness:0.82, metalness:0 });

    // Tri-lobe handle
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const lobe = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.044, 0.46, 10), handleMat);
      lobe.position.set(Math.cos(a)*0.020, 0.44, Math.sin(a)*0.020); g.add(lobe);
    }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.028, 14), gripMat);
    cap.position.y = 0.685; g.add(cap);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.035, 0.045, 14), chromeMat);
    collar.position.y = 0.195; g.add(collar);
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.007, 6, 16), gripMat);
      ring.position.y = 0.60 - i * 0.072; ring.rotation.x = Math.PI/2; g.add(ring);
    }
    // Hex shank + round shaft
    const hexShank = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 6), shaftMat);
    hexShank.position.y = 0.085; g.add(hexShank);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.24, 10), shaftMat);
    shaft.position.y = -0.075; g.add(shaft);
    // Phillips cross tip
    [0, 1].forEach(i => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.012, 0.016), chromeMat);
      bar.position.y = -0.212; bar.rotation.y = i * Math.PI / 2; g.add(bar);
    });
    // Conical tip point
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.028, 8), chromeMat);
    point.position.y = -0.232; point.rotation.x = Math.PI; g.add(point);

    g.position.y = 0.23;
    return g;
  }

  _build_tape() {
    const g = new THREE.Group();
    const roll = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.09, 12, 32), this._mat(0x111111, 0.1, 0.9));
    roll.rotation.x = Math.PI / 2;
    g.add(roll);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 16), this._mat(0x2a2218, 0.1, 0.9));
    g.add(core);
    g.scale.setScalar(0.8);
    g.position.y = 0.22;
    return g;
  }

  _build_tester() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6, metalness: 0.1 });
    const blkMat  = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.9, transparent: true, opacity: 0.5 });
    const tipMat  = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.4 }); // semi-transparent white plastic tip

    // Main yellow body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.65, 16), bodyMat);
    body.position.y = 0.12; g.add(body);
    
    // Black grip section
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.030, 0.28, 16), blkMat);
    grip.position.y = -0.34; g.add(grip);
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.042 - i*0.002, 0.005, 6, 16), blkMat);
      ring.position.y = -0.25 - i*0.06; ring.rotation.x = Math.PI/2; g.add(ring);
    }

    // Tapered sensor tip
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.026, 0.22, 12), tipMat);
    tip.position.y = -0.59; g.add(tip);
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 12), tipMat);
    point.position.y = -0.72; point.rotation.x = Math.PI; g.add(point);

    // End cap with clear lens
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16), blkMat);
    cap.position.y = 0.47; g.add(cap);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12, 0, Math.PI*2, 0, Math.PI/2), lensMat);
    lens.position.y = 0.50; g.add(lens);

    // Glowing LED inside lens
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 1.2 })
    );
    led.position.set(0, 0.49, 0); g.add(led);

    // Pocket clip (black plastic)
    const clipTop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.06), blkMat);
    clipTop.position.set(-0.04, 0.45, 0); g.add(clipTop);
    const clipArm = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.40, 0.03), blkMat);
    clipArm.position.set(-0.06, 0.25, 0); g.add(clipArm);
    const clipTip = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.02, 0.03), blkMat);
    clipTip.position.set(-0.055, 0.05, 0); g.add(clipTip);

    // Thumb button switch
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.06, 0.03), blkMat);
    btn.position.set(0.042, 0.20, 0); g.add(btn);

    g.scale.setScalar(0.88);
    g.position.y = 0.45;
    return g;
  }

  _build_multimeter() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.65, metalness: 0 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.85, metalness: 0 });
    const portRed = new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: 0.5, metalness: 0.2 });
    const portBlk = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.2 });

    // Main body (dark plastic)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.60, 0.08), bodyMat);
    g.add(body);

    // Rubber holster wrap (orange)
    const holster = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.64, 0.09), rubberMat);
    holster.position.z = -0.01;
    g.add(holster);
    
    // Screen (dynamic canvas)
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 128; sCanvas.height = 64;
    const sCtx = sCanvas.getContext('2d');
    sCtx.fillStyle = '#a1b5a5'; sCtx.fillRect(0,0,128,64); // LCD background
    sCtx.fillStyle = '#111111';
    sCtx.font = 'bold 42px monospace';
    sCtx.fillText('120.4', 8, 48);
    sCtx.font = '14px sans-serif';
    sCtx.fillText('V~', 104, 48);
    
    const screenTex = new THREE.CanvasTexture(sCanvas);
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.16, 0.02),
      new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.2, metalness: 0.1 })
    );
    screen.position.set(0, 0.16, 0.041);
    g.add(screen);
    
    // Screen bezel
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.18, 0.015), bodyMat);
    bezel.position.set(0, 0.16, 0.04); g.add(bezel);

    // Main selection dial with grip ridges
    const dialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.015, 24), bodyMat);
    dialBase.rotation.x = Math.PI / 2; dialBase.position.set(0, -0.06, 0.04);
    g.add(dialBase);
    
    const dialKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), bodyMat);
    dialKnob.rotation.x = Math.PI / 2; dialKnob.position.set(0, -0.06, 0.05);
    g.add(dialKnob);
    
    // Dial grip ridges
    for(let i=0; i<8; i++){
      const angle = (i/8)*Math.PI*2;
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.025), bodyMat);
      ridge.position.set(Math.cos(angle)*0.08, -0.06+Math.sin(angle)*0.08, 0.05);
      g.add(ridge);
    }
    
    // Dial indicator line
    const dialLine = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.08, 0.035), new THREE.MeshStandardMaterial({color:0xffffff}));
    dialLine.position.set(0, -0.02, 0.05);
    g.add(dialLine);

    // Probe ports (COM, V/Ohm, A)
    [-0.10, 0, 0.10].forEach((x, i) => {
      const port = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), i===0 ? portBlk : portRed);
      port.rotation.x = Math.PI / 2; port.position.set(x, -0.24, 0.042);
      g.add(port);
      // Inner hole
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.022, 12), new THREE.MeshStandardMaterial({color:0x000000}));
      hole.rotation.x = Math.PI / 2; hole.position.set(x, -0.24, 0.044);
      g.add(hole);
    });

    g.scale.setScalar(0.78);
    g.position.y = 0.24;
    return g;
  }

  _build_fishtape() {
    const g = new THREE.Group();
    const orange = this._mat(0xff6600, 0.2, 0.7);
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20), orange);
    g.add(reel);
    [-0.08, 0.08].forEach(y => {
      const side = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 20), this._mat(0xdd4400, 0.2, 0.7));
      side.position.y = y; g.add(side);
    });
    const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.22, 4, 8), this._mat(0x333333, 0.1, 0.8));
    handle.position.set(0.36, 0.14, 0); handle.rotation.z = Math.PI / 2;
    g.add(handle);
    const tapeEnd = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.012, 0.018), this._mat(0x888888, 0.8, 0.3));
    tapeEnd.position.set(0.34, 0, 0);
    g.add(tapeEnd);
    g.rotation.x = Math.PI / 2;
    g.scale.setScalar(0.85);
    g.position.y = 0.27;
    return g;
  }

  _build_measuringtape() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.28), this._mat(0xffcc00, 0.1, 0.7));
    g.add(body);
    for (let i = 0; i < 4; i++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.22, 0.28), this._mat(0xddaa00, 0.1, 0.8));
      rib.position.x = -0.15 + i * 0.1; g.add(rib);
    }
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.018, 0.022), this._mat(0xdddddd, 0.6, 0.4));
    blade.position.set(0.4, 0.06, 0.06);
    g.add(blade);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.26, 0.02), this._mat(0x555555, 0.7, 0.4));
    clip.position.set(-0.2, 0.02, 0.15);
    g.add(clip);
    g.scale.setScalar(0.85);
    g.position.y = 0.1;
    return g;
  }

  // ── SCENE MANAGEMENT ────────────────────────────────────────

  _applyScene(sceneName, step) {
    for (const m of Object.values(this._toolMeshes)) {
      m.visible = false;
      m.rotation.set(0, 0, 0);
      m.scale.setScalar(1);
    }

    const cam = step?.cam ?? { p: [0, 3, 8], t: [0, 0, 0] };
    this._targetCam = cam;

    if (sceneName === 'bench_clean') return;

    if (sceneName === 'all_tools') {
      TOOL_DEFS.forEach(def => {
        const m = this._toolMeshes[def.id];
        m.visible = true;
        m.position.set(-2.5 + def.xi * 1.02, 0.08, -0.65 + def.row * 1.32);
        m.rotation.set(-Math.PI / 2, 0, 0);
        m.scale.setScalar(0.65);
      });
      return;
    }

    const GROUPS = {
      cutting_group:   ['lineman', 'dykes', 'knife'],
      gripping_group:  ['longnose', 'conduitbender'],
      fastening_group: ['flathead', 'phillips'],
      testing_group:   ['tester', 'multimeter', 'fishtape', 'measuringtape'],
    };

    if (GROUPS[sceneName]) {
      const ids = GROUPS[sceneName];
      const span = (ids.length - 1) * 1.65;
      ids.forEach((id, i) => {
        const m = this._toolMeshes[id];
        m.visible = true;
        m.position.set(-span / 2 + i * 1.65, 0.08, 0);
        m.rotation.set(-Math.PI / 2, 0, 0);
        m.scale.setScalar(0.85);
      });
      return;
    }

    if (this._animProps) {
      this._scene.remove(this._animProps);
      this._animProps = null;
    }

    // Spotlight on for solo show/anim scenes, off for group scenes
    const isSolo = sceneName.startsWith('show_') || sceneName.startsWith('anim_') || sceneName === 'quiz';
    if (this._toolSpot) this._toolSpot.intensity = isSolo ? 5.5 : 0;
    if (this._rimLight) this._rimLight.intensity = isSolo ? 0.55 : 0.18;

    // Cinematic close-up camera for solo display — overrides the step's cam
    if (sceneName.startsWith('show_') || sceneName === 'quiz') {
      this._targetCam = { p: [0.35, 1.5, 2.8], t: [0, 1.0, 0] };
    } else if (sceneName.startsWith('anim_')) {
      this._targetCam = { p: [0, 1.5, 3.0], t: [0, 1.0, 0] };
    }

    if (isSolo) {
      const id = sceneName === 'quiz'
        ? (QUIZ[step?.qi]?.vis ?? null)
        : sceneName.split('_')[1];

      const m = id ? this._toolMeshes[id] : null;
      if (m) {
        m.visible = true;
        const S = (m.userData.baseScale ?? 1) * 2.0;
        m.scale.setScalar(S);
        const tDef = TOOL_DEFS.find(d => d.id === id);
        const displayRz = tDef?.displayRz ?? 0;
        m.rotation.set(m.userData.baseRx ?? 0, 0.42, displayRz);

        // Auto-seat: place high, compute world bounding box, drop to bench surface
        m.position.set(0, 100, 0.1);
        m.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(m);
        const seatedY = 100.02 - box.min.y;
        m.position.y = seatedY;
        m.userData.displayY = seatedY;

        // Aim spotlight at tool center and reposition it above
        if (this._toolSpot) {
          const dy = seatedY - 100;
          const toolCenterY = (box.min.y + box.max.y) * 0.5 + dy;
          const toolTopY    = box.max.y + dy;
          this._toolSpot.target.position.set(0.1, toolCenterY, 0.1);
          this._toolSpot.target.updateMatrixWorld();
          this._toolSpot.position.set(1.6, toolTopY + 3.2, 2.0);
        }
      }

      // Update tool name overlay
      const overlay = this._el?.querySelector('#etl-tool-overlay');
      if (overlay && m && id) {
        const def = TOOL_DEFS.find(d => d.id === id);
        overlay.textContent = def?.name ?? '';
        overlay.classList.toggle('show', !!def && sceneName !== 'quiz');
      } else if (overlay) {
        overlay.classList.remove('show');
      }

      if (sceneName.startsWith('anim_')) {
        this._animProps = new THREE.Group();
        this._animProps.position.set(0, m?.userData.displayY ?? 0.2, 0.1);
        this._scene.add(this._animProps);

        if (id === 'lineman' || id === 'dykes') {
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.6, 12),
            this._mat(0xcc3333, 0.1, 0.7));
          wire.rotation.z = Math.PI / 2;
          wire.position.set(0.1, 0.18, 0);
          this._animProps.add(wire);
          // Copper end
          const end = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.12, 8),
            this._mat(0xd97845, 0.1, 0.85));
          end.rotation.z = Math.PI / 2;
          end.position.set(0.82, 0.18, 0);
          this._animProps.add(end);
        } else if (id === 'flathead' || id === 'phillips') {
          const head = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.12, 12),
            this._mat(0x888888, 0.8, 0.3));
          head.position.set(0, -0.22, 0);
          this._animProps.add(head);
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12),
            this._mat(0x555555, 0.5, 0.5));
          body.position.set(0, -0.58, 0);
          this._animProps.add(body);
        } else if (id === 'tester') {
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.6, 12),
            this._mat(0x111111, 0.1, 0.7));
          wire.rotation.z = Math.PI / 2;
          wire.position.set(0.2, -0.3, 0);
          this._animProps.add(wire);
        }
      } else {
        // For show_ scenes, clear overlay after a moment so it fades during hover rotate
      }
      return;
    }

    // Clear overlay for non-solo scenes
    const overlay = this._el?.querySelector('#etl-tool-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ── STEP SYSTEM ──────────────────────────────────────────────

  _gotoStep(i) {
    this._step = i;
    this._quizAnswered = false;
    const step = STEPS[i];
    this._el.querySelector('#etl-chlbl').textContent = step.chLbl ?? 'TOOLS';
    this._el.querySelector('#etl-prog').textContent  = `${i + 1}/${STEPS.length}`;
    this._el.querySelector('.etl').classList.toggle('etl--quiz', step.t === 'quiz');
    this._applyScene(step.scene, step);
    this._renderDialog(step);
    this._renderNav(step);
  }

  _renderDialog(step) {
    const dlg = this._el.querySelector('#etl-dialog');

    if (step.t === 'chap') {
      dlg.innerHTML = `
        <div class="etl-chap-wrap">
          <div class="etl-chap-num">CHAPTER ${step.ch}</div>
          <div class="etl-chap-title">${step.title}</div>
          <div class="etl-chap-body">${step.text}</div>
        </div>`;
      return;
    }

    if (step.t === 'quiz') {
      const q = QUIZ[step.qi];
      const pips = QUIZ.map((_, i) => {
        const cls = i < step.qi ? 'done' : i === step.qi ? 'active' : '';
        return `<div class="etl-quiz-pip ${cls}"></div>`;
      }).join('');
      dlg.innerHTML = `
        <div class="etl-quiz-header">
          <span class="etl-quiz-hd-label">Question ${step.qi + 1} / ${QUIZ.length}</span>
          <span class="etl-quiz-hd-score">${this._quizScore} correct</span>
        </div>
        <div class="etl-quiz-prog">${pips}</div>
        <div class="etl-quiz-q">${q.q}</div>
        <div class="etl-quiz-opts">
          ${q.opts.map((o, i) => `<button class="etl-quiz-opt" data-i="${i}">${o}</button>`).join('')}
        </div>`;
      dlg.querySelectorAll('.etl-quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => this._onQuizAnswer(parseInt(btn.dataset.i)));
      });
      return;
    }

    if (step.t === 'done') {
      const scoreColor = this._quizScore >= 5 ? '#2dc653' : this._quizScore >= 3 ? '#ffaa22' : '#ff4444';
      dlg.innerHTML = `
        <div class="etl-dlg-title">${step.title}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:${scoreColor};letter-spacing:2px;">QUIZ: ${this._quizScore}/${QUIZ.length} CORRECT</div>
        <div class="etl-dlg-body">${step.text}</div>`;
      return;
    }

    if (step.t === 'tool') {
      const featsHTML = step.features.map(([icon, label]) => `
        <div class="etl-feat-item">
          <span class="etl-feat-icon">${icon}</span>
          <span class="etl-feat-label">${label}</span>
        </div>`).join('');
      const stepsHTML = step.howTo.map((s, i) => `
        <div class="etl-step">
          <div class="etl-step-num">${i + 1}</div>
          <div class="etl-step-text">${s}</div>
        </div>`).join('');
      dlg.innerHTML = `
        <div class="etl-rich">
          <div class="etl-rich-col">
            <div class="etl-rich-hd"><div class="etl-rich-hd-icon">i</div> ABOUT THE TOOL</div>
            <div class="etl-about-text">${step.about}</div>
            <div class="etl-feat-row">${featsHTML}</div>
          </div>
          <div class="etl-rich-col">
            <div class="etl-rich-hd">HOW TO USE</div>
            <div class="etl-howto-steps">${stepsHTML}</div>
          </div>
          <div class="etl-tip-box">
            <div class="etl-tip-head">💡 TIP</div>
            <div class="etl-tip-text">${step.tip}</div>
          </div>
        </div>`;
      return;
    }

    // info / qintro / intro fallback
    dlg.innerHTML = `
      ${step.title ? `<div class="etl-dlg-title">${step.title}</div>` : ''}
      <div class="etl-dlg-body">${step.text ?? ''}</div>`;
  }

  _renderNav(step) {
    const bot = this._el.querySelector('#etl-bottom');
    if (!bot) return;
    const i = this._step;
    const dots = STEPS.map((_, idx) => {
      const cls = idx < i ? 'done' : idx === i ? 'active' : '';
      return `<div class="etl-dot ${cls}"></div>`;
    }).join('');

    if (step.t === 'quiz') {
      bot.innerHTML = `<div class="etl-dots">${dots}</div>`;
      return;
    }

    const prevHTML = i > 0
      ? `<button class="etl-nav-prev" id="etl-prev">← BACK</button>`
      : `<div style="min-width:72px"></div>`;
    const nextLabel = step.btn ?? 'NEXT →';
    bot.innerHTML = `
      ${prevHTML}
      <div class="etl-dots">${dots}</div>
      <button class="etl-nav-next" id="etl-next">${nextLabel}</button>`;
    bot.querySelector('#etl-next')?.addEventListener('click', () => this._onNext());
    bot.querySelector('#etl-prev')?.addEventListener('click', () => this._onPrev());
  }

  _onNext() {
    const step = STEPS[this._step];
    if (step.t === 'done') {
      const alreadyDone = Database.getLessonProgress().electricianTools;
      Database.completeLesson('electricianTools');
      Database.saveLearnStage('electricianTools');
      if (!alreadyDone) Database.addXP(100 + this._quizScore * 25);
      this.state.setState('stagesHub');
      return;
    }
    if (this._step < STEPS.length - 1) this._gotoStep(this._step + 1);
  }

  _onPrev() {
    if (this._step > 0) this._gotoStep(this._step - 1);
  }

  _onQuizAnswer(idx) {
    if (this._quizAnswered) return;
    this._quizAnswered = true;
    const q = QUIZ[STEPS[this._step].qi];
    if (idx === q.a) this._quizScore++;

    this._el.querySelectorAll('.etl-quiz-opt').forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.a) btn.classList.add('correct');
      else if (i === idx && idx !== q.a) btn.classList.add('wrong');
    });

    const dlg = this._el.querySelector('#etl-dialog');
    const hint = document.createElement('div');
    hint.className = 'etl-quiz-hint';
    hint.textContent = q.hint;
    dlg.appendChild(hint);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'etl-quiz-next';
    nextBtn.textContent = 'NEXT →';
    nextBtn.addEventListener('click', () => {
      if (this._step < STEPS.length - 1) this._gotoStep(this._step + 1);
    });
    dlg.appendChild(nextBtn);
  }

  // ── RENDER LOOP ──────────────────────────────────────────────

  _tick() {
    if (!this._renderer) return;
    this._raf = requestAnimationFrame(() => this._tick());
    const t = performance.now() * 0.001;

    // Smooth camera
    if (this._targetCam) {
      const [px, py, pz] = this._targetCam.p;
      const [tx, ty, tz] = this._targetCam.t;
      this._camera.position.x += (px - this._camera.position.x) * 0.06;
      this._camera.position.y += (py - this._camera.position.y) * 0.06;
      this._camera.position.z += (pz - this._camera.position.z) * 0.06;
      this._camTarget.x += (tx - this._camTarget.x) * 0.06;
      this._camTarget.y += (ty - this._camTarget.y) * 0.06;
      this._camTarget.z += (tz - this._camTarget.z) * 0.06;
      this._camera.lookAt(this._camTarget);
    }

    // Animate visible tools
    const step = STEPS[this._step];
    const isAnim   = step?.scene?.startsWith('anim_');
    const isShow   = step?.scene?.startsWith('show_') || step?.scene === 'quiz';

    if (isShow) {
      for (const m of Object.values(this._toolMeshes)) {
        if (!m.visible) continue;
        const baseRz = m.userData.displayRz ?? 0;
        m.rotation.y = 0.42 + Math.sin(t * 0.32) * 0.5;
        m.rotation.z = baseRz + Math.sin(t * 0.20) * 0.025;
        const dY = m.userData.displayY ?? 0.2;
        m.position.y = dY + Math.sin(t * 0.52) * 0.018;
      }
      if (this._toolSpot) {
        this._toolSpot.intensity = 5.2 + Math.sin(t * 0.7) * 0.4;
      }
    } else if (isAnim) {
      const id = step.scene.split('_')[1];
      const m = this._toolMeshes[id];
      if (m) {
        const animT = t * 2.8;
        const dY = m.userData.displayY ?? 0.2;
        m.position.y = dY + Math.sin(t * 0.52) * 0.016;

        if (id === 'lineman' || id === 'dykes' || id === 'longnose') {
          m.rotation.y = 0.55 + Math.sin(t * 0.3) * 0.3;
          const jawAngle = (Math.sin(animT) * 0.5 + 0.5) * 0.22;
          if (m.userData.armA) m.userData.armA.rotation.z =  jawAngle;
          if (m.userData.armB) m.userData.armB.rotation.z = -jawAngle;
        } else if (id === 'flathead' || id === 'phillips') {
          m.rotation.y = t * 1.8;
          m.rotation.z = 0.12 + Math.sin(animT * 0.5) * 0.06;
        } else if (id === 'knife') {
          m.rotation.y = 0.55 + Math.sin(t * 0.4) * 0.5;
          m.rotation.z = 0.12 + Math.sin(animT * 0.5) * 0.18;
        } else if (id === 'tester') {
          m.rotation.y = 0.55 + Math.sin(t * 0.3) * 0.35;
          const led = m.children.find(c => c.material?.emissive);
          if (led) led.material.emissiveIntensity = 0.8 + Math.sin(t * 14) * 0.8;
        } else if (id === 'conduitbender') {
          m.rotation.y = 0.55;
          m.rotation.z = 0.12 + Math.sin(animT * 0.45) * 0.28;
        } else if (id === 'tape') {
          m.rotation.y = t * 1.4;
        } else {
          m.rotation.y = 0.55 + Math.sin(t * 0.3) * 0.5;
        }

        if (this._toolSpot) this._toolSpot.intensity = 5.2 + Math.sin(t * 0.7) * 0.4;
      }
    }

    this._renderer.render(this._scene, this._camera);
  }

  // ── LIFECYCLE ────────────────────────────────────────────────

  onShow() {
    this._quizScore = 0;
    this._gotoStep(0);
    // Delay Three.js init so the DOM is fully laid out and the screen is visible
    setTimeout(() => this._initThree(), 80);
  }

  onHide() {
    if (this._raf)       { cancelAnimationFrame(this._raf); this._raf = null; }
    if (this._resizeObs) { this._resizeObs.disconnect(); this._resizeObs = null; }
    if (this._renderer)  {
      this._renderer.dispose();
      this._renderer   = null;
      this._scene      = null;
      this._camera     = null;
      this._toolMeshes = {};
      this._toolSpot   = null;
      this._rimLight   = null;
      this._animProps  = null;
    }
  }
}

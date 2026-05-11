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
  { id:'lineman',       name:"LINEMAN'S PLIERS",    col:0xcc2222, row:0, xi:0 },
  { id:'dykes',         name:'DIAGONAL CUTTERS',    col:0x3355aa, row:0, xi:1 },
  { id:'knife',         name:'UTILITY KNIFE',        col:0x555566, row:0, xi:2 },
  { id:'longnose',      name:'LONG NOSE PLIERS',    col:0x888888, row:0, xi:3 },
  { id:'conduitbender', name:'CONDUIT BENDER',      col:0x884400, row:0, xi:4 },
  { id:'flathead',      name:'FLATHEAD SCREWDRIVER',col:0xffaa22, row:0, xi:5 },
  { id:'phillips',      name:'PHILLIPS SCREWDRIVER',col:0xff8800, row:1, xi:0 },
  { id:'tape',          name:'ELECTRICAL TAPE',     col:0x111111, row:1, xi:1 },
  { id:'tester',        name:'VOLTAGE TESTER',      col:0xffee00, row:1, xi:2 },
  { id:'multimeter',    name:'MULTIMETER',           col:0x333333, row:1, xi:3 },
  { id:'fishtape',      name:'FISH TAPE',            col:0xff6600, row:1, xi:4 },
  { id:'measuringtape', name:'MEASURING TAPE',      col:0xffcc00, row:1, xi:5 },
];

const STEPS = [
  // ── Intro ──────────────────────────────────────────────────
  { t:'info', scene:'bench_clean', cam:{p:[0,3,8],t:[0,0,0]},
    chLbl:'TOOLS', title:"ELECTRICIAN'S TOOLS",
    text:"Every professional electrician carries a core set of hand tools. Not any tools — the right tools. This lesson covers the 12 essential tools used in Philippine electrical work. What they do, when to use them, and how to stay safe.", btn:'NEXT' },
  { t:'info', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'TOOLS', title:'12 ESSENTIAL TOOLS',
    text:"Six categories:\n✦ Cutting — for wire and conduit\n✦ Gripping — bending and holding\n✦ Fastening — terminals and fittings\n✦ Testing — safety and fault-finding\n✦ Measuring — accurate runs\n✦ Protection — electrical tape", btn:"LET'S START" },

  // ── Ch1 Cutting ────────────────────────────────────────────
  { t:'chap', scene:'cutting_group', cam:{p:[0,2.5,7],t:[0,0,0]},
    ch:1, chLbl:'CH.1 CUTTING', title:'CUTTING TOOLS',
    text:'Three cutting tools. Each built for a different job. Using the wrong cutter damages the conductor and creates a hidden failure point.' },
  { t:'info', scene:'show_lineman', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.1 CUTTING', title:"LINEMAN'S PLIERS",
    text:"The workhorse of Philippine electrical work. Heavy-duty pliers with a flat gripping jaw and a cutter notch near the pivot. Twists wires together, cuts wire, and grips firmly enough to pull stubborn conductors through conduit.", btn:'NEXT' },
  { t:'info', scene:'show_lineman', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.1 CUTTING', title:'WHEN TO USE',
    text:"✦ Twisting conductors for wire nuts\n✦ Cutting thick wire (AWG 8–12)\n✦ Pulling wire through tight conduit bends\n✦ Tightening large wire nuts on multiway junctions", btn:'HOW TO USE' },
  { t:'info', scene:'anim_lineman', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.1 CUTTING', title:'HOW TO USE',
    text:"Watch the powerful jaws grip and twist solid copper conductors. The long handles provide immense mechanical advantage.", btn:'NEXT' },
  { t:'info', scene:'show_dykes', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.1 CUTTING', title:'DIAGONAL CUTTERS',
    text:"Also called dykes. A smaller cutter with angled jaws that come to a diagonal edge — designed to cut flush against a surface. Where lineman's pliers leave a stub, diagonal cutters can cut wire right at the terminal.", btn:'NEXT' },
  { t:'info', scene:'show_dykes', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.1 CUTTING', title:'WHEN TO USE',
    text:"✦ Trimming excess wire at terminals\n✦ Cutting zip ties flush\n✦ Snipping small-gauge wires (AWG 14–22)\n✦ Working in tight junction boxes where lineman's won't fit", btn:'HOW TO USE' },
  { t:'info', scene:'anim_dykes', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.1 CUTTING', title:'HOW TO USE',
    text:"The angled jaws snip wires cleanly. The sharp cutting edge easily shears through copper.", btn:'NEXT' },
  { t:'info', scene:'show_knife', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.1 CUTTING', title:'UTILITY KNIFE',
    text:"Standard box cutter — used for scoring cable jackets, not individual conductors. Always score LENGTHWISE along the jacket. A lengthwise score cannot reach the conductors below. A circular score almost always nicks one.", btn:'NEXT' },
  { t:'info', scene:'show_knife', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.1 CUTTING', title:'WHEN TO USE',
    text:"✦ Opening NM-B (Romex) outer jacket\n✦ Slitting BX or UF-B cable sheath\n✗ Never use to strip individual conductors — nick risk is too high for most skill levels", btn:'HOW TO USE' },
  { t:'info', scene:'anim_knife', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.1 CUTTING', title:'HOW TO USE',
    text:"The blade extends to score the outer jacket. Always cut away from your body.", btn:'NEXT CHAPTER' },

  // ── Ch2 Gripping ───────────────────────────────────────────
  { t:'chap', scene:'gripping_group', cam:{p:[0,2.5,7],t:[0,0,0]},
    ch:2, chLbl:'CH.2 GRIPPING', title:'GRIPPING TOOLS',
    text:'Two specialized gripping tools. One is for detail work in tight spaces. The other bends rigid metal conduit into precise angles — something no other hand tool can do.' },
  { t:'info', scene:'show_longnose', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.2 GRIPPING', title:'LONG NOSE PLIERS',
    text:"Long tapered jaws that reach into tight spaces where lineman's pliers cannot fit. Bends terminal hooks at wire ends, holds components during soldering, and positions wires in crowded junction boxes.", btn:'NEXT' },
  { t:'info', scene:'show_longnose', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.2 GRIPPING', title:'WHEN TO USE',
    text:"✦ Bending a J-hook or loop at a wire end for a screw terminal\n✦ Reaching into deep junction boxes\n✦ Holding small connectors during installation\n✦ Straightening bent conductor ends", btn:'HOW TO USE' },
  { t:'info', scene:'anim_longnose', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.2 GRIPPING', title:'HOW TO USE',
    text:"The long, tapered jaws easily reach into tight spaces to bend wire into precise hooks for screw terminals.", btn:'NEXT' },
  { t:'info', scene:'show_conduitbender', cam:{p:[0,2,5.5],t:[0,0,0]},
    chLbl:'CH.2 GRIPPING', title:'CONDUIT BENDER',
    text:"A specialized tool for bending rigid EMT or PVC conduit into accurate angles. The curved metal head hooks over the conduit. Angle markings (22.5°, 45°, 90°) guide every bend. The foot step lets you apply consistent downward pressure.", btn:'NEXT' },
  { t:'info', scene:'show_conduitbender', cam:{p:[0,2,5.5],t:[0,0,0]},
    chLbl:'CH.2 GRIPPING', title:'WHEN TO USE',
    text:"✦ Bending conduit at corners (90° offset)\n✦ Saddle bends around obstacles\n✦ Angled drops from panel to floor\n✗ Never hand-force a bend — kinking restricts wire pull-through and weakens the conduit", btn:'HOW TO USE' },
  { t:'info', scene:'anim_conduitbender', cam:{p:[0,2.5,5.5],t:[0,0.5,0]},
    chLbl:'CH.2 GRIPPING', title:'HOW TO USE',
    text:"Applying smooth downward pressure on the foot step bends the rigid pipe cleanly without kinking.", btn:'NEXT CHAPTER' },

  // ── Ch3 Fastening ──────────────────────────────────────────
  { t:'chap', scene:'fastening_group', cam:{p:[0,2.5,7],t:[0,0,0]},
    ch:3, chLbl:'CH.3 FASTENING', title:'FASTENING TOOLS',
    text:'Screwdrivers do more than turn screws. In electrical work they tighten terminal lugs, secure outlet screws, and adjust panel breakers. The right tip type protects both the screw head and your safety.' },
  { t:'info', scene:'show_flathead', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.3 FASTENING', title:'FLATHEAD SCREWDRIVER',
    text:"Single flat blade. Most electrical terminal screws in Philippine outlets, switches, and circuit breakers are slotted (flathead). The tip must fit the slot width exactly — too narrow and it slips, damaging the screw head and risking an arc.", btn:'NEXT' },
  { t:'info', scene:'show_flathead', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.3 FASTENING', title:'WHEN TO USE',
    text:"✦ Tightening terminal lug screws in panels\n✦ Securing outlet and switch wire terminals\n✦ Adjusting breaker screws\n✗ Never use a worn or wrong-size tip — a slipping screwdriver can cause an arc", btn:'HOW TO USE' },
  { t:'info', scene:'anim_flathead', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.3 FASTENING', title:'HOW TO USE',
    text:"The flat blade locks into the slotted terminal. Firm downward pressure while twisting ensures a tight, secure electrical connection.", btn:'NEXT' },
  { t:'info', scene:'show_phillips', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.3 FASTENING', title:'PHILLIPS SCREWDRIVER',
    text:"Cross-shaped tip for Phillips screws. Common on electrical boxes, fixture mounting hardware, and cover plates. The cross tip self-centers — it does not slip off as easily as a flathead, making it safer near live parts.", btn:'NEXT' },
  { t:'info', scene:'show_phillips', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.3 FASTENING', title:'WHEN TO USE',
    text:"✦ Mounting electrical boxes to studs\n✦ Attaching fixture and plate covers\n✦ Securing conduit clamps and panel doors\n✦ Match tip size to screw head (#1, #2, #3) — wrong size damages the head", btn:'HOW TO USE' },
  { t:'info', scene:'anim_phillips', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.3 FASTENING', title:'HOW TO USE',
    text:"The cross shape self-centers perfectly, preventing slip-offs when driving screws into device boxes.", btn:'NEXT CHAPTER' },

  // ── Ch4 Testing & Measuring ────────────────────────────────
  { t:'chap', scene:'testing_group', cam:{p:[0,3,9],t:[0,0,0]},
    ch:4, chLbl:'CH.4 TESTING', title:'TESTING & MEASURING',
    text:'Testing and measuring tools separate a safe electrician from a dangerous one. Every professional touches these tools before touching any conductor.' },
  { t:'info', scene:'show_tester', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'VOLTAGE TESTER',
    text:"A non-contact voltage tester (NCV tester) detects AC voltage through insulation without touching bare wire. Hold the tip near a wire or outlet — an LED and beep indicate voltage is present. The most critical safety tool in any kit.", btn:'NEXT' },
  { t:'info', scene:'show_tester', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'WHEN TO USE',
    text:"✦ Before touching ANY conductor — verify it is dead\n✦ Checking which wire in a bundle is hot\n✦ Confirming a breaker has actually cut power\n✦ Rule: if your tester is not working, stop work until it is fixed", btn:'HOW TO USE' },
  { t:'info', scene:'anim_tester', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.4 TESTING', title:'HOW TO USE',
    text:"Bring the tip near a conductor. If voltage is present, it glows red and beeps. It detects AC fields without physical contact.", btn:'NEXT' },
  { t:'info', scene:'show_multimeter', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'MULTIMETER',
    text:"Measures voltage, current, and resistance. Most-used functions: AC voltage (checking outlet voltage), continuity (confirming a wire is unbroken), and resistance (checking motor windings and connections).", btn:'NEXT' },
  { t:'info', scene:'show_multimeter', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'WHEN TO USE',
    text:"✦ Measuring outlet voltage (should be 220V ± 10%)\n✦ Continuity test — beep means wire is unbroken\n✦ Finding intermittent faults in switches\n✦ Always connect the BLACK probe first in voltage mode", btn:'HOW TO USE' },
  { t:'info', scene:'anim_multimeter', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.4 TESTING', title:'HOW TO USE',
    text:"Turn the dial to the correct setting, then touch the probes to the terminals. The screen displays an accurate digital reading.", btn:'NEXT' },
  { t:'info', scene:'show_fishtape', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'FISH TAPE',
    text:"A long flexible steel or fiberglass tape coiled on a reel. Pushed through installed conduit first — navigating bends — then wire is attached to the end and pulled back through. Without fish tape, wiring through installed conduit is nearly impossible.", btn:'NEXT' },
  { t:'info', scene:'show_fishtape', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'WHEN TO USE',
    text:"✦ Pulling wire through conduit already mounted in place\n✦ Fishing wire through walls and ceilings\n✦ Use wire pulling lubricant on long runs — reduces friction and conductor damage", btn:'HOW TO USE' },
  { t:'info', scene:'anim_fishtape', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.4 TESTING', title:'HOW TO USE',
    text:"The rigid steel tape extends endlessly from the reel, navigating conduit bends. Wires are attached to the hook, then pulled back.", btn:'NEXT' },
  { t:'info', scene:'show_measuringtape', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'MEASURING TAPE',
    text:"Standard tape measure for planning conduit runs, locating junction boxes, and cutting wire to length. Always add 15–20% extra wire length — a too-short wire means splicing inside a wall, which is a code violation.", btn:'NEXT' },
  { t:'info', scene:'show_measuringtape', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.4 TESTING', title:'WHEN TO USE',
    text:"✦ Measuring conduit runs and cutting to length\n✦ Locating stud positions for box mounting\n✦ Planning wire routing paths\n✦ Always measure in straight lines, then add extra for routing bends", btn:'HOW TO USE' },
  { t:'info', scene:'anim_measuringtape', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.4 TESTING', title:'HOW TO USE',
    text:"The metal blade extends and locks for accurate measurements of walls, wire, and conduit.", btn:'NEXT CHAPTER' },

  // ── Ch5 Protection ─────────────────────────────────────────
  { t:'chap', scene:'show_tape', cam:{p:[0,2,5.5],t:[0,0,0]},
    ch:5, chLbl:'CH.5 PROTECTION', title:'ELECTRICAL TAPE',
    text:'The final protection layer. Used in almost every connection to ensure nothing remains exposed.' },
  { t:'info', scene:'show_tape', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.5 PROTECTION', title:'ELECTRICAL TAPE',
    text:"Vinyl insulating tape — black is most common in the Philippines. Rated for 600V and 80°C. Stretchy so it conforms to wire shapes and connector contours without gaps. Overlap half the tape width on each wrap — no gaps, no exposed copper.", btn:'NEXT' },
  { t:'info', scene:'show_tape', cam:{p:[0,1.8,4.5],t:[0,0,0]},
    chLbl:'CH.5 PROTECTION', title:'WHEN TO USE',
    text:"✦ Insulating wire nut connections (tape over the nut)\n✦ Temporary insulation on exposed conductors\n✦ Color-coding phase wires (red, black, yellow bands)\n✗ Not a substitute for proper connectors — tape alone cannot hold a live connection", btn:'HOW TO USE' },
  { t:'info', scene:'anim_tape', cam:{p:[0,2.5,4.5],t:[0,0.5,0]},
    chLbl:'CH.5 PROTECTION', title:'HOW TO USE',
    text:"The tape is stretched as it's wrapped around connections. This stretching ensures a tight, gap-free insulating layer.", btn:'NEXT CHAPTER' },

  // ── Ch6 Safety ─────────────────────────────────────────────
  { t:'chap', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    ch:6, chLbl:'CH.6 SAFETY', title:'TOOL SAFETY',
    text:'Four rules every licensed electrician follows without exception. Skip one and a tool becomes a hazard.' },
  { t:'info', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'CH.6 SAFETY', title:'INSPECT BEFORE USE',
    text:"Before every job: inspect each tool for cracked handles, broken insulation, and damaged jaws. A cracked screwdriver handle means no electrical insulation between your hand and the live conductor. Replace damaged tools immediately — never tape a cracked handle.", btn:'NEXT' },
  { t:'info', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'CH.6 SAFETY', title:'USE THE RIGHT TOOL',
    text:"Most dangerous misuse on Philippine job sites: using lineman's pliers as a hammer, or a flathead screwdriver as a pry bar. Every tool is rated for a specific load. Exceeding it causes sudden failure — and if you are working live, that failure becomes a fault.", btn:'NEXT' },
  { t:'info', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'CH.6 SAFETY', title:'INSULATED HANDLES',
    text:"All electrician's tools must have VDE-rated insulated handles — 1000V AC minimum. Look for the VDE symbol (double triangle) on the handle. Tools without VDE rating are for general construction, not electrical work.", btn:'NEXT' },
  { t:'info', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'CH.6 SAFETY', title:'STORE PROPERLY',
    text:"Tools stored loose in a bag chip and dull against each other. Nicked cutting jaws leave rough wire cuts that create resistance hot spots. Store each tool in a designated pocket or hanging rack. Keep cutting edges away from metal-on-metal contact.", btn:'NEXT CHAPTER' },

  // ── Quiz ───────────────────────────────────────────────────
  { t:'qintro', scene:'all_tools', cam:{p:[0,5,13],t:[0,0,0]},
    chLbl:'QUIZ', title:'TOOL KNOWLEDGE CHECK',
    text:"6 scenario-based questions. Think about what you just learned — when each tool is used, why it matters, and what happens when you choose the wrong one.", btn:'START QUIZ' },
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
.etl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}
.etl-top{height:52px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(0,212,255,.15);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;}
.etl-back{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:7px 13px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.etl-chlbl{flex:1;text-align:center;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,.5);}
.etl-prog{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(0,212,255,.6);white-space:nowrap;}

.etl-scene{height:44vh;min-height:200px;max-height:320px;position:relative;flex-shrink:0;background:#07101f;overflow:hidden;}
.etl-canvas{display:block;}

.etl-dialog{background:rgba(4,8,18,.97);border-top:1px solid rgba(0,212,255,.12);padding:14px 16px 18px;display:flex;flex-direction:column;gap:9px;flex:1;overflow-y:auto;min-height:0;}
.etl-dlg-title{font-size:13px;font-weight:900;letter-spacing:2px;color:#00d4ff;}
.etl-dlg-body{font-size:12px;color:rgba(255,255,255,.75);line-height:1.65;white-space:pre-line;}
.etl-dlg-btn{align-self:flex-end;padding:11px 26px;background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;border:none;border-radius:10px;font-family:'Exo 2',sans-serif;font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-top:2px;}

.etl-chap-wrap{display:flex;flex-direction:column;align-items:center;gap:5px;padding:4px 0;}
.etl-chap-num{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:4px;color:rgba(0,212,255,.6);}
.etl-chap-title{font-size:20px;font-weight:900;letter-spacing:3px;color:#fff;}
.etl-chap-body{font-size:12px;color:rgba(255,255,255,.6);line-height:1.5;text-align:center;}

.etl-quiz-q{font-size:13px;font-weight:700;color:#fff;line-height:1.5;}
.etl-quiz-opts{display:flex;flex-direction:column;gap:6px;}
.etl-quiz-opt{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 14px;font-size:12px;color:rgba(255,255,255,.8);font-family:'Exo 2',sans-serif;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .12s,border-color .12s;}
.etl-quiz-opt:active{background:rgba(0,212,255,.15);}
.etl-quiz-opt.correct{background:rgba(45,198,83,.2);border-color:#2dc653;color:#2dc653;}
.etl-quiz-opt.wrong{background:rgba(255,68,68,.15);border-color:#ff4444;color:#ff4444;}
.etl-quiz-hint{font-size:11px;color:rgba(255,255,255,.5);line-height:1.5;font-style:italic;}
.etl-quiz-next{align-self:flex-end;padding:10px 22px;background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;border:none;border-radius:10px;font-family:'Exo 2',sans-serif;font-size:11px;font-weight:800;letter-spacing:1px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.etl-quiz-prog{display:flex;gap:5px;align-self:center;}
.etl-quiz-pip{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.15);}
.etl-quiz-pip.done{background:#2dc653;}
.etl-quiz-pip.active{background:#00d4ff;}
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
        <div class="etl-scene" id="etl-scene"><canvas id="etl-canvas" class="etl-canvas"></canvas></div>
        <div class="etl-dialog" id="etl-dialog"></div>
      </div>`;
    el.querySelector('.etl-back').addEventListener('click', () => this.state.setState('stagesHub'));
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

    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this._renderer.setSize(w, h);
    this._renderer.setClearColor(0x0a0e18);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.1;

    this._scene  = new THREE.Scene();
    this._scene.background = new THREE.Color(0x0a0e18);
    this._scene.fog = new THREE.FogExp2(0x0a0e18, 0.022);
    this._camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);

    const c0 = STEPS[0].cam;
    this._camera.position.set(...c0.p);
    this._camTarget.set(...c0.t);
    this._camera.lookAt(this._camTarget);
    this._targetCam = c0;

    // Lighting + realistic workbench (benchY=0 to match tool positioning)
    buildLightingRig(this._scene);
    buildWorkbench(this._scene, { benchY: -0.07, benchW: 15, benchD: 5 });

    // Build all 12 tool groups upfront
    for (const def of TOOL_DEFS) {
      const group = this[`_build_${def.id}`](def);
      group.visible = false;
      this._scene.add(group);
      this._toolMeshes[def.id] = group;
      group.userData.baseY     = group.position.y;
      group.userData.baseRx    = group.rotation.x;
      group.userData.baseScale = group.scale.x;
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

    if (sceneName.startsWith('show_') || sceneName.startsWith('anim_')) {
      const id = sceneName.split('_')[1];
      const m = this._toolMeshes[id];
      if (m) {
        const by = m.userData.baseY ?? 0;
        m.visible = true;
        m.position.set(0, by + 0.7, 0);
        m.rotation.set(m.userData.baseRx ?? 0, 0.4, 0);
        m.scale.setScalar((m.userData.baseScale ?? 1) * 2.0);
      }
      
      if (sceneName.startsWith('anim_')) {
        this._animProps = new THREE.Group();
        this._animProps.position.set(0, 0.7, 0);
        this._scene.add(this._animProps);
        
        if (id === 'lineman' || id === 'dykes') {
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 12), this._mat(0xcc3333, 0.1, 0.7));
          wire.rotation.z = Math.PI / 2;
          wire.position.set(0, 0.25, 0);
          this._animProps.add(wire);
        } else if (id === 'flathead' || id === 'phillips') {
          const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16), this._mat(0x888888, 0.8, 0.2));
          screw.position.set(0, -0.4, 0);
          this._animProps.add(screw);
        } else if (id === 'tester') {
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 12), this._mat(0x111111, 0.1, 0.7));
          wire.rotation.z = Math.PI / 2;
          wire.position.set(0, -0.5, 0);
          this._animProps.add(wire);
        }
      }
      return;
    }

    if (sceneName === 'quiz') {
      const q = step?.qi != null ? QUIZ[step.qi] : null;
      if (q?.vis) {
        const m = this._toolMeshes[q.vis];
        if (m) {
          const by = m.userData.baseY ?? 0;
          m.visible = true;
          m.position.set(0, by + 0.7, 0);
          m.rotation.set(m.userData.baseRx ?? 0, 0.4, 0);
          m.scale.setScalar((m.userData.baseScale ?? 1) * 2.0);
        }
      }
    }
  }

  // ── STEP SYSTEM ──────────────────────────────────────────────

  _gotoStep(i) {
    this._step = i;
    this._quizAnswered = false;
    const step = STEPS[i];
    this._el.querySelector('#etl-chlbl').textContent = step.chLbl ?? 'TOOLS';
    this._el.querySelector('#etl-prog').textContent  = `${i + 1}/${STEPS.length}`;
    this._applyScene(step.scene, step);
    this._renderDialog(step);
  }

  _renderDialog(step) {
    const dlg = this._el.querySelector('#etl-dialog');

    if (step.t === 'chap') {
      dlg.innerHTML = `
        <div class="etl-chap-wrap">
          <div class="etl-chap-num">CHAPTER ${step.ch}</div>
          <div class="etl-chap-title">${step.title}</div>
          <div class="etl-chap-body">${step.text}</div>
        </div>
        <button class="etl-dlg-btn" id="etl-btn">NEXT →</button>`;
      dlg.querySelector('#etl-btn').addEventListener('click', () => this._onNext());
      return;
    }

    if (step.t === 'quiz') {
      const q = QUIZ[step.qi];
      const pips = QUIZ.map((_, i) => {
        const cls = i < step.qi ? 'done' : i === step.qi ? 'active' : '';
        return `<div class="etl-quiz-pip ${cls}"></div>`;
      }).join('');
      dlg.innerHTML = `
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
        <div style="font-family:'Share Tech Mono',monospace;font-size:13px;color:${scoreColor}">QUIZ: ${this._quizScore}/${QUIZ.length} CORRECT</div>
        <div class="etl-dlg-body">${step.text}</div>
        <button class="etl-dlg-btn" id="etl-btn" style="background:linear-gradient(135deg,#2dc653,#00d4ff)">${step.btn}</button>`;
      dlg.querySelector('#etl-btn').addEventListener('click', () => this._onNext());
      return;
    }

    // info / qintro
    dlg.innerHTML = `
      ${step.title ? `<div class="etl-dlg-title">${step.title}</div>` : ''}
      <div class="etl-dlg-body">${step.text}</div>
      <button class="etl-dlg-btn" id="etl-btn">${step.btn ?? 'NEXT →'}</button>`;
    dlg.querySelector('#etl-btn').addEventListener('click', () => this._onNext());
  }

  _onNext() {
    const step = STEPS[this._step];
    if (step.t === 'done') {
      Database.completeLesson('electricianTools');
      Database.saveLearnStage('electricianTools');
      this.state.setState('stagesHub');
      return;
    }
    if (this._step < STEPS.length - 1) this._gotoStep(this._step + 1);
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

    // Float + rotate visible tools in show/quiz scenes
    const step = STEPS[this._step];
    const isAnim = step?.scene?.startsWith('anim_');
    const floating = step?.scene?.startsWith('show_') || step?.scene === 'quiz';
    
    if (floating) {
      for (const m of Object.values(this._toolMeshes)) {
        if (m.visible) {
          const by = m.userData.baseY ?? 0;
          m.rotation.y = Math.sin(t * 0.5) * 0.7;
          m.position.y += (by + 0.45 + Math.sin(t * 0.9) * 0.1 - m.position.y) * 0.04;
        }
      }
    } else if (isAnim) {
      const id = step.scene.split('_')[1];
      const m = this._toolMeshes[id];
      if (m) {
        const by = m.userData.baseY ?? 0;
        // Fix position in view
        m.position.y += (by + 0.7 - m.position.y) * 0.1;
        m.rotation.y += (0.4 - m.rotation.y) * 0.1;
        
        // Tool-specific animations
        const animT = t * 3.0; // speed multiplier
        if (id === 'lineman' || id === 'dykes' || id === 'longnose') {
          // Jaws open and close
          const angle = (Math.sin(animT) * 0.5 + 0.5) * 0.2; // 0 to 0.2 rads
          if (m.userData.armA) m.userData.armA.rotation.z = angle;
          if (m.userData.armB) m.userData.armB.rotation.z = -angle;
        } else if (id === 'knife') {
          m.position.z = Math.sin(animT) * 0.2;
        } else if (id === 'flathead' || id === 'phillips') {
          m.rotation.y = t * 2.0; // continuous spin
          m.position.y = by + 0.6 + Math.sin(animT) * 0.05; // slight up/down
        } else if (id === 'tester') {
          m.position.y = by + 0.7 + Math.sin(animT * 0.5) * 0.3; // move toward wire
          m.rotation.x = Math.PI / 4;
          // Emissive flash when close
          const led = m.children.find(c => c.geometry.type === 'SphereGeometry');
          if (led && led.material.emissive) {
            led.material.emissiveIntensity = m.position.y < (by + 0.5) ? (Math.sin(t * 20) > 0 ? 2 : 0) : 0;
          }
        } else if (id === 'conduitbender') {
          m.rotation.z = Math.sin(animT * 0.5) * 0.4; // rock back and forth
        } else if (id === 'tape') {
          m.rotation.z = -t * 3.0; // unroll tape
        } else {
          // Default gentle float for others
          m.rotation.y += Math.sin(t) * 0.005;
        }
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
    }
  }
}




ELECTROTECH SIM
Electrician Training Simulation Game
Master Game Design Document  |  Version 1.0


FIELD	DETAIL
Genre	3D First-Person Electrician Simulation / Serious Game
Platform	Android Mobile (APK via Cordova), expandable to iOS & Web
Engine/Tech	Three.js (3D) + Apache Cordova (Mobile Packaging)
Target Users	TESDA Electrician Trainees, Vocational Students, Self-Learners
Tone	Realistic, Procedural, Mistake-Driven Learning
Est. MVP Dev Time	8-12 weeks (solo) / 4-6 weeks (team of 3)
Document Version	1.0 — Full Master GDD
Last Updated	2025


 
TABLE OF CONTENTS

1. Game Overview & Vision
2. Core Game Philosophy
3. Technical Architecture
4. Project Structure & File Tree
5. Game States & Application Flow
6. 3D Environment Design
7. Player Controller & Camera System
8. Tool System
9. Wiring & Circuit System
10. Safety & Feedback System
11. Level Design (All Levels)
12. UI/UX Design
13. Audio System
14. Scoring & Progression System
15. Learning & Hint System
16. Exam Mode
17. Save System & Data Persistence
18. Asset List
19. MVP Build Roadmap
20. Sprint Plan
21. Bug & QA Checklist
22. Future Features
 
  SECTION 1 — GAME OVERVIEW & VISION

1.1 What Is ElectroTech Sim?
ElectroTech Sim is a first-person, 3D mobile simulation game where the player takes on the role of an electrician-in-training. Unlike arcade games, ElectroTech Sim is a slow, precise, and thinking-based experience that replicates real-world electrical work — from reading schematics, selecting tools, running wires, to testing live circuits.
The game is designed to mirror the TESDA NC II Electrician qualification standard, giving students a risk-free digital environment to practice, fail safely, and build muscle memory for real fieldwork.

1.2 Core Vision Statement
Vision
"Make players feel like real electricians. Every action, tool, wire, and mistake should teach something real."

The game should be SO realistic in procedure that completing it gives the player genuine confidence before touching real equipment.

1.3 What This Game Is & Is NOT
ASPECT	DESCRIPTION
IS NOT Arcade	No fast-paced gameplay, no coins, no enemies, no timers by default
IS NOT Casual	Requires thinking, schematic reading, and procedural accuracy
IS Simulation	Mimics real electrician workflow step-by-step
IS Educational	Aligned with TESDA NC II competency standards
IS Mistake-Driven	Players learn by doing wrong things and fixing them
IS Mobile-First	Designed for Android touchscreen, portrait and landscape

1.4 Player Experience Goal
When a player opens the game, within the first 30 seconds they should feel:
•	Immersed — the environment looks and sounds like a real training workshop
•	Purposeful — they know they are training to be an electrician
•	Confident — the UI is clear and does not overwhelm
•	Curious — they want to touch things and explore
 
  SECTION 2 — CORE GAME PHILOSOPHY

2.1 The Three Pillars
PILLAR	DESCRIPTION
Pillar 1: Realism	All wiring procedures, tools, and safety rules mirror real Philippine electrical standards (PEC). No shortcuts. No fantasy.
Pillar 2: Learning by Failure	The game NEVER punishes failure. It uses failure as a teaching moment. Every mistake produces an educational consequence — sparks, open circuits, or wrong readings.
Pillar 3: Guided → Free	Early levels hold the player's hand completely. Late levels give full freedom. The scaffolding disappears gradually like real training.

2.2 Core Gameplay Loop
Every single level — from Level 1 to the final exam — follows this exact loop:
1.	READ — Player reads the objective and studies the schematic diagram
2.	PLAN — Player mentally maps the circuit before touching anything
3.	EXECUTE — Player physically moves, selects tools, and performs the wiring
4.	TEST — Player powers on the circuit and observes behavior
5.	DIAGNOSE — If something fails, player uses tools to find the fault
6.	FIX — Player corrects the mistake
7.	COMPLETE — System reacts correctly (light on, motor runs, etc.)
8.	EVALUATE — Player receives score, time, and mistake breakdown

2.3 Difficulty Curve
The game uses a strict difficulty ramp. No level skipping is allowed.
STAGE	DESCRIPTION
Levels 1-3	GUIDED — Every step highlighted, wrong actions blocked, instant hints
Levels 4-6	SEMI-GUIDED — Step highlights fade, hints available on request only
Levels 7-9	FREE PLAY — No guidance. Player must remember procedures.
Level 10+	EXAM — Timed, no hints, no retries. Single submission.
 
  SECTION 3 — TECHNICAL ARCHITECTURE

3.1 Technology Stack
COMPONENT	TECHNOLOGY
3D Rendering	Three.js r128 — WebGL-based 3D engine running in browser/WebView
Mobile Container	Apache Cordova — wraps the Three.js app into an Android APK
Physics	Cannon.js or custom collision detection for player movement
UI Layer	HTML/CSS overlay on top of Three.js canvas (absolutely positioned)
Audio	Howler.js — cross-platform audio with mobile support
State Management	Vanilla JavaScript state machine (no framework)
Storage	Cordova LocalStorage plugin for save data
Build System	Webpack + Babel for bundling; Cordova CLI for packaging
Target Device	Android 8.0+ (API 26+), 2GB RAM minimum

3.2 Architecture Overview
The game follows a layered architecture:
•	Layer 1 — Core Engine: Three.js scene, renderer, camera, lighting
•	Layer 2 — Game Logic: State machine, circuit solver, scoring engine
•	Layer 3 — Interaction System: Raycaster-based touch/click picking
•	Layer 4 — UI Layer: HTML overlay for HUD, menus, dialogs, schematics
•	Layer 5 — Audio Layer: Howler.js sound manager
•	Layer 6 — Platform Layer: Cordova plugins for storage, vibration, screen lock

3.3 State Machine
The entire game runs on a single JavaScript State Machine. Every screen, every action, every transition is a state. There is no global spaghetti code — everything flows through the state machine.
STATE	DESCRIPTION
APP_INIT	App startup, asset loading, splash screen
MAIN_MENU	Main menu display
LEVEL_SELECT	Level selection screen
LEVEL_LOADING	Loading 3D scene assets for selected level
ORIENTATION	Player spawns, ambient observation phase
SCHEMATIC_VIEW	2D schematic diagram displayed
FREE_EXPLORE	Player moves around environment
TOOL_SELECTED	A tool is active in player's hand
WIRING_MODE	Player is dragging a wire between terminals
TESTING_MODE	Power is ON, circuit being evaluated
TROUBLESHOOT	Player is diagnosing a fault
LEVEL_COMPLETE	Success screen with score
LEVEL_FAIL	Fail screen (Exam Mode only)
EXAM_MODE	Special timed state
PAUSE_MENU	Game paused
SETTINGS	Settings screen
 
  SECTION 4 — PROJECT FILE STRUCTURE

4.1 Root Directory
Project Folder Tree
electrotech-sim/
  /www                     <-- Main web app (served by Cordova)
    /assets
      /models              <-- 3D .glb / .obj models
      /textures            <-- PBR textures for walls, floors, equipment
      /audio               <-- .mp3 / .ogg sound files
      /schematics          <-- .svg / .png schematic diagrams
      /icons               <-- UI icon sprites
    /js
      main.js              <-- App entry point, bootstrapper
      StateMachine.js      <-- Central state controller
      SceneManager.js      <-- Three.js scene setup and teardown
      PlayerController.js  <-- Player movement, camera, look controls
      InteractionSystem.js <-- Raycaster, touch picking, hover effects
      WiringSystem.js      <-- Wire drag logic, terminal validation
      CircuitSolver.js     <-- Evaluates if circuit is complete and correct
      ToolManager.js       <-- Tool inventory, tool selection, tool actions
      SafetySystem.js      <-- Short circuit detection, safety rule checks
      HintSystem.js        <-- Hint logic, step highlighting
      ScoringEngine.js     <-- Tracks time, mistakes, accuracy
      AudioManager.js      <-- Howler.js wrapper, sound triggers
      SaveManager.js       <-- LocalStorage read/write for progress
      UIManager.js         <-- HTML overlay control (show/hide panels)
      LevelLoader.js       <-- Loads level JSON configs
      /levels              <-- One JS/JSON file per level definition
        Level1.js
        Level2.js
        ...
    /css
      main.css             <-- Global UI styles
      hud.css              <-- HUD-specific styles
      menus.css            <-- Menu screens
    index.html             <-- App shell (canvas + UI overlay)
  /platforms               <-- Cordova platform builds (Android/iOS)
  /plugins                 <-- Cordova plugins
  config.xml               <-- Cordova app config
  package.json
  webpack.config.js
 
  SECTION 5 — GAME STATES & APPLICATION FLOW

5.1 First Launch Flow
9.	App opens → Splash screen (logo, 2 seconds)
10.	Check SaveManager → first time? Show onboarding / else show main menu
11.	Onboarding: 3 slides explaining game concept (swipeable)
12.	Player enters name → saved to localStorage
13.	Main menu loads

5.2 Main Menu Items
•	Play — Goes to Level Select screen
•	Continue — Loads last saved level
•	Exam Mode — Goes to Exam Select (locked until Level 5 completed)
•	Settings — Audio, graphics quality, controls sensitivity
•	Credits — Developer info

5.3 Level Select Flow
14.	Show grid of levels (3 per row)
15.	Each level card shows: Level number, Name, Best score, Star rating, Lock status
16.	Player taps level → level detail popup (objective summary + start button)
17.	Press Start → LevelLoader.js fetches level config → SceneManager builds scene
18.	Loading screen shows tips while assets load
19.	Scene ready → transition to ORIENTATION state

5.4 In-Level Flow (Step by Step)
PHASE	WHAT HAPPENS
ORIENTATION	Player spawns. Camera pans slowly around room. UI says 'Observe your workspace.' Timer is NOT running. No tools available yet.
READ OBJECTIVE	Player taps the clipboard icon. Objective card slides in. Reads: Task, Materials needed, Safety warning.
SCHEMATIC VIEW	Player taps Diagram button. 2D schematic overlays screen. Player can zoom/pan. Player taps 'I understand' to continue.
FREE EXPLORE	Player walks freely. Can inspect objects by tapping. Components show name labels on hover. Timer starts NOW.
TOOL SELECT	Player opens tool belt (swipe up). Taps tool to equip. Equipped tool shown in bottom-right corner.
WIRING	Player taps start terminal. Drag line appears. Drag to target terminal. Drop to connect. Validation fires immediately.
POWER TEST	Player taps Power ON button. Circuit solver runs. Visual/audio feedback based on result.
TROUBLESHOOT	If failed, diagnostic hints appear. Player uses Voltage Tester or Multimeter to find fault.
COMPLETE	All components function correctly. Celebration animation. Score screen fades in.
 
  SECTION 6 — 3D ENVIRONMENT DESIGN

6.1 Environment Rooms
ROOM	DESCRIPTION
Training Lab	Levels 1-3. Clean, simple room. White walls. One panel, one work bench. Bright lighting. Used for single-circuit tasks.
House Wiring Room	Levels 4-6. Simulated living room with multiple outlets, switches, light fixtures. Wall panels exposed to show wiring.
Industrial Panel Room	Levels 7-9. Large room with 3-phase panels, motor starters, breakers. Warning signs on walls. Dim industrial lighting.
Exam Room	Level 10+. Neutral room. Mixed equipment from all previous rooms. No labels. No helpers.

6.2 3D Asset List Per Room
•	Floor: Concrete or tile texture (PBR — roughness 0.8, metalness 0.1)
•	Walls: Painted concrete or drywall, some with cable conduits
•	Ceiling: Drop tile ceiling with fluorescent lights (with emissive material)
•	Panel Board: Metal breaker panel, openable, terminals inside
•	Work Bench: Wooden bench for laying out tools and components
•	Components: Switch, outlet, light bulb holder, motor starter, conduit pipes
•	Wires: Rendered as CatmullRomCurve3 tubes (colored: black, white, green/yellow ground)
•	Labels: Text sprites that appear on hover

6.3 Lighting Setup
LIGHT TYPE	SPECIFICATION
Ambient Light	Low intensity (0.3) warm-white — fills shadows softly
Directional Light	Simulates sunlight/ceiling main light (intensity 1.0)
Point Lights	From fluorescent tubes on ceiling (intensity 0.8, range 10m)
Emissive Materials	Panel indicator lights, live wires glow faintly orange when powered
Spark Effect	Particle system (Points geometry) — red/orange, short burst, on short circuit
 
  SECTION 7 — PLAYER CONTROLLER & CAMERA SYSTEM

7.1 Movement
ACTION	IMPLEMENTATION
Forward/Backward	Virtual joystick (left thumb) — translates player forward/back along camera direction
Strafe Left/Right	Virtual joystick X-axis
Look / Turn	Touch drag on right half of screen — rotates camera horizontally and vertically
Walk Speed	1.5 m/s normal, 0.8 m/s when tool is active (careful mode)
Crouch	Button to crouch — needed to access low terminals
Collision	Raycaster-based wall collision. Player cannot walk through objects.
Boundaries	Invisible boundary walls prevent leaving play area

7.2 Camera Behavior
•	Default: First-person perspective, FOV 75 degrees
•	Inspection Mode: When player taps an object, camera smoothly lerps closer (zoom in)
•	Schematic Mode: Camera freezes, 2D overlay appears on top
•	Mistake Shake: On wrong wiring or short circuit, camera applies a 0.3s screen shake (THREE.Vector3 noise)
•	Transition: On level load, camera does a slow pan (cinematic intro, 3 seconds)

7.3 Interaction Raycaster
The InteractionSystem.js uses THREE.Raycaster on every touch/tap event. The ray is cast from the camera center into the 3D scene. If it hits an interactive object (tagged with userData.interactive = true), the interaction fires.
•	Tap once: Inspect / highlight object
•	Tap tool icon then tap terminal: Begin wire connection
•	Long press: Open context menu (e.g., 'Open Panel', 'Read label')
•	Double tap: Quick look / zoom in on small component
•	Drag: Move wire endpoint to target terminal
 
  SECTION 8 — TOOL SYSTEM

8.1 Tool Inventory
TOOL	FUNCTION	UNLOCKS AT
Wire Tool	Drag and drop to connect terminals. Default tool. Always available.
Screwdriver (Flathead)	Tap panel to open it. Tap screw terminals to tighten/loosen connections.
Screwdriver (Phillips)	Required for cover plates and fixture mounting.
Voltage Tester (Non-Contact)	Tap a wire → shows if voltage is present (visual glow + beep). Two states: LIVE (red) / DEAD (green).
Multimeter	Advanced. Tap two probes on circuit points. Shows DC Voltage, AC Voltage, Resistance, Continuity.
Wire Stripper	Required in advanced levels to prepare wire ends before connecting.
Conduit Bender	Used in industrial levels to route conduit pipes.
Circuit Tester / Continuity Probe	Confirms complete path between two points.

8.2 Tool Belt UI
•	Tool belt is a horizontal scroll tray that appears when player swipes UP from bottom
•	Equipped tool appears in bottom-right corner as a 3D model preview
•	Tool glows subtly when player hovers over a compatible interaction point
•	Locked tools are shown grayed out with a lock icon and level requirement
•	Tool selection plays a satisfying 'snap' sound

8.3 Tool State Logic
Each tool has three states: IDLE (in belt), EQUIPPED (in hand), and ACTIVE (performing action). The ToolManager.js tracks the currently equipped tool and fires the correct action method based on what the raycaster hits.
 
  SECTION 9 — WIRING & CIRCUIT SYSTEM

9.1 Wire Rendering
•	Wires are rendered as THREE.TubeGeometry following a CatmullRomCurve3
•	Wire radius: 0.015 units (visible but not bulky)
•	Wire colors: Black (Line), White (Neutral), Green/Yellow (Ground), Red (secondary phase)
•	While dragging, a ghost wire (semi-transparent, dashed line) follows finger
•	On snap: wire solidifies, color confirms (green border = correct, red = wrong)
•	Wires can be re-routed by tapping and dragging a midpoint

9.2 Terminal System
Every connectable point in the game is a Terminal object. Terminals have the following data:
•	id — unique string identifier (e.g., 'panel_L1', 'switch_in', 'bulb_a')
•	type — LINE / NEUTRAL / GROUND / LOAD
•	accepts — array of terminal types it can validly connect to
•	connected — boolean, true when a wire is attached
•	voltage — current voltage value (updated by CircuitSolver every frame)

9.3 Circuit Solver
The CircuitSolver.js runs a graph traversal every time a wire is connected or disconnected. It checks:
20.	Is there a complete path from POWER SOURCE to LOAD?
21.	Does the path follow correct wire type rules? (Line to Line input, Neutral to Neutral, etc.)
22.	Is there a ground connection where required?
23.	Are there any unintended paths (short circuits)?
24.	Are all required components (switch, breaker, etc.) in the path?
The solver uses a simple adjacency-list graph where each terminal is a node and each wire is an edge.

9.4 Connection Validation Rules
CONDITION	RESULT
Correct type-to-type	Line input to Line input on load → VALID, no error
Type mismatch	Line to Neutral → INVALID. Wire turns red, error popup.
Polarity reversal	Reversed polarity on DC circuit → FAULT (no physical damage, but meter shows reversed reading)
Short circuit	Line directly to Neutral with no load → SHORT CIRCUIT. Spark effect + screen shake + breaker trips.
Ground fault	Line connected to Ground → GROUND FAULT. Safety warning.
Overload	Too many loads on single breaker → OVERLOAD message. Breaker trips.
Open circuit	Missing wire in the path → OPEN CIRCUIT. Nothing powers on.
 
  SECTION 10 — SAFETY & FEEDBACK SYSTEM

10.1 Real-Time Safety Validation
The SafetySystem.js runs parallel to the CircuitSolver. Before power is turned on, it can give warnings. After power is on, it catches faults instantly.

10.2 Feedback Types
FEEDBACK TYPE	TRIGGER & BEHAVIOR
Snap + Green Flash	Wire connected correctly to valid terminal. Soft click sound.
Red Flash + Buzz	Wire connected to wrong terminal type. Wire does not snap. Error message shows.
Spark Particle Effect	Short circuit or ground fault. Lasts 1.5 seconds. Breaker animation trips.
Screen Shake	Any dangerous fault. Lasts 0.3 seconds. Intensity scales with severity.
Warning Banner	Yellow banner at top of screen: 'CAUTION: Check your ground connection'
Error Card	Modal dialog with: Error Name, What happened, Why it matters, How to fix it
Hint Arrow	In guided mode only: glowing arrow pointing at next correct action
Multimeter Readings	Real values: 0V on open circuit, 220V on live, OL on overload, beep on continuity

10.3 Mistake Tracking
Every mistake is logged by the ScoringEngine.js with:
•	Mistake type (wrong connection, short circuit, wrong tool, etc.)
•	Timestamp (seconds into the level)
•	The component/terminal involved
•	Whether player fixed it immediately or needed a hint
This data appears on the score screen and is saved to the player's profile for review.
 
  SECTION 11 — LEVEL DESIGN (ALL LEVELS)

11.1 Level 1 — The First Connection
FIELD	DETAIL
Objective	Connect a single-pole switch to control a light bulb
Room	Training Lab
Components	1x Panel with single breaker, 1x Switch, 1x Light bulb, Pre-stripped wires
Tools Available	Wire Tool only
Circuit	Panel L1 → Switch IN → Switch OUT → Bulb → Panel Neutral
Guidance	FULL — every step highlighted, wrong wires blocked
Win Condition	Switch toggles light ON and OFF correctly
Mistakes Possible	Connecting LINE to NEUTRAL directly, skipping switch
Learning Goal	Basic series circuit: Source → Control → Load → Return

11.2 Level 2 — Add the Ground
FIELD	DETAIL
Objective	Wire a grounded outlet (duplex receptacle) correctly
Room	Training Lab
Components	Panel, duplex outlet, 3-wire cable (black, white, green)
Tools Available	Wire Tool, Screwdriver (Flathead)
Circuit	Hot (black) to brass screw, Neutral (white) to silver screw, Ground (green) to green screw
New Mechanic	Screwdriver required to tighten terminal screws
Win Condition	Outlet passes receptacle tester (3 lights green)
Learning Goal	Understanding wire color codes and outlet terminal identification

11.3 Level 3 — 3-Way Switch
FIELD	DETAIL
Objective	Wire a 3-way switch circuit (control light from two locations)
Room	Training Lab
Components	Panel, 2x 3-way switches, 1x light, 3-wire cable
Tools Available	Wire Tool, Voltage Tester
Guidance	SEMI-GUIDED — schematic must be consulted
Learning Goal	Traveler wires concept, common terminal identification

11.4 Level 4 — Branch Circuit
FIELD	DETAIL
Objective	Wire a branch circuit with a breaker, two outlets, and one light fixture
Room	House Wiring Room
Tools Available	Wire Tool, Screwdriver, Voltage Tester, Multimeter
New Mechanic	Multimeter introduced — measure voltage at each outlet after completion
Learning Goal	Parallel wiring, branch circuit loading, multimeter usage

11.5 Levels 5-6 — House Wiring
•	Level 5: Full bedroom wiring — outlets, ceiling fan, switch, GFCI protection
•	Level 6: Fault finding — a pre-wired circuit has 3 hidden faults, player must find and fix all

11.6 Levels 7-9 — Industrial
•	Level 7: 3-phase panel — identify L1, L2, L3, Neutral, Ground on industrial panel
•	Level 8: Motor starter circuit — wire DOL starter (Direct-On-Line) for 3-phase motor
•	Level 9: Control circuit — add push-button START/STOP to motor starter with indicator light

11.7 Level 10 — Final Exam
FIELD	DETAIL
Objective	Complete a full residential distribution board from scratch
Timer	45 minutes (real time)
Hints	NONE
Guidance	NONE
Grading	Pass: 80%+ accuracy. Fail: retry next day (simulates real exam conditions)
Components	Main breaker, 6 branch circuit breakers, outlets, switches, lights, GFCI
 
  SECTION 12 — UI/UX DESIGN

12.1 HUD Elements (Always On Screen)
POSITION	CONTENT
Top-Left	Level name and objective summary (tap to expand full objective card)
Top-Right	Timer (counting up, red when > 80% of par time), Mistake counter
Bottom-Left	Virtual joystick (visible only when touched)
Bottom-Center	Tool belt toggle button (swipe up or tap to open)
Bottom-Right	Currently equipped tool icon + Interact button
Top-Center	Contextual messages (error banners, hints, warnings)

12.2 Schematic View UI
•	Schematic is a full-screen overlay with a semi-transparent dark background
•	SVG-based schematic diagram, pinch-to-zoom, drag-to-pan
•	Clickable components — tapping a component on schematic highlights it in 3D world
•	Legend panel on the right (expandable) explaining symbols
•	Close button at top-right, or tap outside diagram to close

12.3 Score Screen
•	Full-screen overlay with dark background
•	Star rating (1-3 stars) shown with animation
•	Metrics: Time, Accuracy %, Mistakes count, Hints used
•	Mistake breakdown list — each mistake with brief explanation
•	Buttons: Retry, Next Level, Main Menu

12.4 UI Color Language
COLOR	MEANING
Navy Blue (#1A3C5E)	Primary brand color, headers, buttons, panel frames
Amber (#F4A623)	Accent, warnings, highlights, live wire indicators
Green (#27AE60)	Success, correct connections, safe conditions
Red (#E74C3C)	Errors, faults, short circuits, failed states
Light Blue (#EAF2FF)	Background fills, info boxes, secondary panels
White (#FFFFFF)	Text on dark backgrounds, clean surfaces
 
  SECTION 13 — AUDIO SYSTEM

13.1 Sound Categories
CATEGORY	DESCRIPTION
Ambient / Atmosphere	Workshop hum, distant AC unit, faint radio static — loops infinitely at low volume
UI Sounds	Button tap, menu open/close, tool select, level unlock
Interaction Sounds	Wire snap (correct), wire reject (wrong buzz), screwdriver ratchet, panel open/close
Circuit Sounds	Breaker click, motor hum start, light switch click, electric hum of live circuit
Feedback Sounds	Success chime, short circuit spark crackle, breaker trip pop
Alarm/Warning	Continuous beep while dangerous fault is present — cleared when fixed
Exam Music	Low-tension background music in Exam Mode to add pressure (can be disabled in settings)

13.2 Audio Implementation
•	All sounds loaded on game boot via Howler.js
•	3D positional audio for in-world sounds (sparks, motors) using Howler 3D
•	UI sounds are 2D (not positional)
•	Player can adjust: Master Volume, SFX Volume, Music Volume in Settings
•	Mobile audio unlock: Howl.ctx.resume() called on first user gesture (required by mobile browsers)
 
  SECTION 14 — SCORING & PROGRESSION SYSTEM

14.1 Score Calculation
Score Formula
Base Score = 1000 points

Deductions:
  - Each mistake: -50 points
  - Each hint used: -30 points
  - Time over par: -2 points per second over

Bonuses:
  - Zero mistakes: +200 points
  - Under par time: +100 points
  - No hints: +150 points
  - First try success: +50 points

Star Rating: 3 stars = 850+, 2 stars = 600-849, 1 star = any pass

14.2 Player Profile & Progression
•	Total XP earned across all levels
•	Rank titles: Trainee → Apprentice → Journeyman → Licensed Electrician
•	XP thresholds: 0, 500, 2000, 5000
•	Unlockable tool skins (cosmetic only — no gameplay advantage)
•	Achievement badges: 'First Spark', 'Perfect Circuit', 'Speed Wirer', 'Safety First'
•	Completion percentage shown on profile screen
 
  SECTION 15 — LEARNING & HINT SYSTEM

15.1 Hint Tiers
TIER	DESCRIPTION
Tier 1 — Nudge	Vague directional hint: 'Check the switch terminals.' -10 points.
Tier 2 — Clue	More specific: 'The switch input should connect to the LINE wire from the panel.' -30 points.
Tier 3 — Show Me	Arrow and glow points directly at correct terminal. -50 points.
Auto-Hint	After 3 minutes of no progress, Tier 1 hint is offered automatically (no point deduction).

15.2 Step Highlighting (Guided Mode)
•	In Levels 1-3, the next interactive object pulses with a white glow every 3 seconds
•	After correct action, glow moves to the next required object
•	Player cannot interact with non-highlighted objects in strict guided mode (configurable in settings)
•	Highlight system is driven by the level's step array: each step has {targetObject, action, nextStep}
 
  SECTION 16 — EXAM MODE

16.1 Exam Mode Rules
•	Timer counts DOWN from the time limit (not up)
•	NO hints available — hint button is hidden
•	NO step highlighting — everything is off
•	Mistakes are still tracked but no penalty popups (only final review)
•	Cannot pause exam once started (simulates real test conditions)
•	If time runs out: auto-submit, grade whatever is completed
•	Retry lockout: 24 hours between exam attempts (simulates real exam fairness)

16.2 Exam Grading
RESULT	BEHAVIOR
Pass (80-100%)	Diploma animation, rank upgrade, unlock new content
Conditional Pass (70-79%)	Partial credit. Told which competencies are weak.
Fail (<70%)	Detailed breakdown of every error. Study guide shown. Retry after 24h.
 
  SECTION 17 — SAVE SYSTEM & DATA PERSISTENCE

17.1 Save Data Structure
localStorage Key: 'electrotech_save'
{
  playerName: string,
  totalXP: number,
  rank: string,
  levels: {
    [levelId]: {
      completed: boolean,
      bestScore: number,
      stars: number (1-3),
      bestTime: number (seconds),
      attempts: number
    }
  },
  unlockedTools: string[],
  achievements: string[],
  settings: { masterVol, sfxVol, musicVol, sensitivity },
  lastLevel: string,
  examCooldown: { [levelId]: timestamp }
}

17.2 Save Triggers
•	Auto-save: Every time a level is completed
•	Auto-save: Every time a setting is changed
•	Manual save: Player can tap 'Save & Exit' from pause menu
•	No mid-level save — levels must be completed or restarted
 
  SECTION 18 — ASSET LIST

18.1 3D Models Required
FILE	DESCRIPTION
panel_board.glb	Breaker panel — closed and open states
breaker_single.glb	Single-pole circuit breaker
breaker_3phase.glb	3-phase breaker
switch_spst.glb	Single-pole single-throw light switch
switch_3way.glb	3-way switch
outlet_duplex.glb	Standard duplex outlet
outlet_gfci.glb	GFCI outlet with test/reset buttons
lightbulb_fixture.glb	Ceiling light fixture with bulb
motor_3phase.glb	3-phase induction motor
motor_starter_dol.glb	Direct-on-line motor starter
workbench.glb	Work table
multimeter.glb	Digital multimeter
voltage_tester.glb	Non-contact voltage tester
screwdriver_flat.glb	Flathead screwdriver
screwdriver_phillips.glb	Phillips screwdriver
wire_stripper.glb	Wire stripper tool
conduit_straight.glb	Straight conduit pipe
conduit_elbow.glb	90-degree conduit elbow

18.2 Audio Files Required
FILE	PURPOSE
ambient_workshop.mp3	Looping background atmosphere
wire_snap.mp3	Short metallic snap — wire connects correctly
wire_reject.mp3	Short buzzing error sound
spark_crackle.mp3	Electric spark effect
breaker_trip.mp3	Breaker trips with a pop
motor_start.mp3	Motor winding up
motor_hum.mp3	Motor running (loop)
light_switch.mp3	Click of physical switch
success_chime.mp3	Level complete fanfare
screwdriver_ratchet.mp3	Screwdriver tightening
panel_open.mp3	Metal panel door opening
multimeter_beep.mp3	Continuity beep
exam_music.mp3	Low-tension background loop for exam
 
  SECTION 19 — MVP BUILD ROADMAP

19.1 MVP Scope Definition
The MVP (Minimum Viable Product) is the smallest version of the game that is fully functional, feels real, and can be tested by users. For ElectroTech Sim, the MVP is:
MVP = Level 1 + Level 2 + Core Systems Fully Working
If Level 1 and Level 2 feel real, professional, and educational — the full game WILL work.

MVP does NOT need: multiplayer, 10 levels, 3D models (placeholders OK), or polished audio.
MVP DOES need: Wire system, Circuit solver, Feedback system, Basic scoring, Save system.

19.2 MVP Feature Checklist
FEATURE	ACCEPTANCE CRITERIA
Three.js scene renders	Basic room visible, player can move
Raycaster interaction	Tapping objects highlights them
Wire tool works	Can drag wire from terminal to terminal
Circuit solver runs	Detects complete/incomplete circuits
Short circuit detection	Sparks + shake when wrong
Power ON button	Tests circuit, gives result
Score screen	Shows time + mistakes
Save system	Level 1 progress saved
Schematic view	2D diagram overlay works
Basic audio	Wire snap, spark, success sounds play
 
  SECTION 20 — SPRINT PLAN (12 WEEKS)

WEEK	MILESTONE
Week 1	Project setup: Cordova + Three.js scaffold, basic scene, player controller, virtual joystick
Week 2	Interaction system: Raycaster, tap/hover/drag, terminal highlighting, object labels
Week 3	Wire system: Wire drag, CatmullRomCurve rendering, snap logic, terminal connection
Week 4	Circuit solver: Graph traversal, correct/open/short circuit detection, power simulation
Week 5	Feedback system: Error cards, screen shake, spark particles, color feedback
Week 6	Level 1 complete: All components, schematic view, guided mode, win condition
Week 7	Tool system: Tool belt UI, screwdriver, voltage tester, multimeter
Week 8	Level 2 + Level 3: New mechanics, hint system, semi-guided mode
Week 9	Scoring engine: Mistake log, accuracy, stars, score screen, XP system
Week 10	Save system + Level Select: Full save/load, level grid UI, lock/unlock
Week 11	Audio: All sounds integrated, positional audio, volume settings
Week 12	Polish + Bug fixing: UI polish, performance optimization, QA, APK build
 
  SECTION 21 — BUG & QA CHECKLIST

21.1 Core System Tests
•	Player cannot walk through walls or objects
•	Raycaster fires correctly on all interactive objects
•	Wire snap works on ALL valid terminal combinations
•	Wire rejection works on ALL invalid combinations
•	Short circuit triggers on LINE-to-NEUTRAL direct connection
•	Ground fault triggers on LINE-to-GROUND direct connection
•	Circuit solver correctly identifies open circuit (missing wire)
•	Power ON button only enables when all minimum wires are placed
•	Score screen shows correct values every time
•	Save system saves and loads without data corruption
•	Exam cooldown timer works correctly (24h block)

21.2 Mobile-Specific Tests
•	Game runs at 30+ FPS on mid-range Android (Snapdragon 665, 3GB RAM)
•	Touch controls are responsive with no input lag
•	Screen does not rotate unexpectedly during gameplay
•	Audio plays correctly after screen lock/unlock
•	App resumes correctly after switching apps
•	APK file size under 100MB
•	No memory leaks after playing 5 levels in a row
 
  SECTION 22 — FUTURE FEATURES (POST-MVP)

FEATURE	DESCRIPTION
Multiplayer Race Mode	Two players wire the same circuit — who finishes correctly first wins
AR Mode	Point phone at real panel — overlay virtual wires as AR training guide
Teacher Dashboard	Web portal for instructors to track student scores and mistakes
TESDA Certification Prep Pack	Scenario packs matching real TESDA NC II exam tasks
Component Library	In-game encyclopedia of all electrical components with interactive 3D views
Custom Level Builder	Instructors can create and share custom levels
Cloud Save	Sync progress across devices via Firebase
iOS Port	Repackage via Cordova/Capacitor for App Store
Tagalog Localization	Full Filipino language support for all text and audio
VR Mode	Cardboard/Quest support for full immersive training



END OF MASTER GAME DESIGN DOCUMENT — ElectroTech Sim v1.0


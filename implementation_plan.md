# Stages + Explore Mode — WireVerse V2 Integration Plan

## What We're Building

Integrating the **Stage Progression Hub**, **Outlet Repair Lesson**, and **3D Explore Mode** into WireVerse V2 as **proper SPA screens** — the exact same pattern as `WireTypesLesson.js`, `WireStrippingLesson.js`, and `ElectricianToolsLesson.js`.

Every new feature is an ES module **class** with:
- `this.container` — a `.screen.screen-hidden` div registered in UIManager
- `onShow()` / `onHide()` lifecycle hooks
- Its own **scoped CSS** injected into `<head>` via `injectCSS()` guard
- **Three.js canvas inside the container** (not the global `#game-canvas`)
- Navigation via `this.state.setState('...')` — no `window.location.href`

---

## SPA State Flow

```
splash → loading → nameEntry
                      ↓
                    menu
                      ↓ [PLAY]
                  stagesHub ←──────────────┐
                  /        \               │
         [Stage 1]         [Stage 2]       │
    electricianTools     outletLesson ─────┘ (on complete)
                                           │
                  [Explore unlocked]       │
                  explore ────────────────-┘ (back button)
```

---

## Architecture Rules (matching existing codebase)

| Convention | Example |
|---|---|
| Screen class with `this.container = this._build()` | `WireTypesLesson`, `LearnHub` |
| Scoped CSS injected once via guard | `#wtl-css`, `#lh-css` |
| Three.js inside `div.screen`, NOT `#game-canvas` | `WireTypesLesson._initThree()` |
| `ResizeObserver` on scene div | `WireTypesLesson._initThree()` |
| `cancelAnimationFrame` on `onHide()` | clean teardown |
| State navigation: `this.state.setState('x')` | all back buttons |
| `Database.saveLearnStage(key)` on completion | `completeLesson()` |

---

## Proposed Changes

### Phase 1 — Database Extension

#### [MODIFY] [Database.js](file:///c:/MyProjects/WireVerse%20V2/src/systems/Database.js)

**Add to `defaults()`:**
```js
learnStages: { electricianTools: false, outlet: false },
exploreOutlets: {},   // { 1: true, 2: true, ... }
exploreSwitches: {},
```

**Add static methods:**
```js
static saveLearnStage(key)           // mark stage done
static getLearnStage(key)            // → boolean
static isLearnStageUnlocked(key)     // first stage always unlocked; 'outlet' requires electricianTools
static isExploreModeUnlocked()       // both stages done
static saveExploreOutlet(id)         // mark an outlet fixed in explore
static getExploreProgress()          // { outletCount, switchCount }
```

---

### Phase 2 — Stages Hub Screen

#### [NEW] [src/ui/StagesHub.js](file:///c:/MyProjects/WireVerse%20V2/src/ui/StagesHub.js)

**Pattern:** Same as `LearnHub.js` — DOM-only screen, no Three.js.

**Layout (CSS class prefix `sh-`):**
```
┌──────────────────────────────────┐
│  ← MENU    ⚡ WIREVERSE    [pct] │  ← header (same .wtl-top style)
├──────────────────────────────────┤
│  LEARNING PATHWAY                │  ← hero text
│  ○──○──○──○  progress chips      │
│                                  │
│ ┌─ STAGE 1 ─────────────────── ┐ │
│ │  [SVG art]  ELECTRICIAN TOOLS│ │  ← card (available or done)
│ │  Desc text                   │ │
│ │  Progress bar  [START →]     │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ STAGE 2 ─────────────────── ┐ │
│ │  [SVG art]  OUTLET REPAIR    │ │  ← locked until Stage 1 done
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ ⚡ EXPLORE MODE ──────────── ┐ │
│ │  Dashed border (locked) OR   │ │  ← amber glow when unlocked
│ │  [ENTER EXPLORE →]           │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Behavior:**
- `onShow()` reads `Database.getLearnStage()` and re-renders all cards fresh
- Stage 1 (Electrician Tools) always unlocked → `state.setState('electricianTools')`
- Stage 2 (Outlet Repair) locked until Stage 1 done → `state.setState('outletLesson')`
- Explore card locked until both done → `state.setState('explore')`
- Back button → `state.setState('menu')`

**Visual style:**
- Reuses CSS variables from `main.css` (`--bg0`, `--bg1`, `--orange`, `--green`)
- Card art: SVG inline (like Electric-Copy `stages.html`)
- Stage number badge top-left, status badge (AVAILABLE / ✓ COMPLETE / 🔒 LOCKED) top-right
- Barlow Condensed for titles (already used in Electric-Copy; add Google Font link or use Impact fallback)

---

### Phase 3 — Outlet Lesson (Three.js ES Module)

#### [NEW] [src/learn/OutletLesson.js](file:///c:/MyProjects/WireVerse%20V2/src/learn/OutletLesson.js)

**Pattern:** Same as `WireTypesLesson.js` — full Three.js scene inside `.screen` container.

**CSS class prefix:** `ol-`

**Layout:**
```
┌──────────────────────────────────┐
│  ← STAGES   ⚡ OUTLET REPAIR     │  ← top bar
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │   Three.js canvas (44vh)  │  │  ← outlet + breaker box 3D scene
│  └────────────────────────────┘  │
│  Mission checklist (left panel)  │
│  Progress bar (right panel)      │
│  Instruction text (bottom)       │
│  Tool toolbar (screwdriver/etc)  │
│  Wire-connect panel (mid-game)   │
└──────────────────────────────────┘
```

**Three.js scene (ported from `learn-outlet.html`):**
- Outlet group (face plate, screw, internal terminal, 3 wire meshes)
- Breaker box with animated handle (green ↔ red)
- Spotlight + fill lighting + damage glow PointLight
- Camera tween system (`animateCam()`)
- 8-step game state machine: `breaker_off → screw → open → wires → rescrew → breaker_on → test → done`

**8 Mission Steps:**
1. Turn OFF breaker (click bkHandle)
2. Remove cover screw (select screwdriver → click screwHead)
3. Open outlet cover (click facePlate)
4. Inspect wires (auto-advance 2.5s)
5. Reconnect wires (drag-and-drop UI panel: Brown→L, Blue→N, Green→E)
6. Close outlet (click outletRoot)
7. Turn ON breaker (click bkHandle)
8. Test with multimeter (select multimeter → click facePlate → voltage animation)

**On Step 8 complete:**
```js
Database.saveLearnStage('outlet');
Database.completeLesson('outlet');
// show success overlay with "BACK TO STAGES" button
// → this.state.setState('stagesHub')
```

**Teardown (`onHide()`):**
- `cancelAnimationFrame(this._animId)`
- `this._renderer.dispose()`
- Remove event listeners

---

### Phase 4 — Wire ElectricianTools to Stage System

#### [MODIFY] [src/learn/ElectricianToolsLesson.js](file:///c:/MyProjects/WireVerse%20V2/src/learn/ElectricianToolsLesson.js)

**Find:** The point where all 7 tools are mastered (currently calls `Database.completeLesson('electricianTools')` or similar)

**Add:**
```js
Database.saveLearnStage('electricianTools');
```

**Back button:** Currently goes to `menu`. Need to check — if entered from `stagesHub`, go back to `stagesHub`. Simplest approach: always go to `stagesHub` from the back button inside the lesson, since `stagesHub` → `menu` is one more tap.

> [!NOTE]
> We need to search for the completion hook in ElectricianToolsLesson (no results found in prior grep). May be inside an `areAllToolsMastered()` check or a `FINISH` button handler. Will locate during execution.

---

### Phase 5 — Explore Screen + Scene

#### [NEW] [src/ui/ExploreScreen.js](file:///c:/MyProjects/WireVerse%20V2/src/ui/ExploreScreen.js)

**Pattern:** Thin screen wrapper, similar to `GameScene.js` relationship with `Game.js`.

Responsibilities:
- Injects mobile controls HTML (joystick pad, look zone, interact button, jump button) as absolutely-positioned divs **inside `this.container`**
- On `onShow()`: creates `ExploreScene`, passes its own container as root
- On `onHide()`: calls `exploreScene.destroy()`

**CSS class prefix:** `ex-`

Mobile controls layout:
```
┌───────────────────────────────────┐
│  [ROOM NAME]    [← MENU]  [TASKS] │  ← HUD top bar
│  ┌─────────┐                      │
│  │ minimap │                      │  ← canvas minimap (140×140)
│  └─────────┘                      │
│                                   │
│   [3D WORLD — Three.js canvas]    │
│                                   │
│  ╔══╗                  ╔══════╗   │
│  ║ W║                  ║  🔧  ║   │  ← INTERACT button (right)
│  ╠══╬══╗               ╚══════╝   │
│  ║ A║ D║  ←joystick              │
│  ╠══╬══╣               ╔══════╗   │
│  ║ S║  ║               ║  ↑   ║   │  ← JUMP button (right)
│  ╚══╩══╝               ╚══════╝   │
└───────────────────────────────────┘
```

#### [NEW] [src/scenes/ExploreScene.js](file:///c:/MyProjects/WireVerse%20V2/src/scenes/ExploreScene.js)

**Ported from:** `Electric-Copy/www/js/main.js` + `world.js` + `player.js` + `outlet-scenario.js`

**Adapted as ES module (key changes from Electric-Copy):**
- No `window.location.href` — use `this.state.setState('stagesHub')` for back
- No `<script src="db.js">` — use `import { Database } from '../systems/Database.js'`
- DOM IDs are **namespaced** (e.g. `ex-minimap`, `ex-notify`, `ex-prompt`) to avoid conflicts with other screens
- Three.js imported from npm (`import * as THREE from 'three'`) not CDN
- All DOM elements created inside `this.root` (the ExploreScreen container), not `document.body`

**Sub-modules (all inside `ExploreScene.js` or split as needed):**

| Component | Source | Responsibility |
|---|---|---|
| World builder | `world.js` | Rooms, walls, floors, doors, interactables, outlets, switches |
| Player controller | `player.js` | WASD + joystick + touch-look + head-bob + collision |
| Outlet scenario | `outlet-scenario.js` | Repair modal for in-world outlets |
| Switch scenario | `switch-scenario.js` | Switch wiring modal for in-world stations |
| Minimap | `main.js drawMinimap()` | Canvas 2D overlay |
| HUD | `main.js updateHUD()` | Room name, notifications, prompt |
| Interaction | `main.js doInteract()` | Raycaster + state dispatch |

**Explore mode scope (first version):**
- ✅ Outlet Repair scenarios (5 outlets)
- ✅ Switch Installation scenarios (3 stations)  
- ✅ Door toggle
- ✅ Minimap with player dot
- ✅ Room name HUD
- ✅ Mobile joystick + touch-look

**On back button:**
```js
this.state.setState('stagesHub');
exploreScene.destroy(); // stop RAF, dispose renderer
```

**DB integration:**
```js
// When outlet fixed in explore:
Database.saveExploreOutlet(socketId);
// When switch wired in explore:
Database.saveExploreSwitch(stationId);
```

---

### Phase 6 — Register Everything

#### [MODIFY] [src/ui/UIManager.js](file:///c:/MyProjects/WireVerse%20V2/src/ui/UIManager.js)

Add to `MAP`:
```js
stagesHub:    'stagesHub',
outletLesson: 'outletLesson',
explore:      'explore',
```

Add to `this.screens`:
```js
stagesHub:    new StagesHub(this.state),
outletLesson: new OutletLesson(this.state),
explore:      new ExploreScreen(this.state),
```

#### [MODIFY] [src/ui/MainMenu.js](file:///c:/MyProjects/WireVerse%20V2/src/ui/MainMenu.js)

Change PLAY button:
```js
// Before:
{ id: 'play', label: 'PLAY', state: 'game', primary: true }
// After:
{ id: 'play', label: 'PLAY', state: 'stagesHub', primary: true }
```

---

## Files Summary

| File | Status | Notes |
|---|---|---|
| `src/systems/Database.js` | MODIFY | Add learnStages + explore tracking |
| `src/ui/StagesHub.js` | NEW | Stage cards hub screen |
| `src/ui/MainMenu.js` | MODIFY | PLAY → stagesHub |
| `src/ui/UIManager.js` | MODIFY | Register 3 new screens |
| `src/learn/OutletLesson.js` | NEW | Three.js outlet repair lesson |
| `src/learn/ElectricianToolsLesson.js` | MODIFY | Add saveLearnStage on completion |
| `src/ui/ExploreScreen.js` | NEW | Explore screen wrapper + mobile controls |
| `src/scenes/ExploreScene.js` | NEW | 3D walk world + player + scenarios |

---

## Verification Plan

1. `npm run dev` — no build errors
2. PLAY → StagesHub loads: Stage 1 unlocked, Stage 2 locked, Explore locked
3. Click Stage 1 (Electrician Tools) → lesson loads, same as from LEARN hub
4. Complete Stage 1 → back to StagesHub → Stage 2 now unlocked
5. Click Stage 2 (Outlet Repair) → Three.js outlet lesson loads inside screen
6. Complete outlet lesson → back to StagesHub → Explore unlocked with amber glow
7. Click ENTER EXPLORE → 3D world loads, player spawns, HUD visible
8. WASD on desktop → player moves with head bob
9. Approach outlet socket → `🔧 FIX` prompt shows → press E → modal opens
10. Repair outlet → socket turns green on minimap
11. Back button → returns to StagesHub, no page reload

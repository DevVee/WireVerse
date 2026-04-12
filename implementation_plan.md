# Enhance Tool Interaction, 3D Equipping, and UI

The goal is to visibly hold tools in 3D space. When an item is picked up from the rack, it will dynamically disappear from its hook and reappear securely within the player's view with an equipping animation. We will also overhaul the Tool Indicator UI.

## User Review Required

> [!IMPORTANT]
> - By adopting this, tools will now appear rigidly locked to the camera (with an idle/walking sway) like in traditional first-person simulation games.
> - The old "Tool Belt" UI buttons from the previous `index.html` were removed in previous mobile UI cleanup, but we will vastly improve the corner `#toolIndicator`.
> Do you approve this transition to a fully 3D first-person hand/tool model aesthetic?

## Proposed Changes

### `world.js`
Modify the pegboard tool generation loop so the objects are grouped and addressable.
- Provide an exported `toolRackVisuals` registry so `main.js` can toggle their visibility.
- Attach a dedicated `heldToolGroup` to the `camera` object.
- Provide a helper `createToolVisual(toolId)` that clones or rebuilds the meshes needed for the first-person view.

### `main.js`
Update the `InteractionEngine` to orchestrate tool swapping.
#### [MODIFY] `js/main.js`
- `_pickupTool()`: 
  - If a tool is currently held, turn its rack equivalent back to `visible = true`.
  - Set the chosen tool's rack equivalent to `visible = false`.
  - Clear the `heldToolGroup` and populate it with `createToolVisual(toolId)`.
  - Reset an animation timer for a smooth "draw/equip" motion from off-screen into view.
- `updateHUD()`: 
  - Add logic to animate the `heldToolGroup` so it bobs subtly as the player looks around and walks.
- Enhance the `updateToolHUD()` function to trigger CSS animations on the HTML UI elements.

### `index.html`
Update CSS for the tool indicator.
#### [MODIFY] `index.html`
- Transform the `#toolIndicator` from plain text to a dynamic, animated slide-out HUD element with a glowing border and icon matching the equipped tool.

## Open Questions

- Should dropping the tool back on the rack require interacting with the empty rack hook, or should picking up *any* other tool automatically snap the current one back? (Currently proposing: snapping back automatically when taking a new one, to save time).

## Verification Plan

### Manual Verification
- Walk up to the Pegboard in the Workshop.
- Interact with the Screwdriver: Ensure it disappears from the pegboard and slides up into the bottom right of the screen.
- Verify the UI elegantly updates to show `Equipped: Screwdriver`.
- Walk around and confirm the held tool subtly bobs with your footsteps.
- Interact with the Wire Stripper: Make sure the Screwdriver re-appears on the pegboard, and the Wire Stripper equips.

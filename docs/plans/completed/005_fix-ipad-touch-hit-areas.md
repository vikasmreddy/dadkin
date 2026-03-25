# 005: Fix iPad Touch Hit Areas

**Status:** Completed
**Created:** 2026-03-25
**Project:** dadkin

---

## Initial Prompt
> the controls work kind of but are not fully floating over the game so the touches aren't registering propertly always, cna you fix? (on iPad)

## Background
The first pass of touch controls added left, right, and jump buttons directly in the Phaser scene using interactive containers. On iPad, the controls appear, but the user reports that touches do not always register correctly. That suggests the hit areas or input handling are not reliable enough for tablet play.

## Context
If the touch controls miss presses or feel partly detached from the screen overlay, the game still will not be comfortably playable on iPad even though the buttons exist.

## Approach
1. Replace the current container-based touch buttons with more reliable HUD-style controls.
2. Make the touch hit areas larger and keep them fixed to the screen with high depth.
3. Track touch press, move, and release more explicitly so buttons do not miss or get stuck.
4. Rebuild and verify the game still works on desktop and touch devices.

## Files Changed
Expected scope:
- `docs/plans/completed/005_fix-ipad-touch-hit-areas.md`
- `src/scenes/GameScene.ts`

## Discussion Log
- **User:** the controls work kind of but are not fully floating over the game so the touches aren't registering propertly always, cna you fix? (on iPad)
- **Claude:** Inspected the current touch control implementation and found that it uses interactive containers, which are a likely cause of inconsistent iPad touch handling.
- **Decision:** Make a focused follow-up fix that turns the controls into a more HUD-like overlay with larger and more reliable touch targets.

## Progress
- 2026-03-25: Replaced the container-based buttons with fixed-screen HUD controls that use larger circular hit areas, high depth, and explicit pointer tracking for press, drag, and release.
- 2026-03-25: Verified the follow-up touch fix with a successful production build.
- 2026-03-25: Created a follow-up plan to improve iPad touch reliability without changing desktop controls.

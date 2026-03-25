# 002: Add iPad Touch Controls

**Status:** Completed
**Created:** 2026-03-25
**Project:** dadkin

---

## Initial Prompt
> can you make this dadkin game work for iPad inputs so like add a d pad and a way to jump (maybe tapping the screen)?

## Background
The game currently uses keyboard input only during play. `Player` reads arrow keys plus space/up for jumping, while `GameScene` shows keyboard-only help text. The level editor already uses pointer input, so the project is already set up to receive touch input through Phaser. The user specifically wants the game to feel playable on iPad, likely with an on-screen d-pad and a touch-based jump action.

## Context
Without touch controls, the game is difficult or impossible to play on iPad. Adding simple on-screen controls should make levels playable on tablets while keeping keyboard controls working on desktop.

## Approach
1. Add a touch input state that the player can read alongside keyboard input.
2. Create an on-screen movement control in `GameScene`, anchored near the bottom-left of the screen.
3. Add a dedicated jump button on the right side so jump input is clear and does not conflict with other UI.
4. Keep desktop keyboard controls unchanged and update the gameplay hint text so it explains both control styles.
5. Test for obvious interaction conflicts, especially making sure UI buttons like `< Edit` do not trigger jumps.

## Files Changed
Expected scope:
- `docs/plans/completed/002_add-ipad-touch-controls.md`
- `src/entities/Player.ts`
- `src/scenes/GameScene.ts`
- `index.html`

## Discussion Log
- **User:** can you make this dadkin game work for iPad inputs so like add a d pad and a way to jump (maybe tapping the screen)?
- **Claude:** Inspected the current gameplay input code and found that play mode is keyboard-only, while the editor already uses pointer input. Drafted a plan to add touch controls without breaking desktop controls.
- **Decision:** Start with a simple tablet-friendly design: on-screen movement controls plus a touch jump action, with final jump behavior to be confirmed.
- **User:** 3
- **Claude:** Chose a tablet-friendly default: visible left/right buttons plus a dedicated jump button, while keeping keyboard controls for desktop.
- **Decision:** Use a dedicated jump button instead of tap-anywhere jump, because it is more predictable on iPad and avoids accidental jumps from UI taps.

## Progress
- 2026-03-25: Added shared touch input support in `Player` so movement and jumping can respond to either keyboard or on-screen controls.
- 2026-03-25: Added on-screen left, right, and jump buttons in `GameScene`, only shown on touch-style devices, with extra touch pointers enabled for multi-touch play.
- 2026-03-25: Updated browser touch handling in `index.html` so iPad touches are less likely to trigger page gestures instead of gameplay input.

---
name: game-polish
description: Polish and performance rules for Okkar's Phaser village (depth sorting, ambient animation, screen effects, 60fps budget, accessibility, HTML UI quality). Use when adding or changing anything that moves, glows, animates or appears on screen.
---

# Game polish — Okkar's Village

## Depth sorting (y-sort)
- Anything the player can stand in front of OR behind is a sprite whose depth is its **feet y**:
  `sprite.setDepth(DEPTH.world + feetY)` (see `client/src/utils/constants.js`).
- Only the feet collide (a small body at the base), so the player can walk behind tree tops and
  in front of trunks.
- Roofs and tree canopies that should cover the player live in the Tiled **`Above`** layer
  (depth `DEPTH.above`).
- Fixed layers, lowest to highest: ground → decor tiles → y-sorted world → above → weather →
  light overlays. Use the `DEPTH` constants, never magic numbers.

## Ambient animation (the world should feel alive)
- Smoke from chimneys, flickering lamps/fire, swaying tall grass and reeds, shimmering water,
  drifting particles, a breathing cat. Small amplitude, slow, slightly randomised timing so things
  don't move in sync.
- Prefer tweens and particle emitters over per-frame code. One tween per object at most.

## Screen effects
- Subtle only: camera fade on scene changes, soft tints for time of day/weather, gentle glows.
- No camera shake. Lightning is a soft, short brightening (never a full white flash, never more
  than once every few seconds).
- `prefers-reduced-motion`: no particles that fly across the screen, no lightning, no bobbing; keep
  static tints. Check with `prefersReducedMotion()` in `client/src/utils/device.js`.

## Performance budget (60 fps on a mid-range phone)
- Art is packed in one atlas (`assets/atlas/decor.png`) + the two Kenney tilesets.
- Particles: one emitter per effect, capped with `maxParticles`/`quantity`; Phaser pools particles.
  Use `isLowEndDevice()` to halve counts on phones / low-core devices.
- No per-frame allocations in `update()` loops (reuse objects), no per-frame DOM writes.
- Keep PNGs tiny (indexed-looking, a few KB). Report bundle size after a build.

## HTML UI (panels, HUD, dialogue, loading screen, plain view)
- Panels/HUD are HTML on top of the canvas: readable, selectable, accessible.
- Every interactive element: visible hover and `:focus-visible` states, ≥ 44 px touch target on
  phones, text contrast ≥ 4.5:1.
- Opening a panel/dialog moves focus into it; closing returns focus. Esc closes. Tab stays inside.
- Open/close with short transitions (150–250 ms), disabled under reduced motion.
- Weather, light and effects never cover the "Press E" prompt or any text.

## Code style (Okkar is learning Phaser)
- Simple loops, clear names, generous comments. One system per file
  (`src/systems/WeatherSystem.js`, `src/systems/Water.js`, `src/entities/WelcomeNpc.js` …).
- Systems expose small APIs and clean up listeners on scene `shutdown`.

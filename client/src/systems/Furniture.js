// =====================================================================
//  FURNITURE — places decorations from simple lists like
//      { type: 'bed', x: 1, y: 4 }
//  (see src/data/decor.js). Used for room interiors AND building
//  exteriors (flower boxes, lanterns, chimneys...).
//
//  Coordinates are in TILES:
//    x = the tile column of the item's LEFT edge
//    y = the tile row the item STANDS on (its bottom sits on that row)
//    dx, dy = optional nudge in pixels
//    Negative x / y count from the right / bottom of the room
//    (x: -2 = two tiles from the right wall), handy for rooms that grow.
// =====================================================================

import { DEPTH, TILE_SIZE } from '../utils/constants.js'
import { prefersReducedMotion } from '../utils/device.js'
import { addShadow, addBlocker } from './Decorations.js'

// How each type of item behaves.
//   frame:  atlas frame        anim:  animation key (overrides frame)
//   solid:  height in px of the solid part at the bottom (width = sprite)
//   flat:   lies on the floor (rugs, doormats): drawn under everything
//   wall:   hangs on a wall (frames, windows): drawn just above the wall
//   above:  sits on a roof (chimneys): drawn over the player
//   raise:  extra depth so it's drawn on top of what it sits on (laptop on desk)
//   light:  { radius, color, intensity, flicker, offsetY }  (a glow)
//   smoke / steam: particle effect from the top of the item
//   shadow: shadow sprite under it
export const FURNITURE = {
  // ----- house interior -----
  bed: { frame: 'bed', solid: 24, shadow: 'shadow_l' },
  bookshelf_a: { frame: 'bookshelf_a', solid: 10 },
  bookshelf_b: { frame: 'bookshelf_b', solid: 10 },
  desk: { frame: 'desk', solid: 12 },
  laptop: { frame: 'laptop', raise: 24, light: { radius: 16, color: 'blueLight', intensity: 0.45, offsetY: -6 } },
  mug: { frame: 'mug', raise: 24, steam: true },
  armchair: { frame: 'armchair', solid: 10, shadow: 'shadow' },
  rug: { frame: 'rug', flat: true },
  fireplace: { frame: 'fireplace', solid: 16 },
  flame: { anim: 'flame', frame: 'flame_0', raise: 8, light: { radius: 40, color: 'orange', intensity: 0.55, flicker: true, offsetY: -4 } },
  frame_landscape: { frame: 'frame_landscape', wall: true },
  frame_photo: { frame: 'frame_photo', wall: true },
  frame_diploma: { frame: 'frame_diploma', wall: true },
  plant_big: { frame: 'plant_big', solid: 6, shadow: 'shadow' },
  floor_lamp: { frame: 'floor_lamp', solid: 4, shadow: 'shadow_s', light: { radius: 40, intensity: 0.55, offsetY: -24 } },
  string_lights: { anim: 'twinkle', frame: 'string_lights_0', wall: true, light: { radius: 24, intensity: 0.2, offsetY: -3 } },
  cat: { anim: 'cat_breathe', frame: 'cat_0', solid: 5 },
  side_table: { frame: 'side_table', solid: 6, shadow: 'shadow_s' },
  window_inside: { frame: 'window_inside', wall: true, light: { radius: 20, intensity: 0.25, offsetY: -6 } },
  // ----- workshop -----
  tool_rack: { frame: 'tool_rack', wall: true },
  blueprint_a: { frame: 'blueprint_a', wall: true },
  blueprint_b: { frame: 'blueprint_b', wall: true },
  workbench: { frame: 'workbench', solid: 12, shadow: 'shadow_l' },
  // ----- exteriors and shared -----
  chimney: { frame: 'chimney', above: true, smoke: true },
  flowerbox: { frame: 'flowerbox', wall: true },
  doormat: { frame: 'doormat', flat: true },
  porch: { frame: 'porch', flat: true },
  wall_lantern: { frame: 'wall_lantern', wall: true, light: { radius: 30, intensity: 0.6, flicker: true, offsetY: -5 } },
  potted_plant: { frame: 'potted_plant', solid: 4, shadow: 'shadow_s' },
  crate: { frame: 'crate', solid: 8, shadow: 'shadow' },
  sack: { frame: 'sack', solid: 6, shadow: 'shadow_s' },
  basket: { frame: 'basket', solid: 5, shadow: 'shadow_s' },
  chalkboard: { frame: 'chalkboard', solid: 4, shadow: 'shadow_s' },
  hanging_goods: { frame: 'hanging_goods', raise: 30 },
  // An invisible light (for building windows at night).
  window_light: { light: { radius: 16, intensity: 0.7 } },
}

// Place every item in `items`.
//   options: { roomWidth, roomHeight (tiles), blockers (array), lights (LightSystem), alwaysOn (bool) }
export function placeItems(scene, items, options) {
  const T = TILE_SIZE
  const placed = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const config = FURNITURE[item.type]
    if (!config) {
      console.warn('Unknown decoration type: ' + item.type)
      continue
    }

    // Negative coordinates count from the right/bottom of the room.
    let tileX = item.x
    let tileY = item.y
    if (tileX < 0 && options.roomWidth) tileX = options.roomWidth + tileX
    if (tileY < 0 && options.roomHeight) tileY = options.roomHeight + tileY
    const left = tileX * T + (item.dx || 0)
    const bottom = (tileY + 1) * T + (item.dy || 0)

    // Some items are only a light (no picture).
    let sprite = null
    if (config.frame) {
      sprite = scene.add.sprite(left, bottom, 'decor', config.frame).setOrigin(0, 1)
      if (config.flat) sprite.setDepth(DEPTH.groundDetail + 0.5)
      else if (config.wall) sprite.setDepth(DEPTH.decor + 0.5)
      else if (config.above) sprite.setDepth(DEPTH.above + 1)
      else sprite.setDepth(DEPTH.world + bottom + (config.raise || 0))
      if (item.flip) sprite.setFlipX(true)

      if (config.anim && !prefersReducedMotion()) {
        sprite.play({ key: config.anim, startFrame: 0, delay: Math.random() * 600 })
      }
      if (config.shadow) addShadow(scene, left + sprite.width / 2, bottom - 1, config.shadow)
      if (config.solid && options.blockers) {
        addBlocker(scene, options.blockers, left + sprite.width / 2, bottom, sprite.width - 2, config.solid)
      }
      if (config.smoke) addSmoke(scene, left + sprite.width / 2, bottom - sprite.height + 1)
      if (config.steam) addSteam(scene, left + sprite.width / 2, bottom - sprite.height)
    }

    if (config.light && options.lights) {
      const width = sprite ? sprite.width : T
      const height = sprite ? sprite.height : T
      options.lights.add({
        x: left + width / 2,
        y: bottom - height / 2 + (config.light.offsetY || 0),
        radius: config.light.radius,
        color: config.light.color,
        intensity: config.light.intensity,
        flicker: config.light.flicker,
        alwaysOn: options.alwaysOn,
      })
    }
    placed.push(sprite)
  }
  return placed
}

// Chimney smoke: soft puffs that rise, grow and fade, drifting with the wind.
function addSmoke(scene, x, y) {
  if (prefersReducedMotion()) return
  scene.add.particles(x, y, 'decor', {
    frame: 'p_smoke',
    lifespan: 3200,
    frequency: 520,
    quantity: 1,
    speedY: { min: -11, max: -7 },
    speedX: { min: 2, max: 6 },
    scale: { start: 0.55, end: 1.5 },
    alpha: { start: 0.65, end: 0 },
    maxParticles: 8,
  }).setDepth(DEPTH.above + 2)
}

// A little wisp of steam from a hot drink.
function addSteam(scene, x, y) {
  if (prefersReducedMotion()) return
  scene.add.particles(x, y, 'decor', {
    frame: 'p_dust',
    lifespan: 1400,
    frequency: 600,
    speedY: { min: -8, max: -5 },
    speedX: { min: -2, max: 2 },
    scale: { start: 0.6, end: 1.1 },
    alpha: { start: 0.5, end: 0 },
    maxParticles: 3,
  }).setDepth(DEPTH.above + 2)
}

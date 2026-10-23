// =====================================================================
//  DECORATIONS — makes the map feel alive and gives it depth.
//
//  1. convertTileProps(): trees, barrels, beehives... are painted as
//     tiles in Tiled, but we swap them for SPRITES at runtime so they can
//     be depth-sorted: the player walks behind a tree's crown and in front
//     of its trunk. Only a small box at the base is solid.
//  2. addDetails(): places the Tiled "Details" objects (tall grass,
//     flowers, stones, signposts, lamps, benches) by their `type`.
//  3. addShadow() / makeLabel(): small helpers used everywhere.
//
//  Every free-standing object gets a soft shadow (see the
//  pixel-art-direction skill), offset to the bottom-right because light
//  comes from the top-left.
// =====================================================================

import { DEPTH, TILE_SIZE } from '../utils/constants.js'
import { prefersReducedMotion } from '../utils/device.js'

// Kenney tile number -> size of the solid box at its base (w x h pixels).
// shadow: which shadow sprite to put underneath.
const TILE_PROPS = {
  3: { w: 6, h: 4, shadow: 'shadow' }, // tall orange tree
  4: { w: 6, h: 4, shadow: 'shadow' },
  5: { w: 12, h: 5, shadow: 'shadow' }, // bush
  15: { w: 6, h: 4, shadow: 'shadow' }, // round orange tree
  16: { w: 6, h: 4, shadow: 'shadow' }, // round green tree
  27: { w: 6, h: 4, shadow: 'shadow' }, // small orange tree
  28: { w: 6, h: 4, shadow: 'shadow' }, // small green tree
  83: { w: 8, h: 4, shadow: 'shadow_s' }, // sign
  94: { w: 10, h: 5, shadow: 'shadow' }, // beehive
  95: { w: 10, h: 5, shadow: 'shadow' }, // target
  104: { w: 12, h: 6, shadow: 'shadow' }, // well
  106: { w: 14, h: 5, shadow: 'shadow' }, // log
  107: { w: 10, h: 5, shadow: 'shadow_s' }, // pot
  130: { w: 12, h: 5, shadow: 'shadow' }, // barrel
  131: { w: 12, h: 5, shadow: 'shadow' }, // water barrel
}

// Details from Tiled's "Details" layer, by type.
//   frame: atlas frame (or first frame of an animation)
//   flat:  lies on the ground (drawn under everything that stands)
//   solid: size of the solid base box, if any
//   shadow: shadow sprite name, if any
//   sway:  animation key for wind sway
const DETAIL_TYPES = {
  tallgrass_a: { frame: 'tallgrass_a_0', sway: 'sway_a' },
  tallgrass_b: { frame: 'tallgrass_b_0', sway: 'sway_b' },
  flower_pink: { frame: 'flower_pink', flat: true },
  flower_blue: { frame: 'flower_blue', flat: true },
  flower_yellow: { frame: 'flower_yellow', flat: true },
  flower_white: { frame: 'flower_white', flat: true },
  flower_patch: { frame: 'flower_patch', flat: true },
  pebbles: { frame: 'pebbles', flat: true },
  clover: { frame: 'clover', flat: true },
  stone_s: { frame: 'stone_s', shadow: 'shadow_s' },
  stone_m: { frame: 'stone_m', solid: { w: 10, h: 4 }, shadow: 'shadow' },
  stump: { frame: 'stump', solid: { w: 10, h: 4 }, shadow: 'shadow' },
  mushroom: { frame: 'mushroom' },
  bush_berry: { frame: 'bush_berry', solid: { w: 12, h: 4 }, shadow: 'shadow' },
  signpost: { frame: 'signpost', solid: { w: 6, h: 3 }, shadow: 'shadow_s' },
  arrow_sign: { frame: 'arrow_sign', solid: { w: 6, h: 3 }, shadow: 'shadow_s' },
  lamppost: { frame: 'lamppost', solid: { w: 4, h: 3 }, shadow: 'shadow_s', light: true },
  bench: { frame: 'bench', solid: { w: 22, h: 4 }, shadow: 'shadow_l' },
  fountain: { frame: 'fountain_0', anim: 'fountain', solid: { w: 30, h: 10 }, shadow: 'shadow_l' },
  reeds: { frame: 'reeds_0', sway: 'sway_reeds' },
  lily_pad: { frame: 'lily_pad', flat: true },
  lily_flower: { frame: 'lily_flower', flat: true },
  dock_stool: { frame: 'dock_stool', shadow: 'shadow_s' },
  bucket: { frame: 'bucket', shadow: 'shadow_s' },
  fence_vine: { frame: 'fence_vine', raise: 1 },
  fence_flowers: { frame: 'fence_flowers' },
  bird: { frame: 'bird_0', anim: 'bird_peck', raise: 2 },
  crop_sprout: { frame: 'crop_sprout' },
  crop_cabbage: { frame: 'crop_cabbage' },
  crop_carrot: { frame: 'crop_carrot' },
  crop_sunflower: { frame: 'crop_sunflower', sway: 'sway_sunflower' },
}

// Read a custom property from a Tiled object.
function tiledProperty(obj, name, fallback) {
  const list = obj.properties || []
  for (let i = 0; i < list.length; i++) {
    if (list[i].name === name) return list[i].value
  }
  return fallback
}

// An invisible solid box (the "feet" of an object) the player bumps into.
export function addBlocker(scene, blockers, centerX, bottomY, width, height) {
  const zone = scene.add.zone(centerX, bottomY - height / 2, width, height)
  scene.physics.add.existing(zone, true) // true = static, never moves
  blockers.push(zone)
  return zone
}

// A soft shadow under an object's feet (bottom-right: light is top-left).
export function addShadow(scene, x, y, size) {
  return scene.add.image(x + 1, y, 'decor', size || 'shadow').setDepth(DEPTH.groundDetail)
}

// A small wooden name plate floating above a sign, door or shelf.
// `maxWidth` (world pixels) wraps long names onto two lines.
export function makeLabel(scene, x, y, text, depth, maxWidth) {
  const style = {
    fontFamily: '"Pixelify Sans", ui-monospace, monospace',
    fontSize: '32px',
    color: '#fdf3dc',
    backgroundColor: '#3f2631',
    padding: { x: 10, y: 3 },
    align: 'center',
  }
  if (maxWidth) style.wordWrap = { width: maxWidth * 4 - 20 }
  const label = scene.add.text(x, y, text, style)
  // Drawn 4x bigger then scaled down, so it stays crisp when the camera zooms in.
  label.setScale(0.25).setOrigin(0.5, 1).setDepth(depth === undefined ? DEPTH.worldUi : depth)
  return label
}

// Animations for decorations: wind sway for tall grass, the fountain spray.
export function createDecorAnimations(scene) {
  if (!scene.anims.exists('bird_peck')) {
    // Mostly still, with a quick peck now and then.
    scene.anims.create({
      key: 'bird_peck',
      frames: [
        { key: 'decor', frame: 'bird_0', duration: 2200 },
        { key: 'decor', frame: 'bird_1', duration: 180 },
        { key: 'decor', frame: 'bird_0', duration: 300 },
        { key: 'decor', frame: 'bird_1', duration: 180 },
      ],
      repeat: -1,
    })
  }
  if (!scene.anims.exists('fountain')) {
    scene.anims.create({
      key: 'fountain',
      frames: scene.anims.generateFrameNames('decor', { prefix: 'fountain_', start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1,
    })
  }
  if (!scene.anims.exists('sway_reeds')) {
    scene.anims.create({ key: 'sway_reeds', frames: scene.anims.generateFrameNames('decor', { prefix: 'reeds_', start: 0, end: 1 }), frameRate: 1.3, repeat: -1, yoyo: true })
  }
  const names = ['a', 'b']
  for (let i = 0; i < names.length; i++) {
    const key = 'sway_' + names[i]
    if (scene.anims.exists(key)) continue
    scene.anims.create({
      key: key,
      frames: [
        { key: 'decor', frame: 'tallgrass_' + names[i] + '_0' },
        { key: 'decor', frame: 'tallgrass_' + names[i] + '_1' },
      ],
      frameRate: 1.6,
      repeat: -1,
      yoyo: true,
    })
  }
}

// ---------------------------------------------------------------------
//  1. Tile props -> y-sorted sprites
// ---------------------------------------------------------------------
export function convertTileProps(scene, layer, blockers) {
  const T = TILE_SIZE
  for (let y = 0; y < layer.layer.height; y++) {
    for (let x = 0; x < layer.layer.width; x++) {
      const tile = layer.getTileAt(x, y)
      if (!tile) continue
      // Only tiles from the Kenney "tiny-town" tileset (gids 1-132).
      const kenneyIndex = tile.index - 1
      const config = TILE_PROPS[kenneyIndex]
      if (!config || tile.index > 132) continue

      layer.removeTileAt(x, y)
      // Nudge trees a few pixels (always the same amount for the same spot)
      // so forests don't look like they were planted on a grid.
      const isTree = config.shadow === 'shadow' && config.w === 6
      const jitterX = isTree ? ((x * 37 + y * 17) % 7) - 3 : 0
      const jitterY = isTree ? ((x * 13 + y * 29) % 5) - 2 : 0
      const feetX = x * T + T / 2 + jitterX
      const feetY = y * T + T - 1 + jitterY
      addShadow(scene, feetX, feetY - 1, config.shadow)
      scene.add.image(feetX, feetY + 1, 'town', kenneyIndex).setOrigin(0.5, 1).setDepth(DEPTH.world + feetY)
      addBlocker(scene, blockers, feetX, feetY, config.w, config.h)
    }
  }
}

// ---------------------------------------------------------------------
//  2. Tiled "Details" objects -> sprites
//  Returns the positions of light sources (lamps) for the night glow.
// ---------------------------------------------------------------------
export function addDetails(scene, objects, blockers) {
  const lights = []
  const animate = !prefersReducedMotion()
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i]
    const config = DETAIL_TYPES[obj.type]
    if (!config) {
      console.warn('Unknown detail type in Tiled: ' + obj.type)
      continue
    }
    const x = Math.round(obj.x)
    const y = Math.round(obj.y) // the object's point = where its feet touch the ground

    const sprite = scene.add.sprite(x, y, 'decor', config.frame).setOrigin(0.5, 1)
    sprite.setDepth(config.flat ? DEPTH.groundDetail : DEPTH.world + y + (config.raise || 0))

    if (config.anim && animate) sprite.play(config.anim)
    if (config.sway === 'sway_sunflower' && animate) {
      // Sunflowers nod gently instead of swapping frames.
      scene.tweens.add({ targets: sprite, angle: 3, duration: 1800 + Math.random() * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 1200 })
    } else if (config.sway && animate) {
      // Start at a random point so the grass doesn't sway in sync.
      sprite.play({ key: config.sway, startFrame: Math.floor(Math.random() * 2), delay: Math.random() * 1500 })
    }
    if (config.shadow) addShadow(scene, x, y - 1, config.shadow)
    if (config.solid) addBlocker(scene, blockers, x, y, config.solid.w, config.solid.h)
    if (config.light) lights.push({ x: x, y: y - sprite.height + 5, radius: 26 })

    const label = tiledProperty(obj, 'label', '')
    if (label) makeLabel(scene, x, y - sprite.height - 1, label, DEPTH.world + y + 0.5)
  }
  return lights
}

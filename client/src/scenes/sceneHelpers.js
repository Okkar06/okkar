// =====================================================================
//  SCENE HELPERS
//  Small pieces of logic that both the Village and the Workshop use:
//  camera, interaction zones, "Press E", tap-to-move, quick-tour travel
//  and the day/night tint.
// =====================================================================

import Phaser from 'phaser'
import { pickZoom } from '../utils/constants.js'
import { state, bus, canPlayerMove } from '../utils/state.js'

// ---------------------------------------------------------------------
//  Camera: follow the player, stay inside the map, zoom to fit the screen.
// ---------------------------------------------------------------------
export function setupCamera(scene, player, worldWidth, worldHeight) {
  const camera = scene.cameras.main
  camera.setBounds(0, 0, worldWidth, worldHeight)
  camera.startFollow(player, true, 0.2, 0.2)
  camera.setRoundPixels(true)

  function applyZoom() {
    camera.setZoom(pickZoom(scene.scale.width, scene.scale.height))
  }
  applyZoom()

  // Re-zoom when the window is resized or a phone is rotated.
  scene.scale.on('resize', applyZoom)
  scene.events.once('shutdown', function () {
    scene.scale.off('resize', applyZoom)
  })
}

// ---------------------------------------------------------------------
//  Interaction zones
//  A zone is { name, section, label, projectId, rect }.
// ---------------------------------------------------------------------
export function makeZone(name, section, label, x, y, width, height, projectId) {
  return {
    name: name,
    section: section,
    label: label,
    projectId: projectId || null,
    rect: new Phaser.Geom.Rectangle(x, y, width, height),
  }
}

export function findZoneAt(zones, x, y) {
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].rect.contains(x, y)) return zones[i]
  }
  return null
}

export function findZoneByName(zones, name) {
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].name === name) return zones[i]
  }
  return null
}

// Check which zone the player's feet are in, and tell the HUD if it changed.
// Also opens a zone automatically if the player walked there by tapping it.
export function updateCurrentZone(zones, player, onInteract) {
  const zone = findZoneAt(zones, player.x, player.y + 6)
  if (zone !== state.currentZone) {
    state.currentZone = zone
    bus.emit('zone:change', zone)
  }
  if (zone && player.pendingZone === zone) {
    player.pendingZone = null
    player.target = null
    onInteract(zone)
  }
}

// ---------------------------------------------------------------------
//  Keyboard "E", the on-screen prompt button, and tap-to-move.
// ---------------------------------------------------------------------
export function setupInteraction(scene, player, zones, onInteract) {
  const keyboard = scene.input.keyboard

  // Phaser normally "captures" arrow keys so the page doesn't scroll.
  // We only want that while the visitor is actually playing: when a
  // panel is open, arrow keys should scroll the panel instead.
  function syncKeyboard() {
    if (state.started && !state.panelOpen) {
      keyboard.enableGlobalCapture()
    } else {
      keyboard.disableGlobalCapture()
    }
    keyboard.resetKeys() // forget keys that were held down
  }
  syncKeyboard()

  // Press E to interact.
  const eKey = keyboard.addKey('E')
  eKey.on('down', function () {
    if (canPlayerMove() && state.currentZone) onInteract(state.currentZone)
  })

  // The HUD prompt button (and the phone "action" tap) sends 'interact'.
  function onBusInteract() {
    if (canPlayerMove() && state.currentZone) onInteract(state.currentZone)
  }

  // Tap / click the map to walk there. Tapping a building walks to its
  // door and opens it on arrival.
  scene.input.on('pointerdown', function (pointer) {
    if (!canPlayerMove()) return
    const x = pointer.worldX
    const y = pointer.worldY
    for (let i = 0; i < zones.length; i++) {
      const r = zones[i].rect
      // The clickable area is the zone plus 3 tiles above it (the building itself).
      if (x >= r.x - 8 && x <= r.right + 8 && y >= r.y - 48 && y <= r.bottom) {
        player.walkTo(r.centerX, r.centerY, zones[i])
        return
      }
    }
    player.walkTo(x, y, null)
  })

  bus.on('interact', onBusInteract)
  bus.on('panel:open', syncKeyboard)
  bus.on('panel:close', syncKeyboard)
  bus.on('game:start', syncKeyboard)

  // Clean up when the scene ends, so listeners don't pile up.
  scene.events.once('shutdown', function () {
    bus.off('interact', onBusInteract)
    bus.off('panel:open', syncKeyboard)
    bus.off('panel:close', syncKeyboard)
    bus.off('game:start', syncKeyboard)
    state.currentZone = null
    bus.emit('zone:change', null)
  })
}

// ---------------------------------------------------------------------
//  Quick-tour travel: smoothly move the player to a named zone.
//  `request` = { zone: 'house', onArrive: function }
// ---------------------------------------------------------------------
export function moveToZone(scene, player, zone, onArrive) {
  const targetX = zone.rect.centerX
  const targetY = zone.rect.centerY - 6 // the feet sit 6px below the sprite centre
  const distance = Phaser.Math.Distance.Between(player.x, player.y, targetX, targetY)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  state.touring = true
  player.target = null
  player.body.enable = false // glide through obstacles during the tour
  player.anims.play('player-walk', true)
  player.setFlipX(targetX < player.x)

  scene.tweens.add({
    targets: player,
    x: targetX,
    y: targetY,
    duration: reduceMotion ? 1 : Math.min(1100, 250 + distance * 2.5),
    ease: 'Sine.easeInOut',
    onComplete: function () {
      player.body.enable = true
      player.body.reset(targetX, targetY)
      player.anims.stop()
      player.setFrame(0)
      state.touring = false
      if (onArrive) onArrive()
    },
  })
}

// ---------------------------------------------------------------------
//  Day / night tint based on the visitor's local time.
//  Add ?time=night (or day, dusk, dawn) to the URL to preview it.
// ---------------------------------------------------------------------
export function addDayNightTint(scene, worldWidth, worldHeight) {
  const params = new URLSearchParams(window.location.search)
  let period = params.get('time')
  if (!period) {
    const hour = new Date().getHours()
    if (hour >= 20 || hour < 6) period = 'night'
    else if (hour >= 18) period = 'dusk'
    else if (hour < 8) period = 'dawn'
    else period = 'day'
  }

  let color = 0x000000
  let alpha = 0
  if (period === 'night') { color = 0x1b2a5c; alpha = 0.3 }
  if (period === 'dusk') { color = 0xff8a3d; alpha = 0.14 }
  if (period === 'dawn') { color = 0xffc58a; alpha = 0.1 }
  if (alpha === 0) return period

  // One big see-through rectangle on top of the whole world.
  scene.add.rectangle(0, 0, worldWidth, worldHeight, color, alpha).setOrigin(0, 0).setDepth(100000)
  return period
}

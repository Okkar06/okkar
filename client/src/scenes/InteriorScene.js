// =====================================================================
//  INTERIOR SCENE — the inside of a building, built from a room in
//  src/data/decor.js (`rooms.house`). Start it with
//      this.scene.start('InteriorScene', { room: 'house' })
//  The room's furniture list is placed in a loop (systems/Furniture.js).
// =====================================================================

import Phaser from 'phaser'
import { Player } from '../entities/Player.js'
import { TILE_SIZE } from '../utils/constants.js'
import { bus } from '../utils/state.js'
import { rooms } from '../data/decor.js'
import { openSection } from '../ui/sections.js'
import { showToast } from '../ui/Hud.js'
import { buildRoom, addIndoorAtmosphere } from '../systems/RoomBuilder.js'
import { placeItems } from '../systems/Furniture.js'
import { LightSystem } from '../systems/Lights.js'
import { setupCamera, makeZone, findZoneByName, updateCurrentZone, setupInteraction, moveToZone } from './sceneHelpers.js'

export class InteriorScene extends Phaser.Scene {
  constructor() {
    super('InteriorScene')
  }

  create(data) {
    const T = TILE_SIZE
    this.roomKey = (data && data.room) || 'house'
    const room = rooms[this.roomKey]

    // ----- 1. Floor and walls -----
    const built = buildRoom(this, room, room.width, room.height)
    this.physics.world.setBounds(0, 0, built.worldWidth, built.worldHeight)

    // ----- 2. Furniture (in a loop) and lights -----
    const blockers = []
    this.lightSystem = new LightSystem(this)
    placeItems(this, room.items, {
      roomWidth: room.width,
      roomHeight: room.height,
      blockers: blockers,
      lights: this.lightSystem,
      alwaysOn: true, // indoor lights are always on
    })
    addIndoorAtmosphere(this, built.worldWidth, built.worldHeight)

    // ----- 3. Things you can use, plus the door out -----
    this.zones = []
    for (let i = 0; i < room.interactables.length; i++) {
      const z = room.interactables[i]
      this.zones.push(makeZone(z.name, z.section, z.label, z.x * T, z.y * T, z.w * T, z.h * T))
    }
    // The door zone covers the last floor row AND the doorway itself, and
    // walking down through the doorway takes you outside (see update()).
    const exitY = (room.height - 2) * T
    this.zones.push(makeZone('exit', 'exit', 'Go back outside', (built.exitX - 1) * T, exitY + 4, 3 * T, 2 * T - 4))
    this.doorwayY = (room.height - 1) * T + 4 // feet below this line = stepped out of the door
    this.leaving = false

    // ----- 4. Player (starts at the door), camera, input -----
    this.player = new Player(this, built.exitX * T + T / 2, exitY + 2)
    this.physics.add.collider(this.player, built.wallLayer)
    this.physics.add.collider(this.player, blockers)
    setupCamera(this, this.player, built.worldWidth, built.worldHeight, { fitRoom: true })
    this.cameras.main.setBackgroundColor('#2a1d24')
    const scene = this
    setupInteraction(this, this.player, this.zones, function (zone) { scene.interact(zone) })

    // Quick tour: stops outside make us walk out first.
    function onTravel(request) {
      const zone = findZoneByName(scene.zones, request.zone)
      if (zone) moveToZone(scene, scene.player, zone, request.onArrive)
      else scene.leave(request.zone, request.onArrive)
    }
    bus.on('travel', onTravel)
    this.events.once('shutdown', function () { bus.off('travel', onTravel) })

    this.cameras.main.fadeIn(250, 0, 0, 0)
    bus.emit('location', room.title)
  }

  interact(zone) {
    if (zone.section === 'exit') {
      this.leave(this.roomKey, null)
      return
    }
    if (zone.section === 'cat') {
      showToast('The cat purrs and goes straight back to sleep.')
      return
    }
    openSection(zone.section)
  }

  // Back to the village, standing at `zoneName` (default: this building's door).
  leave(zoneName, onArrive) {
    if (this.leaving) return
    this.leaving = true
    const scene = this
    this.player.setVelocity(0, 0)
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', function () {
      scene.scene.start('VillageScene', { spawnAt: zoneName || scene.roomKey, onArrive: onArrive })
    })
  }

  update() {
    this.player.update()
    const scene = this
    updateCurrentZone(this.zones, this.player, function (zone) { scene.interact(zone) })
    // Walked out through the doorway: go outside.
    if (this.player.y + 6 > this.doorwayY) this.leave(this.roomKey, null)
  }
}

// =====================================================================
//  WORKSHOP SCENE (Projects)
//
//  This room is built in code, NOT in Tiled, because its size depends
//  on how many projects you have. For every project in
//  src/data/projects.js we place one shelf with a little model on top
//  and a name plate. Up to 4 shelves per row; more projects = more rows
//  = a taller room. So adding a project automatically adds a shelf.
//  Tool racks, blueprints and the workbench come from src/data/decor.js.
// =====================================================================

import Phaser from 'phaser'
import { Player } from '../entities/Player.js'
import { TILE_SIZE, DEPTH } from '../utils/constants.js'
import { bus } from '../utils/state.js'
import { projects } from '../data/projects.js'
import { rooms } from '../data/decor.js'
import { openSection } from '../ui/sections.js'
import { buildRoom, addIndoorAtmosphere } from '../systems/RoomBuilder.js'
import { placeItems } from '../systems/Furniture.js'
import { LightSystem } from '../systems/Lights.js'
import { addBlocker, addShadow, makeLabel } from '../systems/Decorations.js'
import { setupCamera, makeZone, findZoneByName, updateCurrentZone, setupInteraction, moveToZone } from './sceneHelpers.js'

const SHELVES_PER_ROW = 4
const SHELF_SPACING = 4 // tiles from one shelf to the next
const MODELS = ['model_house', 'model_rocket', 'model_robot', 'model_gear'] // one per shelf, repeating

export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super('WorkshopScene')
  }

  create() {
    const T = TILE_SIZE
    const room = rooms.workshop
    const projectCount = projects.length

    // ----- 1. Work out the room size from the number of projects -----
    const shelfRows = Math.max(1, Math.ceil(projectCount / SHELVES_PER_ROW))
    const widestRow = Math.max(1, Math.min(projectCount, SHELVES_PER_ROW))
    const roomWidth = Math.max(14, widestRow * SHELF_SPACING + 5) // in tiles
    const roomHeight = 3 + shelfRows * 4 + 4

    const built = buildRoom(this, room, roomWidth, roomHeight)
    this.physics.world.setBounds(0, 0, built.worldWidth, built.worldHeight)
    const blockers = []
    this.lightSystem = new LightSystem(this)

    // ----- 2. One shelf per project (in a loop) -----
    this.zones = []
    for (let i = 0; i < projectCount; i++) {
      const project = projects[i]
      const row = Math.floor(i / SHELVES_PER_ROW)
      const col = i % SHELVES_PER_ROW

      // Centre each row, even if it isn't full.
      const shelvesInThisRow = Math.min(SHELVES_PER_ROW, projectCount - row * SHELVES_PER_ROW)
      const rowWidthInTiles = shelvesInThisRow * SHELF_SPACING - 2
      const startX = Math.floor((roomWidth - rowWidthInTiles) / 2)
      const shelfX = (startX + col * SHELF_SPACING) * T + 7 // left edge in pixels
      const shelfBottom = (4 + row * 4 + 1) * T // stands on row 4 (+4 per row)

      // The shelf, its shadow and its solid base
      const shelf = this.add.image(shelfX, shelfBottom, 'decor', 'bookshelf_b').setOrigin(0, 1)
      shelf.setDepth(DEPTH.world + shelfBottom)
      addShadow(this, shelfX + shelf.width / 2, shelfBottom - 1, 'shadow')
      addBlocker(this, blockers, shelfX + shelf.width / 2, shelfBottom, shelf.width - 2, 10)

      // A little model on top (house, rocket, robot, gear...)
      const model = this.add.image(shelfX + shelf.width / 2, shelfBottom - shelf.height + 2, 'decor', MODELS[i % MODELS.length])
      model.setOrigin(0.5, 1).setDepth(DEPTH.world + shelfBottom + 1)

      // Name plate under the shelf
      const plate = makeLabel(this, shelfX + shelf.width / 2, shelfBottom + 2, project.title.split(' — ')[0], DEPTH.world + shelfBottom + 2, 60)
      plate.setOrigin(0.5, 0) // hang down from the shelf, so long names wrap downwards

      // Standing in front of the shelf opens the project.
      this.zones.push(makeZone(
        'project-' + project.id, 'project', 'Look at ' + project.title.split(' — ')[0],
        shelfX - T, shelfBottom + 2, 3 * T, T + 10, project.id
      ))
    }

    // ----- 3. Tool racks, blueprints, the workbench... -----
    placeItems(this, room.items, { roomWidth: roomWidth, roomHeight: roomHeight, blockers: blockers, lights: this.lightSystem, alwaysOn: true })
    addIndoorAtmosphere(this, built.worldWidth, built.worldHeight)

    // The workbench holds the project catalogue (a list of everything).
    this.zones.push(makeZone('catalogue', 'projects', 'Read the project catalogue', 1 * T, (roomHeight - 2) * T, 3 * T, T))
    this.zones.push(makeZone('exit', 'exit', 'Go back outside', (built.exitX - 1) * T, (roomHeight - 2) * T + 4, 3 * T, T - 4))

    // ----- 4. Player, camera, input -----
    this.player = new Player(this, built.exitX * T + T / 2, (roomHeight - 2) * T + 2)
    this.physics.add.collider(this.player, built.wallLayer)
    this.physics.add.collider(this.player, blockers)
    setupCamera(this, this.player, built.worldWidth, built.worldHeight, { fitRoom: true })
    this.cameras.main.setBackgroundColor('#2a1d24')
    const scene = this
    setupInteraction(this, this.player, this.zones, function (zone) { scene.interact(zone) })

    // Quick tour: stops in the village make us walk out first.
    function onTravel(request) {
      const zone = findZoneByName(scene.zones, request.zone)
      if (zone) moveToZone(scene, scene.player, zone, request.onArrive)
      else scene.leave(request.zone, request.onArrive)
    }
    bus.on('travel', onTravel)
    this.events.once('shutdown', function () { bus.off('travel', onTravel) })

    this.cameras.main.fadeIn(250, 0, 0, 0)
    bus.emit('location', 'Workshop: ' + projectCount + (projectCount === 1 ? ' project' : ' projects'))
  }

  interact(zone) {
    if (zone.section === 'exit') {
      this.leave('workshop', null)
      return
    }
    if (zone.section === 'project') {
      openSection('project', { projectId: zone.projectId })
      return
    }
    openSection(zone.section)
  }

  // Go back to the village, standing at `zoneName` (default: the workshop door).
  leave(zoneName, onArrive) {
    const scene = this
    this.player.setVelocity(0, 0)
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', function () {
      scene.scene.start('VillageScene', { spawnAt: zoneName || 'workshop', onArrive: onArrive })
    })
  }

  update() {
    this.player.update()
    const scene = this
    updateCurrentZone(this.zones, this.player, function (zone) { scene.interact(zone) })
  }
}

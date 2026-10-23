// =====================================================================
//  WORKSHOP SCENE (Projects)
//
//  This room is built in code, NOT in Tiled, because its size depends
//  on how many projects you have. For every project in
//  src/data/projects.js we place one bookshelf with a name plate.
//  Up to 4 shelves per row; more projects = more rows = a taller room.
//  So adding a project to the data file automatically adds a shelf.
// =====================================================================

import Phaser from 'phaser'
import { Player } from '../entities/Player.js'
import { TILE_SIZE, DUNGEON_TILES } from '../utils/constants.js'
import { bus } from '../utils/state.js'
import { projects } from '../data/projects.js'
import { openSection } from '../ui/sections.js'
import {
  setupCamera,
  makeZone,
  findZoneByName,
  updateCurrentZone,
  setupInteraction,
  moveToZone,
} from './sceneHelpers.js'

const SHELVES_PER_ROW = 4
const SHELF_SPACING = 4 // tiles from one shelf to the next (2 wide + 2 gap)

export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super('WorkshopScene')
  }

  create() {
    const T = TILE_SIZE
    const projectCount = projects.length

    // ----- 1. Work out the room size from the number of projects -----
    const shelfRows = Math.max(1, Math.ceil(projectCount / SHELVES_PER_ROW))
    const widestRow = Math.max(1, Math.min(projectCount, SHELVES_PER_ROW))
    const roomWidth = Math.max(13, widestRow * SHELF_SPACING + 5) // in tiles
    const roomHeight = 4 + shelfRows * 4 + 3
    const doorX = Math.floor(roomWidth / 2)

    // ----- 2. Create an empty tilemap and fill it with loops -----
    const map = this.make.tilemap({ tileWidth: T, tileHeight: T, width: roomWidth, height: roomHeight })
    const tiles = map.addTilesetImage('tiny-dungeon', 'tiles-dungeon', T, T, 0, 0)
    const floorLayer = map.createBlankLayer('Floor', tiles).setDepth(0)
    const wallLayer = map.createBlankLayer('Walls', tiles).setDepth(1)
    const furnitureLayer = map.createBlankLayer('Furniture', tiles).setDepth(2)

    for (let y = 0; y < roomHeight; y++) {
      for (let x = 0; x < roomWidth; x++) {
        const isEdge = x === 0 || y === 0 || x === roomWidth - 1 || y === roomHeight - 1
        const isBackWall = y === 1 // second row of the back wall
        if (isEdge || isBackWall) {
          wallLayer.putTileAt(DUNGEON_TILES.wall, x, y)
        } else {
          // Pick a floor tile "randomly" but the same every visit.
          const pick = (x * 7 + y * 13) % DUNGEON_TILES.floor.length
          floorLayer.putTileAt(DUNGEON_TILES.floor[pick], x, y)
        }
      }
    }
    // Banners along the back wall, and the exit door at the bottom.
    for (let x = 2; x < roomWidth - 2; x += 3) {
      wallLayer.putTileAt(DUNGEON_TILES.banner, x, 1)
    }
    wallLayer.putTileAt(DUNGEON_TILES.door, doorX, roomHeight - 1)

    // A little clutter in the corners.
    furnitureLayer.putTileAt(DUNGEON_TILES.barrel, 1, 2)
    furnitureLayer.putTileAt(DUNGEON_TILES.chest, roomWidth - 2, 2)
    furnitureLayer.putTileAt(DUNGEON_TILES.anvil, roomWidth - 2, roomHeight - 3)

    // ----- 3. One shelf per project -----
    this.zones = []
    for (let i = 0; i < projectCount; i++) {
      const project = projects[i]
      const row = Math.floor(i / SHELVES_PER_ROW)
      const col = i % SHELVES_PER_ROW

      // Centre each row, even if it isn't full.
      const shelvesInThisRow = Math.min(SHELVES_PER_ROW, projectCount - row * SHELVES_PER_ROW)
      const rowWidthInTiles = shelvesInThisRow * SHELF_SPACING - 2
      const startX = Math.floor((roomWidth - rowWidthInTiles) / 2)
      const shelfX = startX + col * SHELF_SPACING
      const shelfY = 3 + row * 4

      // A bookshelf is 2 tiles wide and 2 tiles tall.
      furnitureLayer.putTileAt(DUNGEON_TILES.bookshelfTop, shelfX, shelfY)
      furnitureLayer.putTileAt(DUNGEON_TILES.bookshelfTop, shelfX + 1, shelfY)
      furnitureLayer.putTileAt(DUNGEON_TILES.bookshelfBottom, shelfX, shelfY + 1)
      furnitureLayer.putTileAt(DUNGEON_TILES.bookshelfBottom, shelfX + 1, shelfY + 1)

      // Name plate. Big font scaled down = crisp text at any zoom.
      const shortTitle = project.title.split(' — ')[0]
      const plate = this.add.text((shelfX + 1) * T, (shelfY + 2) * T + 1, shortTitle, {
        fontFamily: 'monospace',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#fdf3dc',
        align: 'center',
        backgroundColor: '#3f2631',
        padding: { x: 6, y: 2 },
        wordWrap: { width: 4 * T * 4 - 16 },
      })
      plate.setOrigin(0.5, 0).setScale(0.25).setDepth(5)

      // Standing in front of the shelf opens the project.
      this.zones.push(makeZone(
        'project-' + project.id, 'project', project.title,
        (shelfX - 1) * T, (shelfY + 2) * T, 4 * T, T + 8, project.id
      ))
    }

    // ----- 4. The catalogue desk (list of all projects) and the exit -----
    const deskX = 2
    const deskY = roomHeight - 3
    furnitureLayer.putTileAt(DUNGEON_TILES.table, deskX, deskY)
    furnitureLayer.putTileAt(DUNGEON_TILES.ledger, deskX + 1, deskY)
    this.zones.push(makeZone('catalogue', 'projects', 'Catalogue — all projects', (deskX - 1) * T, (deskY + 1) * T, 4 * T, T))
    this.zones.push(makeZone('exit', 'exit', 'Door — back to the village', (doorX - 1) * T, (roomHeight - 2) * T + 4, 3 * T, T - 4))

    // Walls and furniture are solid.
    wallLayer.setCollisionByExclusion([-1])
    furnitureLayer.setCollisionByExclusion([-1])

    // ----- 5. Player, camera, input -----
    const worldWidth = roomWidth * T
    const worldHeight = roomHeight * T
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.player = new Player(this, doorX * T + T / 2, (roomHeight - 2) * T - 4)
    this.player.setFlipX(false)
    this.physics.add.collider(this.player, wallLayer)
    this.physics.add.collider(this.player, furnitureLayer)

    setupCamera(this, this.player, worldWidth, worldHeight)
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
    bus.emit('location', 'Workshop · ' + projectCount + (projectCount === 1 ? ' project' : ' projects'))
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

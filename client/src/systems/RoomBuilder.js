// =====================================================================
//  ROOM BUILDER — builds an interior's floor and walls in code.
//
//  Layout of every room (rows from the top):
//    row 0        top of the back wall (dark trim)
//    rows 1-2     the back wall you look at (wallpaper or brick)
//    rows 3...    floor
//    last row     bottom wall, with a doorway at `exitX`
//  The left and right columns are wall too.
// =====================================================================

import { EXTRAS } from '../theme/tileIds.js'
import { DEPTH, TILE_SIZE } from '../utils/constants.js'

export function buildRoom(scene, room, width, height) {
  const T = TILE_SIZE
  const map = scene.make.tilemap({ tileWidth: T, tileHeight: T, width: width, height: height })
  const tiles = map.addTilesetImage('extras', 'tiles-extras', T, T, 0, 0)
  const floorLayer = map.createBlankLayer('Floor', tiles).setDepth(DEPTH.ground)
  const wallLayer = map.createBlankLayer('Walls', tiles).setDepth(DEPTH.decor)
  const exitX = room.exitX === undefined ? Math.floor(width / 2) : room.exitX

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isSide = x === 0 || x === width - 1
      const isBottom = y === height - 1
      if (y === 0 || isSide) {
        wallLayer.putTileAt(EXTRAS.wall_cap, x, y)
      } else if (y === 1) {
        wallLayer.putTileAt(EXTRAS[room.wallTop], x, y)
      } else if (y === 2) {
        wallLayer.putTileAt(EXTRAS[room.wall], x, y)
      } else if (isBottom) {
        if (x === exitX) floorLayer.putTileAt(EXTRAS.threshold, x, y)
        else wallLayer.putTileAt(EXTRAS.wall_cap, x, y)
      } else {
        // Pick a floor variant "randomly", but the same on every visit.
        const pick = (x * 7 + y * 13) % room.floor.length
        floorLayer.putTileAt(EXTRAS[room.floor[pick]], x, y)
      }
    }
  }
  wallLayer.setCollisionByExclusion([-1]) // every wall tile is solid

  return {
    map: map,
    wallLayer: wallLayer,
    exitX: exitX,
    worldWidth: width * T,
    worldHeight: height * T,
  }
}

// A cosy indoor atmosphere: the room is a little dimmer than outside, so
// the lamps, fire and windows (drawn above this) glow warmly.
export function addIndoorAtmosphere(scene, worldWidth, worldHeight) {
  scene.add.rectangle(0, 0, worldWidth, worldHeight, 0x2a1d24, 0.22).setOrigin(0, 0).setDepth(DEPTH.light - 1)
}

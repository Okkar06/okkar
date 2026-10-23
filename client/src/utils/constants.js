// =====================================================================
//  GAME CONSTANTS — tweak numbers here instead of hunting through code.
// =====================================================================

export const TILE_SIZE = 16

// Drawing order, lowest first (see the game-polish skill).
// Things in the "world" band add their feet y, so lower = in front.
export const DEPTH = {
  ground: 0, // grass, paths, water
  decor: 1, // flat decor tiles, fences
  groundDetail: 2, // puddles, ripples, rugs, things lying flat
  world: 10, // + feet y: player, NPC, trees, props, furniture
  above: 5000, // roofs and canopies the player walks behind
  light: 6000, // glows from windows, lamps, fire
  weather: 7000, // rain, snow, fog, petals
  tint: 8000, // day/night and weather colour overlays
  worldUi: 9000, // guide arrow, "!" bubble, name labels
}

// How fast the player walks, in pixels per second.
export const PLAYER_SPEED = 80

// Where the assets live. BASE_URL respects the Vite "base" setting,
// so this also works when the site is hosted in a sub-folder.
export const ASSETS = import.meta.env.BASE_URL + 'assets/'

// Frame numbers in public/assets/tilesets/tiny-dungeon.png (12 columns, starting at 0).
// Used to build the Workshop interior in code.
export const DUNGEON_TILES = {
  floor: [48, 48, 48, 48, 48, 49],
  wall: 40,
  wallTop: 28,
  door: 46,
  bookshelfTop: 63,
  bookshelfBottom: 75,
  banner: 29,
  chest: 89,
  barrel: 82,
  table: 72,
  anvil: 74,
  ledger: 66,
}

// Pick a whole-number camera zoom that suits the screen size.
// Whole numbers keep pixel art crisp (no blurry half pixels).
export function pickZoom(screenWidth, screenHeight) {
  // Aim to show roughly 20 tiles across and 12 tiles down.
  let zoom = Math.floor(Math.min(screenWidth / (TILE_SIZE * 20), screenHeight / (TILE_SIZE * 12)))
  if (zoom < 2) zoom = 2
  if (zoom > 5) zoom = 5
  return zoom
}

// Read a custom property that was set on an object in Tiled.
export function getTiledProperty(tiledObject, name, fallback) {
  const list = tiledObject.properties || []
  for (let i = 0; i < list.length; i++) {
    if (list[i].name === name) return list[i].value
  }
  return fallback
}

// =====================================================================
//  STARTER MAP GENERATOR
//
//  Builds the village layout as a normal Tiled map. You do NOT need this
//  to edit the map: open public/assets/maps/village.json in Tiled.
//
//    node tools/generate-starter-map.mjs              -> writes village.generated.json
//    node tools/generate-starter-map.mjs --overwrite  -> replaces village.json
//
//  ⚠ --overwrite throws away any edits you made in Tiled.
//
//  Tilesets: Kenney "tiny-town" (firstgid 1) + generated "extras".
// =====================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXTRAS, EXTRAS_SOLID } from '../src/theme/tileIds.js'
import { seededRandom } from './lib/PixelCanvas.mjs'

const clientDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const W = 48
const H = 36
const T = 16
const TOWN_COUNT = 132 // tiles in tiny-town.png
const EXTRAS_FIRST = TOWN_COUNT + 1
const random = seededRandom(2027)

// Kenney Tiny Town tile numbers (0-based, as in the tileset image)
const K = {
  grass: 0, grassTuft: 1, grassFlowers: 2,
  treeOrange: 3, bush: 5, treeRoundOrange: 15, treeRoundGreen: 16, treeSmallOrange: 27, treeSmallGreen: 28,
  sprout: 17, mushrooms: 29,
  dirtTL: 12, dirtT: 13, dirtTR: 14, dirtL: 24, dirt: 25, dirtR: 26, dirtBL: 36, dirtB: 37, dirtBR: 38,
  dirtInnerTL: 39, dirtInnerTR: 40, dirtInnerBR: 41, dirtInnerBL: 42,
  beehive: 94, well: 104, log: 106, pot: 107, barrel: 130, waterBarrel: 131,
}
const TREES = [K.treeSmallGreen, K.treeRoundGreen, K.treeSmallGreen, K.treeRoundGreen, K.treeSmallOrange, K.treeRoundOrange, K.treeOrange]

// Kenney tiles that are solid (the Tiled property collides=true).
const KENNEY_SOLID = new Set(
  [3, 4, 5, 15, 16, 27, 28, 44, 45, 46, 47, 56, 58, 59, 68, 69, 70, 71, 80, 81, 82, 83,
    72, 73, 74, 75, 76, 77, 78, 79, 84, 85, 86, 87, 88, 89, 90, 91, 92, 94, 95, 104, 106, 107, 130, 131]
)

// ---------------------------------------------------------------------
//  Grids (gid 0 = empty). town(i) / extra(name) convert to Tiled gids.
// ---------------------------------------------------------------------
function grid(value) {
  const rows = []
  for (let y = 0; y < H; y++) rows.push(new Array(W).fill(value))
  return rows
}
const ground = grid(0)
const decor = grid(0)
const above = grid(0)
const water = grid(0) // the lake (its own layer, solid except the dock)
const dirt = grid(false) // where the dirt paths go
const reserved = grid(false) // cells no random detail may use

function town(index) {
  return index + 1
}
function extra(name) {
  if (EXTRAS[name] === undefined) throw new Error('Unknown extras tile: ' + name)
  return EXTRAS_FIRST + EXTRAS[name]
}
function inMap(x, y) {
  return x >= 0 && y >= 0 && x < W && y < H
}
function reserve(x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inMap(x, y)) reserved[y][x] = true
}
function paintDirt(x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inMap(x, y)) dirt[y][x] = true
}
function stamp(layer, x, y, rows) {
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      if (rows[j][i] !== null) layer[y + j][x + i] = town(rows[j][i])
    }
  }
  reserve(x, y, x + rows[0].length - 1, y + rows.length - 1)
}

// ---------------------------------------------------------------------
//  1. Grass everywhere, with tufts and flowers in loose clusters
// ---------------------------------------------------------------------
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // A cheap "noise": overlapping sine waves make patchy areas.
    const n = Math.sin(x * 0.55) + Math.sin(y * 0.7 + x * 0.2) + random() * 0.9
    let tile = K.grass
    if (n > 1.35) tile = K.grassTuft
    if (n > 2.05) tile = K.grassFlowers
    ground[y][x] = town(tile)
  }
}

// ---------------------------------------------------------------------
//  2. North cliff (rows 4-5) with forest on top, tree lines elsewhere
// ---------------------------------------------------------------------
const CLIFF_ROW = 4
for (let x = 0; x < W; x++) {
  decor[CLIFF_ROW][x] = extra(x % 3 === 1 ? 'cliff_top_b' : 'cliff_top_a')
  decor[CLIFF_ROW + 1][x] = extra(x % 4 === 2 ? 'cliff_bottom_b' : 'cliff_bottom_a')
}
reserve(0, 0, W - 1, CLIFF_ROW + 1)
for (let y = 0; y < CLIFF_ROW; y++) {
  for (let x = 0; x < W; x++) {
    if ((x + y) % 2 === 0 || random() < 0.35) decor[y][x] = town(TREES[Math.floor(random() * TREES.length)])
  }
}
function forestFloor(x, y) {
  ground[y][x] = extra((x * 7 + y * 3) % 5 === 0 ? 'forest_floor_b' : 'forest_floor_a')
}
for (let y = 0; y < CLIFF_ROW; y++) for (let x = 0; x < W; x++) forestFloor(x, y)
function treeLine(x0, y0, x1, y1, density) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!inMap(x, y)) continue
      if (decor[y][x]) continue
      if (random() < density) {
        decor[y][x] = town(TREES[Math.floor(random() * TREES.length)])
        forestFloor(x, y) // darker floor only under trees: an organic edge
      }
      reserved[y][x] = true
    }
  }
}
treeLine(0, 6, 1, H - 1, 0.95) // west edge
treeLine(2, 6, 2, H - 1, 0.55)
treeLine(W - 2, 6, W - 1, H - 1, 0.95) // east edge
treeLine(W - 3, 6, W - 3, H - 1, 0.55)
treeLine(0, H - 2, W - 1, H - 1, 0.95) // south edge
treeLine(3, H - 3, W - 4, H - 3, 0.45)
treeLine(31, 7, 32, 12, 0.7) // between the crop field and the workshop
treeLine(3, 28, 7, 32, 0.6) // south-west grove
treeLine(16, 24, 18, 27, 0.5) // beside the south road

// ---------------------------------------------------------------------
//  3. Buildings (walls in Decor = solid, roofs in Above = walk-behind)
// ---------------------------------------------------------------------
const HOUSE = { x: 8, y: 9 } // red-roof house, 5 wide
stamp(above, HOUSE.x, HOUSE.y, [[52, 53, 53, 53, 54], [64, 65, 67, 65, 66]])
stamp(decor, HOUSE.x, HOUSE.y + 2, [[72, 84, 85, 84, 75]])
const HOUSE_DOOR = { x: HOUSE.x + 2, y: HOUSE.y + 2 }

const WORKSHOP = { x: 36, y: 8 } // stone workshop, 6 wide, 2 storeys
stamp(above, WORKSHOP.x, WORKSHOP.y, [[48, 49, 49, 49, 49, 50], [60, 61, 61, 63, 61, 62]])
stamp(decor, WORKSHOP.x, WORKSHOP.y + 2, [[76, 88, 77, 77, 88, 79], [76, 77, 90, 91, 77, 79]])

const POST = { x: 37, y: 19 } // post office, 4 wide
stamp(above, POST.x, POST.y, [[52, 53, 53, 54], [64, 67, 65, 66]])
stamp(decor, POST.x, POST.y + 2, [[84, 85, 84, 87]])

// ---------------------------------------------------------------------
//  4. Dirt paths and the village square
// ---------------------------------------------------------------------
paintDirt(3, 17, 44, 18) // main street
paintDirt(18, 15, 29, 21) // village square
paintDirt(HOUSE_DOOR.x, HOUSE_DOOR.y + 1, HOUSE_DOOR.x + 1, 16) // house -> street
paintDirt(38, 12, 39, 16) // workshop -> street
paintDirt(23, 22, 24, H - 3) // south road to the spawn
paintDirt(9, 19, 10, 24) // street -> market stall
paintDirt(7, 23, 10, 24)
paintDirt(33, 19, 34, 26) // street -> post office / lake
paintDirt(33, 25, 39, 26)

// Dirt autotiling: pick the edge/corner tile from the 8 neighbours.
function isDirt(x, y) {
  return inMap(x, y) && dirt[y][x]
}
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!dirt[y][x]) continue
    const n = isDirt(x, y - 1)
    const s = isDirt(x, y + 1)
    const e = isDirt(x + 1, y)
    const w = isDirt(x - 1, y)
    let tile = K.dirt
    if (!n && !w) tile = K.dirtTL
    else if (!n && !e) tile = K.dirtTR
    else if (!s && !w) tile = K.dirtBL
    else if (!s && !e) tile = K.dirtBR
    else if (!n) tile = K.dirtT
    else if (!s) tile = K.dirtB
    else if (!w) tile = K.dirtL
    else if (!e) tile = K.dirtR
    else if (!isDirt(x - 1, y - 1)) tile = K.dirtInnerTL
    else if (!isDirt(x + 1, y - 1)) tile = K.dirtInnerTR
    else if (!isDirt(x + 1, y + 1)) tile = K.dirtInnerBR
    else if (!isDirt(x - 1, y + 1)) tile = K.dirtInnerBL
    ground[y][x] = town(tile)
    reserved[y][x] = true
  }
}

// Cobblestones in the middle of the square (the fountain stands here).
for (let y = 15; y <= 21; y++) {
  for (let x = 19; x <= 28; x++) {
    const dx = (x - 23.5) / 4.2
    const dy = (y - 18) / 2.8
    if (dx * dx + dy * dy <= 1) ground[y][x] = extra((x + y) % 2 === 0 ? 'cobble_a' : 'cobble_b')
  }
}

// Crop field north of the square (fenced later).
const FIELD = { x0: 18, y0: 7, x1: 29, y1: 10 }
for (let y = FIELD.y0; y <= FIELD.y1; y++) {
  for (let x = FIELD.x0; x <= FIELD.x1; x++) ground[y][x] = extra((x + y) % 3 === 0 ? 'soil_b' : 'soil_a')
}
reserve(FIELD.x0 - 1, FIELD.y0 - 1, FIELD.x1 + 1, FIELD.y1 + 1)

// ---------------------------------------------------------------------
//  5. Tile props (turned into y-sorted sprites by the game)
// ---------------------------------------------------------------------
function prop(x, y, index) {
  decor[y][x] = town(index)
  reserved[y][x] = true
}
prop(14, 9, K.beehive)
prop(14, 10, K.beehive)
prop(30, 13, K.well)
prop(34, 10, K.barrel)
prop(34, 11, K.waterBarrel)
prop(43, 10, K.log)
prop(42, 12, K.barrel)
prop(5, 21, K.waterBarrel)
prop(12, 22, K.barrel)
prop(41, 22, K.pot)

// ---------------------------------------------------------------------
//  5b. Fences around every plot, with gates where the paths go.
//  Kenney fence pieces: top row 44 (left) 45 (middle) 46 (right),
//  sides 56 (left) / 58 (right), bottom row 68 (left) 69 (middle) 70 (right).
//  The pieces next to a gate are "end" pieces (70 before, 68 after).
// ---------------------------------------------------------------------
const fenceMiddles = [] // middle pieces, so some can get vines/flowers later
function fenceRow(y, x0, x1, left, middle, right, gate) {
  for (let x = x0; x <= x1; x++) {
    if (gate && x >= gate[0] && x <= gate[1]) continue // the gap
    let tile = middle
    if (x === x0) tile = left
    else if (x === x1) tile = right
    else if (gate && x === gate[0] - 1) tile = right // end before the gap
    else if (gate && x === gate[1] + 1) tile = left // start after the gap
    decor[y][x] = town(tile)
    reserved[y][x] = true
    if (tile === middle) fenceMiddles.push({ x: x, y: y })
  }
}
function fenceSide(x, y0, y1, piece, topEnd) {
  for (let y = y0; y <= y1; y++) {
    decor[y][x] = town(y === y0 && topEnd ? 47 : piece)
    reserved[y][x] = true
  }
}
// options: { top: true/false, gate: [fromX, toX] in the bottom row }
function fencePlot(x0, y0, x1, y1, options) {
  if (options.top !== false) fenceRow(y0, x0, x1, 44, 45, 46, null)
  fenceSide(x0, y0 + 1, y1 - 1, 56, options.top === false)
  fenceSide(x1, y0 + 1, y1 - 1, 58, options.top === false)
  fenceRow(y1, x0, x1, 68, 69, 70, options.gate)
}
fencePlot(5, 7, 15, 15, { gate: [10, 11] }) // Okkar's house garden
fencePlot(33, 7, 44, 15, { gate: [38, 39] }) // workshop yard
fencePlot(36, 21, 42, 24, { top: false, gate: [38, 39] }) // post office front yard
fencePlot(17, 6, 30, 11, { gate: [23, 24] }) // crop field
fenceRow(19, 3, 8, 44, 45, 46, null) // a fence behind the market stall

// ---------------------------------------------------------------------
//  5c. The lake: an organic blob of water with a sand ring and a dock
// ---------------------------------------------------------------------
const lake = grid(false)
const dock = grid(false)
for (let y = 26; y <= 34; y++) {
  for (let x = 28; x <= 45; x++) {
    const wobble = Math.sin(x * 1.3) * 0.08 + Math.cos(y * 2.1 + x) * 0.06
    const dx = (x - 37) / 7.3
    const dy = (y - 30.2) / 2.75
    if (dx * dx + dy * dy <= 1 + wobble) lake[y][x] = true
  }
}
const DOCK = { x: 35, top: 28, end: 31 } // two tiles wide: x and x+1
for (let y = DOCK.top; y <= DOCK.end; y++) {
  for (let x = DOCK.x; x <= DOCK.x + 1; x++) { lake[y][x] = true; dock[y][x] = true }
}

// Autotile class for a cell inside `region` (same rules as the dirt paths).
function classify(region, x, y) {
  const inside = function (cx, cy) { return inMap(cx, cy) && region[cy][cx] }
  const n = inside(x, y - 1), s = inside(x, y + 1), e = inside(x + 1, y), w = inside(x - 1, y)
  if (!n && !w) return 'nw'
  if (!n && !e) return 'ne'
  if (!s && !w) return 'sw'
  if (!s && !e) return 'se'
  if (!n) return 'n'
  if (!s) return 's'
  if (!w) return 'w'
  if (!e) return 'e'
  if (!inside(x - 1, y - 1)) return 'inw'
  if (!inside(x + 1, y - 1)) return 'ine'
  if (!inside(x + 1, y + 1)) return 'ise'
  if (!inside(x - 1, y + 1)) return 'isw'
  return 'c'
}

// The sand ring = every non-water cell touching water (8 directions).
const shore = grid(false) // sand OR water
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (lake[y][x]) { shore[y][x] = true; continue }
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (inMap(x + i, y + j) && lake[y + j][x + i]) shore[y][x] = true
  }
}
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!shore[y][x]) continue
    decor[y][x] = 0 // no trees in the lake or on the beach
    reserved[y][x] = true
    ground[y][x] = extra('sand_' + (lake[y][x] ? 'c' : classify(shore, x, y)))
    if (!lake[y][x]) continue
    if (dock[y][x]) {
      const side = x === DOCK.x ? 'l' : 'r'
      water[y][x] = extra((y === DOCK.end ? 'dock_end_' : 'dock_') + side)
    } else {
      water[y][x] = extra('water_' + classify(lake, x, y) + '_0')
    }
  }
}

// Reserve the lake, building fronts and other key spots.
reserve(29, 26, 45, 34) // lakeside
reserve(5, 7, 15, 15) // house plot
reserve(33, 7, 44, 15) // workshop plot
reserve(35, 19, 42, 24) // post office plot
reserve(5, 19, 11, 25) // market stall
reserve(20, 11, 25, 15) // notice board
reserve(21, 22, 28, 27) // spawn + villager

// ---------------------------------------------------------------------
//  6. Objects: props, interactables, areas, spawn, details
// ---------------------------------------------------------------------
let nextId = 1
function prop_(type, value) {
  return { name: type, type: typeof value === 'boolean' ? 'bool' : typeof value === 'number' ? (Number.isInteger(value) ? 'int' : 'float') : 'string', value: value }
}
function obj(name, x, y, w, h, props, extraFields) {
  const o = { id: nextId++, name: name, type: '', x: x, y: y, width: w, height: h, rotation: 0, visible: true }
  if (props) {
    o.properties = []
    for (const key of Object.keys(props)) o.properties.push(prop_(key, props[key]))
  }
  return Object.assign(o, extraFields || {})
}
function point(name, type, x, y, props) {
  return obj(name, x, y, 0, 0, props, { type: type, point: true })
}

const props = [
  obj('noticeboard', 22 * T, 12 * T, 32, 32, { sprite: 'noticeboard', bodyHeight: 14 }),
  obj('market', 6 * T, 20 * T, 48, 48, { sprite: 'stall', bodyHeight: 20 }),
  obj('mailbox', 35 * T, 23 * T, 16, 16, { sprite: 'mailbox', bodyHeight: 6 }),
  obj('npc', 26 * T, 24 * T, 16, 16, { sprite: 'npc', bodyHeight: 8 }),
]

const interactables = [
  obj('house', (HOUSE_DOOR.x - 1) * T, (HOUSE_DOOR.y + 1) * T, 3 * T, 24, { section: 'house', label: "Enter Okkar's house" }),
  obj('workshop', 37 * T, 12 * T, 4 * T, 24, { section: 'workshop', label: 'Enter the Workshop' }),
  obj('noticeboard', 21 * T, 14 * T, 4 * T, 20, { section: 'skills', label: 'Read the skills board' }),
  obj('market', 6 * T, 23 * T, 4 * T, 28, { section: 'experience', label: 'Visit the market stall' }),
  obj('mailbox', 34 * T, 22 * T, 3 * T, 3 * T, { section: 'contact', label: 'Check the mailbox' }),
  obj('npc', 25 * T, 23 * T, 3 * T, 3 * T, { section: 'npc', label: 'Talk to Pip' }),
  obj('fishing', DOCK.x * T, DOCK.end * T, 2 * T, T, { section: 'fishing', label: 'Fish from the dock' }),
]

const areas = [
  obj("Okkar's House", 3 * T, 6 * T, 13 * T, 11 * T),
  obj('Workshop Yard', 32 * T, 6 * T, 14 * T, 11 * T),
  obj('Village Square', 16 * T, 6 * T, 16 * T, 17 * T),
  obj('Market Corner', 2 * T, 19 * T, 14 * T, 15 * T),
  obj('Post Office', 32 * T, 19 * T, 14 * T, 7 * T),
  obj('Lakeside', 28 * T, 26 * T, 18 * T, 10 * T),
  obj('South Road', 16 * T, 23 * T, 12 * T, 13 * T),
]

const spawn = [point('player_spawn', '', 24 * T, 25 * T + 8)]

// Signposts with labels, lamps and benches (placed by hand).
const details = [
  // Garden beds inside the house plot, and a lantern post at each gate
  point('', 'flower_patch', 6 * T + 10, 13 * T + 10),
  point('', 'flower_patch', 7 * T + 12, 14 * T + 8),
  point('', 'flower_patch', 13 * T + 6, 13 * T + 12),
  point('', 'bush_berry', 6 * T + 8, 9 * T + 12),
  point('', 'tallgrass_a', 14 * T + 4, 14 * T + 12),
  point('', 'lamppost', 9 * T + 6, 15 * T + 14),
  point('', 'lamppost', 40 * T + 10, 15 * T + 14),
  point('', 'signpost', 13 * T, 16 * T + 14, { label: 'House: about me' }),
  point('', 'signpost', 41 * T, 16 * T + 14, { label: 'Workshop: projects' }),
  point('', 'signpost', 12 * T, 25 * T + 14, { label: 'Market: education' }),
  point('', 'signpost', 31 * T + 8, 24 * T + 14, { label: 'Post office: contact' }),
  point('', 'signpost', 20 * T + 4, 14 * T + 10, { label: 'Notice board: skills' }),
  point('', 'fountain', 24 * T, 19 * T + 12),
  point('', 'lamppost', 17 * T + 8, 15 * T + 2),
  point('', 'lamppost', 30 * T + 8, 15 * T + 2),
  point('', 'lamppost', 17 * T + 8, 22 * T + 2),
  point('', 'lamppost', 30 * T + 8, 22 * T + 2),
  point('', 'lamppost', 22 * T + 8, 26 * T + 14),
  point('', 'bench', 20 * T, 22 * T + 12),
  point('', 'bench', 27 * T + 8, 22 * T + 12),
]

// Crops: one kind per row, sunflowers along the back.
const CROP_ROWS = ['crop_sunflower', 'crop_cabbage', 'crop_carrot', 'crop_sprout']
for (let y = FIELD.y0; y <= FIELD.y1; y++) {
  for (let x = FIELD.x0; x <= FIELD.x1; x++) {
    const type = CROP_ROWS[y - FIELD.y0]
    if (type === 'crop_sunflower' && x % 2 === 1) continue
    details.push(point('', type, x * T + 8, y * T + 13))
  }
}

// Lakeside: reeds on the beach, lily pads on the water, rocks, the dock.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (shore[y][x] && !lake[y][x]) {
      let touchesWater = false
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (inMap(x + i, y + j) && lake[y + j][x + i] && !dock[y + j][x + i]) touchesWater = true
      const nearDock = Math.abs(x - DOCK.x - 0.5) < 2.5 && y <= DOCK.top
      if (touchesWater && !nearDock && random() < 0.45) details.push(point('', 'reeds', x * T + 4 + Math.floor(random() * 8), y * T + 12))
      else if (!nearDock && random() < 0.12) details.push(point('', random() < 0.5 ? 'stone_s' : 'pebbles', x * T + 8, y * T + 10))
    } else if (lake[y][x] && !dock[y][x] && Math.abs(x - DOCK.x - 0.5) > 2 && random() < 0.13) {
      details.push(point('', random() < 0.3 ? 'lily_flower' : 'lily_pad', x * T + 8, y * T + 10))
    }
  }
}
details.push(point('', 'dock_stool', DOCK.x * T + 8, DOCK.end * T + 12))
details.push(point('', 'bucket', (DOCK.x + 1) * T + 10, (DOCK.end - 1) * T + 10))
details.push(point('', 'signpost', 31 * T + 8, 26 * T + 14, { label: 'Fishing dock' }))
details.push(point('', 'bench', 41 * T, 26 * T + 12))

// Fence details: ivy, flowers at the base, a bird on a post (variety!).
for (let i = 0; i < fenceMiddles.length; i++) {
  const f = fenceMiddles[i]
  const roll = random()
  if (roll < 0.14) details.push(point('', 'fence_vine', f.x * T + 8, f.y * T + 12))
  else if (roll < 0.3) details.push(point('', 'fence_flowers', f.x * T + 8, f.y * T + 17))
  else if (roll < 0.34) details.push(point('', 'bird', f.x * T + 8, f.y * T + 5))
}

// Clustered random details on free grass.
const CLUSTERS = [
  { types: ['tallgrass_a', 'tallgrass_b'], count: [4, 8], spread: 2.2, weight: 5 },
  { types: ['flower_pink', 'flower_blue', 'flower_yellow', 'flower_white', 'flower_patch'], count: [3, 6], spread: 1.8, weight: 4 },
  { types: ['stone_m', 'stone_s', 'pebbles'], count: [1, 3], spread: 1.2, weight: 2 },
  { types: ['clover', 'clover', 'mushroom'], count: [2, 3], spread: 1.5, weight: 2 },
  { types: ['bush_berry', 'stump', 'tallgrass_a'], count: [1, 2], spread: 1, weight: 1 },
]
let totalWeight = 0
for (let i = 0; i < CLUSTERS.length; i++) totalWeight += CLUSTERS[i].weight
const used = new Set()
let placed = 0
for (let attempt = 0; attempt < 400 && placed < 70; attempt++) {
  const cx = 3 + Math.floor(random() * (W - 6))
  const cy = 7 + Math.floor(random() * (H - 10))
  if (reserved[cy][cx]) continue
  let r = random() * totalWeight
  let cluster = CLUSTERS[0]
  for (let i = 0; i < CLUSTERS.length; i++) {
    r -= CLUSTERS[i].weight
    if (r <= 0) { cluster = CLUSTERS[i]; break }
  }
  const n = cluster.count[0] + Math.floor(random() * (cluster.count[1] - cluster.count[0] + 1))
  for (let k = 0; k < n; k++) {
    const px = cx * T + 8 + (random() - 0.5) * 2 * cluster.spread * T
    const py = cy * T + 8 + (random() - 0.5) * 2 * cluster.spread * T
    const tx = Math.floor(px / T)
    const ty = Math.floor(py / T)
    if (!inMap(tx, ty) || reserved[ty][tx] || decor[ty][tx]) continue
    const key = Math.round(px / 6) + ',' + Math.round(py / 6) // no two details on the same spot
    if (used.has(key)) continue
    used.add(key)
    details.push(point('', cluster.types[Math.floor(random() * cluster.types.length)], Math.round(px), Math.round(py)))
  }
  placed++
}

// ---------------------------------------------------------------------
//  7. Write the Tiled JSON
// ---------------------------------------------------------------------
function flat(layer) {
  const out = []
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.push(layer[y][x])
  return out
}
function tileLayer(id, name, data) {
  return { id: id, name: name, type: 'tilelayer', width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: flat(data) }
}
function objectLayer(id, name, objects) {
  return { id: id, name: name, type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects: objects }
}
function solidProps(ids) {
  const list = []
  for (let i = 0; i < ids.length; i++) {
    list.push({ id: ids[i], properties: [{ name: 'collides', type: 'bool', value: true }] })
  }
  return list
}
const extrasSolidIds = []
for (let i = 0; i < EXTRAS_SOLID.length; i++) extrasSolidIds.push(EXTRAS[EXTRAS_SOLID[i]])
const extrasCount = Object.keys(EXTRAS).length

const map = {
  compressionlevel: -1, type: 'map', version: '1.10', tiledversion: '1.10.2', orientation: 'orthogonal',
  renderorder: 'right-down', infinite: false, width: W, height: H, tilewidth: T, tileheight: T,
  nextlayerid: 11, nextobjectid: nextId,
  layers: [
    tileLayer(1, 'Ground', ground),
    tileLayer(9, 'Water', water),
    tileLayer(2, 'Decor', decor),
    tileLayer(3, 'Above', above),
    objectLayer(4, 'Details', details),
    objectLayer(5, 'Props', props),
    objectLayer(6, 'Interactables', interactables),
    objectLayer(7, 'Areas', areas),
    objectLayer(8, 'Spawn', spawn),
  ],
  tilesets: [
    {
      firstgid: 1, name: 'tiny-town', image: '../tilesets/tiny-town.png', imagewidth: 192, imageheight: 176,
      columns: 12, tilecount: TOWN_COUNT, tilewidth: T, tileheight: T, margin: 0, spacing: 0,
      tiles: solidProps(Array.from(KENNEY_SOLID).sort(function (a, b) { return a - b })),
    },
    {
      firstgid: EXTRAS_FIRST, name: 'extras', image: '../tilesets/extras.png',
      imagewidth: 128, imageheight: Math.max(1, Math.ceil(extrasCount / 8)) * 16,
      columns: 8, tilecount: extrasCount, tilewidth: T, tileheight: T, margin: 0, spacing: 0,
      tiles: solidProps(extrasSolidIds),
    },
  ],
}

const overwrite = process.argv.includes('--overwrite')
const outFile = path.join(clientDir, 'public', 'assets', 'maps', overwrite ? 'village.json' : 'village.generated.json')
fs.writeFileSync(outFile, JSON.stringify(map))
console.log('Wrote ' + path.relative(clientDir, outFile) + ' (' + details.length + ' details)')

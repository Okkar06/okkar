// =====================================================================
//  DECORATIONS — rearrange the village and rooms by editing numbers.
//
//  Each item: { type, x, y, dx, dy, flip }
//    type  what it is (see FURNITURE in src/systems/Furniture.js)
//    x     tile column of the item's LEFT edge
//    y     tile row the item STANDS on (its bottom sits on this row)
//    dx/dy optional nudge in pixels (1 tile = 16 px)
//    In rooms, negative x/y count from the right/bottom wall.
//
//  Tip: run `npm run dev`, change a number, save, and the page reloads.
//  See .claude/skills/cozy-interiors/SKILL.md for layout ideas.
// =====================================================================

// ---------------------------------------------------------------------
//  Outside: porches, flower boxes, chimneys, lanterns, market goods.
//  (Tile positions match public/assets/maps/village.json.)
// ---------------------------------------------------------------------
export const villageDecor = [
  // Okkar's house (walls on row 11, door at x 10)
  { type: 'chimney', x: 11, y: 9, dy: -2 },
  { type: 'porch', x: 8, y: 12, dx: 15, dy: -6 },
  { type: 'doormat', x: 10, y: 12, dy: -3 },
  { type: 'flowerbox', x: 9, y: 11, dx: -1, dy: 2 },
  { type: 'flowerbox', x: 11, y: 11, dx: -1, dy: 2 },
  { type: 'wall_lantern', x: 10, y: 11, dx: 13, dy: -3 },
  { type: 'potted_plant', x: 8, y: 12, dx: 2, dy: -1 },
  { type: 'potted_plant', x: 12, y: 12, dx: 4, dy: -1 },
  { type: 'window_light', x: 9, y: 11, dy: -4 },
  { type: 'window_light', x: 11, y: 11, dy: -4 },

  // Workshop (walls on rows 10-11, double door at x 38-39)
  { type: 'chimney', x: 40, y: 8, dy: -2 },
  { type: 'wall_lantern', x: 37, y: 11, dx: 9, dy: -2 },
  { type: 'wall_lantern', x: 40, y: 11, dx: -2, dy: -2 },
  { type: 'doormat', x: 38, y: 12, dx: 8, dy: -3 },
  { type: 'window_light', x: 37, y: 10, dy: -3 },
  { type: 'window_light', x: 40, y: 10, dy: -3 },
  { type: 'crate', x: 42, y: 13 },
  { type: 'crate', x: 43, y: 13, dx: 2, dy: -3 },
  { type: 'sack', x: 35, y: 13, dx: 2 },

  // Post office (walls on row 21, door at x 38)
  { type: 'chimney', x: 37, y: 19, dy: -2 },
  { type: 'flowerbox', x: 37, y: 21, dx: -1, dy: 2 },
  { type: 'flowerbox', x: 39, y: 21, dx: -1, dy: 2 },
  { type: 'doormat', x: 38, y: 22, dy: -3 },
  { type: 'wall_lantern', x: 38, y: 21, dx: -5, dy: -3 },
  { type: 'window_light', x: 37, y: 21, dy: -4 },
  { type: 'window_light', x: 39, y: 21, dy: -4 },

  // Market stall (stall sprite covers tiles x 6-8, y 20-22)
  { type: 'hanging_goods', x: 6, y: 21, dx: 14, dy: 1 },
  { type: 'basket', x: 5, y: 22, dx: 4 },
  { type: 'sack', x: 9, y: 22, dx: 2 },
  { type: 'crate', x: 9, y: 21, dx: 3, dy: 2 },
  { type: 'chalkboard', x: 10, y: 22, dx: 6 },
]

// ---------------------------------------------------------------------
//  Rooms. Every room: row 0 is the top of the wall, rows 1-2 the wall
//  you look at, the floor starts on row 3, the last row is the bottom wall.
// ---------------------------------------------------------------------
export const rooms = {
  house: {
    title: "Okkar's House",
    width: 14,
    height: 11,
    wallTop: 'wall_paper_top',
    wall: 'wall_paper',
    floor: ['floor_wood_a', 'floor_wood_a', 'floor_wood_b'],
    exitX: 7, // the doorway in the bottom wall
    items: [
      // Sleep corner (left)
      { type: 'window_inside', x: 1, y: 2, dx: 1, dy: -3 },
      { type: 'bed', x: 1, y: 4 },
      { type: 'side_table', x: 3, y: 3, dx: 1 },
      { type: 'floor_lamp', x: 1, y: 6, dx: 2 },
      // Work corner (middle): the desk opens "About me"
      { type: 'bookshelf_a', x: 4, y: 3, dx: 2 },
      { type: 'bookshelf_b', x: 5, y: 3, dx: 3 },
      { type: 'frame_photo', x: 7, y: 2, dx: 1, dy: -10 },
      { type: 'desk', x: 7, y: 3 },
      { type: 'laptop', x: 7, y: 3, dx: 5, dy: -12 },
      { type: 'mug', x: 8, y: 3, dx: 8, dy: -13 },
      { type: 'window_inside', x: 9, y: 2, dx: 2, dy: -3 },
      { type: 'frame_diploma', x: 10, y: 2, dx: 2, dy: -8 },
      { type: 'string_lights', x: 1, y: 1, dx: 4, dy: -1 },
      { type: 'string_lights', x: 7, y: 1, dx: 4, dy: -1 },
      // Fireside corner (right)
      { type: 'fireplace', x: 11, y: 3, dx: -2 },
      { type: 'flame', x: 11, y: 3, dx: 9, dy: -3 },
      { type: 'armchair', x: 10, y: 5, dx: 2 },
      { type: 'cat', x: 12, y: 5, dx: -3 },
      { type: 'basket', x: 12, y: 3, dx: 2, dy: 1 },
      // Middle of the room and corners
      { type: 'rug', x: 5, y: 7, dx: 2 },
      { type: 'plant_big', x: 12, y: 9 },
      { type: 'plant_big', x: 1, y: 9 },
      { type: 'potted_plant', x: 9, y: 9, dx: 2 },
      { type: 'side_table', x: 4, y: 9, dx: 4 },
    ],
    // Things you can use: { name, section, label, x, y, w, h } (tiles)
    interactables: [
      { name: 'desk', section: 'about', label: 'Sit at the desk: about me', x: 7, y: 4, w: 2.2, h: 1 },
      { name: 'bookshelf', section: 'skills', label: 'Browse the bookshelf: skills', x: 4, y: 4, w: 2.4, h: 1 },
      { name: 'cat', section: 'cat', label: 'Pet the cat', x: 11.5, y: 6, w: 2, h: 1 },
    ],
  },

  // The Workshop builds its shelves from projects.js; these are the extras.
  workshop: {
    wallTop: 'wall_brick_top',
    wall: 'wall_brick',
    floor: ['floor_stone_a', 'floor_stone_a', 'floor_stone_b'],
    items: [
      { type: 'tool_rack', x: 1, y: 2, dx: 2, dy: -4 },
      { type: 'wall_lantern', x: 4, y: 2, dx: 4, dy: -4 },
      { type: 'blueprint_a', x: 5, y: 2, dx: 6, dy: -6 },
      { type: 'blueprint_b', x: -5, y: 2, dx: 0, dy: -6 },
      { type: 'wall_lantern', x: -3, y: 2, dx: 4, dy: -4 },
      { type: 'plant_big', x: 1, y: 3, dx: 2 },
      { type: 'plant_big', x: -2, y: 3 },
      { type: 'workbench', x: 1, y: -3 },
      { type: 'workbench', x: -6, y: -3, flip: true },
      { type: 'floor_lamp', x: 4, y: -3, dx: 6 },
      { type: 'crate', x: -2, y: -3 },
      { type: 'crate', x: -2, y: -4, dx: -2, dy: 4 },
      { type: 'sack', x: -3, y: -3, dx: 2 },
    ],
  },
}

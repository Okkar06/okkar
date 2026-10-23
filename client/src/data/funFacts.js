// =====================================================================
//  FISHING — what you can catch at the dock.
//
//  Each catch shows either a fun fact about you (from `funFacts`) or a
//  skill tag picked from src/data/skills.js.
//  TODO lines are hidden on the live site (only skill catches appear
//  until you write real facts), and highlighted while you run `npm run dev`.
// =====================================================================

// Fish names and which sprite to show (atlas frames: fish_orange, fish_blue, fish_green, fish_pink).
export const fishTypes = [
  { name: 'Bug Bass', sprite: 'fish_green' },
  { name: 'Merge Carp', sprite: 'fish_orange' },
  { name: 'Async Eel', sprite: 'fish_blue' },
  { name: 'Null Pike', sprite: 'fish_blue' },
  { name: 'Refactor Ray', sprite: 'fish_pink' },
  { name: 'Hotfix Herring', sprite: 'fish_orange' },
]

// Short, friendly facts about you. One or two sentences each.
export const funFacts = [
  'TODO: a fun fact about you (a hobby, a favourite food, or a place you love in Singapore).',
  'TODO: what first got you into programming.',
  'TODO: something you built just for fun.',
  'TODO: a game, book or show you love.',
  'TODO: something you are learning right now.',
]

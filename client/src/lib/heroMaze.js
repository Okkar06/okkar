/**
 * The hero's mini maze: an original layout, a runner that eats pellets,
 * three ghosts on patrol, a power pellet that turns them frightened, and
 * bonus items that come and go. Decoration that plays itself.
 *
 * Pure game state and rules only — no DOM, no drawing — and every random
 * choice comes from a seeded generator, so a run is reproducible and the
 * rules are unit-tested. step() returns score events for the HUD.
 *
 * Coordinates are in cells; an actor's drawn centre is (x + 0.5, y + 0.5).
 */

// '#' wall, '.' pellet, 'o' power pellet. Every corridor connects and none
// is a dead end (a test checks both).
export const MAZE = [
  '###############',
  '#o...........o#',
  '#.###.#.#.###.#',
  '#.#.........#.#',
  '#.#.##.#.##.#.#',
  '#......#......#',
  '#.##.#.#.#.##.#',
  '#....#...#....#',
  '#.##.#####.##.#',
  '#o...........o#',
  '###############',
]

export const COLS = MAZE[0].length
export const ROWS = MAZE.length

export const POINTS = {
  pellet: 10,
  power: 50,
  ghost: 200,
  fruit: { cherry: 100, strawberry: 300, bell: 500, key: 700 },
}

export const FRUITS = Object.keys(POINTS.fruit)

export const TIMING = {
  runnerSpeed: 4.2, // cells per second
  ghostSpeed: 3.3,
  frightenedSpeed: 2.1,
  eyesSpeed: 8,
  frightenedMs: 5200,
  flashMs: 1600, // frightened ghosts flash for the last part
  pelletRespawnMs: 6500,
  powerRespawnMs: 11000,
  fruitDelayMs: [6000, 11000],
  fruitLifeMs: 8500,
  popupMs: 950,
  bumpCooldownMs: 700,
}

const RUNNER_START = { c: 7, r: 9 }
const GHOST_HOMES = [
  { c: 6, r: 7, color: 'red' },
  { c: 7, r: 7, color: 'pink' },
  { c: 8, r: 7, color: 'cyan' },
]

const DIRS = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
}
const REVERSE = { left: 'right', right: 'left', up: 'down', down: 'up' }

/** Mulberry32: a tiny seeded generator, so runs are reproducible. */
export function createRandom(seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const isOpen = (c, r) => r >= 0 && r < ROWS && c >= 0 && c < COLS && MAZE[r][c] !== '#'
const id = (c, r) => r * COLS + c

/** Open neighbours of a cell, with the direction to each. */
export function exits(c, r) {
  const list = []
  for (const [dir, [dc, dr]] of Object.entries(DIRS)) {
    if (isOpen(c + dc, r + dr)) list.push({ dir, c: c + dc, r: r + dr })
  }
  return list
}

/**
 * Breadth-first search from (c, r). Returns the first step's direction
 * toward the nearest cell for which isGoal() is true, or null.
 */
function firstStepToward(c, r, isGoal, blocked = () => false) {
  const first = new Map()
  const queue = [[c, r]]
  const seen = new Set([id(c, r)])
  for (let head = 0; head < queue.length; head += 1) {
    const [qc, qr] = queue[head]
    for (const exit of exits(qc, qr)) {
      const key = id(exit.c, exit.r)
      if (seen.has(key) || blocked(exit.c, exit.r)) continue
      seen.add(key)
      const dir = head === 0 ? exit.dir : first.get(id(qc, qr))
      first.set(key, dir)
      if (isGoal(exit.c, exit.r)) return dir
      queue.push([exit.c, exit.r])
    }
  }
  return null
}

/** Steps between two cells (BFS through corridors), or Infinity. */
export function pathLength(from, to) {
  const queue = [[from.c, from.r, 0]]
  const seen = new Set([id(from.c, from.r)])
  for (let head = 0; head < queue.length; head += 1) {
    const [c, r, d] = queue[head]
    if (c === to.c && r === to.r) return d
    for (const exit of exits(c, r)) {
      const key = id(exit.c, exit.r)
      if (!seen.has(key)) {
        seen.add(key)
        queue.push([exit.c, exit.r, d + 1])
      }
    }
  }
  return Infinity
}

const actor = (c, r, dir) => ({ c, r, dir, next: null, progress: 0 })

export function createGame(seed = 7) {
  const random = createRandom(seed)
  const pellets = []
  const pelletAt = new Map()
  const homes = new Set(GHOST_HOMES.map((h) => id(h.c, h.r)))

  MAZE.forEach((row, r) => {
    ;[...row].forEach((cell, c) => {
      if (cell === '#' || homes.has(id(c, r)) || (c === RUNNER_START.c && r === RUNNER_START.r)) return
      pelletAt.set(id(c, r), pellets.length)
      pellets.push({ c, r, power: cell === 'o', eatenAt: -1 })
    })
  })

  return {
    random,
    time: 0,
    pellets,
    pelletAt,
    runner: actor(RUNNER_START.c, RUNNER_START.r, 'left'),
    ghosts: GHOST_HOMES.map((home, i) => ({
      ...actor(home.c, home.r, i % 2 ? 'up' : 'down'),
      color: home.color,
      home: { c: home.c, r: home.r },
      mode: 'normal', // normal | frightened | eyes
      bumpUntil: 0,
    })),
    frightenedUntil: 0,
    fruit: null,
    nextFruitAt: 4000,
    popups: [],
  }
}

/** Drawn position (cell units) of an actor, between its cell and the next. */
export function actorPosition(a) {
  if (!a.next) return { x: a.c, y: a.r }
  return { x: a.c + (a.next.c - a.c) * a.progress, y: a.r + (a.next.r - a.r) * a.progress }
}

/** Whether frightened ghosts should be flashing (their time is nearly up). */
export const isFlashing = (game) => game.frightenedUntil - game.time < TIMING.flashMs

const pick = (random, list) => list[Math.floor(random() * list.length)]
const manhattan = (a, b) => Math.abs(a.c - b.c) + Math.abs(a.r - b.r)

function chooseRunner(game) {
  const { runner, ghosts, fruit } = game
  const dangers = ghosts.filter((g) => g.mode === 'normal')
  const blocked = (c, r) =>
    dangers.some((g) => (g.c === c && g.r === r) || (g.next && g.next.c === c && g.next.r === r))

  const hunting = ghosts.filter((g) => g.mode === 'frightened' && manhattan(g, runner) <= 7)
  const goals = [
    fruit ? (c, r) => c === fruit.c && r === fruit.r : null,
    hunting.length ? (c, r) => hunting.some((g) => g.c === c && g.r === r) : null,
    (c, r) => {
      const index = game.pelletAt.get(id(c, r))
      return index !== undefined && game.pellets[index].eatenAt < 0
    },
  ].filter(Boolean)

  for (const isGoal of goals) {
    const dir = firstStepToward(runner.c, runner.r, isGoal, blocked)
    if (dir) return dir
  }

  // Nothing to chase: wander, away from danger and not back the way it came.
  const options = exits(runner.c, runner.r)
  const safe = options.filter((o) => !blocked(o.c, o.r) && o.dir !== REVERSE[runner.dir])
  return pick(game.random, safe.length ? safe : options).dir
}

function chooseGhost(game, ghost) {
  const options = exits(ghost.c, ghost.r)
  if (ghost.mode === 'eyes') {
    return firstStepToward(ghost.c, ghost.r, (c, r) => c === ghost.home.c && r === ghost.home.r) ?? options[0].dir
  }

  const forward = options.filter((o) => o.dir !== REVERSE[ghost.dir])
  const choices = forward.length ? forward : options
  const runner = game.runner
  const score = (o) => manhattan(o, runner)

  if (ghost.mode === 'frightened') {
    return choices.reduce((best, o) => (score(o) > score(best) ? o : best)).dir
  }
  // Patrol: half the time close in on the runner, otherwise wander.
  if (game.random() < 0.5) return choices.reduce((best, o) => (score(o) < score(best) ? o : best)).dir
  return pick(game.random, choices).dir
}

function setOff(a, dir) {
  const [dc, dr] = DIRS[dir]
  a.dir = dir
  a.next = isOpen(a.c + dc, a.r + dr) ? { c: a.c + dc, r: a.r + dr } : null
}

function reverse(a) {
  if (!a.next) return
  const back = { c: a.c, r: a.r }
  a.c = a.next.c
  a.r = a.next.r
  a.next = back
  a.progress = 1 - a.progress
  a.dir = REVERSE[a.dir]
}

const popup = (game, x, y, points) => game.popups.push({ x, y, text: `+${points}`, born: game.time })

function runnerArrives(game, events) {
  const { runner } = game
  const index = game.pelletAt.get(id(runner.c, runner.r))
  if (index !== undefined && game.pellets[index].eatenAt < 0) {
    const pellet = game.pellets[index]
    pellet.eatenAt = game.time
    if (pellet.power) {
      events.push({ type: 'power', points: POINTS.power })
      game.frightenedUntil = game.time + TIMING.frightenedMs
      for (const ghost of game.ghosts) {
        if (ghost.mode !== 'eyes') {
          ghost.mode = 'frightened'
          reverse(ghost)
        }
      }
    } else {
      events.push({ type: 'pellet', points: POINTS.pellet })
    }
  }

  const fruit = game.fruit
  if (fruit && fruit.c === runner.c && fruit.r === runner.r) {
    const points = POINTS.fruit[fruit.kind]
    events.push({ type: 'fruit', kind: fruit.kind, points })
    popup(game, fruit.c, fruit.r, points)
    game.fruit = null
    game.nextFruitAt = game.time + TIMING.fruitDelayMs[0] + game.random() * (TIMING.fruitDelayMs[1] - TIMING.fruitDelayMs[0])
  }
}

function speedOf(game, a) {
  if (a === game.runner) return TIMING.runnerSpeed
  if (a.mode === 'eyes') return TIMING.eyesSpeed
  return a.mode === 'frightened' ? TIMING.frightenedSpeed : TIMING.ghostSpeed
}

function move(game, a, dt, onArrive, choose) {
  if (!a.next) setOff(a, choose())
  a.progress += (speedOf(game, a) * dt) / 1000
  while (a.next && a.progress >= 1) {
    a.c = a.next.c
    a.r = a.next.r
    a.progress -= 1
    onArrive()
    setOff(a, choose())
  }
  if (!a.next) a.progress = 0
}

function tick(game, dt, events) {
  game.time += dt
  const { runner } = game

  move(game, runner, dt, () => runnerArrives(game, events), () => chooseRunner(game))

  for (const ghost of game.ghosts) {
    move(
      game,
      ghost,
      dt,
      () => {
        if (ghost.mode === 'eyes' && ghost.c === ghost.home.c && ghost.r === ghost.home.r) ghost.mode = 'normal'
      },
      () => chooseGhost(game, ghost),
    )
  }

  // Frightened time is up.
  if (game.time >= game.frightenedUntil) {
    for (const ghost of game.ghosts) if (ghost.mode === 'frightened') ghost.mode = 'normal'
  }

  // Meetings: a frightened ghost is eaten; a normal one bumps and turns back.
  const at = actorPosition(runner)
  for (const ghost of game.ghosts) {
    if (ghost.mode === 'eyes') continue
    const pos = actorPosition(ghost)
    if (Math.hypot(pos.x - at.x, pos.y - at.y) > 0.6) continue
    if (ghost.mode === 'frightened') {
      ghost.mode = 'eyes'
      events.push({ type: 'ghost', points: POINTS.ghost })
      popup(game, pos.x, pos.y, POINTS.ghost)
    } else if (game.time >= ghost.bumpUntil) {
      ghost.bumpUntil = game.time + TIMING.bumpCooldownMs
      reverse(ghost)
      reverse(runner)
    }
  }

  // Pellets come back a while after they are eaten (never under the runner).
  for (const pellet of game.pellets) {
    if (pellet.eatenAt < 0) continue
    const wait = pellet.power ? TIMING.powerRespawnMs : TIMING.pelletRespawnMs
    if (game.time - pellet.eatenAt >= wait && (pellet.c !== runner.c || pellet.r !== runner.r)) pellet.eatenAt = -1
  }

  // Bonus items appear now and then, away from the runner, and leave if ignored.
  if (game.fruit && game.time >= game.fruit.until) {
    game.fruit = null
    game.nextFruitAt = game.time + TIMING.fruitDelayMs[0]
  } else if (!game.fruit && game.time >= game.nextFruitAt) {
    const spots = []
    MAZE.forEach((row, r) => {
      ;[...row].forEach((cell, c) => {
        if (cell === '.' && pathLength(runner, { c, r }) >= 5) spots.push({ c, r })
      })
    })
    if (spots.length) {
      const spot = pick(game.random, spots)
      game.fruit = { ...spot, kind: pick(game.random, FRUITS), until: game.time + TIMING.fruitLifeMs }
    }
  }

  game.popups = game.popups.filter((p) => game.time - p.born < TIMING.popupMs)
}

/**
 * Advances the game by `dt` ms (in slices of at most 40ms, so nothing can
 * skip through a wall or past a meeting).
 * @returns {Array<{ type: 'pellet' | 'power' | 'ghost' | 'fruit', points: number }>}
 */
export function step(game, dt) {
  const events = []
  let left = Math.min(Math.max(dt, 0), 250)
  while (left > 0) {
    const slice = Math.min(left, 40)
    tick(game, slice, events)
    left -= slice
  }
  return events
}

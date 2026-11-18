import { describe, expect, it } from 'vitest'
import {
  COLS,
  MAZE,
  POINTS,
  ROWS,
  TIMING,
  actorPosition,
  createGame,
  exits,
  isFlashing,
  isOpen,
  step,
} from '../heroMaze'

const FRAME = 1000 / 60

/** Runs the game for `ms`, collecting every event. */
function play(game, ms, onFrame = () => {}) {
  const events = []
  for (let t = 0; t < ms; t += FRAME) {
    events.push(...step(game, FRAME))
    onFrame(game)
  }
  return events
}

const onCorridor = (a) => {
  const { x, y } = actorPosition(a)
  // Between two cell centres, both ends are open.
  return isOpen(Math.floor(x + 1e-6), Math.floor(y + 1e-6)) && isOpen(Math.ceil(x - 1e-6), Math.ceil(y - 1e-6))
}

describe('the maze', () => {
  it('is a closed rectangle with every corridor connected and no dead ends', () => {
    expect(MAZE.every((row) => row.length === COLS)).toBe(true)
    expect(MAZE[0]).toMatch(/^#+$/)
    expect(MAZE[ROWS - 1]).toMatch(/^#+$/)

    const open = []
    MAZE.forEach((row, r) => [...row].forEach((cell, c) => cell !== '#' && open.push([c, r])))
    for (const [c, r] of open) expect(exits(c, r).length, `${c},${r}`).toBeGreaterThanOrEqual(2)

    const seen = new Set([open[0].join()])
    const stack = [open[0]]
    while (stack.length) {
      const [c, r] = stack.pop()
      for (const exit of exits(c, r)) {
        if (!seen.has(`${exit.c},${exit.r}`)) {
          seen.add(`${exit.c},${exit.r}`)
          stack.push([exit.c, exit.r])
        }
      }
    }
    expect(seen.size).toBe(open.length)
  })

  it('has power pellets', () => {
    expect(createGame().pellets.filter((p) => p.power).length).toBeGreaterThanOrEqual(2)
  })
})

describe('playing', () => {
  it('keeps the runner and the ghosts inside the corridors', () => {
    const game = createGame(3)
    play(game, 40000, (g) => {
      expect(onCorridor(g.runner)).toBe(true)
      for (const ghost of g.ghosts) expect(onCorridor(ghost)).toBe(true)
    })
  })

  it('eats pellets for points, and they come back later', () => {
    const game = createGame(5)
    const events = play(game, 3000)
    const eaten = events.filter((e) => e.type === 'pellet')
    expect(eaten.length).toBeGreaterThan(5)
    expect(eaten.every((e) => e.points === POINTS.pellet)).toBe(true)

    const firstEaten = game.pellets.filter((p) => p.eatenAt >= 0 && !p.power).sort((a, b) => a.eatenAt - b.eatenAt)[0]
    play(game, TIMING.pelletRespawnMs + 1500)
    // Back, unless the runner happened to eat it again since.
    expect(firstEaten.eatenAt < 0 || firstEaten.eatenAt > TIMING.pelletRespawnMs).toBe(true)
  })

  it('a power pellet frightens the ghosts for a while, flashing near the end', () => {
    const game = createGame(11)
    // Put the runner right next to a power pellet.
    const power = game.pellets.find((p) => p.power)
    game.runner = { ...game.runner, c: power.c, r: power.r + 1, next: null, progress: 0, dir: 'up' }
    let powered = false
    for (let t = 0; t < 4000 && !powered; t += FRAME) powered = step(game, FRAME).some((e) => e.type === 'power')
    expect(powered).toBe(true)
    expect(game.ghosts.some((g) => g.mode === 'frightened')).toBe(true)
    expect(isFlashing(game)).toBe(false)

    play(game, TIMING.frightenedMs - TIMING.flashMs + 100)
    if (game.ghosts.some((g) => g.mode === 'frightened')) expect(isFlashing(game)).toBe(true)

    play(game, TIMING.flashMs + 200)
    expect(game.ghosts.some((g) => g.mode === 'frightened')).toBe(false)
  })

  it('eating a frightened ghost scores and sends its eyes home, then it returns', () => {
    const game = createGame(2)
    const ghost = game.ghosts[0]
    ghost.mode = 'frightened'
    game.frightenedUntil = 60000
    Object.assign(ghost, { c: 7, r: 9, next: null, progress: 0 })
    Object.assign(game.runner, { c: 6, r: 9, next: null, progress: 0 })

    const events = play(game, 400)
    expect(events).toContainEqual({ type: 'ghost', points: POINTS.ghost })
    expect(game.popups.some((p) => p.text === `+${POINTS.ghost}`)).toBe(true)
    expect(ghost.mode).toBe('eyes')

    play(game, 6000)
    expect(ghost.mode).not.toBe('eyes')
  })

  it('bonus items appear, and get eaten or leave', () => {
    const game = createGame(9)
    let seen = null
    const events = play(game, 60000, (g) => {
      if (g.fruit) seen ??= { ...g.fruit }
    })
    expect(seen).not.toBeNull()
    expect(isOpen(seen.c, seen.r)).toBe(true)
    for (const e of events.filter((x) => x.type === 'fruit')) expect(e.points).toBe(POINTS.fruit[e.kind])
  })

  it('normal ghosts never eat the runner — they bump and turn back', () => {
    const game = createGame(4)
    const events = play(game, 30000)
    expect(events.every((e) => ['pellet', 'power', 'ghost', 'fruit'].includes(e.type))).toBe(true)
    expect(game.runner).toBeTruthy()
  })

  it('is reproducible from its seed, and survives a huge time step', () => {
    const a = createGame(42)
    const b = createGame(42)
    play(a, 5000)
    play(b, 5000)
    expect(actorPosition(a.runner)).toEqual(actorPosition(b.runner))

    expect(() => step(a, 1e9)).not.toThrow()
    expect(onCorridor(a.runner)).toBe(true)
  })
})

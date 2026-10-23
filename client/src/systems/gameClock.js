// =====================================================================
//  GAME CLOCK — the village's own time of day, like Stardew Valley.
//  It starts at the visitor's real local time and then runs faster:
//  one village hour passes every 30 real seconds, so a full day and
//  night take 12 minutes. The time lives here (not in a scene), so it
//  keeps running while you are inside a house.
//
//  Preview a time with the URL: ?time=night (or day, dusk, dawn), or
//  an exact time like ?time=21:30.
// =====================================================================

export const MINUTES_PER_SECOND = 2 // village minutes per real second
const DAY = 24 * 60

const NAMED_TIMES = { dawn: 6 * 60, day: 12 * 60, dusk: 18 * 60 + 45, night: 22 * 60 }

function startingMinutes() {
  const forced = new URLSearchParams(window.location.search).get('time') || ''
  if (NAMED_TIMES[forced] !== undefined) return NAMED_TIMES[forced]
  const match = forced.match(/^(\d{1,2}):(\d{2})$/)
  if (match) return (Number(match[1]) * 60 + Number(match[2])) % DAY
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

const startMinutes = startingMinutes()
const startedAt = performance.now()

// Minutes since midnight in the village (0 - 1439.99).
export function villageMinutes() {
  const elapsedSeconds = (performance.now() - startedAt) / 1000
  return (startMinutes + elapsedSeconds * MINUTES_PER_SECOND) % DAY
}

// 'dawn' | 'day' | 'dusk' | 'night' for things that only switch on/off
// (fireflies, birdsong, crickets).
export function currentPeriod() {
  const hour = villageMinutes() / 60
  if (hour >= 20 || hour < 5.5) return 'night'
  if (hour >= 17.5) return 'dusk'
  if (hour < 8) return 'dawn'
  return 'day'
}

// "7:40 pm": shown in 10-minute steps, like the Stardew clock.
export function formatVillageTime(minutes) {
  const rounded = Math.floor(minutes / 10) * 10
  const hour24 = Math.floor(rounded / 60)
  const minute = rounded % 60
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return hour12 + ':' + (minute < 10 ? '0' : '') + minute + (hour24 < 12 ? ' am' : ' pm')
}

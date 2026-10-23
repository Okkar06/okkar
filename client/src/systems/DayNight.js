// =====================================================================
//  DAY / NIGHT — the village's light follows the game clock
//  (systems/gameClock.js): a pink sunrise, bright day, an orange
//  sunset and a deep blue night, blending smoothly from one to the next.
//  Street lamps and windows fade in as it gets dark.
// =====================================================================

import { DEPTH } from '../utils/constants.js'
import { hex } from '../theme/palette.js'
import { villageMinutes } from './gameClock.js'

// The look at certain hours. Between two of them we blend.
//   tint: colour laid over the world, alpha: how strong it is
//   darkness: how much the lamps glow (0 = off, 1 = fully on)
const KEYFRAMES = [
  { hour: 0, tint: 'night', alpha: 0.55, darkness: 1 },
  { hour: 4.5, tint: 'night', alpha: 0.55, darkness: 1 },
  { hour: 6, tint: 'pink', alpha: 0.2, darkness: 0.45 }, // sunrise
  { hour: 7.5, tint: 'warmLight', alpha: 0.08, darkness: 0 },
  { hour: 9, tint: 'white', alpha: 0, darkness: 0 },
  { hour: 16.5, tint: 'white', alpha: 0, darkness: 0 },
  { hour: 18, tint: 'warmLight', alpha: 0.12, darkness: 0.2 }, // golden hour
  { hour: 19, tint: 'dusk', alpha: 0.24, darkness: 0.6 }, // sunset
  { hour: 20.5, tint: 'night', alpha: 0.45, darkness: 0.95 },
  { hour: 22, tint: 'night', alpha: 0.55, darkness: 1 },
  { hour: 24, tint: 'night', alpha: 0.55, darkness: 1 },
]

// Mix two 0xRRGGBB colours: amount 0 = a, 1 = b.
function mixColors(a, b, amount) {
  const red = ((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * amount
  const green = ((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * amount
  const blue = (a & 255) + ((b & 255) - (a & 255)) * amount
  return (Math.round(red) << 16) | (Math.round(green) << 8) | Math.round(blue)
}

// The tint and darkness for a time of day (minutes since midnight).
export function lightAt(minutes) {
  const hour = minutes / 60
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const from = KEYFRAMES[i]
    const to = KEYFRAMES[i + 1]
    if (hour < from.hour || hour > to.hour) continue
    const amount = (hour - from.hour) / (to.hour - from.hour)
    // A fully clear tint ('white' at alpha 0) shouldn't wash its colour
    // into the next one, so blend the colour from whichever side shows.
    let color = mixColors(hex(from.tint), hex(to.tint), amount)
    if (from.alpha === 0) color = hex(to.tint)
    if (to.alpha === 0) color = hex(from.tint)
    return {
      color: color,
      alpha: from.alpha + (to.alpha - from.alpha) * amount,
      darkness: from.darkness + (to.darkness - from.darkness) * amount,
    }
  }
  return { color: hex('night'), alpha: 0.55, darkness: 1 }
}

export class DayNight {
  // onChange(darkness) is called whenever the lamps should change.
  constructor(scene, worldWidth, worldHeight, onChange) {
    this.scene = scene
    this.onChange = onChange
    // Drawn UNDER the lights, so windows and lamps glow through the night.
    this.tint = scene.add.rectangle(0, 0, worldWidth, worldHeight, 0x000000, 0).setOrigin(0, 0).setDepth(DEPTH.light - 1)
    this.darkness = -1
    this.update()
    // Twice a second is plenty: a village minute is half a real second.
    scene.time.addEvent({ delay: 500, loop: true, callback: this.update, callbackScope: this })
  }

  update() {
    const light = lightAt(villageMinutes())
    this.tint.setFillStyle(light.color, 1)
    this.tint.setAlpha(light.alpha)
    // Only tell the lamps when it changed enough to notice.
    if (Math.abs(light.darkness - this.darkness) > 0.01) {
      this.darkness = light.darkness
      if (this.onChange) this.onChange(this.darkness)
    }
  }
}

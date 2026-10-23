// =====================================================================
//  DAY / NIGHT — a soft colour tint that follows the visitor's clock:
//  dawn (6-8), day (8-18), dusk (18-20), night (20-6). It re-checks
//  every minute, so leaving the page open shows the evening arrive.
//  Add ?time=night (or day, dusk, dawn) to the URL to preview a period.
// =====================================================================

import { DEPTH } from '../utils/constants.js'
import { hex } from '../theme/palette.js'

// colour + strength of the tint, and how dark it is for the lamps (0-1)
const PERIODS = {
  dawn: { color: 'warmLight', alpha: 0.12, darkness: 0.35 },
  day: { color: 'white', alpha: 0, darkness: 0 },
  dusk: { color: 'dusk', alpha: 0.16, darkness: 0.65 },
  night: { color: 'night', alpha: 0.38, darkness: 1 },
}

export function currentPeriod() {
  const forced = new URLSearchParams(window.location.search).get('time')
  if (PERIODS[forced]) return forced
  const hour = new Date().getHours()
  if (hour >= 20 || hour < 6) return 'night'
  if (hour >= 18) return 'dusk'
  if (hour < 8) return 'dawn'
  return 'day'
}

export class DayNight {
  // onChange(darkness) is called whenever the period changes.
  constructor(scene, worldWidth, worldHeight, onChange) {
    this.scene = scene
    this.onChange = onChange
    // Drawn UNDER the lights, so windows and lamps glow through the night.
    this.tint = scene.add.rectangle(0, 0, worldWidth, worldHeight, 0x000000, 0).setOrigin(0, 0).setDepth(DEPTH.light - 1)
    this.period = null
    this.update(true)
    scene.time.addEvent({ delay: 60000, loop: true, callback: this.update, callbackScope: this })
  }

  update(instant) {
    const period = currentPeriod()
    if (period === this.period) return
    this.period = period
    const settings = PERIODS[period]
    this.darkness = settings.darkness
    this.tint.setFillStyle(hex(settings.color), 1)
    if (instant === true) this.tint.setAlpha(settings.alpha)
    else this.scene.tweens.add({ targets: this.tint, alpha: settings.alpha, duration: 8000 })
    if (this.onChange) this.onChange(this.darkness)
  }
}

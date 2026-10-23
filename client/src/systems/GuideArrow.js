// =====================================================================
//  GUIDE ARROW — a glowing arrow beside the player pointing towards a
//  place (e.g. the Workshop), with a little sparkle trail. Shown for a
//  limited time after the welcome, and hidden once you get there.
// =====================================================================

import { DEPTH } from '../utils/constants.js'
import { state } from '../utils/state.js'
import { prefersReducedMotion } from '../utils/device.js'

export class GuideArrow {
  constructor(scene, player, zones) {
    this.scene = scene
    this.player = player
    this.zones = zones
    this.target = null
    this.expiresAt = 0
    this.nextSparkle = 0
    this.calm = prefersReducedMotion()

    this.arrow = scene.add.image(0, 0, 'decor', 'guide_arrow').setVisible(false).setDepth(DEPTH.worldUi)
    this.glow = scene.add.image(0, 0, 'glow').setVisible(false).setDepth(DEPTH.worldUi - 1)
    this.glow.setBlendMode('ADD').setTint(0xffd38a).setScale(0.45).setAlpha(0.7)
    this.sparkles = scene.add.particles(0, 0, 'decor', {
      frame: 'sparkle',
      lifespan: 700,
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      speedY: { min: -12, max: -4 },
      emitting: false,
    }).setDepth(DEPTH.worldUi)
  }

  // Point at the interaction zone called `zoneName` for `seconds`.
  show(zoneName, seconds) {
    for (let i = 0; i < this.zones.length; i++) {
      if (this.zones[i].name === zoneName) this.target = this.zones[i]
    }
    this.expiresAt = this.scene.time.now + seconds * 1000
  }

  hide() {
    this.target = null
    this.arrow.setVisible(false)
    this.glow.setVisible(false)
  }

  update(time) {
    if (!this.target) return
    // Done when time's up, or when the player reaches the place.
    if (time > this.expiresAt || state.currentZone === this.target) {
      this.hide()
      return
    }
    const hidden = !state.started || state.panelOpen || state.dialogueOpen || state.touring
    this.arrow.setVisible(!hidden)
    this.glow.setVisible(!hidden)
    if (hidden) return

    const dx = this.target.rect.centerX - this.player.x
    const dy = this.target.rect.centerY - this.player.y
    // Snap to 8 directions: pixel art looks cleaner at 45-degree steps.
    const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
    const bob = this.calm ? 0 : Math.sin(time / 180) * 2
    const x = this.player.x + Math.cos(angle) * (20 + bob)
    const y = this.player.y - 4 + Math.sin(angle) * (16 + bob)
    this.arrow.setPosition(x, y).setRotation(angle + Math.PI / 2) // the arrow picture points up
    this.glow.setPosition(x, y)

    // A few sparkles further along the way.
    if (!this.calm && time > this.nextSparkle) {
      this.nextSparkle = time + 260
      const along = 34 + Math.random() * 40
      this.sparkles.emitParticleAt(this.player.x + Math.cos(angle) * along, this.player.y + Math.sin(angle) * along * 0.8, 1)
    }
  }
}

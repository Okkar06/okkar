// =====================================================================
//  LIGHTS — soft warm glows around lamps, windows and fires.
//
//  Each light is the "glow" texture (a soft white circle made in
//  BootScene) tinted a colour and drawn with ADD blending, so it brightens
//  whatever is underneath. Outside, lights fade in as it gets dark
//  (setDarkness); inside, they are always on.
// =====================================================================

import Phaser from 'phaser'
import { DEPTH } from '../utils/constants.js'
import { hex } from '../theme/palette.js'
import { prefersReducedMotion } from '../utils/device.js'

export class LightSystem {
  constructor(scene) {
    this.scene = scene
    this.lights = []
    this.darkness = 0 // 0 = bright day, 1 = night
  }

  // options: { x, y, radius, color, intensity, flicker, alwaysOn }
  add(options) {
    const radius = options.radius || 32
    const glow = this.scene.add.image(options.x, options.y, 'glow')
    glow.setBlendMode(Phaser.BlendModes.ADD)
    glow.setTint(hex(options.color || 'warmLight'))
    glow.setScale(radius / 32) // the glow texture is 64px wide (radius 32)
    glow.setDepth(DEPTH.light)

    const light = {
      glow: glow,
      intensity: options.intensity === undefined ? 0.5 : options.intensity,
      alwaysOn: Boolean(options.alwaysOn),
    }
    this.lights.push(light)
    this.applyAlpha(light)

    // Fires and candles flicker: a small random wobble in size.
    if (options.flicker && !prefersReducedMotion()) {
      this.scene.tweens.add({
        targets: glow,
        scale: { from: (radius / 32) * 0.94, to: (radius / 32) * 1.06 },
        duration: 160 + Math.random() * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
    return light
  }

  applyAlpha(light) {
    const strength = light.alwaysOn ? 1 : this.darkness
    light.glow.setAlpha(light.intensity * strength)
    light.glow.setVisible(strength > 0.01)
  }

  // 0 = full daylight (outdoor lights off) ... 1 = night (fully on).
  setDarkness(amount) {
    this.darkness = Math.max(0, Math.min(1, amount))
    for (let i = 0; i < this.lights.length; i++) this.applyAlpha(this.lights[i])
  }
}

// Create the soft round "glow" texture once (called from BootScene).
export function createGlowTexture(scene) {
  if (scene.textures.exists('glow')) return
  const size = 64
  const texture = scene.textures.createCanvas('glow', size, size)
  const context = texture.getContext()
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  texture.refresh()
}

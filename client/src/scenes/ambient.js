// =====================================================================
//  AMBIENT LIFE (just for charm)
//  A few butterflies drifting around during the day, or fireflies at
//  night. They are tiny rectangles moved by tweens — no images needed.
// =====================================================================

import Phaser from 'phaser'

export function addAmbientLife(scene, worldWidth, worldHeight) {
  // Respect visitors who prefer less motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const hour = new Date().getHours()
  const params = new URLSearchParams(window.location.search)
  const isNight = params.get('time') === 'night' || (!params.get('time') && (hour >= 20 || hour < 6))

  const colors = isNight ? [0xfff59d, 0xfdbe53] : [0xffffff, 0xfdbe53, 0xf28462, 0x76e4ff]
  const count = isNight ? 14 : 7

  for (let i = 0; i < count; i++) {
    const x = Phaser.Math.Between(48, worldWidth - 48)
    const y = Phaser.Math.Between(48, worldHeight - 48)
    const color = colors[i % colors.length]
    const bug = scene.add.rectangle(x, y, 2, 2, color).setDepth(99999)

    // Wander to a nearby random spot, then back, forever.
    scene.tweens.add({
      targets: bug,
      x: x + Phaser.Math.Between(-40, 40),
      y: y + Phaser.Math.Between(-24, 24),
      duration: Phaser.Math.Between(2500, 5000),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: Phaser.Math.Between(0, 2000),
    })

    // Fireflies blink; butterflies flutter (scale).
    scene.tweens.add({
      targets: bug,
      alpha: isNight ? 0.15 : 1,
      scaleX: isNight ? 1 : 0.4,
      duration: isNight ? Phaser.Math.Between(700, 1400) : 180,
      yoyo: true,
      repeat: -1,
    })
  }
}

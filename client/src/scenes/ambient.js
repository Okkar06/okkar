// =====================================================================
//  AMBIENT LIFE (just for charm)
//  Butterflies drift around during the day; fireflies blink at night.
//  Both groups are made once, and the clock decides which one shows.
//  They are tiny rectangles moved by tweens — no images needed.
// =====================================================================

import Phaser from 'phaser'
import { DEPTH } from '../utils/constants.js'
import { currentPeriod } from '../systems/gameClock.js'

export function addAmbientLife(scene, worldWidth, worldHeight) {
  // Respect visitors who prefer less motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const butterflies = makeBugs(scene, worldWidth, worldHeight, 7, [0xffffff, 0xfdbe53, 0xf28462, 0x76e4ff], false)
  const fireflies = makeBugs(scene, worldWidth, worldHeight, 14, [0xfff59d, 0xfdbe53], true)

  // Check the clock every few seconds and show the right group.
  function showForTimeOfDay() {
    const night = currentPeriod() === 'night'
    for (let i = 0; i < butterflies.length; i++) butterflies[i].setVisible(!night)
    for (let i = 0; i < fireflies.length; i++) fireflies[i].setVisible(night)
  }
  showForTimeOfDay()
  scene.time.addEvent({ delay: 3000, loop: true, callback: showForTimeOfDay })
}

function makeBugs(scene, worldWidth, worldHeight, count, colors, blink) {
  const bugs = []
  for (let i = 0; i < count; i++) {
    const x = Phaser.Math.Between(48, worldWidth - 48)
    const y = Phaser.Math.Between(48, worldHeight - 48)
    const bug = scene.add.rectangle(x, y, 2, 2, colors[i % colors.length]).setDepth(DEPTH.weather)
    bugs.push(bug)

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
      alpha: blink ? 0.15 : 1,
      scaleX: blink ? 1 : 0.4,
      duration: blink ? Phaser.Math.Between(700, 1400) : 180,
      yoyo: true,
      repeat: -1,
    })
  }
  return bugs
}

// =====================================================================
//  FISHING — a tiny optional mini-game at the end of the dock.
//
//    E / tap  ->  cast: the bobber flies out onto the water
//    wait     ->  the bobber floats (1-3 s)
//    "!"      ->  a bite! press E / tap within 1.5 s
//    reel in  ->  a catch card shows a fun fact or a skill tag
//
//  Takes under 10 seconds, never blocks anything: walk away and it stops.
// =====================================================================

import Phaser from 'phaser'
import { DEPTH } from '../utils/constants.js'
import { hex } from '../theme/palette.js'
import { state, bus } from '../utils/state.js'
import { prefersReducedMotion } from '../utils/device.js'
import { fishTypes, funFacts } from '../data/funFacts.js'
import { skills } from '../data/skills.js'
import { isMissing } from '../ui/sectionsHtml.js'
import { showCatch } from '../ui/CatchCard.js'
import { showToast } from '../ui/Hud.js'

const BITE_WINDOW = 1500 // ms you have to react to the "!"

export class Fishing {
  // zone: the "fishing" interaction zone; water: the WaterSystem (for ripples)
  constructor(scene, player, zone, water) {
    this.scene = scene
    this.player = player
    this.zone = zone
    this.water = water
    this.mode = 'idle' // idle -> casting -> waiting -> bite -> reeling
    this.timer = null

    this.bobber = scene.add.image(0, 0, 'decor', 'bobber').setVisible(false).setDepth(DEPTH.groundDetail + 1)
    this.bang = scene.add.image(0, 0, 'decor', 'bubble_bang').setVisible(false).setDepth(DEPTH.worldUi)
    this.caught = scene.add.image(0, 0, 'decor', 'fish_orange').setVisible(false).setDepth(DEPTH.worldUi)
    this.line = scene.add.graphics().setDepth(DEPTH.groundDetail + 1)

    scene.events.once('shutdown', function () { this.reset() }, this)
  }

  // Called when the player presses E / taps the prompt in the fishing zone.
  action() {
    if (this.mode === 'idle') this.cast()
    else if (this.mode === 'bite') this.reel()
    else if (this.mode === 'waiting') this.tooEarly()
  }

  setPrompt(text) {
    state.promptOverride = text
    bus.emit('prompt:refresh')
  }

  cast() {
    this.mode = 'casting'
    this.setPrompt('Casting…')
    const startX = this.player.x + 4
    const startY = this.player.y - 2
    this.target = { x: this.zone.rect.centerX + Phaser.Math.Between(-6, 6), y: this.zone.rect.bottom + 18 }
    this.bobber.setPosition(startX, startY).setVisible(true)

    // A little arc: move across, and up-then-down using an extra tween.
    const scene = this.scene
    scene.tweens.add({ targets: this.bobber, x: this.target.x, duration: 450, ease: 'Linear' })
    scene.tweens.add({
      targets: this.bobber,
      y: { from: startY, to: this.target.y },
      duration: 450,
      ease: 'Quad.easeIn',
      onComplete: function () {
        this.water.ripple(this.target.x, this.target.y + 2)
        this.waitForBite()
      },
      callbackScope: this,
    })
  }

  waitForBite() {
    this.mode = 'waiting'
    this.setPrompt('Waiting for a bite…')
    if (!prefersReducedMotion()) {
      this.bobTween = this.scene.tweens.add({ targets: this.bobber, y: this.target.y + 1, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    this.timer = this.scene.time.delayedCall(Phaser.Math.Between(1000, 2800), this.bite, null, this)
  }

  bite() {
    this.mode = 'bite'
    this.setPrompt('Reel it in!')
    this.bang.setPosition(this.player.x, this.player.y - 14).setVisible(true).setScale(0.5)
    this.scene.tweens.add({ targets: this.bang, scale: 1, duration: 140, ease: 'Back.easeOut' })
    this.water.ripple(this.target.x, this.target.y + 2)
    if (this.bobTween) this.bobTween.stop()
    this.bobber.setY(this.target.y + 2) // pulled under a little
    this.timer = this.scene.time.delayedCall(BITE_WINDOW, function () {
      this.finish()
      showToast('It got away! Press E or tap to cast again.')
    }, null, this)
  }

  tooEarly() {
    this.finish()
    showToast('Too early: the fish swam off. Wait for the "!"')
  }

  reel() {
    this.mode = 'reeling'
    if (this.timer) this.timer.remove()
    this.bang.setVisible(false)
    this.setPrompt('Reeling in…')
    const catchInfo = this.pickCatch()

    this.scene.tweens.add({
      targets: this.bobber,
      x: this.player.x + 4,
      y: this.player.y - 2,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: function () {
        // Hold the fish up above the player's head for a moment.
        this.caught.setFrame(catchInfo.fish.sprite).setPosition(this.player.x, this.player.y - 16).setVisible(true)
        this.scene.tweens.add({ targets: this.caught, y: this.player.y - 20, duration: 300, yoyo: true, hold: 700 })
        this.scene.time.delayedCall(1400, function () { this.caught.setVisible(false) }, null, this)
        showCatch({
          title: 'You caught a ' + catchInfo.fish.name + '!',
          text: catchInfo.text,
          imageUrl: this.scene.textures.getBase64('decor', catchInfo.fish.sprite),
        })
        this.finish()
      },
      callbackScope: this,
    })
  }

  // A fun fact (if you've written any) or a skill from skills.js.
  pickCatch() {
    const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)]
    const facts = []
    for (let i = 0; i < funFacts.length; i++) {
      // On the live site, unfinished TODO facts are skipped.
      if (!isMissing(funFacts[i]) || import.meta.env.DEV) facts.push(funFacts[i])
    }
    if (facts.length > 0 && Math.random() < 0.5) {
      return { fish: fish, text: 'Fun fact: ' + facts[Math.floor(Math.random() * facts.length)] }
    }
    const group = skills[Math.floor(Math.random() * skills.length)]
    const skill = group.items[Math.floor(Math.random() * group.items.length)]
    return { fish: fish, text: 'It was holding a skill tag: Okkar works with ' + skill + ' (' + group.group + ').' }
  }

  // Back to idle (keeps any catch card on screen).
  finish() {
    if (this.timer) this.timer.remove()
    if (this.bobTween) this.bobTween.stop()
    this.timer = null
    this.mode = 'idle'
    this.bobber.setVisible(false)
    this.bang.setVisible(false)
    this.line.clear()
    this.setPrompt(null)
  }

  reset() {
    if (this.mode !== 'idle') this.finish()
    state.promptOverride = null
  }

  // Every frame: draw the fishing line; stop if the player walks away.
  update() {
    if (this.mode === 'idle') return
    if (state.currentZone !== this.zone) {
      this.finish()
      return
    }
    this.line.clear()
    this.line.lineStyle(1, hex('paper'), 0.8)
    this.line.lineBetween(this.player.x + 4, this.player.y - 2, this.bobber.x, this.bobber.y - 2)
  }
}

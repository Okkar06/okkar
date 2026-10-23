// =====================================================================
//  WELCOME NPC — Pip, the villager who greets visitors.
//  Stands near the spawn point with an idle animation and a name label,
//  walks up to the player for the guide, then walks back home.
// =====================================================================

import { DEPTH } from '../utils/constants.js'
import { prefersReducedMotion } from '../utils/device.js'
import { addShadow, addBlocker, makeLabel } from '../systems/Decorations.js'
import { guide } from '../data/guide.js'

const WALK_SPEED = 55 // pixels per second

export class WelcomeNpc {
  // x, bottomY: where Pip's feet are at home
  constructor(scene, x, bottomY, blockers) {
    this.scene = scene
    this.home = { x: x, y: bottomY }
    this.sprite = scene.add.sprite(x, bottomY, 'npc', 0).setOrigin(0.5, 1)
    this.sprite.play('npc-idle')
    this.shadow = addShadow(scene, x, bottomY - 1, 'shadow')
    this.label = makeLabel(scene, x, bottomY - 18, guide.npcName, DEPTH.worldUi)
    this.blocker = addBlocker(scene, blockers, x, bottomY, 10, 5)
    this.syncExtras()
  }

  // Keep the shadow, name label, depth and solid box with the sprite.
  syncExtras() {
    const x = this.sprite.x
    const y = this.sprite.y
    this.sprite.setDepth(DEPTH.world + y)
    this.shadow.setPosition(x + 1, y - 1)
    this.label.setPosition(x, y - 18)
  }

  walkTo(x, y, onArrive) {
    const scene = this.scene
    const distance = Math.sqrt((x - this.sprite.x) * (x - this.sprite.x) + (y - this.sprite.y) * (y - this.sprite.y))
    this.blocker.body.enable = false // don't shove the player while walking
    scene.tweens.killTweensOf(this.sprite)
    this.sprite.setFlipX(x < this.sprite.x)
    this.sprite.play('npc-walk', true)
    scene.tweens.add({
      targets: this.sprite,
      x: x,
      y: y,
      duration: prefersReducedMotion() ? 1 : Math.max(1, (distance / WALK_SPEED) * 1000),
      ease: 'Linear',
      onUpdate: this.syncExtras,
      onUpdateScope: this,
      onComplete: function () {
        this.sprite.play('npc-idle')
        this.syncExtras()
        this.blocker.setPosition(x, y - 2.5)
        this.blocker.body.updateFromGameObject()
        this.blocker.body.enable = true
        if (onArrive) onArrive()
      },
      callbackScope: this,
    })
  }

  // Stand next to the player (on whichever side is closer), facing them.
  approach(player, onArrive) {
    const side = this.sprite.x >= player.x ? 1 : -1
    const self = this
    this.walkTo(player.x + side * 18, player.y + 8, function () {
      self.sprite.setFlipX(side > 0) // face the player
      if (onArrive) onArrive()
    })
  }

  goHome() {
    this.walkTo(this.home.x, this.home.y, null)
  }
}

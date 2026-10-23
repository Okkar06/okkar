// =====================================================================
//  BOOT SCENE
//  Loads every image and the map, reports progress to the HTML loading
//  screen, creates the animations, then starts the village.
// =====================================================================

import Phaser from 'phaser'
import { ASSETS } from '../utils/constants.js'
import { bus } from '../utils/state.js'
import { createDecorAnimations } from '../systems/Decorations.js'
import { createGlowTexture } from '../systems/Lights.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Tell the loading bar (in index.html) how far along we are (0 to 1).
    this.load.on('progress', function (value) {
      bus.emit('load:progress', value)
    })
    this.load.on('loaderror', function (file) {
      bus.emit('load:error', file.key)
    })

    // Tileset (Kenney "Tiny Town", CC0)
    this.load.image('tiles-town', ASSETS + 'tilesets/tiny-town.png')
    // Generated tiles (cliffs, water, floors...) — see tools/build-art.mjs
    this.load.image('tiles-extras', ASSETS + 'tilesets/extras.png')
    // The same Kenney town image again, cut into 16x16 frames, so trees and
    // barrels can be turned into depth-sorted sprites.
    this.load.spritesheet('town', ASSETS + 'tilesets/tiny-town.png', { frameWidth: 16, frameHeight: 16 })
    // All generated sprites in one atlas (one download, one texture)
    this.load.atlas('decor', ASSETS + 'atlas/decor.png', ASSETS + 'atlas/decor.json')

    // The village map, made in Tiled and exported as JSON
    this.load.tilemapTiledJSON('village-map', ASSETS + 'maps/village.json')

    // Characters: 2 frames each (standing, mid-step)
    this.load.spritesheet('player', ASSETS + 'sprites/player.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('npc', ASSETS + 'sprites/npc.png', { frameWidth: 16, frameHeight: 16 })

    // Props placed on the map's "Props" layer (the name must match the "sprite" property in Tiled)
    this.load.image('mailbox', ASSETS + 'sprites/mailbox.png')
    this.load.image('noticeboard', ASSETS + 'sprites/noticeboard.png')
    this.load.image('stall', ASSETS + 'sprites/stall.png')
  }

  create() {
    // Walking: swap between the two frames.
    this.anims.create({
      key: 'player-walk',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 7,
      repeat: -1,
    })

    // The villager gently bobs while standing.
    this.anims.create({
      key: 'npc-idle',
      frames: this.anims.generateFrameNumbers('npc', { frames: [0, 0, 0, 1] }),
      frameRate: 3,
      repeat: -1,
    })

    // Pip walking (same two frames as idle, faster).
    this.anims.create({ key: 'npc-walk', frames: this.anims.generateFrameNumbers('npc', { start: 0, end: 1 }), frameRate: 7, repeat: -1 })

    createDecorAnimations(this)
    createGlowTexture(this)

    // Interior animations: fire, the sleeping cat breathing, twinkling lights.
    this.anims.create({ key: 'flame', frames: this.anims.generateFrameNames('decor', { prefix: 'flame_', start: 0, end: 2 }), frameRate: 8, repeat: -1 })
    this.anims.create({ key: 'cat_breathe', frames: this.anims.generateFrameNames('decor', { prefix: 'cat_', start: 0, end: 1 }), frameRate: 0.8, repeat: -1, yoyo: true })
    this.anims.create({ key: 'twinkle', frames: this.anims.generateFrameNames('decor', { prefix: 'string_lights_', start: 0, end: 1 }), frameRate: 1.2, repeat: -1 })

    // Wait (briefly) for the pixel font so signs don't flash in a fallback font.
    const scene = this
    let started = false
    function startVillage() {
      if (started) return
      started = true
      bus.emit('load:complete')
      scene.scene.start('VillageScene')
    }
    if (document.fonts && document.fonts.load) {
      document.fonts.load('32px "Pixelify Sans"').then(startVillage, startVillage)
      setTimeout(startVillage, 1500) // never wait longer than this
    } else {
      startVillage()
    }
  }
}

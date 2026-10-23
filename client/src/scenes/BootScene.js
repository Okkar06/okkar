// =====================================================================
//  BOOT SCENE
//  Loads every image and the map, reports progress to the HTML loading
//  screen, creates the animations, then starts the village.
// =====================================================================

import Phaser from 'phaser'
import { ASSETS } from '../utils/constants.js'
import { bus } from '../utils/state.js'

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

    // Tilesets (Kenney "Tiny Town" and "Tiny Dungeon", CC0)
    this.load.image('tiles-town', ASSETS + 'tilesets/tiny-town.png')
    this.load.image('tiles-dungeon', ASSETS + 'tilesets/tiny-dungeon.png')

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

    bus.emit('load:complete')
    this.scene.start('VillageScene')
  }
}

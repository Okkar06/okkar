// =====================================================================
//  GAME SETUP
//  This file is loaded *after* the page text is visible (see main.js),
//  because Phaser is the biggest download on the site.
// =====================================================================

import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { VillageScene } from './scenes/VillageScene.js'
import { WorkshopScene } from './scenes/WorkshopScene.js'
import { InteriorScene } from './scenes/InteriorScene.js'

export function startGame(parentElementId) {
  return new Phaser.Game({
    type: Phaser.AUTO, // WebGL if available, otherwise Canvas
    parent: parentElementId,
    backgroundColor: '#2a1d24',
    pixelArt: true, // keep pixels sharp when zoomed
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.RESIZE, // the canvas always fills its parent element
      width: '100%',
      height: '100%',
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false }, // set to true to see collision boxes
    },
    audio: { noAudio: true },
    banner: false,
    scene: [BootScene, VillageScene, WorkshopScene, InteriorScene],
  })
}

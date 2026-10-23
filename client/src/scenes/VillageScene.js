// =====================================================================
//  VILLAGE SCENE
//  The main map. Everything about the layout comes from the Tiled file
//  public/assets/maps/village.json (two tilesets: "tiny-town", "extras"):
//    - "Ground" tiles: grass, dirt paths (never solid)
//    - "Decor" tiles: walls, cliffs, fences, trees... (collides=true = solid).
//      Trees and barrels become depth-sorted sprites (systems/Decorations.js)
//    - "Above" tiles: roofs, drawn OVER the player so you can walk behind
//    - "Details" objects: tall grass, flowers, signposts, lamps (by type)
//    - "Props" objects: bigger sprites like the mailbox (property: sprite)
//    - "Interactables" objects: zones that open something (property: section)
//    - "Areas" objects: names shown in the HUD ("Village Square")
//    - "Spawn" object: where the player starts
// =====================================================================

import Phaser from 'phaser'
import { Player } from '../entities/Player.js'
import { getTiledProperty, DEPTH } from '../utils/constants.js'
import { bus } from '../utils/state.js'
import { openSection } from '../ui/sections.js'
import {
  setupCamera,
  makeZone,
  findZoneByName,
  updateCurrentZone,
  setupInteraction,
  moveToZone,
} from './sceneHelpers.js'
import { DayNight } from '../systems/DayNight.js'
import { WeatherSystem } from '../systems/WeatherSystem.js'
import { addAmbientLife } from './ambient.js'
import { convertTileProps, addDetails, addShadow, addBlocker } from '../systems/Decorations.js'
import { placeItems } from '../systems/Furniture.js'
import { LightSystem } from '../systems/Lights.js'
import { villageDecor } from '../data/decor.js'
import { WaterSystem } from '../systems/Water.js'
import { Fishing } from '../systems/Fishing.js'
import { WelcomeNpc } from '../entities/WelcomeNpc.js'
import { GuideArrow } from '../systems/GuideArrow.js'
import { talkToPip } from '../ui/Guide.js'

export class VillageScene extends Phaser.Scene {
  constructor() {
    super('VillageScene')
  }

  // `data` can contain { spawnAt: 'workshop', onArrive: function }
  create(data) {
    // ----- 1. Build the map from the Tiled JSON -----
    const map = this.make.tilemap({ key: 'village-map' })
    // The first names must match the tileset names inside Tiled.
    const townTiles = map.addTilesetImage('tiny-town', 'tiles-town')
    const extraTiles = map.addTilesetImage('extras', 'tiles-extras')
    const allTiles = [townTiles, extraTiles]

    const groundLayer = map.createLayer('Ground', allTiles, 0, 0).setDepth(DEPTH.ground)
    // The lake: water tiles are solid, the dock tiles are not.
    const waterLayer = map.createLayer('Water', allTiles, 0, 0).setDepth(DEPTH.ground + 0.5)
    waterLayer.setCollisionByProperty({ collides: true })
    this.water = new WaterSystem(this, waterLayer, extraTiles.firstgid)
    const decorLayer = map.createLayer('Decor', allTiles, 0, 0).setDepth(DEPTH.decor)
    map.createLayer('Above', allTiles, 0, 0).setDepth(DEPTH.above)

    const worldWidth = map.widthInPixels
    const worldHeight = map.heightInPixels
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)

    // Solid boxes for everything that isn't a solid tile.
    const blockers = []

    // Trees, barrels... become depth-sorted sprites; the rest stays a tile.
    convertTileProps(this, decorLayer, blockers)
    decorLayer.setCollisionByProperty({ collides: true })

    // Tall grass, flowers, stones, signposts, lamps...
    const lampPositions = addDetails(this, map.getObjectLayer('Details').objects, blockers)

    // Porches, flower boxes, chimneys, lanterns, market goods (src/data/decor.js)
    this.lightSystem = new LightSystem(this)
    placeItems(this, villageDecor, { blockers: blockers, lights: this.lightSystem })
    for (let i = 0; i < lampPositions.length; i++) {
      const lamp = lampPositions[i]
      this.lightSystem.add({ x: lamp.x, y: lamp.y, radius: lamp.radius, intensity: 0.6, flicker: true })
    }

    // ----- 2. Props (mailbox, notice board, stall, villager) -----
    const propObjects = map.getObjectLayer('Props').objects
    for (let i = 0; i < propObjects.length; i++) {
      const obj = propObjects[i]
      const key = getTiledProperty(obj, 'sprite', '')
      const centerX = obj.x + obj.width / 2
      const bottomY = obj.y + obj.height

      // Pip, the welcome villager, is a proper character (walks, has a name).
      if (key === 'npc') {
        this.npc = new WelcomeNpc(this, centerX, bottomY, blockers)
        continue
      }

      const sprite = this.add.sprite(centerX, bottomY, key, 0).setOrigin(0.5, 1)
      sprite.setDepth(DEPTH.world + bottomY) // lower on screen = drawn in front
      addShadow(this, centerX, bottomY - 1, obj.width >= 32 ? 'shadow_l' : 'shadow')

      // An invisible solid box at the bottom of the prop (its "feet").
      const bodyHeight = getTiledProperty(obj, 'bodyHeight', obj.height)
      addBlocker(this, blockers, centerX, bottomY, obj.width - 2, bodyHeight)
    }

    // ----- 3. Interaction zones -----
    this.zones = []
    const zoneObjects = map.getObjectLayer('Interactables').objects
    for (let i = 0; i < zoneObjects.length; i++) {
      const obj = zoneObjects[i]
      this.zones.push(makeZone(
        obj.name,
        getTiledProperty(obj, 'section', ''),
        getTiledProperty(obj, 'label', obj.name),
        obj.x, obj.y, obj.width, obj.height
      ))
    }

    // ----- 4. Named areas for the HUD -----
    this.areas = []
    const areaObjects = map.getObjectLayer('Areas').objects
    for (let i = 0; i < areaObjects.length; i++) {
      const obj = areaObjects[i]
      this.areas.push({ name: obj.name, rect: new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height) })
    }
    this.currentArea = ''

    // ----- 5. Player -----
    const spawn = map.findObject('Spawn', function (obj) { return obj.name === 'player_spawn' })
    let startX = spawn.x
    let startY = spawn.y
    if (data && data.spawnAt) {
      // Coming back from a building (or the quick tour): stand at that door.
      const zone = findZoneByName(this.zones, data.spawnAt)
      if (zone) {
        startX = zone.rect.centerX
        startY = zone.rect.centerY - 6
      }
    }
    this.player = new Player(this, startX, startY)
    this.physics.add.collider(this.player, decorLayer)
    this.physics.add.collider(this.player, waterLayer)
    this.physics.add.collider(this.player, blockers)

    // ----- 6. Camera, input, extras -----
    setupCamera(this, this.player, worldWidth, worldHeight)
    const scene = this
    setupInteraction(this, this.player, this.zones, function (zone) { scene.interact(zone) })
    // The fishing mini-game at the end of the dock.
    const fishingZone = findZoneByName(this.zones, 'fishing')
    this.fishing = fishingZone ? new Fishing(this, this.player, fishingZone, this.water) : null

    // Day/night tint and weather. Lamps and windows light up when it's
    // dark OR gloomy (whichever is darker).
    const scene2 = this
    let timeDarkness = 0
    let weatherDarkness = 0
    function updateLamps() { scene2.lightSystem.setDarkness(Math.max(timeDarkness, weatherDarkness)) }
    this.dayNight = new DayNight(this, worldWidth, worldHeight, function (amount) { timeDarkness = amount; updateLamps() })
    this.weather = new WeatherSystem(this, {
      worldWidth: worldWidth,
      worldHeight: worldHeight,
      groundLayer: groundLayer,
      water: this.water,
      onDarkness: function (amount) { weatherDarkness = amount; updateLamps() },
    })
    addAmbientLife(this, worldWidth, worldHeight)

    // ----- 7. Pip and the guide arrow -----
    this.guideArrow = new GuideArrow(this, this.player, this.zones)
    function onApproach(request) {
      if (scene.npc) scene.npc.approach(scene.player, request.onArrive)
    }
    function onHome() { if (scene.npc) scene.npc.goHome() }
    function onArrow(request) { scene.guideArrow.show(request.zone, request.seconds) }
    // While Pip talks, look a little further down so the player and Pip
    // stay visible above the dialogue box.
    function onDialogueOpen() { scene.cameras.main.setFollowOffset(0, -scene.scale.height / scene.cameras.main.zoom / 5) }
    function onDialogueClose() { scene.cameras.main.setFollowOffset(0, 0) }
    bus.on('npc:approach', onApproach)
    bus.on('npc:home', onHome)
    bus.on('guide:arrow', onArrow)
    bus.on('dialogue:open', onDialogueOpen)
    bus.on('dialogue:close', onDialogueClose)
    this.events.once('shutdown', function () {
      bus.off('npc:approach', onApproach)
      bus.off('npc:home', onHome)
      bus.off('guide:arrow', onArrow)
      bus.off('dialogue:open', onDialogueOpen)
      bus.off('dialogue:close', onDialogueClose)
    })

    // ----- 8. Quick tour travel requests -----
    function onTravel(request) {
      const zone = findZoneByName(scene.zones, request.zone)
      if (zone) moveToZone(scene, scene.player, zone, request.onArrive)
      else if (request.onArrive) request.onArrive()
    }
    bus.on('travel', onTravel)
    this.events.once('shutdown', function () { bus.off('travel', onTravel) })

    this.cameras.main.fadeIn(250, 0, 0, 0)
    bus.emit('location', "Okkar's Village")
    if (data && data.onArrive) this.time.delayedCall(300, data.onArrive)
  }

  // What happens when the player presses E inside a zone.
  interact(zone) {
    if (zone.section === 'workshop') {
      this.enterBuilding('WorkshopScene')
      return
    }
    if (zone.section === 'npc') {
      talkToPip()
      return
    }
    if (zone.section === 'fishing') {
      if (this.fishing) this.fishing.action()
      return
    }
    if (zone.section === 'house') {
      this.enterBuilding('InteriorScene', { room: 'house' })
      return
    }
    openSection(zone.section)
  }

  // Fade out and switch to an interior scene.
  enterBuilding(sceneKey, sceneData) {
    const scene = this
    this.player.setVelocity(0, 0)
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', function () {
      scene.scene.start(sceneKey, sceneData)
    })
  }

  update(time) {
    this.player.update()
    if (this.fishing) this.fishing.update()
    this.guideArrow.update(time)
    const scene = this
    updateCurrentZone(this.zones, this.player, function (zone) { scene.interact(zone) })

    // Which named area are we in? Only tell the HUD when it changes.
    let areaName = "Okkar's Village"
    for (let i = 0; i < this.areas.length; i++) {
      if (this.areas[i].rect.contains(this.player.x, this.player.y)) {
        areaName = this.areas[i].name
        break
      }
    }
    if (areaName !== this.currentArea) {
      this.currentArea = areaName
      bus.emit('location', areaName)
    }
  }
}

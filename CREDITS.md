# Credits and licences

Everything below is free to use in a personal portfolio, including commercially.

## Third-party art

| Asset | Used for | Author | Licence |
|---|---|---|---|
| [Tiny Town 1.1](https://kenney.nl/assets/tiny-town) | Village tiles: grass, dirt paths, trees, houses and roofs, fences, well, barrels, beehives, logs (`client/public/assets/tilesets/tiny-town.png`) | Kenney (kenney.nl) | [CC0 1.0 (public domain)](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Tiny Dungeon 1.0](https://kenney.nl/assets/tiny-dungeon) | Source of the player and Pip characters (tiles 85 and 99) | Kenney (kenney.nl) | [CC0 1.0 (public domain)](https://creativecommons.org/publicdomain/zero/1.0/) |

CC0 means no attribution is required, but crediting Kenney is a nice thing to do (this file does that).

## Art made for this repo

All of this was drawn for this project, either as small hand-drawn sprites or by code in
`client/tools/art/*.mjs` (run `npm run art`), using only colours from `client/src/theme/palette.js`
(sampled from the Kenney tiles so everything matches). It's yours to use, change or replace.

| File | What's in it |
|---|---|
| `client/public/assets/sprites/player.png`, `npc.png` | 2-frame walk/idle sheets built from the Tiny Dungeon characters (second frame = body raised 1 px) |
| `client/public/assets/sprites/mailbox.png`, `noticeboard.png`, `stall.png` | Village props |
| `client/public/assets/atlas/decor.png` (+ `decor.json`) | ~110 generated sprites: shadows, tall grass, flowers, stones, stumps, crops, fountain, signposts, lamps, benches, fence ivy and flowers, a bluebird; chimneys, porches, doormats, flower boxes, lanterns, potted plants, market goods; all house and workshop furniture (bed, bookshelves, desk, laptop, mug, armchair, rug, fireplace and flames, frames, plants, lamps, string lights, sleeping cat, tool rack, blueprints, workbench, project models); lily pads, reeds, bubbles, fish and fish shadows, dragonflies, dock stool, bucket; weather particles (rain, splash, snow, petals, leaves, smoke) and puddles; guide arrow, sparkle, "!" bubble and bobber |
| `client/public/assets/tilesets/extras.png` | Generated 16×16 tiles: cliff, forest floor, soil, cobbles, lake water (2 frames, 13 shore shapes), sand, dock planks, wood/stone floors, wallpaper and brick walls |
| `client/public/images/plate-hero.webp`, `client/public/images/og-image.png`, `docs/design/plate-poster.png` | "Lantern Cartography" survey plate: the real village map redrawn as a cartographic plate at dusk (canvas-design skill). Rendered by `docs/design/render_plates.py`; the design philosophy is `docs/design/lantern-cartography.md` |
| Runtime textures | The soft "glow" used for lights and fog is a radial gradient drawn in code (`src/systems/Lights.js`) |

## Sound

The ambient sound (wind, birdsong, rain and thunder) is synthesised in the browser with the Web Audio API
(`client/src/ui/AmbientSound.js`). There are no audio files.

## Fonts (loaded from Google Fonts)

| Font | Used for | Licence |
|---|---|---|
| [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) | Body text in the game UI and plain view (designed by the Braille Institute for legibility) | SIL Open Font License 1.1 |
| [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) | Pixel-style headings, signs and name plates; the name on the survey plate | SIL Open Font License 1.1 |
| [Jura](https://fonts.google.com/specimen/Jura), [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) | Thin labels and the role line baked into the survey plate images (from the canvas-design skill's font set) | SIL Open Font License 1.1 |

## Code

| Library | Licence |
|---|---|
| [Phaser 3](https://phaser.io) (3.90.0) | MIT |
| [Vite](https://vite.dev) | MIT |

## Swapping the art

- **Kenney tiles**: replace `tiny-town.png` with another 16×16 tileset of the same layout (12 × 11), or
  build a new map in Tiled (see README).
- **Generated sprites**: edit the drawing code in `client/tools/art/` and run `npm run art`, or replace
  a frame in the atlas with your own art of the same size.
- **Characters**: replace `client/public/assets/sprites/player.png` / `npc.png` with any 32×16 PNG
  (two 16×16 frames side by side).

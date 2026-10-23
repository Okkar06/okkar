# Credits and licences

Everything below is free to use in a personal portfolio, including commercially.

## Art

| Asset | Used for | Author | Licence |
|---|---|---|---|
| [Tiny Town 1.1](https://kenney.nl/assets/tiny-town) | Village tiles: grass, paths, trees, houses, fences, well, barrels (`client/public/assets/tilesets/tiny-town.png`) | Kenney (kenney.nl) | [CC0 1.0 (public domain)](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Tiny Dungeon 1.0](https://kenney.nl/assets/tiny-dungeon) | Workshop interior tiles (`tiny-dungeon.png`), and the player and villager characters | Kenney (kenney.nl) | [CC0 1.0 (public domain)](https://creativecommons.org/publicdomain/zero/1.0/) |
| `sprites/player.png`, `sprites/npc.png` | 2-frame walk/idle sheets | Made for this repo from Tiny Dungeon tiles 85 and 99 (second frame = body raised 1px) | CC0, same as the source |
| `sprites/mailbox.png`, `sprites/noticeboard.png`, `sprites/stall.png` | Village props | Original placeholder pixel art made for this repo, using colours from the Tiny Town palette | Yours to use, change or replace |
| `images/og-image.png` | Link preview image | Rendered from the starter village map + text | Yours to use, change or replace |

CC0 means no attribution is required, but crediting Kenney is a nice thing to do (this file does that).

## Fonts (loaded from Google Fonts)

| Font | Used for | Licence |
|---|---|---|
| [Inter](https://fonts.google.com/specimen/Inter) | Body text (game panels and plain view) | SIL Open Font License 1.1 |
| [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) | Pixel-style headings in the game | SIL Open Font License 1.1 |
| [Syne](https://fonts.google.com/specimen/Syne) | Headings on the plain view (from the old portfolio) | SIL Open Font License 1.1 |

## Code

| Library | Licence |
|---|---|
| [Phaser 3](https://phaser.io) (3.90.0) | MIT |
| [Vite](https://vite.dev) | MIT |

## Swapping the art

- **Tiles**: replace `client/public/assets/tilesets/tiny-town.png` with another 16×16 tileset (12 columns × 11 rows keeps the existing map working), or build a new map in Tiled (see README).
- **Characters**: replace `client/public/assets/sprites/player.png` / `npc.png` with any 32×16 PNG (two 16×16 frames side by side).
- **Props**: replace the PNGs in `client/public/assets/sprites/` with images of the same size, or change the size and update the matching object in Tiled's "Props" layer.

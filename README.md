# Okkar's Village — portfolio

My portfolio as a small Stardew Valley-style village, built with **Phaser 3 + Vite** (plain JavaScript).
Walk around, press **E** at a building, and a normal HTML panel opens with that part of the portfolio.

There is also a **plain view** (`plain.html`): a normal scrollable page built from the same data,
for anyone who just wants to read. Both pages share one set of data files, so you only edit content once.

| Place in the village | Portfolio section | Data file |
|---|---|---|
| Okkar's House (enter it: desk, bookshelf, cat) | About me, pitch, what I'm looking for, photo | `client/src/data/about.js` |
| Workshop (big stone building) | Projects: one shelf per project | `client/src/data/projects.js` |
| Notice board (and the house bookshelf) | Skills | `client/src/data/skills.js` |
| Market stall | Education and experience | `client/src/data/experience.js` |
| Mailbox | Contact + "Open to work" | `client/src/data/contact.js` |
| Pip, the welcome villager | First-visit guide, hints | `client/src/data/guide.js` |
| Fishing dock (easter egg) | Fun facts and skill tags | `client/src/data/funFacts.js` |
| Furniture, porches, chimneys… | Decoration layout | `client/src/data/decor.js` |

Always on screen: **Résumé**, **Contact me**, **Quick tour**, **Projects**, **Plain view**, the **Open to work**
badge, **Sound**, **Weather** (cloud icon) and **Help** (?, replays Pip's guide).

---

## Run it (GitHub Codespaces or your own computer)

```bash
cd client
npm install
npm run dev
```

(Or from the repo root: `npm install` then `npm run dev`. The root scripts just run the same commands inside `client/`.)

- Vite starts on **port 5173**. In Codespaces a "port forwarded" pop-up appears: click **Open in Browser**.
  If you miss it, open the **Ports** tab, find 5173 and click the globe icon.
  (`server.host: true` in `vite.config.js` is what makes this work in Codespaces.)
- Game page: `/` · Plain view: `/plain.html`
- Add `?time=night` (or `day`, `dusk`, `dawn`) to the URL to preview the day/night tint, and
  `?weather=rain` (or `clear`, `storm`, `fog`, `petals`, `snow`) to start with a weather.
  You can combine them: `/?time=night&weather=rain`.
- Pip's full welcome shows until it is finished or skipped once (remembered in localStorage).
  To see it again, press the **?** button, or clear site data.
- Ambient sound (wind + birds) is generated in code by `src/ui/AmbientSound.js`. It is off by default;
  the "Sound" button in the HUD toggles it and the choice is remembered per browser.
- In dev mode, `TODO` text is highlighted in yellow so you can find what's left to fill in.
  On the built site, TODOs are hidden or shown as "Details coming soon".
- In the browser console (dev only), `window.game` is the Phaser game, e.g.
  `game.scene.getScene('VillageScene').player`.

Build and check the real production site:

```bash
cd client
npm run build     # creates client/dist
npm run preview   # serves client/dist on port 4173
```

---

## Edit the content

All text lives in `client/src/data/`. Edit, save, refresh.

### Add a new project

Open `client/src/data/projects.js`, copy one `{ ... }` block, paste it at the end of the array and change the values:

```js
{
  id: 'my-new-app',                 // unique, lowercase, no spaces
  title: 'My New App',
  summary: 'One or two sentences.',
  problem: 'What problem it solves.',
  whatIBuilt: 'The features you built.',
  myRole: 'What YOU did.',
  stack: ['React', 'Node.js'],
  screenshots: [{ src: 'images/projects/my-new-app.png', alt: 'Dashboard' }],
  liveUrl: 'https://...',
  githubUrl: 'https://github.com/...',
  date: 'Jan 2027',
},
```

That's it: the Workshop builds a new shelf for it automatically (4 per row; the room grows taller for more rows),
and it appears in the Projects list and on the plain view. The order in the array is the order everywhere.

- Put screenshots in `client/public/images/projects/` (create the folder). Paths are relative to `client/public`.
- Anything you don't know yet: write `'TODO: ...'`. It stays highlighted in dev and is hidden on the live site.

### Résumé

Put your PDF at **`client/public/resume.pdf`** and restart `npm run dev` (or rebuild).
Until that file exists, every Résumé button shows "Résumé coming soon" instead of a broken download.

### Fun facts, Pip's lines and decorations

- `client/src/data/funFacts.js`: facts revealed by fishing. `TODO` lines stay hidden on the live site.
- `client/src/data/guide.js`: what Pip says (lines can have a desktop and a phone version).
- `client/src/data/decor.js`: every porch, flower box, chimney, lantern and piece of furniture is a
  `{ type, x, y }` entry in a list. Change the numbers to rearrange a room; the available types are listed
  in `client/src/systems/Furniture.js`.

### Photo

Replace `client/public/images/profile.jpg` (portrait, about 480×640) or change `photo` in `about.js`.

### Link preview / SEO

- `client/src/data/site.js`: the live URL, page title and the link-preview image (`og-image.png`, 1200×630).
- The meta description is built from `about.js` (see `renderMetaDescription` in `src/ui/plainPage.js`).
- `client/public/robots.txt` and `client/public/sitemap.xml` contain the live URL: update them if you move hosts.

---

## Edit the map in Tiled

The village is a [Tiled](https://www.mapeditor.org/) map saved as JSON: `client/public/assets/maps/village.json`.
It uses two tilesets: Kenney's **`tiny-town`** and **`extras`** (generated by `npm run art`: cliffs, water,
sand, soil, cobbles, floors, walls).

1. Install Tiled (free) and open `village.json` directly (**File → Open**).
2. **Tile layers** (top to bottom in Tiled = drawn last to first)
   - `Ground`: grass, dirt paths, sand, soil, cobbles. Never solid.
   - `Water`: the lake. Water tiles are solid; the dock tiles are walkable.
   - `Decor`: walls, cliffs, fences, trees, barrels… Tiles with the custom property **`collides` = true**
     are solid. Trees, bushes, barrels, beehives, the well and logs painted here are turned into
     depth-sorted sprites by the game (you can walk behind tree tops).
   - `Above`: roofs. Drawn on top of the player, so you can walk "behind" a building.
3. **Object layers**
   - `Details` (points): small things by **type**: `tallgrass_a`, `flower_pink`, `stone_m`, `signpost`
     (add a `label` property for the name plate), `lamppost`, `bench`, `reeds`, `lily_pad`, crops… The full
     list is `DETAIL_TYPES` in `client/src/systems/Decorations.js`.
   - `Interactables` (rectangles): walk into one and the "Press E" prompt appears.
     Properties: `section` (`house`, `workshop`, `skills`, `experience`, `contact`, `npc`, `fishing`,
     `about`, `projects`) and `label` (prompt text). The object **name** is used by the quick tour
     (`house`, `workshop`, `mailbox`).
   - `Props` (rectangles): bigger sprites. Properties: `sprite` and `bodyHeight` (solid pixels at the bottom).
     The `npc` prop is Pip's home spot.
   - `Areas`: named rectangles; the name shows in the HUD.
   - `Spawn`: a point called `player_spawn`.
4. Save with **File → Save** (keep the `.json` format). Two rules for Phaser:
   - Keep tilesets **embedded** in the map (don't export them as separate `.tsx`/`.tsj` files).
   - Keep the tileset names and layer names above, or update `src/scenes/VillageScene.js`.
5. Refresh the browser.

**Starter-map generator.** The current layout was produced by `client/tools/generate-starter-map.mjs`
(fences, lake shore and paths are autotiled by code). Running it writes `village.generated.json`;
only `node tools/generate-starter-map.mjs --overwrite` replaces `village.json`, and **that throws away
any edits you made in Tiled**. Once you start editing in Tiled, treat Tiled as the source of truth.

The interiors (house and Workshop) are **not** Tiled maps: they are built in code from `src/data/decor.js`,
and the Workshop grows with your project list.

---

## Art: palette, generated sprites, skills

- **One palette**: `client/src/theme/palette.js` (sampled from the Kenney tiles). New art and Phaser tints
  use colour names from it.
- **Generated pixel art**: every non-Kenney sprite and tile is drawn by code in `client/tools/art/*.mjs`
  (furniture, water, weather particles, Pip's arrow…). Change a sprite, then run:

  ```bash
  cd client
  npm run art      # rebuilds public/assets/atlas/decor.png (+ .json) and public/assets/tilesets/extras.png
  ```

  Everything is packed into one small atlas (one download, one texture).
- **Project skills** in `.claude/skills/`: `pixel-art-direction` (palette, outlines, shadows, light
  direction), `game-polish` (y-sorting, ambient motion, performance, accessibility) and `cozy-interiors`
  (how to dress a room). Claude Code follows them when working on this repo.

---

## Folder structure

```
.claude/skills/         Project skills (art direction, polish, interiors) for Claude Code
client/
  index.html            Game page: loading screen (with real intro text), HUD, dialogue, panels
  plain.html            Plain view page (content is generated into it at build time)
  vite.config.js        Two-page build, Codespaces settings, and the plugin that writes
                        your data into the HTML (SEO + works without JavaScript)
  tools/                Node scripts (no extra packages):
    build-art.mjs       `npm run art`: draws the generated sprites/tiles (art/*.mjs) into the atlas
    generate-starter-map.mjs  rebuilds the starter Tiled map (see the warning above)
  public/               Copied as-is into the build
    assets/atlas/       decor.png + decor.json: all generated sprites in one atlas
    assets/tilesets/    tiny-town.png (Kenney) and extras.png (generated)
    assets/maps/        Tiled map (village.json)
    assets/sprites/     Player and Pip, mailbox, notice board, market stall
    images/             Profile photo, link-preview image (add project screenshots here)
    resume.pdf          ← add this yourself
  src/
    main.js             Game page entry: loading screen, HUD buttons, then loads Phaser
    plain.js            Plain view entry (just styles; the content is already in the HTML)
    game.js             Phaser game settings (size, physics, list of scenes)
    data/               ★ All content: portfolio, guide lines, fun facts, decoration layouts
    theme/              palette.js (the one palette), tileIds.js (generated tile numbers)
    scenes/             BootScene (loading), VillageScene, InteriorScene (the house),
                        WorkshopScene, sceneHelpers.js (camera, zones, tour moves), ambient.js
    systems/            One job each: Decorations (y-sorted props, details), Furniture (places
                        {type,x,y} lists), RoomBuilder, Lights, Water, Fishing, WeatherSystem,
                        weatherState, DayNight, GuideArrow
    entities/           Player.js, WelcomeNpc.js (Pip)
    ui/                 HTML side: Panel, sections (what each place opens), sectionsHtml (HTML
                        shared by panels and plain view), plainPage, Hud, QuickTour, DialogueBox,
                        Guide, CatchCard, TouchDragControl, AmbientSound, icons
    utils/              state.js (shared state + event bus), constants.js (sizes, DEPTH layers),
                        device.js (reduced motion, low-end detection, safe localStorage)
    styles/             base.css (shared), game.css, plain.css
server/                 Express + Prisma API from the old portfolio (unchanged). In production it
                        also serves client/dist.
```

How the two halves talk: Phaser (canvas) and the HTML UI share `state` and send events on `bus`
(both in `src/utils/state.js`), e.g. the game emits `zone:change` and the HUD shows the prompt;
the prompt button emits `interact` and the game opens the panel; the weather button calls
`cycleWeather()` and the village hears `weather:change`.

### Performance and accessibility notes

- Phaser loads only on the game page, after the intro text is visible. The plain view loads no game code.
- Weather particles spawn only inside the camera view. Phones and low-end devices get half the particles;
  `prefers-reduced-motion` switches off particles, lightning, bobbing and typewriter text (tints stay).
- Panels and Pip's dialogue are HTML: keyboard-operable, focus moves in and back out, Esc closes,
  screen readers get each line once.

---

## Deploy

The build is a static site in `client/dist`. Every link is relative (`base: './'` in `vite.config.js`),
so it works at a domain root **and** in a sub-folder (GitHub Pages) without changes.
If you ever need a fixed base path: `BASE_PATH=/okkar/ npm run build`.

After deploying somewhere new, update the URL in `client/src/data/site.js`, `public/robots.txt` and `public/sitemap.xml`.

- **Render (current setup)**: nothing to change. `render.yaml` runs `npm run render-build`, which builds
  `client/` and Express serves `client/dist`. (Free Render instances sleep, so the first visit can take
  ~30 s; the loading screen says so.)
- **Vercel**: New Project → Root Directory `client` → Framework "Vite" → Build `npm run build` → Output `dist`.
- **Netlify**: Base directory `client`, build command `npm run build`, publish directory `client/dist`.
- **GitHub Pages**: build, then publish `client/dist` (e.g. with the official "Deploy static content to Pages" action,
  `path: client/dist`). No base-path change needed.

---

## Branches

This version lives on the branch **`feature/stardew-game-portfolio`**. The previous React portfolio is untouched on `main`.

To merge it yourself when you're happy:

```bash
git checkout main
git merge feature/stardew-game-portfolio
git push origin main
```

(or open a Pull Request on GitHub from the branch).

Art and font credits: see [CREDITS.md](CREDITS.md).

# Okkar's Village — portfolio

My portfolio as a small Stardew Valley-style village, built with **Phaser 3 + Vite** (plain JavaScript).
Walk around, press **E** at a building, and a normal HTML panel opens with that part of the portfolio.

There is also a **plain view** (`plain.html`): a normal scrollable page built from the same data,
for anyone who just wants to read. Both pages share one set of data files, so you only edit content once.

| Place in the village | Portfolio section | Data file |
|---|---|---|
| Okkar's House | About me, pitch, what I'm looking for, photo | `client/src/data/about.js` |
| Workshop (big stone building) | Projects: one shelf per project | `client/src/data/projects.js` |
| Notice board | Skills | `client/src/data/skills.js` |
| Market stall | Education and experience | `client/src/data/experience.js` |
| Mailbox | Contact + "Open to work" | `client/src/data/contact.js` |
| Villager | Welcome + "visit the Workshop first" | `client/src/ui/sections.js` (`npcLines`) |

Always on screen: **Résumé**, **Contact me**, **Quick tour**, **Projects**, **Plain view**, and the **Open to work** badge.

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
- Add `?time=night` (or `day`, `dusk`, `dawn`) to the URL to preview the day/night tint.
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

### Photo

Replace `client/public/images/profile.jpg` (portrait, about 480×640) or change `photo` in `about.js`.

### Link preview / SEO

- `client/src/data/site.js`: the live URL, page title and the link-preview image (`og-image.png`, 1200×630).
- The meta description is built from `about.js` (see `renderMetaDescription` in `src/ui/plainPage.js`).
- `client/public/robots.txt` and `client/public/sitemap.xml` contain the live URL: update them if you move hosts.

---

## Edit the map in Tiled

The village is a [Tiled](https://www.mapeditor.org/) map saved as JSON: `client/public/assets/maps/village.json`.

1. Install Tiled (free) and open `village.json` directly (**File → Open**).
2. **Tile layers**
   - `Ground`: grass, dirt, stone paths. Never solid.
   - `Decor`: trees, buildings, fences, barrels… A tile is solid if it has the custom property
     **`collides` = true** in the tileset. To change one: open the tileset (the *Tilesets* panel → edit icon),
     click a tile, and add/remove the `collides` bool property.
3. **Object layers** (use rectangles)
   - `Interactables`: walk into one of these and the "Press E" prompt appears.
     Properties: `section` (`about`, `workshop`, `skills`, `experience`, `contact`, `npc` or `projects`) and `label` (prompt text).
     The object **name** is used by the quick tour (`house`, `workshop`, `mailbox`).
   - `Props`: a sprite drawn at that rectangle. Properties: `sprite` (image key, e.g. `mailbox`) and
     `bodyHeight` (how many pixels at the bottom are solid). New images must also be loaded in `src/scenes/BootScene.js`.
   - `Areas`: named rectangles; the name shows in the top-left of the HUD.
   - `Spawn`: a point called `player_spawn` (where the player starts).
4. Save with **File → Save** (keep the `.json` format). Two rules for Phaser:
   - Keep the tileset **embedded** in the map (don't export it as a separate `.tsx`/`.tsj` file).
   - Keep the tileset name `tiny-town` and the layer names above, or update `src/scenes/VillageScene.js`.
5. Refresh the browser.

The Workshop interior is **not** a Tiled map: it is built in code (`src/scenes/WorkshopScene.js`) so it can grow with your project list.

---

## Folder structure

```
client/
  index.html            Game page: loading screen (with real intro text), HUD, panel markup
  plain.html            Plain view page (content is generated into it at build time)
  vite.config.js        Two-page build, Codespaces settings, and the plugin that writes
                        your data into the HTML (SEO + works without JavaScript)
  public/               Copied as-is into the build
    assets/tilesets/    Kenney tilesets (PNG)
    assets/maps/        Tiled map (village.json)
    assets/sprites/     Player, villager, mailbox, notice board, market stall
    images/             Profile photo, link-preview image (add project screenshots here)
    resume.pdf          ← add this yourself
  src/
    main.js             Game page entry: loading screen, buttons, then loads Phaser
    plain.js            Plain view entry (just styles; the content is already in the HTML)
    game.js             Phaser game settings (size, physics, list of scenes)
    data/               ★ All portfolio content. Edit these.
    scenes/             Phaser scenes: BootScene (loading), VillageScene, WorkshopScene,
                        sceneHelpers.js (camera, zones, tap-to-move, tour, day/night), ambient.js
    entities/           Player.js (movement + animation)
    ui/                 HTML side: Panel.js (pop-up), sections.js (what each place opens),
                        sectionsHtml.js (HTML builders shared by panels and plain view),
                        plainPage.js, Hud.js, QuickTour.js, TouchDragControl.js, AmbientSound.js
    utils/              state.js (shared state + tiny event bus), constants.js (speeds, tiles, zoom)
    styles/             base.css (shared), game.css, plain.css
server/                 Express + Prisma API from the old portfolio (unchanged). In production it
                        also serves client/dist.
```

How the two halves talk: Phaser (canvas) and the HTML UI share `state` and send events on `bus`
(both in `src/utils/state.js`), e.g. the game emits `zone:change` and the HUD shows the prompt;
the prompt button emits `interact` and the game opens the panel.

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

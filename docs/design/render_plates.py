"""
Lantern Cartography: renders the village map as a survey plate at dusk.

Reads the real Tiled map (client/public/assets/maps/village.json) and draws every tile as
one cartographic mark. Outputs:
  docs/design/plate-poster.png             the full art piece (with typography)
  client/public/images/plate-hero.webp     the plate without text, for the website hero
  client/public/images/og-image.png        1200x630 link-preview image

Run from the repo root (needs Pillow: pip install pillow):
  python docs/design/render_plates.py
"""

import json
import math
import os
import re

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTS = os.path.join(ROOT, '.claude', 'skills', 'canvas-design', 'canvas-fonts')
MAP = os.path.join(ROOT, 'client', 'public', 'assets', 'maps', 'village.json')
TILE_IDS = os.path.join(ROOT, 'client', 'src', 'theme', 'tileIds.js')

# ---------------------------------------------------------------------------
#  Palette: dusk field, land lifted a step or two, one warm family for light.
# ---------------------------------------------------------------------------
FIELD = (27, 42, 92)          # palette 'night'
FIELD_DEEP = (20, 31, 70)
GRID = (36, 52, 106)
LAND_DOT = (46, 64, 124)
PATH = (78, 96, 160)
TREE = (34, 52, 108)
TREE_RIM = (60, 82, 146)
FENCE = (118, 134, 196)
BUILDING = (14, 21, 50)
BUILDING_RIM = (70, 88, 152)
WATER = (24, 48, 112)
CONTOUR = (95, 184, 232)      # palette 'waterLight'
HACHURE = (66, 84, 148)
WARM = (255, 211, 138)        # palette 'warmLight'
WARM_CORE = (253, 190, 83)    # palette 'yellow'
PAPER = (253, 243, 220)       # palette 'paper'
PAPER_DIM = (196, 192, 200)

with open(MAP) as f:
    village = json.load(f)
W, H = village['width'], village['height']
layers = {layer['name']: layer for layer in village['layers']}

with open(TILE_IDS) as f:
    text = f.read()
extras = json.loads(re.search(r'export const EXTRAS = (\{.*?\})', text, re.S).group(1))
extra_by_id = {v: k for k, v in extras.items()}
EXTRAS_FIRST = 133


def tile(layer, x, y):
    return layers[layer]['data'][y * W + x]


def extra_name(gid):
    if gid >= EXTRAS_FIRST:
        return extra_by_id.get(gid - EXTRAS_FIRST, '')
    return ''


def kenney(gid):
    return gid - 1 if 0 < gid < EXTRAS_FIRST else -1


TREES = {3, 4, 5, 15, 16, 27, 28}
FENCES = {44, 45, 46, 47, 56, 58, 59, 68, 69, 70, 71, 80, 81, 82}
WINDOWS = {84, 88}
DOORS = {85, 86, 87, 89, 90, 91}
WALLS = set(range(72, 80)) | WINDOWS | DOORS
DIRT = {12, 13, 14, 24, 25, 26, 36, 37, 38, 39, 40, 41, 42}


def render_plan(S):
    """Draw the whole map at S pixels per tile. Returns (plan RGB, glow layer RGBA)."""
    pw, ph = W * S, H * S
    plan = Image.new('RGB', (pw, ph), FIELD)
    glow = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(plan)
    g = ImageDraw.Draw(glow)
    u = S / 24.0  # unit: 1 at the reference size

    def cx(x):
        return x * S + S / 2

    def cy(y):
        return y * S + S / 2

    def sq(x, y, r, color):
        d.rectangle([round(x - r), round(y - r), round(x + r - 1), round(y + r - 1)], fill=color)

    def light(x, y, r_core, r_halo, strength=1.0):
        g.ellipse([x - r_halo, y - r_halo, x + r_halo, y + r_halo], fill=WARM + (int(26 * strength),))
        g.ellipse([x - r_halo * 0.5, y - r_halo * 0.5, x + r_halo * 0.5, y + r_halo * 0.5], fill=WARM + (int(48 * strength),))
        g.ellipse([x - r_halo * 0.2, y - r_halo * 0.2, x + r_halo * 0.2, y + r_halo * 0.2], fill=WARM + (int(90 * strength),))
        sq(x, y, r_core, WARM_CORE)

    # Faint survey grid every 4 tiles.
    for gx in range(0, W + 1, 4):
        d.line([(gx * S, 0), (gx * S, ph)], fill=GRID, width=1)
    for gy in range(0, H + 1, 4):
        d.line([(0, gy * S), (pw, gy * S)], fill=GRID, width=1)

    lake = [[False] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            ground = tile('Ground', x, y)
            k = kenney(ground)
            name = extra_name(ground)
            water = extra_name(tile('Water', x, y))
            if water.startswith('water_'):
                lake[y][x] = True
            # Ground marks
            if k == 2 or k == 1:
                sq(cx(x) + (5 if (x + y) % 2 else -4) * u, cy(y) + (3 if x % 2 else -5) * u, 1 * u, LAND_DOT)
            elif k in DIRT:
                sq(cx(x), cy(y), 2 * u, PATH)
                # connect to dirt neighbours with smaller dots
                if x + 1 < W and kenney(tile('Ground', x + 1, y)) in DIRT:
                    sq(cx(x) + S / 2, cy(y), 1.2 * u, PATH)
                if y + 1 < H and kenney(tile('Ground', x, y + 1)) in DIRT:
                    sq(cx(x), cy(y) + S / 2, 1.2 * u, PATH)
            elif name.startswith('cobble'):
                for i in range(3):
                    for j in range(3):
                        sq(x * S + (5 + i * 7) * u, y * S + (5 + j * 7) * u, 1 * u, PATH)
            elif name.startswith('soil'):
                for j in range(3):
                    d.line([(x * S + 3 * u, y * S + (5 + j * 7) * u), (x * S + 20 * u, y * S + (5 + j * 7) * u)], fill=LAND_DOT, width=max(1, round(u)))
            elif name.startswith('sand'):
                for (i, j) in [(4, 6), (14, 3), (9, 15), (19, 18), (3, 20)]:
                    sq(x * S + i * u, y * S + j * u, 0.8 * u, LAND_DOT)
            elif name.startswith('forest_floor'):
                sq(cx(x) + 6 * u, cy(y) - 6 * u, 0.8 * u, LAND_DOT)

    # Lake: deeper fill + contour rings by distance to the shore.
    dist = [[0.0] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if not lake[y][x]:
                continue
            best = 99.0
            for yy in range(max(0, y - 6), min(H, y + 7)):
                for xx in range(max(0, x - 8), min(W, x + 9)):
                    if not lake[yy][xx]:
                        best = min(best, math.hypot(xx - x, yy - y))
            dist[y][x] = best
    sub = 16  # sample each tile 16x16 so contours read as smooth lines
    for y in range(H):
        for x in range(W):
            if lake[y][x]:
                d.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=WATER)
    for y in range(H):
        for x in range(W):
            if not lake[y][x]:
                continue
            for j in range(sub):
                for i in range(sub):
                    fx, fy = x + (i + 0.5) / sub, y + (j + 0.5) / sub
                    # interpolate distance from neighbours (bilinear on tile centres)
                    x0, y0 = int(fx - 0.5), int(fy - 0.5)
                    tx, ty = fx - 0.5 - x0, fy - 0.5 - y0
                    def dv(a, b):
                        if 0 <= a < W and 0 <= b < H and lake[b][a]:
                            return dist[b][a]
                        return 0.0
                    v = (dv(x0, y0) * (1 - tx) * (1 - ty) + dv(x0 + 1, y0) * tx * (1 - ty)
                         + dv(x0, y0 + 1) * (1 - tx) * ty + dv(x0 + 1, y0 + 1) * tx * ty)
                    for level, alpha in [(0.85, 0.95), (1.45, 0.65), (2.05, 0.42), (2.65, 0.25)]:
                        if abs(v - level) < 0.035:
                            c = tuple(int(WATER[k] + (CONTOUR[k] - WATER[k]) * alpha) for k in range(3))
                            px0 = int(x * S + (i + 0.5) * S / sub)
                            py0 = int(y * S + (j + 0.5) * S / sub)
                            d.point((px0, py0), fill=c)

    # The dock: planks laid across, the same thin rule as planted rows.
    for y in range(H):
        for x in range(W):
            if extra_name(tile('Water', x, y)).startswith('dock'):
                for j in range(0, 24, 4):
                    d.line([(x * S + 2 * u, y * S + j * u), (x * S + 22 * u, y * S + j * u)], fill=FENCE, width=1)

    # Decor: cliff hachures, trees, fences, walls; roofs from 'Above'.
    for y in range(H):
        for x in range(W):
            gid = tile('Decor', x, y)
            k = kenney(gid)
            name = extra_name(gid)
            if name.startswith('cliff_top'):
                for i in range(0, 24, 3):
                    length = 10 if i % 6 == 0 else 6
                    d.line([(x * S + i * u, y * S + 10 * u), (x * S + i * u, y * S + (10 + length) * u)], fill=HACHURE, width=max(1, round(u)))
            elif name.startswith('cliff_bottom'):
                for i in range(1, 24, 3):
                    length = 7 if i % 6 == 1 else 4
                    d.line([(x * S + i * u, y * S), (x * S + i * u, y * S + length * u)], fill=HACHURE, width=max(1, round(u)))
            elif k in TREES:
                jx = ((x * 37 + y * 17) % 7) - 3
                jy = ((x * 13 + y * 29) % 5) - 2
                r = (7 if k in (5, 27, 28) else 9) * u
                ox, oy = cx(x) + jx * u, cy(y) + jy * u
                d.ellipse([ox - r, oy - r, ox + r, oy + r], fill=TREE, outline=TREE_RIM, width=max(1, round(u)))
            elif k in FENCES:
                horizontal = k in {44, 45, 46, 68, 69, 70, 80, 81, 82}
                for i in range(3):
                    if horizontal:
                        sq(x * S + (4 + i * 8) * u, cy(y), 1.4 * u, FENCE)
                    else:
                        sq(cx(x), y * S + (4 + i * 8) * u, 1.4 * u, FENCE)
            elif k in WALLS:
                d.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=BUILDING)
            above = kenney(tile('Above', x, y))
            if above >= 0:
                d.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=BUILDING)

    # Building outlines, then lit windows and doors.
    for y in range(H):
        for x in range(W):
            built = kenney(tile('Above', x, y)) >= 0 or kenney(tile('Decor', x, y)) in WALLS
            if not built:
                continue
            for (dx, dy, x0, y0, x1, y1) in [(0, -1, 0, 0, S - 1, 0), (0, 1, 0, S - 1, S - 1, S - 1), (-1, 0, 0, 0, 0, S - 1), (1, 0, S - 1, 0, S - 1, S - 1)]:
                nx, ny = x + dx, y + dy
                nb = 0 <= nx < W and 0 <= ny < H and (kenney(tile('Above', nx, ny)) >= 0 or kenney(tile('Decor', nx, ny)) in WALLS)
                if not nb:
                    d.line([(x * S + x0, y * S + y0), (x * S + x1, y * S + y1)], fill=BUILDING_RIM, width=max(1, round(u)))
            k = kenney(tile('Decor', x, y))
            if k in WINDOWS:
                light(cx(x), cy(y), 3 * u, 22 * u, 1.0)
            elif k in DOORS:
                light(cx(x), cy(y) + 4 * u, 2 * u, 12 * u, 0.5)

    # Details: lamps, fountain; props as small marks.
    for obj in layers['Details']['objects']:
        x, y = obj['x'] * S / 16, obj['y'] * S / 16
        if obj['type'] == 'lamppost':
            light(x, y - 14 * u, 2.2 * u, 26 * u, 0.9)
        elif obj['type'] == 'fountain':
            fy = y - 10 * u
            for r in (6, 11, 16):
                d.ellipse([x - r * u, fy - r * u, x + r * u, fy + r * u], outline=CONTOUR, width=max(1, round(u)))
            sq(x, fy, 1.5 * u, PAPER)
    for obj in layers['Props']['objects']:
        x, y = (obj['x'] + obj['width'] / 2) * S / 16, (obj['y'] + obj['height'] / 2) * S / 16
        if obj['name'] == 'mailbox':
            sq(x, y, 3 * u, PAPER)
        elif obj['name'] in ('noticeboard', 'market'):
            w = obj['width'] * S / 32
            d.rectangle([x - w, y - 4 * u, x + w, y + 4 * u], fill=BUILDING, outline=BUILDING_RIM)
            light(x, y - 8 * u, 1.5 * u, 14 * u, 0.6)

    # The trail: one walked line of paper dots, spawn -> square -> workshop door.
    spawn = layers['Spawn']['objects'][0]
    sx, sy = spawn['x'] / 16, spawn['y'] / 16
    waypoints = [(sx, sy), (sx, 21.5), (sx, 18.2), (31.5, 18.2), (38.6, 18.0), (38.6, 13.6)]
    step = 0.42
    for (a, b) in zip(waypoints, waypoints[1:]):
        length = math.hypot(b[0] - a[0], b[1] - a[1])
        n = max(1, int(length / step))
        for i in range(n):
            t = i / n
            px = a[0] + (b[0] - a[0]) * t + math.sin((a[1] + i) * 1.7) * 0.06
            py = a[1] + (b[1] - a[1]) * t + math.cos((a[0] + i) * 1.3) * 0.06
            sq(px * S, py * S, 1.3 * u, PAPER)
    return plan, glow


def compose(plan, glow):
    """Plan + soft halos (light is the one permitted softness)."""
    wide = glow.filter(ImageFilter.GaussianBlur(radius=max(6, plan.width / 70)))
    tight = glow.filter(ImageFilter.GaussianBlur(radius=max(2, plan.width / 260)))
    out = plan.convert('RGBA')
    out = Image.alpha_composite(out, wide)
    out = Image.alpha_composite(out, tight)
    # Re-stamp the warm cores so the brightest points stay crisp.
    core = Image.new('RGBA', plan.size, (0, 0, 0, 0))
    px_plan = plan.load()
    px_core = core.load()
    for y in range(plan.height):
        for x in range(plan.width):
            if px_plan[x, y] == WARM_CORE or px_plan[x, y] == PAPER:
                px_core[x, y] = px_plan[x, y] + (255,)
    return Image.alpha_composite(out, core)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def text_width(draw, s, f):
    box = draw.textbbox((0, 0), s, font=f)
    return box[2] - box[0]


# ---------------------------------------------------------------------------
#  1. The poster (1800 x 1200): plate on the left, archivist's margin on the right.
# ---------------------------------------------------------------------------
S = 24
plan, glow = render_plan(S)
plate = compose(plan, glow)  # 1152 x 864

poster = Image.new('RGBA', (1800, 1200), FIELD_DEEP + (255,))
pd = ImageDraw.Draw(poster)
M = 96
PX, PY = M, 168
poster.alpha_composite(plate, (PX, PY))
pd.rectangle([PX - 1, PY - 1, PX + plate.width, PY + plate.height], outline=GRID)
# Scale ticks along the plate's top and left edges: one per tile, longer every 4.
for i in range(W + 1):
    length = 10 if i % 4 == 0 else 5
    pd.line([(PX + i * S, PY - 2), (PX + i * S, PY - 2 - length)], fill=HACHURE)
for j in range(H + 1):
    length = 10 if j % 4 == 0 else 5
    pd.line([(PX - 2, PY + j * S), (PX - 2 - length, PY + j * S)], fill=HACHURE)

thin = font('Jura-Light.ttf', 19)
thin_small = font('Jura-Light.ttf', 16)
mid = font('Jura-Medium.ttf', 16)
name_font = font('PixelifySans-Medium.ttf', 60)

col = PX + plate.width + 72  # right column
pd.text((PX, PY - 66), 'Survey of a small village, taken at dusk', font=thin, fill=PAPER_DIM)
coord = '1°17′ N   103°51′ E'
pd.text((PX + plate.width - text_width(pd, coord, thin), PY - 66), coord, font=thin, fill=PAPER_DIM)

pd.text((col, PY - 14), 'Okkar', font=name_font, fill=PAPER)
pd.text((col, PY + 52), 'Hein', font=name_font, fill=PAPER)
pd.line([(col, PY + 140), (col + 64, PY + 140)], fill=WARM, width=2)
pd.text((col, PY + 160), 'Plate I', font=mid, fill=WARM)
pd.text((col, PY + 186), 'Forty-eight by thirty-six tiles,', font=thin_small, fill=PAPER_DIM)
pd.text((col, PY + 208), 'one lantern per lit window.', font=thin_small, fill=PAPER_DIM)

# Legend: keyed swatches drawn with the same marks as the plate.
ly = PY + 300
pd.text((col, ly), 'Key', font=mid, fill=PAPER)
ly += 40
items = [
    ('lamplight', 'light'),
    ('dwelling', 'block'),
    ('fence post', 'posts'),
    ('planted row', 'rows'),
    ('depth contour', 'ring'),
    ('path walked', 'trail'),
]
for label, kind in items:
    x0, y0 = col, ly + 4
    if kind == 'light':
        halo = Image.new('RGBA', (60, 40), (0, 0, 0, 0))
        hd = ImageDraw.Draw(halo)
        hd.ellipse([8, 2, 44, 38], fill=WARM + (90,))
        halo = halo.filter(ImageFilter.GaussianBlur(5))
        poster.alpha_composite(halo, (x0 - 8, y0 - 12))
        pd.rectangle([x0 + 14, y0 + 4, x0 + 21, y0 + 11], fill=WARM_CORE)
    elif kind == 'block':
        pd.rectangle([x0 + 4, y0, x0 + 32, y0 + 15], fill=BUILDING, outline=BUILDING_RIM)
    elif kind == 'posts':
        for i in range(4):
            pd.rectangle([x0 + 3 + i * 9, y0 + 6, x0 + 5 + i * 9, y0 + 8], fill=FENCE)
    elif kind == 'rows':
        for j in range(3):
            pd.line([(x0 + 3, y0 + 2 + j * 6), (x0 + 33, y0 + 2 + j * 6)], fill=LAND_DOT, width=2)
    elif kind == 'ring':
        pd.ellipse([x0 + 6, y0 - 2, x0 + 30, y0 + 18], outline=CONTOUR, width=1)
        pd.ellipse([x0 + 12, y0 + 3, x0 + 24, y0 + 13], outline=CONTOUR, width=1)
    elif kind == 'trail':
        for i in range(5):
            pd.rectangle([x0 + 3 + i * 7, y0 + 7, x0 + 4 + i * 7, y0 + 8], fill=PAPER)
    pd.text((col + 56, ly), label, font=thin, fill=PAPER_DIM)
    ly += 42

# Scale bar at the foot of the column.
sy = PY + plate.height - 40
pd.line([(col, sy), (col + 10 * S, sy)], fill=PAPER_DIM, width=1)
for i in (0, 5, 10):
    pd.line([(col + i * S, sy - 6), (col + i * S, sy + 6)], fill=PAPER_DIM, width=1)
    label = str(i)
    pd.text((col + i * S - text_width(pd, label, thin_small) / 2, sy + 12), label, font=thin_small, fill=PAPER_DIM)
pd.text((col + 10 * S + 14, sy - 10), 'tiles', font=thin_small, fill=PAPER_DIM)

poster.convert('RGB').save(os.path.join(ROOT, 'docs', 'design', 'plate-poster.png'), optimize=True)

# ---------------------------------------------------------------------------
#  2. Website hero: the plate alone, on the field colour (text lives in HTML).
# ---------------------------------------------------------------------------
hero = Image.new('RGBA', (plate.width + 96, plate.height + 96), FIELD + (255,))
hero.alpha_composite(plate, (48, 48))
hero.convert('RGB').save(os.path.join(ROOT, 'client', 'public', 'images', 'plate-hero.webp'), quality=86, method=6)

# ---------------------------------------------------------------------------
#  3. Link preview (1200 x 630): name on the left, a crop of the plate on the right.
# ---------------------------------------------------------------------------
og = Image.new('RGBA', (1200, 630), FIELD_DEEP + (255,))
od = ImageDraw.Draw(og)
crop_box = (15 * S, 6 * S, 46 * S, 34 * S)  # square, workshop, post office, lake
crop = plate.crop(crop_box)
scale = 600 / crop.height
crop = crop.resize((round(crop.width * scale), 600), Image.LANCZOS)
og.alpha_composite(crop, (1200 - crop.width - 15, 15))
# soft fade from the text side into the plate
fade = Image.new('RGBA', (220, 630), (0, 0, 0, 0))
fdraw = ImageDraw.Draw(fade)
for i in range(220):
    fdraw.line([(i, 0), (i, 630)], fill=FIELD_DEEP + (int(255 * (1 - i / 220) ** 1.6),))
og.alpha_composite(fade, (1200 - crop.width - 15, 0))

big = font('PixelifySans-Medium.ttf', 92)
body = font('InstrumentSans-Regular.ttf', 30)
small = font('Jura-Light.ttf', 22)
od.text((72, 150), 'Okkar', font=big, fill=PAPER)
od.text((72, 248), 'Hein', font=big, fill=PAPER)
od.text((74, 382), 'Full-stack developer', font=body, fill=PAPER)
od.text((74, 424), 'React, Node.js, PostgreSQL, cloud', font=body, fill=PAPER_DIM)
# status: a single lamplight point
halo = Image.new('RGBA', (60, 60), (0, 0, 0, 0))
ImageDraw.Draw(halo).ellipse([10, 10, 50, 50], fill=WARM + (110,))
og.alpha_composite(halo.filter(ImageFilter.GaussianBlur(6)), (60, 484))
od.rectangle([86, 510, 93, 517], fill=WARM_CORE)
od.text((112, 497), 'Open to work in Singapore', font=small, fill=WARM)
og.convert('RGB').save(os.path.join(ROOT, 'client', 'public', 'images', 'og-image.png'), optimize=True)

print('plate', plate.size, 'poster, hero and og-image written')

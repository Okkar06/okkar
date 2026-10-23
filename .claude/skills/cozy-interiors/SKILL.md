---
name: cozy-interiors
description: How to dress rooms and building exteriors in Okkar's village so they feel lived in (furniture layout, theming per portfolio section, warm lighting). Use when adding or rearranging furniture, rooms or exterior decorations.
---

# Cozy interiors — Okkar's Village

Rooms are defined as data in `client/src/data/decor.js`: each room is a size plus a list of
`{ type, x, y }` items (tile coordinates). The scene places them in a loop, so rearranging a room
is just editing numbers.

## Make a room feel lived in
1. **Anchor pieces first**: the big item that says what the room is (bed, workbench, desk), against
   a wall, not floating in the middle.
2. **Zones**: group furniture into 2–3 little "scenes" (sleep corner, work corner, fireside corner).
   Leave a clear walking path from the door to each interactable.
3. **Layers of detail**: floor (rug) → furniture → things ON furniture (mug, laptop, books, plant)
   → things on walls (frames, shelves, string lights, window).
4. **Something alive**: fire flame, a sleeping cat that breathes, steam from a mug, flickering lamp.
5. **Asymmetry**: avoid mirror-perfect layouts; a slightly off-centre rug or a plant in one corner
   looks natural.
6. **Light**: every room has at least one warm light source (lamp, fireplace, window) with a soft
   glow, plus a faint warm tint over the whole room.
7. **Don't over-fill**: keep ~40% of the floor empty so the player can move and the room reads clearly.

## Theme each room to its portfolio section
- **House (About me)**: desk with laptop + mug (opens About), photo frames, bookshelf, bed with quilt,
  armchair by the fireplace, cat on a cushion, plants, string lights.
- **Workshop (Projects)**: one shelf per project (generated from `projects.js`), workbench, tool
  racks, blueprints pinned to the walls, little project models on shelves, crates.
- **Market stall (Education)**: crates of produce, hanging goods, baskets, a chalk price board.

## Exteriors
Each building gets a porch feel: doormat, potted plants or flower boxes under windows, a lantern by
the door, chimney smoke, windows that glow at dusk/night, and a small wooden sign with its name.

## Interactables inside rooms
- Must be visually obvious (desk with a glowing laptop, shelf with a name plate).
- The "Press E" zone sits in front of the object, never behind furniture.
- Always keep the exit door reachable and labelled.

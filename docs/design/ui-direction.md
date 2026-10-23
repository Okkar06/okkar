# UI direction: "Surveyed at dusk"

Notes from the frontend-design pass (keep these so the next pass builds on them instead of
starting over).

## Subject, audience, job
A recruiter-facing portfolio set in a pixel village. Job: who Okkar is, what he can do and how
to reach him, in 60 seconds, even without playing. The art direction comes from the
"Lantern Cartography" survey plate (`docs/design/lantern-cartography.md`).

## Tokens
| Name | Hex | Role |
|---|---|---|
| Dusk | `#1b2a5c` | UI chrome (HUD, prompt, dialogue, toasts), hero field, panel headers |
| Deep dusk | `#141f46` | Edges and pressed states on dusk |
| Lamplight | `#fdbe53` (glow `#ffd38a`) | The only accent: primary actions, focus ring, "Open to work" |
| Parchment | `#fdf3dc` | Reading surfaces (panel bodies, plain view) |
| Ink | `#3f2631` | Text and outlines on parchment |

Type: **Pixelify Sans** (display: name, titles, signage) + **Atkinson Hyperlegible** (reading).

## Principles
- One bold element per surface. On the loading screen it's the survey plate.
- "Open to work" is a lit lantern (the plate's symbol for "someone is home"), not a green badge.
- Chrome is dusk, reading is parchment. Never long text on dusk.
- No eyebrows, all-caps labels, middle-dot meta strings or arrows on buttons. Sentence case.
- One page-load moment (the plate's lamps fade up); everything else moves only when the user acts.

## Tried and rejected
- Parchment HUD chips with ink drop shadows: busy on top of the busy game world.
- Violet accent from the old React site: unrelated to the village; replaced by lamplight.
- Green status badge: a third accent colour; replaced by the lantern.

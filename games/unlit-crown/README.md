# The Unlit Crown

A pixel-art action RPG where light is the theme, the main mechanic and the visual style. The game has no drawn art: the world is built in code from simple 3D shapes, rendered at 384×216 and turned into pixel art, with real light and shadow.

## Status: M0, the lighting test

One arena, built to match the style anchor in [docs/concept/](docs/concept/):

- a hooded hero modelled and rigged in Blender, with idle and walk animations, whose lantern is a real shadow-casting light
- two braziers and the floating crown shard, each a real light
- a pixel-art pass: outlines, lit edges, shaded corners and a fixed palette sampled from the style anchor
- a LIGHT meter that reads how lit the hero is from the real lights

## Controls

- WASD or arrow keys: move
- G: open the tuning panel (outlines, edge highlights, palette, saturation, contrast, light strengths)

## Run it

Serve the repo root over HTTP and open `games/unlit-crown/`. Three.js loads from a CDN, so you need to be online.

To rebuild the hero or the prop kit after editing a script:

```bash
blender --background --python games/unlit-crown/art/build_hero.py
```

```bash
blender --background --python games/unlit-crown/art/build_arena_kit.py
```

## Code

| File | What it does |
| --- | --- |
| `src/render.js` | Low-resolution render, edge and palette pass, fixed camera |
| `src/materials.js` | Lit materials with brick and flagstone patterns in screen pixels; glow sprites |
| `src/arena.js` | Generates the arena, lights and effects from a seed, and places kit props |
| `src/props.js` | Loads the prop kit and hands out lit, outlined copies by name |
| `src/hero.js` | Loads the hero model, plays its animations, handles movement, collision and the lantern |
| `art/build_arena_kit.py` | Blender script that builds the prop kit (columns, braziers, urns, skeletons, candles, banners) and exports `assets/arena_kit.glb` |
| `art/build_hero.py` | Blender script that builds the hero and exports `assets/hero.glb`. It also saves an editable `art/hero.blend`, which is not committed because the script recreates it. |
| `src/main.js` | Wiring, input, light meter, tuning panel |

## Design docs

- [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md): the locked look and how a frame is made
- [docs/ART_PROMPTS.md](docs/ART_PROMPTS.md): image prompts for mood boards and targets
- [docs/CAMPAIGN.md](docs/CAMPAIGN.md): the campaign plan

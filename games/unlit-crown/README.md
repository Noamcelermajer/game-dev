# The Unlit Crown

A pixel-art action RPG where light is the theme, the main mechanic and the visual style. The game has no drawn art: the world is built from simple 3D shapes, rendered at 384×216 and turned into pixel art, with real light and shadow.

## Status: M1, first combat

You fight waves of Wax Husks in the arena built for the lighting test.

- **The Ashblade:** a three-hit sword chain, a dodge roll with a moment of invulnerability, stamina, and more damage the lower your health.
- **Wax Husks:** they rise from puddles, close in, and slam after a visible wind-up. Only two attack at once; the rest circle and wait.
- **Light matters:** enemies hit harder and move faster in the dark, and softer near the braziers and your lantern.
- **Feel:** a brief freeze and screen shake on hits, a white flash on enemies, sparks, and sound made in code.
- **The look:** outlines, lit edges, shaded corners and a fixed palette sampled from the style anchor in [docs/concept/](docs/concept/).

## Controls

| Action | Keys |
| --- | --- |
| Move | WASD or arrow keys |
| Attack | J, Z or left click (press again to chain) |
| Roll | Space, K, X, Shift or right click |
| Restart after falling | R or Enter |
| Sound on/off | M |
| Tuning panel | G |

## Run it

Serve the repo root over HTTP and open `games/unlit-crown/`. Three.js and the fonts load from CDNs, so you need to be online.

Run the simulation tests (no browser needed):

```bash
node games/unlit-crown/tests/sim.test.mjs
```

Rebuild a model after editing its script:

```bash
blender --background --python games/unlit-crown/art/build_hero.py
```

```bash
blender --background --python games/unlit-crown/art/build_husk.py
```

```bash
blender --background --python games/unlit-crown/art/build_arena_kit.py
```

## Code

The simulation knows nothing about drawing. It advances in fixed ticks from input commands and reports events; the views draw its state. That split is what will let the same simulation run on a server for co-op.

| File | What it does |
| --- | --- |
| `src/config.js` | Every gameplay number: speeds, timings, damage, stamina |
| `src/sim.js` | The simulation: player and enemy state machines, hits, waves, light level |
| `src/main.js` | Wires input, simulation, views, effects and sound together |
| `src/hero.js` | The hero's view: model, animations by state, the lantern light |
| `src/enemies.js` | Enemy views: model clones, animations, hit flash, attack warnings |
| `src/fx.js` | Sword arcs, sparks, screen shake |
| `src/audio.js` | Sound effects and ambience made with the Web Audio API |
| `src/hud.js` | Health, stamina and light bars, wave banner, messages |
| `src/render.js` | Low-resolution render, edge and palette pass, fixed camera |
| `src/materials.js` | Lit materials with brick and flagstone patterns in screen pixels; glow sprites |
| `src/arena.js` | Generates the arena, lights and effects from a seed, and places kit props |
| `src/props.js` | Loads the prop kit and hands out lit, outlined copies by name |
| `tests/sim.test.mjs` | Simulation tests: movement, combo, roll, enemy attacks, waves, determinism |

## Art

Models are built by Blender scripts and exported as `.glb`. Each script also saves an editable `.blend`, which is not committed because the script recreates it.

| File | What it builds |
| --- | --- |
| `art/rigkit.py` | Shared helpers: parts, bones, animation keys, export |
| `art/build_hero.py` | The hero with eight animations → `assets/hero.glb` |
| `art/build_husk.py` | The Wax Husk with seven animations → `assets/husk.glb` |
| `art/build_arena_kit.py` | Columns, braziers, urns, skeletons, candles, banners → `assets/arena_kit.glb` |

## Design docs

- [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md): the locked look and how a frame is made
- [docs/RESEARCH.md](docs/RESEARCH.md): research on combat design, rendering, audio, assets and tooling, with sources
- [docs/CAMPAIGN.md](docs/CAMPAIGN.md): the campaign plan
- [docs/ART_PROMPTS.md](docs/ART_PROMPTS.md): image prompts for mood boards and targets

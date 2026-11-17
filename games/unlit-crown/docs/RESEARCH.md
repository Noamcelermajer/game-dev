# The Unlit Crown: Development Research

Findings from four research passes run on 17–18 November 2026: free assets, tooling, rendering and architecture, and combat design. Each section says what was adopted and what is still open. Licences and versions were read from the linked pages on those dates; nothing was downloaded, so pack contents are untested.

## 1. Combat design

### Adopted (see `src/config.js`)

| Topic | Decision | Basis |
| --- | --- | --- |
| Attack chain | Three hits: two slashes (about 370 ms and 420 ms) and a finisher (about 580 ms) | Hollow Knight's nail cooldown is 0.41 s [5] |
| Cancel rules | The next attack or a roll may start 100 ms into recovery, never during the active frames | Recommendation |
| Input buffer | 150 ms | Smash Ultimate buffers 9 frames [4] |
| Roll | 350 ms, invulnerable for the first 280 ms, 3.75 units, 25 stamina | Dark Souls 3's medium roll has 433 ms of invulnerability [1] |
| Hit-stop | 50 ms light, 100 ms finisher, 150 ms on a kill, 100 ms when the player is hit | Scale with hit strength [8] |
| Screen shake | Whole pixels only, 1–2 px, strength falls as trauma², aimed along the blow | Eiserloh's model [6]; directional shake [7] |
| Attack warnings | Drawn unlit so darkness never hides them, in a colour nothing else uses, filling until the blow lands | FFXIV and WildStar resolve on the marker [10]; never rely on colour alone [11] |
| Minimum warning | Husk slam: 500 ms | Dark Souls 3 analysis puts signal plus attack at 340 ms minimum [1] |
| Attack permission | At most 2 enemies attack at once; the rest circle at a waiting ring | DOOM 2016 tokens [12]; Kingdoms of Amalur's slot system [15] |
| Low-health bonus | No bonus above 50% HP, rising to +40% damage at 15% HP | Hollow Knight's Fury of the Fallen gives +75% at 1 mask [5] |
| Darkness | Enemy damage ×1.3 in the dark to ×0.85 in full light; speed ×1.25 to ×0.9 | Recommendation: darkness raises danger, it never hides warnings |

### Not yet built

- **Heavy attack:** hold to charge (400 ms minimum, 900 ms full), roll-cancellable while charging.
- **Boss structure:** three phases at 66% and 33% HP, a scripted opener then weighted-random attacks with no immediate repeat, a guaranteed opening after big attacks, and a soft enrage (candles burn down after about 4 minutes).
- **Co-op scaling:** boss HP × (1 + 0.6 × (players − 1)), no damage scaling, one extra attack permission per extra player. Diablo 3 settled near +50% HP per player [13].
- **Light mechanics to try:** husks harden in the dark and soften in light; wisp bolts shrink the lantern for 4 s; minions will not enter brazier light, but the boss targets braziers with wax; the wax shield melts only in strong light.
- **Damage numbers:** a 3×5 px font, at most three on screen, heavy hits only.

## 2. Rendering and architecture

### Adopted

- **Shadows:** the four shadow-casting lights were the largest cost. Shadows now render once per frame instead of once per pass, and the three fixed lights take turns (one per frame) while the lantern updates every frame. In Three.js r160 each `render()` call re-renders every shadow map unless `shadowMap.autoUpdate` is off.
- **Simulation split:** `src/sim.js` is a pure fixed-step simulation (60 ticks per second) driven by commands, with a seeded random generator and plain-data state. It has no Three.js or browser code and runs under Node for tests. This follows "Fix Your Timestep" and the client-server model in Gambetta's articles.
- **Stepped animation:** clips are shown at exact times snapped to whole frames, with hard cuts between clips. `AnimationMixer.setTime()` is avoided because it resets every action's time.
- **Merged props:** every placed prop is merged into one mesh per material (`mergeGeometries`), instead of about 100 separate meshes.
- **Shadow stand-ins:** characters are 20 to 33 separate parts, and drawing each into every shadow map was the largest single cost. Parts now cast nothing; one invisible capsule per character casts instead.
- **Measured result (18 November 2026, one desktop machine, 2 enemies on screen):** draw calls fell from 581 to 314 per frame, and a frame costs about 7.6 ms. Not yet measured on integrated graphics.
- **No ECS library:** hand-rolled state machines fit this scale. bitecs 0.4 (MPL-2.0) loads from a CDN if that changes.

### Not yet built

- **Camera follow without shimmer:** snap the camera to the texel grid along its own right/up axes, render a 1-texel margin (386×218), and shift the upscale by the lost fraction. Needed once arenas are larger than the screen.
- **Batching characters:** each character still costs one draw call per part in the colour and outline passes. Merging a character's parts into one skinned mesh would cut that further. `BatchedMesh` exists from r159 but its API changed in r166.
- **Draw-call budget:** no official figure. Aim for 300–500 across all passes on integrated graphics, measured with `renderer.info.render.calls` and `info.autoReset = false`.
- **Single-pass normals:** possible in r160 with `WebGLMultipleRenderTargets` and patched materials, but untested. The stock `RenderPixelatedPass` uses the same two-pass approach this game does.

### Networking options for co-op

| Option | Notes |
| --- | --- |
| Trystero 0.27 (MIT) | Browser-to-browser, no server to host. Strict home routers can block it, and the host has a latency edge. |
| Colyseus 0.18 | Server holds the state and sends patches every 50 ms. Needs a small server. Its browser bundle loads from a script tag. |
| Plain WebSocket server | Smallest and fully under our control, but rooms and reconnection are ours to write. |

Recommended path: host-authoritative over Trystero first, moving the same `step()` to a Colyseus server if connections fail too often.

## 3. Audio and fonts

### Adopted

- **Sound:** made in code with the Web Audio API in `src/audio.js` (shaped noise bursts and sliding tones, plus a low drone and fire crackle). No audio files and no library.
- **Fonts:** Pixelify Sans (HUD) and Jacquard 12 (titles), both SIL OFL 1.1, loaded from Google Fonts. Loading from the CDN creates no obligation in the repo.

### Available if wanted (not downloaded)

- **ZzFX 1.4** (MIT, about 1 KB): a well-known procedural sound generator that would replace the hand-written synth with a tunable one. It is a single file to copy into the repo.
- **Recorded sound effects, all CC0:**
  - Swishes Sound Pack: https://opengameart.org/content/swishes-sound-pack
  - RPG Sound Pack: https://opengameart.org/content/rpg-sound-pack
  - 37 hits/punches: https://opengameart.org/content/37-hitspunches
  - Kenney Impact Sounds: https://kenney.nl/assets/impact-sounds
  - Stone footsteps: https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud
  - Fire loop: https://freesound.org/people/NickTayloe/sounds/813328/
  - Bell: https://freesound.org/people/SamuelGremaud/sounds/454855/
- **Music, CC0:** "Within The Abandoned Castle" (https://opengameart.org/content/within-the-abandoned-castle) and "Dark Cavern Ambient" (https://opengameart.org/content/dark-cavern-ambient).
- **Small pixel fonts, CC0, self-hosted:** m5x7 (https://managore.itch.io/m5x7) and monogram (https://datagoblin.itch.io/monogram).
- **Reference models, CC0:** KayKit Dungeon Remastered and KayKit Skeletons (https://kaylousberg.itch.io/).
- **Textures, CC0:** ambientCG and Poly Haven, if tiling textures are ever wanted.

### Licence cautions

- "Eternal Sleep" on OpenGameArt is tagged CC0, but the uploader and the credited artist differ, so its rights are unclear. Avoid it.
- Freesound licences are set per sound. Record the URL and date for each one used.
- If any CC-BY item is added, it needs a credit line in a `CREDITS.md`.

## 4. Tooling

| Tool | Use | Status |
| --- | --- | --- |
| Blender MCP | Builds and inspects models in a live Blender | In use |
| glTF-Transform CLI | `inspect` and `validate` for exported `.glb` files | Recommended; needs `npm i -g @gltf-transform/cli` |
| Playwright CLI | Headless screenshots and console checks | Recommended for automated visual tests |
| parallax-threejs plugin | Three.js and shader debugging, visual regression tests | Available in the Claude plugin directory |
| cloudai-x/threejs-skills | Three.js guidance skills (loaders, shaders, performance) | Community, MIT; targets a newer Three.js than this project uses |
| three.js LLM docs | https://threejs.org/llms.txt | Free reference |
| chrome-devtools-mcp | Performance traces | Worth adding when frame-rate problems appear; sends usage statistics unless turned off |

**GitHub Pages:** the simplest route is Settings → Pages → "Deploy from a branch", `main`, `/`. A root `.nojekyll` file stops Jekyll skipping paths that start with `_` or `.`. All asset and module paths must stay relative so each game works from its subfolder.

## Sources

1. https://www.gamedeveloper.com/game-platforms/anatomy-of-an-enemy-attack-in-dark-souls-3
2. https://eldenring.wiki.gg/wiki/Invincibility_Frames
3. https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs
4. https://www.ssbwiki.com/Buffer
5. https://hollowknight.wiki/w/Quick_Slash
6. https://gdcvault.com/play/1023146/Math-for-Game-Programmers-Juicing
7. https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games
8. https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/
9. https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing
10. https://www.akhmorning.com/resources/raiding-fundamentals/
11. https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/
12. https://www.gamedeveloper.com/design/cyber-demons-the-ai-of-doom-2016-
13. https://pcgamer.com/diablo-3-hotfix-removes-monster-damage-boost-in-co-op-inferno-teams-breathe-sigh-of-relief
14. https://warcraft.wiki.gg/wiki/Enrage_(mechanic)
15. http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter28_Beyond_the_Kung-Fu_Circle_A_Flexible_System_for_Managing_NPC_Attacks.pdf
16. https://gafferongames.com/post/fix_your_timestep/
17. https://www.gabrielgambetta.com/client-server-game-architecture.html
18. https://github.com/mrdoob/three.js/blob/r160/src/renderers/webgl/WebGLShadowMap.js
19. https://github.com/KilledByAPixel/ZzFX
20. https://github.com/dmotz/trystero
21. https://colyseus.io/blog/colyseus-018-is-here/

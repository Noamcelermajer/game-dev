# The Unlit Crown: OpenAI Image Prompt Pack

Every prompt below is complete. Copy the whole code block and paste it into ChatGPT or the API. The images are mood boards and comparison targets only: the game renders its pixel art in code (see [ART_DIRECTION.md](ART_DIRECTION.md)).

## Settings

| Use | Size | Quality | Background |
| --- | --- | --- | --- |
| Scenes, regions, boss fights, key art | 1536×1024 (landscape) | high | opaque |
| Character and boss design sheets | 1024×1536 (portrait) | high | opaque |
| Sprites, props, effects | 1024×1024 (square) | high | transparent (PNG) |

The size is shown next to each prompt's title. In ChatGPT, ask for the size in your message if it isn't picked automatically ("landscape", "portrait" or "square").

## Keeping every image consistent

1. Generate **0. Style anchor** until one image nails the look. Save it.
2. For every later prompt, **attach that image** and paste this line before the prompt:
```
Match the art style, pixel density, palette approach and lighting of the attached reference image exactly.
```

---

## 0. Style anchor (generate this first)

**Style anchor** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A circular stone boss arena in a ruined underground temple. In the centre a tiny hooded hero, about one twelfth of the image height, holds up a small handmade lantern that casts a warm orange pool of light with hard stepped rings. Two iron braziers on the arena edge burn amber. On a cracked altar at the top, a floating crown shard emits cold blue-white light that mixes with the warm light on the floor. Pillars cast long shadows away from each light. The floor is dusty slate grey covered in broken stones, old bones, dried wax and small dead plants. Dust motes glow in the light. The edges of the image fall into near-black darkness.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

## 1. Key art and title screen

**Key art** · 1536×1024
```
A high-detail painted fantasy illustration in the style of a premium indie game's cover art: bold silhouettes, dramatic rim lighting, rich painterly texture, strong colour contrast between warm lantern light and cold violet darkness.

A lone hooded traveller with a small handmade lantern stands on a cliff edge at night, seen from behind. Below stretches a vast dark kingdom of tiny lantern-lit cities connected by black roads. In the sky, where the sun should be, hangs an enormous cracked golden crown with seven glowing shards orbiting it. Between the cities rolls a silver-violet mist with faint faces in it. A feeling of awe and loneliness.

Avoid: any text, letters, logos or watermarks, photorealism and a 3D render look.
```

**Title screen** · 1536×1024
```
A high-detail painted fantasy illustration in the style of a premium indie game's cover art: bold silhouettes, dramatic rim lighting, rich painterly texture, strong colour contrast between warm lantern light and cold violet darkness.

A shattered golden crown floats in darkness, each fragment glowing a different colour: amber, cold blue, ink black, wax white, ember red, gold and violet. Beneath it a single small orange flame rises from an open hand. Leave clear empty space in the upper third of the image for a logo.

Avoid: any text, letters, logos or watermarks, photorealism and a 3D render look.
```

## 2. Boss fight screenshots (main fidelity targets)

**Mother Ysolde, the Candlewife** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight in a flooded cathedral where every surface is coated in melted white wax and thousands of small candles burn on ledges. The tiny hero, about one twelfth of the image height, stands on a wax island in black water holding a small orange lantern. The boss towers over them, about six times their height: a gaunt woman partly made of melted wax, dozens of candles burning on her head like a crown, her gown flowing into a lake of wax, cradling a wax-sealed child. Glowing amber rings on the floor mark where hot wax is about to fall. Warm amber light reflects on the black water. Muted ivory and brown base palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Sir Halvard the Unsleeping** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight on top of a stone bell tower at night under cold moonlight. A giant armoured knight, about five times the hero's height, with a bronze bell for a helmet and eyes stitched open, swings a huge bell-clapper mace. Cracks in his armour leak cold blue light. A glowing blue shockwave ring expands from where the mace struck the floor. The tiny hero, about one twelfth of the image height, rolls away holding a small orange lantern. Snow and ice on the stones, muted slate palette, bronze and moon-blue accents.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Ines Marrow, the Cartographer** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight on a floor made of giant unrolled maps in an endless library. Parts of the floor and bookcases are literally erased into blank white paper with sketched outlines at the edges. The boss, a scholar woman about four times the hero's height, floats above the floor in a robe of layered maps, ink-stained hands ending in quills, one eye a brass compass. She is drawing glowing green-gold lines on the floor that become walls. The tiny hero, about one twelfth of the image height, holds a small orange lantern. Muted parchment and ink palette, green-gold lamp light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Choir of Tallow** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight in a monastery hall of tallow-coloured stone. The boss is a towering mass of fused robed monks, about seven times the hero's height, dozens of identical white masks singing, tallow candles growing from its shoulders. Glowing yellow sound-wave arcs ripple outward across the floor. One unmasked face in the centre is crying. The tiny hero, about one twelfth of the image height, holds a small orange lantern. Sickly yellow candlelight, broken stained glass on the floor scattering red light, muted brown base palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Brannoc, the Ember Hound** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight on a grey ash plain beside a burned manor. A huge armoured hound-knight, about five times the hero's height, with glowing ember cracks across black armour, stands protectively over a small grave with a single lantern on it. Embers blow sideways in the wind, scorch marks cover the ash, and a glowing red-orange cone on the ground shows his incoming fire breath. The tiny hero, about one twelfth of the image height, holds a small orange lantern. Muted grey and brown base, ember red and orange light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Gilded Regent** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight in a white and gold throne hall. An elegant old man in gold robes floats on a throne, about four times the hero's height, a crown shard set into his chest. Large mirror panels float around the arena, bouncing beams of blinding white-gold light across the floor; the beams are glowing lines with bloom. The lower half of the arena is in deep indigo darkness where the tiny hero, about one twelfth of the image height, hides with a small orange lantern. Polished marble floor with gold inlay and scattered broken glass.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Hollow Mother** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A boss fight in total darkness. The only light is the tiny hero's small orange flame and a pale little girl glowing softly beside them. Above them looms a colossal feminine silhouette made of silver-violet mist, filling most of the image, her body full of tiny floating glowing memories like stars: a toy, a wedding veil, a burning house. Grey translucent shades drift toward the hero. Silver and violet palette, sad and quiet rather than evil.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Aurel, the Unlit King** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A final boss fight inside an impossible golden throne room whose walls are made of compressed sunlight. An ancient king fused with a shattered golden crown, about six times the hero's height, his body made of cracked sunlight and golden shackles, is chained to a dying white sun behind him. Blinding white rays break through the cracks. The tiny hero, about one twelfth of the image height, carries an orange flame, the only warm colour in the scene. Gold and white palette with deep black cracks.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

## 3. Regions (exploration screenshots)

**Ashgrove (prologue village)** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A small farming village of thatched cottages at the edge of a dark forest during a harvest festival at night. A tall iron lantern tower in the square glows pale gold, windows are lit with rationed candlelight, festival banners and pumpkins line the paths, and beyond the treeline violet mist creeps in. The tiny hero walks the main path with a small orange lantern. Muted green and brown base palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Waxmere** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A flooded gothic city where every surface is coated in melted candle wax. Thousands of candles burn on rooftops and float on still black water. Wax stalactites drip from arches, and small wax-sealed child-sized figures stand in alcoves. A narrow boat carries the tiny hero with a small orange lantern. Warm amber reflections on the water, muted ivory and brown base palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Bellhold** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A massive stone fortress courtyard at night under a cold moon. Exhausted soldiers with hollow eyes stand guard with torches, and a huge bronze bell hangs in a central tower. Ice on the stones, banners showing an open eye. The tiny hero sneaks along a wall with a shuttered lantern. Slate grey palette with moon-blue and bronze light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Inkwell Archive** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A labyrinth of towering bookshelves with floors made of giant unrolled maps. Rivers of ink flow between the shelves, and some sections are erased into blank white paper with sketched edges. Floating reading lamps cast green-gold light, and quiet scholars copy maps at desks. The tiny hero walks between shelves with a small orange lantern. Muted parchment and ink palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Ashen Steppe** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

Endless grey ash plains under a dim red-brown sky, the ruins of a burned manor on a hill, dead trees, and embers blowing sideways in the wind. The tiny hero rides a large ox that carries a lantern pole. Muted grey and brown base palette with ember red and orange light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Saint's Hollow** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

Long candlelit halls of a mountain monastery built from tallow-coloured stone. Rows of robed monks in identical white masks sing in unison, tallow candles melt into the floor, and the stained glass windows have no light behind them. The tiny hero walks among the monks disguised as a pilgrim. Sickly yellow candlelight, muted brown base palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Solace, upper city** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A gleaming white and gold city plaza flooded with bright daylight reflected from giant mirror towers. Nobles in rich clothes, marble fountains, and gold light pipes running along the buildings. The tiny hero, hooded, walks through the crowd. Marble white base palette with white-gold light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Solace, lower city** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A crowded dark city district beneath the upper city. Almost no light except scattered stolen candles and a few thin beams of sunlight leaking down through iron grates. Rebels gather around a tiny fire, laundry hangs between buildings. The tiny hero holds a small orange lantern. Deep indigo base palette.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Hollow (beneath the world)** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

An underground dreamscape of silver-violet mist where half-formed memories float like glowing ghosts: a child's toy, a wedding, a burning house. Each memory glows softly from within and is reflected in still black water. The tiny hero walks a narrow path with a small orange flame. Violet-black base palette with silver light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Lantern Caravan camp (hub)** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A cosy night camp of wagons arranged in a circle in the dark wilderness, brass lanterns on poles, a central campfire, a blacksmith's anvil, a merchant's stall, and people talking around the fire. The camp is the only light for miles. The tiny hero stands by the fire. Muted brown and green base palette with warm amber light.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

## 4. Classes (design sheets)

**Ashblade** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A character design sheet for a pixel art action RPG hero: a lean warrior in scorched leather armour wielding a greatsword whose blade is cracked and glowing like a coal from inside, bandaged arms with burn scars, embers rising from the blade. Show the character large in the centre in a three-quarter front view, with a small front, side and back view underneath, on a plain dark background with soft light from the upper left. Colour accents come only from the character's light source.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Warden-Knight** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A character design sheet for a pixel art action RPG hero: a heavy knight in dented plate armour carrying a large polished mirror shield reflecting a beam of warm light, a half cape and a small lantern hanging from the belt. Show the character large in the centre in a three-quarter front view, with a small front, side and back view underneath, on a plain dark background with soft light from the upper left. Colour accents come only from the character's light source.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Wickpriest** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A character design sheet for a pixel art action RPG hero: a robed healer with a tall staff topped by a candle in a glass cage, threads of golden light flowing from their fingers, wax seals on the robe, a gentle expression. Show the character large in the centre in a three-quarter front view, with a small front, side and back view underneath, on a plain dark background with soft light from the upper left. Colour accents come only from the character's light source.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Cinder Arcanist** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A character design sheet for a pixel art action RPG hero: a young mage with a heat-cracked bronze gauntlet on one arm, orbiting fire glyphs, the air shimmering around them, singed coat tails. Show the character large in the centre in a three-quarter front view, with a small front, side and back view underneath, on a plain dark background with soft light from the upper left. Colour accents come only from the character's light source.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Gloamwalker** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A character design sheet for a pixel art action RPG hero: a hooded rogue half dissolved into violet shadow, two curved daggers, glowing silver eyes, a snuffed-out lantern hanging from the hip. Show the character large in the centre in a three-quarter front view, with a small front, side and back view underneath, on a plain dark background with soft light from the upper left. Colour accents come only from the character's light source.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Lampwright** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A character design sheet for a pixel art action RPG hero: an engineer with goggles and a backpack of brass lanterns and gears, a small deployable lantern turret beside them, a tool belt and a soot-stained apron. Show the character large in the centre in a three-quarter front view, with a small front, side and back view underneath, on a plain dark background with soft light from the upper left. Colour accents come only from the character's light source.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Party lineup** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

The six heroes gathered around a campfire in deep darkness: a warrior with a cracked glowing greatsword, a knight with a mirror shield, a priest with a candle staff, a mage with a heat-cracked bronze gauntlet, a hooded shadow rogue with two daggers, and an engineer with a backpack of brass lanterns. The firelight is the only light, and violet mist surrounds them.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

## 5. Boss design sheets

Use these to get each boss's anatomy before splitting it into parts for animation.

**Mother Ysolde, the Candlewife** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: a gaunt woman partly made of melted white wax, dozens of candles burning on her head like a crown, her long gown flowing into a pool of wax, cradling a wax-sealed child, tears of wax on her cheeks, loving and terrifying, warm amber glow. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Sir Halvard the Unsleeping** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: a giant armoured knight with a bronze bell for a helmet and eyes stitched open, holding a huge bell-clapper mace, cracks in his armour leaking cold blue light, exhausted yet relentless posture. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Ines Marrow, the Cartographer** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: a scholar woman floating in a robe made of layered maps, ink-stained hands that end in quills, one eye replaced by a brass compass, giant brass measuring instruments orbiting her, parts of her body erased into blank white paper. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Choir of Tallow** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: a towering mass of robed monks fused into one body, dozens of identical white masks singing, tallow candles growing from its shoulders, hands holding hymn books, a single unmasked crying face in the centre, sickly yellow candlelight. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Brannoc, the Ember Hound** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: a huge armoured hound-knight in burned black armour with glowing ember cracks across his body, sad loyal eyes, curled protectively around a small grave with a single lantern, ash falling around him, red-orange glow. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Gilded Regent** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: an elegant old man in flowing gold robes seated on a floating throne, a glowing crown shard set into his chest, surrounded by floating mirror panels and chained lantern orbs, a cold paternal smile, blinding white-gold light. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**The Hollow Mother** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: a colossal feminine silhouette made of silver-violet mist and darkness, her body full of tiny floating glowing memories like stars (a toy, a wedding veil, a burning house), weeping light, two faint white eyes, vast and sorrowful rather than evil. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Aurel, the Unlit King** · 1024×1536
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A boss design sheet for a pixel art action RPG: an ancient king fused with a shattered golden crown, his body made of cracked sunlight and golden shackles, chained to a dying white sun behind him, blinding rays breaking through the cracks, regal and desperate. Show the boss large in the centre facing the viewer, and around it separate close-ups of its head, its weapon or signature body part, and its main glowing effect, each clearly separated on a plain dark background so the parts can be cut out.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

## 6. Sprites, enemies, props and effects (transparent background)

These are shape and colour references for the code-built models, not game assets.

**Hero sprite sheet** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A pixel art sprite sheet on a transparent background for a small hooded hero holding a lantern, drawn small and simple for a top-down game. Rows: idle, walk down, walk up, walk to the side, attack, dodge roll, hurt. Every frame sits on an even grid with the same proportions and the same light direction from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

### Enemy sheets

**Enemies: Ashgrove** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: mist-bodied hollow wolves, a scarecrow with a dead lantern for a head, pale ghost moths, and a feral villager holding a broken torch. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: Waxmere** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: drowned figures made of wax with melting faces, crabs with candles on their shells, floating wick wisps, and a wax golem holding a church door as a shield. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: Bellhold** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: sleepless soldiers with wide open eyes, robed bell-ringer acolytes, nightmare hounds made of dream smoke, and a two-person ballista crew. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: Inkwell Archive** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: ink slimes, wraiths made of erased blank paper, moths with quill tails, and a bookcase mimic with teeth. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: Ashen Steppe** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: ash hyenas, burned-out lantern knights, ember vultures, and a cinder elemental. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: Saint's Hollow** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: masked choir monks, tallow saint statues that walk, floating silence-bells, and fused twin acolytes. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: Solace** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: gilded guards with mirror shields, light-tax collectors carrying lantern cages, sunlight constructs, and dark district rebels with slings. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Enemies: The Hollow** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

Four enemy designs for a top-down pixel art action RPG on a transparent background, each separated with clear empty space: memory phantoms, weeping grief shades, shadow copies of a hooded hero, and a small nameless child shade. All lit from the same direction.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

### Prop sheets

**Props: Ashgrove** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Ashgrove area of the game: a thatched cottage, a well, hay bales, pumpkins, a festival banner pole, a broken cart, a fence section, a small iron street lantern, a scarecrow, and a stack of firewood. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: Waxmere** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Waxmere area of the game: candle clusters of several sizes, wax-covered crates, a melted church pew, a floating candle raft, wax stalagmites, a wax-sealed child statue, broken stained glass, and a mooring post with a lantern. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: Bellhold** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Bellhold area of the game: a weapon rack, a brazier, sandbags, a small bronze bell on a frame, an iron portcullis section, an icy barrel, a soldier's cot, and an open-eye banner. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: Inkwell Archive** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Inkwell Archive area of the game: tall bookshelves, a reading desk with a green lamp, stacks of books, a globe, an ink well, rolled maps, a ladder, and a brass telescope. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: Ashen Steppe** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Ashen Steppe area of the game: a dead tree, a burned wagon, an ash-covered gravestone with a lantern, scattered bones, a broken windmill, rocks, a ruined wall, and a cracked banner. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: Saint's Hollow** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Saint's Hollow area of the game: a pew, a tall candle stand dripping tallow, a lectern with a hymn book, a broken stained glass window, a prayer mat, an incense burner, a saint statue, and a bell rope. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: Solace** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the Solace area of the game: a marble fountain, a mirror tower base, a gold light pipe section, a market stall, a noble's bench, an iron street grate, a rebel barricade, and a stolen candle shrine. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

**Props: The Hollow** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A top-down pixel art prop sheet on a transparent background for the The Hollow area of the game: a floating child's toy, a ghostly wedding arch, a half-burned doorway, a mist pool, a floating chair, a glowing memory orb, a broken mirror, and a cradle. Each prop is separated on an even grid and lit from the upper left.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

### Effects

**Spell and attack effects** · 1024×1024, transparent
```
Chunky low-resolution pixel art for a modern high-end top-down action RPG, with large crisp square pixels that are all the same size, clean dark outlines and a single light direction from the upper left. Muted, desaturated base colours; saturated colour only on glowing parts, magic and light sources. Dark, melancholic fantasy mood.

A pixel art visual effects sheet on a transparent background: a fire slash arc, a cold blue shockwave ring, an amber ground warning circle, a violet shadow burst, a golden healing beam, an explosion of embers, a beam of white mirror light and a splash of melted wax. Bright saturated colours with a glowing core, arranged in a grid.

Avoid: blurry or smeared pixels, mixed pixel sizes, smooth airbrushed gradients on sprites, photorealism, a 3D render look, and any text, letters, logos, watermarks or UI.
```

## 7. UI (HUD mockup)

**HUD mockup** · 1536×1024
```
A screenshot from a modern high-end pixel art action RPG. Chunky low-resolution pixel art, as if the whole image were drawn at about 384×216 pixels and scaled up five times, with large crisp square pixels that are all the same size, viewed from a steep top-down three-quarter camera. The ground is a muted, desaturated base colour covered in dense hand-placed detail: cracks, debris, bones, small plants and scattered props. All saturated colour comes from light and magic: glowing lanterns, spells and attack telegraphs, with soft bloom around light sources while the sprites stay crisp. Dynamic lighting with hard stepped light falloff, cast shadows from props and characters, dust and embers drifting in the light, and a heavy dark vignette pulling the eye to a lit centre. Dark, melancholic fantasy mood.

A full gameplay screenshot during a boss fight in a wax-covered cathedral, showing the game's UI. Top left: a health bar shaped like a melting candle and a lantern-shaped light gauge, both in small ornate pixel frames. Bottom centre: four skill icons with cooldown sweeps. Along the bottom edge: a long thin boss health bar with the name "MOTHER YSOLDE" in a small pixel font. The UI is minimal and does not cover the arena.

Avoid: blurry or smeared pixels, mixed pixel sizes, photorealism, a 3D render look, logos and watermarks. The only text in the image is the boss name.
```

## Regional palette guide

| Region | Base (muted) | Light accent (saturated) |
| --- | --- | --- |
| Ashgrove | moss green, bark brown | pale gold, violet mist |
| Waxmere | ivory, black water | amber |
| Bellhold | slate grey | moon blue, bronze |
| Inkwell | parchment, ink black | green-gold |
| Ashen Steppe | ash grey, brown | ember red, orange |
| Saint's Hollow | tallow brown | sickly yellow, stained-glass red |
| Solace | marble white, indigo | white gold, mirror silver |
| The Hollow | violet-black | silver, memory white |
| Crown | deep black cracks | blinding gold, white |

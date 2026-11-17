// The Kindled: a rigged model built in Blender (art/build_hero.py -> assets/hero.glb).
// The game swaps in its own lit materials, plays Idle/Walk in stepped frames,
// and hangs a real light on the lantern.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { stoneMaterial, glowSprite } from './materials.js';
import { LAYER_FX } from './render.js';

const ANIM_FPS = 12;
// parts too thin to survive a 1 px outline: drawn without one
const NO_OUTLINE = /^(lantern_|scabbard|sword_|buckle)/;
// parts that would block the lantern's own light
const NO_SHADOW = /^(lantern_|arm_R|hand_R)/;

export async function createHero() {
  const gltf = await new GLTFLoader().loadAsync(new URL('../assets/hero.glb', import.meta.url).href);
  const model = gltf.scene;

  const mats = new Map();
  model.traverse((o) => {
    if (!o.isMesh) return;
    const src = o.material;
    if (src.name.startsWith('glow')) {
      o.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc050).multiplyScalar(3.4) });
      o.layers.set(LAYER_FX);
      return;
    }
    if (!mats.has(src.name)) mats.set(src.name, stoneMaterial({ color: src.color, noise: 0, glow: 0.3 }));
    o.material = mats.get(src.name);
    o.castShadow = !NO_SHADOW.test(o.name);
    o.receiveShadow = true;
    if (NO_OUTLINE.test(o.name)) o.layers.set(LAYER_FX);
  });

  model.scale.setScalar(1.2);                               // about 25 px tall on screen
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.add(model);
  group.add(body);

  // the lantern bone points down from the hand; the flame sits partway along it
  const lanternBone = model.getObjectByName('lantern');
  const glow = glowSprite(0xff8a28, 2.6, 0.5);
  glow.position.set(0, 0.33, 0);
  const light = new THREE.PointLight(0xff8c2c, 50, 0, 2);
  light.position.set(0, 0.33, 0);
  light.castShadow = true;
  light.userData = { base: 50, kind: 'lantern' };
  lanternBone.add(glow, light);

  const mixer = new THREE.AnimationMixer(model);
  const clips = Object.fromEntries(gltf.animations.map((c) => [c.name, mixer.clipAction(c)]));
  let current = null;
  let animTime = 0;
  function play(name) {
    if (current === name || !clips[name]) return;
    if (current) clips[current].stop();
    clips[name].play();
    current = name;
    animTime = 0;
  }
  play('Idle');

  const state = { x: 0, z: 2.2, facing: Math.PI, moving: false };
  group.position.set(state.x, 0, state.z);
  body.rotation.y = state.facing;

  function collide(x, z, world) {
    const maxR = world.floorRadius - 0.45;
    const d = Math.hypot(x, z);
    if (d > maxR) { x *= maxR / d; z *= maxR / d; }
    for (const o of world.obstacles) {
      if (o.rect) {
        const [x0, x1, z0, z1] = o.rect;
        if (x > x0 && x < x1 && z > z0 && z < z1) z = z1;
      } else {
        const dx = x - o.x, dz = z - o.z, dd = Math.hypot(dx, dz), min = o.r + 0.3;
        if (dd < min && dd > 1e-4) { x = o.x + (dx / dd) * min; z = o.z + (dz / dd) * min; }
      }
    }
    return [x, z];
  }

  function update(dt, t, input, world) {
    const mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const mz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    state.moving = mx !== 0 || mz !== 0;
    if (state.moving) {
      const len = Math.hypot(mx, mz);
      const speed = 4.2;
      [state.x, state.z] = collide(state.x + (mx / len) * speed * dt, state.z + (mz / len) * speed * dt, world);
      const want = Math.atan2(mx, mz);
      let diff = want - state.facing;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      state.facing += diff * Math.min(1, dt * 14);
    }
    group.position.set(state.x, 0, state.z);
    body.rotation.y = state.facing;

    // animation advances in whole frames, like hand-drawn sprites
    play(state.moving ? 'Walk' : 'Idle');
    animTime += dt;
    mixer.setTime(Math.floor(animTime * ANIM_FPS) / ANIM_FPS);

    const tq = Math.floor(t * ANIM_FPS) / ANIM_FPS;
    const f = 0.92 + 0.06 * Math.sin(tq * 8.3) + 0.04 * Math.sin(tq * 19.7);
    light.intensity = light.userData.base * f;
    glow.material.opacity = 0.5 * f;
  }

  return {
    group, light, state, update,
    chest: () => new THREE.Vector3(state.x, 0.95, state.z),
    get animation() { return current; },
  };
}

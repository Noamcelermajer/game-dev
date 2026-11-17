// The hero's view: a rigged model built in Blender (art/build_hero.py -> assets/hero.glb).
// It only draws what the simulation says: position, facing, and the animation for the
// current state. The lantern carries a real light.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { stoneMaterial, glowSprite, shadowProxy } from './materials.js';
import { LAYER_FX } from './render.js';
import { ATTACKS, ROLL, PLAYER } from './config.js';

// parts too thin to survive a 1 px outline: drawn without one
const NO_OUTLINE = /^(lantern_|scabbard|sword_|buckle)/;
const GLOW = {
  glow_lantern: new THREE.Color(0xffc050).multiplyScalar(3.4),
  glow_ember: new THREE.Color(1, 0.42, 0.1).multiplyScalar(2.6),
};

// Plays clips at an exact time, snapped to whole frames so motion looks hand-drawn.
export function makeAnimator(root, animations) {
  const mixer = new THREE.AnimationMixer(root);
  const actions = Object.fromEntries(animations.map((c) => [c.name, mixer.clipAction(c)]));
  let current = null;
  return {
    names: Object.keys(actions),
    get current() { return current; },
    // time in seconds, or use progress 0..1 for one-shot clips
    show(name, { time = 0, progress = null, fps = 12 } = {}) {
      const a = actions[name];
      if (!a) return;
      if (current !== name) { if (current) actions[current].stop(); a.reset().play(); current = name; }
      const d = a.getClip().duration;
      let t = progress !== null ? Math.min(Math.max(progress, 0), 0.999) * d : time % d;
      t = Math.floor(t * fps) / fps;
      a.time = Math.min(t, d - 1e-4);
      mixer.update(0);
    },
  };
}

export async function createHeroView() {
  const gltf = await new GLTFLoader().loadAsync(new URL('../assets/hero.glb', import.meta.url).href);
  const model = gltf.scene;

  const mats = new Map();
  model.traverse((o) => {
    if (!o.isMesh) return;
    const src = o.material;
    if (GLOW[src.name]) {
      o.material = new THREE.MeshBasicMaterial({ color: GLOW[src.name] });
      o.layers.set(LAYER_FX);
      return;
    }
    if (!mats.has(src.name)) mats.set(src.name, stoneMaterial({ color: src.color, noise: 0, glow: 0.3 }));
    o.material = mats.get(src.name);
    o.castShadow = false;                                   // the shadow proxy casts for the whole body
    o.receiveShadow = true;
    if (NO_OUTLINE.test(o.name)) o.layers.set(LAYER_FX);
  });

  model.scale.setScalar(1.2);                               // about 25 px tall on screen
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.add(model);
  const proxy = shadowProxy(0.3, 1.75);
  group.add(body, proxy);

  // the lantern bone points down from the hand; the flame sits partway along it
  const lanternBone = model.getObjectByName('lantern');
  const glow = glowSprite(0xff8a28, 2.6, 0.5);
  glow.position.set(0, 0.33, 0);
  const light = new THREE.PointLight(0xff8c2c, PLAYER.lanternPower, 0, 2);
  light.position.set(0, 0.33, 0);
  light.castShadow = true;
  light.userData = { base: PLAYER.lanternPower, kind: 'lantern' };
  lanternBone.add(glow, light);

  const anim = makeAnimator(model, gltf.animations);

  // p: the simulation's player; t: seconds of view time
  function sync(p, t) {
    group.position.set(p.x, 0, p.z);
    body.rotation.y = p.facing;

    switch (p.state) {
      case 'walk': anim.show('Walk', { time: p.stateT }); break;
      case 'attack': {
        const a = ATTACKS[p.combo];
        anim.show(a.clip, { progress: p.stateT / (a.windup + a.active + a.recover), fps: 30 });
        break;
      }
      case 'roll': anim.show('Roll', { progress: p.stateT / ROLL.duration, fps: 30 }); break;
      case 'hurt': anim.show('Hurt', { progress: p.stateT / PLAYER.hurtStun, fps: 24 }); break;
      case 'dead': anim.show('Die', { progress: p.stateT / 0.8, fps: 15 }); break;
      default: anim.show('Idle', { time: t });
    }

    // blink while invulnerable after a hit (not during a roll, where the tumble already reads)
    const blinking = p.iframes > 0 && p.state !== 'roll' && p.state !== 'dead' && p.state !== 'hurt';
    model.visible = !(blinking && Math.floor(t * 16) % 2 === 0);
    proxy.scale.y = p.state === 'dead' ? Math.max(0.2, 1 - p.stateT * 1.6) : p.state === 'roll' ? 0.55 : 1;

    const tq = Math.floor(t * 12) / 12;
    const f = 0.92 + 0.06 * Math.sin(tq * 8.3) + 0.04 * Math.sin(tq * 19.7);
    const alive = p.state === 'dead' ? Math.max(0.15, 1 - p.stateT * 1.2) : 1;   // the lantern gutters when the hero falls
    light.intensity = light.userData.base * f * alive;
    glow.material.opacity = 0.5 * f * alive;
  }

  return { group, light, sync, get animation() { return anim.current; } };
}

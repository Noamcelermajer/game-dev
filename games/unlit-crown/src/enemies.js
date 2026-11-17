// Enemy views. One Blender-built model per kind (assets/husk.glb), cloned per enemy.
// Like the hero view, this only draws what the simulation reports.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { stoneMaterial, glowSprite, shadowProxy } from './materials.js';
import { LAYER_FX } from './render.js';
import { makeAnimator } from './hero.js';
import { sectorGeometry } from './fx.js';
import { HUSK } from './config.js';

const FX_PARTS = /^(eye_|mouth|wick|flame)/;                 // tiny: no outline, no shadow
const FLASH = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.95, 0.85).multiplyScalar(2.5) });
// attack warnings use one reserved colour, drawn unlit so darkness never hides them
// (a hot pink-red that nothing else in the palette uses; a warm red vanishes on firelit stone)
const WARN_EDGE = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9de').multiplyScalar(1.6), depthWrite: false, side: THREE.DoubleSide });
const WARN_FILL = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff4d6a').multiplyScalar(1.25), transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });

export async function createEnemyViews(scene) {
  const gltf = await new GLTFLoader().loadAsync(new URL('../assets/husk.glb', import.meta.url).href);
  const mats = new Map();
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const name = o.material.name;
    if (!mats.has(name)) {
      mats.set(name, name.startsWith('glow')
        ? new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.78, 0.36).multiplyScalar(3) })
        : stoneMaterial({ color: o.material.color, noise: 0.2, glow: 0.1 }));
    }
    o.material = mats.get(name);
    const fx = FX_PARTS.test(o.name) || name.startsWith('glow');
    o.castShadow = false;                                   // the shadow proxy casts for the whole body
    o.receiveShadow = !fx;
    if (fx) o.layers.set(LAYER_FX);
  });

  const warnEdge = sectorGeometry(HUSK.range - 0.1, HUSK.range, HUSK.arc, 14);
  const warnFill = sectorGeometry(0.3, HUSK.range - 0.16, HUSK.arc, 14);
  const views = new Map();

  function create() {
    const model = gltf.scene.clone(true);
    model.scale.setScalar(1.15);
    const meshes = [];
    model.traverse((o) => { if (o.isMesh) meshes.push({ mesh: o, base: o.material }); });
    const group = new THREE.Group();
    group.add(model);
    const wickGlow = glowSprite(0xffa040, 1.5, 0.4);
    wickGlow.position.set(0, 2.1, -0.1);
    group.add(wickGlow);
    const proxy = shadowProxy(0.38, 1.9);
    group.add(proxy);

    const warn = new THREE.Group();                          // lies on the floor, turned to the attack direction
    const edge = new THREE.Mesh(warnEdge, WARN_EDGE);
    const fill = new THREE.Mesh(warnFill, WARN_FILL);
    edge.layers.set(LAYER_FX); fill.layers.set(LAYER_FX);
    warn.add(edge, fill);
    warn.position.y = 0.04;
    warn.visible = false;
    scene.add(group, warn);
    return { group, model, meshes, warn, fill, wickGlow, proxy, anim: makeAnimator(model, gltf.animations), flashing: false };
  }

  function remove(v) { scene.remove(v.group, v.warn); }

  function sync(enemies, t) {
    const seen = new Set();
    for (const e of enemies) {
      seen.add(e.id);
      let v = views.get(e.id);
      if (!v) { v = create(); views.set(e.id, v); }
      v.group.position.set(e.x, 0, e.z);
      v.group.rotation.y = e.state === 'windup' || e.state === 'attack' || e.state === 'recover' ? e.aim : e.facing;

      switch (e.state) {
        case 'rise': v.anim.show('Rise', { progress: e.stateT / HUSK.rise, fps: 18 }); break;
        case 'windup': v.anim.show('Windup', { progress: e.stateT / HUSK.windup, fps: 18 }); break;
        case 'attack': v.anim.show('Attack', { progress: (e.stateT / HUSK.active) * 0.3, fps: 30 }); break;
        case 'recover': v.anim.show('Attack', { progress: 0.3 + Math.min(1, e.stateT / HUSK.recover) * 0.7, fps: 18 }); break;
        case 'hurt': v.anim.show('Hurt', { progress: e.stateT / HUSK.hurtStun, fps: 24 }); break;
        case 'dead': v.anim.show('Die', { progress: e.stateT / HUSK.die, fps: 18 }); break;
        default: v.anim.show(e.moving ? 'Walk' : 'Idle', { time: t + e.id * 0.37 });
      }

      // white flash on being hit
      const flash = e.flash > 0;
      if (flash !== v.flashing) {
        for (const m of v.meshes) m.mesh.material = flash ? FLASH : m.base;
        v.flashing = flash;
      }
      v.wickGlow.visible = e.state !== 'dead';
      v.proxy.scale.y = e.state === 'dead' ? Math.max(0.1, 1 - e.stateT / HUSK.die) : e.state === 'rise' ? Math.max(0.1, e.stateT / HUSK.rise) : 1;

      // attack warning: the outline shows the area, the fill grows until the blow lands
      const warning = e.state === 'windup';
      v.warn.visible = warning;
      if (warning) {
        v.warn.position.set(e.x, 0.04, e.z);
        v.warn.rotation.y = e.aim;
        const k = Math.max(0.05, Math.min(1, e.stateT / HUSK.windup));
        v.fill.scale.set(k, 1, k);
      }
    }
    for (const [id, v] of views) if (!seen.has(id)) { remove(v); views.delete(id); }
  }

  return { sync, get count() { return views.size; } };
}

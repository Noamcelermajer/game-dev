// The arena prop kit, modelled in Blender (art/build_arena_kit.py -> assets/arena_kit.glb).
// Props are looked up by object name; their materials are replaced by name with the game's own.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { stoneMaterial } from './materials.js';
import { LAYER_FX } from './render.js';

// fx: too thin or small for an outline, so drawn on the effects layer and casting no shadow
const SPEC = {
  stone: { color: '#6c6478', pattern: 'course' },
  iron: { color: '#3a302c', noise: 0.3 },
  iron_thin: { color: '#3a302c', noise: 0, fx: true },
  bone: { color: '#d8d2c0', noise: 0.2, glow: 0.06, fx: true },
  wax: { color: '#e8dcc0', noise: 0, glow: 0.14, fx: true },
  clay: { color: '#8a5230', noise: 0.5 },
  dark: { color: '#120c10', noise: 0, fx: true },
  wood: { color: '#3a2a22', noise: 0, fx: true },
  cloth: { color: '#8e1a30', noise: 0.25, glow: 0.1 },
  cloth_dark: { color: '#561224', noise: 0.25, glow: 0.1 },
  gold: { color: '#c9963a', noise: 0, glow: 0.2, fx: true },
};
const GLOW = {
  glow_flame: new THREE.Color(1, 0.8, 0.4).multiplyScalar(3.2),
  glow_coal: new THREE.Color(1, 0.36, 0.06).multiplyScalar(1.7),
};

export async function loadKit() {
  const gltf = await new GLTFLoader().loadAsync(new URL('../assets/arena_kit.glb', import.meta.url).href);
  const sources = new Map(gltf.scene.children.map((o) => [o.name, o]));
  const cache = new Map();

  function materialFor(name, tint) {
    const key = `${name}|${tint ?? ''}`;
    if (cache.has(key)) return cache.get(key);
    let m;
    if (GLOW[name]) {
      m = new THREE.MeshBasicMaterial({ color: GLOW[name] });
    } else {
      const s = SPEC[name] ?? SPEC.stone;
      const color = new THREE.Color(s.color);
      if (tint) color.multiply(new THREE.Color(tint));
      m = stoneMaterial({ color, pattern: s.pattern ?? 'plain', noise: s.noise ?? 1, glow: s.glow ?? 0 });
    }
    cache.set(key, m);
    return m;
  }

  // place('pillar', { x, y, z, rot, scale, tint }) -> a new object ready to add to the scene
  function place(name, { x = 0, y = 0, z = 0, rot = 0, scale = 1, tint = null } = {}) {
    const src = sources.get(name);
    if (!src) throw new Error(`No prop named "${name}" in the kit`);
    const ob = src.clone(true);
    ob.position.set(x, y, z);
    ob.rotation.set(0, rot, 0);
    ob.scale.setScalar(scale);
    ob.traverse((o) => {
      if (!o.isMesh) return;
      const matName = o.material.name;
      const fx = Boolean(GLOW[matName]) || Boolean(SPEC[matName]?.fx);
      o.material = materialFor(matName, tint);
      o.castShadow = !fx;
      o.receiveShadow = !GLOW[matName];
      if (fx) o.layers.set(LAYER_FX);
    });
    return ob;
  }

  // Static props are cheap to place but costly to draw one by one, because every mesh is
  // redrawn for each pass and each shadow. add() queues a prop; build() merges everything
  // queued into one mesh per material.
  const buckets = new Map();
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
  function add(name, { x = 0, y = 0, z = 0, rot = 0, scale = 1, tint = null, cast = true } = {}) {
    const src = sources.get(name);
    if (!src) throw new Error(`No prop named "${name}" in the kit`);
    M.compose(new THREE.Vector3(x, y, z), Q.setFromAxisAngle(UP, rot), new THREE.Vector3(scale, scale, scale));
    src.traverse((o) => {
      if (!o.isMesh) return;
      const matName = o.material.name;
      const fx = Boolean(GLOW[matName]) || Boolean(SPEC[matName]?.fx);
      const key = `${matName}|${tint ?? ''}|${cast && !fx}`;
      if (!buckets.has(key)) buckets.set(key, { matName, tint, fx, cast: cast && !fx, parts: [] });
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const attr of Object.keys(g.attributes)) if (attr !== 'position' && attr !== 'normal') g.deleteAttribute(attr);
      const local = o === src ? M : M.clone().multiply(o.matrix);
      buckets.get(key).parts.push(g.applyMatrix4(local));
    });
  }
  function build() {
    const group = new THREE.Group();
    for (const b of buckets.values()) {
      const mesh = new THREE.Mesh(mergeGeometries(b.parts), materialFor(b.matName, b.tint));
      mesh.castShadow = b.cast;
      mesh.receiveShadow = !GLOW[b.matName];
      if (b.fx) mesh.layers.set(LAYER_FX);
      group.add(mesh);
      for (const p of b.parts) p.dispose();
    }
    buckets.clear();
    return group;
  }

  return { place, add, build, names: [...sources.keys()] };
}

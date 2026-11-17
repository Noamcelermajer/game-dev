// Combat effects: sword arcs, hit sparks and screen shake. All unlit and on the effects
// layer, so they stay bright and get no outline.
import * as THREE from 'three';
import { LAYER_FX, PX_PER_UNIT } from './render.js';

// A flat piece of ring on the floor plane, centred on "forward" (+z before rotation).
// Rotate the mesh about Y by a facing angle to aim it.
export function sectorGeometry(r0, r1, arc, segs = 12) {
  const pos = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const a = -arc / 2 + (arc * i) / segs;
    pos.push(Math.sin(a) * r0, 0, Math.cos(a) * r0, Math.sin(a) * r1, 0, Math.cos(a) * r1);
    if (i < segs) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// A blade-shaped arc: thickest in the middle, tapering to points at both ends.
export function crescentGeometry(radius, arc, width, segs = 16) {
  const pos = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs, a = -arc / 2 + arc * u;
    const r0 = radius - width * Math.sin(Math.PI * u) ** 0.7;
    pos.push(Math.sin(a) * r0, 0, Math.cos(a) * r0, Math.sin(a) * radius, 0, Math.cos(a) * radius);
    if (i < segs) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

export function createFx(scene, camera) {
  // --- sword arcs ----------------------------------------------------------------
  const arcs = [];
  const arcGeo = new Map();
  function swing({ x, z, facing, range, arc, heavy }) {
    const key = `${range}|${arc}`;
    if (!arcGeo.has(key)) arcGeo.set(key, crescentGeometry(range, arc, range * 0.24));
    const mat = new THREE.MeshBasicMaterial({
      color: heavy ? new THREE.Color(1, 0.92, 0.7).multiplyScalar(3.4) : new THREE.Color(1, 0.86, 0.6).multiplyScalar(3),
      transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(arcGeo.get(key), mat);
    m.position.set(x, 0.7, z);
    m.rotation.y = facing;
    m.layers.set(LAYER_FX);
    m.visible = false;
    scene.add(m);
    arcs.push({ m, mat, age: -(heavy ? 0.167 : 0.1), life: heavy ? 0.14 : 0.11 });   // appears as the blow lands
  }

  // --- sparks -------------------------------------------------------------------
  const MAX = 96;
  const sp = { pos: new Float32Array(MAX * 3), vel: new Float32Array(MAX * 3), life: new Float32Array(MAX), next: 0 };
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(sp.pos, 3));
  const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({
    color: new THREE.Color(1, 0.8, 0.45).multiplyScalar(2.5), size: 1, sizeAttenuation: false, depthWrite: false,
  }));
  sparks.frustumCulled = false;
  sparks.layers.set(LAYER_FX);
  scene.add(sparks);
  sp.pos.fill(-999);
  function burst(x, y, z, nx, nz, count, speed) {
    for (let i = 0; i < count; i++) {
      const k = sp.next; sp.next = (sp.next + 1) % MAX;
      const a = Math.random() * 6.283, s = speed * (0.4 + Math.random() * 0.8);
      sp.pos[k * 3] = x; sp.pos[k * 3 + 1] = y; sp.pos[k * 3 + 2] = z;
      sp.vel[k * 3] = nx * speed * 0.7 + Math.cos(a) * s * 0.6;
      sp.vel[k * 3 + 1] = 1.5 + Math.random() * 3;
      sp.vel[k * 3 + 2] = nz * speed * 0.7 + Math.sin(a) * s * 0.6;
      sp.life[k] = 0.18 + Math.random() * 0.2;
    }
  }

  // --- screen shake: whole pixels only, strength falls off as trauma squared --------------
  const base = camera.position.clone();
  const right = new THREE.Vector3(), up = new THREE.Vector3();
  camera.updateMatrixWorld();
  right.setFromMatrixColumn(camera.matrixWorld, 0);
  up.setFromMatrixColumn(camera.matrixWorld, 1);
  let trauma = 0, maxPx = 0, dirX = 0, dirZ = 0;
  function shake(px, nx = 0, nz = 0) {
    trauma = Math.min(1, trauma + 0.6);
    maxPx = Math.max(maxPx, px);
    dirX = nx; dirZ = nz;
  }

  function update(dt) {
    for (let i = arcs.length - 1; i >= 0; i--) {
      const a = arcs[i];
      a.age += dt;
      if (a.age < 0) continue;
      a.m.visible = true;
      const k = a.age / a.life;
      a.mat.opacity = k < 0.6 ? 1 : 0.45;                     // two hard steps, no soft fade
      a.m.scale.setScalar(1 + 0.06 * Math.floor(k * 3));      // the arc pushes outward as it fades
      if (k >= 1) { scene.remove(a.m); a.mat.dispose(); arcs.splice(i, 1); }
    }
    for (let k = 0; k < MAX; k++) {
      if (sp.life[k] <= 0) continue;
      sp.life[k] -= dt;
      if (sp.life[k] <= 0) { sp.pos[k * 3 + 1] = -999; continue; }
      sp.vel[k * 3 + 1] -= 14 * dt;
      sp.pos[k * 3] += sp.vel[k * 3] * dt; sp.pos[k * 3 + 1] += sp.vel[k * 3 + 1] * dt; sp.pos[k * 3 + 2] += sp.vel[k * 3 + 2] * dt;
    }
    spGeo.attributes.position.needsUpdate = true;

    trauma = Math.max(0, trauma - 3 * dt);
    const amp = maxPx * trauma * trauma;
    if (trauma === 0) maxPx = 0;
    // mostly along the direction of the blow, with a little noise
    const jx = (Math.random() * 2 - 1) * 0.5 + dirX, jy = (Math.random() * 2 - 1) * 0.5 - dirZ * 0.5;
    const ox = Math.round(jx * amp) / PX_PER_UNIT, oy = Math.round(jy * amp) / PX_PER_UNIT;
    camera.position.copy(base).addScaledVector(right, ox).addScaledVector(up, oy);
  }

  return { swing, burst, shake, update };
}

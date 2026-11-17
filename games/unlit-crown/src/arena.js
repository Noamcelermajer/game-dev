// The ruined temple arena, generated from a seed. No art assets: blocks, columns and lights.
import * as THREE from 'three';
import { stoneMaterial, glowSprite, mulberry32 } from './materials.js';
import { CAMERA_ELEVATION, LAYER_FX } from './render.js';

// one brick course, so block tops land on mortar lines (5 px of wall)
const COURSE = 5 / (16 * Math.cos(CAMERA_ELEVATION));

const STONE = ['#6e6672', '#5f5866', '#7a7078', '#685e64', '#746a6e'];
const BONE = '#d8d2c0';
const VINE = ['#7a1f2a', '#8a2a2a', '#5e1820', '#7a6a22'];

class Batch {
  constructor(geometry, material, { cast = true, receive = true, layer = 0 } = {}) {
    this.geometry = geometry; this.material = material;
    this.cast = cast; this.receive = receive; this.layer = layer; this.items = [];
  }
  // y is the bottom of the piece
  add(x, y, z, sx, sy, sz, color, rotY = 0, rotZ = 0) {
    this.items.push({ x, y: y + sy / 2, z, sx, sy, sz, color, rotY, rotZ });
  }
  build() {
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.items.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
    this.items.forEach((it, i) => {
      e.set(0, it.rotY, it.rotZ); q.setFromEuler(e);
      p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz);
      mesh.setMatrixAt(i, m.compose(p, q, s));
      mesh.setColorAt(i, it.color instanceof THREE.Color ? it.color : c.set(it.color));
    });
    mesh.castShadow = this.cast; mesh.receiveShadow = this.receive;
    mesh.layers.set(this.layer);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    return mesh;
  }
}

// A pixel flame: a screen-facing card whose shader draws a three-colour teardrop
// on the pixel grid, wobbling in steps like hand-drawn frames.
function makeFlame(scale = 1) {
  const w = 1.0 * scale, h = 1.75 * scale;
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPx: { value: new THREE.Vector2(Math.round(w * 16), Math.round(h * 16)) } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uT; uniform vec2 uPx; varying vec2 vUv;
      void main() {
        vec2 p = (floor(vUv * uPx) + 0.5) / uPx;
        float y = p.y;
        float wob = sin(y * 7.0 + uT * 9.0) * 0.07 * y + sin(y * 13.0 - uT * 6.0) * 0.04 * y;
        float x = abs(p.x - 0.5 - wob);
        float flick = 0.9 + 0.1 * sin(uT * 13.0);
        float body = 0.36 * pow(max(1.0 - y / flick, 0.0), 0.75) * smoothstep(0.0, 0.1, y);
        if (x > body) discard;
        float d = x / max(body, 1e-3);
        vec3 c = vec3(1.0, 0.24, 0.05) * 1.5;                                  // outer
        if (d < 0.72 && y < 0.62) c = vec3(1.0, 0.52, 0.1) * 2.2;                // middle
        if (d < 0.42 && y < 0.36) c = vec3(1.0, 0.9, 0.5) * 3.2;                 // core
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0), mat);
  card.rotation.x = -CAMERA_ELEVATION;                      // face the fixed camera
  card.layers.set(LAYER_FX);
  const g = new THREE.Group();
  g.add(card);
  g.userData.update = (tq, phase) => { mat.uniforms.uT.value = tq + phase; };
  return g;
}

function makeEmbers(count, origin, color, spread, rise) {
  const pos = new Float32Array(count * 3);
  const seeds = [];
  for (let i = 0; i < count; i++) seeds.push({ o: Math.random() * 10, s: 0.5 + Math.random(), a: Math.random() * 6.28, r: Math.random() * spread });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: 1, sizeAttenuation: false, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  pts.frustumCulled = false;
  pts.layers.set(LAYER_FX);
  pts.userData.update = (t) => {
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const life = ((t * 0.35 * s.s + s.o) % 1);
      pos[i * 3] = origin.x + Math.cos(s.a + t * 0.6) * s.r * (0.4 + life);
      pos[i * 3 + 1] = origin.y + life * rise;
      pos[i * 3 + 2] = origin.z + Math.sin(s.a + t * 0.5) * s.r * (0.4 + life);
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

export function buildArena(seed = 7) {
  const rnd = mulberry32(seed);
  const R = (a, b) => a + rnd() * (b - a);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const stone = (dim = 1) => {
    const c = new THREE.Color(pick(STONE));
    c.offsetHSL(0, 0, R(-0.05, 0.05));
    return c.multiplyScalar(dim);
  };

  const group = new THREE.Group();
  const stoneMat = stoneMaterial({ pattern: 'brick' });
  const boxes = new Batch(new THREE.BoxGeometry(1, 1, 1), stoneMat);
  const cyls = new Batch(new THREE.CylinderGeometry(0.5, 0.5, 1, 10), stoneMaterial({ flat: true, pattern: 'brick' }));
  const smalls = new Batch(new THREE.BoxGeometry(1, 1, 1), stoneMaterial({ noise: 0.5 }), { cast: false, layer: LAYER_FX });
  const glows = new Batch(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), { cast: false, receive: false, layer: LAYER_FX });
  const animated = [];
  const obstacles = [];

  // --- floor -----------------------------------------------------------
  const FLOOR_R = 7.4;
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(FLOOR_R, FLOOR_R, 0.6, 72),
    stoneMaterial({ color: '#80767e', pattern: 'floor' }),
  );
  floor.position.y = -0.3; floor.receiveShadow = true;
  group.add(floor);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(26, 40).rotateX(-Math.PI / 2), stoneMaterial({ color: '#3c3640' }));
  ground.position.y = -0.6; ground.receiveShadow = true;
  group.add(ground);

  // --- rim of broken blocks -------------------------------------------
  const rows = [
    // heights are in brick courses: [min, max]
    { r: 7.85, c: [1, 1], size: 0.86, prob: 1 },
    { r: 8.72, c: [2, 3], size: 0.9, prob: 0.97 },
    { r: 9.6, c: [2, 5], size: 0.95, prob: 0.8 },
    { r: 10.5, c: [1, 7], size: 1.0, prob: 0.6 },
    { r: 11.5, c: [1, 8], size: 1.1, prob: 0.45 },
  ];
  for (const row of rows) {
    const n = Math.floor((Math.PI * 2 * row.r) / (row.size + 0.06));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * row.r, z = Math.sin(a) * row.r;
      if (z < -5.0 && Math.abs(x) < 3.9) continue;          // altar opening
      if (z > 6 && Math.abs(x) < 1.8) continue;             // south stairs
      if (rnd() > row.prob) continue;
      const front = z > 3 ? 0.45 : 1;                        // keep foreground low
      const courses = Math.max(1, Math.round(R(row.c[0], row.c[1]) * front));
      const h = 0.6 + courses * COURSE;
      const s = row.size * R(0.88, 1.04);
      boxes.add(x + R(-0.03, 0.03), -0.6, z + R(-0.03, 0.03), s, h, s, stone(), -a + R(-0.04, 0.04));
      if (rnd() < 0.28 && row.r > 8) {
        const s2 = s * R(0.5, 0.8);
        boxes.add(x + R(-0.1, 0.1), -0.6 + h, z + R(-0.1, 0.1), s2, COURSE, s2, stone(), -a + R(-0.3, 0.3));
      }
      if (rnd() < 0.3) {                                      // creeping red vines
        const vc = pick(VINE);
        for (let k = 0; k < 4; k++) smalls.add(x + R(-0.45, 0.45), h - 0.6 - 0.02, z + R(-0.45, 0.45), 0.13, 0.1, 0.13, vc);
      }
    }
  }

  // south stairs
  boxes.add(0, -0.6, 7.75, 3.2, 0.4, 0.9, stone());
  boxes.add(0, -0.6, 8.6, 3.2, 0.2, 0.9, stone());

  // --- pillars ----------------------------------------------------------
  const pillarAt = (x, z, drums, broken) => {
    boxes.add(x, -0.6, z, 1.7, 1.05, 1.7, stone(), R(-0.05, 0.05));
    boxes.add(x, 0.45, z, 1.35, 0.3, 1.35, stone());
    let y = 0.75;
    for (let i = 0; i < drums; i++) {
      const h = R(0.8, 1.0), r = R(1.0, 1.12);
      cyls.add(x + R(-0.03, 0.03), y, z + R(-0.03, 0.03), r, h, r, stone(), R(0, 3));
      y += h;
    }
    if (!broken) {
      boxes.add(x, y, z, 1.4, 0.3, 1.4, stone());
      boxes.add(x, y + 0.3, z, 1.75, 0.35, 1.75, stone());
      y += 0.65;
    }
    // hanging vines
    const vx = x + R(-0.4, 0.4), vc = pick(VINE);
    for (let k = 0, n = Math.floor(R(4, 9)); k < n; k++) smalls.add(vx + R(-0.08, 0.08), y - 0.6 - k * 0.2, z + 0.62, 0.13, 0.16, 0.08, vc);
    obstacles.push({ x, z, r: 1.2 });
    return y;
  };
  const P = [[-10.3, -2.2, 7, false], [-7.6, -8.2, 7, false], [-3.9, -10.8, 6, true], [3.9, -10.8, 7, false], [7.6, -8.2, 5, true], [10.3, -2.2, 7, false]];
  const tops = P.map(([x, z, d, b]) => pillarAt(x, z, d, b));

  // arches between the outer pillar pairs
  const arch = (i, j) => {
    const [ax, az] = P[i], [bx, bz] = P[j];
    const y0 = Math.min(tops[i], tops[j]);
    const rot = -Math.atan2(bz - az, bx - ax);
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      boxes.add(ax + (bx - ax) * t, y0 + Math.sin(Math.PI * t) * 1.5, az + (bz - az) * t, 0.95, 0.75, 1.0, stone(), rot, (0.5 - t) * 1.4);
    }
  };
  arch(0, 1);

  // --- banners ----------------------------------------------------------
  const banner = (x, z, y) => {
    const red = new THREE.Color('#7a1c24');
    boxes.add(x, y + 2.5, z, 2.4, 0.07, 0.07, '#2a2420');
    boxes.add(x, y, z, 1.3, 2.5, 0.06, red);
    [[-0.45, 0.55], [0, 0.3], [0.45, 0.7]].forEach(([dx, len]) => boxes.add(x + dx, y - len, z, 0.36, len, 0.06, red));
    const gold = new THREE.Color('#c9963a');
    smalls.add(x, y + 1.35, z + 0.05, 0.6, 0.14, 0.03, gold);
    [-0.24, 0, 0.24].forEach((dx, i) => smalls.add(x + dx, y + 1.49, z + 0.05, 0.12, i === 1 ? 0.3 : 0.2, 0.03, gold));
  };
  banner(-5.8, -9.4, 3.0);
  banner(9.0, -5.2, 2.6);

  // --- altar ------------------------------------------------------------
  const AZ = -8.7;
  boxes.add(0, -0.6, -8.2, 6.6, 0.95, 4.4, stone());
  boxes.add(0, 0.35, -8.5, 5.6, 0.35, 3.6, stone());
  boxes.add(0, 0.7, -8.8, 4.6, 0.35, 2.8, stone());
  boxes.add(0, 1.05, AZ, 2.7, 0.9, 1.2, stone(1.05));
  boxes.add(0, 1.95, AZ, 3.0, 0.2, 1.45, stone(1.1));
  boxes.add(0, 1.0, AZ + 0.64, 0.95, 1.18, 0.05, '#7a1c24');   // altar cloth
  smalls.add(0, 1.55, AZ + 0.68, 0.12, 0.36, 0.02, '#c9963a');
  smalls.add(0, 1.72, AZ + 0.68, 0.3, 0.1, 0.02, '#c9963a');
  obstacles.push({ rect: [-3.5, 3.5, -11, -5.9] });

  const flameCol = new THREE.Color(0xffc860).multiplyScalar(3);
  const candle = (x, y, z) => {
    const h = R(0.25, 0.65);
    smalls.add(x, y, z, 0.13, h, 0.13, '#e8dcc0');
    glows.add(x, y + h + 0.02, z, 0.08, 0.14, 0.08, flameCol);
  };
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) candle(side * R(1.0, 1.4), 2.15, AZ + R(-0.5, 0.5));
    for (let i = 0; i < 4; i++) candle(side * R(1.7, 2.2), 1.05, AZ + R(0.3, 1.2));
    for (let i = 0; i < 3; i++) candle(side * R(2.3, 2.7), 0.7, AZ + R(1.2, 2.1));
    const cl = new THREE.PointLight(0xffa040, 6, 7, 2);
    cl.position.set(side * 1.7, 2.4, AZ + 0.9);
    group.add(cl);
    animated.push((t, tq) => { cl.intensity = cl.userData.base * (0.9 + 0.1 * Math.sin(tq * 11 + side)); });
    cl.userData.base = 6; cl.userData.kind = 'candle';
  }

  // --- the crown shard --------------------------------------------------
  const crown = new THREE.Group();
  const crownMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.72, 0.88, 1.0).multiplyScalar(2.4) });
  const crownDim = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.55, 0.95).multiplyScalar(1.5) });
  const cb = new THREE.BoxGeometry(1, 1, 1);
  const piece = (w, h, x, y, mat = crownMat) => {
    const m = new THREE.Mesh(cb, mat);
    m.scale.set(w, h, 0.1); m.position.set(x, y, 0);
    crown.add(m);
  };
  // a broken crown, drawn flat toward the camera so its silhouette reads
  piece(0.5, 0.2, -0.42, 0); piece(0.34, 0.2, 0.08, 0); piece(0.3, 0.2, 0.52, -0.03);
  piece(1.34, 0.07, 0.0, -0.13, crownDim);
  [[-0.6, 0.5], [-0.3, 0.28], [0.02, 0.62], [0.34, 0.26], [0.62, 0.46]].forEach(([x, h]) => {
    piece(0.14, h, x, 0.1 + h / 2);
    piece(0.07, 0.07, x, 0.1 + h + 0.07);
  });
  crown.rotation.x = -CAMERA_ELEVATION;
  const shards = [];
  const sg = new THREE.OctahedronGeometry(0.1, 0);
  for (let i = 0; i < 8; i++) {
    const sh = new THREE.Mesh(sg, i % 2 ? crownMat : crownDim);
    sh.userData = { a: R(0, 6.28), r: R(1.0, 1.7), y: R(-1.2, 0.9), sp: R(0.2, 0.5) };
    sh.scale.y = 1.9;
    crown.add(sh); shards.push(sh);
  }
  crown.traverse((o) => o.layers.set(LAYER_FX));
  crown.position.set(0, 3.7, AZ);
  group.add(crown);
  const crownGlow = glowSprite(0x4a90ff, 3.6, 0.3);
  crownGlow.position.set(0, 3.8, AZ + 0.3);
  group.add(crownGlow);
  const sigil = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.6, 1.0).multiplyScalar(1.6) }));
  sigil.position.set(0, 2.17, AZ);
  sigil.layers.set(LAYER_FX);
  group.add(sigil);

  const crownLight = new THREE.PointLight(0x6aa8ff, 26, 0, 2);
  crownLight.position.set(0, 3.6, AZ + 0.2);
  crownLight.castShadow = true;
  crownLight.userData = { base: 26, kind: 'crown' };
  group.add(crownLight);

  // light shafts from above
  const shaftMat = new THREE.MeshBasicMaterial({ color: 0x3f7fe0, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(R(0.35, 1.0), 9), shaftMat);
    sh.position.set(R(-1.6, 1.6), 7.2, AZ - 0.4 + i * 0.05);
    sh.rotation.z = R(-0.12, 0.12) + 0.1;
    sh.layers.set(LAYER_FX);
    group.add(sh);
  }
  const dust = makeEmbers(36, new THREE.Vector3(0, 2.4, AZ), 0x9cc8ff, 1.6, 5);
  group.add(dust);
  animated.push((t, tq) => {
    crown.position.y = 3.7 + Math.round(Math.sin(t * 1.2) * 0.14 * 16) / 16;
    for (const s of shards) {
      const u = s.userData;
      s.position.set(Math.cos(u.a + t * u.sp) * u.r, u.y + Math.sin(t * u.sp * 3 + u.a) * 0.15, Math.sin(u.a + t * u.sp) * 0.3);
      s.rotation.y = t + u.a;
    }
    crownLight.intensity = crownLight.userData.base * (0.93 + 0.07 * Math.sin(tq * 3.1));
    dust.userData.update(t * 0.4);
  });

  // --- braziers ---------------------------------------------------------
  const braziers = [];
  const iron = new THREE.MeshLambertMaterial({ color: '#2c2622' });
  const brazier = (x, z, phase) => {
    boxes.add(x, -0.6, z, 1.25, 1.35, 1.25, stone());
    boxes.add(x, 0.75, z, 1.0, 0.2, 1.0, stone());
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.32, 0.42, 8, 1, true), iron);
    bowl.material.side = THREE.DoubleSide;
    bowl.position.set(x, 1.16, z);
    group.add(bowl);
    glows.add(x, 1.2, z, 0.7, 0.12, 0.7, new THREE.Color(0xff5a10).multiplyScalar(1.4));
    const flame = makeFlame(1);
    flame.position.set(x, 1.22, z);
    group.add(flame);
    const glow = glowSprite(0xff7a20, 3.4, 0.5);
    glow.position.set(x, 1.7, z + 0.3);
    group.add(glow);
    const light = new THREE.PointLight(0xff7420, 60, 0, 2);
    light.position.set(x, 2.0, z);
    light.castShadow = true;
    light.userData = { base: 30, kind: 'brazier' };
    group.add(light);
    const embers = makeEmbers(22, new THREE.Vector3(x, 1.5, z), 0xffa040, 0.5, 3.2);
    group.add(embers);
    animated.push((t, tq) => {
      flame.userData.update(tq, phase);
      embers.userData.update(t + phase);
      const f = 0.86 + 0.1 * Math.sin(tq * 9.7 + phase) + 0.06 * Math.sin(tq * 23.1 + phase * 2);
      light.intensity = light.userData.base * f;
      glow.material.opacity = 0.5 * f;
    });
    obstacles.push({ x, z, r: 1.0 });
    braziers.push(light);
  };
  brazier(-6.2, -2.0, 0.0);
  brazier(6.1, 2.4, 2.4);

  // --- bones, pots, rubble ---------------------------------------------
  const skeleton = (x, z, rot) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    const at = (dx, dz) => [x + dx * c - dz * s, z + dx * s + dz * c];
    let [px, pz] = at(-0.55, 0); smalls.add(px, 0, pz, 0.24, 0.2, 0.22, BONE, -rot);
    [px, pz] = at(0.15, 0); smalls.add(px, 0, pz, 0.9, 0.06, 0.07, BONE, -rot);
    for (let i = 0; i < 4; i++) { [px, pz] = at(-0.2 + i * 0.16, 0); smalls.add(px, 0.02, pz, 0.06, 0.1, 0.46, BONE, -rot); }
    [px, pz] = at(0.75, 0.16); smalls.add(px, 0, pz, 0.45, 0.06, 0.06, BONE, -rot + 0.5);
    [px, pz] = at(0.75, -0.18); smalls.add(px, 0, pz, 0.45, 0.06, 0.06, BONE, -rot - 0.4);
  };
  skeleton(-2.2, -5.2, 0.4); skeleton(-4.6, -3.6, 2.3); skeleton(-4.2, 5.2, 0.2);
  skeleton(5.0, 5.3, 2.9); skeleton(3.8, -4.4, 1.2);
  [[-3.9, 4.6], [3.2, -5.3], [-5.4, -4.9]].forEach(([x, z]) => smalls.add(x, 0, z, 0.24, 0.22, 0.24, BONE, R(0, 3)));
  for (let i = 0; i < 14; i++) {                              // loose bones
    const a = R(0, 6.28), r = R(2.5, 6.8);
    smalls.add(Math.cos(a) * r, 0, Math.sin(a) * r, 0.34, 0.05, 0.06, BONE, R(0, 3));
  }
  cyls.add(-4.6, 0, -6.3, 0.55, 0.6, 0.55, new THREE.Color('#7a4a2c'));
  cyls.add(3.4, 0, -5.6, 0.45, 0.45, 0.45, new THREE.Color('#6a4028'));
  for (let i = 0; i < 26; i++) {                              // rubble on the floor edge
    const a = R(0, 6.28), r = R(5.6, 7.1);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (z < -5 && Math.abs(x) < 3.8) continue;
    const s = R(0.14, 0.36);
    smalls.add(x, 0, z, s, s * 0.7, s, stone(), R(0, 3));
  }
  for (let i = 0; i < 40; i++) {                              // dry grass tufts
    const a = R(0, 6.28), r = R(4.5, 7.2);
    smalls.add(Math.cos(a) * r, 0, Math.sin(a) * r, 0.06, R(0.12, 0.26), 0.06, '#8a7a2a');
  }

  const boxMesh = boxes.build(), cylMesh = cyls.build();
  group.add(boxMesh, cylMesh, smalls.build(), glows.build());

  const ambient = new THREE.HemisphereLight(0x4a3e70, 0x161020, 1.5);
  group.add(ambient);

  return {
    group, ambient, crownLight, braziers,
    occluders: [boxMesh, cylMesh],
    obstacles, floorRadius: FLOOR_R,
    update(t) {
      const tq = Math.floor(t * 12) / 12;                     // effects tick at 12 fps
      for (const fn of animated) fn(t, tq);
    },
  };
}

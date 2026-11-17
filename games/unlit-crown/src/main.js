// M0: the lighting test. One arena, one hero, real light, rendered as pixel art.
import * as THREE from 'three';
import { createPixelRenderer, createCamera } from './render.js';
import { buildArena } from './arena.js';
import { createHero } from './hero.js';
import { texUniforms } from './materials.js';

const canvas = document.getElementById('game');
const pixel = createPixelRenderer(canvas);
const camera = createCamera();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030206);

const world = buildArena(7);
scene.add(world.group);
const hero = await createHero();
scene.add(hero.group);

// shadows: hard-edged, a few lights only
const shadowLights = [hero.light, world.crownLight, ...world.braziers];
for (const l of shadowLights) {
  l.shadow.mapSize.set(512, 512);
  l.shadow.camera.near = 0.05;
  l.shadow.camera.far = 40;
  l.shadow.bias = -0.012;
  l.shadow.normalBias = 0.04;
}

// --- input ---------------------------------------------------------------
const input = { up: false, down: false, left: false, right: false };
const KEYS = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' };
addEventListener('keydown', (e) => {
  const k = KEYS[e.key.toLowerCase()];
  if (k) { input[k] = true; e.preventDefault(); }
  if (e.key.toLowerCase() === 'g') toggleGui();
});
addEventListener('keyup', (e) => { const k = KEYS[e.key.toLowerCase()]; if (k) input[k] = false; });
addEventListener('blur', () => { for (const k in input) input[k] = false; });

// --- light level at the hero (real lights, blocked by real walls) ----------
const ray = new THREE.Raycaster();
const lightBar = document.getElementById('light-bar');
const tmp = new THREE.Vector3(), dir = new THREE.Vector3();
let lightLevel = 0;
function measureLight() {
  const p = hero.chest();
  let total = 0;
  for (const l of shadowLights) {
    l.getWorldPosition(tmp);
    const d = p.distanceTo(tmp);
    let lit = 1;
    if (l !== hero.light) {
      dir.subVectors(tmp, p).normalize();
      ray.set(p, dir); ray.far = d - 0.3;
      if (ray.intersectObjects(world.occluders, false).length) lit = 0;
    }
    total += lit * l.intensity / Math.max(d * d, 0.5);
  }
  lightLevel = 1 - Math.exp(-total * 0.03);
  const n = Math.round(lightLevel * 10);
  lightBar.textContent = '█'.repeat(n) + '░'.repeat(10 - n);
}

// --- tuning panel ------------------------------------------------------------
let gui = null;
const params = {
  palette: true, dither: 0.008, outline: 0.62, highlight: 0.32, crease: 0.4,
  exposure: 2.3, vignette: 0.55, texture: 0.3,
  lantern: 50, braziers: 80, crown: 45, ambient: 1.5,
};
function applyParams() {
  const u = pixel.post.uniforms;
  u.uPalette.value = params.palette ? 1 : 0; u.uDither.value = params.dither;
  u.uOutline.value = params.outline; u.uHighlight.value = params.highlight; u.uCrease.value = params.crease;
  u.uExposure.value = params.exposure; u.uVignette.value = params.vignette;
  texUniforms.uNoise.value = params.texture;
  hero.light.userData.base = params.lantern;
  world.braziers.forEach((b) => { b.userData.base = params.braziers; });
  world.crownLight.userData.base = params.crown;
  world.ambient.intensity = params.ambient;
}
async function toggleGui() {
  if (gui) { gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none'; return; }
  const { GUI } = await import('https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/+esm');
  gui = new GUI({ title: 'Look' });
  const px = gui.addFolder('Pixel pass');
  px.add(params, 'palette').name('fixed palette');
  px.add(params, 'dither', 0, 0.12, 0.005);
  px.add(params, 'outline', 0, 1, 0.02).name('outlines');
  px.add(params, 'highlight', 0, 1, 0.02).name('edge highlights');
  px.add(params, 'crease', 0, 1, 0.02).name('corner shading');
  px.add(params, 'exposure', 0.4, 3, 0.05);
  px.add(params, 'vignette', 0, 1, 0.05);
  px.add(params, 'texture', 0, 0.8, 0.02).name('stone texture');
  const li = gui.addFolder('Lights');
  li.add(params, 'lantern', 0, 40, 1);
  li.add(params, 'braziers', 0, 80, 1);
  li.add(params, 'crown', 0, 80, 1).name('crown shard');
  li.add(params, 'ambient', 0, 4, 0.05);
  gui.onChange(applyParams);
}
applyParams();

// --- loop --------------------------------------------------------------------
const clock = new THREE.Clock();
let meterT = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  hero.update(dt, t, input, world);
  world.update(t);
  meterT -= dt;
  if (meterT <= 0) { measureLight(); meterT = 0.1; }
  pixel.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// debug hook: lets tests drive the game without waiting on animation frames
let simT = 0;
window.__game = {
  scene, camera, hero, world, params, applyParams, input, measureLight,
  step(dt = 1 / 60, n = 1) {
    for (let i = 0; i < n; i++) { simT += dt; hero.update(dt, simT, input, world); world.update(simT); }
    measureLight(); pixel.render(scene, camera);
  },
  get lightLevel() { return lightLevel; },
};

// The Unlit Crown, M1: combat. Wires the simulation (sim.js) to what you see and hear.
// The simulation advances in fixed ticks from input commands; everything else here only
// draws its state and reacts to its events.
import * as THREE from 'three';
import { createPixelRenderer, createCamera } from './render.js';
import { buildArena } from './arena.js';
import { createHeroView } from './hero.js';
import { createEnemyViews } from './enemies.js';
import { createFx } from './fx.js';
import { createHud } from './hud.js';
import { createSim } from './sim.js';
import { loadKit } from './props.js';
import { texUniforms } from './materials.js';
import { sfx, unlock, toggleMute } from './audio.js';
import { TICK, PLAYER, WAVES } from './config.js';

const canvas = document.getElementById('game');
const pixel = createPixelRenderer(canvas);
const camera = createCamera();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030206);

const kit = await loadKit();
const world = buildArena(7, kit);
scene.add(world.group);
const hero = await createHeroView();
scene.add(hero.group);
const enemies = await createEnemyViews(scene);
const fx = createFx(scene, camera);
const hud = createHud();

// --- shadows: hard-edged, few lights. The lantern moves, so it updates every frame;
// the fixed lights take turns, one per frame. -------------------------------------------
const fixedLights = [world.crownLight, ...world.braziers];
const shadowLights = [hero.light, ...fixedLights];
for (const l of shadowLights) {
  l.shadow.mapSize.set(512, 512);
  l.shadow.camera.near = 0.05;
  l.shadow.camera.far = 40;
  l.shadow.bias = -0.012;
  l.shadow.normalBias = 0.04;
}
for (const l of fixedLights) { l.shadow.autoUpdate = false; l.shadow.needsUpdate = true; }
let shadowTurn = 0;

// --- simulation ----------------------------------------------------------------------
const tmp = new THREE.Vector3();
const sim = createSim({
  floorRadius: world.floorRadius,
  obstacles: world.obstacles,
  lights: fixedLights.map((l) => { l.getWorldPosition(tmp); return { x: tmp.x, y: tmp.y, z: tmp.z, power: l.userData.base }; }),
}, 7);

// --- input: held directions, plus presses that last exactly one tick ------------------
const held = { up: false, down: false, left: false, right: false };
const pressed = { attack: false, roll: false, restart: false };
const MOVE = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' };
const ACTION = { j: 'attack', z: 'attack', ' ': 'roll', k: 'roll', x: 'roll', shift: 'roll', r: 'restart', enter: 'restart' };
addEventListener('keydown', (e) => {
  unlock();
  const key = e.key.toLowerCase();
  if (MOVE[key]) { held[MOVE[key]] = true; e.preventDefault(); }
  if (ACTION[key] && !e.repeat) { pressed[ACTION[key]] = true; e.preventDefault(); }
  if (key === 'g') toggleGui();
  if (key === 'm') hud.banner(toggleMute() ? 'SOUND OFF' : 'SOUND ON', 1);
});
addEventListener('keyup', (e) => { const k = MOVE[e.key.toLowerCase()]; if (k) held[k] = false; });
addEventListener('blur', () => { for (const k in held) held[k] = false; });
canvas.addEventListener('mousedown', (e) => { unlock(); if (e.button === 0) pressed.attack = true; if (e.button === 2) pressed.roll = true; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function command() {
  const cmd = {
    mx: (held.right ? 1 : 0) - (held.left ? 1 : 0),
    mz: (held.down ? 1 : 0) - (held.up ? 1 : 0),
    attack: pressed.attack, roll: pressed.roll, restart: pressed.restart,
  };
  pressed.attack = pressed.roll = pressed.restart = false;
  return cmd;
}

// --- events from the simulation become effects, sound and pauses --------------------------
let hitstop = 0;
function handle(ev) {
  switch (ev.type) {
    case 'swing': fx.swing(ev); sfx.swing(ev.heavy); break;
    case 'hit':
      fx.burst(ev.x, 1.0, ev.z, ev.nx, ev.nz, ev.kill ? 16 : ev.heavy ? 11 : 7, ev.heavy ? 7 : 5);
      fx.shake(ev.shake, ev.nx, ev.nz);
      hitstop = Math.max(hitstop, ev.hitstop);
      ev.kill ? sfx.kill() : sfx.hit(ev.heavy);
      break;
    case 'roll': sfx.roll(); break;
    case 'enemyWindup': sfx.windup(); break;
    case 'enemyAttack': sfx.slam(); fx.shake(1); break;
    case 'playerHurt': fx.shake(ev.shake); hud.flashHurt(); hitstop = Math.max(hitstop, ev.hitstop); sfx.hurt(); break;
    case 'playerDead': sfx.dead(); break;
    case 'spawn': sfx.spawn(); break;
    case 'wave': hud.banner(`WAVE ${ev.n}`); sfx.wave(); break;
    case 'restart': hud.banner('RISE AGAIN', 1.4); break;
  }
}

function tick() {
  sim.step(command());
  for (const ev of sim.drain()) handle(ev);
}

// --- tuning panel ----------------------------------------------------------------------
let gui = null;
const params = {
  palette: true, dither: 0.008, outline: 0.62, highlight: 0.32, crease: 0.4,
  saturation: 1.18, contrast: 1.1, split: 1.0,
  exposure: 2.3, vignette: 0.5, texture: 0.22, moon: 0.5,
  lantern: PLAYER.lanternPower, braziers: 80, crown: 45, ambient: 1.5,
};
function applyParams() {
  const u = pixel.post.uniforms;
  u.uPalette.value = params.palette ? 1 : 0; u.uDither.value = params.dither;
  u.uOutline.value = params.outline; u.uHighlight.value = params.highlight; u.uCrease.value = params.crease;
  u.uExposure.value = params.exposure; u.uVignette.value = params.vignette;
  u.uSaturation.value = params.saturation; u.uContrast.value = params.contrast; u.uSplit.value = params.split;
  world.moon.intensity = params.moon;
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
  px.add(params, 'exposure', 0.4, 4, 0.05);
  px.add(params, 'saturation', 0.5, 2, 0.05);
  px.add(params, 'contrast', 0.7, 1.6, 0.05);
  px.add(params, 'split', 0, 2, 0.05).name('warm/cool split');
  px.add(params, 'vignette', 0, 1, 0.05);
  px.add(params, 'texture', 0, 0.8, 0.02).name('stone texture');
  const li = gui.addFolder('Lights');
  li.add(params, 'lantern', 0, 100, 1);
  li.add(params, 'braziers', 0, 160, 1);
  li.add(params, 'crown', 0, 120, 1).name('crown shard');
  li.add(params, 'ambient', 0, 4, 0.05);
  li.add(params, 'moon', 0, 3, 0.05).name('cool top light');
  gui.onChange(applyParams);
}
applyParams();

// --- drawing ------------------------------------------------------------------------------
let viewT = 0;
function draw(dt) {
  viewT += dt;
  const s = sim.state, p = s.player;
  hero.sync(p, viewT);
  enemies.sync(s.enemies, viewT);
  world.update(viewT);
  fx.update(dt);
  hud.update(dt, {
    hpFrac: p.hp / PLAYER.hp,
    staminaFrac: p.stamina / PLAYER.stamina,
    lightLevel: sim.lightAt(p.x, p.z),
    waveNumber: s.wave,
    enemies: s.enemies.filter((e) => e.state !== 'dead').length,
    dead: p.state === 'dead',
    canRestart: p.state === 'dead' && p.stateT >= WAVES.deathPause,
  });
  fixedLights[shadowTurn++ % fixedLights.length].shadow.needsUpdate = true;
  pixel.render(scene, camera);
}

// --- loop: fixed simulation ticks, drawn once per display frame -------------------------------
let last = performance.now(), acc = 0, paused = false;
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (paused) { draw(0); requestAnimationFrame(frame); return; }
  if (hitstop > 0) hitstop -= dt;                           // a brief freeze sells a heavy blow
  else {
    acc += dt;
    while (acc >= TICK && hitstop <= 0) { tick(); acc -= TICK; }
    if (hitstop > 0) acc = 0;
  }
  draw(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// debug hook: lets tests drive the game without waiting on animation frames
window.__game = {
  scene, camera, hero, world, sim, params, applyParams, held, pressed, renderer: pixel.renderer,
  step(n = 1) { for (let i = 0; i < n; i++) tick(); hitstop = 0; draw(n * TICK); },
  pause(on = true) { paused = on; },
};

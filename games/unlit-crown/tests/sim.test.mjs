// Run with: node games/unlit-crown/tests/sim.test.mjs
// Exercises the simulation with no browser: movement, the attack chain, rolling, enemies.
import assert from 'node:assert/strict';
import { createSim } from '../src/sim.js';
import { TICK, PLAYER, ATTACKS, ROLL, HUSK, TOKENS, WAVES } from '../src/config.js';

const world = { floorRadius: 7.4, obstacles: [{ x: -6.2, z: -2, r: 1.0 }, { rect: [-3.5, 3.5, -11, -5.9] }], lights: [{ x: -6.2, y: 2.55, z: -2, power: 80 }] };
const none = { mx: 0, mz: 0, attack: false, roll: false, restart: false };
const run = (sim, n, cmd = none) => { for (let i = 0; i < n; i++) sim.step({ ...none, ...cmd }); };
const fresh = () => { const sim = createSim(world, 3); sim.state.waveTimer = 1e9; return sim; };   // waves off unless a test wants them
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok  ' + name); };

test('walking moves the player and stops at the wall', () => {
  const sim = fresh(), p = sim.state.player;
  run(sim, 30, { mx: 1 });
  assert.ok(p.x > 1.9 && p.x < 2.3, `x after 0.5 s = ${p.x}`);
  assert.equal(p.state, 'walk');
  run(sim, 600, { mx: 1 });
  assert.ok(Math.hypot(p.x, p.z) <= 7.4 - PLAYER.radius, 'stays inside the arena');
  run(sim, 2);
  assert.equal(p.state, 'idle');
});

test('the altar and braziers block movement', () => {
  const sim = fresh(), p = sim.state.player;
  p.x = 0; p.z = -3; run(sim, 300, { mz: -1 });
  assert.ok(p.z >= -5.9, `stopped at the altar, z = ${p.z}`);
  p.x = -3; p.z = -2; run(sim, 300, { mx: -1 });
  assert.ok(Math.hypot(p.x + 6.2, p.z + 2) >= 1.0 + PLAYER.radius - 1e-6, 'stopped at the brazier');
});

test('three buffered presses chain into the full combo, then return to idle', () => {
  const sim = fresh(), p = sim.state.player;
  const seen = [];
  for (let i = 0; i < 120; i++) {
    sim.step({ ...none, attack: i % 6 === 0 && i < 60 });
    for (const e of sim.drain()) if (e.type === 'swing') seen.push(e.combo);
  }
  assert.deepEqual(seen.slice(0, 3), [0, 1, 2]);
  run(sim, 60);
  assert.equal(p.state, 'idle');
  assert.equal(p.combo, 0);
});

test('a husk in front dies to the three-hit chain; one behind is untouched', () => {
  const sim = fresh(), p = sim.state.player;
  p.facing = 0;                                            // facing +z
  const front = sim.spawnHusk(p.x, p.z + 1.4), behind = sim.spawnHusk(p.x, p.z - 1.6);
  front.state = behind.state = 'recover'; front.stateT = behind.stateT = -99;   // hold them still
  let kills = 0, hits = 0;
  for (let i = 0; i < 100; i++) {
    sim.step({ ...none, attack: i % 5 === 0 });
    for (const e of sim.drain()) { if (e.type === 'hit') hits++; if (e.type === 'enemyDie') kills++; }
  }
  assert.equal(HUSK.hp, 30, 'test assumes 30 HP');
  assert.equal(hits, 3, '10 + 10 + 16 damage');
  assert.equal(kills, 1);
  assert.equal(behind.hp, HUSK.hp);
});

test('rolling covers its distance, costs stamina and blocks damage', () => {
  const sim = fresh(), p = sim.state.player;
  const x0 = p.x;
  sim.step({ ...none, mx: 1, roll: true });
  assert.equal(p.state, 'roll');
  assert.equal(sim.hurtPlayer(50, 0, 0), false, 'invulnerable while rolling');
  run(sim, Math.round(ROLL.duration / TICK) + 2);
  assert.ok(Math.abs(p.x - x0 - ROLL.distance) < 0.25, `rolled ${p.x - x0}`);
  assert.equal(p.hp, PLAYER.hp);
  assert.ok(p.stamina < PLAYER.stamina && p.stamina >= PLAYER.stamina - ROLL.stamina - 1);
  assert.equal(sim.hurtPlayer(20, 0, 0), true, 'vulnerable again afterwards');
  assert.equal(p.hp, PLAYER.hp - 20);
  assert.equal(sim.hurtPlayer(20, 0, 0), false, 'brief invulnerability after a hit');
});

test('an unopposed husk winds up for the full warning time, then hurts a still player', () => {
  const sim = fresh(), p = sim.state.player;
  const e = sim.spawnHusk(p.x + 3, p.z);
  let windupAt = -1, hurtAt = -1;
  for (let i = 0; i < 600 && hurtAt < 0; i++) {
    sim.step(none);
    for (const ev of sim.drain()) { if (ev.type === 'enemyWindup' && windupAt < 0) windupAt = i; if (ev.type === 'playerHurt') hurtAt = i; }
  }
  assert.ok(windupAt > 0 && hurtAt > 0, 'it attacked');
  assert.ok((hurtAt - windupAt) * TICK >= HUSK.windup - 0.02, `warning was ${(hurtAt - windupAt) * TICK}s`);
  assert.ok(p.hp < PLAYER.hp);
  assert.equal(e.state === 'attack' || e.state === 'recover', true);
});

test('never more than the allowed number of husks attack at once', () => {
  const sim = fresh(), p = sim.state.player;
  for (let i = 0; i < 6; i++) sim.spawnHusk(Math.cos(i) * 4, Math.sin(i) * 4);
  let most = 0;
  for (let i = 0; i < 900; i++) {
    sim.step(none);
    p.hp = PLAYER.hp;                                      // keep the player alive
    const busy = sim.state.enemies.filter((e) => ['windup', 'attack'].includes(e.state)).length;
    most = Math.max(most, busy);
    assert.ok(sim.state.tokens >= 0 && sim.state.tokens <= TOKENS.melee, `tokens = ${sim.state.tokens}`);
  }
  assert.ok(most >= 1 && most <= TOKENS.melee, `most attacking at once = ${most}`);
});

test('waves spawn, and killing the player allows a restart', () => {
  const sim = createSim(world, 5), p = sim.state.player;
  run(sim, 120);
  assert.equal(sim.state.wave, 1);
  assert.equal(sim.state.enemies.length, WAVES.first);
  sim.hurtPlayer(999, 0, 0);
  assert.equal(p.state, 'dead');
  run(sim, 10, { restart: true });
  assert.equal(sim.state.player.state, 'dead', 'no instant restart');
  run(sim, Math.round(WAVES.deathPause / TICK));
  sim.step({ ...none, restart: true });
  assert.equal(sim.state.player.hp, PLAYER.hp);
  assert.equal(sim.state.wave, 0);
});

test('low health raises damage; light level is higher near a brazier', () => {
  const sim = fresh(), p = sim.state.player;
  p.facing = 0;
  const e = sim.spawnHusk(p.x, p.z + 1.2); e.state = 'recover'; e.stateT = -99;
  p.hp = PLAYER.hp * 0.15;
  sim.step({ ...none, attack: true }); run(sim, 12);
  assert.equal(e.hp, HUSK.hp - Math.round(ATTACKS[0].damage * 1.4));
  p.state = 'dead';                                         // lantern out, so only the arena lights count
  assert.ok(sim.lightAt(-5, -2) > sim.lightAt(5, 5) + 0.2);
});

test('the same seed and inputs give the same result', () => {
  const play = () => { const sim = createSim(world, 9); for (let i = 0; i < 1500; i++) sim.step({ mx: Math.sin(i / 40) > 0 ? 1 : -1, mz: i % 90 < 45 ? 1 : 0, attack: i % 17 === 0, roll: i % 131 === 0, restart: false }); return JSON.stringify(sim.state); };
  assert.equal(play(), play());
});

console.log(`\n${passed} tests passed`);

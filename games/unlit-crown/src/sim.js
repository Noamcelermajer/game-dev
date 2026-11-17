// The game simulation. No rendering, no browser APIs: it takes commands, advances in
// fixed ticks and reports what happened as events. The same code can later run on a
// server for co-op, and it runs under Node for tests (tests/sim.test.mjs).
//
// Angles: `facing` f points along (sin f, cos f) in (x, z). World: +x right, +z toward the camera.
import { TICK, PLAYER, ATTACKS, COMBAT, ROLL, HUSK, LIGHT, TOKENS, WAVES } from './config.js';

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// world: { floorRadius, obstacles: [{x,z,r} | {rect:[x0,x1,z0,z1]}], lights: [{x,y,z,power}] }
export function createSim(world, seed = 1) {
  let rand = mulberry32(seed);
  const s = { tick: 0, time: 0, wave: 0, waveTimer: 1.2, kills: 0, tokens: 0, nextId: 1, events: [], enemies: [], player: null };

  function newPlayer() {
    return {
      x: 0, z: 2.2, facing: Math.PI, radius: PLAYER.radius,
      state: 'idle', stateT: 0, hp: PLAYER.hp, stamina: PLAYER.stamina, staminaWait: 0,
      iframes: 0, combo: 0, hitDone: false, bufAttack: 0, bufRoll: 0, rollDir: 0, rollCd: 0,
      kx: 0, kz: 0, moving: false,
    };
  }
  s.player = newPlayer();

  function reset() {
    rand = mulberry32(seed);
    Object.assign(s, { tick: 0, time: 0, wave: 0, waveTimer: 1.2, kills: 0, tokens: 0, nextId: 1, events: [], enemies: [] });
    s.player = newPlayer();
  }

  const emit = (type, data = {}) => s.events.push({ type, ...data });

  function collide(x, z, r) {
    const maxR = world.floorRadius - r - 0.1;
    const d = Math.hypot(x, z);
    if (d > maxR) { x *= maxR / d; z *= maxR / d; }
    for (const o of world.obstacles) {
      if (o.rect) {
        const [x0, x1, z0, z1] = o.rect;
        if (x > x0 && x < x1 && z > z0 && z < z1 + r) z = z1 + r;
      } else {
        const dx = x - o.x, dz = z - o.z, dd = Math.hypot(dx, dz), min = o.r + r;
        if (dd < min && dd > 1e-4) { x = o.x + (dx / dd) * min; z = o.z + (dz / dd) * min; }
      }
    }
    return [x, z];
  }

  // 0 (dark) .. 1 (bright) at a point on the floor, from the arena lights and the hero's lantern
  function lightAt(x, z) {
    let total = 0;
    const add = (lx, ly, lz, power) => {
      const d2 = (x - lx) ** 2 + (0.9 - ly) ** 2 + (z - lz) ** 2;
      total += power / Math.max(d2, 0.5);
    };
    for (const l of world.lights) add(l.x, l.y, l.z, l.power);
    const p = s.player;
    if (p.state !== 'dead') add(p.x, PLAYER.lanternHeight, p.z, PLAYER.lanternPower);
    return 1 - Math.exp(-total * LIGHT.k);
  }

  function lowHpBonus(p) {
    const f = p.hp / PLAYER.hp, { from, to, bonus } = COMBAT.lowHp;
    return 1 + bonus * clamp01((from - f) / (from - to));
  }

  // --- player ------------------------------------------------------------------
  function setState(o, state) { o.state = state; o.stateT = 0; }

  function startAttack(p, combo, cmd) {
    const a = ATTACKS[combo];
    if (cmd.mx || cmd.mz) p.facing = Math.atan2(cmd.mx, cmd.mz);
    p.combo = combo; p.hitDone = false; p.bufAttack = 0;
    p.stamina = Math.max(0, p.stamina - a.stamina); p.staminaWait = PLAYER.staminaDelay;
    setState(p, 'attack');
    emit('swing', { combo, x: p.x, z: p.z, facing: p.facing, range: a.range, arc: a.arc, heavy: !!a.heavy });
  }

  function startRoll(p, cmd) {
    p.rollDir = (cmd.mx || cmd.mz) ? Math.atan2(cmd.mx, cmd.mz) : p.facing;
    p.facing = p.rollDir; p.bufRoll = 0; p.combo = 0;
    p.stamina -= ROLL.stamina; p.staminaWait = PLAYER.staminaDelay;
    p.iframes = Math.max(p.iframes, ROLL.iframes);
    setState(p, 'roll');
    emit('roll', { x: p.x, z: p.z });
  }

  function resolvePlayerHit(p, a) {
    const dmg = Math.round(a.damage * lowHpBonus(p));
    let hits = 0;
    for (const e of s.enemies) {
      if (e.state === 'dead') continue;
      const dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz);
      if (d > a.range + e.radius) continue;
      if (d > 0.7 && Math.abs(wrap(Math.atan2(dx, dz) - p.facing)) > a.arc / 2) continue;
      hits++;
      e.hp -= dmg; e.flash = COMBAT.flash;
      const nx = d > 1e-4 ? dx / d : Math.sin(p.facing), nz = d > 1e-4 ? dz / d : Math.cos(p.facing);
      e.kx = nx * a.knock * 12; e.kz = nz * a.knock * 12;      // decays quickly; travels about `knock` units
      if (e.token) { e.token = false; s.tokens--; }
      const kill = e.hp <= 0;
      if (kill) { setState(e, 'dead'); s.kills++; emit('enemyDie', { id: e.id, x: e.x, z: e.z }); }
      else setState(e, 'hurt');
      emit('hit', { id: e.id, x: e.x, z: e.z, nx, nz, dmg, heavy: !!a.heavy, kill, hitstop: kill ? COMBAT.killHitstop : a.hitstop, shake: a.shake + (kill ? 1 : 0) });
    }
    return hits;
  }

  function stepPlayer(cmd) {
    const p = s.player;
    p.stateT += TICK;
    p.iframes = Math.max(0, p.iframes - TICK);
    p.rollCd = Math.max(0, p.rollCd - TICK);
    p.bufAttack = cmd.attack ? COMBAT.buffer : Math.max(0, p.bufAttack - TICK);
    p.bufRoll = cmd.roll ? COMBAT.buffer : Math.max(0, p.bufRoll - TICK);
    p.moving = false;
    if (p.state === 'dead') return;

    if (p.state !== 'attack' && p.state !== 'roll') {
      p.staminaWait = Math.max(0, p.staminaWait - TICK);
      if (p.staminaWait === 0) p.stamina = Math.min(PLAYER.stamina, p.stamina + PLAYER.staminaRegen * TICK);
    }
    const canRoll = () => p.bufRoll > 0 && p.rollCd === 0 && p.stamina >= ROLL.stamina;
    const canAttack = () => p.bufAttack > 0 && p.stamina > 0;

    if (p.state === 'idle' || p.state === 'walk') {
      if (canRoll()) return startRoll(p, cmd);
      if (canAttack()) return startAttack(p, 0, cmd);
      if (cmd.mx || cmd.mz) {
        const len = Math.hypot(cmd.mx, cmd.mz);
        [p.x, p.z] = collide(p.x + (cmd.mx / len) * PLAYER.speed * TICK, p.z + (cmd.mz / len) * PLAYER.speed * TICK, p.radius);
        p.facing += wrap(Math.atan2(cmd.mx, cmd.mz) - p.facing) * Math.min(1, PLAYER.turnRate * TICK);
        p.moving = true;
        if (p.state !== 'walk') setState(p, 'walk');
      } else if (p.state !== 'idle') setState(p, 'idle');
      return;
    }

    if (p.state === 'attack') {
      const a = ATTACKS[p.combo], t = p.stateT;
      if (t <= a.windup + a.active) {                       // step into the swing
        const v = a.lunge / (a.windup + a.active);
        [p.x, p.z] = collide(p.x + Math.sin(p.facing) * v * TICK, p.z + Math.cos(p.facing) * v * TICK, p.radius);
      }
      if (!p.hitDone && t >= a.windup) { p.hitDone = true; resolvePlayerHit(p, a); }
      const rec = t - a.windup - a.active;
      if (rec >= COMBAT.cancelAfter) {
        if (canRoll()) return startRoll(p, cmd);
        if (canAttack() && p.combo < ATTACKS.length - 1) return startAttack(p, p.combo + 1, cmd);
      }
      if (rec >= a.recover) { p.combo = 0; setState(p, 'idle'); }
      return;
    }

    if (p.state === 'roll') {
      const v = ROLL.distance / ROLL.duration;
      [p.x, p.z] = collide(p.x + Math.sin(p.rollDir) * v * TICK, p.z + Math.cos(p.rollDir) * v * TICK, p.radius);
      if (p.stateT >= ROLL.duration) { p.rollCd = ROLL.cooldown; setState(p, 'idle'); }
      return;
    }

    if (p.state === 'hurt') {
      [p.x, p.z] = collide(p.x + p.kx * TICK, p.z + p.kz * TICK, p.radius);
      p.kx *= 0.82; p.kz *= 0.82;
      if (p.stateT >= PLAYER.hurtStun) setState(p, 'idle');
    }
  }

  function hurtPlayer(dmg, fromX, fromZ) {
    const p = s.player;
    if (p.state === 'dead' || p.iframes > 0) return false;
    p.hp = Math.max(0, p.hp - dmg);
    const dx = p.x - fromX, dz = p.z - fromZ, d = Math.hypot(dx, dz) || 1;
    p.kx = (dx / d) * PLAYER.hurtKnock; p.kz = (dz / d) * PLAYER.hurtKnock;
    p.iframes = PLAYER.hurtIframes; p.combo = 0;
    emit('playerHurt', { dmg, x: p.x, z: p.z, hitstop: COMBAT.playerHitstop, shake: 2 });
    if (p.hp <= 0) { setState(p, 'dead'); emit('playerDead', {}); } else setState(p, 'hurt');
    return true;
  }

  // --- enemies -----------------------------------------------------------------
  function spawnHusk(x, z) {
    const e = {
      id: s.nextId++, kind: 'husk', x, z, facing: Math.atan2(-x, -z), radius: HUSK.radius,
      state: 'rise', stateT: 0, hp: HUSK.hp, flash: 0, token: false, hitDone: false, aim: 0,
      kx: 0, kz: 0, moving: false, strafe: rand() < 0.5 ? 1 : -1,
    };
    s.enemies.push(e);
    emit('spawn', { id: e.id, x, z });
    return e;
  }

  function stepHusk(e) {
    const p = s.player, H = HUSK;
    e.stateT += TICK;
    e.flash = Math.max(0, e.flash - TICK);
    e.moving = false;
    const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || 1e-4;
    const toPlayer = Math.atan2(dx, dz);
    const lit = lightAt(e.x, e.z);

    switch (e.state) {
      case 'rise':
        if (e.stateT >= H.rise) setState(e, 'chase');
        break;

      case 'chase': {
        if (p.state === 'dead') break;
        if (!e.token && s.tokens < TOKENS.melee && d < H.waitRing + 1.5) { e.token = true; s.tokens++; }
        // steering: close in when allowed to attack, otherwise hold the waiting ring and circle
        let vx = 0, vz = 0;
        const want = e.token ? 0 : H.waitRing;
        if (d > want + 0.2) { vx += dx / d; vz += dz / d; }
        else if (d < want - 0.4) { vx -= dx / d; vz -= dz / d; }
        if (!e.token) { vx += (dz / d) * 0.6 * e.strafe; vz += (-dx / d) * 0.6 * e.strafe; }
        for (const o of s.enemies) {                         // keep apart from the others
          if (o === e || o.state === 'dead') continue;
          const ox = e.x - o.x, oz = e.z - o.z, od = Math.hypot(ox, oz);
          if (od < H.separation && od > 1e-4) { const push = (H.separation - od) / H.separation; vx += (ox / od) * push * 1.6; vz += (oz / od) * push * 1.6; }
        }
        const len = Math.hypot(vx, vz);
        if (len > 0.15) {
          const speed = H.speed * lerp(LIGHT.enemySpeed[0], LIGHT.enemySpeed[1], lit);
          [e.x, e.z] = collide(e.x + (vx / len) * speed * TICK, e.z + (vz / len) * speed * TICK, e.radius);
          e.moving = true;
        }
        e.facing += wrap(toPlayer - e.facing) * Math.min(1, H.turnRate * TICK);
        if (e.token && d <= H.reach) { e.aim = toPlayer; e.facing = toPlayer; setState(e, 'windup'); emit('enemyWindup', { id: e.id, x: e.x, z: e.z }); }
        break;
      }

      case 'windup':
        if (e.stateT < H.windup * 0.5) { e.aim += wrap(toPlayer - e.aim) * Math.min(1, 4 * TICK); e.facing = e.aim; }   // tracks, then commits
        if (e.stateT >= H.windup) { e.hitDone = false; setState(e, 'attack'); }
        break;

      case 'attack':
        [e.x, e.z] = collide(e.x + Math.sin(e.aim) * (H.lunge / H.active) * TICK, e.z + Math.cos(e.aim) * (H.lunge / H.active) * TICK, e.radius);
        if (!e.hitDone) {
          e.hitDone = true;
          emit('enemyAttack', { id: e.id, x: e.x, z: e.z, facing: e.aim });
          if (d <= H.range + p.radius && Math.abs(wrap(toPlayer - e.aim)) <= H.arc / 2) {
            const dark = lightAt(p.x, p.z);
            hurtPlayer(Math.round(H.damage * lerp(LIGHT.enemyDamage[0], LIGHT.enemyDamage[1], dark)), e.x, e.z);
          }
        }
        if (e.stateT >= H.active) setState(e, 'recover');
        break;

      case 'recover':
        if (e.stateT >= H.recover) { if (e.token) { e.token = false; s.tokens--; } setState(e, 'chase'); }
        break;

      case 'hurt':
        [e.x, e.z] = collide(e.x + e.kx * TICK, e.z + e.kz * TICK, e.radius);
        e.kx *= 0.8; e.kz *= 0.8;
        if (e.stateT >= H.hurtStun) setState(e, 'chase');
        break;

      case 'dead':
        [e.x, e.z] = collide(e.x + e.kx * TICK, e.z + e.kz * TICK, e.radius);
        e.kx *= 0.8; e.kz *= 0.8;
        break;
    }
  }

  function stepWaves() {
    if (s.player.state === 'dead') return;
    if (s.enemies.length > 0) return;
    s.waveTimer -= TICK;
    if (s.waveTimer > 0) return;
    s.wave++;
    s.waveTimer = WAVES.delay;
    const n = Math.min(WAVES.first + (s.wave - 1) * WAVES.grow, WAVES.max);
    for (let i = 0; i < n; i++) {
      let x = 0, z = 0;
      for (let tries = 0; tries < 20; tries++) {
        const a = rand() * Math.PI * 2;
        [x, z] = collide(Math.cos(a) * WAVES.spawnRadius, Math.sin(a) * WAVES.spawnRadius, HUSK.radius);
        if (Math.hypot(x - s.player.x, z - s.player.z) > 3.2) break;
      }
      spawnHusk(x, z);
    }
    emit('wave', { n: s.wave, count: n });
  }

  // cmd: { mx, mz, attack, roll, restart } — attack/roll/restart are true only on the tick they were pressed
  function step(cmd) {
    s.tick++; s.time += TICK;
    if (s.player.state === 'dead' && cmd.restart && s.player.stateT >= WAVES.deathPause) { reset(); emit('restart', {}); return; }
    stepPlayer(cmd);
    for (const e of s.enemies) stepHusk(e);
    s.enemies = s.enemies.filter((e) => !(e.state === 'dead' && e.stateT >= HUSK.die));
    stepWaves();
  }

  function drain() { const ev = s.events; s.events = []; return ev; }

  return { state: s, step, drain, reset, lightAt, spawnHusk, hurtPlayer };
}

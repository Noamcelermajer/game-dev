// Every gameplay number lives here. Times are seconds, distances are world units
// (16 px each). Starting values come from docs/RESEARCH.md and are meant to be tuned.

export const TICK = 1 / 60;            // the simulation always advances in steps of this size

export const PLAYER = {
  radius: 0.35,
  speed: 4.2,
  turnRate: 14,
  hp: 100,
  stamina: 100,
  staminaRegen: 40,                    // per second
  staminaDelay: 0.5,                   // pause before regen starts after spending
  hurtStun: 0.25,
  hurtIframes: 1.0,                    // invulnerable after being hit
  hurtKnock: 5.0,                      // initial knockback speed
  lanternPower: 50,
  lanternHeight: 1.3,
};

// The light chain: two slashes and a finisher. range/arc describe the hit area in front.
export const ATTACKS = [
  { clip: 'Attack1', windup: 0.100, active: 0.067, recover: 0.200, damage: 10, stamina: 10, range: 1.75, arc: 2.3, lunge: 0.5, knock: 0.375, hitstop: 0.05, shake: 1 },
  { clip: 'Attack2', windup: 0.117, active: 0.067, recover: 0.233, damage: 10, stamina: 10, range: 1.75, arc: 2.3, lunge: 0.5, knock: 0.375, hitstop: 0.05, shake: 1 },
  { clip: 'Attack3', windup: 0.167, active: 0.083, recover: 0.333, damage: 16, stamina: 14, range: 1.95, arc: 1.5, lunge: 0.8, knock: 1.0, hitstop: 0.10, shake: 2, heavy: true },
];

export const COMBAT = {
  buffer: 0.15,                        // a press this early still counts
  cancelAfter: 0.10,                   // into recovery, the next attack or a roll may start
  killHitstop: 0.15,
  playerHitstop: 0.10,
  flash: 0.067,
  // Ashblade: stronger at low health. No bonus above `from`, full bonus at `to` (fractions of max HP).
  lowHp: { from: 0.5, to: 0.15, bonus: 0.4 },
};

export const ROLL = {
  duration: 0.35,
  iframes: 0.28,
  distance: 3.75,
  cooldown: 0.10,
  stamina: 25,
};

export const HUSK = {
  radius: 0.42,
  hp: 30,
  speed: 1.7,
  turnRate: 5,
  damage: 15,
  reach: 1.35,                         // starts its wind-up inside this distance
  range: 1.7,                          // how far the slam reaches
  arc: 1.9,
  lunge: 0.35,
  windup: 0.5,                         // the warning the player gets
  active: 0.1,
  recover: 0.7,                        // the player's opening
  hurtStun: 0.3,
  rise: 0.6,
  die: 0.8,
  waitRing: 3.3,                       // enemies without permission to attack circle at this distance
  separation: 1.15,
};

// Light at a point runs 0 (dark) to 1 (bright). Enemies are worse in the dark.
export const LIGHT = {
  k: 0.03,
  enemyDamage: [1.3, 0.85],            // multiplier in the dark, in full light
  enemySpeed: [1.25, 0.9],
};

export const TOKENS = { melee: 2 };    // how many enemies may attack at once

export const WAVES = { first: 2, grow: 1, max: 7, delay: 1.6, spawnRadius: 6.0, deathPause: 2.0 };

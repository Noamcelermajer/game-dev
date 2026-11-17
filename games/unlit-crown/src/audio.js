// Sound made in code with the Web Audio API: no audio files. Each effect is a short
// burst of shaped noise or a sliding tone. Browsers only allow sound after a key press
// or click, so nothing plays until unlock() has been called from one.
let ctx = null, master = null, noiseBuf = null, ambient = null;
let muted = false;

function ensure() {
  if (ctx) return true;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return true;
}

function envelope(vol, dur, delay, attack = 0.005) {
  const g = ctx.createGain(), t = ctx.currentTime + delay;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(master);
  return [g, t];
}

function tone({ type = 'sine', f0, f1 = f0, dur, vol = 0.3, delay = 0 }) {
  const [g, t] = envelope(vol, dur, delay);
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  o.connect(g); o.start(t); o.stop(t + dur + 0.02);
}

function noise({ f0, f1 = f0, q = 1, dur, vol = 0.3, delay = 0, type = 'bandpass' }) {
  const [g, t] = envelope(vol, dur, delay);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf; src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  src.connect(f); f.connect(g); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
}

const play = (fn) => (...args) => { if (!muted && ctx && ctx.state === 'running') fn(...args); };

export const sfx = {
  swing: play((heavy) => noise({ f0: heavy ? 500 : 900, f1: heavy ? 2400 : 3600, q: 1.4, dur: heavy ? 0.2 : 0.13, vol: heavy ? 0.3 : 0.22, delay: heavy ? 0.12 : 0.06 })),
  hit: play((heavy) => {
    noise({ f0: 2600, f1: 500, q: 0.7, dur: 0.09, vol: 0.4 });
    tone({ type: 'triangle', f0: heavy ? 150 : 210, f1: 55, dur: heavy ? 0.2 : 0.12, vol: heavy ? 0.6 : 0.4 });
  }),
  kill: play(() => {
    noise({ f0: 900, f1: 120, q: 0.6, dur: 0.5, vol: 0.35, type: 'lowpass' });
    tone({ type: 'sawtooth', f0: 170, f1: 45, dur: 0.45, vol: 0.2 });
  }),
  roll: play(() => noise({ f0: 420, f1: 1300, q: 0.8, dur: 0.24, vol: 0.16 })),
  hurt: play(() => {
    tone({ type: 'square', f0: 230, f1: 80, dur: 0.24, vol: 0.28 });
    noise({ f0: 1400, f1: 300, q: 0.6, dur: 0.16, vol: 0.3 });
  }),
  windup: play(() => tone({ type: 'sawtooth', f0: 85, f1: 190, dur: 0.46, vol: 0.13 })),   // rising: something is coming
  slam: play(() => {
    tone({ type: 'sine', f0: 105, f1: 36, dur: 0.3, vol: 0.6 });
    noise({ f0: 320, f1: 90, q: 0.5, dur: 0.22, vol: 0.3, type: 'lowpass' });
  }),
  spawn: play(() => noise({ f0: 160, f1: 620, q: 2.5, dur: 0.5, vol: 0.14 })),
  wave: play(() => { tone({ type: 'sine', f0: 196, dur: 1.5, vol: 0.2 }); tone({ type: 'sine', f0: 294, dur: 1.7, vol: 0.12, delay: 0.05 }); }),   // a low bell
  dead: play(() => { tone({ type: 'sine', f0: 147, f1: 60, dur: 2.0, vol: 0.4 }); tone({ type: 'sine', f0: 220, f1: 92, dur: 2.2, vol: 0.2, delay: 0.1 }); }),
};

// A quiet bed: a low drone that slowly breathes, plus fire crackle.
function startAmbient() {
  if (ambient) return;
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 4);
  bus.connect(master);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 240; lp.Q.value = 0.6;
  lp.connect(bus);
  for (const f of [55, 55.4, 82.4, 110.3]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = f;
    o.connect(lp); o.start();
  }
  const lfo = ctx.createOscillator(), depth = ctx.createGain();
  lfo.frequency.value = 0.07; depth.gain.value = 110;
  lfo.connect(depth); depth.connect(lp.frequency); lfo.start();
  const crackle = setInterval(() => {
    if (muted || ctx.state !== 'running') return;
    if (Math.random() < 0.55) noise({ f0: 1800 + Math.random() * 3000, q: 3, dur: 0.02 + Math.random() * 0.03, vol: 0.03 + Math.random() * 0.05 });
  }, 90);
  ambient = { bus, crackle };
}

export function unlock() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume();
  startAmbient();
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

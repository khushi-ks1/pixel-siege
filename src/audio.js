// Tiny chiptune-style sound effects using the Web Audio API (no audio files).

let ac = null;
let master = null;
let noiseBuf = null;
let muted = false;

// Browsers only allow audio after a user gesture, so call this on click/keypress.
export function initAudio() {
  if (ac) {
    if (ac.state === 'suspended') ac.resume();
    return;
  }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.25;
    master.connect(ac.destination);
    startMusic();
  } catch {
    ac = null;
  }
}

// Pause all sound while the tab is hidden
document.addEventListener('visibilitychange', () => {
  if (!ac) return;
  if (document.hidden) ac.suspend();
  else ac.resume();
});

// ---------- Background music: a looping chiptune in A minor (Am - F - C - G) ----------
const BPM = 132;
const STEP_LEN = 60 / BPM / 4; // 16th notes
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [
  { root: 45, arp: [69, 72, 76] }, // Am
  { root: 41, arp: [65, 69, 72] }, // F
  { root: 48, arp: [67, 72, 76] }, // C
  { root: 43, arp: [67, 71, 74] }, // G
];
const BASS = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];
let musicGain = null;
let musicTimer = null;
let nextT = 0;
let step = 0;

function scheduleStep(s, t) {
  const chord = CHORDS[Math.floor(s / 16) % CHORDS.length];
  const i = s % 16;
  if (BASS[i]) tone({ freq: mtof(chord.root + (i === 8 ? 12 : 0)), dur: STEP_LEN * 1.8, type: 'triangle', vol: 0.5, at: t, out: musicGain });
  tone({ freq: mtof(chord.arp[i % 3] + (i >= 8 ? 12 : 0)), dur: STEP_LEN * 0.9, type: 'square', vol: 0.05, at: t, out: musicGain });
  if (i % 4 === 2) noise({ dur: 0.04, vol: 0.12, freq: 7000, at: t, out: musicGain });
  if (i % 8 === 0) tone({ freq: 150, to: 40, dur: 0.12, type: 'sine', vol: 0.5, at: t, out: musicGain });
}

function startMusic() {
  if (!ac || musicTimer) return;
  musicGain = ac.createGain();
  musicGain.gain.value = 0.35;
  musicGain.connect(master);
  nextT = ac.currentTime + 0.1;
  musicTimer = setInterval(() => {
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05; // skip notes missed while throttled
    while (nextT < ac.currentTime + 0.15) {
      scheduleStep(step, nextT);
      nextT += STEP_LEN;
      step = (step + 1) % (16 * CHORDS.length);
    }
  }, 30);
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export const isMuted = () => muted;

function tone({ freq = 440, to = null, dur = 0.1, type = 'square', vol = 0.5, delay = 0, at = null, out = master }) {
  if (!ac || muted) return;
  const t = at ?? ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ dur = 0.2, vol = 0.4, freq = 1200, delay = 0, at = null, out = master }) {
  if (!ac || muted) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = at ?? ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(100, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(out);
  src.start(t);
  src.stop(t + dur + 0.05);
}

export const sfx = {
  shoot: () => tone({ freq: 880, to: 220, dur: 0.07, vol: 0.18 }),
  hit: () => tone({ freq: 220, to: 110, dur: 0.05, vol: 0.15 }),
  enemyDie() {
    noise({ dur: 0.18, vol: 0.4, freq: 1800 });
    tone({ freq: 300, to: 60, dur: 0.15, type: 'sawtooth', vol: 0.15 });
  },
  hurt() {
    tone({ freq: 160, to: 40, dur: 0.3, type: 'sawtooth', vol: 0.4 });
    noise({ dur: 0.25, vol: 0.3, freq: 900 });
  },
  enemyShoot: () => tone({ freq: 420, to: 260, dur: 0.1, type: 'triangle', vol: 0.25 }),
  combo() {
    [659, 880, 1175].forEach((f, i) => tone({ freq: f, dur: 0.08, vol: 0.2, delay: i * 0.05 }));
  },
  pickup() {
    tone({ freq: 988, dur: 0.07, vol: 0.25 });
    tone({ freq: 1319, dur: 0.12, vol: 0.25, delay: 0.07 });
    noise({ dur: 0.15, vol: 0.12, freq: 5000 });
  },
  dash() {
    noise({ dur: 0.18, vol: 0.25, freq: 4000 });
    tone({ freq: 300, to: 700, dur: 0.12, type: 'triangle', vol: 0.15 });
  },
  select: () => tone({ freq: 660, to: 990, dur: 0.08, vol: 0.25 }),
  levelClear() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.16, vol: 0.3, delay: i * 0.1 }));
  },
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => tone({ freq: f, dur: 0.28, type: 'triangle', vol: 0.4, delay: i * 0.2 }));
  },
  win() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone({ freq: f, dur: 0.18, vol: 0.3, delay: i * 0.12 }));
  },
  bossRoar() {
    tone({ freq: 90, to: 35, dur: 0.9, type: 'sawtooth', vol: 0.5 });
    noise({ dur: 0.9, vol: 0.3, freq: 500 });
  },
  explode() {
    noise({ dur: 0.7, vol: 0.6, freq: 900 });
    tone({ freq: 120, to: 30, dur: 0.6, type: 'sawtooth', vol: 0.3 });
  },
};

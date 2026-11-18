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
  } catch {
    ac = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export const isMuted = () => muted;

function tone({ freq = 440, to = null, dur = 0.1, type = 'square', vol = 0.5, delay = 0 }) {
  if (!ac || muted) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ dur = 0.2, vol = 0.4, freq = 1200, delay = 0 }) {
  if (!ac || muted) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(100, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(master);
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

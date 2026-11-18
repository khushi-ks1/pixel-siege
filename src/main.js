import { W, H } from './utils.js';
import { input, initInput } from './input.js';
import { initSprites } from './sprites.js';
import { LEVELS } from './levels.js';
import { initAudio, toggleMute } from './audio.js';
import { MenuScene } from './scenes/menu.js';
import { GameScene } from './scenes/game.js';
import { LevelCompleteScene } from './scenes/levelComplete.js';
import { GameOverScene } from './scenes/gameOver.js';
import { WinScene } from './scenes/win.js';

const HIGH_KEY = 'pixelSiege.highScore';
const SCENES = {
  menu: MenuScene,
  game: GameScene,
  levelComplete: LevelCompleteScene,
  gameOver: GameOverScene,
  win: WinScene,
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let k = 3; // real (device) pixels per game pixel

function loadHigh() {
  try { return Number(localStorage.getItem(HIGH_KEY)) || 0; } catch { return 0; }
}

const app = {
  scene: null,
  highScore: loadHigh(),
  goto(name, params = {}) {
    this.scene = new SCENES[name](this, params);
  },
  // returns true if this is a new high score
  submitScore(score) {
    if (score <= this.highScore) return false;
    this.highScore = score;
    try { localStorage.setItem(HIGH_KEY, String(score)); } catch { /* storage unavailable */ }
    return true;
  },
};

// Render at the screen's real resolution (so text is sharp) while the game itself
// still thinks in 320x180 "game pixels". k is a whole number so pixel art stays crisp.
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.min((window.innerWidth * 0.9) / W, (window.innerHeight * 0.9) / H);
  const cssScale = Math.min(fit, 3); // cap the size on big monitors
  k = Math.max(1, Math.floor(cssScale * dpr));
  canvas.width = W * k;
  canvas.height = H * k;
  canvas.style.width = `${(W * k) / dpr}px`;
  canvas.style.height = `${(H * k) / dpr}px`;
}

function drawCrosshair() {
  const x = Math.round(input.mouse.x), y = Math.round(input.mouse.y);
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(x - 6, y - 1, 4, 3);
  ctx.fillRect(x + 3, y - 1, 4, 3);
  ctx.fillRect(x - 1, y - 6, 3, 4);
  ctx.fillRect(x - 1, y + 3, 3, 4);
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(x - 5, y, 3, 1);
  ctx.fillRect(x + 3, y, 3, 1);
  ctx.fillRect(x, y - 5, 1, 3);
  ctx.fillRect(x, y + 3, 1, 3);
  ctx.fillStyle = '#e43b44';
  ctx.fillRect(x, y, 1, 1);
}

const STEP = 1 / 60;
let last = performance.now();
let acc = 0;

function frame(now) {
  acc += Math.min(0.25, (now - last) / 1000);
  last = now;
  while (acc >= STEP) {
    if (input.wasPressed('KeyM')) toggleMute();
    app.scene.update(STEP);
    input.endStep();
    acc -= STEP;
  }
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
  app.scene.draw(ctx);
  drawCrosshair();
  requestAnimationFrame(frame);
}

function start() {
  initSprites();
  initInput(canvas);
  // audio can only start after a user gesture
  window.addEventListener('mousedown', initAudio);
  window.addEventListener('keydown', initAudio);
  window.addEventListener('resize', resize);
  resize();
  // Dev shortcut: index.html?level=3 jumps straight into level 3
  const lv = Number(new URLSearchParams(location.search).get('level'));
  if (lv >= 1 && lv <= LEVELS.length) app.goto('game', { level: lv - 1 });
  else app.goto('menu');
  requestAnimationFrame(frame);
}

// Wait (briefly) for the pixel font so text doesn't flash in a fallback font
const fontReady = document.fonts
  ? Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('10px "VT323"')])
  : Promise.resolve();
Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))]).catch(() => {}).finally(start);

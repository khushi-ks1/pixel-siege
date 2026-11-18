import { W, H, clamp } from './utils.js';

const keys = new Set();
const pressed = new Set();

export const input = {
  mouse: { x: W * 0.7, y: H * 0.75 },
  mouseDown: false,
  clicked: false, // true for one update step after a mouse press

  isDown: (code) => keys.has(code),
  wasPressed: (code) => pressed.has(code),

  // Movement axis from arrow keys (WASD also works)
  axis() {
    let x = 0, y = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
    return { x, y };
  },

  anyStartPressed() {
    return this.clicked || pressed.has('Enter') || pressed.has('Space');
  },

  // Called after every fixed update step
  endStep() {
    pressed.clear();
    this.clicked = false;
  },
};

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    if (!e.repeat) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => {
    keys.clear();
    input.mouseDown = false;
  });

  const toGame = (e) => {
    const r = canvas.getBoundingClientRect();
    input.mouse.x = clamp(((e.clientX - r.left) / r.width) * W, 0, W - 1);
    input.mouse.y = clamp(((e.clientY - r.top) / r.height) * H, 0, H - 1);
  };

  window.addEventListener('mousemove', toGame);
  canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    toGame(e);
    input.mouseDown = true;
    input.clicked = true;
  });
  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) input.mouseDown = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

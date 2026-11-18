import { W, H, randInt } from './utils.js';

export function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Procedural tiled floor; each level passes its own colors.
export function makeFloor({ base, alt, speck }) {
  const c = makeCanvas();
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  g.fillStyle = alt;
  for (let ty = 0; ty < H; ty += 16) {
    for (let tx = 0; tx < W; tx += 16) {
      if (((tx + ty) / 16) % 2 === 0) g.fillRect(tx, ty, 16, 16);
    }
  }

  g.fillStyle = speck;
  for (let i = 0; i < 260; i++) g.fillRect(randInt(0, W), randInt(0, H), 1, 1);

  // little pebbles with a shadow underneath
  for (let i = 0; i < 18; i++) {
    const x = randInt(0, W), y = randInt(0, H);
    g.fillStyle = speck;
    g.fillRect(x, y, 2, 2);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(x, y + 2, 2, 1);
  }

  // darker edges
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(0, 0, W, 3);
  g.fillRect(0, H - 3, W, 3);
  g.fillRect(0, 0, 3, H);
  g.fillRect(W - 3, 0, 3, H);
  return c;
}

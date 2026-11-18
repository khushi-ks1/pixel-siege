// Internal (pre-scaling) resolution
export const W = 320;
export const H = 180;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function circleHit(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, r = a.r + b.r;
  return dx * dx + dy * dy < r * r;
}

// mix = { grunt: 0.6, runner: 0.4 } -> returns a key by weight
export function pickWeighted(mix) {
  let total = 0;
  for (const k in mix) total += mix[k];
  let r = Math.random() * total;
  for (const k in mix) {
    r -= mix[k];
    if (r <= 0) return k;
  }
  return Object.keys(mix)[0];
}

// Random point just outside one of the 4 screen edges (0=top,1=right,2=bottom,3=left)
export function edgePoint(side = randInt(0, 3), m = 14) {
  switch (side) {
    case 0: return { x: rand(0, W), y: -m };
    case 1: return { x: W + m, y: rand(16, H) };
    case 2: return { x: rand(0, W), y: H + m };
    default: return { x: -m, y: rand(16, H) };
  }
}

export function drawText(ctx, text, x, y, {
  size = 8, color = '#f4f4f4', align = 'left', shadow = '#1a1c2c', alpha = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  x = Math.round(x);
  y = Math.round(y);
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(text, x + 1, y + 1);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Semi-transparent horizontal band used behind banners
export function band(ctx, y, h, color = 'rgba(10,10,20,0.78)') {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, W, h);
}

export const blink = (t, rate = 2) => Math.floor(t * rate * 2) % 2 === 0;

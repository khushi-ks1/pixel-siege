import { W, H, drawText, blink } from './utils.js';
import { drawSprite } from './sprites.js';
import { PICKUPS } from './entities/pickup.js';

// Active power-ups in the bottom-left corner: icon + time-left bar
function drawPowers(ctx, p) {
  let i = 0;
  for (const [type, left] of Object.entries(p.powers)) {
    if (left <= 0) continue;
    const def = PICKUPS[type];
    const y = H - 9 - i * 12;
    if (left > 2 || blink(left, 4)) drawSprite(ctx, def.sprite, 0, 9, y);
    ctx.fillStyle = 'rgba(26,28,44,0.85)';
    ctx.fillRect(16, y - 2, 32, 4);
    ctx.fillStyle = def.color;
    ctx.fillRect(17, y - 1, Math.round((30 * left) / def.duration), 2);
    i++;
  }
}

export function drawHUD(ctx, g) {
  ctx.fillStyle = 'rgba(12,12,22,0.85)';
  ctx.fillRect(0, 0, W, 13);
  ctx.fillStyle = '#333c57';
  ctx.fillRect(0, 13, W, 1);

  // hearts
  const p = g.player;
  for (let i = 0; i < p.maxHp; i++) {
    drawSprite(ctx, i < p.hp ? 'heart' : 'heartEmpty', 0, 7 + i * 9, 7);
  }

  drawText(ctx, `LV${g.levelIndex + 1}`, 56, 2, { color: '#ffcd75' });

  // progress bar: kills remaining, or boss health during the boss fight
  const bx = 90, by = 3, bw = 92, bh = 7;
  let ratio, color, label;
  if (g.state === 'boss' && g.boss) {
    ratio = Math.max(0, g.boss.hp / g.boss.maxHp);
    color = '#e43b44';
    label = 'BOSS';
  } else {
    const total = g.level.killsToClear;
    const k = Math.min(g.kills, total);
    ratio = k / total;
    color = '#38b764';
    label = `${k}/${total}`;
  }
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#333c57';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = color;
  ctx.fillRect(bx, by, Math.round(bw * ratio), bh);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(bx, by, Math.round(bw * ratio), 1);
  drawText(ctx, label, bx + bw + 5, 2, { color: g.state === 'boss' ? '#e43b44' : '#f4f4f4' });

  drawText(ctx, String(g.score).padStart(6, '0'), W - 4, 2, { align: 'right' });

  drawPowers(ctx, p);
}

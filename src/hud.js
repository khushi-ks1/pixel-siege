import { W, drawText } from './utils.js';
import { drawSprite } from './sprites.js';

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

  drawText(ctx, `LV${g.levelIndex + 1}`, 56, 3, { color: '#ffcd75' });

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
  drawText(ctx, label, bx + bw + 5, 3, { color: g.state === 'boss' ? '#e43b44' : '#f4f4f4' });

  drawText(ctx, String(g.score).padStart(6, '0'), W - 4, 3, { align: 'right' });
}

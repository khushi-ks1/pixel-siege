import { W, H, drawText, blink } from '../utils.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { LEVELS } from '../levels.js';
import { makeFloor } from '../floor.js';

export class LevelCompleteScene {
  constructor(app, { level, score, hp }) {
    this.app = app;
    this.level = level;
    this.score = score;
    this.maxHp = 5;
    this.healed = hp < this.maxHp;
    this.hp = Math.min(this.maxHp, hp + 1);
    this.t = 0;
    this.floor = makeFloor(LEVELS[level].floor);
  }

  update(dt) {
    this.t += dt;
    if (this.t > 1 && input.anyStartPressed()) {
      sfx.select();
      this.app.goto('game', { level: this.level + 1, score: this.score, hp: this.hp });
    }
  }

  draw(ctx) {
    ctx.drawImage(this.floor, 0, 0);
    ctx.fillStyle = 'rgba(10,10,20,0.75)';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;

    drawText(ctx, `LEVEL ${this.level + 1} CLEAR!`, cx, 24, { size: 14, align: 'center', color: '#38b764' });
    drawText(ctx, `SCORE ${String(this.score).padStart(6, '0')}`, cx, 52, { align: 'center' });
    drawText(ctx, this.healed ? '+1 HEART' : 'HEALTH FULL', cx, 66, { align: 'center', color: '#e43b44' });

    // level progress pips
    const n = LEVELS.length, bw = 20, gap = 8;
    const total = n * bw + (n - 1) * gap;
    let x = Math.round(cx - total / 2);
    for (let i = 0; i < n; i++) {
      let fill = '#333c57', text = '#94b0c2';
      if (i <= this.level) { fill = '#38b764'; text = '#1a1c2c'; }
      else if (i === this.level + 1) { fill = blink(this.t, 2) ? '#ffcd75' : '#ef7d57'; text = '#1a1c2c'; }
      ctx.fillStyle = '#1a1c2c';
      ctx.fillRect(x - 1, 87, bw + 2, 16);
      ctx.fillStyle = fill;
      ctx.fillRect(x, 88, bw, 14);
      drawText(ctx, String(i + 1), x + bw / 2 + 1, 91, { align: 'center', color: text, shadow: null });
      x += bw + gap;
    }

    const next = LEVELS[this.level + 1];
    drawText(ctx, `NEXT: LEVEL ${this.level + 2}`, cx, 116, { align: 'center', color: '#94b0c2' });
    drawText(ctx, next.name, cx, 128, { align: 'center', color: '#ffcd75' });
    if (this.t > 1 && blink(this.t, 1.5)) {
      drawText(ctx, 'CLICK TO CONTINUE', cx, 156, { align: 'center', color: '#73eff7' });
    }
  }
}

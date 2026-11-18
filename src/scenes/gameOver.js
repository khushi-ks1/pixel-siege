import { W, H, drawText, blink } from '../utils.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';

export class GameOverScene {
  constructor(app, { level, score, retryScore, newHigh }) {
    this.app = app;
    this.level = level;
    this.score = score;
    this.retryScore = retryScore;
    this.newHigh = newHigh;
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    if (input.wasPressed('Escape')) {
      this.app.goto('menu');
      return;
    }
    if (this.t > 1 && input.anyStartPressed()) {
      sfx.select();
      // retry the same level with full health, score rewound to the level start
      this.app.goto('game', { level: this.level, score: this.retryScore, hp: 5 });
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#12060c';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    drawText(ctx, 'GAME OVER', cx, 34, { size: 14, align: 'center', color: '#e43b44' });
    drawText(ctx, `REACHED LEVEL ${this.level + 1}`, cx, 66, { align: 'center', color: '#94b0c2' });
    drawText(ctx, `SCORE    ${String(this.score).padStart(6, '0')}`, cx, 82, { align: 'center' });
    drawText(ctx, `HI-SCORE ${String(this.app.highScore).padStart(6, '0')}`, cx, 96, { align: 'center', color: '#ffcd75' });
    if (this.newHigh && blink(this.t, 2)) drawText(ctx, 'NEW HIGH SCORE!', cx, 112, { align: 'center', color: '#73eff7' });
    if (this.t > 1) {
      drawText(ctx, `CLICK TO RETRY LEVEL ${this.level + 1}`, cx, 140, { align: 'center', color: '#38b764' });
      drawText(ctx, 'ESC FOR MENU', cx, 154, { align: 'center', color: '#94b0c2' });
    }
  }
}

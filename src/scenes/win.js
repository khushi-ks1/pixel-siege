import { W, H, rand, drawText, blink } from '../utils.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { Particles } from '../entities/particles.js';

const COLORS = ['#ffcd75', '#ef7d57', '#e43b44', '#73eff7', '#38b764', '#f4f4f4'];

export class WinScene {
  constructor(app, { score, newHigh }) {
    this.app = app;
    this.score = score;
    this.newHigh = newHigh;
    this.t = 0;
    this.fireT = 0;
    this.particles = new Particles();
    sfx.win();
  }

  update(dt) {
    this.t += dt;
    this.fireT -= dt;
    if (this.fireT <= 0) {
      this.fireT = rand(0.25, 0.6);
      this.particles.burst(rand(30, W - 30), rand(20, 90), { count: 30, colors: [COLORS[Math.floor(rand(0, COLORS.length))]], speed: 90, life: 1.1, size: 2 });
    }
    this.particles.update(dt);
    if (this.t > 1.5 && input.anyStartPressed()) {
      sfx.select();
      this.app.goto('menu');
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#0d0b1e';
    ctx.fillRect(0, 0, W, H);
    this.particles.draw(ctx);
    const cx = W / 2;
    drawText(ctx, 'YOU WIN!', cx, 36, { size: 24, align: 'center', color: '#ffcd75' });
    drawText(ctx, 'THE SIEGE IS BROKEN', cx, 74, { align: 'center', color: '#94b0c2' });
    drawText(ctx, `SCORE    ${String(this.score).padStart(6, '0')}`, cx, 96, { align: 'center' });
    drawText(ctx, `HI-SCORE ${String(this.app.highScore).padStart(6, '0')}`, cx, 110, { align: 'center', color: '#ffcd75' });
    if (this.newHigh && blink(this.t, 2)) drawText(ctx, 'NEW HIGH SCORE!', cx, 126, { align: 'center', color: '#73eff7' });
    if (this.t > 1.5 && blink(this.t, 1.5)) drawText(ctx, 'CLICK FOR MENU', cx, 154, { align: 'center', color: '#38b764' });
  }
}

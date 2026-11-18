import { W, H } from '../utils.js';

export class Bullet {
  constructor(x, y, angle, speed, { enemy = false, damage = 1, r = 2, life = 1.5 } = {}) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.enemy = enemy;
    this.damage = damage;
    this.r = r;
    this.life = life;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0 || this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const x = Math.round(this.x), y = Math.round(this.y);
    if (this.enemy) {
      ctx.fillStyle = '#b13e53';
      ctx.fillRect(x - 2, y - 1, 4, 2);
      ctx.fillRect(x - 1, y - 2, 2, 4);
      ctx.fillStyle = '#ffcd75';
      ctx.fillRect(x - 1, y - 1, 2, 2);
      return;
    }
    // player bullet: bright head with a short trail
    const sp = Math.hypot(this.vx, this.vy) || 1;
    const dx = this.vx / sp, dy = this.vy / sp;
    ctx.fillStyle = '#b13e53';
    ctx.fillRect(Math.round(this.x - dx * 5), Math.round(this.y - dy * 5), 1, 1);
    ctx.fillStyle = '#ef7d57';
    ctx.fillRect(Math.round(this.x - dx * 3), Math.round(this.y - dy * 3), 1, 1);
    ctx.fillStyle = '#ffcd75';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}

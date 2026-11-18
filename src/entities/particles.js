import { rand, pick } from '../utils.js';

export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, { count = 8, colors = ['#fff'], speed = 60, life = 0.4, size = 1, angle = null, spread = Math.PI * 2 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = angle === null ? rand(0, Math.PI * 2) : angle + rand(-spread / 2, spread / 2);
      const s = rand(speed * 0.3, speed);
      const l = rand(life * 0.5, life);
      this.list.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: l,
        color: pick(colors),
        size,
      });
    }
  }

  update(dt) {
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.life -= dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
  }
}

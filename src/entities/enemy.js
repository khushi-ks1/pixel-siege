import { W, H, rand, randInt, clamp, edgePoint } from '../utils.js';
import { drawSprite, spriteSize } from '../sprites.js';
import { sfx } from '../audio.js';

// Data-driven enemy types. knock = how much bullets push them back (0..1).
export const ENEMY_TYPES = {
  grunt: {
    sprite: 'grunt', hp: 3, speed: 22, r: 5, score: 10, anim: 4, knock: 1,
    decal: '#1e4a33', parts: ['#38b764', '#257179', '#1a1c2c'],
  },
  runner: {
    sprite: 'runner', hp: 1, speed: 50, r: 4, score: 15, anim: 10, knock: 1, wobble: true,
    decal: '#6b2033', parts: ['#ef7d57', '#b13e53', '#ffcd75'],
  },
  tank: {
    sprite: 'tank', hp: 10, speed: 13, r: 7, score: 40, anim: 3, knock: 0.3,
    decal: '#2a2f4e', parts: ['#566c86', '#333c57', '#94b0c2'],
  },
  shooter: {
    sprite: 'shooter', hp: 3, speed: 26, r: 5, score: 25, anim: 4, knock: 1,
    ranged: { dist: 85, interval: 2.2, speed: 75 },
    decal: '#29366f', parts: ['#3b5dc9', '#73eff7', '#f4f4f4'],
  },
  boss: {
    sprite: 'boss', hp: 120, speed: 15, r: 13, score: 500, anim: 2, knock: 0, scale: 2, boss: true,
    decal: '#5d275d', parts: ['#b13e53', '#5d275d', '#ffcd75', '#73eff7'],
  },
};

export class Enemy {
  constructor(type, x, y) {
    const def = ENEMY_TYPES[type];
    this.type = type;
    this.def = def;
    this.x = x;
    this.y = y;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.r = def.r;
    this.flash = 0;
    this.t = rand(0, 10);
    this.phase = rand(0, Math.PI * 2);
    this.kx = 0; // knockback velocity
    this.ky = 0;
    this.facing = 1;
    this.dead = false;
    this.fireT = def.ranged ? rand(1, def.ranged.interval) : 0;
    this.bossT = 2;
    this.attack = 0;
  }

  get onScreen() {
    return this.x > 4 && this.x < W - 4 && this.y > 18 && this.y < H - 4;
  }

  update(dt, game) {
    const p = game.player;
    const dx = p.x - this.x, dy = p.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    let ux = dx / dist, uy = dy / dist;
    let speed = this.def.speed;
    this.t += dt;

    if (this.def.wobble) {
      const w = Math.sin(this.t * 8 + this.phase) * 0.8;
      ux += -uy * w;
      uy += (dx / dist) * w;
      const l = Math.hypot(ux, uy) || 1;
      ux /= l; uy /= l;
    }

    if (this.def.ranged) {
      const R = this.def.ranged;
      if (dist < R.dist - 10) { ux = -ux; uy = -uy; }          // back off
      else if (dist < R.dist + 10) {                             // strafe
        const s = Math.sin(this.phase) > 0 ? 1 : -1;
        [ux, uy] = [-uy * s, ux * s];
        speed *= 0.6;
      }
      this.fireT -= dt;
      if (this.fireT <= 0 && this.onScreen) {
        this.fireT = R.interval;
        game.enemyShoot(this.x, this.y, Math.atan2(dy, dx), R.speed);
      }
    }

    if (this.def.boss) {
      if (this.hp < this.maxHp / 2) speed *= 1.5; // enraged
      this.updateBoss(dt, game, dx, dy);
    }

    this.x += (ux * speed + this.kx) * dt;
    this.y += (uy * speed + this.ky) * dt;
    // once inside the arena, stay inside (so nobody lurks off-screen)
    if (!this.entered && this.onScreen) this.entered = true;
    if (this.entered) {
      this.x = clamp(this.x, 6, W - 6);
      this.y = clamp(this.y, 20, H - 6);
    }
    this.kx *= 0.85;
    this.ky *= 0.85;
    if (this.flash > 0) this.flash -= dt;
    this.facing = dx < 0 ? -1 : 1;
  }

  updateBoss(dt, game, dx, dy) {
    if (this.y < 24) return; // still walking in
    this.bossT -= dt;
    if (this.bossT > 0) return;
    const enraged = this.hp < this.maxHp / 2;
    this.attack++;
    const base = Math.atan2(dy, dx);

    if (this.attack % 3 === 0) {
      // summon a pair of runners
      for (let i = 0; i < 2; i++) {
        const p = edgePoint(randInt(0, 3));
        game.enemies.push(new Enemy('runner', p.x, p.y));
      }
      sfx.bossRoar();
      this.bossT = 1.2;
      return;
    }
    if (this.attack % 2 === 1) {
      // ring of bullets
      const n = enraged ? 18 : 12;
      for (let i = 0; i < n; i++) game.enemyShoot(this.x, this.y, base + (i / n) * Math.PI * 2, 60, true);
    } else {
      // aimed spread
      for (let i = -2; i <= 2; i++) game.enemyShoot(this.x, this.y, base + i * 0.18, 95, true);
    }
    sfx.enemyShoot();
    game.shake = Math.max(game.shake, 2);
    this.bossT = enraged ? 1.4 : 2.2;
  }

  hurt(dmg, angle) {
    this.hp -= dmg;
    this.flash = 0.08;
    const k = 90 * this.def.knock;
    this.kx += Math.cos(angle) * k;
    this.ky += Math.sin(angle) * k;
  }

  draw(ctx) {
    const s = this.def.scale || 1;
    const { w, h } = spriteSize(this.def.sprite);
    const x = Math.round(this.x), y = Math.round(this.y);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + (h * s) / 2, (w * s) / 2.5, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const frame = Math.floor(this.t * this.def.anim) % 2;
    drawSprite(ctx, this.def.sprite, frame, x, y, { flip: this.facing < 0, flash: this.flash > 0, scale: s });

    // small health bar for tougher non-boss enemies once damaged
    if (!this.def.boss && this.maxHp > 3 && this.hp < this.maxHp) {
      const bw = 12, by = y - Math.ceil((h * s) / 2) - 4;
      ctx.fillStyle = '#1a1c2c';
      ctx.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 4);
      ctx.fillStyle = '#e43b44';
      ctx.fillRect(x - bw / 2, by, Math.max(0, Math.round((bw * this.hp) / this.maxHp)), 2);
    }
  }
}

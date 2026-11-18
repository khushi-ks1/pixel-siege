import { W, H, rand, randInt, circleHit, drawText, band, blink } from '../utils.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { LEVELS } from '../levels.js';
import { Player } from '../entities/player.js';
import { Bullet } from '../entities/bullet.js';
import { Enemy } from '../entities/enemy.js';
import { Particles } from '../entities/particles.js';
import { Spawner } from '../spawner.js';
import { makeFloor, makeCanvas } from '../floor.js';
import { drawHUD } from '../hud.js';

// state: 'play' -> ('boss') -> 'cleared'   or   -> 'dead'
export class GameScene {
  constructor(app, { level = 0, score = 0, hp = 5 } = {}) {
    this.app = app;
    this.levelIndex = level;
    this.level = LEVELS[level];
    this.score = score;
    this.startScore = score;
    this.player = new Player();
    this.player.hp = hp;
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = new Particles();
    this.popups = [];
    this.kills = 0;
    this.spawner = new Spawner(this.level);
    this.floor = makeFloor(this.level.floor);
    this.decals = makeCanvas();
    this.shake = 0;
    this.freeze = 0;
    this.introT = 2.5;
    this.bannerT = 0;
    this.t = 0;
    this.paused = false;
    this.state = 'play';
    this.endT = 0;
    this.boss = null;
    this.newHigh = false;
  }

  // ---------- actions used by entities ----------
  playerShoot(x, y, angle) {
    this.bullets.push(new Bullet(x, y, angle, 240));
    this.particles.burst(x, y, { count: 2, colors: ['#ffcd75', '#ef7d57'], speed: 30, life: 0.1, angle, spread: 1 });
    sfx.shoot();
  }

  onDash(p) {
    this.particles.burst(p.x, p.y + 6, { count: 8, colors: ['#94b0c2', '#566c86', '#f4f4f4'], speed: 35, life: 0.3 });
    sfx.dash();
  }

  enemyShoot(x, y, angle, speed, silent = false) {
    this.enemyBullets.push(new Bullet(x, y, angle, speed, { enemy: true, r: 2, life: 6 }));
    if (!silent) sfx.enemyShoot();
  }

  // ---------- update ----------
  update(dt) {
    if ((input.wasPressed('Escape') || input.wasPressed('KeyP')) && (this.state === 'play' || this.state === 'boss')) {
      this.paused = !this.paused;
    }
    if (this.paused) {
      if (input.wasPressed('KeyQ')) this.app.goto('menu');
      return;
    }
    // hitstop: a tiny freeze-frame that makes heavy hits feel weighty
    if (this.freeze > 0) {
      this.freeze -= dt;
      return;
    }

    this.t += dt;
    this.introT -= dt;
    this.bannerT -= dt;
    this.shake = Math.max(0, this.shake - dt * 15);
    const alive = this.state !== 'dead';

    if (alive) this.player.update(dt, this);
    if (this.state === 'play' && this.introT <= 0) this.spawner.update(dt, this);

    for (const e of this.enemies) e.update(dt, this);
    this.separateEnemies();
    for (const b of this.bullets) b.update(dt);
    for (const b of this.enemyBullets) b.update(dt);

    // player bullets vs enemies
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const e of this.enemies) {
        if (e.dead || !circleHit(b, e)) continue;
        b.dead = true;
        this.hitEnemy(e, b);
        break;
      }
    }

    // enemies / enemy bullets vs player
    if (alive && this.state !== 'cleared') {
      const p = this.player;
      for (const b of this.enemyBullets) {
        if (!b.dead && circleHit(b, p)) {
          b.dead = true;
          this.hurtPlayer();
        }
      }
      for (const e of this.enemies) {
        if (e.dead || !circleHit(e, p)) continue;
        if (this.hurtPlayer()) {
          const a = Math.atan2(e.y - p.y, e.x - p.x);
          e.kx += Math.cos(a) * 160;
          e.ky += Math.sin(a) * 160;
        }
      }
    }

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.bullets = this.bullets.filter((b) => !b.dead);
    this.enemyBullets = this.enemyBullets.filter((b) => !b.dead);
    this.particles.update(dt);
    for (const p of this.popups) { p.y -= 15 * dt; p.life -= dt; }
    this.popups = this.popups.filter((p) => p.life > 0);

    // progression
    if (this.state === 'play' && this.kills >= this.level.killsToClear) {
      if (this.level.boss) this.spawnBoss();
      else this.clearLevel();
    }
    if (this.state === 'cleared' || this.state === 'dead') {
      this.endT -= dt;
      if (this.endT <= 0) this.finish();
    }
  }

  separateEnemies() {
    const list = this.enemies;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const nx = dx / d, ny = dy / d;
        const overlap = min - d;
        const wa = a.def.boss ? 0 : b.def.boss ? 1 : 0.5;
        const wb = b.def.boss ? 0 : a.def.boss ? 1 : 0.5;
        a.x -= nx * overlap * wa; a.y -= ny * overlap * wa;
        b.x += nx * overlap * wb; b.y += ny * overlap * wb;
      }
    }
  }

  hitEnemy(e, b) {
    e.hurt(b.damage, Math.atan2(b.vy, b.vx));
    sfx.hit();
    this.particles.burst(b.x, b.y, { count: 3, colors: e.def.parts, speed: 40, life: 0.2 });
    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    e.dead = true;
    this.score += e.def.score;
    this.popups.push({ x: e.x, y: e.y - 10, text: `+${e.def.score}`, life: 0.8, color: '#ffcd75' });
    this.splat(e);

    if (e.def.boss) {
      for (let i = 0; i < 5; i++) {
        this.particles.burst(e.x + rand(-12, 12), e.y + rand(-12, 12), { count: 25, colors: e.def.parts, speed: 120, life: 0.9, size: 2 });
      }
      this.shake = 7;
      this.freeze = 0.25;
      sfx.explode();
      this.clearLevel();
      return;
    }

    this.particles.burst(e.x, e.y, { count: 12, colors: e.def.parts, speed: 70, life: 0.45 });
    if (this.state === 'play') this.kills++;
    // save shake for heavy kills only, so it keeps its punch
    if (e.maxHp >= 10) {
      this.shake = Math.max(this.shake, 2.5);
      this.freeze = 0.06;
    }
    sfx.enemyDie();
  }

  // Persistent splat on the floor
  splat(e) {
    const g = this.decals.getContext('2d');
    const s = e.def.scale || 1;
    g.fillStyle = e.def.decal;
    for (let i = 0; i < 7 * s; i++) {
      g.fillRect(
        Math.round(e.x + rand(-6, 6) * s), Math.round(e.y + rand(-3, 5) * s),
        randInt(1, 3) * s, randInt(1, 2) * s,
      );
    }
  }

  hurtPlayer() {
    const p = this.player;
    if (!p.hurt()) return false;
    sfx.hurt();
    this.shake = 3.5;
    this.freeze = 0.08;
    this.particles.burst(p.x, p.y, { count: 10, colors: ['#e43b44', '#b13e53', '#f4c09a'], speed: 60, life: 0.4 });
    if (p.hp <= 0) this.die();
    return true;
  }

  spawnBoss() {
    this.state = 'boss';
    this.boss = new Enemy('boss', W / 2, -24);
    this.enemies.push(this.boss);
    this.bannerT = 2.5;
    this.shake = 5;
    sfx.bossRoar();
  }

  clearLevel() {
    this.state = 'cleared';
    this.endT = 2.5;
    this.enemyBullets = [];
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.dead = true;
      this.particles.burst(e.x, e.y, { count: 10, colors: e.def.parts, speed: 60, life: 0.4 });
    }
    sfx.levelClear();
  }

  die() {
    this.state = 'dead';
    this.endT = 2.2;
    const p = this.player;
    this.particles.burst(p.x, p.y, { count: 40, colors: ['#e43b44', '#b13e53', '#3b5dc9', '#f4c09a'], speed: 100, life: 0.9, size: 2 });
    this.shake = 6;
    this.newHigh = this.app.submitScore(this.score);
    sfx.gameOver();
  }

  finish() {
    if (this.state === 'dead') {
      this.app.goto('gameOver', {
        level: this.levelIndex, score: this.score, retryScore: this.startScore, newHigh: this.newHigh,
      });
    } else if (this.levelIndex === LEVELS.length - 1) {
      const newHigh = this.app.submitScore(this.score);
      this.app.goto('win', { score: this.score, newHigh });
    } else {
      this.app.goto('levelComplete', { level: this.levelIndex, score: this.score, hp: this.player.hp });
    }
  }

  // ---------- draw ----------
  draw(ctx) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate(Math.round(rand(-this.shake, this.shake)), Math.round(rand(-this.shake, this.shake)));
    }
    ctx.drawImage(this.floor, 0, 0);
    ctx.drawImage(this.decals, 0, 0);

    // depth-sort characters by y so lower ones draw in front
    const ents = this.enemies.slice();
    if (this.state !== 'dead') ents.push(this.player);
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) e.draw(ctx);

    for (const b of this.bullets) b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);
    this.particles.draw(ctx);
    for (const p of this.popups) {
      drawText(ctx, p.text, p.x, p.y, { align: 'center', color: p.color, alpha: Math.min(1, p.life * 2) });
    }
    ctx.restore();

    drawHUD(ctx, this);
    this.drawOverlays(ctx);
  }

  drawOverlays(ctx) {
    const cx = W / 2;
    if (this.state === 'play' && this.introT > 0) {
      band(ctx, 66, 46);
      drawText(ctx, `LEVEL ${this.levelIndex + 1}`, cx, 72, { size: 14, align: 'center', color: '#ffcd75' });
      drawText(ctx, this.level.name, cx, 92, { align: 'center' });
      if (blink(this.t, 3)) drawText(ctx, 'GET READY!', cx, 102, { align: 'center', color: '#73eff7' });
    }
    if (this.state === 'boss' && this.bannerT > 0 && blink(this.t, 4)) {
      band(ctx, 76, 26);
      drawText(ctx, '!! WARNING !!', cx, 81, { size: 14, align: 'center', color: '#e43b44' });
    }
    if (this.state === 'cleared') {
      band(ctx, 72, 30);
      drawText(ctx, 'LEVEL CLEAR!', cx, 79, { size: 14, align: 'center', color: '#38b764' });
    }
    if (this.state === 'dead') {
      band(ctx, 72, 30);
      drawText(ctx, 'YOU DIED', cx, 79, { size: 14, align: 'center', color: '#e43b44' });
    }
    if (this.paused) {
      ctx.fillStyle = 'rgba(10,10,20,0.7)';
      ctx.fillRect(0, 0, W, H);
      drawText(ctx, 'PAUSED', cx, 66, { size: 14, align: 'center', color: '#ffcd75' });
      drawText(ctx, 'ESC: RESUME', cx, 96, { align: 'center' });
      drawText(ctx, 'Q: QUIT TO MENU', cx, 110, { align: 'center' });
    }
  }
}

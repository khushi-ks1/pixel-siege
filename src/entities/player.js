import { W, H, clamp, rand } from '../utils.js';
import { input } from '../input.js';
import { drawSprite, spriteImg } from '../sprites.js';

const DASH_TIME = 0.16;
const DASH_COOLDOWN = 0.75;
const DASH_SPEED = 230;

export class Player {
  constructor() {
    this.x = W / 2;
    this.y = H / 2 + 6;
    this.r = 4;
    this.maxHp = 5;
    this.hp = 5;
    this.speed = 72;
    this.fireDelay = 0.15;
    this.cool = 0;
    this.inv = 0;      // invincibility timer after a hit
    this.recoil = 0;
    this.flashT = 0;   // muzzle flash timer
    this.animT = 0;
    this.moving = false;
    this.aim = 0;
    this.dashT = 0;    // > 0 while dashing (invulnerable)
    this.dashCool = 0;
    this.dashDir = { x: 1, y: 0 };
    this.trail = [];   // after-images while dashing
    this.powers = { rapid: 0, spread: 0 }; // seconds left on each power-up
  }

  get dashing() {
    return this.dashT > 0;
  }

  update(dt, game) {
    let { x, y } = input.axis();
    const len = Math.hypot(x, y);
    if (len) { x /= len; y /= len; }
    this.moving = len > 0;

    // dodge-dash: in the movement direction, or toward the mouse if standing still
    this.dashCool -= dt;
    const dashKey = input.wasPressed('Space') || input.wasPressed('ShiftLeft') || input.wasPressed('ShiftRight');
    if (dashKey && this.dashCool <= 0) {
      this.dashDir = len ? { x, y } : { x: Math.cos(this.aim), y: Math.sin(this.aim) };
      this.dashT = DASH_TIME;
      this.dashCool = DASH_COOLDOWN;
      game.onDash(this);
    }

    let speed = this.speed;
    if (this.dashing) {
      this.dashT -= dt;
      speed = DASH_SPEED;
      x = this.dashDir.x;
      y = this.dashDir.y;
      this.trail.push({ x: this.x, y: this.y, life: 0.15 });
    }
    for (const t of this.trail) t.life -= dt;
    this.trail = this.trail.filter((t) => t.life > 0);

    this.x = clamp(this.x + x * speed * dt, 6, W - 6);
    this.y = clamp(this.y + y * speed * dt, 22, H - 8);
    this.animT += dt;

    this.aim = Math.atan2(input.mouse.y - (this.y + 2), input.mouse.x - this.x);

    this.cool -= dt;
    this.inv -= dt;
    this.flashT -= dt;
    this.recoil = Math.max(0, this.recoil - dt * 30);

    for (const k in this.powers) this.powers[k] = Math.max(0, this.powers[k] - dt);

    if (input.mouseDown && this.cool <= 0) {
      this.cool = this.powers.rapid > 0 ? this.fireDelay / 2 : this.fireDelay;
      this.recoil = 2;
      this.flashT = 0.05;
      const tip = this.gunTip();
      const aim = this.aim + rand(-0.04, 0.04);
      game.playerShoot(tip.x, tip.y, aim);
      if (this.powers.spread > 0) {
        game.playerShoot(tip.x, tip.y, aim - 0.2, true);
        game.playerShoot(tip.x, tip.y, aim + 0.2, true);
      }
    }
  }

  gunTip() {
    return { x: this.x + Math.cos(this.aim) * 10, y: this.y + 2 + Math.sin(this.aim) * 10 };
  }

  hurt() {
    if (this.inv > 0 || this.dashing) return false;
    this.hp--;
    this.inv = 1.2;
    return true;
  }

  drawGun(ctx) {
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y + 2));
    ctx.rotate(this.aim);
    if (Math.cos(this.aim) < 0) ctx.scale(1, -1); // keep gun upright when aiming left
    ctx.drawImage(spriteImg('gun'), Math.round(2 - this.recoil), -1);
    if (this.flashT > 0) {
      const fx = Math.round(10 - this.recoil);
      ctx.fillStyle = '#ffcd75';
      ctx.fillRect(fx, -2, 3, 4);
      ctx.fillRect(fx + 3, -1, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx, -1, 2, 2);
    }
    ctx.restore();
  }

  draw(ctx) {
    const back = Math.sin(this.aim) < -0.4; // aiming up -> show back of head
    const flip = Math.cos(this.aim) < 0;
    const name = back ? 'playerBack' : 'playerFront';

    // dash after-images (drawn as white silhouettes fading out)
    for (const t of this.trail) {
      drawSprite(ctx, name, 2, t.x, t.y, { flip, flash: true, alpha: t.life * 3 });
    }

    if (this.inv > 0 && Math.floor(this.inv * 16) % 2 === 0) return; // hit blink
    const x = Math.round(this.x), y = Math.round(this.y);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 7, 4.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // dash recharge bar under the feet
    if (this.dashCool > 0) {
      const w = Math.round(10 * (1 - this.dashCool / DASH_COOLDOWN));
      ctx.fillStyle = 'rgba(26,28,44,0.8)';
      ctx.fillRect(x - 6, y + 10, 12, 3);
      ctx.fillStyle = '#73eff7';
      ctx.fillRect(x - 5, y + 11, w, 1);
    }

    const frame = this.moving || this.dashing
      ? 2 + (Math.floor(this.animT * 10) % 4)
      : Math.floor(this.animT * 2) % 2;

    if (back) this.drawGun(ctx);
    drawSprite(ctx, name, frame, x, y, { flip });
    if (!back) this.drawGun(ctx);
  }
}

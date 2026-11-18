import { W, H, clamp, rand } from '../utils.js';
import { input } from '../input.js';
import { drawSprite, spriteImg } from '../sprites.js';

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
  }

  update(dt, game) {
    let { x, y } = input.axis();
    const len = Math.hypot(x, y);
    if (len) { x /= len; y /= len; }
    this.moving = len > 0;
    this.x = clamp(this.x + x * this.speed * dt, 6, W - 6);
    this.y = clamp(this.y + y * this.speed * dt, 22, H - 8);
    this.animT += dt;

    this.aim = Math.atan2(input.mouse.y - (this.y + 2), input.mouse.x - this.x);

    this.cool -= dt;
    this.inv -= dt;
    this.flashT -= dt;
    this.recoil = Math.max(0, this.recoil - dt * 30);

    if (input.mouseDown && this.cool <= 0) {
      this.cool = this.fireDelay;
      this.recoil = 2;
      this.flashT = 0.05;
      const tip = this.gunTip();
      game.playerShoot(tip.x, tip.y, this.aim + rand(-0.04, 0.04));
    }
  }

  gunTip() {
    return { x: this.x + Math.cos(this.aim) * 10, y: this.y + 2 + Math.sin(this.aim) * 10 };
  }

  hurt() {
    if (this.inv > 0) return false;
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
    if (this.inv > 0 && Math.floor(this.inv * 16) % 2 === 0) return; // hit blink
    const x = Math.round(this.x), y = Math.round(this.y);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 7, 4.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const back = Math.sin(this.aim) < -0.4; // aiming up -> show back of head
    const flip = Math.cos(this.aim) < 0;
    const frame = this.moving
      ? 2 + (Math.floor(this.animT * 10) % 4)
      : Math.floor(this.animT * 2) % 2;
    const name = back ? 'playerBack' : 'playerFront';

    if (back) this.drawGun(ctx);
    drawSprite(ctx, name, frame, x, y, { flip });
    if (!back) this.drawGun(ctx);
  }
}

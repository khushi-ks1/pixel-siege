import { drawSprite } from '../sprites.js';

export const PICKUPS = {
  heart: { sprite: 'heart', label: '+1 HEART', color: '#e43b44' },
  rapid: { sprite: 'powerRapid', label: 'RAPID FIRE!', color: '#ffcd75', duration: 8 },
  spread: { sprite: 'powerSpread', label: 'TRIPLE SHOT!', color: '#73eff7', duration: 8 },
};

// Items dropped by enemies. They bob in place and blink before vanishing.
export class Pickup {
  constructor(type, x, y) {
    this.type = type;
    this.def = PICKUPS[type];
    this.x = x;
    this.y = y;
    this.r = 6;
    this.life = 9;
    this.t = 0;
    this.dead = false;
  }

  update(dt) {
    this.t += dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    if (this.life < 2.5 && Math.floor(this.t * 8) % 2 === 0) return; // about to vanish
    const bob = Math.round(Math.sin(this.t * 4) * 1.5);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(Math.round(this.x) - 3, Math.round(this.y) + 4, 7, 1);
    drawSprite(ctx, this.def.sprite, 0, this.x, this.y - 2 + bob);
  }
}

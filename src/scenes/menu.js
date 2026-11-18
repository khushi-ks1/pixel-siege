import { W, H, rand, drawText, blink } from '../utils.js';
import { input } from '../input.js';
import { sfx, initAudio } from '../audio.js';
import { LEVELS } from '../levels.js';
import { makeFloor } from '../floor.js';
import { drawSprite } from '../sprites.js';
import { Player } from '../entities/player.js';

const DEMO_TYPES = ['grunt', 'runner', 'tank', 'shooter'];

export class MenuScene {
  constructor(app) {
    this.app = app;
    this.t = 0;
    this.floor = makeFloor(LEVELS[0].floor);
    this.hero = new Player();
    this.hero.x = 0;
    this.hero.y = 0;
    // background enemies wandering across the screen
    this.demo = Array.from({ length: 6 }, (_, i) => ({
      type: DEMO_TYPES[i % DEMO_TYPES.length],
      x: rand(0, W),
      y: 24 + i * 26,
      dir: i % 2 ? 1 : -1,
      speed: rand(10, 25),
    }));
  }

  update(dt) {
    this.t += dt;
    this.hero.animT += dt;
    const cx = W / 2, cy = 88, s = 3;
    this.hero.aim = Math.atan2(input.mouse.y - (cy + 2 * s), input.mouse.x - cx);
    for (const d of this.demo) {
      d.x += d.dir * d.speed * dt;
      if (d.x > W + 20) d.x = -20;
      if (d.x < -20) d.x = W + 20;
    }
    if (input.anyStartPressed()) {
      initAudio();
      sfx.select();
      this.app.goto('game', { level: 0 });
    }
  }

  draw(ctx) {
    ctx.drawImage(this.floor, 0, 0);
    for (const d of this.demo) {
      drawSprite(ctx, d.type, Math.floor(this.t * 4) % 2, d.x, d.y, { flip: d.dir < 0 });
    }
    ctx.fillStyle = 'rgba(10,10,20,0.55)';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    drawText(ctx, 'PIXEL SIEGE', cx + 2, 18, { size: 20, align: 'center', color: '#b13e53', shadow: '#1a1c2c' });
    drawText(ctx, 'PIXEL SIEGE', cx, 16, { size: 20, align: 'center', color: '#ffcd75', shadow: null });
    drawText(ctx, 'SURVIVE 5 LEVELS OF THE HORDE', cx, 46, { align: 'center', color: '#94b0c2' });

    // big animated hero in the middle, aiming at the mouse
    ctx.save();
    ctx.translate(cx, 88);
    ctx.scale(3, 3);
    this.hero.draw(ctx);
    ctx.restore();

    if (blink(this.t, 1.5)) drawText(ctx, 'CLICK TO START', cx, 122, { align: 'center', color: '#73eff7' });
    drawText(ctx, 'ARROWS MOVE - MOUSE AIM+SHOOT', cx, 142, { align: 'center' });
    drawText(ctx, 'ESC PAUSE - M MUTE', cx, 154, { align: 'center', color: '#94b0c2' });
    drawText(ctx, `HI-SCORE ${String(this.app.highScore).padStart(6, '0')}`, cx, 168, { align: 'center', color: '#ffcd75' });
  }
}

import { lerp, rand, randInt, pickWeighted, edgePoint } from './utils.js';
import { Enemy } from './entities/enemy.js';

// Spawns exactly `killsToClear` regular enemies over the level, from random screen edges.
export class Spawner {
  constructor(level) {
    this.level = level;
    this.timer = 0.5;
    this.spawned = 0;
  }

  update(dt, game) {
    const L = this.level;
    if (this.spawned >= L.killsToClear) return;
    this.timer -= dt;
    const alive = game.enemies.filter((e) => !e.def.boss).length;
    if (this.timer > 0 || alive >= L.maxAlive) return;

    const progress = game.kills / L.killsToClear;
    this.timer = lerp(L.spawnStart, L.spawnEnd, progress) * rand(0.7, 1.3);

    const groupSize = L.groupChance && Math.random() < L.groupChance ? randInt(2, 3) : 1;
    const side = randInt(0, 3);
    for (let i = 0; i < groupSize && this.spawned < L.killsToClear; i++) {
      const p = edgePoint(side);
      game.enemies.push(new Enemy(pickWeighted(L.enemyMix), p.x, p.y));
      this.spawned++;
    }
  }
}

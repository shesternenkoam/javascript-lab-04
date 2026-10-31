import { Entity } from './Entity.js';

export class Bullet extends Entity {
  constructor(pos, vel) {
    super({ pos: pos, vel: vel, radius: 2, kind: 'bullet' });
    this.ttl = 1.5;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.destroy();
  }
}
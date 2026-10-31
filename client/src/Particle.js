import { Entity } from './Entity.js';

export class Particle extends Entity {
  constructor(pos, vel) {
    super({ pos, vel, radius: 2, kind: 'particle' });
    this.ttl = 0.5 + Math.random() * 0.5;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.destroy();
  }
}
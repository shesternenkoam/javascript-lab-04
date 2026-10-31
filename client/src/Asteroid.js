import { Entity } from './Entity.js';
import { Vector2 } from './Vector2.js';

export class Asteroid extends Entity {
  constructor(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    const vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);

    super({ pos: new Vector2(x, y), vel: vel, radius: 20, kind: 'asteroid' });
  }
}
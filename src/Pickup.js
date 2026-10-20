import { Entity } from './Entity.js';
import { Vector2 } from './Vector2.js';

export class Pickup extends Entity {
  constructor(x, y) {
    super({
      pos: new Vector2(x, y),
      vel: new Vector2(0, 0), // Стоїть на місці
      radius: 12,
      kind: 'pickup'
    });
  }
}
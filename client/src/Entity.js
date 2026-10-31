import { Vector2 } from './Vector2.js';

export class Entity {
  static #nextId = 1;
  #id;

  constructor({ pos = new Vector2(), vel = new Vector2(), radius = 10, kind = 'entity' } = {}) {
    this.#id = Entity.#nextId++;
    this.pos = pos;
    this.vel = vel;
    this.radius = radius;
    this.kind = kind;
    this.isDead = false;
  }

  get id() { return this.#id; }

  update(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
  }

  destroy() {
    this.isDead = true;
  }
}
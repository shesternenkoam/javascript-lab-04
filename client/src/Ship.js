import { eventBus } from './events.js';
import { Entity } from './Entity.js';
import { Vector2 } from './Vector2.js';
import { Bullet } from './Bullet.js';

export class Ship extends Entity {
  #hp = 100;

  constructor(x, y, world) {
    super({ pos: new Vector2(x, y), vel: new Vector2(0, 0), radius: 15, kind: 'ship' });
    this.world = world;
    this.angle = 0;
    this.rotationSpeed = Math.PI * 1.5;
    this.speed = 250;
  }

  get hp() { return Math.max(0, this.#hp); }

  takeDamage(amount) {
    if (this.isDead) return;
    this.#hp -= amount;
    if (this.#hp <= 0) {
      this.destroy();
      this.world.createExplosion(this.pos);
      setTimeout(() => {
        this.#hp = 100;
        this.isDead = false;
        this.pos = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.vel = new Vector2(0, 0);
        this.world.spawn(this);
      }, 2000);
    }
  }

  heal(amount) {
    if (this.isDead) return;
    this.#hp += amount;
    if (this.#hp > 100) this.#hp = 100; // Максимум 100 HP
  }

  update(dt, input) {
    if (input.a) this.angle -= this.rotationSpeed * dt;
    if (input.d) this.angle += this.rotationSpeed * dt;
    if (input.w) {
      const accelX = Math.cos(this.angle) * this.speed * dt;
      const accelY = Math.sin(this.angle) * this.speed * dt;
      this.vel = this.vel.add(new Vector2(accelX, accelY));
    }
    this.vel = this.vel.scale(0.98);
    super.update(dt);
  }

  fire(e) {
    if (e.code !== 'Space' || this.isDead) return; 
    const bulletVel = new Vector2(Math.cos(this.angle) * 500, Math.sin(this.angle) * 500);
    this.world.spawn(new Bullet(this.pos.clone(), bulletVel));
    eventBus.dispatchEvent(new CustomEvent('fired'));
  }
}
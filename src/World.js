import { Particle } from './Particle.js';
import { Vector2 } from './Vector2.js';

export class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.entities = new Map();
  }

  spawn(entity) { this.entities.set(entity.id, entity); }
  despawn(entity) { entity.destroy(); }

  *ofKind(kind) {
    for (const entity of this.entities.values()) {
      if (entity.kind === kind && !entity.isDead) yield entity;
    }
  }

  sweep() {
    for (const [id, entity] of this.entities) {
      if (entity.isDead) this.entities.delete(id);
    }
  }

  createExplosion(pos) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.spawn(new Particle(pos.clone(), vel));
    }
  }

  checkCollisions() {
    const arr = Array.from(this.entities.values());
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i];
        const b = arr[j];
        if (a.isDead || b.isDead) continue;

        const dist = a.pos.sub(b.pos).length();
        if (dist < a.radius + b.radius) {
          
          if ((a.kind === 'bullet' && b.kind === 'asteroid') || (a.kind === 'asteroid' && b.kind === 'bullet')) {
            a.destroy();
            b.destroy();
            this.createExplosion(a.pos);
          }
          
          if ((a.kind === 'ship' && b.kind === 'asteroid') || (a.kind === 'asteroid' && b.kind === 'ship')) {
            const ship = a.kind === 'ship' ? a : b;
            const ast = a.kind === 'asteroid' ? a : b;
            ast.destroy();
            this.createExplosion(ast.pos);
            ship.takeDamage(34);
          }
          if ((a.kind === 'ship' && b.kind === 'pickup') || (a.kind === 'pickup' && b.kind === 'ship')) {
            const ship = a.kind === 'ship' ? a : b;
            const pickup = a.kind === 'pickup' ? a : b;
            pickup.destroy();
            ship.heal(50);
          }
        }
      }
    }
  }

  step(dt, input) {
    for (const entity of this.entities.values()) {
      if (entity.isDead) continue;
      if (entity.kind === 'ship') entity.update(dt, input);
      else entity.update(dt);
      
      this.wrapScreen(entity);
    }

    this.checkCollisions();
    this.sweep();
  }

  wrapScreen(entity) {
    if (entity.pos.x < 0) entity.pos.x = this.width;
    else if (entity.pos.x > this.width) entity.pos.x = 0;
    if (entity.pos.y < 0) entity.pos.y = this.height;
    else if (entity.pos.y > this.height) entity.pos.y = 0;
  }
}
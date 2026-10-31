export function applyHoming(entity, getTarget) {
  // Зберігаємо оригінальний метод update
  const originalUpdate = entity.update.bind(entity);
  
  entity.isHoming = true; 

  entity.update = function(dt) {
    const target = getTarget();
    
    if (target && !target.isDead) {
      const dir = target.pos.sub(this.pos).normalize();
      this.vel = this.vel.add(dir.scale(150 * dt));
      const maxSpeed = 120;
      if (this.vel.length() > maxSpeed) {
        this.vel = this.vel.normalize().scale(maxSpeed);
      }
    }

    originalUpdate(dt);
  };
  
  return entity;
}
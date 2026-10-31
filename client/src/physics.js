export function integrate(ship, input, dt) {
  // новий об'єкт стану
  const nextShip = { ...ship };
  const speed = 250; // в пікселях за секунду
  const rotationSpeed = Math.PI * 1.5; // радіан за секунду

  if (input.a) nextShip.angle -= rotationSpeed * dt;
  if (input.d) nextShip.angle += rotationSpeed * dt;
  
  if (input.w) {
    nextShip.vx += Math.cos(nextShip.angle) * speed * dt;
    nextShip.vy += Math.sin(nextShip.angle) * speed * dt;
  }

  // тертя щоб корабель зупинявся
  nextShip.vx *= 0.98;
  nextShip.vy *= 0.98;

  nextShip.x += nextShip.vx * dt;
  nextShip.y += nextShip.vy * dt;

  return nextShip;
}
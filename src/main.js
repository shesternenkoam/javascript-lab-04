import './style.css';
import { createInput } from './input.js';
import { World } from './World.js';
import { Ship } from './Ship.js';
import { Asteroid } from './Asteroid.js';
import { Pickup } from './Pickup.js';
import { applyHoming } from './components.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width * dpr;
canvas.height = height * dpr;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
ctx.scale(dpr, dpr);

const world = new World(width, height);
const ship = new Ship(width / 2, height / 2, world);
world.spawn(ship);

// --- 1. СТАРТОВИЙ СПАВН (З'являються миттєво при завантаженні) ---
for (let i = 0; i < 4; i++) {
  world.spawn(new Asteroid(Math.random() * width, Math.random() * height));
}

const homingAst = new Asteroid(100, 100);
applyHoming(homingAst, () => ship);
world.spawn(homingAst);

world.spawn(new Pickup(Math.random() * width, Math.random() * height));

// --- 2. НЕСКІНЧЕННЕ ПОПОВНЕННЯ ВОРЕДІВ ТА БОНУСІВ ---
setInterval(() => {
  const astCount = Array.from(world.entities.values()).filter(e => e.kind === 'asteroid' && !e.isHoming && !e.isDead).length;
  if (astCount < 6) {
    world.spawn(new Asteroid(Math.random() * width, Math.random() * height));
  }
}, 3000);

setInterval(() => {
  const homingCount = Array.from(world.entities.values()).filter(e => e.kind === 'asteroid' && e.isHoming && !e.isDead).length;
  if (homingCount < 2) {
    const newHoming = new Asteroid(Math.random() * width, Math.random() * height);
    applyHoming(newHoming, () => ship);
    world.spawn(newHoming);
  }
}, 8000);

setInterval(() => {
  const pickupCount = Array.from(world.entities.values()).filter(e => e.kind === 'pickup' && !e.isDead).length;
  if (pickupCount < 1) {
    world.spawn(new Pickup(Math.random() * width, Math.random() * height));
  }
}, 12000);

// --- 3. КЕРУВАННЯ ТА ІГРОВИЙ ЦИКЛ ---
const getInput = createInput();
window.addEventListener('keydown', (e) => ship.fire(e));

let lastTime = performance.now();
let accumulator = 0;
const dt = 1 / 60;

function frame(time) {
  const frameTime = (time - lastTime) / 1000;
  lastTime = time;
  accumulator += Math.min(frameTime, 0.1);

  while (accumulator >= dt) {
    world.step(dt, getInput());
    accumulator -= dt;
  }
  render();
  requestAnimationFrame(frame);
}

function render() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  for (const entity of world.entities.values()) {
    if (entity.kind === 'ship') {
      ctx.save();
      ctx.translate(entity.pos.x, entity.pos.y);
      ctx.rotate(entity.angle);
      ctx.beginPath();
      ctx.moveTo(entity.radius, 0);
      ctx.lineTo(-entity.radius, entity.radius * 0.8);
      ctx.lineTo(-entity.radius, -entity.radius * 0.8);
      ctx.closePath();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (entity.kind === 'bullet') {
      ctx.beginPath();
      ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'yellow';
      ctx.fill();
    } else if (entity.kind === 'asteroid') {
      ctx.beginPath();
      ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
      ctx.strokeStyle = entity.isHoming ? 'red' : 'gray'; 
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (entity.kind === 'particle') {
      ctx.beginPath();
      ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'orange';
      ctx.fill();
    } else if (entity.kind === 'pickup') {
      ctx.fillStyle = 'green';
      ctx.fillRect(entity.pos.x - 10, entity.pos.y - 10, 20, 20);
      ctx.fillStyle = 'white';
      ctx.fillRect(entity.pos.x - 2, entity.pos.y - 8, 4, 16);
      ctx.fillRect(entity.pos.x - 8, entity.pos.y - 2, 16, 4);
    }
  }

  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`HP: ${ship.hp}`, 20, 40);
}

requestAnimationFrame(frame);
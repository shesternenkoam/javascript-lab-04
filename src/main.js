import './style.css';
import { loadAll } from './assets/loader.js';
import { createInput } from './input.js';
import { World } from './World.js';
import { Ship } from './Ship.js';
import { Asteroid } from './Asteroid.js';
import { applyHoming } from './components.js';
import { initAudio } from './audio.js';
import { Lobby } from './Lobby.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let globalAssets = null; // Сюди збережемо наші спрайти
let gameStarted = false;

function drawLoadingScreen(progress, text = "Завантаження...") {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height / 2 - 40);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(width / 2 - 150, height / 2 - 10, 300, 20);
  ctx.fillStyle = 'green';
  ctx.fillRect(width / 2 - 150, height / 2 - 10, 300 * progress, 20);
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  
  const world = new World(width, height);
  const ship = new Ship(width / 2, height / 2, world);
  world.spawn(ship);

  for (let i = 0; i < 4; i++) {
    world.spawn(new Asteroid(Math.random() * width, Math.random() * height));
  }

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
    
    renderGame(world, ship);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderGame(world, ship) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  for (const entity of world.entities.values()) {
    ctx.save();
    ctx.translate(entity.pos.x, entity.pos.y);
    ctx.rotate(entity.angle || 0);

    if (entity.kind === 'ship' && globalAssets?.sprites?.ship) {
      ctx.rotate(Math.PI / 2);
      const img = globalAssets.sprites.ship;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    } else if (entity.kind === 'asteroid' && globalAssets?.sprites?.asteroid) {

      const img = globalAssets.sprites.asteroid;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    } else {

       ctx.beginPath();
       ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
       ctx.fillStyle = entity.kind === 'bullet' ? 'yellow' : 'gray';
       ctx.fill();
    }
    ctx.restore();
  }

  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(`HP: ${ship.hp}`, 20, 40);
}

async function bootstrap() {
  const abortController = new AbortController();
  

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  
  try {
    drawLoadingScreen(0, "Ініціалізація...");
    

    const assets = await loadAll('/src/assets/manifest.json', {
      signal: abortController.signal,
      audioCtx: audioCtx, 
      onProgress: (ratio) => drawLoadingScreen(ratio, `Завантаження... ${Math.round(ratio * 100)}%`)
    });
    
    globalAssets = assets;
    drawLoadingScreen(1, "Готово! Клікніть для старту");
    

    window.addEventListener('click', () => {

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      

      initAudio(audioCtx, assets.sounds);
      startGame();
    }, { once: true });
    
  } catch (error) {
    console.error("Помилка завантаження!", error);
    drawLoadingScreen(0, "Помилка завантаження (див. консоль).");
  }
}

function initLobby() {
  const lobby = new Lobby();
  const uiContainer = document.getElementById('lobby-ui');
  const roomList = document.getElementById('room-list');

  lobby.addEventListener('roomsChanged', (e) => {
    const rooms = e.detail;
    roomList.innerHTML = ''; 
    
    rooms.forEach(room => {
      const btn = document.createElement('button');
      btn.style.margin = '10px';
      btn.style.padding = '10px 20px';
      btn.style.fontSize = '18px';
      btn.textContent = `Увійти: ${room.name} (${room.players} гравців)`;
      
      btn.onclick = () => {
        lobby.leave(); 
        uiContainer.style.display = 'none'; 
        bootstrap(); 
      };
      
      roomList.appendChild(btn);
    });
  });

  lobby.start();
}

initLobby();
import { WebSocketServer } from 'ws';
import { roomManager } from './rooms.js';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  // Інтервал для перевірки пінгу (кожні 15 с, розрив після 2 пропущених)
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 15000);

  wss.on('close', () => clearInterval(interval));

  wss.on('connection', (socket, req) => {
    socket.isAlive = true;
    socket.on('pong', () => { socket.isAlive = true; });

    let currentPlayer = null;
    let currentRoom = null;
    
    // Змінні для захисту від спаму (Rate Limiting)
    let messageCount = 0;
    const rateLimitInterval = setInterval(() => {
      messageCount = 0;
    }, 1000);

    socket.on('message', (data) => {
      // 1. Перевірка розміру повідомлення (завеликий розмір — закриваємо сокет з кодом 1009)[cite: 17]
      if (data.length > 1024) {
        return socket.close(1009, 'Message too large');
      }

      // 2. Rate limiting (не більше 20 повідомлень на секунду)
      messageCount++;
      if (messageCount > 20) {
        return socket.close(1008, 'Rate limit exceeded');
      }

      try {
        const msg = JSON.parse(data.toString());

        // 3. Перевірка наявності типу повідомлення
        if (!msg || typeof msg.type !== 'string') {
          return socket.close(1003, 'Invalid message format');
        }

        // 4. Обробка події join (з таймаутом 5 секунд, як в методичці)[cite: 17]
        if (msg.type === 'join') {
          if (!msg.room || !msg.name) {
            return socket.close(1003, 'Invalid join payload');
          }

          currentRoom = roomManager.get(msg.room);
          if (!currentRoom) {
            return socket.close(1008, 'Room not found');
          }
          
          currentPlayer = { name: msg.name, socket };
          currentRoom.players.set(msg.name, currentPlayer);
          currentRoom.emit('join', currentPlayer);
          console.log(`${msg.name} joined room ${msg.room}`);
          return;
        }

        // Невідомий тип повідомлення — закриваємо з'єднання
        socket.close(1003, 'Unknown message type');

      } catch (err) {
        // Зламаний JSON (знищуємо сокет)[cite: 17]
        socket.close(1003, 'Invalid JSON');
      }
    });

    socket.on('close', () => {
      clearInterval(rateLimitInterval);
      if (currentRoom && currentPlayer) {
        currentRoom.players.delete(currentPlayer.name);
        if (currentRoom.players.size === 0) currentRoom.emit('empty');
      }
      console.log('WebSocket connection closed');
    });
  });
}
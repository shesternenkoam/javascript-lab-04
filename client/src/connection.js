export class Connection {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.sendQueue = [];
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.connect();
  }

  connect() {
    console.log(`Connecting to WS: ${this.url}...`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WS Connected');
      this.isConnected = true;
      this.reconnectDelay = 1000;
      
      while (this.sendQueue.length > 0) {
        this.socket.send(this.sendQueue.shift());
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const handler = this.listeners.get(msg.type);
        if (handler) handler(msg);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      console.log(`WS Closed. Reconnecting in ${this.reconnectDelay}ms...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000); 
    };
  }

  send(message) {
    const data = JSON.stringify(message);
    if (this.isConnected) {
      this.socket.send(data);
    } else {
      this.sendQueue.push(data); 
    }
  }

  on(type, callback) {
    this.listeners.set(type, callback);
  }
}

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
export const connection = new Connection(`${protocol}//${window.location.host}/ws`);
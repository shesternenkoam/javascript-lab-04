export class Lobby extends EventTarget {
  constructor() {
    super();
    this.active = false;
    this.abortController = null;
    this.interval = null;
  }

  async refresh() {
    if (!this.active) return;
    
    try {
      if (this.abortController) this.abortController.abort();
      
      this.abortController = new AbortController();
      const timeoutSignal = AbortSignal.timeout(3000);
      timeoutSignal.addEventListener('abort', () => this.abortController.abort());

      const response = await fetch('/api/rooms.json', { signal: this.abortController.signal });
      if (!response.ok) throw new Error('Network error');
      
      const rooms = await response.json();
      this.dispatchEvent(new CustomEvent('roomsChanged', { detail: rooms }));
      
    } catch (error) {
      if (error.name !== 'AbortError') {
         console.error('Помилка завантаження лобі:', error);
      }
    }
  }

  start() {
    this.active = true;
    this.refresh();
    this.interval = setInterval(() => this.refresh(), 3000); // Оновлюємо кожні 3 сек
  }

  leave() {
    this.active = false;
    clearInterval(this.interval);
    if (this.abortController) {
      this.abortController.abort(); 
    }
  }
}
const EventEmitter = require('events');
const http = require('http');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.metrics = {};
    this.totalEvents = 0;
    this.wildcardListeners = [];
  }

  on(event, listener, priority = 0) {
    if (!this.metrics[event]) this.metrics[event] = { calls: 0, errors: 0 };
    listener._priority = priority;
    
    const listeners = this.listeners(event);
    listeners.push(listener);
    listeners.sort((a, b) => b._priority - a._priority);
    
    this.removeAllListeners(event);
    for (const l of listeners) super.on(event, l);
    return this;
  }

  once(event, listener, priority = 0) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      listener(...args);
    };
    return this.on(event, wrapped, priority);
  }

  onAny(listener) {
    this.wildcardListeners.push(listener);
  }

  off(event, listener) {
    super.removeListener(event, listener);
    return this;
  }

  emit(event, ...args) {
    if (this.metrics[event]) this.metrics[event].calls++;
    this.totalEvents++;

    for (const wc of this.wildcardListeners) {
      wc(event, args);
    }

    try {
      return super.emit(event, ...args);
    } catch (err) {
      if (this.metrics[event]) this.metrics[event].errors++;
      super.emit('error', err, event);
      return false;
    }
  }

  getMetrics() {
    return {
      group: 'ББМО-01-23',
      events: Object.keys(this.metrics).reduce((acc, key) => {
        acc[key] = this.metrics[key].calls;
        return acc;
      }, {}),
      total: this.totalEvents,
      listeners: this.eventNames().reduce((acc, name) => {
        acc[name] = this.listenerCount(name);
        return acc;
      }, {})
    };
  }
}

const bus = new EventBus();
const group = 'ББМО-01-23';

bus.on('error', (err, event) => {
  console.log(`[ERROR] [${group}] Ошибка в слушателе "${event}": ${err.message}`);
}, 100);

console.log(`=== EventBus (группа ${group}) ===`);
console.log('--- Приоритеты ---');
bus.on('test-priority', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('test-priority', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('test-priority', () => console.log('[priority 5] Средний приоритет'), 5);
bus.emit('test-priority');

console.log('\n--- Wildcard ---');
bus.onAny((event, args) => console.log(`[onAny] Событие "${event}" с аргументами: ["${args.join('", "')}"]`));
bus.emit('greet', 'Иван');
bus.emit('info', group);

console.log('\n--- Once-кэш ---');
let onceCount = 0;
bus.once('tick', () => { onceCount++; });
bus.emit('tick');
bus.emit('tick');
bus.emit('tick');
console.log(`once-слушатель вызван: ${onceCount} раз`);

console.log('\n--- Обработка ошибок ---');
bus.on('test-error', () => { throw new Error('Тестовая ошибка 1'); });
bus.on('test-error', () => { throw new Error('Тестовая ошибка 2'); });
bus.emit('test-error');
bus.emit('test-error');

console.log('\n--- Метрики ---');
const metrics = bus.getMetrics();
for (const [ev, count] of Object.entries(metrics.events)) {
  console.log(`${ev}: ${count} вызовов`);
}
console.log(`Всего событий: ${metrics.total}`);

const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    bus.emit('request', req.url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log('\nСервер запущен на http://localhost:3000');
  console.log('Открой в браузере: http://localhost:3000/metrics');
});
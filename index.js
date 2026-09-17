const http = require('http');
const { EventEmitter } = require('events');
const logger = require('./logger');
const { OrderHandler, computePi } = require('./orderHandler');

const orderHandler = new OrderHandler();

orderHandler.on('order:start', (orderId) => {
  console.log(`[order:start] Заказ #${orderId} начат`);
});

orderHandler.on('order:processing', ({ orderId, message }) => {
  console.log(`[order:processing] Заказ #${orderId}: ${message}`);
});

orderHandler.on('order:complete', ({ orderId, sum }) => {
  const pi = computePi();
  console.log(
    ` Заказ #${orderId} завершён на сумму ${sum} руб. PI = ${pi.toFixed(7)}`
  );
});

class AppServer extends EventEmitter {
  constructor() {
    super();
    this.server = null;
    this.port = null;
  }

  start(port) {
    this.port = port;

    this.server = http.createServer((req, res) => {
      this.emit('request:received', { method: req.method, url: req.url });

      const orderMatch = req.url.match(/^\/order\/(\d+)$/);
      if (req.method === 'GET' && orderMatch) {
        const orderId = orderMatch[1];
        orderHandler.processOrder(orderId);

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Заказ #${orderId} принят в обработку.`);
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Hello from Event-Driven Server!');
    });

    this.server.listen(port, () => {
      this.emit('server:started', port);
    });
  }

  stop() {
    if (!this.server) return;
    this.server.close(() => {
      this.emit('server:stopped');
    });
  }
}

const app = new AppServer();
logger.setupLogger(app);

app.on('server:started', (port) => {
  console.log(`🚀 Сервер запущен на порту ${port}`);
});

app.on('request:received', ({ method, url }) => {
  console.log(`📨 Получен запрос: ${method} ${url}`);
});

app.on('server:stopped', () => {
  console.log('🛑 Сервер остановлен');
});

app.start(3000);

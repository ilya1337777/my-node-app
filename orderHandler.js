const { EventEmitter } = require('events');


class OrderHandler extends EventEmitter {

  processOrder(orderId) {

    this.emit('order:start', orderId);

    setTimeout(() => {
      this.emit('order:processing', {
        orderId,
        message: 'Идёт обработка...',
      });

      setTimeout(() => {
        const sum = Math.floor(Math.random() * 901) + 100; // от 100 до 1000
        this.emit('order:complete', { orderId, sum });
      }, 2000);
    }, 2000);
  }
}

function computePi() {
  let pi = 0;
  const iterations = 10_000_000; // больше итераций — выше точность

  for (let i = 0; i < iterations; i++) {
    const sign = i % 2 === 0 ? 1 : -1;
    pi += sign / (2 * i + 1);
  }

  return pi * 4;
}

module.exports = { OrderHandler, computePi };
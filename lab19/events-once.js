const EventEmitter = require('events');
const emitter = new EventEmitter();

let onCount = 0;
let onceCount = 0;

emitter.on('tick', () => console.log(`[tick #${onCount + 1}] on-слушатель`)).on('tick', () => { onCount++; });
emitter.once('tick', () => { console.log(`[tick #1] once-слушатель`); onceCount++; });

console.log('=== Сравнение on и once ===');
emitter.emit('tick');
emitter.emit('tick');
emitter.emit('tick');

console.log(`on-слушатель вызван: ${onCount} раза`);
console.log(`once-слушатель вызван: ${onceCount} раз`);

console.log('\n=== Управление подписками ===');
const listener1 = () => {};
const listener2 = () => {};
const listener3 = () => {};
emitter.on('test', listener1);
emitter.on('test', listener2);
emitter.on('test', listener3);

console.log(`Слушателей до удаления: ${emitter.listenerCount('test')}`);
emitter.removeListener('test', listener2);
console.log(`Слушателей после удаления одного: ${emitter.listenerCount('test')}`);
emitter.removeAllListeners('test');
console.log(`Слушателей после removeAllListeners: ${emitter.listenerCount('test')}`);

console.log('\n=== Порядок вызова ===');
const order = new EventEmitter();
order.on('order', () => console.log('1. Первый слушатель (группа ББМО-01-23)'));
order.on('order', () => console.log('2. Второй слушатель'));
order.on('order', () => console.log('3. Третий слушатель'));
order.emit('order');
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('greet', (name) => console.log(`[greet] Привет, ${name}!`));
emitter.on('info', () => console.log('[info] Группа: ББМО-01-23'));
emitter.on('bye', () => console.log('[bye] До свидания!'));

console.log('=== Демонстрация EventEmitter ===');
emitter.emit('greet', 'Иван');
emitter.emit('info');
emitter.emit('bye');

console.log(`Событие "unknown" без слушателей: ${emitter.emit('unknown')}`);
console.log(`Событие "greet" со слушателями: ${emitter.emit('greet', 'Иван')}`);
const EventEmitter = require('events');

class PluginManager extends EventEmitter {}
const pm = new PluginManager();

pm.on('newListener', (event, listener) => {
  if (event !== 'newListener' && event !== 'removeListener') {
    console.log(`[newListener] Добавлен слушатель "${event}"`);
  }
});
pm.on('removeListener', (event, listener) => {
  if (event !== 'newListener' && event !== 'removeListener') {
    console.log(`[removeListener] Удалён слушатель "${event}"`);
  }
});

console.log('=== Система плагинов ===');
pm.on('plugin:registered', () => {});
pm.on('plugin:removed', () => {});

const logListener = () => console.log('[PLUGIN] Работает LoggerPlugin');
pm.on('log', logListener);
console.log('[PLUGIN] Зарегистрирован: LoggerPlugin');

const alertListener = () => console.log('[PLUGIN] Работает AlertPlugin');
pm.on('alert', alertListener);
console.log('[PLUGIN] Зарегистрирован: AlertPlugin');

pm.removeListener('log', logListener);
console.log('[PLUGIN] Удалён: LoggerPlugin');

console.log('\n=== Демонстрация утечки ===');
const leakEmitter = new EventEmitter();
for (let i = 0; i < 10; i++) leakEmitter.on('leak', () => {});
console.log(`Слушателей до: ${leakEmitter.listenerCount('leak')}`);

for (let i = 0; i < 1000; i++) leakEmitter.on('leak', () => {});
console.log(`Слушателей после добавления 1000: ${leakEmitter.listenerCount('leak')}`);
leakEmitter.removeAllListeners('leak');
console.log(`Слушателей после removeAllListeners: ${leakEmitter.listenerCount('leak')}`);

console.log('\n=== Асинхронные слушатели ===');
const asyncEmitter = new EventEmitter();
asyncEmitter.on('async', async () => {
  await new Promise((r) => setTimeout(r, 100));
  console.log('[BBMO-01-23] async-слушатель завершён через 100ms');
});
console.log('[BBMO-01-23] emit вызван (не ждёт async-слушатель)');
asyncEmitter.emit('async');
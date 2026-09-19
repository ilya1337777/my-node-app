// ============================================================
// Демонстрация порядка выполнения асинхронных операций в Node.js
// ============================================================
//
// Ожидаемый порядок вывода:
//   5. Синхронный код
//   3. process.nextTick
//   4. Promise.then
//   1. setTimeout
//   2. setImmediate
//
// Объяснение по фазам Event Loop:
//
// 1) Синхронный код — пока стек вызовов не пуст, Event Loop не работает.
// 2) process.nextTick — не часть Event Loop, выполняется сразу после
//    текущей операции. Наивысший приоритет.
// 3) Promise.then — микрозадачи, обрабатываются после nextTick.
// 4) setTimeout(0) — фаза timers (первая фаза Event Loop).
// 5) setImmediate — фаза check (после timers).
// ============================================================

setTimeout(() => {
  console.log('1. setTimeout');
}, 0);

setImmediate(() => {
  console.log('2. setImmediate');
});

process.nextTick(() => {
  console.log('3. process.nextTick');
});

Promise.resolve().then(() => {
  console.log('4. Promise.then');
});

console.log('5. Синхронный код');

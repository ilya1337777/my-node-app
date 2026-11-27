const { Readable } = require('stream');

const chunks = [
  'Группа: ББМО-01-23\n',
  'Студент: Иванов Иван\n',
  'Лабораторная работа: №21\n',
  'Тема: Потоки в Node.js\n'
];

let chunkIndex = 0;
let totalSize = 0;

const readable = new Readable({
  read(size) {
    if (chunkIndex < chunks.length) {
      const data = chunks[chunkIndex];
      totalSize += Buffer.byteLength(data);
      this.push(data);
      chunkIndex++;
    } else {
      this.push(null); // конец потока
    }
  }
});

console.log('=== Демонстрация Readable-потока ===');
readable.on('data', (chunk) => {
  console.log(`[CHUNK ${chunkIndex}] ${chunk.toString().trim()}`);
});

readable.on('end', () => {
  console.log('[END] Поток завершён');
  console.log(`Всего получено чанков: ${chunkIndex}`);
  console.log(`Общий размер данных: ${totalSize} байт`);
});

readable.on('error', (err) => console.error('[ERROR]', err.message));
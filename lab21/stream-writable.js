const { Writable } = require('stream');

let writeCount = 0;

const writable = new Writable({
  highWaterMark: 16,
  write(chunk, encoding, callback) {
    setTimeout(() => {
      console.log(`[WRITE] ${chunk.toString().trim()}`);
      writeCount++;
      callback();
    }, 100);
  }
});

writable.on('drain', () => console.log('[DRAIN] Буфер освобождён, продолжаем запись'));
writable.on('finish', () => {
  console.log('[FINISH] Все данные записаны');
  console.log(`Всего записано: ${writeCount} чанка`);
});

console.log('=== Демонстрация Writable-потока ===');

const data = [
  'Группа: ББМО-01-23\n',
  'Студент: Иванов Иван\n',
  'Лабораторная работа: №21\n',
  'Тема: Потоки в Node.js\n'
];

let i = 0;
function writeNext() {
  if (i >= data.length) {
    writable.end();
    return;
  }
  const canContinue = writable.write(data[i]);
  console.log(`write() вернул: ${canContinue}${canContinue ? '' : ' <- буфер переполнен!'}`);
  i++;
  
  if (!canContinue) {
    writable.once('drain', writeNext);
  } else {
    writeNext();
  }
}

writeNext();
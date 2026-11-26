const fs = require('fs');
const { pipeline, Transform } = require('stream');

console.log('=== Демонстрация pipe() ===');
const rs1 = fs.createReadStream('input.txt');
const ws1 = fs.createWriteStream('output-pipe.txt');
rs1.pipe(ws1);
ws1.on('finish', () => console.log('✔ Копирование через pipe завершено'));

console.log('\n=== Демонстрация pipe() с ошибкой ===');
const rs2 = fs.createReadStream('missing.txt');
const ws2 = fs.createWriteStream('output-error.txt');
rs2.pipe(ws2);
rs2.on('error', (err) => {
  console.log(`✖ Ошибка: ${err.message}`);
  console.log('⚠ Внимание: pipe() не закрыл целевой поток!');
});

console.log('\n=== Демонстрация pipeline() ===');
pipeline(
  fs.createReadStream('input.txt'),
  fs.createWriteStream('output-pipeline.txt'),
  (err) => {
    if (err) console.error('Ошибка pipeline:', err);
    else console.log('✔ Копирование через pipeline завершено');
  }
);

console.log('\n=== Демонстрация pipeline() с ошибкой ===');
pipeline(
  fs.createReadStream('missing.txt'),
  fs.createWriteStream('output-pipeline-err.txt'),
  (err) => {
    console.log(`✖ Ошибка: ${err.code} - ${err.message}`);
    console.log('✔ Все потоки автоматически закрыты (pipeline)');
  }
);

console.log('\n=== Цепочка потоков (Transform) ===');
const upperCase = new Transform({
  transform(chunk, enc, cb) { cb(null, chunk.toString().toUpperCase()); }
});
const reverse = new Transform({
  transform(chunk, enc, cb) { cb(null, chunk.toString().split('').reverse().join('')); }
});

pipeline(
  fs.createReadStream('input.txt'),
  upperCase,
  reverse,
  fs.createWriteStream('output-chain.txt'),
  (err) => {
    if (err) console.error('Ошибка цепочки:', err);
    else console.log('✔ Обработка цепочкой завершена (output-chain.txt)');
  }
);
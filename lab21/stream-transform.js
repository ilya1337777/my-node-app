const { Transform, Readable, Writable } = require('stream');

// 1. UpperCaseTransform
class UpperCaseTransform extends Transform {
  constructor() { super({ objectMode: true }); }
  _transform(chunk, enc, cb) {
    cb(null, `[BBMO-01-23] ${chunk.toString().toUpperCase()}`);
  }
}

// 2. JsonParserTransform
class JsonParserTransform extends Transform {
  constructor() { super({ objectMode: true }); }
  _transform(chunk, enc, cb) {
    try { cb(null, JSON.parse(chunk.toString())); }
    catch (e) { cb(e); }
  }
}

// 3. FilterTransform
class FilterTransform extends Transform {
  constructor() { super({ objectMode: true }); }
  _transform(obj, enc, cb) {
    if (obj.group === 'ББМО-01-23') cb(null, obj);
    else cb();
  }
}

// Демо UpperCase
console.log('=== Демонстрация Transform-потока ===');
const upper = new UpperCaseTransform();
upper.on('data', (d) => console.log(`Выход: "${d}"`));
upper.write('группа ббмо-01-23');
upper.write('студент иванов');
upper.end();

// Демо Object Mode + фильтрация
console.log('\n=== Демонстрация Object Mode и фильтрации ===');
const jsonParser = new JsonParserTransform();
const filter = new FilterTransform();
const writable = new Writable({
  objectMode: true,
  write(obj, enc, cb) {
    console.log(`[OBJECT] ${JSON.stringify(obj)}`);
    cb();
  }
});

jsonParser.pipe(filter).pipe(writable);

jsonParser.write(JSON.stringify({ id: 1, name: 'Иван', group: 'ББМО-01-23' }));
jsonParser.write(JSON.stringify({ id: 2, name: 'Мария', group: 'ББМО-02-23' }));
jsonParser.write(JSON.stringify({ id: 3, name: 'Петр', group: 'ББМО-01-23' }));
jsonParser.end();

// Демо Async Iterator
setTimeout(() => {
  console.log('\n=== Демонстрация async iterator ===');
  const readable = Readable.from(['Данные 1', 'Данные 2', 'Данные 3']);
  
  (async () => {
    let i = 1;
    for await (const chunk of readable) {
      console.log(`[ASYNC] Получен чанк ${i}: "${chunk}"`);
      i++;
    }
    console.log('[ASYNC] Поток завершён');
  })();
}, 500);
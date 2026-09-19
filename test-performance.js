const fs = require('fs');
const path = require('path');
const util = require('util');

const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);

const DIR = './perf-data';
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const CONTENT = 'x'.repeat(1024);
const N = 200;

function syncTest() {
  const start = Date.now();
  for (let i = 0; i < N; i++) {
    fs.writeFileSync(path.join(DIR, `sync-${i}.txt`), CONTENT);
  }
  const duration = Date.now() - start;
  console.log(`Синхронно: ${duration} мс`);
  return duration;
}

function callbackTest(cb) {
  const start = Date.now();
  let i = 0;
  const next = () => {
    if (i >= N) {
      const duration = Date.now() - start;
      console.log(`Колбэки:   ${duration} мс`);
      return cb(duration);
    }
    fs.writeFile(path.join(DIR, `cb-${i}.txt`), CONTENT, () => { i++; next(); });
  };
  next();
}

async function promisesTest() {
  const start = Date.now();
  const tasks = [];
  for (let i = 0; i < N; i++) {
    tasks.push(writeFileAsync(path.join(DIR, `prom-${i}.txt`), CONTENT));
  }
  await Promise.all(tasks);
  const duration = Date.now() - start;
  console.log(`Промисы:   ${duration} мс`);
  return duration;
}

async function cleanup() {
  const files = fs.readdirSync(DIR);
  for (const f of files) {
    await unlinkAsync(path.join(DIR, f));
  }
  fs.rmdirSync(DIR);
}

(async () => {
  console.log(`=== ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ ===`);
  console.log(`Файлов: ${N}, размер: 1 КБ\n`);

  const sync = syncTest();
  callbackTest(async (cb) => {
    const prom = await promisesTest();
    console.log('\n=== РЕЗУЛЬТАТЫ ===');
    console.log(`Синхронно: ${sync} мс`);
    console.log(`Колбэки:   ${cb} мс`);
    console.log(`Промисы:   ${prom} мс`);
    console.log('\n=== ВЫВОДЫ ===');
    console.log('Синхронно - блокирует Event Loop.');
    console.log('Колбэки последовательно - медленно, но не блокирует поток.');
    console.log('Промисы параллельно - самый быстрый способ для I/O.');
    await cleanup();
  });
})();

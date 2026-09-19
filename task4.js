// ============================================================
// ЛР №14, Задание 4. Потоковая обработка данных
// Вариант 16:
//   - доп. условие для 16-20: вычислить медиану всех чисел
// Требования: только потоки для файлов > 1 МБ,
//   буфер 64 КБ, обработка без загрузки всего файла в память
// ============================================================

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { pipeline } = require('stream/promises');

const VARIANT = 16;
const LINES = 100_000;
const DATA_FILE = path.join('.', `data_${VARIANT}.txt`);
const RESULT_FILE = path.join('.', `processed_${VARIANT}.txt`);
const BUFFER_SIZE = 64 * 1024; // 64 КБ
const MAX_NUMBER = 1000;

// ============================================================
// Генерация большого файла через поток
// ============================================================
async function generateDataFile() {
  // Проверяем, существует ли файл — если да, не пересоздаём
  try {
    const stat = await fsp.stat(DATA_FILE);
    console.log(`📂 Файл уже существует: ${DATA_FILE} (${(stat.size / 1024 / 1024).toFixed(2)} МБ)`);
    return stat.size;
  } catch (e) {
    // Файла нет — создаём
  }

  console.log(`📝 Генерирую ${DATA_FILE} (${LINES.toLocaleString('en-US')} строк)...`);
  const start = Date.now();

  const stream = fs.createWriteStream(DATA_FILE, { encoding: 'utf8' });

  for (let i = 1; i <= LINES; i++) {
    const randomNumber = Math.floor(Math.random() * MAX_NUMBER) + 1;
    const line = `${i}, ${randomNumber}, Вариант ${VARIANT}\n`;

    // Обрабатываем backpressure: если буфер полон — ждём
    if (!stream.write(line)) {
      await new Promise((resolve) => stream.once('drain', resolve));
    }
  }

  await new Promise((resolve, reject) => {
    stream.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const stat = await fsp.stat(DATA_FILE);
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`✅ Файл создан: ${(stat.size / 1024 / 1024).toFixed(2)} МБ за ${duration} сек`);
  return stat.size;
}

// ============================================================
// Обработка файла через поток
// ============================================================
async function processDataFile(fileSize) {
  console.log(`\n📊 Обработка файла: ${DATA_FILE}`);
  console.log(`Размер файла: ${(fileSize / 1024 / 1024).toFixed(2)} МБ`);

  const start = Date.now();

  // Статистика
  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;

  // Гистограмма для медианы: значения 1..1000
  const histogram = new Array(MAX_NUMBER + 1).fill(0);

  // Прогресс каждые 10%
  let nextProgress = 10;

  // Создаём поток чтения с буфером 64 КБ
  const stream = fs.createReadStream(DATA_FILE, {
    encoding: 'utf8',
    highWaterMark: BUFFER_SIZE,
  });

  // readline разбивает поток на строки без загрузки всего файла в память
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // Строка формата: "1, 847, Вариант 16"
    const parts = line.split(',');
    if (parts.length < 2) continue;

    const num = parseInt(parts[1].trim(), 10);
    if (Number.isNaN(num)) continue;

    sum += num;
    count++;
    if (num < min) min = num;
    if (num > max) max = num;
    histogram[num]++;

    // Прогресс
    const percent = Math.floor((count / LINES) * 100);
    if (percent >= nextProgress) {
      console.log(`⏳ Прогресс: ${nextProgress}% (${count.toLocaleString('en-US')} строк обработано)`);
      nextProgress += 10;
    }
  }

  // Медиана по гистограмме
  const median = computeMedianFromHistogram(histogram, count);

  const duration = ((Date.now() - start) / 1000).toFixed(2);

  return {
    count,
    sum,
    average: sum / count,
    min,
    max,
    median,
    duration,
  };
}

// ============================================================
// Медиана по гистограмме (без сортировки массива чисел)
// ============================================================
function computeMedianFromHistogram(histogram, totalCount) {
  const mid1 = Math.floor((totalCount + 1) / 2);
  const mid2 = Math.ceil((totalCount + 1) / 2);

  let runningCount = 0;
  let median1 = null;
  let median2 = null;

  for (let value = 1; value <= MAX_NUMBER; value++) {
    runningCount += histogram[value];
    if (median1 === null && runningCount >= mid1) median1 = value;
    if (median2 === null && runningCount >= mid2) median2 = value;
    if (median1 !== null && median2 !== null) break;
  }

  return (median1 + median2) / 2;
}

// ============================================================
// Сохранение результата
// ============================================================
async function saveResults(stats) {
  const lines = [
    `=== Результаты обработки ${DATA_FILE} ===`,
    `Всего строк: ${stats.count.toLocaleString('en-US')}`,
    `Сумма чисел: ${stats.sum.toLocaleString('en-US')}`,
    `Среднее значение: ${stats.average.toFixed(2)}`,
    `Максимальное число: ${stats.max}`,
    `Минимальное число: ${stats.min}`,
    `Медиана: ${stats.median}`,
    `Время обработки: ${stats.duration} сек`,
    '',
  ];

  await fsp.writeFile(RESULT_FILE, lines.join('\n'), 'utf8');
}

// ============================================================
// Главная функция
// ============================================================
async function main() {
  try {
    const size = await generateDataFile();
    const stats = await processDataFile(size);

    console.log('\n✅ Обработка завершена!');
    console.log('📊 Результаты:');
    console.log(`- Всего строк: ${stats.count.toLocaleString('en-US')}`);
    console.log(`- Сумма чисел: ${stats.sum.toLocaleString('en-US')}`);
    console.log(`- Среднее значение: ${stats.average.toFixed(2)}`);
    console.log(`- Максимальное число: ${stats.max}`);
    console.log(`- Минимальное число: ${stats.min}`);
    console.log(`- Медиана: ${stats.median}`);

    await saveResults(stats);
    console.log(`\n📄 Результаты сохранены в: ${RESULT_FILE}`);
    console.log(`⏱  Время выполнения: ${stats.duration} сек`);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exitCode = 1;
  }
}

main();

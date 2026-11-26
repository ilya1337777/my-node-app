const { Readable, Transform, Writable, pipeline } = require('stream');
const fs = require('fs');

const group = 'ББМО-01-23';
const TOTAL = 10000;
let generated = 0;
let validated = 0;
let filtered = 0;
let written = 0;
let errorsCount = 0;
const startTime = Date.now();

// Логирование ошибок
const errorLog = fs.createWriteStream('errors.log');

// 1. Источник (Readable) — генерирует студентов
const source = new Readable({
  objectMode: true,
  read() {
    if (generated >= TOTAL) {
      this.push(null);
      return;
    }
    
    // Генерируем порцию по 100 штук
    const batchSize = Math.min(100, TOTAL - generated);
    for (let i = 0; i < batchSize; i++) {
      generated++;
      
      // Имитация ошибки (каждый 1000-й студент без имени)
      const name = generated % 1000 === 0 ? null : `Студент ${generated}`;
      const grade = Math.floor(Math.random() * 5) + 1;
      
      this.push({
        id: generated,
        name: name,
        group: group,
        course: Math.floor(Math.random() * 4) + 1,
        grade: grade
      });
    }
  }
});

// 2. Валидатор (Transform)
const validateTransform = new Transform({
  objectMode: true,
  transform(student, enc, cb) {
    if (!student.name) {
      errorsCount++;
      errorLog.write(`[${new Date().toISOString()}] [${group}] Ошибка валидации: id=${student.id}, отсутствует name\n`);
      return cb(); // Пропускаем битого студента
    }
    validated++;
    cb(null, student);
  }
});

// 3. Обогащение (Transform)
const enrichTransform = new Transform({
  objectMode: true,
  transform(student, enc, cb) {
    student.averageGrade = (student.grade + 3) / 2; // Вычисляемое поле
    cb(null, student);
  }
});

// 4. Фильтр (Transform)
const filterTransform = new Transform({
  objectMode: true,
  transform(student, enc, cb) {
    if (student.grade > 3) {
      filtered++;
      cb(null, student);
    } else {
      cb();
    }
  }
});

// 5. Форматирование в CSV (Transform)
const formatTransform = new Transform({
  objectMode: true,
  transform(student, enc, cb) {
    const csvLine = `${student.id},${student.name},${student.group},${student.course},${student.grade},${student.averageGrade.toFixed(1)}\n`;
    cb(null, csvLine);
  }
});

// 6. Приёмник (Writable)
const destination = new Writable({
  write(chunk, enc, cb) {
    written++;
    
    if (written % 1000 === 0) {
      const percent = Math.floor((written / TOTAL) * 100);
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = Math.floor(written / elapsed);
      process.stdout.write(`\r[PROGRESS] ${percent}% | ${written}/${TOTAL} | ${speed} записей/сек    `);
    }
    
    fs.appendFileSync('students.csv', chunk);
    cb();
  }
});

// Запускаем конвейер
console.log(`=== Конвейер обработки данных (группа ${group}) ===`);
console.log(`Источник: ${TOTAL} студентов`);
console.log('Фильтр: оценка > 3');

// Очищаем файлы перед запуском
fs.writeFileSync('students.csv', 'id,name,group,course,grade,averageGrade\n');
fs.writeFileSync('errors.log', '');

pipeline(
  source,
  validateTransform,
  enrichTransform,
  filterTransform,
  formatTransform,
  destination,
  (err) => {
    if (err) {
      console.error('\n✖ Ошибка конвейера:', err.message);
      return;
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n\n=== Результаты ===');
    console.log(`Всего сгенерировано: ${generated}`);
    console.log(`Прошло валидацию: ${validated}`);
    console.log(`Отфильтровано (оценка > 3): ${filtered}`);
    console.log(`Записано в CSV: ${written}`);
    console.log(`Ошибок валидации: ${errorsCount}`);
    console.log(`Время выполнения: ${totalTime} сек`);
    console.log(`Средняя скорость: ${Math.floor(written / totalTime)} записей/сек`);
    
    // Определяем размер файла
    const stats = fs.statSync('students.csv');
    console.log(`Файл: students.csv (${(stats.size / 1024 / 1024).toFixed(2)} МБ)`);
  }
);
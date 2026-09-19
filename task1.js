// ============================================================
// ЛР №14, Задание 1. Создание и чтение файлов
// Вариант 16
// Требования:
//   - только fs.promises + async/await
//   - модуль path для всех путей
//   - относительные пути
//   - обработка ошибок
// ============================================================

const fs = require('fs').promises;
const path = require('path');

const VARIANT = 16;
const FILE_PATH = path.join('.', `student_${VARIANT}.txt`);

// Данные студента
const STUDENT = {
  name: 'Романюк Илья',
  group: '401',
  variant: VARIANT,
  books: [
    '1. "Война и мир" - Л. Толстой',
    '2. "Преступление и наказание" - Ф. Достоевский',
    '3. "Мастер и Маргарита" - М. Булгаков',
    '4. "1984" - Дж. Оруэлл',
    '5. "Интерстеллар" (2014)',
  ],
};

/**
 * Форматирует текущую дату как YYYY-MM-DD HH:MM:SS
 */
function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * Создаёт файл student_N.txt с информацией о студенте.
 * @returns {Promise<string>} путь к созданному файлу
 */
async function createStudentFile() {
  const lines = [
    `Студент: ${STUDENT.name}`,
    `Группа: ${STUDENT.group}`,
    `Вариант: ${STUDENT.variant}`,
    `Дата: ${formatDate()}`,
    `Любимые книги/фильмы:`,
    ...STUDENT.books,
  ];

  // Считаем количество строк ДО добавления строки "Количество записей"
  const totalLines = lines.length + 1; // +1 — сама строка "Количество записей"

  lines.push(`Количество записей: ${totalLines}`);

  const content = lines.join('\n') + '\n';
  await fs.writeFile(FILE_PATH, content, 'utf8');

  return FILE_PATH;
}

/**
 * Читает файл и выводит содержимое в консоль в отформатированном виде.
 */
async function readAndPrintStudentFile() {
  const content = await fs.readFile(FILE_PATH, 'utf8');

  console.log('Содержимое файла:');
  console.log('─────────────────────────────────');
  console.log(content.trimEnd());
  console.log('─────────────────────────────────');
}

/**
 * Главная функция.
 */
async function main() {
  try {
    const created = await createStudentFile();
    console.log(`Создан файл: ${created}`);

    await readAndPrintStudentFile();
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exitCode = 1;
  }
}

main();

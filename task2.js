// ============================================================
// ЛР №14, Задание 2. Работа с каталогами
// Вариант 16 (нечётный → в src/components создаём 1, 2, 3)
// Требования: fs.promises + async/await, path, обработка ошибок
// ============================================================

const fs = require('fs').promises;
const path = require('path');

const VARIANT = 16;
const ROOT = path.join('.', `project_${VARIANT}`);

// Описание назначения каждой папки
const DESCRIPTIONS = {
  'src': 'Исходный код проекта',
  'src/modules': 'Модули приложения',
  'src/components': 'Компоненты интерфейса',
  'src/utils': 'Вспомогательные утилиты',
  'src/components/1': 'Компонент №1',
  'src/components/2': 'Компонент №2',
  'src/components/3': 'Компонент №3',
  'data': 'Данные проекта',
  'data/input': 'Входные данные',
  'data/output': 'Выходные данные',
  'temp': 'Временные файлы',
};

/**
 * Безопасно создаёт папку (если уже есть — ничего не делает).
 */
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Создаёт структуру каталогов и файлы info.txt.
 */
async function createStructure() {
  // Создаём все папки
  const dirs = [
    'src/modules',
    'src/components',
    'src/components/1',
    'src/components/2',
    'src/components/3',
    'src/utils',
    'data/input',
    'data/output',
    'temp',
  ];

  for (const dir of dirs) {
    await ensureDir(path.join(ROOT, dir));
  }

  // Создаём info.txt в каждой папке
  for (const [relPath, description] of Object.entries(DESCRIPTIONS)) {
    const infoPath = path.join(ROOT, relPath, 'info.txt');
    await fs.writeFile(infoPath, description + '\n', 'utf8');
  }
}

/**
 * Рекурсивно строит дерево каталогов.
 * @param {string} dir — корень
 * @param {string} prefix — префикс для отступов
 * @returns {Promise<string>} — текстовое представление дерева
 */
async function buildTree(dir, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  // Сортируем: сначала папки, потом файлы, по алфавиту
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  let result = '';
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const pointer = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    result += `${prefix}${pointer}${entry.name}\n`;

    if (entry.isDirectory()) {
      result += await buildTree(path.join(dir, entry.name), nextPrefix);
    }
  }
  return result;
}

/**
 * Печатает дерево каталогов.
 */
async function printTree(label) {
  console.log(`\n${label}`);
  console.log(path.basename(ROOT) + '/');
  const tree = await buildTree(ROOT);
  process.stdout.write(tree);
}

/**
 * Главная функция.
 */
async function main() {
  try {
    // 1. Создаём структуру
    console.log(`📁 Создаю структуру: ${ROOT}`);
    await createStructure();

    // 2. Показываем исходное дерево
    await printTree('📂 Исходное дерево:');

    // 3. Перемещаем temp внутрь data
    console.log('\n🔄 Перемещаю temp → data/temp');
    await fs.rename(path.join(ROOT, 'temp'), path.join(ROOT, 'data', 'temp'));

    // 4. Переименовываем data/output → data/results
    console.log('🔄 Переименовываю data/output → data/results');
    await fs.rename(path.join(ROOT, 'data', 'output'), path.join(ROOT, 'data', 'results'));

    // 5. Удаляем data/temp со всем содержимым
    console.log('🗑  Удаляю data/temp со всем содержимым');
    await fs.rm(path.join(ROOT, 'data', 'temp'), { recursive: true, force: true });

    // 6. Показываем финальное дерево
    await printTree('📂 Финальное дерево:');

    console.log('\n✅ Задание 2 выполнено!');
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exitCode = 1;
  }
}

main();

// ============================================================
// ЛР №14, Задание 3. Поиск и фильтрация файлов
// Вариант 16:
//   - доп. условие для 16-20: искать файлы с "16" в названии
// Требования: fs.promises + async/await, path, обработка ошибок
// ============================================================

const fs = require('fs').promises;
const path = require('path');

const VARIANT = 16;
const SCAN_DIR = path.join('.', 'test_scan_16');
const REPORT_FILE = path.join('.', `report_${VARIANT}.json`);

// ============================================================
// Подготовка тестовой директории с разными файлами
// ============================================================
async function prepareTestDir() {
  // Если папка уже есть — удаляем и создаём заново
  await fs.rm(SCAN_DIR, { recursive: true, force: true });
  await fs.mkdir(SCAN_DIR, { recursive: true });

  const files = [
    // (относительный путь, содержимое)
    ['readme.md', '# Project\nНебольшой README\n'],
    ['config.json', JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2)],
    ['app.js', 'console.log("hello");\n'.repeat(50)],
    ['utils.js', 'export const sum = (a, b) => a + b;\n'.repeat(30)],
    ['notes.txt', 'Заметка 1\nЗаметка 2\nЗаметка 3\n'],
    ['data_16.json', JSON.stringify({ variant: 16, items: Array(20).fill('x') }, null, 2)],
    ['file_16.txt', 'Файл с номером варианта в названии\n'],
    ['backup_16.log', 'log entry\n'.repeat(100)],
    ['styles.css', 'body { margin: 0; }\n'.repeat(20)],
    ['index.html', '<html><body><h1>Hello</h1></body></html>\n'],
    ['image.png', Buffer.from('89504e470d0a1a0a', 'hex').toString('binary').repeat(200)],
    ['src/module1.js', 'export default {};\n'.repeat(40)],
    ['src/module2.js', 'export const x = 1;\n'.repeat(25)],
    ['src/helpers/util_16.js', 'export const help = () => {};\n'.repeat(15)],
    ['docs/guide.md', '# Guide\n'.repeat(80)],
    ['docs/api.md', '# API\n'.repeat(60)],
    ['data/large.json', JSON.stringify({ items: Array(500).fill({ id: 1, value: 'test' }) }, null, 2)],
    ['data/small.json', '{"a":1}'],
    ['logs/app.log', 'INFO: started\n'.repeat(200)],
  ];

  for (const [relPath, content] of files) {
    const fullPath = path.join(SCAN_DIR, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }

  return files.length;
}

// ============================================================
// Рекурсивный обход директории
// ============================================================
async function scanDirectory(dir) {
  const stats = {
    totalFiles: 0,
    totalDirs: 0,
    totalSize: 0,
    byExtension: {},   // { '.js': { count, size } }
    allFiles: [],      // [{ name, path, size, ext }]
    filesWith16: [],   // доп. условие варианта 16
  };

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        stats.totalDirs++;
        await walk(fullPath);
      } else if (entry.isFile()) {
        const fileStat = await fs.stat(fullPath);
        const ext = path.extname(entry.name).toLowerCase() || '(без расширения)';

        stats.totalFiles++;
        stats.totalSize += fileStat.size;

        if (!stats.byExtension[ext]) {
          stats.byExtension[ext] = { count: 0, size: 0 };
        }
        stats.byExtension[ext].count++;
        stats.byExtension[ext].size += fileStat.size;

        const fileInfo = {
          name: entry.name,
          path: fullPath.replace(/\\/g, '/'),
          size: fileStat.size,
          ext,
        };
        stats.allFiles.push(fileInfo);

        // Доп. условие варианта 16: файлы с "16" в имени
        if (entry.name.includes(String(VARIANT))) {
          stats.filesWith16.push(fileInfo);
        }
      }
    }
  }

  await walk(dir);
  return stats;
}

// ============================================================
// Форматирование
// ============================================================
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

function printReport(stats, dir) {
  console.log(`\n📊 Анализ директории: ${dir}`);
  console.log(`📁 Общее количество папок: ${stats.totalDirs}`);
  console.log(`📄 Общее количество файлов: ${stats.totalFiles}`);
  console.log(`💾 Общий размер: ${formatSize(stats.totalSize)} (${stats.totalSize.toLocaleString('en-US')} байт)`);

  console.log('\n📂 Расширения файлов:');
  const sortedExts = Object.entries(stats.byExtension)
    .sort(([, a], [, b]) => b.size - a.size);
  for (const [ext, data] of sortedExts) {
    console.log(`   ${ext}: ${data.count} файлов (${formatSize(data.size)})`);
  }

  const sorted = [...stats.allFiles].sort((a, b) => b.size - a.size);

  console.log('\n🏆 Топ-5 самых больших файлов:');
  sorted.slice(0, 5).forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
  });

  console.log('\n📉 Топ-5 самых маленьких файлов:');
  [...sorted].reverse().slice(0, 5).forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
  });

  // Доп. условие варианта 16
  console.log(`\n🔍 Файлы с "${VARIANT}" в названии (доп. условие варианта ${VARIANT}):`);
  if (stats.filesWith16.length === 0) {
    console.log('   (не найдено)');
  } else {
    stats.filesWith16.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
    });
  }
}

// ============================================================
// Сохранение отчёта в JSON
// ============================================================
async function saveReport(stats, dir) {
  const report = {
    scannedAt: new Date().toISOString(),
    directory: dir,
    variant: VARIANT,
    summary: {
      totalFiles: stats.totalFiles,
      totalDirs: stats.totalDirs,
      totalSizeBytes: stats.totalSize,
      totalSizeHuman: formatSize(stats.totalSize),
    },
    byExtension: stats.byExtension,
    top5Largest: [...stats.allFiles].sort((a, b) => b.size - a.size).slice(0, 5),
    top5Smallest: [...stats.allFiles].sort((a, b) => a.size - b.size).slice(0, 5),
    filesWithVariantNumber: stats.filesWith16,
  };

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
}

// ============================================================
// Главная функция
// ============================================================
async function main() {
  try {
    // Аргумент командной строки (если задан), иначе — тестовая папка
    const targetDir = process.argv[2] || SCAN_DIR;

    // Если сканируем тестовую папку и её нет — создаём
    if (targetDir === SCAN_DIR) {
      console.log(`📦 Готовлю тестовую директорию: ${SCAN_DIR}`);
      const count = await prepareTestDir();
      console.log(`✅ Создано файлов: ${count}`);
    }

    console.log(`\n🔍 Сканирую: ${targetDir}`);
    const stats = await scanDirectory(targetDir);

    printReport(stats, targetDir);

    await saveReport(stats, targetDir);
    console.log(`\n📄 Отчет сохранен: ${REPORT_FILE}`);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exitCode = 1;
  }
}

main();

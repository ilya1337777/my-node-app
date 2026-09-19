// ============================================================
// ЛР №14, Задание 5. Копирование и синхронизация
// Вариант 16:
//   - доп. условие для 16-20: архивация в ZIP (модуль archiver)
// Требования:
//   - fs.promises + async/await, path, обработка ошибок
//   - для файлов > 1 МБ использовать потоки
//   - сохранять структуру папок
//   - выводить прогресс копирования
// ============================================================

const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const archiver = require('archiver');

const VARIANT = 16;
const SRC = path.join('.', `source_${VARIANT}`);
const DST = path.join('.', `backup_${VARIANT}`);
const ZIP_FILE = path.join('.', `backup_${VARIANT}.zip`);
const SYNC_REPORT = path.join('.', `sync_report_${VARIANT}.txt`);

const STREAM_EXTS = ['.txt', '.js', '.json', '.md'];
const BINARY_EXTS = ['.jpg', '.png', '.gif'];
const CHUNK_SIZE = 512 * 1024; // 512 КБ
const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1 МБ

// ============================================================
// ШАГ 1. Создание тестовой структуры source_16/
// ============================================================
async function createSourceStructure() {
  await fsp.rm(SRC, { recursive: true, force: true });
  await fsp.mkdir(SRC, { recursive: true });

  const files = [
    ['readme.txt', 'README текстовый файл\n'.repeat(20)],
    ['script.js', 'console.log("test");\n'.repeat(50)],
    ['config.json', JSON.stringify({ name: 'test', version: 16 }, null, 2)],
    ['notes.md', '# Notes\n'.repeat(80)],
    ['styles.css', 'body { margin: 0; }\n'.repeat(15)],
    ['index.html', '<html><body>Hello</body></html>\n'.repeat(5)],
    ['app.log', 'log entry\n'.repeat(150)],
    ['data.csv', 'id,name\n1,test\n'.repeat(30)],
    ['utils.js', 'export const f = () => {};\n'.repeat(40)],
    ['helpers.js', 'export const h = () => {};\n'.repeat(35)],
    ['photo1.jpg', Buffer.alloc(2048, 0xff)],
    ['photo2.png', Buffer.alloc(3072, 0x89)],
    ['image.gif', Buffer.alloc(1536, 0x47)],
    ['big_file.txt', 'BIG DATA LINE\n'.repeat(100000)], // ~1.3 МБ — попадёт в чанки
    ['small_file.txt', 'small content'],
    ['data.json', JSON.stringify({ items: Array(50).fill({ id: 1 }) })],
    ['sub1/a.txt', 'sub folder 1 file A\n'.repeat(10)],
    ['sub1/b.js', 'export const sub1b = 1;\n'.repeat(20)],
    ['sub2/c.txt', 'sub folder 2 file C\n'.repeat(15)],
    ['sub2/d.json', JSON.stringify({ sub: 2 })],
    ['sub2/nested/e.txt', 'nested file E\n'.repeat(25)],
    ['sub3/f.md', '# Sub 3\n'.repeat(50)],
    ['sub3/g.log', 'log in sub3\n'.repeat(75)],
  ];

  const manifest = { created: new Date().toISOString(), variant: VARIANT, files: [] };

  for (const [relPath, content] of files) {
    const fullPath = path.join(SRC, relPath);
    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
    await fsp.writeFile(fullPath, content);
    const stat = await fsp.stat(fullPath);
    manifest.files.push({
      path: relPath.replace(/\\/g, '/'),
      size: stat.size,
      ext: path.extname(relPath),
    });
  }

  await fsp.writeFile(
    path.join(SRC, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log(`📂 Создана структура: ${SRC}`);
  console.log(`📋 Файлов: ${manifest.files.length + 1} (включая manifest.json)`);
  return manifest;
}

// ============================================================
// ШАГ 2. Копирование файлов
// ============================================================

/** Копирование через поток (для .txt, .js, .json, .md) */
async function copyViaStream(srcPath, dstPath) {
  await fsp.mkdir(path.dirname(dstPath), { recursive: true });
  await pipeline(
    fs.createReadStream(srcPath, { highWaterMark: 64 * 1024 }),
    fs.createWriteStream(dstPath)
  );
}

/** Обычное копирование (для .jpg, .png, .gif) */
async function copyViaFs(srcPath, dstPath) {
  await fsp.mkdir(path.dirname(dstPath), { recursive: true });
  await fsp.copyFile(srcPath, dstPath);
}

/** Разбивает файл на чанки 512 КБ */
async function copyInChunks(srcPath, dstDir, baseName, ext) {
  await fsp.mkdir(dstDir, { recursive: true });
  const stream = fs.createReadStream(srcPath, { highWaterMark: CHUNK_SIZE });

  let chunkIndex = 0;
  let currentWrite = null;
  let currentPath = null;

  const openNextChunk = () => {
    chunkIndex++;
    currentPath = path.join(dstDir, `${baseName}.part${chunkIndex}${ext}`);
    currentWrite = fs.createWriteStream(currentPath);
    return currentWrite;
  };

  for await (const chunk of stream) {
    if (!currentWrite) openNextChunk();

    if (!currentWrite.write(chunk)) {
      await new Promise((r) => currentWrite.once('drain', r));
    }

    // Если чанк заполнен — закрываем и открываем следующий
    if (currentWrite.bytesWritten >= CHUNK_SIZE) {
      await new Promise((resolve) => currentWrite.end(resolve));
      currentWrite = null;
    }
  }

  if (currentWrite) {
    await new Promise((resolve) => currentWrite.end(resolve));
  }

  return chunkIndex;
}

/**
 * Рекурсивно копирует source → backup с фильтрацией.
 */
async function copyDirectory(srcDir, dstDir) {
  const stats = {
    totalFiles: 0,
    streamed: 0,
    binary: 0,
    chunked: 0,
    totalBytes: 0,
    byExt: {},
  };

  async function walk(currentSrc) {
    const entries = await fsp.readdir(currentSrc, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(currentSrc, entry.name);
      const relPath = path.relative(srcDir, srcPath);
      const dstPath = path.join(dstDir, relPath);

      if (entry.isDirectory()) {
        await fsp.mkdir(dstPath, { recursive: true });
        await walk(srcPath);
      } else if (entry.isFile()) {
        const stat = await fsp.stat(srcPath);
        const ext = path.extname(entry.name).toLowerCase();

        stats.totalFiles++;
        stats.totalBytes += stat.size;
        stats.byExt[ext] = (stats.byExt[ext] || 0) + 1;

        if (stat.size > LARGE_FILE_THRESHOLD) {
          // Большие файлы → чанки
          const base = path.basename(entry.name, ext);
          const chunks = await copyInChunks(srcPath, path.dirname(dstPath), base, ext);
          stats.chunked++;
          console.log(`   📦 ${relPath} (${(stat.size / 1024 / 1024).toFixed(2)} МБ) → ${chunks} чанков`);
        } else if (STREAM_EXTS.includes(ext)) {
          await copyViaStream(srcPath, dstPath);
          stats.streamed++;
        } else if (BINARY_EXTS.includes(ext)) {
          await copyViaFs(srcPath, dstPath);
          stats.binary++;
        } else {
          await copyViaFs(srcPath, dstPath);
          stats.binary++;
        }

        console.log(`   ✓ ${relPath} (${stat.size} Б)`);
      }
    }
  }

  await fsp.rm(dstDir, { recursive: true, force: true });
  await fsp.mkdir(dstDir, { recursive: true });
  await walk(srcDir);

  return stats;
}

// ============================================================
// ШАГ 3. Синхронизация (сравнение source и backup)
// ============================================================
async function collectFiles(dir) {
  const result = new Map(); // relPath → { size, mtime }

  async function walk(currentDir) {
    const entries = await fsp.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const stat = await fsp.stat(fullPath);
        const rel = path.relative(dir, fullPath).replace(/\\/g, '/');
        result.set(rel, { size: stat.size, mtime: stat.mtimeMs });
      }
    }
  }

  await walk(dir);
  return result;
}

async function syncDirectories() {
  const srcFiles = await collectFiles(SRC);
  const dstFiles = await collectFiles(DST);

  const added = [];
  const removed = [];
  const modified = [];
  const identical = [];

  for (const [relPath, srcInfo] of srcFiles) {
    if (!dstFiles.has(relPath)) {
      removed.push(relPath); // есть в source, нет в backup → «не скопирован»
    } else {
      const dstInfo = dstFiles.get(relPath);
      if (srcInfo.size !== dstInfo.size) {
        modified.push({ path: relPath, srcSize: srcInfo.size, dstSize: dstInfo.size });
      } else {
        identical.push(relPath);
      }
    }
  }

  for (const [relPath] of dstFiles) {
    if (!srcFiles.has(relPath)) {
      added.push(relPath); // есть в backup, нет в source
    }
  }

  return { added, removed, modified, identical };
}

async function saveSyncReport(syncStats, copyStats) {
  const lines = [
    `=== Отчёт синхронизации source_${VARIANT} ↔ backup_${VARIANT} ===`,
    `Создан: ${new Date().toISOString()}`,
    '',
    `📋 Всего файлов в source: ${syncStats.identical.length + syncStats.removed.length + syncStats.modified.length}`,
    `✅ Совпадают: ${syncStats.identical.length}`,
    `✏️  Изменены (по размеру): ${syncStats.modified.length}`,
    `➕ Добавлены в backup: ${syncStats.added.length}`,
    `➖ Удалены (есть в source, нет в backup): ${syncStats.removed.length}`,
    '',
  ];

  if (syncStats.modified.length) {
    lines.push('Изменённые файлы:');
    syncStats.modified.forEach((m) => {
      lines.push(`  - ${m.path}: source=${m.srcSize} Б, backup=${m.dstSize} Б`);
    });
    lines.push('');
  }

  if (syncStats.removed.length) {
    lines.push('Отсутствуют в backup:');
    syncStats.removed.forEach((p) => lines.push(`  - ${p}`));
    lines.push('');
  }

  lines.push('📊 Статистика копирования:');
  lines.push(`  - Всего файлов: ${copyStats.totalFiles}`);
  lines.push(`  - Через потоки: ${copyStats.streamed}`);
  lines.push(`  - Обычное копирование: ${copyStats.binary}`);
  lines.push(`  - Больших файлов (в чанках): ${copyStats.chunked}`);
  lines.push(`  - Общий размер: ${(copyStats.totalBytes / 1024 / 1024).toFixed(2)} МБ`);

  await fsp.writeFile(SYNC_REPORT, lines.join('\n'), 'utf8');
}

// ============================================================
// ШАГ 4. Архивация в ZIP (доп. условие варианта 16)
// ============================================================
async function createZipArchive() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(ZIP_FILE);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`\n📦 ZIP создан: ${ZIP_FILE} (${(archive.pointer() / 1024).toFixed(2)} КБ)`);
      resolve(archive.pointer());
    });
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(DST, false);
    archive.finalize();
  });
}

// ============================================================
// Главная функция
// ============================================================
async function main() {
  try {
    console.log('🚀 ЛР №14, Задание 5\n');

    // 1. Создаём структуру
    await createSourceStructure();

    // 2. Копируем
    console.log(`\n📂 Копирование: ${SRC} → ${DST}\n`);
    const copyStats = await copyDirectory(SRC, DST);

    console.log(`\n✅ Копирование завершено!`);
    console.log(`- Всего файлов: ${copyStats.totalFiles}`);
    console.log(`- Через потоки: ${copyStats.streamed}`);
    console.log(`- Обычное копирование: ${copyStats.binary}`);
    console.log(`- В чанках: ${copyStats.chunked}`);
    console.log(`- Общий размер: ${(copyStats.totalBytes / 1024 / 1024).toFixed(2)} МБ`);

    // 3. Синхронизация
    console.log(`\n🔄 Сравнение директорий...`);
    const syncStats = await syncDirectories();
    console.log(`- Совпадают: ${syncStats.identical.length}`);
    console.log(`- Изменены: ${syncStats.modified.length}`);
    console.log(`- Добавлены: ${syncStats.added.length}`);
    console.log(`- Удалены: ${syncStats.removed.length}`);

    await saveSyncReport(syncStats, copyStats);
    console.log(`\n📄 Отчёт сохранён: ${SYNC_REPORT}`);

    // 4. ZIP-архив (доп. условие варианта 16)
    console.log(`\n📦 Создаю ZIP-архив...`);
    await createZipArchive();

    console.log('\n✅ Задание 5 выполнено!');
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    console.error(err.stack);
    process.exitCode = 1;
  }
}

main();

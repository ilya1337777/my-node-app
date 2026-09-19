const FileManagerHybrid = require('./fileOperationsHybrid');

const fm = new FileManagerHybrid('./test-data-hybrid');

console.log('=== ГИБРИД: колбэки ===\n');

fm.createFile('a.txt', 'Привет (колбэк)', (err, filePath) => {
  if (err) return console.error('Ошибка:', err.message);
  console.log('Создан:', filePath);

  fm.readFile('a.txt', (err, content) => {
    if (err) return console.error('Ошибка:', err.message);
    console.log('Прочитано:', content);

    fm.deleteFile('a.txt', (err) => {
      if (err) return console.error('Ошибка:', err.message);
      console.log('Удалено: a.txt');

      testWithPromises();
    });
  });
});

async function testWithPromises() {
  console.log('\n=== ГИБРИД: промисы ===\n');

  try {
    const path1 = await fm.createFile('b.txt', 'Привет (промис)');
    console.log('Создан:', path1);

    const content = await fm.readFile('b.txt');
    console.log('Прочитано:', content);

    const stats = await fm.getFileStats('b.txt');
    console.log('Размер:', stats.size, 'байт');

    const files = await fm.listFiles();
    console.log('Файлы:', files);

    await fm.deleteFile('b.txt');
    console.log('Удалено: b.txt');
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

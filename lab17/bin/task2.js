#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();

program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version('1.0.0')
  .option('-v, --verbose', 'подробный вывод');

const ALLOWED_TYPES = ['html', 'pdf', 'json', 'csv'];

program
  .command('generate')
  .description('сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта', 'html')
  .option('-o, --output <path>', 'путь для сохранения')
  .option('-f, --force', 'перезаписать существующий файл')
  .option('--dry-run', 'показать что будет сделано без выполнения')
  .action((opts, cmd) => {
    const verbose = cmd.parent.opts().verbose;
    const outPath = opts.output || './output.' + opts.type;

    if (!ALLOWED_TYPES.includes(opts.type)) {
      console.error('Ошибка: недопустимый тип отчёта "' + opts.type + '".');
      console.error('Допустимые значения: ' + ALLOWED_TYPES.join(', '));
      process.exit(1);
    }
    if (verbose) {
      console.log('[VERBOSE] Запуск генерации отчёта...');
      console.log('[VERBOSE] Тип отчёта: ' + opts.type);
      console.log('[VERBOSE] Путь сохранения: ' + outPath);
    }
    if (opts.dryRun) {
      console.log('[DRY-RUN] Будет сгенерирован отчёт типа: ' + opts.type);
      console.log('[DRY-RUN] Файл будет сохранён в: ' + outPath);
      console.log('[DRY-RUN] Действия не выполнены (режим проверки)');
      return;
    }
    console.log('Отчёт успешно сгенерирован: ' + outPath);
  });

program
  .command('convert')
  .description('конвертировать файл')
  .option('-i, --input <path>', 'входной файл')
  .option('-f, --format <fmt>', 'формат', 'json')
  .action((opts) => console.log('Конвертация:', opts));

program.parse();
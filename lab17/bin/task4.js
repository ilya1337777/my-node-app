#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk').default;
const { default: ora } = require('ora');
const cliProgress = require('cli-progress');
const fs = require('fs');
const program = new Command();

// Логирование в stderr (чтобы stdout оставался чистым для данных)
const log = {
  info:    (m) => process.stderr.write(chalk.blue('i ' + m + '\n')),
  success: (m) => process.stderr.write(chalk.green('+ ' + m + '\n')),
  warn:    (m) => process.stderr.write(chalk.yellow('! ' + m + '\n')),
  error:   (m) => process.stderr.write(chalk.red('- ' + m + '\n')),
};

program
  .command('process')
  .requiredOption('--files <files...>')
  .option('--silent')
  .action(async (opts) => {
    const files = opts.files;
    const found = [];
    const missing = [];

    // Спиннер
    const spinner = ora('Проверка файлов...').start();
    for (const f of files) {
      (fs.existsSync(f) ? found : missing).push(f);
    }
    
    if (missing.length) {
      spinner.warn(chalk.yellow('Не найдено файлов: ' + missing.length));
      missing.forEach((m) => log.error('Файл ' + m + ' не найден'));
    } else {
      spinner.succeed(chalk.green('Файлы найдены (' + found.length + ' шт.)'));
    }

    // Прогресс-бар
    const bar = new cliProgress.SingleBar({
      format: '[{bar}] {percentage}% | {value}/{total} | ETA: {eta}s',
      hideCursor: true,
    }, cliProgress.Presets.shades_classic);

    if (found.length && !opts.silent) {
      bar.start(found.length, 0);
      for (let i = 0; i < found.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
        bar.update(i + 1);
      }
      bar.stop();
    }

    // stdout — только данные (JSON)
    const result = { processed: found, skipped: missing };
    process.stdout.write(JSON.stringify(result) + '\n');

    // Сообщения в stderr
    if (!opts.silent) {
      if (missing.length) log.warn('Пропущено ' + missing.length + ' файл(ов)');
      else log.success('Обработка завершена');
    }
    process.exit(missing.length ? 1 : 0);
  });

program.parse();
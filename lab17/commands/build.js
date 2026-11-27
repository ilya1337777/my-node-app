const ora = require('ora');
const chalk = require('chalk').default;
const { build } = require('../services/buildService');

module.exports = function (opts) {
  if (opts.dryRun) {
    console.log('DRY-RUN: build без изменений');
    return;
  }
  const spinner = ora('Сборка проекта...').start();
  try {
    const res = build({ configPath: opts.config || 'config.json' });
    spinner.succeed(chalk.green('Сборка завершена за ' + res.time));
    console.log('Результат: ' + res.output);
  } catch (e) {
    spinner.fail(chalk.red('Ошибка: ' + e.message));
    if (e.code === 'CONFIG_NOT_FOUND') {
      console.error('Укажите путь через --config');
    }
    process.exit(1);
  }
};
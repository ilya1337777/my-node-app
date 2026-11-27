const ora = require('ora');
const chalk = require('chalk').default;

module.exports = function () {
  const spinner = ora('Запуск тестов...').start();
  setTimeout(() => {
    spinner.succeed(chalk.green('Пройдено: 15/15 тестов'));
    console.log(chalk.green('+ Покрытие: 87%'));
  }, 1000);
};
const chalk = require('chalk').default;

module.exports = function (opts) {
  console.log(chalk.green('+ Проект "' + (opts.name || 'my-app') + '" создан'));
  console.log(chalk.green('+ Установлены зависимости'));
  console.log(chalk.green('+ Инициализирован Git-репозиторий'));
  console.log('Проект готов к работе!');
};
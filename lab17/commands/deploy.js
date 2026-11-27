const inquirer = require('inquirer').default;
const ora = require('ora');
const chalk = require('chalk').default;

module.exports = async function (opts) {
  if (opts.env === 'production' && !opts.force) {
    console.log(chalk.yellow('! Вы собираетесь развернуть проект в production!'));
    const { confirm } = await inquirer.prompt([
      { type: 'confirm', name: 'confirm', message: 'Продолжить?', default: false }
    ]);
    if (!confirm) {
      console.log('Развертывание отменено.');
      return;
    }
  }
  
  const spinner = ora('Развёртывание...').start();
  setTimeout(() => {
    spinner.succeed(chalk.green('Развёрнуто успешно'));
    console.log('URL: https://my-app.example.com');
  }, 1000);
};
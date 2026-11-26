#!/usr/bin/env node

process.on('uncaughtException', (err) => handleFatal(err));
process.on('unhandledRejection', (err) => handleFatal(err));

function handleFatal(err) {
  const isDev = process.env.NODE_ENV === 'development';
  process.stderr.write('- Ошибка: ' + (err.message || err) + '\n');
  if (isDev && err.stack) process.stderr.write(err.stack + '\n');
  process.exit(1);
}

const { Command } = require('commander');
const program = new Command();

program.name('my-cli').version('1.0.0').description('Lab 17 CLI');

program.command('init')
  .option('--name <name>')
  .option('--type <type>')
  .action((o) => require('../commands/init')(o));

program.command('build')
  .option('--config <path>')
  .option('--dry-run')
  .action((o) => require('../commands/build')(o));

program.command('test')
  .action(() => require('../commands/test')());

program.command('deploy')
  .option('--env <env>', 'окружение', 'staging')
  .option('--force')
  .action((o) => require('../commands/deploy')(o));

program.parse();
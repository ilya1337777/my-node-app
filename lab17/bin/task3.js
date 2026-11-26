#!/usr/bin/env node
const { Command } = require('commander');
const inquirer = require('inquirer').default;
const program = new Command();

program
  .command('init')
  .option('--name <name>')
  .option('--type <type>')
  .option('--typescript')
  .option('--prettier')
  .option('--eslint')
  .option('--jest')
  .option('--git')
  .option('--no-interactive')
  .action(async (opts) => {
    const nonInteractive = opts.interactive === false;
    let data = { ...opts };

    if (nonInteractive) {
      if (!data.name || !data.type) {
        console.error('Ошибка: в неинтерактивном режиме необходимо указать --name и --type');
        process.exit(1);
      }
    } else {
      const answers = await inquirer.prompt([
        { 
          when: !data.name, 
          type: 'input', 
          name: 'name', 
          message: 'Введите название проекта:', 
          default: 'my-project' 
        },
        { 
          when: !data.type, 
          type: 'select', // ИСПРАВЛЕНО: list заменен на select
          name: 'type', 
          message: 'Выберите тип проекта:',
          choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис'] 
        },
        { 
          type: 'checkbox', 
          name: 'features', 
          message: 'Выберите дополнительные опции:',
          choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest'] 
        },
        { 
          type: 'confirm', 
          name: 'git', 
          message: 'Использовать Git?', 
          default: true 
        },
        { 
          type: 'password', 
          name: 'token', 
          message: 'Введите токен доступа:', 
          mask: '*' 
        },
      ]);
      data = { ...data, ...answers };
    }

    const features = data.features || [];
    if (data.typescript) features.push('TypeScript');
    if (data.prettier)   features.push('Prettier');
    if (data.eslint)     features.push('ESLint');
    if (data.jest)       features.push('Jest');

    const uniqueFeatures = [...new Set(features)];

    console.log('✓ Проект "' + data.name + '" успешно инициализирован!');
    console.log('Тип: ' + data.type);
    console.log('Опции: ' + (uniqueFeatures.length ? uniqueFeatures.join(', ') : 'нет'));
    console.log('Git: ' + (data.git ? 'да' : 'нет'));
  });

program.parse();
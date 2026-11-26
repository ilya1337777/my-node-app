#!/usr/bin/env node
const args = process.argv.slice(2);

function printHelp() {
  console.log("Использование: my-cli <команда> [аргументы]");
  console.log("Доступные команды:");
  console.log("  greet <имя> - поприветствовать пользователя");
  console.log("  info        - вывести информацию о группе");
}

if (args.length === 0) {
  printHelp();
  process.exit(0);
}

const command = args[0];
const name = args[1];

if (command === 'greet') {
  if (!name) {
    console.error('Ошибка: не указано имя');
    process.exit(1);
  }
  console.log('Привет, ' + name + '! Добро пожаловать в CLI-приложение группы ББМО-01-23.');
  process.exit(0);
} else if (command === 'info') {
  console.log("Группа: ББМО-01-23");
  console.log("Студент: Илья Р.С.");
  console.log("Лабораторная работа: №17");
  console.log("Дата: 2024-01-15");
  process.exit(0);
} else if (command === '--help') {
  printHelp();
  process.exit(0);
} else {
  console.error('Ошибка: неизвестная команда "' + command + '"');
  console.error('Для справки используйте: my-cli --help');
  process.exit(1);
}
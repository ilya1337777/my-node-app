const os = require('os');

console.log('=== Сетевые интерфейсы ===');
const nets = os.networkInterfaces();
let mainInterface = null;

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' || net.family === 4) {
      const maskedMac = net.mac.replace(/([0-9A-F]{2}[:-]){3}/i, 'XX:XX:XX:XX:');
      console.log(`Интерфейс: ${name}`);
      console.log(`IPv4: ${net.address} | MAC: ${maskedMac} | Внутренний: ${net.internal ? 'да' : 'нет'}`);
      if (!net.internal && !mainInterface) mainInterface = { name, ip: net.address };
    }
  }
}
console.log(`Всего интерфейсов: ${Object.keys(nets).length}`);
if (mainInterface) console.log(`Основной интерфейс: ${mainInterface.name} (${mainInterface.ip})`);

console.log('\n=== Информация о пользователе ===');
const userInfo = os.userInfo();
console.log('Имя пользователя: ' + userInfo.username);
if (os.platform() !== 'win32') {
  console.log('UID: ' + userInfo.uid);
  console.log('GID: ' + userInfo.gid);
}
console.log('Домашняя директория: ' + userInfo.homedir);
console.log('Оболочка: ' + (userInfo.shell || 'Неизвестно'));
console.log('Группа: ББМО-01-23');

const isRoot = os.platform() !== 'win32' && userInfo.uid === 0;
console.log('Проверка root: ' + (isRoot ? 'ДА (ВНИМАНИЕ!)' : 'нет'));
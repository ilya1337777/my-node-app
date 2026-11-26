const EventEmitter = require('events');

class DatabaseConnection extends EventEmitter {
  connect() {
    this.emit('connect', 'Соединение установлено');
  }
  query(sql, result) {
    this.emit('query', sql, result);
  }
  close() {
    this.emit('close', 'Соединение закрыто');
  }
  error(msg) {
    this.emit('error', msg);
  }
}

const db = new DatabaseConnection();

console.log('=== DatabaseConnection (группа ББМО-01-23) ===');

db.on('connect', (msg) => { console.log('[EVENT] Подключение к БД...'); console.log(`[EVENT] ${msg}`); });
db.on('query', (sql, res) => { console.log(`[EVENT] Выполнение запроса: ${sql}`); console.log(`[EVENT] Результат: ${res}`); });
db.on('close', (msg) => { console.log('[EVENT] Закрытие соединения'); console.log(`[EVENT] ${msg}`); });
db.on('error', (msg) => { console.log(`[EVENT] Ошибка: ${msg}`); });

db.connect();
db.query('SELECT * FROM students', '50 записей');
db.query('INSERT INTO students', '1 запись добавлена');
db.close();

console.log('\n=== Демонстрация ошибки ===');
db.error('Connection timeout');
console.log('(без слушателя error — процесс упал бы с исключением)');
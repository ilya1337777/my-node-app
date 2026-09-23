const express = require('express');
const compression = require('compression');

const logger = require('./middleware/logger');
const rateLimiter = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const booksRouter = require('./routes/books');

const app = express();
const PORT = 3000;

// ===== Глобальные middleware =====
app.use(logger);
app.use(compression());
app.use(rateLimiter);
app.use(express.json());

// ===== Задание 1: HTML-страницы =====
app.get('/', (req, res) => {
  const now = new Date().toLocaleString('ru-RU');
  res.type('html').send(`
    <!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
    <title>Лабораторная работа №16</title>
    <style>
      body{font-family:Arial,sans-serif;background:#f4f6f8;padding:40px}
      .card{background:#fff;padding:30px;border-radius:12px;
            box-shadow:0 4px 12px rgba(0,0,0,.1);max-width:700px;margin:auto}
      h1{color:#2c3e50}.info{color:#34495e;line-height:1.7}
      ul{line-height:1.8}
      a{color:#2980b9;text-decoration:none}
      a:hover{text-decoration:underline}
    </style></head><body>
      <div class="card">
        <h1>Лабораторная работа №16</h1>
        <p class="info"><b>Группа:</b> ББМО-01-23</p>
        <p class="info"><b>Текущая дата и время:</b> ${now}</p>
        <p class="info">Добро пожаловать! Сервер работает на Express.js.</p>
        <h3>Доступные маршруты:</h3>
        <ul>
          <li><a href="/">/</a> — главная</li>
          <li><a href="/about">/about</a> — о разработчике</li>
          <li><a href="/contacts">/contacts</a> — контакты</li>
          <li><a href="/api/books">/api/books</a> — список книг</li>
          <li><a href="/api/books/search?author=Толстой">/api/books/search?author=Толстой</a> — поиск</li>
          <li><a href="/error">/error</a> — тест ошибки</li>
          <li><a href="/async-error">/async-error</a> — тест async-ошибки</li>
        </ul>
      </div>
    </body></html>`);
});

app.get('/about', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
    <title>О разработчике</title>
    <style>
      body{font-family:Arial,sans-serif;background:#f4f6f8;padding:40px}
      .card{background:#fff;padding:30px;border-radius:12px;
            box-shadow:0 4px 12px rgba(0,0,0,.1);max-width:600px;margin:auto}
      h1{color:#2c3e50}.info{color:#34495e;line-height:1.7}
      a{color:#2980b9}
    </style></head><body>
      <div class="card">
        <h1>О разработчике</h1>
        <p class="info"><b>Студент:</b> Илья</p>
        <p class="info"><b>Группа:</b> ББМО-01-23</p>
        <p class="info"><b>Лабораторная работа:</b> №16</p>
        <p><a href="/">← На главную</a></p>
      </div>
    </body></html>`);
});

app.get('/contacts', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
    <title>Контакты</title>
    <style>
      body{font-family:Arial,sans-serif;background:#f4f6f8;padding:40px}
      .card{background:#fff;padding:30px;border-radius:12px;
            box-shadow:0 4px 12px rgba(0,0,0,.1);max-width:600px;margin:auto}
      h1{color:#2c3e50}.info{color:#34495e;line-height:1.7}
      a{color:#2980b9}
    </style></head><body>
      <div class="card">
        <h1>Контакты</h1>
        <p class="info"><b>Email:</b> student@example.com</p>
        <p class="info"><b>Telegram:</b> @student</p>
        <p class="info"><b>GitHub:</b> github.com/ilya13377777</p>
        <p><a href="/">← На главную</a></p>
      </div>
    </body></html>`);
});

// ===== Задание 2: CRUD /api/books =====
app.use('/api/books', booksRouter);

// ===== Задание 3: тесты ошибок =====
app.get('/error', (req, res, next) => {
  next(new Error('Тестовая ошибка сервера'));
});

app.get('/async-error', async (req, res, next) => {
  try {
    await Promise.reject(new Error('Тестовая асинхронная ошибка'));
  } catch (err) {
    next(err);
  }
});

// 404 для несуществующих маршрутов
app.use((req, res, next) => {
  const err = new Error('Маршрут не найден');
  err.status = 404;
  next(err);
});

// централизованный обработчик ошибок — ПОСЛЕДНИМ
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
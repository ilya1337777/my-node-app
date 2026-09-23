const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

const app = new Koa();
const router = new Router();

// --- Глобальные middleware ---
app.use(errorHandler);
app.use(logger);
app.use(cors());
app.use(bodyParser());

// ===== Задание 1: HTML-страница =====
router.get('/', async (ctx) => {
  const now = new Date().toLocaleString('ru-RU');
  ctx.type = 'html';
  ctx.body = `
    <!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
    <title>Лабораторная работа №15</title>
    <style>
      body{font-family:Arial,sans-serif;background:#f4f6f8;padding:40px}
      .card{background:#fff;padding:30px;border-radius:12px;
            box-shadow:0 4px 12px rgba(0,0,0,.1);max-width:600px;margin:auto}
      h1{color:#2c3e50}.info{color:#34495e;line-height:1.7}
    </style></head><body>
      <div class="card">
        <h1>Лабораторная работа №15</h1>
        <p class="info"><b>Группа:</b> ББМО-01-23</p>
        <p class="info"><b>Текущая дата и время:</b> ${now}</p>
        <p class="info">Добро пожаловать! Сервер работает на Koa.js.</p>
      </div>
    </body></html>`;
});

// ===== Задание 2: CRUD /api/users =====
let users = [
  { id: 1, name: 'Иванов Иван', group: 'ББМО-01-23' },
  { id: 2, name: 'Петров Петр', group: 'ББМО-02-23' }
];
let nextId = 3;

// GET /api/users — список всех
router.get('/api/users', (ctx) => {
  ctx.body = users;
});

// POST /api/users — создать
router.post('/api/users', (ctx) => {
  const { name, group } = ctx.request.body || {};
  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: 'Поля name и group обязательны', status: 400 };
    return;
  }
  const user = { id: nextId++, name, group };
  users.push(user);
  ctx.status = 201;
  ctx.body = user;
});

// PUT /api/users/:id — обновить
router.put('/api/users/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Пользователь не найден', status: 404 };
    return;
  }
  const { name, group } = ctx.request.body || {};
  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: 'Поля name и group обязательны', status: 400 };
    return;
  }
  users[idx] = { id, name, group };
  ctx.body = users[idx];
});

// DELETE /api/users/:id — удалить
router.delete('/api/users/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Пользователь не найден', status: 404 };
    return;
  }
  users.splice(idx, 1);
  ctx.body = { message: `Пользователь с id=${id} удалён` };
});

// ===== Задание 3: защищённый и ошибочный маршруты =====
router.get('/protected', auth, (ctx) => {
  ctx.body = { message: 'Доступ разрешён', user: 'authenticated' };
});

router.get('/error', () => {
  throw new Error('Тестовая ошибка сервера');
});

// --- Подключаем роутер ---
app.use(router.routes()).use(router.allowedMethods());

// --- Запуск ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
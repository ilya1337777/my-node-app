const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 },
  { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866 },
  { id: 3, title: 'Анна Каренина', author: 'Толстой', year: 1877 }
];
let nextId = 4;

// search ДО /:id
router.get('/search', (req, res) => {
  const { author } = req.query;
  if (!author) {
    return res.status(400).json({ error: 'Параметр author обязателен', status: 400 });
  }
  const found = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  res.json(found);
});

router.get('/', (req, res) => {
  res.json(books);
});

router.get('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    const err = new Error('Книга не найдена');
    err.status = 404;
    return next(err);
  }
  res.json(book);
});

router.post('/', (req, res, next) => {
  const { title, author, year } = req.body || {};
  if (!title || !author || !year) {
    const err = new Error('Поля title, author, year обязательны');
    err.status = 400;
    return next(err);
  }
  if (typeof year !== 'number') {
    const err = new Error('Поле year должно быть числом');
    err.status = 400;
    return next(err);
  }
  const book = { id: nextId++, title, author, year };
  books.push(book);
  res.status(201).json(book);
});

router.put('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) {
    const err = new Error('Книга не найдена');
    err.status = 404;
    return next(err);
  }
  const { title, author, year } = req.body || {};
  if (year !== undefined && typeof year !== 'number') {
    const err = new Error('Поле year должно быть числом');
    err.status = 400;
    return next(err);
  }
  books[idx] = {
    ...books[idx],
    ...(title && { title }),
    ...(author && { author }),
    ...(year !== undefined && { year })
  };
  res.json(books[idx]);
});

router.delete('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) {
    const err = new Error('Книга не найдена');
    err.status = 404;
    return next(err);
  }
  books.splice(idx, 1);
  res.json({ message: `Книга с id=${id} удалена` });
});

module.exports = router;
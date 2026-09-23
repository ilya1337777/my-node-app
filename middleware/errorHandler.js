const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Внутренняя ошибка сервера',
    status
  });
};

module.exports = { asyncHandler, errorHandler };
module.exports = async (ctx, next) => {
  const auth = ctx.headers['authorization'];
  if (!auth) {
    ctx.status = 401;
    ctx.body = { error: 'Требуется заголовок Authorization', status: 401 };
    return;
  }
  await next();
};